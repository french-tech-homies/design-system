/* =============================================================================
   Rule checks for the update check (changed.mjs) and the release record
   (RELEASE.json, written by scripts/build-registry.mjs).

     npm run registry:check-install     # node's test runner

   Each test makes the command speak on a fixture install: a temp folder
   holding every file the committed registry.json carries, at the place the
   CLI lands it (the kit under the ui alias, the skills under the project's
   root), with a `components.json` at the root. Then one thing is changed.
   ========================================================================== */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  RECORD,
  UPDATE,
  compare,
  digests,
  itemRecord,
  landedText,
  unscannedUtils,
  updateCommand,
} from "../changed.mjs";

const kit = dirname(dirname(fileURLToPath(import.meta.url)));
const registry = JSON.parse(readFileSync(join(kit, "registry.json"), "utf8"));
const record = JSON.parse(readFileSync(join(kit, RECORD), "utf8"));

/** The items the whole install does not bring, as the record names them. */
const OPTIONAL = Object.keys(record.optional);
const NEXT = "next-adapter";

const UI = "src/components/ui/ds";
const TAG = `${UI}/components/Tag.tsx`;
const BUTTON = `${UI}/components/Button.tsx`;
const INDEX = `${UI}/index.ts`;

/** What shadcn 4.19 was seen to write of a `.ts` or `.tsx` file on a real
    install: the file from its first token on. Written here apart from the
    check's own pattern, so the two are held against each other. */
const asTheCliLands = (text) =>
  text.replace(/^(?:\s+|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)+/, "");

/** Where the CLI lands a target, from the project's root. */
const landing = (target) =>
  target.startsWith("@ui/ds/")
    ? `${UI}/${target.slice("@ui/ds/".length)}`
    : target.replace(/^~\//, "");

/** A project holding the files of these items (every item when none is
    named, but the ones in `without`), as the CLI lands them. Removed when
    the test ends. `without: OPTIONAL` is `add @ds/ds` alone. */
function install(t, { only, without = [], config = { rsc: true, tsx: true } } = {}) {
  const root = mkdtempSync(join(tmpdir(), "ds-changed-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (config) {
    writeFileSync(join(root, "components.json"), JSON.stringify(config));
  }
  for (const item of registry.items) {
    if (only && !only.includes(item.name)) continue;
    if (without.includes(item.name)) continue;
    for (const { path, target } of item.files ?? []) {
      const to = join(root, landing(target));
      mkdirSync(dirname(to), { recursive: true });
      writeFileSync(to, readFileSync(join(kit, path)));
    }
  }
  const edit = (path, change) => {
    const before = readFileSync(join(root, path), "utf8");
    const after = change(before);
    assert.notEqual(after, before, `the fixture changed nothing in ${path}`);
    writeFileSync(join(root, path), after);
  };
  /** The command, run from the project's root as a person runs it. */
  const run = (...args) => {
    const { status, stdout, stderr } = spawnSync(
      process.execPath,
      [`${UI}/changed.mjs`, ...args],
      { cwd: root, encoding: "utf8" },
    );
    const { changed, whitespace, ...others } = listed(stdout);
    return { status, stdout, stderr, files: { changed, whitespace }, ...others };
  };
  return { root, edit, run };
}

/** The files a run listed, by group. */
function listed(stdout) {
  const files = { changed: [], whitespace: [], missing: [], behind: [], "not here": [] };
  let group = null;
  for (const line of stdout.split("\n")) {
    const title = /^(changed|whitespace|missing|behind|not here) \(/.exec(line);
    if (title) group = title[1];
    else if (group && line.startsWith("  ")) files[group].push(line.trim());
    else group = null;
  }
  return files;
}

const NOTHING = { changed: [], whitespace: [] };

const cannotTell = (path) =>
  `No release record here (${path}). This copy of the kit was installed before 0.3.0, or its record was removed, so this check cannot tell which kit files you changed. Update as before: commit your work, run "npx shadcn add @ds/ds --overwrite -y", then read "git diff" and put back what was yours.\n`;

/* ---- the command, on an install --------------------------------------- */

test("an install nothing was changed in: nothing listed, exit 0", (t) => {
  const { status, stdout, stderr, files } = install(t).run();
  assert.equal(stderr, "");
  assert.deepEqual(files, NOTHING);
  assert.match(stdout, /^Kit \d+\.\d+\.\d+: none of the \d+ recorded files differs/);
  assert.ok(!stdout.includes(UI), stdout);
  assert.equal(status, 0);
  // Every optional item is held here, and the command takes them all.
  assert.ok(stdout.endsWith(`\nTo update, from a clean working tree: ${updateCommand(OPTIONAL)}\n`), stdout);
  assert.ok(!stdout.includes("Not installed"), stdout);
});

test("one kit file edited: that file under `changed` and no other, exit 1", (t) => {
  const project = install(t);
  project.edit(TAG, (text) => text.replace("export ", "// mine\nexport "));
  const { status, files, stdout } = project.run();
  assert.deepEqual(files, { changed: [TAG], whitespace: [] });
  assert.match(stdout, /^Kit \S+: 1 of \d+ recorded files differ/);
  assert.equal(status, 1);
});

test("a skill edited is listed where it landed, under the project's root", (t) => {
  const project = install(t);
  project.edit(".claude/skills/ds-build/SKILL.md", (text) => `${text}\nOurs.\n`);
  const { status, files } = project.run();
  assert.deepEqual(files, {
    changed: [".claude/skills/ds-build/SKILL.md"],
    whitespace: [],
  });
  assert.equal(status, 1);
});

test("a file the project wrote beside the kit is not listed, exit 0", (t) => {
  const project = install(t);
  writeFileSync(
    join(project.root, UI, "components/Timeline.tsx"),
    "export function Timeline() {}\n",
  );
  writeFileSync(join(project.root, UI, "notes.md"), "ours\n");
  const { status, files, stdout } = project.run();
  assert.deepEqual(files, NOTHING);
  assert.ok(!stdout.includes("Timeline"));
  assert.equal(status, 0);
});

test("no record: told plainly that the check cannot tell, and what to do, exit 2", (t) => {
  const project = install(t);
  rmSync(join(project.root, UI, RECORD));
  project.edit(TAG, (text) => `${text}// mine\n`);
  const { status, stdout, stderr } = project.run();
  assert.equal(stdout, "");
  assert.equal(stderr, cannotTell(`${UI}/${RECORD}`));
  assert.ok(stderr.includes(UPDATE));
  assert.equal(status, 2);
});

test("only the check installed, as on a copy made before 0.3.0: the same sentence, exit 2", (t) => {
  const { status, stdout, stderr } = install(t, {
    only: ["changed", "license"],
  }).run();
  assert.equal(stdout, "");
  assert.equal(stderr, cannotTell(`${UI}/${RECORD}`));
  assert.equal(status, 2);
});

test("a record that cannot be read: it cannot tell, exit 2", (t) => {
  for (const text of ["{", "{}", '{"version":"0.3.0"}']) {
    const project = install(t);
    writeFileSync(join(project.root, UI, RECORD), text);
    const { status, stdout, stderr } = project.run();
    assert.equal(stdout, "");
    assert.match(stderr, /cannot be read: .*cannot tell.*Update as before: /);
    assert.equal(status, 2);
  }
});

test("a file laid out again is under `whitespace`, not `changed`, exit 1", (t) => {
  const project = install(t);
  project.edit(TAG, (text) => text.replace(/^ {2}/gm, "\t").replace(/\n\n/g, "\n"));
  project.edit(BUTTON, (text) => text.replace("export ", "// mine\nexport "));
  const { status, files } = project.run();
  assert.deepEqual(files, { changed: [BUTTON], whitespace: [TAG] });
  assert.equal(status, 1);
  // Whitespace alone still answers 1: nothing is hidden.
  const again = install(t);
  again.edit(TAG, (text) => text.replace(/^ {2}/gm, "    "));
  assert.deepEqual(again.run().files, { changed: [], whitespace: [TAG] });
  assert.equal(again.run().status, 1);
});

test("the CLI's own doing is not an edit: the opening comment of a source dropped, CRLF line ends", (t) => {
  const project = install(t, { config: { rsc: false, tsx: true } });
  const opened = [];
  for (const path of Object.keys(record.kit)) {
    const file = join(project.root, UI, path);
    let text = readFileSync(file, "utf8");
    if (/\.tsx?$/.test(path)) {
      const from = asTheCliLands(text);
      if (from !== text) opened.push(path);
      text = from;
    }
    writeFileSync(file, text.replace(/\n/g, "\r\n"));
  }
  assert.deepEqual(opened, ["index.ts", "primitives/Typography.tsx"]);
  const { status, files } = project.run();
  assert.deepEqual(files, NOTHING);
  assert.equal(status, 0);
});

test("a comment put at the top of a kit source is an edit: that file alone, exit 1", (t) => {
  for (const [path, comment] of [
    [BUTTON, "// @ts-nocheck\n"],
    [TAG, "/* eslint-disable */\n"],
    [`${UI}/utils.ts`, "// @ts-nocheck\n"],
    [`${UI}/primitives/Typography.tsx`, "/* eslint-disable */\n"],
  ]) {
    const project = install(t);
    project.edit(path, (text) => `${comment}${text}`);
    const { status, files } = project.run();
    assert.deepEqual(files, { changed: [path], whitespace: [] }, path);
    assert.equal(status, 1);
  }
});

test("the same on a file the CLI landed without its opening comment: that file alone, exit 1", (t) => {
  const landed = (t) => {
    const project = install(t);
    project.edit(INDEX, asTheCliLands);
    project.edit(`${UI}/primitives/Typography.tsx`, asTheCliLands);
    return project;
  };
  assert.deepEqual(landed(t).run().files, NOTHING);
  for (const comment of ["// @ts-nocheck\n", "/* eslint-disable */\n\n"]) {
    const project = landed(t);
    project.edit(INDEX, (text) => `${comment}${text}`);
    const { status, files } = project.run();
    assert.deepEqual(files, { changed: [INDEX], whitespace: [] }, comment);
    assert.equal(status, 1);
  }
});

test('a `"use client"` taken out or put in is an edit: the CLI leaves the kit\'s in place', (t) => {
  const project = install(t, { config: { rsc: false, tsx: true } });
  const UTILS = `${UI}/utils.ts`;
  project.edit(BUTTON, (text) => text.replace(/^"use client";\n+/, ""));
  project.edit(UTILS, (text) => `"use client";\n\n${text}`);
  const { status, files } = project.run();
  assert.deepEqual(files, { changed: [BUTTON, UTILS], whitespace: [] });
  assert.equal(status, 1);
});

test("no comment is set aside: an edit inside a source's opening comment is listed, like a stylesheet's", (t) => {
  const project = install(t);
  const THEME = `${UI}/tokens/theme.css`;
  // As the kit writes it, and as the CLI lands it: neither is an edit.
  assert.deepEqual(project.run().files, NOTHING);
  project.edit(INDEX, (text) => text.replace("MD3 kit", "Our kit"));
  assert.deepEqual(project.run().files, { changed: [INDEX], whitespace: [] });
  project.edit(THEME, (text) => text.replace("MD3 color scheme", "Our colours"));
  assert.deepEqual(project.run().files, { changed: [INDEX, THEME], whitespace: [] });
  // A file the CLI lands as it is has one form only: its opening comment
  // taken out is an edit.
  const other = install(t);
  other.edit(THEME, (text) => text.replace(/^\/\*[\s\S]*?\*\/\s*/, ""));
  other.edit(`${UI}/changed.mjs`, (text) => text.replace(/\/\*[\s\S]*?\*\/\s*/, ""));
  assert.deepEqual(other.run().files, {
    changed: [`${UI}/changed.mjs`, THEME],
    whitespace: [],
  });
});

/* ---- what a project holds ---------------------------------------------- */

test("`@ds/ds` alone: the items it does not bring are named once, no file is listed, exit 0", (t) => {
  const project = install(t, { without: OPTIONAL });
  const { status, stdout, stderr, files, missing, behind } = project.run();
  assert.equal(stderr, "");
  assert.deepEqual(files, NOTHING);
  assert.deepEqual(missing, []);
  assert.deepEqual(behind, []);
  const line = `Not installed, and no finding: ${OPTIONAL.map((i) => `@ds/${i}`).join(", ")}.`;
  assert.equal(stdout.split("\n").filter((l) => l === line).length, 1, stdout);
  assert.deepEqual(OPTIONAL, [
    "next-adapter",
    "preset-editorial",
    "react-hook-form-adapter",
    "react-router-adapter",
  ]);
  // No file of theirs is named, and they are not counted as looked for.
  assert.ok(!stdout.includes("adapters/"), stdout);
  assert.match(
    stdout,
    new RegExp(`^Kit \\S+: none of the ${Object.keys(record.kit).length + Object.keys(record.project).length - OPTIONAL.length} recorded files differs`),
  );
  assert.ok(stdout.endsWith(`\nTo update, from a clean working tree: ${UPDATE}\n`), stdout);
  assert.equal(status, 0);

  // `--missing` names each of their files, with its item, as not installed.
  const named = project.run("--missing");
  assert.deepEqual(named["not here"], [
    `${UI}/adapters/next.tsx  @ds/next-adapter, not installed`,
    `${UI}/tokens/preset-editorial.css  @ds/preset-editorial, not installed`,
    `${UI}/adapters/react-hook-form.tsx  @ds/react-hook-form-adapter, not installed`,
    `${UI}/adapters/react-router.tsx  @ds/react-router-adapter, not installed`,
  ]);
  assert.equal(named.status, 0);
});

test("an adapter the project holds, its file deleted: the file under `missing`, exit 1", (t) => {
  const project = install(t, { without: OPTIONAL.filter((i) => i !== NEXT) });
  assert.equal(project.run().status, 0);
  rmSync(join(project.root, UI, "adapters/next.tsx"));
  const { status, stdout, files, missing } = project.run();
  assert.deepEqual(files, NOTHING);
  assert.deepEqual(missing, [`${UI}/adapters/next.tsx`]);
  assert.match(stdout, /^Kit \S+: 1 of \d+ recorded files differ/);
  // The other three are still said once, as not installed.
  assert.match(stdout, /\nNot installed, and no finding: @ds\/preset-editorial, @ds\/react-hook-form-adapter, @ds\/react-router-adapter\.\n/);
  // It is held, so the update takes it.
  assert.ok(stdout.endsWith(`: ${updateCommand([NEXT])}\n`), stdout);
  assert.equal(status, 1);
  assert.deepEqual(project.run("--missing")["not here"].slice(0, 1), [
    `${UI}/adapters/next.tsx  @ds/next-adapter, installed: missing`,
  ]);
});

test("a file of the whole install that is not there is under `missing`, exit 1", (t) => {
  const project = install(t);
  rmSync(join(project.root, TAG));
  const { status, files, missing } = project.run();
  assert.deepEqual(files, NOTHING);
  assert.deepEqual(missing, [TAG]);
  assert.equal(status, 1);
  assert.deepEqual(project.run("--missing")["not here"], [
    `${TAG}  @ds/ds, the whole install: missing`,
  ]);
});

/** The project with one adapter, as an update that named only `@ds/ds` left
    it: the adapter's file and its record are an earlier release's. */
function leftBehind(t) {
  const project = install(t, { without: OPTIONAL.filter((i) => i !== NEXT) });
  const older = `${readFileSync(join(kit, "adapters/next.tsx"), "utf8")}\n// as 0.2.0 had it\n`;
  writeFileSync(join(project.root, UI, "adapters/next.tsx"), older);
  writeFileSync(
    join(project.root, UI, itemRecord(NEXT)),
    JSON.stringify({ item: NEXT, version: "0.2.0", kit: { "adapters/next.tsx": digests(older) } }),
  );
  return project;
}

test("an adapter left at an earlier release is named as behind, with the command that takes it", (t) => {
  const project = leftBehind(t);
  const { status, stdout, files, missing, behind } = project.run();
  // Its file is what its own release had: no edit, so not `changed`.
  assert.deepEqual(files, NOTHING);
  assert.deepEqual(missing, []);
  assert.deepEqual(behind, ["@ds/next-adapter  0.2.0"]);
  assert.match(stdout, new RegExp(`\\nbehind \\(installed from another release than ${record.version.replaceAll(".", "\\.")}, `));
  assert.ok(
    stdout.endsWith("\nTo update, from a clean working tree: npx shadcn add @ds/ds @ds/next-adapter --overwrite -y\n"),
    stdout,
  );
  assert.equal(status, 0);
  // Edited since its own release: behind, and `changed` too.
  project.edit(`${UI}/adapters/next.tsx`, (text) => `${text}// mine\n`);
  const edited = project.run();
  assert.deepEqual(edited.files, { changed: [`${UI}/adapters/next.tsx`], whitespace: [] });
  assert.deepEqual(edited.behind, ["@ds/next-adapter  0.2.0"]);
  assert.equal(edited.status, 1);
});

test("an adapter with no record of its own (installed at 0.3.0) is held, and compared with the whole install's", (t) => {
  const project = install(t, { without: OPTIONAL.filter((i) => i !== NEXT) });
  rmSync(join(project.root, UI, itemRecord(NEXT)));
  const same = project.run();
  assert.deepEqual(same.files, NOTHING);
  assert.ok(same.stdout.endsWith(`: ${updateCommand([NEXT])}\n`), same.stdout);
  assert.ok(!same.stdout.includes("may be behind"), same.stdout);
  assert.equal(same.status, 0);
  // Differing: listed, with the one thing the check cannot tell.
  project.edit(`${UI}/adapters/next.tsx`, (text) => `${text}// another release's, or mine\n`);
  const differs = project.run();
  assert.deepEqual(differs.files, { changed: [`${UI}/adapters/next.tsx`], whitespace: [] });
  assert.match(
    differs.stdout,
    /\n@ds\/next-adapter: installed before the item brought a record of its own, .* it may be behind, not edited\.\n/,
  );
  assert.equal(differs.status, 1);
});

test("a record of the 0.3.0 shape, with no item named: a file not here is counted, and `--missing` names it", (t) => {
  const project = install(t, { without: OPTIONAL });
  project.edit(`${UI}/${RECORD}`, (text) => {
    const { optional, ...old } = JSON.parse(text);
    assert.ok(optional);
    return JSON.stringify(old);
  });
  rmSync(join(project.root, TAG));
  const { status, stdout, files, missing } = project.run();
  assert.deepEqual(files, NOTHING);
  assert.deepEqual(missing, []);
  assert.match(stdout, /\n5 recorded file\(s\) are not here, removed or never installed: --missing names them\.\n/);
  assert.match(stdout, /\nThis record names no optional item: add to that command each adapter or preset the project holds /);
  assert.ok(!stdout.includes("Tag.tsx"));
  assert.equal(status, 0);
  const named = project.run("--missing");
  assert.deepEqual(named["not here"], [
    `${UI}/adapters/next.tsx`,
    `${UI}/adapters/react-hook-form.tsx`,
    `${UI}/adapters/react-router.tsx`,
    TAG,
    `${UI}/tokens/preset-editorial.css`,
  ]);
  assert.equal(named.status, 0);
});

test("an option it does not know: the usage, exit 2", (t) => {
  const { status, stdout, stderr } = install(t).run("--mising");
  assert.equal(stdout, "");
  assert.match(stderr, /^Unknown option --mising\.\nUsage: node changed\.mjs \[--missing\]/);
  assert.equal(status, 2);
});

test("a project whose CLI rewrites the files as it installs them: it cannot tell, exit 2", (t) => {
  for (const [config, named] of [
    [{ tsx: false }, "`tsx: false`"],
    [{ tsx: true, tailwind: { prefix: "tw" } }, "a Tailwind `prefix`"],
    [{ tsx: true, tailwind: { cssVariables: false } }, "`cssVariables: false`"],
  ]) {
    const { status, stdout, stderr } = install(t, { config }).run();
    assert.equal(stdout, "");
    assert.ok(stderr.startsWith(`components.json has ${named}: `), stderr);
    assert.match(stderr, /cannot tell which you changed\. Update as before: /);
    assert.equal(status, 2);
  }
  // An empty prefix and the defaults rewrite nothing.
  const plain = install(t, {
    config: { tsx: true, tailwind: { prefix: "", cssVariables: true } },
  }).run();
  assert.equal(plain.status, 0);
});

test("with no components.json above it, the kit's folder is checked and the skills are said unread", (t) => {
  const project = install(t, { config: null });
  project.edit(TAG, (text) => `${text}// mine\n`);
  project.edit(".claude/skills/ds-build/SKILL.md", (text) => `${text}\nOurs.\n`);
  const { status, files, stdout } = project.run();
  assert.deepEqual(files, { changed: [TAG], whitespace: [] });
  assert.match(stdout, new RegExp(`\\n${Object.keys(record.project).length} recorded file\\(s\\) of the project's root \\(the skills\\) were not looked at: no components\\.json above `));
  assert.equal(status, 1);
});

test("it writes nothing", (t) => {
  const project = install(t);
  project.edit(TAG, (text) => `${text}// mine\n`);
  const before = spawnSync("find", [project.root, "-type", "f", "-newer", join(project.root, TAG)], { encoding: "utf8" }).stdout;
  const stamp = readFileSync(join(project.root, TAG), "utf8");
  project.run();
  assert.equal(readFileSync(join(project.root, TAG), "utf8"), stamp);
  assert.equal(
    spawnSync("find", [project.root, "-type", "f", "-newer", join(project.root, TAG)], { encoding: "utf8" }).stdout,
    before,
  );
});

/* ---- the entry CSS that keeps utils.ts out of the scan ----------------- */

const CSS = "src/styles/globals.css";
const withCss = { rsc: true, tsx: true, tailwind: { css: CSS } };
const unscanned = (path, line) =>
  `${path}:${line} keeps utils.ts out of Tailwind's scan, so no kit control draws its focus ring: the ring's classes are written only in utils.ts (focusRing). Remove that line.`;

/** An install whose `components.json` names `src/styles/globals.css`,
    holding `css`. */
function installWithCss(t, css, config = withCss) {
  const project = install(t, { config });
  mkdirSync(join(project.root, dirname(CSS)), { recursive: true });
  writeFileSync(join(project.root, CSS), css);
  return project;
}

test("an entry CSS that keeps utils.ts out of the scan is named, with the line to remove; the exit code is the files'", (t) => {
  const project = installWithCss(
    t,
    [
      '@import "tailwindcss";',
      '@import "../components/ui/ds/tokens/theme.v4.css";',
      '@source not "../components/ui/ds/tokens";',
      '@source not "../components/ui/ds/utils.ts";',
      "",
    ].join("\n"),
  );
  const clean = project.run();
  assert.ok(clean.stdout.includes(`\n${unscanned(CSS, 4)}\n`), clean.stdout);
  assert.equal(clean.status, 0);
  project.edit(TAG, (text) => `${text}// mine\n`);
  const edited = project.run();
  assert.ok(edited.stdout.includes(unscanned(CSS, 4)), edited.stdout);
  assert.equal(edited.status, 1);
});

test("the kit's folder, or one above it, kept out is named too: it holds utils.ts", (t) => {
  for (const [source, written] of [
    ["../components/ui/ds", '@source not "../components/ui/ds";'],
    ["../components/ui/ds/", "@source not '../components/ui/ds/' ;"],
    ["../components", '  @source  not  "../components";'],
  ]) {
    const { stdout } = installWithCss(t, `@import "tailwindcss";\n${written}\n`).run();
    assert.ok(stdout.includes(unscanned(CSS, 2)), `${source}: ${stdout}`);
  }
});

test("the exclusions the README gives, a line in a comment and another folder's utils.ts are not named", (t) => {
  const css = [
    '@import "tailwindcss";',
    '@source not "../components/ui/ds/tokens";',
    '@source not "../components/ui/ds/releases";',
    '@source not "../components/ui/ds/DESIGN.md";',
    '@source not "../components/ui/ds/RELEASE.json";',
    '@source not "../components/ui/ds/changed.mjs";',
    '@source not "../components/ui/ds/LICENSE";',
    '/* @source not "../components/ui/ds/utils.ts"; */',
    "/*",
    '@source not "../components/ui/ds";',
    "*/",
    '@source not "../lib/utils.ts";',
    '@source not "../components/ui/ds/utils.tsx";',
    '@source "../components/ui/ds/utils.ts";',
    '@source not inline("focus-visible:outline-3");',
    "",
  ].join("\n");
  const { stdout, status } = installWithCss(t, css).run();
  assert.ok(!stdout.includes("keeps utils.ts out"), stdout);
  assert.equal(status, 0);
});

test("no entry CSS named, or none where it is named: nothing is said of the scan", (t) => {
  const named = install(t).run();
  assert.ok(!named.stdout.includes("keeps utils.ts out"), named.stdout);
  const missing = install(t, { config: withCss }).run();
  assert.ok(!missing.stdout.includes("keeps utils.ts out"), missing.stdout);
  assert.equal(missing.stderr, "");
  assert.equal(missing.status, 0);
});

test("unscannedUtils: pure, the CSS and the two places in, each excluding line out", () => {
  const kit = "/p/src/components/ui/ds";
  const css = '@import "tailwindcss";\n@source not "../components/ui/ds/utils.ts";\n@source not "../components/ui/ds/tokens";\n@source not "/p/src/components/ui/ds";\n';
  assert.deepEqual(unscannedUtils({ css, cssPath: "/p/src/styles/globals.css", kit }), [2, 4]);
  assert.deepEqual(unscannedUtils({ css, cssPath: "/p/app/globals.css", kit }), [4]);
  assert.deepEqual(unscannedUtils({ css: "", cssPath: "/p/a.css", kit }), []);
});

/* ---- the digests ------------------------------------------------------- */

test("digests: line ends and a BOM are not a difference, a comment on top is", () => {
  const text = '"use client";\n\nimport x from "y";\n\nexport const a = "b c";\n';
  const same = (other) => assert.deepEqual(digests(other), digests(text), other);
  same(text.replace(/\n/g, "\r\n"));
  same(`\uFEFF${text}`);
  const { exact, loose } = digests(text);
  // Layout alone moves `exact` only.
  const laid = digests(text.replace("export const", "export\n  const"));
  assert.notEqual(laid.exact, exact);
  assert.equal(laid.loose, loose);
  // A character moves both; so does the directive taken out, and a comment
  // wherever it is put, the file's top included.
  for (const edited of [
    text.replace("b c", "b d"),
    text.replace('"use client";\n\n', ""),
    text.replace('import x from "y";', '// mine\nimport x from "y";'),
    `/* a header */\n// and a line\n\n${text}`,
    `// @ts-nocheck\n${text}`,
    `/// <reference path="./x.d.ts" />\n${text}`,
  ]) {
    assert.notEqual(digests(edited).loose, loose, edited);
    assert.notEqual(digests(edited).exact, exact, edited);
  }
});

test("landedText: a source that opens with a comment has a second form, no other file has", () => {
  const text = '"use client";\n\nexport const a = 1;\n';
  assert.equal(landedText(`/* a header */\n// and a line\n\n${text}`, "a.tsx"), text);
  assert.equal(landedText(`\n// a line\r\n${text}`, "a.ts"), text);
  assert.equal(landedText(`// only a comment`, "a.ts"), "");
  // Nothing before the first token: one form.
  assert.equal(landedText(text, "a.tsx"), null);
  assert.equal(landedText("export const a = 1; // after\n", "a.ts"), null);
  // A file the CLI lands as it is: one form, whatever it opens with.
  for (const path of ["a.css", "a.md", "a.mjs", "LICENSE", "a.json"]) {
    assert.equal(landedText(`/* a header */\n${text}`, path), null, path);
  }
});

test("compare: pure, the record and a reader in, the two groups out", () => {
  const entry = (text, path) => {
    const landed = landedText(text, path);
    return landed === null ? digests(text) : { ...digests(text), landed: digests(landed) };
  };
  const then = {
    kit: {
      "a.ts": entry("a\n", "a.ts"),
      "b.ts": entry("b\n", "b.ts"),
      "c.ts": entry("c\n", "c.ts"),
      "d.ts": entry("// d\nd;\n", "d.ts"),
      "e.ts": entry("// e\ne;\n", "e.ts"),
      "f.ts": entry("// f\nf;\n", "f.ts"),
      "g.ts": entry("// g\ng;\n", "g.ts"),
    },
    project: { "s.md": entry("s\n", "s.md") },
  };
  assert.deepEqual(Object.keys(then.kit["d.ts"]), ["exact", "loose", "landed"]);
  assert.deepEqual(Object.keys(then.kit["a.ts"]), ["exact", "loose"]);
  const texts = {
    kit: {
      "a.ts": "a2\n",
      "b.ts": "b\n\n",
      // As the kit writes it, as the CLI lands it: unchanged, both.
      "d.ts": "// d\nd;\n",
      "e.ts": "e;\n",
      // The landed form laid out again; the landed form under a new comment.
      "f.ts": "f ;\n",
      "g.ts": "// mine\ng;\n",
    },
    project: { "s.md": "s\n" },
  };
  assert.deepEqual(
    compare({ record: then, read: (group, path) => texts[group][path] ?? null }),
    {
      changed: [["kit", "a.ts"], ["kit", "g.ts"]],
      whitespace: [["kit", "b.ts"], ["kit", "f.ts"]],
      missing: [["kit", "c.ts"]],
      behind: [],
      absent: [],
      held: [],
      unrecorded: [],
      grouped: false,
      unread: 0,
      recorded: 8,
    },
  );
});

test("compare: an optional item is absent, held, behind or unrecorded by what is on disk", () => {
  const then = {
    version: "2.0.0",
    kit: {
      "a.ts": digests("a\n"),
      "x/one.ts": digests("one\n"),
      "x/two.ts": digests("two\n"),
      "x/three.ts": digests("three\n"),
      "x/four.ts": digests("four\n"),
    },
    project: {},
    optional: { one: ["x/one.ts"], two: ["x/two.ts"], three: ["x/three.ts"], four: ["x/four.ts"] },
  };
  const own = (item, version, files) =>
    JSON.stringify({ item, version, kit: Object.fromEntries(files.map(([p, t]) => [p, digests(t)])) });
  const texts = {
    "a.ts": "a\n",
    // one: nothing of it here. two: its record at an earlier release, its
    // file as that release had it. three: its record, and no file. four: a
    // file, and no record.
    [itemRecord("two")]: own("two", "1.0.0", [["x/two.ts", "two, before\n"]]),
    "x/two.ts": "two, before\n",
    [itemRecord("three")]: own("three", "2.0.0", [["x/three.ts", "three\n"]]),
    "x/four.ts": "four, edited or older\n",
  };
  assert.deepEqual(compare({ record: then, read: (_, path) => texts[path] ?? null }), {
    changed: [["kit", "x/four.ts"]],
    whitespace: [],
    missing: [["kit", "x/three.ts"]],
    behind: [{ item: "two", version: "1.0.0" }],
    absent: ["one"],
    held: ["four", "three", "two"],
    unrecorded: ["four"],
    grouped: true,
    unread: 0,
    recorded: 4,
  });
  // A record that is not one does not make an item held.
  assert.deepEqual(
    compare({ record: then, read: (_, path) => (path === itemRecord("one") ? "{" : null) }).absent,
    ["four", "one", "three", "two"],
  );
});

/* ---- the record, as committed ------------------------------------------ */

/** An optional item's own record: carried by its item, recorded nowhere. */
const isItemRecord = (path) => OPTIONAL.some((item) => path === itemRecord(item));

test("RELEASE.json is what the build computes for every file the registry carries", () => {
  const expected = { kit: {}, project: {} };
  for (const { path, target } of registry.items.flatMap((i) => i.files ?? [])) {
    if (path === RECORD || isItemRecord(path)) continue;
    const [group, to] = target.startsWith("@ui/ds/")
      ? ["kit", target.slice("@ui/ds/".length)]
      : ["project", target.replace(/^~\//, "")];
    const text = readFileSync(join(kit, path), "utf8");
    const landed = landedText(text, to);
    expected[group][to] =
      landed === null ? digests(text) : { ...digests(text), landed: digests(landed) };
  }
  assert.deepEqual(record.kit, expected.kit);
  // The second form is kept for the files the CLI was seen to land without
  // their opening comment, and for no other.
  assert.deepEqual(
    Object.keys(record.kit).filter((p) => record.kit[p].landed),
    ["index.ts", "primitives/Typography.tsx"],
  );
  assert.deepEqual(
    Object.keys(record.project).filter((p) => record.project[p].landed),
    [],
  );
  assert.deepEqual(record.project, expected.project);
  assert.ok(Object.keys(record.kit).length > 60);
  assert.ok(Object.keys(record.project).every((p) => p.startsWith(".claude/skills/ds-")));
  assert.ok("changed.mjs" in record.kit);
  // It does not record itself, nor the optional items' own records.
  assert.ok(!(RECORD in record.kit));
  assert.deepEqual(Object.keys(record.kit).filter((p) => p.startsWith("releases/")), []);
  assert.equal(
    record.version,
    JSON.parse(readFileSync(join(kit, "package.json"), "utf8")).version,
  );
});

/* ---- the record, as the build here writes it ---------------------------- */

/** What the check expects of a file: the digests of its text, and of its
    second form where it has one. Computed here, not read from the build. */
const expectedOf = (text, landed) => {
  const second = landedText(text, landed);
  return second === null ? digests(text) : { ...digests(text), landed: digests(second) };
};

/** This repository's own registry build, run on a copy of the tree: what
    it wrote, and what the check expects for every file the registry it
    wrote names. The copy is removed when the test ends. */
function built(t, change = () => {}) {
  const copy = mkdtempSync(join(tmpdir(), "ds-build-"));
  t.after(() => rmSync(copy, { recursive: true, force: true }));
  const left = new Set(["node_modules", ".git", "r", "_site", "storybook-static"]);
  cpSync(kit, copy, {
    recursive: true,
    filter: (from) => from === kit || !left.has(from.slice(kit.length + 1)),
  });
  // The build must write both: neither is taken from the copy.
  rmSync(join(copy, RECORD));
  rmSync(join(copy, "registry.json"));
  rmSync(join(copy, "releases"), { recursive: true });
  change(copy);
  const { status, stderr } = spawnSync(
    process.execPath,
    ["scripts/build-registry.mjs"],
    { cwd: copy, encoding: "utf8" },
  );
  assert.equal(status, 0, stderr);
  const written = JSON.parse(readFileSync(join(copy, RECORD), "utf8"));
  const index = JSON.parse(readFileSync(join(copy, "registry.json"), "utf8"));
  const expected = { kit: {}, project: {} };
  for (const { path, target } of index.items.flatMap((i) => i.files ?? [])) {
    if (path === RECORD || isItemRecord(path)) continue;
    const [group, to] = target.startsWith("@ui/ds/")
      ? ["kit", target.slice("@ui/ds/".length)]
      : ["project", target.replace(/^~\//, "")];
    expected[group][to] = expectedOf(readFileSync(join(copy, path), "utf8"), to);
  }
  return { copy, written, index, expected };
}

test("the build here writes the record the check expects, for every file the registry names", (t) => {
  const { copy, written, index, expected } = built(t);
  assert.deepEqual(written.kit, expected.kit);
  assert.deepEqual(written.project, expected.project);
  assert.deepEqual(Object.keys(written), ["version", "kit", "project", "optional"]);
  // Every file of every item is in it, but itself and the items' own records.
  const named = index.items
    .flatMap((i) => i.files ?? [])
    .filter((f) => f.path !== RECORD && !isItemRecord(f.path));
  assert.ok(named.length > 60);
  assert.equal(
    Object.keys(written.kit).length + Object.keys(written.project).length,
    new Set(named.map((f) => f.target)).size,
  );
  // And it is the committed one, byte for byte, with the committed index.
  for (const path of [RECORD, "registry.json", ...OPTIONAL.map(itemRecord)]) {
    assert.equal(
      readFileSync(join(copy, path), "utf8"),
      readFileSync(join(kit, path), "utf8"),
      path,
    );
  }
  // The optional items are the ones `ds` does not reach, derived; each has
  // a record of its own: its name, this version, its files' digests.
  const reached = new Set();
  const reach = (name) => {
    if (reached.has(name)) return;
    reached.add(name);
    const found = index.items.find((i) => i.name === name);
    for (const d of found?.registryDependencies ?? []) reach(d.replace("@ds/", ""));
  };
  reach("ds");
  assert.deepEqual(
    Object.keys(written.optional),
    index.items.filter((i) => !reached.has(i.name) && i.files?.length).map((i) => i.name).sort(),
  );
  for (const [name, paths] of Object.entries(written.optional)) {
    assert.deepEqual(JSON.parse(readFileSync(join(copy, itemRecord(name)), "utf8")), {
      item: name,
      version: written.version,
      kit: Object.fromEntries(paths.map((path) => [path, written.kit[path]])),
    });
    const carried = index.items.find((i) => i.name === name).files;
    assert.deepEqual(
      carried.find((f) => f.path === itemRecord(name)),
      { path: itemRecord(name), type: "registry:file", target: `@ui/ds/${itemRecord(name)}` },
    );
    // No other item carries it: `ds` least of all.
    assert.equal(
      index.items.filter((i) => (i.files ?? []).some((f) => f.path === itemRecord(name))).length,
      1,
    );
  }
  // The check itself, on an install of what the build wrote, lists nothing.
  const all = index.items.flatMap((i) => i.files ?? []);
  assert.deepEqual(
    compare({
      record: written,
      read: (group, path) => {
        const file = all.find(
          (f) => f.target === (group === "kit" ? `@ui/ds/${path}` : `~/${path}`),
        );
        return readFileSync(join(copy, file.path), "utf8");
      },
    }),
    {
      changed: [],
      whitespace: [],
      missing: [],
      behind: [],
      absent: [],
      held: OPTIONAL,
      unrecorded: [],
      grouped: true,
      unread: 0,
      recorded: named.length,
    },
  );
});

test("one line changed in one kit file moves that file's digests in the record, and no other's", (t) => {
  const { written, expected } = built(t, (copy) => {
    const file = join(copy, "components/Tag.tsx");
    const before = readFileSync(file, "utf8");
    const after = before.replace("export ", "// ours\nexport ");
    assert.notEqual(after, before, "the fixture changed nothing");
    writeFileSync(file, after);
  });
  assert.deepEqual(written.kit, expected.kit);
  const moved = Object.keys(written.kit).filter(
    (path) => JSON.stringify(written.kit[path]) !== JSON.stringify(record.kit[path]),
  );
  assert.deepEqual(moved, ["components/Tag.tsx"]);
  assert.notEqual(written.kit["components/Tag.tsx"].exact, record.kit["components/Tag.tsx"].exact);
  assert.notEqual(written.kit["components/Tag.tsx"].loose, record.kit["components/Tag.tsx"].loose);
  assert.deepEqual(written.project, record.project);
  assert.equal(written.version, record.version);
});

test("the whole install alone carries the record; the check is an item of its own that it reaches", () => {
  const carrying = (path) =>
    registry.items
      .filter((i) => (i.files ?? []).some((f) => f.path === path))
      .map((i) => i.name);
  assert.deepEqual(carrying(RECORD), ["ds"]);
  assert.deepEqual(carrying("changed.mjs"), ["changed"]);
  const ds = registry.items.find((i) => i.name === "ds");
  assert.ok(ds.registryDependencies.includes("@ds/changed"));
  assert.equal(
    ds.files.find((f) => f.path === RECORD).target,
    `@ui/ds/${RECORD}`,
  );
  // Verbatim: a `registry:file` is not put through the CLI's transforms.
  for (const path of [RECORD, "changed.mjs"]) {
    const file = registry.items.flatMap((i) => i.files ?? []).find((f) => f.path === path);
    assert.equal(file.type, "registry:file");
  }
  // The check asks nothing of the registry: Node builtins only.
  const changed = registry.items.find((i) => i.name === "changed");
  assert.equal(changed.dependencies, undefined);
  assert.equal(changed.devDependencies, undefined);
  assert.deepEqual(
    [...readFileSync(join(kit, "changed.mjs"), "utf8").matchAll(/\bfrom "([^"]+)"/g)]
      .map((m) => m[1])
      .filter((s) => !s.startsWith("node:")),
    [],
  );
});
