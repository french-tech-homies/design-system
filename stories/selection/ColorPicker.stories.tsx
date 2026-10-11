import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import ColorArea from "@french-tech-homies/design-system/components/color/ColorArea";
import { ColorField } from "@french-tech-homies/design-system/components/color/ColorField";
import ColorPicker from "@french-tech-homies/design-system/components/color/ColorPicker";
import { ColorSlider } from "@french-tech-homies/design-system/components/color/ColorSlider";
import { ColorSwatch } from "@french-tech-homies/design-system/components/color/ColorSwatch";

/**
 * Color selection, composed from React Aria's color primitives: the
 * `ColorPicker` swatch-and-popover, and the `ColorArea` / `ColorSlider` /
 * `ColorField` / `ColorSwatch` parts it is built from.
 */
const meta = {
  title: "MD3/Selection/Color picker",
  component: ColorPicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { label: "Fill color", defaultValue: "#5100FF" },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Picker: Story = {};

export const PickerWithoutLabel: Story = {
  args: { label: undefined, defaultValue: "#3A693A" },
};

export const Area: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ColorArea defaultValue="hsb(219, 58%, 93%)" />
    </div>
  ),
};

export const HueSlider: Story = {
  render: () => (
    <div className="w-[320px]">
      <ColorSlider
        label="Hue"
        channel="hue"
        defaultValue="hsl(200, 100%, 50%)"
      />
    </div>
  ),
};

export const Field: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <ColorField label="Hex" defaultValue="#555891" />
      <ColorSwatch color="#555891" />
    </div>
  ),
};
