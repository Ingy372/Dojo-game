// P-MENU-c: the gate, play-time, belt entry, wipe and CreateScene buttons use the shared
// rounded button(); every tap area is at least 44 pt; tap zones sit above the dim layer.
import { describe, expect, it } from 'vitest';
import { MIN_TAP, XP_FILL, xpFillFrom } from '../../../apps/client/src/ui/tokens';

const files = import.meta.glob(['../../../apps/client/src/ui/*.ts', '../../../apps/client/src/scenes/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const raw = (p: string) => Object.entries(files).find(([k]) => k.endsWith(p))![1];
const dojo = raw('/scenes/DojoScene.ts');
const method = (src: string, name: string) => {
  const i = src.indexOf(`  private ${name}(`);
  expect(i, name).toBeGreaterThan(-1);
  return src.slice(i, src.indexOf('\n  }\n', i));
};
const scopes: Record<string, string> = {
  grownUpGate: raw('/ui/grownUpGate.ts'),
  CreateScene: raw('/scenes/CreateScene.ts'),
  openPlayLimit: method(dojo, 'openPlayLimit'),
  openBeltEntry: method(dojo, 'openBeltEntry'),
  confirmBeltEntry: method(dojo, 'confirmBeltEntry'),
  addWipeButton: method(dojo, 'addWipeButton'),
  confirmWipe: method(dojo, 'confirmWipe'),
};
const DIM = /rectangle\(0, 0, width, height[^)]*\)[^;]*setInteractive\(\)/;

describe('P-MENU-c: no square buttons left', () => {
  for (const [name, src] of Object.entries(scopes)) {
    it(`${name}: the only tappable rectangle is the full-screen dim layer`, () => {
      const statements = src.split(';').filter((s) => /\.rectangle\(/.test(s) && /setInteractive\(/.test(s));
      for (const s of statements) expect(DIM.test(s), s.trim()).toBe(true);
      // CreateScene's round colour dots (circles, 44 pt hit areas) keep their own handler.
      if (name !== 'CreateScene') expect(src).not.toMatch(/GAMEOBJECT_POINTER_UP/);
    });
  }
});

describe('P-MENU-c: every swapped button is at least 44 pt (button() also pads the tap area)', () => {
  const button = raw('/ui/button.ts');
  it('button() pads its tap zone to MIN_TAP and supports selected + disabled', () => {
    expect(MIN_TAP).toBe(44);
    expect(button).toMatch(/selected\?: boolean/);
    // A4-DOJO-hotfix: the outline is baked into the button texture; selected is still a 3 pt gold line.
    expect(button).toMatch(/o\.selected \? \{ width: 3, colour: 0xffd166/);
    expect(button).toMatch(/if \(o\.disabled\) visual\.setAlpha\(0\.35\);\s*else hit\.setInteractive/);
  });
  for (const [name, src] of Object.entries(scopes)) {
    it(`${name}: literal button heights are >= 44`, () => {
      for (const m of src.matchAll(/(?:roundButton|button)\(this|button\(scene/g)) {
        const call = src.slice(m.index!, src.indexOf('}', m.index!));
        const h = /\bh: (\d+)\b/.exec(call);
        if (h) expect(Number(h[1]), call).toBeGreaterThanOrEqual(44);
      }
    });
  }
  it('Training Board left column: ◀ Dojo 96x44, ENTER 52 (44 on a short screen), Practice room 44', () => {
    const home = method(raw('/scenes/HomeScene.ts'), 'renderShell');
    expect(home).toMatch(/96, 44, '◀ Dojo'/);
    expect(home).toMatch(/const enterH = short \? MIN_TAP : 52;/);
    expect(home).toMatch(/leftW, enterH, 'ENTER THE TOWER'/);
    expect(home).toMatch(/leftW, 44, 'Practice room'/);
  });
});

describe('P-MENU-c: tap zones sit above dim layers', () => {
  it('button() adds the tap zone last, into the given container', () => {
    expect(raw('/ui/button.ts')).toMatch(/parent\?\.add\(\[visual, hit\]\)/);
  });
  for (const name of ['grownUpGate', 'openPlayLimit', 'openBeltEntry', 'confirmBeltEntry', 'confirmWipe']) {
    it(`${name}: the dim layer is added before the first button`, () => {
      const src = scopes[name];
      const dim = src.search(DIM);
      const first = src.search(/(?:roundButton|button)\((this|scene|[a-z]+,)/);
      if (dim >= 0) expect(dim).toBeLessThan(first);
    });
  }
});

describe('P-MENU-c: XP bar fill', () => {
  it('fills from the old share over 400 ms Cubic.Out; a new level fills from empty', () => {
    expect(XP_FILL).toEqual({ ms: 400, ease: 'Cubic.Out' });
    expect(xpFillFrom({ level: 3, share: 0.2 }, { level: 3, share: 0.6 })).toBe(0.2);
    expect(xpFillFrom({ level: 3, share: 0.9 }, { level: 4, share: 0.1 })).toBe(0);
    expect(xpFillFrom({ level: 3, share: 0.6 }, { level: 3, share: 0.6 })).toBeNull();
    expect(xpFillFrom(null, { level: 3, share: 0.6 })).toBeNull();
  });
  it('Reduced motion draws the bar at once', () => {
    expect(method(raw('/scenes/HomeScene.ts'), 'xpBar')).toMatch(/from === null \|\| reducedMotion\(\)/);
  });
});
