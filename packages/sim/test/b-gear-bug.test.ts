import { describe, expect, it } from 'vitest';
import { equip, unequip, wornItem, type GearItem, type Profile } from '../src/index';

// B-GEAR-BUG: Jay (iPhone, landscape) could not take gear off or change it. Worn gear is not in
// the bag grid, and the worn cards were plain drawings, so a worn item could never be picked:
// no sheet, no Take off. These lock in that the worn row is tappable and the sheet offers Take off.
const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const gear = src.slice(src.indexOf('private renderGear('), src.indexOf('private renderSheet('));
const worn = gear.slice(0, gear.indexOf('const bag ='));
const sheet = src.slice(src.indexOf('private renderSheet('), src.indexOf('private pick('));

describe('B-GEAR-BUG worn gear can be taken off and swapped', () => {
  it('each worn card is a shared button() that picks the worn item', () => {
    expect(worn).toMatch(/button\(this, \{[^}]*h: boxH[^}]*onTap: \(\) => this\.pick\(item\.uid\)/);
  });
  it('the sheet opens for a worn item (looked up in the whole bag, not just the grid)', () => {
    expect(gear).toMatch(/const selected = this\.pickedItem\(\);/);
    expect(src).toMatch(/private pickedItem\(\): GearItem \| null \{\s*return this\.profile\.inventory\.find\(\(it\) => it\.uid === this\.selected\)/);
    expect(gear).not.toMatch(/bag\.find\(\(it\) => it\.uid === this\.selected\)/);
    // An empty bag (everything worn) must still show the sheet.
    const empty = gear.slice(gear.indexOf('if (bag.length === 0)'), gear.indexOf('return;', gear.indexOf('if (bag.length === 0)')));
    expect(empty).toMatch(/renderSheet\(selected/);
  });
  it('a worn item gets Take off, which calls unequip', () => {
    expect(sheet).toMatch(/now\?\.uid === item\.uid[\s\S]*label: 'Take off'[\s\S]*this\.takeOff\(item\)/);
    expect(src).toMatch(/private takeOff\(item: GearItem\): void \{\s*unequip\(this\.profile, item\.slot\);\s*writeSave/);
  });
  it('rules: equip swaps within a slot, unequip empties it', () => {
    const mk = (uid: string): GearItem => ({ uid, base: 'x', name: uid, slot: 'hands', rarity: 'common', stats: { power: 1, maxHealth: 0, guard: 0 }, effect: null, effectText: '' }) as GearItem;
    const p = { inventory: [mk('A'), mk('B')], equipped: { hands: null, gi: null, charm: null } } as unknown as Profile;
    expect(equip(p, 'A')).toBe(true);
    expect(wornItem(p, 'hands')?.uid).toBe('A');
    equip(p, 'B');
    expect(wornItem(p, 'hands')?.uid).toBe('B');
    unequip(p, 'hands');
    expect(wornItem(p, 'hands')).toBeNull();
    expect(p.inventory.map((i) => i.uid)).toEqual(['A', 'B']);
  });
});
