/**
 * Every story's screenshot, compared to its committed baseline.
 *
 * After a story has rendered, played and passed axe (`vitest.config.ts`), the
 * page is compared to `screenshots/<preset>/<story-id>.<theme>.png`: once in
 * light, then once in dark, by switching the kit's theme class on `<html>`
 * after `play` rather than rendering the story again. A baseline cannot tell
 * right from wrong, only changed from unchanged: a part repainted by accident
 * fails its pull request, and a part repainted on purpose is re-baselined by
 * `npm run screenshots:update`.
 *
 * The comparison runs only where the baselines were made: the Playwright
 * image the CI runs in, which `scripts/screenshots.mjs` also runs, sets
 * `MD3_SCREENSHOTS`. Anywhere else a machine's fonts and rendering would make
 * every picture differ, so a plain `npm run test-storybook` compares none.
 *
 * What moves is held still: the page is compared under
 * `prefers-reduced-motion: reduce`, which the kit's moving parts honour, and
 * Playwright finishes any CSS animation or transition still running. The day
 * is held still too: see `PINNED_NOW` below. A story that still cannot be
 * drawn the same way twice is left out by the `no-screenshot` tag, with its
 * reason in `parameters.screenshot.reason`.
 */
import { afterEach, beforeAll, expect, inject, vi } from "vitest";
import { commands, page } from "vitest/browser";

declare module "vitest" {
  interface ProvidedContext {
    md3Screenshots: boolean;
  }
}

declare module "vitest/browser" {
  interface BrowserCommands {
    reducedMotion: (on: boolean) => Promise<void>;
    holdTheNetwork: () => Promise<void>;
    resetMousePosition: () => Promise<void>;
  }
}

type StoryInContext = {
  id: string;
  tags: string[];
  parameters: { screenshot?: { reason?: string } };
  play?: unknown;
};

const THEMES = ["light", "dark"] as const;

/**
 * The instant every story test runs at: noon, in the zone `vitest.config.ts`
 * gives the browser (UTC), in a month no story shows, so that only a story
 * that reads today draws today's outline. A story that reads
 * today (DatePicker's `Today`) then draws the same day on every run and every
 * machine, while Storybook for a person still shows the real today. Set here,
 * before a story file is imported, since a story's args may read the date
 * when its file loads; only `Date` is replaced, and it goes on from this
 * instant as time passes, so timers and waits run as they would.
 */
const PINNED_NOW = new Date("2026-03-15T12:00:00Z");
vi.useFakeTimers({ now: PINNED_NOW, toFake: ["Date"], shouldAdvanceTime: true });

beforeAll(async () => {
  if (inject("md3Screenshots")) await commands.holdTheNetwork();
});

afterEach(async (context) => {
  const story = (context as { story?: StoryInContext }).story;
  if (!story || !inject("md3Screenshots")) return;
  // A story that already failed has said what is wrong; a picture of it adds
  // nothing.
  if (context.task.result?.errors?.length) return;
  if (story.tags.includes("no-screenshot")) {
    if (!story.parameters.screenshot?.reason) {
      throw new Error(
        `${story.id} is tagged no-screenshot without saying why: give parameters.screenshot.reason`,
      );
    }
    return;
  }

  // Chromium on Linux sometimes leaves :hover on what rendered under the
  // pointer's last place: a story that plays nothing is drawn with no pointer
  // over it. A story that plays is drawn where its play left the pointer.
  if (!story.play) await commands.resetMousePosition();
  const html = document.documentElement;
  const theme = html.classList.contains("dark") ? "dark" : "light";
  await commands.reducedMotion(true);
  // Both themes are compared before the test fails, so a pull request shows
  // every picture that changed, not the first.
  const changed: unknown[] = [];
  try {
    for (const next of THEMES) {
      html.classList.remove(...THEMES);
      html.classList.add(next);
      await document.fonts.ready;
      await nextFrame();
      try {
        await expect
          .element(page.elementLocator(document.body))
          .toMatchScreenshot(`${story.id.replaceAll("--", "__")}/${next}`, {
            screenshotOptions: { animations: "disabled", caret: "hide", scale: "css" },
          });
      } catch (error) {
        changed.push(error);
      }
    }
  } finally {
    html.classList.remove(...THEMES);
    html.classList.add(theme);
    await commands.reducedMotion(false);
  }
  if (changed.length === 1) throw changed[0];
  if (changed.length) {
    throw new Error(changed.map((e) => (e instanceof Error ? e.message : String(e))).join("\n\n"));
  }
});

function nextFrame() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}
