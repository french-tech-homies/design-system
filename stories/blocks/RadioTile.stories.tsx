import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "storybook/test";

import { RadioTile, RadioTileGroup } from "../../blocks/radio-tile/RadioTile";

/**
 * A block: `npx shadcn add @ds/radio-tile-block` copies it into a project's
 * components, where it is the project's to edit. The kit's radio group, with
 * a tile drawn around each radio.
 */
const meta = {
  title: "MD3/Blocks/RadioTile",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Side by side, wrapping. */
export const InARow: Story = {
  render: () => (
    <RadioTileGroup label="Delivery day" defaultValue="tue" className="w-[520px]">
      <RadioTile value="mon" title="Monday" description="16 November" />
      <RadioTile value="tue" title="Tuesday" description="17 November" />
      <RadioTile value="wed" title="Wednesday" description="18 November" />
    </RadioTileGroup>
  ),
};

/** One under another, with one that cannot be chosen. */
export const InAColumn: Story = {
  render: () => (
    <RadioTileGroup
      label="Plan"
      defaultValue="team"
      layout="column"
      className="w-80"
    >
      <RadioTile value="solo" title="Solo" description="One seat, 3 projects" />
      <RadioTile value="team" title="Team" description="Ten seats, unlimited" />
      <RadioTile
        value="org"
        title="Organisation"
        description="Ask us"
        isDisabled
      />
    </RadioTileGroup>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // MD3's disabled content is `on-surface` at 38 %, which never
            // reaches 4.5:1. WCAG 1.4.3 exempts inactive components.
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
};

/** Without a description. */
export const TitlesOnly: Story = {
  render: () => (
    <RadioTileGroup label="Size" defaultValue="m">
      <RadioTile value="s" title="Small" />
      <RadioTile value="m" title="Medium" />
      <RadioTile value="l" title="Large" />
    </RadioTileGroup>
  ),
};

/** One tab stop, and the arrow keys move the choice, as in the kit's radio
    group; a press anywhere on a tile chooses it. */
export const ChosenByKeyboardAndByPress: Story = {
  render: () => (
    <RadioTileGroup label="Delivery day" defaultValue="mon">
      <RadioTile value="mon" title="Monday" description="16 November" />
      <RadioTile value="tue" title="Tuesday" description="17 November" />
      <RadioTile value="wed" title="Wednesday" description="18 November" />
    </RadioTileGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = (name: RegExp) => canvas.getByRole("radio", { name });
    await expect(radio(/Monday/)).toBeChecked();

    await userEvent.tab();
    await expect(radio(/Monday/)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(radio(/Tuesday/)).toBeChecked();

    await userEvent.click(canvas.getByText("18 November"));
    await expect(radio(/Wednesday/)).toBeChecked();
    await expect(radio(/Tuesday/)).not.toBeChecked();
  },
};
