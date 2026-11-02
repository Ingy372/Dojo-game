// PB-01 (R-PROGRESSION-BETA): Seal slots by belt, and the equip rules for Seal families.
import { describe, expect, it } from 'vitest';
import { SEAL_SLOTS_BY_TIER, buildTraining, emptyLoadout, equipSeal, loadFeed, normalizeLoadout, normalizeSlots, removeSeal, sealSlots, swapSeal, type Loadout } from '../src';
import { testContent } from './load-content';
import white from '../../../fixtures/1-white-belt-new.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import orange from '../../../fixtures/6-orange-typical.json';

const content = testContent();
const training = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};
const ALL = ['counter', 'guard', 'escape', 'disarm', 'throw'];
const earned = (families: string[] = ALL) => ({ strikes: ['jumping-spins'], families, kataPowers: ['basic-form-1-power'] });

describe('PB-01 sealSlots', () => {
  it('is 2 for White and Yellow, 3 for Orange, 3 for Green and Blue, 4 from Red', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sealSlots)).toEqual([2, 2, 3, 3, 3, 4, 4, 4, 4, 4]);
  });

  it('reads one table (SEAL_SLOTS_BY_TIER), and a tier outside it uses the nearest row', () => {
    expect(sealSlots(1)).toBe(SEAL_SLOTS_BY_TIER[0]);
    expect(sealSlots(99)).toBe(SEAL_SLOTS_BY_TIER[SEAL_SLOTS_BY_TIER.length - 1]);
    expect(sealSlots(0)).toBe(2);
    expect(sealSlots(-3)).toBe(2);
    expect(sealSlots(2.9)).toBe(2);
    expect(sealSlots(NaN)).toBe(2);
  });

  it("matches the training tier of the White, Yellow and Orange fixtures", () => {
    expect([training(white), training(yellow), training(orange)].map((t) => sealSlots(t.tier))).toEqual([2, 2, 3]);
  });
});

describe('PB-01 equipSeal, swapSeal, removeSeal', () => {
  const none = emptyLoadout();

  it('fills free slots, in order', () => {
    const a = equipSeal(none, 'escape', ALL, 2);
    expect(a.result).toBe('equipped');
    const b = equipSeal(a.loadout, 'counter', ALL, 2);
    expect(b.result).toBe('equipped');
    expect(b.loadout.seals).toEqual(['escape', 'counter']);
  });

  it('asks for a swap when full and changes nothing', () => {
    const full: Loadout = { ...none, seals: ['escape', 'counter'] };
    const r = equipSeal(full, 'guard', ALL, 2);
    expect(r.result).toBe('full');
    expect(r.loadout).toBe(full);
  });

  it('never puts a family in two slots', () => {
    const one: Loadout = { ...none, seals: ['escape'] };
    const r = equipSeal(one, 'escape', ALL, 3);
    expect(r.result).toBe('already');
    expect(r.loadout).toBe(one);
    expect(swapSeal({ ...none, seals: ['escape', 'counter'] }, 'counter', 'escape', ALL).seals).toEqual(['escape', 'counter']);
  });

  it('does not equip a family that is not earned', () => {
    const r = equipSeal(none, 'lock', ALL, 3);
    expect(r.result).toBe('locked');
    expect(r.loadout).toBe(none);
  });

  it('swaps one Seal for another in the same place', () => {
    const full: Loadout = { ...none, seals: ['escape', 'counter'] };
    expect(swapSeal(full, 'escape', 'guard', ALL).seals).toEqual(['guard', 'counter']);
    expect(swapSeal(full, 'disarm', 'guard', ALL)).toBe(full);
    expect(swapSeal(full, 'escape', 'lock', ALL)).toBe(full);
  });

  it('removing is always allowed, and removing one that is not there does nothing', () => {
    const full: Loadout = { ...none, seals: ['escape', 'counter'] };
    expect(removeSeal(full, 'escape').seals).toEqual(['counter']);
    expect(removeSeal(full, 'guard').seals).toEqual(['escape', 'counter']);
    expect(removeSeal(removeSeal(full, 'escape'), 'counter').seals).toEqual([]);
  });

  it('keeps the other slots when a Seal changes', () => {
    const l: Loadout = { stance: 'cat-stance', virtue: 'second-wind', strike: 'jumping-spins', kata: 'k', seals: ['escape'] };
    const r = equipSeal(l, 'counter', ALL, 2).loadout;
    expect(r).toEqual({ ...l, seals: ['escape', 'counter'] });
    expect(removeSeal(r, 'escape')).toEqual({ ...l, seals: ['counter'] });
  });
});

describe('PB-01 normalizing a loadout', () => {
  const l: Loadout = { ...emptyLoadout(), strike: 'jumping-spins', kata: 'basic-form-1-power', seals: ['escape', 'lock', 'counter', 'escape', 'guard'] };

  it('drops unearned picks to their defaults, repeats, and extras past the slots (from the end)', () => {
    expect(normalizeSlots(l, earned(), 2)).toEqual({ strike: 'jumping-spins', kata: 'basic-form-1-power', seals: ['escape', 'counter'] });
    expect(normalizeSlots(l, earned(), 3).seals).toEqual(['escape', 'counter', 'guard']);
    expect(normalizeSlots(l, earned(['escape']), 3).seals).toEqual(['escape']);
    expect(normalizeSlots(l, { strikes: [], families: [], kataPowers: [] }, 3)).toEqual({ strike: null, kata: null, seals: [] });
  });

  it('normalizeLoadout applies it with the belt\'s slot count (Yellow: 2, Orange: 3)', () => {
    const y = normalizeLoadout(l, training(yellow), content.abilities, [], earned())!;
    expect(y.seals).toEqual(['escape', 'counter']);
    const o = normalizeLoadout(l, training(orange), content.abilities, [], earned())!;
    expect(o.seals).toEqual(['escape', 'counter', 'guard']);
  });

  it('with no kata powers in the game yet, a kata pick is dropped; Seals are kept if earned (Yellow has Escape, Counter, Guard); Stance and Virtue are untouched', () => {
    const n = normalizeLoadout({ ...l, virtue: 'second-wind' }, training(yellow), content.abilities)!;
    expect(n).toEqual({ stance: null, virtue: 'second-wind', strike: 'jumping-spins', kata: null, seals: ['escape', 'counter'] });
  });

  it('PB-03: the old Strike id follow-up-kick means Spin Kick (the empty slot); quick-combo means Jumping Spins and is kept when its combo is signed off', () => {
    const a = normalizeLoadout({ ...emptyLoadout(), strike: 'follow-up-kick' }, training(yellow), content.abilities)!;
    expect(a.strike).toBeNull();
    const b = normalizeLoadout({ ...emptyLoadout(), strike: 'quick-combo' }, training(yellow), content.abilities)!;
    expect(b.strike).toBe('jumping-spins');
  });

  it('a Strike that was not earned goes back to null (Spin Kick)', () => {
    const n = normalizeLoadout({ ...emptyLoadout(), strike: 'quick-combo' }, training(white), content.abilities)!;
    expect(n.strike).toBeNull();
  });
});
