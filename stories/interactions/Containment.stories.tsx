import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useRef } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import { Card, CardContent } from "@french-tech-homies/design-system/components/Card";
import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
} from "@french-tech-homies/design-system/components/Disclosure";
import { Cell } from "@french-tech-homies/design-system/components/Table";

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

/**
 * A card is placed and named from outside: the element, the id, the name and
 * a `data-*` attribute reach the root, so a `section` card is a region found
 * by its name, and a ref reaches its element.
 */
export const CardIsNamedAndPlaced: Story = {
  render: function Render() {
    const ref = useRef<HTMLElement>(null);
    return (
      <>
        <Card
          ref={ref}
          component="section"
          id="usage-card"
          aria-labelledby="usage-title"
          data-testid="usage"
          style={{ gridColumn: "span 2" }}
          variant="outlined"
        >
          <h2 id="usage-title">Usage this month</h2>
        </Card>
        <Button onPress={() => ref.current?.setAttribute("data-reached", "")}>
          Reach
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Usage this month" });

    await expect(region.tagName).toBe("SECTION");
    await expect(region).toHaveAttribute("id", "usage-card");
    await expect(region).toHaveAttribute("data-slot", "card");
    await expect(region).toHaveAttribute("data-variant", "outlined");
    await expect(region).toHaveAttribute("data-testid", "usage");
    await expect(region.style.gridColumn).toBe("span 2");

    await userEvent.click(canvas.getByRole("button", { name: "Reach" }));
    await expect(region).toHaveAttribute("data-reached");
  },
};

/** A class handed for a named part lands on that part, and on no other. */
export const CardPartClassesLand: Story = {
  render: () => (
    <Card classNames={{ content: "gap-2", stateLayer: "bg-primary" }}>
      <CardContent
        media={<div className="h-10 bg-surface-dim" />}
        headline="Serving hours"
        supportingText="A menu is active between the times you set."
        actions={<Button>Edit</Button>}
        classNames={{
          media: "h-10",
          header: "pt-2",
          headline: "text-primary",
          supportingText: "italic",
          actions: "justify-start",
        }}
      />
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const part = (slot: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-slot="${slot}"]`);

    await expect(part("card-content")).toHaveClass("gap-2");
    await expect(part("state-layer")).toHaveClass("bg-primary");
    await expect(part("state-layer")).not.toHaveClass("bg-on-surface");
    await expect(part("card-media")).toHaveClass("h-10");
    await expect(part("card-header")).toHaveClass("pt-2");
    await expect(part("card-headline")).toHaveClass("text-primary");
    await expect(part("card-headline")).not.toHaveClass("text-on-surface");
    await expect(part("card-supporting-text")).toHaveClass("italic");
    await expect(part("card-actions")).toHaveClass("justify-start");
    await expect(part("card-actions")).not.toHaveClass("justify-end");
    await expect(part("card")).not.toHaveClass("gap-2");
  },
};

// Never rendered: the type is the proof, and `npm run typecheck` reads it.
const refusedByTheType = () => (
  <>
    {/* @ts-expect-error a card takes no event handler */}
    <Card onClick={() => undefined}>Not pressed</Card>
    {/* @ts-expect-error a card is no tab stop */}
    <Card tabIndex={0}>Not focused</Card>
    {/* @ts-expect-error a cell places its own element */}
    <Cell render={() => <td />}>Not rendered</Cell>
  </>
);
void refusedByTheType;

/**
 * A card is a container, not a control: Tab goes straight to the action
 * inside it, then to the one after it, and never stops on the card. The type
 * refuses what would make it a control, a handler and a tab stop.
 */
export const CardIsNotATabStop: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card variant="elevated" data-testid="card">
        <CardContent
          headline="Serving hours"
          supportingText="A menu is active between the times you set."
          actions={<Button>Edit hours</Button>}
        />
      </Card>
      <Button>After</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId("card");

    await expect(card).not.toHaveAttribute("tabindex");
    await expect(card).not.toHaveAttribute("role");

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Edit hours" }),
    ).toHaveFocus();
    await expect(card).not.toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByRole("button", { name: "Edit hours" }),
    ).toHaveFocus();
  },
};
