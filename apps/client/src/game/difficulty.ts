// M7-P1: everyone starts on Standard ("Steady"); Guided is kindly offered after losses on one
// floor, and can be picked any time in Settings. Rules and text: content/settings/difficulty.json.

import { settleDifficulty, type Difficulty, type Profile } from '@dojo/sim';
import settings from '../../../../content/settings/difficulty.json';

export const DIFFICULTY_TEXT = settings as {
  offerAfterLosses: number;
  button: string;
  title: string;
  footer: string;
  choices: Array<{ id: Difficulty; name: string; text: string }>;
  homeLine: string;
  offer: { title: string; line: string; yes: string; no: string };
};

/**
 * Q-PREM-GRADE: room grade letters (S/A/B), their sound, and the "Most S grades" best show on
 * Challenge only. The sim still grades every room (the S-grade bonus loot stays); it's just not shown.
 * Missing difficulty (old run summaries) means hidden.
 */
export function showGrades(difficulty: Difficulty | null | undefined): boolean {
  return difficulty === 'challenge';
}

/** Gives a new profile its starting difficulty (once). Returns true if it set one. */
export function ensureDifficulty(profile: Profile): boolean {
  return settleDifficulty(profile);
}

/** Today's local date as YYYY-MM-DD (the Guided offer is at most once a day). */
export function localToday(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
