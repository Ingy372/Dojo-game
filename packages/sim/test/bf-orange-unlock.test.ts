/// <reference types="vite/client" />
// BF-ORANGE-UNLOCK: Butterfly Flow is kick combo 3, learned at Orange (docs/curriculum.md), so a student
// has it once the Orange kick combo is signed off, and not before. Jumping Spins is combo 2 at Yellow.
// Each Strike names its belt in content/abilities/strikes.json; these tests walk the belts one by one.
import { describe, expect, it } from 'vitest';
import { buildTraining, earnedStrikes, loadAbilities, loadFeed } from '../src';
import { testContent } from './load-content';
import abilitiesJson from '../../../content/abilities/abilities.json';
import familiesJson from '../../../content/abilities/seal-families.json';
import doc from '../../../docs/curriculum.md?raw';
import strikesJson from '../../../content/abilities/strikes.json';
import white from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import orange from '../../../fixtures/6-orange-typical.json';


const content = testContent();
const defs = content.abilities.strikeDefs;
const JS = 'jumping-spins';
const BF = 'butterfly-flow';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const strikesOf = (data: unknown) => {
  const feed = loadFeed(data);
  return earnedStrikes(buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 }), defs);
};

/** The Orange fixture moved to `belt`: that belt's own requirements, kick combo signed off or not, nothing else signed. */
function atBelt(belt: string, kickSigned: boolean): Json {
  const d = JSON.parse(JSON.stringify(orange)) as Json;
  const school = d.school.belts.find((b: Json) => b.id === belt) as Json;
  d.rank.currentBelt = belt;
  d.catchUp = [];
  d.requirements = school.requirements.map((r: Json) => ({ ...d.requirements[0], id: r.id, type: r.type, name: r.name, belt, signedOff: kickSigned && r.type === 'kickCombo' }));
  return d;
}

describe('BF-ORANGE-UNLOCK: Strikes belt by belt', () => {
  it('White: Spin Kick only (it is the default), signed off or not', () => {
    expect(strikesOf(atBelt('white', false))).toEqual([]);
    expect(strikesOf(atBelt('white', true))).toEqual([]);
  });

  it('Yellow: Jumping Spins once the Yellow kick combo (#2) is signed off', () => {
    expect(strikesOf(atBelt('yellow', false))).toEqual([]);
    expect(strikesOf(atBelt('yellow', true))).toEqual([JS]);
  });

  it('Orange: Butterfly Flow once the Orange kick combo (#3) is signed off, with Jumping Spins from Yellow', () => {
    expect(strikesOf(atBelt('orange', false))).toEqual([JS]);
    expect(strikesOf(atBelt('orange', true))).toEqual([JS, BF]);
  });

  it('Green and up: both, whether or not that belt\'s own kick combo is signed off', () => {
    for (const belt of ['green', 'blue', 'red', 'red-black']) {
      for (const signed of [false, true]) expect(strikesOf(atBelt(belt, signed)), `${belt} ${signed}`).toEqual([JS, BF]);
    }
  });

  it('the real fixtures agree: White none, Yellow Jumping Spins, Orange before sign-off Jumping Spins, Green both', () => {
    expect(strikesOf(white)).toEqual([]);
    expect(strikesOf(white3)).toEqual([]);
    expect(strikesOf(yellow)).toEqual([JS]);
    expect(strikesOf(orange)).toEqual([JS]);
    expect(strikesOf(green)).toEqual([JS, BF]);
  });
});

describe('BF-ORANGE-UNLOCK: the combo-to-belt mapping', () => {
  it('strikes.json puts Spin Kick at White (#1), Jumping Spins at Yellow (#2), Butterfly Flow at Orange (#3)', () => {
    expect(defs.map((s) => [s.id, s.combo, s.belt])).toEqual([['spin-kick', 1, 'white'], [JS, 2, 'yellow'], [BF, 3, 'orange']]);
    expect(strikesJson.strikes.map((s) => s.belt)).toEqual(['white', 'yellow', 'orange']);
  });

  it('matches docs/curriculum.md (Kick combos: #1 White, #2 Yellow, #3 Orange)', () => {
    for (const s of defs) {
      const row = doc.split('\n').find((l) => l.startsWith(`| ${s.combo} | `) && l.includes('Kick combo'));
      expect(row, `curriculum row for combo ${s.combo}`).toBeDefined();
      expect(row!.split('|')[2].trim().toLowerCase(), `combo ${s.combo}`).toBe(s.belt);
    }
  });

  it('matches every fixture school: kick combo n is the kick requirement of belt n', () => {
    for (const data of [white, white3, yellow, green, orange] as Json[]) {
      const kicks = (data.school.belts as Json[]).flatMap((b) => b.requirements.filter((r: Json) => r.type === 'kickCombo').map((r: Json) => [b.id, r.name]));
      for (const s of defs) expect(kicks[s.combo - 1], `combo ${s.combo}`).toEqual([s.belt, `Kick Combo ${s.combo}`]);
    }
  });

  it('the content check refuses a Strike with no belt', () => {
    const bad = JSON.parse(JSON.stringify(strikesJson)) as Json;
    delete bad.strikes[2].belt;
    expect(() => loadAbilities(abilitiesJson, familiesJson, bad)).toThrow(/belt/);
  });
});
