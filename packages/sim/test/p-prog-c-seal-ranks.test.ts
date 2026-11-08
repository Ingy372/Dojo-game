// PB-02 (R-PROGRESSION-BETA): Seal families, their ranks, and the four new effects they use.
import { describe, expect, it } from 'vitest';
import {
  buildTraining,
  DIFFICULTY,
  characterSetup,
  createWorld,
  emptyLoadout,
  equippedSealEffects,
  familyEffects,
  familyRank,
  loadEnemy,
  loadFeed,
  loadRoom,
  loadSealFamilies,
  modsFrom,
  newProfile,
  signedOffTechniques,
  stepWorld,
  unlockedFamilies,
  TICKS_PER_SECOND,
  type CombatEvent,
  type Effect,
  type PlayerInput,
  type PlayerSetup,
  type TrainingState,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import sealFamilyData from '../../../content/abilities/seal-families.json';
import white from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const fams = content.abilities.families;
const fam = (id: string) => fams.find((f) => f.id === id)!;
const training = (data: unknown): TrainingState => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};
const mods = (effects: Effect[]) => modsFrom(effects, TICKS_PER_SECOND);

describe('PB-02 family ranks', () => {
  it('lists six families, each technique in one family, and the plan\'s map', () => {
    expect(fams.map((f) => f.id)).toEqual(['escape', 'counter', 'guard', 'throw', 'disarm', 'lock']);
    const map = Object.fromEntries(fams.map((f) => [f.id, f.ranks.map((r) => r.technique)]));
    expect(map).toEqual({ escape: [1, 2, 4, 15], counter: [3, 5, 6, 7, 10], guard: [8, 9], throw: [11, 12], disarm: [13, 14], lock: [] });
  });

  it('rank = how many of the family\'s techniques are signed off; a family unlocks at its first', () => {
    const signed = new Set([1, 3, 5]);
    expect(familyRank(fam('escape'), signed)).toBe(1);
    expect(familyRank(fam('counter'), signed)).toBe(2);
    expect(familyRank(fam('guard'), signed)).toBe(0);
    // A family that is not live has no rank, so PB-05 can use familyRank without unlockedFamilies and still not offer it.
    expect(familyRank({ ...fam('escape'), live: false }, signed)).toBe(0);
    expect(unlockedFamilies(training(white3), fams)).toEqual(['escape', 'counter']);
    expect(unlockedFamilies(training(white), fams)).toEqual([]);
  });

  it('effects are the union of the signed-off techniques, in any order they were signed', () => {
    const a = familyEffects(fam('counter'), new Set([10, 3]));
    const b = familyEffects(fam('counter'), new Set([3, 10]));
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    // More rank, more effects; nothing is lost.
    const more = familyEffects(fam('counter'), new Set([3, 5, 10]));
    for (const e of a) expect(more).toContainEqual(e);
    expect(more.length).toBeGreaterThan(a.length);
  });

  it('a technique outside the map (Green #16 and #17 here) changes nothing', () => {
    const t = training(green);
    expect([...signedOffTechniques(t)]).toContain(16);
    const all = fams.flatMap((f) => familyEffects(f, new Set([...signedOffTechniques(t)].filter((n) => n <= 15))));
    expect(fams.flatMap((f) => familyEffects(f, signedOffTechniques(t)))).toEqual(all);
  });

  it('Lock has no ranks and Throw is off until R-G2B-04: neither gives effects or can be unlocked', () => {
    expect(fam('lock').live).toBe(false);
    expect(fam('throw').live).toBe(false);
    const everything = new Set(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(familyEffects(fam('throw'), everything)).toEqual([]);
    expect(familyEffects(fam('lock'), everything)).toEqual([]);
    expect(unlockedFamilies(training(green), fams)).not.toContain('throw');
    expect(unlockedFamilies(training(green), fams)).not.toContain('lock');
  });

  it('only the equipped families give effects: a White profile with two equipped has just those', () => {
    const t = training(yellow);
    const e = equippedSealEffects(t, fams, ['guard']);
    expect(e).toEqual(familyEffects(fam('guard'), signedOffTechniques(t)));
    expect(equippedSealEffects(t, fams, [])).toEqual([]);
    expect(equippedSealEffects(t, fams, ['throw', 'nope'])).toEqual([]);
  });

  it('characterSetup: no loadout = no Seals; with Seals in the slots = those families only', () => {
    const t = training(yellow);
    const none = characterSetup(newProfile(), t, content.abilities);
    const guarded = characterSetup({ ...newProfile(), loadout: { ...emptyLoadout(), seals: ['guard'] } }, t, content.abilities);
    expect(guarded.effects.length).toBeGreaterThan(none.effects.length);
    for (const e of familyEffects(fam('guard'), signedOffTechniques(t))) expect(guarded.effects).toContainEqual(e);
    for (const e of familyEffects(fam('counter'), signedOffTechniques(t))) expect(guarded.effects).not.toContainEqual(e);
  });
});

describe('PB-02 loading the family file', () => {
  const clone = () => JSON.parse(JSON.stringify(sealFamilyData));

  it('accepts the shipped file', () => {
    expect(loadSealFamilies(sealFamilyData)).toHaveLength(6);
  });

  it('rejects a technique in two families, a missing family, numbers in kid text, and a live rank with no effect', () => {
    const dup = clone();
    dup.families[0].ranks.push({ ...dup.families[1].ranks[0], technique: 99 });
    dup.families[0].ranks[dup.families[0].ranks.length - 1].technique = dup.families[1].ranks[0].technique;
    expect(() => loadSealFamilies(dup)).toThrow();
    const missing = clone();
    missing.families.pop();
    expect(() => loadSealFamilies(missing)).toThrow(/exactly once/);
    const digits = clone();
    digits.families[0].text = 'Take 3 steps';
    expect(() => loadSealFamilies(digits)).toThrow(/no numbers/);
    const empty = clone();
    empty.families[0].ranks[0].effects = [];
    expect(() => loadSealFamilies(empty)).toThrow(/need an effect/);
  });

  it('counterHits needs a hits count', () => {
    const bad = clone();
    const r = bad.families.find((f: { id: string }) => f.id === 'escape').ranks[0];
    r.effects = [{ type: 'counterHits', amount: 0.3 }];
    expect(() => loadSealFamilies(bad)).toThrow(/hits/);
  });
});

describe('PB-02 new effects in play', () => {
  it('modsFrom: hits add, strength is the biggest, push adds, stagger and disarm length take the biggest', () => {
    const m = mods([
      { type: 'counterHits', amount: 0.3, hits: 2 },
      { type: 'counterHits', amount: 0.2, hits: 1 },
      { type: 'counterPush', amount: 1.5 },
      { type: 'reflectStaggers', amount: 20 },
      { type: 'disarmAttacks', amount: 2 },
    ]);
    expect(m.counterHits).toBe(3);
    expect(m.counterHitStrength).toBe(0.3);
    expect(m.counterPush).toBe(1.5);
    expect(m.reflectStaggerTicks).toBe(20);
    expect(m.disarmAttacks).toBe(2);
    const none = mods([]);
    expect([none.counterHits, none.counterPush, none.reflectStaggerTicks, none.disarmAttacks]).toEqual([0, 0, 0, 0]);
  });

  const brute = loadEnemy(bruteData);
  const IDLE: PlayerInput = { kind: 'none' };
  const room = loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
    enemies: [{ enemy: 'brute', column: 5, row: 4 }],
  });
  const gentle = (effects: Effect[]): PlayerSetup => {
    const base = characterSetup(newProfile(), training(white3), content.abilities);
    return { ...base, power: 20, mods: mods(effects) };
  };
  const world = (effects: Effect[]) => createWorld(room, ['p1'], { enemyTypes: { brute }, difficulty: 'standard', player: gentle(effects) });
  const stepUntil = (w: ReturnType<typeof world>, kind: CombatEvent['kind']) => {
    for (let i = 0; i < 400; i++) {
      const tick = w.tick;
      stepWorld(w, room, { p1: IDLE });
      if (w.events.some((e) => e.kind === kind)) return tick;
    }
    throw new Error(`no ${kind}`);
  };
  const counterAt = (w: ReturnType<typeof world>, early: number) => {
    const start = stepUntil(w, 'telegraph');
    const impact = start + w.enemies[0].windupTotal;
    while (w.tick <= impact) stepWorld(w, room, { p1: w.tick === impact - early ? { kind: 'none', action: 'counter' } : IDLE });
    return w.events;
  };
  const dist = (w: ReturnType<typeof world>) => Math.hypot(w.enemies[0].pos.x - w.players.p1.pos.x, w.enemies[0].pos.y - w.players.p1.pos.y);

  it('counterHits: a Perfect Counter lands extra hits', () => {
    const plain = world([]);
    counterAt(plain, 1);
    const hits = world([{ type: 'counterHits', amount: 0.3, hits: 2 }]);
    counterAt(hits, 1);
    expect(hits.enemies[0].health).toBeLessThan(plain.enemies[0].health);
  });

  it('counterPush: a Perfect Counter pushes the attacker away', () => {
    const plain = world([]);
    counterAt(plain, 1);
    const pushed = world([{ type: 'counterPush', amount: 1.5 }]);
    counterAt(pushed, 1);
    expect(dist(pushed)).toBeGreaterThan(dist(plain) + 1);
  });

  it('disarmAttacks: the disarm lasts for that many attacks', () => {
    const one = world([{ type: 'disarm', amount: 0.5 }]);
    counterAt(one, 1);
    expect(one.enemies[0].disarmLeft).toBe(1);
    const two = world([{ type: 'disarm', amount: 0.5 }, { type: 'disarmAttacks', amount: 2 }]);
    counterAt(two, 1);
    expect(two.enemies[0].disarmLeft).toBe(2);
  });

  it('reflectStaggers: a reflected hit staggers the attacker', () => {
    const w = world([{ type: 'blockReflect', amount: 0.2 }, { type: 'reflectStaggers', amount: 20 }]);
    const events = counterAt(w, DIFFICULTY.standard.counterWindowTicks + 2);
    expect(events.some((e) => e.kind === 'block')).toBe(true);
    expect(w.enemies[0].mode).toBe('stagger');
    expect(w.enemies[0].modeTicks).toBeGreaterThanOrEqual(19);
  });
});
