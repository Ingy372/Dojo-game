// P-MENU2-f: the Gear screen. A paper doll with one ring per slot (tap = filter, tap again = all),
// a bag grid that uses as many columns as fit (at least 2) and pages with ◀ ▶, and a calm ↑ / ↓
// compare with plain words (numbers behind Details, D6). The grid never moves on pick, wear or
// filter, wearing is saved as before, and the sim (golden run) is unchanged.
import { describe, expect, it } from 'vitest';
import { equip, loadProfile, newProfile, unequip, wornItem, type GearItem } from '../src';
import words from '../../../content/loot/gear-board.json';
import { GEAR_BOARD, tileWForLabel, labelPadding, bagOrder, compareWith, filterBag, gearBoardLayout, gearColumns, tileBox, toggleFilter } from '../../../apps/client/src/ui/gearBoard';
import { MIN_TAP } from '../../../apps/client/src/ui/tokens';
import { RARITIES } from '../src';
import gearContent from '../../../content/loot/gear.json';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;

const mk = (uid: string, slot: GearItem['slot'], power: number, guard = 0, maxHealth = 0, rarity: GearItem['rarity'] = 'common'): GearItem =>
  ({ uid, base: 'x', name: uid, slot, rarity, stats: { power, maxHealth, guard }, effect: null, effectText: '' }) as GearItem;

const bag = (): GearItem[] => [mk('h1', 'hands', 1), mk('g1', 'gi', 0, 2), mk('h2', 'hands', 3), mk('c1', 'charm', 0), mk('g2', 'gi', 0, 1, 4), mk('h3', 'hands', 2, 1)];

// The Gear area (panel minus its 10px inset) at 667x375, 844x390 and 932x430, and the columns there (2 / 4 / 5; Manager: 2 at 667 so the student figure stays).
const SIZES = [{ w: 345, h: 277, cols: 2 }, { w: 476, h: 292, cols: 4 }, { w: 564, h: 332, cols: 5 }];
// Widths are Chromium's bold 12px system-ui measures (the shots), rounded up.
const WORD_W: Record<string, number> = { Everyday: 55, Special: 42, Rare: 30, Epic: 27, Legendary: 64 };
const MIN_TILE = tileWForLabel(WORD_W.Legendary);

describe('P-MENU2-f layout', () => {
  for (const s of SIZES) {
    it(`${s.w}x${s.h}: at least 2 columns, they fit, tiles and rings are ≥44`, () => {
      const L = gearBoardLayout(s.w, s.h, MIN_TILE);
      expect(L.cols).toBe(s.cols);
      expect(L.figureR).toBeGreaterThanOrEqual(14);
      expect(L.figureX + L.figureR).toBeLessThanOrEqual(L.dollW);
      const last = tileBox(L, L.perPage - 1);
      expect(last.x + last.w).toBeLessThanOrEqual(s.w);
      expect(last.y + last.h).toBeLessThanOrEqual(L.pagerY);
      expect(L.tileW).toBeGreaterThanOrEqual(GEAR_BOARD.tileMin);
      expect(L.tileH).toBeGreaterThanOrEqual(MIN_TAP);
      expect(GEAR_BOARD.ring).toBeGreaterThanOrEqual(MIN_TAP);
      expect(GEAR_BOARD.wearH).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.pagerY + GEAR_BOARD.pagerH).toBeLessThanOrEqual(s.h);
      expect(L.ringYs[L.ringYs.length - 1] + GEAR_BOARD.ring / 2).toBeLessThanOrEqual(s.h);
      expect(L.gridX).toBeGreaterThanOrEqual(L.dollW);
    });
  }
  it('paging reaches every item exactly once at each size', () => {
    const items = Array.from({ length: 23 }, (_, i) => i);
    for (const s of SIZES) {
      const L = gearBoardLayout(s.w, s.h, MIN_TILE);
      const pages = Math.max(1, Math.ceil(items.length / L.perPage));
      const seen = Array.from({ length: pages }, (_, p) => items.slice(p * L.perPage, (p + 1) * L.perPage)).flat();
      expect(seen).toEqual(items);
    }
    const scene = src.slice(src.indexOf('private renderGear('), src.indexOf('private renderSheet('));
    expect(scene).toMatch(/bag\.slice\(this\.page \* L\.perPage, \(this\.page \+ 1\) \* L\.perPage\)/);
    expect(scene).toMatch(/this\.trophyPager\(gx, y \+ L\.pagerY, L\.gridW, pages\)/);
  });
  it('even a very narrow grid keeps 2 columns', () => {
    expect(gearColumns(100).cols).toBe(2);
    expect(gearColumns(932).cols).toBeGreaterThan(gearColumns(476).cols);
  });
});

describe('P-MENU2-f the grid never moves', () => {
  it('wearing an item does not change the order (worn items stay in place)', () => {
    const p = { ...newProfile(), inventory: bag() };
    const before = bagOrder(p.inventory).map((i) => i.uid);
    equip(p, 'h1');
    equip(p, 'g2');
    expect(bagOrder(p.inventory).map((i) => i.uid)).toEqual(before);
    unequip(p, 'hands');
    expect(bagOrder(p.inventory).map((i) => i.uid)).toEqual(before);
  });
  it('the grid box only depends on the panel size (not the filter, sheet or page count)', () => {
    const a = gearBoardLayout(476, 292);
    expect(tileBox(a, 0)).toEqual(tileBox(gearBoardLayout(476, 292), 0));
    // The scene reserves the pager row and draws tiles at tileBox(L, i), and the sheet is an overlay.
    const gear = src.slice(src.indexOf('private renderGear('), src.indexOf('private renderSheet('));
    expect(gear).toMatch(/const box = tileBox\(L, i\)/);
    expect(gear).not.toMatch(/pages > 1 \?/);
  });
  it('order is slot, then strongest first, then uid', () => {
    expect(bagOrder(bag()).map((i) => i.uid)).toEqual(['h2', 'h3', 'h1', 'g2', 'g1', 'c1']);
  });
});

describe('P-MENU2-f filter', () => {
  it('tapping a ring filters to that slot; tapping it again shows everything', () => {
    let f = toggleFilter(null, 'gi');
    expect(f).toBe('gi');
    expect(filterBag(bag(), f).map((i) => i.uid)).toEqual(['g2', 'g1']);
    f = toggleFilter(f, 'hands');
    expect(f).toBe('hands');
    f = toggleFilter(f, 'hands');
    expect(f).toBeNull();
    expect(filterBag(bag(), f)).toHaveLength(6);
  });
  it('filtered tiles are the same order as in the full grid', () => {
    const all = bagOrder(bag()).filter((i) => i.slot === 'hands').map((i) => i.uid);
    expect(filterBag(bag(), 'hands').map((i) => i.uid)).toEqual(all);
  });
});

describe('P-MENU2-f compare', () => {
  it('↑ / ↓ per stat and an overall direction against what is worn', () => {
    const worn = mk('w', 'hands', 2, 2);
    const c = compareWith(mk('a', 'hands', 4, 1), worn);
    expect(c.overall).toBe('up');
    expect(c.stats).toEqual([{ stat: 'power', dir: 'up' }, { stat: 'guard', dir: 'down' }]);
    expect(c.line).toBe(words.up);
    expect(compareWith(mk('b', 'hands', 0, 1), worn).overall).toBe('down');
    expect(compareWith(mk('b', 'hands', 0, 1), worn).line).toBe(words.down);
    expect(compareWith(mk('s', 'hands', 2, 2), worn)).toMatchObject({ overall: 'same', stats: [], line: words.same });
    expect(compareWith(worn, worn).overall).toBe('worn');
    expect(compareWith(mk('n', 'gi', 0, 1), null)).toMatchObject({ overall: 'up', line: words.empty });
  });
  it('no numbers and no red in the compare (numbers only behind Details)', () => {
    const c = compareWith(mk('a', 'hands', 4, 1), mk('w', 'hands', 2, 2));
    expect(c.line).not.toMatch(/\d/);
    const mod = Object.values(import.meta.glob(['../../../apps/client/src/ui/gearBoard.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
    expect(mod).not.toMatch(/0xc0453a|#c0453a|0xff0000/i);
    const gear = src.slice(src.indexOf('private renderGear('), src.indexOf('private filterGear('));
    expect(gear).not.toMatch(/0xc0453a|0x8a2a35/);
    expect(gear).toMatch(/if \(this\.gearDetails\) \{\s*const nums = `\$\{describeItem\(item\)\}`/);
  });
});

describe('P-MENU2-f words', () => {
  it('all words come from content and use no pressure words', () => {
    const all = JSON.stringify(words);
    expect(all).not.toMatch(/\b(hurry|now or never|last chance|don't miss|limited|weak|bad|lose|fail)\b/i);
    for (const s of ['Wear', 'Take off', 'Let go', 'Details', 'Always with you']) expect(all).toContain(s);
  });
});

describe('P-MENU2-f wearing is saved', () => {
  it('equip survives a save and load', () => {
    const p = { ...newProfile(), inventory: bag() };
    equip(p, 'h2');
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(wornItem(back, 'hands')?.uid).toBe('h2');
    expect(back.inventory.map((i) => i.uid)).toEqual(p.inventory.map((i) => i.uid));
  });
  it('the scene still equips + writes the save, and skips the flight with Reduced motion', () => {
    const wear = src.slice(src.indexOf('private wear(item: GearItem)'), src.indexOf('private takeOff('));
    expect(wear).toMatch(/equip\(this\.profile, item\.uid\);\s*writeSave\(this\.profile\);/);
    expect(wear).toMatch(/reducedMotion\(\)\) return;/);
  });
});

describe('P-MENU2-f Fighting Style tray dots', () => {
  it('one dot per page, the current one lit, no dots for a single page', async () => {
    const { trayDots, trayPaging } = await import('../../../apps/client/src/ui/fightingStyle');
    // 667: the tray row is narrow, so it pages 1 tile at a time.
    const tp = trayPaging(150, 100, 5);
    expect(tp.perPage).toBe(1);
    for (let page = 0; page < tp.pages; page++) {
      const d = trayDots(tp.pages, page, 150);
      expect(d).toHaveLength(tp.pages);
      expect(d.filter((x) => x.on)).toHaveLength(1);
      expect(d.findIndex((x) => x.on)).toBe(page);
      expect(d[d.length - 1].x).toBeLessThanOrEqual(150);
    }
    expect(trayDots(1, 0, 150)).toEqual([]);
    const scene = src.slice(src.indexOf('private renderFightingStyle('), src.indexOf('private renderFightingStyle(') + 5000);
    expect(scene).toMatch(/trayDots\(tp\.pages, this\.trayPageNo, L\.leftW\)/);
  });
});

// Manager add-on (#273): the small rarity word under each tile, 12 px, from content. Tester (#273):
// every word, Legendary included, needs ≥8 px clear each side inside the 2 px border, at all 3 widths.
describe('P-MENU2-f rarity word under each tile', () => {
  const names = gearContent.rarityNames as Record<string, string>;
  const words = RARITIES.map((r) => names[r]);
  const widest = Math.max(...words.map((w) => WORD_W[w]));
  it('words come from content, Legendary is the longest, and the drawing uses the cubby helpers at 12 px', () => {
    expect(words).toEqual(['Everyday', 'Special', 'Rare', 'Epic', 'Legendary']);
    expect(widest).toBe(WORD_W.Legendary);
    expect(GEAR_BOARD.labelSize).toBeGreaterThanOrEqual(12);
    expect(src).toMatch(/RARITIES\.map\(\(r\) => probe\.setText\(rarityName\(r\)\)\.width\)/);
    expect(src).toMatch(/wrapLikeCubby\(lab, word, tw\)/);
  });
  for (const s of SIZES) {
    it(`${s.w}x${s.h}: Legendary has ≥8 px padding each side, ${s.cols} columns, word below the icon`, () => {
      const L = gearBoardLayout(s.w, s.h, tileWForLabel(widest));
      expect(L.cols).toBe(s.cols);
      expect(labelPadding(L.tileW, WORD_W.Everyday)).toBeGreaterThanOrEqual(8);
      expect(labelPadding(L.tileW, WORD_W.Legendary)).toBeGreaterThanOrEqual(8);
      const last = tileBox(L, L.perPage - 1);
      expect(last.x + last.w).toBeLessThanOrEqual(s.w);
      expect(last.y + last.h).toBeLessThanOrEqual(L.pagerY);
      expect(Math.min(GEAR_BOARD.iconMax, L.tileH - GEAR_BOARD.labelH - 12 - 4)).toBeGreaterThanOrEqual(28);
      expect(L.ringYs[L.ringYs.length - 1] + GEAR_BOARD.ring / 2).toBeLessThanOrEqual(s.h);
    });
  }
});
