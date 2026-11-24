// OV-B1 (review 6.3): Sensei's Pick puts each new Kick and (Tool Belt, Nov 24) each new tool in its place after a sign-off.
// Seal families are no longer picked: the Tool Belt replaced them.
import { describe, expect, it } from 'vitest';
import { emptyLoadout, loadProfile, newProfile, senseiPick, type LoadoutEarned } from '../src';
import { testContent } from './load-content';
import { pickLineText } from '../../../apps/client/src/ui/fightingStyle';

const earned = (strikes: string[], tools: number[]): LoadoutEarned => ({ strikes, families: [], kataPowers: [], tools });
const known = (strikes: string[], tools: number[]) => {
  const p = newProfile();
  senseiPick(p, earned(strikes, tools), 1, 2);
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
    expect(senseiPick(p, earned(['front-kick'], [1]), 1, 2)).toEqual([]);
    expect(p.loadout).toBeNull();
    expect(p.picksKnown).toEqual(['front-kick', 'tool-1']);
  });

  it('a new sign-off puts the move in its place without a menu', () => {
    const p = known([], []);
    expect(senseiPick(p, earned(['front-kick'], [1]), 1, 2)).toEqual([
      { kind: 'added', slot: 'strike', move: 'front-kick' },
      { kind: 'added', slot: 'tool', move: '1' },
    ]);
    expect(p.loadout).toMatchObject({ strike: 'front-kick', tools: [1] });
  });

  it('full pockets: the oldest tool rests and the line names it; the newest Kick replaces the old one', () => {
    const p = known(['front-kick'], [1, 3]);
    p.loadout = { ...emptyLoadout(), stance: 'cat-stance', strike: 'front-kick', tools: [1, 3] };
    expect(senseiPick(p, earned(['front-kick', 'side-kick'], [1, 3, 8]), 1, 2)).toEqual([
      { kind: 'swapped', slot: 'strike', move: 'side-kick', out: 'front-kick' },
      { kind: 'swapped', slot: 'tool', move: '8', out: '1' },
    ]);
    expect(p.loadout).toEqual({ ...emptyLoadout(), stance: 'cat-stance', strike: 'side-kick', tools: [3, 8] });
  });

  it("with Sensei's Pick off the player keeps their choice", () => {
    const p = known(['front-kick'], [1]);
    p.senseiPick = false;
    p.loadout = { ...emptyLoadout(), strike: 'front-kick', tools: [1] };
    const before = JSON.stringify(p.loadout);
    expect(senseiPick(p, earned(['front-kick', 'side-kick'], [1, 8]), 1, 2)).toEqual([
      { kind: 'ready', slot: 'strike', move: 'side-kick' },
      { kind: 'ready', slot: 'tool', move: '8' },
    ]);
    expect(JSON.stringify(p.loadout)).toBe(before);
  });

  it('runs once per move: a second check changes nothing', () => {
    const p = known([], []);
    senseiPick(p, earned(['front-kick'], [1]), 1, 2);
    p.loadout = { ...p.loadout!, tools: [] };
    expect(senseiPick(p, earned(['front-kick'], [1]), 1, 2)).toEqual([]);
    expect(p.loadout.tools).toEqual([]);
  });

  it('more new tools than pockets: the newest fill the pockets and the rest are ready', () => {
    const p = known([], []);
    expect(senseiPick(p, earned([], [1, 3, 8]), 1, 2).map((l) => `${l.kind}:${l.move}`)).toEqual(['ready:1', 'added:3', 'added:8']);
    expect(p.loadout!.tools).toEqual([3, 8]);
  });

  it('new Seal families are no longer picked', () => {
    const p = known([], []);
    expect(senseiPick(p, { strikes: [], families: ['escape'], kataPowers: [], tools: [] }, 1, 2)).toEqual([]);
  });

  it('survives a save and load', () => {
    const p = known(['front-kick'], []);
    p.senseiPick = false;
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.senseiPick).toBe(false);
    expect(back.picksKnown).toEqual(['front-kick']);
  });

  it('the kid lines use real names and OV-L1 words, and a swap names the tool that rested', () => {
    const { abilities } = testContent();
    const [k1, k2] = abilities.strikeDefs.filter((d) => !d.default);
    expect(pickLineText({ kind: 'added', slot: 'strike', move: k1.id }, abilities)).toBe(`Sensei added ${k1.name} to your moves!`);
    expect(pickLineText({ kind: 'swapped', slot: 'strike', move: k2.id, out: k1.id }, abilities)).toBe(`${k2.name} is in. ${k1.name} is resting.`);
    expect(pickLineText({ kind: 'swapped', slot: 'tool', move: '3', out: '1' }, abilities)).toBe('#3 Spin Back Fist is in. #1 Off the Line is resting.');
    expect(pickLineText({ kind: 'ready', slot: 'tool', move: '1' }, abilities)).toBe('#1 Off the Line is ready. Add it anytime!');
  });
});
