import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { useEffect, useGlobals } from "storybook/preview-api";

import { HANDED, handedTheme } from "./handed-theme/controller";
import "./storybook.css";

/**
 * Two independent toolbar switches:
 *
 * - **Theme** — the kit's own light / dark, keyed on `.dark`.
 * - **Preset** — the *identity*: the shipped Material tokens, the
 *   deliberately un-Material `preset-editorial` (`tokens/preset-editorial.css`),
 *   or the theme a person handed on the `MD3/Your theme` page. The three are
 *   exclusive, and `handed-theme/controller.ts` is what puts the one chosen
 *   on `<html>`.
 *
 * `@storybook/addon-themes` only supports one axis — every one of its
 * decorators reads the same `theme` global — so the preset gets its own
 * global and a four-line decorator rather than a second `withThemeByClassName`.
 * Both classes land on `<html>`, so `.dark.preset-editorial` resolves and all
 * four combinations render.
 */

/**
 * Injected by the `editorial` project in `vitest.config.ts`, so the whole
 * catalog runs its interaction tests and its axe pass under the preset.
 * Undefined in `storybook dev` and `storybook build`, where the toolbar picks.
 */
declare const __MD3_PRESET__: string | undefined;
const initialPreset =
  typeof __MD3_PRESET__ === "string"
    ? __MD3_PRESET__
    : // A theme handed earlier in this browser is drawn from the first story.
      handedTheme.holds()
      ? HANDED
      : "material";
// Before the first story renders, so a held theme does not flash the default.
handedTheme.show(initialPreset);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // axe runs against every story, in the browser, and a violation fails
    // `npm run test-storybook`. Accepted exceptions are
    // per-story `parameters.a11y.config.rules` with a written reason — never
    // a blanket disable here. See conventions.md, "The quality bar".
    a11y: { test: "error" },
  },
  globalTypes: {
    preset: {
      description: "Which identity the tokens draw",
      toolbar: {
        title: "Preset",
        icon: "paintbrush",
        items: [
          { value: "material", title: "Material (shipped)" },
          { value: "editorial", title: "Editorial (un-Material)" },
          // Its title is the mark, on every story, that what is drawn is a
          // project's theme and not the kit's.
          { value: HANDED, title: "Your theme (handed)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { preset: initialPreset },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story, context) => {
      const preset = context.globals.preset as string | undefined;
      const [, updateGlobals] = useGlobals();
      // A theme handed or forgotten on the page moves the toolbar with it.
      useEffect(() => {
        handedTheme.onPresetRequest((next) => updateGlobals({ preset: next }));
      }, [updateGlobals]);
      useEffect(() => {
        handedTheme.show(preset ?? "material");
      }, [preset]);
      return Story();
    },
  ],
};

export default preview;
