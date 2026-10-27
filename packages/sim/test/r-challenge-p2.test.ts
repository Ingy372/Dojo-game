// R-CHALLENGE P2: the optional `challenge` block on enemy files (loader, the one switch in
// createWorld, pattern stepping, followUp, landing). Uses test-only sample enemies: no enemy
// file on main has a challenge block yet (that is the Content Designer's C1).
import { describe, expect, it } from 'vitest';
import {
  CHALLENGE_FROM_TIER, challengeDef, createRunWorld, createWorld, currentAttack, currentRoom, damage, loadEnemy, loadRoom, startRun, stepWorld,
  type Difficulty, type EnemyDef, type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import { testContent } from './load-content';
import { holdSwing } from './hold-swing';
import { captureGolden } from './golden-capture';
import goldenRaw from '../../../fixtures/golden/p-menu2-d-default-run.json?raw';

const DOUBLE_SLAM = {
  name: 'double slam', strength: 1, startRange: 1.3, reach: 0.9, areaRadius: 0.95,
  telegraphTicks: 20, recoverTicks: 18, followUp: { strength: 0.6, gapTicks: 18 },
};
const sample = (challenge: unknown) => ({ ...bruteData, id: 'sample-brute', challenge });
const BLOCK = { fromBelt: 4, fromRoom: 2, attacks: [DOUBLE_SLAM], pattern: ['attack', 'attack', 'double slam'] };
const sampleBrute = loadEnemy(sample(BLOCK));

describe('R-CHALLENGE P2: loader', () => {
  it('loads the block: extra attacks, pattern by index, followUp, landing', () => {
    const c = sampleBrute.challenge!;
    expect(c.fromBelt).toBe(4);
    expect(c.fromRoom).toBe(2);
    expect(c.pattern).toEqual([0, 0, 1]);
    expect(c.attacks[0].followUp).toEqual({ strength: 0.6, gapTicks: 18 });
    const hop = loadEnemy(sample({ fromBelt: 4, attacks: [{ ...DOUBLE_SLAM, name: 'hop', followUp: undefined, landing: true }] }));
    expect(hop.challenge!.attacks[0].landing).toBe(true);
    expect(hop.challenge!.fromRoom).toBe(1);
  });

  it('adds no field to enemies without a block', () => {
    expect('challenge' in loadEnemy(bruteData)).toBe(false);
  });

  it.each([
    ['fromBelt below CHALLENGE_FROM_TIER', { ...BLOCK, fromBelt: CHALLENGE_FROM_TIER - 1 }, /fromBelt/],
    ['fromBelt above 10', { ...BLOCK, fromBelt: 11 }, /fromBelt/],
    ['unknown pattern name', { ...BLOCK, pattern: ['attack', 'triple slam'] }, /triple slam/],
    ['strength above 1', { ...BLOCK, attacks: [{ ...DOUBLE_SLAM, strength: 1.2 }] }, /strength" must be 1 or less/],
    ['Challenge wind-up under 14', { ...BLOCK, attacks: [{ ...DOUBLE_SLAM, telegraphTicks: 17 }] }, /under 14/],
    ['followUp gap shorter than recover', { ...BLOCK, attacks: [{ ...DOUBLE_SLAM, followUp: { strength: 0.6, gapTicks: 10 } }] }, /gapTicks/],
    ['followUp strength above 1', { ...BLOCK, attacks: [{ ...DOUBLE_SLAM, followUp: { strength: 1.5, gapTicks: 18 } }] }, /followUp.strength/],
    ['repeated attack name', { ...BLOCK, attacks: [{ ...DOUBLE_SLAM, name: 'attack', followUp: undefined }] }, /repeats/],
    ['empty block', { fromBelt: 4 }, /needs attacks/],
  ])('rejects %s', (_, block, msg) => {
    expect(() => loadEnemy(sample(block))).toThrow(msg);
  });

  it('a wind-up of 18 file ticks is the shortest allowed (Challenge 14)', () => {
    expect(() => loadEnemy(sample({ ...BLOCK, attacks: [{ ...DOUBLE_SLAM, telegraphTicks: 18 }] }))).not.toThrow();
  });
});

describe('R-CHALLENGE P2: the one switch (challengeDef)', () => {
  const at = { belt: 4, room: 2 };
  it.each<[string, Difficulty, { belt: number; room: number } | null]>([
    ['Guided', 'guided', at], ['Standard', 'standard', at], ['practice room (no belt)', 'challenge', null],
    ['belt below fromBelt', 'challenge', { belt: 3, room: 5 }], ['room below fromRoom', 'challenge', { belt: 9, room: 1 }],
  ])('returns the same def object on %s', (_, d, where) => {
    expect(challengeDef(sampleBrute, d, where)).toBe(sampleBrute);
  });

  it('on Challenge at or past the gate: attacks appended, pattern set', () => {
    const def = challengeDef(sampleBrute, 'challenge', at);
    expect(def.attacks.map((a) => a.name)).toEqual(['attack', 'double slam']);
    expect(def.pattern).toEqual([0, 0, 1]);
  });

  it("a boss's Challenge phases replace its normal phases on Challenge only", () => {
    const boss = loadEnemy({
      ...bruteData, id: 'sample-boss', boss: true, radius: 0.8,
      attacks: [{ ...DOUBLE_SLAM, name: 'slam', followUp: undefined }],
      phases: [{ atHealthFraction: 1, attacks: ['slam'] }],
      challenge: { fromBelt: 4, attacks: [{ ...DOUBLE_SLAM, name: 'sweep', followUp: undefined }], phases: [{ atHealthFraction: 1, attacks: ['slam'] }, { atHealthFraction: 0.5, attacks: ['slam', 'sweep', 'slam'], senseiLine: 'Watch it!' }] },
    });
    expect(challengeDef(boss, 'standard', at).phases).toEqual([{ atHealthFraction: 1, attacks: [0], senseiLine: null }]);
    expect(challengeDef(boss, 'challenge', at).phases).toEqual([
      { atHealthFraction: 1, attacks: [0], senseiLine: null },
      { atHealthFraction: 0.5, attacks: [0, 1, 0], senseiLine: 'Watch it!' },
    ]);
  });
});

describe('R-CHALLENGE P2: pattern stepping and followUp in the world', () => {
  const room = loadRoom({ id: 'arena', name: 'Arena', tiles: ['##########', '#........#', '#..P.....#', '#........#', '##########'], enemies: [{ enemy: 'sample-brute', column: 4, row: 2 }] });
  function swings(difficulty: Difficulty, challengeAt: { belt: number; room: number } | null) {
    const w = createWorld(room, ['p1'], { enemyTypes: { 'sample-brute': sampleBrute }, difficulty, challengeAt, player: { maxHealth: 100000, power: 1, guard: 0 } });
    const out: { tick: number; kind: string; name?: string; ticks?: number; damage?: number }[] = [];
    for (let t = 0; t < 1200; t++) {
      holdSwing(w.players.p1); // measure full Hits, not Mash guard Blocks
      stepWorld(w, room, { p1: { kind: 'none' } });
      for (const ev of w.events) {
        if (ev.kind === 'telegraph') out.push({ tick: t, kind: 'tell', name: currentAttack(w.enemies[0]).name, ticks: ev.ticks });
        if (ev.kind === 'hit') out.push({ tick: t, kind: 'hit', damage: ev.damage });
      }
    }
    return out;
  }

  it('follows the pattern; the double slam hits twice, the 2nd weaker with its own full tell after the gap', () => {
    const s = swings('challenge', { belt: 4, room: 2 });
    const tells = s.filter((x) => x.kind === 'tell');
    expect(tells.slice(0, 8).map((x) => x.name)).toEqual(['attack', 'attack', 'double slam', 'double slam', 'attack', 'attack', 'double slam', 'double slam']);
    const ds = s.findIndex((x) => x.name === 'double slam');
    const [tell1, hit1, tell2, hit2] = s.slice(ds, ds + 4);
    expect([tell1.kind, hit1.kind, tell2.kind, hit2.kind]).toEqual(['tell', 'hit', 'tell', 'hit']);
    expect(tell2.ticks).toBe(tell1.ticks); // full tell, Challenge formula (15 ticks)
    expect(tell1.ticks).toBe(15);
    expect(tell2.tick - hit1.tick).toBeGreaterThanOrEqual(DOUBLE_SLAM.followUp.gapTicks);
    expect(hit1.damage).toBe(damage(sampleBrute.power, 1, 0));
    expect(hit2.damage).toBe(damage(sampleBrute.power, 0.6, 0));
  });

  it('Standard, and Challenge in a practice room, never use the pattern', () => {
    for (const s of [swings('standard', { belt: 4, room: 2 }), swings('challenge', null)]) {
      expect(s.filter((x) => x.kind === 'tell').every((x) => x.name === 'attack')).toBe(true);
    }
  });
});

describe('R-CHALLENGE P2: Guided and Standard stay byte-identical', () => {
  it('the golden run matches the fixture file byte for byte', () => {
    expect(JSON.stringify(captureGolden(), null, 2) + '\n').toBe(goldenRaw);
  });

  it('Guided and Standard runs play the same with a challenge block on every enemy', () => {
    const content = testContent();
    const patterned = { ...content, enemies: Object.fromEntries(Object.entries(content.enemies).map(([id, def]): [string, EnemyDef] => [id, {
      ...def, challenge: { fromBelt: 4, fromRoom: 1, attacks: [{ ...def.attacks[0], name: 'extra', followUp: { strength: 0.6, gapTicks: 40 } }], pattern: [0, def.attacks.length], phases: null },
    }])) };
    const play = (c: typeof content, d: Difficulty, seed: number) => {
      const run = startRun(c, { seed, dryRuns: 0, tier: 4, difficulty: d });
      run.depth = 1;
      const w: WorldState = createRunWorld(c, run, { maxHealth: 100000, power: 10, guard: 0 });
      const room = currentRoom(c, run);
      for (let t = 0; t < 900; t++) stepWorld(w, room, { p1: { kind: 'none' } });
      return JSON.stringify(w.enemies.map(({ def: _d, ...e }) => e)) + JSON.stringify(w.players);
    };
    let differs = 0;
    for (const seed of [1, 2, 3, 4]) {
      for (const d of ['guided', 'standard'] as Difficulty[]) expect(play(patterned, d, seed)).toBe(play(content, d, seed));
      if (play(patterned, 'challenge', seed) !== play(content, 'challenge', seed)) differs++;
    }
    expect(differs).toBeGreaterThan(0); // the block does take effect on Challenge
  });
});
