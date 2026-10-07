// Levels and experience (core-design sections 10 and 13), and the character that real
// training plus play produces: stats, Forms, Strike upgrades, Technique Seals and a Virtue.

import type { AbilityContent } from './abilities';
import { BLESSING, PROGRESSION, TICKS_PER_SECOND, VIRTUE_RANK_BONUS } from './config';
import type { Effect } from './effects';
import type { FeedBelt } from './feed';
import { playerStats, type Profile } from './profile';
import type { RunSummary } from './run';
import { unlockedForms, virtueTitle, type TrainingState } from './training';
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
  const total = (steps * (steps + 1)) / 2;
  return Math.max(10, Math.round((tierXp(belt) * step) / total));
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
  const v = training.virtue;
  if (!v) return null;
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
  return {
    level,
    maxHealth: gear.maxHealth + (level - 1) * PROGRESSION.healthPerLevel,
    power: Math.round((gear.power + (level - 1) * PROGRESSION.powerPerLevel) * 10) / 10,
    guard: gear.guard,
    effects: [...earned, ...gear.effects],
    forms: unlockedForms(training, abilities),
    virtue: virtueSetup(training),
  };
}
