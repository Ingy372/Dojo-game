// Which art packs a belt tier uses, plus the test links that preview new art.

import type { PackName } from './art';

/** Tower art packs, one per belt tier that has art so far (Tier 2 = Yellow belt, "Sunrise Garden"). */
const TOWER_PACKS: PackName[] = ['tower-t1', 'tower-t2'];

/**
 * The tower art pack for a belt tier (1 = White belt). Tiers without their own art yet
 * use the newest kit. For testing, ?tower=t1 or ?tower=t2 picks one directly.
 */
export function towerPack(tier: number, search = window.location.search): PackName {
  const asked = new URLSearchParams(search).get('tower');
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
  const asked = new URLSearchParams(search).get('aura');
  return asked === 'swift' || asked === 'guarding' ? asked : null;
}

/** The aura art id for an enemy type (the art calls the Floor Keeper "keeper"). */
export function auraId(kind: AuraKind, enemyId: string): string {
  return `aura-${kind}-${enemyId === 'floor-keeper' ? 'keeper' : enemyId}`;
}

/** Enemy art that is imported but not in the game yet (its numbers are still a DECIDE). */
export const TEST_SKINS: Record<string, { pack: PackName; id: string }> = {
  bopper: { pack: 'enemy-bopper', id: 'bopper' },
};

/**
 * For testing only: ?skin=bopper draws the Bouncy Bopper art (A5, PR #111) on every enemy.
 * It changes only the picture, never the game rules, and the staff (weapon layer) is shown.
 */
export function testSkin(search = window.location.search): { pack: PackName; id: string } | null {
  const asked = new URLSearchParams(search).get('skin');
  return asked ? TEST_SKINS[asked] ?? null : null;
}
