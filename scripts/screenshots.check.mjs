/* =============================================================================
   Rule checks for the screenshot baselines (scripts/screenshots.mjs,
   scripts/check-screenshots.mjs, scripts/screenshots-report.mjs).

     npm run storybook:check     # node's test runner, with the serve checks

   No browser and no Docker here: the image a baseline is made in, the one
   the CI compares in, and what counts as a missing or left-behind picture.
   ========================================================================== */

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { compare, comparedStories } from "./check-screenshots.mjs";
import { failures } from "./screenshots-report.mjs";
import { imageFor } from "./screenshots.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFileSync(join(root, file), "utf8");

test("the baselines are made in the image the CI compares in", () => {
  const image = imageFor(JSON.parse(read("package.json")));
  const ci = read(".github/workflows/checks.yml").match(/^\s+image:\s*(\S+)\s*$/m)?.[1];
  assert.equal(ci, image, "checks.yml's container is not the image package.json's playwright pins");
});

test("the image follows the Playwright that is installed", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(lock.packages["node_modules/playwright"].version, pkg.devDependencies.playwright);
});

test("a Playwright range has no image: it is refused", () => {
  assert.throws(() => imageFor({ devDependencies: { playwright: "^1.60.0" } }), /not pinned/);
  assert.equal(
    imageFor({ devDependencies: { playwright: "1.60.0" } }),
    "mcr.microsoft.com/playwright:v1.60.0-noble",
  );
});

test("every compared story has four pictures, and no picture outlives its story", () => {
  const index = {
    entries: {
      "a--one": { type: "story", id: "a--one", tags: ["dev", "test"] },
      "a--moving": { type: "story", id: "a--moving", tags: ["dev", "test", "no-screenshot"] },
      "a--untested": { type: "story", id: "a--untested", tags: ["dev"] },
      "a--docs": { type: "docs", id: "a--docs", tags: ["dev", "test"] },
    },
  };
  const ids = comparedStories(index);
  assert.deepEqual(ids, ["a--one"]);
  const whole = ["material", "editorial"].flatMap((p) =>
    ["light", "dark"].map((t) => `${p}/a--one.${t}.png`),
  );
  assert.deepEqual(compare(ids, whole), { missing: [], orphaned: [] });
  assert.deepEqual(compare(ids, [...whole.slice(1), "material/a--gone.light.png"]), {
    missing: ["material/a--one.light.png"],
    orphaned: ["material/a--gone.light.png"],
  });
});

test("a failed comparison is found by its actual image, a story with no baseline by its new one", () => {
  const dir = mkdtempSync(join(tmpdir(), "md3-shots-"));
  mkdirSync(join(dir, "material"));
  for (const f of ["x--y.dark-actual.png", "x--y.dark-diff.png", "x--z.light-reference.png"]) {
    writeFileSync(join(dir, "material", f), "");
  }
  assert.deepEqual(failures(dir), [
    { preset: "material", name: "x--y.dark", actual: "x--y.dark-actual.png" },
    { preset: "material", name: "x--z.light", actual: "x--z.light-reference.png" },
  ]);
  assert.deepEqual(failures(join(dir, "none")), []);
});
