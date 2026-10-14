import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Clock, CopyIcon, Folder, Heart, Music, Plus } from "lucide-react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import ButtonGroup from "@french-tech-homies/design-system/components/ButtonGroup";
import FabMenu from "@french-tech-homies/design-system/components/FabMenu";
import {
  Segment,
  SegmentedButton,
} from "@french-tech-homies/design-system/components/SegmentedButton";
import SplitButton from "@french-tech-homies/design-system/components/SplitButton";

import Card from "@french-tech-homies/design-system/components/Card";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@french-tech-homies/design-system/components/Table";

/**
 * Behaviour tests for the action components. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Actions",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const onPress = fn();

/**
 * Material's keyboard table: Tab lands on an enabled icon button and skips a
 * disabled one, Enter and Space each activate it, Space flips a toggle, and
 * a button with `href` is a link Tab reaches.
 */
export const IconButtonKeyboard: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton
        variant="standard"
        icon={Plus}
        aria-label="Add"
        onPress={onPress}
      />
      <IconButton
        variant="standard"
        icon={Plus}
        aria-label="Add, disabled"
        isDisabled
      />
      <IconButton
        variant="standard"
        isToggle
        icon={Heart}
        aria-label="Favorite"
      />
      <IconButton
        variant="standard"
        icon={Plus}
        aria-label="Open"
        href="#open"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onPress.mockClear();

    const add = canvas.getByRole("button", { name: "Add" });
    await userEvent.tab();
    await expect(add).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onPress).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    await expect(onPress).toHaveBeenCalledTimes(2);

    // The disabled button is passed over.
    const favorite = canvas.getByRole("button", { name: "Favorite" });
    await userEvent.tab();
    await expect(favorite).toHaveFocus();
    await expect(favorite).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(favorite).toHaveAttribute("aria-pressed", "true"),
    );

    const open = canvas.getByRole("link", { name: "Open" });
    await userEvent.tab();
    await expect(open).toHaveFocus();
    await expect(open).toHaveAttribute("href", "#open");
  },
};

const sizes = [
  { size: "xsmall", box: 32, icon: 20, outline: 1 },
  { size: "small", box: 40, icon: 24, outline: 1 },
  { size: "medium", box: 56, icon: 24, outline: 1 },
  { size: "large", box: 96, icon: 32, outline: 2 },
  { size: "xlarge", box: 136, icon: 40, outline: 3 },
] as const;

/**
 * Each size draws Material's container, icon and outline
 * (`md.comp.icon-button.<size>.container.height`, `.icon.size`,
 * `.outlined.outline.width`), and a button that says no size is `small`.
 */
export const IconButtonSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {sizes.map(({ size }) => (
        <IconButton
          key={size}
          variant="outlined"
          size={size}
          icon={Plus}
          aria-label={`Add, ${size}`}
        />
      ))}
      <IconButton variant="standard" icon={Plus} aria-label="Add, no size" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const measure = (name: string) => {
      const button = canvas.getByRole("button", { name });
      const box = button.getBoundingClientRect();
      const icon = button.querySelector("svg")!.getBoundingClientRect();
      return {
        button,
        box: [box.width, box.height],
        icon: [icon.width, icon.height],
        outline: getComputedStyle(button).borderTopWidth,
      };
    };

    for (const { size, box, icon, outline } of sizes) {
      const drawn = measure(`Add, ${size}`);
      await expect(drawn.box).toEqual([box, box]);
      await expect(drawn.icon).toEqual([icon, icon]);
      await expect(drawn.outline).toBe(`${outline}px`);
      await expect(drawn.button).toHaveAttribute("data-size", size);
    }

    const unsized = measure("Add, no size");
    await expect(unsized.box).toEqual([40, 40]);
    await expect(unsized.icon).toEqual([24, 24]);
    await expect(unsized.button).toHaveAttribute("data-size", "small");

    // Keyboard: every size is a stop, in order.
    await userEvent.tab();
    await expect(measure("Add, xsmall").button).toHaveFocus();
  },
};

function ControlledToggle() {
  // The parent holds the state and does not change it: a controlled toggle
  // must then stay as it is told.
  const [isSelected] = useState(true);
  return (
    <IconButton
      variant="standard"
      isToggle
      isSelected={isSelected}
      onChange={() => undefined}
      icon={Heart}
      aria-label="Favorite, held"
    />
  );
}

/**
 * A button or a toggle that names no colour style is filled, Material's
 * default. Filled
 * and tonal draw Material's container with nothing more said, the
 * outline is `outline-variant`, and a toggle's `isSelected` is its parent's
 * to hold. The colours are compared with probes drawn by the same theme, so
 * the test holds under any preset.
 */
export const IconButtonColorStyles: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={Plus} aria-label="Add, no colour style" />
      <IconButton
        isToggle
        icon={Heart}
        aria-label="Favorite, no colour style"
      />
      <IconButton variant="filled" icon={Plus} aria-label="Add, filled" />
      <IconButton variant="tonal" icon={Plus} aria-label="Add, tonal" />
      <IconButton variant="outlined" icon={Plus} aria-label="Add, outlined" />
      <ControlledToggle />
      <span data-probe="primary" className="bg-primary size-4" />
      <span data-probe="on-primary" className="text-on-primary size-4" />
      <span
        data-probe="surface-container"
        className="bg-surface-container size-4"
      />
      <span
        data-probe="secondary-container"
        className="bg-secondary-container size-4"
      />
      <span
        data-probe="outline-variant"
        className="border-outline-variant size-4 border"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const probe = (name: string) =>
      getComputedStyle(canvasElement.querySelector(`[data-probe="${name}"]`)!);
    const button = (name: string) => canvas.getByRole("button", { name });

    // With no colour style said, the button is Material's default: filled.
    const unsaid = button("Add, no colour style");
    await expect(unsaid).toHaveAttribute("data-variant", "filled");
    await expect(getComputedStyle(unsaid).backgroundColor).toBe(
      probe("primary").backgroundColor,
    );
    await expect(
      getComputedStyle(unsaid.querySelector('[data-slot="icon-button-icon"]')!)
        .color,
    ).toBe(probe("on-primary").color);

    // A toggle's default is its own: filled too, and while it is not
    // selected Material's filled toggle stands on `surface-container`.
    const unsaidToggle = button("Favorite, no colour style");
    await expect(unsaidToggle).toHaveAttribute("data-variant", "filled");
    await expect(unsaidToggle).toHaveAttribute("aria-pressed", "false");
    await expect(getComputedStyle(unsaidToggle).backgroundColor).toBe(
      probe("surface-container").backgroundColor,
    );

    await expect(getComputedStyle(button("Add, filled")).backgroundColor).toBe(
      probe("primary").backgroundColor,
    );
    await expect(getComputedStyle(button("Add, tonal")).backgroundColor).toBe(
      probe("secondary-container").backgroundColor,
    );
    await expect(getComputedStyle(button("Add, outlined")).borderTopColor).toBe(
      probe("outline-variant").borderTopColor,
    );
    await expect(button("Add, tonal")).toHaveAttribute("data-variant", "tonal");

    // Keyboard: Space on the held toggle asks, and the parent's answer stays.
    const held = button("Favorite, held");
    await expect(held).toHaveAttribute("aria-pressed", "true");
    held.focus();
    await userEvent.keyboard(" ");
    await expect(held).toHaveAttribute("aria-pressed", "true");
  },
};

const rows = [{ id: "a-1" }, { id: "a-2" }, { id: "a-3" }];

/**
 * An `xsmall` button draws 32px and answers over Material's 48px. In a dense
 * row of 40px the rows' targets overlap and the later row's answers in the
 * overlap, so the middle row's button still answers 6px to either side and
 * 6px above its drawn edge: over at least 48 by 40.
 */
export const IconButtonTargetInDenseRow: Story = {
  render: () => (
    <Card variant="outlined" className="w-[320px]">
      <Table aria-label="Codes" density="dense">
        <TableHeader>
          <Column id="id" isRowHeader>
            Code
          </Column>
          <Column id="copy" align="center">
            Copy
          </Column>
        </TableHeader>
        <TableBody items={rows}>
          {(row) => (
            <Row id={row.id}>
              <Cell>{row.id}</Cell>
              <Cell>
                <IconButton
                  variant="standard"
                  size="xsmall"
                  icon={CopyIcon}
                  aria-label={`Copy ${row.id}`}
                  onPress={onPress}
                />
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onPress.mockClear();
    const button = canvas.getByRole("button", { name: "Copy a-2" });
    const row = button.closest("tr")!;
    const r = button.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const answers = (x: number, y: number) =>
      button.contains(document.elementFromPoint(x, y));

    await expect([r.width, r.height]).toEqual([32, 32]);
    await expect(
      Math.abs(row.getBoundingClientRect().height - 40),
    ).toBeLessThanOrEqual(1);

    await expect(answers(r.left - 6, cy)).toBe(true);
    await expect(answers(r.right + 6, cy)).toBe(true);
    await expect(answers(cx, r.top - 6)).toBe(true);

    // The extent that answers, walked a pixel at a time from the centre.
    const reach = (dx: number, dy: number) => {
      let n = 0;
      while (n < 64 && answers(cx + dx * (n + 1), cy + dy * (n + 1))) n++;
      return n;
    };
    await expect(reach(-1, 0) + reach(1, 0) + 1).toBeGreaterThanOrEqual(48);
    await expect(reach(0, -1) + reach(0, 1) + 1).toBeGreaterThanOrEqual(40);

    // Keyboard: Tab into the table, down to the row, across to its button.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(button).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(onPress).toHaveBeenCalledTimes(1);
  },
};

/**
 * The icon is a named part: it exists under its `data-slot` and takes the
 * class given through `classNames`; the root takes `className`.
 */
export const IconButtonPartClasses: Story = {
  render: () => (
    <IconButton
      variant="tonal"
      size="medium"
      icon={Heart}
      aria-label="Favorite"
      className="h-12 w-12"
      classNames={{ icon: "text-primary" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="icon-button"]',
    )!;
    const icon = root.querySelector<HTMLElement>(
      '[data-slot="icon-button-icon"]',
    )!;

    await expect(root).toHaveAttribute("data-size", "medium");
    await expect(root).toHaveAttribute("data-variant", "tonal");
    // The caller's size wins over the variant's.
    await expect(root).toHaveClass("h-12", "w-12");
    await expect(root).not.toHaveClass("h-14");
    await expect(root.getBoundingClientRect().height).toBe(48);
    await expect(icon).toHaveClass("text-primary");
    await expect(icon).not.toHaveClass("text-on-secondary-container");
    await expect(icon.querySelector("svg")).not.toBeNull();

    // Keyboard: it is still a stop.
    await userEvent.tab();
    await expect(root).toHaveFocus();
  },
};

const buttonHeights = [
  { size: "xsmall", height: 32 },
  { size: "small", height: 40 },
  { size: "medium", height: 56 },
  { size: "large", height: 96 },
  { size: "xlarge", height: 136 },
] as const;

/**
 * Each size is Material's height (`md.comp.button.<size>.container.height`),
 * a button that says no size is `small`, and a FAB that says none is 56.
 */
export const ButtonSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {buttonHeights.map(({ size }) => (
        <Button key={size} size={size}>
          {`Add, ${size}`}
        </Button>
      ))}
      <Button>Add, no size</Button>
      <Button variant="fab" icon={Plus} aria-label="Add, FAB" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const height = (name: string) =>
      canvas.getByRole("button", { name }).getBoundingClientRect().height;
    for (const { size, height: expected } of buttonHeights) {
      await expect(height(`Add, ${size}`)).toBe(expected);
    }
    await expect(height("Add, no size")).toBe(40);
    await expect(height("Add, FAB")).toBe(56);
  },
};

/**
 * A toggle `Button`: Tab reaches it, Space and Enter flip `aria-pressed`,
 * and its corners change when it is selected (round to square). A disabled
 * toggle is passed over.
 */
export const ButtonToggleKeyboard: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button isToggle variant="outlined">
        Follow
      </Button>
      <Button isToggle isDisabled>
        Disabled
      </Button>
      <Button>After</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const follow = canvas.getByRole("button", { name: "Follow" });
    await userEvent.tab();
    await expect(follow).toHaveFocus();
    await expect(follow).toHaveAttribute("aria-pressed", "false");
    // Round, then, selected, the theme's `medium` corner (whatever a preset
    // makes of the two).
    const corner = (step: string) =>
      getComputedStyle(follow)
        .getPropertyValue(`--md-sys-shape-corner-${step}`)
        .trim();
    const radius = () => getComputedStyle(follow).borderTopLeftRadius;
    await waitFor(() => expect(radius()).toBe(corner("full")));

    await userEvent.keyboard(" ");
    await expect(follow).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(radius()).toBe(corner("medium")));
    await userEvent.keyboard("{Enter}");
    await expect(follow).toHaveAttribute("aria-pressed", "false");

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
  },
};

const groupPress = fn();

/**
 * Material's keyboard table for a standard group: the container takes no
 * focus, Tab lands on the first button, the arrow keys move between buttons,
 * Enter activates one, and the next Tab leaves the group.
 */
export const ButtonGroupArrowKeys: Story = {
  render: () => (
    <div className="flex gap-4">
      <ButtonGroup aria-label="Edit">
        <Button onPress={groupPress}>Cut</Button>
        <Button>Copy</Button>
        <Button>Paste</Button>
      </ButtonGroup>
      <Button variant="text">After</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    groupPress.mockClear();
    await expect(canvas.getByRole("toolbar", { name: "Edit" })).toBeVisible();
    const cut = canvas.getByRole("button", { name: "Cut" });
    const copy = canvas.getByRole("button", { name: "Copy" });

    await userEvent.tab();
    await expect(cut).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(copy).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(cut).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(groupPress).toHaveBeenCalledTimes(1);

    // React Aria's toolbar answers Tab by moving focus to its last button
    // and letting the browser's Tab go on from there; user-event computes
    // its Tab before that, so the exit is tested from the last button.
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Paste" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
  },
};

/**
 * A connected single-select group is a `radiogroup`: the arrow keys move,
 * Space selects, and one button is selected at a time.
 */
export const ButtonGroupConnectedSingleSelect: Story = {
  render: () => (
    <div className="w-96">
      <ButtonGroup variant="connected" selectionMode="single" aria-label="Range">
        <Button isToggle id="day">
          Day
        </Button>
        <Button isToggle id="week">
          Week
        </Button>
        <Button isToggle id="month">
          Month
        </Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radiogroup", { name: "Range" })).toBeVisible();
    const day = canvas.getByRole("radio", { name: "Day" });
    const week = canvas.getByRole("radio", { name: "Week" });

    await userEvent.tab();
    await expect(day).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(day).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(week).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(week).toHaveAttribute("aria-checked", "true");
    await expect(day).toHaveAttribute("aria-checked", "false");
    // The connected buttons share the group's width.
    const widths = canvas
      .getAllByRole("radio")
      .map((radio) => Math.round(radio.getBoundingClientRect().width));
    await expect(new Set(widths).size).toBe(1);
  },
};

/**
 * A connected multi-select group: each button carries `aria-pressed`, and
 * several can be selected, then cleared.
 */
export const ButtonGroupConnectedMultiSelect: Story = {
  render: () => (
    <div className="w-96">
      <ButtonGroup variant="connected" selectionMode="multiple" aria-label="Days">
        <Button isToggle id="mon">
          Mon
        </Button>
        <Button isToggle id="tue">
          Tue
        </Button>
        <Button isToggle id="wed">
          Wed
        </Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mon = canvas.getByRole("button", { name: "Mon" });
    const tue = canvas.getByRole("button", { name: "Tue" });

    await userEvent.tab();
    await expect(mon).toHaveFocus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowRight}");
    await expect(tue).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(mon).toHaveAttribute("aria-pressed", "true");
    await expect(tue).toHaveAttribute("aria-pressed", "true");

    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard(" ");
    await expect(mon).toHaveAttribute("aria-pressed", "false");
    await expect(tue).toHaveAttribute("aria-pressed", "false");
  },
};

/**
 * A single-select segmented button is a `radiogroup`: Tab lands on the first
 * segment, the arrow keys move, Space and Enter
 * select, and the selected segment shows its check.
 */
export const SegmentedButtonSingleSelect: Story = {
  render: () => (
    <SegmentedButton aria-label="Sort by" className="w-96">
      <Segment id="relevance">Relevance</Segment>
      <Segment id="date">Date</Segment>
      <Segment id="price">Price</Segment>
    </SegmentedButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radiogroup", { name: "Sort by" })).toBeVisible();
    const relevance = canvas.getByRole("radio", { name: "Relevance" });
    const date = canvas.getByRole("radio", { name: "Date" });
    const check = (segment: HTMLElement) =>
      segment.querySelector('[data-slot="segment-icon"]');

    await userEvent.tab();
    await expect(relevance).toHaveFocus();
    await expect(check(relevance)).toBeNull();
    await userEvent.keyboard(" ");
    await expect(relevance).toHaveAttribute("aria-checked", "true");
    await expect(check(relevance)).not.toBeNull();

    await userEvent.keyboard("{ArrowRight}");
    await expect(date).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(date).toHaveAttribute("aria-checked", "true");
    await expect(relevance).toHaveAttribute("aria-checked", "false");
    await expect(check(relevance)).toBeNull();
    await expect(check(date)).not.toBeNull();
  },
};

/**
 * Material: "the first segment will be focused regardless of selection
 * state". Tab lands on the first segment though another is selected.
 */
export const SegmentedButtonFocusStartsOnFirst: Story = {
  render: () => (
    <SegmentedButton aria-label="Show" defaultSelectedKeys={["week"]} className="w-96">
      <Segment id="day">Day</Segment>
      <Segment id="week">Week</Segment>
    </SegmentedButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Day" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "Week" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  },
};

/**
 * A multi-select segmented button: each segment carries `aria-pressed`, and
 * its check shows and hides with it, in place of its icon.
 */
export const SegmentedButtonMultiSelect: Story = {
  render: () => (
    <SegmentedButton aria-label="Genres" selectionMode="multiple" className="w-96">
      <Segment id="music" icon={Music}>
        Music
      </Segment>
      <Segment id="folders" icon={Folder}>
        Folders
      </Segment>
    </SegmentedButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const music = canvas.getByRole("button", { name: "Music" });
    const folders = canvas.getByRole("button", { name: "Folders" });
    const iconPath = (segment: HTMLElement) =>
      segment.querySelector('[data-slot="segment-icon"] svg')!.innerHTML;
    const musicIcon = iconPath(music);

    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(music).toHaveAttribute("aria-pressed", "true");
    await expect(iconPath(music)).not.toBe(musicIcon);
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard(" ");
    await expect(folders).toHaveAttribute("aria-pressed", "true");
    await expect(music).toHaveAttribute("aria-pressed", "true");

    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{Enter}");
    await expect(music).toHaveAttribute("aria-pressed", "false");
    await expect(iconPath(music)).toBe(musicIcon);
  },
};

const watch = fn();
const later = fn();

/**
 * Material's keyboard table for a split button: Tab reaches the leading
 * button, then the trailing one, which has its own name and
 * `aria-expanded`. Enter on the leading button acts; Enter on the trailing
 * one opens the menu, and Escape closes it with focus back on the trailing
 * button.
 */
export const SplitButtonKeyboard: Story = {
  render: () => (
    <div className="h-64">
      <SplitButton
        icon={Clock}
        onPress={watch}
        menuLabel="More watch options"
        items={[
          { id: "later", label: "Watch later", onAction: later },
          { id: "share", label: "Share" },
        ]}
      >
        Watch
      </SplitButton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    watch.mockClear();
    later.mockClear();
    const leading = canvas.getByRole("button", { name: "Watch" });
    const trailing = canvas.getByRole("button", { name: "More watch options" });

    await userEvent.tab();
    await expect(leading).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(watch).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    await expect(trailing).toHaveFocus();
    await expect(trailing).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    await expect(trailing).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    await expect(trailing).toHaveFocus();
    await expect(trailing).toHaveAttribute("aria-expanded", "false");

    // An item acts from the keyboard.
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Watch later" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await expect(later).toHaveBeenCalledTimes(1);
  },
};

const playlist = fn();

/**
 * Material's FAB menu, as a disclosure of buttons: the FAB is named for its
 * menu and says `aria-expanded`; opening it keeps focus on it; Tab moves
 * through the items, buttons, from the top; Enter on an item acts and
 * closes the menu; Escape closes it with focus on the FAB.
 */
export const FabMenuKeyboard: Story = {
  render: () => (
    <div className="flex h-96 items-end justify-end">
      <FabMenu
        aria-label="Create"
        icon={Plus}
        items={[
          { id: "playlist", label: "Playlist", icon: Music, onAction: playlist },
          { id: "folder", label: "Folder", icon: Folder },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    playlist.mockClear();
    const fab = canvas.getByRole("button", { name: "Create" });
    await expect(fab).toHaveAttribute("aria-expanded", "false");

    await userEvent.tab();
    await expect(fab).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(fab).toHaveAttribute("aria-expanded", "true");
    await expect(fab).toHaveFocus();
    await expect(canvas.queryAllByRole("menuitem")).toHaveLength(0);

    await userEvent.tab();
    const first = canvas.getByRole("button", { name: "Playlist" });
    await expect(first).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Folder" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expect(fab).toHaveAttribute("aria-expanded", "false");
    await expect(fab).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: "Playlist" })).toBeNull();

    await userEvent.keyboard(" ");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(playlist).toHaveBeenCalledTimes(1);
    await expect(fab).toHaveAttribute("aria-expanded", "false");
    await expect(fab).toHaveFocus();
  },
};
