import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import KitCard from "@french-tech-homies/design-system/components/Card";
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

/** On a filled `Card`, the kit's highest surface container, the placeholders
    are still seen: their fill is not the card's own. A corner by
    `className` stands for a button. */
export const OnAFilledCard: Story = {
  render: () => (
    <KitCard variant="filled" className="w-80">
      <SkeletonGroup label="Loading plan" className="flex flex-col gap-3">
        <Title component="div">
          <Skeleton className="w-1/2" />
        </Title>
        <Body component="div">
          <Skeleton />
        </Body>
        <Skeleton shape="rectangle" className="rounded-shape-full h-10 w-28" />
      </SkeletonGroup>
    </KitCard>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("status");
    const card = canvasElement.querySelector('[data-slot="card"]') ?? group;
    const bar = group.querySelector('[data-slot="skeleton"]');
    if (!bar) throw new Error("no skeleton in the group");
    await expect(getComputedStyle(bar).backgroundColor).not.toBe(
      getComputedStyle(card).backgroundColor,
    );
  },
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
