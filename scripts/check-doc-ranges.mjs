/* =============================================================================
   The ranges the docs write are the ranges the kit is tested on

     npm run docs:check     # with scripts/check-doc-ranges.check.mjs

   README.md and every docs/*.md are read. Two things are held to kitRange
   (scripts/ranges.mjs), the range registry.json gives the same package:

   - every `name@range` written anywhere, as in the copy-the-folder install
     command of docs/installing.md;
   - every range on a "Tested against:" line, written `` `name` range ``. A
     version written in prose there ("React 19") is refused, since no package
     name says which range it should equal.

   A difference is refused naming the file, the line, the package and the
   range to write. The ranges stay written by hand: they sit in prose and in
   a command, and a check that names the fix reads simpler than markers and
   a generator.
   ========================================================================== */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { kitRange } from "./ranges.mjs";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The kit's package.json. */
export const readPackage = () =>
  JSON.parse(readFileSync(join(KIT, "package.json"), "utf8"));

/** README.md and every docs/*.md, each `{ path, text }`. */
export const readDocs = () =>
  [
    "README.md",
    ...readdirSync(join(KIT, "docs"))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => `docs/${f}`),
  ].map((path) => ({ path, text: readFileSync(join(KIT, path), "utf8") }));

// A range: an optional operator, then a version (1, 1.2, 1.2.3, -pre).
const RANGE = String.raw`(?:[\^~]|[<>]=?|=)?\d+(?:\.(?:\d+|x|\*))*(?:-[0-9A-Za-z.]+)?`;
// An npm name, scoped or not, not itself the tail of a longer word or path.
const NAME = String.raw`(?<![\w@/.-])((?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*)`;
const NAME_AT_RANGE = new RegExp(`${NAME}@(${RANGE})(?![\\w.])`, "g");
const TESTED = /Tested against:([\s\S]*?)(?:\.(?=\s|$)|\n\s*\n|$)/g;
const PAIR = new RegExp("`([^`]+)`\\s+(" + RANGE + ")", "g");

const lineAt = (text, index) => text.slice(0, index).split("\n").length;

/** Every difference between the ranges `docs` write and the kit's. */
export function checkDocRanges(docs, pkg) {
  const problems = [];
  for (const { path, text } of docs) {
    const at = (index) => `${path}:${lineAt(text, index)}`;

    for (const m of text.matchAll(NAME_AT_RANGE)) {
      const [, name, range] = m;
      const own = kitRange(pkg, name);
      if (own === undefined) {
        problems.push(
          `${at(m.index)}: ${name}@${range}, the kit declares no range for ${name}: ` +
            "add it to package.json or RANGES_OUTSIDE_PACKAGE (scripts/ranges.mjs), or do not write one",
        );
      } else if (range !== own) {
        problems.push(
          `${at(m.index)}: ${name}@${range}, write ${name}@${own}, the range the kit is tested on`,
        );
      }
    }

    for (const t of text.matchAll(TESTED)) {
      const body = t[1];
      const start = t.index + "Tested against:".length;
      for (const p of body.matchAll(PAIR)) {
        const [, name, range] = p;
        const own = kitRange(pkg, name);
        const where = at(start + p.index);
        if (own === undefined) {
          problems.push(
            `${where}: ${name} ${range} on the Tested against line, the kit declares no range for ${name}`,
          );
        } else if (range !== own) {
          problems.push(
            `${where}: ${name} ${range} on the Tested against line, write ${own}, the range the kit is tested on`,
          );
        }
      }
      const rest = body
        .replace(PAIR, "")
        .split(/,|\band\b/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const left of rest) {
        problems.push(
          `${at(start + body.indexOf(left))}: "${left}" on the Tested against line: ` +
            "write each as `name` range, the package and the range the kit declares",
        );
      }
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkDocRanges(readDocs(), readPackage());
  for (const p of problems) console.error(p);
  process.exit(problems.length ? 1 : 0);
}
