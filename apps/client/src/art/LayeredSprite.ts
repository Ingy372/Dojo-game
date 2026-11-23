// A layered character (body, gi, belt, ... or an enemy's body, glow, telegraph, light)
// drawn from the packed art. All layers share one frame clock, so they stay in step.

import Phaser from 'phaser';
import { type ArtAnimation, type CharacterArt, directionIndex, frameOf } from './art';

export interface PlayOptions {
  /** Start again from frame 0 even if this animation is already playing. */
  restart?: boolean;
  /** Playback speed (1 = the art's own frame rate). */
  speed?: number;
  /** First and last frame to play (inclusive); the whole animation by default. */
  from?: number;
  to?: number;
}

export class LayeredSprite {
  readonly container: Phaser.GameObjects.Container;
  readonly images = new Map<string, Phaser.GameObjects.Image>();
  /** Layers switched off by the game (e.g. belt stripes the student hasn't earned). */
  private hidden = new Set<string>();
  private anim: ArtAnimation;
  private animName: string;
  private startedAt = 0;
  private opts: PlayOptions = {};
  private dir = 4;
  /** A frame set from outside (e.g. a wind-up driven by the rules' ticks), or null. */
  private manualFrame: number | null = null;
  private shown = -1;
  private baseTints = new Map<string, number | null>();
  /** Drawn as its own mirror image (kata moves on the right side use the left-side art flipped). */
  private mirrored = false;
  private flashing: string | null = null;
  /** A light over the whole character (the town at night), multiplied into each layer's own colour. */
  private shade: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly art: CharacterArt,
    x = 0,
    y = 0,
  ) {
    for (const layer of art.layers) {
      const img = scene.add.image(0, 0, '__DEFAULT').setVisible(false);
      img.setOrigin(art.anchor.x / art.frameWidth, art.anchor.y / art.frameHeight);
      this.images.set(layer.name, img);
    }
    this.container = scene.add.container(x, y, [...this.images.values()]);
    this.animName = 'idle' in art.animations ? 'idle' : Object.keys(art.animations)[0];
    this.anim = art.animations[this.animName];
    this.startedAt = scene.time.now;
  }

  get current(): string {
    return this.animName;
  }

  has(name: string): boolean {
    return name in this.art.animations;
  }

  /** Plays an animation (keeps going if it's already the current one, unless `restart`). */
  play(name: string, opts: PlayOptions = {}): this {
    const anim = this.art.animations[name];
    if (!anim) return this;
    const same = name === this.animName && this.manualFrame === null;
    if (same && !opts.restart) {
      this.opts.speed = opts.speed ?? this.opts.speed;
      return this;
    }
    this.animName = name;
    this.anim = anim;
    this.opts = opts;
    this.manualFrame = null;
    this.startedAt = this.scene.time.now;
    this.shown = -1;
    return this;
  }

  /** Shows one frame of an animation and holds it (for animations driven by the rules). */
  showFrame(name: string, frame: number): this {
    const anim = this.art.animations[name];
    if (!anim) return this;
    if (name !== this.animName) this.shown = -1;
    this.animName = name;
    this.anim = anim;
    this.manualFrame = Phaser.Math.Clamp(Math.floor(frame), 0, anim.frames - 1);
    return this;
  }

  /** True once a one-shot animation has reached its last frame. */
  get finished(): boolean {
    if (this.anim.loop || this.manualFrame !== null) return false;
    return this.elapsedFrames() >= this.lastFrame();
  }

  /** Seconds since the current animation started. */
  get seconds(): number {
    // K25: a scene can play its art slower (the Game scene runs at TEMPO.speed).
    const tempo = (this.scene as { animTempo?: number }).animTempo ?? 1;
    return ((this.scene.time.now - this.startedAt) / 1000) * tempo;
  }

  /** Faces a direction given as a vector (screen space: +y is down). */
  face(dx: number, dy: number): this {
    if (dx !== 0 || dy !== 0) this.dir = directionIndex(dx, dy);
    return this;
  }

  setDirection(index: number): this {
    this.dir = index;
    return this;
  }

  /**
   * Draws the character as its mirror image: the art of the mirrored direction (E for W, NE for NW...), flipped
   * left to right. Kata moves are drawn with the left foot forward; the right side is this mirror.
   */
  setMirrored(on: boolean): this {
    if (on === this.mirrored) return this;
    this.mirrored = on;
    this.container.scaleX = Math.abs(this.container.scaleX) * (on ? -1 : 1);
    this.shown = -1;
    return this;
  }

  get isMirrored(): boolean {
    return this.mirrored;
  }

  /** Shows or hides a layer (it's also hidden in frames where it has nothing to draw). */
  setLayer(name: string, visible: boolean): this {
    if (visible) this.hidden.delete(name);
    else this.hidden.add(name);
    this.shown = -1;
    return this;
  }

  setLayerTint(name: string, color: number | null): this {
    const img = this.images.get(name);
    if (!img) return this;
    this.baseTints.set(name, color);
    if (!this.flashing) this.applyTint(img, color);
    return this;
  }

  /**
   * A hit flash over every layer: `fill` paints the whole character one colour (a white
   * flash), otherwise the colour is multiplied in. null puts the normal colours back.
   */
  flash(color: number | null, fill = false): this {
    const key = color === null ? null : `${color}:${fill}`;
    if (key === this.flashing) return this;
    this.flashing = key;
    for (const [name, img] of this.images) {
      if (color === null) this.applyTint(img, this.baseTints.get(name) ?? null);
      else if (fill) img.setTintFill(color);
      else img.setTint(color);
    }
    return this;
  }

  /**
   * Lights the whole character with `color` (null takes it off). Unlike a plain tint on every layer, this keeps
   * each layer's own colour (skin, hair, gi, belt) and darkens it, so the hero never turns one flat colour.
   */
  setShade(color: number | null): this {
    this.shade = color;
    if (!this.flashing) for (const [name, img] of this.images) this.applyTint(img, this.baseTints.get(name) ?? null);
    return this;
  }

  private applyTint(img: Phaser.GameObjects.Image, color: number | null): void {
    const c = multiplyColour(color, this.shade);
    if (c === null) img.clearTint();
    else img.setTint(c);
  }

  /** The frame index currently shown. */
  get frame(): number {
    if (this.manualFrame !== null) return this.manualFrame;
    const f = this.elapsedFrames();
    const first = this.opts.from ?? 0;
    if (this.anim.loop && this.opts.to === undefined) return first + ((f - first) % (this.anim.frames - first));
    return Math.min(f, this.lastFrame());
  }

  private lastFrame(): number {
    return this.opts.to ?? this.anim.frames - 1;
  }

  private elapsedFrames(): number {
    return (this.opts.from ?? 0) + Math.floor(this.seconds * this.anim.fps * (this.opts.speed ?? 1));
  }

  /** Call every frame: puts the right picture on each layer. */
  update(): void {
    const frame = this.frame;
    // N, NE, E, SE, S, SW, W, NW seen in a mirror: N, NW, W, SW, S, SE, E, NE.
    const dir = this.mirrored ? (8 - this.dir) % 8 : this.dir;
    const key = frame * 8 + dir;
    if (key === this.shown) return;
    this.shown = key;
    for (const [name, img] of this.images) {
      const ids = this.anim.layers[name];
      // Art rendered facing one way only (the shop's sharp preview) has one row, used for every direction.
      const id = ids && !this.hidden.has(name) ? ids[ids.length === 1 ? 0 : dir]?.[frame] ?? -1 : -1;
      const f = frameOf(this.scene, this.anim.layerPack?.[name] ?? this.art.layerPack?.[name] ?? this.art.pack, id);
      if (f) img.setTexture(f[0], f[1]);
      img.setVisible(!!f);
    }
  }

  /** Keeps animating on its own every frame (for menus and celebrations), until destroyed. */
  autoUpdate(): this {
    const tick = () => (this.container.active ? this.update() : undefined);
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
    this.container.once(Phaser.GameObjects.Events.DESTROY, () => this.scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
    return this;
  }

  destroy(): void {
    this.container.destroy();
  }
}

/** Two tints multiplied channel by channel (null is white). */
export function multiplyColour(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  const ch = (shift: number) => Math.round((((a >> shift) & 255) * ((b >> shift) & 255)) / 255) << shift;
  return ch(16) | ch(8) | ch(0);
}
