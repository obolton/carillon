import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["**/__tests__/**"],
      reporter: ["text"],
    },
  },
});
