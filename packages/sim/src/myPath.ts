// LP-B1 (L1): the one Path screen. Where you are on the Tower, the next real step (biggest),
// and the next game step. Invitations, never pressure: no counts of days, no deadlines.

import type { Profile } from './profile';
import type { RequirementStatus, TrainingState } from './training';

export type TierState = 'cleared' | 'current' | 'next' | 'ahead';

export interface TowerTier {
  id: string;
  name: string;
  color: string;
  state: TierState;
}

/** The next game step: the next level, or at the belt's level cap a best to beat. */
export type GameStep = { kind: 'level'; level: number } | { kind: 'combo'; best: number } | { kind: 'firstCombo' };

export interface PathView {
  tower: TowerTier[];
  /** The next unsigned requirement (current rank first, then catch-up); null when all are signed off. */
  classStep: RequirementStatus | null;
  game: GameStep;
}

export function pathView(profile: Profile, t: TrainingState, level: number): PathView {
  const tower = t.belts.map((b, i): TowerTier => {
    const tier = i + 1;
    const state: TierState = tier < t.tier ? 'cleared' : tier === t.tier ? 'current' : tier === t.tier + 1 ? 'next' : 'ahead';
    return { id: b.id, name: b.name, color: b.color, state };
  });
  const combo = profile.bests.longestCombo;
  const game: GameStep = level < t.levelCap ? { kind: 'level', level: level + 1 } : combo > 0 ? { kind: 'combo', best: combo } : { kind: 'firstCombo' };
  return { tower, classStep: t.path.next, game };
}

/** The "This is your Path" card: once, and only for players who had the old screens (new players skip it). */
export function pathIntroDue(profile: Profile): boolean {
  return !profile.pathIntroSeen;
}
