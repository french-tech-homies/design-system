import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@french-tech-homies/design-system/components/Button";
import { Card, CardContent } from "@french-tech-homies/design-system/components/Card";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";

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

/**
 * The root takes what places a card and names it: here a `section` named by
 * its heading, which makes it a region a screen reader can jump to.
 */
export const NamedSection: Story = {
  args: {
    variant: "outlined",
    component: "section",
    "aria-labelledby": "card-story-usage",
    className: "w-80",
    children: (
      <>
        <Title id="card-story-usage" component="h2" size="medium">
          Usage this month
        </Title>
        <Body colorRole="on-surface-variant">
          1,284 visits, 12 % more than last month.
        </Body>
      </>
    ),
  },
};

/** A class on a named part: `classNames`, keyed by the part's name. */
export const WithPartClasses: Story = {
  args: {
    variant: "filled",
    classNames: { content: "gap-2 p-6" },
    children: (
      <CardContent
        headline="Play relaxing songs"
        supportingText="From your library"
        actions={<Button>Get Started</Button>}
        classNames={{
          headline: "text-primary",
          actions: "justify-start",
        }}
      />
    ),
  },
};
