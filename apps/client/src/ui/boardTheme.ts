import Phaser from 'phaser';
import { KIT, KIT_TONE, drawPanel, kitBackdrop, kitMedal, kitPedestal } from './kit';

/**
 * U-KIT (Jay, Nov 23): the Training Board's old violet "glass" look is retired. These names stay so the
 * screens that use them keep working, but every one now draws the one kit look (kit.ts): the royal-blue
 * sky, navy panels with a dark outline, gold for what matters.
 */
export const GLASS = {
  bgTop: KIT.sky.top,
  bgBottom: KIT.sky.bottom,
  panel: KIT.panel.mid,
  panelHi: KIT.panel.top,
  edge: KIT.ink,
  edgeHi: KIT.panel.rim,
  gold: 0xffd23f,
  goldDeep: KIT_TONE.gold.lip,
  violet: KIT_TONE.blue.base,
  violetDim: KIT_TONE.dim.base,
  tile: 0x2c3f9e,
  tileDark: 0x16206b,
  tileLine: KIT.panel.rim,
  ink: '#ffffff',
  soft: KIT.soft,
} as const;

/** The board's backdrop: the kit sky. */
export function boardBackdrop(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.GameObject[] {
  return kitBackdrop(scene, width, height);
}

/** A kit panel (gold inner rim when `gold`). */
export function glassPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, opts: { gold?: boolean; radius?: number; alpha?: number } = {}): Phaser.GameObjects.Graphics {
  return drawPanel(scene.add.graphics(), x, y, w, h, { radius: opts.radius ?? 16, gold: opts.gold, alpha: opts.alpha });
}

/** The kit's green pedestal for a standing hero whose feet are at (cx, footY); `r` is the hero's size. */
export function heroPedestal(scene: Phaser.Scene, cx: number, footY: number, r: number, glowColor = 0x9ad1ff): Phaser.GameObjects.GameObject[] {
  const glow = scene.add.circle(cx, footY - r * 0.9, r * 1.35, glowColor, 0.14);
  return [glow, kitPedestal(scene, cx, footY + r * 0.05, r * 2.7)];
}

/** A gold level medal with the level number. */
export function levelBadge(scene: Phaser.Scene, cx: number, cy: number, r: number, level: number, _font?: string): Phaser.GameObjects.GameObject[] {
  return kitMedal(scene, cx, cy, r + 2, `${level}`);
}
