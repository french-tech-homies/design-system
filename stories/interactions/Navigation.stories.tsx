import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Archive,
  Bell,
  Bold,
  History,
  Home,
  Italic,
  ShoppingBasket,
  Trash2,
  Utensils,
} from "lucide-react";
import React from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { BottomNavigation } from "@french-tech-homies/design-system/components/BottomNavigation";
import { NavigationDrawer } from "@french-tech-homies/design-system/components/NavigationDrawer";
import { NavigationRail } from "@french-tech-homies/design-system/components/NavigationRail";
import { Tab, TabList, TabPanel, Tabs } from "@french-tech-homies/design-system/components/Tabs";
import Button from "@french-tech-homies/design-system/components/Button";
import { TopAppBar } from "@french-tech-homies/design-system/components/TopAppBar";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { Toolbar } from "@french-tech-homies/design-system/components/Toolbar";
import {
  SearchBar,
  SearchView,
  SearchViewItem,
} from "@french-tech-homies/design-system/components/Search";

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

/* ---- Badges ------------------------------------------------------------ */

const badged = [
  { id: "home", label: "Home", icon: Home, badge: 3 },
  { id: "menus", label: "Menus", icon: Utensils, badge: true as const },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBasket,
    badge: 12,
    badgeLabel: "12 new orders",
  },
  {
    id: "library",
    label: "Library",
    icon: Utensils,
    ariaLabel: "Menu library",
    badge: 1200,
  },
  { id: "none", label: "Nothing", icon: Home, badge: 0 },
];

/** A badge is read after its destination, as Material's badges page says: the
    count, "New notification" for the dot, `badgeLabel` where given, joined
    to `ariaLabel` where the item has one. A count of 0 says nothing and
    draws nothing. */
export const BadgeJoinsTheDestinationName: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <BottomNavigation items={badged} aria-label="Bar" defaultSelectedKey="home" />
      <div className="h-[480px]">
        <NavigationRail items={badged} aria-label="Rail" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const landmark of ["Bar", "Rail"]) {
      const nav = within(canvas.getByRole("navigation", { name: landmark }));
      await expect(nav.getByRole("button", { name: "Home, 3" })).toBeVisible();
      await expect(
        nav.getByRole("button", { name: "Menus, New notification" }),
      ).toBeVisible();
      await expect(
        nav.getByRole("button", { name: "Orders, 12 new orders" }),
      ).toBeVisible();
      await expect(
        nav.getByRole("button", { name: "Menu library, 999+" }),
      ).toBeVisible();
      const nothing = nav.getByRole("button", { name: "Nothing" });
      await expect(nothing.querySelector('[data-slot="badge"]')).toBeNull();
    }
    // The badge itself is hidden: its words are in the name already.
    const badges = canvasElement.querySelectorAll('[data-slot="badge"]');
    await expect(badges.length).toBe(8);
    for (const badge of badges)
      await expect(badge).toHaveAttribute("aria-hidden", "true");
    await expect(canvas.getAllByText("999+")[0]).toBeInTheDocument();
  },
};

/** The drawer's badge is its trailing label text, not the red badge, and is
    read once, after the name. A `true` badge shows its `badgeLabel`. */
export const DrawerBadgeIsTrailingText: Story = {
  render: () => (
    <NavigationDrawer
      items={[
        { id: "inbox", label: "Inbox", icon: Home, badge: 24 },
        {
          id: "spaces",
          label: "Spaces",
          icon: Utensils,
          badge: true,
          badgeLabel: "New",
        },
      ]}
      defaultSelectedKey="inbox"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inbox = canvas.getByRole("button", { name: "Inbox, 24" });
    await expect(inbox).toHaveTextContent("24");
    await expect(inbox.querySelector('[data-slot="badge"]')).toBeNull();
    await expect(
      inbox.querySelector('[data-slot="navigation-drawer-badge"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await expect(canvas.getByRole("button", { name: "Spaces, New" })).toBeVisible();
  },
};

/** A tab's badge follows its name, whether it sits on a stacked icon or after
    an inline label, and the arrow keys still move between the tabs. */
export const TabBadgeJoinsTheTabName: Story = {
  render: () => (
    <Tabs>
      <TabList aria-label="Mailboxes">
        <Tab id="inbox" icon={Home} badge={3}>
          Inbox
        </Tab>
        <Tab id="sent" icon={Utensils} iconPosition="start" badge>
          Sent
        </Tab>
        <Tab id="spam">Spam</Tab>
      </TabList>
      <TabPanel id="inbox">Inbox</TabPanel>
      <TabPanel id="sent">Sent</TabPanel>
      <TabPanel id="spam">Spam</TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inbox = canvas.getByRole("tab", { name: "Inbox, 3" });
    const sent = canvas.getByRole("tab", { name: "Sent, New notification" });
    await userEvent.tab();
    await expect(inbox).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(sent).toHaveFocus();
    await expect(sent).toHaveAttribute("aria-selected", "true");
  },
};

/** An icon button's badge is joined to its `aria-label`, toggle or not. */
export const IconButtonBadgeJoinsItsLabel: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton variant="standard" icon={Bell} aria-label="Notifications" badge={3} />
      <IconButton
        isToggle
        variant="standard"
        icon={Bell}
        aria-label="Alerts"
        badge
      />
      <IconButton
        variant="standard"
        icon={Archive}
        aria-label="Archive"
        badge={5}
        badgeLabel="5 waiting"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Notifications, 3" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Alerts, New notification" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Archive, 5 waiting" }),
    ).toBeVisible();
  },
};

/* ---- Toolbar ----------------------------------------------------------- */

/** The `toolbar` role, one stop in the tab order, the arrow keys between its
    controls (React Aria's toolbar; the deviation is in the doc comment). */
export const ToolbarArrowKeysMoveBetweenControls: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <button type="button">Before</button>
      <Toolbar variant="floating" aria-label="Message">
        <IconButton variant="standard" icon={Archive} aria-label="Archive" />
        <IconButton variant="standard" icon={Trash2} aria-label="Delete" />
        <IconButton isToggle variant="standard" icon={Bold} aria-label="Bold" />
      </Toolbar>
      <button type="button">After</button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole("toolbar", { name: "Message" });
    await expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    const archive = canvas.getByRole("button", { name: "Archive" });
    const remove = canvas.getByRole("button", { name: "Delete" });
    const bold = canvas.getByRole("button", { name: "Bold" });

    canvas.getByRole("button", { name: "Before" }).focus();
    await userEvent.tab();
    await expect(archive).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(remove).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(bold).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(remove).toHaveFocus();

    // Space activates the focused control.
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard(" ");
    await expect(bold).toHaveAttribute("aria-pressed", "true");

    // Tab leaves the toolbar.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
  },
};

/** Vertical: Up and Down move, and the toolbar says its orientation. */
export const ToolbarVerticalUsesUpAndDown: Story = {
  render: () => (
    <Toolbar variant="floating" orientation="vertical" aria-label="Format">
      <IconButton isToggle variant="standard" icon={Bold} aria-label="Bold" />
      <IconButton isToggle variant="standard" icon={Italic} aria-label="Italic" />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("toolbar")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
  },
};

/* ---- Search ------------------------------------------------------------ */

const onSearchSubmit = fn();
const onSearchAction = fn();

/** The bar is a `searchbox` named by its hint; Enter submits, Escape empties
    it, and so does the clear button that appears once there is text. */
export const SearchBarSubmitsAndClears: Story = {
  render: () => (
    <SearchBar placeholder="Search messages" onSubmit={onSearchSubmit} />
  ),
  play: async ({ canvasElement }) => {
    onSearchSubmit.mockClear();
    const canvas = within(canvasElement);
    const box = canvas.getByRole("searchbox", { name: "Search messages" });
    // No clear button while there is nothing to clear.
    await expect(
      canvas.queryByRole("button", { name: "Clear search" }),
    ).toBeNull();

    await userEvent.tab();
    await expect(box).toHaveFocus();
    await userEvent.keyboard("peanut{Enter}");
    await expect(onSearchSubmit).toHaveBeenCalledWith("peanut");

    await userEvent.keyboard("{Escape}");
    await expect(box).toHaveValue("");

    await userEvent.type(box, "plants");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(box).toHaveValue("");
  },
};

const garden = ["Plants", "Planters", "Pruning shears", "Watering can"];

function GardenSearch({
  layout,
  onAction,
  onSubmit,
}: {
  layout: "docked" | "full-screen";
  onAction?: (key: React.Key) => void;
  onSubmit?: (value: string) => void;
}) {
  return (
    <SearchView
      placeholder="Search the garden shop"
      layout={layout}
      onAction={onAction}
      onSubmit={onSubmit}
    >
      {garden.map((name) => (
        <SearchViewItem key={name} id={name} label={name} leadingIcon={History} />
      ))}
    </SearchView>
  );
}

/** Docked: the bar opens a dialog with the caret in its field; typing
    filters, the arrows highlight, Enter chooses; Escape empties the field,
    a second Escape closes the view and the focus goes back to the bar. */
export const SearchViewFiltersAndChooses: Story = {
  render: () => <GardenSearch layout="docked" onAction={onSearchAction} />,
  play: async ({ canvasElement }) => {
    onSearchAction.mockClear();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Search the garden shop",
    });

    // Keyboard first: Tab to the bar, Enter opens it.
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", {
      name: "Search the garden shop",
    });
    const box = within(dialog).getByRole("searchbox");
    await waitFor(() => expect(box).toHaveFocus());
    await expect(within(dialog).getAllByRole("option")).toHaveLength(4);

    await userEvent.keyboard("pla");
    await waitFor(() =>
      expect(within(dialog).getAllByRole("option")).toHaveLength(2),
    );
    await waitFor(() =>
      expect(within(dialog).getByRole("status")).toHaveTextContent("2 results"),
    );

    await userEvent.keyboard("{ArrowDown}");
    const plants = within(dialog).getByRole("option", { name: "Plants" });
    await waitFor(() => expect(plants).toHaveAttribute("data-focused", "true"));
    await userEvent.keyboard("{Enter}");
    await expect(onSearchAction).toHaveBeenCalledWith("Plants");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    // The bar shows the query, and keeps it in its name.
    await expect(
      canvas.getByRole("button", { name: "Search the garden shop: pla" }),
    ).toBeVisible();

    // Escape empties the field first, then closes.
    await userEvent.keyboard("{Enter}");
    const again = await screen.findByRole("dialog");
    const field = within(again).getByRole("searchbox");
    await waitFor(() => expect(field).toHaveFocus());
    await expect(field).toHaveValue("pla");
    await userEvent.keyboard("{Escape}");
    await expect(field).toHaveValue("");
    await expect(screen.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Search the garden shop" }),
      ).toHaveFocus(),
    );
  },
};

/** With nothing to match, the list says so, and the live region too; Enter
    with nothing highlighted runs the query. */
export const SearchViewEmptyStateAndSubmit: Story = {
  render: () => <GardenSearch layout="docked" onSubmit={onSearchSubmit} />,
  play: async ({ canvasElement }) => {
    onSearchSubmit.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Search the garden shop" }),
    );
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByRole("searchbox")).toHaveFocus(),
    );
    await userEvent.keyboard("zebra");
    await waitFor(() =>
      expect(
        within(dialog).queryByRole("option", { name: "Plants" }),
      ).toBeNull(),
    );
    await expect(within(dialog).getAllByText("No results")[0]).toBeVisible();
    await waitFor(() =>
      expect(within(dialog).getByRole("status")).toHaveTextContent("No results"),
    );
    await userEvent.keyboard("{Enter}");
    await expect(onSearchSubmit).toHaveBeenCalledWith("zebra");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

/** Full screen: a modal dialog over the whole window; the back button closes
    it and gives the focus back to the bar. */
export const SearchViewFullScreenBackCloses: Story = {
  render: () => <GardenSearch layout="full-screen" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Search the garden shop",
    });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByRole("searchbox")).toHaveFocus(),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Back" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** The search app bar keeps the screen's heading, hidden, and draws its
    search without a shadow. */
export const TopAppBarSearchKeepsTheHeading: Story = {
  render: () => (
    <TopAppBar
      title="Garden shop"
      search={<SearchBar placeholder="Search the garden shop" />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Garden shop" }),
    ).toBeInTheDocument();
    // Every layer of the shadow is transparent: no elevation.
    const bar = canvasElement.querySelector('[data-slot="search-bar"]')!;
    const layers = getComputedStyle(bar).boxShadow.split(/,(?![^(]*\))/);
    for (const layer of layers)
      await expect(layer).toMatch(/none|rgba\(0, 0, 0, 0\)/);
    await expect(
      canvas.getByRole("searchbox", { name: "Search the garden shop" }),
    ).toBeVisible();
  },
};
