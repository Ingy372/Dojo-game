// B-SAFE: kid-safety rules that don't need a browser, so Vitest can check them.

/** Every key the game saves on the phone starts with this. Wipe removes them all. */
export const APP_KEY_PREFIX = 'dojo-ascent-';

/** The older settings keys (Reduced motion, Music and Sound volume) start with this instead. */
export const SETTINGS_KEY_PREFIX = 'dojo.';

/** The saved keys that belong to the game (wipe-data removes exactly these). */
export function appKeys(keys: readonly string[]): string[] {
  return keys.filter((k) => k.startsWith(APP_KEY_PREFIX) || k.startsWith(SETTINGS_KEY_PREFIX));
}

/**
 * The page's test link flags (?playlimit, ?guide, ?elite, ?tower, ...).
 * In a beta build there are none: every flag reads as missing.
 */
export function testSearch(search: string, beta: boolean): string {
  return beta ? '' : search;
}

/** The "saved on this phone" note shows on first launch: no profile saved yet and the note not yet seen. */
export function showSavedNote(hasProfile: boolean, noteSeen: boolean): boolean {
  return !hasProfile && !noteSeen;
}
