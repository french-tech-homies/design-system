import type { Meta, StoryObj } from "@storybook/react-vite";
import { Home, Inbox, Settings, Users } from "lucide-react";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { TopAppBar } from "@french-tech-homies/design-system/components/TopAppBar";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

import { AppShell } from "../../blocks/app-shell/AppShell";

/**
 * A block: `npx shadcn add @ds/app-shell-block` copies it into a project's
 * components, where it is the project's to edit. The kit's three navigation
 * components, and the choice between them by width.
 */
const meta = {
  title: "MD3/Blocks/AppShell",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox, badge: 3 },
  { id: "people", label: "People", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

function Shell({ width }: { width: number }) {
  const [current, setCurrent] = useState("home");
  return (
    <div style={{ width, height: 480 }}>
      <AppShell
        items={items}
        selectedKey={current}
        onSelectionChange={setCurrent}
        topBar={<TopAppBar title={items.find((i) => i.id === current)!.label} />}
      >
        <Body className="p-4">The page for {current}.</Body>
      </AppShell>
    </div>
  );
}

const shown = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll<HTMLElement>("nav")]
    .filter((nav) => nav.getClientRects().length > 0)
    .map((nav) => nav.getAttribute("data-slot"));

/** Compact, under 600dp: the navigation bar under the content. */
export const Compact: Story = {
  render: () => <Shell width={400} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(shown(canvasElement)).toEqual(["bottom-navigation"]);
    // One navigation landmark is exposed, whatever the width.
    await expect(canvas.getAllByRole("navigation")).toHaveLength(1);

    // The skip link is the first thing a keyboard reaches.
    await userEvent.tab();
    await expect(
      canvas.getByRole("link", { name: "Skip to content" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("main")).toHaveFocus();

    await userEvent.click(canvas.getByRole("button", { name: /Inbox/ }));
    await expect(canvas.getByText("The page for inbox.")).toBeVisible();
  },
};

/** Medium, from 600dp: the navigation rail beside the content. */
export const Medium: Story = {
  render: () => <Shell width={720} />,
  play: async ({ canvasElement }) => {
    await expect(shown(canvasElement)).toEqual(["navigation-rail"]);
    await expect(
      [...canvasElement.querySelectorAll<HTMLElement>("nav")]
        .find((n) => n.getClientRects().length > 0)!
        .getBoundingClientRect().width,
    ).toBeLessThan(120);
  },
};

/** Large, from 1200dp: the rail expanded, labels beside icons. */
export const Large: Story = {
  render: () => <Shell width={1240} />,
  play: async ({ canvasElement }) => {
    await expect(shown(canvasElement)).toEqual(["navigation-rail"]);
    await expect(
      [...canvasElement.querySelectorAll<HTMLElement>("nav")]
        .find((n) => n.getClientRects().length > 0)!
        .getBoundingClientRect().width,
    ).toBeGreaterThan(200);
  },
};
