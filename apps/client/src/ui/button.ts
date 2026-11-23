import Phaser from 'phaser';
// P-MENU-a: the shared rounded button. Press on finger-down (scale + brighten + soft tap),
// act on finger-up inside, cancel if the finger slides off. The tap area is at least 44 x 44.

import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { DPR, crisp } from './theme';
import { KIT, KIT_TONE, TITLE_FONT, brightness, strokeFor, toneOf } from './kit';
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
  // U-KIT: Lilita One, white with a dark outline (a light label colour the caller asked for is kept).
  const labelColor = o.labelColor && brightness(o.labelColor) > 0.5 ? o.labelColor : '#ffffff';
  const size = Math.round(o.size * 1.06);
  const label = scene.add
    .text(o.labelDx ?? 0, -LIP * 0.15, o.label, { fontFamily: TITLE_FONT, fontSize: `${size}px`, color: labelColor, stroke: css(KIT.ink), strokeThickness: strokeFor(size), align: 'center', wordWrap: o.labelWrap ? { width: o.labelWrap } : undefined })
    .setResolution(crisp())
    .setOrigin(0.5);
  // A label that would run past the button shrinks to fit.
  const room = o.w - 14 - Math.abs(o.labelDx ?? 0);
  if (!o.labelWrap && label.width > room) label.setScale(room / label.width);
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

/**
 * U-KIT: just the kit button's face (no tap handling), with its top-left at (x, y). For screens that run
 * their own taps on a plain shape: draw this under the shape and make the shape see-through.
 */
export function buttonFace(scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: number, selected = false): Phaser.GameObjects.Image {
  const key = bakeButton(scene, { x, y, w, h, label: '', color, size: 12, selected, onTap: () => {} });
  return scene.add.image(x - PAD, y - PAD, key).setOrigin(0).setScale(1 / BAKE);
}

/** Texture pixels per point: the UI camera is zoomed by DPR, so this is one texture pixel per screen pixel. */
const BAKE = Math.ceil(DPR);
/** Room around the shape for the outline and the drop shadow, in points. */
const PAD = 2;
/** Glossy buttons: how far the darker lip shows under the face, and the drop shadow below that (points). */
const LIP = 3;
const SHADOW = 3;

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
 * U-KIT (Jay, Nov 23): every button wears the one kit look (Archero 2 / Survivor.io): a thick dark outline
 * around a glossy face that sits on a darker lip, with a soft shadow. The caller's colour picks the kit
 * tone that means the same thing (gold = main action, blue = back / secondary, green = yes / go, red =
 * danger, dim = quiet), see toneOf. Picked buttons get a gold ring around the outline.
 */
function bakeButton(scene: Phaser.Scene, o: ButtonOptions): string {
  const t = KIT_TONE[toneOf(o.color)];
  const key = `btnK-${o.w}x${o.h}-${t.base.toString(16)}-${o.selected ? 's' : ''}-${BAKE}`;
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
  const r = Math.min(12 * B, h / 2);
  const ink = css(KIT.ink);
  // Drop shadow under the lip.
  ctx.fillStyle = 'rgba(5,8,30,0.55)';
  roundRect(ctx, x, y + (LIP + SHADOW) * B, w, h, r);
  ctx.fill();
  // The dark outline around face and lip together.
  ctx.fillStyle = ink;
  roundRect(ctx, x, y, w, h + LIP * B, r);
  ctx.fill();
  const lw = 2.5 * B;
  // The lip.
  ctx.fillStyle = css(t.lip);
  roundRect(ctx, x + lw, y + lw, w - 2 * lw, h + LIP * B - 2 * lw, r - lw);
  ctx.fill();
  // The face: bright at the top, the tone's colour at the bottom.
  const face = ctx.createLinearGradient(0, y, 0, y + h);
  face.addColorStop(0, css(t.hi));
  face.addColorStop(1, css(t.base));
  ctx.fillStyle = face;
  roundRect(ctx, x + lw, y + lw, w - 2 * lw, h - 2 * lw, r - lw);
  ctx.fill();
  // A thin light line along the face's top edge, and the gloss over the top 40%.
  ctx.save();
  roundRect(ctx, x + lw, y + lw, w - 2 * lw, h - 2 * lw, r - lw);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2 * B;
  roundRect(ctx, x + lw, y + lw + B, w - 2 * lw, h + 8 * B, r - lw);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  roundRect(ctx, x + lw + 3 * B, y + lw + 1.5 * B, w - 2 * lw - 6 * B, (h - 2 * lw) * 0.4, Math.max(2 * B, r - lw - 2 * B));
  ctx.fill();
  // Picked: a gold ring just inside the outline.
  if (o.selected) {
    ctx.strokeStyle = '#ffe36a';
    ctx.lineWidth = 2.5 * B;
    roundRect(ctx, x + lw + 1.25 * B, y + lw + 1.25 * B, w - 2 * lw - 2.5 * B, h - 2 * lw - 2.5 * B, r - lw - B);
    ctx.stroke();
  }
  tex.refresh();
  return key;
}

function css(c: number): string {
  return `#${c.toString(16).padStart(6, '0')}`;
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
