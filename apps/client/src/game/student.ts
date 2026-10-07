// The student's real progress. Until Nic's DojoForge feed exists (milestone 9), it comes
// from the fake profiles in fixtures/, picked on the hidden testing screen. Their dates
// are moved so each profile looks "fresh" (its last update is now).

import { buildTraining, loadFeed, shiftFeedDates, type StudentFeed, type TrainingState } from '@dojo/sim';
import { CONTENT } from './content';

const files = import.meta.glob('../../../../fixtures/*.json', { eager: true, import: 'default' });

export interface FakeProfile {
  key: string;
  label: string;
  feed: StudentFeed;
}

export const FAKE_PROFILES: FakeProfile[] = Object.keys(files)
  .sort()
  .map((path) => {
    const feed = loadFeed(files[path]);
    const key = path.split('/').pop()!.replace('.json', '');
    const belt = feed.school.belts.find((b) => b.id === feed.rank.currentBelt)!.name;
    const signed = feed.requirements.filter((r) => r.signedOff).length;
    const stripes = feed.stripes.filter((s) => s.belt === feed.rank.currentBelt).length;
    const label = `${belt}: ${signed} of ${feed.requirements.length} signed off${stripes ? `, ${stripes} stripe${stripes > 1 ? 's' : ''}` : ''}`;
    return { key, label, feed };
  });

const KEY = 'dojo-ascent-test-student';

export function selectedProfileKey(): string {
  try {
    const k = localStorage.getItem(KEY);
    if (k && FAKE_PROFILES.some((p) => p.key === k)) return k;
  } catch {
    // Storage blocked: use the first profile.
  }
  return FAKE_PROFILES[0].key;
}

export function selectProfile(key: string): void {
  try {
    localStorage.setItem(KEY, key);
  } catch {
    // The choice lasts only until the page reloads.
  }
}

/** The student's progress right now, worked out from the selected fake profile. */
export function currentTraining(): TrainingState {
  const fake = FAKE_PROFILES.find((p) => p.key === selectedProfileKey())!;
  const now = new Date();
  const feed = shiftFeedDates(fake.feed, now.toISOString());
  return buildTraining(feed, CONTENT.abilities, { ms: now.getTime(), weekday: now.getDay() });
}

/** "Sat, Mar 27" for a "YYYY-MM-DD" date. */
export function shortDate(iso: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
