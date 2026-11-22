// Kata practice (Jay, Nov 20): stand in the middle of the logo on the Action Zone floor and tap "Kata".
// The menu lists the katas this student has reached (Basic Form 1 at white belt, then one more per belt) with a
// Time Trial switch. Playing: the hero bows in and takes the Open Leg Stance, walking is locked, an arrow pad (left)
// and the kata's technique buttons (right) appear. Tap the direction the hero faces, then the technique. A wrong
// tap gives a gentle buzz and counts as a miss; after two misses on one beat the right button glows. The finish
// is kept small (real promotions get the big celebrations): misses, time if timed, and the bests. No power,
// no Experience, no items (the rules are in packages/sim/src/kataPractice.ts).

import Phaser from 'phaser';
import {
  formatKataTime,
  kataHint,
  kataMoveIds,
  newKataRun,
  tapKataDir,
  tapKataMove,
  type Facing,
  type KataBest,
  type KataDef,
  type KataMoveDef,
  type KataRun,
  type PracticeBeat,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { hasTouch } from '../input/TouchControls';
import { reducedMotion } from '../game/motion';
import { drawBelt, hex, type BeltColors } from './belt';
import { closeX } from './boardReader';
import { button } from './button';
import { FONT, crisp, view } from './theme';

const MARGIN = 22;
const ARROW_R = 33;
const MOVE_W = 132;
const MOVE_H = 54;
const GAP = 10;
const INK = '#fff6e0';
const STROKE = '#14121c';
const GOLD = 0xffd166;
/** Blocks blue, punches red, open-hand strikes purple, kicks orange, escapes green: the same colour for the same family in every kata. */
const FAMILY_COLOR: Record<string, number> = { block: 0x2f6fb5, punch: 0xb8432f, backfist: 0x8a3fb0, spear: 0x8a3fb0, kick: 0xc97a16, break: 0x2a8a6a };

const TIME_TRIAL_KEY = 'dojo.kataTimeTrial';
function savedTimeTrial(): boolean {
  try {
    return localStorage.getItem(TIME_TRIAL_KEY) === '1';
  } catch {
    return false;
  }
}
function saveTimeTrial(on: boolean): void {
  try {
    localStorage.setItem(TIME_TRIAL_KEY, on ? '1' : '0');
  } catch {
    // Private windows: the switch just isn't remembered.
  }
}

const text = (scene: Phaser.Scene, x: number, y: number, s: string, size: number, color = INK): Phaser.GameObjects.Text =>
  scene.add
    .text(x, y, s, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color, stroke: STROKE, strokeThickness: Math.max(3, size / 5), align: 'center' })
    .setResolution(crisp());

function bestLine(b: KataBest | undefined, timeTrial: boolean): string {
  if (!b || b.runs === 0) return 'Not tried yet';
  const parts = [`Fewest misses: ${b.fewestWrong ?? '-'}`];
  if (timeTrial || b.bestMs !== null) parts.push(`Best time: ${b.bestMs !== null ? formatKataTime(b.bestMs) : '-'}`);
  return parts.join('   ');
}

// ---------------------------------------------------------------- the menu

/** The kata picker. Calls `onPick` with the kata and whether the time trial is on, or `onClose`. */
export class KataMenu {
  private readonly layer: Phaser.GameObjects.Container;
  private readonly close: Phaser.GameObjects.Container;
  private timeTrial = savedTimeTrial();
  private done = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly katas: readonly KataDef[],
    /** The belt each kata belongs to (its colour shows on the kata's row). */
    private readonly belts: ReadonlyMap<string, BeltColors | undefined>,
    private readonly bests: Readonly<Record<string, KataBest>>,
    private readonly onPick: (k: KataDef, timeTrial: boolean) => void,
    private readonly onClose: () => void,
  ) {
    this.layer = scene.add.container(0, 0).setDepth(110);
    this.close = closeX(scene, () => this.finish(null));
    this.draw();
    if (!reducedMotion()) scene.tweens.add({ targets: this.layer, alpha: { from: 0, to: 1 }, duration: 180 });
  }

  private draw(): void {
    const s = this.scene;
    this.layer.removeAll(true);
    const { width, height } = view(s);
    this.layer.add(s.add.rectangle(0, 0, width, height, 0x0a0810, 0.82).setOrigin(0).setInteractive());
    const n = this.katas.length;
    const cw = Math.min(width - 2 * MARGIN, 620);
    const cols = n > 2 && cw > 440 ? 2 : 1;
    const rows = Math.ceil(n / cols);
    const HEAD = 86;
    const FOOT = 70;
    const maxCh = height - 2 * MARGIN;
    const rh = Math.max(42, Math.min(58, (maxCh - HEAD - FOOT + GAP) / rows - GAP));
    const ch = Math.min(maxCh, HEAD + rows * (rh + GAP) - GAP + FOOT);
    const x0 = (width - cw) / 2;
    const y0 = (height - ch) / 2;

    // The card: a drop shadow, a lighter header band, a gold frame with a thin inner line and gold corner studs.
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.45).fillRoundedRect(x0 + 3, y0 + 9, cw, ch, 20);
    g.fillStyle(0x1b1429, 0.98).fillRoundedRect(x0, y0, cw, ch, 20);
    g.fillStyle(0x2d2245, 1).fillRoundedRect(x0, y0, cw, HEAD - 10, { tl: 20, tr: 20, bl: 0, br: 0 });
    g.fillStyle(0xffffff, 0.05).fillRoundedRect(x0 + 8, y0 + 6, cw - 16, 24, 12);
    g.lineStyle(3, GOLD, 0.9).strokeRoundedRect(x0, y0, cw, ch, 20);
    g.lineStyle(1, GOLD, 0.35).strokeRoundedRect(x0 + 7, y0 + 7, cw - 14, ch - 14, 14);
    g.lineStyle(1.5, GOLD, 0.45).lineBetween(x0 + 18, y0 + HEAD - 10, x0 + cw - 18, y0 + HEAD - 10);
    for (const [dx, dy] of [
      [x0 + 16, y0 + 16],
      [x0 + cw - 16, y0 + 16],
      [x0 + 16, y0 + ch - 16],
      [x0 + cw - 16, y0 + ch - 16],
    ])
      diamond(g, dx, dy, 4, GOLD, 0.85);
    this.layer.add(g);

    // The title, with a gold flourish on each side.
    const title = text(s, width / 2, y0 + 12, 'Practice Kata', 26, '#ffd166').setOrigin(0.5, 0);
    const fl = s.add.graphics();
    const ty = y0 + 12 + title.height / 2;
    for (const side of [-1, 1]) {
      const a = width / 2 + side * (title.width / 2 + 10);
      const b = a + side * 46;
      fl.lineStyle(2, GOLD, 0.7).lineBetween(a, ty, b, ty);
      diamond(fl, b + side * 5, ty, 5, GOLD, 0.9);
    }
    this.layer.add([fl, title]);
    this.layer.add(text(s, width / 2, y0 + 48, 'Tap the arrow, then the move.', 13, '#d8cdee').setOrigin(0.5, 0));

    const bw = (cw - 36 - (cols - 1) * GAP) / cols;
    this.katas.forEach((k, i) => this.kataRow(k, x0 + 18 + (i % cols) * (bw + GAP), y0 + HEAD + Math.floor(i / cols) * (rh + GAP), bw, rh));
    this.toggle(width / 2, y0 + ch - FOOT / 2 - 4);
  }

  /** One kata: its belt's colour, its name, its length and the bests; tap to play. */
  private kataRow(k: KataDef, x: number, y: number, w: number, h: number): void {
    const s = this.scene;
    const c = s.add.container(x + w / 2, y + h / 2);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.4).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 12);
    g.fillStyle(0x45297a, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.fillStyle(0x6a3fb0, 1).fillRoundedRect(-w / 2, -h / 2, w, h - 4, 12);
    g.fillStyle(0xffffff, 0.13).fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h * 0.38, 9);
    g.lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    // A round badge holding a little belt in this kata's belt colour.
    const bx = -w / 2 + 26;
    g.fillStyle(0x1b1429, 0.85).fillCircle(bx, -2, 18).lineStyle(2, GOLD, 0.7).strokeCircle(bx, -2, 18);
    c.add(g);
    const belt = this.belts.get(k.id);
    if (belt) {
      const bg = s.add.graphics();
      drawBelt(bg, bx, -2, 28, 8, belt, 0);
      // The knot and its two hanging ends.
      bg.fillStyle(hex(belt.color)).fillRect(bx - 4, -7, 8, 10).fillRect(bx - 5, 3, 4, 9).fillRect(bx + 1, 3, 4, 9);
      bg.lineStyle(1.5, 0x14121c).strokeRect(bx - 4, -7, 8, 10).strokeRect(bx - 5, 3, 4, 9).strokeRect(bx + 1, 3, 4, 9);
      c.add(bg);
    }
    const left = -w / 2 + 52;
    const avail = w - 52 - 34;
    const name = text(s, left, -h / 2 + h * 0.34 - 2, k.name, h < 50 ? 16 : 18).setOrigin(0, 0.5);
    const best = this.bests[k.id];
    const parts = [`${k.steps.length} steps`];
    if (!best || best.runs === 0) parts.push('Not tried yet');
    else {
      parts.push(`Fewest misses ${best.fewestWrong ?? '-'}`);
      if (best.bestMs !== null) parts.push(`Best ${formatKataTime(best.bestMs)}`);
    }
    const info = text(s, left, h / 2 - h * 0.28, parts.join('  ·  '), 11, '#e3d9f5').setOrigin(0, 0.5);
    for (const t of [name, info]) if (t.width > avail) t.setScale(avail / t.width);
    c.add([name, info]);
    // A small gold star once the kata has been played with no misses.
    if (best?.fewestWrong === 0) {
      const st = s.add.graphics();
      star(st, w / 2 - 14, -h / 2 + 12, 6, GOLD);
      c.add(st);
    }
    const chev = s.add.graphics().lineStyle(3, INK_NUM, 0.9);
    chev.beginPath().moveTo(w / 2 - 22, -6).lineTo(w / 2 - 15, 1).lineTo(w / 2 - 22, 8).strokePath();
    c.add(chev);
    const zone = s.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (!reducedMotion()) s.tweens.add({ targets: c, scale: 0.96, duration: 70 });
    });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => c.setScale(1));
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      sfx.tap();
      this.finish(k);
    });
    this.layer.add([c, zone]);
  }

  /** The Time Trial switch: a stopwatch, the words, and a slider that turns green when on. */
  private toggle(cx: number, cy: number): void {
    const s = this.scene;
    const on = this.timeTrial;
    const W = 236;
    const H = 46;
    const c = s.add.container(cx, cy);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.4).fillRoundedRect(-W / 2, -H / 2 + 4, W, H, H / 2);
    g.fillStyle(on ? 0x1f5e44 : 0x2c2440, 1).fillRoundedRect(-W / 2, -H / 2, W, H, H / 2);
    g.fillStyle(0xffffff, 0.08).fillRoundedRect(-W / 2 + 6, -H / 2 + 3, W - 12, H * 0.4, H * 0.2);
    g.lineStyle(2, on ? 0x7fe0a8 : GOLD, on ? 0.9 : 0.55).strokeRoundedRect(-W / 2, -H / 2, W, H, H / 2);
    // Stopwatch.
    const sx = -W / 2 + 26;
    g.lineStyle(2.5, 0xfff6e0, 1).strokeCircle(sx, 2, 10);
    g.fillStyle(0xfff6e0, 1).fillRect(sx - 3, -12, 6, 4).fillRect(sx + 7, -9, 3, 3);
    g.lineStyle(2, on ? 0x7fe0a8 : GOLD, 1).lineBetween(sx, 2, sx, -4).lineBetween(sx, 2, sx + 4, 4);
    // The slider.
    const tx = W / 2 - 34;
    g.fillStyle(on ? 0x3ad17f : 0x5a5070, 1).fillRoundedRect(tx - 23, -12, 46, 24, 12);
    g.lineStyle(1.5, 0x14121c, 0.8).strokeRoundedRect(tx - 23, -12, 46, 24, 12);
    g.fillStyle(0x000000, 0.3).fillCircle(tx + (on ? 11 : -11), 2, 10);
    g.fillStyle(0xffffff, 1).fillCircle(tx + (on ? 11 : -11), 0, 10);
    c.add(g);
    c.add(text(s, -W / 2 + 46, 0, 'Time Trial', 17).setOrigin(0, 0.5));
    c.add(text(s, tx - 34, 0, on ? 'ON' : 'OFF', 12, on ? '#7fe0a8' : '#b8acd0').setOrigin(1, 0.5));
    const zone = s.add.zone(cx, cy, W, H + 8).setInteractive({ useHandCursor: true });
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      sfx.tap();
      this.timeTrial = !this.timeTrial;
      saveTimeTrial(this.timeTrial);
      this.draw();
    });
    this.layer.add([c, zone]);
  }

  private finish(k: KataDef | null): void {
    if (this.done) return;
    this.done = true;
    this.close.destroy();
    this.layer.destroy();
    if (k) this.onPick(k, this.timeTrial);
    else this.onClose();
  }
}

const INK_NUM = 0xfff6e0;

function diamond(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number, alpha: number): void {
  g.fillStyle(color, alpha).fillTriangle(x, y - r, x + r, y, x, y + r).fillTriangle(x, y - r, x - r, y, x, y + r);
}

function star(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number): void {
  const pts: Phaser.Types.Math.Vector2Like[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr });
  }
  g.fillStyle(color, 1).fillPoints(pts, true).lineStyle(1.5, 0x14121c, 0.9).strokePoints(pts, true);
}

// ---------------------------------------------------------------- the pad

export interface KataPadHooks {
  /** The right arrow was tapped: the hero turns to face it. */
  face(dir: Facing): void;
  /** A beat was played right: the hero does the move. `index` counts beats from 0. */
  beat(beat: PracticeBeat, move: KataMoveDef, index: number): void;
  /** The last beat was played. The scene bows out, then calls `showResult`. */
  done(wrong: number, ms: number | null): void;
  /** The X: stop practising. */
  quit(): void;
}

interface PadButton {
  key: string;
  box: Phaser.GameObjects.Container;
  glow: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  hw: number;
  hh: number;
  round: boolean;
}

const DIRS: Facing[] = ['F', 'L', 'R', 'B'];
const DIR_KEYS: Record<Facing, string[]> = { F: ['UP', 'W'], B: ['DOWN', 'S'], L: ['LEFT', 'A'], R: ['RIGHT', 'D'] };
const DIR_ANGLE: Record<Facing, number> = { F: -90, B: 90, L: 180, R: 0 };
const NUMBER_KEYS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

export class KataPad {
  private readonly layer: Phaser.GameObjects.Container;
  private readonly hud: Phaser.GameObjects.Container;
  private readonly close: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly stepText: Phaser.GameObjects.Text;
  private readonly missText: Phaser.GameObjects.Text;
  private readonly timeText: Phaser.GameObjects.Text | null;
  private readonly buttons: PadButton[] = [];
  private readonly moves: KataMoveDef[];
  private run: KataRun;
  private startedAt: number | null = null;
  private finishedMs: number | null = null;
  private active = false;
  private card: Phaser.GameObjects.Container | null = null;
  private keyCleanup: Array<() => void> = [];
  /** Screen x of the middle of the open space between the arrow pad and the technique buttons. */
  freeCenterX = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly kata: KataDef,
    allMoves: readonly KataMoveDef[],
    private readonly timeTrial: boolean,
    private readonly hooks: KataPadHooks,
  ) {
    const byId = new Map(allMoves.map((m) => [m.id, m]));
    this.moves = kataMoveIds(kata).map((id) => byId.get(id)!);
    this.run = newKataRun(kata);
    this.layer = scene.add.container(0, 0).setDepth(100).setAlpha(0);
    this.hud = scene.add.container(0, 0).setDepth(100);
    this.title = text(scene, MARGIN, MARGIN - 6, kata.name, 20, '#ffd166');
    this.stepText = text(scene, MARGIN, MARGIN + 20, '', 14);
    this.missText = text(scene, 0, MARGIN - 4, '', 20).setOrigin(0.5, 0);
    this.timeText = timeTrial ? text(scene, 0, MARGIN + 22, '0:00.0', 16, '#7fd4ff').setOrigin(0.5, 0) : null;
    this.hud.add([this.title, this.stepText, this.missText, ...(this.timeText ? [this.timeText] : [])]);
    this.close = closeX(scene, () => this.hooks.quit());
    this.build();
    this.refresh();
    this.bindKeys();
  }

  /** Shows the pad and starts listening to taps (after the bow and the Open Leg Stance). */
  start(): void {
    this.active = true;
    this.scene.tweens.add({ targets: this.layer, alpha: 1, duration: reducedMotion() ? 0 : 200 });
  }

  /** Called every frame: the running clock. */
  update(): void {
    if (this.timeText && this.startedAt !== null && this.finishedMs === null) this.timeText.setText(formatKataTime(this.scene.time.now - this.startedAt));
  }

  /** True for a screen point on any of the pad's controls (so the scene ignores it). */
  contains(x: number, y: number): boolean {
    return this.buttons.some((b) => (b.round ? Math.hypot(x - b.x, y - b.y) <= b.hw + 6 : Math.abs(x - b.x) <= b.hw + 4 && Math.abs(y - b.y) <= b.hh + 4)) || Math.hypot(x - this.close.x, y - this.close.y) < 40;
  }

  destroy(): void {
    this.keyCleanup.forEach((f) => f());
    this.keyCleanup = [];
    this.close.destroy();
    this.card?.destroy();
    this.layer.destroy();
    this.hud.destroy();
  }

  // ---- building

  private build(): void {
    const s = this.scene;
    const { width, height } = view(s);
    this.missText.setX(width / 2);
    this.timeText?.setX(width / 2);
    // The arrow pad: a cross, bottom left.
    const cx = MARGIN + ARROW_R * 3 + 4;
    const cy = height - MARGIN - ARROW_R * 3 - 4;
    const off = ARROW_R * 2 + 6;
    const at: Record<Facing, [number, number]> = { F: [cx, cy - off], B: [cx, cy + off], L: [cx - off, cy], R: [cx + off, cy] };
    for (const d of DIRS) this.addArrow(d, at[d][0], at[d][1]);
    // The technique buttons: columns from the right edge. A small kata gets big buttons; a long one (up to 9
    // techniques) packs them four high and a little smaller, so the hero stays in view between the two pads.
    const n = this.moves.length;
    const big = n <= 3;
    const compact = n > 6;
    const w = big ? MOVE_W + 30 : MOVE_W;
    const h = big ? MOVE_H + 14 : compact ? MOVE_H - 8 : MOVE_H;
    const rowsMax = Math.max(1, Math.min(compact ? 4 : 3, Math.floor((height - 80) / (h + GAP))));
    const cols = Math.ceil(n / rowsMax);
    const rows = Math.ceil(n / cols);
    const padRight = cx + off + ARROW_R;
    const movesLeft = width - MARGIN - cols * w - (cols - 1) * GAP;
    this.freeCenterX = (padRight + movesLeft) / 2;
    this.moves.forEach((m, i) => {
      const c = cols - 1 - Math.floor(i / rows);
      const r = i % rows;
      const x = width - MARGIN - w / 2 - c * (w + GAP);
      const y = height - MARGIN - h / 2 - (rows - 1 - r) * (h + GAP);
      this.addMove(m, i, x, y, w, h);
    });
  }

  private addArrow(d: Facing, x: number, y: number): void {
    const s = this.scene;
    const glow = s.add.graphics().fillStyle(GOLD, 0.55).fillCircle(0, 0, ARROW_R + 9).setVisible(false);
    const face = s.add.graphics();
    face.fillStyle(0x000000, 0.35).fillCircle(0, 4, ARROW_R);
    face.fillStyle(0x3a3150, 0.95).fillCircle(0, 0, ARROW_R).lineStyle(3, 0xffffff, 0.7).strokeCircle(0, 0, ARROW_R);
    face.fillStyle(0xffffff, 0.12).fillEllipse(0, -ARROW_R * 0.45, ARROW_R * 1.3, ARROW_R * 0.6);
    const arrow = s.add.graphics().fillStyle(0xfff6e0, 1);
    const a = ARROW_R * 0.5;
    arrow.fillTriangle(a, 0, -a * 0.55, -a * 0.85, -a * 0.55, a * 0.85).fillRect(-a * 1.05, -a * 0.28, a * 0.7, a * 0.56);
    arrow.setAngle(DIR_ANGLE[d]);
    const box = s.add.container(x, y, [glow, face, arrow]);
    const zone = s.add.zone(x, y, ARROW_R * 2 + 12, ARROW_R * 2 + 12).setInteractive();
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.tapDir(d));
    this.layer.add([box, zone]);
    this.buttons.push({ key: d, box, glow, x, y, hw: ARROW_R, hh: ARROW_R, round: true });
  }

  private addMove(m: KataMoveDef, i: number, x: number, y: number, w: number, h: number): void {
    const s = this.scene;
    const family = m.icon.split('-')[0];
    const color = FAMILY_COLOR[family] ?? FAMILY_COLOR.punch;
    const glow = s.add.graphics().fillStyle(GOLD, 0.55).fillRoundedRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 18).setVisible(false);
    const face = s.add.graphics();
    face.fillStyle(0x000000, 0.35).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 14);
    face.fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 14).lineStyle(3, 0xffffff, 0.75).strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    face.fillStyle(0xffffff, 0.14).fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h * 0.42, 10);
    const iconSize = h * 0.62;
    const icon = drawMoveIcon(s, m.icon, iconSize).setPosition(-w / 2 + iconSize / 2 + 8, 0);
    const label = s.add
      .text(-w / 2 + iconSize + 14, 0, m.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${m.name.length > 12 ? 12 : 15}px`, color: INK, stroke: STROKE, strokeThickness: 3, wordWrap: { width: w - iconSize - 30 } })
      .setOrigin(0, 0.5)
      .setResolution(crisp());
    const parts: Phaser.GameObjects.GameObject[] = [glow, face, icon, label];
    if (!hasTouch() && i < NUMBER_KEYS.length) parts.push(text(s, w / 2 - 10, -h / 2 + 2, String(i + 1), 11).setOrigin(1, 0));
    const box = s.add.container(x, y, parts);
    const zone = s.add.zone(x, y, w + 8, h + 8).setInteractive();
    zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.tapMove(m.id));
    this.layer.add([box, zone]);
    this.buttons.push({ key: m.id, box, glow, x, y, hw: w / 2, hh: h / 2, round: false });
  }

  private bindKeys(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    const on = (name: string, fn: () => void) => {
      const k = kb.addKey(name, true).on('down', fn);
      this.keyCleanup.push(() => k.off('down', fn));
    };
    for (const d of DIRS) for (const k of DIR_KEYS[d]) on(k, () => this.tapDir(d));
    this.moves.forEach((m, i) => {
      if (i < NUMBER_KEYS.length) on(NUMBER_KEYS[i], () => this.tapMove(m.id));
    });
    on('ESC', () => this.hooks.quit());
  }

  // ---- taps

  private tapDir(d: Facing): void {
    if (!this.active) return;
    sfx.unlock();
    this.startClock();
    const r = tapKataDir(this.run, d);
    if (r === 'ok') {
      sfx.kataArrow();
      this.press(d);
      this.hooks.face(d);
    } else if (r === 'wrong') this.miss(d);
    this.refresh();
  }

  private tapMove(id: string): void {
    if (!this.active) return;
    sfx.unlock();
    this.startClock();
    const index = this.run.index;
    const beat = this.run.beats[index];
    const r = tapKataMove(this.run, id);
    if (r === 'need-dir') {
      sfx.kataWrong();
      this.shake(id);
      this.say('Arrow first!');
    } else if (r === 'wrong') this.miss(id);
    else if (r === 'ok') {
      this.press(id);
      sfx.kataRight(index, beat.kiai);
      this.hooks.beat(beat, this.moves.find((m) => m.id === id)!, index);
      if (this.run.index >= this.run.beats.length) this.finish();
    }
    this.refresh();
  }

  private startClock(): void {
    if (this.startedAt === null) this.startedAt = this.scene.time.now;
  }

  private miss(key: string): void {
    sfx.kataWrong();
    this.shake(key);
    if (!reducedMotion()) this.scene.tweens.add({ targets: this.missText, scale: { from: 1.35, to: 1 }, duration: 220, ease: 'Back.Out' });
    this.missText.setColor('#ff9a8a');
    this.scene.time.delayedCall(300, () => this.missText.setColor(INK));
  }

  private finish(): void {
    this.active = false;
    this.finishedMs = this.timeTrial && this.startedAt !== null ? Math.round(this.scene.time.now - this.startedAt) : null;
    if (this.timeText && this.finishedMs !== null) this.timeText.setText(formatKataTime(this.finishedMs));
    this.scene.tweens.add({ targets: this.layer, alpha: 0, duration: reducedMotion() ? 0 : 250, delay: 300 });
    this.scene.time.delayedCall(450, () => this.hooks.done(this.run.wrong, this.finishedMs));
  }

  /** The finish card: misses, the time if timed, and the bests. "Again" plays the same kata. */
  showResult(o: { wrong: number; ms: number | null; best: KataBest; newBestTime: boolean; newFewest: boolean; again: () => void; done: () => void }): void {
    const s = this.scene;
    const { width, height } = view(s);
    const cw = Math.min(380, width - 2 * MARGIN);
    const ch = 220;
    const c = s.add.container(width / 2, height / 2).setDepth(115);
    const g = s.add.graphics();
    g.fillStyle(0x221a33, 0.96).fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 18).lineStyle(3, GOLD, 0.8).strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 18);
    c.add(g);
    c.add(text(s, 0, -ch / 2 + 14, 'Kata complete!', 24, '#ffd166').setOrigin(0.5, 0));
    const lines = [o.wrong === 0 ? 'No misses. Clean form!' : `Misses: ${o.wrong}`];
    if (o.ms !== null) lines.push(`Time: ${formatKataTime(o.ms)}`);
    const bests: string[] = [];
    if (o.newFewest) bests.push('Fewest misses yet!');
    if (o.newBestTime) bests.push('Fastest time yet!');
    lines.push(bests.length ? bests.join('  ') : bestLine(o.best, o.ms !== null));
    lines.forEach((l, i) => c.add(text(s, 0, -ch / 2 + 54 + i * 26, l, i === 2 ? 13 : 17, i === 2 && bests.length ? '#7fe0a8' : INK).setOrigin(0.5, 0)));
    const bw = (cw - 60) / 2;
    button(s, { x: -cw / 2 + 20, y: ch / 2 - 62, w: bw, h: 44, label: 'Again', color: 0x6a3fb0, size: 18, onTap: o.again }, c);
    button(s, { x: cw / 2 - 20 - bw, y: ch / 2 - 62, w: bw, h: 44, label: 'Done', color: 0x3a3150, size: 18, onTap: o.done }, c);
    if (!reducedMotion()) s.tweens.add({ targets: c, scale: { from: 0.8, to: 1 }, alpha: { from: 0, to: 1 }, duration: 220, ease: 'Back.Out' });
    this.card = c;
  }

  // ---- looks

  private refresh(): void {
    const r = this.run;
    const beat = r.beats[Math.min(r.index, r.beats.length - 1)];
    const steps = this.kata.steps.length;
    this.stepText.setText(r.index >= r.beats.length ? `Step ${steps} of ${steps}` : `Step ${beat.step} of ${steps}`);
    this.missText.setText(`Misses: ${r.wrong}`);
    const hint = kataHint(r);
    const glowKey = hint ? ('dir' in hint ? hint.dir : hint.move) : null;
    for (const b of this.buttons) {
      const on = b.key === glowKey || (b.key === r.dir && DIRS.includes(b.key as Facing));
      if (b.glow.visible !== on) {
        b.glow.setVisible(on);
        this.scene.tweens.killTweensOf(b.glow);
        b.glow.setAlpha(1);
        // The hint pulses; the chosen arrow just stays lit.
        if (on && b.key === glowKey && !reducedMotion()) this.scene.tweens.add({ targets: b.glow, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
      }
    }
  }

  private find(key: string): PadButton | undefined {
    return this.buttons.find((b) => b.key === key);
  }

  private press(key: string): void {
    const b = this.find(key);
    if (!b || reducedMotion()) return;
    this.scene.tweens.killTweensOf(b.box);
    b.box.setPosition(b.x, b.y).setScale(1);
    this.scene.tweens.add({ targets: b.box, scale: { from: 0.88, to: 1 }, duration: 160, ease: 'Back.Out' });
  }

  private shake(key: string): void {
    const b = this.find(key);
    if (!b) return;
    this.scene.tweens.killTweensOf(b.box);
    b.box.setPosition(b.x, b.y).setScale(1);
    if (reducedMotion()) return;
    this.scene.tweens.add({ targets: b.box, x: { from: b.x - 6, to: b.x }, duration: 260, ease: 'Elastic.Out', easeParams: [1.5, 0.25] });
  }

  private say(line: string): void {
    const { width, height } = view(this.scene);
    const t = text(this.scene, width / 2, height * 0.3, line, 18).setOrigin(0.5).setDepth(105);
    this.scene.tweens.add({ targets: t, y: t.y - 14, alpha: { from: 1, to: 0 }, delay: 700, duration: 400, onComplete: () => t.destroy() });
  }
}

// ---------------------------------------------------------------- icons

/**
 * Small code-drawn pictures for the technique buttons (placeholders until real icons are drawn): a fist, a foot,
 * a forearm with an arrow for the blocks. `size` is the box they fit in.
 */
export function drawMoveIcon(scene: Phaser.Scene, icon: string, size: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const u = size / 2;
  const white = 0xfff6e0;
  g.fillStyle(0x000000, 0.25).fillCircle(0, 0, u);
  const fist = (x: number, y: number, r: number) => {
    g.fillStyle(white, 1).fillRoundedRect(x - r, y - r * 0.8, r * 2, r * 1.6, r * 0.5);
    g.lineStyle(1.5, 0x5a4030, 0.9);
    for (let i = 1; i < 4; i++) g.lineBetween(x - r + (i * r * 2) / 4, y - r * 0.8, x - r + (i * r * 2) / 4, y - r * 0.2);
  };
  const arrow = (x0: number, y0: number, x1: number, y1: number) => {
    g.lineStyle(3, GOLD, 1).lineBetween(x0, y0, x1, y1);
    const a = Math.atan2(y1 - y0, x1 - x0);
    const h = u * 0.32;
    g.fillStyle(GOLD, 1).fillTriangle(x1 + Math.cos(a) * h * 0.6, y1 + Math.sin(a) * h * 0.6, x1 + Math.cos(a + 2.4) * h, y1 + Math.sin(a + 2.4) * h, x1 + Math.cos(a - 2.4) * h, y1 + Math.sin(a - 2.4) * h);
  };
  const forearm = (x0: number, y0: number, x1: number, y1: number) => g.lineStyle(u * 0.32, white, 1).lineBetween(x0, y0, x1, y1);
  switch (icon) {
    case 'block-low':
      forearm(-u * 0.55, -u * 0.35, u * 0.35, u * 0.25);
      arrow(u * 0.45, -u * 0.5, u * 0.45, u * 0.55);
      break;
    case 'block-inside':
      forearm(-u * 0.15, u * 0.55, -u * 0.15, -u * 0.45);
      arrow(u * 0.6, 0, -u * 0.05, 0);
      break;
    case 'block-high':
      forearm(-u * 0.6, -u * 0.25, u * 0.6, -u * 0.25);
      arrow(0, u * 0.6, 0, -u * 0.05);
      break;
    case 'block-knife':
      forearm(-u * 0.5, u * 0.5, -u * 0.25, -u * 0.5);
      forearm(u * 0.5, u * 0.5, u * 0.25, -u * 0.5);
      break;
    case 'punch-reverse':
      fist(u * 0.2, 0, u * 0.35);
      g.lineStyle(3, GOLD, 1).beginPath().arc(-u * 0.1, 0, u * 0.6, Math.PI * 0.6, Math.PI * 1.35).strokePath();
      break;
    case 'backfist':
      fist(u * 0.15, -u * 0.1, u * 0.35);
      g.lineStyle(3, GOLD, 1).beginPath().arc(u * 0.15, u * 0.2, u * 0.55, Math.PI * 1.1, Math.PI * 1.9).strokePath();
      break;
    case 'kick':
      g.fillStyle(white, 1).fillRoundedRect(-u * 0.6, -u * 0.18, u * 1.0, u * 0.4, u * 0.18).fillRect(-u * 0.6, -u * 0.6, u * 0.36, u * 0.6);
      arrow(u * 0.2, u * 0.45, u * 0.7, u * 0.45);
      break;
    case 'block-reverse-inside':
      forearm(u * 0.15, u * 0.55, u * 0.15, -u * 0.45);
      arrow(-u * 0.6, 0, u * 0.05, 0);
      break;
    case 'spear-hand':
      // A flat open hand, fingers together, thrusting forward.
      g.fillStyle(white, 1).fillRoundedRect(-u * 0.35, -u * 0.2, u * 0.95, u * 0.36, u * 0.14).fillRoundedRect(-u * 0.6, -u * 0.24, u * 0.36, u * 0.44, u * 0.1);
      g.lineStyle(1.5, 0x5a4030, 0.9).lineBetween(-u * 0.05, -u * 0.02, u * 0.55, -u * 0.02);
      arrow(-u * 0.2, u * 0.5, u * 0.65, u * 0.5);
      break;
    case 'break-hold':
      g.lineStyle(u * 0.26, white, 1).beginPath().arc(0, 0, u * 0.55, Math.PI * 1.15, Math.PI * 1.85).strokePath();
      arrow(-u * 0.55, -u * 0.1, -u * 0.55, u * 0.6);
      arrow(u * 0.55, -u * 0.1, u * 0.55, u * 0.6);
      break;
    case 'punch':
    default:
      fist(u * 0.15, 0, u * 0.38);
      g.lineStyle(2.5, GOLD, 1).lineBetween(-u * 0.75, -u * 0.25, -u * 0.35, -u * 0.25).lineBetween(-u * 0.85, 0, -u * 0.35, 0).lineBetween(-u * 0.75, u * 0.25, -u * 0.35, u * 0.25);
      break;
  }
  return g;
}
