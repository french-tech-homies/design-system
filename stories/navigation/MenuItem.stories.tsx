import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, ChevronRight, Copy, Settings, Trash2 } from "lucide-react";
import React from "react";

import { MenuItem } from "@french-tech-homies/design-system/components/MenuItem";

/**
 * The presentational row used inside `Menu` (server-safe). Shown here on
 * its own so each state is visible without opening a popover.
 */
const meta = {
  title: "MD3/Navigation/Menu item",
  component: MenuItem,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-surface-container rounded-shape-extra-small shadow-elevation-2 w-64 py-2">
        <Story />
      </div>
    ),
  ],
  args: { label: "Settings" },
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcons: Story = {
  args: {
    label: "Settings",
    leadingIcon: Settings,
    trailingIcon: ChevronRight,
  },
};

export const WithShortcut: Story = {
  args: { label: "Duplicate", leadingIcon: Copy, shortcut: "⌘D" },
};

export const WithSupportingText: Story = {
  args: {
    label: "Delete product",
    supportingText: "Removes it from every menu",
    leadingIcon: Trash2,
  },
};

export const Selected: Story = {
  args: { label: "Selected", leadingIcon: Check, isSelected: true },
};

export const Disabled: Story = {
  args: { label: "Unavailable", leadingIcon: Settings, isDisabled: true },
};
