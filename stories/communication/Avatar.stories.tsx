import type { Meta, StoryObj } from "@storybook/react-vite";
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
