// Q-TIP-BANNER: the Counter tip keeps off a showing Sensei banner (it used to land on it in 8 of 8 trials),
// and still never covers an action button or the top bar.
import { describe, expect, it } from 'vitest';
import { bannerKeepOut, senseiFloorY, tipSpot, type BannerAsk, type Box } from '../../../apps/client/src/ui/senseiPlace';

const over = (a: Box, b: Box) => a.x1 > b.x0 && a.x0 < b.x1 && a.y1 > b.y0 && a.y0 < b.y1;
const pad = (b: Box, p: number): Box => ({ x0: b.x0 - p, x1: b.x1 + p, y0: b.y0 - p, y1: b.y1 + p });

/** Button boxes at a view size, laid out like ActionButtons (Counter bottom right, Strike, Dash, Virtue, Stance), +12 as the tip pads them. */
function buttons(W: number, H: number): Box[] {
  const cx = W - 60, cy = H - 70;
  return [
    { x0: cx - 55, x1: cx + 55, y0: cy - 55, y1: cy + 55 },
    { x0: cx - 170, x1: cx - 100, y0: cy - 50, y1: cy + 30 },
    { x0: cx - 40, x1: cx + 40, y0: cy - 150, y1: cy - 80 },
    { x0: cx - 170, x1: cx - 110, y0: cy - 150, y1: cy - 90 },
    { x0: cx - 300, x1: cx - 240, y0: cy - 40, y1: cy + 40 },
  ].map((b) => pad(b, 12));
}

/** Where the tip lands, as placeCounterTip asks: the HUD, buttons and (when up) the banner are keep-outs. */
function spotFor(W: number, H: number, hero: Box, tip: { w: number; h: number }, banner: Box | null) {
  const floor = senseiFloorY(51);
  const bar = { x0: 0, x1: W, y0: 0, y1: 51 };
  const a: BannerAsk = {
    viewW: W, viewH: H, floor, home: floor, w: tip.w, h: tip.h, x: 8 + tip.w / 2, y: floor,
    players: [hero], buttons: [bar, ...buttons(W, H)], others: [],
  };
  const s = tipSpot(a, banner);
  return { s, box: s && { x0: s.x - tip.w / 2, x1: s.x + tip.w / 2, y0: s.y, y1: s.y + tip.h }, a };
}

// The Tester's setup: 2 phone sizes x 2 tip/banner pairs (x both orders, which the live shots cover: the tip re-places every frame). The banner sits at the floor, centred.
const pairs = [
  { tip: { w: 300, h: 58 }, banner: { w: 560, h: 44 } },
  { tip: { w: 300, h: 84 }, banner: { w: 420, h: 90 } },
];

describe('Q-TIP-BANNER: Counter tip vs Sensei banner', () => {
  for (const [W, H] of [[667, 375], [844, 390]]) {
    for (const [i, p] of pairs.entries()) {
      {
        it(`${W}x${H} pair ${i + 1}: tip shown at every hero spot, 0 px² on the banner, off every button, under the top bar`, () => {
          const bw = Math.min(p.banner.w, W - 48);
          const banner = bannerKeepOut({ x: W / 2, y: senseiFloorY(51), width: bw, height: p.banner.h });
          for (let hx = 20; hx < W - 100; hx += 23) {
            for (let hy = 60; hy < H - 100; hy += 19) {
              const hero = { x0: hx, x1: hx + 80, y0: hy, y1: hy + 100 };
              const { s, box, a } = spotFor(W, H, hero, p.tip, banner);
              expect(s).not.toBeNull(); // shown at every hero spot: over the hero if need be, never over the banner or a button
              expect(over(box!, banner)).toBe(false);
              expect(buttons(W, H).some((b) => over(box!, b))).toBe(false);
              expect(box!.y0).toBeGreaterThanOrEqual(a.floor);
            }
          }
        });
      }
    }
  }

  it('with no banner showing, the tip lands where it did before (the floor, at the left)', () => {
    const { box } = spotFor(667, 375, { x0: 400, x1: 480, y0: 200, y1: 300 }, pairs[0].tip, null);
    expect(box).toEqual({ x0: 8, x1: 308, y0: 57, y1: 115 });
  });

  it('the banner box is its top-centre bounds plus 6 px', () => {
    expect(bannerKeepOut({ x: 300, y: 57, width: 200, height: 40 })).toEqual({ x0: 194, x1: 406, y0: 51, y1: 103 });
  });
});
