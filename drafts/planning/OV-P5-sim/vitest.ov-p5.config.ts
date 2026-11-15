import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['drafts/planning/OV-P5-sim/ov-p5-sim.ts'], testTimeout: 3_600_000 } });
