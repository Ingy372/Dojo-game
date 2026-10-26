import { reducedMotion } from '../game/motion';
import Phaser from 'phaser';
import { COMBAT, activeStance, strikeCost, type PlayerAction, type PlayerState } from '@dojo/sim';
import { view, DPR } from '../ui/theme';
import { ACTION_COLORS as AC, ACTION_LABEL, GREEN } from '../ui/tokens';

/** Q-PREM-COLOR: button faces are solid so white labels keep their contrast over any floor (were 0.9, letting the floor tint through). */
const FACE_ALPHA = 1;

const COUNTER_RADIUS = 48;
const STRIKE_RADIUS = 38;
const DASH_RADIUS = 32;
const VIRTUE_RADIUS = 30;
const STANCE_RADIUS = 26;
const MARGIN = 26;

interface Button {
  action: PlayerAction;
  radius: number;
  container: Phaser.GameObjects.Container;
  face: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
}

/**
 * The Strike, Counter and Dash buttons in the bottom-right corner, plus Virtue (once a
 * stripe is earned) and Stance (once a kata is signed off). A button acts the moment a
 * finger touches it (not on release), so Counter timing is exact.
 */
export class ActionButtons {
  private pending: PlayerAction | null = null;
  private off = false;
  /** Sensei's guide: 0 none, 1 small, 2 big, 3 stronger nudge pulse on Counter. */
  private counterPulse = 0;
  private readonly counter: Button;
  private readonly strike: Button;
  private readonly dash: Button;
  /** Ring around Dash showing it recharging. */
  private readonly dashRing: Phaser.GameObjects.Graphics;
  /** Ring around Counter showing a missed Counter's lockout refilling. */
  private readonly counterRing: Phaser.GameObjects.Graphics;
  /** Ring around Strike showing Focus filling toward the Strike cost. */
  private readonly strikeRing: Phaser.GameObjects.Graphics;
  private readonly virtue: Button | null = null;
  /** Ring around Virtue showing Focus filling toward full. */
  private readonly virtueRing: Phaser.GameObjects.Graphics | null = null;
  private readonly stance: Button | null = null;
  /** The active Stance's name, under the Stance button. */
  private readonly stanceName: Phaser.GameObjects.Text | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    /** Called on every button touch (used to switch on sound). */
    private readonly onTouch: () => void,
    has: { stances: boolean; virtue: boolean } = { stances: false, virtue: false },
  ) {
    this.counter = this.makeButton('counter', 'COUNTER', COUNTER_RADIUS, AC.counter.ready);
    this.counterRing = scene.add.graphics();
    this.counter.container.add(this.counterRing);
    this.strike = this.makeButton('strike', 'STRIKE', STRIKE_RADIUS, AC.strike.ready);
    this.strikeRing = scene.add.graphics();
    this.strike.container.add(this.strikeRing);
    this.dash = this.makeButton('dash', 'DASH', DASH_RADIUS, GREEN);
    this.dashRing = scene.add.graphics();
    this.dash.container.add(this.dashRing);
    if (has.virtue) {
      this.virtue = this.makeButton('virtue', 'VIRTUE', VIRTUE_RADIUS, AC.virtue.ready);
      this.virtueRing = scene.add.graphics();
      this.virtue.container.add(this.virtueRing);
    }
    if (has.stances) {
      this.stance = this.makeButton('stance', 'STANCE', STANCE_RADIUS, AC.stance.ready);
      this.stanceName = scene.add
        .text(0, STANCE_RADIUS + 10, '', { fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#9ad1ff', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5, 0)
        .setResolution(window.devicePixelRatio || 1);
      this.stance.container.add(this.stanceName);
    }
    this.layout();
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
  }

  get objects(): Phaser.GameObjects.GameObject[] {
    return this.all().map((b) => b.container);
  }

  /** True if a screen point is on a button (so it isn't treated as tap-to-move or the stick). */
  contains(x: number, y: number): boolean {
    if (this.off) return false;
    return this.all().some((b) => this.hit(b, x, y));
  }

  layout(): void {
    const { width, height } = view(this.scene);
    const cx = width - COUNTER_RADIUS - MARGIN;
    const cy = height - COUNTER_RADIUS - MARGIN;
    this.counter.container.setPosition(cx, cy);
    this.strike.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS - 22, cy - 34);
    this.dash.container.setPosition(cx + 6, cy - COUNTER_RADIUS - DASH_RADIUS - 24);
    this.virtue?.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS - 30, cy - 34 - STRIKE_RADIUS - VIRTUE_RADIUS - 18);
    this.stance?.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS * 2 - STANCE_RADIUS - 46, cy - 6);
  }

  /** The button pressed since the last tick, if any (sent once). */
  takeAction(): PlayerAction | undefined {
    const a = this.pending;
    this.pending = null;
    return a ?? undefined;
  }

  reset(): void {
    this.pending = null;
  }

  /** Hides the buttons and ignores presses on them (Q-PREM-F4: once the hero is down). */
  disable(): void {
    this.off = true;
    this.pending = null;
    for (const b of this.all()) b.container.setVisible(false);
  }

  /** Makes Counter pulse for Sensei's guide (0 none, 1 small, 2 big, 3 nudge). */
  pulseCounter(level: number): void {
    this.counterPulse = level;
  }

  /** Makes Dash pulse for the tutorial's Dash tip (K24a). */
  pulseDash(on: boolean): void {
    this.dashPulse = on;
  }
  private dashPulse = false;

  /** K24b: COUNTER flashes while an attack on the player is in its Counter window (steady glow with Reduced motion). */
  counterWindow(open: boolean): void {
    this.windowOpen = open;
  }
  private windowOpen = false;

  /** The gold ring shows only while COUNTER is ready, so it never looks dimmed while gold (K27, Q5 B5). */
  private styleCounter(ready: boolean): void {
    const open = this.windowOpen && ready;
    const flash = open && (reducedMotion() || Math.sin(this.scene.time.now / 70) > 0);
    this.counter.face.setStrokeStyle(open ? 7 : 4, open ? 0xffd166 : 0xffffff, ready ? (open ? 1 : 0.8) : 0.35);
    this.counter.face.setFillStyle(flash ? AC.counter.flash : ready ? AC.counter.ready : AC.counter.dim, FACE_ALPHA);
    labelColor(this.counter, flash ? ACTION_LABEL.dark : ready ? ACTION_LABEL.light : ACTION_LABEL.dim);
  }

  /** Shows whether each button is ready, from the player's current state. */
  update(p: PlayerState): void {
    const alive = p.downTicks === 0;
    const counterReady = alive && p.guardTicks === 0 && p.counterLockout === 0;
    // Q-PREM-F9: not ready is a solid dim face + soft label (was alpha 0.45 over the floor).
    this.counter.container.setAlpha(1);
    this.styleCounter(counterReady);
    // Q-PREM-F9: a missed Counter's lockout shows a refill ring, so the dim face reads as "wait".
    this.counterRing.clear();
    if (alive && p.counterLockout > 0) {
      const done = 1 - p.counterLockout / COMBAT.counter.missLockoutTicks;
      this.counterRing.lineStyle(4, 0x9ad1ff, 0.8);
      this.counterRing.beginPath();
      this.counterRing.arc(0, 0, COUNTER_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2);
      this.counterRing.strokePath();
    }
    const pulse = this.counterPulse === 3 ? 0.24 : this.counterPulse === 2 ? 0.14 : this.counterPulse === 1 ? 0.06 : 0;
    this.counter.container.setScale(1 + Math.abs(Math.sin(this.scene.time.now / 140)) * pulse);

    const cost = strikeCost(p);
    const strikeReady = alive && p.focus >= cost;
    this.strike.container.setAlpha(1);
    this.strike.face.setFillStyle(strikeReady ? AC.strike.ready : AC.strike.dim, FACE_ALPHA);
    this.strike.face.setStrokeStyle(4, 0xffffff, strikeReady ? 0.8 : 0.35);
    labelColor(this.strike, strikeReady ? ACTION_LABEL.light : ACTION_LABEL.dim);
    const fill = Math.min(1, p.focus / cost);
    this.strikeRing.clear();
    this.strikeRing.lineStyle(5, strikeReady ? 0xffd166 : 0x9ad1ff, strikeReady ? 1 : 0.8);
    this.strikeRing.beginPath();
    this.strikeRing.arc(0, 0, STRIKE_RADIUS + 5, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2);
    this.strikeRing.strokePath();

    const dashReady = alive && p.dashCooldown === 0 && p.guardTicks === 0;
    // Q-PREM-F9: same solid dim treatment as COUNTER/STRIKE/VIRTUE (was alpha 0.5).
    this.dash.container.setAlpha(1);
    this.dash.face.setFillStyle(dashReady ? AC.dash.ready : AC.dash.dim, FACE_ALPHA);
    this.dash.face.setStrokeStyle(4, 0xffffff, dashReady ? 0.8 : 0.35);
    labelColor(this.dash, dashReady ? ACTION_LABEL.light : ACTION_LABEL.dim);
    this.dashRing.clear();
    if (p.dashCooldown > 0) {
      const done = 1 - p.dashCooldown / COMBAT.dash.cooldownTicks;
      this.dashRing.lineStyle(4, 0x9ad1ff, 0.8);
      this.dashRing.beginPath();
      this.dashRing.arc(0, 0, DASH_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2);
      this.dashRing.strokePath();
    }
    this.dash.container.setScale(this.dashPulse ? 1 + Math.abs(Math.sin(this.scene.time.now / 140)) * 0.14 : 1);
    if (strikeReady) this.strike.container.setScale(1 + Math.sin(this.scene.time.now / 160) * 0.04);
    else this.strike.container.setScale(1);

    if (this.virtue && this.virtueRing) {
      const full = alive && p.focus >= COMBAT.focus.max && p.virtueTicks === 0;
      this.virtue.container.setAlpha(1);
      this.virtue.face.setFillStyle(full ? AC.virtue.ready : AC.virtue.dim, FACE_ALPHA);
      this.virtue.face.setStrokeStyle(4, 0xffffff, full ? 0.8 : 0.35);
      labelColor(this.virtue, full ? ACTION_LABEL.dark : ACTION_LABEL.dim);
      this.virtueRing.clear();
      this.virtueRing.lineStyle(4, full ? 0xffffff : 0xffd166, 0.85);
      this.virtueRing.beginPath();
      this.virtueRing.arc(0, 0, VIRTUE_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + Math.min(1, p.focus / COMBAT.focus.max) * Math.PI * 2);
      this.virtueRing.strokePath();
      this.virtue.container.setScale(full ? 1 + Math.sin(this.scene.time.now / 120) * 0.07 : 1);
    }
    if (this.stance && this.stanceName) {
      const stanceReady = alive && p.stanceCooldown === 0;
      this.stance.container.setAlpha(1);
      this.stance.face.setFillStyle(stanceReady ? AC.stance.ready : AC.stance.dim, FACE_ALPHA);
      this.stance.face.setStrokeStyle(4, 0xffffff, stanceReady ? 0.8 : 0.35);
      labelColor(this.stance, stanceReady ? ACTION_LABEL.light : ACTION_LABEL.dim);
      this.stanceName.setText(activeStance(p).name);
    }
  }

  /** A little shake when a press is refused (for example, not enough Focus). */
  refuse(action: PlayerAction): void {
    const b = this.all().find((x) => x.action === action) ?? this.counter;
    const x = b.container.x;
    this.scene.tweens.add({ targets: b.container, x: x + 6, duration: 40, yoyo: true, repeat: 2, onComplete: () => this.layout() });
  }

  private makeButton(action: Button['action'], text: string, radius: number, color: number): Button {
    const face = this.scene.add.circle(0, 0, radius, color, FACE_ALPHA).setStrokeStyle(4, 0xffffff, 0.8);
    const label = this.scene.add
      .text(0, 0, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: `${Math.max(12, Math.round(radius * 0.36))}px`, color: '#ffffff' })
      .setOrigin(0.5)
      .setResolution(window.devicePixelRatio || 1);
    const container = this.scene.add.container(0, 0, [face, label]);
    return { action, radius, container, face, label };
  }

  private all(): Button[] {
    return [this.counter, this.strike, this.dash, this.virtue, this.stance].filter((b): b is Button => b !== null);
  }

  private hit(b: Button, x: number, y: number): boolean {
    // A little larger than drawn, so small fingers don't miss.
    return Phaser.Math.Distance.Between(x, y, b.container.x, b.container.y) <= b.radius + 12;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.off) return;
    for (const b of this.all()) {
      if (this.hit(b, (pointer.x / DPR), (pointer.y / DPR))) {
        this.onTouch();
        this.pending = b.action;
        this.scene.tweens.add({ targets: b.face, scale: 0.88, duration: 50, yoyo: true });
        return;
      }
    }
  }
}

/** Q-PREM-F9: change a label's colour only when it differs (setColor redraws the text). */
function labelColor(b: Button, color: string): void {
  if (b.label.style.color !== color) b.label.setColor(color);
}
