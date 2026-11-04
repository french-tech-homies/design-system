/* =============================================================================
   The range of every npm dependency the registry names

   `shadcn add` installs what registry.json names, as it names it: a bare
   name is its latest version, whatever major that is. So every dependency
   of every item is written `name@range`, the range the kit is built and
   tested on. scripts/build-registry.mjs writes it from here, and
   scripts/check-install.mjs refuses any other. No import: the build runs
   where no node_modules is installed.
   ========================================================================== */

/** The range of a package the registry names and the kit's package.json
    does not hold, each with why it is that one. */
export const RANGES_OUTSIDE_PACKAGE = {
  // The animate-in / animate-out, fade, zoom and slide utilities the
  // overlays use, imported by the project's entry CSS. The catalog does not
  // load it, so no version is tested here: the range is the major a fresh
  // install took when ranges were first written (1.4.0, Nov 2026), which
  // keeps an install as it was and stops a next major landing unasked.
  "tw-animate-css": "^1.4.0",
};

/** The range the kit declares a package at, or undefined. */
export const kitRange = (pkg, name) =>
  pkg.devDependencies?.[name] ??
  pkg.dependencies?.[name] ??
  RANGES_OUTSIDE_PACKAGE[name];
