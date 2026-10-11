import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AreaChart,
  LayoutGrid,
  Megaphone,
  NotepadText,
  QrCode,
  RadioTower,
  ShoppingBasket,
  Star,
  Utensils,
} from "lucide-react";
import React, { useState } from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import { NavigationDrawer } from "@french-tech-homies/design-system/components/NavigationDrawer";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The full-height destination list an expanded window keeps open, or a compact
 * one pulls over its content.
 *
 * **standard** sits inline on `surface` at elevation 0 — the persistent drawer
 * of a wide window, with no scrim and nothing to dismiss. **modal** floats
 * over a scrim on `surface-container-low` at elevation 1, traps focus and
 * closes on Escape or a click outside, through React Aria's `ModalOverlay` +
 * `Modal` + `Dialog`.
 *
 * 360dp wide with 16dp rounded trailing corners, 56dp full-pill active
 * indicators, and a **bold** active label — the spec's prominent weight, so
 * the selection is carried by more than colour. `sections` puts the kit's
 * `Divider` between groups rather than a hand-rolled border.
 */
const meta = {
  title: "MD3/Navigation/NavigationDrawer",
  component: NavigationDrawer,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["standard", "modal"] },
  },
} satisfies Meta<typeof NavigationDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const venue = [
  { id: "live", label: "Orders (live)", icon: RadioTower },
  { id: "history", label: "Orders history", icon: ShoppingBasket },
  { id: "menus", label: "Menus", icon: Utensils },
  { id: "tables", label: "Tables & QR", icon: LayoutGrid },
  { id: "promotions", label: "Promotions", icon: Megaphone },
  { id: "stats", label: "Analytics", icon: AreaChart },
  { id: "activity", label: "Activity", icon: NotepadText },
];

const studio = [
  { id: "codes", label: "Codes", icon: QrCode },
  { id: "plan", label: "Plan & usage", icon: Star },
];

/** Inline, persistent — the wide-window drawer. */
export const Standard: Story = {
  args: { items: venue, defaultSelectedKey: "live" },
  render: (args) => (
    <div className="bg-surface-container-lowest flex h-[32rem]">
      <NavigationDrawer {...args} />
      <div className="bg-surface-container m-4 flex-1 rounded-shape-large p-4">
        <Body size="medium">The drawer stays open beside the content.</Body>
      </div>
    </div>
  ),
};

/** A headline names the workspace the destinations belong to. */
export const WithHeadline: Story = {
  args: {
    items: venue,
    headline: "Pizzeria Bellini",
    defaultSelectedKey: "menus",
  },
  render: (args) => (
    <div className="bg-surface-container-lowest flex h-[32rem]">
      <NavigationDrawer {...args} />
    </div>
  ),
};

/** `sections` groups destinations, with a `Divider` between the groups. */
export const Sections: Story = {
  args: {
    headline: "Acme",
    defaultSelectedKey: "codes",
    sections: [
      { headline: "QR Studio", items: studio },
      { headline: "Pizzeria Bellini", items: venue.slice(0, 4) },
    ],
  },
  render: (args) => (
    <div className="bg-surface-container-lowest flex h-[32rem]">
      <NavigationDrawer {...args} />
    </div>
  ),
};

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-surface-container-lowest flex h-96 items-start p-4">
      <Button variant="outlined" onPress={() => setIsOpen(true)}>
        Open navigation
      </Button>
      <NavigationDrawer
        variant="modal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        headline="Pizzeria Bellini"
        items={venue}
        defaultSelectedKey="live"
      />
    </div>
  );
}

/**
 * Over a scrim, with focus trapped and Escape closing it. Choosing a
 * destination closes it too — a modal drawer that stayed open over the page it
 * just navigated to would be in the way.
 */
export const Modal: Story = {
  args: { items: venue },
  render: () => <ModalHarness />,
};
