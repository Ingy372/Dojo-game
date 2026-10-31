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
  /** P-MENU2-c: the Trophy Case unlock sweep (paper to wood), before the pop. */
  unlockSweep: { ms: 360, ease: 'Cubic.InOut' },
  /** Reduced motion: no scale or slide, just an instant change and a short fade. */
  reducedFade: { ms: 120 },
  /** The Dojo Blessing glow: a slow breath, no scale. */
  breath: { ms: 2400, from: 0.25, to: 0.15 },
} as const;

/**
 * B-POLISH-2: Trophy Case polish. The unlock pop peaks at popPeak and settles to 1 (never
 * below 1); the detail sheet's description may run effectLines lines; cubby labels keep
 * cubbyPadX clear on each side (a hyphenated word breaks after its hyphen), up to cubbyLines lines.
 */
export const TROPHY_UI = { popPeak: 1.06, effectLines: 3, cubbyPadX: 8, cubbyLines: 3, cubbyLineGap: -3, cubbyTop: 0, cubbyGap: -1, cubbyBottom: 1, stroke: 2 } as const;

/** The unlock pop's scale keyframes: 1 → peak → 1. */
export const unlockPopScales = (): readonly number[] => [1, TROPHY_UI.popPeak, 1];

/** Width a cubby label may use: even side padding inside the 2 px stroke. */
export const cubbyTextW = (size: number): number => size - 2 * TROPHY_UI.cubbyPadX - TROPHY_UI.stroke;

/** A cubby's icon: always full size (42% of the cubby), the same for every trophy. */
export const cubbyIconSize = (size: number): number => Math.round(size * 0.42);

/** Label room below the icon: size less the 2 px stroke (1 px a side), top, icon, gap and bottom space. */
export const cubbyLabelRoom = (size: number): number => size - TROPHY_UI.stroke - TROPHY_UI.cubbyTop - cubbyIconSize(size) - TROPHY_UI.cubbyGap - TROPHY_UI.cubbyBottom;

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

/** P-MENU-b: how a new panel comes in. A tab slides 12 pt; a page turn 24 pt in the turn's direction. */
export type PanelChange = 'none' | 'tab' | 'pageNext' | 'pagePrev';

/**
 * P-MENU-b: the panel's entrance. `none` (first draw, resize, gear pick, Wear, Let go) is instant.
 * Reduced motion: no slide, just a 120 ms fade.
 */
export function panelSwap(change: PanelChange, reduced: boolean): { dx: number; fromAlpha: number; ms: number; ease: string } | null {
  if (change === 'none') return null;
  if (reduced) return { dx: 0, fromAlpha: 0, ms: MOTION.reducedFade.ms, ease: 'Linear' };
  const dx = change === 'tab' ? 12 : change === 'pageNext' ? 24 : -24;
  return { dx, fromAlpha: 0, ms: MOTION.swap.ms, ease: MOTION.swap.ease };
}

/** P-MENU-c: the XP bar fills from the old value to the new one over 400 ms after a run. */
export const XP_FILL = { ms: 400, ease: 'Cubic.Out' } as const;

/**
 * P-MENU-c: where the XP bar starts filling from. `prev` is what the bar last showed. Same
 * level, more XP: from the old share. A new level: from empty. Nothing new (or nothing
 * remembered): null, so the bar is drawn full-size at once.
 */
export function xpFillFrom(prev: { level: number; share: number } | null, now: { level: number; share: number }): number | null {
  if (!prev) return null;
  if (now.level > prev.level) return 0;
  if (now.level === prev.level && now.share > prev.share) return prev.share;
  return null;
}

/** P-MENU-d: Gear tab sizes. */
export const GEAR = { cardH: 56, gap: S2, pagerH: 56, arrowW: 44, dot: 8, dotGap: 6, sheetH: 120, wornIcon: 40, wornH: 86 } as const;

/**
 * P-MENU-d: the bag grid. It depends only on the space left under the worn slots, never on
 * whether a card is picked (the detail sheet lays over the panel instead), so picking a card
 * never moves the grid or changes how many cards a page holds.
 */
export function gearGrid(space: number, cols = 2): { rows: number; perPage: number } {
  const rows = Math.max(1, Math.floor((space - GEAR.pagerH + GEAR.gap) / (GEAR.cardH + GEAR.gap)));
  return { rows, perPage: rows * cols };
}

/** P-MENU-d: page dots fit between the arrows (one 8 pt dot per page); null means show "n / m" text. */
export function pageDots(pages: number, room: number): { x0: number; step: number } | null {
  if (pages < 2) return null;
  const step = GEAR.dot + GEAR.dotGap;
  const total = pages * GEAR.dot + (pages - 1) * GEAR.dotGap;
  if (total > room) return null;
  return { x0: (room - total) / 2 + GEAR.dot / 2, step };
}

/** P-MENU-f: Gate tab sizes (drafts/planning/P-MENU-menu-polish.md §3c). */
export const GATE = { lockR: 22, lockMinR: 18, label: TYPE.label, labelLines: 3, cardH: 96, cardGap: S2, sealR: 28, ring: { w: 4, alpha: 0.35 } } as const;

/** P-MENU-f: lock radius for a slot of this width: 22, smaller on tiny phones, never under 18. */
export function gateLockR(slot: number): number {
  return Math.max(GATE.lockMinR, Math.min(GATE.lockR, slot * 0.36));
}

/**
 * B-LASTRUN: the Last run panel stacks each block below the measured bottom of the one before.
 * Returns how many item rows fit between itemsTop and the Personal bests block (which sits on
 * the panel's bottom edge), keeping a row free for "+N more" when not every item fits.
 */
export function lastRunItemsFit(itemsTop: number, bestsTop: number, lineH: number, count: number): number {
  const room = bestsTop - S2 - itemsTop;
  if (room < 0) return 0;
  const all = Math.floor(room / lineH);
  if (all >= count) return count;
  return Math.max(0, Math.floor((room - lineH) / lineH));
}

/**
 * B-POLISH-1: the line under the Last run item rows. When no item name fits (667x375),
 * "+N more" would point at nothing, so it reads "N items in your Gear" instead.
 */
export function lastRunMoreLabel(total: number, shown: number): string | null {
  if (total <= shown) return null;
  if (shown === 0) return `${total} ${total === 1 ? 'item' : 'items'} in your Gear`;
  return `+${total - shown} more in your Gear`;
}

/** B-POLISH-1: the empty-bag hint hides while a worn-item sheet is open over it. */
export function showEmptyBagHint(bagCount: number, sheetOpen: boolean): boolean {
  return bagCount === 0 && !sheetOpen;
}

/** B-LASTRUN: tops for blocks of the given heights, each S1 below the previous bottom. */
export function stackTops(top: number, heights: readonly number[], gap: number = S1): number[] {
  const tops: number[] = [];
  let y = top;
  for (const h of heights) {
    tops.push(y);
    y += h + gap;
  }
  return tops;
}

/**
 * P-MENU2-a: Training Board redesign sizes (drafts/planning/P-MENU2-training-board-redesign.md
 * sections 1b and 2). Added only; no older token changes. The Abilities switch is 2 x 120x44,
 * a Trophy Case cubby is 96 (small phone) or 112 (large), Fighting Style slot cards 140x120,
 * tray tiles 72, the belt ribbon 40 tall.
 */
export const BOARD = {
  frame: 6,
  switchW: 120,
  switchH: MIN_TAP,
  switchGap: S2,
  cubby: { small: 96, large: 112, gap: S2, icon: 64 },
  slot: { w: 140, h: 120 },
  tile: 72,
  ribbonH: 40,
  /** 2-row Trophy Case pages: a slimmer ribbon, smaller cubbies (never under cubbyMin), arrows at the sides. */
  ribbonCompact: 28,
  cubbyMin: 72,
  dotsH: 14,
} as const;

/** P-MENU2-a: the two Abilities parts. */
export type AbilitiesPart = 'trophy' | 'style';

/** P-MENU2-a: the segmented switch, centred in a panel w wide: two equal 44-tall segments, never wider than 120. */
export function abilitiesSwitch(w: number): { x0: number; segW: number; h: number; gap: number } {
  const segW = Math.min(BOARD.switchW, Math.floor((w - BOARD.switchGap) / 2));
  const total = segW * 2 + BOARD.switchGap;
  return { x0: Math.round((w - total) / 2), segW, h: BOARD.switchH, gap: BOARD.switchGap };
}

/** P-MENU2-a: cubby size for a shelf this wide: 112 when 4 large cubbies fit, else 96. */
export function cubbySize(shelfW: number): number {
  const { large, gap } = BOARD.cubby;
  return shelfW >= large * 4 + gap * 3 ? large : BOARD.cubby.small;
}

/** P-MENU2-b: kata step colours. onPaper is for the cream detail sheet (at least 4.5:1 on BOARD_PAPER). */
export const BOARD_PAPER = 0xf2e3c4;
export const KATA_INK = {
  onDark: { num: '#ffffff', arrow: 0x9fd3ff },
  onPaper: { num: '#3a2618', arrow: 0x1d4690 },
} as const;
export type KataInk = (typeof KATA_INK)[keyof typeof KATA_INK];

/** Q-PREM-COLOR: the shared green for buttons and fills. At least 4.5:1 behind white (#ffffff) and cream (#fff6e0) text. */
export const GREEN = 0x277a56;

/** WCAG contrast ratio between two 0xRRGGBB colours. */
export function contrast(a: number, b: number): number {
  const lum = (c: number) => {
    const ch = [16, 8, 0].map((s) => ((c >> s) & 255) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Q-PREM-F9: fight action button faces and labels, each ready colour at least 4.5:1 with its label.
 * Same colour families Jay picked, just darker (COUNTER 3a7bd5 -> 2f74d3, STRIKE d5713a -> b75a27).
 * VIRTUE's gold and COUNTER's flash stay bright and take a dark label instead. Not ready: a solid
 * dim face with a soft light label (the button is no longer see-through, so the floor can't wash it out).
 */
export const ACTION_COLORS = {
  counter: { ready: 0x2f74d3, flash: 0x6fa8ff, dim: 0x2e3c55 },
  strike: { ready: 0xb75a27, dim: 0x5a4a44 },
  virtue: { ready: 0xffb02e, dim: 0x5a4a34 },
  dash: { ready: 0x277a56 /* = GREEN */, dim: 0x2f4a3e },
  stance: { ready: 0x3a5a8a, dim: 0x34405a },
} as const;
export const ACTION_LABEL = { light: '#ffffff', dark: '#14121c', dim: '#d8d2c8' } as const;
