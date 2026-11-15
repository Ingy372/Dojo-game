// LP-B4b: where each particle of a shop effect goes, as plain numbers (no drawing), so tests
// can check the R-SHOP 3.5 caps. Positions are in tiles from the effect's spot; y grows down.
import type { FxRecipe } from '@dojo/sim';

export interface FxParticle {
  color: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Turn in radians over its life. */
  spin: number;
  delayMs: number;
  lifeMs: number;
  /** Still: drawn once where it is, then removed (Reduced motion). */
  still: boolean;
}

/** Reduced motion: an effect is one still picture for under half a second (R-SHOP 3.5 rule 1). */
export const STILL_MS = 450;
/** Effects draw under enemy warnings (depth 1 in a run), health bars and numbers. */
export const FX_DEPTH = 0.95;

/**
 * The particles for one play. A trail ('drift') plans one particle per step; Reduced motion
 * gives a trail nothing and every other effect half its particles, still, for STILL_MS.
 */
export function planFx(f: FxRecipe, reduced: boolean, rand: () => number = Math.random): FxParticle[] {
  if (reduced && f.motion === 'drift') return [];
  const count = f.motion === 'drift' ? 1 : reduced ? Math.ceil(f.count / 2) : f.count;
  const out: FxParticle[] = [];
  for (let i = 0; i < count; i++) {
    const color = f.colors[i % f.colors.length];
    const jitter = () => rand() - 0.5;
    let p: Omit<FxParticle, 'color' | 'still'>;
    if (f.motion === 'drift') {
      const x0 = jitter() * f.spread;
      p = { x0, y0: jitter() * f.spread * 0.4, x1: x0 + jitter() * 0.3, y1: -0.25 - rand() * 0.15, spin: jitter() * 3, delayMs: 0, lifeMs: f.lifeMs };
    } else if (f.motion === 'burst') {
      const a = ((i + rand() * 0.6) / count) * Math.PI * 2;
      const d = f.spread * (0.6 + rand() * 0.4);
      p = { x0: 0, y0: 0, x1: Math.cos(a) * d, y1: Math.sin(a) * d, spin: jitter() * 2, delayMs: 0, lifeMs: f.lifeMs };
    } else {
      // fall and rise cross the area, started one after another so the last ends by lifeMs.
      const x0 = jitter() * f.spread;
      const delayMs = Math.round((i / count) * f.lifeMs * 0.5);
      const top = -f.spread * 0.6;
      const bottom = f.spread * 0.4;
      const [y0, y1] = f.motion === 'fall' ? [top, bottom] : [bottom, top];
      p = { x0, y0, x1: x0 + jitter() * 0.6, y1, spin: jitter() * 6, delayMs, lifeMs: f.lifeMs - delayMs };
    }
    if (reduced) {
      const mx = (p.x0 + p.x1) / 2;
      const my = (p.y0 + p.y1) / 2;
      out.push({ color, x0: mx, y0: my, x1: mx, y1: my, spin: 0, delayMs: 0, lifeMs: STILL_MS, still: true });
    } else out.push({ ...p, color, still: false });
  }
  return out;
}
