/* =============================================================================
   What the `MD3/Your theme` tests hand the catalog

   Kept here, not in the story file: the catalog's stylesheet scans `stories/`
   for utilities, and fixture text is full of words it would compile.

   The DESIGN.md fixtures are generated in the tests by the kit's own
   generator, so they cannot go stale against it. Their values are chosen to
   differ from both identities the catalog ships (Material and Editorial).
   ========================================================================== */

const TYPE_ROLES = ["display", "headline", "title", "body", "label"].flatMap(
  (role) => ["large", "medium", "small"].map((size) => `${role}-${size}`),
);
const BRAND = "Fixture Grotesk, Georgia, serif";
const PLAIN = "Fixture Sans, Verdana, sans-serif";

const typography = (brand: string, plain: string) =>
  TYPE_ROLES.map(
    (role) =>
      `  ${role}:\n    fontFamily: ${/^(display|headline|title)/.test(role) ? brand : plain}`,
  ).join("\n");

/** A small DESIGN.md: a written primary, a square-ish pill, two faces the
    catalog has not loaded, a ring for the first elevation, and one colour
    name the kit does not read (so the generator has a warning to give). */
const designMd = (darkMode: "class" | "system") => `---
version: alpha
name: Handed fixture
description: A theme that is not the kit's, for the catalog's own tests.
scheme: light
colors:
  seed: "#b0005a"
  primary: "#8a1c7c"
  on-primary: "#ffffff"
  brand-pink: "#ff00aa"
typography:
${typography(BRAND, PLAIN)}
rounded:
  medium: 22px
  full: 6px
---

## Overview

A fixture.

## Reference CSS

\`\`\`css
:root {
  --md3-dark-mode: ${darkMode};
  --md-sys-elevation-1: 0 0 0 3px rgb(200 30 90);
}
\`\`\`
`;

export const DESIGN_MD_CLASS = designMd("class");
export const DESIGN_MD_SYSTEM = designMd("system");

/** The warning the fixture's unread colour name earns. */
export const FIXTURE_WARNING = "colors.brand-pink";

/** A DESIGN.md the generator refuses: it names no scheme. */
export const DESIGN_MD_REFUSED = DESIGN_MD_CLASS.replace("scheme: light\n", "");

/** A DESIGN.md in the format's own words, as its own tools write one: no
    `scheme` and no `seed`, which are the kit's keys, and the short sizes
    (`title-md`, `rounded.sm`). The generator reads the scheme from the
    ground and the seed from the primary, and says both. The elevation is
    written so that the tests can read it drawn, as in the fixture above. */
const ownWords = (name: string, primary: string, ground: string) => `---
version: alpha
name: ${name}
description: A theme in the format's own words, for the catalog's own tests.
colors:
  primary: "${primary}"
  background: "${ground}"
typography:
  title-md:
    fontSize: 19px
rounded:
  sm: 3px
  full: 6px
---

## Overview

A fixture.

## Reference CSS

\`\`\`css
:root {
  --md-sys-elevation-1: 0 0 0 3px rgb(200 30 90);
}
\`\`\`
`;

export const OWN_WORDS = [
  {
    scheme: "light",
    name: "Own words on a light ground",
    primary: "#8a1c7c",
    text: ownWords("Own words on a light ground", "#8a1c7c", "#fff8f2"),
  },
  {
    scheme: "dark",
    name: "Own words on a dark ground",
    primary: "#ffb0e8",
    text: ownWords("Own words on a dark ground", "#ffb0e8", "#17121a"),
  },
] as const;

/** A generated theme.css as a generator with no guard on a family name wrote
    it: the brand hook's declaration ends early, and what follows names two
    addresses. The kit's generator writes a family as one string, so no
    DESIGN.md gives this text any more; a project on an older copy still can. */
export const themeCssBrokenOut = (
  themeCss: string,
  probe: (name: string) => string,
) =>
  themeCss.replace(
    /^( {2}--font-[a-z0-9-]+: )[^;\n]*;$/m,
    (_, hook: string) =>
      `${hook}"Fixture"; } @import url("${probe("md-import.css")}"); :root { background: url("${probe("md-background.png")}"); --a: "", ui-sans-serif, system-ui, sans-serif;`,
  );

/** Not a theme at all. */
export const NOT_A_THEME = `body {\n  margin: 0;\n}\n`;

/** A theme.css that names remote resources every way a stylesheet can:
    an import, a painted address, a face with a source that a font hook then
    names, and an address as a role's value. `colors` is a real theme.css, so
    the file is a theme in every other respect. */
export const hostileColors = (
  colors: string,
  probe: (name: string) => string,
) => `@import url("${probe("import.css")}");
${colors}
@font-face {
  font-family: "Probe Face";
  src: url("${probe("face.woff2")}");
}
:root {
  background: url("${probe("background.png")}");
  --md-sys-color-tertiary: url("${probe("role.png")}");
  --font-probe-face: "Probe Face", serif;
}
.probe-frame {
  font-family: "Probe Face";
}
`;

/** A theme.v4.css with an address where the second elevation was. */
export const hostileScales = (
  scales: string,
  probe: (name: string) => string,
) =>
  scales.replace(
    /--md-sys-elevation-2:[^;]*;/,
    `--md-sys-elevation-2: 0 0 0 1px red, url("${probe("elevation.png")}");`,
  );
