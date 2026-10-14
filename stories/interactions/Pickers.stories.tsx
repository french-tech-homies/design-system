import type { Meta, StoryObj } from "@storybook/react-vite";
import { parseDate, Time } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import { useLayoutEffect, type ReactNode } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import {
  DatePicker,
  DateRangePicker,
} from "@french-tech-homies/design-system/components/DatePicker";
import { TimePicker } from "@french-tech-homies/design-system/components/TimePicker";
// Michroma from the catalog itself (`@fontsource/michroma`, SIL OFL 1.1), not
// from Google Fonts while the story runs: its screenshot is drawn offline.
import michroma from "@fontsource/michroma/files/michroma-latin-400-normal.woff2?url";

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
    const ok = within(dialog).getByRole("button", { name: "OK" });
    await expect(ok).toBeDisabled();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await expect(args.onChange).not.toHaveBeenCalled();

    // An end after the start enables it again.
    await userEvent.click(end);
    await userEvent.keyboard("25");
    await expect(ok).toBeEnabled();
  },
};

/** The docked popover opens under the helper text, not across it. */
export const DockedClearsHelperText: Story = {
  render: () => (
    <DatePicker label="Date" className="w-80" defaultValue={june15} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const helper = canvas.getByText("MM/DD/YYYY").getBoundingClientRect();
    const popover = dialog.closest("[data-slot=date-picker-popover]")!;
    await waitFor(() =>
      expect(popover.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        helper.bottom,
      ),
    );
  },
};

/** A value the constraints refuse cannot be confirmed: OK stays disabled
    until a date in range is picked. */
export const ModalInvalidDraft: Story = {
  render: (args) => (
    <DatePicker
      label="Check-in"
      layout="modal"
      className="w-80"
      defaultValue={parseDate("2026-05-01")}
      minValue={june15}
      validationBehavior="aria"
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const ok = within(dialog).getByRole("button", { name: "OK" });
    await expect(ok).toBeDisabled();
    // The calendar opens on June, the first month the minimum allows.
    await userEvent.click(
      within(dialog).getByRole("button", { name: /Monday, June 22, 2026/ }),
    );
    await expect(ok).toBeEnabled();
    await userEvent.click(ok);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledWith(parseDate("2026-06-22"));
  },
};

/** The range's months scroll both ways: scrolled to its top, the list
    grows upward, keeps the month in view where it was, and a date months
    before the range can be picked. */
export const RangeScrollsBack: Story = {
  render: (args) => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      defaultValue={{ start: june15, end: parseDate("2026-06-19") }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const list = dialog.querySelector<HTMLElement>(
      "[data-slot=date-range-picker-months]",
    )!;
    const heading = (name: string) => within(list).getByText(name);

    // Open on the range's month, with earlier months above it.
    await waitFor(() =>
      expect(heading("June 2026").getBoundingClientRect().top).toBeLessThan(
        list.getBoundingClientRect().top + 40,
      ),
    );
    await expect(heading("May 2026")).toBeInTheDocument();
    await expect(within(list).queryByText("November 2025")).toBeNull();

    // At the top, the window grows upward and the month in view stays put.
    list.scrollTop = 0;
    list.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(heading("November 2025")).toBeInTheDocument());
    const december = heading("December 2025").getBoundingClientRect().top;
    await expect(
      Math.abs(december - list.getBoundingClientRect().top),
    ).toBeLessThan(40);

    await userEvent.click(
      within(list).getByRole("button", { name: /Thursday, January 8, 2026$/ }),
    );
    await userEvent.click(
      within(list).getByRole("button", { name: /Tuesday, January 13, 2026$/ }),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await expect(args.onChange).toHaveBeenCalledWith({
      start: parseDate("2026-01-08"),
      end: parseDate("2026-01-13"),
    });
  },
};

/** The list grows from the months it shows, not from the focused date: a
    range picked far down, then a scroll back to the top, keeps the month in
    view where it was. */
export const RangeGrowsFromItsWindow: Story = {
  render: (args) => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      defaultValue={{ start: june15, end: parseDate("2026-06-19") }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const list = dialog.querySelector<HTMLElement>(
      "[data-slot=date-range-picker-months]",
    )!;
    const heading = (name: string) => within(list).getByText(name);

    await waitFor(() =>
      expect(heading("June 2026").getBoundingClientRect().top).toBeLessThan(
        list.getBoundingClientRect().top + 40,
      ),
    );

    // At the end, the list grows: June 2025 to June 2027.
    list.scrollTop = list.scrollHeight;
    list.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(heading("June 2027")).toBeInTheDocument());
    await expect(heading("June 2025")).toBeInTheDocument();

    // A range a year on moves the focus to June 2027.
    await userEvent.click(
      within(list).getByRole("button", { name: /Thursday, June 10, 2027$/ }),
    );
    await userEvent.click(
      within(list).getByRole("button", { name: /Saturday, June 12, 2027$/ }),
    );

    // Back at the top, the list grows from June 2025, and June 2025 stays put.
    list.scrollTop = 0;
    list.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(heading("December 2024")).toBeInTheDocument());
    await expect(
      Math.abs(
        heading("June 2025").getBoundingClientRect().top -
          list.getBoundingClientRect().top,
      ),
    ).toBeLessThan(40);

    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await expect(args.onChange).toHaveBeenCalledWith({
      start: parseDate("2027-06-10"),
      end: parseDate("2027-06-12"),
    });
  },
};

/** The keyboard past the last month shown: the list takes in the month focus
    moves to, and keeps the months above it. */
export const RangeKeyboardPastTheEnd: Story = {
  render: () => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      defaultValue={{ start: june15, end: parseDate("2026-06-19") }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open calendar/i }));
    const dialog = await screen.findByRole("dialog");
    const list = dialog.querySelector<HTMLElement>(
      "[data-slot=date-range-picker-months]",
    )!;
    const june = within(list).getByRole("button", { name: /Monday, June 15, 2026/ });
    await waitFor(() => expect(june).toHaveFocus());

    await userEvent.keyboard("{PageDown>7/}");
    await waitFor(() =>
      expect(
        within(list).getByRole("button", { name: /Friday, January 15, 2027/ }),
      ).toHaveFocus(),
    );
    await expect(within(list).getByText("June 2026")).toBeInTheDocument();
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

/** The hour and minute of the open dialog: their boxes, and the digits
    each draws. */
const timeBoxes = (dialog: HTMLElement) =>
  (["hour", "minute"] as const).map((part) => {
    const box = dialog.querySelector<HTMLElement>(`[data-slot=time-picker-${part}]`)!;
    const digits = box.querySelector<HTMLElement>("[data-slot=time-picker-digits]")!;
    return { box: box.getBoundingClientRect(), digits: digits.getBoundingClientRect() };
  });

/** Digits whole inside their box, to half a pixel. */
const holds = (box: DOMRect, digits: DOMRect) =>
  digits.left >= box.left - 0.5 && digits.right <= box.right + 0.5;

/** A spin button whose text overflows nothing. */
const holdsText = (field: HTMLElement) => field.scrollWidth <= field.clientWidth;

/** Under the kit's own preset the boxes are Material's: 96 by 80dp on the
    dial, 52 by 80dp for the period, 96 by 72dp typed. Under Editorial, whose
    face is the system's serif, the digits are whole. */
export const TimeMaterialSizes: Story = {
  render: () => (
    <TimePicker
      label="Alarm"
      className="w-80"
      hourCycle={12}
      defaultValue={new Time(7, 0)}
    />
  ),
  play: async ({ canvasElement, globals }) => {
    const material = globals.preset !== "editorial";
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /alarm/i }));
    let dialog = await screen.findByRole("dialog", { name: "Select time" });
    await document.fonts.ready;
    for (const { box, digits } of timeBoxes(dialog)) {
      if (material) {
        await expect([box.width, box.height]).toEqual([96, 80]);
      }
      await expect(holds(box, digits)).toBe(true);
    }
    if (material) {
      const period = within(dialog)
        .getByRole("radiogroup", { name: "AM or PM" })
        .getBoundingClientRect();
      await expect([period.width, period.height]).toEqual([52, 80]);
    }

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Toggle input picker" }),
    );
    dialog = await screen.findByRole("dialog", { name: "Enter time" });
    for (const name of [/hour/i, /minute/i]) {
      const field = within(dialog).getByRole("spinbutton", { name });
      const { width, height } = field.getBoundingClientRect();
      if (material) await expect([width, height]).toEqual([96, 72]);
      await expect(holdsText(field)).toBe(true);
    }
  },
};

/** Michroma, a wide face, as the display face of the whole page while the
    story is mounted: on `<html>`, where it outweighs either preset. */
function WideDisplayFace({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const face = new FontFace("Michroma", `url(${michroma}) format("woff2")`);
    document.fonts.add(face);
    const root = document.documentElement.style;
    root.setProperty("--md-sys-typescale-brand-font", '"Michroma", sans-serif');
    return () => {
      document.fonts.delete(face);
      root.removeProperty("--md-sys-typescale-brand-font");
    };
  }, []);
  return children;
}

/** A theme whose display face is wide (Michroma, as Nemia's theme names
    it): Material's 96dp box would clip "07"; the boxes grow to hold both
    digits, on the dial and typed. */
export const TimeWideDisplayFace: Story = {
  render: () => (
    <WideDisplayFace>
      <TimePicker
        label="Alarm"
        className="w-80"
        hourCycle={12}
        defaultValue={new Time(7, 0)}
      />
    </WideDisplayFace>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(
      async () =>
        expect((await document.fonts.load("57px Michroma")).length).toBeGreaterThan(0),
      { timeout: 10000 },
    );
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /alarm/i }));
    let dialog = await screen.findByRole("dialog", { name: "Select time" });
    await document.fonts.ready;
    for (const { box, digits } of timeBoxes(dialog)) {
      // The face is wide enough to matter: wider than Material's box.
      await expect(digits.width).toBeGreaterThan(96);
      await expect(holds(box, digits)).toBe(true);
    }
    const [hour, minute] = timeBoxes(dialog);
    // As wide as the widest pair, so the dial does not move as the value does.
    await expect(hour!.box.width).toBe(minute!.box.width);

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Toggle input picker" }),
    );
    dialog = await screen.findByRole("dialog", { name: "Enter time" });
    await document.fonts.load("45px Michroma");
    for (const name of [/hour/i, /minute/i]) {
      await expect(
        holdsText(within(dialog).getByRole("spinbutton", { name })),
      ).toBe(true);
    }
  },
};

/** The landscape layout under the wide face: the AM and PM row spans the
    boxes above it, edge to edge, as it does at Material's sizes. */
export const TimeWideDisplayFaceHorizontal: Story = {
  render: () => (
    <WideDisplayFace>
      <TimePicker
        label="Alarm"
        className="w-80"
        hourCycle={12}
        orientation="horizontal"
        defaultValue={new Time(7, 0)}
      />
    </WideDisplayFace>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(
      async () =>
        expect((await document.fonts.load("57px Michroma")).length).toBeGreaterThan(0),
      { timeout: 10000 },
    );
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /alarm/i }));
    const dialog = await screen.findByRole("dialog", { name: "Select time" });
    await document.fonts.ready;
    const [hour, minute] = timeBoxes(dialog);
    for (const { box, digits } of [hour!, minute!]) {
      await expect(digits.width).toBeGreaterThan(96);
      await expect(holds(box, digits)).toBe(true);
    }
    const period = within(dialog)
      .getByRole("radiogroup", { name: "AM or PM" })
      .getBoundingClientRect();
    await expect(Math.abs(period.left - hour!.box.left)).toBeLessThanOrEqual(0.5);
    await expect(Math.abs(period.right - minute!.box.right)).toBeLessThanOrEqual(0.5);
  },
};
