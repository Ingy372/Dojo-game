// B-BELT: a grown-up types in the student's real belt and stripes (behind the grown-up gate),
// until the DojoForge feed sends them. It stays on this phone, inside the save. It can only
// ever raise progress: an entry below what the save or the feed already shows is ignored.

import { POWER } from './config';
import type { FeedBelt, StudentFeed } from './feed';

export interface BeltEntry {
  belt: string;
  /** Stripes on that belt, 0 to POWER.stripesPerBelt. */
  stripes: number;
}

/** Words for entered stripes (a grown-up enters how many, not which): the first virtue words. */
export const ENTRY_STRIPE_WORDS = ['Respect', 'Great Effort'] as const;

/** A saved entry, or null when it is missing or broken. */
export function readBeltEntry(v: unknown): BeltEntry | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.belt !== 'string' || typeof o.stripes !== 'number' || !Number.isInteger(o.stripes)) return null;
  return { belt: o.belt, stripes: Math.max(0, Math.min(POWER.stripesPerBelt, o.stripes)) };
}

/** Orders entries: belt first, then stripes. -1 for an unknown belt. */
export function entryRank(belts: readonly FeedBelt[], e: BeltEntry): number {
  const i = belts.findIndex((b) => b.id === e.belt);
  return i < 0 ? -1 : i * (POWER.stripesPerBelt + 1) + Math.min(POWER.stripesPerBelt, e.stripes);
}

/** What the feed itself shows: its belt and the stripes on it. */
export function feedEntry(feed: StudentFeed): BeltEntry {
  const belt = feed.rank.currentBelt;
  return { belt, stripes: Math.min(POWER.stripesPerBelt, feed.stripes.filter((s) => s.belt === belt).length) };
}

/** The entry to save: the higher of the old one and the new one (never lowers). */
export function recordBeltEntry(belts: readonly FeedBelt[], prev: BeltEntry | null, next: BeltEntry): BeltEntry | null {
  const n = readBeltEntry(next);
  if (!n || entryRank(belts, n) < 0) return prev;
  return prev && entryRank(belts, prev) >= entryRank(belts, n) ? prev : n;
}

/** The feed with the entry applied, when the entry is above what the feed shows; else the feed unchanged. */
export function applyBeltEntry(feed: StudentFeed, entry: BeltEntry | null): StudentFeed {
  const belts = feed.school.belts;
  const e = entry && readBeltEntry(entry);
  if (!e || entryRank(belts, e) <= entryRank(belts, feedEntry(feed))) return feed;
  const day = feed.asOf.slice(0, 10);
  const idx = belts.findIndex((b) => b.id === e.belt);
  const sameBelt = e.belt === feed.rank.currentBelt;
  const stripes = feed.stripes.filter((s) => belts.findIndex((b) => b.id === s.belt) <= idx);
  for (let have = stripes.filter((s) => s.belt === e.belt).length; have < e.stripes; have++) {
    stripes.push({ word: ENTRY_STRIPE_WORDS[have % ENTRY_STRIPE_WORDS.length], belt: e.belt, earnedOn: day });
  }
  if (sameBelt) return { ...feed, stripes };
  const history = feed.rank.history.filter((h) => belts.findIndex((b) => b.id === h.belt) <= idx);
  for (let i = 0; i <= idx; i++) if (!history.some((h) => h.belt === belts[i].id)) history.push({ belt: belts[i].id, earnedOn: day });
  return {
    ...feed,
    rank: { ...feed.rank, currentBelt: e.belt, history },
    // A new belt starts fresh: its sign-offs, class count and test approval come later.
    requirements: [],
    catchUp: [],
    stripes,
    attendance: { ...feed.attendance, classesInRank: 0 },
    testing: { approved: false, testDate: null },
  };
}
