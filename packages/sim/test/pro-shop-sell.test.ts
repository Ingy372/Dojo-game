import { describe, expect, it } from 'vitest';
import { SELL_PRICE, newProfile, sellGear, sellValue, sellable, type GearItem } from '../src';

const item = (uid: string, rarity: GearItem['rarity'], slot: GearItem['slot'] = 'hands'): GearItem => ({
  uid,
  base: 'x',
  name: uid,
  slot,
  rarity,
  stats: { power: 1, maxHealth: 0, guard: 0 },
  effect: null,
  effectText: '',
});

describe('selling gear to Hannah (Nov 23)', () => {
  it('pays a fixed price by rarity, rarer pays more', () => {
    expect(sellValue(item('a', 'common'))).toBe(SELL_PRICE.common);
    const order = (['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map((r) => SELL_PRICE[r]);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('sells bag gear, adds the coins, and never sells what is worn', () => {
    const p = newProfile();
    p.coins = 10;
    p.inventory = [item('a', 'common'), item('b', 'rare'), item('c', 'epic', 'charm')];
    p.equipped.hands = 'a';
    expect(sellable(p).map((i) => i.uid)).toEqual(['b', 'c']);
    const paid = sellGear(p, ['a', 'b', 'b', 'nope']);
    expect(paid).toBe(SELL_PRICE.rare);
    expect(p.coins).toBe(10 + SELL_PRICE.rare);
    expect(p.inventory.map((i) => i.uid)).toEqual(['a', 'c']);
    expect(p.equipped.hands).toBe('a');
  });

  it('pays nothing for nothing', () => {
    const p = newProfile();
    expect(sellGear(p, [])).toBe(0);
    expect(p.coins).toBe(0);
  });

  it('stays well under what one finished run pays for a common piece', () => {
    expect(SELL_PRICE.common).toBeLessThan(20);
  });
});
