import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTrigger,
} from "@french-tech-homies/design-system/components/Disclosure";
import { Tag } from "@french-tech-homies/design-system/components/Tag";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Expand and collapse — one section (`Disclosure`) or a set of them
 * (`DisclosureGroup`, what other systems call an accordion). Behaviour is
 * React Aria's, so the trigger carries `aria-expanded` / `aria-controls`, the
 * panel is labelled by its trigger, and Enter and Space toggle without moving
 * focus.
 *
 * **Material 3 has no page for this component.** M2 had an expansion panel;
 * M3 dropped it and never replaced it. The anatomy is assembled from MD3
 * parts — a 56dp list row with a state layer, `outline-variant` hairlines,
 * the shape scale, and MD3's motion tokens for the chevron and the panel —
 * and the component's doc comment says exactly which parts and why.
 */
const meta = {
  title: "MD3/Containment/Disclosure",
  component: Disclosure,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "outlined"] },
    isDisabled: { control: "boolean" },
  },
  // Every story renders its own tree; `children` is required on the component,
  // so give the args a null default rather than repeating it per story.
  args: { children: null },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

const faq = [
  {
    id: "hours",
    q: "Can I change a menu's serving hours?",
    a: "Yes. A menu is active between the times you set, and a table shows whichever menu is live when the diner scans. Outside those hours the storefront falls back to the venue's default menu.",
  },
  {
    id: "codes",
    q: "What happens to a printed QR code if I rename the table?",
    a: "Nothing. Printed codes point at a stable identifier, not at the name, so renaming a table never invalidates a code that is already on it.",
  },
  {
    id: "billing",
    q: "Is Ordering billed per venue?",
    a: "Per venue, monthly. QR Studio is billed on your account, separately, so the two can be bought independently.",
  },
];

/** One section on its own — the collapsible case. */
export const Single: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <Disclosure {...args}>
        <DisclosureHeader>Can I change a menu&apos;s serving hours?</DisclosureHeader>
        <DisclosurePanel>
          Yes. A menu is active between the times you set, and a table shows
          whichever menu is live when the diner scans.
        </DisclosurePanel>
      </Disclosure>
    </div>
  ),
};

/** A group where opening one closes the last — the default accordion. */
export const Group: Story = {
  render: () => (
    <div className="max-w-2xl">
      <DisclosureGroup defaultExpandedKeys={["hours"]}>
        {faq.map((item) => (
          <Disclosure key={item.id} id={item.id}>
            <DisclosureHeader>{item.q}</DisclosureHeader>
            <DisclosurePanel>{item.a}</DisclosurePanel>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </div>
  ),
};

/** `allowsMultipleExpanded` lets any number stay open at once. */
export const MultipleExpanded: Story = {
  render: () => (
    <div className="max-w-2xl">
      <DisclosureGroup
        allowsMultipleExpanded
        defaultExpandedKeys={["hours", "billing"]}
      >
        {faq.map((item) => (
          <Disclosure key={item.id} id={item.id}>
            <DisclosureHeader>{item.q}</DisclosureHeader>
            <DisclosurePanel>{item.a}</DisclosurePanel>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </div>
  ),
};

/** `outlined` boxes each section instead of separating them with a hairline —
    for sections that are not one list. The group passes its variant down, so
    it is set in one place. */
export const Outlined: Story = {
  render: () => (
    <div className="max-w-2xl">
      <DisclosureGroup variant="outlined" defaultExpandedKeys={["codes"]}>
        {faq.map((item) => (
          <Disclosure key={item.id} id={item.id}>
            <DisclosureHeader>{item.q}</DisclosureHeader>
            <DisclosurePanel>{item.a}</DisclosurePanel>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </div>
  ),
};

/** A leading icon, a non-interactive trailing slot, and a disabled row. */
export const WithLeadingAndTrailing: Story = {
  render: () => (
    <div className="max-w-2xl">
      <DisclosureGroup variant="outlined">
        <Disclosure id="orders">
          <DisclosureHeader trailing={<Tag color="primary">3 open</Tag>}>
            Tonight&apos;s orders
          </DisclosureHeader>
          <DisclosurePanel>
            Three orders are in the kitchen queue.
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="archive" isDisabled>
          <DisclosureHeader>Archive (nothing yet)</DisclosureHeader>
          <DisclosurePanel>Unreachable while disabled.</DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </div>
  ),
};

/**
 * `DisclosureTrigger` on its own, for a header that is not a heading — here a
 * summary row whose content is the affordance. `isUnstyled` hands the panel's
 * padding back to the caller.
 */
export const CustomTrigger: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Disclosure variant="outlined" defaultExpanded>
        <DisclosureTrigger
          trailing={
            <Body size="small" className="text-on-surface-variant">
              €18.50
            </Body>
          }
        >
          Table 12 · 2 items
        </DisclosureTrigger>
        <DisclosurePanel isUnstyled contentClassName="divide-y divide-outline-variant">
          {["Margherita ×1", "Tiramisu ×1"].map((line) => (
            <Body key={line} size="medium" className="px-4 py-3">
              {line}
            </Body>
          ))}
        </DisclosurePanel>
      </Disclosure>
    </div>
  ),
};
