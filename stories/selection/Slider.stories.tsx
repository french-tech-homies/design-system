import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "@french-tech-homies/design-system/components/Slider";

/**
 * Continuous or stepped slider on React Aria `Slider`, single or range.
 * The output value renders next to the label unless `showOutput` is false.
 */
const meta = {
  title: "MD3/Selection/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { className: "w-[320px]", minValue: 0, maxValue: 100 },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Continuous: Story = {
  args: { label: "Opacity", defaultValue: [25] },
};

export const Stepped: Story = {
  args: {
    label: "Tables",
    minValue: 0,
    maxValue: 50,
    step: 5,
    defaultValue: [20],
  },
};

export const Range: Story = {
  args: {
    label: "Price",
    defaultValue: [20, 80],
    thumbLabels: ["Minimum", "Maximum"],
  },
};

export const WithoutOutput: Story = {
  args: { label: "Volume", defaultValue: [60], showOutput: false },
};

export const Disabled: Story = {
  args: { label: "Locked", defaultValue: [40], isDisabled: true },
};
