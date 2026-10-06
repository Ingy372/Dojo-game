// All tunable game numbers live here. Rules are pure and deterministic:
// no Math.random(), no Date.now(), no real time — only tick counts.

/** The rules run on a fixed tick of 20 per second. */
export const TICKS_PER_SECOND = 20;

/** Converts seconds to whole ticks. */
export function secondsToTicks(seconds: number): number {
  return Math.round(seconds * TICKS_PER_SECOND);
}

/** Movement numbers. Distances are in tiles. */
export const MOVEMENT = {
  /** Walking speed at full stick or when walking to a tapped spot, in tiles per second. */
  speedTilesPerSecond: 4.5,
  /** The character's body is a circle this big (a tile is 1). Keep under 0.5 so it fits through one-tile gaps. */
  playerRadius: 0.42,
  /** Stick pushes smaller than this (0 to 1) are ignored, so a resting thumb doesn't drift. */
  stickDeadZone: 0.15,
  /** Stops walking to a tapped spot if blocked for this many ticks. */
  stuckTicks: 10,
} as const;

/**
 * Difficulty settings (core-design section 4). The Perfect Counter window is in ticks;
 * enemy telegraphs (wind-ups) are multiplied by telegraphScale.
 */
export const DIFFICULTY = {
  // Guided widened from 10 to 14 ticks (0.7 s) after Jay's first playtest: doable for a 6-year-old, not automatic.
  guided: { counterWindowTicks: 14, telegraphScale: 1.5 },
  standard: { counterWindowTicks: 6, telegraphScale: 1 },
  challenge: { counterWindowTicks: 4, telegraphScale: 0.8 },
} as const;

export type Difficulty = keyof typeof DIFFICULTY;

/** Combat numbers. Starting values from core-design section 4; tune from playtesting. */
export const COMBAT = {
  defaultDifficulty: 'standard' as Difficulty,
  /** The Rooted Form adds this many ticks to the Perfect Counter window. */
  rootedFormBonusTicks: 2,

  /** Starting player stats (later these come from the student's profile). */
  player: { maxHealth: 100, power: 10, guard: 0 },

  focus: {
    max: 100,
    /** Gained for every hit the player lands. */
    perHit: 5,
    /** Gained for every Perfect Counter. */
    perPerfectCounter: 25,
  },

  /** Combo damage bonus: at 10 / 20 / 30 hits without being hit. Taking a Hit resets it. */
  comboTiers: [
    { hits: 30, bonus: 0.15 },
    { hits: 20, bonus: 0.1 },
    { hits: 10, bonus: 0.05 },
  ],

  /** Automatic basic attack against the nearest enemy in reach. */
  basicAttack: {
    strength: 1,
    /** Gap between the two bodies (in tiles) that still counts as in reach. */
    reach: 0.55,
    /** Ticks between basic attacks (12 ticks = 0.6 seconds). */
    cooldownTicks: 12,
  },

  /** The Strike button: one heavy hit with a short lunge. */
  strike: {
    focusCost: 30,
    strength: 2.5,
    /** Gap between bodies (tiles) the Strike can reach, lunge included. */
    reach: 1.4,
    /** How far the player lunges toward the target, at most (tiles). */
    lungeTiles: 0.7,
    /** Ticks after a Strike before the next attack. */
    recoveryTicks: 8,
  },

  counter: {
    /** After pressing Counter, the player holds a guard pose this many ticks (no walking). */
    guardTicks: 10,
    /** The guard pose always lasts at least this long past the Perfect window, so a slightly early press is still a Block. */
    blockTicksAfterWindow: 4,
    /** If nothing was countered, Counter can't be pressed again for this many ticks. */
    missLockoutTicks: 10,
    /** Perfect Counter: enemy staggered this long (1 second). */
    perfectStaggerTicks: 20,
    /** Perfect Counter: the counter hit uses this move strength (2x Power). */
    perfectStrength: 2,
    /** Block: damage taken is multiplied by this. */
    blockDamageMultiplier: 0.5,
  },

  /** Only this many enemies may be attacking at once ("kung fu circle"). */
  maxAttackersAtOnce: 2,

  /** After defeat, the player is down this long before the room restarts (1.5 seconds). */
  defeatTicks: 30,
  /** A defeated enemy comes back after this long (4 seconds), so practice can continue. */
  enemyRespawnTicks: 80,
  /** A new or returning enemy waits this long before moving (1 second). */
  enemySpawnWaitTicks: 20,
  /** Enemies re-plan their route to the player this often. */
  enemyRepathTicks: 10,
} as const;
