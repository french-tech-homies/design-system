#!/usr/bin/env node
/**
 * The baselines in `screenshots/` are the catalog's, one for one: every story
 * the story tests run has its four pictures (light and dark, under each
 * preset), and no picture is left behind by a story renamed or removed.
 *
 *     node scripts/check-screenshots.mjs storybook-static/index.json
 *
 * Reads the index `npm run build-storybook` writes, so the CI runs it after
 * the build. A missing picture also fails its story's comparison; a picture
 * left behind fails nowhere else.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const PRESETS = ["material", "editorial"];
export const THEMES = ["light", "dark"];

/** The ids of the stories whose pictures are compared. */
export function comparedStories(index) {
  return Object.values(index.entries)
    .filter((e) => e.type === "story" && e.tags.includes("test") && !e.tags.includes("no-screenshot"))
    .map((e) => e.id);
}

/** What is missing and what is left behind, as paths under `screenshots/`. */
export function compare(ids, files) {
  const expected = new Set(
    ids.flatMap((id) => PRESETS.flatMap((p) => THEMES.map((t) => `${p}/${id}.${t}.png`))),
  );
  const present = new Set(files);
  return {
    missing: [...expected].filter((f) => !present.has(f)).sort(),
    orphaned: [...present].filter((f) => !expected.has(f)).sort(),
  };
}

function listed(dir) {
  return PRESETS.flatMap((p) =>
    existsSync(join(dir, p)) ? readdirSync(join(dir, p)).map((f) => `${p}/${f}`) : [],
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [indexPath] = process.argv.slice(2);
  if (!indexPath) {
    console.error("usage: node scripts/check-screenshots.mjs <storybook-static/index.json>");
    process.exit(2);
  }
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const ids = comparedStories(JSON.parse(readFileSync(indexPath, "utf8")));
  const { missing, orphaned } = compare(ids, listed(join(root, "screenshots")));
  for (const f of missing) console.error(`missing: screenshots/${f} (npm run screenshots:update)`);
  for (const f of orphaned) console.error(`no story: screenshots/${f} (delete it)`);
  if (missing.length || orphaned.length) process.exit(1);
  console.log(`${ids.length} stories, ${ids.length * PRESETS.length * THEMES.length} baselines, none left behind`);
}
