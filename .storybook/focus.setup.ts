/**
 * Every tab stop of every story shows the keyboard's focus.
 *
 * After a story has rendered, played, passed axe and had its pictures taken
 * (`screenshot.setup.ts`), the page is walked as a keyboard user walks it:
 * Tab to each stop, and one arrow key inside a group that arrows move
 * through without selecting (a toolbar, a list, a grid). Each control
 * reached is read while it holds the focus and again once a key has moved
 * the focus on, and the two must differ:
 * `stories/interactions/visible-focus.ts` says how that is read.
 *
 * It walks what a story shows at rest. What exists only while something is
 * open (a menu's rows, a select's options) is asked the same question by a
 * `play` function, with `expectVisibleFocus`.
 *
 * The keys are real ones, pressed through the browser, and the pointer is
 * parked first: a ring follows `:focus-visible` and a state layer React
 * Aria's `data-focus-visible`, and a row under the pointer would pass on its
 * hover alone.
 *
 * Under one identity only: where an indicator is drawn is a component's
 * structure, the same under every preset, and its contrast is axe's and the
 * pictures' business.
 *
 * A story whose controls are not to be walked says so with the tag
 * `no-focus-check` and its reason in `parameters.focus.reason`.
 *
 * It is listed before `screenshot.setup.ts` in `vitest.config.ts`: hooks run
 * last-registered first, so this one runs after the pictures and cannot
 * change them.
 */
import { afterEach } from "vitest";
import { commands, userEvent } from "vitest/browser";

import {
  describeControl,
  focusReading,
  showsACaret,
} from "../stories/interactions/visible-focus";

declare const __MD3_PRESET__: string | undefined;

type StoryInContext = {
  id: string;
  tags: string[];
  parameters: { focus?: { reason?: string } };
};

/** Tab stops walked in one story: enough for any component's story, and a
    bound on a page-sized one. */
const MAX_STOPS = 12;

/**
 * Controls already seen to show focus, by how they are made: their slot and
 * their classes. A story file draws the same button dozens of times, and one
 * that is made the same way shows focus the same way. Only a pass is kept: a
 * miss is asked again wherever it is met.
 */
const passed = new Set<string>();
const madeLike = (el: Element) =>
  `${el.tagName}|${el.getAttribute("role") ?? ""}|${el.getAttribute("data-slot") ?? ""}|${el.getAttribute("class") ?? ""}|${el.parentElement?.getAttribute("class") ?? ""}`;

/**
 * The keys that move focus inside the group `el` belongs to and back, if it
 * is a group whose items are walked: one that arrows move through, and where
 * moving does not also select. In a tab list or a radio group the arrow
 * selects as it moves, so an item reached by it differs from itself a moment
 * later by its selection alone: there the item Tab lands on answers for the
 * group.
 */
function arrowsFor(el: Element): [string, string] | null {
  const group = el.closest(
    '[role="toolbar"],[role="listbox"],[role="grid"],[role="treegrid"],[role="menu"]',
  );
  if (!group || group === el) return null;
  return group.getAttribute("role") === "toolbar" &&
    group.getAttribute("aria-orientation") !== "vertical"
    ? ["{ArrowRight}", "{ArrowLeft}"]
    : ["{ArrowDown}", "{ArrowUp}"];
}

const active = () => {
  const el = document.activeElement as HTMLElement | null;
  return el && el !== document.body ? el : null;
};

async function walk(): Promise<string[]> {
  const misses: string[] = [];
  const seen = new Set<Element>();
  // Controls read while they held focus, waiting to be read without it.
  let pending: { el: HTMLElement; focused: string; made: string }[] = [];

  const reach = async (el: HTMLElement) => {
    seen.add(el);
    const made = madeLike(el);
    if (passed.has(made) || showsACaret(el)) return;
    pending.push({ el, focused: await focusReading(el), made });
  };
  const judge = async () => {
    const still: typeof pending = [];
    for (const p of pending) {
      if (!p.el.isConnected) continue;
      const now = active();
      if (now === p.el || (now && p.el.contains(now))) {
        still.push(p);
        continue;
      }
      if ((await focusReading(p.el)) === p.focused) {
        misses.push(describeControl(p.el));
      } else {
        passed.add(p.made);
      }
    }
    pending = still;
  };

  await commands.resetMousePosition();
  active()?.blur();

  for (let i = 0; i < MAX_STOPS; i++) {
    await userEvent.keyboard("{Tab}");
    const el = active();
    await judge();
    if (!el || seen.has(el)) break;
    await reach(el);

    const arrows = arrowsFor(el);
    if (!arrows) continue;
    await userEvent.keyboard(arrows[0]);
    const next = active();
    if (next && next !== el) {
      if (!seen.has(next)) await reach(next);
      await userEvent.keyboard(arrows[1]);
    }
  }
  if (pending.length) {
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await judge();
  }
  // What is left could not be left by a key: the only stop of a dialog that
  // keeps the focus in. It is not judged.
  return misses;
}

afterEach(async (context) => {
  const story = (context as { story?: StoryInContext }).story;
  if (!story) return;
  if (typeof __MD3_PRESET__ === "string") return;
  // A story that already failed has said what is wrong.
  if (context.task.result?.errors?.length) return;
  if (story.tags.includes("no-focus-check")) {
    if (!story.parameters.focus?.reason) {
      throw new Error(
        `${story.id} is tagged no-focus-check without saying why: give parameters.focus.reason`,
      );
    }
    return;
  }

  const misses = await walk();
  if (misses.length) {
    throw new Error(
      `FOCUS ${story.id}: reached by the keyboard and showing nothing: ${misses.join("; ")}`,
    );
  }
});
