# CLAUDE.md

Guidance for an agent working in this repository.

## What this repository is

The MD3 kit: Material Design 3 components on React Aria Components and
Tailwind CSS 4, with a `DESIGN.md` at its centre. MIT, copyright
french-tech-homies.
What the kit is, and which components are its own, is said once: `README.md`,
"What this kit is".

- **The registry is the only distribution.** There is no npm package:
  `package.json` is `private` and exists to run the catalog, the tests and the
  registry build. A project installs with `npx shadcn add @ds/ds` and the
  files land under its `<ui>/ds/`, with the DESIGN.md generator and three
  skills in its `.claude/skills/`.
- **Served from GitHub Pages**: the Storybook catalog at the site root and the
  registry at `/r/{name}.json`, published by `.github/workflows/pages.yml`
  after `.github/workflows/checks.yml` passed on the same commit.

## This tree is lifted

`LIFT.json` names the repository, the path and the commit this tree was
written from. **While that file exists, do not change the kit here**: the
next lift replaces every file but `.git`. Make the change at the source, and
lift again. When `LIFT.json` is deleted, this repository is the source and
the rest of this file is the whole rule.

## Layout

- `components/`, `primitives/`, `adapters/`, `icons.tsx`, `utils.ts`,
  `render-props.ts`, `index.ts`: the kit, as a project receives it. Imports
  between kit files are relative.
- `tokens/`: the theme (`theme.css`, `theme.v4.css`), the DESIGN.md
  derivation and generator (`design-md.mjs`, `generate-theme.mjs`), the
  shadcn bridge, the Editorial preset, the resolved snapshot.
- `DESIGN.md`: the kit's neutral default, the one hand-edited source of the
  theme.
- `stories/`: the catalog, titled `MD3/<Category>/<Component>`, and
  `stories/interactions/`, the behaviour tests. Every story is a test.
- `skills/`: what a project's agent reads (`ds-theme`, `ds-build`,
  `ds-spec`).
- `scripts/`: the registry build and its three rule checks.
- `registry.json`: the generated registry index, committed. `r/`, the built
  items, is not committed.
- `.design-sync/`: carried untouched from the source; not maintained here
  yet. Do not edit it and do not run it.

## Read first

`conventions.md` is the contract every component follows: tokens, anatomy,
interaction states, accessibility and the quality bar a new component has to
clear. `README.md` is what a consumer reads: install, update, retheming.
`CHANGELOG.md` records every change, with the entries that need action from
a consumer flagged.

## Commands

```bash
npm ci                          # install, from the lockfile
npm run storybook               # the catalog, on :6006
npm run lint && npm run typecheck
npm run theme:generate          # DESIGN.md → tokens/theme.css, theme.v4.css, DESIGN.resolved.md
npm run design:lint             # the format's linter on both DESIGN.md files
npm run theme:check             # the derivation's rule checks
npm run theme:resolve           # refresh tokens/resolved.json
npm run registry:build          # registry.json, then the items into r/
npm run registry:check-version  # every item carries package.json's version
npm run registry:check-install  # the one install is whole
npm run build-storybook
npx playwright install chromium # once
npm run test-storybook          # every story, rendered, played and axe-checked, under both presets
npm run md3 -- page <component> guidelines   # the live Material 3 spec
```

`build-storybook` and `test-storybook` each take several GB of memory. Run
them one at a time, in the foreground, and stop any server you started.

## Rules

- **Generated files are never edited by hand**: `tokens/theme.css`,
  `tokens/theme.v4.css`, `tokens/DESIGN.resolved.md`, `tokens/resolved.json`
  and `registry.json`. Edit the source (`DESIGN.md`, the kit's files,
  `scripts/build-registry.mjs`), run the command, commit both. CI refuses a
  stale one.
- **A skill's text is the kit's, read in any project.** It names kit files as
  `<kit>/…`, only files the install brings, and nothing of this repository.
  `npm run registry:check-install` holds all three.
- **Design tokens are role utilities** (`bg-primary`, `text-on-surface`,
  `text-title-medium`), never a hex value or a palette class. The CSS
  variables are Material's (`--md-sys-*`) and are not renamed.
- **Component work** starts from the spec and the primitives' docs: the
  `ds-spec` skill (`npm run md3 -- page <component> guidelines`, and the
  `overview`, `specs` and `accessibility` pages) and the React Aria
  Components documentation. Review a component against the four
  m3.material.io pages before calling it done.
- **Requirements**: React 19, Tailwind CSS 4.1 or later, React Aria
  Components. Do not widen or narrow a dependency range without saying why in
  the changelog.
- **Every change is in `CHANGELOG.md`**, under `[Unreleased]`. A release is
  `npm version`, `npm run registry:build`, `npm run registry:check-version`,
  one commit.
- Commit messages say what changed and why, in plain words.
