import { describe, expect, it } from 'vitest';
import {
  GUIDE_DONE,
  TICKS_PER_SECOND,
  TUTORIAL_FLOOR,
  ENEMY_TRAINING_SCALE,
  TUTORIAL_MAX_WORDS,
  TUTORIAL_STEPS,
  GUIDE_LESSONS,
  STRIKE_LESSON,
  WARNING_LESSON,
  activeDoorSlots,
  createRunWorld,
  currentRoom,
  loadTutorialLines,
  rarityRank,
  startRun,
  stepWorld,
  updateRun,
  type PlayerInput,
  type RunEvent,
  type RunState,
  type WorldState,
} from '../src';
import tutorialData from '../../../content/tutorial/tutorial-floor.json';
import storyData from '../../../content/tutorial/tutorial-story.json';
import firstSession from '../../../content/tutorial/first-session-lessons.json';
import { testContent } from './load-content';

const content = testContent();
const BASE = { maxHealth: 100, power: 10, guard: 0 };
const IDLE: PlayerInput = { kind: 'none' };
const tutorial = (seed = 1) => startRun(content, { seed, dryRuns: 0, tutorial: true });

/**
 * A plain player: walks to the glowing spot (and stands in the stones), then to the nearest enemy (basic attacks are
 * automatic), taps COUNTER when the guide waits or a circle is nearly full, Strikes when it
 * can, then opens the chest and takes the door. Returns every run event and world event kind.
 */
function play(run: RunState, guideStep = 0, maxSeconds = 600) {
  const runEvents: RunEvent[] = [];
  const worldEvents: Array<{ kind: string; room: string; tick: number }> = [];
  let total = 0;
  while (run.status === 'playing' && total < maxSeconds * TICKS_PER_SECOND) {
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, BASE, [], undefined, guideStep);
    let next = false;
    while (!next && run.status === 'playing' && total < maxSeconds * TICKS_PER_SECOND) {
      stepWorld(world, room, { p1: botInput(world, room, run) });
      total++;
      for (const ev of world.events) worldEvents.push({ kind: ev.kind, room: room.id, tick: total });
      guideStep = world.guide?.step ?? GUIDE_DONE;
      const evs = updateRun(content, run, world);
      runEvents.push(...evs);
      next = evs.some((e) => e.kind === 'nextRoom');
    }
  }
  return { runEvents, worldEvents, ticks: total };
}

function botInput(world: WorldState, room: ReturnType<typeof currentRoom>, run: RunState): PlayerInput {
  const p = world.players.p1;
  if (world.guide?.waiting) return { kind: 'none', action: 'counter' };
  if (world.goal && !world.goal.reached) return { kind: 'moveTo', ...world.goal.pos };
  const foe = world.enemies.find((e) => e.mode !== 'defeated');
  if (foe) {
    const near = foe.mode === 'windup' && foe.modeTicks <= 3;
    const action = near ? 'counter' : p.focus >= 30 ? 'strike' : undefined;
    return { kind: 'moveTo', x: foe.pos.x, y: foe.pos.y, action };
  }
  if (room.chest && !world.progress.chestOpened && world.progress.cleared) return { kind: 'moveTo', ...room.chest };
  if (world.progress.doorsOpen) {
    const d = room.doors[activeDoorSlots(room, run.doors.length)[0]];
    return { kind: 'moveTo', x: d.x, y: d.y };
  }
  return IDLE;
}

describe('tutorial floor (M7-P2)', () => {
  it('has a line for every step', () => {
    const lines = loadTutorialLines(tutorialData);
    for (const id of TUTORIAL_STEPS) expect(lines[id].screens.length).toBeGreaterThan(0);
  });

  it('is always the Tower Path, the Training Hall, First Steps Hall, the chest and the boss, then home (TUT-P1)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const run = tutorial(seed);
      expect(run.totalRooms).toBe(5);
      const first = currentRoom(content, run);
      expect(first.id).toBe('tutorial-path');
      expect(first.goal).not.toBeNull();
      expect(first.enemySpawns).toEqual([]);
      expect(first.stoneWaves.map((w) => w.spots.length)).toEqual([1, 2, 3]);
      const hall = content.rooms.find((r) => r.id === 'training-hall')!;
      expect(hall.enemySpawns.map((s) => `${s.wave}:${s.enemy}`)).toEqual([
        '1:practice-dummy', '1:practice-dummy', '1:practice-dummy',
        '2:big-practice-dummy',
        '3:swarmer', '3:swarmer',
      ]);
      const steps = content.rooms.find((r) => r.id === 'tutorial-hall')!;
      expect(steps.goal).toBeNull();
      expect(steps.enemySpawns.map((s) => `${s.wave}:${s.enemy}`)).toEqual(['1:brute', '2:swarmer', '2:swarmer', '2:swarmer', '2:swarmer']);
      const { runEvents } = play(run);
      expect(run.status).toBe('cleared');
      expect(run.usedRooms).toEqual(TUTORIAL_FLOOR.rooms.map((r) => r.id));
      expect(runEvents.filter((e) => e.kind === 'nextRoom').map((e) => e.kind === 'nextRoom' && e.door)).toEqual(['battle', 'battle', 'treasure', 'boss']);
      expect(run.elites).toEqual([]);
      expect(run.named).toBeNull();
    }
  });

  it('gives the Tower Path no grade (it has no fight)', () => {
    const { runEvents } = play(tutorial(2));
    const graded = runEvents.flatMap((e) => (e.kind === 'graded' ? [e.result.roomId] : []));
    expect(graded).not.toContain('tutorial-path');
    expect(graded).toContain('training-hall');
  });

  it('keeps every line a kid reads in the tutorial to 8 words or fewer (TUT-P1)', () => {
    const lines = loadTutorialLines(tutorialData);
    const texts: string[] = [...storyData.opening.cards, storyData.opening.sensei, storyData.close];
    for (const id of TUTORIAL_STEPS) {
      const l = lines[id];
      texts.push(...l.screens, ...[l.success, l.retry, l.nudge, l.help].filter((t): t is string => !!t));
    }
    const guided = new Set<string>([WARNING_LESSON, ...GUIDE_LESSONS, STRIKE_LESSON]);
    for (const l of firstSession.lessons as Array<Record<string, unknown>>) {
      if (!guided.has(l.id as string)) continue;
      for (const k of ['screens', 'success', 'retry', 'nudge']) {
        const v = l[k];
        if (typeof v === 'string') texts.push(v);
        else if (Array.isArray(v)) texts.push(...(v as string[]));
      }
    }
    expect(texts.length).toBeGreaterThan(40);
    const long = texts.filter((t) => t.trim().split(/\s+/).length > TUTORIAL_MAX_WORDS);
    expect(long).toEqual([]);
  });

  it('never puts tutorial rooms on a normal floor', () => {
    const tut = new Set(content.rooms.filter((r) => r.tutorial).map((r) => r.id));
    for (let seed = 1; seed <= 100; seed++) {
      const run = startRun(content, { seed, dryRuns: 0 });
      play(run, GUIDE_DONE, 900);
      for (const id of run.usedRooms) expect(tut.has(id)).toBe(false);
    }
  });

  it('lands the first Perfect Counter under five minutes after the floor starts (TUT-P1)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { worldEvents } = play(tutorial(seed));
      // The guided Counter is on First Steps Hall's Brute (a Swarmer may be countered earlier, unguided).
      const first = worldEvents.find((e) => e.kind === 'perfectCounter' && e.room === 'tutorial-hall');
      expect(first).toBeDefined();
      // Sim time only; the client adds the bow and the creation screen (timed check in the PR).
      expect(first!.tick / TICKS_PER_SECOND).toBeLessThan(300);
    }
  });

  it('starts the guided Counter in First Steps Hall, not before (TUT-B3)', () => {
    const at = (roomId: string) => createRunWorld(content, { ...tutorial(1), roomId }, BASE, [], undefined, 0).guide;
    expect(at('tutorial-path')).toBeNull();
    expect(at('training-hall')).toBeNull();
    expect(at('tutorial-hall')?.step).toBe(0);
  });

  it('picks the Insight automatically, with no menu', () => {
    const run = tutorial(3);
    const { runEvents } = play(run);
    expect(runEvents.some((e) => e.kind === 'insightChoice')).toBe(false);
    const gifts = runEvents.filter((e) => e.kind === 'insightGift');
    expect(gifts).toHaveLength(1);
    expect(run.insights).toEqual([gifts[0].kind === 'insightGift' && gifts[0].id]);
  });

  it('always gives Uncommon or better from the chest', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const { runEvents } = play(tutorial(seed));
      const chest = runEvents.filter((e) => e.kind === 'loot' && e.source === 'chest');
      expect(chest.length).toBeGreaterThan(0);
      for (const e of chest) if (e.kind === 'loot') expect(rarityRank(e.item.rarity)).toBeGreaterThanOrEqual(rarityRank(TUTORIAL_FLOOR.chestMinRarity));
    }
  });

  it('has an easy boss: a third of its health and no helpers', () => {
    const run = tutorial(1);
    run.roomId = 'tutorial-keep';
    const w = createRunWorld(content, run, BASE);
    const boss = w.enemies.find((e) => e.def.boss)!;
    // R-BAL-12: the white belt's enemy scale applies first.
    expect(boss.def.maxHealth).toBe(Math.round(Math.round(content.enemies['floor-keeper'].maxHealth * ENEMY_TRAINING_SCALE[0].maxHealth) * TUTORIAL_FLOOR.bossHealth));
    expect(boss.def.summon).toBeNull();
    expect(w.enemies).toHaveLength(1);
  });

  it("can't be lost by doing nothing, in any room", () => {
    for (const roomId of TUTORIAL_FLOOR.rooms.map((r) => r.id)) {
      // Guide finished (worst case: nothing holds still), standing still for 10 minutes.
      for (const goalReached of [false, true]) {
        const run = tutorial(7);
        run.roomId = roomId;
        const room = currentRoom(content, run);
        const w = createRunWorld(content, run, BASE, [], undefined, GUIDE_DONE);
        if (w.goal) w.goal.reached = goalReached;
        let lowest = Infinity;
        for (let t = 0; t < 600 * TICKS_PER_SECOND; t++) {
          stepWorld(w, room, { p1: IDLE });
          lowest = Math.min(lowest, w.players.p1.health);
          expect(w.events.some((e) => e.kind === 'playerDown' || e.kind === 'playerOut')).toBe(false);
          updateRun(content, run, w);
        }
        expect(lowest).toBeGreaterThanOrEqual(1);
        expect(run.status).toBe('playing');
      }
    }
  });

  it('holds the stones until the player reaches the glowing spot', () => {
    const run = tutorial(1);
    const room = currentRoom(content, run);
    const w = createRunWorld(content, run, BASE, [], undefined, 0);
    for (let t = 0; t < 200; t++) {
      stepWorld(w, room, { p1: IDLE });
      expect(w.events.some((e) => e.kind === 'stoneWarn')).toBe(false);
    }
    w.players.p1.pos = { ...w.goal!.pos };
    let warned = false;
    for (let t = 0; t < 100 && !warned; t++) {
      stepWorld(w, room, { p1: IDLE });
      warned = w.events.some((e) => e.kind === 'stoneWarn');
    }
    expect(warned).toBe(true);
  });

  it('a normal floor still lets health reach 0', () => {
    const run = startRun(content, { seed: 1, dryRuns: 0 });
    expect(createRunWorld(content, run, BASE).minHealth).toBe(0);
  });
});

describe('who gets the tutorial floor', () => {
  it('only a brand-new profile', async () => {
    const { getsTutorialFloor, newProfile } = await import('../src');
    const p = newProfile();
    expect(getsTutorialFloor(p)).toBe(true);
    expect(getsTutorialFloor({ ...p, runsStarted: 1 })).toBe(false);
    expect(getsTutorialFloor({ ...p, runsPlayed: 2, runsStarted: 0 })).toBe(false);
  });
});
