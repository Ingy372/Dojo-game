// Enemy types are content (data files in content/enemies), checked here when loaded.
// Distances are in tiles and times in ticks.

export interface EnemyAttackDef {
  /** Move strength used in the damage formula. */
  strength: number;
  /** Starts winding up when the player's center is this close to its center. */
  startRange: number;
  /** The danger area's center sits this far in front of the enemy. */
  reach: number;
  /** Size of the round danger area shown on the floor. */
  areaRadius: number;
  /** Wind-up (telegraph) length on Standard difficulty, Perfect Counter window included. */
  telegraphTicks: number;
  /** Pause after swinging before it can move or attack again. */
  recoverTicks: number;
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
  attack: EnemyAttackDef;
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

function wholeTicks(obj: Record<string, unknown>, key: string, id: string, where = ''): number {
  const v = positiveNumber(obj, key, id, where);
  if (!Number.isInteger(v)) throw new EnemyError(id, `"${where}${key}" must be a whole number of ticks`);
  return v;
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
  const guard = raw.guard;
  if (typeof guard !== 'number' || !Number.isFinite(guard) || guard < 0) {
    throw new EnemyError(id, '"guard" must be a number of 0 or more');
  }
  const radius = positiveNumber(raw, 'radius', id);
  if (radius >= 0.5) throw new EnemyError(id, '"radius" must be under 0.5 so it fits through one-tile gaps');

  if (typeof raw.attack !== 'object' || raw.attack === null) {
    throw new EnemyError(id, '"attack" is missing');
  }
  const a = raw.attack as Record<string, unknown>;
  const attack: EnemyAttackDef = {
    strength: positiveNumber(a, 'strength', id, 'attack.'),
    startRange: positiveNumber(a, 'startRange', id, 'attack.'),
    reach: positiveNumber(a, 'reach', id, 'attack.'),
    areaRadius: positiveNumber(a, 'areaRadius', id, 'attack.'),
    telegraphTicks: wholeTicks(a, 'telegraphTicks', id, 'attack.'),
    recoverTicks: wholeTicks(a, 'recoverTicks', id, 'attack.'),
  };
  // Every attack must be telegraphed: at least half a second of warning on Standard.
  if (attack.telegraphTicks < 10) {
    throw new EnemyError(id, '"attack.telegraphTicks" must be at least 10 (half a second of warning)');
  }

  return {
    id,
    name: raw.name,
    maxHealth: positiveNumber(raw, 'maxHealth', id),
    power: positiveNumber(raw, 'power', id),
    guard,
    radius,
    moveSpeedTilesPerSecond: positiveNumber(raw, 'moveSpeedTilesPerSecond', id),
    sightRange: positiveNumber(raw, 'sightRange', id),
    attack,
  };
}
