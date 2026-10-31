// Q-PREMIUM-2 routine fixes: small source/pure checks that hold each fix in place.
import { describe, expect, it } from 'vitest';

const src = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const read = (name: string): string => {
  const hit = Object.entries(src).find(([k]) => k.endsWith(name));
  if (!hit) throw new Error(`missing ${name}`);
  return hit[1];
};

describe('Q-PREMIUM-2 M3 character creation swatches', () => {
  const s = read('scenes/CreateScene.ts');
  it('colours are two rows of five, with a swatch at least 30 px and the whole cell tapping', () => {
    expect(s).toMatch(/perRow = Math\.ceil\(n \/ 2\)/);
    expect(s).toMatch(/const rad = Math\.min\(20, cell \* 0\.36, \(cellH - 3\) \/ 2\)/);
    expect(s).toMatch(/new Phaser\.Geom\.Rectangle\(rad - 2 - cell \/ 2, rad - 2 - cellH \/ 2, cell, cellH\)/);
  });
  it('the Done / Back buttons moved under the character so the swatches get the full height', () => {
    expect(s).toMatch(/const by = height - pad - MIN_TAP;/);
    expect(s).toMatch(/Let's go!/);
  });
});

describe('Q-PREMIUM-2 M7 / M12 fight HUD', () => {
  const s = read('scenes/GameScene.ts');
  it('door names show only when no enemy is left and never under a loot toast', () => {
    expect(s).toMatch(/d\.label\.setVisible\(!enemiesAlive && !this\.underToast\(d\.label\)\)/);
    expect(s).toMatch(/private underToast\(label: Phaser\.GameObjects\.Text\): boolean/);
  });
  it('the Wave counter goes with the last enemy', () => {
    expect(s).toMatch(/!prog\.cleared && enemiesAlive \?/);
  });
  it("the hero's own numbers ride above the head, step aside, and at most 3 show", () => {
    expect(s).toMatch(/const HERO_POP_RAISE_PX = 46;/);
    expect(s).toMatch(/const HERO_POP_SIDE_PX = \[0, -38, 38\];/);
    expect(s).toMatch(/const HERO_POP_MAX = 3;/);
    expect(s).toMatch(/this\.heroPops\.length > HERO_POP_MAX/);
  });
});

describe('Q-PREMIUM-2 M9 / M10 / L2 Dojo panels and labels', () => {
  const s = read('scenes/DojoScene.ts');
  it('panel backdrops are nearly solid and the room labels are 14 px', () => {
    expect(s).toMatch(/const LABEL_PX = 14;/);
    expect((s.match(/0\.97/g) ?? []).length).toBeGreaterThanOrEqual(7);
  });
  it('Erase progress sits a full 20 px off the screen edge', () => {
    expect(s).toMatch(/x: 20, y: height - 20 - 44, w, h: 44, label: t\.wipeButton/);
  });
});
