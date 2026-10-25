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

/** Wipe data: removes every dojo-ascent- key (profile, belt entry, play limit, run, clocks, test picks) and the dojo. settings keys. */
export function wipeAllData(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i) ?? '');
    appKeys(keys).forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage is off: there is nothing saved to wipe.
  }
}
