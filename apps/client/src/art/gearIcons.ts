// K32: one gear icon per slot and rarity (PR #212 art, assets/art/gear-drop/).
// The badge frame's colour, shape and pip count show the rarity; the glyph inside shows the slot.

import Phaser from 'phaser';
import { GEAR_SLOTS, RARITIES, type GearSlot, type Rarity } from '@dojo/sim';

const key = (slot: GearSlot, rarity: Rarity) => `gear:${slot}:${rarity}`;

/** Call from a scene's preload(): queues the 15 gear icons that aren't loaded yet. */
export function loadGearIcons(scene: Phaser.Scene): void {
  for (const slot of GEAR_SLOTS)
    for (const rarity of RARITIES) if (!scene.textures.exists(key(slot, rarity))) scene.load.image(key(slot, rarity), `art/gear-drop/drop-${slot}-${rarity}.png`);
}

/** Draws a gear item's slot + rarity icon centred on (x, y), `size` pixels wide. */
export function addGearIcon(scene: Phaser.Scene, item: { slot: GearSlot; rarity: Rarity }, x: number, y: number, size: number): Phaser.GameObjects.Image | null {
  const k = key(item.slot, item.rarity);
  if (!scene.textures.exists(k)) return null;
  const img = scene.add.image(x, y, k);
  return img.setScale(size / img.width);
}
