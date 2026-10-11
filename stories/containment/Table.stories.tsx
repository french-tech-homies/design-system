import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useMemo, useState } from "react";
import type { SortDescriptor } from "react-aria-components";

import Button from "@french-tech-homies/design-system/components/Button";
import Card from "@french-tech-homies/design-system/components/Card";
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

/**
 * Data table on React Aria `Table`: keyboard-navigable grid with optional
 * sorting and row selection. Material 3 publishes no data-table page, so
 * the measurements are M2's on M3 roles — 56dp header (label-large,
 * on-surface-variant), 52dp rows (body-medium), 16dp cell padding,
 * outline-variant dividers. Wrap in a `Card variant="outlined"` for the
 * container.
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
              <Cell align="end">
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
              <Cell align="end">€{row.amount.toFixed(2)}</Cell>
            </Row>
          )}
        </TableBody>
        <TableFooter>
          <Row id="total">
            <Cell>Total</Cell>
            <Cell align="end">
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
