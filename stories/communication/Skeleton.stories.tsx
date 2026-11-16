import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Skeleton, SkeletonGroup } from "@french-tech-homies/design-system/components/Skeleton";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Skeleton: a placeholder the size and shape of content that is loading.
 * `SkeletonGroup` says "Loading" once for a region; each `Skeleton` in it
 * is hidden from a screen reader.
 */
const meta = {
  title: "MD3/Communication/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three rows of a list: an avatar, a name and a line under it. */
export const List: Story = {
  render: () => (
    <SkeletonGroup
      label="Loading people"
      className="bg-surface flex w-80 flex-col gap-4 p-4"
    >
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-4">
          <Skeleton shape="circle" className="size-10" />
          <div className="flex-1">
            <Body size="large" component="div">
              <Skeleton className="w-1/2" />
            </Body>
            <Body component="div">
              <Skeleton className="w-3/4" />
            </Body>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Loading people",
    );
    await expect(
      canvasElement.querySelectorAll("[data-slot=skeleton][aria-hidden=true]"),
    ).toHaveLength(9);
  },
};

/** A card: its picture, its title and two lines of text. */
export const Card: Story = {
  render: () => (
    <SkeletonGroup className="bg-surface-container-low rounded-shape-medium flex w-72 flex-col gap-3 p-4">
      <Skeleton shape="rectangle" className="h-36" />
      <Title component="div">
        <Skeleton className="w-2/3" />
      </Title>
      <Body component="div">
        <Skeleton />
        <Skeleton className="w-4/5" />
      </Body>
    </SkeletonGroup>
  ),
};

/**
 * A text skeleton stands where its line will: beside the loaded row, the
 * loading one is the same height.
 */
export const SameHeightAsTheText: Story = {
  render: () => (
    <div className="bg-surface text-on-surface flex w-72 flex-col p-4">
      <Title data-testid="loaded" component="div" className="border-outline-variant border-b">
        Ada Martin
      </Title>
      <Title data-testid="loading" component="div" className="border-outline-variant border-b">
        <Skeleton className="w-32" />
      </Title>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loaded = canvas.getByTestId("loaded").getBoundingClientRect().height;
    const loading = canvas.getByTestId("loading").getBoundingClientRect().height;
    await expect(Math.abs(loaded - loading)).toBeLessThanOrEqual(1);
  },
};
