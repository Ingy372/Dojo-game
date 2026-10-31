// R-CHALLENGE P4: the tell shapes for Challenge pattern attacks, drawn at the start of the wind-up
// on the danger layer (code-drawn, no new art). Lane: a striped strip from the enemy to where it
// lands. Landing spot: a dashed hop line to the circle. Circle: the normal circle (drawn by the
// caller). Reduced motion keeps every shape; only the stripes stop sliding.
import type Phaser from 'phaser';
import type { PatternShape } from '@dojo/sim';

type Pt = { x: number; y: number };

/** Draws the extra part of the tell in pixels. `t` is the wind-up so far (0 to 1); `moving` slides the stripes. */
export function drawPatternTell(g: Phaser.GameObjects.Graphics, shape: PatternShape, from: Pt, to: Pt, radius: number, color: number, t: number, moving: boolean): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1 || shape === 'circle') return;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy * radius;
  const ny = ux * radius;
  if (shape === 'lane') {
    // The strip, edged on both sides, with diagonal stripes.
    g.fillStyle(color, 0.14).fillPoints([{ x: from.x + nx, y: from.y + ny }, { x: to.x + nx, y: to.y + ny }, { x: to.x - nx, y: to.y - ny }, { x: from.x - nx, y: from.y - ny }], true);
    g.lineStyle(3, color, 0.9).lineBetween(from.x + nx, from.y + ny, to.x + nx, to.y + ny).lineBetween(from.x - nx, from.y - ny, to.x - nx, to.y - ny);
    const step = radius;
    const offset = moving ? (t * step * 4) % step : 0;
    g.lineStyle(4, color, 0.25 + 0.45 * t);
    for (let d = offset; d + radius <= len + radius; d += step) {
      const a = Math.min(d, len);
      const b = Math.min(d + radius * 0.8, len);
      g.lineBetween(from.x + ux * a + nx, from.y + uy * a + ny, from.x + ux * b - nx, from.y + uy * b - ny);
    }
    return;
  }
  // Landing spot: dashes from the enemy to the circle's edge.
  const end = Math.max(0, len - radius);
  g.lineStyle(3, color, 0.9);
  for (let d = 0; d < end; d += 16) g.lineBetween(from.x + ux * d, from.y + uy * d, from.x + ux * Math.min(d + 9, end), from.y + uy * Math.min(d + 9, end));
  g.lineStyle(2, color, 0.9).strokeCircle(to.x, to.y, radius * 0.35); // the spot it lands on
}
