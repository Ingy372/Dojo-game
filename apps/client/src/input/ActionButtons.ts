import Phaser from 'phaser';
import { COMBAT, activeForm, strikeCost, type PlayerAction, type PlayerState } from '@dojo/sim';

const COUNTER_RADIUS = 48;
const STRIKE_RADIUS = 38;
const DASH_RADIUS = 32;
const VIRTUE_RADIUS = 30;
const FORM_RADIUS = 26;
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
 * stripe is earned) and Form (once a kata is signed off). A button acts the moment a
 * finger touches it (not on release), so Counter timing is exact.
 */
export class ActionButtons {
  private pending: PlayerAction | null = null;
  private readonly counter: Button;
  private readonly strike: Button;
  private readonly dash: Button;
  /** Ring around Dash showing it recharging. */
  private readonly dashRing: Phaser.GameObjects.Graphics;
  /** Ring around Strike showing Focus filling toward the Strike cost. */
  private readonly strikeRing: Phaser.GameObjects.Graphics;
  private readonly virtue: Button | null = null;
  /** Ring around Virtue showing Focus filling toward full. */
  private readonly virtueRing: Phaser.GameObjects.Graphics | null = null;
  private readonly form: Button | null = null;
  /** The active Form's name, under the Form button. */
  private readonly formName: Phaser.GameObjects.Text | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    /** Called on every button touch (used to switch on sound). */
    private readonly onTouch: () => void,
    has: { forms: boolean; virtue: boolean } = { forms: false, virtue: false },
  ) {
    this.counter = this.makeButton('counter', 'COUNTER', COUNTER_RADIUS, 0x3a7bd5);
    this.strike = this.makeButton('strike', 'STRIKE', STRIKE_RADIUS, 0xd5713a);
    this.strikeRing = scene.add.graphics();
    this.strike.container.add(this.strikeRing);
    this.dash = this.makeButton('dash', 'DASH', DASH_RADIUS, 0x3aa57a);
    this.dashRing = scene.add.graphics();
    this.dash.container.add(this.dashRing);
    if (has.virtue) {
      this.virtue = this.makeButton('virtue', 'VIRTUE', VIRTUE_RADIUS, 0xb08a3c);
      this.virtueRing = scene.add.graphics();
      this.virtue.container.add(this.virtueRing);
    }
    if (has.forms) {
      this.form = this.makeButton('form', 'FORM', FORM_RADIUS, 0x3a5a8a);
      this.formName = scene.add
        .text(0, FORM_RADIUS + 10, '', { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#9ad1ff', stroke: '#14121c', strokeThickness: 3 })
        .setOrigin(0.5, 0)
        .setResolution(window.devicePixelRatio || 1);
      this.form.container.add(this.formName);
    }
    this.layout();
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
  }

  get objects(): Phaser.GameObjects.GameObject[] {
    return this.all().map((b) => b.container);
  }

  /** True if a screen point is on a button (so it isn't treated as tap-to-move or the stick). */
  contains(x: number, y: number): boolean {
    return this.all().some((b) => this.hit(b, x, y));
  }

  layout(): void {
    const { width, height } = this.scene.scale.gameSize;
    const cx = width - COUNTER_RADIUS - MARGIN;
    const cy = height - COUNTER_RADIUS - MARGIN;
    this.counter.container.setPosition(cx, cy);
    this.strike.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS - 22, cy - 34);
    this.dash.container.setPosition(cx + 6, cy - COUNTER_RADIUS - DASH_RADIUS - 24);
    this.virtue?.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS - 30, cy - 34 - STRIKE_RADIUS - VIRTUE_RADIUS - 18);
    this.form?.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS * 2 - FORM_RADIUS - 46, cy - 6);
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

  /** Shows whether each button is ready, from the player's current state. */
  update(p: PlayerState): void {
    const alive = p.downTicks === 0;
    const counterReady = alive && p.guardTicks === 0 && p.counterLockout === 0;
    this.counter.container.setAlpha(counterReady ? 1 : 0.45);

    const cost = strikeCost(p);
    const strikeReady = alive && p.focus >= cost;
    this.strike.container.setAlpha(strikeReady ? 1 : 0.55);
    this.strike.face.setFillStyle(strikeReady ? 0xd5713a : 0x5a4a44, 0.9);
    const fill = Math.min(1, p.focus / cost);
    this.strikeRing.clear();
    this.strikeRing.lineStyle(5, strikeReady ? 0xffd166 : 0x9ad1ff, strikeReady ? 1 : 0.8);
    this.strikeRing.beginPath();
    this.strikeRing.arc(0, 0, STRIKE_RADIUS + 5, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2);
    this.strikeRing.strokePath();

    const dashReady = alive && p.dashCooldown === 0 && p.guardTicks === 0;
    this.dash.container.setAlpha(dashReady ? 1 : 0.5);
    this.dashRing.clear();
    if (p.dashCooldown > 0) {
      const done = 1 - p.dashCooldown / COMBAT.dash.cooldownTicks;
      this.dashRing.lineStyle(4, 0x9ad1ff, 0.8);
      this.dashRing.beginPath();
      this.dashRing.arc(0, 0, DASH_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2);
      this.dashRing.strokePath();
    }
    if (strikeReady) this.strike.container.setScale(1 + Math.sin(this.scene.time.now / 160) * 0.04);
    else this.strike.container.setScale(1);

    if (this.virtue && this.virtueRing) {
      const full = alive && p.focus >= COMBAT.focus.max && p.virtueTicks === 0;
      this.virtue.container.setAlpha(full ? 1 : 0.5);
      this.virtue.face.setFillStyle(full ? 0xffb02e : 0x5a4a34, 0.9);
      this.virtueRing.clear();
      this.virtueRing.lineStyle(4, full ? 0xffffff : 0xffd166, 0.85);
      this.virtueRing.beginPath();
      this.virtueRing.arc(0, 0, VIRTUE_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + Math.min(1, p.focus / COMBAT.focus.max) * Math.PI * 2);
      this.virtueRing.strokePath();
      this.virtue.container.setScale(full ? 1 + Math.sin(this.scene.time.now / 120) * 0.07 : 1);
    }
    if (this.form && this.formName) {
      this.form.container.setAlpha(alive && p.formCooldown === 0 ? 1 : 0.6);
      this.formName.setText(activeForm(p).name);
    }
  }

  /** A little shake when a press is refused (for example, not enough Focus). */
  refuse(action: PlayerAction): void {
    const b = this.all().find((x) => x.action === action) ?? this.counter;
    const x = b.container.x;
    this.scene.tweens.add({ targets: b.container, x: x + 6, duration: 40, yoyo: true, repeat: 2, onComplete: () => this.layout() });
  }

  private makeButton(action: Button['action'], text: string, radius: number, color: number): Button {
    const face = this.scene.add.circle(0, 0, radius, color, 0.9).setStrokeStyle(4, 0xffffff, 0.8);
    const label = this.scene.add
      .text(0, 0, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: `${Math.round(radius * 0.36)}px`, color: '#ffffff' })
      .setOrigin(0.5)
      .setResolution(window.devicePixelRatio || 1);
    const container = this.scene.add.container(0, 0, [face, label]);
    return { action, radius, container, face, label };
  }

  private all(): Button[] {
    return [this.counter, this.strike, this.dash, this.virtue, this.form].filter((b): b is Button => b !== null);
  }

  private hit(b: Button, x: number, y: number): boolean {
    // A little larger than drawn, so small fingers don't miss.
    return Phaser.Math.Distance.Between(x, y, b.container.x, b.container.y) <= b.radius + 12;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    for (const b of this.all()) {
      if (this.hit(b, pointer.x, pointer.y)) {
        this.onTouch();
        this.pending = b.action;
        this.scene.tweens.add({ targets: b.face, scale: 0.88, duration: 50, yoyo: true });
        return;
      }
    }
  }
}
