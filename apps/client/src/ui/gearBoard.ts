// P-MENU2-f: the Gear screen model and layout (pure, no Phaser, so Vitest can check it).
// A paper doll on the left (one ring per slot), a bag grid of tiles on the right that uses as
// many columns as fit (at least 3), ◀ ▶ pages, and a compare in the sheet with ↑ / ↓ and plain
// words (numbers only behind Details, D6). The grid never moves when you pick, wear or filter:
// its order ignores what is worn and its box never depends on the filter, sheet or page count.
import { GEAR_SLOTS, compareGear, gearScore, type GearItem, type GearSlot } from '@dojo/sim';
import words from '../../../../content/loot/gear-board.json';
import { MIN_TAP, S1, S2, TROPHY_UI, TYPE } from './tokens';

export const GEAR_WORDS = words;

/** Sizes. Tiles are never narrower than tileMin; rings and every tap target are at least 44. */
export const GEAR_BOARD = { tileMin: 56, labelSize: 12, labelH: 15, iconMax: 36, tileMax: 76, ring: 48, ringGap: S2, dollMin: 102, dollMax: 150, gap: S2, filterH: MIN_TAP, pagerH: MIN_TAP, sheetH: 172, sheetNarrowMin: 280, wearH: 52, flyMs: 220, labelPad: 8, stroke: 2 } as const;

export interface GearBoardLayout {
  dollW: number;
  ringX: number;
  ringYs: number[];
  figureX: number;
  figureY: number;
  figureR: number;
  alwaysY: number;
  alwaysIcon: number;
  perAlwaysRow: number;
  alwaysRows: number;
  gridX: number;
  gridW: number;
  filterY: number;
  gridY: number;
  cols: number;
  rows: number;
  perPage: number;
  tileW: number;
  tileH: number;
  pagerY: number;
}

/** Columns that fit in a grid `gridW` wide: as many tiles of at least tileMin as fit, never fewer than 2. */
export function gearColumns(gridW: number, minTileW: number = GEAR_BOARD.tileMin): { cols: number; tileW: number } {
  const g = GEAR_BOARD;
  const min = Math.max(g.tileMin, minTileW);
  const cols = Math.max(2, Math.floor((gridW + g.gap) / (min + g.gap)));
  const tileW = Math.min(Math.max(g.tileMax, min), Math.floor((gridW - (cols - 1) * g.gap) / cols));
  return { cols, tileW };
}

/**
 * The Gear panel layout for a panel w x h (positions relative to its top-left). `minTileW` is the
 * widest rarity word plus its padding (B-POLISH-2 cubby rules), measured once from content, so the
 * grid depends only on the panel size and the words, never on a pick, wear or filter.
 */
export function gearBoardLayout(w: number, h: number, minTileW: number = GEAR_BOARD.tileMin): GearBoardLayout {
  const g = GEAR_BOARD;
  // The bag gets the columns that fit beside the smallest doll (at least 2; Manager, 2 at 667 so the
  // student figure stays), and the doll gets what is left, never less than dollMin.
  const min = Math.max(g.tileMin, minTileW);
  const fitCols = Math.max(2, Math.floor((w - S2 - g.dollMin + g.gap) / (min + g.gap)));
  const dollW = Math.max(g.dollMin, Math.min(g.dollMax, Math.round(w * 0.27), w - S2 - fitCols * min - (fitCols - 1) * g.gap));
  const ringYs = GEAR_SLOTS.map((_, i) => i * (g.ring + g.ringGap));
  const dollH = ringYs[ringYs.length - 1] + g.ring;
  const figW = dollW - g.ring - S2;
  const figureR = Math.max(14, Math.min(30, figW / 2.2, dollH / 3.6));
  const alwaysY = dollH + S2;
  const alwaysIcon = MIN_TAP;
  const perAlwaysRow = Math.max(1, Math.floor((dollW + S1) / (alwaysIcon + S1)));
  const iconsTop = alwaysY + TYPE.label + S1;
  const alwaysRows = Math.max(0, Math.floor((h - iconsTop + S1) / (alwaysIcon + S1)));
  const area = w - dollW - S2;
  const { cols, tileW } = gearColumns(area, minTileW);
  // Tiles, arrows and dots share one centred strip so any spare width splits evenly.
  const gridW = Math.min(area, cols * tileW + (cols - 1) * g.gap);
  const gridX = dollW + S2 + Math.floor((area - gridW) / 2);
  // Room for the icon, the rarity word under it, and padding; fewer rows rather than fewer than 3 columns.
  const tileH = Math.max(MIN_TAP, GEAR_BOARD.iconMax - 8 + GEAR_BOARD.labelH + 3 * S1 + 6, Math.min(tileW, 72));
  const filterY = 0;
  const gridY = g.filterH + S2;
  const pagerY = h - g.pagerH;
  const rows = Math.max(1, Math.floor((pagerY - S1 - gridY + g.gap) / (tileH + g.gap)));
  return {
    dollW, ringX: g.ring / 2, ringYs: ringYs.map((y) => y + g.ring / 2), figureX: g.ring + S2 + figW / 2, figureY: dollH / 2 - figureR * 0.4, figureR,
    alwaysY, alwaysIcon, perAlwaysRow, alwaysRows, gridX, gridW, filterY, gridY, cols, rows, perPage: cols * rows, tileW, tileH, pagerY,
  };
}

/**
 * G2B12-FIXES: where the item sheet goes, relative to the panel (w x h). It is full width, except that when it
 * would cover the "Your Strike" row it starts right of the doll column, as long as that leaves it
 * sheetNarrowMin or more. Smaller panels keep the full-width sheet (see lift).
 */
export function gearSheetBox(L: GearBoardLayout, w: number, h: number): { x: number; w: number; lift: number } {
  const strikeBottom = L.alwaysY + TYPE.label + S1 + L.alwaysIcon;
  const x = L.dollW + S2;
  if (h - GEAR_BOARD.sheetH < strikeBottom && w - x >= GEAR_BOARD.sheetNarrowMin) return { x, w: w - x, lift: 0 };
  // MENU-BAG-01: a full-width sheet at the top ends sheetH down; if that reaches the "Your Strike" label it moves up
  // into the panel's 10 px padding (at most S2) so a 4 px gap is left.
  return { x: 0, w, lift: Math.min(S2, Math.max(0, GEAR_BOARD.sheetH - L.alwaysY + S1)) };
}

/** The tile at index i on a page: its top-left, relative to the panel. Depends only on i and the layout. */
export function tileBox(L: GearBoardLayout, i: number): { x: number; y: number; w: number; h: number } {
  const c = i % L.cols;
  const r = Math.floor(i / L.cols);
  return { x: L.gridX + c * (L.tileW + GEAR_BOARD.gap), y: L.gridY + r * (L.tileH + GEAR_BOARD.gap), w: L.tileW, h: L.tileH };
}

/** The bag in a fixed order: slot, then best first, then uid. Worn items stay in place (marked), so wearing never moves a tile. */
export function bagOrder(inventory: readonly GearItem[]): GearItem[] {
  return [...inventory].sort((a, b) => GEAR_SLOTS.indexOf(a.slot) - GEAR_SLOTS.indexOf(b.slot) || gearScore(b) - gearScore(a) || (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0));
}

/** The bag shown for a filter (null = everything). */
export function filterBag(inventory: readonly GearItem[], slot: GearSlot | null): GearItem[] {
  const all = bagOrder(inventory);
  return slot ? all.filter((it) => it.slot === slot) : all;
}

/** Tapping a ring: filter to that slot; tapping the same ring again shows everything. */
export function toggleFilter(current: GearSlot | null, tapped: GearSlot): GearSlot | null {
  return current === tapped ? null : tapped;
}

export type Dir = 'up' | 'down';
export type StatKey = 'power' | 'maxHealth' | 'guard';
export interface GearCompare {
  /** 'worn' when the item is the one worn; otherwise how it compares overall. */
  overall: 'worn' | 'up' | 'down' | 'same';
  /** One arrow per stat that differs, in a fixed order. */
  stats: { stat: StatKey; dir: Dir }[];
  /** The plain-words line. */
  line: string;
}

const STATS: StatKey[] = ['power', 'maxHealth', 'guard'];

/** Compare an item with what is worn in its slot: ↑ / ↓ per stat plus plain words. No numbers (D6). */
export function compareWith(item: GearItem, worn: GearItem | null): GearCompare {
  if (worn && worn.uid === item.uid) return { overall: 'worn', stats: [], line: words.worn };
  const stats = STATS.flatMap((stat) => {
    const d = item.stats[stat] - (worn?.stats[stat] ?? 0);
    return d === 0 ? [] : [{ stat, dir: (d > 0 ? 'up' : 'down') as Dir }];
  });
  const overall = compareGear(item, worn);
  const line = !worn ? words.empty : words[overall];
  return { overall, stats, line };
}

/** Calm compare colours: soft green for ↑, soft grey for ↓. Never red. */
export const COMPARE_COLOR = { up: 0x6fbf8a, down: 0x9a93a8, same: 0x9a93a8 } as const;
export const COMPARE_CSS = { up: '#6fbf8a', down: '#a59fb2' } as const;
export const ARROW = { up: '↑', down: '↓' } as const;

/** The width a tile needs for a rarity word `textW` wide: 8 px padding a side, past the 2 px border on each side. */
export function tileWForLabel(textW: number): number {
  return Math.ceil(textW) + 2 * (TROPHY_UI.cubbyPadX + TROPHY_UI.stroke);
}

/** The clear space each side of a centred word `textW` wide in a tile `tileW` wide, inside its 2 px border. */
export function labelPadding(tileW: number, textW: number): number {
  return (tileW - textW) / 2 - TROPHY_UI.stroke;
}

/** The slot label with {slot} filled in. */
export function slotEmptyLine(slot: GearSlot): string {
  return words.slotEmpty.replace('{slot}', words.slots[slot]);
}

/**
 * MENU-BAG-01: the Bag screen. It covers the whole view and shows a fixed 6 x 4 grid (24 slots a page)
 * at every size we ship. One 44 header row holds Back, the title, the slot filters and the pager, so the
 * grid gets the rest. Tiles are never smaller than minTileW x minTileH (both at least MIN_TAP), and rows
 * 0 and 1 end above a bottom sheet while rows 2 and 3 start below a top sheet, so a picked tile is never covered.
 */
export const BAG_SCREEN = { cols: 6, rows: 4, perPage: 24, pad: S2, gap: S2, headH: MIN_TAP, backW: 96, tileMaxW: 104, tileMaxH: 76, minTileW: MIN_TAP, minTileH: MIN_TAP } as const;

export interface BagScreenLayout {
  cols: number;
  rows: number;
  perPage: number;
  tileW: number;
  tileH: number;
  /** The grid's top-left and width. */
  gridX: number;
  gridY: number;
  gridW: number;
  /** The header row: Back, title, the filters and the pager (left to right). */
  headY: number;
  backX: number;
  titleX: number;
  filterX: number;
  pagerX: number;
  pagerW: number;
}

export function bagScreenLayout(w: number, h: number): BagScreenLayout {
  const b = BAG_SCREEN;
  const g = b.gap;
  const gridY = b.pad + b.headH + b.pad;
  const fitW = Math.floor((w - 2 * b.pad - (b.cols - 1) * g) / b.cols);
  const tileW = Math.max(b.minTileW, Math.min(b.tileMaxW, fitW));
  const fitH = Math.floor((h - gridY - b.pad - (b.rows - 1) * g) / b.rows);
  // Two rows must end above a bottom sheet (rows 2 and 3 are then covered by it, and the picked tile is above it).
  const sheetFit = Math.floor((h - GEAR_BOARD.sheetH - gridY - g) / 2);
  const tileH = Math.max(b.minTileH, Math.min(b.tileMaxH, fitH, Math.max(sheetFit, Math.min(fitH, 61))));
  const gridW = b.cols * tileW + (b.cols - 1) * g;
  const gridX = Math.floor((w - gridW) / 2);
  const filterW = 3 * MIN_TAP + 2 * S1;
  const pagerW = 2 * MIN_TAP + 72;
  const pagerX = w - b.pad - pagerW;
  const filterX = pagerX - g - filterW;
  const titleX = b.pad + b.backW + g;
  return { cols: b.cols, rows: b.rows, perPage: b.perPage, tileW, tileH, gridX, gridY, gridW, headY: b.pad, backX: b.pad, titleX, filterX, pagerX, pagerW };
}

/**
 * Whether the item sheet sits at the top (true) or the bottom of [top, bottom]. Default: the bottom, unless the picked tile
 * (ending at pickedBottom) reaches into it. MENU-BAG-01 B1b: when the tile (tileH tall) is under the sheet either way
 * (667x320), take the end that hides less of it, so part of the tile stays out and tapping it again closes the sheet.
 */
export function sheetAtTop(top: number, bottom: number, lift: number, pickedBottom: number, tileH = 0): boolean {
  const sh = GEAR_BOARD.sheetH;
  if (pickedBottom <= bottom - sh) return false;
  if (tileH <= 0) return true;
  const t0 = pickedBottom - tileH;
  const hidden = (a: number, b: number) => Math.max(0, Math.min(pickedBottom, b) - Math.max(t0, a));
  return hidden(bottom - sh, bottom) > hidden(top - lift, top - lift + sh);
}

/** MENU-BAG-01 B1: how many pages a bag of this many items has (at least 1). */
export function bagPageCount(count: number): number {
  return Math.max(1, Math.ceil(count / BAG_SCREEN.perPage));
}

/** MENU-BAG-01 B1: the Bag's page after ◀ (-1) or ▶ (+1), kept inside 0..pages-1. The Bag keeps this itself; the Gear tab behind it has its own page. */
export function turnBagPage(page: number, by: number, count: number): number {
  return Math.max(0, Math.min(bagPageCount(count) - 1, page + by));
}

/** A tile's top-left on the Bag screen (absolute). */
export function bagTileBox(L: BagScreenLayout, i: number): { x: number; y: number; w: number; h: number } {
  return { x: L.gridX + (i % L.cols) * (L.tileW + BAG_SCREEN.gap), y: L.gridY + Math.floor(i / L.cols) * (L.tileH + BAG_SCREEN.gap), w: L.tileW, h: L.tileH };
}
