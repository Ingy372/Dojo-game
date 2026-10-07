// The player's saved progress from play: gear, personal bests, and bad-luck
// protection. Plain data (the game stores it on the phone for now; on the server later).

import { COMBAT, LOOT, type Rarity } from './config';
import type { Effect } from './effects';
import { GEAR_SLOTS, rarityRank, type GearItem, type GearSlot } from './loot';
import type { XpGain } from './progression';
import type { ProgressSnapshot } from './rewards';
import type { RunSummary } from './run';

export interface PersonalBests {
  /** Fastest full floor clear, in ticks (null until a floor is cleared). */
  fastestClearTicks: number | null;
  mostPerfects: number;
  longestCombo: number;
  mostSGrades: number;
}

export type BestKey = keyof PersonalBests;

export interface Profile {
  version: 1;
  nextItemId: number;
  inventory: GearItem[];
  /** The uid of the item worn in each slot, or null. */
  equipped: Record<GearSlot, string | null>;
  /** Runs in a row without a Rare (bad-luck protection). */
  dryRuns: number;
  bests: PersonalBests;
  runsPlayed: number;
  floorsCleared: number;
  lastRun: { summary: RunSummary; newBests: BestKey[]; xp?: XpGain } | null;
  /** Experience level (capped by real rank) and experience toward the next level. */
  level: number;
  xp: number;
  /** The real progress the player has already celebrated, so new progress gets a reward moment. */
  seen: ProgressSnapshot | null;
}

export function newProfile(): Profile {
  return {
    version: 1,
    nextItemId: 1,
    inventory: [],
    equipped: { hands: null, gi: null, charm: null },
    dryRuns: 0,
    bests: { fastestClearTicks: null, mostPerfects: 0, longestCombo: 0, mostSGrades: 0 },
    runsPlayed: 0,
    floorsCleared: 0,
    lastRun: null,
    level: 1,
    xp: 0,
    seen: null,
  };
}

/** Reads a saved profile, falling back to a fresh one if it's missing or damaged. */
export function loadProfile(data: unknown): Profile {
  const p = data as Profile;
  if (!p || typeof p !== 'object' || p.version !== 1 || !Array.isArray(p.inventory) || !p.equipped || !p.bests) {
    return newProfile();
  }
  const fresh = newProfile();
  return { ...fresh, ...p, equipped: { ...fresh.equipped, ...p.equipped }, bests: { ...fresh.bests, ...p.bests } };
}

export function wornItem(profile: Profile, slot: GearSlot): GearItem | null {
  const uid = profile.equipped[slot];
  return uid ? profile.inventory.find((i) => i.uid === uid) ?? null : null;
}

/** The player's stats with worn gear, plus worn charm effects. */
export function playerStats(profile: Profile): { maxHealth: number; power: number; guard: number; effects: Effect[] } {
  const out = { maxHealth: COMBAT.player.maxHealth, power: COMBAT.player.power, guard: COMBAT.player.guard, effects: [] as Effect[] };
  for (const slot of GEAR_SLOTS) {
    const item = wornItem(profile, slot);
    if (!item) continue;
    out.maxHealth += item.stats.maxHealth;
    out.power += item.stats.power;
    out.guard += item.stats.guard;
    if (item.effect) out.effects.push(item.effect);
  }
  return out;
}

/** Wear an item (replacing whatever was in that slot). */
export function equip(profile: Profile, uid: string): boolean {
  const item = profile.inventory.find((i) => i.uid === uid);
  if (!item) return false;
  profile.equipped[item.slot] = uid;
  return true;
}

export function unequip(profile: Profile, slot: GearSlot): void {
  profile.equipped[slot] = null;
}

/** Removes an item from the bag (and takes it off if worn). */
export function letGo(profile: Profile, uid: string): void {
  for (const slot of GEAR_SLOTS) if (profile.equipped[slot] === uid) profile.equipped[slot] = null;
  profile.inventory = profile.inventory.filter((i) => i.uid !== uid);
}

/**
 * Brings a finished run home: items go into the bag (empty slots are filled
 * automatically), bad-luck protection updates, and personal bests are checked.
 * Returns which personal bests were beaten.
 */
export function finishRun(profile: Profile, summary: RunSummary): BestKey[] {
  const items = summary.items.map((item) => ({ ...item, uid: `i${profile.nextItemId++}` }));
  profile.inventory.push(...items);
  for (const item of items) {
    if (!profile.equipped[item.slot]) profile.equipped[item.slot] = item.uid;
  }
  const best: Rarity = 'rare';
  const foundRare = items.some((i) => rarityRank(i.rarity) >= rarityRank(best));
  profile.dryRuns = foundRare ? 0 : Math.min(profile.dryRuns + 1, LOOT.guaranteedRareOnRun - 1);
  profile.runsPlayed++;

  const newBests: BestKey[] = [];
  const b = profile.bests;
  if (summary.test) {
    profile.lastRun = { summary: { ...summary, items }, newBests };
    return newBests;
  }
  if (summary.result === 'cleared') {
    profile.floorsCleared++;
    if (b.fastestClearTicks === null || summary.ticks < b.fastestClearTicks) {
      b.fastestClearTicks = summary.ticks;
      newBests.push('fastestClearTicks');
    }
  }
  if (summary.perfects > b.mostPerfects) {
    b.mostPerfects = summary.perfects;
    newBests.push('mostPerfects');
  }
  if (summary.bestCombo > b.longestCombo) {
    b.longestCombo = summary.bestCombo;
    newBests.push('longestCombo');
  }
  if (summary.sGrades > b.mostSGrades) {
    b.mostSGrades = summary.sGrades;
    newBests.push('mostSGrades');
  }
  profile.lastRun = { summary: { ...summary, items }, newBests };
  return newBests;
}
