#!/usr/bin/env node
/* =============================================================================
   Resolve the kit's tokens into plain values → tokens/resolved.json

     npm run theme:resolve

   Reads theme.css (color roles, light + dark) and theme.v4.css (type scale,
   shape, elevation, motion) and writes a framework-free snapshot: every role
   as a hex color, every scale as numbers. It is the hand-off format for tools
   that cannot read Tailwind or CSS variables — Claude Design's canvas (which
   transcribes resolved values), design-token pipelines, docs — and it is the
   file the kit's Storybook tokens page renders.

   Source of truth stays theme.css / theme.v4.css; never edit resolved.json by
   hand. Re-run after any token change (CI can diff it to catch stale copies).
   ========================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const themeCss = readFileSync(join(here, "theme.css"), "utf8");
const v4Css = readFileSync(join(here, "theme.v4.css"), "utf8");

/* ---- colors ---------------------------------------------------------- */

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    Math.round(
      255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))),
    );
  return (
    "#" +
    [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("")
  );
}

function parseBlock(selector) {
  const start = themeCss.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`theme.css: no "${selector}" block`);
  const body = themeCss.slice(start, themeCss.indexOf("\n}", start));
  const roles = {};
  for (const m of body.matchAll(
    /--md-sys-color-([a-z-]+):\s*hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/g,
  )) {
    roles[m[1]] = hslToHex(+m[2], +m[3], +m[4]);
  }
  return roles;
}

const light = parseBlock(":root");
const dark = parseBlock(".dark");
for (const role of Object.keys(light)) {
  if (!(role in dark)) throw new Error(`theme.css: "${role}" missing in .dark`);
}

/* ---- scales from theme.v4.css --------------------------------------- */

const px = (name) => {
  const m = v4Css.match(new RegExp(`--${name}:\\s*(-?[\\d.]+)px`));
  return m ? Number(m[1]) : undefined;
};
const raw = (name) => {
  const m = v4Css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : undefined;
};

const typography = {};
for (const role of [
  "display-large",
  "display-medium",
  "display-small",
  "headline-large",
  "headline-medium",
  "headline-small",
  "title-large",
  "title-medium",
  "title-small",
  "body-large",
  "body-medium",
  "body-small",
  "label-large",
  "label-medium",
  "label-small",
]) {
  // Read the `--md-sys-*` system tokens, not the Tailwind namespaces: the
  // namespaces are `var()` indirections onto these (see theme.v4.css).
  typography[role] = {
    fontSize: px(`md-sys-typescale-${role}-size`),
    lineHeight: px(`md-sys-typescale-${role}-line-height`),
    letterSpacing: px(`md-sys-typescale-${role}-tracking`) ?? 0,
    fontWeight: Number(raw(`md-sys-typescale-${role}-weight`) ?? 400),
  };
}

const shape = {};
for (const step of [
  "extra-small",
  "small",
  "medium",
  "large",
  "extra-large",
  "full",
]) {
  shape[step] = px(`md-sys-shape-corner-${step}`);
}

const elevation = {};
for (let level = 1; level <= 5; level++) {
  elevation[level] = raw(`md-sys-elevation-${level}`)
    ?.replace(/\s+/g, " ")
    .replace(
      /--alpha\(var\(--md-sys-color-shadow\) \/ (\d+)%\)/g,
      "shadow@$1%",
    );
}

const motion = { easing: {}, duration: {} };
for (const e of [
  "standard",
  "standard-accelerate",
  "standard-decelerate",
  "emphasized",
  "emphasized-accelerate",
  "emphasized-decelerate",
]) {
  motion.easing[e] = raw(`md-sys-motion-easing-${e}`);
}
for (const group of ["short", "medium", "long"]) {
  for (let i = 1; i <= 4; i++) {
    const m = v4Css.match(
      new RegExp(`--md3-duration-${group}-${i}:\\s*(\\d+)ms`),
    );
    if (m) motion.duration[`${group}-${i}`] = Number(m[1]);
  }
}

/* ---- interaction states ---------------------------------------------- */

// The four state-layer opacities are tokens (`--md-sys-state-*`, read by the
// `state-opacity-*` utilities), so they resolve from the CSS like every other
// scale. The disabled alphas are not: they are still `/38` and `/12` color
// modifiers written into each component, so they stay literals here.
const percent = (name) => {
  const m = v4Css.match(new RegExp(`--${name}:\\s*([\\d.]+)%`));
  if (!m) throw new Error(`theme.v4.css: no "--${name}"`);
  return Number(m[1]) / 100;
};

const state = {
  layerOpacity: {
    hover: percent("md-sys-state-hover-state-layer-opacity"),
    focus: percent("md-sys-state-focus-state-layer-opacity"),
    press: percent("md-sys-state-pressed-state-layer-opacity"),
    drag: percent("md-sys-state-dragged-state-layer-opacity"),
  },
  disabledContentOpacity: 0.38,
  disabledContainerOpacity: 0.12,
  // Focus indicator (utils.ts `focusRing`): ring width / offset in px.
  focusRing: { width: 3, offset: 2, colorRole: "secondary" },
};

const out = {
  $schema: "md3-kit/resolved-tokens/v1",
  source: "tokens/{theme.css,theme.v4.css}",
  color: { light, dark },
  typography,
  shape,
  elevation,
  motion,
  state,
};

writeFileSync(join(here, "resolved.json"), JSON.stringify(out, null, 2) + "\n");
console.log(
  `resolved.json: ${Object.keys(light).length} color roles × 2 schemes, ${Object.keys(typography).length} type roles`,
);
