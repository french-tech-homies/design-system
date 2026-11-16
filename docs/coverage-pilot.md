# The coverage pilot

Four screens of [the coverage corpus](coverage-corpus.md), one from each
kind of product, built once each on 2026-11-15 against the kit's release
0.6.0. It was run to test the corpus's protocol, and it is not the kit's
baseline: four screens, one run each.

Each run's log, as its builder wrote it, is in
[`coverage-pilot/`](coverage-pilot/). The logs use the kind `hand`, which
the corpus has since split into `control` and `layout`: the split below was
made afterwards, by reading each `hand` leave.

## What the pilot changed in the corpus

- **`hand` is two kinds.** As one kind it failed a hero for its hand-drawn
  placeholder picture and a card for the layout of its insides. A control the
  kit lacks is a gap, and a layout is not.
- **A slot is not a part.** The checkout's slot for payment fields was
  counted as one of its six parts. It has five.
- **A leave the log does not hold still counts.** The file browser's drag
  and drop was logged with no gap, while React Aria warned, at every row,
  that a draggable item of a `GridList` needs a drag handle the kit's item
  does not have.

## The figure

A part is the kit's when it was built with no `component`, `feature`,
`control` or `edit` leave.

| Screen       | Parts | The kit's | Left the kit for                                                                  |
| :----------- | ----: | --------: | :-------------------------------------------------------------------------------- |
| Data table   |     8 |         5 | The row menu's disabled and destructive items, the pager, resizing a column       |
| Checkout     |     5 |         2 | The steps, free text in the street's combo box, the day as tiles                  |
| File browser |     7 |         1 | The tree, the virtualized items, the drag handle, the context menu, breadcrumbs, the drop zone |
| Landing page |     6 |         2 | The header, the carousel of quotes, the footer's links, type that steps with the width |
| **All four** | **26** | **10**   |                                                                                   |

Ten parts of twenty-six, 38%, where the corpus aims at 95%. Every part of
every screen worked when it was opened and worked by keyboard, and no run
edited a kit file.

Each part, and what decided it:

| Screen       | Part                                    | The kit's | What decided it                                                                 |
| :----------- | :-------------------------------------- | :-------- | :------------------------------------------------------------------------------ |
| Data table   | Sortable columns                        | Yes       | `Table`'s own sorting                                                           |
|              | Search                                  | Yes       | `SearchBar`                                                                     |
|              | Filter chips                            | Yes       | `ChipGroup`, `Chip`                                                             |
|              | Multiple selection, a bulk-action bar   | Yes       | `Table`'s selection and `Toolbar`; the bar's place on the page is layout        |
|              | A row's menu                            | No        | `feature`: `Menu` has no disabled, destructive or selected item                 |
|              | Paging                                  | No        | `control`: a pager written by hand                                              |
|              | Resizable columns                       | No        | `component`: `ResizableTableContainer`, `ColumnResizer`                         |
|              | Empty, loading, error                   | Yes       | `EmptyState`, `LoadingIndicator`; drawn in the table's place, which is layout   |
| Checkout     | Steps                                   | No        | `control`: a stepper written by hand                                            |
|              | An address form with autocomplete       | No        | `feature`: the adapter's `FormComboBox` holds a key, not the text typed         |
|              | A choice of payment by radio            | Yes       | `RadioGroup`, `Radio`                                                           |
|              | A delivery day and time                 | No        | `component`: React Aria's `RadioGroup` for the day's tiles; the time is the kit's |
|              | An order summary                        | Yes       | `Disclosure`, `Card`, `Divider`; the lines are layout                           |
| File browser | A folder tree                           | No        | `component`: `Tree`                                                             |
|              | A grid and a list, toggled              | No        | `component`: `Virtualizer`; `control`: the list's row, since `ListItem` does not cut a long name |
|              | Multiple selection                      | Yes       | `GridList`'s own selection                                                      |
|              | Moving by drag and drop                 | No        | `feature`: `GridListItem` has no drag handle; the tree is React Aria's          |
|              | A context menu                          | No        | `component`: `Popover`, `Menu`; `control`: its trigger                          |
|              | Breadcrumbs                             | No        | `component`: `Breadcrumbs`, `Link`                                              |
|              | Upload by dropping files                | No        | `component`: `DropZone`, `FileTrigger`                                          |
| Landing page | A header of links that folds to a menu  | No        | `control`: the header; `component`: `Link`                                      |
|              | A hero with two actions                 | Yes       | `Display`, `Body`, `Button`; the placeholder picture is layout                  |
|              | Feature cards                           | Yes       | `Card`; its insides are layout                                                  |
|              | A carousel of quotes                    | No        | `control`: `Carousel` takes only items that are pressed, at one height          |
|              | A footer of link columns                | No        | `component`: `Link`                                                             |
|              | Display type at each width              | No        | `feature`: the type primitives have no size that steps with the width           |

Beside the figure, over the four runs: the kit's source was read past a doc
comment 36 times, a value was written where a role utility should be 8
times, a prop was guessed wrong 3 times, and a hook was used with no word of
it in the skills twice.

## What the kit lacks

Components, each seen as an import from `react-aria-components` in a run, or
as a control written by hand:

- a text link (two screens), which the kit uses inside eight of its files
  and does not offer;
- breadcrumbs, a tree, a pager, a stepper, a context menu;
- a carousel of content that is read and not pressed;
- a header for a public page;
- a radio drawn as a tile;
- `Popover`, `DropZone` and `FileTrigger`, used inside the kit and not
  offered.

Features, each checked in the kit's source after the runs:

- `Menu` takes a flat list of items: none disabled, selected or
  destructive, and no sections;
- `MenuItem` declares `isFocused` and `isHovered` and uses neither;
- `GridListItem` has no drag handle;
- `Table` has no resizing of a column;
- `Dialog`'s doc comment says children go "under the headline", and
  `DialogContent` renders them in the headline's place.

Reported by a builder and not checked since:

- with the React Router adapter mounted, a link to `#section` on the same
  page no longer scrolls to it;
- the adapter's `FormComboBox` holds the chosen key, so it cannot hold free
  text;
- `ListItem` does not cut a long name, and `EmptyState` draws a bordered box
  of its own.

What the kit says of itself:

- most of the 36 reads looked for a component's props, or for what `Card`
  does to its insides: a doc comment does not list them;
- the skills do not name `useDragAndDrop`, `Virtualizer`, or
  `validationBehavior="aria"` beside react-hook-form;
- every screen's page layout was written by hand.

## The install

`npx shadcn init @ds/base` left an entry CSS that did not build: "Cannot
apply unknown utility class `border-border`". The cause is not a fault of
the kit's items: the theme was not imported yet, and the file builds as
`init` wrote it once the two theme lines of
[Install from the registry](installing.md#install-from-the-registry) are
added. The install page said such a project is unthemed, where it does not
build.

## What the runs did not hold to

- No builder opened a browser: each built to a passing `npm run build`, and
  the keyboard pass came after, by another hand.
- `ds-spec` did not run: it reads m3.material.io, and the builders had no
  network.
- Three builders read or wrote a file outside their project once each, by
  their own report.
- Not worked in the pass: a long press on a touch screen, a file dropped from
  the computer, a drop onto a folder in the items view, React Aria's own
  keyboard drag. Dark was measured on all four screens and looked at on one.
