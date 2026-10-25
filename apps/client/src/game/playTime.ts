// M7-P9: the play-time limit, per day. The clock lives in localStorage so a reload doesn't
// reset it; it resets at local midnight. Time away counts only up to maxGapSeconds.

import { isPlayLimit, playTimeUp, tickPlayClock, type PlayClock, type Profile } from '@dojo/sim';
import text from '../../../../content/settings/play-time.json';
import { testFlags } from './beta';

export const PLAY_TIME_TEXT = text;
const KEY = 'dojo-ascent-play-clock';

function readClock(): PlayClock | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return c && typeof c.date === 'string' && typeof c.playedMs === 'number' && typeof c.lastSeenMs === 'number' ? c : null;
  } catch {
    return null;
  }
}

/** Today's local date, YYYY-MM-DD. */
export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Notes that the player is playing now; returns today's clock. */
export function touchPlayClock(now = Date.now()): PlayClock {
  const clock = tickPlayClock(readClock(), localDate(new Date(now)), now, text.maxGapSeconds * 1000);
  try {
    localStorage.setItem(KEY, JSON.stringify(clock));
  } catch {
    // Storage blocked: the limit only lasts this page.
  }
  return clock;
}

/** The limit in minutes: a ?playlimit=N test link (any N >= 1), else the grown-up's setting. */
export function playLimit(profile: Profile): number {
  const n = Number(testFlags().get('playlimit'));
  if (Number.isFinite(n) && n >= 1) return n;
  return isPlayLimit(profile.playLimitMinutes) ? profile.playLimitMinutes : 0;
}

/** True once today's play has reached the limit. No new run starts until local midnight. */
export function isPlayTimeUp(profile: Profile, now = Date.now()): boolean {
  return playTimeUp(touchPlayClock(now), playLimit(profile));
}
