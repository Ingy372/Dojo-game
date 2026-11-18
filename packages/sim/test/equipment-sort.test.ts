import { describe, expect, it } from 'vitest';
import { gearScore, newProfile, rarityRank, type GearItem, type Rarity } from '../src';

// Nov 17: the Equipment screen's rules (ui/equipment.ts keeps the drawing; these are the same rules,
// checked here on plain data): the bag shows best first, and "Wear best" picks the strongest per slot.
const item = (uid: string, slot: GearItem['slot'], rarity: Rarity, power: number, maxHealth = 0): GearItem => ({ uid, base: 'x', name: uid, slot, rarity, stats: { power, maxHealth, guard: 0 }, effect: null, effectText: '' });

function sortBag(items: readonly GearItem[]): GearItem[] {
  const order = ['hands', 'gi', 'charm'];
  return [...items].sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || gearScore(b) - gearScore(a) || order.indexOf(a.slot) - order.indexOf(b.slot));
}

describe('Equipment screen rules', () => {
  it('sorts the bag by rarity, then strength', () => {
    const bag = [item('a', 'hands', 'common', 1), item('b', 'gi', 'legendary', 0, 10), item('c', 'hands', 'rare', 2), item('d', 'hands', 'rare', 3)];
    expect(sortBag(bag).map((i) => i.uid)).toEqual(['b', 'd', 'c', 'a']);
  });

  it('the source file keeps the same order and the best-per-slot rule', async () => {
    const src = Object.values(import.meta.glob('../../../apps/client/src/ui/equipment.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
    expect(src).toMatch(/rarityRank\(b\.rarity\) - rarityRank\(a\.rarity\) \|\| gearScore\(b\) - gearScore\(a\)/);
    expect(src).toMatch(/gearScore\(it\) > gearScore\(out\[it\.slot\]\)/);
    expect(newProfile().inventory).toEqual([]);
  });
});
