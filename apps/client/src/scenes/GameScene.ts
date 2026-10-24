import Phaser from 'phaser';
import {
  GUIDE_DONE,
  GUIDE_LESSONS,
  WARNING_LESSON,
  loadLessons,
  COMBAT,
  MOVEMENT,
  TICKS_PER_SECOND,
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
  bowIn,
  decorationDef,
  chooseInsight,
  createRunWorld,
  currentRoom,
  finishRun,
  activeForm,
  characterSetup,
  gainXp,
  modsFrom,
  rarityRank,
  runXp,
  strikeCost,
  runEffects,
  setPlayerMods,
  summarizeRun,
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
} from '@dojo/sim';
import bruteData from '../../../../content/enemies/brute.json';
import trainingRoom from '../../../../content/rooms/training-room.json';
import lessonsData from '../../../../content/tutorial/sensei-lessons.json';

const LESSONS = loadLessons(lessonsData);
import { addStatic, characterArt, characterTop, loadArt, setStaticFrame, staticArt } from '../art/art';
import { LayeredSprite } from '../art/LayeredSprite';
import { addShadow, makePlayerSprite, playLocomotion } from '../art/player';
import { loadLook, playerPacks } from '../game/look';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { homeDojo } from '../game/dojo';
import { loadSave, writeSave } from '../game/save';
import { currentTraining } from '../game/student';
import { bowPrompt, playBow } from '../ui/bow';
import { InsightPicker } from '../ui/InsightPicker';
import { runOverCard } from '../ui/RunOverCard';
import { startTowerRun } from '../game/tower';
import { FONT, GRADE_COLOR, RARITY_COLOR, RARITY_NAME, clock, crisp, css } from '../ui/theme';
import { ActionButtons } from '../input/ActionButtons';
import { TouchControls } from '../input/TouchControls';

/** Pixels per tile in the world (before camera zoom). */
const TILE = 48;
/** How many tiles tall the view is, whatever the phone's size. */
const VISIBLE_ROWS = 8;
const TICK_MS = 1000 / TICKS_PER_SECOND;
/** Never run more than this many ticks in one frame (e.g. after a long pause). */
const MAX_TICKS_PER_FRAME = 5;

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

interface EnemyView {
  container: Phaser.GameObjects.Container;
  /** The creature's art (body, glow, warning glow, defeat light, shield). */
  sprite: LayeredSprite;
  hpFill: Phaser.GameObjects.Rectangle;
  hpBack: Phaser.GameObjects.Rectangle;
  stars: Phaser.GameObjects.Arc[];
  /** Its colour, for sparks and rings. */
  color: number;
  /** Its height above the feet (px), for the dizzy stars and sweat drops. */
  top: number;
  prev: Vec2;
  flashUntil: number;
  /** The mode drawn last frame, to start animations when it changes. */
  lastMode: string;
  /** The attack being wound up (its animation plays when it lands). */
  attack: string;
  /** A short flinch when hit, until this time. */
  hitUntil: number;
  /** Calling for help (the boss), until this time. */
  callUntil: number;
  /** When it was beaten (the dissolve into light plays), or null. */
  defeatAt: number | null;
}

/** The warning glow's colour while a creature winds up (matches the danger circle). */
const TELEGRAPH_TINT = 0xff3b30;

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
  /** True once leaving the room (next room, or home). */
  private leaving = false;
  private picker: InsightPicker | null = null;
  private doorViews: DoorView[] = [];
  private chestImgs: Phaser.GameObjects.Image[] = [];
  private shrineImgs: Phaser.GameObjects.Image[] = [];
  /** When the chest started opening (its 2.5 s opening plays once), or null. */
  private chestOpenAt: number | null = null;
  private roomLabel!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private bossName!: Phaser.GameObjects.Text;
  private toastY = 0;
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
  private enemyViews = new Map<string, EnemyView>();

  private controls!: TouchControls;
  private buttons!: ActionButtons;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  // Top-left bars, combo counter and messages (drawn by the screen camera).
  private hud!: Phaser.GameObjects.Graphics;
  private comboText!: Phaser.GameObjects.Text;
  private comboBonusText!: Phaser.GameObjects.Text;
  private shownCombo = 0;
  private message!: Phaser.GameObjects.Text;
  private senseiText: Phaser.GameObjects.Text | null = null;
  private screenFlash!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Game');
  }

  init(data: GameSceneData): void {
    this.run = data.run ?? null;
  }

  preload(): void {
    loadArt(this, [...playerPacks(), 'enemies-t1', 'tower-t1']);
  }

  create(): void {
    this.training = currentTraining();
    this.setup = characterSetup(loadSave(), this.training, CONTENT.abilities);
    if (this.run) {
      this.room = currentRoom(CONTENT, this.run);
      this.world = createRunWorld(CONTENT, this.run, this.setup, this.setup.effects, testDifficulty(), testGuide() ?? loadSave().guideStep);
    } else {
      this.room = loadRoom(trainingRoom);
      this.world = createWorld(this.room, [this.me], {
        enemyTypes: { brute: loadEnemy(bruteData) },
        difficulty: testDifficulty(),
        player: { ...this.setup, mods: modsFrom(this.setup.effects, TICKS_PER_SECOND) },
      });
    }
    this.senseiText = null;
    this.menuOpen = false;
    this.leaving = false;
    this.picker = null;
    this.doorViews = [];
    this.toastY = 0;
    this.prevPos = { ...this.world.players[this.me].pos };
    this.elapsed = 0;
    this.hitStopMs = 0;
    this.enemyViews.clear();
    this.shownCombo = 0;
    this.heroAction = null;

    this.chestOpenAt = null;
    const roomGfx = this.drawRoom();
    const objects = this.makeRoomObjects();
    this.danger = this.add.graphics().setDepth(1);
    this.marker = this.add.circle(0, 0, TILE * 0.22).setStrokeStyle(3, COLORS.marker, 0.9).setVisible(false).setDepth(2);
    this.player = this.makePlayer();

    // Two cameras: one follows the character through the room, one holds the on-screen controls.
    const cam = this.cameras.main;
    cam.startFollow(this.player, true);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.ignore([...roomGfx, ...objects, this.danger, this.marker, this.player]);

    for (const e of this.world.enemies) this.makeEnemy(e);

    const p0 = this.world.players[this.me];
    this.buttons = new ActionButtons(this, () => sfx.unlock(), { forms: p0.forms.length > 1, virtue: !!p0.virtue });
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

    this.layout(this.scale.gameSize);
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
      this.elapsed = Math.min(this.elapsed + delta * this.guideSpeed(), TICK_MS * MAX_TICKS_PER_FRAME);
      while (this.elapsed >= TICK_MS) {
        this.savePrevious();
        const move = this.controls.takeInput();
        const action = this.buttons.takeAction();
        const input: PlayerInput = action ? { ...move, action } : move;
        stepWorld(this.world, this.room, { [this.me]: input });
        this.elapsed -= TICK_MS;
        this.playEvents(this.world.events);
        if (this.run) this.playRunEvents(updateRun(CONTENT, this.run, this.world));
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
    this.syncEnemyViews();
    for (const e of this.world.enemies) this.drawEnemy(e, blend, now);

    this.buttons.update(p);
    this.drawHud();
    this.drawRunHud(now);
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
        playLocomotion(s, p.moving ? speed : 0);
      }
    }
    s.flash(now < this.playerFlashUntil ? 0xff8a80 : null);
    s.update();
  }

  /** Starts a one-off move on the character (frames `from`..`to` of the animation). */
  private heroDo(name: string, from?: number, to?: number): void {
    this.heroAction = name;
    this.hero.play(name, { restart: true, from, to });
  }

  private drawEnemy(e: EnemyState, blend: number, now: number): void {
    const v = this.enemyViews.get(e.id);
    if (!v) return;
    const s = v.sprite;
    // Beaten: dissolve into light (a hopeful "set free"), then disappear.
    const defeat = s.art.animations.defeat;
    const dissolving = e.mode === 'defeated' && v.defeatAt !== null && now - v.defeatAt < (defeat.frames / defeat.fps) * 1000;
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
    const started = e.mode !== v.lastMode;
    v.lastMode = e.mode;

    let alpha = 1;
    let telegraph = 0;
    let tint: number | null = null;

    if (e.mode === 'defeated') {
      if (started || s.current !== 'defeat') s.play('defeat', { restart: true });
      // The dissolve is drawn a little bigger and glowing, and its shadow fades with it.
      const t = Phaser.Math.Clamp((now - (v.defeatAt ?? now)) / ((defeat.frames / defeat.fps) * 1000), 0, 1);
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
      v.attack = currentAttack(e).name ?? '';
      const anim = this.enemyAnim(s, `windup_${v.attack}`, 'windup');
      const frames = s.art.animations[anim].frames;
      s.showFrame(anim, (elapsed / e.windupTotal) * frames);
      const pulse = inWindow && Math.sin(now / 45) < 0 ? 0.7 : 1;
      telegraph = (s.art.animations[anim].telegraphIntensity?.[s.frame] ?? progress) * pulse;
      const cx = e.attackCenter.x * TILE;
      const cy = e.attackCenter.y * TILE;
      const area = currentAttack(e).areaRadius * TILE;
      this.danger.fillStyle(COLORS.danger, 0.16).fillCircle(cx, cy, area);
      this.danger.lineStyle(inWindow ? 6 : 3, inWindow ? 0xff8a80 : COLORS.danger, inWindow ? 1 : 0.9).strokeCircle(cx, cy, area);
      this.danger.fillStyle(COLORS.danger, inWindow ? 0.5 : 0.4).fillCircle(cx, cy, area * progress);
    } else if (e.mode === 'recover') {
      // The attack itself (it lands on its first frame), then catching its breath.
      const anim = this.enemyAnim(s, v.attack, 'attack');
      if (started) s.play(anim, { restart: true });
      telegraph = s.art.animations[anim].telegraphIntensity?.[s.frame] ?? 0;
    } else if (e.mode === 'stagger') {
      s.play('stagger');
    } else if (e.mode === 'winded') {
      // Out of breath: pale, slumped, and breathing hard.
      s.play(this.enemyAnim(s, 'winded', 'stagger'));
      tint = 0xd8d0c4;
    } else if (now < v.callUntil) {
      s.play(this.enemyAnim(s, 'call', 'idle'));
    } else if (now < v.hitUntil) {
      s.play('hit');
    } else {
      // Chasing or circling: walk while moving, at a pace matched to its speed.
      const speed = Math.hypot(e.pos.x - v.prev.x, e.pos.y - v.prev.y) * TICKS_PER_SECOND;
      const design = (s.art.animations.move as { designSpeedTilesPerSecond?: number }).designSpeedTilesPerSecond ?? 2;
      if (speed > 0.2) s.play('move', { speed: Phaser.Math.Clamp(speed / design, 0.5, 2) });
      else s.play('idle');
    }

    // The warning glow, only while winding up and swinging.
    s.setLayer('telegraph', telegraph > 0.01);
    s.images.get('telegraph')?.setAlpha(Phaser.Math.Clamp(telegraph, 0, 1));
    // Shield guards: the shield while it's up, the cracked one once broken.
    s.setLayer('shield', e.shieldUp);
    s.setLayer('shield-broken', !e.shieldUp);
    s.flash(now < v.flashUntil ? 0xffffff : tint, now < v.flashUntil);
    s.update();
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

  /** The first of these animations the creature has (e.g. the boss's "windup_slam", else "windup"). */
  private enemyAnim(s: LayeredSprite, wanted: string, fallback: string): string {
    return s.has(wanted) ? wanted : fallback;
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

    if (p.combo !== this.shownCombo) {
      const grew = p.combo > this.shownCombo;
      this.shownCombo = p.combo;
      if (p.combo >= 2) {
        this.comboText.setText(`${p.combo} COMBO`);
        const bonus = p.combo >= 30 ? 15 : p.combo >= 20 ? 10 : p.combo >= 10 ? 5 : 0;
        this.comboBonusText.setText(bonus ? `+${bonus}% power` : '');
        if (grew) {
          this.tweens.killTweensOf(this.comboText);
          this.comboText.setScale(1.35);
          this.tweens.add({ targets: this.comboText, scale: 1, duration: 140, ease: 'Back.Out' });
        }
      }
      this.comboText.setVisible(p.combo >= 2);
      this.comboBonusText.setVisible(p.combo >= 2);
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
      for (const img of addStatic(this, 'tower-t1', id, x, y)) out.push(img.setDepth(depth));
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
    for (const e of this.world.enemies) if (!this.enemyViews.has(e.id)) this.makeEnemy(e);
  }

  private makeEnemy(e: EnemyState): void {
    const r = e.def.radius * TILE;
    const color = Phaser.Display.Color.HexStringToColor(e.def.color).color;
    const art = characterArt(this, 'enemies-t1', e.def.id)!;
    const sprite = new LayeredSprite(this, art);
    sprite.container.addAt(addShadow(this, r * 2.2), 0);
    sprite.setLayer('telegraph', false).setLayerTint('telegraph', TELEGRAPH_TINT);
    const top = characterTop(this, art);
    const hpBack = this.add.rectangle(0, -top - 8, r * 2, 8, 0x000000, 0.6);
    const hpFill = this.add.rectangle(-r + 2, -top - 8, r * 2 - 4, 4, COLORS.healthLow).setOrigin(0, 0.5);
    const stars = [0, 1, 2].map(() => this.add.circle(0, 0, 4, COLORS.gold).setVisible(false));
    const container = this.add.container(e.pos.x * TILE, e.pos.y * TILE, [sprite.container, hpBack, hpFill, ...stars]).setDepth(4);
    this.uiCamera.ignore(container);
    this.enemyViews.set(e.id, {
      container,
      sprite,
      hpBack,
      hpFill,
      stars,
      color,
      top,
      prev: { ...e.pos },
      flashUntil: 0,
      lastMode: e.mode,
      attack: '',
      hitUntil: 0,
      callUntil: 0,
      defeatAt: null,
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
    this.cameras.main.ignore([this.hud, this.comboText, this.comboBonusText, this.message, this.screenFlash, this.roomLabel, this.timerText, this.bossName]);
  }

  private layout(size: Phaser.Structs.Size): void {
    const { width, height } = size;
    const cam = this.cameras.main;
    cam.setSize(width, height);
    const zoom = height / (VISIBLE_ROWS * TILE);
    cam.setZoom(zoom);
    // Camera limits: a strip above the top wall keeps doors clear of the health bars,
    // and rooms smaller than the screen sit in the middle.
    const viewW = width / zoom;
    const viewH = height / zoom;
    const roomW = this.room.width * TILE;
    const top = -TILE * 1.1;
    const roomH = this.room.height * TILE - top;
    const bw = Math.max(roomW, viewW);
    const bh = Math.max(roomH, viewH);
    cam.setBounds((roomW - bw) / 2, top - (bh - roomH) / 2, bw, bh);
    this.uiCamera.setSize(width, height);
    this.controls.layout();
    this.buttons.layout();
    this.comboText.setX(width / 2);
    this.comboBonusText.setX(width / 2);
    this.message.setPosition(width / 2, height * 0.4);
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
          else if (ev.move === 'strike') this.heroDo('strike');
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
          const p = this.world.players[ev.playerId];
          sfx.perfect();
          this.heroDo('counter', 8); // the counter punch
          this.impact(FEEL.perfect);
          this.flashScreen(0xffffff, 0.55, 220);
          this.ring(p.pos, COLORS.gold, 2.2);
          this.popWord('PERFECT!', '#ffd166', 54);
          break;
        }
        case 'block': {
          const p = this.world.players[ev.playerId];
          sfx.block();
          this.impact(FEEL.block);
          this.ring(p.pos, COLORS.shield, 1.2);
          this.sparks(p.pos, 6, COLORS.shield);
          this.floatText(p.pos, `BLOCK  -${ev.damage}`, '#9ad1ff', 22);
          break;
        }
        case 'hit': {
          const p = this.world.players[ev.playerId];
          sfx.hurt();
          this.heroDo('hit');
          this.impact(FEEL.hurt);
          this.playerFlashUntil = this.time.now + 160;
          this.flashScreen(0xff2a1a, 0.3, 200);
          this.floatText(p.pos, `-${ev.damage}`, '#ff6b5b', 26);
          break;
        }
        case 'guideStart': {
          // Step 0 opens with the warning lesson; the hints say their one line and pulse Counter.
          const lesson = LESSONS[GUIDE_LESSONS[ev.step]];
          this.senseiSay(ev.step === 0 ? LESSONS[WARNING_LESSON].screens : lesson.screens, 1100);
          this.buttons.pulseCounter(ev.step === 2 ? 1 : 2);
          break;
        }
        case 'guideWait':
          this.senseiSay(LESSONS[GUIDE_LESSONS[0]].screens);
          break;
        case 'guideDone': {
          const lesson = LESSONS[GUIDE_LESSONS[ev.step]];
          this.senseiDone(ev.success ? lesson.success : lesson.retry);
          break;
        }
        case 'telegraph': {
          const e = this.enemy(ev.enemyId);
          sfx.windup(ev.ticks / TICKS_PER_SECOND);
          if (e) this.floatText({ x: e.pos.x, y: e.pos.y - e.def.radius - 0.3 }, '!', '#ff3b30', 40, 0.4);
          break;
        }
        case 'enemySwing': {
          const e = this.enemy(ev.enemyId);
          if (!countered.has(ev.enemyId)) sfx.whoosh();
          if (e?.attackCenter) this.ring(e.attackCenter, 0xffffff, currentAttack(e).areaRadius, 0.6);
          break;
        }
        case 'counterPressed':
          sfx.guard();
          this.heroDo('counter', 0, 7); // the block, held while guarding
          break;
        case 'dash': {
          const p = this.world.players[ev.playerId];
          sfx.dash();
          this.heroDo('dash');
          this.dashTrail(p.pos);
          break;
        }
        case 'formChange': {
          const p = this.world.players[ev.playerId];
          sfx.insight();
          this.ring(p.pos, 0x6fb7ff, 1.2);
          this.floatText(p.pos, activeForm(p).name, '#9ad1ff', 22, 1);
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
          sfx.playerDown();
          this.heroDo('defeat');
          this.cameras.main.fade(900, 10, 8, 16);
          this.message.setText(this.run ? 'Ouch! The run is over.\nYou keep everything you found.' : 'Ouch!\nBack to the start.').setVisible(true);
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
          break;
        case 'chestOpened': {
          // The chest wiggles first; the chime, ring and sparks come when the lid bursts open.
          this.chestOpenAt = this.time.now;
          const at = this.room.chest;
          this.time.delayedCall(this.chestTiming().burstMs, () => {
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
          this.floatText(p.pos, one ? 'The door is open!' : 'The doors are open! Pick one.', '#f2e9d8', 20, 1.2);
          break;
        }
        case 'playerReturn':
          this.cameras.main.resetFX();
          this.cameras.main.fadeIn(400, 10, 8, 16);
          this.message.setVisible(false);
          break;
        case 'enemySpawn': {
          const e = this.enemy(ev.enemyId);
          if (e) {
            sfx.appear();
            this.ring(e.pos, this.enemyViews.get(e.id)?.color ?? COLORS.brute, 1.2);
          }
          break;
        }
        case 'shieldBlock': {
          const e = this.enemy(ev.enemyId);
          sfx.clank();
          if (e) {
            this.sparks(e.pos, 4, 0xc9d6e8);
            this.floatText(e.pos, 'CLANK', '#c9d6e8', 18);
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
        case 'summon': {
          const e = this.enemy(ev.enemyId);
          sfx.appear();
          if (e) this.floatText({ x: e.pos.x, y: e.pos.y - 1 }, 'Help me!', '#ffd166', 24);
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
          this.afterChestBurst(() => this.showLoot(ev.item.name, ev.item.rarity, ev.at));
          break;
        case 'decoration':
          this.afterChestBurst(() => this.showDecoration(ev.id, ev.at));
          break;
        case 'graded':
          this.showGrade(ev.result.grade!, ev.result.perfects, ev.result.damageTaken, ev.result.ticks, ev.result.inTime);
          break;
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
  private endRun(status: 'cleared' | 'lost'): void {
    if (!this.run) return;
    const profile = loadSave();
    const summary = summarizeRun(this.run);
    finishRun(profile, summary);
    addDecorations(homeDojo(profile), summary.decorations);
    // Experience, capped by the real belt (with the Blessing and catch-up bonuses).
    const xp = gainXp(profile, this.training, runXp(summary));
    if (profile.lastRun) profile.lastRun.xp = xp;
    writeSave(profile);
    this.leaving = true;
    const leave = (scene: string, data?: GameSceneData) => {
      this.cameras.main.fadeOut(600, 10, 8, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start(scene, data));
    };
    if (status === 'lost') {
      // A soft card with what they keep, then Try again or Back home.
      this.time.delayedCall(1400, () => {
        this.message.setVisible(false);
        const card = runOverCard(
          this,
          summary,
          xp.gained,
          () => {
            this.uiCamera.fadeOut(400, 10, 8, 16);
            this.uiCamera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
              this.scene.start('Game', { run: startTowerRun(loadSave(), this.training) }),
            );
          },
          () => {
            this.uiCamera.fadeOut(400, 10, 8, 16);
            this.uiCamera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Home'));
          },
        );
        this.cameras.main.ignore(card);
      });
      return;
    }
    sfx.floorClear();
    this.message.setText('Floor cleared!').setVisible(true);
    this.time.delayedCall(200, () => leave('Home'));
  }

  /** The bow at the start of the floor: the fight waits, then a small Focus head start. */
  private askForBow(): void {
    this.menuOpen = true;
    this.enemiesAt = null;
    const prompt = bowPrompt(this, 'Bow to begin the floor', () => {
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
    const lines = [this.room.name];
    if (this.room.challenge) lines.push(this.room.challenge.text);
    else if (this.room.kind === 'rest') lines.push('Walk to the shrine to rest.');
    else if (this.room.kind === 'treasure') lines.push('Open the chest!');
    else if (this.room.kind === 'boss') lines.push('The Floor Keeper awaits.');
    this.message.setText(lines.join('\n')).setFontSize(this.room.challenge ? 22 : 26).setVisible(true).setAlpha(1);
    this.tweens.add({
      targets: this.message,
      alpha: 0,
      delay: 1400,
      duration: 500,
      onComplete: () => this.message.setVisible(false).setAlpha(1).setFontSize(28),
    });
  }

  private makeRoomObjects(): Phaser.GameObjects.GameObject[] {
    const objs: Phaser.GameObjects.GameObject[] = [];
    if (this.run) {
      const slots = activeDoorSlots(this.room, this.run.doors.length);
      this.run.doors.forEach((kind, i) => {
        const at = this.room.doors[slots[i]];
        // The door stands in its wall slot, its feet on the wall's bottom edge.
        const art = DOOR_ART[kind];
        const images = addStatic(this, 'tower-t1', art, at.x * TILE, (at.y + 0.5) * TILE).map((img) => img.setDepth(0.6));
        const glow = kind === 'boss' ? addStatic(this, 'tower-t1', 'door-boss-glow', at.x * TILE, (at.y + 0.5) * TILE).map((img) => img.setDepth(0.61)) : [];
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
    this.chestImgs = c ? addStatic(this, 'tower-t1', 'chest-closed', c.x * TILE, (c.y + 0.5) * TILE) : [];
    const sh = this.room.shrine;
    this.shrineImgs = sh ? addStatic(this, 'tower-t1', 'shrine', sh.x * TILE, (sh.y + 0.5) * TILE) : [];
    // The chest's glow, beam and stars show above the character standing at it.
    if (c) this.chestImgs.forEach((img, i) => img.setDepth(i === 0 ? depthAt((c.y + 0.4) * TILE) : 8));
    if (sh) this.shrineImgs.forEach((img) => img.setDepth(depthAt((sh.y + 0.4) * TILE)));
    objs.push(...this.chestImgs, ...this.shrineImgs);
    return objs;
  }

  /** Plays a looping (or once-only) static animation on images made by addStatic. */
  private animateStatic(id: string, images: Phaser.GameObjects.Image[], seconds: number): void {
    const art = staticArt(this, 'tower-t1', id);
    if (!art) return;
    const f = Math.floor(seconds * (art.fps ?? 8));
    setStaticFrame(this, 'tower-t1', id, images, art.loop ? f % art.frames : Math.min(f, art.frames - 1));
  }

  /** How long the chest's opening takes before the lid bursts open (ms), and in total. */
  private chestTiming(): { burstMs: number; totalMs: number } {
    const art = staticArt(this, 'tower-t1', 'chest-open');
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
      setStaticFrame(this, 'tower-t1', d.art, d.images, prog.doorsOpen ? 1 : 0);
      if (d.glow.length) {
        d.glow.forEach((img) => img.setVisible(!prog.doorsOpen));
        if (!prog.doorsOpen) this.animateStatic('door-boss-glow', d.glow, now / 1000);
      }
      d.label.setAlpha(prog.doorsOpen ? pulse : 0.55);
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
      const left = Math.max(0, ch.seconds * TICKS_PER_SECOND - prog.ticks);
      const done = prog.cleared;
      this.timerText.setVisible(true);
      this.timerText.setText(done ? (prog.ticks <= ch.seconds * TICKS_PER_SECOND ? 'In time!' : 'Out of time') : clock(left, TICKS_PER_SECOND));
      this.timerText.setColor(left > 10 * TICKS_PER_SECOND || done ? '#f2e9d8' : '#ff6b5b');
    } else {
      this.timerText.setVisible(false);
    }

    // Boss health bar (top middle).
    const boss = this.world.enemies.find((e) => e.def.boss);
    const g = this.hud;
    if (boss && boss.mode !== 'defeated') {
      const { width } = this.scale.gameSize;
      const w = Math.min(320, width * 0.4);
      const x = width / 2 - w / 2;
      const y = 74;
      g.fillStyle(0x000000, 0.55).fillRoundedRect(x - 3, y - 3, w + 6, 16, 5);
      g.fillStyle(0xb046a0).fillRoundedRect(x, y, Math.max(6, w * (boss.health / boss.def.maxHealth)), 10, 3);
      this.bossName.setText(boss.def.name).setPosition(width / 2, y + 14).setVisible(true);
    } else {
      this.bossName.setVisible(false);
    }
  }

  /** A dropped item: a glowing orb that pops out, then a note at the top of the screen. */
  private showLoot(name: string, rarity: Parameters<typeof rarityRank>[0], at: Vec2): void {
    const color = RARITY_COLOR[rarity];
    const rank = rarityRank(rarity);
    sfx.loot(rank);
    const orb = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, 8 + rank * 2, color).setStrokeStyle(3, 0xffffff, 0.8).setDepth(12));
    this.tweens.add({ targets: orb, y: orb.y - TILE * 0.9, duration: 260, ease: 'Cubic.Out', yoyo: true, hold: 200 });
    this.tweens.add({ targets: orb, alpha: 0, scale: 1.6, delay: 760, duration: 220, onComplete: () => orb.destroy() });
    if (rank >= 2) this.ring(at, color, 1.6);

    const { width } = this.scale.gameSize;
    const y = 64 + this.toastY * 26;
    this.toastY++;
    const t = this.add
      .text(width - 16, y, `${RARITY_NAME[rarity]}: ${name}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: css(color), stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(1, 0)
      .setResolution(crisp())
      .setAlpha(0);
    this.cameras.main.ignore(t);
    this.tweens.add({ targets: t, alpha: 1, x: { from: width + 40, to: width - 16 }, duration: 220, ease: 'Back.Out' });
    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 2600,
      duration: 400,
      onComplete: () => {
        t.destroy();
        this.toastY = Math.max(0, this.toastY - 1);
      },
    });
  }

  /** A decoration for the Home Dojo came out of the chest. */
  private showDecoration(id: string, at: Vec2): void {
    const name = decorationDef(CONTENT.dojo, id).name;
    sfx.loot(2);
    this.ring(at, COLORS.gold, 1.4);
    this.floatText(at, 'For your dojo!', '#ffd166', 16, 1.2);
    const { width } = this.scale.gameSize;
    const y = 64 + this.toastY * 26;
    this.toastY++;
    const t = this.add
      .text(width - 16, y, `Decoration: ${name}`, { fontFamily: FONT, fontStyle: 'bold', fontSize: '16px', color: '#ffd166', stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(1, 0)
      .setResolution(crisp());
    this.cameras.main.ignore(t);
    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 3000,
      duration: 400,
      onComplete: () => {
        t.destroy();
        this.toastY = Math.max(0, this.toastY - 1);
      },
    });
  }

  private showGrade(grade: 'S' | 'A' | 'B', perfects: number, damage: number, ticks: number, inTime: boolean | null): void {
    const { width, height } = this.scale.gameSize;
    sfx.grade(grade);
    const letter = this.add
      .text(width / 2, height * 0.36, grade, { fontFamily: 'Georgia, serif', fontStyle: 'bold', fontSize: '84px', color: GRADE_COLOR[grade], stroke: '#14121c', strokeThickness: 9 })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setScale(2.2)
      .setAlpha(0);
    const parts = [`${perfects} Perfect`, damage > 0 ? `-${damage} health` : 'no damage', clock(ticks, TICKS_PER_SECOND)];
    if (inTime !== null) parts.push(inTime ? 'in time!' : 'out of time');
    const line = this.add
      .text(width / 2, height * 0.36 + 58, `Room clear!  ${parts.join('  ·  ')}`, { fontFamily: FONT, fontSize: '17px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(0.5)
      .setResolution(crisp())
      .setAlpha(0);
    this.cameras.main.ignore([letter, line]);
    this.tweens.add({ targets: letter, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' });
    this.tweens.add({ targets: line, alpha: 1, delay: 150, duration: 200 });
    this.tweens.add({ targets: [letter, line], alpha: 0, delay: 1700, duration: 400, onComplete: () => (letter.destroy(), line.destroy()) });
  }

  private enemy(id: string): EnemyState | undefined {
    return this.world.enemies.find((e) => e.id === id);
  }

  /** A short freeze plus a small screen shake. */
  private impact(feel: { stopMs: number; shakeMs: number; shake: number }): void {
    this.hitStopMs = Math.max(this.hitStopMs, feel.stopMs);
    this.cameras.main.shake(feel.shakeMs, feel.shake);
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
    // A warm golden flash (normal colours, so it shows on light stone as well as dark floors).
    const glow = this.addWorld(this.add.image(x, y - TILE * 0.45, this.softGlow()).setDepth(8));
    glow.setTint(0xffb627).setScale(0.4).setAlpha(1);
    this.tweens.add({ targets: glow, scale: 2.2 * size, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => glow.destroy() });
    const core = this.addWorld(this.add.image(x, y - TILE * 0.45, this.softGlow()).setDepth(8).setScale(0.3));
    this.tweens.add({ targets: core, scale: 1.1 * size, alpha: 0, duration: 380, ease: 'Cubic.Out', onComplete: () => core.destroy() });
    this.ring({ x: at.x, y: at.y - 0.3 }, 0xffd166, 1.3 * size, 0.9);
    // Little golden stars drift up and fade.
    const count = boss ? 16 : 9;
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

  private ring(at: Vec2, color: number, radiusTiles: number, alpha = 0.9): void {
    const c = this.addWorld(this.add.circle(at.x * TILE, at.y * TILE, radiusTiles * TILE).setStrokeStyle(5, color, alpha).setDepth(9));
    c.setScale(0.3);
    this.tweens.add({ targets: c, scale: 1, alpha: 0, duration: 300, ease: 'Cubic.Out', onComplete: () => c.destroy() });
  }

  private floatText(at: Vec2, text: string, color: string, size: number, rise = 0.8): void {
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
    this.tweens.add({ targets: t, y: t.y - rise * TILE, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  /** A big word in the middle of the screen (for Perfect Counters). */
  /** Sensei's guided Counter slows the game while the taught attack winds up (step 0 most). */
  private guideSpeed(): number {
    const g = this.world.guide;
    if (!g || g.enemyId === null) return 1;
    return g.step === 0 ? 0.5 : g.step === 1 ? 0.75 : 1;
  }

  /** Shows Sensei's read-aloud lines one after another at the top of the screen. */
  private senseiSay(lines: string[], holdMs = 1400): void {
    this.senseiText?.destroy();
    const { width, height } = this.scale.gameSize;
    const t = this.add
      .text(width / 2, height * 0.2, '', {
        fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold',
        fontSize: '26px',
        color: '#ffffff',
        backgroundColor: '#2a2440dd',
        padding: { x: 16, y: 8 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setResolution(window.devicePixelRatio || 1);
    this.cameras.main.ignore(t);
    this.senseiText = t;
    lines.forEach((line, i) => this.time.delayedCall(i * holdMs, () => t.active && t.setText(`Sensei: ${line}`)));
  }

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
    const { width, height } = this.scale.gameSize;
    const t = this.add
      .text(width / 2, height * 0.3, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: `${size}px`, color, stroke: '#14121c', strokeThickness: 8 })
      .setOrigin(0.5)
      .setResolution(window.devicePixelRatio || 1)
      .setScale(0.4);
    this.cameras.main.ignore(t);
    this.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.Out' });
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 20, delay: 450, duration: 300, onComplete: () => t.destroy() });
  }

  private flashScreen(color: number, alpha: number, ms: number): void {
    this.tweens.killTweensOf(this.screenFlash);
    this.screenFlash.setFillStyle(color).setAlpha(alpha);
    this.tweens.add({ targets: this.screenFlash, alpha: 0, duration: ms });
  }
}

/**
 * For testing only, until the difficulty choice arrives in milestone 7:
 * adding ?difficulty=guided (or challenge) to the link picks that difficulty.
 */
/** For testing: ?guide=0 starts Sensei's guided Counter from the beginning, whatever the save says. */
function testGuide(): number | undefined {
  const asked = new URLSearchParams(window.location.search).get('guide');
  return asked !== null && /^[0-3]$/.test(asked) ? Number(asked) : undefined;
}

function testDifficulty(): Difficulty | undefined {
  const asked = new URLSearchParams(window.location.search).get('difficulty');
  return asked && asked in DIFFICULTY ? (asked as Difficulty) : undefined;
}
