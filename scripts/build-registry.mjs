#!/usr/bin/env node
/* =============================================================================
   Generate registry.json for the MD3 kit → then `shadcn build` → r/

     npm run registry:build

   The kit is distributed as a shadcn registry under the `@ds` namespace:

     // consumer's components.json
     "registries": { "@ds": "https://french-tech-homies.github.io/design-system/r/{name}.json" }
     npx shadcn add @ds/button        # one component (+ its deps)
     npx shadcn add @ds/ds           # the whole kit

   Everything is derived from the kit's own files so the registry cannot drift from
   the source: component items point `files[].path` at the kit files
   themselves, the `tokens` item carries the theme files whole, and the
   `theme` item's cssVars are parsed from tokens/bridge-shadcn.css.

   No item writes a palette value into a project's entry CSS. The theme
   travels as files (`tokens`) the entry CSS imports, so a project that
   generated a theme of its own from its DESIGN.md imports that one instead,
   and no `add` can put the kit's default back over it. `ds`, the one install
   and every update, writes nothing at all into that file. What `theme` and
   `base` still write, asked for by name, is the shadcn bridge: references to
   the roles (`--background: var(--md-sys-color-background)`), the same under
   any theme. The bridge is also a file (`tokens/bridge-shadcn.css`), and
   importing it is how a project that installed `ds` gets it.

   Kit files import each other with relative paths, which the shadcn
   transformer leaves untouched, so every file carries an explicit `target`
   that mirrors the kit tree under the consumer's ui alias (`@ui/ds/…`).
   ========================================================================== */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";

import { RECORD, digests, landedText } from "../changed.mjs";

const KIT = ".";
const NS = "@ds";
const UI = "@ui/ds"; // resolved from the consumer's components.json aliases

const RAC = "react-aria-components";

// The kit's version, stamped into every generated item so a consumer can tell
// which release their copy came from. package.json is the only source of
// truth; `.github/workflows/checks.yml` fails if a generated item
// disagrees with it. It rides in `meta` because `version` is not a field of
// shadcn's registry-item schema, and `meta` is the schema's free-form slot —
// which is also where the licence is declared, so the terms are readable from
// any item's JSON before a single file is copied.
const PACKAGE = JSON.parse(readFileSync(`${KIT}/package.json`, "utf8"));
const VERSION = PACKAGE.version;
const stamp = { meta: { kit: "french-tech-homies/design-system", version: VERSION, license: "MIT" } };

/* ---- the licence rides with the code ---------------------------------- */

// MIT asks for the notice to travel with "all copies or substantial portions
// of the Software", and this kit is copy-distributed: `shadcn add` writes the
// source into someone else's tree, where nothing else would carry the terms.
// So the notice is a registry item, not merely a file in this repo. It is a
// `registry:file` landing beside the copied kit — `@ui/ds/LICENSE`, the same
// alias-relative target every source file uses, so the folder a consumer ends
// up with mirrors this one — and *every* item below depends on it. `add
// @ds/button` therefore delivers the licence exactly as `add @ds/ds` does;
// re-adding it is a no-op, because an identical file is skipped.
const LICENSE = "license";

const licenseItem = {
  name: LICENSE,
  type: "registry:file",
  title: "MIT licence",
  description:
    "The kit's MIT notice, landed next to the copied files at <ui>/ds/LICENSE. Every other item depends on it, so any install carries the licence with the code.",
  files: [
    {
      path: "LICENSE",
      type: "registry:file",
      target: `${UI}/LICENSE`,
    },
  ],
  ...stamp,
};

/* ---- the update check -------------------------------------------------- */

// `changed.mjs` lists the kit files a project changed since it installed
// them, read against the release record (`RELEASE.json`, written at the end
// of this script). The check is an item of its own, which `ds` depends on, so
// a copy installed before there was a record can add this one file and be
// told plainly that the check cannot speak for it. The record is carried by
// `ds` alone: only the whole install replaces it, so an `add` of one item at
// a newer release never makes it say a release the other files are not at.
const CHANGED = "changed";

const changedItem = {
  name: CHANGED,
  type: "registry:file",
  title: "Update check",
  description:
    "Lists the kit files a project changed since it installed them, before an update overwrites them: `node <ui>/ds/changed.mjs`. Reads the release record the whole install brings (<ui>/ds/RELEASE.json); writes nothing, merges nothing. Exit 0: none differs. 1: some do. 2: it cannot tell (no record: a copy installed before 0.3.0).",
  files: [
    {
      path: "changed.mjs",
      type: "registry:file",
      target: `${UI}/changed.mjs`,
    },
  ],
  registryDependencies: [`${NS}/${LICENSE}`],
  ...stamp,
};

/* ---- the theme, as files ---------------------------------------------- */

const read = (p) => readFileSync(`${KIT}/${p}`, "utf8");

// The kit's default theme and the DESIGN.md it is generated from, landed
// under `<ui>/ds/` exactly as they sit here. A project imports the two
// stylesheets from its entry CSS until it generates its own; the generator
// (`design-md` below) reads `theme.v4.css` beside itself as its template.
// The project's own DESIGN.md and theme folder are never a target: an `add`
// cannot reach them.
const TOKENS = "tokens";

const tokensItem = {
  name: TOKENS,
  type: "registry:file",
  title: "MD3 theme files",
  description:
    "The kit's default theme as files under <ui>/ds/: tokens/theme.css (the 49 Material color roles, light + dark), tokens/theme.v4.css (the Tailwind v4 @theme inline mapping: type, shape, elevation, motion, state layers), tokens/bridge-shadcn.css, the complete tokens/DESIGN.resolved.md, and the kit's neutral DESIGN.md they are generated from. Import theme.css and theme.v4.css from your entry CSS, or the ones generated from your own DESIGN.md.",
  files: [
    "tokens/theme.css",
    "tokens/theme.v4.css",
    "tokens/bridge-shadcn.css",
    "tokens/DESIGN.resolved.md",
    "DESIGN.md",
  ].map((path) => ({
    path,
    type: "registry:file",
    target: `${UI}/${path}`,
  })),
  registryDependencies: [`${NS}/${LICENSE}`],
  ...stamp,
};

/* ---- the DESIGN.md generator ------------------------------------------ */

/** `name@range`, the range read from the kit's own package.json so an install
    declares what the kit itself runs with. */
const pinned = (name) => {
  const range = PACKAGE.devDependencies?.[name] ?? PACKAGE.dependencies?.[name];
  if (!range) throw new Error(`${name} is not a dependency of the kit`);
  return `${name}@${range}`;
};

// DESIGN.md → theme. Two files beside the template they read, so the command
// is the same in a project as here: `npx tsx <ui>/ds/tokens/generate-theme.mjs
// DESIGN.md --out theme`. Dev dependencies, because a theme is generated at
// authoring time: the colour library and `yaml` are what the derivation
// imports, `tsx` runs it (the colour library's ESM has extension-less imports
// Node refuses), and `@google/design.md` is the format's linter (`designmd`).
const designMdItem = {
  name: "design-md",
  type: "registry:file",
  title: "DESIGN.md generator",
  description:
    "Turns a project's DESIGN.md into its theme and writes the complete file back: tokens/design-md.mjs (the derivation) and tokens/generate-theme.mjs (the command), under <ui>/ds/. Run with `npx tsx <ui>/ds/tokens/generate-theme.mjs DESIGN.md --out theme`; lint with `npx designmd lint DESIGN.md`.",
  devDependencies: [
    "@material/material-color-utilities",
    "yaml",
    "tsx",
    "@google/design.md",
  ].map(pinned),
  files: ["tokens/design-md.mjs", "tokens/generate-theme.mjs"].map((path) => ({
    path,
    type: "registry:file",
    target: `${UI}/${path}`,
  })),
  registryDependencies: [`${NS}/${TOKENS}`, `${NS}/${LICENSE}`],
  ...stamp,
};

/* ---- the shadcn bridge → registry:theme ------------------------------- */

/** `selector {` block body from a CSS file. */
function block(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no "${selector}" block`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unterminated "${selector}" block`);
}

/** `--name: value;` declarations → { name: value } (no leading dashes).
    Comments are stripped first: the token files explain themselves in prose
    that quotes declarations, and a match inside a comment runs on to the next
    real `;` and eats the declaration that follows it. */
function declarations(body) {
  const out = {};
  for (const m of body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/--([a-z0-9-]+):\s*([^;]+);/gis)) {
    out[m[1]] = m[2].replace(/\s+/g, " ").trim();
  }
  return out;
}

const bridge = declarations(block(read("tokens/bridge-shadcn.css"), ":root,\n.dark"));

// Bridge only. Every value is a `var(--md-sys-color-*)` reference (and the
// radius base), so it reads whichever theme the entry CSS imports and is the
// same in both schemes. Nothing here names a colour: the palette, the
// `@theme inline` mapping, the utilities, the ambient `color` and the dark
// variant line all live in the theme files.
const themeItem = {
  name: "theme",
  type: "registry:theme",
  title: "MD3 theme",
  description:
    "The kit's theme files (through `tokens`) and the shadcn variable bridge. Writes only the bridge into your CSS (--background: var(--md-sys-color-background), …), never a palette value: import <ui>/ds/tokens/theme.css and theme.v4.css, or your own generated ones, from your entry CSS.",
  dependencies: ["tw-animate-css"],
  registryDependencies: [`${NS}/${TOKENS}`, `${NS}/${LICENSE}`],
  cssVars: { light: bridge, dark: bridge },
  css: {
    '@import "tw-animate-css"': {},
  },
  ...stamp,
};

/* ---- presets ---------------------------------------------------------- */

// A preset is layer 1 (tokens) shipped as one more file: it is class-scoped
// (`.preset-editorial`), it redefines the `--md-sys-*` system tokens, and it
// carries the anatomy block that a style-module fork would otherwise provide.
// Adding it never touches the palette a project already has — the consumer
// opts in by importing the file and setting the class.
const presets = [
  {
    name: "preset-editorial",
    type: "registry:file",
    title: "Editorial preset",
    description:
      "A deliberately un-Material identity for the kit: hand-written 49-role palette, 2px corners instead of pills, a serif face, 1px hairlines instead of elevation shadows, quicker motion and stacked field labels. Import it after tokens/theme.v4.css and put `preset-editorial` on <html>.",
    files: [
      {
        path: "tokens/preset-editorial.css",
        type: "registry:file",
        target: `${UI}/tokens/preset-editorial.css`,
      },
    ],
    registryDependencies: [`${NS}/theme`, `${NS}/${LICENSE}`],
    ...stamp,
  },
];

/* ---- files → registry items ------------------------------------------ */

const file = (rel, type = "registry:ui") => ({
  path: rel,
  type,
  target: `${UI}/${rel}`,
});

const item = ({
  name,
  title,
  description,
  type = "registry:ui",
  files,
  dependencies = [],
  deps = [],
}) => ({
  name,
  type,
  title,
  description,
  ...(dependencies.length ? { dependencies } : {}),
  // The licence is appended to every item's dependencies — see licenseItem.
  registryDependencies: [...deps, LICENSE].map((d) => `${NS}/${d}`),
  files,
  ...stamp,
});

const components = [
  item({
    name: "utils",
    type: "registry:lib",
    title: "Kit utils",
    description:
      "twMergeConfig, cn, tv and focusRing bound to the MD3 scales (server-safe).",
    files: [file("utils.ts", "registry:lib")],
    dependencies: ["clsx", "tailwind-merge", "tailwind-variants"],
  }),
  item({
    name: "render-props",
    type: "registry:lib",
    title: "Render-prop helpers",
    description:
      "composeTailwindRenderProps for React Aria className render props (client-only).",
    files: [file("render-props.ts", "registry:lib")],
    dependencies: [RAC],
    deps: ["utils"],
  }),
  item({
    name: "icons",
    type: "registry:lib",
    title: "Icon contract",
    description:
      "IconComponent / IconProp types, renderIcon, and the kit's built-in SVGs.",
    files: [file("icons.tsx", "registry:lib")],
  }),
  item({
    name: "typography",
    title: "Typography",
    description:
      "Display, Headline, Title, Body and Label primitives on the MD3 type scale, across its two faces (brand for display/headline/title, plain for body/label).",
    files: [file("primitives/Typography.tsx")],
    deps: ["utils"],
  }),
  item({
    name: "state-layer",
    title: "State layer",
    description:
      "MD3 interaction state overlay (hover 8 %, focus/press 10 %, drag 16 %), whose opacities come from the theme's --md-sys-state-* tokens through the state-opacity-* utilities.",
    files: [file("primitives/StateLayer.tsx")],
    deps: ["utils"],
  }),
  item({
    name: "button",
    title: "Button",
    description: "Filled, tonal, outlined, text, elevated and FAB variants.",
    files: [file("components/Button.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "typography"],
  }),
  item({
    name: "icon-button",
    title: "Icon button",
    description:
      "Standard, filled, tonal and outlined icon buttons in Material's five sizes, optionally toggleable.",
    files: [file("components/IconButton.tsx")],
    dependencies: [RAC],
    deps: ["utils", "state-layer", "icons"],
  }),
  item({
    name: "chip",
    title: "Chip",
    description: "Assist, filter and input chips.",
    files: [file("components/Chip.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "typography"],
  }),
  item({
    name: "card",
    title: "Card",
    description: "Filled, outlined and elevated cards with CardContent.",
    files: [file("components/Card.tsx")],
    deps: ["utils", "typography"],
  }),
  item({
    name: "table",
    title: "Table",
    description:
      "Data table on React Aria Table: sortable columns, optional row selection (checkbox column added), empty state, dense rows, cells cut to one line — M2 data-table measurements on M3 roles.",
    files: [file("components/Table.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props", "checkbox", "tooltip"],
  }),
  item({
    name: "tag",
    title: "Tag",
    description:
      "Static label on a colour-role container (tonal / filled / outlined × neutral / primary / secondary / tertiary / error) — order numbers, plans, statuses. Server-safe.",
    files: [file("components/Tag.tsx")],
    deps: ["utils", "typography"],
  }),
  item({
    name: "avatar",
    title: "Avatar",
    description:
      "Round person picture with an initials fallback when the image is missing or fails, sized by `size`.",
    files: [file("components/Avatar.tsx")],
    deps: ["utils", "icons"],
  }),
  item({
    name: "list-item",
    title: "List item",
    description:
      "Material list row with leading/trailing elements (use inside GridList).",
    files: [file("components/ListItem.tsx")],
    deps: ["utils", "typography"],
  }),
  item({
    name: "grid-list",
    title: "List (GridList)",
    description:
      "React Aria GridList collection with MD3 state layers on items.",
    files: [file("components/GridList.tsx")],
    dependencies: [RAC],
    deps: ["utils", "render-props"],
  }),
  item({
    name: "menu-item",
    title: "Menu item",
    description: "Menu row with icons, supporting text and shortcut.",
    files: [file("components/MenuItem.tsx")],
    deps: ["utils", "icons", "typography"],
  }),
  item({
    name: "menu",
    title: "Menu",
    description: "Popover menu from any trigger, items as data.",
    files: [file("components/Menu.tsx")],
    dependencies: [RAC],
    deps: ["utils", "menu-item"],
  }),
  item({
    name: "dialog-content",
    title: "Dialog content",
    description:
      "Icon, headline, supporting text and actions for a dialog (server-safe).",
    files: [file("components/DialogContent.tsx")],
    deps: ["utils", "icons", "typography", "button"],
  }),
  item({
    name: "dialog",
    title: "Dialog",
    description: "React Aria Dialog wrapping DialogContent.",
    files: [file("components/Dialog.tsx")],
    dependencies: [RAC],
    deps: ["dialog-content"],
  }),
  item({
    name: "modal",
    title: "Modal",
    description: "Modal overlay with MD3 enter/exit motion.",
    files: [file("components/Modal.tsx")],
    dependencies: [RAC, "tw-animate-css"],
    deps: ["utils"],
  }),
  item({
    name: "modal-dialog",
    title: "Modal dialog",
    description: "Dialog inside a modal overlay, driven by isOpen.",
    files: [file("components/ModalDialog.tsx")],
    deps: ["dialog", "modal"],
  }),
  item({
    name: "disclosure",
    title: "Disclosure",
    description:
      "Expand/collapse on React Aria Disclosure: one section, or a DisclosureGroup (the accordion, single or allowsMultipleExpanded). MD3 publishes no page for this component — the anatomy is a 56dp list row with a state layer, outline-variant hairlines and MD3 motion, documented in the doc comment.",
    files: [file("components/Disclosure.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props"],
  }),
  item({
    name: "side-sheet",
    title: "Side sheet",
    description: "Standard (inline) or modal side sheet.",
    files: [file("components/SideSheet.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "icon-button", "typography"],
  }),
  item({
    name: "tooltip",
    title: "Tooltip",
    description: "Plain and rich tooltips.",
    files: [file("components/Tooltip.tsx")],
    dependencies: [RAC],
    deps: ["utils", "typography"],
  }),
  item({
    name: "preview-trigger",
    title: "Preview trigger",
    description:
      "A non-modal popover that opens on hover, focus and long press and may hold interactive content — React Aria PreviewTrigger on a Material container surface. MD3 has no page for it; the doc comment says so and points at the rich tooltip for the simpler case.",
    files: [file("components/PreviewTrigger.tsx")],
    dependencies: [RAC, "tw-animate-css"],
    deps: ["utils"],
  }),
  item({
    name: "tabs",
    title: "Tabs",
    description:
      "Material primary and secondary tabs on React Aria Tabs: 48dp rows (64dp with a stacked icon), the 1dp divider, a 3dp rounded indicator that hugs its label for primary and a 2dp full-width one for secondary, fixed or scrollable.",
    files: [file("components/Tabs.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props", "typography"],
  }),
  item({
    name: "snackbar",
    title: "Snackbar",
    description:
      "One-at-a-time bottom snackbar on React Aria Toast: a global queue and snackbar(text, { action, close, timeout }) helper, auto-dismiss paused on hover / focus, persistent when actionable.",
    files: [file("components/Snackbar.tsx")],
    dependencies: [RAC, "tw-animate-css"],
    deps: ["utils", "icons", "render-props"],
  }),
  item({
    name: "bottom-navigation",
    title: "Bottom navigation",
    description:
      "Material navigation bar: a <nav> of three to five destinations as React Aria links or buttons, with aria-current on the active one and a pill indicator behind its icon.",
    files: [file("components/BottomNavigation.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "state-layer", "typography"],
  }),
  item({
    name: "top-app-bar",
    title: "Top app bar",
    description:
      "Material top app bar in the spec's four baseline types (small, center-aligned, medium, large) with a leading action, a heading title, an optional subtitle and trailing actions. Server-safe. No on-scroll collapse — documented in the doc comment.",
    files: [file("components/TopAppBar.tsx")],
    deps: ["utils", "typography"],
  }),
  item({
    name: "navigation-rail",
    title: "Navigation rail",
    description:
      "The vertical destination list of a medium or expanded window, in both spec states: collapsed at 96dp with vertical items and a 56x32 pill indicator, expanded at 220dp with horizontal items in a full-width pill. A <nav> of links or buttons, not a tab set.",
    files: [file("components/NavigationRail.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "state-layer", "typography", "bottom-navigation"],
  }),
  item({
    name: "navigation-drawer",
    title: "Navigation drawer",
    description:
      "The full-height destination list, standard (inline, elevation 0) and modal (scrim, focus trap, Escape, on React Aria Modal + Dialog). 360dp with 16dp trailing corners, 56dp full-pill active indicators, optional headlines and Divider-separated sections.",
    files: [file("components/NavigationDrawer.tsx")],
    dependencies: [RAC, "tw-animate-css"],
    deps: [
      "utils",
      "icons",
      "state-layer",
      "typography",
      "divider",
      "bottom-navigation",
    ],
  }),
  item({
    name: "slider",
    title: "Slider",
    description: "Single or range slider.",
    files: [file("components/Slider.tsx")],
    dependencies: [RAC],
    deps: ["utils"],
  }),
  item({
    name: "empty-state",
    title: "Empty state",
    description: "Illustration, headline, supporting text and actions.",
    files: [file("components/EmptyState.tsx")],
    deps: ["utils", "typography"],
  }),
  item({
    name: "divider",
    title: "Divider",
    description:
      "The 1dp outline-variant line: full-width, inset (16dp leading) and middle-inset, horizontal or vertical, decorative by default. Server-safe.",
    files: [file("components/Divider.tsx")],
    deps: ["utils"],
  }),
  item({
    name: "progress-indicator",
    title: "Progress indicator",
    description:
      "Linear and circular progress indicators, each determinate or indeterminate, on React Aria ProgressBar — primary active indicator, secondary-container track, a 4dp gap, and a stop indicator on the determinate linear bar. Carries its own keyframe; no animation library.",
    files: [file("components/ProgressIndicator.tsx")],
    dependencies: [RAC],
    deps: ["utils", "render-props"],
  }),
  item({
    name: "color-area",
    title: "Color area",
    description: "React Aria ColorArea styled for MD3.",
    files: [file("components/color/ColorArea.tsx")],
    dependencies: [RAC],
  }),
  item({
    name: "color-field",
    title: "Color field",
    description: "Hex input for a color value.",
    files: [file("components/color/ColorField.tsx")],
    dependencies: [RAC],
  }),
  item({
    name: "color-slider",
    title: "Color slider",
    description: "Single-channel color slider.",
    files: [file("components/color/ColorSlider.tsx")],
    dependencies: [RAC],
  }),
  item({
    name: "color-swatch",
    title: "Color swatch",
    description: "Color preview swatch.",
    files: [file("components/color/ColorSwatch.tsx")],
    dependencies: [RAC],
  }),
  item({
    name: "color-picker",
    title: "Color picker",
    description: "Swatch trigger opening area, hue slider and hex field.",
    files: [file("components/color/ColorPicker.tsx")],
    dependencies: [RAC],
    deps: ["color-area", "color-field", "color-slider", "color-swatch"],
  }),
  item({
    name: "field-styles",
    type: "registry:lib",
    title: "Field styles",
    description:
      "The MD3 field container as tailwind-variants slots (filled / outlined, floating label, icons, supporting text) with a kind variant for typed, composite and trigger fields — the one style module behind TextField, NumberField, PhoneField, Select and ComboBox.",
    files: [file("components/field-styles.ts", "registry:lib")],
    deps: ["utils"],
  }),
  item({
    name: "text-field",
    title: "Text field",
    description:
      "Filled and outlined text fields with floating label, icons, supporting text, error and character counter.",
    files: [file("components/TextField.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props", "field-styles"],
  }),
  item({
    name: "number-field",
    title: "Number field",
    description:
      "Locale-aware number field: Intl.NumberFormat formatting, min / max / step, arrow-key and wheel stepping, optional trailing − / + steppers.",
    files: [file("components/NumberField.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props", "field-styles"],
  }),
  item({
    name: "phone-field",
    title: "Phone field",
    description:
      "Phone number field: E.164 value, as-you-type international formatting and a flag + calling-code country picker in the leading slot (react-phone-number-input on the text-field container).",
    files: [file("components/PhoneField.tsx")],
    dependencies: [RAC, "react-phone-number-input"],
    deps: ["utils", "icons", "render-props", "field-styles", "menu-item"],
  }),
  item({
    name: "image-field",
    title: "Image field",
    description:
      'Image upload: drop zone + tonal "Choose image" (React Aria DropZone + FileTrigger), preview with remove icon button and replace, size / type rejection. Value is a data URL.',
    files: [file("components/ImageField.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "button", "icon-button", "card"],
  }),
  item({
    name: "checkbox",
    title: "Checkbox",
    description:
      "Checkbox and CheckboxGroup with indeterminate, error and disabled states.",
    files: [file("components/Checkbox.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props"],
  }),
  item({
    name: "switch",
    title: "Switch",
    description: "MD3 switch with growing handle and optional icons.",
    files: [file("components/Switch.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props"],
  }),
  item({
    name: "radio",
    title: "Radio",
    description:
      "Radio and RadioGroup with label, supporting text, error and orientation.",
    files: [file("components/Radio.tsx")],
    dependencies: [RAC],
    deps: ["utils", "render-props"],
  }),
  item({
    name: "select",
    title: "Select",
    description:
      "Exposed dropdown menu: text-field-shaped trigger with floating label opening a menu of options.",
    files: [file("components/Select.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props", "field-styles", "menu-item"],
  }),
  item({
    name: "combo-box",
    title: "Combo box",
    description:
      'Autocomplete text field with a menu; selectionMode="multiple" renders the selection as input chips inline with the caret.',
    files: [file("components/ComboBox.tsx")],
    dependencies: [RAC],
    deps: ["utils", "icons", "render-props", "field-styles", "select"],
  }),
  item({
    name: "react-hook-form-adapter",
    type: "registry:lib",
    title: "react-hook-form adapter",
    description:
      "FormTextField, FormNumberField, FormPhoneField, FormImageField, FormCheckbox, FormCheckboxGroup, FormSwitch, FormRadioGroup, FormSelect, FormChipGroup and FormComboBox: kit controls bound through Controller. Skip if not on react-hook-form.",
    files: [file("adapters/react-hook-form.tsx", "registry:lib")],
    dependencies: ["react-hook-form", RAC],
    deps: [
      "text-field",
      "number-field",
      "phone-field",
      "image-field",
      "checkbox",
      "switch",
      "radio",
      "select",
      "chip",
      "combo-box",
    ],
  }),
  item({
    name: "next-adapter",
    type: "registry:lib",
    title: "Next.js adapter",
    description:
      "Router provider for React Aria links and a next/image renderer for Card media. Skip if not on Next.js.",
    files: [file("adapters/next.tsx", "registry:lib")],
    dependencies: ["next", RAC],
    deps: ["card"],
  }),
  item({
    name: "react-router-adapter",
    type: "registry:lib",
    title: "React Router adapter",
    description:
      "Router provider for React Aria links (Button / Chip / Menu / ListItem href) on React Router; the same shape adapts to TanStack Router. Skip if not on React Router.",
    files: [file("adapters/react-router.tsx", "registry:lib")],
    dependencies: ["react-router", RAC],
  }),
];

/* ---- skills ----------------------------------------------------------- */

// Claude Code skills, landed in the project's own `.claude/skills/`: in a
// shadcn target `~/` is the project root (the CLI joins it to its cwd), never
// the person's home. They are project skills, so the agent opened in the
// project finds them and they are versioned with it. Every file of the
// skill's folder travels, so a skill can point at a file beside it.
const skill = ({ name, folder, title, description, deps }) => ({
  name,
  type: "registry:file",
  title,
  description,
  files: readdirSync(`${KIT}/skills/${folder}`)
    .sort()
    .map((f) => ({
      path: `skills/${folder}/${f}`,
      type: "registry:file",
      target: `~/.claude/skills/${folder}/${f}`,
    })),
  registryDependencies: [...deps, LICENSE].map((d) => `${NS}/${d}`),
  ...stamp,
});

const skills = [
  skill({
    name: "spec-skill",
    folder: "ds-spec",
    title: "ds-spec skill",
    description:
      "Claude Code skill + script that reads Material 3 specs, Do/Don't guidelines, accessibility and component tokens straight from m3.material.io (no browser, cached per site version).",
    deps: [],
  }),
  skill({
    name: "theme-skill",
    folder: "ds-theme",
    title: "ds-theme skill",
    description:
      "Claude Code skill: give the project a look of its own. Write its DESIGN.md from a brief, generate the theme with the kit's generator, read the warnings, wire the entry CSS, and take a kit update without losing the theme. Carries the DESIGN.md contract the kit reads.",
    deps: ["design-md"],
  }),
  skill({
    name: "build-skill",
    folder: "ds-build",
    title: "ds-build skill",
    description:
      "Claude Code skill: build screens with the kit. Role utilities and their pairing, the type primitives, state layers, the resolved DESIGN.md as the reference for values, and what a project may change: an edit of a kit file is allowed, priced and rarely needed.",
    deps: [TOKENS],
  }),
];

// The one install: the components, the theme files, the DESIGN.md
// generator, the three skills, the update check and the release record the
// check reads. It is also what every update asks for, so it carries no
// `cssVars` and no `css`: the CLI writes those into the project's entry CSS
// each time the item is added (seen on two installs of 0.3.0: the bridge a
// second time, 19 self-referential lines in the project's `@theme`). The
// bridge is `tokens/bridge-shadcn.css`, which a project with stock shadcn
// components imports. `scripts/check-install.mjs` refuses either field here.
// It stays a `registry:style`, the type the CLI was seen to print `docs` for.
const everything = {
  ...item({
    name: "ds",
    type: "registry:style",
    title: "MD3 kit (everything)",
    description:
      "The one install: every component and primitive with the kit's barrel index, the theme files and the kit's DESIGN.md, the DESIGN.md generator, the ds-theme, ds-build and ds-spec skills for Claude Code, and the update check with the record of this release. Writes nothing into your CSS: the theme, and the shadcn bridge, are files your entry CSS imports.",
    files: [file("index.ts", "registry:lib"), file(RECORD, "registry:file")],
    deps: [
      ...components
        .filter(
          (c) =>
            ![
              "next-adapter",
              "react-router-adapter",
              "react-hook-form-adapter",
            ].includes(c.name),
        )
        .map((c) => c.name),
      TOKENS,
      designMdItem.name,
      ...skills.map((s) => s.name),
      CHANGED,
    ],
  }),
  dependencies: themeItem.dependencies,
  // Printed by the CLI after the install, a first one or an update: which
  // release it took, and the one thing left to do by hand.
  docs: [
    `MD3 kit ${VERSION}, under <ui>/ds/ (the release is recorded in <ui>/ds/RELEASE.json). This install wrote nothing into your entry CSS.`,
    "",
    "A first install: import the theme from your entry CSS, with every @import above any other at-rule. The path is from that file to your ui folder: ./components/ui/ds/ from src/index.css to src/components/ui, ../app/_components/ui/ds/ from src/styles/globals.css to src/app/_components/ui.",
    "",
    '  @import "tailwindcss";',
    '  @import "./components/ui/ds/tokens/theme.css";',
    '  @import "./components/ui/ds/tokens/theme.v4.css";',
    '  @import "tw-animate-css";',
    "",
    "An update, or a theme of your own already imported (theme/theme.css, theme/theme.v4.css): keep your lines as they are.",
    "",
    "Stock shadcn components in the project read the Material roles through one more import, written after theme.css:",
    "",
    '  @import "./components/ui/ds/tokens/bridge-shadcn.css";',
    "",
    "For a look of your own, open your agent and ask for one: the ds-theme skill (.claude/skills/ds-theme) writes your DESIGN.md, generates your theme into theme/ and imports that instead.",
  ].join("\n"),
  ...stamp,
};

const base = {
  name: "base",
  type: "registry:base",
  title: "MD3 base",
  description:
    "Initialise a project on the MD3 kit: React Aria (aria-nova) stock components, lucide icons, the kit's theme files, the shadcn bridge and utils.",
  // "aria-nova" is what `shadcn init -b aria` picks by default; the style only
  // decides which stock components `shadcn add button` fetches.
  config: { style: "aria-nova", iconLibrary: "lucide" },
  registryDependencies: [`${NS}/theme`, `${NS}/utils`, `${NS}/${LICENSE}`],
  cssVars: themeItem.cssVars,
  css: themeItem.css,
  ...stamp,
};

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "ds",
  homepage: "https://french-tech-homies.github.io/design-system/r",
  items: [
    base,
    themeItem,
    tokensItem,
    designMdItem,
    licenseItem,
    changedItem,
    ...presets,
    ...components,
    everything,
    ...skills,
  ],
};

/* ---- the release record ----------------------------------------------- */

// What `changed.mjs` reads in a project: this version, and the digests of
// every file every item carries (of both its forms where it has two), keyed by where it lands (under the kit's
// folder, or under the project's root). Built here, where every file and its
// target is known, with the function the check itself uses. It does not
// record itself.
const record = { version: VERSION, kit: {}, project: {} };
for (const { path, target } of registry.items.flatMap((i) => i.files ?? [])) {
  if (path === RECORD) continue;
  const [group, landed] = target.startsWith(`${UI}/`)
    ? ["kit", target.slice(UI.length + 1)]
    : target.startsWith("~/")
      ? ["project", target.slice(2)]
      : [];
  if (!group) throw new Error(`${path}: a target the record cannot place, ${target}`);
  // A source that opens with a comment has two forms in a project: the kit's
  // own, and the one the CLI lands, from the first token on. Both are kept,
  // so the check compares a project's text as it stands and hides no edit.
  const text = read(path);
  const second = landedText(text, landed);
  record[group][landed] =
    second === null ? digests(text) : { ...digests(text), landed: digests(second) };
}
for (const group of ["kit", "project"]) {
  record[group] = Object.fromEntries(
    Object.entries(record[group]).sort(([a], [b]) => (a < b ? -1 : 1)),
  );
}
writeFileSync(RECORD, JSON.stringify(record, null, 2) + "\n");

writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n");
console.log(
  `registry.json: ${registry.items.length} items @ v${VERSION} — ${Object.keys(bridge).length} bridge variables, ${tokensItem.files.length} theme files, ${skills.length} skills`,
);
