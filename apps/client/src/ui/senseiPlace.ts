// Q-P4 QA: one rule for where any Sensei banner may sit. Pure (no Phaser) so it can be unit-tested.

/** The highest y a Sensei banner may use: 6 px under the top bar's lowest edge. */
export function senseiFloorY(topBarBottom: number): number {
  return topBarBottom + 6;
}

/** Sensei's usual spot: its layout top, but never above the floor. */
export function senseiHomeY(senseiTop: number, topBarBottom: number): number {
  return Math.max(senseiTop, senseiFloorY(topBarBottom));
}
