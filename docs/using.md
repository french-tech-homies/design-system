# Using the kit

## Use

```tsx
import { Button, Card, CardContent, Title } from "./ds";
// or deep-import: import Button from "./ds/components/Button";

<Card variant="elevated" elevation="medium">
  <CardContent
    headline="Table 12"
    supportingText="Two orders in progress"
    actions={<Button variant="tonal">Open</Button>}
  />
</Card>;
```

### If you have your own `cn()`

Build it from the kit's merge config so every merge in the app agrees —
otherwise `className` overrides of MD3 utilities silently produce two competing
classes:

```ts
import { extendTailwindMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { twMergeConfig } from "./ds/utils";

const twMerge = extendTailwindMerge(twMergeConfig);
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

## What's in the folder

| Path                           | Contents                                                                                                                                                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.md`                    | The kit's own DESIGN.md: a neutral slate set in Inter, the source of the default theme the kit ships — see [The theme comes from DESIGN.md](theming.md#the-theme-comes-from-designmd)                                                                                                                                   |
| `tokens/theme.css`             | The kit's default MD3 color scheme, light + dark (on `.dark` or the system setting), as `--md-sys-color-*: hsl(...)` finished colors — generated from the kit's own `DESIGN.md`                                                                                               |
| `tokens/theme.v4.css`          | Tailwind v4 `@theme inline` mapping (colors, type, shape, elevation, motion); its type, corner, face, elevation, state and motion values are set from `DESIGN.md`                                                                                                             |
| `tokens/design-md.mjs`         | DESIGN.md → theme: the derivation, pure (text in, text out) — see [The theme comes from DESIGN.md](theming.md#the-theme-comes-from-designmd). In the registry as `@ds/design-md`                                                                                                                                       |
| `tokens/generate-theme.mjs`    | The command behind `npm run theme:generate`: reads a DESIGN.md, writes the three files. In the registry as `@ds/design-md`                                                                                                                                                   |
| `tokens/DESIGN.resolved.md`    | Generated: the complete DESIGN.md (every role of both schemes, the whole type scale, the corners, the reference CSS block, how dark is switched) — the one agents read                                                                                                        |
| `tokens/design-md.check.mjs`   | Rule checks for the derivation — `npm run theme:check`                                                                                                                                                                                                                        |
| `tokens/resolved.json`         | Generated snapshot of every token as plain values (hex, px, ms) — `npm run theme:resolve`                                                                                                                                                                                     |
| `tokens/resolve-theme.mjs`     | Produces `resolved.json` from theme.css + theme.v4.css                                                                                                                                                                                                                        |
| `tokens/bridge-shadcn.css`     | Optional shadcn ↔ MD3 variable layer                                                                                                                                                                                                                                          |
| `tokens/preset-editorial.css`  | A deliberately un-Material identity, class-scoped — the worked example for [Retheming](theming.md#retheming--the-three-layers)                                                                                                                                                                                  |
| `conventions.md`               | How components are written — token idiom, tv slots, state layers, data-slot, what to check before adding one                                                                                                                                                                  |
| `components/field-styles.ts`   | The **style module** for the field container (`tv` slots), rendered by `TextField`, `NumberField`, `PhoneField`, `Select`, `ComboBox`, `DatePicker`, `DateRangePicker` and `TimePicker` — its `kind` variant is what lets one container serve typed, composite, segmented and trigger fields. Edit this to change field anatomy |
| `components/date-picker-styles.ts` | The **style module** for the calendar (`datePickerStyles`): the docked popover, the menu buttons, the day cell in every state, the year grid, the month and year menus — rendered by `DatePicker` and `DateRangePicker` |
| `components/picker-dialog-styles.ts` | The **style module** for the pickers' dialog (`pickerDialogStyles`): container, supporting text, headline, divider, actions, full-screen layout — rendered by `DatePicker`, `DateRangePicker` and `TimePicker` |
| `utils.ts`                     | `twMergeConfig`, `tv`, `cn`, `focusRing` — server-safe, no React Aria import                                                                                                                                                                                                  |
| `render-props.ts`              | `composeTailwindRenderProps` (client-only; kept out of `utils.ts` so Server Components can use `cn`)                                                                                                                                                                          |
| `icons.tsx`                    | Icon types + the small built-in SVG set                                                                                                                                                                                                                                       |
| `primitives/Typography.tsx`    | `Display` / `Headline` / `Title` / `Body` / `Label`                                                                                                                                                                                                                           |
| `primitives/StateLayer.tsx`    | MD3 interaction state overlay                                                                                                                                                                                                                                                 |
| `components/`                  | TextField, NumberField, PhoneField, ImageField, ComboBox, Checkbox, Switch, Radio, Select, DatePicker, DateRangePicker, TimePicker, Button, IconButton, ButtonGroup, SegmentedButton, SplitButton, FabMenu, Chip, Card, Carousel, ListItem, GridList, Menu, MenuItem, Dialog, DialogContent, ModalDialog, Modal, SideSheet, BottomSheet, Disclosure, Tabs, Tooltip, PreviewTrigger, Snackbar, Tag, Badge, Avatar, Table, TopAppBar, Toolbar, Search, NavigationRail, NavigationDrawer, BottomNavigation, Slider, EmptyState, Divider, ProgressIndicator, LoadingIndicator, Meter, `color/*` |
| `adapters/next.tsx`            | Optional: Next router provider + `next/image` renderer. Delete if not on Next.js                                                                                                                                                                                              |
| `adapters/react-router.tsx`    | Optional: React Router (or TanStack Router) provider so `href` links navigate client-side. Delete if not on React Router                                                                                                                                                      |
| `changed.mjs`                  | The update check: lists the kit files a project changed since it installed them, against `RELEASE.json` — `node <ui>/ds/changed.mjs`, see [Taking an update](updating.md#taking-an-update). Node builtins only. In the registry as `@ds/changed`                                                          |
| `RELEASE.json`                 | Generated by `npm run registry:build`: the kit's version, two digests of every file the registry carries, by where it lands, and the items `@ds/ds` does not bring with their files (`optional`). Carried by `@ds/ds` alone, so only the whole install replaces it          |
| `releases/<item>.json`         | Generated by `npm run registry:build`, one per item `@ds/ds` does not bring (the three adapters, the Editorial preset): its name, the version and its files' digests. Carried by that item, so the update check knows a project holds it and which release it is from          |
| `scripts/changed.check.mjs`    | Makes the update check speak on a fixture install, and holds `RELEASE.json` to what the build computes — `npm run registry:check-install`                                                                                                                                     |
| `LICENSE`                      | MIT — also a registry item (`@ds/license`) that every other item depends on, so a `shadcn add` copy lands with the notice at `<ui>/ds/LICENSE`                                                                                                                               |
| `CHANGELOG.md`                 | What changed between releases, and which entries need action from a consumer who edited a kit file                                                                                                                                                                              |
| `adapters/react-hook-form.tsx` | Optional: `FormTextField` / `FormNumberField` / `FormPhoneField` / `FormImageField` / `FormCheckbox` / `FormCheckboxGroup` / `FormSwitch` / `FormRadioGroup` / `FormSelect` / `FormChipGroup` / `FormComboBox` bound through `Controller`                                                           |
| `stories/`                     | The catalog, by Material's taxonomy — plus `stories/interactions/`, the behaviour tests                                                                                                                                                                                        |
| `vitest.config.ts`             | The two test projects (`material`, `editorial`) — see [Tests](catalog-and-tests.md#tests--every-story-is-one)                                                                                                                                                                                                                 |
| `skills/ds-theme/`            | Claude Code skill: give a project a look of its own from its DESIGN.md. `design-md.md` beside it is the contract: what the kit reads in a DESIGN.md. Lands in a project's `.claude/skills/` (`@ds/theme-skill`)                                                              |
| `skills/ds-build/`            | Claude Code skill: the rules for building with the kit and what a project may change (`@ds/build-skill`)                                                                                                                                                                     |
| `skills/ds-spec/`             | Claude Code skill + `md3.mjs`: the live Material 3 spec, Do/Don't and tokens from m3.material.io (`npm run md3`; `@ds/spec-skill`)                                                                                                                                           |
| `scripts/build-registry.mjs`   | Generates `registry.json`: every item, from this folder                                                                                                                                                                                                                       |
| `scripts/check-install.mjs`    | The rule that holds the one install whole: `ds`, and anything an update names, writes nothing into a project's CSS; `ds` reaches the generator, every skill and every file a skill names; a script's imports are declared by its item; no skill names this repository; every skill's frontmatter parses, with its folder's name and a description that opens with when to load it; the update command is written one way; no item lands a skill that is not the kit's own — `npm run registry:check-install`                                             |
| `scripts/check-components.mjs` | The rule that holds the kit's own components a named group: the list in [The kit's own](../README.md#the-kits-own) is the set of component files that say Material 3 does not describe them, and every other component file cites a page of m3.material.io; and no file under `components/` or `primitives/` names the mono face — `npm run registry:check-install` |
| `scripts/check-docs.mjs`       | The rule that every component `index.ts` exports carries its doc comment on its exported declaration, where an editor and the generated types read it — `npm run docs:check` |
| `spec-version.json`            | Site content version the components were last audited against (`npm run md3 -- check`)                                                                                                                                                                                        |

### Token scales

- **Color** — `bg-primary`, `text-on-primary`, `bg-secondary-container`,
  `bg-surface-container-{lowest,low,,high,highest}`, `border-outline-variant`,
  `bg-inverse-surface`, `bg-scrim`, `text-error`, …
  `tokens/theme.css` also sets an **ambient content color** (`color:
  var(--md-sys-color-on-surface)` on `:root` and `.dark`), so text inherits the
  right role in both schemes and a `bg-<role>` container only has to carry its
  `text-on-<role>` to recolor everything inside it. The `Typography` primitives
  therefore assert no color; pass `colorRole="on-surface-variant"` (or any
  role) to state one. Set `color` on `<body>` to override the default.
- **Type** — `text-display-large` → `text-label-small` (15 roles), on two
  faces: `font-brand` (display / headline / title) and `font-plain` (body /
  label), both defaulting to the same `--font-inter` hook. Each role has a
  family of its own beside them, `font-<role>` (`font-label-large`), which
  reads `--md-sys-typescale-<role>-font`: the family a project's DESIGN.md
  writes on that role, and its face where it writes none. So a face
  overridden in a preset or on a subtree still moves every role with no
  family of its own. The `Typography` primitives write `font-<role>`; a raw
  `text-*` class carries no family. Each `text-*` class
  carries its role's size, line height, tracking and weight
  (`--md-sys-typescale-<role>-weight`, one for each of the 15 roles), and the
  primitives write no weight of their own: a weight a project's DESIGN.md
  gives a role is the weight both draw. A third face is the
  project's to reach for: `font-mono`, for an identifier, a time, an amount.
  It is the family a project's DESIGN.md names as `typography.mono.fontFamily`
  (the token `--md-sys-typescale-mono-font`), and the system's monospace when
  it names none. No kit component uses it, and `scripts/check-components.mjs`
  refuses one that would. **If your entry CSS already declares `--font-mono`**
  (compiled with Tailwind 4 both ways, 2026-10-11): inside `@theme`, the
  declaration Tailwind reads last wins. Yours written after the kit's import
  wins, and then `font-mono`, `code`, `kbd`, `samp` and `pre` draw your face
  and `typography.mono` in DESIGN.md moves nothing; yours written before the
  import loses to the kit's. Keep one source: delete your line and name the
  face in DESIGN.md, or keep your line after the import and name none.
  Outside `@theme` (a `--font-mono` on `:root`, or the variable a font loader
  sets on `<html>`) it moves nothing: the kit's line is `@theme inline`, so
  the utility reads the token itself. Give such a loader's variable another
  name and name the family in DESIGN.md.
- **Shape** — `rounded-shape-extra-small` (4px) → `rounded-shape-extra-large`
  (28px), `rounded-shape-full`; between `large` (16px) and `extra-large`,
  `rounded-shape-large-increased` (20px).
- **Elevation** — `shadow-elevation-1` … `shadow-elevation-5`.
- **Motion** — `duration-short-1` … `duration-long-4`, `ease-standard*`,
  `ease-emphasized*`.
- **State** — `state-opacity-{hover,focus,pressed,dragged}` (8 / 10 / 10 / 16 %,
  from `--md-sys-state-*`), plus `opacity-38` and `/12` for disabled content
  and containers.

