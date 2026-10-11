# MD3 kit — Material Design 3 on Tailwind

A self-contained Material Design 3 component kit: MD3 design tokens, a styling
contract built on `tailwind-variants`, and ~45 components with accessible
behavior from React Aria — enough for a whole application shell, proved by a
fresh Vite app that builds one with **no Radix in its dependency tree**
(see _Install from the registry_). MIT licensed (`LICENSE`) — and the notice
travels with the code: every registry item ships it, so an installed copy has
the terms beside it.

**Two ways in, no npm package.** Either install through the shadcn CLI from the
kit's registry (recommended — see _Install from the registry_ below), or copy
the kit's folder into your project's source tree as `ds/`. Either way the code is
yours to edit. All imports inside the folder are relative, so it works at any
path under any alias.

> Source: `french-tech-homies/design-system` · **v0.2.0**. Keep this
> marker — with the version — and it tells you exactly which release your copy
> came from. See _Versioning and upgrades_.

---

## Install from the registry

The kit is published as a shadcn registry under the `@ds` namespace. It
targets shadcn's React Aria base. Verified end to end against a fresh Vite app
and a fresh Next app on 2026-08-27, and again with the Editorial preset
applied. Every
gotcha that test turned up is written into this section.

**Verified again on 2026-08-28, this time for the whole shell.** A fresh
`create-vite` React+TS app ran `npx shadcn init @ds/base` and
`npx shadcn add @ds/ds`, then built an application
shell out of `TopAppBar`, `NavigationRail`, a modal `NavigationDrawer`,
`Tabs`, a `DisclosureGroup`, both `ProgressIndicator` forms and `Divider`.
`tsc -b && vite build` came out green, and its lockfile has **no `@radix-ui`
entry at all** — the kit brings `react-aria-components` and its own small
peer set, and nothing else.

**Canonical URL — `https://french-tech-homies.github.io/design-system/r/{name}.json`.**
Use this one. It is also where the **component catalog** lives
(`https://french-tech-homies.github.io/design-system/`).

Both are published from this repository's `main` by
`.github/workflows/pages.yml`, which builds the registry and the catalog and
publishes them only after every check passed on the same commit. The built
registry is not committed: `npm run registry:build` writes it to `r/`.

<!-- retired-names -->

### Coming from `@md3`

Through 0.2.0 the kit was built inside the pipao-v2 repository and served under
the namespace `@md3` from two addresses,
`https://french-tech-homies.github.io/pipao-v2/r/{name}.json` and
`https://www.pipao.app/r/{name}.json`. **Both are retired**: nothing new is
published there and they will stop answering. The all-in-one item was `md3`
and the files landed under `<ui>/md3/`. To move a project over:

1. In `components.json` (or `package.json`), replace the `"@md3"` entry of
   `registries` with
   `"@ds": "https://french-tech-homies.github.io/design-system/r/{name}.json"`.
2. From a clean working tree, `git mv <ui>/md3 <ui>/ds`, then replace
   `ui/md3` with `ui/ds` in your imports and in the two `@import` lines of
   your entry CSS (`…/md3/tokens/theme.css`, `…/md3/tokens/theme.v4.css`).
   If you generated a theme of your own, the path of the generator in your
   `theme:generate` script moves the same way.
3. `npx shadcn add @ds/ds --overwrite -y`, then read `git diff` as for any
   update (see _Taking an update_).

Every other item keeps its name (`@md3/button` is `@ds/button`), and so do
the `--md-sys-*` variables. The skills land as `ds-theme`, `ds-build` and
`ds-spec`: a skill folder an earlier install left under another name in
`.claude/skills/` is not updated, and can be deleted.

<!-- /retired-names -->

**Declare the namespace first.** It goes in `components.json` *or* in
`package.json`; both work for `add`, and only the `package.json` form works
for `init` (which is what writes `components.json` in the first place):

```jsonc
// package.json
{ "registries": { "@ds": "https://french-tech-homies.github.io/design-system/r/{name}.json" } }
```

**Then initialise.** Two routes, both fine:

```bash
npx shadcn@latest init @ds/base     # MD3 straight away: aria-nova style,
                                     # lucide icons, theme files + utils installed
npx shadcn@latest init -b aria -p nova   # plain React Aria base, MD3 added after
```

`@ds/base` is a `registry:base`, and the CLI does apply a third-party base's
`config` — `components.json` comes out with `"style": "aria-nova"` and
`"iconLibrary": "lucide"` and no preset prompt — and installs its
`registryDependencies` (`@ds/theme`, which brings `@ds/tokens`, + `@ds/utils`
+ `@ds/license`). It does
**not** copy the `registries` map into `components.json`, so keep the
`package.json` entry (or add it to `components.json` afterwards).

**On a Vite app, Tailwind v4 and the `@/*` alias must already exist** or `init`
refuses with "No Tailwind CSS configuration found" / "Could not find valid path
aliases". `create-next-app` ships both; `create-vite` ships neither, so first:

```bash
npm install tailwindcss @tailwindcss/vite
```

then `@import "tailwindcss";` in `src/index.css`, the `@tailwindcss/vite`
plugin plus a `"@"` → `./src` alias in `vite.config.ts`, and `paths` in
`tsconfig.json` / `tsconfig.app.json`. Use `paths` **without** `baseUrl`:
TypeScript 6 errors on `baseUrl` (TS5101), and `create-vite` now ships
TypeScript 6.

**Then install:**

```bash
npx shadcn add @ds/ds        # the one install: everything below, under <ui>/ds/ and .claude/skills/
npx shadcn add @ds/button     # or one component (its deps come along)
npx shadcn add @ds/theme      # or only the theme files and the shadcn bridge
```

**What the one install brings.** `add @ds/ds` leaves a project holding
everything an agent needs to give it a look of its own, with nothing else to
fetch from the kit:

| What | Where it lands | Item |
| --- | --- | --- |
| Every component and primitive, the barrel `index.ts` | `<ui>/ds/…` | one per component |
| The kit's default theme, as files: `tokens/theme.css`, `tokens/theme.v4.css`, `tokens/bridge-shadcn.css`, the complete `tokens/DESIGN.resolved.md`, and the neutral `DESIGN.md` they are generated from | `<ui>/ds/…` | `@ds/tokens` |
| The DESIGN.md generator: `tokens/design-md.mjs` and `tokens/generate-theme.mjs`, beside the `theme.v4.css` template it reads, with `tsx`, `@material/material-color-utilities`, `yaml` and `@google/design.md` as dev dependencies | `<ui>/ds/tokens/` | `@ds/design-md` |
| `ds-theme`: write the project's DESIGN.md from a brief, generate, read the warnings, wire the entry CSS, take an update. Carries the DESIGN.md contract (`design-md.md`) | `.claude/skills/ds-theme/` | `@ds/theme-skill` |
| `ds-build`: the rules for building with the kit, what a project may change, the resolved file as the reference | `.claude/skills/ds-build/` | `@ds/build-skill` |
| `ds-spec`: the live Material 3 spec, Do/Don't and tokens | `.claude/skills/ds-spec/` | `@ds/spec-skill` |
| The MIT notice | `<ui>/ds/LICENSE` | `@ds/license` |

The skills are Claude Code **project** skills: in a shadcn target `~/` is the
project root, not the person's home, so they land in the project's own
`.claude/skills/` and are versioned with it. A skill names only files the
install brings, and nothing of the repository the kit is built in;
`npm run registry:check-install` (`scripts/check-install.mjs`)
refuses a registry or a skill that breaks either rule.

**Then import the theme. No item writes a palette value into your CSS.** The
theme is whatever your entry CSS imports, so a fresh install is unthemed until
these two lines are there (the CLI prints them after `add @ds/ds`):

```css
@import "tailwindcss";
@import "./components/ui/ds/tokens/theme.css";
@import "./components/ui/ds/tokens/theme.v4.css";
```

What `@ds/ds`, `@ds/theme` and `@ds/base` do write into `:root` / `.dark`
is the shadcn bridge: references such as
`--background: var(--md-sys-color-background)`, the same under any theme, so
an existing shadcn palette follows the Material roles. Components pulled in
only as _dependencies_ write nothing.

**For a look of your own**, open your agent in the project and ask for one
("make it look like cyberpunk"). The `ds-theme` skill copies the kit's
`DESIGN.md` to the project's root when it has none, writes the brief into it,
runs

```bash
npx tsx <ui>/ds/tokens/generate-theme.mjs DESIGN.md --out theme
```

and points the two imports at `theme/` instead. The install never writes the
project's root `DESIGN.md` or its `theme/` folder, so no update can put the
kit's default back over them. Walked by hand on 2026-10-11 in a fresh
`create-vite` app, from a local copy of the registry: install, a DESIGN.md
with another seed and a written role, the generated theme, the format's
linter on both files, `tsc -b && vite build`, then `add @ds/ds` again with
the project's three theme files unchanged.

Files land under your `ui` alias at `ds/…`, mirroring this folder, because
the kit's relative imports are kept as-is. Registry items are generated from
this folder by `npm run registry:build` (`scripts/build-registry.mjs` →
`registry.json` → `r/`), so the registry can't drift from the source.

**What `add` installs for you** — `react-aria-components`, `tailwind-variants`,
`clsx`, `tailwind-merge`, `tw-animate-css`, and `react-phone-number-input` for
`PhoneField`; and, as dev dependencies, the generator's four packages above.
**What it does not** — Tailwind itself and the path alias (see
above), and the router adapters, which are not part of `@ds/ds`: add
`@ds/next-adapter` or `@ds/react-router-adapter` explicitly, or `Button href`
/ `Chip href` / `Menu` item `href` will do full page loads.

**The licence comes with it.** Every item depends on `@ds/license`, a
`registry:file` that drops the kit's MIT notice at `<ui>/ds/LICENSE`, beside
the code it covers. `add @ds/button` delivers it just as `add @ds/ds` does,
and re-adding is a no-op — an unchanged file is skipped. Every served item also
carries the terms in `meta`, before anything is copied:

```bash
curl -s https://french-tech-homies.github.io/design-system/r/button.json | jq .meta
# → { "kit": "<owner>/<repository>", "version": "0.2.0", "license": "MIT" }
```

**Re-running `add` never silently clobbers your edits — and never silently
updates either.** An identical file is skipped ("files might be identical");
a file that **differs** raises a per-file overwrite prompt that defaults to
*No* — even under `-y` — and only `--overwrite` replaces it. The CLI keeps no
record of what it installed, so "differs" covers both a file you edited and a
file the kit changed: it cannot tell them apart. An update is therefore
`--overwrite` plus your own diff — see _Taking an update_.

## Install by copying the folder

**1. Copy the folder.** Drop the kit's folder anywhere in your source tree,
as `ds/` (e.g. `src/ds`, `app/ui/ds`).

**2. Install the peer dependencies.**

```bash
npm install react-aria-components tailwind-variants tailwind-merge clsx tw-animate-css
```

`PhoneField` additionally needs `react-phone-number-input` (parsing,
formatting, flags); skip it — and delete the component — if you have no
phone input.

Tested against: `react-aria-components` ^1.20, `tailwind-variants` ^1.0,
`tailwind-merge` ^3.6, Tailwind CSS ^4.1, React 19. No Tailwind plugin is
needed: interaction states use Tailwind's own variants (`hover:`,
`focus-visible:`, `disabled:`) and the bare data-attribute variants React Aria
emits (`data-pressed:`, `data-entering:`, `data-[placement=top]:`) — the same
conventions as shadcn/ui's React Aria base. Tailwind v3 is not supported.

The kit ships **no icon library**. Its own affordances (check, close, chevrons,
spinner) are inline SVGs in `icons.tsx`; icon props accept any component taking
`{ size, className }`, so `lucide-react`, `react-feather`, or your own SVGs all
drop in unchanged.

**3. Wire up Tailwind** — in your entry CSS:

```css
/* ── every @import first — see the ordering rule below ── */
@import "tailwindcss";
@import "./ds/tokens/theme.css"; /* --md-sys-color-* variables, light + dark */
@import "./ds/tokens/theme.v4.css"; /* @theme inline: maps them to utilities */
@import "tw-animate-css"; /* animate-in / animate-out */

/* ── then everything else ── */
/* theme.css keys dark mode on a .dark class — leave this line out when the
   project's DESIGN.md chooses the system setting (--md3-dark-mode: system) */
@custom-variant dark (&:where(.dark, .dark *));
```

> **Keep every `@import` above `@source` and `@custom-variant`.**
> CSS requires `@import` to precede other at-rules. PostCSS tolerates a stray
> one; Vite (so: Storybook, and Vite-based apps) silently **drops** it. The
> failure is quiet — the imported theme's utilities just never generate, and
> the first symptom is usually `Cannot apply unknown utility class` from an
> unrelated `@apply`, or animations that simply don't play.

**4. Toggle dark mode** by putting a `.dark` class on `<html>`. Any mechanism
works — `next-themes`, a one-line `classList.toggle`, a server-rendered class.
The kit never imports a theming library. A project whose `DESIGN.md` chooses
the system setting instead has nothing to toggle: its generated `theme.css`
follows `prefers-color-scheme` (see _The theme comes from DESIGN.md_).

**5. Already using shadcn/ui?** Add one more import — after `theme.css`, and
still above the non-`@import` at-rules — and your existing shadcn components
inherit the Material palette without any component changes:

```css
@import "./ds/tokens/theme.css";
@import "./ds/tokens/bridge-shadcn.css"; /* ← right after theme.css */
@import "./ds/tokens/theme.v4.css";
```

It defines `--background`, `--card`, `--popover`, `--muted`, `--accent`,
`--destructive`, `--border`, `--input`, `--ring`, `--radius`… as finished colors
derived from the MD3 roles (`accent` → `surface-container-high`, `muted` →
`surface-container-highest`, `popover` → `surface-container`, `ring` →
`secondary`; the file documents every mapping). One token source, two
component families.

The bridge only supplies the _variables_; keep a small `@theme inline` of your
own for the shadcn-named utilities (`--color-card: var(--card)`, …) and the
radius scale — see this repo's `src/styles/globals.css`. One deliberate
collision: `bg-primary` / `bg-secondary` are the MD3 roles, so shadcn's
`variant="secondary"` renders as an MD3 filled secondary until you re-skin it.

**6. Optional — pin what gets scanned.** Tailwind v4's automatic source
detection will scan markdown and other non-source files in your project, which
can generate junk utilities out of prose. To restrict it to your source tree:

```css
@import "tailwindcss" source(none);
@source "./src";
```

---

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

---

## What's in the folder

| Path                           | Contents                                                                                                                                                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.md`                    | The kit's own DESIGN.md: a neutral slate set in Inter, the source of the default theme the kit ships — see _The theme comes from DESIGN.md_                                                                                                                                   |
| `tokens/theme.css`             | The kit's default MD3 color scheme, light + dark (on `.dark` or the system setting), as `--md-sys-color-*: hsl(...)` finished colors — generated from the kit's own `DESIGN.md`                                                                                               |
| `tokens/theme.v4.css`          | Tailwind v4 `@theme inline` mapping (colors, type, shape, elevation, motion); its type, corner, face, elevation, state and motion values are set from `DESIGN.md`                                                                                                             |
| `tokens/design-md.mjs`         | DESIGN.md → theme: the derivation, pure (text in, text out) — see _The theme comes from DESIGN.md_. In the registry as `@ds/design-md`                                                                                                                                       |
| `tokens/generate-theme.mjs`    | The command behind `npm run theme:generate`: reads a DESIGN.md, writes the three files. In the registry as `@ds/design-md`                                                                                                                                                   |
| `tokens/DESIGN.resolved.md`    | Generated: the complete DESIGN.md (every role of both schemes, the whole type scale, the corners, the reference CSS block, how dark is switched) — the one agents read                                                                                                        |
| `tokens/design-md.check.mjs`   | Rule checks for the derivation — `npm run theme:check`                                                                                                                                                                                                                        |
| `tokens/resolved.json`         | Generated snapshot of every token as plain values (hex, px, ms) — `npm run theme:resolve`                                                                                                                                                                                     |
| `tokens/resolve-theme.mjs`     | Produces `resolved.json` from theme.css + theme.v4.css                                                                                                                                                                                                                        |
| `tokens/bridge-shadcn.css`     | Optional shadcn ↔ MD3 variable layer                                                                                                                                                                                                                                          |
| `tokens/preset-editorial.css`  | A deliberately un-Material identity, class-scoped — the worked example for _Retheming_ below                                                                                                                                                                                  |
| `conventions.md`               | How components are written — token idiom, tv slots, state layers, data-slot, what to check before adding one                                                                                                                                                                  |
| `components/field-styles.ts`   | The **style module** for the field container (`tv` slots), rendered by `TextField`, `NumberField`, `PhoneField`, `Select` and `ComboBox` — its `kind` variant is what lets one container serve typed, composite and trigger fields. Fork this to change field anatomy          |
| `utils.ts`                     | `twMergeConfig`, `tv`, `cn`, `focusRing` — server-safe, no React Aria import                                                                                                                                                                                                  |
| `render-props.ts`              | `composeTailwindRenderProps` (client-only; kept out of `utils.ts` so Server Components can use `cn`)                                                                                                                                                                          |
| `icons.tsx`                    | Icon types + the small built-in SVG set                                                                                                                                                                                                                                       |
| `primitives/Typography.tsx`    | `Display` / `Headline` / `Title` / `Body` / `Label`                                                                                                                                                                                                                           |
| `primitives/StateLayer.tsx`    | MD3 interaction state overlay                                                                                                                                                                                                                                                 |
| `components/`                  | TextField, NumberField, PhoneField, ImageField, ComboBox, Checkbox, Switch, Radio, Select, Button, IconButton, Chip, Card, ListItem, GridList, Menu, MenuItem, Dialog, DialogContent, ModalDialog, Modal, SideSheet, Disclosure, Tabs, Tooltip, PreviewTrigger, Snackbar, Tag, Avatar, Table, TopAppBar, NavigationRail, NavigationDrawer, BottomNavigation, Slider, EmptyState, Divider, ProgressIndicator, `color/*` |
| `adapters/next.tsx`            | Optional: Next router provider + `next/image` renderer. Delete if not on Next.js                                                                                                                                                                                              |
| `adapters/react-router.tsx`    | Optional: React Router (or TanStack Router) provider so `href` links navigate client-side. Delete if not on React Router                                                                                                                                                      |
| `LICENSE`                      | MIT — also a registry item (`@ds/license`) that every other item depends on, so a `shadcn add` copy lands with the notice at `<ui>/ds/LICENSE`                                                                                                                               |
| `CHANGELOG.md`                 | What changed between releases, and which entries need action from a consumer who forked a file                                                                                                                                                                                |
| `adapters/react-hook-form.tsx` | Optional: `FormTextField` / `FormNumberField` / `FormPhoneField` / `FormImageField` / `FormCheckbox` / `FormCheckboxGroup` / `FormSwitch` / `FormRadioGroup` / `FormSelect` / `FormChipGroup` / `FormComboBox` bound through `Controller`                                                           |
| `stories/`                     | The catalog, by Material's taxonomy — plus `stories/interactions/`, the behaviour tests                                                                                                                                                                                        |
| `vitest.config.ts`             | The two test projects (`material`, `editorial`) — see _Tests_                                                                                                                                                                                                                 |
| `skills/ds-theme/`            | Claude Code skill: give a project a look of its own from its DESIGN.md. `design-md.md` beside it is the contract: what the kit reads in a DESIGN.md. Lands in a project's `.claude/skills/` (`@ds/theme-skill`)                                                              |
| `skills/ds-build/`            | Claude Code skill: the rules for building with the kit and what a project may change (`@ds/build-skill`)                                                                                                                                                                     |
| `skills/ds-spec/`             | Claude Code skill + `md3.mjs`: the live Material 3 spec, Do/Don't and tokens from m3.material.io (`npm run md3`; `@ds/spec-skill`)                                                                                                                                           |
| `scripts/build-registry.mjs`   | Generates `registry.json`: every item, from this folder                                                                                                                                                                                                                       |
| `scripts/check-install.mjs`    | The rule that holds the one install whole: `ds` reaches the generator, every skill and every file a skill names; a script's imports are declared by its item; no skill names this repository — `npm run registry:check-install`                                             |
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
  label), both defaulting to the same `--font-inter` hook. The `Typography`
  primitives apply them; raw `text-*` classes do not.
- **Shape** — `rounded-shape-extra-small` (4px) → `rounded-shape-extra-large`
  (28px), `rounded-shape-full`.
- **Elevation** — `shadow-elevation-1` … `shadow-elevation-5`.
- **Motion** — `duration-short-1` … `duration-long-4`, `ease-standard*`,
  `ease-emphasized*`.
- **State** — `state-opacity-{hover,focus,pressed,dragged}` (8 / 10 / 10 / 16 %,
  from `--md-sys-state-*`), plus `opacity-38` and `/12` for disabled content
  and containers.

---

## Catalog

Hosted at **`https://french-tech-homies.github.io/design-system/`**, republished
from `main` by `.github/workflows/pages.yml`. That is the kit's
documentation: every component with its variants, plus the Foundations pages
(colour, typography, shape & elevation, motion, interaction states) rendered
straight from `tokens/resolved.json`.

`npm run storybook` opens the component catalog, organised the way
m3.material.io is — `MD3/Foundations` (color, typography, shape & elevation,
motion, interaction states — rendered from `tokens/resolved.json`), then
`Actions`, `Communication`, `Containment`, `Navigation`, `Selection`. Every
component story shows at least three variants; stories live in
`stories/`. CI (`.github/workflows/checks.yml`) builds the
catalog and fails if `resolved.json` is stale. `conventions.md` is the
contract new components follow.

### Your project's theme in the catalog

A project that took the kit from the registry has the components and the
generator, and no Storybook. The catalog is where it sees every story under
its own theme: open the page **`MD3/Your theme`**
(`https://french-tech-homies.github.io/design-system/?path=/story/md3-your-theme--page`,
or `npm run storybook` in this repository) and hand it what the project
generated, by the file picker or by dropping the files on the page:

- **`theme/theme.css` and `theme/theme.v4.css` together**, the two files the
  project's entry CSS imports, or
- **the project's `DESIGN.md` alone**: the catalog runs `tokens/design-md.mjs`
  in the browser, the module the project's own command runs, and lists its
  warnings on the page.

Every story then draws under that theme, in light and in dark, across stories
and reloads. The toolbar's **Preset** reads "Your theme (handed)" while it
does, so a picture of the catalog is not taken for the kit's default. Preset →
Material puts the default back and keeps the theme; "Forget this theme" on the
page drops it.

**Nothing is uploaded.** The files are read in the browser and kept in that
browser's `localStorage`, nowhere else. A handed file is never inserted into
the page: it is parsed in a stylesheet that styles nothing, and only custom
properties under the theme's own names (`--md-sys-color-*`, the type, corner,
elevation, state and motion scales, `--md3-duration-*`, the `--font-*` hooks)
are set, one by one. A value that names an address (`url(…)`, an `@import`) is
left out and listed on the page, so no file can make the catalog fetch
anything or restyle anything but the theme.

What a handed theme does not move, said on the page too:

- **Fonts.** The catalog loads Inter and fetches no face by a name read from
  a file. A family the theme names draws if the machine has it installed,
  otherwise the stack behind it does.
- **The dark switch.** A handed theme obeys the toolbar's Theme switch,
  whether its DESIGN.md chose `class` or `system`.
- **Hand edits to `theme.v4.css` outside its `--md-sys-*` and
  `--md3-duration-*` values** (a Tailwind namespace mapping, an `@utility`
  block): the catalog's utilities were compiled when it was built.
- **`MD3/Foundations`**, which documents the shipped theme from
  `tokens/resolved.json`, and the **Editorial preset**, which is off while a
  handed theme draws.

`theme.css` or `theme.v4.css` alone is refused, in words that say to hand
both: half a theme under the name "Your theme" would mislead. The machinery
is `.storybook/handed-theme/`; its tests are the hidden stories of
`stories/YourTheme.stories.tsx`.

## Tests — every story is one

```bash
npm run test-storybook                        # both presets
npm run test-storybook -- --project=editorial # just the preset
npm run test-storybook:watch                  # while working
```

Vitest renders every story in a real Chromium (Playwright), runs its `play`
function where it has one, and runs **axe** over the result. It does this
twice — once under the shipped Material tokens and once under
`tokens/preset-editorial.css` — because a component that is only accessible
under one palette is not accessible. CI runs the same command; a regression
fails the build.

Behaviour tests live in `stories/interactions/` (`MD3/Interactions/*`),
apart from the visual catalog, and assert the **keyboard** path: Space
toggles, arrows move, Enter commits, Escape closes and returns focus. The bar
a new component has to clear is in `conventions.md`, "The quality bar".

One axe rule is switched off, on two stories, with the reason next to it: MD3's
disabled content is `on-surface` at 38 % and never reaches 4.5:1 (WCAG 1.4.3
exempts inactive components) — `InteractionStates/Disabled` and
`ImageField/Disabled`. Nothing is disabled globally.

Running the tests the first time downloads a Chromium build:
`npx playwright install chromium`.
---

## Versioning and upgrades

The kit is **copy-distributed**: `shadcn add` writes files into your tree and
they are yours. So the thing that is versioned is the source you copied, and
the upgrade question is "what changed, and how do I re-apply my edits?".

### Which version am I on?

Three places say it, and they always agree — CI fails the build if they don't:

```bash
# what the kit ships today
curl -s https://french-tech-homies.github.io/design-system/r/button.json | jq .meta
# → { "kit": "<owner>/<repository>", "version": "0.2.0", "license": "MIT" }

# what you copied — the marker at the top of this file
head -15 src/components/ui/ds/README.md
```

Every generated registry item carries `meta.version`. `CHANGELOG.md` is the
list of what moved between releases, and it flags the entries that need action
from you.

### Taking an update

The CLI keeps no record of what it installed. It compares your file with the
incoming one and nothing else, so it cannot tell a file **the kit changed**
from a file **you edited**. Observed, not assumed (2026-10-11, shadcn 4.19, a
fresh Vite app updated from a registry copy with three kit files changed):

| your file against the incoming one | `shadcn add @ds/<item>` |
| --- | --- |
| doesn't exist | created |
| byte-identical | `Skipped … (files might be identical)` |
| **differs** — the kit changed it, or you did | per-file prompt, defaulting to **No** — _even under `-y`_ |
| differs, `--overwrite` | replaced; an edit of yours in it is gone |

So a plain re-add does **not** update a kit file you never touched: it asks.
And with no one to answer — a script, CI, an agent — the run stops at the
first such file having written nothing (stdin closed), or waits for ever
(stdin open). The loop is therefore git's, not the CLI's:

1. Read `CHANGELOG.md` from your version to the current one, and commit your
   work: the tree must be clean.
2. `npx shadcn add @ds/ds --overwrite -y` (or the individual items you
   use). Every kit file that differs is replaced. Your `DESIGN.md`, your
   `theme/` folder and your entry CSS's imports are not targets of any item.
3. `git diff` is the update. For a file you never edited there is nothing to
   do. For a file you forked, the diff shows your edit removed among the
   kit's changes: put your edit back by hand, keeping theirs.
4. If you generated a theme of your own, regenerate it
   (`npx tsx <ui>/ds/tokens/generate-theme.mjs DESIGN.md --out theme`): the
   kit's `tokens/theme.v4.css` is the template your copy is written from.
   Lint, and read the diff of `theme/`.

Answering the prompts by hand, file by file, also works at a terminal: Yes for
a file you never edited, No for a fork you will merge later.

Because `fieldStyles` backs all five fields, a field-anatomy change is *one*
merge, not five. That is the point of the style-module layer — see
_Retheming_.

### What each item does to your CSS variables

No item writes a palette value. The `--md-sys-*` variables, the `@theme
inline` mapping and the utilities are in the theme files, and your entry CSS
chooses which pair it imports: the kit's, or your own generated ones.

- **`@ds/ds`** (a `registry:style`), **`@ds/theme`** (a `registry:theme`)
  and **`@ds/base`** write the shadcn bridge into `:root` / `.dark`, and
  `@import "tw-animate-css"`: 19 variables, each a `var(--md-sys-color-*)`
  reference, and `--radius`. Asking for one by name again rewrites those same
  references and nothing else.
- **`@ds/tokens`** writes the kit's theme files under `<ui>/ds/`. They are
  the kit's: an update replaces them. A project's own theme lives in a folder
  of its own (`theme/`), which no item targets.
- **`@ds/button`, `@ds/select`, any component** only ever writes component
  files.

**Coming from an install made before the theme travelled as files?** The all-in-one item, `theme` and `base` used
to write the 49 roles and the whole `@theme inline` mapping into the entry
CSS. Those inline blocks come after every `@import`, so they override
imported theme files: delete the `--md-sys-*` declarations from `:root` and
`.dark`, and the kit's `@theme inline` block and `@utility` rules, then
import the two theme files. See `CHANGELOG.md`.

### Releasing (maintainers)

```bash
npm version minor --no-git-tag-version   # or patch; package.json is the only source of truth
npm run registry:build         # restamps every item's meta.version
npm run registry:check-version # what CI runs
# add the CHANGELOG entry, commit package.json, package-lock.json and registry.json together
```

`.github/workflows/checks.yml` fails when a bump was not followed by
`registry:build`, alongside the existing guards on `resolved.json` and registry
drift.

## Copy or npm package? — the decision

**The registry is the only supported distribution. There is no npm package,
and adding one is not planned.**

This repository has a `package.json` only to run its own catalog, tests and
registry build. It is `"private": true`, has no `exports` map and no build
step, and ships `.ts`/`.tsx` source: it is not something to `npm install`.

**Why copy-distribution is the right primary.** The kit's entire value
proposition is that the code is yours: the theming contract
(_Retheming — the three layers_ below) invites you to fork a style module,
and MD3 anatomy is opinionated enough that a real product will want to. A
package would make exactly that move require a fork of the package, which is
worse than a fork of one file. Copy-distribution also means no runtime
dependency on us, no version-range solving against your React Aria, and no
build output to keep in sync with your bundler.

**When to revisit.** Publish only if a consumer should *not* be able to fork —
a design system enforced across teams, where drift is the thing you are trying
to prevent. If that day comes, **pick one authoritative channel and say so in
this file**; shipping both a registry and a package without naming which is
canonical guarantees two versions of the same component in one codebase.

## Retheming — the three layers

An app on this kit must be able to look like itself, not like a Google app,
**and** keep taking kit updates that follow the Material spec. That only works
because the files you are invited to change and the files the kit owns are two
disjoint sets. There are three layers, and your identity lives in the first
two:

| layer | files | you may | a kit update |
| --- | --- | --- | --- |
| **tokens** | your `DESIGN.md` and the theme generated from it (`theme/theme.css`, `theme/theme.v4.css`), plus per-component escape-hatch variables (`--md3-field-notch`) | change anything, through `DESIGN.md` | never touches them. Components name roles and scales, never values, and no registry item writes a palette value or targets your theme folder. The kit's own `tokens/*` files are its default and are replaced by an update — import yours instead of editing them |
| **style modules** | `components/<x>-styles.ts` exporting `<x>Styles`. Today one: `components/field-styles.ts` → `fieldStyles`, the field container behind `TextField`, `NumberField`, `PhoneField`, `Select` and `ComboBox` | fork the file | keeps the **slot and variant names**; what a slot contains may change |
| **behaviour** | the React Aria wiring, `utils.ts`, `render-props.ts`, `icons.tsx` | nothing — compose, don't fork | keeps following the four m3.material.io pages for behaviour and accessibility, even where your look departs from them |

A `tv` becomes a style module only when more than one component renders from
it, or when its anatomy _is_ the product's identity. Everything else stays a
local `const styles = tv({…})` — still yours to edit, but not part of the
promised seam. What an update costs a themed app is in _What a themed app pays
at update time_ below.

### Every scale is a variable

`tokens/theme.v4.css` declares each scale twice: once under Material's own
token name (`--md-sys-shape-corner-full`, `--md-sys-typescale-body-large-size`,
`--md-sys-typescale-brand-font`, `--md-sys-elevation-1`,
`--md-sys-motion-easing-standard`, `--md-sys-state-hover-state-layer-opacity`)
and once as the Tailwind namespace or `@utility` that reads it through `var()`.
That indirection is
load-bearing: a literal written straight into a namespace is _inlined_ by
`@theme inline`, so `rounded-shape-full` would compile to a frozen
`border-radius: 9999px` and nothing could override it afterwards. Because every
scale goes through an `--md-sys-*` variable, a single class can retheme the
whole catalog at runtime.

### The preset that proves it

`tokens/preset-editorial.css` is a deliberately un-Material identity, shipped
to be read as much as used:

```bash
npx shadcn add @ds/preset-editorial
```

```css
@import "./ds/tokens/theme.css";
@import "./ds/tokens/theme.v4.css";
@import "./ds/tokens/preset-editorial.css";
```

```html
<html class="preset-editorial"></html>
```

It swaps a hand-written 49-role palette (ink on warm paper, oxblood accent),
2px corners in place of pills and the 28dp dialog corner, the magazine type
pairing (old-style serif headings over a humanist sans) on a tighter scale, 1px
`outline-variant` hairlines in place of elevation shadows, a state layer at
half Material's hover tint, and roughly half the durations. Delete
`.preset-editorial` from every selector to make it your default instead of an
opt-in. In the kit's Storybook it is the **Preset** switch in the toolbar, next
to light/dark. The switch has a third value, "Your theme (handed)": a
project's own generated theme, handed on the `MD3/Your theme` page (see
"Your project's theme in the catalog").

Everything above its `ANATOMY` divider is a plain variable override. Below it
is the one thing tokens cannot reach: **stacked field labels** instead of MD3's
floating-label notch, which is a `fieldStyles` slot rewrite. A real consumer
forks `components/field-styles.ts` and deletes that block; it exists in the
preset as CSS only so that one Storybook build can flip between the two
anatomies. That is the boundary working as designed — the Material "tell" that
survives a token swap is exactly what the style-module layer is for.

Two things that used to be out of a preset's reach are tokens now, because
both were literals compiled into a utility rather than variables:

```css
.my-preset {
  /* MD3's two faces. Both default to var(--font-inter), so a theme that sets
     neither still renders one family everywhere. `Typography` applies brand
     to display / headline / title, plain to body / label. */
  --md-sys-typescale-brand-font: "Iowan Old Style", Georgia, serif;
  --md-sys-typescale-plain-font: var(--font-inter);

  /* How loud interaction feedback is. Read by state-opacity-{hover,focus,
     pressed,dragged}, which is what every state layer in the kit uses —
     `opacity-8` would have been frozen at build time. Percentages, so the
     same variable also works as a color-mix() alpha. */
  --md-sys-state-hover-state-layer-opacity: 4%;
  --md-sys-state-focus-state-layer-opacity: 8%;
  --md-sys-state-pressed-state-layer-opacity: 12%;
  --md-sys-state-dragged-state-layer-opacity: 12%;
}
```

What a preset still cannot reach: the **disabled** alphas. `text-on-surface/38`
and `bg-on-surface/12` are written into each component as color modifiers, not
read from a variable, so changing them is a fork — of the component, or of
`fieldStyles` where a field is concerned. A handful of controls that tint their
own background instead of rendering an overlay (`Table` rows, the number-field
steppers, the combo-box and phone-field trigger icons) hold their state alpha
the same literal way; `bg-on-surface/(--md-sys-state-hover-state-layer-opacity)`
is the form that reads the token, if you fork one of them.

### What a themed app pays at update time

The mechanics are in _Versioning and upgrades_ above; what they mean for a
themed app is short:

- a **token** change (a new scale or utility in `tokens/theme.v4.css`) →
  `npx shadcn add @ds/ds --overwrite -y` (or `@ds/tokens`) from a clean tree,
  then regenerate your theme: the kit's file is the template yours is written
  from, and a plain re-add would stop at its prompt and write nothing. Your `DESIGN.md` and your
  generated palette are not targets of any item, so nothing of yours is at
  risk;
- an **anatomy** change to a style module you forked → the update replaces
  the file and you put your edit back from the diff, one file by hand.
  Because `fieldStyles` serves all five fields, that is **one** merge, not
  five — which is the whole reason the seam is one file and not thirty-five;
- a **behaviour or accessibility** fix → `shadcn add @ds/<component>
  --overwrite`, free, because you never forked it.

### The theme comes from DESIGN.md

A project keeps one `DESIGN.md` at its root, in
[Google Labs' format](https://github.com/google-labs-code/design.md)
(`@google/design.md` 0.4.0, spec `alpha`): YAML front matter for the tokens,
prose for the reasons. It is the only file anyone edits. The kit turns it into
the theme — both colour schemes, the type scale and the corners from the front
matter; elevation, motion, state layer opacities and how dark is switched from
one `## Reference CSS` block in the body:

```bash
tsx tokens/generate-theme.mjs <your DESIGN.md> --out <your theme folder>
```

That writes `theme.css`, `theme.v4.css` and `DESIGN.resolved.md` (the complete
file, for agents) into the folder you name; import the two stylesheets from
there, in place of the kit's `tokens/theme.css` and `tokens/theme.v4.css`. The
kit's `tokens/theme.v4.css` is the template your copy is written from, so
regenerate after a kit update.

**The contract is `skills/ds-theme/design-md.md`**: what the kit reads in the
front matter (`scheme`, `seed`, the six `*-key` colours, the 49 role names,
the 15 type roles, the 6 corners) and in the reference block (27 variables and
`--md3-dark-mode`), how colour names that are not the kit's are mapped by an
agent, what is ignored and listed as a warning, what is refused, the font
hook, the limits, and what `DESIGN.resolved.md` holds. It lives with the skill
and not here because it travels: it is the file an agent reads in a project
that installed the kit, where this README is not. `skills/ds-theme/SKILL.md`
is the path through it, step by step.

**The default the kit ships** comes from the kit's own `DESIGN.md`, beside
this README: a neutral slate — a quiet blue-grey primary, a grey secondary and
a warm grey tertiary, every role derived, none written — set in Inter. It is
what `tokens/theme.css` holds and what the registry's `tokens` item carries,
so it is what a project imports until it generates its own. The kit's
commands work on that file:

```bash
npm run theme:generate   # the kit's DESIGN.md → tokens/theme.css, theme.v4.css, DESIGN.resolved.md
npm run theme:resolve    # refresh tokens/resolved.json
npm run design:lint      # the format's own linter, on DESIGN.md and tokens/DESIGN.resolved.md
npm run theme:check      # the derivation's rule checks
```

`.github/workflows/checks.yml` regenerates the three files and fails on
a diff; a project that generates its own theme needs the same rule on its own
three files.

A theme on the system setting (`--md3-dark-mode: system`) is served by
`theme.css` and `theme.v4.css` only, for now. `npm run theme:resolve` reads
the `.dark` block and runs on the kit's own class theme, and
`preset-editorial.css` keys its dark palette on `.dark`.

Run the generator through `tsx`, not bare `node`:
`@material/material-color-utilities` 0.4.x ships extension-less relative
imports in its ESM build, which Node's own resolver rejects. The colour
library, `yaml`, `tsx` and the linter are the kit's `devDependencies`, and the
`design-md` registry item declares the same four, at the same ranges, for a
project.

A seeded palette is a Material-flavoured one — the tonal ramps _are_ the
Material look. For an identity of its own, see the preset above.

---

## Design decisions worth knowing

- **No ripple.** MD3's press ripple is approximated by the state-layer opacity
  alone. Deliberate: it keeps every control free of JS animation.
- **No animation library.** Modal, ModalDialog and the modal SideSheet animate
  through React Aria's `data-entering` / `data-exiting` states plus
  `tw-animate-css`; the standard SideSheet collapses via a
  `grid-template-columns: 1fr → 0fr` transition. Render them unconditionally and
  drive with `isOpen` — React Aria keeps the element mounted through the exit.
- **Snackbars are a global queue, not a hook.** `snackbar(text, options)`
  works from any module (a mutation callback, a store); `<SnackbarRegion />`
  renders once per layout. One snackbar at a time, the newest replacing the
  one on screen, exactly as the spec's "consecutive snackbars" rule asks —
  there is no stacking option on purpose.
- **Card interaction states** come from a parent `GridListItem`
  (`group/grid-list-item`). Use `Card`/`ListItem` inside `GridList` when you want
  hover/press feedback.
- **`StateLayer` keys on `isFocusVisible`**, not `isFocused`, so a mouse click
  doesn't leave a control looking permanently highlighted. The CSS-driven
  state layers (`group-data-focus-visible/button:state-opacity-focus`) follow
  the same rule.
- **Focus indicator is MD3's**: a 3px `secondary` ring offset 2px
  (`focusRing` in `utils.ts`), not shadcn's 2px primary ring.
- **`data-slot` on every root** (`button`, `card`, `chip`, `state-layer`,
  `modal`, …) plus `data-variant` / `data-size` where a variant exists — the
  shadcn convention, so consumers can target parts without reaching into
  class names.
- **`Button` and the assist `Chip` become links with `href`** (React Aria
  `Link`, same anatomy and states, routed through the router provider), and
  `Menu` items take `href` too — there is no `asChild` / slot pattern in the
  kit. `Button color="error"` is the destructive button MD3 does not define.
- **`Table` follows M2's data-table measurements on M3 roles** — M3 has no
  data-table page — with React Aria's sorting and selection.
- **There is no separate alert dialog.** MD3's dialogs page covers one
  component in two sizes; "alert" is a *use*, not a variant. So it is
  `<Dialog role="alertdialog">` — the ARIA role, plus `ModalDialog` turning
  light-dismiss off, because a click on the scrim must not answer a question
  that has to be answered. Escape still closes.
- **`PreviewTrigger` has no Material page either**, and neither does its
  category: a hover-opened card of arbitrary content is not in MD3. Use
  `Tooltip variant="rich"` — which *is* in the spec — when the content is a
  title, a paragraph and at most a link; use `PreviewTrigger` when it is a
  list, a form or anything the reader interacts with. It opens on focus and on
  long press as well as on hover, so its trigger must be focusable.
- **`Disclosure` has no Material page.** M2 had an expansion panel; M3 dropped
  it and never replaced it, so `m3.material.io` has no accordion, disclosure or
  expansion-panel entry. The anatomy is assembled from MD3 parts — a 56dp list
  row with a state layer, `outline-variant` hairlines, the shape scale, MD3
  motion — the same way `Table` follows M2's data-table measurements on M3
  roles. The component's doc comment names every part it borrowed.
- **`Tag` and `Avatar` are not Material components.** MD3 has no static
  label pill (its badge is the notification dot on an icon) and no standalone
  avatar; both exist because apps need them, drawn only in colour roles so
  they follow the palette. `Tag` is presentational — actions are chips.
- **One shell, three components.** `TopAppBar` titles the screen,
  `NavigationRail` runs down its leading edge in a medium or expanded window
  (collapsed at 96dp, expanded at 220dp — the spec's own two states) and
  `NavigationDrawer` is the full-height list, standard beside the content or
  modal over a scrim. All three are `<nav>`/`<header>` landmarks with
  `aria-current="page"`, never tab sets, and the app bar's title is a real
  heading. `BottomNavigation` stays the compact-window bar.
- **Server components**: `Typography`, `Card`, `ListItem`, `MenuItem`,
  `Tag`, `Divider`, `TopAppBar`, `EmptyState` and `DialogContent` render on the server; everything backed by
  React Aria carries `"use client"`. `react-aria-components` is marked
  `client-only`, so `utils.ts` deliberately does not import it — that is why
  `composeTailwindRenderProps` sits in `render-props.ts` instead. Keep it that
  way if you extend the kit, or `cn()` stops working in Server Components.

## Troubleshooting

Both of these fail _silently_ — they were found the hard way while adopting the
kit in its first host app.

**`Cannot apply unknown utility class …`, or a theme that has no effect, or
animations that never play.** An `@import` is sitting below a `@source` or
`@custom-variant`. Vite drops it without a warning (PostCSS does
not, so the same CSS can build fine in one pipeline and fail in the other —
typically Next builds, Storybook doesn't). Move every `@import` to the top.

**Two `@custom-variant dark` rules after a registry install.** Expected, not a
bug: shadcn's React Aria base writes `@custom-variant dark (&:is(.dark *))` and
the MD3 `theme` item appends `@custom-variant dark (&:where(.dark, .dark *))`
below it. The later declaration wins, which is the one you want — `:is(.dark *)`
misses the `.dark` element itself. The same applies to the palette: the base's
`:root` block stays in the file above MD3's, and MD3's later block overrides it.

**Extra `bg-md-sys-color-*` utilities.** Also expected. The CLI mirrors every
`cssVars.light` key into `@theme inline` as `--color-<key>`, so the 49 MD3 role
variables each gain a redundant utility alongside the real `bg-primary` /
`text-on-surface` ones. Harmless; ignore them.

**`'client-only' cannot be imported from a Server Component`, pointing at
`utils.ts`.** Something added a `react-aria-components` import to `utils.ts`.
That module is imported by the server-renderable components (and often by the
host app's own `cn`), so it must stay free of `client-only` packages — that is
why `composeTailwindRenderProps` lives in `render-props.ts`. Put new
RAC-dependent helpers there, not in `utils.ts`.

## Not included

Segmented button, search bar, date & time pickers. Add
them as you need them — the token and styling contracts above are what make
new components match, and `conventions.md`'s "quality bar" is what a new one
has to clear. Until they exist, an app that needs one of them reaches for a
headless component alongside the kit.

## Publishing this repository

This tree is written by a command, from the kit's source in another
repository: `LIFT.json` names the commit it was lifted from. Until that file
is gone, a change is made at the source and lifted again, never here.

**The first time**, in the lifted folder:

```bash
# 1. Make it a repository and commit. LIFT.json holds the commit to name.
git init -b main
git add -A
git commit -m "Lifted from $(node -p 'const l = require("./LIFT.json"); l.source.repository + "@" + l.source.commit.slice(0, 7)')"

# 2. Create the public repository and push.
gh repo create french-tech-homies/design-system --public --source=. --remote=origin --push

# 3. Serve Pages from GitHub Actions (or: Settings → Pages → Source = GitHub Actions).
gh api -X POST repos/french-tech-homies/design-system/pages -f build_type=workflow

# 4. Publish. The run started by the push in step 2 fails at "Configure Pages"
#    because step 3 came after it; run the workflow again.
gh workflow run pages.yml
gh run watch
```

**What to look at** once the run is green:

```bash
curl -sI https://french-tech-homies.github.io/design-system/ | head -1
# → HTTP/2 200: the catalog is at the site root
curl -s https://french-tech-homies.github.io/design-system/r/ds.json | jq '.name, .meta'
# → "ds" and { "kit": "<owner>/<repository>", "version": "…", "license": "MIT" }
curl -s https://french-tech-homies.github.io/design-system/r/registry.json | jq '.items | length'
# → 62
```

**Every later time**: lift again into this clone (the command keeps `.git`
and replaces everything else), read `git status` and `git diff`, then commit
and push. `pages.yml` republishes from `main` after the checks pass.
