import Phaser from 'phaser';
import { reducedMotion } from '../game/motion';

/**
 * Training Board overhaul (Jay, Nov 18: "the training board needs a complete visual overhaul. it is
 * lacking compared to everything else"). The board now wears the same look as the Equipment screen:
 * a deep violet night, glass panels with a soft edge, gold for what matters. Everything is drawn in
 * code (no art files), so it stays sharp at every size and costs nothing to download.
 */
export const GLASS = {
  bgTop: 0x2a2140,
  bgBottom: 0x0f0c16,
  panel: 0x1b1626,
  panelHi: 0x251e35,
  edge: 0x3d3456,
  edgeHi: 0x5b4f80,
  gold: 0xffc94d,
  goldDeep: 0xc98a1c,
  violet: 0x6b55c9,
  violetDim: 0x2e2740,
  /** Tiles and buttons inside the glass panels (the old wood colours' places). */
  tile: 0x3a3156,
  tileDark: 0x241d36,
  tileLine: 0x5a4f80,
  ink: '#f6efe2',
  soft: '#b9b0c8',
} as const;

/** The board's backdrop: a violet gradient, two soft pools of light, slow light rays and drifting motes. */
export function boardBackdrop(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const out: Phaser.GameObjects.GameObject[] = [];
  const bg = scene.add.graphics();
  bg.fillGradientStyle(GLASS.bgTop, GLASS.bgTop, GLASS.bgBottom, GLASS.bgBottom, 1).fillRect(0, 0, width, height);
  // Pools of light: warm behind the hero's column, cool behind the panel.
  for (let i = 6; i >= 1; i--) bg.fillStyle(0xffb35c, 0.018).fillCircle(width * 0.18, height * 0.42, height * (0.12 + i * 0.09));
  for (let i = 6; i >= 1; i--) bg.fillStyle(0x8f7bd6, 0.02).fillCircle(width * 0.7, height * 0.25, height * (0.15 + i * 0.1));
  out.push(bg);
  // Light rays from the top left, very faint.
  const rays = scene.add.graphics();
  for (let i = 0; i < 5; i++) {
    const x = width * (0.05 + i * 0.13);
    rays.fillStyle(0xffffff, 0.022).fillTriangle(x, -10, x + width * 0.05, -10, x + width * 0.28, height + 10);
  }
  out.push(rays);
  // Motes of dust that drift up through the light.
  const still = reducedMotion();
  for (let i = 0; i < 14; i++) {
    const x = ((i * 97) % 100) / 100 * width;
    const y = ((i * 61) % 100) / 100 * height;
    const mote = scene.add.circle(x, y, 1 + (i % 3) * 0.6, i % 4 === 0 ? 0xffd98a : 0xd8ccff, 0.35);
    out.push(mote);
    if (!still) scene.tweens.add({ targets: mote, y: y - 40 - (i % 5) * 10, alpha: 0, duration: 4200 + (i % 6) * 700, delay: i * 260, repeat: -1, ease: 'Sine.Out' });
  }
  return out;
}

/** A glass panel: a drop shadow, the dark fill, a lit top edge and a thin outline (gold when `gold`). */
export function glassPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, opts: { gold?: boolean; radius?: number; alpha?: number } = {}): Phaser.GameObjects.Graphics {
  const r = opts.radius ?? 14;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.35).fillRoundedRect(x + 2, y + 5, w, h, r);
  g.fillStyle(GLASS.panel, opts.alpha ?? 0.94).fillRoundedRect(x, y, w, h, r);
  // A lighter band across the top third: the glass catching the light.
  g.fillStyle(GLASS.panelHi, 0.55).fillRoundedRect(x + 2, y + 2, w - 4, Math.min(h * 0.32, 60), { tl: r - 2, tr: r - 2, bl: 0, br: 0 });
  g.lineStyle(2, opts.gold ? GLASS.goldDeep : GLASS.edge, 1).strokeRoundedRect(x, y, w, h, r);
  g.lineStyle(1, opts.gold ? GLASS.gold : GLASS.edgeHi, 0.35).strokeRoundedRect(x + 3, y + 3, w - 6, h - 6, r - 3);
  return g;
}

/** A spotlight and a round pedestal for a standing hero whose feet are at (cx, footY); `r` is the hero's size. */
export function heroPedestal(scene: Phaser.Scene, cx: number, footY: number, r: number, glowColor = 0xb9a6ff): Phaser.GameObjects.GameObject[] {
  const out: Phaser.GameObjects.GameObject[] = [];
  for (let i = 4; i >= 1; i--) out.push(scene.add.circle(cx, footY - r * 0.9, r * (0.8 + i * 0.38), 0x8f7bd6, 0.04));
  const glow = scene.add.circle(cx, footY - r * 0.9, r * 1.3, glowColor, 0.12);
  out.push(glow);
  out.push(scene.add.ellipse(cx, footY + r * 0.18, r * 3.1, r * 0.85, 0x000000, 0.4));
  out.push(scene.add.ellipse(cx, footY + r * 0.1, r * 2.7, r * 0.68, 0x4a3f68, 1).setStrokeStyle(2, 0x8f7bd6, 0.85));
  out.push(scene.add.ellipse(cx, footY + r * 0.02, r * 1.9, r * 0.38, 0x6a5c94, 0.6));
  if (!reducedMotion()) scene.tweens.add({ targets: glow, alpha: 0.24, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  return out;
}

/** A gold level badge: a round medal with the level number. */
export function levelBadge(scene: Phaser.Scene, cx: number, cy: number, r: number, level: number, font: string): Phaser.GameObjects.GameObject[] {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.35).fillCircle(cx + 1, cy + 3, r);
  g.fillStyle(GLASS.goldDeep, 1).fillCircle(cx, cy, r);
  g.fillStyle(GLASS.gold, 1).fillCircle(cx, cy - 1, r - 3);
  g.fillStyle(0xfff1c2, 0.6).fillEllipse(cx - r * 0.25, cy - r * 0.42, r * 0.9, r * 0.45);
  g.lineStyle(2, 0x8a5a14, 0.9).strokeCircle(cx, cy - 1, r - 3);
  const t = scene.add
    .text(cx, cy - 1, `${level}`, { fontFamily: font, fontStyle: 'bold', fontSize: `${Math.round(r * 1.05)}px`, color: '#4a2c08' })
    .setOrigin(0.5)
    .setResolution(Math.min(3, window.devicePixelRatio || 1) * 2);
  return [g, t];
}
