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
  const g = scene.add.image(0, (LIP + SHADOW) / 2, bakeButton(scene, o)).setScale(1 / BAKE);
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
      visual.setScale(1).setY(cy);
      scene.tweens.add({ targets: shine, alpha: 0, duration: MOTION.reducedFade.ms });
    } else {
      scene.tweens.add({ targets: visual, scale: 1, y: cy, duration: MOTION.release.ms, ease: MOTION.release.ease });
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
      // Glossy buttons (Jay, Nov 18: "shinier and more push-able"): the face sinks onto its lip.
      scene.tweens.add({ targets: visual, scale: MOTION.press.scale, y: cy + LIP * 0.75, duration: MOTION.press.ms, ease: MOTION.press.ease });
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
/** Room around the shape for the outline and the drop shadow, in points. */
const PAD = 2;
/** Glossy buttons: how far the darker lip shows under the face, and the drop shadow below that (points). */
const LIP = 3;
const SHADOW = 3;

/** A colour mixed toward white (k > 0) or black (k < 0), as a CSS rgb() string. */
function tone(color: number, k: number): string {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const t = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return `rgb(${t(r)},${t(g)},${t(b)})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Glossy buttons (Jay, Nov 18): drawn once on a canvas with real gradients. The face sits on a darker
 * lip with a soft shadow under it, so it looks raised and pressable; the top half has a glossy shine.
 * The face keeps the button's own colour, so every screen's colour meaning is unchanged.
 */
function bakeButton(scene: Phaser.Scene, o: ButtonOptions): string {
  const line = o.selected ? { width: 3, colour: 0xffd166, alpha: 1 } : { width: 2, colour: o.stroke ?? 0xffffff, alpha: o.stroke === undefined ? 0.35 : 0.8 };
  const key = `btn3-${o.w}x${o.h}-${o.color.toString(16)}-${line.width}-${line.colour.toString(16)}-${line.alpha}-${BAKE}`;
  if (scene.textures.exists(key)) return key;
  const B = BAKE;
  const W = Math.ceil((o.w + PAD * 2) * B);
  const H = Math.ceil((o.h + PAD * 2 + LIP + SHADOW) * B);
  const tex = scene.textures.createCanvas(key, W, H);
  if (!tex) return key;
  const ctx = tex.getContext();
  const x = PAD * B;
  const y = PAD * B;
  const w = o.w * B;
  const h = o.h * B;
  const r = RADIUS.button * B + 2 * B;
  // Drop shadow.
  ctx.fillStyle = 'rgba(8,6,14,0.35)';
  roundRect(ctx, x + B, y + (LIP + SHADOW) * B, w - 2 * B, h, r);
  ctx.fill();
  // The lip: the same colour, darker, peeking out under the face.
  ctx.fillStyle = tone(o.color, -0.45);
  roundRect(ctx, x, y + LIP * B, w, h, r);
  ctx.fill();
  // The face: lighter at the top, the button colour in the middle, a bit darker at the bottom.
  const face = ctx.createLinearGradient(0, y, 0, y + h);
  face.addColorStop(0, tone(o.color, 0.28));
  face.addColorStop(0.5, tone(o.color, 0));
  face.addColorStop(1, tone(o.color, -0.16));
  ctx.fillStyle = face;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  // Gloss: a soft white band over the top half.
  const gloss = ctx.createLinearGradient(0, y, 0, y + h * 0.55);
  gloss.addColorStop(0, 'rgba(255,255,255,0.38)');
  gloss.addColorStop(1, 'rgba(255,255,255,0.04)');
  ctx.fillStyle = gloss;
  roundRect(ctx, x + 2 * B, y + 1.5 * B, w - 4 * B, h * 0.5, r - B);
  ctx.fill();
  // A thin bright rim along the top edge.
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2 * B;
  roundRect(ctx, x + B, y + B, w - 2 * B, h + 6 * B, r);
  ctx.stroke();
  ctx.restore();
  // The outline (gold when picked).
  const lc = Phaser.Display.Color.IntegerToColor(line.colour);
  ctx.strokeStyle = `rgba(${lc.red},${lc.green},${lc.blue},${line.alpha})`;
  ctx.lineWidth = line.width * B;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
  tex.refresh();
  return key;
}

function bakeShine(scene: Phaser.Scene, w: number, h: number): string {
  const key = `btn-shine2-${w}x${h}-${BAKE}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({}, false);
  g.fillStyle(0xffffff).fillRoundedRect(PAD * BAKE, PAD * BAKE, w * BAKE, h * BAKE, (RADIUS.button + 2) * BAKE);
  g.generateTexture(key, Math.ceil((w + PAD * 2) * BAKE), Math.ceil((h + PAD * 2) * BAKE));
  g.destroy();
  return key;
}
