import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, MoreVertical, Search, Settings } from "lucide-react";
import React from "react";

import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { TopAppBar } from "@french-tech-homies/design-system/components/TopAppBar";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The top app bar — a leading navigation action, the screen's title, and the
 * actions that belong to that screen.
 *
 * Four types, all four from the spec's baseline set: `small` and
 * `center-aligned` at 64dp with a `title-large` title on the action row, and
 * `medium` (112dp, `headline-small`) and `large` (152dp, `headline-medium`)
 * with the title on its own row underneath. The title is a real heading —
 * `headingLevel` defaults to 1, since an app bar's title is usually the page's
 * own — so it lands in a screen reader's heading list.
 *
 * Presentational and server-safe: the interactive parts arrive through
 * `leading` and `actions` as `IconButton`s, which bring their own client
 * boundary.
 *
 * **No on-scroll behaviour.** MD3's bar changes elevation and collapses as
 * content scrolls under it; that needs a scroll container the kit does not
 * own, so it is left out rather than half-implemented. An app that wants the
 * collapse drives `variant` from its own scroll state.
 */
const meta = {
  title: "MD3/Navigation/TopAppBar",
  component: TopAppBar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["small", "center-aligned", "medium", "large"],
    },
    headingLevel: { control: { type: "range", min: 1, max: 6, step: 1 } },
  },
  args: { title: "Tables & QR" },
} satisfies Meta<typeof TopAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const leading = (
  <IconButton
    variant="standard"
    icon={ArrowLeft}
    aria-label="Back to the venue"
  />
);
const actions = (
  <>
    <IconButton variant="standard" icon={Search} aria-label="Search tables" />
    <IconButton
      variant="standard"
      icon={MoreVertical}
      aria-label="More options"
    />
  </>
);

/** The default: 64dp, title beside the actions. */
export const Small: Story = {
  args: { leading, actions },
  render: (args) => (
    <div className="bg-surface-container-lowest">
      <TopAppBar {...args} />
      <Body size="medium" className="p-4">
        The bar sits at the top of the screen it titles.
      </Body>
    </div>
  ),
};

/** One icon each side, so the title lands in the middle. */
export const CenterAligned: Story = {
  args: {
    variant: "center-aligned",
    title: "Acme",
    leading: (
      <IconButton variant="standard" icon={ArrowLeft} aria-label="Back" />
    ),
    actions: (
      <IconButton variant="standard" icon={Settings} aria-label="Settings" />
    ),
  },
};

/** 112dp, `headline-small`, title on its own row. */
export const Medium: Story = {
  args: { variant: "medium", leading, actions },
};

/** 152dp, `headline-medium` — for a screen whose name is the point. */
export const Large: Story = {
  args: {
    variant: "large",
    title: "Orders history",
    leading,
    actions,
  },
};

/** A subtitle takes the spec's per-size role: `label-medium` on a small bar,
    `label-large` on a medium one, `title-medium` on a large one. */
export const WithSubtitle: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["small", "medium", "large"] as const).map((variant) => (
        // The bar renders a <header>, which is the page's `banner` landmark —
        // and a document may only have one. Nesting each sample in a
        // <section> scopes its header out of that role, which is the same
        // thing an app does when it puts a second bar inside a pane.
        <section key={variant} aria-label={`${variant} app bar`}>
          <TopAppBar
            variant={variant}
            title="Pizzeria Bellini"
            subtitle="12 tables · 3 menus"
            headingLevel={2}
            leading={leading}
            actions={actions}
          />
        </section>
      ))}
    </div>
  ),
};

/** In a shell: the bar over the region it titles. */
export const InAShell: Story = {
  render: () => (
    <div className="bg-surface-container-lowest flex h-96 flex-col">
      <TopAppBar
        title="Tables & QR"
        subtitle="Pizzeria Bellini"
        leading={
          <IconButton variant="standard" icon={ArrowLeft} aria-label="Back" />
        }
        actions={actions}
      />
      <div className="bg-surface-container m-4 flex-1 rounded-shape-large p-4">
        <Body size="medium">The content the bar titles scrolls here.</Body>
      </div>
    </div>
  ),
};
