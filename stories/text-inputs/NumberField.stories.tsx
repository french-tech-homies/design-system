import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapPin } from "lucide-react";
import React, { useState } from "react";

import { NumberField } from "@french-tech-homies/design-system/components/NumberField";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * MD3 text field for numbers on React Aria `NumberField`: the value is a
 * number, parsed and formatted in the viewer's locale (`formatOptions` is
 * `Intl.NumberFormat`), clamped to `minValue` / `maxValue` and snapped to
 * `step` on commit. Arrow keys and the wheel step the value; `steppers` adds
 * a trailing − / + pair. Same container as the text field — outlined by
 * default, `filled` for the tonal variant.
 */
const meta = {
  title: "MD3/Text inputs/Number field",
  component: NumberField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["outlined", "filled"] },
  },
  args: { label: "Quantity", className: "w-80" },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {
  args: { defaultValue: 2, supportingText: "Arrow keys step by 1" },
};

export const Filled: Story = {
  args: { variant: "filled", defaultValue: 2 },
};

export const Steppers: Story = {
  args: {
    steppers: true,
    defaultValue: 1,
    minValue: 1,
    maxValue: 20,
    supportingText: "1 to 20 — the buttons disable at the bounds",
  },
};

export const Currency: Story = {
  args: {
    label: "Price",
    formatOptions: { style: "currency", currency: "EUR" },
    defaultValue: 12.5,
    minValue: 0,
    supportingText: "Formatted in the viewer's locale",
  },
};

export const Percent: Story = {
  args: {
    label: "Discount",
    formatOptions: { style: "percent" },
    defaultValue: 0.15,
    step: 0.01,
    minValue: 0,
    maxValue: 1,
    steppers: true,
    supportingText: "The value is a fraction: 15% is 0.15",
  },
};

export const Coordinates: Story = {
  args: {
    label: "Latitude",
    leadingIcon: MapPin,
    formatOptions: { maximumFractionDigits: 6, useGrouping: false },
    defaultValue: 48.856614,
    minValue: -90,
    maxValue: 90,
    supportingText: "Six decimals; Intl's default of three would round it",
  },
};

export const Suffix: Story = {
  args: {
    label: "Preparation time",
    suffix: "min",
    defaultValue: 15,
    step: 5,
    minValue: 0,
    steppers: true,
  },
};

export const Error: Story = {
  args: {
    defaultValue: 0,
    isInvalid: true,
    errorMessage: "Enter at least 1",
    supportingText: "1 to 20",
    steppers: true,
  },
};

export const Disabled: Story = {
  args: { defaultValue: 3, isDisabled: true, steppers: true },
};

function Controlled() {
  const [value, setValue] = useState(3);
  return (
    <div className="flex w-80 flex-col gap-4">
      <NumberField
        label="Covers"
        value={value}
        onChange={setValue}
        minValue={0}
        steppers
        supportingText="onChange fires on commit: blur, Enter or a stepper"
      />
      <Body size="small" className="text-on-surface-variant">
        value: {Number.isNaN(value) ? "empty (NaN)" : value}
      </Body>
    </div>
  );
}

export const ControlledValue: Story = { render: () => <Controlled /> };
