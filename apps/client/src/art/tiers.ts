// Which art packs a belt tier uses, plus the test links that preview new art.

import type { PackName } from './art';
import { testFlags } from '../game/beta';

/** Tower art packs, one per belt tier that has art so far (Tier 2 = Yellow belt, "Sunrise Garden"; Tier 3 = Orange belt, "Ember Kitchens"). */
const TOWER_PACKS: PackName[] = ['tower-t1', 'tower-t2', 'tower-t3'];

/**
 * The tower art pack for a belt tier (1 = White belt). Tiers without their own art yet
 * use the newest kit. For testing, ?tower=t1 or ?tower=t2 picks one directly.
 */
export function towerPack(tier: number, search = window.location.search): PackName {
  const asked = testFlags(search).get('tower');
  const forced = asked ? `tower-${asked}` : null;
  if (forced && TOWER_PACKS.includes(forced)) return forced;
  return TOWER_PACKS[Math.min(Math.max(tier, 1), TOWER_PACKS.length) - 1];
}

/** The elite aura kinds that have art (S1 #3). */
export type AuraKind = 'swift' | 'guarding';

/**
 * For testing only, until elites arrive (S1 #3): ?aura=swift or ?aura=guarding draws
 * that aura on every enemy. It changes only the picture, never the game rules.
 */
export function testAura(search = window.location.search): AuraKind | null {
  const asked = testFlags(search).get('aura');
  return asked === 'swift' || asked === 'guarding' ? asked : null;
}

/** The aura art id for an enemy type (the art calls the Floor Keeper "keeper"). */
export function auraId(kind: AuraKind, enemyId: string): string {
  return `aura-${kind}-${enemyId === 'floor-keeper' ? 'keeper' : enemyId}`;
}

/** Enemies drawn from their own art pack instead of the Tier 1 enemy pack (pack, art id). */
export const ENEMY_PACKS: Record<string, { pack: PackName; id: string }> = {
  bopper: { pack: 'enemy-bopper', id: 'bopper' },
  // B-T3: Orange belt (Ember Kitchens).
  'spark-sprite': { pack: 'enemy-spark-sprite', id: 'spark-sprite' },
  'ladle-lobber': { pack: 'enemy-ladle-lobber', id: 'ladle-lobber' },
  'dough-blob': { pack: 'enemy-dough-blob', id: 'dough-blob' },
  doughling: { pack: 'enemy-doughling', id: 'doughling' },
  'rolling-pin': { pack: 'enemy-rolling-pin', id: 'rolling-pin' },
  'hearth-cook': { pack: 'enemy-hearth-cook-p1', id: 'hearth-cook-p1' },
};

/** B-T3: the Hearth Cook has one rig per phase; this many health left (share) or more uses that rig. */
const HEARTH_COOK_RIGS: Array<{ atHealth: number; pack: PackName; id: string }> = [
  { atHealth: 0.66, pack: 'enemy-hearth-cook-p1', id: 'hearth-cook-p1' },
  { atHealth: 0.33, pack: 'enemy-hearth-cook-p2', id: 'hearth-cook-p2' },
  { atHealth: 0, pack: 'enemy-hearth-cook-p3', id: 'hearth-cook-p3' },
];

/** Every pack ENEMY_PACKS or a phase rig can use, for loading. */
export const ENEMY_ART_PACKS: PackName[] = [...new Set([...Object.values(ENEMY_PACKS).map((p) => p.pack), ...HEARTH_COOK_RIGS.map((r) => r.pack)])];

/** The art (pack, id) for an enemy at this share of health; phase bosses change rig as they lose health. */
export function enemyArt(enemyId: string, healthShare: number): { pack: PackName; id: string } | undefined {
  if (enemyId === 'hearth-cook') return HEARTH_COOK_RIGS.find((r) => healthShare >= r.atHealth) ?? HEARTH_COOK_RIGS[2];
  return ENEMY_PACKS[enemyId];
}

/** Attack names whose animation has a shorter name in the art (B-T3 Hearth Cook). */
const ATTACK_ANIMS: Record<string, string> = { 'ladle bonk': 'bonk', 'hot pot rush': 'rush', 'rolling pin lane': 'pin' };

/** The animation name for an attack (the Floor Keeper's "slam" is already "slam"). */
export function attackAnim(attackName: string): string {
  return ATTACK_ANIMS[attackName] ?? attackName;
}
