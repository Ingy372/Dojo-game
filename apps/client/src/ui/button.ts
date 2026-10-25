import Phaser from 'phaser';
// P-MENU-a: the shared rounded button. Press on finger-down (scale + brighten + soft tap),
// act on finger-up inside, cancel if the finger slides off. The tap area is at least 44 x 44.

import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { FONT, crisp } from './theme';
import { MOTION, PRESS_BRIGHTEN, RADIUS, tapArea } from './tokens';

export interface ButtonOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: number;
  size: number;
  onTap: () => void;
}

export interface Button {
  /** The drawing (scaled on press). */
  visual: Phaser.GameObjects.Container;
  /** The invisible tap area (at least 44 x 44). */
  hit: Phaser.GameObjects.Zone;
}

/** Draws a button with its top-left at (x, y). Adds both parts to `parent` when given. */
export function button(scene: Phaser.Scene, o: ButtonOptions, parent?: Phaser.GameObjects.Container): Button {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const g = scene.add.graphics();
  g.fillStyle(o.color).fillRoundedRect(-o.w / 2, -o.h / 2, o.w, o.h, RADIUS.button);
  g.lineStyle(2, 0xffffff, 0.35).strokeRoundedRect(-o.w / 2, -o.h / 2, o.w, o.h, RADIUS.button);
  const shine = scene.add.graphics().setAlpha(0);
  shine.fillStyle(0xffffff).fillRoundedRect(-o.w / 2, -o.h / 2, o.w, o.h, RADIUS.button);
  const label = scene.add
    .text(0, 0, o.label, { fontFamily: FONT, fontSize: `${o.size}px`, color: '#ffffff', fontStyle: 'bold' })
    .setResolution(crisp())
    .setOrigin(0.5);
  const visual = scene.add.container(cx, cy, [g, shine, label]).setSize(o.w, o.h);

  const a = tapArea(o.w, o.h);
  const hit = scene.add.zone(cx, cy, a.w, a.h).setInteractive({ useHandCursor: true });
  parent?.add([visual, hit]);

  let pressed = false;
  const settle = (): void => {
    scene.tweens.killTweensOf([visual, shine]);
    if (reducedMotion()) {
      visual.setScale(1);
      scene.tweens.add({ targets: shine, alpha: 0, duration: MOTION.reducedFade.ms });
    } else {
      scene.tweens.add({ targets: visual, scale: 1, duration: MOTION.release.ms, ease: MOTION.release.ease });
      scene.tweens.add({ targets: shine, alpha: 0, duration: MOTION.release.ms });
    }
  };

  hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    pressed = true;
    sfx.unlock();
    sfx.tap();
    scene.tweens.killTweensOf([visual, shine]);
    if (reducedMotion()) {
      shine.setAlpha(PRESS_BRIGHTEN);
    } else {
      scene.tweens.add({ targets: visual, scale: MOTION.press.scale, duration: MOTION.press.ms, ease: MOTION.press.ease });
      scene.tweens.add({ targets: shine, alpha: PRESS_BRIGHTEN, duration: MOTION.press.ms });
    }
  });
  hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
    if (!pressed) return;
    pressed = false;
    settle();
  });
  hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
    // A finger that lands here without pressing here first (slid on) does nothing.
    if (!pressed) return;
    pressed = false;
    settle();
    o.onTap();
  });
  // The action may redraw the screen and destroy the button mid-tween.
  visual.once(Phaser.GameObjects.Events.DESTROY, () => scene.tweens.killTweensOf([visual, shine]));
  return { visual, hit };
}
