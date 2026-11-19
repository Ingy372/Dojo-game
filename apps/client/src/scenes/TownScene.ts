import Phaser from 'phaser';
import { findPath, loadTownWalk, pieceShown, townRoom, townStage, MOVEMENT, type MoveInput, type Room, type TownDoor, type Vec2 } from '@dojo/sim';
import { addStatic, staticSprites, type StaticSprite } from '../art/art';
import { makePlayerSprite, playLocomotion } from '../art/player';
import type { LayeredSprite } from '../art/LayeredSprite';
import { testFlags } from '../game/beta';
import { loadLook, SWATCHES } from '../game/look';
import { currentTraining } from '../game/student';
import { addExitCue } from '../ui/exitCue';
import { FONT, crisp } from '../ui/theme';
import { TOUR, senseiBubble, tourGlow, tourLine } from '../ui/homeTour';
import { loadSave, writeSave } from '../game/save';
import { TILE, WalkScene, inRect, type Facing } from './WalkScene';
import townWalk from '../../../../content/dojo/action-zone/town-walk.json';

export const TOWN_PACK = 'town';
const WALK = loadTownWalk(townWalk);

/** The town's stage: the student's real belt tier. Test link `?townstage=N` shows another stage (never in beta builds). */
export function currentTownStage(): number {
  const asked = Number(testFlags().get('townstage'));
  return townStage(WALK, asked > 0 ? asked : currentTraining().belt.tier);
}

/** Where the hero came from: out of their own dojo (home), or out of the Action Zone (outside). */
export interface TownSceneData {
  from?: 'home' | 'outside';
}

/** A pretend classmate for the crowd test (`?crowd=N`): walks between open spots, never blocks anyone. */
interface Walker {
  sprite: LayeredSprite;
  box: Phaser.GameObjects.Container;
  pos: Vec2;
  path: Vec2[];
  rest: number;
}

const CROWD_NAMES = ['Ava M.', 'Leo R.', 'Mia T.', 'Kai B.', 'Zoe L.', 'Eli P.', 'Ivy C.', 'Max D.', 'Ana S.', 'Ben W.', 'Lily G.', 'Noah F.', 'Ruby H.', 'Sam K.', 'Nia J.', 'Owen V.', 'Maya N.', 'Theo A.', 'Isla Q.', 'Jude Y.'];

/**
 * The town (Nov 18 redesign, Jay: "bigger, very martial artsy, sakura trees, and it gets nicer and nicer as you
 * play"). A wide main street in front of the Action Zone, the market and the Hall of Masters lot; a big open plaza
 * with the statue; the practice yard; the torii gate into the garden; My Dojo and the koi pond. Walking out of the
 * Home Dojo's south door brings you out of My Dojo's door; the Action Zone's door goes to the real dojo.
 * The pieces shown follow the student's real belt (WALK.pieces' stages): every promotion makes the town nicer.
 */
export class TownScene extends WalkScene {
  private stage = 1;
  private roomAt: Room = townRoom(WALK, 1);
  private walkers: Walker[] = [];

  constructor() {
    super('ActionZoneTown');
  }

  protected room(): Room {
    return this.roomAt;
  }

  /** Home Tour "go home" stop: a push toward the home door goes in, even from where the hero came out. */
  private tourHomeWait = false;

  protected onInput(input: MoveInput, pos: Vec2): void {
    const d = WALK.homeDoor.enterRect;
    if (!this.tourHomeWait || !inRect(pos, [d[0] - 0.6, d[1] + 0.6, d[2], d[3] + 1.2])) return;
    if ((input.kind === 'stick' && input.y < -0.3) || (input.kind === 'moveTo' && input.y < pos.y - 0.2)) this.arm('home-door');
  }

  create(data?: unknown): void {
    this.tourHomeWait = false;
    this.stage = currentTownStage();
    this.roomAt = townRoom(WALK, this.stage);
    super.create(data);
    this.makeCrowd(Math.min(30, Math.max(0, Number(testFlags().get('crowd')) || 0)));
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
    // The plaza first (the camera drifts to the statue), then the real dojo's door.
    this.lookAt = { x: 23, y: 18 };
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
    // Jay, Nov 18: zoomed in close so details read; the town scrolls both ways.
    return 7;
  }

  protected spawn(data: unknown): { pos: Vec2; facing: Facing } {
    const from = (data as TownSceneData | undefined)?.from;
    const door = from === 'outside' ? WALK.dojoDoor : WALK.homeDoor;
    return { pos: { x: door.spawn[0], y: door.spawn[1] }, facing: 'south' };
  }

  protected drawRoom(): void {
    const w = WALK.tiles[0].length;
    this.bounds = [0, w, 0, WALK.tiles.length];
    const ground: Phaser.GameObjects.GameObject[] = [];
    const flat: [number, Phaser.GameObjects.Image[]][] = [];
    for (const [id, s] of Object.entries(staticSprites(this, TOWN_PACK)) as [string, StaticSprite & { stage?: number; until?: number }][]) {
      if (!s.anchorTile || !pieceShown({ stage: s.stage ?? 1, until: s.until }, this.stage)) continue;
      const images = addStatic(this, TOWN_PACK, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      if (s.place === 'ground') ground.push(...images);
      else if (s.place === 'flat') flat.push([s.sortRow ?? 0, images]);
      else {
        for (const img of images) img.setDepth((s.sortRow ?? s.anchorTile[1]) * TILE);
        this.standLayer.add(images);
      }
    }
    flat.sort((a, b) => a[0] - b[0]);

    const marks: Phaser.GameObjects.GameObject[] = [];
    for (const door of [WALK.homeDoor, WALK.dojoDoor]) {
      const [cx, cy] = door.cue;
      marks.push(addExitCue(this, cx * TILE, cy * TILE, TILE * 1.3, TILE * 0.8, 'up'));
      marks.push(
        this.add
          .text(cx * TILE, (cy - 1.25) * TILE, door.label, {
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
          .setResolution(crisp() * 2)
          .setDepth(door.cue[1] * TILE + 1),
      );
    }
    // Door labels sort with the pieces so a roof never covers them.
    this.standLayer.add(marks.filter((_m, i) => i % 2 === 1));
    this.worldLayer.add([...ground, ...flat.flatMap(([, imgs]) => imgs), ...marks.filter((_m, i) => i % 2 === 0), this.standLayer]);
    this.standLayer.sort('depth');
  }

  /** A tap on a door (or the building front around it) walks to the spot in front of it, inside its doorway. */
  protected tapTile(tile: Vec2): Vec2 {
    for (const door of [WALK.homeDoor, WALK.dojoDoor]) {
      const [x0, x1, y0, y1] = door.enterRect;
      if (tile.x >= x0 - 0.8 && tile.x <= x1 + 0.8 && tile.y >= y0 - 3 && tile.y <= y1) return { x: (x0 + x1) / 2, y: y1 - 0.3 };
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

  // ------------------------------------------------------------------ crowd test (?crowd=N): how roomy is the town?
  private openCells: Vec2[] = [];

  private makeCrowd(n: number): void {
    this.walkers = [];
    if (n <= 0) return;
    const room = this.roomAt;
    this.openCells = [];
    for (let y = 9; y < room.height - 1; y++) for (let x = 1; x < room.width - 1; x++) if (!room.walls[y][x]) this.openCells.push({ x: x + 0.5, y: y + 0.5 });
    const look = loadLook();
    const belts = currentTraining().belts;
    for (let i = 0; i < n; i++) {
      const pick = this.openCells[Math.floor(Math.random() * this.openCells.length)];
      const belt = belts[Math.floor(Math.random() * Math.min(belts.length, 10))];
      const sprite = makePlayerSprite(this, { id: belt.id, name: belt.name, color: belt.color, color2: belt.color2, tier: 1, degree: belt.degree }, Math.floor(Math.random() * 3), {
        ...look,
        skin: Math.floor(Math.random() * SWATCHES),
        hairColor: Math.floor(Math.random() * SWATCHES),
        gi: Math.floor(Math.random() * SWATCHES),
      });
      if (!sprite) return;
      const name = this.add
        .text(0, -TILE * 1.55, CROWD_NAMES[i % CROWD_NAMES.length], { fontFamily: FONT, fontSize: '11px', color: '#ffffff', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5, 1)
        .setResolution(crisp() * 2);
      const box = this.add.container(pick.x * TILE, pick.y * TILE, [sprite.container, name]);
      this.standLayer.add(box);
      this.walkers.push({ sprite, box, pos: { ...pick }, path: [], rest: Math.random() * 2 });
    }
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    if (!this.walkers.length) return;
    const dt = Math.min(delta, 100) / 1000;
    const speed = MOVEMENT.speedTilesPerSecond * 0.7;
    for (const w of this.walkers) {
      let moving = false;
      if (w.path.length) {
        const t = w.path[0];
        const dx = t.x - w.pos.x;
        const dy = t.y - w.pos.y;
        const d = Math.hypot(dx, dy);
        const step = speed * dt;
        if (d <= step) {
          w.pos = { ...t };
          w.path.shift();
          if (!w.path.length) w.rest = 1 + Math.random() * 4;
        } else {
          w.pos = { x: w.pos.x + (dx / d) * step, y: w.pos.y + (dy / d) * step };
          w.sprite.face(dx, dy);
        }
        moving = true;
      } else if ((w.rest -= dt) <= 0) {
        const to = this.openCells[Math.floor(Math.random() * this.openCells.length)];
        w.path = findPath(this.roomAt, w.pos, to, MOVEMENT.playerRadius) ?? [];
        if (!w.path.length) w.rest = 0.5;
      }
      w.box.setPosition(w.pos.x * TILE, w.pos.y * TILE).setDepth(w.pos.y * TILE);
      playLocomotion(w.sprite, moving ? speed : 0);
      w.sprite.update();
    }
    this.standLayer.sort('depth');
  }
}

/** For tests: true when `p` (tiles) is inside the home door. */
export const inHomeDoor = (p: Vec2): boolean => inRect(p, WALK.homeDoor.enterRect);
