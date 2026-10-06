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
