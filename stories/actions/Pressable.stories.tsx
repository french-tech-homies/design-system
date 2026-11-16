import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { Avatar } from "@french-tech-homies/design-system/components/Avatar";
import { Menu } from "@french-tech-homies/design-system/components/Menu";
import { Pressable } from "@french-tech-homies/design-system/components/Pressable";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * Pressable: a button, or with `href` a link, that holds anything. It gives
 * its content the keyboard, the state layer and the focus ring, and draws
 * nothing else.
 */
const meta = {
  title: "MD3/Actions/Pressable",
  component: Pressable,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { onPress: fn(), children: null },
} satisfies Meta<typeof Pressable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An avatar that is pressed: round, a 48dp target, named by `aria-label`.
    Tab reaches it and draws the ring; Enter and Space press it. */
export const AroundAnAvatar: Story = {
  render: (args) => (
    <Pressable
      aria-label="Account"
      onPress={args.onPress}
      className="rounded-shape-full min-h-12 min-w-12 justify-center"
    >
      <Avatar fallback="AM" />
    </Pressable>
  ),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Account" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineStyle).toBe("solid");
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onPress).toHaveBeenCalledTimes(2);
    const box = button.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(48);
    await expect(box.height).toBeGreaterThanOrEqual(48);
  },
};

/** As a menu's trigger: the avatar opens the account's menu, and takes the
    focus back when it closes. */
export const OpensAMenu: Story = {
  render: () => (
    <Menu
      triggerButton={
        <Pressable
          aria-label="Account"
          className="rounded-shape-full min-h-12 min-w-12 justify-center"
        >
          <Avatar fallback="AM" />
        </Pressable>
      }
      items={[
        { id: "profile", label: "Profile" },
        { id: "out", label: "Sign out" },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Account" });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(await screen.findByRole("menu")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** With `href` it is a link: a card's content pressed whole. */
export const ALinkAroundACardsContent: Story = {
  render: () => (
    <Pressable
      href="#invoices"
      className="rounded-shape-medium border-outline-variant w-80 flex-col items-start gap-1 border p-4"
    >
      <Title component="span">Send your first invoice</Title>
      <Body component="span" className="text-on-surface-variant">
        Four minutes to read
      </Body>
    </Pressable>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", {
      name: /Send your first invoice/,
    });
    await expect(link).toHaveAttribute("href", "#invoices");
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

/** Disabled, it takes no press and is drawn at 38%. */
export const Disabled: Story = {
  render: (args) => (
    <Pressable
      aria-label="Account"
      isDisabled
      onPress={args.onPress}
      className="rounded-shape-full min-h-12 min-w-12 justify-center"
    >
      <Avatar fallback="AM" />
    </Pressable>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Account" }),
    ).toBeDisabled();
  },
};
