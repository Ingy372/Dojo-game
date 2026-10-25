// B-MASHER-2: "Sensei steps back" shows once per run, the first time Mash guard turns off in a room.
import text from '../../../../content/settings/mash-guard.json';

export const MASH_GUARD_LINE: string = text.steppedBackLine;

const shown = new WeakSet<object>();

/** True the first time it is called for a run (any object standing for that run), false after. */
export function takeMashGuardMoment(run: object): boolean {
  if (shown.has(run)) return false;
  shown.add(run);
  return true;
}
