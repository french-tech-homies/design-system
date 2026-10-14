#!/usr/bin/env node
/**
 * After the story tests failed: each failed comparison's three pictures in one
 * place, for the reviewer and the owner to open from the pull request.
 *
 *     node scripts/screenshots-report.mjs
 *
 * Vitest leaves the actual and the diff image of a failed comparison under
 * `.vitest-attachments/screenshots/<preset>/` (`vitest.config.ts`), and the
 * picture of a story that had no baseline yet as `…-reference.png`; this puts
 * the expected one, the committed baseline, beside them as `…-expected.png`,
 * and lists the stories in the job's summary. The CI uploads the folder as
 * the run's `screenshots` artifact. A picture made on purpose and approved
 * there may become the baseline as it is: renamed to `<name>.png` under
 * `screenshots/<preset>/`.
 */
import { appendFileSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".vitest-attachments", "screenshots");

/**
 * `<story-id>.<theme>` of each failed comparison, by preset, and the picture
 * the run drew: `-actual` where a baseline differs, `-reference` where there
 * was none yet.
 */
export function failures(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((preset) =>
    readdirSync(join(dir, preset)).flatMap((actual) => {
      const drawn = actual.match(/^(.*)-(actual|reference)\.png$/);
      return drawn ? [{ preset, name: drawn[1], actual }] : [];
    }),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failed = failures(out);
  const lines = [];
  for (const { preset, name } of failed) {
    const baseline = join(root, "screenshots", preset, `${name}.png`);
    if (existsSync(baseline)) copyFileSync(baseline, join(out, preset, `${name}-expected.png`));
    lines.push(`- \`${preset}/${name}\`${existsSync(baseline) ? "" : " (no baseline yet)"}`);
  }
  const summary = failed.length
    ? [
        `### ${failed.length} screenshot${failed.length === 1 ? "" : "s"} changed`,
        "",
        "Each one's `-expected`, `-actual` and `-diff` images are in this run's `screenshots` artifact.",
        "A change made on purpose: `npm run screenshots:update -- <story file>`, and commit the pictures.",
        "",
        ...lines,
      ].join("\n")
    : "No screenshot comparison failed.";
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}
