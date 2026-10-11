import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Plus } from "lucide-react";

import Button from "@french-tech-homies/design-system/components/Button";

/**
 * Floating action buttons are the `fab` variant of `Button`: icon-only at
 * three sizes, or extended when it has children.
 */
const meta = {
  title: "MD3/Actions/FAB",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { variant: "fab", icon: Plus, "aria-label": "Add" },
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: "small" } };

export const Medium: Story = { args: { size: "medium" } };

export const Large: Story = { args: { size: "large" } };

export const Extended: Story = {
  args: { children: "Compose", icon: Pencil, size: "medium" },
};

export const Loading: Story = { args: { isLoading: true } };
