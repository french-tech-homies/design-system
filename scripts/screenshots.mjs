#!/usr/bin/env node
/**
 * The story tests with their screenshots compared, inside the Playwright image
 * the CI runs in: the same Chromium and the same fonts, so a baseline made
 * here is the CI's to the pixel.
 *
 *     npm run screenshots                       # compare every story, as the CI does
 *     npm run screenshots -- stories/actions/Button.stories.tsx
 *     npm run screenshots:update -- stories/actions/Button.stories.tsx
 *     npm run screenshots:update -- --project=editorial -t Filled
 *
 * Whatever follows `--` is Vitest's: a file filter, `--project`, `-t`. The
 * update writes the baselines of what it ran into `screenshots/`: run it on
 * what was changed on purpose, and commit the pictures with the change.
 *
 * Needs Docker. The image is the one for the Playwright package.json pins.
 * Its own Linux `node_modules` is kept apart from this checkout's, under
 * `node_modules/.cache/md3-screenshots/`, and installed again only when the
 * lockfile moves. Where Docker cannot run, the CI is the fallback: a failed
 * comparison keeps its actual image in the run's `screenshots` artifact, and
 * that image, renamed to the baseline's name, is the new baseline.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The Playwright image for the version package.json pins: the CI's too. */
export function imageFor(pkg) {
  const version = pkg.devDependencies?.playwright ?? "";
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`playwright is not pinned to one version in package.json (${version}): no image could match it`);
  }
  return `mcr.microsoft.com/playwright:v${version}-noble`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run(imageFor(JSON.parse(readFileSync(join(root, "package.json"), "utf8"))), process.argv.slice(2));
}

function run(image, args) {
  const modules = join(root, "node_modules", ".cache", "md3-screenshots", "node_modules");
  mkdirSync(modules, { recursive: true });

  const user = process.getuid ? ["--user", `${process.getuid()}:${process.getgid()}`] : [];
  const inside = [
    "set -e",
    // Installed again only when the lockfile moved since the last install.
    "if ! cmp -s package-lock.json node_modules/.md3-lock; then",
    "  npm ci --no-audit --no-fund --ignore-scripts",
    "  cp package-lock.json node_modules/.md3-lock",
    "fi",
    'exec npx vitest run "$@"',
  ].join("\n");

  console.log(`Story tests with screenshots, in ${image}`);
  const docker = spawnSync(
    "docker",
    [
      "run", "--rm", "--init", "--ipc=host",
      ...user,
      "-e", "HOME=/tmp/home",
      "-e", "CI=1",
      "-e", "MD3_SCREENSHOTS=1",
      "-v", `${root}:/work`,
      "-v", `${modules}:/work/node_modules`,
      "-w", "/work",
      image,
      "bash", "-c", inside, "screenshots", ...args,
    ],
    { stdio: "inherit" },
  );
  if (docker.error) {
    console.error(`docker could not run (${docker.error.message}). Without it, the CI's screenshots artifact is the fallback: see this file's header.`);
    process.exit(1);
  }
  process.exit(docker.status ?? 1);
}
