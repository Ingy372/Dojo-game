// L-PREMIUM-a2: the "how to earn it" line for a locked Trophy Case cubby (#333's locked-hints.json).
// Hints are keyed by game ability id; cubbies are keyed by curriculum requirement id, so the
// index maps each cubby (its shelf kind and place in curriculum order) to an ability id.

import abilities from '../../../../content/abilities/abilities.json';
import hints from '../../../../content/hints/locked-hints.json';

export type HintKind = 'stance' | 'strike' | 'seal';

export const TROPHY_HINTS: ReadonlyMap<string, string> = new Map(hints.trophies.map((t) => [t.id, t.hint]));
export const HINT_RULES = hints.rules;
/** #355: hints for cubbies with no ability of their own, keyed by cubby id (kata-cubby). */
export const CUBBY_HINTS: ReadonlyMap<string, string> = new Map(hints.cubbies.map((c) => [c.id, c.hint]));

const ids = (list: readonly { id: string }[]) => list.map((x) => x.id);
/** Ability ids kicks and self-defense map to, in curriculum order. */
const ORDER: Record<Exclude<HintKind, 'stance'>, readonly string[]> = {
  strike: ids(abilities.strikes),
  seal: ids(abilities.seals),
};

/**
 * The hint id a cubby uses: its own power if it has a hint, else for a kata (no power since
 * R-STANCE-d2) the shared kata-cubby hint, else the nth kick or self-defense power. Past the end
 * of a list, the last one's hint is used (every hint of a kind says the same thing).
 */
export function hintAbilityId(kind: HintKind, n: number, ownId?: string): string {
  if (ownId && TROPHY_HINTS.has(ownId)) return ownId;
  if (kind === 'stance') return 'kata-cubby';
  const list = ORDER[kind];
  return list[Math.min(n, list.length - 1)];
}

export function lockedHint(kind: HintKind, n: number, ownId?: string): string | undefined {
  const id = hintAbilityId(kind, n, ownId);
  return TROPHY_HINTS.get(id) ?? CUBBY_HINTS.get(id);
}
