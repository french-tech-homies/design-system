import type { Meta, StoryObj } from "@storybook/react-vite";
import { Time } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";

import { TimePicker } from "@french-tech-homies/design-system/components/TimePicker";

/**
 * MD3 time picker: a modal dialog with a clock dial or typed hour and
 * minute, opened from a text-field-shaped trigger. The value is an
 * `@internationalized/date` `Time`. Every story pins its locale (en-US) and
 * its time.
 */
const meta = {
  title: "MD3/Selection/Time picker",
  component: TimePicker,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <I18nProvider locale="en-US">
        <Story />
      </I18nProvider>
    ),
  ],
  args: { label: "Alarm", className: "w-80" },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The trigger field: empty, set, filled variant, disabled. */
export const Fields: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <TimePicker label="Alarm" />
      <TimePicker label="Meeting" defaultValue={new Time(9, 30)} />
      <TimePicker
        label="Reminder"
        variant="filled"
        defaultValue={new Time(18, 45)}
        supportingText="Every weekday"
      />
      <TimePicker label="Wake-up" defaultValue={new Time(7, 0)} isDisabled />
    </div>
  ),
};

/** The dial, 12 hours: the hour selected, the handle on 7. */
export const Dial12h: Story = {
  args: { defaultValue: new Time(7, 0), defaultOpen: true, hourCycle: 12 },
};

export const Dial12hDark: Story = {
  ...Dial12h,
  globals: { theme: "dark" },
};

/** The dial, 24 hours: 00–11 outside, 12–23 inside, no period selector. */
export const Dial24h: Story = {
  args: { defaultValue: new Time(20, 0), defaultOpen: true, hourCycle: 24 },
};

/** Horizontal: the dial beside the selectors, the period in a row. */
export const Horizontal: Story = {
  args: {
    defaultValue: new Time(19, 15),
    defaultOpen: true,
    hourCycle: 12,
    orientation: "horizontal",
  },
};

/** Input: two boxes, the period selector beside them. */
export const Input: Story = {
  args: {
    defaultValue: new Time(9, 30),
    defaultOpen: true,
    hourCycle: 12,
    defaultMode: "input",
  },
};

export const InputDark: Story = {
  ...Input,
  globals: { theme: "dark" },
};

/** Input, 24 hours. */
export const Input24h: Story = {
  args: {
    defaultValue: new Time(21, 5),
    defaultOpen: true,
    hourCycle: 24,
    defaultMode: "input",
  },
};
