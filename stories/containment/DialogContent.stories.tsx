import type { Meta, StoryObj } from "@storybook/react-vite";
import { Database, Trash2 } from "lucide-react";
import React from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import { DialogContent } from "@french-tech-homies/design-system/components/DialogContent";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The presentational body of a dialog (server-safe): icon, headline,
 * supporting text and actions — or arbitrary children. `Dialog` /
 * `ModalDialog` wrap it in the React Aria overlay. Props are a discriminated
 * union (structured vs. children), so the stories use `render` and the meta
 * does not bind `component` (Storybook would demand args for the union).
 */
const meta = {
  title: "MD3/Containment/Dialog content",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => undefined;

export const Basic: Story = {
  render: () => (
    <DialogContent
      title="Reset settings?"
      supportingText="This will reset your app preferences back to their default settings. This action cannot be undone."
      actions={{
        cancel: { label: "Cancel", onPress: noop },
        confirm: { label: "Accept", onPress: noop },
      }}
    />
  ),
};

export const WithIcon: Story = {
  render: () => (
    <DialogContent
      icon={Database}
      title="Confirm database seeding"
      supportingText="Are you sure you want to seed the database? This will append to any existing data."
      actions={{
        cancel: { label: "Cancel", onPress: noop },
        confirm: { label: "Seed database", onPress: noop },
      }}
    />
  ),
};

export const CustomActions: Story = {
  render: () => (
    <DialogContent
      icon={Trash2}
      title="Delete 3 products?"
      supportingText="They will be removed from every menu that lists them."
      actions={
        <>
          <Button variant="text">Keep them</Button>
          <Button variant="filled" icon={Trash2}>
            Delete
          </Button>
        </>
      }
    />
  ),
};

export const WithChildren: Story = {
  render: () => (
    <DialogContent title="Table 12">
      <div className="flex flex-col gap-2">
        <Body className="text-on-surface-variant">
          Two orders in progress. Pick one to open it on the kitchen board.
        </Body>
        <Button variant="tonal">Order #1042 — Kafta ×2</Button>
        <Button variant="tonal">Order #1043 — Baklava ×1</Button>
      </div>
    </DialogContent>
  ),
};
