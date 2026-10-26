// The training link (framework section 3, core-design section 9): turns a student's
// DojoForge progress into what the game shows and uses: belt tier, level cap, unlocked
// abilities, Virtues, the Gate, the Path card and the Dojo Blessing.
// Pure: "now" is passed in, never read from a clock.

import type { AbilityContent, FormDef, PerkDef, VirtueDef } from './abilities';
import { BLESSING, byTier, POWER, PROGRESSION, TRAINING_POINTS, TRAINING_POINTS_PER_BELT, TRAINING_STATS } from './config';
import { DAY_NAMES, type FeedBelt, type FeedStripe, type RequirementType, type StudentFeed } from './feed';

/** The moment the game is looking at the feed: a timestamp (ms) and today's weekday (0 = Sunday, local time). */
export interface Now {
  ms: number;
  weekday: number;
}

export type AbilityKind = 'form' | 'strike' | 'seal';
const KIND_OF: Record<RequirementType, AbilityKind> = { kata: 'form', kickCombo: 'strike', selfDefense: 'seal' };

/** One real requirement and where the student stands on it. */
export interface RequirementStatus {
  id: string;
  type: RequirementType;
  /** The real technique name, as taught at the school. */
  name: string;
  belt: string;
  beltName: string;
  signedOff: boolean;
  signedOffOn: string | null;
  signedOffBy: string | null;
  /** Counted as signed off because the student already passed this rank (the legacy grant). */
  legacy: boolean;
  /** An unfinished item from an earlier rank. Never on the Gate; never blocks testing. */
  catchUp: boolean;
  videoId: string | null;
}

/** A requirement's game ability (a Form, a Strike upgrade, or a Technique Seal). */
export interface AbilityInfo {
  requirement: RequirementStatus;
  kind: AbilityKind;
  /** The game power it maps to; null when it arrives in a later update. */
  form: FormDef | null;
  perk: PerkDef | null;
  unlocked: boolean;
}

export interface VirtueInfo {
  def: VirtueDef;
  word: string;
  /** 1 = I, 2 = II... (the same word earned again at a later belt). */
  rank: number;
  earned: FeedStripe[];
}

export interface BeltInfo {
  id: string;
  name: string;
  color: string;
  color2: string | null;
  /** 1 = the first belt. */
  tier: number;
  degree: number;
}

export interface GateState {
  /** The belt the Gate leads to, or null at the top of the Tower. */
  toBelt: BeltInfo | null;
  /** One lock per requirement of the current rank. Catch-up items never appear here. */
  locks: RequirementStatus[];
  lit: number;
  /** Time in rank: classes attended / classes before testing (0 to 1). */
  sundial: number;
  classesInRank: number;
  classesBeforeTest: number;
  /** Sensei's Seal: approved to test. */
  sealLit: boolean;
  testDate: string | null;
  /** Every lock lit: the Gate glows "Ready". */
  ready: boolean;
}

export interface PathCard {
  /** The next real step: the next unsigned requirement (current rank first, then catch-up). */
  next: RequirementStatus | null;
  /** "Today", "Wednesday"... or null if no class days are set. */
  nextClassDay: string | null;
  testDate: string | null;
}

export interface TrainingState {
  studentId: string;
  firstName: string;
  /** The student's age band from the feed, like "6-9" or "10-13". */
  ageBand: string;
  displayName: string;
  schoolName: string;
  belts: FeedBelt[];
  belt: BeltInfo;
  tier: number;
  /** Max Power Rating for this rank (hidden from players). */
  tierMax: number;
  levelCap: number;
  /** Players below this level earn double experience. */
  expectedLevel: number;
  requirements: RequirementStatus[];
  abilities: AbilityInfo[];
  virtues: VirtueInfo[];
  /** The Virtue taken into fights (highest rank, then the most recent). */
  virtue: VirtueInfo | null;
  /** Stripes earned at the current belt (shown on the character's belt). */
  stripesThisBelt: number;
  totalStripes: number;
  /** R-BAL-12: stripes per belt id (at most POWER.stripesPerBelt each), rebuilt by migrateStripesByBelt. */
  stripesByBelt: Record<string, number>;
  gate: GateState;
  path: PathCard;
  blessed: boolean;
  /** When the Blessing ends (ms), or null. */
  blessingEndsMs: number | null;
  lastClass: string | null;
  /** Class check-ins so far (feed recentClasses up to now): each new one counts toward class pieces. */
  classCheckIns: string[];
  /** Lifetime classes from the feed, or null if the feed doesn't send it. */
  classesTotal: number | null;
  trainingPoints: number;
  approvedMinutes: number;
}

const FULL_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function beltInfo(belts: readonly FeedBelt[], id: string): BeltInfo {
  const i = belts.findIndex((b) => b.id === id);
  const b = belts[i];
  return { id: b.id, name: b.name, color: b.color, color2: b.color2, tier: i + 1, degree: b.degree };
}

/** Max Power Rating for the n-th belt: +1,000 per belt, +500 per black belt degree. */
export function tierMaxFor(belts: readonly FeedBelt[], tier: number): number {
  let max = 0;
  for (let i = 0; i < tier && i < belts.length; i++) max += belts[i].degree > 0 ? POWER.perDegree : POWER.perTier;
  return max;
}

export function levelCapFor(tier: number): number {
  return tier * PROGRESSION.levelsPerTier;
}

export function buildTraining(feed: StudentFeed, abilities: AbilityContent, now: Now): TrainingState {
  const belts = feed.school.belts;
  const idx = belts.findIndex((b) => b.id === feed.rank.currentBelt);
  const belt = beltInfo(belts, feed.rank.currentBelt);
  const tier = idx + 1;

  // Requirements of every rank up to now. Ranks already passed count as signed off
  // (the legacy grant), except catch-up items that still need doing.
  const catchUp = new Map(feed.catchUp.map((r) => [r.id, r]));
  const current = new Map(feed.requirements.map((r) => [r.id, r]));
  const requirements: RequirementStatus[] = [];
  for (let i = 0; i <= idx; i++) {
    const b = belts[i];
    for (const item of b.requirements) {
      const base = { id: item.id, type: item.type, name: item.name, belt: b.id, beltName: b.name, videoId: item.videoId };
      const fromFeed = i === idx ? current.get(item.id) : catchUp.get(item.id);
      if (i < idx && !fromFeed) {
        requirements.push({ ...base, signedOff: true, signedOffOn: null, signedOffBy: null, legacy: true, catchUp: false });
      } else {
        requirements.push({
          ...base,
          signedOff: fromFeed?.signedOff ?? false,
          signedOffOn: fromFeed?.signedOffOn ?? null,
          signedOffBy: fromFeed?.signedOffBy ?? null,
          legacy: false,
          catchUp: i < idx,
          videoId: fromFeed?.videoId ?? item.videoId,
        });
      }
    }
  }

  // Each kata unlocks the next Form, each kick combo the next Strike upgrade, each
  // self-defense technique the next Technique Seal, in curriculum order.
  const seen: Record<AbilityKind, number> = { form: 0, strike: 0, seal: 0 };
  const abilityList: AbilityInfo[] = requirements.map((r) => {
    const kind = KIND_OF[r.type];
    const n = seen[kind]++;
    return {
      requirement: r,
      kind,
      form: kind === 'form' ? abilities.forms[n + 1] ?? null : null,
      perk: kind === 'strike' ? abilities.strikes[n] ?? null : kind === 'seal' ? abilities.seals[n] ?? null : null,
      unlocked: r.signedOff,
    };
  });

  // Stripes become Virtues; the same word again ranks it up.
  const virtues: VirtueInfo[] = [];
  for (const s of feed.stripes) {
    const def = abilities.virtues.find((v) => v.words.includes(s.word));
    if (!def) continue;
    const v = virtues.find((x) => x.def.id === def.id);
    if (v) {
      v.rank++;
      v.earned.push(s);
    } else virtues.push({ def, word: s.word, rank: 1, earned: [s] });
  }
  const latest = (v: VirtueInfo) => Date.parse(v.earned[v.earned.length - 1].earnedOn);
  const virtue = virtues.slice().sort((a, b) => b.rank - a.rank || latest(b) - latest(a))[0] ?? null;

  // The Gate: one lock per current requirement, the sundial, and Sensei's Seal.
  const locks = requirements.filter((r) => r.belt === belt.id);
  const lit = locks.filter((r) => r.signedOff).length;
  const next = idx + 1 < belts.length ? beltInfo(belts, belts[idx + 1].id) : null;
  const classesBeforeTest = belts[idx].classesBeforeTest;
  const gate: GateState = {
    toBelt: next,
    locks,
    lit,
    sundial: classesBeforeTest > 0 ? Math.min(1, feed.attendance.classesInRank / classesBeforeTest) : 1,
    classesInRank: feed.attendance.classesInRank,
    classesBeforeTest,
    sealLit: feed.testing.approved,
    testDate: feed.testing.approved ? feed.testing.testDate : null,
    ready: locks.length > 0 && lit === locks.length,
  };

  const nextStep = locks.find((r) => !r.signedOff) ?? requirements.find((r) => r.catchUp && !r.signedOff) ?? null;

  // The Dojo Blessing: a class in the last 48 hours.
  const classes = feed.attendance.recentClasses.map((d) => Date.parse(d)).filter((t) => t <= now.ms);
  const last = classes.length > 0 ? Math.max(...classes) : null;
  const endsMs = last === null ? null : last + BLESSING.hours * 3600 * 1000;
  const blessed = endsMs !== null && now.ms < endsMs;

  const stripesThisBelt = Math.min(POWER.stripesPerBelt, feed.stripes.filter((s) => s.belt === belt.id).length);

  return {
    studentId: feed.student.id,
    firstName: feed.student.firstName,
    ageBand: feed.student.ageBand,
    displayName: `${feed.student.firstName} ${feed.student.lastInitial}.`,
    schoolName: feed.school.name,
    belts,
    belt,
    tier,
    tierMax: tierMaxFor(belts, tier),
    levelCap: levelCapFor(tier),
    expectedLevel: tier === 1 ? 1 : levelCapFor(tier - 1),
    requirements,
    abilities: abilityList,
    virtues,
    virtue,
    stripesThisBelt,
    totalStripes: feed.stripes.length,
    stripesByBelt: migrateStripesByBelt(belts, feed.stripes, feed.stripes.length, idx),
    gate,
    path: { next: nextStep, nextClassDay: nextClassDay(feed.attendance.classDays, now.weekday), testDate: gate.testDate },
    blessed,
    blessingEndsMs: blessed ? endsMs : null,
    lastClass: last === null ? null : feed.attendance.recentClasses.find((d) => Date.parse(d) === last) ?? null,
    classCheckIns: feed.attendance.recentClasses.filter((d) => Date.parse(d) <= now.ms),
    classesTotal: feed.attendance.classesTotal,
    trainingPoints: Math.floor(feed.homePractice.approvedMinutes / TRAINING_POINTS.minutesPerPoint),
    approvedMinutes: feed.homePractice.approvedMinutes,
  };
}

/** "Today" if today is a class day, otherwise the next class day's name. */
export function nextClassDay(classDays: readonly string[], weekday: number): string | null {
  const days = classDays.map((d) => DAY_NAMES.indexOf(d)).filter((d) => d >= 0);
  if (days.length === 0) return null;
  for (let i = 0; i < 7; i++) {
    const d = (weekday + i) % 7;
    if (days.includes(d)) return i === 0 ? 'Today' : FULL_DAY[d];
  }
  return null;
}

/** The Forms the player can switch between: the Beginner's Stance plus up to 3 earned Forms (newest first). */
export function unlockedForms(training: TrainingState, abilities: AbilityContent): FormDef[] {
  const earned = training.abilities.filter((a) => a.kind === 'form' && a.unlocked && a.form).map((a) => a.form!);
  return [abilities.forms[0], ...earned.slice(-3)];
}

/** "Shield of Respect II" */
export function virtueTitle(v: VirtueInfo): string {
  return v.rank > 1 ? `${v.def.name} ${roman(v.rank)}` : v.def.name;
}

export function roman(n: number): string {
  const table: Array<[number, string]> = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of table) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}

/**
 * R-BAL-12 save migration: stripes per belt, from the feed. Never lowers anything: if the
 * feed names fewer stripes than `totalStripes` (an older save only kept the count), the
 * extra stripes go on the oldest belts with room (POWER.stripesPerBelt each), then on the
 * current belt. Stripes on unknown belts count the same way.
 */
export function migrateStripesByBelt(
  belts: readonly FeedBelt[],
  stripes: readonly { belt: string }[],
  totalStripes: number,
  currentIdx: number,
): Record<string, number> {
  const cap = POWER.stripesPerBelt;
  const out: Record<string, number> = {};
  const last = Math.max(0, Math.min(currentIdx, belts.length - 1));
  let placed = 0;
  for (const s of stripes) {
    const i = belts.findIndex((b) => b.id === s.belt);
    if (i < 0 || i > last || (out[s.belt] ?? 0) >= cap) continue;
    out[s.belt] = (out[s.belt] ?? 0) + 1;
    placed++;
  }
  let extra = Math.max(totalStripes, stripes.length) - placed;
  for (let i = 0; i <= last && extra > 0; i++) {
    const id = belts[i].id;
    const room = cap - (out[id] ?? 0);
    const n = Math.min(room, extra);
    if (n > 0) out[id] = (out[id] ?? 0) + n;
    extra -= Math.max(0, n);
  }
  if (extra > 0 && belts.length > 0) out[belts[last].id] = (out[belts[last].id] ?? 0) + extra;
  return out;
}

export interface TrainingStats {
  power: number;
  maxHealth: number;
  guard: number;
}

/** R-BAL-12: whole-number stats from real training. Adds only: more training never lowers a stat. */
export function trainingStats(t: Pick<TrainingState, 'belts' | 'tier' | 'requirements' | 'stripesByBelt' | 'trainingPoints'>): TrainingStats {
  const out: TrainingStats = { power: 0, maxHealth: 0, guard: 0 };
  const tierOf = (id: string) => {
    const i = t.belts.findIndex((b) => b.id === id);
    return i < 0 ? t.tier : i + 1;
  };
  for (const r of t.requirements) {
    if (!r.signedOff) continue;
    const v = byTier(TRAINING_STATS, tierOf(r.belt)).signOff;
    out.power += v.power;
    out.maxHealth += v.maxHealth;
  }
  for (const [belt, n] of Object.entries(t.stripesByBelt)) out.guard += byTier(TRAINING_STATS, tierOf(belt)).stripe.guard * n;
  const points = Math.min(t.trainingPoints, TRAINING_POINTS_PER_BELT * t.tier);
  for (let n = 1; n <= points; n++) out.maxHealth += byTier(TRAINING_STATS, Math.ceil(n / TRAINING_POINTS_PER_BELT)).trainingPoint.maxHealth;
  return out;
}
