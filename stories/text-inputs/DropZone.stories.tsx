import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { isFileDropItem } from "react-aria-components";

import Button from "@french-tech-homies/design-system/components/Button";
import { DropZone } from "@french-tech-homies/design-system/components/DropZone";
import { FileTrigger } from "@french-tech-homies/design-system/components/FileTrigger";
import { UploadIcon } from "@french-tech-homies/design-system/icons";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * An area files are dropped onto, and `FileTrigger`, the button that opens
 * the file chooser: dropping is never the only way in. Not Material 3
 * components: the zone is an outlined card's container with a dashed
 * outline, and takes `primary` while files are over it.
 */
const meta = {
  title: "MD3/Text inputs/DropZone",
  component: DropZone,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

function Upload({ isDisabled = false }: { isDisabled?: boolean }) {
  const [names, setNames] = useState<string[]>([]);
  const add = (files: File[]) =>
    setNames((had) => [...had, ...files.map((file) => file.name)]);
  return (
    <div className="flex w-96 flex-col gap-3">
      <DropZone
        aria-label="Upload files"
        isDisabled={isDisabled}
        onDrop={async (e) => {
          add(
            await Promise.all(
              e.items.filter(isFileDropItem).map((item) => item.getFile()),
            ),
          );
        }}
      >
        <UploadIcon size={40} />
        <span>Drop files here, or</span>
        <FileTrigger
          allowsMultiple
          onSelect={(list) => add([...(list ?? [])])}
        >
          <Button variant="tonal" isDisabled={isDisabled}>
            Choose files
          </Button>
        </FileTrigger>
      </DropZone>
      <Body className="text-on-surface-variant">
        {names.length ? names.join(", ") : "No file yet."}
      </Body>
    </div>
  );
}

/** The box that is drawn, with the button that is the other way in. */
export const Outlined: Story = { render: () => <Upload /> };

/** Disabled: 38%, and it takes nothing. */
export const Disabled: Story = {
  render: () => <Upload isDisabled />,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // MD3's disabled content is drawn at 38 %, which never reaches
            // 4.5:1. WCAG 1.4.3 exempts inactive components.
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
};

/** `variant="bare"`: an area with a look of its own, here a list. It shows
 *  nothing at rest, and the `primary` outline and tint while files are over
 *  it. The button stands outside it. */
export const BareOverAList: Story = {
  render: function Render() {
    const [names, setNames] = useState(["Roadmap.pdf", "Budget.xlsx"]);
    const add = (files: File[]) =>
      setNames((had) => [...had, ...files.map((file) => file.name)]);
    return (
      <div className="flex w-96 flex-col gap-3">
        <FileTrigger
          allowsMultiple
          onSelect={(list) => add([...(list ?? [])])}
        >
          <Button variant="tonal" icon={UploadIcon} className="self-start">
            Upload
          </Button>
        </FileTrigger>
        <DropZone
          variant="bare"
          aria-label="Files: drop to upload"
          className="rounded-shape-medium"
          onDrop={async (e) => {
            add(
              await Promise.all(
                e.items.filter(isFileDropItem).map((item) => item.getFile()),
              ),
            );
          }}
        >
          <ul className="divide-outline-variant text-on-surface divide-y">
            {names.map((name) => (
              <li key={name} className="px-4 py-3">
                <Body component="span">{name}</Body>
              </li>
            ))}
          </ul>
        </DropZone>
      </div>
    );
  },
};
