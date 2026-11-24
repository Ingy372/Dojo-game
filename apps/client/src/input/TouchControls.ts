import Phaser from 'phaser';
import type { MoveInput } from '@dojo/sim';
import { view, DPR } from '../ui/theme';

/** How far (in screen pixels) the stick knob can travel from its center. */
const STICK_RADIUS = 56;
const KNOB_RADIUS = 26;
/**
 * Playtest Nov 22: on a small phone the stick area is a big part of the floor, and a quick tap there (on a training
 * dummy, say) did nothing. A press in the stick area that lets go this quickly, having barely moved, walks there.
 */
const QUICK_TAP_MS = 250;
const QUICK_TAP_SLOP = 14;

/**
 * Turns touches into movement requests for the rules package.
 * - A thumb in the bottom-left area makes a stick appear under it.
 * - A tap (or hold and drag) anywhere else asks to walk to that spot.
 */
export class TouchControls {
  private stickPointer: number | null = null;
  private stickCenter = new Phaser.Math.Vector2();
  private stickVector = new Phaser.Math.Vector2();
  private stickDown = { x: 0, y: 0, at: 0, moved: 0 };
  private tapPointer: number | null = null;
  private pendingTap: { x: number; y: number } | null = null;
  private off = false;
  /** Taps are ignored until this time (scene ms): see ignoreTapsFor. */
  private quietUntil = 0;

  private readonly base: Phaser.GameObjects.Arc;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly hint: Phaser.GameObjects.Arc;
  /** Nov 17 (desktop): arrow keys and WASD move the hero like the stick. */
  private readonly keys: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key> | null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly worldCamera: Phaser.Cameras.Scene2D.Camera,
    /** Converts a world point (pixels) to room tiles. */
    private readonly toTiles: (x: number, y: number) => { x: number; y: number },
    /** True for screen points that belong to buttons, which this ignores. */
    private readonly isButton: (x: number, y: number) => boolean = () => false,
    /**
     * True for screen points that are tap targets even inside the stick area (an exit cue under the
     * stick): a press there is a tap, not a stick.
     */
    private readonly isTapTarget: (x: number, y: number) => boolean = () => false,
  ) {
    // Allow several fingers at once (stick, a button, and a tap).
    scene.input.addPointer(2);

    this.base = scene.add.circle(0, 0, STICK_RADIUS, 0xffffff, 0.12).setStrokeStyle(3, 0xffffff, 0.35);
    this.knob = scene.add.circle(0, 0, KNOB_RADIUS, 0xffffff, 0.45);
    // Faint ring showing where the stick lives when not in use.
    this.hint = scene.add.circle(0, 0, STICK_RADIUS, 0xffffff, 0.05).setStrokeStyle(2, 0xffffff, 0.12);
    this.showStick(false);
    // On a computer with no touch screen, the resting stick ring would only confuse: keys and clicks move.
    if (!hasTouch()) this.hint.setAlpha(0);
    this.layout();
    const kb = scene.input.keyboard;
    this.keys = kb
      ? {
          up: kb.addKey('UP'),
          down: kb.addKey('DOWN'),
          left: kb.addKey('LEFT'),
          right: kb.addKey('RIGHT'),
          w: kb.addKey('W', false),
          a: kb.addKey('A', false),
          s: kb.addKey('S', false),
          d: kb.addKey('D', false),
        }
      : null;

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onUp, this);
  }

  /** The screen-space objects, so the world camera can ignore them. */
  get objects(): Phaser.GameObjects.GameObject[] {
    return [this.base, this.knob, this.hint];
  }

  /** Called on resize: puts the resting stick hint in the bottom-left corner. */
  layout(): void {
    const { height } = view(this.scene);
    this.hint.setPosition(STICK_RADIUS + 36, height - STICK_RADIUS - 36);
  }

  /** The movement request for this tick. A new tap is sent once; the stick is sent every tick it's held. */
  takeInput(): MoveInput {
    if (this.stickPointer !== null) {
      return { kind: 'stick', x: this.stickVector.x, y: this.stickVector.y };
    }
    const key = this.keyVector();
    if (key) {
      this.pendingTap = null;
      return { kind: 'stick', x: key.x, y: key.y };
    }
    if (this.pendingTap) {
      const tap = this.pendingTap;
      this.pendingTap = null;
      return { kind: 'moveTo', x: tap.x, y: tap.y };
    }
    return { kind: 'none' };
  }

  /** The arrow keys / WASD as a stick push (full speed, diagonals normalised), or null when none are held. */
  private keyVector(): { x: number; y: number } | null {
    const k = this.keys;
    if (!k || this.off) return null;
    const x = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
    const y = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
    if (x === 0 && y === 0) return null;
    // Menus and cards that block taps (they report every point as a button) block the keys too.
    if (this.isButton(-1e6, -1e6)) return null;
    const len = Math.hypot(x, y);
    return { x: x / len, y: y / len };
  }

  /** Asks to walk to a spot (room tiles), as if it was tapped (Grok playtest Nov 23, B2: the door arrow). */
  walkTo(tile: { x: number; y: number }): void {
    if (this.off) return;
    this.pendingTap = { x: tile.x, y: tile.y };
  }

  /**
   * Lets go and ignores new presses for a moment (Grok playtest Nov 23, B4: tapping Got it also walked the
   * hero; a touch screen can send a copy of the same tap just after the card closes).
   */
  ignoreTapsFor(ms: number): void {
    this.reset();
    this.quietUntil = this.scene.time.now + ms;
  }

  /** Lets go of everything (for example when the app goes to the background). */
  reset(): void {
    this.stickPointer = null;
    this.tapPointer = null;
    this.pendingTap = null;
    this.stickVector.set(0, 0);
    this.showStick(false);
  }

  /** Lets go, hides the stick and its hint, and ignores new touches (Q-PREM-F4: once the hero is down). */
  disable(): void {
    this.reset();
    this.off = true;
    for (const o of this.objects) (o as unknown as { setVisible(v: boolean): void }).setVisible(false);
  }

  /** Takes touches again, stick hidden and its hint showing (B-MASHER-d1: practice goes on after a fall). */
  enable(): void {
    this.off = false;
    this.reset();
  }

  private inStickZone(x: number, y: number): boolean {
    const { width, height } = view(this.scene);
    return x < width * 0.4 && y > height * 0.4;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.off || this.scene.time.now < this.quietUntil) return;
    if (this.isButton((pointer.x / DPR), (pointer.y / DPR))) return;
    if (this.stickPointer === null && this.inStickZone((pointer.x / DPR), (pointer.y / DPR)) && !this.isTapTarget((pointer.x / DPR), (pointer.y / DPR))) {
      this.stickPointer = pointer.id;
      this.stickDown = { x: pointer.x / DPR, y: pointer.y / DPR, at: this.scene.time.now, moved: 0 };
      // Keep the whole stick on screen even if the thumb lands near the edge.
      const { height } = view(this.scene);
      this.stickCenter.set(
        Math.max((pointer.x / DPR), STICK_RADIUS + 8),
        Math.min((pointer.y / DPR), height - STICK_RADIUS - 8),
      );
      this.updateStick(pointer);
      this.showStick(true);
      return;
    }
    if (this.tapPointer === null) {
      this.tapPointer = pointer.id;
      this.queueTap(pointer);
    }
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.stickPointer) {
      this.stickDown.moved = Math.max(this.stickDown.moved, Math.hypot(pointer.x / DPR - this.stickDown.x, pointer.y / DPR - this.stickDown.y));
      this.updateStick(pointer);
    }
    else if (pointer.id === this.tapPointer && pointer.isDown) this.queueTap(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.stickPointer) {
      this.stickPointer = null;
      this.stickVector.set(0, 0);
      this.showStick(false);
      if (isQuickTap(this.scene.time.now - this.stickDown.at, this.stickDown.moved)) this.queueTap(pointer);
    } else if (pointer.id === this.tapPointer) {
      this.tapPointer = null;
    }
  }

  private updateStick(pointer: Phaser.Input.Pointer): void {
    const dx = (pointer.x / DPR) - this.stickCenter.x;
    const dy = (pointer.y / DPR) - this.stickCenter.y;
    const dist = Math.hypot(dx, dy);
    const scale = dist > STICK_RADIUS ? STICK_RADIUS / dist : 1;
    this.stickVector.set((dx * scale) / STICK_RADIUS, (dy * scale) / STICK_RADIUS);
    this.base.setPosition(this.stickCenter.x, this.stickCenter.y);
    this.knob.setPosition(this.stickCenter.x + dx * scale, this.stickCenter.y + dy * scale);
  }

  private queueTap(pointer: Phaser.Input.Pointer): void {
    const world = this.worldCamera.getWorldPoint(pointer.x, pointer.y);
    this.pendingTap = this.toTiles(world.x, world.y);
  }

  private showStick(active: boolean): void {
    this.base.setVisible(active);
    this.knob.setVisible(active);
    this.hint.setVisible(!active);
  }
}

/** A press in the stick area that counts as a tap to walk: let go quickly, having barely moved. */
export function isQuickTap(heldMs: number, movedPx: number): boolean {
  return heldMs <= QUICK_TAP_MS && movedPx <= QUICK_TAP_SLOP;
}

/** True on phones and tablets (and touch-screen computers). */
export function hasTouch(): boolean {
  return typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0;
}
