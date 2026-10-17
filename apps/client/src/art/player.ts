// The player's character from the art: the layered sprite, dressed in the real belt.

import Phaser from 'phaser';
import { MOVEMENT, type BeltInfo } from '@dojo/sim';
import { DEFAULT_LOOK, FACES, HAIRS, bigLookPack, lookPacks, type PlayerLook } from '../game/look';
import { drawBelt, makeCharacter } from '../ui/belt';
import { type CharacterArt, characterArt, characterTop, combineArt } from './art';
import { LayeredSprite } from './LayeredSprite';

function rgb(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}

/** Brightness 0-255 (0.3 R + 0.59 G + 0.11 B), the rule the art's belt styles use. */
function luminance(color: string): number {
  const c = Phaser.Display.Color.HexStringToColor(color);
  return c.red * 0.3 + c.green * 0.59 + c.blue * 0.11;
}

/**
 * Colours the belt layers from the real belt (style guide "option C"), worked out from the
 * belt's colours so any school's belt list works:
 * - the belt in its colour (a black belt becomes charcoal with a light top sheen);
 * - two-colour belts get the centre stripe (black drawn as deep black);
 * - a dark rim around every belt, or a light rim on a black belt;
 * - up to 2 rank stripes: white tape on dark belts, black tape on light ones.
 */
export function dressBelt(sprite: LayeredSprite, belt: BeltInfo, stripes: number): void {
  const black = luminance(belt.color) < 40;
  sprite.setLayerTint('belt', black ? 0x26272f : rgb(belt.color));
  sprite.setLayer('belt-sheen', black).setLayerTint('belt-sheen', 0xa2a6b6);
  sprite.setLayer('belt-center', !!belt.color2);
  if (belt.color2) sprite.setLayerTint('belt-center', luminance(belt.color2) < 40 ? 0x111116 : rgb(belt.color2));
  sprite.setLayer('belt-center-edge', false);
  sprite.setLayerTint('belt-rim', black ? 0xc9ccd6 : 0x2e2a3a);
  const tape = luminance(belt.color) < 90 ? 0xf4f1ea : 0x1a1a1a;
  for (const n of [1, 2]) {
    sprite.setLayer(`belt-tape${n}`, stripes >= n).setLayerTint(`belt-tape${n}`, tape);
    sprite.setLayer(`belt-tape${n}-edge`, stripes >= n);
  }
}

/**
 * Applies the student's look: only the chosen face and hair are drawn, and the skin, hair
 * and gi layers get the chosen swatches from the art's palettes.
 */
export function dressLook(sprite: LayeredSprite, look: PlayerLook): void {
  const pal = sprite.art.palettes ?? {};
  const swatch = (name: string, i: number, fallback: string) => rgb(pal[name]?.[i] ?? pal[name]?.[0] ?? fallback);
  for (const f of FACES) sprite.setLayer(f, f === look.face);
  for (const h of HAIRS) {
    sprite.setLayer(h, h === look.hair);
    sprite.setLayerTint(h, swatch('hair', look.hairColor, '#3a2519'));
  }
  sprite.setLayerTint('skin', swatch('skin', look.skin, '#efc3a4'));
  sprite.setLayerTint('gi', swatch('gi', look.gi, '#f2f2f2'));
}

/** The character for walking around rooms, put together from its packs, or null if one isn't loaded. */
function roomArt(scene: Phaser.Scene, look: PlayerLook): CharacterArt | null {
  const parts = lookPacks(look).map((pack) => characterArt(scene, pack, 'player'));
  return parts.every((p): p is CharacterArt => !!p) ? combineArt(parts) : null;
}

/** A soft round shadow under a character's feet (the art has no cast shadows). */
export function addShadow(scene: Phaser.Scene, widthPx: number): Phaser.GameObjects.Ellipse {
  return scene.add.ellipse(0, 0, widthPx, widthPx * 0.5, 0x000000, 0.22);
}

/**
 * The player's character, or null if the art isn't loaded. The container holds the
 * shadow and the layers; its position is the character's feet.
 */
export function makePlayerSprite(scene: Phaser.Scene, belt: BeltInfo, stripes: number, look: PlayerLook = DEFAULT_LOOK): LayeredSprite | null {
  const art = roomArt(scene, look);
  if (!art) return null;
  const sprite = new LayeredSprite(scene, art);
  sprite.container.addAt(addShadow(scene, 40), 0);
  dressLook(sprite, look);
  dressBelt(sprite, belt, stripes);
  sprite.update();
  return sprite;
}

/** Walk while moving (the jog's speed matched to how fast the character goes), else idle. */
export function playLocomotion(sprite: LayeredSprite, tilesPerSecond: number): void {
  if (tilesPerSecond > 0.2) sprite.play('walk', { speed: Phaser.Math.Clamp(tilesPerSecond / MOVEMENT.speedTilesPerSecond, 0.4, 1.6) });
  else sprite.play('idle');
}

/** A character shown standing in a menu or celebration (not walking around a room). */
export interface StandingCharacter {
  container: Phaser.GameObjects.Container;
  /** The art, or null if it isn't loaded (then a simple placeholder is drawn). */
  sprite: LayeredSprite | null;
  /** Ties a different belt (the promotion ceremony). */
  retie(belt: BeltInfo, stripes: number): void;
}

/**
 * A standing character centred on (x, y), about as big as a circle of radius r
 * (the old placeholder's size). Uses the full-detail art when it's loaded.
 */
export function makeStandingCharacter(
  scene: Phaser.Scene,
  x: number,
  y: number,
  r: number,
  belt: BeltInfo,
  stripes: number,
  look: PlayerLook = DEFAULT_LOOK,
): StandingCharacter {
  const art = characterArt(scene, bigLookPack(look), 'player') ?? roomArt(scene, look);
  if (!art) {
    const ch = makeCharacter(scene, x, y, r, belt, stripes);
    return { container: ch.container, sprite: null, retie: (b, n) => drawBelt(ch.belt, 0, r * 0.15, r * 1.9, r * 0.3, b, n) };
  }
  const sprite = new LayeredSprite(scene, art).setDirection(4);
  // Make the character about 2.6 r tall (measured from its feet to the top of its picture).
  const scale = (2.6 * r) / characterTop(scene, art, ['body']);
  sprite.container.setScale(scale).setPosition(x, y + r * 1.25);
  sprite.container.addAt(addShadow(scene, art.frameWidth * 0.45), 0);
  dressLook(sprite, look);
  dressBelt(sprite, belt, stripes);
  sprite.autoUpdate();
  sprite.update();
  return { container: sprite.container, sprite, retie: (b, n) => dressBelt(sprite, b, n) };
}
