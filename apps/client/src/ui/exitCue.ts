import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';

export type CueDirection = 'down' | 'left' | 'right';

/** A soft gold colour, nothing red: the cue is gentle and has no words. */
const GOLD = 0xffd166;

/**
 * A simple exit cue (A4-DOJO-ii): a warm glow on the floor with a chevron arrow pointing the way out.
 * (cx, cy) is its centre and w x h the glow's size, all in world pixels. The glow breathes and the arrow
 * bobs, unless reduced motion is on: then it is a still glow and arrow.
 */
export function addExitCue(scene: Phaser.Scene, cx: number, cy: number, w: number, h: number, dir: CueDirection): Phaser.GameObjects.Container {
  const glow = scene.add.graphics();
  glow.fillStyle(GOLD, 0.22).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2.5);
  glow.lineStyle(3, GOLD, 0.55).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2.5);

  const s = Math.min(w, h) * 0.3;
  const arrow = scene.add.graphics();
  // A chevron pointing down; turned for left and right.
  const chevron = (lineWidth: number, colour: number, alpha: number) => {
    arrow.lineStyle(lineWidth, colour, alpha);
    arrow.beginPath().moveTo(-s, -s * 0.45).lineTo(0, s * 0.45).lineTo(s, -s * 0.45).strokePath();
  };
  chevron(9, 0x3b2a14, 0.55);
  chevron(5, 0xfff1c9, 1);
  arrow.setRotation(dir === 'down' ? 0 : dir === 'left' ? Math.PI / 2 : -Math.PI / 2);

  const cue = scene.add.container(cx, cy, [glow, arrow]);
  if (!reducedMotion()) {
    scene.tweens.add({ targets: glow, alpha: { from: 0.55, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bob = { down: [0, 5], left: [-5, 0], right: [5, 0] }[dir];
    scene.tweens.add({ targets: arrow, x: bob[0], y: bob[1], duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  return cue;
}
