// FX-GREAT: the pop-up rating words (GREAT!, a Virtue or Insight name). No Phaser import, so Vitest can check them.

/** The "!" wind-up cue colours: gold in the Counter window, red while filling, and the red "!" float. */
export const CUE_COLORS = ['#ffd166', '#ff5a4f', '#ff3b30'] as const;

/** Rating words are sky blue, never the cue's gold or red, and see-through so the arena shows behind them. */
export const RATING = { color: '#7fd4ff', bright: '#e6f7ff', alpha: 0.75, stroke: 5, great: 34, name: 30 } as const;

type Box = { x0: number; x1: number; y0: number; y1: number };

/**
 * The word's top edge: as near `prefTop` as possible, with the word (plus `drift` px above it, for the
 * fade-up) clear of every box and inside [minTop, maxBottom]. `tiers` go from must-avoid ("!" cues) to
 * nice-to-avoid; when no spot clears them all, the last tier is let go first. Falls back to `prefTop`.
 */
export function ratingWordTop(prefTop: number, w: { x0: number; x1: number; h: number }, drift: number, tiers: Box[][], minTop: number, maxBottom: number): number {
  for (let n = tiers.length; n > 0; n--) {
    const boxes = tiers.slice(0, n).flat();
    const clear = (top: number) => top - drift >= minTop && top + w.h <= maxBottom && !boxes.some((b) => overlaps(b, { x0: w.x0, x1: w.x1, y0: top - drift, y1: top + w.h }));
    const tops = [prefTop, ...boxes.flatMap((b) => [b.y1 + 6 + drift, b.y0 - 6 - w.h])].sort((a, b) => Math.abs(a - prefTop) - Math.abs(b - prefTop));
    const top = tops.find(clear);
    if (top !== undefined) return top;
  }
  return prefTop;
}

export function overlaps(a: Box, b: Box): boolean {
  return !(a.x1 < b.x0 || a.x0 > b.x1 || a.y1 < b.y0 || a.y0 > b.y1);
}
