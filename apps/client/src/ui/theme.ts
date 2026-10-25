import Phaser from 'phaser';
// Shared placeholder colors and text styles (until an art pack is chosen).

import { CONTENT } from '../game/content';
import type { Grade, InsightFamily, Rarity } from '@dojo/sim';

export { S1, S2, S3, S4, TYPE, RADIUS, MIN_TAP, MOTION, tapArea, BOARD, abilitiesSwitch, cubbySize } from './tokens';

/**
 * P-MENU2-a: mood A, warm dojo wood and paper (Jay's pick). Placeholder colours drawn in code;
 * the Artist's frame art replaces them once Jay approves the samples.
 */
export const WOOD = { frame: 0x8a5a34, frameDark: 0x5e3b22, grain: 0xb07a4a, inner: 0x1f1813, paper: 0xf2e3c4, ink: '#3a2618', switchOn: 0xa8703f, switchOff: 0x3a2a1e } as const;

export const FONT = 'system-ui, sans-serif';

export const RARITY_COLOR: Record<Rarity, number> = {
  common: 0xd8d2c4,
  uncommon: 0x5cd65c,
  rare: 0x4ea3ff,
  epic: 0xb46cff,
  legendary: 0xffb02e,
};

/** The rarity name kids see, from content/loot/gear.json (C7). */
export const rarityName = (r: Rarity): string => CONTENT.loot.rarityNames[r];

export const FAMILY_COLOR: Record<InsightFamily, number> = {
  rooted: 0x6fb7ff,
  flowing: 0x5cd6b0,
  power: 0xff7a45,
  virtue: 0xffd166,
};

export const GRADE_COLOR: Record<Grade, string> = { S: '#ffd166', A: '#9ad1ff', B: '#d9a066' };

/** "#rrggbb" for a color number. */
export function css(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function crisp(): number {
  return window.devicePixelRatio || 1;
}

/**
 * K24c: the game draws at the phone's full ("retina") sharpness. The canvas has
 * DPR real pixels per screen point; every camera is zoomed by DPR, so all layout
 * code keeps working in screen points via view(). Capped at 3 to keep memory sane.
 */
export const DPR = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);

/** The screen size in points (what layout code should use). */
export function view(scene: Phaser.Scene): { width: number; height: number } {
  const g = scene.scale.gameSize;
  return { width: g.width / DPR, height: g.height / DPR };
}

/** A camera that shows the scene 1:1 in screen points at full sharpness. */
export function hiDpi(cam: Phaser.Cameras.Scene2D.Camera): void {
  cam.setOrigin(0, 0).setZoom(DPR);
}

/** "1:05" for a number of ticks. */
export function clock(ticks: number, ticksPerSecond: number): string {
  const s = Math.floor(ticks / ticksPerSecond);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
