/* The types of design-md.mjs, for the TypeScript that imports it (the
   catalog's `MD3/Your theme` page). The module itself stays plain JavaScript,
   run through `tsx`; this declares only what is imported from it. */

/** A DESIGN.md the kit refuses; the message names the token at fault. */
export class DesignMdError extends Error {}

export type DesignMdWarning = {
  kind: string;
  token: string;
  message: string;
};

/** DESIGN.md text + the current theme.v4.css text → the three generated
    files and what the kit could not apply. Throws `DesignMdError` on a file
    it refuses. */
export function generateTheme(
  designMd: string,
  v4Css: string,
): {
  theme: {
    front: Record<string, unknown>;
    reference: { darkMode: "class" | "system" };
  };
  themeCss: string;
  themeV4Css: string;
  resolvedDesignMd: string;
  warnings: DesignMdWarning[];
};
