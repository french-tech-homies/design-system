import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Stepper } from "../../blocks/stepper/Stepper";

/**
 * A block: `npx shadcn add @ds/stepper-block` copies it into a project's
 * components, where it is the project's to edit. Neither Material nor React
 * Aria describes a stepper.
 */
const meta = {
  title: "MD3/Blocks/Stepper",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
  { id: "address", label: "Address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

function Checkout({ start }: { start: number }) {
  const [current, setCurrent] = useState(start);
  return (
    <Stepper
      aria-label="Checkout"
      steps={steps}
      current={current}
      onStepPress={setCurrent}
    />
  );
}

/** At the first step: nothing is done yet. */
export const AtTheStart: Story = { render: () => <Checkout start={0} /> };

/** Midway: the steps done are buttons that go back to them. */
export const Midway: Story = { render: () => <Checkout start={2} /> };

/** Where only the current step's label is drawn, each other step still has
    its name: a step ahead is not an empty item of the list. */
export const EveryStepIsNamed: Story = {
  render: () => (
    <div className="w-72">
      <Stepper aria-label="Checkout" steps={steps} current={1} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole("navigation", { name: "Checkout" });
    const items = within(nav).getAllByRole("listitem");
    await expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Address"),
      expect.stringContaining("Delivery"),
      expect.stringContaining("Payment"),
      expect.stringContaining("Review"),
    ]);
  },
};

/** Without `onStepPress` the steps done are not pressed. */
export const NotPressed: Story = {
  render: () => <Stepper aria-label="Checkout" steps={steps} current={3} />,
};

/** A step done is reached by Tab and pressed with Enter: the stepper goes
    back to it, and the steps after it are no longer done. */
export const ADoneStepGoesBack: Story = {
  render: () => <Checkout start={2} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Checkout" });
    const current = () =>
      nav.querySelector('[aria-current="step"]')?.textContent ?? "";
    await expect(current()).toContain("Payment");
    await expect(within(nav).getAllByRole("button")).toHaveLength(2);

    await userEvent.tab();
    await expect(
      within(nav).getByRole("button", { name: /Address, done/ }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(current()).toContain("Address"));
    await expect(within(nav).queryAllByRole("button")).toHaveLength(0);
  },
};
