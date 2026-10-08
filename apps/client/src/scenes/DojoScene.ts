import Phaser from 'phaser';
import {
  DOJO,
  MOVEMENT,
  TICKS_PER_SECOND,
  addDecorations,
  canPlace,
  choreInReach,
  choresLeft,
  cleanAll,
  createWorld,
  decorationDef,
  dojoRoom,
  findSpot,
  messLevel,
  placeItem,
  returnToDojo,
  rewardMoments,
  snapshot,
  stepWorld,
  storeItem,
  straightenRack,
  sweepAt,
  wipeMat,
  type DojoItem,
  type DojoState,
  type MessSpot,
  type PlayerInput,
  type Profile,
  type Room,
  type TrainingState,
  type Vec2,
  type WorldState,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { bowIsDue, homeDojo, setBowDue } from '../game/dojo';
import { loadSave, writeSave } from '../game/save';
import { currentTraining } from '../game/student';
import { startTowerRun } from '../game/tower';
import { TouchControls } from '../input/TouchControls';
import { drawBelt } from '../ui/belt';
import { bowPrompt, playBow } from '../ui/bow';
import { Celebrations } from '../ui/Celebrations';
import { drawDecoration, drawSpot } from '../ui/decorations';
import { FONT, crisp } from '../ui/theme';

/** Pixels per tile in the room (before it's scaled to fit the screen). */
const TILE = 48;
const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_TICKS_PER_FRAME = 5;
const HOUR = 3_600_000;
/** Screen space taken by the title bar, and by the storage tray while decorating. */
const TOP = 48;
const TRAY = 70;
/** How many tiles tall the view is (the camera follows the character, like in the Tower). */
const VIEW_ROWS = 6.5;
/** A tap this close (tiles) to a decoration picks it, for big fingers. */
const PICK_SLACK = 0.7;
/** Arrow buttons for moving the selected decoration. */
const ARROW = 54;
const CHORE_RADIUS = 46;
const CALM = 0x7fe0d0;

type Mode = 'arriving' | 'play' | 'decorate' | 'menu';

interface Drag {
  uid: string;
  pointerId: number;
  grab: Vec2;
  startCol: number;
  startRow: number;
  col: number;
  row: number;
  moved: boolean;
}

/**
 * The Home Dojo (framework section 7): the player's own room. Walk around, bow when
 * entering, sweep the dust, wipe the mats, straighten the weapon rack, and decorate.
 * The notice board opens the training board (Tower, gear, abilities, Gate); the door
 * leads to the Tower. The whole room fits on screen.
 */
export class DojoScene extends Phaser.Scene {
  private profile!: Profile;
  private dojo!: DojoState;
  private training!: TrainingState;
  private room!: Room;
  private world!: WorldState;
  private mode: Mode = 'play';

  private worldLayer!: Phaser.GameObjects.Container;
  private decoLayer!: Phaser.GameObjects.Container;
  private decoViews = new Map<string, Phaser.GameObjects.Graphics>();
  private spotGfx!: Phaser.GameObjects.Graphics;
  private selectGfx!: Phaser.GameObjects.Graphics;
  private player!: Phaser.GameObjects.Container;
  private facingDot!: Phaser.GameObjects.Arc;
  private calmAura!: Phaser.GameObjects.Arc;
  private ui!: Phaser.GameObjects.Container;
  private uiRects: Phaser.Geom.Rectangle[] = [];
  private choreButton!: Phaser.GameObjects.Container;
  private choreLabel!: Phaser.GameObjects.Text;
  private controls!: TouchControls;

  private zoom = 1;
  private offX = 0;
  private offY = 0;
  /** Where the camera looks (tiles). While decorating, dragging the floor pans it. */
  private cam: Vec2 = { x: 0, y: 0 };
  private panned = false;
  private pan: { pointerId: number; last: Vec2; moved: boolean } | null = null;
  private elapsed = 0;
  private prevPos: Vec2 = { x: 0, y: 0 };
  /** The door and board trigger only after the character has stepped away from them. */
  private doorArmed = false;
  private boardArmed = true;
  private sweepStreak = 0;
  private lastSweepAt = 0;
  private drag: Drag | null = null;
  private selected: string | null = null;
  private titleTaps: number[] = [];
  private leaving = false;

  constructor() {
    super('Dojo');
  }

  create(): void {
    this.profile = loadSave();
    this.dojo = homeDojo(this.profile);
    this.training = currentTraining();
    const hoursAway = returnToDojo(this.dojo, CONTENT.dojo, Date.now());
    writeSave(this.profile);

    this.mode = 'play';
    this.decoViews.clear();
    this.uiRects = [];
    this.elapsed = 0;
    this.drag = null;
    this.selected = null;
    this.titleTaps = [];
    this.leaving = false;
    this.doorArmed = false;
    this.boardArmed = true;
    this.sweepStreak = 0;

    this.room = dojoRoom(this.dojo, CONTENT.dojo);
    this.world = createWorld(this.room, ['p1']);
    this.world.players.p1.facing = { x: 0, y: -1 };
    this.prevPos = { ...this.world.players.p1.pos };
    this.cam = { ...this.world.players.p1.pos };
    this.panned = false;
    this.pan = null;

    this.worldLayer = this.add.container(0, 0);
    this.worldLayer.add(this.drawRoom());
    this.decoLayer = this.add.container(0, 0);
    this.spotGfx = this.add.graphics();
    this.selectGfx = this.add.graphics();
    this.player = this.makePlayer();
    // Mats lie under the dust; everything else stands above it.
    this.worldLayer.add([this.decoLayer, this.spotGfx, this.selectGfx, this.player]);
    this.redrawDecorations();
    this.redrawSpots();

    this.controls = new TouchControls(
      this,
      this.cameras.main,
      (x, y) => this.toTile(x, y),
      (x, y) => this.mode !== 'play' || this.onUi(x, y),
    );
    this.ui = this.add.container(0, 0).setDepth(20);
    this.makeChoreButton();
    this.layout();
    this.renderUi();

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDecoDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onDecoMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onDecoUp, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    const release = () => this.controls.reset();
    this.game.events.on(Phaser.Core.Events.HIDDEN, release);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
      this.game.events.off(Phaser.Core.Events.HIDDEN, release);
    });
    this.cameras.main.fadeIn(400, 10, 8, 16);

    if (bowIsDue()) {
      this.mode = 'arriving';
      bowPrompt(this, 'Bow as you enter your dojo', () => {
        playBow(this, this.player, () => {
          setBowDue(false);
          this.arrive(hoursAway);
        });
      });
    }
  }

  update(time: number, delta: number): void {
    if (this.mode !== 'play' || this.leaving) {
      this.controls.takeInput();
      this.elapsed = 0;
    } else {
      this.elapsed = Math.min(this.elapsed + delta, TICK_MS * MAX_TICKS_PER_FRAME);
      while (this.elapsed >= TICK_MS && this.mode === 'play' && !this.leaving) {
        this.prevPos = { ...this.world.players.p1.pos };
        const input: PlayerInput = this.controls.takeInput();
        stepWorld(this.world, this.room, { p1: input });
        this.elapsed -= TICK_MS;
        this.afterTick(time);
      }
    }
    this.draw(Math.min(1, this.elapsed / TICK_MS));
    this.updateCamera(false);
  }

  // ---------------------------------------------------------------- arriving

  /** After the bow: a welcome card (first visit, or back after a while), then any real celebrations. */
  private arrive(hoursAway: number): void {
    const name = this.training.displayName.split(' ')[0];
    const chores = choresLeft(this.dojo);
    const steps: Array<() => void> = [];
    if (!this.dojo.welcomed) {
      steps.push(() =>
        this.card('Your Home Dojo', [
          'This space is yours. Bow when you enter, keep it clean, and make it your own.',
          'Walk over dust to sweep it. Stand by a mat or the weapon rack to tidy it.',
          'The board on the wall has the Tower, your gear and the Gate. The door leads to the Tower.',
        ], "Let's go!", next),
      );
      this.dojo.welcomed = true;
      writeSave(this.profile);
    } else if (hoursAway >= DOJO.welcomeBackHours) {
      const hello = ["It's so good to see you!", 'Your dojo missed you.', 'Ready to train?'][Math.floor(Math.random() * 3)];
      const line = chores > 0 ? "A little dust settled while you were away. Let's get your dojo ready together." : 'Everything is just how you left it.';
      steps.push(() => this.card(`Welcome back, ${name}!`, [hello, line], chores > 0 ? "Let's clean up" : "Let's go!", next));
    }
    const moments = rewardMoments(this.profile.seen, this.training);
    if (moments.length > 0) {
      steps.push(() =>
        new Celebrations(this, moments, this.training, () => {
          this.profile.seen = snapshot(this.training);
          writeSave(this.profile);
          next();
        }),
      );
    }
    let i = 0;
    const next = (): void => {
      const step = steps[i++];
      if (step) step();
      else {
        this.mode = 'play';
        this.renderUi();
      }
    };
    next();
  }

  /** A gentle card with a title, a few short lines and one button. */
  private card(title: string, lines: string[], button: string, onClose: () => void): void {
    const { width, height } = this.scale.gameSize;
    const w = Math.min(460, width - 40);
    const box = this.add.container(0, 0).setDepth(70);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.6).setOrigin(0).setInteractive());
    const body = this.add
      .text(width / 2, 0, lines.join('\n\n'), { fontFamily: FONT, fontSize: '15px', color: '#f2e9d8', align: 'center', wordWrap: { width: w - 36 }, lineSpacing: 2 })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
    const h = body.height + 116;
    const top = Math.max(10, (height - h) / 2);
    box.add(this.add.rectangle(width / 2, top, w, h, 0x221d2e).setOrigin(0.5, 0).setStrokeStyle(3, 0xffd166, 0.7));
    box.add(
      this.add
        .text(width / 2, top + 16, title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '22px', color: '#ffd166' })
        .setOrigin(0.5, 0)
        .setResolution(crisp()),
    );
    body.setY(top + 52);
    box.add(body);
    const by = top + h - 50;
    const btn = this.add.rectangle(width / 2, by, 190, 38, 0x3aa57a).setOrigin(0.5, 0).setStrokeStyle(2, 0xffffff, 0.4).setInteractive();
    box.add(btn);
    box.add(this.add.text(width / 2, by + 19, button, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp()));
    box.setAlpha(0);
    this.tweens.add({ targets: box, alpha: 1, duration: 250 });
    btn.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      box.destroy();
      onClose();
    });
  }

  // ---------------------------------------------------------------- playing

  private afterTick(time: number): void {
    const p = this.world.players.p1;
    const { swept, calmMind } = sweepAt(this.dojo, p.pos);
    if (swept.length > 0) {
      this.sweepStreak = time - this.lastSweepAt < 1500 ? this.sweepStreak + 1 : 0;
      this.lastSweepAt = time;
      for (const s of swept) this.puff(s);
      sfx.sweep(this.sweepStreak);
      this.redrawSpots();
      writeSave(this.profile);
      this.renderUi();
      if (calmMind) this.celebrateCalm();
    }

    const door = CONTENT.dojo.room.doors[0];
    const board = { x: CONTENT.dojo.board.col + 0.5, y: 0.5 };
    const dDoor = Math.hypot(p.pos.x - door.x, p.pos.y - door.y);
    const dBoard = Math.hypot(p.pos.x - board.x, p.pos.y - board.y);
    if (dDoor > 1.7) this.doorArmed = true;
    if (dBoard > 1.7) this.boardArmed = true;
    if (this.doorArmed && dDoor < 1.1) this.goTower();
    else if (this.boardArmed && dBoard < 1.1) this.goBoard();
  }

  private doChore(): void {
    if (this.mode !== 'play') return;
    sfx.unlock();
    const chore = choreInReach(this.dojo, CONTENT.dojo, this.world.players.p1.pos);
    if (!chore) return;
    const it = chore.item;
    const def = decorationDef(CONTENT.dojo, it.id);
    const center = { x: it.col! + def.width / 2, y: it.row! + def.height / 2 };
    const result = chore.kind === 'wipe' ? wipeMat(this.dojo, it.uid) : straightenRack(this.dojo, it.uid);
    if (chore.kind === 'wipe') sfx.wipe(result.done);
    else sfx.straighten(result.done);
    this.sparkle(center, result.done ? 12 : 4);
    this.tweens.add({ targets: this.choreButton, scale: 0.88, duration: 70, yoyo: true });
    this.redrawDecorations();
    writeSave(this.profile);
    this.renderUi();
    if (result.calmMind) this.celebrateCalm();
  }

  /** The dojo is spotless: Calm Mind. Kept modest, so real achievements are always bigger. */
  private celebrateCalm(): void {
    writeSave(this.profile);
    sfx.calmMind();
    const p = this.world.players.p1.pos;
    this.ring(p, CALM, 2.2);
    this.sparkle(p, 14, CALM);
    const { width, height } = this.scale.gameSize;
    const runs = this.dojo.calmMindRuns;
    const t = this.add
      .text(width / 2, height * 0.3, `Spotless!  Calm Mind\nFocus builds faster for your next ${runs} Tower runs`, {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: '18px',
        color: '#bff5ec',
        stroke: '#14121c',
        strokeThickness: 5,
        align: 'center',
      })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setDepth(40)
      .setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, y: height * 0.27, duration: 300 });
    this.tweens.add({ targets: t, alpha: 0, delay: 3200, duration: 500, onComplete: () => t.destroy() });
    this.renderUi();
  }

  private goTower(): void {
    if (this.leaving) return;
    const run = startTowerRun(this.profile, this.training);
    this.leaveTo('Game', { run });
  }

  private goBoard(): void {
    this.leaveTo('Home');
  }

  private leaveTo(scene: string, data?: object): void {
    if (this.leaving) return;
    this.leaving = true;
    sfx.doors();
    writeSave(this.profile);
    this.cameras.main.fadeOut(300, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(scene, data));
  }

  // ---------------------------------------------------------------- decorating

  private setDecorating(on: boolean): void {
    sfx.unlock();
    this.controls.reset();
    this.selected = null;
    this.drag = null;
    this.pan = null;
    this.panned = false;
    if (on) {
      this.mode = 'decorate';
      // The movement stick isn't used while decorating.
      for (const o of this.controls.objects) (o as Phaser.GameObjects.Arc).setVisible(false);
    } else {
      this.mode = 'play';
      // Solid decorations may have moved: rebuild the walkable room, keeping the character in place
      // (or back at the door if something now stands on them).
      const pos = { ...this.world.players.p1.pos };
      this.room = dojoRoom(this.dojo, CONTENT.dojo);
      this.world = createWorld(this.room, ['p1']);
      const p = this.world.players.p1;
      if (!this.room.walls[Math.floor(pos.y)][Math.floor(pos.x)]) p.pos = pos;
      this.prevPos = { ...p.pos };
    }
    this.layout();
    this.redrawDecorations();
    this.renderUi();
  }

  private itemAt(tile: Vec2): DojoItem | null {
    const col = Math.floor(tile.x);
    const row = Math.floor(tile.y);
    let found: DojoItem | null = null;
    for (const it of this.dojo.items) {
      if (it.col === null || it.row === null) continue;
      const def = decorationDef(CONTENT.dojo, it.id);
      if (col >= it.col && col < it.col + def.width && row >= it.row && row < it.row + def.height) {
        // Prefer things standing on top over mats.
        if (!found || def.clean !== 'mat') found = it;
      }
    }
    if (found) return found;
    // Nothing right under the finger: take the closest decoration nearby.
    let best = PICK_SLACK;
    for (const it of this.dojo.items) {
      if (it.col === null || it.row === null) continue;
      const def = decorationDef(CONTENT.dojo, it.id);
      const dx = Math.max(it.col - tile.x, 0, tile.x - (it.col + def.width));
      const dy = Math.max(it.row - tile.y, 0, tile.y - (it.row + def.height));
      const d = Math.hypot(dx, dy);
      if (d < best) {
        best = d;
        found = it;
      }
    }
    return found;
  }

  private onDecoDown(pointer: Phaser.Input.Pointer): void {
    if (this.mode !== 'decorate' || this.drag || this.pan || this.onUi(pointer.x, pointer.y)) return;
    const tile = this.toTile(pointer.x, pointer.y);
    const it = this.itemAt(tile);
    if (!it) {
      // Empty floor: drag to look around, or tap to move the selected decoration here.
      this.pan = { pointerId: pointer.id, last: { x: pointer.x, y: pointer.y }, moved: false };
      return;
    }
    sfx.place(false);
    this.panned = false;
    this.drag = { uid: it.uid, pointerId: pointer.id, grab: { x: tile.x - it.col!, y: tile.y - it.row! }, startCol: it.col!, startRow: it.row!, col: it.col!, row: it.row!, moved: false };
    this.selected = it.uid;
    this.redrawDecorations();
  }

  private onDecoMove(pointer: Phaser.Input.Pointer): void {
    const pan = this.pan;
    if (pan && pointer.id === pan.pointerId && pointer.isDown) {
      const dx = pointer.x - pan.last.x;
      const dy = pointer.y - pan.last.y;
      if (!pan.moved && Math.hypot(pointer.x - pointer.downX, pointer.y - pointer.downY) < 12) return;
      pan.moved = true;
      pan.last = { x: pointer.x, y: pointer.y };
      this.cam.x -= dx / (this.zoom * TILE);
      this.cam.y -= dy / (this.zoom * TILE);
      this.panned = true;
      this.updateCamera(true);
      return;
    }
    const d = this.drag;
    if (!d || pointer.id !== d.pointerId || !pointer.isDown) return;
    const tile = this.toTile(pointer.x, pointer.y);
    const col = Math.floor(tile.x - d.grab.x + 0.5);
    const row = Math.floor(tile.y - d.grab.y + 0.5);
    if (col === d.col && row === d.row) return;
    d.col = col;
    d.row = row;
    d.moved = d.moved || col !== d.startCol || row !== d.startRow;
    this.redrawDecorations();
  }

  private onDecoUp(pointer: Phaser.Input.Pointer): void {
    const pan = this.pan;
    if (pan && pointer.id === pan.pointerId) {
      this.pan = null;
      if (!pan.moved && this.selected) this.moveSelectedTo(this.toTile(pointer.x, pointer.y));
      return;
    }
    const d = this.drag;
    if (!d || pointer.id !== d.pointerId) return;
    this.drag = null;
    if (d.moved) {
      if (placeItem(this.dojo, CONTENT.dojo, d.uid, d.col, d.row)) sfx.place(true);
      else sfx.denied();
      writeSave(this.profile);
    }
    this.redrawDecorations();
    this.redrawSpots();
    this.renderUi();
  }

  /** Tap-to-place: the selected decoration moves to where the floor was tapped (if it fits). */
  private moveSelectedTo(tile: Vec2): void {
    const it = this.dojo.items.find((x) => x.uid === this.selected);
    if (!it) return;
    const def = decorationDef(CONTENT.dojo, it.id);
    const col = Math.round(tile.x - def.width / 2);
    const row = def.place === 'wall' ? 0 : Math.round(tile.y - def.height / 2);
    if (placeItem(this.dojo, CONTENT.dojo, it.uid, col, row)) {
      sfx.place(true);
      this.panned = false;
      writeSave(this.profile);
      this.redrawDecorations();
      this.redrawSpots();
    } else {
      sfx.denied();
      this.toast(def.place === 'wall' ? 'That goes on the top wall, in a free spot.' : "It doesn't fit there.");
    }
  }

  /** The arrow buttons: move the selected decoration one step (hopping over anything in the way). */
  private nudge(dx: number, dy: number): void {
    const it = this.dojo.items.find((x) => x.uid === this.selected);
    if (!it || it.col === null || it.row === null) return;
    const room = CONTENT.dojo.room;
    for (let k = 1; k < Math.max(room.width, room.height); k++) {
      const col = it.col + dx * k;
      const row = it.row + dy * k;
      if (col < 0 || row < 0 || col >= room.width || row >= room.height) break;
      if (placeItem(this.dojo, CONTENT.dojo, it.uid, col, row)) {
        sfx.place(true);
        this.panned = false;
        writeSave(this.profile);
        this.redrawDecorations();
        this.redrawSpots();
        return;
      }
    }
    sfx.denied();
  }

  /** Takes a decoration out of storage and puts it in the best free spot. */
  private takeOut(uid: string): void {
    sfx.unlock();
    const spot = findSpot(this.dojo, CONTENT.dojo, uid);
    if (!spot) {
      this.toast('No room for that right now. Try putting something away.');
      sfx.denied();
      return;
    }
    placeItem(this.dojo, CONTENT.dojo, uid, spot.col, spot.row);
    sfx.place(true);
    this.selected = uid;
    this.panned = false;
    writeSave(this.profile);
    this.redrawDecorations();
    this.redrawSpots();
    this.renderUi();
  }

  private putAway(): void {
    if (!this.selected) return;
    storeItem(this.dojo, this.selected);
    sfx.place(false);
    this.selected = null;
    writeSave(this.profile);
    this.redrawDecorations();
    this.renderUi();
  }

  // ---------------------------------------------------------------- drawing

  private drawRoom(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    const room = CONTENT.dojo.room;
    for (let row = 0; row < room.height; row++) {
      for (let col = 0; col < room.width; col++) {
        const x = col * TILE;
        const y = row * TILE;
        if (room.walls[row][col]) {
          g.fillStyle(0x5b4a3c).fillRect(x, y, TILE, TILE);
          g.fillStyle(0x7a6553).fillRect(x, y, TILE, TILE * 0.25);
        } else {
          // Warm wooden floorboards.
          g.fillStyle(row % 2 === 0 ? 0x8a6a48 : 0x83643f).fillRect(x, y, TILE, TILE);
          g.fillStyle(0x6e5134, 0.5).fillRect(x, y + TILE - 2, TILE, 2);
          if ((row + col) % 3 === 0) g.fillStyle(0x6e5134, 0.5).fillRect(x + TILE - 2, y, 2, TILE);
        }
      }
    }
    // The door to the Tower.
    const door = room.doors[0];
    const dx = (door.x - 0.5) * TILE;
    const dy = (door.y - 0.5) * TILE;
    g.fillStyle(0x2a1f18).fillRect(dx + 4, dy, TILE - 8, TILE);
    g.fillStyle(0xd5713a, 0.9).fillRect(dx + 8, dy + 4, TILE - 16, TILE - 6);
    g.fillStyle(0xffd166).fillCircle(dx + TILE - 14, dy + TILE / 2, 3);
    // The notice board.
    const b = CONTENT.dojo.board;
    const bx = b.col * TILE;
    g.fillStyle(0x6b4a2b).fillRect(bx + 3, 4, TILE - 6, TILE - 8);
    g.fillStyle(0xc8a46a).fillRect(bx + 7, 8, TILE - 14, TILE - 16);
    g.fillStyle(0xf2e9d8).fillRect(bx + 11, 12, 12, 9);
    g.fillStyle(0xf2e9d8).fillRect(bx + 25, 16, 11, 12);
    g.fillStyle(0xff3b30).fillCircle(bx + 17, 13, 2).fillCircle(bx + 30, 17, 2);
    this.worldLayer.add(
      this.add
        .text(door.x * TILE, (door.y - 0.5) * TILE + TILE * 0.5, 'TOWER', { fontFamily: FONT, fontStyle: 'bold', fontSize: '11px', color: '#fff6e0', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5)
        .setResolution(crisp() * 2),
    );
    this.worldLayer.add(
      this.add
        .text(bx + TILE / 2, TILE + 2, 'BOARD', { fontFamily: FONT, fontStyle: 'bold', fontSize: '10px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5, 0)
        .setResolution(crisp() * 2)
        .setDepth(1),
    );
    return g;
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const r = MOVEMENT.playerRadius * TILE;
    this.calmAura = this.add.circle(0, 0, r * 1.5, CALM, 0.18).setStrokeStyle(2, CALM, 0.6);
    this.tweens.add({ targets: this.calmAura, scale: 1.15, alpha: 0.5, duration: 1300, yoyo: true, repeat: -1 });
    const body = this.add.circle(0, 0, r, 0xf2e9d8).setStrokeStyle(3, 0x14121c);
    const belt = this.add.graphics();
    drawBelt(belt, 0, r * 0.15, r * 1.9, r * 0.28, this.training.belt, this.training.stripesThisBelt);
    this.facingDot = this.add.circle(0, 0, r * 0.28, 0x14121c);
    const p = this.world.players.p1.pos;
    return this.add.container(p.x * TILE, p.y * TILE, [this.calmAura, body, belt, this.facingDot]);
  }

  private draw(blend: number): void {
    const p = this.world.players.p1;
    const x = Phaser.Math.Linear(this.prevPos.x, p.pos.x, blend);
    const y = Phaser.Math.Linear(this.prevPos.y, p.pos.y, blend);
    this.player.setPosition(x * TILE, y * TILE);
    const r = MOVEMENT.playerRadius * TILE;
    this.facingDot.setPosition(p.facing.x * r * 0.6, p.facing.y * r * 0.6);
    this.calmAura.setVisible(this.dojo.calmMindRuns > 0);
    this.player.setAlpha(this.mode === 'decorate' ? 0.4 : 1);

    // The chore button appears next to a scuffed mat or a messy rack.
    const chore = this.mode === 'play' ? choreInReach(this.dojo, CONTENT.dojo, p.pos) : null;
    this.choreButton.setVisible(!!chore);
    if (chore) {
      const it = chore.item;
      const left = chore.kind === 'wipe' ? DOJO.wipeTaps - it.wipes : it.crooked;
      this.choreLabel.setText(`${chore.kind === 'wipe' ? 'Wipe' : 'Straighten'}\n${'●'.repeat(left)}`);
    }
  }

  private redrawDecorations(): void {
    for (const g of this.decoViews.values()) g.destroy();
    this.decoViews.clear();
    this.decoLayer.removeAll(true);
    this.selectGfx.clear();
    const placed = this.dojo.items.filter((it) => it.col !== null && it.row !== null);
    // Mats go under the dust (decoLayer); everything else above it, sorted top to bottom.
    const mats = placed.filter((it) => decorationDef(CONTENT.dojo, it.id).clean === 'mat');
    const others = placed.filter((it) => !mats.includes(it)).sort((a, b) => a.row! - b.row!);
    for (const it of [...mats, ...others]) {
      const def = decorationDef(CONTENT.dojo, it.id);
      const g = this.add.graphics();
      const dragging = this.drag?.uid === it.uid;
      const col = dragging ? this.drag!.col : it.col!;
      const row = dragging ? this.drag!.row : it.row!;
      drawDecoration(g, def, it, 0, 0, TILE);
      g.setPosition(col * TILE, row * TILE);
      if (mats.includes(it)) this.decoLayer.add(g);
      else this.worldLayer.addAt(g, this.worldLayer.getIndex(this.selectGfx));
      this.decoViews.set(it.uid, g);
      if (this.mode === 'decorate') {
        const ok = !dragging || !this.drag!.moved || canPlace(this.dojo, CONTENT.dojo, it.uid, col, row);
        const color = dragging ? (ok ? 0x5cd65c : 0xff3b30) : this.selected === it.uid ? 0xffd166 : 0xffffff;
        const alpha = dragging || this.selected === it.uid ? 1 : 0.25;
        this.selectGfx.lineStyle(dragging || this.selected === it.uid ? 3 : 1.5, color, alpha).strokeRect(col * TILE + 1, row * TILE + 1, def.width * TILE - 2, def.height * TILE - 2);
        if (dragging) g.setAlpha(ok ? 0.85 : 0.5);
      }
    }
  }

  private redrawSpots(): void {
    this.spotGfx.clear();
    for (const s of this.dojo.spots) drawSpot(this.spotGfx, s, TILE);
  }

  // ---------------------------------------------------------------- screen buttons

  private renderUi(): void {
    this.ui.removeAll(true);
    this.uiRects = [];
    const { width, height } = this.scale.gameSize;
    const pad = 12;

    // A dark strip behind the title and buttons (the room scrolls underneath).
    this.ui.add(this.add.rectangle(0, 0, width, TOP, 0x14121c, 0.7).setOrigin(0));
    const title = this.text(pad, 8, 'Home Dojo', 20, '#f2e9d8', true, 'Georgia, serif');
    title.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.tapTitle());
    this.uiRects.push(title.getBounds());
    const chores = choresLeft(this.dojo);
    const status = chores > 0 ? `Tidy up: ${chores} left` : '✓ Spotless';
    this.text(pad + title.width + 12, 13, status, 13, chores > 0 ? '#e8d9b5' : '#bff5ec', true);
    if (this.dojo.calmMindRuns > 0) {
      const n = this.dojo.calmMindRuns;
      this.text(pad, 32, `Calm Mind · ${n} Tower run${n > 1 ? 's' : ''}`, 12, '#bff5ec', true);
    }

    if (this.mode === 'decorate') {
      this.button(width - pad - 90, 8, 90, 32, 'Done', 0x3aa57a, 15, () => this.setDecorating(false));
      const hint = this.selected ? 'Tap a spot to move it there, or use the arrows' : 'Tap a decoration to pick it';
      if (this.selected) {
        this.button(width - pad - 90 - 8 - 110, 8, 110, 32, 'Put away', 0x6b3a3a, 14, () => this.putAway());
        this.renderArrows(width, height);
      }
      this.text(width / 2, TOP + 6, hint, 14, '#fff6e0', true).setOrigin(0.5, 0).setStroke('#14121c', 5);
      this.renderTray(width, height);
    } else if (this.mode === 'play') {
      this.button(width - pad - 80, 8, 80, 32, 'Board', 0x4a3f63, 14, () => this.goBoard());
      this.button(width - pad - 80 - 8 - 100, 8, 100, 32, 'Decorate', 0x8a5a35, 14, () => this.setDecorating(true));
    }
  }

  /** Big arrow buttons (bottom-right, above the tray) for the selected decoration. */
  private renderArrows(width: number, height: number): void {
    const gap = 6;
    const x0 = width - 12 - 3 * ARROW - 2 * gap;
    const y0 = height - TRAY - 10 - 3 * ARROW - 2 * gap;
    const step = ARROW + gap;
    const it = this.dojo.items.find((x) => x.uid === this.selected);
    const wall = it ? decorationDef(CONTENT.dojo, it.id).place === 'wall' : false;
    if (!wall) this.button(x0 + step, y0, ARROW, ARROW, '▲', 0x3a3a4a, 22, () => this.nudge(0, -1));
    this.button(x0, y0 + step, ARROW, ARROW, '◀', 0x3a3a4a, 22, () => this.nudge(-1, 0));
    this.button(x0 + 2 * step, y0 + step, ARROW, ARROW, '▶', 0x3a3a4a, 22, () => this.nudge(1, 0));
    if (!wall) this.button(x0 + step, y0 + 2 * step, ARROW, ARROW, '▼', 0x3a3a4a, 22, () => this.nudge(0, 1));
  }

  /** Stored decorations, as chips along the bottom. Tap one to place it. */
  private renderTray(width: number, height: number): void {
    const y = height - TRAY + 8;
    this.ui.add(this.add.rectangle(0, height - TRAY, width, TRAY, 0x14121c, 0.85).setOrigin(0));
    this.uiRects.push(new Phaser.Geom.Rectangle(0, height - TRAY, width, TRAY));
    const stored = this.dojo.items.filter((it) => it.col === null);
    if (stored.length === 0) {
      this.text(width / 2, y + 18, 'Everything is out! Find more decorations in Tower chests.', 13, '#b9ad99').setOrigin(0.5);
      return;
    }
    this.text(12, y - 2, 'In storage (tap to place):', 11, '#b9ad99');
    const groups = new Map<string, DojoItem[]>();
    for (const it of stored) groups.set(it.id, [...(groups.get(it.id) ?? []), it]);
    let x = 12;
    for (const [id, items] of groups) {
      const def = decorationDef(CONTENT.dojo, id);
      const label = items.length > 1 ? `${def.name} ×${items.length}` : def.name;
      const w = Math.max(90, label.length * 7.5 + 20);
      if (x + w > width - 12) break;
      this.button(x, y + 14, w, 38, label, 0x2a2536, 13, () => this.takeOut(items[0].uid));
      x += w + 6;
    }
  }

  private makeChoreButton(): void {
    const face = this.add.circle(0, 0, CHORE_RADIUS, 0x3aa57a).setStrokeStyle(4, 0xffffff, 0.6);
    this.choreLabel = this.add
      .text(0, 0, '', { fontFamily: FONT, fontStyle: 'bold', fontSize: '14px', color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
      .setResolution(crisp());
    this.choreButton = this.add.container(0, 0, [face, this.choreLabel]).setDepth(21).setVisible(false);
    face.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.doChore());
  }

  private onUi(x: number, y: number): boolean {
    if (this.choreButton.visible && Math.hypot(x - this.choreButton.x, y - this.choreButton.y) <= CHORE_RADIUS + 6) return true;
    return this.uiRects.some((r) => r.contains(x, y));
  }

  // ---------------------------------------------------------------- hidden testing screen

  private tapTitle(): void {
    const now = this.time.now;
    this.titleTaps = [...this.titleTaps.filter((t) => now - t < 2500), now];
    if (this.titleTaps.length >= 5 && this.mode !== 'arriving') {
      this.titleTaps = [];
      this.openTesting();
    }
  }

  /** Testing only: fast-forward time to watch mess build, clean instantly, get every decoration. */
  private openTesting(): void {
    const before = this.mode;
    this.mode = 'menu';
    this.controls.reset();
    const { width, height } = this.scale.gameSize;
    const box = this.add.container(0, 0).setDepth(90);
    box.add(this.add.rectangle(0, 0, width, height, 0x0d0b14, 0.96).setOrigin(0).setInteractive());
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (box.add(o), o);
    const text = (x: number, y: number, s: string, size: number, color: string, bold = false) =>
      add(this.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal', wordWrap: { width: width - 40 } }).setResolution(crisp()));
    const btn = (x: number, y: number, w: number, label: string, color: number, onTap: () => void) => {
      const bg = add(this.add.rectangle(x, y, w, 36, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.3).setInteractive());
      add(this.add.text(x + w / 2, y + 18, label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp()));
      bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onTap);
    };
    const close = () => {
      box.destroy();
      this.mode = before === 'menu' ? 'play' : before;
      this.renderUi();
    };
    const pad = 18;
    text(pad, pad, 'Dojo testing', 20, '#ff9f6b', true);
    const level = Math.round(messLevel(this.dojo.messHours) * 100);
    text(pad, pad + 28, `Mess: ${level}% (${Math.round(this.dojo.messHours)} hours built up; full at ${DOJO.messFullAfterHours}) · chores left: ${choresLeft(this.dojo)} · Calm Mind runs: ${this.dojo.calmMindRuns}`, 12, '#b9ad99');
    text(pad, pad + 48, 'Fast-forward pretends you were away. You come back in through the door and bow, like a real return.', 12, '#b9ad99');
    const w = Math.min(170, (width - pad * 2 - 16) / 3);
    let y = pad + 84;
    const away = (hours: number) => {
      // Pretend the last visit was earlier, then walk back in for real.
      this.dojo.lastSeenMs = (this.dojo.lastSeenMs ?? Date.now()) - hours * HOUR;
      writeSave(this.profile);
      setBowDue(true);
      this.scene.restart();
    };
    btn(pad, y, w, '+1 day away', 0x3a7bd5, () => away(24));
    btn(pad + w + 8, y, w, '+3 days away', 0x3a7bd5, () => away(72));
    btn(pad + (w + 8) * 2, y, w, '+1 week away', 0x3a7bd5, () => away(168));
    y += 46;
    btn(pad, y, w, 'Clean everything', 0x3aa57a, () => {
      const calm = cleanAll(this.dojo);
      writeSave(this.profile);
      this.redrawDecorations();
      this.redrawSpots();
      close();
      if (calm) this.celebrateCalm();
    });
    btn(pad + w + 8, y, w, 'Get every decoration', 0x8a5a35, () => {
      addDecorations(this.dojo, CONTENT.dojo.decorations.filter((d) => d.source === 'tower').map((d) => d.id));
      writeSave(this.profile);
      close();
      this.toast('Every Tower decoration added to storage. Tap Decorate to place them.');
    });
    btn(pad + (w + 8) * 2, y, w, 'Start a new dojo', 0x6b3a3a, () => {
      this.profile.dojo = null;
      homeDojo(this.profile);
      writeSave(this.profile);
      setBowDue(true);
      this.scene.restart();
    });
    y += 54;
    text(pad, y, 'Student profiles and Power Rating: open the Board and tap its title 5 times.', 12, '#b9ad99');
    btn(pad, height - pad - 36, Math.min(200, width - pad * 2), 'Close', 0x5b4a3c, close);
  }

  // ---------------------------------------------------------------- layout and helpers

  private onResize(): void {
    this.layout();
    this.renderUi();
  }

  /** Zooms in so the view is VIEW_ROWS tiles tall, like the Tower. */
  private layout(): void {
    const { width, height } = this.scale.gameSize;
    this.zoom = height / (VIEW_ROWS * TILE);
    this.worldLayer.setScale(this.zoom);
    this.choreButton.setPosition(width - CHORE_RADIUS - 24, height - CHORE_RADIUS - 24);
    this.controls.layout();
    this.updateCamera(true);
  }

  /**
   * Moves the view toward what matters: the character, or the selected decoration while
   * decorating (unless the player dragged the view). The room's edges stay on screen.
   */
  private updateCamera(snap: boolean): void {
    const { width, height } = this.scale.gameSize;
    const room = CONTENT.dojo.room;
    const t = TILE * this.zoom;
    let target: Vec2 = this.cam;
    if (this.mode !== 'decorate') target = this.world.players.p1.pos;
    else if (!this.panned && this.selected) {
      const it = this.dojo.items.find((x) => x.uid === this.selected);
      if (it && it.col !== null && it.row !== null) {
        const def = decorationDef(CONTENT.dojo, it.id);
        target = { x: it.col + def.width / 2, y: it.row + def.height / 2 };
      }
    }
    const k = snap ? 1 : 0.15;
    const viewW = width / t;
    const viewH = height / t;
    const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
    const bottom = (this.mode === 'decorate' ? TRAY : 0) / t;
    const tx = clamp(target.x, viewW / 2, room.width - viewW / 2);
    const ty = clamp(target.y, viewH / 2 - TOP / t, room.height + bottom - viewH / 2);
    this.cam = { x: this.cam.x + (tx - this.cam.x) * k, y: this.cam.y + (ty - this.cam.y) * k };
    this.offX = width / 2 - this.cam.x * t;
    this.offY = height / 2 - this.cam.y * t;
    this.worldLayer.setPosition(this.offX, this.offY);
  }

  /** Screen point to room tiles. */
  private toTile(x: number, y: number): Vec2 {
    return { x: (x - this.offX) / this.zoom / TILE, y: (y - this.offY) / this.zoom / TILE };
  }

  private puff(s: MessSpot): void {
    const x = (s.col + 0.5 + s.dx) * TILE;
    const y = (s.row + 0.5 + s.dy) * TILE;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random();
      const c = this.add.circle(x, y, 3 + Math.random() * 3, s.kind === 'leaf' ? 0xd98b3a : 0xcfc6b4, 0.8);
      this.worldLayer.add(c);
      this.tweens.add({ targets: c, x: x + Math.cos(a) * TILE * 0.5, y: y + Math.sin(a) * TILE * 0.5 - 6, alpha: 0, scale: 0.4, duration: 380, ease: 'Cubic.Out', onComplete: () => c.destroy() });
    }
    const star = this.add.star(x, y, 4, 3, 9, 0xfff6e0).setAlpha(0.9);
    this.worldLayer.add(star);
    this.tweens.add({ targets: star, angle: 90, scale: 1.6, alpha: 0, duration: 420, onComplete: () => star.destroy() });
  }

  private sparkle(at: Vec2, count: number, color = 0xfff6e0): void {
    for (let i = 0; i < count; i++) {
      const s = this.add.star(at.x * TILE + (Math.random() - 0.5) * TILE * 1.4, at.y * TILE + (Math.random() - 0.5) * TILE * 1.2, 4, 2, 7, color);
      s.setScale(0.3);
      this.worldLayer.add(s);
      this.tweens.add({ targets: s, scale: 1.2, alpha: 0, angle: 120, y: s.y - 12, delay: i * 25, duration: 520, onComplete: () => s.destroy() });
    }
  }

  private ring(at: Vec2, color: number, radiusTiles: number): void {
    const c = this.add.circle(at.x * TILE, at.y * TILE, TILE * 0.4).setStrokeStyle(4, color, 0.9);
    this.worldLayer.add(c);
    this.tweens.add({ targets: c, radius: TILE * radiusTiles, alpha: 0, duration: 600, ease: 'Cubic.Out', onComplete: () => c.destroy() });
  }

  private toast(message: string): void {
    const { width, height } = this.scale.gameSize;
    const t = this.add
      .text(width / 2, height * 0.5, message, { fontFamily: FONT, fontStyle: 'bold', fontSize: '15px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 5, align: 'center', wordWrap: { width: width - 60 } })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setDepth(60);
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 400, onComplete: () => t.destroy() });
  }

  private text(x: number, y: number, str: string, size: number, color: string, bold = false, family = FONT): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, str, { fontFamily: family, fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' }).setResolution(crisp());
    this.ui.add(t);
    return t;
  }

  private button(x: number, y: number, w: number, h: number, label: string, color: number, size: number, onTap: () => void): void {
    const bg = this.add.rectangle(x, y, w, h, color).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35);
    this.ui.add(bg);
    this.text(x + w / 2, y + h / 2, label, size, '#ffffff', true).setOrigin(0.5);
    this.uiRects.push(new Phaser.Geom.Rectangle(x, y, w, h));
    bg.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      sfx.unlock();
      onTap();
    });
  }
}
