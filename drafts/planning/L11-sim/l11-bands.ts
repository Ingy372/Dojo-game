/**
 * L11-S balance check (Researcher & Planner, Nov 16 2026). Docs only; not part of the game tests.
 * Same math as packages/sim/test/r-bal-12-bands.test.ts: base numbers x ENEMY_TRAINING_SCALE for the
 * belt, hits for the three model students on Standard (live Challenge has the same Health and Power)
 * and on the test's x1.5 Challenge row, plus enemy hits to knock the student out (Guided Power x0.75).
 * Writes /tmp/l11out/bands.json. Run: npx vitest run -c drafts/planning/L11-sim/vitest.l11.config.ts
 */
import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { byTier, damage, DIFFICULTY, ENEMY_TRAINING_SCALE } from '../../../packages/sim/src';
import { ARTISTS } from '../../../packages/sim/test/r-bal-12-artists';
import { testContent } from '../../../packages/sim/test/load-content';

const content = testContent();
const GUIDED = DIFFICULTY.guided.enemyPowerScale;
type Base = { maxHealth: number; power: number; guard: number };
function check(base: Base, belt: number, student: string, healthMul = 1) {
  const sc = byTier(ENEMY_TRAINING_SCALE, belt);
  const H = Math.max(1, Math.round(base.maxHealth * sc.maxHealth * healthMul));
  const P = Math.round(base.power * sc.power);
  const a = ARTISTS[student][belt - 1];
  const d = damage(a.power, 1, base.guard);
  const ko = (p: number) => Math.ceil(a.health / damage(p, 1, a.guard));
  return { H, P, std: Math.ceil(H / d), x15: Math.ceil((H * 1.5) / d), koStd: ko(P), koX15: ko(P * 1.5), koGuided: ko(P * GUIDED) };
}
const CANDIDATES: Record<string, Base> = {
  'guardian-495': { maxHealth: 495, power: 17, guard: 30 },
  'guardian-549': { maxHealth: 549, power: 17, guard: 30 },
  'guardian-470': { maxHealth: 470, power: 17, guard: 30 },
};
it('l11 bands', () => {
  const out: unknown[] = [];
  for (const [name, base] of Object.entries(CANDIDATES))
    for (let belt = 4; belt <= 10; belt++) for (const s of Object.keys(ARTISTS)) out.push({ name, belt, student: s, ...check(base, belt, s) });
  // Every live enemy that can appear in a tier 4-10 remix room, plain and as an elite (x1.25 Health).
  const elites = content.elites;
  for (const id of Object.keys(content.enemies)) {
    const e = content.enemies[id];
    for (let belt = 4; belt <= 10; belt++) for (const s of Object.keys(ARTISTS)) {
      out.push({ name: id, belt, student: s, ...check(e, belt, s) });
      out.push({ name: `${id}+elite`, belt, student: s, ...check(e, belt, s, 1.25) });
    }
  }
  void elites;
  mkdirSync('/tmp/l11out', { recursive: true });
  writeFileSync('/tmp/l11out/bands.json', JSON.stringify(out));
});
