// The player's look (body, face, hair, colours), chosen from the art's options at character
// creation and changeable in the Home Dojo. It's saved with the student's progress.
// The belt is never part of the look: it always shows the real rank.

import type { CharacterLook } from '@dojo/sim';
import type { PackName } from '../art/art';
import { loadSave, writeSave } from './save';

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

/** Where the testing screen kept a look before character creation existed (read once as a starting point). */
const OLD_TEST_KEY = 'dojo-ascent-look';

/** A look that matches the art's options, or null. */
function valid(l: Partial<CharacterLook> | null | undefined): PlayerLook | null {
  if (!l) return null;
  const look = { ...DEFAULT_LOOK, ...l } as PlayerLook;
  const swatch = (n: number) => Number.isInteger(n) && n >= 0 && n < SWATCHES;
  const ok =
    (look.body === 'a' || look.body === 'b') &&
    FACES.includes(look.face) &&
    HAIRS.includes(look.hair) &&
    swatch(look.skin) &&
    swatch(look.hairColor) &&
    swatch(look.gi);
  return ok ? look : null;
}

/** True once the student has made their character. */
export function hasLook(): boolean {
  return valid(loadSave().look) !== null;
}

/** The student's look (or the default look before they've made their character). */
export function loadLook(): PlayerLook {
  const saved = valid(loadSave().look);
  if (saved) return saved;
  try {
    const old = localStorage.getItem(OLD_TEST_KEY);
    if (old) return valid(JSON.parse(old) as Partial<CharacterLook>) ?? { ...DEFAULT_LOOK };
  } catch {
    // Nothing usable stored: the default look.
  }
  return { ...DEFAULT_LOOK };
}

export function saveLook(look: PlayerLook): void {
  const profile = loadSave();
  profile.look = { ...look };
  writeSave(profile);
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
