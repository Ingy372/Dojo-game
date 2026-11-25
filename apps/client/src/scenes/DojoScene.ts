import Phaser from 'phaser';
import { reducedMotion, setReducedMotion } from '../game/motion';
import {
  BOW,
  COINS,
  EARN,
  DOJO,
  MOVEMENT,
  TICKS_PER_SECOND,
  addDecorations,
  noteBestStreak,
  openClassChests,
  payRealCoins,
  giveAchievementPieces,
  giveShopDecor,
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
  creditBlessing,
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
  activeDifficulty,
  challengeUnlocked,
  chooseDifficulty,
  PLAY_LIMIT_CHOICES,
} from '@dojo/sim';
import { sfx } from '../audio/Sfx';
import { LOCK_SHAKE, LOCKED_CARD, lockedLine, lockedTapFeedback, lockShakeOffset } from '../ui/lockCard';
import { music } from '../audio/Music';
import { addVolumeRow } from '../ui/VolumeRow';
import { CONTENT } from '../game/content';
import { SHOP, wornShop } from '../game/shop';
import { Companions, companionPacks } from '../game/companion';
import { bowIsDue, homeDojo, setBowDue } from '../game/dojo';
import { loadSave, writeSave } from '../game/save';
import { TOUR, senseiBubble, tourGlow, tourLine } from '../ui/homeTour';
import STORY from '../../../../content/tutorial/chapters.json';
import { showChapterCard } from '../ui/chapterCard';
import { cutsceneFrame } from '../ui/cutscene';
import { addLittleShade } from '../ui/maskedShade';
import { DIFFICULTY_TEXT, ensureDifficulty } from '../game/difficulty';
import { PLAY_TIME_TEXT, touchPlayClock } from '../game/playTime';
import { bankRun, savedRun } from '../game/runSave';
import RESUME_TEXT from '../../../../content/settings/run-resume.json';
import MOTION_TEXT from '../../../../content/settings/motion.json';
import streetUi from '../../../../content/street-smarts/ui.json';
import { baseFeed, currentTraining } from '../game/student';
import BELT_TEXT from '../../../../content/settings/belt-entry.json';
import { ageDojo, chapterReady, hoursForMess, applyBeltEntry, finishChapter, entryRank, feedEntry, fixBeltEntry, pickBelt, recordBeltEntry, type BeltEntry } from '@dojo/sim';
import { button as roundButton } from '../ui/button';
import { GREEN, MIN_TAP, RADIUS } from '../ui/tokens';
import { addDevDays, devDayOffset, localDay, noteLessonSeen, takeLesson } from '../game/lessons';
import { TouchControls } from '../input/TouchControls';
import { addStatic, addTinted, loadArt } from '../art/art';
import type { LayeredSprite } from '../art/LayeredSprite';
import { makePlayerSprite, playLocomotion } from '../art/player';
import { loadLook, playerPacks } from '../game/look';
import { systemMayShow } from '../ui/arrivalQueue';
import { bowGate, bowPrompt, playBow } from '../ui/bow';
import { Celebrations } from '../ui/Celebrations';
import { FONT, crisp, view, DPR, hiDpi } from '../ui/theme';
import { showGrownUpGate } from '../ui/grownUpGate';
import { BETA, wipeAllData } from '../game/beta';
import SAFE_TEXT from '../../../../content/settings/safety.json';
import { NAMED_PACK } from '../game/named';
import { isOpen, systemForToday } from '../game/unlocks';
import { PATH_WORDS as PW, fill } from '../ui/pathScreen';
import { drawTrainingStation } from '../ui/trainingStation';
import { CHEST_WORDS as CW, chestIcon, streakAura } from '../ui/classChest';

/** Pixels per tile in the room (before it's scaled to fit the screen). */
const TILE = 48;
/** Colour 2 of tinted decorations on White belt (A6 art rule). */
const WHITE_BELT_TINT = '#d2a878';
const TICK_MS = 1000 / TICKS_PER_SECOND;
const MAX_TICKS_PER_FRAME = 5;
const HOUR = 3_600_000;
/** Screen space taken by the title bar, and by the storage tray while decorating. */
const TOP = 48;
/** Q-PREMIUM-2 L2: door and sign labels in the Home Dojo are never smaller than this (px). */
const LABEL_PX = 14;
/** Q-PREM-F9: Decorate's top bar fits 44 pt buttons (8 + 44 + 8). */
const DECOR_TOP = 60;
/** Q-PREM-F9: the second button row (Street Smarts, Journal, Scroll) is 44 pt tall, 8 below the first row's tap zones. */
const ROW2_Y = 60;
const TRAY = 70;
/** How many tiles tall the view is (the camera follows the character, like in the Tower). */
const VIEW_ROWS = 6.5;
/**
 * Walking around, the view is this many rows tall under the top bar and follows the hero. Nov 18 it fitted
 * the whole room (10.1); Jay's playtest the same day: "zoomed back in some", so details read better.
 */
const PLAY_FIT_ROWS = 7.6;
/** The training station (tiles), in the top-right corner (Jay, Nov 18): its middle, its base row, and its left edge. */
const STATION = { x: 13, footY: 3, left: 12 } as const;
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
/** How long after the arrival cards close a new press is ignored (Q-PREM-F1). */
const ARRIVAL_QUIET_MS = 450;

export class DojoScene extends Phaser.Scene {
  private profile!: Profile;
  private dojo!: DojoState;
  private training!: TrainingState;
  private room!: Room;
  private world!: WorldState;
  private mode: Mode = 'play';
  /** Taps that land before this time are ignored, so the gesture that closed the last arrival card can't walk the hero (Q-PREM-F1). */
  private quietUntil = 0;

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
  /** Nov 22: the shop's pet and aura. */
  private companions: Companions | null = null;
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
  private restingNote: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Dojo');
  }

  /** Set when the Tower was asked for after today's play time ran out: the dojo says it's resting. */
  private restingOnArrival = false;
  /** Home Tour (Jay, Nov 18): the glowing spot and Sensei's bubble of the current stop. */
  private tourBits: Phaser.GameObjects.GameObject[] = [];
  private tourStarted = false;
  /** Story Chapters (Nov 24): the chapter card was offered on this visit; Sensei's bits for the open step; a top button to ring. */
  private storyOffered = false;
  private storyBits: Phaser.GameObjects.GameObject[] = [];
  private storyRing: 'Decorate' | 'Look' | null = null;
  /** While set, the camera looks here (tiles) instead of at the hero: a tour stop showing something. */
  private tourLook: Vec2 | null = null;
  private tourDoorWait = false;

  init(data?: { resting?: boolean; from?: string }): void {
    this.restingOnArrival = data?.resting === true;
  }

  preload(): void {
    loadArt(this, [...playerPacks(), ...companionPacks(), 'dojo', NAMED_PACK, ...new Set(CONTENT.dojo.decorations.flatMap((d) => (d.art ? [d.art] : [])))]);
  }

  create(): void {
    hiDpi(this.cameras.main);
    this.profile = loadSave();
    this.dojo = homeDojo(this.profile);
    this.training = currentTraining();
    const hoursAway = returnToDojo(this.dojo, CONTENT.dojo, Date.now());
    ensureDifficulty(this.profile, this.training.ageBand);
    noteBestStreak(this.profile, this.training.streakWeeks);
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
    // Nov 18: the training station in the top-right corner (its 2x2 floor tiles are solid). Jay approved its art.
    this.standLayer.add(drawTrainingStation(this, STATION.x * TILE, STATION.footY * TILE, TILE, PW.dojoWallLabel));
    // Bottom to top: the floor and back wall, mats, the mess on the floor, standing things
    // and the character, then the front wall (the character walks behind it), outlines and labels.
    this.worldLayer.add([...room.back, this.decoLayer, this.spotLayer, this.standLayer, ...room.front, this.selectGfx, ...room.labels]);
    // Nov 22: the shop's aura glows on the floor (under standing things) and the pet trots in the stand layer.
    const pos = this.world.players.p1.pos;
    this.companions = new Companions(this, pos.x * TILE, pos.y * TILE, TILE, 1, {
      tile: TILE,
      depth: 0,
      add: (g) => this.worldLayer.addAt(g, this.worldLayer.getIndex(this.standLayer)),
    }, (c) => this.standLayer.add(c));
    this.redrawDecorations();
    this.redrawSpots();

    this.controls = new TouchControls(
      this,
      this.cameras.main,
      (x, y) => this.toTile(x, y),
      (x, y) => this.mode !== 'play' || this.time.now < this.quietUntil || this.onUi(x, y),
      // The training station sits in the stick's corner: a press on it is a tap that walks there.
      (x, y) => this.onStation(this.rawTile(x, y)),
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

    // Scenes are reused on restart, so reset the bow gate here.
    this.bowShown = false;
    this.bowHoursAway = null;
    this.cardsOpen = 0;
    this.arriving = false;
    this.arrived = false;
    this.tourBits = [];
    this.tourStarted = false;
    this.storyOffered = false;
    this.storyBits = [];
    this.storyRing = null;
    this.tourLook = null;
    this.tourDoorWait = false;
    if (this.restingOnArrival) this.time.delayedCall(500, () => this.showResting());
    if (!bowIsDue() && this.profile.homeTour) this.time.delayedCall(450, () => this.runTour());
    else if (!bowIsDue()) this.time.delayedCall(700, () => this.runStory());
    if (!bowIsDue()) this.offerResume();
    // H3: with no bow (back from town, say), new pieces still arrive, with their card once the room is free.
    if (!bowIsDue()) {
      const pieces = this.newPiecesCard();
      if (pieces) {
        const show = (): void => {
          if (this.mode !== 'play' || this.cardsOpen > 0 || this.leaving) {
            this.time.delayedCall(300, show);
            return;
          }
          pieces(() => this.renderUi());
        };
        this.time.delayedCall(400, show);
      }
    }
    if (bowIsDue()) {
      this.bowHoursAway = hoursAway;
      this.tryBow();
    }
  }

  /**
   * Q-BOW-OVER-MENU: the due bow waits until no menu, panel, card or arrival sequence is open,
   * then shows once. `arriving` is owned by arrive() itself (not inferred from the mode), so the
   * "Welcome home" celebrations and every other arrival step hold the bow however arrive() is reached.
   */
  private bowHoursAway: number | null = null;
  private bowShown = false;
  private cardsOpen = 0;
  private arriving = false;
  /** Whether this scene's arrival steps already played (a later bow only bows). */
  private arrived = false;
  private tryBow(): void {
    if (this.bowHoursAway === null) return;
    const gate = bowGate({ due: bowIsDue(), menuOpen: this.mode !== 'play' || this.cardsOpen > 0, arriving: this.arriving, shown: this.bowShown });
    if (gate !== 'show') return;
    this.bowShown = true;
    const hoursAway = this.bowHoursAway;
    this.mode = 'arriving';
    bowPrompt(this, 'Bow as you enter your dojo', () => {
      this.heroDo('bow', BOW.ms);
      playBow(
        this,
        this.player,
        () => {
          setBowDue(false);
          // A bow that came due later (held through the arrival) shows once; after it, a new due bow may show again.
          this.bowShown = false;
          if (this.arrived) {
            this.mode = 'play';
            this.renderUi();
          } else this.arrive(hoursAway);
        },
        this.hero,
      );
    });
  }

  update(time: number, delta: number): void {
    if (!this.bowShown && this.bowHoursAway !== null) this.tryBow();
    // Grok playtest Nov 23 (H1): Sensei's waiting tour line ("Walk to your Training Station") sat over the
    // Decorate tray; it steps aside while decorating or in a menu.
    const tourShows = this.mode === 'play' || this.mode === 'arriving';
    for (const b of this.tourBits) if (b instanceof Phaser.GameObjects.Container && b.active) b.setVisible(tourShows || b.parentContainer !== null);
    if (this.mode !== 'play' || this.leaving) {
      this.controls.takeInput();
      this.elapsed = 0;
    } else {
      this.elapsed = Math.min(this.elapsed + delta, TICK_MS * MAX_TICKS_PER_FRAME);
      while (this.elapsed >= TICK_MS && this.mode === 'play' && !this.leaving) {
        this.prevPos = { ...this.world.players.p1.pos };
        const input: PlayerInput = this.controls.takeInput();
        // Home Tour door stop: the hero arrived standing in the doorway, so a push (or tap) toward the
        // door goes through it straight away. Grok playtest Nov 23 (B3): the same for every arrival on the
        // TOWN mat (before, the hero had to walk away from the door and back).
        if (this.tourDoorWait || !this.doorArmed) {
          const p = this.world.players.p1.pos;
          if ((input.kind === 'stick' && input.y > 0.3) || (input.kind === 'moveTo' && input.y > p.y + 0.3)) this.doorArmed = true;
        }
        stepWorld(this.world, this.room, { p1: input });
        this.elapsed -= TICK_MS;
        this.afterTick(time);
      }
    }
    this.draw(Math.min(1, this.elapsed / TICK_MS));
    this.updateCamera(false);
  }

  // ---------------------------------------------------------------- arriving

  /**
   * After the bow: a welcome card (first visit, or back after a while), then any real celebrations.
   * TUT-B4: a climb left open is asked about first. Picking it up leaves the rest (nothing is opened or
   * saved yet) for the bow on the way home; resting plays them all now.
   */
  private arrive(hoursAway: number): void {
    this.arriving = true;
    this.arrived = true;
    this.bowHoursAway ??= hoursAway;
    this.mode = 'arriving';
    if (savedRun()) this.offerResume(() => this.welcome(hoursAway));
    else this.welcome(hoursAway);
  }

  private welcome(hoursAway: number): void {
    this.mode = 'arriving';
    const name = this.training.displayName.split(' ')[0];
    const chores = choresLeft(this.dojo);
    const steps: Array<() => void> = [];
    const firstVisit = !this.dojo.welcomed;
    if (this.profile.homeTour === 'dojo') {
      // Home Tour: the tutorial floor's result first; Sensei's welcome comes as the tour's first stop.
      const s = this.profile.lastRun?.summary;
      const deco = [...(s?.decorations ?? []), ...(this.profile.lastRun?.earned ?? [])][0];
      const best = s?.items[0];
      const reward = best ? `You found: ${best.name}` : deco ? `For your dojo: ${decorationDef(CONTENT.dojo, deco).name}` : '';
      steps.push(() => this.card(TOUR.floorCleared, reward ? [reward] : ['Well done!'], 'Continue', next));
      // The old first-visit card and Sensei's "Welcome home" line are covered by the tour.
      noteLessonSeen('line-welcome-home', null);
      this.profile.lessons = loadSave().lessons;
      this.dojo.welcomed = true;
      writeSave(this.profile);
    } else if (firstVisit) {
      steps.push(() =>
        this.card('Your Home Dojo', [
          'This space is yours. Bow when you enter, keep it clean, and make it your own.',
          'Walk over dust to sweep it. Stand by a mat or the weapon rack to tidy it.',
          `${PW.tourBoard} ${PW.tourDoor}`,
        ], "Let's go!", next),
      );
      this.dojo.welcomed = true;
      writeSave(this.profile);
    } else if (hoursAway >= DOJO.welcomeBackHours) {
      const hello = ["It's so good to see you!", 'Your dojo is ready.', 'Ready to train?'][Math.floor(Math.random() * 3)];
      const line = chores > 0 ? "Your dojo is ready for a fresh sweep! Let's make it shine together." : 'Everything is just how you left it.';
      steps.push(() => this.card(`Welcome back, ${name}!`, [hello, line], chores > 0 ? "Let's clean up" : "Let's go!", next));
    }
    // LP-B3: a Class Chest for every real class: the next class piece, then gear for the bag.
    const t = this.training;
    const chests = openClassChests(this.profile, this.dojo, CONTENT, {
      checkIns: t.classCheckIns,
      classesInRank: t.gate.classesInRank,
      classesTotal: t.classesTotal,
      belt: { tier: t.belt.tier, color: t.belt.color },
    });
    if (chests.length > 0) {
      writeSave(this.profile);
      // Coins-only chests (a long time away) are counted in the coins line, not listed.
      const items = chests.flatMap((c) =>
        c.kind === 'decor' ? [fill(CW.decor, { name: decorationDef(CONTENT.dojo, c.id).name })] : c.kind === 'gear' ? [fill(CW.gear, { name: c.item.name })] : [],
      );
      const shown = items.slice(0, 3);
      if (items.length > 3) shown.push(fill(CW.more, { n: items.length - 3 }));
      if (chests.some((c) => c.kind === 'decor')) shown.push(CW.storage);
      shown.push(fill(CW.coins, { n: chests.length * COINS.classChest }));
      const title = chests.length === 1 ? CW.title : fill(CW.titleMany, { n: chests.length });
      steps.push(() => this.card(title, [CW.line, shown.join('\n')], CW.button, next, true));
    }
    // Nov 22: decorations bought in the Shop and in-game achievement trophies arrive in storage (each once).
    const pieces = this.newPiecesCard();
    if (pieces) steps.push(() => pieces(next));
    // OV-B5: new classes add Blessing runs once, in whichever screen sees them first.
    const blessingAdded = creditBlessing(this.profile.blessing, t.classCheckIns);
    writeSave(this.profile);
    const moments = rewardMoments(this.profile.seen, this.training, undefined, blessingAdded, CONTENT.abilities.families);
    if (moments.length > 0) {
      steps.push(() =>
        new Celebrations(this, moments, this.training, () => {
          this.profile.seen = snapshot(this.training);
          writeSave(this.profile);
          next();
        }),
      );
    }
    // Nov 23 (economy): real training pays the biggest coins, shown after its celebration. The very first look
    // only notes what was already earned (a long history doesn't pour in at once).
    steps.push(() => {
      const pay = payRealCoins(this.profile, this.training);
      writeSave(this.profile);
      if (pay.coins <= 0) return next();
      const lines: string[] = [];
      if (pay.promotions) lines.push(`New belt: +${(pay.promotions * EARN.promotion).toLocaleString()}`);
      if (pay.stripes) lines.push(`${pay.stripes === 1 ? 'A new stripe' : `${pay.stripes} new stripes`}: +${(pay.stripes * EARN.stripe).toLocaleString()}`);
      if (pay.tests) lines.push(`Approved to test: +${(pay.tests * EARN.testApproved).toLocaleString()}`);
      if (pay.signOffs) lines.push(`${pay.signOffs === 1 ? 'A sign-off' : `${pay.signOffs} sign-offs`}: +${(pay.signOffs * EARN.signOff).toLocaleString()}`);
      this.card('Hard work pays off!', [`Your training in class earned ${pay.coins.toLocaleString()} coins!`, lines.join('\n')], 'Awesome!', next, true);
    });
    // Welcome Week (M7-P7): at most one new system a day for an existing student, shared with the lessons.
    // G2B12-FIXES: not on the very first visit, so a new student isn't walked through five cards in a row.
    const system = systemMayShow({ firstVisit }) ? systemForToday(this.profile, this.training) : null;
    if (system) {
      writeSave(this.profile);
      steps.push(() => this.card('Sensei', system.screens, 'Okay!', next));
    }
    let i = 0;
    const next = (): void => {
      const step = steps[i++];
      if (step) step();
      else {
        // The tap that closed the last card can echo as a second press (a phone's copy-of-a-tap
        // mouse event, or a quick double tap). Drop it so it can't walk the hero or open the door.
        this.controls.reset();
        this.quietUntil = this.time.now + ARRIVAL_QUIET_MS;
        this.mode = 'play';
        this.arriving = false;
        this.renderUi();
        this.tryBow();
        this.runTour();
        this.runStory();
      }
    };
    next();
  }

  /** A gentle card with a title, a few short lines and one button. */
  /**
   * Hands over Shop decorations and achievement trophies not yet in storage, and returns the card that tells
   * the player (null when there is nothing new). Grok playtest Nov 23 (H3): this used to run only with a bow,
   * so a lantern bought in town never reached storage when the player walked straight home.
   */
  private newPiecesCard(): ((next: () => void) => void) | null {
    const bought = giveShopDecor(this.profile, this.dojo, SHOP);
    const trophies = giveAchievementPieces(this.profile, this.dojo, CONTENT);
    if (bought.length + trophies.length === 0) return null;
    writeSave(this.profile);
    const names = (ids: string[]) => ids.map((id) => decorationDef(CONTENT.dojo, id).name);
    const lines = [...names(trophies).map((n) => `Trophy: ${n}`), ...names(bought)].slice(0, 4);
    return (next) => this.card(trophies.length ? 'You earned a trophy!' : 'New for your dojo!', [lines.join('\n'), 'Find it in Decorate, in your storage.'], 'Great!', next);
  }

  private card(title: string, lines: string[], button: string, onClose: () => void, chest = false): void {
    const { width, height } = view(this);
    const w = Math.min(460, width - 40);
    const box = this.add.container(0, 0).setDepth(70);
    this.cardsOpen++;
    box.once(Phaser.GameObjects.Events.DESTROY, () => (this.cardsOpen = Math.max(0, this.cardsOpen - 1)));
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
    const body = this.add
      .text(width / 2, 0, lines.join('\n\n'), { fontFamily: FONT, fontSize: '15px', color: '#f2e9d8', align: 'center', wordWrap: { width: w - 36 }, lineSpacing: 2 })
      .setOrigin(0.5, 0)
      .setResolution(crisp());
    const h = body.height + 116;
    const top = Math.max(10, (height - h) / 2);
    box.add(this.roundPanel(width / 2 - w / 2, top, w, h, 0.7));
    box.add(
      this.add
        .text(width / 2, top + 16, title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '22px', color: '#ffd166' })
        .setOrigin(0.5, 0)
        .setResolution(crisp()),
    );
    body.setY(top + 52);
    box.add(body);
    if (chest) for (const side of [-1, 1]) box.add(chestIcon(this, width / 2 + side * (w / 2 - 34), top + 32, 0xffd166).setScale(1.4));
    const by = top + h - 56;
    roundButton(this, { x: width / 2 - 95, y: by, w: 190, h: MIN_TAP, label: button, color: GREEN, size: 16, onTap: () => {
      box.destroy();
      onClose();
    } }, box);
    box.setAlpha(0);
    this.tweens.add({ targets: box, alpha: 1, duration: 250 });
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
      this.storyCleaned();
    }

    const door = CONTENT.dojo.room.doors[0];
    const dDoor = Math.hypot(p.pos.x - door.x, p.pos.y - door.y);
    // Next to the station (it is solid, so the hero stops below it or to its left).
    const atStation = p.pos.x > STATION.left - 0.85 && p.pos.y < STATION.footY + 0.85;
    if (dDoor > 2.1) this.doorArmed = true;
    if (p.pos.x < STATION.left - 1.7 || p.pos.y > STATION.footY + 1.8) this.boardArmed = true;
    // The doorway: the last row before the door, anywhere across the door's width (a tap on the door
    // stops the hero a little short of it, so a tight distance missed it).
    const inDoorway = Math.abs(p.pos.x - door.x) < 0.9 && door.y - p.pos.y < 1.6;
    if (this.doorArmed && inDoorway) this.goTown();
    else if (this.boardArmed && atStation) this.goBoard();
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
    this.storyCleaned();
  }

  /** "Your dojo is resting for today", when the Tower was asked for after today's play time ran out. */
  private showResting(): void {
    if (this.restingNote?.active) return;
    const { width, height } = view(this);
    const pt = PLAY_TIME_TEXT;
    const t = this.add
      .text(width / 2, height * 0.3, `${pt.doorResting}\n${pt.doorRestingLine}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: '18px', color: '#fff6e0', align: 'center', stroke: '#14121c', strokeThickness: 5 })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setDepth(40);
    this.restingNote = t;
    this.tweens.add({ targets: t, alpha: 0, delay: 3200, duration: 500, onComplete: () => t.destroy() });
  }

  /** The dojo is spotless: Calm Mind. Kept modest, so real achievements are always bigger. */
  private celebrateCalm(): void {
    writeSave(this.profile);
    sfx.calmMind();
    const p = this.world.players.p1.pos;
    this.ring(p, CALM, 2.2);
    this.sparkle(p, 14, CALM);
    const { width, height } = view(this);
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

  /** Nov 17 (Jay): the south door leads out into town, where the hero comes out of their own dojo's front door. */
  private goTown(): void {
    if (this.profile.homeTour === 'dojo') {
      if (!this.tourStarted) return;
      this.profile.homeTour = 'town';
    }
    this.leaveTo('ActionZoneTown', { from: 'home' });
  }

  /** Nov 17 (Jay): the board on the wall is the training station: last climb, gear, fighting style and the Tower. */
  private goBoard(): void {
    const tour = this.profile.homeTour;
    if (this.profile.story.step === 'ch2-board') return this.leaveTo('Home', { view: 'board', story: 2 });
    // Mid-tour (dojo and town stops), the station waits for the tour's last stop.
    if (tour === 'dojo' || tour === 'town') return;
    if (tour === 'board') {
      this.profile.homeTour = null;
      finishChapter(this.profile.story, 1);
      return this.leaveTo('Home', { view: 'board', tourEnd: true });
    }
    this.leaveTo('Home', { view: 'board' });
  }

  // ---------------------------------------------------------------- Home Tour

  /**
   * Home Tour (Jay, Nov 18). Dojo stop: Sensei's welcome, the training station glows, then the door glows
   * ("Come, let's see the town"). Board stop (back from the town): the station glows and walking up to it
   * opens the Training Board. Lines are in content/dojo/action-zone/home-tour.json.
   */
  private runTour(): void {
    const stop = this.profile.homeTour;
    if (!stop || this.tourStarted || this.mode !== 'play' || this.leaving) return;
    this.tourStarted = true;
    const station = () => this.tourGlowAt(STATION.left - 0.35, STATION.footY + 0.45);
    if (stop === 'board') {
      station();
      this.tourBits.push(senseiBubble(this, TOUR.toStation, undefined, TOUR.next, 'bottom'));
      return;
    }
    if (stop !== 'dojo') return;
    // Story Chapters (Nov 24): Chapter 1 ends at home with the welcome and the station; the town walk moved to
    // Chapter 4 (The Real Dojo). The board stop opens the Training Board and finishes Chapter 1.
    const name = this.training.displayName.split(' ')[0];
    const lines = [tourLine(STORY.ch1Home.welcome, { player: name })];
    const say = (i: number): void => {
      this.mode = 'arriving';
      if (i < lines.length) {
        senseiBubble(this, lines[i], () => say(i + 1));
        return;
      }
      station();
      this.tourLook = { x: STATION.x, y: STATION.footY };
      senseiBubble(this, STORY.ch1Home.station, () => {
        this.tourLook = null;
        this.profile.homeTour = 'board';
        writeSave(this.profile);
        this.tourBits.push(senseiBubble(this, TOUR.toStation, undefined, TOUR.next, 'bottom'));
        this.controls.reset();
        this.quietUntil = this.time.now + ARRIVAL_QUIET_MS;
        this.mode = 'play';
        this.renderUi();
      }, TOUR.next, 'bottom');
    };
    say(0);
  }

  // ---------------------------------------------------------------- Story Chapters

  /**
   * Story Chapters (Nov 24): when chapter 2 is ready, Sensei's chapter card (once a visit); a chapter in
   * progress resumes at its saved step. Chapters 3-6 come in the next stages.
   */
  private runStory(): void {
    if (this.mode !== 'play' || this.leaving || this.profile.homeTour || this.cardsOpen > 0) return;
    const story = this.profile.story;
    if (story.step?.startsWith('ch2-')) {
      if (this.storyBits.length === 0) this.chapterTwo();
      return;
    }
    if (this.storyOffered || chapterReady(story) !== 2) return;
    this.storyOffered = true;
    this.mode = 'menu';
    showChapterCard(
      this,
      2,
      () => {
        story.step = 'ch2-mess';
        writeSave(this.profile);
        this.mode = 'play';
        this.chapterTwo();
      },
      () => {
        this.controls.reset();
        this.mode = 'play';
        this.renderUi();
      },
    );
  }

  private clearStoryBits(): void {
    for (const b of this.storyBits) b.destroy();
    this.storyBits = [];
    this.storyRing = null;
  }

  /** Sensei's line with Next, then the chapter moves to `step`. */
  private storyNext(step: string, line: string): void {
    this.clearStoryBits();
    this.mode = 'arriving';
    this.renderUi();
    this.storyBits.push(
      senseiBubble(this, line, () => {
        this.profile.story.step = step;
        writeSave(this.profile);
        this.storyBits = [];
        this.mode = 'play';
        this.chapterTwo();
      }, TOUR.next, 'bottom'),
    );
  }

  /** A line that stays until the player does the thing (no button). */
  private storyWait(line: string): void {
    this.storyBits.push(senseiBubble(this, line, undefined, TOUR.next, 'bottom'));
    this.controls.reset();
    this.quietUntil = this.time.now + ARRIVAL_QUIET_MS;
    this.mode = 'play';
    this.renderUi();
  }

  /** Chapter 2, Home, Sweet Dojo: the Shades' mess, sweeping, decorating, Look, then the Training Board. */
  private chapterTwo(): void {
    this.clearStoryBits();
    const step = this.profile.story.step;
    if (step === 'ch2-mess') return this.shadesVisited();
    if (step === 'ch2-sweep') {
      if (choresLeft(this.dojo) === 0) return this.storyNext('ch2-decorate', STORY.ch2.swept);
      return this.storyWait(STORY.ch2.sweep);
    }
    if (step === 'ch2-decorate') {
      this.storyRing = 'Decorate';
      return this.storyWait(STORY.ch2.decorate);
    }
    if (step === 'ch2-look') {
      // The Look button stays on screen (play mode) so its gold ring shows; Next or Look both move on.
      this.storyRing = 'Look';
      this.mode = 'play';
      this.renderUi();
      this.storyBits.push(
        senseiBubble(this, STORY.ch2.look, () => {
          this.profile.story.step = 'ch2-board';
          writeSave(this.profile);
          this.storyBits = [];
          this.mode = 'play';
          this.chapterTwo();
        }, TOUR.next, 'bottom'),
      );
      return;
    }
    if (step === 'ch2-board') {
      this.storyBits.push(this.tourGlowAt(STATION.left - 0.35, STATION.footY + 0.45));
      this.boardArmed = true;
      return this.storyWait(STORY.ch2.board);
    }
  }

  /** Sweeping or a chore finished: in chapter 2's sweep step, a clean dojo moves the chapter on. */
  private storyCleaned(): void {
    if (this.profile.story.step === 'ch2-sweep' && choresLeft(this.dojo) === 0 && this.mode === 'play') this.storyNext('ch2-decorate', STORY.ch2.swept);
  }

  /** Chapter 2's opening cut scene: the Shades made a mess while the hero climbed, and scurry out the door. */
  private shadesVisited(): void {
    this.mode = 'arriving';
    this.controls.reset();
    // The mess is scripted, looks only and capped like all dust (it never blocks play or removes anything).
    const want = hoursForMess(0.6);
    if (this.dojo.messHours < want) ageDojo(this.dojo, CONTENT.dojo, want - this.dojo.messHours);
    this.redrawSpots();
    this.redrawDecorations();
    writeSave(this.profile);
    this.renderUi();
    const door = CONTENT.dojo.room.doors[0];
    const hero = this.world.players.p1.pos;
    const shades = [0, 1, 2].map((i) => {
      const sh = addLittleShade(this, TILE);
      sh.setPosition((hero.x + (i - 1) * 1.6) * TILE, (hero.y - 2 - (i % 2)) * TILE).setAlpha(0);
      this.worldLayer.add(sh);
      return sh;
    });
    const f = cutsceneFrame(
      this,
      () => {
        for (const sh of shades) sh.destroy();
        this.profile.story.step = 'ch2-sweep';
        writeSave(this.profile);
        this.mode = 'play';
        this.chapterTwo();
      },
      { fadeOut: false },
    );
    f.at(200, () => f.say(STORY.ch2.mess1));
    f.at(1600, () => shades.forEach((sh, i) => this.tweens.add({ targets: sh, alpha: 1, duration: 300, delay: i * 150 })));
    f.at(2600, () => {
      f.say(STORY.ch2.mess2);
      shades.forEach((sh, i) => this.tweens.add({ targets: sh, y: sh.y - 8, duration: 120, yoyo: true, repeat: 5, delay: i * 90 }));
    });
    f.at(4600, () => {
      sfx.doors();
      shades.forEach((sh, i) =>
        this.tweens.add({
          targets: sh,
          x: (door.x + (i - 1) * 0.4) * TILE,
          y: door.y * TILE,
          duration: reducedMotion() ? 10 : 1100,
          delay: i * 160,
          ease: 'Sine.In',
          onComplete: () => this.tweens.add({ targets: sh, alpha: 0, duration: 200 }),
        }),
      );
    });
    f.at(6600, () => f.finish());
  }

  /** A glowing "walk here" spot on the dojo floor (tiles). */
  private tourGlowAt(x: number, y: number): Phaser.GameObjects.Container {
    const g = tourGlow(this, x * TILE, y * TILE, TILE * 0.6);
    this.worldLayer.add(g);
    this.tourBits.push(g);
    return g;
  }

  /** The My Path button: the Gate, the next class step, the Shop and the Book. */
  private goPath(): void {
    this.leaveTo('Home', { view: 'path' });
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
    // Chapter 2's Look step: trying Look counts, so coming back goes on to the Training Station.
    if (this.profile.story.step === 'ch2-look') {
      this.profile.story.step = 'ch2-board';
      writeSave(this.profile);
    }
    this.cameras.main.fadeOut(250, 10, 8, 16);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Create', { first: false }));
  }

  private decoratingLesson(): void {
    const l = takeLesson('firstDecoration', null);
    if (!l) return;
    this.profile.lessons = loadSave().lessons;
    this.card('Sensei', l.practice ? [...l.screens, l.practice] : l.screens, 'Okay!', () => {});
  }

  private setDecorating(on: boolean): void {
    sfx.unlock();
    this.controls.reset();
    this.selected = null;
    this.drag = null;
    this.pan = null;
    this.panned = false;
    if (on) {
      this.clearStoryBits();
      this.mode = 'decorate';
      // The movement stick isn't used while decorating.
      for (const o of this.controls.objects) (o as Phaser.GameObjects.Arc).setVisible(false);
      // The first time, ask how they like to move decorations.
      // Sensei's Lessons (M7-P5): the Decorating lesson comes right after that choice, on the same visit (Manager call).
      if (!this.moveStyle) this.time.delayedCall(0, () => this.chooseMoveStyle(() => this.decoratingLesson()));
      else this.decoratingLesson();
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
      if (this.profile.story.step === 'ch2-decorate') this.time.delayedCall(250, () => this.storyNext('ch2-look', STORY.ch2.decorated));
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
    if (this.mode !== 'decorate' || this.drag || this.pan || this.onUi((pointer.x / DPR), (pointer.y / DPR))) return;
    const tile = this.toTile((pointer.x / DPR), (pointer.y / DPR));
    const it = this.itemAt(tile);
    if (!it) {
      // Empty floor: drag to look around, or tap to move the selected decoration here.
      this.pan = { pointerId: pointer.id, last: { x: (pointer.x / DPR), y: (pointer.y / DPR) }, moved: false };
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
      const dx = (pointer.x / DPR) - pan.last.x;
      const dy = (pointer.y / DPR) - pan.last.y;
      if (!pan.moved && Math.hypot((pointer.x / DPR) - (pointer.downX / DPR), (pointer.y / DPR) - (pointer.downY / DPR)) < 12) return;
      pan.moved = true;
      pan.last = { x: (pointer.x / DPR), y: (pointer.y / DPR) };
      this.cam.x -= dx / (this.zoom * TILE);
      this.cam.y -= dy / (this.zoom * TILE);
      this.panned = true;
      this.updateCamera(true);
      return;
    }
    const d = this.drag;
    if (!d || pointer.id !== d.pointerId || !pointer.isDown) return;
    const tile = this.toTile((pointer.x / DPR), (pointer.y / DPR));
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
      if (!pan.moved && this.selected && this.moveStyle === 'tap') this.moveSelectedTo(this.toTile((pointer.x / DPR), (pointer.y / DPR)));
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
  /**
   * LP-B4b: the wall paint from the shop, a colour multiplied over the back wall's paper panels and
   * beam (from the picture's top edge, 0.3 tiles above row 0, down to row 1). Drawn in code, no art.
   */
  private wallPaint(): Phaser.GameObjects.Graphics | null {
    const color = wornShop().wall;
    if (!color) return null;
    const g = this.add.graphics().setBlendMode(Phaser.BlendModes.MULTIPLY);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color).fillRect(0, -0.3 * TILE, CONTENT.dojo.room.width * TILE, 1.3 * TILE);
    return g;
  }

  private drawRoom(): { back: Phaser.GameObjects.GameObject[]; front: Phaser.GameObjects.GameObject[]; labels: Phaser.GameObjects.GameObject[] } {
    const room = CONTENT.dojo.room;
    const [floor, board, front] = addStatic(this, 'dojo', 'room', 0, 0);
    const door = room.doors[0];
    const label = (x: number, y: number, text: string, size: number) =>
      this.add
        .text(x, y, text, { fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px`, color: '#fff6e0', stroke: '#14121c', strokeThickness: 3, backgroundColor: 'rgba(20,18,28,0.72)', padding: { x: 6, y: 1 } })
        .setOrigin(0.5, 0)
        .setResolution(crisp() * 2);
    return {
      back: [floor, this.wallPaint(), board].filter((o): o is Phaser.GameObjects.Image | Phaser.GameObjects.Graphics => !!o),
      front: [front].filter(Boolean),
      labels: [label(door.x * TILE, (door.y - 0.2) * TILE, PW.dojoDoorLabel, LABEL_PX)],
    };
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const r = MOVEMENT.playerRadius * TILE;
    this.calmAura = this.add.circle(0, 0, r * 1.5, CALM, 0.18).setStrokeStyle(2, CALM, 0.6);
    this.tweens.add({ targets: this.calmAura, scale: 1.15, alpha: 0.5, duration: 1300, yoyo: true, repeat: -1 });
    this.calmAura.setY(-r * 0.4);
    this.hero = makePlayerSprite(this, this.training.belt, this.training.stripesThisBelt, loadLook())!;
    const p = this.world.players.p1.pos;
    const aura = streakAura(this, r, this.profile.bestStreakWeeks);
    return this.add.container(p.x * TILE, p.y * TILE, [...(aura ? [aura] : []), this.calmAura, this.hero.container]);
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
    this.companions?.update(x * TILE, y * TILE, this.game.loop.delta);
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
    // Tier 1 pieces have their own pack; random ones are tinted (colour 1, or the belt colour).
    if (def.art) return def.source === 'random' ? addTinted(this, def.art, it.id, 0, 0, it.colour === 2 ? this.beltTint(it) : undefined) : addStatic(this, def.art, it.id, 0, 0);
    if (def.clean === 'rack' && it.crooked > 0) return addStatic(this, 'dojo', `${it.id}-crooked`, 0, 0, it.crooked - 1);
    const images = addStatic(this, 'dojo', it.id, 0, 0);
    if (def.clean === 'mat' && it.scuffed) {
      for (const scuff of addStatic(this, 'dojo', `${it.id}-scuffed`, 0, 0)) images.push(scuff.setAlpha(1 - it.wipes / DOJO.wipeTaps));
    }
    return images;
  }

  /**
   * Colour 2 of a tinted piece: the belt colour, or soft wood tan on White belt (white would
   * look washed out). Each piece remembers the belt of the floor it came from; older pieces
   * use the current belt.
   */
  private beltTint(it: DojoItem): string {
    const belt = it.belt ?? this.training.belt;
    return belt.tier === 1 ? WHITE_BELT_TINT : belt.color;
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
    const { width, height } = view(this);
    const pad = 12;

    // A dark strip behind the title and buttons (the room scrolls underneath).
    this.ui.add(this.add.rectangle(0, 0, width, this.mode === 'decorate' ? DECOR_TOP : TOP, 0x14121c, 0.85).setOrigin(0));
    const title = this.text(pad, 8, 'Home Dojo', 20, '#f2e9d8', true, 'Georgia, serif');
    title.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.tapTitle());
    this.uiRects.push(title.getBounds());
    const chores = choresLeft(this.dojo);
    const status = chores > 0 ? `Tidy up: ${chores} left` : '✓ Spotless';
    this.text(pad + title.width + 12, 12, status, 14, chores > 0 ? '#e8d9b5' : '#bff5ec', true);
    if (this.dojo.calmMindRuns > 0) {
      const n = this.dojo.calmMindRuns;
      this.text(pad, 30, `Calm Mind · ${n} Tower run${n > 1 ? 's' : ''}`, 14, '#bff5ec', true);
    }

    if (this.mode === 'decorate') {
      const arrows = this.moveStyle === 'arrows';
      // The arrows go first, so the top buttons (Done, Put away) always sit above them.
      if (this.selected && arrows) this.renderArrows(width, height);
      this.button(width - pad - 90, 8, 90, MIN_TAP, 'Done', GREEN, 15, () => this.setDecorating(false));
      const hint = !this.selected ? 'Tap a decoration to pick it' : arrows ? 'Use the arrows to move it' : 'Now tap where it should go';
      this.button(width - pad - 90 - 8 - 110 - 8 - 130, 8, 130, MIN_TAP, arrows ? 'Move: Arrows ⇄' : 'Move: Tap ⇄', 0x3a3a4a, 13, () => this.chooseMoveStyle());
      if (this.selected) {
        this.button(width - pad - 90 - 8 - 110, 8, 110, MIN_TAP, 'Put away', 0x6b3a3a, 14, () => this.putAway());
      }
      // Q-PREMIUM-2 M9: the hint rides in a solid dark pill at the bottom, just above the tray (and left of the arrow pad).
      const hintX = this.selected && arrows ? (width - (3 * ARROW + 24)) / 2 : width / 2;
      const hintText = this.text(hintX, height - TRAY - 10, hint, 16, '#fff6e0', true).setOrigin(0.5, 1);
      hintText.setBackgroundColor('#14121c').setPadding(12, 6, 12, 6).setAlpha(1);
      this.renderTray(width, height);
    } else if (this.mode === 'play') {
      this.button(width - pad - 80, 8, 80, 32, PW.dojoButton, 0x4a3f63, 14, () => this.goPath());
      this.button(width - pad - 80 - 8 - 100, 8, 100, 32, 'Decorate', 0x8a5a35, 14, () => this.setDecorating(true));
      this.button(width - pad - 80 - 8 - 100 - 8 - 70, 8, 70, 32, 'Look', 0x3a6ea5, 14, () => this.changeLook());
      if (this.storyRing) {
        const rx = this.storyRing === 'Look' ? width - pad - 80 - 8 - 100 - 8 - 70 : width - pad - 80 - 8 - 100;
        const rw = this.storyRing === 'Look' ? 70 : 100;
        const ring = this.add.graphics();
        ring.lineStyle(4, 0xffd166, 1).strokeRoundedRect(rx - 5, 3, rw + 10, 42, 12);
        this.ui.add(ring);
        if (!reducedMotion()) this.tweens.add({ targets: ring, alpha: 0.3, duration: 450, yoyo: true, repeat: -1 });
      }
      this.button(width - pad - 80 - 8 - 100 - 8 - 70 - 8 - 90, 8, 90, 32, DIFFICULTY_TEXT.button, 0x3a3a4a, 14, () => this.openDifficulty());
      // One line says which difficulty they're on, shown once ever (M7-P1).
      if (!this.profile.difficultyLineShown && this.profile.difficulty) {
        const name = DIFFICULTY_TEXT.choices.find((c) => c.id === activeDifficulty(this.profile, this.training.belt.tier))?.name ?? '';
        // Below the second button row (Street Smarts) so nothing covers it.
        this.text(pad, ROW2_Y + MIN_TAP + 8, DIFFICULTY_TEXT.homeLine.replace('{name}', name), 14, '#fff6e0', true).setStroke('#14121c', 5);
        this.profile.difficultyLineShown = true;
        writeSave(this.profile);
      }
      // Welcome Week (M7-P7): an existing student's systems show once Sensei has introduced them.
      const street = streetSmartsOpen(this.training.tier, streetUi.unlockTier) && isOpen(this.profile, this.training, 'street-smarts');
      if (street) this.button(width - pad - 130, ROW2_Y, 130, MIN_TAP, streetUi.button, GREEN, 14, () => this.leaveTo('StreetSmarts', { id: 'store-separated' }));
      // L10-B: the Monster Journal and Sensei's Scroll moved into the Book (Home's Path screen).
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
    const cross = bottom - (3 * a + 2 * gap) - m >= DECOR_TOP + 30;
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


  /** Settings: the difficulty choice (Guided / Steady / Challenge). Picking one makes it the player's own. */
  private openDifficulty(): void {
    const back = this.mode;
    this.mode = 'menu';
    this.controls.reset();
    const { width, height } = view(this);
    const box = this.add.container(0, 0).setDepth(70);
    const dim = this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive();
    box.add(dim);
    const close = () => {
      box.destroy();
      this.mode = back === 'menu' ? 'play' : back;
      this.renderUi();
    };
    dim.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, close);
    const t = DIFFICULTY_TEXT;
    // Q-PREM-F2: a clear Done in the top-right corner (green, like Scroll's Close), so a young
    // child can see how to leave. Tapping the dim background still closes too.
    const doneW = 96;
    roundButton(this, { x: width - 12 - doneW, y: 12, w: doneW, h: MIN_TAP, label: 'Done', color: 0x277a56, size: 16, onTap: () => close() }, box);
    box.add(this.add.text(width / 2, height * 0.1, t.title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp()));
    const gap = 12;
    const n = t.choices.length;
    const w = Math.min(220, (width - 40 - gap * (n - 1)) / n);
    const top = height * 0.1 + 44;
    // Leave room under the cards for the two rows of buttons (Music / Sound, M7-P8).
    const h = Math.min(170, height * 0.5, height - 12 - MIN_TAP * 2 - 8 - 40 - top);
    const x0 = width / 2 - (n * w + (n - 1) * gap) / 2;
    // R-CHALLENGE P6: below the 4th belt a Challenge pick plays as Standard, so Steady shows as selected.
    const tier = this.training.belt.tier;
    const current = activeDifficulty(this.profile, tier);
    t.choices.forEach((c, i) => {
      const x = x0 + i * (w + gap);
      const on = current === c.id;
      const locked = c.id === 'challenge' && !challengeUnlocked(tier);
      // P-MENU-e: a rounded card with the shared press; the name and words ride inside it.
      // Q-LOCK-CARD: the locked card is solid (no see-through), and a tap answers gently.
      let line: Phaser.GameObjects.Text | null = null;
      const b = roundButton(this, { x, y: top, w, h, label: '', color: locked ? LOCKED_CARD.color : 0x2a2536, size: 15, selected: on, onTap: () => {
        if (locked) {
          this.lockedCardTap(b.visual, line!);
          return;
        }
        sfx.place(true);
        chooseDifficulty(this.profile, c.id);
        writeSave(this.profile);
        close();
      } }, box);
      b.visual.add(this.add.text(0, 18 - h / 2, (on ? '✓ ' : locked ? '🔒 ' : '') + c.name, { fontFamily: FONT, fontStyle: 'bold', fontSize: '20px', color: locked ? LOCKED_CARD.nameColor : '#ffffff' }).setOrigin(0.5, 0).setResolution(crisp()));
      line = this.add.text(0, 54 - h / 2, locked ? lockedLine(t.locked.challenge, this.training.belts) : c.text, { fontFamily: FONT, fontSize: '15px', color: locked ? LOCKED_CARD.textColor : '#e8d9b5', align: 'center', wordWrap: { width: w - 24 } }).setOrigin(0.5, 0).setResolution(crisp());
      b.visual.add(line);
    });
    box.add(this.add.text(width / 2, top + h + 14, t.footer, { fontFamily: FONT, fontSize: '14px', color: '#b9ad99' }).setOrigin(0.5, 0).setResolution(crisp()));
    // Grown-up settings sit behind a simple sum, so a young child can't open them by accident (M7-P9).
    const pt = PLAY_TIME_TEXT;
    const gw = 190;
    const gh = MIN_TAP;
    const gx = width - 12 - gw;
    const gy = height - 12 - gh;
    roundButton(this, { x: gx, y: gy, w: gw, h: gh, label: pt.grownUpButton, color: 0x3a3a4a, size: 14, onTap: () => {
      box.destroy();
      this.openGrownUpGate(back);
    } }, box);
    // Reduced motion (K12): a switch for this device, on by default if the device asks for less motion.
    const motionLabel = () => `${MOTION_TEXT.label}: ${reducedMotion() ? MOTION_TEXT.on : MOTION_TEXT.off}`;
    const mw = Math.min(210, gx - 24);
    const mx = 12;
    const motion = roundButton(this, { x: mx, y: gy, w: mw, h: gh, label: motionLabel(), color: 0x3a3a4a, size: 14, onTap: () => {
      setReducedMotion(!reducedMotion());
      (motion.visual.getAt(2) as Phaser.GameObjects.Text).setText(motionLabel());
    } }, box);
    const motionHint = this.add.text(mx, gy - 6, MOTION_TEXT.hint, { fontFamily: FONT, fontSize: '13px', color: '#b9ad99', wordWrap: { width: Math.max(mw, 160) } }).setOrigin(0, 1).setResolution(crisp());
    box.add(motionHint);
    // Music and Sound (M7-P8): big − and + buttons, 0 to 5, saved on this device. Outside the grown-up gate.
    const vx = mx + mw + 12;
    const vw = gx - 12 - vx;
    addVolumeRow(this, box, 'music', vx, gy - gh - 8, vw, gh, (step) => music.setVolume(step));
    addVolumeRow(this, box, 'sound', vx, gy, vw, gh, (step) => {
      sfx.setVolume(step);
      sfx.place(true);
    });
  }

  /** The grown-up gate: "what is a + b?" with 4 choices. Right opens the play-time setting; wrong goes back. */
  private openGrownUpGate(back: Mode): void {
    showGrownUpGate(this, () => {
      sfx.place(true);
      this.openPlayLimit(back);
    }, () => {
      this.mode = back === 'menu' ? 'play' : back;
      this.renderUi();
    });
  }

  /** A run left open when the app closed (M7-P11): keep climbing from that room, or rest and keep the loot. */
  private offerResume(done?: () => void): void {
    const run = savedRun();
    if (!run) return;
    const t = RESUME_TEXT;
    const { width, height } = view(this);
    const back = this.mode === 'arriving' ? 'play' : this.mode;
    this.mode = 'menu';
    const box = this.add.container(0, 0).setDepth(80);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
    const w = Math.min(460, width - 40);
    const h = 200;
    const left = (width - w) / 2;
    const top = (height - h) / 2;
    box.add(this.roundPanel(left, top, w, h, 0.9));
    const label = (y: number, s: string, size: number, color: string, bold = false) =>
      this.add.text(width / 2, y, s, { fontFamily: FONT, fontStyle: bold ? 'bold' : 'normal', fontSize: `${size}px`, color, align: 'center', wordWrap: { width: w - 32 } }).setOrigin(0.5, 0).setResolution(crisp());
    box.add(label(top + 18, t.title, 24, '#ffd166', true));
    box.add(label(top + 60, t.line.replace('{room}', String(run.depth + 1)).replace('{total}', String(run.totalRooms)), 16, '#f2e9d8'));
    const bw = (w - 48) / 2;
    const bh = 50;
    const by = top + h - bh - 20;
    const choice = (x: number, text: string, color: number, onTap: () => void) =>
      roundButton(this, { x, y: by, w: bw, h: bh, label: text, color, size: 17, labelColor: '#fff6e0', stroke: 0xfff6e0, onTap }, box);
    choice(left + 16, t.rest, 0x4a4a55, () => {
      // Bank it like a play-time rest: nothing found is lost.
      run.status = 'rested';
      // Banking writes a fresh profile; take its dojo too, so the pieces just banked show here.
      this.profile = bankRun(run, this.training, 'rested').profile;
      this.dojo = homeDojo(this.profile);
      box.destroy();
      this.redrawDecorations();
      this.toast(t.restLine);
      if (done) done();
      else {
        this.mode = back;
        this.renderUi();
      }
    });
    choice(left + 32 + bw, t.continue, GREEN, () => {
      this.leaving = true;
      this.cameras.main.fadeOut(400, 10, 8, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Game', { run }));
    });
  }

  /** Grown-up setting: the play-time limit (off / 15 / 30 / 45 / 60 minutes). */
  private openPlayLimit(back: Mode): void {
    const pt = PLAY_TIME_TEXT;
    const { width, height } = view(this);
    const box = this.add.container(0, 0).setDepth(70);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
    this.addWipeButton(box);
    const close = () => {
      box.destroy();
      this.mode = back === 'menu' ? 'play' : back;
      this.renderUi();
    };
    const w = Math.min(620, width - 40);
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
        const b = roundButton(this, { x, y: by, w: bw, h: bh, label: n === 0 ? pt.off : pt.minutes.replace('{n}', String(n)), color: on ? GREEN : 0x2a2536, size: 16, selected: on, onTap: () => {
          sfx.place(true);
          this.profile.playLimitMinutes = n;
          writeSave(this.profile);
          draw();
        } }, box);
        b.visual.setData('choice', true);
        b.hit.setData('choice', true);
      });
    };
    draw();
    const dw = 140;
    const dy = Math.min(height - 12 - 44, by + bh + 22);
    roundButton(this, { x: width / 2 - dw - 8, y: dy, w: dw, h: 44, label: BELT_TEXT.open, color: 0x2a2536, size: 16, stroke: 0xffd166, labelColor: '#ffd166', onTap: () => {
      box.destroy();
      this.openBeltEntry(back);
    } }, box);
    roundButton(this, { x: width / 2 + 8, y: dy, w: dw, h: 44, label: pt.done, color: GREEN, size: 16, onTap: close }, box);
  }

  /** Q-LOCK-CARD: tapping the locked Challenge card: a soft sound, a small shake (not with reduced motion), and a pulse of the unlock line. */
  private lockedCardTap(card: Phaser.GameObjects.Container, line: Phaser.GameObjects.Text): void {
    const fb = lockedTapFeedback(reducedMotion());
    if (fb.sound) sfx.place(false);
    const baseX = (card.getData('lockBaseX') as number | undefined) ?? card.x;
    card.setData('lockBaseX', baseX);
    this.tweens.killTweensOf(line);
    line.setScale(1);
    if (fb.pulseLine) this.tweens.add({ targets: line, scale: 1.08, duration: 120, yoyo: true });
    if (fb.shake) {
      // Q-SHAKE-CENTER: same distance left and right of the resting spot, then back exactly on it.
      (card.getData('lockShake') as Phaser.Tweens.Tween | undefined)?.stop();
      card.x = baseX;
      const shake = this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: LOCK_SHAKE.ms,
        onUpdate: (tw) => { card.x = baseX + lockShakeOffset(tw.getValue() ?? 0); },
        onComplete: () => { card.x = baseX; },
        onStop: () => { card.x = baseX; },
      });
      card.setData('lockShake', shake);
    }
  }

  /**
   * Grown-up setting (B-BELT): the real belt and stripes. Choices below what's saved are greyed out.
   * `fix` (OV-B7) lets a grown-up correct a wrong entry, down to what the feed itself shows.
   */
  private openBeltEntry(back: Mode, fix = false): void {
    const t = BELT_TEXT;
    const { width, height } = view(this);
    const feed = baseFeed();
    const belts = feed.school.belts;
    const saved = feedEntry(applyBeltEntry(feed, this.profile.beltEntry));
    const floor = fix ? feedEntry(feed) : saved;
    const pick: BeltEntry = { ...saved };
    const box = this.add.container(0, 0).setDepth(70);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
    const close = () => {
      box.destroy();
      this.training = currentTraining();
      this.mode = back === 'menu' ? 'play' : back;
      this.renderUi();
    };
    const w = Math.min(600, width - 32);
    box.add(this.add.text(width / 2, 10, fix ? t.fixTitle : t.title, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp()));
    box.add(this.add.text(width / 2, 38, fix ? t.fixHelp : t.help, { fontFamily: FONT, fontSize: '14px', color: '#e8d9b5', align: 'center', wordWrap: { width: w } }).setOrigin(0.5, 0).setResolution(crisp()));
    const cols = 5;
    const gap = 8;
    const cw = (w - gap * (cols - 1)) / cols;
    const ch = 44;
    const top = 84;
    const left = (width - w) / 2;
    const sy = top + 2 * (ch + gap) + 6;
    const draw = () => {
      box.list.filter((o) => o.getData('pick')).forEach((o) => o.destroy());
      const chip = (x: number, y: number, cw2: number, label: string, swatch: number | null, on: boolean, ok: boolean, tap: () => void) => {
        // P-MENU-c: the shared rounded button; the picked chip is `selected`, a too-low choice `disabled`.
        const b = roundButton(this, { x, y, w: cw2, h: ch, label, color: on ? GREEN : 0x2a2536, size: 13, selected: on, disabled: !ok, labelWrap: cw2 - (swatch !== null ? 26 : 8), labelDx: swatch !== null ? 8 : 0, onTap: () => { sfx.place(true); tap(); draw(); } }, box);
        if (swatch !== null) b.visual.addAt(this.add.rectangle(-cw2 / 2 + 6, -7, 14, 14, swatch).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.6), 2);
        b.visual.setData('pick', true);
        b.hit.setData('pick', true);
      };
      belts.forEach((b, i) => {
        const x = left + (i % cols) * (cw + gap);
        const y = top + Math.floor(i / cols) * (ch + gap);
        const ok = entryRank(belts, { belt: b.id, stripes: 2 }) >= entryRank(belts, floor);
        chip(x, y, cw, b.name, Number.parseInt(b.color.replace('#', ''), 16) || 0xffffff, b.id === pick.belt, ok, () => {
          Object.assign(pick, pickBelt(belts, floor, b.id));
        });
      });
      box.add(this.add.text(left, sy + ch / 2, t.stripes, { fontFamily: FONT, fontStyle: 'bold', fontSize: '15px', color: '#e8d9b5' }).setOrigin(0, 0.5).setResolution(crisp()).setData('pick', true));
      [0, 1, 2].forEach((n) => {
        const ok = entryRank(belts, { belt: pick.belt, stripes: n }) >= entryRank(belts, floor);
        chip(left + 90 + n * (64 + gap), sy, 64, String(n), null, pick.stripes === n, ok, () => { pick.stripes = n; });
      });
    };
    draw();
    const bw = 120;
    const byy = Math.min(height - 10 - 44, sy + ch + 14);
    const button = (x: number, label: string, color: number, tap: () => void) => {
      roundButton(this, { x, y: byy, w: bw, h: 44, label, color, size: 16, onTap: tap }, box);
    };
    const save = () => {
      sfx.place(true);
      const lowered = entryRank(belts, pick) < entryRank(belts, saved);
      this.profile.beltEntry = fix ? fixBeltEntry(feed, pick) : recordBeltEntry(belts, this.profile.beltEntry, pick);
      writeSave(this.profile);
      // A lower belt is not a promotion to replay later: remember where progress now stands.
      if (lowered) {
        this.profile.seen = snapshot(currentTraining());
        writeSave(this.profile);
      }
      const name = belts.find((b) => b.id === pick.belt)!.name;
      const line = lowered ? t.fixed : pick.stripes === 0 ? t.savedNone : pick.stripes === 1 ? t.savedOne : t.saved;
      close();
      this.toast(line.replace('{belt}', name).replace('{n}', String(pick.stripes)));
    };
    if (fix) button(width / 2 - bw - 8, t.back, 0x4a4a55, () => { box.destroy(); this.openBeltEntry(back); });
    else {
      button(width / 2 - bw * 1.5 - 12, t.back, 0x4a4a55, close);
      button(width / 2 - bw / 2, t.fixButton, 0x2a2536, () => { box.destroy(); this.openBeltEntry(back, true); });
    }
    button(fix ? width / 2 + 8 : width / 2 + bw / 2 + 12, t.save, GREEN, () => this.confirmBeltEntry(belts, pick, save, fix ? saved : undefined));
  }

  /** "Are you sure?" before a belt entry is saved. With `keep` it is a grown-up's fix (OV-B7). */
  private confirmBeltEntry(belts: readonly { id: string; name: string }[], pick: BeltEntry, save: () => void, keep?: BeltEntry): void {
    const t = BELT_TEXT;
    const { width, height } = view(this);
    const card = this.add.container(0, 0).setDepth(90);
    card.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
    const entryText = (e: BeltEntry) => {
      const name = belts.find((b) => b.id === e.belt)!.name;
      return (e.stripes === 0 ? t.entryNone : e.stripes === 1 ? t.entryOne : t.entryStripes).replace('{belt}', name).replace('{n}', String(e.stripes));
    };
    const entry = entryText(pick);
    const w = Math.min(460, width - 40);
    const title = this.add.text(width / 2, height * 0.16, keep ? t.fixTitle : t.confirmTitle, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166' }).setOrigin(0.5, 0).setResolution(crisp());
    const help = this.add.text(width / 2, title.y + title.height + 12, (keep ? t.fixConfirm : t.confirmHelp).replace('{entry}', entry), { fontFamily: FONT, fontSize: '15px', color: '#e8d9b5', align: 'center', wordWrap: { width: w } }).setOrigin(0.5, 0).setResolution(crisp());
    card.add([title, help]);
    const bw = keep ? 200 : 140;
    const by = Math.min(height - 12 - 44, help.y + help.height + 22);
    const no = keep ? t.fixKeep.replace('{belt}', entryText(keep)) : t.confirmNo;
    roundButton(this, { x: width / 2 - bw - 8, y: by, w: bw, h: 44, label: no, color: 0x4a4a55, size: 16, labelWrap: bw - 12, onTap: () => card.destroy() }, card);
    roundButton(this, { x: width / 2 + 8, y: by, w: bw, h: 44, label: keep ? t.fixYes : t.confirmYes, color: GREEN, size: 16, onTap: () => { card.destroy(); save(); } }, card);
  }

  /** Asks how the player likes to move decorations: tap the spot, or an arrow pad. */
  /** `then` runs after a style is picked (the first Decorate visit's lesson, M7-P5). */
  private chooseMoveStyle(then?: () => void): void {
    const back = this.mode;
    this.mode = 'menu';
    const { width, height } = view(this);
    const box = this.add.container(0, 0).setDepth(70);
    box.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
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
        then?.();
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
    const face = this.add.circle(0, 0, CHORE_RADIUS, GREEN).setStrokeStyle(4, 0xffffff, 0.6);
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

  /** B-SAFE: a small "Erase progress" button in the play-time screen's corner, with a confirm card. */
  private addWipeButton(box: Phaser.GameObjects.Container): void {
    const t = SAFE_TEXT;
    const { height } = view(this);
    const label = this.add.text(20 + 8, height - 20 - 22, t.wipeButton, { fontFamily: FONT, fontSize: '14px', color: '#ff9f9f' }).setOrigin(0, 0.5).setResolution(crisp());
    const w = label.width + 16;
    label.destroy();
    roundButton(this, { x: 20, y: height - 20 - 44, w, h: 44, label: t.wipeButton, color: 0x2a1a20, size: 14, stroke: 0xff9f9f, labelColor: '#ff9f9f', onTap: () => this.confirmWipe() }, box);
  }

  private confirmWipe(): void {
    const t = SAFE_TEXT;
    const { width, height } = view(this);
    const card = this.add.container(0, 0).setDepth(90);
    card.add(this.add.rectangle(0, 0, width, height, 0x0a0810, 0.97).setOrigin(0).setInteractive());
    const w = Math.min(460, width - 40);
    const title = this.add.text(width / 2, height * 0.16, t.wipeTitle, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166', align: 'center', wordWrap: { width: w } }).setOrigin(0.5, 0).setResolution(crisp());
    const help = this.add.text(width / 2, title.y + title.height + 12, t.wipeHelp, { fontFamily: FONT, fontSize: '15px', color: '#e8d9b5', align: 'center', wordWrap: { width: w } }).setOrigin(0.5, 0).setResolution(crisp());
    card.add([title, help]);
    const bw = 140;
    const by = Math.min(height - 12 - 44, help.y + help.height + 22);
    roundButton(this, { x: width / 2 - bw - 8, y: by, w: bw, h: 44, label: t.wipeCancel, color: GREEN, size: 16, onTap: () => card.destroy() }, card);
    roundButton(this, { x: width / 2 + 8, y: by, w: bw, h: 44, label: t.wipeConfirm, color: 0x8a2a35, size: 16, onTap: () => {
      wipeAllData();
      // A fresh start: reload so every scene and module reads the empty save.
      window.location.reload();
    } }, card);
  }

  // ---------------------------------------------------------------- hidden testing screen

  private tapTitle(): void {
    if (BETA) return; // B-SAFE: no hidden testing screen in beta builds.
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
    const { width, height } = view(this);
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
    text(pad, pad + 48, `Fast-forward pretends you were away. You come back in through the door and bow, like a real return. Session day: ${localDay()}${devDayOffset() ? ` (+${devDayOffset()})` : ''}.`, 12, '#b9ad99');
    const w = Math.min(170, (width - pad * 2 - 16) / 3);
    let y = pad + 84;
    const away = (hours: number) => {
      // Pretend the last visit was earlier, then walk back in for real.
      this.dojo.lastSeenMs = (this.dojo.lastSeenMs ?? Date.now()) - hours * HOUR;
      // The session day really moves on too (dev/test only, Manager call M7-P7).
      addDevDays(Math.floor(hours / 24));
      writeSave(this.profile);
      setBowDue(true);
      this.scene.restart();
    };
    btn(pad, y, w, '+1 day away', 0x3a7bd5, () => away(24));
    btn(pad + w + 8, y, w, '+3 days away', 0x3a7bd5, () => away(72));
    btn(pad + (w + 8) * 2, y, w, '+1 week away', 0x3a7bd5, () => away(168));
    y += 46;
    btn(pad, y, w, 'Clean everything', GREEN, () => {
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
    y += 46;
    btn(pad, y, Math.min(260, width - pad * 2), 'Try the new decorations', 0x8a5a35, () => {
      // Puts the old pieces away and sets out the Tier 1 set (tinted ones in both colours).
      for (const it of this.dojo.items) if (!CONTENT.dojo.starter.some((s) => s.decoration === it.id)) storeItem(this.dojo, it.uid);
      const tier1 = CONTENT.dojo.decorations.filter((d) => d.id.startsWith('decor-a6-'));
      const ids = tier1.flatMap((d) => (d.source === 'random' ? [d.id, d.id] : [d.id]));
      const added = addDecorations(this.dojo, ids);
      added.forEach((it, i) => {
        if (decorationDef(CONTENT.dojo, it.id).source === 'random' && added[i - 1]?.id === it.id) it.colour = 2;
        const spot = findSpot(this.dojo, CONTENT.dojo, it.uid);
        if (spot) placeItem(this.dojo, CONTENT.dojo, it.uid, spot.col, spot.row);
      });
      writeSave(this.profile);
      // Solid pieces moved, so start the room again to rebuild where you can walk.
      this.scene.restart();
    });
    y += 54;
    text(pad, y, PW.adultProfilesHint, 12, '#b9ad99');
    btn(pad, height - pad - 36, Math.min(200, width - pad * 2), 'Close', 0x5b4a3c, close);
  }

  // ---------------------------------------------------------------- layout and helpers

  private onResize(): void {
    this.layout();
    this.renderUi();
  }

  /** Zooms in so the view is VIEW_ROWS tiles tall, like the Tower. */
  private layout(): void {
    const { width, height } = view(this);
    this.zoom = this.mode === 'decorate' ? height / (VIEW_ROWS * TILE) : (height - TOP) / (PLAY_FIT_ROWS * TILE);
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
    const { width, height } = view(this);
    const room = CONTENT.dojo.room;
    const t = TILE * this.zoom;
    let target: Vec2 = this.cam;
    if (this.mode !== 'decorate') target = this.tourLook ?? this.world.players.p1.pos;
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
    // Q-PREM-F9: Decorate's top bar is 60 tall, so the top wall (and its decorations) stays below it.
    const top = (this.mode === 'decorate' ? DECOR_TOP : TOP) / t;
    const ty = clamp(target.y, viewH / 2 - top, room.height + bottom - viewH / 2);
    this.cam = { x: this.cam.x + (tx - this.cam.x) * k, y: this.cam.y + (ty - this.cam.y) * k };
    this.offX = width / 2 - this.cam.x * t;
    this.offY = height / 2 - this.cam.y * t;
    this.worldLayer.setPosition(this.offX, this.offY);
  }

  /** Screen point to room tiles. */
  private toTile(x: number, y: number): Vec2 {
    const t = this.rawTile(x, y);
    // A tap on the training station walks up beside it.
    if (this.onStation(t)) return { x: STATION.x, y: STATION.footY + 0.5 };
    return t;
  }

  private rawTile(x: number, y: number): Vec2 {
    return { x: (x - this.offX) / this.zoom / TILE, y: (y - this.offY) / this.zoom / TILE };
  }

  /** True for a room point (tiles) on the training station or its label. */
  private onStation(t: Vec2): boolean {
    return this.mode === 'play' && t.x > STATION.left - 0.3 && t.x < STATION.left + 2.3 && t.y > -1 && t.y < STATION.footY + 0.2;
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
    if (reducedMotion()) return;
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
    const { width, height } = view(this);
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
    // P-MENU-e: the shared rounded button; its (at least 44 pt) tap zone also blocks floor taps.
    // OV-FX1: a button only acts in the mode it was drawn for. The top row stays on screen while
    // the bow and arrival run (mode 'arriving'); a tap there must not open a screen that would
    // later restore 'arriving' and leave the Dojo stuck.
    const drawnIn = this.mode;
    const b = roundButton(this, { x, y, w, h, label, color, size, onTap: () => this.mode === drawnIn && onTap() }, this.ui);
    this.uiRects.push(b.hit.getBounds());
  }

  /** P-MENU-e: a rounded card panel (dark fill, gold outline) for the Dojo's popup cards. */
  private roundPanel(x: number, y: number, w: number, h: number, strokeAlpha: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    g.fillStyle(0x221d2e).fillRoundedRect(x, y, w, h, RADIUS.panel);
    g.lineStyle(3, 0xffd166, strokeAlpha).strokeRoundedRect(x, y, w, h, RADIUS.panel);
    return g;
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
