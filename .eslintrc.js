module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",

    // see https://emotion.sh/docs/eslint-plugin-react
    "react/no-unknown-property": ["error", { ignore: ["css"] }],

    // make eslint consistent with typescript's rules: prefixing a variable with _
    // means it's ok to be unreferenced
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  env: {
    browser: "true",
    node: "true",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
