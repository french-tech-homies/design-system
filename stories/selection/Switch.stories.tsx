import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Switch } from "@french-tech-homies/design-system/components/Switch";

/**
 * MD3 switch on React Aria `Switch`: 52×32 track, handle that grows from
 * 16px to 24px when on and 28px while pressed, optional check/cross icons.
 */
const meta = {
  title: "MD3/Selection/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Accept online orders" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { defaultSelected: true } };

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch icons>With icons, off</Switch>
      <Switch icons defaultSelected>
        With icons, on
      </Switch>
      <Switch icons="selected" defaultSelected>
        Icon on selected only
      </Switch>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch isDisabled>Disabled, off</Switch>
      <Switch isDisabled defaultSelected>
        Disabled, on
      </Switch>
    </div>
  ),
};

export const WithoutLabel: Story = {
  args: { children: undefined, "aria-label": "Accept online orders" },
};
