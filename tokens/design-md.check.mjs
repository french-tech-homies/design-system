/* =============================================================================
   Rule checks for the DESIGN.md → theme derivation (tokens/design-md.mjs).

     npm run theme:check              # node's test runner, through tsx

   A Node check, so it sits with the token tooling and not in the kit's
   browser Vitest config, where every story is a test.
   ========================================================================== */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import postcss from "postcss";

import {
  CONTRAST_PAIRS,
  CONTRAST_THRESHOLD,
  CORNER_DEFAULTS,
  DesignMdError,
  REFERENCE_DEFAULTS,
  ROLES,
  TYPE_DEFAULTS,
  applyThemeV4,
  deriveTheme,
  generateTheme,
  hslColor,
  renderThemeCss,
} from "./design-md.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const kitV4 = readFileSync(join(here, "theme.v4.css"), "utf8");

/** A DESIGN.md from front-matter lines. */
const designMd = (...front) =>
  `---\nname: Fixture\n${front.join("\n")}\n---\n\n## Overview\n\nA fixture.\n`;

const SEED = 'colors:\n  seed: "#6750A4"';
const seedOnly = designMd("scheme: light", SEED);

/** `seedOnly` with a `## Reference CSS` section holding these `css` fences. */
const withBlocks = (...blocks) =>
  `${seedOnly}\n## Reference CSS\n\n${blocks
    .map((css) => `\`\`\`css\n${css}\n\`\`\`\n`)
    .join("\n")}`;

/** `seedOnly` with a reference block whose `:root` rule holds these lines. */
const withRoot = (...lines) => withBlocks(`:root {\n${lines.join("\n")}\n}`);

const kinds = (warnings) => warnings.map(({ kind, token }) => [kind, token]);

/** `--md-sys-color-<role>` under a selector of a rendered theme.css. */
function cssRole(css, selector, role) {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("\n}", start));
  return new RegExp(`--md-sys-color-${role}: ([^;]+);`).exec(block)?.[1];
}

const hsl = (hex) => hslColor(parseInt(hex.slice(1), 16));

test("a written role wins in the written scheme, and the other scheme stays derived", () => {
  const derived = renderThemeCss(deriveTheme(seedOnly));
  const written = renderThemeCss(
    deriveTheme(designMd("scheme: light", SEED, '  primary: "#ff0000"')),
  );
  assert.equal(cssRole(written, ":root", "primary"), hsl("#ff0000"));
  assert.notEqual(cssRole(derived, ":root", "primary"), hsl("#ff0000"));
  assert.equal(
    cssRole(written, ".dark", "primary"),
    cssRole(derived, ".dark", "primary"),
  );
});

test("a key replaces one palette in both schemes and leaves the others alone", () => {
  const base = deriveTheme(seedOnly).colors;
  const keyed = deriveTheme(
    designMd("scheme: light", SEED, '  secondary-key: "#3d6c3d"'),
  ).colors;
  for (const scheme of ["light", "dark"]) {
    // `on-secondary` is white in light whatever the palette's hue.
    for (const role of [
      "secondary",
      "secondary-container",
      "secondary-fixed",
    ]) {
      assert.notEqual(keyed[scheme][role], base[scheme][role], role);
    }
    for (const role of Object.keys(ROLES)) {
      if (role.includes("secondary")) continue;
      assert.equal(keyed[scheme][role], base[scheme][role], role);
    }
  }
});

test("primary-key replaces the primary palette in both schemes, and survives a round trip", () => {
  const base = deriveTheme(seedOnly).colors;
  const front = designMd("scheme: light", SEED, '  primary-key: "#64748b"');
  const keyed = deriveTheme(front).colors;
  // The seed is a purple (hue 257), the key a slate (hue 216).
  const hue = (value) => Number(/^hsl\((\d+) /.exec(hslColor(value))[1]);
  for (const scheme of ["light", "dark"]) {
    assert.ok(hue(base[scheme].primary) > 250, scheme);
    assert.ok(hue(keyed[scheme].primary) < 225, scheme);
    for (const role of Object.keys(ROLES)) {
      // `on-primary` is white in light whatever the palette's hue.
      if (role === "on-primary" && scheme === "light") continue;
      if (role.includes("primary") || role === "surface-tint") {
        assert.notEqual(keyed[scheme][role], base[scheme][role], role);
      } else {
        assert.equal(keyed[scheme][role], base[scheme][role], role);
      }
    }
  }
  const { resolvedDesignMd, warnings } = generateTheme(front, kitV4);
  assert.deepEqual(warnings, []);
  assert.match(resolvedDesignMd, /^  primary-key: "#64748b"$/m);
});

test("a written fixed role applies to both schemes", () => {
  const css = renderThemeCss(
    deriveTheme(designMd("scheme: light", SEED, '  primary-fixed: "#00ff00"')),
  );
  assert.equal(cssRole(css, ":root", "primary-fixed"), hsl("#00ff00"));
  assert.equal(cssRole(css, ".dark", "primary-fixed"), hsl("#00ff00"));
});

test("scheme: dark puts written roles under .dark and derives :root", () => {
  const derived = renderThemeCss(deriveTheme(seedOnly));
  const css = renderThemeCss(
    deriveTheme(designMd("scheme: dark", SEED, '  primary: "#ff0000"')),
  );
  assert.equal(cssRole(css, ".dark", "primary"), hsl("#ff0000"));
  assert.equal(
    cssRole(css, ":root", "primary"),
    cssRole(derived, ":root", "primary"),
  );
});

test("each scheme block declares its colour scheme and the scroll bars' roles", () => {
  const block = (css, opening) => {
    const start = css.indexOf(opening);
    assert.notEqual(start, -1, opening);
    return css.slice(start, css.indexOf("\n}", start));
  };
  const bars = "scrollbar-color: var(--md-sys-color-outline) transparent;";
  // Whichever scheme the file writes, `:root` is light and `.dark` is dark.
  for (const scheme of ["light", "dark"]) {
    const css = renderThemeCss(deriveTheme(designMd(`scheme: ${scheme}`, SEED)));
    const light = block(css, ":root {");
    const dark = block(css, ".dark {");
    assert.match(light, /^  color-scheme: light;$/m);
    assert.match(dark, /^  color-scheme: dark;$/m);
    assert.ok(light.includes(bars) && dark.includes(bars));
    assert.equal(css.match(/color-scheme: /g).length, 2);
  }
  // Dark by the system's setting: the declarations are in the query's block.
  const system = renderThemeCss(
    deriveTheme(withRoot("  --md3-dark-mode: system;")),
  );
  const query = block(system, "@media (prefers-color-scheme: dark) {\n  :root {");
  assert.match(query, /^    color-scheme: dark;$/m);
  assert.ok(query.includes(bars));
});

test("refusals name the token", () => {
  const refuses = (text, pattern) =>
    assert.throws(
      () => generateTheme(text, kitV4),
      (error) => error instanceof DesignMdError && pattern.test(error.message),
    );
  // Neither a seed nor a primary to read one from.
  refuses(
    designMd("scheme: light", 'colors:\n  secondary: "#ff0000"'),
    /colors\.seed/,
  );
  refuses(designMd("scheme: light"), /colors\.seed/);
  refuses(
    designMd("scheme: light", "colors:\n  seed: hsl(236 30% 42%)"),
    /colors\.seed/,
  );
  refuses(
    designMd("scheme: light", SEED, "  on-primary: white"),
    /colors\.on-primary/,
  );
  refuses(
    designMd("scheme: light", SEED, '  tertiary-key: "#12345"'),
    /colors\.tertiary-key/,
  );
  // Neither a scheme nor a ground to read one from.
  refuses(designMd(SEED), /`scheme`/);
  refuses(designMd(SEED, '  primary: "#ff0000"'), /`scheme`/);
  // A scheme that is written is never read from the ground instead.
  refuses(designMd("scheme: auto", SEED), /scheme is "auto"/);
  refuses(
    designMd("scheme: auto", SEED, '  background: "#ffffff"'),
    /scheme is "auto"/,
  );
  refuses(
    withRoot("  --md-sys-state-hover-state-layer-opacity: 0.08;"),
    /--md-sys-state-hover-state-layer-opacity is "0\.08"/,
  );
  refuses(
    withRoot("  --md3-duration-short-4: 0.2s;"),
    /--md3-duration-short-4 is "0\.2s"/,
  );
  refuses(withRoot("  --md3-dark-mode: media;"), /--md3-dark-mode is "media"/);
  refuses("## Overview\n\nNo front matter.\n", /front matter/);
});

/* ---- a file in the format's own words ---------------------------------- */

/* The format has no `scheme` and no `seed`: a file its own tools write names
   neither, and writes its sizes short (`title-md`, `rounded.sm`). */
const LIGHT_WORDS = 'colors:\n  primary: "#3050A0"\n  background: "#FBF8F2"';
const DARK_WORDS = 'colors:\n  primary: "#a8c0ff"\n  surface: "#14161a"';
const assumed = (warnings) =>
  warnings.filter(({ kind }) => kind === "assumed");

test("no scheme: it is read from the ground, and said", () => {
  const light = generateTheme(designMd(LIGHT_WORDS), kitV4);
  assert.equal(light.theme.colors.scheme, "light");
  assert.equal(cssRole(light.themeCss, ":root", "background"), hsl("#fbf8f2"));
  const [scheme] = assumed(light.warnings);
  assert.equal(scheme.token, "scheme");
  assert.match(scheme.message, /colors\.background/);
  assert.match(scheme.message, /`scheme: light`/);

  // With no background, the surface is the ground.
  const dark = generateTheme(designMd(DARK_WORDS), kitV4);
  assert.equal(dark.theme.colors.scheme, "dark");
  assert.equal(cssRole(dark.themeCss, ".dark", "surface"), hsl("#14161a"));
  assert.notEqual(cssRole(dark.themeCss, ":root", "surface"), hsl("#14161a"));
  assert.match(assumed(dark.warnings)[0].message, /colors\.surface/);
  assert.match(assumed(dark.warnings)[0].message, /`scheme: dark`/);

  // The background is read before the surface.
  const both = generateTheme(
    designMd(LIGHT_WORDS, '  surface: "#14161a"'),
    kitV4,
  );
  assert.equal(both.theme.colors.scheme, "light");
});

test("no seed: it is read from the primary, and said", () => {
  const read = generateTheme(designMd(LIGHT_WORDS), kitV4);
  const [, seed] = assumed(read.warnings);
  assert.equal(seed.token, "colors.seed");
  assert.match(seed.message, /colors\.primary/);
  assert.deepEqual(kinds(read.warnings), [
    ["assumed", "scheme"],
    ["assumed", "colors.seed"],
  ]);

  // What is assumed is what the file would have written.
  const said = generateTheme(
    designMd("scheme: light", LIGHT_WORDS, '  seed: "#3050a0"'),
    kitV4,
  );
  assert.deepEqual(said.warnings, []);
  assert.equal(read.themeCss, said.themeCss);
  assert.equal(read.themeV4Css, said.themeV4Css);

  // A written seed is never replaced by the primary.
  const own = generateTheme(
    designMd("scheme: light", SEED, '  primary: "#3050a0"'),
    kitV4,
  );
  assert.deepEqual(own.warnings, []);
  assert.notEqual(own.themeCss, said.themeCss);
});

test("the format's short names are read as Material's: the type sizes and the corners", () => {
  const short = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  title-md:\n    fontSize: 19px\n  label-sm:\n    fontWeight: 700\n  headline-lg:\n    lineHeight: 44px",
      "rounded:\n  xs: 1px\n  sm: 2px\n  md: 3px\n  lg: 5px\n  xl: 7px",
    ),
    kitV4,
  );
  const long = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  title-medium:\n    fontSize: 19px\n  label-small:\n    fontWeight: 700\n  headline-large:\n    lineHeight: 44px",
      "rounded:\n  extra-small: 1px\n  small: 2px\n  medium: 3px\n  large: 5px\n  extra-large: 7px",
    ),
    kitV4,
  );
  assert.deepEqual(short.warnings, []);
  assert.equal(short.themeV4Css, long.themeV4Css);
  assert.equal(short.themeCss, long.themeCss);
  assert.equal(
    valueOf(short.themeV4Css, "--md-sys-typescale-title-medium-size"),
    "19px",
  );
  assert.equal(valueOf(short.themeV4Css, "--md-sys-shape-corner-small"), "2px");
  // The resolved file says them in Material's words, once.
  assert.equal(short.resolvedDesignMd, long.resolvedDesignMd);
  assert.doesNotMatch(short.resolvedDesignMd, /title-md|^  sm:/m);
});

test("Material's name wins over the short one, which is listed; a name outside the table is ignored", () => {
  const both = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  title-md:\n    fontSize: 19px\n  title-medium:\n    fontSize: 21px\n  headline-display:\n    fontSize: 80px\n  body-xl:\n    fontSize: 20px",
      "rounded:\n  sm: 2px\n  small: 6px\n  xxl: 40px",
    ),
    kitV4,
  );
  assert.equal(
    valueOf(both.themeV4Css, "--md-sys-typescale-title-medium-size"),
    "21px",
  );
  assert.equal(valueOf(both.themeV4Css, "--md-sys-shape-corner-small"), "6px");
  assert.deepEqual(kinds(both.warnings), [
    ["unapplied", "typography.title-md"],
    ["ignored", "typography.headline-display"],
    ["ignored", "typography.body-xl"],
    ["unapplied", "rounded.sm"],
    ["ignored", "rounded.xxl"],
  ]);
  // A refusal names the token as the file wrote it.
  refusal(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  body-md:\n    fontSize: big",
    ),
    "typography.body-md.fontSize",
    "a length",
  );
});

test("round trip: what was assumed and the short names survive the resolved DESIGN.md", () => {
  const words =
    "typography:\n  title-md:\n    fontSize: 19px\n    fontFeature: tnum\n  headline-display:\n    fontSize: 80px\nrounded:\n  sm: 2px\n  bubble-ish: 3px";
  for (const text of [
    designMd(LIGHT_WORDS, words),
    designMd(DARK_WORDS, words),
    designMd(DARK_WORDS, '  background: "#101114"'),
    designMd("scheme: light", SEED, words, "  small: 6px"),
  ]) {
    const first = generateTheme(text, kitV4);
    const again = generateTheme(first.resolvedDesignMd, kitV4);
    assert.equal(again.themeCss, first.themeCss);
    assert.equal(again.themeV4Css, first.themeV4Css);
    assert.deepEqual(again.warnings, first.warnings);
    assert.equal(again.resolvedDesignMd, first.resolvedDesignMd);
  }
  // Nothing the file did not say is written into its front matter.
  const { resolvedDesignMd } = generateTheme(designMd(LIGHT_WORDS, words), kitV4);
  const front = resolvedDesignMd.slice(0, resolvedDesignMd.indexOf("\n---\n"));
  assert.doesNotMatch(front, /^scheme:|^  seed:/m);
  assert.match(resolvedDesignMd, /\*\*assumed\*\* — /);
});

test("the command exits non-zero on a refusal and writes nothing", () => {
  const dir = mkdtempSync(join(tmpdir(), "design-md-"));
  const source = join(dir, "DESIGN.md");
  const out = mkdtempSync(join(tmpdir(), "design-md-out-"));
  const run = () =>
    spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        join(here, "generate-theme.mjs"),
        source,
        "--out",
        out,
      ],
      { encoding: "utf8" },
    );

  writeFileSync(source, designMd("scheme: light", "colors:\n  seed: indigo"));
  const refused = run();
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /colors\.seed/);
  assert.deepEqual(readdirSync(out), []);

  writeFileSync(source, seedOnly);
  const written = run();
  assert.equal(written.status, 0, written.stderr);
  assert.deepEqual(readdirSync(out).sort(), [
    "DESIGN.resolved.md",
    "theme.css",
    "theme.v4.css",
  ]);
});

test("the command creates the --out folder a project names, when it is missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "design-md-"));
  const source = join(dir, "DESIGN.md");
  const out = join(dir, "theme", "generated");
  writeFileSync(source, seedOnly);
  const written = spawnSync(
    process.execPath,
    ["--import", "tsx", join(here, "generate-theme.mjs"), source, "--out", out],
    { encoding: "utf8" },
  );
  assert.equal(written.status, 0, written.stderr);
  assert.deepEqual(readdirSync(out).sort(), [
    "DESIGN.resolved.md",
    "theme.css",
    "theme.v4.css",
  ]);
});

test("unknown names are ignored and listed", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const extra = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      '  brand-pink: "#ff66aa"',
      "typography:\n  h1:\n    fontSize: 3rem",
      "rounded:\n  pill: 4px",
    ),
    kitV4,
  );
  assert.equal(extra.themeCss, plain.themeCss);
  assert.equal(extra.themeV4Css, plain.themeV4Css);
  assert.deepEqual(plain.warnings, []);
  assert.deepEqual(
    extra.warnings.map(({ kind, token }) => [kind, token]),
    [
      ["ignored", "colors.brand-pink"],
      ["ignored", "typography.h1"],
      ["ignored", "rounded.pill"],
    ],
  );
});

test("a file with only a seed gets every role, Material's type scale and corners", () => {
  const { theme, themeCss } = generateTheme(seedOnly, kitV4);
  for (const selector of [":root", ".dark"]) {
    for (const role of Object.keys(ROLES)) {
      assert.match(
        cssRole(themeCss, selector, role) ?? "",
        /^hsl\(\d+ \d+% \d+%\)$/,
        role,
      );
    }
  }
  assert.equal(Object.keys(ROLES).length, 49);
  assert.deepEqual(theme.typography, TYPE_DEFAULTS);
  assert.equal(Object.keys(theme.typography).length, 15);
  assert.deepEqual(theme.rounded, CORNER_DEFAULTS);
  assert.equal(Object.keys(theme.rounded).length, 6);
});

test("written type and corner values reach their theme.v4.css declarations", () => {
  const { themeV4Css } = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  body-large:\n    fontSize: 1.125rem\n    lineHeight: 28px\n    letterSpacing: 0.02em\n  title-small:\n    fontWeight: 600",
      "rounded:\n  small: 6px",
    ),
    kitV4,
  );
  for (const declaration of [
    "--md-sys-typescale-body-large-size: 1.125rem;",
    "--md-sys-typescale-body-large-line-height: 28px;",
    "--md-sys-typescale-body-large-tracking: 0.02em;",
    "--md-sys-typescale-title-small-weight: 600;",
    "--md-sys-shape-corner-small: 6px;",
    "--md-sys-shape-corner-medium: 12px;",
  ]) {
    assert.ok(themeV4Css.includes(`  ${declaration}\n`), declaration);
  }
});

test("a weight on any type role reaches the theme: every role has a weight variable", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const heavy = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  display-large:\n    fontWeight: 700\n  body-medium:\n    fontWeight: 500\n  title-large:\n    fontWeight: 600",
    ),
    kitV4,
  );
  assert.deepEqual(heavy.warnings, []);
  for (const [role, weight] of [
    ["display-large", 700],
    ["body-medium", 500],
    ["title-large", 600],
  ]) {
    assert.ok(
      heavy.themeV4Css.includes(`  --md-sys-typescale-${role}-weight: ${weight};\n`),
      role,
    );
  }
  // With none written, each of the fifteen is Material's: 500 for the
  // labels and the two smaller titles, 400 for the ten others, title-large
  // among them. And each `text-<role>` utility reads its own.
  const roles = ["display", "headline", "title", "body", "label"].flatMap((r) =>
    ["large", "medium", "small"].map((size) => `${r}-${size}`),
  );
  for (const role of roles) {
    const medium = /^label-|^title-(medium|small)$/.test(role);
    assert.ok(
      plain.themeV4Css.includes(`  --md-sys-typescale-${role}-weight: ${medium ? 500 : 400};\n`),
      role,
    );
    assert.ok(
      plain.themeV4Css.includes(
        `  --text-${role}--font-weight: var(--md-sys-typescale-${role}-weight);\n`,
      ),
      role,
    );
  }
});

test("a font family becomes the host's hook, on the face that carries it", () => {
  const headline = ["large", "medium", "small"]
    .flatMap((size) =>
      ["display", "headline", "title"].map((group) => `${group}-${size}`),
    )
    .map((role) => `  ${role}:\n    fontFamily: Space Grotesk, Georgia, serif`)
    .join("\n");
  const { themeCss, themeV4Css, warnings } = generateTheme(
    designMd("scheme: light", SEED, `typography:\n${headline}`),
    kitV4,
  );
  assert.deepEqual(warnings, []);
  assert.ok(
    themeCss.includes(
      '  --font-space-grotesk: "Space Grotesk", Georgia, serif;\n',
    ),
  );
  assert.ok(
    themeCss.includes(
      '  --font-roboto: "Roboto", ui-sans-serif, system-ui, sans-serif;\n',
    ),
  );
  assert.ok(
    themeV4Css.includes(
      "  --md-sys-typescale-brand-font: var(--font-space-grotesk);\n",
    ),
  );
  assert.ok(
    themeV4Css.includes(
      "  --md-sys-typescale-plain-font: var(--font-roboto);\n",
    ),
  );
});

test("setting by name refuses a declaration that appears twice", () => {
  const twice = kitV4.replace(
    "  --md-sys-shape-corner-small: 8px;\n",
    "  --md-sys-shape-corner-small: 8px;\n  --md-sys-shape-corner-small: 6px;\n",
  );
  assert.notEqual(twice, kitV4);
  assert.throws(
    () => applyThemeV4(twice, deriveTheme(seedOnly)),
    (error) =>
      error instanceof DesignMdError &&
      /--md-sys-shape-corner-small is declared 2 times/.test(error.message),
  );
});

test("setting by name refuses an elevation that appears twice", () => {
  const first = kitV4.slice(
    kitV4.indexOf("  --md-sys-elevation-1:"),
    kitV4.indexOf("  --md-sys-elevation-2:"),
  );
  assert.equal(first.split("\n").length, 4);
  assert.throws(
    () =>
      applyThemeV4(kitV4.replace(first, first + first), deriveTheme(seedOnly)),
    (error) =>
      error instanceof DesignMdError &&
      /--md-sys-elevation-1 is declared 2 times/.test(error.message),
  );
});

/* ---- slice 1's documented rules --------------------------------------- */

/* ---- a family per role ------------------------------------------------- */

const ROLE_NAMES = Object.keys(TYPE_DEFAULTS);
const roleFont = (css, role) =>
  valueOf(css, `--md-sys-typescale-${role}-font`);
const families = (...pairs) =>
  `typography:\n${pairs
    .map(([role, family]) => `  ${role}:\n    fontFamily: ${family}`)
    .join("\n")}`;

test("a role takes the family written on it, and a role with none keeps its face's", () => {
  const labels = ["label-large", "label-medium", "label-small"];
  const mixed = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      families(
        ["body-large", "Inter"],
        ...labels.map((role) => [role, "Space Grotesk, Georgia, serif"]),
      ),
    ),
    kitV4,
  );
  assert.deepEqual(mixed.warnings, []);
  // The faces, as before: read from display-large and body-large.
  assert.equal(
    valueOf(mixed.themeV4Css, "--md-sys-typescale-brand-font"),
    "var(--font-roboto)",
  );
  assert.equal(
    valueOf(mixed.themeV4Css, "--md-sys-typescale-plain-font"),
    "var(--font-inter)",
  );
  for (const role of ROLE_NAMES) {
    assert.equal(
      roleFont(mixed.themeV4Css, role),
      labels.includes(role) ? "var(--font-space-grotesk)" : "initial",
      role,
    );
  }
  // Three roles, one family: one hook, declared once.
  assert.equal(
    valueOf(mixed.themeCss, "--font-space-grotesk"),
    '"Space Grotesk", Georgia, serif',
  );

  // Taken out of the file, it leaves the theme: the role is its face's again.
  const plain = generateTheme(
    designMd("scheme: light", SEED, families(["body-large", "Inter"])),
    mixed.themeV4Css,
  );
  for (const role of ROLE_NAMES) {
    assert.equal(roleFont(plain.themeV4Css, role), "initial", role);
  }
  assert.doesNotMatch(plain.themeCss, /--font-space-grotesk/);
});

test("one family per face generates no family of a role's own, and no warning", () => {
  const kit = generateTheme(project, kitV4);
  const twoFaces = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      families(
        ...ROLE_NAMES.map((role) => [
          role,
          /^(display|headline|title)/.test(role) ? "Fraunces" : "Inter",
        ]),
      ),
    ),
    kitV4,
  );
  // A family on the two roles that name the faces says the same.
  const twoRoles = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      families(["display-large", "Fraunces"], ["body-large", "Inter"]),
    ),
    kitV4,
  );
  for (const { themeV4Css, warnings } of [kit, twoFaces, twoRoles]) {
    assert.deepEqual(warnings, []);
    for (const role of ROLE_NAMES) {
      assert.equal(roleFont(themeV4Css, role), "initial", role);
    }
  }
  assert.equal(twoRoles.themeCss, twoFaces.themeCss);
  assert.equal(twoRoles.themeV4Css, twoFaces.themeV4Css);
  assert.equal(twoRoles.resolvedDesignMd, twoFaces.resolvedDesignMd);
});

test("a hook carries one stack: the first stands, and another's fallbacks are listed", () => {
  const { themeCss, themeV4Css, warnings } = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      families(
        ["body-large", "Inter"],
        ["body-small", "Inter, Verdana, sans-serif"],
        ["title-small", "Space Grotesk, Georgia, serif"],
        ["label-small", "Space Grotesk, monospace"],
      ),
    ),
    kitV4,
  );
  assert.deepEqual(kinds(warnings), [
    ["unapplied", "typography.body-small.fontFamily"],
    ["unapplied", "typography.label-small.fontFamily"],
  ]);
  assert.equal(
    valueOf(themeCss, "--font-inter"),
    '"Inter", ui-sans-serif, system-ui, sans-serif',
  );
  assert.equal(
    valueOf(themeCss, "--font-space-grotesk"),
    '"Space Grotesk", Georgia, serif',
  );
  // The family is applied all the same: its face's, or its own hook.
  assert.equal(roleFont(themeV4Css, "body-small"), "initial");
  assert.equal(roleFont(themeV4Css, "label-small"), "var(--font-space-grotesk)");
});

test("the resolved file shows the family applied on every role, and reads back the same", () => {
  for (const text of [
    designMd(
      "scheme: light",
      SEED,
      families(
        ["display-large", "Fraunces"],
        ["body-large", "Inter"],
        ["title-md", "Inter"],
        ["label-small", "Space Grotesk, monospace"],
        ["label-large", "Space Grotesk"],
        ["mono", "JetBrains Mono"],
      ),
    ),
    designMd("scheme: light", SEED, families(["headline-small", "Fraunces"])),
  ]) {
    const first = generateTheme(text, kitV4);
    const again = generateTheme(first.resolvedDesignMd, kitV4);
    assert.equal(again.themeCss, first.themeCss);
    assert.equal(again.themeV4Css, first.themeV4Css);
    assert.deepEqual(again.warnings, first.warnings);
    assert.equal(again.resolvedDesignMd, first.resolvedDesignMd);
  }
  const { theme } = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      families(
        ["display-large", "Fraunces"],
        ["title-md", "Inter"],
        ["label-large", "Space Grotesk"],
      ),
    ),
    kitV4,
  );
  const applied = (role) => theme.typography[role].fontFamily;
  assert.equal(applied("headline-small"), "Fraunces");
  assert.equal(applied("title-medium"), "Inter");
  assert.equal(applied("body-small"), "Roboto");
  assert.equal(applied("label-large"), "Space Grotesk");
});

test("a family whose hook would be a role's utility is refused", () => {
  refusal(
    designMd("scheme: light", SEED, families(["label-large", "Label Large"])),
    "typography.label-large.fontFamily",
    "a family whose font hook is not `--font-label-large`",
  );
  // Named as the file wrote the role.
  refusal(
    designMd("scheme: light", SEED, families(["title-md", "Body Small"])),
    "typography.title-md.fontFamily",
    "a family whose font hook is not `--font-body-small`",
  );
});

test("a tracking the kit has no variable for is not applied, and is listed", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const tracked = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  headline-large:\n    letterSpacing: 0.5px",
    ),
    kitV4,
  );
  assert.equal(tracked.themeV4Css, plain.themeV4Css);
  assert.deepEqual(kinds(tracked.warnings), [
    ["unapplied", "typography.headline-large.letterSpacing"],
  ]);
});

const fontFeature = designMd(
  "scheme: light",
  SEED,
  'typography:\n  body-large:\n    fontFeature: "ss01"',
);

test("a property outside the five on a known type role is not applied, is listed, and stays in the resolved file", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const featured = generateTheme(fontFeature, kitV4);
  assert.equal(featured.themeV4Css, plain.themeV4Css);
  assert.deepEqual(kinds(featured.warnings), [
    ["unapplied", "typography.body-large.fontFeature"],
  ]);
  assert.match(featured.resolvedDesignMd, /^    fontFeature: ss01$/m);
  assert.deepEqual(
    generateTheme(featured.resolvedDesignMd, kitV4).warnings,
    featured.warnings,
  );
});

test("a top-level key outside the format is ignored and listed", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const misspelt = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typographie:\n  body-large:\n    fontSize: 20px",
    ),
    kitV4,
  );
  assert.deepEqual(kinds(misspelt.warnings), [["ignored", "typographie"]]);
  assert.equal(misspelt.themeV4Css, plain.themeV4Css);

  const format = generateTheme(
    designMd(
      "version: alpha",
      "description: A fixture.",
      "scheme: light",
      SEED,
      "spacing:\n  sm: 8px",
      "components:\n  button:\n    rounded: 8px",
    ),
    kitV4,
  );
  assert.deepEqual(format.warnings, []);
});

/* ---- the body's reference block --------------------------------------- */

test("the reference block's values reach their theme.v4.css declarations", () => {
  const { theme, themeV4Css, warnings } = generateTheme(
    withRoot(
      "  /* quieter than Material: --md3-duration-long-4: 1ms; */",
      "  --md-sys-state-hover-state-layer-opacity: 4%;",
      "  --md3-duration-short-4: 120ms;",
      "  --md-sys-motion-easing-standard:   cubic-bezier(0.4, 0, 0.2, 1);",
      "  --md-sys-elevation-1:",
      "    0 0 0 1px var(--md-sys-color-outline-variant),",
      "    0 1px 2px 0 rgb(0 0 0 / 10%);",
      "  --md-sys-elevation-2: none;",
    ),
    kitV4,
  );
  assert.deepEqual(warnings, []);
  for (const declaration of [
    "  --md-sys-state-hover-state-layer-opacity: 4%;",
    "  --md3-duration-short-4: 120ms;",
    "  --md3-duration-long-4: 600ms;",
    "  --md-sys-motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);",
    "  --md-sys-elevation-1:\n    0 0 0 1px var(--md-sys-color-outline-variant),\n    0 1px 2px 0 rgb(0 0 0 / 10%);",
    "  --md-sys-elevation-2: none;",
    "  --shadow-elevation-1: var(--md-sys-elevation-1);",
  ]) {
    assert.ok(themeV4Css.includes(`${declaration}\n`), declaration);
  }
  assert.deepEqual(theme.reference.written, [
    "--md-sys-state-hover-state-layer-opacity",
    "--md3-duration-short-4",
    "--md-sys-motion-easing-standard",
    "--md-sys-elevation-1",
    "--md-sys-elevation-2",
  ]);
});

test("a value the block leaves out is the kit's own, not what the theme file held", () => {
  const stale = kitV4
    .replace("--md3-duration-long-4: 600ms;", "--md3-duration-long-4: 999ms;")
    .replace(
      "--md-sys-state-hover-state-layer-opacity: 8%;",
      "--md-sys-state-hover-state-layer-opacity: 99%;",
    );
  assert.equal(stale.match(/999ms|99%/g).length, 2);
  for (const text of [
    seedOnly,
    withRoot("  --md3-duration-short-1: 40ms;"),
    withBlocks(".card { --md3-duration-long-4: 1ms; }"),
  ]) {
    const { css } = applyThemeV4(stale, deriveTheme(text));
    assert.ok(css.includes("  --md3-duration-long-4: 600ms;\n"));
    assert.ok(
      css.includes("  --md-sys-state-hover-state-layer-opacity: 8%;\n"),
    );
  }
});

test("a file with no reference block gets the kit's 27 values, and they are the committed ones", () => {
  const { theme, themeV4Css, warnings } = generateTheme(seedOnly, kitV4);
  assert.deepEqual(warnings, []);
  assert.deepEqual(theme.reference.values, REFERENCE_DEFAULTS);
  assert.deepEqual(theme.reference.written, []);
  assert.equal(Object.keys(REFERENCE_DEFAULTS).length, 27);
  // Type and corners aside, the kit's theme.v4.css is written with the defaults.
  assert.equal(applyThemeV4(kitV4, deriveTheme(project)).css, kitV4);
  // The dark choice is read, never declared in the theme.
  assert.doesNotMatch(themeV4Css, /^\s*--md3-dark-mode:/m);
});

test("a variable the kit does not know is ignored and listed", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const extra = generateTheme(
    withRoot(
      "  --shadow: 0 1px 2px rgb(0 0 0 / 20%);",
      "  --md-sys-color-primary: #f00;",
    ),
    kitV4,
  );
  assert.deepEqual(kinds(extra.warnings), [
    ["ignored", "--shadow"],
    ["ignored", "--md-sys-color-primary"],
  ]);
  assert.equal(extra.themeV4Css, plain.themeV4Css);
  assert.equal(extra.themeCss, plain.themeCss);
});

test("only the first css block under the heading is read, and a second is listed", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const short = "--md3-duration-short-1: 1ms;";

  const second = generateTheme(
    withBlocks(
      `:root {\n  --md3-duration-short-2: 2ms;\n}`,
      `:root {\n  ${short}\n}`,
    ),
    kitV4,
  );
  assert.deepEqual(kinds(second.warnings), [["ignored", "Reference CSS"]]);
  assert.ok(second.themeV4Css.includes("  --md3-duration-short-2: 2ms;\n"));
  assert.ok(second.themeV4Css.includes("  --md3-duration-short-1: 50ms;\n"));

  // Not read, and not listed: a block under another heading, another rule in
  // the block, a `:root` that is not at the top level, and prose.
  const elsewhere = generateTheme(
    `${seedOnly}\n## Motion\n\nFast: \`${short}\`\n\n\`\`\`css\n:root {\n  ${short}\n}\n\`\`\`\n\n## Reference CSS\n\nIn prose: ${short}\n\n\`\`\`css\n:root {\n}\n.button {\n  ${short}\n}\n@media (min-width: 600px) {\n  :root {\n    ${short}\n  }\n}\n\`\`\`\n`,
    kitV4,
  );
  assert.deepEqual(elsewhere.warnings, []);
  assert.equal(elsewhere.themeV4Css, plain.themeV4Css);
});

test("a heading with no :root rule the kit can read is listed, not taken as the project's choice", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const system = "--md3-dark-mode: system;\n  --md3-duration-short-1: 1ms;";
  const under = (text) => `${seedOnly}\n## Reference CSS\n\n${text}\n`;
  for (const text of [
    // A fence with no `css` info string.
    under(`\`\`\`\n:root {\n  ${system}\n}\n\`\`\``),
    // Rules that are not exactly `:root`.
    withBlocks(`:root, :host {\n  ${system}\n}`),
    withBlocks(`html {\n  ${system}\n}`),
    withBlocks(`@media screen {\n  :root {\n    ${system}\n  }\n}`),
    // No block at all.
    `${under("Nothing yet.")}\n## Notes\n\nLast.\n`,
  ]) {
    const first = generateTheme(text, kitV4);
    assert.deepEqual(kinds(first.warnings), [["ignored", "Reference CSS"]]);
    assert.match(first.warnings[0].message, /no top-level `:root` rule/);
    assert.equal(first.themeCss, plain.themeCss);
    assert.equal(first.themeV4Css, plain.themeV4Css);

    // The resolved file says once what the theme was written with, outside
    // the section it did not read, and says that section is not in the theme.
    const resolved = first.resolvedDesignMd;
    assert.equal(count(resolved, "## Reference CSS\n"), 1);
    assert.equal(count(resolved, "## Resolved reference CSS\n"), 1);
    assert.equal(count(resolved, "--md3-dark-mode: class;"), 1);
    assert.ok(
      resolved.indexOf("--md3-dark-mode: class;") >
        resolved.indexOf("## Resolved reference CSS\n"),
    );
    assert.match(resolved, /nothing written there is in the theme/);
    assert.match(
      resolved,
      /## Generator warnings\n[\s\S]*no top-level `:root`/,
    );

    const again = generateTheme(resolved, kitV4);
    assert.deepEqual(again.warnings, first.warnings);
    assert.equal(again.themeCss, first.themeCss);
    assert.equal(again.resolvedDesignMd, resolved);
  }
  // An empty rule is a rule: every value is the kit's own, by choice.
  assert.deepEqual(generateTheme(withBlocks(":root {}"), kitV4).warnings, []);
});

/* ---- how dark is switched --------------------------------------------- */

test("--md3-dark-mode: system puts the dark scheme under prefers-color-scheme, with no .dark", () => {
  const byClass = generateTheme(seedOnly, kitV4);
  const system = generateTheme(withRoot("  --md3-dark-mode: system;"), kitV4);
  assert.deepEqual(system.warnings, []);
  assert.equal(system.themeV4Css, byClass.themeV4Css);
  assert.equal(system.themeCss.includes(".dark {"), false);

  const media = "@media (prefers-color-scheme: dark) {\n  :root {\n";
  const start = system.themeCss.indexOf(media);
  assert.ok(start > 0);
  const dark = system.themeCss.slice(
    start,
    system.themeCss.indexOf("\n  }\n}\n", start),
  );
  for (const role of Object.keys(ROLES)) {
    assert.equal(
      new RegExp(`^    --md-sys-color-${role}: ([^;]+);$`, "m").exec(dark)?.[1],
      cssRole(byClass.themeCss, ".dark", role),
      role,
    );
    assert.equal(
      cssRole(system.themeCss, ":root", role),
      cssRole(byClass.themeCss, ":root", role),
      role,
    );
  }
  assert.match(system.resolvedDesignMd, /^ {2}--md3-dark-mode: system;$/m);
  assert.match(system.resolvedDesignMd, /prefers-color-scheme: dark/);
});

test("no choice, and --md3-dark-mode: class, both key dark on the .dark class", () => {
  const none = generateTheme(seedOnly, kitV4);
  const byClass = generateTheme(withRoot("  --md3-dark-mode: class;"), kitV4);
  assert.equal(byClass.themeCss, none.themeCss);
  assert.ok(none.themeCss.includes("\n.dark {\n"));
  assert.equal(none.themeCss.includes("prefers-color-scheme"), false);
});

/* ---- contrast --------------------------------------------------------- */

test("a written pair with poor contrast is listed, and the theme is still written", () => {
  const yellow = '  primary: "#ffee00"';
  for (const [text, scheme, selector] of [
    [
      designMd("scheme: light", SEED, yellow, '  on-primary: "#ffffff"'),
      "light",
      ":root",
    ],
    // One side written: the derived `on-primary` of a light scheme is white.
    [designMd("scheme: light", SEED, yellow), "light", ":root"],
    [designMd("scheme: dark", SEED, '  primary: "#221100"'), "dark", ".dark"],
  ]) {
    const { themeCss, warnings } = generateTheme(text, kitV4);
    assert.deepEqual(kinds(warnings), [
      ["contrast", "colors.on-primary on colors.primary"],
    ]);
    assert.match(warnings[0].message, new RegExp(`in the ${scheme} scheme`));
    assert.match(warnings[0].message, /\d\.\d\d:1.*under 4\.5:1/);
    const written = /primary: "(#\w+)"/.exec(text)[1];
    assert.equal(cssRole(themeCss, selector, "primary"), hsl(written));
  }
});

test("the contrast threshold is 4.5:1: a pair between 3:1 and 4.5:1 is listed, one just above is not", () => {
  // Under the derived white `on-primary` of a light scheme.
  const ratioOf = (hex) => {
    const { warnings } = generateTheme(
      designMd("scheme: light", SEED, `  primary: "${hex}"`),
      kitV4,
    );
    return warnings.map(({ kind, message }) => [
      kind,
      Number(/ is ([\d.]+):1 /.exec(message)[1]),
    ]);
  };
  assert.equal(CONTRAST_THRESHOLD, 4.5);
  assert.deepEqual(ratioOf("#ff0000"), [["contrast", 4]]);
  assert.deepEqual(ratioOf("#f20000"), [["contrast", 4.4]]);
  // Just above: about 4.6:1.
  assert.deepEqual(ratioOf("#ec0000"), []);
});

test("a written pair with enough contrast, and every derived pair, lists nothing", () => {
  assert.deepEqual(
    generateTheme(
      designMd("scheme: light", SEED, '  primary: "#21005d"'),
      kitV4,
    ).warnings,
    [],
  );
  // The other scheme is derived: a poor pair there is not the file's.
  assert.deepEqual(
    generateTheme(designMd("scheme: dark", SEED, '  primary: "#d0bcff"'), kitV4)
      .warnings,
    [],
  );
  assert.equal(CONTRAST_PAIRS.length, 40);
  for (const [text, background] of CONTRAST_PAIRS) {
    assert.ok(text in ROLES && background in ROLES, `${text} on ${background}`);
  }
});

/* ---- the resolved file ------------------------------------------------ */

const count = (text, part) => text.split(part).length - 1;

test("the resolved file carries the complete reference block and how dark is switched", () => {
  const rule = (text) =>
    /```css\n[\s\S]*?^(:root \{\n[\s\S]*?\n\})/m.exec(text)[1];
  const lines = (values, ...more) => [
    ":root {",
    "  --md3-dark-mode: class;",
    ...Object.entries(values).map(([name, value]) =>
      name.includes("elevation") && value.includes("),")
        ? `  ${name}:\n    ${value.replace("), ", "),\n    ")};`
        : `  ${name}: ${value};`,
    ),
    ...more,
    "}",
  ];

  const none = generateTheme(seedOnly, kitV4).resolvedDesignMd;
  assert.equal(count(none, "## Reference CSS\n"), 1);
  assert.equal(rule(none), lines(REFERENCE_DEFAULTS).join("\n"));
  assert.equal(none.includes("## Generator warnings"), false);

  const partial = generateTheme(
    withBlocks(
      `/* kept */\n.card { color: red; }\n\n:root {\n  --md3-duration-short-1: 40ms; /* lost */\n  --shadow: none;\n}\n\n.chip { color: blue; }`,
    ),
    kitV4,
  ).resolvedDesignMd;
  assert.equal(count(partial, "## Reference CSS\n"), 1);
  assert.equal(
    rule(partial),
    lines(
      { ...REFERENCE_DEFAULTS, "--md3-duration-short-1": "40ms" },
      "  --shadow: none;",
    ).join("\n"),
  );
  for (const kept of ["/* kept */", ".card { color: red; }", ".chip {"]) {
    assert.ok(partial.includes(kept), kept);
  }
  assert.match(
    partial,
    /## Generator warnings\n[\s\S]*- \*\*ignored\*\* — Reference CSS: --shadow /,
  );

  // A heading the kit read nothing under keeps its section as written; the
  // complete rule goes in the kit's own section.
  const unread = generateTheme(
    withBlocks(".card { color: red; }"),
    kitV4,
  ).resolvedDesignMd;
  assert.equal(count(unread, "```css\n"), 2);
  assert.equal(rule(unread), lines(REFERENCE_DEFAULTS).join("\n"));
});

test("warnings from theme.v4.css are in the resolved file's list too", () => {
  // A tracking where Material's baseline has none: the one type value the
  // template still has no variable for.
  const { resolvedDesignMd, warnings } = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  headline-large:\n    letterSpacing: 0.5px",
    ),
    kitV4,
  );
  assert.equal(warnings.length, 1);
  assert.ok(
    resolvedDesignMd.endsWith(`- **unapplied** — ${warnings[0].message}\n`),
  );
});

/* ---- the kit's own file ------------------------------------------------ */

// The kit's DESIGN.md: the source of the default theme it ships. A project's
// own file is checked beside the theme it generates, not here.
const project = readFileSync(join(here, "../DESIGN.md"), "utf8");

test("the kit's DESIGN.md generates the committed theme, with nothing left unapplied", () => {
  const generated = generateTheme(project, kitV4);
  assert.deepEqual(generated.warnings, []);
  assert.equal(
    generated.themeCss,
    readFileSync(join(here, "theme.css"), "utf8"),
  );
  assert.equal(generated.themeV4Css, kitV4);
  assert.equal(
    generated.resolvedDesignMd,
    readFileSync(join(here, "DESIGN.resolved.md"), "utf8"),
  );
  assert.ok(
    generated.themeCss.includes(
      '  --font-inter: "Inter", ui-sans-serif, system-ui, sans-serif;\n',
    ),
  );
  for (const face of ["brand", "plain"]) {
    assert.ok(
      generated.themeV4Css.includes(
        `  --md-sys-typescale-${face}-font: var(--font-inter);\n`,
      ),
    );
  }
});

test("round trip: the resolved DESIGN.md generates the same theme", () => {
  for (const text of [
    project,
    seedOnly,
    designMd("scheme: dark", SEED, '  primary: "#ff0000"'),
    designMd("scheme: light", SEED, '  primary: "#ffee00"'),
    fontFeature,
    withRoot(
      "  --md3-dark-mode: system;",
      "  --md3-duration-short-1: 40ms;",
      "  --md-sys-elevation-1: 0 0 0 1px red, 0 1px 2px blue;",
      "  --shadow: none;",
      "  &:hover { --shadow: 0 0 1px; }",
      "  --ease: ease",
    ),
    withBlocks(":root {\n  --md3-duration-short-2: 2ms;\n}", ":root {}"),
    withBlocks(".card { color: red; }"),
  ]) {
    const first = generateTheme(text, kitV4);
    const again = generateTheme(first.resolvedDesignMd, kitV4);
    assert.equal(again.themeCss, first.themeCss);
    assert.equal(again.themeV4Css, first.themeV4Css);
    assert.deepEqual(again.warnings, first.warnings);
    // The sections the kit generates are replaced, not stacked.
    assert.equal(again.resolvedDesignMd, first.resolvedDesignMd);
    assert.equal(count(again.resolvedDesignMd, "## Resolved schemes\n"), 1);
  }
});

/* ---- one value where one was meant ------------------------------------ */

/** A rendered CSS text as a parser sees it: every at-rule, every rule and
    every declaration, by name. Throws on a text that does not parse. */
function shape(css) {
  const found = { atRules: [], rules: [], declarations: [] };
  postcss.parse(css).walk((node) => {
    if (node.type === "atrule") found.atRules.push(node.name);
    if (node.type === "rule") found.rules.push(node.selector);
    // A font hook is named after its family.
    if (node.type === "decl") {
      found.declarations.push(node.prop.replace(/^--font-.*/, "--font-*"));
    }
  });
  return found;
}

/** Nothing but values differs between two rendered texts. */
const sameShape = (css, plain) => assert.deepEqual(shape(css), shape(plain));

const yaml = (value) =>
  typeof value === "string" ? JSON.stringify(value) : String(value);

/** A DESIGN.md whose brand face is this family (as YAML source). */
const brandFamily = (source) =>
  designMd(
    "scheme: light",
    SEED,
    `typography:\n  display-large:\n    fontFamily: ${source}`,
  );
const plainFamily = (source) =>
  designMd(
    "scheme: light",
    SEED,
    `typography:\n  body-large:\n    fontFamily: ${source}`,
  );

/** The value of one declaration of a rendered text. */
function valueOf(css, name) {
  const values = [];
  postcss.parse(css).walkDecls(name, (node) => values.push(node.value));
  assert.equal(values.length, 1, name);
  return values[0];
}

const refusal = (text, token, kind) =>
  assert.throws(
    () => generateTheme(text, kitV4),
    (error) =>
      error instanceof DesignMdError &&
      error.message.includes(`DESIGN.md: ${token} is `) &&
      error.message.includes(`the kit reads ${kind}`),
    `${token}: ${text}`,
  );

/** What a value may carry to leave its declaration. */
const BREAKOUTS = ["; x: y", " } body { color: red", " url(x)"];

test("a family that closes its string is one string in one declaration", () => {
  const plain = generateTheme(brandFamily("Fixture"), kitV4);
  for (const family of [
    'Fixture"; } @import url("x"); :root { background: url("y"); --a: "',
    "Fixture\\",
    'Fixture\\"; } body { background: url(x) } :root { --a: "',
  ]) {
    const { themeCss, themeV4Css } = generateTheme(
      brandFamily(yaml(family)),
      kitV4,
    );
    sameShape(themeCss, plain.themeCss);
    sameShape(themeV4Css, plain.themeV4Css);
    const hook = /^ {2}(--font-fixture[a-z0-9-]*): /m.exec(themeCss)[1];
    // One string, then the stack behind it.
    assert.match(
      valueOf(themeCss, hook),
      /^"(?:[^"\\\n]|\\.)*", ui-sans-serif, system-ui, sans-serif$/,
      family,
    );
  }
});

test("a family cannot close the comment that names it", () => {
  const plain = generateTheme(brandFamily("Fixture"), kitV4);
  const { themeCss } = generateTheme(
    brandFamily(yaml("X */ :root { --x: y } @import url(x); /*")),
    kitV4,
  );
  sameShape(themeCss, plain.themeCss);
});

test("a fallback that is not a run of names is one string", () => {
  const plain = generateTheme(brandFamily("Fixture"), kitV4);
  for (const [fallback, written] of [
    ["} body { color: red", '"} body { color: red"'],
    ["x; y: z", '"x; y: z"'],
    ["url(x)", '"url(x)"'],
    ['a" b', '"a\\" b"'],
    ["O'Reilly Sans", `"O'Reilly Sans"`],
    ["Source Sans 3", '"Source Sans 3"'],
  ]) {
    const { themeCss } = generateTheme(
      brandFamily(yaml(`Fixture, ${fallback}, serif`)),
      kitV4,
    );
    sameShape(themeCss, plain.themeCss);
    assert.equal(
      valueOf(themeCss, "--font-fixture"),
      `"Fixture", ${written}, serif`,
    );
  }
});

test("a family that cannot be a name is refused, by the role it was read from", () => {
  const kind = "a family name";
  refusal(
    brandFamily(yaml("Fix\nture")),
    "typography.display-large.fontFamily",
    kind,
  );
  refusal(
    plainFamily(yaml("Fixture\t")),
    "typography.body-large.fontFamily",
    kind,
  );
  refusal(
    brandFamily("Inter,, serif"),
    "typography.display-large.fontFamily",
    kind,
  );
  refusal(brandFamily("[a, b]"), "typography.display-large.fontFamily", kind);
  refusal(plainFamily("12"), "typography.body-large.fontFamily", kind);
  refusal(plainFamily(yaml("…")), "typography.body-large.fontFamily", kind);
  // A real name the hook cannot be named after is told so.
  refusal(
    brandFamily(yaml("明朝, serif")),
    "typography.display-large.fontFamily",
    "a family name whose first name holds a Latin letter or a digit",
  );
});

test("a family with a space, a digit, an accent or an apostrophe still generates", () => {
  for (const [source, written] of [
    ["Space Grotesk", '--font-space-grotesk: "Space Grotesk", ui-sans-serif'],
    ["Source Sans 3", '--font-source-sans-3: "Source Sans 3", ui-sans-serif'],
    ["Señor Sans", '--font-se-or-sans: "Señor Sans", ui-sans-serif'],
    ["O'Reilly Sans", `--font-o-reilly-sans: "O'Reilly Sans", ui-sans-serif`],
    [
      '"IBM Plex Sans", Georgia, serif',
      '--font-ibm-plex-sans: "IBM Plex Sans", Georgia, serif;',
    ],
    [
      "Fixture, Segoe UI, system-ui, -apple-system, 明朝",
      '--font-fixture: "Fixture", Segoe UI, system-ui, -apple-system, 明朝;',
    ],
  ]) {
    const { themeCss } = generateTheme(brandFamily(yaml(source)), kitV4);
    assert.ok(themeCss.includes(`  ${written}`), source);
    postcss.parse(themeCss);
  }
});

const TYPE_KINDS = {
  fontSize: ["a length", ["1.125rem", "28px", "120%"]],
  lineHeight: ["a length or a number", ["28px", "1.5", 1.5]],
  letterSpacing: ["a length", ["0.02em", "-0.02em", "0", 0, "+1px"]],
  fontWeight: ["a weight", [600, "600", "normal", "bold", 1, 1000]],
};

test("a type value is one value of its kind, or the file is refused", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const typed = (property, value) =>
    designMd(
      "scheme: light",
      SEED,
      `typography:\n  body-large:\n    ${property}: ${yaml(value)}`,
    );
  for (const [property, [kind, accepted]] of Object.entries(TYPE_KINDS)) {
    const token = `typography.body-large.${property}`;
    for (const value of accepted) {
      const { themeV4Css } = generateTheme(typed(property, value), kitV4);
      sameShape(themeV4Css, plain.themeV4Css);
    }
    for (const value of [
      ...BREAKOUTS.map((tail) => `${accepted[0]}${tail}`),
      "url(x)",
      "calc(1px)",
      "var(--x)",
      "",
      "-",
    ]) {
      refusal(typed(property, value), token, kind);
    }
    refusal(
      typed(property, "[1px, 2px]").replace('"[', "[").replace(']"', "]"),
      token,
      kind,
    );
  }
  refusal(typed("fontSize", 16), "typography.body-large.fontSize", "a length");
  refusal(
    typed("fontSize", "-1px"),
    "typography.body-large.fontSize",
    "a length",
  );
  refusal(
    typed("lineHeight", "-1"),
    "typography.body-large.lineHeight",
    "a length or a number",
  );
  refusal(
    typed("letterSpacing", "0.5"),
    "typography.body-large.letterSpacing",
    "a length",
  );
  refusal(
    typed("fontWeight", 0),
    "typography.body-large.fontWeight",
    "a weight",
  );
  refusal(
    typed("fontWeight", 1001),
    "typography.body-large.fontWeight",
    "a weight",
  );
  refusal(
    typed("fontWeight", "bolder"),
    "typography.body-large.fontWeight",
    "a weight",
  );
});

test("a corner is one length, or the file is refused", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const corner = (value) =>
    designMd("scheme: light", SEED, `rounded:\n  medium: ${yaml(value)}`);
  for (const value of ["6px", "0", 0, "9999px", "0.5rem", "50%"]) {
    sameShape(generateTheme(corner(value), kitV4).themeV4Css, plain.themeV4Css);
  }
  for (const value of [
    ...BREAKOUTS.map((tail) => `6px${tail}`),
    "url(x)",
    "calc(1px)",
    "-1px",
    6,
    "",
  ]) {
    refusal(corner(value), "rounded.medium", "a length");
  }
});

test("an easing is one easing function, or the file is refused", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const name = "--md-sys-motion-easing-standard";
  for (const value of [
    "cubic-bezier(0.4, 0, 0.2, 1)",
    "cubic-bezier(.4,0,.2,-1.5)",
    "ease-out",
    "linear",
    "step-end",
    "steps(4, jump-end)",
    "steps(4)",
    "linear(0, 0.25 25%, 1)",
  ]) {
    const { themeV4Css } = generateTheme(
      withRoot(`  ${name}: ${value};`),
      kitV4,
    );
    sameShape(themeV4Css, plain.themeV4Css);
    assert.equal(valueOf(themeV4Css, name), value);
  }
  for (const value of [
    "ease); --color-red-500: blue",
    "ease) } body { color: red } x { y: (z",
    "ease url(x)",
    "url(x)",
    "var(--e)",
    "ease ease",
    "cubic-bezier(0.4, 0, 0.2)",
    "ease /*",
    'ease "',
  ]) {
    refusal(withRoot(`  ${name}: ${value};`), name, "an easing function");
  }
});

test("an elevation is one shadow list, or the file is refused", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const name = "--md-sys-elevation-1";
  for (const value of [
    "none",
    "0 0 0 1px red, 0 1px 2px blue",
    "0 0 0 1px var(--md-sys-color-outline-variant), 0 1px 2px 0 rgb(0 0 0 / 10%)",
    REFERENCE_DEFAULTS[name],
    "inset 0 calc(1px + 2 * (1px - 0.5px)) 2px -1px #0003",
    "0 1px 2px color-mix(in oklab, var(--md-sys-color-shadow, #000) 30%, transparent)",
    "0 1px 2px oklch(0.5 0.1 120 / 0.3), 0 0 0 1PX RGB(0, 0, 0)",
  ]) {
    const { themeV4Css } = generateTheme(
      withRoot(`  ${name}: ${value};`),
      kitV4,
    );
    sameShape(themeV4Css, plain.themeV4Css);
    assert.equal(valueOf(themeV4Css, name).replace(/\s+/g, " "), value);
  }
  for (const value of [
    "none) } body { color: red } x { y: (z",
    "0 1px red) ; x: (y",
    "0 1px url(x)",
    "0 1px image-set(x)",
    "0 1px red /*",
    "0 1px red */ x",
    "0 1px red, , 0 2px blue",
    "0 1px red,",
    "0 1px rgb(0 0 0",
    '0 1px "red"',
    "0 1px red !important",
    "0 1px \\72 ed",
    "0 1px @x",
  ]) {
    refusal(withRoot(`  ${name}: ${value};`), name, "a `box-shadow` value");
  }
  // An unclosed call on the rule's last declaration, with no `;` after it.
  refusal(withRoot(`  ${name}: 0 1px rgb(0 0 0`), name, "a `box-shadow` value");
  // A brace in the value changes what the block's rule is, so the value is
  // never read as the elevation: the theme keeps the kit's own.
  for (const value of [
    'none)) "{" ; } body { background: url(x) } x {',
    "0 1px {}",
  ]) {
    const { themeCss, themeV4Css, warnings } = generateTheme(
      withRoot(`  ${name}: ${value};`),
      kitV4,
    );
    assert.equal(themeCss, plain.themeCss);
    assert.equal(themeV4Css, plain.themeV4Css);
    assert.deepEqual(
      warnings.map(({ kind }) => kind),
      ["ignored"],
    );
  }
});

test("a colour, a state opacity and a duration are refused when they carry more than their value", () => {
  for (const tail of BREAKOUTS) {
    refusal(
      designMd("scheme: light", SEED, `  primary: ${yaml(`#ff0000${tail}`)}`),
      "colors.primary",
      "a hex colour",
    );
  }
  for (const tail of [") } body { color: red } x { y: (z", " url(x)", " /*"]) {
    refusal(
      withRoot(`  --md-sys-state-hover-state-layer-opacity: 8%${tail};`),
      "--md-sys-state-hover-state-layer-opacity",
      "a percentage",
    );
    refusal(
      withRoot(`  --md3-duration-short-4: 200ms${tail};`),
      "--md3-duration-short-4",
      "milliseconds",
    );
  }
});

test("a name every object has is an unknown name, never a crash", () => {
  const plain = generateTheme(seedOnly, kitV4);
  for (const name of ["constructor", "toString", "valueOf", "hasOwnProperty"]) {
    const { themeCss, themeV4Css, warnings } = generateTheme(
      designMd(
        "scheme: light",
        SEED,
        `typography:\n  body-large:\n    ${name}: x`,
        `rounded:\n  ${name}: x`,
      ) +
        `\n## Reference CSS\n\n\`\`\`css\n:root {\n  ${name}: x;\n}\n\`\`\`\n`,
      kitV4,
    );
    assert.equal(themeCss, plain.themeCss);
    assert.equal(themeV4Css, plain.themeV4Css);
    assert.deepEqual(kinds(warnings), [
      ["unapplied", `typography.body-large.${name}`],
      ["ignored", `rounded.${name}`],
      ["ignored", name],
    ]);
  }
});

/* ---- the mono face ---------------------------------------------------- */

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
const MONO_TOKEN = "--md-sys-typescale-mono-font";

/** A DESIGN.md whose mono face is this family (as YAML source). */
const monoFamily = (source) =>
  designMd(
    "scheme: light",
    SEED,
    `typography:\n  mono:\n    fontFamily: ${source}`,
  );

test("a named mono face gets a hook, the token and the `font-mono` utility", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const { themeCss, themeV4Css, warnings } = generateTheme(
    monoFamily("Share Tech Mono"),
    kitV4,
  );
  assert.deepEqual(warnings, []);
  assert.ok(
    themeCss.includes(
      `  --font-share-tech-mono: "Share Tech Mono", ${MONO_STACK};\n`,
    ),
  );
  assert.ok(
    themeV4Css.includes(`  ${MONO_TOKEN}: var(--font-share-tech-mono);\n`),
  );
  assert.ok(themeV4Css.includes(`  --font-mono: var(${MONO_TOKEN});\n`));
  // Nothing but the token's value moves in theme.v4.css.
  sameShape(themeV4Css, plain.themeV4Css);
  assert.equal(
    themeV4Css.replace(/^ {2}--md-sys-typescale-mono-font: .*$/m, ""),
    plain.themeV4Css.replace(/^ {2}--md-sys-typescale-mono-font: .*$/m, ""),
  );
  postcss.parse(themeCss);
});

test("the fallbacks a mono face writes replace the system's stack", () => {
  const { themeCss } = generateTheme(
    monoFamily("IBM Plex Mono, Menlo, monospace"),
    kitV4,
  );
  assert.equal(
    valueOf(themeCss, "--font-ibm-plex-mono"),
    '"IBM Plex Mono", Menlo, monospace',
  );
});

test("with no mono face named, the token is the system's monospace and nothing else moves", () => {
  const { themeCss, themeV4Css, warnings, resolvedDesignMd } = generateTheme(
    seedOnly,
    kitV4,
  );
  assert.deepEqual(warnings, []);
  assert.equal(valueOf(themeV4Css, MONO_TOKEN), MONO_STACK);
  assert.equal(valueOf(themeV4Css, "--font-mono"), `var(${MONO_TOKEN})`);
  assert.deepEqual(
    [...themeCss.matchAll(/^ {2}(--font-[a-z0-9-]+):/gm)].map(([, n]) => n),
    ["--font-roboto"],
  );
  assert.ok(!resolvedDesignMd.includes("mono"));
  // Whatever the template held: a theme generated once with a face, then
  // again without, is the plain one.
  const named = generateTheme(monoFamily("Share Tech Mono"), kitV4).themeV4Css;
  assert.notEqual(named, themeV4Css);
  assert.equal(generateTheme(seedOnly, named).themeV4Css, themeV4Css);
});

test("the kit's own theme carries the system's monospace on the mono token", () => {
  assert.equal(valueOf(kitV4, MONO_TOKEN), MONO_STACK);
  assert.ok(!readFileSync(join(here, "theme.css"), "utf8").includes("mono"));
});

test("a mono face that cannot be a name is refused, by its token", () => {
  const token = "typography.mono.fontFamily";
  const kind = "a family name, with its fallbacks after commas";
  refusal(monoFamily("12"), token, kind);
  refusal(monoFamily("[a, b]"), token, kind);
  refusal(monoFamily("Fixture,, monospace"), token, kind);
  refusal(monoFamily(yaml("Fix\nture")), token, kind);
  refusal(monoFamily(yaml("Fixture\t")), token, kind);
  refusal(
    designMd("scheme: light", SEED, "typography:\n  mono: Fixture"),
    "typography.mono",
    "a map with a `fontFamily`",
  );
  // The hook would be the variable the utility reads: it would read itself.
  for (const family of ["Mono", "mono, monospace", yaml("MONO!")]) {
    refusal(monoFamily(family), token, "a family whose font hook is not");
    assert.throws(
      () => generateTheme(monoFamily(family), kitV4),
      /`--font-mono`.*full name/s,
    );
  }
});

test("a mono face cannot leave its declaration", () => {
  const plain = generateTheme(monoFamily("Fixture"), kitV4);
  for (const tail of BREAKOUTS) {
    for (const family of [`Fixture${tail}`, `Fixture, x${tail}, monospace`]) {
      const { themeCss, themeV4Css } = generateTheme(
        monoFamily(yaml(family)),
        kitV4,
      );
      sameShape(themeCss, plain.themeCss);
      sameShape(themeV4Css, plain.themeV4Css);
    }
  }
});

test("the mono face is a family and nothing else; another unknown role is still ignored", () => {
  const plain = generateTheme(seedOnly, kitV4);
  const { themeCss, themeV4Css, warnings } = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  mono:\n    fontSize: 13px\n  code:\n    fontFamily: Fixture",
    ),
    kitV4,
  );
  assert.deepEqual(kinds(warnings), [
    ["ignored", "typography.code"],
    ["unapplied", "typography.mono.fontSize"],
  ]);
  assert.equal(themeCss, plain.themeCss);
  assert.equal(themeV4Css, plain.themeV4Css);
});

test("a mono face that is also the brand face shares one hook, the brand's", () => {
  const { themeCss, themeV4Css } = generateTheme(
    designMd(
      "scheme: light",
      SEED,
      "typography:\n  display-large:\n    fontFamily: JetBrains Mono\n  mono:\n    fontFamily: JetBrains Mono, monospace",
    ),
    kitV4,
  );
  assert.equal(
    valueOf(themeCss, "--font-jetbrains-mono"),
    '"JetBrains Mono", ui-sans-serif, system-ui, sans-serif',
  );
  assert.equal(valueOf(themeV4Css, MONO_TOKEN), "var(--font-jetbrains-mono)");
});

test("round trip: a mono face survives the resolved DESIGN.md", () => {
  for (const text of [
    monoFamily("Share Tech Mono"),
    monoFamily("IBM Plex Mono, Menlo, monospace"),
    designMd("scheme: light", SEED, "typography:\n  mono:\n    fontSize: 13px"),
  ]) {
    const first = generateTheme(text, kitV4);
    const again = generateTheme(first.resolvedDesignMd, kitV4);
    assert.equal(again.themeCss, first.themeCss);
    assert.equal(again.themeV4Css, first.themeV4Css);
    assert.deepEqual(again.warnings, first.warnings);
    assert.equal(again.resolvedDesignMd, first.resolvedDesignMd);
  }
});
