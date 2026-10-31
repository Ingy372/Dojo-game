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
