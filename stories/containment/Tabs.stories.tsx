import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Tab, TabList, TabPanel, Tabs } from "@french-tech-homies/design-system/components/Tabs";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";
import {
  ChevronDownIcon,
  GlobeIcon,
  ImageIcon,
  UserIcon,
} from "@french-tech-homies/design-system/icons";

/**
 * Material tabs — one row of destinations over the region they control.
 *
 * `primary` and `secondary` are the spec's own split, not two looks: primary
 * tabs are the only set on a screen; secondary tabs are the second level,
 * placed *below* a primary row, with a quieter indicator and the same
 * function. Measurements are the spec's — 48dp rows (64dp once a tab stacks
 * an icon), a 1dp `surface-variant` divider, a 3dp rounded indicator that hugs
 * its label for primary and a 2dp full-width one for secondary. Avoid more
 * than four fixed tabs; past that the row is cramped and `isScrollable` is the
 * spec's answer.
 */
const meta = {
  title: "MD3/Containment/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
  },
  args: { children: null },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const ranges = [
  { id: "today", label: "Today", body: "42 orders, €618.50." },
  { id: "week", label: "This week", body: "310 orders, €4,120.00." },
  { id: "month", label: "This month", body: "1,204 orders, €17,880.25." },
];

/** The default: one set, label-only, dividing the row into equal sections. */
export const Primary: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <Tabs {...args}>
        <TabList aria-label="Time range">
          {ranges.map((r) => (
            <Tab key={r.id} id={r.id}>
              {r.label}
            </Tab>
          ))}
        </TabList>
        {ranges.map((r) => (
          <TabPanel key={r.id} id={r.id}>
            <Body size="medium">{r.body}</Body>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
};

/** The second level: a quieter 2dp indicator that spans the whole tab, and an
    active label in `on-surface` rather than `primary`. */
export const Secondary: Story = {
  args: { variant: "secondary" },
  render: (args) => (
    <div className="max-w-2xl">
      <Tabs {...args}>
        <TabList aria-label="Breakdown">
          {ranges.map((r) => (
            <Tab key={r.id} id={r.id}>
              {r.label}
            </Tab>
          ))}
        </TabList>
        {ranges.map((r) => (
          <TabPanel key={r.id} id={r.id}>
            <Body size="medium">{r.body}</Body>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
};

/** Secondary tabs are always placed below a primary set — that placement is
    the whole reason the variant exists. */
export const Nested: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Tabs>
        <TabList aria-label="Section">
          <Tab id="sales">Sales</Tab>
          <Tab id="menu">Menu</Tab>
        </TabList>
        <TabPanel id="sales">
          <Tabs variant="secondary">
            <TabList aria-label="Sales breakdown">
              {ranges.map((r) => (
                <Tab key={r.id} id={r.id}>
                  {r.label}
                </Tab>
              ))}
            </TabList>
            {ranges.map((r) => (
              <TabPanel key={r.id} id={r.id}>
                <Body size="medium">{r.body}</Body>
              </TabPanel>
            ))}
          </Tabs>
        </TabPanel>
        <TabPanel id="menu">
          <Body size="medium">Three menus, two of them live.</Body>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

/** An icon over its label takes the row to 64dp; `iconPosition="start"` keeps
    it inline at 48dp. */
export const WithIcons: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-8">
      <Tabs>
        <TabList aria-label="Stacked icons">
          <Tab id="people" icon={UserIcon}>
            Team
          </Tab>
          <Tab id="media" icon={ImageIcon}>
            Media
          </Tab>
          <Tab id="links" icon={GlobeIcon}>
            Links
          </Tab>
        </TabList>
        <TabPanel id="people">
          <Body size="medium">Four members, one invitation pending.</Body>
        </TabPanel>
        <TabPanel id="media">
          <Body size="medium">61 images.</Body>
        </TabPanel>
        <TabPanel id="links">
          <Body size="medium">12 dynamic codes.</Body>
        </TabPanel>
      </Tabs>

      <Tabs variant="secondary">
        <TabList aria-label="Inline icons">
          <Tab id="people2" icon={UserIcon} iconPosition="start">
            Team
          </Tab>
          <Tab id="media2" icon={ImageIcon} iconPosition="start">
            Media
          </Tab>
        </TabList>
        <TabPanel id="people2">
          <Body size="medium">Inline icons keep the 48dp row.</Body>
        </TabPanel>
        <TabPanel id="media2">
          <Body size="medium">61 images.</Body>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

const many = [
  { id: "starters", label: "Starters" },
  { id: "pizza", label: "Pizza & pasta" },
  { id: "mains", label: "Mains from the grill" },
  { id: "sides", label: "Sides" },
  { id: "desserts", label: "Desserts" },
  { id: "wine", label: "Wine by the glass" },
];

/** Past four tabs the row is cramped, so it scrolls instead of dividing. */
export const Scrollable: Story = {
  render: () => (
    <div className="max-w-md">
      <Tabs>
        <TabList aria-label="Menu sections" isScrollable>
          {many.map((m) => (
            <Tab key={m.id} id={m.id}>
              {m.label}
            </Tab>
          ))}
        </TabList>
        {many.map((m) => (
          <TabPanel key={m.id} id={m.id}>
            <Title size="small" component="h3">
              {m.label}
            </Title>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ),
};

/** A disabled destination stays visible and drops to `on-surface/38`. */
export const DisabledTab: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Tabs disabledKeys={["archive"]}>
        <TabList aria-label="Orders">
          <Tab id="live">Live</Tab>
          <Tab id="history">History</Tab>
          <Tab id="archive" icon={ChevronDownIcon} iconPosition="start">
            Archive
          </Tab>
        </TabList>
        <TabPanel id="live">
          <Body size="medium">Three orders in the kitchen.</Body>
        </TabPanel>
        <TabPanel id="history">
          <Body size="medium">Everything served today.</Body>
        </TabPanel>
        <TabPanel id="archive">
          <Body size="medium">Unreachable.</Body>
        </TabPanel>
      </Tabs>
    </div>
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
