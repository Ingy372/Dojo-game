import Phaser from 'phaser';
import { loadRoom, type Room, type Vec2 } from '@dojo/sim';
import { TOWN, TOWN_PACK } from '../game/actionZone';
import { addStatic } from '../art/art';
import { addExitCue } from '../ui/exitCue';
import { FONT, crisp } from '../ui/theme';
import { TILE, WalkScene, inRect, type Facing, type TileRect } from './WalkScene';
import townWalk from '../../../../content/dojo/action-zone/town-walk.json';

interface TownDoor {
  label: string;
  enterRect: TileRect;
  spawn: [number, number];
  cue: [number, number];
}

const WALK = townWalk as unknown as { pictureTile: number; homeDoor: TownDoor; dojoDoor: TownDoor };
const ROOM: Room = loadRoom(townWalk);

/** Where the hero came from: out of their own dojo (home), or out of the Action Zone (outside). */
export interface TownSceneData {
  from?: 'home' | 'outside';
}

/**
 * The town square you walk in (Nov 17, Jay: "walk south out of the bottom of their personal dojo and
 * pop out in town"). The town is the confirmed town picture with a walk grid laid over it
 * (content/dojo/action-zone/town-walk.json). The grey house is the student's own dojo: walking out
 * of the Home Dojo's south door brings you out of its front door, and walking back in takes you home.
 * The Action Zone building's door goes to the real dojo's entrance.
 */
export class TownScene extends WalkScene {
  constructor() {
    super('ActionZoneTown');
  }

  protected room(): Room {
    return ROOM;
  }

  protected roomPacks(): string[] {
    return [TOWN_PACK];
  }

  protected viewRows(): number {
    // The town is wider and busier than a room: show more of it (it is 10.75 tiles tall).
    return 9;
  }

  protected spawn(data: unknown): { pos: Vec2; facing: Facing } {
    const from = (data as TownSceneData | undefined)?.from;
    const door = from === 'outside' ? WALK.dojoDoor : WALK.homeDoor;
    return { pos: { x: door.spawn[0], y: door.spawn[1] }, facing: 'south' };
  }

  protected drawRoom(): void {
    const [pw, ph] = TOWN.pictureSize;
    const scale = TILE / WALK.pictureTile;
    this.bounds = [0, pw / WALK.pictureTile, 0, ph / WALK.pictureTile];
    const [picture] = addStatic(this, TOWN_PACK, 'town-day', 0, 0);
    if (picture) picture.setOrigin(0, 0).setPosition(0, 0).setDisplaySize(pw * scale, ph * scale);

    const marks: Phaser.GameObjects.GameObject[] = [];
    for (const door of [WALK.homeDoor, WALK.dojoDoor]) {
      const [cx, cy] = door.cue;
      marks.push(addExitCue(this, cx * TILE, cy * TILE, TILE * 1.3, TILE * 0.8, 'up'));
      marks.push(
        this.add
          .text(cx * TILE, (cy - 1.15) * TILE, door.label, {
            fontFamily: FONT,
            fontStyle: 'bold',
            fontSize: '15px',
            color: '#fff6e0',
            stroke: '#14121c',
            strokeThickness: 4,
            backgroundColor: 'rgba(20,18,28,0.6)',
            padding: { x: 7, y: 2 },
          })
          .setOrigin(0.5, 1)
          .setResolution(crisp() * 2),
      );
    }
    this.worldLayer.add([picture, ...marks, this.standLayer].filter(Boolean) as Phaser.GameObjects.GameObject[]);
  }

  /** A tap on a door walks to the spot in front of it (inside its doorway). */
  protected tapTile(tile: Vec2): Vec2 {
    for (const door of [WALK.homeDoor, WALK.dojoDoor]) {
      const [x0, x1, , y1] = door.enterRect;
      if (tile.x >= x0 - 0.3 && tile.x <= x1 + 0.3 && tile.y >= 3.5 && tile.y <= y1) return { x: (x0 + x1) / 2, y: y1 - 0.3 };
    }
    return tile;
  }

  protected afterTick(p: Vec2): void {
    if (this.entered('home-door', WALK.homeDoor.enterRect, p)) {
      this.leave('Dojo', { from: 'town' });
      return;
    }
    if (this.entered('dojo-door', WALK.dojoDoor.enterRect, p)) this.leave('ActionZoneOutside', { from: 'town' });
  }
}

/** For tests: true when `p` (tiles) is inside the home door. */
export const inHomeDoor = (p: Vec2): boolean => inRect(p, WALK.homeDoor.enterRect);
