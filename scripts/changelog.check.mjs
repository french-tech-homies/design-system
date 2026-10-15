/* =============================================================================
   Rule checks for the commands the CHANGELOG gives a project to run.

     npm run docs:check     # node's test runner

   A command an entry asks a project to run is run here, as written, on a
   fixture project: a temp folder whose `src/` holds each shape the command
   has to tell apart. The command is read from the entry under
   `[Unreleased]`, so the text a project copies is the text tested.

   It needs ripgrep (`rg`, built with PCRE2) on the PATH, as the command
   does; without one the test says so and is skipped, except in CI
   (`CI` set), where it fails.
   ========================================================================== */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..");
const changelog = readFileSync(join(KIT, "CHANGELOG.md"), "utf8");

/** The entries not yet released: from `## [Unreleased]` to the next release. */
const unreleased = changelog.slice(
  changelog.indexOf("## [Unreleased]"),
  changelog.search(/\n## \[\d/),
);

/** The one `rg` line of a fenced block in `text` that names `<IconButton`. */
function iconButtonCommand(text) {
  const lines = [...text.matchAll(/```bash\n([\s\S]*?)```/g)]
    .flatMap(([, block]) => block.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line.startsWith("rg ") && line.includes("<IconButton"));
  assert.equal(lines.length, 1, `one command that lists icon buttons, found: ${lines.join(" | ")}`);
  return lines[0];
}

/** 0.4.0's command, as it was published: `[^>]*` stops at an arrow's `>`. */
const PUBLISHED = "rg -U --pcre2 -n '<IconButton\\b(?![^>]*\\bvariant=)' src";

/** Each shape, one a line, its first line opening with the button, and
    whether it names a `variant`. */
const SHAPES = [
  ["no prop", `<IconButton aria-label="Add" />`, false],
  ["variant alone", `<IconButton variant="standard" aria-label="Add" />`, true],
  ["an arrow before variant", `<IconButton onPress={() => add()} variant="standard" aria-label="Add" />`, true],
  ["an arrow after variant", `<IconButton variant="tonal" onPress={() => add()} aria-label="Add" />`, true],
  ["an arrow and no variant", `<IconButton onPress={() => add()} aria-label="Add" />`, false],
  [
    "an arrow with a body, over lines, before variant",
    `<IconButton\n  onPress={() => {\n    if (open) { close(); }\n  }}\n  variant="outlined"\n  aria-label="Close"\n/>`,
    true,
  ],
  [
    "an arrow with a body, over lines, and no variant",
    `<IconButton\n  onPress={(e) => {\n    if (e) { go(e => e > 1); }\n  }}\n  aria-label="Go"\n/>`,
    false,
  ],
  ["an element in a prop before variant", `<IconButton icon={<Plus />} variant="filled" aria-label="Add" />`, true],
  ["a > in a string before variant", `<IconButton aria-label="Next >" variant="standard" />`, true],
  ["a variant expression", `<IconButton variant={selected ? "filled" : "standard"} aria-label="Add" />`, true],
  ["variant= in a string, no variant", `<IconButton aria-label="variant=filled" />`, false],
  ["variant= in a single-quoted string, no variant", `<IconButton aria-label='variant=filled' />`, false],
  ["variant: in an expression, no variant", `<IconButton onPress={() => set({ variant: "x" })} aria-label="Add" />`, false],
  ["another prop ending in variant", `<IconButton data-variant="filled" aria-label="Add" />`, false],
  ["children, no variant", `<IconButton aria-label="Add">\n  <Plus />\n</IconButton>`, false],
  ["not an icon button", `<IconButtonGroup aria-label="Actions" />`, null],
];

/** The lines a command lists, run as a person runs it, from a project whose
    `src/shapes.tsx` holds every shape. `null` when there is no ripgrep. */
function run(t, command) {
  const root = mkdtempSync(join(tmpdir(), "ds-changelog-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "src"));
  const lines = [];
  const at = new Map();
  for (const [name, shape] of SHAPES) {
    at.set(lines.length + 1, name);
    lines.push(...shape.split("\n"), "");
  }
  writeFileSync(join(root, "src", "shapes.tsx"), lines.join("\n"));
  const { status, stdout, stderr, error } = spawnSync("sh", ["-c", command], {
    cwd: root,
    encoding: "utf8",
  });
  if (error) throw error;
  if (status === 127) return null;
  assert.ok(status === 0 || status === 1, `${command}: exit ${status}\n${stderr}`);
  return stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => at.get(Number(/^src\/shapes\.tsx:(\d+):/.exec(line)?.[1])) ?? line);
}

const ripgrep = spawnSync("sh", ["-c", "rg --pcre2-version"], { encoding: "utf8" }).status === 0;
/** Skipped on a machine with no ripgrep; in CI, where the pull request is
    judged, the proof is never missing: no ripgrep fails instead. */
const needsRipgrep = ripgrep || process.env.CI ? {} : { skip: "no ripgrep built with PCRE2 on the PATH" };

test("ripgrep built with PCRE2 is on the PATH, in CI", { skip: !process.env.CI && "not in CI" }, () => {
  assert.ok(ripgrep, "`rg --pcre2-version` failed: install ripgrep before docs:check");
});

test("the command that lists unsaid icon buttons lists exactly those that name no variant", needsRipgrep, (t) => {
  const command = iconButtonCommand(unreleased);
  const named = run(t, command);
  assert.deepEqual(
    named,
    SHAPES.filter(([, , says]) => says === false).map(([name]) => name),
  );
});

test("the fixture holds the shapes 0.4.0's command got wrong", needsRipgrep, (t) => {
  // Published as it is in 0.4.0's entry, which is kept as written.
  assert.ok(changelog.includes(PUBLISHED.slice(0, -4)), "0.4.0's command is in its entry");
  const named = run(t, PUBLISHED);
  for (const shape of [
    "an arrow before variant",
    "an arrow with a body, over lines, before variant",
    "a > in a string before variant",
  ]) {
    assert.ok(named.includes(shape), `0.4.0's command lists "${shape}"`);
  }
});
