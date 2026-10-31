import Phaser from 'phaser';
import type { MoveInput } from '@dojo/sim';
import { view, DPR } from '../ui/theme';

/** How far (in screen pixels) the stick knob can travel from its center. */
const STICK_RADIUS = 56;
const KNOB_RADIUS = 26;

/**
 * Turns touches into movement requests for the rules package.
 * - A thumb in the bottom-left area makes a stick appear under it.
 * - A tap (or hold and drag) anywhere else asks to walk to that spot.
 */
export class TouchControls {
  private stickPointer: number | null = null;
  private stickCenter = new Phaser.Math.Vector2();
  private stickVector = new Phaser.Math.Vector2();
  private tapPointer: number | null = null;
  private pendingTap: { x: number; y: number } | null = null;
  private off = false;

  private readonly base: Phaser.GameObjects.Arc;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly hint: Phaser.GameObjects.Arc;

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
    this.layout();

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
    if (this.pendingTap) {
      const tap = this.pendingTap;
      this.pendingTap = null;
      return { kind: 'moveTo', x: tap.x, y: tap.y };
    }
    return { kind: 'none' };
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
    if (this.off) return;
    if (this.isButton((pointer.x / DPR), (pointer.y / DPR))) return;
    if (this.stickPointer === null && this.inStickZone((pointer.x / DPR), (pointer.y / DPR)) && !this.isTapTarget((pointer.x / DPR), (pointer.y / DPR))) {
      this.stickPointer = pointer.id;
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
    if (pointer.id === this.stickPointer) this.updateStick(pointer);
    else if (pointer.id === this.tapPointer && pointer.isDown) this.queueTap(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.stickPointer) {
      this.stickPointer = null;
      this.stickVector.set(0, 0);
      this.showStick(false);
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
