const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/i18n/**/*.ts",
    "src/components/ui/**/*.tsx",
    "src/app/api/**/*.ts",
    "!src/**/*.d.ts",
  ],
};

module.exports = createJestConfig(config);
