// G2B-04: the enemy "thrown" state and the Throw family's two effects (#11 Outside Reap: counterThrow, #12 Reap and
// Finish: downBonus), plus the Lock caps the Manager set (2026-11-02): the hold after a Perfect Counter caps at 24 ticks
// (Counter #6 included) and the Seals' staggerBonus caps at +20%. Brutes and swarmers only; never Guardians or elites.
import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  buildTraining,
  canThrow,
  capSealEffects,
  characterSetup,
  createWorld,
  emptyLoadout,
  loadEnemy,
  loadFeed,
  loadRoom,
  modsFrom,
  newProfile,
  stepWorld,
  trainingStats,
  TICKS_PER_SECOND,
  type CombatEvent,
  type EnemyState,
  type PlayerInput,
  type PlayerSetup,
  type WorldState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import swarmerData from '../../../content/enemies/swarmer.json';
import keeperData from '../../../content/enemies/floor-keeper.json';
import familiesJson from '../../../content/abilities/seal-families.json';
import green from '../../../fixtures/4-green-belt.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import { testContent } from './load-content';

const content = testContent();
const brute = loadEnemy(bruteData);
const IDLE: PlayerInput = { kind: 'none' };
const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
  enemies: [{ enemy: 'brute', column: 5, row: 4 }],
});

function gentle(data: unknown, seals: string[]): PlayerSetup {
  const feed = loadFeed(data);
  const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
  const c = characterSetup({ ...newProfile(), loadout: { ...emptyLoadout(), seals } }, t, content.abilities);
  return { ...c, power: c.power - trainingStats(t).power, mods: modsFrom(c.effects, TICKS_PER_SECOND) };
}
const world = (player?: PlayerSetup): WorldState => createWorld(room, ['p1'], { enemyTypes: { brute }, difficulty: 'standard', player });

function stepUntil(w: WorldState, kind: CombatEvent['kind'], max = 400): number {
  for (let i = 0; i < max; i++) {
    const tick = w.tick;
    stepWorld(w, room, { p1: IDLE });
    if (w.events.some((ev) => ev.kind === kind)) return tick;
  }
  throw new Error(`no ${kind} within ${max} ticks`);
}
/** A Perfect Counter on the brute's first swing; returns the impact tick's events. */
function perfect(w: WorldState): CombatEvent[] {
  const start = stepUntil(w, 'telegraph');
  const impact = start + w.enemies[0].windupTotal;
  while (w.tick <= impact) stepWorld(w, room, { p1: w.tick === impact - 1 ? { kind: 'none', action: 'counter' } : IDLE });
  return w.events;
}

describe('G2B-04: Throw is live with its two ranks', () => {
  it('the Throw family is live; #11 throws down for 30 ticks, #12 adds 25% while down (S4 / R-G2B-balance-check G)', () => {
    const f = content.abilities.families.find((x) => x.id === 'throw')!;
    expect(f.live).toBe(true);
    expect(f.ranks.map((r) => [r.technique, r.effects])).toEqual([[11, [{ type: 'counterThrow', amount: 30 }]], [12, [{ type: 'downBonus', amount: 0.25 }]]]);
    // Lock waits for its first rank (#17 Arm Bar, R-G2B-09): a live family needs ranks.
    expect(familiesJson.families.find((x) => x.id === 'lock')!.live).toBe(false);
  });

  it('only brutes and swarmers are throwable in content; a Guardian can never be marked throwable', () => {
    const throwable = Object.values(content.enemies).filter((d) => d.throwable).map((d) => d.id).sort();
    expect(throwable).toEqual(['brute', 'swarmer']);
    expect(loadEnemy(swarmerData).throwable).toBe(true);
    for (const d of Object.values(content.enemies)) if (d.boss) expect(d.throwable, d.id).toBeUndefined();
    expect(() => loadEnemy({ ...keeperData, throwable: true })).toThrow(/Guardian/);
  });
});

describe('G2B-04: the thrown state', () => {
  it('a Perfect Counter with Outside Reap (#11) throws a brute: it tumbles 1 tile away and is down 30 ticks', () => {
    const w = world(gentle(green, ['throw']));
    const before = { ...w.enemies[0].pos };
    const p = w.players.p1;
    const events = perfect(w);
    expect(events.some((e) => e.kind === 'perfectCounter')).toBe(true);
    expect(events).toContainEqual({ kind: 'thrown', playerId: 'p1', enemyId: w.enemies[0].id });
    const e = w.enemies[0];
    expect(e.mode).toBe('thrown');
    expect(e.modeTicks).toBe(30);
    const d = (q: { x: number; y: number }) => Math.hypot(q.x - p.pos.x, q.y - p.pos.y);
    expect(d(e.pos) - d(before)).toBeGreaterThan(0.9);
  });

  it('while down it never winds up; after 30 ticks it gets up and chases again', () => {
    const w = world(gentle(green, ['throw']));
    perfect(w);
    const e = w.enemies[0];
    w.players.p1.pos = { x: 1.5, y: 1.5 }; // out of reach, so the down time is not cut short by a defeat
    const modes: string[] = [];
    for (let i = 0; i < 30; i++) {
      stepWorld(w, room, { p1: IDLE });
      modes.push(e.mode);
    }
    expect(modes.slice(0, 29).every((m) => m === 'thrown')).toBe(true);
    expect(modes[29]).toBe('chase');
  });

  it('without Throw equipped the same Perfect Counter staggers instead', () => {
    const w = world(gentle(green, []));
    const events = perfect(w);
    expect(events.some((e) => e.kind === 'thrown')).toBe(false);
    expect(w.enemies[0].mode).toBe('stagger');
  });

  it('Reap and Finish (#12): a thrown enemy takes 25% more from the same hits', () => {
    const run = (downBonus: number) => {
      const s = gentle(green, ['throw']);
      const w = world({ ...s, mods: { ...s.mods!, downBonus } });
      perfect(w);
      const e = w.enemies[0];
      const h0 = e.health;
      // Walk up and let the basic attacks land while it is down.
      for (let i = 0; i < 25 && e.mode === 'thrown'; i++) {
        w.players.p1.pos = { x: e.pos.x - (e.def.radius + 0.35), y: e.pos.y };
        stepWorld(w, room, { p1: IDLE });
      }
      return h0 - e.health;
    };
    const plain = run(0), bonus = run(0.25);
    expect(plain).toBeGreaterThan(0);
    expect(bonus).toBeGreaterThan(plain);
    expect(bonus / plain).toBeGreaterThan(1.15);
    expect(bonus / plain).toBeLessThan(1.35);
  });

  it('a Guardian or an elite is never thrown, even with Outside Reap', () => {
    const p = { mods: { counterThrowTicks: 30 } };
    const base = { def: { ...brute, throwable: true, boss: false }, elite: null } as unknown as EnemyState;
    expect(canThrow(p, base)).toBe(true);
    expect(canThrow(p, { ...base, def: { ...base.def, boss: true } } as EnemyState)).toBe(false);
    expect(canThrow(p, { ...base, elite: 'guarding' } as unknown as EnemyState)).toBe(false);
    expect(canThrow({ mods: { counterThrowTicks: 0 } }, base)).toBe(false);
    expect(canThrow(p, { ...base, def: { ...base.def, throwable: undefined } } as EnemyState)).toBe(false);
  });
});

describe('G2B-04: Lock caps', () => {
  it('the hold after a Perfect Counter caps at 24 ticks, Counter #6 included', () => {
    expect(COMBAT.counter.holdCapTicks).toBe(24);
    const s = gentle(yellow, ['counter']);
    for (const extra of [10, 40]) {
      const w = world({ ...s, mods: { ...s.mods!, staggerTicks: extra } });
      perfect(w);
      expect(w.enemies[0].mode).toBe('stagger');
      expect(w.enemies[0].modeTicks).toBe(24);
    }
    const w = world({ ...s, mods: { ...s.mods!, staggerTicks: 2 } });
    perfect(w);
    expect(w.enemies[0].modeTicks).toBe(22);
  });

  it("the Seals' staggerBonus together caps at +20%; under the cap nothing changes", () => {
    expect(COMBAT.counter.sealStaggerBonusCap).toBe(0.2);
    const sum = (es: { type: string; amount: number }[]) => es.filter((e) => e.type === 'staggerBonus').reduce((a, e) => a + e.amount, 0);
    expect(sum(capSealEffects([{ type: 'staggerBonus', amount: 0.15 }, { type: 'staggerBonus', amount: 0.15 }]))).toBeCloseTo(0.2, 10);
    const under = [{ type: 'staggerBonus' as const, amount: 0.15 }, { type: 'blockCut' as const, amount: 0.1 }];
    expect(capSealEffects(under)).toEqual(under);
    expect(capSealEffects([{ type: 'staggerBonus', amount: 0.5 }, { type: 'staggerTicks', amount: 10 }])).toEqual([{ type: 'staggerBonus', amount: 0.2 }, { type: 'staggerTicks', amount: 10 }]);
  });
});
