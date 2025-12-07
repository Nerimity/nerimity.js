import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      "indent": ["error", 2],
      "linebreak-style": ["error", "windows"],
      "semi": ["error", "always"],
      
      "quotes": ["error", "double"], 
    },
  },
];