// The player's look (body, face, hair, colours), chosen from the art's options.
//
// For now it's kept on this phone and only changeable from the hidden testing screen.
// The character creation screen (a later step) will let students choose it and save it
// with their profile. The belt is never part of the look: it always shows the real rank.

import type { PackName } from '../art/art';

export type Body = 'a' | 'b';

export interface PlayerLook {
  body: Body;
  /** e.g. "face-01" (6 faces). */
  face: string;
  /** e.g. "hair-02" (12 hair styles). */
  hair: string;
  /** Positions in the art's palettes (10 swatches each). */
  skin: number;
  hairColor: number;
  gi: number;
}

export const FACES = ['face-01', 'face-02', 'face-03', 'face-04', 'face-05', 'face-06'];
export const HAIRS = Array.from({ length: 12 }, (_, i) => `hair-${String(i + 1).padStart(2, '0')}`);
export const SWATCHES = 10;

/** The approved Batch 1 look: face 1, the short hair, warm skin, dark brown hair, white gi. */
export const DEFAULT_LOOK: PlayerLook = { body: 'a', face: 'face-01', hair: 'hair-02', skin: 1, hairColor: 1, gi: 0 };

const KEY = 'dojo-ascent-look';

export function loadLook(): PlayerLook {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const l = { ...DEFAULT_LOOK, ...(JSON.parse(raw) as Partial<PlayerLook>) };
      if ((l.body === 'a' || l.body === 'b') && FACES.includes(l.face) && HAIRS.includes(l.hair)) return l;
    }
  } catch {
    // Private browsing or a broken value: use the default look.
  }
  return { ...DEFAULT_LOOK };
}

export function saveLook(look: PlayerLook): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(look));
  } catch {
    // Not saved on this phone; the look still applies until the game closes.
  }
}

/** The packs the character needs in rooms (base body, faces, the one chosen hair style). */
export function lookPacks(look: PlayerLook): PackName[] {
  return [`player-${look.body}`, `player-${look.body}-faces`, `player-${look.body}-${look.hair}`];
}

/** The full-detail pack for big moments (the promotion ceremony, welcome screens). */
export function bigLookPack(look: PlayerLook): PackName {
  return `player-${look.body}-big`;
}

/** Every pack the player's character needs, in rooms and in big moments. */
export function playerPacks(look: PlayerLook = loadLook()): PackName[] {
  return [...lookPacks(look), bigLookPack(look)];
}
