/**
 * Does a control show that the keyboard is on it?
 *
 * axe cannot tell and a screenshot is taken with nothing focused, so a `Menu`
 * whose rows showed nothing under the arrow keys passed every check the kit
 * had. This asks the one question a keyboard user asks: when focus arrives by
 * key, does anything change to the eye?
 *
 * It is asked of the page, not of a class name. What is drawn in and around
 * the focused control (its outline, its fills and borders, a state layer, a
 * label's colour, an underline) is read as text; a key moves the focus on;
 * it is read again; and the two readings must differ. Where the indicator sits is the component's
 * business: on the control, on a wrapper around a hidden input, on a field's
 * container.
 *
 * Used two ways: `.storybook/focus.setup.ts` asks it of every tab stop of
 * every story, and a `play` function asks it of what only exists while
 * something is open (`expectVisibleFocus`), such as a menu's row.
 */

/** How far above the focused element an indicator is looked for. A checkbox's
    ring is on the label around its hidden input; a field's is on a container
    two or three levels up. */
const LEVELS_UP = 3;
/** A subtree larger than this is read in part: enough for any control, and a
    bound on what a page-sized wrapper costs. */
const MAX_NODES = 250;

const PROPS = [
  "backgroundColor",
  "backgroundImage",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "boxShadow",
  "color",
  "opacity",
  "textDecorationLine",
  "textDecorationThickness",
  "transform",
  "visibility",
] as const;

function read(style: CSSStyleDeclaration) {
  // An outline that is not drawn has a width and a colour all the same.
  const outline =
    style.outlineStyle === "none" || style.outlineWidth === "0px"
      ? ""
      : `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
  return outline + "|" + PROPS.map((p) => style[p]).join("|");
}

/** The element whose subtree is read: a few levels above the focused one,
    never the page itself. */
export function focusRoot(el: Element): Element {
  let root = el;
  for (let i = 0; i < LEVELS_UP; i++) {
    const parent = root.parentElement;
    if (!parent || parent === document.body || parent.id === "storybook-root") {
      break;
    }
    root = parent;
  }
  return root;
}

const FOCUSABLE =
  "a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]";

/**
 * The nodes read for `el`: `el` and what it holds first, then what is around
 * it under `root`.
 *
 * - `el` first, so that where `root` is large (a calendar's grid around one
 *   day) the focused control is among the nodes read whatever the bound cuts.
 * - Never another control, nor what it holds. The two readings are taken
 *   with focus on `el` and with focus moved on, often to its neighbour: the
 *   neighbour's own ring must not be read as `el`'s.
 */
function nodesAround(el: Element, root: Element): Element[] {
  const own = [el, ...el.querySelectorAll("*")];
  const seen = new Set(own);
  const around = [root, ...root.querySelectorAll("*")].filter((node) => {
    if (seen.has(node)) return false;
    const control = node.closest(FOCUSABLE);
    return !control || control.contains(el);
  });
  return [...own, ...around].slice(0, MAX_NODES);
}

/** What is drawn in and around `el`, as text: two readings that differ are
    two pictures that differ. */
export function focusSignature(el: Element, root = focusRoot(el)): string {
  const out: string[] = [];
  for (const node of nodesAround(el, root)) {
    out.push(read(getComputedStyle(node)));
    for (const pseudo of ["::before", "::after"]) {
      const style = getComputedStyle(node, pseudo);
      if (style.content !== "none") out.push(pseudo + read(style));
    }
  }
  return out.join("\n");
}

const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** How long a reading must hold still to be taken as settled. */
const STILL_MS = 50;
/** And how long it is waited for: a state layer fades over a short duration,
    and a theme switched a moment ago is still easing its colours. */
const SETTLE_MS = 800;

/**
 * What is drawn in and around `el` once it has stopped moving. A reading
 * taken while a colour is still easing differs from the next one whatever
 * the focus does, and a control with no indicator at all would then pass.
 *
 * Two of these are compared: one taken while `el` holds the keyboard's
 * focus, one taken after a key has moved the focus on. The focus is moved by
 * a key and never by `blur()`: inside a dialog or a sheet the focus is kept
 * in, and a blurred control is given it straight back.
 */
export async function focusReading(el: Element): Promise<string> {
  const root = focusRoot(el);
  await frame();
  const deadline = performance.now() + SETTLE_MS;
  let last = focusSignature(el, root);
  for (;;) {
    await wait(STILL_MS);
    await frame();
    const next = focusSignature(el, root);
    if (next === last || performance.now() > deadline) return next;
    last = next;
  }
}

/**
 * True for a control that takes typed text. Its indicator is the text
 * cursor, which no style reads: a search view's input shows nothing else,
 * and needs nothing else.
 */
export function showsACaret(el: Element): boolean {
  if (el instanceof HTMLTextAreaElement) return !el.readOnly;
  if (el instanceof HTMLInputElement) {
    return (
      !el.readOnly &&
      ["text", "search", "email", "url", "tel", "password", "number"].includes(
        el.type,
      )
    );
  }
  return (el as HTMLElement).isContentEditable === true;
}

/** A short name for a control, for a failure a person reads. */
export function describeControl(el: Element): string {
  const role = el.getAttribute("role") ?? el.tagName.toLowerCase();
  const name =
    el.getAttribute("aria-label") ??
    (el as HTMLElement).innerText?.trim().split("\n")[0] ??
    "";
  const slot = el.closest("[data-slot]")?.getAttribute("data-slot");
  return `${role}${name ? ` "${name.slice(0, 40)}"` : ""}${slot ? ` in ${slot}` : ""}`;
}

/** True while `el` holds the focus: the real one, or the one React Aria
    gives an option of a combo box while the caret stays in its field. */
const holdsFocus = (el: HTMLElement) =>
  document.activeElement === el || el.dataset.focused === "true";

/**
 * For a `play` function: `el` holds keyboard focus now, `moveOn` presses the
 * key that takes it elsewhere, and `el` must have been drawn differently
 * while it held it.
 *
 *   await expectVisibleFocus(items[1], () => userEvent.keyboard("{ArrowDown}"));
 */
export async function expectVisibleFocus(
  el: HTMLElement,
  moveOn: () => Promise<unknown>,
): Promise<void> {
  if (!holdsFocus(el)) {
    throw new Error(`${describeControl(el)} does not hold focus`);
  }
  const focused = await focusReading(el);
  await moveOn();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  if (holdsFocus(el)) {
    throw new Error(`${describeControl(el)} still holds focus after moveOn`);
  }
  if ((await focusReading(el)) === focused) {
    throw new Error(
      `${describeControl(el)} held keyboard focus and showed nothing: no outline, state layer, fill, border or underline changed when the focus moved on`,
    );
  }
}
