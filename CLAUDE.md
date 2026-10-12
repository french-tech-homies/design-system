# CLAUDE.md

Guidance for an agent working in this repository.

## What this repository is

The MD3 kit: Material Design 3 components on React Aria Components and
Tailwind CSS 4, with a `DESIGN.md` at its centre. MIT, copyright
french-tech-homies.
What the kit is, and which components are its own, is said once: `README.md`,
"What this kit is".

- **This repository is the kit's source.** The kit is changed here, and
  nowhere else.
- **The registry is the only distribution.** There is no npm package:
  `package.json` is `private` and exists to run the catalog, the tests and the
  registry build. A project installs with `npx shadcn add @ds/ds` and the
  files land under its `<ui>/ds/`, with the DESIGN.md generator and three
  skills in its `.claude/skills/`.
- **Served from GitHub Pages**: the Storybook catalog at the site root and the
  registry at `/r/{name}.json`, published by `.github/workflows/pages.yml`
  after `.github/workflows/checks.yml` passed on the same commit.
- **Only a release publishes**, to every project that installs the kit: a
  push to `main` that moves the version in every place a release writes it.
  Any other merge is checked whole and publishes nothing. The rule is said
  once: `README.md`, "Publishing this repository".

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
- `scripts/`: the registry build and its four rule checks, the publish
  decision (`decide-publish.mjs`) among them.
- `changed.mjs`: what a project runs before an update, to list the kit files
  it changed since it installed them.
- `spec-version.json`: the m3.material.io version each component was last
  audited against, read by `npm run md3 -- check`.
- `registry.json` and `RELEASE.json`: the generated registry index and
  release record, committed. `releases/<item>.json`: the generated record
  each item outside the one install carries (the adapters, the preset),
  committed. `r/`, the built items, is not committed.
- `.claude/settings.json`: the commands an agent may run here without being
  asked.
- `.claude/skills/`: the skills this repository's own agents load.
  `ds-spec` is a link to `skills/ds-spec`, never a copy. `react-aria` is
  Adobe's, with its record in `skills-lock.json`.
- `NOTICE` and `LICENSES/`: the credit for what is here and is not the
  kit's, and each such licence in full (`LICENSES/Apache-2.0.txt`).
- `.design-sync/`: carried untouched; not maintained here yet. Do not edit
  it and do not run it.

## Read first

`conventions.md` is the contract every component follows: tokens, anatomy,
interaction states, accessibility and the quality bar a new component has to
clear. `README.md` is what a consumer reads: install, update, retheming.
`CHANGELOG.md` records every change to the kit, with the entries that need
action from a consumer flagged.

## Commands

```bash
npm ci                          # install, from the lockfile
npm run storybook               # the catalog, on :6006
npm run lint && npm run typecheck
npm run theme:generate          # DESIGN.md → tokens/theme.css, theme.v4.css, DESIGN.resolved.md
npm run design:lint             # the format's linter on both DESIGN.md files
npm run theme:check             # the derivation's rule checks
npm run theme:resolve           # refresh tokens/resolved.json
npm run registry:build          # registry.json and RELEASE.json, then the items into r/
npm run registry:check-version  # every item carries package.json's version
npm run registry:check-install  # the one install is whole
npm run registry:publishes -- --event push --base <sha> --ref refs/heads/main  # would this push publish? Publishes nothing
npm run build-storybook
npx playwright install chromium # once
npm run test-storybook          # every story, rendered, played and axe-checked, under both presets
npm run md3 -- page <component> guidelines   # the live Material 3 spec
npx playwright screenshot <url> <file>       # a picture of one story (see "Seeing a story")
```

`build-storybook` and `test-storybook` each take several GB of memory. Run
them one at a time, in the foreground, and stop any server you started.

## Checks

The cheap checks take about half a minute together and no server. Run them
before a change is handed on, each typed as it is here, in this order:

```bash
npm run theme:generate
git diff --exit-code -- tokens/theme.css tokens/theme.v4.css tokens/DESIGN.resolved.md
npm run design:lint
npm run theme:check
npm run theme:resolve
git diff --exit-code -- tokens/resolved.json
npm run registry:build
git diff --exit-code -- registry.json RELEASE.json releases
npm run registry:check-version
npm run registry:check-install
npm run lint
npm run typecheck
```

The three `git diff --exit-code` lines are the stale checks: a generator
that leaves a difference means its output was not committed.

`npm run build-storybook` and `npm run test-storybook` are the heavy checks.
`.github/workflows/checks.yml` runs both, after the cheap ones, on every pull
request. Run one locally only where a change needs it to be trusted: one at a
time, in the foreground, never beside a running Storybook.

## Seeing a story

A changed story is looked at as a picture, from a Storybook you start and
stop yourself:

```bash
npm run storybook -- --ci --exact-port       # as a background command: keep what the harness gives for it
curl -s http://localhost:6006/index.json     # answers once it is up, and holds the story ids
npx playwright screenshot --viewport-size=640,360 \
  "--wait-for-selector=#storybook-root>*" \
  "http://localhost:6006/iframe.html?id=<story-id>&viewMode=story" <file>.png
# stop that background command, then:
curl -s http://localhost:6006/index.json     # no answer: the port is free
```

- **Start it as a background command of your harness**, and keep the handle
  the harness gives for it. Only a step that can start a background command
  takes pictures: today that is `implement`.
- **Stop it with the harness's own stop of that command.** At a terminal, a
  person keeps the pid (`$!`) and types `kill <pid>`. Never stop it by a
  name or a port pattern (`pkill`, `killall`, a `kill` of whatever listens on
  6006): port 6006 is one per machine, and another worktree's Storybook may
  be the one that answers.
- `<story-id>` is the story's id in `index.json`, such as
  `md3-actions-button--filled`.
- The other preset is `&globals=preset:editorial`, dark is
  `&globals=theme:dark`, and both are `&globals=preset:editorial;theme:dark`.
  Playwright's `--color-scheme dark` does not switch the kit's theme.
- `--exact-port` makes a second Storybook fail instead of answering on
  another port. It is the check at the next start: a start that fails says a
  Storybook was left running, yours or another worktree's.
- The picture goes outside the tree and is never committed.
- It is a picture, not an interaction: a hover, a focus or an open overlay is
  seen only where a story renders it. Behaviour is the story tests'.
- Stop the server before a heavy command runs and before you finish, and say
  that the port is free.

## Rules

- **A change lands as a branch and a pull request**, never as a push to
  `main`: every project that installs the kit receives what `main` holds at
  the next release, and a push that moves the version publishes at once.
- **No change touches the version.** A release is a change of its own:
  `npm version <minor|patch> --no-git-tag-version`, `npm run registry:build`,
  `npm run registry:check-version`, the CHANGELOG's heading, one commit.
- **Generated files are never edited by hand**: `tokens/theme.css`,
  `tokens/theme.v4.css`, `tokens/DESIGN.resolved.md`, `tokens/resolved.json`,
  `registry.json`, `RELEASE.json` and `releases/*.json`. Edit the source (`DESIGN.md`, the kit's
  files, `scripts/build-registry.mjs`), run the command, commit both. CI
  refuses a stale one. One exception: `tokens/theme.v4.css` is also the
  template the generator reads, and the generator sets the value of a
  declaration that exists and adds none. So a new declaration (a token, a
  mapping) is added to it by hand, at the value `DESIGN.md` gives; a value is
  never changed by hand, and `npm run theme:generate` must then leave the
  file as it is.
- **A skill's text is the kit's, read in any project.** It names kit files as
  `<kit>/…`, only files the install brings, and nothing of this repository.
  `npm run registry:check-install` holds all three.
- **Design tokens are role utilities** (`bg-primary`, `text-on-surface`,
  `text-title-medium`), never a hex value or a palette class. The CSS
  variables are Material's (`--md-sys-*`) and are not renamed.
- **Component work** starts from the spec and the primitives' docs: the
  `ds-spec` skill (`npm run md3 -- page <component> guidelines`, and the
  `overview`, `specs` and `accessibility` pages) and the React Aria
  Components documentation, read through the `react-aria` skill. Review a
  component against the four m3.material.io pages before calling it done.
- **Adobe's skill is never edited.** `.claude/skills/react-aria/` and
  `skills-lock.json` are what `npx skills add https://react-aria.adobe.com`
  wrote; they are refreshed only by `npx skills update`, in a change that
  holds nothing else. What is here and is not the kit's is credited in
  `NOTICE`, with its licence in `LICENSES/`.
- **Requirements**: React 19, Tailwind CSS 4.1 or later, React Aria
  Components. Do not widen or narrow a dependency range without saying why in
  the changelog.
- **Every change to the kit is in `CHANGELOG.md`**, under `[Unreleased]`:
  what a project receives, or how it is published. A change to this
  repository's own tooling alone has no entry.
- Commit messages say what changed and why, in plain words.
