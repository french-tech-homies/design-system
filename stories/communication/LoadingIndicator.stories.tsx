import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import { LoadingIndicator } from "@french-tech-homies/design-system/components/LoadingIndicator";
import {
  Body,
  Title,
} from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Material 3 Expressive's loading indicator: a looping morph through seven
 * Material shapes, for a wait of 200ms to 5s whose length is unknown. It
 * replaces the indeterminate circular progress indicator, and never becomes a
 * determinate one.
 *
 * `default` draws the active indicator alone in `primary`, on a surface;
 * `contained` puts it in `on-primary-container` on a `primary-container`
 * circle, over other content. 48dp by default, 24–240dp, the 38/48 ratio held.
 *
 * Like any progress indicator it needs a name that says what is loading.
 */
const meta = {
  title: "MD3/Communication/LoadingIndicator",
  component: LoadingIndicator,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "contained"] },
    size: { control: { type: "range", min: 24, max: 240, step: 4 } },
  },
  args: { "aria-label": "Loading news article" },
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The active indicator alone, placed directly on a surface. */
export const Default: Story = {};

/** On its container: for a loader placed over other content. */
export const Contained: Story = {
  args: { variant: "contained", "aria-label": "Refreshing page" },
};

/** 24 to 240dp; the indicator keeps 38/48 of the container at every size. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["default", "contained"] as const).map((variant) => (
        <div key={variant} className="flex items-end gap-8">
          {[24, 48, 96, 240].map((size) => (
            <LoadingIndicator
              key={size}
              variant={variant}
              size={size}
              aria-label={`Loading the ${size}dp ${variant} preview`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Inside a button that takes a few seconds to take effect: the indicator
    stands where the icon would, in the button's own content colour. */
export const InAButton: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="tonal">
        <LoadingIndicator
          size={24}
          aria-label="Checking for updates"
          classNames={{ activeIndicator: "fill-on-secondary-container" }}
          className="mr-2"
        />
        Checking
      </Button>
      <Button variant="outlined">
        <LoadingIndicator
          size={24}
          aria-label="Validating the form"
          className="mr-2"
        />
        Validating
      </Button>
    </div>
  ),
};

/** Over content, the contained form stands out; centred on what loads. */
export const OverContent: Story = {
  render: () => (
    <div className="bg-surface-container-highest rounded-shape-large relative grid w-[36rem] gap-3 overflow-hidden p-6">
      <Title size="medium" component="h3">
        Tonight&apos;s menu
      </Title>
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-4">
          <div className="bg-tertiary-container rounded-shape-medium size-14" />
          <Body colorRole="on-surface-variant">
            The dishes refresh as the kitchen confirms them.
          </Body>
        </div>
      ))}
      <div className="absolute inset-0 grid place-items-center">
        <LoadingIndicator
          variant="contained"
          aria-label="Refreshing the menu"
        />
      </div>
    </div>
  ),
};

/** Both forms on the dark scheme, so axe checks the pair there too. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => (
    <div className="bg-surface flex items-center gap-8 p-6">
      <LoadingIndicator aria-label="Loading news article" />
      <LoadingIndicator variant="contained" aria-label="Refreshing page" />
      <LoadingIndicator size={96} aria-label="Loading the gallery" />
    </div>
  ),
};
