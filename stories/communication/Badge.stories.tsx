import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Inbox, Mail, MessageSquare, Users, Video } from "lucide-react";
import React from "react";
import { expect, within } from "storybook/test";

import { Badge, type BadgeColor } from "@french-tech-homies/design-system/components/Badge";
import { BottomNavigation } from "@french-tech-homies/design-system/components/BottomNavigation";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { NavigationDrawer } from "@french-tech-homies/design-system/components/NavigationDrawer";
import { NavigationRail } from "@french-tech-homies/design-system/components/NavigationRail";
import { Tab, TabList, TabPanel, Tabs } from "@french-tech-homies/design-system/components/Tabs";
import { Label } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Material 3 badges: the small badge, a 6dp dot for a new notification, and
 * the large one, a 16dp count that grows to four characters ("999+"), both on
 * `error`, anchored on the top trailing corner of a destination's icon.
 *
 * A badge is not read on its own: the host joins its words to the
 * destination's name ("Mail, 3"; "Chat, New notification"). The hosts are
 * the navigation bar, the rail, the drawer (as its trailing label text), the
 * tabs and the icon button, each through `badge` and `badgeLabel`.
 */
const meta = {
  title: "MD3/Communication/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A 24dp icon box, as a host draws one, with a badge on its corner. */
function OnIcon({
  value,
  color,
}: {
  value?: number | string;
  color?: BadgeColor;
}) {
  return (
    <span className="relative inline-flex text-on-surface-variant">
      <Inbox size={24} aria-hidden />
      <Badge value={value} color={color} anchored />
    </span>
  );
}

/** The three badges Material draws, each on an icon and alone. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-12">
      {[undefined, 3, 1200].map((value) => (
        <div key={String(value)} className="flex flex-col items-center gap-3">
          <OnIcon value={value} />
          <Badge value={value} />
          <Label component="span" size="small" colorRole="on-surface-variant">
            {value === undefined ? "Small" : value === 3 ? "Large" : "Max (999+)"}
          </Label>
        </div>
      ))}
    </div>
  ),
};

/** One to four characters, the "+" counted: 1, 23, 456, 999+. A count of 0
    draws nothing. */
export const Counts: Story = {
  render: () => (
    <div className="flex items-center gap-10">
      {[0, 1, 23, 456, 7890].map((value) => (
        <OnIcon key={value} value={value} />
      ))}
    </div>
  ),
};

const destinations = [
  { id: "mail", label: "Mail", icon: Mail, badge: 3 },
  { id: "chat", label: "Chat", icon: MessageSquare, badge: true as const },
  { id: "spaces", label: "Spaces", icon: Users, badge: 1200 },
  { id: "meet", label: "Meet", icon: Video },
];

/** On the navigation bar, active and inactive destinations alike. */
export const OnNavigationBar: Story = {
  render: () => (
    <div className="bg-surface w-[400px]">
      <BottomNavigation items={destinations} defaultSelectedKey="mail" />
    </div>
  ),
};

/** On the rail: on the icon collapsed; a count after the label expanded,
    where the label follows the icon. */
export const OnNavigationRail: Story = {
  render: () => (
    <div className="flex h-[420px] gap-6">
      <NavigationRail items={destinations} defaultSelectedKey="mail" />
      <NavigationRail
        items={destinations}
        defaultSelectedKey="mail"
        isExpanded
        aria-label="Primary, expanded"
      />
    </div>
  ),
};

/** The drawer's own badge: trailing label text, not the red badge. */
export const OnNavigationDrawer: Story = {
  render: () => (
    <div className="h-[360px]">
      <NavigationDrawer
        items={[
          { id: "inbox", label: "Inbox", icon: Inbox, badge: 24 },
          { id: "chat", label: "Chat", icon: MessageSquare, badge: 1200 },
          {
            id: "spaces",
            label: "Spaces",
            icon: Users,
            badge: true,
            badgeLabel: "New",
          },
          { id: "meet", label: "Meet", icon: Video },
        ]}
        defaultSelectedKey="inbox"
      />
    </div>
  ),
};

/** On a stacked icon, the badge sits on the icon; on an inline one, after
    the label, at the tab's trailing edge. */
export const OnTabs: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <Tabs>
        <TabList aria-label="Stacked">
          <Tab id="mail" icon={Mail} badge={3}>
            Mail
          </Tab>
          <Tab id="chat" icon={MessageSquare} badge>
            Chat
          </Tab>
          <Tab id="meet" icon={Video}>
            Meet
          </Tab>
        </TabList>
        <TabPanel id="mail" className="sr-only">Mail</TabPanel>
        <TabPanel id="chat" className="sr-only">Chat</TabPanel>
        <TabPanel id="meet" className="sr-only">Meet</TabPanel>
      </Tabs>
      <Tabs>
        <TabList aria-label="Inline">
          <Tab id="mail" icon={Mail} iconPosition="start" badge={3}>
            Mail
          </Tab>
          <Tab id="chat" badge={12}>
            Chat
          </Tab>
        </TabList>
        <TabPanel id="mail" className="sr-only">Mail</TabPanel>
        <TabPanel id="chat" className="sr-only">Chat</TabPanel>
      </Tabs>
    </div>
  ),
};

/** On icon buttons: a small badge where room is tight, as in an app bar. */
export const OnIconButton: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton variant="standard" icon={Bell} aria-label="Notifications" badge />
      <IconButton variant="standard" icon={Mail} aria-label="Mail" badge={8} />
      <IconButton variant="tonal" icon={Inbox} aria-label="Inbox" badge={1200} />
    </div>
  ),
};

/** Right to left: the badge moves to the icon's other corner, as the
    guidelines ask. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" className="flex flex-col gap-6">
      <div className="flex items-center gap-10">
        <OnIcon />
        <OnIcon value={3} />
        <OnIcon value={1200} />
      </div>
      <div className="bg-surface w-[400px]">
        <BottomNavigation items={destinations} defaultSelectedKey="mail" />
      </div>
    </div>
  ),
};

/** The dark scheme: `error` and `on-error` are the dark roles. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => (
    <div className="bg-surface flex w-[400px] flex-col gap-6 p-4">
      <div className="flex items-center gap-10">
        <OnIcon />
        <OnIcon value={3} />
        <OnIcon value={1200} />
      </div>
      <BottomNavigation items={destinations} defaultSelectedKey="mail" />
    </div>
  ),
};

const COLORS: BadgeColor[] = ["error", "primary", "secondary", "tertiary"];

/** WCAG's contrast ratio of two computed `rgb(…)` colours. */
function contrast(a: string, b: string) {
  const luminance = (css: string) => {
    const [r = 0, g = 0, b = 0] = css.match(/[\d.]+/g)!.slice(0, 3).map((c) => {
      const v = Number(c) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * Each badge's text on its fill at least 4.5:1, its label being 11px text,
 * and its fill on the surface at least 3:1, as Material's guidelines ask of a
 * role other than its own: in light and in dark. axe cannot check either, a
 * badge being `aria-hidden`.
 */
async function expectBadgesContrast(canvasElement: HTMLElement) {
  const html = document.documentElement;
  const wasDark = html.classList.contains("dark");
  const surface = canvasElement.querySelector<HTMLElement>("[data-surface]")!;
  try {
    for (const dark of [false, true]) {
      html.classList.toggle("dark", dark);
      const ground = getComputedStyle(surface).backgroundColor;
      for (const badge of canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="badge"]',
      )) {
        const { backgroundColor, color } = getComputedStyle(badge);
        const where = `${badge.dataset.color} ${badge.dataset.size}, ${dark ? "dark" : "light"}`;
        await expect(contrast(backgroundColor, ground), `${where}: fill`).toBeGreaterThanOrEqual(3);
        if (badge.dataset.size === "large")
          await expect(contrast(color, backgroundColor), `${where}: text`).toBeGreaterThanOrEqual(4.5);
      }
    }
  } finally {
    html.classList.toggle("dark", wasDark);
  }
}

/** `color`, which is not Material's: Material draws every badge in `error`,
    the default. The others, each fill with its own `on-` role for the text,
    are for a project whose colours mean something of their own. */
export const Colors: Story = {
  render: () => (
    <div data-surface className="bg-surface inline-grid grid-cols-[auto_repeat(3,3rem)] items-center gap-x-6 gap-y-4 p-4">
      {COLORS.map((color) => (
        <React.Fragment key={color}>
          <Label component="span" size="medium" colorRole="on-surface-variant">
            {color}
          </Label>
          <OnIcon color={color} />
          <OnIcon value={3} color={color} />
          <OnIcon value={1200} color={color} />
        </React.Fragment>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badges = canvasElement.querySelectorAll<HTMLElement>('[data-slot="badge"]');
    await expect(badges.length).toBe(12);
    await expectBadgesContrast(canvasElement);
  },
};

/** "Primary", as a destination's label. */
const titled = (color: string) => color.charAt(0).toUpperCase() + color.slice(1);

const colored = COLORS.flatMap((color) => [
  {
    id: `${color}-count`,
    label: titled(color),
    icon: Mail,
    badge: 3,
    badgeColor: color,
  },
  {
    id: `${color}-dot`,
    label: "Dot",
    ariaLabel: `${color} dot`,
    icon: Bell,
    badge: true as const,
    badgeColor: color,
  },
]);

/** A destination's `badgeColor` on the rail: on the icon collapsed, after
    the label expanded, the dot on the icon in both. */
export const ColorsOnNavigationRail: Story = {
  render: () => (
    <div data-surface className="bg-surface flex h-[600px] gap-6">
      <NavigationRail items={colored} aria-label="Collapsed" />
      <NavigationRail items={colored} isExpanded aria-label="Expanded" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const rail of ["Collapsed", "Expanded"]) {
      const nav = within(canvas.getByRole("navigation", { name: rail }));
      for (const color of COLORS) {
        const name = `${titled(color)}, 3`;
        const count = nav.getByRole("button", { name });
        const dot = nav.getByRole("button", { name: `${color} dot, New notification` });
        for (const [destination, size] of [[count, "large"], [dot, "small"]] as const) {
          const badge = destination.querySelector<HTMLElement>('[data-slot="badge"]')!;
          await expect(badge).toHaveAttribute("data-color", color);
          await expect(badge).toHaveAttribute("data-size", size);
        }
      }
    }
    await expectBadgesContrast(canvasElement);
  },
};
