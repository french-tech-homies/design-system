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
import { Tag } from "@french-tech-homies/design-system/components/Tag";

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

const PRIMITIVES = {
  display: Display,
  headline: Headline,
  title: Title,
  body: Body,
  label: Label,
} as const;

const SIZES = ["large", "medium", "small"] as const;

/** Every primitive at every size, a raw `text-<role>` element beside each,
    and a kit component that draws its text through a primitive. */
function WeightSamples({ name }: { name: string }) {
  return (
    <div data-testid={name} className="flex flex-col gap-2">
      <Label size="small" component="div" colorRole="on-surface-variant">
        {name}
      </Label>
      {(Object.keys(PRIMITIVES) as (keyof typeof PRIMITIVES)[]).map(
        (variant) => {
          const Primitive = PRIMITIVES[variant];
          return SIZES.map((size) => {
            const role: TypeRole = `${variant}-${size}`;
            return (
              <div key={role} className="flex items-baseline gap-6">
                <Primitive
                  size={size}
                  component="div"
                  data-role={role}
                  data-drawn="primitive"
                >
                  {role}
                </Primitive>
                <span
                  className={typeClass[role]}
                  data-role={role}
                  data-drawn="class"
                >
                  {role}
                </span>
              </div>
            );
          });
        },
      )}
      <div>
        <Tag>a tag</Tag>
      </div>
    </div>
  );
}

/** A theme that gives every role a weight Material gives none of them. */
const HEAVY = Object.fromEntries(
  (Object.keys(typeClass) as TypeRole[]).map((role) => [
    `--md-sys-typescale-${role}-weight`,
    "700",
  ]),
) as React.CSSProperties;

/**
 * A primitive draws its role as the theme gives it, weight included: it
 * writes no weight class, so the weight is the one its `text-<role>` utility
 * reads from `--md-sys-typescale-<role>-weight`. The first group is the theme
 * as it stands (Material's weights, or the preset's). The second sets every
 * role's weight the way a theme generated from a project's DESIGN.md does,
 * to 700. In both, a primitive and the raw class beside it draw the same
 * weight, and so does a `Tag`, which draws its word through `Label`.
 * Regression cover: before, the primitives wrote `font-medium` and
 * `font-regular`, which won over the theme's weight.
 */
export const WeightFromTheTheme: Story = {
  render: () => (
    <div className="bg-surface text-on-surface flex flex-wrap gap-12 p-4">
      <WeightSamples name="the theme as it stands" />
      <div style={HEAVY}>
        <WeightSamples name="a theme that sets every weight to 700" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const weight = (group: string, role: TypeRole, drawn: string) =>
      getComputedStyle(
        canvas
          .getByTestId(group)
          .querySelector(`[data-role="${role}"][data-drawn="${drawn}"]`)!,
      ).fontWeight;
    const tag = (group: string) =>
      getComputedStyle(within(canvas.getByTestId(group)).getByText("a tag"))
        .fontWeight;
    const STANDS = "the theme as it stands";
    const HEAVIER = "a theme that sets every weight to 700";

    for (const role of Object.keys(typeClass) as TypeRole[]) {
      // The primitive draws what the role's own utility draws, in any theme.
      await expect(`${role} ${weight(STANDS, role, "primitive")}`).toBe(
        `${role} ${weight(STANDS, role, "class")}`,
      );
      // A weight the theme gives a role is the weight the primitive draws.
      await expect(`${role} ${weight(HEAVIER, role, "primitive")}`).toBe(
        `${role} 700`,
      );
      await expect(`${role} ${weight(HEAVIER, role, "class")}`).toBe(
        `${role} 700`,
      );
    }
    // title-large is regular from its token, in both presets: neither moves
    // it. No compound in the primitive says so any more.
    await expect(weight(STANDS, "title-large", "primitive")).toBe("400");
    await expect(weight(STANDS, "body-medium", "primitive")).toBe("400");
    // A kit component that draws its text through a primitive follows too.
    await expect(tag(STANDS)).toBe(weight(STANDS, "label-medium", "class"));
    await expect(tag(HEAVIER)).toBe("700");
  },
};

/** Every primitive at every size, by its role. */
function FamilySamples({ name }: { name: string }) {
  return (
    <div data-testid={name} className="flex flex-col gap-1">
      <Label size="small" component="div" colorRole="on-surface-variant">
        {name}
      </Label>
      {(Object.keys(PRIMITIVES) as (keyof typeof PRIMITIVES)[]).map(
        (variant) => {
          const Primitive = PRIMITIVES[variant];
          return SIZES.map((size) => (
            <Primitive
              key={size}
              size={size}
              component="div"
              className="truncate"
              data-role={`${variant}-${size}`}
            >
              {variant}-{size}
            </Primitive>
          ));
        },
      )}
    </div>
  );
}

/** A theme whose DESIGN.md writes a family on `label-large` alone. */
const ONE_ROLE = {
  "--md-sys-typescale-label-large-font": "Georgia, serif",
} as React.CSSProperties;

/** A subtree that overrides the plain face, as a preset does. */
const ONE_FACE = {
  "--md-sys-typescale-plain-font": '"Courier New", monospace',
} as React.CSSProperties;

/**
 * A primitive draws its role in the role's family. Material gives each role
 * a font token of its own, which reads one of the two faces unless the theme
 * says otherwise: so does `--md-sys-typescale-<role>-font` here, through the
 * `font-<role>` utility the primitive writes. The first group is the theme
 * as it stands. The second gives `label-large` a family of its own, the way
 * a theme generated from a DESIGN.md that writes one on that role does: only
 * that role moves. The third overrides the plain face on a subtree, as a
 * preset does: every body and label role follows, having no family of its
 * own, and no brand role does. The last line is a caller's own `font-mono`
 * on a primitive, which wins.
 */
export const FamilyFromTheTheme: Story = {
  render: () => (
    <div className="bg-surface text-on-surface flex flex-col gap-6 p-4">
      <div className="grid grid-cols-3 gap-8">
        <FamilySamples name="the theme as it stands" />
        <div style={ONE_ROLE}>
          <FamilySamples name="a family on label-large alone" />
        </div>
        <div style={ONE_FACE}>
          <FamilySamples name="the plain face overridden on a subtree" />
        </div>
      </div>
      <Body size="medium" className="font-mono font-bold" data-testid="own">
        a caller&apos;s own font-mono and font-bold on Body
      </Body>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const family = (group: string, role: TypeRole) =>
      getComputedStyle(
        canvas.getByTestId(group).querySelector(`[data-role="${role}"]`)!,
      ).fontFamily;
    const STANDS = "the theme as it stands";
    const ONE = "a family on label-large alone";
    const FACE = "the plain face overridden on a subtree";

    for (const role of Object.keys(typeClass) as TypeRole[]) {
      const isPlain = /^(body|label)/.test(role);
      // A family on one role moves that role, and no other.
      await expect(`${role}: ${family(ONE, role)}`).toBe(
        `${role}: ${role === "label-large" ? "Georgia, serif" : family(STANDS, role)}`,
      );
      // A face overridden where the text is drawn moves every role that
      // has no family of its own, and only the roles of that face.
      await expect(`${role}: ${family(FACE, role)}`).toBe(
        `${role}: ${isPlain ? '"Courier New", monospace' : family(STANDS, role)}`,
      );
    }
    // A caller's own family wins, and its weight stays beside it.
    const own = getComputedStyle(canvas.getByTestId("own"));
    await expect(own.fontFamily).toMatch(/monospace$/);
    await expect(own.fontFamily).not.toBe(family(STANDS, "body-medium"));
    await expect(own.fontWeight).toBe("700");
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
