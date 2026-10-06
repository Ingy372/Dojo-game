// Enemy types are content (data files in content/enemies), checked here when loaded.
// Distances are in tiles and times in ticks.

import { TICKS_PER_SECOND } from './config';

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

export interface EnemyDef {
  id: string;
  name: string;
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
  winded: EnemyWindedDef | null;
  /** A good time to beat it, in seconds; a room's par time for grades adds these up. */
  parSeconds: number;
  /** Placeholder body color, as "#rrggbb" (art comes later). */
  color: string;
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
  // Every attack must be telegraphed: at least half a second of warning on Standard.
  if (attack.telegraphTicks < 10) {
    throw new EnemyError(id, `"${where}.telegraphTicks" must be at least 10 (half a second of warning)`);
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

  const color = typeof raw.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.color) ? raw.color : '#7d3f2f';

  return {
    id,
    name: raw.name,
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
    winded,
    parSeconds: raw.parSeconds === undefined ? 4 : positiveNumber(raw, 'parSeconds', id),
    color,
  };
}
