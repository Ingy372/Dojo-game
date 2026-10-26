import { describe, expect, it } from 'vitest';
import { GEAR, MIN_TAP, MOTION, gearGrid, pageDots } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const gear = src.slice(src.indexOf('private renderGear('), src.indexOf('private pick('));
const sheet = src.slice(src.indexOf('private renderSheet('), src.indexOf('private pick('));

describe('P-MENU-d Gear tab', () => {
  it('grid depends only on space, never on a pick (no detail strip)', () => {
    // P-MENU2-f: the grid now comes from gearBoardLayout(w, h) (ui/gearBoard.ts), still space only.
    expect(gearGrid.length).toBeLessThanOrEqual(2);
    expect(gear).not.toMatch(/detailH/);
    expect(gear).toMatch(/const L = gearBoardLayout\(w, h, tileWForLabel\(widest\)(?: \+ legendGrow)?\);/);
    const pre = gear.slice(0, gear.indexOf('gearBoardLayout('));
    expect(pre).not.toMatch(/this\.selected/);
    for (const h of [150, 200, 300]) expect(gearGrid(h)).toEqual(gearGrid(h));
  });
  it('gear cards and pager use the shared button() at >= 44', () => {
    expect(GEAR.cardH).toBeGreaterThanOrEqual(MIN_TAP);
    expect(GEAR.arrowW).toBeGreaterThanOrEqual(MIN_TAP);
    expect(GEAR.pagerH).toBeGreaterThanOrEqual(MIN_TAP);
    // P-MENU2-f: tiles are button()s at tileBox size (≥44, checked in p-menu2-f-gear); sheet buttons use wearH (52) / MIN_TAP.
    expect(gear).toMatch(/button\(this, \{ x: tx, y: ty, w: box\.w, h: box\.h/);
    expect(gear.slice(0, gear.indexOf('private renderSheet('))).not.toMatch(/setInteractive/);
    expect(sheet.match(/h: bh/g)!.length).toBeGreaterThanOrEqual(4);
  });
  it('worn gear lives on the doll rings, so the grid y never moves after Wear', () => {
    // P-MENU2-f: the worn row became rings on the paper doll, beside (not above) the grid.
    expect(gear).toMatch(/const gridY = |L\.gridY/);
    expect(gear).not.toMatch(/boxH = Math\.max/);
  });
  it('one dot per page, falls back to text when too many', () => {
    expect(pageDots(1, 200)).toBeNull();
    const d = pageDots(17, 240)!;
    expect(d).not.toBeNull();
    const last = d.x0 + 16 * d.step;
    expect(last + GEAR.dot / 2).toBeLessThanOrEqual(240);
    expect(pageDots(40, 200)).toBeNull();
    // P-MENU2-f: the bag pages with the Trophy Case ◀ dots ▶ (which already falls back cleanly).
    expect(gear).toMatch(/this\.trophyPager\(gx, y \+ L\.pagerY, L\.gridW, pages\)/);
  });
  it('slide-on does not pick: cards act through button() (press must start on it)', () => {
    const btn = Object.values(import.meta.glob(['../../../apps/client/src/ui/button.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
    expect(btn).toMatch(/POINTER_DOWN/);
    expect(gear).not.toMatch(/POINTER_UP, \(\) => this\.pick/);
  });
  it('Let go needs a confirm in the sheet', () => {
    // P-MENU2-f: words moved to content/loot/gear-board.json.
    expect(sheet).toMatch(/W\.letGoAsk/);
    expect(sheet).toMatch(/label: W\.yes/);
    expect(sheet).toMatch(/label: W\.keep/);
    expect(src).toMatch(/private letGo[\s\S]*?confirmLetGo/);
  });
  it('sheet never covers the picked card; reduced motion leaves only a fade', () => {
    expect(sheet).toMatch(/atTop = pickedBottom > bottom - sh/);
    expect(sheet).toMatch(/rm \? MOTION\.reducedFade\.ms : MOTION\.sheet\.ms/);
    expect(sheet).toMatch(/setY\(rm \? 0/);
    const wear = src.slice(src.indexOf('private wear('), src.indexOf('private wear(') + 1400);
    expect(wear).toMatch(/if \(!ring \|\| !from \|\| reducedMotion\(\)\) return;/);
    expect(MOTION.sheet.ms).toBe(220);
  });
});
