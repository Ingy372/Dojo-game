// ZAPKITE-ZIGZAG (the #438 follow-up): the Zap Kite's zig-zag lane for the dash telegraph. The numbers live in
// incoming-art/dash-telegraph/source/zigzag.json; the baked layers in sprites/ must match them, and the art must stay
// purple and white (never red). The art is not imported into the game yet, so nothing in content/ or the client changes.
import { describe, expect, it } from 'vitest';
import data from '../../../incoming-art/dash-telegraph/source/zigzag.json';

// Each PNG as a base64 data URL (Vite's ?inline), so the header bytes arrive intact.
const PNGS = import.meta.glob('../../../incoming-art/dash-telegraph/sprites/dash-{lane,zigzag}_*.png', { query: '?inline', import: 'default', eager: true }) as Record<string, string>;
declare function atob(data: string): string; // a browser global; the sim package has no DOM types
const PX = 96; // sprite px per tile (2x the game's TILE = 48), same as the other dash shapes
const zz = data.zigzag;
const LAYERS = ['glow', 'fill', 'edge'] as const;

/** Reads the PNG header for the size; the pixels are decoded only where a test needs them. */
function pngSize(file: string): { w: number; h: number } {
  const url = Object.entries(PNGS).find(([k]) => k.endsWith(`/${file}`))?.[1];
  expect(url, file).toBeDefined();
  const b = Uint8Array.from(atob(url!.slice(url!.indexOf(',') + 1)), (c) => c.charCodeAt(0));
  expect(String.fromCharCode(b[1], b[2], b[3])).toBe('PNG');
  const u32 = (o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
  return { w: u32(16), h: u32(20) };
}

describe('Zap Kite zig-zag lane data', () => {
  it('has sane numbers: a lane longer than it is wide, a real swing, an even number of turns', () => {
    expect(zz.length).toBeGreaterThan(zz.width);
    expect(zz.width).toBeGreaterThan(0);
    expect(zz.amplitude).toBeGreaterThan(0);
    expect(zz.amplitude).toBeLessThan(zz.length / 2);
    expect(Number.isInteger(zz.turns) && zz.turns >= 2 && zz.turns % 2 === 0).toBe(true);
  });

  it('matches the draft Zap Kite: length = reach 3.0, width = 2 x areaRadius 0.6', () => {
    // drafts/content/enemies/zap-kite.json (reach 3.0, areaRadius 0.6). areaRadius is the lane's half-width in the sim,
    // so the full width is 1.2. Update both numbers here when the real enemy data differs.
    expect(zz.length).toBe(3.0);
    expect(zz.width).toBeCloseTo(2 * 0.6, 10);
  });
});

describe('Zap Kite zig-zag lane sprites', () => {
  it('has glow, fill and edge layers at the size the data asks for (whole tiles, margin around the lane): 384 x 288 px', () => {
    const w = Math.ceil(zz.length + 2 * zz.canvasMargin) * PX;
    const h = Math.ceil(2 * zz.amplitude + zz.width + 2 * zz.canvasMargin) * PX;
    expect({ w, h }).toEqual({ w: 4 * PX, h: 3 * PX });
    for (const l of LAYERS) expect(pngSize(`dash-zigzag_${l}.png`), l).toEqual({ w, h });
  });

  it('keeps the same layer names as the straight lane, so the game draws it the same way', () => {
    for (const l of LAYERS) {
      expect(pngSize(`dash-lane_${l}.png`).w).toBeGreaterThan(0);
      expect(pngSize(`dash-zigzag_${l}.png`).w).toBeGreaterThan(0);
    }
  });
});
