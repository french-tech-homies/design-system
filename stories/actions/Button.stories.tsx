import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@french-tech-homies/design-system/components/Button";
import { Download, Plus, Send, Settings, Trash2 } from "lucide-react";

const meta = {
  title: "MD3/Actions/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "outlined", "text", "elevated", "tonal"],
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: {
    children: "Filled",
    variant: "filled",
  },
};

export const FilledWithIcon: Story = {
  args: {
    children: "Download",
    variant: "filled",
    icon: Download,
  },
};

export const Outlined: Story = {
  args: {
    children: "Outlined",
    variant: "outlined",
  },
};

export const OutlinedWithIcon: Story = {
  args: {
    children: "Add",
    variant: "outlined",
    icon: Plus,
  },
};

export const Text: Story = {
  args: {
    children: "Text",
    variant: "text",
  },
};

export const TextWithIcon: Story = {
  args: {
    children: "Send",
    variant: "text",
    icon: Send,
  },
};

export const Elevated: Story = {
  args: {
    children: "Elevated",
    variant: "elevated",
  },
};

export const ElevatedWithIcon: Story = {
  args: {
    children: "Settings",
    variant: "elevated",
    icon: Settings,
  },
};

export const Tonal: Story = {
  args: {
    children: "Tonal",
    variant: "tonal",
  },
};

export const TonalWithIcon: Story = {
  args: {
    children: "Delete",
    variant: "tonal",
    icon: Trash2,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    variant: "filled",
    isDisabled: true,
  },
};

export const DisabledWithIcon: Story = {
  args: {
    children: "Disabled",
    variant: "filled",
    icon: Download,
    isDisabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading",
    variant: "filled",
    isLoading: true,
  },
};

export const Fab: Story = {
  args: {
    "aria-label": "Download",
    variant: "fab",
    icon: Download,
  },
};

export const ExtendedFab: Story = {
  args: {
    children: "Extended Fab",
    variant: "fab",
    icon: Download,
  },
};

export const ExtendedFabLoading: Story = {
  args: {
    children: "Extended Fab",
    variant: "fab",
    icon: Download,
    isLoading: true,
  },
};

/** With `href` the button is a React Aria `Link` — a real anchor drawn like
 *  the button, for navigation that reads as an action. */
export const AsLink: Story = {
  args: { children: "Open app", href: "#app", variant: "tonal" },
};

/** `color="error"` is the destructive button MD3 does not define: the same
 *  anatomy on the error colour pair. Reserve it for delete / cancel. */
export const ErrorColor: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button color="error" icon={Trash2}>
        Delete
      </Button>
      <Button color="error" variant="tonal">
        Delete
      </Button>
      <Button color="error" variant="outlined">
        Delete
      </Button>
      <Button color="error" variant="text">
        Delete
      </Button>
    </div>
  ),
};

const sizes = ["xsmall", "small", "medium", "large", "xlarge"] as const;

/** Material's five sizes, 32 to 136 pixels tall: the padding, the icon and
 *  the label's type role grow with them. `small` is the default. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {sizes.map((size) => (
        <Button key={size} size={size} icon={Send}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

/** `shape="square"`: 12/12/16/28/28 pixel corners from `xsmall` to `xlarge`,
 *  beside the default round. */
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["round", "square"] as const).map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-4">
          {sizes.map((size) => (
            <Button key={size} size={size} shape={shape} variant="tonal">
              {shape}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

const toggleVariants = ["filled", "tonal", "outlined", "elevated"] as const;

/** Toggles, unselected above and selected below, in the four styles that
 *  toggle: a selected round button turns square, a selected square one
 *  round. */
export const Toggles: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[false, true].map((isSelected) =>
        (["round", "square"] as const).map((shape) => (
          <div
            key={`${shape}-${isSelected}`}
            className="flex flex-wrap items-center gap-4"
          >
            {toggleVariants.map((variant) => (
              <Button
                key={variant}
                isToggle
                isSelected={isSelected}
                variant={variant}
                shape={shape}
                icon={Settings}
              >
                {variant}
              </Button>
            ))}
          </div>
        )),
      )}
    </div>
  ),
};

/** The styles, a toggle and a disabled button on the dark scheme. */
export const Dark: Story = {
  globals: { theme: "dark" },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button icon={Plus}>Filled</Button>
      <Button variant="tonal">Tonal</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="elevated">Elevated</Button>
      <Button variant="text">Text</Button>
      <Button isToggle defaultSelected variant="outlined">
        Selected
      </Button>
      <Button isDisabled>Disabled</Button>
    </div>
  ),
};
