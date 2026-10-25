// The Home Dojo's saved state lives in the profile. This makes sure it exists, and
// remembers when a bow is due (starting the game, and coming back from the Tower).

import { loadDojo, newDojo, type DojoState, type Profile } from '@dojo/sim';
import { CONTENT } from './content';

/** The player's dojo, created with Sensei's welcome gifts on the first visit. */
export function homeDojo(profile: Profile): DojoState {
  const loaded = profile.dojo ? loadDojo(profile.dojo, CONTENT.dojo) : null;
  profile.dojo = loaded ?? newDojo(CONTENT.dojo, Math.floor(Math.random() * 2147483647) + 1);
  return profile.dojo;
}

let bowDue = true;

/** A bow is due when the player next walks into the dojo. */
export function bowIsDue(): boolean {
  return bowDue;
}

export function setBowDue(due: boolean): void {
  bowDue = due;
}
