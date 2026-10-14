import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Folder, Image, Music, Pencil, Plus } from "lucide-react";

import FabMenu, {
  type FabMenuItem,
} from "@french-tech-homies/design-system/components/FabMenu";

/**
 * Material's FAB menu: a FAB that opens two to six related actions above it
 * and turns into their close button.
 */
const meta = {
  title: "MD3/Actions/FabMenu",
  component: FabMenu,
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: FabMenuItem[] = [
  { id: "playlist", label: "Playlist", icon: Music },
  { id: "collection", label: "Collection", icon: Folder },
  { id: "photo", label: "Photo", icon: Image },
  { id: "note", label: "Note", icon: Pencil },
];

/** Closed: the FAB alone. */
export const Closed: Story = {
  args: { "aria-label": "Create", icon: Plus, items },
};

/** Open, in the three colour sets. */
export const ColorSets: Story = {
  args: { "aria-label": "Create", icon: Plus, items },
  render: (args) => (
    <div className="flex items-end gap-8">
      {(["primary", "secondary", "tertiary"] as const).map((color) => (
        <FabMenu
          key={color}
          {...args}
          aria-label={`Create, ${color}`}
          color={color}
          defaultOpen
        />
      ))}
    </div>
  ),
};

/** Open from a small FAB, with two items. */
export const TwoItems: Story = {
  args: {
    "aria-label": "Share",
    icon: Plus,
    items: items.slice(0, 2),
    fabSize: "small",
    defaultOpen: true,
  },
};

/** Open on the dark scheme. */
export const Dark: Story = {
  globals: { theme: "dark" },
  decorators: [
    (Story) => (
      <div className="bg-surface p-6">
        <Story />
      </div>
    ),
  ],
  args: { "aria-label": "Create", icon: Plus, items, defaultOpen: true },
};
