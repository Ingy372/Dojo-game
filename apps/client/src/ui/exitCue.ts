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
  const glow = scene.add.image(0, 0, bakeGlow(scene, w, h)).setScale(1 / BAKE);
  const arrow = scene.add.image(0, 0, bakeArrow(scene, Math.min(w, h) * 0.3)).setScale(1 / BAKE);
  arrow.setRotation(dir === 'down' ? 0 : dir === 'left' ? Math.PI / 2 : -Math.PI / 2);

  const cue = scene.add.container(cx, cy, [glow, arrow]);
  if (!reducedMotion()) {
    scene.tweens.add({ targets: glow, alpha: { from: 0.55, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bob = { down: [0, 5], left: [-5, 0], right: [5, 0] }[dir];
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
  g.fillStyle(GOLD, 0.22).fillRoundedRect(pad * BAKE, pad * BAKE, w * BAKE, h * BAKE, (h / 2.5) * BAKE);
  g.lineStyle(3 * BAKE, GOLD, 0.55).strokeRoundedRect(pad * BAKE, pad * BAKE, w * BAKE, h * BAKE, (h / 2.5) * BAKE);
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
