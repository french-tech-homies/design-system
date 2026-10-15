import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect } from "storybook/test";

/**
 * The catalog's own ground (`.storybook/storybook.css`): in dark, a story's
 * canvas and a Docs page are drawn on the current preset's `surface`; in
 * light, nothing is set and the page's white shows. Run under both presets,
 * as every story is, so each finds its own preset's `surface`.
 */
const meta = {
  title: "MD3/Interactions/Catalog",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const THEMES = ["light", "dark"] as const;
const NOTHING = "rgba(0, 0, 0, 0)";

/** What a role utility draws here, under the preset and theme on `<html>`. */
function role(className: string, property: "backgroundColor" | "color") {
  const probe = document.createElement("div");
  probe.className = className;
  document.body.append(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

/** Runs `check` with `<html>` in `theme`, and puts the story's own back. */
async function inTheme(theme: (typeof THEMES)[number], check: () => Promise<void>) {
  const html = document.documentElement;
  const was = html.classList.contains("dark") ? "dark" : "light";
  html.classList.remove(...THEMES);
  html.classList.add(theme);
  try {
    await check();
  } finally {
    html.classList.remove(...THEMES);
    html.classList.add(was);
  }
}

/**
 * A story's canvas, its `<body>`: the preset's `surface` in dark, and in
 * light no ground of its own, so the page's white.
 */
export const CanvasGround: Story = {
  render: () => (
    <p className="text-body-medium text-on-surface">Drawn on the preset&apos;s surface in dark.</p>
  ),
  play: async () => {
    await inTheme("dark", async () => {
      const surface = role("bg-surface", "backgroundColor");
      await expect(surface).not.toBe(NOTHING);
      await expect(surface).not.toBe("rgb(255, 255, 255)");
      await expect(getComputedStyle(document.body).backgroundColor).toBe(surface);
    });
    await inTheme("light", async () => {
      await expect(getComputedStyle(document.body).backgroundColor).toBe(NOTHING);
      await expect(getComputedStyle(document.documentElement).backgroundColor).toBe(NOTHING);
    });
  },
};

/**
 * A Docs page, keyed on the toolbar's theme (`data-docs-theme`, written by
 * `preview.ts`), not on the `.dark` a dark story puts on `<html>`: in dark,
 * its wrapper and each preview on `surface`, its prose in `on-surface`, and
 * what a story draws left to the story; in light, the page's white, even
 * where `<html>` is dark.
 */
export const DocsGround: Story = {
  render: () => (
    <p className="text-body-medium text-on-surface">A Docs page follows the toolbar.</p>
  ),
  play: async () => {
    const html = document.documentElement;
    const docs = document.createElement("div");
    docs.className = "sbdocs sbdocs-wrapper";
    docs.innerHTML =
      '<p data-part="prose">Prose</p>' +
      '<div class="sbdocs sbdocs-preview"><div class="docs-story">' +
      '<p data-part="story" class="text-primary">Story</p></div></div>';
    document.body.append(docs);
    const part = (name: string) => docs.querySelector(`[data-part="${name}"]`)!;
    const preview = docs.querySelector(".sbdocs-preview")!;
    try {
      await inTheme("dark", async () => {
        html.dataset.docsTheme = "dark";
        const surface = role("bg-surface", "backgroundColor");
        await expect(getComputedStyle(docs).backgroundColor).toBe(surface);
        await expect(getComputedStyle(preview).backgroundColor).toBe(surface);
        await expect(getComputedStyle(part("prose")).color).toBe(role("text-on-surface", "color"));
        await expect(getComputedStyle(part("story")).color).toBe(role("text-primary", "color"));

        html.dataset.docsTheme = "light";
        await expect(getComputedStyle(document.body).backgroundColor).toBe(NOTHING);
        await expect(getComputedStyle(docs).backgroundColor).not.toBe(surface);
        await expect(getComputedStyle(preview).backgroundColor).not.toBe(surface);
      });
    } finally {
      docs.remove();
      delete html.dataset.docsTheme;
    }
  },
};
