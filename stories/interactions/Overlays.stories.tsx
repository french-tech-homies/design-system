import type { Meta, StoryObj } from "@storybook/react-vite";
import { Settings, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import Button from "@french-tech-homies/design-system/components/Button";
import { Dialog } from "@french-tech-homies/design-system/components/Dialog";
import { Menu } from "@french-tech-homies/design-system/components/Menu";
import Modal from "@french-tech-homies/design-system/components/Modal";
import { ModalDialog } from "@french-tech-homies/design-system/components/ModalDialog";
import SideSheet from "@french-tech-homies/design-system/components/SideSheet";
import { Tooltip, TooltipTrigger } from "@french-tech-homies/design-system/components/Tooltip";
import {
  PreviewCard,
  PreviewTrigger,
} from "@french-tech-homies/design-system/components/PreviewTrigger";

/**
 * Behaviour tests for everything that opens over the page. What matters here
 * is the contract every overlay owes a keyboard user: Escape closes it, focus
 * goes in and comes back, and nothing that is visually gone stays reachable
 * by Tab. See `stories/interactions/Fields.stories.tsx` for why these live
 * apart from the component stories.
 */
const meta = {
  title: "MD3/Interactions/Overlays",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Delete table</Button>
      <ModalDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete this table?"
        supportingText="The QR code printed for it stops working."
        actions={{
          cancel: { label: "Cancel", onPress: () => setOpen(false) },
          confirm: { label: "Delete", onPress: () => setOpen(false) },
        }}
      />
    </>
  );
}

/** A modal dialog takes focus, traps it, closes on Escape, and gives it back. */
export const ModalDialogEscapeReturnsFocus: Story = {
  render: () => <DialogHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /delete table/i });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveTextContent("Delete this table?");
    // Focus moved into the dialog.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** The dialog's own actions close it, and the trigger gets focus back. */
export const ModalDialogActionCloses: Story = {
  render: () => <DialogHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /delete table/i });

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /cancel/i }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

function ModalHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open modal</Button>
      {/* `Modal` is the scrim + centering layer; the thing inside it is what
          carries the dialog semantics. Rendered unconditionally and driven by
          `isOpen`, which is what lets React Aria animate the exit. */}
      <Modal isOpen={open} onOpenChange={setOpen} isDismissable>
        <Dialog
          title="Scan window"
          supportingText="Scans in the last 7 days."
          actions={{
            cancel: { label: "Close", onPress: () => setOpen(false) },
            confirm: { label: "Save", onPress: () => setOpen(false) },
          }}
        />
      </Modal>
    </>
  );
}

/**
 * The overlay layer's DOM contract. `data-slot` is how a consumer targets
 * parts of the kit (conventions.md), so the scrim carries
 * `data-slot="modal-overlay"`, the panel `data-slot="modal"`, and the panel is
 * inside the scrim — closing removes both.
 *
 * The exit *animation* is deliberately not asserted: `tw-animate-css` honours
 * `prefers-reduced-motion`, which a headless run has on, so React Aria
 * unmounts immediately there and any `data-exiting` assertion would be
 * testing the runner rather than the kit.
 */
export const ModalScrimAndPanel: Story = {
  render: () => <ModalHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /open modal/i });

    await expect(
      document.querySelector('[data-slot="modal-overlay"]'),
    ).toBeNull();

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="modal-overlay"]',
    );
    const panel = document.querySelector<HTMLElement>('[data-slot="modal"]');

    await expect(overlay).not.toBeNull();
    await expect(overlay!.contains(panel)).toBe(true);
    await expect(panel!.contains(dialog)).toBe(true);

    await userEvent.click(
      within(dialog).getByRole("button", { name: /close/i }),
    );
    await waitFor(() =>
      expect(document.querySelector('[data-slot="modal-overlay"]')).toBeNull(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

function SideSheetHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-[520px] gap-4">
      <Button onPress={() => setOpen((v) => !v)}>Toggle sheet</Button>
      <SideSheet isOpen={open} title="Filters" onClose={() => setOpen(false)}>
        <Button>Apply</Button>
      </SideSheet>
    </div>
  );
}

/**
 * The standard side sheet stays mounted while collapsed — that is what
 * animates — so it must be `inert`, or its buttons stay in the tab order
 * while invisible to a screen reader. Regression guard for that fix.
 */
export const SideSheetCollapsedIsInert: Story = {
  render: () => <SideSheetHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /toggle sheet/i });

    // Closed: the Apply button exists in the DOM but is not reachable.
    const track = canvasElement.querySelector<HTMLElement>("[inert]");
    await expect(track).not.toBeNull();
    await expect(track).toHaveAttribute("aria-hidden", "true");
    await expect(
      canvas.queryByRole("button", { name: /apply/i }),
    ).toBeNull();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvasElement.contains(document.activeElement) &&
        document.activeElement?.textContent === "Apply",
    ).toBe(false);

    // Open: it becomes a real, reachable control.
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /apply/i })).toBeVisible(),
    );
    await expect(canvasElement.querySelector("[inert]")).toBeNull();
  },
};

/** Enter opens the menu, arrows move, Escape closes and focus returns. */
export const MenuKeyboardNavigation: Story = {
  render: () => (
    <Menu
      triggerButton={<Button variant="outlined">Open menu</Button>}
      items={[
        { id: "edit", label: "Edit", leadingIcon: Settings },
        { id: "delete", label: "Delete", leadingIcon: Trash2 },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /open menu/i });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const menu = await screen.findByRole("menu");
    await expect(menu).toBeVisible();
    const items = within(menu).getAllByRole("menuitem");
    await expect(items).toHaveLength(2);

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(items[1]).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** A tooltip appears on keyboard focus, not only on hover. */
export const TooltipOnFocus: Story = {
  render: () => (
    <TooltipTrigger delay={0}>
      <Button>Hover me</Button>
      <Tooltip>Scans in the last 7 days</Tooltip>
    </TooltipTrigger>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /hover me/i });

    await expect(
      screen.queryByText("Scans in the last 7 days"),
    ).toBeNull();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(
      await screen.findByText("Scans in the last 7 days"),
    ).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByText("Scans in the last 7 days")).toBeNull(),
    );
  },
};

function AlertDialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Delete your account</Button>
      <ModalDialog
        role="alertdialog"
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        supportingText="Every venue you own goes with it. This cannot be undone."
        actions={{
          cancel: { label: "Cancel", onPress: () => setOpen(false) },
          confirm: { label: "Delete", onPress: () => setOpen(false) },
        }}
      />
    </>
  );
}

/**
 * `role="alertdialog"` is what separates an interruption from an ordinary
 * dialog, and the difference has to be real: the role reaches the DOM, and
 * clicking the scrim does **not** answer the question. Escape still closes —
 * that is the platform contract for any modal, and removing it would strand a
 * keyboard user.
 */
export const AlertDialogDoesNotLightDismiss: Story = {
  render: () => <AlertDialogHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /delete your account/i });

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-role", "alertdialog");

    // A click on the scrim is not an answer.
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="modal-overlay"]',
    );
    await expect(overlay).not.toBeNull();
    await userEvent.click(overlay!);
    await expect(screen.getByRole("alertdialog")).toBeVisible();

    // The choice, or Escape, is.
    await userEvent.click(
      within(dialog).getByRole("button", { name: /cancel/i }),
    );
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** An ordinary dialog keeps light-dismiss — the contrast that makes the line
    above meaningful rather than a property of every modal. */
export const PlainDialogStillLightDismisses: Story = {
  render: () => <DialogHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /delete table/i });

    await userEvent.click(trigger);
    await screen.findByRole("dialog");

    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="modal-overlay"]',
    );
    await userEvent.click(overlay!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

/**
 * A preview opens on **focus**, not only on hover — which is the whole reason
 * to take React Aria's behaviour instead of writing pointer handlers — and its
 * content is interactive, which is what separates it from a tooltip.
 */
export const PreviewOpensOnFocus: Story = {
  render: () => (
    <p className="max-w-sm">
      Applies to{" "}
      <PreviewTrigger delay={0} closeDelay={0}>
        <Button variant="text">3 products</Button>
        <PreviewCard className="w-72">
          <Button variant="text">Margherita</Button>
        </PreviewCard>
      </PreviewTrigger>
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /3 products/i });

    await expect(screen.queryByRole("button", { name: /margherita/i })).toBeNull();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    const item = await screen.findByRole("button", { name: /margherita/i });
    await expect(item).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /margherita/i })).toBeNull(),
    );
    await expect(trigger).toHaveFocus();
  },
};
