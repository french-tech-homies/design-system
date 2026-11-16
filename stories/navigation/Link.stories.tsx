import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Link } from "@french-tech-homies/design-system/components/Link";
import {
  Body,
  Label,
} from "@french-tech-homies/design-system/primitives/Typography";

/**
 * A text link: a word or a phrase that goes somewhere, in a sentence or in a
 * list of links. Not a Material 3 component: it is drawn in the primary
 * role, underlined so that colour is not its only cue, and takes the type of
 * the text around it. A link that should look like a button is a `Button`
 * with `href`.
 */
const meta = {
  title: "MD3/Navigation/Link",
  component: Link,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["primary", "inherit"] },
    underline: { control: "select", options: ["always", "hover"] },
  },
  args: { children: "Terms of service", href: "#terms" },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** In running text: primary and underlined, at the size of the sentence. */
export const InASentence: Story = {
  render: (args) => (
    <Body className="max-w-sm text-on-surface">
      By creating an account you agree to the <Link {...args} /> and to the{" "}
      <Link href="#privacy">privacy policy</Link>.
    </Body>
  ),
};

/** In a list of links, such as a footer column: the colour of the list, and
 *  an underline only under the pointer and on keyboard focus. */
export const InAList: Story = {
  render: () => (
    <nav aria-label="Product" className="text-on-surface-variant">
      <Label size="large" component="div" className="mb-2 text-on-surface">
        Product
      </Label>
      <ul className="flex flex-col gap-2">
        {["Features", "Pricing", "Changelog", "Status"].map((name) => (
          <li key={name}>
            <Body component="span">
              <Link
                href={`#${name.toLowerCase()}`}
                color="inherit"
                underline="hover"
              >
                {name}
              </Link>
            </Body>
          </li>
        ))}
      </ul>
    </nav>
  ),
};

/** A link to another site opens where its `target` says. */
export const External: Story = {
  args: {
    children: "Material Design 3",
    href: "https://m3.material.io",
    target: "_blank",
    rel: "noreferrer",
  },
  render: (args) => (
    <Body className="text-on-surface">
      The spec is at <Link {...args} />.
    </Body>
  ),
};

/** Disabled: 38% of on-surface, no underline, out of the tab order. */
export const Disabled: Story = {
  args: { children: "Invoices", isDisabled: true },
  render: (args) => (
    <Body className="text-on-surface">
      <Link {...args} /> are available once the first order is placed.
    </Body>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // MD3's disabled content is `on-surface` at 38 %, which never
            // reaches 4.5:1. WCAG 1.4.3 exempts inactive components.
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
};
