import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: [
      "build/**",
      ".react-router/**",
      "dist/**",
      "eslint.config.mjs",
      "vite.config.ts",
    ],
  },
];
