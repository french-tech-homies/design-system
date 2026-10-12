import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { type ReactNode } from "react";
import { Bell, Heart, Plus, Settings, Share2, Trash2 } from "lucide-react";

import IconButton from "@french-tech-homies/design-system/components/IconButton";

/**
 * Material's icon button: a default button or a toggle, in four colour styles
 * and five sizes. `standard` is the kit's default colour style, `small`
 * Material's default size.
 */
const meta = {
  title: "MD3/Actions/Icon button",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["standard", "filled", "tonal", "outlined"],
    },
    size: {
      control: "select",
      options: ["xsmall", "small", "medium", "large", "xlarge"],
    },
    isContained: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = ["filled", "tonal", "outlined", "standard"] as const;
const sizes = ["xsmall", "small", "medium", "large", "xlarge"] as const;

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-label-small text-on-surface-variant">{label}</span>
    </div>
  );
}

/** The button as it comes: standard, small. The controls move it. */
export const Default: Story = {
  args: {
    icon: Settings,
    "aria-label": "Settings",
  },
};

/** The four colour styles, in Material's order of emphasis. */
export const ColorStyles: Story = {
  args: { icon: Plus, "aria-label": "Add" },
  render: () => (
    <div className="flex items-start gap-6">
      {variants.map((variant) => (
        <Labelled key={variant} label={variant}>
          <IconButton variant={variant} icon={Plus} aria-label={`Add, ${variant}`} />
        </Labelled>
      ))}
    </div>
  ),
};

/** A toggle in each colour style, unselected above and selected below. */
export const Toggle: Story = {
  args: { icon: Heart, "aria-label": "Favorite" },
  render: () => (
    <div className="flex items-start gap-6">
      {variants.map((variant) => (
        <Labelled key={variant} label={variant}>
          <IconButton
            isToggle
            variant={variant}
            icon={Heart}
            aria-label={`Favorite, ${variant}`}
          />
          <IconButton
            isToggle
            defaultSelected
            variant={variant}
            icon={Heart}
            aria-label={`Favorite, ${variant}, selected`}
          />
        </Labelled>
      ))}
    </div>
  ),
};

/**
 * Material's five sizes: 32, 40, 56, 96 and 136 pixels, with a 20, 24, 24, 32
 * and 40 pixel icon. The outlined row shows the outline growing to 2 and 3
 * pixels on the two largest.
 */
export const Sizes: Story = {
  args: { icon: Bell, "aria-label": "Notifications" },
  render: () => (
    <div className="flex flex-col gap-6">
      {(["filled", "outlined"] as const).map((variant) => (
        <div key={variant} className="flex items-end gap-6">
          {sizes.map((size) => (
            <Labelled key={size} label={size}>
              <IconButton
                variant={variant}
                size={size}
                icon={Bell}
                aria-label={`Notifications, ${variant}, ${size}`}
              />
            </Labelled>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Disabled: the icon is `on-surface` at 38 % and a drawn container
 * `on-surface` at 10 %. Above, the default button; below, the selected
 * toggle.
 */
export const Disabled: Story = {
  args: { icon: Trash2, "aria-label": "Delete" },
  render: () => (
    <div className="flex items-start gap-6">
      {variants.map((variant) => (
        <Labelled key={variant} label={variant}>
          <IconButton
            isDisabled
            variant={variant}
            icon={Trash2}
            aria-label={`Delete, ${variant}`}
          />
          <IconButton
            isToggle
            isDisabled
            defaultSelected
            variant={variant}
            icon={Trash2}
            aria-label={`Delete, ${variant}, selected`}
          />
        </Labelled>
      ))}
    </div>
  ),
};

/**
 * `isContained`, which is not Material's. Above, it gives `standard` and
 * `outlined` a container; below, `isContained={false}` takes it from `filled`
 * and `tonal`.
 */
export const Contained: Story = {
  args: { icon: Share2, "aria-label": "Share" },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-6">
        <Labelled label="standard">
          <IconButton isContained icon={Share2} aria-label="Share, standard" />
        </Labelled>
        <Labelled label="outlined">
          <IconButton
            isContained
            variant="outlined"
            icon={Share2}
            aria-label="Share, outlined"
          />
        </Labelled>
      </div>
      <div className="flex items-start gap-6">
        <Labelled label="filled">
          <IconButton
            isContained={false}
            variant="filled"
            icon={Share2}
            aria-label="Share, filled"
          />
        </Labelled>
        <Labelled label="tonal">
          <IconButton
            isContained={false}
            variant="tonal"
            icon={Share2}
            aria-label="Share, tonal"
          />
        </Labelled>
      </div>
    </div>
  ),
};
