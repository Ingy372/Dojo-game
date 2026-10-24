// M7-P1: the starting difficulty (Guided for young or brand-new students) and the words for
// the difficulty choice screen. Rules and text live in content/settings/difficulty.json.

import { settleDifficulty, type Difficulty, type Profile, type TrainingState } from '@dojo/sim';
import settings from '../../../../content/settings/difficulty.json';

export const DIFFICULTY_TEXT = settings as {
  guidedUpToAge: number;
  guidedNewBeltTier: number;
  button: string;
  title: string;
  footer: string;
  homeLine: string;
  choices: Array<{ id: Difficulty; name: string; text: string }>;
};

/** Gives a new profile its starting difficulty (once). Returns true if it set one. */
export function ensureDifficulty(profile: Profile, training: TrainingState): boolean {
  const signOffsThisBelt = training.requirements.filter((r) => r.belt === training.belt.id && r.signedOff).length;
  return settleDifficulty(profile, { ageBand: training.ageBand, beltTier: training.belt.tier, signOffsThisBelt }, DIFFICULTY_TEXT);
}
