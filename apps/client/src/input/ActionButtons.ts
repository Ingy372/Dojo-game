import { reducedMotion } from '../game/motion';
import Phaser from 'phaser';
import { COMBAT, strikeCost, type PlayerAction, type PlayerState } from '@dojo/sim';
import { crisp, view, DPR } from '../ui/theme';
import { hasTouch } from './TouchControls';
import { ACTION_COLORS as AC, ACTION_LABEL, GREEN } from '../ui/tokens';

/** Q-PREM-COLOR: button faces are solid so white labels keep their contrast over any floor (were 0.9, letting the floor tint through). */
const FACE_ALPHA = 1;

const COUNTER_RADIUS = 48;
const STRIKE_RADIUS = 38;
const DASH_RADIUS = 32;
const VIRTUE_RADIUS = 30;
const KATA_RADIUS = 32;
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
 * stripe is earned), which shows only while Focus is full (L7). The Stance is picked before
 * the run, so there is no Stance button. A button acts the moment a finger touches it (not on
 * release), so Counter timing is exact.
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
  /** Tool Belt: the KATA button (once a kata is signed off), and its recharge ring. */
  private readonly kata: Button | null = null;
  private readonly kataRing: Phaser.GameObjects.Graphics | null = null;
  /** L7: Virtue is on screen (Focus full and not already active). */
  private virtueShown = false;

  constructor(
    private readonly scene: Phaser.Scene,
    /** Called on every button touch (used to switch on sound). */
    private readonly onTouch: () => void,
    has: { virtue: boolean; kata?: boolean } = { virtue: false },
    /** Called each time Virtue appears (Focus just became full). */
    private readonly onVirtueReady: () => void = () => {},
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
      this.virtue.face.setStrokeStyle(4, 0xffffff, 0.8);
      labelColor(this.virtue, ACTION_LABEL.dark);
      this.virtue.container.setVisible(false);
    }
    if (has.kata) {
      this.kata = this.makeButton('kata', 'KATA', KATA_RADIUS, AC.kata.ready);
      this.kataRing = scene.add.graphics();
      this.kata.container.add(this.kataRing);
    }
    this.layout();
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    // Nov 17 (desktop): keys for the buttons. Space or K = Counter, J = Strike, L or Shift = Dash, E = Virtue, I = Kata.
    const kb = scene.input.keyboard;
    if (kb) {
      const bind = (codes: string[], b: () => Button | null) =>
        codes.forEach((c) => kb.addKey(c, c === 'SPACE' || c === 'SHIFT').on('down', () => this.pressKey(b())));
      bind(['SPACE', 'K'], () => this.counter);
      bind(['J'], () => this.strike);
      bind(['L', 'SHIFT'], () => this.dash);
      bind(['E'], () => this.virtue);
      bind(['I'], () => this.kata);
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.removeAllKeys(false));
    }
    if (!hasTouch()) {
      // On a computer, each button shows its key underneath.
      const hint: [Button | null, string][] = [[this.counter, 'Space'], [this.strike, 'J'], [this.dash, 'L'], [this.virtue, 'E'], [this.kata, 'I']];
      for (const [b, k] of hint) {
        if (!b) continue;
        const t = scene.add
          .text(0, b.radius + 4, k, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: '11px', color: '#fff6e0', backgroundColor: 'rgba(20,18,28,0.7)', padding: { x: 4, y: 1 } })
          .setOrigin(0.5, 0)
          .setResolution(crisp());
        b.container.add(t);
      }
    }
  }

  /** A key press acts like touching the button (only while it's on screen and the buttons are on). */
  private pressKey(b: Button | null): void {
    if (this.off || !b || !b.container.visible) return;
    this.onTouch();
    this.pending = b.action;
    this.pressFx(b);
  }

  get objects(): Phaser.GameObjects.Container[] {
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
    // Tool Belt: KATA sits left of STRIKE, a little lower, in reach of the thumb.
    this.kata?.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS * 2 - KATA_RADIUS - 40, cy + 2);
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

  /** Shows the buttons again (B-MASHER-d1: the practice room goes on after a fall). */
  enable(): void {
    this.off = false;
    this.pending = null;
    this.virtueShown = false;
    for (const b of this.all()) b.container.setVisible(b !== this.virtue);
  }

  /** Makes Counter pulse for Sensei's guide (0 none, 1 small, 2 big, 3 nudge, 4 L-PREMIUM-b Counter tip: a pulse, or a still outline with Reduced motion). */
  pulseCounter(level: number): void {
    this.counterPulse = level;
  }

  counterPulseLevel(): number {
    return this.counterPulse;
  }

  /** Makes Dash pulse for the tutorial's Dash tip (K24a). */
  pulseDash(on: boolean): void {
    this.dashPulse = on;
  }
  private dashPulse = false;

  /** TUT-B3: makes STRIKE pulse for the tutorial's STRIKE tip. */
  pulseStrike(on: boolean): void {
    this.strikePulse = on;
  }
  private strikePulse = false;

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
    // L-PREMIUM-b: the Counter tip. Reduced motion: a still gold outline instead of the pulse.
    const tipStill = this.counterPulse === 4 && reducedMotion();
    if (tipStill) {
      this.counterRing.lineStyle(5, 0xffd166, 1);
      this.counterRing.strokeCircle(0, 0, COUNTER_RADIUS + 9);
    }
    const pulse = tipStill ? 0 : this.counterPulse === 4 ? 0.14 : this.counterPulse === 3 ? 0.24 : this.counterPulse === 2 ? 0.14 : this.counterPulse === 1 ? 0.06 : 0;
    this.counter.container.setScale(1 + Math.abs(Math.sin(this.scene.time.now / 140)) * pulse);

    const cost = strikeCost(p);
    // T5 (fix A): during the Opening after a Great Counter, STRIKE is free and glows gold.
    const opening = alive && p.opening !== null;
    const strikeReady = alive && (p.focus >= cost || opening);
    this.strike.container.setAlpha(1);
    this.strike.face.setFillStyle(opening ? 0xffd166 : strikeReady ? AC.strike.ready : AC.strike.dim, FACE_ALPHA);
    this.strike.face.setStrokeStyle(opening ? 6 : 4, 0xffffff, strikeReady ? (opening ? 1 : 0.8) : 0.35);
    labelColor(this.strike, opening ? ACTION_LABEL.dark : strikeReady ? ACTION_LABEL.light : ACTION_LABEL.dim);
    const fill = Math.min(1, p.focus / cost);
    this.strikeRing.clear();
    // L-PREMIUM-b QA: while the Counter tip shows, STRIKE's ring stays blue and still, so the only gold on screen is COUNTER.
    const tipOn = this.counterPulse === 4;
    const strikeGold = strikeReady && !tipOn;
    this.strikeRing.lineStyle(5, strikeGold ? 0xffd166 : 0x9ad1ff, strikeGold ? 1 : 0.8);
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
    if (opening) this.strike.container.setScale(reducedMotion() ? 1.12 : 1.12 + Math.abs(Math.sin(this.scene.time.now / 70)) * 0.12);
    else if (strikeGold && this.strikePulse) this.strike.container.setScale(1 + Math.abs(Math.sin(this.scene.time.now / 140)) * 0.14);
    else if (strikeGold) this.strike.container.setScale(1 + Math.sin(this.scene.time.now / 160) * 0.04);
    else this.strike.container.setScale(1);

    if (this.virtue) this.showVirtue(alive && p.focus >= COMBAT.focus.max && p.virtueTicks === 0);

    if (this.kata && this.kataRing && p.kataMove) {
      const kataReady = alive && p.kataCooldown === 0;
      this.kata.face.setFillStyle(kataReady ? AC.kata.ready : AC.kata.dim, FACE_ALPHA);
      this.kata.face.setStrokeStyle(4, 0xffffff, kataReady ? 0.8 : 0.35);
      labelColor(this.kata, kataReady ? ACTION_LABEL.light : ACTION_LABEL.dim);
      this.kataRing.clear();
      if (p.kataCooldown > 0) {
        const done = 1 - p.kataCooldown / p.kataMove.cooldownTicks;
        this.kataRing.lineStyle(4, 0xc9a8ff, 0.85);
        this.kataRing.beginPath();
        this.kataRing.arc(0, 0, KATA_RADIUS + 4, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2);
        this.kataRing.strokePath();
      }
    }
  }

  /** L7: Virtue appears in its one spot when Focus is full, with a short calm grow (none with Reduced motion). */
  private showVirtue(full: boolean): void {
    const v = this.virtue!.container;
    if (this.off || full === this.virtueShown) return;
    this.virtueShown = full;
    this.scene.tweens.killTweensOf(v);
    v.setVisible(full).setAlpha(1).setScale(1);
    if (!full) return;
    if (!reducedMotion()) {
      v.setAlpha(0).setScale(0.8);
      this.scene.tweens.add({ targets: v, alpha: 1, scale: 1, duration: 200, ease: 'Quad.easeOut' });
    }
    this.onVirtueReady();
  }

  /** A little shake when a press is refused (for example, not enough Focus). */
  refuse(action: PlayerAction): void {
    const b = this.all().find((x) => x.action === action) ?? this.counter;
    const x = b.container.x;
    this.scene.tweens.add({ targets: b.container, x: x + 6, duration: 40, yoyo: true, repeat: 2, onComplete: () => this.layout() });
  }

  private makeButton(action: Button['action'], text: string, radius: number, color: number): Button {
    // Glossy buttons (Jay, Nov 18): a soft shadow and a dark rim under the face so it looks raised,
    // and a glossy shine on its top half. The face's colour still changes with ready / not ready.
    const shadow = this.scene.add.circle(0, 5, radius + 2, 0x08060e, 0.4);
    const rim = this.scene.add.circle(0, 3, radius + 1, 0x14121c, 0.75);
    const face = this.scene.add.circle(0, 0, radius, color, FACE_ALPHA).setStrokeStyle(4, 0xffffff, 0.8);
    const gloss = this.scene.add.ellipse(0, -radius * 0.42, radius * 1.45, radius * 0.85, 0xffffff, 0.22);
    const spark = this.scene.add.ellipse(-radius * 0.38, -radius * 0.52, radius * 0.32, radius * 0.18, 0xffffff, 0.5).setAngle(-25);
    const label = this.scene.add
      .text(0, 0, text, { fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', fontSize: `${Math.max(12, Math.round(radius * 0.36))}px`, color: '#ffffff', stroke: '#14121c', strokeThickness: 2 })
      .setOrigin(0.5)
      .setResolution(crisp());
    const container = this.scene.add.container(0, 0, [shadow, rim, face, gloss, spark, label]);
    return { action, radius, container, face, label };
  }

  /** The press: face, shine and label sink 3 points onto the dark rim and shrink a little, then spring back. */
  private pressFx(b: Button): void {
    const parts = b.container.list.slice(2) as unknown as Phaser.GameObjects.Components.Transform[];
    this.scene.tweens.killTweensOf(parts);
    parts.forEach((o) => o.setScale(1));
    this.scene.tweens.add({ targets: parts, scale: 0.9, duration: 55, yoyo: true, ease: 'Quad.Out' });
    const ys = parts.map((o) => o.y);
    parts.forEach((o, i) => this.scene.tweens.add({ targets: o, y: ys[i] + 3, duration: 55, yoyo: true, ease: 'Quad.Out' }));
  }

  private all(): Button[] {
    return [this.counter, this.strike, this.dash, this.virtue, this.kata].filter((b): b is Button => b !== null);
  }

  private hit(b: Button, x: number, y: number): boolean {
    // A little larger than drawn, so small fingers don't miss. A hidden button can't be pressed.
    return b.container.visible && Phaser.Math.Distance.Between(x, y, b.container.x, b.container.y) <= b.radius + 12;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.off) return;
    for (const b of this.all()) {
      if (this.hit(b, (pointer.x / DPR), (pointer.y / DPR))) {
        this.onTouch();
        this.pending = b.action;
        this.pressFx(b);
        return;
      }
    }
  }
}

/** Q-PREM-F9: change a label's colour only when it differs (setColor redraws the text). */
function labelColor(b: Button, color: string): void {
  if (b.label.style.color !== color) b.label.setColor(color);
}
