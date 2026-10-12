import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import * as plays from "@french-tech-homies/design-system/.storybook/handed-theme/plays";
import { YourThemePanel } from "@french-tech-homies/design-system/.storybook/handed-theme/YourThemePanel";

/**
 * Where a project looks at its own theme. A person hands what their project
 * generated and every story of the catalog draws under it, in this browser,
 * with nothing uploaded. The words and the control are the panel's; the
 * machinery is `.storybook/handed-theme/`.
 *
 * `Page` is the page. The others are its tests, kept out of the sidebar: each
 * has a `play` function from `.storybook/handed-theme/plays.ts`, and
 * `npm run test-storybook` runs them under both identities.
 */
const meta = {
  title: "MD3/Your theme",
  parameters: { layout: "fullscreen" },
  render: () => <YourThemePanel />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A test starts with nothing held. Never on `Page`: opening the page must
    not forget the theme a person handed. The `!dev` tag is written on each
    story because the index reads tags from the source, not through a spread. */
const beforeEach = plays.reset;

export const Page: Story = {};

export const PairRedraws: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.pairRedraws,
};

export const DarkByClass: Story = {
  tags: ["!dev"],
  beforeEach,
  globals: { theme: "dark" },
  play: plays.darkByClass,
};

export const DarkBySystem: Story = {
  tags: ["!dev"],
  beforeEach,
  globals: { theme: "dark" },
  play: plays.darkBySystem,
};

export const LightWhateverTheSystem: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.lightWhateverTheSystem,
};

export const DesignMdAlone: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.designMdAlone,
};

export const FormatsOwnWords: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.formatsOwnWords,
};

export const HeldAcrossAReload: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.heldAcrossAReload,
};

export const StorageRefusedOrBroken: Story = {
  tags: ["!dev"],
  beforeEach,
  render: () => <YourThemePanel controller={plays.refused} />,
  play: plays.storageRefusedOrBroken,
};

export const NothingIsRequested: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.nothingIsRequested,
};

export const GeneratedThemeIsGuarded: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.generatedThemeIsGuarded,
};

export const RefusedInWords: Story = {
  tags: ["!dev"],
  beforeEach,
  play: plays.refusedInWords,
};
