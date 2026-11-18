import Phaser from 'phaser';
import { loadRoom, type MoveInput, type Room, type Vec2 } from '@dojo/sim';
import { TOWN, TOWN_PACK } from '../game/actionZone';
import { addStatic } from '../art/art';
import { addExitCue } from '../ui/exitCue';
import { FONT, crisp } from '../ui/theme';
import { TOUR, senseiBubble, tourGlow, tourLine } from '../ui/homeTour';
import { loadSave, writeSave } from '../game/save';
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

  /** Home Tour "go home" stop: a push toward the home door goes in, even from where the hero came out. */
  private tourHomeWait = false;

  protected onInput(input: MoveInput, pos: Vec2): void {
    if (!this.tourHomeWait || !inRect(pos, [WALK.homeDoor.enterRect[0] - 0.6, WALK.homeDoor.enterRect[1] + 0.6, WALK.homeDoor.enterRect[2], WALK.homeDoor.enterRect[3] + 1.2])) return;
    if ((input.kind === 'stick' && input.y < -0.3) || (input.kind === 'moveTo' && input.y < pos.y - 0.2)) this.arm('home-door');
  }

  create(data?: unknown): void {
    this.tourHomeWait = false;
    super.create(data);
    this.tourStop((data as TownSceneData | undefined)?.from);
  }

  /**
   * Home Tour, town stop (Jay, Nov 18): "This is our town", the real dojo's door glows, then the way home.
   * Back out of the real dojo mid-tour, Sensei only points home.
   */
  private tourStop(from: TownSceneData['from']): void {
    if (loadSave().homeTour !== 'town') return;
    const glowAt = (door: TownDoor) => {
      const g = tourGlow(this, door.cue[0] * TILE, (door.cue[1] + 0.2) * TILE, TILE * 0.7);
      this.worldLayer.add(g);
      return g;
    };
    const goHome = () => {
      this.paused = false;
      this.tourHomeWait = true;
      this.lookAt = null;
      glowAt(WALK.homeDoor);
      senseiBubble(this, TOUR.goHome, undefined, TOUR.next, 'bottom');
    };
    if (from === 'outside') return goHome();
    this.paused = true;
    // The whole street first (the camera drifts to the middle of the town), then the real dojo's door.
    const [x0, x1, y0, y1] = this.bounds;
    this.lookAt = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    this.time.delayedCall(this.fade(450), () =>
      senseiBubble(this, TOUR.town, () => {
        const glow = glowAt(WALK.dojoDoor);
        this.lookAt = { x: WALK.dojoDoor.cue[0], y: WALK.dojoDoor.cue[1] };
        senseiBubble(this, tourLine(TOUR.realDojo, { dojo: WALK.dojoDoor.label }), () => {
          glow.destroy();
          goHome();
        }, TOUR.next, 'bottom');
      }, TOUR.next, 'bottom'),
    );
  }

  protected roomPacks(): string[] {
    return [TOWN_PACK];
  }

  protected viewRows(): number {
    // Jay, Nov 18: zoomed in closer so details read and the street scrolls sideways (it is 10.75 tiles tall).
    return 7;
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
      // Home Tour: back home, Sensei's last stop is the training station.
      const save = loadSave();
      if (save.homeTour === 'town') {
        save.homeTour = 'board';
        writeSave(save);
      }
      this.leave('Dojo', { from: 'town' });
      return;
    }
    if (this.entered('dojo-door', WALK.dojoDoor.enterRect, p)) this.leave('ActionZoneOutside', { from: 'town' });
  }
}

/** For tests: true when `p` (tiles) is inside the home door. */
export const inHomeDoor = (p: Vec2): boolean => inRect(p, WALK.homeDoor.enterRect);
