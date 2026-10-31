import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';

export type CueDirection = 'down' | 'left' | 'right';

/** A soft gold colour, nothing red: the cue is gentle and has no words. */
const GOLD = 0xffd166;

/**
 * A simple exit cue (A4-DOJO-ii): a warm glow on the floor with a chevron arrow pointing the way out.
 * (cx, cy) is its centre and w x h the glow's size, all in world pixels. The glow breathes and the arrow
 * bobs and pulses, unless reduced motion is on: then it is a still glow and arrow.
 */
export function addExitCue(scene: Phaser.Scene, cx: number, cy: number, w: number, h: number, dir: CueDirection, arrowMin = 0): Phaser.GameObjects.Container {
  const glow = scene.add.image(0, 0, bakeGlow(scene, w, h)).setScale(1 / BAKE);
  const arrow = scene.add.image(0, 0, bakeArrow(scene, Math.max(arrowMin, Math.min(w, h) * 0.3))).setScale(1 / BAKE);
  arrow.setRotation(dir === 'down' ? 0 : dir === 'left' ? Math.PI / 2 : -Math.PI / 2);

  const cue = scene.add.container(cx, cy, [glow, arrow]);
  if (!reducedMotion()) {
    scene.tweens.add({ targets: glow, alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bob = { down: [0, 5], left: [-5, 0], right: [5, 0] }[dir];
    // Q-PREMIUM-2 L4: a short size pulse on top of the bob, so the way out is easy to spot (still when reduced motion is on).
    scene.tweens.add({ targets: arrow, scale: { from: 1 / BAKE, to: 1.3 / BAKE }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    scene.tweens.add({ targets: arrow, x: bob[0], y: bob[1], duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  return cue;
}

/**
 * The cue is drawn once into a texture (BAKE times the size, so it stays sharp at the zoom) and then
 * shown as two images. A Graphics object is re-triangulated on the CPU every frame it draws, and the
 * cue draws every frame (its alpha and position change), so it was about half the cost of a whole
 * Action Zone frame. An image is one quad.
 */
export const BAKE = 4;

function bakeGlow(scene: Phaser.Scene, w: number, h: number): string {
  const key = `exit-cue-glow-${Math.round(w)}x${Math.round(h)}`;
  if (scene.textures.exists(key)) return key;
  const pad = 3; // room for the outline
  const g = scene.make.graphics({}, false);
  // A4-DOJO-ii-fix: stronger than before (the inside glow was faint on the pale lobby floor): a warmer
  // fill, a brighter pad in the middle, and a heavy gold edge. Still gold, nothing red, no words.
  g.fillStyle(GOLD, 0.42).fillRoundedRect(pad * BAKE, pad * BAKE, w * BAKE, h * BAKE, (h / 2.5) * BAKE);
  g.fillStyle(0xfff1c9, 0.28).fillRoundedRect((pad + 6) * BAKE, (pad + 6) * BAKE, (w - 12) * BAKE, (h - 12) * BAKE, (h / 3) * BAKE);
  g.lineStyle(5 * BAKE, GOLD, 0.95).strokeRoundedRect(pad * BAKE, pad * BAKE, w * BAKE, h * BAKE, (h / 2.5) * BAKE);
  g.generateTexture(key, Math.ceil((w + pad * 2) * BAKE), Math.ceil((h + pad * 2) * BAKE));
  g.destroy();
  return key;
}

function bakeArrow(scene: Phaser.Scene, s: number): string {
  const key = `exit-cue-arrow-${Math.round(s)}`;
  if (scene.textures.exists(key)) return key;
  const size = Math.ceil((s + 8) * 2 * BAKE);
  const c = size / 2;
  const g = scene.make.graphics({}, false);
  // A chevron pointing down; the image is turned for left and right.
  const chevron = (lineWidth: number, colour: number, alpha: number) => {
    g.lineStyle(lineWidth * BAKE, colour, alpha);
    g.beginPath().moveTo(c - s * BAKE, c - s * 0.45 * BAKE).lineTo(c, c + s * 0.45 * BAKE).lineTo(c + s * BAKE, c - s * 0.45 * BAKE).strokePath();
  };
  chevron(9, 0x3b2a14, 0.55);
  chevron(5, 0xfff1c9, 1);
  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}
