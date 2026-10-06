import Phaser from 'phaser';
import {
  COMBAT,
  MOVEMENT,
  TICKS_PER_SECOND,
  TELEGRAPH_NEARLY_FULL,
  counterWindowTicks,
  createWorld,
  loadEnemy,
  loadRoom,
  stepWorld,
  DIFFICULTY,
  type CombatEvent,
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
  basic: { stopMs: 45, shakeMs: 70, shake: 0.0025 },
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

interface EnemyView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Arc;
  eye: Phaser.GameObjects.Arc;
  hpFill: Phaser.GameObjects.Rectangle;
  hpBack: Phaser.GameObjects.Rectangle;
  stars: Phaser.GameObjects.Arc[];
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

  create(): void {
    this.room = loadRoom(trainingRoom);
    this.world = createWorld(this.room, [this.me], { enemyTypes: { brute: loadEnemy(bruteData) }, difficulty: testDifficulty() });
    this.prevPos = { ...this.world.players[this.me].pos };
    this.elapsed = 0;
    this.hitStopMs = 0;
    this.enemyViews.clear();
    this.shownCombo = 0;

    const roomGfx = this.drawRoom();
    this.danger = this.add.graphics().setDepth(1);
    this.marker = this.add.circle(0, 0, TILE * 0.22).setStrokeStyle(3, COLORS.marker, 0.9).setVisible(false).setDepth(2);
    this.player = this.makePlayer().setDepth(5);

    // Two cameras: one follows the character through the room, one holds the on-screen controls.
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.room.width * TILE, this.room.height * TILE);
    cam.startFollow(this.player, true);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.ignore([roomGfx, this.danger, this.marker, this.player]);

    for (const e of this.world.enemies) this.makeEnemy(e);

    this.buttons = new ActionButtons(this, () => sfx.unlock());
    this.controls = new TouchControls(
      this,
      cam,
      (x, y) => ({ x: x / TILE, y: y / TILE }),
      (x, y) => this.buttons.contains(x, y),
    );
    this.makeHud();
    cam.ignore([...this.controls.objects, ...this.buttons.objects]);

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
    if (this.hitStopMs > 0) {
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
        if (this.hitStopMs > 0) break;
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
    for (const e of this.world.enemies) this.drawEnemy(e, blend, now);

    this.buttons.update(p);
    this.drawHud();
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

    let color = COLORS.brute;
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
      color = blendColor(COLORS.brute, COLORS.bruteAngry, progress * pulse);
      scale = 1 + progress * 0.18;
      const cx = e.attackCenter.x * TILE;
      const cy = e.attackCenter.y * TILE;
      const area = e.def.attack.areaRadius * TILE;
      this.danger.fillStyle(COLORS.danger, 0.16).fillCircle(cx, cy, area);
      this.danger.lineStyle(inWindow ? 6 : 3, inWindow ? 0xff8a80 : COLORS.danger, inWindow ? 1 : 0.9).strokeCircle(cx, cy, area);
      this.danger.fillStyle(COLORS.danger, inWindow ? 0.5 : 0.4).fillCircle(cx, cy, area * progress);
    } else if (e.mode === 'stagger') {
      rotation = Math.sin(now / 60) * 0.18;
    }

    if (now < v.flashUntil) color = 0xffffff;
    v.body.setFillStyle(color);
    v.body.setScale(scale);
    v.body.setRotation(rotation);
    v.container.setAlpha(alpha);

    // Dizzy stars circling a staggered brute.
    const dizzy = e.mode === 'stagger';
    v.stars.forEach((s, i) => {
      s.setVisible(dizzy);
      if (!dizzy) return;
      const a = now / 180 + (i * Math.PI * 2) / v.stars.length;
      s.setPosition(Math.cos(a) * r * 0.8, -r * 1.25 + Math.sin(a) * r * 0.25);
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

  private makeEnemy(e: EnemyState): void {
    const r = e.def.radius * TILE;
    const body = this.add.circle(0, 0, r, COLORS.brute).setStrokeStyle(4, COLORS.outline);
    const eye = this.add.circle(0, 0, r * 0.22, 0xffe0a0).setStrokeStyle(2, COLORS.outline);
    const hpBack = this.add.rectangle(0, -r - 12, r * 2, 8, 0x000000, 0.6);
    const hpFill = this.add.rectangle(-r + 2, -r - 12, r * 2 - 4, 4, COLORS.healthLow).setOrigin(0, 0.5);
    const stars = [0, 1, 2].map(() => this.add.circle(0, 0, 4, COLORS.gold).setVisible(false));
    const container = this.add.container(e.pos.x * TILE, e.pos.y * TILE, [body, eye, hpBack, hpFill, ...stars]).setDepth(4);
    this.uiCamera.ignore(container);
    this.enemyViews.set(e.id, { container, body, eye, hpBack, hpFill, stars, prev: { ...e.pos }, flashUntil: 0 });
  }

  private makeHud(): void {
    const crisp = window.devicePixelRatio || 1;
    this.hud = this.add.graphics();
    this.comboText = this.add
      .text(0, 14, '', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '26px', color: '#ffd166', stroke: '#14121c', strokeThickness: 5 })
      .setOrigin(0.5, 0)
      .setResolution(crisp)
      .setVisible(false);
    this.comboBonusText = this.add
      .text(0, 46, '', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 4 })
      .setOrigin(0.5, 0)
      .setResolution(crisp)
      .setVisible(false);
    this.message = this.add
      .text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '28px', color: '#f2e9d8', stroke: '#14121c', strokeThickness: 6, align: 'center' })
      .setOrigin(0.5)
      .setResolution(crisp)
      .setVisible(false);
    this.screenFlash = this.add.rectangle(0, 0, 10, 10, 0xffffff).setOrigin(0).setAlpha(0);
    this.cameras.main.ignore([this.hud, this.comboText, this.comboBonusText, this.message, this.screenFlash]);
  }

  private layout(size: Phaser.Structs.Size): void {
    const { width, height } = size;
    const cam = this.cameras.main;
    cam.setSize(width, height);
    cam.setZoom(height / (VISIBLE_ROWS * TILE));
    this.uiCamera.setSize(width, height);
    this.controls.layout();
    this.buttons.layout();
    this.comboText.setX(width / 2);
    this.comboBonusText.setX(width / 2);
    this.message.setPosition(width / 2, height * 0.4);
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
          }
          if (ev.defeated) {
            sfx.enemyDown();
            this.impact(FEEL.enemyDown);
            this.sparks(e.pos, 24, COLORS.brute);
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
          if (e?.attackCenter) this.ring(e.attackCenter, 0xffffff, e.def.attack.areaRadius, 0.6);
          break;
        }
        case 'counterPressed':
          sfx.guard();
          break;
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
          this.message.setText('Ouch!\nBack to the start.').setVisible(true);
          break;
        case 'playerReturn':
          this.cameras.main.resetFX();
          this.cameras.main.fadeIn(400, 10, 8, 16);
          this.message.setVisible(false);
          break;
        case 'enemySpawn': {
          const e = this.enemy(ev.enemyId);
          if (e) {
            sfx.appear();
            this.ring(e.pos, COLORS.brute, 1.2);
          }
          break;
        }
      }
    }
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
