import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useMemo, useState } from "react";
import type { SortDescriptor } from "react-aria-components";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import Card from "@french-tech-homies/design-system/components/Card";
import { ImageField } from "@french-tech-homies/design-system/components/ImageField";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@french-tech-homies/design-system/components/Table";
import {
  snackbar,
  snackbarQueue,
  SnackbarRegion,
  SNACKBAR_TIMEOUT,
} from "@french-tech-homies/design-system/components/Snackbar";
import { ProgressIndicator } from "@french-tech-homies/design-system/components/ProgressIndicator";
import { Meter } from "@french-tech-homies/design-system/components/Meter";

/**
 * Behaviour tests for the table and for the feedback surfaces. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Data and feedback",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const users = [
  { id: 1, name: "Yann Renaudin", email: "yann@example.com", role: "Owner" },
  { id: 2, name: "Sami Ben", email: "sami@example.com", role: "Admin" },
  { id: 3, name: "Nour Haddad", email: "nour@example.com", role: "Staff" },
];

function SortableTable() {
  const [sort, setSort] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const sorted = useMemo(() => {
    const rows = [...users].sort((a, b) =>
      String(a[sort.column as keyof typeof a]).localeCompare(
        String(b[sort.column as keyof typeof b]),
      ),
    );
    return sort.direction === "descending" ? rows.reverse() : rows;
  }, [sort]);

  return (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Users" sortDescriptor={sort} onSortChange={setSort}>
        <TableHeader>
          <Column id="name" isRowHeader allowsSorting>
            Name
          </Column>
          <Column id="role" allowsSorting>
            Role
          </Column>
        </TableHeader>
        <TableBody items={sorted}>
          {(user) => (
            <Row id={user.id}>
              <Cell>{user.name}</Cell>
              <Cell>{user.role}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

/** Activating a sortable column header reverses the order and flips aria-sort. */
export const TableSortByHeader: Story = {
  render: () => <SortableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameHeader = canvas.getByRole("columnheader", { name: /name/i });

    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    let rows = canvas.getAllByRole("row").slice(1); // drop the header row
    await expect(rows[0]).toHaveTextContent("Nour Haddad");

    await userEvent.click(nameHeader);
    await waitFor(() =>
      expect(nameHeader).toHaveAttribute("aria-sort", "descending"),
    );
    rows = canvas.getAllByRole("row").slice(1);
    await expect(rows[0]).toHaveTextContent("Yann Renaudin");
  },
};

/** Multi-select adds a checkbox column; the header checkbox selects every row. */
export const TableSelection: Story = {
  render: () => (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Users" selectionMode="multiple">
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="role">Role</Column>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <Row id={user.id}>
              <Cell>{user.name}</Cell>
              <Cell>{user.role}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole("checkbox");
    const [selectAll, firstRow] = boxes;

    await expect(boxes.length).toBe(users.length + 1);
    await expect(firstRow).not.toBeChecked();

    await userEvent.click(firstRow!);
    await waitFor(() => expect(firstRow).toBeChecked());
    await expect(
      canvas.getAllByRole("row").filter((r) => r.getAttribute("aria-selected") === "true"),
    ).toHaveLength(1);

    await userEvent.click(selectAll!);
    await waitFor(() =>
      expect(
        canvas
          .getAllByRole("row")
          .filter((r) => r.getAttribute("aria-selected") === "true"),
      ).toHaveLength(users.length),
    );
  },
};

/**
 * A column's `align` is its cells' default, read through the selection
 * column the table adds; a cell's own `align` wins, and a cell under a plain
 * column stays at the start.
 */
export const TableColumnAlignReachesCells: Story = {
  render: () => (
    <Card variant="outlined" className="w-[640px]">
      <Table aria-label="Users" selectionMode="multiple">
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="role" align="end">
            Role
          </Column>
          <Column id="email" align="end">
            Email
          </Column>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <Row id={user.id}>
              <Cell>{user.name}</Cell>
              <Cell>{user.role}</Cell>
              <Cell align="start">{user.email}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textAlign = (text: string) =>
      getComputedStyle(canvas.getByText(text).closest("td, th")!).textAlign;

    await expect(textAlign("Owner")).toBe("end");
    await expect(textAlign("Staff")).toBe("end");
    await expect(textAlign("yann@example.com")).toBe("start");
    await expect(textAlign("Yann Renaudin")).toBe("start");
  },
};

function UsersTable(props: { label: string; density?: "default" | "dense" }) {
  return (
    <Card variant="outlined" className="w-[420px]">
      <Table aria-label={props.label} density={props.density}>
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="role">Role</Column>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <Row id={user.id} className={user.id === 3 ? "h-12" : undefined}>
              <Cell>{user.name}</Cell>
              <Cell>{user.role}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

/**
 * A dense table draws 40px rows under a 44px header and a default one 52px
 * under 56px; a row's own height class wins over either; the arrow keys walk
 * a dense table as they do any other.
 */
export const TableDenseRows: Story = {
  render: () => (
    <div className="flex items-start gap-6">
      <UsersTable label="Default users" />
      <UsersTable label="Dense users" density="dense" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heights = (label: string) => {
      const table = canvas.getByRole("grid", { name: label });
      return within(table)
        .getAllByRole("row")
        .map((row) => row.getBoundingClientRect().height);
    };
    // Within a pixel: the collapsed 1px divider is shared between two rows.
    const near = (actual: number | undefined, expected: number) =>
      expect(Math.abs((actual ?? 0) - expected)).toBeLessThanOrEqual(1);

    const regular = heights("Default users");
    await near(regular[0], 56);
    await near(regular[1], 52);
    await near(regular[2], 52);

    const dense = heights("Dense users");
    await near(dense[0], 44);
    await near(dense[1], 40);
    await near(dense[2], 40);
    // The third row says `h-12` itself.
    await near(dense[3], 48);
    await near(regular[3], 48);

    const denseTable = canvas.getByRole("grid", { name: "Dense users" });
    await expect(denseTable).toHaveAttribute("data-density", "dense");
    await expect(
      canvas.getByRole("grid", { name: "Default users" }),
    ).toHaveAttribute("data-density", "default");

    // Keyboard: Tab past the first table into the dense one, then down a row.
    const rows = within(denseTable).getAllByRole("row");
    await userEvent.tab();
    await userEvent.tab();
    await waitFor(() => expect(rows[1]).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(rows[2]).toHaveFocus());
  },
};

const longNote =
  "Leave with the caretaker on the ground floor, the bell of the second floor is out of order";

/**
 * A cut cell shows one line, and its whole text in a tooltip: when the
 * pointer rests on it, and when the arrow keys land on it. Focus stays on the
 * gridcell, Escape puts the tooltip away, and a text that fits has none.
 */
export const TableCutCellWholeText: Story = {
  render: () => (
    <Card variant="outlined" className="w-[320px]">
      <Table aria-label="Deliveries">
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="note" className="w-full">
            Note
          </Column>
        </TableHeader>
        <TableBody>
          <Row id="long">
            <Cell>d-4821</Cell>
            <Cell truncate>{longNote}</Cell>
          </Row>
          <Row id="short">
            <Cell>d-4822</Cell>
            <Cell truncate>None</Cell>
          </Row>
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvasElement.querySelector<HTMLElement>(
      '[data-slot="table-cell-text"]',
    )!;
    const cell = text.closest("td")!;
    const [, longRow, shortRow] = canvas.getAllByRole("row");

    // The two waits that have a bound, each well over the component's own
    // timer so a busy machine does not fail them. The tooltip leaves the
    // document 1500 ms after the pointer does (`CUT_TEXT_CLOSE_DELAY`), then
    // its exit animation runs: 5000 ms leaves 3500. It shows 300 ms after the
    // pointer rests (`CUT_TEXT_DELAY`): 3000 ms leaves 2700.
    const gone = () =>
      waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull(), {
        timeout: 5000,
      });
    const shown = () => screen.findByRole("tooltip", {}, { timeout: 3000 });

    // One line: the text is wider than its box, and the row kept its height.
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await expect(
      Math.abs(longRow!.getBoundingClientRect().height - 52),
    ).toBeLessThanOrEqual(1);

    // Pointer.
    await userEvent.hover(cell);
    const tooltip = await shown();
    await expect(tooltip).toHaveTextContent(longNote);
    // Left by the pointer, it stays long enough to be reached, and for as
    // long as the pointer is on it.
    await userEvent.unhover(cell);
    // A fixed sleep, because it is the assertion: 600 ms after the pointer
    // left, the tooltip is still there. It fails only if the page stalls for
    // the 900 ms that remain of the 1500.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect(screen.getByRole("tooltip")).toBe(tooltip);
    await userEvent.hover(tooltip);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    await expect(screen.getByRole("tooltip")).toBe(tooltip);
    await userEvent.unhover(tooltip);
    await gone();

    // Keyboard: into the table, then across the row to the cut cell.
    await userEvent.tab();
    await waitFor(() => expect(longRow).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(cell).toHaveFocus());
    await expect(await shown()).toHaveTextContent(longNote);

    await userEvent.keyboard("{Escape}");
    await gone();

    // The short text fits: no tooltip on its cell.
    await userEvent.keyboard("{ArrowDown}");
    const shortCell = within(shortRow!).getByText("None").closest("td")!;
    await waitFor(() => expect(shortCell).toHaveFocus());
    await new Promise((resolve) => setTimeout(resolve, 400));
    await expect(screen.queryByRole("tooltip")).toBeNull();

    // Ends on the cut cell, with its text showing.
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(cell).toHaveFocus());
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(longNote);
  },
};

const otherNote =
  "Call on arrival: the gate code changes every Monday and is sent by message";

/**
 * One cut cell's tooltip at a time: a tooltip stays 1.5 seconds after the
 * pointer leaves its cell, but the next cell's, once it shows, puts it away.
 * The keyboard on one cell and the pointer on another leave one tooltip too.
 */
export const TableCutCellOneTooltipAtATime: Story = {
  render: () => (
    <Card variant="outlined" className="w-[320px]">
      <Table aria-label="Deliveries">
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="note" className="w-full">
            Note
          </Column>
        </TableHeader>
        <TableBody>
          <Row id="first">
            <Cell>d-4821</Cell>
            <Cell truncate>{longNote}</Cell>
          </Row>
          <Row id="second">
            <Cell>d-4823</Cell>
            <Cell truncate>{otherNote}</Cell>
          </Row>
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const [first, second] = Array.from(
      canvasElement.querySelectorAll('[data-slot="table-cell-text"]'),
    ).map((text) => text.closest("td")!);
    // Well inside the 1.5 seconds the first tooltip would otherwise stay.
    const onlyOne = (text: string) =>
      waitFor(
        async () => {
          const shown = screen.getAllByRole("tooltip");
          await expect(shown).toHaveLength(1);
          await expect(shown[0]).toHaveTextContent(text);
        },
        { timeout: 800 },
      );

    await userEvent.hover(first!);
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(longNote);

    await userEvent.hover(second!);
    await screen.findByText(otherNote, { selector: '[role="tooltip"] *' });
    await onlyOne(otherNote);

    // Keyboard on the first cell while the pointer rests on the second.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(first).toHaveFocus());
    await screen.findByText(longNote, { selector: '[role="tooltip"] *' });
    await onlyOne(longNote);
  },
};

/**
 * The Escape that puts a cut cell's tooltip away is the tooltip's alone: the
 * selected row stays selected. A second Escape, with no tooltip left, is the
 * table's, and clears the selection.
 */
export const TableCutCellEscapeKeepsSelection: Story = {
  render: () => (
    <Card variant="outlined" className="w-[360px]">
      <Table
        aria-label="Deliveries"
        selectionMode="multiple"
        defaultSelectedKeys={["long"]}
      >
        <TableHeader>
          <Column id="id" isRowHeader>
            Delivery
          </Column>
          <Column id="note" className="w-full">
            Note
          </Column>
        </TableHeader>
        <TableBody>
          <Row id="long">
            <Cell>d-4821</Cell>
            <Cell truncate>{longNote}</Cell>
          </Row>
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getAllByRole("row")[1]!;
    const cell = canvasElement
      .querySelector('[data-slot="table-cell-text"]')!
      .closest("td")!;

    await expect(row).toHaveAttribute("aria-selected", "true");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(cell).toHaveFocus());
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(longNote);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull(), {
      timeout: 3000,
    });
    await expect(row).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(row).toHaveAttribute("aria-selected", "false"));
  },
};

/**
 * The named parts of `Column` and `Cell` exist under their `data-slot` and
 * take the class given through `classNames`; each root takes `className`.
 */
export const TablePartClasses: Story = {
  render: () => (
    <Card variant="outlined" className="w-[420px]">
      <Table
        aria-label="Users"
        density="dense"
        className="tracking-wide"
        sortDescriptor={{ column: "name", direction: "ascending" }}
      >
        <TableHeader>
          <Column
            id="name"
            isRowHeader
            allowsSorting
            className="uppercase"
            classNames={{ columnContent: "gap-2", sortIcon: "text-primary" }}
          >
            Name
          </Column>
          <Column id="role" className="w-full">
            Role
          </Column>
        </TableHeader>
        <TableBody items={users}>
          {(user) => (
            <Row id={user.id}>
              <Cell>{user.name}</Cell>
              <Cell
                truncate
                className="italic"
                classNames={{ cellText: "text-primary" }}
              >
                {user.role}
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const part = (slot: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

    await expect(part("table")).toHaveClass("tracking-wide");
    await expect(part("table")).toHaveAttribute("data-density", "dense");
    await expect(part("table-column")).toHaveClass("uppercase");
    await expect(part("table-column-content")).toHaveClass("gap-2");
    await expect(part("table-column-content")).not.toHaveClass("gap-1");
    await expect(part("table-sort-icon")).toHaveClass("text-primary");
    await expect(part("table-cell-text")).toHaveClass("text-primary", "truncate");
    await expect(part("table-cell-text").closest("td")).toHaveClass("italic");

    // Keyboard: Tab lands on the first row, and up from it is the heading.
    const heading = within(canvasElement).getByRole("columnheader", {
      name: /name/i,
    });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(heading).toHaveFocus());
  },
};

function SnackbarHarness() {
  return (
    <div className="flex h-40 flex-col items-start gap-3">
      <Button onPress={() => snackbar("Changes saved")}>Save</Button>
      <Button
        onPress={() => snackbar("Email archived", { close: true })}
      >
        Archive
      </Button>
      <SnackbarRegion />
    </div>
  );
}

/**
 * One snackbar at a time — the newest replaces the one on screen, which is
 * the spec's "consecutive snackbars" rule — and the close affordance clears
 * it. The queue lives outside React, so each story drains it first.
 */
export const SnackbarQueueAndDismiss: Story = {
  render: () => <SnackbarHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const t of [...snackbarQueue.visibleToasts]) snackbarQueue.close(t.key);

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(await screen.findByText("Changes saved")).toBeVisible();

    // maxVisibleToasts is 1: the second replaces the first rather than stacking.
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    await expect(await screen.findByText("Email archived")).toBeVisible();
    await waitFor(() => expect(screen.queryByText("Changes saved")).toBeNull());

    const close = await screen.findByRole("button", { name: /close/i });
    await userEvent.click(close);
    await waitFor(() => expect(screen.queryByText("Email archived")).toBeNull());
  },
};

/**
 * The 5 s auto-dismiss, and hovering pausing it. This story spends real time
 * on purpose — the timer *is* the behaviour, and the queue exposes no flag to
 * read instead. Roughly 11 s; it is the slowest test in the kit and worth it,
 * because a snackbar that dismisses under the reader's cursor is the failure
 * MD3's pause rule exists to prevent.
 */
export const SnackbarAutoDismissAndPause: Story = {
  render: () => <SnackbarHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const t of [...snackbarQueue.visibleToasts]) snackbarQueue.close(t.key);

    // 1. Left alone, it goes away on its own.
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(await screen.findByText("Changes saved")).toBeVisible();
    await waitFor(
      () => expect(screen.queryByText("Changes saved")).toBeNull(),
      { timeout: SNACKBAR_TIMEOUT + 2000 },
    );

    // 2. Hovered, it stays past the same deadline.
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = await screen.findByText("Changes saved");
    await userEvent.hover(toast);
    await new Promise((resolve) =>
      setTimeout(resolve, SNACKBAR_TIMEOUT + 1000),
    );
    await expect(toast).toBeVisible();

    for (const t of [...snackbarQueue.visibleToasts]) snackbarQueue.close(t.key);
    await waitFor(() => expect(screen.queryByText("Changes saved")).toBeNull());
  },
};

/**
 * The snackbar announces politely rather than interrupting — MD3 asks for a
 * status, not an alert dialog — and carries its text in the live region.
 */
export const SnackbarIsPolite: Story = {
  render: () => <SnackbarHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const t of [...snackbarQueue.visibleToasts]) snackbarQueue.close(t.key);

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const alert = await screen.findByRole("alert");
    await expect(alert).toHaveAttribute("aria-live", "polite");
    await expect(alert).toHaveTextContent("Changes saved");

    for (const t of [...snackbarQueue.visibleToasts]) snackbarQueue.close(t.key);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  },
};

/**
 * A progress indicator has no keyboard path — it is read, not driven — so what
 * has to hold is the value it exposes. The determinate cases carry
 * `aria-valuenow` on a custom scale and a `aria-valuetext` the reader can say;
 * the indeterminate one carries no value at all, which is how a screen reader
 * tells "still working" from "62 % done".
 */
export const ProgressIndicatorAccessibleValue: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <ProgressIndicator label="Uploading menu" value={62} showValue />
      <ProgressIndicator
        label="Printing codes"
        value={30}
        minValue={0}
        maxValue={60}
        formatOptions={{ style: "decimal" }}
      />
      <ProgressIndicator label="Loading activity" isIndeterminate />
      <ProgressIndicator
        variant="circular"
        label="Saving venue"
        value={45}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const upload = canvas.getByRole("progressbar", { name: "Uploading menu" });
    await expect(upload).toHaveAttribute("aria-valuenow", "62");
    await expect(upload).toHaveAttribute("aria-valuemin", "0");
    await expect(upload).toHaveAttribute("aria-valuemax", "100");
    await expect(upload).toHaveAttribute("aria-valuetext", "62%");
    // The visible value label says the same thing as aria-valuetext.
    await expect(upload).toHaveTextContent("62%");

    // A custom scale is reported on its own terms, not rescaled to a percentage.
    const printing = canvas.getByRole("progressbar", { name: "Printing codes" });
    await expect(printing).toHaveAttribute("aria-valuenow", "30");
    await expect(printing).toHaveAttribute("aria-valuemax", "60");
    await expect(printing).toHaveAttribute("aria-valuetext", "30");

    // Indeterminate: present and named, but with nothing to report.
    const loading = canvas.getByRole("progressbar", {
      name: "Loading activity",
    });
    await expect(loading).not.toHaveAttribute("aria-valuenow");
    await expect(loading).not.toHaveAttribute("aria-valuetext");

    // The circular variant is the same role and the same value semantics.
    const saving = canvas.getByRole("progressbar", { name: "Saving venue" });
    await expect(saving).toHaveAttribute("aria-valuenow", "45");
  },
};

/** A meter is read, not driven: it is the `meter` role, named by its label,
    and reports its value on its own scale. */
export const MeterAccessibleValue: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // React Aria writes `role="meter progressbar"`, `progressbar` the
            // fallback for a browser without `meter`. ARIA takes the first
            // role it knows, `meter`, which allows aria-value*; axe reads the
            // two words as one unknown role and refuses them. The rule stays
            // on for every other element, and this play reads the `meter`
            // role and its values.
            id: "aria-allowed-attr",
            selector: '*:not([role="meter progressbar"])',
          },
        ],
      },
    },
  },
  render: () => (
    <div className="bg-surface flex w-96 flex-col gap-6 p-4">
      <Meter label="Storage used" value={62} showValue />
      <Meter
        label="Boards this month"
        value={3}
        maxValue={5}
        formatOptions={{ style: "decimal" }}
        valueLabel="3 of 5"
        showValue
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const storage = canvas.getByRole("meter", { name: "Storage used" });
    await expect(storage).toHaveAttribute("aria-valuenow", "62");
    await expect(storage).toHaveAttribute("aria-valuemin", "0");
    await expect(storage).toHaveAttribute("aria-valuemax", "100");
    await expect(storage).toHaveAttribute("aria-valuetext", "62%");
    // The visible value says the same thing as aria-valuetext.
    await expect(storage).toHaveTextContent("62%");

    // A custom scale is reported on its own terms, not rescaled to a percentage.
    const boards = canvas.getByRole("meter", { name: "Boards this month" });
    await expect(boards).toHaveAttribute("aria-valuenow", "3");
    await expect(boards).toHaveAttribute("aria-valuemin", "0");
    await expect(boards).toHaveAttribute("aria-valuemax", "5");
    await expect(boards).toHaveAttribute("aria-valuetext", "3 of 5");
    await expect(boards).toHaveTextContent("3 of 5");
  },
};

/** The same, in the dark scheme. */
export const MeterAccessibleValueDark: Story = {
  ...MeterAccessibleValue,
  globals: { theme: "dark" },
};

// A small inline SVG stands in for a picked image.
const sample =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="#84a59d"/></svg>`,
  );

/** With a value the field shows a preview; removing it returns the drop zone. */
export const ImageFieldRemove: Story = {
  render: () => (
    <ImageField
      label="Photo"
      defaultValue={sample}
      previewAlt="Menu card photo"
      className="w-96"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("img", { name: "Menu card photo" }),
    ).toBeVisible();
    const remove = canvas.getByRole("button", { name: /remove/i });

    await userEvent.click(remove);
    await waitFor(() => expect(canvas.queryByRole("img")).toBeNull());
    await expect(
      canvas.getByRole("button", { name: /choose image/i }),
    ).toBeVisible();
  },
};
