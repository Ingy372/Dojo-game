import { describe, expect, it } from 'vitest';
import { loadProfile, newProfile, sealBell } from '../src';

describe('P-MENU-f Seal bell plays once per Seal', () => {
  it('a new player hears it once, then never again', () => {
    const p = newProfile();
    expect(sealBell(p, 'yellow', false)).toBe(false);
    expect(sealBell(p, 'yellow', true)).toBe(true);
    expect(sealBell(p, 'yellow', true)).toBe(false);
    expect(sealBell(p, 'orange', true)).toBe(true);
    expect(p.sealsSeen).toEqual(['yellow', 'orange']);
  });
});

describe('P-MENU-f save migration', () => {
  const old = () => {
    const p = newProfile() as Partial<ReturnType<typeof newProfile>>;
    delete p.sealsSeen;
    return { ...p, runsPlayed: 12, level: 7, xp: 40 };
  };
  it('an old save loads with sealsSeen null and nothing else lowered', () => {
    const p = loadProfile(JSON.parse(JSON.stringify(old())));
    expect(p.sealsSeen).toBeNull();
    expect(p.runsPlayed).toBe(12);
    expect(p.level).toBe(7);
    expect(p.xp).toBe(40);
  });
  it('an already-lit Seal on an old save counts as seen: no bell', () => {
    const p = loadProfile(old());
    expect(sealBell(p, 'yellow', true)).toBe(false);
    expect(p.sealsSeen).toEqual(['yellow']);
    expect(sealBell(p, 'yellow', true)).toBe(false);
    expect(sealBell(p, 'orange', true)).toBe(true);
  });
  it('an unlit Seal on an old save still rings later', () => {
    const p = loadProfile(old());
    expect(sealBell(p, 'yellow', false)).toBe(false);
    expect(p.sealsSeen).toEqual([]);
    expect(sealBell(p, 'yellow', true)).toBe(true);
  });
  it('a saved list round-trips, drops junk and never shrinks', () => {
    const p = loadProfile({ ...newProfile(), sealsSeen: ['yellow', 3, 'orange'] });
    expect(p.sealsSeen).toEqual(['yellow', 'orange']);
    sealBell(p, 'green', false);
    expect(loadProfile(JSON.parse(JSON.stringify(p))).sealsSeen).toEqual(['yellow', 'orange']);
  });
});
