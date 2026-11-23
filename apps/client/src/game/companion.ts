// Visual overhaul (Nov 22): the shop's pet and aura, worn by the hero in the dojo, the town and the Tower.
// The pet trots after the hero (it never blocks, never fights, never changes a fight) and the aura glows under the
// hero's feet at the shop effects' depth, so it stays under every danger mark.
import Phaser from 'phaser';
import { wornExtras, type AuraRecipe } from '@dojo/sim';
import { characterArt } from '../art/art';
import { LayeredSprite } from '../art/LayeredSprite';
import { addShadow } from '../art/player';
import { AuraFx, type AuraPlace } from '../fx/aura';
import { loadSave } from './save';
import { SHOP } from './shop';

/** What the hero wears now (read fresh, so a purchase shows in the next scene). */
export function wornCompanions(): { aura: AuraRecipe | null; pet: string | null } {
  return wornExtras(loadSave(), SHOP);
}

/** The art pack a pet needs (each pet is its own small pack). */
export const petPack = (pet: string) => pet;

/** Packs to load for what the hero wears. */
export function companionPacks(): string[] {
  const { pet } = wornCompanions();
  return pet ? [petPack(pet)] : [];
}

/** A pet sprite standing on its own (the shop preview), or null if its art isn't loaded. */
export function makePetSprite(scene: Phaser.Scene, pet: string): LayeredSprite | null {
  const art = characterArt(scene, petPack(pet), 'pet');
  if (!art) return null;
  const s = new LayeredSprite(scene, art);
  s.container.addAt(addShadow(scene, art.frameWidth * 0.5), 0);
  s.autoUpdate();
  return s;
}

export class Companions {
  readonly pet: LayeredSprite | null;
  readonly aura: AuraFx | null;
  private px: number;
  private py: number;

  /**
   * @param tile pixels per tile in this scene
   * @param scale the hero sprite's scale (pets are drawn at the same scale)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly tile: number,
    scale: number,
    place: AuraPlace,
    addToWorld?: (o: Phaser.GameObjects.GameObject) => void,
  ) {
    const worn = wornCompanions();
    this.px = x + tile * 0.6;
    this.py = y + tile * 0.2;
    this.aura = worn.aura ? new AuraFx(scene, worn.aura, place) : null;
    this.pet = worn.pet ? makePetSprite(scene, worn.pet) : null;
    if (this.pet) {
      this.pet.container.setScale(scale).setPosition(this.px, this.py);
      addToWorld?.(this.pet.container);
    }
  }

  /** Call every frame with the hero's feet (pixels); depthOf gives the depth a thing standing at y should have. */
  update(x: number, y: number, dtMs: number, depthOf?: (y: number) => number): void {
    this.aura?.draw(x, y);
    const pet = this.pet;
    if (!pet) return;
    // Stay about 0.7 tiles from the hero, a little behind; ease toward that spot.
    const dx = x - this.px;
    const dy = y - this.py;
    const d = Math.hypot(dx, dy);
    const want = this.tile * 0.7;
    let moving = false;
    if (d > want) {
      const k = Math.min(1, (dtMs / 1000) * 5.5 * ((d - want) / this.tile + 0.4));
      this.px += dx * k * ((d - want) / d);
      this.py += dy * k * ((d - want) / d);
      moving = d - want > this.tile * 0.08;
      pet.face(dx, dy);
    }
    if (d > this.tile * 6) {
      // left far behind (a door, a jump): pop next to the hero
      this.px = x + this.tile * 0.6;
      this.py = y + this.tile * 0.2;
    }
    pet.play(moving ? 'walk' : 'idle');
    pet.container.setPosition(this.px, this.py);
    if (depthOf) pet.container.setDepth(depthOf(this.py));
  }

  destroy(): void {
    this.aura?.destroy();
    this.pet?.container.destroy();
  }
}
