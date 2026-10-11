import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Radio, RadioGroup } from "@french-tech-homies/design-system/components/Radio";

/**
 * MD3 radio button on React Aria `RadioGroup` / `Radio`: 20px ring, 10px
 * dot, 40px state layer. The group carries label, supporting text, error and
 * orientation.
 */
const meta = {
  title: "MD3/Selection/Radio",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { label: "Service", className: "w-72" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = (
  <>
    <Radio value="table">Table service</Radio>
    <Radio value="counter">Counter pickup</Radio>
    <Radio value="delivery">Delivery</Radio>
  </>
);

export const Vertical: Story = {
  args: { defaultValue: "table", children: options },
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    defaultValue: "counter",
    children: options,
  },
};

export const WithSupportingText: Story = {
  args: {
    supportingText: "How customers receive their order",
    children: options,
  },
};

export const Error: Story = {
  args: {
    isInvalid: true,
    errorMessage: "Choose a service",
    children: options,
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    defaultValue: "table",
    children: options,
  },
};

export const DisabledOption: Story = {
  args: {
    defaultValue: "table",
    children: (
      <>
        <Radio value="table">Table service</Radio>
        <Radio value="counter">Counter pickup</Radio>
        <Radio value="delivery" isDisabled>
          Delivery (coming soon)
        </Radio>
      </>
    ),
  },
};
