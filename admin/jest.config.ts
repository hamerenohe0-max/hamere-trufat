import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.tsx",
    "**/__tests__/**/*.spec.tsx",
    "**/*.test.tsx",
    "**/*.spec.tsx",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
};

export default config;
