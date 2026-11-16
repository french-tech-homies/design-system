import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell } from "lucide-react";
import React from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import {
  Checkbox,
  CheckboxGroup,
} from "@french-tech-homies/design-system/components/Checkbox";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Popover,
  PopoverTrigger,
} from "@french-tech-homies/design-system/components/Popover";
import {
  Body,
  Title,
} from "@french-tech-homies/design-system/primitives/Typography";

/**
 * A surface that opens beside its trigger and holds anything. Not a Material
 * 3 component: it takes the rich tooltip's container. It is a dialog that is
 * not modal: the focus moves into it, Escape or a press outside closes it.
 * For a list of actions use `Menu`.
 */
const meta = {
  title: "MD3/Containment/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A filter's controls, open below the start of its trigger. */
export const Filters: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="outlined">Filters</Button>
      <Popover aria-label="Filters" placement="bottom start">
        <CheckboxGroup label="Status" defaultValue={["paid"]}>
          <Checkbox value="pending">Pending</Checkbox>
          <Checkbox value="paid">Paid</Checkbox>
          <Checkbox value="shipped">Shipped</Checkbox>
        </CheckboxGroup>
      </Popover>
    </PopoverTrigger>
  ),
};

/** Named by a heading of its own, from an icon button, with a width. */
export const Notifications: Story = {
  render: () => (
    <PopoverTrigger>
      <IconButton variant="standard" icon={Bell} aria-label="Notifications" />
      <Popover
        aria-labelledby="notifications-title"
        placement="bottom end"
        className="w-72"
      >
        <Title id="notifications-title" size="small" component="h2">
          Notifications
        </Title>
        <ul className="mt-2 flex flex-col gap-2">
          <li>
            <Body>Order #1042 was paid.</Body>
            <Body size="small" className="text-on-surface-variant">
              2 minutes ago
            </Body>
          </li>
          <li>
            <Body>Table 12 asked for the bill.</Body>
            <Body size="small" className="text-on-surface-variant">
              10 minutes ago
            </Body>
          </li>
        </ul>
      </Popover>
    </PopoverTrigger>
  ),
};

/** `children` as a function is given `close`, for a button that closes it. */
export const WithAButtonThatCloses: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="tonal">Rename</Button>
      <Popover aria-label="Rename" placement="top" className="w-64">
        {({ close }) => (
          <div className="flex flex-col gap-3">
            <Body>Renaming keeps the links to this file.</Body>
            <div className="flex justify-end gap-2">
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="filled" onPress={close}>
                Rename
              </Button>
            </div>
          </div>
        )}
      </Popover>
    </PopoverTrigger>
  ),
};
