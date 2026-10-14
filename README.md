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
the kit's folder into your project's source tree as `ds/`. Either way the files
land in your tree, where editing one is allowed, has a price at every update
and is rarely needed (see _What this kit is_). All imports inside the folder
are relative, so it works at any path under any alias.

> Source: `french-tech-homies/design-system` · **v0.4.0**. Keep this
> marker — with the version — and it tells you exactly which release your copy
> came from. See _Versioning and upgrades_.

---

## What this kit is

**Material 3's implementation.** The kit builds what Material 3's
specification (m3.material.io) describes, on React Aria and Tailwind, and each
of those components cites its page of the specification in its doc comment.

**One kit per design system.** This kit is Material 3's and no other's.
Another design system would be a kit of its own beside this one, in the same
repository and the same registry, with its own components, tokens and spec.
There is none today, and nothing here is built for one.

**Which components are its own.** Those Material 3's specification describes,
and a closed group of ten the kit ships that Material does not describe:

<!-- own-components -->

- `Table`: rows and columns of data. Material 3 publishes no data table.
- `Tag`: a small label pill that sits in a line of text.
- `Avatar`: a person's picture or initials.
- `Disclosure`: a heading that opens and closes a panel, alone or in a group.
- `PreviewTrigger`: a card of any content opened by hovering or focusing its
  trigger.
- `NumberField`: a text field for a number, with steppers.
- `PhoneField`: a text field for a phone number, with a country picker.
- `ImageField`: choosing, previewing and removing one image.
- `EmptyState`: what a list or a page shows when it has nothing to show.
- `ColorPicker`: editing a colour, with its four parts `ColorArea`,
  `ColorField`, `ColorSlider` and `ColorSwatch`.

<!-- /own-components -->

The group is named here and nowhere else, and it is closed: a component joins
it, or leaves it, only on the repository owner's decision, by a change to this
list. Each member's file says "Material 3 does not describe this component."
in a doc comment. `npm run registry:check-install`
(`scripts/check-components.mjs`) refuses a list and files that differ, and any
component file that neither says so nor cites a page of m3.material.io.

A part that is neither Material's nor the group's is a project's: it is
written in the project, beside the kit, and does not come here.

**What a project may change.** An edit of a kit file is allowed, priced and
rarely needed: an update overwrites every kit file that differs, and the
project puts its edit back by hand. That rule is stated once, in
`skills/ds-build/SKILL.md`, "What a project may change", because the skill
is what travels to a project and this file does not.

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

Both are published from this repository by `.github/workflows/pages.yml`, and
only by a release: what they serve is the last release, never what `main` has
gathered since. See _Publishing this repository_. The built registry is not
committed: `npm run registry:build` writes it to `r/`.

### Coming from `@md3`

Through 0.2.0 the kit was served under the namespace `@md3`, from addresses
that are retired: nothing new is published there. The all-in-one item was
`md3` and the files landed under `<ui>/md3/`. To move a project over:

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
| The update check: lists the kit files a project changed, before an update replaces them (`node <ui>/ds/changed.mjs`, see _Taking an update_) | `<ui>/ds/changed.mjs` | `@ds/changed` |
| The release record the check reads: this version, two digests of every file the registry carries, and the names of the items this install does not bring (`optional`). Only the whole install brings it | `<ui>/ds/RELEASE.json` | `@ds/ds` itself |
| The MIT notice | `<ui>/ds/LICENSE` | `@ds/license` |

Four items are not part of it and are asked for by name: `@ds/next-adapter`,
`@ds/react-router-adapter`, `@ds/react-hook-form-adapter` and
`@ds/preset-editorial`. Each lands its one file and a small record of its
own, `<ui>/ds/releases/<item>.json` (its version, its file's digests), which
is how the update check knows a project holds it.

The skills are Claude Code **project** skills: in a shadcn target `~/` is the
project root, not the person's home, so they land in the project's own
`.claude/skills/` and are versioned with it. In a monorepo that is the app's
folder, beside `components.json`: see _What an install and an update ask of
your project_ for the line the repository's root then says. Each skill's
description opens with when to load it, in the words a session has in mind
(the project's design system, Material 3, the `ds` folder, `DESIGN.md`):
it is all a session reads before it decides to. A skill names only files the
install brings, and nothing of this repository, and opens
with a frontmatter that parses as strict YAML;
`npm run registry:check-install` (`scripts/check-install.mjs`)
refuses a registry or a skill that breaks any of these rules.

The three skills are the kit's own, and the install brings no other. Whoever
edits a kit component, or writes one beside the kit, will also want React
Aria's documentation at hand: Adobe publishes it as a skill of its own,
installed with `npx skills add https://react-aria.adobe.com`.

**Then import the theme. `add @ds/ds` writes nothing into your entry CSS**,
at the first install or at any update: no palette value, no variable, no
`@import`. The theme is whatever that file imports, so a fresh install is
unthemed until these lines are there (the CLI prints them after `add @ds/ds`,
with the release it took):

```css
@import "tailwindcss";
@import "./components/ui/ds/tokens/theme.css";
@import "./components/ui/ds/tokens/bridge-shadcn.css"; /* only beside stock shadcn components */
@import "./components/ui/ds/tokens/theme.v4.css";
@import "tw-animate-css";
```

The shadcn bridge is that third line: a file of references such as
`--background: var(--md-sys-color-background)`, the same under any theme, so
stock shadcn components follow the Material roles. A project with none leaves
the line out. Through 0.3.0 the install wrote the bridge into the entry CSS
itself, at every run; see _What each item does to your CSS variables_ for
what such a project deletes. `@ds/theme` and `@ds/base`, asked for by name,
still write it there: with `@ds/ds` installed, the import is the better road.

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

**What the CLI's dependency step does to your `package.json`.** The CLI
installs what the items declare with your package manager's own command
(`npm install`, and `npm install -D` for the generator's four). That command
is the registry's and not the kit's: no field of an item changes it. Observed
on 2026-10-12 (shadcn 4.19, npm, an install of 0.3.0 into a project that
already had `tsx`):

- **A range you already had can move.** `tsx` went from `^4.19.1` to
  `^4.23.15`: the range is rewritten to the latest version it resolves.
- **The kit's two pins are written with a caret.** The kit tests on
  `@google/design.md` and `@material/material-color-utilities` at `0.4.0`
  exactly, and the item declares them so; `package.json` receives `^0.4.0`
  for both.

After an install or an update, read `git diff package.json`, put back the
ranges that were yours, write the two pins as `0.4.0`, and install again from
your lockfile.

**The licence comes with it.** Every item depends on `@ds/license`, a
`registry:file` that drops the kit's MIT notice at `<ui>/ds/LICENSE`, beside
the code it covers. `add @ds/button` delivers it just as `add @ds/ds` does,
and re-adding is a no-op — an unchanged file is skipped. Every served item also
carries the terms in `meta`, before anything is copied:

```bash
curl -s https://french-tech-homies.github.io/design-system/r/button.json | jq .meta
# → { "kit": "<owner>/<repository>", "version": "0.4.0", "license": "MIT" }
```

**Re-running `add` never silently clobbers your edits — and never silently
updates either.** An identical file is skipped ("files might be identical");
a file that **differs** raises a per-file overwrite prompt that defaults to
*No* — even under `-y` — and only `--overwrite` replaces it. The CLI keeps no
record of what it installed, so "differs" covers both a file you edited and a
file the kit changed: it cannot tell them apart. An update is therefore
`--overwrite` plus your own diff — see _Taking an update_.

### What an install and an update ask of your project

Seven things the install does not do for you, each with the line you write.
They come from the first two projects that installed 0.3.0.

**1. In a monorepo, the skills land beside `components.json`, not at the
repository's root.** Everything the install writes is placed from the folder
that holds `components.json`: the kit under its `ui` alias, the skills in
its `.claude/skills/` (`apps/web/.claude/skills/ds-build/` when the app is
`apps/web`), and that folder is where `DESIGN.md` and `theme/` go. Leave the
skills there: it is where `RELEASE.json` records them and where the update
check looks. A session started at the repository's root is not told of them
until it touches a file under the app, so say it in the root's instructions
(`CLAUDE.md`, `AGENTS.md`), with your own paths:

```md
This project has a design system: Material 3 components copied into `apps/web/src/components/ui/ds/`. Before writing or reviewing any UI, load the `ds-build` skill (`apps/web/.claude/skills/ds-build/SKILL.md`); to change a colour, the type or anything in `DESIGN.md`, `ds-theme`; for what Material 3 says of a component, `ds-spec`.
```

A project whose `components.json` is at its root needs the same line less,
and it costs nothing there either.

**2. If your Tailwind entry scans your source folder, it now scans the
copy.** The components must be scanned: they hold the classes. The copy's
other files hold none and can make junk utilities out of prose and data.
Exclude them, with the path from your entry CSS to the copy (here
`src/styles/globals.css` and `src/app/_components/ui/ds`):

```css
@source not "../app/_components/ui/ds/tokens";
@source not "../app/_components/ui/ds/releases";
@source not "../app/_components/ui/ds/DESIGN.md";
@source not "../app/_components/ui/ds/RELEASE.json";
@source not "../app/_components/ui/ds/changed.mjs";
@source not "../app/_components/ui/ds/LICENSE";
```

They go below every `@import`. `tokens/` is excluded as a source of class
names only: its stylesheets still reach the build through your `@import`
lines. Do not exclude `utils.ts`: it holds `focusRing`'s classes. Its
tailwind-merge configuration names four class groups as strings, so the scan
emits `.rounded-t`, `.rounded-l`, `.rounded-r` and `.rounded-b` (about 300
bytes) whether or not you use them. They are harmless.

**3. Keep the copy and the skills out of your linter and your formatter.**
An update is an overwrite followed by `git diff`, and the update check
compares each file with the release it came from: both read only if the
files were left as shipped. Your rules are not the kit's (under Next's
ESLint configuration the copy gives 4 warnings; under Prettier 13 of its
files are "not formatted"). In an ESLint flat config, one entry of the
exported array:

```js
{ ignores: ["src/components/ui/ds/**", ".claude/skills/**"] },
```

and in `.prettierignore` (the same two lines serve oxfmt and Biome's
ignore):

```
src/components/ui/ds/
.claude/skills/
```

The skills folder needs both too: `ds-spec` ships a script.

**4. An update names every item you hold, not `@ds/ds` alone.** The adapters
and the Editorial preset are items of their own. Run the check first; its
last line is the command:

```bash
node src/components/ui/ds/changed.mjs
npx shadcn add @ds/ds @ds/next-adapter @ds/react-hook-form-adapter --overwrite -y
```

The second line is what the first prints for a project that holds those two
adapters. See _Taking an update_.

**5. The registry serves the latest release only: read which one before you
install.** Before, from the item itself; after, from the record it brought.
The install's closing message names it too ("MD3 kit 0.4.0, under
`<ui>/ds/`").

```bash
curl -s https://french-tech-homies.github.io/design-system/r/ds.json | jq -r .meta.version
jq -r .version src/components/ui/ds/RELEASE.json
```

Then read `CHANGELOG.md` from your version to that one.

**6. The import path is from your entry CSS to your ui folder.** The
install's message writes it for an entry CSS that sits beside `components/`
(`src/index.css` and `src/components/ui`: `./components/ui/ds/…`). Worked
for a project two folders away, `src/styles/globals.css` and
`src/app/_components/ui`: up one folder to `src/`, then down.

```css
@import "tailwindcss";
@import "../app/_components/ui/ds/tokens/theme.css";
@import "../app/_components/ui/ds/tokens/theme.v4.css";
@import "tw-animate-css";
```

**7. The install runs your project's install scripts.** The CLI adds the
dependencies with your package manager, and that runs whatever `postinstall`
or `prepare` your repository has, at the root of a workspace included. A
script that needs an environment variable or a database fails the step
(exit 1, no file written): set what it needs, then run the install again.

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
radius scale. One deliberate
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
| `components/field-styles.ts`   | The **style module** for the field container (`tv` slots), rendered by `TextField`, `NumberField`, `PhoneField`, `Select` and `ComboBox` — its `kind` variant is what lets one container serve typed, composite and trigger fields. Edit this to change field anatomy          |
| `utils.ts`                     | `twMergeConfig`, `tv`, `cn`, `focusRing` — server-safe, no React Aria import                                                                                                                                                                                                  |
| `render-props.ts`              | `composeTailwindRenderProps` (client-only; kept out of `utils.ts` so Server Components can use `cn`)                                                                                                                                                                          |
| `icons.tsx`                    | Icon types + the small built-in SVG set                                                                                                                                                                                                                                       |
| `primitives/Typography.tsx`    | `Display` / `Headline` / `Title` / `Body` / `Label`                                                                                                                                                                                                                           |
| `primitives/StateLayer.tsx`    | MD3 interaction state overlay                                                                                                                                                                                                                                                 |
| `components/`                  | TextField, NumberField, PhoneField, ImageField, ComboBox, Checkbox, Switch, Radio, Select, Button, IconButton, Chip, Card, ListItem, GridList, Menu, MenuItem, Dialog, DialogContent, ModalDialog, Modal, SideSheet, Disclosure, Tabs, Tooltip, PreviewTrigger, Snackbar, Tag, Avatar, Table, TopAppBar, NavigationRail, NavigationDrawer, BottomNavigation, Slider, EmptyState, Divider, ProgressIndicator, `color/*` |
| `adapters/next.tsx`            | Optional: Next router provider + `next/image` renderer. Delete if not on Next.js                                                                                                                                                                                              |
| `adapters/react-router.tsx`    | Optional: React Router (or TanStack Router) provider so `href` links navigate client-side. Delete if not on React Router                                                                                                                                                      |
| `changed.mjs`                  | The update check: lists the kit files a project changed since it installed them, against `RELEASE.json` — `node <ui>/ds/changed.mjs`, see _Taking an update_. Node builtins only. In the registry as `@ds/changed`                                                          |
| `RELEASE.json`                 | Generated by `npm run registry:build`: the kit's version, two digests of every file the registry carries, by where it lands, and the items `@ds/ds` does not bring with their files (`optional`). Carried by `@ds/ds` alone, so only the whole install replaces it          |
| `releases/<item>.json`         | Generated by `npm run registry:build`, one per item `@ds/ds` does not bring (the three adapters, the Editorial preset): its name, the version and its files' digests. Carried by that item, so the update check knows a project holds it and which release it is from          |
| `scripts/changed.check.mjs`    | Makes the update check speak on a fixture install, and holds `RELEASE.json` to what the build computes — `npm run registry:check-install`                                                                                                                                     |
| `LICENSE`                      | MIT — also a registry item (`@ds/license`) that every other item depends on, so a `shadcn add` copy lands with the notice at `<ui>/ds/LICENSE`                                                                                                                               |
| `CHANGELOG.md`                 | What changed between releases, and which entries need action from a consumer who edited a kit file                                                                                                                                                                              |
| `adapters/react-hook-form.tsx` | Optional: `FormTextField` / `FormNumberField` / `FormPhoneField` / `FormImageField` / `FormCheckbox` / `FormCheckboxGroup` / `FormSwitch` / `FormRadioGroup` / `FormSelect` / `FormChipGroup` / `FormComboBox` bound through `Controller`                                                           |
| `stories/`                     | The catalog, by Material's taxonomy — plus `stories/interactions/`, the behaviour tests                                                                                                                                                                                        |
| `vitest.config.ts`             | The two test projects (`material`, `editorial`) — see _Tests_                                                                                                                                                                                                                 |
| `skills/ds-theme/`            | Claude Code skill: give a project a look of its own from its DESIGN.md. `design-md.md` beside it is the contract: what the kit reads in a DESIGN.md. Lands in a project's `.claude/skills/` (`@ds/theme-skill`)                                                              |
| `skills/ds-build/`            | Claude Code skill: the rules for building with the kit and what a project may change (`@ds/build-skill`)                                                                                                                                                                     |
| `skills/ds-spec/`             | Claude Code skill + `md3.mjs`: the live Material 3 spec, Do/Don't and tokens from m3.material.io (`npm run md3`; `@ds/spec-skill`)                                                                                                                                           |
| `scripts/build-registry.mjs`   | Generates `registry.json`: every item, from this folder                                                                                                                                                                                                                       |
| `scripts/check-install.mjs`    | The rule that holds the one install whole: `ds`, and anything an update names, writes nothing into a project's CSS; `ds` reaches the generator, every skill and every file a skill names; a script's imports are declared by its item; no skill names this repository; every skill's frontmatter parses, with its folder's name and a description that opens with when to load it; the update command is written one way; no item lands a skill that is not the kit's own — `npm run registry:check-install`                                             |
| `scripts/check-components.mjs` | The rule that holds the kit's own components a closed, named group: the list in _What this kit is_ is the set of component files that say Material 3 does not describe them, and every other component file cites a page of m3.material.io; and no file under `components/` or `primitives/` names the mono face — `npm run registry:check-install` |
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

---

## Catalog

Hosted at **`https://french-tech-homies.github.io/design-system/`**, published
at each release by `.github/workflows/pages.yml`. That is the kit's
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

A DESIGN.md in the format's own words is drawn too: one with no `scheme` and
no `colors.seed`, which are the kit's keys and not the format's, and with the
format's short sizes (`title-md`, `rounded.sm`). The scheme is read from the
file's ground (`colors.background`, else `colors.surface`) and the seed from
`colors.primary`; the page lists each as assumed, with the token it was read
from, beside what it ignored. A file with neither a ground nor a primary is
still refused, in words that say what to write.

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

The kit is **copy-distributed**: `shadcn add` writes files into your tree. So
the thing that is versioned is the source you copied, and the upgrade question
is "what changed, and which of my edits do I put back?". An edit of a kit file
is allowed, priced and rarely needed; the rule is
`skills/ds-build/SKILL.md`, "What a project may change", and this section
is the mechanism behind its price.

### Which version am I on?

Two places say it:

```bash
# what the kit ships today
curl -s https://french-tech-homies.github.io/design-system/r/button.json | jq .meta
# → { "kit": "<owner>/<repository>", "version": "0.4.0", "license": "MIT" }

# what you copied: the release record the whole install brought
jq .version src/components/ui/ds/RELEASE.json
```

A copy installed before 0.3.0 has no `RELEASE.json`: nothing in it says its
version, and its first update brings the record. This README is not copied
into a project. Every generated registry item carries `meta.version`, and CI
fails the build if one disagrees with `package.json`. `CHANGELOG.md` is the
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
(stdin open). The loop is therefore git's, not the CLI's, and it starts with
the kit saying which of its files you changed:

```bash
node src/components/ui/ds/changed.mjs      # <ui>/ds/changed.mjs
```

It compares every kit file and skill in your tree with the release you
installed, which `<ui>/ds/RELEASE.json` records, and lists the ones that
differ. It knows which of the items `@ds/ds` does not bring you hold (an
adapter, the Editorial preset) from the record each brings,
`<ui>/ds/releases/<item>.json`, and ends on the update command that takes
everything you hold. It writes nothing and merges nothing. Walked on 2026-10-11 on a real
install of 0.3.0 (shadcn 4.19, a scratch project, `add @ds/ds` from a local
copy of the registry): untouched, it lists nothing; with one line added to
`components/Tag.tsx`, that file alone; with `// @ts-nocheck` put at the top
of `components/Button.tsx`, or a comment at the top of `index.ts`, that file
alone. Its exit code says which of three answers it gave:

| exit | it says | what it means for the update |
| --- | --- | --- |
| 0 | no recorded file of what you hold differs or is missing | the overwrite loses nothing of yours |
| 1 | the files, in three groups. `changed`: the text differs. `whitespace`: the same text once spaces, tabs and line breaks are taken out. `missing`: a file of the whole install, or of an optional item you hold, is not there | the overwrite loses each `changed` edit: these are the files to put back from `git diff`. A `whitespace` file is a formatter's or an indent's doing; a change of spaces inside a string, a class list included, lands there too. A `missing` file comes back with the update: delete it again if that was meant |
| 2 | it cannot tell, and why: no record, a CLI that rewrites the files, an option it does not know | update as below and read `git diff`, as before the check existed |

Besides the groups, and with no effect on the exit code, it says:

- **`Not installed, and no finding`**, once, in one line: the optional items
  of which nothing is in your tree. After `add @ds/ds` alone that is all
  four.
- **`behind`**: an optional item you hold whose own record is of another
  release than `RELEASE.json`. An update that named only `@ds/ds` leaves an
  adapter there. Its file is compared with its own release, so it is not
  listed as `changed` unless you edited it.
- **The update command** for what you hold, as its last line:
  `npx shadcn add @ds/ds @ds/next-adapter --overwrite -y` for a project with
  the Next adapter. Run that one, not the bare `@ds/ds`.

`node <ui>/ds/changed.mjs --missing` also names every recorded file that is
not in your tree, with the item it belongs to and whether you hold that item
(`@ds/next-adapter, not installed`; `@ds/ds, the whole install: missing`).

What it cannot know:

- **A copy installed before 0.3.0** has no record, so the check answers 2 for
  it, in these words: "This copy of the kit was installed before 0.3.0, or
  its record was removed, so this check cannot tell which kit files you
  changed." Such a copy has no `changed.mjs` either:
  `npx shadcn add @ds/changed` brings that one file and touches no other.
  The update that follows brings the record, and the check speaks from the
  next one on.
- **A formatter that moves more than whitespace** (quotes, trailing commas,
  the parentheses around wrapped JSX) makes every file it touched `changed`.
  Keep `<ui>/ds/` and the skills out of your formatter and your linter: the
  two lines are in _What an install and an update ask of your project_.
- **A project whose CLI rewrites the files as it installs them**
  (`tsx: false`, a Tailwind `prefix` or `cssVariables: false` in
  `components.json`) gets answer 2.
- **Nothing is set aside.** The one thing the CLI itself does to a `.ts` or
  `.tsx` file is recorded, not ignored: it drops the comment a file opens
  with (`index.ts` and `primitives/Typography.tsx` land without theirs), so
  the record holds both forms of those two files, and your file is unchanged
  when it is either. A comment you put at the top of any kit file
  (`// @ts-nocheck`, `/* eslint-disable */`) is an edit, and is listed; so is
  a `"use client"` you add or take out, since under `rsc: false` the walked
  install left the directive on all 36 files that have it.
- **An optional item installed at 0.3.0** has no record of its own yet, so
  its file is compared with `RELEASE.json`: after an update that named only
  `@ds/ds` it is listed as `changed`, and the check says it may be behind,
  not edited. The update the check prints brings its record.
- **A record of the 0.3.0 shape** names no item (a copy at 0.3.0 that added
  `@ds/changed` alone): a recorded file that is not in your tree is then
  counted, not a finding, and `--missing` names it without an item.
- A file you wrote beside the kit is not in the record and is not looked at.
- `RELEASE.json` is replaced only by `add @ds/ds`. After an `add` of single
  components at a newer release, the check lists the files that `add` moved.

Then:

1. Read `CHANGELOG.md` from your version to the current one, and commit your
   work: the tree must be clean.
2. Run the update command the check printed. `@ds/ds` alone leaves an
   adapter or the preset at the old release, so each one you hold is named
   in it:

   ```bash
   # no adapter, no preset
   npx shadcn add @ds/ds --overwrite -y
   # with two adapters
   npx shadcn add @ds/ds @ds/next-adapter @ds/react-hook-form-adapter --overwrite -y
   ```

   Every kit file that differs is replaced. Your `DESIGN.md`, your
   `theme/` folder and your entry CSS's imports are not targets of any item.
3. `git diff` is the update. For a file you never edited there is nothing to
   do. For a file you edited (the check listed it under `changed`), the diff
   shows your edit removed among the kit's changes: put your edit back by
   hand, keeping theirs.
4. If you generated a theme of your own, regenerate it
   (`npx tsx <ui>/ds/tokens/generate-theme.mjs DESIGN.md --out theme`): the
   kit's `tokens/theme.v4.css` is the template your copy is written from.
   Lint, and read the diff of `theme/`.

Answering the prompts by hand, file by file, also works at a terminal: Yes for
a file you never edited, No for a file you edited and will merge later.

Because `fieldStyles` backs all five fields, a field-anatomy change is *one*
merge, not five. That is the point of the style-module layer — see
_Retheming_.

### What each item does to your CSS variables

No item writes a palette value. The `--md-sys-*` variables, the `@theme
inline` mapping and the utilities are in the theme files, and your entry CSS
chooses which pair it imports: the kit's, or your own generated ones.

- **`@ds/ds`** writes nothing into your entry CSS, at an install or at an
  update: it carries no CSS variable and no `@import`, and
  `npm run registry:check-install` refuses a registry where it would. The
  shadcn bridge is the file `<ui>/ds/tokens/bridge-shadcn.css`, which you
  import after `theme.css` if the project has stock shadcn components.
- **`@ds/theme`** (a `registry:theme`) and **`@ds/base`**, asked for by
  name, write the shadcn bridge into `:root` / `.dark`, and
  `@import "tw-animate-css"`: 19 variables, each a `var(--md-sys-color-*)`
  reference, and `--radius`. Asking for one by name again rewrites those same
  references and nothing else.
- **`@ds/tokens`** writes the kit's theme files under `<ui>/ds/`. They are
  the kit's: an update replaces them. A project's own theme lives in a folder
  of its own (`theme/`), which no item targets.
- **`@ds/button`, `@ds/select`, any component** only ever writes component
  files.

**Coming from 0.3.0 or earlier?** `@ds/ds` wrote the bridge into the entry
CSS at every run, in three places: a `:root` and a `.dark` block of 20
variables each at the end of the file, 19 lines of the form
`--ring: var(--ring);` inside your `@theme` block, and four `--radius-*`
lines. Those blocks come after every `@import`, so they override the bridge
file and any `--radius` of your own. Delete all three, then import
`bridge-shadcn.css` if stock shadcn components rely on it. From this release
on an update leaves the file alone.

**Coming from an install made before the theme travelled as files?** The all-in-one item, `theme` and `base` used
to write the 49 roles and the whole `@theme inline` mapping into the entry
CSS. Those inline blocks come after every `@import`, so they override
imported theme files: delete the `--md-sys-*` declarations from `:root` and
`.dark`, and the kit's `@theme inline` block and `@utility` rules, then
import the two theme files. See `CHANGELOG.md`.

### Releasing (maintainers)

```bash
npm version minor --no-git-tag-version   # or patch; package.json is the only source of truth
npm run registry:build         # restamps every item's meta.version, and writes the release record
npm run registry:check-version # what CI runs
# add the CHANGELOG entry, commit package.json, package-lock.json, registry.json and RELEASE.json together
```

`.github/workflows/checks.yml` fails when a bump was not followed by
`registry:build`, alongside the existing guards on `resolved.json` and on a
`registry.json` or a `RELEASE.json` that is not what the build writes.

The merge of that one commit to `main` is what publishes: see _Publishing
this repository_.

## Copy or npm package? — the decision

**The registry is the only supported distribution. There is no npm package,
and adding one is not planned.**

This repository has a `package.json` only to run its own catalog, tests and
registry build. It is `"private": true`, has no `exports` map and no build
step, and ships `.ts`/`.tsx` source: it is not something to `npm install`.

**Why copy-distribution is the right primary.** The files land in your tree,
so the edit a real product sometimes needs (a style module's anatomy, see
_Retheming — the three layers_ below: MD3 anatomy is opinionated) is an edit
of one file, put back by hand at each update. A package would make the same
move a fork of the whole package, which is worse. Copy-distribution also
means no runtime
dependency on us, no version-range solving against your React Aria, and no
build output to keep in sync with your bundler.

**When to revisit.** Publish only if a consumer should *not* be able to edit a
kit file —
a design system enforced across teams, where drift is the thing you are trying
to prevent. If that day comes, **pick one authoritative channel and say so in
this file**; shipping both a registry and a package without naming which is
canonical guarantees two versions of the same component in one codebase.

## Retheming — the three layers

An app on this kit must be able to look like itself, not like a Google app,
**and** keep taking kit updates that follow the Material spec. That works
because your identity lives where an update does not undo it: in files no
update writes, and in one file whose names an update keeps. There are three
layers, each with what an update promises it, and your identity lives in the
first two:

| layer | files | you may | a kit update |
| --- | --- | --- | --- |
| **tokens** | your `DESIGN.md` and the theme generated from it (`theme/theme.css`, `theme/theme.v4.css`), plus per-component escape-hatch variables (`--md3-field-notch`) | change anything, through `DESIGN.md` | never touches them. Components name roles and scales, never values, and no registry item writes a palette value or targets your theme folder. The kit's own `tokens/*` files are its default and are replaced by an update — import yours instead of editing them |
| **style modules** | `components/<x>-styles.ts` exporting `<x>Styles`. Today one: `components/field-styles.ts` → `fieldStyles`, the field container behind `TextField`, `NumberField`, `PhoneField`, `Select` and `ComboBox` | edit the file | replaces it, keeping the **slot and variant names**; what a slot contains may change, and your edit is put back by hand |
| **behaviour** | the React Aria wiring, `utils.ts`, `render-props.ts`, `icons.tsx` | edit a file: allowed, priced, rarely needed | replaces every file that differs and promises no name in it; keeps following the four m3.material.io pages for behaviour and accessibility, even where your look departs from them |

A `tv` becomes a style module only when more than one component renders from
it, or when its anatomy _is_ the product's identity. Everything else stays a
local `const styles = tv({…})` — an edit of it is allowed like any other, but
it is not part of the promised seam. What an update costs a themed app is in
_What a themed app pays at update time_ below.

The table is what an update promises each layer. What a project may change,
and at what price, is one rule stated once:
`skills/ds-build/SKILL.md`, "What a project may change".

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
read from a variable, so changing them is an edit of a kit file — the
component, or `fieldStyles` where a field is concerned. A handful of controls that tint their
own background instead of rendering an overlay (`Table` rows, the number-field
steppers, the combo-box and phone-field trigger icons) hold their state alpha
the same literal way; `bg-on-surface/(--md-sys-state-hover-state-layer-opacity)`
is the form that reads the token, if you edit one of them.

### What a themed app pays at update time

The mechanics are in _Versioning and upgrades_ above; what they mean for a
themed app is short:

- a **token** change (a new scale or utility in `tokens/theme.v4.css`) →
  the update (`npx shadcn add @ds/ds --overwrite -y`, with each adapter or
  preset you hold named in it) from a clean tree, then regenerate your theme: the kit's file is the template yours is written
  from, and a plain re-add would stop at its prompt and write nothing. Your `DESIGN.md` and your
  generated palette are not targets of any item, so nothing of yours is at
  risk;
- an **anatomy** change to a style module you edited → the update replaces
  the file and you put your edit back from the diff, one file by hand.
  Because `fieldStyles` serves all five fields, that is **one** merge, not
  five — which is the whole reason the seam is one file and not thirty-five;
- a **behaviour or accessibility** fix → the same update, free for a file
  you never edited; for one you did, your edit is put back from the diff.

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

## Your project's design system in Claude

Claude can hold a design system, the colours, type, components and layout
it then applies when it designs: Anthropic's help page, linked below, says
what one is. A project that installed the kit has what one is built from,
in its own repository: the kit's components under `<ui>/ds/`, its `DESIGN.md`
and its generated theme.

**The design system is yours, built from your repository.** It carries your
look and the version of the kit you hold, and it changes when you choose. The
kit publishes no design system for others to build on and ships nothing that
produces one: a shared one would tie every project to the kit's updates, and
it would wear the kit's neutral look, not yours.

The flow, in order:

1. **Install the kit** ([Install from the registry](#install-from-the-registry))
   and generate your theme from your `DESIGN.md`
   ([The theme comes from DESIGN.md](#the-theme-comes-from-designmd)).
2. **Have Claude build a design system from your repository.** How it is
   created is Anthropic's to say, and it moves: follow
   [Set up your design system](https://support.claude.com/en/articles/14604397) on Anthropic's help centre, taking the
   route it gives for a design system that lives in code.
3. **Explore a look** with Claude, on a canvas drawn with your real
   components.
4. **Write the look you keep into `DESIGN.md`** and generate the theme. The
   `ds-theme` skill does this with your agent. `DESIGN.md` stays the one
   source: a look that lives only in Claude is lost at the next generation.
5. **Update the design system** from your repository, as the same page says,
   so that it draws what your project now ships. Do the same after you take
   an update of the kit.
6. **Design with it.**

Which plans have design systems, and where one is made, is on the same page.

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
- **A card is a container, and its root takes what places it and names it**:
  the element (`component`: `div`, `section`, `article` or `li`), `ref`, `id`,
  `role`, `style`, every `aria-*` and `data-*` attribute. It refuses every
  event handler and `tabIndex`, at the type: Material's directly actionable
  card, with its ripple, focus indicator and tab stop, is not built. Its parts
  are listed in its doc comment.
- **A tooltip is Material's: no arrow, plain above its trigger, rich below it
  from the start edge.** `showArrow` draws the arrow, `placement` takes a side
  or a corner (`"bottom start"`, `"top end"`), `variant` is honoured when
  given. A trigger that is no button is wrapped in `Focusable`, exported
  beside `Tooltip`, and must take focus itself.
- **A rich tooltip takes any content that is only read**: a headline, a
  supporting text, then children such as rows of label and value (a `<dl>`),
  a short list, an icon or a figure. It takes nothing that is operated or
  takes focus (a link, a button, a field), because a tooltip never takes
  focus and closes when its trigger loses it. So Material's rich tooltip
  buttons and its persistent tooltip are not built.
- **`StateLayer` keys on `isFocusVisible`**, not `isFocused`, so a mouse click
  doesn't leave a control looking permanently highlighted. The CSS-driven
  state layers (`group-data-focus-visible/button:state-opacity-focus`) follow
  the same rule.
- **Focus indicator is MD3's**: a 3px `secondary` ring offset 2px
  (`focusRing` in `utils.ts`), not shadcn's 2px primary ring. It is an
  outline, and its gap is not painted: on a card, a table or a sheet it shows
  that surface, not the page's ground.
- **`data-slot` on every root** (`button`, `card`, `chip`, `state-layer`,
  `modal`, …) plus `data-variant` / `data-size` where a variant exists — the
  shadcn convention, so consumers can target parts without reaching into
  class names.
- **`Button` and the assist `Chip` become links with `href`** (React Aria
  `Link`, same anatomy and states, routed through the router provider), and
  `Menu` items take `href` too — there is no `asChild` / slot pattern in the
  kit. `Button color="error"` is the destructive button MD3 does not define.
- **`Table` follows M2's data-table measurements on M3 roles** — M3 has no
  data-table page — with React Aria's sorting and selection: 52dp rows under
  a 56dp header, and with `density="dense"` 40dp under 44dp, the kit's own
  pair.
- **`IconButton` has Material's five sizes and four colour styles, and is
  round.** `filled` is the default colour style, Material's. The square
  shape, the shape morphs, the narrow and wide widths, the tooltip on hover
  and button groups are not built.
- **There is no separate alert dialog.** MD3's dialogs page covers one
  component in two sizes; "alert" is a *use*, not a variant. So it is
  `<Dialog role="alertdialog">` — the ARIA role, plus `ModalDialog` turning
  light-dismiss off, because a click on the scrim must not answer a question
  that has to be answered. Escape still closes.
- **`PreviewTrigger` has no Material page either**, and neither does its
  category: a hover-opened card of arbitrary content is not in MD3. Use
  `Tooltip variant="rich"` — which *is* in the spec — when the content is
  only read; use `PreviewTrigger` when the reader operates it (a link, a
  button, a form). It opens on focus and on
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

Segmented button, search bar, date & time pickers: Material 3 describes them
and the kit does not build them yet. Until it does, an app that needs one
writes it in its own tree, beside the kit, on a headless component — the token
and styling contracts above are what make it match. One added to the kit
itself cites its Material page and clears `conventions.md`'s "quality bar".

What Material 3 does not describe is not waiting to be included. Outside the
closed group named in _What this kit is_, it is a project's.

## Publishing this repository

**Only a release publishes.** The catalog and the registry are served from
GitHub Pages, which holds one build: no address serves an older release. So
a merge to `main` does not publish by itself, or the registry would serve
what is under `[Unreleased]` under the number of the last release.

- **Every pull request and every push to `main` is checked whole** by
  `.github/workflows/checks.yml`: the cheap checks, the Storybook build and
  the story tests.
- **A push to `main` publishes only when it is a release**: the version
  moved, in that one push, in all five places a release writes it:
  `package.json`, `package-lock.json`, every item's `meta.version` in
  `registry.json`, `RELEASE.json`, and the newest numbered heading of
  `CHANGELOG.md`. The tree must say one version in all five, and the commit
  before the push must say it in none. `.github/workflows/pages.yml` then
  deploys the site the checks built on that commit.
- **Any other merge publishes nothing** and the previous site stays. Its run
  is green, with `publish` skipped.
- **A version that moved in some of the five places only is refused**: the
  run is red, on the pull request already. A release completed over two
  pushes is not published by the second: it is published by hand, below.

The decision is `scripts/decide-publish.mjs`, one step of `checks.yml`
("Does this run publish?"). It prints its sentence in the run's summary: on
a pull request, what the merge would publish. `npm run registry:publishes --
--event push --base <sha> --ref refs/heads/main` says the same from a clone,
and publishes nothing.

**The manual trigger** (`gh workflow run pages.yml`, or "Run workflow" on the
Actions page) is for publishing the last release again: after a deployment
that failed, after Pages was set up, or for a release that was completed over
two pushes. It follows the same rule. On `main`, while `registry.json` and
`RELEASE.json` are still what the release's commit holds, it publishes them,
with the catalog as `main` has it. Once `main` has moved past the release it
publishes nothing, and says which release that was: what `main` holds since
is published by the next release. It publishes nothing from another branch.

**One setting, made once by a person**: Settings → Pages → Build and
deployment → Source = "GitHub Actions". Until then `publish` fails at
"Configure Pages".

**What to look at** once a release's run is green:

```bash
curl -sI https://french-tech-homies.github.io/design-system/ | head -1
# → HTTP/2 200: the catalog is at the site root
curl -s https://french-tech-homies.github.io/design-system/r/ds.json | jq '.name, .meta'
# → "ds" and { "kit": "<owner>/<repository>", "version": "…", "license": "MIT" }
curl -s https://french-tech-homies.github.io/design-system/r/registry.json | jq '.items | length'
# → the number of items `npm run registry:build` printed
```
