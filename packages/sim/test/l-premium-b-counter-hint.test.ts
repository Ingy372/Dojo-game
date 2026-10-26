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

  it('kid bot: 200 runs, at most 1 tip per room', () => {
    const rooms = runs('kid', 'standard', 200).flatMap((r) => r.rooms);
    expect(Math.max(0, ...rooms.map((r) => r.hints ?? 0))).toBeLessThanOrEqual(1);
  }, 600000);

  it('a player who never answers: the tip shows once in the room, after missesBeforeHint misses', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    const world = createRunWorld(content, run, { maxHealth: 100000, power: 1, guard: 0 }, [], undefined, undefined, rules);
    // Turn Mash guard off (as after 3 Great Counters) but keep the tip allowed, so swings land as Hits.
    world.counterHint!.perfectsLeft = 99;
    const hints: number[] = []; let hits = 0;
    for (let t = 0; t < 20 * 90 && world.players.p1.health > 0; t++) {
      world.players.p1.perfects = 3;
      stepWorld(world, currentRoom(content, run), { p1: { move: { x: 0, y: 0 }, action: null } } as never);
      for (const ev of world.events) { if (ev.kind === 'hit') hits++; if (ev.kind === 'counterHint') hints.push(hits); }
    }
    expect(hints).toEqual([rules.missesBeforeHint]);
  });

  it('blocks are not misses', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    const world = createRunWorld(content, run, { maxHealth: 100000, power: 1, guard: 0 }, [], undefined, undefined, rules);
    world.counterHint!.perfectsLeft = 99;
    const p = world.players.p1; let n = 0; let blocks = 0;
    for (let t = 0; t < 20 * 90; t++) {
      p.perfects = 3; p.guardTicks = 5; p.counterPressedTick = world.tick - counterWindowTicks(world, p); // always pressed a little late: every swing is a Block
      stepWorld(world, currentRoom(content, run), { p1: { move: { x: 0, y: 0 }, action: null } } as never);
      n += world.events.filter((e) => e.kind === 'counterHint').length;
      blocks += world.events.filter((e) => e.kind === 'block').length;
    }
    expect(blocks).toBeGreaterThan(10);
    expect(n).toBe(0);
  });

  it('smart bot: 200 runs, no tips', () => {
    const rooms = runs('smart', 'standard', 200).flatMap((r) => r.rooms);
    expect(rooms.reduce((n, r) => n + (r.hints ?? 0), 0)).toBe(0);
  }, 600000);

  it('Challenge: 200 kid runs, no tips', () => {
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
