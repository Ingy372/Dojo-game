// P-MENU-e: the Gate, the resume offer, the Dojo popup cards and CreateScene use the shared
// rounded button(); every one is drawn at least 44 pt tall; no square tappable rectangles left.
import { describe, expect, it } from 'vitest';
import { MIN_TAP } from '../../../apps/client/src/ui/tokens';

const files = import.meta.glob(['../../../apps/client/src/ui/*.ts', '../../../apps/client/src/scenes/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const raw = (p: string) => Object.entries(files).find(([k]) => k.endsWith(p))![1];
const dojo = raw('/scenes/DojoScene.ts');
const home = raw('/scenes/HomeScene.ts');
const create = raw('/scenes/CreateScene.ts');
const method = (src: string, name: string) => {
  const i = src.indexOf(`  private ${name}(`);
  expect(i, name).toBeGreaterThan(-1);
  return src.slice(i, src.indexOf('\n  }\n', i));
};
const DIM = /rectangle\(0, 0, width, height[^)]*\)[^;]*setInteractive\(\)/;
const scopes: Record<string, string> = {
  grownUpGate: raw('/ui/grownUpGate.ts'),
  card: method(dojo, 'card'),
  openScroll: method(dojo, 'openScroll'),
  openDifficulty: method(dojo, 'openDifficulty'),
  offerResume: method(dojo, 'offerResume'),
  dojoButton: method(dojo, 'button'),
  CreateScene: create,
};

describe('P-MENU-e: Dojo popups, the resume offer and the Gate use button()', () => {
  for (const [name, src] of Object.entries(scopes)) {
    it(`${name}: calls button() and has no square tappable rectangle`, () => {
      expect(src).toMatch(/(?:roundButton|button)\((this|scene)/);
      for (const s of src.split(';').filter((x) => /\.rectangle\(/.test(x) && /setInteractive\(/.test(x))) expect(DIM.test(s), s.trim()).toBe(true);
      // Only the dim layer (tap outside to close) may keep its own handler.
      if (name !== 'CreateScene') expect(src.replace(/dim\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_UP/, '')).not.toMatch(/GAMEOBJECT_POINTER_UP/);
    });
    it(`${name}: every literal button height is >= 44 (or MIN_TAP)`, () => {
      for (const m of src.matchAll(/(?:roundButton|button)\((?:this|scene)/g)) {
        const call = src.slice(m.index!, src.indexOf('}', m.index!));
        const h = /\bh: (\d+)\b/.exec(call);
        if (h) expect(Number(h[1]), call).toBeGreaterThanOrEqual(MIN_TAP);
      }
    });
  }
  it('the resume offer and the lesson card are rounded panels', () => {
    expect(method(dojo, 'offerResume')).toMatch(/roundPanel\(/);
    expect(method(dojo, 'card')).toMatch(/roundPanel\(/);
    expect(method(dojo, 'roundPanel')).toMatch(/fillRoundedRect\([^)]*RADIUS\.panel\)/);
  });
  it('the Gate READY chip pops once and never loops; sundial and Seal sit on rounded cards', () => {
    const gate = method(home, 'renderGate');
    expect(gate).not.toMatch(/repeat: -1/);
    expect(gate).toMatch(/MOTION\.pop/);
    expect(gate).toMatch(/fillRoundedRect\([^;]*RADIUS\.panel/);
  });
});

describe('P-MENU-e: CreateScene buttons are drawn at least 44 tall', () => {
  it('Boy / Girl, the arrows, Done and Back are MIN_TAP tall', () => {
    const calls = [...create.matchAll(/this\.button\(([^;]*)\);/g)].map((m) => m[1]);
    expect(calls.length).toBe(5);
    for (const c of calls) expect(c).toMatch(/, (MIN_TAP|h), (?:'|b ===|this\.first)/);
    expect(method(create, 'stepper')).toMatch(/const h = MIN_TAP;/);
    expect(create).toMatch(/const btnRowH = MIN_TAP \+ 2;/); // Q-PREMIUM-2 M3: 2 px gaps so the colour rows get the room
  });
  it("keeps the Boy / Girl words as they are (Jay hasn't decided them yet)", () => {
    expect(create).toMatch(/b === 'a' \? 'Boy' : 'Girl'/);
  });
});
