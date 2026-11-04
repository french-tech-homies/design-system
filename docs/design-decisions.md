# Design decisions worth knowing

- **No ripple.** MD3's press ripple is approximated by the state-layer opacity
  alone. Deliberate: it keeps every control free of JS animation.
- **No animation library.** Modal, ModalDialog, the modal SideSheet and the
  modal BottomSheet animate through React Aria's `data-entering` /
  `data-exiting` states plus `tw-animate-css`; the standard SideSheet
  collapses via a `grid-template-columns: 1fr → 0fr` transition, and the
  standard BottomSheet slides on a `transform` transition. Render them
  unconditionally and drive with `isOpen` — React Aria keeps the element
  mounted through the exit. ProgressIndicator and LoadingIndicator carry their
  keyframes in a `<style>` of their own.
- **Snackbars are a global queue, not a hook.** `snackbar(text, options)`
  works from any module (a mutation callback, a store); `<SnackbarRegion />`
  renders once per layout. One snackbar at a time, the newest replacing the
  one on screen, exactly as the spec's "consecutive snackbars" rule asks —
  there is no stacking option on purpose.
- **Card interaction states** come from a parent `GridListItem`
  (`group/grid-list-item`). Use `Card`/`ListItem` inside `GridList` when you want
  hover/press feedback.
- **A card is a container, and its root takes what places it and names it**:
  the element (`component`: `div`, `section`, `article` or `li`), `ref`, `id`,
  `role`, `style`, every `aria-*` and `data-*` attribute. It refuses every
  event handler and `tabIndex`, at the type: Material's directly actionable
  card, with its ripple, focus indicator and tab stop, is not built. Its parts
  are listed in its doc comment.
- **A tooltip is Material's: no arrow, plain above its trigger, rich below it
  from the start edge.** `showArrow` draws the arrow, `placement` takes a side
  or a corner (`"bottom start"`, `"top end"`), `variant` is honoured when
  given. A trigger that is no button is wrapped in `Focusable`, exported
  beside `Tooltip`, and must take focus itself.
- **A rich tooltip takes any content that is only read**: a headline, a
  supporting text, then children such as rows of label and value (a `<dl>`),
  a short list, an icon or a figure. It takes nothing that is operated or
  takes focus (a link, a button, a field), because a tooltip never takes
  focus and closes when its trigger loses it. So Material's rich tooltip
  buttons and its persistent tooltip are not built.
- **`StateLayer` keys on `isFocusVisible`**, not `isFocused`, so a mouse click
  doesn't leave a control looking permanently highlighted. The CSS-driven
  state layers (`group-data-focus-visible/button:state-opacity-focus`) follow
  the same rule.
- **Focus indicator is MD3's**: a 3px `secondary` ring offset 2px
  (`focusRing` in `utils.ts`), not shadcn's 2px primary ring. It is an
  outline, and its gap is not painted: on a card, a table or a sheet it shows
  that surface, not the page's ground.
- **`data-slot` on every root** (`button`, `card`, `chip`, `state-layer`,
  `modal`, …) plus `data-variant` / `data-size` where a variant exists — the
  shadcn convention, so consumers can target parts without reaching into
  class names.
- **`Button` and the assist `Chip` become links with `href`** (React Aria
  `Link`, same anatomy and states, routed through the router provider), and
  `Menu` items take `href` too — there is no `asChild` / slot pattern in the
  kit. `Button color="error"` is the destructive button MD3 does not define.
- **`Table` follows M2's data-table measurements on M3 roles** — M3 has no
  data-table page — with React Aria's sorting and selection: 52dp rows under
  a 56dp header, and with `density="dense"` 40dp under 44dp, the kit's own
  pair.
- **`IconButton` has Material's five sizes and four colour styles, and is
  round.** `filled` is the default colour style, Material's. The square
  shape, the shape morphs, the narrow and wide widths and the tooltip on
  hover are not built.
- **`Button` carries Material's button model once**: five sizes (`xsmall`
  32px to `xlarge` 136px, `small` the default), round and square shapes with
  their pressed and selected corners, and toggles. `ButtonGroup`,
  `SplitButton` and the icon buttons in a group take their sizes, shapes and
  state layers from it. `SegmentedButton` is built, though Material no
  longer recommends it: for new work, `<ButtonGroup variant="connected">`.
- **There is no separate alert dialog.** MD3's dialogs page covers one
  component in two sizes; "alert" is a *use*, not a variant. So it is
  `<Dialog role="alertdialog">` — the ARIA role, plus `ModalDialog` turning
  light-dismiss off, because a click on the scrim must not answer a question
  that has to be answered. Escape still closes.
- **`PreviewTrigger` has no Material page either**, and neither does its
  category: a hover-opened card of arbitrary content is not in MD3. Use
  `Tooltip variant="rich"` — which *is* in the spec — when the content is
  only read; use `PreviewTrigger` when the reader operates it (a link, a
  button, a form). It opens on focus and on
  long press as well as on hover, so its trigger must be focusable.
- **`Disclosure` has no Material page.** M2 had an expansion panel; M3 dropped
  it and never replaced it, so `m3.material.io` has no accordion, disclosure or
  expansion-panel entry. The anatomy is assembled from MD3 parts — a 56dp list
  row with a state layer, `outline-variant` hairlines, the shape scale, MD3
  motion — the same way `Table` follows M2's data-table measurements on M3
  roles. The component's doc comment names every part it borrowed.
- **`Tag` and `Avatar` are not Material components.** MD3 has no static
  label pill (its badge, the kit's `Badge`, is the dot or count on an icon) and no standalone
  avatar; both exist because apps need them, drawn only in colour roles so
  they follow the palette. `Tag` is presentational — actions are chips.
- **A `Badge` can take a colour role, which Material's cannot.** Material
  draws every badge in `error`, and the default keeps it so. `color`
  (`primary`, `secondary`, `tertiary`, `error`, each on its own `on-` role, as
  `Meter` and `Tag` take theirs) is for a project whose colours carry their
  own meanings, where a count of what waits on the reader must not read as a
  failure. On the bar, the rail and the drawer, a destination's `badgeColor`
  carries it: `{ id: "runs", label: "Runs", icon: Play, badge: 3,
  badgeColor: "primary" }`. The drawer's count is its own label text and
  keeps its colour; only its dot takes the role.
- **One shell, three components.** `TopAppBar` titles the screen,
  `NavigationRail` runs down its leading edge in a medium or expanded window
  (collapsed at 96dp, expanded at 220dp — the spec's own two states) and
  `NavigationDrawer` is the full-height list, standard beside the content or
  modal over a scrim. All three are `<nav>`/`<header>` landmarks with
  `aria-current="page"`, never tab sets, and the app bar's title is a real
  heading. `BottomNavigation` stays the compact-window bar.
- **Server components**: `Typography`, `Card`, `ListItem`, `MenuItem`,
  `Tag`, `Badge`, `Divider`, `TopAppBar`, `EmptyState` and `DialogContent` render on the server; everything backed by
  React Aria carries `"use client"`. `react-aria-components` is marked
  `client-only`, so `utils.ts` deliberately does not import it — that is why
  `composeTailwindRenderProps` sits in `render-props.ts` instead. Keep it that
  way if you extend the kit, or `cn()` stops working in Server Components.

