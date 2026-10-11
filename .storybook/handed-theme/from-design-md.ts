/// <reference path="./raw.d.ts" />
/* =============================================================================
   A DESIGN.md → its theme, in the browser

   The catalog runs the kit's own generator, `tokens/design-md.mjs`: the module
   a project runs through `tokens/generate-theme.mjs`, imported, not copied, so
   what is drawn here is what the project's command writes. The kit's
   `tokens/theme.v4.css` is the template, as it is for the command.

   Both are loaded on demand, so the colour library and the YAML parser are in
   a chunk of their own that a catalog nobody hands a DESIGN.md never fetches.
   What they return is text like any other handed file: it goes through the
   reader, never into the page.
   ========================================================================== */

import type { Generate } from "./read-theme";

export const generateFromDesignMd: Generate = async (designMd) => {
  const [{ generateTheme, DesignMdError }, { default: template }] =
    await Promise.all([
      import("../../tokens/design-md.mjs"),
      import("../../tokens/theme.v4.css?raw"),
    ]);
  try {
    const generated = generateTheme(designMd, template);
    const name: unknown = generated.theme.front.name;
    return {
      ok: true,
      name: typeof name === "string" ? name : "",
      themeCss: generated.themeCss,
      themeV4Css: generated.themeV4Css,
      warnings: generated.warnings.map((warning) => warning.message),
    };
  } catch (error) {
    // The generator's own refusal, in its own words.
    if (error instanceof DesignMdError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
};
