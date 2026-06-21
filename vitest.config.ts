import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/{unit,content}/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**', 'src/content/**'],
      reporter: ['text', 'html'],
      // Gate the ENGINE (the logic) at >=80%. Content is data — exercised by the
      // seed sweep + E2E, not unit-covered per-line — so it is not gated here.
      thresholds: {
        'src/engine/**': { statements: 90, branches: 80, functions: 90, lines: 90 },
      },
    },
  },
});
