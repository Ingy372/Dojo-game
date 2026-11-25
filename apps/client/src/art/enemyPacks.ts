// Which art pack draws each monster, and which packs a Tower room needs (CW-4). No browser code here, so tests can use it.

import type { PackName } from './art';

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

/**
 * Visual overhaul (Nov 22): the Floor Keeper transforms at half health (WARDEN UNBOUND), when it calls its helpers.
 * Drawing only: its fight rules are unchanged. It keeps the Shades v2 drawing boost (same 160 px per tile art).
 */
const FLOOR_KEEPER_FORM2 = { atHealth: 0.5, pack: 'enemy-floor-keeper-f2' as PackName, id: 'floor-keeper-f2' };

/** Every pack ENEMY_PACKS or a phase rig can use, for loading. */
export const ENEMY_ART_PACKS: PackName[] = [...new Set([...Object.values(ENEMY_PACKS).map((p) => p.pack), ...HEARTH_COOK_RIGS.map((r) => r.pack), FLOOR_KEEPER_FORM2.pack])];

/** What `enemyArtPacksFor` needs to know about an enemy type: who it calls in and what it splits into. */
interface EnemyLinks {
  id: string;
  summon?: { enemy: string } | null;
  split?: { into: string } | null;
}

/**
 * CW-4 (Nov 25): only the monster art one room can show, instead of every belt's monsters on every climb
 * (about 30 MB, most of it Orange belt art a White belt never meets). Follows each enemy to what it calls in
 * or splits into, and adds every later form of a boss (the Hearth Cook's rigs, the Floor Keeper's second form).
 * The White belt pack (enemies-t1) is loaded separately, as before.
 */
export function enemyArtPacksFor(enemyIds: Iterable<string>, defs: readonly EnemyLinks[]): PackName[] {
  const byId = new Map(defs.map((d) => [d.id, d]));
  const seen = new Set<string>();
  const queue = [...enemyIds];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const def = byId.get(id);
    if (def?.summon) queue.push(def.summon.enemy);
    if (def?.split) queue.push(def.split.into);
  }
  const packs = new Set<PackName>();
  for (const id of seen) {
    const own = ENEMY_PACKS[id];
    if (own) packs.add(own.pack);
    if (id === 'hearth-cook') HEARTH_COOK_RIGS.forEach((r) => packs.add(r.pack));
    if (id === 'floor-keeper') packs.add(FLOOR_KEEPER_FORM2.pack);
  }
  return [...packs];
}

/** The art (pack, id) for an enemy at this share of health; phase bosses change rig as they lose health. */
export function enemyArt(enemyId: string, healthShare: number): { pack: PackName; id: string } | undefined {
  if (enemyId === 'hearth-cook') return HEARTH_COOK_RIGS.find((r) => healthShare >= r.atHealth) ?? HEARTH_COOK_RIGS[2];
  if (enemyId === 'floor-keeper' && healthShare < FLOOR_KEEPER_FORM2.atHealth) return { pack: FLOOR_KEEPER_FORM2.pack, id: FLOOR_KEEPER_FORM2.id };
  return ENEMY_PACKS[enemyId];
}
