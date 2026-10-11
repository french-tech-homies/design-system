import type { Meta, StoryObj } from "@storybook/react-vite";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Settings,
  Plus,
  Trash2,
  Send,
  Heart,
  Share2,
  Bell,
} from "lucide-react";

const meta = {
  title: "MD3/Actions/Icon button",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isContained: {
      control: "boolean",
    },
    variant: {
      control: "select",
      options: ["standard", "filled", "tonal", "outlined"],
    },
    isDisabled: {
      control: "boolean",
    },
    isToggle: {
      control: "boolean",
    },
    isSelected: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StandardNotContained: Story = {
  args: {
    isContained: false,
    variant: "standard",
    icon: Settings,
    "aria-label": "Settings",
  },
};

export const FilledNotContained: Story = {
  args: {
    isContained: false,
    variant: "filled",
    icon: Plus,
    "aria-label": "Add",
  },
};

export const TonalNotContained: Story = {
  args: {
    isContained: false,
    variant: "tonal",
    icon: Heart,
    "aria-label": "Favorite",
  },
};

export const OutlinedNotContained: Story = {
  args: {
    isContained: false,
    variant: "outlined",
    icon: Share2,
    "aria-label": "Share",
  },
};

export const StandardContained: Story = {
  args: {
    isContained: true,
    variant: "standard",
    icon: Settings,
    "aria-label": "Settings",
  },
};

export const FilledContained: Story = {
  args: {
    isContained: true,
    variant: "filled",
    icon: Plus,
    "aria-label": "Add",
  },
};

export const TonalContained: Story = {
  args: {
    isContained: true,
    variant: "tonal",
    icon: Trash2,
    "aria-label": "Delete",
  },
};

export const OutlinedContained: Story = {
  args: {
    isContained: true,
    variant: "outlined",
    icon: Send,
    "aria-label": "Send",
  },
};

export const Disabled: Story = {
  args: {
    isContained: false,
    variant: "standard",
    icon: Settings,
    "aria-label": "Settings",
    isDisabled: true,
  },
};

// Toggle IconButton Stories

export const ToggleStandardNotContained: Story = {
  args: {
    isContained: false,
    variant: "standard",
    icon: Bell,
    "aria-label": "Notifications",
    isToggle: true,
  },
};

export const ToggleFilledNotContained: Story = {
  args: {
    isContained: false,
    variant: "filled",
    icon: Heart,
    "aria-label": "Favorite",
    isToggle: true,
  },
};

export const ToggleTonalNotContained: Story = {
  args: {
    isContained: false,
    variant: "tonal",
    icon: Bell,
    "aria-label": "Notifications",
    isToggle: true,
  },
};

export const ToggleOutlinedNotContained: Story = {
  args: {
    isContained: false,
    variant: "outlined",
    icon: Heart,
    "aria-label": "Favorite",
    isToggle: true,
  },
};

export const ToggleStandardContained: Story = {
  args: {
    isContained: true,
    variant: "standard",
    icon: Bell,
    "aria-label": "Notifications",
    isToggle: true,
  },
};

export const ToggleFilledContained: Story = {
  args: {
    isContained: true,
    variant: "filled",
    icon: Heart,
    "aria-label": "Favorite",
    isToggle: true,
  },
};

export const ToggleTonalContained: Story = {
  args: {
    isContained: true,
    variant: "tonal",
    icon: Bell,
    "aria-label": "Notifications",
    isToggle: true,
  },
};

export const ToggleOutlinedContained: Story = {
  args: {
    isContained: true,
    variant: "outlined",
    icon: Heart,
    "aria-label": "Favorite",
    isToggle: true,
  },
};

export const ToggleDisabled: Story = {
  args: {
    isContained: false,
    variant: "standard",
    icon: Bell,
    "aria-label": "Notifications",
    isToggle: true,
    isDisabled: true,
  },
};
