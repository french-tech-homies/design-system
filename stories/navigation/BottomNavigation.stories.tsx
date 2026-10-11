import type { Meta, StoryObj } from "@storybook/react-vite";
import { Home, QrCode, ShoppingBasket, Utensils, Users } from "lucide-react";
import React from "react";

import { BottomNavigation } from "@french-tech-homies/design-system/components/BottomNavigation";

/**
 * Material 3 navigation bar: three to five top-level destinations, each an
 * icon, a label and — when active — a pill indicator.
 *
 * It is a `<nav>` around a list of links or buttons with `aria-current="page"`
 * on the active one, not a tab set: a navigation bar takes you to another
 * page rather than swapping a panel in place, so Tab (not the arrow keys)
 * moves between destinations. Items with `href` render as links.
 */
const meta = {
  title: "MD3/Navigation/Bottom navigation",
  component: BottomNavigation,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-surface mx-auto w-[400px]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const three = [
  { id: "home", label: "Home", icon: Home },
  { id: "menus", label: "Menus", icon: Utensils },
  { id: "orders", label: "Orders", icon: ShoppingBasket },
];

/** Material fills the active destination's icon. The kit ships no icons, so
    the filled member of your set travels with the item as `activeIcon`. */
const HomeFilled = ({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2.6 2 11.2h3v10.2h5.2v-6h3.6v6H19V11.2h3z" />
  </svg>
);

export const ThreeDestinations: Story = {
  args: { items: three, defaultSelectedKey: "home" },
};

export const FiveDestinations: Story = {
  args: {
    items: [
      ...three,
      { id: "qr", label: "QR codes", icon: QrCode },
      { id: "users", label: "Users", icon: Users },
    ],
    defaultSelectedKey: "orders",
  },
};

export const AsLinks: Story = {
  args: {
    items: three.map((item) => ({ ...item, href: `#${item.id}` })),
    defaultSelectedKey: "menus",
  },
};

export const FilledActiveIcon: Story = {
  args: {
    items: three.map((item) =>
      item.id === "home" ? { ...item, activeIcon: HomeFilled } : item,
    ),
    defaultSelectedKey: "home",
  },
};
