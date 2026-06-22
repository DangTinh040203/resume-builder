import { nodeConfig } from "@resume-builder/eslint-config/node";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nodeConfig,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
