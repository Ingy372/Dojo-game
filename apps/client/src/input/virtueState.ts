import { COMBAT, type PlayerState } from '@dojo/sim';

/**
 * Grok playtest Nov 25 (B6): the VIRTUE button now always shows (for a student who has a Virtue),
 * in the same spot. It is gold and ready once Focus is full; until then it is dim with a ring
 * filling with Focus; while a Virtue lasts it is dim too.
 */
export type VirtueLook = 'ready' | 'filling' | 'active';

export function virtueLook(p: Pick<PlayerState, 'focus' | 'virtueTicks'>): VirtueLook {
  if (p.virtueTicks > 0) return 'active';
  return p.focus >= COMBAT.focus.max ? 'ready' : 'filling';
}

/** How full the ring around VIRTUE is (0 to 1), from Focus. */
export function virtueFill(p: Pick<PlayerState, 'focus'>): number {
  return Math.max(0, Math.min(1, p.focus / COMBAT.focus.max));
}

/** What pressing VIRTUE (or E) says when it can't be used yet. Kid lines stay 8 words or fewer. */
export const VIRTUE_NOT_READY = 'Fill Focus to use your Virtue!';
export const VIRTUE_ALREADY_ON = 'Already active';

/** The line for a refused press, or null when the press was fine. */
export function virtueRefusedLine(p: Pick<PlayerState, 'focus' | 'virtueTicks'>): string | null {
  const look = virtueLook(p);
  return look === 'active' ? VIRTUE_ALREADY_ON : look === 'filling' ? VIRTUE_NOT_READY : null;
}
