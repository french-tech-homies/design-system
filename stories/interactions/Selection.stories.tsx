import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import Chip, {
  ChipGroup,
} from "@french-tech-homies/design-system/components/Chip";
import {
  Checkbox,
  CheckboxGroup,
} from "@french-tech-homies/design-system/components/Checkbox";
import {
  Radio,
  RadioGroup,
} from "@french-tech-homies/design-system/components/Radio";
import {
  Select,
  SelectItem,
} from "@french-tech-homies/design-system/components/Select";
import { Slider } from "@french-tech-homies/design-system/components/Slider";
import { Switch } from "@french-tech-homies/design-system/components/Switch";

/**
 * Behaviour tests for the selection family. Keyboard first: Space toggles,
 * arrows move, Enter commits, Escape closes. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Selection",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Space toggles a checkbox; the group reports every checked value. */
export const CheckboxSpaceToggles: Story = {
  render: () => (
    <CheckboxGroup label="Allergens" defaultValue={["nuts"]}>
      <Checkbox value="nuts">Nuts</Checkbox>
      <Checkbox value="gluten">Gluten</Checkbox>
      <Checkbox value="dairy">Dairy</Checkbox>
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nuts = canvas.getByRole("checkbox", { name: "Nuts" });
    const gluten = canvas.getByRole("checkbox", { name: "Gluten" });

    await expect(nuts).toBeChecked();
    await expect(gluten).not.toBeChecked();

    await userEvent.tab();
    await expect(nuts).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(nuts).not.toBeChecked();

    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(gluten).toBeChecked();
  },
};

/** Space toggles a switch, and the accessible state follows. */
export const SwitchSpaceToggles: Story = {
  render: () => <Switch defaultSelected>Accepting orders</Switch>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: /accepting orders/i });

    await expect(toggle).toBeChecked();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(toggle).not.toBeChecked();
  },
};

/** A radio group is one tab stop; arrows move the selection inside it. */
export const RadioArrowsMoveSelection: Story = {
  render: () => (
    <RadioGroup label="Service" defaultValue="table">
      <Radio value="table">Table service</Radio>
      <Radio value="counter">Counter</Radio>
      <Radio value="takeaway">Takeaway</Radio>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("radio", { name: /table service/i });
    const counter = canvas.getByRole("radio", { name: /counter/i });

    await expect(table).toBeChecked();
    await userEvent.tab();
    await expect(table).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect(counter).toBeChecked();
    await expect(table).not.toBeChecked();

    // Still a single tab stop: Tab leaves the whole group.
    await userEvent.tab();
    await expect(counter).not.toHaveFocus();
  },
};

const expiry = [
  { id: "1", name: "1 day" },
  { id: "7", name: "1 week" },
  { id: "30", name: "1 month" },
];

/** Enter opens the listbox, arrows move, Enter commits, focus returns. */
export const SelectKeyboardOpenAndPick: Story = {
  render: () => (
    <Select label="Link expires in" items={expiry} className="w-72">
      {(item: (typeof expiry)[number]) => (
        <SelectItem id={item.id} label={item.name} />
      )}
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /link expires in/i });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.keyboard("{Enter}");
    // The popover is portalled out of canvasElement.
    const listbox = await screen.findByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
    // `getByText` would also match the hidden native <option> React Aria keeps
    // for form submission, so assert on the trigger itself.
    await expect(trigger).toHaveTextContent("1 week");
  },
};

/** Escape closes the listbox without committing, and focus comes back. */
export const SelectEscapeCloses: Story = {
  render: () => (
    <Select label="Link expires in" items={expiry} className="w-72">
      {(item: (typeof expiry)[number]) => (
        <SelectItem id={item.id} label={item.name} />
      )}
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /link expires in/i });

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("listbox");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    // Focus is restored after the overlay's exit transition, not synchronously.
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).not.toHaveTextContent(/1 day|1 week|1 month/);
  },
};

/** Tab draws the thumb's ring; arrow keys move the slider by `step` and
    stop at the bounds. */
export const SliderArrowsChangeValue: Story = {
  render: () => (
    <Slider label="Table count" defaultValue={10} minValue={8} maxValue={12} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole("slider");

    await expect(thumb).toHaveValue("10");
    // Focus goes to the hidden input; the ring is the drawn thumb's, which
    // React Aria marks with `data-focus-visible`.
    const drawn = canvasElement.querySelector('[data-slot="slider-thumb"]')!;
    await expect(getComputedStyle(drawn).outlineStyle).toBe("none");
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    const ring = getComputedStyle(drawn);
    await expect(ring.outlineStyle).toBe("solid");
    await expect(ring.outlineWidth).toBe("2px");
    await expect(ring.outlineOffset).toBe("2px");

    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await expect(thumb).toHaveValue("12"); // clamped at maxValue

    await userEvent.keyboard("{Home}");
    await expect(thumb).toHaveValue("8");
  },
};

function RemovableChips({ pressable = false }: { pressable?: boolean }) {
  const [tags, setTags] = React.useState(["Ada", "Grace", "Linus"]);
  const [opened, setOpened] = React.useState("");
  const list = React.useRef<HTMLDivElement>(null);
  // The removed chip held the focus: it goes to the chip that takes its
  // place, or to the one before it.
  const remove = (tag: string) => {
    const at = tags.indexOf(tag);
    setTags(tags.filter((t) => t !== tag));
    requestAnimationFrame(() => {
      const chips =
        list.current?.querySelectorAll<HTMLElement>("[data-slot=chip]");
      const next = chips?.[Math.min(at, (chips?.length ?? 1) - 1)];
      (next?.matches("button") ? next : next?.querySelector("button"))?.focus();
    });
  };
  return (
    <div className="flex flex-col gap-4">
      <div ref={list} className="flex gap-2" role="group" aria-label="People">
        {tags.map((tag) => (
          <Chip
            key={tag}
            variant="input"
            onPress={pressable ? () => setOpened(tag) : undefined}
            onRemove={() => remove(tag)}
          >
            {tag}
          </Chip>
        ))}
      </div>
      <p data-testid="opened">{opened}</p>
    </div>
  );
}

/**
 * A removable input chip is one button, named "Remove <its text>"; Enter,
 * Backspace and Delete each remove the focused one.
 */
export const InputChipRemovedFromKeyboard: Story = {
  render: () => <RemovableChips />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(3);

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Remove Ada" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "Remove Ada" })).toBeNull(),
    );

    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Remove Grace" }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("{Backspace}");
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Remove Linus" }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("{Delete}");
    await waitFor(() =>
      expect(canvas.queryAllByRole("button")).toHaveLength(0),
    );
  },
};

/**
 * With an action of its own the chip is two buttons, its own then "Remove
 * <its text>"; the first does the action, the second removes, and Delete
 * on either removes too.
 */
export const InputChipWithTwoActionsFromKeyboard: Story = {
  render: () => <RemovableChips pressable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(6);

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Ada" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByTestId("opened")).toHaveTextContent("Ada");
    await expect(canvas.getAllByRole("button")).toHaveLength(6);

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Remove Ada" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "Remove Ada" })).toBeNull(),
    );

    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Grace" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Delete}");
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "Grace" })).toBeNull(),
    );
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
  },
};

const days = ["Mon", "Tue", "Wed"];

/** A filter-chip set is one tab stop; arrows move, Space toggles. */
export const ChipGroupArrowsAndSpace: Story = {
  render: () => (
    <ChipGroup
      label="Days"
      selectionMode="multiple"
      defaultSelectedKeys={["Mon"]}
      className="w-80"
    >
      {days.map((day) => (
        <Chip key={day} id={day} variant="filter">
          {day}
        </Chip>
      ))}
    </ChipGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mon = canvas.getByRole("button", { name: "Mon" });
    const tue = canvas.getByRole("button", { name: "Tue" });

    await expect(mon).toHaveAttribute("aria-pressed", "true");
    await expect(tue).toHaveAttribute("aria-pressed", "false");

    await userEvent.tab();
    await expect(mon).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(tue).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(tue).toHaveAttribute("aria-pressed", "true");
  },
};
