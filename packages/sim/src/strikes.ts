// R-PROGRESSION-BETA (PB-03): the Strike slot. A Strike is a StrikeDef from
// content/abilities/strikes.json. Spin Kick is the default (nothing equipped) and is today's
// Strike; Jumping Spins and Butterfly Flow are earned with the kick combo that unlocks them.
// Pure functions over content and training. The two old always-on Strike upgrades (Spin Kick
// Finish's extra hit, Butterfly Flow's cheaper Focus) are retired: no Strike effect applies
// unless the Strike is the one equipped.

import type { StrikeDef } from './abilities';
import type { TrainingState } from './training';
import type { StrikeSetup } from './world';
import { defaultStrike } from './world';

/** The Strike a student has with nothing equipped (Spin Kick), or undefined if there is no Strike data. */
export function defaultStrikeDef(defs: readonly StrikeDef[]): StrikeDef | undefined {
  return defs.find((s) => s.default);
}

/**
 * The belts whose kick combo a student has had signed off. A kick combo belongs to the belt it is
 * learned at (docs/curriculum.md: #1 White, #2 Yellow, #3 Orange), so each Strike names its belt
 * in content/abilities/strikes.json and is earned when that belt's kick-combo requirement is
 * signed off (belts below the current one count as signed off, see `buildTraining`).
 */
export function signedOffKickBelts(training: TrainingState): Set<string> {
  const out = new Set<string>();
  for (const a of training.abilities) if (a.kind === 'strike' && a.unlocked) out.add(a.requirement.belt);
  return out;
}

/**
 * The Strike ids a student can equip besides the default, oldest first: each Strike whose belt's
 * kick combo is signed off. The default (Spin Kick) is never listed: it is what the slot holds when it is empty.
 */
export function earnedStrikes(training: TrainingState, defs: readonly StrikeDef[]): string[] {
  const signed = signedOffKickBelts(training);
  return defs.filter((s) => !s.default && signed.has(s.belt)).sort((a, b) => a.combo - b.combo).map((s) => s.id);
}

/**
 * An old Strike id (from the abilities.json `strikes` list) as the StrikeDef id it now means, by
 * kick combo number: follow-up-kick -> spin-kick, quick-combo -> jumping-spins. A current id, an
 * unknown id and null come back unchanged.
 */
export function resolveStrikeId(defs: readonly StrikeDef[], id: string | null): string | null {
  if (id === null) return null;
  return defs.find((s) => s.legacyIds.includes(id))?.id ?? id;
}

/**
 * Equips a Strike by tapping it. The default Strike empties the slot (null). 'locked' = not earned,
 * which leaves the loadout unchanged.
 */
export function equipStrike<L extends { strike: string | null }>(loadout: L, id: string, defs: readonly StrikeDef[], earned: readonly string[]): { loadout: L; result: 'equipped' | 'already' | 'locked' } {
  const def = defs.find((s) => s.id === id);
  if (!def) return { loadout, result: 'locked' };
  const next = def.default ? null : id;
  if (!def.default && !earned.includes(id)) return { loadout, result: 'locked' };
  if (loadout.strike === next) return { loadout, result: 'already' };
  return { loadout: { ...loadout, strike: next }, result: 'equipped' };
}

/** What a fight needs to know about a StrikeDef. */
export function strikeSetupOf(def: StrikeDef): StrikeSetup {
  return {
    id: def.id,
    focusCost: def.focusCost,
    hits: def.hits.map((h) => ({ ...h })),
    reach: def.reach,
    lungeTiles: def.lungeTiles,
    recoveryTicks: def.recoveryTicks,
  };
}

/**
 * The Strike for a fight: the equipped one (already normalised, so earned) or Spin Kick. With no
 * Strike data the engine's own Spin Kick numbers are used.
 */
export function equippedStrikeSetup(defs: readonly StrikeDef[], equipped: string | null): StrikeSetup {
  const def = equipped === null ? undefined : defs.find((s) => s.id === equipped);
  const chosen = def ?? defaultStrikeDef(defs);
  return chosen ? strikeSetupOf(chosen) : defaultStrike();
}
