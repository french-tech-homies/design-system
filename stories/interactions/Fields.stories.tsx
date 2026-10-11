import type { Meta, StoryObj } from "@storybook/react-vite";
import type { UserEvent } from "@vitest/browser-playwright/context";
import React, { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { ComboBox, ComboBoxItem } from "@french-tech-homies/design-system/components/ComboBox";
import { NumberField } from "@french-tech-homies/design-system/components/NumberField";
import { PhoneField } from "@french-tech-homies/design-system/components/PhoneField";
import { Select, SelectItem } from "@french-tech-homies/design-system/components/Select";
import { TextField } from "@french-tech-homies/design-system/components/TextField";

/**
 * Behaviour tests for the text-entry family. Every story here has a `play`
 * function; `npm run test-storybook` runs them in Chromium, and
 * axe runs over the rendered result of each one as well.
 *
 * These live apart from the component stories on purpose: the component
 * stories are the visual catalog (design-sync grades every one of them as an
 * image), and a story whose point is a keystroke has nothing to show.
 * Keyboard paths are what is asserted — a control that only works with a
 * mouse is broken.
 */
const meta = {
  title: "MD3/Interactions/Fields",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tab reaches the input, typing fills it, the counter tracks, maxLength caps. */
export const TextFieldTyping: Story = {
  render: () => (
    <TextField
      label="Display name"
      supportingText="Shown on the storefront"
      showCharacterCount
      maxLength={20}
      className="w-80"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: /display name/i });

    await userEvent.tab();
    await expect(field).toHaveFocus();

    await userEvent.keyboard("Habibiz");
    await expect(field).toHaveValue("Habibiz");
    await expect(
      canvas.getByLabelText(/character count: 7 of 20/i),
    ).toBeInTheDocument();

    await userEvent.keyboard(" restaurant and bar");
    await expect((field as HTMLInputElement).value).toHaveLength(20);
  },
};

/** Invalid swaps the supporting text for the error and marks the input. */
export const TextFieldError: Story = {
  render: () => (
    <TextField
      label="Display name"
      supportingText="Shown on the storefront"
      isInvalid
      errorMessage="A display name is required"
      className="w-80"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("A display name is required")).toBeVisible();
    await expect(canvas.getByText("Shown on the storefront")).not.toBeVisible();
    await expect(
      canvas.getByRole("textbox", { name: /display name/i }),
    ).toHaveAttribute("aria-invalid", "true");
  },
};

/** Resolve a colour role to the computed form `getComputedStyle` reports. */
function roleColor(scope: Element, role: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(--md-sys-color-${role})`;
  scope.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/**
 * Tab focuses the outlined field: its outline thickens to the spec's 3dp in
 * `primary`, drawn inside the container. The container is one line of input
 * text plus 32dp (56dp on the Material type scale) — the 1dp outline is part
 * of that height, not added to it, and the input stays inside the outline.
 */
export const TextFieldFocusOutline: Story = {
  render: () => <TextField label="Display name" className="w-80" />,
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector<HTMLElement>(
      '[data-slot="text-field-container"]',
    )!;
    const input = within(canvasElement).getByRole("textbox");
    const height = parseFloat(getComputedStyle(input).lineHeight) + 32;
    await expect(container.offsetHeight).toBe(height);
    await expect(input.offsetHeight).toBe(height - 2);
    await expect(getComputedStyle(container).outlineStyle).toBe("none");

    await userEvent.tab();
    await expect(input).toHaveFocus();
    const focused = getComputedStyle(container);
    await expect(focused.outlineStyle).toBe("solid");
    await expect(focused.outlineWidth).toBe("3px");
    await expect(focused.outlineOffset).toBe("-3px");
    // Colours transition; wait for them to land.
    const primary = roleColor(canvasElement, "primary");
    await waitFor(() => expect(focused.outlineColor).toBe(primary));
    await expect(container.offsetHeight).toBe(height);
  },
};

/** A focused invalid field stays in `error`: it never falls back to `primary`. */
export const TextFieldErrorStaysErrorOnFocus: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <TextField
        label="Outlined"
        isInvalid
        errorMessage="A display name is required"
      />
      <TextField
        variant="filled"
        label="Filled"
        isInvalid
        errorMessage="A display name is required"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [outlined, filled] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="text-field"]'),
    );
    const error = roleColor(canvasElement, "error");

    await userEvent.tab();
    await expect(outlined!.querySelector("input")).toHaveFocus();
    const box = outlined!.querySelector('[data-slot="text-field-container"]')!;
    // Colours and the indicator's height transition; wait for them to land.
    await waitFor(() => expect(getComputedStyle(box).outlineColor).toBe(error));

    await userEvent.tab();
    await expect(filled!.querySelector("input")).toHaveFocus();
    const indicator = filled!.querySelector('[data-slot="active-indicator"]')!;
    // The 2dp height is where the transition ends, so the colour read after
    // it is the settled one, not the resting `error` it started from.
    await waitFor(() => expect(getComputedStyle(indicator).height).toBe("2px"));
    await expect(getComputedStyle(indicator).backgroundColor).toBe(error);
  },
};

/**
 * An invalid outlined `Select` stays in `error` through the keyboard path:
 * Tab draws the 3dp outline in `error`, Enter opens the menu and the outline
 * and the floated label keep `error` instead of turning `primary`. The
 * trigger is a button, so this is a different set of rules from the text
 * field's `:focus-within`.
 */
export const SelectErrorStaysErrorOnFocusAndOpen: Story = {
  render: () => (
    <Select
      label="Category"
      isInvalid
      errorMessage="Pick a category"
      className="w-80"
    >
      <SelectItem id="starters" label="Starters" />
      <SelectItem id="mains" label="Mains" />
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )!;
    const label = canvasElement.querySelector('[data-slot="label"]')!;
    const error = roleColor(canvasElement, "error");
    const outline = getComputedStyle(trigger);

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(outline.outlineStyle).toBe("solid");
    await expect(outline.outlineWidth).toBe("3px");
    await expect(outline.outlineOffset).toBe("-3px");
    // Colours transition; wait for them to land.
    await waitFor(() => expect(outline.outlineColor).toBe(error));
    await expect(getComputedStyle(label).color).toBe(error);

    await userEvent.keyboard("{Enter}");
    await expect(await screen.findByRole("listbox")).toBeVisible();
    await expect(outline.outlineStyle).toBe("solid");
    await expect(outline.outlineWidth).toBe("3px");
    await waitFor(() => expect(outline.outlineColor).toBe(error));
    // The label shrinks as it floats; once it has, its colour has settled too.
    await waitFor(() =>
      expect(getComputedStyle(label).fontSize).toBe(
        getComputedStyle(
          canvasElement.querySelector('[data-slot="supporting-text"]')!,
        ).fontSize,
      ),
    );
    await expect(getComputedStyle(label).color).toBe(error);

    await userEvent.keyboard("{Escape}");
  },
};

/**
 * CSS `:hover` needs a real pointer, and only the test runner has one: its
 * `vitest/browser` module throws on import anywhere else, Storybook's own
 * canvas included, where this resolves to `null` and the story only renders.
 * Under the runner a failed import is rethrown: returning `null` there would
 * leave the hover stories green having asserted nothing.
 */
async function realPointer(): Promise<UserEvent | null> {
  try {
    // Typed through the provider: `vitest/browser`'s own types re-export a
    // package that only resolves from this workspace.
    const browser: object = await import("vitest/browser");
    return (browser as { userEvent: UserEvent }).userEvent;
  } catch (error) {
    // The flag Vitest's browser tester sets, and the one
    // `@storybook/addon-vitest` reads to know it runs under it.
    if ("__vitest_browser__" in globalThis) throw error;
    return null;
  }
}

/** Longer than the fields' `duration-short-4` colour transitions. */
const settled = () => new Promise((resolve) => setTimeout(resolve, 300));

/**
 * Focus outranks hover on an invalid field: with the pointer resting on it, a
 * focused `Select` or `ComboBox` shows `error` on every part — label, chevron
 * or menu trigger, outline or active indicator — not hover's
 * `on-error-container` on some of them. Tab focuses the `Select` with the
 * pointer on its trigger; a click focuses each `ComboBox`, which is how the
 * pointer comes to be over it. The open `Select` is checked too, though not
 * as a hover case: its popover is modal, and the underlay takes the pointer.
 */
export const InvalidFieldStaysErrorWhenFocusedUnderThePointer: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Select label="Category" isInvalid errorMessage="Pick a category">
        <SelectItem id="starters" label="Starters" />
      </Select>
      <ComboBox label="Outlined" isInvalid errorMessage="Pick one">
        <ComboBoxItem id="starters" label="Starters" />
      </ComboBox>
      <ComboBox
        variant="filled"
        label="Filled"
        isInvalid
        errorMessage="Pick one"
      >
        <ComboBoxItem id="starters" label="Starters" />
      </ComboBox>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pointer = await realPointer();
    // Nothing to prove without `:hover`; the story still renders the fields.
    if (!pointer) return;

    const error = roleColor(canvasElement, "error");
    const color = (root: Element, selector: string) =>
      getComputedStyle(root.querySelector(selector)!).color;

    const select = canvasElement.querySelector('[data-slot="select"]')!;
    const trigger = select.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )!;
    await pointer.hover(trigger);
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute("data-focus-visible", "true");
    await settled();
    await expect(getComputedStyle(trigger).outlineColor).toBe(error);
    await expect(color(select, '[data-slot="label"]')).toBe(error);
    const chevron = '[data-slot="select-trigger"] > svg';
    await expect(color(select, chevron)).toBe(error);

    // A click opens the menu. Its popover is modal: a full-page underlay is
    // under the pointer from then on, so the trigger is no longer `:hover`.
    // What this proves is that the open, focused field stays `error`.
    await pointer.click(trigger);
    await expect(await screen.findByRole("listbox")).toBeVisible();
    await settled();
    await expect(getComputedStyle(trigger).outlineColor).toBe(error);
    await expect(color(select, '[data-slot="label"]')).toBe(error);
    await expect(color(select, chevron)).toBe(error);
    await userEvent.keyboard("{Escape}");

    const [outlined, filled] = Array.from(
      canvasElement.querySelectorAll('[data-slot="combo-box"]'),
    );
    const focusUnderThePointer = async (combo: Element) => {
      const input = combo.querySelector("input")!;
      await pointer.click(input);
      await expect(input).toHaveFocus();
      await settled();
      await expect(color(combo, '[data-slot="label"]')).toBe(error);
      await expect(color(combo, '[data-slot="combo-box-trigger"]')).toBe(error);
      await expect(color(combo, '[data-slot="trailing-icon"]')).toBe(error);
    };

    await focusUnderThePointer(outlined!);
    await expect(
      getComputedStyle(
        outlined!.querySelector('[data-slot="combo-box-container"]')!,
      ).outlineColor,
    ).toBe(error);

    await focusUnderThePointer(filled!);
    const indicator = getComputedStyle(
      filled!.querySelector('[data-slot="active-indicator"]')!,
    );
    await expect(indicator.height).toBe("2px");
    await expect(indicator.backgroundColor).toBe(error);
  },
};

/**
 * The select and autocomplete token sets differ from the text field's in four
 * places, and the kit follows each per kind: a focused `Select` turns its
 * chevron `primary`; a focused outlined `ComboBox` draws a 2dp outline, not
 * the text field's 3dp; on hover a filled `Select`'s label turns `on-surface`
 * while an outlined `ComboBox`'s stays `on-surface-variant`.
 */
export const SelectAndComboBoxFollowTheirOwnTokens: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Select label="Outlined select">
        <SelectItem id="starters" label="Starters" />
      </Select>
      <ComboBox label="Outlined combo box">
        <ComboBoxItem id="starters" label="Starters" />
      </ComboBox>
      <Select variant="filled" label="Filled select">
        <SelectItem id="starters" label="Starters" />
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [select, filledSelect] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="select-trigger"]',
      ),
    );
    const combo = canvasElement.querySelector<HTMLElement>(
      '[data-slot="combo-box-container"]',
    )!;
    const primary = roleColor(canvasElement, "primary");

    await userEvent.tab();
    await expect(select).toHaveFocus();
    await settled();
    await expect(getComputedStyle(select!).outlineWidth).toBe("3px");
    await expect(getComputedStyle(select!.querySelector("svg")!).color).toBe(
      primary,
    );

    await userEvent.tab();
    await expect(combo.querySelector("input")).toHaveFocus();
    await settled();
    const outline = getComputedStyle(combo);
    await expect(outline.outlineStyle).toBe("solid");
    await expect(outline.outlineWidth).toBe("2px");
    await expect(outline.outlineOffset).toBe("-2px");
    await expect(outline.outlineColor).toBe(primary);

    const pointer = await realPointer();
    // The hover half needs `:hover`, which only the test runner can give —
    // and a label that hover may colour: the editorial preset lifts the label
    // out of the box and pins it to `on-surface-variant`.
    if (!pointer || canvasElement.closest(".preset-editorial")) return;
    await userEvent.tab();
    await userEvent.tab();
    await expect(filledSelect).not.toHaveFocus();

    const labelColor = (field: Element) =>
      getComputedStyle(field.querySelector('[data-slot="label"]')!).color;
    await pointer.hover(filledSelect!);
    await settled();
    await expect(labelColor(filledSelect!)).toBe(
      roleColor(canvasElement, "on-surface"),
    );
    await pointer.hover(combo);
    await settled();
    await expect(labelColor(combo)).toBe(
      roleColor(canvasElement, "on-surface-variant"),
    );
  },
};

/** Arrow keys step by `step`; the value clamps at `maxValue`. */
export const NumberFieldSteps: Story = {
  render: () => (
    <NumberField
      label="Quantity"
      defaultValue={2}
      minValue={1}
      maxValue={4}
      steppers
      className="w-80"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: /quantity/i });

    await userEvent.click(field);
    await userEvent.keyboard("{ArrowUp}");
    await expect(field).toHaveValue("3");
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    await expect(field).toHaveValue("4"); // clamped at maxValue

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(field).toHaveValue("1"); // clamped at minValue

    // The steppers are out of the tab order — the keyboard path is the arrows.
    const decrement = canvas.getByRole("button", { name: /decrease/i });
    await expect(decrement).toHaveAttribute("tabindex", "-1");
  },
};

/** The phone field formats as you type and holds an E.164 value. */
export const PhoneFieldFormatting: Story = {
  render: () => (
    <PhoneField label="Phone" defaultCountry="FR" className="w-80" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: /phone/i });

    await userEvent.click(field);
    await userEvent.keyboard("612345678");
    // react-phone-number-input groups the digits as the country expects.
    await expect((field as HTMLInputElement).value).toMatch(
      /6\s?12\s?34\s?56\s?78/,
    );
  },
};

const categories = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains" },
  { id: "desserts", name: "Desserts" },
];

/** Typing filters the list; ArrowDown + Enter commits the highlighted option. */
export const ComboBoxFilterAndSelect: Story = {
  render: () => (
    <ComboBox label="Category" items={categories} className="w-80">
      {(item: (typeof categories)[number]) => (
        <ComboBoxItem id={item.id} label={item.name} />
      )}
    </ComboBox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /category/i });

    await userEvent.click(input);
    await userEvent.keyboard("des");

    // The popover is portalled, so it is not inside canvasElement.
    const option = await screen.findByRole("option", { name: /desserts/i });
    await expect(option).toBeVisible();
    await expect(
      screen.queryByRole("option", { name: /starters/i }),
    ).toBeNull();

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Desserts");
  },
};

/** Fires the "query" this story's options arrive on. */
const LOAD_OPTIONS = "story:combobox-load-options";

/**
 * A field whose options arrive after it has mounted, the way a query's do.
 * The event stands in for the query answering, so the play function decides
 * exactly when that happens — a click outside the field would close the menu,
 * and a timer would race it.
 */
function AsyncComboBox() {
  const [items, setItems] = useState<typeof categories>([]);
  React.useEffect(() => {
    const load = () => setItems(categories);
    window.addEventListener(LOAD_OPTIONS, load);
    return () => window.removeEventListener(LOAD_OPTIONS, load);
  }, []);

  return (
    <ComboBox label="Category" items={items} className="w-80">
      {(item: (typeof categories)[number]) => (
        <ComboBoxItem id={item.id} label={item.name} />
      )}
    </ComboBox>
  );
}

/**
 * Options that land after mount: the chevron opens the menu on its first
 * press even though there is nothing to list yet, and the options fill it in
 * when they arrive. Before #160 that press was swallowed — React Aria's
 * `open()` is a no-op while the collection is empty — and the field stayed
 * shut until something else re-rendered the form.
 */
export const ComboBoxAsyncItems: Story = {
  render: () => <AsyncComboBox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /category/i });

    // Pressed before a single option exists.
    await userEvent.click(
      canvas.getByRole("button", { name: /show options/i }),
    );
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(await screen.findByText("No options")).toBeVisible();

    // The query answers. The menu stays open and lists what arrived.
    window.dispatchEvent(new Event(LOAD_OPTIONS));
    await expect(
      await screen.findByRole("option", { name: /desserts/i }),
    ).toBeVisible();
    await expect(input).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByRole("option", { name: /desserts/i }));
    await expect(input).toHaveValue("Desserts");
  },
};

/**
 * The field in a scroll container, parked so that only its top is in view —
 * a form in a side sheet, scrolled down to its last field. Pressing the
 * chevron focuses the input, and a browser focus scrolls the container; that
 * scroll used to close the menu the same press had just opened (#160), so
 * only the second press worked.
 */
export const ComboBoxInScrollContainer: Story = {
  render: () => (
    <div
      data-testid="scroller"
      className="rounded-shape-medium bg-surface-container-lowest h-48 w-80 overflow-y-auto p-4"
    >
      <div className="h-40" />
      <ComboBox label="Category" items={categories} className="w-full">
        {(item: (typeof categories)[number]) => (
          <ComboBoxItem id={item.id} label={item.name} />
        )}
      </ComboBox>
      <div className="h-40" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /category/i });
    const scroller = canvas.getByTestId("scroller");
    const field = canvasElement.querySelector<HTMLElement>(
      '[data-slot="combo-box-container"]',
    )!;

    // Park the field with its top just above the container's bottom edge, and
    // let that scroll settle before anything is pressed.
    scroller.scrollTop +=
      field.getBoundingClientRect().top -
      (scroller.getBoundingClientRect().bottom - 24);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Pressed where it is: `userEvent.click` would scroll the trigger into
    // view first, which is the very scroll this story is about.
    press(canvas.getByRole("button", { name: /show options/i }));
    await expect(
      await screen.findByRole("option", { name: /desserts/i }),
    ).toBeVisible();
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
  },
};

/** A mouse press on an element, at wherever the element currently is. */
function press(el: HTMLElement) {
  const { left, top, width } = el.getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: left + width / 2,
    clientY: top + 4,
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  };
  el.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
  el.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
  el.dispatchEvent(new MouseEvent("click", init));
}

/** Multi-select renders chips, and Backspace on an empty input removes the last. */
export const ComboBoxChipsBackspace: Story = {
  render: () => (
    <ComboBox
      label="Categories"
      selectionMode="multiple"
      items={categories}
      defaultValue={["starters", "mains"]}
      className="w-80"
    >
      {(item: (typeof categories)[number]) => (
        <ComboBoxItem id={item.id} label={item.name} />
      )}
    </ComboBox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /categories/i });

    await expect(canvas.getByText("Starters")).toBeVisible();
    await expect(canvas.getByText("Mains")).toBeVisible();

    await userEvent.click(input);
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.queryByText("Mains")).toBeNull();
    await expect(canvas.getByText("Starters")).toBeVisible();
  },
};
