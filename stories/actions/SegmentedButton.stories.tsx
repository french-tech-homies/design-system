import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Calendar, CalendarDays, CalendarRange, Grid, List } from "lucide-react";

import {
  Segment,
  SegmentedButton,
} from "@french-tech-homies/design-system/components/SegmentedButton";

/**
 * Material's segmented button, which Material no longer recommends: for new
 * work, a connected `ButtonGroup`.
 */
const meta = {
  title: "MD3/Actions/SegmentedButton",
  component: SegmentedButton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SegmentedButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single select, labels only: the selected segment shows a check. */
export const SingleSelect: Story = {
  render: () => (
    <SegmentedButton aria-label="Range" defaultSelectedKeys={["week"]} className="w-96">
      <Segment id="day">Day</Segment>
      <Segment id="week">Week</Segment>
      <Segment id="month">Month</Segment>
    </SegmentedButton>
  ),
};

/** Multiple select, icons and labels: the check replaces a selected
 *  segment's icon. */
export const MultiSelect: Story = {
  render: () => (
    <SegmentedButton
      aria-label="Ranges"
      selectionMode="multiple"
      defaultSelectedKeys={["day", "month"]}
      className="w-[28rem]"
    >
      <Segment id="day" icon={Calendar}>
        Day
      </Segment>
      <Segment id="week" icon={CalendarDays}>
        Week
      </Segment>
      <Segment id="month" icon={CalendarRange}>
        Month
      </Segment>
    </SegmentedButton>
  ),
};

/** Icons alone, each named by its `aria-label`. */
export const IconOnly: Story = {
  render: () => (
    <SegmentedButton aria-label="View" defaultSelectedKeys={["list"]} className="w-48">
      <Segment id="list" icon={List} aria-label="List" />
      <Segment id="grid" icon={Grid} aria-label="Grid" />
    </SegmentedButton>
  ),
};

/** A disabled segment, and a disabled group. A disabled segment is a
 *  disabled `<button>`, which axe leaves out of its contrast rule. */
export const Disabled: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <SegmentedButton aria-label="Range" defaultSelectedKeys={["day"]}>
        <Segment id="day">Day</Segment>
        <Segment id="week" isDisabled>
          Week
        </Segment>
        <Segment id="month">Month</Segment>
      </SegmentedButton>
      <SegmentedButton aria-label="Range, disabled" isDisabled defaultSelectedKeys={["day"]}>
        <Segment id="day">Day</Segment>
        <Segment id="week">Week</Segment>
      </SegmentedButton>
    </div>
  ),
};

/** On the dark scheme. */
export const Dark: Story = {
  globals: { theme: "dark" },
  decorators: [
    (Story) => (
      <div className="bg-surface p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <SegmentedButton
      aria-label="Ranges"
      selectionMode="multiple"
      defaultSelectedKeys={["week"]}
      className="w-[28rem]"
    >
      <Segment id="day" icon={Calendar}>
        Day
      </Segment>
      <Segment id="week" icon={CalendarDays}>
        Week
      </Segment>
      <Segment id="month" icon={CalendarRange}>
        Month
      </Segment>
    </SegmentedButton>
  ),
};
