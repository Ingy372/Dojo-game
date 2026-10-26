// Decor earning (S7): how Home Dojo pieces are given outside Tower chests.
//  - Class pieces: real classes at the dojo. One every 2 classes at White belt, then one
//    every 3. The first sync gives one welcome piece; after that only new check-ins count.
//    They come in a fixed order (C10): the class scrolls in curriculum order, then gear.
//  - Journal trophies: the first defeat of each monster kind, on a win or a loss.
//  - Keeper statues: statue N the first time the Floor Keeper is beaten at belt tier N.
//  - The folding screen: once every Tier 1 Journal trophy is earned.
// Kids rules: nothing is ever taken away, nothing has a deadline, there are no streaks.
// Test-link runs give nothing.

import type { Content } from './content';
import { addDecorations, type DecorationDef, type DojoState, type DropBelt, type NewDecoration } from './dojo';
import type { Profile } from './profile';
import type { RunSummary } from './run';

/** Classes per class piece at White belt (tier 1), and after it (Manager call). */
export const CLASSES_PER_PIECE = { white: 2, after: 3 } as const;

/** The Floor Keeper's enemy id: beating it gives the keeper statue for that belt tier. */
export const KEEPER_ENEMY = 'floor-keeper';
/** B-T3: every floor's Guardian counts for the keeper statue (the Hearth Cook guards the Orange floor). */
export const FLOOR_GUARDIANS = [KEEPER_ENEMY, 'hearth-cook'];

export interface DecorEarning {
  /** Classes the game has counted (never goes down), or null until the first sync. */
  classesCounted: number | null;
  /** New classes since the last class piece. */
  classesToward: number;
  /** Class dates (YYYY-MM-DD) already counted (only the ones still in the feed's window are kept). */
  countedCheckIns: string[];
  /** Class pieces given so far: the next one is classPieceOrder[classPiecesGiven]. */
  classPiecesGiven: number;
  /** Trophies, statues and the folding screen already given (each only once). */
  given: string[];
}

export function newDecorEarning(): DecorEarning {
  return { classesCounted: null, classesToward: 0, countedCheckIns: [], classPiecesGiven: 0, given: [] };
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
    classesToward: n(e.classesToward),
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

function classesPerPiece(tier: number): number {
  return tier <= 1 ? CLASSES_PER_PIECE.white : CLASSES_PER_PIECE.after;
}

/**
 * Counts new class check-ins and gives class pieces into the dojo. Returns the pieces given.
 * The first sync seeds the counter from the feed (old saves: classesInRank) and gives one
 * welcome piece, so a long history never floods the dojo.
 */
export function syncClassPieces(profile: Profile, dojo: DojoState, content: Content, info: ClassInfo): string[] {
  const rec = profile.decorEarning;
  const order = classPieceOrder(content);
  const earned: string[] = [];
  const give = () => {
    const def = order[rec.classPiecesGiven];
    if (!def) return;
    rec.classPiecesGiven++;
    earned.push(def.id);
  };
  // One class per date (YYYY-MM-DD): the same day checked in twice counts once.
  const live = new Set(info.checkIns.map((c) => c.slice(0, 10)));
  if (rec.classesCounted === null) {
    rec.classesCounted = Math.max(info.classesInRank, info.classesTotal ?? 0, live.size);
    rec.countedCheckIns = [...live];
    give();
  } else {
    const counted = new Set(rec.countedCheckIns);
    let added = 0;
    for (const c of live) {
      if (counted.has(c)) continue;
      counted.add(c);
      added++;
    }
    rec.countedCheckIns = [...counted].filter((c) => live.has(c));
    rec.classesCounted = Math.max(rec.classesCounted + added, info.classesTotal ?? 0);
    rec.classesToward += added;
    const per = classesPerPiece(info.belt.tier);
    while (rec.classesToward >= per) {
      rec.classesToward -= per;
      give();
    }
    // All class pieces given: extra classes don't pile up.
    if (rec.classPiecesGiven >= order.length) rec.classesToward = 0;
  }
  addDecorations(dojo, earned.map((id) => ({ id, belt: { ...info.belt } })));
  return earned;
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
