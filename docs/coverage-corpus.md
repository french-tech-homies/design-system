# The coverage corpus

Nothing links here yet and no rule cites it: the rule by which a component
joins the kit is still the one in [What this kit is](what-this-kit-is.md).
Four of the screens were run once, to test what this page asks:
[the pilot](coverage-pilot.md).

The kit aims to serve 95% of what a product's screens need, and to leave a
project only what is truly its own. This page is what that figure is counted
against: twenty-two screens, from four kinds of product, each a list of
parts. A screen is built from its brief in a fresh project, with the kit and
its three skills and nothing else, and every time the build leaves the kit is
written down.

## What a run is

1. A fresh Vite app, React 19 and Tailwind 4, with `npx shadcn add @ds/ds`
   and the adapters the screen names.
2. A fresh agent, given one screen's brief and its parts, the kit's skills
   (`ds-build`, `ds-spec`, `ds-theme`) and no other guidance. It does not see
   this repository, nor the column "Expected to strain" below.
3. It builds the screen, at a phone's width and a desktop's, in light and
   dark, and keeps a log of every leave.
4. The screen is opened in a browser and worked by keyboard. A part that
   does not work counts as a leave, whatever the log says, and so does a
   leave the log does not hold: an import, an edit or a value found in the
   run's diff, a warning React Aria prints.

## What a leave is

| Kind         | What happened                                                                 |
| :----------- | :---------------------------------------------------------------------------- |
| `component`  | A component imported from `react-aria-components` because the kit has none.   |
| `feature`    | A kit component lacked a prop or a behaviour React Aria's own has.            |
| `hook`       | A React Aria hook or utility used with no word of it in the skills.           |
| `control`    | A control written by hand, on plain elements, because the kit has none.       |
| `layout`     | A layout or a composition written by hand: a page, a grid, a card's insides.  |
| `edit`       | A kit file edited.                                                            |
| `value`      | A hex value, a palette class or a pixel size where a role utility should be.  |
| `guess`      | A prop, a slot or an import guessed wrong: a type error or a second attempt.  |
| `read`       | The kit's source read past a doc comment to learn how a component is used.    |

`component`, `feature`, `control` and `edit` are gaps in the kit. `layout`
is none: arranging the kit's parts is a project's work, and a layout that
many screens write alike is a registry block to offer. `hook`, `guess` and
`read` are gaps in what the kit says of itself, and `value` may be either. A
`hook` leave that the skills name, with when to use it, is no leave: hooks
are React Aria's and are imported from it. A hook that does a part's work
through a kit component counts for the kit only where that component needs
nothing more of the project: a handle, a slot or a style it lacks is a
`feature` leave.

## The figure

A screen's coverage is the share of its parts built with no `component`,
`feature`, `control` or `edit` leave. The corpus's coverage is that share over
all its parts, and the aim is 95%. The other kinds are counted beside it, a
screen, as the measure of how easily the kit is used.

What is a project's by nature is not a part and is never counted: charts,
maps, payment fields, and the product's own data and copy. A brief gives
such a thing a slot and no more, and the slot is not among the screen's
parts.

## The screens

"Expected to strain" is a guess from a search of the kit's files by name, not
a finding. The first run replaces it.

### Admin and back office

| #  | Screen             | Parts                                                                                                                                                              | Expected to strain                                   |
| :- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| 1  | Application shell  | Rail on desktop, drawer on tablet, bottom navigation on phone; top app bar; breadcrumbs; account menu; skip link and landmarks; routed links                        | Breadcrumbs, a link of its own, landmarks            |
| 2  | Data table         | Sortable columns; search; filter chips; multiple selection with a bulk-action bar; a row's menu; paging or loading more; resizable columns; empty, loading, error   | Loading more, column resizing, many rows             |
| 3  | Record form        | Text, select, combo box, date, number, phone, image, switch; validation on blur and on submit, from the server too; an error summary; a dialog on unsaved changes   | Server errors, the error summary                     |
| 4  | Dashboard          | Figure cards; meters and progress; a date-range filter; a period toggle; a slot for a chart; a list of recent activity; a state for each card while it loads        | Card layout, a placeholder while loading             |
| 5  | Settings           | Sections by tabs or by list and detail; switches; radio groups; a slider; a destructive action confirmed in a dialog; a snackbar on save                             | List and detail across widths                        |
| 6  | People and roles   | A table whose row opens a side sheet; an invitation dialog taking several email addresses; avatars; role tags; a role select                                       | Several values in one field (TokenField)             |

### Consumer, phone first

| #  | Screen             | Parts                                                                                                                                                              | Expected to strain                                   |
| :- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| 7  | Sign in and up     | Several steps with their progress; email and password with show and hide; a one-time code; consent checkbox with a link in its label; a provider button             | Steps, a code field, a link in running text          |
| 8  | Feed               | Cards of mixed content, one playing a video with its controls; filter chips; endless loading; a FAB; bottom navigation; a placeholder while loading; an empty state                                        | Endless loading, placeholders, video controls        |
| 9  | Product            | An image carousel; a choice of variant by chip and by colour swatch; a quantity; a bottom sheet of details; add to basket with a snackbar; a rating                 | A swatch picker, a rating                            |
| 10 | Checkout           | Steps; an address form with autocomplete; a choice of payment by radio, beside a slot for payment fields; a delivery day and time; an order summary                        | Steps, a time slot as a choice                       |
| 11 | Account            | An avatar that is replaced by upload; a list of settings rows with trailing switches and chevrons; sign out confirmed in a dialog                                  | Little                                               |
| 12 | Search             | A search bar that opens a search view; recent and suggested entries in sections; results with filters in a bottom sheet; a state for no result                      | Filters in a sheet                                   |

### Content and productivity

| #  | Screen             | Parts                                                                                                                                                              | Expected to strain                                   |
| :- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| 13 | File browser       | A folder tree; a grid and a list of the same items, toggled; multiple selection; moving by drag and drop; a context menu; breadcrumbs; upload by dropping files     | Tree, drag and drop, context menu, many items        |
| 14 | Inbox              | Three panes that fold to one on a phone; a selectable list with unread badges; bulk actions; a compose dialog with several recipients; keyboard shortcuts           | Panes, several recipients, shortcuts                 |
| 15 | Board              | Columns of cards; a card moved within and between columns by drag and by keyboard; tags and avatars on a card; a card's detail in a side sheet                      | Drag and drop                                        |
| 16 | Editor chrome      | A toolbar of toggle buttons and groups; menus with submenus; a split button; tooltips with shortcuts; a colour picker in a popover; a command palette; the editing surface, rich text with headings, lists, links and marks | The editing surface, submenus, a command palette     |
| 17 | Schedule           | A month always in view, not in a picker; a range chosen on it; time fields; an event's dialog; a list of the day's events                                          | A calendar and time fields of their own              |
| 18 | Activity           | A thread of comments with a rich-text field to reply; a popover of notifications from a badged icon button; a card previewing a mentioned person; snackbars queued            | A popover of its own, rich text                      |

### Marketing and public pages

| #  | Screen             | Parts                                                                                                                                                              | Expected to strain                                   |
| :- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| 19 | Landing page       | A header of links that folds to a menu; a hero with two actions; feature cards; a carousel of quotes; a footer of link columns; the display type at each width      | Links, page sections, type that scales with width    |
| 20 | Pricing            | A monthly and yearly toggle; plan cards with one emphasised; a table comparing plans; questions that open and close; tooltips on terms                              | A table that is not interactive                      |
| 21 | Contact            | Text fields, a multi-line field, a select, a consent checkbox; the state after sending; an error from the server                                                   | Little                                               |
| 22 | Article            | Long-form type: headings, lists, quotes, code; breadcrumbs; a table of contents that follows the scroll; tabs of code samples; an audio player with captions; tags; previous and next links | Long-form type, breadcrumbs, contents, audio         |

## What a run yields

One log a screen, and from them all:

- the corpus's coverage, and each screen's;
- the kit's gaps ranked by how many screens met each: what joins the kit
  next, and what becomes a registry block;
- the skills' gaps ranked the same way: what `ds-build` has to say;
- the screens that were built whole from the kit, each a block ready to be
  offered.

A run is repeated after a release that claims to close a gap. A screen is
added when a project meets one the corpus does not hold, and none is removed
to raise the figure.
