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
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    "src/lib/utils.ts": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "src/lib/consent-store.ts": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "src/components/ui/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(config);
