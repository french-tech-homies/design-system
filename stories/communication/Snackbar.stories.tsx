import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import Button from "@french-tech-homies/design-system/components/Button";
import {
  Snackbar,
  SnackbarRegion,
  snackbar,
  type SnackbarContent,
} from "@french-tech-homies/design-system/components/Snackbar";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * MD3 snackbar on React Aria `Toast`: a brief message about a process the
 * app performed, one at a time at the bottom of the screen. Call
 * `snackbar(text, options)` from anywhere — the queue lives outside React —
 * and render `<SnackbarRegion />` once at the root. Without an action it
 * auto-dismisses after 5 s (paused while hovered or focused); with one it
 * stays until acted on. The static stories below render a `Snackbar` on its
 * own to show the anatomy; the live ones queue real snackbars into the
 * region.
 */
const meta = {
  title: "MD3/Communication/Snackbar",
  component: Snackbar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A static snackbar, outside the queue — anatomy only. */
function queued(content: SnackbarContent, key = "static") {
  return { key, content };
}

export const SingleLine: Story = {
  args: { toast: queued({ text: "Menu successfully updated" }) },
};

export const WithAction: Story = {
  args: {
    toast: queued({
      text: "Email archived",
      action: { label: "Undo", onPress: () => undefined },
    }),
  },
};

export const TwoLinesWithAction: Story = {
  args: {
    toast: queued({
      text: "Can't send photo. Retry in 5 seconds, or check your connection and try again.",
      action: { label: "Retry", onPress: () => undefined },
    }),
    className: "w-[344px]",
  },
};

export const WithClose: Story = {
  args: {
    toast: queued({ text: "Failed to copy link", close: true }),
  },
};

export const ActionAndClose: Story = {
  args: {
    toast: queued({
      text: "Table 12 deleted",
      action: { label: "Undo", onPress: () => undefined },
      close: true,
    }),
  },
};

function LiveDemo() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <Body size="medium" className="text-on-surface-variant max-w-md">
        Each button queues a real snackbar into the region fixed at the bottom
        of the viewport. A new message replaces the one on screen; hover or
        focus pauses the timer; Esc dismisses the focused snackbar.
      </Body>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="tonal"
          onPress={() => {
            setSaved(true);
            snackbar("Changes saved", { onClose: () => setSaved(false) });
          }}
        >
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          variant="tonal"
          onPress={() =>
            snackbar("Email archived", {
              action: { label: "Undo", onPress: () => snackbar("Restored") },
            })
          }
        >
          Archive (with action)
        </Button>
        <Button
          variant="tonal"
          onPress={() => snackbar("Failed to copy link", { close: true })}
        >
          Error (with close)
        </Button>
        <Button
          variant="tonal"
          onPress={() =>
            snackbar(
              "Can't send photo. Retry in 5 seconds, or check your connection and try again.",
              { timeout: null },
            )
          }
        >
          Two lines, persistent
        </Button>
      </div>
      <SnackbarRegion />
    </div>
  );
}

export const Live: Story = {
  parameters: { layout: "padded" },
  args: { toast: queued({ text: "" }) },
  render: () => <LiveDemo />,
};
