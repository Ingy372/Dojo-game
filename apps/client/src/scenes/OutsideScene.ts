import type { Room, Vec2 } from '@dojo/sim';
import { OUTSIDE, OUTSIDE_PACK } from '../game/actionZone';
import { addStatic, staticArt, staticSprites } from '../art/art';
import { addExitCue } from '../ui/exitCue';
import { TILE, WalkScene, type Facing } from './WalkScene';

/** The scenery that stands behind the building (its sort row is north of the building's row 6). */
const BEHIND_BUILDING_ROW = 6;

/**
 * The Action Zone dojo, outside (A4-DOJO-ii): the entrance in daylight. Drawn bottom to top as the
 * artist ordered it: ground, the trees behind the building, the building with its blank phone and
 * address bars, then everything that stands (benches, chairs, beds, shrub, palm, tree and the hero)
 * sorted by the row it stands on. Walk up the path to the doorstep, or tap the double doors, to go
 * inside. Walking off either end of the walk along the bottom goes back to the town.
 */
export class OutsideScene extends WalkScene {
  constructor() {
    super('ActionZoneOutside');
  }

  protected room(): Room {
    return OUTSIDE.room;
  }

  protected roomPacks(): string[] {
    return [OUTSIDE_PACK];
  }

  /** Back from inside you stand at the doors; arriving from the town you stand on the walk below the beds. */
  protected spawn(data: unknown): { pos: Vec2; facing: Facing } {
    const fromInside = (data as { from?: string } | undefined)?.from === 'inside';
    return fromInside ? OUTSIDE.spawnFromInside : OUTSIDE.spawnFromTown;
  }

  protected drawRoom(): void {
    const [ground, building, phone, address] = addStatic(this, OUTSIDE_PACK, 'outside-entrance-day', 0, 0);
    const frame = staticArt(this, OUTSIDE_PACK, 'outside-entrance-day');
    if (frame) {
      const [ax, ay] = frame.anchor;
      this.bounds = [-ax / TILE, (frame.frameWidth - ax) / TILE, -ay / TILE, (frame.frameHeight - ay) / TILE];
    }

    const behind: Phaser.GameObjects.Image[] = [];
    for (const [id, s] of Object.entries(staticSprites(this, OUTSIDE_PACK))) {
      if (!s.anchorTile || s.sortRow === undefined) continue;
      const images = addStatic(this, OUTSIDE_PACK, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      if (s.sortRow < BEHIND_BUILDING_ROW) {
        behind.push(...images);
      } else {
        for (const img of images) img.setDepth(s.sortRow * TILE);
        this.standLayer.add(images);
      }
    }
    // The way off the walk, at both ends: a glow with an arrow, under the hero.
    const cues = OUTSIDE.exits.map((e) => {
      const left = e.rect[0] < 1;
      return addExitCue(this, (left ? 0.75 : 13.25) * TILE, 8.5 * TILE, 1.2 * TILE, 0.8 * TILE, left ? 'left' : 'right');
    });
    this.worldLayer.add([ground, ...behind, building, phone, address, ...cues, this.standLayer].filter(Boolean));
  }

  /** A tap on the double doors walks to the doorstep. */
  protected tapTile(tile: Vec2): Vec2 {
    const [x0, x1, y0, y1] = OUTSIDE.frontDoor.tapRect;
    return tile.x >= x0 && tile.x <= x1 && tile.y >= y0 && tile.y <= y1 ? OUTSIDE.frontDoor.approachTile : tile;
  }

  /** The doorstep goes inside; either end of the bottom walk goes back to the town. */
  protected afterTick(p: Vec2): void {
    if (this.entered('front-door', OUTSIDE.frontDoor.enterRect, p)) {
      this.leave('ActionZoneInside');
      return;
    }
    for (const e of OUTSIDE.exits) {
      if (this.entered(e.id, e.rect, p)) {
        this.leave('ActionZoneTown', { from: 'outside' }, false);
        return;
      }
    }
  }
}

