#!/usr/bin/env node
/* =============================================================================
   Every generated registry item must carry the kit's current version

     node scripts/check-registry-version.mjs <built registry folder>
     npm run registry:check-version

   `package.json` `version` is the only source of truth. The registry stamps
   it into each item's `meta.version` (scripts/build-registry.mjs), so a
   consumer can tell which release their copy came from — and so a version
   bump that was never followed by `npm run registry:build` cannot merge.

   The built folder is the one `shadcn build` wrote (`registry:build`'s
   `--output`), given as the one argument and resolved from the kit's folder.
   ========================================================================== */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const kit = dirname(dirname(fileURLToPath(import.meta.url)));

const version = JSON.parse(
  readFileSync(join(kit, "package.json"), "utf8"),
).version;

const arg = process.argv[2];
if (!arg) {
  console.error(
    "usage: node scripts/check-registry-version.mjs <built registry folder>",
  );
  process.exit(1);
}
const built = resolve(kit, arg);
const shown = relative(kit, built) || ".";
if (!existsSync(built)) {
  console.error(`error: ${built} does not exist — run 'npm run registry:build'`);
  process.exit(1);
}

const problems = [];

/** Items live in registry.json's `items[]` and in one file each in the built folder. */
const source = JSON.parse(readFileSync(join(kit, "registry.json"), "utf8"));
for (const item of source.items) {
  if (item.meta?.version !== version) {
    problems.push(
      `registry.json: item "${item.name}" is v${item.meta?.version ?? "—"}`,
    );
  }
}

const files = readdirSync(built)
  .filter((f) => f.endsWith(".json") && f !== "registry.json")
  .sort();
if (files.length === 0) problems.push(`${built} has no item files`);

for (const f of files) {
  const item = JSON.parse(readFileSync(join(built, f), "utf8"));
  if (item.meta?.version !== version) {
    problems.push(`${shown}/${f}: v${item.meta?.version ?? "—"}`);
  }
}

if (problems.length) {
  console.error(
    `the kit is v${version}, but ${problems.length} generated item(s) disagree:`,
  );
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  if (problems.length > 20) console.error(`  … and ${problems.length - 20} more`);
  console.error(
    "\nRun 'npm run registry:build' and commit the result (see CHANGELOG.md, \"Releasing\").",
  );
  process.exit(1);
}

console.log(
  `ok: ${source.items.length} registry.json items and ${files.length} files in ${shown} all stamped v${version}`,
);
