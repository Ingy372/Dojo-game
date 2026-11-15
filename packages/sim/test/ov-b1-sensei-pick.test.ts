// OV-B1 (review 6.3): Sensei's Pick puts each new Kick and Defense in its slot after a sign-off.
import { describe, expect, it } from 'vitest';
import { loadProfile, newProfile, senseiPick, type LoadoutEarned } from '../src';
import { testContent } from './load-content';
import { pickLineText } from '../../../apps/client/src/ui/fightingStyle';

const earned = (strikes: string[], families: string[]): LoadoutEarned => ({ strikes, families, kataPowers: [] });
const known = (strikes: string[], families: string[]) => {
  const p = newProfile();
  senseiPick(p, earned(strikes, families), 1);
  return p;
};

describe("OV-B1 Sensei's Pick", () => {
  it('is on for a new profile and for an old save without the field, and the first check moves nothing', () => {
    expect(newProfile().senseiPick).toBe(true);
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.senseiPick;
    delete old.picksKnown;
    const p = loadProfile(old);
    expect(p.senseiPick).toBe(true);
    expect(p.picksKnown).toBeNull();
    expect(senseiPick(p, earned(['front-kick'], ['escape']), 1)).toEqual([]);
    expect(p.loadout).toBeNull();
    expect(p.picksKnown).toEqual(['front-kick', 'escape']);
  });

  it('a new sign-off puts the move in its slot without a menu', () => {
    const p = known([], []);
    expect(senseiPick(p, earned(['front-kick'], ['escape']), 1)).toEqual([
      { kind: 'added', slot: 'strike', move: 'front-kick' },
      { kind: 'added', slot: 'seal', move: 'escape' },
    ]);
    expect(p.loadout).toMatchObject({ strike: 'front-kick', seals: ['escape'] });
  });

  it('full slots: the oldest Seal rests and the line names it; the newest Kick replaces the old one', () => {
    const p = known(['front-kick'], ['escape', 'counter']);
    p.loadout = { stance: 'cat-stance', virtue: null, strike: 'front-kick', kata: null, seals: ['escape', 'counter'] };
    expect(senseiPick(p, earned(['front-kick', 'side-kick'], ['escape', 'counter', 'block']), 1)).toEqual([
      { kind: 'swapped', slot: 'strike', move: 'side-kick', out: 'front-kick' },
      { kind: 'swapped', slot: 'seal', move: 'block', out: 'escape' },
    ]);
    expect(p.loadout).toEqual({ stance: 'cat-stance', virtue: null, strike: 'side-kick', kata: null, seals: ['counter', 'block'] });
  });

  it('with Sensei\'s Pick off the player keeps their choice', () => {
    const p = known(['front-kick'], ['escape']);
    p.senseiPick = false;
    p.loadout = { stance: null, virtue: null, strike: 'front-kick', kata: null, seals: ['escape'] };
    const before = JSON.stringify(p.loadout);
    expect(senseiPick(p, earned(['front-kick', 'side-kick'], ['escape', 'block']), 1)).toEqual([
      { kind: 'ready', slot: 'strike', move: 'side-kick' },
      { kind: 'ready', slot: 'seal', move: 'block' },
    ]);
    expect(JSON.stringify(p.loadout)).toBe(before);
  });

  it('runs once per move: a second check changes nothing', () => {
    const p = known([], []);
    senseiPick(p, earned(['front-kick'], ['escape']), 1);
    p.loadout = { ...p.loadout!, seals: [] };
    expect(senseiPick(p, earned(['front-kick'], ['escape']), 1)).toEqual([]);
    expect(p.loadout.seals).toEqual([]);
  });

  it('more new Seals than slots: the newest fill the slots and the rest are ready', () => {
    const p = known([], []);
    expect(senseiPick(p, earned([], ['escape', 'counter', 'block']), 1).map((l) => `${l.kind}:${l.move}`)).toEqual(['ready:escape', 'added:counter', 'added:block']);
    expect(p.loadout!.seals).toEqual(['counter', 'block']);
  });

  it('survives a save and load', () => {
    const p = known(['front-kick'], []);
    p.senseiPick = false;
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.senseiPick).toBe(false);
    expect(back.picksKnown).toEqual(['front-kick']);
  });

  it('the kid lines use real names and OV-L1 words, and a swap names the Seal that rested', () => {
    const { abilities } = testContent();
    const [k1, k2] = abilities.strikeDefs.filter((d) => !d.default);
    expect(pickLineText({ kind: 'added', slot: 'strike', move: k1.id }, abilities)).toBe(`Sensei added ${k1.name} to your moves!`);
    expect(pickLineText({ kind: 'swapped', slot: 'strike', move: k2.id, out: k1.id }, abilities)).toBe(`${k2.name} is in. ${k1.name} is resting.`);
    expect(pickLineText({ kind: 'swapped', slot: 'seal', move: 'counter', out: 'escape' }, abilities)).toBe('Counter is in. Escape is resting.');
    expect(pickLineText({ kind: 'ready', slot: 'seal', move: 'escape' }, abilities)).toBe('Escape is ready. Add it anytime!');
  });
});
