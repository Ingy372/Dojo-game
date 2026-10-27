// Q-P4 QA: one rule for where any Sensei banner may sit. Pure (no Phaser) so it can be unit-tested.

/** The highest y a Sensei banner may use: 6 px under the top bar's lowest edge. */
export function senseiFloorY(topBarBottom: number): number {
  return topBarBottom + 6;
}

/** Sensei's usual spot: its layout top, but never above the floor. */
export function senseiHomeY(senseiTop: number, topBarBottom: number): number {
  return Math.max(senseiTop, senseiFloorY(topBarBottom));
}

/** A screen box (view pixels). */
export interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface BannerAsk {
  /** The view (screen) size. */
  viewW: number;
  viewH: number;
  /** senseiFloorY(topBarBottom): nothing above this. */
  floor: number;
  /** Sensei's usual spot (senseiHomeY). */
  home: number;
  /** The banner's size and current centre x / top y. */
  w: number;
  h: number;
  x: number;
  y: number;
  /** The heroes: kept clear whenever there is any room. */
  players: Box[];
  /** Q-STANCE-BANNER: the action buttons (Stance included), a keep-out zone the banner never covers. */
  buttons: Box[];
  /** Other things best left uncovered (warning circles, pickups). */
  others: Box[];
}

/** Where to put the banner: centre x and top y. */
export interface BannerSpot {
  x: number;
  y: number;
}

const overlaps = (a: Box, b: Box) => a.x1 > b.x0 && a.x0 < b.x1 && a.y1 > b.y0 && a.y0 < b.y1;

/**
 * Q-STANCE-BANNER: the one search for a Sensei banner's spot. Never above the floor, never over a button.
 * Tries, in order: clear of everything; clear of the heroes and buttons (e.g. the free space above the
 * bottom button row). Returns null when neither fits, so the caller can shrink the text and ask again,
 * then fall back to `overArena` (clear of the buttons only).
 */
export function pickBannerSpot(a: BannerAsk): BannerSpot | null {
  const cands = candidates(a);
  const clear = (keep: Box[]) => cands.find((s) => !keep.some((b) => overlaps(boxAt(a, s), b)));
  return clear([...a.players, ...a.buttons, ...a.others]) ?? clear([...a.players, ...a.buttons]) ?? null;
}

/** Last resort: over the arena (it may cover a hero) rather than over the buttons. */
export function overArena(a: BannerAsk): BannerSpot {
  const cands = candidates(a);
  return cands.find((s) => !a.buttons.some((b) => overlaps(boxAt(a, s), b))) ?? { x: a.viewW / 2, y: a.floor };
}

/** Q-VIRTUE-BANNER: the width of the free strip left of the leftmost button (a tall banner fits there when nothing else does). */
export function leftStripWidth(a: Pick<BannerAsk, 'viewW' | 'buttons'>): number {
  return Math.min(a.viewW, ...a.buttons.map((b) => b.x0)) - 16;
}

function boxAt(a: BannerAsk, s: BannerSpot): Box {
  return { x0: s.x - a.w / 2, x1: s.x + a.w / 2, y0: s.y, y1: s.y + a.h };
}

function candidates(a: BannerAsk): BannerSpot[] {
  const all = [...a.players, ...a.buttons, ...a.others];
  const ys = [a.y, a.home, a.floor, a.viewH - a.h - 8, ...all.flatMap((b) => [b.y0 - 6 - a.h, b.y1 + 6])];
  // Centre x: where it is, the middle, and the free strip left of the leftmost button (above or beside the row).
  const left = Math.min(a.viewW, ...a.buttons.map((b) => b.x0));
  const xs = [a.x, a.viewW / 2, 8 + a.w / 2, (8 + left) / 2];
  const out: BannerSpot[] = [];
  for (const y of ys) for (const x of xs) {
    if (y < a.floor || y + a.h > a.viewH - 8 || x - a.w / 2 < 8 || x + a.w / 2 > a.viewW - 8) continue;
    out.push({ x, y });
  }
  return out;
}
