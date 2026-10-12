import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";

import { Body, Label } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * What the browser draws itself follows the theme. Each scheme block of the
 * generated `theme.css` declares its `color-scheme`, so a native select's
 * list, a date field's picker, a checkbox and a scroll bar are drawn light
 * under `:root` and dark under `.dark`, and `scrollbar-color` gives the bars
 * the theme's roles: a thumb in `outline` on a lane that shows the ground.
 * Colours only: the kit sets no width and hides no bar. A project's own
 * `color-scheme` or `scrollbar-color`, on `<body>` or on a scroller, wins.
 */
const meta = {
  title: "MD3/Foundations/Color scheme",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const field =
  "border-outline rounded-shape-extra-small text-body-large h-10 border bg-transparent px-2";

/** Native parts only: nothing here is a component of the kit. */
function NativeParts({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Label size="large" component="div" className="text-on-surface-variant">
        {name}
      </Label>
      <div className="flex flex-wrap items-center gap-4">
        <select aria-label={`${name}: a native select`} className={field}>
          <option>Lyon</option>
          <option>Paris</option>
          <option>Bordeaux</option>
        </select>
        <input
          type="date"
          aria-label={`${name}: a native date field`}
          defaultValue="2026-10-12"
          className={field}
        />
        <input
          type="text"
          aria-label={`${name}: a native text field`}
          defaultValue="Text"
          className={`${field} w-32`}
        />
        <input
          type="checkbox"
          aria-label={`${name}: a native checkbox`}
          defaultChecked
          className="size-5"
        />
      </div>
      <div
        data-testid="scroller"
        // A scroller is reached by keyboard.
        tabIndex={0}
        role="region"
        aria-label={`${name}: a box that scrolls both ways`}
        className="border-outline-variant h-28 w-80 overflow-scroll border"
      >
        <div className="h-64 w-[640px] p-3">
          <Body size="medium">
            A box that scrolls both ways. Its bars are the theme&apos;s: a
            thumb in outline, on a lane that shows this ground.
          </Body>
        </div>
      </div>
    </div>
  );
}

/**
 * The page in the scheme the toolbar chose, and a `.dark` box that holds the
 * same parts: the scheme follows a subtree as the colour roles do.
 */
export const NativeControlsAndScrollBars: Story = {
  render: () => (
    <div className="bg-background flex min-h-screen flex-col gap-6 p-6">
      <NativeParts name="The page" />
      <div
        data-testid="dark-box"
        className="dark bg-background rounded-shape-medium p-6"
      >
        <NativeParts name="A dark subtree" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;
    // The toolbar's theme is a class on <html>; the tests run in light.
    await expect(getComputedStyle(root).colorScheme).toBe(
      root.classList.contains("dark") ? "dark" : "light",
    );
    const box = canvas.getByTestId("dark-box");
    await expect(getComputedStyle(box).colorScheme).toBe("dark");

    // A thumb in the scheme's own `outline`, on a lane that is not painted.
    const probe = document.createElement("div");
    probe.style.color = "var(--md-sys-color-outline)";
    for (const scroller of canvas.getAllByTestId("scroller")) {
      scroller.append(probe);
      const outline = getComputedStyle(probe).color;
      await expect(getComputedStyle(scroller).scrollbarColor).toBe(
        `${outline} rgba(0, 0, 0, 0)`,
      );
    }
    probe.remove();
  },
};
