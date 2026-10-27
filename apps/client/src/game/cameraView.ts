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
export function cameraBounds(roomWidthTiles: number, roomHeightTiles: number, viewW: number, viewH: number, tile: number): { x: number; y: number; width: number; height: number } {
  const roomW = roomWidthTiles * tile;
  const top = -tile * TOP_STRIP_TILES;
  const roomH = roomHeightTiles * tile - top;
  const bw = Math.max(roomW, viewW);
  const bh = Math.max(roomH, viewH);
  return { x: (roomW - bw) / 2, y: top - (bh - roomH) / 2, width: bw, height: bh };
}
