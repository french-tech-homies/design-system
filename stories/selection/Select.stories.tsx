import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clock, Store } from "lucide-react";
import React from "react";

import { Select, SelectItem } from "@french-tech-homies/design-system/components/Select";

/**
 * MD3 exposed dropdown menu: a text-field-shaped trigger (outlined or
 * filled, floating label) opening a menu of `SelectItem`s, on React Aria
 * `Select` + `ListBox`.
 */
// `Select` is generic, so the meta does not bind `component` (Storybook would
// demand args); every story uses `render`.
const meta = {
  title: "MD3/Selection/Select",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const expiry = [
  { id: 1, name: "1 day" },
  { id: 7, name: "1 week" },
  { id: 30, name: "1 month" },
  { id: 0, name: "Never", supportingText: "Anyone with the link can join" },
];

export const Outlined: Story = {
  render: () => (
    <Select label="Link expires in" items={expiry} className="w-72">
      {(item) => (
        <SelectItem
          id={item.id}
          label={item.name}
          supportingText={item.supportingText}
        />
      )}
    </Select>
  ),
};

export const Filled: Story = {
  render: () => (
    <Select
      variant="filled"
      label="Link expires in"
      items={expiry}
      className="w-72"
    >
      {(item) => <SelectItem id={item.id} label={item.name} />}
    </Select>
  ),
};

export const WithValue: Story = {
  render: () => (
    <Select
      label="Link expires in"
      items={expiry}
      defaultSelectedKey={7}
      supportingText="Invitations stop working after this"
      className="w-72"
    >
      {(item) => <SelectItem id={item.id} label={item.name} />}
    </Select>
  ),
};

export const WithLeadingIcon: Story = {
  render: () => (
    <Select label="Store" leadingIcon={Store} className="w-72">
      <SelectItem id="acme" label="Acme" />
      <SelectItem id="habibiz" label="Habibiz" />
    </Select>
  ),
};

export const Error: Story = {
  render: () => (
    <Select
      label="Link expires in"
      items={expiry}
      isInvalid
      errorMessage="Choose an expiry"
      className="w-72"
    >
      {(item) => (
        <SelectItem id={item.id} label={item.name} leadingIcon={Clock} />
      )}
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select
      label="Store"
      isDisabled
      defaultSelectedKey="habibiz"
      className="w-72"
    >
      <SelectItem id="acme" label="Acme" />
      <SelectItem id="habibiz" label="Habibiz" />
    </Select>
  ),
};
