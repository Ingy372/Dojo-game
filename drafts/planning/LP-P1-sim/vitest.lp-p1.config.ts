import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['drafts/planning/LP-P1-sim/lp-p1-coins-sim.ts'],
    testTimeout: 6_000_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
