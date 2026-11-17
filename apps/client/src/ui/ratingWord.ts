// FX-GREAT: the pop-up rating words (GREAT!, a Virtue or Insight name). No Phaser import, so Vitest can check them.

/** The "!" wind-up cue colours: gold in the Counter window, red while filling, and the red "!" float. */
export const CUE_COLORS = ['#ffd166', '#ff5a4f', '#ff3b30'] as const;

/** Rating words are sky blue, never the cue's gold or red, and see-through so the arena shows behind them. */
export const RATING = { color: '#7fd4ff', bright: '#e6f7ff', alpha: 0.75, stroke: 5, great: 34, name: 30 } as const;

type Box = { x0: number; x1: number; y0: number; y1: number };

/**
 * The word's top edge: as near `prefTop` as possible, with the word (plus `drift` px above it, for the
 * fade-up) clear of every box and inside [minTop, maxBottom]. Falls back to `prefTop` when nothing fits.
 */
export function ratingWordTop(prefTop: number, w: { x0: number; x1: number; h: number }, drift: number, boxes: Box[], minTop: number, maxBottom: number): number {
  const clear = (top: number) =>
    top - drift >= minTop && top + w.h <= maxBottom && boxes.every((b) => b.x1 < w.x0 || b.x0 > w.x1 || b.y1 < top - drift || b.y0 > top + w.h);
  const tops = [prefTop, ...boxes.flatMap((b) => [b.y1 + 6 + drift, b.y0 - 6 - w.h])].sort((a, b) => Math.abs(a - prefTop) - Math.abs(b - prefTop));
  return tops.find(clear) ?? prefTop;
}
