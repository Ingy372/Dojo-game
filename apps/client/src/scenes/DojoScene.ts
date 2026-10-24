import Phaser from 'phaser';
import {
  BOW,
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
  streetSmartsOpen,
  chooseDifficulty,
  PLAY_LIMIT_CHOICES,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { bowIsDue, homeDojo, setBowDue } from '../game/dojo';
import { loadSave, writeSave } from '../game/save';
import { DIFFICULTY_TEXT, ensureDifficulty } from '../game/difficulty';
import { PLAY_TIME_TEXT, touchPlayClock } from '../game/playTime';
import { bankRun, savedRun } from '../game/runSave';
import RESUME_TEXT from '../../../../content/settings/run-resume.json';
import streetUi from '../../../../content/street-smarts/ui.json';
import { currentTraining } from '../game/student';
import { startTowerRun } from '../game/tower';
import { TouchControls } from '../input/TouchControls';
import { addStatic, loadArt } from '../art/art';
import type { LayeredSprite } from '../art/LayeredSprite';
import { makePlayerSprite, playLocomotion } from '../art/player';
import { loadLook, playerPacks } from '../game/look';
import { bowPrompt, playBow } from '../ui/bow';
import { Celebrations } from '../ui/Celebrations';
import { FONT, crisp } from '../ui/theme';
import { NAMED_PACK } from '../game/named';
import { openMonsterJournal } from '../ui/MonsterJournal';

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
const ARROW = 60;
/** How the player likes to move decorations (remembered on this phone). */
type MoveStyle = 'tap' | 'arrows';
const MOVE_STYLE_KEY = 'dojo-ascent-move-style';
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
  private decoViews = new Map<string, Phaser.GameObjects.Container>();
  /** Dust, footprints and other mess on the floor. */
  private spotLayer!: Phaser.GameObjects.Container;
  /** Standing decorations and the character, drawn front-to-back by where they stand. */
  private standLayer!: Phaser.GameObjects.Container;
  private selectGfx!: Phaser.GameObjects.Graphics;
  private player!: Phaser.GameObjects.Container;
  /** The character's art, and a one-off move it's playing (sweep, wipe, straighten, bow). */
  private hero!: LayeredSprite;
  private heroAction: { name: string; until: number; face: Vec2 | null } | null = null;
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
  private moveStyle: MoveStyle | null = null;
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

  preload(): void {
    loadArt(this, [...playerPacks(), 'dojo', NAMED_PACK]);
  }

  create(): void {
    this.profile = loadSave();
    this.dojo = homeDojo(this.profile);
    this.training = currentTraining();
    const hoursAway = returnToDojo(this.dojo, CONTENT.dojo, Date.now());
    ensureDifficulty(this.profile, this.training);
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
    this.heroAction = null;

    this.room = dojoRoom(this.dojo, CONTENT.dojo);
    this.world = createWorld(this.room, ['p1']);
    this.world.players.p1.facing = { x: 0, y: -1 };
    this.prevPos = { ...this.world.players.p1.pos };
    this.cam = { ...this.world.players.p1.pos };
    this.panned = false;
    this.pan = null;
    this.moveStyle = loadMoveStyle();

    this.worldLayer = this.add.container(0, 0);
    const room = this.drawRoom();
    this.decoLayer = this.add.container(0, 0);
    this.spotLayer = this.add.container(0, 0);
    this.standLayer = this.add.container(0, 0);
    this.selectGfx = this.add.graphics();
    this.player = this.makePlayer();
    this.standLayer.add(this.player);
    // Bottom to top: the floor and back wall, mats, the mess on the floor, standing things
    // and the character, then the front wall (the character walks behind it), outlines and labels.
    this.worldLayer.add([...room.back, this.decoLayer, this.spotLayer, this.standLayer, ...room.front, this.selectGfx, ...room.labels]);
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
    // Time in the dojo is play time too (M7-P9's clock).
    touchPlayClock();
    this.time.addEvent({ delay: 5000, loop: true, callback: () => touchPlayClock() });

    if (!bowIsDue()) this.offerResume();
    if (bowIsDue()) {
      this.mode = 'arriving';
      bowPrompt(this, 'Bow as you enter your dojo', () => {
        this.heroDo('bow', BOW.ms);
        playBow(
          this,
          this.player,
          () => {
            setBowDue(false);
            this.arrive(hoursAway);
          },
          this.hero,
        );
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
      const line = chores > 0 ? "Your dojo is ready for a fresh sweep! Let's make it shine together." : 'Everything is just how you left it.';
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
    if (savedRun()) steps.push(() => this.offerResume(next));
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
      this.heroDo('sweep', 800);
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
    // Kneel and wipe, or reach out and straighten the rack, facing it.
    const p = this.world.players.p1.pos;
    const face = { x: center.x - p.x, y: center.y - p.y };
    if (chore.kind === 'wipe') this.heroDo('wipe', 1000, face);
    else this.heroDo('straighten', 1170, face);
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

  /** Opens the character screen to change the look (saved there; the dojo reopens after). */
  private changeLook(): void {
    if (this.leaving || this.mode !== 'play') return;
    this.leaving = true;
    this.cameras.main.fadeOut(250, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Create', { first: false }));
  }

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
      // The first time, ask how they like to move decorations.
      if (!this.moveStyle) this.time.delayedCall(0, () => this.chooseMoveStyle());
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
      if (!pan.moved && this.selected && this.moveStyle === 'tap') this.moveSelectedTo(this.toTile(pointer.x, pointer.y));
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

  /**
   * The wooden room from the art: the floor and back wall with the notice board, and the
   * front wall with the door, which is drawn in front of the character.
   */
  private drawRoom(): { back: Phaser.GameObjects.GameObject[]; front: Phaser.GameObjects.GameObject[]; labels: Phaser.GameObjects.GameObject[] } {
    const room = CONTENT.dojo.room;
    const [floor, board, front] = addStatic(this, 'dojo', 'room', 0, 0);
    const door = room.doors[0];
    const b = CONTENT.dojo.board;
    const label = (x: number, y: number, text: string, size: number) =>
      this.add
        .text(x, y, text, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color: '#fff6e0', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5, 0)
        .setResolution(crisp() * 2);
    return {
      back: [floor, board].filter(Boolean),
      front: [front].filter(Boolean),
      labels: [label(door.x * TILE, (door.y - 0.2) * TILE, 'TOWER', 11), label(b.col * TILE + TILE / 2, TILE + 2, 'BOARD', 10)],
    };
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const r = MOVEMENT.playerRadius * TILE;
    this.calmAura = this.add.circle(0, 0, r * 1.5, CALM, 0.18).setStrokeStyle(2, CALM, 0.6);
    this.tweens.add({ targets: this.calmAura, scale: 1.15, alpha: 0.5, duration: 1300, yoyo: true, repeat: -1 });
    this.calmAura.setY(-r * 0.4);
    this.hero = makePlayerSprite(this, this.training.belt, this.training.stripesThisBelt, loadLook())!;
    const p = this.world.players.p1.pos;
    return this.add.container(p.x * TILE, p.y * TILE, [this.calmAura, this.hero.container]);
  }

  /** Starts a one-off move for `ms` milliseconds, optionally facing a direction. */
  private heroDo(name: string, ms: number, face: Vec2 | null = null): void {
    this.heroAction = { name, until: this.time.now + ms, face };
    this.hero.play(name, { restart: this.hero.current !== name || name !== 'sweep' });
  }

  /** Walk or stand, unless a one-off move (sweep, wipe, straighten, bow) is playing. */
  private animateHero(): void {
    const p = this.world.players.p1;
    const a = this.heroAction;
    if (a && this.time.now > a.until) this.heroAction = null;
    if (this.heroAction?.face) this.hero.face(this.heroAction.face.x, this.heroAction.face.y);
    else this.hero.face(p.facing.x, p.facing.y);
    if (!this.heroAction) {
      const speed = Math.hypot(p.pos.x - this.prevPos.x, p.pos.y - this.prevPos.y) * TICKS_PER_SECOND;
      playLocomotion(this.hero, p.moving ? speed : 0);
    }
    this.hero.update();
  }

  private draw(blend: number): void {
    const p = this.world.players.p1;
    const x = Phaser.Math.Linear(this.prevPos.x, p.pos.x, blend);
    const y = Phaser.Math.Linear(this.prevPos.y, p.pos.y, blend);
    this.player.setPosition(x * TILE, y * TILE);
    this.standLayer.sort('y');
    this.animateHero();
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
    for (const v of this.decoViews.values()) v.destroy();
    this.decoViews.clear();
    this.decoLayer.removeAll(true);
    this.selectGfx.clear();
    const placed = this.dojo.items.filter((it) => it.col !== null && it.row !== null);
    for (const it of placed) {
      const def = decorationDef(CONTENT.dojo, it.id);
      const dragging = this.drag?.uid === it.uid;
      const col = dragging ? this.drag!.col : it.col!;
      const row = dragging ? this.drag!.row : it.row!;
      // Each decoration stands on the bottom-centre of its footprint.
      const view = this.add.container((col + def.width / 2) * TILE, (row + def.height) * TILE, this.decorationImages(it));
      // Mats lie under the dust; everything else stands with the character, front-to-back.
      if (def.clean === 'mat') this.decoLayer.add(view);
      else this.standLayer.add(view);
      this.decoViews.set(it.uid, view);
      if (this.mode === 'decorate') {
        const ok = !dragging || !this.drag!.moved || canPlace(this.dojo, CONTENT.dojo, it.uid, col, row);
        const color = dragging ? (ok ? 0x5cd65c : 0xff3b30) : this.selected === it.uid ? 0xffd166 : 0xffffff;
        const alpha = dragging || this.selected === it.uid ? 1 : 0.25;
        this.selectGfx.lineStyle(dragging || this.selected === it.uid ? 3 : 1.5, color, alpha).strokeRect(col * TILE + 1, row * TILE + 1, def.width * TILE - 2, def.height * TILE - 2);
        if (dragging) view.setAlpha(ok ? 0.85 : 0.5);
      }
    }
    this.standLayer.sort('y');
  }

  /**
   * A decoration's pictures: a scuffed mat gets its scuff marks on top (fading as it's
   * wiped), and a messy weapon rack shows 1 to 3 crooked weapons.
   */
  private decorationImages(it: DojoItem): Phaser.GameObjects.Image[] {
    const def = decorationDef(CONTENT.dojo, it.id);
    // Named-monster stickers are drawn in the named-monster pack.
    if (def.source === 'named') return addStatic(this, NAMED_PACK, it.id, 0, 0);
    if (def.clean === 'rack' && it.crooked > 0) return addStatic(this, 'dojo', `${it.id}-crooked`, 0, 0, it.crooked - 1);
    const images = addStatic(this, 'dojo', it.id, 0, 0);
    if (def.clean === 'mat' && it.scuffed) {
      for (const scuff of addStatic(this, 'dojo', `${it.id}-scuffed`, 0, 0)) images.push(scuff.setAlpha(1 - it.wipes / DOJO.wipeTaps));
    }
    return images;
  }

  /** The mess on the floor: dust, and (the "leaf" spots) muddy footprints, a towel or a water bottle. */
  private redrawSpots(): void {
    this.spotLayer.removeAll(true);
    const litter = ['footprints-1', 'footprints-2', 'towel', 'water-bottle'];
    for (const s of this.dojo.spots) {
      const id = s.kind === 'leaf' ? litter[s.id % litter.length] : `dust-${(s.id % 3) + 1}`;
      this.spotLayer.add(addStatic(this, 'dojo', id, (s.col + 0.5 + s.dx) * TILE, (s.row + 0.5 + s.dy) * TILE));
    }
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
      const arrows = this.moveStyle === 'arrows';
      // The arrows go first, so the top buttons (Done, Put away) always sit above them.
      if (this.selected && arrows) this.renderArrows(width, height);
      this.button(width - pad - 90, 8, 90, 32, 'Done', 0x3aa57a, 15, () => this.setDecorating(false));
      const hint = !this.selected ? 'Tap a decoration to pick it' : arrows ? 'Use the arrows to move it' : 'Now tap where it should go';
      this.button(width - pad - 90 - 8 - 110 - 8 - 130, 8, 130, 32, arrows ? 'Move: Arrows ⇄' : 'Move: Tap ⇄', 0x3a3a4a, 13, () => this.chooseMoveStyle());
      if (this.selected) {
        this.button(width - pad - 90 - 8 - 110, 8, 110, 32, 'Put away', 0x6b3a3a, 14, () => this.putAway());
      }
      this.text(width / 2, TOP + 6, hint, 14, '#fff6e0', true).setOrigin(0.5, 0).setStroke('#14121c', 5);
      this.renderTray(width, height);
    } else if (this.mode === 'play') {
      this.button(width - pad - 80, 8, 80, 32, 'Board', 0x4a3f63, 14, () => this.goBoard());
      this.button(width - pad - 80 - 8 - 100, 8, 100, 32, 'Decorate', 0x8a5a35, 14, () => this.setDecorating(true));
      this.button(width - pad - 80 - 8 - 100 - 8 - 70, 8, 70, 32, 'Look', 0x3a6ea5, 14, () => this.changeLook());
      this.button(width - pad - 80 - 8 - 100 - 8 - 70 - 8 - 90, 8, 90, 32, DIFFICULTY_TEXT.button, 0x3a3a4a, 14, () => this.openDifficulty());
      // A new young player was put on Guided for them: one line says so (M7-P1).
      if (this.profile.difficulty === 'guided' && !this.profile.difficultyChosenByPlayer) {
        this.text(pad, TOP + 6, DIFFICULTY_TEXT.homeLine, 14, '#fff6e0', true).setStroke('#14121c', 5);
      }
      if (streetSmartsOpen(this.training.tier, streetUi.unlockTier)) this.button(width - pad - 130, 46, 130, 32, streetUi.button, 0x3aa57a, 14, () => this.leaveTo('StreetSmarts', { id: 'store-separated' }));
      // The Monster Journal, from the belt where named monsters start showing up.
      if (this.training.tier >= CONTENT.named.rules.minBeltTier) {
        const x = width - pad - (streetSmartsOpen(this.training.tier, streetUi.unlockTier) ? 130 + 8 : 0) - 100;
        this.button(x, 46, 100, 32, CONTENT.named.journalButton, 0x6b5a2a, 14, () => this.openJournal());
      }
    }
  }

  /**
   * Big arrow buttons (bottom-right, above the tray) for the selected decoration: a cross
   * when there's room, or one row of big arrows on short screens (so they never shrink or
   * cover the top buttons).
   */
  private renderArrows(width: number, height: number): void {
    const gap = 8;
    const m = 14;
    const a = ARROW;
    const bottom = height - TRAY - 10;
    const cross = bottom - (3 * a + 2 * gap) - m >= TOP + 30;
    const it = this.dojo.items.find((x) => x.uid === this.selected);
    const wall = it ? decorationDef(CONTENT.dojo, it.id).place === 'wall' : false;
    const buttons: Array<[number, number, string, number, number]> = [];
    let px: number, py: number, pw: number, ph: number;
    if (cross) {
      const step = a + gap;
      const x0 = width - 12 - 3 * a - 2 * gap;
      const y0 = bottom - 3 * a - 2 * gap;
      if (!wall) buttons.push([x0 + step, y0, '▲', 0, -1]);
      buttons.push([x0, y0 + step, '◀', -1, 0], [x0 + 2 * step, y0 + step, '▶', 1, 0]);
      if (!wall) buttons.push([x0 + step, y0 + 2 * step, '▼', 0, 1]);
      [px, py, pw, ph] = [x0, y0, 3 * step - gap, 3 * step - gap];
    } else {
      const arrows: Array<[string, number, number]> = wall ? [['◀', -1, 0], ['▶', 1, 0]] : [['◀', -1, 0], ['▲', 0, -1], ['▼', 0, 1], ['▶', 1, 0]];
      const rowW = arrows.length * a + (arrows.length - 1) * gap;
      const x0 = width - 12 - rowW;
      const y0 = bottom - a;
      arrows.forEach(([label, dx, dy], i) => buttons.push([x0 + i * (a + gap), y0, label, dx, dy]));
      [px, py, pw, ph] = [x0, y0, rowW, a];
    }
    // A backing panel catches near-misses, so a missed arrow never lands on the floor.
    const panel = this.add.rectangle(px - m, py - m, pw + 2 * m, ph + 2 * m, 0x14121c, 0.55).setOrigin(0).setInteractive();
    this.ui.add(panel);
    this.uiRects.push(panel.getBounds());
    for (const [x, y, label, dx, dy] of buttons) this.button(x, y, a, a, label, 0x3a3a4a, 22, () => this.nudge(dx, dy));
  }


  /** The Monster Journal page (read-only keepsake). */
  private openJournal(): void {
    const before = this.mode;
    this.mode = 'menu';
    this.controls.reset();
    openMonsterJournal(this, loadSave().monsterJournal, () => {
      this.mode = before === 'menu' ? 'play' : before;
      this.renderUi();
    });
  }

  /** Settings: the difficulty choice (Guided / Steady / Challenge). Picking one makes it the player's own. */
  private openDifficulty(): void {
    const back = this.mode;
    this.mode = 'menu';
    this.controls.reset();
    const { width, height } = this.scale.gameSize;
    const box = this.add.container(0, 0).setDepth(70);
    const dim = this.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive();
    box.add(dim);
    const close = () => {
      box.destroy();
      this.mode = back === 'menu' ? 'play' : back;
      this.renderUi();
    };
    dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, close);
    const t = DIFFICULTY_TEXT;
    box.add(this.add.text(width / 2, height * 0.1, t.title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp()));
    const gap = 12;
    const n = t.choices.length;
    const w = Math.min(220, (width - 40 - gap * (n - 1)) / n);
    const h = Math.min(170, height * 0.5);
    const top = height * 0.1 + 44;
    const x0 = width / 2 - (n * w + (n - 1) * gap) / 2;
    const current = this.profile.difficulty ?? 'standard';
    t.choices.forEach((c, i) => {
      const x = x0 + i * (w + gap);
      const on = current === c.id;
      const bg = this.add.rectangle(x, top, w, h, 0x2a2536).setOrigin(0).setStrokeStyle(on ? 4 : 2, on ? 0xffd166 : 0xffffff, on ? 1 : 0.35).setInteractive();
      box.add(bg);
      box.add(this.add.text(x + w / 2, top + 18, (on ? '✓ ' : '') + c.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5, 0).setResolution(crisp()));
      box.add(this.add.text(x + w / 2, top + 54, c.text, { fontFamily: FONT, fontSize: '15px', color: '#e8d9b5', align: 'center', wordWrap: { width: w - 24 } }).setOrigin(0.5, 0).setResolution(crisp()));
      bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        sfx.unlock();
        sfx.place(true);
        chooseDifficulty(this.profile, c.id);
        writeSave(this.profile);
        close();
      });
    });
    box.add(this.add.text(width / 2, top + h + 14, t.footer, { fontFamily: FONT, fontSize: '14px', color: '#b9ad99' }).setOrigin(0.5, 0).setResolution(crisp()));
    // Grown-up settings sit behind a press-and-hold, so a tap by accident doesn't open them (M7-P9).
    const pt = PLAY_TIME_TEXT;
    const gw = 190;
    const gh = 34;
    const gx = width - 12 - gw;
    const gy = height - 12 - gh;
    const gate = this.add.rectangle(gx, gy, gw, gh, 0x3a3a4a).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.35).setInteractive();
    const fill = this.add.rectangle(gx, gy, 0, gh, 0x6b5a2a).setOrigin(0);
    const gateLabel = this.add.text(gx + gw / 2, gy + gh / 2, pt.grownUpButton, { fontFamily: FONT, fontStyle: 'bold', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp());
    box.add([gate, fill, gateLabel]);
    let hold: Phaser.Tweens.Tween | null = null;
    const stop = () => {
      hold?.stop();
      hold = null;
      fill.width = 0;
      gateLabel.setText(pt.grownUpButton);
    };
    gate.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      gateLabel.setText(pt.gateText);
      hold = this.tweens.add({
        targets: fill,
        width: gw,
        duration: pt.holdMs,
        onComplete: () => {
          hold = null;
          box.destroy();
          this.openPlayLimit(back);
        },
      });
    });
    gate.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, stop);
    gate.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, stop);
  }

  /** A run left open when the app closed (M7-P11): keep climbing from that room, or rest and keep the loot. */
  private offerResume(done?: () => void): void {
    const run = savedRun();
    if (!run) return;
    const t = RESUME_TEXT;
    const { width, height } = this.scale.gameSize;
    const back = this.mode === 'arriving' ? 'play' : this.mode;
    this.mode = 'menu';
    const box = this.add.container(0, 0).setDepth(80);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.8).setOrigin(0).setInteractive());
    const w = Math.min(460, width - 40);
    const h = 200;
    const left = (width - w) / 2;
    const top = (height - h) / 2;
    box.add(this.add.rectangle(left, top, w, h, 0x221d2e).setOrigin(0).setStrokeStyle(3, 0xffd166, 0.9));
    const label = (y: number, s: string, size: number, color: string, bold = false) =>
      this.add.text(width / 2, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: w - 32 } }).setOrigin(0.5, 0).setResolution(crisp());
    box.add(label(top + 18, t.title, 24, '#ffd166', true));
    box.add(label(top + 60, t.line.replace('{room}', String(run.depth + 1)).replace('{total}', String(run.totalRooms)), 16, '#f2e9d8'));
    const bw = (w - 48) / 2;
    const bh = 50;
    const by = top + h - bh - 20;
    const button = (x: number, text: string, color: number, onTap: () => void) => {
      const bg = this.add.rectangle(x, by, bw, bh, color).setOrigin(0).setStrokeStyle(2, 0xfff6e0, 0.5).setInteractive();
      box.add([bg, this.add.text(x + bw / 2, by + bh / 2, text, { fontFamily: FONT, fontStyle: 'bold', fontSize: '17px', color: '#fff6e0' }).setOrigin(0.5).setResolution(crisp())]);
      bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onTap);
    };
    button(left + 16, t.rest, 0x4a4a55, () => {
      // Bank it like a play-time rest: nothing found is lost.
      run.status = 'rested';
      bankRun(run, this.training);
      box.destroy();
      this.profile = loadSave();
      this.toast(t.restLine);
      if (done) done();
      else {
        this.mode = back;
        this.renderUi();
      }
    });
    button(left + 32 + bw, t.continue, 0x3aa57a, () => {
      this.leaving = true;
      this.cameras.main.fadeOut(400, 10, 8, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Game', { run }));
    });
  }

  /** Grown-up setting: the play-time limit (off / 15 / 30 / 45 / 60 minutes). */
  private openPlayLimit(back: Mode): void {
    const pt = PLAY_TIME_TEXT;
    const { width, height } = this.scale.gameSize;
    const box = this.add.container(0, 0).setDepth(70);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.85).setOrigin(0).setInteractive());
    const close = () => {
      box.destroy();
      this.mode = back === 'menu' ? 'play' : back;
      this.renderUi();
    };
    const w = Math.min(560, width - 40);
    box.add(this.add.text(width / 2, height * 0.08, pt.title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp()));
    const help = this.add.text(width / 2, height * 0.08 + 36, pt.help, { fontFamily: FONT, fontSize: '15px', color: '#e8d9b5', align: 'center', wordWrap: { width: w } }).setOrigin(0.5, 0).setResolution(crisp());
    box.add(help);
    const choices = PLAY_LIMIT_CHOICES;
    const gap = 10;
    const bw = Math.min(96, (w - gap * (choices.length - 1)) / choices.length);
    const bh = 44;
    const by = help.y + help.height + 18;
    const x0 = width / 2 - (choices.length * bw + (choices.length - 1) * gap) / 2;
    const draw = () => {
      box.list.filter((o) => o.getData('choice')).forEach((o) => o.destroy());
      choices.forEach((n, i) => {
        const on = this.profile.playLimitMinutes === n;
        const x = x0 + i * (bw + gap);
        const bg = this.add.rectangle(x, by, bw, bh, on ? 0x3aa57a : 0x2a2536).setOrigin(0).setStrokeStyle(on ? 3 : 2, on ? 0xffd166 : 0xffffff, on ? 1 : 0.35).setInteractive().setData('choice', true);
        const label = this.add.text(x + bw / 2, by + bh / 2, n === 0 ? pt.off : pt.minutes.replace('{n}', String(n)), { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp()).setData('choice', true);
        bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          sfx.place(true);
          this.profile.playLimitMinutes = n;
          writeSave(this.profile);
          draw();
        });
        box.add([bg, label]);
      });
    };
    draw();
    const dw = 140;
    const dy = Math.min(height - 12 - 40, by + bh + 22);
    const done = this.add.rectangle(width / 2 - dw / 2, dy, dw, 40, 0x3aa57a).setOrigin(0).setStrokeStyle(2, 0xffffff, 0.4).setInteractive();
    box.add([done, this.add.text(width / 2, dy + 20, pt.done, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setResolution(crisp())]);
    done.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, close);
  }

  /** Asks how the player likes to move decorations: tap the spot, or an arrow pad. */
  private chooseMoveStyle(): void {
    const back = this.mode;
    this.mode = 'menu';
    const { width, height } = this.scale.gameSize;
    const box = this.add.container(0, 0).setDepth(70);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.75).setOrigin(0).setInteractive());
    const title = this.add
      .text(width / 2, height * 0.12, 'How do you like to move decorations?', { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166' })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
    box.add(title);
    const w = Math.min(300, (width - 60) / 2);
    const h = Math.min(170, height * 0.5);
    const top = height * 0.12 + 44;
    const options: Array<[MoveStyle, string, string]> = [
      ['tap', 'Tap to move', 'Tap a decoration, then tap the spot where it should go.'],
      ['arrows', 'Arrow pad', 'Tap a decoration, then use big arrows to move it one step at a time.'],
    ];
    options.forEach(([style, name, text], i) => {
      const x = width / 2 + (i === 0 ? -w - 10 : 10);
      const on = this.moveStyle === style;
      const bg = this.add.rectangle(x, top, w, h, 0x2a2536).setOrigin(0).setStrokeStyle(on ? 4 : 2, on ? 0xffd166 : 0xffffff, on ? 1 : 0.35).setInteractive();
      box.add(bg);
      box.add(this.add.text(x + w / 2, top + 22, name, { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5, 0).setResolution(crisp()));
      box.add(this.add.text(x + w / 2, top + 58, text, { fontFamily: FONT, fontSize: '14px', color: '#e8d9b5', align: 'center', wordWrap: { width: w - 28 } }).setOrigin(0.5, 0).setResolution(crisp()));
      bg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        sfx.unlock();
        sfx.place(true);
        this.moveStyle = style;
        saveMoveStyle(style);
        box.destroy();
        this.mode = back === 'menu' ? 'decorate' : back;
        this.renderUi();
      });
    });
    box.add(this.add.text(width / 2, top + h + 14, 'You can change this any time with the "Move" button.', { fontFamily: FONT, fontSize: '12px', color: '#b9ad99' }).setOrigin(0.5, 0).setResolution(crisp()));
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

function loadMoveStyle(): MoveStyle | null {
  try {
    const v = localStorage.getItem(MOVE_STYLE_KEY);
    return v === 'tap' || v === 'arrows' ? v : null;
  } catch {
    return null;
  }
}

function saveMoveStyle(style: MoveStyle): void {
  try {
    localStorage.setItem(MOVE_STYLE_KEY, style);
  } catch {
    // Storage blocked: asked again next time.
  }
}
