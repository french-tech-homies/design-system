## Pipao MD3 — how to build with this kit

Material Design 3 components (React Aria Components underneath) styled with
Tailwind utilities named after Material **roles**. No provider or theme
wrapper is needed: link `styles.css`, load `_ds_bundle.js`, render from
`window.PipaoMD3.*`. Everything renders the light scheme; every color, type,
shape and elevation utility below is compiled into `_ds_bundle.css`.

### Styling idiom — role utilities, never hex or palette classes

| Family | Utilities (real names) |
|---|---|
| Color | `bg-<role>`, `text-<role>`, `border-<role>`, `ring-<role>` for all 49 roles: `primary`, `on-primary`, `primary-container`, `on-primary-container`, `secondary`, `secondary-container`, `on-secondary-container`, `tertiary`, `tertiary-container`, `error`, `error-container`, `on-error-container`, `surface`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `inverse-surface`, `inverse-on-surface`, `scrim` … (`tokens/theme.css` lists every `--md-sys-color-<role>`) |
| Type | `text-display-{large,medium,small}`, `text-headline-*`, `text-title-*`, `text-body-*`, `text-label-*` — each sets size, line-height, tracking and weight; do not add `text-sm`/`font-bold` on top. The face is `font-brand` (display/headline/title) or `font-plain` (body/label), which the `Display`/`Headline`/`Title`/`Body`/`Label` components apply for you |
| Shape | `rounded-shape-{extra-small,small,medium,large,extra-large,full}` = 4/8/12/16/28px/pill |
| Elevation | `shadow-elevation-{1…5}` |
| Motion | `duration-short-{1…4}`, `duration-medium-*`, `duration-long-*`, `ease-standard`, `ease-emphasized`, `ease-emphasized-decelerate` (enter), `ease-emphasized-accelerate` (exit) |
| State | hover `state-opacity-hover` (8 %), focus `state-opacity-focus` / press `state-opacity-pressed` (10 %), drag `state-opacity-dragged` (16 %), disabled content `opacity-38`; disabled containers `bg-on-surface/12` |

Rules the kit follows and you must too:

- A `bg-<role>` always pairs with its `text-on-<role>` (or `text-on-<role>-container`): `bg-primary text-on-primary`, `bg-secondary-container text-on-secondary-container`, `bg-surface-container-low text-on-surface`.
- Depth comes from surface **tiers**, not borders or shadows: page = `bg-surface`, sections/cards = `bg-surface-container-low` → `-high` for emphasis, dialogs/sheets = `bg-surface-container-high`. Hairlines are `border-outline-variant`.
- Type roles carry hierarchy: `text-headline-small` page titles, `text-title-medium` card titles, `text-body-medium` copy, `text-label-large` buttons/tabs. Prefer the `Display`/`Headline`/`Title`/`Body`/`Label` components (props `size="large|medium|small"`, `component="h1"`).
- Components own their shape: buttons `full`, chips `small`, cards `medium`/`large`, dialogs `extra-large`. Don't override component internals — compose with them and style only your layout glue.
- Layout glue is ordinary Tailwind (`flex`, `grid grid-cols-2`, `gap-4`, `p-6`, `w-full`, `max-w-md`); the compiled CSS carries the common ones. If a layout utility has no effect, use an inline `style` for that one property — never for color, type, shape or elevation.
- Never use shadcn variables (`--card`, `--muted`) or Tailwind palette colors (`bg-blue-500`, `text-gray-600`): they are not the design system.

### Where the truth lives

- `styles.css` → `_ds_bundle.css` (every utility above, compiled) and `tokens/theme.css` (the 49 color roles as `--md-sys-color-*`).
- `guidelines/conventions.md` — the kit's full conventions (state layers, anatomy, spec review).
- `components/<group>/<Name>/<Name>.prompt.md` — props and variants per component; `<Name>.d.ts` is the exact API. Interactive props follow React Aria naming: `onPress` (not `onClick`), `isDisabled`, `isSelected`, `isInvalid`, `selectedKey`/`onSelectionChange`.

### Idiomatic build snippet

```jsx
const { Button, TextField, Card, CardContent, Title, Body } = window.PipaoMD3;

function NewMenuCard() {
  return (
    <section className="bg-surface p-6">
      <Card variant="filled" className="w-full max-w-md">
        <CardContent
          headline="Create a menu"
          supportingText="Menus group products by service hours."
          actions={
            <div className="flex justify-end gap-2">
              <Button variant="text">Cancel</Button>
              <Button variant="filled">Create</Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 [--md3-field-notch:var(--md-sys-color-surface-container-highest)]">
            <TextField label="Name" supportingText="Shown to customers" isRequired />
            <TextField label="Description" multiline />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
```

`--md3-field-notch` paints the outlined label's notch: set it on any ancestor
whose background is not `surface` (here the filled card's `surface-container-highest`).
