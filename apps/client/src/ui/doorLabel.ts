// Q-DOOR-LABELS: door labels (TREASURE, CHALLENGE, ...) stay fully on screen.

/** Gap, in screen pixels, between a door label and the screen's left or right edge. */
export const DOOR_LABEL_SIDE_PX = 8;

/**
 * The centre x for a label of `width` (world units) so it sits inside the view from `viewLeft`
 * to `viewRight`, at least `margin` from each edge. A label that already fits keeps its x.
 */
export function clampLabelX(x: number, width: number, viewLeft: number, viewRight: number, margin: number): number {
  const lo = viewLeft + margin + width / 2;
  const hi = viewRight - margin - width / 2;
  if (lo > hi) return (viewLeft + viewRight) / 2;
  return Math.min(hi, Math.max(lo, x));
}
