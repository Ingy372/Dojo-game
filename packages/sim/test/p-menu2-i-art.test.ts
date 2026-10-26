// P-MENU2-i: the menu2 art for Trophies, Gear and Last run. Every frame the client asks for is
// imported, a missing frame means the code-drawn version, and My Style's art stays out.
import { describe, expect, it } from 'vitest';
import { MENU2_ALL, MENU2_FRAMES, MENU2_PACK, artRarity, pickUi, type UiPack } from '../../../apps/client/src/art/menu2Frames';
import source from '../../../incoming-art/menu2/sprites/menu2.json';
import legendary from '../../../incoming-art/legendary-frame/sprites/legendary.json';
import packed from '../../../assets/art/menu2.json';
import approved from '../../../tools/art-import/approved.json';

const raw = (glob: Record<string, unknown>) => Object.values(glob)[0] as string;
const home = raw(import.meta.glob('../../../apps/client/src/scenes/HomeScene.ts', { query: '?raw', import: 'default', eager: true }));
const helpers = raw(import.meta.glob('../../../apps/client/src/art/menu2.ts', { query: '?raw', import: 'default', eager: true }));
const pack = packed as unknown as UiPack;
// Quoted frame names only (a comment saying "switch-off wood" is about a colour, not art).
const MY_STYLE = /['"`](?:slot-card|tray-tile|tray-equipped-badge|switch-|glyph-)/;

describe('P-MENU2-i menu2 art', () => {
  it('every frame the client uses is in the source sheet and the packed menu2.json', () => {
    const src = [source, legendary].flatMap((d) => Object.keys((d as { sprites: Record<string, unknown> }).sprites));
    const out = Object.keys(pack.entries[MENU2_PACK].sprites!);
    for (const n of MENU2_ALL) {
      expect(src, n).toContain(n);
      expect(out, n).toContain(n);
    }
    expect(new Set(MENU2_ALL).size).toBe(MENU2_ALL.length);
  });

  it('the importer brings in exactly the client frames', () => {
    const p = (approved as unknown as { packs: Record<string, { sources: { only: string[] }[] }> }).packs[MENU2_PACK];
    expect([...p.sources[0].only].sort()).toEqual([...MENU2_ALL].sort());
  });

  it('every frame named in HomeScene is in MENU2_FRAMES', () => {
    const named = [...home.matchAll(/menu2(?:Image|Slice)\(this, '([a-z0-9-]+)'/g)].map((m) => m[1]);
    expect(named.length).toBeGreaterThan(5);
    for (const n of named) expect(MENU2_ALL, n).toContain(n);
  });

  it('a missing frame, page or pack gives null (the code-drawn fallback)', () => {
    const loaded = () => true;
    expect(pickUi(pack, 'stat-tile', loaded)).not.toBeNull();
    expect(pickUi(pack, 'no-such-frame', loaded)).toBeNull();
    expect(pickUi(pack, 'stat-tile', () => false)).toBeNull();
    expect(pickUi(undefined, 'stat-tile', loaded)).toBeNull();
    const empty = { ...pack, entries: { menu2: { kind: 'ui', sprites: { x: { frame: -1, size: [1, 1] } } } } } as unknown as UiPack;
    expect(pickUi(empty, 'x', loaded)).toBeNull();
  });

  it('each art draw in HomeScene keeps a code-drawn fallback', () => {
    expect(helpers).toMatch(/if \(!s\) return null/);
    expect(home).toMatch(/if \(tileArt\)[\s\S]{0,400}else/);
    // The bag tile's fallback is the button's own code-drawn face, hidden only when the skin draws.
    expect(home).toMatch(/if \(halves\) \{\s*skinButton/);
    expect(home).toMatch(/hasMenu2\(this, 'belt-knot-band'\)/);
  });

  it('no My Style art is referenced', () => {
    for (const s of [home, helpers, JSON.stringify(MENU2_FRAMES)]) expect(s).not.toMatch(MY_STYLE);
    expect(Object.keys(pack.entries[MENU2_PACK].sprites!).filter((n) => /slot-card|tray-|switch-|glyph-/.test(n))).toEqual([]);
  });

  it('the shared pieces (panel frame, title plaque, wood buttons) are imported and drawn, never the switch', () => {
    const out = Object.keys(pack.entries[MENU2_PACK].sprites!);
    for (const n of ['panel-frame', 'title-plaque', 'button-primary-normal', 'button-primary-pressed', 'button-primary-disabled']) {
      expect(MENU2_FRAMES.shared, n).toContain(n);
      expect(out, n).toContain(n);
    }
    expect(home).toMatch(/menu2Slice\(this, 'panel-frame'/);
    expect(home).toMatch(/menu2Slice\(this, 'title-plaque'/);
    expect(helpers).toMatch(/'button-primary-normal'/);
    expect((home.match(/woodSkin\(this/g) ?? []).length).toBeGreaterThanOrEqual(9);
    expect(out.filter((n) => n.startsWith('switch'))).toEqual([]);
    expect(home + helpers).not.toMatch(/['"`]switch-(?:track|left|right)/);
  });

  it('QA fixes: inks reach 4.5:1 on the paper, tiles keep one scale, the rail is drawn h tall, the webp is small', () => {
    const lum = (h: string) => {
      const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a: string, b: string) => {
      const [lo, hi] = [lum(a), lum(b)].sort((x, y) => x - y);
      return (hi + 0.05) / (lo + 0.05);
    };
    const inks = home.match(/const RARITY_INK[^{]*\{([^}]*)\}/)![1];
    const colours = [...inks.matchAll(/'(#[0-9a-f]{6})'/g)].map((m) => m[1]);
    expect(colours.length).toBe(5);
    // The paper under the words is darker on the rarity band, so test a greyer paper too.
    for (const c of colours) for (const paper of ['#efe0c4', '#e2dccb']) expect(ratio(c, paper), c).toBeGreaterThanOrEqual(4.5);
    expect(home).toMatch(/txt\.setStroke\(WOOD\.ink, 4\)/);
    expect(ratio('#fff6e6', '#3a2618')).toBeGreaterThanOrEqual(4.5);
    expect(home).toMatch(/menu2Fit\(this, tileArt/);
    expect(home).not.toMatch(/box\.w \* 84\) \/ 72, \(box\.h \* 100\) \/ 88/);
    expect(helpers).toMatch(/setScale\(sc, h \/ ns\.height\)/);
    expect(home).toMatch(/STAT_RIM \+|rim \+ STAT_PAD/);
    const dataUrl = raw(import.meta.glob('../../../assets/art/menu2-0.webp', { query: '?inline', import: 'default', eager: true }));
    const bytes = ((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4;
    expect(bytes).toBeGreaterThan(50 * 1024);
    expect(bytes).toBeLessThan(400 * 1024);
  });

  it('Legendary has its own art (A-LEGENDARY-wire), not the Epic stand-in', () => {
    expect(artRarity('legendary')).toBe('legendary');
    expect(artRarity('epic')).toBe('epic');
    expect(artRarity('rare')).toBe('rare');
    const out = pack.entries[MENU2_PACK].sprites!;
    for (const n of MENU2_FRAMES.legendary) expect(out[n], n).toBeDefined();
    expect(out['bag-tile-legendary-9slice'].nineSlice).toEqual([20, 20, 20, 20]);
    // The bag tile is the 9-slice with the crest on top, picked or not (the highlight is drawn over it).
    expect(home).toMatch(/const legend = it\.rarity === 'legendary' \? menu2Slice\(this, 'bag-tile-legendary-9slice'/);
    expect(home).toMatch(/if \(sel\) \{\s*const hl = this\.add\.graphics\(\)\.setData\('legendSelected'/);
    expect(home).toMatch(/menu2Image\(this, 'bag-tile-legendary-crest'/);
    // Only the Legendary frame came in from the A-LEGENDARY sheet (no shine, no ready-made tile).
    const names = Object.keys(out).filter((n) => n.includes('legendary'));
    expect(names.sort()).toEqual([...MENU2_FRAMES.legendary].sort());
  });
});
