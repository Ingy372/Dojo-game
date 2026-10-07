// The character's belt, in the real belt's color with its stripes. Colors come from the
// school's belt list (no school is hardcoded). Placeholder shapes until the art pack;
// then it becomes a palette swap of one sprite.

import Phaser from 'phaser';
import type { BeltInfo } from '@dojo/sim';

const OUTLINE = 0x14121c;

export function hex(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}

/** Stripe tape color: white on dark belts, black on light ones. */
function tapeColor(belt: BeltInfo): number {
  const c = Phaser.Display.Color.HexStringToColor(belt.color);
  return c.red * 0.3 + c.green * 0.59 + c.blue * 0.11 < 90 ? 0xf4f1ea : 0x1a1a1a;
}

/** Draws a belt centered on (x, y) into `g` (cleared first). */
export function drawBelt(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, belt: BeltInfo, stripes: number): void {
  g.clear();
  g.fillStyle(hex(belt.color)).fillRect(x - w / 2, y - h / 2, w, h);
  // Two-color belts (like red/black) get a center line.
  if (belt.color2) g.fillStyle(hex(belt.color2)).fillRect(x - w / 2, y - h * 0.17, w, h * 0.34);
  // Stripes sit near one end, like the real belt.
  const tape = tapeColor(belt);
  for (let i = 0; i < stripes; i++) {
    const sx = x + w / 2 - w * 0.12 - i * w * 0.09;
    g.fillStyle(tape).fillRect(sx, y - h / 2, Math.max(2, w * 0.05), h);
  }
  g.lineStyle(2, OUTLINE).strokeRect(x - w / 2, y - h / 2, w, h);
}

/** A simple standing character (gi circle + belt), for the Home Dojo and the ceremony. */
export function makeCharacter(scene: Phaser.Scene, x: number, y: number, r: number, belt: BeltInfo, stripes: number): { container: Phaser.GameObjects.Container; belt: Phaser.GameObjects.Graphics } {
  const body = scene.add.circle(0, 0, r, 0xf2e9d8).setStrokeStyle(3, OUTLINE);
  const g = scene.add.graphics();
  drawBelt(g, 0, r * 0.15, r * 1.9, r * 0.3, belt, stripes);
  const container = scene.add.container(x, y, [body, g]);
  return { container, belt: g };
}
