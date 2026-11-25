// The Masked Shade (Story Chapters, Nov 24): a CODE STAND-IN until the Blender model is made and Jay OKs it.
// Small, cloaked, a cracked white mask; sneaky, never scary. `belt` shows the faded white belt end (the long
// mystery: he was a student who quit), used only where the story hints at it.
import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';

/** Draws the Masked Shade at (0, 0) = his feet; `T` is the tile size in pixels. */
export function addMaskedShade(s: Phaser.Scene, T: number, opts: { belt?: boolean } = {}): Phaser.GameObjects.Container {
  const c = s.add.container(0, 0);
  const g = s.add.graphics();
  const w = T * 0.55;
  const h = T * 1.25;
  // soft shadow
  g.fillStyle(0x000000, 0.3).fillEllipse(0, 0, w * 1.6, T * 0.25);
  // cloak: a rounded hood over a wide hem, deep purple with a lighter edge
  g.fillStyle(0x2a1f3d, 1);
  g.fillTriangle(-w, -T * 0.05, w, -T * 0.05, 0, -h);
  g.fillCircle(0, -h * 0.72, w * 0.62);
  g.fillStyle(0x3b2d57, 1).fillTriangle(-w * 0.55, -T * 0.08, -w * 0.1, -T * 0.08, -w * 0.3, -h * 0.55);
  // hem tatters
  for (let i = -2; i <= 2; i++) g.fillStyle(0x2a1f3d, 1).fillTriangle(i * w * 0.4 - w * 0.2, -T * 0.06, i * w * 0.4 + w * 0.2, -T * 0.06, i * w * 0.4, T * 0.06);
  if (opts.belt) {
    g.fillStyle(0xd8d2c4, 1).fillRect(-w * 0.55, -h * 0.4, w * 1.1, T * 0.08);
    g.fillRect(w * 0.15, -h * 0.4, T * 0.07, T * 0.3);
  }
  // mask: a white oval with a crack and two slanted eye slits that glow faintly
  const my = -h * 0.72;
  g.fillStyle(0xf2efe6, 1).fillEllipse(0, my, w * 0.86, w * 1.0);
  g.lineStyle(2, 0x6b6478, 1).beginPath().moveTo(w * 0.05, my - w * 0.5).lineTo(-w * 0.06, my - w * 0.15).lineTo(w * 0.08, my + w * 0.1).strokePath();
  g.fillStyle(0x9b7cff, 1);
  g.fillTriangle(-w * 0.3, my - w * 0.08, -w * 0.08, my - w * 0.02, -w * 0.26, my + w * 0.06);
  g.fillTriangle(w * 0.3, my - w * 0.08, w * 0.08, my - w * 0.02, w * 0.26, my + w * 0.06);
  c.add(g);
  if (!reducedMotion()) s.tweens.add({ targets: g, y: -3, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  return c;
}

/** A puff of purple smoke at (x, y) in `parent`'s space. */
export function smokePuff(s: Phaser.Scene, parent: Phaser.GameObjects.Container | null, x: number, y: number, T: number, add: (o: Phaser.GameObjects.GameObject) => void): void {
  const n = reducedMotion() ? 4 : 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p = s.add.circle(x, y - T * 0.5, T * Phaser.Math.FloatBetween(0.15, 0.3), i % 2 ? 0x4a3a6b : 0x6d5a91, 0.85).setDepth(1e6);
    if (parent) parent.add(p);
    add(p);
    s.tweens.add({ targets: p, x: x + Math.cos(a) * T * 0.9, y: y - T * 0.5 + Math.sin(a) * T * 0.6, alpha: 0, scale: 1.8, duration: 700, ease: 'Cubic.Out', onComplete: () => p.destroy() });
  }
}

/** A little Shade (code drawing, for cut scenes outside the Tower): a dark round blob with two purple eyes. */
export function addLittleShade(s: Phaser.Scene, T: number): Phaser.GameObjects.Container {
  const c = s.add.container(0, 0);
  const g = s.add.graphics();
  const r = T * 0.28;
  g.fillStyle(0x000000, 0.25).fillEllipse(0, 0, r * 2.2, r * 0.6);
  g.fillStyle(0x2f2645, 1).fillCircle(0, -r * 1.1, r);
  g.fillTriangle(-r, -r * 1.1, r, -r * 1.1, 0, -r * 0.05);
  g.fillStyle(0xc9b6ff, 1).fillCircle(-r * 0.35, -r * 1.2, r * 0.17).fillCircle(r * 0.35, -r * 1.2, r * 0.17);
  c.add(g);
  return c;
}
