import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { ProgressIndicator } from "@french-tech-homies/design-system/components/ProgressIndicator";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Linear and circular progress indicators, determinate and indeterminate, on
 * React Aria's `ProgressBar`.
 *
 * The anatomy is the spec's: a `primary` **active indicator**, a
 * `secondary-container` **track**, a 4dp gap between them, and — on the
 * determinate linear bar only — a 4dp **stop indicator** at the trailing end.
 * Both defaults are the baseline tokens: 4dp thick, a 40dp circle.
 *
 * The label is not decoration. A progress indicator is a purely visual cue, so
 * it needs a name that says *what* is loading ("Loading activity", not
 * "Loading"): pass `label` for a visible one, or `aria-label` when the copy
 * around it already says so.
 */
const meta = {
  title: "MD3/Communication/ProgressIndicator",
  component: ProgressIndicator,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["linear", "circular"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    isIndeterminate: { control: "boolean" },
    showValue: { control: "boolean" },
    size: { control: { type: "range", min: 24, max: 120, step: 4 } },
    thickness: { control: { type: "range", min: 2, max: 12, step: 1 } },
  },
  args: { label: "Uploading menu", value: 62 },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Known progress: the bar fills, the stop indicator marks the end of the track. */
export const LinearDeterminate: Story = {
  args: { showValue: true },
  render: (args) => (
    <div className="w-96">
      <ProgressIndicator {...args} />
    </div>
  ),
};

/** Unknown progress: one segment sweeps the full track, and there is no stop
    indicator — the spec uses it on determinate linear indicators only. */
export const LinearIndeterminate: Story = {
  args: { label: "Loading activity", isIndeterminate: true },
  render: (args) => (
    <div className="w-96">
      <ProgressIndicator {...args} />
    </div>
  ),
};

/** The same two states as a ring. Centre it on whatever is loading. */
export const CircularDeterminate: Story = {
  args: { variant: "circular", label: "Saving", value: 40 },
};

export const CircularIndeterminate: Story = {
  args: {
    variant: "circular",
    label: "Loading orders",
    isIndeterminate: true,
    value: undefined,
  },
};

/** Circles run 24–240dp; the thickness follows so the proportions hold. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      {(
        [
          { size: 24, thickness: 3 },
          { size: 40, thickness: 4 },
          { size: 72, thickness: 7 },
        ] as const
      ).map(({ size, thickness }) => (
        <ProgressIndicator
          key={size}
          variant="circular"
          size={size}
          thickness={thickness}
          value={70}
          aria-label={`Rendering codes at ${size} density`}
        />
      ))}
    </div>
  ),
};

/** Every combination at once — the four the kit ships. */
export const AllFour: Story = {
  render: () => (
    <div className="grid w-[36rem] grid-cols-2 items-center gap-8">
      <ProgressIndicator label="Determinate linear" value={45} showValue />
      <ProgressIndicator label="Indeterminate linear" isIndeterminate />
      <ProgressIndicator
        variant="circular"
        label="Determinate circular"
        value={45}
      />
      <ProgressIndicator
        variant="circular"
        label="Indeterminate circular"
        isIndeterminate
      />
    </div>
  ),
};

/**
 * Placement, from the guidelines: a single linear indicator along the edge of
 * the container that is loading — not one per element — and a circular one
 * centred in the empty space where the new content will appear.
 */
export const InContext: Story = {
  render: () => (
    <div className="flex w-[36rem] flex-col gap-6">
      <div className="bg-surface border-outline-variant rounded-shape-large overflow-hidden border">
        <ProgressIndicator
          aria-label="Loading tonight's orders"
          isIndeterminate
          className="gap-0"
        />
        <div className="flex flex-col gap-1 p-4">
          <Title size="medium" component="h3">
            Tonight&apos;s orders
          </Title>
          <Body size="medium" colorRole="on-surface-variant">
            The bar sits on the edge of the container that is loading.
          </Body>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-shape-large flex h-40 flex-col items-center justify-center gap-3">
        <ProgressIndicator
          variant="circular"
          aria-label="Loading more activity"
          isIndeterminate
        />
        <Body size="small" colorRole="on-surface-variant">
          Where the new rows will appear
        </Body>
      </div>

      <div className="flex items-center gap-3">
        <ProgressIndicator
          variant="circular"
          size={24}
          thickness={3}
          aria-label="Reprinting table codes"
          isIndeterminate
        />
        <Body size="small" colorRole="on-surface-variant">
          At 24dp — the spec&apos;s smallest circle — beside the row it belongs
          to. `Button` has its own `isLoading` spinner; do not nest one inside
          it.
        </Body>
      </div>
    </div>
  ),
};
