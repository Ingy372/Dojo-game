// Q-SWARM-JAB: on Challenge the swarmer's normal jab winds up for at least MIN_WINDUP_TICKS (10),
// elites included. P1's floor already gives this; these tests lock it in, and the elites loader
// now refuses a minWindupTicks under the floor so content can't undo it.
import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY, ELITE_KINDS, MIN_WINDUP_TICKS, createWorld, currentAttack, eliteWindup, loadElites, loadRoom, stepWorld, telegraphTicks,
  type Difficulty, type EliteKind, type EliteSpawn,
} from '../src';
import elitesData from '../../../content/elites/elites.json';
import { testContent } from './load-content';
import { holdSwing } from './hold-swing';

const content = testContent();
const swarmer = content.enemies.swarmer;
const jab = swarmer.attacks.find((a) => a.name === 'jab')!;
const old = (t: number, d: Difficulty) => Math.round((t - DIFFICULTY.standard.counterWindowTicks) * DIFFICULTY[d].fillScale) + DIFFICULTY[d].counterWindowTicks;

describe('Q-SWARM-JAB: the swarmer jab wind-up', () => {
  it('is exactly 10 ticks on Challenge (was 9), and Guided/Standard are the old formula', () => {
    expect(jab.telegraphTicks).toBe(12);
    expect(telegraphTicks(jab, 'challenge')).toBe(MIN_WINDUP_TICKS);
    for (const d of ['guided', 'standard'] as Difficulty[]) expect(telegraphTicks(jab, d)).toBe(old(jab.telegraphTicks, d));
  });
  it('every swarmer attack (Challenge block included) is at least 10 on Challenge, elites too', () => {
    const all = [...swarmer.attacks, ...(swarmer.challenge?.attacks ?? [])];
    for (const a of all) {
      expect(telegraphTicks(a, 'challenge')).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
      for (const k of ELITE_KINDS) expect(eliteWindup(telegraphTicks(a, 'challenge'), k, 'challenge', content.elites, DIFFICULTY.challenge.counterWindowTicks)).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
    }
  });
});

describe('Q-SWARM-JAB: in play on Challenge', () => {
  const room = loadRoom({ id: 'swarm', name: 'Swarm', tiles: ['##########', '#........#', '#...P....#', '#........#', '##########'], enemies: [{ enemy: 'swarmer', column: 2, row: 2 }, { enemy: 'swarmer', column: 7, row: 2 }, { enemy: 'swarmer', column: 7, row: 3 }] });
  const play = (elites: EliteSpawn[]) => {
    const w = createWorld(room, ['p1'], { enemyTypes: content.enemies, difficulty: 'challenge', elites, eliteRules: content.elites, player: { maxHealth: 1e6, power: 1, guard: 0 } });
    const jabs: number[] = [];
    for (let t = 0; t < 1600; t++) {
      holdSwing(w.players.p1);
      stepWorld(w, room, { p1: { kind: 'none' } });
      for (const ev of w.events) if (ev.kind === 'telegraph' && currentAttack(w.enemies.find((e) => e.id === ev.enemyId)!).name === 'jab') jabs.push(ev.ticks);
    }
    return jabs;
  };
  for (const label of ['none', ...ELITE_KINDS] as const) {
    it(`every swarmer jab telegraph is at least 10 ticks (elite: ${label})`, () => {
      const elites: EliteSpawn[] = label === 'none' ? [] : [0, 1, 2].map((spawn) => ({ spawn, kind: label as EliteKind }));
      const jabs = play(elites);
      expect(jabs.length).toBeGreaterThan(5);
      expect(Math.min(...jabs)).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
    });
  }
});

describe('Q-SWARM-JAB: elites loader guard', () => {
  it(`refuses minWindupTicks under ${MIN_WINDUP_TICKS}; accepts the floor`, () => {
    expect(() => loadElites({ ...elitesData, minWindupTicks: MIN_WINDUP_TICKS - 1 })).toThrow(/minWindupTicks/);
    expect(loadElites({ ...elitesData, minWindupTicks: MIN_WINDUP_TICKS }).minWindupTicks).toBe(MIN_WINDUP_TICKS);
    expect(content.elites.minWindupTicks).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
  });
});
