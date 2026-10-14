import type { Meta, StoryObj } from "@storybook/react-vite";
import { parseDate, Time } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import {
  DatePicker,
  DateRangePicker,
} from "@french-tech-homies/design-system/components/DatePicker";
import { TimePicker } from "@french-tech-homies/design-system/components/TimePicker";

/**
 * Behaviour tests for the date and time pickers. Every story has a `play`
 * function; `npm run test-storybook` runs them in Chromium under both
 * presets, and axe runs over each result.
 *
 * Locale (en-US) and dates are pinned, so a run on any day reads the same.
 * The dialogs are portalled: they are reached with `screen`.
 */
/** A spy on the picker's `onChange`, fresh for each story. */
type Args = { onChange: ReturnType<typeof fn> };

const meta = {
  title: "MD3/Interactions/Pickers",
  args: { onChange: fn() },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <I18nProvider locale="en-US">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

const june15 = parseDate("2026-06-15");

/** The text of a segmented field, segments joined. */
const fieldText = (root: HTMLElement) =>
  within(root)
    .getAllByRole("group")
    .map((g) => g.textContent)
    .join("")
    .replace(/[⁦-⁩]/g, "");

/** Docked: the calendar button opens it, a press picks a day, OK commits
    it and closes the popover. */
export const DockedPicksADay: Story = {
  render: (args) => (
    <DatePicker
      label="Date"
      className="w-80"
      placeholderValue={june15}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const grid = within(dialog).getByRole("grid");
    await expect(grid).toHaveAccessibleName(/June 2026/);

    await userEvent.click(
      within(dialog).getByRole("button", { name: /Monday, June 15, 2026/ }),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith(june15);
    await expect(fieldText(canvasElement)).toContain("6/15/2026");
  },
};

/** The grid by keyboard: arrows move a day, Page Down a month, Enter
    picks; Shift + M reaches the month menu; Escape closes and drops the
    draft. */
export const DockedKeyboard: Story = {
  render: () => (
    <DatePicker label="Date" className="w-80" defaultValue={june15} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: /June 15, 2026/ }),
      ).toHaveFocus(),
    );

    await userEvent.keyboard("{ArrowRight}");
    await expect(
      within(dialog).getByRole("button", { name: /Tuesday, June 16, 2026/ }),
    ).toHaveFocus();
    await userEvent.keyboard("{PageDown}");
    await expect(
      within(dialog).getByRole("button", { name: /Thursday, July 16, 2026/ }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(
      within(dialog)
        .getByRole("button", { name: /July 16, 2026/ })
        .closest("[role=gridcell]"),
    ).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Shift>}M{/Shift}");
    await expect(
      within(dialog).getByRole("button", { name: /choose month, july/i }),
    ).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(fieldText(canvasElement)).toContain("6/15/2026");
  },
};

/** The docked month menu replaces the grid; a month brings the grid back
    on that month. The year menu is disabled meanwhile. */
export const DockedMonthMenu: Story = {
  render: () => (
    <DatePicker label="Date" className="w-80" defaultValue={june15} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");

    const month = within(dialog).getByRole("button", { name: /choose month/i });
    await userEvent.click(month);
    await expect(month).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(dialog).getByRole("button", { name: /choose year/i }),
    ).toBeDisabled();
    const list = within(dialog).getByRole("listbox", { name: "Months" });
    await expect(
      within(list).getByRole("option", { name: "June" }),
    ).toHaveAttribute("aria-selected", "true");

    await userEvent.click(within(list).getByRole("option", { name: "August" }));
    await expect(within(dialog).getByRole("grid")).toHaveAccessibleName(
      /August 2026/,
    );
    await expect(
      within(dialog).getByRole("button", { name: /choose month, august/i }),
    ).toBeVisible();
  },
};

/** Modal: the headline shows the draft; Cancel drops it, OK commits it. */
export const ModalCancelAndOk: Story = {
  render: (args) => (
    <DatePicker
      label="Date"
      layout="modal"
      className="w-80"
      defaultValue={june15}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const open = canvas.getByRole("button", { name: /open calendar/i });

    await userEvent.click(open);
    let dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Saturday, June 20, 2026/ }),
    );
    await expect(within(dialog).getByText("Sat, Jun 20")).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(fieldText(canvasElement)).toContain("6/15/2026");

    await userEvent.click(open);
    dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Saturday, June 20, 2026/ }),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith(parseDate("2026-06-20"));
    await expect(fieldText(canvasElement)).toContain("6/20/2026");
  },
};

/** The modal's year menu opens the year grid; a year brings the days back
    on that year. */
export const ModalYearGrid: Story = {
  render: () => (
    <DatePicker label="Date" layout="modal" className="w-80" defaultValue={june15} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /choose year, june 2026/i }),
    );
    const years = within(dialog).getByRole("listbox", { name: "Years" });
    await expect(
      within(years).getByRole("option", { name: "2026" }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(years).getByRole("option", { name: "2028" }));
    await expect(within(dialog).getByRole("grid")).toHaveAccessibleName(
      /June 2028/,
    );
  },
};

/** The pencil switches the modal to its date input, holding the draft;
    a typed date commits on OK. */
export const ModalInputTyped: Story = {
  render: (args) => (
    <DatePicker
      label="Date"
      layout="modal"
      className="w-80"
      defaultValue={june15}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Switch to text input" }),
    );
    const month = within(dialog).getByRole("spinbutton", { name: /month/i });
    await expect(month).toHaveFocus();
    await expect(month).toHaveAttribute("aria-valuenow", "6");

    await userEvent.keyboard("07202027");
    await expect(within(dialog).getByText("Tue, Jul 20")).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith(parseDate("2027-07-20"));
  },
};

/** Full screen: Save commits; the close button drops the draft. */
export const FullscreenSaveAndClose: Story = {
  render: (args) => (
    <DatePicker
      label="Date"
      layout="fullscreen"
      className="w-80"
      defaultValue={june15}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const open = canvas.getByRole("button", { name: /open calendar/i });

    await userEvent.click(open);
    let dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /June 22, 2026/ }),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(open);
    dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /June 22, 2026/ }),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith(parseDate("2026-06-22"));
  },
};

/** A range: the first press is the start, the second the end; the dates
    between are in the band; Save commits both. */
export const RangePicksStartAndEnd: Story = {
  render: (args) => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      placeholderValue={june15}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");

    await userEvent.click(
      within(dialog).getByRole("button", { name: /Monday, June 22, 2026/ }),
    );
    await expect(within(dialog).getByText(/Jun 22 – End date/)).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Thursday, June 25, 2026/ }),
    );
    await expect(within(dialog).getByText("Jun 22 – Jun 25")).toBeVisible();

    // A selected cell's name opens with the whole range; its own date
    // closes it.
    const cell = (day: number) =>
      within(dialog).getByRole("button", {
        name: new RegExp(`June ${day}, 2026( selected)?$`),
      });
    await expect(cell(22)).toHaveAttribute("data-selection-start");
    await expect(cell(23)).toHaveAttribute("data-selected");
    await expect(cell(23)).not.toHaveAttribute("data-selection-start");
    await expect(cell(25)).toHaveAttribute("data-selection-end");

    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith({
      start: parseDate("2026-06-22"),
      end: parseDate("2026-06-25"),
    });
  },
};

/** A range typed with its end before its start says so, and OK does not
    commit it. */
export const RangeInputReversed: Story = {
  render: (args) => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      defaultMode="input"
      defaultValue={{ start: june15, end: parseDate("2026-06-19") }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const end = within(dialog).getAllByRole("spinbutton", { name: /day/i })[1]!;
    await userEvent.click(end);
    await userEvent.keyboard("10");
    await expect(
      within(dialog).getByText("The end date is before the start date"),
    ).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await expect(screen.getByRole("dialog")).toBeVisible();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** A value outside min / max marks the field invalid and says why. */
export const OutOfRange: Story = {
  render: () => (
    <DatePicker
      label="Check-in"
      className="w-80"
      defaultValue={parseDate("2026-05-01")}
      minValue={june15}
      validationBehavior="aria"
      errorMessage="Pick a date from June 15"
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-slot=date-picker]")!;
    await expect(root).toHaveAttribute("data-invalid");
    await expect(within(canvasElement).getByText("Pick a date from June 15")).toBeVisible();
  },
};

/** Disabled: the calendar button is disabled and no segment takes focus. */
export const Disabled: Story = {
  parameters: {
    a11y: {
      config: {
        // The disabled field's helper text is on-surface at 38 %, MD3's
        // disabled content, which never reaches 4.5:1 by construction; WCAG
        // 1.4.3 exempts an inactive component's text. The enabled states
        // are checked by every other story.
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
  render: () => (
    <DatePicker label="Date" className="w-80" defaultValue={june15} isDisabled />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /open calendar/i })).toBeDisabled();
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement)).toBe(false);
  },
};

/* ---- time ---------------------------------------------------------------- */

/** The dial by keyboard: Tab reaches each number, Enter picks the hour and
    moves to the minutes, then a minute; OK commits. */
export const TimeDialKeyboard: Story = {
  render: (args) => (
    <TimePicker
      label="Alarm"
      className="w-80"
      hourCycle={12}
      defaultValue={new Time(7, 0)}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /alarm/i }));
    const dialog = await screen.findByRole("dialog", { name: "Select time" });
    await expect(
      within(dialog).getByRole("button", { name: "Hour 7 of 12" }),
    ).toHaveAttribute("aria-pressed", "true");

    within(dialog).getByRole("button", { name: "Hour 7 of 12" }).focus();
    await userEvent.tab();
    await expect(
      within(dialog).getByRole("button", { name: "Hour 8 of 12" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(
      within(dialog).getByRole("button", { name: "Hour 08" }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      within(dialog).getByRole("button", { name: "Minute 00" }),
    ).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Minute 0 of 60" }),
      ).toHaveFocus(),
    );

    const fortyFive = within(dialog).getByRole("button", { name: "Minute 45 of 60" });
    fortyFive.focus();
    await userEvent.keyboard(" ");
    await expect(fortyFive).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith(new Time(8, 45));
  },
};

/** The dial by pointer: a press on the dial picks the hour under it, and
    letting go moves to the minutes. */
export const TimeDialPointer: Story = {
  render: () => (
    <TimePicker
      label="Alarm"
      className="w-80"
      hourCycle={12}
      defaultValue={new Time(7, 0)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /alarm/i }));
    const dialog = await screen.findByRole("dialog", { name: "Select time" });
    const dial = dialog.querySelector<HTMLElement>("[data-slot=time-picker-dial]")!;
    const three = within(dialog)
      .getByRole("button", { name: "Hour 3 of 12" })
      .getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft]",
        target: dial,
        coords: {
          clientX: three.left + three.width / 2,
          clientY: three.top + three.height / 2,
        },
      },
    ]);
    await expect(
      within(dialog).getByRole("button", { name: "Hour 03" }),
    ).toBeVisible();
    await expect(
      within(dialog).getByRole("button", { name: "Minute 00" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

/** AM and PM are radios; PM moves the hour by twelve. */
export const TimePeriod: Story = {
  render: (args) => (
    <TimePicker
      label="Alarm"
      className="w-80"
      hourCycle={12}
      defaultValue={new Time(7, 30)}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /alarm/i }));
    const dialog = await screen.findByRole("dialog");
    const group = within(dialog).getByRole("radiogroup", { name: "AM or PM" });
    await expect(within(group).getByRole("radio", { name: "AM" })).toBeChecked();
    await userEvent.click(within(group).getByRole("radio", { name: "PM" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await expect(args.onChange).toHaveBeenCalledWith(new Time(19, 30));
  },
};

/** 24 hours: no period selector, the inner ring's 13 sets 13. */
export const Time24h: Story = {
  render: (args) => (
    <TimePicker
      label="Start"
      className="w-80"
      hourCycle={24}
      defaultValue={new Time(9, 0)}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /start/i }));
    const dialog = await screen.findByRole("dialog");
    await expect(within(dialog).queryByRole("radiogroup")).toBeNull();
    within(dialog).getByRole("button", { name: "Hour 13 of 24" }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await expect(args.onChange).toHaveBeenCalledWith(new Time(13, 0));
  },
};

/** Input: "Toggle input picker" swaps the dial for two fields; typed
    values commit on OK, and Escape drops them. */
export const TimeInputTyped: Story = {
  render: (args) => (
    <TimePicker
      label="Alarm"
      className="w-80"
      hourCycle={12}
      defaultValue={new Time(7, 0)}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /alarm/i });
    await userEvent.click(trigger);
    let dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Toggle input picker" }),
    );
    dialog = await screen.findByRole("dialog", { name: "Enter time" });
    const hour = within(dialog).getByRole("spinbutton", { name: /hour/i });
    await expect(hour).toHaveFocus();
    await userEvent.keyboard("0930");
    await expect(
      within(dialog).getByRole("spinbutton", { name: /minute/i }),
    ).toHaveAttribute("aria-valuenow", "30");
    await userEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenLastCalledWith(new Time(9, 30));

    await userEvent.click(trigger);
    dialog = await screen.findByRole("dialog");
    within(dialog).getByRole("button", { name: "Hour 3 of 12" }).focus();
    await userEvent.keyboard("{Enter}{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(trigger).toHaveAccessibleName(/9:30 AM/);
  },
};
