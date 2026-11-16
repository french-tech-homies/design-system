import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import React from "react";

import { Avatar } from "@french-tech-homies/design-system/components/Avatar";

/**
 * A round picture of a person with an initials fallback when the image is
 * missing or fails to load, sized by `size` (40dp list-item avatar, 24dp
 * chip / byline). Plain markup, no React Aria.
 */
const meta = {
  title: "MD3/Communication/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { alt: "Yann Renaudin", fallback: "YR" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const portrait =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#4B4F8C"/><circle cx="40" cy="30" r="14" fill="#E6E1F5"/><path d="M12 76c4-18 16-26 28-26s24 8 28 26z" fill="#E6E1F5"/></svg>',
  );

export const Image: Story = {
  args: { src: portrait },
};

export const Initials: Story = {};

export const Glyph: Story = {
  args: { fallback: undefined, alt: "Unknown user" },
};

export const BrokenImageFallsBack: Story = {
  args: { src: "/does-not-exist.png" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-3">
      {[24, 28, 32, 40, 56].map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/**
 * Beside the person's visible name the avatar takes no `alt`: it is
 * decorative, hidden from a screen reader, and the name is said once.
 */
export const DecorativeBesideAName: Story = {
  render: () => (
    <div className="text-on-surface flex items-center gap-3">
      <Avatar fallback="AM" />
      <span className="text-body-large font-body-large">Ada Martin</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("img")).toBeNull();
    await expect(
      canvasElement.querySelector("[data-slot=avatar]"),
    ).toHaveAttribute("aria-hidden", "true");
  },
};

/** With `alt` the initials are an image named for the person. */
export const NamedByAlt: Story = {
  args: { alt: "Ada Martin", fallback: "AM" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Ada Martin" })).toBeVisible();
  },
};
