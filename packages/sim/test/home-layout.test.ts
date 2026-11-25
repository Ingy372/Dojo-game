import { describe, expect, it } from 'vitest';
import type { GearItem } from '../src';
import { KATA_LINE, RARITY_ORDER, kataLayout, kataLines } from '../../../apps/client/src/ui/homeLayout';

/** Behaviour tests for the Home Dojo layout rules moved out of HomeScene.ts (Nov 24 night). */
describe('Home Dojo layout rules', () => {
  it('sorts rarities common first, legendary last', () => {
    const order = ['legendary', 'common', 'epic', 'uncommon', 'rare'].map((rarity) => ({ rarity }) as GearItem);
    expect(order.sort((a, b) => RARITY_ORDER(a) - RARITY_ORDER(b)).map((g) => g.rarity)).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary']);
  });

  it('reads each kata step: its number and its arrows', () => {
    const cells = kataLayout('1 ←   2 →↑   10 ↓', 1000);
    expect(cells.map((c) => [c.n, c.arrows])).toEqual([['1', ['left']], ['2', ['right', 'up']], ['10', ['down']]]);
    expect(cells.every((c) => c.y === 0)).toBe(true);
    expect(cells[1].x).toBeGreaterThan(cells[0].x);
  });

  it('wraps steps onto a new line when the width runs out, never splitting a step', () => {
    const line = Array.from({ length: 12 }, (_, i) => `${i + 1} →`).join('   ');
    const cells = kataLayout(line, 120);
    expect(kataLines(line, 120)).toBeGreaterThan(1);
    for (const c of cells) expect(c.y % KATA_LINE).toBe(0);
    // The first step on every new line starts at the left edge.
    const firsts = cells.filter((c, i) => i > 0 && c.y > cells[i - 1].y);
    expect(firsts.length).toBe(kataLines(line, 120) - 1);
    for (const c of firsts) expect(c.x).toBe(0);
  });

  it('counts one line for an empty or short line', () => {
    expect(kataLines('', 200)).toBe(1);
    expect(kataLines('1 ←', 200)).toBe(1);
  });
});
