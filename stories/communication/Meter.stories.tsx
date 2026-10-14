import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Meter } from "@french-tech-homies/design-system/components/Meter";

/**
 * A quantity within a known range (a quota, a disk's use, a score) on React
 * Aria's `Meter`. Not progress on a task: that is `ProgressIndicator`.
 *
 * Material 3 does not describe a meter, so this one borrows the determinate
 * linear progress indicator's anatomy: an **active indicator** in a colour
 * role (`primary` by default), a `secondary-container` **track**, a 4dp gap
 * between them, and a 4dp **stop indicator** at the trailing end. A value
 * that changes is drawn at once: a meter has no motion of its own.
 *
 * The label says what is measured, and colour never says it alone: an
 * `error` meter says why in its label or its value.
 */
const meta = {
  title: "MD3/Communication/Meter",
  component: Meter,
  parameters: {
    layout: "padded",
    a11y: {
      config: {
        rules: [
          {
            // React Aria writes `role="meter progressbar"`, `progressbar` the
            // fallback for a browser without `meter`. ARIA takes the first
            // role it knows, `meter`, which allows aria-value*; axe reads the
            // two words as one unknown role and refuses them. The rule stays
            // on for every other element, and the stories' tests read the
            // `meter` role and its values.
            id: "aria-allowed-attr",
            selector: '*:not([role="meter progressbar"])',
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "inline-radio",
      options: ["primary", "secondary", "tertiary", "error"],
    },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    showValue: { control: "boolean" },
    thickness: { control: { type: "range", min: 2, max: 12, step: 1 } },
  },
  args: { label: "Storage used", value: 62 },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A percentage, with its value beside the label. */
export const Default: Story = {
  args: { showValue: true },
  render: (args) => (
    <div className="w-96">
      <Meter {...args} />
    </div>
  ),
};

/** A scale of its own: three boards of five, said in words by `valueLabel`. */
export const CustomScale: Story = {
  args: {
    label: "Boards this month",
    value: 3,
    minValue: 0,
    maxValue: 5,
    formatOptions: { style: "decimal" },
    valueLabel: "3 of 5",
    showValue: true,
  },
  render: (args) => (
    <div className="w-96">
      <Meter {...args} />
    </div>
  ),
};

/** The four colour roles. The track stays `secondary-container`, and each
    label says what its colour means. */
const colors = () => (
  <div className="flex w-96 flex-col gap-6">
    <Meter label="Storage used" value={62} showValue />
    <Meter label="Seats taken" value={40} showValue color="secondary" />
    <Meter label="Budget spent" value={75} showValue color="tertiary" />
    <Meter label="Over your plan" value={100} valueLabel="6 of 5" showValue color="error" />
    <Meter label="Barely started" value={1} showValue />
    <Meter label="Nothing yet" value={0} showValue />
  </div>
);

export const Colors: Story = { render: colors };

/** 4dp is Material's baseline; the thickness is configurable, and the stop
    indicator stays a 4dp dot centred in the rounded end. */
export const Thickness: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      {[4, 8, 12].map((thickness) => (
        <Meter
          key={thickness}
          label={`${thickness}dp`}
          value={45}
          thickness={thickness}
        />
      ))}
    </div>
  ),
};

/** Right to left, the bar is mirrored: it fills from the right. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar" className="w-96">
      <Meter label="التخزين المستخدم" value={62} showValue />
    </div>
  ),
};

/** The four colours in the dark scheme. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => <div className="bg-surface p-4">{colors()}</div>,
};
