// Star Wall (Jay, Nov 20): the throwing star game at the Action Zone's yellow targets.
// The wall fills the screen: knotty pine with 12 yellow targets, 2 rows of 6, like the real wall.
// Targets light up; tap a glowing one to throw a star at it. Quick hits score more, hits in a row build a
// streak, gold targets are worth extra. 30 seconds a round; the best score is kept. Just for fun: no power,
// no Experience, no items (the rules are in packages/sim/src/starWall.ts).

import Phaser from 'phaser';
import { STAR_WALL, TICKS_PER_SECOND, createRng, hitScore, nextFloat, litTicksAt, pickTargets, streakMultiplier, type Rng } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { loadSave, writeSave } from '../game/save';
import { closeX } from './boardReader';
import { button } from './button';
import { DPR, FONT, crisp, view } from './theme';

const TICK_MS = 1000 / TICKS_PER_SECOND;
const FLIGHT_MS = 150;
/** Shortest time between two throws, so tapping wildly doesn't pay. */
const THROW_GAP_MS = 140;
const PINE = 0xd8a868;
const PINE_DARK = 0xb5854a;
const YELLOW = 0xf6c51c;
const YELLOW_DARK = 0x9c7a08;
const GOLD = 0xffd166;

interface Target {
  index: number;
  x: number;
  y: number;
  /** Half the target's width and height, for taps. */
  hw: number;
  hh: number;
  body: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Arc;
  timer: Phaser.GameObjects.Graphics;
  lit: { at: number; ticks: number; gold: boolean } | null;
}

type Phase = 'ready' | 'countdown' | 'play' | 'done';

export class StarWall {
  private readonly layer: Phaser.GameObjects.Container;
  private readonly stuck: Phaser.GameObjects.Container;
  private readonly fx: Phaser.GameObjects.Container;
  private readonly hud: Phaser.GameObjects.Container;
  private readonly targets: Target[] = [];
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly streakText: Phaser.GameObjects.Text;
  private readonly timeBar: Phaser.GameObjects.Rectangle;
  private readonly timeBack: Phaser.GameObjects.Rectangle;
  private readonly close: Phaser.GameObjects.Container;
  private card: Phaser.GameObjects.Container | null = null;
  private phase: Phase = 'ready';
  private rng: Rng = createRng(1);
  private startMs = 0;
  private nextLight = 0;
  private lastIndex = -1;
  private score = 0;
  private streak = 0;
  private lastThrow = 0;
  private wall = { x0: 0, x1: 0, y0: 0, y1: 0 };
  private closed = false;
  private esc: Phaser.Input.Keyboard.Key | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onClose: () => void,
  ) {
    const { width, height } = view(scene);
    this.layer = scene.add.container(0, 0).setDepth(110);
    const dim = scene.add.rectangle(0, 0, width, height, 0x120c08, 0.94).setOrigin(0).setInteractive();
    this.layer.add(dim);

    // The wall: knotty pine planks in a dark frame.
    const top = 84;
    const bottom = height - 50;
    const side = Math.max(16, (width - (bottom - top) * 2.6) / 2);
    this.wall = { x0: side, x1: width - side, y0: top, y1: bottom };
    this.layer.add(this.drawWall());

    // The targets: 2 rows of 6.
    const cw = (this.wall.x1 - this.wall.x0) / STAR_WALL.cols;
    const ch = (this.wall.y1 - this.wall.y0) / STAR_WALL.rows;
    const s = Math.min(cw * 0.78, ch * 0.62);
    for (let r = 0; r < STAR_WALL.rows; r++) {
      for (let c = 0; c < STAR_WALL.cols; c++) {
        const x = this.wall.x0 + cw * (c + 0.5);
        const y = this.wall.y0 + ch * (r + 0.55);
        const ring = scene.add.circle(x, y, s * 0.78, 0xffffff, 0).setStrokeStyle(5, 0xffffff, 0);
        const timer = scene.add.graphics();
        const body = scene.add.container(x, y, [this.drawTarget(s)]);
        this.layer.add([ring, body, timer]);
        this.targets.push({ index: r * STAR_WALL.cols + c, x, y, hw: s * 0.5, hh: s * 0.62, body, ring, timer, lit: null });
      }
    }
    this.stuck = scene.add.container(0, 0);
    this.fx = scene.add.container(0, 0);
    this.layer.add([this.stuck, this.fx]);

    // Score, streak and time, across the top.
    this.scoreText = scene.add
      .text(width / 2, 8, '0', { fontFamily: FONT, fontStyle: 'bold', fontSize: '30px', color: '#fff6e0', stroke: '#2a1a0c', strokeThickness: 5 })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
    this.streakText = scene.add
      .text(width / 2 + 90, 18, '', { fontFamily: FONT, fontStyle: 'bold', fontSize: '18px', color: '#ffd166', stroke: '#2a1a0c', strokeThickness: 4 })
      .setOrigin(0, 0)
      .setResolution(crisp());
    const title = scene.add
      .text(16, 14, 'STAR WALL', { fontFamily: FONT, fontStyle: 'bold', fontSize: '18px', color: '#ffd166', stroke: '#2a1a0c', strokeThickness: 4 })
      .setResolution(crisp());
    const barW = Math.min(360, width * 0.5);
    this.timeBack = scene.add.rectangle(width / 2 - barW / 2, height - 30, barW, 12, 0x000000, 0.5).setOrigin(0, 0.5).setStrokeStyle(2, 0xffffff, 0.5);
    this.timeBar = scene.add.rectangle(width / 2 - barW / 2, height - 30, barW, 12, 0x7fd4ff).setOrigin(0, 0.5);
    this.hud = scene.add.container(0, 0, [title, this.scoreText, this.streakText, this.timeBack, this.timeBar]);
    this.layer.add(this.hud);

    dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, (p: Phaser.Input.Pointer) => this.tap(p.x / DPR, p.y / DPR));
    this.close = closeX(scene, () => this.exit());
    this.esc = scene.input.keyboard?.addKey('ESC') ?? null;
    this.esc?.on('down', this.exit, this);
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      this.esc?.off('down', this.exit, this);
    });

    this.layer.setAlpha(0);
    scene.tweens.add({ targets: this.layer, alpha: 1, duration: reducedMotion() ? 0 : 180 });
    this.showReady();
  }

  // ---------- drawing ----------

  private drawWall(): Phaser.GameObjects.Graphics {
    const { x0, x1, y0, y1 } = this.wall;
    const g = this.scene.add.graphics();
    g.fillStyle(0x5a3a1e).fillRoundedRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20, 10);
    g.fillStyle(PINE).fillRect(x0, y0, x1 - x0, y1 - y0);
    // Planks run up and down, with a few knots in each (the same knots every time).
    const rng = createRng(42);
    const plank = Math.max(26, (x1 - x0) / 18);
    for (let x = x0; x < x1; x += plank) {
      const shade = 0.06 * nextFloat(rng);
      g.fillStyle(0x000000, shade).fillRect(x, y0, plank, y1 - y0);
      g.lineStyle(2, PINE_DARK, 0.9).lineBetween(x, y0, x, y1);
      for (let k = 0; k < 2; k++) {
        const ky = y0 + (y1 - y0) * nextFloat(rng);
        const kx = x + plank * (0.25 + 0.5 * nextFloat(rng));
        g.fillStyle(0x8a5a2c, 0.8).fillEllipse(kx, ky, plank * 0.32, plank * 0.22);
        g.fillStyle(0x5e3a1a, 0.9).fillEllipse(kx, ky, plank * 0.14, plank * 0.1);
      }
    }
    return g;
  }

  /** A yellow silhouette target (head and shoulders on a post), centred on (0, 0); s = its height. */
  private drawTarget(s: number): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    const head = s * 0.17;
    const draw = (color: number, grow: number) => {
      g.fillStyle(color);
      g.fillCircle(0, -s * 0.3, head + grow);
      g.fillRoundedRect(-s * 0.09 - grow, -s * 0.18, s * 0.18 + grow * 2, s * 0.1, 2);
      g.fillRoundedRect(-s * 0.36 - grow, -s * 0.12 - grow, s * 0.72 + grow * 2, s * 0.5 + grow * 2, { tl: s * 0.16, tr: s * 0.16, bl: 4, br: 4 });
    };
    g.fillStyle(0x000000, 0.25).fillEllipse(s * 0.04, s * 0.44, s * 0.8, s * 0.12);
    draw(YELLOW_DARK, 3);
    draw(YELLOW, 0);
    g.fillStyle(0xffffff, 0.28).fillEllipse(-s * 0.06, -s * 0.36, head * 0.9, head * 0.5);
    g.fillStyle(0x2a2a30).fillRect(-s * 0.4, s * 0.38, s * 0.8, s * 0.07);
    return g;
  }

  /** A four-pointed throwing star. */
  private drawStar(r: number): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const d = i % 2 === 0 ? r : r * 0.32;
      pts.push(new Phaser.Math.Vector2(Math.cos(a) * d, Math.sin(a) * d));
    }
    g.fillStyle(0x2a2e36).fillPoints(pts, true);
    g.fillStyle(0xd8dde6).fillPoints(pts.map((p) => p.clone().scale(0.8)), true);
    g.fillStyle(0x2a2e36).fillCircle(0, 0, r * 0.18);
    return g;
  }

  // ---------- cards ----------

  private showReady(): void {
    this.phase = 'ready';
    const best = loadSave().starWallBest;
    this.showCard('Star Wall', ['Tap the glowing targets', 'as fast as you can!', best > 0 ? `Best: ${best}` : 'Gold targets are worth extra.'], [{ label: 'START', color: 0x277a56, onTap: () => this.countdown() }]);
  }

  private showCard(title: string, lines: string[], buttons: { label: string; color: number; onTap: () => void }[], glow = false): void {
    this.card?.destroy();
    const { width, height } = view(this.scene);
    const w = Math.min(380, width - 40);
    const h = 110 + lines.length * 26 + 60;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    const c = this.scene.add.container(0, 0).setDepth(115);
    const back = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0).setInteractive();
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x221a2e, 0.97).fillRoundedRect(x, y, w, h, 14).lineStyle(3, glow ? GOLD : 0xffffff, glow ? 1 : 0.4).strokeRoundedRect(x, y, w, h, 14);
    const t = this.scene.add
      .text(width / 2, y + 18, title, { fontFamily: FONT, fontStyle: 'bold', fontSize: '28px', color: '#ffd166' })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
    c.add([back, panel, t]);
    lines.forEach((s, i) =>
      c.add(
        this.scene.add
          .text(width / 2, y + 66 + i * 26, s, { fontFamily: FONT, fontStyle: i === lines.length - 1 && glow ? 'bold' : 'normal', fontSize: '18px', color: '#f2e9d8' })
          .setOrigin(0.5, 0)
          .setResolution(crisp()),
      ),
    );
    const bw = buttons.length === 1 ? 160 : (w - 60) / 2;
    buttons.forEach((b, i) => {
      const bx = buttons.length === 1 ? width / 2 - bw / 2 : x + 20 + i * (bw + 20);
      button(this.scene, { x: bx, y: y + h - 64, w: bw, h: 48, label: b.label, color: b.color, size: 20, onTap: b.onTap }, c);
    });
    this.layer.add(c);
    this.card = c;
  }

  private countdown(): void {
    this.card?.destroy();
    this.card = null;
    this.phase = 'countdown';
    this.score = 0;
    this.streak = 0;
    this.scoreText.setText('0');
    this.streakText.setText('');
    this.timeBar.width = this.timeBack.width;
    this.stuck.removeAll(true);
    const { width, height } = view(this.scene);
    const words = ['3', '2', '1', 'Go!'];
    words.forEach((w, i) =>
      this.scene.time.delayedCall(i * 600, () => {
        if (this.closed) return;
        sfx.tap();
        const t = this.scene.add
          .text(width / 2, height / 2, w, { fontFamily: FONT, fontStyle: 'bold', fontSize: '64px', color: '#fff6e0', stroke: '#2a1a0c', strokeThickness: 8 })
          .setOrigin(0.5)
          .setResolution(crisp());
        this.fx.add(t);
        this.scene.tweens.add({ targets: t, scale: { from: 1.4, to: 0.9 }, alpha: { from: 1, to: 0 }, duration: 560, onComplete: () => t.destroy() });
      }),
    );
    this.scene.time.delayedCall(words.length * 600 - 300, () => {
      if (this.closed) return;
      this.rng = createRng((Date.now() & 0x7fffffff) || 1);
      this.startMs = this.scene.time.now;
      this.nextLight = 0;
      this.lastIndex = -1;
      this.phase = 'play';
    });
  }

  private finish(): void {
    this.phase = 'done';
    for (const t of this.targets) this.unlight(t, false);
    const profile = loadSave();
    const best = profile.starWallBest;
    const newBest = this.score > best;
    if (newBest) {
      profile.starWallBest = this.score;
      writeSave(profile);
    }
    sfx.grade(newBest ? 'A' : 'B');
    this.showCard(
      'Time!',
      [`Score: ${this.score}`, newBest ? 'New best!' : `Best: ${Math.max(best, this.score)}`],
      [
        { label: 'Again', color: 0x277a56, onTap: () => this.countdown() },
        { label: 'Done', color: 0x3a3150, onTap: () => this.exit() },
      ],
      newBest,
    );
  }

  private exit(): void {
    if (this.closed) return;
    this.closed = true;
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.esc?.off('down', this.exit, this);
    this.close.destroy();
    this.scene.tweens.add({ targets: this.layer, alpha: 0, duration: reducedMotion() ? 0 : 150, onComplete: () => this.layer.destroy() });
    this.onClose();
  }

  // ---------- the round ----------

  private tick(): number {
    return Math.floor((this.scene.time.now - this.startMs) / TICK_MS);
  }

  private update(): void {
    if (this.phase !== 'play' || this.closed) return;
    const tick = this.tick();
    this.timeBar.width = this.timeBack.width * Math.max(0, 1 - tick / STAR_WALL.roundTicks);
    if (tick >= STAR_WALL.roundTicks) {
      this.finish();
      return;
    }
    let anyLit = false;
    for (const t of this.targets) {
      if (!t.lit) continue;
      const left = t.lit.at + t.lit.ticks - tick;
      if (left <= 0) {
        this.unlight(t, false);
        continue;
      }
      anyLit = true;
      // The ring around a lit target empties as its time runs out.
      t.timer.clear().lineStyle(4, t.lit.gold ? GOLD : 0xffffff, 0.95);
      t.timer.beginPath().arc(t.x, t.y, t.hh * 1.18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (left / t.lit.ticks)).strokePath();
    }
    if (!anyLit && tick >= this.nextLight) {
      for (const p of pickTargets(this.rng, tick, this.lastIndex >= 0 ? [this.lastIndex] : [])) this.light(this.targets[p.index], tick, p.gold);
    }
  }

  private light(t: Target, tick: number, gold: boolean): void {
    t.lit = { at: tick, ticks: litTicksAt(tick), gold };
    this.lastIndex = t.index;
    t.ring.setFillStyle(gold ? GOLD : 0xfff6c8, gold ? 0.45 : 0.32).setStrokeStyle(5, gold ? GOLD : 0xffffff, 0.9).setScale(0.6).setAlpha(1);
    this.scene.tweens.add({ targets: t.ring, scale: 1, duration: 120, ease: 'Back.Out' });
    if (!reducedMotion()) this.scene.tweens.add({ targets: t.body, scale: 1.08, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    sfx.appear();
  }

  private unlight(t: Target, hit: boolean): void {
    if (!t.lit) return;
    t.lit = null;
    t.timer.clear();
    this.scene.tweens.killTweensOf(t.body);
    t.body.setScale(1);
    this.scene.tweens.add({ targets: t.ring, alpha: 0, scale: hit ? 1.4 : 0.8, duration: 180 });
    if (!this.targets.some((o) => o.lit)) this.nextLight = this.tick() + STAR_WALL.gapTicks;
  }

  private tap(x: number, y: number): void {
    if (this.phase !== 'play' || this.closed) return;
    const { x0, x1, y0, y1 } = this.wall;
    if (x < x0 - 10 || x > x1 + 10 || y < y0 - 10 || y > y1 + 10) return;
    const now = this.scene.time.now;
    if (now - this.lastThrow < THROW_GAP_MS) return;
    this.lastThrow = now;
    const tick = this.tick();
    // A tap near a lit target counts for it (fingers are wide), then any target under the finger.
    const near = (t: Target, grow: number) => Math.abs(x - t.x) <= t.hw * grow && Math.abs(y - t.y) <= t.hh * grow;
    const target = this.targets.find((t) => t.lit && near(t, 1.35)) ?? this.targets.find((t) => near(t, 1));
    const hit = !!target?.lit;
    let points = 0;
    if (target && target.lit) {
      this.streak++;
      points = hitScore(tick - target.lit.at, target.lit.ticks, this.streak, target.lit.gold);
      this.score += points;
    } else {
      this.streak = 0;
    }
    const gold = !!target?.lit?.gold;
    if (target && hit) this.unlight(target, true);
    // Where the star lands: on the target's chest for a hit, else where the finger was.
    const land = target && hit ? { x: target.x + Phaser.Math.Between(-6, 6), y: target.y + target.hh * 0.15 + Phaser.Math.Between(-6, 6) } : { x, y };
    this.throwStar(land, () => this.landed(land, target ?? null, hit, points, gold));
  }

  private throwStar(to: { x: number; y: number }, onLand: () => void): void {
    const { width, height } = view(this.scene);
    const star = this.drawStar(16);
    star.setPosition(width / 2, height + 10);
    this.fx.add(star);
    sfx.whoosh();
    this.scene.tweens.add({
      targets: star,
      x: to.x,
      y: to.y,
      rotation: Math.PI * 5,
      scale: { from: 1.5, to: 0.75 },
      duration: reducedMotion() ? 0 : FLIGHT_MS,
      ease: 'Quad.Out',
      onComplete: () => {
        star.destroy();
        onLand();
      },
    });
  }

  private landed(at: { x: number; y: number }, target: Target | null, hit: boolean, points: number, gold: boolean): void {
    if (this.closed) return;
    // The star stays stuck where it landed (the oldest ones fall away after a while).
    const stuck = this.drawStar(12).setPosition(at.x, at.y).setRotation(Math.random() * Math.PI);
    this.stuck.add(stuck);
    if (this.stuck.length > 24) (this.stuck.getAt(0) as Phaser.GameObjects.GameObject).destroy();
    if (hit && target) {
      sfx.hit();
      if (gold) sfx.appear();
      if (!reducedMotion()) {
        this.scene.tweens.add({ targets: target.body, angle: Phaser.Math.Between(-9, 9), y: target.y - 4, duration: 70, yoyo: true, ease: 'Quad.Out', onComplete: () => target.body.setAngle(0).setY(target.y) });
        this.scene.tweens.add({ targets: stuck, angle: stuck.angle + 20, duration: 70, yoyo: true });
      }
      this.sparks(at, gold ? GOLD : 0xffffff, gold ? 14 : 7);
      this.pop(at, `+${points}`, gold ? '#ffd166' : '#ffffff', gold ? 30 : 24);
      this.scoreText.setText(`${this.score}`);
      if (!reducedMotion()) this.scene.tweens.add({ targets: this.scoreText, scale: 1.15, duration: 80, yoyo: true });
    } else {
      sfx.block();
      if (target) this.pop(at, 'Wait for the glow!', '#f2e9d8', 15);
    }
    const m = streakMultiplier(this.streak);
    this.streakText.setText(this.streak >= 2 ? `Streak ${this.streak}${m > 1 ? `  x${m}` : ''}` : '');
  }

  private pop(at: { x: number; y: number }, s: string, color: string, size: number): void {
    const t = this.scene.add
      .text(at.x, at.y - 24, s, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color, stroke: '#2a1a0c', strokeThickness: 5 })
      .setOrigin(0.5)
      .setResolution(crisp());
    this.fx.add(t);
    this.scene.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 700, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private sparks(at: { x: number; y: number }, color: number, count: number): void {
    if (reducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 18 + Math.random() * 26;
      const s = this.scene.add.circle(at.x, at.y, 2 + Math.random() * 2.5, color);
      this.fx.add(s);
      this.scene.tweens.add({ targets: s, x: at.x + Math.cos(a) * d, y: at.y + Math.sin(a) * d, alpha: 0, duration: 260, ease: 'Cubic.Out', onComplete: () => s.destroy() });
    }
  }
}
