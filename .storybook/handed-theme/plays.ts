/// <reference path="./raw.d.ts" />
/* =============================================================================
   The tests of `MD3/Your theme`, as `play` functions

   `stories/YourTheme.stories.tsx` gives each one a story, so each runs in
   Chromium under both of the catalog's test projects (Material, Editorial).
   They are kept here because the catalog's stylesheet scans `stories/`.

   Every test measures the default first, reads real components, and ends on
   the default with nothing stored, so the axe pass that follows a `play`
   judges the kit's own theme.

   What a fixture's values should compute to is read from the generator's
   output by the regular expressions below and put through a probe element:
   never through the reader under test.
   ========================================================================== */

import { expect, userEvent, waitFor, within } from "storybook/test";

import { DesignMdError, generateTheme } from "../../tokens/design-md.mjs";
import template from "../../tokens/theme.v4.css?raw";
import {
  createController,
  handedTheme,
  HANDED,
  STORAGE_KEY,
} from "./controller";
import {
  DESIGN_MD_CLASS,
  DESIGN_MD_REFUSED,
  DESIGN_MD_SYSTEM,
  FIXTURE_WARNING,
  hostileColors,
  hostileScales,
  NOT_A_THEME,
  OWN_WORDS,
  themeCssBrokenOut,
} from "./fixtures";
import { MAX_FILE_BYTES, readHanded, type Generate } from "./read-theme";

type Play = (context: { canvasElement: HTMLElement }) => Promise<void>;
type Scheme = "light" | "dark";

const html = document.documentElement;

/* ---- what is drawn ---------------------------------------------------- */

type Drawn = {
  /** `primary`, as the filled button's fill. */
  role: string;
  /** The `full` corner, on the same button. */
  corner: string;
  /** The brand face, on a headline. */
  face: string;
  /** The first elevation level, on an elevated card. */
  elevation: string;
};

const computed = (element: Element, property: string) =>
  getComputedStyle(element).getPropertyValue(property);

/** Tailwind composes `box-shadow` from five layers (inset, rings, the shadow
    itself); the four a component does not use are transparent and empty. */
const shadowOf = (element: Element) =>
  computed(element, "box-shadow").replaceAll(
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, ",
    "",
  );

function sample(canvasElement: HTMLElement) {
  const find = (selector: string) => {
    const found = canvasElement.querySelector(selector);
    if (!found) throw new Error(`no ${selector} in the sample`);
    return found;
  };
  return {
    button: within(canvasElement).getByRole("button", {
      name: "Filled button",
    }),
    headline: find('[data-sample="headline"]'),
    card: find('[data-slot="card"]'),
    second: find('[data-sample="elevation-2"]'),
  };
}

function read(canvasElement: HTMLElement): Drawn {
  const { button, headline, card } = sample(canvasElement);
  return {
    role: computed(button, "background-color"),
    corner: computed(button, "border-top-left-radius"),
    face: computed(headline, "font-family"),
    elevation: shadowOf(card),
  };
}

/** What a declared value computes to, on an element of its own. */
function probe(property: string, value: string) {
  const element = document.createElement("div");
  element.style.setProperty(property, value);
  document.body.append(element);
  const result = computed(element, property);
  element.remove();
  return result;
}

/** What is drawn once the story's scheme has arrived: a play's first reading.
    The Theme decorator puts its class on `html` after the story's elements
    are in the document, so a story that follows one of the other scheme can
    start while its button is still crossing from that scheme's fill. Reading
    starts any such transition; each one's end is awaited, and the fill is
    then the scheme's own primary or the play stops here. */
async function settled(canvasElement: HTMLElement): Promise<Drawn> {
  read(canvasElement);
  await Promise.allSettled(
    document
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((transition) => transition.finished),
  );
  const drawn = read(canvasElement);
  await expect(drawn.role).toBe(
    probe("background-color", "var(--md-sys-color-primary)"),
  );
  return drawn;
}

/* ---- the fixture, from the generator ---------------------------------- */

function declared(css: string, name: string) {
  const found = new RegExp(`${name}:\\s*([^;]+);`).exec(css);
  if (!found?.[1]) throw new Error(`the fixture declares no ${name}`);
  return found[1].trim();
}

function fixture(designMd: string) {
  const generated = generateTheme(designMd, template);
  const { themeCss, themeV4Css } = generated;
  const darkAt = themeCss.search(
    /^\.dark \{|^@media \(prefers-color-scheme: dark\)/m,
  );
  const colors = {
    light: themeCss.slice(0, darkAt),
    dark: themeCss.slice(darkAt),
  };
  const hook = /var\((--font-[a-z0-9-]+)\)/.exec(
    declared(themeV4Css, "--md-sys-typescale-brand-font"),
  )?.[1];
  if (!hook) throw new Error("the fixture's brand face reads no hook");
  return {
    ...generated,
    expected: (scheme: Scheme): Drawn => ({
      role: probe(
        "background-color",
        declared(colors[scheme], "--md-sys-color-primary"),
      ),
      corner: probe(
        "border-top-left-radius",
        declared(themeV4Css, "--md-sys-shape-corner-full"),
      ),
      face: probe("font-family", declared(themeCss, hook)),
      elevation: probe(
        "box-shadow",
        declared(themeV4Css, "--md-sys-elevation-1"),
      ),
    }),
    pair: () => [
      new File([themeCss], "theme.css", { type: "text/css" }),
      new File([themeV4Css], "theme.v4.css", { type: "text/css" }),
    ],
  };
}

const textFile = (name: string, text: string) =>
  new File([text], name, { type: "text/plain" });

/* ---- the control ------------------------------------------------------ */

/** Hands files through the page's own picker. */
function hand(canvasElement: HTMLElement, files: File[]) {
  const input =
    canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("the page has no file picker");
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const forget = (canvasElement: HTMLElement) =>
  userEvent.click(
    within(canvasElement).getByRole("button", { name: "Forget this theme" }),
  );

const draws = (canvasElement: HTMLElement, drawn: Drawn) =>
  waitFor(() => expect(read(canvasElement)).toEqual(drawn));

const status = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole("status");

/** Before every story of the page: nothing held, nothing stored. */
export function reset() {
  handedTheme.forget();
}

const editorial = () => html.classList.contains("preset-editorial");
const identity = () => (editorial() ? "editorial" : "material");

/* ---- a handed theme redraws ------------------------------------------- */

/** The generated pair, in light: a role, a corner, the face and an elevation
    each leave the default's value for the fixture's, and come back. */
export const pairRedraws: Play = async ({ canvasElement }) => {
  const wasEditorial = editorial();
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);
  const want = theme.expected("light");
  for (const key of Object.keys(want) as (keyof Drawn)[]) {
    await expect(want[key]).not.toBe(before[key]);
  }
  const secondBefore = shadowOf(sample(canvasElement).second);

  hand(canvasElement, theme.pair());
  await draws(canvasElement, want);
  await expect(html).toHaveClass("theme-handed");
  // Editorial carries component rules of its own: off while a theme draws.
  await expect(html).not.toHaveClass("preset-editorial");
  // The kit's own `--alpha()` elevation still draws a shadow, and the very
  // one Tailwind compiles for the default.
  const second = shadowOf(sample(canvasElement).second);
  await expect(second).not.toBe("none");
  await expect(second).toMatch(/\dpx/);
  if (!wasEditorial) await expect(second).toBe(secondBefore);
  await expect(status(canvasElement)).toHaveTextContent(
    "theme.css + theme.v4.css",
  );
  await expect(localStorage.getItem(STORAGE_KEY)).toContain(
    "--md-sys-color-primary",
  );

  await forget(canvasElement);
  await draws(canvasElement, before);
  await expect(html).not.toHaveClass("theme-handed");
  await expect(editorial()).toBe(wasEditorial);
  await expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
};

/** Under the toolbar's dark, a theme draws its dark roles: whichever switch
    its DESIGN.md chose. */
const drawsDark =
  (designMd: string): Play =>
  async ({ canvasElement }) => {
    await expect(html).toHaveClass("dark");
    const before = await settled(canvasElement);
    const theme = fixture(designMd);
    const want = theme.expected("dark");
    await expect(want.role).not.toBe(theme.expected("light").role);
    await expect(want.role).not.toBe(before.role);

    hand(canvasElement, theme.pair());
    await draws(canvasElement, want);

    await forget(canvasElement);
    await draws(canvasElement, before);
  };

export const darkByClass = drawsDark(DESIGN_MD_CLASS);
export const darkBySystem = drawsDark(DESIGN_MD_SYSTEM);

/** Under the toolbar's light, a theme whose dark follows the system draws its
    light roles, whatever the machine asks for: the toolbar is the switch. */
export const lightWhateverTheSystem: Play = async ({ canvasElement }) => {
  await expect(html).not.toHaveClass("dark");
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_SYSTEM);
  await expect(theme.themeCss).toContain("@media (prefers-color-scheme: dark)");

  hand(canvasElement, theme.pair());
  await draws(canvasElement, theme.expected("light"));

  await forget(canvasElement);
  await draws(canvasElement, before);
};

/** A DESIGN.md alone draws what its generated pair draws, and the generator's
    warnings are on the page. */
export const designMdAlone: Play = async ({ canvasElement }) => {
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);
  await expect(
    theme.warnings.some((warning) => warning.message.includes(FIXTURE_WARNING)),
  ).toBe(true);

  hand(canvasElement, [textFile("DESIGN.md", DESIGN_MD_CLASS)]);
  await draws(canvasElement, theme.expected("light"));
  await expect(status(canvasElement)).toHaveTextContent("Handed fixture");
  await expect(status(canvasElement)).toHaveTextContent(FIXTURE_WARNING);

  await forget(canvasElement);
  await draws(canvasElement, before);
};

/** A DESIGN.md in the format's own words (no `scheme`, no `seed`, short
    sizes) is drawn, not refused: its primary is in the scheme its ground
    says, and the page lists what was assumed and the token it was read from. */
export const formatsOwnWords: Play = async ({ canvasElement }) => {
  const before = await settled(canvasElement);
  for (const { scheme, name, primary, text } of OWN_WORDS) {
    const theme = fixture(text);
    // What is drawn is what the same file draws with the two keys said.
    const said = fixture(
      text
        .replace("colors:\n", `scheme: ${scheme}\ncolors:\n`)
        .replace("colors:\n", `colors:\n  seed: "${primary}"\n`),
    );
    await expect(said.warnings).toEqual([]);
    for (const drawn of ["light", "dark"] as const) {
      await expect(theme.expected(drawn)).toEqual(said.expected(drawn));
    }
    await expect(
      theme.warnings.map((warning) => warning.kind),
    ).toEqual(["assumed", "assumed"]);

    hand(canvasElement, [textFile("DESIGN.md", text)]);
    await draws(canvasElement, theme.expected("light"));
    await expect(status(canvasElement)).toHaveTextContent(name);
    await expect(status(canvasElement)).toHaveTextContent(
      `read as ${scheme} from colors.background`,
    );
    await expect(status(canvasElement)).toHaveTextContent(
      "read from colors.primary",
    );

    await forget(canvasElement);
    await draws(canvasElement, before);
  }
};

/* ---- it holds --------------------------------------------------------- */

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  };
}

async function readPair(theme: ReturnType<typeof fixture>) {
  const result = await readHanded(
    [
      { name: "theme.css", text: theme.themeCss },
      { name: "theme.v4.css", text: theme.themeV4Css },
    ],
    () => Promise.reject(new Error("no DESIGN.md was handed")),
  );
  if (!result.ok) throw new Error(result.message);
  return result.theme;
}

/** What a reload does: the first controller goes, a second one over the same
    storage draws the theme again. One switch puts the default back while the
    theme stays held; forgetting empties the storage. */
export const heldAcrossAReload: Play = async ({ canvasElement }) => {
  const kit = identity();
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);
  const want = theme.expected("light");
  const store = memoryStorage();

  const first = createController({ document, storage: () => store });
  await expect(first.holds()).toBe(false);
  first.hand(await readPair(theme));
  await draws(canvasElement, want);
  await expect(first.getState().kept).toBe(true);
  first.dispose();
  await draws(canvasElement, before);
  await expect(store.getItem(STORAGE_KEY)).not.toBeNull();

  const second = createController({ document, storage: () => store });
  // What `preview.ts` asks to choose the first story's Preset.
  await expect(second.holds()).toBe(true);
  second.show(HANDED);
  await draws(canvasElement, want);

  // Preset → the kit's own: the default is back and the theme is still held.
  second.show(kit);
  await draws(canvasElement, before);
  await expect(store.getItem(STORAGE_KEY)).not.toBeNull();
  second.show(HANDED);
  await draws(canvasElement, want);

  second.forget();
  await draws(canvasElement, before);
  await expect(store.getItem(STORAGE_KEY)).toBeNull();
  // `handed` with nothing held draws the default.
  second.show(HANDED);
  await draws(canvasElement, before);
  await expect(second.getState().drawing).toBe(false);
  second.dispose();
};

/** A browser that refuses storage: every call throws. */
export const refused = createController({
  document,
  storage: () => {
    throw new DOMException("storage is refused", "SecurityError");
  },
});

/** Storage refused: the default draws, a handed theme still draws, and the
    page says it is kept until the reload. Storage holding rubbish: the default
    draws, or only what passes the reader's rules. */
export const storageRefusedOrBroken: Play = async ({ canvasElement }) => {
  const kit = identity();
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);

  await expect(refused.holds()).toBe(false);
  refused.show(HANDED);
  await draws(canvasElement, before);

  hand(canvasElement, theme.pair());
  await draws(canvasElement, theme.expected("light"));
  await expect(status(canvasElement)).toHaveTextContent(
    "kept until this page is reloaded",
  );
  await forget(canvasElement);
  await draws(canvasElement, before);
  refused.dispose();

  const throwing = createController({
    document,
    storage: () =>
      new Proxy({} as Storage, {
        get: () => () => {
          throw new DOMException("storage is refused", "SecurityError");
        },
      }),
  });
  await expect(throwing.holds()).toBe(false);
  throwing.hand(await readPair(theme));
  await draws(canvasElement, theme.expected("light"));
  await expect(throwing.getState().kept).toBe(false);
  throwing.forget();
  await draws(canvasElement, before);
  throwing.dispose();

  const store = memoryStorage();
  store.setItem(STORAGE_KEY, "{ not json");
  const broken = createController({ document, storage: () => store });
  await expect(broken.holds()).toBe(false);
  broken.show(HANDED);
  await draws(canvasElement, before);
  broken.dispose();

  store.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: "stored by another page",
      light: {
        "--md-sys-color-primary": "rgb(1, 2, 3)",
        "--md-sys-color-secondary": 'url("/never")',
        "--not-a-role": "red",
        background: "red",
      },
      dark: "not a map",
      root: {
        "--md-sys-shape-corner-full": "3px",
        "--md-sys-elevation-1": "0 0 0 1px red; } html { display: none",
        display: "none",
      },
    }),
  );
  const partial = createController({ document, storage: () => store });
  await expect(partial.holds()).toBe(true);
  partial.show(HANDED);
  await waitFor(() =>
    expect(read(canvasElement)).toMatchObject({
      role: "rgb(1, 2, 3)",
      corner: "3px",
    }),
  );
  // Only the two declarations that pass were set, on the fixed selectors.
  const sheet = document.adoptedStyleSheets.at(-1);
  const rule = sheet?.cssRules[0] as CSSStyleRule;
  await expect(rule.selectorText).toBe(":root.theme-handed");
  await expect(Array.from(rule.style).sort()).toEqual([
    "--md-sys-color-primary",
    "--md-sys-shape-corner-full",
  ]);
  partial.show(kit);
  await draws(canvasElement, before);
  partial.dispose();
};

/* ---- nothing is uploaded ---------------------------------------------- */

const PROBE = "/__handed-theme-probe";
let probes = 0;
/** Same-origin addresses nothing else on the page asks for. */
function probeAddresses() {
  const nonce = `${Date.now().toString(36)}-${++probes}`;
  return { nonce, at: (name: string) => `${PROBE}/${nonce}/${name}` };
}

/** Every request the page makes from now on, by address. */
function watchRequests() {
  const seen: string[] = [];
  const observer = new PerformanceObserver((list) => {
    seen.push(...list.getEntries().map((entry) => entry.name));
  });
  observer.observe({ type: "resource" });
  return {
    seen,
    to: (nonce: string) => seen.filter((name) => name.includes(nonce)),
    stop: () => observer.disconnect(),
  };
}

/** Every call of the three ways a script sends something. */
function spyOnSending() {
  const calls: string[] = [];
  const original = window.fetch;
  const realFetch = original.bind(window);
  const realSend = XMLHttpRequest.prototype.send;
  const realBeacon = navigator.sendBeacon.bind(navigator);
  window.fetch = (...args) => {
    calls.push(
      `fetch ${String(args[0] instanceof Request ? args[0].url : args[0])}`,
    );
    return realFetch(...args);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    calls.push("XMLHttpRequest.send");
    return realSend.apply(this, args);
  };
  navigator.sendBeacon = (...args) => {
    calls.push(`sendBeacon ${String(args[0])}`);
    return realBeacon(...args);
  };
  return {
    calls,
    realFetch,
    restore() {
      window.fetch = original;
      XMLHttpRequest.prototype.send = realSend;
      navigator.sendBeacon = realBeacon;
    },
  };
}

/** The text as a stylesheet of the page, which is what the catalog never
    does: resolves once a probe address was asked for. */
async function requestsWithoutTheGuard(
  css: string,
  requests: ReturnType<typeof watchRequests>,
  nonce: string,
) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  try {
    await waitFor(() => expect(requests.to(nonce)).not.toEqual([]), {
      timeout: 5000,
    });
  } finally {
    style.remove();
  }
  return requests.to(nonce);
}

/** Nothing with `nonce` in its address was asked for. A request of the test's
    own, made after the hand, shows the watch was live all along. */
async function expectNoRequest(
  requests: ReturnType<typeof watchRequests>,
  sending: ReturnType<typeof spyOnSending>,
  probe: ReturnType<typeof probeAddresses>,
) {
  await expect(sending.calls).toEqual([]);
  for (const sentinel of ["sentinel-1", "sentinel-2"]) {
    await sending.realFetch(probe.at(sentinel)).catch(() => undefined);
    await waitFor(() =>
      expect(requests.to(`${probe.nonce}/${sentinel}`)).not.toEqual([]),
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await expect(
    requests.to(probe.nonce).filter((name) => !/sentinel-\d$/.test(name)),
  ).toEqual([]);
}

/** A handed file that names remote resources every way a stylesheet can. As
    a stylesheet of the page it makes requests; handed, it makes none, and the
    page lists what was left out. */
export const nothingIsRequested: Play = async ({ canvasElement }) => {
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);
  const requests = watchRequests();
  try {
    const raw = probeAddresses();
    const left = await requestsWithoutTheGuard(
      hostileColors(theme.themeCss, raw.at),
      requests,
      raw.nonce,
    );
    await expect(left.length).toBeGreaterThan(0);
    await draws(canvasElement, before);

    const guarded = probeAddresses();
    const sending = spyOnSending();
    try {
      hand(canvasElement, [
        textFile("theme.css", hostileColors(theme.themeCss, guarded.at)),
        textFile("theme.v4.css", hostileScales(theme.themeV4Css, guarded.at)),
      ]);
      await draws(canvasElement, theme.expected("light"));
      await expectNoRequest(requests, sending, guarded);
    } finally {
      sending.restore();
    }

    const said = status(canvasElement);
    await expect(said).toHaveTextContent("an @import is never followed");
    await expect(said).toHaveTextContent(
      "--md-sys-color-tertiary names an address (url()",
    );
    await expect(said).toHaveTextContent(
      "--md-sys-elevation-2 names an address (url()",
    );
    await expect(said).toHaveTextContent("background-image");
    await expect(said).toHaveTextContent("@font-face");
    // Nothing of the file reached the catalog's own frame.
    await expect(computed(html, "background-image")).toBe("none");
    // The role whose value was an address keeps the kit's.
    await expect(computed(html, "--md-sys-color-tertiary")).not.toContain(
      "url",
    );
  } finally {
    requests.stop();
  }

  await forget(canvasElement);
  await draws(canvasElement, before);
};

/** What a generator returns goes through the same guard as a handed file.
    The kit's generator writes a family as one string, so the text here is
    what one without that guard wrote: a theme.css whose brand hook ends its
    declaration and names two addresses. As a stylesheet of the page it makes
    requests; returned for a handed DESIGN.md, it makes none. */
export const generatedThemeIsGuarded: Play = async ({ canvasElement }) => {
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);
  const requests = watchRequests();
  try {
    const raw = probeAddresses();
    const brokenOut = themeCssBrokenOut(theme.themeCss, raw.at);
    await expect(brokenOut).not.toBe(theme.themeCss);
    const left = await requestsWithoutTheGuard(brokenOut, requests, raw.nonce);
    await expect(left.length).toBeGreaterThan(0);
    await draws(canvasElement, before);

    const guarded = probeAddresses();
    const unguarded: Generate = () =>
      Promise.resolve({
        ok: true,
        name: "Handed fixture",
        themeCss: themeCssBrokenOut(theme.themeCss, guarded.at),
        themeV4Css: theme.themeV4Css,
        warnings: [],
      });
    const sending = spyOnSending();
    try {
      const result = await readHanded(
        [{ name: "DESIGN.md", text: DESIGN_MD_CLASS }],
        unguarded,
      );
      if (!result.ok) throw new Error(result.message);
      handedTheme.hand(result.theme);
      await waitFor(() => expect(html).toHaveClass("theme-handed"));
      await expectNoRequest(requests, sending, guarded);
    } finally {
      sending.restore();
    }
    await expect(status(canvasElement)).toHaveTextContent("background-image");
    await expect(computed(html, "background-image")).toBe("none");
  } finally {
    requests.stop();
  }

  await forget(canvasElement);
  await draws(canvasElement, before);
};

/* ---- refusals, in words ----------------------------------------------- */

/** Each file the catalog cannot use is refused in words that say what to
    hand instead, and what is drawn does not move. */
export const refusedInWords: Play = async ({ canvasElement }) => {
  const before = await settled(canvasElement);
  const theme = fixture(DESIGN_MD_CLASS);
  const says = async (files: File[], ...phrases: string[]) => {
    hand(canvasElement, files);
    const alert = await within(canvasElement).findByRole("alert");
    for (const phrase of phrases) {
      await waitFor(() => expect(alert).toHaveTextContent(phrase));
    }
    await expect(read(canvasElement)).toEqual(before);
    await expect(html).not.toHaveClass("theme-handed");
    await expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  };

  await says(
    [textFile("notes.css", NOT_A_THEME)],
    "notes.css is not a theme",
    "Hand theme.css and theme.v4.css together",
    "or your DESIGN.md alone",
  );
  await says(
    [textFile("theme.v4.css", theme.themeV4Css)],
    "carries no colours",
    "Hand both files together",
  );
  await says(
    [textFile("theme.css", theme.themeCss)],
    "type, corners, elevation and motion are in theme.v4.css",
    "Hand both files together",
  );

  // A DESIGN.md the generator refuses: its own message, unchanged.
  let message = "";
  try {
    generateTheme(DESIGN_MD_REFUSED, template);
  } catch (error) {
    if (!(error instanceof DesignMdError)) throw error;
    message = error.message;
  }
  await expect(message).toContain("scheme");
  await says(
    [textFile("DESIGN.md", DESIGN_MD_REFUSED)],
    message.replaceAll("`", ""),
  );

  await says(
    [new File([new Uint8Array(MAX_FILE_BYTES + 1)], "theme.css")],
    "theme.css is larger than 512 kB",
    "Hand theme.css and theme.v4.css together",
  );
};
