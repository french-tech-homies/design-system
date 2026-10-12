import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AreaChart,
  LayoutGrid,
  Menu as MenuIcon,
  Plus,
  RadioTower,
  ShoppingBasket,
  Utensils,
} from "lucide-react";
import React from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { NavigationRail } from "@french-tech-homies/design-system/components/NavigationRail";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The vertical destination list a medium or expanded window carries down its
 * leading edge, in the spec's two states.
 *
 * **Collapsed** is 96dp (80dp with `isNarrow`) with vertical items: a 56×32
 * pill behind a 24dp icon, the label under it, in a 64dp row. **Expanded** is
 * 220dp with the items turned horizontal — icon then label inside a full-width
 * 56dp pill. Both are one component because they are one component in the
 * spec, and because an app whose reader can collapse the rail needs the
 * transition between them.
 *
 * It is a `<nav>` of links or buttons with `aria-current="page"` on the active
 * one, **not** a tab set: a rail navigates rather than swapping a panel, so
 * Tab moves between destinations and the arrow keys are not bound.
 */
const meta = {
  title: "MD3/Navigation/NavigationRail",
  component: NavigationRail,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    isExpanded: { control: "boolean" },
    isNarrow: { control: "boolean" },
  },
} satisfies Meta<typeof NavigationRail>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: "live", label: "Orders", icon: RadioTower },
  { id: "history", label: "History", icon: ShoppingBasket },
  { id: "menus", label: "Menus", icon: Utensils },
  { id: "tables", label: "Tables", icon: LayoutGrid },
  { id: "stats", label: "Analytics", icon: AreaChart },
];

const frame = (children: React.ReactNode) => (
  <div className="bg-surface-container-lowest flex h-96">
    {children}
    <div className="bg-surface-container m-4 flex-1 rounded-shape-large p-4">
      <Body size="medium">The rail sits on the leading edge of the pane.</Body>
    </div>
  </div>
);

/** Collapsed, the default: 96dp, icon over label. */
export const Collapsed: Story = {
  args: { items, defaultSelectedKey: "live" },
  render: (args) => frame(<NavigationRail {...args} />),
};

/** Expanded: 220dp, icon beside label inside a full-width pill. */
export const Expanded: Story = {
  args: { items, defaultSelectedKey: "menus", isExpanded: true },
  render: (args) => frame(<NavigationRail {...args} />),
};

/** `isNarrow` takes the collapsed rail to the spec's 80dp. */
export const Narrow: Story = {
  args: { items, defaultSelectedKey: "tables", isNarrow: true },
  render: (args) => frame(<NavigationRail {...args} />),
};

/**
 * The spec's own configurations put a menu button, a FAB, or both above the
 * destinations — that is what `header` is for. `footer` pins whatever belongs
 * at the bottom.
 */
export const WithHeaderAndFooter: Story = {
  args: {
    items,
    defaultSelectedKey: "live",
    header: (
      <>
        <IconButton
          variant="standard"
          icon={MenuIcon}
          aria-label="Open navigation"
        />
        <Button variant="fab" icon={Plus} aria-label="New order" />
      </>
    ),
    footer: (
      <IconButton
        variant="standard"
        icon={LayoutGrid}
        aria-label="Switch workspace"
      />
    ),
  },
  render: (args) => frame(<NavigationRail {...args} />),
};

/** Both states beside each other — the transition an app animates between. */
export const BothStates: Story = {
  args: { items },
  render: () => (
    // Two navigation landmarks on one page need distinct accessible names,
    // or a screen reader's landmark list has two identical entries.
    <div className="bg-surface-container-lowest flex h-96 gap-4">
      <NavigationRail
        items={items}
        defaultSelectedKey="live"
        aria-label="Collapsed rail"
      />
      <NavigationRail
        items={items}
        defaultSelectedKey="live"
        isExpanded
        aria-label="Expanded rail"
      />
    </div>
  ),
};
