import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight } from "lucide-react";
import Button from "@french-tech-homies/design-system/components/Button";
import {
  Carousel,
  CarouselItem,
} from "@french-tech-homies/design-system/components/Carousel";
import IconButton from "@french-tech-homies/design-system/components/IconButton";
import {
  Label,
  Title,
} from "@french-tech-homies/design-system/primitives/Typography";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&q=60&auto=format&fit=crop`;

const photos = [
  {
    src: photo("1511497584788-876760111969"),
    alt: "Pine forest",
    label: "Forest",
  },
  {
    src: photo("1464822759023-fed622ff2c3b"),
    alt: "Snowy peak",
    label: "Peak",
  },
  {
    src: photo("1506905925346-21bda4d32df4"),
    alt: "Mountains above clouds",
    label: "Clouds",
  },
  {
    src: photo("1501785888041-af3ef285b470"),
    alt: "Lake at dusk",
    label: "Lake",
  },
  {
    src: photo("1470071459604-3b5ec3a7fe05"),
    alt: "Fog over hills",
    label: "Fog",
  },
  {
    src: photo("1441974231531-c6227db76b6e"),
    alt: "Sunlit woods",
    label: "Woods",
  },
  {
    src: photo("1469474968028-56623f02e42e"),
    alt: "Valley at sunrise",
    label: "Valley",
  },
  {
    src: photo("1500530855697-b586d89ba3ee"),
    alt: "Coast road",
    label: "Coast",
  },
];

const noop = () => undefined;

/** The items, as an array: a carousel counts its children, so they are
    `CarouselItem`s and not a component that renders them. */
function photoItems(ratios?: number[]) {
  return photos.map((p, i) => (
    <CarouselItem key={p.alt} onPress={noop} aspectRatio={ratios?.[i]}>
      <img src={p.src} alt={p.alt} className="size-full object-cover" />
    </CarouselItem>
  ));
}

/** A compact window's width, where Material's pictures are drawn. */
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="w-[412px] bg-surface">{children}</div>;
}

const meta = {
  title: "MD3/Containment/Carousel",
  component: Carousel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  render: (args) => (
    <Frame>
      <Carousel {...args}>{photoItems()}</Carousel>
    </Frame>
  ),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const labelled = { "aria-label": "Landscapes" } as const;

export const MultiBrowse: Story = {
  args: { ...labelled, layout: "multi-browse" },
};

export const MultiBrowseCentered: Story = {
  args: { ...labelled, layout: "multi-browse", alignment: "center" },
};

export const Hero: Story = {
  args: { ...labelled, layout: "hero" },
};

export const CenterAlignedHero: Story = {
  args: { ...labelled, layout: "center-aligned-hero" },
};

export const Uncontained: Story = {
  args: { ...labelled, layout: "uncontained" },
};

export const UncontainedSnap: Story = {
  args: { ...labelled, layout: "uncontained", scrolling: "snap" },
};

export const UncontainedCentered: Story = {
  args: {
    ...labelled,
    layout: "uncontained",
    alignment: "center",
    scrolling: "snap",
  },
};

export const UncontainedMultiAspectRatio: Story = {
  args: { ...labelled, layout: "uncontained-multi-aspect-ratio" },
  render: (args) => (
    <Frame>
      <Carousel {...args}>
        {photoItems([16 / 9, 9 / 16, 1, 3 / 4, 4 / 3, 9 / 16, 16 / 9, 1])}
      </Carousel>
    </Frame>
  ),
};

/** One item edge to edge, scrolling vertically, in a compact portrait window. */
export const FullScreen: Story = {
  args: { ...labelled, layout: "full-screen" },
  render: (args) => (
    <div className="h-[640px] w-[360px]">
      <Carousel {...args}>{photoItems()}</Carousel>
    </div>
  ),
};

/**
 * Brief text on solid items, shown on a large item only (`not-in-data-[size=large]:hidden`), as Material's medium item hides its title:
 * Material's "text should always be understandable at each size".
 */
export const WithText: Story = {
  args: { ...labelled, layout: "multi-browse" },
  render: (args) => (
    <Frame>
      <Carousel {...args} aria-label="Collections">
        {[
          ["Hiking", "bg-primary-container text-on-primary-container"],
          ["Climbing", "bg-secondary-container text-on-secondary-container"],
          ["Sailing", "bg-tertiary-container text-on-tertiary-container"],
          ["Skiing", "bg-primary-container text-on-primary-container"],
          ["Cycling", "bg-secondary-container text-on-secondary-container"],
          ["Diving", "bg-tertiary-container text-on-tertiary-container"],
        ].map(([name, colour]) => (
          <CarouselItem
            key={name}
            // Named apart from its text, which a small item hides.
            aria-label={name}
            onPress={noop}
            classNames={{ container: colour }}
          >
            <div className="flex size-full items-end p-4">
              <Title
                size="medium"
                component="span"
                className="not-in-data-[size=large]:hidden"
              >
                {name}
              </Title>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </Frame>
  ),
};

/** Material's item with outline: a 1dp `outline` around each item. */
export const Outlined: Story = {
  args: { ...labelled, layout: "hero" },
  render: (args) => (
    <Frame>
      <Carousel {...args} aria-label="Destinations">
        {photos.map((p) => (
          <CarouselItem
            key={p.alt}
            aria-label={p.label}
            onPress={noop}
            withOutline
          >
            <div className="flex size-full items-end p-4">
              <Label
                size="large"
                component="span"
                className="not-in-data-[size=large]:hidden"
              >
                {p.label}
              </Label>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </Frame>
  ),
};

/** The second item disabled: drawn at 38 % and skipped by Tab and the arrows. */
export const DisabledItem: Story = {
  args: { ...labelled, layout: "uncontained", itemWidth: 160 },
  render: (args) => (
    <Frame>
      <Carousel {...args}>
        {photos.map((p, i) => (
          <CarouselItem key={p.alt} onPress={noop} isDisabled={i === 1}>
            <img src={p.src} alt={p.alt} className="size-full object-cover" />
          </CarouselItem>
        ))}
      </Carousel>
    </Frame>
  ),
};

/**
 * Material's requirement on a page that scrolls vertically: a way to see
 * every item without scrolling sideways. With a header, a 48dp arrow beside
 * it; without one, a Show all button 4dp below the carousel. Both are drawn
 * here; a page uses one.
 */
export const WithShowAll: Story = {
  args: { "aria-labelledby": "carousel-heading", layout: "multi-browse" },
  render: (args) => (
    <Frame>
      <div className="flex items-center justify-between ps-4 pe-1">
        <Title size="large" component="h2" id="carousel-heading">
          Landscapes
        </Title>
        <IconButton
          variant="standard"
          icon={ArrowRight}
          aria-label="Show all landscapes"
          onPress={noop}
        />
      </div>
      <Carousel {...args}>{photoItems()}</Carousel>
      <div className="mt-1 px-4 pb-2">
        <Button variant="text" onPress={noop}>
          Show all
        </Button>
      </div>
    </Frame>
  ),
};

export const Dark: Story = {
  args: { ...labelled, layout: "multi-browse" },
  globals: { theme: "dark" },
  render: WithText.render,
};
