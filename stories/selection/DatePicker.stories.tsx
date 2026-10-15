import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  getLocalTimeZone,
  isWeekend,
  parseDate,
  today,
} from "@internationalized/date";
import { I18nProvider } from "react-aria-components";

import {
  DatePicker,
  DateRangePicker,
} from "@french-tech-homies/design-system/components/DatePicker";

/**
 * MD3 date pickers on React Aria's `DatePicker` and `DateRangePicker`: a
 * segmented text field whose calendar button opens the docked popover, the
 * modal dialog, the full-screen dialog or the modal date input. Values are
 * `@internationalized/date` values.
 *
 * Every story pins its locale (en-US) and its dates, so it renders the same
 * on any day and any machine; only `Today` shows today, as it must. Its
 * screenshot is drawn on the day the story tests pin (2026-03-15,
 * `.storybook/screenshot.setup.ts`).
 */
const meta = {
  title: "MD3/Selection/Date picker",
  component: DatePicker,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <I18nProvider locale="en-US">
        <Story />
      </I18nProvider>
    ),
  ],
  args: { label: "Date", className: "w-80" },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const june15 = parseDate("2026-06-15");

/** The field in each of its states: empty, filled, filled variant,
    error. */
export const Fields: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <DatePicker label="Date" />
      <DatePicker label="Departure" defaultValue={june15} />
      <DatePicker label="Return" variant="filled" defaultValue={june15} />
      <DatePicker
        label="Check-in"
        defaultValue={parseDate("2026-05-01")}
        minValue={june15}
        validationBehavior="aria"
      />
    </div>
  ),
};

/** Disabled: label, segments, icon and helper text at 38 %. */
export const Disabled: Story = {
  args: { defaultValue: june15, isDisabled: true },
  parameters: {
    a11y: {
      config: {
        // The disabled field is on-surface at 38 %, MD3's disabled content,
        // which never reaches 4.5:1 by construction; WCAG 1.4.3 exempts an
        // inactive component's text. `Fields` checks the enabled states.
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
};

/** Docked: the calendar under the field, with month and year menus; the
    neighbouring months' dates at 38 %. */
export const Docked: Story = {
  parameters: { layout: "padded" },
  args: { defaultValue: june15, defaultOpen: true },
};

export const DockedDark: Story = {
  ...Docked,
  globals: { theme: "dark" },
};

/** Docked, filled field. */
export const DockedFilled: Story = {
  parameters: { layout: "padded" },
  args: { variant: "filled", defaultValue: june15, defaultOpen: true },
};

/** Weekends unavailable, and nothing before June 10 or after July 20. */
export const Unavailable: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <DatePicker
      {...args}
      label="Appointment"
      defaultOpen
      defaultValue={june15}
      minValue={parseDate("2026-06-10")}
      maxValue={parseDate("2026-07-20")}
      isDateUnavailable={(date) => isWeekend(date, "en-US")}
    />
  ),
};

/** Today's date is outlined in `primary`. The one story that shows today. */
export const Today: Story = {
  parameters: { layout: "padded" },
  args: { defaultOpen: true, placeholderValue: today(getLocalTimeZone()) },
};

/** Modal: supporting text, the picked date as headline, the pencil to type
    it, the year menu, Cancel and OK. */
export const Modal: Story = {
  args: { layout: "modal", defaultValue: june15, defaultOpen: true },
};

export const ModalDark: Story = {
  ...Modal,
  globals: { theme: "dark" },
};

/** Modal date input: the dialog holds a date field. */
export const ModalInput: Story = {
  args: {
    layout: "modal",
    defaultMode: "input",
    defaultValue: june15,
    defaultOpen: true,
  },
};

/** Full screen, for compact windows: close and Save at the top. */
export const Fullscreen: Story = {
  args: { layout: "fullscreen", defaultValue: june15, defaultOpen: true },
};

/** A range: full screen, the months in a vertical scroll, the band between
    start and end. */
export const Range: Story = {
  render: () => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      defaultOpen
      defaultValue={{
        start: parseDate("2026-06-15"),
        end: parseDate("2026-06-19"),
      }}
    />
  ),
};

export const RangeDark: Story = {
  ...Range,
  globals: { theme: "dark" },
};

/** A range typed: two date fields. */
export const RangeInput: Story = {
  render: () => (
    <DateRangePicker
      label="Stay"
      className="w-80"
      defaultOpen
      defaultMode="input"
      defaultValue={{
        start: parseDate("2026-06-15"),
        end: parseDate("2026-06-19"),
      }}
    />
  ),
};

/** The closed range field. */
export const RangeField: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <DateRangePicker label="Stay" />
      <DateRangePicker
        label="Stay"
        variant="filled"
        defaultValue={{
          start: parseDate("2026-06-15"),
          end: parseDate("2026-06-19"),
        }}
      />
    </div>
  ),
};
