// B-SAFE: beta builds (npm run build:beta sets VITE_BETA=1) switch off every test flag,
// and the grown-up wipe-data button clears everything the game saved on this phone.

import { APP_KEY_PREFIX, appKeys, showSavedNote, testSearch } from '@dojo/sim';

/** True in a beta build. Test links, the dev day offset and the hidden testing screens are off. */
export const BETA = import.meta.env.VITE_BETA === '1';

/** The test link flags for this page. Always empty in a beta build. Read flags only through this. */
export function testFlags(search = window.location.search): URLSearchParams {
  return new URLSearchParams(testSearch(search, BETA));
}

const PROFILE_KEY = `${APP_KEY_PREFIX}profile-v1`;
const NOTE_KEY = `${APP_KEY_PREFIX}saved-note-seen`;

/** First launch: nothing saved yet and the "saved on this phone" note not yet seen. */
export function needsSavedNote(): boolean {
  try {
    return showSavedNote(localStorage.getItem(PROFILE_KEY) !== null, localStorage.getItem(NOTE_KEY) !== null);
  } catch {
    return false;
  }
}

export function markSavedNoteSeen(): void {
  try {
    localStorage.setItem(NOTE_KEY, '1');
  } catch {
    // Storage is off: the note may show again, which is harmless.
  }
}

const WIPE_PENDING = `${APP_KEY_PREFIX}wipe-pending`;

function removeAppKeys(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i) ?? '');
  appKeys(keys).forEach((k) => localStorage.removeItem(k));
}

/**
 * Wipe data: removes every dojo-ascent- key (profile, belt entry, play limit, run, clocks, test picks)
 * and the dojo. settings keys. Call it, then reload. The page can still save once while it closes
 * (the play clock on hide), so the wipe runs again on the next start (finishPendingWipe).
 */
export function wipeAllData(): void {
  try {
    removeAppKeys();
    sessionStorage.setItem(WIPE_PENDING, '1');
  } catch {
    // Storage is off: there is nothing saved to wipe.
  }
}

/** At start-up, before the game reads any save: finishes a wipe begun before the reload. */
export function finishPendingWipe(): void {
  try {
    if (sessionStorage.getItem(WIPE_PENDING) === null) return;
    removeAppKeys();
    sessionStorage.removeItem(WIPE_PENDING);
  } catch {
    // Storage is off: nothing to finish.
  }
}
