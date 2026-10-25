import { describe, expect, it } from 'vitest';
import { byTier, damage, ENEMY_TRAINING_SCALE } from '../src';
import { testContent } from './load-content';
import { ARTISTS } from './r-bal-12-artists';

/**
 * R-BAL-12 option B (Manager): every LIVE enemy, scaled by ENEMY_TRAINING_SCALE the way world.ts does,
 * stays inside its #188 band (drafts/planning/balance-research.md, System 2) at every belt it can appear,
 * on Standard and on Challenge x1.5, for all three model students.
 * Artists are the belt-average trained Artists from drafts/planning/r-bal-12-sim.py (pinned here;
 * re-run drafts/planning/r-bal-12f-live-check.py if the training model changes).
 */
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
  // B-T3: Orange belt (Ember Kitchens) enemies, White-belt bases from R-BAL-8/11/13.
  'spark-sprite': { band: SMALL, fromBelt: 3 },
  doughling: { band: SMALL, fromBelt: 3 },
  'dough-blob': { band: MID, fromBelt: 3 },
  'ladle-lobber': { band: MID, fromBelt: 3 },
  'rolling-pin': { band: MID, fromBelt: 3 },
  'hearth-cook': { band: BOSS, fromBelt: 3 },
};

/**
 * B-T3 exception: the Hearth Cook for the "trains more" student on Challenge goes over the 80-hit top
 * (R-BAL-12 found 85-89; drafts/planning/R-BAL-12-training-powers-combat.md line 115, accepted because
 * Challenge is optional; Manager, B-T3). Its Standard hits and every KO check still apply.
 */
const CHALLENGE_TOP_EXCEPTIONS = [{ id: 'hearth-cook', student: 'trainsMore' }];

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
          const excepted = CHALLENGE_TOP_EXCEPTIONS.some((x) => x.id === id && x.student === student);
          r.beat.forEach((hits, i) => {
            expect(hits).toBeGreaterThanOrEqual(band.hits[0]);
            if (!(excepted && i === 1)) expect(hits).toBeLessThanOrEqual(band.hits[1]);
          });
          for (const ko of r.ko) expect(ko).toBeGreaterThanOrEqual(band.koMin);
        });
      }
    }
  }
  it('covers every live enemy file', () => expect(Object.keys(content.enemies).sort()).toEqual(Object.keys(LIVE).sort()));
});
