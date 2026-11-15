// LP-B1 (L1): the one Path screen's layout and words. Pure, so tests can check it fits a phone.
import PATH from '../../../../content/settings/path.json';
import { MIN_TAP, S2 } from './tokens';

export const PATH_WORDS = PATH;

/** Fills {n}-style slots in a Path line. */
export function fill(line: string, slots: Record<string, string | number>): string {
  return line.replace(/\{(\w+)\}/g, (_, k: string) => `${slots[k] ?? ''}`);
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PathLayout {
  pad: number;
  bar: Box;
  tower: Box;
  gate: Box;
  classCard: Box;
  gameCard: Box;
  /** One Tower tier's height. */
  tierH: number;
}

/** Gate lock labels: 12 pt, at most 3 lines ("David and Goliath"), as on the old Gate tab. */
export const PATH_LABEL = { size: 12, lineH: 15, lines: 3 } as const;
export const PATH_LOCK_R = 18;
/** The Gate box: 10 pad, the 20 pt heading row, the locks, their labels (or numbers and the Defense bracket), 8 pad. */
export const PATH_GATE_H = 10 + 20 + 6 + 2 * PATH_LOCK_R + 4 + PATH_LABEL.lines * PATH_LABEL.lineH + 8;
export const PATH_TIER_H = 52;

export function pathLayout(width: number, height: number): PathLayout {
  const pad = height < 400 ? S2 : 12;
  const bar = { x: pad, y: pad, w: width - 2 * pad, h: MIN_TAP };
  const top = bar.y + bar.h + S2;
  const bodyH = height - pad - top;
  const towerW = Math.round(Math.min(170, Math.max(110, width * 0.17)));
  const tower = { x: pad, y: top, w: towerW, h: bodyH };
  const rx = pad + towerW + 12;
  const rw = width - pad - rx;
  const gate = { x: rx, y: top, w: rw, h: PATH_GATE_H };
  const cardsY = top + PATH_GATE_H + S2;
  const cardsH = height - pad - cardsY;
  // The next real step is the biggest thing on the screen (LP-L1).
  const classW = Math.round((rw - 12) * 0.58);
  return {
    pad,
    bar,
    tower,
    gate,
    classCard: { x: rx, y: cardsY, w: classW, h: cardsH },
    gameCard: { x: rx + classW + 12, y: cardsY, w: rw - classW - 12, h: cardsH },
    tierH: PATH_TIER_H,
  };
}

/**
 * The lowest Tower tier shown (0 = the first belt) for `visible` rows: by default the current tier
 * sits second from the top so the next tier (in mist) shows above it.
 */
export function towerStart(tiers: number, current: number, visible: number): number {
  return clampStart(current - (visible - 2), tiers, visible);
}

export function clampStart(start: number, tiers: number, visible: number): number {
  return Math.max(0, Math.min(start, tiers - visible));
}
