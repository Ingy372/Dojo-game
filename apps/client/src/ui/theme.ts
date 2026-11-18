import Phaser from 'phaser';
// Shared placeholder colors and text styles (until an art pack is chosen).

import { CONTENT } from '../game/content';
import type { Grade, InsightFamily, Rarity } from '@dojo/sim';
import { BOARD_PAPER } from './tokens';

export { S1, S2, S3, S4, TYPE, RADIUS, MIN_TAP, MOTION, tapArea, BOARD, cubbySize } from './tokens';

/**
 * P-MENU2-a: mood A, warm dojo wood and paper (Jay's pick). Placeholder colours drawn in code;
 * the Artist's frame art replaces them once Jay approves the samples.
 */
export const WOOD = { frame: 0x8a5a34, frameDark: 0x5e3b22, grain: 0xb07a4a, inner: 0x1f1813, paper: BOARD_PAPER, ink: '#3a2618', switchOn: 0xa8703f, switchOff: 0x3a2a1e } as const;

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
  guard: 0x6fb7ff,
  speed: 0x5cd6b0,
  power: 0xff7a45,
  virtue: 0xffd166,
};

export const GRADE_COLOR: Record<Grade, string> = { S: '#ffd166', A: '#9ad1ff', B: '#d9a066' };

/** "#rrggbb" for a color number. */
export function css(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function crisp(): number {
  return DPR;
}

/**
 * K24c: the game draws at the phone's full ("retina") sharpness. The canvas has
 * DPR real pixels per screen point; every camera is zoomed by DPR, so all layout
 * code keeps working in screen points via view(). Capped at 3 to keep memory sane.
 */
export const DEVICE_DPR = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);

/**
 * Nov 17 (desktop and tablets): the layout is designed for a phone held sideways (about 390-430 points
 * tall). On a bigger screen the game keeps that layout and draws it larger, so a computer window or a
 * tablet shows big buttons and text instead of tiny ones. 1 on every phone.
 */
export function uiScaleFor(cssWidth: number, cssHeight: number): number {
  if (!(cssWidth > 0 && cssHeight > 0)) return 1;
  return Math.max(1, Math.min(cssWidth / 900, cssHeight / 480));
}

/** How much larger than phone size the layout is drawn (see uiScaleFor). */
export let UI_SCALE = uiScaleFor(window.innerWidth, window.innerHeight);

/**
 * Canvas pixels per layout point: the device's pixel ratio times UI_SCALE. Updated by setScreenSize
 * when the window changes size (a live binding, so importers always read the current value).
 */
export let DPR = DEVICE_DPR * UI_SCALE;

/** Call when the game area changes size (CSS pixels). Returns true when the scale changed. */
export function setScreenSize(cssWidth: number, cssHeight: number): boolean {
  const next = uiScaleFor(cssWidth, cssHeight);
  if (next === UI_SCALE) return false;
  UI_SCALE = next;
  DPR = DEVICE_DPR * UI_SCALE;
  return true;
}

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
