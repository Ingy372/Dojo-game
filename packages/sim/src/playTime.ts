// M7-P9: the parent's play-time limit, per day. Play time adds up through the day and
// resets at local midnight. When it's up, the current room finishes, the game kindly goes
// home, and no new run starts until tomorrow. Pure: the client stores the clock and passes
// in the time and the local date.

/** The limits a grown-up can pick, in minutes (0 = off). */
export const PLAY_LIMIT_CHOICES = [0, 15, 30, 45, 60] as const;
export type PlayLimit = (typeof PLAY_LIMIT_CHOICES)[number];

export function isPlayLimit(v: unknown): v is PlayLimit {
  return typeof v === 'number' && (PLAY_LIMIT_CHOICES as readonly number[]).includes(v);
}

/** Today's play time: the local date (YYYY-MM-DD), ms played, and when the game last saw the player. */
export interface PlayClock {
  date: string;
  playedMs: number;
  lastSeenMs: number;
}

/**
 * Moves the clock to `now`. A new local date starts at 0 (the daily reset at midnight).
 * Time since the last tick counts only up to `maxGapMs`, so time away from the game isn't play.
 */
export function tickPlayClock(clock: PlayClock | null, today: string, nowMs: number, maxGapMs: number): PlayClock {
  if (!clock || clock.date !== today) return { date: today, playedMs: 0, lastSeenMs: nowMs };
  const gap = Math.max(0, Math.min(nowMs - clock.lastSeenMs, maxGapMs));
  return { date: today, playedMs: clock.playedMs + gap, lastSeenMs: nowMs };
}

/** True once today's play reaches `limitMinutes` (never when the limit is off). */
export function playTimeUp(clock: PlayClock, limitMinutes: number): boolean {
  return limitMinutes > 0 && clock.playedMs >= limitMinutes * 60_000;
}

/**
 * A grown-up gate question: "type forty-seven plus twenty-six" (Grok playtest Nov 23, P2: four choices let an
 * 8-year-old guess or work it out). Two two-digit numbers written in words, the answer typed on a keypad with no
 * choices to pick from. `rand` returns [0, 1).
 */
export interface GateQuestion {
  a: number;
  b: number;
  /** a and b in words, for the question line. */
  aWords: string;
  bWords: string;
  answer: number;
}

export function makeGateQuestion(rand: () => number): GateQuestion {
  const a = 21 + Math.floor(rand() * 29);
  const b = 21 + Math.floor(rand() * 29);
  return { a, b, aWords: numberWords(a), bWords: numberWords(b), answer: a + b };
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 0-99 in words: 47 -> "forty-seven". */
export function numberWords(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}
