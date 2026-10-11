import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Tag } from "@french-tech-homies/design-system/components/Tag";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * A static label on a colour-role container — an order number, a plan, a
 * status, a price. Presentational: never reacts to the pointer (use a chip
 * for actions and filters). Not a Material 3 component; the anatomy borrows
 * from chips at 24dp so it sits inside a line of body text, and the colours
 * are the tonal (`<color>-container`) or filled (`<color>`) role pairs.
 */
const meta = {
  title: "MD3/Communication/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["tonal", "filled", "outlined"] },
    color: {
      control: "select",
      options: ["neutral", "primary", "secondary", "tertiary", "error"],
    },
  },
  args: { children: "Queued" },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tonal: Story = {};

export const Filled: Story = {
  args: { variant: "filled", color: "primary", children: "Paid" },
};

export const Outlined: Story = {
  args: { variant: "outlined", children: "Required" },
};

const colors = [
  "neutral",
  "primary",
  "secondary",
  "tertiary",
  "error",
] as const;

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {colors.map((color) => (
          <Tag key={color} color={color}>
            {color}
          </Tag>
        ))}
      </div>
      <div className="flex gap-2">
        {colors.map((color) => (
          <Tag key={color} variant="filled" color={color}>
            {color}
          </Tag>
        ))}
      </div>
    </div>
  ),
};

export const InText: Story = {
  render: () => (
    <Body size="large" className="text-on-surface">
      Order <Tag>#42</Tag> for table 12 is <Tag color="tertiary">Delivered</Tag>{" "}
      — total <Tag variant="outlined">€18.50</Tag>
    </Body>
  ),
};
