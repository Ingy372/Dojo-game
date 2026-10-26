// Q-PREM-GRADE: room grades (letter, sound, Last run chips, tutorial card letter, "Most S grades")
// show on Challenge only. The sim still grades rooms and keeps the S-grade bonus.
import { describe, expect, it } from 'vitest';
import { newProfile, type Profile, type RoomResult, type RunSummary } from '../src';
import { summarizeRun } from '../src/run';
import { showGrades } from '../../../apps/client/src/game/difficulty';
import { bestsRows, buildLastRun } from '../../../apps/client/src/ui/lastRun';

const raw = import.meta.glob(['../../../apps/client/src/scenes/GameScene.ts', '../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (name: string) => Object.entries(raw).find(([k]) => k.endsWith(name))![1];
const between = (s: string, a: string, b: string) => s.slice(s.indexOf(a), s.indexOf(b, s.indexOf(a) + a.length));

const room = (grade: RoomResult['grade']): RoomResult => ({ grade, kind: 'combat' } as unknown as RoomResult);
const last = (difficulty: RunSummary['difficulty']): NonNullable<Profile['lastRun']> => ({
  summary: { result: 'cleared', roomsCleared: 2, totalRooms: 2, results: [room('S'), room('A')], items: [], perfects: 3, bestCombo: 4, ticks: 600, sGrades: 1, insights: [], decorations: [], decorationColours: [], defeated: [], test: false, tier: 1, tutorial: false, ...(difficulty ? { difficulty } : {}) },
  newBests: ['mostSGrades'],
});

describe('Q-PREM-GRADE: showGrades', () => {
  it('is true only for challenge; missing means hidden', () => {
    expect(showGrades('challenge')).toBe(true);
    for (const d of ['guided', 'standard', null, undefined] as const) expect(showGrades(d)).toBe(false);
  });
});

describe('Q-PREM-GRADE: the run summary keeps its difficulty', () => {
  it('summarizeRun copies run.difficulty', () => {
    const run = { status: 'cleared', results: [], totalRooms: 1, loot: [], perfects: 0, bestCombo: 0, ticks: 0, insights: [], decorations: [], decorationColours: [], defeated: [], test: false, tier: 1, tutorial: false, difficulty: 'challenge' } as unknown as Parameters<typeof summarizeRun>[0];
    expect(summarizeRun(run).difficulty).toBe('challenge');
  });
});

describe('Q-PREM-GRADE: Last run', () => {
  it('chips keep letters for a Challenge run', () => {
    expect(buildLastRun(last('challenge'), '').chips.map((c) => c.grade)).toEqual(['S', 'A']);
  });
  it('chips drop letters for guided, standard and old summaries (the sim results are untouched)', () => {
    for (const d of ['guided', 'standard', undefined] as const) {
      const l = last(d);
      expect(buildLastRun(l, '').chips.map((c) => c.grade)).toEqual([null, null]);
      expect(l.summary.results.map((r) => r.grade)).toEqual(['S', 'A']);
      expect(l.summary.sGrades).toBe(1);
    }
  });
  it('"Most S grades" is only in Bests on Challenge (still tracked)', () => {
    const p = newProfile();
    p.bests.mostSGrades = 5;
    expect(bestsRows(p.bests, ['mostSGrades'], true).some((r) => r.key === 'mostSGrades')).toBe(true);
    expect(bestsRows(p.bests, ['mostSGrades'], false).some((r) => r.key === 'mostSGrades')).toBe(false);
    expect(bestsRows(p.bests, [], false)).toHaveLength(3);
  });
});

describe('Q-PREM-GRADE: scenes', () => {
  const show = between(src('GameScene.ts'), 'private showGrade(', 'private enemy(');
  it('GameScene gates the letter and the sound on the floor difficulty, but keeps the Room clear! line', () => {
    expect(show).toMatch(/const graded = showGrades\(this\.world\.difficulty\)/);
    expect(show).toMatch(/if \(graded\) sfx\.grade\(grade\)/);
    expect(show).toMatch(/\.setVisible\(graded\)/);
    expect(show).toMatch(/this\.gradeLine = line/);
    expect(show).not.toMatch(/line[^\n]*setVisible/);
  });
  it('HomeScene tutorial card letter uses the run difficulty; Bests uses the player difficulty', () => {
    const home = src('HomeScene.ts');
    expect(between(home, 'private firstFloorCard(', 'const best =')).toMatch(/grade && showGrades\(s\.difficulty\)/);
    expect(home).toMatch(/lastRunBests\([^)]*showGrades\(this\.profile\.difficulty\)\)/);
  });
});
