#!/usr/bin/env node
/* =============================================================================
   Every component index.ts exports carries its doc comment

     node scripts/check-docs.mjs
     npm run docs:check                 # the same rule, as tests

   A doc comment describes a component in an editor's hover and in the types
   a project generates only when it sits on the exported declaration. One
   left on a `styles` const above it, or detached by a blank line and another
   declaration, describes nothing a reader sees. This reads `index.ts`'s
   exports with the TypeScript checker, as an editor does, and requires a doc
   comment on:

   - every component file's main export: the value `index.ts` exports from
     a file under components/ or primitives/ whose name is the file's
     (`components/Checkbox.tsx` → `Checkbox`);
   - the exports named in `ALSO`, whose comment the kit already holds though
     no file is named after them.

   `PENDING` names the main exports that have no doc comment yet, anywhere,
   to move: theirs is still to be written. One that gains a comment is
   refused until it leaves the list, so the list only shrinks.

   `readExports` takes texts that replace the kit's own, by path, so the rule
   checks in check-docs.check.mjs can hand it a kit with one comment moved
   off its component. Run from the kit's folder or from anywhere; the paths
   are the script's own.
   ========================================================================== */

import { dirname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const INDEX = "index.ts";
export const FOLDERS = ["components", "primitives"];

/** Exports held to the rule though no file bears their name. */
export const ALSO = ["SearchBar", "SearchView", "Focusable", "GlobeIcon"];

/** Main exports with no doc comment written yet: the rule's known gaps. */
export const PENDING = ["Dialog"];

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Every value `index.ts` exports, with the file it is declared in and its
 * doc comment as an editor shows it.
 *
 * @param {{ kit?: string, replace?: Record<string, string> }} [options]
 *   `replace` maps a kit path (`components/Badge.tsx`) to the text read in
 *   its place.
 * @returns {{ name: string, file: string, doc: string }[]}
 */
export function readExports({ kit = KIT, replace = {} } = {}) {
  const config = ts.getParsedCommandLineOfConfigFile(
    join(kit, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );
  const replaced = new Map(
    Object.entries(replace).map(([path, text]) => [join(kit, path), text]),
  );
  const host = ts.createCompilerHost(config.options);
  const readFile = host.readFile.bind(host);
  host.readFile = (file) => replaced.get(file) ?? readFile(file);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (file, language, ...rest) =>
    replaced.has(file)
      ? ts.createSourceFile(file, replaced.get(file), language, true)
      : getSourceFile(file, language, ...rest);

  const program = ts.createProgram([join(kit, INDEX)], config.options, host);
  const checker = program.getTypeChecker();
  const index = program.getSourceFile(join(kit, INDEX));
  return checker
    .getExportsOfModule(checker.getSymbolAtLocation(index))
    .map((symbol) => {
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      if (!(target.flags & ts.SymbolFlags.Value)) return undefined;
      const declared = target.declarations?.[0]?.getSourceFile().fileName;
      return {
        name: symbol.name,
        file: declared
          ? relative(kit, declared).split("\\").join("/")
          : "",
        doc: ts
          .displayPartsToString(target.getDocumentationComment(checker))
          .trim(),
      };
    })
    .filter(Boolean);
}

/** Whether the rule holds this export to a doc comment. */
export function heldToRule({ name, file }) {
  if (ALSO.includes(name)) return true;
  const [folder] = file.split("/");
  return (
    FOLDERS.includes(folder) &&
    posix.basename(file).replace(/\.tsx?$/, "") === name
  );
}

/**
 * @param {{ name: string, file: string, doc: string }[]} exports
 * @returns {string[]} what is wrong, empty when nothing is
 */
export function checkDocs(exports) {
  const problems = [];
  const names = new Set(exports.map((e) => e.name));
  for (const name of ALSO)
    if (!names.has(name)) problems.push(`${INDEX} does not export ${name}`);
  for (const e of exports.filter(heldToRule).sort((a, b) =>
    a.name.localeCompare(b.name),
  ))
    if (PENDING.includes(e.name)) {
      if (e.doc)
        problems.push(
          `${e.name} (${e.file}) has its doc comment now: take it out of PENDING in scripts/check-docs.mjs`,
        );
    } else if (!e.doc)
      problems.push(
        `${e.name} (${e.file}) has no doc comment on its exported declaration: an editor's hover and the generated types describe nothing`,
      );
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const exports = readExports();
  const problems = checkDocs(exports);
  if (problems.length) {
    console.error(`${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p}`);
    console.error(
      "\nPut the component's doc comment directly above its exported declaration, not above its styles.",
    );
    process.exit(1);
  }
  const held = exports.filter(heldToRule).length;
  console.log(
    `ok: ${held - PENDING.length} exported components carry their doc comment; still to write: ${PENDING.join(", ")}`,
  );
}
