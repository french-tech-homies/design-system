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
