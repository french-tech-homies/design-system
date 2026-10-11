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
