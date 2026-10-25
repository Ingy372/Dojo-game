// The player's saved progress from play: gear, personal bests, and bad-luck
// protection. Plain data (the game stores it on the phone for now; on the server later).

import { readBeltEntry, type BeltEntry } from './beltEntry';
import { newDecorEarning, readDecorEarning, type DecorEarning } from './earning';
import { isPlayLimit, type PlayLimit } from './playTime';
import { COMBAT, DIFFICULTY, LOOT, type Difficulty, type Rarity } from './config';
import type { Effect } from './effects';
import { GEAR_SLOTS, rarityRank, type GearItem, type GearSlot } from './loot';
import type { DojoState } from './dojo';
import type { XpGain } from './progression';
import type { ProgressSnapshot } from './rewards';
import type { RunSummary } from './run';
import { GUIDE_DONE } from './world';
import { readJournal, type JournalEntry, type NamedContent } from './named';
import { newLessonLog, readLessonLog, type LessonLog } from './lessons';
import { newWelcomeWeekLog, readWelcomeWeekLog, type WelcomeWeekLog } from './unlocks';

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
  lastRun: { summary: RunSummary; newBests: BestKey[]; xp?: XpGain; /** One-time dojo pieces it earned (trophies, statues). */ earned?: string[] } | null;
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
  /** True once the player picks a difficulty themselves; then it is never changed for them (M7-P1). */
  difficultyChosenByPlayer: boolean;
  /** Parent setting (M7-P9): play-time limit in minutes, 0 = off (the default). */
  playLimitMinutes: PlayLimit;
  /** B-BELT: the belt and stripes a grown-up typed in (only ever raised), or null. */
  beltEntry: BeltEntry | null;
  /** Lost runs in a row on one floor (belt tier), for the kind Guided offer (M7-P1). */
  floorLosses: { tier: number; count: number } | null;
  /** The local date (YYYY-MM-DD) Guided was last offered, or null: at most once a day. */
  guidedOfferedOn: string | null;
  /** The one-time "You're on ..." home line has been shown. */
  difficultyLineShown: boolean;
  /** Street Smarts: best stars per scenario, and who the player picked as their grown-up. */
  streetSmarts: StreetSmartsSave;
  /** Monster Journal (M7-N1): named monsters met and beaten. Never counts, only yes/no. */
  monsterJournal: Record<string, JournalEntry>;
  /** Decor earning (S7): class pieces and one-time pieces already given. */
  decorEarning: DecorEarning;
  /** Tower runs started (finished or not); named monsters skip a profile's first few. */
  runsStarted: number;
  /** Sensei's Lessons (M7-P5): lessons seen and the days with a run (sessions). */
  lessons: LessonLog;
  /** Welcome Week (M7-P7): whether it applies, and the systems met so far. */
  welcomeWeek: WelcomeWeekLog;
  /** The local date (YYYY-MM-DD) the three next goals were last shown (M7-P10): at most once a day. */
  goalsShownOn: string | null;
  /**
   * P-MENU-f: the belt ids whose Sensei's Seal the player has already seen lit (each rings its
   * bell once). null = an old save from before this field; the first Gate view fills it in
   * with the Seal that is already lit, silently (see sealBell).
   */
  sealsSeen: string[] | null;
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
    difficultyChosenByPlayer: false,
    playLimitMinutes: 0,
    beltEntry: null,
    floorLosses: null,
    guidedOfferedOn: null,
    difficultyLineShown: false,
    monsterJournal: {},
    decorEarning: newDecorEarning(),
    runsStarted: 0,
    lessons: newLessonLog(),
    welcomeWeek: newWelcomeWeekLog(),
    goalsShownOn: null,
    sealsSeen: [],
  };
}

/** Reads a saved profile, falling back to a fresh one if it's missing or damaged. */
function readFloorLosses(v: unknown): Profile['floorLosses'] {
  const o = v as { tier?: unknown; count?: unknown } | null;
  return o && typeof o.tier === 'number' && typeof o.count === 'number' ? { tier: o.tier, count: o.count } : null;
}

export function loadProfile(data: unknown): Profile {
  const p = data as Profile;
  if (!p || typeof p !== 'object' || p.version !== 1 || !Array.isArray(p.inventory) || !p.equipped || !p.bests) {
    return newProfile();
  }
  const fresh = newProfile();
  return { ...fresh, ...p, equipped: { ...fresh.equipped, ...p.equipped }, bests: { ...fresh.bests, ...p.bests }, floorsByTier: p.floorsByTier && typeof p.floorsByTier === 'object' ? { ...p.floorsByTier } : {}, look: readLook(p.look), guideStep: typeof p.guideStep === 'number' ? p.guideStep : p.runsPlayed > 0 ? GUIDE_DONE : 0, streetSmarts: readStreetSmarts(p.streetSmarts), difficulty: isDifficulty(p.difficulty) ? p.difficulty : null, difficultyChosenByPlayer: p.difficultyChosenByPlayer === true, floorLosses: readFloorLosses(p.floorLosses), guidedOfferedOn: typeof p.guidedOfferedOn === 'string' ? p.guidedOfferedOn : null, difficultyLineShown: p.difficultyLineShown === true, playLimitMinutes: isPlayLimit(p.playLimitMinutes) ? p.playLimitMinutes : 0, beltEntry: readBeltEntry(p.beltEntry), monsterJournal: readJournal(p.monsterJournal), decorEarning: readDecorEarning(p.decorEarning), runsStarted: typeof p.runsStarted === 'number' && p.runsStarted >= 0 ? p.runsStarted : p.runsPlayed ?? 0, lessons: readLessonLog(p.lessons), welcomeWeek: p.welcomeWeek ? readWelcomeWeekLog(p.welcomeWeek) : { existing: (p.runsPlayed ?? 0) > 0 ? false : null, introduced: [] }, goalsShownOn: typeof p.goalsShownOn === 'string' ? p.goalsShownOn : null, sealsSeen: Array.isArray(p.sealsSeen) ? p.sealsSeen.filter((v) => typeof v === 'string') : null };
}

function readStreetSmarts(v: unknown): StreetSmartsSave {
  const s = v as Partial<StreetSmartsSave> | undefined;
  const best: Record<string, number> = {};
  if (s?.best && typeof s.best === 'object') for (const [k, n] of Object.entries(s.best)) if (typeof n === 'number') best[k] = n;
  return { best, grownup: s?.grownup === 'Mom' || s?.grownup === 'Dad' ? s.grownup : null };
}

/** Marks a named monster as met in the Monster Journal. Returns true the first time. */
export function meetNamed(profile: Profile, run: { test: boolean }, id: string): boolean {
  // Test-link runs (?named=, ?room=, ...) never write the journal (K10).
  if (run.test) return false;
  const e = profile.monsterJournal[id];
  if (e?.met) return false;
  profile.monsterJournal[id] = { met: true, beaten: e?.beaten ?? false };
  return true;
}

/**
 * Marks a named monster as beaten. The first win only returns its sticker (a Home Dojo
 * decoration id) to give; later wins and test-link runs return null and give nothing.
 */
export function beatNamed(profile: Profile, run: { test: boolean }, named: NamedContent, id: string): string | null {
  // Test-link runs never stamp the journal or give the sticker (K10).
  if (run.test) return null;
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

/**
 * Gives the profile a real difficulty the first time it's needed: everyone starts on the
 * default (Standard, "Steady" for kids). A difficulty already set or chosen is never changed.
 * Returns true if it set one. (Manager call, 2026-10-24: no age-based Guided default.)
 */
export function settleDifficulty(profile: Profile): boolean {
  if (profile.difficultyChosenByPlayer || profile.difficulty !== null) return false;
  profile.difficulty = COMBAT.defaultDifficulty;
  return true;
}

/** When Guided is offered after losses (content/settings/difficulty.json). */
export interface GuidedOfferRules {
  /** Lost runs in a row on the same floor (belt tier) before Guided is offered. */
  offerAfterLosses: number;
}

/** Counts lost runs in a row on one floor (belt tier). A cleared floor resets it; a rest doesn't count. */
export function recordFloorResult(profile: Profile, tier: number, result: 'cleared' | 'lost' | 'rested'): void {
  if (result === 'cleared') profile.floorLosses = null;
  else if (result === 'lost')
    profile.floorLosses = profile.floorLosses?.tier === tier ? { tier, count: profile.floorLosses.count + 1 } : { tier, count: 1 };
}

/**
 * True when Guided should be kindly offered: enough lost runs in a row on this floor, not on
 * Guided already, and not offered yet today (`today` is the local date, YYYY-MM-DD).
 * Only an offer: the difficulty never changes unless the player picks it.
 */
export function shouldOfferGuided(profile: Profile, tier: number, rules: GuidedOfferRules, today: string): boolean {
  const losses = profile.floorLosses;
  return profile.difficulty !== 'guided' && profile.guidedOfferedOn !== today && losses?.tier === tier && losses.count >= rules.offerAfterLosses;
}

/** The offer was shown (whatever the answer): not again today. */
export function markGuidedOffered(profile: Profile, today: string): void {
  profile.guidedOfferedOn = today;
}

/** The player picks a difficulty in Settings; from now on it's theirs. */
export function chooseDifficulty(profile: Profile, difficulty: Difficulty): void {
  profile.difficulty = difficulty;
  profile.difficultyChosenByPlayer = true;
}

/**
 * Only a brand-new profile plays the tutorial floor (M7-P2, Manager call): no run started
 * or finished yet. Saves from before runsStarted count their finished runs instead.
 */
export function getsTutorialFloor(profile: Pick<Profile, 'runsStarted' | 'runsPlayed'>): boolean {
  return profile.runsStarted === 0 && profile.runsPlayed === 0;
}

/**
 * P-MENU-f: should this Gate view ring the Seal's bell (and pop it)? Rings only the first time
 * the Seal for `beltId` is seen lit. An old save (sealsSeen null) is migrated silently: a Seal
 * that is already lit counts as seen, so returning players get no bell. Only ever adds ids.
 */
export function sealBell(profile: Profile, beltId: string, lit: boolean): boolean {
  const old = profile.sealsSeen === null;
  const seen = profile.sealsSeen ?? [];
  profile.sealsSeen = seen;
  if (!lit || seen.includes(beltId)) return false;
  seen.push(beltId);
  return !old;
}
