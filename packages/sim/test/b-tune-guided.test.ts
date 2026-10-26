// B-TUNE-GUIDED: Guided enemies hit softer (Power x0.75, rounded, at least 1). Health never changes.
import { describe, expect, it } from 'vitest';
import { DIFFICULTY, createWorld, loadEnemy, loadRoom, type Difficulty } from '../src';
import bruteData from '../../../content/enemies/brute.json';
import bopperData from '../../../content/enemies/bopper.json';

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
