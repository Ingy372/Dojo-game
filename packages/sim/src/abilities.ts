// Abilities that real training unlocks (framework section 5): Stances (kata), Strike
// upgrades (kick combos), Technique Seals (self-defense) and Virtues (stripes).
// Defined in content/abilities/abilities.json and checked here.

import { loadEffect, type Effect } from './effects';

/** A stance the player switches between in a fight. Its numbers apply while it's active. */
export interface StanceDef {
  id: string;
  /**
   * R-STANCE-d2: the DojoForge sign-off item that unlocks this stance; null for the Beginner's
   * Stance (always there). Placeholder ids for now (PLACEHOLDER-…), until Nic sets the real ones.
   */
  signOffId: string | null;
  name: string;
  text: string;
  /** Extra Perfect Counter window ticks. */
  counterWindow: number;
  /** Basic attacks this share faster. */
  attackSpeed: number;
  /** Walking this share faster (negative = slower). */
  moveSpeed: number;
  /** Guard raised by this share. */
  guardScale: number;
  /** Power raised by this share. */
  powerScale: number;
  /** R-STANCE-d1: dash recharge changed by this share (-0.25 = a quarter shorter). */
  dashCooldownScale: number;
  /** R-STANCE-d1: dash length multiplied by this (1 = normal). */
  dashScale: number;
  /** R-STANCE-d1: added to the block cut; blocks let max(0.1, 0.5 - blockCut) through. */
  blockCut: number;
  /** R-STANCE-d1: added to the Focus gain modifier. */
  focusGain: number;
  /** R-STANCE-d1: extra power after standing still for `rootTicks` ticks; moving or dashing resets it. */
  stillPower: number;
  /** R-STANCE-d1: ticks of standing still before `stillPower` applies. */
  rootTicks: number;
}

/** Stance content check (R-STANCE-c): power bonuses stay within the band-safe cap. */
export const STANCE_POWER_CAP = 0.12;

/** A Strike upgrade or a Technique Seal: one always-on effect. */
export interface PerkDef {
  id: string;
  name: string;
  text: string;
  effect: Effect;
}

export type VirtueKind = 'shield' | 'heal' | 'discipline';

export interface VirtueDef {
  id: string;
  name: string;
  /** Stripe words that grant this Virtue (each school can add its own). */
  words: string[];
  kind: VirtueKind;
  /** shield: damage soaked up; heal: share of max Health restored. */
  amount: number;
  /** How long it lasts (shield, discipline). */
  seconds: number;
  /** What it does, with {n}, {pct} and {s} filled in. */
  text: string;
}

export interface AbilityContent {
  /** stances[0] is the Beginner's Stance everyone starts with. */
  stances: StanceDef[];
  strikes: PerkDef[];
  seals: PerkDef[];
  virtues: VirtueDef[];
}

export class AbilityError extends Error {
  constructor(problem: string) {
    super(`Ability data has a problem: ${problem}`);
    this.name = 'AbilityError';
  }
}

const fail = (problem: string): never => {
  throw new AbilityError(problem);
};

function str(v: unknown, where: string): string {
  if (typeof v !== 'string' || v === '') fail(`${where} must be a non-empty text`);
  return v as string;
}
function num(v: unknown, where: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${where} must be a number`);
  return v as number;
}

export function loadAbilities(data: unknown): AbilityContent {
  const d = data as Record<string, unknown>;
  if (!d || typeof d !== 'object') fail('the file is not an object');
  const listOf = (key: string): Record<string, unknown>[] => {
    if (!Array.isArray(d[key])) fail(`"${key}" must be a list`);
    return d[key] as Record<string, unknown>[];
  };
  const ids = new Set<string>();
  const id = (v: unknown, where: string): string => {
    const s = str(v, where);
    if (ids.has(s)) fail(`two abilities use the id "${s}"`);
    ids.add(s);
    return s;
  };

  const stances = listOf('stances').map((f, i) => {
    const w = `stances[${i + 1}]`;
    const stance: StanceDef = {
      id: id(f.id, `${w}.id`),
      name: str(f.name, `${w}.name`),
      signOffId: f.signOffId === undefined || f.signOffId === null ? null : str(f.signOffId, `${w}.signOffId`),
      text: str(f.text, `${w}.text`),
      counterWindow: num(f.counterWindow, `${w}.counterWindow`),
      attackSpeed: num(f.attackSpeed, `${w}.attackSpeed`),
      moveSpeed: num(f.moveSpeed, `${w}.moveSpeed`),
      guardScale: num(f.guardScale, `${w}.guardScale`),
      powerScale: num(f.powerScale, `${w}.powerScale`),
      dashCooldownScale: f.dashCooldownScale === undefined ? 0 : num(f.dashCooldownScale, `${w}.dashCooldownScale`),
      dashScale: f.dashScale === undefined ? 1 : num(f.dashScale, `${w}.dashScale`),
      blockCut: f.blockCut === undefined ? 0 : num(f.blockCut, `${w}.blockCut`),
      focusGain: f.focusGain === undefined ? 0 : num(f.focusGain, `${w}.focusGain`),
      stillPower: f.stillPower === undefined ? 0 : num(f.stillPower, `${w}.stillPower`),
      rootTicks: f.rootTicks === undefined ? 0 : num(f.rootTicks, `${w}.rootTicks`),
    };
    if (stance.moveSpeed <= -0.5 || stance.attackSpeed < 0 || stance.counterWindow < 0) fail(`${w} has numbers out of range`);
    const inCap = (v: number) => v >= 0 && v <= STANCE_POWER_CAP;
    if (!inCap(stance.powerScale) || !inCap(stance.stillPower)) fail(`${w}: powerScale and stillPower must be from 0 to ${STANCE_POWER_CAP}`);
    if (stance.guardScale < 0) fail(`${w}: guardScale must be 0 or more`);
    if (stance.dashCooldownScale <= -1 || stance.dashScale <= 0 || stance.rootTicks < 0) fail(`${w} has dash or root numbers out of range`);
    return stance;
  });
  if (stances.length === 0) fail('"stances" needs at least the Beginner\'s Stance');
  if (stances[0].signOffId !== null) fail('stances[1] (the Beginner\'s Stance) is always there and has no signOffId');
  stances.slice(1).forEach((s, i) => { if (s.signOffId === null) fail(`stances[${i + 2}] needs a signOffId (the DojoForge sign-off that unlocks it)`); });
  if (new Set(stances.map((s) => s.signOffId).filter(Boolean)).size !== stances.length - 1) fail('two stances use the same signOffId');

  const perks = (key: 'strikes' | 'seals'): PerkDef[] =>
    listOf(key).map((p, i) => {
      const w = `${key}[${i + 1}]`;
      return {
        id: id(p.id, `${w}.id`),
        name: str(p.name, `${w}.name`),
        text: str(p.text, `${w}.text`),
        effect: loadEffect(p.effect, (problem) => fail(`${w}: ${problem}`)),
      };
    });

  const words = new Set<string>();
  const virtues = listOf('virtues').map((v, i) => {
    const w = `virtues[${i + 1}]`;
    if (!['shield', 'heal', 'discipline'].includes(v.kind as string)) fail(`${w}.kind must be shield, heal or discipline`);
    if (!Array.isArray(v.words) || v.words.length === 0) fail(`${w}.words must list at least one stripe word`);
    for (const word of v.words as unknown[]) {
      const s = str(word, `${w}.words`);
      if (words.has(s)) fail(`the stripe word "${s}" is used by two Virtues`);
      words.add(s);
    }
    return {
      id: id(v.id, `${w}.id`),
      name: str(v.name, `${w}.name`),
      words: (v.words as string[]).slice(),
      kind: v.kind as VirtueKind,
      amount: num(v.amount, `${w}.amount`),
      seconds: num(v.seconds, `${w}.seconds`),
      text: str(v.text, `${w}.text`),
    };
  });

  return { stances, strikes: perks('strikes'), seals: perks('seals'), virtues };
}
