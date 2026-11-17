import { describe, expect, it } from 'vitest';
import {
  TICKS_PER_SECOND,
  TUTORIAL_STEPS,
  createRunWorld,
  currentRoom,
  currentStep,
  gotIt,
  loadTutorialLines,
  releaseWave,
  showTip,
  skipStep,
  startRun,
  stepWorld,
  tutorialEvent,
  tutorialFlow,
} from '../src';
import tutorialData from '../../../content/tutorial/tutorial-floor.json';
import { testContent } from './load-content';

const LINES = loadTutorialLines(tutorialData);
const content = testContent();
const BASE = { maxHealth: 100, power: 10, guard: 0 };
/** A tutorial run standing in First Steps Hall (the Brute and the Dash crowd). */
const hallRun = (seed: number) => ({ ...startRun(content, { seed, dryRuns: 0, tutorial: true }), roomId: 'tutorial-hall' });

describe('tutorial step flow (K24a)', () => {
  it('has the 12 TUT-P1 steps, each tap step with no event and each move step with one', () => {
    expect(Object.keys(LINES).sort()).toEqual([...TUTORIAL_STEPS].sort());
    expect(TUTORIAL_STEPS).toHaveLength(12);
    for (const id of TUTORIAL_STEPS) expect(LINES[id].advance === 'tap' ? LINES[id].waitFor === null : !!LINES[id].waitFor).toBe(true);
  });

  it('a move step waits for Got it, then for the try; nothing else moves it on', () => {
    const f = tutorialFlow();
    expect(tutorialEvent(f, LINES, 'reachPathEnd')).toBeNull(); // no tip yet
    expect(showTip(f, 'tutorial-stones')).toBe(false); // not this step's turn
    expect(showTip(f, 'tutorial-path')).toBe(true);
    expect(tutorialEvent(f, LINES, 'reachPathEnd')).toBeNull(); // still waiting for Got it
    expect(gotIt(f, LINES)).toBeNull();
    expect(f.phase).toBe('trying');
    expect(tutorialEvent(f, LINES, 'counter')).toBeNull(); // the wrong move
    expect(tutorialEvent(f, LINES, 'reachPathEnd')).toBe('tutorial-path');
    expect(currentStep(f)).toBe('tutorial-stones');
    expect(f.phase).toBe('ready');
  });

  it('a tap step is done on Got it', () => {
    const f = tutorialFlow('tutorial-insight');
    showTip(f, 'tutorial-insight');
    expect(gotIt(f, LINES)).toBe('tutorial-insight');
    expect(currentStep(f)).toBe('tutorial-chest');
  });

  it('plays all 12 steps in order, each needing its own Got it and try', () => {
    const f = tutorialFlow();
    const done: string[] = [];
    for (const id of TUTORIAL_STEPS) {
      expect(showTip(f, id)).toBe(true);
      const fin = gotIt(f, LINES) ?? tutorialEvent(f, LINES, LINES[id].waitFor!);
      done.push(fin!);
    }
    expect(done).toEqual([...TUTORIAL_STEPS]);
    expect(currentStep(f)).toBeNull();
  });

  it('a step that can no longer happen ends quietly', () => {
    const f = tutorialFlow('tutorial-dash');
    showTip(f, 'tutorial-dash');
    gotIt(f, LINES);
    expect(skipStep(f, 'tutorial-dash')).toBe(true);
    expect(currentStep(f)).toBe('tutorial-insight');
  });
});

describe('tutorial health floor and held waves (K24a)', () => {
  it('health never drops below 1 anywhere on the tutorial floor, Swarmers included', () => {
    const run = hallRun(3);
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, BASE, [], undefined, 3);
    let low = Infinity;
    let hits = 0;
    // The player stands still while every wave comes in at once and attacks for two minutes.
    while (releaseWave(world));
    for (let t = 0; t < 120 * TICKS_PER_SECOND; t++) {
      stepWorld(world, room, { p1: { kind: 'none' } });
      // B-MASHER-b: the auto-swinging player Blocks some hits (Mash guard); both still hurt.
      hits += world.events.filter((e) => e.kind === 'hit' || e.kind === 'block').length;
      low = Math.min(low, world.players.p1.health);
    }
    expect(world.enemies.filter((e) => e.def.id === 'swarmer').length).toBe(4);
    expect(hits).toBeGreaterThan(10);
    expect(low).toBe(1);
  });

  it('held enemies stand still and held waves wait for releaseWave', () => {
    const run = hallRun(1);
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, BASE, [], undefined, 3);
    world.enemyHold = true;
    world.waveHold = true;
    const start = { ...world.enemies[0].pos };
    for (let t = 0; t < 5 * TICKS_PER_SECOND; t++) stepWorld(world, room, { p1: { kind: 'none' } });
    expect(world.enemies[0].pos).toEqual(start);
    world.enemyHold = false;
    world.enemies[0].health = 1;
    for (let t = 0; t < 30 * TICKS_PER_SECOND && world.enemies[0].mode !== 'defeated'; t++) stepWorld(world, room, { p1: { kind: 'moveTo', ...world.enemies[0].pos } });
    for (let t = 0; t < 2 * TICKS_PER_SECOND; t++) stepWorld(world, room, { p1: { kind: 'none' } });
    expect(world.wave).toBe(1); // no wave on its own
    expect(world.progress.cleared).toBe(false);
    expect(releaseWave(world)).toBe(true);
    expect(world.wave).toBe(2);
    expect(world.enemies.filter((e) => e.mode !== 'defeated').map((e) => e.def.id).sort()).toEqual(['swarmer', 'swarmer', 'swarmer', 'swarmer']);
  });

  it('with seeAll, a far enemy still comes to the player', () => {
    const run = hallRun(1);
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, BASE, [], undefined, 3);
    const e = world.enemies[0];
    world.players.p1.pos = { x: e.pos.x + 14, y: e.pos.y - 5 };
    const far = () => Math.hypot(world.players.p1.pos.x - e.pos.x, world.players.p1.pos.y - e.pos.y);
    const d0 = far();
    for (let t = 0; t < 2 * TICKS_PER_SECOND; t++) stepWorld(world, room, { p1: { kind: 'none' } });
    expect(far()).toBeCloseTo(d0); // out of sight: waits
    world.seeAll = true;
    for (let t = 0; t < 2 * TICKS_PER_SECOND; t++) stepWorld(world, room, { p1: { kind: 'none' } });
    expect(far()).toBeLessThan(d0 - 1);
  });
});
