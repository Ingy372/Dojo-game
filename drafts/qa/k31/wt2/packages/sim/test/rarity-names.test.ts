import { describe, expect, it } from 'vitest';
import { loadLootTables } from '../src';
import gear from '../../../content/loot/gear.json';
import drops from '../../../content/loot/drops.json';

describe('rarity names (C7)', () => {
  it('kids see the C7 names; the ids stay the same', () => {
    expect(loadLootTables(gear, drops).rarityNames).toEqual({ common: 'Everyday', uncommon: 'Special', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' });
  });

  it('every rarity needs a name', () => {
    const { legendary: _, ...four } = gear.rarityNames;
    expect(() => loadLootTables({ ...gear, rarityNames: four }, drops)).toThrow(/rarityNames.legendary/);
  });
});
