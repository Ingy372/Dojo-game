import { describe, expect, it } from 'vitest';
import {
  GUIDE_DONE,
  TICKS_PER_SECOND,
  TUTORIAL_FLOOR,
  TUTORIAL_STEPS,
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
import { testContent } from './load-content';

const content = testContent();
const BASE = { maxHealth: 100, power: 10, guard: 0 };
const IDLE: PlayerInput = { kind: 'none' };
const tutorial = (seed = 1) => startRun(content, { seed, dryRuns: 0, tutorial: true });

/**
 * A plain player: walks to the glowing spot, then to the nearest enemy (basic attacks are
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

  it('is always the glowing-spot room (Brute first, then the K24a waves), then the chest, then the boss, then home', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const run = tutorial(seed);
      expect(run.totalRooms).toBe(3);
      const first = currentRoom(content, run);
      expect(first.goal).not.toBeNull();
      expect(first.enemySpawns.map((s) => `${s.wave}:${s.enemy}`)).toEqual([
        '1:brute',
        '2:swarmer', '2:swarmer', '2:swarmer', '2:brute',
        '3:swarmer', '3:swarmer',
        '4:swarmer', '4:swarmer', '4:swarmer', '4:swarmer',
      ]);
      const { runEvents } = play(run);
      expect(run.status).toBe('cleared');
      expect(run.usedRooms.map((id) => content.rooms.find((r) => r.id === id)!.kind)).toEqual(['battle', 'treasure', 'boss']);
      expect(runEvents.filter((e) => e.kind === 'nextRoom').map((e) => e.kind === 'nextRoom' && e.door)).toEqual(['treasure', 'boss']);
      expect(run.elites).toEqual([]);
      expect(run.named).toBeNull();
    }
  });

  it('never puts tutorial rooms on a normal floor', () => {
    const tut = new Set(content.rooms.filter((r) => r.tutorial).map((r) => r.id));
    for (let seed = 1; seed <= 100; seed++) {
      const run = startRun(content, { seed, dryRuns: 0 });
      play(run, GUIDE_DONE, 900);
      for (const id of run.usedRooms) expect(tut.has(id)).toBe(false);
    }
  });

  it('lands the first Perfect Counter well under 2 minutes after the floor starts', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { worldEvents } = play(tutorial(seed));
      const first = worldEvents.find((e) => e.kind === 'perfectCounter');
      expect(first?.room).toBe('tutorial-hall');
      // Sim time only; the client adds the bow and the creation screen (timed check in the PR).
      expect(first!.tick / TICKS_PER_SECOND).toBeLessThan(60);
    }
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
    expect(boss.def.maxHealth).toBe(Math.round(content.enemies['floor-keeper'].maxHealth * TUTORIAL_FLOOR.bossHealth));
    expect(boss.def.summon).toBeNull();
    expect(w.enemies).toHaveLength(1);
  });

  it("can't be lost by doing nothing, in any room", () => {
    for (const roomId of ['tutorial-hall', 'tutorial-vault', 'tutorial-keep']) {
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

  it('keeps the enemies waiting until the player reaches the glowing spot', () => {
    const run = tutorial(1);
    const room = currentRoom(content, run);
    const w = createRunWorld(content, run, BASE, [], undefined, 0);
    const start = { ...w.enemies[0].pos };
    for (let t = 0; t < 200; t++) stepWorld(w, room, { p1: IDLE });
    expect(w.enemies[0].pos).toEqual(start);
    expect(w.enemies[0].mode).toBe('waiting');
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
