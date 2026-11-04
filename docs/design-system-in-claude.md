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
   an update of the kit.
6. **Design with it.**

Which plans have design systems, and where one is made, is on the same page.

