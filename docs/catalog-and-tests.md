# The catalog and the tests

## Catalog

Hosted at **`https://french-tech-homies.github.io/design-system/`**, published
at each release by `.github/workflows/pages.yml`. That is the kit's
documentation: every component with its variants, plus the Foundations pages
(colour, typography, shape & elevation, motion, interaction states) rendered
straight from `tokens/resolved.json`.

`npm run storybook` opens the component catalog, organised the way
m3.material.io is — `MD3/Foundations` (color, typography, shape & elevation,
motion, interaction states — rendered from `tokens/resolved.json`), then
`Actions`, `Communication`, `Containment`, `Navigation`, `Selection`. Every
component story shows at least three variants; stories live in
`stories/`. CI (`.github/workflows/checks.yml`) builds the
catalog and fails if `resolved.json` is stale. `conventions.md` is the
contract new components follow.

### Your project's theme in the catalog

A project that took the kit from the registry has the components and the
generator, and no Storybook. The catalog is where it sees every story under
its own theme: open the page **`MD3/Your theme`**
(`https://french-tech-homies.github.io/design-system/?path=/story/md3-your-theme--page`,
or `npm run storybook` in this repository) and hand it what the project
generated, by the file picker or by dropping the files on the page:

- **`theme/theme.css` and `theme/theme.v4.css` together**, the two files the
  project's entry CSS imports, or
- **the project's `DESIGN.md` alone**: the catalog runs `tokens/design-md.mjs`
  in the browser, the module the project's own command runs, and lists its
  warnings on the page.

Every story then draws under that theme, in light and in dark, across stories
and reloads. The toolbar's **Preset** reads "Your theme (handed)" while it
does, so a picture of the catalog is not taken for the kit's default. Preset →
Material puts the default back and keeps the theme; "Forget this theme" on the
page drops it.

**Nothing is uploaded.** The files are read in the browser and kept in that
browser's `localStorage`, nowhere else. A handed file is never inserted into
the page: it is parsed in a stylesheet that styles nothing, and only custom
properties under the theme's own names (`--md-sys-color-*`, the type, corner,
elevation, state and motion scales, `--md3-duration-*`, the `--font-*` hooks)
are set, one by one. A value that names an address (`url(…)`, an `@import`) is
left out and listed on the page, so no file can make the catalog fetch
anything or restyle anything but the theme.

What a handed theme does not move, said on the page too:

- **Fonts.** The catalog loads Inter and fetches no face by a name read from
  a file. A family the theme names draws if the machine has it installed,
  otherwise the stack behind it does.
- **The dark switch.** A handed theme obeys the toolbar's Theme switch,
  whether its DESIGN.md chose `class` or `system`.
- **Hand edits to `theme.v4.css` outside its `--md-sys-*` and
  `--md3-duration-*` values** (a Tailwind namespace mapping, an `@utility`
  block): the catalog's utilities were compiled when it was built.
- **`MD3/Foundations`**, which documents the shipped theme from
  `tokens/resolved.json`, and the **Editorial preset**, which is off while a
  handed theme draws.

A DESIGN.md in the format's own words is drawn too: one with no `scheme` and
no `colors.seed`, which are the kit's keys and not the format's, and with the
format's short sizes (`title-md`, `rounded.sm`). The scheme is read from the
file's ground (`colors.background`, else `colors.surface`) and the seed from
`colors.primary`; the page lists each as assumed, with the token it was read
from, beside what it ignored. A file with neither a ground nor a primary is
still refused, in words that say what to write.

`theme.css` or `theme.v4.css` alone is refused, in words that say to hand
both: half a theme under the name "Your theme" would mislead. The machinery
is `.storybook/handed-theme/`; its tests are the hidden stories of
`stories/YourTheme.stories.tsx`.

## Tests — every story is one

```bash
npm run test-storybook                        # both presets
npm run test-storybook -- --project=editorial # just the preset
npm run test-storybook:watch                  # while working
```

Vitest renders every story in a real Chromium (Playwright), runs its `play`
function where it has one, and runs **axe** over the result. It does this
twice — once under the shipped Material tokens and once under
`tokens/preset-editorial.css` — because a component that is only accessible
under one palette is not accessible. CI runs the same command; a regression
fails the build.

Behaviour tests live in `stories/interactions/` (`MD3/Interactions/*`),
apart from the visual catalog, and assert the **keyboard** path: Space
toggles, arrows move, Enter commits, Escape closes and returns focus. The bar
a new component has to clear is in `conventions.md`, "The quality bar".

One axe rule is switched off, on two stories, with the reason next to it: MD3's
disabled content is `on-surface` at 38 % and never reaches 4.5:1 (WCAG 1.4.3
exempts inactive components) — `InteractionStates/Disabled` and
`ImageField/Disabled`. Nothing is disabled globally.

Running the tests the first time downloads a Chromium build:
`npx playwright install chromium`.

### Screenshots — every story has a baseline

```bash
npm run screenshots                                          # compare, as CI does (Docker)
npm run screenshots:update -- stories/actions/Button.stories.tsx  # re-baseline what changed on purpose
```

After a story has played and passed axe, its page is compared to
`screenshots/<preset>/<story-id>.<theme>.png`, in light and in dark, under
both presets: four committed pictures a story. A baseline cannot tell right
from wrong, only changed from unchanged: a part repainted by accident fails
its pull request with that story's diff, and whether a change is right stays
a person's look in the catalog.

The pictures are made and compared in one place, the Playwright image for the
version `package.json` pins (`mcr.microsoft.com/playwright:v<version>-noble`):
CI runs in it, and `npm run screenshots` runs the story tests in it through
Docker, with whatever Vitest arguments follow `--`. A plain
`npm run test-storybook` compares no pictures, since a machine's own fonts
and rendering would make every one differ. What moves is held still: the page
is drawn under `prefers-reduced-motion: reduce` with Playwright finishing any
animation, a photograph from another site is drawn as one fixed image, and the
catalog serves its typefaces itself (`.storybook/fonts.css`). A story that
still cannot be drawn the same way twice is left out with the tag
`no-screenshot` and its reason in `parameters.screenshot.reason`.

When a comparison fails, CI keeps the expected, actual and diff images in the
run's `screenshots` artifact and lists the stories in its summary. Without
Docker, a picture there that was changed on purpose becomes the baseline as it
is: `<name>-actual.png` (or `-reference.png`, for a new story) renamed to
`screenshots/<preset>/<name>.png`. CI also fails on a picture whose story is
gone (`scripts/check-screenshots.mjs`).

