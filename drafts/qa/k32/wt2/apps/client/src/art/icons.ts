// Batch 8 icons for Insights and Technique Seals (the "icons" pack, kept at full size). Gear uses gearIcons.ts (K32).

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

/**
 * Each Insight icon's own accent colour (K7-art2, PR #56 colour key in
 * incoming-art/icons/README.md). The Insight card's border uses it so the
 * cards are easy to tell apart. No red: red means danger.
 */
export const INSIGHT_ACCENT: Readonly<Record<string, number>> = {
  'ripple-counter': 0x4096eb,
  'iron-skin': 0x6e7c96,
  'wind-step': 0x3cc896,
  'double-strike': 0xff921e,
  'quick-hands': 0xfad628,
  'press-the-advantage': 0x9660e6,
  'shield-breaker': 0x1ebace,
  'heavy-hands': 0x965c32,
  rally: 0x82cd32,
};
