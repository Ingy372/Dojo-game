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

/** How the body is pushed and squashed this frame: offset in tiles (along the ground), scale multipliers, tilt in radians. */
export interface Pose {
  dx: number;
  dy: number;
  sx: number;
  sy: number;
  rot: number;
}

export const REST: Pose = { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0 };

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const easeIn = (t: number) => t * t;
/** A spring that settles: 1 at t=0, wobbles past 0 and dies away. */
const spring = (t: number, wobbles = 2) => Math.cos(t * Math.PI * wobbles) * (1 - t) * (1 - t);

/**
 * Jay, Nov 27: every attack is a "reach for the sky and slam down", but each kind of shadow winds up its own way.
 * crouch = how low it dips first; rise = how high it lifts (tiles); stretch = how tall it reaches; tilt = how far it
 * leans back (radians); pumps = bounces on the way up; spin = a wobbling twirl; squash = how flat the slam lands;
 * dust = size of the dust ring.
 */
export interface WindupStyle {
  crouch: number;
  rise: number;
  stretch: number;
  tilt: number;
  pumps: number;
  spin: number;
  squash: number;
  dust: number;
}

/** Heavy: big slow lift, leans back, lands like a boulder. */
const HEAVY: WindupStyle = { crouch: 0.12, rise: 0.42, stretch: 0.22, tilt: 0.18, pumps: 0, spin: 0, squash: 0.32, dust: 1.4 };
/** Hopper: bounces up in little hops, then drops flat. */
const HOPPER: WindupStyle = { crouch: 0.22, rise: 0.55, stretch: 0.3, tilt: 0, pumps: 2, spin: 0, squash: 0.38, dust: 1 };
/** Spinner: floats up with a twirl, then dives. */
const SPINNER: WindupStyle = { crouch: 0.08, rise: 0.4, stretch: 0.15, tilt: 0, pumps: 0, spin: 0.35, squash: 0.25, dust: 0.8 };
/** Reacher: stretches tall and leans far back, then chops down. */
const REACHER: WindupStyle = { crouch: 0.1, rise: 0.3, stretch: 0.35, tilt: 0.28, pumps: 0, spin: 0, squash: 0.28, dust: 1.1 };

const STYLE_BY_ENEMY: Record<string, WindupStyle> = {
  brute: HEAVY,
  'stone-giant': HEAVY,
  'floor-keeper': HEAVY,
  'root-keeper': HEAVY,
  'big-practice-dummy': HEAVY,
  shield: HEAVY,
  bopper: HOPPER,
  doughling: HOPPER,
  'dough-blob': HOPPER,
  swarmer: HOPPER,
  'spool-peg': HOPPER,
  'ladle-lobber': HOPPER,
  'rolling-pin': HOPPER,
  'spark-sprite': SPINNER,
  'storm-herald': SPINNER,
  'river-watcher': SPINNER,
  'lost-lightbearer': SPINNER,
  'echo-mask': SPINNER,
};

export function windupStyle(enemyId: string): WindupStyle {
  return STYLE_BY_ENEMY[enemyId] ?? REACHER;
}

/** The pose at the very top of the reach (where the slam starts). */
function topPose(st: WindupStyle, fx: number, fy: number): Pose {
  return { dx: -fx * 0.1, dy: -st.rise - fy * 0.06, sx: 1 - st.stretch * 0.6, sy: 1 + st.stretch, rot: -fx * st.tilt };
}

/**
 * Wind-up: a quick crouch, then it reaches for the sky (lifts, stretches tall, leans back). In the Counter window it
 * hangs at the top and trembles, ready to slam. `fx, fy` = the direction it will strike (unit vector).
 */
export function windupPose(progress: number, inWindow: boolean, fx: number, fy: number, now: number, st: WindupStyle): Pose {
  const p = clamp01(progress);
  if (p < 0.18) {
    const c = Math.sin((p / 0.18) * Math.PI * 0.5) * st.crouch;
    return { dx: 0, dy: 0, sx: 1 + c, sy: 1 - c, rot: 0 };
  }
  const t = (p - 0.18) / 0.82;
  const top = topPose(st, fx, fy);
  const c = st.crouch * (1 - easeOut(Math.min(1, t * 4)));
  let lift = easeOut(t);
  if (st.pumps > 0) lift = t * (0.55 + 0.45 * Math.abs(Math.cos(t * Math.PI * st.pumps)));
  const tremble = inWindow ? Math.sin(now / 28) : 0;
  const twirl = st.spin * Math.sin(now / 70) * t;
  return {
    dx: top.dx * t + tremble * 0.02,
    dy: top.dy * lift,
    sx: (1 + c) * (1 + (top.sx - 1) * t),
    sy: (1 - c) * (1 + (top.sy - 1) * t),
    rot: top.rot * t + twirl + tremble * 0.03,
  };
}

/** How long the slam and its settle last, and when it hits the floor, in milliseconds. */
export const LUNGE_MS = 460;
export const SLAM_MS = 70;

/**
 * The slam: from the top of the reach it drops hard onto the floor a little forward, squashes flat, then springs back
 * to where it really stands. `ms` = time since the attack landed.
 */
export function attackPose(ms: number, fx: number, fy: number, st: WindupStyle): Pose {
  if (ms >= LUNGE_MS) return REST;
  const top = topPose(st, fx, fy);
  const reach = 0.28;
  if (ms < SLAM_MS) {
    const t = easeIn(ms / SLAM_MS);
    return {
      dx: top.dx + (fx * reach - top.dx) * t,
      dy: top.dy * (1 - t) + fy * reach * 0.6 * t,
      sx: top.sx + (1 - top.sx) * t,
      sy: top.sy + (1 - top.sy) * t,
      rot: top.rot + (fx * st.tilt * 0.4 - top.rot) * t,
    };
  }
  const t = (ms - SLAM_MS) / (LUNGE_MS - SLAM_MS);
  const back = 1 - easeOut(t);
  const w = spring(t, 2.5);
  return {
    dx: fx * reach * back,
    dy: fy * reach * 0.6 * back,
    sx: 1 + st.squash * w,
    sy: 1 - st.squash * w,
    rot: fx * st.tilt * 0.4 * back * w,
  };
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
  return { dx: ax * push, dy: ay * push * 0.6, sx: 1 + amt * w, sy: 1 - amt * w, rot: 0 };
}

/** Idle breathing so a standing creature never looks frozen. `seed` keeps neighbours out of step. */
export function breathePose(now: number, seed: number): Pose {
  const b = Math.sin(now / 420 + seed) * 0.03;
  return { dx: 0, dy: 0, sx: 1 - b * 0.5, sy: 1 + b, rot: 0 };
}

/** Walking bounce: a little hop and squash each step. `speed` in tiles per second. */
export function walkPose(now: number, seed: number, speed: number): Pose {
  const phase = Math.abs(Math.sin(now / 110 + seed));
  const k = Math.min(1, speed / 2);
  return { dx: 0, dy: -0.12 * phase * k, sx: 1 + 0.08 * (1 - phase) * k, sy: 1 - 0.08 * (1 - phase) * k, rot: 0 };
}

/** Two poses together (offsets add, scales multiply). */
export function combine(a: Pose, b: Pose): Pose {
  return { dx: a.dx + b.dx, dy: a.dy + b.dy, sx: a.sx * b.sx, sy: a.sy * b.sy, rot: a.rot + b.rot };
}

/** A unit vector, or (0, 1) when there's no direction. */
export function unit(x: number, y: number): { x: number; y: number } {
  const l = Math.hypot(x, y);
  return l > 1e-6 ? { x: x / l, y: y / l } : { x: 0, y: 1 };
}

/**
 * HERO (Jay, Nov 27: "add more life to just about all of the hero's animations"). Drawn on top of the hero's own
 * animations, the same way as the enemies: a lean into the run, a soft landing squash each step, a skid when he stops,
 * breathing, a stretch on the dash, a pull-back-and-snap on strikes, a flinch when hit and a pop on a Perfect Counter.
 */
export const HERO_STEP_MS = 167; // one footfall (the run loop is 12 frames at 36 fps: two steps in 333 ms)

/** Running: a soft landing squash on each footfall and a lean forward along the run. `lean` = -1..1 sideways. */
export function heroRunPose(now: number, lean: number): Pose {
  const t = (now % HERO_STEP_MS) / HERO_STEP_MS;
  const land = Math.max(0, 1 - t * 4); // the first quarter of each step
  return { dx: 0, dy: 0, sx: 1 + 0.05 * land, sy: 1 - 0.06 * land, rot: lean * 0.13 };
}

export const SKID_MS = 260;
/** Stopping: leans back against the run, then settles. `dir` = -1..1, the way he was running sideways. */
export function heroSkidPose(ms: number, dir: number): Pose {
  if (ms >= SKID_MS) return REST;
  const t = ms / SKID_MS;
  const w = spring(t, 1.5);
  return { dx: dir * 0.05 * (1 - t), dy: 0, sx: 1 + 0.06 * w, sy: 1 - 0.07 * w, rot: -dir * 0.16 * w };
}

export const START_MS = 120;
/** Setting off: a quick crouch before the first step. */
export function heroStartPose(ms: number): Pose {
  if (ms >= START_MS) return REST;
  const c = Math.sin((ms / START_MS) * Math.PI) * 0.07;
  return { dx: 0, dy: 0, sx: 1 + c, sy: 1 - c, rot: 0 };
}

/** Standing: slow breathing. */
export function heroBreathePose(now: number): Pose {
  const b = Math.sin(now / 520) * 0.022;
  return { dx: 0, dy: 0, sx: 1 - b * 0.4, sy: 1 + b, rot: 0 };
}

export const DASH_MS = 240;
/** Dash: stretched long along the dash, then a squash as he stops. `fx` = how sideways the dash is (-1..1). */
export function heroDashPose(ms: number, fx: number): Pose {
  if (ms >= DASH_MS) return REST;
  const t = ms / DASH_MS;
  const side = Math.abs(fx);
  if (t < 0.55) {
    const k = Math.sin((t / 0.55) * Math.PI * 0.5);
    return { dx: 0, dy: 0, sx: 1 + 0.22 * side * k - 0.08 * (1 - side) * k, sy: 1 - 0.12 * side * k + 0.18 * (1 - side) * k, rot: fx * 0.2 * k };
  }
  const w = spring((t - 0.55) / 0.45, 1.5);
  return { dx: 0, dy: 0, sx: 1 + 0.1 * w, sy: 1 - 0.1 * w, rot: fx * 0.2 * Math.max(0, w) };
}

export const STRIKE_MS = 300;
/** A strike: a quick pull back, a snap forward with a stretch, then settle. `fx, fy` = facing. */
export function heroStrikePose(ms: number, fx: number, fy: number): Pose {
  if (ms >= STRIKE_MS) return REST;
  const pull = 50;
  if (ms < pull) {
    const k = ms / pull;
    return { dx: -fx * 0.06 * k, dy: -fy * 0.04 * k, sx: 1 + 0.06 * k, sy: 1 - 0.06 * k, rot: -fx * 0.1 * k };
  }
  const t = (ms - pull) / (STRIKE_MS - pull);
  const reach = t < 0.2 ? easeOut(t / 0.2) : 1 - easeOut((t - 0.2) / 0.8);
  const w = spring(t, 2);
  return { dx: fx * 0.12 * reach, dy: fy * 0.08 * reach, sx: 1 - 0.06 * w, sy: 1 + 0.08 * w, rot: fx * 0.12 * reach };
}

export const FLINCH_MS = 320;
/** Hit: knocked back away from the blow, squashed, then wobbles back. `ax, ay` = away from the blow. */
export function heroFlinchPose(ms: number, ax: number, ay: number): Pose {
  if (ms >= FLINCH_MS) return REST;
  const t = ms / FLINCH_MS;
  const push = t < 0.15 ? easeOut(t / 0.15) : 1 - easeOut((t - 0.15) / 0.85);
  const w = spring(t, 2.5);
  return { dx: ax * 0.14 * push, dy: ay * 0.09 * push, sx: 1 + 0.12 * w, sy: 1 - 0.12 * w, rot: ax * 0.18 * push };
}

export const POP_MS = 260;
/** Perfect Counter: a sharp pop bigger, then back. */
export function heroPopPose(ms: number): Pose {
  if (ms >= POP_MS) return REST;
  const t = ms / POP_MS;
  const k = t < 0.2 ? t / 0.2 : spring((t - 0.2) / 0.8, 1.5);
  return { dx: 0, dy: 0, sx: 1 + 0.14 * k, sy: 1 + 0.14 * k, rot: 0 };
}
