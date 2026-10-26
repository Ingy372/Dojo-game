import { describe, expect, it } from 'vitest';
import { byTier, damage, ENEMY_TRAINING_SCALE } from '../src';
import { testContent } from './load-content';

/**
 * R-BAL-12 option B (Manager): every LIVE enemy, scaled by ENEMY_TRAINING_SCALE the way world.ts does,
 * stays inside its #188 band (drafts/planning/balance-research.md, System 2) at every belt it can appear,
 * on Standard and on Challenge x1.5, for all three model students.
 * Artists are the belt-average trained Artists from drafts/planning/r-bal-12-sim.py (pinned here;
 * re-run drafts/planning/r-bal-12f-live-check.py if the training model changes).
 */
const ARTISTS: Record<string, Array<{ power: number; health: number; guard: number }>> = {
  typical: [
    { power: 17.02, health: 146.96, guard: 9.34 },
    { power: 30.70, health: 237.08, guard: 23.05 },
    { power: 45.85, health: 332.79, guard: 33.53 },
    { power: 65.62, health: 434.41, guard: 40.89 },
    { power: 89.91, health: 540.85, guard: 47.33 },
    { power: 116.24, health: 660.63, guard: 52.57 },
    { power: 143.80, health: 791.61, guard: 58.04 },
    { power: 175.24, health: 928.30, guard: 62.41 },
    { power: 212.63, health: 1066.73, guard: 65.46 },
    { power: 251.30, health: 1206.14, guard: 68.54 },
  ],
  trainsMore: [
    { power: 15.85, health: 148.06, guard: 9.18 },
    { power: 25.96, health: 234.03, guard: 21.73 },
    { power: 38.79, health: 334.42, guard: 31.20 },
    { power: 56.70, health: 465.62, guard: 39.37 },
    { power: 79.76, health: 605.19, guard: 45.72 },
    { power: 103.84, health: 747.67, guard: 51.02 },
    { power: 129.71, health: 897.05, guard: 56.32 },
    { power: 161.51, health: 1051.95, guard: 60.65 },
    { power: 197.51, health: 1210.07, guard: 64.15 },
    { power: 234.61, health: 1368.14, guard: 67.20 },
  ],
  playsOnly: [
    { power: 17.02, health: 138.78, guard: 9.34 },
    { power: 30.70, health: 211.58, guard: 23.05 },
    { power: 45.85, health: 289.96, guard: 33.53 },
    { power: 65.62, health: 374.24, guard: 40.89 },
    { power: 89.91, health: 463.21, guard: 47.33 },
    { power: 116.24, health: 554.97, guard: 52.57 },
    { power: 143.80, health: 651.26, guard: 58.04 },
    { power: 175.24, health: 753.30, guard: 62.41 },
    { power: 212.63, health: 857.08, guard: 65.46 },
    { power: 251.30, health: 961.79, guard: 68.54 },
  ],
};
const CHALLENGE = 1.5;
type Band = { hits: [number, number]; koMin: number };
const SMALL: Band = { hits: [2, 4], koMin: 12 };
const MID: Band = { hits: [5, 10], koMin: 8 };
const HEAVY: Band = { hits: [10, 20], koMin: 5 };
const BOSS: Band = { hits: [40, 80], koMin: 5 };
/** Band and first belt for every live enemy. A new live enemy must be added here (see the last test). */
const LIVE: Record<string, { band: Band; fromBelt: number }> = {
  swarmer: { band: SMALL, fromBelt: 1 },
  shield: { band: MID, fromBelt: 1 },
  bopper: { band: MID, fromBelt: 2 },
  brute: { band: HEAVY, fromBelt: 1 },
  'floor-keeper': { band: BOSS, fromBelt: 1 },
};

const content = testContent();

export function bandCheck(id: string, belt: number, student: string) {
  const base = content.enemies[id];
  const sc = byTier(ENEMY_TRAINING_SCALE, belt);
  const H = Math.max(1, Math.round(base.maxHealth * sc.maxHealth));
  const P = Math.round(base.power * sc.power);
  const a = ARTISTS[student][belt - 1];
  const d = damage(a.power, 1, base.guard);
  return {
    beat: [Math.ceil(H / d), Math.ceil((H * CHALLENGE) / d)],
    ko: [Math.ceil(a.health / damage(P, 1, a.guard)), Math.ceil(a.health / damage(P * CHALLENGE, 1, a.guard))],
  };
}

describe('R-BAL-12: live enemies stay in the #188 bands at every belt', () => {
  it('has one scale row per belt', () => expect(ENEMY_TRAINING_SCALE.length).toBe(10));
  for (const [id, { band, fromBelt }] of Object.entries(LIVE)) {
    for (let belt = fromBelt; belt <= 10; belt++) {
      for (const student of Object.keys(ARTISTS)) {
        it(`${id} at belt ${belt} for ${student}`, () => {
          const r = bandCheck(id, belt, student);
          for (const hits of r.beat) {
            expect(hits).toBeGreaterThanOrEqual(band.hits[0]);
            expect(hits).toBeLessThanOrEqual(band.hits[1]);
          }
          for (const ko of r.ko) expect(ko).toBeGreaterThanOrEqual(band.koMin);
        });
      }
    }
  }
  it('covers every live enemy file', () => expect(Object.keys(content.enemies).sort()).toEqual(Object.keys(LIVE).sort()));
});
