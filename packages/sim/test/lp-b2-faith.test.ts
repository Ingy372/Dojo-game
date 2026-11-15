// LP-B2 (L5): the school's faith pack is loaded as approved and shown word for word.
import { describe, expect, it } from 'vitest';
import { bannerLetters, buildTraining, creedDue, guardianLine, loadFaith, loadFeed, loadProfile, newProfile, promotionFaith, scrollsFound, verseText, type Now } from '../src';
import PACK from '../../../content/faith/action-zone.json';
import APPROVED from '../../../drafts/content/faith/LP-C1-faith-pack.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import white0 from '../../../fixtures/1-white-belt-new.json';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const train = (data: unknown) => {
  const feed = loadFeed(data);
  const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
  return buildTraining(feed, content.abilities, now);
};
const FAITH = loadFaith(PACK);
const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const raw = (p: string): string => SRC[`../../../apps/client/src${p}`] ?? '';

describe('LP-B2: the pack, as approved', () => {
  it('content/faith/ is the Jay-approved LP-C1 pack, unchanged', () => {
    expect(PACK).toEqual(APPROVED);
    expect(PACK.approval.status).toBe('jay-approved');
  });
  it('the banner letters spell FAITH DOES, one per promotion from Yellow to Black', () => {
    expect(FAITH.faithDoesBanner.letters.map((l) => l.letter).join('')).toBe('FAITHDOES');
    expect(FAITH.faithDoesBanner.letters.map((l) => l.earnedAt)).toEqual(['yellow', 'orange', 'green', 'blue', 'red', 'red-black', 'brown', 'brown-black', 'black']);
  });
  it('a broken pack fails at load', () => {
    expect(() => loadFaith({ ...PACK, faithDoesBanner: { ...PACK.faithDoesBanner, acrostic: 'FAITH' } })).toThrow(/acrostic/);
  });
  it('the game shows the wall wording, word for word as docs/faith-and-creed.md has it', () => {
    const doc = Object.values(import.meta.glob(['../../../docs/faith-and-creed.md'], { query: '?raw', import: 'default', eager: true }))[0] as string;
    const fixed: Record<string, string> = { 'Romans 3:23': 'come short of the glory of God', 'Romans 5:8': 'Christ died for us' };
    for (const v of FAITH.verseScrolls) {
      expect(verseText(v), v.id).toBe(v.wallText);
      if (fixed[v.reference]) expect(v.wallText, v.id).toContain(fixed[v.reference]);
      else expect(doc, v.id).toContain(v.wallText);
      if (v.covenant) expect(doc, `${v.id} covenant`).toContain(v.covenant.text);
    }
    for (const line of FAITH.creedScroll.text.split('\n')) expect(doc).toContain(line);
  });
});

describe('LP-B2: what each student sees', () => {
  it('White (new): no letters lit, no verse scrolls yet', () => {
    const t = train(white0);
    expect(bannerLetters(FAITH, t).filter((l) => l.lit)).toEqual([]);
    expect(scrollsFound(FAITH, t)).toEqual([]);
  });
  it('Green: F, A, I lit; the 3 scrolls up to Green found', () => {
    const t = train(green);
    expect(bannerLetters(FAITH, t).filter((l) => l.lit).map((l) => l.letter.letter)).toEqual(['F', 'A', 'I']);
    expect(scrollsFound(FAITH, t).map((v) => v.promotion.toBelt)).toEqual(['yellow', 'orange', 'green']);
  });
  it('a promotion adds its letter and its verse scroll; skipped belts light every letter between', () => {
    const t = train(green);
    const one = promotionFaith(FAITH, t, 3, 'green');
    expect(one.letters.map((l) => l.letter)).toEqual(['I']);
    expect(one.scroll?.promotion).toEqual({ fromBelt: 'orange', toBelt: 'green' });
    expect(one.complete).toBe(false);
    expect(promotionFaith(FAITH, t, 1, 'green').letters.map((l) => l.letter)).toEqual(['F', 'A', 'I']);
    const last = promotionFaith(FAITH, t, 9, 'black');
    expect(last.letters.map((l) => l.letter)).toEqual(['S']);
    expect(last.complete).toBe(true);
  });
  it('the Creed Scroll comes once, after the first class check-in; old saves have not seen it', () => {
    const t = train(white3);
    expect(t.classCheckIns.length).toBeGreaterThan(0);
    expect(creedDue(false, t)).toBe(true);
    expect(creedDue(true, t)).toBe(false);
    expect(newProfile().creedSeen).toBe(false);
    const old = { ...newProfile() } as Record<string, unknown>;
    delete old.creedSeen;
    expect(loadProfile(old).creedSeen).toBe(false);
    expect(loadProfile({ ...newProfile(), creedSeen: true }).creedSeen).toBe(true);
  });
  it('a freed Guardian gets its line from the pack; others get none', () => {
    expect(guardianLine(FAITH, 'hearth-cook')).toEqual(['A piece of the light comes home!', 'The hearth is warm again. Supper\'s ready!']);
    expect(guardianLine(FAITH, 'brute')).toBeNull();
  });
});

describe('LP-B2: the screens show pack fields, never their own copy', () => {
  it('the faith screens read every faith word from the pack', () => {
    const ui = raw('/ui/faith.ts');
    expect(ui).toContain("from '../../../../content/faith/action-zone.json'");
    for (const field of ['verseText(v)', 'v.reference', 'v.covenant.name', 'v.covenant.text', 'v.lines.found', 'v.lines.sensei', 'c.text', 'c.signedBy', 'c.lines.found', 'letter.word', 'letter.meaning', 'lines.description', 'lines.complete'])
      expect(ui, field).toContain(field);
    const all = Object.values(SRC).join('\n');
    for (const v of FAITH.verseScrolls) expect(all, v.id).not.toContain(v.wallText.slice(0, 30));
  });
  it('the ceremony is at most 4 screens: bow, Gate, verse, then everything new with the lit letter', () => {
    const c = raw('/ui/Celebrations.ts');
    expect(c).toMatch(/kind: 'bow'[\s\S]*kind: 'gate'[\s\S]*kind: 'verse'[\s\S]*kind: 'summary'/);
    expect(c).toContain('faith.letters.map((l) => l.lit)');
    expect(raw('/scenes/GameScene.ts')).toContain('guardianLine(FAITH, e.def.id)');
  });
});
