import Phaser from 'phaser';
import { TICKS_PER_SECOND, createWorld, stepWorld, type PlayerInput, type Vec2, type WorldState } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { INSIDE, INSIDE_PACK } from '../game/actionZone';
import { reducedMotion } from '../game/motion';
import { touchPlayClock } from '../game/playTime';
import { currentTraining } from '../game/student';
import { loadLook, playerPacks } from '../game/look';
import { addStatic, loadArt, staticArt, staticSprites } from '../art/art';
import type { LayeredSprite } from '../art/LayeredSprite';
import { makePlayerSprite, playLocomotion } from '../art/player';
import { TouchControls } from '../input/TouchControls';
import { hiDpi, view } from '../ui/theme';

const TILE = 48;
const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_TICKS_PER_FRAME = 5;
/** Same zoom as the Home Dojo and the Tower: the view is this many tiles tall. */
const VIEW_ROWS = 6.5;
const FADE = [10, 8, 16] as const;

/**
 * The Action Zone dojo, inside (A4-DOJO-i). One room, drawn from the artist's pieces:
 * floor, walls and props at the back; then everything that stands (props, the wings, the hero)
 * sorted by the row it stands on; then the seat backs and bag tops, which show only while the
 * hero is north of them; then the front wall, which is always on top. The walk-up spots do
 * nothing yet. The door at the bottom leads back to the Home Dojo.
 */
export class InsideScene extends Phaser.Scene {
  private world!: WorldState;
  private controls!: TouchControls;
  private hero!: LayeredSprite;
  private player!: Phaser.GameObjects.Container;
  private worldLayer!: Phaser.GameObjects.Container;
  private standLayer!: Phaser.GameObjects.Container;
  /** Seat backs and bag tops, each hidden unless the hero's feet are north of its sort row. */
  private tops: Array<{ images: Phaser.GameObjects.Image[]; sortRow: number }> = [];
  /** The room picture's edges, in tiles: [x0, x1, y0, y1]. The view never shows beyond them. */
  private bounds: [number, number, number, number] = [0, 27, 0, 19];
  private prevPos: Vec2 = { x: 0, y: 0 };
  private cam: Vec2 = { x: 0, y: 0 };
  private zoom = 1;
  private elapsed = 0;
  private leaving = false;

  constructor() {
    super('ActionZoneInside');
  }

  preload(): void {
    loadArt(this, [...playerPacks(), INSIDE_PACK]);
  }

  create(): void {
    hiDpi(this.cameras.main);
    this.leaving = false;
    this.elapsed = 0;
    this.tops = [];

    this.world = createWorld(INSIDE.room, ['p1']);
    this.world.players.p1.facing = { x: 0, y: -1 };
    this.prevPos = { ...this.world.players.p1.pos };
    this.cam = { ...this.world.players.p1.pos };

    this.worldLayer = this.add.container(0, 0);
    this.standLayer = this.add.container(0, 0);
    this.player = this.makePlayer();
    this.standLayer.add(this.player);
    this.drawRoom();

    this.controls = new TouchControls(this, this.cameras.main, (x, y) => this.toTile(x, y), () => this.leaving);
    this.layout();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    const release = () => this.controls.reset();
    this.game.events.on(Phaser.Core.Events.HIDDEN, release);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
      this.game.events.off(Phaser.Core.Events.HIDDEN, release);
    });
    this.cameras.main.fadeIn(this.fade(400), ...FADE);
    // Time in the Action Zone is play time too (M7-P9's clock).
    touchPlayClock();
    this.time.addEvent({ delay: 5000, loop: true, callback: () => touchPlayClock() });
  }

  /** Fades are skipped when reduced motion is on. */
  private fade(ms: number): number {
    return reducedMotion() ? 0 : ms;
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const training = currentTraining();
    this.hero = makePlayerSprite(this, training.belt, training.stripesThisBelt, loadLook())!;
    const p = this.world.players.p1.pos;
    return this.add.container(p.x * TILE, p.y * TILE, [this.hero.container]);
  }

  private drawRoom(): void {
    const floor = addStatic(this, INSIDE_PACK, 'inside-main-floor', 0, 0);
    const [floorImg, wallsImg, propsImg, frontWall] = floor;
    const frame = staticArt(this, INSIDE_PACK, 'inside-main-floor');
    if (frame) {
      const [ax, ay] = frame.anchor;
      this.bounds = [-ax / TILE, (frame.frameWidth - ax) / TILE, -ay / TILE, (frame.frameHeight - ay) / TILE];
    }

    const topRow = new Map(INSIDE.foregroundSprites.map((f) => [f.id, f.sortRow]));
    const tops: Phaser.GameObjects.Image[][] = [];
    for (const [id, s] of Object.entries(staticSprites(this, INSIDE_PACK))) {
      if (!s.anchorTile || s.sortRow === undefined) continue;
      const images = addStatic(this, INSIDE_PACK, id, s.anchorTile[0] * TILE, s.anchorTile[1] * TILE);
      const row = topRow.get(id);
      if (row !== undefined) {
        this.tops.push({ images, sortRow: row });
        tops.push(images);
      } else {
        for (const img of images) img.setDepth(s.sortRow * TILE);
        this.standLayer.add(images);
      }
    }
    // Bottom to top: floor, walls, props; what stands and the hero; seat backs and bag tops;
    // the front wall.
    const topLayer = this.add.container(0, 0, tops.flat());
    this.worldLayer.add([floorImg, wallsImg, propsImg, this.standLayer, topLayer, frontWall].filter(Boolean));
  }

  update(_time: number, delta: number): void {
    if (this.leaving) {
      this.controls.takeInput();
      this.elapsed = 0;
    } else {
      this.elapsed = Math.min(this.elapsed + delta, TICK_MS * MAX_TICKS_PER_FRAME);
      while (this.elapsed >= TICK_MS && !this.leaving) {
        this.prevPos = { ...this.world.players.p1.pos };
        const input: PlayerInput = this.controls.takeInput();
        stepWorld(this.world, INSIDE.room, { p1: input });
        this.elapsed -= TICK_MS;
        this.afterTick();
      }
    }
    this.draw(Math.min(1, this.elapsed / TICK_MS));
    this.updateCamera(false);
  }

  /** Walking into the door rectangle at the bottom leaves for the Home Dojo. */
  private afterTick(): void {
    const p = this.world.players.p1.pos;
    const [x0, x1, y0, y1] = INSIDE.exit;
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) this.leave();
  }

  private leave(): void {
    if (this.leaving) return;
    this.leaving = true;
    sfx.doors();
    this.cameras.main.fadeOut(this.fade(300), ...FADE);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Dojo'));
  }

  private draw(blend: number): void {
    const p = this.world.players.p1;
    const x = Phaser.Math.Linear(this.prevPos.x, p.pos.x, blend);
    const y = Phaser.Math.Linear(this.prevPos.y, p.pos.y, blend);
    this.player.setPosition(x * TILE, y * TILE);
    this.player.setDepth(y * TILE);
    this.standLayer.sort('depth');
    // A seat back or bag top covers the hero only while the hero stands north of it.
    for (const t of this.tops) for (const img of t.images) img.setVisible(y < t.sortRow);

    this.hero.face(p.facing.x, p.facing.y);
    const speed = Math.hypot(p.pos.x - this.prevPos.x, p.pos.y - this.prevPos.y) * TICKS_PER_SECOND;
    playLocomotion(this.hero, p.moving ? speed : 0);
    this.hero.update();
  }

  /** Zooms in so the view is VIEW_ROWS tiles tall, like the Home Dojo and the Tower. */
  private layout(): void {
    const { height } = view(this);
    this.zoom = height / (VIEW_ROWS * TILE);
    this.worldLayer.setScale(this.zoom);
    this.controls.layout();
    this.updateCamera(true);
  }

  /** Follows the hero; the edges of the room picture stay on screen. */
  private updateCamera(snap: boolean): void {
    const { width, height } = view(this);
    const t = TILE * this.zoom;
    const [x0, x1, y0, y1] = this.bounds;
    const viewW = width / t;
    const viewH = height / t;
    const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
    const target = this.world.players.p1.pos;
    const k = snap ? 1 : 0.15;
    const tx = clamp(target.x, x0 + viewW / 2, x1 - viewW / 2);
    const ty = clamp(target.y, y0 + viewH / 2, y1 - viewH / 2);
    this.cam = { x: this.cam.x + (tx - this.cam.x) * k, y: this.cam.y + (ty - this.cam.y) * k };
    this.worldLayer.setPosition(width / 2 - this.cam.x * t, height / 2 - this.cam.y * t);
  }

  /** Screen point to room tiles. */
  private toTile(x: number, y: number): Vec2 {
    return { x: (x - this.worldLayer.x) / this.zoom / TILE, y: (y - this.worldLayer.y) / this.zoom / TILE };
  }
}

