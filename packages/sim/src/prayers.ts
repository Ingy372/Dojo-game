// The prayer menu's words (Jay, Nov 25): a short note about what prayer is and is not, and a handful of
// short prayers. The words are a school's own data (content/faith/<school>-prayers.json), checked here when loaded.
// Reading a prayer gives nothing in the game and is never counted.

export interface PrayerNote {
  heading: string;
  points: string[];
}

export interface Prayer {
  id: string;
  title: string;
  text: string;
}

export interface PrayerBook {
  schoolId: string;
  /** The walk-up button at the Bible. */
  button: string;
  title: string;
  readAloud: string;
  back: string;
  /** The line over the list of prayers. */
  pick: string;
  /** Shown above the prayers: what prayer is, and what it is not. */
  about: PrayerNote[];
  closing: string;
  prayers: Prayer[];
}

export class PrayerBookError extends Error {
  constructor(problem: string) {
    super(`Prayer data has a problem: ${problem}`);
    this.name = 'PrayerBookError';
  }
}

function words(v: unknown, what: string): string {
  if (typeof v !== 'string' || v.trim() === '') throw new PrayerBookError(`${what} must be words`);
  return v;
}

/** Checks a prayer file and returns it. */
export function loadPrayerBook(data: unknown): PrayerBook {
  const raw = (data ?? {}) as Record<string, unknown>;
  if (!Array.isArray(raw.about) || raw.about.length === 0) throw new PrayerBookError('"about" must have at least one note');
  const about = (raw.about as Record<string, unknown>[]).map((n, i) => {
    if (!Array.isArray(n.points) || n.points.length === 0) throw new PrayerBookError(`about[${i}].points must have at least one line`);
    return { heading: words(n.heading, `about[${i}].heading`), points: n.points.map((p, j) => words(p, `about[${i}].points[${j}]`)) };
  });
  if (!Array.isArray(raw.prayers) || raw.prayers.length === 0) throw new PrayerBookError('"prayers" must have at least one prayer');
  const seen = new Set<string>();
  const prayers = (raw.prayers as Record<string, unknown>[]).map((p, i) => {
    const id = words(p.id, `prayers[${i}].id`);
    if (seen.has(id)) throw new PrayerBookError(`two prayers share the id "${id}"`);
    seen.add(id);
    return { id, title: words(p.title, `${id}.title`), text: words(p.text, `${id}.text`) };
  });
  return {
    schoolId: words(raw.schoolId, 'schoolId'),
    button: words(raw.button, 'button'),
    title: words(raw.title, 'title'),
    readAloud: words(raw.readAloud, 'readAloud'),
    back: words(raw.back, 'back'),
    pick: words(raw.pick, 'pick'),
    about,
    closing: words(raw.closing, 'closing'),
    prayers,
  };
}
