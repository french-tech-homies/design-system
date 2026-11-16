import type { Meta, StoryObj } from "@storybook/react-vite";
import { Folder, History, Music, Plus } from "lucide-react";
import React from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import {
  ComboBox,
  ComboBoxItem,
} from "@french-tech-homies/design-system/components/ComboBox";
import FabMenu from "@french-tech-homies/design-system/components/FabMenu";
import { Menu } from "@french-tech-homies/design-system/components/Menu";
import { PhoneField } from "@french-tech-homies/design-system/components/PhoneField";
import {
  Popover,
  PopoverTrigger,
} from "@french-tech-homies/design-system/components/Popover";
import {
  SearchView,
  SearchViewItem,
} from "@french-tech-homies/design-system/components/Search";
import {
  Select,
  SelectItem,
} from "@french-tech-homies/design-system/components/Select";

import { expectVisibleFocus } from "./visible-focus";

/**
 * What exists only while something is open shows the keyboard's focus.
 *
 * Every story's tab stops are walked after it has played
 * (`.storybook/focus.setup.ts`), but a menu's rows and a select's options are
 * not there when a story rests. Each test here opens one by the keyboard,
 * moves onto a row and asks that the row be drawn differently while it holds
 * the focus (`visible-focus.ts`). A `Menu` whose rows showed nothing under
 * the arrow keys passed every other check the kit had.
 */
const meta = {
  title: "MD3/Interactions/Focus",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const arrowDown = () => userEvent.keyboard("{ArrowDown}");
const focused = () => document.activeElement as HTMLElement;

const sizes = [
  { id: "s", name: "Small" },
  { id: "m", name: "Medium" },
  { id: "l", name: "Large" },
];

/** A menu's row, reached by the arrow keys. */
export const MenuRow: Story = {
  render: () => (
    <Menu
      triggerButton={<Button variant="outlined">Open menu</Button>}
      items={[
        { id: "edit", label: "Edit" },
        { id: "copy", label: "Duplicate" },
        { id: "delete", label: "Delete" },
      ]}
    />
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    const first = within(menu).getByRole("menuitem", { name: "Edit" });
    await waitFor(() => expect(first).toHaveFocus());

    await expectVisibleFocus(first, arrowDown);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};

/** A select's option, reached by the arrow keys. */
export const SelectOption: Story = {
  render: () => (
    <Select label="Size" items={sizes} className="w-72">
      {(item: (typeof sizes)[number]) => (
        <SelectItem id={item.id} label={item.name} />
      )}
    </Select>
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    await waitFor(() => expect(listbox.contains(focused())).toBe(true));
    await waitFor(() => expect(focused().getAttribute("role")).toBe("option"));

    await expectVisibleFocus(focused(), arrowDown);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

/** A combo box's option: the caret stays in the field, and the option the
    arrows are on is the one drawn as focused. */
export const ComboBoxOption: Story = {
  render: () => (
    <ComboBox label="Size" items={sizes} className="w-72">
      {(item: (typeof sizes)[number]) => (
        <ComboBoxItem id={item.id} label={item.name} />
      )}
    </ComboBox>
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const small = await screen.findByRole("option", { name: "Small" });
    await waitFor(() => expect(small).toHaveAttribute("data-focused", "true"));

    await expectVisibleFocus(small, arrowDown);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

/** A country of the phone field's list. */
export const PhoneFieldCountry: Story = {
  render: () => (
    <PhoneField label="Phone" defaultCountry="FR" className="w-80" />
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    await waitFor(() => expect(listbox.contains(focused())).toBe(true));
    await waitFor(() => expect(focused().getAttribute("role")).toBe("option"));

    await expectVisibleFocus(focused(), arrowDown);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
};

/** A result of the search view: the caret stays in the field. */
export const SearchViewResult: Story = {
  render: () => (
    <SearchView placeholder="Search the garden shop" layout="docked">
      {["Plants", "Planters", "Pruning shears"].map((name) => (
        <SearchViewItem
          key={name}
          id={name}
          label={name}
          leadingIcon={History}
        />
      ))}
    </SearchView>
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByRole("searchbox")).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowDown}");
    const plants = within(dialog).getByRole("option", { name: "Plants" });
    await waitFor(() => expect(plants).toHaveAttribute("data-focused", "true"));

    await expectVisibleFocus(plants, arrowDown);

    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

/** An item of the FAB menu, reached by Tab once the menu is open. */
export const FabMenuItem: Story = {
  render: () => (
    <div className="flex h-96 items-end justify-end">
      <FabMenu
        aria-label="Create"
        icon={Plus}
        items={[
          { id: "playlist", label: "Playlist", icon: Music },
          { id: "folder", label: "Folder", icon: Folder },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    const first = canvas.getByRole("button", { name: "Playlist" });
    await expect(first).toHaveFocus();

    await expectVisibleFocus(first, () => userEvent.tab());

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "Playlist" })).toBeNull(),
    );
  },
};

/** A control inside an open popover. */
export const PopoverControl: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="outlined">Rename</Button>
      <Popover aria-label="Rename the file">
        <div className="flex gap-2">
          <Button variant="text">Cancel</Button>
          <Button variant="filled">Rename</Button>
        </div>
      </Popover>
    </PopoverTrigger>
  ),
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog");
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(dialog.contains(focused())).toBe(true));
    if (focused() !== cancel) await userEvent.tab();
    await waitFor(() => expect(cancel).toHaveFocus());

    await expectVisibleFocus(cancel, () => userEvent.tab());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};
