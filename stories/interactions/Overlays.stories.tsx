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
import BottomSheet, {
  type BottomSheetProps,
} from "@french-tech-homies/design-system/components/BottomSheet";
import {
  Focusable,
  Tooltip,
  TooltipTrigger,
} from "@french-tech-homies/design-system/components/Tooltip";
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
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );

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
    await expect(canvas.queryByRole("button", { name: /apply/i })).toBeNull();

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

/**
 * A tooltip appears on keyboard focus, not only on hover, and it is Material's
 * by default: plain, described to its trigger, with no arrow.
 */
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

    await expect(screen.queryByText("Scans in the last 7 days")).toBeNull();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(
      await screen.findByText("Scans in the last 7 days"),
    ).toBeVisible();

    const tooltip = screen.getByRole("tooltip");
    await expect(tooltip).toHaveAttribute("data-slot", "tooltip");
    await expect(tooltip).toHaveAttribute("data-variant", "plain");
    await expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
    await expect(
      tooltip.querySelector('[data-slot="tooltip-arrow"]'),
    ).toBeNull();

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByText("Scans in the last 7 days")).toBeNull(),
    );
  },
};

/** `showArrow` draws the arrow Material leaves out, once. */
export const TooltipArrowWhenAsked: Story = {
  render: () => (
    <TooltipTrigger delay={0}>
      <Button>Hover me</Button>
      <Tooltip showArrow classNames={{ arrow: "fill-primary" }}>
        Scans in the last 7 days
      </Tooltip>
    </TooltipTrigger>
  ),
  play: async () => {
    await userEvent.tab();
    const tooltip = await screen.findByRole("tooltip");
    const arrows = tooltip.querySelectorAll('[data-slot="tooltip-arrow"]');
    await expect(arrows).toHaveLength(1);
    await expect(arrows[0]).toHaveClass("fill-primary");
    await userEvent.keyboard("{Escape}");
  },
};

/**
 * The arrow is joined to its tooltip on every side: the base of the triangle
 * is on the tooltip's edge that faces the trigger, and its tip points 4
 * pixels out, towards the trigger.
 */
export const TooltipArrowJoinsOnEverySide: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-40 gap-y-16 p-16">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <TooltipTrigger key={side} isOpen>
          <Button>{side}</Button>
          <Tooltip placement={side} showArrow offset={8}>
            On the {side}
          </Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  ),
  play: async () => {
    const tooltips = await screen.findAllByRole("tooltip");
    await expect(tooltips).toHaveLength(4);

    for (const tooltip of tooltips) {
      // The side it landed on, and the edge of the tooltip facing the trigger.
      const side = tooltip.getAttribute("data-placement") as
        "top" | "bottom" | "left" | "right";
      const facing = {
        top: "bottom",
        bottom: "top",
        left: "right",
        right: "left",
      }[side] as "top" | "bottom" | "left" | "right";
      const triangle = tooltip.querySelector(
        '[data-slot="tooltip-arrow"] path',
      )!;
      // Read once the entering animation has ended: the gap between the
      // tooltip's edge and the triangle's base, and how far the tip reaches.
      const joint = () => {
        const box = tooltip.getBoundingClientRect();
        const arrow = triangle.getBoundingClientRect();
        return {
          gap: Math.round(Math.abs(arrow[side] - box[facing]) * 2) / 2,
          reach: Math.round(Math.abs(arrow[facing] - box[facing])),
        };
      };
      await waitFor(() => expect(joint()).toEqual({ gap: 0, reach: 4 }));
    }
  },
};

/**
 * `variant="rich"` is honoured for a tooltip handed nothing but a string, and
 * `variant="plain"` for one handed a supporting text: the variant asked for
 * wins over the one the content would suggest. A part's class lands on its
 * part.
 */
export const TooltipVariantAskedForIsDrawn: Story = {
  render: () => (
    <div className="flex gap-4">
      <TooltipTrigger delay={0}>
        <Button>Rich</Button>
        <Tooltip variant="rich" classNames={{ content: "italic" }}>
          Scans in the last 7 days
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0}>
        <Button>Plain</Button>
        <Tooltip variant="plain" supportingText="Last 7 days" />
      </TooltipTrigger>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Rich" })).toHaveFocus();
    const rich = await screen.findByRole("tooltip");
    await expect(rich).toHaveAttribute("data-variant", "rich");
    await expect(rich).toHaveTextContent("Scans in the last 7 days");
    const content = rich.querySelector('[data-slot="tooltip-content"]');
    await expect(content).toHaveClass("italic");

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Plain" })).toHaveFocus();
    await waitFor(() =>
      expect(screen.getByRole("tooltip")).toHaveAttribute(
        "data-variant",
        "plain",
      ),
    );
    await expect(screen.getByRole("tooltip")).toHaveTextContent("Last 7 days");
    await userEvent.keyboard("{Escape}");
  },
};

/**
 * A corner placement places: `bottom start` puts the tooltip under its
 * trigger with their start edges on one line. The trigger is wider than the
 * tooltip, so a centred tooltip would sit well inside it.
 */
export const TooltipCornerPlacement: Story = {
  render: () => (
    // Padded: an overlay keeps 12 pixels from the window's edge, which would
    // move a tooltip whose trigger starts at that edge.
    <div className="p-10">
      <TooltipTrigger delay={0}>
        <Button className="w-64">A trigger wider than its tooltip</Button>
        <Tooltip placement="bottom start">Start</Tooltip>
      </TooltipTrigger>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");

    await userEvent.tab();
    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() =>
      expect(tooltip).toHaveAttribute("data-placement", "bottom"),
    );
    // Positioned a frame after it mounts: read the boxes once it has landed.
    const edges = () => {
      const t = trigger.getBoundingClientRect();
      const o = tooltip.getBoundingClientRect();
      return {
        gap: Math.round(o.top - t.bottom),
        start: Math.round(Math.abs(o.left - t.left)),
      };
    };
    // Under the trigger, at Material's 4dp for a plain tooltip. Both are read
    // together, once the entering slide and zoom have ended.
    await waitFor(() => expect(edges()).toEqual({ gap: 4, start: 0 }));
    await userEvent.keyboard("{Escape}");
  },
};

/**
 * A trigger that is no button opens its tooltip from the keyboard, through
 * `Focusable`. The tooltip is rich and holds a headline over rows of label
 * and value: it is read, not operated. It is described to its trigger, holds
 * nothing that takes focus, and Tab passes over it to the next control.
 */
export const TooltipOnFocusableReadsRows: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <TooltipTrigger delay={0} closeDelay={0}>
        <Focusable>
          <span role="img" aria-label="1,284 visits this week" tabIndex={0}>
            1,284
          </span>
        </Focusable>
        <Tooltip variant="rich" headline="Visits this week">
          <dl>
            <dt>Search</dt>
            <dd>812</dd>
            <dt>Direct</dt>
            <dd>301</dd>
          </dl>
        </Tooltip>
      </TooltipTrigger>
      <Button>Next</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("img", { name: /1,284 visits/i });

    await expect(screen.queryByRole("tooltip")).toBeNull();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    const tooltip = await screen.findByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveAttribute("data-variant", "rich");
    await expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    // The headline, then the rows, in that order.
    const headline = tooltip.querySelector('[data-slot="tooltip-headline"]');
    const rows = tooltip.querySelector("dl");
    await expect(headline).toHaveTextContent("Visits this week");
    await expect(within(tooltip).getAllByRole("term")).toHaveLength(2);
    await expect(within(tooltip).getAllByRole("definition")).toHaveLength(2);
    await expect(
      headline!.compareDocumentPosition(rows!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // Material's default for a rich tooltip: under its trigger.
    await waitFor(() =>
      expect(tooltip).toHaveAttribute("data-placement", "bottom"),
    );

    // Read, not operated: nothing in it takes focus, and focus stays out.
    await expect(
      tooltip.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).toHaveLength(0);
    await expect(tooltip.contains(document.activeElement)).toBe(false);

    // Escape closes it and leaves focus on the trigger.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    await expect(trigger).toHaveFocus();

    // Tab goes to the control after the trigger, never into a tooltip.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Next" })).toHaveFocus();
    await expect(screen.queryByRole("tooltip")).toBeNull();
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
    const trigger = canvas.getByRole("button", {
      name: /delete your account/i,
    });

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

    await expect(
      screen.queryByRole("button", { name: /margherita/i }),
    ).toBeNull();

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

function BottomSheetHarness(props: Partial<BottomSheetProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Photo actions</Button>
      <BottomSheet
        variant="modal"
        title="Photo actions"
        {...props}
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <Button variant="text" onPress={() => setOpen(false)}>
          Share
        </Button>
      </BottomSheet>
    </>
  );
}

const bottomSheet = () =>
  document.querySelector<HTMLElement>('[data-slot="bottom-sheet"]');

/**
 * Material's keyboard table for a bottom sheet: Tab lands on the drag handle,
 * a button with a name, and Space or Enter toggles between the heights. The
 * press is also the single-pointer alternative to the drag.
 */
export const BottomSheetHandleIsFirstAndCycles: Story = {
  render: () => <BottomSheetHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /photo actions/i }),
    );

    const dialog = await screen.findByRole("dialog", { name: "Photo actions" });
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    await expect(dialog).toHaveAttribute("data-height", "partial");

    await userEvent.tab();
    const handle = within(dialog).getByRole("button", { name: "Drag handle" });
    await expect(handle).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-height", "expanded"),
    );
    // Expanded, the sheet offers a way out, as Material asks of a full-screen one.
    await expect(
      within(dialog).getByRole("button", { name: "Close" }),
    ).toBeVisible();

    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-height", "partial"),
    );
    await expect(
      within(dialog).queryByRole("button", { name: "Close" }),
    ).toBeNull();

    // A pointer press does the same.
    await userEvent.click(handle);
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-height", "expanded"),
    );
  },
};

/** Escape and the scrim close the modal sheet, and focus returns; a sheet
    that is not dismissable ignores the scrim. */
export const BottomSheetEscapeAndScrimClose: Story = {
  render: () => (
    <div className="flex gap-4">
      <BottomSheetHarness />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /photo actions/i });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Photo actions" });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.click(trigger);
    await screen.findByRole("dialog", { name: "Photo actions" });
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="bottom-sheet-overlay"]',
    );
    await expect(overlay).not.toBeNull();
    await userEvent.click(overlay!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const BottomSheetNotDismissableKeepsScrim: Story = {
  render: () => <BottomSheetHarness modalProps={{ isDismissable: false }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /photo actions/i }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Photo actions" });

    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="bottom-sheet-overlay"]',
    );
    await userEvent.click(overlay!);
    await expect(
      screen.getByRole("dialog", { name: "Photo actions" }),
    ).toBeVisible();

    // An action in the sheet still closes it.
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Share" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

/** With one height there is nothing to cycle, so the handle closes the sheet. */
export const BottomSheetSingleHeightHandleCloses: Story = {
  render: () => <BottomSheetHarness heights={["partial"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /photo actions/i });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Photo actions" });

    await userEvent.tab();
    await expect(
      within(dialog).getByRole("button", { name: "Drag handle" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** The modal sheet is a dialog named by its title, or by `aria-label` alone. */
export const BottomSheetNamedDialog: Story = {
  render: () => (
    <div className="flex gap-4">
      <BottomSheetHarness />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /photo actions/i }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Photo actions" });
    await expect(dialog).toHaveAttribute("data-slot", "bottom-sheet");
    await expect(dialog).toHaveAttribute("data-variant", "modal");
    await expect(bottomSheet()).toBe(dialog);
  },
};

export const BottomSheetNamedByAriaLabel: Story = {
  render: () => (
    <BottomSheetHarness title={undefined} aria-label="Sort files" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /photo actions/i }),
    );
    await expect(
      await screen.findByRole("dialog", { name: "Sort files" }),
    ).toBeVisible();
  },
};

function StandardBottomSheetHarness() {
  const [open, setOpen] = useState(false);
  const [presses, setPresses] = useState(0);
  return (
    <div className="relative h-80 w-[480px] overflow-hidden">
      <div className="flex gap-2">
        <Button onPress={() => setOpen((v) => !v)}>Toggle player</Button>
        <Button variant="outlined" onPress={() => setPresses((n) => n + 1)}>
          Next album ({presses})
        </Button>
      </div>
      <BottomSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        aria-label="Now playing"
      >
        <Button variant="text">Pause</Button>
      </BottomSheet>
    </div>
  );
}

/**
 * A standard sheet is not modal: open, the page behind stays reachable by
 * Tab and pressable. Closed, it is still mounted (it slides), so nothing in
 * it may be reachable.
 */
export const BottomSheetStandardIsNotModal: Story = {
  render: () => <StandardBottomSheetHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: /toggle player/i });
    const next = canvas.getByRole("button", { name: /next album/i });

    // Closed: inert, so Tab goes past it and finds nothing inside.
    await expect(bottomSheet()).toHaveAttribute("inert");
    await expect(
      canvas.queryByRole("button", { name: "Drag handle" }),
    ).toBeNull();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.tab();
    await expect(next).toHaveFocus();
    await userEvent.tab();
    await expect(bottomSheet()!.contains(document.activeElement)).toBe(false);

    // Open: the page behind is still usable, and the sheet joins the order.
    await userEvent.click(toggle);
    await waitFor(() => expect(bottomSheet()).not.toHaveAttribute("inert"));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await userEvent.click(next);
    await expect(next).toHaveTextContent("Next album (1)");

    next.focus();
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Drag handle" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(bottomSheet()).toHaveAttribute("data-height", "expanded"),
    );
    // Expanded, a standard sheet offers a collapse button rather than a close.
    await userEvent.click(canvas.getByRole("button", { name: "Collapse" }));
    await waitFor(() =>
      expect(bottomSheet()).toHaveAttribute("data-height", "partial"),
    );
  },
};
