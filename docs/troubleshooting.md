# Troubleshooting

Both of these fail _silently_ — they were found the hard way while adopting the
kit in its first host app.

**`Cannot apply unknown utility class …`, or a theme that has no effect, or
animations that never play.** An `@import` is sitting below a `@source` or
`@custom-variant`. Vite drops it without a warning (PostCSS does
not, so the same CSS can build fine in one pipeline and fail in the other —
typically Next builds, Storybook doesn't). Move every `@import` to the top.

**Two `@custom-variant dark` rules after a registry install.** Expected, not a
bug: shadcn's React Aria base writes `@custom-variant dark (&:is(.dark *))` and
the MD3 `theme` item appends `@custom-variant dark (&:where(.dark, .dark *))`
below it. The later declaration wins, which is the one you want — `:is(.dark *)`
misses the `.dark` element itself. The same applies to the palette: the base's
`:root` block stays in the file above MD3's, and MD3's later block overrides it.

**Extra `bg-md-sys-color-*` utilities.** Also expected. The CLI mirrors every
`cssVars.light` key into `@theme inline` as `--color-<key>`, so the 49 MD3 role
variables each gain a redundant utility alongside the real `bg-primary` /
`text-on-surface` ones. Harmless; ignore them.

**`'client-only' cannot be imported from a Server Component`, pointing at
`utils.ts`.** Something added a `react-aria-components` import to `utils.ts`.
That module is imported by the server-renderable components (and often by the
host app's own `cn`), so it must stay free of `client-only` packages — that is
why `composeTailwindRenderProps` lives in `render-props.ts`. Put new
RAC-dependent helpers there, not in `utils.ts`.

