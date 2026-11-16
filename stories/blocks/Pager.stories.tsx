import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { Pager } from "../../blocks/pager/Pager";

/**
 * A block: `npx shadcn add @ds/pager-block` copies it into a project's
 * components, where it is the project's to edit. Neither Material nor React
 * Aria describes a pager; this one is built from the kit's icon buttons,
 * its menu and its type.
 */
const meta = {
  title: "MD3/Blocks/Pager",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Paged({ total, sizes }: { total: number; sizes?: number[] }) {
  const [page, setPage] = useState(2);
  const [size, setSize] = useState(25);
  return (
    <Pager
      aria-label="Pages of orders"
      page={page}
      pageSize={size}
      total={total}
      onPageChange={setPage}
      pageSizes={sizes}
      onPageSizeChange={(next) => {
        setSize(next);
        setPage(1);
      }}
    />
  );
}

/** The range shown, with previous and next. */
export const RangeAndSteps: Story = {
  render: () => <Paged total={312} />,
};

/** With a page size to choose. */
export const WithPageSize: Story = {
  render: () => <Paged total={312} sizes={[10, 25, 50]} />,
};

/** Nothing to page: both steps are disabled. */
export const Empty: Story = {
  render: () => (
    <Pager page={1} pageSize={25} total={0} onPageChange={() => undefined} />
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // MD3's disabled content is `on-surface` at 38 %, which never
            // reaches 4.5:1. WCAG 1.4.3 exempts inactive components.
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
};

/** By the keyboard: next and previous move the range and stop at each end;
    the page size is chosen from its menu and takes the pager back to the
    first page. */
export const IsWalkedByTheKeyboard: Story = {
  render: () => <Paged total={60} sizes={[10, 25, 50]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pages of orders" });
    const range = () => within(nav).getByText(/of 60/).textContent;
    const previous = within(nav).getByRole("button", { name: "Previous page" });
    const next = within(nav).getByRole("button", { name: "Next page" });
    await expect(range()).toBe("26–50 of 60");

    next.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(range()).toBe("51–60 of 60"));
    await expect(next).toBeDisabled();

    previous.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(range()).toBe("1–25 of 60"));
    await expect(previous).toBeDisabled();

    const size = within(nav).getByRole("button", { name: /per page/ });
    size.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    await expect(
      within(menu).getByRole("menuitemradio", { name: "25 per page" }),
    ).toHaveAttribute("aria-checked", "true");
    await userEvent.click(
      within(menu).getByRole("menuitemradio", { name: "10 per page" }),
    );
    await waitFor(() => expect(range()).toBe("1–10 of 60"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};
