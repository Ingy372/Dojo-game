// The town's mini map and the place pictures on its door signs (Jay, Nov 24: "a small mini map I like, and door signs
// and labels are a great idea"). The map only shows where things are and where you are: it never moves the player
// (no Home button: walking past classmates is part of the fun). Drawn in code (placeholder art, waiting on Jay's OK).

import Phaser from 'phaser';
import type { Room, Vec2 } from '@dojo/sim';
import { FONT, crisp } from './theme';

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

/** Where the map's places are, in room tiles. */
export interface MapPlace {
  kind: PlaceKind;
  at: Vec2;
}

/** The mini map: the walkable streets, the places' pictures, classmates as small dots and you as a bright one. */
export class TownMiniMap {
  private readonly box: Phaser.GameObjects.Container;
  private readonly dots: Phaser.GameObjects.Graphics;
  private readonly me: Phaser.GameObjects.Graphics;
  private cell = 3;
  private rect = new Phaser.Geom.Rectangle();
  private base: Phaser.GameObjects.Graphics | null = null;

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
    this.layout(8, 8, 150);
  }

  /** Draws the map with its top-left corner at (x, y), `w` pixels wide. */
  layout(x: number, y: number, w: number): void {
    const s = this.scene;
    const cols = this.room.width;
    const rows = this.room.height - this.topRow;
    this.cell = w / cols;
    const h = rows * this.cell;
    this.rect.setTo(x - 4, y - 4, w + 8, h + 8);
    // Only the old base picture goes; the dots are kept and moved on top again.
    this.base?.destroy();
    this.box.setPosition(x, y);
    const g = s.add.graphics();
    this.base = g;
    g.fillStyle(0x0a0810, 0.72).fillRoundedRect(-4, -4, w + 8, h + 8, 8);
    g.lineStyle(2, 0xffd166, 0.7).strokeRoundedRect(-4, -4, w + 8, h + 8, 8);
    // The ground you can walk on, lighter; buildings and walls stay dark.
    g.fillStyle(0xc9b88f, 0.85);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) if (!this.room.walls[r + this.topRow]?.[c]) g.fillRect(c * this.cell, r * this.cell, this.cell + 0.4, this.cell + 0.4);
    const iconR = Math.max(7, this.cell * 2.4);
    for (const p of this.places) drawPlaceIcon(g, p.kind, p.at.x * this.cell, (p.at.y - this.topRow) * this.cell, iconR);
    this.box.add(g);
    this.box.sendToBack(g);
    this.box.add([this.dots, this.me]);
    this.box.bringToTop(this.me);
  }

  /** Moves the dots: you (bright, outlined) and the classmates in town (small and grey). */
  update(me: Vec2, others: readonly Vec2[], now: number): void {
    const c = this.cell;
    this.dots.clear().fillStyle(0xe8e2f2, 0.95);
    for (const o of others) this.dots.fillCircle(o.x * c, (o.y - this.topRow) * c, Math.max(1.6, c * 0.7));
    const pulse = 1 + 0.18 * Math.sin(now / 220);
    const r = Math.max(2.6, c * 1.05) * pulse;
    this.me.clear().fillStyle(0x14121c, 1).fillCircle(me.x * c, (me.y - this.topRow) * c, r + 1.6).fillStyle(0xffffff, 1).fillCircle(me.x * c, (me.y - this.topRow) * c, r);
  }

  /** True for a screen point on the map (a tap there does nothing, so the hero doesn't walk). */
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
