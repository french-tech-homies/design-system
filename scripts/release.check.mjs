/* =============================================================================
   Rule checks for releases from labels (scripts/release.mjs).

     npm run registry:check-install     # node's test runner

   The rules are held on fixtures: the label a pull request needs, the bump
   its labels ask, the note its body holds, the section of CHANGELOG.md, and
   what the release workflow does on a push. Then `release.mjs pr` is run as
   the workflow runs it, in a temporary git repository with a stand-in `gh`
   and `npm` on the PATH, which record what they are asked: a release of
   `internal` pull requests alone opens nothing, a first opens the release
   pull request and a second updates it. The workflows themselves cannot run
   here, so their shape is what is held. Nothing here reaches GitHub.
   ========================================================================== */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

import { versions } from "./decide-publish.mjs";
import {
  BRANCH,
  GROUPS,
  WORKFLOW,
  LABELS,
  NOTE_HEADING,
  bumpOf,
  insertSection,
  judge,
  labelFor,
  next,
  noteOf,
  plan,
  prBody,
  section,
  sectionOf,
  unreleasedOf,
} from "./release.mjs";

const kit = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(kit, path), "utf8");

/* ---- the labels -------------------------------------------------------- */

test("the five labels, and what each asks of the version", () => {
  assert.deepEqual(
    LABELS.map((l) => [l.name, l.bump]),
    [
      ["feature", "minor"],
      ["fix", "patch"],
      ["docs", "patch"],
      ["breaking", "breaking"],
      ["internal", null],
    ],
  );
});

test("the files decide `docs` or `internal` only when every one is of that kind", () => {
  assert.equal(labelFor(["README.md"]), "docs");
  assert.equal(labelFor(["README.md", "docs/theming.md"]), "docs");
  assert.equal(labelFor([".github/workflows/checks.yml", "stories/Button.stories.tsx", "screenshots/m/x.png", "scripts/a.mjs"]), "internal");
  assert.equal(labelFor(["README.md", "scripts/a.mjs"]), null, "docs and internal together");
  assert.equal(labelFor(["docs/theming.md", "components/button.tsx"]), null);
  assert.equal(labelFor(["CHANGELOG.md"]), null);
  assert.equal(labelFor(["docs.md"]), null, "docs/ is a folder");
  assert.equal(labelFor([]), null);
});

test("a pull request with no release label is refused, told the five, unless its files decide one", () => {
  const none = judge({ labels: ["enhancement"], files: ["components/button.tsx"] });
  assert.equal(none.ok, false);
  for (const label of LABELS) assert.match(none.message, new RegExp(`\`${label.name}\``));
  assert.deepEqual(judge({ labels: [], files: ["docs/updating.md"] }), {
    ok: true,
    add: "docs",
    message: "No release label: the files touched decide it, `docs`, and it is set.",
  });
  assert.equal(judge({ labels: [], files: ["stories/Button.stories.tsx"] }).add, "internal");
});

test("one release label passes; two are refused; `internal` on a kit file is refused", () => {
  assert.equal(judge({ labels: ["fix", "bug"], files: ["components/button.tsx"] }).ok, true);
  assert.equal(judge({ labels: ["fix"], files: ["components/button.tsx"] }).add, undefined, "a label set by hand is kept");
  const two = judge({ labels: ["fix", "feature"], files: ["components/button.tsx"] });
  assert.equal(two.ok, false);
  assert.match(two.message, /`fix` and `feature`/);
  const internal = judge({ labels: ["internal"], files: ["stories/a.tsx", "tokens/theme.css"] });
  assert.equal(internal.ok, false);
  assert.match(internal.message, /tokens\/theme\.css/);
  assert.equal(judge({ labels: ["internal"], files: ["CLAUDE.md", "scripts/a.mjs"] }).ok, true);
});

/* ---- the version ------------------------------------------------------- */

test("the bump is the largest a label asks; `breaking` is minor while 0.x, major from 1.0", () => {
  assert.equal(bumpOf(["fix", "docs"], "0.5.1"), "patch");
  assert.equal(bumpOf(["fix", "feature"], "0.5.1"), "minor");
  assert.equal(bumpOf(["fix", "breaking"], "0.5.1"), "minor");
  assert.equal(bumpOf(["breaking"], "1.2.3"), "major");
  assert.equal(bumpOf(["internal"], "0.5.1"), null);
  assert.equal(bumpOf([], "0.5.1"), null);
  assert.equal(bumpOf([null], "0.5.1"), "patch", "no release label counts as a patch");
  assert.equal(next("0.5.1", "patch"), "0.5.2");
  assert.equal(next("0.5.1", "minor"), "0.6.0");
  assert.equal(next("1.2.3", "major"), "2.0.0");
});

/* ---- the note ---------------------------------------------------------- */

test("the template's section for a project, left as it is, is no note", () => {
  const template = read(".github/pull_request_template.md");
  assert.ok(template.includes(`\n${NOTE_HEADING}\n`), "the template has the section the note is read from");
  assert.equal(noteOf(template), "");
  assert.equal(noteOf(""), "");
  assert.equal(noteOf(null), "");
  assert.equal(noteOf("## What and why\n\nA fix."), "");
});

test("a filled note is read as written, up to the next section", () => {
  const body = [
    "## What and why",
    "",
    "Because.",
    "",
    NOTE_HEADING,
    "",
    "<!-- the template's comment -->",
    "**Action needed**: remove `@source not \"<kit>/utils.ts\"`.",
    "",
    "```bash",
    "rg -n 'x' src",
    "```",
    "",
    "## Screenshots",
    "",
    "none",
  ].join("\r\n");
  assert.equal(
    noteOf(body),
    '**Action needed**: remove `@source not "<kit>/utils.ts"`.\n\n```bash\nrg -n \'x\' src\n```',
  );
});

/* ---- the section ------------------------------------------------------- */

const pr = (number, label, title = `Change ${number}`, body = "") => ({
  number,
  label,
  title,
  body,
  url: `https://github.com/o/r/pull/${number}`,
});

test("the section: the notes first, then the titles grouped as release.yml groups them, `internal` left out", () => {
  const text = section({
    version: "0.6.0",
    date: "2026-11-04",
    prs: [
      pr(5, "internal", "CI"),
      pr(4, "docs", "A page"),
      pr(3, "fix", "A fix"),
      pr(2, "feature", "A thing", `${NOTE_HEADING}\n\nRun this.\n`),
      pr(1, "breaking", "A break"),
      pr(6, null, "Old"),
    ],
  });
  assert.equal(
    text,
    [
      "## [0.6.0] — 2026-11-04",
      "",
      "### Action needed",
      "",
      "#### A thing ([#2](https://github.com/o/r/pull/2))",
      "",
      "Run this.",
      "",
      "### Breaking",
      "",
      "- A break ([#1](https://github.com/o/r/pull/1))",
      "",
      "### Added",
      "",
      "- A thing ([#2](https://github.com/o/r/pull/2))",
      "",
      "### Fixed",
      "",
      "- A fix ([#3](https://github.com/o/r/pull/3))",
      "",
      "### Docs",
      "",
      "- A page ([#4](https://github.com/o/r/pull/4))",
      "",
      "### Not labelled",
      "",
      "- Old ([#6](https://github.com/o/r/pull/6))",
      "",
    ].join("\n"),
  );
});

test("release.yml groups as the section does, and leaves `internal` out", () => {
  const config = parse(read(".github/release.yml")).changelog;
  assert.deepEqual(config.exclude.labels, ["internal"]);
  assert.deepEqual(
    config.categories.map((c) => [c.title, c.labels]),
    GROUPS.map((g) => [g.title, [g.label ?? "*"]]),
  );
});

const CHANGELOG = [
  "# Changelog",
  "",
  "---",
  "",
  "## [Unreleased]",
  "",
  "### Added",
  "",
  "- **Written by hand.**",
  "",
  "## [0.5.1] — 2026-10-14",
  "",
  "A patch.",
  "",
  "## [0.5.0] — 2026-10-14",
  "",
  "A minor.",
  "",
].join("\n");

test("the switch: `[Unreleased]` goes, as written, into the first generated section; the past stay as they are", () => {
  const carried = unreleasedOf(CHANGELOG);
  assert.equal(carried, "### Added\n\n- **Written by hand.**");
  const text = section({ version: "0.6.0", date: "2026-11-04", prs: [pr(7, "fix")], carried });
  const out = insertSection(CHANGELOG, text);
  assert.ok(!out.includes("## [Unreleased]"));
  assert.ok(out.startsWith("# Changelog\n\n---\n\n## [0.6.0] — 2026-11-04\n"));
  assert.ok(out.includes("- **Written by hand.**\n\n## [0.5.1] — 2026-10-14\n"));
  assert.ok(out.endsWith(CHANGELOG.slice(CHANGELOG.indexOf("## [0.5.1]"))), "the past sections, byte for byte");
  // The decision reads the generated heading as the version.
  assert.deepEqual(versions((p) => (p === "CHANGELOG.md" ? out : null))["CHANGELOG.md"], ["0.6.0"]);
  // A later release, with no `[Unreleased]`, goes above the newest.
  assert.equal(unreleasedOf(out), "");
  const later = insertSection(out, section({ version: "0.6.1", date: "2026-11-05", prs: [pr(8, "fix")] }));
  assert.ok(later.includes("---\n\n## [0.6.1] — 2026-11-05\n\n### Fixed\n\n- Change 8 ([#8](https://github.com/o/r/pull/8))\n\n## [0.6.0]"));
});

test("the GitHub release's notes are its section, the heading left out", () => {
  const out = insertSection(CHANGELOG, section({ version: "0.6.0", date: "2026-11-04", prs: [pr(7, "fix")], carried: unreleasedOf(CHANGELOG) }));
  assert.equal(
    sectionOf(out, "0.6.0"),
    "### Fixed\n\n- Change 7 ([#7](https://github.com/o/r/pull/7))\n\n### Written under `[Unreleased]` before releases were generated\n\n### Added\n\n- **Written by hand.**",
  );
  assert.equal(sectionOf(out, "0.5.1"), "A patch.");
  assert.equal(sectionOf(out, "0.4.0"), null);
});

test("the kit's own CHANGELOG reads as the switch expects", () => {
  const changelog = read("CHANGELOG.md");
  assert.match(unreleasedOf(changelog), /^### Added\n/);
  const out = insertSection(changelog, section({ version: "9.9.9", date: "2026-11-04", prs: [], carried: unreleasedOf(changelog) }));
  const past = changelog.slice(changelog.search(/^## \[\d/m));
  assert.ok(out.endsWith(past), "every past section kept");
});

/* ---- the plan ---------------------------------------------------------- */

test("no tag yet: no release pull request, and it says which tag to make", () => {
  const said = plan({ version: "0.5.1", tags: [], prs: [], open: null, published: "09bb8ef" });
  assert.equal(said.action, "none");
  assert.match(said.message, /git tag v0\.5\.1 09bb8ef && git push origin v0\.5\.1/);
});

test("pull requests all `internal` since the tag: none is opened", () => {
  const said = plan({ version: "0.5.1", tags: ["0.5.0", "0.5.1"], prs: [pr(1, "internal"), pr(2, "internal")], open: null });
  assert.equal(said.action, "none");
  assert.match(said.message, /all `internal`/);
  assert.equal(plan({ version: "0.5.1", tags: ["0.5.1"], prs: [], open: null }).action, "none");
});

test("one released pull request opens it; with one open, it is updated, not doubled", () => {
  assert.deepEqual(
    plan({ version: "0.5.1", tags: ["0.4.0", "0.5.1", "0.3.0"], prs: [pr(1, "internal"), pr(2, "fix")], open: null }),
    {
      action: "open",
      bump: "patch",
      version: "0.5.2",
      message: "Release 0.5.2 (patch): 1 pull request since v0.5.1; the release pull request is opened.",
    },
  );
  const two = plan({ version: "0.5.1", tags: ["0.5.1"], prs: [pr(2, "fix"), pr(3, "feature")], open: 40 });
  assert.equal(two.action, "update");
  assert.equal(two.version, "0.6.0");
});

test("a release merged and not yet tagged waits for its tag", () => {
  const said = plan({ version: "0.6.0", tags: ["0.5.1"], prs: [pr(2, "fix")], open: null, published: "abc1234" });
  assert.equal(said.action, "none");
  assert.match(said.message, /not tagged yet/);
});

/* ---- the command, run ---------------------------------------------------- */

/** A temporary clone of a bare origin, on `main` at 0.5.1 tagged v0.5.1,
    then a merge commit; a stand-in `gh` that answers from a state file and
    records each call, and a stand-in `npm` that writes the version. */
function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "ds-release-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const sh = (cwd, ...args) => {
    const r = spawnSync("git", args, { cwd, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  const origin = join(root, "origin.git");
  const work = join(root, "work");
  sh(root, "init", "--quiet", "--bare", "-b", "main", origin);
  sh(root, "clone", "--quiet", origin, work);
  for (const [k, v] of [["user.name", "t"], ["user.email", "t@example.com"], ["commit.gpgsign", "false"], ["tag.gpgsign", "false"]]) {
    sh(work, "config", k, v);
  }
  const v = "0.5.1";
  writeFileSync(join(work, "package.json"), `${JSON.stringify({ name: "k", version: v }, null, 2)}\n`);
  writeFileSync(join(work, "package-lock.json"), `${JSON.stringify({ name: "k", version: v, packages: { "": { version: v } } }, null, 2)}\n`);
  writeFileSync(join(work, "registry.json"), `${JSON.stringify({ items: [{ meta: { version: v } }] })}\n`);
  writeFileSync(join(work, "RELEASE.json"), `${JSON.stringify({ version: v })}\n`);
  mkdirSync(join(work, "releases"));
  writeFileSync(join(work, "releases", "a.json"), "{}\n");
  writeFileSync(join(work, "CHANGELOG.md"), CHANGELOG);
  sh(work, "add", "-A");
  sh(work, "commit", "--quiet", "-m", "release 0.5.1");
  sh(work, "tag", "v0.5.1");
  sh(work, "checkout", "--quiet", "-b", "change");
  writeFileSync(join(work, "a.txt"), "a\n");
  sh(work, "add", "-A");
  sh(work, "commit", "--quiet", "-m", "a change");
  sh(work, "checkout", "--quiet", "main");
  sh(work, "merge", "--quiet", "--no-ff", "-m", "Merge pull request #2", "change");
  const merge = sh(work, "rev-parse", "HEAD");
  sh(work, "push", "--quiet", "origin", "main", "--tags");

  const bin = join(root, "bin");
  mkdirSync(bin);
  const state = join(root, "gh-state.json");
  const log = join(root, "gh-log.jsonl");
  writeFileSync(
    join(bin, "gh"),
    `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify(args) + "\\n");
const state = JSON.parse(fs.readFileSync(${JSON.stringify(state)}, "utf8"));
const has = (a) => args.includes(a);
if (args[0] === "pr" && args[1] === "list" && has("merged")) console.log(JSON.stringify(state.merged));
else if (args[0] === "pr" && args[1] === "list") console.log(JSON.stringify(state.open ? [{ number: state.open }] : []));
else if (args[0] === "pr" && args[1] === "create") { state.open = 40; fs.writeFileSync(${JSON.stringify(state)}, JSON.stringify(state)); console.log("https://github.com/o/r/pull/40"); }
else if (args[0] === "pr" && args[1] === "edit") {}
else { console.error("gh: not stood in for: " + args.join(" ")); process.exit(1); }
`,
  );
  writeFileSync(
    join(bin, "npm"),
    `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
if (args[0] === "version") {
  const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const [a, b, c] = p.version.split(".").map(Number);
  p.version = { major: [a + 1, 0, 0], minor: [a, b + 1, 0], patch: [a, b, c + 1] }[args[1]].join(".");
  fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\\n");
}
`,
  );
  chmodSync(join(bin, "gh"), 0o755);
  chmodSync(join(bin, "npm"), 0o755);

  const merged = (label) => [
    { number: 2, title: "A change", url: "https://github.com/o/r/pull/2", body: "", headRefName: "change", labels: [{ name: label }], mergeCommit: { oid: merge } },
    { number: 1, title: "Before the tag", url: "https://github.com/o/r/pull/1", body: "", headRefName: "old", labels: [{ name: "feature" }], mergeCommit: { oid: "0".repeat(40) } },
  ];
  return {
    setState: (s) => writeFileSync(state, JSON.stringify(s)),
    merged,
    calls: () =>
      readFileSync(log, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .filter((a) => a[0] === "pr" && (a[1] === "create" || a[1] === "edit"))
        .map((a) => a.slice(0, 3).join(" ").replace(/ --repo$/, "")),
    run: () => {
      const outputs = join(root, `out-${Math.random().toString(36).slice(2)}`);
      writeFileSync(outputs, "");
      const r = spawnSync(process.execPath, [join(kit, "scripts/release.mjs"), "pr"], {
        cwd: work,
        encoding: "utf8",
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, GITHUB_REPOSITORY: "o/r", GITHUB_OUTPUT: outputs, GITHUB_STEP_SUMMARY: "" },
      });
      assert.equal(r.status, 0, `release.mjs pr: ${r.stdout}\n${r.stderr}`);
      return { stdout: r.stdout, outputs: readFileSync(outputs, "utf8") };
    },
    release: () => {
      const r = spawnSync("git", ["--git-dir", origin, "log", "-1", "--format=%s", "refs/heads/release"], { encoding: "utf8" });
      return r.status === 0 ? r.stdout.trim() : null;
    },
    changelogOnRelease: () => sh(root, "--git-dir", origin, "show", `refs/heads/release:CHANGELOG.md`),
  };
}

test("run: since the tag only `internal` merged, no release pull request and no branch", (t) => {
  const repo = repository(t);
  repo.setState({ merged: repo.merged("internal"), open: null });
  const { stdout, outputs } = repo.run();
  assert.match(stdout, /Nothing to release: the 1 pull request merged since v0\.5\.1 is all `internal`/);
  assert.match(outputs, /^action=none$/m);
  assert.deepEqual(repo.calls(), []);
  assert.equal(repo.release(), null);
});

test("run: a fix opens the release pull request; a second run updates it, not a second", (t) => {
  const repo = repository(t);
  repo.setState({ merged: repo.merged("fix"), open: null });
  const first = repo.run();
  assert.match(first.outputs, /^pushed=true$/m);
  assert.equal(repo.release(), "Release 0.5.2");
  const changelog = repo.changelogOnRelease();
  assert.match(changelog, /^## \[0\.5\.2\] — \d{4}-\d\d-\d\d\n\n### Fixed\n\n- A change \(\[#2\]/m);
  assert.ok(!changelog.includes("Before the tag"), "a pull request merged before the tag is not read");
  assert.ok(changelog.includes("- **Written by hand.**\n\n## [0.5.1]"), "`[Unreleased]` carried");
  assert.deepEqual(repo.calls(), ["pr create"]);

  const second = repo.run();
  assert.match(second.outputs, /^pushed=false$/m, "the same release on the same main is not pushed again");
  assert.deepEqual(repo.calls(), ["pr create", "pr edit 40"]);
});

/* ---- the workflows ----------------------------------------------------- */

const workflow = (name) => parse(read(`.github/workflows/${name}`));

test("release-pr.yml: on every push to main and after Pages, one at a time, never cancelled", () => {
  const w = workflow("release-pr.yml");
  assert.deepEqual(w.on.push, { branches: ["main"] });
  assert.deepEqual(w.on.workflow_run.workflows, ["Pages"]);
  assert.deepEqual(w.concurrency, { group: "release-pr", "cancel-in-progress": false });
  assert.equal(w.jobs["release-pr"].steps.find((s) => s.id === "pr").run, "node scripts/release.mjs pr");
  assert.notEqual(BRANCH, "main");
  // The release commit is checked: checks.yml whole, on it, its result its status.
  assert.equal(w.jobs.checks.uses, "./.github/workflows/checks.yml");
  assert.equal(w.jobs.checks.with.ref, "${{ needs.release-pr.outputs.sha }}");
  assert.deepEqual(w.jobs.status.needs, ["release-pr", "checks"]);
  const checks = workflow("checks.yml");
  assert.ok(checks.on.workflow_call.inputs.ref && checks.on.workflow_call.inputs.base);
  const checkout = checks.jobs.checks.steps.find((s) => s.uses?.startsWith("actions/checkout"));
  assert.equal(checkout.with.ref, "${{ inputs.ref }}");
});

test("the script pushes the branch `release` alone, and forced only there", () => {
  const source = read("scripts/release.mjs");
  const pushes = [...source.matchAll(/git\("push"[^)]*\)/g)].map(([call]) => call);
  assert.deepEqual(pushes, ['git("push", "--force", "origin", `HEAD:refs/heads/${BRANCH}`)']);
});

test("pages.yml tags only after `publish`, on the release's own push", () => {
  const tag = workflow("pages.yml").jobs.tag;
  assert.equal(tag.needs, "publish");
  assert.equal(tag.if, "github.event_name == 'push'");
  assert.equal(tag.steps.at(-1).run, "node scripts/release.mjs tag");
});

test("release-label.yml: every pull request, its labels and its pushes", () => {
  const w = workflow("release-label.yml");
  for (const type of ["opened", "reopened", "synchronize", "labeled", "unlabeled"]) {
    assert.ok(w.on.pull_request.types.includes(type), type);
  }
  const runs = w.jobs.label.steps.map((s) => s.run).filter(Boolean);
  assert.deepEqual(runs, ["node scripts/release.mjs labels", "node scripts/release.mjs label-check"]);
});

test("the release pull request's body names the workflow that keeps it, and no workflow that is not there", () => {
  assert.ok(existsSync(join(kit, WORKFLOW)), `${WORKFLOW} exists`);
  const body = prBody({ version: "0.6.0", sectionText: "## [0.6.0] — 2026-11-04\n", unlabelled: [3] });
  assert.ok(body.includes(`\`${WORKFLOW}\``));
  for (const [path] of body.matchAll(/\.github\/workflows\/[\w.-]+\.ya?ml/g)) {
    assert.ok(existsSync(join(kit, path)), `the body names ${path}, which is not there`);
  }
  for (const [path] of read("scripts/release.mjs").matchAll(/\.github\/workflows\/[\w.-]+\.ya?ml/g)) {
    assert.ok(existsSync(join(kit, path)), `release.mjs names ${path}, which is not there`);
  }
});
