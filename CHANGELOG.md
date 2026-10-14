# Changelog

All notable changes to the MD3 kit. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

**Versioning while pre-1.0.** The kit is copy-distributed, so the thing being
versioned is *the source you copied*, not a runtime API. Until 1.0.0:

- **minor** (`0.x.0`) — may include breaking changes: a renamed style-module
  slot or variant, a removed component, a changed prop. Every one is listed
  under **Changed** or **Removed** below.
- **patch** (`0.x.y`) — additive or corrective only. A file you have not edited
  can always be re-added with `shadcn add --overwrite`.

What "breaking" means per layer is defined in the README, "Retheming — the
three layers": token *names* and style-module *slot
names* are the contract; what a slot contains is not.

Every generated registry item carries the version it was built from in
`meta.version`, so `curl https://french-tech-homies.github.io/design-system/r/button.json | jq .meta`
tells you which release a copy came from. `.github/workflows/checks.yml` fails
if a bump was not followed by `npm run registry:build`.

## Releasing

```bash
npm version minor --no-git-tag-version   # or patch — package.json and the lockfile
npm run registry:build         # restamps every item with the new version, and writes RELEASE.json
npm run registry:check-version # what CI runs
# then add the entry below and commit everything together
```

---

## [Unreleased]

### Added

- **`Meter`** (`@ds/meter`, and in `@ds/ds`): a quantity within a known
  range, such as a quota, a disk's use or a score, on React Aria's `Meter`.
  It is the `meter` role, with `value`, `minValue`, `maxValue`,
  `formatOptions` and `valueLabel` as React Aria gives them; React Aria
  clamps the value to the range. Material 3 does not describe a meter, so it
  is the eleventh of the kit's own and borrows the determinate linear
  progress indicator's anatomy: track, active indicator, 4dp thick
  (`thickness` to change it), a 4dp gap, a 4dp stop indicator, a non-zero
  value drawn at least as a dot, mirrored right to left, and no motion. Its
  label and value are written as `ProgressIndicator` writes them (`label`,
  `showValue`). `color` (`primary`, the default, `secondary`, `tertiary`,
  `error`) sets the active and stop indicators; the track stays
  `secondary-container`. Its doc comment cites the Material page of each
  borrowing. No action needed.

<!-- The Bars and navigation batch: Badges, Toolbars, Search. -->

- **`Badge`** (`components/Badge.tsx`, registry item `badge`), Material's
  badge: the small badge, a 6dp dot, and the large one, a 16dp count up to
  34dp wide that shows "999+" above `max` (999), both on `error` with
  `label-small` `on-error` text. `anchored` sets it on the top trailing
  corner of its positioned parent, the icon, at the spec's offsets, and it
  moves to the other corner in a right-to-left page. It is `aria-hidden`:
  `badgeAccessibleText(value, label?)` gives the words a host joins to its
  name ("3", "New notification"). Server-safe. Nothing to do; the update
  adds the file.
- **`Toolbar`** (`components/Toolbar.tsx`, registry item `toolbar`),
  Material's toolbar on React Aria's `Toolbar`: `variant="docked"` (64dp,
  the full width, square, `surface-container`) or `"floating"` (a 64dp pill
  at elevation 3), `color="standard"` or `"vibrant"` (`primary-container`),
  `orientation="vertical"`, and `fab` for a FAB 8dp after a floating one,
  drawn `secondary-container` or `tertiary-container`. The colours reach the
  kit's standard icon buttons and text buttons inside it by their slots. The
  `toolbar` role and the arrow keys are React Aria's; the toolbar is one
  stop in the tab order, where Material's table also allows Tab between
  its controls (a deviation, in its doc comment).
- **Search** (`components/Search.tsx`, registry item `search`), Material's
  search: `SearchBar`, React Aria's `SearchField` as a 56dp
  `surface-container-high` pill, named by its hint, emptied by Escape or
  its clear button; and `SearchView`, the bar that opens a dialog of
  suggestions and results (`SearchViewItem`, `SearchViewSection`) on
  `Autocomplete` and `ListBox`, filtered as one types, with a live region
  that says how many results it holds. `layout="docked"` or
  `"full-screen"`, `variant="divided"` (the baseline) or `"contained"`.
  Enter on a highlighted item calls `onAction`, on none `onSubmit`; Escape
  empties the field, then closes the view, and the focus returns to the bar.
- **`SearchIcon` and `ArrowBackIcon`** in `icons.tsx`, for the search bar
  and the search view's back button.

<!-- /The Bars and navigation batch. -->

### Changed

- **The kit's own components join on need.** Before: a closed group of ten,
  changed only on the repository owner's decision. Now: a React Aria
  component Material 3 does not describe joins the group when a project
  needs it, by a change that names that project and its need. It is
  Material-derived (Material's foundations, the anatomy of the nearest
  Material component), its doc comment cites each borrowing's page beside
  "Material 3 does not describe this component.", and it is reviewed
  against them. The README's _What this kit is_ and the `ds-build` skill say
  it. What neither Material nor React Aria describes stays a project's. No
  action needed.

<!-- The Bars and navigation batch: Badges, Toolbars, Search. -->

- **`BottomNavigation`, `NavigationRail` and `NavigationDrawer`: a
  destination takes a `badge`** (a count, a short status, or `true` for the
  dot) and a `badgeLabel`, on `NavigationItem`. The bar and the rail draw
  the `Badge` on the icon; the expanded rail draws a count after the label;
  the drawer shows it as its own trailing label text, as Material's drawer
  anatomy does. The badge's words follow the destination's name ("Inbox,
  3"), joined to `ariaLabel` where the item has one. The "no badges"
  deviation is gone from all three. The bar's and the rail's active
  indicator no longer clip what is in them (the state layer takes the
  pill's rounding itself), so a badge may reach past the pill. Nothing to
  do; an item without `badge` draws as before.
- **`NavigationDrawer`'s labels are start-aligned.** They were centred in a
  destination drawn as a `<button>` (a button centres its text), which a
  trailing badge made plain; Material draws them start-aligned. Nothing to
  do.
- **`Tab` takes a `badge` and a `badgeLabel`**: on the icon of a stacked
  tab, after the label of an inline-icon or text tab, and read after the
  tab's name. The "no badge slot" deviation is gone. Nothing to do.
- **`IconButton` takes a `badge` and a `badgeLabel`**: the `Badge` on its
  icon, its words joined to `aria-label` ("Notifications, 3"). Nothing to
  do.
- **`TopAppBar` takes a `search`**, Material's search app bar: a
  `SearchView` or `SearchBar` in the title's place, 8dp from its
  neighbours, drawn on `surface-container` with no shadow; the title stays
  as a visually hidden heading, and the bar is one 64dp row whatever its
  `variant`. The "no search app bar" deviation is gone. Its doc comment
  says a screen that wants its actions as a toolbar passes a `Toolbar` into
  `actions`. Nothing to do.
- **The registry items `bottom-navigation`, `tabs` and `icon-button` now
  depend on `badge`**, which `shadcn add` brings with them.

<!-- /The Bars and navigation batch. -->

## [0.4.0] — 2026-10-14

What the kit's first two installs of 0.3.0 asked of it. Three entries need an
act of a project and say **Action needed**; the others need none.

Then what a board built on the kit and three DESIGN.md files written
elsewhere asked of it: the focus ring's gap, a table's edge and last line,
the theme's colour scheme and scroll bars, a family per type role, and a
DESIGN.md in the format's own words. They are the first entries of each
group below. Four say **Action needed**.

Then three things settled before this release: the icon button's default
colour style, which is this release's break and the first entry below; the
scroll bar's opt-out and a table's closing line, said as they work; and how
a project gives Claude a design system of its own.

### Changed

- **Breaking: an `IconButton` that names no colour style is filled,
  Material's default. Action needed: state `variant="standard"` on each icon
  button that named none.** Before: the default `variant` was `standard`, a
  gap named in 0.3.0. Now: it is `filled`, as Material's specs page gives it
  ("Color: Filled (default), tonal, outlined, standard"). What you see at
  the update without an edit: every `<IconButton>` with no `variant` gains a
  `primary` container and an `on-primary` icon. A toggle (`isToggle`) that
  named none moves too, in Material's two states for a filled toggle: not
  selected, it gains a `surface-container` container under an
  `on-surface-variant` icon; selected, the `primary` one. So does an
  `isContained` button that named none: it goes from the
  `surface-container-lowest` container to the filled one. A button that names its `variant` does not move, and
  neither does the kit's own: `SideSheet`'s close button now says `standard`.
  To do, in one pass, to keep every screen as it is: list the icon buttons
  that name no colour style, and write `variant="standard"` on each.

  ```bash
  rg -U --pcre2 -n '<IconButton\b(?![^>]*\bvariant=)' src
  ```

  Run on the kit's own files it listed its 27 unsaid buttons, the example in
  a doc comment, and nothing else.
  Read each hit: a `>` inside a prop that comes before `variant=` (an arrow
  function) lists a button that does name one. It does not find a button
  imported under another name, nor one whose props are spread from an object
  (`<IconButton {...props} />` is listed, and the object may hold the
  `variant`). Without ripgrep, `grep -rn "<IconButton" src` lists every
  icon button, to read by hand. A button you want filled needs nothing.
- **The focus ring's gap shows the ground under it. Action needed if you
  painted the gap yourself.** Before: `focusRing` drew its ring as a box
  shadow and painted the 2px gap in the page's `background`, so a focused
  control on anything else (a card, a table, a sheet) showed a band of page
  ground between itself and its ring, and forced-colours mode dropped the
  ring. Now: the ring is an outline, 3px of `ring` 2px away, as before, and
  the gap is not painted: it shows whatever the control stands on, in both
  schemes. What you see at the update: the band is gone on every surface that
  is not the page's ground, and nothing moves on the page's ground. To do:
  if you hid the band with a gap colour of your own
  (`focus-visible:ring-offset-<role>` on a kit control), remove it: it does
  nothing now. If you wrote the kit's ring by hand, write
  `outline-none outline-3 outline-offset-2 outline-ring focus-visible:outline-solid`
  or extend `focusRing`. An ancestor that clips cuts an outline as it cut the
  shadow: a part that fills such a box draws its ring inside with
  `-outline-offset-2`, as a table's header, rows and cells do. Four rings are the components' own
  and did not change: the fields' (`field-styles.ts`), and the three of the
  colour picker (`ColorField`, `ColorPicker`, `ColorArea`).
- **A slider's thumb shows a focus ring.** Before: none drew. The thumb's
  ring was keyed on the thumb's own focus, and the focus is on the input
  hidden inside it, so a keyboard user saw nothing on a focused slider. Now:
  on keyboard focus the thumb draws 2px of `ring`, 2px away, an outline with
  its gap unpainted like the kit's. What you see at the update: a ring
  around the thumb when you Tab to a slider, where there was none. Nothing
  to do.
- **The generated theme declares its colour scheme and gives scroll bars the
  theme's colours. Action needed: regenerate, and look at your native
  controls.** Before: a generated `theme.css` never told the browser which
  scheme the page is in, so what the browser draws itself stayed light on a
  dark page: a white scroll bar, a native select's list, a date field's
  picker. Now: each scheme block declares `color-scheme` (`light` under
  `:root`, `dark` under `.dark` or under the system's query) and
  `scrollbar-color: var(--md-sys-color-outline) transparent`, a thumb in
  `outline` on a lane that shows the ground. A `.dark` on a subtree follows.
  What you see once you regenerate: scroll bars, native selects, date and
  time fields, native checkboxes and the autofill ground are drawn in the
  page's scheme, and scroll bars in the theme's colours. Colours only: the
  kit sets no width and hides no bar at rest. To do: run the generator again
  (the two declarations are written by it, not by the update), then look at
  a page with a form and a scroller in both schemes.

  To keep what the browser drew before, write one rule of your own on the
  root, after the theme's import and outside any `@layer`:

  ```css
  :root,
  .dark {
    color-scheme: normal;
    scrollbar-color: auto;
  }
  ```

  With `--md3-dark-mode: system` the selector is `:root` alone. The rule goes
  on the root because the page's own scroll bar and its canvas read the root
  element: the same two declarations on `<body>` reach what is inside the
  body and not the page's bar, which keeps the theme's thumb, nor the
  canvas, which stays dark under `.dark`. The catalog shows both and reads
  them back: `MD3/Foundations/Color scheme`, "The opt-out" and "On body
  alone".

  **If you style your scroll bars with `::-webkit-scrollbar`**: once you
  regenerate, those rules stop applying, on every scroller. A browser that
  supports `scrollbar-color` ignores `::-webkit-scrollbar` rules wherever
  `scrollbar-color` is not `auto`, and the theme now sets it on the root,
  from where it is inherited. To do, one of three: write the rule above;
  or write `scrollbar-color: auto` on each scroller you style; or move your
  colours to `scrollbar-color`, which wins over the theme's on the element
  that writes it. The generated `theme.css` says the same in its head
  comment.
- **A type role takes the family your DESIGN.md writes on it. Action needed:
  regenerate your theme after the update.** Before: the theme had two
  families, one per face (the family of `display-large` for display,
  headline and title; the family of `body-large` for body and label), and a
  different family on any other role was listed as not applied. Now: each
  of the 15 roles has a family of its own, as Material's tokens do
  (`--md-sys-typescale-<role>-font`, and the utility `font-<role>`). A role
  your DESIGN.md writes no family on keeps its face's, so a DESIGN.md with
  one family per face draws what it drew. A role it writes another family on
  takes it: running text in a reading face and the labels in a squared one
  is `body-large` with the first and the three `label-*` roles with the
  second. Each family is a hook (`--font-<name>`) and one more font your
  project loads; the theme loads none. The "one family, not applied"
  warning is gone, and `DESIGN.resolved.md` shows the family applied on
  every role. To do: run the generator again after the update. The update
  brings a `theme.v4.css` with the new declarations at the kit's own values,
  as every update does; until you regenerate, your faces are the kit's. If
  your DESIGN.md wrote a family on a role that was dropped until now, it is
  applied from then on: load that font, or take the family off the role.
- **The text a component writes is in its role's family. Action needed if
  your page's font is not your theme's plain face.** Before: the type
  primitives (`Title`, `Body`, `Label`…) set a face, and a component that
  wrote a `text-<role>` itself set none: a table's header and cells, a
  field's input, label and supporting text, a checkbox's, a radio's and a
  switch's label, their groups' labels, a chip group's label, a slider's
  label, a progress indicator's, a disclosure's header and panel, an image
  field's texts, a snackbar's, a combo box's list. Those inherited the
  page's font. Now: each is written with its role's `font-<role>`, so a role
  is one family in a page. What you see: where your page's font is your
  plain face, the body and label roles do not move, and the titles a
  component writes (a checkbox, radio or chip group's label, an image
  field's label, a disclosure's header) change to your brand face where it
  differs. Where your page's font is neither face, all of the texts above
  change from the page's font to their role's. To do, if that is not what
  you want: write the family you want on those roles in DESIGN.md and
  regenerate, or fill the face's hook (`--font-<name>`) with your page's
  font. Under the Editorial preset the catalog shows it: those titles are
  now in the preset's serif.
- **A `Table` clips at its own edge.** Before: a control whose touch target
  reaches past its row (an `xsmall` icon button in a dense row reaches 4dp
  under it) made the table's content taller than the table, so a box that
  scrolled the table sideways scrolled upright too and showed an upright
  bar beside rows that fit. Now: the `<table>` is `overflow-clip`. The
  button keeps its 48dp target everywhere but under the last row, where it
  ends at the table's edge. Nothing to do; a wrapper you clipped for this
  can go. A column header now draws its focus ring inside, as rows and cells
  did.
- **A DESIGN.md in the format's own words generates, where it was refused.**
  Before: a file with no `scheme` or no `colors.seed` was refused, though
  both are the kit's keys and the format has neither, and the format's short
  sizes (`title-md`, `rounded.sm`) were ignored. Now, in the command and on
  the catalog's "Your theme" page alike: with no `scheme`, it is read from
  the file's ground (`colors.background`, else `colors.surface`: light when
  its tone is 50 or more); with no `seed`, from `colors.primary`. Each is
  listed as a warning of a new kind, **assumed**, naming the token it was
  read from and the line to write. The type sizes `-lg`, `-md`, `-sm` and
  the corners `xs`, `sm`, `md`, `lg`, `xl` are read as Material's names,
  silently; where a file writes both, Material's is read and the short one
  is listed. Still refused, in the same words: a file with no `scheme` and
  no ground, one with no `seed` and no `primary`, and a `scheme` that is
  neither `light` nor `dark`. Nothing to do: a DESIGN.md that writes
  `scheme` and `seed` generates what it generated. If yours used
  `rounded.sm` or `title-md` as names of its own and counted on them being
  ignored, they are now read.

- **`@ds/ds` writes nothing into your entry CSS. Action needed if stock
  shadcn components rely on the bridge.** Before: the item carried the shadcn
  bridge as `cssVars`, so every install and every update rewrote the entry
  CSS in three places (a `:root` and a `.dark` block of 20 variables at the
  end of the file, 19 lines such as `--ring: var(--ring);` inside your
  `@theme`, four `--radius-*` lines) and a project put the file back by hand
  each time. Now: no variable, no `@import`, at an install or an update. The
  bridge is the file `<ui>/ds/tokens/bridge-shadcn.css`. To do, once: delete
  the three blocks an earlier install wrote, and, if the project has stock
  shadcn components, import the bridge after `theme.css`:

  ```css
  @import "./components/ui/ds/tokens/theme.css";
  @import "./components/ui/ds/tokens/bridge-shadcn.css";
  @import "./components/ui/ds/tokens/theme.v4.css";
  ```

  A project with no stock shadcn component deletes the blocks and imports
  nothing. `@ds/theme` and `@ds/base`, asked for by name, still write the
  bridge. `npm run registry:check-install` refuses a registry where `ds`, or
  anything an update names, carries or reaches `cssVars` or `css`.
- **`@ds/preset-editorial` depends on the theme files (`@ds/tokens`), no
  longer on `@ds/theme`.** An update names the preset beside `@ds/ds`, and
  `@ds/theme` is an item that writes the bridge into a project's CSS. Nothing
  to do: the preset's file is the same, and `tw-animate-css` still comes with
  `@ds/ds`.
- **The update is the command the check prints, with every item you hold.
  Action needed: update with it.** `@ds/ds` does not bring the three adapters
  or the Editorial preset, so `npx shadcn add @ds/ds --overwrite -y` alone
  left an installed adapter at the old release, which the check then listed
  as changed. `node <ui>/ds/changed.mjs` now ends on the command for what the
  project holds, such as
  `npx shadcn add @ds/ds @ds/next-adapter @ds/react-hook-form-adapter --overwrite -y`.
  Run that one for this update too: it is what brings each adapter's record
  (below). The README and the `ds-theme` and `ds-build` skills say the same.
- **The update check names what is not there, and exits 1 for a file missing
  from what you hold.** Before: "N recorded file(s) are not here, removed or
  never installed: not listed", exit 0, and 4 after any whole install. Now:
  - an optional item of which nothing is in your tree is said once, in one
    line (`Not installed, and no finding: …`), and is no finding;
  - a file of the whole install, or of an optional item you hold, that is
    not there is listed under a new group, `missing`, and the check exits 1.
    A script that read exit 1 as "a file was edited" now also meets a deleted
    file; a project that deleted a kit file on purpose sees it listed, and
    the update brings it back;
  - an optional item you hold at another release than the whole install is
    named under `behind`, with its version, and is not listed as `changed`
    unless you edited it. `behind` does not change the exit code;
  - `--missing` names every recorded file that is not there, with its item
    and whether you hold it; an option the check does not know exits 2.
- **`RELEASE.json` gains a key, `optional`**: the items `@ds/ds` does not
  bring, each with its files. `version`, `kit` and `project` are as they
  were. A `changed.mjs` of this release still answers on a record without the
  key (a copy at 0.3.0 that adds `@ds/changed` alone): it counts the files
  not found as before, and `--missing` names them.
- **The type primitives draw each role's weight from the theme.** `Label`,
  `Title`, `Body`, `Headline` and `Display` wrote a weight class beside the
  role (`font-medium`, `font-regular`), which won over the theme's. They
  write none now. What a screen draws without an edit of it:
  - **under Material's weights, nothing moves**: the catalog's pictures of
    the primitives and of `Tag` are the same, byte for byte;
  - **where a `DESIGN.md` sets the weight of a label, `title-medium` or
    `title-small`**, every primitive of that role, and every kit component
    that draws text through one (`Tag`, `Button`, `Chip`, `Tabs`, the
    navigation labels, …), now draws that weight. Before, they drew 500
    whatever the theme said, and a role class written raw drew the theme's.
    A project that had worked around it sees its labels change weight at the
    update: under the Editorial preset they go from 500 to 600.
  The active label of `BottomNavigation` and `NavigationDrawer` keeps
  `font-bold`: it is Material's prominent weight.
- **Every `text-<role>` class sets a weight, and a `DESIGN.md` can give any
  role one. Action needed if you generated a theme of your own: regenerate
  it.** `tokens/theme.v4.css` had a weight token for five roles (the labels,
  `title-medium`, `title-small`). It has one for all fifteen now: the ten
  others (`display-*`, `headline-*`, `body-*`, `title-large`) are 400, the
  weight they already drew. This reverses a limit the kit had recorded on
  purpose, so read both sides:
  - a `fontWeight` on any role in a `DESIGN.md` is applied. Before, on those
    ten it was not, and was listed as a warning;
  - `text-display-large`, `text-headline-*`, `text-body-*` and
    `text-title-large` used to set no weight, so the text inherited its
    parent's. They now set their role's. **Text in one of those classes
    inside a heavier parent (a `font-semibold` on a wrapper, a `<strong>`, a
    `<th>`) used to draw the parent's weight and now draws 400.** Put the
    weight class on the element that carries the role class (`font-semibold
    text-body-medium`): a weight written on the same element still wins;
  - the template is what a generated theme is written from. Until
    `npx tsx <ui>/ds/tokens/generate-theme.mjs DESIGN.md --out theme` is run
    again, a project's own `theme/theme.v4.css` has no token for those ten
    roles, and a primitive of one of them, which no longer writes
    `font-regular`, inherits its parent's weight.
- **The three skills' descriptions open with when to load each**, in the
  words a session has in mind: the project's design system, Material 3, the
  `ds` folder, `DESIGN.md` and the theme. Before, they spoke of "the MD3
  kit", and across 27 sessions in three projects no session loaded
  `ds-build` or `ds-theme` on its own. `npm run registry:check-install`
  holds each to opening with "Use when" and to 1024 characters. The update
  rewrites the three `SKILL.md`; nothing to do.
- **The install's closing message names the release it took** ("MD3 kit
  0.3.0, under `<ui>/ds/`"), gives the four imports of a first install with
  `tw-animate-css` among them, says an update keeps its lines, and names the
  bridge import. Before, it said the theme "is not written into your CSS"
  after writing the bridge there.
- **A generated `theme.css` opens on a header that names only what a project
  has**: the kit's generator and `DESIGN.md`. Before, it named
  `npm run theme:resolve` and `tokens/resolved.json`, which are this
  repository's. A theme of your own shows that one comment as a diff the
  next time you generate it.
- **The README says what an install and an update ask of a project** ("What
  an install and an update ask of your project"), each with the line to
  write: where the skills land in a monorepo and what the root's
  instructions say, the `@source not` lines for a project that scans its
  source folder, the ESLint and `.prettierignore` lines, the update command
  with the adapters, how to read the release before an install, the import
  path worked for an entry CSS two folders away, and that the install runs
  the host's install scripts. It also says what the CLI's own dependency
  step was seen to do to a project's `package.json` (a range that was there
  rewritten to the latest, the kit's two `0.4.0` pins written with a caret)
  and what to put back: that step is the registry's and no item changes it.
  The `ds-theme` skill says the scan exclusions and the linter.
- **Only a release publishes.** Before: every merge to `main` that passed the
  checks published the catalog and the registry, so the registry could serve
  what was under `[Unreleased]` under the number of the last release. Now:
  every pull request and every push to `main` is still checked whole, and
  `pages.yml` deploys only when a push moved the version in all five places a
  release writes it (`package.json`, `package-lock.json`, every item's
  `meta.version` in `registry.json`, `RELEASE.json`, the CHANGELOG's newest
  heading). Any other merge publishes nothing and the previous site stays.
  Started by hand, the workflow publishes the last release again, and nothing
  once `main` has moved past it. Nothing to do in a project: what
  `/r/{name}.json` serves is now always a release. See the README,
  "Publishing this repository".

### Added

- **`<Table showLastRowDivider={false}>`**: the table's closing line is not
  drawn, for a table that closes with an edge of your own (a frame, a
  card's border). It is the line under the last row of the table: the
  footer's row when a `TableFooter` follows, otherwise the body's last row.
  The line between the body and a footer stays, since it separates the
  total from the data, and so does the header's. Default `true`: nothing
  changes until you say it. A `last:border-b-0` on each `Row` can go.
- **The README says how a project gives Claude a design system of its own**
  ("Your project's design system in Claude"), and the `ds-theme` skill says
  the agent's half. It is built from your own repository, with your look and
  the kit version you hold, and updated when you choose: the look goes from
  `DESIGN.md` to the generated theme to the design system, never back. For
  creating and updating it, both link Anthropic's own page and restate no
  step of it. The kit publishes no design system for others to build on and
  ships nothing that produces one: a shared one would tie every project to
  the kit's updates and would wear the kit's neutral look. Nothing to do;
  the update rewrites `ds-theme`'s `SKILL.md`.
- **`font-<role>` utilities**, one per type role (`font-title-small`,
  `font-label-large`), and their variables
  `--md-sys-typescale-<role>-font`. Write one beside a raw `text-<role>` to
  draw it in the role's family; the primitives and the components do. They
  are registered in `twMergeConfig`, so a `font-mono` of yours still wins
  over one.
- **Catalog pages**: `MD3/Foundations/Focus ring` (the ring on two grounds,
  enlarged, and read after Tab), `MD3/Foundations/Color scheme` (native
  controls and a scroller, on the page and in a `.dark` box, then "The
  opt-out" and "On body alone", each with what the root computes),
  `MD3/Foundations/Typography` "Family from the theme" and "Family in
  components", and on `MD3/Containment/Table`, "Dense in a scroller",
  "Last row divider off" and "Last row divider off, with a footer".
- **A record for each item the whole install does not bring**:
  `<ui>/ds/releases/<item>.json`, carried by `@ds/next-adapter`,
  `@ds/react-router-adapter`, `@ds/react-hook-form-adapter` and
  `@ds/preset-editorial`, each for itself: the item's name, its version and
  its file's digests. It is how the update check knows that a project holds
  the item and which release its file is from. An adapter installed at 0.3.0
  has none until it is updated: if its file differs from the whole install's
  release, the check lists it as `changed` and says it may be behind.
- **`MD3/Foundations/Typography`, "Weight from the theme"**: every primitive
  beside its raw role class, as the theme stands and under a theme that sets
  every weight to 700, and a `Tag`. Its test reads the computed weights.

## [0.3.0] — 2026-10-11

### Changed

Each of these changes what a screen draws without an edit of it. They are the
review of `Tooltip` and `Card` against Material's four pages for each.

- **`Tooltip` draws no arrow unless asked.** Material's tooltip has none.
  Before: every tooltip drew an 8 pixel arrow pointing at its trigger. Now:
  none, and `showArrow` draws it.
- **A rich `Tooltip` opens below its trigger, from the trigger's start edge**
  (`placement="bottom start"`), Material's default for a rich tooltip. Before:
  above, centred (`"top"`). A plain tooltip stays above, centred. Pass
  `placement` to choose.
- **A plain `Tooltip` sits 4 pixels from its trigger**, Material's distance to
  a trigger with a visible boundary. Before: 8. A rich tooltip stays at 8.
  Pass `offset` to choose (8 for a trigger with no boundary, such as text).
- **A rich `Tooltip` is drawn with Material's values.** Corner: 12dp
  (`rounded-shape-medium`), before 4dp (`rounded-shape-extra-small`).
  Padding: 12 top, 8 bottom, 16 left and right, before 16 all round. Headline:
  `on-surface-variant`, before `on-surface`. Supporting text: `body-medium`
  (14/20), before `body-small` (12/16).
- **A plain `Tooltip` has no shadow.** Material gives it no elevation. Before:
  `shadow-elevation-2`, which stays on the rich tooltip, where Material has it.
- **A rich `Tooltip` draws its children after its headline and supporting
  text.** Before: children replaced both. A plain tooltip handed children that
  are not a string now sets them in `body-small` too (before: 14 pixels).
- **`Card`'s corner is 12dp** (`rounded-shape-medium`), Material's
  measurement. Before: 16dp (`rounded-shape-large`).
- **A dragged `Card` (`isDragged`) follows Material's dragged state**: level 4
  for an elevated card and level 3 for a filled or an outlined one, with the
  16 % state layer. Before: level 4 for all three, scaled to 105 %, and no
  state layer.
- **`Card`'s parts are named `data-slot="card-content"`, `card-media`,
  `card-header`, `card-headline`, `card-supporting-text`, `card-actions`**, and
  `Tooltip`'s `tooltip-content`, `tooltip-headline`,
  `tooltip-supporting-text`, `tooltip-arrow`. Before: no `data-slot` on them.
  Type primitives inside them no longer read `data-slot="typography"`.

The next are the review of `IconButton` against Material's four pages.

- **A `filled` or `tonal` `IconButton` draws its container.** Material's do.
  Before: transparent, with a `primary` or `secondary` icon, unless
  `isContained` was passed too. Now: `primary` with an `on-primary` icon, and
  `secondary-container` with an `on-secondary-container` icon. Pass
  `isContained={false}` for the drawing of before.
- **An `outlined` `IconButton`'s outline is `outline-variant`**, Material's.
  Before: `outline`. It is 2 pixels on `large` and 3 on `xlarge`.
- **A toggle `IconButton` takes Material's colours for each state.** Filled:
  `surface-container` with an `on-surface-variant` icon unselected (before:
  `primary` in both states), `primary` selected. Tonal: `secondary` with an
  `on-secondary` icon selected (before: `secondary-container` in both
  states). Outlined: `inverse-surface` with an `inverse-on-surface` icon and
  no outline selected (before: unchanged from unselected). Standard: as
  before, `primary` selected.
- **A disabled `IconButton` is Material's**: the icon `on-surface` at 38 %,
  and a drawn container `on-surface` at 10 %. Before: the whole button, in
  its own colours, at 38 %.
- **A `small` or `xsmall` `IconButton` answers over 48 by 48 pixels**,
  Material's target, through a centred invisible area: 4 pixels beyond the
  edge of a `small` button (the default, 40 pixels), 8 beyond an `xsmall`
  one. Before: the drawn box. Nothing is drawn differently; a pointer just
  outside the button now presses it, and where two targets overlap the later
  button in the document answers. The root no longer clips its content
  (`overflow-hidden` is gone), and an ancestor that clips cuts the target.
- **`IconButton`'s icon sits in a `<span data-slot="icon-button-icon">`**,
  which carries its colour. Before: the colour class was on the icon itself.
- **`Table`'s sort arrow sits in a `<span data-slot="table-sort-icon">`**, and
  the column's content is `data-slot="table-column-content"`. Before: no
  `data-slot` on them.
- **A `Cell` under a `Column` with `align` takes that alignment** when it
  says none itself, as `Column`'s comment always said. Before: such a cell
  stayed at the start. A cell that says `align` is unchanged.
- **`Cell` refuses `render` in its type.** `CellProps` no longer offers React
  Aria's `render`: `Cell` places its own element, and a caller's `render` was
  dropped in silence. Before: accepted, and ignored. A caller that passed one
  now fails its typecheck and loses nothing it had.
- **`Tooltip`'s `onOpenChange` doc comment says what calls it**: the pointer
  coming onto a standalone tooltip, leaving it, and the page scrolling under
  it. It said Escape, which a standalone tooltip is never told of. No
  behaviour changes.

The rest are the kit's own: its names, its theme files, its generator and
its documents.

- **The kit says what it is, which components are its own, and one thing
  about change.** Three statements, each in the one file that owns it, the
  others pointing there. No component's behaviour or look changes.
  - **What it is** (README, "What this kit is"): Material 3's implementation.
    One kit per design system: another design system would be a kit of its
    own beside this one, in the same repository and registry, with its own
    components, tokens and spec. Nothing is built for one.
  - **Which components are its own** (same section): those Material 3's
    specification describes, and a closed group of ten it ships that Material
    does not describe: `Table`, `Tag`, `Avatar`, `Disclosure`,
    `PreviewTrigger`, `NumberField`, `PhoneField`, `ImageField`, `EmptyState`,
    and `ColorPicker` with `ColorArea`, `ColorField`, `ColorSlider` and
    `ColorSwatch`. A component joins or leaves the group only on the
    repository owner's decision. A part that is neither Material's nor the
    group's is a project's, written beside the kit. Each member's doc comment
    now says "Material 3 does not describe this component.", and every other
    component file cites its page of m3.material.io (twelve gained the
    citation: `Button`, `IconButton`, `Card`, `Menu`, `Tooltip`,
    `DialogContent`, `Modal`, `ModalDialog`, `ListItem`, `GridList`, `Slider`,
    `SideSheet`). `scripts/check-components.mjs`, run by
    `npm run registry:check-install`, refuses a list and files that differ and
    a component file that says neither.
  - **What a project may change** (the `ds-build` skill, "What a project may
    change"): an edit of a kit file is allowed, priced and rarely needed. An
    update overwrites every kit file that differs, and the project puts its
    edit back by hand. This replaces two sentences that pulled apart: "the
    code is yours to edit" in the README, and "nothing: compose, wrap" with
    "a fork at the project's cost" in the skill. The three layers stay, as
    what an update promises each. **Nothing to do in a project**: an update
    brings the three skills with the new text.

- **The generator writes one value per declaration.** What
  `tokens/design-md.mjs` copies from a DESIGN.md into `theme.css` and
  `theme.v4.css` is one value of the kind its place takes, so a file can no
  longer end a declaration and add a property, a rule, an `@import` or a
  `url()` to a project's theme. A family name is written as one CSS string
  (`"` and `\` escaped), and a fallback that is not plain words is quoted too:
  `Source Sans 3` behind a comma is now `"Source Sans 3"`. **Refused from now
  on**, with the token named and what the kit reads there: a `fontSize` that
  is not a length (`16`, `calc(…)`, `clamp(…)`: write `16px`), a `lineHeight`
  that is not a length or a number, a `letterSpacing` that is not a length or
  `0`, a `fontWeight` that is not 1 to 1000, `normal` or `bold` (`bolder`), a
  `rounded` step that is not a length or `0`, an easing that is not a keyword,
  `cubic-bezier()`, `steps()` or `linear()` (no `var()`), an elevation holding
  anything but lengths, colours, keywords, `var()`, the math functions and the
  colour functions, and a `fontFamily` that is a list, spans lines, has an
  empty name between commas or names no family. A theme generated from a file
  the kit accepted with valid CSS values is byte for byte the same.

- **The namespace is `@ds`, the all-in-one item is `ds`, and the files land
  under `<ui>/ds/`** (were `@md3`, `md3`, `<ui>/md3/`). **Action required**
  for an existing install: the README's "Coming from `@md3`" has the three
  steps. Every other item keeps its name, and so do the `--md-sys-*`
  variables.
- **The three skills are `ds-theme`, `ds-build` and `ds-spec`**: their
  folders under `skills/`, the `name` a project's agent loads them by, and
  where they land (`.claude/skills/ds-theme/`, `ds-build/`, `ds-spec/`). The
  items stay `theme-skill`, `build-skill` and `spec-skill`, the command stays
  `md3` and its script `md3.mjs`; the spec cache is `~/.cache/ds-spec`. No
  release carried the skills under another name, so there is nothing to
  migrate.
- **The kit's home is `french-tech-homies/design-system`**: the registry is
  served from `https://french-tech-homies.github.io/design-system/r/{name}.json`
  with the catalog at the site root. The two earlier addresses are retired.
  Every item's `meta.kit` now names that repository.
- `scripts/check-registry-version.mjs` takes the built registry's folder as
  its argument, in place of a path written into it.
- `tokens/resolved.json`'s `$schema` is `md3-kit/resolved-tokens/v1`.

- **`md3`, `theme` and `base` no longer write the palette into your CSS.
  Action needed.** They used to write the 49 `--md-sys-color-*` roles into
  `:root` / `.dark`, and the whole `@theme inline` mapping, the `@utility`
  rules, the ambient `color` and the `@custom-variant dark` line into the
  entry CSS. They now write only the shadcn bridge (19 variables, each a
  `var(--md-sys-color-*)` reference, and `--radius`) and
  `@import "tw-animate-css"`. The theme travels as files (`@md3/tokens`,
  above) that the entry CSS imports:

  ```css
  @import "tailwindcss";
  @import "./components/ui/md3/tokens/theme.css";
  @import "./components/ui/md3/tokens/theme.v4.css";
  ```

  Why: inline blocks come after every `@import`, so they silently beat a theme
  a project generated from its own DESIGN.md, and every re-add by name put the
  kit's default back over it. Now no item targets a project's theme, and it
  survives every update.
  - **A fresh install is unthemed until those two imports are written.** The
    CLI prints them after `add @md3/md3`; the `ds-theme` skill writes them.
    In class mode, hold `@custom-variant dark (&:where(.dark, .dark *));`
    yourself.
  - **An existing install keeps its inline blocks**, and they override the
    imported files. Delete the `--md-sys-*` declarations from `:root` and
    `.dark` and the kit's `@theme inline` block and `@utility` rules from the
    entry CSS, then add the two imports.
  - The registry's `theme` item named `--font-inter` without defining it (it
    took the first `:root` block of `theme.css` only). `theme.css` now
    arrives whole, with the hook.
- **README, _Taking an update_, corrected: a plain re-add does not update.**
  It said that re-adding updates every file you never touched. It does not:
  the CLI keeps no record of what it installed, so any file that differs —
  changed by the kit or edited by you — raises a prompt defaulting to No,
  even under `-y`, and unattended the run stops at the first one having
  written nothing. The update path is now `shadcn add @md3/md3 --overwrite
  -y` from a clean tree, then `git diff`, with forks put back by hand. The
  `ds-theme` and `ds-build` skills tell the same path.
- **The DESIGN.md contract moved out of the README** into
  `skills/ds-theme/design-md.md`, so it travels with the install. The README
  keeps the heading, a summary and the kit's own commands.
- **`skills/ds-spec/SKILL.md` no longer names this repository**: the command
  is `node .claude/skills/ds-spec/md3.mjs`, and `md3 check` is described
  against a version file of the project's own.
- **The default palette is a neutral slate, no longer pipao's.** The theme the
  kit ships — `tokens/theme.css`, carried by the registry's `tokens` item —
  used to be pipao's own: an indigo primary
  (`hsl(237 26% 45%)`), a green secondary and a teal tertiary. It is now
  generated from the kit's own `DESIGN.md` (new, at the kit's root): a
  blue-grey primary (`#505f76` light, `#b7c8e1` dark), a grey secondary and a
  warm grey tertiary, every role derived from three key colours. **If you
  import the kit's `tokens/theme.css` and re-add `@md3/tokens`, `@md3/theme`,
  `@md3/base` or `@md3/md3`, or copy the file again, every `--md-sys-color-*`
  value changes.** To keep
  the palette you have, or to set your own, write it in a `DESIGN.md` of your
  project and generate the theme into your own folder —
  `tsx tokens/generate-theme.mjs <your DESIGN.md> --out <dir>` — then import
  `theme.css` and `theme.v4.css` from there, not from the kit's `tokens/`.
  The old palette as a DESIGN.md is `seed: "#4d518a"`, `secondary-key:
  "#3d6c3d"`, `tertiary-key: "#006e7a"`, with `on-primary-container:
  "#11144b"`, `on-secondary-container: "#002105"`, `on-tertiary-container:
  "#001f24"` and `on-error-container: "#420002"` written under `scheme:
  light`. The four `on-*-container` roles are no longer written by hand in
  the default, so they are the derived ones. Nothing else moved: the type
  scale, the corners, elevation, motion and state values are the same, and
  the typeface is still Inter through the `--font-inter` hook. That is the
  kit's file choosing Inter on each type role; a DESIGN.md that writes no
  `typography` gets Material's baseline from the generator, which is Roboto.
  `skills/ds-theme/design-md.md`.
- **`npm run theme:generate` and `npm run design:lint` read the kit's own
  `DESIGN.md`**, not the one at the root of the repository the kit sits in. A
  project passes its file and `--out` to `tokens/generate-theme.mjs`.

- **The theme is generated from a project's `DESIGN.md`.**
  `npm run theme:generate` now reads a DESIGN.md (Google Labs' format,
  `@google/design.md` 0.4.0) and writes `tokens/theme.css` whole, the type,
  corner and typeface declarations of `tokens/theme.v4.css`, and
  `tokens/DESIGN.resolved.md` — the complete file, for agents. Colours come
  from key colours (`seed`, `secondary-key`, `tertiary-key`, …); any role the
  file writes wins in the scheme its `scheme:` key names, and the other scheme
  is derived. This step on its own left the bundled theme's values as they
  were; the default palette then changed, as "The default palette is a neutral
  slate" above says, and the bundled theme no longer comes from pipao's file.
  The derivation is `tokens/design-md.mjs`; `@material/material-color-utilities`,
  `yaml`, `tsx` and `@google/design.md` are now `devDependencies` instead of an
  install-by-hand peer. README → _The theme comes from DESIGN.md_.

- **A DESIGN.md's body carries elevation, motion and state, and says how dark
  is switched.** The generator reads the `:root` rule of the first `css` block
  under `## Reference CSS`: the five `--md-sys-elevation-*`, the four
  `--md-sys-state-*-state-layer-opacity`, the six `--md-sys-motion-easing-*`
  and the twelve `--md3-duration-*`, under the theme's own names, and sets
  them in `tokens/theme.v4.css`. A name the block leaves out gets the kit's
  own value; any other declaration is listed as a warning, and so is a
  heading with no `:root` rule the kit can read under it. `--md3-dark-mode`
  in the same rule is `class` (the default: dark under `.dark`, as before) or
  `system` (dark under `@media (prefers-color-scheme: dark)`); anything else
  is refused. This step left the bundled theme's 27 values and its `.dark`
  switch as they were, and they still are; the default palette then changed,
  as "The default palette is a neutral slate" above says, and the bundled
  theme no longer comes from pipao's file.
- **New warnings, the theme still written.** A written colour whose text pair
  falls under 4.5:1 (40 text-on-background pairs, checked when at least one
  side is written); a top-level front-matter key outside the format's own
  (`typographie:`). Warnings are also written to a `## Generator warnings`
  section of `tokens/DESIGN.resolved.md`, absent when there are none.
- **`tokens/DESIGN.resolved.md` carries the complete reference block** (the
  dark choice and the 27 values the theme was written with; in a generated
  `## Resolved reference CSS` section when the kit read no rule under the
  project's heading), and keeps a
  property the kit has no variable for on a known type role, so generating
  from it lists the same warnings.

- **`primitives/Typography.tsx` no longer hard-codes `text-on-surface`.**
  `Display` / `Headline` / `Title` / `Body` / `Label` asserted `on-surface` on
  every render, so a `Label` inside `bg-primary text-on-primary` came out
  on-surface — 2.57:1 under Material, 1.77:1 under the Editorial preset — and
  the pairing rule in `conventions.md` (a `bg-<role>` carries `text-on-<role>`)
  could not reach anything inside the container. Content color is now
  inherited. **If you forked `Typography.tsx`, take the `base: ""` and the
  `colorRole` variant together with the two `tokens/theme.css` lines** — the
  ambient is what keeps uncolored ancestors rendering `on-surface` in both
  schemes. Kit components that already passed `text-inherit` (`Chip`, `Tag`,
  `Tooltip`) can drop it; nothing else changes.
- **`components/BottomNavigation.tsx` is a `<nav>`, not React Aria `Tabs`.**
  A Material navigation bar takes you to another page; it does not swap a
  panel inside the current one. Built on `Tabs` + `TabList` with no
  `TabPanel`, every destination carried `role="tab"` and an
  `aria-controls="…-tabpanel-<id>"` pointing at an element that did not exist
  — an `aria-valid-attr-value` violation shipped to every consumer of the kit.
  It is now a `<nav>` around a list of React Aria `Link`s (items with `href`)
  or `Button`s, with `aria-current="page"` on the active one, so Tab moves
  between destinations and Space/Enter activates, exactly as the spec's
  keyboard table says.

  **The props changed.** `BottomNavigationProps` was `TabsProps & { items }`
  and is now `React.ComponentPropsWithoutRef<"nav">` plus `items`,
  `selectedKey`, `defaultSelectedKey` and `onSelectionChange`. Keys are
  `string` (the item `id`) rather than React Aria's `Key`, and
  `onSelectionChange` receives that key directly. Code that passed
  `selectedKey` / `defaultSelectedKey` / `onSelectionChange` — the whole of the
  documented surface — needs no change; anything relying on the rest of
  `TabsProps` (`orientation`, `disabledKeys`, `keyboardActivation`,
  `selectionMode`) does. The item slot's `data-slot` is
  `bottom-navigation-item`, was `bottom-navigation-tab`.

  The anatomy caught up with the spec in the same pass: the active destination
  gets the 64×32 pill indicator on `secondary-container` with an
  `on-secondary-container` icon, its label is `on-surface` at the prominent
  weight, inactive items stay `on-surface-variant`, and the state layer is
  painted inside the indicator. `NavigationItem` gained `activeIcon` (Material
  fills the active icon; the kit ships no icons, so the filled member of your
  set travels with the item) and `ariaLabel` (a more descriptive accessible
  name when the visible label is ambiguous). The bar labels its own landmark
  `aria-label="Primary"` unless you pass one.
- **`utils.ts` gained three tailwind-merge class groups** — `font-brand` /
  `font-plain` as font-family, `font-regular` as the font-weight it always was,
  and `state-opacity-*` as `opacity`. **If you forked `utils.ts`**, re-add them
  when you take `Typography` or a state layer: without the first two,
  tailwind-merge reads `font-regular` as a family and `font-regular font-brand`
  collapses to `font-brand`, dropping the weight.
- **`components/DialogContent.tsx`'s title slot dropped its `font-medium`.** It
  had no effect before — the primitive's `font-regular` was misread as a family,
  so both classes survived the merge and the later `.font-regular` won — and
  with the class groups above it would have turned every dialog title 500.
  Dialog titles stay at MD3's headline weight, 400.

### Removed

- **`theme:generate -- "<seed>"` printing a `theme.css` to stdout.** A
  DESIGN.md holding `scheme` and `colors.seed` is the same case. The script is
  not a registry item, so no installed copy carried it.

### Added

- **A project can name a mono face.** `typography.mono.fontFamily` in a
  DESIGN.md becomes a font hook in `theme.css`, the token
  `--md-sys-typescale-mono-font` in `theme.v4.css` and, through it, Tailwind's
  own `font-mono`, which the project writes where it wants the face (an
  identifier, a time, an amount). With none named the token is the system's
  monospace stack, what `font-mono` gave before, and no screen moves. No kit
  component uses it. With a face named, `code`, `kbd`, `samp` and `pre` follow
  it too, through Tailwind's base styles. A project that generated a theme of
  its own gets the token at its next `theme:generate`; until then its
  `font-mono` is Tailwind's default, as before. A project whose entry CSS
  already declares `--font-mono` reads what happens then in the README,
  _Type_: inside `@theme` the declaration read last wins, outside it the
  kit's line stands.
- **A check lists the kit files a project changed, before an update replaces
  them**: `node <ui>/ds/changed.mjs`, the item `@ds/changed`, which the whole
  install brings. It reads `<ui>/ds/RELEASE.json`, the record of the release
  a whole install was made from (new, carried by `@ds/ds` alone), lists what
  differs as `changed` or `whitespace`, writes nothing and merges nothing.
  Exit 0: nothing differs; 1: something is listed; 2: it cannot tell.
  Nothing is set aside: the CLI lands a `.ts` or `.tsx` file without the
  comment it opens with, so the record holds both forms of such a file
  (`index.ts`, `primitives/Typography.tsx`), and a comment a project puts at
  the top of any kit file (`// @ts-nocheck`) is listed like any edit. The
  record is committed, `checks.yml` fails when it is not what
  `npm run registry:build` writes, and the lifted build writes the same one. **A
  copy installed at 0.2.0 has no record**: the check says so in plain words,
  and that copy updates as before (overwrite, then `git diff`). It can get
  the check alone with `npx shadcn add @ds/changed`; the record comes with
  its first whole update. README, _Taking an update_.
- **A composed page in the catalog, `MD3/Composed page`**: a card for the one
  thing that waits for a person, over a dense table, drawn from the kit's own
  exports and nothing else. It is where this release's parts are seen
  together: `Card` at Material's corner and named by its headline, a rich
  `Tooltip` of rows on figures that are only read, `xsmall` icon buttons in
  40 pixel rows, columns aligned to the end, cut cells, the mono face, and
  `classNames` on named parts (`PartsRestyled`). Its keyboard path, through
  the card then the table, is asserted in `MD3/Interactions/Composed page`.
- **The `ds-build` skill says what a project's own component follows**:
  Material's pages for its measures where Material describes it, read with
  the `ds-spec` skill, and React Aria for its behaviour. It names Adobe's own
  React Aria skill with the command that installs it, and any page of the
  documentation as markdown without it. The kit ships nothing of Adobe's.
- **`Tooltip` takes corner placements**: `placement` is React Aria's own, a
  side or a side and where along it (`"bottom start"`, `"top end"`,
  `"right top"`). The side classes follow the side the tooltip landed on, so
  a flipped tooltip enters from the right side.
- **`Tooltip` takes `showArrow`, `offset` and `variant`**, and its types
  `TooltipProps` and `TooltipTriggerProps` are exported.
- **`Focusable` is exported** from `components/Tooltip.tsx` and the barrel,
  for a tooltip trigger that is no button. Its one child must take focus
  (`tabIndex={0}`) and carry a role.
- **A rich `Tooltip` takes any content that is only read**: a headline, a
  supporting text, then children such as rows of label and value. Nothing
  operated: Material's rich tooltip buttons and its persistent tooltip are
  gaps, named in the doc comment.
- **`Card`'s root takes what places it and names it**: `component` (`div`,
  `section`, `article`, `li`), `ref`, `id`, `role`, `style`, every `aria-*`
  and `data-*` attribute. It refuses event handlers and `tabIndex` at the
  type; the directly actionable card is a gap, named in the doc comment.
- **`Tooltip`, `Card` and `CardContent` take `classNames`**, classes for their
  named parts, keyed by the part's name. The doc comment of each lists them.
- **`IconButton` takes `size`**, Material's five: `xsmall` (32 pixels, 20
  pixel icon), `small` (40, 24; the default, and the size of before),
  `medium` (56, 24), `large` (96, 32) and `xlarge` (136, 40). The root says
  `data-size` and `data-variant`. Shapes, widths, the tooltip on hover and
  filled as the default colour style are gaps, named in the doc comment.
- **`Table` takes `density`**: `dense` draws 40 pixel rows under a 44 pixel
  header. The default stays 52 under 56. The root says `data-density`.
- **`Cell` takes `truncate`**: the text is cut to one line, and when it is
  really cut the whole of it shows in a rich `Tooltip` while the pointer
  rests on the cell or the keyboard is on it; it stays 1.5 seconds after the
  pointer leaves and while the pointer is on it, one cut cell's tooltip
  shows at a time, and Escape puts it away without clearing the selection. Give the column a width. The
  `table` registry item now depends on `tooltip`.
- **`Tooltip` takes `triggerRef`, `isOpen` and `onOpenChange`**, to show it
  with no `TooltipTrigger`, against an element the caller names.
- **`Column`, `Cell` and `IconButton` take `classNames`**: `columnContent` and
  `sortIcon`; `cellText`; `icon`.
- **`StateLayer` takes `className`**, and the colours `on-secondary` and
  `inverse-on-surface`.
- **A skill's frontmatter that does not parse is refused** by
  `npm run registry:check-install`: every `SKILL.md` opens with a block of
  strict YAML whose `name` is its folder and whose `description` is text.

- **The catalog shows a project its own theme.** The page `MD3/Your theme`
  takes what a project generated, `theme/theme.css` and `theme/theme.v4.css`
  together or its `DESIGN.md` alone (generated in the browser by
  `tokens/design-md.mjs`, warnings shown), and every story draws under it, in
  light and in dark, across stories and reloads. The toolbar's **Preset** has
  a third value for it, "Your theme (handed)"; Preset → Material shows the
  default again and "Forget this theme" drops it. Nothing is uploaded: the
  theme is read in the browser and kept in its `localStorage`. A handed file
  is never inserted into the page: only custom properties under the theme's
  own names are set, one by one, and a value naming an address is left out and
  listed, so a file cannot make a request or restyle the catalog. Fonts are
  not fetched, and a handed theme obeys the toolbar's Theme switch whatever
  its dark mode. A stylesheet handed alone, a file that is not a theme and a
  DESIGN.md the generator refuses are refused in words that say what to hand.
  What the catalog compiles by default is unchanged, byte for byte.
  `tokens/design-md.d.mts` types the generator for the catalog's TypeScript;
  it is no registry file.
- **The lift: one command writes the kit's own repository.** `npm run lift --
  <folder>` copies every tracked file of the kit into a folder outside the
  repository it is built in, with that repository's own root: its
  `package.json` and lockfile, the two workflows (`checks.yml`, `pages.yml`),
  its `CLAUDE.md`, and `LIFT.json`, the marker naming the commit the tree was
  lifted from. It refuses a kit with uncommitted changes, and refuses its own
  output when a word of the source repository, a retired name or a changed
  `.design-sync` byte is in it. The lifted tree installs from its own
  lockfile and passes every check its workflow names. `.design-sync` travels
  byte for byte.
- The kit's manifest now declares six packages it always used and its host's
  lockfile provided: `eslint-plugin-react-hooks`, `@types/node`,
  `lucide-react`, `zod`, `@hookform/resolvers` and `framer-motion` (lint,
  typecheck and stories only; no item gains a dependency).

- **The application shell: `TopAppBar`, `NavigationRail` and
  `NavigationDrawer`** (`@md3/top-app-bar`, `@md3/navigation-rail`,
  `@md3/navigation-drawer`) — the last two entries on the "Not included" list
  that stood between the kit and a second project shipping a shell.
  - **`TopAppBar`** ships the spec's four baseline types — `small` and
    `center-aligned` at 64dp with a `title-large` title on the action row,
    `medium` (112dp, `headline-small`) and `large` (152dp, `headline-medium`)
    with the title on its own row — plus a leading slot, trailing actions and
    a per-size `subtitle`. Presentational and **server-renderable**. The title
    is a real heading (`headingLevel`, default 1). Deviations: no on-scroll
    collapse (it needs a scroll container the kit does not own, so it is left
    out rather than half-implemented), no M3-Expressive "flexible" bars, no
    search bar.
  - **`NavigationRail`** covers both spec states in one component: collapsed
    at 96dp (80dp with `isNarrow`) with vertical items and a 56×32 pill, and
    expanded at 220dp with horizontal items in a full-width 56dp pill. `header`
    and `footer` take the menu button, FAB and account row the spec's
    configurations show.
  - **`NavigationDrawer`** ships `standard` (inline, elevation 0) and `modal`
    (scrim, focus trap, Escape, on React Aria `ModalOverlay` + `Modal` +
    `Dialog`), 360dp with 16dp trailing corners, 56dp full-pill indicators and
    a **bold** active label — the spec's prominent weight, so the selection is
    not carried by colour alone. `sections` separates groups with the kit's
    `Divider`; `headline` and `header` are the heading and the control slot
    above the list.
  - All three are `<nav>` / `<header>` landmarks with `aria-current="page"`,
    not tab sets, exactly like `BottomNavigation`. Shared deviations: no
    badges, and no filled active icon unless an item carries `activeIcon`.
- **`Title` accepts `component="h1"`.** The element and the type role are
  independent — that is what `component` is for — and a top app bar's title is
  `title-large` by the spec while being the page's own heading. Additive: the
  union only grew.
- **`Tabs`, `TabList`, `Tab` and `TabPanel`** (`@md3/tabs`) — Material primary
  and secondary tabs on React Aria's `Tabs`. `primary` and `secondary` are the
  spec's own split (one set on a screen vs the level below one), not two looks.
  48dp rows, 64dp once a tab stacks an icon over its label; a 1dp
  `surface-variant` divider under the row; an active indicator 3dp tall with
  rounded top corners that hugs its label for primary, 2dp and full-width for
  secondary. `TabList isScrollable` is the spec's answer past four tabs.
  Deviations in the doc comment: no swipe between panels, no badge slot (the
  kit has no badge), and vertical orientation gets React Aria's behaviour with
  the horizontal anatomy, because MD3 has horizontal tabs only.
- **`PreviewTrigger` and `PreviewCard`** (`@md3/preview-trigger`) — a
  non-modal popover that opens on hover, focus **and** long press and may hold
  interactive content, on React Aria's `PreviewTrigger`. MD3 has no page for
  it; the surface is a Material container (`surface-container-high`,
  `rounded-shape-medium`, `shadow-elevation-2`) rather than an invented one,
  and the doc comment points at the rich tooltip for the simpler case.
- **`Dialog` takes `role="alertdialog"`** (inside the existing `@md3/dialog`
  item, not a new one). MD3 has no separate alert dialog — it is the basic
  dialog with an alert role — so this is a `role`, not a variant. `ModalDialog`
  turns light-dismiss off for it: a click on the scrim must not answer a
  question that has to be answered. Escape still closes. **Additive**: the
  default is `"dialog"` and every existing caller is unaffected.
- **`Disclosure`, `DisclosureGroup`, `DisclosureHeader`, `DisclosureTrigger`
  and `DisclosurePanel`** (`@md3/disclosure`) — expand/collapse on React Aria's
  `Disclosure` / `DisclosureGroup`, so the trigger carries `aria-expanded` and
  `aria-controls`, the panel is labelled by its trigger, Enter and Space toggle
  and focus stays put. A bare `Disclosure` is the collapsible; a
  `DisclosureGroup` is the accordion (single, or `allowsMultipleExpanded`).
  Two variants: `plain` separates rows with `outline-variant` hairlines,
  `outlined` boxes each at `rounded-shape-medium`; a group passes its variant
  down through context so it is set once. **MD3 publishes no page for this
  component** — M2's expansion panel was dropped in M3 and never replaced — so
  the anatomy is assembled from MD3 parts (a 56dp list row with a state layer,
  the divider role, the shape scale, MD3 motion tokens) and the doc comment
  names each borrowed part rather than citing a spec that does not exist.
- **`Divider`** (`@md3/divider`) — the 1dp `outline-variant` line, in
  Material's own three variants (`full-width`, `inset` at 16dp leading,
  `middle-inset` at 16dp both) and both orientations. Presentational and
  **server-renderable**: no React Aria import, no `"use client"`. Decorative by
  default (`role="presentation"`, hidden from assistive technology, which is
  what the spec's accessibility page asks for); `decorative={false}` makes it a
  `separator` for the cases where the line is the only boundary marker.
- **`ProgressIndicator`** (`@md3/progress-indicator`) — linear and circular,
  each determinate and indeterminate, on React Aria's `ProgressBar` so the
  `progressbar` role and the locale-formatted `aria-valuetext` come from the
  behaviour layer. `primary` active indicator on a `secondary-container` track
  with the spec's 4dp gap, and the 4dp stop indicator on the determinate linear
  bar only. `size` (24–240dp) and `thickness` are props because M3 Expressive
  makes both configurable. Three documented deviations, all in the component's
  doc comment: no wavy active indicator, a constant-sweep indeterminate circle
  rather than a growing/shrinking arc, and a one-segment linear sweep. The
  sweep is the kit's only keyframe; it ships as a `<style href precedence>`
  inside the component so a copied file carries its own motion and React emits
  the rule once per page. Both animations honour `prefers-reduced-motion`.
- **`Typography` takes a `colorRole` prop** — `on-surface`,
  `on-surface-variant`, `on-background`, the eight other `on-<role>` roles,
  `inverse-on-surface`, and `primary` / `secondary` / `tertiary` / `error` for
  accent text. It states a role where inheritance is not what you want (`<Body
  colorRole="on-surface-variant">` for supporting text); `className` still wins
  over it. Default `inherit`. Named `colorRole` rather than `color` because
  `color` is a real (deprecated) HTML attribute, and these primitives are
  prop-forwarding targets — a wrapper piping
  `ComponentPropsWithoutRef<"h3">` into `<Title>` would stop typechecking.
- **An ambient content color** in `tokens/theme.css`: `color:
  var(--md-sys-color-on-surface)` on `:root` and on `.dark` — the one
  declaration in that file that paints rather than defines. Declared once per
  scheme block so a `.dark` on a *subtree* recolors that subtree. The `theme`
  registry item carries it as a `css` rule, since `cssVars` can only express
  `--name: value`.
- `MD3/Foundations/Typography` gains `OnColoredContainers` (every role on every
  colored container, nothing passing a class) and `StatedColor`.
- **Two typefaces, as MD3 has them** — `--md-sys-typescale-brand-font` (display
  / headline / title) and `--md-sys-typescale-plain-font` (body / label), fed to
  the new `font-brand` / `font-plain` utilities that `Typography` applies per
  variant. Both default to `var(--font-inter)`, so a kit that sets neither
  renders exactly as before; a theme that wants a serif display no longer has
  to turn the whole UI serif.
- **State-layer opacities are tokens** —
  `--md-sys-state-{hover,focus,pressed,dragged}-state-layer-opacity`
  (8 / 10 / 10 / 16 %), read through `@utility state-opacity-{hover,focus,
  pressed,dragged}`. `primitives/StateLayer.tsx` and every CSS-driven state
  layer use them instead of Tailwind's numeric `opacity-8` / `10` / `16`, which
  compiled to literals no theme could reach. Same numbers, same rendering — a
  preset can now flatten or exaggerate interaction feedback.
- **`tokens/preset-editorial.css` exercises both**: an old-style serif for the
  headings over a humanist sans for the running text (the ambient `--font-inter`
  is the plain face now, so inputs match the body), and a state layer at half
  Material's hover tint with a louder press.
- **`@md3/license`** — the MIT notice as a registry item (`registry:file`
  targeting `<ui>/md3/LICENSE`) that **every other item depends on**, so an
  install carries the terms beside the code it copies: `add @md3/button` writes
  it next to the component, `add @md3/md3` and `init @md3/base` deliver it too.
  Until now `shadcn add @md3/md3` wrote 42 source files and no licence. Every
  generated item also declares `meta.license: "MIT"`.
- **The one install brings the DESIGN.md tooling and the agent's skills.**
  `npx shadcn add @md3/md3` now leaves a project holding everything an agent
  needs to give it a look of its own, with nothing else to fetch from the
  kit. Four new items, all dependencies of `md3`:
  - **`@md3/tokens`** — the kit's default theme as files under `<ui>/md3/`:
    `tokens/theme.css`, `tokens/theme.v4.css`, `tokens/bridge-shadcn.css`,
    the complete `tokens/DESIGN.resolved.md`, and the kit's neutral
    `DESIGN.md` they are generated from.
  - **`@md3/design-md`** — the generator, `tokens/design-md.mjs` and
    `tokens/generate-theme.mjs`, beside the `theme.v4.css` template it reads.
    It declares `@material/material-color-utilities`, `yaml`, `tsx` and
    `@google/design.md` as dev dependencies, at the kit's own ranges. A
    project runs `npx tsx <ui>/md3/tokens/generate-theme.mjs DESIGN.md --out
    theme`.
  - **`@md3/theme-skill`** — the Claude Code skill `ds-theme`: write the
    project's DESIGN.md from a brief, generate, read the warnings, lint, wire
    the entry CSS, take a kit update. Beside it, `design-md.md`: what the kit
    reads in a DESIGN.md, including how colour names that are not the kit's
    are mapped by the agent onto the keys and the 49 roles.
  - **`@md3/build-skill`** — the Claude Code skill `ds-build`: the rules for
    building with the kit (role utilities and pairing, the type primitives,
    state layers), the resolved file as the reference for values, and what a
    project may change, with the price of an edit of a kit file.

  `md3` also depends on `@md3/spec-skill` now, which it did not. The three
  skills land in the **project's** `.claude/skills/` (`~/` in a shadcn target
  is the project root, not the person's home). The install never writes a
  project's root `DESIGN.md` or its `theme/` folder. README → _Install from
  the registry_.
- **`npm run -w @pipao/md3 registry:check-install`**
  (`scripts/check-install.mjs`, run by CI) — fails when `md3` no longer
  reaches the generator, a skill file, or a file a skill names; when a script
  an item carries imports a package the item does not declare, or a skill
  names an `npx` command whose package the generator's item does not declare;
  and when a skill file names anything of the repository the kit is built in.
- **`generate-theme.mjs --out <dir>` creates the folder** when it is missing.
- **`primary-key` in a DESIGN.md's `colors`.** It replaces the primary tonal
  palette with the key's own hue and chroma in both schemes, the way
  `secondary-key` and the others replace theirs. Without it the primary
  palette is the seed's hue at Material's fixed chroma, whatever the seed's
  own chroma — so a muted primary could only be written role by role, and
  only in one scheme. `tokens/DESIGN.resolved.md` keeps the key.

### Fixed

- **`Tooltip variant="rich"` was ignored**: the variant was always inferred
  from `headline` and `supportingText`. It is honoured when given, and
  inferred as before when left out.
- **A toggle `IconButton`'s `isSelected` was dropped**, so a controlled toggle
  was not controlled. It is handed to React Aria's `ToggleButton`.
- **Fields follow the text-fields token table in every state** — the kit was
  re-audited against m3.material.io `2026-09-23_06-10-05`, and text fields is
  the one audited page that had moved. All of it is in `field-styles.ts`, so
  `TextField`, `NumberField`, `PhoneField`, `Select` and `ComboBox` change
  together; no slot or variant was renamed.
  - The outlined container is 56dp, not 58: its 1dp outline is now inside the
    height instead of added to it.
  - The focused outline is the spec's 3dp, drawn inwards. It rendered as 1dp
    (the extra outline sat exactly on the border), and an outlined `Select`
    drew none at all.
  - Hover reaches the outlined variant: the outline and the label turn
    `on-surface`. The rule keyed on a parent that was the container itself, so
    it never matched.
  - An invalid field keeps `error` when focused — the filled active indicator
    and a focused `Select` outline fell back to `primary` — and on hover its
    outline or indicator, label and trailing icon turn `on-error-container`.
    Focus outranks hover: a focused or open invalid field stays `error` with
    the pointer resting on it.
  - `Select` and `ComboBox` follow their own token sets where those differ
    from the text field's: a focused `Select` turns its chevron `primary`, a
    filled `Select`'s label turns `on-surface` on hover, and an outlined
    `ComboBox` draws a 2dp focused outline and leaves its label alone on
    hover. The outlined hover state layer of those two sets is not drawn;
    `field-styles.ts` says why.
- `TextField`'s doc comment no longer says `rows` gives a fixed text area: the
  prop was never forwarded. That, the hidden required asterisk, the literal
  prefix / suffix announcement, the single trailing slot and the absent
  separate focus indicator are recorded there as deviations from the current
  pages.

## [0.2.0] — 2026-08-27

The release that makes the kit consumable by projects other than this one.

### Added

- **`LICENSE`** — MIT, `french-tech-homies`. The kit had none.
- **`adapters/react-router.tsx`** (registry item `react-router-adapter`) — a
  React Aria `RouterProvider` for React Router, the same shape TanStack Router
  needs. Without it, `Button href` / `IconButton href` / `Chip href` / `Menu`
  item `href` / `ListItem href` did full page loads in any non-Next host.
  Note that the `RouterConfig` module augmentation that types `routerOptions`
  can exist only once per TypeScript program, so it stays in
  `adapters/next.tsx`; the React Router adapter documents the four lines a
  consumer adds to its own `.d.ts`.
- **`meta.version`** on every generated registry item, and
  `npm run -w @pipao/md3 registry:check-version` to enforce it.
- **`CHANGELOG.md`** (this file), and a README section on diffing against
  upstream and on the copy-vs-package decision.

### Changed

- **`components/field-styles.ts` now backs all five fields.** `Select` and
  `ComboBox` no longer carry their own `tv` copy of the field container. The
  module gained a `kind` variant naming the one real difference between a
  typed field and a trigger field — where the container's state comes from:
  `text` (the input peer's `:placeholder-shown`, padding on the input),
  `composite` (`data-populated` on the container, which also holds chips), and
  `trigger` (the container *is* the React Aria `Button`; `data-focus-visible`).
  All five fields use `group/tf` on the root and `group/tfc` on the container;
  `group/sel`, `group/trig`, `group/cb` and `group/cbc` are gone.
  **If you forked `field-styles.ts`, this is the merge to do.**
- **`components/Menu.tsx`** takes `type Placement` from
  `react-aria-components` instead of `react-aria`, and `react-aria` is gone
  from the kit's dependencies and from `menu.json`. Consumers stop installing
  a second React Aria package.
- **`tsconfig.json` stands alone** — no `extends` into a monorepo-only base.
  `strict` and `noUncheckedIndexedAccess` are inlined, so a copied folder
  typechecks outside this repo.
- README: the install path is corrected against a real fresh install (see
  below), `~15 components` → `~35`, and the tested `react-aria-components`
  range is `^1.20`.

### Fixed

- The *filled* `Select`'s floating label landed on the outlined variant's
  position (`top-0`) when the menu opened while the field was empty. It now
  lands on `top-2` like every other filled float.
- A disabled `Select`'s value stayed at full strength; it now dims to 38% like
  every other field, and gets `min-w-0` so `truncate` actually applies.
- `Select` and `ComboBox` pick up `TextField`'s `invalid + hover →
  on-error-container` treatment.

### Verified

- The registry was installed, for the first time, into a project outside this
  monorepo: a fresh Vite app and a fresh Next app, both built, both with this
  repo's `node_modules` renamed aside so nothing could resolve upward. Then
  again with the Editorial preset applied from the registry, on a second pair
  of apps. Summarised in `docs/wiki/concepts/design-system.md`, "The kit is a
  product, not a folder"; every install-path gotcha it turned up is in this
  package's README.
- `shadcn init @md3/base` applies the base's `config` (`style: aria-nova`,
  `iconLibrary: lucide`) and installs its `registryDependencies` — with the
  caveat that the `@md3` namespace must be declared in `package.json` first,
  because `init` is what writes `components.json`.

## Before 0.2.0

The kit was developed inside this repo and had no version. The registry has
been live at `https://www.pipao.app/r/{name}.json` since the production deploy
of 2026-08-26; every item served before this release is what
`packages/md3` looked like at that commit. In outline that period was:

- the MD3 token layer (49 colour roles, type / shape / elevation / motion
  scales) and the `tailwind-variants` styling contract;
- the Storybook catalog under `MD3/<Category>/<Component>`, with five
  Foundations pages rendered from `tokens/resolved.json`;
- the shadcn registry itself, generated from the kit by
  `scripts/build-registry.mjs`, namespace `@md3`;
- the forms slice — `TextField`, `NumberField`, `PhoneField`, `ImageField`,
  `Checkbox`, `Switch`, `Radio`, `Select`, `ChipGroup`, `ComboBox` and the
  react-hook-form adapter;
- `Snackbar` on React Aria `Toast`, `Tag`, `Avatar`, `Table`, and `href` on
  `Button` / `IconButton` / `Chip` / `Menu` items.

[unreleased]: https://github.com/french-tech-homies/design-system/commits/main
[0.3.0]: https://github.com/french-tech-homies/pipao-v2/commits/main/packages/md3
[0.2.0]: https://github.com/french-tech-homies/pipao-v2/commits/main/packages/md3
