import type { Meta, StoryObj } from "@storybook/react-vite";
import { File, Folder } from "lucide-react";
import React from "react";
import { Collection } from "react-aria-components";

import { Tag } from "@french-tech-homies/design-system/components/Tag";
import {
  Tree,
  TreeItem,
} from "@french-tech-homies/design-system/components/Tree";

/**
 * A hierarchy a person opens level by level. Not a Material 3 component:
 * each row is a list item's (56dp, body-large, a 24dp icon), with 24dp of
 * indent a level. The arrow keys move between rows, Right opens a level and
 * Left closes it.
 */
const meta = {
  title: "MD3/Containment/Tree",
  component: Tree,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-surface-container-low rounded-shape-large w-80 p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Folders and files, two levels open, one row selected. */
export const FoldersAndFiles: Story = {
  render: () => (
    <Tree
      aria-label="Files"
      selectionMode="single"
      defaultExpandedKeys={["finance", "invoices"]}
      defaultSelectedKeys={["nov"]}
    >
      <TreeItem id="finance" title="Finance" icon={Folder}>
        <TreeItem id="invoices" title="Invoices" icon={Folder}>
          <TreeItem id="oct" title="October.pdf" icon={File} />
          <TreeItem id="nov" title="November.pdf" icon={File} />
        </TreeItem>
        <TreeItem id="budget" title="Budget.xlsx" icon={File} />
      </TreeItem>
      <TreeItem id="design" title="Design" icon={Folder}>
        <TreeItem id="logo" title="Logo.svg" icon={File} />
      </TreeItem>
      <TreeItem id="archive" title="Archive" icon={Folder} isDisabled />
    </Tree>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // MD3's disabled content is `on-surface` at 38 %, which never
            // reaches 4.5:1. WCAG 1.4.3 exempts inactive components.
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
};

/** `density="dense"`: 40dp rows, with something after a name. */
export const Dense: Story = {
  render: () => (
    <Tree aria-label="Sections" density="dense" defaultExpandedKeys={["guide"]}>
      <TreeItem id="guide" title="Guide">
        <TreeItem id="install" title="Installing" />
        <TreeItem
          id="theme"
          title="Theming"
          trailingElement={<Tag>New</Tag>}
        />
        <TreeItem id="update" title="Updating" />
      </TreeItem>
      <TreeItem id="reference" title="Reference">
        <TreeItem id="components" title="Components" />
      </TreeItem>
    </Tree>
  ),
};

/** Several rows selected: `selectionMode="multiple"` draws a checkbox in
 *  each row. */
export const WithCheckboxes: Story = {
  render: () => (
    <Tree
      aria-label="Categories"
      selectionMode="multiple"
      defaultExpandedKeys={["food"]}
      defaultSelectedKeys={["starters"]}
    >
      <TreeItem id="food" title="Food">
        <TreeItem id="starters" title="Starters" />
        <TreeItem id="mains" title="Mains" />
      </TreeItem>
      <TreeItem id="drinks" title="Drinks">
        <TreeItem id="wine" title="Wine" />
      </TreeItem>
    </Tree>
  ),
};

type Node = { id: string; name: string; children?: Node[] };
const drive: Node[] = [
  {
    id: "team",
    name: "Team drive",
    children: [
      { id: "eng", name: "Engineering", children: [{ id: "rfc", name: "RFCs" }] },
      { id: "mkt", name: "Marketing" },
    ],
  },
];

function Branch({ node }: { node: Node }) {
  return (
    <TreeItem id={node.id} title={node.name} icon={Folder}>
      <Collection items={node.children ?? []}>
        {(child: Node) => <Branch node={child} />}
      </Collection>
    </TreeItem>
  );
}

/** A tree that is data: `items`, a function, and React Aria's `Collection`
 *  for each row's children. */
export const FromData: Story = {
  render: () => (
    <Tree aria-label="Folders" items={drive} defaultExpandedKeys={["team"]}>
      {(node: Node) => <Branch node={node} />}
    </Tree>
  ),
};
