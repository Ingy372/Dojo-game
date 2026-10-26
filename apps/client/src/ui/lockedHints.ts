// L-PREMIUM-a2: the "how to earn it" line for a locked Trophy Case cubby (#333's locked-hints.json).
// Hints are keyed by game ability id; cubbies are keyed by curriculum requirement id, so the
// index maps each cubby (its shelf kind and place in curriculum order) to an ability id.

import abilities from '../../../../content/abilities/abilities.json';
import hints from '../../../../content/hints/locked-hints.json';

export type HintKind = 'stance' | 'strike' | 'seal';

export const TROPHY_HINTS: ReadonlyMap<string, string> = new Map(hints.trophies.map((t) => [t.id, t.hint]));
export const HINT_RULES = hints.rules;

const ids = (list: readonly { id: string }[]) => list.map((x) => x.id);
/** Ability ids each shelf kind can map to, in curriculum order. Katas skip the Beginner's and Open Leg stances. */
const ORDER: Record<HintKind, readonly string[]> = {
  stance: ids(abilities.stances).slice(2),
  strike: ids(abilities.strikes),
  seal: ids(abilities.seals),
};

/**
 * The ability id a cubby's hint comes from: its own power if it has one, else the nth of its kind
 * (katas carry no power, so the nth kata falls back to the nth earnable stance's hint). Past the end
 * of a list, the last one's hint is used (every hint of a kind says the same thing).
 */
export function hintAbilityId(kind: HintKind, n: number, ownId?: string): string {
  if (ownId && TROPHY_HINTS.has(ownId)) return ownId;
  const list = ORDER[kind];
  return list[Math.min(n, list.length - 1)];
}

export function lockedHint(kind: HintKind, n: number, ownId?: string): string | undefined {
  return TROPHY_HINTS.get(hintAbilityId(kind, n, ownId));
}
