import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { PlusIcon, SettingsIcon, StarIcon, TrashIcon } from "lucide-react";

import {
  Body,
  Button,
  Card,
  CardContent,
  Chip,
  Display,
  EmptyState,
  GridList,
  GridListItem,
  Headline,
  IconButton,
  Label,
  ListItem,
  Menu,
  Title,
  Tooltip,
  TooltipTrigger,
} from "@french-tech-homies/design-system";

/**
 * Showcase for the copy-in MD3 kit. Everything here is rendered
 * from the kit's own exports, so this file doubles as the smoke test that the
 * extracted folder works — including that lucide icons satisfy the kit's
 * library-agnostic icon prop.
 *
 * It is also where to check the **Preset** toolbar switch. `material` is the
 * shipped Material identity; `editorial` applies
 * `tokens/preset-editorial.css` — a hand-written palette, 2px corners, a serif
 * face, hairline elevation and stacked field labels. Nothing in any component
 * changes between the two; see the README, "Retheming — the three layers".
 *
 * The `MD3/Foundations/*` pages are the exception: they render from
 * `tokens/resolved.json`, a snapshot of the *shipped* tokens, so they keep
 * showing Material's values under either preset. That is on purpose — they
 * document the default theme, not whatever is currently applied.
 */
const meta = {
  title: "MD3/Overview",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <Title size="medium" className="text-on-surface-variant mb-3">
        {title}
      </Title>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export const Everything: Story = {
  render: () => (
    <div className="bg-surface p-6">
      <Section title="Typography">
        <div className="flex flex-col gap-1">
          <Display size="small">Display small</Display>
          <Headline size="medium">Headline medium</Headline>
          <Title size="large">Title large</Title>
          <Body>Body medium — the reading default.</Body>
          <Label size="medium">Label medium</Label>
        </div>
      </Section>

      <Section title="Buttons">
        <Button variant="filled">Filled</Button>
        <Button variant="tonal">Tonal</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <Button variant="elevated">Elevated</Button>
        <Button variant="filled" icon={PlusIcon}>
          With icon
        </Button>
        <Button variant="filled" isLoading>
          Loading
        </Button>
        <Button variant="filled" isDisabled>
          Disabled
        </Button>
      </Section>

      <Section title="FAB">
        <Button variant="fab" size="small" icon={PlusIcon} aria-label="Add" />
        <Button variant="fab" icon={PlusIcon} aria-label="Add" />
        <Button variant="fab" icon={PlusIcon}>
          Extended
        </Button>
      </Section>

      <Section title="Icon buttons">
        <IconButton icon={SettingsIcon} aria-label="Settings" />
        <IconButton icon={SettingsIcon} aria-label="Settings" isContained />
        <IconButton
          icon={SettingsIcon}
          aria-label="Settings"
          isContained
          variant="filled"
        />
        <IconButton
          icon={SettingsIcon}
          aria-label="Settings"
          isContained
          variant="tonal"
        />
        <IconButton
          icon={StarIcon}
          aria-label="Favourite"
          isToggle
          variant="filled"
        />
      </Section>

      <Section title="Chips">
        <Chip>Assist</Chip>
        <Chip variant="filter">Filter</Chip>
        <Chip variant="filter" hasTrailingIcon>
          Filter with menu
        </Chip>
        <Chip variant="input" onRemove={() => undefined}>
          Removable
        </Chip>
      </Section>

      <Section title="Cards">
        <div className="w-64">
          <Card variant="filled">
            <CardContent
              headline="Filled"
              supportingText="Default surface tier."
            />
          </Card>
        </div>
        <div className="w-64">
          <Card variant="outlined">
            <CardContent
              headline="Outlined"
              supportingText="Hairline border."
            />
          </Card>
        </div>
        <div className="w-64">
          <Card variant="elevated" elevation="medium">
            <CardContent
              headline="Elevated"
              supportingText="shadow-elevation-2."
              actions={<Button variant="text">Action</Button>}
            />
          </Card>
        </div>
      </Section>

      <Section title="List (inside GridList, so state layers are live)">
        <div className="rounded-shape-large bg-surface-container-low w-full max-w-md">
          <GridList aria-label="Tables">
            <GridListItem textValue="Table 12">
              <ListItem
                headline="Table 12"
                supportingText="Two orders in progress"
                trailingElement={
                  <IconButton icon={TrashIcon} aria-label="Delete" />
                }
              />
            </GridListItem>
            <GridListItem textValue="Table 13">
              <ListItem headline="Table 13" supportingText="Free" />
            </GridListItem>
          </GridList>
        </div>
      </Section>

      <Section title="Menu & tooltip">
        <Menu
          triggerButton={<Button variant="outlined">Open menu</Button>}
          items={[
            { id: "edit", label: "Edit", leadingIcon: SettingsIcon },
            { id: "delete", label: "Delete", leadingIcon: TrashIcon },
          ]}
        />
        <TooltipTrigger>
          <Button variant="text">Hover me</Button>
          <Tooltip>A plain tooltip</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger>
          <Button variant="text">Rich tooltip</Button>
          <Tooltip
            headline="Rich tooltip"
            supportingText="With a headline and supporting text."
          />
        </TooltipTrigger>
      </Section>

      <Section title="Empty state">
        <EmptyState
          size="sm"
          title="No orders yet"
          description="Orders placed from a table QR code will show up here."
          action={<Button variant="filled">Create an order</Button>}
        />
      </Section>
    </div>
  ),
};
