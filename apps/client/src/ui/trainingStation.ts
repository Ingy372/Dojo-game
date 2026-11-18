import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';
import { FONT, crisp } from './theme';

/**
 * The training station in the Home Dojo (Nov 17, Jay: "a station that's accessible from their personal
 * dojos"): a wooden stand with a weapon rack top and a scroll board, in front of the notice board.
 * Walking up to it opens the training board (last climb, gear, fighting style and the Tower).
 * Drawn in code until there is art for it. (cx, footY) is the middle of its base, in world pixels.
 */
export function drawTrainingStation(scene: Phaser.Scene, cx: number, footY: number, tile: number, label: string): Phaser.GameObjects.Container {
  const w = tile * 2.3;
  const h = tile * 1.75;
  const g = scene.add.graphics();
  const left = -w / 2;
  const top = -h;

  // Soft gold floor glow so it reads as "something to walk to" (never red: red means danger).
  const glow = scene.add.ellipse(0, -tile * 0.05, w * 1.25, tile * 0.75, 0xffd166, 0.22);

  // Shadow.
  g.fillStyle(0x000000, 0.22).fillEllipse(0, -tile * 0.04, w * 0.95, tile * 0.32);
  // Two posts.
  const postW = tile * 0.16;
  g.fillStyle(0x5a3a22).fillRoundedRect(left + tile * 0.12, top + tile * 0.25, postW, h - tile * 0.25, 3);
  g.fillRoundedRect(-left - tile * 0.12 - postW, top + tile * 0.25, postW, h - tile * 0.25, 3);
  // The board: dark wood frame with a warm paper face.
  const bx = left + tile * 0.05;
  const by = top + tile * 0.2;
  const bw = w - tile * 0.1;
  const bh = tile * 1.05;
  g.fillStyle(0x3b2616).fillRoundedRect(bx, by, bw, bh, 8);
  g.fillStyle(0x8a5a35).fillRoundedRect(bx + 3, by + 3, bw - 6, bh - 6, 7);
  g.fillStyle(0xf3e6c8).fillRoundedRect(bx + 8, by + 8, bw - 16, bh - 16, 5);
  // A roof beam across the top.
  g.fillStyle(0x2c1c10).fillRoundedRect(left - tile * 0.12, top + tile * 0.05, w + tile * 0.24, tile * 0.22, 5);
  g.fillStyle(0xb5462f).fillRect(left - tile * 0.12, top + tile * 0.2, w + tile * 0.24, 3);

  // On the paper: a crossed staff and hand wrap mark (training gear), drawn simply.
  const ix = 0;
  const iy = by + bh / 2;
  g.lineStyle(5, 0x6b4426, 1);
  g.lineBetween(ix - tile * 0.32, iy + tile * 0.26, ix + tile * 0.32, iy - tile * 0.26);
  g.lineBetween(ix - tile * 0.32, iy - tile * 0.26, ix + tile * 0.32, iy + tile * 0.26);
  g.fillStyle(0xd5713a).fillCircle(ix, iy, tile * 0.17);
  g.lineStyle(2, 0xfff6e0, 1).strokeCircle(ix, iy, tile * 0.17);
  // Pinned notes.
  g.fillStyle(0xfff6e0).fillRect(bx + 14, by + 14, tile * 0.32, tile * 0.24);
  g.fillStyle(0xcfe3ff).fillRect(bx + bw - 14 - tile * 0.32, by + 16, tile * 0.32, tile * 0.24);
  g.fillStyle(0xb5462f).fillCircle(bx + 14 + tile * 0.16, by + 15, 2.5).fillCircle(bx + bw - 14 - tile * 0.16, by + 17, 2.5);

  const text = scene.add
    .text(0, top - 4, label, {
      fontFamily: FONT,
      fontStyle: 'bold',
      fontSize: '14px',
      color: '#fff6e0',
      stroke: '#14121c',
      strokeThickness: 3,
      backgroundColor: 'rgba(20,18,28,0.75)',
      padding: { x: 7, y: 2 },
    })
    .setOrigin(0.5, 1)
    .setResolution(crisp() * 2);

  // A small gold chevron that bobs above the label (still with reduced motion).
  const chevron = scene.add.graphics();
  chevron.fillStyle(0xffd166, 1);
  chevron.fillTriangle(-8, 0, 8, 0, 0, 9);
  chevron.lineStyle(2, 0x14121c, 1).strokeTriangle(-8, 0, 8, 0, 0, 9);
  chevron.setPosition(0, top - 30);

  const c = scene.add.container(cx, footY, [glow, g, text, chevron]);
  if (!reducedMotion()) {
    scene.tweens.add({ targets: chevron, y: top - 24, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: glow, alpha: 0.38, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
  return c;
}
