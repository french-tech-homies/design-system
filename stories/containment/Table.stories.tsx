import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useMemo, useState } from "react";
import type { SortDescriptor } from "react-aria-components";

import Button from "@french-tech-homies/design-system/components/Button";
import Card from "@french-tech-homies/design-system/components/Card";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableFooter,
  TableHeader,
} from "@french-tech-homies/design-system/components/Table";
import { Tag } from "@french-tech-homies/design-system/components/Tag";
import { CopyIcon } from "lucide-react";
import { expect, within } from "storybook/test";

/**
 * Data table on React Aria `Table`: keyboard-navigable grid with optional
 * sorting and row selection. Material 3 publishes no data-table page, so
 * the measurements are M2's on M3 roles — 56dp header (label-large,
 * on-surface-variant), 52dp rows (body-medium), 16dp cell padding,
 * outline-variant dividers. Wrap in a `Card variant="outlined"` for the
 * container. A column's `align` is its cells' default; `density="dense"`
 * draws 40dp rows under a 44dp header; a `Cell` with `truncate` cuts its text
 * to one line and shows the whole of it in a tooltip.
 */
const meta = {
  title: "MD3/Containment/Table",
  component: Table,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const users = [
  { id: 1, name: "Yann Renaudin", email: "yann@example.com", role: "Owner" },
  { id: 2, name: "Sami Ben", email: "sami@example.com", role: "Admin" },
  { id: 3, name: "Nour Haddad", email: "nour@example.com", role: "Staff" },
  { id: 4, name: "Léa Martin", email: "lea@example.com", role: "Staff" },
];

export const Basic: Story = {
  render: () => (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Users">
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="email">Email</Column>
          <Column id="role">Role</Column>
          <Column id="action" align="end">
            Action
          </Column>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <Row>
              <Cell>{user.name}</Cell>
              <Cell>{user.email}</Cell>
              <Cell>
                <Tag>{user.role}</Tag>
              </Cell>
              <Cell>
                <Button variant="text" size="small" color="error">
                  Remove
                </Button>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
};

function SortableDemo() {
  const [sort, setSort] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const sorted = useMemo(() => {
    const col = sort.column as keyof (typeof users)[number];
    return [...users].sort((a, b) => {
      const cmp = String(a[col]).localeCompare(String(b[col]));
      return sort.direction === "descending" ? -cmp : cmp;
    });
  }, [sort]);
  return (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Users" sortDescriptor={sort} onSortChange={setSort}>
        <TableHeader>
          <Column id="name" isRowHeader allowsSorting>
            Name
          </Column>
          <Column id="email" allowsSorting>
            Email
          </Column>
          <Column id="role" allowsSorting>
            Role
          </Column>
        </TableHeader>
        <TableBody items={sorted}>
          {(user) => (
            <Row>
              <Cell>{user.name}</Cell>
              <Cell>{user.email}</Cell>
              <Cell>{user.role}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export const Sortable: Story = { render: () => <SortableDemo /> };

export const Selectable: Story = {
  render: () => (
    <Card variant="outlined" className="w-[640px]">
      <Table
        aria-label="Users"
        selectionMode="multiple"
        defaultSelectedKeys={[2]}
      >
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="email">Email</Column>
          <Column id="role">Role</Column>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <Row>
              <Cell>{user.name}</Cell>
              <Cell>{user.email}</Cell>
              <Cell>{user.role}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
};

const sales = [
  { id: "starters", category: "Starters", amount: 412.5 },
  { id: "mains", category: "Mains", amount: 1830 },
  { id: "desserts", category: "Desserts", amount: 268 },
];

export const WithFooter: Story = {
  render: () => (
    <Card variant="outlined" className="w-[480px]">
      <Table aria-label="Sales per category">
        <TableHeader>
          <Column id="category" isRowHeader>
            Category
          </Column>
          <Column id="amount" align="end">
            Amount
          </Column>
        </TableHeader>
        <TableBody items={sales}>
          {(row) => (
            <Row>
              <Cell>{row.category}</Cell>
              <Cell>€{row.amount.toFixed(2)}</Cell>
            </Row>
          )}
        </TableBody>
        <TableFooter>
          <Row id="total">
            <Cell>Total</Cell>
            <Cell>
              €{sales.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
            </Cell>
          </Row>
        </TableFooter>
      </Table>
    </Card>
  ),
};

export const Empty: Story = {
  render: () => (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Users">
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="email">Email</Column>
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <div className="text-body-medium text-on-surface-variant py-8 text-center">
              No users yet
            </div>
          )}
        >
          {[]}
        </TableBody>
      </Table>
    </Card>
  ),
};

const deliveries = [
  {
    id: "d-4821",
    address: "12 rue des Petits Champs, 75002 Paris",
    note: "Leave with the caretaker on the ground floor, the bell of the second floor is out of order",
    parcels: 3,
  },
  {
    id: "d-4822",
    address: "4 place Bellecour, 69002 Lyon",
    note: "None",
    parcels: 1,
  },
  {
    id: "d-4823",
    address: "27 quai des Chartrons, 33000 Bordeaux",
    note: "Call on arrival: the gate code changes every Monday and is sent by message",
    parcels: 12,
  },
];

/**
 * `density="dense"`: 40dp rows under a 44dp header. The last column holds an
 * `xsmall` icon button, 32dp, whose target the row cuts to 48 by 40.
 */
export const Dense: Story = {
  render: () => (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Deliveries" density="dense">
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="address">Address</Column>
          <Column id="parcels" align="end">
            Parcels
          </Column>
          <Column id="copy" align="end">
            Copy
          </Column>
        </TableHeader>
        <TableBody items={deliveries}>
          {(row) => (
            <Row>
              <Cell>{row.id}</Cell>
              <Cell>{row.address}</Cell>
              <Cell>{row.parcels}</Cell>
              <Cell>
                <IconButton
                  size="xsmall"
                  icon={CopyIcon}
                  aria-label={`Copy ${row.id}`}
                />
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
};

/**
 * A dense table of one row in a box that scrolls sideways. The `xsmall`
 * button's 48dp target reaches 4dp under the row; the table clips it at its
 * edge, so the box has nothing to scroll upright and draws no upright bar.
 */
export const DenseInAScroller: Story = {
  render: () => (
    <div
      data-testid="scroller"
      className="border-outline-variant w-[420px] overflow-x-auto border"
    >
      <Table aria-label="Deliveries" density="dense" className="min-w-[560px]">
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="address">Address</Column>
          <Column id="copy" align="end">
            Copy
          </Column>
        </TableHeader>
        <TableBody items={deliveries.slice(0, 1)}>
          {(row) => (
            <Row>
              <Cell>{row.id}</Cell>
              <Cell>{row.address}</Cell>
              <Cell>
                <IconButton
                  size="xsmall"
                  icon={CopyIcon}
                  aria-label={`Copy ${row.id}`}
                />
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const scroller = within(canvasElement).getByTestId("scroller");
    // It does scroll sideways: the test is of a real scroller.
    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    await expect(scroller.scrollHeight).toBe(scroller.clientHeight);
  },
};

/**
 * `showLastRowDivider={false}`: the body's last row draws no line, for a
 * table that closes with an edge of the project's own, as the card's border
 * here. The header's line and the other rows' stay.
 */
export const LastRowDividerOff: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Card variant="outlined" className="w-[560px] overflow-hidden">
        <Table aria-label="Deliveries, no last line" showLastRowDivider={false}>
          <TableHeader>
            <Column id="id" isRowHeader>
              Delivery
            </Column>
            <Column id="address">Address</Column>
          </TableHeader>
          <TableBody items={deliveries}>
            {(row) => (
              <Row>
                <Cell>{row.id}</Cell>
                <Cell>{row.address}</Cell>
              </Row>
            )}
          </TableBody>
        </Table>
      </Card>
      <Table aria-label="Deliveries, the default" className="w-[560px]">
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="address">Address</Column>
        </TableHeader>
        <TableBody items={deliveries}>
          {(row) => (
            <Row>
              <Cell>{row.id}</Cell>
              <Cell>{row.address}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const line = (row?: Element) =>
      row && getComputedStyle(row).borderBottomWidth;
    const rowsOf = (name: string) =>
      within(canvas.getByRole("grid", { name })).getAllByRole("row").slice(1);

    const off = rowsOf("Deliveries, no last line");
    await expect(line(off.at(-1))).toBe("0px");
    await expect(line(off.at(-2))).toBe("1px");

    const byDefault = rowsOf("Deliveries, the default");
    await expect(line(byDefault.at(-1))).toBe("1px");
  },
};

/**
 * `truncate` on the cells of a column that is given a width (`w-full` here:
 * what the other columns leave). The second row's note fits, so it has no
 * tooltip; hover a cut one, or arrow to it.
 */
export const CutCells: Story = {
  render: () => (
    <Card variant="outlined" className="w-[560px]">
      <Table aria-label="Deliveries">
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="note" className="w-full">
            Note
          </Column>
          <Column id="parcels" align="end">
            Parcels
          </Column>
        </TableHeader>
        <TableBody items={deliveries}>
          {(row) => (
            <Row>
              <Cell>{row.id}</Cell>
              <Cell truncate>{row.note}</Cell>
              <Cell>{row.parcels}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
};
