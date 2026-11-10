import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '/workspace',
  test: {
    include: ['drafts/planning/pb11-kata-sim.ts'],
    fileParallelism: false,
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
