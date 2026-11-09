// G2B-04: how a thrown enemy is drawn with its existing sprite (no new art). It tumbles over the 1-tile slide,
// lies on its side for the rest of the 30 thrown ticks, then gets back up. Reduced motion: no tumble or slide,
// it snaps to lying down and snaps back up. No Phaser here, so Vitest can check it.

export const THROWN_LOOK = {
  /** The tumble and slide take this long (ms). */
  tumbleMs: 350,
  /** Full turns in the tumble before it lands lying down. */
  spins: 1,
  /** Lying down: turned this far (radians, a quarter turn = on its side). */
  lieAngle: Math.PI / 2,
  /** Getting back up takes this long (ms). */
  getUpMs: 220,
} as const;

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** While thrown, `ms` after the throw: how far along the slide (0 to 1) and the sprite's turn (radians). */
export function thrownPose(ms: number, reduced: boolean): { slide: number; angle: number } {
  if (reduced) return { slide: 1, angle: THROWN_LOOK.lieAngle };
  const t = easeOut(clamp01(ms / THROWN_LOOK.tumbleMs));
  return { slide: t, angle: (THROWN_LOOK.lieAngle + THROWN_LOOK.spins * 2 * Math.PI) * t };
}

/** After getting up, `ms` since the thrown state ended: the sprite's turn (lying -> upright). */
export function getUpAngle(ms: number, reduced: boolean): number {
  if (reduced) return 0;
  return THROWN_LOOK.lieAngle * (1 - easeOut(clamp01(ms / THROWN_LOOK.getUpMs)));
}

/** The turn (radians, mod a full turn) a pose shows: lying is a quarter turn. */
export const shownAngle = (a: number): number => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
