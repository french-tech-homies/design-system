#!/usr/bin/env node
/* =============================================================================
   Only a release publishes: does this run publish?

     npm run registry:publishes -- --event push --base <sha> --ref refs/heads/main
     npm run registry:check-install     # the same rule, as tests

   Pages serves one build, the latest: no address serves an older release. So
   a merge must not publish by itself, or the registry serves what is under
   `[Unreleased]` under the number of the last release. This is the decision,
   called by one step of .github/workflows/checks.yml, whose answer gates the
   `publish` job of pages.yml. It publishes nothing itself.

   A release writes the version in five places (PLACES), in one commit. The
   decision reads them in the tree and in the commit before:

   - a push to `main` publishes when the tree says one version in all five
     and the commit before the push said it in none. A tree whose places
     disagree is refused (exit 1). A version that was already in some place
     of the commit before does not publish: a release moves all five in one
     push, so a version cannot be walked in one place at a time;
   - a pull request never publishes, and is told what its merge would;
   - started by hand (`workflow_dispatch`), it publishes only what the last
     release holds: on `main`, and only while registry.json and RELEASE.json
     are still that release's, byte for byte. Otherwise it publishes nothing
     and says which release `main` has moved past. The release's commit is
     the oldest on `main`'s first-parent line that says the tree's version
     in all five places, read back from the tip for as long as a commit
     still says it in some place. A shallow clone is refused (exit 1).

   It compares against the commit before, not against what Pages serves, so
   it reads no network and says the same in a test.

   `decide` and `checkWiring` are pure, so decide-publish.check.mjs can hand
   them one thing wrong. `checkWiring` holds the two workflow files to the
   shape the decision needs: the deploy cannot be run to prove it.
   ========================================================================== */

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const json = (text) => JSON.parse(text);

/** The places a release writes the version in, each with how it is read: a
    text in, every version it says out. A place that says two is not whole. */
export const PLACES = [
  { path: "package.json", read: (text) => [json(text).version] },
  {
    path: "package-lock.json",
    read: (text) => [json(text).version, json(text).packages?.[""]?.version],
  },
  {
    path: "registry.json",
    read: (text) => json(text).items.map((item) => item.meta?.version),
  },
  { path: "RELEASE.json", read: (text) => [json(text).version] },
  {
    // The newest numbered heading: `[Unreleased]` is not a version.
    path: "CHANGELOG.md",
    read: (text) => [/^## \[(\d+\.\d+\.\d+[^\]\s]*)\]/m.exec(text)?.[1]],
  },
];

/** What a hand start holds against the release: the whole registry. */
export const RELEASED = ["registry.json", "RELEASE.json"];

/**
 * @param {(path: string) => string | null} read a place's text, or null
 * @returns {Record<string, string[]>} place → the versions it says, each
 *   once; none when the place is not there, cannot be read or names none
 */
export function versions(read) {
  const found = {};
  for (const place of PLACES) {
    const text = read(place.path);
    let said = [];
    if (typeof text === "string") {
      try {
        said = place.read(text);
      } catch {
        said = [undefined];
      }
    }
    found[place.path] = said.every((v) => typeof v === "string" && v)
      ? [...new Set(said)].sort()
      : [];
  }
  return found;
}

const says = ([path, said]) =>
  `${path} says ${said.length ? said.join(" and ") : "no version"}`;

/** The one version every place says, or what stands against it. */
export function whole(found) {
  const places = Object.entries(found);
  const problems = places.filter(([, said]) => said.length !== 1).map(says);
  const all = new Set(places.flatMap(([, said]) => said));
  if (!problems.length && all.size === 1) return { version: [...all][0], problems };
  if (!problems.length) {
    problems.push(
      `the ${places.length} places do not say one version: ${places.map(says).join(", ")}`,
    );
  }
  return { version: null, problems };
}

const short = (commit) => commit.slice(0, 7);
const list = (paths) => paths.join(" and ");

/**
 * @param {object} run
 * @param {string} run.event    `push`, `pull_request` or `workflow_dispatch`
 * @param {string} run.ref      the ref the run is on (`refs/heads/main`)
 * @param {Record<string, string[]>} run.head  `versions` of the tree
 * @param {Record<string, string[]> | null} [run.base]  `versions` of the
 *   commit before the push, or of the pull request's base; null when there
 *   is none to read
 * @param {{ commit: string, differs: string[] } | { problem: string } | null} [run.release]
 *   on a hand start: the release's commit, and which of RELEASED the tree no
 *   longer holds as that commit does; null when no such commit was found,
 *   `problem` when the history could not be read to find it
 * @returns {{ publish: boolean, reason: string, problems: string[] }}
 *   `problems` is not empty when it cannot decide: the run is then red
 */
export function decide({ event, ref, head, base = null, release = null }) {
  const cannot = (problems) => ({
    publish: false,
    reason: "Publish nothing: the decision cannot be made.",
    problems,
  });
  const no = (reason) => ({ publish: false, reason, problems: [] });

  const tree = whole(head);
  if (!tree.version) {
    return cannot([
      "A release writes one version in every place, in one commit, and this tree does not:",
      ...tree.problems,
    ]);
  }
  const V = tree.version;

  if (event === "workflow_dispatch") {
    if (ref !== "refs/heads/main") {
      return no(
        `Publish nothing: started by hand on ${ref}, and only \`main\` is published.`,
      );
    }
    if (!release || release.problem) {
      return cannot([
        release?.problem ??
          `no commit of \`main\` was found to be release ${V}: is the history whole?`,
      ]);
    }
    if (release.differs.length) {
      return no(
        `Publish nothing: \`main\` has moved past release ${V} (${short(release.commit)}): ${list(release.differs)} ${release.differs.length > 1 ? "are" : "is"} no longer that release's. Only a release publishes, by hand too: the next release publishes what \`main\` holds.`,
      );
    }
    return {
      publish: true,
      reason: `Publish ${V} again: started by hand, and ${list(RELEASED)} are still what release ${V} (${short(release.commit)}) holds.`,
      problems: [],
    };
  }

  if (event !== "push" && event !== "pull_request") {
    return no(`Publish nothing: \`${event}\` is not an event that publishes.`);
  }

  const before = event === "push" ? "the commit before the push" : "the base";
  const unread = base
    ? Object.entries(base).filter(([, said]) => !said.length)
    : null;
  if (!base || unread.length) {
    const problem = base
      ? `${before} cannot be read whole: ${unread.map(says).join(", ")}`
      : `${before} cannot be read: no commit before was given, or it is not in this clone`;
    // A pull request's sentence is a forecast: unread, it is said and no more.
    return event === "push"
      ? cannot([problem])
      : no(`Publish nothing: a pull request never publishes. No forecast: ${problem}.`);
  }

  const already = Object.entries(base).filter(([, said]) => said.includes(V));
  let moved;
  if (!already.length) moved = true;
  else if (already.length === Object.keys(base).length) moved = false;
  else moved = null;

  if (event === "pull_request") {
    const forecast =
      moved === true
        ? `Merged, this publishes ${V}: the base says it in none of the ${PLACES.length} places.`
        : moved === false
          ? `Merged, this publishes nothing: the version is ${V} here and at the base.`
          : `Merged, this publishes nothing: ${list(already.map(([p]) => p))} already said ${V} at the base, and a release moves all five in one push.`;
    return no(`Publish nothing: a pull request never publishes. ${forecast}`);
  }

  if (ref !== "refs/heads/main") {
    return no(`Publish nothing: a push to ${ref}, and only \`main\` is published.`);
  }
  if (moved === true) {
    return {
      publish: true,
      reason: `Publish ${V}: the tree says it in all ${PLACES.length} places (${list(PLACES.map((p) => p.path))}) and ${before} said it in none.`,
      problems: [],
    };
  }
  if (moved === false) {
    return no(
      `Publish nothing: the version is ${V} in the tree and in ${before}. Only a release publishes; the site stays as release ${V} left it.`,
    );
  }
  return no(
    `Publish nothing: ${list(already.map(([p]) => p))} already said ${V} in ${before}, and a release moves all five in one push. Start the workflow by hand to publish ${V}.`,
  );
}

/* ---- the two workflows ------------------------------------------------- */

export const GATE = "needs.checks.outputs.publish == 'true'";
export const COMMAND = "npm run registry:publishes";
export const FETCH_DEPTH = "${{ github.event_name != 'workflow_dispatch' && 1 || 0 }}";
const DEPLOY = "actions/deploy-pages";
const CHECKS = "./.github/workflows/checks.yml";

const jobsOf = (workflow) => Object.entries(workflow?.jobs ?? {});
const deploys = (job) =>
  (job?.steps ?? []).some((step) => step?.uses?.startsWith(DEPLOY));
const needs = (job) => [job?.needs ?? []].flat();

/**
 * @param {object} files
 * @param {string} files.pages   .github/workflows/pages.yml
 * @param {string} files.checks  .github/workflows/checks.yml
 * @param {Record<string, string>} [files.others] every other workflow file,
 *   by name
 * @returns {string[]} problems; empty when only the decision publishes, and
 *   a pull request and a push to `main` are still checked whole
 */
export function checkWiring({ pages, checks, others = {} }) {
  const problems = [];
  const p = parse(pages);
  const c = parse(checks);

  // pages.yml: every push to main is checked; only `publish` deploys, and
  // only on the decision's word.
  const push = p?.on?.push;
  if (
    !push ||
    push.branches?.length !== 1 ||
    push.branches[0] !== "main" ||
    Object.keys(push).length !== 1
  ) {
    problems.push(
      "pages.yml: must run on a push to `main`, every one (`on.push.branches: [main]` and no other filter)",
    );
  }
  if (!p?.on || !("workflow_dispatch" in p.on)) {
    problems.push("pages.yml: must keep `workflow_dispatch`, the hand start");
  }
  if (p?.concurrency !== undefined) {
    problems.push(
      "pages.yml: no `concurrency` on the workflow: an ordinary merge would then cancel a release's pending run. It is the `publish` job's",
    );
  }
  const called = p?.jobs?.checks;
  if (called?.uses !== CHECKS) {
    problems.push(`pages.yml: \`checks\` must call ${CHECKS}`);
  }
  if (called?.if !== undefined) {
    problems.push(
      "pages.yml: `checks` must carry no `if`: a push to `main` is checked whole, whether it publishes or not",
    );
  }
  const publish = p?.jobs?.publish;
  if (!needs(publish).includes("checks")) {
    problems.push("pages.yml: `publish` must need `checks`");
  }
  if (publish?.if !== GATE) {
    problems.push(
      `pages.yml: \`publish\` must run only \`if: ${GATE}\`, and it has ${publish?.if === undefined ? "no `if`" : `\`if: ${publish.if}\``}`,
    );
  }
  if (!deploys(publish)) {
    problems.push(`pages.yml: \`publish\` must be the job that uses ${DEPLOY}`);
  }
  for (const [file, workflow] of [
    ["pages.yml", p],
    ["checks.yml", c],
    ...Object.entries(others).map(([file, text]) => [file, parse(text)]),
  ]) {
    for (const [name, job] of jobsOf(workflow)) {
      if (deploys(job) && !(file === "pages.yml" && name === "publish")) {
        problems.push(
          `${file}: job \`${name}\` uses ${DEPLOY}: only \`publish\` in pages.yml deploys`,
        );
      }
    }
  }

  // checks.yml: every pull request is checked, and the output `publish` is
  // the word of the step that runs the decision.
  if (!c?.on || !("pull_request" in c.on) || c.on.pull_request != null) {
    problems.push(
      "checks.yml: must run on every `pull_request`, with no filter",
    );
  }
  if (!c?.on || !("workflow_call" in c.on)) {
    problems.push("checks.yml: must be callable (`workflow_call`): pages.yml calls it");
  }
  const job = c?.jobs?.checks;
  if (job?.if !== undefined) {
    problems.push("checks.yml: `checks` must carry no `if`");
  }
  if (
    c?.on?.workflow_call?.outputs?.publish?.value !==
    "${{ jobs.checks.outputs.publish }}"
  ) {
    problems.push(
      "checks.yml: `workflow_call` must hand on the output `publish` as `${{ jobs.checks.outputs.publish }}`",
    );
  }
  const from = /^\$\{\{ steps\.([A-Za-z0-9_-]+)\.outputs\.publish \}\}$/.exec(
    job?.outputs?.publish ?? "",
  );
  if (!from) {
    problems.push(
      "checks.yml: the job's output `publish` must be a step's (`${{ steps.<id>.outputs.publish }}`)",
    );
  } else {
    const step = (job.steps ?? []).find((s) => s?.id === from[1]);
    if (!step?.run?.includes(COMMAND) || /\bpublish=/.test(step.run)) {
      problems.push(
        `checks.yml: the output \`publish\` must come from the step that runs \`${COMMAND}\`, and that step writes no \`publish=\` of its own`,
      );
    }
  }
  const checkout = (job?.steps ?? []).find((s) =>
    s?.uses?.startsWith("actions/checkout"),
  );
  if (checkout?.with?.["fetch-depth"] !== FETCH_DEPTH) {
    problems.push(
      `checks.yml: the checkout must fetch the whole history on a hand start, which reads back to the release (\`fetch-depth: ${FETCH_DEPTH}\`)`,
    );
  }

  return problems;
}

/* ---- the command ------------------------------------------------------- */

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  });

/** A file's text at a commit, or null when the commit or the file is not there. */
const at = (commit) => (path) => {
  try {
    return git("show", `${commit}:${path}`);
  } catch {
    return null;
  }
};

const inTree = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null);

/** The release's commit: back from the tip along the first parents, for as
    long as a commit still says `version` in some place, the oldest that
    says it in every place. Not the first stop: a torn commit between the
    release and the tip (a bump of one place, later put back) says `version`
    in the other places and does not end the walk, or the commit after it
    would be taken for the release and what `main` gathered since published
    under its number. A clone without its whole history cannot answer. */
function releaseCommit(version) {
  let commits;
  try {
    if (git("rev-parse", "--is-shallow-repository").trim() !== "false") {
      return {
        problem: `this clone is shallow: the history cannot be read back to release ${version}, so what the release holds is not known (checkout with \`fetch-depth: 0\`)`,
      };
    }
    commits = git("rev-list", "--first-parent", "HEAD").split("\n").filter(Boolean);
  } catch {
    return null;
  }
  let release = null;
  for (const commit of commits) {
    const found = versions(at(commit));
    if (!Object.values(found).some((said) => said.includes(version))) break;
    if (whole(found).version === version) release = commit;
  }
  return release && { commit: release };
}

function main(argv) {
  const option = (name) => {
    const index = argv.indexOf(`--${name}`);
    return index < 0 ? "" : (argv[index + 1] ?? "");
  };
  const event = option("event");
  const ref = option("ref");
  const sha = option("base");
  if (!event) {
    console.error(
      "usage: node scripts/decide-publish.mjs --event <push|pull_request|workflow_dispatch> [--base <sha>] [--ref <ref>]",
    );
    return 2;
  }

  const head = versions(inTree);
  // No commit before (a first push says forty zeros): nothing to read. A
  // commit that is not in this clone reads as five places that say nothing.
  const base = sha && !/^0+$/.test(sha) ? versions(at(sha)) : null;
  let release = null;
  if (event === "workflow_dispatch" && ref === "refs/heads/main") {
    const { version } = whole(head);
    const found = version ? releaseCommit(version) : null;
    release = found?.commit
      ? {
          commit: found.commit,
          differs: RELEASED.filter((path) => inTree(path) !== at(found.commit)(path)),
        }
      : found;
  }

  const said = decide({ event, ref, head, base, release });
  const lines = [said.reason, ...said.problems.map((p) => `  ${p}`)];
  if (said.problems.length) console.error(lines.join("\n"));
  else console.log(said.reason);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `publish=${said.publish}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
  }
  return said.problems.length ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
