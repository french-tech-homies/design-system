/* =============================================================================
   Rule checks for the one install (scripts/check-install.mjs).

     npm run registry:check-install     # node's test runner

   The first test is the rule itself, on the registry and the skills as
   shipped. The others are fixtures that must be refused: the shipped
   registry with one thing taken out, or a skill text with one thing put in.
   ========================================================================== */

import assert from "node:assert/strict";
import { test } from "node:test";

import { OWN_SKILLS, checkInstall, readKit } from "./check-install.mjs";

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

test("a skill whose frontmatter does not parse is refused", () => {
  const BUILD_SKILL = "skills/ds-build/SKILL.md";
  const rewritten = (rewrite) =>
    changed((k) => {
      const before = k.texts[BUILD_SKILL];
      k.texts[BUILD_SKILL] = rewrite(before);
      assert.notEqual(k.texts[BUILD_SKILL], before, "the fixture changed nothing");
    });
  // A colon and a space in a plain scalar: strict YAML reads a second mapping.
  refuses(
    rewritten((t) => t.replace(/^description: /m, "description: Build screens: ")),
    /skills\/ds-build\/SKILL\.md: frontmatter does not parse/,
  );
  // A name a harness would not find the skill under.
  refuses(
    rewritten((t) => t.replace(/^name: ds-build$/m, "name: build")),
    /skills\/ds-build\/SKILL\.md: frontmatter names the skill "build", and its folder is "ds-build"/,
  );
  // No block at all.
  refuses(
    rewritten((t) => t.replace(/^---\n[\s\S]*?\n---\n/, "")),
    /skills\/ds-build\/SKILL\.md: frontmatter is missing/,
  );
  // A description that is no text.
  refuses(
    rewritten((t) => t.replace(/^description: .*$/m, "description:")),
    /skills\/ds-build\/SKILL\.md: frontmatter has no description/,
  );
});

/* ---- Adobe's React Aria skill: named, not shipped ---------------------- */

const BUILD_SKILL = "skills/ds-build/SKILL.md";
const ARIA_SKILL = "npx skills add https://react-aria.adobe.com";

test("the shipped kit names Adobe's skill in ds-build and once in the README", () => {
  assert.ok(kit.texts[BUILD_SKILL].includes(ARIA_SKILL));
  assert.equal(kit.readme.split(ARIA_SKILL).length - 1, 1);
  // The fallback, and where Material's pages are read.
  assert.match(kit.texts[BUILD_SKILL], /https:\/\/react-aria\.adobe\.com\/\w+\.md/);
  assert.match(kit.texts[BUILD_SKILL], /Material's pages with the `ds-spec` skill/);
  // Every file an item carries is read, not only the skills and the scripts.
  for (const { path } of kit.registry.items.flatMap((i) => i.files ?? [])) {
    assert.equal(typeof kit.texts[path], "string", path);
  }
});

test("`npx skills` is a command a skill may name only because COMMANDS lists it", () => {
  // The same sentence with a command of no list is refused (rule 4).
  refuses(
    changed((k) => {
      k.texts[BUILD_SKILL] = k.texts[BUILD_SKILL].replace(
        ARIA_SKILL,
        "npx skillz add https://react-aria.adobe.com",
      );
    }),
    /skills\/ds-build\/SKILL\.md:\d+: names `npx skillz`/,
  );
});

test("the kit's own skills are the three it names, and the folder holds no other", () => {
  assert.deepEqual(
    [...new Set(kit.skillFiles.map((p) => p.split("/")[1]))].sort(),
    [...OWN_SKILLS].sort(),
  );
});

test("an item that carries a skill that is not the kit's is refused", () => {
  const TARGET = "~/.claude/skills/react-aria/SKILL.md";
  // The kit as `readKit()` would hand it with the skill copied into skills/
  // and built like the kit's own: on disk, carried by an item, reached by
  // `ds`, landed in the project's skills folder. Rule 2 is content; only the
  // list of the kit's own skills refuses it.
  const copied = (files) =>
    changed((k) => {
      k.skillFiles = [...k.skillFiles, ...files.map((f) => `skills/react-aria/${f}`)].sort();
      for (const f of files) {
        k.texts[`skills/react-aria/${f}`] =
          f === "SKILL.md"
            ? "---\nname: react-aria\ndescription: Build accessible components.\n---\n"
            : "# Button\n";
      }
      k.registry.items.push({
        name: "aria-skill",
        type: "registry:file",
        files: files.map((f) => ({
          path: `skills/react-aria/${f}`,
          type: "registry:file",
          target: `~/.claude/skills/react-aria/${f}`,
        })),
      });
      item(k, "ds").registryDependencies.push("@ds/aria-skill");
    });
  for (const files of [["SKILL.md"], ["references/Button.md"], ["SKILL.md", "references/Button.md"]]) {
    const problems = checkInstall(copied(files));
    // Nothing else is wrong with it: every problem is the list's.
    assert.ok(problems.length > 0, `passed with ${files} copied into skills/`);
    for (const p of problems) {
      assert.match(p, /"react-aria" that is not one of the kit's own|skills\/react-aria\/ is not one of the kit's own skills/, p);
    }
    assert.ok(problems.some((p) => /^item "aria-skill" carries skills\/react-aria\//.test(p)));
    assert.ok(problems.some((p) => /^skills\/react-aria\/ is not one of the kit's own skills \(ds-theme, ds-build, ds-spec\)/.test(p)));
  }
  // On disk and carried by nothing: refused by the list (and by rule 2).
  refuses(
    changed((k) => {
      k.skillFiles = [...k.skillFiles, "skills/react-aria/SKILL.md"];
      k.texts["skills/react-aria/SKILL.md"] = "---\nname: react-aria\ndescription: x\n---\n";
    }),
    /^skills\/react-aria\/ is not one of the kit's own skills/,
  );
  // Under another path of the kit, landed as a skill.
  refuses(
    changed((k) => {
      item(k, "build-skill").files.push({
        path: "vendor/aria.md",
        type: "registry:file",
        target: TARGET,
      });
    }),
    /item "build-skill" carries vendor\/aria\.md .*"react-aria"/,
  );
  // From a skill folder that is not the kit's, landed in the kit's folder.
  refuses(
    changed((k) => {
      k.skillFiles = [...k.skillFiles, "skills/react-aria/references/Button.md"];
      k.texts["skills/react-aria/references/Button.md"] = "# Button\n";
      item(k, "ds").files.push({
        path: "skills/react-aria/references/Button.md",
        type: "registry:file",
        target: "@ui/ds/aria/Button.md",
      });
    }),
    /item "ds" carries skills\/react-aria\/references\/Button\.md/,
  );
});

test("the command that installs Adobe's skill is said in ds-build and once in the README, nowhere else", () => {
  refuses(
    changed((k) => {
      k.texts[THEME_SKILL] += `\nRun \`${ARIA_SKILL}\`.\n`;
    }),
    /skills\/ds-theme\/SKILL\.md: names `npx skills add`/,
  );
  // A kit file an item carries, not a skill.
  refuses(
    changed((k) => {
      k.texts["components/Button.tsx"] += `\n// ${ARIA_SKILL}\n`;
    }),
    /components\/Button\.tsx: names `npx skills add`/,
  );
  refuses(
    changed((k) => {
      k.texts[BUILD_SKILL] = k.texts[BUILD_SKILL].replace(ARIA_SKILL, "");
    }),
    /skills\/ds-build\/SKILL\.md: does not name `npx skills add`/,
  );
  refuses(
    changed((k) => {
      k.readme += `\n${ARIA_SKILL}\n`;
    }),
    /README\.md: names `npx skills add` 2 times/,
  );
  refuses(
    changed((k) => {
      k.readme = k.readme.replace(ARIA_SKILL, "");
    }),
    /README\.md: names `npx skills add` 0 times/,
  );
});

test("React Aria's MCP server is named nowhere an install reaches", () => {
  for (const text of [
    "Or `npx @react-aria/mcp@latest`.",
    "The React Aria MCP server answers the same.",
    "Use the MCP server of react-aria.",
  ]) {
    refuses(
      changed((k) => {
        k.texts[BUILD_SKILL] += `\n${text}\n`;
      }),
      /skills\/ds-build\/SKILL\.md: names React Aria's MCP server/,
    );
  }
});
