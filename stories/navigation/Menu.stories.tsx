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
 * (`MenuItemType`): label, optional leading/trailing icon, shortcut,
 * `onAction` and `isDisabled`, with `{ id, type: "divider" }` between groups.
 * `selectionMode` makes the items choices. Rows render with `MenuItem`.
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
      <IconButton
        variant="standard"
        aria-label="Open menu"
        icon={EllipsisVertical}
      />
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

/** A disabled item stays in the menu, at 38% and skipped by the arrow keys,
 *  when it tells the user the action exists. A divider sets a group apart:
 *  here the one action that cannot be undone. */
export const WithDisabledItemAndDivider: Story = {
  args: {
    triggerButton: <Button variant="outlined">Order #1042</Button>,
    items: [
      { id: "edit", label: "Edit", leadingIcon: Pencil },
      { id: "copy", label: "Duplicate", leadingIcon: Copy },
      {
        id: "open",
        label: "Open storefront",
        leadingIcon: ExternalLink,
        isDisabled: true,
      },
      { id: "divider", type: "divider" },
      { id: "delete", label: "Delete", leadingIcon: Trash2 },
    ],
  },
};

/** `selectionMode="single"`: the items are choices, one selected at a time,
 *  announced as radio items. The selected row takes the selected container
 *  and a trailing check. A page size always has a value, so
 *  `disallowEmptySelection` keeps the selected row from being unchecked. */
export const SingleSelection: Story = {
  args: {
    triggerButton: <Button variant="text">25 per page</Button>,
    selectionMode: "single",
    disallowEmptySelection: true,
    defaultSelectedKeys: ["25"],
    items: [
      { id: "10", label: "10 per page" },
      { id: "25", label: "25 per page" },
      { id: "50", label: "50 per page" },
    ],
  },
};

/** `selectionMode="multiple"`: any number selected, announced as checkbox
 *  items. The menu stays open while they are toggled, until Escape or a press
 *  outside dismisses it. */
export const MultipleSelection: Story = {
  args: {
    triggerButton: <Button variant="text">Columns</Button>,
    selectionMode: "multiple",
    defaultSelectedKeys: ["customer", "total"],
    items: [
      { id: "customer", label: "Customer" },
      { id: "date", label: "Date" },
      { id: "status", label: "Status" },
      { id: "total", label: "Total" },
    ],
  },
};
