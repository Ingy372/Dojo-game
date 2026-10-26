// P-MENU2-g: the Last run "Scroll of the Climb" model and layout (no Phaser, so Vitest can check
// it). A banner in kind words, room chips, 4 to 5 stat tiles that count up once per run, an XP
// fill, the found strip, "New for you", "Always with you", Bests and a big Again! button.
// Wording comes from content/settings/last-run.json. Placeholder art is drawn in code.

import { realClock, ticksToRealMs, type BestKey, type GearItem, type Profile, type RoomResult } from '@dojo/sim';
import words from '../../../../content/settings/last-run.json';
import { MIN_TAP, S1, S2, S3, TYPE } from './tokens';

export const LASTRUN_WORDS = words;

export interface StatTile {
  key: 'rooms' | 'perfects' | 'combo' | 'time' | 'xp';
  label: string;
  /** The number the tile counts up to. */
  value: number;
  /** How the number is shown (time as m:ss, XP as +n). */
  format: (v: number) => string;
}

/** One tile in the found strip: a gear item, or a dojo decoration (house badge). */
export type FoundTile = { kind: 'item'; item: GearItem } | { kind: 'deco'; id: string };

export interface LastRunModel {
  headline: string;
  cleared: boolean;
  chips: RoomResult[];
  stats: StatTile[];
  found: FoundTile[];
  levelsGained: number;
}

/** Real seconds as m:ss. */
export const clock = (sec: number): string => {
  const t = Math.round(sec);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

const RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/** The run's headline in kind words: "Floor cleared!" or "You reached room 4 of 6!" (never "failed"). */
export function headline(s: { result: string; roomsCleared: number; totalRooms: number }, restedWords: string): string {
  if (s.result === 'cleared') return words.cleared;
  if (s.result === 'rested') return restedWords;
  return words.reached.replace('{room}', String(Math.min(s.totalRooms, s.roomsCleared + 1))).replace('{total}', String(s.totalRooms));
}

export function buildLastRun(last: NonNullable<Profile['lastRun']>, restedWords: string): LastRunModel {
  const s = last.summary;
  const stats: StatTile[] = [
    { key: 'rooms', label: words.stats.rooms, value: s.roomsCleared, format: (v) => String(Math.round(v)) },
    { key: 'perfects', label: words.stats.perfects, value: s.perfects, format: (v) => String(Math.round(v)) },
    { key: 'combo', label: words.stats.combo, value: s.bestCombo, format: (v) => String(Math.round(v)) },
    { key: 'time', label: words.stats.time, value: Math.floor(ticksToRealMs(s.ticks) / 1000 + 1e-9), format: clock },
  ];
  if (last.xp) stats.push({ key: 'xp', label: words.stats.xp, value: last.xp.gained, format: (v) => `+${Math.round(v)}` });
  const items = s.items.slice().sort((a, b) => RARITY.indexOf(b.rarity) - RARITY.indexOf(a.rarity));
  const decos = [...(s.decorations ?? []), ...(last.earned ?? [])];
  return {
    headline: headline(s, restedWords),
    cleared: s.result === 'cleared',
    chips: s.results,
    stats,
    found: [...items.map((item): FoundTile => ({ kind: 'item', item })), ...decos.map((id): FoundTile => ({ kind: 'deco', id }))],
    levelsGained: last.xp?.levelsGained ?? 0,
  };
}

/** A run's id, so the count-up plays once per run (not on reopen). */
export function runId(p: Pick<Profile, 'runsPlayed' | 'lastRun'>): string {
  const s = p.lastRun?.summary;
  return s ? `${p.runsPlayed}:${s.ticks}:${s.perfects}:${s.items.length}` : '';
}

export interface KeyStore {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}
export const COUNT_KEY = 'dojo.lastRunCounted';

/**
 * True only the first time this run's tiles are shown; remembers it at once, so a reopen (or a
 * tab switch back) shows the final numbers. Reduced motion never counts but still remembers.
 */
export function takeCountUp(store: KeyStore | null, id: string, reduced: boolean): boolean {
  if (!id || !store) return false;
  let seen: string | null = null;
  try {
    seen = store.getItem(COUNT_KEY);
  } catch {
    return false;
  }
  if (seen === id) return false;
  try {
    store.setItem(COUNT_KEY, id);
  } catch {
    return false;
  }
  return !reduced;
}

/** The count-up value at progress t (0..1), Cubic.Out, landing exactly on the target. */
export function countAt(target: number, t: number): number {
  const k = Math.max(0, Math.min(1, t));
  return k >= 1 ? target : target * (1 - Math.pow(1 - k, 3));
}

/** P-MENU2-g motion: chips 60 ms apart, then tiles count over 400 ms, then the XP bar fills. */
export const LASTRUN_MOTION = { chipStepMs: 60, countMs: 400, fillMs: 600 } as const;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LastRunLayout {
  banner: Box;
  bests: Box;
  chipsY: number;
  chip: number;
  chipStep: number;
  tiles: Box[];
  bar: Box;
  foundLabelY: number;
  found: Box;
  foundTile: number;
  foundPerPage: number;
  arrows: boolean;
  alwaysLabelY: number;
  alwaysIcon: number;
  alwaysY: number;
  perAlways: number;
  newLabelY: number;
  newCard: Box;
  again: Box;
}

/**
 * Panel coordinates (0,0 = the panel's top-left inside its padding). Everything sits inside w×h
 * at 667×375, 844×390 and 932×430; every tap is at least 44 on each side.
 */
export function lastRunLayout(w: number, h: number, chipCount: number, statCount: number, foundCount: number): LastRunLayout {
  const bestsW = 96;
  const banner = { x: 0, y: 0, w: w - bestsW - S2, h: MIN_TAP };
  const bests = { x: w - bestsW, y: 0, w: bestsW, h: MIN_TAP };
  const chipsY = MIN_TAP + S1;
  const chipStep = Math.min(MIN_TAP, Math.floor(w / Math.max(1, chipCount)));
  // Short phones (under 300 tall inside the scroll) get 24 pt chips, 52 pt tiles and 4 pt gaps.
  const compact = h < 300;
  const gap = compact ? S1 : S2;
  const chipH = compact ? 24 : 32;
  const chip = Math.min(chipH, chipStep - S2);
  const tilesY = chipsY + chipH + gap;
  // 4 tiles under ~420 wide (the XP gain is the fill bar), 5 above.
  const nTiles = Math.min(statCount, w < 420 ? 4 : 5);
  // P-MENU2-SPACE: 52/64 (was 44/56) so the number and its label sit more than 8 pt apart.
  const tileH = compact ? 52 : 64;
  const tileW = (w - (nTiles - 1) * S2) / nTiles;
  const tiles = Array.from({ length: nTiles }, (_, i) => ({ x: i * (tileW + S2), y: tilesY, w: tileW, h: tileH }));
  const bar = { x: 0, y: tilesY + tileH + gap, w, h: compact ? 10 : 12 };
  const lowerY = bar.y + bar.h + gap;

  const rightW = Math.max(112, Math.min(200, Math.round(w * 0.34)));
  const leftW = w - rightW - S3;
  const again = { x: w - rightW, y: h - MIN_TAP, w: rightW, h: MIN_TAP };
  const newLabelY = lowerY;
  const newTop = lowerY + TYPE.label + S1;
  const newH = Math.max(MIN_TAP, Math.min(96, again.y - S1 - newTop));
  const newCard = { x: w - rightW, y: newTop, w: Math.min(rightW, Math.max(newH, 96)), h: newH };

  const foundTile = MIN_TAP;
  const foundLabelY = lowerY;
  const foundY = lowerY + TYPE.label + S1;
  const fits = (room: number) => Math.max(1, Math.floor((room + S1) / (foundTile + S1)));
  const all = fits(leftW);
  const arrows = foundCount > all;
  // More than fit: one ▶ at the end turns the page (and wraps back to the first).
  const perPage = arrows ? fits(leftW - (MIN_TAP + S1)) : all;
  const found = { x: 0, y: foundY, w: arrows ? leftW - (MIN_TAP + S1) : leftW, h: foundTile };
  const alwaysLabelY = foundY + foundTile + S1;
  const alwaysY = alwaysLabelY + TYPE.label + S1;
  const alwaysIcon = Math.max(0, Math.min(32, h - alwaysY));
  const perAlways = alwaysIcon >= 24 ? Math.floor((leftW + S1) / (alwaysIcon + S1)) : 0;
  return { banner, bests, chipsY, chip, chipStep, tiles, bar, foundLabelY, found, foundTile, foundPerPage: perPage, arrows, alwaysLabelY, alwaysIcon, alwaysY, perAlways, newLabelY, newCard, again };
}

/** The found tiles on page `page` (wraps around, so the one ▶ cycles every page). */
export function foundPage<T>(found: T[], perPage: number, page: number): { tiles: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(found.length / Math.max(1, perPage)));
  const p = ((page % pages) + pages) % pages;
  return { tiles: found.slice(p * perPage, (p + 1) * perPage), page: p, pages };
}

/** The Bests sheet rows: the student's own bests only (no ranks, no others, no streaks). */
export function bestsRows(bests: Profile['bests'], newBests: readonly BestKey[]): Array<{ key: BestKey; name: string; value: string; isNew: boolean }> {
  const keys: BestKey[] = ['fastestClearTicks', 'mostPerfects', 'longestCombo', 'mostSGrades'];
  return keys.map((key) => {
    const v = bests[key];
    const value = key === 'fastestClearTicks' ? (v === null ? '—' : realClock(v as number)) : String(v);
    return { key, name: (words.bestNames as Record<BestKey, string>)[key], value, isNew: newBests.includes(key) };
  });
}

/**
 * "New for you": the first earned trophy the student hasn't looked at yet (it waits in the
 * Trophy Case). None on an old save that never tracked what was seen, so nothing shows by mistake.
 */
export function newForYou<C extends { id: string; earned: boolean }>(cubbies: readonly C[], seen: readonly string[] | null): C | null {
  if (!seen) return null;
  return cubbies.find((c) => c.earned && !seen.includes(c.id)) ?? null;
}

/** Q-PREM-F6: where Again! goes, and how the Last run contents scroll above it. */
export interface PinnedAgain {
  /** Again! in content coordinates; it is drawn on the panel, not the scrolling contents. */
  again: Box;
  /** Height kept clear at the bottom of the scroll window (0 when nothing scrolls). */
  footer: number;
  /** How far the contents scroll (0 when they fit). */
  scrollMax: number;
}

/**
 * Q-PREM-F6: Again! sits at the bottom of the visible panel and never scrolls away. When the
 * contents (contentH) are taller than what shows (visibleH), the scroll window ends S1 above Again!
 * and the contents can scroll far enough to show their last row in that window.
 */
export function pinnedAgain(again: Box, contentH: number, visibleH: number): PinnedAgain {
  const scrolls = contentH > visibleH;
  const y = Math.min(contentH, visibleH) - again.h;
  const footer = scrolls ? again.h + S1 : 0;
  return { again: { ...again, y }, footer, scrollMax: scrolls ? contentH - visibleH + footer : 0 };
}
