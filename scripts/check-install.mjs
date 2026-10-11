#!/usr/bin/env node
/* =============================================================================
   The one install is whole, and its skills are the kit's

     node scripts/check-install.mjs
     npm run registry:check-install     # the same rules, as tests

   A project runs `npx shadcn add @ds/ds` and opens its agent. This checks,
   on registry.json and the skills as they are in the kit, that what it then
   holds needs nothing else from the kit:

   - `ds` reaches the DESIGN.md generator, with its template beside it;
   - `ds` reaches every file under skills/, landed in the project's
     `.claude/skills/`;
   - every file a skill names (`<kit>/…`, `.claude/skills/…`, a file beside
     it) is one the install brings;
   - the item that carries a script declares what the script imports, and the
     generator's item declares the package of every `npx` command a skill
     names, each at the range of the kit's own package.json;
   - no skill file names anything of the repository the kit is built in.

   `checkInstall` is pure (the kit in, a list of problems out) so the rule
   checks in check-install.check.mjs can hand it a kit with one thing wrong.
   Run from the kit's folder or from anywhere; the paths are the script's own.
   ========================================================================== */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY = "ds";
const NS = "@ds/";
const KIT_TARGET = "@ui/ds/";
const SKILLS_TARGET = "~/.claude/skills/";
const GENERATOR = "tokens/generate-theme.mjs";
const GENERATOR_FILES = [GENERATOR, "tokens/design-md.mjs"];
const TEMPLATE = "tokens/theme.v4.css";

/** `npx <command>` → the package that provides it. `null`: nothing to
    declare, the project has it already (the CLI the kit is installed with). */
const COMMANDS = {
  tsx: "tsx",
  designmd: "@google/design.md",
  shadcn: null,
};

/** Bare file names a skill may use for a file of the project, not the kit. */
const PROJECT_FILES = new Set([
  "DESIGN.md",
  "DESIGN.resolved.md",
  "theme.css",
  "theme.v4.css",
  "components.json",
  "package.json",
  "spec-version.json",
]);

/** Words of the repository the kit is built in. A skill is read in any
    project, where none of them means anything. */
const REPOSITORY_WORDS = [
  /pipao/i,
  /apps\/web/,
  /packages\/[a-z0-9-]+/,
  /docs\/wiki/,
  /french-tech-homies/,
  /\.agents\//,
  /@pipao\b/,
];

/** `name@range` → [name, range]; the name may be scoped. */
const splitDependency = (d) => {
  const at = d.lastIndexOf("@");
  return at > 0 ? [d.slice(0, at), d.slice(at + 1)] : [d, ""];
};

/** The package of an import specifier, or null for a builtin or a relative. */
const packageOf = (specifier) => {
  if (specifier.startsWith(".") || specifier.startsWith("node:")) return null;
  const [first, second] = specifier.split("/");
  return first.startsWith("@") ? `${first}/${second}` : first;
};

const imports = (source) =>
  [
    ...source.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g),
    ...source.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
  ].map((m) => m[1]);

/**
 * @param {object} kit
 * @param {object} kit.registry    registry.json, parsed
 * @param {object} kit.pkg         the kit's package.json, parsed
 * @param {string[]} kit.skillFiles every file under skills/, kit-relative
 * @param {Record<string, string>} kit.texts kit-relative path → content, for
 *   every skill file and every `.mjs` the registry carries
 * @returns {string[]} problems; empty when the install is whole
 */
export function checkInstall({ registry, pkg, skillFiles, texts }) {
  const problems = [];
  const items = new Map(registry.items.map((i) => [i.name, i]));

  // What `add @ds/ds` installs: the item and everything it depends on.
  const closure = new Map();
  const walk = (name) => {
    if (closure.has(name)) return;
    const found = items.get(name);
    if (!found) {
      problems.push(`registry: no item "${name}"`);
      return;
    }
    closure.set(name, found);
    for (const d of found.registryDependencies ?? []) {
      if (d.startsWith(NS)) walk(d.slice(NS.length));
    }
  };
  walk(ENTRY);

  /** kit-relative path → { item, target } for every file of the install. */
  const landed = new Map();
  for (const found of closure.values()) {
    for (const f of found.files ?? []) {
      landed.set(f.path, { item: found, target: f.target });
    }
  }
  const targets = [...landed.values()].map((l) => l.target);
  /** A named path is brought when it is a file's target or a folder of one. */
  const brought = (target) =>
    targets.some((t) => t === target || t.startsWith(`${target}/`));

  // 1. The generator, and the template it reads beside itself.
  for (const path of GENERATOR_FILES) {
    if (!landed.has(path)) {
      problems.push(
        `"${ENTRY}" does not reach the generator: no item it installs carries ${path}`,
      );
    }
  }
  const generator = landed.get(GENERATOR);
  const template = landed.get(TEMPLATE);
  if (generator) {
    if (
      !template ||
      posix.dirname(template.target) !== posix.dirname(generator.target)
    ) {
      problems.push(
        `${TEMPLATE} must land beside ${GENERATOR}, which reads it as its template: it lands at ${template?.target ?? "nowhere"}, the generator at ${generator.target}`,
      );
    }
  }

  // 2. Every skill file, in the project's own skills folder.
  for (const path of skillFiles) {
    const expected = SKILLS_TARGET + path.slice("skills/".length);
    const found = landed.get(path);
    if (!found) {
      problems.push(
        `"${ENTRY}" does not reach a skill: no item it installs carries ${path}`,
      );
    } else if (found.target !== expected) {
      problems.push(
        `${path} lands at ${found.target}, not ${expected} (the project's skills folder)`,
      );
    }
  }

  // 3. What a script imports is declared by the item that carries it.
  const declares = (found, name) => {
    const declared = [
      ...(found.dependencies ?? []),
      ...(found.devDependencies ?? []),
    ]
      .map(splitDependency)
      .find(([n]) => n === name);
    if (!declared) return "missing";
    const own = pkg.devDependencies?.[name] ?? pkg.dependencies?.[name];
    if (declared[1] !== own) {
      problems.push(
        `item "${found.name}" declares ${name}@${declared[1]}, but the kit's package.json has ${name}@${own ?? "nothing"}`,
      );
    }
    return "declared";
  };
  for (const [path, { item: found, target }] of landed) {
    if (!path.endsWith(".mjs")) continue;
    for (const specifier of imports(texts[path] ?? "")) {
      if (specifier.startsWith(".")) {
        const beside = posix.join(posix.dirname(target), specifier);
        if (!targets.includes(beside)) {
          problems.push(
            `${path} imports "${specifier}", which the install does not land at ${beside}`,
          );
        }
        continue;
      }
      const name = packageOf(specifier);
      if (name && declares(found, name) === "missing") {
        problems.push(
          `item "${found.name}" carries ${path}, which imports "${name}", and does not declare it`,
        );
      }
    }
  }

  // 4. What the skills name.
  for (const path of skillFiles.filter((p) => p.endsWith(".md"))) {
    const folder = posix.dirname(path);
    (texts[path] ?? "").split("\n").forEach((line, index) => {
      const at = `${path}:${index + 1}`;

      for (const m of line.matchAll(/<kit>\/([A-Za-z0-9._/-]*[A-Za-z0-9_-])/g)) {
        if (!brought(KIT_TARGET + m[1])) {
          problems.push(
            `${at}: names <kit>/${m[1]}, which "${ENTRY}" does not install`,
          );
        }
      }
      for (const m of line.matchAll(
        /\.claude\/skills\/([A-Za-z0-9._/-]*[A-Za-z0-9_-])/g,
      )) {
        if (!brought(SKILLS_TARGET + m[1])) {
          problems.push(
            `${at}: names .claude/skills/${m[1]}, which "${ENTRY}" does not install`,
          );
        }
      }
      // A bare file name in code: a file beside the skill, or the project's.
      for (const m of line.matchAll(/`([A-Za-z0-9._-]+\.(?:md|mjs|json))`/g)) {
        if (PROJECT_FILES.has(m[1])) continue;
        if (!skillFiles.includes(`${folder}/${m[1]}`)) {
          problems.push(
            `${at}: names ${m[1]}, which is not beside the skill and is not a file of the project. Name a kit file as <kit>/…`,
          );
        }
      }
      for (const m of line.matchAll(/\bnpx\s+([a-z0-9@/._-]+)/g)) {
        const command = m[1];
        if (!(command in COMMANDS)) {
          problems.push(
            `${at}: names \`npx ${command}\`, a command no package of the install provides (COMMANDS in scripts/check-install.mjs)`,
          );
          continue;
        }
        const name = COMMANDS[command];
        if (name && generator && declares(generator.item, name) === "missing") {
          problems.push(
            `${at}: names \`npx ${command}\`, and item "${generator.item.name}" does not declare "${name}"`,
          );
        }
      }
    });
  }

  // 5. Nothing of this repository in a file that is read in any project.
  for (const path of skillFiles) {
    (texts[path] ?? "").split("\n").forEach((line, index) => {
      for (const word of REPOSITORY_WORDS) {
        const m = line.match(word);
        if (m) {
          problems.push(
            `${path}:${index + 1}: "${m[0]}" is this repository's, and a skill is read in any project`,
          );
          break;
        }
      }
    });
  }

  return [...new Set(problems)];
}

/** The kit as it is on disk, in the shape `checkInstall` takes. */
export function readKit() {
  const kit = dirname(dirname(fileURLToPath(import.meta.url)));
  const read = (p) => readFileSync(join(kit, p), "utf8");
  const registry = JSON.parse(read("registry.json"));
  const skillFiles = readdirSync(join(kit, "skills"), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((e) => e.isFile())
    .map((e) =>
      posix.join(
        "skills",
        e.parentPath.slice(join(kit, "skills").length + 1).replaceAll("\\", "/"),
        e.name,
      ),
    )
    .sort();
  const carried = registry.items
    .flatMap((i) => i.files ?? [])
    .map((f) => f.path)
    .filter((p) => p.endsWith(".mjs"));
  const texts = Object.fromEntries(
    [...new Set([...skillFiles, ...carried])].map((p) => [p, read(p)]),
  );
  return { registry, pkg: JSON.parse(read("package.json")), skillFiles, texts };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const kit = readKit();
  const problems = checkInstall(kit);
  if (problems.length) {
    console.error(
      `\`shadcn add @ds/${ENTRY}\` would not bring a whole install — ${problems.length} problem(s):`,
    );
    for (const p of problems) console.error(`  ${p}`);
    console.error(
      "\nFix scripts/build-registry.mjs or the skill, then run 'npm run registry:build'.",
    );
    process.exit(1);
  }
  console.log(
    `ok: @ds/${ENTRY} brings the generator, ${kit.skillFiles.length} skill files and every file they name`,
  );
}
