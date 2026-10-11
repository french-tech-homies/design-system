import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
} from "@french-tech-homies/design-system/components/Disclosure";

/**
 * Behaviour tests for the containment surfaces. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Containment",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: "hours", q: "Serving hours", a: "A menu is active between the times you set." },
  { id: "codes", q: "Printed codes", a: "Codes point at an identifier, not a name." },
];

function Group(props: { allowsMultipleExpanded?: boolean }) {
  return (
    <div className="max-w-2xl">
      <DisclosureGroup {...props}>
        {items.map((item) => (
          <Disclosure key={item.id} id={item.id}>
            <DisclosureHeader>{item.q}</DisclosureHeader>
            <DisclosurePanel>{item.a}</DisclosurePanel>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </div>
  );
}

/**
 * The whole control from the keyboard: Tab reaches the trigger, Enter opens,
 * Space closes, and focus never leaves the trigger — a disclosure that moves
 * focus into its panel would strand a keyboard reader on the way out.
 */
export const DisclosureKeyboardToggle: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Disclosure>
        <DisclosureHeader>Serving hours</DisclosureHeader>
        <DisclosurePanel>A menu is active between the times you set.</DisclosurePanel>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Serving hours" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "true"),
    );
    await expect(trigger).toHaveFocus();
    await expect(
      canvas.getByText("A menu is active between the times you set."),
    ).toBeVisible();

    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(trigger).toHaveFocus();
  },
};

/**
 * The trigger owns the panel: `aria-controls` points at it and the panel is
 * labelled back by the trigger, so a reader lands on named content rather than
 * an anonymous group.
 */
export const DisclosureWiresTriggerToPanel: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Disclosure defaultExpanded>
        <DisclosureHeader>Serving hours</DisclosureHeader>
        <DisclosurePanel>A menu is active between the times you set.</DisclosurePanel>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Serving hours" });

    const panelId = trigger.getAttribute("aria-controls");
    await expect(panelId).toBeTruthy();

    const panel = canvasElement.ownerDocument.getElementById(panelId!);
    await expect(panel).not.toBeNull();
    await expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    await expect(panel).toHaveTextContent(
      "A menu is active between the times you set.",
    );
  },
};

/** A plain group is single-expand: opening one closes the one before it. */
export const DisclosureGroupSingleExpand: Story = {
  render: () => <Group />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hours = canvas.getByRole("button", { name: "Serving hours" });
    const codes = canvas.getByRole("button", { name: "Printed codes" });

    await userEvent.click(hours);
    await waitFor(() => expect(hours).toHaveAttribute("aria-expanded", "true"));

    await userEvent.click(codes);
    await waitFor(() => expect(codes).toHaveAttribute("aria-expanded", "true"));
    await expect(hours).toHaveAttribute("aria-expanded", "false");
  },
};

/** `allowsMultipleExpanded` keeps every opened section open. */
export const DisclosureGroupMultipleExpand: Story = {
  render: () => <Group allowsMultipleExpanded />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hours = canvas.getByRole("button", { name: "Serving hours" });
    const codes = canvas.getByRole("button", { name: "Printed codes" });

    await userEvent.click(hours);
    await userEvent.click(codes);
    await waitFor(() => expect(codes).toHaveAttribute("aria-expanded", "true"));
    await expect(hours).toHaveAttribute("aria-expanded", "true");
  },
};
