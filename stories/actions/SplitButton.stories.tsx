import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Clock, ListPlus, Share2 } from "lucide-react";
import { screen, userEvent, within } from "storybook/test";

import SplitButton from "@french-tech-homies/design-system/components/SplitButton";
import type { MenuItemType } from "@french-tech-homies/design-system/components/Menu";

/**
 * Material's split button: the main action, and beside it the menu of the
 * ones related to it.
 */
const meta = {
  title: "MD3/Actions/SplitButton",
  component: SplitButton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: MenuItemType[] = [
  { id: "later", label: "Watch later", leadingIcon: Clock },
  { id: "playlist", label: "Add to playlist", leadingIcon: ListPlus },
  { id: "share", label: "Share", leadingIcon: Share2 },
];

/** The four styles a split button comes in. */
export const Variants: Story = {
  args: { menuLabel: "More watch options", items },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["filled", "tonal", "outlined", "elevated"] as const).map((variant) => (
        <SplitButton
          key={variant}
          variant={variant}
          icon={Clock}
          menuLabel={`More ${variant} options`}
          items={items}
        >
          {variant}
        </SplitButton>
      ))}
    </div>
  ),
};

/** Material's five sizes: the inner corners and the trailing icon grow. */
export const Sizes: Story = {
  args: { menuLabel: "More watch options", items },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {(["xsmall", "small", "medium", "large", "xlarge"] as const).map((size) => (
        <SplitButton
          key={size}
          size={size}
          variant="tonal"
          menuLabel={`More options, ${size}`}
          items={items}
        >
          Watch
        </SplitButton>
      ))}
    </div>
  ),
};

/** Open: the trailing button's inner corner is round and its icon turned
 *  over, the menu 4 pixels below. */
export const Open: Story = {
  args: { menuLabel: "More watch options", items },
  render: (args) => (
    <div className="h-64">
      <SplitButton {...args} icon={Clock}>
        Watch
      </SplitButton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "More watch options" }),
    );
    await screen.findByRole("menu");
  },
};

/** On the dark scheme, filled and outlined. */
export const Dark: Story = {
  globals: { theme: "dark" },
  decorators: [
    (Story) => (
      <div className="bg-surface p-6">
        <Story />
      </div>
    ),
  ],
  args: { menuLabel: "More watch options", items },
  render: () => (
    <div className="flex items-center gap-4">
      <SplitButton icon={Clock} menuLabel="More watch options" items={items}>
        Watch
      </SplitButton>
      <SplitButton variant="outlined" menuLabel="More share options" items={items}>
        Share
      </SplitButton>
    </div>
  ),
};
