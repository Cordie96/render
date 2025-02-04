import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/tests/performance/**/*.test.ts'],
    setupFiles: ['./src/tests/setup.perf.ts'],
    testTimeout: 60000, // Longer timeout for performance tests
  }
}); 