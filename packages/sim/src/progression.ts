// Levels and experience (core-design sections 10 and 13), and the character that real
// training plus play produces: stats, Forms, Strike upgrades, Technique Seals and a Virtue.

import type { AbilityContent } from './abilities';
import { BLESSING, PROGRESSION, TICKS_PER_SECOND, VIRTUE_RANK_BONUS } from './config';
import type { Effect } from './effects';
import type { FeedBelt } from './feed';
import { playerStats, type Loadout, type Profile } from './profile';
import type { RunSummary } from './run';
import { trainingStats, unlockedForms, virtueTitle, type TrainingState, type VirtueInfo } from './training';
import type { PlayerSetup, VirtueSetup } from './world';

/** Total experience for one belt tier's levels, from the school's typical time in rank. */
export function tierXp(belt: FeedBelt): number {
  const p = PROGRESSION;
  const weeks = belt.typicalMonthsInRank * p.weeksPerMonth * p.capAtShareOfRank;
  return Math.max(100, Math.round(weeks * p.typicalRunsPerWeek * p.typicalRunXp));
}

/**
 * Experience to go from `level` to the next level. Each tier's experience is shared
 * across its levels, later levels needing a little more. Belts beyond the school's
 * list use the last belt's numbers.
 */
export function xpToNext(level: number, belts: readonly FeedBelt[]): number {
  const per = PROGRESSION.levelsPerTier;
  const tier = Math.floor(level / per) + 1;
  const belt = belts[Math.min(tier, belts.length) - 1];
  // White belt climbs from 1 to 10 (9 steps); every later tier has 10 steps.
  const steps = tier === 1 ? per - 1 : per;
  const step = tier === 1 ? level : level - (tier - 1) * per + 1;
  // R-BAL-5 (D3): weights step + k, so the tier's experience is shared more evenly.
  const k = PROGRESSION.xpStepSoften;
  const total = (steps * (steps + 1)) / 2 + k * steps;
  return Math.max(10, Math.round((tierXp(belt) * (step + k)) / total));
}

/** The level the character plays at: never above the real rank's cap. */
export function effectiveLevel(profile: Profile, training: TrainingState): number {
  return Math.min(profile.level, training.levelCap);
}

export interface XpGain {
  base: number;
  /** Multiplier applied: 1, or more with the Blessing and catch-up. */
  multiplier: number;
  gained: number;
  blessed: boolean;
  catchUp: boolean;
  levelsGained: number;
  /** True if the level cap stopped the climb. */
  atCap: boolean;
}

/** Experience earned by a run: each room cleared, plus a bonus for the whole floor. */
export function runXp(summary: RunSummary): number {
  let xp = 0;
  for (const r of summary.results) xp += PROGRESSION.xpPerRoom[r.kind] ?? 0;
  if (summary.result === 'cleared') xp += PROGRESSION.xpFloorClear;
  return xp;
}

/**
 * Adds a run's experience to the profile. The Dojo Blessing adds 50%; players below
 * their rank's expected level earn double. Levels stop at the rank's cap (extra
 * experience at the cap will turn into materials and Mastery after launch).
 */
export function gainXp(profile: Profile, training: TrainingState, base: number): XpGain {
  const catchUp = profile.level < training.expectedLevel;
  const multiplier = (catchUp ? PROGRESSION.catchUpMultiplier : 1) * (training.blessed ? 1 + BLESSING.xpBonus : 1);
  const gained = Math.round(base * multiplier);
  let levelsGained = 0;
  if (profile.level < training.levelCap) {
    profile.xp += gained;
    while (profile.level < training.levelCap) {
      const need = xpToNext(profile.level, training.belts);
      if (profile.xp < need) break;
      profile.xp -= need;
      profile.level++;
      levelsGained++;
    }
  }
  if (profile.level >= training.levelCap) profile.xp = 0;
  return { base, multiplier, gained, blessed: training.blessed, catchUp, levelsGained, atCap: profile.level >= training.levelCap };
}

/** The Virtue taken into fights, with its rank applied (each rank above I is 25% stronger). */
export function virtueSetup(training: TrainingState): VirtueSetup | null {
  return training.virtue ? virtueSetupFor(training.virtue) : null;
}

/** Any earned Virtue at its rank. */
export function virtueSetupFor(v: VirtueInfo): VirtueSetup {
  const scale = 1 + VIRTUE_RANK_BONUS * (v.rank - 1);
  return {
    id: v.def.id,
    name: virtueTitle(v),
    kind: v.def.kind,
    rank: v.rank,
    amount: v.def.kind === 'shield' ? Math.round(v.def.amount * scale) : v.def.amount * scale,
    ticks: Math.round(v.def.seconds * scale * TICKS_PER_SECOND),
  };
}

/** What a Virtue does, in words, with its rank applied. */
export function describeVirtue(v: VirtueSetup, text: string): string {
  return text
    .replace('{n}', `${Math.round(v.amount)}`)
    .replace('{pct}', `${Math.round(v.amount * 100)}%`)
    .replace('{s}', `${Math.round((v.ticks / TICKS_PER_SECOND) * 10) / 10}`);
}

export interface CharacterSetup extends PlayerSetup {
  level: number;
  /** Charm effects plus Strike upgrades and Technique Seals (Insights are added per run). */
  effects: Effect[];
}

/** The character for a fight: level and gear stats, earned abilities, and the Virtue. */
export function characterSetup(profile: Profile, training: TrainingState, abilities: AbilityContent): CharacterSetup {
  const gear = playerStats(profile);
  const level = effectiveLevel(profile, training);
  const earned = training.abilities.filter((a) => a.unlocked && a.perk).map((a) => a.perk!.effect);
  // R-BAL-12: real training adds whole-number stats on top of gear and level.
  const trained = trainingStats(training);
  return {
    level,
    maxHealth: gear.maxHealth + (level - 1) * PROGRESSION.healthPerLevel + trained.maxHealth,
    power: Math.round((gear.power + (level - 1) * PROGRESSION.powerPerLevel + trained.power) * 10) / 10,
    guard: gear.guard + trained.guard,
    effects: [...earned, ...gear.effects],
    ...loadoutAbilities(profile.loadout, training, abilities),
  };
}

/**
 * P-MENU2-d: the Forms and Virtue for a fight, with the student's loadout applied. No loadout
 * (or a pick not earned) gives exactly today's setup. A chosen Form starts the fight; the
 * others follow in their usual order, so switching Forms still works.
 */
export function loadoutAbilities(loadout: Loadout | null, training: TrainingState, abilities: AbilityContent): Pick<PlayerSetup, 'forms' | 'virtue'> {
  let forms = unlockedForms(training, abilities);
  const at = loadout?.form ? forms.findIndex((f) => f.id === loadout.form) : -1;
  if (at > 0) forms = [...forms.slice(at), ...forms.slice(0, at)];
  const picked = loadout?.virtue ? training.virtues.find((v) => v.def.id === loadout.virtue) : undefined;
  return { forms, virtue: picked ? virtueSetupFor(picked) : virtueSetup(training) };
}
