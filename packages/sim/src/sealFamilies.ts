// R-PROGRESSION-BETA (PB-02): Seal families. A Seal is a family; its rank is the number of
// techniques the student has had signed off in it, and its effects are those of every signed-off
// technique in the family (a set: the order they were signed in changes nothing). A family
// unlocks with its first signed-off technique. Pure functions over content and training.

import type { SealFamilyDef } from './abilities';
import type { Effect } from './effects';
import type { TrainingState } from './training';

/**
 * The self-defense technique numbers a student has had signed off. Techniques come in curriculum
 * order and each one is the next Seal (the same order `buildTraining` uses), so the nth self-defense
 * requirement is technique n.
 */
export function signedOffTechniques(training: TrainingState): Set<number> {
  const out = new Set<number>();
  training.abilities.filter((a) => a.kind === 'seal').forEach((a, i) => {
    if (a.unlocked) out.add(i + 1);
  });
  return out;
}

/** How many of a family's techniques are signed off (0 = not unlocked). */
export function familyRank(family: SealFamilyDef, signed: ReadonlySet<number>): number {
  return family.ranks.filter((r) => signed.has(r.technique)).length;
}

/** The effects of a family at the student's rank: every signed-off technique's effects. Off families give none. */
export function familyEffects(family: SealFamilyDef, signed: ReadonlySet<number>): Effect[] {
  if (!family.live) return [];
  return family.ranks.filter((r) => signed.has(r.technique)).flatMap((r) => r.effects);
}

/**
 * The family ids a student can equip, oldest first (by the first technique signed off in each).
 * Families that are not live yet are never listed.
 */
export function unlockedFamilies(training: TrainingState, families: readonly SealFamilyDef[]): string[] {
  const signed = signedOffTechniques(training);
  return families
    .filter((f) => f.live && familyRank(f, signed) > 0)
    .map((f) => ({ id: f.id as string, first: Math.min(...f.ranks.filter((r) => signed.has(r.technique)).map((r) => r.technique)) }))
    .sort((a, b) => a.first - b.first)
    .map((f) => f.id);
}

/** The effects of the Seals in the slots: each equipped, live family at the student's rank. */
export function equippedSealEffects(training: TrainingState, families: readonly SealFamilyDef[], equipped: readonly string[]): Effect[] {
  const signed = signedOffTechniques(training);
  return equipped.flatMap((id) => {
    const f = families.find((x) => x.id === id);
    return f ? familyEffects(f, signed) : [];
  });
}
