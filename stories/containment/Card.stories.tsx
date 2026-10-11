import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@french-tech-homies/design-system/components/Button";
import { Card, CardContent } from "@french-tech-homies/design-system/components/Card";

const meta = {
  title: "MD3/Containment/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: {
    children: (
      <CardContent
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};

export const FilledWithMedia: Story = {
  args: {
    children: (
      <CardContent
        media="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        mediaAspectRatio="16:9"
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};

export const FilledWithMediaSquare: Story = {
  args: {
    children: (
      <CardContent
        media="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        mediaAspectRatio="1:1"
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};

export const FilledWithMediaAuto: Story = {
  args: {
    children: (
      <CardContent
        media="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop"
        mediaAspectRatio="auto"
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    children: (
      <CardContent
        media="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop"
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
    children: (
      <CardContent
        media="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop"
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};

export const HighElevation: Story = {
  args: {
    variant: "elevated",
    elevation: "high",
    children: (
      <CardContent
        media="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop"
        headline="Play relaxing songs"
        supportingText="From your Spotify library"
        actions={<Button>Get Started</Button>}
      />
    ),
  },
};
