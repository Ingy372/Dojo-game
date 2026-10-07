// Placeholder drawings for Home Dojo decorations and mess (simple shapes until the art pack).

import Phaser from 'phaser';
import type { DecorationDef, DojoItem, MessSpot } from '@dojo/sim';
import { hex } from './belt';

const OUTLINE = 0x14121c;

/** Draws a decoration with its top-left corner at (x, y). `t` is the tile size in pixels. */
export function drawDecoration(g: Phaser.GameObjects.Graphics, def: DecorationDef, item: DojoItem | null, x: number, y: number, t: number): void {
  const w = def.width * t;
  const h = def.height * t;
  const c = hex(def.color);
  const light = Phaser.Display.Color.IntegerToColor(c).lighten(18).color;
  const dark = Phaser.Display.Color.IntegerToColor(c).darken(22).color;
  const cx = x + w / 2;
  const cy = y + h / 2;
  switch (def.shape) {
    case 'mat': {
      g.fillStyle(dark).fillRoundedRect(x + 3, y + 3, w - 6, h - 6, 6);
      g.fillStyle(c).fillRoundedRect(x + 7, y + 7, w - 14, h - 14, 4);
      g.lineStyle(2, light, 0.6).strokeRoundedRect(x + 7, y + 7, w - 14, h - 14, 4);
      if (item?.scuffed) {
        // Scuff marks, fewer as the mat is wiped.
        const left = 5 - Math.round((item.wipes / 4) * 4);
        const seed = Number(item.uid.slice(1)) || 1;
        for (let i = 0; i < left; i++) {
          const sx = x + 12 + ((seed * 37 + i * 53) % Math.max(1, w - 24));
          const sy = y + 12 + ((seed * 17 + i * 71) % Math.max(1, h - 24));
          g.fillStyle(0x5a4632, 0.55).fillEllipse(sx, sy, t * 0.42, t * 0.16);
        }
      }
      break;
    }
    case 'rack': {
      g.fillStyle(dark).fillRect(x + 4, y + h * 0.25, w - 8, h * 0.5);
      g.fillStyle(c).fillRect(x + 4, y + h * 0.3, w - 8, h * 0.12);
      g.fillStyle(c).fillRect(x + 4, y + h * 0.58, w - 8, h * 0.12);
      g.lineStyle(2, OUTLINE).strokeRect(x + 4, y + h * 0.25, w - 8, h * 0.5);
      const weapons = 3;
      const crooked = item?.crooked ?? 0;
      for (let i = 0; i < weapons; i++) {
        const wx = x + (w * (i + 1)) / (weapons + 1);
        const tilt = i < crooked ? (i % 2 === 0 ? 0.45 : -0.4) : 0;
        const len = h * 0.95;
        const dx = Math.sin(tilt) * len * 0.5;
        const dy = Math.cos(tilt) * len * 0.5;
        g.lineStyle(5, 0xd9b77a).lineBetween(wx - dx, cy - dy, wx + dx, cy + dy);
        g.lineStyle(1.5, OUTLINE, 0.6).lineBetween(wx - dx, cy - dy, wx + dx, cy + dy);
      }
      break;
    }
    case 'banner': {
      g.fillStyle(0x3b2f27).fillRect(x + 6, y + 6, w - 12, 4);
      g.fillStyle(c).fillRect(x + 10, y + 9, w - 20, h - 12);
      g.fillTriangle(x + 10, y + h - 3, x + w / 2, y + h - 12, x + w - 10, y + h - 3);
      g.fillStyle(0xffd166).fillCircle(cx, y + h * 0.42, t * 0.14);
      break;
    }
    case 'scroll': {
      g.fillStyle(0x6b4a2b).fillRect(x + 8, y + 6, w - 16, 4);
      g.fillStyle(c).fillRect(x + 11, y + 9, w - 22, h - 15);
      g.fillStyle(0x6b4a2b).fillRect(x + 8, y + h - 8, w - 16, 4);
      g.lineStyle(3, 0x222222, 0.8);
      g.lineBetween(cx, y + 14, cx, y + h * 0.42);
      g.lineBetween(cx - 5, y + h * 0.5, cx + 4, y + h * 0.62);
      break;
    }
    case 'bag': {
      g.lineStyle(2, 0x888888).lineBetween(cx, y + 2, cx, cy - t * 0.3);
      g.fillStyle(c).fillCircle(cx, cy, t * 0.34);
      g.lineStyle(3, OUTLINE).strokeCircle(cx, cy, t * 0.34);
      g.fillStyle(light).fillCircle(cx - t * 0.1, cy - t * 0.1, t * 0.08);
      break;
    }
    case 'lantern': {
      g.fillStyle(dark).fillRect(cx - t * 0.3, cy - t * 0.3, t * 0.6, t * 0.6);
      g.fillStyle(c).fillRect(cx - t * 0.22, cy - t * 0.22, t * 0.44, t * 0.44);
      g.fillStyle(0xffd166, 0.9).fillCircle(cx, cy, t * 0.12);
      g.lineStyle(2, OUTLINE).strokeRect(cx - t * 0.3, cy - t * 0.3, t * 0.6, t * 0.6);
      break;
    }
    case 'plant': {
      g.fillStyle(0x7a4a2a).fillRect(cx - t * 0.24, cy + t * 0.05, t * 0.48, t * 0.3);
      g.fillStyle(c).fillCircle(cx - t * 0.14, cy - t * 0.05, t * 0.18);
      g.fillStyle(light).fillCircle(cx + t * 0.12, cy - t * 0.12, t * 0.2);
      g.fillStyle(c).fillCircle(cx + t * 0.02, cy - t * 0.25, t * 0.14);
      break;
    }
    case 'bamboo': {
      g.fillStyle(0x7a4a2a).fillCircle(cx, cy + t * 0.12, t * 0.28);
      for (const [ox, oy] of [[-0.12, -0.05], [0.06, -0.15], [0.14, 0.05]]) {
        g.fillStyle(c).fillCircle(cx + ox * t, cy + oy * t, t * 0.1);
        g.lineStyle(2, dark).strokeCircle(cx + ox * t, cy + oy * t, t * 0.1);
      }
      break;
    }
    case 'drum': {
      g.fillStyle(c).fillCircle(cx, cy, t * 0.38);
      g.fillStyle(0xe8d9b5).fillCircle(cx, cy, t * 0.28);
      g.lineStyle(3, OUTLINE).strokeCircle(cx, cy, t * 0.38);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.fillStyle(0x222222).fillCircle(cx + Math.cos(a) * t * 0.33, cy + Math.sin(a) * t * 0.33, 1.6);
      }
      break;
    }
    case 'bench': {
      g.fillStyle(dark).fillRect(x + 4, y + h * 0.22, w - 8, h * 0.56);
      g.fillStyle(c).fillRect(x + 4, y + h * 0.22, w - 8, h * 0.24);
      g.fillStyle(light).fillRect(x + 4, y + h * 0.5, w - 8, h * 0.2);
      g.lineStyle(2, OUTLINE).strokeRect(x + 4, y + h * 0.22, w - 8, h * 0.56);
      break;
    }
    default:
      g.fillStyle(c).fillRect(x + 6, y + 6, w - 12, h - 12);
      g.lineStyle(2, OUTLINE).strokeRect(x + 6, y + 6, w - 12, h - 12);
  }
}

/** Draws a bit of dust or a fallen leaf. */
export function drawSpot(g: Phaser.GameObjects.Graphics, s: MessSpot, t: number): void {
  const x = (s.col + 0.5 + s.dx) * t;
  const y = (s.row + 0.5 + s.dy) * t;
  if (s.kind === 'leaf') {
    const color = s.id % 2 === 0 ? 0xd98b3a : 0xc9a43a;
    g.fillStyle(color, 0.95).fillEllipse(x, y, t * 0.32, t * 0.16);
    g.lineStyle(1.5, 0x7a4a1a, 0.8).lineBetween(x - t * 0.14, y, x + t * 0.14, y);
  } else {
    g.fillStyle(0x8a7f6e, 0.55).fillCircle(x, y, t * 0.17);
    g.fillStyle(0x9b917f, 0.5).fillCircle(x + t * 0.12, y + t * 0.06, t * 0.1);
    g.fillStyle(0x7a705f, 0.5).fillCircle(x - t * 0.1, y + t * 0.08, t * 0.08);
  }
}
