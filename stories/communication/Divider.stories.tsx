import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Divider } from "@french-tech-homies/design-system/components/Divider";
import { Body, Label, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The 1dp `outline-variant` line that groups content and implies hierarchy.
 * Presentational and server-safe — no React Aria, no `"use client"`.
 *
 * Material's three uses, in order of how much they separate: **full-width**
 * between unrelated sections (and between interactive and non-interactive
 * areas of a card), **inset** between related items in a list, aligned to the
 * leading edge of their anchoring icon or avatar, and **middle-inset** between
 * elements inside one block. Use them sparingly — the spec's own caution is
 * that too many lines make an interface look cluttered, and a list of
 * repetitive rows often needs only margin.
 */
const meta = {
  title: "MD3/Communication/Divider",
  component: Divider,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    variant: {
      control: "inline-radio",
      options: ["full-width", "inset", "middle-inset"],
    },
    decorative: { control: "boolean" },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullWidth: Story = {
  render: (args) => (
    <div className="bg-surface-container-low rounded-shape-medium w-96 py-4">
      <Body size="medium" className="px-4 pb-4">
        Unrelated section above
      </Body>
      <Divider {...args} />
      <Body size="medium" className="px-4 pt-4">
        Unrelated section below
      </Body>
    </div>
  ),
};

export const Inset: Story = {
  args: { variant: "inset" },
  render: (args) => (
    <div className="bg-surface-container-low rounded-shape-medium w-96 py-2">
      {["Margherita", "Quattro formaggi", "Diavola"].map((name, i, all) => (
        <React.Fragment key={name}>
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="bg-secondary-container text-on-secondary-container flex size-8 shrink-0 items-center justify-center rounded-shape-full text-label-large">
              {name[0]}
            </span>
            <Body size="medium">{name}</Body>
          </div>
          {i < all.length - 1 && <Divider {...args} />}
        </React.Fragment>
      ))}
    </div>
  ),
};

export const MiddleInset: Story = {
  args: { variant: "middle-inset" },
  render: (args) => (
    <div className="bg-surface-container-low rounded-shape-medium w-96 py-4">
      <Body size="medium" className="px-4 pb-4">
        Body text
      </Body>
      <Divider {...args} />
      <Body size="medium" className="px-4 pt-4">
        Related content in the same block
      </Body>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="bg-surface-container-low rounded-shape-medium flex w-[28rem] items-stretch gap-6 p-6">
      <Body size="medium" className="flex-1">
        On a wide window a vertical divider separates side-by-side content —
        paragraph text from the media beside it.
      </Body>
      <Divider {...args} />
      <div className="bg-surface-container-highest rounded-shape-small size-24 shrink-0" />
    </div>
  ),
};

/**
 * The hierarchy rule: full-width between different kinds of content, inset
 * between nested items of the same kind.
 */
export const Hierarchy: Story = {
  render: () => (
    <div className="bg-surface border-outline-variant rounded-shape-large w-96 overflow-hidden border">
      <div className="p-4">
        <Title size="medium" component="h3">
          Table 12
        </Title>
      </div>
      <Divider />
      <div className="py-2">
        {["Two pizzas", "One tiramisu"].map((line, i, all) => (
          <React.Fragment key={line}>
            <Body size="medium" className="px-4 py-2">
              {line}
            </Body>
            {i < all.length - 1 && <Divider variant="inset" />}
          </React.Fragment>
        ))}
      </div>
      <Divider />
      <div className="flex justify-end p-4">
        <Label size="large" colorRole="primary">
          Open order
        </Label>
      </div>
    </div>
  ),
};

/**
 * `decorative` is the default and hides the line from assistive technology,
 * because type and spacing already convey the grouping. Turn it off where the
 * line is the only boundary marker — then it is a `separator`.
 */
export const Semantic: Story = {
  args: { decorative: false },
  render: (args) => (
    <div className="bg-surface-container-low rounded-shape-medium w-96 py-4">
      <Body size="medium" className="px-4 pb-4">
        Section one
      </Body>
      <Divider {...args} />
      <Body size="medium" className="px-4 pt-4">
        Section two
      </Body>
    </div>
  ),
};
