/**
 * K31: one layout rule for the boss's name and its small health bar.
 * They are a pair: the name, a fixed gap, then the bar. The pair sits above the boss's head;
 * when there is no room above (the boss is near the top of the screen), both move below its feet together.
 * All values are screen px, y down.
 */
export const BOSS_TAG = { nameH: 16, gap: 4, barH: 8, pad: 4 } as const;

export interface BossTagLayout {
  /** Top of the name text. */
  nameTop: number;
  /** Centre of the small health bar. */
  barY: number;
  /** True when the pair moved below the boss. */
  below: boolean;
}

/** headY: top of the boss's head; feetY: its feet; minY/maxY: the screen band the pair must stay inside. */
export function bossTagLayout(headY: number, feetY: number, minY: number, maxY: number): BossTagLayout {
  const { nameH, gap, barH, pad } = BOSS_TAG;
  const stack = nameH + gap + barH;
  let top = headY - pad - stack;
  let below = false;
  if (top < minY) {
    below = true;
    top = Math.min(feetY + pad, maxY - stack);
  }
  top = Math.max(minY, Math.min(top, maxY - stack));
  return { nameTop: top, barY: top + nameH + gap + barH / 2, below };
}
