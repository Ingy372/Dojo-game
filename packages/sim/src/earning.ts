// Decor earning (S7): how Home Dojo pieces are given outside Tower chests.
//  - Class Chests (LP-B3): one for every real class, with no end. The first sync gives one
//    welcome chest; after that only new check-ins count. Each holds the next class piece in a
//    fixed order (C10: the class scrolls in curriculum order, then gear decor), and once those
//    are all given, one piece of Uncommon or better gear for the bag.
//  - Journal trophies: the first defeat of each monster kind, on a win or a loss.
//  - Keeper statues: statue N the first time the Floor Keeper is beaten at belt tier N.
//  - The folding screen: once every Tier 1 Journal trophy is earned.
// Kids rules: nothing is ever taken away, nothing has a deadline, there are no streaks.
// Test-link runs give nothing.

import { CLASS_CHEST, COINS } from './config';
import type { Content } from './content';
import { addDecorations, type AchievementStat, type DecorationDef, type DojoState, type DropBelt, type NewDecoration } from './dojo';
import { makeItem, rollRarity, type GearItem } from './loot';
import type { Profile } from './profile';
import { createRng } from './rng';
import type { RunSummary } from './run';

/** The Floor Keeper's enemy id: beating it gives the keeper statue for that belt tier. */
export const KEEPER_ENEMY = 'floor-keeper';
/** B-T3: every floor's Guardian counts for the keeper statue (the Hearth Cook guards the Orange floor). */
export const FLOOR_GUARDIANS = [KEEPER_ENEMY, 'hearth-cook'];

export interface DecorEarning {
  /** Classes the game has counted (never goes down), or null until the first sync. */
  classesCounted: number | null;
  /** Class dates (YYYY-MM-DD) already counted (only the ones still in the feed's window are kept). */
  countedCheckIns: string[];
  /** Class pieces given so far: the next one is classPieceOrder[classPiecesGiven]. */
  classPiecesGiven: number;
  /** Trophies, statues and the folding screen already given (each only once). */
  given: string[];
}

export function newDecorEarning(): DecorEarning {
  return { classesCounted: null, countedCheckIns: [], classPiecesGiven: 0, given: [] };
}

/** Reads a saved record, falling back to a fresh one for old saves or damaged data. */
export function readDecorEarning(v: unknown): DecorEarning {
  const fresh = newDecorEarning();
  if (!v || typeof v !== 'object') return fresh;
  const e = v as Partial<DecorEarning>;
  const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? Math.floor(x) : 0);
  const strings = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : []);
  return {
    classesCounted: e.classesCounted === null || e.classesCounted === undefined ? null : n(e.classesCounted),
    countedCheckIns: strings(e.countedCheckIns),
    classPiecesGiven: n(e.classPiecesGiven),
    given: strings(e.given),
  };
}

/** What the game knows about real classes right now. */
export interface ClassInfo {
  checkIns: readonly string[];
  classesInRank: number;
  classesTotal: number | null;
  /** The student's belt now (class pieces remember it for colour 2). */
  belt: DropBelt;
}

/** The class pieces in the order they are given: file order (C10 scrolls first, then gear). */
export function classPieceOrder(content: Content): DecorationDef[] {
  return content.dojo.decorations.filter((d) => d.source === 'class');
}

/** What one Class Chest held: the next class piece for the dojo, or gear for the bag. */
export type ClassChest = { kind: 'decor'; id: string } | { kind: 'gear'; item: GearItem } | { kind: 'coins' };

/**
 * Counts new class check-ins (or the growth in the feed's class total, whichever is more) and
 * opens one Class Chest for each, with no end. The first sync
 * seeds the counter from the feed (old saves: classesInRank) and opens one welcome chest, so a
 * long history never floods the dojo. Gear goes into the bag and fills an empty slot.
 */
export function openClassChests(profile: Profile, dojo: DojoState, content: Content, info: ClassInfo): ClassChest[] {
  const rec = profile.decorEarning;
  // One class per date (YYYY-MM-DD): the same day checked in twice counts once.
  const live = new Set(info.checkIns.map((c) => c.slice(0, 10)));
  let chests = 0;
  if (rec.classesCounted === null) {
    rec.classesCounted = Math.max(info.classesInRank, info.classesTotal ?? 0, live.size);
    rec.countedCheckIns = [...live];
    chests = 1;
  } else {
    const counted = new Set(rec.countedCheckIns);
    for (const c of live) {
      if (counted.has(c)) continue;
      counted.add(c);
      chests++;
    }
    rec.countedCheckIns = [...counted].filter((c) => live.has(c));
    // Classes that fell out of the feed's window while the app was closed still count.
    if (info.classesTotal !== null) chests = Math.max(chests, info.classesTotal - rec.classesCounted);
    rec.classesCounted = Math.max(rec.classesCounted + chests, info.classesTotal ?? 0);
  }
  const order = classPieceOrder(content);
  const rng = createRng(rec.classesCounted * 7919 + profile.nextItemId);
  const opened: ClassChest[] = [];
  let gearGiven = 0;
  for (let i = 0; i < chests; i++) {
    const def = order[rec.classPiecesGiven];
    if (def) {
      rec.classPiecesGiven++;
      opened.push({ kind: 'decor', id: def.id });
      continue;
    }
    // A long time away: past the gear limit, the chest holds its coins only (CLASS_CHEST).
    if (gearGiven >= CLASS_CHEST.maxGearPerVisit) {
      opened.push({ kind: 'coins' });
      continue;
    }
    gearGiven++;
    const item = makeItem(rng, content.loot, rollRarity(rng, 0, 'uncommon'), `i${profile.nextItemId++}`);
    profile.inventory.push(item);
    if (!profile.equipped[item.slot]) profile.equipped[item.slot] = item.uid;
    opened.push({ kind: 'gear', item });
  }
  profile.coins += COINS.classChest * chests;
  addDecorations(dojo, opened.flatMap((c) => (c.kind === 'decor' ? [{ id: c.id, belt: { ...info.belt } }] : [])));
  return opened;
}

/**
 * The one-time pieces a finished run earns: a Journal trophy for each monster kind beaten
 * for the first time, the keeper statue for this belt tier, and the folding screen once
 * every Tier 1 trophy is in. Kept on a loss. Test-link runs give nothing.
 */
export function oneTimeRunPieces(profile: Profile, content: Content, summary: Pick<RunSummary, 'test' | 'tier' | 'defeated'>): string[] {
  if (summary.test) return [];
  const rec = profile.decorEarning;
  const out: string[] = [];
  const give = (d: DecorationDef | undefined) => {
    if (!d || rec.given.includes(d.id)) return;
    rec.given.push(d.id);
    out.push(d.id);
  };
  const decos = content.dojo.decorations;
  for (const kind of summary.defeated) give(decos.find((d) => d.source === 'trophy' && d.monster === kind));
  if (FLOOR_GUARDIANS.some((g) => summary.defeated.includes(g))) give(decos.find((d) => d.source === 'keeper' && d.keeperFloor === summary.tier));
  const tier1 = decos.filter((d) => d.source === 'trophy' && d.journalTier === 1);
  if (tier1.length > 0 && tier1.every((d) => rec.given.includes(d.id))) give(decos.find((d) => d.source === 'bonus'));
  return out;
}

/**
 * Banks a finished run's decorations: the surprise pieces it found (with their colour roll),
 * then its one-time pieces. All remember the run's belt. Test-link runs add nothing.
 */
export function bankRunDecorations(profile: Profile, dojo: DojoState, content: Content, summary: RunSummary, belt: DropBelt): string[] {
  if (summary.test) return [];
  const found: NewDecoration[] = summary.decorations.map((id, i) => {
    const colour = summary.decorationColours?.[i] ?? null;
    return colour ? { id, colour, belt: { ...belt } } : { id, belt: { ...belt } };
  });
  const oneTime = oneTimeRunPieces(profile, content, summary);
  addDecorations(dojo, [...found, ...oneTime.map((id) => ({ id, belt: { ...belt } }))]);
  return oneTime;
}

/** One monster kind in the Journal, from its trophy's content (no story text of its own). */
export interface JournalKind {
  monster: string;
  trophy: DecorationDef;
  /** Its trophy has been given: the kind has been beaten once. */
  met: boolean;
}

/** The monster kinds the Journal trophies stand for, by Journal tier then file order. */
export function journalKinds(content: Content, given: readonly string[]): JournalKind[] {
  return content.dojo.decorations
    .filter((d) => d.source === 'trophy' && d.monster)
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (a.d.journalTier ?? 1) - (b.d.journalTier ?? 1) || a.i - b.i)
    .map(({ d }) => ({ monster: d.monster!, trophy: d, met: given.includes(d.id) }));
}

/** Nov 22: how far the student is on an achievement stat (each only goes up). */
export function achievementValue(profile: Profile, stat: AchievementStat): number {
  switch (stat) {
    case 'runs':
      return profile.runsPlayed;
    case 'floors':
      return profile.floorsCleared;
    case 'combo':
      return profile.bests.longestCombo;
    case 'perfects':
      return profile.bests.mostPerfects;
    case 'kataClean':
      return Object.values(profile.kataBests).filter((b) => b.fewestWrong === 0).length;
    case 'starWall':
      return profile.starWallBest;
    case 'journal':
      return Object.values(profile.monsterJournal).filter((e) => e.beaten).length;
    case 'guardians':
      // One keeper statue per floor Guardian beaten (FLOOR_GUARDIANS give the statue of their belt tier).
      return profile.decorEarning.given.filter((g) => g.startsWith('decor-a6-keeper-statue')).length;
    case 'level':
      return profile.level;
  }
}

/** The achievement pieces earned and not yet given: adds them to the dojo's storage (each once) and returns their ids. */
export function giveAchievementPieces(profile: Profile, dojo: DojoState, content: Content): string[] {
  const out: string[] = [];
  for (const def of content.dojo.decorations) {
    const a = def.achievement;
    if (!a || profile.decorEarning.given.includes(def.id)) continue;
    if (achievementValue(profile, a.stat) < a.atLeast) continue;
    profile.decorEarning.given.push(def.id);
    out.push(def.id);
  }
  if (out.length) addDecorations(dojo, out);
  return out;
}
