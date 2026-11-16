# The coverage run on 0.9.1

All twenty-two screens of [the coverage corpus](coverage-corpus.md), built
once each on 2026-11-16 against the kit's release 0.9.1, to measure what
[the baseline](coverage-baseline.md) could only project. Each run's log, as
its builder wrote it, is in [`coverage-run-0.9.1/`](coverage-run-0.9.1/),
with the report of the browser pass beside it (`<screen>.browser.json`).

## The figure

A part is the kit's when it was built with no `component`, `option`,
`control` or `edit` leave: the corpus's rule.

**60 parts of 119, 50%**, where the baseline had 52 (44%) and the corpus
aims at 95%. The baseline's page projected 64 (54%).

That is the figure from the logs, as the baseline's was. One of the 60, the
checkout's delivery time, cannot be done by keyboard (see "In a browser"),
and the corpus counts a part that does not work as a leave: by the corpus's
whole rule the figure is 59.

| #  | Screen             | Parts | Baseline | The kit's | Works clean in a browser |
| :- | :----------------- | ----: | -------: | --------: | -----------------------: |
| 1  | Application shell  |     6 |        2 |         5 |                        0 |
| 2  | Data table         |     8 |        7 |         7 |                        2 |
| 3  | Record form        |     4 |        0 |         1 |                        0 |
| 4  | Dashboard          |     7 |        5 |         4 |                        3 |
| 5  | Settings           |     6 |        3 |         3 |                        2 |
| 6  | People and roles   |     5 |        2 |         3 |                        1 |
| 7  | Sign in and up     |     5 |        2 |         2 |                        0 |
| 8  | Feed               |     7 |        2 |         4 |                        2 |
| 9  | Product            |     6 |        3 |         2 |                        2 |
| 10 | Checkout           |     5 |        3 |         3 |                        1 |
| 11 | Account            |     3 |        0 |         1 |                        0 |
| 12 | Search             |     4 |        0 |         2 |                        1 |
| 13 | File browser       |     7 |        3 |         2 |                        0 |
| 14 | Inbox              |     5 |        2 |         1 |                        0 |
| 15 | Board              |     4 |        3 |         3 |                        0 |
| 16 | Editor chrome      |     7 |        1 |         1 |                        2 |
| 17 | Schedule           |     5 |        0 |         0 |                        0 |
| 18 | Activity           |     4 |        2 |         2 |                        0 |
| 19 | Landing page       |     6 |        6 |         6 |                        4 |
| 20 | Pricing            |     5 |        2 |         3 |                        2 |
| 21 | Contact            |     3 |        0 |         2 |                        0 |
| 22 | Article            |     7 |        4 |         3 |                        2 |
|    | **All**            | **119** |   **52** |    **60** |                   **24** |

Every screen built. No kit file was edited in any run. 99 parts of 119
took no control from outside the kit (no `component`, `control` or `edit`
leave), where the baseline had 93.

Leaves over the 22 runs, as read: 94 `option`, 14 `component`, 9 `control`,
no `edit`; and beside the figure 199 `use`, 132 `layout`, 111 `read`,
17 `value`, 10 `hook`, 9 `guess`. The baseline had 93 `option`,
22 `component`, 14 `control` and 29 `guess`.

## How the figure was read

**The builders sorted `option` from `use` themselves**, which the baseline's
did not: its builders logged one kind, `feature`, split afterwards by one
reader. Asked for both kinds, with a doc comment's line to quote for each
`use`, this run's builders logged 293 such leaves where the baseline's logged
117. By their own sorting the figure is 47 parts of 119, 39%: not a number to
hold against 52.

The logs were then read by the reader who split the baseline, against the
same rule and both ways: each of the 121 `option` and 15 `component` leaves,
and each `use` leave of a part that would otherwise count. 28 `option`
leaves became `use` (the project's own logic, a React Aria prop passed
through, a block edited, children composed, a size or a position added by
`className`). One `component` leave became none (`VisuallyHidden`, which
the skill names). One `use` became an `option` (a drag handle pulled in by
a negative margin, an option at the baseline), and the record form's error
summary, logged as a layout, is counted a `control` as the baseline's was.
Each is in
[`coverage-run-0.9.1/reading.json`](coverage-run-0.9.1/reading.json). A
component's own look replaced by a class (a `Skeleton`'s corner, a
`TabPanel`'s padding) stayed an `option`, as at the baseline. One reader made
the reading: a second would move a few.

**Five screens went down by one part**, none because the kit lost anything:
their builders logged smaller things than the baseline's did. The number of
`option` leaves did not fall (93, then 94): thirteen things were closed, and
builders asked to sort the kinds found as many smaller ones. A screen's
count moves by a part or two from one run to the next; the total is steadier.

**Each log was held against its project's code.** Every import from React
Aria outside the kit is in its log, and no kit file was changed.

## Whether what 0.9.x added was found

The brief named nothing of it but `app-shell-block`. Screens whose code uses
each, of 22:

| What                                                        | Screens |
| :---------------------------------------------------------- | ------: |
| `Skeleton`                                                  |      20 |
| A type primitive on `p`, `li`, `dt`, `dd` or another element |      18 |
| `Button`'s `isLoading`                                      |      16 |
| The form adapter's `rules`                                  |       6 |
| A destructive dialog action                                 |       5 |
| The new `Slider`                                            |       4 |
| An input `Chip` that is removed                             |       3 |
| `app-shell-block`                                           |       2 |
| The adapter's `FormDatePicker`                              |       2 |

The guess ten baseline screens made, a type primitive refusing an element,
was made by none.

## What still stands between a part and the kit

Counted by reading the 22 logs: the screens whose log names it as a leave
that cost a part. Approximate.

| Screens | What                                                                                              |
| ------: | :------------------------------------------------------------------------------------------------ |
|       4 | A dialog with its own content takes no `actions`, and does not hold itself open while a request runs |
|       4 | A focus ring cut by what clips it (`GridList`, `Card`, a virtualized row), moved inside by hand    |
|       4 | No pressable that holds anything: an avatar, a card, a line of text                                |
|       4 | `Skeleton` has no pill and no square corner                                                        |
|       3 | The form adapter sets no `validationBehavior="aria"`, and does not export its focus anchor         |
|       3 | `Switch` has no supporting line and no row form (label first, full width)                          |
|       2 | `ChipGroup` takes no ref and cannot be one scrolling row                                           |
|       2 | `Slider` cannot format its value (a time)                                                          |
|       2 | A rich-text field, written by hand                                                                 |
|       2 | A media player, written by hand                                                                    |
|       2 | A colour swatch that is chosen                                                                     |
|       2 | `Tooltip`: on touch, a shortcut                                                                    |
|       2 | A required `Select` and a lone `Checkbox`: no required mark, no supporting text                    |
|       1 | A calendar and a time field outside a picker; sections in a list; submenus; a rating; a one-time-code field; an avatar group; a table of contents; `BottomSheet` actions; `SearchView` acting without closing; `Table` columns on a phone; a `Card` that is selected; a first-in-first-out snackbar queue |

## In a browser

The baseline's builders opened no browser and neither did these. This time
each screen was then worked part by part in headless Chromium by a second
agent that changed nothing: by keyboard at 1280 and 400 wide, in light and
dark, and by pointer where a part is a pointer's too. A part "works clean"
when its job is done by keyboard and nothing is wrong on the way.

**24 parts of 119 work clean, 94 do their job with something wrong, 1 cannot
be done.** Of the 60 parts that are the kit's by their log, 16 work clean.
The baseline has no such column, and the checkers were told not to be kind:
a part with one fault they were unsure of is counted among the 94.

Twenty-one screens printed nothing to the console, no error and no warning.
The application shell threw one page error, "External navigation is not
allowed", each time its `mailto:` link was pressed: the link goes through
the kit's react-router adapter. Twenty screens never scroll sideways at 400
or 1280; the board does on a phone, as the baseline's did, and the record
form by 4px once a field shows its error.

What the 22 reports repeat, with whose it is. The counts are of reports
read, and approximate:

| Seen in | What                                                                                   | Whose |
| ------: | :------------------------------------------------------------------------------------- | :---- |
|      16 | Focus falls to the page's body after an action that removes or disables what was pressed | The screen's mostly; the kit's in the pager and carousel blocks, whose buttons disable under the focus |
|       8 | A loading `Button` announces nothing: `aria-disabled` and a hidden spinner              | The kit's |
|       8 | A snackbar is drawn over what is focused, a toolbar or a sheet's buttons                | The kit's region is placed by the project; nothing reserves the space |
|       8 | A focused control is not scrolled into view: in a sheet, under a sticky bar             | Both |
|       3 | The modal `SideSheet` on a phone: off the window, at the wrong edge, not closed by Escape | To reproduce in the kit |
|       2 | Today's number is invisible when today is an end of a range                             | To reproduce in the kit: both screens draw it with the kit's date-picker styles |
|       1 | `Skeleton` cannot be seen on a filled `Card`: the same colour (and one builder's log)    | The kit's |
|       2 | `PhoneField` selects its prefix on Tab in, and a typed national number replaces it      | To reproduce in the kit |
|       2 | A required `Select` has no `aria-required`, and an invalid one no `aria-invalid`        | To reproduce in the kit |
|       2 | `DropZone` holds a zero-size button that Tab stops on                                   | To reproduce in the kit |
|       2 | The `Stepper` block's steps other than the current one have no name in its compact form | The kit's block: it hides their labels |
|       2 | A letter typed in an open `Menu` does not move to its item                              | To reproduce in the kit |
|       2 | `BottomSheet`'s handle: no state, and no drag by a mouse                                | To reproduce in the kit |
|       1 | A delivery time cannot be chosen by keyboard: no radio of an empty `radio-tile-block` group is a Tab stop | To reproduce in the kit |
|       1 | A `mailto:` link through the react-router adapter becomes a path and throws             | To reproduce in the kit |

"The kit's" is said where the kit's source shows it. "To reproduce in the
kit" is what a checker saw in a screen and nobody has yet seen in a story:
some will be the screen's.

Files dropped onto a list, a folder's row, a tree and an empty folder's
`DropZone` landed, and so did a card dragged by a mouse between two lists:
neither had been seen before. The files were dropped with the browser's
own drag events, not from a file manager, and in the record form the zone
ignored a drop made of synthetic events.

## What the run did not hold to

- **The command that adds a block was refused by most builders' own
  permissions**; the registry's log shows four blocks fetched by builders.
  All six block files were in each project beforehand and a refused builder
  took its block from there: no part was written by hand for want of a
  block. Ten screens used blocks.
- **Two readers of the kinds, not one instrument.** The builders' sorting
  and the reading above differ by 13 parts. The figure to compare with the
  baseline's is the reading's.
- **The checkers were agents, with a script.** They heard no screen reader,
  touched no screen and saw no drag preview. What they could not exercise is
  in each report.
- **`ds-spec` did not run:** the builders had no network.
- **The kit measured was built on this machine** from the commit tagged
  `v0.9.1`, and each of its 92 items is, byte for byte, the one the
  registry serves.
- **One run each.**
