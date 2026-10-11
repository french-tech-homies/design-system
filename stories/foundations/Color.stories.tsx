import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import tokens from "@french-tech-homies/design-system/tokens/resolved.json";
import { Body, Label, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The 49 Material color roles, rendered from the live CSS variables so the
 * theme toolbar (light/dark) switches them, with the hex values from
 * `tokens/resolved.json` as labels. Source of truth: `tokens/theme.css`.
 */
const meta = {
  title: "MD3/Foundations/Color",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Role = keyof typeof tokens.color.light;

const roleVar = (role: Role) => `var(--md-sys-color-${role})`;

function Swatch({ role, on }: { role: Role; on?: Role }) {
  return (
    <div className="flex w-40 flex-col gap-1">
      <div
        className="border-outline-variant/40 rounded-shape-small flex h-16 items-end border p-2"
        style={{ backgroundColor: roleVar(role) }}
      >
        {on && (
          <span
            className="text-title-medium"
            style={{ color: roleVar(on) }}
            aria-hidden
          >
            Aa
          </span>
        )}
      </div>
      <Label size="medium" component="div" className="text-on-surface">
        {role}
      </Label>
      <Label
        size="small"
        component="div"
        className="text-on-surface-variant font-mono"
      >
        {tokens.color.light[role]} · {tokens.color.dark[role]}
      </Label>
    </div>
  );
}

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <Title size="medium" component="h2" className="text-on-surface">
        {title}
      </Title>
      {description && (
        <Body
          size="medium"
          className="text-on-surface-variant mb-3 max-w-prose"
        >
          {description}
        </Body>
      )}
      <div className="mt-3 flex flex-wrap gap-4">{children}</div>
    </section>
  );
}

const accentPairs: Array<[Role, Role]> = [
  ["primary", "on-primary"],
  ["primary-container", "on-primary-container"],
  ["secondary", "on-secondary"],
  ["secondary-container", "on-secondary-container"],
  ["tertiary", "on-tertiary"],
  ["tertiary-container", "on-tertiary-container"],
  ["error", "on-error"],
  ["error-container", "on-error-container"],
];

const surfaceRoles: Role[] = [
  "surface-dim",
  "surface",
  "surface-bright",
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
];

/** Accent roles with their `on-` pair — the only legal text color on each. */
export const Roles: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <Group
        title="Accent roles"
        description="Every bg-<role> is paired with text-on-<role>. Containers are the quiet versions used for tonal buttons, chips and selected states."
      >
        {accentPairs.map(([role, on]) => (
          <Swatch key={role} role={role} on={on} />
        ))}
      </Group>
      <Group title="Inverse (snackbars, tooltips)">
        <Swatch role="inverse-surface" on="inverse-on-surface" />
        <Swatch role="inverse-primary" />
      </Group>
    </div>
  ),
};

/** The surface tiers — depth without borders or shadows. */
export const Surfaces: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <Group
        title="Surface tiers"
        description="Pick a tier for depth (cards: low, menus/dialogs: container/high, inputs: highest). Do not add borders to fake elevation."
      >
        {surfaceRoles.map((role) => (
          <Swatch key={role} role={role} on="on-surface" />
        ))}
      </Group>
      <Group title="Text and outlines on surfaces">
        <Swatch role="on-surface" />
        <Swatch role="on-surface-variant" />
        <Swatch role="outline" />
        <Swatch role="outline-variant" />
        <Swatch role="surface-tint" />
      </Group>
      <Group title="Stacked example">
        <div className="bg-surface-container-lowest rounded-shape-large w-full max-w-md p-4">
          <div className="bg-surface-container-low rounded-shape-medium p-4">
            <div className="bg-surface-container rounded-shape-medium p-4">
              <div className="bg-surface-container-high rounded-shape-small p-4">
                <div className="bg-surface-container-highest rounded-shape-extra-small p-3">
                  <Body className="text-on-surface">
                    lowest → low → container → high → highest
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Group>
    </div>
  ),
};

/** Every role in `theme.css`, in file order. */
export const Palette: Story = {
  render: () => (
    <div className="bg-surface p-4">
      <Group title="All 49 roles">
        {(Object.keys(tokens.color.light) as Role[]).map((role) => (
          <Swatch key={role} role={role} />
        ))}
      </Group>
    </div>
  ),
};
