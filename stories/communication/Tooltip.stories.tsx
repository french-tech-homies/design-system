import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Focusable,
  Tooltip,
  TooltipTrigger,
} from "@french-tech-homies/design-system/components/Tooltip";
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

/** Material's tooltip has no arrow; `showArrow` draws one. */
export const PlainTooltipWithArrow: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip showArrow>This is a tooltip</Tooltip>
      </>
    ),
  },
};

/** The arrow on a side: joined to the tooltip, pointing at the trigger. */
export const PlainTooltipOnTheRightWithArrow: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip placement="right" showArrow offset={8}>
          This is a tooltip
        </Tooltip>
      </>
    ),
  },
};

/** A corner: below the trigger, from its end edge. */
export const PlainTooltipAtBottomEnd: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>A trigger wider than its tooltip</Button>
        <Tooltip placement="bottom end">Bottom end</Tooltip>
      </>
    ),
  },
};

/** A corner with its arrow: above the trigger, from its start edge. */
export const RichTooltipAtTopStartWithArrow: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Button>Hover me</Button>
        <Tooltip
          placement="top start"
          showArrow
          headline="Tooltip Title"
          supportingText="This is a tooltip with a headline and supporting text."
        />
      </>
    ),
  },
};

/**
 * A rich tooltip takes any content that is only read: here a headline over
 * rows of label and value. Its trigger is no button: a figure made focusable
 * and wrapped in `Focusable`, so the keyboard opens the tooltip too.
 */
export const RichTooltipWithRows: Story = {
  args: {
    isOpen: true,
    children: (
      <>
        <Focusable>
          <span
            role="img"
            aria-label="1,284 visits this week"
            tabIndex={0}
            className="rounded-shape-extra-small text-title-large text-on-surface outline-none outline-3 outline-offset-2 outline-ring focus-visible:outline-solid"
          >
            1,284
          </span>
        </Focusable>
        <Tooltip variant="rich" headline="Visits this week">
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
            <dt>Search</dt>
            <dd className="text-right tabular-nums">812</dd>
            <dt>Direct</dt>
            <dd className="text-right tabular-nums">301</dd>
            <dt>Referral</dt>
            <dd className="text-right tabular-nums">171</dd>
          </dl>
        </Tooltip>
      </>
    ),
  },
};
