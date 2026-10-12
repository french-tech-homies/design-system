import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { CopyIcon, Heart, Plus } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import Card from "@french-tech-homies/design-system/components/Card";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@french-tech-homies/design-system/components/Table";

/**
 * Behaviour tests for the action components. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Actions",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const onPress = fn();

/**
 * Material's keyboard table: Tab lands on an enabled icon button and skips a
 * disabled one, Enter and Space each activate it, Space flips a toggle, and
 * a button with `href` is a link Tab reaches.
 */
export const IconButtonKeyboard: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton
        variant="standard"
        icon={Plus}
        aria-label="Add"
        onPress={onPress}
      />
      <IconButton
        variant="standard"
        icon={Plus}
        aria-label="Add, disabled"
        isDisabled
      />
      <IconButton
        variant="standard"
        isToggle
        icon={Heart}
        aria-label="Favorite"
      />
      <IconButton
        variant="standard"
        icon={Plus}
        aria-label="Open"
        href="#open"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onPress.mockClear();

    const add = canvas.getByRole("button", { name: "Add" });
    await userEvent.tab();
    await expect(add).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onPress).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    await expect(onPress).toHaveBeenCalledTimes(2);

    // The disabled button is passed over.
    const favorite = canvas.getByRole("button", { name: "Favorite" });
    await userEvent.tab();
    await expect(favorite).toHaveFocus();
    await expect(favorite).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(favorite).toHaveAttribute("aria-pressed", "true"),
    );

    const open = canvas.getByRole("link", { name: "Open" });
    await userEvent.tab();
    await expect(open).toHaveFocus();
    await expect(open).toHaveAttribute("href", "#open");
  },
};

const sizes = [
  { size: "xsmall", box: 32, icon: 20, outline: 1 },
  { size: "small", box: 40, icon: 24, outline: 1 },
  { size: "medium", box: 56, icon: 24, outline: 1 },
  { size: "large", box: 96, icon: 32, outline: 2 },
  { size: "xlarge", box: 136, icon: 40, outline: 3 },
] as const;

/**
 * Each size draws Material's container, icon and outline
 * (`md.comp.icon-button.<size>.container.height`, `.icon.size`,
 * `.outlined.outline.width`), and a button that says no size is `small`.
 */
export const IconButtonSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {sizes.map(({ size }) => (
        <IconButton
          key={size}
          variant="outlined"
          size={size}
          icon={Plus}
          aria-label={`Add, ${size}`}
        />
      ))}
      <IconButton variant="standard" icon={Plus} aria-label="Add, no size" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const measure = (name: string) => {
      const button = canvas.getByRole("button", { name });
      const box = button.getBoundingClientRect();
      const icon = button.querySelector("svg")!.getBoundingClientRect();
      return {
        button,
        box: [box.width, box.height],
        icon: [icon.width, icon.height],
        outline: getComputedStyle(button).borderTopWidth,
      };
    };

    for (const { size, box, icon, outline } of sizes) {
      const drawn = measure(`Add, ${size}`);
      await expect(drawn.box).toEqual([box, box]);
      await expect(drawn.icon).toEqual([icon, icon]);
      await expect(drawn.outline).toBe(`${outline}px`);
      await expect(drawn.button).toHaveAttribute("data-size", size);
    }

    const unsized = measure("Add, no size");
    await expect(unsized.box).toEqual([40, 40]);
    await expect(unsized.icon).toEqual([24, 24]);
    await expect(unsized.button).toHaveAttribute("data-size", "small");

    // Keyboard: every size is a stop, in order.
    await userEvent.tab();
    await expect(measure("Add, xsmall").button).toHaveFocus();
  },
};

function ControlledToggle() {
  // The parent holds the state and does not change it: a controlled toggle
  // must then stay as it is told.
  const [isSelected] = useState(true);
  return (
    <IconButton
      variant="standard"
      isToggle
      isSelected={isSelected}
      onChange={() => undefined}
      icon={Heart}
      aria-label="Favorite, held"
    />
  );
}

/**
 * A button that names no colour style is filled, Material's default. Filled
 * and tonal draw Material's container with nothing more said, the
 * outline is `outline-variant`, and a toggle's `isSelected` is its parent's
 * to hold. The colours are compared with probes drawn by the same theme, so
 * the test holds under any preset.
 */
export const IconButtonColorStyles: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={Plus} aria-label="Add, no colour style" />
      <IconButton variant="filled" icon={Plus} aria-label="Add, filled" />
      <IconButton variant="tonal" icon={Plus} aria-label="Add, tonal" />
      <IconButton variant="outlined" icon={Plus} aria-label="Add, outlined" />
      <ControlledToggle />
      <span data-probe="primary" className="bg-primary size-4" />
      <span data-probe="on-primary" className="text-on-primary size-4" />
      <span
        data-probe="secondary-container"
        className="bg-secondary-container size-4"
      />
      <span
        data-probe="outline-variant"
        className="border-outline-variant size-4 border"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const probe = (name: string) =>
      getComputedStyle(canvasElement.querySelector(`[data-probe="${name}"]`)!);
    const button = (name: string) => canvas.getByRole("button", { name });

    // With no colour style said, the button is Material's default: filled.
    const unsaid = button("Add, no colour style");
    await expect(unsaid).toHaveAttribute("data-variant", "filled");
    await expect(getComputedStyle(unsaid).backgroundColor).toBe(
      probe("primary").backgroundColor,
    );
    await expect(
      getComputedStyle(unsaid.querySelector('[data-slot="icon-button-icon"]')!)
        .color,
    ).toBe(probe("on-primary").color);

    await expect(getComputedStyle(button("Add, filled")).backgroundColor).toBe(
      probe("primary").backgroundColor,
    );
    await expect(getComputedStyle(button("Add, tonal")).backgroundColor).toBe(
      probe("secondary-container").backgroundColor,
    );
    await expect(getComputedStyle(button("Add, outlined")).borderTopColor).toBe(
      probe("outline-variant").borderTopColor,
    );
    await expect(button("Add, tonal")).toHaveAttribute("data-variant", "tonal");

    // Keyboard: Space on the held toggle asks, and the parent's answer stays.
    const held = button("Favorite, held");
    await expect(held).toHaveAttribute("aria-pressed", "true");
    held.focus();
    await userEvent.keyboard(" ");
    await expect(held).toHaveAttribute("aria-pressed", "true");
  },
};

const rows = [{ id: "a-1" }, { id: "a-2" }, { id: "a-3" }];

/**
 * An `xsmall` button draws 32px and answers over Material's 48px. In a dense
 * row of 40px the rows' targets overlap and the later row's answers in the
 * overlap, so the middle row's button still answers 6px to either side and
 * 6px above its drawn edge: over at least 48 by 40.
 */
export const IconButtonTargetInDenseRow: Story = {
  render: () => (
    <Card variant="outlined" className="w-[320px]">
      <Table aria-label="Codes" density="dense">
        <TableHeader>
          <Column id="id" isRowHeader>
            Code
          </Column>
          <Column id="copy" align="center">
            Copy
          </Column>
        </TableHeader>
        <TableBody items={rows}>
          {(row) => (
            <Row id={row.id}>
              <Cell>{row.id}</Cell>
              <Cell>
                <IconButton
                  variant="standard"
                  size="xsmall"
                  icon={CopyIcon}
                  aria-label={`Copy ${row.id}`}
                  onPress={onPress}
                />
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onPress.mockClear();
    const button = canvas.getByRole("button", { name: "Copy a-2" });
    const row = button.closest("tr")!;
    const r = button.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const answers = (x: number, y: number) =>
      button.contains(document.elementFromPoint(x, y));

    await expect([r.width, r.height]).toEqual([32, 32]);
    await expect(
      Math.abs(row.getBoundingClientRect().height - 40),
    ).toBeLessThanOrEqual(1);

    await expect(answers(r.left - 6, cy)).toBe(true);
    await expect(answers(r.right + 6, cy)).toBe(true);
    await expect(answers(cx, r.top - 6)).toBe(true);

    // The extent that answers, walked a pixel at a time from the centre.
    const reach = (dx: number, dy: number) => {
      let n = 0;
      while (n < 64 && answers(cx + dx * (n + 1), cy + dy * (n + 1))) n++;
      return n;
    };
    await expect(reach(-1, 0) + reach(1, 0) + 1).toBeGreaterThanOrEqual(48);
    await expect(reach(0, -1) + reach(0, 1) + 1).toBeGreaterThanOrEqual(40);

    // Keyboard: Tab into the table, down to the row, across to its button.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(onPress).toHaveBeenCalledTimes(1);
  },
};

/**
 * The icon is a named part: it exists under its `data-slot` and takes the
 * class given through `classNames`; the root takes `className`.
 */
export const IconButtonPartClasses: Story = {
  render: () => (
    <IconButton
      variant="tonal"
      size="medium"
      icon={Heart}
      aria-label="Favorite"
      className="h-12 w-12"
      classNames={{ icon: "text-primary" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="icon-button"]',
    )!;
    const icon = root.querySelector<HTMLElement>(
      '[data-slot="icon-button-icon"]',
    )!;

    await expect(root).toHaveAttribute("data-size", "medium");
    await expect(root).toHaveAttribute("data-variant", "tonal");
    // The caller's size wins over the variant's.
    await expect(root).toHaveClass("h-12", "w-12");
    await expect(root).not.toHaveClass("h-14");
    await expect(root.getBoundingClientRect().height).toBe(48);
    await expect(icon).toHaveClass("text-primary");
    await expect(icon).not.toHaveClass("text-on-secondary-container");
    await expect(icon.querySelector("svg")).not.toBeNull();

    // Keyboard: it is still a stop.
    await userEvent.tab();
    await expect(root).toHaveFocus();
  },
};
