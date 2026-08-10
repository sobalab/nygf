import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "dist/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  next.configs["core-web-vitals"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // This site navigates with plain anchors on purpose: there is no
      // next/link anywhere in it, and the entrances are the reason — the
      // splash, the hero's three beats and every scroll-armed section are
      // staged on a document actually loading, which a client-side transition
      // doesn't do. The rule stayed quiet while /catalogue was a leaf; adding
      // /catalogue/[slug] under it turned four deliberate anchors into errors
      // without any of them changing, so it is turned off rather than worked
      // around four times.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

export default eslintConfig;
