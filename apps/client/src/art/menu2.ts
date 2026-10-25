// P-MENU2-i: draws A-MENU2 menu art (the "menu2" pack, @2x pages shown at 0.5).
// Every helper returns null when the frame can't be drawn; callers then draw the code-drawn version.

import Phaser from 'phaser';
import { frameOf } from './art';
import { MENU2_PACK, pickUi, type UiPack, type UiSprite } from './menu2Frames';

type Name = string;

function lookup(scene: Phaser.Scene, name: Name): (UiSprite & { tex: [string, string] }) | null {
  const pack = scene.cache.json.get(`art:${MENU2_PACK}`) as UiPack | undefined;
  const s = pickUi(pack, name, (p) => scene.textures.exists(`art:${MENU2_PACK}:${p}`));
  const tex = s ? frameOf(scene, MENU2_PACK, s.frame) : null;
  return s && tex ? { ...s, tex } : null;
}

/** True when the frame can be drawn. */
export function hasMenu2(scene: Phaser.Scene, name: Name): boolean {
  return lookup(scene, name) !== null;
}

/** A sprite centred on (x, y), drawn w x h (its full canvas, shadow margin included). */
export function menu2Image(scene: Phaser.Scene, name: Name, x: number, y: number, w: number, h: number): Phaser.GameObjects.Image | null {
  const s = lookup(scene, name);
  if (!s) return null;
  return scene.add.image(x, y, s.tex[0], s.tex[1]).setDisplaySize(w, h);
}

/** A 9-slice (or 3-slice) sprite with its top-left at (x, y), w x h; corners stay at their 1x size. */
export function menu2Slice(scene: Phaser.Scene, name: Name, x: number, y: number, w: number, h: number, k: number | 'height' = 0.5): Phaser.GameObjects.NineSlice | null {
  const s = lookup(scene, name);
  if (!s?.nineSlice) return null;
  const [t, r, b, l] = s.nineSlice.map((v) => v * 2);
  // k = screen px per @2x px. 'height' (3-slices): scale the whole sprite so its height is h, caps included.
  const sc = k === 'height' ? h / (2 * s.size[1]) : k;
  const ns = scene.add.nineslice(x, y, s.tex[0], s.tex[1], Math.max(l + r, w / sc), Math.max(t + b, h / sc), l, r, t, b).setOrigin(0);
  // 3-slice art keeps its own (@2x) height; scale it so it is drawn exactly h tall.
  if (t === 0 && b === 0 && k !== 'height') ns.setScale(sc, h / ns.height);
  else ns.setScale(sc);
  return ns;
}

/** Dark ink for words on the honey button and the title plaque (README). */
export const HONEY_INK = '#462a16';

/**
 * Puts the honey wood button art on a button() (w x h, centred in its visual). `dim` darkens it
 * (a tab that isn't picked); `disabled` uses the matte pale wood. False: the code button stays.
 */
export function woodSkin(scene: Phaser.Scene, b: { visual: Phaser.GameObjects.Container; hit: Phaser.GameObjects.Zone }, w: number, h: number, o: { dim?: boolean; disabled?: boolean } = {}): boolean {
  const name = o.disabled ? 'button-primary-disabled' : 'button-primary-normal';
  const skin = menu2Slice(scene, name, -w / 2, -h / 2, w, h, 'height');
  if (!skin) return false;
  if (o.dim) skin.setTint(0xa89078);
  skinButton(scene, b, skin, name, o.disabled ? undefined : 'button-primary-pressed');
  for (const c of b.visual.list) if (c instanceof Phaser.GameObjects.Text) c.setColor(HONEY_INK);
  if (o.disabled) b.visual.setAlpha(1);
  return true;
}

/**
 * A fixed-size frame drawn into a box of another shape at ONE uniform scale (no stretching): it is
 * scaled to the box width and, when it is then too tall, its top and bottom halves are cropped and
 * butted together (the plain middle is cut out). `pad` is the shadow margin per side, in 1x px.
 * Returns the two halves (or one image), centred on (0, 0); null when the frame can't be drawn.
 */
export function menu2Fit(scene: Phaser.Scene, name: Name, w: number, h: number, pad: number): Phaser.GameObjects.Image[] | null {
  const s = lookup(scene, name);
  if (!s) return null;
  const [fw, fh] = s.size;
  const sc = w / (fw - 2 * pad);
  const fullH = fh * sc;
  const showH = h + 2 * pad * sc;
  const img = () => scene.add.image(0, 0, s.tex[0], s.tex[1]).setDisplaySize(fw * sc, fullH);
  if (showH >= fullH - 0.5) {
    // A box taller than the art: fit the height instead (a narrower, portrait tile; still one scale).
    const sh = h / (fh - 2 * pad);
    return [img().setDisplaySize(fw * sh, fh * sh)];
  }
  const top = img();
  const bot = img();
  const texH = top.frame.realHeight;
  const texW = top.frame.realWidth;
  const cut = Math.ceil((texH * showH) / 2 / fullH) + 1;
  top.setCrop(0, 0, texW, cut).setY(-showH / 2 + fullH / 2);
  bot.setCrop(0, texH - cut, texW, cut).setY(showH / 2 - fullH / 2);
  return [top, bot];
}

/** Re-points an image or 9-slice at another frame (pressed states). False when it can't. */
export function setMenu2(scene: Phaser.Scene, obj: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice, name: Name): boolean {
  const s = lookup(scene, name);
  if (!s) return false;
  if (obj instanceof Phaser.GameObjects.NineSlice) obj.setFrame(s.tex[1]).setTexture(s.tex[0], s.tex[1]);
  else {
    const { displayWidth: w, displayHeight: h } = obj;
    obj.setTexture(s.tex[0], s.tex[1]).setDisplaySize(w, h);
  }
  return true;
}

/** The [texture, frame] pairs for a run of frames (for frame-by-frame playback); null if any is missing. */
export function menu2Frames(scene: Phaser.Scene, names: Name[]): Array<[string, string]> | null {
  const out: Array<[string, string]> = [];
  for (const n of names) {
    const s = lookup(scene, n);
    if (s) out.push(s.tex);
  }
  return out.length ? out : null;
}

/**
 * Swaps a button()'s code-drawn background for `skin` (kept under the label and press shine).
 * Pressed art, when given, shows while the finger is down.
 */
export function skinButton(scene: Phaser.Scene, b: { visual: Phaser.GameObjects.Container; hit: Phaser.GameObjects.Zone }, skin: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice, normal: Name, pressed?: Name): void {
  const bg = b.visual.list[0] as Phaser.GameObjects.Graphics;
  bg.setVisible(false);
  b.visual.addAt(skin, 1);
  if (!pressed) return;
  b.hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => setMenu2(scene, skin, pressed));
  const up = () => skin.active && setMenu2(scene, skin, normal);
  b.hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, up);
  b.hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, up);
}
