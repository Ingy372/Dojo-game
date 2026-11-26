// The town's mini map and the place pictures on its door signs (Jay, Nov 24: "a small mini map I like, and door signs
// and labels are a great idea"). Nov 26 (Grok playtest, section 7): a legend names each picture, and tapping a
// place (on the map or in the legend) walks the hero there on foot, past the classmates (still no Home button).
// Drawn in code (placeholder art, waiting on Jay's OK).

import Phaser from 'phaser';
import type { Room, Vec2 } from '@dojo/sim';
import { FONT, TYPE, crisp } from './theme';
import { reducedMotion } from '../game/motion';

/** The places with a picture: your own dojo, the real dojo (pro shop), the Street Smarts House and the Tower. */
export type PlaceKind = 'home' | 'dojo' | 'street' | 'tower';

/** Each place's colour, the same on the map and on its door sign. */
export const PLACE_COLOR: Record<PlaceKind, number> = { home: 0xffd166, dojo: 0xe2533b, street: 0x3fbf7f, tower: 0xa98bff };

/**
 * A small picture of a place, centred at (x, y) and about `r` in radius, drawn on `g`: a house for home, a belt
 * knot for the Action Zone, a shield for Street Smarts, a pagoda for the Tower. A coloured disc sits behind it.
 */
export function drawPlaceIcon(g: Phaser.GameObjects.Graphics, kind: PlaceKind, x: number, y: number, r: number): void {
  const ink = 0x14121c;
  g.fillStyle(ink, 0.9).fillCircle(x, y, r + Math.max(1.5, r * 0.18));
  g.fillStyle(PLACE_COLOR[kind], 1).fillCircle(x, y, r);
  const u = r * 0.62;
  g.fillStyle(ink, 1);
  if (kind === 'home') {
    // A roof and a box with a door gap.
    g.fillTriangle(x - u, y - u * 0.05, x + u, y - u * 0.05, x, y - u);
    g.fillRect(x - u * 0.68, y - u * 0.05, u * 1.36, u * 0.95);
    g.fillStyle(PLACE_COLOR.home, 1).fillRect(x - u * 0.2, y + u * 0.35, u * 0.4, u * 0.55);
  } else if (kind === 'dojo') {
    // A tied belt: the band, the knot and two hanging ends.
    g.fillRect(x - u, y - u * 0.5, u * 2, u * 0.42);
    g.fillRect(x - u * 0.26, y - u * 0.66, u * 0.52, u * 0.72);
    g.fillTriangle(x - u * 0.2, y + u * 0.02, x - u * 0.62, y + u * 0.95, x - u * 0.2, y + u * 0.95);
    g.fillTriangle(x + u * 0.2, y + u * 0.02, x + u * 0.62, y + u * 0.95, x + u * 0.2, y + u * 0.95);
  } else if (kind === 'street') {
    // A shield.
    g.fillPoints([
      { x: x - u * 0.8, y: y - u * 0.75 },
      { x: x + u * 0.8, y: y - u * 0.75 },
      { x: x + u * 0.8, y: y - u * 0.05 },
      { x, y: y + u },
      { x: x - u * 0.8, y: y - u * 0.05 },
    ], true);
    g.fillStyle(PLACE_COLOR.street, 1).fillRect(x - u * 0.12, y - u * 0.5, u * 0.24, u * 0.95).fillRect(x - u * 0.45, y - u * 0.15, u * 0.9, u * 0.24);
  } else {
    // A three-roof pagoda.
    for (let i = 0; i < 3; i++) {
      const ty = y - u + i * u * 0.62;
      const w = u * (0.45 + i * 0.28);
      g.fillTriangle(x - w, ty + u * 0.36, x + w, ty + u * 0.36, x, ty);
    }
    g.fillRect(x - u * 0.2, y + u * 0.55, u * 0.4, u * 0.45);
  }
}

/** A door sign: a dark rounded panel with the place's picture on the left and its name. Origin: bottom middle. */
export function placeSign(scene: Phaser.Scene, kind: PlaceKind, label: string, x: number, y: number, size = 15): Phaser.GameObjects.Container {
  const text = scene.add
    .text(0, 0, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color: '#fff6e0', stroke: '#14121c', strokeThickness: 4 })
    .setOrigin(0, 0.5)
    .setResolution(crisp() * 2);
  const r = size * 0.72;
  const padX = 6;
  const h = Math.max(text.height, r * 2) + 6;
  const w = padX + r * 2 + 6 + text.width + padX + 2;
  const g = scene.add.graphics();
  g.fillStyle(0x14121c, 0.72).fillRoundedRect(-w / 2, -h, w, h, h / 2);
  g.lineStyle(2, PLACE_COLOR[kind], 0.95).strokeRoundedRect(-w / 2, -h, w, h, h / 2);
  drawPlaceIcon(g, kind, -w / 2 + padX + r, -h / 2, r);
  text.setPosition(-w / 2 + padX + r * 2 + 6, -h / 2);
  return scene.add.container(x, y, [g, text]);
}

/** Where the map's places are, in room tiles, and the legend's words for each. */
export interface MapPlace {
  kind: PlaceKind;
  at: Vec2;
  label: string;
}

/** The legend's row height, in points. */
const LEGEND_ROW = 22;

/** The mini map: the walkable streets, the places' pictures, classmates as small dots and you as a bright one. */
export class TownMiniMap {
  private readonly box: Phaser.GameObjects.Container;
  private readonly dots: Phaser.GameObjects.Graphics;
  private readonly me: Phaser.GameObjects.Graphics;
  private cell = 3;
  private rect = new Phaser.Geom.Rectangle();
  private base: Phaser.GameObjects.Graphics | null = null;
  private legend: Phaser.GameObjects.GameObject[] = [];
  /** Screen rectangles a tap can pick: each place's picture and its legend row. */
  private hitAreas: { kind: PlaceKind; rect: Phaser.Geom.Rectangle }[] = [];
  private iconR = 7;
  private origin = { x: 0, y: 0 };
  /** The place Sensei calls you to (a pulsing ring on its picture), or null. */
  private calling: PlaceKind | null = null;
  private readonly ring: Phaser.GameObjects.Graphics;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly room: Room,
    private readonly places: readonly MapPlace[],
    /** The first room row shown (the rows above are hills and sky). */
    private readonly topRow: number,
  ) {
    this.box = scene.add.container(0, 0).setDepth(45);
    this.dots = scene.add.graphics();
    this.me = scene.add.graphics();
    this.ring = scene.add.graphics();
    this.layout(8, 8, 150);
  }

  /** Draws the map with its top-left corner at (x, y), `w` pixels wide. */
  layout(x: number, y: number, w: number): void {
    const s = this.scene;
    const cols = this.room.width;
    const rows = this.room.height - this.topRow;
    this.cell = w / cols;
    const h = rows * this.cell;
    const legendH = this.places.length * LEGEND_ROW + 4;
    this.rect.setTo(x - 4, y - 4, w + 8, h + 8 + legendH);
    this.origin = { x, y };
    // Only the old base picture and legend go; the dots are kept and moved on top again.
    this.base?.destroy();
    for (const o of this.legend) o.destroy();
    this.legend = [];
    this.hitAreas = [];
    this.box.setPosition(x, y);
    const g = s.add.graphics();
    this.base = g;
    g.fillStyle(0x0a0810, 0.72).fillRoundedRect(-4, -4, w + 8, h + 8 + legendH, 8);
    g.lineStyle(2, 0xffd166, 0.7).strokeRoundedRect(-4, -4, w + 8, h + 8 + legendH, 8);
    g.lineStyle(1, 0xffd166, 0.35).lineBetween(0, h + 4, w, h + 4);
    // The ground you can walk on, lighter; buildings and walls stay dark.
    g.fillStyle(0xc9b88f, 0.85);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) if (!this.room.walls[r + this.topRow]?.[c]) g.fillRect(c * this.cell, r * this.cell, this.cell + 0.4, this.cell + 0.4);
    const iconR = Math.max(7, this.cell * 2.4);
    this.iconR = iconR;
    for (const p of this.places) {
      const px = p.at.x * this.cell;
      const py = (p.at.y - this.topRow) * this.cell;
      drawPlaceIcon(g, p.kind, px, py, iconR);
      const r = iconR * 1.6;
      this.hitAreas.push({ kind: p.kind, rect: new Phaser.Geom.Rectangle(x + px - r, y + py - r, r * 2, r * 2) });
    }
    // The legend: each place's picture and its name, one row each. A tap on a row walks there too.
    const lr = 7;
    this.places.forEach((p, i) => {
      const cy = h + 8 + i * LEGEND_ROW + LEGEND_ROW / 2;
      drawPlaceIcon(g, p.kind, lr + 1, cy, lr);
      const t = s.add
        .text(lr * 2 + 7, cy, p.label, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${TYPE.label}px`, color: '#fff6e0', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0, 0.5)
        .setResolution(crisp() * 2);
      // Long words shrink to fit the map's width rather than spill past it.
      if (t.width > w - lr * 2 - 7) t.setScale((w - lr * 2 - 7) / t.width);
      this.legend.push(t);
      this.hitAreas.push({ kind: p.kind, rect: new Phaser.Geom.Rectangle(x - 4, y + cy - LEGEND_ROW / 2, w + 8, LEGEND_ROW) });
    });
    this.box.add(g);
    this.box.sendToBack(g);
    this.box.add([...this.legend, this.ring, this.dots, this.me]);
    this.box.bringToTop(this.me);
  }

  /** The place under a screen point (its picture or its legend row), or null. */
  placeAt(x: number, y: number): PlaceKind | null {
    // Legend rows first (they never overlap), then the nearest picture on the map.
    let best: PlaceKind | null = null;
    let bestD = Infinity;
    for (const a of this.hitAreas) {
      if (!a.rect.contains(x, y)) continue;
      const d = Phaser.Math.Distance.Between(x, y, a.rect.centerX, a.rect.centerY);
      if (d < bestD) {
        best = a.kind;
        bestD = d;
      }
    }
    return best;
  }

  /** Sensei calls the student to this place: its picture on the map gets a pulsing gold ring. Null stops it. */
  call(kind: PlaceKind | null): void {
    this.calling = kind;
    if (!kind) this.ring.clear();
  }

  /** A short gold flash on a picked place, so the tap feels answered. */
  flash(kind: PlaceKind): void {
    const p = this.places.find((q) => q.kind === kind);
    if (!p) return;
    const f = this.scene.add.graphics();
    f.lineStyle(3, 0xffffff, 1).strokeCircle(p.at.x * this.cell, (p.at.y - this.topRow) * this.cell, this.iconR + 3);
    this.box.add(f);
    this.scene.tweens.add({ targets: f, alpha: 0, duration: 450, onComplete: () => f.destroy() });
  }

  /** The screen point of a place's picture (for pointers drawn outside the map). */
  screenOf(kind: PlaceKind): Vec2 | null {
    const p = this.places.find((q) => q.kind === kind);
    return p ? { x: this.origin.x + p.at.x * this.cell, y: this.origin.y + (p.at.y - this.topRow) * this.cell } : null;
  }

  /** The bottom edge of the map and legend, in screen points. */
  bottom(): number {
    return this.rect.bottom;
  }

  /** Moves the dots: you (bright, outlined) and the classmates in town (small and grey). */
  update(me: Vec2, others: readonly Vec2[], now: number): void {
    const c = this.cell;
    this.dots.clear().fillStyle(0xe8e2f2, 0.95);
    for (const o of others) this.dots.fillCircle(o.x * c, (o.y - this.topRow) * c, Math.max(1.6, c * 0.7));
    const pulse = 1 + 0.18 * Math.sin(now / 220);
    const r = Math.max(2.6, c * 1.05) * pulse;
    const called = this.calling ? this.places.find((q) => q.kind === this.calling) : null;
    if (called) {
      const k = reducedMotion() ? 1 : 0.5 + 0.5 * Math.sin(now / 260);
      this.ring.clear().lineStyle(2.5, 0xffd166, 0.55 + 0.45 * k).strokeCircle(called.at.x * c, (called.at.y - this.topRow) * c, this.iconR + 3 + k * 3);
    }
    this.me.clear().fillStyle(0x14121c, 1).fillCircle(me.x * c, (me.y - this.topRow) * c, r + 1.6).fillStyle(0xffffff, 1).fillCircle(me.x * c, (me.y - this.topRow) * c, r);
  }

  /** True for a screen point on the map or its legend (the tap belongs to the map, not tap-to-move). */
  contains(x: number, y: number): boolean {
    return this.rect.contains(x, y);
  }

  setVisible(on: boolean): void {
    this.box.setVisible(on);
  }

  destroy(): void {
    this.box.destroy();
  }
}
