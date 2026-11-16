import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import { Link } from "@french-tech-homies/design-system/components/Link";

import { SiteHeader } from "../../blocks/site-header/SiteHeader";

/**
 * A block: `npx shadcn add @ds/site-header-block` copies it into a
 * project's components, where it is the project's to edit. A public page's
 * header, which the kit's Material `TopAppBar` is not.
 */
const meta = {
  title: "MD3/Blocks/SiteHeader",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const links = [
  { id: "features", label: "Features", href: "#features" },
  { id: "pricing", label: "Pricing", href: "#pricing" },
  { id: "customers", label: "Customers", href: "#customers" },
  { id: "help", label: "Help", href: "#help" },
];

const brand = (
  <Link href="#home" color="inherit" underline="hover">
    Tally
  </Link>
);

/** Wide: the links in a row, the action at the end. */
export const Wide: Story = {
  render: () => (
    <SiteHeader
      brand={brand}
      links={links}
      actions={<Button href="#signup">Start free trial</Button>}
    />
  ),
};

/** Narrow: the links fold behind one icon button; the action stays. */
export const Narrow: Story = {
  render: () => (
    <div className="w-[400px]">
      <SiteHeader
        brand={brand}
        links={links}
        actions={<Button href="#signup">Start free trial</Button>}
      />
    </div>
  ),
};

/** With no action. */
export const LinksOnly: Story = {
  render: () => <SiteHeader brand={brand} links={links} />,
};

/** The links are a named landmark, each reached by Tab; the brand comes
    first. */
export const LinksAreALandmark: Story = {
  render: () => <SiteHeader brand={brand} links={links} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Site" });
    await expect(within(nav).getAllByRole("link")).toHaveLength(4);
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Tally" })).toHaveFocus();
    await userEvent.tab();
    await expect(
      within(nav).getByRole("link", { name: "Features" }),
    ).toHaveFocus();
    await expect(
      within(nav).getByRole("link", { name: "Features" }),
    ).toHaveAttribute("href", "#features");
  },
};
