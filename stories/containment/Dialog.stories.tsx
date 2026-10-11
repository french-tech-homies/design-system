import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Body, Headline } from "@french-tech-homies/design-system/primitives/Typography";
import Button from "@french-tech-homies/design-system/components/Button";
import { Dialog } from "@french-tech-homies/design-system/components/Dialog";
import { ModalDialog } from "@french-tech-homies/design-system/components/ModalDialog";

const meta = {
  title: "MD3/Containment/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Dialog Title",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultDialog: Story = {
  args: {
    title: "Dialog Title",
    supportingText: "Dialog Supporting Text",
    actions: {
      confirm: { label: "Confirm" },
      cancel: { label: "Cancel" },
    },
  },
};

export const DialogWithCustomActions: Story = {
  args: {
    title: "Dialog Title",
    supportingText: "Dialog Supporting Text",
    actions: (
      <>
        <Button variant="text">Close</Button>
        <Button>Confirm</Button>
      </>
    ),
  },
};

export const DialogWithCustomChildren: Story = {
  args: {
    title: "Dialog Title",
    children: (
      <div className="flex flex-col gap-4">
        <Headline>Dialog Title</Headline>
        <Body className="text-on-surface-variant">Dialog Supporting Text</Body>
        <Button variant="text">Some action</Button>
      </div>
    ),
  },
};

export const DialogWithIconInTitle: Story = {
  args: {
    title: "Delete Item",
    icon: Trash2,
    supportingText: "Are you sure you want to delete this item?",
    actions: (
      <>
        <Button variant="text">Cancel</Button>
        <Button>Delete</Button>
      </>
    ),
  },
};

const DefaultModalDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Dialog</Button>
      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Delete Item"
        icon={Trash2}
        supportingText="Are you sure you want to delete this item?"
        actions={{
          confirm: {
            label: "Delete",
            onPress: () => {
              setIsOpen(false);
            },
          },
          cancel: {
            label: "Cancel",
            onPress: () => {
              setIsOpen(false);
            },
          },
        }}
      />
    </>
  );
};

export const DefaultModalDialog: Story = {
  render: () => <DefaultModalDialogExample />,
};

const ModalWithActionLabelsExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>
        Open Dialog with Action Labels
      </Button>
      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        icon={Trash2}
        supportingText="Are you sure you want to perform this action?"
        actions={{
          confirm: {
            label: "Confirm",
            onPress: () => {
              setIsOpen(false);
            },
          },
          cancel: {
            label: "Cancel",
            onPress: () => {
              setIsOpen(false);
            },
          },
        }}
      />
    </>
  );
};

export const ModalWithActionLabels: Story = {
  render: () => <ModalWithActionLabelsExample />,
};

const FullscreenModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Fullscreen Dialog</Button>
      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="fullscreen"
        title="Fullscreen Dialog"
        supportingText="This is a fullscreen dialog example."
        actions={{
          confirm: {
            label: "Confirm",
            onPress: () => {
              setIsOpen(false);
            },
          },
          cancel: {
            label: "Cancel",
            onPress: () => {
              setIsOpen(false);
            },
          },
        }}
      />
    </>
  );
};

export const FullscreenModal: Story = {
  render: () => <FullscreenModalExample />,
};

const AlertModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Delete your account</Button>
      <ModalDialog
        role="alertdialog"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Delete your account?"
        icon={Trash2}
        supportingText="Every venue you own, its menus and its printed codes go with it. This cannot be undone."
        actions={
          <>
            <Button variant="text" onPress={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              onPress={() => setIsOpen(false)}
            >
              Delete
            </Button>
          </>
        }
      />
    </>
  );
};

/**
 * `role="alertdialog"` for the interruption that has to be answered before
 * anything else happens. MD3 has no separate alert dialog — it is the basic
 * dialog with an alert role — so this is a `role`, not a variant. It also
 * turns light-dismiss off in `ModalDialog`: clicking the scrim must not count
 * as an answer. Escape still closes, which is the platform contract for a
 * modal. The destructive action stays an outlined error button, the app's
 * existing convention; the kit defines no destructive variant.
 */
export const AlertDialog: Story = {
  render: () => <AlertModalExample />,
};
