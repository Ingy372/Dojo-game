// PB-01 (R-PROGRESSION-BETA): an old save gets its slots seeded once; stats do not change.
import { describe, expect, it } from 'vitest';
import {
  buildTraining, characterSetup, dismissSlotNote, emptyLoadout, loadFeed, loadProfile, migrateLoadoutV2, newProfile, seedInputFor, seedLoadoutV2,
  type Loadout, type LoadoutSeedInput,
} from '../src';
import { testContent } from './load-content';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import orange from '../../../fixtures/6-orange-typical.json';

const content = testContent();
const training = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};
const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// A fully-loaded old save: it has played, and its loadout is the old two-field shape.
function oldSave(loadout: unknown = { stance: 'cat-stance', virtue: 'second-wind' }) {
  const p = copy(newProfile()) as unknown as Record<string, unknown>;
  delete p.loadoutV2;
  delete p.showSlotNote;
  return { ...p, runsPlayed: 12, stanceMigrated: true, loadout };
}
// The families this student earned, oldest first (PB-02 supplies the real list).
const input = (tier: number, families: string[], strikes: string[] = []): LoadoutSeedInput => ({ tier, earned: { strikes, families, kataPowers: [] } });

describe('PB-01 migration (migrateLoadoutV2, seedLoadoutV2)', () => {
  it('fills Seal slots with the families earned first, up to the belt (White 2, Yellow 2, Orange 3)', () => {
    const fams = ['escape', 'counter', 'guard', 'disarm'];
    expect(migrateLoadoutV2(null, input(1, fams)).loadout!.seals).toEqual(['escape', 'counter']);
    expect(migrateLoadoutV2(null, input(2, fams)).loadout!.seals).toEqual(['escape', 'counter']);
    expect(migrateLoadoutV2(null, input(3, fams)).loadout!.seals).toEqual(['escape', 'counter', 'guard']);
  });

  it('picks the newest Strike earned, so nobody is set back, and null if there is none', () => {
    expect(migrateLoadoutV2(null, input(2, ['escape'], ['spin-kick', 'jumping-spins'])).loadout!.strike).toBe('jumping-spins');
    expect(migrateLoadoutV2(null, input(2, ['escape'])).loadout!.strike).toBeNull();
  });

  it('keeps the Stance and Virtue, and leaves kata empty', () => {
    const r = migrateLoadoutV2({ ...emptyLoadout(), stance: 'cat-stance', virtue: 'second-wind' }, input(2, ['escape', 'counter'])).loadout!;
    expect(r).toMatchObject({ stance: 'cat-stance', virtue: 'second-wind', kata: null, seals: ['escape', 'counter'] });
  });

  it('a student with nothing earned and no loadout stays null, with no note', () => {
    expect(migrateLoadoutV2(null, input(1, []))).toEqual({ loadout: null, note: false });
  });

  it('the note shows only when Seals were seeded', () => {
    expect(migrateLoadoutV2(null, input(2, ['escape'])).note).toBe(true);
    expect(migrateLoadoutV2({ ...emptyLoadout(), stance: 'cat-stance' }, input(2, [])).note).toBe(false);
  });

  it('keeps an existing pick that is still earned, and fills the rest', () => {
    const l: Loadout = { ...emptyLoadout(), seals: ['guard'], strike: 'spin-kick' };
    const r = migrateLoadoutV2(l, input(2, ['escape', 'counter', 'guard'], ['spin-kick', 'jumping-spins'])).loadout!;
    expect(r.seals).toEqual(['guard', 'escape']);
    expect(r.strike).toBe('spin-kick');
  });

  it('seedLoadoutV2 runs once on an old save, and running it twice gives the same save', () => {
    const p = loadProfile(oldSave());
    expect(p.loadoutV2).toBe(false);
    expect(seedLoadoutV2(p, input(2, ['escape', 'counter', 'guard'], ['jumping-spins']))).toBe(true);
    expect(p.loadoutV2).toBe(true);
    expect(p.showSlotNote).toBe(true);
    expect(p.loadout).toEqual({ stance: 'cat-stance', virtue: 'second-wind', strike: 'jumping-spins', kata: null, seals: ['escape', 'counter'] });
    const once = copy(p);
    expect(seedLoadoutV2(p, input(2, ['escape', 'counter', 'guard'], ['jumping-spins']))).toBe(false);
    expect(p).toEqual(once);
    // ...and it survives a save and load, still done.
    const back = loadProfile(copy(p));
    expect(back.loadoutV2).toBe(true);
    expect(seedLoadoutV2(back, input(2, ['disarm']))).toBe(false);
    expect(back.loadout).toEqual(p.loadout);
  });

  it('a new profile is never seeded', () => {
    const p = newProfile();
    expect(seedLoadoutV2(p, input(2, ['escape']))).toBe(false);
    expect(p.loadout).toBeNull();
    expect(p.showSlotNote).toBe(false);
  });

  it('the note is shown once: dismissing it keeps it away after a reload', () => {
    const p = loadProfile(oldSave());
    seedLoadoutV2(p, input(1, ['escape']));
    expect(loadProfile(copy(p)).showSlotNote).toBe(true);
    dismissSlotNote(p);
    expect(loadProfile(copy(p)).showSlotNote).toBe(false);
  });

  it('an old save with no loadout at all is seeded too', () => {
    const p = loadProfile(oldSave(null));
    seedLoadoutV2(p, input(2, ['escape', 'counter']));
    expect(p.loadout).toEqual({ stance: null, virtue: null, strike: null, kata: null, seals: ['escape', 'counter'] });
  });

  it('Power, Health and the fight setup are unchanged by the seed (the slots are not read in a fight yet)', () => {
    for (const fixture of [yellow, green, orange]) {
      const t = training(fixture);
      const before = loadProfile(oldSave());
      const after = loadProfile(oldSave());
      seedLoadoutV2(after, { tier: t.tier, earned: { strikes: ['follow-up-kick'], families: ['escape', 'counter', 'guard'], kataPowers: [] } });
      expect(after.loadout!.seals.length).toBeGreaterThan(0);
      expect(characterSetup(after, t, content.abilities)).toEqual(characterSetup(before, t, content.abilities));
    }
  });

  it('seedInputFor reads the belt tier and the Strikes the training has unlocked (no families or kata powers exist yet)', () => {
    const t = training(green);
    const i = seedInputFor(t);
    expect(i.tier).toBe(t.tier);
    expect(i.earned.strikes).toEqual(t.abilities.filter((a) => a.kind === 'strike' && a.unlocked && a.perk).map((a) => a.perk!.id));
    expect(i.earned.strikes.length).toBeGreaterThan(0);
    expect(i.earned.families).toEqual([]);
    expect(i.earned.kataPowers).toEqual([]);
  });
});
