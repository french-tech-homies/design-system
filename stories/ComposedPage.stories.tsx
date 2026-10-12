import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useId } from "react";

import {
  Body,
  Button,
  Card,
  Cell,
  Column,
  Focusable,
  Headline,
  IconButton,
  ImageIcon,
  Label,
  Row,
  Table,
  TableBody,
  TableHeader,
  Tag,
  Tooltip,
  TooltipTrigger,
} from "@french-tech-homies/design-system";

type Order = { id: string; title: string; sheets: string; price: string };

const orders: Order[] = [
  {
    id: "ord-4822",
    title:
      "Annual report, with the fold-out map of every branch and the corrected opening hours",
    sheets: "3,200",
    price: "2,940.00",
  },
  { id: "ord-4823", title: "Business cards", sheets: "500", price: "84.00" },
  {
    id: "ord-4824",
    title:
      "Exhibition poster, second edition with the sponsor's mark moved to the lower edge",
    sheets: "150",
    price: "412.50",
  },
  { id: "ord-4825", title: "Menu cards", sheets: "80", price: "96.00" },
];

type FigureRows = [label: string, value: string][];

const figures: { value: string; label: string; headline: string; rows: FigureRows }[] = [
  {
    value: "2 h 14 min",
    label: "Waiting for 2 hours 14 minutes",
    headline: "Waiting since",
    rows: [
      ["Received", "09:12"],
      ["Checked", "09:40"],
      ["Sent to you", "10:05"],
    ],
  },
  {
    value: "1,284.50",
    label: "Price 1,284.50",
    headline: "Price",
    rows: [
      ["Paper", "612.00"],
      ["Press", "540.50"],
      ["Binding", "132.00"],
    ],
  },
  {
    value: "12,000",
    label: "12,000 sheets",
    headline: "Sheets",
    rows: [
      ["Cover", "500"],
      ["Inside", "11,500"],
    ],
  },
];

type PageProps = {
  /** What the card holds: an order that waits for its proof, or nothing. */
  waiting: boolean;
  card: "outlined" | "filled" | "elevated";
  density: "default" | "dense";
  /** Classes handed to the named parts, and to those only. */
  restyled: boolean;
  onApprove?: () => void;
  onOpenProof?: (order: string) => void;
};

/**
 * A figure that is only read: no button, made focusable so the keyboard
 * opens its tooltip too. The tooltip is rich and holds rows of label and
 * value.
 */
function Figure({
  figure,
  restyled,
}: {
  figure: (typeof figures)[number];
  restyled: boolean;
}) {
  return (
    <TooltipTrigger>
      <Focusable>
        <span
          role="img"
          aria-label={figure.label}
          tabIndex={0}
          className="rounded-shape-extra-small font-mono text-title-medium text-on-surface outline-none outline-3 outline-offset-2 outline-ring focus-visible:outline-solid"
        >
          {figure.value}
        </span>
      </Focusable>
      <Tooltip
        variant="rich"
        headline={figure.headline}
        classNames={
          restyled
            ? { headline: "text-primary", content: "text-on-surface" }
            : undefined
        }
      >
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
          {figure.rows.map(([label, value]) => (
            <React.Fragment key={label}>
              <dt>{label}</dt>
              <dd className="text-right font-mono">{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Tooltip>
    </TooltipTrigger>
  );
}

function Page({
  waiting,
  card,
  density,
  restyled,
  onApprove,
  onOpenProof,
}: PageProps) {
  const headline = useId();
  const dense = density === "dense";
  return (
    // The page's own ground, so what stands outside a card is on a surface
    // under either scheme.
    <div className="flex w-full max-w-[608px] flex-col gap-6 bg-surface p-6 text-on-surface">
      <Card
        variant={card}
        component="section"
        aria-labelledby={headline}
        classNames={restyled ? { content: "gap-1 p-6" } : undefined}
      >
        {waiting ? (
          <>
            <Tag color="tertiary" className="self-start">
              Waiting for you
            </Tag>
            <Headline
              id={headline}
              size="small"
              component="h2"
              className="mt-3"
            >
              Spring catalogue, 48 pages
            </Headline>
            <div className="flex items-center gap-1">
              <Body
                size="medium"
                component="span"
                colorRole="on-surface-variant"
                className="font-mono"
              >
                ord-4821
              </Body>
              <IconButton
                size="xsmall"
                icon={ImageIcon}
                aria-label="Open the proof"
                onPress={() => onOpenProof?.("ord-4821")}
                classNames={restyled ? { icon: "text-primary" } : undefined}
              />
            </div>
            <Body size="medium" className="mt-2">
              The press is held until this proof is approved.
            </Body>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {figures.map((figure) => (
                <Figure
                  key={figure.headline}
                  figure={figure}
                  restyled={restyled}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onPress={onApprove}>Approve proof</Button>
            </div>
          </>
        ) : (
          <>
            <Headline id={headline} size="small" component="h2">
              Proofs
            </Headline>
            <Body size="medium" colorRole="on-surface-variant" className="mt-1">
              No proof is waiting for you.
            </Body>
          </>
        )}
      </Card>

      <Card variant="outlined" classNames={{ content: "p-0" }}>
        <Table aria-label="Orders this week" density={density}>
          <TableHeader>
            <Column id="order" isRowHeader>
              Order
            </Column>
            <Column
              id="title"
              className="w-full"
              classNames={
                restyled ? { columnContent: "text-primary" } : undefined
              }
            >
              Title
            </Column>
            <Column id="sheets" align="end">
              Sheets
            </Column>
            <Column id="price" align="end">
              Price
            </Column>
            <Column id="proof" align="center">
              Proof
            </Column>
          </TableHeader>
          <TableBody items={orders}>
            {(order) => (
              <Row id={order.id}>
                <Cell className="font-mono whitespace-nowrap">{order.id}</Cell>
                <Cell
                  truncate
                  classNames={
                    restyled ? { cellText: "text-on-surface-variant" } : undefined
                  }
                >
                  {order.title}
                </Cell>
                <Cell className="font-mono">{order.sheets}</Cell>
                <Cell className="font-mono">{order.price}</Cell>
                <Cell>
                  <IconButton
                    size={dense ? "xsmall" : "small"}
                    icon={ImageIcon}
                    aria-label={`Open the proof of ${order.id}`}
                    onPress={() => onOpenProof?.(order.id)}
                    classNames={restyled ? { icon: "text-primary" } : undefined}
                  />
                </Cell>
              </Row>
            )}
          </TableBody>
        </Table>
      </Card>
      <Label size="medium" colorRole="on-surface-variant">
        4 orders this week
      </Label>
    </div>
  );
}

/**
 * A page made of the kit's parts and of nothing else: a card for the one
 * thing that waits for a person, over a table of the rest. A print shop's
 * orders stand in for the content.
 *
 * It is where the parts are seen together. The **card** is a `section` named
 * by its headline, at the kit's corner (no `rounded-*` is handed to it). The
 * three **figures** are read, not pressed: each is a focusable `role="img"`
 * that opens a rich tooltip of rows. The **table** is dense, 40dp rows under
 * a 44dp header, with an `xsmall` icon button in each row, two columns
 * aligned to the end and a title column whose cells are cut to one line, the
 * whole text in a tooltip. Identifiers, times and amounts are in the mono
 * face (`font-mono`), which the page writes: no kit part does.
 *
 * Every import is the kit's own (`Card`, `Tag`, `Headline`, `Body`, `Label`,
 * `IconButton`, `Button`, `Tooltip`, `TooltipTrigger`, `Focusable`, `Table`
 * and its parts, `ImageIcon`), and every class a role utility or layout.
 * The keyboard path through it is asserted in
 * `MD3/Interactions/Composed page`.
 */
const meta = {
  title: "MD3/Composed page",
  component: Page,
  parameters: { layout: "padded" },
  args: {
    waiting: true,
    card: "outlined",
    density: "dense",
    restyled: false,
  },
  argTypes: {
    card: { control: "inline-radio", options: ["outlined", "filled", "elevated"] },
    density: { control: "inline-radio", options: ["default", "dense"] },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An order waits for its proof: an outlined card over the dense table. */
export const Waiting: Story = {};

/**
 * Nothing waits: a filled card that says so, over the same table at the
 * default density (52dp rows, `small` icon buttons).
 */
export const NothingWaiting: Story = {
  args: { waiting: false, card: "filled", density: "default" },
};

/**
 * The same page on an elevated card, restyled through the named parts only:
 * `classNames` on `Card` (`content`), `Tooltip` (`headline`, `content`),
 * `Column` (`columnContent`), `Cell` (`cellText`) and `IconButton` (`icon`).
 * No component is edited and no root's class is fought.
 */
export const PartsRestyled: Story = {
  args: { card: "elevated", restyled: true },
};
