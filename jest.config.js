/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: "src",

  // see https://github.com/jestjs/jest/issues/14305#issuecomment-1627346697
  //   since we run prettier on a pre-commit hook anyway, there's no real need for
  //   jest to invoke automatically when creating inline snapshots.
  prettierPath: null,
};

module.exports = config;
