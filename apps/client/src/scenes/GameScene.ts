import { bannerKeepOut, leftStripWidth, overArena, pickBannerSpot, senseiFloorY, senseiHomeY, tipSpot, type BannerAsk, type Box } from '../ui/senseiPlace';
import Phaser from 'phaser';
import {
  GUIDE_DONE,
  GUIDE_LESSONS,
  WARNING_LESSON,
  STRIKE_LESSON,
  loadTutorialLines,
  TUTORIAL_STEPS,
  currentStep,
  gotIt,
  releaseWave,
  showTip,
  skipStep,
  tutorialEvent,
  tutorialFlow,
  type TutorialEvent,
  type TutorialFlow,
  type TutorialStep,
  COMBAT,
  MOVEMENT,
  TICKS_PER_SECOND,
  realClock,
  TELEGRAPH_NEARLY_FULL,
  counterWindowTicks,
  currentAttack,
  createWorld,
  loadEnemy,
  loadRoom,
  stepWorld,
  DIFFICULTY,
  activeDoorSlots,
  addDecorations,
  beatNamed,
  meetNamed,
  bowIn,
  decorationDef,
  chooseInsight,
  createRunWorld,
  currentRoom,
  wrapUpRun,
  chooseDifficulty,
  markGuidedOffered,
  shouldOfferGuided,
  activeStance,
  characterSetup,
  modsFrom,
  rarityRank,
  type GearItem,
  strikeCost,
  runEffects,
  setPlayerMods,
  updateRun,
  type CombatEvent,
  type DoorKind,
  type RunEvent,
  type RunState,
  type Difficulty,
  type EnemyState,
  type PlayerId,
  type PlayerInput,
  type Room,
  type Vec2,
  type WorldState,
  type CharacterSetup,
  type TrainingState,
  TEMPO,
  SCREEN_SHAKE,
  hurtShakeScale,
  realSecondsToTicks,
  realTicksPerSecond,
  ticksToRealMs,
  bossTagLayout,
  BOSS_TAG,
  lidUp,
  type TagBox,
  keeperWin,
  skipDown,
  patternShape,
  patternKey,
  firstPatternSight,
} from '@dojo/sim';
import bruteData from '../../../../content/enemies/brute.json';
import trainingRoom from '../../../../content/rooms/training-room.json';
import tutorialData from '../../../../content/tutorial/tutorial-floor.json';
// L-PREMIUM-b: the Counter tip's rules.
import COUNTER_HINT from '../../../../content/settings/counter-hint.json';
import { Celebrations } from '../ui/Celebrations';
import BOSS_WIN from '../../../../content/settings/boss-win.json';
import LAST_RUN from '../../../../content/settings/last-run.json';
import { MASH_GUARD_LINE, takeMashGuardMoment } from '../game/mashGuardMoment';
import { testFlags } from '../game/beta';
import { forceAttack, withForced } from '../game/forceAttack';

/** The tutorial floor's lines (M7-P2). */
const TUTORIAL = loadTutorialLines(tutorialData);
import { type PackName, addStatic, characterArt, characterTop, frameOf, loadArt, setStaticFrame, staticArt } from '../art/art';
import { LayeredSprite } from '../art/LayeredSprite';
import { ICON_PACK } from '../art/icons';
import { addGearIcon, loadGearIcons } from '../art/gearIcons';
import { ENEMY_ART_PACKS, attackAnim, auraId, enemyArt, testAura, towerPack } from '../art/tiers';
import { addShadow, makePlayerSprite, playLocomotion } from '../art/player';
import { loadLook, playerPacks } from '../game/look';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { homeDojo } from '../game/dojo';
import { NAMED_PACK, NamedView } from '../game/named';
import { reducedMotion } from '../game/motion';
import { drawPatternTell } from '../game/patternTells';
import { loadSave, writeSave } from '../game/save';
import { currentTraining } from '../game/student';
import { bowPrompt, playBow } from '../ui/bow';
import { InsightPicker } from '../ui/InsightPicker';
import { choiceCard, keptCard } from '../ui/RunOverCard';
import { KO } from '../game/knockout';
import { PLAY_TIME_TEXT, isPlayTimeUp } from '../game/playTime';
import { DIFFICULTY_TEXT, localToday, showGrades } from '../game/difficulty';
import { LESSONS, noteLessonSeen, takeLesson } from '../game/lessons';
import { bankRun, saveRunInProgress } from '../game/runSave';
import { FONT, GRADE_COLOR, RARITY_COLOR, rarityName, clock, crisp, css, view, DPR, hiDpi } from '../ui/theme';
import { ActionButtons } from '../input/ActionButtons';
import { TouchControls } from '../input/TouchControls';
import { twistBanner, twistIcon } from '../ui/twist';
import type { HomeSceneData } from './HomeScene';
import { clampDoorLabels } from '../ui/doorLabel';
import { VISIBLE_ROWS, cameraBounds } from '../game/cameraView';

/** Pixels per tile in the world (before camera zoom). */
const TILE = 48;
/** B-T3: how long an enemy whose art has no defeat animation takes to fade out (ms; a visual choice, not balance). */
const NO_DEFEAT_FADE_MS = 600;
/** Screen pixels the top bar (health, Focus, "Room 1 of 8") takes up. */
const HUD_TOP_PX = 56;
/** Screen y a door label may not rise above: the top bar plus the Challenge timer (top 36, 20 px bold, bottom ~64) and an 8 px gap. */
const DOOR_LABEL_TOP_PX = 72;
/** B-T3-NUDGE: gap between Sensei's banner and the ROAR! word. */
const ROAR_GAP_PX = 8;
/** Screen y of the boss health bar; its name sits just under it. */
// The boss bar sits in the HUD's top strip, between the player's bars and the room label,
// so it never covers the Keeper (K9: it used to sit over the Keeper's head at y 74).
const BOSS_BAR_Y = 16;
/** The bottom of the health and Focus bars (screen px). */
const HUD_BOTTOM = 56;
/** Bottom of the health and Focus bars drawn in drawHud. */
const HUD_BARS_BOTTOM = 51;
const TICK_MS = 1000 / TICKS_PER_SECOND;
/** Never run more than this many ticks in one frame (e.g. after a long pause). */
const MAX_TICKS_PER_FRAME = 10;

/** Draw order for things standing in the room: lower on screen = in front. */
function depthAt(yPx: number): number {
  return 3 + yPx / 10000;
}

/** Game feel: how long the action freezes on impact, and how hard the screen shakes. */
const FEEL = {
  // Small hits barely freeze, so fights with many swarmers stay readable.
  basic: { stopMs: 20, shakeMs: 50, shake: 0.0015 },
  strike: { stopMs: 95, shakeMs: 140, shake: 0.007 },
  perfect: { stopMs: 180, shakeMs: 220, shake: 0.012 },
  block: { stopMs: 60, shakeMs: 90, shake: 0.004 },
  hurt: { stopMs: 90, shakeMs: 170, shake: 0.01 },
  enemyDown: { stopMs: 120, shakeMs: 200, shake: 0.009 },
};

const COLORS = {
  floorA: 0x2a2536,
  floorB: 0x2f2a3d,
  wall: 0x5b4a3c,
  wallTop: 0x7a6553,
  gi: 0xf2e9d8,
  outline: 0x14121c,
  marker: 0xf2c14e,
  brute: 0x7d3f2f,
  bruteAngry: 0xff3b30,
  danger: 0xff3b30,
  shield: 0x6fb7ff,
  health: 0x5cd65c,
  healthLow: 0xe0533d,
  focus: 0x6fb7ff,
  gold: 0xffd166,
};

const DOOR_LOOK: Record<DoorKind, { label: string; color: number }> = {
  battle: { label: 'BATTLE', color: 0xe0533d },
  challenge: { label: 'CHALLENGE', color: 0xb46cff },
  treasure: { label: 'TREASURE', color: 0xffd166 },
  rest: { label: 'REST', color: 0x5cd65c },
  boss: { label: 'BOSS', color: 0xff3b30 },
  home: { label: 'HOME', color: 0xf2e9d8 },
};

interface DoorView {
  kind: DoorKind;
  /** The door's art: frame 0 closed, frame 1 open. */
  images: Phaser.GameObjects.Image[];
  art: string;
  /** The boss door's gold glow, pulsing while the room is being fought (empty for other doors). */
  glow: Phaser.GameObjects.Image[];
  label: Phaser.GameObjects.Text;
  at: Vec2;
}

/** Which door art each kind of door uses (the home door borrows the rest door until it gets its own). */
const DOOR_ART: Record<DoorKind, string> = {
  battle: 'door-battle',
  challenge: 'door-challenge',
  treasure: 'door-treasure',
  rest: 'door-rest',
  boss: 'door-boss',
  home: 'door-rest',
};

/** What the game scene is started with: a run in progress, or nothing for the practice room. */
export interface GameSceneData {
  run?: RunState;
}

/** B-MASHER-a shield-bounce glow: soft gold, 0.4 s. */
const SHIELD_GLOW_COLOR = 0xf2c75c;
const SHIELD_GLOW_MS = 400;
/** B-MASHER-2: stands for "this run" in rooms played without a run (the training room). */
const NO_RUN_KEY: { mashGuardSeen: string[] } = { mashGuardSeen: [] };

interface EnemyView {
  container: Phaser.GameObjects.Container;
  /** The creature's art (body, glow, warning glow, defeat light, shield). */
  sprite: LayeredSprite;
  /** B-T3: the art id it was built with (a phase boss is rebuilt when its rig changes). */
  rig: string | undefined;
  hpFill: Phaser.GameObjects.Rectangle;
  hpBack: Phaser.GameObjects.Rectangle;
  stars: Phaser.GameObjects.Arc[];
  /** Its colour, for sparks and rings. */
  color: number;
  /** Its height above the feet (px), for the dizzy stars and sweat drops. */
  top: number;
  prev: Vec2;
  flashUntil: number;
  /** B-T3-TUNE-2a: a short grey tint when a hit clangs off the pot lid, until this time. */
  clangUntil: number;
  /** The mode drawn last frame, to start animations when it changes. */
  lastMode: string;
  /** The attack being wound up (its animation plays when it lands). */
  attack: string;
  /** A disarmed enemy with a weapon is pushing this attack instead (no staff drawn, push-paw animation). */
  pushing: boolean;
  /** A short flinch when hit, until this time. */
  hitUntil: number;
  /** Calling for help (the boss), until this time. */
  callUntil: number;
  /** When it was beaten (the dissolve into light plays), or null. */
  defeatAt: number | null;
  /** Elite aura art (test link only for now): its id and its back and front images. */
  aura: { id: string; back: Phaser.GameObjects.Image[]; front: Phaser.GameObjects.Image[] } | null;
  /** A named monster's extras (M7-N1): sparkles, name plate and tag, its tell. */
  named: NamedView | null;
}

/** The warning glow's colour while a creature winds up (matches the danger circle). */
const TELEGRAPH_TINT = 0xff3b30;
/** B-T3-TUNE-2b: the Hearth Cook's boss-bar lid icon (#299). */
const LID_ICON_PACK = 'hearth-cook-lid-icon';

/**
 * The room. The rules package decides what happens, 20 times a second;
 * this scene only draws it (blending between ticks so motion looks smooth)
 * and adds the effects and sounds that make hits feel good.
 */
export class GameScene extends Phaser.Scene {
  private room!: Room;
  private world!: WorldState;
  private readonly me: PlayerId = 'p1';
  /** The run in progress (null in the practice room). */
  private run: RunState | null = null;
  /** The student's real progress, and the character it makes (level, abilities, Virtue). */
  private training!: TrainingState;
  private setup!: CharacterSetup;
  /** Aura around the character while a Virtue lasts. */
  private virtueAura!: Phaser.GameObjects.Arc;
  /** True while a menu (like the Insight choice) is open: the fight is paused. */
  private menuOpen = false;
  /** The hero is down (the run is over): no boss tag or bar, no fight buttons or stick (Q-PREM-F4). */
  private downed = false;
  /** B-MASHER-d1: when the hero went down, whether a tap skipped Screen 1, and what runs after it. */
  private downAt = 0;
  private helpUpSkipped = false;
  private afterHelpUp: (() => void) | null = null;
  /** Live floating texts and pop words, cleared when the hero goes down (Q-PREM-F4). */
  private popups = new Set<Phaser.GameObjects.Text>();
  /** Tutorial floor (K24a): where the step flow is, the tip's Got it button, and the success line to lead the next tip. */
  private tflow: TutorialFlow | null = null;
  private gotItBtn: Phaser.GameObjects.Text | null = null;
  private tutorialLead = '';
  /** Tiles walked since the 'use all of it' tip (walkAround). */
  private walked = 0;
  /** True once leaving the room (next room, or home). */
  private leaving = false;
  private picker: InsightPicker | null = null;
  private doorViews: DoorView[] = [];
  /** K31: world box of the boss's name + small bar, for the '!' cue to avoid. */
  private bossTagWorld: { left: number; right: number; top: number; bottom: number } | null = null;
  private chestImgs: Phaser.GameObjects.Image[] = [];
  private shrineImgs: Phaser.GameObjects.Image[] = [];
  /** When the chest started opening (its 2.5 s opening plays once), or null. */
  private chestOpenAt: number | null = null;
  private roomLabel!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private bossName!: Phaser.GameObjects.Text;
  /** B-T3-NUDGE: the phase pause's ROAR! word (screen space, under the Sensei banner). */
  /** A world box in screen points. */
  private toScreen(w: { left: number; right: number; top: number; bottom: number }): { left: number; right: number; top: number; bottom: number } {
    const cam = this.cameras.main;
    const z = cam.zoom / DPR;
    return { left: (w.left - cam.worldView.x) * z, right: (w.right - cam.worldView.x) * z, top: (w.top - cam.worldView.y) * z, bottom: (w.bottom - cam.worldView.y) * z };
  }

  private playerOnScreen() {
    return this.toScreen(this.player.getBounds());
  }

  /** Every enemy name label on screen: the boss's name + bar pair and named monsters' plates and tags. */
  private nameLabelsOnScreen() {
    const boss = this.world.enemies.find((e) => e.def.boss && e.mode !== 'defeated');
    if (boss && this.bossName.visible) this.placeBossTag(boss);
    const world = [...(this.bossName.visible && this.bossTagWorld ? [this.bossTagWorld] : []), ...[...this.enemyViews.values()].flatMap((v) => v.named?.labelBounds() ?? [])];
    return world.map((b) => this.toScreen(b));
  }

  /** B-T3-NUDGE: nudge a screen text vertically (down first, then up) until it is 8 px clear of every box and never above minTop. */
  private nudgeClear(t: Phaser.GameObjects.Text, boxes: { left: number; right: number; top: number; bottom: number }[], minTop: number): void {
    const { height } = view(this);
    const b = t.getBounds();
    const h = b.height;
    const xs = boxes.filter((o) => b.left < o.right && b.right > o.left);
    const hits = (top: number) => xs.find((o) => top < o.bottom + ROAR_GAP_PX && top + h > o.top - ROAR_GAP_PX);
    const tryDir = (dir: 1 | -1): number | null => {
      let top = Math.max(minTop, b.top);
      for (let i = 0; i < 12; i++) {
        const o = hits(top);
        if (!o) return top >= minTop && top + h <= height ? top : null;
        top = dir > 0 ? o.bottom + ROAR_GAP_PX : o.top - ROAR_GAP_PX - h;
      }
      return null;
    };
    const top = tryDir(-1) ?? tryDir(1);
    if (top !== null) t.y += top - b.top;
  }

  /** B-T3-NUDGE: shift a screen-space text stack off the player: above their head, else below their feet; never above minTop. */
  private keepOffPlayer(stack: Phaser.GameObjects.Text[], minTop: number): void {
    const cam = this.cameras.main;
    const w = this.player.getBounds();
    const z = cam.zoom / DPR;
    const p = { top: (w.top - cam.worldView.y) * z, bottom: (w.bottom - cam.worldView.y) * z, left: (w.left - cam.worldView.x) * z, right: (w.right - cam.worldView.x) * z };
    const bs = stack.map((t) => t.getBounds());
    const top = Math.min(...bs.map((b) => b.top));
    const bottom = Math.max(...bs.map((b) => b.bottom));
    const hits = bs.some((b) => b.left < p.right && b.right > p.left) && top < p.bottom && bottom > p.top;
    if (!hits) return;
    let newTop = p.top - ROAR_GAP_PX - (bottom - top);
    if (newTop < minTop) newTop = p.bottom + ROAR_GAP_PX;
    stack.forEach((t) => (t.y += newTop - top));
  }

  private roarText: Phaser.GameObjects.Text | null = null;
  /** B-T3-NUDGE: the boss's "Help me!" when its helpers come with a phase pause (under ROAR!). */
  private helpText: Phaser.GameObjects.Text | null = null;
  private toastY = 0;
  /** Decoration labels on screen and where they'd like to be (K12). */
  private decoToasts: Array<{ t: Phaser.GameObjects.Text; y: number }> = [];
  private twistBadge: Phaser.GameObjects.Container | null = null;
  private twistBannerView: Phaser.GameObjects.Container | null = null;
  /** While a twist banner shows, the big message starts below this y (0 = no limit). */
  private messageTop = 0;
  private prevPos: Vec2 = { x: 0, y: 0 };
  private elapsed = 0;
  /** When the room's enemies appeared (null until the floor's bow is done). */
  private enemiesAt: number | null = 0;
  /** While above 0, the action is frozen for a moment on impact. */
  private hitStopMs = 0;

  private player!: Phaser.GameObjects.Container;
  /** The character's art (layers in the real belt), and the one-off move it's playing. */
  private hero!: LayeredSprite;
  private heroAction: string | null = null;
  private shield!: Phaser.GameObjects.Graphics;
  private playerFlashUntil = 0;
  private marker!: Phaser.GameObjects.Arc;
  private danger!: Phaser.GameObjects.Graphics;
  /** K24b: the wind-up cues (a big "!" and a filling ring) above each enemy about to attack. */
  private cues!: Phaser.GameObjects.Graphics;
  /** True this frame when an attack aimed at the player is in its Counter window. */
  private counterWindowOpen = false;
  private tether!: Phaser.GameObjects.Graphics;
  private enemyViews = new Map<string, EnemyView>();

  private controls!: TouchControls;
  private buttons!: ActionButtons;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  // Top-left bars, combo counter and messages (drawn by the screen camera).
  private hud!: Phaser.GameObjects.Graphics;
  private lidIcon: Phaser.GameObjects.Image | null = null;
  private comboText!: Phaser.GameObjects.Text;
  private comboBonusText!: Phaser.GameObjects.Text;
  private shownCombo = 0;
  /** Perfect Counter chain label ("x2", "x3"...) with a glow that grows with the chain. */
  private chainText!: Phaser.GameObjects.Text;
  private shownChain = 0;
  private message!: Phaser.GameObjects.Text;
  private senseiText: Phaser.GameObjects.Text | null = null;
  /** The 'Room clear!' line under the grade, while it shows (K23c: the ability pop-up keeps off it). */
  private gradeLine: Phaser.GameObjects.Text | null = null;
  private screenFlash!: Phaser.GameObjects.Rectangle;

  /** The tower art for the student's belt tier (or the ?tower= test link). */
  private towerPack: PackName = 'tower-t1';

  /** Tutorial floor (M7-P2): the glowing spot, and whether Strike has been taught in the boss room. */
  private goalView: Phaser.GameObjects.Arc | null = null;
  private strikeTaught = false;
  /** Sensei's Lessons (M7-P5): this run's tag for the one-lesson-per-room limit, and warnings still filling. */
  private runTag = '';
  private warnings = new Map<string, { until: number; inside: boolean }>();
  /** R-CHALLENGE P4: enemies whose first-sight pattern line played this fight (skips the boss phase line). */
  private patternLineSaid = new Set<string>();
  private strikeHit = false;

  constructor() {
    super('Game');
  }

  init(data: GameSceneData): void {
    this.run = data.run ?? null;
  }

  preload(): void {
    this.towerPack = towerPack(currentTraining().belt.tier);
    // Elite auras (S1 #3): needed once elites can appear (4th belt on), or for the test links.
    const tier = currentTraining().belt.tier;
    const auras = testAura() || testFlags().has('elite') || (this.run && (tier >= 4 || this.run.elites.length > 0));
    loadArt(this, [...playerPacks(), 'enemies-t1', this.towerPack, ICON_PACK, ...(auras ? ['auras-t1' as const] : []), ...(this.run?.named ? [NAMED_PACK] : []), ...ENEMY_ART_PACKS, LID_ICON_PACK]);

    loadGearIcons(this);
  }

  /** K25: character art plays at the game tempo (read by LayeredSprite). */
  readonly animTempo: number = TEMPO.speed;

  create(): void {
    this.tweens.timeScale = TEMPO.speed;
    this.training = currentTraining();
    this.setup = characterSetup(loadSave(), this.training, CONTENT.abilities);
    if (this.run) {
      this.room = currentRoom(CONTENT, this.run);
      this.world = createRunWorld(withForced(CONTENT, testForced()), this.run, this.setup, this.setup.effects, undefined, testGuide() ?? loadSave().guideStep, COUNTER_HINT);
      // K24a: on the tutorial's first room, enemies wait and waves come only when Sensei's step lets them in.
      if (this.run.tutorial && this.room.kind === 'battle') {
        this.world.enemyHold = true;
        this.world.waveHold = true;
        this.world.seeAll = true;
      }
      this.tflow = null;
      this.gotItBtn = null;
      this.tutorialLead = '';
    } else {
      // Q-P4 QA: ?force=wide-bonk puts the attack's owner (the bopper) in Practice, at Challenge, with only that attack.
      const forced = testForced();
      this.room = loadRoom(forced ? { ...trainingRoom, enemies: trainingRoom.enemies.map((e) => ({ ...e, enemy: forced.id })) } : trainingRoom);
      this.world = createWorld(this.room, [this.me], {
        enemyTypes: forced ? { [forced.id]: forced.def } : { brute: loadEnemy(bruteData) },
        ...(forced ? { challengeAt: { belt: forced.def.challenge!.fromBelt, room: forced.def.challenge!.fromRoom } } : {}),
        difficulty: forced ? 'challenge' : testDifficulty(),
        guideStep: testGuide() ?? loadSave().guideStep,
        player: { ...this.setup, mods: modsFrom(this.setup.effects, TICKS_PER_SECOND) },
      });
    }
    // Save the run at the start of each room, so closing the app doesn't lose it (M7-P11).
    if (this.run) saveRunInProgress(this.run);
    if (this.run) {
      // The grown-up's play-time limit (M7-P9): checked every few seconds, never shown as a timer.
      const limitProfile = loadSave();
      const check = () => {
        if (!this.run || this.run.wrapUp || this.run.status !== 'playing' || !isPlayTimeUp(limitProfile)) return;
        wrapUpRun(this.run);
        this.senseiSay([PLAY_TIME_TEXT.wrapUpLine], 2200);
      };
      this.time.addEvent({ delay: 2000, loop: true, callback: check });
      this.time.delayedCall(1500, check);
    }
    this.senseiText = null;
    this.counterTip = null;
    this.gradeLine = null;
    this.menuOpen = false;
    this.downed = false;
    this.helpUpSkipped = false;
    this.afterHelpUp = null;
    // B-MASHER-d1: a tap anywhere skips Screen 1 (Sensei helping the hero up) on a run.
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (!this.downed || !this.run || this.helpUpSkipped || this.time.now - this.downAt < 300) return;
      this.helpUpSkipped = true;
      // Q-PREM-F11: end the knock-out pause now, so Screen 2 comes on the next tick, not ~1.75 s later.
      skipDown(this.world, this.me);
      this.afterHelpUp?.();
    });
    this.popups.clear();
    this.leaving = false;
    this.picker = null;
    this.doorViews = [];
    this.toastY = 0;
    this.decoToasts = [];
    this.prevPos = { ...this.world.players[this.me].pos };
    this.elapsed = 0;
    this.hitStopMs = 0;
    this.enemyViews.clear();
    this.shownCombo = 0;
    this.shownChain = 0;
    this.heroAction = null;

    this.chestOpenAt = null;
    this.strikeTaught = false;
    this.runTag ||= `run-${Date.now()}`;
    this.warnings.clear();
    this.patternLineSaid.clear();
    this.strikeHit = false;
    const roomGfx = this.drawRoom();
    const objects = this.makeRoomObjects();
    // Lantern Dark twist: the room is dim, but the warning circles are drawn on top, extra bright.
    const dim = this.world.twist?.dim ?? false;
    if (dim) {
      const w = this.room.width * TILE;
      const h = this.room.height * TILE;
      objects.push(this.add.rectangle(0, 0, w, h, 0x05040a, 0.5).setOrigin(0).setDepth(9));
    }
    // Guarding tethers sit just under the red danger shapes.
    this.tether = this.add.graphics().setDepth(dim ? 9.5 : 0.9);
    this.danger = this.add.graphics().setDepth(dim ? 10 : 1);
    this.cues = this.add.graphics().setDepth(9.5);
    this.marker = this.add.circle(0, 0, TILE * 0.22).setStrokeStyle(3, COLORS.marker, 0.9).setVisible(false).setDepth(2);
    this.player = this.makePlayer();

    // Two cameras: one follows the character through the room, one holds the on-screen controls.
    const cam = this.cameras.main;
    cam.startFollow(this.player, true);
    // Q-DOOR-LABELS-2: the side clamp runs after the camera has moved this frame (Phaser emits
    // FOLLOW_UPDATE in preRender, after the follow scroll and worldView update), so a label is never
    // closer than 8 px to the edge, even in the first frames of a scroll.
    cam.on(Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE, this.clampDoorLabels, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cam.off(Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE, this.clampDoorLabels, this));
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    hiDpi(this.uiCamera);
    // The Guarding tether is world art too, or the screen camera draws a ghost copy (elites QA bug 1).
    this.uiCamera.ignore([...roomGfx, ...objects, this.tether, this.danger, this.cues, this.marker, this.player]);

    for (const e of this.world.enemies) this.makeEnemy(e);

    const p0 = this.world.players[this.me];
    this.buttons = new ActionButtons(this, () => sfx.unlock(), { stances: p0.stances.length > 1, virtue: !!p0.virtue });
    this.controls = new TouchControls(
      this,
      cam,
      (x, y) => ({ x: x / TILE, y: y / TILE }),
      (x, y) => this.menuOpen || this.buttons.contains(x, y) || this.onHomeButton(x, y),
    );
    this.makeHud();
    cam.ignore([...this.controls.objects, ...this.buttons.objects]);
    cam.fadeIn(350, 10, 8, 16);
    this.enemiesAt = 0;
    if (this.run && this.run.depth === 0 && !this.run.bowed) this.askForBow();
    else this.introduceRoom();

    this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    // Let go of everything if the app goes to the background mid-touch.
    const release = () => {
      this.controls.reset();
      this.buttons.reset();
    };
    this.game.events.on(Phaser.Core.Events.HIDDEN, release);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
      this.game.events.off(Phaser.Core.Events.HIDDEN, release);
    });
  }

  update(_time: number, delta: number): void {
    // K23: the camera follows the player, so a door can slide under Sensei's banner at any time.
    if (this.menuOpen || this.leaving) {
      // Paused: drop any touches so nothing happens when play resumes.
      this.controls.takeInput();
      this.buttons.takeAction();
      this.elapsed = 0;
    } else if (this.hitStopMs > 0) {
      // Freeze the action briefly on impact; effects and the camera keep moving.
      this.hitStopMs -= delta;
    } else {
      // Run the rules at a fixed 20 ticks per second, whatever the screen's frame rate.
      this.elapsed = Math.min(this.elapsed + delta * this.guideSpeed() * TEMPO.speed, TICK_MS * MAX_TICKS_PER_FRAME);
      while (this.elapsed >= TICK_MS) {
        this.savePrevious();
        const move = this.controls.takeInput();
        const action = this.buttons.takeAction();
        const input: PlayerInput = action ? { ...move, action } : move;
        const before = { ...this.world.players[this.me].pos };
        stepWorld(this.world, this.room, { [this.me]: input });
        this.elapsed -= TICK_MS;
        const after = this.world.players[this.me].pos;
        this.walked += Math.hypot(after.x - before.x, after.y - before.y);
        this.playEvents(this.world.events);
        this.tutorialTick();
        if (this.run) this.playRunEvents(updateRun(CONTENT, this.run, this.world));
        this.checkStrikeLesson();
        if (this.hitStopMs > 0 || this.menuOpen || this.leaving) break;
      }
    }
    this.draw(Math.min(1, this.elapsed / TICK_MS));
  }

  private savePrevious(): void {
    this.prevPos = { ...this.world.players[this.me].pos };
    for (const e of this.world.enemies) {
      const v = this.enemyViews.get(e.id);
      if (v) v.prev = { ...e.pos };
    }
  }

  // ---------------------------------------------------------------- drawing

  private draw(blend: number): void {
    const now = this.time.now;
    const p = this.world.players[this.me];
    const x = Phaser.Math.Linear(this.prevPos.x, p.pos.x, blend);
    const y = Phaser.Math.Linear(this.prevPos.y, p.pos.y, blend);
    this.player.setPosition(x * TILE, y * TILE).setDepth(depthAt(y * TILE));
    this.animateHero(p, now);

    const r = MOVEMENT.playerRadius * TILE;

    // A Virtue in effect: a golden shield (Respect) or a calm blue glow (Discipline).
    const lasting = p.virtueTicks > 0 && p.virtue;
    this.virtueAura.setVisible(!!lasting);
    if (lasting) {
      const shield = p.virtue!.kind === 'shield';
      this.virtueAura.setStrokeStyle(shield ? 5 : 4, shield ? COLORS.gold : 0x9ad1ff, 0.6 + Math.sin(now / 90) * 0.3);
      this.virtueAura.setScale(1 + Math.sin(now / 160) * 0.05);
    }

    // Guard pose: a shield arc in front of the character.
    this.shield.clear();
    if (p.guardTicks > 0) {
      const angle = Math.atan2(p.facing.y, p.facing.x);
      this.shield.lineStyle(6, COLORS.shield, 0.95);
      this.shield.beginPath();
      this.shield.arc(0, 0, r * 1.35, angle - 1.1, angle + 1.1);
      this.shield.strokePath();
    }

    const end = p.path?.[p.path.length - 1];
    this.marker.setVisible(!!end);
    if (end) {
      this.marker.setPosition(end.x * TILE, end.y * TILE);
      this.marker.setScale(1 + Math.sin(now / 120) * 0.12);
    }

    this.danger.clear();
    this.cues.clear();
    this.counterWindowOpen = false;
    this.drawTethers(now);
    this.syncEnemyViews();
    for (const e of this.world.enemies) this.drawEnemy(e, blend, now);
    this.buttons.counterWindow(this.counterWindowOpen);

    this.buttons.update(p);
    this.placeCounterTip();
    this.drawHud();
    this.drawRunHud(now);
  }

  /** Guarding elites (S1 #3): a soft blue line to each enemy they protect, and a glow at its feet. */
  private drawTethers(now: number): void {
    const g = this.tether;
    g.clear();
    if (this.enemiesAt === null) return;
    const pulse = 0.55 + 0.2 * Math.sin(now / 220);
    for (const e of this.world.enemies) {
      if (e.guardedBy === null || e.mode === 'defeated') continue;
      const by = this.world.enemies.find((x) => x.id === e.guardedBy);
      const a = this.enemyViews.get(e.id)?.container;
      const b = by && this.enemyViews.get(by.id)?.container;
      if (!a || !b) continue;
      g.lineStyle(5, 0x7fc8ff, pulse * 0.35).lineBetween(b.x, b.y, a.x, a.y);
      g.lineStyle(2, 0xcfeaff, pulse).lineBetween(b.x, b.y, a.x, a.y);
      g.fillStyle(0x7fc8ff, pulse * 0.45).fillEllipse(a.x, a.y + 2, TILE * 0.9, TILE * 0.35);
    }
  }

  /** Picks the character's animation: a one-off move (punch, dash, ...), else walk or idle. */
  private animateHero(p: WorldState['players'][string], now: number): void {
    const s = this.hero;
    s.face(p.facing.x, p.facing.y);
    if (p.downTicks > 0) {
      s.play('defeat');
    } else {
      const a = this.heroAction;
      // A move ends when it's done, except the guard pose, held while guarding.
      if (a && (s.current !== a || s.finished) && !(a === 'counter' && p.guardTicks > 0)) this.heroAction = null;
      if (!this.heroAction) {
        const speed = Math.hypot(p.pos.x - this.prevPos.x, p.pos.y - this.prevPos.y) * TICKS_PER_SECOND;
        playLocomotion(s, p.moving ? speed : 0, activeStance(p).id);
      }
    }
    s.flash(now < this.playerFlashUntil ? 0xff8a80 : null);
    s.update();
  }

  /** Starts a one-off move on the character (frames `from`..`to` of the animation). */
  /**
   * K24b: the wind-up cue, drawn in code. A big "!" in a ring that fills as the attack winds up.
   * In the Counter window the ring is full and gold, and (unless Reduced motion) the "!" gently pulses.
   */
  private drawWindupCue(x: number, y: number, fill: number, inWindow: boolean, now: number): void {
    const g = this.cues;
    const pulse = inWindow && !reducedMotion() ? 1 + 0.15 * Math.abs(Math.sin(now / 90)) : 1;
    const r = 15 * pulse;
    // K27 fix 2: always full strength (opaque disc, solid colors) so it never reads faint over art.
    const color = inWindow ? 0xffd166 : 0xff5a4f;
    g.fillStyle(0x1b1530, 1).fillCircle(x, y, r + 4);
    g.lineStyle(2, 0xffffff, 1).strokeCircle(x, y, r + 4);
    g.lineStyle(4, 0x4a4060, 1).strokeCircle(x, y, r);
    g.lineStyle(5, color, 1).beginPath();
    g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Phaser.Math.Clamp(inWindow ? 1 : fill, 0.02, 1), false);
    g.strokePath();
    // The "!": a rounded bar and a dot.
    g.fillStyle(color, 1).fillRoundedRect(x - 3 * pulse, y - 10 * pulse, 6 * pulse, 13 * pulse, 3 * pulse);
    g.fillCircle(x, y + 7 * pulse, 3.2 * pulse);
  }

  private heroDo(name: string, from?: number, to?: number): void {
    this.heroAction = name;
    this.hero.play(name, { restart: true, from, to });
  }

  private drawEnemy(e: EnemyState, blend: number, now: number): void {
    const v = this.enemyViews.get(e.id);
    if (!v) return;
    const s = v.sprite;
    // Beaten: dissolve into light (a hopeful "set free"), then disappear.
    // Art without a defeat animation (B-T3 Orange enemies) fades out over the same kind of time instead.
    const defeat = s.art.animations.defeat as { frames: number; fps: number } | undefined;
    const defeatMs = defeat ? (defeat.frames / defeat.fps) * 1000 : NO_DEFEAT_FADE_MS;
    const dissolving = e.mode === 'defeated' && v.defeatAt !== null && now - v.defeatAt < defeatMs;
    // Before the bow, the room's enemies haven't arrived yet.
    v.container.setVisible((e.mode !== 'defeated' || dissolving) && this.enemiesAt !== null);
    if ((e.mode === 'defeated' && !dissolving) || this.enemiesAt === null) {
      v.lastMode = e.mode;
      return;
    }

    const x = Phaser.Math.Linear(v.prev.x, e.pos.x, blend);
    const y = Phaser.Math.Linear(v.prev.y, e.pos.y, blend);
    v.container.setPosition(x * TILE, y * TILE).setDepth(depthAt(y * TILE));
    v.hpFill.width = (v.hpBack.width - 4) * (e.health / e.def.maxHealth);
    v.hpBack.setVisible(e.mode !== 'defeated');
    v.hpFill.setVisible(e.mode !== 'defeated');
    s.face(e.facing.x, e.facing.y);
    if (v.aura) {
      const a = staticArt(this, 'auras-t1', v.aura.id);
      if (a) setStaticFrame(this, 'auras-t1', v.aura.id, [...v.aura.back, ...v.aura.front], Math.floor((now / 1000) * (a.fps ?? 10)) % a.frames);
    }
    const started = e.mode !== v.lastMode;
    v.lastMode = e.mode;

    let alpha = 1;
    let telegraph = 0;
    let tint: number | null = null;

    if (e.mode === 'defeated') {
      const t = Phaser.Math.Clamp((now - (v.defeatAt ?? now)) / defeatMs, 0, 1);
      if (defeat) {
        if (started || s.current !== 'defeat') s.play('defeat', { restart: true });
      } else {
        s.play(this.enemyAnim(s, 'hit', 'idle'));
        alpha = 1 - t;
      }
      // The dissolve is drawn a little bigger and glowing, and its shadow fades with it.
      s.container.setScale(1 + 0.3 * Math.min(1, t * 3));
      (s.container.list[0] as Phaser.GameObjects.Ellipse | undefined)?.setAlpha(1 - t);
    } else if (e.mode === 'waiting') {
      s.container.setScale(1);
      (s.container.list[0] as Phaser.GameObjects.Ellipse | undefined)?.setAlpha(1);
      alpha = 1 - (e.modeTicks / COMBAT.enemySpawnWaitTicks) * 0.8;
      s.play('idle');
    } else if (e.mode === 'windup' && e.attackCenter) {
      // The telegraph: the danger area fills up to "nearly full", then holds nearly full
      // (creeping to the edge) while the Perfect Counter window is open, with a brighter
      // ring. At the edge, the attack lands. The wind-up animation and its warning glow
      // follow the same clock, so they always end exactly when the attack lands.
      const window = counterWindowTicks(this.world, this.world.players[this.me]);
      const fillTicks = Math.max(1, e.windupTotal - window);
      const elapsed = Math.min(e.windupTotal, e.windupTotal - e.modeTicks + blend);
      const inWindow = elapsed >= fillTicks;
      const progress = inWindow
        ? TELEGRAPH_NEARLY_FULL + (1 - TELEGRAPH_NEARLY_FULL) * ((elapsed - fillTicks) / window)
        : TELEGRAPH_NEARLY_FULL * (elapsed / fillTicks);
      v.attack = attackAnim(currentAttack(e).name ?? '');
      // Disarmed (A5): same wind-up and warning, but the staff is gone and it pushes.
      v.pushing = !!e.def.weapon && e.disarmed > 0;
      const anim = this.enemyAnim(s, `windup_${v.attack}`, 'windup');
      const frames = s.art.animations[anim].frames;
      s.showFrame(anim, (elapsed / e.windupTotal) * frames);
      const pulse = inWindow && Math.sin(now / 45) < 0 ? 0.7 : 1;
      telegraph = (s.art.animations[anim].telegraphIntensity?.[s.frame] ?? progress) * pulse;
      const cx = e.attackCenter.x * TILE;
      const cy = e.attackCenter.y * TILE;
      const area = currentAttack(e).areaRadius * TILE;
      const glow = this.world.twist?.dim ? 1.6 : 1; // Lantern Dark: warnings glow extra bright
      // R-CHALLENGE P4: a pattern's lane or landing hop, from the first frame of the wind-up.
      const shape = patternShape(currentAttack(e));
      if (shape) drawPatternTell(this.danger, shape, { x: e.pos.x * TILE, y: e.pos.y * TILE }, { x: cx, y: cy }, area, COLORS.danger, elapsed / e.windupTotal, !reducedMotion());
      if (glow > 1) this.danger.lineStyle(10, 0xffd166, 0.35).strokeCircle(cx, cy, area + 4);
      this.danger.fillStyle(COLORS.danger, 0.16 * glow).fillCircle(cx, cy, area);
      this.danger.lineStyle(inWindow ? 6 : 3 * glow, inWindow ? 0xff8a80 : COLORS.danger, inWindow ? 1 : 0.9).strokeCircle(cx, cy, area);
      this.danger.fillStyle(COLORS.danger, inWindow ? 0.5 : 0.4).fillCircle(cx, cy, area * progress);
      if (inWindow) this.counterWindowOpen = true;
      const at = this.windupCueSpot(x * TILE, y * TILE, v.top, e.def.radius * TILE);
      this.drawWindupCue(at.x, at.y, elapsed / e.windupTotal, inWindow, now);
    } else if (e.mode === 'recover') {
      // The attack itself (it lands on its first frame), then catching its breath.
      const anim = v.pushing ? this.enemyAnim(s, 'pushpaw', 'attack') : this.enemyAnim(s, v.attack, 'attack');
      if (started) s.play(anim, { restart: true });
      telegraph = s.art.animations[anim].telegraphIntensity?.[s.frame] ?? 0;
    } else if (e.mode === 'stagger') {
      s.play(this.enemyAnim(s, 'stagger', 'idle'));
    } else if (e.mode === 'winded') {
      // Out of breath: pale, slumped, and breathing hard.
      s.play(this.enemyAnim(s, 'winded', this.enemyAnim(s, 'stagger', 'idle')));
      tint = 0xd8d0c4;
    } else if (now < v.callUntil) {
      s.play(this.enemyAnim(s, 'call', 'idle'));
    } else if (now < v.hitUntil) {
      s.play(this.enemyAnim(s, 'hit', 'idle'));
    } else {
      // Chasing or circling: walk while moving, at a pace matched to its speed.
      const speed = Math.hypot(e.pos.x - v.prev.x, e.pos.y - v.prev.y) * TICKS_PER_SECOND;
      const design = (s.art.animations.move as { designSpeedTilesPerSecond?: number }).designSpeedTilesPerSecond ?? 2;
      if (speed > 0.2) s.play('move', { speed: Phaser.Math.Clamp(speed / design, 0.5, 2) });
      else s.play('idle');
    }

    if (e.mode !== 'windup' && e.mode !== 'recover') v.pushing = false;
    // The staff (weapon layer) is hidden while disarmed.
    if (e.def.weapon) s.setLayer('weapon', !v.pushing && e.disarmed === 0);
    // The warning glow, only while winding up and swinging.
    s.setLayer('telegraph', telegraph > 0.01);
    s.images.get('telegraph')?.setAlpha(Phaser.Math.Clamp(telegraph, 0, 1));
    // Shield guards: the shield while it's up, the cracked one once broken.
    s.setLayer('shield', e.shieldUp);
    s.setLayer('shield-broken', !e.shieldUp);
    // B-T3-TUNE-2b: the Hearth Cook's pot lid (#299 art) shows while its sparks keep the lid up.
    s.setLayer('lid', !!e.def.lidWhileHelpers && lidUp(this.world));
    // Reduced motion (K12): no white hit flash.
    const hitFlash = now < v.flashUntil && !reducedMotion();
    // B-T3-TUNE-2a: a clang on the pot lid tints it grey for a moment (none with reduced motion).
    const clang = now < v.clangUntil && !reducedMotion();
    s.flash(hitFlash ? 0xffffff : clang ? 0x8c8c8c : tint, hitFlash);
    s.update();
    if (v.named) this.drawNamed(e, v.named, now, blend, s.frame);
    v.container.setAlpha(alpha * Math.min(1, (now - this.enemiesAt) / 450));

    // Dizzy stars circling a staggered enemy; sweat drops on a winded one.
    const r = e.def.radius * TILE;
    const dizzy = e.mode === 'stagger';
    const winded = e.mode === 'winded';
    v.stars.forEach((st, i) => {
      st.setVisible(dizzy || winded);
      if (dizzy) {
        const a = now / 180 + (i * Math.PI * 2) / v.stars.length;
        st.setFillStyle(COLORS.gold).setScale(1).setPosition(Math.cos(a) * r * 0.8, -v.top - 4 + Math.sin(a) * r * 0.25);
      } else if (winded) {
        const fall = ((now / 600 + i / v.stars.length) % 1) * r * 0.9;
        st.setFillStyle(0x9ad1ff).setScale(1.5).setPosition((i - 1) * r * 0.7, -v.top * 0.8 + fall);
      }
    });
  }

  /**
   * R-CHALLENGE P4: a pattern attack's wind-up starts. Its own sound on top of the wind-up sound
   * (lane: whoosh, two-part: clank), and Sensei's line the first time this save sees it.
   */
  private patternTellStart(e: EnemyState): void {
    const a = currentAttack(e);
    const shape = patternShape(a);
    if (!shape) return;
    if (shape === 'lane') sfx.whoosh();
    else if (a.followUp || e.followUpStage === 2) sfx.clank();
    if (!a.senseiLine) return;
    const profile = loadSave();
    if (!firstPatternSight(profile, patternKey(e.def.id, a))) return;
    writeSave(profile);
    this.patternLineSaid.add(e.id);
    this.senseiSay([a.senseiLine], 1600);
    // The line goes away on its own, so it doesn't sit over the next warnings.
    const t = this.senseiText;
    this.time.delayedCall(2600, () => {
      if (t && t === this.senseiText) {
        t.destroy();
        this.senseiText = null;
      }
    });
  }

  /** A named monster: the first time it's seen, Sensei says hello and the journal remembers it; then its plate, tag and tell. */
  private drawNamed(e: EnemyState, n: NamedView, now: number, blend: number, frame: number): void {
    if (n.shownAt === null && e.mode !== 'waiting' && e.mode !== 'defeated') {
      n.shownAt = now;
      const profile = loadSave();
      // K12: the very first named monster ever met also gets Sensei's journal intro.
      const firstEver = !Object.values(profile.monsterJournal).some((j) => j.met);
      const met = this.run ? meetNamed(profile, this.run, n.def.id) : false;
      writeSave(profile);
      const intro = met && firstEver ? [CONTENT.named.senseiIntro.replace(/^Sensei:\s*/, '')] : [];
      this.senseiSay([...intro, n.def.lines.meet, n.def.lines.senseiTip], 1800);
    }
    // K12: plate and tag clear of other creatures, the player and the HUD.
    const others = [
      ...this.world.enemies.filter((o) => o.id !== e.id && o.mode !== 'defeated').map((o) => o.pos),
      ...Object.values(this.world.players).map((p) => p.pos),
    ].map((o) => ({ x: (o.x - e.pos.x) * TILE, y: (o.y - e.pos.y) * TILE }));
    const cam = this.cameras.main;
    const feetOnScreen = (e.pos.y * TILE - cam.worldView.y) * (cam.zoom / DPR);
    n.layout(others, (feetOnScreen - HUD_BOTTOM) / (cam.zoom / DPR), e.mode === 'defeated');
    const windupSec = e.mode === 'windup' ? Math.min(e.windupTotal, e.windupTotal - e.modeTicks + blend) / TICKS_PER_SECOND : null;
    if (n.update(e, now, windupSec, frame, TILE, this.shakeScale('windup')).clank) sfx.clank();
  }

  /** B-T3-TUNE-2b: the boss-bar lid icon (24 px), drawn on the HUD; null when its art isn't loaded. */
  private makeLidIcon(): Phaser.GameObjects.Image | null {
    const s = staticArt(this, LID_ICON_PACK, 'icon-lid');
    const f = s && frameOf(this, LID_ICON_PACK, Object.values(s.layers)[0][0]);
    if (!s || !f) return null;
    return this.add.image(0, 0, f[0], f[1]).setOrigin(s.anchor[0] / s.frameWidth, s.anchor[1] / s.frameHeight).setScale(24 / s.frameWidth).setDepth(this.hud.depth + 1).setVisible(false);
  }

  /** The first of these animations the creature has (e.g. the boss's "windup_slam", else "windup"). */
  private enemyAnim(s: LayeredSprite, wanted: string, fallback: string): string {
    if (s.has(wanted)) return wanted;
    if (s.has(fallback)) return fallback;
    return 'idle';
  }

  private drawHud(): void {
    const p = this.world.players[this.me];
    const g = this.hud;
    g.clear();
    const x = 16;
    const w = 190;
    // Health
    const hp = p.health / p.maxHealth;
    g.fillStyle(0x000000, 0.45).fillRoundedRect(x - 3, 13, w + 6, 20, 6);
    if (w * hp >= 8) g.fillStyle(hp > 0.3 ? COLORS.health : COLORS.healthLow).fillRoundedRect(x, 16, w * hp, 14, 4);
    // Focus, with a mark where Strike becomes ready
    const focus = p.focus / COMBAT.focus.max;
    g.fillStyle(0x000000, 0.45).fillRoundedRect(x - 3, 37, w + 6, 14, 5);
    const cost = strikeCost(p);
    const ready = p.focus >= cost;
    if (w * focus >= 6) g.fillStyle(ready ? COLORS.gold : COLORS.focus).fillRoundedRect(x, 40, w * focus, 8, 3);
    const mark = x + (w * cost) / COMBAT.focus.max;
    g.fillStyle(0xffffff, 0.8).fillRect(mark - 1, 37, 2, 14);

    // Basic hits land while the Brute walks in, before the guided Counter; the combo waits for that lesson.
    // K23: the count also clears when the fight ends: no enemies left standing, or the hero is down.
    const fightOver = p.health <= 0 || !this.world.enemies.some((e) => e.mode !== 'defeated');
    const combo = this.world.guide?.step === 0 || fightOver ? 0 : p.combo;
    if (combo !== this.shownCombo) {
      const grew = combo > this.shownCombo;
      this.shownCombo = combo;
      if (combo >= 2) {
        this.comboText.setText(`${combo} COMBO`);
        const bonus = combo >= 30 ? 15 : combo >= 20 ? 10 : combo >= 10 ? 5 : 0;
        this.comboBonusText.setText(bonus ? `+${bonus}% power` : '');
        if (grew) {
          this.tweens.killTweensOf(this.comboText);
          this.comboText.setScale(1.35);
          this.tweens.add({ targets: this.comboText, scale: 1, duration: 140, ease: 'Back.Out' });
        }
      }
      this.comboText.setVisible(combo >= 2);
      this.comboBonusText.setVisible(combo >= 2);
    }

    // Q-PREM-F4: the GREAT chain clears with the combo when the fight ends, so it never sits on the loss message.
    const chain = fightOver ? 0 : p.counterChain;
    if (chain !== this.shownChain) {
      const grew = chain > this.shownChain;
      this.shownChain = chain;
      if (chain >= 2) {
        // Brighter glow as the chain grows (it stops growing at x5).
        const glow = Math.min(chain, 5);
        this.chainText.setText(`GREAT x${chain}`).setShadow(0, 0, '#ffd166', 4 + glow * 4, true, true);
        this.chainText.setColor(glow >= 4 ? '#fff6d5' : '#ffd166');
        if (grew) {
          this.tweens.killTweensOf(this.chainText);
          this.chainText.setScale(1.4);
          this.tweens.add({ targets: this.chainText, scale: 1, duration: 160, ease: 'Back.Out' });
        }
      }
      this.chainText.setVisible(chain >= 2);
    }
  }

  /**
   * The stone room from the art: floor tiles, the tall wall along the top, low stone blocks
   * for other walls, and round pillars for single wall spots inside the room. Walls are
   * drawn front-to-back with the characters, so a wall below a character hides its feet.
   */
  private drawRoom(): Phaser.GameObjects.GameObject[] {
    const out: Phaser.GameObjects.GameObject[] = [];
    const { walls, width, height } = this.room;
    const wall = (r: number, c: number) => r < 0 || c < 0 || r >= height || c >= width || walls[r][c];
    const put = (id: string, x: number, y: number, depth: number) => {
      for (const img of addStatic(this, this.towerPack, id, x, y)) out.push(img.setDepth(depth));
    };
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const x = col * TILE;
        const y = row * TILE;
        const inside = row > 0 && col > 0 && row < height - 1 && col < width - 1;
        const pillar = walls[row][col] && inside && !wall(row - 1, col) && !wall(row + 1, col) && !wall(row, col - 1) && !wall(row, col + 1);
        if (!walls[row][col] || pillar) {
          // A mix of floor tiles, the same every visit (picked from the tile's position).
          const h = ((col * 73856093) ^ (row * 19349663)) >>> 0;
          const pick = h % 100;
          put(pick < 8 ? 'floor-worn' : pick < 30 ? 'floor-quad' : 'floor-big', x, y, 0);
        }
        if (!walls[row][col]) continue;
        if (row === 0) {
          // The top wall. Door slots in use get a door on top (drawn by the run); unused ones stay plain wall.
          put('wall-face', x, y, 0.5);
        } else {
          // A single wall spot inside the room is a round pillar; other walls are stone blocks.
          if (pillar) put('pillar', x + TILE / 2, y + TILE, depthAt(y + TILE / 2));
          else put('wall-block', x, y, depthAt(y + 1));
        }
      }
    }
    return out;
  }

  private makePlayer(): Phaser.GameObjects.Container {
    const r = MOVEMENT.playerRadius * TILE;
    // The character in the real belt's color and stripes.
    this.hero = makePlayerSprite(this, this.training.belt, this.training.stripesThisBelt, loadLook())!;
    this.shield = this.add.graphics();
    this.virtueAura = this.add.circle(0, -r * 0.6, r * 1.6).setStrokeStyle(5, COLORS.gold).setVisible(false);
    return this.add.container(0, 0, [this.virtueAura, this.hero.container, this.shield]);
  }

  /** Adds views for enemies that were called in, and removes views for enemies that are gone. */
  private syncEnemyViews(): void {
    const ids = new Set(this.world.enemies.map((e) => e.id));
    for (const [id, v] of this.enemyViews) {
      if (!ids.has(id)) {
        v.container.destroy();
        this.enemyViews.delete(id);
      }
    }
    for (const e of this.world.enemies) {
      // B-T3: a phase boss swaps to its next rig when it crosses a phase (not while it is being beaten).
      // It waits until the current wind-up and attack are over: the next rig may not have that attack's art.
      const v = this.enemyViews.get(e.id);
      const rig = enemyArt(e.def.id, e.health / e.def.maxHealth)?.id;
      if (v && rig && v.rig !== rig && e.mode !== 'defeated' && e.mode !== 'windup' && e.mode !== 'recover') {
        v.container.destroy();
        this.enemyViews.delete(e.id);
      }
      if (!this.enemyViews.has(e.id)) this.makeEnemy(e);
    }
  }

  private makeEnemy(e: EnemyState): void {
    const r = e.def.radius * TILE;
    const color = Phaser.Display.Color.HexStringToColor(e.def.color).color;
    const own = enemyArt(e.def.id, e.health / e.def.maxHealth);
    const art = (own && characterArt(this, own.pack, own.id)) || characterArt(this, 'enemies-t1', e.def.id)!;
    const sprite = new LayeredSprite(this, art);
    sprite.container.addAt(addShadow(this, r * 2.2), 0);
    sprite.setLayer('telegraph', false).setLayerTint('telegraph', TELEGRAPH_TINT).setLayer('lid', false);
    const top = characterTop(this, art);
    const hpBack = this.add.rectangle(0, -top - 8, r * 2, 8, 0x000000, 0.6);
    const hpFill = this.add.rectangle(-r + 2, -top - 8, r * 2 - 4, 4, COLORS.healthLow).setOrigin(0, 0.5);
    const stars = [0, 1, 2].map(() => this.add.circle(0, 0, 4, COLORS.gold).setVisible(false));
    // Elite aura (S1 #3; ?aura= draws one on every enemy for testing): back layer under the creature, front layer over it.
    // Nothing goes above the head.
    const kind = testAura() ?? e.elite;
    const id = kind ? auraId(kind, e.def.id) : '';
    const [back, front] = kind && staticArt(this, 'auras-t1', id) ? addStatic(this, 'auras-t1', id, 0, 0) : [];
    const aura = back && front ? { id, back: [back], front: [front] } : null;
    // Named monster (M7-N1): its ground tell under it, sparkles, name plate and tag over it. Never an elite aura.
    const namedDef = e.named ? CONTENT.named.monsters.find((m) => m.id === e.named) : undefined;
    const named = namedDef ? new NamedView(this, e, namedDef) : null;
    const container = this.add
      .container(e.pos.x * TILE, e.pos.y * TILE, [...(aura?.back ?? []), ...(named?.behind ?? []), sprite.container, ...(aura?.front ?? []), ...(named?.front ?? []), hpBack, hpFill, ...stars])
      .setDepth(4);
    this.uiCamera.ignore(container);
    this.enemyViews.set(e.id, {
      container,
      sprite,
      rig: own?.id,
      hpBack,
      hpFill,
      stars,
      color,
      top,
      prev: { ...e.pos },
      flashUntil: 0,
      clangUntil: 0,
      lastMode: e.mode,
      attack: '',
      pushing: false,
      hitUntil: 0,
      callUntil: 0,
      defeatAt: null,
      aura,
      named,
    });
  }

  private makeHud(): void {
    const res = crisp();
    this.hud = this.add.graphics();
    this.comboText = this.add
      .text(0, 14, '', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '26px', color: '#ffd166', stroke: '#14121c', strokeThickness: 5 })
      .setOrigin(0.5, 0)
      .setResolution(res)
      .setVisible(false);
    this.comboBonusText = this.add
      .text(0, 46, '', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(0.5, 0)
      .setResolution(res)
      .setVisible(false);
    this.chainText = this.add
      .text(0, 68, '', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '20px', color: '#ffd166', stroke: '#14121c', strokeThickness: 5 })
      .setOrigin(0.5, 0)
      .setResolution(res)
      .setVisible(false);
    this.message = this.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '28px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 6, align: 'center' })
      .setOrigin(0.5)
      .setResolution(res)
      .setVisible(false);
    this.screenFlash = this.add.rectangle(0, 0, 10, 10, 0xffffff).setOrigin(0).setAlpha(0);
    const small = { fontFamily: FONT, fontSize: '15px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 4 };
    this.roomLabel = this.add.text(0, 14, '', small).setOrigin(1, 0).setResolution(crisp());
    if (!this.run) {
      // The practice room has a way back home.
      this.roomLabel
        .setText('◀ Home')
        .setFontSize(18)
        .setPadding(10, 6, 10, 6)
        .setBackgroundColor('#2a2536')
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          if (this.leaving) return;
          this.leaving = true;
          this.cameras.main.fadeOut(300, 10, 8, 16);
          this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Home'));
        });
    }
    this.timerText = this.add
      .text(0, 36, '', { ...small, fontStyle: 'bold', fontSize: '20px' })
      .setOrigin(1, 0)
      .setResolution(crisp())
      .setVisible(false);
    this.bossName = this.add.text(0, 0, '', { ...small, fontSize: '13px' }).setOrigin(0.5, 0).setResolution(crisp()).setVisible(false);
    const calm = this.add.text(16, 55, 'Calm Mind', { ...small, fontSize: '12px', color: '#bff5ec' }).setResolution(crisp()).setVisible(!!this.run?.calmMind);
    this.cameras.main.ignore(calm);
    this.lidIcon = this.makeLidIcon();
    this.cameras.main.ignore([this.hud, this.comboText, this.comboBonusText, this.chainText, this.message, this.screenFlash, this.roomLabel, this.timerText, this.bossName, ...(this.lidIcon ? [this.lidIcon] : [])]);
  }

  private layout(): void {
    const { width, height } = view(this);
    const cam = this.cameras.main;
    cam.setSize(width * DPR, height * DPR);
    const zoom = height / (VISIBLE_ROWS * TILE);
    // The camera zoom also carries DPR (full sharpness); `zoom` stays in screen points.
    cam.setZoom(zoom * DPR);
    // Camera limits: a strip above the top wall keeps doors clear of the health bars,
    // and rooms smaller than the screen sit in the middle.
    const b = cameraBounds(this.room.width, this.room.height, width / zoom, height / zoom, TILE);
    cam.setBounds(b.x, b.y, b.width, b.height);
    this.uiCamera.setSize(width * DPR, height * DPR);
    this.controls.layout();
    this.buttons.layout();
    this.comboText.setX(width / 2);
    this.comboBonusText.setX(width / 2);
    this.chainText.setX(width / 2);
    this.placeMessage();
    this.roomLabel.setX(width - 16);
    this.timerText.setX(width - 16);
    this.screenFlash.setSize(width, height);
  }

  // ---------------------------------------------------------------- effects and sounds

  private playEvents(events: CombatEvent[]): void {
    const countered = new Set<string>();
    for (const ev of events) {
      if (ev.kind === 'perfectCounter' || ev.kind === 'block' || ev.kind === 'hit') countered.add(ev.enemyId);
    }
    for (const ev of events) {
      switch (ev.kind) {
        case 'eliteFocus': {
          // Elite reward: a small blue-white Focus pop (not a pickup to chase).
          if (ev.focus > 0) this.focusPop(this.world.players[ev.playerId]?.pos ?? { x: 0, y: 0 }, `+${ev.focus} Focus`);
          break;
        }
        case 'playerAttack': {
          const e = this.enemy(ev.enemyId);
          if (!e) break;
          const v = this.enemyViews.get(e.id)!;
          v.flashUntil = this.time.now + (ev.move === 'basic' ? 70 : 120);
          if (ev.defeated) v.defeatAt = this.time.now;
          else v.hitUntil = this.time.now + 250; // a quick flinch (only while chasing)
          const heavy = ev.move !== 'basic';
          this.sparks(e.pos, heavy ? 12 : 5, heavy ? COLORS.gold : 0xffffff);
          this.floatText(e.pos, `${ev.damage}`, heavy ? '#ffd166' : '#ffffff', heavy ? 30 : 22);
          // The character punches (the automatic jab only when standing, so walking stays smooth).
          if (ev.move === 'basic' && !this.world.players[ev.playerId].moving && !this.heroAction) this.heroDo('jab');
          else if (ev.move === 'strike') {
            this.heroDo('strike');
            // Tutorial boss room: the Strike lesson's well done, once.
            if (this.strikeTaught && !this.strikeHit) {
              this.strikeHit = true;
              this.senseiSay([LESSONS[STRIKE_LESSON].success!]);
            }
          }
          if (ev.move === 'basic') {
            sfx.hit();
            this.impact(FEEL.basic);
          } else if (ev.move === 'strike') {
            sfx.strike();
            this.impact(FEEL.strike);
          } else if (ev.move === 'chain' || ev.move === 'ripple' || ev.move === 'reflect') {
            sfx.hit();
            this.ring(e.pos, ev.move === 'ripple' ? COLORS.gold : 0xffffff, 0.8, 0.7);
          }
          if (ev.defeated) {
            sfx.enemyDown();
            this.impact(FEEL.enemyDown);
            this.setFree(e.pos, !!e.def.boss);
          }
          break;
        }
        case 'perfectCounter': {
          if (ev.playerId === this.me) this.tutorialDid('counter');
          const p = this.world.players[ev.playerId];
          sfx.perfect();
          this.heroDo('counter', 8); // the counter punch
          this.impact(FEEL.perfect);
          this.flashScreen(0xffffff, 0.55, 220);
          this.ring(p.pos, COLORS.gold, 2.2);
          this.popWord('GREAT!', '#ffd166', 54);
          if (ev.playerId === this.me && !this.world.guide) this.lesson('firstPerfectUnaided');
          break;
        }
        case 'block': {
          // A Counter that wasn't perfect still counts as trying it (no pressure).
          if (ev.playerId === this.me) this.tutorialDid('counter');
          const p = this.world.players[ev.playerId];
          sfx.block();
          this.impact(FEEL.block, this.shakeScale('block'));
          this.ring(p.pos, COLORS.shield, 1.2);
          this.sparks(p.pos, 6, COLORS.shield);
          this.floatText(p.pos, `BLOCK  -${ev.damage}`, '#9ad1ff', 22);
          if (ev.playerId === this.me) this.lesson('firstBlock');
          break;
        }
        case 'hit': {
          const p = this.world.players[ev.playerId];
          sfx.hurt();
          this.heroDo('hit');
          this.impact(FEEL.hurt, this.shakeScale('hurt'));
          this.playerFlashUntil = this.time.now + 160;
          this.flashScreen(0xff2a1a, 0.3, 200);
          this.floatText(p.pos, `-${ev.damage}`, '#ff6b5b', 26);
          break;
        }
        case 'bell': {
          const p = this.world.players[this.me];
          sfx.loot(ev.count === ev.of ? 2 : 0);
          this.ring(p.pos, COLORS.gold, 1.6);
          this.floatText(p.pos, ev.count === ev.of ? 'Ding! Bonus prize!' : `Ding! Bell ${ev.count} of ${ev.of}`, '#ffd166', 24, 1.1);
          this.drawTwistBells();
          break;
        }
        case 'guideStart': {
          // Step 0 opens with the warning lesson; the hints say their one line and pulse Counter.
          const lesson = LESSONS[GUIDE_LESSONS[ev.step]];
          if (ev.step === 0) noteLessonSeen(WARNING_LESSON, this.roomTag());
          noteLessonSeen(lesson.id, this.roomTag());
          this.senseiSay(ev.step === 0 ? LESSONS[WARNING_LESSON].screens : lesson.screens, 1100);
          this.buttons.pulseCounter(ev.step === 2 ? 1 : 2);
          this.guideCue = this.senseiText;
          break;
        }
        case 'guideWait':
          this.senseiSay(LESSONS[GUIDE_LESSONS[0]].screens);
          this.guideCue = this.senseiText;
          break;
        case 'guideCancel':
          // Q-P4 QA: the guided wind-up ended without a swing, so its "COUNTER!" cue goes now
          // instead of staying up over the next (maybe dash-only) wind-up.
          this.clearGuideCue();
          break;
        case 'guideNudge': {
          const nudge = LESSONS[GUIDE_LESSONS[0]].nudge;
          if (nudge) this.senseiSay([nudge]);
          this.guideCue = this.senseiText;
          this.buttons.pulseCounter(3);
          break;
        }
        case 'counterHint': {
          // L-PREMIUM-b: Counter windows went by with no answer. Sensei's nudge shows as a small tip that keeps off
          // the red circles and the buttons, Counter pulses (a still outline with Reduced motion), and both end on their own.
          const nudge = LESSONS[GUIDE_LESSONS[0]].nudge;
          if (!nudge || this.downed) break;
          this.showCounterTip(nudge);
          break;
        }
        case 'guideDone': {
          const lesson = LESSONS[GUIDE_LESSONS[ev.step]];
          if (ev.success) this.tutorialDid('counter');
          this.senseiDone(ev.success ? lesson.success : lesson.retry);
          break;
        }
        case 'telegraph': {
          // A warning is coming: the twist banner gets out of the way so it never covers one.
          if (this.twistBannerView?.active) this.tweens.add({ targets: this.twistBannerView, alpha: 0.25, duration: 150 });
          const e = this.enemy(ev.enemyId);
          // Q-P4 QA: a wind-up that can't be Countered (a dash-only lane) never keeps an old "COUNTER!" cue up
          // unless the guided enemy is still winding up its own counterable attack.
          const se = this.world.enemies.find((x) => x.id === ev.enemyId);
          if (se && currentAttack(se).counterable === false && !this.guidedWindupLive()) this.clearGuideCue();
          sfx.windup(ticksToRealMs(ev.ticks) / 1000);
          if (e) this.patternTellStart(e);
          if (e) this.floatText({ x: e.pos.x, y: e.pos.y - e.def.radius - 0.3 }, '!', '#ff3b30', 40, 0.4);
          // Sensei's Lessons: a second warning while another is still filling is two attacks at once.
          const now = this.time.now;
          if ([...this.warnings].some(([id, w]) => id !== ev.enemyId && w.until > now)) this.lesson('twoAttacksAtOnce');
          const me = this.world.players[this.me];
          const inside = !!(e?.attackCenter && me && Math.hypot(me.pos.x - e.attackCenter.x, me.pos.y - e.attackCenter.y) <= currentAttack(e).areaRadius);
          this.warnings.set(ev.enemyId, { until: now + ticksToRealMs(ev.ticks), inside });
          break;
        }
        case 'enemySwing': {
          const e = this.enemy(ev.enemyId);
          if (!countered.has(ev.enemyId)) {
            sfx.whoosh();
            // The player was in the circle when it showed, and nobody was hit, blocked or countered: they stepped out.
            if (this.warnings.get(ev.enemyId)?.inside && this.world.players[this.me]?.health > 0) this.lesson('firstStepOut');
          }
          this.warnings.delete(ev.enemyId);
          if (e?.attackCenter) this.ring(e.attackCenter, 0xffffff, currentAttack(e).areaRadius, 0.6);
          break;
        }
        case 'counterPressed':
          sfx.guard();
          this.heroDo('counter', 0, 7); // the block, held while guarding
          break;
        case 'dash': {
          if (ev.playerId === this.me) this.tutorialDid('dash');
          const p = this.world.players[ev.playerId];
          sfx.dash();
          this.heroDo('dash');
          this.dashTrail(p.pos);
          break;
        }
        case 'stanceChange': {
          const p = this.world.players[ev.playerId];
          sfx.insight();
          this.ring(p.pos, 0x6fb7ff, 1.2);
          this.floatText(p.pos, activeStance(p).name, '#9ad1ff', 22, 1);
          break;
        }
        case 'virtue': {
          const p = this.world.players[ev.playerId];
          sfx.stripe();
          this.flashScreen(0xffd166, 0.35, 260);
          this.ring(p.pos, COLORS.gold, 2.4);
          this.popWord(p.virtue?.name ?? 'Virtue', '#ffd166', 40);
          if (ev.healed > 0) this.floatText(p.pos, `+${ev.healed}`, '#5cd65c', 26, 1.2);
          break;
        }
        case 'virtueEnd':
          break;
        case 'virtueRefused': {
          const p = this.world.players[ev.playerId];
          sfx.denied();
          this.buttons.refuse('virtue');
          this.floatText(p.pos, p.virtueTicks > 0 ? 'Already active' : 'Fill your Focus first', '#f2e9d8', 18);
          break;
        }
        case 'shieldSoak': {
          const p = this.world.players[ev.playerId];
          sfx.block();
          this.ring(p.pos, COLORS.gold, 1.3);
          this.floatText(p.pos, `SHIELDED ${ev.soaked}`, '#ffd166', 22);
          break;
        }
        case 'strikeRefused':
          sfx.denied();
          this.buttons.refuse('strike');
          if (ev.reason === 'noTarget') {
            const p = this.world.players[ev.playerId];
            this.floatText(p.pos, 'Get closer!', '#f2e9d8', 18);
          }
          break;
        case 'playerDown':
          // B-MASHER-d1 Screen 1: a soft fade, a warm chime, and Sensei helps the hero up.
          // In the practice room the same kind words show, and the room simply starts over.
          sfx.playerDown();
          this.heroDo('defeat');
          this.downed = true;
          this.downAt = this.time.now;
          this.helpUpSkipped = false;
          this.buttons.disable();
          this.controls.disable();
          this.bossName.setVisible(false);
          this.lidIcon?.setVisible(false);
          this.bossTagWorld = null;
          for (const t of [...this.popups]) this.dropPopup(t);
          this.chainText.setVisible(false);
          this.cameras.main.fade(reducedMotion() ? 0 : 900, 10, 8, 16, true);
          this.message.setText(KO.helpUp).setVisible(true);
          this.senseiSay([KO.helpUpSensei], 1400, true);
          break;
        case 'wave':
          sfx.wave();
          this.popWord(ev.wave === ev.of ? 'Final wave!' : `Wave ${ev.wave}`, '#ff8a80', 40);
          break;
        case 'breath': {
          const p = this.world.players[ev.playerId];
          this.ring(p.pos, COLORS.health, 1.4);
          this.floatText(p.pos, `+${ev.healed} catch your breath`, '#5cd65c', 20, 1.1);
          break;
        }
        case 'winded': {
          const e = this.enemy(ev.enemyId);
          sfx.winded();
          if (e) this.floatText({ x: e.pos.x, y: e.pos.y - e.def.radius - 0.2 }, 'huff... huff...', '#9ad1ff', 20, 0.6);
          break;
        }
        case 'speedBurst': {
          const p = this.world.players[ev.playerId];
          sfx.dash();
          this.ring(p.pos, 0x5cd6b0, 1.3);
          this.floatText(p.pos, 'WIND STEP!', '#5cd6b0', 20);
          break;
        }
        case 'roomCleared':
          if (this.room.kind !== 'treasure' && this.room.kind !== 'rest') sfx.roomClear();
          if (this.run?.tutorial && this.room.kind === 'boss') this.tutorialDid('defeatBoss');
          // K24a: if the fights end before a step's try, that step ends quietly.
          if (this.tflow && this.room.kind === 'battle') while (this.tflow.index < TUTORIAL_STEPS.indexOf('tutorial-insight')) skipStep(this.tflow, currentStep(this.tflow)!);
          break;
        case 'goalReached': {
          const p = this.world.players[this.me];
          sfx.appear();
          this.ring(p.pos, COLORS.gold, 1.6);
          this.sparks(p.pos, 14, COLORS.gold);
          if (this.goalView) {
            this.tweens.killTweensOf(this.goalView);
            this.tweens.add({ targets: this.goalView, alpha: 0, scale: 2, duration: 400, onComplete: () => this.goalView?.destroy() });
          }
          this.tutorialDid('reachSpot');
          break;
        }
        case 'chestOpened': {
          // The chest wiggles first; the chime, ring and sparks come when the lid bursts open.
          this.chestOpenAt = this.time.now;
          const at = this.room.chest;
          this.time.delayedCall(this.chestTiming().burstMs, () => {
            if (this.run?.tutorial) this.tutorialDid('openChest');
            sfx.chest();
            if (at) {
              this.ring(at, COLORS.gold, 1.8);
              this.sparks(at, 18, COLORS.gold);
            }
          });
          break;
        }
        case 'shrineUsed': {
          const p = this.world.players[ev.playerId];
          sfx.shrine();
          this.ring(p.pos, COLORS.health, 1.8);
          this.floatText(p.pos, ev.healed > 0 ? `+${ev.healed} health` : 'Rested', '#5cd65c', 24);
          break;
        }
        case 'doorsOpen': {
          sfx.doors();
          for (const d of this.doorViews) this.ring(d.at, DOOR_LOOK[d.kind].color, 1.2);
          const p = this.world.players[this.me];
          const one = this.doorViews.length === 1;
          if (this.run?.tutorial && this.room.kind === 'boss') this.tutorialTip('tutorial-door');
          this.floatText(p.pos, one ? 'The door is open!' : 'The doors are open! Pick one.', '#f2e9d8', 20, 1.2);
          break;
        }
        case 'playerReturn':
          this.cameras.main.resetFX();
          this.cameras.main.fadeIn(400, 10, 8, 16);
          this.message.setVisible(false);
          if (!this.run) {
            // The practice room: nothing ends. The hero is back up and can train on.
            this.downed = false;
            this.senseiText?.destroy();
            this.senseiText = null;
            this.buttons.enable();
            this.controls.enable();
          }
          break;
        case 'enemySpawn': {
          const e = this.enemy(ev.enemyId);
          if (e) {
            sfx.appear();
            this.ring(e.pos, this.enemyViews.get(e.id)?.color ?? COLORS.brute, 1.2);
          }
          break;
        }
        case 'mashGuardOff':
          this.senseiStepsBack(ev.playerId);
          break;
        case 'shieldBlock': {
          const e = this.enemy(ev.enemyId);
          sfx.clank();
          if (e) {
            this.sparks(e.pos, 4, 0xc9d6e8);
            this.floatText(e.pos, 'CLANK', '#c9d6e8', 18);
            this.shieldGlow(e.pos, e.def.radius);
          }
          break;
        }
        case 'shieldBreak': {
          const e = this.enemy(ev.enemyId);
          sfx.shieldBreak();
          if (e) {
            this.sparks(e.pos, 16, 0xc9d6e8);
            this.ring(e.pos, 0xc9d6e8, 1.4);
            this.floatText({ x: e.pos.x, y: e.pos.y - 0.5 }, 'SHIELD BROKEN!', '#ffffff', 22);
          }
          break;
        }
        case 'shieldRegrow': {
          const e = this.enemy(ev.enemyId);
          if (e) this.ring(e.pos, 0xc9d6e8, 0.9, 0.6);
          break;
        }
        case 'clang': {
          // B-T3-TUNE-2a: the hit bounced off the pot lid: no damage number, just a grey tint and a clank.
          const v = this.enemyViews.get(ev.enemyId);
          if (v) v.clangUntil = this.time.now + 140;
          sfx.clank();
          break;
        }
        case 'phaseHold': {
          // B-T3-TUNE-2c: the boss roars and glows while everything holds still, and Sensei gives the tip.
          const e = this.enemy(ev.enemyId);
          const ms = ticksToRealMs(ev.ticks);
          if (e) {
            if (!reducedMotion()) {
              const glow = this.addWorld(this.add.image(e.pos.x * TILE, (e.pos.y - 0.4) * TILE, this.softGlow()).setDepth(8));
              glow.setTint(0xff7a3c).setScale(0.6).setAlpha(0.9);
              this.tweens.add({ targets: glow, scale: 2.4, alpha: 0, duration: ms, ease: 'Cubic.Out', onComplete: () => glow.destroy() });
            }
          }
          sfx.appear();
          // R-CHALLENGE P4: skipped when this boss's first-sight pattern line already played this fight.
          if (ev.senseiLine && !this.patternLineSaid.has(ev.enemyId)) this.senseiSay([ev.senseiLine], Math.max(1200, ms));
          // B-T3-NUDGE: ROAR! sits on screen just under Sensei's banner (8 px gap), above everything, so the banner never covers it.
          if (e) {
            const { width } = view(this);
            const banner = this.senseiText?.active ? this.senseiText.getBounds() : null;
            const roar = this.add
              .text(width / 2, banner ? banner.bottom + ROAR_GAP_PX : 72, 'ROAR!', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '28px', color: '#ffb627', stroke: '#2a1408', strokeThickness: 5 })
              .setOrigin(0.5, 0)
              .setDepth(60)
              .setResolution(window.devicePixelRatio || 1);
            this.cameras.main.ignore(roar);
            this.roarText?.destroy();
            this.helpText?.destroy();
            this.roarText = roar;
            const fade = [roar];
            if (events.some((x) => x.kind === 'summon' && x.enemyId === ev.enemyId)) {
              // "Help me!" sits over the calling enemy's head (screen space) so it reads as the enemy's line, not the student's.
              const cam = this.cameras.main;
              const z = cam.zoom / DPR;
              const ex = (e.pos.x * TILE - cam.worldView.x) * z;
              const headY = ((e.pos.y - 1) * TILE - cam.worldView.y) * z;
              const help = this.add
                .text(ex, headY, 'Help me!', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '22px', color: '#ffd166', stroke: '#2a1408', strokeThickness: 4 })
                .setOrigin(0.5, 0)
                .setDepth(60)
                .setResolution(window.devicePixelRatio || 1);
              this.cameras.main.ignore(help);
              this.helpText = help;
              const minTop = banner ? banner.bottom + ROAR_GAP_PX : 0;
              const hb = help.getBounds();
              help.setPosition(Phaser.Math.Clamp(ex, hb.width / 2 + ROAR_GAP_PX, width - hb.width / 2 - ROAR_GAP_PX), Math.max(minTop, headY - hb.height - ROAR_GAP_PX));
              this.nudgeClear(help, [roar.getBounds(), this.playerOnScreen(), ...this.nameLabelsOnScreen()], minTop);
              fade.push(help);
            }
            this.keepOffPlayer([roar], banner ? banner.bottom + ROAR_GAP_PX : 0);
            if (this.helpText && fade.includes(this.helpText)) this.nudgeClear(this.helpText, [roar.getBounds(), this.playerOnScreen(), ...this.nameLabelsOnScreen()], banner ? banner.bottom + ROAR_GAP_PX : 0);
            this.tweens.add({ targets: fade, alpha: 0, delay: ms * 0.6, duration: ms * 0.4, onComplete: () => fade.forEach((t) => t.destroy()) });
          }
          break;
        }
        case 'summon': {
          const e = this.enemy(ev.enemyId);
          sfx.appear();
          // B-T3-NUDGE: with a phase pause in the same tick, "Help me!" goes under ROAR! instead (clear of the banner).
          const paused = events.some((x) => x.kind === 'phaseHold' && x.enemyId === ev.enemyId);
          if (e && !paused) this.floatText({ x: e.pos.x, y: e.pos.y - 1 }, 'Help me!', '#ffd166', 24);
          const caller = this.enemyViews.get(ev.enemyId);
          if (caller) caller.callUntil = this.time.now + 1000;
          this.syncEnemyViews();
          for (const id of ev.summoned) {
            const s = this.enemy(id);
            if (s) this.ring(s.pos, 0xffffff, 1);
          }
          break;
        }
      }
    }
  }

  // ---------------------------------------------------------------- the run

  private onHomeButton(x: number, y: number): boolean {
    return !this.run && !!this.roomLabel && this.roomLabel.getBounds().contains(x, y);
  }

  private playRunEvents(events: RunEvent[]): void {
    for (const ev of events) {
      switch (ev.kind) {
        case 'loot':
          this.afterChestBurst(() => this.showLoot(ev.item, ev.at));
          break;
        case 'decoration':
          this.afterChestBurst(() => this.showDecoration(ev.id, ev.at, true));
          break;
        case 'namedDefeated':
          this.namedFreed(ev.id, ev.at);
          break;
        case 'graded':
          this.showGrade(ev.result.grade!, ev.result.perfects, ev.result.damageTaken, ev.result.ticks, ev.result.inTime);
          break;
        case 'insightGift': {
          // Tutorial floor: Sensei picks the Insight, with no menu.
          if (!this.run) break;
          setPlayerMods(this.world.players[this.me], modsFrom(runEffects(CONTENT, this.run, this.setup.effects), TICKS_PER_SECOND));
          const name = CONTENT.insights.find((i) => i.id === ev.id)?.name ?? '';
          // K24a: no timer; the tip waits for Got it.
          sfx.insight();
          // Sensei's banner first, so the pop-up can keep clear of it (K23c).
          this.tutorialTip('tutorial-insight');
          this.popWord(name, '#ffd166', 34);
          break;
        }
        case 'insightChoice':
          // Let the grade show for a moment, then offer the Insights.
          this.menuOpen = true;
          this.time.delayedCall(900, () => this.openInsights(ev.ids));
          break;
        case 'nextRoom':
          this.leaving = true;
          sfx.doors();
          this.cameras.main.fadeOut(300, 10, 8, 16);
          this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.restart({ run: this.run }));
          break;
        case 'runOver':
          this.endRun(ev.status);
          break;
      }
    }
  }

  /** Runs `show` now, or (while the chest is opening) once its lid bursts open. */
  private afterChestBurst(show: () => void): void {
    const wait = this.chestOpenAt === null ? 0 : this.chestOpenAt + this.chestTiming().burstMs - this.time.now;
    if (wait > 0) this.time.delayedCall(wait, show);
    else show();
  }

  private openInsights(ids: string[]): void {
    const defs = ids.map((id) => CONTENT.insights.find((i) => i.id === id)!).filter(Boolean);
    this.lesson('firstInsightChoice');
    this.picker = new InsightPicker(this, defs, (id) => {
      if (!this.run) return;
      chooseInsight(this.run, id);
      setPlayerMods(this.world.players[this.me], modsFrom(runEffects(CONTENT, this.run, this.setup.effects), TICKS_PER_SECOND));
      sfx.insight();
      this.picker?.destroy();
      this.picker = null;
      this.menuOpen = false;
      this.controls.reset();
      this.buttons.reset();
      const name = defs.find((d) => d.id === id)?.name ?? '';
      this.popWord(name, '#ffd166', 34);
    });
    this.cameras.main.ignore(this.picker.container);
  }

  /** Brings the run's loot home, saves, and goes to the Home Dojo. */
  private endRun(status: 'cleared' | 'lost' | 'rested'): void {
    if (!this.run) return;
    const { summary, xp, profile } = bankRun(this.run, this.training, status);
    this.leaving = true;
    const leave = (scene: string, data?: GameSceneData | HomeSceneData) => {
      this.cameras.main.fadeOut(600, 10, 8, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(scene, data));
    };
    if (status === 'lost' || status === 'rested') {
      // B-MASHER-d1: Screen 2 (what they kept, Head home), then Home's welcome (Screen 3).
      // A knock-out first waits for Screen 1 (about 2.5 s, a tap skips it). When play time
      // is up (M7-P9), Screen 2 uses the resting line and Home skips the next-run pointer.
      const resting = status === 'rested' || isPlayTimeUp(profile);
      const finds = [
        ...summary.items.map((i) => i.name),
        ...summary.decorations.map((d) => decorationDef(CONTENT.dojo, d).name),
        ...(xp.gained > 0 ? [`+${xp.gained} experience`] : []),
      ];
      // After losses in a row on this floor, Guided is kindly offered, now after Screen 2,
      // at most once a day (M7-P1). Never after a rested ending.
      const tier = this.run.tier;
      const offer = status === 'lost' && shouldOfferGuided(profile, tier, DIFFICULTY_TEXT, localToday());
      if (offer) {
        markGuidedOffered(profile, localToday());
        writeSave(profile);
      }
      const home = () => {
        this.uiCamera.fadeOut(400, 10, 8, 16);
        this.uiCamera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
          this.scene.start('Home', { fromRun: true, knockout: resting ? 'rested' : 'run' } satisfies HomeSceneData),
        );
      };
      const showKept = () => {
        this.afterHelpUp = null;
        this.message.setVisible(false);
        this.senseiText?.destroy();
        this.senseiText = null;
        const card = keptCard(this, finds, resting, () => {
          if (!offer) return home();
          card.destroy();
          const o = DIFFICULTY_TEXT.offer;
          const ask = choiceCard(this, o.title, o.line, o.no, o.yes, (yes) => {
            if (yes) {
              const p = loadSave();
              chooseDifficulty(p, 'guided');
              writeSave(p);
            }
            home();
          });
          this.cameras.main.ignore(ask);
        });
        this.cameras.main.ignore(card);
      };
      if (status === 'rested') {
        sfx.floorClear();
        this.time.delayedCall(500, showKept);
        return;
      }
      const wait = this.helpUpSkipped ? 0 : Math.max(0, KO.helpUpMs - (this.time.now - this.downAt));
      if (wait === 0) showKept();
      else {
        this.afterHelpUp = showKept;
        this.time.delayedCall(wait, () => this.afterHelpUp?.());
      }
      return;
    }
    // Q-PREM-BOSSWIN: the first real Floor Keeper clear gets its one big moment, saved so it plays once.
    const bossId = this.room.enemySpawns.map((sp) => sp.enemy).find((id) => CONTENT.enemies[id]?.boss);
    if (keeperWin(profile, this.run, status, bossId)) {
      writeSave(profile);
      this.showKeeperWin(() => leave('Home', { fromRun: true }));
      return;
    }
    sfx.floorClear();
    this.message.setText(LAST_RUN.cleared).setVisible(true);
    this.time.delayedCall(200, () => leave('Home', { fromRun: true }));
  }

  /** Q-PREM-BOSSWIN: 'Floor Keeper defeated!' over the room, then onDone (home). */
  private showKeeperWin(onDone: () => void): void {
    this.message.setVisible(false);
    this.menuOpen = true;
    const c = new Celebrations(this, [], this.training, onDone, [], BOSS_WIN.keeperDefeated);
    this.cameras.main.ignore(c.root);
  }

  /** The bow at the start of the floor: the fight waits, then a small Focus head start. */
  private askForBow(): void {
    this.menuOpen = true;
    this.enemiesAt = null;
    const tutorial = this.run?.tutorial ?? false;
    const prompt = bowPrompt(this, tutorial ? TUTORIAL['tutorial-bow'].screens[0] : 'Bow to begin the floor', () => {
      this.heroDo('bow');
      playBow(this, this.player, () => {
        if (!this.run) return;
        bowIn(this.world, this.me);
        this.run.bowed = true;
        this.menuOpen = false;
        this.controls.reset();
        this.buttons.reset();
        this.floatText(this.world.players[this.me].pos, '+Focus', '#9ad1ff', 18);
        this.introduceRoom();
        // The enemies arrive now, with a puff where each one stands.
        this.enemiesAt = this.time.now;
        sfx.appear();
        for (const e of this.world.enemies) if (e.mode !== 'defeated') this.ring(e.pos, 0xffffff, 1.2, 0.6);
      }, this.hero);
    });
    this.cameras.main.ignore(prompt);
  }

  /** The room's name (and challenge rule) when entering. */
  private introduceRoom(): void {
    if (!this.run) return;
    if (this.run.tutorial) {
      this.introduceTutorialRoom();
      return;
    }
    const lines = [this.room.name];
    if (this.room.challenge) lines.push(this.room.challenge.text);
    else if (this.room.kind === 'rest') lines.push('Walk to the shrine to rest.');
    else if (this.room.kind === 'treasure') lines.push('Open the chest!');
    else if (this.room.kind === 'boss') {
      // B-T3: the room's own Guardian (the Hearth Cook on the Orange floor).
      const boss = this.room.enemySpawns.map((sp) => CONTENT.enemies[sp.enemy]).find((d) => d?.boss);
      lines.push(`${boss?.name ?? 'The Floor Keeper'} awaits.`);
    }
    const bannerBottom = this.showTwist();
    this.message.setText(lines.join('\n')).setFontSize(this.room.challenge ? 22 : 26).setVisible(true).setAlpha(1);
    // With a twist banner at the top, the room name and goal sit just under it so nothing overlaps.
    this.messageTop = bannerBottom ? bannerBottom + 10 : 0;
    this.placeMessage();
    this.tweens.add({
      targets: this.message,
      alpha: 0,
      delay: 1400,
      duration: 500,
      onComplete: () => {
        this.messageTop = 0;
        this.message.setVisible(false).setAlpha(1).setFontSize(28);
        this.placeMessage();
      },
    });
  }

  /**
   * Tutorial floor (M7-P2): one Sensei line per step, and at most one new lesson per room.
   * Room 1: bow, then walk to the glowing spot (the guided Counter lines follow on their own).
   * Room 2: the chest. Room 3: the easy boss, with Strike taught when Focus fills.
   */
  private introduceTutorialRoom(): void {
    const kind = this.room.kind;
    if (kind === 'battle') {
      // The bow prompt was the bow step's tip, and bowing was its try.
      this.tflow = tutorialFlow('tutorial-bow');
      showTip(this.tflow, 'tutorial-bow');
      gotIt(this.tflow, TUTORIAL);
      this.tutorialDid('bow');
    } else if (kind === 'treasure') {
      this.tflow = tutorialFlow('tutorial-chest');
    } else if (kind === 'boss') {
      this.tflow = tutorialFlow('tutorial-boss');
    }
    this.tutorialTick();
  }

  /**
   * Tutorial floor (K24a): starts the next step when its moment comes. No timers: each tip
   * waits for Got it, and each move step then waits for the player's try.
   */
  private tutorialTick(): void {
    const f = this.tflow;
    if (!f || f.phase !== 'ready' || this.menuOpen || this.leaving) {
      this.checkTutorialTry();
      return;
    }
    const id = currentStep(f);
    const live = this.world.enemies.some((e) => e.mode !== 'defeated');
    switch (id) {
      case 'tutorial-walk':
      case 'tutorial-space':
      case 'tutorial-tip-tough':
        this.tutorialTip(id);
        break;
      case 'tutorial-chest':
      case 'tutorial-boss':
        // K27: each only in its own room (the chest tip once showed in room 1, Q5 B2).
        if (this.room.kind === (id === 'tutorial-chest' ? 'treasure' : 'boss')) this.tutorialTip(id);
        break;
      case 'tutorial-brute':
        // The guided Counter teaches this step with its own lines, and holds until COUNTER is tapped.
        showTip(f, id);
        gotIt(f, TUTORIAL);
        this.world.enemyHold = false;
        break;
      case 'tutorial-tip-warning':
        if (live) this.tutorialTip(id);
        else skipStep(f, id);
        break;
      case 'tutorial-tip-swarmers':
      case 'tutorial-tip-space':
      case 'tutorial-tip-dash':
        if (!live) this.tutorialTip(id);
        break;
      default:
        break; // bow, insight and door tips come from their own events
    }
  }

  /** While a move step waits for its try: the tries the game checks itself. */
  private checkTutorialTry(): void {
    const f = this.tflow;
    if (!f || f.phase !== 'trying') return;
    const alive = (kind?: string) => this.world.enemies.some((e) => e.mode !== 'defeated' && (!kind || e.def.id === kind));
    const id = currentStep(f);
    if (id === 'tutorial-space' && this.walked >= 8) this.tutorialDid('walkAround');
    else if (id === 'tutorial-tip-swarmers' && !alive('swarmer')) this.tutorialDid('defeatSwarmers');
    else if (id === 'tutorial-tip-tough' && !alive()) this.tutorialDid('defeatBrute');
    else if (id === 'tutorial-tip-space' && !alive()) this.tutorialDid('keepSpace');
    else if (id === 'tutorial-tip-warning' && !alive()) skipStep(f, id);
    else if (id === 'tutorial-tip-dash' && !alive()) {
      this.buttons.pulseDash(false);
      skipStep(f, id);
    }
  }

  /** Something the tutorial may be waiting for happened. Its success line leads the next tip. */
  private tutorialDid(ev: TutorialEvent): void {
    const f = this.tflow;
    if (!f) return;
    const done = tutorialEvent(f, TUTORIAL, ev);
    if (!done) return;
    if (done === 'tutorial-tip-dash') this.buttons.pulseDash(false);
    const line = TUTORIAL[done].success;
    if (done === 'tutorial-brute') {
      // The guided Counter already said its own success line.
      this.tutorialTick();
      return;
    }
    this.tutorialLead = line ?? '';
    this.tutorialTick();
    // Nothing follows straight away: the success line shows on its own until the next step.
    if (this.tutorialLead && !this.gotItBtn) {
      this.senseiSay([this.tutorialLead]);
      this.tutorialLead = '';
    }
  }

  /** A tip with a Got it button (K24a): the game waits until it is tapped. */
  private tutorialTip(id: TutorialStep): void {
    const f = this.tflow;
    if (!f || !showTip(f, id)) return;
    const step = TUTORIAL[id];
    const lead = this.tutorialLead;
    this.tutorialLead = '';
    const lines = [...(lead ? [lead] : []), ...step.screens, ...(step.advance === 'tap' && step.success ? [step.success] : [])];
    this.senseiSay([lines.join('\n')]);
    this.menuOpen = true;
    const { width } = view(this);
    const btn = this.add
      .text(width / 2, 0, 'Got it', {
        fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold',
        fontSize: width < 720 ? '20px' : '24px',
        color: '#1a1426',
        backgroundColor: '#ffd166',
        padding: { x: 22, y: 10 },
      })
      .setOrigin(0.5, 0)
      .setResolution(window.devicePixelRatio || 1)
      .setInteractive({ useHandCursor: true });
    this.cameras.main.ignore(btn);
    this.gotItBtn = btn;
    this.placeSensei();
    btn.once('pointerup', () => {
      btn.destroy();
      this.gotItBtn = null;
      this.menuOpen = false;
      this.controls.reset();
      this.buttons.reset();
      const finished = gotIt(f, TUTORIAL);
      if (!finished) this.startTutorialTry(id);
      // A tap step needs nothing more, so its banner goes when Got it is tapped; so does the
      // boss tip, which otherwise sat over the boss for the whole fight (K27, Q5 B1).
      if ((finished || id === 'tutorial-boss') && this.senseiText) {
        this.senseiText.destroy();
        this.senseiText = null;
      }
      this.tutorialTick();
    });
  }

  /** After Got it on a move step: let in what the player is to try against. */
  private startTutorialTry(id: TutorialStep): void {
    if (id === 'tutorial-space') this.walked = 0;
    if (id === 'tutorial-tip-swarmers' || id === 'tutorial-tip-space' || id === 'tutorial-tip-dash') {
      const from = this.world.events.length;
      // The new wave's spawn puffs play now (views are made on the next draw).
      if (releaseWave(this.world)) this.playEvents(this.world.events.slice(from));
    }
    if (id === 'tutorial-tip-dash') this.buttons.pulseDash(true);
  }

  /** This room, for the one-new-lesson-per-room limit. */
  private roomTag(): string {
    return `${this.runTag}-${this.run?.depth ?? 0}`;
  }

  /**
   * Sensei's Lessons (M7-P5): a game event happened; show its lesson if the session and room
   * limits allow it. The tutorial floor teaches on its own guide path instead.
   */
  private lesson(triggerKey: string): void {
    if (this.run?.tutorial) return;
    const l = takeLesson(triggerKey, this.roomTag());
    if (l) this.senseiSay(l.practice ? [...l.screens, l.practice] : l.screens, 1600);
  }

  /** Tutorial boss room: teach Strike the first time Focus fills (Manager call, M7-P2). */
  private checkStrikeLesson(): void {
    if (!this.run?.tutorial || this.room.kind !== 'boss' || this.strikeTaught) return;
    const p = this.world.players[this.me];
    if (!p || p.focus < strikeCost(p)) return;
    this.strikeTaught = true;
    noteLessonSeen(STRIKE_LESSON, this.roomTag());
    this.senseiSay(LESSONS[STRIKE_LESSON].screens, 1600);
  }

  /** The big middle message, moved down under the twist banner while one is showing. */
  private placeMessage(): void {
    const { width, height } = view(this);
    const y = this.messageTop ? Math.max(height * 0.4, this.messageTop + this.message.height / 2) : height * 0.4;
    this.message.setPosition(width / 2, y);
  }

  /**
   * Room twist: a banner with its icon and Sensei's one-line rule, then a small icon in the corner.
   * Returns the banner's bottom edge (0 when there's no twist).
   */
  private showTwist(): number {
    this.twistBadge?.destroy();
    this.twistBadge = null;
    const twist = this.world.twist;
    if (!twist) return 0;
    const { width } = view(this);
    // Near the top, just under the health and Focus bars, so it never covers the fight or a warning circle.
    const banner = twistBanner(this, twist, width, 0);
    // Q-P4 QA: its Sensei line keeps the same floor. Q-VIRTUE-BANNER: the one rule, so it never covers a button.
    const { height } = view(this);
    const floor = Math.max(58, this.senseiFloor());
    const twistAsk: BannerAsk = {
      viewW: width, viewH: height, floor, home: floor, w: banner.width, h: banner.height, x: banner.x, y: floor,
      players: [], buttons: this.buttonKeepOut(), others: [], // as before: just under the bars unless a button is there
    };
    const twistSpot = pickBannerSpot(twistAsk) ?? overArena(twistAsk);
    const BANNER_Y = twistSpot.y + banner.height / 2;
    banner.setPosition(twistSpot.x, BANNER_Y);
    this.cameras.main.ignore(banner);
    this.tweens.add({ targets: banner, alpha: { from: 0, to: 1 }, y: { from: BANNER_Y + 20, to: BANNER_Y }, duration: 300, ease: 'Back.Out' });
    this.tweens.add({ targets: banner, alpha: 0, delay: 4200, duration: 500, onComplete: () => banner.destroy() });
    this.twistBannerView = banner;
    this.twistBadge = this.add.container(0, 0, [twistIcon(this, twist.icon, 34)]).setDepth(20);
    this.cameras.main.ignore(this.twistBadge);
    // Top right, under the room count and timer, so it never covers them on a small phone.
    this.twistBadge.setPosition(width - 70, 84);
    this.drawTwistBells();
    return BANNER_Y + banner.height / 2;
  }

  /** Bell Room: the bells rung so far, next to the twist icon. */
  private drawTwistBells(): void {
    const twist = this.world.twist;
    if (!twist?.bells || !this.twistBadge) return;
    this.twistBadge.list.slice(1).forEach((o) => o.destroy());
    const text = this.add
      .text(22, 0, `${this.world.bells}/${twist.bells}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffd166', stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(0, 0.5)
      .setResolution(crisp());
    this.cameras.main.ignore(text);
    this.twistBadge.add(text);
  }

  private makeRoomObjects(): Phaser.GameObjects.GameObject[] {
    const objs: Phaser.GameObjects.GameObject[] = [];
    if (this.run) {
      const slots = activeDoorSlots(this.room, this.run.doors.length);
      this.run.doors.forEach((kind, i) => {
        const at = this.room.doors[slots[i]];
        // The door stands in its wall slot, its feet on the wall's bottom edge.
        const art = DOOR_ART[kind];
        const images = addStatic(this, this.towerPack, art, at.x * TILE, (at.y + 0.5) * TILE).map((img) => img.setDepth(0.6));
        const glow = kind === 'boss' ? addStatic(this, this.towerPack, 'door-boss-glow', at.x * TILE, (at.y + 0.5) * TILE).map((img) => img.setDepth(0.61)) : [];
        const look = DOOR_LOOK[kind];
        const label = this.add
          .text(at.x * TILE, (at.y + 0.55) * TILE, look.label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '13px', color: css(look.color), stroke: '#14121c', strokeThickness: 4 })
          .setOrigin(0.5, 0)
          .setResolution(crisp())
          .setDepth(6);
        this.doorViews.push({ kind, images, art, glow, label, at });
        objs.push(...images, ...glow, label);
      });
    }
    // The chest and the shrine stand on their tile, drawn front-to-back with the characters.
    const c = this.room.chest;
    this.chestImgs = c ? addStatic(this, this.towerPack, 'chest-closed', c.x * TILE, (c.y + 0.5) * TILE) : [];
    const sh = this.room.shrine;
    this.shrineImgs = sh ? addStatic(this, this.towerPack, 'shrine', sh.x * TILE, (sh.y + 0.5) * TILE) : [];
    // The chest's glow, beam and stars show above the character standing at it.
    if (c) this.chestImgs.forEach((img, i) => img.setDepth(i === 0 ? depthAt((c.y + 0.4) * TILE) : 8));
    if (sh) this.shrineImgs.forEach((img) => img.setDepth(depthAt((sh.y + 0.4) * TILE)));
    objs.push(...this.chestImgs, ...this.shrineImgs);
    // Tutorial floor: the glowing spot to walk to, gently pulsing.
    const g = this.room.goal;
    this.goalView = null;
    if (g) {
      const spot = this.add.circle(g.x * TILE, g.y * TILE, TILE * 0.55, COLORS.gold, 0.35).setStrokeStyle(3, COLORS.gold, 0.9).setDepth(1);
      this.tweens.add({ targets: spot, scale: 1.25, alpha: 0.6, duration: 700, yoyo: true, repeat: -1 });
      this.goalView = spot;
      objs.push(spot);
    }
    return objs;
  }

  /** Plays a looping (or once-only) static animation on images made by addStatic. */
  private animateStatic(id: string, images: Phaser.GameObjects.Image[], seconds: number): void {
    const art = staticArt(this, this.towerPack, id);
    if (!art) return;
    const f = Math.floor(seconds * (art.fps ?? 8));
    setStaticFrame(this, this.towerPack, id, images, art.loop ? f % art.frames : Math.min(f, art.frames - 1));
  }

  /** How long the chest's opening takes before the lid bursts open (ms), and in total. */
  private chestTiming(): { burstMs: number; totalMs: number } {
    const art = staticArt(this, this.towerPack, 'chest-open');
    const fps = art?.fps ?? 12;
    const burst = Number(art?.keyFrames?.lidBurst ?? 12);
    return { burstMs: (burst / fps) * 1000, totalMs: ((art?.frames ?? 30) / fps) * 1000 };
  }

  /** Doors, the chest, the shrine, and the run's labels, timer and boss bar. */
  private drawRunHud(now: number): void {
    if (!this.run) return;
    const prog = this.world.progress;
    const pulse = 0.75 + Math.sin(now / 200) * 0.25;

    for (const d of this.doorViews) {
      // Closed until the room is cleared, then the doors slide open and the doorway glows.
      setStaticFrame(this, this.towerPack, d.art, d.images, prog.doorsOpen ? 1 : 0);
      if (d.glow.length) {
        d.glow.forEach((img) => img.setVisible(!prog.doorsOpen));
        if (!prog.doorsOpen) this.animateStatic('door-boss-glow', d.glow, now / 1000);
      }
      d.label.setAlpha(prog.doorsOpen ? pulse : 0.55);
      // Keep the label below the top bar and the Challenge timer (health, Focus, "Room 1 of 8"): in small rooms
      // the top doors sit right under it on a 667-wide phone.
      const cam = this.cameras.main;
      d.label.setY(Math.max((d.at.y + 0.55) * TILE, cam.worldView.y + DOOR_LABEL_TOP_PX / (cam.zoom / DPR)));
      this.keepLabelOffBoss(d);
    }

    // The chest appears once the room is clear: a glinting chest, then (once opened)
    // its 2.5 s opening (wiggle, the lid bursts open, light and stars), then a soft shimmer.
    if (this.chestImgs.length) {
      this.chestImgs.forEach((img) => img.setAlpha(prog.cleared ? 1 : 0));
      if (prog.cleared) {
        if (!prog.chestOpened) this.animateStatic('chest-closed', this.chestImgs, now / 1000);
        else {
          const since = now - (this.chestOpenAt ?? now - 1e9);
          const { totalMs } = this.chestTiming();
          if (since < totalMs) this.animateStatic('chest-open', this.chestImgs, since / 1000);
          else this.animateStatic('chest-opened', this.chestImgs, (since - totalMs) / 1000);
        }
      }
    }

    // The rest shrine glows gently until it's used.
    if (this.shrineImgs.length) {
      this.animateStatic('shrine', this.shrineImgs, now / 1000);
      this.shrineImgs[1]?.setVisible(!prog.shrineUsed);
    }

    // Room number and name (top right).
    const waves = this.world.waveCount > 1 && !prog.cleared ? `  ·  Wave ${this.world.wave} of ${this.world.waveCount}` : '';
    this.roomLabel.setText(`Room ${this.run.depth + 1} of ${this.run.totalRooms}${waves}`);

    // Challenge timer.
    const ch = this.room.challenge;
    if (ch) {
      // K28: Challenge timers count real seconds (the game runs slower than the rules' ticks).
      const limit = realSecondsToTicks(ch.seconds);
      const left = Math.max(0, limit - prog.ticks);
      const done = prog.cleared;
      this.timerText.setVisible(true);
      this.timerText.setText(done ? (prog.ticks <= limit ? ch.inTimeText : ch.outOfTimeShort) : clock(left, realTicksPerSecond()));
      this.timerText.setColor(left > realSecondsToTicks(10) || done ? '#f2e9d8' : '#ff6b5b');
    } else {
      this.timerText.setVisible(false);
    }

    // Boss health bar (top strip, between the player's bars and the room label).
    const boss = this.world.enemies.find((e) => e.def.boss);
    const g = this.hud;
    if (boss && boss.mode !== 'defeated' && !this.downed) {
      const { width } = view(this);
      const w = Math.max(140, Math.min(300, width - 450));
      const x = width / 2 - w / 2;
      const y = BOSS_BAR_Y;
      g.fillStyle(0x000000, 0.55).fillRoundedRect(x - 3, y - 3, w + 6, 16, 5);
      g.fillStyle(0xb046a0).fillRoundedRect(x, y, Math.max(6, w * (boss.health / boss.def.maxHealth)), 10, 3);
      // B-T3-TUNE-2a: while its helpers keep the lid up, the bar greys over and the lid shows at its end.
      // B-T3-TUNE-2b: the lid is the #299 icon, 24 px (the code-drawn lid stays as the fallback).
      const lid = !!boss.def.lidWhileHelpers && lidUp(this.world);
      if (lid) {
        g.fillStyle(0x8c96a0, 0.6).fillRoundedRect(x, y, w, 10, 3);
        const lx = x + w + 18;
        g.fillStyle(0x000000, 0.55).fillRoundedRect(lx - 16, y - 7, 32, 24, 6);
        if (this.lidIcon) this.lidIcon.setPosition(lx, y + 5);
        else {
          g.fillStyle(0xc9d1d9).fillRoundedRect(lx - 12, y + 2, 24, 10, { tl: 10, tr: 10, bl: 2, br: 2 });
          g.fillStyle(0xc9d1d9).fillRoundedRect(lx - 4, y - 3, 8, 5, 2);
        }
      }
      this.lidIcon?.setVisible(lid);
      this.bossName.setText(boss.def.name).setVisible(true);
      this.placeBossTag(boss);
    } else {
      this.bossName.setVisible(false);
      this.lidIcon?.setVisible(false);
      this.bossTagWorld = null;
    }
    this.placeCombo(!!boss && boss.mode !== 'defeated');
    this.placeSensei();
  }

  /**
   * The combo count sits top-centre, where the boss bar goes. While a boss bar shows, it
   * moves under the player's bars on the left so both stay readable (K10).
   */
  private placeCombo(bossUp: boolean): void {
    const { width } = view(this);
    if (bossUp) {
      this.comboText.setOrigin(0, 0).setPosition(16, HUD_TOP_PX + 4);
      this.comboBonusText.setOrigin(0, 0).setPosition(18, HUD_TOP_PX + 36);
    } else {
      this.comboText.setOrigin(0.5, 0).setPosition(width / 2, 14);
      this.comboBonusText.setOrigin(0.5, 0).setPosition(width / 2, 46);
    }
  }

  /**
   * Keeps Sensei's banner under the boss bar and off the door labels (which scroll with the
   * room), every frame, so it stays right when a boss appears or the camera moves (K10).
   */
  /** L-PREMIUM-b: the Counter tip's text (null when not showing). */
  private counterTip: Phaser.GameObjects.Text | null = null;

  private showCounterTip(line: string): void {
    this.counterTip?.destroy();
    const { width } = view(this);
    const t = this.add
      .text(0, 0, `Sensei: ${line}`, {
        fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold',
        fontSize: width < 720 ? '16px' : '18px',
        color: '#ffffff',
        backgroundColor: '#2a2440ee',
        padding: { x: 12, y: 8 },
        wordWrap: { width: Math.min(width * 0.4, 300), useAdvancedWrap: true },
      })
      .setDepth(60)
      .setResolution(window.devicePixelRatio || 1);
    this.cameras.main.ignore(t);
    this.counterTip = t;
    this.buttons.pulseCounter(4);
    this.placeCounterTip();
    this.time.delayedCall(COUNTER_HINT.tipMs, () => {
      if (this.buttons.counterPulseLevel() === 4) this.buttons.pulseCounter(0);
      if (t !== this.counterTip) return;
      const done = () => {
        t.destroy();
        if (this.counterTip === t) this.counterTip = null;
      };
      if (reducedMotion()) done();
      else this.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: done });
    });
  }

  /** Each frame: the tip takes the first spot clear of every red attack circle, the buttons, the HUD and Sensei's banner; if none is clear, it hides for that frame. */
  private placeCounterTip(): void {
    const t = this.counterTip;
    if (!t?.active) return;
    if (this.downed) {
      t.setVisible(false);
      return;
    }
    const { width: W, height: H } = view(this);
    const cam = this.cameras.main;
    const z = cam.zoom / DPR;
    const keepOff = [
      { x0: 0, x1: W, y0: 0, y1: Math.max(HUD_BOTTOM, this.topBarBottom()) },
      ...this.world.enemies
        .filter((e) => e.attackCenter && e.mode === 'windup')
        .map((e) => {
          const cx = (e.attackCenter!.x * TILE - cam.worldView.x) * z;
          const cy = (e.attackCenter!.y * TILE - cam.worldView.y) * z;
          const r = currentAttack(e).areaRadius * TILE * z + 8;
          return { x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r };
        }),
      ...this.buttons.objects.map((o) => {
        const r = (o as Phaser.GameObjects.Container).getBounds();
        return { x0: r.left - 12, x1: r.right + 12, y0: r.top - 12, y1: r.bottom + 12 };
      }),
    ];
    const w = t.width;
    const h = t.height;
    const top = Math.max(HUD_BOTTOM + 6, this.senseiFloor()); // Q-P4 QA: the same floor as every Sensei line
    // Q-TIP-BANNER: the one rule (ui/senseiPlace.ts tipSpot): off the buttons, HUD, red circles and Sensei's banner. None clear: hidden.
    const banner = this.senseiText?.active && this.senseiText.visible ? bannerKeepOut(this.senseiText) : null;
    const free = tipSpot({
      viewW: W, viewH: H, floor: top, home: top, w, h, x: 8 + w / 2, y: top,
      players: this.playerScreenBoxes(), buttons: keepOff, others: [],
    }, banner);
    t.setVisible(!!free);
    if (free) t.setPosition(free.x - w / 2, free.y);
  }

  private placeSensei(): void {
    const t = this.senseiText;
    if (!t?.active) return;
    const { height } = view(this);
    // R-CHALLENGE P4: never over the top bar (health, room and wave, timer, boss bar), e.g. at 667x375.
    const floor = this.senseiFloor();
    let top = this.senseiHome(height);
    const left = t.x - t.width / 2;
    const right = t.x + t.width / 2;
    const boxes = this.protectedBoxes(true);
    const btn = this.gotItBtn?.active ? this.gotItBtn : null;
    const h = t.height + (btn ? btn.height + 8 : 0);
    let tutorialExtra: Box[] = [];
    for (let pass = 0; pass < 2; pass++) {
      for (const b of boxes) {
        if (b.x1 < left || b.x0 > right || b.y1 < top || b.y0 > top + h) continue;
        top = Math.max(top, b.y1 + 6);
      }
    }
    // K24a/K27: the tutorial tip (with its Got it) keeps off the hero, the doors and their
    // labels, and the buttons too (Q5 B3, B4): it takes the first spot that is clear of them all.
    if (this.run?.tutorial) {
      const cam = this.cameras.main;
      const p = this.world.players[this.me].pos;
      const k = TILE * (cam.zoom / DPR);
      const py = (p.y * TILE - cam.worldView.y) * (cam.zoom / DPR);
      const px = (p.x * TILE - cam.worldView.x) * (cam.zoom / DPR);
      const H = view(this).height;
      tutorialExtra = this.world.enemies
        .filter((e) => e.def.boss && e.mode !== 'defeated')
        .map((e) => {
          const ex = (e.pos.x * TILE - cam.worldView.x) * (cam.zoom / DPR);
          const ey = (e.pos.y * TILE - cam.worldView.y) * (cam.zoom / DPR);
          return { x0: ex - 1.5 * k, x1: ex + 1.5 * k, y0: ey - 3 * k, y1: ey + k };
        });
      const keepOff = [
        ...boxes,
        { x0: px - k, x1: px + k, y0: py - 1.8 * k, y1: py + 0.8 * k },
        // The boss too, so "A big one!" doesn't hide it (Q5 B1).
        ...this.world.enemies
          .filter((e) => e.def.boss && e.mode !== 'defeated')
          .map((e) => {
            const ex = (e.pos.x * TILE - cam.worldView.x) * (cam.zoom / DPR);
            const ey = (e.pos.y * TILE - cam.worldView.y) * (cam.zoom / DPR);
            return { x0: ex - 1.5 * k, x1: ex + 1.5 * k, y0: ey - 3 * k, y1: ey + k };
          }),
        ...this.buttons.objects.map((o) => {
          const r = (o as Phaser.GameObjects.Container).getBounds();
          return { x0: r.left - 8, x1: r.right + 8, y0: r.top - 8, y1: r.bottom + 8 }; // + the gold ring
        }),
      ];
      const spots = [top, ...keepOff.flatMap((b) => [b.y1 + 6, b.y0 - 6 - h])];
      // Centred first; if nothing is clear there, slid to the left edge, away from the buttons.
      const fit = [view(this).width / 2, 8 + t.width / 2]
        .map((x) => {
          const clear = (y: number) =>
            y >= floor && y + h <= H - 8 && !keepOff.some((b) => b.x1 > x - t.width / 2 && b.x0 < x + t.width / 2 && b.y1 > y && b.y0 < y + h);
          return { x, y: spots.find(clear) };
        })
        .find((s) => s.y !== undefined);
      // No clear spot at all: the bottom-left corner, which is away from the buttons and the doors.
      t.setX(fit?.x ?? 8 + t.width / 2);
      top = fit?.y ?? H - h - 8;
    }
    t.setY(top);
    // Q-VIRTUE-BANNER: every Sensei line (New move!, lessons, Counter tip, twists, tutorial) goes through the one
    // rule, so none covers VIRTUE, STRIKE, Stance or any action button (#295: nor a player when there is room).
    this.placeOffPlayers(t, btn ? btn.height + 8 : 0, tutorialExtra);
    btn?.setPosition(t.x, t.y + t.height + 8);
    this.placeDecoToasts();
  }

  /**
   * Screen boxes that pop-ups keep off: each door (its tile plus the label under it, K23),
   * the chest once it shows, and (if asked) the big centre message such as "Sensei helps you up." (K23b, B-MASHER-d1).
   */
  private protectedBoxes(withMessage: boolean): { x0: number; x1: number; y0: number; y1: number }[] {
    const cam = this.cameras.main;
    const toScreen = (x0: number, y0: number, x1: number, y1: number) => ({
      x0: (x0 - cam.worldView.x) * (cam.zoom / DPR),
      x1: (x1 - cam.worldView.x) * (cam.zoom / DPR),
      y0: (y0 - cam.worldView.y) * (cam.zoom / DPR),
      y1: (y1 - cam.worldView.y) * (cam.zoom / DPR),
    });
    const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
    for (const d of this.doorViews) {
      if (!d.label.visible) continue;
      const b = d.label.getBounds();
      boxes.push(toScreen(Math.min(b.left, d.at.x * TILE - TILE / 2), b.top - TILE * 2, Math.max(b.right, d.at.x * TILE + TILE / 2), b.bottom));
    }
    const c = this.room.chest;
    if (c && this.chestImgs[0]?.alpha) boxes.push(toScreen((c.x - 0.6) * TILE, (c.y - 0.7) * TILE, (c.x + 0.6) * TILE, (c.y + 0.6) * TILE));
    // K24b: the wind-up cue ("!" in a ring) over an enemy about to attack.
    for (const e of this.world.enemies) {
      const v = e.mode === 'windup' ? this.enemyViews.get(e.id) : undefined;
      if (!v) continue;
      const at = this.windupCueSpot(v.container.x, v.container.y, v.top, e.def.radius * TILE);
      boxes.push(toScreen(at.x - 22, at.y - 22, at.x + 22, at.y + 22));
    }
    if (withMessage && this.message.visible) {
      const m = this.message.getBounds();
      boxes.push({ x0: m.left, x1: m.right, y0: m.top, y1: m.bottom });
    }
    return boxes;
  }

  /** A dropped item: a glowing orb that pops out, then a note at the top of the screen. */
  private showLoot(item: GearItem, at: Vec2): void {
    const { name, rarity } = item;
    const color = RARITY_COLOR[rarity];
    const rank = rarityRank(rarity);
    sfx.loot(rank);
    const orb = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, 8 + rank * 2, color).setStrokeStyle(3, 0xffffff, 0.8).setDepth(12));
    this.tweens.add({ targets: orb, y: orb.y - TILE * 0.9, duration: 260, ease: 'Cubic.Out', yoyo: true, hold: 200 });
    this.tweens.add({ targets: orb, alpha: 0, scale: 1.6, delay: 760, duration: 220, onComplete: () => orb.destroy() });
    if (rank >= 2) this.ring(at, color, 1.6);

    const { width } = view(this);
    const y = 64 + this.toastY * 26;
    this.toastY++;
    const t = this.add
      .text(width - 16, y, `${rarityName(rarity)}: ${name}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: css(color), stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(1, 0)
      .setResolution(crisp())
      .setAlpha(0);
    // K32: the item's slot + rarity icon rides left of the note.
    const icon = addGearIcon(this, item, 0, y + t.height / 2, 24);
    const parts = icon ? [t, icon] : [t];
    this.cameras.main.ignore(parts);
    const slideX = (o: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject, to: number) =>
      this.tweens.add({ targets: o, alpha: 1, x: { from: to + 56, to }, duration: 220, ease: 'Back.Out' });
    slideX(t, width - 16);
    if (icon) slideX(icon.setAlpha(0), width - 16 - t.width - 16);
    this.tweens.add({
      targets: parts,
      alpha: 0,
      delay: 2600,
      duration: 400,
      onComplete: () => {
        parts.forEach((o) => o.destroy());
        this.toastY = Math.max(0, this.toastY - 1);
      },
    });
  }

  /** A decoration for the Home Dojo: a surprise from a chest or elite (S7), or a sticker. */
  private showDecoration(id: string, at: Vec2, surprise = false): void {
    const name = decorationDef(CONTENT.dojo, id).name;
    sfx.loot(2);
    this.ring(at, COLORS.gold, 1.4);
    this.floatText(at, surprise ? 'A surprise!' : 'For your dojo!', '#ffd166', 16, 1.2);
    const { width } = view(this);
    const y = 64 + this.toastY * 26;
    this.toastY++;
    const t = this.add
      .text(width - 16, y, surprise ? `A surprise! ${name}` : `Decoration: ${name}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffd166', stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(1, 0)
      .setResolution(crisp());
    this.cameras.main.ignore(t);
    // K12: kept clear of Sensei's banner every frame (placeSensei), since the banner moves.
    this.decoToasts.push({ t, y });
    this.placeDecoToasts();
    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 3000,
      duration: 400,
      onComplete: () => {
        t.destroy();
        this.decoToasts = this.decoToasts.filter((d) => d.t !== t);
        this.toastY = Math.max(0, this.toastY - 1);
      },
    });
  }

  /** Decoration labels go under Sensei's banner when they would sit on it (K12). */
  private placeDecoToasts(): void {
    const b = this.senseiText?.active ? this.senseiText.getBounds() : null;
    for (const d of this.decoToasts) {
      const overlaps = b && d.y + d.t.height > b.top && d.y < b.bottom && d.t.x - d.t.width < b.right;
      d.t.setY(overlaps ? b.bottom + 8 : d.y);
    }
  }

  /**
   * A named monster is set free: Sensei's line, and the first time only, its journal
   * stamp and a sticker for the Home Dojo. Later wins give nothing more.
   */
  private namedFreed(id: string, at: Vec2): void {
    const def = CONTENT.named.monsters.find((m) => m.id === id);
    if (!def) return;
    const profile = loadSave();
    const sticker = this.run ? beatNamed(profile, this.run, CONTENT.named, id) : null;
    if (sticker) addDecorations(homeDojo(profile), [sticker]);
    writeSave(profile);
    this.senseiSay([def.lines.freed], 1800);
    if (!sticker) return;
    this.floatText(at, def.journal.stampText, '#ffd166', 15, 1.6);
    this.showDecoration(sticker, at);
  }

  private showGrade(grade: 'S' | 'A' | 'B', perfects: number, damage: number, ticks: number, inTime: boolean | null): void {
    const { width, height } = view(this);
    // Q-PREM-GRADE: the big letter and its sound are Challenge only; the Room clear! line always shows.
    const graded = showGrades(this.world.difficulty);
    if (graded) sfx.grade(grade);
    const letter = this.add
      .text(width / 2, height * 0.36, grade, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '84px', color: GRADE_COLOR[grade], stroke: '#14121c', strokeThickness: 9 })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setScale(2.2)
      .setAlpha(0)
      .setVisible(graded);
    // K23: the damage number is dropped (it read as harsh to kids); a clean room still says so.
    const parts = [`${perfects} Great`, ...(damage > 0 ? [] : ['no damage']), realClock(ticks)];
    const ch = this.room.challenge;
    if (ch && inTime) parts.push(ch.inTimeText);
    // A missed time gets its own line: the full sentence doesn't fit beside the stats at 667.
    const missed = ch && inTime === false ? `\n${ch.outOfTimeText}` : '';
    const line = this.add
      .text(width / 2, height * 0.36 + 48, `${BOSS_WIN.roomClear}  ${parts.join('  ·  ')}${missed}`, { fontFamily: FONT, fontSize: '17px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 4, align: 'center', wordWrap: { width: width - 32 } })
      .setOrigin(0.5, 0)
      .setResolution(crisp())
      .setAlpha(0);
    this.cameras.main.ignore([letter, line]);
    this.gradeLine = line;
    this.tweens.add({ targets: letter, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' });
    this.tweens.add({ targets: line, alpha: 1, delay: 150, duration: 200 });
    this.tweens.add({ targets: [letter, line], alpha: 0, delay: 1700, duration: 400, onComplete: () => (letter.destroy(), line.destroy(), (this.gradeLine = null)) });
  }

  private enemy(id: string): EnemyState | undefined {
    return this.world.enemies.find((e) => e.id === id);
  }

  /** A short freeze plus a small screen shake. */
  /** K25: the player's own attacks never shake the screen (scale defaults to SCREEN_SHAKE.playerAttackScale). */
  private impact(feel: { stopMs: number; shakeMs: number; shake: number }, scale: number = SCREEN_SHAKE.playerAttackScale): void {
    this.hitStopMs = Math.max(this.hitStopMs, feel.stopMs);
    if (scale > 0 && !reducedMotion()) this.cameras.main.shake(feel.shakeMs, feel.shake * scale);
  }

  /** K25: being hit shakes only at Brown belt and up or on Challenge, softer, never with Reduced motion. */

  /** K28: the one shake rule (hits and named-monster wind-ups): Brown rank and up or Challenge, 65%, never with Reduced motion. */
  private shakeScale(kind: 'hurt' | 'windup' | 'block'): number {
    return hurtShakeScale({ kind, beltTier: currentTraining().belt.tier, difficulty: this.world.difficulty, reducedMotion: reducedMotion() });
  }

  private addWorld<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.uiCamera.ignore(obj);
    return obj;
  }

  /**
   * A beaten creature is "set free": a soft golden flash, its dissolve into light (drawn
   * glowing), and a few sparkles drifting up. Short and light, so the fight stays readable.
   */
  private setFree(at: Vec2, boss: boolean): void {
    const x = at.x * TILE;
    const y = at.y * TILE;
    const size = boss ? 1.6 : 1;
    // No golden flash with reduced motion (K12).
    if (!reducedMotion()) {
      // A warm golden flash (normal colours, so it shows on light stone as well as dark floors).
      const glow = this.addWorld(this.add.image(x, y - TILE * 0.45, this.softGlow()).setDepth(8));
      glow.setTint(0xffb627).setScale(0.4).setAlpha(1);
      this.tweens.add({ targets: glow, scale: 2.2 * size, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => glow.destroy() });
      const core = this.addWorld(this.add.image(x, y - TILE * 0.45, this.softGlow()).setDepth(8).setScale(0.3));
      this.tweens.add({ targets: core, scale: 1.1 * size, alpha: 0, duration: 380, ease: 'Cubic.Out', onComplete: () => core.destroy() });
    }
    this.ring({ x: at.x, y: at.y - 0.3 }, 0xffd166, 1.3 * size, 0.9);
    // Little golden stars drift up and fade (none with reduced motion).
    const count = reducedMotion() ? 0 : boss ? 16 : 9;
    for (let i = 0; i < count; i++) {
      const sx = x + (Math.random() - 0.5) * TILE * 0.9 * size;
      const r = 5 + Math.random() * 4;
      const star = this.addWorld(this.add.star(sx, y - TILE * (0.2 + Math.random() * 0.5), 4, r * 0.4, r, i % 3 === 0 ? 0xffffff : 0xffe48a));
      star.setStrokeStyle(1.5, 0xc98a1a, 0.9).setDepth(8).setScale(0.4);
      this.tweens.add({ targets: star, scale: 1, duration: 140, delay: i * 25, ease: 'Back.Out' });
      this.tweens.add({
        targets: star,
        y: star.y - TILE * (0.8 + Math.random() * 0.9) * size,
        x: sx + (Math.random() - 0.5) * TILE * 0.4,
        angle: (Math.random() - 0.5) * 180,
        alpha: 0,
        delay: i * 25,
        duration: 700 + Math.random() * 350,
        ease: 'Sine.Out',
        onComplete: () => star.destroy(),
      });
    }
  }

  /** A soft round glow (white in the middle, fading out), made once and reused. */
  private softGlow(): string {
    const key = 'fx-soft-glow';
    if (!this.textures.exists(key)) {
      const tex = this.textures.createCanvas(key, 64, 64)!;
      const ctx = tex.getContext();
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.45, 'rgba(255,255,255,0.8)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      tex.refresh();
    }
    return key;
  }

  private sparks(at: Vec2, count: number, color: number): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = TILE * (0.5 + Math.random() * 0.7);
      const s = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, 2 + Math.random() * 3, color).setDepth(10));
      this.tweens.add({
        targets: s,
        x: s.x + Math.cos(a) * dist,
        y: s.y + Math.sin(a) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 220 + Math.random() * 160,
        ease: 'Cubic.Out',
        onComplete: () => s.destroy(),
      });
    }
  }

  /** A few fading after-images along the dash. */
  private dashTrail(from: Vec2): void {
    const p = this.world.players[this.me];
    const r = MOVEMENT.playerRadius * TILE;
    for (let i = 0; i < 4; i++) {
      const t = i / 4;
      const x = from.x + p.dashDir.x * COMBAT.dash.distanceTiles * t;
      const y = from.y + p.dashDir.y * COMBAT.dash.distanceTiles * t;
      const ghost = this.addWorld(this.add.circle(x * TILE, y * TILE, r, 0x9ad1ff, 0.35).setDepth(3));
      this.tweens.add({ targets: ghost, alpha: 0, scale: 0.6, delay: i * 40, duration: 260, onComplete: () => ghost.destroy() });
    }
  }

/**
   * B-MASHER-a: a shield bounce gives Focus; a soft gold ring for 0.4 s hints "use your Strike!".
   * Reduced motion: a steady gold tint for the same 0.4 s, with no pulse.
   */
  /** B-MASHER-2: once per run, a proud moment when Mash guard steps back (3 Perfect Counters in a room). */
  private senseiStepsBack(playerId: PlayerId): void {
    if (!takeMashGuardMoment(this.run ?? NO_RUN_KEY, playerId)) return;
    // The Manager's call: "seen" is saved with the run, so a reload doesn't show it again.
    if (this.run) saveRunInProgress(this.run);
    this.senseiSay([MASH_GUARD_LINE], 2200);
    this.placeSteppedBack();
    const p = this.world.players[playerId];
    if (!p) return;
    const r = 0.9 * TILE;
    if (reducedMotion()) {
      // Steady gold halo, no movement.
      const halo = this.addWorld(this.add.circle(p.pos.x * TILE, p.pos.y * TILE, r, SHIELD_GLOW_COLOR, 0.25).setStrokeStyle(4, SHIELD_GLOW_COLOR, 0.8).setDepth(9));
      this.time.delayedCall(1200, () => halo.destroy());
      return;
    }
    const t = this.senseiText;
    if (t) this.tweens.add({ targets: t, alpha: { from: 0, to: 1 }, duration: 250 });
    const c = this.addWorld(this.add.circle(p.pos.x * TILE, p.pos.y * TILE, r).setStrokeStyle(5, SHIELD_GLOW_COLOR, 0.9).setDepth(9));
    this.tweens.add({ targets: c, scale: { from: 0.6, to: 1.4 }, alpha: { from: 1, to: 0 }, duration: 1000, ease: 'Cubic.Out', onComplete: () => c.destroy() });
  }

  /** QA on #295: every player's sprite on screen, as screen boxes (a little roomy). */
  private playerScreenBoxes(): { x0: number; x1: number; y0: number; y1: number }[] {
    const cam = this.cameras.main;
    const z = cam.zoom / DPR;
    const k = TILE * z;
    const boxes = Object.values(this.world.players).map((p) => {
      const px = (p.pos.x * TILE - cam.worldView.x) * z;
      const py = (p.pos.y * TILE - cam.worldView.y) * z;
      return { x0: px - k, x1: px + k, y0: py - 1.8 * k, y1: py + 0.8 * k };
    });
    if (this.player?.active) {
      const r = this.player.getBounds();
      boxes.push({ x0: (r.left - cam.worldView.x) * z, x1: (r.right - cam.worldView.x) * z, y0: (r.top - cam.worldView.y) * z, y1: (r.bottom - cam.worldView.y) * z });
    }
    return boxes;
  }

  /** Pixels of the Sensei banner that lie over any player sprite (0 = clear). */
  senseiPlayerOverlap(): number {
    const t = this.senseiText;
    if (!t?.active) return 0;
    const x0 = t.x - t.width / 2, x1 = t.x + t.width / 2, y0 = t.y, y1 = t.y + t.height;
    return this.playerScreenBoxes().reduce((n, b) => n + Math.max(0, Math.min(x1, b.x1) - Math.max(x0, b.x0)) * Math.max(0, Math.min(y1, b.y1) - Math.max(y0, b.y0)), 0);
  }

  /**
   * QA on #295: the "Sensei steps back" banner holds 2.2 s, so it keeps off the players.
   * Its lines are balanced (no word alone on the last line), and it sits at the first spot
   * clear of every player: its usual place, the top edge, then the bottom edge.
   */
  private placeSteppedBack(): void {
    const t = this.senseiText;
    if (!t?.active) return;
    const { width } = view(this);
    const maxWrap = Math.min(width - 48, 640);
    t.setWordWrapWidth(null);
    const one = t.width - 32; // without the 16 px padding each side
    const lines = Math.ceil(one / maxWrap);
    t.setWordWrapWidth(lines > 1 ? Math.min(maxWrap, Math.ceil(one / lines) + 24) : maxWrap, true);
    t.setData('keepOffPlayers', true);
    this.placeSensei();
    // The players move while it holds (2.2 s): if one walks under it, it moves out of the way.
    this.time.addEvent({ delay: 100, repeat: 24, callback: () => {
      if (t.active && t === this.senseiText && this.senseiPlayerOverlap() > 0) this.placeOffPlayers(t);
    } });
  }

  /** The first spot for the banner clear of every player (and of the doors and messages when it can be). */
  /**
   * Keeps a banner off the heroes and, always, off the action buttons (Q-STANCE-BANNER), under the top bar.
   * One search (ui/senseiPlace.ts pickBannerSpot): clear of everything, else clear of heroes and buttons (the free
   * space above the bottom button row). No room: the small-phone text size, then again. Still none: over the
   * arena (clear of the buttons only), never over Stance or another button.
   */
  private placeOffPlayers(t: Phaser.GameObjects.Text, below = 0, extra: Box[] = []): void {
    const ask = (): BannerAsk => {
      const { width, height } = view(this);
      return {
        viewW: width,
        viewH: height,
        floor: this.senseiFloor(),
        home: this.senseiHome(height),
        w: t.width,
        h: t.height + below,
        x: t.x,
        y: t.y,
        players: this.playerScreenBoxes(),
        buttons: this.buttonKeepOut(),
        others: [...this.protectedBoxes(true), ...extra],
      };
    };
    let spot = pickBannerSpot(ask());
    if (!spot && Number.parseFloat(String(t.style.fontSize)) > 20) {
      t.setFontSize(20);
      t.setWordWrapWidth(Math.min(view(this).width - 48, 640), true);
      spot = pickBannerSpot(ask());
    }
    // Q-VIRTUE-BANNER: still no room (a tall tip on a small phone): narrow it into the strip left of the buttons.
    // Then narrower and taller, a step at a time, so it fits beside the hero (or in that strip).
    if (!spot) {
      const strip = leftStripWidth(ask());
      const wraps = [strip, ...Array.from({ length: 6 }, (_, i) => t.width - 40 * (i + 1))].filter((w) => w >= 200 && w < t.width);
      for (const w of wraps) {
        t.setWordWrapWidth(w - 32, true);
        spot = pickBannerSpot(ask());
        if (spot) break;
      }
    }
    spot ??= overArena(ask());
    t.setPosition(spot.x, spot.y);
  }

  /** Q-STANCE-BANNER: the action buttons (Stance and its name included) plus 8 px, kept clear of Sensei's banner. */
  buttonKeepOut(): Box[] {
    return this.buttons.objects.map((o) => {
      const r = (o as Phaser.GameObjects.Container).getBounds();
      return { x0: r.left - 8, x1: r.right + 8, y0: r.top - 8, y1: r.bottom + 8 };
    });
  }

  private shieldGlow(at: Vec2, radiusTiles: number): void {
    const r = (radiusTiles + 0.15) * TILE;
    if (reducedMotion()) {
      const tint = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, r, SHIELD_GLOW_COLOR, 0.3).setStrokeStyle(4, SHIELD_GLOW_COLOR, 0.8).setDepth(9));
      this.time.delayedCall(SHIELD_GLOW_MS, () => tint.destroy());
      return;
    }
    const c = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, r).setStrokeStyle(5, SHIELD_GLOW_COLOR, 0.85).setDepth(9));
    this.tweens.add({ targets: c, scale: { from: 0.9, to: 1.12 }, duration: SHIELD_GLOW_MS / 2, yoyo: true, ease: 'Sine.InOut' });
    this.tweens.add({ targets: c, alpha: { from: 0.95, to: 0 }, duration: SHIELD_GLOW_MS, ease: 'Cubic.In', onComplete: () => c.destroy() });
  }

    private ring(at: Vec2, color: number, radiusTiles: number, alpha = 0.9): void {
    const c = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, radiusTiles * TILE).setStrokeStyle(5, color, alpha).setDepth(9));
    c.setScale(0.3);
    this.tweens.add({ targets: c, scale: 1, alpha: 0, duration: 300, ease: 'Cubic.Out', onComplete: () => c.destroy() });
  }

  /** The elite Focus reward: pops in above the player, holds long enough to read, then floats away. */
  private focusPop(at: Vec2, text: string): void {
    const t = this.addWorld(
      this.add
        .text(at.x * TILE, (at.y - 1.3) * TILE, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '24px', color: '#cfeaff', stroke: '#14121c', strokeThickness: 6 })
        .setOrigin(0.5)
        .setResolution(window.devicePixelRatio || 1)
        .setDepth(12)
        .setScale(0.5),
    );
    this.tweens.add({ targets: t, scale: 1, duration: 180, ease: 'Back.Out' });
    this.tweens.add({ targets: t, y: t.y - 0.6 * TILE, alpha: 0, delay: 1100, duration: 500, ease: 'Cubic.In', onComplete: () => t.destroy() });
  }

  private floatText(at: Vec2, text: string, color: string, size: number, rise = 0.8): void {
    if (this.downed) return;
    const t = this.addWorld(
      this.add
        .text(at.x * TILE + (Math.random() - 0.5) * 16, (at.y - 0.6) * TILE, text, {
          fontFamily: 'system-ui, sans-serif',
          fontStyle: 'bold',
          fontSize: `${size}px`,
          color,
          stroke: '#14121c',
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setResolution(window.devicePixelRatio || 1)
        .setDepth(11),
    );
    this.popups.add(t);
    this.tweens.add({ targets: t, y: t.y - rise * TILE, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => this.dropPopup(t) });
  }

  /** A big word in the middle of the screen (for Perfect Counters). */
  /** Sensei's guided Counter slows the game while the taught attack winds up (step 0 most). */
  private guideSpeed(): number {
    const g = this.world.guide;
    if (!g || g.enemyId === null || g.waiting) return 1;
    return g.step === 0 ? 0.5 : g.step === 1 ? 0.75 : 1;
  }

  /**
   * K27 fix 2: where a wind-up cue goes. Above the enemy when that clears the boss bar and every
   * door label; otherwise beside it (right, then left), then lower beside it. Never on the body.
   */
  private windupCueSpot(x: number, y: number, top: number, radius: number): { x: number; y: number } {
    const R = 21;
    const minY = this.belowBossBar() + R;
    const labels: { left: number; right: number; top: number; bottom: number }[] = [...this.doorViews.filter((d) => d.label.visible).map((d) => d.label.getBounds())];
    // Refresh the name + bar box for this frame first, so the cue never reads last frame's spot.
    const bossUp = this.world.enemies.find((e) => e.def.boss && e.mode !== 'defeated');
    if (bossUp && this.bossName.visible) this.placeBossTag(bossUp);
    const tg = this.bossTagWorld;
    if (tg) labels.push(tg);
    const clear = (cx: number, cy: number) =>
      cy >= minY && labels.every((b) => cx + R < b.left - 4 || cx - R > b.right + 4 || cy + R < b.top - 4 || cy - R > b.bottom + 4);
    const side = Math.max(radius, 24) + R + 8;
    const bodyY = y - top / 2;
    const spots = [
      { x, y: y - top - 38 },
      { x: x + side, y: bodyY },
      { x: x - side, y: bodyY },
      { x: x + side, y },
      { x: x - side, y },
      { x: x + side, y: Math.max(bodyY, minY) },
      { x: x - side, y: Math.max(bodyY, minY) },
    ];
    // While the name + bar slide (e.g. off COMBO as it fades in) they can cover both side spots.
    // Then the cue goes just past the pair's own edge, or under it, instead of on top of it.
    if (tg) {
      const ty = Math.max(bodyY, minY);
      spots.push({ x: tg.right + R + 6, y: ty }, { x: tg.left - R - 6, y: ty }, { x, y: tg.bottom + R + 6 });
    }
    return spots.find((p) => clear(p.x, p.y)) ?? spots[5];
  }

  /**
   * K31: the boss's name and its small health bar move as one pair (bossTagLayout): name, a fixed gap, bar.
   * Above the head when there is room under the top bar, else both below the feet. The name slides sideways
   * off any door label (HOME), and the pair's world box is kept so the '!' cue (windupCueSpot) avoids it.
   */
  private placeBossTag(boss: EnemyState): void {
    const v = this.enemyViews.get(boss.id);
    if (!v) return;
    const cam = this.cameras.main;
    const k = cam.zoom / DPR;
    const sx = (wx: number) => (wx - cam.worldView.x) * k;
    const sy = (wy: number) => (wy - cam.worldView.y) * k;
    const toWorldX = (x: number) => cam.worldView.x + x / k;
    const toWorldY = (y: number) => cam.worldView.y + y / k;
    const { width, height } = view(this);
    const avoid: TagBox[] = [];
    for (const d of this.doorViews) {
      if (!d.label.visible) continue;
      const b = d.label.getBounds();
      avoid.push({ left: sx(b.left), right: sx(b.right), top: sy(b.top), bottom: sy(b.bottom) });
    }
    // COMBO and its "+N% power" line live in HUD (screen) space already.
    for (const t of [this.comboText, this.comboBonusText]) {
      if (!t.visible || t.alpha < 0.05 || !t.text) continue;
      const b = t.getBounds();
      avoid.push({ left: b.left, right: b.right, top: b.top, bottom: b.bottom });
    }
    const barHalf = (v.hpBack.width * k) / 2;
    const halfW = Math.max(this.bossName.width / 2, barHalf);
    const t = bossTagLayout({
      bossX: sx(v.container.x),
      headY: sy(v.container.y - v.top),
      feetY: sy(v.container.y),
      halfW,
      screenW: width,
      minY: HUD_BOTTOM + 4,
      maxY: height - 4,
      avoid,
    });
    // One x for the pair: the name and the bar share it.
    this.bossName.setPosition(t.x, t.nameTop);
    const barX = toWorldX(t.x) - v.container.x;
    const barY = toWorldY(t.barY) - v.container.y;
    v.hpBack.setPosition(barX, barY);
    v.hpFill.setPosition(barX - v.hpBack.width / 2 + 2, barY);
    this.bossTagWorld = {
      left: toWorldX(t.x - halfW - 4),
      right: toWorldX(t.x + halfW + 4),
      top: toWorldY(t.nameTop) - 2,
      bottom: toWorldY(t.barY + BOSS_TAG.barH / 2) + 2,
    };
  }

  /**
   * K30: a door label never sits on the boss's head, health bar or name. If it would, it slides
   * sideways to the far side of the door from the boss (the label still reads as that door's).
   */
  /** Q-DOOR-LABELS: a door by a side wall keeps its whole label on screen (after the boss slide in update). */
  private clampDoorLabels(cam: Phaser.Cameras.Scene2D.Camera): void {
    clampDoorLabels(this.doorViews.map((d) => d.label), cam, DPR);
  }

  private keepLabelOffBoss(d: { label: Phaser.GameObjects.Text; at: Vec2 }): void {
    const home = d.at.x * TILE;
    d.label.setX(home);
    for (const e of this.world.enemies) {
      if (!e.def.boss || e.mode === 'defeated') continue;
      const v = this.enemyViews.get(e.id);
      if (!v || !v.container.visible) continue;
      const r = e.def.radius * TILE;
      const hx0 = v.container.x - r - 6;
      const hx1 = v.container.x + r + 6;
      const hy0 = v.container.y - v.top - 34; // health bar and name above the head
      const hy1 = v.container.y - v.top * 0.4; // the head and shoulders
      const b = d.label.getBounds();
      // K31: the name and small bar may sit below the boss; keep the label off that pair too.
      const tag = this.bossTagWorld;
      if (tag && !(b.right < tag.left || b.left > tag.right || b.bottom < tag.top || b.top > tag.bottom)) {
        const half = b.width / 2 + 6;
        d.label.setX(v.container.x >= home ? Math.min(home, tag.left - half) : Math.max(home, tag.right + half));
        continue;
      }
      if (b.right < hx0 || b.left > hx1 || b.bottom < hy0 || b.top > hy1) continue;
      const half = b.width / 2 + 6;
      d.label.setX(v.container.x >= home ? Math.min(home, hx0 - half) : Math.max(home, hx1 + half));
    }
  }

  /** K27: the lowest world y a wind-up cue may sit at so it clears the boss bar and name (Q5 B1). */
  private belowBossBar(): number {
    const cam = this.cameras.main;
    const up = this.world.enemies.some((e) => e.def.boss && e.mode !== 'defeated');
    return up ? cam.worldView.y + ((BOSS_BAR_Y + 34 + 20) * DPR) / cam.zoom : -Infinity;
  }

  /** Top of Sensei's banner: just under the boss bar and its name when a boss is up, so both stay readable. */
  /** R-CHALLENGE P4: the lowest edge of the top bar's text and bars, in screen pixels. */
  private topBarBottom(): number {
    // Q-P4 QA: the health and Focus bars (drawHud: Focus's back ends at y 37 + 14) are part of the top bar too.
    let y = this.hud?.visible ? HUD_BARS_BOTTOM : 0;
    for (const o of [this.roomLabel, this.timerText]) if (o?.active && o.visible) y = Math.max(y, o.getBounds().bottom);
    if (this.world.enemies.some((e) => e.def.boss && e.mode !== 'defeated')) y = Math.max(y, BOSS_BAR_Y + 18);
    return y;
  }

  /** Q-P4 QA: the highest any Sensei banner may sit: 6 px under the top bar (every path goes through this). */
  private senseiFloor(): number {
    return senseiFloorY(this.topBarBottom());
  }

  /** Sensei's usual spot, never over the top bar: max(senseiTop, topBarBottom() + 6). */
  private senseiHome(height: number): number {
    return senseiHomeY(this.senseiTop(height), this.topBarBottom());
  }

  /** Q-P4 QA: the banner showing the guided Counter's cue, if it is still the one up. */
  private guideCue: Phaser.GameObjects.Text | null = null;

  /** True while the guided enemy is still winding up the attack its cue is about. */
  private guidedWindupLive(): boolean {
    const id = this.world.guide?.enemyId;
    if (id == null) return false;
    const g = this.world.enemies.find((x) => x.id === id);
    return !!g && g.mode === 'windup' && currentAttack(g).counterable !== false;
  }

  /** Removes the guided "COUNTER!" cue (and its Counter pulse) when no guided wind-up is left to Counter. */
  private clearGuideCue(): void {
    const t = this.guideCue;
    this.guideCue = null;
    if (!t || t !== this.senseiText) return;
    t.destroy();
    this.senseiText = null;
    this.buttons.pulseCounter(0);
  }

  private senseiTop(height: number): number {
    const boss = this.world.enemies.find((e) => e.def.boss && e.mode !== 'defeated');
    return boss ? BOSS_BAR_Y + 34 : height * 0.2 - 22;
  }

  /** Shows Sensei's read-aloud lines one after another at the top of the screen. */
  private senseiSay(lines: string[], holdMs = 1400, helpUp = false): void {
    // Q-PREM-F4: once the hero is down, only Sensei's help-up line shows (B-MASHER-d1, Jay's signed spec #292).
    if (this.downed && !helpUp) return;
    this.senseiText?.destroy();
    const { width, height } = view(this);
    const t = this.add
      .text(width / 2, this.senseiHome(height), '', {
        fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold',
        // K12: smaller on phones, and long lines wrap so they always fit on screen.
        fontSize: width < 720 ? '20px' : '26px',
        color: '#ffffff',
        // K24a: on the tutorial floor the box is see-through (about 65%) and the text has an outline and shadow.
        backgroundColor: this.run?.tutorial ? '#2a2440a6' : '#2a2440dd',
        ...(this.run?.tutorial ? { stroke: '#120e1c', strokeThickness: 4, shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true, stroke: true } } : {}),
        padding: { x: 16, y: 8 },
        align: 'center',
        // K27: tutorial tips wrap narrower, so there is room beside the buttons (Q5 B3, B4).
        wordWrap: { width: Math.min(width - (this.run?.tutorial ? 260 : 48), 640), useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0)
      .setResolution(window.devicePixelRatio || 1);
    this.cameras.main.ignore(t);
    this.senseiText = t;
    // The first line shows straight away, so its size is known (K12: labels keep clear of it).
    // K24a: the tutorial never moves lines on by timer; they all show together.
    if (this.run?.tutorial && lines.length > 1) lines = [lines.join('\n')];
    if (lines.length) t.setText(`Sensei: ${lines[0]}`);
    this.placeSensei();
    lines.slice(1).forEach((line, i) =>
      this.time.delayedCall((i + 1) * holdMs, () => {
        if (!t.active) return;
        t.setText(`Sensei: ${line}`);
        if (t === this.senseiText) this.placeSensei();
      }),
    );
  }

  /** K23: on a small phone the banner can sit over a door; then it moves down to just under the doors. */
  private senseiDone(line: string | undefined): void {
    this.buttons.pulseCounter(0);
    if (line) this.senseiSay([line]);
    const t = this.senseiText;
    this.time.delayedCall(1800, () => {
      if (t && t === this.senseiText) {
        t.destroy();
        this.senseiText = null;
      }
    });
    // Remember where the guide is, so each lesson shows once per profile.
    const profile = loadSave();
    profile.guideStep = this.world.guide?.step ?? GUIDE_DONE;
    writeSave(profile);
  }

  private popWord(text: string, color: string, size: number): void {
    if (this.downed) return;
    const { width, height } = view(this);
    const t = this.add
      .text(width / 2, height * 0.3, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: `${size}px`, color, stroke: '#14121c', strokeThickness: 8 })
      .setOrigin(0.5)
      .setResolution(window.devicePixelRatio || 1)
      .setScale(0.4);
    this.cameras.main.ignore(t);
    // K23c: keep off the doors, the chest, the centre message, Sensei's banner and the 'Room clear!' line; it drifts up 20 px as it fades.
    let top = t.y - t.height / 2 - 20;
    const sb = this.senseiText?.active ? this.senseiText.getBounds() : null;
    const boxes = this.protectedBoxes(true);
    const gl = this.gradeLine?.active ? this.gradeLine.getBounds() : null;
    for (const b of [sb, gl]) if (b) boxes.push({ x0: b.left, x1: b.right, y0: b.top, y1: b.bottom });
    for (let pass = 0; pass < 2; pass++)
      for (const b of boxes) {
        if (b.x1 < width / 2 - t.width / 2 || b.x0 > width / 2 + t.width / 2 || b.y1 < top || b.y0 > top + t.height + 20) continue;
        top = Math.max(top, b.y1 + 6);
      }
    t.setY(top + 20 + t.height / 2);
    this.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.Out' });
    this.popups.add(t);
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 20, delay: 450, duration: 300, onComplete: () => this.dropPopup(t) });
  }

  private dropPopup(t: Phaser.GameObjects.Text): void {
    this.popups.delete(t);
    this.tweens.killTweensOf(t);
    t.destroy();
  }

  private flashScreen(color: number, alpha: number, ms: number): void {
    if (reducedMotion()) return;
    this.tweens.killTweensOf(this.screenFlash);
    this.screenFlash.setFillStyle(color).setAlpha(alpha);
    this.tweens.add({ targets: this.screenFlash, alpha: 0, duration: ms });
  }
}

/** For testing: ?guide=0 starts Sensei's guided Counter from the beginning, whatever the save says. */
function testGuide(): number | undefined {
  const asked = testFlags().get('guide');
  return asked !== null && /^[0-3]$/.test(asked) ? Number(asked) : undefined;
}

/** For testing: ?force=wide-bonk makes the attack's owner use only that Challenge attack (see forceAttack.ts). */
function testForced() {
  return forceAttack(CONTENT.enemies, testFlags().get('force'));
}

/** Practice room only: ?difficulty=guided (or challenge). Tower runs carry their own difficulty (runDifficulty). */
function testDifficulty(): Difficulty | undefined {
  const asked = testFlags().get('difficulty');
  return asked && asked in DIFFICULTY ? (asked as Difficulty) : undefined;
}
