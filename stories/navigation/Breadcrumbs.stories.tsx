import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import {
  Breadcrumb,
  Breadcrumbs,
} from "@french-tech-homies/design-system/components/Breadcrumbs";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The path to the page a person is on: a link to each level above it, then
 * the page itself. Not a Material 3 component: its links are the kit's
 * `Link`, in body-medium on `on-surface-variant`, and the current page is in
 * `on-surface`.
 */
const meta = {
  title: "MD3/Navigation/Breadcrumbs",
  component: Breadcrumbs,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three levels: two links and the page. */
export const Path: Story = {
  render: () => (
    <nav aria-label="Path">
      <Breadcrumbs>
        <Breadcrumb href="#drive">Team drive</Breadcrumb>
        <Breadcrumb href="#finance">Finance</Breadcrumb>
        <Breadcrumb>Invoices</Breadcrumb>
      </Breadcrumbs>
    </nav>
  ),
};

/** A path that is longer than its line wraps. */
export const LongPath: Story = {
  render: () => (
    <nav aria-label="Path" className="w-72">
      <Breadcrumbs>
        <Breadcrumb href="#drive">Team drive</Breadcrumb>
        <Breadcrumb href="#finance">Finance</Breadcrumb>
        <Breadcrumb href="#invoices">Invoices</Breadcrumb>
        <Breadcrumb href="#2026">2026</Breadcrumb>
        <Breadcrumb>November, sent</Breadcrumb>
      </Breadcrumbs>
    </nav>
  ),
};

const levels = [
  { id: "root", name: "Team drive" },
  { id: "design", name: "Design" },
  { id: "brand", name: "Brand" },
  { id: "logos", name: "Logos" },
];

/** A path that is data, and that changes state instead of the address:
 *  `items`, a function, and `onAction` with the `id` of the level pressed. */
export const FromData: Story = {
  render: function Render() {
    const [depth, setDepth] = useState(levels.length);
    const path = levels.slice(0, depth);
    return (
      <div className="flex flex-col gap-2">
        <nav aria-label="Folder">
          <Breadcrumbs
            items={path}
            onAction={(id) =>
              setDepth(levels.findIndex((level) => level.id === id) + 1)
            }
          >
            {(level) => <Breadcrumb>{level.name}</Breadcrumb>}
          </Breadcrumbs>
        </nav>
        <Body className="text-on-surface-variant">
          In “{path[path.length - 1]?.name}”. Press a level to go up to it.
        </Body>
      </div>
    );
  },
};

/** Right to left: the path runs from the right and the chevrons are
 *  mirrored. */
export const RightToLeft: Story = {
  render: () => (
    <nav aria-label="المسار" dir="rtl">
      <Breadcrumbs>
        <Breadcrumb href="#drive">الملفات</Breadcrumb>
        <Breadcrumb href="#finance">المالية</Breadcrumb>
        <Breadcrumb>الفواتير</Breadcrumb>
      </Breadcrumbs>
    </nav>
  ),
};
