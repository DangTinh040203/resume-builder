import { nextJsConfig } from '@resume-builder/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    // @/* path aliases resolve to parent dirs after TS resolution — disable
    // the rule that checks resolved paths, since alias imports are the approved pattern.
    rules: {
      'import/no-relative-parent-imports': 'off',
    },
  },
  {
    ignores: [
      '**/*.d.ts',
      'eslint.config.js',
      'postcss.config.mjs',
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.vercel/**',
      'coverage/**',
    ],
  },
];
