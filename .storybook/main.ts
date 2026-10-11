import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

// The stories import the kit by its package name. Nothing installs the kit
// under that name when it stands alone, so the catalog resolves it here.
const KIT = "@french-tech-homies/design-system";
const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-themes",
    "@storybook/addon-docs",
    // axe over every story, failing the run on a violation (preview.ts sets
    // `a11y.test: "error"`), and the Vitest runner that executes every story
    // plus its `play` function. See vitest.config.ts.
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: [
        { find: new RegExp(`^${KIT}$`), replacement: `${root}/index.ts` },
        { find: new RegExp(`^${KIT}/`), replacement: `${root}/` },
        ...toAliasList(config.resolve?.alias),
      ],
    },
    build: {
      ...config.build,
      rollupOptions: {
        ...config.build?.rollupOptions,
        // "use client" directives are for Next; Vite has nothing to do with them.
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          warn(warning);
        },
      },
    },
  }),
};

type Alias = { find: string | RegExp; replacement: string };

/** Vite takes aliases as a record or a list; keep whatever was there. */
function toAliasList(alias: unknown): Alias[] {
  if (!alias) return [];
  if (Array.isArray(alias)) return alias as Alias[];
  return Object.entries(alias as Record<string, string>).map(
    ([find, replacement]) => ({ find, replacement }),
  );
}

export default config;
