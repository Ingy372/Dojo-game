// LP-B4b: draws the shop effects from their recipes, with shapes drawn in code (no art files).
// Every particle fades once (no flashing) and is removed when it ends.
import Phaser from 'phaser';
import type { FxRecipe, FxShape } from '@dojo/sim';
import { reducedMotion } from '../game/motion';
import { planFx, type FxParticle } from './plan';

export interface FxPlace {
  /** Pixels per tile where it plays. */
  tile: number;
  depth: number;
  /** Puts a new object where it belongs (for example, only on the world camera). */
  add?: (o: Phaser.GameObjects.Graphics) => void;
}

const hex = (c: string) => parseInt(c.slice(1), 16);

/** One shape, centred on 0,0, about r pixels from the middle to the edge. */
export function drawShape(g: Phaser.GameObjects.Graphics, shape: FxShape, r: number, color: number): void {
  const star = (points: number, inner: number) => {
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const d = i % 2 ? r * inner : r;
      pts.push(new Phaser.Math.Vector2(Math.cos(a) * d, Math.sin(a) * d));
    }
    g.fillStyle(color).fillPoints(pts, true);
  };
  switch (shape) {
    case 'petal':
      g.fillStyle(color).fillEllipse(0, 0, r * 1.2, r * 2);
      break;
    case 'leaf':
      g.fillStyle(color).fillEllipse(0, 0, r * 1.1, r * 2.1);
      g.lineStyle(Math.max(1, r * 0.18), 0x000000, 0.25).lineBetween(0, -r, 0, r);
      break;
    case 'ink':
      g.lineStyle(r * 0.7, color, 0.9).lineBetween(-r, r * 0.3, r, -r * 0.3);
      break;
    case 'star':
      star(5, 0.45);
      break;
    case 'sparkle':
      star(4, 0.3);
      break;
    case 'bubble':
      g.lineStyle(Math.max(1.5, r * 0.22), color, 0.95).strokeCircle(0, 0, r);
      g.fillStyle(0xffffff, 0.8).fillCircle(-r * 0.35, -r * 0.35, r * 0.25);
      break;
    case 'confetti':
      g.fillStyle(color).fillRect(-r * 0.6, -r * 0.35, r * 1.2, r * 0.7);
      break;
    case 'dot':
      g.fillStyle(color, 0.35).fillCircle(0, 0, r * 1.6);
      g.fillStyle(color).fillCircle(0, 0, r * 0.8);
      break;
    case 'ribbon': {
      const pts = Array.from({ length: 9 }, (_, i) => new Phaser.Math.Vector2(-r + (i / 8) * 2 * r, Math.sin((i / 8) * Math.PI * 2) * r * 0.35));
      g.lineStyle(Math.max(2, r * 0.35), color).strokePoints(pts);
      break;
    }
    case 'heart':
      g.fillStyle(color).fillCircle(-r * 0.45, -r * 0.2, r * 0.5).fillCircle(r * 0.45, -r * 0.2, r * 0.5);
      g.fillTriangle(-r * 0.92, 0, r * 0.92, 0, 0, r * 0.95);
      break;
    case 'puff':
      g.fillStyle(color, 0.75).fillCircle(-r * 0.4, r * 0.1, r * 0.6).fillCircle(r * 0.4, r * 0.1, r * 0.6).fillCircle(0, -r * 0.3, r * 0.7);
      break;
    case 'blob':
      g.fillStyle(color).fillCircle(0, 0, r * 0.75).fillCircle(r * 0.6, r * 0.4, r * 0.35).fillCircle(-r * 0.5, r * 0.55, r * 0.25);
      break;
    case 'ring':
      g.lineStyle(Math.max(2, r * 0.18), color, 0.9).strokeCircle(0, 0, r);
      break;
    case 'spark':
      g.lineStyle(Math.max(1.5, r * 0.25), color).lineBetween(-r, 0, r, 0);
      break;
    case 'lantern':
      g.fillStyle(color).fillRoundedRect(-r * 0.6, -r * 0.8, r * 1.2, r * 1.6, r * 0.4);
      g.fillStyle(0xfff1b8, 0.8).fillRoundedRect(-r * 0.3, -r * 0.45, r * 0.6, r * 0.9, r * 0.2);
      g.fillStyle(0x5a3a22).fillRect(-r * 0.35, -r * 0.95, r * 0.7, r * 0.2).fillRect(-r * 0.35, r * 0.75, r * 0.7, r * 0.2);
      break;
    case 'firework':
      g.fillStyle(color).fillCircle(0, 0, r * 0.2);
      g.lineStyle(Math.max(1.5, r * 0.12), color);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.lineBetween(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, Math.cos(a) * r, Math.sin(a) * r);
      }
      break;
  }
}

function spawn(scene: Phaser.Scene, f: FxRecipe, p: FxParticle, x: number, y: number, at: FxPlace, done?: () => void): void {
  const g = scene.add.graphics({ x: x + p.x0 * at.tile, y: y + p.y0 * at.tile }).setDepth(at.depth).setName('fx');
  drawShape(g, f.shape, f.size * at.tile, hex(p.color));
  at.add?.(g);
  const end = () => {
    g.destroy();
    done?.();
  };
  if (p.still) {
    scene.time.delayedCall(p.lifeMs, end);
    return;
  }
  if (p.delayMs > 0) g.setVisible(false);
  scene.tweens.add({
    targets: g,
    x: x + p.x1 * at.tile,
    y: y + p.y1 * at.tile,
    rotation: p.spin,
    alpha: 0,
    scale: f.motion === 'burst' ? 0.6 : 0.85,
    delay: p.delayMs,
    duration: p.lifeMs,
    ease: f.motion === 'burst' ? 'Cubic.Out' : 'Sine.InOut',
    onStart: () => g.setVisible(true),
    onComplete: end,
  });
}

/** Plays a puff, hit pop or win burst once at x, y (pixels). */
export function playFx(scene: Phaser.Scene, f: FxRecipe, x: number, y: number, at: FxPlace): void {
  for (const p of planFx(f, reducedMotion())) spawn(scene, f, p, x, y, at);
}

/** A walk trail: call step() with the feet's spot each frame; it drops a particle every little way. */
export class TrailEmitter {
  private alive = 0;
  private last: { x: number; y: number } | null = null;
  private readonly reduced = reducedMotion();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly f: FxRecipe,
    private readonly at: FxPlace,
  ) {}

  step(x: number, y: number): void {
    if (this.reduced) return;
    if (this.last && Math.hypot(x - this.last.x, y - this.last.y) < this.at.tile * 0.3) return;
    const first = !this.last;
    this.last = { x, y };
    if (first || this.alive >= this.f.count) return;
    for (const p of planFx(this.f, false)) {
      this.alive++;
      spawn(this.scene, this.f, p, x, y, this.at, () => this.alive--);
    }
  }
}
