// The player's profile (gear, personal bests) is kept on the phone for now.
// A later milestone moves saves to the game server.

import { loadProfile, newProfile, type Profile } from '@dojo/sim';

const KEY = 'dojo-ascent-profile-v1';

export function loadSave(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return loadProfile(raw ? JSON.parse(raw) : null);
  } catch {
    return newProfile();
  }
}

export function writeSave(profile: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage can be blocked (private browsing); the game still plays.
  }
}
