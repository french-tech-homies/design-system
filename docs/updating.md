# Versioning and updates

> Source: `french-tech-homies/design-system` · **v0.5.1**. Keep this
> marker — with the version — and it tells you exactly which release your copy
> came from. See [Which version am I on?](#which-version-am-i-on).

## Versioning and upgrades

The kit is **copy-distributed**: `shadcn add` writes files into your tree. So
the thing that is versioned is the source you copied, and the upgrade question
is "what changed, and which of my edits do I put back?". An edit of a kit file
is allowed, priced and rarely needed; the rule is
`skills/ds-build/SKILL.md`, "What a project may change", and this section
is the mechanism behind its price.

### Updating, in three commands

The three commands, the adapters and the preset named on them, a theme
regenerated and the check for a project that edited a kit file are on the front
page: [Update](../README.md#update).

This section is why it works this way: what the CLI does with a
file that differs, and what `changed.mjs` says.

**Seen on 2026-11-03**, on a fresh Vite app with the kit installed from a
local copy of the registry, then served again with `components/Tag.tsx`
changed, and `components/Button.tsx` edited in the app, with shadcn 4.19.0,
4.22.1 and 4.23.0 alike:

- `--dry-run` wrote nothing and listed all 80 files of `@ds/ds`: `= … skip
  (identical)` for 78, `~ … overwrite` for both `Tag.tsx` and `Button.tsx`,
  then `⚠ 2 files will be overwritten.` and the dependencies. A file the
  release adds reads `+ … create`.
- `--diff` with no path printed the first five files of the item (`LICENSE`,
  `utils.ts`, `icons.tsx`, two colour fields: `No changes.`) and
  `Showing 5 of 80 files. Use --diff <path> to view a specific file.`,
  neither changed file among them. Name the file: the full path the dry run
  prints, `components/Tag.tsx` or `Tag.tsx` all work.
- `--diff src/components/ui/ds/components/Button.tsx` showed the app's edit
  as a line removed, the kit's change in `Tag.tsx` as a line added: the diff
  is from your file to the release's.
- `node src/components/ui/ds/changed.mjs` named `Button.tsx` alone, exit 1.
- `--overwrite -y` updated the two files, skipped 78, and `git diff` showed
  both.

`--dry-run` and `--diff` came with shadcn 4.0.0 (2026-03-06): an update
needs that release or a later one, which `npx shadcn` fetches when your
project has none of its own.

### Which version am I on?

Two places say it:

```bash
# what the kit ships today
curl -s https://french-tech-homies.github.io/design-system/r/button.json | jq .meta
# → { "kit": "<owner>/<repository>", "version": "0.5.1", "license": "MIT" }

# what you copied: the release record the whole install brought
jq .version src/components/ui/ds/RELEASE.json
```

A copy installed before 0.3.0 has no `RELEASE.json`: nothing in it says its
version, and its first update brings the record. These pages are not copied
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
- **A line of your entry CSS that keeps `utils.ts` out of Tailwind's scan**,
  by its file and line number, and to remove it: the focus ring's classes
  are written only in `utils.ts` (`focusRing`), so with that line no kit
  control draws a focus indicator. The entry CSS is the one
  `components.json` names (`tailwind.css`); a line is named when its
  `@source not` path, from that file's folder, is `<ui>/ds/utils.ts` or a
  folder holding it, such as `<ui>/ds` itself. A glob is not read.

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
  two lines are in [What an install and an update ask of your project](installing.md#what-an-install-and-an-update-ask-of-your-project).
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

Because `fieldStyles` backs all eight fields, a field-anatomy change is *one*
merge, not eight. That is the point of the style-module layer — see
[Retheming](theming.md#retheming--the-three-layers).

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

