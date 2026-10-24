// The player's saved progress from play: gear, personal bests, and bad-luck
// protection. Plain data (the game stores it on the phone for now; on the server later).

import { COMBAT, DIFFICULTY, LOOT, type Difficulty, type Rarity } from './config';
import type { Effect } from './effects';
import { GEAR_SLOTS, rarityRank, type GearItem, type GearSlot } from './loot';
import type { DojoState } from './dojo';
import type { XpGain } from './progression';
import type { ProgressSnapshot } from './rewards';
import type { RunSummary } from './run';
import { GUIDE_DONE } from './world';
import { readJournal, type JournalEntry, type NamedContent } from './named';

export interface PersonalBests {
  /** Fastest full floor clear, in ticks (null until a floor is cleared). */
  fastestClearTicks: number | null;
  mostPerfects: number;
  longestCombo: number;
  mostSGrades: number;
}

export type BestKey = keyof PersonalBests;

/**
 * How the student's character looks, chosen at character creation and changeable in the
 * Home Dojo. Options are ids from the art (body "a"/"b", "face-01", "hair-02") and positions
 * in the art's colour swatches. The belt is never part of the look: it shows the real rank.
 */
export interface CharacterLook {
  body: string;
  face: string;
  hair: string;
  skin: number;
  hairColor: number;
  gi: number;
}

/** A saved look if it has the right shape, otherwise null (the student picks again). */
export function readLook(data: unknown): CharacterLook | null {
  const l = data as CharacterLook;
  if (!l || typeof l !== 'object') return null;
  const strings = [l.body, l.face, l.hair].every((v) => typeof v === 'string' && v.length > 0);
  const swatches = [l.skin, l.hairColor, l.gi].every((v) => Number.isInteger(v) && v >= 0);
  return strings && swatches ? { body: l.body, face: l.face, hair: l.hair, skin: l.skin, hairColor: l.hairColor, gi: l.gi } : null;
}

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
  /** Floors played at each belt tier (key: tier), so a tier's first floor can be gentler. */
  floorsByTier: Record<string, number>;
  lastRun: { summary: RunSummary; newBests: BestKey[]; xp?: XpGain } | null;
  /** Experience level (capped by real rank) and experience toward the next level. */
  level: number;
  xp: number;
  /** The real progress the player has already celebrated, so new progress gets a reward moment. */
  seen: ProgressSnapshot | null;
  /** The Home Dojo (created on the first visit). */
  dojo: DojoState | null;
  /** The character's look, or null until the student makes their character. */
  look: CharacterLook | null;
  /** Sensei's guided first Counter: the next step to show (GUIDE_DONE once it's finished). */
  guideStep: number;
  /**
   * The difficulty the player plays on (milestone 7), or null until one is set (then Standard).
   * Every Tower run takes its difficulty from here, so elites and combat always agree.
   */
  difficulty: Difficulty | null;
  /** Street Smarts: best stars per scenario, and who the player picked as their grown-up. */
  streetSmarts: StreetSmartsSave;
  /** Monster Journal (M7-N1): named monsters met and beaten. Never counts, only yes/no. */
  monsterJournal: Record<string, JournalEntry>;
  /** Tower runs started (finished or not); named monsters skip a profile's first few. */
  runsStarted: number;
}

export interface StreetSmartsSave {
  best: Record<string, number>;
  grownup: 'Mom' | 'Dad' | null;
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
    floorsByTier: {},
    lastRun: null,
    level: 1,
    xp: 0,
    seen: null,
    dojo: null,
    look: null,
    guideStep: 0,
    streetSmarts: { best: {}, grownup: null },
    difficulty: null,
    monsterJournal: {},
    runsStarted: 0,
  };
}

/** Reads a saved profile, falling back to a fresh one if it's missing or damaged. */
export function loadProfile(data: unknown): Profile {
  const p = data as Profile;
  if (!p || typeof p !== 'object' || p.version !== 1 || !Array.isArray(p.inventory) || !p.equipped || !p.bests) {
    return newProfile();
  }
  const fresh = newProfile();
  return { ...fresh, ...p, equipped: { ...fresh.equipped, ...p.equipped }, bests: { ...fresh.bests, ...p.bests }, floorsByTier: p.floorsByTier && typeof p.floorsByTier === 'object' ? { ...p.floorsByTier } : {}, look: readLook(p.look), guideStep: typeof p.guideStep === 'number' ? p.guideStep : p.runsPlayed > 0 ? GUIDE_DONE : 0, streetSmarts: readStreetSmarts(p.streetSmarts), difficulty: isDifficulty(p.difficulty) ? p.difficulty : null, monsterJournal: readJournal(p.monsterJournal), runsStarted: typeof p.runsStarted === 'number' && p.runsStarted >= 0 ? p.runsStarted : p.runsPlayed ?? 0 };
}

function readStreetSmarts(v: unknown): StreetSmartsSave {
  const s = v as Partial<StreetSmartsSave> | undefined;
  const best: Record<string, number> = {};
  if (s?.best && typeof s.best === 'object') for (const [k, n] of Object.entries(s.best)) if (typeof n === 'number') best[k] = n;
  return { best, grownup: s?.grownup === 'Mom' || s?.grownup === 'Dad' ? s.grownup : null };
}

/** Marks a named monster as met in the Monster Journal. Returns true the first time. */
export function meetNamed(profile: Profile, id: string): boolean {
  const e = profile.monsterJournal[id];
  if (e?.met) return false;
  profile.monsterJournal[id] = { met: true, beaten: e?.beaten ?? false };
  return true;
}

/**
 * Marks a named monster as beaten. The first win only returns its sticker (a Home Dojo
 * decoration id) to give; later wins return null and give nothing more.
 */
export function beatNamed(profile: Profile, named: NamedContent, id: string): string | null {
  const e = profile.monsterJournal[id];
  if (e?.beaten) return null;
  profile.monsterJournal[id] = { met: true, beaten: true };
  return named.monsters.find((m) => m.id === id)?.sticker ?? null;
}

/** Keeps the best star count for a finished scenario. Returns true if it's a new best. */
export function recordScenario(profile: Profile, id: string, stars: number): boolean {
  const old = profile.streetSmarts.best[id] ?? -1;
  if (stars <= old) return false;
  profile.streetSmarts.best[id] = stars;
  return true;
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
  const tier = String(summary.tier ?? 1);
  profile.floorsByTier[tier] = (profile.floorsByTier[tier] ?? 0) + 1;
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

/** True when the student hasn't played a (real) floor at this belt tier yet. */
export function firstFloorOfTier(profile: Profile, tier: number): boolean {
  return (profile.floorsByTier[String(tier)] ?? 0) === 0;
}

function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === 'string' && v in DIFFICULTY;
}

/**
 * The difficulty a Tower run is played on: a ?difficulty= test link wins, then the player's
 * setting, then Standard. The run passes it to both the elite rules and the room's combat.
 */
export function runDifficulty(profile: Profile, testLink: string | null = null): Difficulty {
  if (isDifficulty(testLink)) return testLink;
  return profile.difficulty ?? COMBAT.defaultDifficulty;
}
