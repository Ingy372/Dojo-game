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
  // Nov 25: the Yellow Guardian (its torn form is LOOM_KEEPER_TORN).
  'loom-keeper': { pack: 'enemy-loom-keeper', id: 'loom-keeper' },
  'spool-peg': { pack: 'enemy-spool-peg', id: 'spool-peg' },
};

/** B-T3: the Hearth Cook has one rig per phase; this many health left (share) or more uses that rig. */
const HEARTH_COOK_RIGS: Array<{ atHealth: number; pack: PackName; id: string }> = [
  { atHealth: 0.66, pack: 'enemy-hearth-cook-p1', id: 'hearth-cook-p1' },
  { atHealth: 0.33, pack: 'enemy-hearth-cook-p2', id: 'hearth-cook-p2' },
  { atHealth: 0, pack: 'enemy-hearth-cook-p3', id: 'hearth-cook-p3' },
];

/**
 * Visual overhaul (Nov 22): the Floor Keeper transforms at half health (WARDEN UNBOUND), when it calls its helpers.
 * Drawing only: its fight rules are unchanged. It keeps the Shades v2 drawing boost (same 160 px per tile art).
 */
const FLOOR_KEEPER_FORM2 = { atHealth: 0.5, pack: 'enemy-floor-keeper-f2' as PackName, id: 'floor-keeper-f2' };

/** The Loom Keeper's coat tears at a third of its health (Blender art, Nov 25, waiting on Jay's OK). */
const LOOM_KEEPER_TORN = { atHealth: 1 / 3, pack: 'enemy-loom-keeper-f2' as PackName, id: 'loom-keeper-f2' };

/** Every pack ENEMY_PACKS or a phase rig can use, for loading. */
export const ENEMY_ART_PACKS: PackName[] = [...new Set([...Object.values(ENEMY_PACKS).map((p) => p.pack), ...HEARTH_COOK_RIGS.map((r) => r.pack), FLOOR_KEEPER_FORM2.pack, LOOM_KEEPER_TORN.pack])];

/**
 * Shades v2 (Jay, Nov 18: "draw them sharper and bigger"). The White belt monsters (pack enemies-t1) are rendered at
 * 160 px per tile and packed at 96, twice the pixels of every other pack, so they are drawn at half size
 * (SHARP_PACK) and then 25% bigger than their hit circle (BIGGER). Drawing only: the fight rules are unchanged.
 */
const SHARP_PACK = 0.5;
const BIGGER = 1.25;
export const ART_BOOST: Record<string, number> = { swarmer: SHARP_PACK * BIGGER, shield: SHARP_PACK * BIGGER, brute: SHARP_PACK * BIGGER, 'floor-keeper': SHARP_PACK * BIGGER, 'loom-keeper': SHARP_PACK * BIGGER };

/** A monster drawn as a recoloured stand-in until its own art is OK'd (none now: the Spool Pegs have their Blender art). */
export const STAND_IN_TINT: Record<string, number> = {};

/** Rigs packed at a different pixel size than their enemy's usual art: drawn this much bigger to match (Nov 22). */
const RIG_BOOST: Record<string, number> = { 'floor-keeper-f2': 0.6 / 0.45, 'loom-keeper': 0.6 / 0.45, 'loom-keeper-f2': 0.6 / 0.45 };
export function rigBoost(rigId: string | undefined): number {
  return (rigId && RIG_BOOST[rigId]) || 1;
}

/** How big an enemy's art is drawn: its Guardian scale times any drawing boost. */
export function artScale(def: { id: string; scale: number }): number {
  return def.scale * (ART_BOOST[def.id] ?? 1);
}

/** The art (pack, id) for an enemy at this share of health; phase bosses change rig as they lose health. */
export function enemyArt(enemyId: string, healthShare: number): { pack: PackName; id: string } | undefined {
  if (enemyId === 'hearth-cook') return HEARTH_COOK_RIGS.find((r) => healthShare >= r.atHealth) ?? HEARTH_COOK_RIGS[2];
  if (enemyId === 'loom-keeper' && healthShare <= LOOM_KEEPER_TORN.atHealth) return { pack: LOOM_KEEPER_TORN.pack, id: LOOM_KEEPER_TORN.id };
  if (enemyId === 'floor-keeper' && healthShare < FLOOR_KEEPER_FORM2.atHealth) return { pack: FLOOR_KEEPER_FORM2.pack, id: FLOOR_KEEPER_FORM2.id };
  return ENEMY_PACKS[enemyId];
}

/** Attack names whose animation has a shorter name in the art (B-T3 Hearth Cook). */
const ATTACK_ANIMS: Record<string, string> = { 'ladle bonk': 'bonk', 'hot pot rush': 'rush', 'rolling pin lane': 'pin', 'spool toss': 'toss', 'thread line': 'weave', 'crossing threads': 'weave', 'big cloth': 'cloth' };

/** The animation name for an attack (the Floor Keeper's "slam" is already "slam"). */
export function attackAnim(attackName: string): string {
  return ATTACK_ANIMS[attackName] ?? attackName;
}

/** TUT-A1: the tutorial floor's own art (Tower Path ground, stones, dummies, stumble stars). */
export const TUTORIAL_PACK: PackName = 'tutorial-path';

/** TUT-B3: the practice dummies are drawn from still sprites in the tutorial pack (sprite id prefix). */
export const DUMMY_ART: Record<string, string> = { 'practice-dummy': 'dummy-small', 'big-practice-dummy': 'dummy-big' };
