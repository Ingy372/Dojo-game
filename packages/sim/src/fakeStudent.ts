// G2B12-FIXES: the hidden testing screen's fake students. A fake Green student has 24 of 28
// sign-offs but the save under it is a brand-new profile: Level 1 and an empty bag. That is not
// what a student at that belt looks like, and it made the Green playthrough read as a White one.
// Picking a fake profile now brings the save up to the profile's expected level and, if the bag is
// empty, gives one Rare for each gear slot. It never lowers a level and never touches a bag that
// has gear in it.

import { GEAR_SLOTS, makeItem, type LootTables } from './loot';
import type { Profile } from './profile';
import { createRng } from './rng';
import type { TrainingState } from './training';

/** Fixed, so the same profile always gets the same three items. */
const SEED = 7;

/** Returns true when it changed the profile (so the caller saves it). Safe to call again: the second call does nothing. */
export function seedFakeStudent(profile: Profile, training: TrainingState, tables: LootTables): boolean {
  let changed = false;
  if (profile.level < training.expectedLevel) {
    profile.level = Math.min(training.expectedLevel, training.levelCap);
    profile.xp = 0;
    changed = true;
  }
  // Only a student above White gets gear (a White student has none to start with).
  if (training.tier > 1 && profile.inventory.length === 0) {
    const rng = createRng(SEED);
    for (const slot of GEAR_SLOTS) {
      const slotTables: LootTables = { ...tables, bases: tables.bases.filter((b) => b.slot === slot) };
      if (!slotTables.bases.length) continue;
      const item = makeItem(rng, slotTables, 'rare', `i${profile.nextItemId++}`);
      profile.inventory.push(item);
      profile.equipped[slot] = item.uid;
    }
    changed = true;
  }
  return changed;
}
