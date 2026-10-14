import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import tokens from "@french-tech-homies/design-system/tokens/resolved.json";
import { Body, Label, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Shape (corner radius) and elevation (tonal surface + shadow) scales.
 * Values from `tokens/resolved.json`; utilities from `theme.v4.css`.
 */
const meta = {
  title: "MD3/Foundations/Shape & elevation",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type ShapeStep = keyof typeof tokens.shape;

const shapeClass: Record<ShapeStep, string> = {
  "extra-small": "rounded-shape-extra-small",
  small: "rounded-shape-small",
  medium: "rounded-shape-medium",
  large: "rounded-shape-large",
  "large-increased": "rounded-shape-large-increased",
  "extra-large": "rounded-shape-extra-large",
  full: "rounded-shape-full",
};

const shapeUse: Record<ShapeStep, string> = {
  "extra-small": "menus, tooltips, text fields",
  small: "chips, snackbars",
  medium: "cards, filled buttons in lists",
  large: "cards (elevated), side sheets, extended FAB",
  "large-increased": "connected button groups, split buttons",
  "extra-large": "dialogs, bottom sheets, large FAB",
  full: "buttons, icon buttons, sliders",
};

const elevationClass = {
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
  5: "shadow-elevation-5",
} as const;

const elevationUse = {
  1: "elevated card, elevated button (rest)",
  2: "elevated button (hover), tooltip, menu",
  3: "FAB (rest), search bar",
  4: "FAB (hover), dragged card",
  5: "modal side sheet",
} as const;

/** The six corner-radius steps, each with its default use. */
export const Shape: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <div className="flex flex-wrap gap-6">
        {(Object.keys(tokens.shape) as ShapeStep[]).map((step) => (
          <div key={step} className="flex w-44 flex-col gap-2">
            <div
              className={`bg-primary-container border-primary h-24 w-full border-2 ${shapeClass[step]}`}
            />
            <Label size="medium" component="div" className="text-on-surface">
              shape-{step}
            </Label>
            <Label
              size="small"
              component="div"
              className="text-on-surface-variant font-mono"
            >
              {tokens.shape[step] >= 9999 ? "pill" : `${tokens.shape[step]}px`}
            </Label>
            <Body size="small" className="text-on-surface-variant">
              {shapeUse[step]}
            </Body>
          </div>
        ))}
      </div>
    </div>
  ),
};

/** Five shadow levels on the surface they usually sit on. */
export const Elevation: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <div className="flex flex-wrap gap-8">
        {([1, 2, 3, 4, 5] as const).map((level) => (
          <div key={level} className="flex w-44 flex-col gap-2">
            <div
              className={`bg-surface-container-low rounded-shape-medium flex h-24 w-full items-center justify-center ${elevationClass[level]}`}
            >
              <Title size="large" className="text-on-surface">
                {level}
              </Title>
            </div>
            <Label size="medium" component="div" className="text-on-surface">
              shadow-elevation-{level}
            </Label>
            <Body size="small" className="text-on-surface-variant">
              {elevationUse[level]}
            </Body>
          </div>
        ))}
      </div>
      <Body size="small" className="text-on-surface-variant mt-6 max-w-prose">
        Shadows are built from <code>--md-sys-color-shadow</code> at 30 % / 15 %
        alpha. In dark schemes depth comes mostly from the surface tier, so keep
        the shadow level low.
      </Body>
    </div>
  ),
};

/** Shape and elevation combined the way components use them. */
export const OnComponents: Story = {
  render: () => (
    <div className="bg-surface flex flex-wrap items-start gap-6 p-4">
      <div className="bg-surface-container-highest rounded-shape-medium w-56 p-4">
        <Title size="medium" className="text-on-surface">
          Filled card
        </Title>
        <Body size="small" className="text-on-surface-variant">
          shape-medium, no shadow
        </Body>
      </div>
      <div className="bg-surface-container-low rounded-shape-medium shadow-elevation-1 w-56 p-4">
        <Title size="medium" className="text-on-surface">
          Elevated card
        </Title>
        <Body size="small" className="text-on-surface-variant">
          shape-medium, elevation-1
        </Body>
      </div>
      <div className="bg-surface-container-high rounded-shape-extra-large shadow-elevation-3 w-56 p-6">
        <Title size="medium" className="text-on-surface">
          Dialog
        </Title>
        <Body size="small" className="text-on-surface-variant">
          shape-extra-large, elevation-3
        </Body>
      </div>
      <div className="bg-primary-container text-on-primary-container rounded-shape-large shadow-elevation-3 flex h-14 w-14 items-center justify-center">
        <Label size="large">FAB</Label>
      </div>
      <div className="bg-primary text-on-primary rounded-shape-full flex h-10 items-center px-6">
        <Label size="large">Button</Label>
      </div>
    </div>
  ),
};
