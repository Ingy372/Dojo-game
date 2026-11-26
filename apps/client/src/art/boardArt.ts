// The Training Board's own art (icons, the menu frames, gear and slot pictures).
// Grok playtest Nov 25 (B3): opening the Board from the dojo showed about 3 seconds of black while these
// loaded. The dojo now fetches them quietly in the background, so the Board opens at once.

import Phaser from 'phaser';
import { loadArt } from './art';
import { ICON_PACK } from './icons';
import { MENU2_PACK } from './menu2Frames';
import { loadGearIcons } from './gearIcons';
import { loadSlotIcons } from './slotIcons';

/** Queues the Board's art that isn't loaded yet (nothing when it all is). */
export function loadBoardArt(scene: Phaser.Scene): void {
  loadArt(scene, [ICON_PACK, MENU2_PACK]);
  loadGearIcons(scene);
  loadSlotIcons(scene);
}

/** From a scene that is already running: fetch the Board's art in the background. */
export function prefetchBoardArt(scene: Phaser.Scene): void {
  if (scene.load.isLoading()) return;
  loadBoardArt(scene);
  if (scene.load.list.size > 0) scene.load.start();
}
