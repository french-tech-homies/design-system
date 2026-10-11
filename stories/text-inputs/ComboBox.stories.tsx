import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "lucide-react";
import React, { useState } from "react";
import type { Key } from "react-aria-components";

import { ComboBox, ComboBoxItem } from "@french-tech-homies/design-system/components/ComboBox";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * MD3 text field with a menu (autocomplete) on React Aria `ComboBox`. Typing
 * filters the options; `selectionMode="multiple"` shows the selection as
 * input chips inline with the caret — the chips guideline's "input chips in a
 * text field" — removable from their trailing icon or with Backspace.
 */
// `ComboBox` is generic, so the meta does not bind `component`; every story
// uses `render`.
const meta = {
  title: "MD3/Text inputs/ComboBox",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains", supportingText: "Served all day" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
  { id: "kids", name: "Kids menu" },
  { id: "specials", name: "Chef's specials", supportingText: "Weekends" },
];

export const Autocomplete: Story = {
  render: () => (
    <ComboBox
      label="Category"
      items={categories}
      supportingText="Type to filter"
      className="w-80"
    >
      {(c) => (
        <ComboBoxItem
          id={c.id}
          label={c.name}
          supportingText={c.supportingText}
        />
      )}
    </ComboBox>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ComboBox
      label="Categories"
      selectionMode="multiple"
      defaultValue={["mains", "drinks"]}
      items={categories}
      supportingText="Each pick becomes a chip; Backspace removes the last one"
      className="w-96"
    >
      {(c) => <ComboBoxItem id={c.id} label={c.name} />}
    </ComboBox>
  ),
};

export const Filled: Story = {
  render: () => (
    <ComboBox
      variant="filled"
      label="Categories"
      selectionMode="multiple"
      defaultValue={["starters"]}
      items={categories}
      className="w-96"
    >
      {(c) => <ComboBoxItem id={c.id} label={c.name} />}
    </ComboBox>
  ),
};

export const WithLeadingIcon: Story = {
  render: () => (
    <ComboBox
      label="Category"
      leadingIcon={Tag}
      defaultValue="desserts"
      items={categories}
      className="w-80"
    >
      {(c) => <ComboBoxItem id={c.id} label={c.name} />}
    </ComboBox>
  ),
};

export const Error: Story = {
  render: () => (
    <ComboBox
      label="Categories"
      selectionMode="multiple"
      items={categories}
      isInvalid
      errorMessage="Pick at least one category"
      className="w-96"
    >
      {(c) => <ComboBoxItem id={c.id} label={c.name} />}
    </ComboBox>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ComboBox
      label="Categories"
      selectionMode="multiple"
      defaultValue={["mains"]}
      items={categories}
      isDisabled
      className="w-96"
    >
      {(c) => <ComboBoxItem id={c.id} label={c.name} />}
    </ComboBox>
  ),
};

function Controlled() {
  const [value, setValue] = useState<Key[]>(["kids"]);
  return (
    <div className="flex w-96 flex-col gap-4">
      <ComboBox
        label="Categories"
        selectionMode="multiple"
        value={value}
        onChange={setValue}
        items={categories}
      >
        {(c) => <ComboBoxItem id={c.id} label={c.name} />}
      </ComboBox>
      <Body size="small" className="text-on-surface-variant">
        value: {JSON.stringify(value)}
      </Body>
    </div>
  );
}

export const ControlledMultiple: Story = { render: () => <Controlled /> };
