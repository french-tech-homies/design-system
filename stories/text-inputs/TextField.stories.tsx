import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eye, Mail, Search } from "lucide-react";
import React from "react";

import { TextField } from "@french-tech-homies/design-system/components/TextField";

/**
 * MD3 text field on React Aria `TextField`. Outlined by default; `filled`
 * for the tonal variant. The label floats with CSS alone; supporting text is
 * replaced by the error message when `isInvalid`.
 */
const meta = {
  title: "MD3/Text inputs/Text field",
  component: TextField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["outlined", "filled"] },
  },
  args: { label: "Display name", className: "w-80" },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {
  args: { supportingText: "Shown on the storefront" },
};

export const Filled: Story = {
  args: { variant: "filled", supportingText: "Shown on the storefront" },
};

export const WithValue: Story = {
  args: { defaultValue: "Habibiz", supportingText: "Shown on the storefront" },
};

export const WithIcons: Story = {
  args: {
    label: "Email",
    type: "email",
    leadingIcon: Mail,
    trailingIcon: Eye,
    placeholder: "you@example.com",
  },
};

export const Error: Story = {
  args: {
    defaultValue: "ab",
    isInvalid: true,
    errorMessage: "Use at least 3 characters",
    supportingText: "Shown on the storefront",
  },
};

export const Required: Story = {
  args: {
    isRequired: true,
    supportingText: "* Required",
  },
};

export const PrefixAndSuffix: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <TextField label="Price" prefix="$" suffix="CAD" defaultValue="12.50" />
      <TextField
        variant="filled"
        label="Email"
        suffix="@example.com"
        defaultValue="hello"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: "Habibiz", isDisabled: true },
};

export const CharacterCount: Story = {
  args: {
    label: "Tagline",
    maxLength: 40,
    showCharacterCount: true,
    defaultValue: "Lebanese street food",
  },
};

export const Multiline: Story = {
  args: {
    label: "Description",
    multiline: true,
    supportingText: "Markdown is not supported",
    defaultValue: "Trio: comes with fries and a drink.",
  },
};

export const SideBySide: Story = {
  render: () => (
    <div className="flex w-[680px] flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Outlined" supportingText="Default" />
        <TextField variant="filled" label="Filled" supportingText="Tonal" />
        <TextField label="Search" leadingIcon={Search} />
        <TextField variant="filled" label="Search" leadingIcon={Search} />
        <TextField label="Invalid" isInvalid errorMessage="Required" />
        <TextField
          variant="filled"
          label="Invalid"
          isInvalid
          errorMessage="Required"
        />
      </div>
      <div className="bg-surface-container-high rounded-shape-extra-large p-6 [--md3-field-notch:var(--md-sys-color-surface-container-high)]">
        <TextField
          label="On a dialog surface"
          supportingText="--md3-field-notch set to the surface tier"
          defaultValue="Notch matches"
          className="w-full"
        />
      </div>
    </div>
  ),
};
