import Phaser from 'phaser';
import {
  TICKS_PER_SECOND,
  bowAtMat,
  characterSetup,
  createWorld,
  holdAtMat,
  loadEnemy,
  matBowHere,
  modsFrom,
  newMatGate,
  practiceKatas,
  recordKataRun,
  type Facing as KataFacing,
  type KataDef,
  type MatGate,
  type PlayerInput,
  type Room,
  type Vec2,
  type WalkUpSpot,
} from '@dojo/sim';
import heavyBagJson from '../../../../content/dojo/action-zone/heavy-bag.json';
import { INSIDE, INSIDE_PACK } from '../game/actionZone';
import { CONTENT, KATAS, KATA_MOVES } from '../game/content';
import { reducedMotion } from '../game/motion';
import { loadSave, writeSave } from '../game/save';
import { currentTraining } from '../game/student';
import { kataPacks, loadLook } from '../game/look';
import { addStatic, loadArt, staticArt, staticSprites } from '../art/art';
import { addKataMoves } from '../art/player';
import { sfx } from '../audio/Sfx';
import { ActionButtons } from '../input/ActionButtons';
import { closeX, openBoardReader } from '../ui/boardReader';
import { KataMenu, KataPad } from '../ui/kataPractice';
import { playBow } from '../ui/bow';
import { addExitCue } from '../ui/exitCue';
import { StarWall } from '../ui/starWall';
import { FONT, crisp, view } from '../ui/theme';
import { WalkUpButton } from '../ui/walkUpButton';
import { TILE, WalkScene, type Facing } from './WalkScene';

/**
 * The Action Zone dojo, inside (A4-DOJO-i). One room, drawn from the artist's pieces:
 * floor, walls and props at the back; then everything that stands (props, the wings, the hero)
 * sorted by the row it stands on; then the seat backs and bag tops, which show only while the
 * hero is north of them; then the front wall, which is always on top. The door at the bottom leads
 * back outside (A4-DOJO-ii), where you stand at the double doors; a glowing mat with an arrow marks it.
 *
 * Nov 20 (Jay): walking up to something shows a big button, bottom right:
 * - Read at the Class Creed and the belt verse board: the board opens large, with an X to close.
 * - Bow at the mat's edge: bow facing the mat to step on; turn back to the mat and bow to step off.
 * - Throw at the yellow targets: the Star Wall game.
 * - Train at a punching bag: the fight buttons appear and the bags take hits forever (like the practice dummy).
 * - Practice Kata in the middle of the floor logo: pick a kata you have reached, then tap the direction and the
 *   technique for each move while the hero performs it (ui/kataPractice.ts).
 */
/**
 * Q-PREMIUM-2 QA: the exit glow's middle and height, in tiles. The exit rectangle (inside-room.json) starts 0.1 tile
 * inside the glow's top edge, so a tap anywhere on the glow walks the hero into the exit. A test pins the pair.
 */
export const EXIT_CUE_Y = 18.2;
export const EXIT_CUE_H = 0.8;

/** How close (tiles, from the hero's feet to the thing's footprint) the hero must be for its button. */
const NEAR = 1.3;
/** Bag practice ends by itself once the hero walks this far from every bag. */
const TRAIN_LEAVE = 3.5;
const HEAVY_BAG = loadEnemy(heavyBagJson);
/** Kata practice: how far one beat steps the hero (tiles), how far from the logo's middle it may wander, and its speed. */
const KATA_STEP = 0.3;
const KATA_ROAM = 1.6;
const KATA_SPEED = 0.09;
/** The hero's Open Leg Stance for kata (the fight stance stands in if the kata art isn't loaded). */
const KATA_READY_ANIM = 'kata_open_leg';
const KATA_READY_FALLBACK = 'stance_rooted';
const KATA_VEC: Record<KataFacing, Vec2> = { F: { x: 0, y: -1 }, B: { x: 0, y: 1 }, L: { x: -1, y: 0 }, R: { x: 1, y: 0 } };

type Mode = 'walk' | 'bow' | 'read' | 'game' | 'train' | 'kata';

const distToRect = (p: Vec2, r: readonly [number, number, number, number]): number =>
  Math.hypot(Math.max(r[0] - p.x, 0, p.x - r[1]), Math.max(r[2] - p.y, 0, p.y - r[3]));
const centre = (s: WalkUpSpot): Vec2 => ({ x: (s.footprint[0] + s.footprint[1]) / 2, y: (s.footprint[2] + s.footprint[3]) / 2 });

export class InsideScene extends WalkScene {
  /** Seat backs and bag tops, each hidden unless the hero's feet are north of its sort row. */
  private tops: Array<{ images: Phaser.GameObjects.Image[]; sortRow: number }> = [];
  /** Every sprite's images by id (the bags swing when hit). */
  private sprites = new Map<string, Phaser.GameObjects.Image[]>();
  private gate: MatGate = newMatGate();
  private mode: Mode = 'walk';
  private walkUp!: WalkUpButton;
  private buttons: ActionButtons | null = null;
  private trainClose: Phaser.GameObjects.Container | null = null;
  private comboText: Phaser.GameObjects.Text | null = null;
  private combo = 0;
  private comboAt = 0;
  /** Enemy id -> bag sprite id, while training. */
  private bagOf = new Map<string, string>();
  private heroAction: string | null = null;
  private heldHintAt = -1e9;
  private refusedHint = false;
  /** The room the rules step: the plain room, or (while training) the one with the bags as targets. */
  private activeRoom: Room = INSIDE.room;
  /** Kata practice: the pad while playing, where the hero is stepping to, and whether it holds the Open Leg Stance. */
  private kataPad: KataPad | null = null;
  private kataTarget: Vec2 | null = null;
  private kataReady = false;
  /** A front kick's step forward still to hand over to the hero's position when the next move starts (tiles). */
  private kataPendingStep: Vec2 | null = null;
  /** The kata moves' art has been added to the hero (loaded when Practice Kata is first tapped). */
  private kataArtReady = false;

  constructor() {
    super('ActionZoneInside');
  }

  preload(): void {
    super.preload();
    for (const s of INSIDE.spots) if (s.image) this.load.image(`board-${s.image}`, `boards/${s.image}.webp`);
  }

  create(data?: unknown): void {
    this.activeRoom = INSIDE.room;
    this.mode = 'walk';
    this.gate = newMatGate();
    this.buttons = null;
    this.trainClose = null;
    this.heroAction = null;
    this.combo = 0;
    this.refusedHint = false;
    this.kataPad = null;
    this.kataTarget = null;
    this.kataReady = false;
    this.kataPendingStep = null;
    this.kataArtReady = false;
    super.create(data);
    this.walkUp = new WalkUpButton(this);
    this.comboText = this.add
      .text(0, 0, '', { fontFamily: FONT, fontStyle: 'bold', fontSize: '26px', color: '#fff6e0', stroke: '#14121c', strokeThickness: 6 })
      .setOrigin(0.5, 0)
      .setResolution(crisp())
      .setDepth(70)
      .setAlpha(0);
    const relayout = () => {
      this.walkUp.layout();
      this.buttons?.layout();
      this.comboText?.setPosition(view(this).width / 2, 12);
    };
    relayout();
    this.scale.on(Phaser.Scale.Events.RESIZE, relayout);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, relayout));
  }

  protected room(): Room {
    return this.activeRoom;
  }

  protected roomPacks(): string[] {
    return [INSIDE_PACK];
  }

  protected spawn(): { pos: Vec2; facing: Facing } {
    return { pos: INSIDE.spawn, facing: 'north' };
  }

  protected drawRoom(): void {
    this.tops = [];
    this.sprites.clear();
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
      this.sprites.set(id, images);
      const row = topRow.get(id);
      if (row !== undefined) {
        this.tops.push({ images, sortRow: row });
        tops.push(images);
      } else {
        for (const img of images) img.setDepth(s.sortRow * TILE);
        this.standLayer.add(images);
      }
    }
    // The way out: a glow on the floor in front of the door with an arrow pointing at it, drawn
    // under the hero and the props.
    const [x0, x1] = INSIDE.exit;
    const cue = addExitCue(this, ((x0 + x1) / 2) * TILE, EXIT_CUE_Y * TILE, (x1 - x0) * TILE, EXIT_CUE_H * TILE, 'down', 22);
    // Bottom to top: floor, walls, props; the exit cue; what stands and the hero; seat backs and
    // bag tops; the front wall.
    const topLayer = this.add.container(0, 0, tops.flat());
    this.worldLayer.add([floorImg, wallsImg, propsImg, cue, this.standLayer, topLayer, frontWall].filter(Boolean));
  }

  protected onDraw(heroRow: number): void {
    // A seat back or bag top covers the hero only while the hero stands north of it.
    for (const t of this.tops) {
      const show = heroRow < t.sortRow;
      for (const img of t.images) if (img.visible !== show) img.setVisible(show);
    }
    if (this.mode === 'kata') this.kataPad?.update();
    if (this.mode === 'train') {
      this.buttons?.update(this.world.players.p1);
      if (this.combo > 0 && this.time.now - this.comboAt > 1800) {
        this.combo = 0;
        this.tweens.add({ targets: this.comboText, alpha: 0, duration: 300 });
      }
    }
  }

  protected overUi(x: number, y: number): boolean {
    if (this.walkUp?.contains(x, y)) return true;
    if (this.mode !== 'train') return false;
    if (this.buttons?.contains(x, y)) return true;
    const c = this.trainClose;
    return !!c && Math.hypot(x - c.x, y - c.y) < 40;
  }

  protected heroBusy(): boolean {
    if (this.mode === 'kata') {
      // The hero holds each kata move's finished pose until the next tap (the moves end on it); before the first
      // move it stands in the Open Leg Stance. Walking animations never play.
      const holds = this.heroAction?.startsWith('kata_');
      if (this.heroAction && (this.hero.current !== this.heroAction || (this.hero.finished && !holds))) this.heroAction = null;
      if (!this.heroAction && this.kataReady) this.hero.play(this.hero.has(KATA_READY_ANIM) ? KATA_READY_ANIM : this.hero.has(KATA_READY_FALLBACK) ? KATA_READY_FALLBACK : 'idle');
      return true;
    }
    if (!this.heroAction) return false;
    if (this.hero.current === this.heroAction && !this.hero.finished) return true;
    this.heroAction = null;
    return false;
  }

  private heroDo(name: string, from?: number): void {
    if (!this.hero.has(name)) return;
    this.heroAction = name;
    this.hero.play(name, { restart: true, from });
  }

  protected onInput(input: PlayerInput): void {
    if (this.mode === 'train') {
      const action = this.buttons?.takeAction();
      if (action) input.action = action;
    }
  }

  protected afterTick(p: Vec2): void {
    const me = this.world.players.p1;
    // The mat's edge: no stepping on or off without the bow.
    if (INSIDE.matBow && holdAtMat(INSIDE.matBow, this.gate, me.pos)) {
      me.path = null;
      if (this.mode === 'walk' && this.time.now - this.heldHintAt > 3500) {
        this.heldHintAt = this.time.now;
        this.say(this.gate.onMat ? 'Turn and bow to the mat first' : 'Bow before you step on the mat');
      }
    }
    if (this.mode === 'train') this.trainTick();
    if (this.mode === 'kata') this.kataTick();

    const [x0, x1, y0, y1] = INSIDE.exit;
    if (this.mode !== 'train' && p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) {
      this.walkUp.hide();
      this.leave('ActionZoneOutside', { from: 'inside' });
      return;
    }
    this.offerButton(me.pos);
  }

  /** Shows the button for what the hero stands at (the mat's edge first), or hides it. */
  private offerButton(pos: Vec2): void {
    if (this.mode !== 'walk' || this.leaving) {
      this.walkUp.hide();
      return;
    }
    const bow = INSIDE.matBow ? matBowHere(INSIDE.matBow, this.gate, pos) : null;
    if (bow) {
      this.walkUp.show('Bow', () => this.bow(bow));
      return;
    }
    const k = INSIDE.kataSpot;
    if (k && Math.hypot(pos.x - k.center.x, pos.y - k.center.y) <= k.radius) {
      this.walkUp.show('Practice\nKata', () => this.kataMenu());
      return;
    }
    let best: WalkUpSpot | null = null;
    let bestD = NEAR;
    for (const s of INSIDE.spots) {
      if (s.kind !== 'read' && s.kind !== 'target-wall' && s.kind !== 'heavy-bag') continue;
      const d = distToRect(pos, s.footprint);
      if (d < bestD) {
        best = s;
        bestD = d;
      }
    }
    if (!best) {
      this.walkUp.hide();
      return;
    }
    const spot = best;
    if (spot.kind === 'read') this.walkUp.show('Read', () => this.read(spot));
    else if (spot.kind === 'target-wall') this.walkUp.show('Throw', () => this.starWall());
    else this.walkUp.show('Train', () => this.train());
  }

  /** A short line over the hero's head. */
  private say(line: string): void {
    const p = this.world.players.p1.pos;
    const t = this.add
      .text(p.x * TILE, (p.y - 1.6) * TILE, line, { fontFamily: FONT, fontStyle: 'bold', fontSize: '11px', color: '#fff6e0', stroke: '#14121c', strokeThickness: 4, align: 'center' })
      .setOrigin(0.5, 1)
      .setResolution(crisp() * 2)
      .setDepth(1e6);
    this.worldLayer.add(t);
    this.tweens.add({ targets: t, y: t.y - 10, alpha: { from: 1, to: 0 }, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }

  // ---------- the bow at the mat ----------

  private bow(which: 'enter' | 'leave'): void {
    const me = this.world.players.p1;
    this.mode = 'bow';
    this.paused = true;
    me.path = null;
    this.controls.reset();
    // Leaving, the hero turns around to face the mat before bowing.
    me.facing = { x: 0, y: -1 };
    this.heroAction = this.hero.has('bow') ? 'bow' : null;
    playBow(
      this,
      this.player,
      () => {
        bowAtMat(this.gate, which);
        this.heroAction = null;
        this.paused = false;
        this.mode = 'walk';
      },
      this.hero,
    );
  }

  // ---------- the wall boards ----------

  private read(spot: WalkUpSpot): void {
    this.mode = 'read';
    this.paused = true;
    this.world.players.p1.path = null;
    this.controls.reset();
    openBoardReader(this, `board-${spot.image}`, () => {
      this.paused = false;
      this.mode = 'walk';
    });
  }

  // ---------- the star wall ----------

  private starWall(): void {
    this.mode = 'game';
    this.paused = true;
    this.world.players.p1.path = null;
    this.controls.reset();
    new StarWall(this, () => {
      this.paused = false;
      this.mode = 'walk';
    });
  }

  // ---------- kata practice ----------

  private kataMenu(): void {
    const training = currentTraining();
    const katas = practiceKatas(KATAS, training.belts.map((b) => b.id), training.belt.id, KATA_MOVES);
    if (katas.length === 0) {
      this.say('Your kata will be here soon');
      return;
    }
    this.mode = 'game';
    this.paused = true;
    this.world.players.p1.path = null;
    this.controls.reset();
    // The kata moves' art is only fetched the first time (it isn't needed anywhere else).
    if (!this.kataArtReady) {
      const look = loadLook();
      if (addKataMoves(this, this.hero, look)) this.kataArtReady = true;
      else {
        this.say('Getting ready...');
        loadArt(this, kataPacks(look));
        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
          this.kataArtReady = addKataMoves(this, this.hero, look);
          if (this.mode === 'game') this.openKataMenu(katas, training);
        });
        this.load.start();
        return;
      }
    }
    this.openKataMenu(katas, training);
  }

  private openKataMenu(katas: KataDef[], training: ReturnType<typeof currentTraining>): void {
    new KataMenu(
      this,
      katas,
      new Map(katas.map((k) => [k.id, training.belts.find((b) => `${b.id}-kata` === k.requirement)])),
      loadSave().kataBests,
      (kata, timeTrial) => this.startKata(kata, timeTrial),
      () => {
        this.paused = false;
        this.mode = 'walk';
      },
    );
  }

  /** The hero steps to the logo's middle, faces the front, bows in and takes the Open Leg Stance; then the pad shows. */
  private startKata(kata: KataDef, timeTrial: boolean): void {
    const k = INSIDE.kataSpot!;
    const me = this.world.players.p1;
    this.mode = 'kata';
    this.paused = true;
    this.controls.reset();
    me.path = null;
    me.facing = { ...KATA_VEC.F };
    this.kataReady = false;
    this.kataPendingStep = null;
    this.hero.setMirrored(false);
    this.kataTarget = { ...k.center };
    const pad = new KataPad(this, kata, KATA_MOVES, timeTrial, {
      face: (d) => {
        me.facing = { ...KATA_VEC[d] };
      },
      beat: (beat, move, index) => {
        me.facing = { ...KATA_VEC[beat.dir] };
        this.kataSettleStep();
        const name = beat.anim ?? move.anim;
        const travel = this.hero.art.animations[name]?.travel;
        // The art is drawn left foot forward: a right-foot-forward beat shows its mirror image. (A kick picks its
        // left- or right-leg art instead.)
        this.hero.setMirrored(beat.lead === 'R' && !travel);
        this.heroDo(name);
        const v = KATA_VEC[beat.dir];
        if (travel) {
          // A front kick steps forward a whole stance: its picture starts behind the feet point, so the hero's spot
          // moves up to meet it now, and the rest of the step is handed over when the next move starts.
          this.kataStepBy({ x: -v.x * travel.startOffset, y: -v.y * travel.startOffset });
          this.kataPendingStep = { x: v.x * travel.endOffset, y: v.y * travel.endOffset };
        } else {
          // Each move steps the hero a little the way it faces, staying on the logo.
          const from = this.kataTarget ?? me.pos;
          const nx = from.x + v.x * KATA_STEP;
          const ny = from.y + v.y * KATA_STEP;
          if (Math.hypot(nx - k.center.x, ny - k.center.y) <= KATA_ROAM) this.kataTarget = { x: nx, y: ny };
        }
        const at = { x: me.pos.x + v.x * 0.6, y: me.pos.y + v.y * 0.6 };
        this.sparks(at, beat.kiai ? 14 : 5, beat.kiai ? 0xffd166 : 0xffffff);
        if (beat.kiai) this.kiai();
        else if (index % 2 === 1 && !reducedMotion()) this.cameras.main.shake(60, 0.0015);
      },
      done: (wrong, ms) => this.finishKata(kata, timeTrial, wrong, ms),
      quit: () => this.stopKata(),
    });
    this.kataPad = pad;
    // The camera puts the logo's middle in the open space between the arrow pad and the technique buttons.
    this.lookAt = { x: k.center.x + (view(this).width / 2 - pad.freeCenterX) / (TILE * this.zoom), y: k.center.y };
    // Bow in once the hero stands in the middle.
    this.time.delayedCall(450, () => {
      if (this.kataPad !== pad) return;
      me.facing = { ...KATA_VEC.F };
      this.heroAction = this.hero.has('bow') ? 'bow' : null;
      playBow(
        this,
        this.player,
        () => {
          if (this.kataPad !== pad) return;
          this.heroAction = null;
          this.kataReady = true;
          this.say('Open Leg Stance');
          pad.start();
        },
        this.hero,
      );
    });
  }

  /** Moves the hero's spot at once (the picture already shows it there). */
  private kataStepBy(d: Vec2): void {
    const me = this.world.players.p1;
    me.pos = { x: me.pos.x + d.x, y: me.pos.y + d.y };
    if (this.kataTarget) this.kataTarget = { x: this.kataTarget.x + d.x, y: this.kataTarget.y + d.y };
  }

  /** Hands over the rest of a front kick's step (the held landing pose is drawn ahead of the hero's spot). */
  private kataSettleStep(): void {
    if (!this.kataPendingStep) return;
    this.kataStepBy(this.kataPendingStep);
    this.kataPendingStep = null;
  }

  private kataTick(): void {
    const me = this.world.players.p1;
    const t = this.kataTarget;
    if (!t) return;
    const dx = t.x - me.pos.x;
    const dy = t.y - me.pos.y;
    const d = Math.hypot(dx, dy);
    if (d <= KATA_SPEED) me.pos = { ...t };
    else me.pos = { x: me.pos.x + (dx / d) * KATA_SPEED, y: me.pos.y + (dy / d) * KATA_SPEED };
  }

  /** The spirit yell: big gold letters and a short shake. */
  private kiai(): void {
    const { width, height } = view(this);
    const t = this.add
      .text(width / 2, height * 0.32, 'KIAI!', { fontFamily: FONT, fontStyle: 'bold', fontSize: '44px', color: '#ffd166', stroke: '#14121c', strokeThickness: 8 })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setDepth(105);
    if (reducedMotion()) {
      this.time.delayedCall(700, () => t.destroy());
      return;
    }
    this.cameras.main.shake(140, 0.004);
    this.tweens.add({ targets: t, scale: { from: 1.6, to: 1 }, duration: 200, ease: 'Back.Out' });
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 16, delay: 600, duration: 300, onComplete: () => t.destroy() });
  }

  /** Back to the middle, face the front and bow out; then the result card. The bests are saved. */
  private finishKata(kata: KataDef, timeTrial: boolean, wrong: number, ms: number | null): void {
    const pad = this.kataPad;
    if (!pad) return;
    const profile = loadSave();
    const result = recordKataRun(profile.kataBests[kata.id], wrong, ms);
    profile.kataBests = { ...profile.kataBests, [kata.id]: result.best };
    writeSave(profile);
    const me = this.world.players.p1;
    this.time.delayedCall(350, () => {
      if (this.kataPad !== pad) return;
      this.kataSettleStep();
      this.kataTarget = { ...INSIDE.kataSpot!.center };
      this.hero.setMirrored(false);
      me.facing = { ...KATA_VEC.F };
      this.kataReady = false;
      this.heroAction = this.hero.has('bow') ? 'bow' : null;
      playBow(
        this,
        this.player,
        () => {
          if (this.kataPad !== pad) return;
          this.heroAction = null;
          sfx.kataDone();
          pad.showResult({
            wrong,
            ms,
            ...result,
            again: () => {
              this.stopKata();
              this.startKata(kata, timeTrial);
            },
            done: () => this.stopKata(),
          });
        },
        this.hero,
      );
    });
  }

  private stopKata(): void {
    this.kataPad?.destroy();
    this.kataPad = null;
    this.kataSettleStep();
    this.hero.setMirrored(false);
    this.kataTarget = null;
    this.kataReady = false;
    this.heroAction = null;
    this.lookAt = null;
    this.paused = false;
    this.mode = 'walk';
  }

  // ---------- the punching bags ----------

  private bagSpots(): WalkUpSpot[] {
    return INSIDE.spots.filter((s) => s.kind === 'heavy-bag');
  }

  /** Swaps in a world with (or without) the bags as practice targets, keeping where the hero stands. */
  private swapWorld(withBags: boolean): void {
    const old = this.world.players.p1;
    const bags = this.bagSpots();
    // While training, the bags' floor squares open up and each bag's round body is what the hero bumps into,
    // so it can be punched from every side.
    const walls = INSIDE.room.walls.map((row, y) =>
      row.map((wall, x) => wall && !(withBags && bags.some((b) => x + 1 > b.footprint[0] && x < b.footprint[1] && y + 1 > b.footprint[2] && y < b.footprint[3]))),
    );
    const room: Room = withBags ? { ...INSIDE.room, walls, enemySpawns: bags.map((b) => ({ enemy: HEAVY_BAG.id, pos: centre(b), wave: 1 })) } : INSIDE.room;
    const setup = characterSetup(loadSave(), currentTraining(), CONTENT.abilities);
    this.activeRoom = room;
    this.world = createWorld(room, ['p1'], {
      enemyTypes: withBags ? { [HEAVY_BAG.id]: HEAVY_BAG } : {},
      respawnEnemies: true,
      player: { ...setup, mods: modsFrom(setup.effects, TICKS_PER_SECOND) },
    });
    const me = this.world.players.p1;
    me.pos = { ...old.pos };
    me.facing = { ...old.facing };
    this.bagOf.clear();
    if (withBags) this.world.enemies.forEach((e, i) => this.bagOf.set(e.id, bags[i].id));
  }

  private train(): void {
    this.mode = 'train';
    this.swapWorld(true);
    this.combo = 0;
    if (!this.buttons) {
      this.buttons = new ActionButtons(this, () => sfx.unlock(), { virtue: !!this.world.players.p1.virtue });
      this.buttons.layout();
    }
    this.buttons.enable();
    this.trainClose = closeX(this, () => this.stopTraining());
    this.say('Punch the bag! STRIKE when the ring is full.');
  }

  private stopTraining(): void {
    if (this.mode !== 'train') return;
    this.mode = 'walk';
    this.buttons?.disable();
    this.trainClose?.destroy();
    this.trainClose = null;
    this.combo = 0;
    this.comboText?.setAlpha(0);
    this.swapWorld(false);
    // Standing where a bag's square closes again: step out in front of the nearest bag.
    const me = this.world.players.p1;
    if (INSIDE.room.walls[Math.floor(me.pos.y)]?.[Math.floor(me.pos.x)] !== false) {
      const near = this.bagSpots().sort((a, b) => Math.hypot(me.pos.x - centre(a).x, me.pos.y - centre(a).y) - Math.hypot(me.pos.x - centre(b).x, me.pos.y - centre(b).y))[0];
      if (near) me.pos = { x: near.approachTile.x + 0.5, y: near.approachTile.y + 0.5 };
    }
  }

  private trainTick(): void {
    const me = this.world.players.p1;
    // The dojo keeps its bags full: they never run out.
    for (const e of this.world.enemies) e.health = e.def.maxHealth;
    for (const ev of this.world.events) {
      switch (ev.kind) {
        case 'playerAttack': {
          const e = this.world.enemies.find((o) => o.id === ev.enemyId);
          const bag = this.bagOf.get(ev.enemyId);
          if (!e || !bag) break;
          const heavy = ev.move !== 'basic';
          if (ev.move === 'basic' && !me.moving && !this.heroAction) this.heroDo('jab');
          else if (ev.move === 'strike') this.heroDo('strike');
          if (heavy) sfx.strike();
          else sfx.hit();
          this.swing(bag, me.pos.x < e.pos.x ? 1 : -1, heavy);
          this.sparks(e.pos, heavy ? 12 : 5, heavy ? 0xffd166 : 0xffffff);
          this.floatNumber(e.pos, `${ev.damage}`, heavy ? '#7fd4ff' : '#ffffff', heavy ? 15 : 11);
          this.combo++;
          this.comboAt = this.time.now;
          if (this.combo >= 2 && this.comboText) {
            this.comboText.setText(`${this.combo} hits`).setAlpha(1);
            if (!reducedMotion()) this.tweens.add({ targets: this.comboText, scale: { from: 1.15, to: 1 }, duration: 120 });
          }
          break;
        }
        case 'counterPressed':
          this.heroDo('counter', 8);
          break;
        case 'dash':
          sfx.dash();
          break;
        case 'strikeRefused':
          this.buttons?.refuse('strike');
          if (!this.refusedHint) {
            this.refusedHint = true;
            this.say(ev.reason === 'focus' ? 'Punch the bag to fill the ring' : 'Get closer to a bag');
          }
          break;
        default:
          break;
      }
    }
    // Walked away from the bags: practice is over.
    if (this.bagSpots().every((b) => Math.hypot(me.pos.x - centre(b).x, me.pos.y - centre(b).y) > TRAIN_LEAVE)) this.stopTraining();
  }

  /** The bag rocks on its base, away from the hit. */
  private swing(bag: string, dir: number, heavy: boolean): void {
    const images = [...(this.sprites.get(bag) ?? []), ...(this.sprites.get(`${bag}-top`) ?? [])];
    if (images.length === 0 || reducedMotion()) return;
    this.tweens.killTweensOf(images);
    const angle = dir * (heavy ? 9 : 4);
    this.tweens.add({
      targets: images,
      angle: { from: angle, to: 0 },
      duration: heavy ? 650 : 380,
      ease: 'Elastic.Out',
      easeParams: [1.2, 0.35],
    });
  }

  private sparks(at: Vec2, count: number, color: number): void {
    if (reducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = TILE * (0.4 + Math.random() * 0.5);
      const s = this.add.circle(at.x * TILE, (at.y - 0.8) * TILE, 1.5 + Math.random() * 2, color).setDepth(1e6);
      this.worldLayer.add(s);
      this.tweens.add({ targets: s, x: s.x + Math.cos(a) * dist, y: s.y + Math.sin(a) * dist, alpha: 0, duration: 240, ease: 'Cubic.Out', onComplete: () => s.destroy() });
    }
  }

  private floatNumber(at: Vec2, text: string, color: string, size: number): void {
    const t = this.add
      .text(at.x * TILE + (Math.random() - 0.5) * 16, (at.y - 1.3) * TILE, text, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color, stroke: '#14121c', strokeThickness: 3 })
      .setOrigin(0.5)
      .setResolution(crisp() * 2)
      .setDepth(1e6);
    this.worldLayer.add(t);
    this.tweens.add({ targets: t, y: t.y - TILE * 0.7, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }
}
