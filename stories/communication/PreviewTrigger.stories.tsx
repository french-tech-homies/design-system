import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Link } from "react-aria-components";

import Button from "@french-tech-homies/design-system/components/Button";
import {
  PreviewCard,
  PreviewTrigger,
} from "@french-tech-homies/design-system/components/PreviewTrigger";
import { Avatar } from "@french-tech-homies/design-system/components/Avatar";
import { Tag } from "@french-tech-homies/design-system/components/Tag";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * A preview: a non-modal popover that opens on hover, on focus and on long
 * press, and — unlike a tooltip — may hold interactive content.
 *
 * **MD3 has no page for this component.** The nearest thing the system does
 * define is the *rich tooltip*; reach for `Tooltip variant="rich"` when the
 * content is only read (a title, a paragraph, rows of label and value), and
 * for this when the reader operates it: a link, a button, a form. The surface is
 * drawn as a Material container — `surface-container-high`,
 * `rounded-shape-medium`, `shadow-elevation-2` — the same one the kit's `Menu`
 * popover uses, rather than an invented one.
 *
 * The trigger must be focusable: a link or a button, never a bare `<span>`.
 * That is what makes the preview reachable from the keyboard at all, and it is
 * the reason to take React Aria's behaviour rather than write hover handlers.
 */
const meta = {
  title: "MD3/Communication/PreviewTrigger",
  component: PreviewTrigger,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof PreviewTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

const linkClass =
  "text-primary underline decoration-primary underline-offset-4 outline-none outline-3 outline-offset-2 outline-ring focus-visible:outline-solid rounded-shape-extra-small cursor-pointer";

const products = [
  { name: "Margherita", price: 9.5 },
  { name: "Quattro formaggi", price: 12 },
  { name: "Diavola", price: 11.5 },
];

/** A list the reader can scan — the case a tooltip cannot carry. */
export const ProductList: Story = {
  render: () => (
    <Body size="medium" className="max-w-md">
      This promotion applies to{" "}
      <PreviewTrigger>
        <Link className={linkClass}>3 products</Link>
        <PreviewCard placement="right" className="w-80">
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <Body size="medium">{p.name}</Body>
                <Tag variant="tonal" color="primary">
                  €{p.price.toFixed(2)}
                </Tag>
              </div>
            ))}
          </div>
        </PreviewCard>
      </PreviewTrigger>{" "}
      when the diner orders two or more.
    </Body>
  ),
};

/** Interactive content is the point: a tooltip may not contain a button. */
export const WithAction: Story = {
  render: () => (
    <Body size="medium" className="max-w-md">
      Assigned to{" "}
      <PreviewTrigger>
        <Link className={linkClass}>Nour Haddad</Link>
        <PreviewCard className="w-80">
          <div className="flex items-center gap-3">
            <Avatar alt="Nour Haddad" fallback="NH" size={40} />
            <div className="min-w-0 flex-1">
              <Title size="small" component="div">
                Nour Haddad
              </Title>
              <Body size="small" colorRole="on-surface-variant">
                Staff · Pizzeria Bellini
              </Body>
            </div>
            <Button variant="text" size="xsmall">
              Message
            </Button>
          </div>
        </PreviewCard>
      </PreviewTrigger>{" "}
      since Tuesday.
    </Body>
  ),
};

/** Placement follows the trigger; the card flips when it would overflow. */
export const Placements: Story = {
  render: () => (
    <div className="flex items-center gap-10 py-16">
      {(["top", "bottom", "right"] as const).map((placement) => (
        <PreviewTrigger key={placement}>
          <Link className={linkClass}>{placement}</Link>
          <PreviewCard placement={placement} className="w-64">
            <Body size="medium">
              Opens on the {placement} of its trigger, and flips when there is
              not room.
            </Body>
          </PreviewCard>
        </PreviewTrigger>
      ))}
    </div>
  ),
};
