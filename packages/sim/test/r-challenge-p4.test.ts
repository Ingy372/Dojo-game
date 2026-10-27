// R-CHALLENGE P4: pattern tells. The loader keeps each attack's tell and Sensei line, every C1
// pattern has a tell shape, and "first time" is remembered per save (enemy + attack).
import { describe, expect, it } from 'vitest';
import { firstPatternSight, loadEnemy, loadProfile, newProfile, patternKey, patternShape, type EnemyDef } from '../src';
import { testContent } from './load-content';
import bruteData from '../../../content/enemies/brute.json';

const content = testContent();
const patterns = Object.values(content.enemies).flatMap((d: EnemyDef) => (d.challenge?.attacks ?? []).map((a) => ({ d, a })));
const find = (name: string) => patterns.find((x) => x.a.name === name)!;

describe('R-CHALLENGE P4: C1 tells load', () => {
  it('each of the five C1 patterns has a tell, a Sensei line and the right shape', () => {
    const want: Record<string, string> = { 'hop-in jab': 'landing', 'shield rush': 'lane', shockwave: 'lane', 'double slam': 'circle', 'wide bonk': 'circle' };
    expect(patterns.map((x) => x.a.name).sort()).toEqual(Object.keys(want).sort());
    for (const [name, shape] of Object.entries(want)) {
      const { a } = find(name);
      expect(patternShape(a)).toBe(shape);
      expect(a.tell).toMatch(/\S/);
      expect(a.senseiLine).toMatch(/\S/);
    }
  });
  it('normal attacks have no pattern shape (drawn as before)', () => {
    for (const d of Object.values(content.enemies)) for (const a of d.attacks.filter((x) => !x.challenge)) expect(patternShape(a)).toBeNull();
  });
  it('refuses a tell or Sensei line that is not text', () => {
    const block = (extra: object) => ({ ...bruteData, challenge: { fromBelt: 4, attacks: [{ name: 'x', strength: 1, startRange: 1, reach: 1, areaRadius: 1, telegraphTicks: 20, recoverTicks: 18, ...extra }], pattern: ['x'] } });
    expect(() => loadEnemy(block({ senseiLine: 3 }))).toThrow(/senseiLine/);
    expect(() => loadEnemy(block({ tell: '  ' }))).toThrow(/tell/);
    expect(loadEnemy(block({ senseiLine: 'Hi' })).challenge!.attacks[0].senseiLine).toBe('Hi');
  });
});

describe('R-CHALLENGE P4: first sight, per save', () => {
  it('fires once per enemy + attack, and survives save and load', () => {
    const p = newProfile();
    expect(p.patternsSeen).toEqual([]);
    const { d, a } = find('double slam');
    const k = patternKey(d.id, a);
    expect(k).toBe('brute:double slam');
    expect(firstPatternSight(p, k)).toBe(true);
    expect(firstPatternSight(p, k)).toBe(false); // the 2nd hit, and every later fight
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(firstPatternSight(back, k)).toBe(false);
    expect(firstPatternSight(back, patternKey('floor-keeper', find('shockwave').a))).toBe(true);
  });
  it('an old save (no field) starts with nothing seen', () => {
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.patternsSeen;
    expect(loadProfile(old).patternsSeen).toEqual([]);
  });
});

import { createWorld, currentAttack, loadRoom, stepWorld } from '../src';
import keeperData from '../../../content/enemies/floor-keeper.json';
import pinData from '../../../content/enemies/rolling-pin.json';
import swarmerData from '../../../content/enemies/swarmer.json';

describe('R-CHALLENGE P4: no Counter cue for a dash-only wind-up', () => {
  const arena = (enemy: string) =>
    loadRoom({ id: 'arena', name: 'Arena', tiles: ['##############', '#............#', '#............#', '#..P.........#', '#............#', '#............#', '##############'], enemies: [{ enemy, column: 7, row: 3 }] });
  for (const [id, data, opts] of [
    ['floor-keeper', keeperData, { difficulty: 'challenge' as const, challengeAt: { belt: 4, room: 2 } }],
    ['rolling-pin', pinData, { difficulty: 'standard' as const }],
  ] as const) {
    it(`${id}: Sensei's guided Counter (COUNTER!) only picks a counterable warning`, () => {
      const room = arena(id);
      const w = createWorld(room, ['p1'], { enemyTypes: { [id]: loadEnemy(data), swarmer: loadEnemy(swarmerData) }, guideStep: 1, ...opts });
      let dashOnly = 0;
      for (let i = 0; i < 2400; i++) {
        stepWorld(w, room, { p1: { kind: 'none' } });
        w.players.p1.health = Math.max(w.players.p1.health, 5);
        for (const ev of w.events) {
          if (ev.kind === 'telegraph') {
            const e = w.enemies.find((x) => x.id === ev.enemyId)!;
            if (currentAttack(e).counterable === false) dashOnly++;
          }
          if (ev.kind === 'guideStart') expect(currentAttack(w.enemies.find((x) => x.id === ev.enemyId)!).counterable).not.toBe(false);
        }
      }
      expect(dashOnly).toBeGreaterThan(0);
    });
  }
});
