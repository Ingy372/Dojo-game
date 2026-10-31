// Q-LOCK-CARD: the locked Challenge card in Settings. Plain data and helpers, so tests can check them.
import { CHALLENGE_FROM_TIER, type FeedBelt } from '@dojo/sim';

/** Solid card colors (not see-through): a darker fill and dimmer words than an open card. */
export const LOCKED_CARD = { color: 0x1d1a26, nameColor: '#a39bb0', textColor: '#c9b98f' } as const;

/** The small shake on tap: pixels each way, back-and-forth count, and total time. */
export const LOCK_SHAKE = { px: 4, cycles: 3, ms: 250 } as const;

/**
 * Q-SHAKE-CENTER: the shake's offset from the card's resting spot at progress t (0..1).
 * A sine wave, so it goes the same distance left and right, and is exactly 0 at the start and the end.
 */
export function lockShakeOffset(t: number): number {
  if (t <= 0 || t >= 1) return 0;
  return LOCK_SHAKE.px * Math.sin(2 * Math.PI * LOCK_SHAKE.cycles * t);
}

/** The shake as `steps + 1` evenly spaced offsets, from t = 0 to t = 1 (for tests and shots). */
export function lockShakePath(steps: number): number[] {
  return Array.from({ length: steps + 1 }, (_, i) => lockShakeOffset(i / steps));
}

/**
 * The locked line with `{belt}` filled in: the name of the school's belt at CHALLENGE_FROM_TIER
 * (tier = place in the school's belt order, 1-based), so other dojos' belt orders stay right.
 * Text without `{belt}` comes back unchanged.
 */
export function lockedLine(text: string, belts: readonly Pick<FeedBelt, 'name'>[]): string {
  if (!text.includes('{belt}')) return text;
  const belt = belts[CHALLENGE_FROM_TIER - 1];
  return text.split('{belt}').join(belt ? belt.name : `belt ${CHALLENGE_FROM_TIER}`);
}

/** What a tap on the locked card does: always a sound and a pulse of the line; a shake unless reduced motion. */
export function lockedTapFeedback(reduced: boolean): { sound: true; pulseLine: true; shake: boolean } {
  return { sound: true, pulseLine: true, shake: !reduced };
}
