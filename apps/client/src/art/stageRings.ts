// L8-B3 PLACEHOLDER: code-drawn Seal stage rings until Jay OKs incoming-art/lock-stages-l8.
// Stage 2 has one ring, stage 3 two, stage 4 three, each bronze on a dark outline.

import type Phaser from 'phaser';

export const STAGE_RING_PLACEHOLDER = 0xc07a2c;
const OUTLINE = 0x14121c;

/** Rings around a medallion of radius r centred on (x, y). Stage 1 or 0 draws nothing. */
export function drawStageRings(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, stage: number): void {
  const radii = Array.from({ length: Math.max(0, stage - 1) }, (_, i) => r + 4 + i * 5);
  for (const rr of radii) g.lineStyle(5, OUTLINE).strokeCircle(x, y, rr);
  for (const rr of radii) g.lineStyle(2.5, STAGE_RING_PLACEHOLDER).strokeCircle(x, y, rr);
}
