import { nodeConfig } from "@resume-builder/eslint-config/node";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // NestJS modules use relative imports between files in the same app
    rules: {
      "no-restricted-imports": "off",
      "import/no-relative-parent-imports": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
