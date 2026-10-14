import type { Meta, StoryObj } from "@storybook/react-vite";
import { History, Menu, Mic, Search as SearchGlyph } from "lucide-react";
import React from "react";

import { Avatar } from "@french-tech-homies/design-system/components/Avatar";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  SearchBar,
  SearchView,
  SearchViewItem,
  SearchViewSection,
} from "@french-tech-homies/design-system/components/Search";
import { TopAppBar } from "@french-tech-homies/design-system/components/TopAppBar";

/**
 * Material 3 search: the **search bar**, React Aria's `SearchField` drawn as
 * a 56dp pill, and the **search view** it opens, where suggestions and
 * results are listed and filtered as one types.
 *
 * The view comes in Material's two layouts, **docked** (over the bar, on a
 * scrim) and **full screen**, and its two styles, **divided** (the baseline,
 * a divider under the header) and **contained** (the expressive one, the
 * results in a container of their own). In a `TopAppBar`, `search` makes the
 * search app bar.
 *
 * The open views are drawn open (`defaultOpen`) to be looked at; their
 * behaviour is tested in `MD3/Interactions/Navigation`.
 */
const meta = {
  title: "MD3/Navigation/Search",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const recent = ["Plants", "Planters", "Plant food", "Pruning shears"];
const suggestions = ["Garden gloves", "Watering can", "Seed trays"];

const results = (
  <>
    <SearchViewSection title="Recent">
      {recent.map((name) => (
        <SearchViewItem key={name} id={name} label={name} leadingIcon={History} />
      ))}
    </SearchViewSection>
    <SearchViewSection title="Suggestions">
      {suggestions.map((name) => (
        <SearchViewItem
          key={name}
          id={name}
          label={name}
          supportingText="In the garden shop"
          leadingIcon={SearchGlyph}
        />
      ))}
    </SearchViewSection>
  </>
);

/** The bar alone: a search icon, the hint, and once there is text, a clear
    button. On its own it is named by its hint. */
export const Bar: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-6 bg-surface p-4">
      <SearchBar placeholder="Search messages" />
      <SearchBar placeholder="Search messages" defaultValue="Peanut" />
      <SearchBar
        placeholder="Search the garden shop"
        leading={<IconButton variant="standard" icon={Menu} aria-label="Open navigation" />}
        trailing={
          <>
            <IconButton variant="standard" icon={Mic} aria-label="Search by voice" />
            <Avatar alt="Ada Lovelace" fallback="AL" size={30} />
          </>
        }
      />
    </div>
  ),
};

/** The closed view: the bar a person opens, showing the hint. */
export const ViewClosed: Story = {
  render: () => (
    <div className="w-[480px] bg-surface p-4">
      <SearchView placeholder="Search the garden shop">{results}</SearchView>
    </div>
  ),
};

const openView = (
  layout: "docked" | "full-screen",
  variant: "divided" | "contained",
) => (
  <div className="h-[560px] w-[480px] bg-surface p-4">
    <SearchView
      placeholder="Search the garden shop"
      layout={layout}
      variant={variant}
      defaultOpen
    >
      {results}
    </SearchView>
  </div>
);

/** Docked and divided (the baseline): one container with extra-large
    corners, a 56dp header and an `outline` divider. */
export const DockedDivided: Story = {
  render: () => openView("docked", "divided"),
};

/** Docked and contained: the header stays a pill, and the results sit in a
    container of their own 2dp below it. */
export const DockedContained: Story = {
  render: () => openView("docked", "contained"),
};

/** Full screen and divided: the whole window, a 72dp header, square. */
export const FullScreenDivided: Story = {
  parameters: { layout: "fullscreen" },
  render: () => openView("full-screen", "divided"),
};

/** Full screen and contained: the pill 12dp from the edges on
    `surface-container-low`. */
export const FullScreenContained: Story = {
  parameters: { layout: "fullscreen" },
  render: () => openView("full-screen", "contained"),
};

/** The search app bar: the search in the title's place, on
    `surface-container` with no shadow; the title stays as a hidden heading. */
export const InTopAppBar: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <TopAppBar
      title="Garden shop"
      leading={<IconButton variant="standard" icon={Menu} aria-label="Open navigation" />}
      search={
        <SearchView
          placeholder="Search the garden shop"
          trailing={<Avatar alt="Ada Lovelace" fallback="AL" size={30} />}
        >
          {results}
        </SearchView>
      }
    />
  ),
};

/** The dark scheme: the bar, and a docked view open under it. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => openView("docked", "divided"),
};
