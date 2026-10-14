/* =============================================================================
   Rule checks for the components' doc comments (scripts/check-docs.mjs).

     npm run docs:check     # node's test runner

   The first test is the rule itself, on the kit as shipped. The others are
   fixtures that must be refused: the shipped kit with one comment moved off
   its component, as the comments of Badge and the others once were.
   ========================================================================== */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  ALSO,
  INDEX,
  PENDING,
  checkDocs,
  heldToRule,
  readExports,
} from "./check-docs.mjs";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(KIT, path), "utf8");

const shipped = readExports();

/** Replace in a text something the fixture needs to be there. */
const swap = (text, from, to) => {
  assert.ok(text.includes(from), `the fixture expects ${JSON.stringify(from)}`);
  return text.replace(from, to);
};

/** The check refuses the kit with `path` read as `text`, naming `name`. */
const refuses = (path, text, name) => {
  const problems = checkDocs(readExports({ replace: { [path]: text } }));
  assert.ok(
    problems.some((p) => p.startsWith(`${name} (`)),
    `no problem names ${name}:\n  ${problems.join("\n  ")}`,
  );
};

test("the shipped kit: every exported component carries its doc comment", () => {
  assert.deepEqual(checkDocs(shipped), []);
});

test("the rule holds every component of components/ and primitives/, and the named few", () => {
  const held = new Set(shipped.filter(heldToRule).map((e) => e.name));
  for (const name of [
    "Badge",
    "LoadingIndicator",
    "Meter",
    "Toolbar",
    "DatePicker",
    "TimePicker",
    "Checkbox",
    "StateLayer",
    "Button",
    "ColorPicker",
    "ChipGroup",
    "CheckboxGroup",
    "SearchBar",
    "SearchView",
    "Focusable",
    "Display",
    ...ALSO,
    ...PENDING,
  ])
    assert.ok(held.has(name), `the rule holds ${name}`);
  for (const name of ["BADGE_MAX", "badgeAccessibleText", "cn", "CheckIcon"])
    assert.ok(!held.has(name), `the rule does not hold ${name}`);
});

/** The doc comment of the component `path` holds: the one citing its spec. */
const docOf = (path, text) => {
  const doc = /\/\*\*(?:(?!\*\/)[\s\S])*Spec:(?:(?!\*\/)[\s\S])*\*\/\n/.exec(
    text,
  )?.[0];
  assert.ok(doc, `${path} carries its component's doc comment`);
  return doc;
};

test("a comment left on the styles above the component is refused", () => {
  // Badge's comment, put back where it was: on `const styles = tv(`.
  const path = "components/Badge.tsx";
  const text = read(path);
  const doc = docOf(path, text);
  const moved = swap(
    swap(text, doc, ""),
    "const styles = tv(",
    `${doc}const styles = tv(`,
  );
  refuses(path, moved, "Badge");
});

test("a component with no doc comment at all is refused", () => {
  const path = "components/Divider.tsx";
  const text = read(path);
  refuses(path, swap(text, docOf(path, text), ""), "Divider");
});

test("a sub-component's comment left on a const above it is refused", () => {
  // ChipGroup's comment, moved onto a const between it and the function.
  const path = "components/Chip.tsx";
  const text = read(path);
  const at = text.indexOf("export function ChipGroup(");
  const doc = /\/\*\*(?:(?!\*\/)[\s\S])*\*\/\n$/.exec(text.slice(0, at))?.[0];
  assert.ok(doc, `${path} carries ChipGroup's doc comment`);
  refuses(
    path,
    swap(
      text,
      `${doc}export function ChipGroup(`,
      `${doc}const chipGroupFixture = 0;\nexport function ChipGroup(`,
    ),
    "ChipGroup",
  );
});

test("a re-export with its comment on the export line is refused", () => {
  // `/** … */ export { Focusable };` reaches neither the hover nor the types.
  const path = "components/Tooltip.tsx";
  const text = read(path);
  refuses(
    path,
    swap(
      swap(text, "export const Focusable = AriaFocusable;", "export { Focusable };"),
      "Focusable as AriaFocusable,",
      "Focusable,",
    ),
    "Focusable",
  );
});

test("a pending export that gains its doc comment must leave the list", () => {
  const name = "Dialog";
  assert.ok(PENDING.includes(name), `the list names ${name}, still to be written`);
  const path = shipped.find((e) => e.name === name)?.file;
  assert.ok(path, `${INDEX} exports ${name}`);
  const problems = checkDocs(
    readExports({
      replace: {
        [path]: swap(
          read(path),
          `export function ${name}(`,
          `/** A fixture's comment. */\nexport function ${name}(`,
        ),
      },
    }),
  );
  assert.ok(
    problems.some((p) => p.startsWith(`${name} (`) && /PENDING/.test(p)),
    `no problem asks ${name} out of PENDING:\n  ${problems.join("\n  ")}`,
  );
});
