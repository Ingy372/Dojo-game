// Star Wall (Jay, Nov 20): the throwing star game at the yellow targets in the Action Zone.
// A 30-second round: targets light up one at a time (two at once later on); tap a lit one to throw a star.
// Quick hits score more and hits in a row build a streak. Just for fun: it gives no power, Experience or items.
// Times are in ticks (20 per second), like the rest of the rules.

import { nextFloat, nextInt, type Rng } from './rng';

export const STAR_WALL = {
  /** Targets on the wall: 2 rows of 6, like the real wall. */
  rows: 2,
  cols: 6,
  /** Round length (30 s). */
  roundTicks: 600,
  /** How long a target stays lit: from this at the start... */
  litStartTicks: 34,
  /** ...down to this by the end of the round. */
  litEndTicks: 16,
  /** Gap between one target going dark and the next lighting. */
  gapTicks: 4,
  /** From this tick on, sometimes two targets light at once. */
  doubleFromTick: 200,
  /** Chance (0-1) of a second target once doubles are on. */
  doubleChance: 0.35,
  /** Chance (0-1) that a lit target is gold (worth more). */
  goldChance: 0.08,
  /** Points for a hit, plus up to `quickBonus` for hitting it the moment it lights. */
  hitPoints: 100,
  quickBonus: 100,
  goldPoints: 300,
  /** The streak multiplier goes up one step every `streakStep` hits in a row, up to `streakMax`. */
  streakStep: 3,
  streakMax: 5,
} as const;

/** How long a target lit at `tick` stays lit. */
export function litTicksAt(tick: number): number {
  const t = Math.max(0, Math.min(1, tick / STAR_WALL.roundTicks));
  return Math.round(STAR_WALL.litStartTicks + (STAR_WALL.litEndTicks - STAR_WALL.litStartTicks) * t);
}

/** The multiplier for a hit that makes `streak` hits in a row (1 for the first few). */
export function streakMultiplier(streak: number): number {
  return Math.min(STAR_WALL.streakMax, 1 + Math.floor(Math.max(0, streak - 1) / STAR_WALL.streakStep));
}

/** Points for hitting a target `after` ticks into its `lit` ticks, as hit number `streak` in a row. */
export function hitScore(after: number, lit: number, streak: number, gold: boolean): number {
  const quick = Math.max(0, 1 - after / Math.max(1, lit));
  const base = gold ? STAR_WALL.goldPoints : STAR_WALL.hitPoints + Math.round(STAR_WALL.quickBonus * quick);
  return base * streakMultiplier(streak);
}

/** The next targets to light at `tick` (indexes 0..rows*cols-1), never the ones in `avoid`. */
export function pickTargets(rng: Rng, tick: number, avoid: readonly number[]): { index: number; gold: boolean }[] {
  const n = STAR_WALL.rows * STAR_WALL.cols;
  const count = tick >= STAR_WALL.doubleFromTick && nextFloat(rng) < STAR_WALL.doubleChance ? 2 : 1;
  const picks: { index: number; gold: boolean }[] = [];
  const taken = new Set(avoid);
  while (picks.length < count && taken.size < n) {
    const index = nextInt(rng, n);
    if (taken.has(index)) continue;
    taken.add(index);
    picks.push({ index, gold: nextFloat(rng) < STAR_WALL.goldChance });
  }
  return picks;
}
