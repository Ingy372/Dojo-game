// L-PREMIUM-b: the Counter tip. 200-run checks: the kid bot gets at most 1 tip per room, the smart bot
// gets none, and Challenge gets none. Plus the miss rules and the run limit.
import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';
import { playRun, SKILLS } from './balance/bot';
import { counterHintFor, counterWindowTicks, createRunWorld, currentRoom, startRun, stepWorld } from '../src';
import { ARTISTS } from './r-bal-12-artists';
import rules from '../../../content/settings/counter-hint.json';

const content = testContent();
/** Belts 1-10 x 20 seeds, each at the typical student's stats for that belt. */
const runs = (style: 'kid' | 'smart' | 'stand', difficulty: 'standard' | 'challenge', n: number) =>
  Array.from({ length: n }, (_, i) => {
    const tier = (i % 10) + 1;
    const a = ARTISTS.typical[tier - 1];
    return playRun(content, 5000 + i, style, style === 'smart' ? SKILLS.sharp : SKILLS.novice, difficulty, { maxHealth: a.health, power: a.power, guard: a.guard }, undefined, { tier }, rules);
  });

describe('L-PREMIUM-b Counter tip', () => {
  it('settings live in content/settings', () => {
    expect(rules.missesBeforeHint).toBeGreaterThan(0);
    expect(rules.stopAfterGreatCounters).toBe(3);
  });

  it('settings: the tip needs 3 misses (spec)', () => {
    expect(rules.missesBeforeHint).toBe(3);
  });

  it('kid bot, no overrides: 200 runs, the tip does show, and at most 1 per room', () => {
    const rooms = runs('kid', 'standard', 200).flatMap((r) => r.rooms);
    const total = rooms.reduce((n, r) => n + (r.hints ?? 0), 0);
    expect(total).toBeGreaterThan(0);
    expect(Math.max(0, ...rooms.map((r) => r.hints ?? 0))).toBeLessThanOrEqual(1);
  }, 600000);

  it('a player who never answers: the tip shows once in the room, after missesBeforeHint misses', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    const world = createRunWorld(content, run, { maxHealth: 100000, power: 1, guard: 0 }, [], undefined, undefined, rules);
    // No overrides: Mash guard is on, so most swings land as its Blocks, and those count too.
    const hints: number[] = []; let unanswered = 0;
    for (let t = 0; t < 20 * 90 && world.players.p1.health > 0; t++) {
      stepWorld(world, currentRoom(content, run), { p1: { move: { x: 0, y: 0 }, action: null } } as never);
      for (const ev of world.events) { if (ev.kind === 'hit' || ev.kind === 'block') unanswered++; if (ev.kind === 'counterHint') hints.push(unanswered); }
    }
    expect(hints).toEqual([rules.missesBeforeHint]);
  });

  it('a real Block (Counter pressed a little late) is not a miss', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    const world = createRunWorld(content, run, { maxHealth: 100000, power: 1, guard: 0 }, [], undefined, undefined, rules);
    const p = world.players.p1; let n = 0; let blocks = 0;
    for (let t = 0; t < 20 * 90; t++) {
      p.guardTicks = 5; p.counterPressedTick = world.tick - counterWindowTicks(world, p); // always pressed a little late: every swing is a Block
      stepWorld(world, currentRoom(content, run), { p1: { move: { x: 0, y: 0 }, action: null } } as never);
      n += world.events.filter((e) => e.kind === 'counterHint').length;
      blocks += world.events.filter((e) => e.kind === 'block').length;
    }
    expect(blocks).toBeGreaterThan(10);
    expect(n).toBe(0);
  });

  it('a Dash is not a miss', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    const world = createRunWorld(content, run, { maxHealth: 100000, power: 1, guard: 0 }, [], undefined, undefined, rules);
    const p = world.players.p1; let n = 0; let swings = 0;
    for (let t = 0; t < 20 * 90; t++) {
      p.dashTicks = 5; // always mid-Dash when a swing lands
      stepWorld(world, currentRoom(content, run), { p1: { move: { x: 0, y: 0 }, action: null } } as never);
      n += world.events.filter((e) => e.kind === 'counterHint').length;
      swings += world.events.filter((e) => e.kind === 'hit' || e.kind === 'block').length;
    }
    expect(swings).toBeGreaterThan(3);
    expect(n).toBe(0);
  });

  it('smart bot, no overrides: 200 runs, no tips', () => {
    const rooms = runs('smart', 'standard', 200).flatMap((r) => r.rooms);
    expect(rooms.reduce((n, r) => n + (r.hints ?? 0), 0)).toBe(0);
  }, 600000);

  it('Challenge, no overrides: 200 kid runs, no tips', () => {
    const rooms = runs('kid', 'challenge', 200).flatMap((r) => r.rooms);
    expect(rooms.reduce((n, r) => n + (r.hints ?? 0), 0)).toBe(0);
  }, 600000);

  it('off on the tutorial floor and after 3 Great Counters in the run', () => {
    const tut = startRun(content, { seed: 1, dryRuns: 0, tutorial: true });
    expect(tut.tutorial).toBe(true);
    expect(createRunWorld(content, tut, { maxHealth: 100, power: 10, guard: 0 }, [], undefined, undefined, rules).counterHint).toBeNull();
    expect(counterHintFor(rules, 3, true)).toBeNull();
    expect(counterHintFor(rules, 2, true)?.perfectsLeft).toBe(1);
    expect(counterHintFor(rules, 0, false)).toBeNull();
  });
});
