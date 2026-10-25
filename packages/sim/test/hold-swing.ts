import type { PlayerState } from '../src';

/**
 * B-MASHER-b test helper: keeps the player out of a basic-attack swing for the next step, so an
 * enemy hit takes the plain Hit path instead of the Mash guard Block. Clears the swing cooldown and
 * holds the next basic attack back for one tick (strikeRecovery is the only other gate on it).
 */
export function holdSwing(p: PlayerState): void {
  p.attackCooldown = 0;
  p.strikeRecovery = Math.max(p.strikeRecovery, 2);
}
