# Installing the kit

**Two ways in, no npm package.** Either install through the shadcn CLI from the
kit's registry (recommended — see [Install from the registry](#install-from-the-registry) below), or copy
the kit's folder into your project's source tree as `ds/`. Either way the files
land in your tree, where editing one is allowed, has a price at every update
and is rarely needed (see [What this kit is](what-this-kit-is.md)). All imports inside the folder
are relative, so it works at any path under any alias.

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
gathered since. See [Publishing this repository](../CONTRIBUTING.md#publishing-this-repository). The built registry is not
committed: `npm run registry:build` writes it to `r/`.

**Already installed?** An update is three commands, `--dry-run`, `--diff
<path>` and `--overwrite -y`: see [Update](../README.md#update) on the front page, and
[Updating, in three commands](updating.md#updating-in-three-commands) for why.

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
   update (see [Taking an update](updating.md#taking-an-update)).

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
| The update check: lists the kit files a project changed, before an update replaces them (`node <ui>/ds/changed.mjs`, see [Taking an update](updating.md#taking-an-update)) | `<ui>/ds/changed.mjs` | `@ds/changed` |
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
folder, beside `components.json`: see [What an install and an update ask of
your project](#what-an-install-and-an-update-ask-of-your-project) for the line the repository's root then says. Each skill's
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
itself, at every run; see [What each item does to your CSS variables](updating.md#what-each-item-does-to-your-css-variables) for
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
# → { "kit": "<owner>/<repository>", "version": "0.5.1", "license": "MIT" }
```

**Re-running `add` never silently clobbers your edits — and never silently
updates either.** An identical file is skipped ("files might be identical");
a file that **differs** raises a per-file overwrite prompt that defaults to
*No* — even under `-y` — and only `--overwrite` replaces it. The CLI keeps no
record of what it installed, so "differs" covers both a file you edited and a
file the kit changed: it cannot tell them apart. An update is therefore
`--overwrite` plus your own diff — see [Updating, in three commands](updating.md#updating-in-three-commands), and
[Taking an update](updating.md#taking-an-update) for why.

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
adapters. See [Taking an update](updating.md#taking-an-update).

**5. The registry serves the latest release only: read which one before you
install.** Before, from the item itself; after, from the record it brought.
The install's closing message names it too ("MD3 kit 0.5.1, under
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
npm install "react-aria-components@^1.20.0" "tailwind-variants@^1.0.0" "tailwind-merge@^3.6.0" "clsx@^2.1.1" "tw-animate-css@^1.4.0"
```

Each at the range the kit is tested on, the one the registry declares: a
bare name installs the latest version, and `tailwind-variants` 4 does not
type-check with the kit's `utils.ts`. `PhoneField` additionally needs
`react-phone-number-input@^3.4.9` (parsing,
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
follows `prefers-color-scheme` (see [The theme comes from DESIGN.md](theming.md#the-theme-comes-from-designmd)).

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

