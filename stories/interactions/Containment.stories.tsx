import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useRef } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { I18nProvider } from "react-aria-components";

import Button from "@french-tech-homies/design-system/components/Button";
import {
  Card,
  CardContent,
} from "@french-tech-homies/design-system/components/Card";
import {
  Carousel,
  CarouselItem,
  type CarouselProps,
} from "@french-tech-homies/design-system/components/Carousel";
import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
} from "@french-tech-homies/design-system/components/Disclosure";
import { Cell } from "@french-tech-homies/design-system/components/Table";

/**
 * Behaviour tests for the containment surfaces. See
 * `stories/interactions/Fields.stories.tsx` for why these live apart from the
 * component stories.
 */
const meta = {
  title: "MD3/Interactions/Containment",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {
    id: "hours",
    q: "Serving hours",
    a: "A menu is active between the times you set.",
  },
  {
    id: "codes",
    q: "Printed codes",
    a: "Codes point at an identifier, not a name.",
  },
];

function Group(props: { allowsMultipleExpanded?: boolean }) {
  return (
    <div className="max-w-2xl">
      <DisclosureGroup {...props}>
        {items.map((item) => (
          <Disclosure key={item.id} id={item.id}>
            <DisclosureHeader>{item.q}</DisclosureHeader>
            <DisclosurePanel>{item.a}</DisclosurePanel>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </div>
  );
}

/**
 * The whole control from the keyboard: Tab reaches the trigger, Enter opens,
 * Space closes, and focus never leaves the trigger — a disclosure that moves
 * focus into its panel would strand a keyboard reader on the way out.
 */
export const DisclosureKeyboardToggle: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Disclosure>
        <DisclosureHeader>Serving hours</DisclosureHeader>
        <DisclosurePanel>
          A menu is active between the times you set.
        </DisclosurePanel>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Serving hours" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "true"),
    );
    await expect(trigger).toHaveFocus();
    await expect(
      canvas.getByText("A menu is active between the times you set."),
    ).toBeVisible();

    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(trigger).toHaveFocus();
  },
};

/**
 * The trigger owns the panel: `aria-controls` points at it and the panel is
 * labelled back by the trigger, so a reader lands on named content rather than
 * an anonymous group.
 */
export const DisclosureWiresTriggerToPanel: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Disclosure defaultExpanded>
        <DisclosureHeader>Serving hours</DisclosureHeader>
        <DisclosurePanel>
          A menu is active between the times you set.
        </DisclosurePanel>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Serving hours" });

    const panelId = trigger.getAttribute("aria-controls");
    await expect(panelId).toBeTruthy();

    const panel = canvasElement.ownerDocument.getElementById(panelId!);
    await expect(panel).not.toBeNull();
    await expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    await expect(panel).toHaveTextContent(
      "A menu is active between the times you set.",
    );
  },
};

/** A plain group is single-expand: opening one closes the one before it. */
export const DisclosureGroupSingleExpand: Story = {
  render: () => <Group />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hours = canvas.getByRole("button", { name: "Serving hours" });
    const codes = canvas.getByRole("button", { name: "Printed codes" });

    await userEvent.click(hours);
    await waitFor(() => expect(hours).toHaveAttribute("aria-expanded", "true"));

    await userEvent.click(codes);
    await waitFor(() => expect(codes).toHaveAttribute("aria-expanded", "true"));
    await expect(hours).toHaveAttribute("aria-expanded", "false");
  },
};

/** `allowsMultipleExpanded` keeps every opened section open. */
export const DisclosureGroupMultipleExpand: Story = {
  render: () => <Group allowsMultipleExpanded />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hours = canvas.getByRole("button", { name: "Serving hours" });
    const codes = canvas.getByRole("button", { name: "Printed codes" });

    await userEvent.click(hours);
    await userEvent.click(codes);
    await waitFor(() => expect(codes).toHaveAttribute("aria-expanded", "true"));
    await expect(hours).toHaveAttribute("aria-expanded", "true");
  },
};

/**
 * A card is placed and named from outside: the element, the id, the name and
 * a `data-*` attribute reach the root, so a `section` card is a region found
 * by its name, and a ref reaches its element.
 */
export const CardIsNamedAndPlaced: Story = {
  render: function Render() {
    const ref = useRef<HTMLElement>(null);
    return (
      <>
        <Card
          ref={ref}
          component="section"
          id="usage-card"
          aria-labelledby="usage-title"
          data-testid="usage"
          style={{ gridColumn: "span 2" }}
          variant="outlined"
        >
          <h2 id="usage-title">Usage this month</h2>
        </Card>
        <Button onPress={() => ref.current?.setAttribute("data-reached", "")}>
          Reach
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Usage this month" });

    await expect(region.tagName).toBe("SECTION");
    await expect(region).toHaveAttribute("id", "usage-card");
    await expect(region).toHaveAttribute("data-slot", "card");
    await expect(region).toHaveAttribute("data-variant", "outlined");
    await expect(region).toHaveAttribute("data-testid", "usage");
    await expect(region.style.gridColumn).toBe("span 2");

    await userEvent.click(canvas.getByRole("button", { name: "Reach" }));
    await expect(region).toHaveAttribute("data-reached");
  },
};

/** A class handed for a named part lands on that part, and on no other. */
export const CardPartClassesLand: Story = {
  render: () => (
    <Card classNames={{ content: "gap-2", stateLayer: "bg-primary" }}>
      <CardContent
        media={<div className="h-10 bg-surface-dim" />}
        headline="Serving hours"
        supportingText="A menu is active between the times you set."
        actions={<Button>Edit</Button>}
        classNames={{
          media: "h-10",
          header: "pt-2",
          headline: "text-primary",
          supportingText: "italic",
          actions: "justify-start",
        }}
      />
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const part = (slot: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-slot="${slot}"]`);

    await expect(part("card-content")).toHaveClass("gap-2");
    await expect(part("state-layer")).toHaveClass("bg-primary");
    await expect(part("state-layer")).not.toHaveClass("bg-on-surface");
    await expect(part("card-media")).toHaveClass("h-10");
    await expect(part("card-header")).toHaveClass("pt-2");
    await expect(part("card-headline")).toHaveClass("text-primary");
    await expect(part("card-headline")).not.toHaveClass("text-on-surface");
    await expect(part("card-supporting-text")).toHaveClass("italic");
    await expect(part("card-actions")).toHaveClass("justify-start");
    await expect(part("card-actions")).not.toHaveClass("justify-end");
    await expect(part("card")).not.toHaveClass("gap-2");
  },
};

// Never rendered: the type is the proof, and `npm run typecheck` reads it.
const refusedByTheType = () => (
  <>
    {/* @ts-expect-error a card takes no event handler */}
    <Card onClick={() => undefined}>Not pressed</Card>
    {/* @ts-expect-error a card is no tab stop */}
    <Card tabIndex={0}>Not focused</Card>
    {/* @ts-expect-error a cell places its own element */}
    <Cell render={() => <td />}>Not rendered</Cell>
  </>
);
void refusedByTheType;

/**
 * A card is a container, not a control: Tab goes straight to the action
 * inside it, then to the one after it, and never stops on the card. The type
 * refuses what would make it a control, a handler and a tab stop.
 */
export const CardIsNotATabStop: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Card variant="elevated" data-testid="card">
        <CardContent
          headline="Serving hours"
          supportingText="A menu is active between the times you set."
          actions={<Button>Edit hours</Button>}
        />
      </Card>
      <Button>After</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId("card");

    await expect(card).not.toHaveAttribute("tabindex");
    await expect(card).not.toHaveAttribute("role");

    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Edit hours" }),
    ).toHaveFocus();
    await expect(card).not.toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByRole("button", { name: "Edit hours" }),
    ).toHaveFocus();
  },
};

// ---------------------------------------------------------------------------
// Carousel

/** `count` solid items named "Item 1"…, each pressing `onPress`. */
function carouselItems(
  count: number,
  props: (index: number) => {
    isDisabled?: boolean;
    onPress?: () => void;
  } = () => ({}),
) {
  return Array.from({ length: count }, (_, i) => (
    <CarouselItem
      key={i}
      onPress={noop}
      classNames={{
        container: "bg-primary-container text-on-primary-container",
      }}
      {...props(i)}
    >
      <span className="block p-4">Item {i + 1}</span>
    </CarouselItem>
  ));
}

const noop = () => undefined;
const pressed = fn();
const disabledPressed = fn();

/** The carousel between two buttons, in a compact window's width. */
function CarouselOnAPage(props: {
  children: React.ReactNode;
  layout?: "multi-browse" | "uncontained" | "hero" | "center-aligned-hero";
}) {
  // One of the layouts, which the type cannot pair with a label as a union.
  const carousel = {
    "aria-label": "Landscapes",
    layout: props.layout ?? "uncontained",
  } as CarouselProps;
  return (
    <div className="flex w-[412px] flex-col gap-2">
      <Button>Before</Button>
      <Carousel {...carousel}>{props.children}</Carousel>
      <Button>Show all</Button>
    </div>
  );
}

const item = (canvasElement: HTMLElement, n: number) =>
  within(canvasElement).getByRole("button", { name: `Item ${n}` });
const slide = (el: HTMLElement) =>
  el.closest<HTMLElement>('[data-slot="carousel-item"]')!;
const rect = (el: Element) => el.getBoundingClientRect();

/**
 * A story whose play moves the row, by focus, the arrow keys or a scroll,
 * leaves it where the browser's snap settles, which differs from run to run
 * by a few pixels or a part of an item, in the same image. Its picture is
 * left out; the carousel's look at rest is compared through the Containment
 * Carousel stories.
 */
const rowMoves = {
  tags: ["no-screenshot"],
  parameters: {
    screenshot: {
      reason:
        "the play moves the row, and where its snap settles differs from run to run",
    },
  },
} satisfies Partial<Story>;

/**
 * Material's labelling: the container is a named region, never a tab stop,
 * and each item says its place and the total.
 */
export const CarouselIsLabelledRegion: Story = {
  render: () => <CarouselOnAPage>{carouselItems(6)}</CarouselOnAPage>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Landscapes" });
    await expect(region).toHaveAttribute("aria-roledescription", "carousel");
    await expect(region).not.toHaveAttribute("tabindex");
    for (let n = 1; n <= 6; n++)
      await expect(
        within(region).getByRole("group", { name: `${n} of 6` }),
      ).toContainElement(item(canvasElement, n));
  },
};

/**
 * Tab lands on the first item, not the container, and Tab again moves to the
 * next item, which scrolls to the large keyline.
 */
export const CarouselTabLandsOnFirstItem: Story = {
  ...rowMoves,
  render: () => (
    <CarouselOnAPage layout="multi-browse">{carouselItems(6)}</CarouselOnAPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Before" })).toHaveFocus();
    await userEvent.tab();
    await expect(item(canvasElement, 1)).toHaveFocus();
    await userEvent.tab();
    await expect(item(canvasElement, 2)).toHaveFocus();
    await waitFor(() =>
      expect(slide(item(canvasElement, 2))).toHaveAttribute(
        "data-size",
        "large",
      ),
    );
  },
};

/** Right and Left move between items and scroll the next one in; no wrap. */
export const CarouselArrowsMoveBetweenItems: Story = {
  ...rowMoves,
  render: () => <CarouselOnAPage>{carouselItems(6)}</CarouselOnAPage>,
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector(
      '[data-slot="carousel-scroller"]',
    )!;
    await userEvent.tab();
    await userEvent.tab();
    await expect(item(canvasElement, 1)).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(item(canvasElement, 2)).toHaveFocus();
    await waitFor(() =>
      expect(rect(item(canvasElement, 2)).right).toBeLessThanOrEqual(
        rect(scroller).right,
      ),
    );
    await expect(scroller.scrollLeft).toBeGreaterThan(0);

    await userEvent.keyboard("{ArrowLeft}");
    await expect(item(canvasElement, 1)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(item(canvasElement, 1)).toHaveFocus();
  },
};

/** A disabled item is skipped by Tab and the arrows, and never pressed. */
export const CarouselArrowsSkipDisabled: Story = {
  ...rowMoves,
  beforeEach: () => {
    disabledPressed.mockClear();
  },
  render: () => (
    <CarouselOnAPage>
      {carouselItems(4, (i) =>
        i === 1 ? { isDisabled: true, onPress: disabledPressed } : {},
      )}
    </CarouselOnAPage>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(item(canvasElement, 3)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(item(canvasElement, 1)).toHaveFocus();
    await userEvent.tab();
    await expect(item(canvasElement, 3)).toHaveFocus();
    await userEvent.click(item(canvasElement, 2));
    await expect(disabledPressed).not.toHaveBeenCalled();
  },
};

/** Up and Down leave the carousel for the element before or after it. */
export const CarouselUpDownLeave: Story = {
  ...rowMoves,
  render: () => <CarouselOnAPage>{carouselItems(6)}</CarouselOnAPage>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(item(canvasElement, 2)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("button", { name: "Show all" }),
    ).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(item(canvasElement, 6)).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("button", { name: "Before" })).toHaveFocus();
  },
};

/** Enter and Space activate the focused item; an item with `href` is a link. */
export const CarouselEnterAndSpaceActivate: Story = {
  ...rowMoves,
  beforeEach: () => {
    pressed.mockClear();
  },
  render: () => (
    <CarouselOnAPage>
      {carouselItems(2, () => ({ onPress: pressed }))}
      <CarouselItem href="#elsewhere">
        <span className="block p-4">A link</span>
      </CarouselItem>
    </CarouselOnAPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(pressed).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    await expect(pressed).toHaveBeenCalledTimes(2);
    await expect(canvas.getByRole("link", { name: "A link" })).toHaveAttribute(
      "href",
      "#elsewhere",
    );
    await expect(
      within(canvas.getByRole("group", { name: "3 of 3" })).getByRole("link"),
    ).toBeInTheDocument();
  },
};

/** Right to left, Left moves to the next item and Right to the previous. */
export const CarouselRtlArrows: Story = {
  ...rowMoves,
  render: () => (
    <I18nProvider locale="ar-EG">
      <div dir="rtl">
        <CarouselOnAPage>{carouselItems(4)}</CarouselOnAPage>
      </div>
    </I18nProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await expect(item(canvasElement, 1)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(item(canvasElement, 2)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(item(canvasElement, 1)).toHaveFocus();
  },
};

/** Full-screen scrolls vertically: Up and Down move between items, which
    snap to the container's edge. */
export const CarouselFullScreenVerticalArrows: Story = {
  ...rowMoves,
  render: () => (
    <div className="h-[400px] w-[300px]">
      <Carousel aria-label="Stories" layout="full-screen">
        {carouselItems(3)}
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector(
      '[data-slot="carousel-scroller"]',
    )!;
    await userEvent.tab();
    await expect(item(canvasElement, 1)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, 2)).toHaveFocus();
    await waitFor(() =>
      expect(
        Math.abs(rect(item(canvasElement, 2)).top - rect(scroller).top),
      ).toBeLessThan(1),
    );
    await expect(scroller.scrollTop).toBeGreaterThan(0);
    await userEvent.keyboard("{ArrowUp}");
    await expect(item(canvasElement, 1)).toHaveFocus();
    await waitFor(() => expect(scroller.scrollTop).toBe(0));
  },
};

/** Scrolls the carousel's row to `left` and waits for the frame it draws. */
async function scrollRow(canvasElement: HTMLElement, left: number) {
  const scroller = canvasElement.querySelector(
    '[data-slot="carousel-scroller"]',
  )!;
  scroller.scrollTo({ left, behavior: "instant" });
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  );
  return scroller;
}

const widthOf = (canvasElement: HTMLElement, n: number) =>
  rect(slide(item(canvasElement, n))).width;
const near = async (a: number, b: number, by = 1) => {
  await expect(Math.abs(a - b)).toBeLessThanOrEqual(by);
};

/**
 * Multi-browse at 412px: large items, then one medium strictly between, then
 * one small (40–56), 8px apart and 16px from the edge. One snap on, the
 * second item is large at the start; at the last snap, the last is large at
 * the end.
 */
export const CarouselMultiBrowseKeylines: Story = {
  ...rowMoves,
  render: () => (
    <CarouselOnAPage layout="multi-browse">{carouselItems(8)}</CarouselOnAPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region");
    const start = rect(region).left;
    const large = widthOf(canvasElement, 1);
    await expect(large).toBeLessThanOrEqual(200);
    await near(rect(slide(item(canvasElement, 1))).left - start, 16);
    let n = 2;
    while (Math.abs(widthOf(canvasElement, n) - large) < 1) n++;
    const medium = widthOf(canvasElement, n);
    const small = widthOf(canvasElement, n + 1);
    await expect(small).toBeGreaterThanOrEqual(40);
    await expect(small).toBeLessThanOrEqual(56);
    await expect(medium).toBeGreaterThan(small);
    await expect(medium).toBeLessThan(large);
    await near(
      rect(slide(item(canvasElement, n + 1))).left -
        rect(slide(item(canvasElement, n))).right,
      8,
    );

    await scrollRow(canvasElement, large + 8);
    await waitFor(() =>
      near(rect(slide(item(canvasElement, 2))).left - start, 16),
    );
    await near(widthOf(canvasElement, 2), large);

    const scroller = await scrollRow(canvasElement, 1e5);
    await expect(scroller.scrollLeft).toBeGreaterThan(0);
    await waitFor(() => near(widthOf(canvasElement, 8), large));
    await near(
      rect(region).right - rect(slide(item(canvasElement, 8))).right,
      16,
    );
  },
};

/** Hero: one large item and a small one; at the end, the last is large and
    the one before is small at the start. */
export const CarouselHeroKeylines: Story = {
  ...rowMoves,
  render: () => (
    <CarouselOnAPage layout="hero">{carouselItems(5)}</CarouselOnAPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const start = rect(canvas.getByRole("region")).left;
    const large = widthOf(canvasElement, 1);
    await expect(large).toBeGreaterThan(widthOf(canvasElement, 2));
    await expect(widthOf(canvasElement, 2)).toBeGreaterThanOrEqual(40);
    await expect(widthOf(canvasElement, 2)).toBeLessThanOrEqual(56);

    await scrollRow(canvasElement, 1e5);
    await waitFor(() => near(widthOf(canvasElement, 5), large));
    const small = widthOf(canvasElement, 4);
    await expect(small).toBeGreaterThanOrEqual(40);
    await expect(small).toBeLessThanOrEqual(56);
    await near(rect(slide(item(canvasElement, 4))).left - start, 16);
  },
};

/** Center-aligned hero: at rest the first item is large at the start and
    the row full; one snap on, the large item is centred between two small
    ones. */
export const CarouselCenterAlignedHeroKeylines: Story = {
  ...rowMoves,
  render: () => (
    <CarouselOnAPage layout="center-aligned-hero">
      {carouselItems(5)}
    </CarouselOnAPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = rect(canvas.getByRole("region"));
    const large = widthOf(canvasElement, 1);
    // At rest the row is full: the first item large at the start, no
    // empty keyline before it.
    await near(rect(slide(item(canvasElement, 1))).left - region.left, 16);
    await expect(widthOf(canvasElement, 2)).toBeLessThanOrEqual(56);
    await near(region.right - rect(slide(item(canvasElement, 3))).right, 16);

    await scrollRow(canvasElement, large + 8);
    await waitFor(() => near(widthOf(canvasElement, 2), large));
    const centre = rect(slide(item(canvasElement, 2)));
    await near(centre.left + centre.width / 2, region.left + region.width / 2);
    for (const n of [1, 3]) {
      await expect(widthOf(canvasElement, n)).toBeGreaterThanOrEqual(40);
      await expect(widthOf(canvasElement, n)).toBeLessThanOrEqual(56);
    }
  },
};

/**
 * Centred multi-browse: two snaps on, the large item is centred with a
 * medium and a small item on each side, mirrored.
 */
export const CarouselMultiBrowseCenteredKeylines: Story = {
  ...rowMoves,
  render: () => (
    <div className="w-[412px]">
      <Carousel
        aria-label="Landscapes"
        layout="multi-browse"
        alignment="center"
      >
        {carouselItems(8)}
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = rect(within(canvasElement).getByRole("region"));
    const large = widthOf(canvasElement, 1);
    await scrollRow(canvasElement, 2 * (large + 8));
    await waitFor(() => near(widthOf(canvasElement, 3), large));
    const centre = rect(slide(item(canvasElement, 3)));
    await near(centre.left + centre.width / 2, region.left + region.width / 2);
    await near(widthOf(canvasElement, 2), widthOf(canvasElement, 4));
    await near(widthOf(canvasElement, 1), widthOf(canvasElement, 5));
    await expect(widthOf(canvasElement, 1)).toBeGreaterThanOrEqual(40);
    await expect(widthOf(canvasElement, 1)).toBeLessThanOrEqual(56);
    await expect(widthOf(canvasElement, 2)).toBeLessThan(large);
    await near(rect(slide(item(canvasElement, 1))).left - region.left, 16);
  },
};

/**
 * Reduced motion: every item the same size, with no transform, and the
 * row still snapping as its layout does. The system's
 * setting is stood in for by `matchMedia`, put back after the story.
 */
export const CarouselReducedMotionSameSize: Story = {
  beforeEach: () => {
    const real = window.matchMedia;
    window.matchMedia = (query: string) =>
      query === "(prefers-reduced-motion: reduce)"
        ? ({
            matches: true,
            media: query,
            onchange: null,
            addEventListener: noop,
            removeEventListener: noop,
            addListener: noop,
            removeListener: noop,
            dispatchEvent: () => false,
          } as MediaQueryList)
        : real.call(window, query);
    return () => {
      window.matchMedia = real;
    };
  },
  render: () => (
    <div className="flex w-[412px] flex-col gap-2">
      <Carousel aria-label="Browse" layout="multi-browse">
        {carouselItems(6)}
      </Carousel>
      <Carousel aria-label="Heroes" layout="hero">
        {carouselItems(6)}
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const name of ["Browse", "Heroes"]) {
      const region = within(canvasElement).getByRole("region", { name });
      const first = widthOf(region, 1);
      for (let n = 1; n <= 6; n++) {
        await near(widthOf(region, n), first);
        await expect(slide(item(region, n)).style.transform).toBe("");
      }
      // Still snapping: reduced motion takes away the size change and the
      // parallax, not the layout's snap; hero still moves one item at a time.
      const scroller = region.querySelector('[data-slot="carousel-scroller"]')!;
      await expect(getComputedStyle(scroller).scrollSnapType).toBe(
        "x mandatory",
      );
      const snap = getComputedStyle(slide(item(region, 2)));
      await expect(snap.scrollSnapAlign).not.toBe("none");
      await expect(snap.scrollSnapStop).toBe(
        name === "Heroes" ? "always" : "normal",
      );
    }
  },
};
