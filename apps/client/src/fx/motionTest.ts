import { testFlags } from '../game/beta';

/**
 * MOTION TEST (Jay, Nov 26: "build it"). A throwaway try-out of livelier enemy movement, drawn on top of the
 * existing sprites. Visual only: nothing here touches the rules package, hit areas or timings, so every warning
 * still matches the real attack. On only with `?motion=new` in the address, so the same link without it shows
 * today's movement for a side-by-side check. Reduced motion turns it all off.
 */

export function motionTestOn(): boolean {
  return testFlags().get('motion') === 'new';
}

/** How the body is pushed and squashed this frame: offset in tiles (along the ground), scale multipliers. */
export interface Pose {
  dx: number;
  dy: number;
  sx: number;
  sy: number;
}

export const REST: Pose = { dx: 0, dy: 0, sx: 1, sy: 1 };

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
/** A spring that settles: 1 at t=0, wobbles past 0 and dies away. */
const spring = (t: number, wobbles = 2) => Math.cos(t * Math.PI * wobbles) * (1 - t) * (1 - t);

/**
 * Wind-up (anticipation): the creature leans BACK from where it will strike and crouches wide, building up
 * through the wind-up. In the Counter window it holds the coiled pose and shivers, ready to spring.
 * `fx, fy` = the direction it will strike (unit vector).
 */
export function windupPose(progress: number, inWindow: boolean, fx: number, fy: number, now: number): Pose {
  const p = easeOut(clamp01(progress));
  const back = 0.24 * p;
  const shiver = inWindow ? Math.sin(now / 28) * 0.025 : 0;
  return {
    dx: -fx * back + shiver,
    dy: -fy * back * 0.6,
    sx: 1 + 0.18 * p,
    sy: 1 - 0.15 * p,
  };
}

/** How long the lunge and its settle last, in milliseconds. */
export const LUNGE_MS = 420;

/**
 * The attack (follow-through): a fast snap forward with a tall stretch, a squash as it lands, then it springs
 * back to where it really stands. `ms` = time since the attack landed.
 */
export function attackPose(ms: number, fx: number, fy: number): Pose {
  if (ms >= LUNGE_MS) return REST;
  const snap = 70;
  let reach: number;
  let sx: number;
  let sy: number;
  if (ms < snap) {
    const t = ms / snap;
    reach = 0.5 * easeOut(t);
    sx = 1 - 0.14 * t;
    sy = 1 + 0.2 * t;
  } else {
    const t = (ms - snap) / (LUNGE_MS - snap);
    reach = 0.5 * (1 - easeOut(t));
    const w = spring(t, 2.5);
    sx = 1 + 0.18 * w;
    sy = 1 - 0.16 * w;
  }
  return { dx: fx * reach, dy: fy * reach * 0.6, sx, sy };
}

export const HIT_MS = 300;

/**
 * Taking a hit: knocked back away from the hero, squashed flat by the blow, then it wobbles back into shape.
 * `ax, ay` = direction away from the hero (unit vector). Heavy hits push further.
 */
export function hitPose(ms: number, ax: number, ay: number, heavy: boolean): Pose {
  if (ms >= HIT_MS) return REST;
  const t = ms / HIT_MS;
  const push = (heavy ? 0.3 : 0.14) * (t < 0.15 ? easeOut(t / 0.15) : 1 - easeOut((t - 0.15) / 0.85));
  const w = spring(t, 3);
  const amt = heavy ? 0.24 : 0.14;
  return { dx: ax * push, dy: ay * push * 0.6, sx: 1 + amt * w, sy: 1 - amt * w };
}

/** Idle breathing so a standing creature never looks frozen. `seed` keeps neighbours out of step. */
export function breathePose(now: number, seed: number): Pose {
  const b = Math.sin(now / 420 + seed) * 0.03;
  return { dx: 0, dy: 0, sx: 1 - b * 0.5, sy: 1 + b };
}

/** Walking bounce: a little hop and squash each step. `speed` in tiles per second. */
export function walkPose(now: number, seed: number, speed: number): Pose {
  const phase = Math.abs(Math.sin(now / 110 + seed));
  const k = Math.min(1, speed / 2);
  return { dx: 0, dy: -0.12 * phase * k, sx: 1 + 0.08 * (1 - phase) * k, sy: 1 - 0.08 * (1 - phase) * k };
}

/** Two poses together (offsets add, scales multiply). */
export function combine(a: Pose, b: Pose): Pose {
  return { dx: a.dx + b.dx, dy: a.dy + b.dy, sx: a.sx * b.sx, sy: a.sy * b.sy };
}

/** A unit vector, or (0, 1) when there's no direction. */
export function unit(x: number, y: number): { x: number; y: number } {
  const l = Math.hypot(x, y);
  return l > 1e-6 ? { x: x / l, y: y / l } : { x: 0, y: 1 };
}
