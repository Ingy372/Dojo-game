import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '/agent/repos/Dojo-game',
  test: {
    include: ['drafts/planning/j21-seal-sim.ts'],
    fileParallelism: false,
    testTimeout: 900_000,
    hookTimeout: 900_000,
  },
});
