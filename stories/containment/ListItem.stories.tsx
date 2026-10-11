import type { Meta, StoryObj } from "@storybook/react-vite";
import ListItem from "@french-tech-homies/design-system/components/ListItem";
import { Checkbox } from "@french-tech-homies/design-system/components/Checkbox";

/** Plain `<img>` so the story has no framework dependency (the Next image component needs the Next runtime). */
function Thumb({ size }: { size: number }) {
  return (
    <img
      src="https://picsum.photos/id/1011/300/300"
      alt=""
      width={size}
      height={size}
      className="rounded-shape-medium object-cover"
    />
  );
}

const meta = {
  title: "MD3/Containment/List item",
  component: ListItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: {
    headline: "My sweet list item",
  },
};

export const ListItemWithLeadingImage: Story = {
  args: {
    headline: "My sweet list item",
    leadingElement: <Thumb size={40} />,
  },
};

export const ListItemWithSupportingText: Story = {
  args: {
    headline: "My sweet list item",
    supportingText: "This is a supporting text",
    leadingElement: <Thumb size={80} />,
  },
};

export const ListItemWithTrailingElement: Story = {
  args: {
    headline: "My sweet list item",
    supportingText: "This is a supporting text",
    leadingElement: <Thumb size={80} />,
    trailingElement: <Checkbox aria-label="Select" />,
  },
};

export const SelectedListItem: Story = {
  args: {
    headline: "Selected list item",
    isSelected: true,
  },
};

export const SelectedListItemWithLeadingImage: Story = {
  args: {
    headline: "Selected list item with image",
    isSelected: true,
    leadingElement: <Thumb size={40} />,
  },
};

export const SelectedListItemWithSupportingText: Story = {
  args: {
    headline: "Selected list item with supporting text",
    supportingText: "This is a supporting text for a selected item",
    isSelected: true,
    leadingElement: <Thumb size={80} />,
  },
};

export const SelectedListItemWithTrailingElement: Story = {
  args: {
    headline: "Selected list item with trailing element",
    supportingText: "This is a supporting text for a selected item",
    isSelected: true,
    leadingElement: <Thumb size={80} />,
    trailingElement: <Checkbox aria-label="Select" isSelected />,
  },
};
