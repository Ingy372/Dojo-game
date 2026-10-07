// The progress feed from DojoForge (framework section 14): one read-only record per
// student. Until Nic's real feed exists, fake profiles in fixtures/ have exactly this
// shape. The game only reads it; nothing here ever changes DojoForge.

export type RequirementType = 'kata' | 'kickCombo' | 'selfDefense';
export const REQUIREMENT_TYPES: readonly RequirementType[] = ['kata', 'kickCombo', 'selfDefense'];

/** One requirement in the school's curriculum (names come from the school, never the game). */
export interface CurriculumItem {
  id: string;
  type: RequirementType;
  name: string;
  /** The technique video in the student app's library, if any. */
  videoId: string | null;
}

/** One belt in the school's ordered belt list. */
export interface FeedBelt {
  id: string;
  name: string;
  /** Belt color for the character, "#rrggbb". */
  color: string;
  /** A second color for striped belts (for example red/black), or null. */
  color2: string | null;
  /** 0 for colored belts and black belt; 1, 2, ... for black belt degrees. */
  degree: number;
  /** The school's typical time in this rank (for experience pacing). */
  typicalMonthsInRank: number;
  /** Classes in this rank before the student can test (the Gate's sundial). */
  classesBeforeTest: number;
  requirements: CurriculumItem[];
}

/** A requirement's status for this student. */
export interface FeedRequirement {
  id: string;
  /** The belt it belongs to (catch-up items belong to earlier belts). */
  belt: string;
  type: RequirementType;
  name: string;
  signedOff: boolean;
  /** "YYYY-MM-DD" or null. */
  signedOffOn: string | null;
  /** Who signed it off, for example "Sensei Jay". */
  signedOffBy: string | null;
  videoId: string | null;
}

export interface FeedStripe {
  word: string;
  belt: string;
  earnedOn: string;
}

export interface StudentFeed {
  feedVersion: 1;
  /** When the feed was produced (ISO date and time). */
  asOf: string;
  student: { id: string; firstName: string; lastInitial: string; schoolId: string; ageBand: string };
  school: { id: string; name: string; belts: FeedBelt[] };
  rank: {
    currentBelt: string;
    trainingStartDate: string;
    /** Every belt earned, with dates, including ranks earned before DojoForge (for the legacy grant). */
    history: Array<{ belt: string; earnedOn: string }>;
  };
  /** Every requirement of the current rank. */
  requirements: FeedRequirement[];
  /** Unfinished (or finished) items from earlier ranks. They never block testing. */
  catchUp: FeedRequirement[];
  stripes: FeedStripe[];
  attendance: {
    /** Recent class check-ins (ISO date and time), newest last. */
    recentClasses: string[];
    /** Assigned class days, e.g. ["Mon", "Wed"]. */
    classDays: string[];
    /** Classes attended since the last promotion (the Gate's sundial). */
    classesInRank: number;
  };
  /** Sensei's Seal: approved to test, and the test date once scheduled. */
  testing: { approved: boolean; testDate: string | null };
  streak: { weeks: number };
  homePractice: { approvedMinutes: number; recent: Array<{ date: string; minutes: number }> };
  accolades: Array<{ name: string; earnedOn: string }>;
  classGoals: Array<{ name: string; status: 'active' | 'completed' }>;
}

export class FeedError extends Error {
  constructor(problem: string) {
    super(`Student profile has a problem: ${problem}`);
    this.name = 'FeedError';
  }
}

const fail = (problem: string): never => {
  throw new FeedError(problem);
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function obj(v: unknown, where: string): Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) fail(`${where} must be an object`);
  return v as Record<string, unknown>;
}
function list(v: unknown, where: string): unknown[] {
  if (!Array.isArray(v)) fail(`${where} must be a list`);
  return v as unknown[];
}
function text(v: unknown, where: string): string {
  if (typeof v !== 'string' || v === '') fail(`${where} must be a non-empty text`);
  return v as string;
}
function textOrNull(v: unknown, where: string): string | null {
  return v === null || v === undefined ? null : text(v, where);
}
function count(v: unknown, where: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) fail(`${where} must be a number of 0 or more`);
  return v as number;
}
function date(v: unknown, where: string): string {
  const s = text(v, where);
  if (Number.isNaN(Date.parse(s))) fail(`${where} must be a date like 2026-10-07`);
  return s;
}

function requirement(v: unknown, where: string, belt?: string): FeedRequirement {
  const r = obj(v, where);
  if (!REQUIREMENT_TYPES.includes(r.type as RequirementType)) fail(`${where}.type must be one of: ${REQUIREMENT_TYPES.join(', ')}`);
  const signedOff = r.signedOff === true;
  return {
    id: text(r.id, `${where}.id`),
    belt: belt ?? text(r.belt, `${where}.belt`),
    type: r.type as RequirementType,
    name: text(r.name, `${where}.name`),
    signedOff,
    signedOffOn: signedOff ? date(r.signedOffOn, `${where}.signedOffOn`) : null,
    signedOffBy: signedOff ? textOrNull(r.signedOffBy, `${where}.signedOffBy`) : null,
    videoId: textOrNull(r.videoId, `${where}.videoId`),
  };
}

/** Checks a student feed (or fake profile) and returns it in a clean shape. */
export function loadFeed(data: unknown): StudentFeed {
  const f = obj(data, 'the profile');
  if (f.feedVersion !== 1) fail('"feedVersion" must be 1');
  const s = obj(f.student, '"student"');
  const school = obj(f.school, '"school"');
  const belts: FeedBelt[] = list(school.belts, '"school.belts"').map((b, i) => {
    const where = `"school.belts[${i + 1}]"`;
    const o = obj(b, where);
    return {
      id: text(o.id, `${where}.id`),
      name: text(o.name, `${where}.name`),
      color: text(o.color, `${where}.color`),
      color2: textOrNull(o.color2, `${where}.color2`),
      degree: o.degree === undefined ? 0 : count(o.degree, `${where}.degree`),
      typicalMonthsInRank: count(o.typicalMonthsInRank, `${where}.typicalMonthsInRank`),
      classesBeforeTest: count(o.classesBeforeTest, `${where}.classesBeforeTest`),
      requirements: list(o.requirements, `${where}.requirements`).map((r, j) => {
        const rw = `${where}.requirements[${j + 1}]`;
        const ro = obj(r, rw);
        if (!REQUIREMENT_TYPES.includes(ro.type as RequirementType)) fail(`${rw}.type must be one of: ${REQUIREMENT_TYPES.join(', ')}`);
        return { id: text(ro.id, `${rw}.id`), type: ro.type as RequirementType, name: text(ro.name, `${rw}.name`), videoId: textOrNull(ro.videoId, `${rw}.videoId`) };
      }),
    };
  });
  if (belts.length === 0) fail('"school.belts" is empty');
  const beltIds = new Set<string>();
  const reqIds = new Set<string>();
  for (const b of belts) {
    if (beltIds.has(b.id)) fail(`two belts use the id "${b.id}"`);
    beltIds.add(b.id);
    for (const r of b.requirements) {
      if (reqIds.has(r.id)) fail(`two requirements use the id "${r.id}"`);
      reqIds.add(r.id);
    }
  }
  const beltRef = (v: unknown, where: string): string => {
    const id = text(v, where);
    if (!beltIds.has(id)) fail(`${where} is "${id}", which isn't in the school's belt list`);
    return id;
  };

  const rank = obj(f.rank, '"rank"');
  const currentBelt = beltRef(rank.currentBelt, '"rank.currentBelt"');
  const history = list(rank.history, '"rank.history"').map((h, i) => {
    const o = obj(h, `"rank.history[${i + 1}]"`);
    return { belt: beltRef(o.belt, `"rank.history[${i + 1}].belt"`), earnedOn: date(o.earnedOn, `"rank.history[${i + 1}].earnedOn"`) };
  });

  const requirements = list(f.requirements, '"requirements"').map((r, i) => requirement(r, `"requirements[${i + 1}]"`, currentBelt));
  const catchUp = list(f.catchUp ?? [], '"catchUp"').map((r, i) => requirement(r, `"catchUp[${i + 1}]"`));
  for (const r of [...requirements, ...catchUp]) {
    if (!reqIds.has(r.id)) fail(`requirement "${r.id}" isn't in the school's curriculum`);
    beltRef(r.belt, `requirement "${r.id}" belt`);
  }

  const stripes = list(f.stripes ?? [], '"stripes"').map((v, i) => {
    const o = obj(v, `"stripes[${i + 1}]"`);
    return { word: text(o.word, `"stripes[${i + 1}].word"`), belt: beltRef(o.belt, `"stripes[${i + 1}].belt"`), earnedOn: date(o.earnedOn, `"stripes[${i + 1}].earnedOn"`) };
  });

  const att = obj(f.attendance, '"attendance"');
  const classDays = list(att.classDays ?? [], '"attendance.classDays"').map((d, i) => {
    const day = text(d, `"attendance.classDays[${i + 1}]"`);
    if (!DAY_NAMES.includes(day)) fail(`"attendance.classDays[${i + 1}]" must be one of: ${DAY_NAMES.join(', ')}`);
    return day;
  });
  const testing = obj(f.testing ?? { approved: false, testDate: null }, '"testing"');
  const hp = obj(f.homePractice ?? { approvedMinutes: 0, recent: [] }, '"homePractice"');

  return {
    feedVersion: 1,
    asOf: date(f.asOf, '"asOf"'),
    student: {
      id: text(s.id, '"student.id"'),
      firstName: text(s.firstName, '"student.firstName"'),
      lastInitial: text(s.lastInitial, '"student.lastInitial"'),
      schoolId: text(s.schoolId, '"student.schoolId"'),
      ageBand: text(s.ageBand, '"student.ageBand"'),
    },
    school: { id: text(school.id, '"school.id"'), name: text(school.name, '"school.name"'), belts },
    rank: { currentBelt, trainingStartDate: date(rank.trainingStartDate, '"rank.trainingStartDate"'), history },
    requirements,
    catchUp,
    stripes,
    attendance: {
      recentClasses: list(att.recentClasses ?? [], '"attendance.recentClasses"').map((d, i) => date(d, `"attendance.recentClasses[${i + 1}]"`)),
      classDays,
      classesInRank: count(att.classesInRank ?? 0, '"attendance.classesInRank"'),
    },
    testing: { approved: testing.approved === true, testDate: textOrNull(testing.testDate, '"testing.testDate"') },
    streak: { weeks: count(obj(f.streak ?? { weeks: 0 }, '"streak"').weeks ?? 0, '"streak.weeks"') },
    homePractice: {
      approvedMinutes: count(hp.approvedMinutes ?? 0, '"homePractice.approvedMinutes"'),
      recent: list(hp.recent ?? [], '"homePractice.recent"').map((e, i) => {
        const o = obj(e, `"homePractice.recent[${i + 1}]"`);
        return { date: date(o.date, `"homePractice.recent[${i + 1}].date"`), minutes: count(o.minutes, `"homePractice.recent[${i + 1}].minutes"`) };
      }),
    },
    accolades: list(f.accolades ?? [], '"accolades"').map((a, i) => {
      const o = obj(a, `"accolades[${i + 1}]"`);
      return { name: text(o.name, `"accolades[${i + 1}].name"`), earnedOn: date(o.earnedOn, `"accolades[${i + 1}].earnedOn"`) };
    }),
    classGoals: list(f.classGoals ?? [], '"classGoals"').map((g, i) => {
      const o = obj(g, `"classGoals[${i + 1}]"`);
      return { name: text(o.name, `"classGoals[${i + 1}].name"`), status: o.status === 'completed' ? 'completed' : 'active' };
    }),
  };
}

/**
 * Moves every date in a feed by the same amount, so a fake profile always looks
 * "fresh" (its asOf becomes `nowIso`). Testing only: real feeds are never shifted.
 */
export function shiftFeedDates(feed: StudentFeed, nowIso: string): StudentFeed {
  const by = Date.parse(nowIso) - Date.parse(feed.asOf);
  const dateOnly = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const move = (s: string): string => {
    const iso = new Date(Date.parse(s) + by).toISOString();
    return dateOnly(s) ? iso.slice(0, 10) : iso;
  };
  const moveOrNull = (s: string | null) => (s === null ? null : move(s));
  const req = (r: FeedRequirement): FeedRequirement => ({ ...r, signedOffOn: moveOrNull(r.signedOffOn) });
  return {
    ...feed,
    asOf: move(feed.asOf),
    rank: { ...feed.rank, trainingStartDate: move(feed.rank.trainingStartDate), history: feed.rank.history.map((h) => ({ ...h, earnedOn: move(h.earnedOn) })) },
    requirements: feed.requirements.map(req),
    catchUp: feed.catchUp.map(req),
    stripes: feed.stripes.map((s) => ({ ...s, earnedOn: move(s.earnedOn) })),
    attendance: { ...feed.attendance, recentClasses: feed.attendance.recentClasses.map(move) },
    testing: { ...feed.testing, testDate: moveOrNull(feed.testing.testDate) },
    homePractice: { ...feed.homePractice, recent: feed.homePractice.recent.map((e) => ({ ...e, date: move(e.date) })) },
    accolades: feed.accolades.map((a) => ({ ...a, earnedOn: move(a.earnedOn) })),
  };
}

export { DAY_NAMES };
