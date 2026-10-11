import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import tokens from "@french-tech-homies/design-system/tokens/resolved.json";
import StateLayer, {
  type StateLayerColor,
} from "@french-tech-homies/design-system/primitives/StateLayer";
import { Body, Label } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Material interaction states: a state layer in the content color whose
 * opacity follows hover / focus / press / drag, plus the disabled opacities.
 * Numbers from `tokens/resolved.json` (`state`).
 */
const meta = {
  title: "MD3/Foundations/Interaction states",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const states = [
  { name: "enabled", props: {} },
  { name: "hovered", props: { isHovered: true } },
  { name: "focused", props: { isFocusVisible: true } },
  { name: "pressed", props: { isPressed: true } },
  { name: "dragged", props: { isDragged: true } },
] as const;

const opacityOf = {
  enabled: 0,
  hovered: tokens.state.layerOpacity.hover,
  focused: tokens.state.layerOpacity.focus,
  pressed: tokens.state.layerOpacity.press,
  dragged: tokens.state.layerOpacity.drag,
};

function Tile({
  surface,
  color,
  label,
  children,
}: {
  surface: string;
  color: StateLayerColor;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-36 flex-col gap-2">
      <div
        className={`rounded-shape-medium relative flex h-16 items-center justify-center overflow-hidden ${surface}`}
      >
        {children}
        <Label size="large" className="relative">
          {label}
        </Label>
      </div>
      <Label size="small" component="div" className="text-on-surface-variant">
        {color}
      </Label>
    </div>
  );
}

/** One surface, every state. The layer is `on-surface` at 8/10/10/16 %. */
export const States: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <div className="flex flex-wrap gap-4">
        {states.map((s) => (
          <div key={s.name} className="flex w-36 flex-col gap-2">
            <div className="bg-surface-container-low text-on-surface rounded-shape-medium relative flex h-16 items-center justify-center overflow-hidden">
              <StateLayer color="on-surface" {...s.props} />
              <Label size="large" className="relative">
                {s.name}
              </Label>
            </div>
            <Label
              size="small"
              component="div"
              className="text-on-surface-variant font-mono"
            >
              opacity {Math.round(opacityOf[s.name] * 100)}%
            </Label>
          </div>
        ))}
      </div>
      <Body size="small" className="text-on-surface-variant mt-4 max-w-prose">
        Focus keys on <code>isFocusVisible</code>, never plain focus, so a mouse
        click does not leave a control highlighted. Press outranks focus, drag
        outranks both.
      </Body>
    </div>
  ),
};

/** The layer takes the content color of its container. */
export const OnColors: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <div className="flex flex-wrap gap-4">
        <Tile
          surface="bg-primary text-on-primary"
          color="on-primary"
          label="filled"
        >
          <StateLayer color="on-primary" isHovered />
        </Tile>
        <Tile
          surface="bg-secondary-container text-on-secondary-container"
          color="on-secondary-container"
          label="tonal"
        >
          <StateLayer color="on-secondary-container" isHovered />
        </Tile>
        <Tile
          surface="bg-surface-container-low text-primary"
          color="primary"
          label="elevated"
        >
          <StateLayer color="primary" isHovered />
        </Tile>
        <Tile
          surface="bg-surface text-on-surface-variant"
          color="on-surface-variant"
          label="chip"
        >
          <StateLayer color="on-surface-variant" isHovered />
        </Tile>
      </div>
    </div>
  ),
};

/** Disabled: content at 38 %, containers at 12 % of on-surface. */
export const Disabled: Story = {
  parameters: {
    a11y: {
      config: {
        // Showing MD3's disabled treatment is the point of this story, and
        // on-surface at 38 % never reaches 4.5:1 by construction. WCAG 1.4.3
        // exempts text that is part of an inactive user interface component,
        // so this is a rendering of the spec, not a defect.
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  render: () => (
    <div className="bg-surface flex flex-wrap items-center gap-4 p-4">
      <div className="bg-primary text-on-primary rounded-shape-full flex h-10 items-center px-6">
        <Label size="large">Enabled</Label>
      </div>
      <div className="bg-on-surface/12 rounded-shape-full flex h-10 items-center px-6">
        <Label size="large" className="text-on-surface/38">
          Disabled
        </Label>
      </div>
      <div className="border-outline rounded-shape-full flex h-10 items-center border px-6">
        <Label size="large" className="text-primary">
          Enabled
        </Label>
      </div>
      <div className="border-on-surface/12 rounded-shape-full flex h-10 items-center border px-6">
        <Label size="large" className="text-on-surface/38">
          Disabled
        </Label>
      </div>
      <Body size="small" className="text-on-surface-variant w-full max-w-prose">
        content {Math.round(tokens.state.disabledContentOpacity * 100)}% ·
        container {Math.round(tokens.state.disabledContainerOpacity * 100)}% —
        <code> opacity-38</code>, <code>bg-on-surface/12</code>.
      </Body>
    </div>
  ),
};
