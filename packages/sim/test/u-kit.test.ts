// U-KIT (Jay, Nov 23): one premium look for every menu (Archero 2 / Survivor.io references). The kit lives in
// apps/client/src/ui/kit.ts; these checks keep every menu on it so screens can't drift apart again.
import { describe, expect, it } from 'vitest';

const files = import.meta.glob(['../../../apps/client/src/ui/*.ts', '../../../apps/client/src/scenes/*.ts', '../../../apps/client/src/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const raw = (p: string) => Object.entries(files).find(([k]) => k.endsWith(p))![1];

describe('U-KIT: one look for every menu', () => {
  const kit = raw('/ui/kit.ts');

  it('the kit has one outline colour, the four button tones and the rarity faces', () => {
    expect(kit).toMatch(/ink: 0x0d1233/);
    for (const t of ['gold', 'blue', 'green', 'red', 'purple', 'dim']) expect(kit).toMatch(new RegExp(`\\b${t}: \\{ hi: 0x`));
    for (const r of ['common', 'uncommon', 'rare', 'epic', 'legendary', 'locked']) expect(kit).toMatch(new RegExp(`\\b${r}: \\{ top: 0x`));
  });

  it('the two fonts are bundled (no outside font service) and waited for before the game starts', () => {
    const licence = Object.values(import.meta.glob('../../../apps/client/src/fonts/LICENSE-fonts.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)[0];
    expect(licence).toMatch(/lilita-one\.woff2/);
    expect(licence).toMatch(/SIL OPEN FONT LICENSE/i);
    const main = raw('/main.ts');
    expect(main).toMatch(/installKitText\(\);/);
    expect(main).toMatch(/document\.fonts\.load\("20px 'Lilita One'"\)/);
    expect(main.indexOf('installKitText();')).toBeLessThan(main.indexOf('new Phaser.Game('));
  });

  it('every button takes its colours from the kit tones', () => {
    const button = raw('/ui/button.ts');
    expect(button).toMatch(/const t = KIT_TONE\[toneOf\(o\.color\)\];/);
    expect(button).toMatch(/fontFamily: TITLE_FONT/);
  });

  it('the old serif titles become the kit title font everywhere (factory and setFontFamily)', () => {
    expect(kit).toMatch(/proto\.text = function/);
    expect(kit).toMatch(/tp\.setFontFamily = function/);
    expect(kit).toMatch(/s\.fontFamily = TITLE_FONT;/);
  });

  const menus: Array<[string, RegExp]> = [
    ['/scenes/HomeScene.ts', /kitBackdrop\(this, width, height\)/],
    ['/ui/shop.ts', /kitTabs\(scene/],
    ['/ui/kataPractice.ts', /kitRibbon\(s, width \/ 2, y0 - 16, 'Practice Kata'/],
    ['/ui/equipment.ts', /kitRibbon\(s, width \/ 2/],
    ['/ui/InsightPicker.ts', /kitRibbon\(scene/],
    ['/ui/Celebrations.ts', /kitBackdrop\(scene, width, height\)/],
    ['/ui/RunOverCard.ts', /kitCard\(scene/],
    ['/scenes/StreetSmartsScene.ts', /kitBackdrop\(this, width, height\)/],
    ['/scenes/CreateScene.ts', /drawPanel\(panel/],
    ['/scenes/TitleScene.ts', /kitBackdrop\(this/],
    ['/scenes/DojoScene.ts', /kitScreen\(this, width, height\)/],
  ];
  for (const [file, uses] of menus) {
    it(`${file} draws with the kit`, () => {
      const src = raw(file);
      expect(src).toMatch(/from '\.\.?\/(?:ui\/)?kit'/);
      expect(src).toMatch(uses);
    });
  }

  it('the retired looks are gone from the menus: no violet glass, no wood frame art, no cream-paper board', () => {
    const board = raw('/ui/boardTheme.ts');
    expect(board).toMatch(/return kitBackdrop\(scene, width, height\);/);
    expect(board).not.toMatch(/0x2a2140|0x6b55c9/);
    expect(raw('/scenes/HomeScene.ts')).not.toMatch(/0x1e1a14/);
    expect(raw('/ui/tokens.ts')).toMatch(/export const BOARD_PAPER = 0xeaf2ff;/);
  });
});
