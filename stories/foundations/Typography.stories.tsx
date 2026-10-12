import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";

import tokens from "@french-tech-homies/design-system/tokens/resolved.json";
import {
  Body,
  Display,
  Headline,
  Label,
  Title,
} from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The 15-role Material type scale. Specs come from `tokens/resolved.json`
 * (px), the rendering from the `text-<role>` utilities in `theme.v4.css`.
 */
const meta = {
  title: "MD3/Foundations/Typography",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type TypeRole = keyof typeof tokens.typography;

// Static map so Tailwind can see every class at build time.
const typeClass: Record<TypeRole, string> = {
  "display-large": "text-display-large",
  "display-medium": "text-display-medium",
  "display-small": "text-display-small",
  "headline-large": "text-headline-large",
  "headline-medium": "text-headline-medium",
  "headline-small": "text-headline-small",
  "title-large": "text-title-large",
  "title-medium": "text-title-medium",
  "title-small": "text-title-small",
  "body-large": "text-body-large",
  "body-medium": "text-body-medium",
  "body-small": "text-body-small",
  "label-large": "text-label-large",
  "label-medium": "text-label-medium",
  "label-small": "text-label-small",
};

/** Every role with its size / line-height / tracking / weight. */
export const Scale: Story = {
  render: () => (
    <div className="bg-surface text-on-surface p-4">
      <table className="w-full border-collapse">
        <tbody>
          {(Object.keys(tokens.typography) as TypeRole[]).map((role) => {
            const spec = tokens.typography[role];
            return (
              <tr key={role} className="border-outline-variant border-b">
                <td className="w-40 py-3 pr-4 align-baseline">
                  <Label size="medium" component="div">
                    {role}
                  </Label>
                  <Label
                    size="small"
                    component="div"
                    className="text-on-surface-variant font-mono"
                  >
                    {spec.fontSize}/{spec.lineHeight}
                    {spec.letterSpacing
                      ? ` · ${spec.letterSpacing}`
                      : ""} · {spec.fontWeight}
                  </Label>
                </td>
                <td className={`py-3 align-baseline ${typeClass[role]}`}>
                  The quick brown fox jumps over the lazy dog
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ),
};

/** The primitives, used the way a screen uses them. */
export const Primitives: Story = {
  render: () => (
    <div className="bg-surface text-on-surface flex max-w-2xl flex-col gap-4 p-4">
      <Display size="small">Design your QR code</Display>
      <Headline size="medium">Table ordering, without the app</Headline>
      <Title size="large">Menus</Title>
      <Body size="large">
        Body large is the reading size for storefront descriptions and long
        supporting text. It uses the 16/24 role with 0.5px tracking.
      </Body>
      <Body>
        Body medium is the default for lists, cards and dialogs — 14/20 with
        0.25px tracking. Use it when the text is scanned rather than read.
      </Body>
      <Body size="small" className="text-on-surface-variant">
        Body small carries captions and helper text in on-surface-variant.
      </Body>
      <div className="flex items-center gap-4">
        <Label size="large">Label large — buttons</Label>
        <Label size="medium">Label medium — chips, nav</Label>
        <Label size="small">Label small — badges</Label>
      </div>
    </div>
  ),
};

const SAMPLES = [
  ["An identifier", "run-7f3a9c2e"],
  ["A time", "14:02:37"],
  ["An amount", "1,284.50"],
] as const;

function FaceSamples({ face, className }: { face: string; className: string }) {
  return (
    <div data-testid={face} className="flex flex-col gap-1">
      <Label size="small" component="div" colorRole="on-surface-variant">
        {face}
      </Label>
      {SAMPLES.map(([name, text]) => (
        <Body key={name} size="large" component="div" className={className}>
          {text}
        </Body>
      ))}
    </div>
  );
}

/**
 * The mono face is the project's: it writes `font-mono` where it wants one
 * (an identifier, a time, an amount) and no kit component uses it. The face
 * is named in DESIGN.md as `typography.mono.fontFamily`; with none named, as
 * in the first row, it is the system's monospace. The second row sets the
 * token the way a generated theme does, to a family a project named. The
 * text keeps its type role: only the family moves.
 */
export const MonoFace: Story = {
  render: () => (
    <div className="bg-surface text-on-surface flex flex-col gap-6 p-4">
      <div className="flex flex-wrap gap-12">
        <FaceSamples face="font-plain" className="font-plain" />
        <FaceSamples face="font-mono" className="font-mono" />
      </div>
      <div
        className="flex flex-wrap gap-12"
        style={
          {
            "--md-sys-typescale-mono-font": '"Courier New", monospace',
          } as React.CSSProperties
        }
      >
        <FaceSamples face="font-plain, a face named" className="font-plain" />
        <FaceSamples face="font-mono, a face named" className="font-mono" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const family = (face: string) =>
      getComputedStyle(canvas.getByTestId(face).lastElementChild!).fontFamily;
    const size = (face: string) =>
      getComputedStyle(canvas.getByTestId(face).lastElementChild!).fontSize;

    await expect(family("font-mono")).toMatch(/^ui-monospace,.*monospace$/);
    await expect(family("font-mono")).not.toBe(family("font-plain"));
    await expect(family("font-mono, a face named")).toBe(
      '"Courier New", monospace',
    );
    // Naming a mono face moves nothing that did not ask for it.
    await expect(family("font-plain, a face named")).toBe(family("font-plain"));
    await expect(size("font-mono")).toBe(size("font-plain"));
  },
};

/**
 * The primitives assert no content color, so a `bg-<role>` container that
 * carries its `text-on-<role>` re-colors every role inside it — nothing here
 * passes a `className` or a `color`. Regression cover for #124: before it, the
 * primitives hard-coded `text-on-surface` and every one of these panels
 * rendered on-surface text on a colored container (2.57:1 under Material,
 * 1.77:1 under Editorial). axe checks the contrast, under both presets.
 */
export const OnColoredContainers: Story = {
  render: () => (
    <div className="grid gap-4 p-4 sm:grid-cols-2">
      {(
        [
          ["bg-primary text-on-primary", "primary / on-primary"],
          [
            "bg-primary-container text-on-primary-container",
            "primary-container / on-primary-container",
          ],
          ["bg-secondary text-on-secondary", "secondary / on-secondary"],
          [
            "bg-secondary-container text-on-secondary-container",
            "secondary-container / on-secondary-container",
          ],
          ["bg-tertiary text-on-tertiary", "tertiary / on-tertiary"],
          ["bg-error text-on-error", "error / on-error"],
          [
            "bg-inverse-surface text-inverse-on-surface",
            "inverse-surface / inverse-on-surface",
          ],
          ["bg-surface-container-high", "surface-container-high / ambient"],
        ] as const
      ).map(([surface, name]) => (
        <div key={name} className={`rounded-shape-large p-4 ${surface}`}>
          <Label size="small" component="div" className="font-mono">
            {name}
          </Label>
          <Display size="small">Display</Display>
          <Headline size="medium">Headline</Headline>
          <Title size="large">Title</Title>
          <Body>Body — the reading default, inheriting the container.</Body>
          <Label size="large" component="div">
            Label
          </Label>
        </div>
      ))}
    </div>
  ),
};

/**
 * `colorRole` states the role when inheritance is not what you want: secondary
 * text under a heading, an accent label on a neutral surface. The last panel
 * shows the precedence — a `className` still wins over `colorRole`.
 */
export const StatedColor: Story = {
  render: () => (
    <div className="bg-surface flex max-w-2xl flex-col gap-4 p-4">
      <div>
        <Title size="medium">Inherits the surface (on-surface)</Title>
        <Body colorRole="on-surface-variant">
          <code>colorRole=&quot;on-surface-variant&quot;</code> — supporting text
          under a heading, the most common reason to state a role.
        </Body>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Label size="large" colorRole="primary">
          primary
        </Label>
        <Label size="large" colorRole="secondary">
          secondary
        </Label>
        <Label size="large" colorRole="tertiary">
          tertiary
        </Label>
        <Label size="large" colorRole="error">
          error
        </Label>
      </div>
      <div className="bg-primary rounded-shape-large p-4">
        <Body colorRole="on-primary">
          A container that states no pair:{" "}
          <code>colorRole=&quot;on-primary&quot;</code> carries it instead.
        </Body>
        <Body colorRole="on-surface" className="text-on-primary">
          <code>className</code> wins over <code>colorRole</code>.
        </Body>
      </div>
    </div>
  ),
};

/** Roles composed into one card: headline, supporting text, action label. */
export const InContext: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <div className="bg-surface-container-low rounded-shape-large w-96 p-4">
        <Label
          size="medium"
          className="text-on-surface-variant"
          component="div"
        >
          TABLE 12
        </Label>
        <Headline size="small" component="h3" className="text-on-surface mt-1">
          Two orders in progress
        </Headline>
        <Body className="text-on-surface-variant mt-2">
          Kafta ×2, Baklava ×1 — placed 4 minutes ago from the storefront.
        </Body>
        <div className="mt-4 flex justify-end">
          <Label size="large" className="text-primary">
            Open orders
          </Label>
        </div>
      </div>
    </div>
  ),
};
