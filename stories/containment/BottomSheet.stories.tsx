import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import BottomSheet, {
  type BottomSheetProps,
} from "@french-tech-homies/design-system/components/BottomSheet";
import Button from "@french-tech-homies/design-system/components/Button";
import Divider from "@french-tech-homies/design-system/components/Divider";
import ListItem from "@french-tech-homies/design-system/components/ListItem";
import {
  Body,
  Headline,
  Title,
} from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Bottom sheets: supplementary content anchored to the bottom of the screen.
 * `standard` co-exists with the page and leaves it usable; `modal` floats over
 * a scrim and holds focus until it is dismissed. Both are
 * `surface-container-low` with extra-large top corners at elevation 1, full
 * width up to 640dp, with an optional drag handle that cycles the sheet's
 * preset heights (`partial`, `expanded`) by press, Space or Enter, or drag.
 */
const meta = {
  title: "MD3/Containment/BottomSheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof BottomSheet>;

const actions = [
  { headline: "Share", supportingText: "Send the photo to a contact" },
  { headline: "Add to album", supportingText: "Keep it with the others" },
  { headline: "Use as wallpaper" },
  { headline: "Print", supportingText: "Order a copy delivered" },
];

function ActionList() {
  return (
    <ul className="-mx-4">
      {actions.map((a) => (
        <li key={a.headline}>
          <ListItem headline={a.headline} supportingText={a.supportingText} />
        </li>
      ))}
    </ul>
  );
}

/** A page behind the sheet, so the pictures show what a sheet sits over. */
function Page({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-surface flex min-h-full flex-col gap-4 p-6">
      <Headline component="h1">Albums</Headline>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="bg-secondary-container rounded-shape-medium aspect-square"
          />
        ))}
      </div>
      {children}
    </div>
  );
}

function ModalExample(props: Partial<BottomSheetProps>) {
  const [open, setOpen] = useState(true);
  return (
    <div className="h-screen">
      <Page>
        <Button onPress={() => setOpen(true)}>Photo actions</Button>
      </Page>
      <BottomSheet
        variant="modal"
        title="Photo actions"
        {...props}
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        {props.children ?? <ActionList />}
      </BottomSheet>
    </div>
  );
}

function StandardExample() {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative h-screen overflow-hidden">
      <Page>
        <Button variant="outlined" onPress={() => setOpen((v) => !v)}>
          {open ? "Hide player" : "Show player"}
        </Button>
      </Page>
      <BottomSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        aria-label="Now playing"
      >
        <div className="flex items-center gap-4">
          <div className="bg-tertiary-container rounded-shape-small size-14 shrink-0" />
          <div className="grow">
            <Title component="h2">Harbour lights</Title>
            <Body colorRole="on-surface-variant">The Night Ferries</Body>
          </div>
          <Button variant="text">Pause</Button>
        </div>
      </BottomSheet>
    </div>
  );
}

/** Standard: a music player over the albums, the page behind still usable. */
export const Standard: Story = {
  render: () => <StandardExample />,
};

/** Modal, as it opens: at its content's height, capped at half the screen. */
export const Modal: Story = {
  render: () => <ModalExample />,
};

/** Modal, pulled up: it reaches the top margin and shows a close button. */
export const ModalExpanded: Story = {
  render: () => <ModalExample defaultHeight="expanded" />,
};

/** Lists and a divider, the content Material shows most in a sheet. */
export const WithListAndDivider: Story = {
  render: () => (
    <ModalExample title="Share">
      <div className="flex gap-4 pb-4">
        {["Ana", "Bastien", "Chloé", "Dmitri"].map((name) => (
          <div key={name} className="flex flex-col items-center gap-1">
            <div className="bg-primary-container text-on-primary-container rounded-shape-full grid size-12 place-items-center">
              {name[0]}
            </div>
            <Body size="small">{name}</Body>
          </div>
        ))}
      </div>
      <Divider />
      <ActionList />
    </ModalExample>
  ),
};

/** Without the drag handle: the header and content start at the top. */
export const WithoutDragHandle: Story = {
  render: () => <ModalExample showDragHandle={false} heights={["partial"]} />,
};

/** The modal sheet over its scrim on the dark scheme, so axe checks it there. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => <ModalExample />,
};
