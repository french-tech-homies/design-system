#!/usr/bin/env node
/* =============================================================================
   Releases, from pull-request labels read between release tags.

     node scripts/release.mjs labels               # the five labels exist (gh label create --force)
     node scripts/release.mjs label-check          # this pull request carries one of them
     node scripts/release.mjs pr                   # the release pull request, opened or brought up to date
     node scripts/release.mjs tag                  # tag the release just published, and make its GitHub release
     npm run registry:check-install                # the rules below, as tests (release.check.mjs)

   Every pull request carries one label of LABELS, which says what its merge
   does to the next version. `.github/workflows/release-label.yml` refuses a
   pull request without one, and sets it where the files touched decide.

   `.github/workflows/release-pr.yml`, on every push to `main` and after every
   run of Pages, reads the pull requests merged since the newest `v*` tag on
   `main`. When some are not `internal`, it rebuilds the branch `release` from
   `main`: the bump their labels ask, `npm version <bump>
   --no-git-tag-version`, `npm run registry:build`, and a numbered section of
   CHANGELOG.md made of their titles, grouped as `.github/release.yml` groups
   them, and of the notes for a project their bodies hold. The five places
   decide-publish.mjs reads move in that one commit. Then it opens the pull
   request "Release x.y.z", or edits the one open, with the section as its
   body. Its merge publishes (pages.yml), and pages.yml's `tag` job then
   tags the commit `vX.Y.Z` and makes the GitHub release with the section.

   The branch `release` is this script's own and is force-pushed. `main` is
   never pushed by it.

   The rules are pure functions, so release.check.mjs holds each one; the
   commands at the end are the only part that runs git, gh and npm.
   ========================================================================== */

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/* ---- the labels -------------------------------------------------------- */

/** The five release labels: one on every pull request. `bump` is what the
    label asks of the next version; `internal` asks for none. */
export const LABELS = [
  {
    name: "feature",
    bump: "minor",
    color: "1d76db",
    description: "Release: minor. Something a project can now do",
  },
  { name: "fix", bump: "patch", color: "0e8a16", description: "Release: patch. Something corrected" },
  { name: "docs", bump: "patch", color: "c5def5", description: "Release: patch. The documentation alone" },
  {
    name: "breaking",
    bump: "breaking",
    color: "b60205",
    description: "Release: minor while 0.x, major from 1.0. A project must act",
  },
  {
    name: "internal",
    bump: null,
    color: "ededed",
    description: "No release: CI, stories, screenshots, scripts only. Left out of the notes",
  },
];

const NAMES = LABELS.map((l) => l.name);

/** The groups of the notes, in their order, as `.github/release.yml` has
    them. `null`: a pull request merged with no release label, or two. */
export const GROUPS = [
  { title: "Breaking", label: "breaking" },
  { title: "Added", label: "feature" },
  { title: "Fixed", label: "fix" },
  { title: "Docs", label: "docs" },
  { title: "Not labelled", label: null },
];

/** Where a label is decided by the files a pull request touches alone. */
const DOCS = [/^README\.md$/, /^docs\//];
const INTERNAL = [/^\.github\//, /^stories\//, /^screenshots\//, /^scripts\//];
/** The kit as a project receives it: a change to one of these is released. */
const KIT = [
  /^components\//,
  /^primitives\//,
  /^adapters\//,
  /^tokens\//,
  /^skills\//,
  /^(icons\.tsx|utils\.ts|render-props\.ts|index\.ts|changed\.mjs|DESIGN\.md)$/,
];

const within = (patterns) => (file) => patterns.some((p) => p.test(file));

/** The label the files decide, or null when they do not decide one. */
export function labelFor(files) {
  if (!files.length) return null;
  if (files.every(within(DOCS))) return "docs";
  if (files.every(within(INTERNAL))) return "internal";
  return null;
}

/** The one release label among `labels`, or null when there is none, or two. */
export function releaseLabel(labels) {
  const found = labels.filter((l) => NAMES.includes(l));
  return found.length === 1 ? found[0] : null;
}

/**
 * @param {{ labels: string[], files: string[] }} pr
 * @returns {{ ok: boolean, add?: string, message: string }}
 */
export function judge({ labels, files }) {
  const found = labels.filter((l) => NAMES.includes(l));
  const list = LABELS.map((l) => `\`${l.name}\` (${l.bump ? l.bump.replace("breaking", "minor while 0.x, major from 1.0") : "no release"})`).join(", ");
  if (found.length > 1) {
    return {
      ok: false,
      message: `This pull request carries ${found.map((l) => `\`${l}\``).join(" and ")}: it takes one release label. Keep the one that says what its merge does: ${list}.`,
    };
  }
  if (found.length === 1) {
    const kit = files.filter(within(KIT));
    if (found[0] === "internal" && kit.length) {
      return {
        ok: false,
        message: `\`internal\` is for a change no project receives, and this one changes kit files (${kit.slice(0, 5).join(", ")}${kit.length > 5 ? ", …" : ""}): label it \`fix\`, \`feature\`, \`docs\` or \`breaking\`.`,
      };
    }
    return { ok: true, message: `Release label: \`${found[0]}\`.` };
  }
  const decided = labelFor(files);
  if (decided) {
    return {
      ok: true,
      add: decided,
      message: `No release label: the files touched decide it, \`${decided}\`, and it is set.`,
    };
  }
  return {
    ok: false,
    message: `No release label. Add one, which says what this pull request's merge does to the next version: ${list}.`,
  };
}

/* ---- the version ------------------------------------------------------- */

const parseVersion = (v) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(v ?? "");
  return m ? m.slice(1).map(Number) : null;
};
const compare = (a, b) => {
  const [x, y] = [parseVersion(a), parseVersion(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

/** What `npm version` is given: `major`, `minor`, `patch`, or null for no
    release. A pull request with no release label counts as a patch. */
export function bumpOf(labels, version) {
  const bumps = labels.map((l) => (l === null ? "patch" : LABELS.find((x) => x.name === l).bump));
  if (bumps.includes("breaking")) return parseVersion(version)[0] === 0 ? "minor" : "major";
  if (bumps.includes("minor")) return "minor";
  if (bumps.includes("patch")) return "patch";
  return null;
}

export function next(version, bump) {
  const [a, b, c] = parseVersion(version);
  if (bump === "major") return `${a + 1}.0.0`;
  if (bump === "minor") return `${a}.${b + 1}.0`;
  return `${a}.${b}.${c + 1}`;
}

/* ---- the note for a project -------------------------------------------- */

/** The heading of the pull request template's section for a project: what
    is under it is copied into the release notes. */
export const NOTE_HEADING = "## For a project that installs the kit";

/** The note a pull request's body holds for a project, or "" when it holds
    none: the template's comments alone, or nothing, are no note. */
export function noteOf(body) {
  const text = (body ?? "").replace(/\r\n/g, "\n");
  const start = text.indexOf(`${NOTE_HEADING}\n`);
  if (start < 0) return "";
  const rest = text.slice(start + NOTE_HEADING.length + 1);
  const end = rest.search(/^## /m);
  return (end < 0 ? rest : rest.slice(0, end))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---- the section ------------------------------------------------------- */

const link = (pr) => `[#${pr.number}](${pr.url})`;

/**
 * The numbered section of CHANGELOG.md for a release, and the body of its
 * pull request and of its GitHub release.
 *
 * @param {object} release
 * @param {string} release.version
 * @param {string} release.date      YYYY-MM-DD
 * @param {{ number: number, title: string, url: string, label: string | null, body?: string }[]} release.prs
 *   the pull requests merged since the last release, `internal` ones among them
 * @param {string} [release.carried] what was under `[Unreleased]`, as written
 */
export function section({ version, date, prs, carried = "" }) {
  const shown = prs.filter((pr) => pr.label !== "internal").sort((a, b) => a.number - b.number);
  const out = [`## [${version}] — ${date}`, ""];
  const notes = shown.map((pr) => [pr, noteOf(pr.body)]).filter(([, note]) => note);
  if (notes.length) {
    out.push("### Action needed", "");
    for (const [pr, note] of notes) out.push(`#### ${pr.title} (${link(pr)})`, "", note, "");
  }
  for (const group of GROUPS) {
    const these = shown.filter((pr) => pr.label === group.label);
    if (!these.length) continue;
    out.push(`### ${group.title}`, "");
    for (const pr of these) out.push(`- ${pr.title} (${link(pr)})`);
    out.push("");
  }
  if (carried.trim()) {
    out.push(
      "### Written under `[Unreleased]` before releases were generated",
      "",
      carried.trim(),
      "",
    );
  }
  return `${out.join("\n").trimEnd()}\n`;
}

const UNRELEASED = /^## \[Unreleased\][^\n]*\n/m;
const NUMBERED = /^## \[\d/m;

/** What is under `## [Unreleased]`, as written: "" when there is no such
    heading or nothing under it. */
export function unreleasedOf(changelog) {
  const at = changelog.search(UNRELEASED);
  if (at < 0) return "";
  const body = changelog.slice(at).replace(UNRELEASED, "");
  const end = body.search(NUMBERED);
  return (end < 0 ? body : body.slice(0, end)).trim();
}

/** CHANGELOG.md with `section` in place of `[Unreleased]`, or above the
    newest numbered section when there is none. The past sections are kept
    byte for byte. */
export function insertSection(changelog, sectionText) {
  const at = changelog.search(UNRELEASED);
  if (at >= 0) {
    const below = at + UNRELEASED.exec(changelog.slice(at))[0].length;
    const end = changelog.slice(below).search(NUMBERED);
    const after = end < 0 ? "" : changelog.slice(below + end);
    return `${changelog.slice(0, at)}${sectionText}${after ? `\n${after}` : ""}`;
  }
  const newest = changelog.search(NUMBERED);
  if (newest < 0) return `${changelog.trimEnd()}\n\n${sectionText}`;
  return `${changelog.slice(0, newest)}${sectionText}\n${changelog.slice(newest)}`;
}

/** The text of one numbered section, its heading left out: the GitHub
    release's notes. null when CHANGELOG.md has no section for `version`. */
export function sectionOf(changelog, version) {
  const heading = new RegExp(`^## \\[${version.replace(/\./g, "\\.")}\\][^\\n]*\\n`, "m");
  const at = changelog.search(heading);
  if (at < 0) return null;
  const body = changelog.slice(at).replace(heading, "");
  const end = body.search(/^## /m);
  return (end < 0 ? body : body.slice(0, end)).replace(/\n---\s*$/, "").trim();
}

/* ---- the plan ---------------------------------------------------------- */

/** The workflow that keeps the release pull request: named in its body. */
export const WORKFLOW = ".github/workflows/release-pr.yml";
export const BRANCH = "release";
export const BASE = "main";
export const titleOf = (version) => `Release ${version}`;

/**
 * What the release workflow does on this push. Pure: what it reads of git and
 * GitHub is handed in.
 *
 * @param {object} state
 * @param {string} state.version  package.json's on `main`
 * @param {string[]} state.tags   the `v*` tags `main` holds, as versions
 * @param {{ number: number, label: string | null }[]} state.prs  merged since the newest of them
 * @param {number | null} state.open  the open release pull request's number
 * @param {string | null} [state.published]  the commit of `main` whose push
 *   published `version`, when no tag is there yet
 * @returns {{ action: "none" | "open" | "update", message: string, bump?: string, version?: string }}
 */
export function plan({ version, tags, prs, open, published = null }) {
  const none = (message) => ({ action: "none", message });
  const known = tags.filter(parseVersion).sort(compare);
  const last = known.at(-1);
  if (!last) {
    return none(
      `No release tag yet, so no release pull request: the pull requests of a release are read since the last one's tag. Tag release ${version} first, on the commit of \`main\` whose push published it, and push the tag: git tag v${version} ${published ?? "<sha>"} && git push origin v${version}`,
    );
  }
  if (compare(version, last) > 0) {
    return none(
      `Release ${version} is merged and not tagged yet (the newest tag is v${last}): pages.yml's \`tag\` job tags it once its run publishes, and this workflow runs again after it. If that run is red, re-run it (CONTRIBUTING.md, "Publishing this repository"); a release left unpublished is tagged by hand on its commit: git tag v${version} ${published ?? "<sha>"} && git push origin v${version}`,
    );
  }
  if (compare(version, last) < 0) {
    return none(
      `\`main\` says ${version} and its newest tag is v${last}: a tag is ahead of the version. Nothing is released until they agree.`,
    );
  }
  const releasable = prs.filter((pr) => pr.label !== "internal");
  if (!releasable.length) {
    const said = prs.length
      ? `the ${prs.length} pull request${prs.length > 1 ? "s" : ""} merged since v${last} ${prs.length > 1 ? "are" : "is"} all \`internal\``
      : `no pull request merged since v${last}`;
    return none(
      `Nothing to release: ${said}.${open ? ` The open release pull request #${open} is left as it is.` : ""}`,
    );
  }
  const bump = bumpOf(releasable.map((pr) => pr.label), version);
  const to = next(version, bump);
  return open
    ? {
        action: "update",
        bump,
        version: to,
        message: `Release ${to} (${bump}): ${releasable.length} pull request${releasable.length > 1 ? "s" : ""} since v${last}; release pull request #${open} brought up to date.`,
      }
    : {
        action: "open",
        bump,
        version: to,
        message: `Release ${to} (${bump}): ${releasable.length} pull request${releasable.length > 1 ? "s" : ""} since v${last}; the release pull request is opened.`,
      };
}

/** The release pull request's body: what its merge does, then the section. */
export function prBody({ version, sectionText, unlabelled }) {
  return [
    `Merging this releases **${version}**: the five places a release writes the version move in its one commit, so the push publishes the catalog and the registry (\`.github/workflows/pages.yml\`), and the commit is then tagged \`v${version}\` with its GitHub release.`,
    "",
    `Not ready? Leave it open: \`${WORKFLOW}\` rebuilds the branch \`release\` from \`main\` on every push, and its checks run there (the commit status **Release checks**). Edits to this branch or to this description are overwritten.`,
    ...(unlabelled.length
      ? [
          "",
          `> **Not labelled**: ${unlabelled.map((n) => `#${n}`).join(", ")} carr${unlabelled.length > 1 ? "y" : "ies"} no release label, or two, and count${unlabelled.length > 1 ? "" : "s"} as a patch. Label ${unlabelled.length > 1 ? "each" : "it"}; this pull request follows on the next push to \`main\`.`,
        ]
      : []),
    "",
    "---",
    "",
    sectionText.trim(),
    "",
  ].join("\n");
}

/* ---- the commands ------------------------------------------------------ */

const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
const git = (...args) => run("git", args);
const gh = (...args) => run("gh", args);
const json = (text) => JSON.parse(text);

const say = (line) => {
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
};
const output = (name, value) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
};
const tempFile = (name, text) => {
  const file = join(mkdtempSync(join(tmpdir(), "release-")), name);
  writeFileSync(file, text);
  return file;
};

function labels() {
  for (const label of LABELS) {
    gh("label", "create", label.name, "--color", label.color, "--description", label.description, "--force");
  }
  say(`The release labels exist: ${NAMES.join(", ")}.`);
  return 0;
}

function labelCheck() {
  const event = json(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const pr = event.pull_request;
  const files = gh(
    "api",
    "--paginate",
    `repos/${process.env.GITHUB_REPOSITORY}/pulls/${pr.number}/files`,
    "--jq",
    ".[] | .filename, (.previous_filename // empty)",
  )
    .split("\n")
    .filter(Boolean);
  const said = judge({ labels: pr.labels.map((l) => l.name), files });
  if (said.add) {
    try {
      gh("pr", "edit", String(pr.number), "--add-label", said.add);
    } catch {
      console.log(`::error::No release label, and \`${said.add}\` could not be set (a fork's token cannot): add it.`);
      return 1;
    }
  }
  if (!said.ok) console.log(`::error::${said.message}`);
  say(said.message);
  return said.ok ? 0 : 1;
}

/** The oldest commit on `main`'s first-parent line that says `version` in
    all five places, read back from the tip while a commit still says it in
    one: the commit whose push published it. */
async function publishedCommit(version) {
  const { versions, whole } = await import("./decide-publish.mjs");
  const at = (commit) => (path) => {
    try {
      return run("git", ["show", `${commit}:${path}`], { stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      return null;
    }
  };
  let found = null;
  for (const commit of git("rev-list", "--first-parent", `origin/${BASE}`).split("\n").filter(Boolean)) {
    const said = versions(at(commit));
    if (!Object.values(said).some((v) => v.includes(version))) break;
    if (whole(said).version === version) found = commit;
  }
  return found;
}

/** The commit status the release workflow writes on the release commit. */
export const STATUS = "Release checks";

/** The state of the newest "Release checks" status on `sha`, or "" when it
    has none, or it cannot be read (which asks for the checks again). */
function releaseChecks(repo, sha) {
  try {
    return gh(
      "api", `repos/${repo}/commits/${sha}/status`,
      "--jq", `[.statuses[] | select(.context == "${STATUS}")][0].state // ""`,
    ).trim();
  } catch {
    return "";
  }
}

async function releasePr() {
  const repo = process.env.GITHUB_REPOSITORY;
  git("fetch", "--force", "--tags", "origin", `+refs/heads/*:refs/remotes/origin/*`);
  const main = git("rev-parse", `origin/${BASE}`).trim();
  const version = json(git("show", `${main}:package.json`)).version;
  const tags = git("tag", "--merged", main, "--list", "v*")
    .split("\n")
    .filter(Boolean)
    .map((t) => t.slice(1));
  const last = tags.filter(parseVersion).sort(compare).at(-1);
  let prs = [];
  if (last) {
    const since = new Set(git("rev-list", `v${last}..${main}`).split("\n").filter(Boolean));
    prs = json(
      gh(
        "pr", "list", "--repo", repo, "--base", BASE, "--state", "merged", "--limit", "1000",
        "--json", "number,title,url,labels,body,headRefName,mergeCommit",
      ),
    )
      .filter((pr) => pr.headRefName !== BRANCH && since.has(pr.mergeCommit?.oid))
      .map((pr) => ({ ...pr, label: releaseLabel(pr.labels.map((l) => l.name)) }));
  }
  const open =
    json(gh("pr", "list", "--repo", repo, "--base", BASE, "--head", BRANCH, "--state", "open", "--json", "number"))[0]
      ?.number ?? null;
  const published = !last || compare(version, last) > 0 ? await publishedCommit(version) : null;

  const decided = plan({ version, tags, prs, open, published });
  say(decided.message);
  output("action", decided.action);
  if (decided.action === "none") return 0;

  // The branch `release`: `main`, and the release's one commit on it.
  git("checkout", "-B", BRANCH, main);
  run("npm", ["version", decided.bump, "--no-git-tag-version"], { stdio: "inherit" });
  run("npm", ["run", "registry:build"], { stdio: "inherit" });
  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const sectionText = section({
    version: decided.version,
    date: new Date().toISOString().slice(0, 10),
    prs,
    carried: unreleasedOf(changelog),
  });
  writeFileSync("CHANGELOG.md", insertSection(changelog, sectionText));
  git("add", "--", "package.json", "package-lock.json", "registry.json", "RELEASE.json", "releases", "CHANGELOG.md");
  git(
    "-c", "user.name=github-actions[bot]",
    "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
    "commit", "--quiet", "-m", `Release ${decided.version}`,
    "-m", `The bump (${decided.bump}) and the CHANGELOG's section, from the labels of the pull requests merged since v${last}.`,
  );
  const head = git("rev-parse", "HEAD").trim();

  // Pushed only when it is not what the branch holds already: the same
  // tree on the same `main` is the same release commit.
  const held = (ref) => {
    try {
      return git("rev-parse", "--verify", "--quiet", ref).trim();
    } catch {
      return "";
    }
  };
  const same =
    held(`origin/${BRANCH}^`) === main && held(`origin/${BRANCH}^{tree}`) === held("HEAD^{tree}");
  let sha = head;
  if (same) {
    sha = held(`origin/${BRANCH}`);
    say(`The branch \`${BRANCH}\` already holds release ${decided.version} on this \`main\`: not pushed.`);
  } else {
    git("push", "--force", "origin", `HEAD:refs/heads/${BRANCH}`);
  }
  // Whether to check is the commit's own status, not whether this run
  // pushed: a run that pushed and then failed, or was cancelled during its
  // checks, leaves the commit red, pending or unchecked, and the next run
  // on the same `main` checks it again. Runs are one at a time, so a
  // pending status here is one whose run is gone.
  const checked = same ? releaseChecks(repo, sha) : "";
  const check = checked !== "success";
  if (same) {
    say(
      check
        ? `Its ${STATUS} ${checked ? `are ${checked}` : "were never written"}: checked again.`
        : `Its ${STATUS} are green: not checked again.`,
    );
  }
  output("sha", sha);
  output("pushed", String(!same));
  output("check", String(check));
  output("base", main);

  const unlabelled = prs.filter((pr) => pr.label === null).map((pr) => pr.number);
  const body = tempFile("body.md", prBody({ version: decided.version, sectionText, unlabelled }));
  const title = titleOf(decided.version);
  try {
    if (decided.action === "update") {
      gh("pr", "edit", String(open), "--repo", repo, "--title", title, "--body-file", body);
      say(`Updated release pull request #${open}.`);
    } else {
      const url = gh("pr", "create", "--repo", repo, "--base", BASE, "--head", BRANCH, "--title", title, "--body-file", body).trim();
      say(`Opened release pull request: ${url}`);
    }
  } catch (error) {
    console.log(
      "::error::The release pull request could not be opened or edited. Is \"Allow GitHub Actions to create and approve pull requests\" set (Settings → Actions → General)? That setting is the owner's.",
    );
    throw error;
  }
  return 0;
}

function tag() {
  const version = json(readFileSync("package.json", "utf8")).version;
  const name = `v${version}`;
  const sha = process.env.GITHUB_SHA;
  try {
    gh("release", "view", name, "--json", "tagName");
    say(`${name} is released already: nothing to tag.`);
    return 0;
  } catch {
    // Not there: made below.
  }
  const notes = sectionOf(readFileSync("CHANGELOG.md", "utf8"), version);
  if (notes === null) {
    console.log(`::error::CHANGELOG.md has no section for ${version}: no release notes to give ${name}.`);
    return 1;
  }
  gh("release", "create", name, "--target", sha, "--title", name, "--notes-file", tempFile("notes.md", `${notes}\n`));
  say(`Tagged ${sha.slice(0, 7)} ${name}, and made its GitHub release.`);
  return 0;
}

const COMMANDS = { labels, "label-check": labelCheck, pr: releasePr, tag };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = COMMANDS[process.argv[2]];
  if (!command) {
    console.error(`usage: node scripts/release.mjs <${Object.keys(COMMANDS).join("|")}>`);
    process.exitCode = 2;
  } else {
    process.exitCode = await command();
  }
}
