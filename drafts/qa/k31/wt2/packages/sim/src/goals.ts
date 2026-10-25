// Three next goals at session end (M7-P10, core-design 0:30): one in the game, one to
// collect, and one real-world goal from the Path card. Invitations, never pressure: no
// counts of days, no "only N left", no deadlines.

import type { Content } from './content';
import { sessionNumber } from './lessons';
import type { Profile } from './profile';
import { abilityLabel } from './rewards';
import type { TrainingState } from './training';

export type GoalKind = 'game' | 'collection' | 'realWorld';

export interface NextGoal {
  kind: GoalKind;
  text: string;
}

/** Manager call (M7-P10): the real-world goal when there is no next technique to learn. */
export const NO_NEXT_TECHNIQUE = 'Keep practicing with Sensei, and your next test will come!';

/** Exactly three goals, in the order game, collection, real-world. */
export function nextGoals(profile: Profile, t: TrainingState, content: Pick<Content, 'dojo' | 'named'>): NextGoal[] {
  return [
    { kind: 'game', text: gameGoal(profile, t) },
    { kind: 'collection', text: collectionGoal(profile, content) },
    { kind: 'realWorld', text: realWorldGoal(t) },
  ];
}

function gameGoal(profile: Profile, t: TrainingState): string {
  if (profile.level < t.levelCap) return `Reach level ${profile.level + 1} in the Tower.`;
  // At the belt's level cap: a personal best to beat instead.
  const combo = profile.bests.longestCombo;
  return combo > 0 ? `Beat your best combo of ${combo} in the Tower.` : 'Land a combo in the Tower.';
}

function collectionGoal(profile: Profile, content: Pick<Content, 'dojo' | 'named'>): string {
  // A named monster already met but not yet beaten: its sticker is the nearest thing to collect.
  const met = content.named.monsters.find((m) => profile.monsterJournal[m.id]?.met && !profile.monsterJournal[m.id]?.beaten);
  if (met) return `Beat ${met.name} to earn its sticker.`;
  // No "N of 41" count: a long collection list reads like a chore list to a 6-year-old.
  const owned = new Set(profile.dojo?.items.map((i) => i.id) ?? []);
  if (content.dojo.decorations.some((d) => !owned.has(d.id))) return 'Find a new decoration for your dojo in a Tower chest.';
  return 'Find a new piece of gear in a Tower chest.';
}

/** The one kid-facing wording for "get this requirement signed off" (M7-P13 C5, K22b Manager call). */
export function showSensei(requirementName: string): string {
  return `Show Sensei ${requirementName} in class`;
}

function realWorldGoal(t: TrainingState): string {
  const next = t.path.next;
  if (!next) return NO_NEXT_TECHNIQUE;
  const ability = abilityLabel(t, next.id).split(' (')[0];
  if (!ability) return `${showSensei(next.name)}.`;
  // "Technique Seal" alone (its power arrives in a later update) reads better as "a new Technique Seal".
  return `${showSensei(next.name)} to unlock ${ability.includes(':') ? ability : `a new ${ability}`}.`;
}

/**
 * The goals card shows at most once a day, after a run (M7-P10, Manager call), from session 2
 * on: session 1 already has the welcome line and the unlock cascade (M7-P13 C1, Manager call).
 */
export function goalsDue(profile: Profile, today: string): boolean {
  return profile.lastRun !== null && profile.goalsShownOn !== today && sessionNumber(profile.lessons, today) >= 2;
}

export function markGoalsShown(profile: Profile, today: string): void {
  profile.goalsShownOn = today;
}
