// M7-P9: the play-time limit. The clock lives in localStorage so a reload doesn't reset it;
// a long break (content: sessionBreakMinutes) starts a new session.

import { isPlayLimit, playTimeUp, tickPlayClock, type PlayClock, type Profile } from '@dojo/sim';
import text from '../../../../content/settings/play-time.json';

export const PLAY_TIME_TEXT = text;
const KEY = 'dojo-ascent-play-clock';

function readClock(): PlayClock | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return c && typeof c.startedMs === 'number' && typeof c.lastSeenMs === 'number' ? c : null;
  } catch {
    return null;
  }
}

/** Notes that the player is playing now; returns the session clock. */
export function touchPlayClock(now = Date.now()): PlayClock {
  const clock = tickPlayClock(readClock(), now, text.sessionBreakMinutes * 60_000);
  try {
    localStorage.setItem(KEY, JSON.stringify(clock));
  } catch {
    // Storage blocked: the limit only lasts this page.
  }
  return clock;
}

/** The limit in minutes: a ?playlimit=N test link (any N >= 1), else the grown-up's setting. */
export function playLimit(profile: Profile): number {
  const n = Number(new URLSearchParams(window.location.search).get('playlimit'));
  if (Number.isFinite(n) && n >= 1) return n;
  return isPlayLimit(profile.playLimitMinutes) ? profile.playLimitMinutes : 0;
}

/** True once this session has reached the limit. */
export function isPlayTimeUp(profile: Profile, now = Date.now()): boolean {
  return playTimeUp(touchPlayClock(now), playLimit(profile), now);
}
