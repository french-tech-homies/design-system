# design-sync notes — Pipao MD3 (`packages/md3`)

Repo-specific facts for re-syncs. One bullet per gotcha; `[GENERAL]` = not
component-specific.

## Setup

- The kit is TypeScript source inside a Next.js app — no `dist/`, no npm
  package. `packages/md3/package.json` (`@pipao/md3`, private) exists only so
  the converter has a package boundary (`PKG_DIR` = the kit, not the app).
- Component list = story titles filtered by the kit's public exports. Exports
  are read from a `.d.ts` tree, so `buildCmd` emits declarations with
  `npx tsc -p .design-sync/tsconfig.kit.json` → `packages/md3/.types/`
  (gitignored; `package.json#types` points at it; root `tsconfig.json`
  excludes the dir). Rebuild them after any kit change before the converter.
- `buildCmd` also recreates `node_modules/@pipao/md3 → ../../packages/md3`
  (symlink, transient): `copyTokens` only reads through `tokensPkg`, and
  that is how `tokens/theme.css` ships into `tokens/`.
- Faithful install skipped on the first sync (`npm ci` would have torn down
  `node_modules` under the running dev server + Storybook); the tree had just
  been installed from the same lockfile (`npm ls` clean).
- `entry` is `packages/md3/index.ts` (esbuild bundles the TS; `tsconfig` gives
  it the `~/*` alias for story compiles).
- Story titles are `MD3/<Category>/<Component>` with spaces; `titleParts`
  strips whitespace, hence `titleMap` keys like `Iconbutton`, `Textfield`.
  `FAB` → `Button` (FAB stories are Button variants). Foundations pages,
  `Overview` and the react-hook-form demo are `null` (not components).
  Legacy app stories outside MD3 (MultiStepForm, PricingTable, CTAButton,
  Drawer, Dropdown, Meter, Tags, product/promotion pages…) are dropped by
  the export filter — expected.
- `[GENERAL]` `.storybook/preview.ts` decorators fail to bundle ("Could not
  resolve tailwindcss" — it imports `globals.css`, which `@import`s Tailwind
  v4). The only decorator is `withThemeByClassName` (light/dark class on
  `<html>`); previews render light by default without it, so `cfg.provider`
  is deliberately unset. Dark theme is not synced.
- `[GENERAL]` CSS comes from the Storybook build (`[CSS_FROM_STORYBOOK]`,
  Tailwind v4 output of `src/styles/globals.css`). Rebuild
  `.design-sync/sb-reference` whenever kit CSS/tokens or stories change —
  the converter's CSS and the compare oracle both read it.
- `[GENERAL]` `[TOKENS_MISSING] --radix-*` vars come from the app's shadcn
  CSS still in `globals.css` — not kit tokens, ignore. `--font-inter` was the
  real one: the app sets it via `next/font` at runtime, Storybook only looked
  right because `.storybook/preview-head.html` forces `body { font-family:
  Inter }`. Fixed at the source: `packages/md3/tokens/theme.css` now declares
  a `:root` default for `--font-inter`; the web font itself arrives through
  the Google Fonts stylesheet the converter carries from `preview-head.html`
  into `styles.css` (`[FONT_REMOTE]`).
- `[CSS_ASSETS] ../assets/images/500-error.jpg` — app CSS, not kit; ignore.
- `[GENERAL]` This file covers the **push** half only. Reading the project
  back (files, canvas, chat panel, reviewer comments) goes through the
  first-party `claude-design` MCP server — see "The kit is mirrored into
  Claude Design" in `docs/wiki/concepts/design-system.md` (Pipao repo). Add
  the server, restart, then approve the
  first tool prompt (that approval is what grants project access; `/design
  consent` is the explicit equivalent, needed only when no prompt can reach
  you). It does not replace the re-sync recipe above.

## Components

- ListItem: `[RENDER] root empty` → the story imported `next/image` (needs
  the Next runtime) and an app component (`~/app/_components/aria/Checkbox`).
  Fixed in the story: plain `<img>` thumb + kit `Checkbox`. Stories under
  `packages/md3/stories` must import only the kit and React.
- Tooltip: portal stories → `overrides.Tooltip.cardMode: "single"`,
  `primaryStory: "PlainTooltip"`.
- DialogContent, GridList, BottomNavigation, TextField: `[GRID_OVERFLOW]
  wide` → `cardMode: "column"`.
- Card: stories used `https://unsplash.com/photos/<id>/download?…` (302 to an
  attachment) → images never loaded in either panel (`[ASSETS_BLOCKED]`
  unsplash.com); replaced by direct `images.unsplash.com/photo-…` URLs in the
  story. `overrides.Card.viewport: "480x800"` — Storybook's `layout:
  "centered"` shrink-wraps the card to ~250px while the preview root is a
  full-width block; 480px keeps the product card readable (square media +
  copy fit). Same treatment for Dialog (`480x400`, inline dialogs are fluid).
- ListItem: `picsum.photos/300/300` returns a random photo per request → the
  two panels showed different images; story now pins `picsum.photos/id/1011`.
- `[GENERAL]` Overlay stories (Modal, SideSheet, Menu, the modal Dialog
  stories, ColorPicker "Picker", Select closed states) capture with the
  overlay CLOSED on both sides — the harness never interacts. Their grades
  verify the trigger/scaffold only; the open surfaces are verified-by-eye in
  Storybook, not by compare. To verify them by image, add stories with
  `isOpen`/`defaultOpen` + `cardMode: "single"`.
- `[GENERAL]` `[STORY_CAP]`: the default is 6. The 2026-08-25 re-sync ran
  `--max-stories 23`, so every **captured** component is graded on all its
  stories (Button 22, Chip 20, NumberField 10, PhoneField 8, ComboBox and
  ImageField 7). Components that were *unchanged* that run carried grades
  forward untouched, so IconButton (18) and TextField (11) still hold
  6-story grades from 2026-08-24 — their tails remain ungraded. Pass
  `--max-stories 23` on any re-sync that recaptures them.
- `[GENERAL]` Role-utility coverage: `_ds_bundle.css` is Tailwind's build of
  what the repo *uses*, so unused MD3 role utilities were missing (bg 21/49,
  text 11/49, border 10/49). `src/styles/storybook.css` (Storybook's entry
  since 2026-08-24) `@source inline()`-safelists every `{bg,text,border,ring,
  fill,stroke}-<role>`, all `rounded-shape-*`, `shadow-elevation-*` and type
  roles, so the shipped CSS carries the full vocabulary the conventions
  header promises. Keep that safelist in sync when roles are added.
- The conventions header lives in `.design-sync/conventions.md`
  (`readmeHeader`); names in it are validated against `_ds_bundle.css` and
  the component tree after each build.
- Chip: **the `href` variant exposed a real kit bug** (found by compare on
  2026-08-25, fixed same run). `Chip.tsx` rooted the chip at `flex` while
  `Button.tsx` uses `inline-flex`. A `<button>` hides it — UA `fit-content`
  sizing shrink-wraps it anyway — but the new `href` branch renders a React
  Aria `Link` (`<a>`), which has no such sizing, so `<Chip href>` stretched
  to fill its parent. Storybook could not see it: Chip stories set
  `layout: "centered"`, which shrink-wraps the parent. Fixed by making the
  Chip root `inline-flex` (safe: flex children blockify, so `ChipGroup`
  is unaffected). **If a kit component ever renders full-width where a
  sibling doesn't, compare the root's `flex` vs `inline-flex` first.**
- Snackbar, Tag, Table, ComboBox, ImageField: `[GRID_OVERFLOW] wide` on
  first capture -> `cardMode: "column"` (same treatment as DialogContent /
  GridList / BottomNavigation / TextField).
- `[GENERAL]` Compare sheets: the storybook column is an element crop at ~2x,
  the preview column a full-viewport page shrunk to fit — never compare
  sizes/weights/colour intensity on the sheet; open the raw pair. A "bluish"
  resting field label in the 1x preview is antialiasing (DOM probe: label
  colour = on-surface-variant, nothing focused), not a focus state.

## Re-sync risks

- **Inputs that must move together:** any kit change → `buildCmd` (types +
  symlink) → rebuild `.design-sync/sb-reference` → driver. A stale reference
  grades against the old design (`[REFERENCE_STALE?]`).
- **Verified partially:** overlay surfaces (Modal, SideSheet, Menu popovers,
  modal Dialog, ColorPicker popover, Select popover) are graded on their
  closed state only. That now hides a *shipped feature*: Menu's `header` +
  item `href` (2026-08-25) live inside the closed popover, so the six Menu
  grades verify the trigger/scaffold and nothing else — verify the open menu
  by eye in Storybook. IconButton (18) and TextField (11) still carry
  6-story-cap grades. Dark scheme is not synced at all.
- **Remote assets:** Card stories load `images.unsplash.com`, ListItem
  `picsum.photos/id/1011` — a dead URL flips `[ASSETS_BLOCKED]` on both
  panels and grades keep passing while the product card loses its image.
  Inter comes from Google Fonts at runtime (`[FONT_REMOTE]`), not shipped.
- **Config inlines nothing** (no `provider`, no `$ref`); `titleMap` and
  `overrides` are the only hand-kept maps — a renamed story title or a new
  multi-word title needs a `titleMap` entry or it silently drops.
- **Vocabulary promise:** `.design-sync/conventions.md` claims every role
  utility exists; that holds only while `src/styles/storybook.css` safelists
  them. Adding a color role to `theme.css` → add it to the safelist.
- **Toolchain assumed:** Node 24, react-aria-components 1.20, Tailwind v4
  via `@tailwindcss/vite` in Storybook 10 (`@storybook/nextjs-vite`), Chromium
  from `.ds-sync`'s playwright.
- Legacy non-kit stories (`src/stories/*` outside `md3/`) are dropped by the
  export filter; if one of them ever exports a name that collides with a kit
  export, it would be picked up — keep them out of `MD3/` titles.
