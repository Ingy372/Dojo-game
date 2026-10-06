import Phaser from 'phaser';
import {
  MOVEMENT,
  TICKS_PER_SECOND,
  createWorld,
  loadRoom,
  stepWorld,
  type PlayerId,
  type Room,
  type Vec2,
  type WorldState,
} from '@dojo/sim';
import trainingRoom from '../../../../content/rooms/training-room.json';
import { TouchControls } from '../input/TouchControls';

/** Pixels per tile in the world (before camera zoom). */
const TILE = 48;
/** How many tiles tall the view is, whatever the phone's size. */
const VISIBLE_ROWS = 9;
const TICK_MS = 1000 / TICKS_PER_SECOND;
/** Never run more than this many ticks in one frame (e.g. after a long pause). */
const MAX_TICKS_PER_FRAME = 5;

const COLORS = {
  floorA: 0x2a2536,
  floorB: 0x2f2a3d,
  wall: 0x5b4a3c,
  wallTop: 0x7a6553,
  gi: 0xf2e9d8,
  outline: 0x14121c,
  belt: 0xffffff,
  marker: 0xf2c14e,
};

/**
 * The room. The rules package decides where everything is, 20 times a second;
 * this scene only draws it, blending between ticks so motion looks smooth.
 */
export class GameScene extends Phaser.Scene {
  private room!: Room;
  private world!: WorldState;
  private readonly me: PlayerId = 'p1';
  private prevPos: Vec2 = { x: 0, y: 0 };
  private elapsed = 0;

  private player!: Phaser.GameObjects.Container;
  private body!: Phaser.GameObjects.Arc;
  private facingDot!: Phaser.GameObjects.Arc;
  private marker!: Phaser.GameObjects.Arc;
  private controls!: TouchControls;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super('Game');
  }

  create(): void {
    this.room = loadRoom(trainingRoom);
    this.world = createWorld(this.room, [this.me]);
    this.prevPos = { ...this.world.players[this.me].pos };
    this.elapsed = 0;

    const roomGfx = this.drawRoom();
    this.marker = this.add.circle(0, 0, TILE * 0.22).setStrokeStyle(3, COLORS.marker, 0.9).setVisible(false);
    this.player = this.makePlayer();

    // Two cameras: one follows the character through the room, one holds the on-screen controls.
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.room.width * TILE, this.room.height * TILE);
    cam.startFollow(this.player, true);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);

    this.controls = new TouchControls(this, cam, (x, y) => ({ x: x / TILE, y: y / TILE }));
    cam.ignore(this.controls.objects);
    this.uiCamera.ignore([roomGfx, this.marker, this.player]);

    this.layout(this.scale.gameSize);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    // Let go of the stick if the app goes to the background mid-touch.
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.controls.reset, this.controls);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
      this.game.events.off(Phaser.Core.Events.HIDDEN, this.controls.reset, this.controls);
    });
  }

  update(_time: number, delta: number): void {
    // Run the rules at a fixed 20 ticks per second, whatever the screen's frame rate.
    this.elapsed = Math.min(this.elapsed + delta, TICK_MS * MAX_TICKS_PER_FRAME);
    while (this.elapsed >= TICK_MS) {
      this.prevPos = { ...this.world.players[this.me].pos };
      stepWorld(this.world, this.room, { [this.me]: this.controls.takeInput() });
      this.elapsed -= TICK_MS;
    }
    this.draw(this.elapsed / TICK_MS);
  }

  private draw(blend: number): void {
    const p = this.world.players[this.me];
    const x = Phaser.Math.Linear(this.prevPos.x, p.pos.x, blend);
    const y = Phaser.Math.Linear(this.prevPos.y, p.pos.y, blend);
    this.player.setPosition(x * TILE, y * TILE);

    const r = MOVEMENT.playerRadius * TILE;
    this.facingDot.setPosition(p.facing.x * r * 0.6, p.facing.y * r * 0.6);
    // A gentle bob while walking, so movement feels alive.
    const bob = p.moving ? 1 + Math.sin(this.time.now / 70) * 0.05 : 1;
    this.body.setScale(bob, 2 - bob);

    const end = p.path?.[p.path.length - 1];
    this.marker.setVisible(!!end);
    if (end) {
      this.marker.setPosition(end.x * TILE, end.y * TILE);
      this.marker.setScale(1 + Math.sin(this.time.now / 120) * 0.12);
    }
  }

  private drawRoom(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    for (let row = 0; row < this.room.height; row++) {
      for (let col = 0; col < this.room.width; col++) {
        const x = col * TILE;
        const y = row * TILE;
        if (this.room.walls[row][col]) {
          g.fillStyle(COLORS.wall).fillRect(x, y, TILE, TILE);
          g.fillStyle(COLORS.wallTop).fillRect(x, y, TILE, TILE * 0.25);
        } else {
          g.fillStyle((row + col) % 2 === 0 ? COLORS.floorA : COLORS.floorB).fillRect(x, y, TILE, TILE);
        }
      }
    }
    return g;
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const r = MOVEMENT.playerRadius * TILE;
    this.body = this.add.circle(0, 0, r, COLORS.gi).setStrokeStyle(3, COLORS.outline);
    const belt = this.add.rectangle(0, r * 0.15, r * 1.9, r * 0.28, COLORS.belt).setStrokeStyle(2, COLORS.outline);
    this.facingDot = this.add.circle(0, 0, r * 0.28, COLORS.outline);
    return this.add.container(0, 0, [this.body, belt, this.facingDot]);
  }

  private layout(size: Phaser.Structs.Size): void {
    const { width, height } = size;
    const cam = this.cameras.main;
    cam.setSize(width, height);
    cam.setZoom(height / (VISIBLE_ROWS * TILE));
    this.uiCamera.setSize(width, height);
    this.controls.layout();
  }
}
