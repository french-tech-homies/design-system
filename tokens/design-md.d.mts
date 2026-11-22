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

/** Material's component tokens a DESIGN.md may point at another colour
    role, by variable name, each with its default role (the spec's, except
    the switch's selected icon: the kit's `on-primary-container`) and the
    component that reads it. */
export const COMPONENT_TOKENS: Record<
  string,
  { component: string; role: string }
>;

/** DESIGN.md text + the current theme.v4.css text → the three generated
    files and what the kit could not apply. Throws `DesignMdError` on a file
    it refuses. */
export function generateTheme(
  designMd: string,
  v4Css: string,
): {
  theme: {
    front: Record<string, unknown>;
    reference: {
      darkMode: "class" | "system";
      /** The component tokens the file writes, name → `var(--md-sys-color-<role>)`. */
      components: Record<string, string>;
    };
  };
  themeCss: string;
  themeV4Css: string;
  resolvedDesignMd: string;
  warnings: DesignMdWarning[];
};
