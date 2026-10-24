// M7-P9: the parent's play-time limit. A session is play time with no long break; after
// the limit, the current room finishes and the game kindly goes home. Pure: the client
// stores the clock and passes the time in.

/** The limits a grown-up can pick, in minutes (0 = off). */
export const PLAY_LIMIT_CHOICES = [0, 15, 30, 45, 60] as const;
export type PlayLimit = (typeof PLAY_LIMIT_CHOICES)[number];

export function isPlayLimit(v: unknown): v is PlayLimit {
  return typeof v === 'number' && (PLAY_LIMIT_CHOICES as readonly number[]).includes(v);
}

/** When this play session started and when the game last saw the player (ms). */
export interface PlayClock {
  startedMs: number;
  lastSeenMs: number;
}

/**
 * Moves the clock to `now`. A break of `breakMs` or more (or no clock yet) starts a new
 * session, so the limit is per sitting, not per day.
 */
export function tickPlayClock(clock: PlayClock | null, nowMs: number, breakMs: number): PlayClock {
  if (!clock || nowMs < clock.lastSeenMs || nowMs - clock.lastSeenMs >= breakMs) return { startedMs: nowMs, lastSeenMs: nowMs };
  return { startedMs: clock.startedMs, lastSeenMs: nowMs };
}

/** True once the session has lasted `limitMinutes` (never when the limit is off). */
export function playTimeUp(clock: PlayClock, limitMinutes: number, nowMs: number): boolean {
  return limitMinutes > 0 && nowMs - clock.startedMs >= limitMinutes * 60_000;
}
