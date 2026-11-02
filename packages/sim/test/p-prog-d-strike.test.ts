// PB-03 (R-PROGRESSION-BETA): the Strike slot. Spin Kick is today's Strike; Jumping Spins and
// Butterfly Flow are earned with kick combos; the two old always-on Strike upgrades are retired.
import { describe, expect, it } from 'vitest';
import {
  COMBAT, TICKS_PER_SECOND, buildTraining, characterSetup, createWorld, defaultStrike, defaultStrikeDef, earnedStrikes, emptyLoadout,
  equipStrike, equippedStrikeSetup, loadAbilities, loadEnemy, loadFeed, loadProfile, loadRoom, modsFrom, newProfile,
  resolveStrikeId, seedInputFor, seedLoadoutV2, seedStrikeSlot, stepWorld, strikeCost,
  type PlayerSetup, type WorldState,
} from '../src';
import { testContent } from './load-content';
import { buildStyle } from '../../../apps/client/src/ui/fightingStyle';
import strikesJson from '../../../content/abilities/strikes.json';
import abilitiesJson from '../../../content/abilities/abilities.json';
import familiesJson from '../../../content/abilities/seal-families.json';
import bruteData from '../../../content/enemies/brute.json';
import white from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';

const content = testContent();
const defs = content.abilities.strikeDefs;
const training = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};
const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const byId = (id: string) => defs.find((s) => s.id === id)!;

describe('PB-03 Strike content', () => {
  it('has Spin Kick (default), Jumping Spins and Butterfly Flow, in kick combo order', () => {
    expect(defs.map((s) => [s.id, s.combo, s.default])).toEqual([['spin-kick', 1, true], ['jumping-spins', 2, false], ['butterfly-flow', 3, false]]);
  });

  it("Spin Kick is exactly today's Strike (COMBAT.strike)", () => {
    const s = byId('spin-kick');
    expect(s.focusCost).toBe(COMBAT.strike.focusCost);
    expect(s.hits).toEqual([{ strength: COMBAT.strike.strength, delayTicks: 0 }]);
    expect(s.reach).toBe(COMBAT.strike.reach);
    expect(s.lungeTiles).toBe(COMBAT.strike.lungeTiles);
    expect(s.recoveryTicks).toBe(COMBAT.strike.recoveryTicks);
    expect(defaultStrike()).toEqual({ id: 'spin-kick', focusCost: 30, hits: [{ strength: 2.5, delayTicks: 0 }], reach: 1.4, lungeTiles: 0.7, recoveryTicks: 8 });
    expect(equippedStrikeSetup(defs, null)).toEqual(defaultStrike());
    expect(defaultStrikeDef(defs)!.id).toBe('spin-kick');
  });

  it('every Strike costs 30 Focus; Jumping Spins has three hits that together beat Spin Kick; Butterfly Flow lands later and hits harder', () => {
    expect(defs.map((s) => s.focusCost)).toEqual([30, 30, 30]);
    const total = (id: string) => byId(id).hits.reduce((n, h) => n + h.strength, 0);
    expect(byId('jumping-spins').hits).toHaveLength(3);
    expect(total('jumping-spins')).toBeGreaterThan(total('spin-kick'));
    expect(byId('jumping-spins').hits[0].strength).toBeLessThan(byId('spin-kick').hits[0].strength);
    expect(byId('butterfly-flow').hits[0].strength).toBeGreaterThan(byId('spin-kick').hits[0].strength);
    expect(byId('butterfly-flow').hits[0].delayTicks).toBeGreaterThan(0);
  });
});

describe('PB-03 the old Strike ids', () => {
  it('map by combo number: follow-up-kick -> spin-kick, quick-combo -> jumping-spins', () => {
    expect(resolveStrikeId(defs, 'follow-up-kick')).toBe('spin-kick');
    expect(resolveStrikeId(defs, 'quick-combo')).toBe('jumping-spins');
    expect(resolveStrikeId(defs, 'butterfly-flow')).toBe('butterfly-flow');
    expect(resolveStrikeId(defs, 'nonsense')).toBe('nonsense');
    expect(resolveStrikeId(defs, null)).toBeNull();
  });

  it('the old list in abilities.json still has them in combo order (the mapping is by position)', () => {
    expect(abilitiesJson.strikes.map((s) => s.id)).toEqual(['follow-up-kick', 'quick-combo']);
  });
});

describe('PB-03 equipping', () => {
  it('needs the kick combo signed off: White has none, Yellow has Jumping Spins, Green has Butterfly Flow too', () => {
    expect(earnedStrikes(training(white), defs)).toEqual([]);
    expect(earnedStrikes(training(yellow), defs)).toEqual(['jumping-spins']);
    expect(earnedStrikes(training(green), defs)).toEqual(['jumping-spins', 'butterfly-flow']);
  });

  it('a locked Strike changes nothing; an earned one goes in; Spin Kick empties the slot', () => {
    const none = emptyLoadout();
    expect(equipStrike(none, 'jumping-spins', defs, []).result).toBe('locked');
    expect(equipStrike(none, 'jumping-spins', defs, []).loadout).toBe(none);
    const a = equipStrike(none, 'jumping-spins', defs, ['jumping-spins']);
    expect(a.result).toBe('equipped');
    expect(a.loadout.strike).toBe('jumping-spins');
    expect(equipStrike(a.loadout, 'jumping-spins', defs, ['jumping-spins']).result).toBe('already');
    const back = equipStrike(a.loadout, 'spin-kick', defs, []);
    expect(back.loadout.strike).toBeNull();
    expect(equipStrike(none, 'spin-kick', defs, []).result).toBe('already');
    expect(equipStrike(none, 'nope', defs, ['nope']).result).toBe('locked');
  });

  it('a Strike that is not earned is dropped when the loadout is read; an earned one gives a fight setup', () => {
    const t = training(green);
    const p = { ...newProfile(), loadout: { ...emptyLoadout(), strike: 'butterfly-flow' } };
    expect(characterSetup(p, t, content.abilities).strike!.id).toBe('butterfly-flow');
    expect(characterSetup(p, training(yellow), content.abilities).strike!.id).toBe('spin-kick');
  });
});

describe('PB-03 the retired upgrades', () => {
  it('training alone no longer adds a hit or lowers the cost, at any belt', () => {
    for (const fixture of [white3, yellow, green]) {
      const c = characterSetup(newProfile(), training(fixture), content.abilities);
      expect(c.effects.some((e) => e.type === 'strikeExtraHit' || e.type === 'strikeCost')).toBe(false);
      expect(c.strike).toEqual(defaultStrike());
    }
  });

  it('even with a Strike equipped, the cost stays 30 (no -8 Focus)', () => {
    const t = training(yellow);
    for (const id of ['jumping-spins', 'butterfly-flow']) {
      const c = characterSetup({ ...newProfile(), loadout: { ...emptyLoadout(), strike: id } }, t, content.abilities);
      const w = fight({ ...c, mods: modsFrom(c.effects, TICKS_PER_SECOND) });
      expect(strikeCost(w.players.p1)).toBe(30);
    }
  });
});

describe('PB-03 a Strike in a fight', () => {
  const brute = loadEnemy(bruteData);
  const room = loadRoom({
    id: 'arena', name: 'Arena',
    tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
    enemies: [{ enemy: 'brute', column: 4, row: 4 }],
  });
  function strikeWith(setup: PlayerSetup['strike']) {
    const base = characterSetup(newProfile(), training(white), content.abilities);
    const w = createWorld(room, ['p1'], { enemyTypes: { brute }, difficulty: 'standard', player: { ...base, mods: modsFrom(base.effects, TICKS_PER_SECOND), strike: setup } });
    const p = w.players.p1;
    p.focus = 30;
    p.attackCooldown = 999; // no basic attack
    const e = w.enemies[0];
    e.health = 99999;
    const hits: { tick: number; damage: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stepWorld(w, room, { p1: i === 0 ? { kind: 'none', action: 'strike' } : { kind: 'none' } });
      for (const ev of w.events) if (ev.kind === 'playerAttack' && ev.move === 'strike' && ev.damage !== null) hits.push({ tick: w.tick, damage: ev.damage });
    }
    return { w, p, hits, e };
  }

  it('Spin Kick lands one hit at once and spends 30 Focus', () => {
    const { hits, p } = strikeWith(defaultStrike());
    expect(hits).toHaveLength(1);
    expect(p.focus).toBeLessThan(30);
  });

  it('Jumping Spins lands three hits, the last two later; the total beats Spin Kick', () => {
    const spin = strikeWith(defaultStrike());
    const jump = strikeWith(equippedStrikeSetup(defs, 'jumping-spins'));
    expect(jump.hits).toHaveLength(3);
    expect(jump.hits[1].tick - jump.hits[0].tick).toBe(5);
    expect(jump.hits[2].tick - jump.hits[0].tick).toBe(10);
    expect(jump.hits.reduce((n, h) => n + h.damage, 0)).toBeGreaterThan(spin.hits[0].damage);
  });

  it('Butterfly Flow lands one hit, after its delay', () => {
    const spin = strikeWith(defaultStrike());
    const fly = strikeWith(equippedStrikeSetup(defs, 'butterfly-flow'));
    expect(fly.hits).toHaveLength(1);
    expect(fly.hits[0].tick - spin.hits[0].tick).toBe(6);
    expect(fly.hits[0].damage).toBeGreaterThan(spin.hits[0].damage);
  });
});

function fight(player: PlayerSetup): WorldState {
  const room = loadRoom({
    id: 'arena', name: 'Arena',
    tiles: ['############', '#..........#', '#..P.......#', '############'],
    enemies: [{ enemy: 'brute', column: 6, row: 2 }],
  });
  return createWorld(room, ['p1'], { enemyTypes: { brute: loadEnemy(bruteData) }, difficulty: 'standard', player });
}

describe('PB-03 filling the Strike slot for saves PB-02 already seeded', () => {
  // A save PB-02 seeded: loadoutV2 done, no Strike (none could be earned), no strikeSeeded flag yet.
  function pb02Save(loadout: unknown = { stance: 'cat-stance', virtue: null, strike: null, kata: null, seals: ['escape', 'counter'] }) {
    const p = copy(newProfile()) as unknown as Record<string, unknown>;
    delete p.strikeSeeded;
    return { ...p, runsPlayed: 12, loadoutV2: true, showSlotNote: true, loadout };
  }
  const earnedOf = (data: unknown) => earnedStrikes(training(data), defs);

  it('an old save without the flag reads as not seeded; a new profile is seeded; a save with the flag keeps it', () => {
    expect(loadProfile(pb02Save()).strikeSeeded).toBe(false);
    expect(loadProfile(newProfile()).strikeSeeded).toBe(true);
    expect(loadProfile({ ...pb02Save(), strikeSeeded: true }).strikeSeeded).toBe(true);
  });

  it('puts the newest earned Strike in the slot once, and running it again changes nothing', () => {
    const p = loadProfile(pb02Save());
    expect(seedStrikeSlot(p, content.abilities, earnedOf(green))).toBe(true);
    expect(p.loadout).toEqual({ stance: 'cat-stance', virtue: null, strike: 'butterfly-flow', kata: null, seals: ['escape', 'counter'] });
    const once = copy(p);
    expect(seedStrikeSlot(p, content.abilities, earnedOf(green))).toBe(false);
    expect(p).toEqual(once);
    expect(loadProfile(copy(p)).strikeSeeded).toBe(true);
  });

  it('keeps a Strike that was already picked (old ids resolved), and leaves the slot empty when nothing is earned', () => {
    const kept = loadProfile(pb02Save({ stance: null, virtue: null, strike: 'quick-combo', kata: null, seals: [] }));
    seedStrikeSlot(kept, content.abilities, earnedOf(yellow));
    expect(kept.loadout!.strike).toBe('jumping-spins');
    const none = loadProfile(pb02Save());
    seedStrikeSlot(none, content.abilities, earnedOf(white));
    expect(none.loadout!.strike).toBeNull();
    expect(none.strikeSeeded).toBe(true);
    const noLoadout = loadProfile(pb02Save(null));
    seedStrikeSlot(noLoadout, content.abilities, []);
    expect(noLoadout.loadout).toBeNull();
  });

  it('seedLoadoutV2 on an old save fills the Strike too, and marks it seeded', () => {
    const p = loadProfile({ ...(copy(newProfile()) as object), loadoutV2: undefined, strikeSeeded: undefined, runsPlayed: 5 });
    expect(p.loadoutV2).toBe(false);
    expect(p.strikeSeeded).toBe(false);
    seedLoadoutV2(p, seedInputFor(training(yellow), content.abilities));
    expect(p.loadout!.strike).toBe('jumping-spins');
    expect(p.strikeSeeded).toBe(true);
  });

  it('a Strike seeded to a student is the one their fight uses', () => {
    const t = training(green);
    const p = loadProfile(pb02Save());
    seedStrikeSlot(p, content.abilities, earnedStrikes(t, defs));
    expect(characterSetup(p, t, content.abilities).strike!.id).toBe('butterfly-flow');
  });
});

describe('PB-03 the Fighting Style screen', () => {
  it('shows the equipped Strike (Spin Kick when empty) where it used to list the always-on upgrades', () => {
    const t = training(yellow);
    expect(buildStyle(t, content.abilities, null).always).toEqual([{ id: 'spin-kick', name: 'Spin Kick' }]);
    expect(buildStyle(t, content.abilities, { ...emptyLoadout(), strike: 'jumping-spins' }).always).toEqual([{ id: 'jumping-spins', name: 'Jumping Spins' }]);
  });
});

describe('PB-03 words for the Strike row', () => {
  it('the Fighting Style, Gear and Run tab rows are headed "Your Strike" and have empty text that does not promise Seals', async () => {
    const style = (await import('../../../content/abilities/fighting-style.json')).default;
    const gear = (await import('../../../content/loot/gear-board.json')).default;
    const run = (await import('../../../content/settings/last-run.json')).default;
    for (const w of [style, gear, run]) {
      expect(w.always).toBe('Your Strike');
      expect(w.alwaysEmpty).toBe('Your Strike shows up here.');
    }
  });
});

describe('PB-03 loadStrikeDefs checks (through loadAbilities)', () => {
  const load = (strikes: unknown) => () => loadAbilities(abilitiesJson, familiesJson, strikes);
  const mutate = (fn: (s: typeof strikesJson.strikes) => void) => {
    const d = copy(strikesJson);
    fn(d.strikes);
    return d;
  };
  it('accepts the real file', () => {
    expect(load(strikesJson)).not.toThrow();
  });
  it('refuses duplicate ids, a wrong combo, a cheap cost, no hits, hits out of order, a recovery shorter than the last hit', () => {
    expect(load(mutate((s) => { s[1].id = 'spin-kick'; }))).toThrow(/used twice/);
    expect(load(mutate((s) => { s[1].combo = 5; }))).toThrow(/combo/);
    expect(load(mutate((s) => { s[0].focusCost = 5; }))).toThrow(/at least 10/);
    expect(load(mutate((s) => { s[0].hits = []; }))).toThrow(/at least one hit/);
    expect(load(mutate((s) => { s[1].hits.reverse(); }))).toThrow(/in order/);
    expect(load(mutate((s) => { s[1].recoveryTicks = 3; }))).toThrow(/last hit/);
    expect(load(mutate((s) => { s[1].hits[1].delayTicks = 2.5; }))).toThrow(/whole number/);
  });
  it('refuses no default, two defaults, a default that is not first, and an old id on two Strikes', () => {
    expect(load(mutate((s) => { s[0].default = false; }))).toThrow(/exactly one/);
    expect(load(mutate((s) => { s[1].default = true; }))).toThrow(/exactly one/);
    expect(load(mutate((s) => { s[0].default = false; s[1].default = true; }))).toThrow(/first/);
    expect(load(mutate((s) => { s[2].legacyIds = ['quick-combo']; }))).toThrow(/two Strikes/);
  });
});
