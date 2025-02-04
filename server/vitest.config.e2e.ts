import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/tests/e2e/**/*.test.ts'],
    setupFiles: ['./src/tests/setup.e2e.ts'],
    testTimeout: 30000, // Longer timeout for e2e tests
  }
}); 