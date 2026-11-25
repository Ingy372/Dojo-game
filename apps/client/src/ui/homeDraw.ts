// Small drawing and layout helpers for the Home Dojo screens (wood frames, code-drawn icons, the kata step
// arrows, text wrapping; the pure layout rules are in homeLayout.ts). Moved out of HomeScene.ts (Nov 24 night) with no change to what they draw.
import Phaser from 'phaser';
import type { GearSlot } from '@dojo/sim';
import { BOARD, KATA_INK, RADIUS, TROPHY_UI } from './tokens';
import { WOOD } from './theme';
import type { KeyStore } from './lastRun';

/**
 * P-MENU2-a: the mood-A panel frame drawn in code (no art file): a warm wood border with a
 * little grain, a dark inner board and a thin paper line inside.
 */
export function woodFrame(scene: Phaser.Scene, x: number, y: number, w: number, h: number): Phaser.GameObjects.Graphics {
  const f = BOARD.frame;
  const g = scene.add.graphics();
  g.fillStyle(WOOD.frameDark).fillRoundedRect(x - 1, y - 1, w + 2, h + 2, RADIUS.panel + 1);
  g.fillStyle(WOOD.frame).fillRoundedRect(x, y, w, h, RADIUS.panel);
  g.lineStyle(1, WOOD.grain, 0.5);
  for (let gy = y + 2; gy < y + h - 2; gy += 9) {
    g.lineBetween(x + 2, gy, x + f - 1, gy + 3);
    g.lineBetween(x + w - f + 1, gy + 4, x + w - 2, gy + 1);
  }
  for (let gx = x + 12; gx < x + w - 12; gx += 23) {
    g.lineBetween(gx, y + 2, gx + 14, y + f - 2);
    g.lineBetween(gx + 6, y + h - f + 2, gx + 20, y + h - 2);
  }
  g.fillStyle(WOOD.inner, 0.92).fillRoundedRect(x + f, y + f, w - 2 * f, h - 2 * f, RADIUS.panel - 4);
  g.lineStyle(1, WOOD.paper, 0.3).strokeRoundedRect(x + f + 2, y + f + 2, w - 2 * f - 4, h - 2 * f - 4, RADIUS.panel - 5);
  return g;
}

/** P-MENU-d: a faint bag drawn in code (no art file): body, flap and drawstring. */
export function bagIcon(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y }).setAlpha(0.35);
  g.fillStyle(0x8a7a5c).fillRoundedRect(-18, -10, 36, 30, 10);
  g.fillStyle(0x6b5d45).fillRoundedRect(-12, -18, 24, 12, 5);
  g.lineStyle(2, 0xd8c8a0).lineBetween(-12, -8, 12, -8);
  g.lineStyle(2, 0xd8c8a0).strokeCircle(0, -22, 4);
  return g;
}

/** P-MENU2-g: localStorage, or null in private mode. */
export function safeStore(): KeyStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** P-MENU2-g: a small house drawn in code (a dojo piece in the Found strip). */
export function houseIcon(scene: Phaser.Scene, x: number, y: number, size: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const h = size / 2;
  g.fillStyle(0xc0392b).fillTriangle(-h, -h * 0.1, h, -h * 0.1, 0, -h);
  g.fillStyle(0xffd166).fillRect(-h * 0.7, -h * 0.1, h * 1.4, h * 1.1);
  g.fillStyle(0x3a2618).fillRect(-h * 0.2, h * 0.35, h * 0.4, h * 0.65);
  return g;
}

/** Belt name color that stays readable on the dark floor (black belt text is lightened). */
export function beltTextColor(color: string): string {
  const c = Phaser.Display.Color.HexStringToColor(color);
  return c.red + c.green + c.blue < 120 ? '#b9ad99' : color;
}

/** A thick arrow about 14 points long centred on (cx, cy). */
export function drawArrow(g: Phaser.GameObjects.Graphics, cx: number, cy: number, d: 'up' | 'down' | 'left' | 'right', color: number = KATA_INK.onDark.arrow): void {
  const r = 7;
  const [dx, dy] = d === 'up' ? [0, -1] : d === 'down' ? [0, 1] : d === 'left' ? [-1, 0] : [1, 0];
  const [px, py] = [-dy, dx];
  g.lineStyle(3, color, 1).lineBetween(cx - dx * r, cy - dy * r, cx + dx * (r - 4), cy + dy * (r - 4));
  g.fillStyle(color, 1).fillTriangle(cx + dx * r, cy + dy * r, cx + dx * (r - 6) + px * 5, cy + dy * (r - 6) + py * 5, cx + dx * (r - 6) - px * 5, cy + dy * (r - 6) - py * 5);
}

/** P-MENU2-f: a placeholder slot shape drawn in code: a fist (hands), a gi collar (gi) or a charm. */
export function slotGlyph(scene: Phaser.Scene, slot: GearSlot, x: number, y: number, size: number, color: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const s = size / 2;
  g.fillStyle(color, 1);
  if (slot === 'hands') {
    g.fillRoundedRect(-s * 0.8, -s * 0.5, s * 1.6, s * 1.2, s * 0.35);
    g.fillRoundedRect(-s * 0.8, -s * 0.9, s * 1.6, s * 0.5, s * 0.2);
  } else if (slot === 'gi') {
    g.fillTriangle(-s, -s * 0.7, -s * 0.15, -s * 0.7, -s * 0.15, s);
    g.fillTriangle(s, -s * 0.7, s * 0.15, -s * 0.7, s * 0.15, s);
    g.fillRect(-s, -s * 0.7, s * 0.35, s * 1.7);
    g.fillRect(s * 0.65, -s * 0.7, s * 0.35, s * 1.7);
  } else {
    g.fillTriangle(0, -s, s * 0.7, 0, -s * 0.7, 0);
    g.fillTriangle(0, s, s * 0.7, 0, -s * 0.7, 0);
    g.lineStyle(2, color, 1).lineBetween(0, -s, 0, -s * 1.15);
  }
  return g;
}

/**
 * Q-PREMIUM-2 M6: a trophy with no icon art yet (the katas) gets a code-drawn placeholder, a gold disc with an ink
 * star, never an empty circle. Same size as a real icon; art lands later.
 */
export function placeholderIcon(scene: Phaser.Scene, x: number, y: number, size: number, earned: boolean): Phaser.GameObjects.Container {
  const r = size / 2;
  return scene.add.container(x, y, [
    scene.add.circle(0, 0, r, earned ? 0xffd166 : WOOD.grain, earned ? 0.9 : 0.3),
    scene.add.star(0, 0, 5, r / 3.2, r / 1.5, earned ? 0x7a4a22 : 0x6b5440, earned ? 1 : 0.5).setStrokeStyle(1.5, 0x3a2618, earned ? 0.8 : 0.4),
  ]);
}

/** B-POLISH-2: the cubby wrap rules: 3 lines max, tight line gap, and a hyphenated word too wide
 * for the padded width breaks after its hyphen ("Self-" / "Defense #1"). */
export function wrapLikeCubby(txt: Phaser.GameObjects.Text, label: string, tw: number): Phaser.GameObjects.Text {
  txt.setLineSpacing(TROPHY_UI.cubbyLineGap).setMaxLines(TROPHY_UI.cubbyLines);
  if (txt.width > tw) txt.setText(label.replace(/-(?=\S)/g, '-\n'));
  return txt;
}

/**
 * R-STANCE-d1 QA: wrap a centred text to the narrowest width that keeps the same number of lines,
 * so the lines come out even and one word ("pick.") is never left alone on the last line.
 */
export function balanceWrap(t: Phaser.GameObjects.Text, maxW: number): void {
  t.setWordWrapWidth(maxW);
  const lines = t.getWrappedText().length;
  if (lines < 2) return;
  let lo = 1, hi = Math.ceil(maxW);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    t.setWordWrapWidth(mid);
    if (t.getWrappedText().length <= lines) hi = mid; else lo = mid + 1;
  }
  t.setWordWrapWidth(hi);
}
