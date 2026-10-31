// B-MASHER-2: "Sensei steps back" shows once per player per run, the first time their Mash guard turns off in a room.
// The Manager's calls: "seen" is saved with the run (RunState.mashGuardSeen), so a reload doesn't show it again,
// and in co-op each player sees it once.
import text from '../../../../content/settings/mash-guard.json';

export const MASH_GUARD_LINE: string = text.steppedBackLine;

/** How long the stepped-back banner stays up, in ms (the Manager's call, B-MASHER-2: 2.2 s). */
export const MASH_GUARD_HOLD_MS = 2200;

/** True the first time it is called for this player in a run, false after (also after the run is saved and restored). */
export function takeMashGuardMoment(run: { mashGuardSeen?: string[] }, playerId: string): boolean {
  const seen = (run.mashGuardSeen ??= []);
  if (seen.includes(playerId)) return false;
  seen.push(playerId);
  return true;
}
