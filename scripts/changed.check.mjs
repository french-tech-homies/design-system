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

import { RECORD, UPDATE, compare, digests, landedText } from "../changed.mjs";

const kit = dirname(dirname(fileURLToPath(import.meta.url)));
const registry = JSON.parse(readFileSync(join(kit, "registry.json"), "utf8"));
const record = JSON.parse(readFileSync(join(kit, RECORD), "utf8"));

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
    named), as the CLI lands them. Removed when the test ends. */
function install(t, { only, config = { rsc: true, tsx: true } } = {}) {
  const root = mkdtempSync(join(tmpdir(), "ds-changed-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (config) {
    writeFileSync(join(root, "components.json"), JSON.stringify(config));
  }
  for (const item of registry.items) {
    if (only && !only.includes(item.name)) continue;
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
  const run = () => {
    const { status, stdout, stderr } = spawnSync(
      process.execPath,
      [`${UI}/changed.mjs`],
      { cwd: root, encoding: "utf8" },
    );
    return { status, stdout, stderr, files: listed(stdout) };
  };
  return { root, edit, run };
}

/** The files a run listed, by group. */
function listed(stdout) {
  const files = { changed: [], whitespace: [] };
  let group = null;
  for (const line of stdout.split("\n")) {
    const title = /^(changed|whitespace) \(/.exec(line);
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

test("a recorded file that is not there is counted, not listed", (t) => {
  const project = install(t);
  rmSync(join(project.root, TAG));
  rmSync(join(project.root, UI, "adapters"), { recursive: true });
  const { status, files, stdout } = project.run();
  assert.deepEqual(files, NOTHING);
  assert.match(stdout, /\n4 recorded file\(s\) are not here, removed or never installed: not listed\.\n/);
  assert.ok(!stdout.includes("Tag.tsx"));
  assert.equal(status, 0);
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
      missing: 1,
      unread: 0,
      recorded: 8,
    },
  );
});

/* ---- the record, as committed ------------------------------------------ */

test("RELEASE.json is what the build computes for every file the registry carries", () => {
  const expected = { kit: {}, project: {} };
  for (const { path, target } of registry.items.flatMap((i) => i.files ?? [])) {
    if (path === RECORD) continue;
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
  // It does not record itself.
  assert.ok(!(RECORD in record.kit));
  assert.equal(
    record.version,
    JSON.parse(readFileSync(join(kit, "package.json"), "utf8")).version,
  );
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
