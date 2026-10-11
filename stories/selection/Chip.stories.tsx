import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, Filter, Image } from "lucide-react";
import Chip, { ChipGroup } from "@french-tech-homies/design-system/components/Chip";

const meta = {
  title: "MD3/Selection/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

export const AssistChip: Story = {
  args: {
    children: "Assist",
  },
};

export const AssistChipWithIcon: Story = {
  args: {
    children: "Open calendar",
    icon: Calendar,
  },
};

/** With `href` the assist chip is a React Aria `Link` — a real anchor with
 *  the chip's anatomy and states, for "Edit" / "Details" destinations. */
export const AssistChipLink: Story = {
  args: {
    children: "Edit menu",
    icon: Calendar,
    href: "#edit",
  },
};

export const AssistChipDisabled: Story = {
  args: {
    children: "Open calendar",
    icon: Calendar,
    isDisabled: true,
  },
};

export const FilterChip: Story = {
  args: {
    children: "Filter",
    variant: "filter",
  },
};

export const FilterChipSelected: Story = {
  args: {
    children: "Filter",
    variant: "filter",
    isSelected: true,
  },
};

export const FilterChipWithIcon: Story = {
  args: {
    children: "Filter",
    variant: "filter",
    icon: Filter,
  },
};

export const FilterChipDisabled: Story = {
  args: {
    children: "Filter",
    variant: "filter",
    isDisabled: true,
  },
};

export const FilterChipWithLeadingIconDisabled: Story = {
  args: {
    children: "Filter",
    variant: "filter",
    isDisabled: true,
    icon: Filter,
  },
};

export const FilterChipWithTrailingIcon: Story = {
  args: {
    children: "Filter",
    variant: "filter",
    hasTrailingIcon: true,
  },
};

export const InputChip: Story = {
  args: {
    children: "Input",
    variant: "input",
  },
};

export const InputChipWithLeadingIcon: Story = {
  args: {
    children: "Image",
    variant: "input",
    icon: Image,
  },
};

export const InputChipWithTrailingIcon: Story = {
  args: {
    children: "Removable",
    variant: "input",
    onRemove: () => console.log("Remove clicked"),
  },
};

export const InputChipWithBothIcons: Story = {
  args: {
    children: "Image",
    variant: "input",
    icon: Image,
    onRemove: () => console.log("Remove clicked"),
  },
};

export const InputChipDisabled: Story = {
  args: {
    children: "Disabled",
    variant: "input",
    isDisabled: true,
  },
};

export const InputChipWithLongText: Story = {
  args: {
    children: "This is a very long input chip text",
    variant: "input",
    icon: Image,
    onRemove: () => console.log("Remove clicked"),
  },
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Multi-select filter chip set (`role="group"`, `aria-pressed` chips). */
export const FilterChipGroup: Story = {
  render: () => (
    <ChipGroup
      label="Days"
      selectionMode="multiple"
      defaultSelectedKeys={["Mon", "Wed"]}
      supportingText="Pick every day the menu is served"
      className="w-80"
    >
      {days.map((day) => (
        <Chip key={day} id={day} variant="filter">
          {day}
        </Chip>
      ))}
    </ChipGroup>
  ),
};

/** Single-select set (`role="radiogroup"`) — an alternative to segmented buttons. */
export const FilterChipGroupSingle: Story = {
  render: () => (
    <ChipGroup
      label="Firmness"
      selectionMode="single"
      defaultSelectedKeys={["medium"]}
    >
      <Chip id="extra-soft" variant="filter">
        Extra soft
      </Chip>
      <Chip id="soft" variant="filter">
        Soft
      </Chip>
      <Chip id="medium" variant="filter">
        Medium
      </Chip>
      <Chip id="hard" variant="filter">
        Hard
      </Chip>
    </ChipGroup>
  ),
};

export const FilterChipGroupInvalid: Story = {
  render: () => (
    <ChipGroup
      label="Days"
      isInvalid
      errorMessage="Select at least one day"
      supportingText="Pick every day the menu is served"
      className="w-80"
    >
      {days.map((day) => (
        <Chip key={day} id={day} variant="filter">
          {day}
        </Chip>
      ))}
    </ChipGroup>
  ),
};

export const FilterChipGroupDisabled: Story = {
  render: () => (
    <ChipGroup
      label="Days"
      isDisabled
      defaultSelectedKeys={["Sat", "Sun"]}
      className="w-80"
    >
      {days.map((day) => (
        <Chip key={day} id={day} variant="filter">
          {day}
        </Chip>
      ))}
    </ChipGroup>
  ),
};
