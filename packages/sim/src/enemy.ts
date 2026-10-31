// Enemy types are content (data files in content/enemies), checked here when loaded.
// Distances are in tiles and times in ticks.

import { CHALLENGE_FROM_TIER, DIFFICULTY, MIN_WINDUP_TICKS, TICKS_PER_SECOND } from './config';

export interface EnemyAttackDef {
  /** Optional name, for bosses with several attacks (for example "slam"). */
  name: string;
  /** Move strength used in the damage formula. */
  strength: number;
  /** Starts winding up when the player's center is this close to its center. */
  startRange: number;
  /** The danger area's center sits this far in front of the enemy (0 = centered on the enemy). */
  reach: number;
  /** Size of the round danger area shown on the floor. */
  areaRadius: number;
  /** Wind-up (telegraph) length on Standard difficulty, Perfect Counter window included. */
  telegraphTicks: number;
  /** Pause after swinging before it can move or attack again. */
  recoverTicks: number;
  /** B-T3: false for dash-only attacks (the Rolling Pin's roll). A Counter does nothing; the answer is to dash out. */
  counterable?: boolean;
  /** R-CHALLENGE P2: a second hit after this one, with its own full wind-up (Challenge patterns only). */
  followUp?: EnemyFollowUpDef;
  /** R-CHALLENGE P2: the danger circle is drawn at the spot it lands on (tells come in P4). */
  landing?: boolean;
  /** R-CHALLENGE P3: set on attacks from the Challenge block. They must start on screen (see SIM_VIEW). */
  challenge?: boolean;
  /** R-CHALLENGE P3: on Challenge, this dash-only lane never starts while another enemy's red circle covers the player. */
  noOverlapWithRedCircle?: boolean;
  /** R-CHALLENGE P4: designer note on how the tell looks and sounds (not shown in game). */
  tell?: string;
  /** R-CHALLENGE P4: what Sensei says the first time this save meets this attack. */
  senseiLine?: string;
}

/** R-CHALLENGE P4: how a pattern attack's danger area is drawn at the start of its wind-up. */
export type PatternShape = 'lane' | 'landing' | 'circle';

/** R-CHALLENGE P4: the tell shape of a Challenge pattern attack, or null for a normal attack (drawn as today). */
export function patternShape(a: EnemyAttackDef): PatternShape | null {
  if (!a.challenge) return null;
  if (a.counterable === false) return 'lane';
  return a.landing ? 'landing' : 'circle';
}

/** R-CHALLENGE P4: the per-save key for "first time this attack is seen" (enemy + attack). */
export function patternKey(enemyId: string, a: EnemyAttackDef): string {
  return `${enemyId}:${a.name}`;
}

/** R-CHALLENGE P2: the second hit of a two-part attack. */
export interface EnemyFollowUpDef {
  /** Share of the attack's strength (0 to 1). */
  strength: number;
  /** Ticks between the first hit and the start of the second wind-up (at least the attack's recover). */
  gapTicks: number;
}

/** R-CHALLENGE P2: the optional Challenge block. Used only on Challenge, from `fromBelt` and `fromRoom` up. */
export interface EnemyChallengeDef {
  /** Real belt number, CHALLENGE_FROM_TIER to 10. */
  fromBelt: number;
  /** Room number in the floor (1 = first room). */
  fromRoom: number;
  /** Extra attacks, added after the normal ones. */
  attacks: EnemyAttackDef[];
  /** Attack order that repeats (indexes into normal + extra attacks), or null for all in turn. */
  pattern: number[] | null;
  /** Bosses: replaces the normal phases on Challenge (indexes into normal + extra attacks). */
  phases: EnemyPhaseDef[] | null;
}

/** B-T3: a boss phase. From this share of health down, only these attacks (indexes into attacks) are used, in turn. */
export interface EnemyPhaseDef {
  atHealthFraction: number;
  attacks: number[];
  /** B-T3-TUNE-2c: what Sensei says when this phase starts (shown during the phase pause). */
  senseiLine: string | null;
}

/** B-T3: when beaten, it splits into smaller enemies (Dough Blob into 2 Doughlings). */
export interface EnemySplitDef {
  into: string;
  count: number;
}

export interface EnemyShieldDef {
  /** After the shield breaks, it grows back after this many ticks. */
  regrowTicks: number;
}

/** Slow chasers get winded: after chasing this long without swinging, they stop to catch their breath. */
export interface EnemyWindedDef {
  afterTicks: number;
  ticks: number;
  /** Extra damage share taken while winded (0.5 = +50%). */
  damageBonus: number;
}

export interface EnemySummonDef {
  /** The enemy type called in (an id from content/enemies). */
  enemy: string;
  count: number;
  /** Called once, when health first falls to this share of max health (0 to 1). */
  atHealthFraction: number;
}

/** Enemies that carry a weapon (Bouncy Bopper's padded staff). Disarmed, they push instead. */
export interface EnemyWeaponDef {
  id: string;
  /** Power of the weak push a disarmed enemy uses instead of its weapon (same wind-up and warning). */
  disarmedPower: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  /** Short plain name for small spaces like Journal cards; falls back to name. */
  shortName: string;
  maxHealth: number;
  power: number;
  guard: number;
  radius: number;
  moveSpeedTilesPerSecond: number;
  sightRange: number;
  /** Attacks used in turn (most enemies have one). */
  attacks: EnemyAttackDef[];
  /** Shield enemies: basic attacks bounce off until a Strike or Perfect Counter breaks it. */
  shield: EnemyShieldDef | null;
  /** Bosses may be bigger than one tile and should only be placed in open rooms. */
  boss: boolean;
  summon: EnemySummonDef | null;
  /** B-T3-TUNE-2a: player hits do 0 (a "clang") while any helper it called is still up. */
  lidWhileHelpers?: boolean;
  /** B-T3: boss phases, highest health first (null or missing = all attacks in turn). */
  phases?: EnemyPhaseDef[] | null;
  /** B-T3: splits into smaller enemies when beaten. */
  split?: EnemySplitDef | null;
  winded: EnemyWindedDef | null;
  weapon: EnemyWeaponDef | null;
  /** A good time to beat it, in seconds; a room's par time for grades adds these up. */
  parSeconds: number;
  /** Placeholder body color, as "#rrggbb" (art comes later). */
  color: string;
  /** R-CHALLENGE P2: attack order that repeats (set only by mergeChallenge). */
  pattern?: number[];
  /** R-CHALLENGE P2: the Challenge block (missing when the file has none). */
  challenge?: EnemyChallengeDef;
}

export class EnemyError extends Error {
  constructor(enemyId: string, problem: string) {
    super(`Enemy "${enemyId}" has a problem: ${problem}`);
    this.name = 'EnemyError';
  }
}

function positiveNumber(obj: Record<string, unknown>, key: string, id: string, where = ''): number {
  const v = obj[key];
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) {
    throw new EnemyError(id, `"${where}${key}" must be a number above 0`);
  }
  return v;
}

function nonNegative(obj: Record<string, unknown>, key: string, id: string, where = ''): number {
  const v = obj[key];
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
    throw new EnemyError(id, `"${where}${key}" must be a number of 0 or more`);
  }
  return v;
}

function wholeTicks(obj: Record<string, unknown>, key: string, id: string, where = ''): number {
  const v = positiveNumber(obj, key, id, where);
  if (!Number.isInteger(v)) throw new EnemyError(id, `"${where}${key}" must be a whole number of ticks`);
  return v;
}

function loadAttack(data: unknown, id: string, where: string): EnemyAttackDef {
  if (typeof data !== 'object' || data === null) throw new EnemyError(id, `"${where}" must be an attack`);
  const a = data as Record<string, unknown>;
  const attack: EnemyAttackDef = {
    name: typeof a.name === 'string' ? a.name : 'attack',
    strength: positiveNumber(a, 'strength', id, `${where}.`),
    startRange: positiveNumber(a, 'startRange', id, `${where}.`),
    reach: nonNegative(a, 'reach', id, `${where}.`),
    areaRadius: positiveNumber(a, 'areaRadius', id, `${where}.`),
    telegraphTicks: wholeTicks(a, 'telegraphTicks', id, `${where}.`),
    recoverTicks: wholeTicks(a, 'recoverTicks', id, `${where}.`),
  };
  if (a.counterable !== undefined && typeof a.counterable !== 'boolean') throw new EnemyError(id, `"${where}.counterable" must be true or false`);
  if (a.counterable === false || a.dashOnly === true) attack.counterable = false;
  if (a.noOverlapWithRedCircle !== undefined && typeof a.noOverlapWithRedCircle !== 'boolean') throw new EnemyError(id, `"${where}.noOverlapWithRedCircle" must be true or false`);
  if (a.noOverlapWithRedCircle === true) attack.noOverlapWithRedCircle = true;
  for (const k of ['tell', 'senseiLine'] as const) {
    if (a[k] === undefined) continue;
    if (typeof a[k] !== 'string' || (a[k] as string).trim() === '') throw new EnemyError(id, `"${where}.${k}" must be some text`);
    attack[k] = a[k] as string;
  }
  // Every attack must be telegraphed: at least half a second of warning on Standard.
  if (attack.telegraphTicks < MIN_WINDUP_TICKS) {
    throw new EnemyError(id, `"${where}.telegraphTicks" must be at least ${MIN_WINDUP_TICKS} (half a second of warning)`);
  }
  return attack;
}

/** Checks an enemy data file and turns it into an EnemyDef, or throws a clear EnemyError. */
export function loadEnemy(data: unknown): EnemyDef {
  if (typeof data !== 'object' || data === null) throw new EnemyError('?', 'the file is not an enemy object');
  const raw = data as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : '';
  if (!id) throw new EnemyError('?', '"id" must be a non-empty text');
  if (typeof raw.name !== 'string' || raw.name.length === 0) {
    throw new EnemyError(id, '"name" must be a non-empty text');
  }
  if (raw.shortName !== undefined && (typeof raw.shortName !== 'string' || raw.shortName.length === 0)) {
    throw new EnemyError(id, '"shortName" must be a non-empty text when given');
  }
  const guard = nonNegative(raw, 'guard', id);
  const boss = raw.boss === true;
  const radius = positiveNumber(raw, 'radius', id);
  if (!boss && radius >= 0.5) throw new EnemyError(id, '"radius" must be under 0.5 so it fits through one-tile gaps');
  if (boss && radius >= 1) throw new EnemyError(id, '"radius" must be under 1');

  let attacks: EnemyAttackDef[];
  if (Array.isArray(raw.attacks)) {
    if (raw.attacks.length === 0) throw new EnemyError(id, '"attacks" must list at least one attack');
    attacks = raw.attacks.map((a, i) => loadAttack(a, id, `attacks[${i + 1}]`));
  } else if (raw.attack !== undefined) {
    attacks = [loadAttack(raw.attack, id, 'attack')];
  } else {
    throw new EnemyError(id, '"attack" is missing');
  }
  // R-CHALLENGE P3: the Rolling Pin keeps the no-overlap flag in its "dashOnlyAttack" notes block.
  const dashNote = raw.dashOnlyAttack as Record<string, unknown> | undefined;
  if (dashNote && typeof dashNote === 'object' && dashNote.noOverlapWithRedCircle === true) {
    for (const a of attacks) if (a.name === dashNote.name && a.counterable === false) a.noOverlapWithRedCircle = true;
  }

  let shield: EnemyShieldDef | null = null;
  if (raw.shield !== undefined) {
    if (typeof raw.shield !== 'object' || raw.shield === null) throw new EnemyError(id, '"shield" must be an object');
    shield = { regrowTicks: wholeTicks(raw.shield as Record<string, unknown>, 'regrowTicks', id, 'shield.') };
  }

  let summon: EnemySummonDef | null = null;
  if (raw.summon !== undefined) {
    const s = raw.summon as Record<string, unknown>;
    if (typeof s !== 'object' || s === null || typeof s.enemy !== 'string') {
      throw new EnemyError(id, '"summon" needs an "enemy" type');
    }
    const count = positiveNumber(s, 'count', id, 'summon.');
    const at = positiveNumber(s, 'atHealthFraction', id, 'summon.');
    if (!Number.isInteger(count)) throw new EnemyError(id, '"summon.count" must be a whole number');
    if (at >= 1) throw new EnemyError(id, '"summon.atHealthFraction" must be below 1');
    summon = { enemy: s.enemy, count, atHealthFraction: at };
  }

  let winded: EnemyWindedDef | null = null;
  if (raw.winded !== undefined) {
    const w = raw.winded as Record<string, unknown>;
    if (typeof w !== 'object' || w === null) throw new EnemyError(id, '"winded" must be an object');
    winded = {
      afterTicks: Math.round(positiveNumber(w, 'afterSeconds', id, 'winded.') * TICKS_PER_SECOND),
      ticks: Math.round(positiveNumber(w, 'seconds', id, 'winded.') * TICKS_PER_SECOND),
      damageBonus: nonNegative(w, 'damageBonus', id, 'winded.'),
    };
  }

  let weapon: EnemyWeaponDef | null = null;
  if (raw.weapon !== undefined) {
    const w = raw.weapon as Record<string, unknown>;
    if (typeof w !== 'object' || w === null || typeof w.id !== 'string' || !w.id) throw new EnemyError(id, '"weapon" needs an "id"');
    weapon = { id: w.id, disarmedPower: positiveNumber(w, 'disarmedPower', id, 'weapon.') };
  }

  const phases = raw.phases !== undefined ? loadPhases(raw.phases, attacks, id, 'phases') : null;

  let split: EnemySplitDef | null = null;
  if (raw.split !== undefined && raw.split !== null) {
    const o = raw.split as Record<string, unknown>;
    if (typeof o.into !== 'string' || !o.into) throw new EnemyError(id, '"split" needs an "into" enemy type');
    const count = positiveNumber(o, 'count', id, 'split.');
    if (!Number.isInteger(count)) throw new EnemyError(id, '"split.count" must be a whole number');
    split = { into: o.into, count };
  }

  const color = typeof raw.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.color) ? raw.color : '#7d3f2f';

  return {
    id,
    name: raw.name,
    shortName: typeof raw.shortName === 'string' ? raw.shortName : raw.name,
    maxHealth: positiveNumber(raw, 'maxHealth', id),
    power: positiveNumber(raw, 'power', id),
    guard,
    radius,
    moveSpeedTilesPerSecond: positiveNumber(raw, 'moveSpeedTilesPerSecond', id),
    sightRange: positiveNumber(raw, 'sightRange', id),
    attacks,
    shield,
    boss,
    summon,
    lidWhileHelpers: raw.lidWhileHelpers === true,
    phases,
    split,
    winded,
    weapon,
    parSeconds: raw.parSeconds === undefined ? 4 : positiveNumber(raw, 'parSeconds', id),
    color,
    ...(raw.challenge !== undefined ? { challenge: loadChallenge(raw.challenge, attacks, id) } : {}),
  };
}

function loadPhases(data: unknown, attacks: EnemyAttackDef[], id: string, key: string): EnemyPhaseDef[] {
  if (!Array.isArray(data) || data.length === 0) throw new EnemyError(id, `"${key}" must list at least one phase`);
  let last = Infinity;
  const phases = data.map((ph: unknown, i: number) => {
    const o = (typeof ph === 'object' && ph !== null ? ph : {}) as Record<string, unknown>;
    const at = positiveNumber(o, 'atHealthFraction', id, `${key}[${i + 1}].`);
    if (at > 1 || at >= last) throw new EnemyError(id, `"${key}[${i + 1}].atHealthFraction" must be 1 or less and lower than the phase before`);
    last = at;
    if (!Array.isArray(o.attacks) || o.attacks.length === 0) throw new EnemyError(id, `"${key}[${i + 1}].attacks" must name at least one attack`);
    const list = o.attacks.map((n) => {
      const k = attacks.findIndex((a) => a.name === n);
      if (k < 0) throw new EnemyError(id, `"${key}[${i + 1}]" names attack "${String(n)}", which isn't in "attacks"`);
      return k;
    });
    return { atHealthFraction: at, attacks: list, senseiLine: typeof o.senseiLine === 'string' ? o.senseiLine : null };
  });
  if (phases[0].atHealthFraction !== 1) throw new EnemyError(id, `"${key}[1].atHealthFraction" must be 1`);
  return phases;
}

/** R-CHALLENGE P2: shortest Challenge wind-up for a new pattern attack (0.7 s). */
export const MIN_PATTERN_WINDUP_TICKS = 14;

/** The Challenge wind-up of an attack (same formula as telegraphTicks in world.ts). */
function challengeWindup(a: EnemyAttackDef): number {
  const fill = a.telegraphTicks - DIFFICULTY.standard.counterWindowTicks;
  const d = DIFFICULTY.challenge;
  return Math.max(MIN_WINDUP_TICKS, Math.round(fill * d.fillScale) + d.counterWindowTicks);
}

function loadChallenge(data: unknown, base: EnemyAttackDef[], id: string): EnemyChallengeDef {
  if (typeof data !== 'object' || data === null) throw new EnemyError(id, '"challenge" must be an object');
  const c = data as Record<string, unknown>;
  const fromBelt = c.fromBelt;
  if (typeof fromBelt !== 'number' || !Number.isInteger(fromBelt) || fromBelt < CHALLENGE_FROM_TIER || fromBelt > 10) {
    throw new EnemyError(id, `"challenge.fromBelt" must be a whole number from ${CHALLENGE_FROM_TIER} to 10 (Challenge opens at belt ${CHALLENGE_FROM_TIER})`);
  }
  let fromRoom = 1;
  if (c.fromRoom !== undefined) {
    fromRoom = positiveNumber(c, 'fromRoom', id, 'challenge.');
    if (!Number.isInteger(fromRoom)) throw new EnemyError(id, '"challenge.fromRoom" must be a whole number');
  }
  const rawAttacks = c.attacks ?? [];
  if (!Array.isArray(rawAttacks)) throw new EnemyError(id, '"challenge.attacks" must be a list');
  const extra = rawAttacks.map((a, i) => {
    const where = `challenge.attacks[${i + 1}]`;
    const attack = loadAttack(a, id, where);
    const o = a as Record<string, unknown>;
    if (attack.strength > 1) throw new EnemyError(id, `"${where}.strength" must be 1 or less`);
    if (challengeWindup(attack) < MIN_PATTERN_WINDUP_TICKS) {
      throw new EnemyError(id, `"${where}.telegraphTicks" gives a Challenge wind-up under ${MIN_PATTERN_WINDUP_TICKS} ticks (0.7 s)`);
    }
    if (o.followUp !== undefined) {
      if (typeof o.followUp !== 'object' || o.followUp === null) throw new EnemyError(id, `"${where}.followUp" must be an object`);
      const f = o.followUp as Record<string, unknown>;
      const strength = positiveNumber(f, 'strength', id, `${where}.followUp.`);
      if (strength > 1) throw new EnemyError(id, `"${where}.followUp.strength" must be 1 or less`);
      const gapTicks = wholeTicks(f, 'gapTicks', id, `${where}.followUp.`);
      if (gapTicks < attack.recoverTicks) throw new EnemyError(id, `"${where}.followUp.gapTicks" must be at least its recoverTicks`);
      attack.followUp = { strength, gapTicks };
    }
    if (o.landing !== undefined && typeof o.landing !== 'boolean') throw new EnemyError(id, `"${where}.landing" must be true or false`);
    if (o.landing === true) attack.landing = true;
    attack.challenge = true;
    return attack;
  });
  const all = [...base, ...extra];
  const names = new Set<string>();
  for (const a of all) {
    if (names.has(a.name) && extra.includes(a)) throw new EnemyError(id, `"challenge.attacks" repeats the attack name "${a.name}"`);
    names.add(a.name);
  }
  let pattern: number[] | null = null;
  if (c.pattern !== undefined && c.pattern !== null) {
    if (!Array.isArray(c.pattern) || c.pattern.length === 0) throw new EnemyError(id, '"challenge.pattern" must name at least one attack');
    pattern = c.pattern.map((n) => {
      const k = all.findIndex((a) => a.name === n);
      if (k < 0) throw new EnemyError(id, `"challenge.pattern" names attack "${String(n)}", which isn't in "attacks" or "challenge.attacks"`);
      return k;
    });
  }
  const phases = c.phases !== undefined && c.phases !== null ? loadPhases(c.phases, all, id, 'challenge.phases') : null;
  if (extra.length === 0 && !pattern && !phases) throw new EnemyError(id, '"challenge" needs attacks, a pattern or phases');
  return { fromBelt, fromRoom, attacks: extra, pattern, phases };
}

/** Where a room sits, for the Challenge block's gate. Practice rooms have none. */
export interface ChallengeAt {
  /** Real belt number. */
  belt: number;
  /** Room number in the floor (1 = first room). */
  room: number;
}

/**
 * R-CHALLENGE P2: the one place Challenge patterns switch on. Returns `def` itself (untouched)
 * unless the difficulty is Challenge, the enemy has a challenge block, and the room is at or past
 * its belt and room. Then the extra attacks are added, and the pattern and boss phases are set.
 */
export function challengeDef(def: EnemyDef, difficulty: string, at: ChallengeAt | null | undefined): EnemyDef {
  const c = def.challenge;
  if (difficulty !== 'challenge' || !c || !at || at.belt < c.fromBelt || at.room < c.fromRoom) return def;
  return {
    ...def,
    attacks: [...def.attacks, ...c.attacks],
    ...(c.pattern ? { pattern: c.pattern } : {}),
    phases: c.phases ?? def.phases,
  };
}
