/**
 * K31: one layout rule for the boss's name and its small health bar.
 * They are one pair: the name, a fixed gap, then the bar, both centred on ONE x.
 * The pair sits above the boss's head; when there is no room above, both move below its feet together.
 * The pair is clamped on screen as a unit (left/right/top/bottom) and keeps clear of the given boxes
 * (door labels such as HOME, COMBO and its "+N% power" line): it first slides sideways off a box,
 * and if that can't clear it, drops below the box. All values are screen px, y down.
 */
export const BOSS_TAG = { nameH: 16, gap: 4, barH: 8, pad: 4, margin: 4 } as const;

export interface TagBox { left: number; right: number; top: number; bottom: number }

export interface BossTagInput {
  /** Boss centre x, top of its head, its feet. */
  bossX: number;
  headY: number;
  feetY: number;
  /** Half the pair's width (the wider of the name and the bar). */
  halfW: number;
  /** Screen band the pair must stay inside. */
  screenW: number;
  minY: number;
  maxY: number;
  /** Boxes the pair must not touch. */
  avoid?: TagBox[];
}

export interface BossTagLayout {
  /** The one x both the name and the bar are centred on. */
  x: number;
  /** Top of the name text. */
  nameTop: number;
  /** Centre of the small health bar. */
  barY: number;
  /** True when the pair moved below the boss. */
  below: boolean;
}

const STACK = BOSS_TAG.nameH + BOSS_TAG.gap + BOSS_TAG.barH;

export function bossTagLayout(i: BossTagInput): BossTagLayout {
  const { pad, margin } = BOSS_TAG;
  const avoid = i.avoid ?? [];
  const clampX = (x: number) => Math.max(i.halfW + margin, Math.min(i.screenW - i.halfW - margin, x));
  const clampTop = (t: number) => Math.max(i.minY, Math.min(i.maxY - STACK, t));
  const hits = (x: number, top: number) =>
    avoid.filter((b) => x - i.halfW < b.right + margin && x + i.halfW > b.left - margin && top < b.bottom + margin && top + STACK > b.top - margin);

  const fit = (top0: number): { x: number; top: number } | null => {
    let top = clampTop(top0);
    let x = clampX(i.bossX);
    for (let n = 0; n < 4; n++) {
      const hit = hits(x, top);
      if (!hit.length) return { x, top };
      const b = hit[0];
      // Slide off sideways, away from the box's centre (towards the boss's side).
      const slid = clampX((b.left + b.right) / 2 <= i.bossX ? b.right + margin + i.halfW : b.left - margin - i.halfW);
      if (!hits(slid, top).length) return { x: slid, top };
      // Else drop below the box, keeping the boss's x.
      top = clampTop(b.bottom + margin + 1);
    }
    return null;
  };

  const aboveTop = i.headY - pad - STACK;
  const roomAbove = aboveTop >= i.minY;
  const order = roomAbove ? [aboveTop, i.feetY + pad] : [i.feetY + pad];
  for (const t of order) {
    const p = fit(t);
    if (p) return { x: p.x, nameTop: p.top, barY: p.top + BOSS_TAG.nameH + BOSS_TAG.gap + BOSS_TAG.barH / 2, below: p.top > i.headY };
  }
  const top = clampTop(order[order.length - 1]);
  return { x: clampX(i.bossX), nameTop: top, barY: top + BOSS_TAG.nameH + BOSS_TAG.gap + BOSS_TAG.barH / 2, below: top > i.headY };
}
