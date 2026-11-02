import Phaser from 'phaser';
// P-MENU-a: the shared rounded button. Press on finger-down (scale + brighten + soft tap),
// act on finger-up inside, cancel if the finger slides off. The tap area is at least 44 x 44.

import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { DPR, FONT, crisp } from './theme';
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
  /** P-MENU-c: a picked choice (belt, stripes, play time): a 3 pt gold outline. */
  selected?: boolean;
  /** P-MENU-c: shown greyed out (35%) and not tappable. */
  disabled?: boolean;
  /** P-MENU-c: outline colour when not selected (default white at 35%). */
  stroke?: number;
  /** P-MENU-c: label colour (default white). */
  labelColor?: string;
  /** P-MENU-c: wrap the label at this width (centred). */
  labelWrap?: number;
  /** P-MENU-c: shift the label right by this many points (room for a swatch). */
  labelDx?: number;
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
  // A4-DOJO-hotfix: drawn once into textures and shown as images. A Graphics object is re-triangulated
  // on the CPU every frame it is on screen, and the Home Dojo has a dozen buttons: that was most of its
  // frame (1.0 of 1.2 ms). The look is unchanged.
  const g = scene.add.image(0, 0, bakeButton(scene, o)).setScale(1 / BAKE);
  const shine = scene.add.image(0, 0, bakeShine(scene, o.w, o.h)).setScale(1 / BAKE).setAlpha(0);
  const label = scene.add
    .text(o.labelDx ?? 0, 0, o.label, { fontFamily: FONT, fontSize: `${o.size}px`, color: o.labelColor ?? '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: o.labelWrap ? { width: o.labelWrap } : undefined })
    .setResolution(crisp())
    .setOrigin(0.5);
  const visual = scene.add.container(cx, cy, [g, shine, label]).setSize(o.w, o.h);

  const a = tapArea(o.w, o.h);
  const hit = scene.add.zone(cx, cy, a.w, a.h);
  if (o.disabled) visual.setAlpha(0.35);
  else hit.setInteractive({ useHandCursor: true });
  // Added last, so the tap zone sits above anything already in `parent` (e.g. a dim layer).
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

/** Texture pixels per point: the UI camera is zoomed by DPR, so this is one texture pixel per screen pixel. */
const BAKE = Math.ceil(DPR);
/** Room around the shape for half the outline, in points. */
const PAD = 2;

function bakeButton(scene: Phaser.Scene, o: ButtonOptions): string {
  const line = o.selected ? { width: 3, colour: 0xffd166, alpha: 1 } : { width: 2, colour: o.stroke ?? 0xffffff, alpha: o.stroke === undefined ? 0.35 : 0.8 };
  const key = `btn-${o.w}x${o.h}-${o.color.toString(16)}-${line.width}-${line.colour.toString(16)}-${line.alpha}-${BAKE}`;
  if (scene.textures.exists(key)) return key;
  const r = RADIUS.button * BAKE;
  const g = scene.make.graphics({}, false);
  g.fillStyle(o.color).fillRoundedRect(PAD * BAKE, PAD * BAKE, o.w * BAKE, o.h * BAKE, r);
  g.lineStyle(line.width * BAKE, line.colour, line.alpha).strokeRoundedRect(PAD * BAKE, PAD * BAKE, o.w * BAKE, o.h * BAKE, r);
  g.generateTexture(key, Math.ceil((o.w + PAD * 2) * BAKE), Math.ceil((o.h + PAD * 2) * BAKE));
  g.destroy();
  return key;
}

function bakeShine(scene: Phaser.Scene, w: number, h: number): string {
  const key = `btn-shine-${w}x${h}-${BAKE}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({}, false);
  g.fillStyle(0xffffff).fillRoundedRect(PAD * BAKE, PAD * BAKE, w * BAKE, h * BAKE, RADIUS.button * BAKE);
  g.generateTexture(key, Math.ceil((w + PAD * 2) * BAKE), Math.ceil((h + PAD * 2) * BAKE));
  g.destroy();
  return key;
}
