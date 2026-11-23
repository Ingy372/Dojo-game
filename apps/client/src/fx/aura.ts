// Visual overhaul (Nov 22): auras from the shop. A soft glowing ring under the hero's feet with a few motes in the
// aura's style (flames, frost, leaves, sparks...). Drawn in code from the recipe, at the shop effects' depth, so it is
// always under a fight's danger marks. Looks only: it never changes a fight. Reduced motion: a still ring.
import Phaser from 'phaser';
import type { AuraRecipe } from '@dojo/sim';
import { reducedMotion } from '../game/motion';
import { drawShape } from './shopFx';

const hex = (c: string) => parseInt(c.slice(1), 16);

export interface AuraPlace {
  /** Pixels per tile. */
  tile: number;
  depth: number;
  add?: (o: Phaser.GameObjects.Graphics) => void;
}

/** Deterministic little hash so each mote has its own phase without Math.random flicker. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export class AuraFx {
  readonly g: Phaser.GameObjects.Graphics;
  private readonly cols: number[];
  private readonly still = reducedMotion();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly recipe: AuraRecipe,
    private readonly place: AuraPlace,
  ) {
    this.cols = recipe.colors.map(hex);
    this.g = scene.add.graphics().setDepth(place.depth);
    place.add?.(this.g);
  }

  /** Draws the aura around feet at (x, y) in pixels; call every frame. */
  draw(x: number, y: number, timeMs = this.scene.time.now): void {
    const g = this.g;
    g.clear();
    const { tile } = this.place;
    const r = this.recipe;
    const w = r.size * tile;
    const h = w * 0.42;
    const t = this.still ? 0 : timeMs / 1000;
    const c0 = this.cols[0];
    const c1 = this.cols[1] ?? c0;
    const pulse = 0.75 + 0.25 * Math.sin(t * 3);
    // the glow on the floor
    g.fillStyle(c0, 0.16 * pulse).fillEllipse(x, y, w, h);
    g.fillStyle(c1, 0.12 * pulse).fillEllipse(x, y, w * 0.62, h * 0.62);
    if (r.style === 'rainbow') {
      const n = this.cols.length * 3;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 + t * 0.8;
        g.lineStyle(Math.max(2, tile * 0.035), this.cols[i % this.cols.length], 0.85);
        g.beginPath();
        for (let k = 0; k <= 6; k++) {
          const a = a0 + (k / 6) * ((Math.PI * 2) / n) * 0.8;
          const px = x + Math.cos(a) * w * 0.5;
          const py = y + Math.sin(a) * h * 0.5;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.strokePath();
      }
    } else {
      g.lineStyle(Math.max(2, tile * 0.03), c0, 0.7 * pulse).strokeEllipse(x, y, w, h);
      g.lineStyle(Math.max(1, tile * 0.015), c1, 0.55).strokeEllipse(x, y, w * 0.8, h * 0.8);
    }
    if (r.style === 'water') {
      for (let i = 0; i < 3; i++) {
        const k = ((t * 0.6 + i / 3) % 1 + 1) % 1;
        g.lineStyle(Math.max(1, tile * 0.02), c1, 0.6 * (1 - k)).strokeEllipse(x, y, w * (0.3 + k * 0.9), h * (0.3 + k * 0.9));
      }
    }
    if (this.still) return;
    const motes = r.motes;
    for (let i = 0; i < motes; i++) {
      const ph = rnd(i, 1);
      const col = this.cols[i % this.cols.length];
      const size = tile * (0.035 + rnd(i, 2) * 0.03);
      switch (r.style) {
        case 'flame':
        case 'gold':
        case 'smoke':
        case 'spark': {
          // rise from the ring and fade
          const life = r.style === 'smoke' ? 1.6 : 1.1;
          const k = ((t / life + ph) % 1 + 1) % 1;
          const a = rnd(i, 3) * Math.PI * 2;
          const px = x + Math.cos(a) * w * 0.45 * (1 - k * 0.3);
          const py = y + Math.sin(a) * h * 0.45 - k * tile * (r.style === 'gold' ? 1.1 : 0.7);
          const alpha = Math.sin(k * Math.PI);
          if (r.style === 'flame') {
            g.fillStyle(col, alpha).fillTriangle(px - size, py, px + size, py, px, py - size * 3 * (1 - k * 0.5));
          } else if (r.style === 'smoke') {
            g.fillStyle(col, alpha * 0.45).fillCircle(px, py, size * (1.5 + k * 2));
          } else if (r.style === 'spark') {
            if (Math.sin(t * 20 + i * 3) > 0.2) {
              g.lineStyle(Math.max(1.5, tile * 0.02), col, alpha);
              g.lineBetween(px, py, px + size * 1.5, py - size * 2);
              g.lineBetween(px + size * 1.5, py - size * 2, px - size * 0.5, py - size * 3.5);
            }
          } else {
            g.fillStyle(col, alpha).fillCircle(px, py, size * 0.8);
            g.fillStyle(0xffffff, alpha * 0.7).fillCircle(px, py, size * 0.35);
          }
          break;
        }
        default: {
          // orbit around the hero (frost, leaf, petal, star): a ring that rises and falls a little
          const a = ph * Math.PI * 2 + t * (0.9 + rnd(i, 4) * 0.5);
          const lift = tile * (0.15 + 0.35 * rnd(i, 5) + 0.08 * Math.sin(t * 2 + i));
          const px = x + Math.cos(a) * w * 0.55;
          const py = y + Math.sin(a) * h * 0.55 - lift;
          const shape = r.style === 'frost' ? 'sparkle' : r.style === 'leaf' ? 'leaf' : r.style === 'petal' ? 'petal' : 'star';
          g.save();
          g.translateCanvas(px, py);
          g.rotateCanvas(a + t);
          drawShape(g, shape, size, col);
          g.restore();
        }
      }
    }
  }

  destroy(): void {
    this.g.destroy();
  }
}
