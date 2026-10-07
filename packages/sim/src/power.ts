// Power Rating (core-design section 12). NEVER shown to players: it exists for staff
// views and balancing only. Each belt tier's max is split between sources, and each
// source has its own ceiling, so nobody can out-power their real rank.

import { GEAR_CAPS, POWER, TRAINING_POINTS } from './config';
import { GEAR_SLOTS, gearScore, type GearItem } from './loot';
import { effectiveLevel } from './progression';
import { wornItem, type Profile } from './profile';
import type { TrainingState } from './training';

export type PowerSource = keyof typeof POWER.shares;

export interface PowerPart {
  source: PowerSource;
  /** Share of the tier max this source can fill (its ceiling). */
  share: number;
  max: number;
  /** How full it is, 0 to 1. */
  fill: number;
  value: number;
  /** How the fill was worked out, for the testing screen. */
  detail: string;
}

export interface PowerRating {
  tierMax: number;
  total: number;
  parts: PowerPart[];
}

/** The best possible gear score at this tier (every slot at the gear cap, an Epic charm). */
export function maxGearScore(tier: number): number {
  const cap = GEAR_CAPS.white;
  const item = (slot: GearItem['slot'], stats: GearItem['stats'], effect: GearItem['effect']): GearItem => ({
    uid: '',
    base: '',
    name: '',
    slot,
    rarity: 'epic',
    stats,
    effect,
    effectText: '',
  });
  const best =
    gearScore(item('hands', { power: cap.power, maxHealth: 0, guard: 0 }, null)) +
    gearScore(item('gi', { power: 0, maxHealth: cap.maxHealth, guard: cap.guard }, null)) +
    gearScore(item('charm', { power: 0, maxHealth: 0, guard: 0 }, { type: 'powerScale', amount: 0 }));
  // Gear caps grow with each tier (placeholder until per-tier gear arrives in milestone 10).
  return best * tier;
}

export function powerRating(t: TrainingState, profile: Profile): PowerRating {
  const parts: PowerPart[] = [];
  const add = (source: PowerSource, fill: number, detail: string) => {
    const share = POWER.shares[source];
    const max = Math.round(t.tierMax * share);
    const f = Math.max(0, Math.min(1, fill));
    parts.push({ source, share, max, fill: f, value: Math.round(max * f), detail });
  };

  // Sign-offs: every requirement of every rank so far (passed ranks count, catch-up items too).
  const signed = t.requirements.filter((r) => r.signedOff).length;
  add('signOffs', t.requirements.length ? signed / t.requirements.length : 0, `${signed} of ${t.requirements.length} requirements signed off`);

  // Training Points: each ability can be upgraded 4 times (level 1 to 5).
  const maxPoints = t.requirements.length * TRAINING_POINTS.upgradesPerAbility;
  add('trainingPoints', maxPoints ? t.trainingPoints / maxPoints : 0, `${t.trainingPoints} of ${maxPoints} Training Points (${t.approvedMinutes} approved minutes)`);

  // Virtues: up to 2 stripes per belt so far.
  const maxStripes = POWER.stripesPerBelt * t.tier;
  add('virtues', t.totalStripes / maxStripes, `${t.totalStripes} of ${maxStripes} stripes`);

  const level = effectiveLevel(profile, t);
  add('level', level / t.levelCap, `level ${level} of ${t.levelCap}`);

  const score = GEAR_SLOTS.reduce((sum, slot) => sum + gearScore(wornItem(profile, slot)), 0);
  const best = maxGearScore(t.tier);
  add('gear', score / best, `gear score ${Math.round(score)} of ${Math.round(best)}`);

  add('streetSmarts', 0, 'not built yet');
  add('mastery', 0, 'not built yet');

  return { tierMax: t.tierMax, total: parts.reduce((s, p) => s + p.value, 0), parts };
}
