import Phaser from 'phaser';
import { TICKS_PER_SECOND, createWorld, stepWorld, type PlayerInput, type Room, type Vec2, type WorldState } from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';
import { touchPlayClock } from '../game/playTime';
import { currentTraining } from '../game/student';
import { loadLook, playerPacks } from '../game/look';
import { loadArt } from '../art/art';
import type { LayeredSprite } from '../art/LayeredSprite';
import { makePlayerSprite, playLocomotion } from '../art/player';
import { TouchControls } from '../input/TouchControls';
import { hiDpi, view } from '../ui/theme';

export const TILE = 48;
const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_TICKS_PER_FRAME = 5;
/** Same zoom as the Home Dojo and the Tower: the view is this many tiles tall. */
const VIEW_ROWS = 6.5;
const FADE = [10, 8, 16] as const;

export type Facing = 'north' | 'south' | 'east' | 'west';
const FACING_VEC: Record<Facing, Vec2> = { north: { x: 0, y: -1 }, south: { x: 0, y: 1 }, east: { x: 1, y: 0 }, west: { x: -1, y: 0 } };

export type TileRect = readonly [x0: number, x1: number, y0: number, y1: number];
export const inRect = (p: Vec2, r: TileRect): boolean => p.x >= r[0] && p.x <= r[1] && p.y >= r[2] && p.y <= r[3];

/**
 * A room the hero walks around in, drawn from the artist's pieces (A4-DOJO): the Action Zone inside
 * and outside. This holds what they share: the sim world and its fixed-step loop, the hero, the touch
 * controls, the zoom and camera that follow the hero inside the picture's edges, the fades, and the
 * "armed" rectangles that change the scene (an exit does nothing until the hero has first stood
 * outside it, so arriving on one never bounces you straight back).
 */
export abstract class WalkScene extends Phaser.Scene {
  protected world!: WorldState;
  protected controls!: TouchControls;
  protected hero!: LayeredSprite;
  protected player!: Phaser.GameObjects.Container;
  /** Everything in the room; scaled by the zoom and moved by the camera. */
  protected worldLayer!: Phaser.GameObjects.Container;
  /** What stands: props and the hero, sorted by the row they stand on. */
  protected standLayer!: Phaser.GameObjects.Container;
  /** The room picture's edges, in tiles: [x0, x1, y0, y1]. The view never shows beyond them. */
  protected bounds: [number, number, number, number] = [0, 1, 0, 1];
  private prevPos: Vec2 = { x: 0, y: 0 };
  private cam: Vec2 = { x: 0, y: 0 };
  private zoom = 1;
  private elapsed = 0;
  protected leaving = false;
  private armed = new Map<string, boolean>();

  /** The sim room (walls). */
  protected abstract room(): Room;
  /** The art packs this room draws, besides the hero's. */
  protected abstract roomPacks(): string[];
  /** Where the hero starts and which way it faces. */
  protected abstract spawn(data: unknown): { pos: Vec2; facing: Facing };
  /** Draws the room into worldLayer and standLayer, and sets bounds. */
  protected abstract drawRoom(): void;
  /** Called after every sim tick with the hero's position. */
  protected abstract afterTick(pos: Vec2): void;
  /** Where a tap lands, in tiles: a scene can send taps on a door to the spot in front of it. */
  protected tapTile(tile: Vec2): Vec2 {
    return tile;
  }

  preload(): void {
    loadArt(this, [...playerPacks(), ...this.roomPacks()]);
  }

  create(data?: unknown): void {
    hiDpi(this.cameras.main);
    this.leaving = false;
    this.elapsed = 0;
    this.armed.clear();

    const start = this.spawn(data);
    this.world = createWorld(this.room(), ['p1']);
    this.world.players.p1.pos = { ...start.pos };
    this.world.players.p1.facing = { ...FACING_VEC[start.facing] };
    this.prevPos = { ...start.pos };
    this.cam = { ...start.pos };

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
  protected fade(ms: number): number {
    return reducedMotion() ? 0 : ms;
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const training = currentTraining();
    this.hero = makePlayerSprite(this, training.belt, training.stripesThisBelt, loadLook())!;
    const p = this.world.players.p1.pos;
    return this.add.container(p.x * TILE, p.y * TILE, [this.hero.container]);
  }

  /**
   * True once, when the hero is inside `rect` after having been outside it. `id` names the rectangle.
   * A hero that starts inside it must step out first.
   */
  protected entered(id: string, rect: TileRect, pos: Vec2): boolean {
    const inside = inRect(pos, rect);
    if (!inside) this.armed.set(id, true);
    return inside && this.armed.get(id) === true;
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
        stepWorld(this.world, this.room(), { p1: input });
        this.elapsed -= TICK_MS;
        this.afterTick(this.world.players.p1.pos);
      }
    }
    this.draw(Math.min(1, this.elapsed / TICK_MS));
    this.updateCamera(false);
  }

  /** Fades out and starts another scene. */
  protected leave(to: string, data?: object, door = true): void {
    if (this.leaving) return;
    this.leaving = true;
    if (door) sfx.doors();
    this.cameras.main.fadeOut(this.fade(300), ...FADE);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(to, data));
  }

  protected draw(blend: number): void {
    const p = this.world.players.p1;
    const x = Phaser.Math.Linear(this.prevPos.x, p.pos.x, blend);
    const y = Phaser.Math.Linear(this.prevPos.y, p.pos.y, blend);
    this.player.setPosition(x * TILE, y * TILE);
    // Props never move, so the stand order only changes when the hero's row does: no sort while it stands still.
    if (this.player.depth !== y * TILE) {
      this.player.setDepth(y * TILE);
      this.standLayer.sort('depth');
    }
    this.onDraw(y);

    this.hero.face(p.facing.x, p.facing.y);
    const speed = Math.hypot(p.pos.x - this.prevPos.x, p.pos.y - this.prevPos.y) * TICKS_PER_SECOND;
    playLocomotion(this.hero, p.moving ? speed : 0);
    this.hero.update();
  }

  /** Each frame, with the hero's row: the place to show or hide pieces by where the hero stands. */
  protected onDraw(_heroRow: number): void {}

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
    return this.tapTile({ x: (x - this.worldLayer.x) / this.zoom / TILE, y: (y - this.worldLayer.y) / this.zoom / TILE });
  }
}
