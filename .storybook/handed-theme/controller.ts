/* =============================================================================
   The controller: the one owner of what the catalog draws

   It owns the two identity classes on `<html>` (`preset-editorial`,
   `theme-handed`), the constructed sheet a handed theme is drawn through, and
   the place the theme is kept. `preview.ts` tells it which Preset the toolbar
   shows; the `MD3/Your theme` page hands it a theme. Neither touches the
   document itself, so they cannot disagree.

   A handed theme is drawn by `setProperty`, one validated declaration at a
   time, on two rules whose selectors are fixed here:

     :root.theme-handed                              light roles, every scale
     .theme-handed.dark, .theme-handed .dark         dark roles

   So a handed theme obeys the catalog's Theme switch (the `dark` class),
   whether its DESIGN.md chose dark by class or by the system setting.

   It is kept in this browser's `localStorage`, as declarations already
   validated, and validated again when read back: the origin may be shared
   with other sites, so what storage returns is as untrusted as a file. With
   storage refused, everything still draws and nothing is kept.
   ========================================================================== */

import { validate, type HandedTheme } from "./read-theme";

export const STORAGE_KEY = "md3-catalog.handed-theme.v1";
export const HANDED = "handed";
const HANDED_CLASS = "theme-handed";
const EDITORIAL_CLASS = "preset-editorial";
const LIGHT_SELECTOR = `:root.${HANDED_CLASS}`;
const DARK_SELECTOR = `.${HANDED_CLASS}.dark, .${HANDED_CLASS} .dark`;

export type ControllerState = {
  /** The theme held, drawn or not. */
  theme: HandedTheme | null;
  /** Whether the held theme is what the catalog draws now. */
  drawing: boolean;
  /** Whether the held theme is in storage, so it survives a reload. */
  kept: boolean;
};

export type Controller = ReturnType<typeof createController>;

type Options = {
  document: Document;
  /** May throw, or return a storage whose every call throws. */
  storage: () => Storage;
};

export function createController({ document, storage }: Options) {
  const root = document.documentElement;
  let sheet: CSSStyleSheet | null = null;
  let theme: HandedTheme | null = null;
  let loaded = false;
  let kept = false;
  let preset: string | null = null;
  /** The identity to go back to: the last Preset shown that is not `handed`. */
  let fallback: string | null = null;
  let state: ControllerState = { theme: null, drawing: false, kept: false };
  const listeners = new Set<() => void>();
  let requestPreset: ((preset: string) => void) | null = null;

  const attempt = <T>(call: (storage: Storage) => T): T | undefined => {
    try {
      return call(storage());
    } catch {
      return undefined;
    }
  };

  /** What storage holds, validated; garbage and refusals are "nothing". */
  const load = () => {
    if (loaded) return;
    loaded = true;
    const text = attempt((store) => store.getItem(STORAGE_KEY));
    if (typeof text !== "string") return;
    try {
      theme = validate(JSON.parse(text));
    } catch {
      theme = null;
    }
    kept = theme !== null;
  };

  const currentPreset = () =>
    preset ??
    (root.classList.contains(EDITORIAL_CLASS) ? "editorial" : "material");
  const currentFallback = () =>
    fallback ??
    (root.classList.contains(EDITORIAL_CLASS) ? "editorial" : "material");

  const rules = () => {
    if (!sheet) {
      const view = document.defaultView ?? window;
      sheet = new view.CSSStyleSheet();
      sheet.insertRule(`${LIGHT_SELECTOR} {}`, 0);
      sheet.insertRule(`${DARK_SELECTOR} {}`, 1);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }
    return [sheet.cssRules[0], sheet.cssRules[1]] as [CSSStyleRule, CSSStyleRule];
  };

  const fill = (rule: CSSStyleRule, ...maps: Record<string, string>[]) => {
    while (rule.style.length > 0) rule.style.removeProperty(rule.style.item(0));
    for (const map of maps) {
      for (const [name, value] of Object.entries(map)) {
        rule.style.setProperty(name, value);
      }
    }
  };

  const draw = () => {
    const shown = currentPreset();
    const drawing = shown === HANDED && theme !== null;
    if (drawing && theme) {
      const [light, dark] = rules();
      fill(light, theme.light, theme.root);
      fill(dark, theme.dark);
    } else if (sheet) {
      const [light, dark] = rules();
      fill(light);
      fill(dark);
    }
    root.classList.toggle(HANDED_CLASS, drawing);
    // The Editorial preset carries component rules of its own, so it is off
    // while a handed theme draws.
    root.classList.toggle(
      EDITORIAL_CLASS,
      (drawing ? null : shown === HANDED ? currentFallback() : shown) ===
        "editorial",
    );
    if (
      state.theme !== theme ||
      state.drawing !== drawing ||
      state.kept !== kept
    ) {
      state = { theme, drawing, kept };
      listeners.forEach((listener) => listener());
    }
  };

  return {
    /** The Preset the toolbar shows. `handed` with nothing held draws the
        identity before it, and asks the toolbar to say so. */
    show(next: string) {
      if (next === HANDED) {
        load();
        if (!theme) {
          preset = currentFallback();
          draw();
          requestPreset?.(preset);
          return;
        }
        fallback = currentFallback();
      } else fallback = next;
      preset = next;
      draw();
    },

    /** `show`, from the page: the toolbar is asked to follow. */
    choose(next: string) {
      this.show(next);
      requestPreset?.(currentPreset());
    },

    /** The identity shown when no handed theme draws. */
    identity: () => currentFallback(),

    /** Draws a theme the reader returned, and keeps it if storage allows. */
    hand(next: HandedTheme) {
      const clean = validate(next);
      if (!clean) return;
      fallback = currentFallback();
      theme = clean;
      loaded = true;
      kept =
        attempt((store) => {
          store.setItem(STORAGE_KEY, JSON.stringify(clean));
          return true;
        }) === true;
      preset = HANDED;
      draw();
      requestPreset?.(HANDED);
    },

    /** Drops the held theme, here and in storage, and draws the identity
        that was shown before it. */
    forget() {
      const back = currentFallback();
      attempt((store) => store.removeItem(STORAGE_KEY));
      theme = null;
      loaded = true;
      kept = false;
      if (currentPreset() === HANDED) {
        preset = back;
        requestPreset?.(back);
      }
      draw();
    },

    /** Whether a usable theme is held or stored. */
    holds() {
      load();
      return theme !== null;
    },

    getState: () => state,

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /** How the controller moves the toolbar's Preset (`preview.ts` sets it). */
    onPresetRequest(request: ((preset: string) => void) | null) {
      requestPreset = request;
    },

    /** Stops drawing and lets go of the document; storage is left as it is. */
    dispose() {
      if (currentPreset() === HANDED) preset = currentFallback();
      theme = null;
      loaded = false;
      kept = false;
      draw();
      if (sheet) {
        const mine = sheet;
        document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
          (adopted) => adopted !== mine,
        );
        sheet = null;
      }
      preset = null;
      fallback = null;
    },
  };
}

/** The catalog's own: the real document, this browser's storage. */
export const handedTheme = createController({
  document,
  storage: () => window.localStorage,
});
