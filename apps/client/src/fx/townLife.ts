import Phaser from 'phaser';

/**
 * Small moving things that make the town feel alive (Jay, Nov 24: "bring it to life so it doesn't feel so flat").
 * All drawn in code, all cosmetic: trees and flowers sway in the breeze, butterflies flutter over the lawns, cherry
 * petals drift down from the plaza trees, birds cross the sky, soft cloud shadows slide over the town and the pond
 * ripples and sparkles. More flowers bloom as the town grows with the student's real belt (its stage).
 * Client only; nothing here touches the game rules. Random is fine here (looks only).
 */

type Rect = [x0: number, x1: number, y0: number, y1: number];

export interface TownLifeSetup {
  scene: Phaser.Scene;
  /** Where things that sort with buildings and heroes go (sorted by depth = y in pixels). */
  stand: Phaser.GameObjects.Container;
  /** Flat things on the ground (under everything standing). */
  ground: Phaser.GameObjects.Container;
  tile: number;
  /** Town width in tiles, and the top of the picture (negative rows: the sky and hills). */
  width: number;
  top: number;
  night: boolean;
  /** The town's stage (1 = white belt): more flowers each stage. */
  stage: number;
  still: boolean;
  nightTint: number;
}

/** Lawns (tiles) where flowers grow and butterflies play; kept clear of the paving, the pond and the doors. */
const LAWNS: Rect[] = [
  [1.2, 13.5, 25.2, 28.7],
  [1.2, 2.2, 15.4, 24.6],
  [31.4, 34.8, 24.6, 28.7],
  [44.2, 44.9, 15.2, 28.5],
  [21.8, 26.8, 25.6, 28.7],
];
/** The four plaza cherry trees' crowns (tiles), where petals fall from. */
const SAKURA: [number, number][] = [
  [17.5, 14.8],
  [28.5, 14.8],
  [17.5, 20.8],
  [28.5, 20.8],
];
const POND = { x: 39.5, y: 26.2, rx: 4.2, ry: 2.0 };
const FLOWER_COLOURS = [0xffd23f, 0xff8fb1, 0xffffff, 0xb48cff, 0xff6b5b, 0x7fd3ff];
const BUTTERFLY_COLOURS = [0xffd23f, 0xffffff, 0x8fd0ff, 0xffa64d];

interface Swayer {
  obj: Phaser.GameObjects.Image;
  amp: number;
  speed: number;
  phase: number;
}

export class TownLife {
  private readonly s: TownLifeSetup;
  private readonly swayers: Swayer[] = [];
  private readonly timers: Phaser.Time.TimerEvent[] = [];
  private readonly blooms: { bloom: Phaser.GameObjects.Image; stem: Phaser.GameObjects.Image; x: number; y: number; len: number }[] = [];

  constructor(s: TownLifeSetup) {
    this.s = s;
    this.makeTextures();
    this.flowers();
    if (s.still) return;
    this.pond();
    this.petals();
    if (s.night) return;
    this.butterflies();
    this.clouds();
    this.birds();
  }

  /** Trees and bushes lean gently in the breeze (pinned at their base). */
  sway(images: Phaser.GameObjects.Image[], big: boolean): void {
    if (this.s.still) return;
    const phase = Math.random() * Math.PI * 2;
    for (const obj of images) this.swayers.push({ obj, amp: big ? 0.9 : 1.6, speed: big ? 0.0011 : 0.0016, phase });
  }

  update(time: number): void {
    // a slow gust rolls across the town from left to right
    for (const w of this.swayers) {
      const gust = 0.65 + 0.35 * Math.sin(time * 0.00031 - w.obj.x * 0.004);
      w.obj.angle = Math.sin(time * w.speed + w.phase) * w.amp * gust;
    }
    for (const b of this.blooms) {
      const a = Phaser.Math.DegToRad(b.stem.angle);
      b.bloom.setPosition(b.x + Math.sin(a) * b.len, b.y + (1 - Math.cos(a)) * b.len);
    }
  }

  destroy(): void {
    for (const t of this.timers) t.remove();
    this.swayers.length = 0;
    this.blooms.length = 0;
  }

  // ---------------------------------------------------------------- textures, drawn once
  private makeTextures(): void {
    const { scene } = this.s;
    const make = (key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
      if (scene.textures.exists(key)) return;
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      draw(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };
    // a flower: a stem, two leaves and a round head with a darker middle (tinted per colour)
    make('life-stem', 16, 24, (g) => {
      g.fillStyle(0x3f8f3a);
      g.fillRect(7, 8, 2, 16);
      g.fillStyle(0x58b04a);
      g.fillEllipse(4, 17, 7, 4);
      g.fillEllipse(12, 15, 7, 4);
    });
    make('life-bloom', 16, 16, (g) => {
      g.fillStyle(0xffffff);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        g.fillCircle(8 + Math.cos(a) * 3.6, 8 + Math.sin(a) * 3.6, 3.4);
      }
      g.fillStyle(0xf4b400);
      g.fillCircle(8, 8, 2.2);
    });
    make('life-tuft', 16, 12, (g) => {
      g.fillStyle(0x5fae4e);
      g.fillTriangle(2, 12, 5, 1, 7, 12);
      g.fillTriangle(6, 12, 9, 0, 11, 12);
      g.fillTriangle(10, 12, 14, 3, 15, 12);
    });
    make('life-wing', 12, 14, (g) => {
      g.fillStyle(0xffffff);
      g.fillEllipse(6, 5, 11, 9);
      g.fillEllipse(5, 11, 8, 6);
      g.fillStyle(0x000000, 0.25);
      g.fillCircle(6, 5, 1.6);
    });
    make('life-petal', 8, 6, (g) => {
      g.fillStyle(0xffc4d8);
      g.fillEllipse(4, 3, 8, 5);
      g.fillStyle(0xff9fc0);
      g.fillEllipse(5, 3, 3, 2);
    });
    make('life-bird', 18, 8, (g) => {
      g.lineStyle(2.4, 0x3a3f55);
      g.beginPath();
      g.moveTo(1, 2);
      g.lineTo(9, 7);
      g.lineTo(17, 2);
      g.strokePath();
    });
    make('life-soft', 64, 64, (g) => {
      for (let r = 32; r > 0; r -= 2) {
        g.fillStyle(0xffffff, 0.06);
        g.fillCircle(32, 32, r);
      }
    });
  }

  private pick(rects: Rect[]): { x: number; y: number } {
    // weighted by area so big lawns get more
    const areas = rects.map(([a, b, c, d]) => (b - a) * (d - c));
    let r = Math.random() * areas.reduce((p, q) => p + q, 0);
    let i = 0;
    while (r > areas[i] && i < rects.length - 1) r -= areas[i++];
    const [x0, x1, y0, y1] = rects[i];
    return { x: x0 + Math.random() * (x1 - x0), y: y0 + Math.random() * (y1 - y0) };
  }

  private every(minMs: number, maxMs: number, fn: () => void): void {
    const { scene } = this.s;
    const go = () => {
      fn();
      this.timers.push(scene.time.delayedCall(minMs + Math.random() * (maxMs - minMs), go));
    };
    this.timers.push(scene.time.delayedCall(Math.random() * maxMs, go));
  }

  // ---------------------------------------------------------------- flowers and grass tufts
  private flowers(): void {
    const { scene, tile, stand, night, nightTint } = this.s;
    const clumps = 10 + Math.min(10, this.s.stage) * 3;
    for (let c = 0; c < clumps; c++) {
      const at = this.pick(LAWNS);
      const colour = FLOWER_COLOURS[Math.floor(Math.random() * FLOWER_COLOURS.length)];
      const n = 2 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n; k++) {
        const x = (at.x + (Math.random() - 0.5) * 0.9) * tile;
        const y = (at.y + (Math.random() - 0.5) * 0.5) * tile;
        const size = tile * (0.3 + Math.random() * 0.1);
        const stem = scene.add.image(x, y, 'life-stem').setOrigin(0.5, 1).setDisplaySize(size * 0.67, size);
        const bloom = scene.add.image(x, y - size * 0.72, 'life-bloom').setDisplaySize(size * 0.6, size * 0.6).setTint(colour);
        if (night) {
          stem.setTint(nightTint);
          bloom.setTint(Phaser.Display.Color.ValueToColor(colour).darken(45).color);
        }
        stem.setDepth(y);
        bloom.setDepth(y + 0.1);
        stand.add([stem, bloom]);
        this.sway([stem], false);
        if (!this.s.still) this.swayBloom(bloom, stem, size);
      }
    }
    for (let c = 0; c < 40; c++) {
      const at = this.pick(LAWNS);
      const tuft = scene.add.image(at.x * tile, at.y * tile, 'life-tuft').setOrigin(0.5, 1).setDisplaySize(tile * 0.32, tile * 0.24).setDepth(at.y * tile);
      if (night) tuft.setTint(nightTint);
      stand.add(tuft);
      this.sway([tuft], false);
    }
  }

  /** The flower head follows its stem's lean. */
  private swayBloom(bloom: Phaser.GameObjects.Image, stem: Phaser.GameObjects.Image, size: number): void {
    this.blooms.push({ bloom, stem, x: bloom.x, y: bloom.y, len: size * 0.72 });
  }

  // ---------------------------------------------------------------- butterflies
  private butterflies(): void {
    const n = 5 + Math.min(10, this.s.stage);
    for (let i = 0; i < n; i++) this.butterfly(BUTTERFLY_COLOURS[i % BUTTERFLY_COLOURS.length]);
  }

  private butterfly(colour: number): void {
    const { scene, tile, stand } = this.s;
    const at = this.pick([...LAWNS, [3, 13, 15.5, 24], [15.5, 30.5, 14.5, 24.5]]);
    const box = scene.add.container(at.x * tile, at.y * tile);
    const w = tile * 0.24;
    const left = scene.add.image(0, 0, 'life-wing').setOrigin(1, 0.5).setDisplaySize(w, w * 1.15).setTint(colour);
    const right = scene.add.image(0, 0, 'life-wing').setOrigin(1, 0.5).setDisplaySize(w, w * 1.15).setTint(colour).setFlipX(true);
    right.setOrigin(0, 0.5);
    const shadow = scene.add.image(0, tile * 0.55, 'life-soft').setDisplaySize(w * 1.4, w * 0.5).setTint(0x000000).setAlpha(0.18);
    box.add([shadow, left, right]);
    stand.add(box);
    const base = left.scaleX;
    scene.tweens.add({ targets: [left, right], scaleX: base * 0.2, duration: 110 + Math.random() * 40, yoyo: true, repeat: -1 });
    const hop = () => {
      if (!box.active) return;
      const to = { x: box.x + (Math.random() - 0.5) * tile * 3, y: box.y + (Math.random() - 0.5) * tile * 1.6 };
      to.x = Phaser.Math.Clamp(to.x, tile, (this.s.width - 1) * tile);
      to.y = Phaser.Math.Clamp(to.y, 9.5 * tile, 28.5 * tile);
      scene.tweens.add({
        targets: box,
        x: to.x,
        y: to.y,
        duration: 1400 + Math.random() * 1600,
        ease: 'Sine.easeInOut',
        onUpdate: () => box.setDepth(box.y + tile * 0.5),
        onComplete: () => scene.time.delayedCall(Math.random() < 0.3 ? 1500 + Math.random() * 2000 : 100, hop),
      });
    };
    // a little bob up and down while flying
    scene.tweens.add({ targets: [left, right], y: -tile * 0.08, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    hop();
  }

  // ---------------------------------------------------------------- cherry petals
  private petals(): void {
    const { scene, tile, stand } = this.s;
    this.every(180, 450, () => {
      const [cx, cy] = SAKURA[Math.floor(Math.random() * SAKURA.length)];
      const x = (cx + (Math.random() - 0.5) * 1.6) * tile;
      const y = (cy - 0.3 + (Math.random() - 0.5) * 0.8) * tile;
      const p = scene.add.image(x, y, 'life-petal').setDisplaySize(tile * 0.17, tile * 0.12).setDepth(y + tile * 2).setAngle(Math.random() * 360);
      if (this.s.night) p.setTint(0xb090c0);
      stand.add(p);
      const fall = tile * (1.3 + Math.random() * 0.8);
      const drift = tile * (0.6 + Math.random() * 1.4);
      const time = 3200 + Math.random() * 2200;
      scene.tweens.add({ targets: p, y: y + fall, duration: time, ease: 'Sine.easeIn' });
      scene.tweens.add({ targets: p, x: x + drift, angle: p.angle + 300, duration: time, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: p, scaleY: p.scaleY * 0.3, duration: 400, yoyo: true, repeat: -1 });
      scene.tweens.add({ targets: p, alpha: 0, delay: time - 300, duration: 1400, onComplete: () => p.destroy() });
    });
  }

  // ---------------------------------------------------------------- birds across the sky
  private birds(): void {
    const { scene, tile, stand, width, top } = this.s;
    this.every(9000, 18000, () => {
      const n = 3 + Math.floor(Math.random() * 3);
      const ltr = Math.random() < 0.5;
      const y0 = (top + 1 + Math.random() * 3.5) * tile;
      const startX = ltr ? -tile * 2 : (width + 2) * tile;
      const endX = ltr ? (width + 4) * tile : -tile * 4;
      for (let i = 0; i < n; i++) {
        const back = Math.ceil(i / 2) * tile * 0.6;
        const side = (i % 2 ? -1 : 1) * Math.ceil(i / 2) * tile * 0.35;
        const b = scene.add.image(startX - (ltr ? back : -back), y0 + side, 'life-bird').setDisplaySize(tile * 0.26, tile * 0.11).setDepth(0);
        stand.add(b);
        scene.tweens.add({ targets: b, scaleY: b.scaleY * -0.6, duration: 200 + i * 15, yoyo: true, repeat: -1 });
        scene.tweens.add({ targets: b, x: endX - (ltr ? back : -back), y: b.y - tile * 1.2, duration: 16000 + Math.random() * 4000, onComplete: () => b.destroy() });
      }
    });
  }

  // ---------------------------------------------------------------- cloud shadows
  private clouds(): void {
    const { scene, tile, stand, width } = this.s;
    const one = (startX: number) => {
      const y = (10 + Math.random() * 18) * tile;
      const w = tile * (7 + Math.random() * 5);
      const c = scene.add.container(startX, y).setDepth(1e6 - 1);
      for (let k = 0; k < 3; k++) {
        c.add(scene.add.image((k - 1) * w * 0.28, (Math.random() - 0.5) * tile, 'life-soft').setDisplaySize(w * 0.7, w * 0.42).setTint(0x1a2440).setAlpha(0.22));
      }
      stand.add(c);
      const endX = (width + 8) * tile;
      scene.tweens.add({ targets: c, x: endX, duration: ((endX - startX) / tile) * 2400, onComplete: () => c.destroy() });
    };
    one(Math.random() * width * tile * 0.5);
    one(width * tile * (0.5 + Math.random() * 0.4));
    this.every(30000, 50000, () => one(-12 * tile));
  }

  // ---------------------------------------------------------------- the pond: ripples and sparkles
  private pond(): void {
    const { scene, tile, ground } = this.s;
    const spot = () => {
      const a = Math.random() * Math.PI * 2;
      const q = Math.sqrt(Math.random()) * 0.75;
      return { x: (POND.x + Math.cos(a) * POND.rx * q) * tile, y: (POND.y + Math.sin(a) * POND.ry * q) * tile };
    };
    this.every(900, 2200, () => {
      const p = spot();
      const ring = scene.add.ellipse(p.x, p.y, tile * 0.3, tile * 0.14).setStrokeStyle(2, 0xffffff, 0.7).setFillStyle();
      ground.add(ring);
      scene.tweens.add({ targets: ring, scaleX: 3.2, scaleY: 3.2, alpha: 0, duration: 1800, ease: 'Sine.easeOut', onComplete: () => ring.destroy() });
    });
    if (this.s.night) return;
    this.every(150, 400, () => {
      const p = spot();
      const s = scene.add.image(p.x, p.y, 'life-soft').setDisplaySize(tile * 0.22, tile * 0.08).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      ground.add(s);
      scene.tweens.add({ targets: s, alpha: 0.9, duration: 350, yoyo: true, onComplete: () => s.destroy() });
    });
  }
}
