/* =============================================================================
   Rule checks for the one install (scripts/check-install.mjs).

     npm run registry:check-install     # node's test runner

   The first test is the rule itself, on the registry and the skills as
   shipped. The others are fixtures that must be refused: the shipped
   registry with one thing taken out, or a skill text with one thing put in.
   ========================================================================== */

import assert from "node:assert/strict";
import { test } from "node:test";

import { checkInstall, readKit } from "./check-install.mjs";

const kit = readKit();

/** The shipped kit with one change made to a deep copy of it. */
const changed = (change) => {
  const copy = {
    ...kit,
    registry: structuredClone(kit.registry),
    texts: { ...kit.texts },
  };
  change(copy);
  return copy;
};

const item = (k, name) => k.registry.items.find((i) => i.name === name);

/** The check refuses, and one of its problems matches every pattern. */
const refuses = (k, ...patterns) => {
  const problems = checkInstall(k);
  assert.ok(problems.length > 0, "the check passed a fixture it must refuse");
  for (const pattern of patterns) {
    assert.ok(
      problems.some((p) => pattern.test(p)),
      `no problem matches ${pattern}:\n  ${problems.join("\n  ")}`,
    );
  }
};

const THEME_SKILL = "skills/ds-theme/SKILL.md";

test("the shipped registry and skills: the one install is whole", () => {
  assert.deepEqual(checkInstall(kit), []);
});

test("the generator out of reach of `ds` is refused", () => {
  refuses(
    changed((k) => {
      const all = item(k, "ds");
      all.registryDependencies = all.registryDependencies.filter(
        (d) => !["@ds/design-md", "@ds/theme-skill"].includes(d),
      );
    }),
    /tokens\/generate-theme\.mjs/,
    /tokens\/design-md\.mjs/,
  );
});

test("a generator dependency its item does not declare is refused", () => {
  const without = (name) =>
    changed((k) => {
      const generator = item(k, "design-md");
      generator.devDependencies = generator.devDependencies.filter(
        (d) => !d.startsWith(`${name}@`),
      );
    });
  refuses(without("yaml"), /design-md.*imports "yaml"/);
  refuses(
    without("@material/material-color-utilities"),
    /imports "@material\/material-color-utilities"/,
  );
  refuses(without("tsx"), /`npx tsx`.*"tsx"/);
  refuses(without("@google/design.md"), /`npx designmd`.*"@google\/design\.md"/);
});

test("a dependency declared at another range than the kit's own is refused", () => {
  refuses(
    changed((k) => {
      const generator = item(k, "design-md");
      generator.devDependencies = generator.devDependencies.map((d) =>
        d.startsWith("yaml@") ? "yaml@^1.0.0" : d,
      );
    }),
    /yaml@\^1\.0\.0.*package\.json/,
  );
});

test("a command a skill names that no package provides is refused", () => {
  refuses(
    changed((k) => {
      k.texts[THEME_SKILL] += "\nRun `npx prettier --write DESIGN.md`.\n";
    }),
    /`npx prettier`/,
  );
});

test("the template in another folder than the generator is refused", () => {
  refuses(
    changed((k) => {
      const template = item(k, "tokens").files.find(
        (f) => f.path === "tokens/theme.v4.css",
      );
      template.target = "@ui/ds/styles/theme.v4.css";
    }),
    /theme\.v4\.css.*beside/,
  );
});

test("a skill file no item of the install lands is refused", () => {
  refuses(
    changed((k) => {
      const skill = item(k, "theme-skill");
      skill.files = skill.files.filter(
        (f) => f.path !== "skills/ds-theme/design-md.md",
      );
    }),
    /skills\/ds-theme\/design-md\.md/,
  );
  refuses(
    changed((k) => {
      const all = item(k, "ds");
      all.registryDependencies = all.registryDependencies.filter(
        (d) => d !== "@ds/spec-skill",
      );
    }),
    /skills\/ds-spec\/SKILL\.md/,
    /skills\/ds-spec\/md3\.mjs/,
  );
});

test("a skill landed outside the project's .claude/skills is refused", () => {
  refuses(
    changed((k) => {
      const [first] = item(k, "build-skill").files;
      first.target = "@ui/ds/skills/ds-build/SKILL.md";
    }),
    /skills\/ds-build\/SKILL\.md.*~\/\.claude\/skills\/ds-build\/SKILL\.md/,
  );
});

test("a file a skill names that the install does not bring is refused", () => {
  const naming = (text) =>
    changed((k) => {
      k.texts[THEME_SKILL] += `\n${text}\n`;
    });
  refuses(
    naming("Import `<kit>/tokens/nope.css`."),
    /skills\/ds-theme\/SKILL\.md:\d+.*<kit>\/tokens\/nope\.css/,
  );
  refuses(
    naming("See `.claude/skills/ds-theme/nope.md`."),
    /\.claude\/skills\/ds-theme\/nope\.md/,
  );
  refuses(naming("The rules are in `conventions.md`."), /conventions\.md/);
  // The kit's own resolver is a kit file, and no item carries it.
  refuses(
    naming("Then run `<kit>/tokens/resolve-theme.mjs`."),
    /<kit>\/tokens\/resolve-theme\.mjs/,
  );
});

test("a skill that names something of this repository is refused", () => {
  for (const [text, word] of [
    ["Generate into `apps/web/theme`.", "apps/web"],
    ["As pipao does it.", "pipao"],
    ["The check is in the Pipao repo.", "Pipao"],
    ["See `packages/md3/README.md`.", "packages/md3"],
    ["The record is `docs/wiki/concepts/theming-layers.md`.", "docs/wiki"],
    ["Hosted by french-tech-homies.", "french-tech-homies"],
  ]) {
    const k = changed((c) => {
      c.texts["skills/ds-build/SKILL.md"] += `\n${text}\n`;
    });
    const line = k.texts["skills/ds-build/SKILL.md"].split("\n").length - 1;
    refuses(
      k,
      new RegExp(
        `skills/ds-build/SKILL\\.md:${line}: "${word}" is this repository's`,
      ),
    );
  }
  // The script of a skill is read too, not only its prose.
  refuses(
    changed((k) => {
      k.texts["skills/ds-spec/md3.mjs"] += "\n// packages/md3\n";
    }),
    /skills\/ds-spec\/md3\.mjs:\d+: "packages\/md3"/,
  );
});
