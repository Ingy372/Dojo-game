// ZAPKITE-ZIGZAG (the #438 follow-up): the Zap Kite's zig-zag lane for the dash telegraph. The numbers live in
// incoming-art/dash-telegraph/source/zigzag.json; the baked layers in sprites/ must match them, and the art must stay
// purple and white (never red). The art is not imported into the game yet, so nothing in content/ or the client changes.
import { describe, expect, it } from 'vitest';
import data from '../../../incoming-art/dash-telegraph/source/zigzag.json';

// Each PNG as a base64 data URL (Vite's ?inline), so the header bytes arrive intact.
const PNGS = import.meta.glob('../../../incoming-art/dash-telegraph/sprites/dash-{lane,zigzag}_*.png', { query: '?inline', import: 'default', eager: true }) as Record<string, string>;
declare function atob(data: string): string; // a browser global; the sim package has no DOM types
declare const process: { getBuiltinModule(id: string): unknown }; // Node 22; the sim package has no Node types either
const { inflateSync } = process.getBuiltinModule('node:zlib') as { inflateSync(data: Uint8Array): Uint8Array };
const PX = 96; // sprite px per tile (2x the game's TILE = 48), same as the other dash shapes
const zz = data.zigzag;
const LAYERS = ['glow', 'fill', 'edge'] as const;

/** Decodes a PNG (8-bit RGBA, not interlaced, as PIL writes it) to its width, height and RGBA bytes. */
function decodePng(file: string): { w: number; h: number; px: Uint8Array } {
  const url = Object.entries(PNGS).find(([k]) => k.endsWith(`/${file}`))?.[1];
  expect(url, file).toBeDefined();
  const b = Uint8Array.from(atob(url!.slice(url!.indexOf(',') + 1)), (c) => c.charCodeAt(0));
  expect(String.fromCharCode(b[1], b[2], b[3])).toBe('PNG');
  const u32 = (o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
  const w = u32(16), h = u32(20);
  expect([b[24], b[25], b[28]], `${file}: 8-bit RGBA, not interlaced`).toEqual([8, 6, 0]);
  const parts: Uint8Array[] = [];
  for (let o = 8; o < b.length; ) {
    const len = u32(o), type = String.fromCharCode(b[o + 4], b[o + 5], b[o + 6], b[o + 7]);
    if (type === 'IDAT') parts.push(b.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  const raw = inflateSync(Uint8Array.from(parts.flatMap((p) => Array.from(p))));
  const stride = w * 4, px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = y * stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[y * (stride + 1) + 1 + i];
      const a = i >= 4 ? px[row + i - 4] : 0, up = y > 0 ? px[row - stride + i] : 0, c = i >= 4 && y > 0 ? px[row - stride + i - 4] : 0;
      const pa = Math.abs(up - c), pb = Math.abs(a - c), pc = Math.abs(a + up - 2 * c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
      px[row + i] = (x + (f === 1 ? a : f === 2 ? up : f === 3 ? (a + up) >> 1 : f === 4 ? paeth : 0)) & 255;
    }
  }
  return { w, h, px };
}
const pngSize = (file: string) => { const { w, h } = decodePng(file); return { w, h }; };

/** Every visible pixel of a layer (alpha >= 64 of 255; below that is the resize's faint anti-aliasing fringe), as tile offsets from the canvas middle (+x along the lane, +y across it). */
function visible(file: string): { x: number; y: number }[] {
  const { w, h, px } = decodePng(file);
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] >= 64) out.push({ x: (x + 0.5 - w / 2) / PX, y: (y + 0.5 - h / 2) / PX });
  return out;
}

describe('Zap Kite zig-zag lane data', () => {
  it('has sane numbers: a lane longer than it is wide, a real swing, an even number of turns', () => {
    expect(zz.length).toBeGreaterThan(zz.width);
    expect(zz.width).toBeGreaterThan(0);
    expect(zz.strokeWidth).toBeGreaterThan(0);
    expect(zz.strokeWidth).toBeLessThan(zz.width);
    expect(zz.amplitude).toBeGreaterThan(0);
    expect(Number.isInteger(zz.turns) && zz.turns >= 2 && zz.turns % 2 === 0).toBe(true);
  });

  it('is the true hit capsule of the draft Zap Kite: 4.2 long (reach 3.0 + areaRadius 0.6 at each end) and 1.2 wide (2 x areaRadius)', () => {
    // drafts/content/enemies/zap-kite.json (reach 3.0, areaRadius 0.6). The sim treats a dash-only attack as every point
    // within areaRadius of the segment from the enemy to enemy + reach. Update these numbers when the real enemy data differs.
    expect(zz.reach).toBe(3.0);
    expect(zz.areaRadius).toBeCloseTo(0.6, 10);
    expect(zz.length).toBeCloseTo(zz.reach + 2 * zz.areaRadius, 10);
    expect(zz.length).toBeCloseTo(4.2, 10);
    expect(zz.width).toBeCloseTo(2 * zz.areaRadius, 10);
    expect(zz.width).toBeCloseTo(1.2, 10);
  });
});

describe('Zap Kite zig-zag lane sprites', () => {
  it('has glow, fill and edge layers at the size the data asks for (whole tiles, margin around the lane): 576 x 288 px', () => {
    const w = Math.ceil(zz.length + 2 * zz.canvasMargin) * PX;
    const h = Math.ceil(zz.width + 2 * zz.canvasMargin) * PX; // the drawn path never leaves 'width', so the swing adds nothing
    expect({ w, h }).toEqual({ w: 6 * PX, h: 3 * PX });
    for (const l of LAYERS) expect(pngSize(`dash-zigzag_${l}.png`), l).toEqual({ w, h });
  });

  it('keeps the same layer names as the straight lane, so the game draws it the same way', () => {
    for (const l of LAYERS) {
      expect(pngSize(`dash-lane_${l}.png`).w).toBeGreaterThan(0);
      expect(pngSize(`dash-zigzag_${l}.png`).w).toBeGreaterThan(0);
    }
  });

  // The hit capsule: every point within areaRadius of the segment (-reach/2, 0) to (+reach/2, 0), the lane's middle at 0.
  const capDist = (p: { x: number; y: number }) => Math.hypot(p.x - Math.max(-zz.reach / 2, Math.min(zz.reach / 2, p.x)), p.y);
  const TOL = 1.5 / PX; // the baked edge is anti-aliased by about a pixel

  it('keeps the whole drawn path (fill, stroke and outline) inside the 1.2 wide, 4.2 long hit capsule', () => {
    for (const l of ['fill', 'edge'] as const) {
      const pts = visible(`dash-zigzag_${l}.png`);
      expect(pts.length, l).toBeGreaterThan(0);
      const worst = Math.max(...pts.map(capDist));
      expect(worst, `${l}: furthest drawn pixel from the capsule's centre line, tiles`).toBeLessThanOrEqual(zz.areaRadius + TOL);
    }
  });

  it('really zig-zags and fills the lane: the swing reaches both sides and the path runs the full 4.2', () => {
    const pts = visible('dash-zigzag_edge.png');
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    expect(Math.max(...ys)).toBeGreaterThan(zz.width / 2 - 0.1); // swings to the bottom side
    expect(Math.min(...ys)).toBeLessThan(-(zz.width / 2 - 0.1)); // and to the top side
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(zz.length - 0.2);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThanOrEqual(zz.length + 2 * TOL);
  });

  it('stays purple and white: no pixel is red-dominant (red is for the Counter circle only)', () => {
    for (const l of LAYERS) {
      const { w, h, px } = decodePng(`dash-zigzag_${l}.png`);
      for (let i = 0; i < w * h; i++) {
        const [r, g, b, a] = [px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]];
        if (a > 0) expect(r > g + 40 && r > b + 40, `${l} pixel ${i}`).toBe(false);
      }
    }
  });
});
