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
/** The rock garden's raked sand (tiles), its rock groups (x, y, size), its corner bushes and its bamboo water spout. */
const GARDEN: Rect = [2.4, 12.6, 16.0, 24.0];
const GARDEN_ROCKS: [number, number, number][] = [
  [5.0, 18.2, 1.25],
  [10.0, 19.6, 1.0],
  [6.4, 22.3, 0.9],
];
const GARDEN_BUSHES: [number, number, number][] = [
  // round the garden on the lawn, never on the sand (Jay, Nov 24)
  [1.7, 17.4, 0xff8fc0],
  [1.7, 22.6, 0xe0559a],
  [4.0, 24.85, 0xff8fc0],
  [10.6, 24.85, 0xe0559a],
  [13.6, 16.6, 0xe0559a],
  [13.6, 23.6, 0xff8fc0],
];
const SPOUT: [number, number] = [11.65, 22.45];
const BASIN: [number, number] = [11.45, 23.05];
const POND ={ x: 39.5, y: 26.2, rx: 4.2, ry: 2.0 };
const FLOWER_COLOURS = [0xffd23f, 0xff8fb1, 0xffffff, 0xb48cff, 0xff6b5b, 0x7fd3ff];
const BUTTERFLY_COLOURS = [0xffd23f, 0xffffff, 0x8fd0ff, 0xffa64d];

/** How strongly each kind of plant moves in the breeze (degrees, and how fast it flutters). */
export type SwayKind = 'tree' | 'bush' | 'grass';
const SWAY: Record<SwayKind, { amp: number; speed: number; squash: number }> = {
  tree: { amp: 2.6, speed: 0.0019, squash: 0.018 },
  bush: { amp: 2.4, speed: 0.0026, squash: 0.03 },
  grass: { amp: 9, speed: 0.0042, squash: 0 },
};

interface Swayer {
  obj: Phaser.GameObjects.Image;
  kind: SwayKind;
  phase: number;
  sx: number;
  sy: number;
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
    this.gardenPlants();
    if (s.still) return;
    this.pond();
    this.petals();
    this.rockGarden();
    if (s.night) return;
    this.butterflies();
    this.clouds();
    this.birds();
  }

  /** Trees, bushes and grass bend in the breeze, pinned at their base. */
  sway(images: Phaser.GameObjects.Image[], kind: SwayKind): void {
    if (this.s.still) return;
    const phase = Math.random() * Math.PI * 2;
    for (const obj of images) this.swayers.push({ obj, kind, phase, sx: obj.scaleX, sy: obj.scaleY });
  }

  private lastTime = -1;

  update(time: number): void {
    const dt = this.lastTime < 0 ? 0 : Math.min(100, time - this.lastTime);
    this.lastTime = time;
    // Gusts roll across the town from left to right: each plant is pushed over (downwind), then springs back
    // and flutters. Two slow waves mixed, so the gusts never repeat in an obvious way.
    for (const w of this.swayers) {
      const k = SWAY[w.kind];
      const wave = Math.sin(time * 0.00052 - w.obj.x * 0.0035) * 0.6 + Math.sin(time * 0.00021 - w.obj.x * 0.0011 + 1.3) * 0.4;
      const gust = Math.max(0, wave) ** 1.5;
      // the flutter quickens in a gust: its phase is added up frame by frame, so speeding up never jumps
      w.phase += dt * k.speed * (1 + gust);
      const flutter = Math.sin(w.phase) * (0.35 + 0.65 * gust);
      const bend = gust * 0.9 + flutter * 0.6;
      w.obj.angle = bend * k.amp;
      if (k.squash) {
        // the crown puffs and settles a little as the wind moves through the leaves
        const puff = Math.sin(w.phase * 1.7 + 1) * k.squash * (0.4 + gust);
        w.obj.setScale(w.sx * (1 + puff), w.sy * (1 - puff * 0.5));
      }
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
    // a round azalea bush: dark outline, two greens; its blossoms are a separate picture tinted per bush
    make('life-azalea', 56, 40, (g) => {
      const blobs: [number, number, number][] = [[16, 24, 13], [30, 18, 15], [42, 25, 12], [28, 28, 11]];
      g.fillStyle(0x2f4a35);
      for (const [x, y, r] of blobs) g.fillCircle(x, y, r + 1.6);
      g.fillStyle(0x4f9a4f);
      for (const [x, y, r] of blobs) g.fillCircle(x, y, r);
      g.fillStyle(0x6cbf5f);
      for (const [x, y, r] of blobs) g.fillCircle(x - r * 0.25, y - r * 0.3, r * 0.6);
    });
    make('life-azalea-bloom', 56, 40, (g) => {
      g.fillStyle(0xffffff);
      const dots = [[10, 20], [17, 14], [24, 22], [29, 9], [35, 16], [41, 21], [47, 26], [22, 31], [33, 29], [14, 28], [38, 10], [44, 15]];
      for (const [x, y] of dots) g.fillCircle(x, y, 2.6);
    });
    // a fern: a stem with leaflets on both sides
    make('life-fern', 20, 28, (g) => {
      g.fillStyle(0x3e8a3f);
      g.fillRect(9, 4, 2, 24);
      g.fillStyle(0x5cae4c);
      for (let k = 0; k < 6; k++) {
        const y = 6 + k * 3.6;
        const w = 9 - k * 0.9;
        g.fillEllipse(10 - w / 2, y, w, 3);
        g.fillEllipse(10 + w / 2, y, w, 3);
      }
    });
    make('life-leaf', 10, 8, (g) => {
      g.fillStyle(0xffffff);
      g.fillTriangle(0, 4, 5, 0, 10, 4);
      g.fillTriangle(0, 4, 5, 8, 10, 4);
    });
    make('life-drop', 4, 6, (g) => {
      g.fillStyle(0xbfe8ff);
      g.fillEllipse(2, 3, 4, 6);
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
        this.sway([stem], 'grass');
        if (!this.s.still) this.swayBloom(bloom, stem, size);
      }
    }
    const greens = [0xffffff, 0xd8f0c0, 0xa8d890, 0xe8ffd0];
    for (let c = 0; c < 90; c++) {
      const at = this.pick(LAWNS);
      const tuft = scene.add.image(at.x * tile, at.y * tile, 'life-tuft').setOrigin(0.5, 1).setDisplaySize(tile * (0.3 + Math.random() * 0.16), tile * (0.24 + Math.random() * 0.14)).setDepth(at.y * tile).setTint(greens[c % greens.length]);
      if (night) tuft.setTint(nightTint);
      stand.add(tuft);
      this.sway([tuft], 'grass');
    }
  }

  /** The flower head follows its stem's lean. */
  private swayBloom(bloom: Phaser.GameObjects.Image, stem: Phaser.GameObjects.Image, size: number): void {
    this.blooms.push({ bloom, stem, x: bloom.x, y: bloom.y, len: size * 0.72 });
  }

  // ---------------------------------------------------------------- the rock garden (Jay, Nov 24: it "can use something")
  /** Azalea bushes in the garden's corners, ferns and tiny flowers round the moss islands. */
  private gardenPlants(): void {
    const { scene, tile, stand, night, nightTint } = this.s;
    const add = (img: Phaser.GameObjects.Image, y: number) => {
      img.setDepth(y * tile);
      if (night) img.setTint(nightTint);
      stand.add(img);
      return img;
    };
    for (const [x, y, pink] of GARDEN_BUSHES) {
      const w = tile * 1.05;
      const bush = add(scene.add.image(x * tile, y * tile, 'life-azalea').setOrigin(0.5, 0.92).setDisplaySize(w, w * 0.72), y);
      const bloom = scene.add.image(x * tile, y * tile, 'life-azalea-bloom').setOrigin(0.5, 0.92).setDisplaySize(w, w * 0.72).setTint(night ? 0x9a5a8a : pink).setDepth(y * tile + 0.1);
      stand.add(bloom);
      this.sway([bush, bloom], 'bush');
    }
    for (const [rx, ry, r] of GARDEN_ROCKS) {
      const n = 5;
      for (let k = 0; k < n; k++) {
        // round the front (bottom) edge of the island, so they don't hide behind the rocks
        const a = Math.PI * (0.05 + (k / (n - 1)) * 0.9) + (Math.random() - 0.5) * 0.3;
        const x = rx + Math.cos(a) * r;
        const y = ry + Math.sin(a) * r * 0.55;
        const fern = add(scene.add.image(x * tile, y * tile, 'life-fern').setOrigin(0.5, 1).setDisplaySize(tile * 0.36, tile * 0.48).setFlipX(k % 2 === 0), y);
        this.sway([fern], 'grass');
        if (k % 2) {
          const fx = x + (Math.random() - 0.5) * 0.3;
          const fy = y + 0.12;
          const col = [0xffffff, 0xd9b8ff, 0xfff1a8][k % 3];
          const f = add(scene.add.image(fx * tile, fy * tile, 'life-bloom').setDisplaySize(tile * 0.16, tile * 0.16), fy);
          f.setTint(night ? nightTint : col);
        }
      }
    }
  }

  /** Water drips from the bamboo spout into its basin, red leaves blow over the sand, dragonflies hover, the sand glints. */
  private rockGarden(): void {
    const { scene, tile, stand, ground } = this.s;
    const [sx, sy] = SPOUT;
    const [bx, by] = BASIN;
    this.every(500, 900, () => {
      const d = scene.add.image(sx * tile, sy * tile, 'life-drop').setDisplaySize(tile * 0.05, tile * 0.08).setDepth(by * tile + 1);
      stand.add(d);
      scene.tweens.add({
        targets: d,
        x: bx * tile,
        y: (by - 0.1) * tile,
        duration: 380,
        ease: 'Quad.easeIn',
        onComplete: () => {
          d.destroy();
          const ring = scene.add.ellipse(bx * tile, (by - 0.1) * tile, tile * 0.1, tile * 0.05).setStrokeStyle(1.2, 0xffffff, 0.8).setFillStyle().setDepth(by * tile + 1);
          stand.add(ring);
          scene.tweens.add({ targets: ring, scaleX: 2.6, scaleY: 2.6, alpha: 0, duration: 700, onComplete: () => ring.destroy() });
        },
      });
    });
    // autumn leaves from the garden's west side, tumbling east over the raked sand
    this.every(1400, 3200, () => {
      const y = (GARDEN[2] + Math.random() * (GARDEN[3] - GARDEN[2])) * tile;
      const x = (GARDEN[0] - 0.6) * tile;
      const leaf = scene.add.image(x, y, 'life-leaf').setDisplaySize(tile * 0.21, tile * 0.16).setDepth(y);
      leaf.setTint(this.s.night ? 0x7a4a5a : [0xd9472b, 0xf08a24, 0xc23a3a, 0xf2b134][Math.floor(Math.random() * 4)]);
      stand.add(leaf);
      const time = 6000 + Math.random() * 4000;
      const run = (GARDEN[1] - GARDEN[0] + 1.2) * tile * (0.6 + Math.random() * 0.4);
      scene.tweens.add({ targets: leaf, x: x + run, duration: time, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: leaf, y: y + tile * 0.25, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: leaf, angle: 360 * (Math.random() < 0.5 ? 1 : -1), duration: 1600 + Math.random() * 900, repeat: -1 });
      scene.tweens.add({ targets: leaf, alpha: 0, delay: time - 800, duration: 800, onComplete: () => leaf.destroy() });
    });
    if (this.s.night) return;
    for (let i = 0; i < 2; i++) this.dragonfly(i ? 0x3fb8c9 : 0xd9472b);
    this.every(500, 1200, () => {
      const x = (GARDEN[0] + 0.3 + Math.random() * (GARDEN[1] - GARDEN[0] - 0.6)) * tile;
      const y = (GARDEN[2] + 0.3 + Math.random() * (GARDEN[3] - GARDEN[2] - 0.6)) * tile;
      const g = scene.add.image(x, y, 'life-soft').setDisplaySize(tile * 0.12, tile * 0.12).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      ground.add(g);
      scene.tweens.add({ targets: g, alpha: 0.8, duration: 500, yoyo: true, onComplete: () => g.destroy() });
    });
  }

  /** A dragonfly: hovers, then darts to a new spot over the garden. */
  private dragonfly(colour: number): void {
    const { scene, tile, stand } = this.s;
    const box = scene.add.container((GARDEN[0] + 2) * tile, (GARDEN[2] + 2) * tile);
    const body = scene.add.rectangle(0, 0, tile * 0.22, tile * 0.035, colour);
    const wings = [-1, 1].map((side) => scene.add.image(-tile * 0.02, side * tile * 0.05, 'life-wing').setDisplaySize(tile * 0.14, tile * 0.07).setAlpha(0.55).setAngle(side * 20));
    const shadow = scene.add.image(0, tile * 0.6, 'life-soft').setDisplaySize(tile * 0.2, tile * 0.06).setTint(0x000000).setAlpha(0.15);
    box.add([shadow, body, ...wings]);
    stand.add(box);
    scene.tweens.add({ targets: wings, alpha: 0.2, duration: 45, yoyo: true, repeat: -1 });
    const dart = () => {
      if (!box.active) return;
      const to = {
        x: (GARDEN[0] + 0.5 + Math.random() * (GARDEN[1] - GARDEN[0] - 1)) * tile,
        y: (GARDEN[2] + 0.5 + Math.random() * (GARDEN[3] - GARDEN[2] - 1)) * tile,
      };
      box.setScale(to.x < box.x ? -1 : 1, 1);
      scene.tweens.add({
        targets: box,
        x: to.x,
        y: to.y,
        duration: 350 + Math.random() * 300,
        ease: 'Cubic.easeOut',
        onUpdate: () => box.setDepth(box.y + tile * 0.6),
        onComplete: () => scene.time.delayedCall(900 + Math.random() * 2200, dart),
      });
    };
    dart();
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
    this.every(3800, 7500, () => {
      const p = spot();
      const ring = scene.add.ellipse(p.x, p.y, tile * 0.3, tile * 0.14).setStrokeStyle(1.5, 0xffffff, 0.5).setFillStyle();
      ground.add(ring);
      scene.tweens.add({ targets: ring, scaleX: 3.6, scaleY: 3.6, alpha: 0, duration: 3400, ease: 'Sine.easeOut', onComplete: () => ring.destroy() });
    });
    if (this.s.night) return;
    this.every(700, 1600, () => {
      const p = spot();
      const s = scene.add.image(p.x, p.y, 'life-soft').setDisplaySize(tile * 0.22, tile * 0.08).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      ground.add(s);
      scene.tweens.add({ targets: s, alpha: 0.7, duration: 700, yoyo: true, onComplete: () => s.destroy() });
    });
  }
}
