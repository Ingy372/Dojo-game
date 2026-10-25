// Named monsters on screen (M7-N1): gold sparkles, the name plate under its feet (fades
// after a few seconds), then the small name tag over its head, and its one extra tell.
// The rules (who, where, Health) live in @dojo/sim; the art is the "named-monster" pack.

import Phaser from 'phaser';
import type { EnemyState, NamedMonsterDef } from '@dojo/sim';
import { addStatic, directionIndex, frameOf, setStaticFrame, staticArt } from '../art/art';
import { FONT, crisp } from '../ui/theme';
import { CONTENT } from './content';
import { reducedMotion } from './motion';

export const NAMED_PACK = 'named-monster';
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const TAG_FADE_MS = 300;
const PLATE_FADE_MS = 400;
/** The plate's spot under the feet (px). */
const PLATE_BELOW = 6;


interface ArtExtras {
  nineSlice?: { left: number; right: number; top: number; bottom: number };
  textColor?: string;
  headOffsetPx?: Record<string, number>;
  timing?: { playAtSec?: number[]; screenShake?: { px: number; sec: number; atSec: number[] } };
  offsetPerFramePx?: Record<string, number[][]>;
  layerSizes?: Record<string, [number, number]>;
}

function extras(scene: Phaser.Scene, id: string): ArtExtras {
  return (staticArt(scene, NAMED_PACK, id) ?? {}) as unknown as ArtExtras;
}

/** A blank nine-slice label from the pack with the name written on it. */
function label(scene: Phaser.Scene, id: string, text: string, size: number, padX: number): Phaser.GameObjects.Container | null {
  const s = staticArt(scene, NAMED_PACK, id);
  if (!s) return null;
  const f = frameOf(scene, NAMED_PACK, Object.values(s.layers)[0][0]);
  if (!f) return null;
  const x = extras(scene, id);
  const t = scene.add.text(0, 0, text, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color: x.textColor ?? '#3a2a22' }).setOrigin(0.5).setResolution(crisp());
  const w = Math.max(s.frameWidth, Math.ceil(t.width) + padX * 2);
  const h = s.frameHeight;
  const ns = x.nineSlice ?? { left: 8, right: 8, top: 4, bottom: 4 };
  const bg = scene.add.nineslice(0, 0, f[0], f[1], w, h, ns.left, ns.right, ns.top, ns.bottom);
  // Anchor: plate = top-centre (under the feet), tag = bottom-centre (over the head).
  const top = s.anchor[1] < h / 2;
  bg.setOrigin(0.5, top ? 0 : 1);
  t.setY(top ? h / 2 - 1 : -h / 2);
  return scene.add.container(0, 0, [bg, t]);
}

export class NamedView {
  readonly def: NamedMonsterDef;
  readonly behind: Phaser.GameObjects.GameObject[] = [];
  readonly front: Phaser.GameObjects.GameObject[] = [];
  private sparkle: Phaser.GameObjects.Image[] = [];
  private sparkleId: string;
  private plate: Phaser.GameObjects.Container | null;
  private tag: Phaser.GameObjects.Container | null;
  private dust: Phaser.GameObjects.Image[] = [];
  private tap: Phaser.GameObjects.Image[] = [];
  private trail: Phaser.GameObjects.Container | null = null;
  private trailTiles: Phaser.GameObjects.Image[] = [];
  private tileW = 38;
  private trailStart = 0;
  /** World boxes of the visible plate and tag (B-T3-NUDGE: "Help me!" keeps off them). */
  labelBounds(): Phaser.Geom.Rectangle[] {
    return [this.plate, this.tag].filter((c): c is Phaser.GameObjects.Container => !!c && c.visible && c.alpha > 0).map((c) => c.getBounds());
  }

  /** When it was first seen (the plate's 3 seconds start), or null. */
  shownAt: number | null = null;
  /** Tell beats already played in the current wind-up. */
  private beats = 0;
  /** The head tag's spot (px above the feet). */
  private headY = -80;

  /**
   * K12: keeps the plate and tag readable. The plate sits under the feet unless another
   * creature or the player is there (then over the head); near the top of the screen,
   * where the HUD is, a label over the head moves under the feet. Both hide once it's beaten.
   * `others` are the other creatures' feet, in px from this one's feet; `topRoom` is how many
   * px there are between this one's feet and the bottom of the HUD.
   */
  layout(others: Array<{ x: number; y: number }>, topRoom: number, defeated: boolean): void {
    if (defeated) {
      this.plate?.setVisible(false);
      this.tag?.setVisible(false);
      return;
    }
    const blocked = (y0: number, y1: number, halfW: number) => others.some((o) => Math.abs(o.x) < halfW + 18 && o.y + 8 > y0 && o.y - 70 < y1);
    if (this.plate) {
      const halfW = this.plate.getBounds().width / 2;
      const h = 22;
      const aboveY = this.headY - h;
      const below = !blocked(PLATE_BELOW, PLATE_BELOW + h, halfW) || -aboveY > topRoom;
      this.plate.setY(below ? PLATE_BELOW : aboveY);
    }
    if (this.tag) this.tag.setY(-this.headY + 4 > topRoom ? PLATE_BELOW + 22 : this.headY);
  }

  constructor(
    private scene: Phaser.Scene,
    e: EnemyState,
    def: NamedMonsterDef,
  ) {
    this.def = def;
    const base = def.baseEnemy;
    this.sparkleId = `named-sparkle-${base}`;
    this.sparkle = addStatic(scene, NAMED_PACK, this.sparkleId, 0, 0);
    this.front.push(...this.sparkle);
    this.plate = label(scene, 'name-plate', def.name, 14, 12);
    if (this.plate) this.plate.setY(PLATE_BELOW);
    this.tag = label(scene, 'name-tag', def.name, 10, 8);
    this.headY = -(extras(scene, 'name-tag').headOffsetPx?.[base] ?? 80);
    if (this.tag) this.tag.setY(this.headY).setAlpha(0);
    if (base === 'brute') {
      this.dust = addStatic(scene, NAMED_PACK, 'tell-stamp-dust', 0, 0);
      this.dust.forEach((d) => d.setVisible(false));
      this.behind.push(...this.dust);
    } else if (base === 'shield') {
      this.tap = addStatic(scene, NAMED_PACK, 'tell-shield-tap', 0, 0);
      this.tap.forEach((d) => d.setVisible(false));
      this.front.push(...this.tap);
    } else if (base === 'swarmer') {
      const fx = addStatic(scene, NAMED_PACK, 'tell-dash-trail', 0, 0);
      if (fx[0]) {
        this.tileW = extras(scene, 'tell-dash-trail').layerSizes?.tile?.[0] ?? 38;
        const s = staticArt(scene, NAMED_PACK, 'tell-dash-trail')!;
        // The fx layer, then the tile layer repeated along +x from the frame's right edge.
        const right = s.frameWidth - s.anchor[0];
        this.trailStart = right;
        this.trailTiles = [0, 1, 2, 3].map((i) => (fx[1] && i === 0 ? fx[1] : scene.add.image(0, 0, fx[1]?.texture.key ?? '__DEFAULT', fx[1]?.frame.name)));
        this.trailTiles.forEach((t, i) => t.setOrigin(0, 0.5).setPosition(right + i * this.tileW, 0));
        this.trail = scene.add.container(0, 0, [fx[0], ...this.trailTiles]).setVisible(false);
        this.behind.push(this.trail);
      }
    }
    if (this.plate) this.front.push(this.plate);
    if (this.tag) this.front.push(this.tag);
    void e;
  }

  /** Draws this frame. Returns the tell sound/shake beats that start now. */
  /** shakeScale: the K25/K28 shake rule's strength for this player (0 = no wind-up shake). */
  update(e: EnemyState, now: number, windupSec: number | null, windupFrame: number, tilePx: number, shakeScale: number): { clank: boolean } {
    const a = staticArt(this.scene, NAMED_PACK, this.sparkleId);
    // Reduced motion (K12): no sparkles.
    const calm = reducedMotion();
    this.sparkle.forEach((sp) => sp.setVisible(!calm));
    if (a && !calm) setStaticFrame(this.scene, NAMED_PACK, this.sparkleId, this.sparkle, Math.floor((now / 1000) * (a.fps ?? 10)) % a.frames);
    // Name plate for the first few seconds, then the head tag fades in.
    if (this.shownAt !== null) {
      const plateMs = CONTENT.named.rules.plateSeconds * 1000;
      const t = now - this.shownAt;
      this.plate?.setAlpha(Phaser.Math.Clamp(1 - (t - plateMs) / PLATE_FADE_MS, 0, 1));
      this.tag?.setAlpha(Phaser.Math.Clamp((t - plateMs - PLATE_FADE_MS) / TAG_FADE_MS, 0, 1));
    }
    const out = { clank: false };
    const base = this.def.baseEnemy;
    if (windupSec === null) {
      this.beats = 0;
      this.dust.forEach((d) => d.setVisible(false));
      this.tap.forEach((d) => d.setVisible(false));
      this.trail?.setVisible(false);
      return out;
    }
    const tellId = base === 'brute' ? 'tell-stamp-dust' : base === 'shield' ? 'tell-shield-tap' : 'tell-dash-trail';
    const art = staticArt(this.scene, NAMED_PACK, tellId);
    if (!art) return out;
    const x = extras(this.scene, tellId);
    const beats = x.timing?.playAtSec ?? [0];
    let last = -1;
    beats.forEach((b, i) => {
      if (windupSec >= b) last = i;
    });
    const fresh = last + 1 > this.beats;
    this.beats = Math.max(this.beats, last + 1);
    const frame = last < 0 ? -1 : Math.floor((windupSec - beats[last]) * (art.fps ?? 10));
    if (base === 'brute') {
      const show = frame >= 0 && frame < art.frames;
      this.dust.forEach((d) => d.setVisible(show));
      if (show) setStaticFrame(this.scene, NAMED_PACK, tellId, this.dust, frame);
      const shake = x.timing?.screenShake;
      if (fresh && shake && shakeScale > 0) {
        const cam = this.scene.cameras.main;
        cam.shake(shake.sec * 1000, (shake.px * shakeScale) / Math.max(cam.width, 1));
      }
    } else if (base === 'shield') {
      const show = frame >= 0 && frame < art.frames;
      const dir = DIRS[directionIndex(e.facing.x, e.facing.y)];
      const offs = x.offsetPerFramePx?.[dir];
      const o = offs?.[Math.min(windupFrame, offs.length - 1)] ?? [0, 0];
      this.tap.forEach((d) => d.setVisible(show).setPosition(o[0], o[1]));
      if (show) setStaticFrame(this.scene, NAMED_PACK, tellId, this.tap, frame);
      out.clank = fresh;
    } else if (this.trail && e.attackCenter && !reducedMotion()) {
      // Reduced motion (K12): no dash trail (the wind-up pose and telegraph still show).
      const dx = e.attackCenter.x - e.pos.x;
      const dy = e.attackCenter.y - e.pos.y;
      const angle = Math.atan2(dy, dx);
      // The trail lies on the ground: squashed for up/down dashes.
      this.trail.setVisible(true).setRotation(angle).setScale(1, 1 - 0.5 * Math.abs(Math.sin(angle)));
      const f = Math.min(Math.max(frame, 0), art.frames - 1);
      setStaticFrame(this.scene, NAMED_PACK, tellId, [this.trail.list[0] as Phaser.GameObjects.Image], f);
      const tile = Object.values(art.layers)[1];
      const id = tile?.[Math.floor((now / 1000) * 10) % tile.length];
      const tf = id !== undefined ? frameOf(this.scene, NAMED_PACK, id) : null;
      const length = Math.hypot(dx, dy) * tilePx - this.trailStart;
      this.trailTiles.forEach((t, i) => {
        if (tf) t.setTexture(tf[0], tf[1]);
        t.setVisible(i * this.tileW < length);
      });
    }
    return out;
  }
}
