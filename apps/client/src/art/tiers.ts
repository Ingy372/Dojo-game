// Which art packs a belt tier uses, plus the test links that preview new art.

import type { PackName } from './art';
import { testFlags } from '../game/beta';

// CW-4: the monster art lists live in enemyPacks.ts (no browser needed, so tests can use them).
export { ENEMY_PACKS, ENEMY_ART_PACKS, enemyArt, enemyArtPacksFor } from './enemyPacks';

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

/**
 * Shades v2 (Jay, Nov 18: "draw them sharper and bigger"). The White belt monsters (pack enemies-t1) are rendered at
 * 160 px per tile and packed at 96, twice the pixels of every other pack, so they are drawn at half size
 * (SHARP_PACK) and then 25% bigger than their hit circle (BIGGER). Drawing only: the fight rules are unchanged.
 */
const SHARP_PACK = 0.5;
const BIGGER = 1.25;
export const ART_BOOST: Record<string, number> = { swarmer: SHARP_PACK * BIGGER, shield: SHARP_PACK * BIGGER, brute: SHARP_PACK * BIGGER, 'floor-keeper': SHARP_PACK * BIGGER };

/** Rigs packed at a different pixel size than their enemy's usual art: drawn this much bigger to match (Nov 22). */
const RIG_BOOST: Record<string, number> = { 'floor-keeper-f2': 0.6 / 0.45 };
export function rigBoost(rigId: string | undefined): number {
  return (rigId && RIG_BOOST[rigId]) || 1;
}

/** How big an enemy's art is drawn: its Guardian scale times any drawing boost. */
export function artScale(def: { id: string; scale: number }): number {
  return def.scale * (ART_BOOST[def.id] ?? 1);
}


/** Attack names whose animation has a shorter name in the art (B-T3 Hearth Cook). */
const ATTACK_ANIMS: Record<string, string> = { 'ladle bonk': 'bonk', 'hot pot rush': 'rush', 'rolling pin lane': 'pin' };

/** The animation name for an attack (the Floor Keeper's "slam" is already "slam"). */
export function attackAnim(attackName: string): string {
  return ATTACK_ANIMS[attackName] ?? attackName;
}

/** TUT-A1: the tutorial floor's own art (Tower Path ground, stones, dummies, stumble stars). */
export const TUTORIAL_PACK: PackName = 'tutorial-path';

/** TUT-B3: the practice dummies are drawn from still sprites in the tutorial pack (sprite id prefix). */
export const DUMMY_ART: Record<string, string> = { 'practice-dummy': 'dummy-small', 'big-practice-dummy': 'dummy-big' };
