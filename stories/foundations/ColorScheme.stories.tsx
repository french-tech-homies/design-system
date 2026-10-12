import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect, useState } from "react";
import { expect, within } from "storybook/test";

import { Body, Label } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * What the browser draws itself follows the theme. Each scheme block of the
 * generated `theme.css` declares its `color-scheme`, so a native select's
 * list, a date field's picker, a checkbox and a scroll bar are drawn light
 * under `:root` and dark under `.dark`, and `scrollbar-color` gives the bars
 * the theme's roles: a thumb in `outline` on a lane that shows the ground.
 * Colours only: the kit sets no width and hides no bar. A project that wants
 * the browser's own drawing back writes one rule on the root, after the
 * theme ("The opt-out"); the same rule on `<body>` does not reach the page's
 * own bar ("On body alone").
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

/**
 * The rule a project writes to keep what the browser drew before: on the
 * root, after the theme and outside any layer. The same text is in the
 * generated `theme.css`'s head comment, for a theme keyed on `.dark`.
 */
const OPT_OUT = ":root, .dark { color-scheme: normal; scrollbar-color: auto; }";
/** The same declarations where they do not reach the page: on `<body>`. */
const ON_BODY = "body { color-scheme: normal; scrollbar-color: auto; }";

/** What the root element computes: the page's own bar and canvas read it. */
function RootReadOut() {
  const [read, setRead] = useState({ colorScheme: "", scrollbarColor: "" });
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const { colorScheme, scrollbarColor } = getComputedStyle(root);
      setRead({ colorScheme, scrollbarColor });
    };
    update();
    // The toolbar's theme and preset are classes on <html>.
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return (
    <Body size="large" component="div" className="font-mono">
      <div>
        html color-scheme:{" "}
        <span data-testid="root-color-scheme">{read.colorScheme}</span>
      </div>
      <div>
        html scrollbar-color:{" "}
        <span data-testid="root-scrollbar-color">{read.scrollbarColor}</span>
      </div>
    </Body>
  );
}

/**
 * A project that wants the browser's own drawing back writes one rule on the
 * root, after the theme: the page's scroll bar and canvas read the root
 * element, and so does everything that inherits from it. The read-out is what
 * the root computes. The page is taller than the window, so its own bar is
 * there to look at.
 */
export const TheOptOut: Story = {
  name: "The opt-out",
  render: () => (
    <div className="bg-background flex min-h-[150vh] flex-col gap-6 p-6">
      <style>{OPT_OUT}</style>
      <RootReadOut />
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
    const parts = [
      document.documentElement,
      canvas.getByTestId("dark-box"),
      ...canvas.getAllByTestId("scroller"),
    ];
    for (const part of parts) {
      await expect(getComputedStyle(part).colorScheme).toBe("normal");
      await expect(getComputedStyle(part).scrollbarColor).toBe("auto");
    }
    await expect(canvas.getByTestId("root-color-scheme")).toHaveTextContent(
      "normal",
    );
    await expect(canvas.getByTestId("root-scrollbar-color")).toHaveTextContent(
      "auto",
    );
  },
};

/**
 * The same declarations on `<body>` do not opt the page out: the root keeps
 * the theme's values, so the page's own bar and canvas stay the theme's. Only
 * what is inside the body, such as the box below, takes them.
 */
export const OnBodyAlone: Story = {
  name: "On body alone",
  render: () => (
    <div className="bg-background flex min-h-[150vh] flex-col gap-6 p-6">
      <style>{ON_BODY}</style>
      <RootReadOut />
      <NativeParts name="The page" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;
    await expect(getComputedStyle(root).colorScheme).toBe(
      root.classList.contains("dark") ? "dark" : "light",
    );
    const probe = document.createElement("div");
    probe.style.color = "var(--md-sys-color-outline)";
    root.append(probe);
    const outline = getComputedStyle(probe).color;
    probe.remove();
    await expect(getComputedStyle(root).scrollbarColor).toBe(
      `${outline} rgba(0, 0, 0, 0)`,
    );
    const scroller = canvas.getByTestId("scroller");
    await expect(getComputedStyle(scroller).colorScheme).toBe("normal");
    await expect(getComputedStyle(scroller).scrollbarColor).toBe("auto");
  },
};
