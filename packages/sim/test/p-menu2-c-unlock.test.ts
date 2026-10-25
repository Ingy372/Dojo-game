import { describe, expect, it } from 'vitest';
import { loadProfile, newProfile, newTrophies } from '../src';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const moment = src.slice(src.indexOf('private unlockMoment('), src.indexOf('private trophyPager('));

describe('P-MENU2-c unlock moment plays once per unlock', () => {
  it('a new unlock plays once, then never again', () => {
    const p = newProfile();
    expect(newTrophies(p, [], [])).toEqual([]);
    expect(newTrophies(p, ['a'], ['a'])).toEqual(['a']);
    expect(newTrophies(p, ['a'], ['a'])).toEqual([]);
    expect(newTrophies(p, ['a', 'b'], ['a', 'b'])).toEqual(['b']);
    expect(p.trophiesSeen).toEqual(['a', 'b']);
  });
  it('a cubby on another page waits until its page is shown', () => {
    const p = newProfile();
    expect(newTrophies(p, ['a', 'b'], ['a'])).toEqual(['a']);
    expect(newTrophies(p, ['a', 'b'], ['b'])).toEqual(['b']);
    expect(newTrophies(p, ['a', 'b'], ['a', 'b'])).toEqual([]);
  });
  it('survives a save and load', () => {
    const p = newProfile();
    newTrophies(p, ['a'], ['a']);
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(newTrophies(back, ['a'], ['a'])).toEqual([]);
  });
});

describe('P-MENU2-c old saves', () => {
  it('a save without trophiesSeen loads, and past unlocks never replay', () => {
    const p = newProfile() as Partial<ReturnType<typeof newProfile>>;
    delete p.trophiesSeen;
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.trophiesSeen).toBeNull();
    expect(newTrophies(back, ['a', 'b'], ['a'])).toEqual([]);
    expect(newTrophies(back, ['a', 'b'], ['b'])).toEqual([]);
    expect(newTrophies(back, ['a', 'b', 'c'], ['c'])).toEqual(['c']);
  });
});

describe('P-MENU2-c motion', () => {
  it('reduced motion is a plain fade only; full motion sweeps then pops; no endless tweens', () => {
    expect(moment).toMatch(/if \(reducedMotion\(\)\) \{[\s\S]*alpha: 1[\s\S]*return;/);
    expect(moment).toMatch(/scaleX: 0[\s\S]*MOTION\.pop/);
    expect(moment).not.toMatch(/repeat:\s*-1|yoyo/);
  });
});
