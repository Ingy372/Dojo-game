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

// R-PROGRESSION-BETA: the types for the slot system. Seal families are loaded here (PB-02, from
// content/abilities/seal-families.json); Strikes (PB-03) and kata powers (PB-04) come later.

export type SealFamilyId = 'counter' | 'guard' | 'escape' | 'disarm' | 'throw' | 'lock';

export interface SealRankDef {
  /** The self-defense number, e.g. 11. */
  technique: number;
  /** The real technique name shown on the rank. */
  name: string;
  effects: Effect[];
  /** Kid words, no numbers. */
  text: string;
}

export interface SealFamilyDef {
  id: SealFamilyId;
  name: string;
  text: string;
  /** Path under incoming-art/ (a placeholder is allowed). */
  icon: string;
  /** In technique order. */
  ranks: SealRankDef[];
  /**
   * PB-02: false = the family is not playable yet (Throw until R-G2B-04, Lock until it has ranks):
   * it shows as "Coming later", cannot be equipped, and has no effect.
   */
  live: boolean;
}

export interface StrikeDef {
  /** 'spin-kick' | 'jumping-spins' | 'butterfly-flow' */
  id: string;
  name: string;
  text: string;
  /** The kick combo number that unlocks it (1, 2, 3). */
  combo: number;
  /** True for the Strike a student has with nothing equipped (Spin Kick). Exactly one. */
  default: boolean;
  focusCost: number;
  hits: { strength: number; delayTicks: number }[];
  reach: number;
  lungeTiles: number;
  recoveryTicks: number;
  /** Old Strike ids (abilities.json `strikes`) that now mean this Strike. */
  legacyIds: string[];
}

export interface KataPowerDef {
  id: string;
  /** The content/katas id. */
  kata: string;
  name: string;
  text: string;
  status: 'placeholder' | 'final';
  /** Passive only. Empty while the status is 'placeholder'. */
  effects: Effect[];
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
  /** PB-02: the Seal families (empty if `loadAbilities` was given no family file). */
  families: SealFamilyDef[];
  /** PB-03: the Strikes for the Strike slot (empty if `loadAbilities` was given no Strike file). */
  strikeDefs: StrikeDef[];
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

export function loadAbilities(data: unknown, familyData?: unknown, strikeData?: unknown): AbilityContent {
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

  return { stances, strikes: perks('strikes'), seals: perks('seals'), virtues, families: familyData === undefined ? [] : loadSealFamilies(familyData), strikeDefs: strikeData === undefined ? [] : loadStrikeDefs(strikeData) };
}

const FAMILY_IDS: readonly SealFamilyId[] = ['escape', 'counter', 'guard', 'throw', 'disarm', 'lock'];

/** Checks content/abilities/seal-families.json: every family once, every technique in one family, kid words with no numbers. */
export function loadSealFamilies(data: unknown): SealFamilyDef[] {
  const d = data as Record<string, unknown>;
  if (!d || typeof d !== 'object' || !Array.isArray(d.families)) fail('seal families: the file needs a "families" list');
  const seenTechniques = new Set<number>();
  const families = (d.families as Record<string, unknown>[]).map((f, i) => {
    const w = `families[${i + 1}]`;
    if (!FAMILY_IDS.includes(f.id as SealFamilyId)) fail(`${w}.id must be one of: ${FAMILY_IDS.join(', ')}`);
    if (typeof f.live !== 'boolean') fail(`${w}.live must be true or false`);
    if (!Array.isArray(f.ranks)) fail(`${w}.ranks must be a list`);
    const noDigits = (v: string, where: string): string => {
      if (/\d/.test(v)) fail(`${where} is for kids: no numbers`);
      return v;
    };
    let last = 0;
    const ranks = (f.ranks as Record<string, unknown>[]).map((r, j) => {
      const rw = `${w}.ranks[${j + 1}]`;
      const technique = num(r.technique, `${rw}.technique`);
      if (!Number.isInteger(technique) || technique < 1) fail(`${rw}.technique must be a whole number from 1`);
      if (technique <= last) fail(`${rw}.technique must be bigger than the one before (ranks are in technique order)`);
      if (seenTechniques.has(technique)) fail(`technique #${technique} is in two families`);
      last = technique;
      seenTechniques.add(technique);
      if (!Array.isArray(r.effects)) fail(`${rw}.effects must be a list`);
      const effects = (r.effects as unknown[]).map((e) => loadEffect(e, (problem) => fail(`${rw}: ${problem}`)));
      if (f.live && effects.length === 0) fail(`${rw}: a live family's ranks each need an effect`);
      return { technique, name: str(r.name, `${rw}.name`), effects, text: noDigits(str(r.text, `${rw}.text`), `${rw}.text`) };
    });
    if (f.live && ranks.length === 0) fail(`${w} is live but has no ranks`);
    const def: SealFamilyDef = { id: f.id as SealFamilyId, name: str(f.name, `${w}.name`), text: noDigits(str(f.text, `${w}.text`), `${w}.text`), icon: str(f.icon, `${w}.icon`), ranks, live: f.live as boolean };
    return def;
  });
  for (const id of FAMILY_IDS) {
    if (families.filter((f) => f.id === id).length !== 1) fail(`seal families: "${id}" must be listed exactly once`);
  }
  return families;
}

/** Checks content/abilities/strikes.json: one default Strike, combos 1, 2, 3... in order, whole hit lists, no repeated ids. */
export function loadStrikeDefs(data: unknown): StrikeDef[] {
  const d = data as Record<string, unknown>;
  if (!d || typeof d !== 'object' || !Array.isArray(d.strikes)) fail('strikes: the file needs a "strikes" list');
  const seen = new Set<string>();
  const legacy = new Set<string>();
  const defs = (d.strikes as Record<string, unknown>[]).map((s, i) => {
    const w = `strikes[${i + 1}]`;
    const sid = str(s.id, `${w}.id`);
    if (seen.has(sid)) fail(`${w}: the id "${sid}" is used twice`);
    seen.add(sid);
    if (typeof s.default !== 'boolean') fail(`${w}.default must be true or false`);
    const combo = num(s.combo, `${w}.combo`);
    if (combo !== i + 1) fail(`${w}.combo must be ${i + 1} (Strikes are in kick combo order)`);
    const focusCost = num(s.focusCost, `${w}.focusCost`);
    if (focusCost < 10) fail(`${w}.focusCost must be at least 10`);
    if (!Array.isArray(s.hits) || s.hits.length === 0) fail(`${w}.hits must list at least one hit`);
    const hits = (s.hits as Record<string, unknown>[]).map((h, j) => {
      const hw = `${w}.hits[${j + 1}]`;
      const strength = num(h.strength, `${hw}.strength`);
      const delayTicks = num(h.delayTicks, `${hw}.delayTicks`);
      if (strength <= 0) fail(`${hw}.strength must be more than 0`);
      if (!Number.isInteger(delayTicks) || delayTicks < 0) fail(`${hw}.delayTicks must be a whole number, 0 or more`);
      return { strength, delayTicks };
    });
    for (let j = 1; j < hits.length; j++) if (hits[j].delayTicks < hits[j - 1].delayTicks) fail(`${w}.hits must be in order of delayTicks`);
    const reach = num(s.reach, `${w}.reach`);
    const lungeTiles = num(s.lungeTiles, `${w}.lungeTiles`);
    const recoveryTicks = num(s.recoveryTicks, `${w}.recoveryTicks`);
    if (reach <= 0 || lungeTiles < 0 || !Number.isInteger(recoveryTicks) || recoveryTicks < 0) fail(`${w} has reach, lunge or recovery out of range`);
    if (recoveryTicks < hits[hits.length - 1].delayTicks) fail(`${w}.recoveryTicks must last until the last hit lands`);
    if (!Array.isArray(s.legacyIds)) fail(`${w}.legacyIds must be a list`);
    const legacyIds = (s.legacyIds as unknown[]).map((l) => str(l, `${w}.legacyIds`));
    for (const l of legacyIds) {
      if (legacy.has(l)) fail(`${w}: the old id "${l}" is on two Strikes`);
      legacy.add(l);
    }
    const def: StrikeDef = { id: sid, name: str(s.name, `${w}.name`), text: str(s.text, `${w}.text`), combo, default: s.default as boolean, focusCost, hits, reach, lungeTiles, recoveryTicks, legacyIds };
    return def;
  });
  if (defs.length === 0) fail('strikes: the list is empty');
  if (defs.filter((s) => s.default).length !== 1) fail('strikes: exactly one Strike must have "default": true');
  if (!defs[0].default) fail('strikes: the default Strike (Spin Kick) must be first');
  return defs;
}
