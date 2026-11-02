// MENU-BAG-01: the Bag screen shows a 6 x 4 grid (24 slots a page) at 844x390 and 667x375 (and the other
// sizes we ship), every tile is at least the minimum tap size, paging reaches every item once, and a picked
// tile is never covered by its sheet. Tap-to-select then Wear stays.
import { describe, expect, it } from 'vitest';
import { BAG_SCREEN, GEAR_BOARD, bagPageCount, bagScreenLayout, bagTileBox, sheetAtTop, filterBag, gearBoardLayout, gearSheetBox, turnBagPage } from '../../../apps/client/src/ui/gearBoard';
import { MIN_TAP, S1, S2 } from '../../../apps/client/src/ui/tokens';
import type { GearItem } from '../src';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const SIZES = [[667, 375], [844, 390], [932, 430], [1024, 768], [568, 320]] as const;
const mk = (n: number): GearItem => ({ uid: `u${n}`, base: 'x', name: `u${n}`, slot: (['hands', 'gi', 'charm'] as const)[n % 3], rarity: 'common', stats: { power: 1, maxHealth: 0, guard: 0 }, effect: null, effectText: '' }) as GearItem;

describe('MENU-BAG-01 layout', () => {
  for (const [w, h] of SIZES) {
    it(`${w}x${h}: 6 x 4 = 24 slots, tiles ≥ ${MIN_TAP}, inside the screen with ≥ ${S2} px padding, no overlap`, () => {
      const L = bagScreenLayout(w, h);
      expect(L.cols).toBe(6);
      expect(L.rows).toBe(4);
      expect(L.perPage).toBeGreaterThanOrEqual(24);
      expect(L.tileW).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.tileH).toBeGreaterThanOrEqual(MIN_TAP);
      const boxes = Array.from({ length: L.perPage }, (_, i) => bagTileBox(L, i));
      for (const b of boxes) {
        expect(b.x).toBeGreaterThanOrEqual(S2);
        expect(b.y).toBeGreaterThanOrEqual(L.gridY);
        expect(b.x + b.w).toBeLessThanOrEqual(w - S2);
        expect(b.y + b.h).toBeLessThanOrEqual(h - S2);
      }
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], c = boxes[j];
        expect(a.x + a.w <= c.x || c.x + c.w <= a.x || a.y + a.h <= c.y || c.y + c.h <= a.y).toBe(true);
      }
    });

    it(`${w}x${h}: the header's Back, filters and pager are ≥ ${MIN_TAP} tall, inside, and do not overlap`, () => {
      const L = bagScreenLayout(w, h);
      expect(BAG_SCREEN.headH).toBeGreaterThanOrEqual(MIN_TAP);
      expect(BAG_SCREEN.backW).toBeGreaterThanOrEqual(MIN_TAP);
      const filterW = 3 * MIN_TAP + 2 * 4;
      expect(L.backX + BAG_SCREEN.backW).toBeLessThanOrEqual(L.titleX);
      expect(L.titleX + 60).toBeLessThanOrEqual(L.filterX); // room for a title
      expect(L.filterX + filterW).toBeLessThanOrEqual(L.pagerX);
      expect(L.pagerX + L.pagerW).toBeLessThanOrEqual(w - S2);
      expect(L.pagerW).toBeGreaterThanOrEqual(2 * MIN_TAP);
      expect(L.headY + BAG_SCREEN.headH).toBeLessThanOrEqual(L.gridY);
    });
  }

  for (const [w, h] of SIZES.filter(([, hh]) => hh >= 375)) {
    it(`${w}x${h}: the sheet never covers the picked tile (rows 0-1 get the bottom sheet, rows 2-3 the top one)`, () => {
      const L = bagScreenLayout(w, h);
      for (let i = 0; i < L.perPage; i++) {
        const b = bagTileBox(L, i);
        const atTop = b.y + b.h > h - GEAR_BOARD.sheetH; // renderSheet's rule
        if (atTop) expect(b.y).toBeGreaterThanOrEqual(GEAR_BOARD.sheetH);
        else expect(b.y + b.h).toBeLessThanOrEqual(h - GEAR_BOARD.sheetH);
      }
    });
  }
});

describe('MENU-BAG-01 paging', () => {
  it('pages hold 24 and reach every item exactly once, filtered or not', () => {
    const inv = Array.from({ length: 61 }, (_, i) => mk(i));
    for (const f of [null, 'hands', 'gi', 'charm'] as const) {
      const bag = filterBag(inv, f);
      const pages = Math.max(1, Math.ceil(bag.length / BAG_SCREEN.perPage));
      const seen = Array.from({ length: pages }, (_, p) => bag.slice(p * BAG_SCREEN.perPage, (p + 1) * BAG_SCREEN.perPage)).flat().map((x) => x.uid);
      expect(seen.length).toBe(bag.length);
      expect(new Set(seen).size).toBe(bag.length);
    }
    expect(Math.ceil(61 / BAG_SCREEN.perPage)).toBe(3);
  });
});

describe('MENU-BAG-01 wiring', () => {
  it('the Gear tab opens the Bag screen, which has Back, paging and the same tiles and sheet', () => {
    expect(src).toMatch(/onTap: \(\) => this\.openBag\(\)/);
    expect(src).toMatch(/private renderBagLayer\(\)/);
    expect(src).toMatch(/const L = bagScreenLayout\(W0, H0\)/);
    expect(src).toMatch(/this\.closeBag\(\)/);
    expect(src).toMatch(/this\.trophyPager\(L\.pagerX, L\.headY, L\.pagerW, pages, L\.headY \+ 22, this\.bagPage\)/);
    expect(src).toMatch(/onPage = bag\.slice\(this\.bagPage \* L\.perPage, \(this\.bagPage \+ 1\) \* L\.perPage\)/);
    // One tile drawing for both screens; tap = pick, Wear stays in the sheet.
    expect(src.match(/this\.gearTile\(/g)!.length).toBe(2);
    expect(src).toMatch(/onTap: \(\) => this\.pick\(it\.uid\)/);
    expect(src).toMatch(/label: W\.wear, color: GREEN, size: 16, onTap: \(\) => this\.wear\(item\)/);
    // renderPanel always ends by (re)building the Bag layer, so wear / take off / let go / paging just work.
    expect(src).toMatch(/this\.renderBagLayer\(\);\n  \}/);
    // The Gear tab's Bag button never overlaps the three 44 filter buttons: end of the filter row when it fits, else the middle of the pager row.
    expect(src).toMatch(/const roomy = L\.gridW >= filtersW \+ S1 \+ bagBtnW;/);
    expect(src).toMatch(/const bagY = roomy \? y \+ L\.filterY : y \+ L\.pagerY;/);
  });
});

describe('MENU-BAG-01: the full-width Gear sheet at the top clears "Your Strike" at 667 wide', () => {
  // Panel sizes inside the 10 px padding at 667x375 and 667x320 (what renderGear gets).
  it.each([[345.54, 277], [369.54, 238], [369.54, 258]])('panel %s x %s: sheet is full width, lifted into the padding, 4 px above the label', (w, h) => {
    const L = gearBoardLayout(w, h);
    const sb = gearSheetBox(L, w, h);
    expect(sb.x).toBe(0);
    expect(sb.w).toBe(w);
    expect(sb.lift).toBeGreaterThan(0);
    expect(sb.lift).toBeLessThanOrEqual(S2);
    expect(GEAR_BOARD.sheetH - sb.lift).toBeLessThanOrEqual(L.alwaysY - S1);
  });
  it('renderSheet lifts only the top sheet', () => {
    expect(src).toMatch(/const sy = atTop \? top - lift : bottom - sh;/);
    expect(src).toMatch(/pickedBottom, sb\.lift\)/);
  });
});

describe('MENU-BAG-01 B1: the Bag pages on its own field', () => {
  const sheetMin = (h: number) => bagScreenLayout(1024, h);
  for (const count of [30, 60]) {
    it(`${count} items: ▶ reaches every page, stops on the last, ◀ comes back`, () => {
      const pages = bagPageCount(count);
      expect(pages).toBe(Math.ceil(count / 24));
      let page = 0;
      const visited = [page];
      for (let i = 0; i < pages + 2; i++) { page = turnBagPage(page, 1, count); visited.push(page); }
      expect(page).toBe(pages - 1);
      expect(new Set(visited).size).toBe(pages);
      for (let i = 0; i < pages + 2; i++) page = turnBagPage(page, -1, count);
      expect(page).toBe(0);
    });
  }

  it('the Gear tab behind the Bag clamps `page`, so the Bag must not read or write it (1024x768 with 30 / 60 items)', () => {
    // renderGear clamps `this.page` to its own page count; the Bag used to share that field, so ▶ was undone on the next render.
    const gearPages = (count: number) => Math.max(1, Math.ceil(count / gearBoardLayout(1024, 768).perPage));
    expect(sheetMin(768).perPage).toBe(24);
    for (const count of [30, 60]) expect(gearPages(count)).toBeLessThan(bagPageCount(count)); // so the shared clamp really did reset it
    const bagFn = src.slice(src.indexOf('private renderBagLayer()'), src.indexOf('// ---------------------------------------------------------------- actions'));
    expect(bagFn).toContain('this.bagPage');
    expect(bagFn).not.toMatch(/this\.page\b/);
    const turnFn = src.slice(src.indexOf('private turn(by: number)'), src.indexOf('private wear('));
    expect(turnFn).toMatch(/if \(this\.bagOpen\) this\.bagPage = turnBagPage\(/);
  });
});

describe('MENU-BAG-01 B1b: at 667x320 a picked row-1 tile is never mostly hidden', () => {
  it('the sheet takes the end that hides less of the tile, and 24+ px of it stays out for a second tap', () => {
    const L = bagScreenLayout(667, 320);
    for (let row = 0; row < 4; row++) {
      const b = bagTileBox(L, row * 6);
      const top = sheetAtTop(0, 320, 0, b.y + b.h, L.tileH);
      const [s0, s1] = top ? [0, GEAR_BOARD.sheetH] : [320 - GEAR_BOARD.sheetH, 320];
      const hidden = Math.max(0, Math.min(b.y + b.h, s1) - Math.max(b.y, s0));
      const other = top ? [320 - GEAR_BOARD.sheetH, 320] : [0, GEAR_BOARD.sheetH];
      const hiddenOther = Math.max(0, Math.min(b.y + b.h, other[1]) - Math.max(b.y, other[0]));
      expect(hidden).toBeLessThanOrEqual(hiddenOther);
      if (row === 1) expect(b.h - hidden).toBeGreaterThanOrEqual(20);
    }
  });
  it('the old rule still holds where the tile is clear (667x375, 1024x768)', () => {
    for (const [w, h] of [[667, 375], [1024, 768]] as const) {
      const L = bagScreenLayout(w, h);
      for (let i = 0; i < L.perPage; i++) {
        const b = bagTileBox(L, i);
        expect(sheetAtTop(0, h, 0, b.y + b.h, L.tileH)).toBe(b.y + b.h > h - GEAR_BOARD.sheetH);
      }
    }
  });
});
