// Elite enemies (S1 #3, core-design section 6): an ordinary enemy with one added trait,
// shown by a coloured aura. Every number comes from content/elites/elites.json.
//   Swift (gold): faster, shorter wind-up (never on Guided), quicker recovery.
//   Guarding (blue): protects the 2 closest enemies within 3 tiles (they take 1/3 less from the player).
// The Perfect Counter window never changes for elites.

import { MIN_WINDUP_TICKS, type Difficulty } from './config';
import type { EnemyDef } from './enemy';

export type EliteKind = 'swift' | 'guarding';
export const ELITE_KINDS: EliteKind[] = ['swift', 'guarding'];

export interface EliteKindDef {
  /** Enemy types that can be this kind of elite. */
  enemies: string[];
  health: number;
  power: number;
  guard: number;
  moveSpeed: number;
  /** Wind-up scale on Standard and Challenge. */
  windup: number;
  windupOnGuided: number;
  windupOnChallenge: number;
  recover: number;
}

export interface EliteRules {
  minBeltTier: number;
  /** First room of a floor (1 = the first room) that can have an elite. */
  earliestRoom: number;
  chance: { battle: number; challenge: number };
  maxPerRoom: number;
  maxPerFloor: number;
  maxGuardingPerFloor: number;
  kindWeights: Record<EliteKind, number>;
  noGuardingOnGuided: boolean;
  noGuardingOnFirstFloorOfTier: boolean;
  minWindupTicks: number;
  kinds: Record<EliteKind, EliteKindDef>;
  guarding: { rangeTiles: number; protects: number; damageScale: number };
  /** On defeating an elite: Focus added at once, and the chance of one extra decoration. */
  reward: { focus: number; decorationChance: number };
}

function num(v: unknown, where: string, min = 0, max = Infinity): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new Error(max === Infinity ? `Elites: "${where}" must be a number, at least ${min}` : `Elites: "${where}" must be a number from ${min} to ${max}`);
  return v;
}

function whole(v: unknown, where: string, min = 0): number {
  const n = num(v, where, min);
  if (!Number.isInteger(n)) throw new Error(`Elites: "${where}" must be a whole number`);
  return n;
}

/** Checks content/elites/elites.json and turns it into EliteRules, or throws a clear error. */
export function loadElites(data: unknown): EliteRules {
  const d = (data ?? {}) as Record<string, any>;
  const kinds = {} as Record<EliteKind, EliteKindDef>;
  for (const k of ELITE_KINDS) {
    const x = d.kinds?.[k];
    if (!x || !Array.isArray(x.enemies) || !x.enemies.every((e: unknown) => typeof e === 'string')) throw new Error(`Elites: "kinds.${k}.enemies" must be a list of enemy ids`);
    kinds[k] = {
      enemies: x.enemies,
      health: num(x.health, `kinds.${k}.health`, 0.1),
      power: num(x.power, `kinds.${k}.power`, 0.1),
      guard: num(x.guard, `kinds.${k}.guard`, 0),
      moveSpeed: num(x.moveSpeed, `kinds.${k}.moveSpeed`, 0.1),
      windup: num(x.windup, `kinds.${k}.windup`, 0.1, 1),
      windupOnGuided: num(x.windupOnGuided, `kinds.${k}.windupOnGuided`, 0.1, 1),
      windupOnChallenge: num(x.windupOnChallenge, `kinds.${k}.windupOnChallenge`, 0.1, 1),
      recover: num(x.recover, `kinds.${k}.recover`, 0.1),
    };
  }
  return {
    minBeltTier: whole(d.minBeltTier, 'minBeltTier', 1),
    earliestRoom: whole(d.earliestRoom, 'earliestRoom', 1),
    chance: { battle: num(d.chance?.battle, 'chance.battle', 0, 1), challenge: num(d.chance?.challenge, 'chance.challenge', 0, 1) },
    maxPerRoom: whole(d.maxPerRoom, 'maxPerRoom'),
    maxPerFloor: whole(d.maxPerFloor, 'maxPerFloor'),
    maxGuardingPerFloor: whole(d.maxGuardingPerFloor, 'maxGuardingPerFloor'),
    kindWeights: { swift: num(d.kindWeights?.swift, 'kindWeights.swift'), guarding: num(d.kindWeights?.guarding, 'kindWeights.guarding') },
    noGuardingOnGuided: d.noGuardingOnGuided === true,
    noGuardingOnFirstFloorOfTier: d.noGuardingOnFirstFloorOfTier === true,
    // Q-SWARM-JAB: an elite wind-up can't go under the game's half-second floor.
    minWindupTicks: whole(d.minWindupTicks, 'minWindupTicks', MIN_WINDUP_TICKS),
    kinds,
    guarding: {
      rangeTiles: num(d.guarding?.rangeTiles, 'guarding.rangeTiles', 0),
      protects: whole(d.guarding?.protects, 'guarding.protects'),
      damageScale: num(d.guarding?.damageScale, 'guarding.damageScale', 0, 1),
    },
    reward: {
      focus: whole(d.reward?.focus, 'reward.focus'),
      decorationChance: num(d.reward?.decorationChance, 'reward.decorationChance', 0, 1),
    },
  };
}

/** An enemy's stats as an elite: Health, Power, Guard, speed and recovery scaled (wind-up is scaled per difficulty when it starts). */
export function eliteDef(def: EnemyDef, kind: EliteKind, rules: EliteRules): EnemyDef {
  const k = rules.kinds[kind];
  return {
    ...def,
    maxHealth: Math.round(def.maxHealth * k.health),
    power: def.power * k.power,
    guard: def.guard * k.guard,
    moveSpeedTilesPerSecond: def.moveSpeedTilesPerSecond * k.moveSpeed,
    attacks: def.attacks.map((a) => ({ ...a, recoverTicks: Math.max(1, Math.round(a.recoverTicks * k.recover)) })),
  };
}

/**
 * An elite's wind-up on a difficulty, from the normal wind-up. Never below minWindupTicks,
 * and never shorter than the Perfect Counter window, which itself never changes.
 */
export function eliteWindup(ticks: number, kind: EliteKind, difficulty: Difficulty, rules: EliteRules, counterWindow: number): number {
  const k = rules.kinds[kind];
  const scale = difficulty === 'guided' ? k.windupOnGuided : difficulty === 'challenge' ? k.windupOnChallenge : k.windup;
  if (scale === 1) return ticks;
  return Math.min(ticks, Math.max(rules.minWindupTicks, counterWindow, Math.round(ticks * scale)));
}

/** Can this floor have elites at all, and Guarding ones? */
export function elitesAllowed(rules: EliteRules, beltTier: number, difficulty: Difficulty, firstFloorOfTier: boolean): { any: boolean; guarding: boolean } {
  const any = beltTier >= rules.minBeltTier;
  const guarding = any && !(rules.noGuardingOnGuided && difficulty === 'guided') && !(rules.noGuardingOnFirstFloorOfTier && firstFloorOfTier);
  return { any, guarding };
}

/** One elite in a room: which of the room's enemy spawns (index in the room file) and its kind. */
export interface EliteSpawn {
  spawn: number;
  kind: EliteKind;
}
