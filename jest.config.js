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
  },
};

module.exports = createJestConfig(config);
