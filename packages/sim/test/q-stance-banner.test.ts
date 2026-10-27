// Q-STANCE-BANNER: Sensei's banner never covers the Stance button (or any action button), stays under the
// top bar (+6) and keeps off the hero whenever there is room.
import { describe, expect, it } from 'vitest';
import { overArena, pickBannerSpot, senseiFloorY, type BannerAsk, type Box } from '../../../apps/client/src/ui/senseiPlace';

const over = (a: Box, b: Box) => a.x1 > b.x0 && a.x0 < b.x1 && a.y1 > b.y0 && a.y0 < b.y1;
const boxOf = (a: BannerAsk, s: { x: number; y: number }): Box => ({ x0: s.x - a.w / 2, x1: s.x + a.w / 2, y0: s.y, y1: s.y + a.h });
const pad = (b: Box, p = 8): Box => ({ x0: b.x0 - p, x1: b.x1 + p, y0: b.y0 - p, y1: b.y1 + p });

/** Button boxes at a view size, laid out like ActionButtons (Counter bottom right, Strike, Dash, Virtue, Stance). */
function buttons(W: number, H: number) {
  const cx = W - 60, cy = H - 70;
  const stance = { x0: cx - 300, x1: cx - 240, y0: cy - 40, y1: cy + 40 }; // with its name under it
  return {
    stance,
    all: [{ x0: cx - 55, x1: cx + 55, y0: cy - 55, y1: cy + 55 }, { x0: cx - 170, x1: cx - 100, y0: cy - 50, y1: cy + 30 }, { x0: cx - 40, x1: cx + 40, y0: cy - 150, y1: cy - 80 }, { x0: cx - 170, x1: cx - 110, y0: cy - 150, y1: cy - 90 }, stance].map((b) => pad(b)),
  };
}

function ask(W: number, H: number, hero: Box, w: number, h: number): BannerAsk {
  const floor = senseiFloorY(51);
  return { viewW: W, viewH: H, floor, home: Math.max(H * 0.2 - 22, floor), w, h, x: W / 2, y: floor, players: [hero], buttons: buttons(W, H).all, others: [] };
}

describe('Q-STANCE-BANNER: banner placement', () => {
  for (const [W, H] of [[667, 375], [844, 390]]) {
    it(`${W}x${H} Practice, hero up top: banner sits in the free space, off Stance, the hero and the top bar`, () => {
      const hero = { x0: W / 2 - 40, x1: W / 2 + 40, y0: 60, y1: 150 };
      const a = ask(W, H, hero, 300, 80);
      const s = pickBannerSpot(a)!;
      expect(s).not.toBeNull();
      const b = boxOf(a, s);
      expect(over(b, buttons(W, H).stance)).toBe(false);
      expect(a.buttons.some((x) => over(b, x))).toBe(false);
      expect(over(b, hero)).toBe(false);
      expect(b.y0).toBeGreaterThanOrEqual(51 + 6);
    });
  }

  it('never overlaps the Stance button box, over 5,000 random heroes and banner sizes', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    for (let i = 0; i < 5000; i++) {
      const [W, H] = rnd() < 0.5 ? [667, 375] : [844, 390];
      const hx = 20 + rnd() * (W - 140), hy = 60 + rnd() * (H - 160);
      const a = ask(W, H, { x0: hx, x1: hx + 80, y0: hy, y1: hy + 100 }, 200 + rnd() * 400, 40 + rnd() * 90);
      const s = pickBannerSpot(a) ?? overArena(a);
      const b = boxOf(a, s);
      expect(over(b, buttons(W, H).stance)).toBe(false);
      expect(b.y0).toBeGreaterThanOrEqual(a.floor);
    }
  });

  it('no room clear of the hero: null (so the caller shrinks), then over the arena, still off the buttons', () => {
    const W = 667, H = 375;
    const hero = { x0: 0, x1: W, y0: 57, y1: H }; // covers the whole arena
    const a = ask(W, H, hero, 420, 90);
    expect(pickBannerSpot(a)).toBeNull();
    const b = boxOf(a, overArena(a));
    expect(a.buttons.some((x) => over(b, x))).toBe(false);
  });
});
