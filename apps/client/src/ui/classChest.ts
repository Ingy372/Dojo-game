// LP-B3 (L4): the Class Chest card's drawn chest, and the soft gold glow around the hero, drawn in code.
// The glow has one ring for each step of the best weekly class streak ever (content/settings/class-chest.json), so it only ever grows.

import Phaser from 'phaser';
import { auraRings } from '@dojo/sim';
import WORDS from '../../../../content/settings/class-chest.json';
import { reducedMotion } from '../game/motion';

export const CHEST_WORDS = WORDS;

/** The aura for a best streak, or null before the first step. `r` is the hero's radius. */
export function streakAura(scene: Phaser.Scene, r: number, bestWeeks: number): Phaser.GameObjects.Graphics | null {
  const rings = auraRings(bestWeeks, WORDS.auraSteps);
  if (rings === 0) return null;
  const g = scene.add.graphics({ x: 0, y: -r * 0.4 });
  g.fillStyle(0xffd166, 0.08 + 0.03 * rings).fillEllipse(0, r * 0.4, r * (2.2 + 0.25 * rings), r * (1.1 + 0.12 * rings));
  for (let i = 0; i < rings; i++) {
    g.lineStyle(2, 0xffd166, 0.55 - i * 0.08).strokeEllipse(0, r * 0.4, r * (1.9 + 0.3 * i), r * (0.95 + 0.15 * i));
  }
  if (!reducedMotion()) scene.tweens.add({ targets: g, alpha: 0.6, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return g;
}

/** A small treasure chest drawn in code (no art file): lid, box, band and lock. */
export function chestIcon(scene: Phaser.Scene, x: number, y: number, color: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x8a5a35).fillRoundedRect(-10, -8, 20, 7, { tl: 4, tr: 4, bl: 0, br: 0 });
  g.fillStyle(0x6b4428).fillRect(-10, -1, 20, 10);
  g.lineStyle(2, color).strokeRoundedRect(-10, -8, 20, 17, 3).lineBetween(-10, -1, 10, -1);
  g.fillStyle(color).fillRect(-2, -3, 4, 5);
  return g;
}
