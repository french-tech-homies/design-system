import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { BrowserCommand } from "vitest/node";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where a preset's screenshots live: `screenshots/<preset>/<story-id>.<theme>.png`,
 * committed, and the actual and diff images of a failed comparison under
 * `.vitest-attachments/screenshots/`, which the CI keeps on a failure. See
 * `.storybook/screenshot.setup.ts`, and `scripts/screenshots.mjs` for the one
 * command that updates them.
 */
function screenshots(preset: string) {
  // The setup file names a picture `<story-id with "--" as "__">/<theme>`,
  // since Vitest's own name for it keeps only word characters and single
  // hyphens: a story id's `--` is written back here.
  const file = (dir: string, root: string, arg: string, ext: string) => {
    const [id = arg, theme] = arg.split("/");
    return path.join(root, dir, preset, `${id.replaceAll("__", "--")}.${theme}${ext}`);
  };
  type Data = { arg: string; ext: string; root: string };
  return {
    expect: {
      toMatchScreenshot: {
        resolveScreenshotPath: ({ arg, ext, root }: Data) => file("screenshots", root, arg, ext),
        resolveDiffPath: ({ arg, ext, root }: Data) =>
          file(".vitest-attachments/screenshots", root, arg, ext),
      },
    },
  };
}

/** Holds the page still for its screenshot: the kit's moving parts honour it. */
const reducedMotion: BrowserCommand<[on: boolean]> = async ({ page }, on) => {
  await page.emulateMedia({ reducedMotion: on ? "reduce" : "no-preference" });
};

/**
 * Holds the network still for the screenshots: a story's picture from another
 * site (the Card's and Carousel's photographs) is drawn as one fixed image,
 * and any other request leaving the test server is refused. A picture then
 * changes with the kit, never with what a host served that day.
 */
const PHOTO = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#7d8fa3"/><path d="M0 800 L1200 0 V800 Z" fill="#3d4a57"/></svg>`;
const held = new WeakSet<object>();
const holdTheNetwork: BrowserCommand<[]> = async ({ page, context }) => {
  if (held.has(context)) return;
  held.add(context);
  const origin = new URL(page.url()).origin;
  await context.route(
    (url) => /^https?:$/.test(url.protocol) && url.origin !== origin,
    (route) =>
      route.request().resourceType() === "image"
        ? route.fulfill({ contentType: "image/svg+xml", body: PHOTO })
        : route.abort(),
  );
};

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
 *
 * Inside the Playwright image (`MD3_SCREENSHOTS`, set by the CI and by
 * `npm run screenshots`), each story's page is also compared to its
 * baselines in `screenshots/`: see `screenshots()` above and
 * `.storybook/screenshot.setup.ts`.
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
    // Every story's screenshot, after it played and passed axe. Compared only
    // inside the Playwright image (`MD3_SCREENSHOTS`), where the baselines
    // were made: see `.storybook/screenshot.setup.ts`. An array, never a
    // string: `storybookTest` copies a string into its own list, the merge
    // adds it again, and every hook in it then runs twice.
    setupFiles: ["./.storybook/screenshot.setup.ts"],
    provide: { md3Screenshots: Boolean(process.env.MD3_SCREENSHOTS) },
    // One project per identity. A component that is only accessible under the
    // Material palette is not accessible: the Editorial preset is a different
    // contrast profile and a different field anatomy, so axe has to see both.
    projects: [
      {
        extends: true,
        test: {
          name: "material",
          browser: screenshots("material"),
        },
      },
      {
        extends: true,
        // `preview.ts` turns this into `initialGlobals.preset`, which its
        // preset decorator reads — the same path the toolbar switch takes.
        define: { __MD3_PRESET__: JSON.stringify("editorial") },
        test: {
          name: "editorial",
          browser: screenshots("editorial"),
        },
      },
    ],
    browser: {
      enabled: true,
      headless: true,
      // One zone for every run, so the day `screenshot.setup.ts` pins is the
      // same day wherever the tests run.
      provider: playwright({ contextOptions: { timezoneId: "UTC" } }),
      instances: [{ browser: "chromium" }],
      commands: { reducedMotion, holdTheNetwork },
    },
  },
});
