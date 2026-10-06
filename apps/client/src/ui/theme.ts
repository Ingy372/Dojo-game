// Shared placeholder colors and text styles (until an art pack is chosen).

import type { Grade, InsightFamily, Rarity } from '@dojo/sim';

export const FONT = 'system-ui, sans-serif';

export const RARITY_COLOR: Record<Rarity, number> = {
  common: 0xd8d2c4,
  uncommon: 0x5cd65c,
  rare: 0x4ea3ff,
  epic: 0xb46cff,
  legendary: 0xffb02e,
};

export const RARITY_NAME: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

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

/** "1:05" for a number of ticks. */
export function clock(ticks: number, ticksPerSecond: number): string {
  const s = Math.floor(ticks / ticksPerSecond);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
