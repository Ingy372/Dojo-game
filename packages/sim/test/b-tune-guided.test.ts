// B-TUNE-GUIDED: Guided enemies hit softer (Power x0.75, rounded, at least 1). Health never changes.
import { describe, expect, it } from 'vitest';
import { DIFFICULTY, buildTraining, characterSetup, createWorld, loadEnemy, loadFeed, loadRoom, newProfile, type Difficulty } from '../src';
import bruteData from '../../../content/enemies/brute.json';
import bopperData from '../../../content/enemies/bopper.json';
import { testContent } from './load-content';
import orange from '../../../fixtures/6-orange-typical.json';
import green from '../../../fixtures/4-green-belt.json';
import { ARTISTS } from './r-bal-12-artists';
import { playRun, SKILLS } from './balance/bot';

const brute = loadEnemy(bruteData);
const bopper = loadEnemy(bopperData);
const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['############', '#..........#', '#..P.......#', '#..........#', '############'],
  enemies: [{ enemy: 'brute', column: 6, row: 2 }],
});
const enemyOn = (difficulty: Difficulty, types: Record<string, ReturnType<typeof loadEnemy>> = { brute }, enemyScale?: { maxHealth: number; power: number }) =>
  createWorld(room, ['p1'], { enemyTypes: types, difficulty, enemyScale }).enemies[0].def;

describe('B-TUNE-GUIDED enemyPowerScale', () => {
  it('Guided is 0.75 and the other settings are 1.0', () => {
    expect(DIFFICULTY.guided.enemyPowerScale).toBe(0.75);
    expect(DIFFICULTY.standard.enemyPowerScale).toBe(1);
    expect(DIFFICULTY.challenge.enemyPowerScale).toBe(1);
  });

  it('Guided scales Power in a fight with no belt scale (practice rooms), and keeps Health', () => {
    const g = enemyOn('guided');
    expect(g.power).toBe(Math.round(brute.power * 0.75));
    expect(g.maxHealth).toBe(brute.maxHealth);
  });

  it('Standard and Challenge enemies are exactly the content numbers', () => {
    expect(enemyOn('standard')).toBe(brute);
    expect(enemyOn('challenge')).toBe(brute);
  });

  it('stacks with the belt scale, and Health still only uses the belt scale', () => {
    const sc = { maxHealth: 1.5, power: 2 };
    const s = enemyOn('standard', { brute }, sc);
    const g = enemyOn('guided', { brute }, sc);
    expect(s.power).toBe(Math.round(brute.power * 2));
    expect(g.power).toBe(Math.round(brute.power * 2 * 0.75));
    expect(g.maxHealth).toBe(s.maxHealth);
  });

  it('rounds to at least 1', () => {
    expect(enemyOn('guided', { brute: { ...brute, power: 1 } }).power).toBe(1);
  });

  it('scales a disarmed weapon too', () => {
    const w = enemyOn('guided', { brute: bopper }).weapon!;
    expect(w.disarmedPower).toBe(Math.max(1, Math.round(bopper.weapon!.disarmedPower * 0.75)));
  });
});


describe('B-TUNE-GUIDED "Orange typical" testing fixture', () => {
  const content = testContent();
  const setupOf = (data: unknown) => {
    const feed = loadFeed(data);
    return characterSetup(newProfile(), buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 }), content.abilities);
  };

  it('is an Orange belt with the belt-3 typical stats pinned (333 Health / 46 Power / 34 Guard)', () => {
    const a = ARTISTS.typical[2];
    expect(orange.testStats).toEqual({ maxHealth: Math.round(a.health), power: Math.round(a.power), guard: Math.round(a.guard) });
    const feed = loadFeed(orange);
    expect(feed.rank.currentBelt).toBe('orange');
    const s = setupOf(orange);
    expect([s.maxHealth, s.power, s.guard]).toEqual([333, 46, 34]);
  });

  it('a fixture without testStats is worked out as before', () => {
    expect('testStats' in loadFeed(green)).toBe(false);
    const s = setupOf(green);
    expect(s.maxHealth).not.toBe(333);
  });

  it('rejects bad testStats', () => {
    expect(() => loadFeed({ ...orange, testStats: { maxHealth: -1, power: 46, guard: 34 } })).toThrow(/testStats/);
  });
});

describe('B-TUNE-GUIDED kid bot on White belt (R-T3-TUNE-3 target: white >= 75% on Guided)', () => {
  const content = testContent();
  const a = ARTISTS.typical[0];
  const wins = (d: Difficulty) =>
    Array.from({ length: 20 }, (_, i) => playRun(content, 1000 + i, 'kid', SKILLS.novice, d, { maxHealth: a.health, power: a.power, guard: a.guard }, undefined, { tier: 1 })).filter((r) => r.won).length;

  it('wins at least 75% on Guided, and more than on Standard', () => {
    const g = wins('guided');
    expect(g).toBeGreaterThanOrEqual(15);
    expect(g).toBeGreaterThan(wins('standard'));
  }, 120_000);
});
