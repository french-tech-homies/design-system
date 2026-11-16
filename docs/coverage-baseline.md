# The coverage baseline

All twenty-two screens of [the coverage corpus](coverage-corpus.md), built
once each on 2026-11-16 against the kit as it stood on `main` after the
pull requests that followed [the pilot](coverage-pilot.md), before that work
was released. Each run's log, as its builder wrote it, is in
[`coverage-baseline/`](coverage-baseline/).

## The figure

A part is the kit's when it was built with no `component`, `feature`,
`control` or `edit` leave: the corpus's rule.

**41 parts of 119, 34%**, where the corpus aims at 95%.

That figure hides what moved. The same logs, read for a part that needed no
control from outside the kit (no `component`, `control` or `edit` leave,
whatever its `feature` leaves): **93 parts of 119, 78%**.

| #  | Screen             | Parts | The kit's, by the rule | No control from outside the kit |
| :- | :----------------- | ----: | ---------------------: | ------------------------------: |
| 1  | Application shell  |     6 |                      2 |                               5 |
| 2  | Data table         |     8 |                      5 |                               8 |
| 3  | Record form        |     4 |                      0 |                               3 |
| 4  | Dashboard          |     7 |                      4 |                               6 |
| 5  | Settings           |     6 |                      2 |                               6 |
| 6  | People and roles   |     5 |                      2 |                               4 |
| 7  | Sign in and up     |     5 |                      1 |                               4 |
| 8  | Feed               |     7 |                      2 |                               6 |
| 9  | Product            |     6 |                      3 |                               4 |
| 10 | Checkout           |     5 |                      1 |                               5 |
| 11 | Account            |     3 |                      0 |                               2 |
| 12 | Search             |     4 |                      0 |                               4 |
| 13 | File browser       |     7 |                      3 |                               4 |
| 14 | Inbox              |     5 |                      1 |                               5 |
| 15 | Board              |     4 |                      2 |                               3 |
| 16 | Editor chrome      |     7 |                      0 |                               4 |
| 17 | Schedule           |     5 |                      0 |                               1 |
| 18 | Activity           |     4 |                      2 |                               3 |
| 19 | Landing page       |     6 |                      6 |                               6 |
| 20 | Pricing            |     5 |                      2 |                               3 |
| 21 | Contact            |     3 |                      0 |                               3 |
| 22 | Article            |     7 |                      3 |                               4 |
|    | **All**            | **119** |               **41** |                          **93** |

Every screen built, in each builder's hands and again here. No kit file was
edited in any run.

Leaves over the 22 runs: 117 `feature`, 22 `component`, 14 `control`, no
`edit`; and beside the figure 125 `layout`, 115 `read`, 29 `guess`, 22
`value`, 10 `hook`.

## What the two figures say

**The kit now has most of the controls.** A builder took a component from
React Aria 22 times in 22 screens, and wrote a control by hand 14 times. In
the pilot's four screens alone a component was taken 12 times. The landing
page, none of whose
six parts was the kit's in the pilot, is the kit's whole: its header and its
carousel are two of the new blocks, its links the kit's `Link`.

**What a builder meets now is a component that lacks an option.** 117
`feature` leaves, in every screen but one. They are not one kind of thing:

- some are a gap a project cannot fill well: a dialog whose actions cannot
  be destructive, an avatar that cannot be decorative, a checkbox alone
  that cannot show an error;
- some are the kit working as it means to, logged because a class was
  passed: a width on a dialog, a column hidden on a phone.

The corpus's rule counts both against the kit. Splitting `feature` as
`hand` was split after the pilot, into an option the kit lacks and a class
the kit expects, is the next change the corpus needs, and it is the owner's
to decide.

**The kit is still read through its source.** 115 reads and 29 wrong guesses
in 22 screens. Ten screens' logs name the same guess: a type primitive
refusing an element (`<Title component="p">`, `<Body component="dt">`).

## What the kit lacks, by how many screens met it

Counted by searching the 22 logs for each: a count is the screens whose log
names it, and is approximate.

| Screens | What                                                                                              |
| ------: | :------------------------------------------------------------------------------------------------ |
|      10 | The type primitives refuse an element a page needs (`p`, `li`, `dt`, `dd`), known only from the types |
|      10 | No skeleton, or any placeholder for content that is loading                                       |
|       9 | A dialog takes no width, its two actions cannot be destructive, and it cannot be held open while a request runs |
|       8 | The react-hook-form adapter takes no rules, passes no ref (to focus the first invalid field), and has no date field |
|       7 | Nothing switches between the rail, the drawer and the bottom bar by width                          |
|       6 | `ListItem` outside a list: it is drawn as pressed, and before this release could not cut a long name |
|       5 | `Avatar` cannot be decorative: beside a visible name it is an image with no name                   |
|       4 | `Slider` is capped at 300px and draws no filled track                                              |
|       4 | `Table` on a phone: no way to drop a column, and no two-line row                                   |
|       3 | `Button`'s `isLoading` draws a spinner and does not stop a second press                            |
|       3 | `Card` cannot be pressed, and has no emphasised form                                               |
|       3 | `EmptyState`'s media size is fixed and its two actions touch                                       |
|       2 | A `Checkbox` alone has no error message and no required mark                                       |
|       2 | The input `Chip`'s remove is a `div` that only a pointer reaches                                   |
|       2 | `Tooltip` does not open on touch, and has no place for a shortcut                                  |
|       2 | No colour swatch picker                                                                            |
|       2 | A list that is dropped onto draws no target, and no line where the drop will land                  |
|       1 | No calendar or time field outside a picker                                                         |
|       1 | `Menu` has no submenus                                                                             |

Controls that neither Material nor React Aria describes, written by hand
once each: a one-time-code field, a star rating, a video player and an audio
player, a rich-text field (twice), a field of several email addresses, an
error summary for a form, a table of contents that follows the scroll.
Candidates for blocks.

## What the runs did not hold to

- **Blocks were out of reach of three builders.** The command that adds a
  block was refused by the builders' own permissions in the runs of the data
  table, the dashboard and the product page, which each then wrote by hand
  what a block might have served (a pager, a carousel). From the thirteenth
  screen on, the block files were also put in each project beforehand, and
  two builders took them from there when the command was refused. Five
  screens used blocks: sign in and up, checkout, landing page, contact,
  article.
- **No builder opened a browser.** Each built to a passing `npm run build`.
  Here, each screen was then loaded at a phone's width and a desktop's, in
  dark: all 22 drew with no error and the keyboard reached their controls.
  One, the board, scrolls the whole page sideways on a phone. No screen was
  worked part by part, as the pilot's four were: a part logged as built may
  not work.
- **`ds-spec` did not run:** it reads m3.material.io, and the builders had no
  network.
- **The kit measured was not a release.** It was `main` before 0.8.0 was
  cut, installed from a registry built and served on the same machine.
- **One run each.** A builder's choices move a screen's count by a part or
  two; the total is steadier than any row.
