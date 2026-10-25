// P-MENU-a: shared spacing, type, corner, tap-size and motion tokens (drafts/planning/P-MENU-menu-polish.md §2).
// No Phaser import, so the rules can be tested in Vitest.

/** 8 pt grid. S1 is only for gaps inside one line. */
export const S1 = 4;
export const S2 = 8;
export const S3 = 16;
export const S4 = 24;

/** Type scale: labels, body, card titles / buttons, panel headings. Nothing goes below TYPE.label. */
export const TYPE = { label: 12, body: 14, title: 17, heading: 22 } as const;

/** Corner radius for panels / cards and for buttons. */
export const RADIUS = { panel: 10, button: 8 } as const;

/** The smallest tap target, in points, on every side. */
export const MIN_TAP = 44;

/** Motion tokens (ms + Phaser ease names). */
export const MOTION = {
  press: { ms: 70, ease: 'Cubic.Out', scale: 0.96 },
  release: { ms: 140, ease: 'Back.Out' },
  swap: { ms: 180, ease: 'Cubic.Out' },
  sheet: { ms: 220, ease: 'Cubic.Out', outMs: 160, outEase: 'Cubic.In' },
  pop: { ms: 220, ease: 'Back.Out' },
  /** Reduced motion: no scale or slide, just an instant change and a short fade. */
  reducedFade: { ms: 120 },
  /** The Dojo Blessing glow: a slow breath, no scale. */
  breath: { ms: 2400, from: 0.25, to: 0.15 },
} as const;

/** How much a pressed button brightens (a white overlay at this alpha, about +10%). */
export const PRESS_BRIGHTEN = 0.1;

/**
 * The tap area for a w x h drawing: the same centre, grown to at least MIN_TAP on each side.
 * x / y are offsets from the drawing's centre.
 */
export function tapArea(w: number, h: number): { x: number; y: number; w: number; h: number } {
  const tw = Math.max(w, MIN_TAP);
  const th = Math.max(h, MIN_TAP);
  return { x: -tw / 2, y: -th / 2, w: tw, h: th };
}
