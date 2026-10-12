import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import composed, { Waiting } from "../ComposedPage.stories";

/**
 * Behaviour test for the composed page. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * stories a reader browses. The page itself is written once, in
 * `stories/ComposedPage.stories.tsx`, and drawn here as it is there.
 */
const meta = {
  title: "MD3/Interactions/Composed page",
  component: composed.component,
  parameters: { layout: "padded" },
} satisfies Meta<typeof composed.component>;

export default meta;
type Story = StoryObj<typeof meta>;

const onApprove = fn();
const onOpenProof = fn();

/**
 * The keyboard alone goes through the card, then the table. The card is no
 * tab stop. Each figure opens its rich tooltip on focus and Escape puts it
 * away, the figure keeping focus. In the table the arrows go across the row:
 * the cut title shows its whole text, and the row's `xsmall` button, 32 by 32
 * in a row of 40, is reached and pressed.
 */
export const CardThenTableByKeyboard: Story = {
  args: { ...composed.args, ...Waiting.args, onApprove, onOpenProof },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onApprove.mockClear();
    onOpenProof.mockClear();

    const gone = () =>
      waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull(), {
        timeout: 5000,
      });
    const shown = () => screen.findByRole("tooltip", {}, { timeout: 3000 });

    // The card is a region named by its headline, and not a tab stop.
    const card = canvas.getByRole("region", {
      name: "Spring catalogue, 48 pages",
    });
    await expect(card).not.toHaveAttribute("tabindex");
    await expect(card).toHaveAttribute("data-variant", "outlined");

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Open the proof" }),
    ).toHaveFocus();

    // The three figures, each read from the keyboard.
    for (const [name, headline, terms, value] of [
      [/^Waiting for 2 hours/, "Waiting since", 3, "10:05"],
      [/^Price 1,284\.50$/, "Price", 3, "540.50"],
      [/^12,000 sheets$/, "Sheets", 2, "11,500"],
    ] as const) {
      const figure = within(card).getByRole("img", { name });
      await userEvent.tab();
      await expect(figure).toHaveFocus();
      const tooltip = await shown();
      await expect(tooltip).toHaveAttribute("data-variant", "rich");
      await expect(figure).toHaveAttribute("aria-describedby", tooltip.id);
      await expect(
        tooltip.querySelector('[data-slot="tooltip-headline"]'),
      ).toHaveTextContent(headline);
      await expect(within(tooltip).getAllByRole("term")).toHaveLength(terms);
      await expect(tooltip).toHaveTextContent(value);
      // It is read, not operated: nothing in it takes focus.
      await expect(tooltip.querySelector("a, button, [tabindex]")).toBeNull();

      await userEvent.keyboard("{Escape}");
      await gone();
      await expect(figure).toHaveFocus();
    }

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Approve proof" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onApprove).toHaveBeenCalledTimes(1);

    // Into the table: its first row, then across it.
    const table = canvas.getByRole("grid", { name: "Orders this week" });
    await expect(table).toHaveAttribute("data-density", "dense");
    const row = within(table).getAllByRole("row")[1]!;
    await userEvent.tab();
    await waitFor(() => expect(row).toHaveFocus());
    await expect(
      Math.abs(row.getBoundingClientRect().height - 40),
    ).toBeLessThanOrEqual(1);

    // The cut title: one line, and its whole text in a tooltip.
    const text = row.querySelector<HTMLElement>(
      '[data-slot="table-cell-text"]',
    )!;
    const cell = text.closest("td")!;
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(cell).toHaveFocus());
    await expect(await shown()).toHaveTextContent(
      "Annual report, with the fold-out map of every branch and the corrected opening hours",
    );
    await userEvent.keyboard("{Escape}");
    await gone();

    // The two amounts are their column's: aligned to the end, in the mono face.
    const cells = within(row).getAllByRole("gridcell");
    for (const amount of [cells[1]!, cells[2]!]) {
      await expect(getComputedStyle(amount).textAlign).toBe("end");
      await expect(getComputedStyle(amount).fontFamily).toMatch(/mono/i);
    }

    // On to the row's button.
    const button = within(row).getByRole("button", {
      name: "Open the proof of ord-4822",
    });
    const box = button.getBoundingClientRect();
    await expect([box.width, box.height]).toEqual([32, 32]);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(onOpenProof).toHaveBeenCalledTimes(1);
    await expect(onOpenProof).toHaveBeenCalledWith("ord-4822");
    await userEvent.keyboard("{Escape}");
  },
};
