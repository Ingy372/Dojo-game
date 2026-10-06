import Phaser from 'phaser';
import {
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
  chooseInsight,
  createRunWorld,
  currentRoom,
  finishRun,
  modsFrom,
  playerStats,
  rarityRank,
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
} from '@dojo/sim';
import bruteData from '../../../../content/enemies/brute.json';
import trainingRoom from '../../../../content/rooms/training-room.json';
import { sfx } from '../audio/Sfx';
import { CONTENT } from '../game/content';
import { loadSave, writeSave } from '../game/save';
import { InsightPicker } from '../ui/InsightPicker';
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
  belt: 0xffffff,
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
  gfx: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  at: Vec2;
}

/** What the game scene is started with: a run in progress, or nothing for the practice room. */
export interface GameSceneData {
  run?: RunState;
}

interface EnemyView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Arc;
  eye: Phaser.GameObjects.Arc;
  hpFill: Phaser.GameObjects.Rectangle;
  hpBack: Phaser.GameObjects.Rectangle;
  stars: Phaser.GameObjects.Arc[];
  shieldGfx: Phaser.GameObjects.Graphics;
  color: number;
  prev: Vec2;
  flashUntil: number;
}

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
  /** True while a menu (like the Insight choice) is open: the fight is paused. */
  private menuOpen = false;
  /** True once leaving the room (next room, or home). */
  private leaving = false;
  private picker: InsightPicker | null = null;
  private doorViews: DoorView[] = [];
  private chestGfx: Phaser.GameObjects.Graphics | null = null;
  private shrineGfx: Phaser.GameObjects.Graphics | null = null;
  private roomLabel!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private bossName!: Phaser.GameObjects.Text;
  private toastY = 0;
  private prevPos: Vec2 = { x: 0, y: 0 };
  private elapsed = 0;
  /** While above 0, the action is frozen for a moment on impact. */
  private hitStopMs = 0;

  private player!: Phaser.GameObjects.Container;
  private body!: Phaser.GameObjects.Arc;
  private facingDot!: Phaser.GameObjects.Arc;
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
  private screenFlash!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Game');
  }

  init(data: GameSceneData): void {
    this.run = data.run ?? null;
  }

  create(): void {
    if (this.run) {
      this.room = currentRoom(CONTENT, this.run);
      const stats = playerStats(loadSave());
      this.world = createRunWorld(CONTENT, this.run, stats, stats.effects, testDifficulty());
    } else {
      this.room = loadRoom(trainingRoom);
      this.world = createWorld(this.room, [this.me], { enemyTypes: { brute: loadEnemy(bruteData) }, difficulty: testDifficulty() });
    }
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

    const roomGfx = this.drawRoom();
    const objects = this.makeRoomObjects();
    this.danger = this.add.graphics().setDepth(1);
    this.marker = this.add.circle(0, 0, TILE * 0.22).setStrokeStyle(3, COLORS.marker, 0.9).setVisible(false).setDepth(2);
    this.player = this.makePlayer().setDepth(5);

    // Two cameras: one follows the character through the room, one holds the on-screen controls.
    const cam = this.cameras.main;
    cam.startFollow(this.player, true);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.ignore([roomGfx, ...objects, this.danger, this.marker, this.player]);

    for (const e of this.world.enemies) this.makeEnemy(e);

    this.buttons = new ActionButtons(this, () => sfx.unlock());
    this.controls = new TouchControls(
      this,
      cam,
      (x, y) => ({ x: x / TILE, y: y / TILE }),
      (x, y) => this.menuOpen || this.buttons.contains(x, y) || this.onHomeButton(x, y),
    );
    this.makeHud();
    cam.ignore([...this.controls.objects, ...this.buttons.objects]);
    cam.fadeIn(350, 10, 8, 16);
    this.introduceRoom();

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
      this.elapsed = Math.min(this.elapsed + delta, TICK_MS * MAX_TICKS_PER_FRAME);
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
    this.player.setPosition(x * TILE, y * TILE);

    const r = MOVEMENT.playerRadius * TILE;
    this.facingDot.setPosition(p.facing.x * r * 0.6, p.facing.y * r * 0.6);
    // A gentle bob while walking, so movement feels alive.
    const bob = p.moving ? 1 + Math.sin(now / 70) * 0.05 : 1;
    this.body.setScale(bob, 2 - bob);
    this.body.setFillStyle(now < this.playerFlashUntil ? 0xff6b5b : COLORS.gi);
    this.player.setAlpha(p.downTicks > 0 ? 0.4 : 1);

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

  private drawEnemy(e: EnemyState, blend: number, now: number): void {
    const v = this.enemyViews.get(e.id);
    if (!v) return;
    v.container.setVisible(e.mode !== 'defeated');
    if (e.mode === 'defeated') return;

    const x = Phaser.Math.Linear(v.prev.x, e.pos.x, blend);
    const y = Phaser.Math.Linear(v.prev.y, e.pos.y, blend);
    v.container.setPosition(x * TILE, y * TILE);
    const r = e.def.radius * TILE;
    v.eye.setPosition(e.facing.x * r * 0.55, e.facing.y * r * 0.55);
    v.hpFill.width = (v.hpBack.width - 4) * (e.health / e.def.maxHealth);

    let color = v.color;
    let scale = 1;
    let rotation = 0;
    let alpha = 1;

    if (e.mode === 'waiting') {
      alpha = 1 - (e.modeTicks / COMBAT.enemySpawnWaitTicks) * 0.8;
    } else if (e.mode === 'windup' && e.attackCenter) {
      // The telegraph: the brute swells and turns red, and the danger area fills up to
      // "nearly full". It then holds nearly full (creeping to the edge) while the Perfect
      // Counter window is open, with a brighter ring. At the edge, the attack lands.
      const window = counterWindowTicks(this.world, this.world.players[this.me]);
      const fillTicks = Math.max(1, e.windupTotal - window);
      const elapsed = Math.min(e.windupTotal, e.windupTotal - e.modeTicks + blend);
      const inWindow = elapsed >= fillTicks;
      const progress = inWindow
        ? TELEGRAPH_NEARLY_FULL + (1 - TELEGRAPH_NEARLY_FULL) * ((elapsed - fillTicks) / window)
        : TELEGRAPH_NEARLY_FULL * (elapsed / fillTicks);
      const pulse = Math.sin(now / 45) > 0 ? 1 : 0.75;
      color = blendColor(v.color, COLORS.bruteAngry, progress * pulse);
      scale = 1 + progress * 0.18;
      const cx = e.attackCenter.x * TILE;
      const cy = e.attackCenter.y * TILE;
      const area = currentAttack(e).areaRadius * TILE;
      this.danger.fillStyle(COLORS.danger, 0.16).fillCircle(cx, cy, area);
      this.danger.lineStyle(inWindow ? 6 : 3, inWindow ? 0xff8a80 : COLORS.danger, inWindow ? 1 : 0.9).strokeCircle(cx, cy, area);
      this.danger.fillStyle(COLORS.danger, inWindow ? 0.5 : 0.4).fillCircle(cx, cy, area * progress);
    } else if (e.mode === 'stagger') {
      rotation = Math.sin(now / 60) * 0.18;
    } else if (e.mode === 'winded') {
      // Out of breath: pale, slumped, and breathing hard.
      color = blendColor(v.color, 0xd8d0c4, 0.45);
      scale = 1 + Math.sin(now / 110) * 0.06;
    }

    // Shield guards hold a shield in front of them while it's up.
    v.shieldGfx.clear();
    if (e.shieldUp) {
      const angle = Math.atan2(e.facing.y, e.facing.x);
      v.shieldGfx.lineStyle(7, 0xc9d6e8, 1);
      v.shieldGfx.beginPath();
      v.shieldGfx.arc(0, 0, r * 1.25, angle - 0.9, angle + 0.9);
      v.shieldGfx.strokePath();
    }

    if (now < v.flashUntil) color = 0xffffff;
    v.body.setFillStyle(color);
    v.body.setScale(scale);
    v.body.setRotation(rotation);
    v.container.setAlpha(alpha);

    // Dizzy stars circling a staggered enemy; sweat drops on a winded one.
    const dizzy = e.mode === 'stagger';
    const winded = e.mode === 'winded';
    v.stars.forEach((s, i) => {
      s.setVisible(dizzy || winded);
      if (dizzy) {
        const a = now / 180 + (i * Math.PI * 2) / v.stars.length;
        s.setFillStyle(COLORS.gold).setScale(1).setPosition(Math.cos(a) * r * 0.8, -r * 1.25 + Math.sin(a) * r * 0.25);
      } else if (winded) {
        const fall = ((now / 600 + i / v.stars.length) % 1) * r * 0.9;
        s.setFillStyle(0x9ad1ff).setScale(1.5).setPosition((i - 1) * r * 0.7, -r * 0.9 + fall);
      }
    });
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
    const ready = p.focus >= COMBAT.strike.focusCost;
    if (w * focus >= 6) g.fillStyle(ready ? COLORS.gold : COLORS.focus).fillRoundedRect(x, 40, w * focus, 8, 3);
    const mark = x + (w * COMBAT.strike.focusCost) / COMBAT.focus.max;
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

  private drawRoom(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    for (let row = 0; row < this.room.height; row++) {
      for (let col = 0; col < this.room.width; col++) {
        const x = col * TILE;
        const y = row * TILE;
        if (this.room.walls[row][col]) {
          g.fillStyle(COLORS.wall).fillRect(x, y, TILE, TILE);
          g.fillStyle(COLORS.wallTop).fillRect(x, y, TILE, TILE * 0.25);
          if (this.room.doors.some((d) => Math.floor(d.x) === col && Math.floor(d.y) === row)) {
            // A sealed door slot (unused slots stay sealed).
            g.fillStyle(0x3b2f27).fillRect(x + 4, y + 4, TILE - 8, TILE - 4);
          }
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
    this.shield = this.add.graphics();
    return this.add.container(0, 0, [this.shield, this.body, belt, this.facingDot]);
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
    const body = this.add.circle(0, 0, r, color).setStrokeStyle(4, COLORS.outline);
    const eye = this.add.circle(0, 0, r * 0.22, 0xffe0a0).setStrokeStyle(2, COLORS.outline);
    const hpBack = this.add.rectangle(0, -r - 12, r * 2, 8, 0x000000, 0.6);
    const hpFill = this.add.rectangle(-r + 2, -r - 12, r * 2 - 4, 4, COLORS.healthLow).setOrigin(0, 0.5);
    const stars = [0, 1, 2].map(() => this.add.circle(0, 0, 4, COLORS.gold).setVisible(false));
    const shieldGfx = this.add.graphics();
    const container = this.add.container(e.pos.x * TILE, e.pos.y * TILE, [shieldGfx, body, eye, hpBack, hpFill, ...stars]).setDepth(4);
    this.uiCamera.ignore(container);
    this.enemyViews.set(e.id, { container, body, eye, hpBack, hpFill, stars, shieldGfx, color, prev: { ...e.pos }, flashUntil: 0 });
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
          const heavy = ev.move !== 'basic';
          this.sparks(e.pos, heavy ? 12 : 5, heavy ? COLORS.gold : 0xffffff);
          this.floatText(e.pos, `${ev.damage}`, heavy ? '#ffd166' : '#ffffff', heavy ? 30 : 22);
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
            this.sparks(e.pos, 24, v.color);
            this.ring(e.pos, 0xffffff, 1.6);
          }
          break;
        }
        case 'perfectCounter': {
          const p = this.world.players[ev.playerId];
          sfx.perfect();
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
          this.impact(FEEL.hurt);
          this.playerFlashUntil = this.time.now + 160;
          this.flashScreen(0xff2a1a, 0.3, 200);
          this.floatText(p.pos, `-${ev.damage}`, '#ff6b5b', 26);
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
          break;
        case 'dash': {
          const p = this.world.players[ev.playerId];
          sfx.dash();
          this.dashTrail(p.pos);
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
        case 'chestOpened':
          sfx.chest();
          if (this.room.chest) {
            this.ring(this.room.chest, COLORS.gold, 1.8);
            this.sparks(this.room.chest, 18, COLORS.gold);
          }
          break;
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
          this.showLoot(ev.item.name, ev.item.rarity, ev.at);
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

  private openInsights(ids: string[]): void {
    const defs = ids.map((id) => CONTENT.insights.find((i) => i.id === id)!).filter(Boolean);
    this.picker = new InsightPicker(this, defs, (id) => {
      if (!this.run) return;
      chooseInsight(this.run, id);
      const stats = playerStats(loadSave());
      setPlayerMods(this.world.players[this.me], modsFrom(runEffects(CONTENT, this.run, stats.effects), TICKS_PER_SECOND));
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
    finishRun(profile, summarizeRun(this.run));
    writeSave(profile);
    this.leaving = true;
    const delay = status === 'lost' ? 1600 : 200;
    if (status === 'cleared') {
      sfx.floorClear();
      this.message.setText('Floor cleared!').setVisible(true);
    }
    this.time.delayedCall(delay, () => {
      this.cameras.main.fadeOut(600, 10, 8, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Home'));
    });
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
        const gfx = this.add.graphics().setDepth(1);
        const look = DOOR_LOOK[kind];
        const label = this.add
          .text(at.x * TILE, (at.y + 0.95) * TILE, look.label, { fontFamily: FONT, fontStyle: 'bold', fontSize: '13px', color: css(look.color), stroke: '#14121c', strokeThickness: 4 })
          .setOrigin(0.5, 0)
          .setResolution(crisp())
          .setDepth(6);
        this.doorViews.push({ kind, gfx, label, at });
        objs.push(gfx, label);
      });
    }
    this.chestGfx = this.room.chest ? this.add.graphics().setDepth(2) : null;
    this.shrineGfx = this.room.shrine ? this.add.graphics().setDepth(2) : null;
    if (this.chestGfx) objs.push(this.chestGfx);
    if (this.shrineGfx) objs.push(this.shrineGfx);
    return objs;
  }

  /** Doors, the chest, the shrine, and the run's labels, timer and boss bar. */
  private drawRunHud(now: number): void {
    if (!this.run) return;
    const prog = this.world.progress;
    const pulse = 0.75 + Math.sin(now / 200) * 0.25;

    for (const d of this.doorViews) {
      const look = DOOR_LOOK[d.kind];
      const x = (d.at.x - 0.5) * TILE;
      const y = (d.at.y - 0.5) * TILE;
      d.gfx.clear();
      if (prog.doorsOpen) {
        d.gfx.fillStyle(0x0a0810).fillRect(x + 4, y + 4, TILE - 8, TILE - 4);
        d.gfx.lineStyle(4, look.color, pulse).strokeRect(x + 3, y + 3, TILE - 6, TILE - 3);
      } else {
        d.gfx.fillStyle(0x3b2f27).fillRect(x + 4, y + 4, TILE - 8, TILE - 4);
        d.gfx.lineStyle(2, look.color, 0.35).strokeRect(x + 4, y + 4, TILE - 8, TILE - 4);
      }
      d.label.setAlpha(prog.doorsOpen ? 1 : 0.55);
    }

    if (this.chestGfx && this.room.chest) {
      const g = this.chestGfx;
      g.clear();
      if (prog.cleared) {
        const cx = this.room.chest.x * TILE;
        const cy = this.room.chest.y * TILE;
        const w = TILE * 0.8;
        const h = TILE * 0.55;
        if (!prog.chestOpened) {
          g.fillStyle(COLORS.gold, 0.25 * pulse).fillCircle(cx, cy, TILE * 0.75);
        }
        g.fillStyle(0x7a4a24).fillRect(cx - w / 2, cy - h / 2, w, h);
        g.lineStyle(3, COLORS.outline).strokeRect(cx - w / 2, cy - h / 2, w, h);
        g.fillStyle(COLORS.gold).fillRect(cx - w / 2, cy - 3, w, 6);
        if (prog.chestOpened) g.fillStyle(0x14121c).fillRect(cx - w / 2 + 4, cy - h / 2 + 2, w - 8, h * 0.35);
      }
    }

    if (this.shrineGfx && this.room.shrine) {
      const g = this.shrineGfx;
      const cx = this.room.shrine.x * TILE;
      const cy = this.room.shrine.y * TILE;
      g.clear();
      if (!prog.shrineUsed) g.fillStyle(COLORS.health, 0.22 * pulse).fillCircle(cx, cy, TILE * 0.8);
      g.fillStyle(0x8a8f99).fillRect(cx - 12, cy - 6, 24, 22);
      g.fillStyle(0x6b707a).fillRect(cx - 18, cy - 14, 36, 8);
      g.fillStyle(prog.shrineUsed ? 0x445544 : 0xb6ffb6).fillCircle(cx, cy + 4, 6);
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

/** Mixes two colors: t = 0 gives `a`, t = 1 gives `b`. */
function blendColor(a: number, b: number, t: number): number {
  const mix = (shift: number) => Math.round(((a >> shift) & 0xff) * (1 - t) + ((b >> shift) & 0xff) * t);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}

/**
 * For testing only, until the difficulty choice arrives in milestone 7:
 * adding ?difficulty=guided (or challenge) to the link picks that difficulty.
 */
function testDifficulty(): Difficulty | undefined {
  const asked = new URLSearchParams(window.location.search).get('difficulty');
  return asked && asked in DIFFICULTY ? (asked as Difficulty) : undefined;
}
