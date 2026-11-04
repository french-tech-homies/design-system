# Theming

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
| **style modules** | `components/<x>-styles.ts` exporting `<x>Styles`. Today three: `components/field-styles.ts` → `fieldStyles`, the field container behind `TextField`, `NumberField`, `PhoneField`, `Select`, `ComboBox` and the pickers; `components/date-picker-styles.ts` → `datePickerStyles`, the calendar behind `DatePicker` and `DateRangePicker`; `components/picker-dialog-styles.ts` → `pickerDialogStyles`, the dialog behind the date and time pickers | edit the file | replaces it, keeping the **slot and variant names**; what a slot contains may change, and your edit is put back by hand |
| **behaviour** | the React Aria wiring, `utils.ts`, `render-props.ts`, `icons.tsx` | edit a file: allowed, priced, rarely needed | replaces every file that differs and promises no name in it; keeps following the four m3.material.io pages for behaviour and accessibility, even where your look departs from them |

A `tv` becomes a style module only when more than one component renders from
it, or when its anatomy _is_ the product's identity. Everything else stays a
local `const styles = tv({…})` — an edit of it is allowed like any other, but
it is not part of the promised seam. What an update costs a themed app is in
[What a themed app pays at update time](#what-a-themed-app-pays-at-update-time) below.

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
[Your project's theme in the catalog](catalog-and-tests.md#your-projects-theme-in-the-catalog)).

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

The mechanics are in [Versioning and updates](updating.md); what they mean for a
themed app is short:

- a **token** change (a new scale or utility in `tokens/theme.v4.css`) →
  the update (`npx shadcn add @ds/ds --overwrite -y`, with each adapter or
  preset you hold named in it) from a clean tree, then regenerate your theme: the kit's file is the template yours is written
  from, and a plain re-add would stop at its prompt and write nothing. Your `DESIGN.md` and your
  generated palette are not targets of any item, so nothing of yours is at
  risk;
- an **anatomy** change to a style module you edited → the update replaces
  the file and you put your edit back from the diff, one file by hand.
  Because `fieldStyles` serves all eight fields, that is **one** merge, not
  eight — which is the whole reason the seam is one file and not thirty-five;
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
that installed the kit, where these pages are not. `skills/ds-theme/SKILL.md`
is the path through it, step by step.

**The default the kit ships** comes from the kit's own `DESIGN.md`, at the
repository's root: a neutral slate — a quiet blue-grey primary, a grey secondary and
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

