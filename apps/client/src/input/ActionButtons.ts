import Phaser from 'phaser';
import { COMBAT, type PlayerState } from '@dojo/sim';

const COUNTER_RADIUS = 48;
const STRIKE_RADIUS = 38;
const MARGIN = 26;

interface Button {
  action: 'strike' | 'counter';
  radius: number;
  container: Phaser.GameObjects.Container;
  face: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
}

/**
 * The Strike and Counter buttons in the bottom-right corner. A button acts the
 * moment a finger touches it (not on release), so Counter timing is exact.
 */
export class ActionButtons {
  private pending: 'strike' | 'counter' | null = null;
  private readonly counter: Button;
  private readonly strike: Button;
  /** Ring around Strike showing Focus filling toward the Strike cost. */
  private readonly strikeRing: Phaser.GameObjects.Graphics;

  constructor(
    private readonly scene: Phaser.Scene,
    /** Called on every button touch (used to switch on sound). */
    private readonly onTouch: () => void,
  ) {
    this.counter = this.makeButton('counter', 'COUNTER', COUNTER_RADIUS, 0x3a7bd5);
    this.strike = this.makeButton('strike', 'STRIKE', STRIKE_RADIUS, 0xd5713a);
    this.strikeRing = scene.add.graphics();
    this.strike.container.add(this.strikeRing);
    this.layout();
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
  }

  get objects(): Phaser.GameObjects.GameObject[] {
    return [this.counter.container, this.strike.container];
  }

  /** True if a screen point is on a button (so it isn't treated as tap-to-move or the stick). */
  contains(x: number, y: number): boolean {
    return this.hit(this.counter, x, y) || this.hit(this.strike, x, y);
  }

  layout(): void {
    const { width, height } = this.scene.scale.gameSize;
    const cx = width - COUNTER_RADIUS - MARGIN;
    const cy = height - COUNTER_RADIUS - MARGIN;
    this.counter.container.setPosition(cx, cy);
    this.strike.container.setPosition(cx - COUNTER_RADIUS - STRIKE_RADIUS - 22, cy - 34);
  }

  /** The button pressed since the last tick, if any (sent once). */
  takeAction(): 'strike' | 'counter' | undefined {
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

    const cost = COMBAT.strike.focusCost;
    const strikeReady = alive && p.focus >= cost;
    this.strike.container.setAlpha(strikeReady ? 1 : 0.55);
    this.strike.face.setFillStyle(strikeReady ? 0xd5713a : 0x5a4a44, 0.9);
    const fill = Math.min(1, p.focus / cost);
    this.strikeRing.clear();
    this.strikeRing.lineStyle(5, strikeReady ? 0xffd166 : 0x9ad1ff, strikeReady ? 1 : 0.8);
    this.strikeRing.beginPath();
    this.strikeRing.arc(0, 0, STRIKE_RADIUS + 5, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2);
    this.strikeRing.strokePath();
    if (strikeReady) this.strike.container.setScale(1 + Math.sin(this.scene.time.now / 160) * 0.04);
    else this.strike.container.setScale(1);
  }

  /** A little shake when a press is refused (for example, not enough Focus). */
  refuse(action: 'strike' | 'counter'): void {
    const b = action === 'strike' ? this.strike : this.counter;
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

  private hit(b: Button, x: number, y: number): boolean {
    // A little larger than drawn, so small fingers don't miss.
    return Phaser.Math.Distance.Between(x, y, b.container.x, b.container.y) <= b.radius + 12;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    for (const b of [this.counter, this.strike]) {
      if (this.hit(b, pointer.x, pointer.y)) {
        this.onTouch();
        this.pending = b.action;
        this.scene.tweens.add({ targets: b.face, scale: 0.88, duration: 50, yoyo: true });
        return;
      }
    }
  }
}
