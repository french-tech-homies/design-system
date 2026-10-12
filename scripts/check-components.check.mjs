/* =============================================================================
   Rule checks for the kit's own components (scripts/check-components.mjs).

     npm run registry:check-install     # node's test runner

   The first test is the rule itself, on the README and the component files
   as shipped. The others are fixtures that must be refused: the shipped kit
   with one thing taken out or one thing put in.
   ========================================================================== */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CLOSE,
  OPEN,
  SENTENCE,
  checkComponents,
  checkMonoFace,
  readKit,
} from "./check-components.mjs";

const kit = readKit();

/** The shipped kit with one change made to a copy of it. */
const changed = (change) => {
  const copy = { readme: kit.readme, components: { ...kit.components } };
  change(copy);
  return copy;
};

/** The check refuses, and one of its problems matches every pattern. */
const refuses = (k, ...patterns) => {
  const problems = checkComponents(k);
  assert.ok(problems.length > 0, "the check passed a fixture it must refuse");
  for (const pattern of patterns) {
    assert.ok(
      problems.some((p) => pattern.test(p)),
      `no problem matches ${pattern}:\n  ${problems.join("\n  ")}`,
    );
  }
};

/** The README with `text` put in just before the list's closing marker. */
const listing = (readme, text) => readme.replace(CLOSE, `${text}\n${CLOSE}`);

/** Replace in a text something the fixture needs to be there. */
const swap = (text, from, to) => {
  assert.ok(text.includes(from), `the fixture expects ${JSON.stringify(from)}`);
  return text.replace(from, to);
};

const TAG = "components/Tag.tsx";
const GRID_LIST = "components/GridList.tsx";
const SWATCH = "components/color/ColorSwatch.tsx";
const NUMBER_FIELD = "components/NumberField.tsx";

test("the shipped kit: every component is Material's or one of the named group", () => {
  assert.deepEqual(checkComponents(kit), []);
});

test("a member nobody named in the README is refused", () => {
  refuses(
    changed((k) => {
      k.components["components/Timeline.tsx"] =
        `/**\n * A vertical list of events. ${SENTENCE}\n */\nexport function Timeline() {}\n`;
    }),
    /components\/Timeline\.tsx says .* the list in README\.md does not name Timeline/,
  );
});

test("a listed component whose file does not say so is refused", () => {
  refuses(
    changed((k) => {
      k.components[TAG] = swap(k.components[TAG], SENTENCE, "");
    }),
    /names Tag, and components\/Tag\.tsx does not say/,
  );
});

test("a part dropped from the list is refused", () => {
  refuses(
    changed((k) => {
      k.readme = swap(k.readme, "`ColorSwatch`", "the swatch");
    }),
    /components\/color\/ColorSwatch\.tsx says .* does not name ColorSwatch/,
  );
});

test("a listed name with no component file is refused", () => {
  refuses(
    changed((k) => {
      k.readme = listing(k.readme, "- `Timeline`: a vertical list of events.");
    }),
    /names Timeline, and there is no components\/\*\*\/Timeline\.tsx/,
  );
});

test("a README without the list is refused", () => {
  for (const marker of [OPEN, CLOSE]) {
    refuses(
      changed((k) => {
        k.readme = swap(k.readme, marker, "");
      }),
      /README\.md: no list between/,
    );
  }
  refuses(
    changed((k) => {
      k.readme = swap(swap(k.readme, OPEN, "@@"), CLOSE, OPEN).replace(
        "@@",
        CLOSE,
      );
    }),
    /stands before/,
  );
  refuses(
    changed((k) => {
      k.readme += `\n${OPEN}\n- \`Tag\`\n${CLOSE}\n`;
    }),
    /more than one/,
  );
  refuses({ ...kit, readme: `${OPEN}\n${CLOSE}\n` }, /names no component/);
});

test("a name listed twice is refused", () => {
  refuses(
    changed((k) => {
      k.readme = listing(k.readme, "- `Tag`: again.");
    }),
    /names Tag twice/,
  );
});

test("a component that says neither is refused", () => {
  refuses(
    changed((k) => {
      k.components["components/Timeline.tsx"] =
        "/** A vertical list of events. */\nexport function Timeline() {}\n";
    }),
    /components\/Timeline\.tsx neither cites a page of m3\.material\.io nor says/,
  );
  refuses(
    changed((k) => {
      k.components[GRID_LIST] = k.components[GRID_LIST].replaceAll(
        "https://m3.material.io/",
        "",
      );
    }),
    /components\/GridList\.tsx neither cites/,
  );
});

test("the sentence is found where a comment wraps it over two lines", () => {
  const wrapped = SENTENCE.replace(" describe ", "\n * describe ");
  assert.deepEqual(
    checkComponents(
      changed((k) => {
        k.components[SWATCH] = swap(k.components[SWATCH], SENTENCE, wrapped);
      }),
    ),
    [],
  );
});

test("a member may cite the Material pages of the parts it borrows", () => {
  assert.match(kit.components[NUMBER_FIELD], /https:\/\/m3\.material\.io\//);
  assert.ok(kit.components[NUMBER_FIELD].includes("NumberField"));
  assert.deepEqual(
    checkComponents({
      readme: `${OPEN}\n- \`NumberField\`\n${CLOSE}\n`,
      components: {
        [NUMBER_FIELD]: `/** ${SENTENCE} Field: https://m3.material.io/components/text-fields/specs */`,
      },
    }),
    [],
  );
});

test("only component files are read: a style module is not one", () => {
  assert.ok(Object.keys(kit.components).length > 0);
  assert.deepEqual(
    Object.keys(kit.components).filter((p) => !p.endsWith(".tsx")),
    [],
  );
});

/* ---- the mono face ---------------------------------------------------- */

/** The shipped sources with `text` put at the end of one of them. */
const withLine = (path, text) => {
  assert.ok(path in kit.sources, `the fixture expects ${path}`);
  return { sources: { ...kit.sources, [path]: `${kit.sources[path]}${text}\n` } };
};

test("the shipped kit: no component, primitive or style module names the mono face", () => {
  assert.ok(Object.keys(kit.sources).some((p) => p.startsWith("primitives/")));
  assert.ok(Object.keys(kit.sources).some((p) => p.endsWith(".ts")));
  assert.deepEqual(checkMonoFace(kit), []);
});

test("a component that uses the mono face is refused, by file and line", () => {
  const problems = checkMonoFace(
    withLine(TAG, 'const amount = "font-mono tabular-nums";'),
  );
  assert.equal(problems.length, 1);
  assert.match(problems[0], /^components\/Tag\.tsx:\d+ names the mono face \(`font-mono`\)/);
});

test("a style module or a primitive that reaches the mono token is refused", () => {
  const styles = Object.keys(kit.sources).find(
    (p) => p.startsWith("components/") && p.endsWith(".ts"),
  );
  for (const [path, text] of [
    [styles, 'const face = "font-(family-name:--font-mono)";'],
    [styles, 'const face = "[font-family:var(--md-sys-typescale-mono-font)]";'],
    ["primitives/Typography.tsx", "// font-mono"],
  ]) {
    const problems = checkMonoFace(withLine(path, text));
    assert.equal(problems.length, 1, text);
    assert.ok(problems[0].startsWith(`${path}:`), problems[0]);
  }
});
