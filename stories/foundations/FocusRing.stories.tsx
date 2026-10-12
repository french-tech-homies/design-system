import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Link } from "react-aria-components";
import { Heart } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@french-tech-homies/design-system/components/Table";
import { Label } from "@french-tech-homies/design-system/primitives/Typography";
import { focusRing } from "@french-tech-homies/design-system/utils";

/**
 * The kit's focus indicator, `focusRing` in `utils.ts`: 3px of `ring`
 * (Material's secondary), 2px away from the control. It is an outline, so the
 * gap is not painted: it shows the ground the control stands on, whatever
 * that is.
 */
const meta = {
  title: "MD3/Foundations/Focus ring",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const link = focusRing({
  className:
    "rounded-shape-extra-small text-body-large text-primary underline underline-offset-4",
});

/**
 * The three controls at four times their size, so the 2px gap is 8 pixels of
 * a picture. The button is focused at load. `outline-solid` on each draws
 * the ring as keyboard focus does, since a page holds one focus at a time.
 */
function Enlarged({ ground, name }: { ground: string; name: string }) {
  return (
    <div className={`${ground} flex min-h-screen flex-col gap-2 p-4`}>
      <Label size="large" component="div" className="text-on-surface-variant">
        On {name}
      </Label>
      <div className="flex flex-col items-start gap-4 p-3" style={{ zoom: 4 }}>
        <Button autoFocus className="outline-solid">
          Save
        </Button>
        <IconButton
          icon={Heart}
          aria-label="Like"
          variant="tonal"
          className="outline-solid"
        />
        <Link href="#" className={`${link} outline-solid`}>
          Read the run
        </Link>
      </div>
    </div>
  );
}

/** On the page's ground: the gap is `background`. */
export const OnBackground: Story = {
  render: () => <Enlarged ground="bg-background" name="background" />,
};

/** On a card's ground: the gap is `surface-container-low`, not the page's. */
export const OnSurfaceContainerLow: Story = {
  render: () => (
    <Enlarged ground="bg-surface-container-low" name="surface-container-low" />
  ),
};

const ring = (el: Element) => {
  const s = getComputedStyle(el);
  return {
    style: s.outlineStyle,
    width: s.outlineWidth,
    offset: s.outlineOffset,
    shadow: s.boxShadow,
  };
};

/**
 * Tab to each: the ring is a solid 3px outline 2px away, and no box shadow
 * is added for it. A table's column header fills its box, so its ring is
 * drawn inside.
 */
export const Keyboard: Story = {
  render: () => (
    <div className="bg-surface-container-low flex flex-col items-start gap-6 p-6">
      <div className="flex items-center gap-6">
        <Button variant="outlined">Save</Button>
        <IconButton variant="standard" icon={Heart} aria-label="Like" />
        <Link href="#" className={link}>
          Read the run
        </Link>
      </div>
      <Table
        aria-label="Runs"
        sortDescriptor={{ column: "run", direction: "ascending" }}
      >
        <TableHeader>
          <Column id="run" isRowHeader allowsSorting>
            Run
          </Column>
          <Column id="cost">Cost</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>liog</Cell>
            <Cell>14.89</Cell>
          </Row>
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const controls = [
      canvas.getByRole("button", { name: "Save" }),
      canvas.getByRole("button", { name: "Like" }),
      canvas.getByRole("link", { name: "Read the run" }),
    ];

    for (const control of controls) {
      await expect(ring(control).style).toBe("none");
      const atRest = ring(control).shadow;
      await userEvent.tab();
      await expect(control).toHaveFocus();
      await expect(ring(control)).toEqual({
        style: "solid",
        width: "3px",
        offset: "2px",
        // The ring is not a shadow: focus adds none.
        shadow: atRest,
      });
    }

    // Tab enters the table on its row; the header is one arrow up.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    const header = canvas.getByRole("columnheader", { name: "Run" });
    await expect(header).toHaveFocus();
    await expect(ring(header)).toMatchObject({
      style: "solid",
      width: "3px",
      offset: "-2px",
    });
  },
};
