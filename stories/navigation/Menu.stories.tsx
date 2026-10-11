import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Copy,
  EllipsisVertical,
  ExternalLink,
  LogOut,
  Pencil,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import React from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { Menu } from "@french-tech-homies/design-system/components/Menu";

/**
 * A menu in a popover, opened from any trigger. Items are data
 * (`MenuItemType`): label, optional leading/trailing icon, shortcut and
 * `onAction`. Rows render with `MenuItem`.
 */
const meta = {
  title: "MD3/Navigation/Menu",
  component: Menu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "select",
      options: ["bottom", "bottom start", "bottom end", "top", "left", "right"],
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const accountItems = [
  { id: "profile", label: "Profile", leadingIcon: User },
  { id: "settings", label: "Settings", leadingIcon: Settings },
  { id: "logout", label: "Log out", leadingIcon: LogOut },
];

export const FromIconButton: Story = {
  args: {
    triggerButton: (
      <IconButton aria-label="Open menu" icon={EllipsisVertical} />
    ),
    items: accountItems,
  },
};

export const FromButton: Story = {
  args: {
    triggerButton: <Button variant="outlined">Account</Button>,
    items: accountItems,
    placement: "bottom start",
  },
};

export const WithShortcutsAndTrailingIcons: Story = {
  args: {
    triggerButton: <Button variant="tonal">Actions</Button>,
    items: [
      { id: "edit", label: "Edit", leadingIcon: Pencil, shortcut: "⌘E" },
      { id: "copy", label: "Duplicate", leadingIcon: Copy, shortcut: "⌘D" },
      {
        id: "open",
        label: "Open storefront",
        leadingIcon: ExternalLink,
        trailingIcon: ExternalLink,
      },
      { id: "delete", label: "Delete", leadingIcon: Trash2, shortcut: "⌫" },
    ],
  },
};

export const WithActions: Story = {
  args: {
    triggerButton: <Button variant="filled">Table 12</Button>,
    items: [
      { id: "open", label: "Open orders", onAction: () => alert("open") },
      { id: "print", label: "Print QR code", onAction: () => alert("print") },
      { id: "free", label: "Mark as free", onAction: () => alert("free") },
    ],
  },
};

export const PlacedAbove: Story = {
  args: {
    triggerButton: <Button variant="text">Open above</Button>,
    items: accountItems,
    placement: "top",
  },
};

/** A static `header` above the items (an account line) and items with
 *  `href`, which render as links — the shape of a profile menu. */
export const WithHeaderAndLinks: Story = {
  args: {
    triggerButton: <Button variant="tonal">Account</Button>,
    header: (
      <div className="flex flex-col gap-1">
        <span className="text-body-medium font-medium">Yann Renaudin</span>
        <span className="text-body-small text-on-surface-variant">
          yann@example.com
        </span>
      </div>
    ),
    className: "w-56",
    items: [
      { id: "settings", label: "Settings", href: "#settings" },
      { id: "logout", label: "Log out", href: "#logout" },
      { id: "theme", label: "Toggle theme", onAction: () => undefined },
    ],
  },
};
