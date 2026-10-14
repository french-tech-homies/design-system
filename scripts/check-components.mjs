#!/usr/bin/env node
/* =============================================================================
   Every component is Material's or one of the kit's own, and says which

     node scripts/check-components.mjs
     npm run registry:check-install     # the same rules, as tests

   The kit is Material 3's implementation. Beside what Material's
   specification describes it ships a named group of components of its own,
   Material-derived, each joining on a project's need, named in one place: the list in README.md between `<!-- own-components -->`
   and `<!-- /own-components -->`. This checks, on the README and the
   component files as they are in the kit, that:

   - the list is there, once, and names no component twice;
   - every name in the list has a file `<Name>.tsx` under components/, and that
     file carries the sentence "Material 3 does not describe this component.";
   - no other component file carries the sentence: a component joins the
     group in the README, by a change that names the project that needs it,
     or not at all;
   - every other component file cites a page of m3.material.io. A file that
     says neither is how a component ends up in the kit uncounted.

   And one rule on every source file under components/ and primitives/, style
   modules included: none names the mono face (`font-mono`, `--font-mono`,
   `--md-sys-typescale-mono-font`). It is a face a project reaches for and
   puts where it wants; a component that used it would change a screen that
   did not ask.

   `checkComponents` is pure (the README and the component files in, a list
   of problems out) so the rule checks in check-components.check.mjs can hand
   it a kit with one thing wrong. Run from the kit's folder or from anywhere;
   the paths are the script's own.
   ========================================================================== */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

export const README = "README.md";
export const COMPONENTS = "components";
export const OPEN = "<!-- own-components -->";
export const CLOSE = "<!-- /own-components -->";
export const SENTENCE = "Material 3 does not describe this component.";

const CITATION = /https:\/\/m3\.material\.io\/[a-z]/;

/** A file's text with each comment's line breaks and their ` * ` or `//`
    taken out, so a sentence wrapped over two comment lines is still found. */
const unwrapped = (text) => text.replace(/\s*\n\s*(?:\*(?!\/)|\/\/)?\s*/g, " ");

/** `components/color/ColorArea.tsx` → `ColorArea`. */
const nameOf = (path) => posix.basename(path, ".tsx");

/** The names the README's list holds, in order, or the reason it has none. */
function listed(readme) {
  const open = readme.indexOf(OPEN);
  const close = readme.indexOf(CLOSE);
  if (open < 0 || close < 0)
    return { problem: `${README}: no list between ${OPEN} and ${CLOSE}` };
  if (close < open)
    return { problem: `${README}: ${CLOSE} stands before ${OPEN}` };
  if (
    readme.indexOf(OPEN, open + 1) >= 0 ||
    readme.indexOf(CLOSE, close + 1) >= 0
  )
    return { problem: `${README}: more than one ${OPEN} … ${CLOSE} list` };
  const block = readme.slice(open + OPEN.length, close);
  return { names: [...block.matchAll(/`([^`]+)`/g)].map((m) => m[1]) };
}

/**
 * @param {{ readme: string, components: Record<string, string> }} kit
 *   `components` maps each `components/**\/*.tsx` path to its text.
 * @returns {string[]} what is wrong, empty when nothing is
 */
export function checkComponents({ readme, components }) {
  const { names, problem } = listed(readme);
  if (problem) return [problem];

  const problems = [];
  const where = `the list in ${README}`;
  const paths = Object.keys(components).sort();

  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) problems.push(`${where} names ${name} twice`);
    seen.add(name);
  }
  if (seen.size === 0) problems.push(`${where} names no component`);

  for (const name of seen) {
    const files = paths.filter((p) => nameOf(p) === name);
    if (files.length === 0) {
      problems.push(
        `${where} names ${name}, and there is no ${COMPONENTS}/**/${name}.tsx`,
      );
      continue;
    }
    for (const path of files) {
      if (!unwrapped(components[path]).includes(SENTENCE))
        problems.push(
          `${where} names ${name}, and ${path} does not say "${SENTENCE}"`,
        );
    }
  }

  for (const path of paths) {
    if (seen.has(nameOf(path))) continue;
    const text = unwrapped(components[path]);
    if (text.includes(SENTENCE))
      problems.push(
        `${path} says "${SENTENCE}" and ${where} does not name ${nameOf(path)}: a component joins the group there, by a change that names the project that needs it`,
      );
    else if (!CITATION.test(text))
      problems.push(
        `${path} neither cites a page of m3.material.io nor says "${SENTENCE}": every component is Material's or one of the group ${where} names`,
      );
  }

  return problems;
}

export const SOURCES = [COMPONENTS, "primitives"];

/** The mono face, by each name a source could reach it with: the utility,
    its variable, the kit's token. */
const MONO = /font-mono|typescale-mono-font/;

/**
 * @param {{ sources: Record<string, string> }} kit
 *   `sources` maps each `.ts` / `.tsx` path under components/ and primitives/
 *   to its text.
 * @returns {string[]} what is wrong, empty when nothing is
 */
export function checkMonoFace({ sources }) {
  return Object.keys(sources)
    .sort()
    .flatMap((path) =>
      sources[path]
        .split("\n")
        .map((line, at) => [line, at + 1])
        .filter(([line]) => MONO.test(line))
        .map(
          ([line, at]) =>
            `${path}:${at} names the mono face (\`${MONO.exec(line)[0]}\`): it is the project's to put where it wants, and no kit component uses it`,
        ),
    );
}

/** The README, every component file and every source a component is made of,
    as they are in the kit. */
export function readKit(kit = join(dirname(fileURLToPath(import.meta.url)), "..")) {
  const components = Object.fromEntries(
    readdirSync(join(kit, COMPONENTS), { recursive: true })
      .map((p) => posix.join(COMPONENTS, p.split("\\").join("/")))
      .filter((p) => p.endsWith(".tsx"))
      .sort()
      .map((p) => [p, readFileSync(join(kit, p), "utf8")]),
  );
  const sources = Object.fromEntries(
    SOURCES.flatMap((folder) =>
      readdirSync(join(kit, folder), { recursive: true })
        .map((p) => posix.join(folder, p.split("\\").join("/")))
        .filter((p) => /\.tsx?$/.test(p)),
    )
      .sort()
      .map((p) => [p, readFileSync(join(kit, p), "utf8")]),
  );
  return {
    readme: readFileSync(join(kit, README), "utf8"),
    components,
    sources,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const kit = readKit();
  const mono = checkMonoFace(kit);
  if (mono.length) {
    console.error(`${mono.length} problem(s):`);
    for (const p of mono) console.error(`  ${p}`);
    process.exit(1);
  }
  const problems = checkComponents(kit);
  if (problems.length) {
    console.error(
      `The components and the group ${README} names do not agree — ${problems.length} problem(s):`,
    );
    for (const p of problems) console.error(`  ${p}`);
    console.error(
      `\nA component of Material's cites its page in its doc comment. Anything else is in the group only once ${README} names it.`,
    );
    process.exit(1);
  }
  const own = listed(kit.readme).names.length;
  const all = Object.keys(kit.components).length;
  console.log(
    `ok: ${all} component files, ${own} the kit's own and named, ${all - own} citing Material`,
  );
}
