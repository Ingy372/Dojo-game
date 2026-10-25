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
export function menu2Slice(scene: Phaser.Scene, name: Name, x: number, y: number, w: number, h: number): Phaser.GameObjects.NineSlice | null {
  const s = lookup(scene, name);
  if (!s?.nineSlice) return null;
  const [t, r, b, l] = s.nineSlice.map((v) => v * 2);
  const ns = scene.add.nineslice(x, y, s.tex[0], s.tex[1], Math.max(l + r, w * 2), Math.max(t + b, h * 2), l, r, t, b).setOrigin(0);
  // 3-slice art keeps its own height; scale it to fit.
  if (t === 0 && b === 0) ns.setScale(0.5, h / s.size[1]);
  else ns.setScale(0.5);
  return ns;
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
