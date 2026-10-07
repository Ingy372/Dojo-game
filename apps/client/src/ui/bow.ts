// The bow (framework section 9): when entering the Home Dojo and at the start of each
// Tower floor. A short, satisfying ritual: the prompt, then the character bows.

import Phaser from 'phaser';
import { BOW } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { FONT, crisp } from './theme';

/**
 * A soft dimmed screen with a big "Bow" button. Calls `onBow` once when tapped.
 * Returns the container (screen space) so a zoomed camera can ignore it.
 */
export function bowPrompt(scene: Phaser.Scene, line: string, onBow: () => void): Phaser.GameObjects.Container {
  const { width, height } = scene.scale.gameSize;
  const shade = scene.add.rectangle(0, 0, width, height, 0x0a0810, 0.45).setOrigin(0).setInteractive();
  const r = Math.min(54, height * 0.14);
  const cx = width / 2;
  const cy = height * 0.66;
  const glow = scene.add.circle(cx, cy, r * 1.25, 0xffd166, 0.18);
  const button = scene.add.circle(cx, cy, r, 0x8a5a35).setStrokeStyle(4, 0xffd166);
  const label = scene.add
    .text(cx, cy, 'Bow', { fontFamily: FONT, fontStyle: 'bold', fontSize: `${Math.round(r * 0.5)}px`, color: '#fff6e0' })
    .setOrigin(0.5)
    .setResolution(crisp());
  const text = scene.add
    .text(cx, cy - r - 30, line, { fontFamily: FONT, fontStyle: 'bold', fontSize: '18px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 5, align: 'center' })
    .setOrigin(0.5)
    .setResolution(crisp());
  const box = scene.add.container(0, 0, [shade, glow, button, label, text]).setDepth(80);
  scene.tweens.add({ targets: glow, scale: 1.15, alpha: 0.05, duration: 900, yoyo: true, repeat: -1 });
  let done = false;
  const tap = () => {
    if (done) return;
    done = true;
    sfx.unlock();
    scene.tweens.add({ targets: box, alpha: 0, duration: 200, onComplete: () => box.destroy() });
    onBow();
  };
  shade.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, tap);
  return box;
}

/** The character bows: dips forward, holds, and rises, with a calm bell. */
export function playBow(scene: Phaser.Scene, character: Phaser.GameObjects.Container, onDone: () => void): void {
  sfx.bow();
  const sx = character.scaleX;
  const sy = character.scaleY;
  scene.tweens.add({
    targets: character,
    scaleY: sy * 0.78,
    scaleX: sx * 1.04,
    duration: BOW.ms * 0.35,
    ease: 'Sine.InOut',
    yoyo: true,
    hold: BOW.ms * 0.3,
    onComplete: () => {
      character.setScale(sx, sy);
      onDone();
    },
  });
}
