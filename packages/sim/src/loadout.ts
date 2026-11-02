// R-PROGRESSION-BETA (PB-01): the Loadout's five slots, the Seal slot count by belt, the pure
// equip rules for Seals, and the one-time seed for saves from before slots. Nothing here changes
// a fight: `characterSetup` still reads only the Stance and Virtue (PB-02, PB-03 and PB-04 wire
// the other three slots in).

import { SEAL_SLOTS_BY_TIER } from './config';
import { emptyLoadout, type Loadout, type Profile } from './profile';
import type { TrainingState } from './training';

/** How many Seal slots a belt tier has (tier 1 = white). A tier past the table uses its last row. */
export function sealSlots(tier: number): number {
  const rows = SEAL_SLOTS_BY_TIER;
  const i = Number.isFinite(tier) ? Math.max(1, Math.floor(tier)) : 1;
  return rows[Math.min(rows.length, i) - 1];
}

/**
 * What a student has earned for each slot that holds a choice, oldest first. `strikes` are Strike
 * ids, `families` Seal family ids, `kataPowers` kata power ids.
 * PB-01: the Seal families (PB-02) and kata powers (PB-04) have no data yet, so those two lists
 * are empty here and a Seal or kata pick is dropped until that data lands. The caller can pass its
 * own lists (the tests do).
 */
export interface LoadoutEarned {
  strikes: readonly string[];
  families: readonly string[];
  kataPowers: readonly string[];
}

/** The Strike ids a student has earned, in kick-combo order, from today's always-on Strike list. */
export function earnedPicks(training: TrainingState): LoadoutEarned {
  const strikes = training.abilities.filter((a) => a.kind === 'strike' && a.unlocked && a.perk).map((a) => a.perk!.id);
  return { strikes, families: [], kataPowers: [] };
}

/**
 * A loadout with every pick the student has not earned put back to its slot's default: a Strike
 * or kata power not earned is null, a Seal not earned is dropped, repeats are dropped, and Seals
 * past `slots` are dropped from the end. Never an error. Stance and Virtue are left to
 * `normalizeLoadout`.
 */
export function normalizeSlots(loadout: Loadout, earned: LoadoutEarned, slots: number): Pick<Loadout, 'strike' | 'kata' | 'seals'> {
  const seals = loadout.seals.filter((f, i, all) => earned.families.includes(f) && all.indexOf(f) === i).slice(0, slots);
  return {
    strike: loadout.strike !== null && earned.strikes.includes(loadout.strike) ? loadout.strike : null,
    kata: loadout.kata !== null && earned.kataPowers.includes(loadout.kata) ? loadout.kata : null,
    seals,
  };
}

export type EquipSealResult = 'equipped' | 'already' | 'locked' | 'full';

/**
 * Puts a Seal family in a free slot. 'locked' = not earned, 'already' = it is in a slot (a family
 * is never in two), 'full' = every slot is used: the screen asks which one to swap, nothing
 * changes silently. The loadout is returned unchanged unless the result is 'equipped'.
 */
export function equipSeal(loadout: Loadout, family: string, unlocked: readonly string[], slots: number): { loadout: Loadout; result: EquipSealResult } {
  if (!unlocked.includes(family)) return { loadout, result: 'locked' };
  if (loadout.seals.includes(family)) return { loadout, result: 'already' };
  if (loadout.seals.length >= slots) return { loadout, result: 'full' };
  return { loadout: { ...loadout, seals: [...loadout.seals, family] }, result: 'equipped' };
}

/** Swaps the Seal in `out` for `family` (the answer to a 'full' equip). Unchanged if either is not valid. */
export function swapSeal(loadout: Loadout, out: string, family: string, unlocked: readonly string[]): Loadout {
  if (!unlocked.includes(family) || loadout.seals.includes(family) || !loadout.seals.includes(out)) return loadout;
  return { ...loadout, seals: loadout.seals.map((f) => (f === out ? family : f)) };
}

/** Takes a Seal family out of its slot. Always allowed. */
export function removeSeal(loadout: Loadout, family: string): Loadout {
  return { ...loadout, seals: loadout.seals.filter((f) => f !== family) };
}

/** What `migrateLoadoutV2` needs to know about the student. Oldest first. */
export interface LoadoutSeedInput {
  tier: number;
  earned: LoadoutEarned;
}

/**
 * The one-time seed for a save from before slots (R-PROGRESSION-BETA section 7). Strike: the
 * newest one earned (so nobody is set back), null if none. Seals: filled up to `sealSlots(tier)`
 * with the families earned first. Kata: null. Existing picks are kept. `note` is true only when
 * the student had Seals (so something moved into a slot). Running it on its own output changes
 * nothing.
 */
export function migrateLoadoutV2(loadout: Loadout | null, input: LoadoutSeedInput): { loadout: Loadout | null; note: boolean } {
  const base = loadout ?? emptyLoadout();
  const slots = sealSlots(input.tier);
  const kept = normalizeSlots(base, input.earned, slots).seals;
  const seals = [...kept, ...input.earned.families.filter((f) => !kept.includes(f))].slice(0, slots);
  const newest = input.earned.strikes[input.earned.strikes.length - 1] ?? null;
  const strike = base.strike ?? newest;
  const out: Loadout = { ...base, strike, seals };
  const changed = loadout !== null || strike !== null || seals.length > 0;
  return { loadout: changed ? out : null, note: input.earned.families.length > 0 };
}

/**
 * Runs `migrateLoadoutV2` on a profile once, guarded by `profile.loadoutV2`. Returns true if it ran.
 * PB-02 and PB-03 call it where the student's earned families and Strikes are known; it is not
 * called yet, because until the Seal families exist it would mark a save done with no Seals seeded.
 */
export function seedLoadoutV2(profile: Profile, input: LoadoutSeedInput): boolean {
  if (profile.loadoutV2) return false;
  const seeded = migrateLoadoutV2(profile.loadout, input);
  profile.loadout = seeded.loadout;
  profile.showSlotNote = seeded.note;
  profile.loadoutV2 = true;
  return true;
}

/** The student tapped the one-time note away. */
export function dismissSlotNote(profile: Profile): void {
  profile.showSlotNote = false;
}

/** The earned picks and the belt tier for a student, ready for `seedLoadoutV2`. */
export function seedInputFor(training: TrainingState): LoadoutSeedInput {
  return { tier: training.tier, earned: earnedPicks(training) };
}
