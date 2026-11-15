// LP-B1 (L1): the one Path screen replaces the Gate tab, the Path card and the goals card.
import { describe, expect, it } from 'vitest';
import { buildTraining, loadFeed, loadProfile, newProfile, pathIntroDue, pathView, type Now } from '../src';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import green from '../../../fixtures/4-green-belt.json';
import { MIN_TAP } from '../../../apps/client/src/ui/tokens';
import { PATH_GATE_H, PATH_LABEL, PATH_WORDS, fill, pathLayout, towerStart, type Box } from '../../../apps/client/src/ui/pathScreen';
import { testContent } from './load-content';

const content = testContent();
const train = (data: unknown) => {
  const feed = loadFeed(data);
  const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
  return buildTraining(feed, content.abilities, now);
};
const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const raw = (p: string): string | undefined => SRC[`../../../apps/client/src${p}`];

describe('LP-B1: the next class step and the next game step', () => {
  it('White (3 sign-offs): Self-Defense #2 in class, reach level 2, first tier is yours', () => {
    const t = train(white3);
    const p = newProfile();
    const v = pathView(p, t, 1);
    expect(v.classStep?.name).toBe('Self-Defense #2');
    expect(v.game).toEqual({ kind: 'level', level: 2 });
    expect(fill(PATH_WORDS.gameLevel, { n: 2 })).toBe('Reach level 2 in the Tower');
    expect(v.tower[0].state).toBe('current');
    expect(v.tower[1].state).toBe('next');
    expect(v.tower.slice(2).every((tr) => tr.state === 'ahead')).toBe(true);
  });
  it('Green: Self-Defense #18 in class (as in the #495 mock), lower tiers cleared', () => {
    const t = train(green);
    const v = pathView(newProfile(), t, 12);
    expect(v.classStep?.name).toBe('Self-Defense #18');
    expect(v.game).toEqual({ kind: 'level', level: 13 });
    const cur = v.tower.findIndex((tr) => tr.state === 'current');
    expect(v.tower[cur].id).toBe(t.belt.id);
    expect(v.tower.slice(0, cur).every((tr) => tr.state === 'cleared')).toBe(true);
    expect(v.tower[cur + 1].state).toBe('next');
  });
  it('at the level cap, the game step is a best to beat, never a number that can go down', () => {
    const t = train(green);
    const p = newProfile();
    expect(pathView(p, t, t.levelCap).game).toEqual({ kind: 'firstCombo' });
    p.bests.longestCombo = 9;
    expect(pathView(p, t, t.levelCap).game).toEqual({ kind: 'combo', best: 9 });
  });
});

describe('LP-B1: the intro card is for existing players, once', () => {
  it('a new player never sees it', () => expect(pathIntroDue(newProfile())).toBe(false));
  it('an old save that played sees it until OK, and OK is saved', () => {
    const old = { ...newProfile(), runsPlayed: 4 } as Partial<ReturnType<typeof newProfile>>;
    delete old.pathIntroSeen;
    const p = loadProfile(JSON.parse(JSON.stringify(old)));
    expect(pathIntroDue(p)).toBe(true);
    p.pathIntroSeen = true;
    expect(pathIntroDue(loadProfile(JSON.parse(JSON.stringify(p))))).toBe(false);
  });
  it('an old save that never played skips it', () => {
    const old = newProfile() as Partial<ReturnType<typeof newProfile>>;
    delete old.pathIntroSeen;
    expect(pathIntroDue(loadProfile(old))).toBe(false);
  });
});

describe('LP-B1: the layout fits 667x375 and 932x430', () => {
  const inside = (a: Box, w: number, h: number) => a.x >= 0 && a.y >= 0 && a.x + a.w <= w && a.y + a.h <= h;
  const apart = (a: Box, b: Box) => a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
  for (const [w, h] of [[667, 375], [932, 430], [844, 390]] as const) {
    it(`${w}x${h}`, () => {
      const L = pathLayout(w, h);
      const boxes = [L.bar, L.tower, L.gate, L.classCard, L.gameCard];
      for (const b of boxes) expect(inside(b, w, h)).toBe(true);
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (i !== 0 || j !== 1) expect(apart(boxes[i], boxes[j])).toBe(true);
      expect(L.bar.h).toBeGreaterThanOrEqual(MIN_TAP);
      // The next class step is the biggest card.
      expect(L.classCard.w * L.classCard.h).toBeGreaterThan(L.gameCard.w * L.gameCard.h);
      // The game card holds its label, two lines, the level row and a 44 pt Enter.
      expect(L.gameCard.h).toBeGreaterThanOrEqual(12 + 12 + 8 + 36 + 6 + 14 + 8 + MIN_TAP + 12);
      expect(L.gate.h).toBe(PATH_GATE_H);
      expect(Math.floor((L.tower.h - 16) / L.tierH)).toBeGreaterThanOrEqual(3);
    });
  }
  it('the Tower opens with your tier second from the top, the next one above it', () => {
    expect(towerStart(10, 3, 5)).toBe(0);
    expect(towerStart(10, 6, 5)).toBe(3);
    expect(towerStart(10, 9, 5)).toBe(5);
  });
  it('Gate labels are 12 pt, at most 3 lines', () => expect(PATH_LABEL).toEqual({ size: 12, lineH: 15, lines: 3 }));
});

describe('LP-B1: kid words and the old screens', () => {
  it('kid lines are 8 words or fewer, with no percents', () => {
    for (const [k, line] of Object.entries(PATH_WORDS)) {
      if (k.startsWith('_')) continue;
      expect(line.split(/\s+/).length, k).toBeLessThanOrEqual(8);
      expect(line).not.toMatch(/%/);
    }
  });
  it('Home opens on the Path; the Gate tab and goals card are gone', () => {
    const home = raw('/scenes/HomeScene.ts') as string;
    expect(home).toMatch(/this\.view = this\.fromRun \|\| this\.knockout \? 'board' : 'path';/);
    expect(home).not.toMatch(/'gate'|renderGate\(|GoalsCard|nextGoals|renderPath\(/);
    expect(raw('/ui/GoalsCard.ts')).toBeUndefined();
  });
});
