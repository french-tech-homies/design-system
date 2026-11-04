# What this kit is

A self-contained Material Design 3 component kit: MD3 design tokens, a styling
contract built on `tailwind-variants`, and ~45 components with accessible
behavior from React Aria — enough for a whole application shell, proved by a
fresh Vite app that builds one with **no Radix in its dependency tree**
(see [Install from the registry](installing.md#install-from-the-registry)). MIT licensed (`LICENSE`) — and the notice
travels with the code: every registry item ships it, so an installed copy has
the terms beside it.

**Material 3's implementation.** The kit builds what Material 3's
specification (m3.material.io) describes, on React Aria and Tailwind, and each
of those components cites its page of the specification in its doc comment.

**One kit per design system.** This kit is Material 3's and no other's.
Another design system would be a kit of its own beside this one, in the same
repository and the same registry, with its own components, tokens and spec.
There is none today, and nothing here is built for one.

**Which components are its own.** Those Material 3's specification describes,
and a named group of eleven the kit ships that Material does not describe. They are listed on the front page,
[The kit's own](../README.md#the-kits-own), each with what it is and its page
of the catalog.

The group is named there and nowhere else, and it joins on need: a React Aria
component that Material 3 does not describe joins it when a project needs it,
by a change to that list that names that project and its need. A member is
Material-derived. It is built on Material's foundations (the colour roles, the
type scale, shape, state layers, motion, the 48dp target, the accessibility
rules), its anatomy is borrowed from the nearest Material component, and its
doc comment says "Material 3 does not describe this component." and cites,
beside it, the m3.material.io page of each thing it borrows. It is reviewed
as `ds-spec` reviews the kit's components: against that doc comment and the
pages it cites. `npm run registry:check-install`
(`scripts/check-components.mjs`) refuses a list and files that differ, and any
component file that neither says so nor cites a page of m3.material.io.

A part that neither Material nor React Aria describes is a project's: it is
written in the project, beside the kit, and does not come here. So is a React
Aria component no project has yet asked the kit for.

**What a project may change.** An edit of a kit file is allowed, priced and
rarely needed: an update overwrites every kit file that differs, and the
project puts its edit back by hand. That rule is stated once, in
`skills/ds-build/SKILL.md`, "What a project may change", because the skill
is what travels to a project and this file does not.

## Copy or npm package? — the decision

**The registry is the only supported distribution. There is no npm package,
and adding one is not planned.**

This repository has a `package.json` only to run its own catalog, tests and
registry build. It is `"private": true`, has no `exports` map and no build
step, and ships `.ts`/`.tsx` source: it is not something to `npm install`.

**Why copy-distribution is the right primary.** The files land in your tree,
so the edit a real product sometimes needs (a style module's anatomy, see
[Retheming — the three layers](theming.md#retheming--the-three-layers): MD3 anatomy is opinionated) is an edit
of one file, put back by hand at each update. A package would make the same
move a fork of the whole package, which is worse. Copy-distribution also
means no runtime
dependency on us, no version-range solving against your React Aria, and no
build output to keep in sync with your bundler.

**When to revisit.** Publish only if a consumer should *not* be able to edit a
kit file —
a design system enforced across teams, where drift is the thing you are trying
to prevent. If that day comes, **pick one authoritative channel and say so in
the README**; shipping both a registry and a package without naming which is
canonical guarantees two versions of the same component in one codebase.

## Not included

Nothing Material 3 describes: the kit builds every component on its list.
When Material adds one, an app that needs it before the kit does writes it in
its own tree, beside the kit, on a headless component; the token and styling
contracts of [conventions.md](../conventions.md) are what make it match. One
added to the kit itself cites its Material page and clears that file's
[quality bar](../conventions.md#the-quality-bar--what-a-new-component-must-ship).

What Material 3 does not describe is not waiting to be included. A React Aria
component of that kind joins the kit's own group when a project needs it,
Material-derived, by the rule the README writes in
[The kit's own](../README.md#the-kits-own). Until then, and for what neither
Material nor React Aria describes, it is a project's.
