/* =============================================================================
   Rule checks for the publish decision (scripts/decide-publish.mjs).

     npm run registry:check-install     # node's test runner

   `decide` is held on fixtures of the five places a release writes the
   version in, one event at a time. `checkWiring` is held on the two workflow
   files as committed, then with one thing changed: the deploy itself cannot
   run before a release, so the shape of the workflows is what is tested.
   The command is run in a temporary git repository of three commits, where
   it reads two commits as it does in CI. Nothing here publishes.
   ========================================================================== */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { parse, stringify } from "yaml";

import {
  FETCH_DEPTH,
  GATE,
  PLACES,
  RELEASED,
  checkWiring,
  decide,
  versions,
  whole,
} from "./decide-publish.mjs";

const kit = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPT = join(kit, "scripts/decide-publish.mjs");
const MAIN = "refs/heads/main";

/** The five places of a tree, as texts by path. `at` moves places one by one:
    a place's name → the version it says instead of `version`. */
const tree = (version, at = {}) => {
  const v = (place) => at[place] ?? version;
  return {
    "package.json": JSON.stringify({ name: "kit", version: v("package.json") }),
    "package-lock.json": JSON.stringify({
      name: "kit",
      version: v("package-lock.json"),
      packages: { "": { version: at["package-lock.json packages"] ?? v("package-lock.json") } },
    }),
    "registry.json": JSON.stringify({
      items: [
        { name: "button", meta: { version: v("registry.json") } },
        { name: "ds", meta: { version: at["registry.json one item"] ?? v("registry.json") } },
      ],
    }),
    "RELEASE.json": JSON.stringify({ version: v("RELEASE.json"), kit: {}, project: {} }),
    "CHANGELOG.md": `# Changelog\n\n## [Unreleased]\n\n## [${v("CHANGELOG.md")}] — 2026-01-01\n\n## [0.1.0] — 2025-01-01\n`,
  };
};

const found = (version, at) => {
  const texts = tree(version, at);
  return versions((path) => texts[path] ?? null);
};

const push = (head, base) => decide({ event: "push", ref: MAIN, head, base });

/* ---- the five places --------------------------------------------------- */

test("the five places are the ones a release writes, and the tree here says one version in all", () => {
  assert.deepEqual(
    PLACES.map((p) => p.path),
    ["package.json", "package-lock.json", "registry.json", "RELEASE.json", "CHANGELOG.md"],
  );
  const here = versions((path) => readFileSync(join(kit, path), "utf8"));
  assert.deepEqual(Object.keys(here), PLACES.map((p) => p.path));
  assert.deepEqual(whole(here), {
    version: JSON.parse(readFileSync(join(kit, "package.json"), "utf8")).version,
    problems: [],
  });
});

test("versions: `[Unreleased]` is skipped, a place that is not there says nothing", () => {
  assert.deepEqual(found("0.4.0"), {
    "package.json": ["0.4.0"],
    "package-lock.json": ["0.4.0"],
    "registry.json": ["0.4.0"],
    "RELEASE.json": ["0.4.0"],
    "CHANGELOG.md": ["0.4.0"],
  });
  const none = versions(() => null);
  assert.deepEqual(Object.values(none), [[], [], [], [], []]);
  assert.equal(whole(none).version, null);
  assert.equal(whole(none).problems.length, 5);
  // A text that does not parse is a place that says nothing, not a crash.
  assert.deepEqual(versions(() => "{")["package.json"], []);
});

/* ---- a push to main ---------------------------------------------------- */

test("push: the version moved in all five places publishes", () => {
  const said = push(found("0.4.0"), found("0.3.0"));
  assert.equal(said.publish, true);
  assert.deepEqual(said.problems, []);
  assert.match(said.reason, /^Publish 0\.4\.0: /);
});

test("push: no version moved, nothing is published and nothing is wrong", () => {
  const said = push(found("0.3.0"), found("0.3.0"));
  assert.equal(said.publish, false);
  assert.deepEqual(said.problems, []);
  assert.match(said.reason, /^Publish nothing: .*0\.3\.0/);
});

test("push: a version that moved in one place only is refused, whichever place", () => {
  for (const [at, named] of [
    [{ "package.json": "0.4.0" }, /package\.json says 0\.4\.0/],
    [{ "package-lock.json": "0.4.0" }, /package-lock\.json says 0\.4\.0/],
    [{ "package-lock.json packages": "0.4.0" }, /package-lock\.json says 0\.3\.0 and 0\.4\.0/],
    [{ "registry.json": "0.4.0" }, /registry\.json says 0\.4\.0/],
    [{ "registry.json one item": "0.4.0" }, /registry\.json says 0\.3\.0 and 0\.4\.0/],
    [{ "RELEASE.json": "0.4.0" }, /RELEASE\.json says 0\.4\.0/],
    [{ "CHANGELOG.md": "0.4.0" }, /CHANGELOG\.md says 0\.4\.0/],
  ]) {
    const said = push(found("0.3.0", at), found("0.3.0"));
    assert.equal(said.publish, false, JSON.stringify(at));
    assert.ok(said.problems.length > 0, JSON.stringify(at));
    assert.ok(said.problems.some((p) => named.test(p)), said.problems.join("\n"));
  }
  // The other way round: four moved and one was left behind.
  for (const place of PLACES.map((p) => p.path)) {
    const said = push(found("0.4.0", { [place]: "0.3.0" }), found("0.3.0"));
    assert.equal(said.publish, false, place);
    assert.ok(said.problems.length > 0, place);
  }
});

test("push: a release completed over two pushes is not published by the second", () => {
  const said = push(found("0.4.0"), found("0.3.0", { "package.json": "0.4.0" }));
  assert.equal(said.publish, false);
  assert.deepEqual(said.problems, []);
  assert.match(said.reason, /package\.json already said 0\.4\.0/);
  assert.match(said.reason, /a release moves all five in one push/);
});

test("push: a bump put back publishes nothing", () => {
  const said = push(found("0.3.0"), found("0.3.0", { "package.json": "0.4.0" }));
  assert.equal(said.publish, false);
  assert.deepEqual(said.problems, []);
});

test("push: a commit before that cannot be read is refused", () => {
  for (const base of [
    null,
    versions(() => null),
    versions((path) => (path === "RELEASE.json" ? null : tree("0.3.0")[path])),
  ]) {
    const said = push(found("0.4.0"), base);
    assert.equal(said.publish, false);
    assert.ok(said.problems.length > 0);
    assert.match(said.problems.join("\n"), /commit before/);
  }
});

test("push: only `main` publishes", () => {
  const said = decide({
    event: "push",
    ref: "refs/heads/next",
    head: found("0.4.0"),
    base: found("0.3.0"),
  });
  assert.equal(said.publish, false);
  assert.match(said.reason, /refs\/heads\/next/);
});

/* ---- a pull request ---------------------------------------------------- */

test("pull request: never publishes, and says what its merge would", () => {
  const pr = (head, base) =>
    decide({ event: "pull_request", ref: "refs/pull/2/merge", head, base });
  const release = pr(found("0.4.0"), found("0.3.0"));
  assert.equal(release.publish, false);
  assert.deepEqual(release.problems, []);
  assert.match(release.reason, /Merged, this publishes 0\.4\.0/);
  const ordinary = pr(found("0.3.0"), found("0.3.0"));
  assert.equal(ordinary.publish, false);
  assert.match(ordinary.reason, /Merged, this publishes nothing/);
  // Its five places are held like any tree's.
  const torn = pr(found("0.3.0", { "package.json": "0.4.0" }), found("0.3.0"));
  assert.equal(torn.publish, false);
  assert.ok(torn.problems.length > 0);
});

/* ---- started by hand --------------------------------------------------- */

test("by hand, on the release: publishes what the release holds", () => {
  const said = decide({
    event: "workflow_dispatch",
    ref: MAIN,
    head: found("0.3.0"),
    release: { commit: "ebb1e22c0ffee", differs: [] },
  });
  assert.equal(said.publish, true);
  assert.deepEqual(said.problems, []);
  assert.match(said.reason, /^Publish 0\.3\.0 again: .*ebb1e22\b/);
});

test("by hand, past the release: publishes nothing and names the release `main` moved past", () => {
  for (const differs of [["RELEASE.json"], ["registry.json"], RELEASED]) {
    const said = decide({
      event: "workflow_dispatch",
      ref: MAIN,
      head: found("0.3.0"),
      release: { commit: "ebb1e22c0ffee", differs },
    });
    assert.equal(said.publish, false);
    assert.deepEqual(said.problems, []);
    assert.match(said.reason, /`main` has moved past release 0\.3\.0 \(ebb1e22\)/);
    for (const path of differs) assert.ok(said.reason.includes(path), path);
  }
  const elsewhere = decide({
    event: "workflow_dispatch",
    ref: "refs/heads/next",
    head: found("0.3.0"),
    release: { commit: "ebb1e22c0ffee", differs: [] },
  });
  assert.equal(elsewhere.publish, false);
  assert.match(elsewhere.reason, /refs\/heads\/next/);
  // No release commit found: it cannot decide.
  const lost = decide({ event: "workflow_dispatch", ref: MAIN, head: found("0.3.0"), release: null });
  assert.equal(lost.publish, false);
  assert.ok(lost.problems.length > 0);
});

test("any other event publishes nothing", () => {
  const said = decide({ event: "schedule", ref: MAIN, head: found("0.4.0"), base: found("0.3.0") });
  assert.equal(said.publish, false);
  assert.deepEqual(said.problems, []);
});

/* ---- the command, on two commits --------------------------------------- */

/** A git repository holding the five places, one commit per call of `commit`. */
function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "ds-publish-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => {
    const { status, stdout, stderr } = spawnSync(
      "git",
      ["-c", "user.name=check", "-c", "user.email=check@example.invalid", "-c", "commit.gpgsign=false", ...args],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(status, 0, `git ${args.join(" ")}: ${stderr}`);
    return stdout.trim();
  };
  git("init", "-q", "-b", "main");
  const write = (texts) => {
    for (const [path, text] of Object.entries(texts)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    }
  };
  const commit = (message, texts) => {
    write(texts);
    git("add", "-A");
    git("commit", "-q", "-m", message);
    return git("rev-parse", "HEAD");
  };
  const output = join(root, "..", `${root.split("/").pop()}.output`);
  t.after(() => rmSync(output, { force: true }));
  /** The command, as the workflow's step runs it. */
  const run = (...args) => {
    writeFileSync(output, "");
    const { GITHUB_STEP_SUMMARY: _, ...env } = process.env;
    const { status, stdout, stderr } = spawnSync(process.execPath, [SCRIPT, ...args], {
      cwd: root,
      encoding: "utf8",
      env: { ...env, GITHUB_OUTPUT: output },
    });
    return { status, stdout, stderr, output: readFileSync(output, "utf8") };
  };
  return { root, git, write, commit, run };
}

test("the command reads the tree and the commit before, and writes the step's output", (t) => {
  const repo = repository(t);
  const root = repo.commit("before any release", tree("0.2.0"));
  const first = repo.commit("release 0.3.0", tree("0.3.0"));
  const ordinary = repo.commit("an ordinary change", { "README.md": "words\n" });

  // Across the ordinary commit: nothing.
  let said = repo.run("--event", "push", "--base", first, "--ref", MAIN);
  assert.equal(said.status, 0, said.stderr);
  assert.match(said.stdout, /^Publish nothing: /m);
  assert.equal(said.output, "publish=false\n");

  // By hand there: the release's registry and record still stand.
  said = repo.run("--event", "workflow_dispatch", "--ref", MAIN);
  assert.equal(said.status, 0, said.stderr);
  assert.match(said.stdout, new RegExp(`^Publish 0\\.3\\.0 again: .*${first.slice(0, 7)}`, "m"));
  assert.equal(said.output, "publish=true\n");

  // By hand once the record moved without a release: nothing, the release named.
  repo.write({ "RELEASE.json": JSON.stringify({ version: "0.3.0", kit: { "a.ts": {} }, project: {} }) });
  said = repo.run("--event", "workflow_dispatch", "--ref", MAIN);
  assert.equal(said.status, 0, said.stderr);
  assert.match(said.stdout, new RegExp(`has moved past release 0\\.3\\.0 \\(${first.slice(0, 7)}\\).*RELEASE\\.json`));
  assert.equal(said.output, "publish=false\n");
  const moved = repo.commit("the record moved", {});

  // The second release, pushed over the commit before it: publish.
  const second = repo.commit("release 0.4.0", tree("0.4.0"));
  said = repo.run("--event", "push", "--base", moved, "--ref", MAIN);
  assert.equal(said.status, 0, said.stderr);
  assert.match(said.stdout, /^Publish 0\.4\.0: /m);
  assert.equal(said.output, "publish=true\n");
  // The same tree as a pull request: a forecast, and no publish.
  said = repo.run("--event", "pull_request", "--base", moved, "--ref", "refs/pull/2/merge");
  assert.match(said.stdout, /Merged, this publishes 0\.4\.0/);
  assert.equal(said.output, "publish=false\n");
  // By hand on the release itself: its own commit is the one found.
  said = repo.run("--event", "workflow_dispatch", "--ref", MAIN);
  assert.match(said.stdout, new RegExp(`^Publish 0\\.4\\.0 again: .*${second.slice(0, 7)}`, "m"));

  // A commit before that is not there, or none: it cannot decide.
  for (const base of ["0".repeat(40), "", "f".repeat(40)]) {
    said = repo.run("--event", "push", "--base", base, "--ref", MAIN);
    assert.equal(said.status, 1, base);
    assert.match(said.stderr, /commit before/);
    assert.equal(said.output, "publish=false\n");
  }
  // A tree whose places disagree: refused, with the place named.
  repo.write({ "package.json": JSON.stringify({ version: "0.5.0" }) });
  said = repo.run("--event", "push", "--base", second, "--ref", MAIN);
  assert.equal(said.status, 1);
  assert.match(said.stderr, /package\.json says 0\.5\.0/);
  assert.equal(said.output, "publish=false\n");
  assert.ok(root && ordinary);
});

test("the command, here: this tree over itself publishes nothing", () => {
  const { GITHUB_OUTPUT: _, GITHUB_STEP_SUMMARY: __, ...env } = process.env;
  const { status, stdout } = spawnSync(
    process.execPath,
    [SCRIPT, "--event", "push", "--base", "HEAD", "--ref", MAIN],
    { cwd: kit, encoding: "utf8", env },
  );
  assert.equal(status, 0);
  assert.match(stdout, /^Publish nothing: /m);
});

/* ---- the two workflows ------------------------------------------------- */

const WORKFLOWS = join(kit, ".github/workflows");

/** The workflow files as committed: the two the rule names, and every other. */
const workflows = () => ({
  pages: readFileSync(join(WORKFLOWS, "pages.yml"), "utf8"),
  checks: readFileSync(join(WORKFLOWS, "checks.yml"), "utf8"),
  others: Object.fromEntries(
    readdirSync(WORKFLOWS)
      .filter((file) => /\.ya?ml$/.test(file) && !["pages.yml", "checks.yml"].includes(file))
      .map((file) => [file, readFileSync(join(WORKFLOWS, file), "utf8")]),
  ),
});

/** The workflows with one thing changed in the parsed form of one of them. */
const rewired = (which, change) => {
  const files = workflows();
  const parsed = parse(files[which]);
  change(parsed);
  const text = stringify(parsed);
  assert.notEqual(stringify(parse(files[which])), text, "the fixture changed nothing");
  return { ...files, [which]: text };
};

const refusesWiring = (files, pattern) => {
  const problems = checkWiring(files);
  assert.ok(
    problems.some((p) => pattern.test(p)),
    `no problem matches ${pattern}:\n  ${problems.join("\n  ")}`,
  );
};

test("the two workflows as committed: only the decision publishes", () => {
  assert.deepEqual(checkWiring(workflows()), []);
});

test("a `publish` job that does not wait on the decision is refused", () => {
  refusesWiring(
    rewired("pages", (w) => delete w.jobs.publish.if),
    /pages\.yml: `publish` must run only `if: needs\.checks\.outputs\.publish == 'true'`/,
  );
  for (const condition of [
    "always()",
    "needs.checks.outputs.publish != 'false'",
    `${GATE} || github.event_name == 'workflow_dispatch'`,
    "needs.checks.outputs.publish",
  ]) {
    refusesWiring(
      rewired("pages", (w) => (w.jobs.publish.if = condition)),
      /pages\.yml: `publish` must run only `if: /,
    );
  }
  refusesWiring(
    rewired("pages", (w) => delete w.jobs.publish.needs),
    /pages\.yml: `publish` must need `checks`/,
  );
  refusesWiring(
    rewired("pages", (w) => (w.jobs.publish.needs = ["other"])),
    /pages\.yml: `publish` must need `checks`/,
  );
});

test("a push to `main` that is no longer checked whole is refused", () => {
  refusesWiring(
    rewired("pages", (w) => (w.jobs.checks.if = GATE)),
    /pages\.yml: `checks` must carry no `if`/,
  );
  refusesWiring(
    rewired("pages", (w) => (w.jobs.checks.uses = "./.github/workflows/other.yml")),
    /pages\.yml: `checks` must call \.\/\.github\/workflows\/checks\.yml/,
  );
  refusesWiring(
    rewired("pages", (w) => delete w.on.push),
    /pages\.yml: must run on a push to `main`/,
  );
  refusesWiring(
    rewired("pages", (w) => (w.on.push.branches = ["release"])),
    /pages\.yml: must run on a push to `main`/,
  );
  refusesWiring(
    rewired("pages", (w) => (w.on.push.paths = ["package.json"])),
    /pages\.yml: must run on a push to `main`/,
  );
  refusesWiring(
    rewired("pages", (w) => delete w.on.workflow_dispatch),
    /pages\.yml: must keep `workflow_dispatch`/,
  );
  refusesWiring(
    rewired("pages", (w) => (w.concurrency = { group: "pages" })),
    /pages\.yml: no `concurrency` on the workflow/,
  );
  refusesWiring(
    rewired("checks", (w) => (w.jobs.checks.if = "github.event_name != 'push'")),
    /checks\.yml: `checks` must carry no `if`/,
  );
});

test("a pull request that is no longer checked is refused", () => {
  refusesWiring(
    rewired("checks", (w) => delete w.on.pull_request),
    /checks\.yml: must run on every `pull_request`/,
  );
  refusesWiring(
    rewired("checks", (w) => (w.on.pull_request = { paths: ["components/**"] })),
    /checks\.yml: must run on every `pull_request`/,
  );
  refusesWiring(
    rewired("checks", (w) => delete w.on.workflow_call),
    /checks\.yml: must be callable \(`workflow_call`\)/,
  );
});

test("a second way to deploy is refused", () => {
  const deploy = { "runs-on": "ubuntu-latest", steps: [{ uses: "actions/deploy-pages@v4" }] };
  refusesWiring(
    rewired("pages", (w) => (w.jobs.again = deploy)),
    /pages\.yml: job `again` uses actions\/deploy-pages/,
  );
  refusesWiring(
    rewired("checks", (w) => w.jobs.checks.steps.push({ uses: "actions/deploy-pages@v4" })),
    /checks\.yml: job `checks` uses actions\/deploy-pages/,
  );
  refusesWiring(
    { ...workflows(), others: { "preview.yml": stringify({ on: "push", jobs: { deploy } }) } },
    /preview\.yml: job `deploy` uses actions\/deploy-pages/,
  );
  refusesWiring(
    rewired("pages", (w) => (w.jobs.publish.steps = w.jobs.publish.steps.filter((s) => !s.uses?.startsWith("actions/deploy-pages")))),
    /pages\.yml: `publish` must be the job that uses actions\/deploy-pages/,
  );
});

test("an output `publish` that is not the decision's is refused", () => {
  refusesWiring(
    rewired("checks", (w) => delete w.on.workflow_call.outputs),
    /checks\.yml: `workflow_call` must hand on the output `publish`/,
  );
  refusesWiring(
    rewired("checks", (w) => (w.on.workflow_call.outputs.publish.value = "true")),
    /checks\.yml: `workflow_call` must hand on the output `publish`/,
  );
  refusesWiring(
    rewired("checks", (w) => delete w.jobs.checks.outputs),
    /checks\.yml: the job's output `publish` must be a step's/,
  );
  // Taken from another step than the one that runs the decision.
  refusesWiring(
    rewired("checks", (w) => {
      w.jobs.checks.steps[0].id = "other";
      w.jobs.checks.outputs.publish = "${{ steps.other.outputs.publish }}";
    }),
    /checks\.yml: the output `publish` must come from the step that runs `npm run registry:publishes`/,
  );
  // The step's command replaced by one that always says yes.
  refusesWiring(
    rewired("checks", (w) => {
      const step = w.jobs.checks.steps.find((s) => s.id === "decide");
      step.run = 'echo "publish=true" >> "$GITHUB_OUTPUT"';
    }),
    /checks\.yml: the output `publish` must come from the step that runs `npm run registry:publishes`/,
  );
  // A hand start reads the history back to the release: the whole of it.
  refusesWiring(
    rewired("checks", (w) => delete w.jobs.checks.steps.find((s) => s.uses?.startsWith("actions/checkout")).with),
    /checks\.yml: the checkout must fetch the whole history on a hand start/,
  );
  assert.equal(FETCH_DEPTH, "${{ github.event_name != 'workflow_dispatch' && 1 || 0 }}");
});
