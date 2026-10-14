import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Inbox, Mail, MessageSquare, Users, Video } from "lucide-react";
import React from "react";

import { Badge } from "@french-tech-homies/design-system/components/Badge";
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
function OnIcon({ value }: { value?: number | string }) {
  return (
    <span className="relative inline-flex text-on-surface-variant">
      <Inbox size={24} aria-hidden />
      <Badge value={value} anchored />
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
