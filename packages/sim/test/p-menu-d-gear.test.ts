import { describe, expect, it } from 'vitest';
import { GEAR, MIN_TAP, MOTION, gearGrid, pageDots } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const gear = src.slice(src.indexOf('private renderGear('), src.indexOf('private pick('));
const sheet = src.slice(src.indexOf('private renderSheet('), src.indexOf('private pick('));

describe('P-MENU-d Gear tab', () => {
  it('grid depends only on space, never on a pick (no detail strip)', () => {
    expect(gearGrid.length).toBeLessThanOrEqual(2);
    expect(gear).not.toMatch(/detailH/);
    const pre = gear.slice(0, gear.indexOf('gearGrid('));
    expect(pre).not.toMatch(/this\.selected/);
    for (const h of [150, 200, 300]) expect(gearGrid(h)).toEqual(gearGrid(h));
  });
  it('gear cards and pager use the shared button() at >= 44', () => {
    expect(GEAR.cardH).toBeGreaterThanOrEqual(MIN_TAP);
    expect(GEAR.arrowW).toBeGreaterThanOrEqual(MIN_TAP);
    expect(GEAR.pagerH).toBeGreaterThanOrEqual(MIN_TAP);
    expect(gear).toMatch(/button\(this, \{ x: bx, y: by, w: cardW, h: GEAR\.cardH/);
    expect(gear.slice(0, gear.indexOf('private renderSheet('))).not.toMatch(/setInteractive/);
    expect(sheet.match(/h: 44/g)!.length).toBeGreaterThanOrEqual(4);
  });
  it('one dot per page, falls back to text when too many', () => {
    expect(pageDots(1, 200)).toBeNull();
    const d = pageDots(17, 240)!;
    expect(d).not.toBeNull();
    const last = d.x0 + 16 * d.step;
    expect(last + GEAR.dot / 2).toBeLessThanOrEqual(240);
    expect(pageDots(40, 200)).toBeNull();
    expect(gear).toMatch(/`\$\{this\.page \+ 1\} \/ \$\{pages\}`/);
  });
  it('slide-on does not pick: cards act through button() (press must start on it)', () => {
    const btn = Object.values(import.meta.glob(['../../../apps/client/src/ui/button.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
    expect(btn).toMatch(/POINTER_DOWN/);
    expect(gear).not.toMatch(/POINTER_UP, \(\) => this\.pick/);
  });
  it('Let go needs a confirm in the sheet', () => {
    expect(sheet).toMatch(/Let it go\?/);
    expect(sheet).toMatch(/label: 'Yes'/);
    expect(sheet).toMatch(/label: 'Keep'/);
    expect(src).toMatch(/private letGo[\s\S]*?confirmLetGo/);
  });
  it('sheet never covers the picked card; reduced motion leaves only a fade', () => {
    expect(sheet).toMatch(/atTop = pickedBottom > bottom - sh/);
    expect(sheet).toMatch(/rm \? MOTION\.reducedFade\.ms : MOTION\.sheet\.ms/);
    expect(sheet).toMatch(/setY\(rm \? 0/);
    const wear = src.slice(src.indexOf('private wear('), src.indexOf('private wear(') + 1400);
    expect(wear).toMatch(/if \(!slot \|\| reducedMotion\(\)\) return;/);
    expect(MOTION.sheet.ms).toBe(220);
  });
});
