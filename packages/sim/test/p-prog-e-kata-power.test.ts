// PB-04 (R-PROGRESSION-BETA): the Kata slot. One kata power per run, earned with its kata's
// sign-off. Placeholders add nothing; a final power is data only and changes the fight. Passive
// effects only, and a Stance plus the power stays inside the +12% damage cap.
import { describe, expect, it } from 'vitest';
import {
  PASSIVE_EFFECTS, STANCE_POWER_CAP, TICKS_PER_SECOND, buildTraining, characterSetup, createWorld, earnedKataPowers, emptyLoadout,
  kataPowerEffects, loadAbilities, loadEnemy, loadFeed, loadRoom, modsFrom, newProfile, normalizeLoadout, parseKata, resolveKataPowerId, stepWorld,
  type AbilityContent, type CharacterSetup,
} from '../src';
import { testContent } from './load-content';
import { applyStyleTap, buildStyle } from '../../../apps/client/src/ui/fightingStyle';
import abilitiesJson from '../../../content/abilities/abilities.json';
import familiesJson from '../../../content/abilities/seal-families.json';
import strikesJson from '../../../content/abilities/strikes.json';
import powersJson from '../../../content/abilities/kata-powers.json';
import bruteData from '../../../content/enemies/brute.json';
import white from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';

const content = testContent();
const powers = content.abilities.kataPowers;
const kataFiles = import.meta.glob('../../../content/katas/*.json', { eager: true, import: 'default' });
const katas = Object.values(kataFiles).map(parseKata);
const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const trainingWith = (data: unknown, abilities: AbilityContent = content.abilities) => {
  const feed = loadFeed(data);
  return buildTraining(feed, abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};
const load = (data: unknown) => loadAbilities(abilitiesJson, familiesJson, strikesJson, data);
const withPower = (patch: Record<string, unknown>) => {
  const d = copy(powersJson);
  Object.assign(d.powers[0], patch);
  return d;
};

describe('PB-04 kata power content', () => {
  it('has one placeholder power for Basic Form 1, Basic Form 2 and Keon, each matching its kata file', () => {
    expect(powers.map((p) => [p.id, p.kata, p.status])).toEqual([
      ['basic-form-1-power', 'basic-form-1', 'placeholder'],
      ['basic-form-2-power', 'basic-form-2', 'placeholder'],
      ['keon-power', 'keon', 'placeholder'],
    ]);
    for (const p of powers) {
      const k = katas.find((x) => x.id === p.kata);
      expect(k, p.id).toBeDefined();
      expect(p.requirement, p.id).toBe(k!.requirement);
      expect(p.name, p.id).toBe(k!.name);
    }
  });

  it('a placeholder power adds no effect', () => {
    for (const p of powers) expect(kataPowerEffects(powers, p.id)).toEqual([]);
    const t = trainingWith(white3);
    const bare = characterSetup(newProfile(), t, content.abilities);
    const kata = characterSetup({ ...newProfile(), loadout: { ...emptyLoadout(), kata: 'basic-form-1-power' } }, t, content.abilities);
    expect(kata.effects).toEqual(bare.effects);
  });

  it('every Stance plus every kata power is at most +12% damage', () => {
    for (const s of content.abilities.stances) {
      for (const p of powers) {
        const kataPower = p.effects.filter((e) => e.type === 'powerScale').reduce((n, e) => n + e.amount, 0);
        expect(s.powerScale + kataPower, `${s.id} + ${p.id}`).toBeLessThanOrEqual(STANCE_POWER_CAP);
      }
    }
    expect(STANCE_POWER_CAP).toBe(0.12);
  });

  it('passive only: every power uses PASSIVE_EFFECTS, and the loader refuses anything else', () => {
    for (const p of powers) for (const e of p.effects) expect(PASSIVE_EFFECTS).toContain(e.type);
    expect(() => load(withPower({ status: 'final', effects: [{ type: 'counterHits', amount: 1, hits: 1 }] }))).toThrow(/not passive/);
    expect(() => load(withPower({ status: 'final', effects: [{ type: 'startFocus', amount: 20 }] }))).not.toThrow();
  });

  it('the loader refuses a power over the damage cap, effects on a placeholder, a bad status and repeats', () => {
    const top = Math.max(...content.abilities.stances.map((s) => s.powerScale));
    expect(() => load(withPower({ status: 'final', effects: [{ type: 'powerScale', amount: STANCE_POWER_CAP - top + 0.01 }] }))).toThrow(/cap/);
    expect(() => load(withPower({ status: 'final', effects: [{ type: 'powerScale', amount: STANCE_POWER_CAP - top }] }))).not.toThrow();
    expect(() => load(withPower({ effects: [{ type: 'startFocus', amount: 20 }] }))).toThrow(/placeholder/);
    expect(() => load(withPower({ status: 'done' }))).toThrow(/status/);
    expect(() => load(withPower({ id: 'keon-power' }))).toThrow(/twice/);
    expect(() => load(withPower({ kata: 'keon' }))).toThrow(/already/);
  });
});

describe('PB-04 earning and equipping', () => {
  it('a kata power is earned with its kata sign-off, in curriculum order', () => {
    expect(earnedKataPowers(trainingWith(white), powers)).toEqual([]);
    expect(earnedKataPowers(trainingWith(white3), powers)).toEqual(['basic-form-1-power']);
    expect(earnedKataPowers(trainingWith(green), powers)).toEqual(['basic-form-1-power', 'basic-form-2-power', 'keon-power']);
  });

  it('one power at most: the slot holds one id, and one not earned is dropped', () => {
    const t = trainingWith(white3);
    const keep = normalizeLoadout({ ...emptyLoadout(), kata: 'basic-form-1-power' }, t, content.abilities);
    expect(keep!.kata).toBe('basic-form-1-power');
    expect(normalizeLoadout({ ...emptyLoadout(), kata: 'keon-power' }, t, content.abilities)!.kata).toBeNull();
    expect(normalizeLoadout({ ...emptyLoadout(), kata: 'nope' }, t, content.abilities)!.kata).toBeNull();
  });

  it('a kata id saved before PB-04 means that kata power', () => {
    expect(resolveKataPowerId(powers, 'basic-form-1')).toBe('basic-form-1-power');
    expect(resolveKataPowerId(powers, 'keon-power')).toBe('keon-power');
    expect(resolveKataPowerId(powers, null)).toBeNull();
    expect(normalizeLoadout({ ...emptyLoadout(), kata: 'basic-form-1' }, trainingWith(white3), content.abilities)!.kata).toBe('basic-form-1-power');
  });

  it('a kata id seen before PB-04 does not bring the New dot back', () => {
    const t = trainingWith(white3);
    const kataCard = (seen: string[]) => buildStyle(t, content.abilities, null, [], { seen }).cards.find((c) => c.slot === 'kata')!;
    expect(kataCard([]).newDot).toBe(true);
    expect(kataCard(['basic-form-1']).newDot).toBe(false);
    expect(kataCard(['basic-form-1-power']).newDot).toBe(false);
  });

  it('a White belt equips Basic Form 1 on the Fighting Style screen ("Power coming soon") and plays', () => {
    const t = trainingWith(white3);
    const model = buildStyle(t, content.abilities, null);
    expect(model.trays.kata.map((p) => [p.id, p.name, p.line])).toEqual([['basic-form-1-power', 'Basic Form 1', 'Power coming soon']]);
    const opened = applyStyleTap({ loadout: null, open: null, swap: null, focus: null }, { kind: 'card', slot: 'kata', index: 0 }, t, content.abilities);
    const tap = applyStyleTap(opened.session, { kind: 'pick', id: 'basic-form-1-power' }, t, content.abilities);
    expect(tap.save).toBe(true);
    expect(tap.session.loadout!.kata).toBe('basic-form-1-power');
    const after = buildStyle(t, content.abilities, tap.session.loadout);
    expect(after.cards.find((c) => c.slot === 'kata')!.pick!.id).toBe('basic-form-1-power');
    const c = characterSetup({ ...newProfile(), loadout: tap.session.loadout }, t, content.abilities);
    expect(strikeDamage(c)).toBeGreaterThan(0);
  });
});

describe('PB-04 a final power changes the fight, from data alone', () => {
  it('making Basic Form 1 final with +4% Power raises the Strike damage', () => {
    const abilities = load(withPower({ status: 'final', text: 'Hits a little harder.', effects: [{ type: 'powerScale', amount: 0.04 }] }));
    const t = trainingWith(white3, abilities);
    const bare = characterSetup(newProfile(), t, abilities);
    const kata = characterSetup({ ...newProfile(), loadout: { ...emptyLoadout(), kata: 'basic-form-1-power' } }, t, abilities);
    expect(kata.effects).toEqual([...bare.effects, { type: 'powerScale', amount: 0.04 }]);
    expect(strikeDamage(kata)).toBeGreaterThan(strikeDamage(bare));
    expect(buildStyle(t, abilities, null).trays.kata[0].line).toBe('Hits a little harder.');
  });

  it('a Yellow belt runs with exactly one power even with two earned', () => {
    const t = trainingWith(yellow);
    expect(earnedKataPowers(t, powers).length).toBeGreaterThanOrEqual(2);
    const c = characterSetup({ ...newProfile(), loadout: { ...emptyLoadout(), kata: 'basic-form-2-power' } }, t, content.abilities);
    expect(normalizeLoadout({ ...emptyLoadout(), kata: 'basic-form-2-power' }, t, content.abilities)!.kata).toBe('basic-form-2-power');
    expect(c.effects).toEqual(characterSetup(newProfile(), t, content.abilities).effects);
  });
});

function strikeDamage(c: CharacterSetup): number {
  const room = loadRoom({
    id: 'arena', name: 'Arena',
    tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
    enemies: [{ enemy: 'brute', column: 4, row: 4 }],
  });
  const w = createWorld(room, ['p1'], { enemyTypes: { brute: loadEnemy(bruteData) }, difficulty: 'standard', player: { ...c, mods: modsFrom(c.effects, TICKS_PER_SECOND) } });
  w.players.p1.focus = 30;
  w.players.p1.attackCooldown = 999;
  w.enemies[0].health = 99999;
  for (let i = 0; i < 40; i++) {
    stepWorld(w, room, { p1: i === 0 ? { kind: 'none', action: 'strike' } : { kind: 'none' } });
    for (const ev of w.events) if (ev.kind === 'playerAttack' && ev.move === 'strike' && ev.damage !== null) return ev.damage;
  }
  return 0;
}
