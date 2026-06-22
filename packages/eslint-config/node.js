import globals from "globals";

import { config as baseConfig } from "./base.js";

/**
 * ESLint configuration for Node.js / NestJS backends.
 *
 * @type {import("eslint").Linter.Config}
 */
export const nodeConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // NestJS uses decorators — no-console fine in server context
      "no-console": "off",
    },
  },
];
