import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import { ImageField } from "@french-tech-homies/design-system/components/ImageField";
import { Body } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Image upload field: a drop zone with a tonal "Choose image" button (React
 * Aria `DropZone` + `FileTrigger`) that turns into a preview with a remove
 * icon button and a "Replace" button once an image is picked. The value is
 * the image as a data URL — or the stored image's URL when editing — and
 * files over `maxSize` or outside `acceptedFileTypes` are rejected inline.
 */
const meta = {
  title: "MD3/Text inputs/Image field",
  component: ImageField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    aspectRatio: { control: "select", options: ["16:9", "4:3", "1:1", "auto"] },
  },
  args: { label: "Photo", className: "w-96" },
} satisfies Meta<typeof ImageField>;

export default meta;
type Story = StoryObj<typeof meta>;

// A small inline SVG stands in for a picked image.
const sample =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f6bd60"/><stop offset="1" stop-color="#f28482"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="240" cy="60" r="28" fill="#fff8" /><path d="M0 180 L90 90 L150 140 L200 110 L320 180 Z" fill="#84a59d"/></svg>`,
  );

export const Empty: Story = {
  args: {
    supportingText: "PNG, JPEG or WebP, up to 2 MB",
    maxSize: 2 * 1024 * 1024,
  },
};

export const WithImage: Story = {
  args: {
    defaultValue: sample,
    previewAlt: "Sunset over hills",
    supportingText: "Shown on the storefront menu card",
  },
};

export const Square: Story = {
  args: { aspectRatio: "1:1", className: "w-64", defaultValue: sample },
};

export const Required: Story = {
  args: { isRequired: true, supportingText: "A photo is required" },
};

export const Error: Story = {
  args: { isInvalid: true, errorMessage: "Add a photo to publish the product" },
};

export const Disabled: Story = {
  args: { defaultValue: sample, isDisabled: true },
  parameters: {
    a11y: {
      config: {
        // The disabled label is on-surface at 38 %, which is MD3's disabled
        // content treatment and never reaches 4.5:1 by construction. WCAG
        // 1.4.3 exempts text that is part of an inactive user interface
        // component. Every enabled state of this field is checked by the
        // other stories.
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
};

function Controlled() {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<File>();
  return (
    <div className="flex w-96 flex-col gap-4">
      <ImageField
        label="Photo"
        value={value ?? ""}
        onChange={(next, picked) => {
          setValue(next);
          setFile(picked);
        }}
        maxSize={2 * 1024 * 1024}
        supportingText="Pick a file: the value becomes a data URL"
      />
      <Body size="small" className="text-on-surface-variant break-all">
        {value
          ? `value: ${value.slice(0, 40)}… (${value.length} chars, ${file?.type ?? "url"})`
          : "value: undefined (empty)"}
      </Body>
    </div>
  );
}

export const ControlledValue: Story = { render: () => <Controlled /> };
