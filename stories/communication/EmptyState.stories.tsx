import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";

import Button from "@french-tech-homies/design-system/components/Button";
import EmptyState from "@french-tech-homies/design-system/components/EmptyState";

/**
 * Empty state: a centred illustration, headline and supporting text with up
 * to two actions. `media` takes any SVG component (lucide icons included).
 */
const meta = {
  title: "MD3/Communication/Empty state",
  component: EmptyState,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: {
    title: "No orders yet",
    description:
      "Orders placed from a table QR code will show up here as they come in.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMedia: Story = {
  args: { media: Inbox },
};

export const WithActions: Story = {
  args: {
    media: Inbox,
    action: <Button variant="filled">Create an order</Button>,
    secondaryAction: <Button variant="text">See how ordering works</Button>,
  },
};

export const Small: Story = {
  args: { size: "sm", media: Inbox, action: <Button>Create</Button> },
};

export const Large: Story = {
  args: { size: "lg", media: Inbox, action: <Button>Create an order</Button> },
};
