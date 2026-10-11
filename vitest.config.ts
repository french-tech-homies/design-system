import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The kit's quality net: every story is a test.
 *
 * `storybookTest` turns each story in `stories/` into a Vitest test — it
 * renders the story and, where the story has one, runs its `play` function.
 * `@storybook/addon-a11y` is configured in `.storybook/preview.ts` with
 * `test: "error"`, so axe runs against every rendered story too and a
 * violation fails the run.
 *
 * It runs in a real Chromium through Playwright rather than jsdom, for two
 * reasons that matter here: React Aria's overlays, focus management and
 * pointer handling need a real browser to behave like the product, and axe
 * cannot check colour contrast without layout.
 *
 *     npm run test-storybook
 *     npm run test-storybook -- --project=material
 *     npm run test-storybook -- --project=editorial
 *
 * The plain command runs the whole catalog under both identities; `--project`
 * runs one at a time, which halves the resident cost (6 Chromium processes
 * rather than 12) but not the wall clock — the two identities already run
 * side by side. See `fileParallelism` below for what the full run costs.
 */
export default defineConfig({
  plugins: [
    storybookTest({ configDir: path.join(dirname, ".storybook") }),
  ],
  test: {
    // One browser, one tab, per project. Left to itself Vitest's browser pool
    // opens `min(12, cores - 1)` tabs *per project* (`createBrowserPool` →
    // `getThreadsCount`), so on a 16-core box the run is 24 headless Chromium
    // tabs at once — which is how a pair of these runs took a 20 GB WSL box
    // down on 2026-08-28.
    //
    // Measured on that box, warm Vite cache, 104 files / 664 tests, peak
    // sampled every 2 s:
    //
    //     setting                  wall   chromium procs (tabs)   peak RAM
    //     default                   21s   34 (24)                  17.6 GB
    //     maxWorkers: 2             28s   14  (4)                   6.9 GB
    //     fileParallelism: false    37s   12  (2)                   5.6 GB
    //
    // 1.8x the wall clock for a third of the memory, and a cost that no
    // longer scales with the core count. `maxWorkers` is the knob to reach
    // for if that ever gets too slow — but set it *here*, not on the CLI:
    // the browser pool reads it off the project's own config, so a
    // `--maxWorkers` flag silently leaves the run unbounded.
    fileParallelism: false,
    // One project per identity. A component that is only accessible under the
    // Material palette is not accessible: the Editorial preset is a different
    // contrast profile and a different field anatomy, so axe has to see both.
    projects: [
      {
        extends: true,
        test: {
          name: "material",
        },
      },
      {
        extends: true,
        // `preview.ts` turns this into `initialGlobals.preset`, which its
        // preset decorator reads — the same path the toolbar switch takes.
        define: { __MD3_PRESET__: JSON.stringify("editorial") },
        test: {
          name: "editorial",
        },
      },
    ],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
