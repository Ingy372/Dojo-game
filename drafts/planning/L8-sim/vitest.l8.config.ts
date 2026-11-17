import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['drafts/planning/L8-sim/l8-sim.ts'], testTimeout: 7_200_000 } });
