module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "react-app",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
  env: {
    browser: "true",
    node: "true",
  },
};
