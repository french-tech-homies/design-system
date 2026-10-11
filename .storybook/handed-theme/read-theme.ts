/* =============================================================================
   The reader: what a person hands the catalog → declarations it may draw

   A handed file is text from a person's disk. It is never inserted into the
   page: no `<style>` holds it, no adopted sheet is filled with it. It is
   parsed in a constructed `CSSStyleSheet` that is never adopted (a constructed
   sheet drops `@import`, and a sheet that styles nothing fetches nothing), and
   only custom properties under the theme's own names are read out of it, one
   by one, each value through `guardValue`. What comes out is three maps of
   name → value; `controller.ts` sets them with one `setProperty` each.

   Files are recognised by what they hold, not by their name:

     an opening `---` front matter   a DESIGN.md (or DESIGN.resolved.md)
     an `@theme inline` block        theme.v4.css
     colour roles under `:root`      theme.css

   Nothing here touches the document, storage or the network.
   ========================================================================== */

/** name → value, for one rule. */
export type Declarations = Record<string, string>;

export type HandedTheme = {
  /** What the page calls it: the DESIGN.md's `name`, or the file names. */
  name: string;
  /** The colour roles of the light scheme. */
  light: Declarations;
  /** The colour roles of the dark scheme. */
  dark: Declarations;
  /** Type, corners, elevation, state, motion and the font hooks. */
  root: Declarations;
  /** What the reader left out of the files, in the catalog's words. */
  notes: string[];
  /** The generator's own warnings, when it ran here. */
  warnings: string[];
};

export type HandedFile = { name: string; text: string };

export type ReadResult =
  | { ok: true; theme: HandedTheme }
  | { ok: false; message: string };

/** A generated pair is under 40 kB; a DESIGN.md is smaller still. */
export const MAX_FILE_BYTES = 512 * 1024;
const MAX_VALUE_LENGTH = 2000;
const MAX_NAME_LENGTH = 120;
const MAX_LIST = 60;
const MAX_LINE = 400;

const COLOR_NAME = /^--md-sys-color-[a-z0-9-]+$/;
const SCALE_NAME =
  /^--(?:md-sys-(?:typescale|shape|elevation|state|motion)|md3-duration)-[a-z0-9-]+$/;
const FONT_HOOK = /^--font-[a-z0-9-]+$/;
/** Tailwind's own namespaces in `@theme inline`: compiled into the catalog's
    utilities when it was built, so nothing a page sets later reaches them. */
const TAILWIND_NAMESPACE =
  /^--(?:color|font|text|radius|shadow|ease|font-weight)-[a-z0-9-]+$/;

/** What a value must not hold: anything that names a resource, leaves its
    declaration, or is written to get past a reader. */
const REFUSED_IN_VALUE: [RegExp, string][] = [
  [/url\s*\(/i, "names an address (`url(`)"],
  [/(?:image-set|image|src|cross-fade|element)\s*\(/i, "names a resource"],
  [/@import/i, "holds an `@import`"],
  [/\\/, "holds an escape (`\\`)"],
  [/[;{}<>]/, "holds a character that ends a declaration"],
  [/\/\*/, "holds a comment"],
];

/** `null` when the value may be drawn, else why it may not. */
export function guardValue(value: string): string | null {
  if (value.length === 0) return "is empty";
  if (value.length > MAX_VALUE_LENGTH) return "is longer than a theme value";
  for (const [pattern, why] of REFUSED_IN_VALUE) {
    if (pattern.test(value)) return why;
  }
  // A Tailwind function left in the text (`--spacing(…)`, `--theme(…)`) is
  // build-time only: a browser reads it as nothing.
  if (/--[a-z-]+\(/i.test(value)) return "uses a Tailwind build-time function";
  return null;
}

/** Tailwind's `--alpha(<colour> / <percentage>)`, as Tailwind compiles it. The
    kit's own elevation values are written with it. */
export function rewriteAlpha(value: string): string {
  let out = "";
  let at = 0;
  for (;;) {
    const start = value.indexOf("--alpha(", at);
    if (start < 0) return out + value.slice(at);
    let end = start + "--alpha(".length;
    let slash = -1;
    for (let depth = 1; end < value.length; end++) {
      const char = value[end];
      if (char === "(") depth++;
      else if (char === ")" && --depth === 0) break;
      else if (char === "/" && depth === 1) slash = end;
    }
    if (end >= value.length || slash < 0) return out + value.slice(at);
    const color = value.slice(start + "--alpha(".length, slash).trim();
    const alpha = value.slice(slash + 1, end).trim();
    out += `${value.slice(at, start)}color-mix(in oklab, ${color} ${alpha}, transparent)`;
    at = end + 1;
  }
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();
const clip = (text: string, length = MAX_LINE) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

export type FileKind = "design-md" | "scales" | "colors" | "unknown";

/** What a handed text is, by what it holds. */
export function recognise(text: string): FileKind {
  if (/^﻿?---[ \t]*\r?\n/.test(text)) return "design-md";
  const css = stripComments(text);
  if (/@theme\s+inline\s*\{/.test(css)) return "scales";
  if (/--md-sys-color-[a-z0-9-]+\s*:/.test(css)) return "colors";
  return "unknown";
}

/** Parses CSS text without it ever styling or fetching anything: the sheet is
    constructed, read and dropped. */
function parse(css: string): CSSRule[] {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  return Array.from(sheet.cssRules);
}

type Reading = { notes: string[] };

/** Reads one rule's declarations into `into`, by name. `route` says which map
    a name belongs to, `null` for a name the theme does not have. */
function readRule(
  style: CSSStyleDeclaration,
  route: (name: string) => Declarations | "silent" | null,
  reading: Reading,
  where: string,
) {
  const unknown: string[] = [];
  for (let i = 0; i < style.length; i++) {
    const name = style.item(i);
    const target = route(name);
    if (target === "silent") continue;
    if (target === null) {
      unknown.push(name);
      continue;
    }
    const value = rewriteAlpha(oneLine(style.getPropertyValue(name)));
    const refused = guardValue(value);
    if (refused) {
      reading.notes.push(`${where}: \`${name}\` ${refused}: not drawn`);
      continue;
    }
    target[name] = value;
  }
  if (unknown.length > 0) {
    const shown = unknown.slice(0, 6).map((name) => `\`${name}\``);
    reading.notes.push(
      `${where}: ${unknown.length === 1 ? "one declaration is" : `${unknown.length} declarations are`} not a theme variable (${shown.join(", ")}${unknown.length > 6 ? ", …" : ""}): not drawn`,
    );
  }
}

const isDarkQuery = (rule: CSSRule): rule is CSSMediaRule =>
  rule instanceof CSSMediaRule &&
  /^\(\s*prefers-color-scheme\s*:\s*dark\s*\)$/.test(rule.conditionText.trim());

/** theme.css: the colour roles of both schemes and the font hooks. */
function readColors(file: HandedFile, theme: HandedTheme) {
  const where = file.name;
  if (/@import/i.test(stripComments(file.text))) {
    theme.notes.push(`${where}: an \`@import\` is never followed: not read`);
  }
  const skipped = new Set<string>();
  const ambient = (scheme: Declarations) => (name: string) =>
    COLOR_NAME.test(name)
      ? scheme
      : // the ambient content colour every generated scheme block declares
        name === "color"
        ? "silent"
        : null;
  for (const rule of parse(file.text)) {
    if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
      readRule(
        rule.style,
        (name) =>
          FONT_HOOK.test(name) ? theme.root : ambient(theme.light)(name),
        theme,
        where,
      );
    } else if (rule instanceof CSSStyleRule && rule.selectorText === ".dark") {
      readRule(rule.style, ambient(theme.dark), theme, where);
    } else if (isDarkQuery(rule)) {
      for (const inner of Array.from(rule.cssRules)) {
        if (inner instanceof CSSStyleRule && inner.selectorText === ":root") {
          readRule(inner.style, ambient(theme.dark), theme, where);
        } else skipped.add(describe(inner));
      }
    } else skipped.add(describe(rule));
  }
  if (skipped.size > 0) {
    theme.notes.push(
      `${where}: only \`:root\`, \`.dark\` and the system's dark query are read. Not read: ${[...skipped].slice(0, 6).join(", ")}`,
    );
  }
}

function describe(rule: CSSRule): string {
  if (rule instanceof CSSStyleRule) return `\`${clip(rule.selectorText, 40)}\``;
  if (rule instanceof CSSFontFaceRule) return "`@font-face`";
  if (rule instanceof CSSMediaRule) return "`@media`";
  return "an at-rule";
}

/** theme.v4.css: the `--md-sys-*` scales of its `@theme inline` block. The
    file is Tailwind source, so the block is cut out by its braces and read as
    a plain rule. */
function readScales(file: HandedFile, theme: HandedTheme) {
  const css = stripComments(file.text);
  const open = /@theme\s+inline\s*\{/.exec(css);
  if (!open) return;
  const from = open.index + open[0].length;
  let end = from;
  for (let depth = 1; end < css.length; end++) {
    if (css[end] === "{") depth++;
    else if (css[end] === "}" && --depth === 0) break;
  }
  const [rule] = parse(`:root{${css.slice(from, end)}}`);
  if (!(rule instanceof CSSStyleRule)) return;
  readRule(
    rule.style,
    (name) =>
      SCALE_NAME.test(name)
        ? theme.root
        : TAILWIND_NAMESPACE.test(name)
          ? "silent"
          : null,
    theme,
    file.name,
  );
}

const WHAT_TO_HAND =
  "Hand `theme.css` and `theme.v4.css` together (both are in the folder your project generated, `theme/`), or your `DESIGN.md` alone.";

const refuse = (message: string): ReadResult => ({ ok: false, message });

/** A DESIGN.md → the two generated texts, by the kit's own generator. */
export type Generate = (designMd: string) => Promise<
  | {
      ok: true;
      name: string;
      themeCss: string;
      themeV4Css: string;
      warnings: string[];
    }
  | { ok: false; message: string }
>;

/** What a person handed → a theme the catalog may draw, or the words that say
    what to hand instead. */
export async function readHanded(
  files: HandedFile[],
  generate: Generate,
): Promise<ReadResult> {
  if (files.length === 0) return refuse(`Nothing was handed. ${WHAT_TO_HAND}`);
  const kinds = files.map((file) => ({ file, kind: recognise(file.text) }));
  const of = (kind: FileKind) => kinds.filter((entry) => entry.kind === kind);
  const [colors, moreColors] = of("colors");
  const [scales, moreScales] = of("scales");
  const [designMd, moreDesignMd] = of("design-md");
  const [unknown] = of("unknown");

  if (unknown) {
    return refuse(`\`${clip(unknown.file.name, 80)}\` is not a theme. ${WHAT_TO_HAND}`);
  }
  if (moreColors || moreScales || moreDesignMd) {
    return refuse(`More than one theme was handed. ${WHAT_TO_HAND}`);
  }

  const theme: HandedTheme = {
    name: "",
    light: {},
    dark: {},
    root: {},
    notes: [],
    warnings: [],
  };

  if (colors && scales) {
    theme.name = `${colors.file.name} + ${scales.file.name}`;
    readColors(colors.file, theme);
    readScales(scales.file, theme);
    if (designMd) {
      theme.notes.push(
        `${designMd.file.name}: set aside, the two generated files are what is drawn`,
      );
    }
  } else if (colors) {
    return refuse(
      `\`${clip(colors.file.name, 80)}\` carries the colours and the font hooks only: type, corners, elevation and motion are in \`theme.v4.css\`. Hand both files together, or your \`DESIGN.md\` alone.`,
    );
  } else if (scales) {
    return refuse(
      `\`${clip(scales.file.name, 80)}\` carries no colours: they are in \`theme.css\`, beside it. Hand both files together, or your \`DESIGN.md\` alone.`,
    );
  } else if (designMd) {
    const generated = await generate(designMd.file.text);
    if (!generated.ok) return refuse(generated.message);
    theme.name = generated.name || designMd.file.name;
    theme.warnings = generated.warnings;
    readColors({ name: "theme.css", text: generated.themeCss }, theme);
    readScales({ name: "theme.v4.css", text: generated.themeV4Css }, theme);
  }

  if (Object.keys(theme.light).length === 0) {
    return refuse(
      `No colour role was found under \`:root\`, so there is nothing to draw. ${WHAT_TO_HAND}`,
    );
  }
  if (Object.keys(theme.dark).length === 0) {
    theme.notes.push(
      "No dark scheme was found (a `.dark` rule, or `:root` in the system's dark query): dark draws the light roles",
    );
  }
  const clean = validate(theme);
  return clean ? { ok: true, theme: clean } : refuse(WHAT_TO_HAND);
}

function cleanDeclarations(
  value: unknown,
  allowed: (name: string) => boolean,
): Declarations {
  const out: Declarations = {};
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return out;
  }
  for (const [name, declared] of Object.entries(value)) {
    if (name.length > MAX_NAME_LENGTH || !allowed(name)) continue;
    if (typeof declared !== "string" || guardValue(declared) !== null) continue;
    out[name] = declared;
  }
  return out;
}

const cleanList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((line): line is string => typeof line === "string")
        .slice(0, MAX_LIST)
        .map((line) => clip(line))
    : [];

/** Anything → a theme whose every name and value passes the same rules as a
    freshly read one, or `null`. What storage gives back goes through here: a
    stored theme is no more trusted than a handed file. */
export function validate(value: unknown): HandedTheme | null {
  if (value === null || typeof value !== "object") return null;
  const stored = value as Record<string, unknown>;
  const light = cleanDeclarations(stored.light, (name) => COLOR_NAME.test(name));
  if (Object.keys(light).length === 0) return null;
  return {
    name: clip(typeof stored.name === "string" ? stored.name : "", 120),
    light,
    dark: cleanDeclarations(stored.dark, (name) => COLOR_NAME.test(name)),
    root: cleanDeclarations(
      stored.root,
      (name) => SCALE_NAME.test(name) || FONT_HOOK.test(name),
    ),
    notes: cleanList(stored.notes),
    warnings: cleanList(stored.warnings),
  };
}
