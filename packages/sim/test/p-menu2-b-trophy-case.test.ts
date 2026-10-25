// P-MENU2-b: the Trophy Case for a White belt with 2 stripes. Earned cubbies say where they
// were signed; not-yet cubbies invite, never lock; no counts anywhere; wording from content/.
import { describe, expect, it } from 'vitest';
import { buildTraining, loadFeed, type Now, type TrainingState } from '../src';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import words from '../../../content/abilities/trophy-case.json';
import { buildCubbies, shelfRows, trophyLayout, trophyPages } from '../../../apps/client/src/ui/trophyCase';
import { BOARD, MIN_TAP } from '../../../apps/client/src/ui/tokens';
import { testContent } from './load-content';

const content = testContent();
const profile = { ...white3, stripes: [...white3.stripes, { word: 'Great Effort', belt: 'white', earnedOn: '2026-11-16' }] };
const feed = loadFeed(profile);
const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
const t: TrainingState = buildTraining(feed, content.abilities, now);
const cubbies = buildCubbies({
  abilities: t.abilities,
  virtues: t.virtues,
  beltName: (id) => t.belts.find((b) => b.id === id)?.name ?? id,
  virtueName: (v) => v.def.name,
  virtueEffect: (v) => v.def.text,
  kataLine: () => undefined,
});
const visible = cubbies.flatMap((c) => [c.name, c.effect, c.status, c.earned ? '' : words.notYet]).join('\n');

describe('P-MENU2-b Trophy Case (White + 2 stripes)', () => {
  it('is a White belt with 2 stripes', () => {
    expect(t.belt.id).toBe('white');
    expect(t.stripesThisBelt).toBe(2);
  });

  it('earned cubbies are signed at their belt; the rest are not yet', () => {
    const earned = cubbies.filter((c) => c.earned && c.shelf !== 'stripes');
    expect(earned.map((c) => c.id).sort()).toEqual(t.abilities.filter((a) => a.unlocked).map((a) => a.requirement.id).sort());
    expect(earned.length).toBeGreaterThan(0);
    for (const c of earned) expect(c.status).toBe(words.signedAt.replace('{belt}', 'White Belt'));
    const notYet = cubbies.filter((c) => !c.earned);
    expect(notYet.length).toBeGreaterThan(0);
    for (const c of notYet) expect(c.status).toBe(words.askSensei);
  });

  it('puts things on the four shelves, earned first, with both stripes on the Character shelf', () => {
    const shelves = [...new Set(cubbies.map((c) => c.shelf))];
    expect(shelves).toEqual(['katas', 'kicks', 'selfDefense', 'stripes']);
    expect(cubbies.filter((c) => c.shelf === 'stripes')).toHaveLength(2);
    for (const s of shelves) {
      const on = cubbies.filter((c) => c.shelf === s).map((c) => c.earned);
      expect(on).toEqual([...on].sort((a, b) => Number(b) - Number(a)));
    }
  });

  it('never shows a lock, a count or pressure', () => {
    expect(visible).not.toMatch(/🔒|unlock|locked|\d+\s*(\/|of)\s*\d+|hurry|missed|last chance/i);
  });

  it('pages rows of up to 4 cubbies, each 44+ and fitting the smallest phone', () => {
    for (const [w, h] of [[300, 240], [560, 300]]) {
      const L = trophyLayout(w, h);
      expect(L.perRow).toBeLessThanOrEqual(4);
      expect(L.cubby).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.perRow * L.cubby + (L.perRow - 1) * BOARD.cubby.gap).toBeLessThanOrEqual(w);
      expect(BOARD.ribbonH + L.rowsPerPage * L.rowH + L.pagerH).toBeLessThanOrEqual(h);
      const pages = trophyPages(shelfRows(cubbies, L.perRow), L.rowsPerPage);
      expect(pages.flat().flatMap((r) => r.cubbies)).toHaveLength(cubbies.length);
    }
  });
});
