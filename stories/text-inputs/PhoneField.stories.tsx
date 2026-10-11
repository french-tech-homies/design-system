import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import { PhoneField } from "@french-tech-homies/design-system/components/PhoneField";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * MD3 text field for phone numbers: the value is an E.164 string, the input
 * formats as you type in international format, and the leading country
 * picker (flag + calling code, a React Aria `Select`) pre-fills the calling
 * code. Same container as the text field — outlined by default, `filled`
 * for the tonal variant. Parsing and formatting come from
 * `react-phone-number-input`.
 */
const meta = {
  title: "MD3/Text inputs/Phone field",
  component: PhoneField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["outlined", "filled"] },
  },
  args: { label: "Phone number", className: "w-80" },
} satisfies Meta<typeof PhoneField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {
  args: {
    defaultCountry: "FR",
    supportingText: "Pick a country or type a +code",
  },
};

export const Filled: Story = {
  args: { variant: "filled", defaultCountry: "FR" },
};

export const International: Story = {
  args: {
    supportingText: "No default country: the globe until a +code is typed",
  },
};

export const WithValue: Story = {
  args: { defaultValue: "+33612345678", supportingText: "Formatted on read" },
};

export const Required: Story = {
  args: { defaultCountry: "FR", isRequired: true },
};

export const Error: Story = {
  args: {
    defaultValue: "+3361",
    isInvalid: true,
    errorMessage: "Enter a complete phone number",
    supportingText: "Pick a country or type a +code",
  },
};

export const Disabled: Story = {
  args: { defaultValue: "+33612345678", isDisabled: true },
};

function Controlled() {
  const [value, setValue] = useState<string | undefined>("+14155552671");
  return (
    <div className="flex w-80 flex-col gap-4">
      <PhoneField
        label="Phone number"
        value={value ?? ""}
        onChange={setValue}
        supportingText="The value is E.164"
      />
      <Body size="small" className="text-on-surface-variant">
        value:{" "}
        {value === undefined ? "undefined (empty)" : JSON.stringify(value)}
      </Body>
    </div>
  );
}

export const ControlledValue: Story = { render: () => <Controlled /> };
