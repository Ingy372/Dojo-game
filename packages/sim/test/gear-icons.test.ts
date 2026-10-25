// K32: every gear slot x rarity has its icon in the packed art, so no gear item shows without one.
import { describe, expect, it } from 'vitest';
import { GEAR_SLOTS, RARITIES } from '../src';

// Vite's glob lists the files at test time (the sim package has no Node types).
const files = Object.keys(import.meta.glob('../../../assets/art/gear-drop/*.png')).map((f) => f.split('/').pop());

describe('gear icons', () => {
  it('has a drop-<slot>-<rarity>.png for every slot and rarity', () => {
    for (const slot of GEAR_SLOTS) for (const rarity of RARITIES) expect(files, `${slot}:${rarity}`).toContain(`drop-${slot}-${rarity}.png`);
  });
});
