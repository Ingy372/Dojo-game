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

/** What the side clamp needs from a label and from the camera (Phaser's Text and Camera fit). */
export interface ClampLabel { x: number; displayWidth: number; setX(x: number): unknown }
export interface ClampCamera { zoom: number; worldView: { x: number; right: number } }

/**
 * Q-DOOR-LABELS-2: clamps every label to the camera's view as it is now. GameScene calls this on
 * the camera's FOLLOW_UPDATE, after the camera has moved this frame, so the first frames of a
 * scroll don't use last frame's view. `dpr` is the scene's device pixel ratio.
 */
export function clampDoorLabels(labels: Iterable<ClampLabel>, cam: ClampCamera, dpr: number): void {
  const margin = DOOR_LABEL_SIDE_PX / (cam.zoom / dpr);
  for (const l of labels) l.setX(clampLabelX(l.x, l.displayWidth, cam.worldView.x, cam.worldView.right, margin));
}
