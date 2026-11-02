// START-LEVEL-PIN: Jay's rule (Nov 2, 2026). A new student starts at Level 1 with 0 XP whatever their belt, even
// with a belt entry. All their real check-offs for what they already know start active. Level comes only from XP
// earned in game. The code already behaved this way (checked on main after #428); these tests pin it.
import { describe, expect, it } from 'vitest';
import { applyBeltEntry, buildTraining, earnedPicks, gainXp, loadFeed, loadProfile, newProfile, recordBeltEntry, xpToNext } from '../src';
import { testContent } from './load-content';

const files = import.meta.glob('../../../fixtures/*.json', { eager: true, import: 'default' });
const fixture = (name: string) => loadFeed(files[`../../../fixtures/${name}.json`]);
const abilities = testContent().abilities;
const now = { ms: Date.parse('2027-06-01T12:00:00Z'), weekday: 2 };
const white = fixture('1-white-belt-new');
const belts = white.school.belts;
const saved = (p: unknown) => loadProfile(JSON.parse(JSON.stringify(p)));

describe('START-LEVEL-PIN: a new save is Level 1 with 0 XP, whatever the belt', () => {
  it('a brand-new profile is Level 1 with 0 XP, and loading it back keeps that', () => {
    const p = newProfile();
    expect([p.level, p.xp]).toEqual([1, 0]);
    const back = saved(p);
    expect([back.level, back.xp]).toEqual([1, 0]);
  });

  it('loading an empty or old save never invents a level', () => {
    for (const raw of [{}, { version: 1 }, { version: 1, runsPlayed: 0 }]) {
      const p = loadProfile(raw);
      expect([p.level, p.xp], JSON.stringify(raw)).toEqual([1, 0]);
    }
  });

  it('a belt entry for every belt leaves the profile at Level 1 with 0 XP, saved and loaded', () => {
    for (const belt of belts) {
      const p = newProfile();
      p.beltEntry = recordBeltEntry(belts, p.beltEntry, { belt: belt.id, stripes: 2 });
      expect(p.beltEntry?.belt, belt.id).toBe(belt.id);
      const back = saved(p);
      expect(back.beltEntry, belt.id).toEqual(p.beltEntry);
      expect([back.level, back.xp], belt.id).toEqual([1, 0]);
    }
  });

  it('applying a belt entry and playing on it never moves the profile: no level or XP from the belt itself', () => {
    // The profile goes through the real chain (record the entry, apply it to the feed, build the training, gain 0 XP),
    // so a belt that leaked into level or XP anywhere along the way would change it.
    for (const belt of belts) {
      const p = newProfile();
      p.beltEntry = recordBeltEntry(belts, p.beltEntry, { belt: belt.id, stripes: 2 });
      const before = JSON.stringify(p);
      const training = buildTraining(applyBeltEntry(white, p.beltEntry), abilities, now);
      gainXp(p, training, 0);
      expect(JSON.stringify(p), belt.id).toBe(before);
      expect([p.level, p.xp], belt.id).toEqual([1, 0]);
    }
  });

  it('an old full-shape save with no level or XP, even with runs played, loads at Level 1 with 0 XP', () => {
    const raw = JSON.parse(JSON.stringify(newProfile()));
    delete raw.level;
    delete raw.xp;
    raw.runsPlayed = 5;
    const p = loadProfile(raw);
    expect([p.level, p.xp]).toEqual([1, 0]);
  });
});

describe('START-LEVEL-PIN: level comes only from XP earned in game', () => {
  it('a Green belt entry still plays a first run from Level 1: catch-up doubles the XP, and the level moves only by that XP', () => {
    const training = buildTraining(applyBeltEntry(white, { belt: 'green', stripes: 1 }), abilities, now);
    expect(training.belt.id).toBe('green');
    expect(training.expectedLevel).toBeGreaterThan(1);
    const p = newProfile();
    const gain = gainXp(p, training, 10);
    expect(gain.catchUp).toBe(true);
    expect(gain.multiplier).toBe(2);
    expect(gain.gained).toBe(20);
    const need = xpToNext(1, training.belts);
    expect(need).toBeGreaterThan(gain.gained);
    expect([p.level, p.xp, gain.levelsGained]).toEqual([1, 20, 0]);
  });

  it('every level gained is paid for in XP: level 1 plus the levels gained, with the XP left over', () => {
    const training = buildTraining(applyBeltEntry(white, { belt: 'green', stripes: 0 }), abilities, now);
    const p = newProfile();
    const gain = gainXp(p, training, 400);
    let paid = 0;
    for (let l = 1; l < p.level; l++) paid += xpToNext(l, training.belts);
    expect(p.level).toBe(1 + gain.levelsGained);
    expect(paid + p.xp).toBe(gain.gained);
  });
});

describe('START-LEVEL-PIN: real check-offs start active, whatever the level', () => {
  it('a belt entry marks the earlier belts\' items signed off, while the profile is Level 1', () => {
    const t = buildTraining(applyBeltEntry(white, { belt: 'yellow', stripes: 2 }), abilities, now);
    const whiteItems = t.requirements.filter((r) => r.belt === 'white');
    expect(whiteItems.length).toBeGreaterThan(0);
    expect(whiteItems.every((r) => r.signedOff)).toBe(true);
    expect(newProfile().level).toBe(1);
  });

  it('a teacher sign-off in the feed comes through as signed off', () => {
    const t = buildTraining(fixture('2-white-belt-3-signoffs'), abilities, now);
    expect(t.requirements.filter((r) => r.signedOff).length).toBeGreaterThan(0);
  });

  it('what a student can use comes from the check-offs: a Green feed has picks that a fresh White feed does not, with no profile involved', () => {
    const fresh = earnedPicks(buildTraining(white, abilities, now), abilities);
    const green = earnedPicks(buildTraining(fixture('4-green-belt'), abilities, now), abilities);
    expect(green.strikes.length + green.families.length).toBeGreaterThan(fresh.strikes.length + fresh.families.length);
    expect(earnedPicks.length).toBe(2); // (training, abilities): no profile or level goes in
  });
});
