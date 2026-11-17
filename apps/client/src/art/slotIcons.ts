// PB-05: the approved slot pictures from incoming-art/icons-slots/sprites/ (PB-07, #419 and #454).
// Escape, Throw and Advancing have no picture yet, so the screen draws a plain disc for those.

import Phaser from 'phaser';
import type { AbilityInfo, SealFamilyDef } from '@dojo/sim';
import { addIcon } from './icons';

const FILES = ['counter', 'guard', 'disarm', 'strike', 'jumping-spins', 'kata', 'lock', 'empty-slot'] as const;

const key = (id: string) => `slot:${id}`;

/** Which saved picture a slot id uses. Spin Kick and Butterfly Kick share the Strike picture. */
export function slotIconId(id: string): string | null {
  if (id === 'spin-kick' || id === 'butterfly-flow') return 'strike';
  if (id === 'lock-arm' || id === 'lock-wrist') return 'lock';
  return (FILES as readonly string[]).includes(id) ? id : null;
}

/** Call from a scene's preload(): queues the slot pictures that aren't loaded yet. */
export function loadSlotIcons(scene: Phaser.Scene): void {
  for (const id of FILES) if (!scene.textures.exists(key(id))) scene.load.image(key(id), `art/slot-icons/${id}.png`);
}

/** Draws a slot picture centred on (x, y), `size` pixels wide. Null when that id has no picture. */
export function addSlotIcon(scene: Phaser.Scene, id: string, x: number, y: number, size: number): Phaser.GameObjects.Image | null {
  const file = slotIconId(id);
  if (!file || !scene.textures.exists(key(file))) return null;
  const img = scene.add.image(x, y, key(file));
  return img.setScale(size / img.width);
}

/** L8-B3: a Seal family's medallion: its slot picture, or (no picture yet, e.g. Escape) its first technique's Book icon. */
export function addSealMedallion(scene: Phaser.Scene, family: SealFamilyDef, abilities: readonly AbilityInfo[], x: number, y: number, size: number): Phaser.GameObjects.Image | null {
  const own = addSlotIcon(scene, family.id, x, y, size);
  if (own) return own;
  const first = abilities.filter((a) => a.kind === 'seal')[family.ranks[0].technique - 1]?.perk?.id;
  return first ? addIcon(scene, first, x, y, size) : null;
}
