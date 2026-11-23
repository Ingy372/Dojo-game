// Visual overhaul (Nov 22): skins, auras, pets and decorations in the shop; achievement trophies for the dojo.
import { describe, expect, it } from 'vitest';
import {
  SKIN_SLOTS,
  achievementValue,
  buyLook,
  giveAchievementPieces,
  giveShopDecor,
  loadShopCatalog,
  newDojo,
  newProfile,
  playerStats,
  wearLook,
  wornExtras,
  wornSkins,
} from '../src';
import { testContent } from './load-content';
import RAW from '../../../content/shop/catalog.json';

const CATALOG = loadShopCatalog(RAW);
const content = testContent();

describe('skins, auras and pets in the catalog', () => {
  it('every skin names a layer of its own slot, and hats that hide hair are hats', () => {
    for (const i of CATALOG.items) {
      const slot = CATALOG.groups.find((g) => g.id === i.group)!.slot;
      if ((SKIN_SLOTS as readonly string[]).includes(slot)) expect(i.layer?.startsWith(`${slot}-`)).toBe(true);
      if (i.hidesHair) expect(slot).toBe('hat');
    }
    expect(CATALOG.items.filter((i) => i.layer?.startsWith('outfit-'))).toHaveLength(10);
    expect(CATALOG.items.filter((i) => i.layer?.startsWith('hat-'))).toHaveLength(9);
    expect(CATALOG.items.filter((i) => i.layer?.startsWith('back-'))).toHaveLength(5);
    expect(CATALOG.items.filter((i) => i.aura)).toHaveLength(10);
    expect(CATALOG.items.filter((i) => i.pet)).toHaveLength(6);
  });

  it('nothing for sale touches the belt, and rarity is only a label (fixed prices, never random)', () => {
    for (const i of CATALOG.items) {
      expect(i.layer ?? '').not.toMatch(/belt/);
      expect(Number.isInteger(i.price)).toBe(true);
    }
  });

  it('the loader refuses a skin without its layer and an aura with too many motes', () => {
    const bad = (item: object) => () => loadShopCatalog({ groups: RAW.groups, items: [item] });
    expect(bad({ id: 'x', group: 'outfit', name: 'X', price: 1, belt: 1, color: '#ffffff' })).toThrow(/layer/);
    expect(bad({ id: 'x', group: 'outfit', name: 'X', price: 1, belt: 1, color: '#ffffff', layer: 'hat-x' })).toThrow(/layer/);
    expect(bad({ id: 'x', group: 'aura', name: 'X', price: 1, belt: 1, color: '#ffffff', aura: { style: 'flame', colors: ['#ffffff'], motes: 40, size: 1 } })).toThrow(/motes/);
    expect(bad({ id: 'x', group: 'gi-dye', name: 'X', price: 1, belt: 1, color: '#ffffff', hidesHair: true })).toThrow();
  });

  it('wearing skins, an aura and a pet: worn as bought, taken off, and never a change to a fight', () => {
    const p = newProfile();
    const before = JSON.stringify(playerStats(p));
    p.coins = 100000;
    expect(buyLook(p, CATALOG, 'skin-panda-pal', 9)).toBe(true);
    expect(buyLook(p, CATALOG, 'hat-panda-hood', 9)).toBe(true);
    expect(buyLook(p, CATALOG, 'pet-red-panda', 9)).toBe(true);
    expect(buyLook(p, CATALOG, 'aura-leaf-dance', 9)).toBe(true);
    expect(wornSkins(p, CATALOG)).toEqual({ outfit: 'outfit-panda-pal', hat: 'hat-panda-hood', back: null, hidesHair: true });
    expect(wornExtras(p, CATALOG).pet).toBe('pet-red-panda');
    expect(wornExtras(p, CATALOG).aura?.style).toBe('leaf');
    expect(wearLook(p, CATALOG, 'hat', null)).toBe(true);
    expect(wornSkins(p, CATALOG).hidesHair).toBe(false);
    expect(JSON.stringify(playerStats(p))).toBe(before);
  });

  it('a skin above the belt waits on the shelf (Iron Samurai comes at belt 6)', () => {
    const p = newProfile();
    p.coins = 100000;
    expect(buyLook(p, CATALOG, 'skin-iron-samurai', 1)).toBe(false);
    expect(buyLook(p, CATALOG, 'skin-iron-samurai', 6)).toBe(true);
  });
});

describe('decorations from the shop and from achievements', () => {
  it('every decoration sold in the shop exists, is a shop piece, and arrives in storage once', () => {
    const ids = new Set(content.dojo.decorations.map((d) => d.id));
    const sold = CATALOG.items.filter((i) => i.decor);
    expect(sold).toHaveLength(16);
    for (const i of sold) {
      expect(ids.has(i.decor!)).toBe(true);
      expect(content.dojo.decorations.find((d) => d.id === i.decor)!.source).toBe('shop');
    }
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    const count = dojo.items.length;
    p.coins = 100000;
    expect(buyLook(p, CATALOG, 'decor-lucky-cat', 1)).toBe(true);
    expect(p.shop.wearing.decor).toBeNull();
    expect(giveShopDecor(p, dojo, CATALOG)).toEqual(['decor-v2-lucky-cat']);
    expect(giveShopDecor(p, dojo, CATALOG)).toEqual([]);
    expect(dojo.items.length).toBe(count + 1);
    expect(buyLook(p, CATALOG, 'decor-lucky-cat', 1)).toBe(false);
  });

  it('achievement trophies come once each when the in-game stat reaches the goal', () => {
    const pieces = content.dojo.decorations.filter((d) => d.source === 'achievement');
    expect(pieces).toHaveLength(10);
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    expect(giveAchievementPieces(p, dojo, content)).toEqual([]);
    p.runsPlayed = 10;
    expect(giveAchievementPieces(p, dojo, content)).toEqual(['decor-v2-champion-cup']);
    expect(giveAchievementPieces(p, dojo, content)).toEqual([]);
    p.bests.longestCombo = 31;
    p.kataBests = { a: { bestMs: null, fewestWrong: 0, runs: 1 }, b: { bestMs: null, fewestWrong: 0, runs: 1 }, c: { bestMs: null, fewestWrong: 0, runs: 2 } };
    expect(achievementValue(p, 'kataClean')).toBe(3);
    expect(giveAchievementPieces(p, dojo, content).sort()).toEqual(['decor-v2-golden-fist', 'decor-v2-kata-plaque']);
  });

  it('achievements are game stats only: no real-life stat (stripes, belts, classes) earns one', () => {
    for (const d of content.dojo.decorations.filter((x) => x.source === 'achievement')) {
      expect(['runs', 'floors', 'combo', 'perfects', 'kataClean', 'starWall', 'journal', 'guardians', 'level']).toContain(d.achievement!.stat);
    }
  });
});
