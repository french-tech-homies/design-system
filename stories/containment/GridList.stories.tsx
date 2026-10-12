import type { Meta, StoryObj } from "@storybook/react-vite";
import { Star, Trash2 } from "lucide-react";
import React from "react";

import {
  GridList,
  GridListItem,
} from "@french-tech-homies/design-system/components/GridList";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import ListItem from "@french-tech-homies/design-system/components/ListItem";
import { Label } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * `GridList` is the React Aria collection (keyboard navigation, selection,
 * drag) and `ListItem` the Material row inside each `GridListItem`. State
 * layers on the row are driven by the item's `group/grid-list-item`.
 */
const meta = {
  title: "MD3/Containment/List",
  component: GridList,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-surface-container-low rounded-shape-large w-[420px] py-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GridList>;

export default meta;
type Story = StoryObj<typeof GridList>;

const tables = [
  { id: "a1", name: "Table A1", supportingText: "Two orders in progress" },
  { id: "a2", name: "Table A2", supportingText: "Free" },
  { id: "a3", name: "Table A3", supportingText: "Waiting for payment" },
  { id: "b1", name: "Table B1", supportingText: "Free" },
];

function Avatar({ text }: { text: string }) {
  return (
    <div className="bg-primary-container text-on-primary-container rounded-shape-full flex h-10 w-10 items-center justify-center">
      <Label size="large">{text}</Label>
    </div>
  );
}

export const SingleSelection: Story = {
  render: () => (
    <GridList aria-label="Tables" items={tables} selectionMode="single">
      {(item) => (
        <GridListItem textValue={item.name}>
          {({ isSelected }) => (
            <ListItem
              headline={item.name}
              supportingText={item.supportingText}
              leadingElement={<Avatar text={item.id.toUpperCase()} />}
              isSelected={isSelected}
            />
          )}
        </GridListItem>
      )}
    </GridList>
  ),
};

export const MultipleSelection: Story = {
  render: () => (
    <GridList
      aria-label="Tables"
      items={tables}
      selectionMode="multiple"
      defaultSelectedKeys={["a1", "a3"]}
    >
      {(item) => (
        <GridListItem textValue={item.name}>
          {({ isSelected }) => (
            <ListItem
              headline={item.name}
              supportingText={item.supportingText}
              leadingElement={<Avatar text={item.id.toUpperCase()} />}
              trailingElement={
                <Label size="medium" className="text-on-surface-variant">
                  {isSelected ? "Selected" : ""}
                </Label>
              }
              isSelected={isSelected}
            />
          )}
        </GridListItem>
      )}
    </GridList>
  ),
};

export const WithActions: Story = {
  render: () => (
    <GridList aria-label="Tables" items={tables}>
      {(item) => (
        <GridListItem textValue={item.name}>
          <ListItem
            headline={item.name}
            supportingText={item.supportingText}
            trailingElement={
              <div className="flex">
                <IconButton
                  aria-label="Favourite"
                  icon={Star}
                  isToggle
                  variant="standard"
                />
                <IconButton
                  variant="standard"
                  aria-label="Delete"
                  icon={Trash2}
                />
              </div>
            }
          />
        </GridListItem>
      )}
    </GridList>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <GridList
      aria-label="Tables"
      items={tables}
      selectionMode="single"
      disabledKeys={["a2", "b1"]}
    >
      {(item) => (
        <GridListItem textValue={item.name}>
          {({ isSelected, isDisabled }) => (
            <ListItem
              headline={item.name}
              supportingText={isDisabled ? "Closed" : item.supportingText}
              isSelected={isSelected}
              isDisabled={isDisabled}
            />
          )}
        </GridListItem>
      )}
    </GridList>
  ),
};
