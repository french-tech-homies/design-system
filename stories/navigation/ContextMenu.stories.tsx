import type { Meta, StoryObj } from "@storybook/react-vite";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import React from "react";

import {
  Card,
  CardContent,
} from "@french-tech-homies/design-system/components/Card";
import { ContextMenu } from "@french-tech-homies/design-system/components/ContextMenu";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { Menu } from "@french-tech-homies/design-system/components/Menu";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The kit's menu, asked for on something itself: a right click, a long
 * press, or the Menu key on what holds the focus. It is never the only way
 * to an action: each story also shows the same entries behind a button.
 */
const meta = {
  title: "MD3/Navigation/ContextMenu",
  component: ContextMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const fileActions = [
  { id: "rename", label: "Rename", leadingIcon: Pencil },
  { id: "move", label: "Move to…" },
  { id: "divider", type: "divider" as const },
  { id: "delete", label: "Delete", leadingIcon: Trash2 },
];

/** Right-click the card. The same entries are behind its icon button. */
export const OnACard: Story = {
  render: () => (
    <ContextMenu aria-label="Actions for Roadmap.pdf" items={fileActions}>
      <Card variant="outlined" className="w-72">
        <CardContent
          headline="Roadmap.pdf"
          supportingText="3 MB, edited yesterday"
          actions={
            <Menu
              items={fileActions}
              triggerButton={
                <IconButton
                  variant="standard"
                  icon={EllipsisVertical}
                  aria-label="Actions for Roadmap.pdf"
                />
              }
            />
          }
        />
      </Card>
    </ContextMenu>
  ),
};

const files = ["Roadmap.pdf", "Budget.xlsx", "Logo.svg"];

/** One area around a list: `items` as a function is given what the menu was
 *  asked for on, and names the row in its entries. */
export const OneAreaForAList: Story = {
  render: () => (
    <ContextMenu
      aria-label="File actions"
      className="w-72"
      items={(target) => {
        const name = target
          .closest<HTMLElement>("[data-file]")
          ?.getAttribute("data-file");
        return name
          ? [
              { id: "open", label: `Open ${name}` },
              { id: "rename", label: "Rename" },
              { id: "delete", label: "Delete" },
            ]
          : [];
      }}
    >
      <ul className="divide-outline-variant text-on-surface divide-y">
        {files.map((name) => (
          <li key={name} data-file={name} className="px-4 py-3">
            <Body component="span">{name}</Body>
          </li>
        ))}
      </ul>
    </ContextMenu>
  ),
};

/** An entry that does not apply stays, disabled. */
export const WithADisabledEntry: Story = {
  render: () => (
    <ContextMenu
      aria-label="Selection actions"
      items={[
        { id: "copy", label: "Copy", shortcut: "⌘C" },
        { id: "paste", label: "Paste", shortcut: "⌘V", isDisabled: true },
      ]}
    >
      <div className="border-outline-variant text-on-surface-variant text-body-medium font-body-medium rounded-shape-medium border border-dashed p-8">
        Right-click here
      </div>
    </ContextMenu>
  ),
};
