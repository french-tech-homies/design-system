import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Checkbox, CheckboxGroup } from "@french-tech-homies/design-system/components/Checkbox";

/**
 * MD3 checkbox on React Aria `Checkbox`: 18px box, 40px state layer,
 * selected / indeterminate / error / disabled. `CheckboxGroup` adds a label,
 * supporting text and an error message.
 */
const meta = {
  title: "MD3/Selection/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Accept table orders" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = { args: { defaultSelected: true } };

export const Indeterminate: Story = { args: { isIndeterminate: true } };

export const Error: Story = {
  args: { isInvalid: true, children: "You must accept the terms" },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox isDisabled defaultSelected>
        Disabled, selected
      </Checkbox>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <CheckboxGroup
      label="Days open"
      supportingText="Pick at least one day"
      defaultValue={["mon", "tue"]}
      className="w-72"
    >
      <Checkbox value="mon">Monday</Checkbox>
      <Checkbox value="tue">Tuesday</Checkbox>
      <Checkbox value="wed">Wednesday</Checkbox>
      <Checkbox value="sun" isDisabled>
        Sunday (closed)
      </Checkbox>
    </CheckboxGroup>
  ),
};

export const GroupWithError: Story = {
  render: () => (
    <CheckboxGroup
      label="Days open"
      isInvalid
      errorMessage="Pick at least one day"
      className="w-72"
    >
      <Checkbox value="mon">Monday</Checkbox>
      <Checkbox value="tue">Tuesday</Checkbox>
    </CheckboxGroup>
  ),
};
