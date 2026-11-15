import { describe, expect, it } from 'vitest';
import { chooseDifficulty, loadProfile, markGuidedOffered, newProfile, recordFloorResult, runDifficulty, settleDifficulty, shouldOfferGuided, startingDifficulty } from '../src';
import older from '../../../fixtures/1-white-belt-new.json';
import rules from '../../../content/settings/difficulty.json';
import young from '../../../fixtures/5-white-belt-age-6-9.json';

const D = '2026-10-24';
const reload = <T>(x: T): T => JSON.parse(JSON.stringify(x));

describe('Starting difficulty (M7-P1; OV-B3, Jay Nov 14)', () => {
  it('a new 6-9 profile starts on Guided; older students start on Standard', () => {
    expect(young.student.ageBand).toBe('6-9');
    expect(rules.guidedStartAgeBands).toEqual(['6-9']);
    const kid = newProfile();
    expect(settleDifficulty(kid, startingDifficulty(young.student.ageBand, rules.guidedStartAgeBands))).toBe(true);
    expect(runDifficulty(kid)).toBe('guided');
    expect(kid.difficultyChosenByPlayer).toBe(false);
    const p = newProfile();
    expect(settleDifficulty(p, startingDifficulty(older.student.ageBand, rules.guidedStartAgeBands))).toBe(true);
    expect(runDifficulty(p)).toBe('standard');
  });

  it('Standard is one pick away for a 6-9 student, and an existing save never moves', () => {
    const kid = newProfile();
    settleDifficulty(kid, 'guided');
    chooseDifficulty(kid, 'standard');
    expect(settleDifficulty(kid, 'guided')).toBe(false);
    expect(runDifficulty(loadProfile(reload(kid)))).toBe('standard');
    const old = newProfile();
    settleDifficulty(old);
    expect(settleDifficulty(loadProfile(reload(old)), startingDifficulty('6-9', rules.guidedStartAgeBands))).toBe(false);
    expect(old.difficulty).toBe('standard');
  });

  it('a chosen difficulty sticks after reload and is never changed', () => {
    const p = newProfile();
    chooseDifficulty(p, 'guided');
    const back = loadProfile(reload(p));
    expect(settleDifficulty(back)).toBe(false);
    expect(back.difficulty).toBe('guided');
  });

  it('an old save loads with no loss streak', () => {
    const old = reload(newProfile()) as unknown as Record<string, unknown>;
    delete old.floorLosses;
    delete old.guidedOfferedOn;
    const p = loadProfile(old);
    expect(p.floorLosses).toBeNull();
    expect(p.guidedOfferedOn).toBeNull();
    expect(p.difficultyLineShown).toBe(false);
  });

  it('the choice screen calls Standard "Steady"', () => {
    expect(rules.choices.find((c) => c.id === 'standard')?.name).toBe('Steady');
    expect(rules.choices.map((c) => c.id)).toEqual(['guided', 'standard', 'challenge']);
  });
});

describe('Kind Guided offer after losses on one floor (M7-P1)', () => {
  it('is offered after 2 losses in a row on the same floor, at most once a day, and never switches by itself', () => {
    const p = newProfile();
    settleDifficulty(p);
    recordFloorResult(p, 1, 'lost');
    expect(shouldOfferGuided(p, 1, rules, D)).toBe(false);
    recordFloorResult(p, 1, 'lost');
    expect(shouldOfferGuided(p, 1, rules, D)).toBe(true);
    markGuidedOffered(p, D);
    recordFloorResult(p, 1, 'lost');
    expect(shouldOfferGuided(loadProfile(reload(p)), 1, rules, D)).toBe(false);
    expect(p.difficulty).toBe('standard');
    expect(shouldOfferGuided(p, 1, rules, '2026-10-25')).toBe(true);
  });

  it('the offer text never mentions losing, and Standard is "The usual pace"', () => {
    const all = JSON.stringify(rules.offer).toLowerCase();
    for (const w of ['lose', 'lost', 'loss', 'fail']) expect(all).not.toContain(w);
    expect(rules.choices.find((c) => c.id === 'standard')?.text).toBe('The usual pace.');
    // C9: menu buttons in normal case; only fight-button names are in caps.
    const caps = (s: string) => (s.match(/\b[A-Z]{2,}\b/g) ?? []).filter((w) => !['COUNTER', 'STRIKE', 'DASH', 'STANCE', 'VIRTUE'].includes(w));
    for (const s of [rules.offer.yes, rules.offer.no, rules.offer.title, rules.offer.line, rules.homeLine, ...rules.choices.map((c) => c.text)]) expect(caps(s)).toEqual([]);
  });

  it('losses on different floors or a clear in between reset the count', () => {
    const p = newProfile();
    recordFloorResult(p, 1, 'lost');
    recordFloorResult(p, 2, 'lost');
    expect(shouldOfferGuided(p, 2, rules, D)).toBe(false);
    recordFloorResult(p, 2, 'cleared');
    recordFloorResult(p, 2, 'lost');
    expect(shouldOfferGuided(p, 2, rules, D)).toBe(false);
    recordFloorResult(p, 2, 'rested');
    recordFloorResult(p, 2, 'lost');
    expect(shouldOfferGuided(p, 2, rules, D)).toBe(true);
  });

  it('is not offered to a player already on Guided', () => {
    const p = newProfile();
    chooseDifficulty(p, 'guided');
    recordFloorResult(p, 1, 'lost');
    recordFloorResult(p, 1, 'lost');
    expect(shouldOfferGuided(p, 1, rules, D)).toBe(false);
  });
});
