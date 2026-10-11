import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import tokens from "@french-tech-homies/design-system/tokens/resolved.json";
import { Body, Label } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Material motion tokens: named durations and easing curves. Hover a row to
 * play its transition. Values from `tokens/resolved.json`.
 */
const meta = {
  title: "MD3/Foundations/Motion",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Duration = keyof typeof tokens.motion.duration;
type Easing = keyof typeof tokens.motion.easing;

const durationClass: Record<Duration, string> = {
  "short-1": "duration-short-1",
  "short-2": "duration-short-2",
  "short-3": "duration-short-3",
  "short-4": "duration-short-4",
  "medium-1": "duration-medium-1",
  "medium-2": "duration-medium-2",
  "medium-3": "duration-medium-3",
  "medium-4": "duration-medium-4",
  "long-1": "duration-long-1",
  "long-2": "duration-long-2",
  "long-3": "duration-long-3",
  "long-4": "duration-long-4",
};

const easingClass: Record<Easing, string> = {
  standard: "ease-standard",
  "standard-accelerate": "ease-standard-accelerate",
  "standard-decelerate": "ease-standard-decelerate",
  emphasized: "ease-emphasized",
  "emphasized-accelerate": "ease-emphasized-accelerate",
  "emphasized-decelerate": "ease-emphasized-decelerate",
};

const easingUse: Record<Easing, string> = {
  standard: "small utility transitions (color, opacity)",
  "standard-accelerate": "exit, standard",
  "standard-decelerate": "enter, standard",
  emphasized: "large layout changes",
  "emphasized-accelerate": "exit (modals, side sheets)",
  "emphasized-decelerate": "enter (modals, side sheets)",
};

function Row({
  name,
  spec,
  className,
  note,
}: {
  name: string;
  spec: string;
  className: string;
  note?: string;
}) {
  return (
    <div className="group border-outline-variant flex items-center gap-4 border-b py-2">
      <div className="w-56 shrink-0">
        <Label size="medium" component="div" className="text-on-surface">
          {name}
        </Label>
        <Label
          size="small"
          component="div"
          className="text-on-surface-variant font-mono"
        >
          {spec}
        </Label>
        {note && (
          <Body size="small" className="text-on-surface-variant">
            {note}
          </Body>
        )}
      </div>
      <div className="bg-surface-container-highest rounded-shape-full relative h-8 flex-1">
        <div
          className={`bg-primary rounded-shape-full absolute top-1 left-1 h-6 w-6 transition-transform group-hover:translate-x-[calc(100cqw-2rem)] ${className}`}
        />
      </div>
    </div>
  );
}

/** Twelve named durations, 50 ms → 600 ms. Hover to run each. */
export const Durations: Story = {
  render: () => (
    <div className="bg-surface [container-type:inline-size] p-4">
      {(Object.keys(tokens.motion.duration) as Duration[]).map((d) => (
        <Row
          key={d}
          name={`duration-${d}`}
          spec={`${tokens.motion.duration[d]}ms`}
          className={`${durationClass[d]} ease-standard`}
        />
      ))}
    </div>
  ),
};

/** Six easing curves, all at duration-long-2 (500 ms) so the shape shows. */
export const Easing: Story = {
  render: () => (
    <div className="bg-surface [container-type:inline-size] p-4">
      {(Object.keys(tokens.motion.easing) as Easing[]).map((e) => (
        <Row
          key={e}
          name={`ease-${e}`}
          spec={tokens.motion.easing[e]}
          note={easingUse[e]}
          className={`${easingClass[e]} duration-long-2`}
        />
      ))}
    </div>
  ),
};

/** The enter/exit pairing the kit's overlays use. */
export const EnterExit: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <Body className="text-on-surface-variant mb-4 max-w-prose">
        Overlays enter with <code>emphasized-decelerate</code> over{" "}
        <code>medium-2</code> (300 ms) and leave with{" "}
        <code>emphasized-accelerate</code> over <code>short-4</code> (200 ms).
        Hover the card to preview the enter curve; move away for the exit.
      </Body>
      <div className="group bg-surface-container-low rounded-shape-large flex h-40 w-80 items-center justify-center">
        <div className="bg-surface-container-high rounded-shape-extra-large shadow-elevation-3 ease-emphasized-accelerate duration-short-4 group-hover:ease-emphasized-decelerate group-hover:duration-medium-2 flex h-24 w-56 scale-95 items-center justify-center opacity-0 transition-[opacity,transform] group-hover:scale-100 group-hover:opacity-100">
          <Label size="large" className="text-on-surface">
            Dialog
          </Label>
        </div>
      </div>
    </div>
  ),
};
