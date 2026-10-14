import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Archive,
  Bold,
  Italic,
  MailOpen,
  MoreVertical,
  Pencil,
  Plus,
  Redo2,
  Trash2,
  Underline,
  Undo2,
} from "lucide-react";
import React from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import { Toolbar } from "@french-tech-homies/design-system/components/Toolbar";

/**
 * Material 3 toolbars: the actions of the current page, **docked** across
 * the bottom of the window or **floating** over the content, in the
 * **standard** or the **vibrant** colours, horizontal or vertical, and
 * optionally beside a FAB.
 *
 * Behaviour is React Aria's `Toolbar`: the `toolbar` role, the arrow keys
 * between its controls, one stop in the tab order. The colours reach the
 * kit's standard icon buttons by their slots, so the children take none.
 */
const meta = {
  title: "MD3/Navigation/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "inline-radio", options: ["docked", "floating"] },
    color: { control: "inline-radio", options: ["standard", "vibrant"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const messageActions = (
  <>
    <IconButton variant="standard" icon={Archive} aria-label="Archive" />
    <IconButton variant="standard" icon={Trash2} aria-label="Delete" />
    <IconButton variant="standard" icon={MailOpen} aria-label="Mark as unread" />
    <IconButton variant="standard" icon={MoreVertical} aria-label="More" />
  </>
);

/** Text formatting: three toggles (one selected), then undo and redo, with a
    filled button as the one emphasised action. */
const editorActions = (
  <>
    <IconButton isToggle variant="standard" icon={Bold} aria-label="Bold" defaultSelected />
    <IconButton isToggle variant="standard" icon={Italic} aria-label="Italic" />
    <IconButton isToggle variant="standard" icon={Underline} aria-label="Underline" />
    <IconButton variant="standard" icon={Undo2} aria-label="Undo" />
    <IconButton variant="standard" icon={Redo2} aria-label="Redo" isDisabled />
    <IconButton variant="filled" icon={Pencil} aria-label="Edit" />
  </>
);

/** Docked: the full width of its container, square, `surface-container`. */
export const Docked: Story = {
  args: { "aria-label": "Message", children: messageActions },
  decorators: [
    (Story) => (
      <div className="w-[412px] bg-surface">
        <Story />
      </div>
    ),
  ],
};

/** Floating, standard: as wide as its items, a pill at elevation 3. */
export const Floating: Story = {
  args: { variant: "floating", "aria-label": "Formatting", children: editorActions },
};

/** Floating, vibrant: `primary-container`, its icons `on-primary-container`,
    and a selected toggle on `surface-container`. */
export const Vibrant: Story = {
  args: {
    variant: "floating",
    color: "vibrant",
    "aria-label": "Formatting",
    children: editorActions,
  },
};

/** Vertical: 64dp wide, for the edge of a medium or expanded window. */
export const Vertical: Story = {
  args: {
    variant: "floating",
    orientation: "vertical",
    "aria-label": "Formatting",
    children: editorActions,
  },
};

/** With a FAB, 8dp after it: `secondary-container` beside a standard
    toolbar, `tertiary-container` beside a vibrant one. */
export const WithFab: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <Toolbar
        variant="floating"
        aria-label="Message"
        fab={<Button variant="fab" icon={Plus} aria-label="Compose" />}
      >
        {messageActions}
      </Toolbar>
      <Toolbar
        variant="floating"
        color="vibrant"
        aria-label="Message, vibrant"
        fab={<Button variant="fab" icon={Plus} aria-label="Compose, vibrant" />}
      >
        {messageActions}
      </Toolbar>
    </div>
  ),
};

/** The dark scheme: every configuration's roles, dark. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => (
    <div className="flex w-[412px] flex-col items-start gap-6 bg-surface p-4">
      <Toolbar aria-label="Docked">{messageActions}</Toolbar>
      <Toolbar variant="floating" aria-label="Standard">
        {editorActions}
      </Toolbar>
      <Toolbar
        variant="floating"
        color="vibrant"
        aria-label="Vibrant"
        fab={<Button variant="fab" icon={Plus} aria-label="Compose" />}
      >
        {messageActions}
      </Toolbar>
    </div>
  ),
};
