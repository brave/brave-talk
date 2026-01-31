const { defineConfig, globalIgnores } = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");

const { fixupConfigRules } = require("@eslint/compat");

const globals = require("globals");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "prettier",
      ),
    ),

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/static-components": "off",

      "react/no-unknown-property": [
        "error",
        {
          ignore: ["css"],
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
  globalIgnores(["src/js/jwt-decode.js", "**/webpack.config.js"]),
]);
