import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Mic,
  MoreVertical,
  Underline,
  Video,
} from "lucide-react";

import Button from "@french-tech-homies/design-system/components/Button";
import ButtonGroup from "@french-tech-homies/design-system/components/ButtonGroup";
import IconButton from "@french-tech-homies/design-system/components/IconButton";

/**
 * Material's button groups: `standard` hugs its buttons and widens the one
 * pressed; `connected` spans its surface, for selection.
 */
const meta = {
  title: "MD3/Actions/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A standard group of buttons and icon buttons at the default size. */
export const Standard: Story = {
  render: () => (
    <ButtonGroup aria-label="Call">
      <IconButton variant="tonal" icon={Mic} aria-label="Mute" />
      <IconButton variant="tonal" icon={Video} aria-label="Camera" />
      <Button>Join</Button>
      <IconButton variant="standard" icon={MoreVertical} aria-label="More" />
    </ButtonGroup>
  ),
};

/** Standard groups of icon buttons at each size: the space between them
 *  is 18, 12, 8, 8 and 8 pixels. */
export const StandardSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {(["xsmall", "small", "medium", "large"] as const).map((size) => (
        <ButtonGroup key={size} size={size} aria-label={`Text style, ${size}`}>
          <IconButton variant="tonal" icon={Bold} aria-label="Bold" />
          <IconButton variant="tonal" icon={Italic} aria-label="Italic" />
          <IconButton variant="tonal" icon={Underline} aria-label="Underline" />
        </ButtonGroup>
      ))}
    </div>
  ),
};

/** A standard group of square toggles: the selected one turns round. */
export const StandardSquareToggles: Story = {
  render: () => (
    <ButtonGroup selectionMode="multiple" defaultSelectedKeys={["day"]} aria-label="Range">
      <Button isToggle id="day" shape="square" variant="tonal">
        Day
      </Button>
      <Button isToggle id="week" shape="square" variant="tonal">
        Week
      </Button>
      <Button isToggle id="month" shape="square" variant="tonal">
        Month
      </Button>
    </ButtonGroup>
  ),
};

/** Connected, single select, at three sizes: outer corners full, inner
 *  ones small, the selected button's round. */
export const ConnectedSingleSelect: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      {(["xsmall", "small", "medium"] as const).map((size) => (
        <ButtonGroup
          key={size}
          variant="connected"
          selectionMode="single"
          defaultSelectedKeys={["week"]}
          size={size}
          aria-label={`Range, ${size}`}
        >
          <Button isToggle id="day">
            Day
          </Button>
          <Button isToggle id="week">
            Week
          </Button>
          <Button isToggle id="month">
            Month
          </Button>
        </ButtonGroup>
      ))}
    </div>
  ),
};

/** Connected, multiple select, of icon buttons and of large buttons. */
export const ConnectedMultiSelect: Story = {
  render: () => (
    <div className="flex w-[32rem] flex-col gap-6">
      <ButtonGroup
        variant="connected"
        selectionMode="multiple"
        defaultSelectedKeys={["left"]}
        aria-label="Alignment"
      >
        <IconButton isToggle id="left" variant="outlined" icon={AlignLeft} aria-label="Left" />
        <IconButton isToggle id="center" variant="outlined" icon={AlignCenter} aria-label="Center" />
        <IconButton isToggle id="right" variant="outlined" icon={AlignRight} aria-label="Right" />
      </ButtonGroup>
      <ButtonGroup
        variant="connected"
        selectionMode="multiple"
        defaultSelectedKeys={["bold", "italic"]}
        size="large"
        aria-label="Text style"
      >
        <Button isToggle id="bold" icon={Bold} aria-label="Bold" />
        <Button isToggle id="italic" icon={Italic} aria-label="Italic" />
        <Button isToggle id="underline" icon={Underline} aria-label="Underline" />
      </ButtonGroup>
    </div>
  ),
};

/** The connected group and the standard one on the dark scheme. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <ButtonGroup
        variant="connected"
        selectionMode="single"
        defaultSelectedKeys={["week"]}
        aria-label="Range"
      >
        <Button isToggle id="day">
          Day
        </Button>
        <Button isToggle id="week">
          Week
        </Button>
        <Button isToggle id="month">
          Month
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Call">
        <IconButton variant="tonal" icon={Mic} aria-label="Mute" />
        <Button variant="outlined">Join</Button>
      </ButtonGroup>
    </div>
  ),
};
