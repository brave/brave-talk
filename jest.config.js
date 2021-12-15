module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
};
