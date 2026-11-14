import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['drafts/planning/ov-p1-powerups-sim.ts'],
    testTimeout: 600_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
