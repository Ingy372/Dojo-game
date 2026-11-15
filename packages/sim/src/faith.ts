// LP-B2 (L5): the school's faith layer (content/faith/). Never a lock or a quiz: the FAITH DOES
// banner lights a letter at each real promotion, each promotion finds a verse scroll, and the
// Creed Scroll is there from the first class. Every shown word comes from the pack as written.

import type { TrainingState } from './training';

export interface FaithLetter {
  letter: string;
  word: string;
  earnedAt: string;
  meaning: string;
  lit: string;
}

export interface VerseScroll {
  id: string;
  name: string;
  promotion: { fromBelt: string; toBelt: string | null };
  reference: string;
  showText: 'wall' | 'kjv';
  kjvText: string;
  wallText: string;
  covenant: { name: string; text: string } | null;
  lines: { found: string; sensei: string };
}

export interface FaithPack {
  creedScroll: { name: string; signedBy: string; text: string; motto: string; lines: { description: string; found: string; sensei: string } };
  faithDoesBanner: { name: string; acrostic: string; lines: { description: string; complete: string }; letters: FaithLetter[] };
  verseScrolls: VerseScroll[];
  guardianRestored: { template: string; guardians: { faithOverlayKey: string; line: string }[] };
}

const str = (v: unknown, at: string): string => {
  if (typeof v !== 'string' || !v) throw new Error(`faith pack: ${at} must be text`);
  return v;
};

/** Checks the pack's shape once, at load. A broken pack fails loudly instead of showing blanks. */
export function loadFaith(raw: unknown): FaithPack {
  const p = raw as FaithPack;
  str(p?.creedScroll?.text, 'creedScroll.text');
  const letters = p?.faithDoesBanner?.letters;
  if (!Array.isArray(letters) || letters.map((l) => l.letter).join('') !== str(p.faithDoesBanner.acrostic, 'acrostic').replace(/ /g, '')) throw new Error('faith pack: letters must spell the acrostic');
  letters.forEach((l, i) => ['word', 'earnedAt', 'meaning', 'lit'].forEach((k) => str((l as unknown as Record<string, unknown>)[k], `letters[${i}].${k}`)));
  if (!Array.isArray(p.verseScrolls)) throw new Error('faith pack: verseScrolls missing');
  p.verseScrolls.forEach((v, i) => {
    if (v.showText !== 'wall' && v.showText !== 'kjv') throw new Error(`faith pack: verseScrolls[${i}].showText`);
    str(verseText(v), `verseScrolls[${i}] text`);
    str(v.lines?.found, `verseScrolls[${i}].lines.found`);
  });
  return p;
}

/** The verse as the game shows it (Jay, Nov 14: the wall wording). */
export function verseText(v: VerseScroll): string {
  return v.showText === 'wall' ? v.wallText : v.kjvText;
}

const beltIndex = (t: TrainingState, id: string | null): number => (id ? t.belts.findIndex((b) => b.id === id) : -1);
const currentIndex = (t: TrainingState): number => t.tier - 1;

/** The banner: each letter is lit once the student's belt reaches the belt that lights it. */
export function bannerLetters(pack: FaithPack, t: TrainingState): { letter: FaithLetter; lit: boolean }[] {
  return pack.faithDoesBanner.letters.map((letter) => {
    const at = beltIndex(t, letter.earnedAt);
    return { letter, lit: at >= 0 && currentIndex(t) >= at };
  });
}

/** Verse scrolls found so far: one per promotion already earned, plus the last one for a student at its top belt. */
export function scrollsFound(pack: FaithPack, t: TrainingState): VerseScroll[] {
  const now = currentIndex(t);
  return pack.verseScrolls.filter((v) => {
    const to = beltIndex(t, v.promotion.toBelt);
    return to >= 0 ? now >= to : v.promotion.toBelt === null && beltIndex(t, v.promotion.fromBelt) === now;
  });
}

/** What a promotion to `toBelt` adds: its verse scroll and the letters it lights (more than one if belts were skipped). */
export function promotionFaith(pack: FaithPack, t: TrainingState, fromTier: number, toBelt: string): { scroll: VerseScroll | null; letters: FaithLetter[]; complete: boolean } {
  const to = beltIndex(t, toBelt);
  const letters = pack.faithDoesBanner.letters.filter((l) => {
    const at = beltIndex(t, l.earnedAt);
    return at > fromTier - 1 && at <= to;
  });
  const scroll = pack.verseScrolls.find((v) => v.promotion.toBelt === toBelt) ?? null;
  const complete = letters.length > 0 && pack.faithDoesBanner.letters.every((l) => beltIndex(t, l.earnedAt) <= to && beltIndex(t, l.earnedAt) >= 0);
  return { scroll, letters, complete };
}

/** The line when a Guardian is freed, keyed by its enemy id; null when the pack has none for it. */
export function guardianLine(pack: FaithPack, enemyId: string): string[] | null {
  const g = pack.guardianRestored.guardians.find((x) => x.faithOverlayKey === enemyId);
  return g ? [pack.guardianRestored.template, g.line] : null;
}

/** Sensei shows the Creed Scroll once, after the student's first class check-in. */
export function creedDue(seen: boolean, t: TrainingState): boolean {
  return !seen && t.classCheckIns.length > 0;
}
