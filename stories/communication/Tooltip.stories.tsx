import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip, TooltipTrigger } from "@french-tech-homies/design-system/components/Tooltip";
import Button from "@french-tech-homies/design-system/components/Button";

const meta = {
  title: "MD3/Communication/Tooltip",
  component: TooltipTrigger,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof TooltipTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlainTooltip: Story = {
  args: {
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip>This is a tooltip</Tooltip>
      </>
    ),
  },
};

export const RichTooltip: Story = {
  args: {
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip
          headline="Tooltip Title"
          supportingText="This is a tooltip with a headline and supporting text."
        />
      </>
    ),
  },
};

export const PlainTooltipOnTheRight: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip placement="right">This is a tooltip</Tooltip>
      </>
    ),
  },
};

export const PlainTooltipOnTheBottom: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip placement="bottom">This is a tooltip</Tooltip>
      </>
    ),
  },
};

export const PlainTooltipOnTheLeft: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip placement="left">This is a tooltip</Tooltip>
      </>
    ),
  },
};

export const RichTooltipOnTheRight: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip
          placement="right"
          headline="Tooltip Title"
          supportingText="This is a tooltip with a headline and supporting text."
        />
      </>
    ),
  },
};

export const RichTooltipOnTheBottom: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip
          placement="bottom"
          headline="Tooltip Title"
          supportingText="This is a tooltip with a headline and supporting text."
        />
      </>
    ),
  },
};

export const RichTooltipOnTheLeft: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip
          placement="left"
          headline="Tooltip Title"
          supportingText="This is a tooltip with a headline and supporting text."
        />
      </>
    ),
  },
};
