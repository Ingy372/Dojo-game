// Combat formulas (core-design section 4). Pure math, no state.

import { COMBAT } from './config';

/**
 * Damage = Power x move strength x 100 / (100 + target's Guard), raised by any bonus
 * (for example the combo bonus). Rounded to a whole number, and always at least 1,
 * so Guard always helps but never makes anyone invincible.
 */
export function damage(power: number, strength: number, targetGuard: number, bonus = 0): number {
  const raw = (power * strength * 100) / (100 + targetGuard);
  return Math.max(1, Math.round(raw * (1 + bonus)));
}

/** The combo damage bonus for a combo count: 0, 0.05, 0.10 or 0.15. */
export function comboBonus(combo: number): number {
  for (const tier of COMBAT.comboTiers) {
    if (combo >= tier.hits) return tier.bonus;
  }
  return 0;
}
