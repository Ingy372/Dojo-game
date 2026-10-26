// P-MENU2-i: the A-MENU2 menu art used by Trophies, Gear and Last run (Jay OK'd on #265).
// Phaser-free, so tests can check every name against incoming-art/menu2/sprites/menu2.json.
// My Style's art (slot-card, tray-tile, switch, glyph) is held and never imported.

export const MENU2_PACK = 'menu2';

const range = (stem: string, n: number) => Array.from({ length: n }, (_, i) => `${stem}-${i}`);
const RARITY4 = ['common', 'uncommon', 'rare', 'epic'] as const;
const RARITY5 = [...RARITY4, 'legendary'] as const;

/** Every frame the client draws, by screen. tools/art-import/approved.json imports exactly these. */
export const MENU2_FRAMES = {
  trophies: [
    'shelf-plank',
    'cubby-earned', 'cubby-earned-pressed', 'cubby-notyet', 'cubby-notyet-pressed', 'cubby-next-glow',
    'cubby-earned-96', 'cubby-earned-pressed-96', 'cubby-notyet-96', 'cubby-notyet-pressed-96', 'cubby-next-glow-96',
    ...range('cubby-earned-shine', 6), 'cubby-seal', 'cubby-lantern-0', 'cubby-lantern-1', ...range('unlock-sweep', 8),
    'belt-knot-shadow', 'belt-knot-band', 'belt-knot-center', 'belt-knot-sheen', 'belt-knot-rim', 'belt-cord',
  ],
  gear: [
    'doll-backing',
    ...RARITY4.flatMap((r) => [`gear-ring-${r}`, `gear-ring-${r}-glow`, `gear-ring-${r}-pressed`]),
    ...RARITY4.map((r) => `bag-tile-${r}`), 'bag-tile-selected', 'bag-tile-pressed',
  ],
  lastRun: [
    'stat-tile', 'stat-perfect', 'stat-combo', 'stat-clock', 'stat-xp',
    'xp-bar-frame', 'xp-bar-fill', 'xp-bar-gloss',
    ...RARITY4.map((r) => `found-tile-${r}`),
  ],
  /** Shared by all three screens: the panel frame, the title plaque and the wood buttons (tabs, Bests, Again, Close, page arrows). */
  /** A-LEGENDARY-wire: the golden-orange Legendary frame (Jay OK'd #304), from incoming-art/legendary-frame. The bag tile is the 9-slice with the gem crest laid on top. */
  legendary: [
    'gear-ring-legendary', 'gear-ring-legendary-glow', 'gear-ring-legendary-pressed',
    'bag-tile-legendary-9slice', 'bag-tile-legendary-crest', 'found-tile-legendary',
  ],
  shared: ['panel-frame', 'title-plaque', 'button-primary-normal', 'button-primary-pressed', 'button-primary-disabled'],
} as const;

export const MENU2_ALL: readonly string[] = Object.values(MENU2_FRAMES).flat();

/** The art's rarity name. All five rarities have their own frames (A-LEGENDARY-wire); anything unknown falls back to Common. */
export function artRarity(r: string): (typeof RARITY5)[number] {
  return (RARITY5 as readonly string[]).includes(r) ? (r as (typeof RARITY5)[number]) : 'common';
}

export interface UiSprite {
  frame: number;
  size: [number, number];
  nineSlice?: [number, number, number, number];
  shadowMargin?: number;
}

export interface UiPack {
  frames: number[][];
  entries: Record<string, { kind: string; density?: number; sprites?: Record<string, UiSprite> }>;
}

/**
 * The packed sprite for a name, or null when it can't be drawn (pack not loaded, page missing,
 * name not imported, or an empty frame). Null means: draw the code-drawn version instead.
 */
export function pickUi(pack: UiPack | null | undefined, name: string, pageLoaded: (page: number) => boolean): (UiSprite & { page: number }) | null {
  const s = pack?.entries?.menu2?.sprites?.[name];
  if (!pack || !s || s.frame < 0 || !pack.frames[s.frame]) return null;
  const page = pack.frames[s.frame][0];
  return pageLoaded(page) ? { ...s, page } : null;
}
