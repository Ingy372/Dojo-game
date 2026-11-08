/**
 * R-CHALLENGE P3: the game camera's view math, with no Phaser import, so the sim tests can check
 * that SIM_VIEW (packages/sim/src/config.ts) matches it. GameScene.layout uses these.
 */

/** Rows of tiles the screen shows top to bottom, at every screen size. */
export const VISIBLE_ROWS = 6.75;
/** Tiles of floor-free strip the camera may show above the top wall (keeps doors clear of the HUD). */
export const TOP_STRIP_TILES = 1.1;

/** Screen sizes (CSS points, landscape) the game supports. */
export const SUPPORTED_SIZES: readonly (readonly [number, number])[] = [
  [667, 375],
  [667, 320],
  [844, 390],
  [932, 430],
  [1024, 768],
  [800, 290],
];

/** The view, in tiles, at a screen size. */
export function viewTiles(width: number, height: number): { width: number; height: number } {
  return { width: (VISIBLE_ROWS * width) / height, height: VISIBLE_ROWS };
}

/** Camera limits for a room (all in the same unit as `viewW`/`viewH`; `tile` is one tile in it). */
export function cameraBounds(roomWidthTiles: number, roomHeightTiles: number, viewW: number, viewH: number, tile: number, topStrip = tile * TOP_STRIP_TILES): { x: number; y: number; width: number; height: number } {
  const roomW = roomWidthTiles * tile;
  const top = -Math.max(tile * TOP_STRIP_TILES, topStrip);
  const roomH = roomHeightTiles * tile - top;
  const bw = Math.max(roomW, viewW);
  const bh = Math.max(roomH, viewH);
  return { x: (roomW - bw) / 2, y: top - (bh - roomH) / 2, width: bw, height: bh };
}

/** GUARD-SCALE-01: the short camera pull-back when a boss appears (numbers from content/settings/guardian-scale.json). */
export interface BossZoomPlan {
  /** Share of the normal zoom the camera pulls back to. */
  zoomTo: number;
  outMs: number;
  holdMs: number;
  backMs: number;
}

/**
 * The pull-back to play, or null for none. `zoomTo` in the data is the TOTAL dip (0.8 of the normal zoom); it does not
 * stack on the held room zoom, so the returned `zoomTo` is the share of the held zoom that reaches it (0.8 / 0.9).
 * Reduced motion on: no dip at all, the camera sits at the held zoom. Rooms without a boss have none, and a dip that
 * would not go below the held zoom is skipped.
 */
export function bossZoomPlan(reducedMotion: boolean, roomHasBoss: boolean, zoom: BossZoomPlan, heldZoom = 1): BossZoomPlan | null {
  if (reducedMotion || !roomHasBoss || zoom.zoomTo >= heldZoom) return null;
  return { ...zoom, zoomTo: zoom.zoomTo / heldZoom };
}

/**
 * GUARD-SCALE-01 (c, d): the strip (world px) the camera may show above the north wall in a Guardian room, so a Guardian
 * pinned against that wall is drawn whole below the HUD bars. `minCenterY` is the highest the Guardian's centre can be
 * (world px), `headPx` how far its art and health bar reach above its centre (world px), `hudBottom` the HUD bars' bottom
 * (screen points) and `zoom` the camera zoom in screen points per world px (the current one, so the dip is covered too).
 */
export function bossHeadroom(minCenterY: number, headPx: number, hudBottom: number, zoom: number, marginPts = 4): number {
  return Math.max(0, headPx - minCenterY + (hudBottom + marginPts) / zoom);
}

/** GUARD-SCALE-01: the zoom held for the whole Guardian room (1 for rooms without a boss). A placeholder number in the data file until Jay picks it. */
export function bossRoomZoom(roomHasBoss: boolean, def: { zoom: number }): number {
  return roomHasBoss ? def.zoom : 1;
}
