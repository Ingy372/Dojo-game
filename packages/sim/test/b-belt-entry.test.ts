import { describe, expect, it } from 'vitest';
import { applyBeltEntry, buildTraining, feedEntry, loadFeed, loadProfile, newProfile, recordBeltEntry } from '../src';
import { testContent } from './load-content';

const files = import.meta.glob('../../../fixtures/*.json', { eager: true, import: 'default' });
const fixture = (name: string) => loadFeed(files[`../../../fixtures/${name}.json`]);
const abilities = testContent().abilities;
const now = { ms: Date.parse('2027-06-01T12:00:00Z'), weekday: 2 };
const white = fixture('1-white-belt-new');
const yellow = fixture('3-yellow-belt');
const belts = white.school.belts;

describe('B-BELT: a grown-up enters the belt and stripes', () => {
  it('"Yellow, 2 stripes" shows Yellow with 2 stripes and unlocks the White items', () => {
    const t = buildTraining(applyBeltEntry(white, { belt: 'yellow', stripes: 2 }), abilities, now);
    expect(t.belt.id).toBe('yellow');
    expect(t.stripesByBelt.yellow).toBe(2);
    const whiteItems = t.requirements.filter((r) => r.belt === 'white');
    expect(whiteItems.length).toBeGreaterThan(0);
    expect(whiteItems.every((r) => r.signedOff)).toBe(true);
    expect(t.gate.locks.every((r) => r.belt === 'yellow' && !r.signedOff)).toBe(true);
    expect(t.gate.sealLit).toBe(false);
  });

  it('stripes on the same belt add to the feed without changing its sign-offs', () => {
    const t = buildTraining(applyBeltEntry(white, { belt: 'white', stripes: 1 }), abilities, now);
    const base = buildTraining(white, abilities, now);
    expect(t.belt.id).toBe('white');
    expect(t.stripesByBelt.white).toBe(1);
    expect(t.requirements).toEqual(base.requirements);
  });

  it('lasts through a save and reload (the profile JSON)', () => {
    const p = newProfile();
    p.beltEntry = recordBeltEntry(belts, p.beltEntry, { belt: 'yellow', stripes: 2 });
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.beltEntry).toEqual({ belt: 'yellow', stripes: 2 });
    expect(buildTraining(applyBeltEntry(white, back.beltEntry), abilities, now).belt.id).toBe('yellow');
  });

  it('old saves load with no entry; broken entries are dropped', () => {
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.beltEntry;
    expect(loadProfile(old).beltEntry).toBeNull();
    expect(loadProfile({ ...old, beltEntry: { belt: 3 } }).beltEntry).toBeNull();
    expect(loadProfile({ ...old, beltEntry: { belt: 'yellow', stripes: 9 } }).beltEntry).toEqual({ belt: 'yellow', stripes: 2 });
  });

  it('never lowers: a lower entry keeps the saved one', () => {
    const saved = { belt: 'green', stripes: 1 };
    expect(recordBeltEntry(belts, saved, { belt: 'yellow', stripes: 2 })).toEqual(saved);
    expect(recordBeltEntry(belts, saved, { belt: 'green', stripes: 0 })).toEqual(saved);
    expect(recordBeltEntry(belts, saved, { belt: 'green', stripes: 2 })).toEqual({ belt: 'green', stripes: 2 });
    expect(recordBeltEntry(belts, saved, { belt: 'no-such-belt', stripes: 2 })).toEqual(saved);
  });

  it('never lowers: an entry below the feed changes nothing', () => {
    expect(applyBeltEntry(yellow, { belt: 'white', stripes: 2 })).toBe(yellow);
    expect(applyBeltEntry(yellow, feedEntry(yellow))).toBe(yellow);
    expect(applyBeltEntry(yellow, null)).toBe(yellow);
  });

  it('keeps stripes already earned on lower belts', () => {
    const f = applyBeltEntry(yellow, { belt: 'orange', stripes: 0 });
    const t = buildTraining(f, abilities, now);
    expect(t.belt.id).toBe('orange');
    expect(t.stripesByBelt.white).toBe(2);
    expect(t.stripesByBelt.yellow).toBe(1);
    expect(f.rank.history.map((h) => h.belt)).toEqual(['white', 'yellow', 'orange']);
  });
});
