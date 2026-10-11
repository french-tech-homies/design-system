import type { Meta, StoryObj } from "@storybook/react-vite";
import { Home, ShoppingBasket, Utensils } from "lucide-react";
import React from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { BottomNavigation } from "@french-tech-homies/design-system/components/BottomNavigation";
import { NavigationDrawer } from "@french-tech-homies/design-system/components/NavigationDrawer";
import { NavigationRail } from "@french-tech-homies/design-system/components/NavigationRail";
import { Tab, TabList, TabPanel, Tabs } from "@french-tech-homies/design-system/components/Tabs";
import Button from "@french-tech-homies/design-system/components/Button";
import { TopAppBar } from "@french-tech-homies/design-system/components/TopAppBar";

/**
 * Behaviour tests for the navigation family. A navigation bar is not a tab
 * set: Tab moves between destinations (the spec's own keyboard table), Space
 * and Enter activate the focused one, and the arrow keys do nothing. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Navigation",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const three = [
  { id: "home", label: "Home", icon: Home },
  { id: "menus", label: "Menus", icon: Utensils },
  { id: "orders", label: "Orders", icon: ShoppingBasket },
];

/** Every destination is its own tab stop, and the arrow keys are not bound —
    the roving tabindex of a tab list would be wrong here. */
export const BottomNavigationTabMovesBetweenDestinations: Story = {
  render: () => <BottomNavigation items={three} defaultSelectedKey="home" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole("button", { name: "Home" });
    const menus = canvas.getByRole("button", { name: "Menus" });
    const orders = canvas.getByRole("button", { name: "Orders" });

    await userEvent.tab();
    await expect(home).toHaveFocus();

    // A tab list would move the selection here; a navigation bar ignores it.
    await userEvent.keyboard("{ArrowRight}");
    await expect(home).toHaveFocus();

    await userEvent.tab();
    await expect(menus).toHaveFocus();
    await userEvent.tab();
    await expect(orders).toHaveFocus();
  },
};

/** Space and Enter activate the focused destination, and `aria-current` moves
    with it — one destination is current at a time. */
export const BottomNavigationKeyboardSelects: Story = {
  render: () => <BottomNavigation items={three} defaultSelectedKey="home" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole("button", { name: "Home" });
    const menus = canvas.getByRole("button", { name: "Menus" });
    const orders = canvas.getByRole("button", { name: "Orders" });

    await expect(home).toHaveAttribute("aria-current", "page");

    await userEvent.tab();
    await userEvent.tab();
    await expect(menus).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(menus).toHaveAttribute("aria-current", "page");
    await expect(home).not.toHaveAttribute("aria-current");

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(orders).toHaveAttribute("aria-current", "page");
    await expect(menus).not.toHaveAttribute("aria-current");
  },
};

/** Regression guard for issue #123: the bar used to be React Aria `Tabs`
    with no `TabPanel`, so every item carried an `aria-controls` pointing at
    an element that did not exist. Destinations are links or buttons now, and
    reference nothing. */
export const BottomNavigationReferencesNothing: Story = {
  render: () => (
    <BottomNavigation
      items={three.map((item) => ({ ...item, href: `#${item.id}` }))}
      defaultSelectedKey="menus"
      aria-label="Workspace"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("navigation", { name: "Workspace" });
    const destinations = within(bar).getAllByRole("link");

    await expect(destinations).toHaveLength(3);
    for (const destination of destinations) {
      await expect(destination).not.toHaveAttribute("aria-controls");
      await expect(destination).not.toHaveAttribute("aria-describedby");
      await expect(destination).not.toHaveAttribute("role", "tab");
    }

    await expect(
      within(bar).getByRole("link", { name: "Menus" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

function Ranges(props: { disabledKeys?: string[] }) {
  return (
    <div className="max-w-2xl">
      <Tabs {...props}>
        <TabList aria-label="Time range">
          <Tab id="today">Today</Tab>
          <Tab id="week">This week</Tab>
          <Tab id="month">This month</Tab>
        </TabList>
        <TabPanel id="today">42 orders</TabPanel>
        <TabPanel id="week">310 orders</TabPanel>
        <TabPanel id="month">1,204 orders</TabPanel>
      </Tabs>
    </div>
  );
}

/**
 * The other half of the pair above: a tab set *is* arrow-navigable, and it is
 * one tab stop, not three. Tab reaches the selected tab, the arrows move the
 * selection and the panel follows, and Home and End jump to the ends.
 */
export const TabsArrowKeysMoveSelection: Story = {
  render: () => <Ranges />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const today = canvas.getByRole("tab", { name: "Today" });
    const week = canvas.getByRole("tab", { name: "This week" });
    const month = canvas.getByRole("tab", { name: "This month" });

    await expect(today).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("42 orders");

    // One tab stop for the whole set — the roving tabindex a tab list has and
    // a navigation bar deliberately does not.
    await userEvent.tab();
    await expect(today).toHaveFocus();
    await expect(week).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("{ArrowRight}");
    await expect(week).toHaveFocus();
    await expect(week).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("310 orders");

    await userEvent.keyboard("{End}");
    await expect(month).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Home}");
    await expect(today).toHaveAttribute("aria-selected", "true");
  },
};

/** Each panel is labelled by its tab and pointed at by it, so a reader lands
    on named content rather than an anonymous region. */
export const TabsWirePanelToTab: Story = {
  render: () => <Ranges />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const today = canvas.getByRole("tab", { name: "Today" });
    const panel = canvas.getByRole("tabpanel");

    await expect(today).toHaveAttribute("aria-controls", panel.id);
    await expect(panel).toHaveAttribute("aria-labelledby", today.id);
  },
};

const shell = [
  { id: "live", label: "Orders", icon: Home },
  { id: "menus", label: "Menus", icon: Utensils },
  { id: "history", label: "History", icon: ShoppingBasket },
];

/**
 * The rail is a navigation landmark, not a tab set — the same contract the bar
 * keeps. Each destination is its own tab stop, the arrows are not bound, and
 * exactly one destination carries `aria-current="page"`.
 */
export const NavigationRailIsALandmark: Story = {
  render: () => (
    <div className="flex h-96">
      <NavigationRail
        items={shell}
        defaultSelectedKey="live"
        aria-label="Venue"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rail = canvas.getByRole("navigation", { name: "Venue" });
    const orders = within(rail).getByRole("button", { name: "Orders" });
    const menus = within(rail).getByRole("button", { name: "Menus" });

    await expect(orders).toHaveAttribute("aria-current", "page");
    await expect(within(rail).getAllByRole("button")).toHaveLength(3);
    for (const destination of within(rail).getAllByRole("button")) {
      await expect(destination).not.toHaveAttribute("role", "tab");
      await expect(destination).not.toHaveAttribute("aria-controls");
    }

    await userEvent.tab();
    await expect(orders).toHaveFocus();
    // A tab list would move the selection here; a rail ignores it.
    await userEvent.keyboard("{ArrowDown}");
    await expect(orders).toHaveFocus();

    await userEvent.tab();
    await expect(menus).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(menus).toHaveAttribute("aria-current", "page"),
    );
    await expect(orders).not.toHaveAttribute("aria-current");
  },
};

/** The expanded rail keeps every label visible — same roles, same wiring. */
export const NavigationRailExpandedShowsLabels: Story = {
  render: () => (
    <div className="flex h-96">
      <NavigationRail
        items={shell}
        defaultSelectedKey="menus"
        isExpanded
        aria-label="Venue"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rail = canvas.getByRole("navigation", { name: "Venue" });

    await expect(
      within(rail).getByRole("button", { name: "Menus" }),
    ).toHaveAttribute("aria-current", "page");
    for (const item of shell) {
      await expect(within(rail).getByText(item.label)).toBeVisible();
    }
  },
};

function DrawerHarness() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="flex h-96 items-start">
      <Button onPress={() => setIsOpen(true)}>Open navigation</Button>
      <NavigationDrawer
        variant="modal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={shell}
        defaultSelectedKey="live"
        aria-label="Venue"
      />
    </div>
  );
}

/**
 * The modal drawer owes a keyboard user the whole overlay contract: focus goes
 * in, Escape closes it, and focus comes back to what opened it. Choosing a
 * destination closes it too — a drawer left open over the page it just
 * navigated to is in the way.
 */
export const ModalDrawerTrapsAndReturnsFocus: Story = {
  render: () => <DrawerHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /open navigation/i });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const dialog = await screen.findByRole("dialog", { name: "Venue" });
    await expect(dialog).toBeVisible();
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    // The nav landmark survives inside the dialog.
    await expect(
      within(dialog).getByRole("navigation", { name: "Venue" }),
    ).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());

    // Choosing a destination also closes it.
    await userEvent.click(trigger);
    const reopened = await screen.findByRole("dialog", { name: "Venue" });
    await userEvent.click(
      within(reopened).getByRole("button", { name: "Menus" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

/** The app bar's title is a real heading at the level it was given. */
export const TopAppBarTitleIsAHeading: Story = {
  render: () => (
    <TopAppBar
      title="Tables & QR"
      subtitle="Pizzeria Bellini"
      actions={<Button variant="text">Add</Button>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { level: 1, name: "Tables & QR" }),
    ).toBeVisible();
    await expect(canvas.getByRole("banner")).toBeVisible();
    // The subtitle is not a second heading competing with it.
    await expect(canvas.getAllByRole("heading")).toHaveLength(1);
  },
};

/** A disabled tab is skipped by the arrows and cannot become selected. */
export const TabsSkipDisabled: Story = {
  render: () => <Ranges disabledKeys={["week"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const today = canvas.getByRole("tab", { name: "Today" });
    const week = canvas.getByRole("tab", { name: "This week" });
    const month = canvas.getByRole("tab", { name: "This month" });

    await expect(week).toHaveAttribute("aria-disabled", "true");

    await userEvent.tab();
    await expect(today).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(month).toHaveAttribute("aria-selected", "true");
    await expect(week).toHaveAttribute("aria-selected", "false");
  },
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

/** The accessible name is the visible label, unless the item asks for a more
    descriptive one — the spec's "Library" → "Music library" case. */
export const BottomNavigationAccessibleNames: Story = {
  render: () => (
    <BottomNavigation
      items={[
        { id: "home", label: "Home", icon: Home },
        {
          id: "library",
          label: "Library",
          icon: Utensils,
          ariaLabel: "Menu library",
        },
        { id: "orders", label: "Orders", icon: ShoppingBasket },
      ]}
      defaultSelectedKey="home"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Home" })).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Menu library" }),
    ).toBeVisible();
  },
};
