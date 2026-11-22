# Your project's design system in Claude

Claude can hold a design system, the colours, type, components and layout
it then applies when it designs: Anthropic's help page, linked below, says
what one is. A project that installed the kit has what one is built from,
in its own repository: the kit's components under `<ui>/ds/`, its `DESIGN.md`
and its generated theme.

**The design system is yours, built from your repository.** It carries your
look and the version of the kit you hold, and it changes when you choose. The
kit publishes no design system for others to build on and ships nothing that
produces one: a shared one would tie every project to the kit's updates, and
it would wear the kit's neutral look, not yours.

## What your design system is built from, and what the kit leaves to you

How a design system is made is Anthropic's to say (step 2 below). What the
kit can say is what it gives the one who makes it, an agent or a person, and
what it leaves to them. `<ui>/ds/` below is the kit's folder in your project.

- **From your project.** The components are `<ui>/ds/`, with `index.ts` as
  the entry every component is exported from; the version you hold is
  `RELEASE.json`'s `version` (`jq .version <ui>/ds/RELEASE.json`). The look
  is your generated theme, `theme/theme.css` and `theme/theme.v4.css`,
  generated from `DESIGN.md`, with every value filled in in
  `theme/DESIGN.resolved.md`, and the faces your entry CSS loads.
- **The kit's stories are not in your project.** The registry installs the
  parts, not their stories. They are in the kit's repository,
  `https://github.com/french-tech-homies/design-system`, at the tag of your
  release, `v<version>` (for 0.11.0, `v0.11.0`), for instance by
  `git clone --depth 1 --branch v0.11.0 https://github.com/french-tech-homies/design-system`.
  Each is `stories/<category>/<Component>.stories.tsx`, titled
  `MD3/<Category>/<Component>`, and imports the kit as
  `@french-tech-homies/design-system/<path>`, which is `<ui>/ds/<path>` in
  your project (`…/components/Button` is `<ui>/ds/components/Button.tsx`).
  `stories/blocks/` shows the blocks, which the one install does not bring,
  and `stories/interactions/` holds behaviour tests, not cards.
- **The guideline text is the doc comment** over each component that
  `<ui>/ds/index.ts` exports: the kit requires one on every component it
  exports.
- **The parts are written for React 19.** Some take `ref` as a prop: those
  that declare `ref` among their props. Where a design system runs its
  components under React 18, such a `ref` is not handed on unless something
  in between does it, and nothing says so: the part simply gets no ref.
- **Dark is switched one way, the one your `DESIGN.md` chose.** With
  `--md3-dark-mode: class` (or none), `theme/theme.css` writes the dark
  scheme under `.dark { … }`; with `system`, under
  `@media (prefers-color-scheme: dark) { :root { … } }`. It never writes
  both. A design system that switches dark by a class or an attribute of
  its own needs those selectors rewritten to match it, in its own copy of
  the CSS, never in `theme/`.
- **The elevation values are written for Tailwind.** Unless your
  `DESIGN.md` writes its own elevations (its `## Reference CSS`),
  `theme/theme.v4.css` writes each of `--md-sys-elevation-1` to `-5` as two
  shadows, a key one whose colour is
  `--alpha(var(--md-sys-color-shadow) / 30%)` and an ambient one at `15%`:
  `--alpha()` is a function only Tailwind reads, and your own elevations
  may use it too. Tailwind compiles `--alpha(X / N%)` to
  `color-mix(in oklab, X N%, transparent)`: write that where the values are
  read without Tailwind.
- **Your own stories become your cards.** A `*.stories.tsx` of your project,
  of your own components or of pages built from the kit, is drawn like the
  kit's.

The flow, in order:

1. **Install the kit** ([Install from the registry](installing.md#install-from-the-registry))
   and generate your theme from your `DESIGN.md`
   ([The theme comes from DESIGN.md](theming.md#the-theme-comes-from-designmd)).
2. **Have Claude build a design system from your repository.** How it is
   created is Anthropic's to say, and it moves: follow
   [Set up your design system](https://support.claude.com/en/articles/14604397) on Anthropic's help centre, taking the
   route it gives for a design system that lives in code.
3. **Explore a look** with Claude, on a canvas drawn with your real
   components.
4. **Write the look you keep into `DESIGN.md`** and generate the theme. The
   `ds-theme` skill does this with your agent. `DESIGN.md` stays the one
   source: a look that lives only in Claude is lost at the next generation.
5. **Update the design system** from your repository, as the same page says,
   so that it draws what your project now ships. Do the same after you take
   an update of the kit, reading the kit's stories at the new release's tag.
6. **Design with it.**

Which plans have design systems, and where one is made, is on the same page.

