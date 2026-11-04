/* =============================================================================
   Rule checks for the ranges the docs write (scripts/check-doc-ranges.mjs).

     npm run docs:check     # node's test runner

   The first test is the rule itself, on the docs as shipped. The others are
   fixtures that must be refused: the shipped docs with one range planted
   wrong, as installing.md would read had a range moved in package.json and
   not on the page.
   ========================================================================== */

import assert from "node:assert/strict";
import { test } from "node:test";

import { checkDocRanges, readDocs, readPackage } from "./check-doc-ranges.mjs";

const pkg = readPackage();
const shipped = readDocs();

/** The shipped docs with `from` replaced by `to` in `path`. */
const planted = (path, from, to) =>
  shipped.map((doc) => {
    if (doc.path !== path) return doc;
    assert.ok(
      doc.text.includes(from),
      `the fixture expects ${JSON.stringify(from)} in ${path}`,
    );
    return { ...doc, text: doc.text.replace(from, to) };
  });

const lineOf = (path, needle) =>
  shipped
    .find((d) => d.path === path)
    .text.split("\n")
    .findIndex((l) => l.includes(needle)) + 1;

test("the shipped docs: every range they write is the kit's", () => {
  assert.deepEqual(checkDocRanges(shipped, pkg), []);
});

test("it reads README.md and every docs/*.md", () => {
  const paths = shipped.map((d) => d.path);
  assert.ok(paths.includes("README.md"));
  assert.ok(paths.includes("docs/installing.md"));
  assert.ok(
    paths.every((p) => p === "README.md" || /^docs\/[^/]+\.md$/.test(p)),
  );
});

test("the shipped docs hold the ranges this check is for", () => {
  const text = shipped.find((d) => d.path === "docs/installing.md").text;
  for (const name of [
    "react-aria-components",
    "tailwind-variants",
    "tailwind-merge",
    "clsx",
    "tw-animate-css",
    "react-phone-number-input",
  ]) {
    assert.ok(
      text.includes(`${name}@`),
      `installing.md no longer writes ${name}@…`,
    );
  }
  assert.ok(text.includes("Tested against:"));
});

test("a wrong range in the install command is refused, naming file, line, package and the range to write", () => {
  const docs = planted(
    "docs/installing.md",
    '"tailwind-variants@^1.0.0"',
    '"tailwind-variants@^4.0.0"',
  );
  const line = lineOf("docs/installing.md", '"tailwind-variants@^1.0.0"');
  assert.deepEqual(checkDocRanges(docs, pkg), [
    `docs/installing.md:${line}: tailwind-variants@^4.0.0, write tailwind-variants@^1.0.0, the range the kit is tested on`,
  ]);
});

test("a range outside package.json is held to RANGES_OUTSIDE_PACKAGE", () => {
  const docs = planted(
    "docs/installing.md",
    '"tw-animate-css@^1.4.0"',
    '"tw-animate-css@^2.0.0"',
  );
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /tw-animate-css@\^2\.0\.0, write tw-animate-css@\^1\.4\.0/,
  );
});

test("a range written in prose is held too", () => {
  const docs = planted(
    "docs/installing.md",
    "`react-phone-number-input@^3.4.9`",
    "`react-phone-number-input@3`",
  );
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /^docs\/installing\.md:\d+: react-phone-number-input@3, write react-phone-number-input@\^3\.4\.9/,
  );
});

test("a wrong range on the Tested against line is refused", () => {
  const docs = planted(
    "docs/installing.md",
    "`tailwind-merge` ^3.6.0",
    "`tailwind-merge` ^3.5",
  );
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /^docs\/installing\.md:\d+: tailwind-merge \^3\.5 on the Tested against line, write \^3\.6\.0/,
  );
});

test("a Tested against line that names a version in prose is refused", () => {
  const docs = planted("docs/installing.md", "`react` ^19.2.0", "React 19");
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /: "React 19" on the Tested against line: write each as `name` range/,
  );
});

test("a range in README.md is held as well", () => {
  const docs = shipped.map((d) =>
    d.path === "README.md"
      ? { ...d, text: `${d.text}\nnpm install clsx@^1.0.0\n` }
      : d,
  );
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /^README\.md:\d+: clsx@\^1\.0\.0, write clsx@\^2\.1\.1/,
  );
});

test("a package the kit declares no range for is refused", () => {
  const docs = shipped.map((d) =>
    d.path === "docs/installing.md"
      ? { ...d, text: `${d.text}\nnpm install left-pad@^1.3.0\n` }
      : d,
  );
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /left-pad@\^1\.3\.0, the kit declares no range for left-pad/,
  );
});

test("a scoped name is read whole, and a registry item or an address is not a range", () => {
  const text =
    "npx shadcn add @ds/ds\nwrite to someone@example.com\nnpm i @internationalized/date@^3.0.0\n";
  const problems = checkDocRanges([{ path: "docs/x.md", text }], pkg);
  assert.deepEqual(problems, [
    "docs/x.md:3: @internationalized/date@^3.0.0, write @internationalized/date@^3.12.4, the range the kit is tested on",
  ]);
});

test("a range at a sentence's end is held, its full stop not read as part of it", () => {
  const docs = shipped.map((d) =>
    d.path === "docs/installing.md"
      ? {
          ...d,
          text: `${d.text}\nThen run npm install clsx@^1.0.0. It is done.\n`,
        }
      : d,
  );
  const problems = checkDocRanges(docs, pkg);
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /^docs\/installing\.md:\d+: clsx@\^1\.0\.0, write clsx@\^2\.1\.1/,
  );
});
