// The fight's small visual effects ("juice"), drawn in code: the set-free light, sparks, rings, the dash trail,
// the shield glow, the Focus pop and the chest's charge-up. Moved out of GameScene (Nov 24 night) with no change
// to what they draw. Everything here is drawing only; the fight rules never read it.
import Phaser from 'phaser';
import { COMBAT, MOVEMENT, type Vec2 } from '@dojo/sim';
import { reducedMotion } from '../game/motion';
import { crisp, view } from '../ui/theme';

/** The gold of the fight's highlights (GameScene's COLORS.gold). */
const GOLD = 0xffd166;
/** B-MASHER-a shield-bounce glow: soft gold, 0.4 s. */
export const SHIELD_GLOW_COLOR = 0xf2c75c;
export const SHIELD_GLOW_MS = 400;

export class FightFx {
  /**
   * @param scene the fight scene the effects play in
   * @param tile pixels per tile
   * @param addWorld puts an object on the world camera only (not the screen camera)
   */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly tile: number,
    private readonly addWorld: <T extends Phaser.GameObjects.GameObject>(obj: T) => T,
  ) {}

  ring(at: Vec2, color: number, radiusTiles: number, alpha = 0.9): void {
    const c = this.addWorld(this.scene.add.circle(at.x * this.tile, at.y * this.tile, radiusTiles * this.tile).setStrokeStyle(5, color, alpha).setDepth(9));
    c.setScale(0.3);
    this.scene.tweens.add({ targets: c, scale: 1, alpha: 0, duration: 300, ease: 'Cubic.Out', onComplete: () => c.destroy() });
  }

  /** A soft round glow (white in the middle, fading out), made once and reused. */
  softGlow(): string {
    const key = 'fx-soft-glow';
    if (!this.scene.textures.exists(key)) {
      const tex = this.scene.textures.createCanvas(key, 64, 64)!;
      const ctx = tex.getContext();
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.45, 'rgba(255,255,255,0.8)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      tex.refresh();
    }
    return key;
  }

  /**
   * A beaten creature is "set free": a soft golden flash, its dissolve into light (drawn
   * glowing), and a few sparkles drifting up. Short and light, so the fight stays readable.
   */
  setFree(at: Vec2, boss: boolean): void {
    const x = at.x * this.tile;
    const y = at.y * this.tile;
    const size = boss ? 1.6 : 1;
    // No golden flash with reduced motion (K12).
    if (!reducedMotion()) {
      // A warm golden flash (normal colours, so it shows on light stone as well as dark floors).
      const glow = this.addWorld(this.scene.add.image(x, y - this.tile * 0.45, this.softGlow()).setDepth(8));
      glow.setTint(0xffb627).setScale(0.4).setAlpha(1);
      this.scene.tweens.add({ targets: glow, scale: 2.2 * size, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => glow.destroy() });
      const core = this.addWorld(this.scene.add.image(x, y - this.tile * 0.45, this.softGlow()).setDepth(8).setScale(0.3));
      this.scene.tweens.add({ targets: core, scale: 1.1 * size, alpha: 0, duration: 380, ease: 'Cubic.Out', onComplete: () => core.destroy() });
    }
    this.ring({ x: at.x, y: at.y - 0.3 }, 0xffd166, 1.3 * size, 0.9);
    // Little golden stars drift up and fade (none with reduced motion).
    const count = reducedMotion() ? 0 : boss ? 16 : 9;
    for (let i = 0; i < count; i++) {
      const sx = x + (Math.random() - 0.5) * this.tile * 0.9 * size;
      const r = 5 + Math.random() * 4;
      const star = this.addWorld(this.scene.add.star(sx, y - this.tile * (0.2 + Math.random() * 0.5), 4, r * 0.4, r, i % 3 === 0 ? 0xffffff : 0xffe48a));
      star.setStrokeStyle(1.5, 0xc98a1a, 0.9).setDepth(8).setScale(0.4);
      this.scene.tweens.add({ targets: star, scale: 1, duration: 140, delay: i * 25, ease: 'Back.Out' });
      this.scene.tweens.add({
        targets: star,
        y: star.y - this.tile * (0.8 + Math.random() * 0.9) * size,
        x: sx + (Math.random() - 0.5) * this.tile * 0.4,
        angle: (Math.random() - 0.5) * 180,
        alpha: 0,
        delay: i * 25,
        duration: 700 + Math.random() * 350,
        ease: 'Sine.Out',
        onComplete: () => star.destroy(),
      });
    }
  }

  sparks(at: Vec2, count: number, color: number): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = this.tile * (0.5 + Math.random() * 0.7);
      const s = this.addWorld(this.scene.add.circle(at.x * this.tile, at.y * this.tile, 2 + Math.random() * 3, color).setDepth(10));
      this.scene.tweens.add({
        targets: s,
        x: s.x + Math.cos(a) * dist,
        y: s.y + Math.sin(a) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 220 + Math.random() * 160,
        ease: 'Cubic.Out',
        onComplete: () => s.destroy(),
      });
    }
  }

  /** A few fading after-images along the dash. */
  dashTrail(from: Vec2, dir: Vec2): void {
    const r = MOVEMENT.playerRadius * this.tile;
    for (let i = 0; i < 4; i++) {
      const t = i / 4;
      const x = from.x + dir.x * COMBAT.dash.distanceTiles * t;
      const y = from.y + dir.y * COMBAT.dash.distanceTiles * t;
      const ghost = this.addWorld(this.scene.add.circle(x * this.tile, y * this.tile, r, 0x9ad1ff, 0.35).setDepth(3));
      this.scene.tweens.add({ targets: ghost, alpha: 0, scale: 0.6, delay: i * 40, duration: 260, onComplete: () => ghost.destroy() });
    }
  }

  /**
   * B-MASHER-a: a shield bounce gives Focus; a soft gold ring for 0.4 s hints "use your Strike!".
   * Reduced motion: a steady gold tint for the same 0.4 s, with no pulse.
   */
  shieldGlow(at: Vec2, radiusTiles: number): void {
    const r = (radiusTiles + 0.15) * this.tile;
    if (reducedMotion()) {
      const tint = this.addWorld(this.scene.add.circle(at.x * this.tile, at.y * this.tile, r, SHIELD_GLOW_COLOR, 0.3).setStrokeStyle(4, SHIELD_GLOW_COLOR, 0.8).setDepth(9));
      this.scene.time.delayedCall(SHIELD_GLOW_MS, () => tint.destroy());
      return;
    }
    const c = this.addWorld(this.scene.add.circle(at.x * this.tile, at.y * this.tile, r).setStrokeStyle(5, SHIELD_GLOW_COLOR, 0.85).setDepth(9));
    this.scene.tweens.add({ targets: c, scale: { from: 0.9, to: 1.12 }, duration: SHIELD_GLOW_MS / 2, yoyo: true, ease: 'Sine.InOut' });
    this.scene.tweens.add({ targets: c, alpha: { from: 0.95, to: 0 }, duration: SHIELD_GLOW_MS, ease: 'Cubic.In', onComplete: () => c.destroy() });
  }

  /** The elite Focus reward: pops in above the player, holds long enough to read, then floats away. */
  focusPop(at: Vec2, text: string): void {
    const t = this.addWorld(
      this.scene.add
        .text(at.x * this.tile, (at.y - 1.3) * this.tile, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '24px', color: '#cfeaff', stroke: '#14121c', strokeThickness: 6 })
        .setOrigin(0.5)
        .setResolution(crisp())
        .setDepth(12)
        .setScale(0.5),
    );
    this.scene.tweens.add({ targets: t, scale: 1, duration: 180, ease: 'Back.Out' });
    this.scene.tweens.add({ targets: t, y: t.y - 0.6 * this.tile, alpha: 0, delay: 1100, duration: 500, ease: 'Cubic.In', onComplete: () => t.destroy() });
  }

  /** Chest v2: while the chest shakes, the room dims a little and a gold ring closes in on it. */
  chestCharge(at: Vec2, ms: number): void {
    const { width, height } = view(this.scene);
    const dim = this.scene.add.rectangle(0, 0, width, height, 0x0a0810, 0).setOrigin(0).setDepth(5);
    this.scene.cameras.main.ignore(dim);
    this.scene.tweens.add({ targets: dim, alpha: 0.28, duration: ms * 0.8, yoyo: true, hold: ms * 0.2, onComplete: () => dim.destroy() });
    if (reducedMotion()) return;
    const ring = this.addWorld(this.scene.add.circle(at.x * this.tile, at.y * this.tile, this.tile * 2.2).setStrokeStyle(4, GOLD, 0.9).setFillStyle(GOLD, 0.08).setDepth(11));
    this.scene.tweens.add({ targets: ring, scale: 0.25, alpha: 1, duration: ms, ease: 'Quad.In', onComplete: () => ring.destroy() });
  }
}
