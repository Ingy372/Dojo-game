// Batch 8 icons for gear, Insights and Technique Seals (the "icons" pack, kept at full size).

import Phaser from 'phaser';
import { frameOf, staticArt } from './art';

/** The art pack holding every icon. Load it in the scene's preload() before drawing icons. */
export const ICON_PACK = 'icons';

/**
 * Draws the icon for a gear type, Insight or Seal id (e.g. "jade-charm"), centred on (x, y)
 * and `size` pixels wide. Returns null when that id has no icon yet, so callers keep their text-only look.
 */
export function addIcon(scene: Phaser.Scene, id: string, x: number, y: number, size: number): Phaser.GameObjects.Image | null {
  const s = staticArt(scene, ICON_PACK, `icon-${id}`);
  const ids = s && Object.values(s.layers)[0];
  const f = ids ? frameOf(scene, ICON_PACK, ids[0]) : null;
  if (!s || !f) return null;
  const img = scene.add.image(x, y, f[0], f[1]).setOrigin(s.anchor[0] / s.frameWidth, s.anchor[1] / s.frameHeight);
  // Scale the full frame (not the trimmed picture) so every icon has the same size.
  return img.setScale(size / s.frameWidth);
}
