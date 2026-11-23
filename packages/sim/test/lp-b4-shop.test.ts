import { GOLD, GREEN, contrast } from '../../../apps/client/src/ui/tokens';
// LP-B4 (L13 Stage 1): coins and the looks shop. Looks only, coins only, no real money anywhere.
import { describe, expect, it } from 'vitest';
import {
  COINS,
  buyLook,
  createRng,
  nextFloat,
  finishRun,
  loadProfile,
  loadShopCatalog,
  newDojo,
  newProfile,
  openClassChests,
  playerStats,
  runCoins,
  shelf,
  startRun,
  summarizeRun,
  wearLook,
  wornColors,
  type RoomResult,
  type RunSummary,
} from '../src';
import { testContent } from './load-content';
import RAW from '../../../content/shop/catalog.json';
import beltFeed from '../../../fixtures/1-white-belt-new.json';

const raw = (m: Record<string, unknown>) => m as Record<string, string>;
const SIM_SRC = raw(import.meta.glob('../src/*.ts', { query: '?raw', import: 'default', eager: true }));
const PACKAGES = raw(import.meta.glob(['../../../package.json', '../../../apps/*/package.json', '../../../packages/*/package.json'], { query: '?raw', import: 'default', eager: true }));
const content = testContent();
const CATALOG = loadShopCatalog(RAW);
const room = (kind: RoomResult['kind']) => ({ kind }) as RoomResult;
const fights = (n: number) => Array.from({ length: n }, () => room('battle'));
const summary = (over: Partial<RunSummary>): RunSummary => ({ ...summarizeRun(startRun(content, { seed: 1, dryRuns: 0 })), ...over });

describe('coins a run pays (LP-P1 #494)', () => {
  it('60 for any finished run, +3 a fight room, +10 the boss, +10 a win; rest and treasure rooms pay nothing', () => {
    expect(runCoins({ test: false, result: 'lost', results: [] })).toBe(60);
    expect(runCoins({ test: false, result: 'lost', results: [...fights(3), room('rest'), room('treasure')] })).toBe(69);
    expect(runCoins({ test: false, result: 'lost', results: [...fights(2), room('challenge')] })).toBe(69);
    expect(runCoins({ test: false, result: 'cleared', results: [...fights(7), room('boss')] })).toBe(101);
    expect(runCoins({ test: false, result: 'rested', results: fights(2) })).toBe(66);
  });

  it('a test-link run pays 0, and so does resting before the first room is cleared', () => {
    expect(runCoins({ test: true, result: 'cleared', results: [...fights(7), room('boss')] })).toBe(0);
    expect(runCoins({ test: false, result: 'rested', results: [] })).toBe(0);
  });

  it('finishRun banks the coins and remembers what the run paid', () => {
    const p = newProfile();
    finishRun(p, summary({ result: 'cleared', results: [...fights(7), room('boss')] }));
    expect(p.coins).toBe(101);
    expect(p.lastRun?.coins).toBe(101);
    finishRun(p, summary({ test: true, result: 'cleared', results: fights(7) }));
    expect(p.coins).toBe(101);
  });

  it('every Class Chest adds 150 coins', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    const info = (n: number) => ({ checkIns: Array.from({ length: n }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}T17:00:00`), classesInRank: 0, classesTotal: null, belt: { tier: 1, color: '#ffffff' } });
    expect(openClassChests(p, dojo, content, info(1))).toHaveLength(1);
    expect(p.coins).toBe(COINS.classChest);
    expect(openClassChests(p, dojo, content, info(4))).toHaveLength(3);
    expect(p.coins).toBe(4 * COINS.classChest);
    expect(openClassChests(p, dojo, content, info(4))).toHaveLength(0);
    expect(p.coins).toBe(4 * COINS.classChest);
  });

  it('old saves start at 0 coins and an empty shop; coins and looks survive a save', () => {
    const old = JSON.parse(JSON.stringify(newProfile())) as Record<string, unknown>;
    delete old.coins;
    delete old.shop;
    const p = loadProfile(old);
    expect(p.coins).toBe(0);
    expect(p.shop).toEqual({ owned: [], wearing: { gi: null, hair: null, trail: null, puff: null, hit: null, win: null, wall: null, outfit: null, hat: null, back: null, aura: null, pet: null, decor: null } });
    expect(loadProfile({ ...old, coins: -40 }).coins).toBe(0);
    p.coins = 350;
    expect(buyLook(p, CATALOG, 'gi-rose', 1)).toBe(true);
    expect(loadProfile(JSON.parse(JSON.stringify(p)))).toMatchObject({ coins: 150, shop: { owned: ['gi-rose'], wearing: { gi: 'gi-rose', hair: null } } });
  });
});

describe('the catalog (content/shop/catalog.json)', () => {
  it('has the 12 gi dyes and 8 hair dyes, 200 coins each, on the shelf at belt 1 or 2', () => {
    const by = (g: string) => CATALOG.items.filter((i) => i.group === g);
    expect(by('gi-dye')).toHaveLength(12);
    expect(by('hair-dye')).toHaveLength(8);
    for (const i of [...by('gi-dye'), ...by('hair-dye')]) {
      expect(i.price).toBe(200);
      expect([1, 2]).toContain(i.belt);
    }
    expect(shelf(CATALOG, 1).filter((i) => i.group.endsWith('-dye'))).toHaveLength(10);
    expect(shelf(CATALOG, 2).filter((i) => i.group.endsWith('-dye'))).toHaveLength(20);
  });

  it('the checker refuses broken entries', () => {
    const item = CATALOG.items[0];
    const bad = (over: object) => () => loadShopCatalog({ groups: RAW.groups, items: [{ ...item, ...over }] });
    expect(bad({})).not.toThrow();
    expect(() => loadShopCatalog({ groups: RAW.groups, items: [item, item] })).toThrow(/repeated/);
    expect(bad({ color: 'pink' })).toThrow(/color/);
    expect(bad({ price: 0 })).toThrow(/price/);
    expect(bad({ belt: 0 })).toThrow(/belt/);
    expect(bad({ group: 'belt-dye' })).toThrow(/group/);
    expect(() => loadShopCatalog({ groups: [{ id: 'belts', name: 'Belts', slot: 'belt' }], items: [] })).toThrow();
  });

  it('no gi dye looks like a belt colour of the school (CIEDE2000 at least 15)', () => {
    const belts = [...new Set(JSON.stringify(beltFeed).match(/"color2?":"#[0-9a-fA-F]{6}"/g)!.map((m) => m.slice(-8, -1)))];
    for (const i of CATALOG.items.filter((x) => x.group === 'gi-dye')) for (const b of belts) expect(deltaE2000(i.color, b), `${i.name} vs ${b}`).toBeGreaterThanOrEqual(15);
  });

  it('no money words: no currency signs, no buying coins, no timers or pressure', () => {
    const words = JSON.stringify(RAW).replace(/"_note":"[^"]*"/g, '');
    expect(words).not.toMatch(/[$€£¥₹¢]|\b(usd|price tag|real money|buy coins|get coins|coin pack|today only|limited|hurry|only \d+ left|expires|sale|deal|offer ends|don't miss)\b/i);
  });
});

describe('buying and wearing', () => {
  it('refuses a look above the belt, one already owned, or one the coins do not cover', () => {
    const p = newProfile();
    p.coins = 199;
    expect(buyLook(p, CATALOG, 'gi-rose', 1)).toBe(false);
    p.coins = 1000;
    expect(buyLook(p, CATALOG, 'gi-plum', 1)).toBe(false);
    expect(buyLook(p, CATALOG, 'gi-plum', 2)).toBe(true);
    expect(buyLook(p, CATALOG, 'gi-plum', 2)).toBe(false);
    expect(buyLook(p, CATALOG, 'no-such-look', 9)).toBe(false);
    expect(p.coins).toBe(800);
  });

  it('coins go down only by a purchase, by its price, and never below 0', () => {
    const rng = createRng(42);
    const p = newProfile();
    for (let i = 0; i < 500; i++) {
      const before = p.coins;
      const r = nextFloat(rng);
      if (r < 0.3) {
        finishRun(p, summary({ result: nextFloat(rng) < 0.5 ? 'cleared' : 'lost', results: fights(Math.floor(nextFloat(rng) * 8)) }));
        expect(p.coins).toBeGreaterThan(before);
      } else if (r < 0.9) {
        const item = CATALOG.items[Math.floor(nextFloat(rng) * CATALOG.items.length)];
        const bought = buyLook(p, CATALOG, item.id, 1 + Math.floor(nextFloat(rng) * 3));
        expect(p.coins).toBe(bought ? before - item.price : before);
      } else {
        wearLook(p, CATALOG, nextFloat(rng) < 0.5 ? 'gi' : 'hair', null);
        expect(p.coins).toBe(before);
      }
      expect(p.coins).toBeGreaterThanOrEqual(0);
    }
  });

  it('wears only owned looks in their own slot, and can go back to the own colour', () => {
    const p = newProfile();
    p.coins = 400;
    buyLook(p, CATALOG, 'gi-mint', 1);
    buyLook(p, CATALOG, 'hair-lilac', 1);
    expect(wornColors(p, CATALOG)).toEqual({ gi: '#a8dcc4', hair: '#b9a2dc', wall: null });
    expect(wearLook(p, CATALOG, 'hair', 'gi-mint')).toBe(false);
    expect(wearLook(p, CATALOG, 'gi', 'gi-rose')).toBe(false);
    expect(wearLook(p, CATALOG, 'gi', null)).toBe(true);
    expect(wornColors(p, CATALOG)).toEqual({ gi: null, hair: '#b9a2dc', wall: null });
  });

  it('looks never reach a fight: stats are the same with every dye worn, and no run code reads the shop', () => {
    const p = newProfile();
    const before = JSON.stringify(playerStats(p));
    p.coins = 9999999;
    for (const i of CATALOG.items) buyLook(p, CATALOG, i.id, 9);
    expect(p.shop.owned).toHaveLength(CATALOG.items.length);
    expect(JSON.stringify(playerStats(p))).toBe(before);
    const readers = Object.entries(SIM_SRC).filter(([f, code]) => !f.endsWith('/shop.ts') && /\.shop\b|wornColors|ShopSave/.test(code)).map(([f]) => f.split('/').pop());
    expect(readers).toEqual(['profile.ts']);
  });
});

describe('no real-money code path', () => {
  it('no package.json brings in a store-billing, payments or ads plugin', () => {
    const deps = Object.values(PACKAGES).flatMap((text) => {
      const j = JSON.parse(text);
      return Object.keys({ ...j.dependencies, ...j.devDependencies, ...j.peerDependencies, ...j.optionalDependencies });
    });
    expect(Object.keys(PACKAGES).length).toBeGreaterThanOrEqual(3);
    expect(deps.length).toBeGreaterThan(5);
    expect(deps.filter((d) => /purchase|billing|\biap\b|in-app|revenuecat|storekit|stripe|payment|paypal|admob|ads\b/i.test(d))).toEqual([]);
  });
});

// CIEDE2000 colour difference between two "#rrggbb" colours.
function deltaE2000(a: string, b: string): number {
  const lab = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
    const xyz = [
      (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047,
      c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722,
      (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883,
    ].map((v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116));
    return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
  };
  const [L1, a1, b1] = lab(a);
  const [L2, a2, b2] = lab(b);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (x: number, y: number) => (x === 0 && y === 0 ? 0 : (Math.atan2(y, x) / rad + 360) % 360);
  const h1 = h(a1p, b1), h2 = h(a2p, b2);
  const dL = L2 - L1, dC = C2p - C1p;
  let dh = h2 - h1;
  if (C1p * C2p === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
  let hm = h1 + h2;
  if (C1p * C2p !== 0) hm = Math.abs(h1 - h2) > 180 ? (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2 : (h1 + h2) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const SC = 1 + 0.045 * Cmp, SH = 1 + 0.015 * Cmp * T;
  const RT = -2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

describe('LP-B4 button words are readable', () => {
  it('white words on the Shop and Get it buttons are at least 4.5:1', () => {
    expect(contrast(GOLD, 0xffffff)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(GREEN, 0xffffff)).toBeGreaterThanOrEqual(4.5);
  });
});
