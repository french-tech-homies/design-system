import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect } from "storybook/test";
import ListItem from "@french-tech-homies/design-system/components/ListItem";
import { Checkbox } from "@french-tech-homies/design-system/components/Checkbox";

/** Plain `<img>` so the story has no framework dependency (the Next image component needs the Next runtime). */
function Thumb({ size }: { size: number }) {
  return (
    <img
      src="https://picsum.photos/id/1011/300/300"
      alt=""
      width={size}
      height={size}
      className="rounded-shape-medium object-cover"
    />
  );
}

const meta = {
  title: "MD3/Containment/List item",
  component: ListItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: {
    headline: "My sweet list item",
  },
};

export const ListItemWithLeadingImage: Story = {
  args: {
    headline: "My sweet list item",
    leadingElement: <Thumb size={40} />,
  },
};

export const ListItemWithSupportingText: Story = {
  args: {
    headline: "My sweet list item",
    supportingText: "This is a supporting text",
    leadingElement: <Thumb size={80} />,
  },
};

export const ListItemWithTrailingElement: Story = {
  args: {
    headline: "My sweet list item",
    supportingText: "This is a supporting text",
    leadingElement: <Thumb size={80} />,
    trailingElement: <Checkbox aria-label="Select" />,
  },
};

export const SelectedListItem: Story = {
  args: {
    headline: "Selected list item",
    isSelected: true,
  },
};

export const SelectedListItemWithLeadingImage: Story = {
  args: {
    headline: "Selected list item with image",
    isSelected: true,
    leadingElement: <Thumb size={40} />,
  },
};

export const SelectedListItemWithSupportingText: Story = {
  args: {
    headline: "Selected list item with supporting text",
    supportingText: "This is a supporting text for a selected item",
    isSelected: true,
    leadingElement: <Thumb size={80} />,
  },
};

export const SelectedListItemWithTrailingElement: Story = {
  args: {
    headline: "Selected list item with trailing element",
    supportingText: "This is a supporting text for a selected item",
    isSelected: true,
    leadingElement: <Thumb size={80} />,
    trailingElement: <Checkbox aria-label="Select" isSelected />,
  },
};

/** A name longer than the row is cut to one line when it is passed wrapped
 *  (`block truncate`) and the list has a width. Left bare, it wraps. */
export const LongNameCutToOneLine: Story = {
  args: {
    headline: (
      <span className="block truncate">
        Quarterly report, final, reviewed by finance, do not edit (3).pdf
      </span>
    ),
    supportingText: "Edited yesterday",
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector<HTMLElement>(".truncate")!;
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="list-item"]',
    )!;
    // Cut, not wrapped and not spilling: narrower than its own text, one
    // line high, and inside the row.
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await expect(text.getBoundingClientRect().height).toBeLessThan(30);
    await expect(text.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    );
  },
};
