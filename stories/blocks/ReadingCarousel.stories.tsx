import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Avatar } from "@french-tech-homies/design-system/components/Avatar";
import Card from "@french-tech-homies/design-system/components/Card";
import {
  Body,
  Title,
} from "@french-tech-homies/design-system/primitives/Typography";

import { ReadingCarousel } from "../../blocks/reading-carousel/ReadingCarousel";

/**
 * A block: `npx shadcn add @ds/reading-carousel-block` copies it into a
 * project's components, where it is the project's to edit. For content that
 * is read and not pressed, which the kit's Material `Carousel` is not for.
 */
const meta = {
  title: "MD3/Blocks/ReadingCarousel",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const quotes = [
  ["Ada Martin", "Illustrator", "I send an invoice before I close the file. It takes a minute."],
  ["Sami Ben", "Developer", "The reminders do the chasing. I stopped keeping a spreadsheet."],
  ["Nour Haddad", "Photographer", "Clients pay from the link. Half of them pay the same day."],
  ["Léa Okafor", "Copywriter", "My accountant gets one export a quarter and asks nothing."],
  ["Kofi Rossi", "Designer", "It looks like me, not like a bank."],
];

const slides = quotes.map(([name, role, text]) => (
  <Card key={name} variant="outlined" className="h-full">
    <div className="flex flex-col gap-3">
      <Body className="text-on-surface">“{text}”</Body>
      <div className="flex items-center gap-3">
        <Avatar
          alt={name}
          fallback={(name ?? "")
            .split(" ")
            .map((part) => part[0])
            .join("")}
        />
        <div>
          <Title size="small" component="div" className="text-on-surface">
            {name}
          </Title>
          <Body size="small" className="text-on-surface-variant">
            {role}
          </Body>
        </div>
      </div>
    </div>
  </Card>
));

/** Three in view on a wide screen. */
export const Quotes: Story = {
  render: () => (
    <div className="max-w-4xl">
      <ReadingCarousel aria-label="What customers say">{slides}</ReadingCarousel>
    </div>
  ),
};

/** `slides={1}`: one at a time. */
export const OneAtATime: Story = {
  render: () => (
    <div className="w-96">
      <ReadingCarousel aria-label="What customers say" slides={1}>
        {slides}
      </ReadingCarousel>
    </div>
  ),
};

/** Everything fits: both buttons are disabled. */
export const AllInView: Story = {
  render: () => (
    <div className="max-w-4xl">
      <ReadingCarousel aria-label="What customers say">
        {slides.slice(0, 2)}
      </ReadingCarousel>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // MD3's disabled content is `on-surface` at 38 %, which never
            // reaches 4.5:1. WCAG 1.4.3 exempts inactive components.
            id: "color-contrast",
            enabled: false,
          },
        ],
      },
    },
  },
};

/** Next moves on by a slide and says where it stands; at the start Previous
    is disabled; the row itself is a stop the arrow keys scroll. */
export const IsMovedByItsButtonsAndByTheArrowKeys: Story = {
  render: () => (
    <div className="w-96">
      <ReadingCarousel aria-label="What customers say" slides={1}>
        {slides}
      </ReadingCarousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = () => canvas.getByText(/of 5$/).textContent;
    const previous = canvas.getByRole("button", { name: "Previous" });
    const next = canvas.getByRole("button", { name: "Next" });
    await waitFor(() => expect(status()).toBe("1 of 5"));
    await expect(previous).toBeDisabled();

    await userEvent.click(next);
    await waitFor(() => expect(status()).toBe("2 of 5"), { timeout: 3000 });
    await expect(previous).toBeEnabled();

    const row = canvas.getByRole("group", { name: /use the arrow keys/ });
    row.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(status()).toBe("3 of 5"), { timeout: 3000 });
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(status()).toBe("1 of 5"), { timeout: 3000 });
  },
};
