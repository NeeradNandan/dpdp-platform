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
    "src/i18n/config.ts",
    "src/components/ui/**/*.tsx",
    "src/app/api/**/*.ts",
    "!src/lib/supabase/**",
    "!src/lib/grievance/**",
    "!src/app/api/grievance/**",
    "!src/app/api/widget/**",
    "!src/app/api/auth/**",
    "!src/app/api/consent/[id]/**",
    "!src/app/api/consent/audit/**",
    "!src/app/api/consent/purposes/**",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Per-file minimums — every file must individually meet these.
    // Prevents new files from passing at 0% while the global average holds.
    "./src/components/ui/**/*.tsx": {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./src/lib/**/*.ts": {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/app/api/**/*.ts": {
      branches: 40,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

module.exports = createJestConfig(config);
