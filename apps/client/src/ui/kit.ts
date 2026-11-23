import Phaser from 'phaser';
// U-KIT (Jay, Nov 23): ONE look for every menu, so the Training Board, Practice Kata, the Shop and every
// other screen feel like the same premium game (references: Archero 2, Survivor.io). Every menu draws its
// backdrop, panels, ribbon titles, tabs, tiles, chips and close buttons from here, and the shared button
// (button.ts) takes its colours from KIT_TONE. Change the look here, never screen by screen.
//
// The look: a royal-blue sky with a soft diamond pattern; navy panels with a thick dark outline, a light
// inner rim and a shine; glossy chunky buttons (gold = the main action, blue = back / secondary, green =
// go / yes, red = close / danger); gold ribbon titles; white words with a dark outline in Lilita One.

import { sfx } from '../audio/Sfx';
import { reducedMotion } from '../game/motion';

/** Title font (titles, buttons, tabs, numbers) and body font. Both bundled (src/fonts). */
export const TITLE_FONT = "'Lilita One', 'Arial Rounded MT Bold', system-ui, sans-serif";
export const BODY_FONT = "'Nunito', system-ui, sans-serif";

export const KIT = {
  /** The one outline colour (panels, buttons, tiles, word outlines). */
  ink: 0x0d1233,
  inkCss: '#0d1233',
  sky: { top: 0x2b4ac4, mid: 0x16206b, bottom: 0x0c1240 },
  panel: { top: 0x2c3f9e, mid: 0x1b2a7a, bottom: 0x152163, rim: 0x5a78e0 },
  /** A sunk area inside a panel (bars, chips, the empty part of a toggle). */
  well: 0x0a0f33,
  wellRim: 0x3c4ea8,
  tabOff: { top: 0x3a52b8, bottom: 0x22307e, text: '#c9d6ff' },
  /** Words. */
  white: '#ffffff',
  soft: '#c9d6ff',
  faint: '#9aa6d6',
  gold: '#ffe36a',
  brown: '#5a2e00',
  good: '#9ef08a',
  bad: '#ff8a7a',
  /** Rarity tile faces (top, bottom, inner rim). */
  rarity: {
    common: { top: 0x9bb0c8, bottom: 0x5d7290, rim: 0xd4e2f2 },
    uncommon: { top: 0x7ee07a, bottom: 0x2f9a3a, rim: 0xd2ffc8 },
    rare: { top: 0x59a8ff, bottom: 0x2456c8, rim: 0xb7dcff },
    epic: { top: 0xc47cff, bottom: 0x6a2fc0, rim: 0xecc9ff },
    legendary: { top: 0xffd45a, bottom: 0xe07a12, rim: 0xfff1b0 },
    locked: { top: 0x34407a, bottom: 0x222a5a, rim: 0x4a5694 },
  },
} as const;

export type ToneName = 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'dim';
export interface Tone {
  hi: number;
  base: number;
  lip: number;
}
export const KIT_TONE: Record<ToneName, Tone> = {
  gold: { hi: 0xffe36a, base: 0xffb01f, lip: 0xc9700a },
  blue: { hi: 0x6fb3ff, base: 0x2e6ae0, lip: 0x1a3a9a },
  green: { hi: 0x8ef06a, base: 0x36b33a, lip: 0x1d6e22 },
  red: { hi: 0xff7a6a, base: 0xe0302a, lip: 0x8a1410 },
  purple: { hi: 0xc47cff, base: 0x7a3ad0, lip: 0x3e1a78 },
  dim: { hi: 0x4a5aa8, base: 0x2a3780, lip: 0x1a235a },
};
/** Colour numbers for callers that pick a button colour: each maps exactly onto its tone. */
export const KIT_COLOR: Record<ToneName, number> = {
  gold: KIT_TONE.gold.base,
  blue: KIT_TONE.blue.base,
  green: KIT_TONE.green.base,
  red: KIT_TONE.red.base,
  purple: KIT_TONE.purple.base,
  dim: KIT_TONE.dim.base,
};

/**
 * Which kit tone an older screen colour belongs to, so every button keeps its meaning (gold / orange
 * stays the main action, green stays yes, red stays danger) while wearing the one look. Greys, browns
 * and very dark colours become the quiet "dim" tone; other blues and violets become blue (purple when
 * strongly violet).
 */
export function toneOf(color: number): ToneName {
  for (const n of Object.keys(KIT_COLOR) as ToneName[]) if (KIT_COLOR[n] === color) return n;
  const r = ((color >> 16) & 255) / 255;
  const g = ((color >> 8) & 255) / 255;
  const b = (color & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (s < 0.28 || max < 0.3) return 'dim';
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 18 || h >= 335) return 'red';
  // Browns (the old wood buttons) were the quiet "go back" colour: blue. Bright golds and oranges: gold.
  if (h < 66) return max < 0.45 ? 'dim' : h >= 15 && max < 0.62 ? 'blue' : 'gold';
  if (h < 170) return 'green';
  if (h < 255) return 'blue';
  if (h < 300) return s > 0.45 ? 'purple' : 'blue';
  return 'purple';
}

/** "#rrggbb" or "rgb()" relative brightness 0-1 (rough), for deciding whether words need an outline. */
export function brightness(css: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(css.trim());
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

/** Outline thickness for words of this size. */
export const strokeFor = (size: number): number => Math.max(2, Math.min(5, Math.round(size / 5)));

/** The title-style words: Lilita One, white (or `color`) with a dark outline. */
export function kitTitle(scene: Phaser.Scene, x: number, y: number, s: string, size: number, color: string = KIT.white, wrap?: number): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, s, { fontFamily: TITLE_FONT, fontSize: `${size}px`, color, align: 'center', stroke: KIT.inkCss, strokeThickness: strokeFor(size), wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
    .setResolution(res());
}

/** Everyday words: Nunito bold with a thin dark outline. */
export function kitText(scene: Phaser.Scene, x: number, y: number, s: string, size: number, color: string = KIT.white, wrap?: number, align: 'left' | 'center' | 'right' = 'left'): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, s, { fontFamily: BODY_FONT, fontStyle: 'bold', fontSize: `${size}px`, color, align, stroke: KIT.inkCss, strokeThickness: Math.max(2, Math.round(size / 7)), wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined })
    .setResolution(res());
}

function res(): number {
  return Math.min(3, window.devicePixelRatio || 1) * 2;
}


type Radius = number | { tl: number; tr: number; bl: number; br: number };

/**
 * A top-to-bottom colour fade inside a rounded box. Phaser's own gradient fill streaks diagonally on
 * rounded shapes, so this lays the bottom colour down solid, then stacks see-through bands of the top
 * colour that get shorter toward the bottom (a smooth fade with clean corners).
 */
export function fade(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, r: Radius, top: number, bottom: number, alpha = 1): Phaser.GameObjects.Graphics {
  g.fillStyle(bottom, alpha).fillRoundedRect(x, y, w, h, r);
  const n = 7;
  const topR = typeof r === 'number' ? { tl: r, tr: r, bl: 0, br: 0 } : { tl: r.tl, tr: r.tr, bl: 0, br: 0 };
  const maxR = Math.max(topR.tl, topR.tr);
  for (let i = 1; i < n; i++) {
    const hh = (h * (n - i)) / n;
    if (hh < maxR + 1) break;
    g.fillStyle(top, 0.27 * alpha).fillRoundedRect(x, y, w, hh, topR);
  }
  return g;
}

// ---------------------------------------------------------------- backdrop and panels

/** The menu backdrop: the royal-blue sky gradient, a soft glow and a faint diamond pattern. */
export function kitBackdrop(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const g = scene.add.graphics();
  g.fillGradientStyle(KIT.sky.top, KIT.sky.top, KIT.sky.mid, KIT.sky.mid, 1).fillRect(0, 0, width, height * 0.7);
  g.fillGradientStyle(KIT.sky.mid, KIT.sky.mid, KIT.sky.bottom, KIT.sky.bottom, 1).fillRect(0, height * 0.7 - 1, width, height * 0.3 + 1);
  for (let i = 6; i >= 1; i--) g.fillStyle(0x78b4ff, 0.03).fillCircle(width * 0.22, height * 0.42, height * (0.1 + i * 0.09));
  // Diamond pattern: two sets of faint diagonal bands.
  const step = 28;
  g.fillStyle(0xffffff, 0.03);
  for (let x = -height; x < width + height; x += step) {
    g.fillTriangle(x, 0, x + 14, 0, x + 14 + height, height);
    g.fillTriangle(x, 0, x + height, height, x + 14 + height, height);
    g.fillTriangle(x + height, 0, x + height + 14, 0, x + 14, height);
    g.fillTriangle(x + height, 0, x, height, x + 14, height);
  }
  return [g];
}

/** A dark see-through layer behind a pop-up; it swallows taps. */
export function kitDim(scene: Phaser.Scene, width: number, height: number, alpha = 0.72): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(0, 0, width, height, 0x060a24, alpha).setOrigin(0).setInteractive();
}

export interface PanelOpts {
  radius?: number | { tl: number; tr: number; bl: number; br: number };
  /** A gold inner rim (a picked or special panel). */
  gold?: boolean;
  /** Fill alpha (default 1). */
  alpha?: number;
  /** No drop shadow (a panel inside a panel). */
  flat?: boolean;
  /** Face colours instead of the navy panel (e.g. a rarity face). */
  face?: { top: number; bottom: number; rim: number };
}

/** A kit panel: drop shadow, thick dark outline, the navy face with a shine on top and a light inner rim. */
export function kitPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, opts: PanelOpts = {}): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  drawPanel(g, x, y, w, h, opts);
  return g;
}

export function drawPanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, opts: PanelOpts = {}): Phaser.GameObjects.Graphics {
  const r = opts.radius ?? 16;
  const rn = typeof r === 'number' ? r : Math.max(r.tl, r.tr, r.bl, r.br);
  const shrink = (k: number) => (typeof r === 'number' ? Math.max(0, r - k) : { tl: Math.max(0, r.tl - k), tr: Math.max(0, r.tr - k), bl: Math.max(0, r.bl - k), br: Math.max(0, r.br - k) });
  const face = opts.face ?? { top: KIT.panel.top, bottom: KIT.panel.bottom, rim: KIT.panel.rim };
  const a = opts.alpha ?? 1;
  if (!opts.flat) g.fillStyle(0x05081e, 0.55 * a).fillRoundedRect(x, y + 5, w, h, r);
  g.fillStyle(KIT.ink, a).fillRoundedRect(x, y, w, h, r);
  fade(g, x + 3, y + 3, w - 6, h - 6, shrink(3), face.top, face.bottom, a);
  // The shine across the top.
  g.fillStyle(0xffffff, 0.07 * a).fillRoundedRect(x + 5, y + 5, w - 10, Math.min(h * 0.3, 48), typeof r === 'number' ? { tl: Math.max(0, rn - 5), tr: Math.max(0, rn - 5), bl: 6, br: 6 } : shrink(5));
  g.lineStyle(2, opts.gold ? 0xffd23f : face.rim, opts.gold ? 1 : 0.9 * a).strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, shrink(4));
  return g;
}

/** A sunk well inside a panel (for bars, lists, a coin chip). */
export function kitWell(scene: Phaser.Scene, x: number, y: number, w: number, h: number, r = h / 2): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(KIT.ink, 1).fillRoundedRect(x, y, w, h, r);
  g.fillStyle(KIT.well, 0.9).fillRoundedRect(x + 2.5, y + 2.5, w - 5, h - 5, Math.max(0, r - 2.5));
  g.lineStyle(1.5, KIT.wellRim, 0.9).strokeRoundedRect(x + 3, y + 3, w - 6, h - 6, Math.max(0, r - 3));
  return g;
}

/** A tile face (rarity or tone colours) with the dark outline, inner rim, a bottom shade and a drop shadow. */
export function kitTile(scene: Phaser.Scene, x: number, y: number, w: number, h: number, face: { top: number; bottom: number; rim: number } = KIT.rarity.rare, r = 12): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(0x05081e, 0.55).fillRoundedRect(x, y + 4, w, h, r);
  g.fillStyle(KIT.ink, 1).fillRoundedRect(x, y, w, h, r);
  fade(g, x + 3, y + 3, w - 6, h - 6, r - 3, face.top, face.bottom);
  g.fillStyle(0x000000, 0.16).fillRoundedRect(x + 3, y + h - 9, w - 6, 6, { tl: 0, tr: 0, bl: r - 3, br: r - 3 });
  g.fillStyle(0xffffff, 0.16).fillRoundedRect(x + 6, y + 5, w - 12, (h - 6) * 0.34, { tl: r - 5, tr: r - 5, bl: 4, br: 4 });
  g.lineStyle(2.5, face.rim, 1).strokeRoundedRect(x + 4.5, y + 4.5, w - 9, h - 9, r - 4);
  return g;
}

/** Tile colours for a button tone (a list card the colour of its meaning). */
export function toneFace(t: ToneName): { top: number; bottom: number; rim: number } {
  const c = KIT_TONE[t];
  return { top: c.hi, bottom: c.base, rim: 0xffffff };
}

// ---------------------------------------------------------------- titles, tabs, chips

/**
 * The gold ribbon title (Archero's "Level Up" banner), centred on cx with its top at y. The ribbon is
 * as wide as the words need, at least `minW`. Returns the parts and the ribbon's height.
 */
export function kitRibbon(scene: Phaser.Scene, cx: number, y: number, label: string, size = 22, minW = 150): { parts: Phaser.GameObjects.GameObject[]; h: number; w: number } {
  const t = scene.add
    .text(cx, 0, label, { fontFamily: TITLE_FONT, fontSize: `${size}px`, color: KIT.brown })
    .setResolution(res())
    .setOrigin(0.5);
  const h = Math.round(size * 1.8);
  const w = Math.max(minW, Math.ceil(t.width) + 44);
  t.setY(y + h / 2 - 1);
  const g = scene.add.graphics();
  const x = cx - w / 2;
  // Tails, behind the face.
  const tw = 20;
  for (const side of [-1, 1]) {
    const ex = side < 0 ? x - tw + 4 : x + w - 4;
    const pts = side < 0 ? [ex, y + 9, ex + tw, y + 9, ex + tw, y + h + 6, ex, y + h + 6, ex + 8, y + h / 2 + 7] : [ex, y + 9, ex + tw, y + 9, ex + tw - 8, y + h / 2 + 7, ex + tw, y + h + 6, ex, y + h + 6];
    const poly = new Phaser.Geom.Polygon(pts);
    g.fillStyle(KIT_TONE.gold.lip, 1).fillPoints(poly.points, true).lineStyle(3, KIT.ink, 1).strokePoints(poly.points, true);
  }
  g.fillStyle(0x05081e, 0.5).fillRoundedRect(x, y + 4, w, h, 6);
  g.fillStyle(KIT.ink, 1).fillRoundedRect(x, y, w, h, 6);
  fade(g, x + 3, y + 3, w - 6, h - 6, 4, 0xfff3a8, KIT_TONE.gold.base);
  g.fillStyle(KIT_TONE.gold.lip, 1).fillRect(x + 3, y + h - 7, w - 6, 4);
  g.fillStyle(0xffffff, 0.35).fillRoundedRect(x + 6, y + 5, w - 12, (h - 8) * 0.35, 3);
  return { parts: [g, t], h, w };
}

export interface KitTab {
  label: string;
  on: boolean;
  onTap: () => void;
  /** A red alert dot on the tab. */
  alert?: boolean;
}

/**
 * A row of folder tabs sitting on top of a panel at y (the tabs' bottom edge is y + h). The picked tab is
 * gold and a little taller; the others are dark blue.
 */
export function kitTabs(scene: Phaser.Scene, x: number, y: number, w: number, h: number, tabs: readonly KitTab[], gap = 4, size = 16): Phaser.GameObjects.GameObject[] {
  const out: Phaser.GameObjects.GameObject[] = [];
  const tw = (w - gap * (tabs.length - 1)) / tabs.length;
  tabs.forEach((tab, i) => {
    const tx = x + i * (tw + gap);
    const lift = tab.on ? 4 : 0;
    const g = scene.add.graphics();
    const r = { tl: 12, tr: 12, bl: 0, br: 0 };
    g.fillStyle(KIT.ink, 1).fillRoundedRect(tx, y - lift, tw, h + lift, r);
    if (tab.on) fade(g, tx + 3, y - lift + 3, tw - 6, h + lift - 3, { tl: 9, tr: 9, bl: 0, br: 0 }, 0xfff3a8, KIT_TONE.gold.base);
    else fade(g, tx + 3, y - lift + 3, tw - 6, h + lift - 3, { tl: 9, tr: 9, bl: 0, br: 0 }, KIT.tabOff.top, KIT.tabOff.bottom);
    g.fillStyle(0xffffff, tab.on ? 0.3 : 0.08).fillRoundedRect(tx + 6, y - lift + 5, tw - 12, (h + lift) * 0.32, { tl: 7, tr: 7, bl: 3, br: 3 });
    out.push(g);
    const label = scene.add
      .text(tx + tw / 2, y + h / 2 - lift / 2, tab.label, tab.on ? { fontFamily: TITLE_FONT, fontSize: `${size}px`, color: KIT.brown } : { fontFamily: TITLE_FONT, fontSize: `${size}px`, color: KIT.tabOff.text, stroke: KIT.inkCss, strokeThickness: 3 })
      .setResolution(res())
      .setOrigin(0.5);
    if (label.width > tw - 10) label.setScale((tw - 10) / label.width);
    out.push(label);
    if (tab.alert) out.push(...kitAlertDot(scene, tx + tw - 10, y - lift + 6));
    const hit = scene.add.zone(tx + tw / 2, y + h / 2 - lift / 2, tw, Math.max(44, h + lift)).setInteractive({ useHandCursor: true });
    hit.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (tab.on) return;
      sfx.tap();
      tab.onTap();
    });
    out.push(hit);
  });
  return out;
}

/** A red "!" alert dot (something new waits here). */
export function kitAlertDot(scene: Phaser.Scene, cx: number, cy: number, r = 9, label = '!'): Phaser.GameObjects.GameObject[] {
  const g = scene.add.graphics();
  g.fillStyle(KIT.ink, 1).fillCircle(cx, cy, r + 2);
  g.fillStyle(0xffffff, 1).fillCircle(cx, cy, r);
  g.fillStyle(KIT_TONE.red.base, 1).fillCircle(cx, cy, r - 2.5);
  const t = scene.add.text(cx, cy, label, { fontFamily: TITLE_FONT, fontSize: `${Math.round(r * 1.2)}px`, color: '#ffffff' }).setResolution(res()).setOrigin(0.5);
  return [g, t];
}

/** A coin: a gold disc with a dark outline and a shine. */
export function kitCoin(scene: Phaser.Scene, cx: number, cy: number, r = 10): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(KIT.ink, 1).fillCircle(cx, cy, r);
  g.fillStyle(0xd98b0c, 1).fillCircle(cx, cy, r - 2);
  g.fillStyle(0xffd23f, 1).fillCircle(cx, cy - 1, r - 3.5);
  g.fillStyle(0xfff6c0, 0.9).fillCircle(cx - r * 0.3, cy - r * 0.35, r * 0.28);
  g.lineStyle(1.5, 0xc9700a, 0.9).strokeCircle(cx, cy, r * 0.55);
  return g;
}

/** A round red close button (top right of a pop-up). Its tap area is at least 48 points. */
export function kitClose(scene: Phaser.Scene, cx: number, cy: number, onTap: () => void, r = 19): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  g.fillStyle(0x05081e, 0.55).fillCircle(0, 4, r + 1);
  g.fillStyle(KIT.ink, 1).fillCircle(0, 0, r + 1);
  g.fillStyle(KIT_TONE.red.lip, 1).fillCircle(0, 0, r - 2);
  g.fillStyle(KIT_TONE.red.base, 1).fillCircle(0, -2, r - 3);
  g.fillStyle(KIT_TONE.red.hi, 0.7).fillEllipse(-r * 0.15, -r * 0.45, r * 1.1, r * 0.55);
  const k = r * 0.36;
  g.lineStyle(7, KIT.ink, 1).lineBetween(-k, -k - 1, k, k - 1).lineBetween(-k, k - 1, k, -k - 1);
  g.lineStyle(4, 0xffffff, 1).lineBetween(-k, -k - 1, k, k - 1).lineBetween(-k, k - 1, k, -k - 1);
  const box = scene.add.container(cx, cy, [g]);
  const hitR = Math.max(24, r + 6);
  box.setSize(hitR * 2, hitR * 2).setInteractive(new Phaser.Geom.Circle(hitR, hitR, hitR), Phaser.Geom.Circle.Contains);
  box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
    if (!reducedMotion()) scene.tweens.add({ targets: box, scale: 0.92, duration: 70 });
  });
  box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => box.setScale(1));
  box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
    box.setScale(1);
    sfx.tap();
    onTap();
  });
  return box;
}

/** A gold medal with a number (level badge). */
export function kitMedal(scene: Phaser.Scene, cx: number, cy: number, r: number, label: string): Phaser.GameObjects.GameObject[] {
  const g = scene.add.graphics();
  g.fillStyle(0x05081e, 0.5).fillCircle(cx, cy + 3, r);
  g.fillStyle(KIT.ink, 1).fillCircle(cx, cy, r);
  g.fillStyle(KIT_TONE.gold.lip, 1).fillCircle(cx, cy, r - 3);
  g.fillStyle(KIT_TONE.gold.base, 1).fillCircle(cx, cy - 1, r - 5);
  g.fillStyle(KIT_TONE.gold.hi, 1).fillCircle(cx - r * 0.12, cy - r * 0.15, r * 0.55);
  g.fillStyle(0xffffff, 0.6).fillEllipse(cx - r * 0.25, cy - r * 0.45, r * 0.8, r * 0.35);
  const t = scene.add.text(cx, cy, label, { fontFamily: TITLE_FONT, fontSize: `${Math.round(r * 1.05)}px`, color: KIT.brown }).setResolution(res()).setOrigin(0.5);
  return [g, t];
}

/** A progress bar: a dark well with a glossy fill (green by default). Returns the bar and a setter. */
export function kitBar(scene: Phaser.Scene, x: number, y: number, w: number, h: number, share: number, tone: ToneName = 'green'): { parts: Phaser.GameObjects.GameObject[]; set: (share: number) => void } {
  const well = kitWell(scene, x, y, w, h);
  const fill = scene.add.graphics();
  const c = KIT_TONE[tone];
  const set = (s: number): void => {
    fill.clear();
    const fw = Math.max(0, Math.min(1, s)) * (w - 5);
    if (fw < 2) return;
    const rr = Math.min((h - 5) / 2, fw / 2);
    fill.fillStyle(c.lip, 1).fillRoundedRect(x + 2.5, y + 2.5, fw, h - 5, rr);
    fade(fill, x + 2.5, y + 2.5, fw, h - 8, rr, c.hi, c.base);
    fill.fillStyle(0xffffff, 0.3).fillRoundedRect(x + 4, y + 3.5, Math.max(0, fw - 3), (h - 8) * 0.4, rr / 2);
  };
  set(share);
  return { parts: [well, fill], set };
}

/** A green pedestal disc for a standing hero whose feet are at (cx, footY). */
export function kitPedestal(scene: Phaser.Scene, cx: number, footY: number, w: number): Phaser.GameObjects.Graphics {
  const h = w * 0.26;
  const g = scene.add.graphics();
  g.fillStyle(0x05081e, 0.45).fillEllipse(cx, footY + h * 0.35, w * 1.06, h * 1.1);
  g.fillStyle(KIT.ink, 1).fillEllipse(cx, footY + h * 0.18, w + 6, h + 6);
  g.fillStyle(0x22702a, 1).fillEllipse(cx, footY + h * 0.18, w, h);
  g.fillStyle(0x3fb44a, 1).fillEllipse(cx, footY, w, h * 0.92);
  g.fillStyle(0x9ef08a, 0.55).fillEllipse(cx - w * 0.08, footY - h * 0.12, w * 0.6, h * 0.36);
  return g;
}

// ---------------------------------------------------------------- one font everywhere

let installed = false;

/**
 * Every Text made with scene.add.text wears the kit: the old serif titles become Lilita One, the old
 * system font becomes Nunito, and light words without an outline get a thin dark outline so they read on
 * any colour (the casual-game look). Words that already set an outline, a background colour or a dark
 * colour are left alone.
 */
export function installKitText(): void {
  if (installed) return;
  installed = true;
  const proto = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.GameObjects.Text;
  };
  const orig = proto.text;
  proto.text = function (this: Phaser.GameObjects.GameObjectFactory, x, y, text, style) {
    return orig.call(this, x, y, text, kitStyle(style));
  };
  // A screen that switches a text to the old serif later gets the title font instead.
  const tp = Phaser.GameObjects.Text.prototype as unknown as { setFontFamily: (f: string) => Phaser.GameObjects.Text };
  const setFam = tp.setFontFamily;
  tp.setFontFamily = function (this: Phaser.GameObjects.Text, f: string) {
    const lf = f.toLowerCase();
    if (lf.includes('georgia') || (lf.includes('serif') && !lf.includes('sans'))) {
      setFam.call(this, TITLE_FONT);
      this.setFontStyle('');
      return this;
    }
    return setFam.call(this, f);
  };
}

export function kitStyle(style?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.Types.GameObjects.Text.TextStyle {
  const s: Phaser.Types.GameObjects.Text.TextStyle = { ...(style ?? {}) };
  const fam = (s.fontFamily ?? '').toLowerCase();
  let title = fam.includes('lilita');
  if (fam.includes('georgia') || (fam.includes('serif') && !fam.includes('sans'))) {
    s.fontFamily = TITLE_FONT;
    s.fontStyle = '';
    title = true;
  } else if (!fam || fam.includes('system-ui')) {
    s.fontFamily = BODY_FONT;
  }
  const size = parseFloat(String(s.fontSize ?? '16')) || 16;
  const color = typeof s.color === 'string' ? s.color : '#ffffff';
  if (!s.stroke && !s.backgroundColor && brightness(color) > 0.5) {
    s.stroke = KIT.inkCss;
    s.strokeThickness = title ? strokeFor(size) : Math.max(2, Math.round(size / 7));
  }
  return s;
}
