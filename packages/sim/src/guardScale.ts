// GUARD-SCALE-01: Guardians (boss enemies) are drawn bigger, and their hitbox and attacks grow to match.
// The numbers are content (content/settings/guardian-scale.json); this file checks them and applies them.

import type { EnemyAttackDef, EnemyDef } from './enemy';

export interface BossZoomDef {
  /** Share of the normal camera zoom the camera pulls back to (below 1 = zoomed out). */
  zoomTo: number;
  outMs: number;
  holdMs: number;
  backMs: number;
}

export interface BossRoomZoomDef {
  /** Marked placeholder until Jay picks the number. */
  placeholder: boolean;
  zoom: number;
}

export interface GuardianScaleContent {
  /** Scale for every boss enemy without its own entry. */
  guardianScale: number;
  /** Own scale for named Guardians (the ids may not exist yet). */
  bigGuardians: Record<string, number>;
  /**
   * How much of the body's growth the danger circles take, 0 to 1: a circle grows by 1 + (scale - 1) x this.
   * 1 = the circles grow as much as the body. Lower keeps the body big but trims the reach of the attacks.
   */
  attackGrowth: number;
  /** The same for `reach` and `startRange`, 0 to 1: they grow by the extra body radius x this (1 = the gap from the Guardian's edge stays what it was). */
  reachGrowth: number;
  /** Camera zoom held in every Guardian room, as a share of the normal zoom (1 = none). */
  bossRoomZoom: BossRoomZoomDef;
  bossZoom: BossZoomDef;
}

/** Used when content is loaded without the file (tests that build content by hand): nothing changes. */
export const NO_GUARDIAN_SCALE: GuardianScaleContent = { guardianScale: 1, bigGuardians: {}, attackGrowth: 1, reachGrowth: 1, bossRoomZoom: { placeholder: false, zoom: 1 }, bossZoom: { zoomTo: 1, outMs: 1, holdMs: 0, backMs: 1 } };

export const GUARDIAN_SCALE_MIN = 1;
export const GUARDIAN_SCALE_MAX = 2;

function num(o: Record<string, unknown>, key: string, lo: number, hi: number, where: string): number {
  const v = o[key];
  if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) throw new Error(`guardian-scale.json: "${where}${key}" must be a number from ${lo} to ${hi}`);
  return v;
}

export function loadGuardianScale(data: unknown): GuardianScaleContent {
  if (typeof data !== 'object' || data === null) throw new Error('guardian-scale.json must be an object');
  const d = data as Record<string, unknown>;
  const guardianScale = num(d, 'guardianScale', GUARDIAN_SCALE_MIN, GUARDIAN_SCALE_MAX, '');
  const big = (d.bigGuardians ?? {}) as Record<string, unknown>;
  if (typeof big !== 'object' || big === null) throw new Error('guardian-scale.json: "bigGuardians" must be an object');
  const bigGuardians: Record<string, number> = {};
  for (const id of Object.keys(big)) bigGuardians[id] = num(big, id, GUARDIAN_SCALE_MIN, GUARDIAN_SCALE_MAX, 'bigGuardians.');
  const attackGrowth = num(d, 'attackGrowth', 0, 1, '');
  const reachGrowth = num(d, 'reachGrowth', 0, 1, '');
  const r = d.bossRoomZoom as Record<string, unknown>;
  if (typeof r !== 'object' || r === null) throw new Error('guardian-scale.json: "bossRoomZoom" must be an object');
  const bossRoomZoom: BossRoomZoomDef = { placeholder: r.placeholder === true, zoom: num(r, 'zoom', 0.5, 1, 'bossRoomZoom.') };
  const z = d.bossZoom as Record<string, unknown>;
  if (typeof z !== 'object' || z === null) throw new Error('guardian-scale.json: "bossZoom" must be an object');
  const bossZoom: BossZoomDef = {
    zoomTo: num(z, 'zoomTo', 0.5, 1, 'bossZoom.'),
    outMs: num(z, 'outMs', 1, 5000, 'bossZoom.'),
    holdMs: num(z, 'holdMs', 0, 5000, 'bossZoom.'),
    backMs: num(z, 'backMs', 1, 5000, 'bossZoom.'),
  };
  return { guardianScale, bigGuardians, attackGrowth, reachGrowth, bossRoomZoom, bossZoom };
}

/** The scale for an enemy: its own entry, else the Guardian scale for any boss, else 1. */
export function guardianScaleFor(c: GuardianScaleContent, id: string, boss: boolean): number {
  if (c.bigGuardians[id] !== undefined) return c.bigGuardians[id];
  return boss ? c.guardianScale : 1;
}

function scaleAttack(a: EnemyAttackDef, circle: number, grow: number): EnemyAttackDef {
  return { ...a, startRange: a.startRange + grow, reach: a.reach > 0 ? a.reach + grow : 0, areaRadius: a.areaRadius * circle };
}

/**
 * The enemy at `scale`: a bigger body, and danger areas that grow by `attackGrowth` of that (1 = as much as the body). `reach` and `startRange` grow by the extra
 * body radius, so the gap from its edge to where its attacks start is the same as before. Done once, when content loads.
 */
export function scaleEnemyDef(def: EnemyDef, scale: number, attackGrowth = 1, reachGrowth = 1): EnemyDef {
  if (scale === 1) return def;
  const grow = def.radius * (scale - 1) * reachGrowth;
  const circle = 1 + (scale - 1) * attackGrowth;
  const out: EnemyDef = { ...def, radius: def.radius * scale, scale, attacks: def.attacks.map((a) => scaleAttack(a, circle, grow)) };
  if (def.challenge) out.challenge = { ...def.challenge, attacks: def.challenge.attacks.map((a) => scaleAttack(a, circle, grow)) };
  return out;
}
