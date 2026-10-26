import { describe, expect, it } from 'vitest';
import { GUIDE_DONE, GUIDE_NUDGE_TICKS, GUIDE_LESSONS, createWorld, loadProfile, newProfile, loadEnemy, loadLessons, loadRoom, stepWorld, type PlayerInput, type WorldState } from '../src';
import bruteData from '../../../content/enemies/brute.json';
import lessonsData from '../../../content/tutorial/first-session-lessons.json';

const enemyTypes = { brute: loadEnemy(bruteData) };
const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['############', '#..........#', '#..........#', '#..P.......#', '#..........#', '#..........#', '############'],
  enemies: [{ enemy: 'brute', column: 5, row: 4 }],
});
import { holdSwing } from './hold-swing';

const IDLE: PlayerInput = { kind: 'none' };
const COUNTER: PlayerInput = { kind: 'none', action: 'counter' };

function world(guideStep?: number): WorldState {
  return createWorld(room, ['p1'], { enemyTypes, difficulty: 'standard', guideStep });
}

/** Plays standing still (pressing nothing) until the first enemy swing; returns every event kind seen. */
function untilSwing(w: WorldState, input: (w: WorldState) => PlayerInput = () => IDLE, max = 600): string[] {
  const seen: string[] = [];
  for (let i = 0; i < max; i++) {
    stepWorld(w, room, { p1: input(w) });
    seen.push(...w.events.map((e) => e.kind));
    if (w.events.some((e) => e.kind === 'enemySwing')) return seen;
  }
  return seen;
}

describe('guided first Counter', () => {
  it('is off unless asked for, so a player who never taps Counter gets hit', () => {
    const w = world();
    expect(w.guide).toBeNull();
    // Standing next to the brute the player auto-swings, so the Mash guard (B-MASHER-b) makes it a Block.
    expect(untilSwing(w)).toContain('block');
    const still = world();
    expect(untilSwing(still, (x) => (holdSwing(x.players.p1), IDLE))).toContain('hit');
  });

  it('holds still with the circle nearly full until Counter is tapped', () => {
    const w = world(0);
    const seen = untilSwing(w, () => IDLE, 300);
    expect(seen).toContain('guideStart');
    expect(seen).toContain('guideWait');
    expect(seen).not.toContain('hit');
    const tick = w.tick;
    const hp = w.players.p1.health;
    for (let i = 0; i < 500; i++) stepWorld(w, room, { p1: IDLE });
    expect(w.tick).toBe(tick); // nothing moves while waiting
    expect(w.players.p1.health).toBe(hp);
    expect(w.guide?.waiting).toBe(true);
  });

  it('turns the tap into a Perfect Counter and moves on to the next hint', () => {
    const w = world(0);
    const seen = untilSwing(w, (x) => (x.guide?.waiting ? COUNTER : IDLE));
    expect(seen).toContain('perfectCounter');
    expect(seen).not.toContain('hit');
    expect(w.guide?.step).toBe(1);
  });

  it('does not hold still on the hints, and finishes after the last one', () => {
    const w = world(1);
    expect(untilSwing(w)).not.toContain('guideWait');
    expect(w.guide?.step).toBe(2);
    expect(untilSwing(w)).not.toContain('guideWait');
    expect(w.guide).toBeNull();
    expect(createWorld(room, ['p1'], { enemyTypes, guideStep: GUIDE_DONE }).guide).toBeNull();
  });

  it('uses the lesson text from content', () => {
    const lessons = loadLessons(lessonsData);
    expect(lessons[GUIDE_LESSONS[0]].screens).toEqual(['Tap COUNTER... now!']);
    expect(lessons[GUIDE_LESSONS[0]].success).toBe('You did it! Great!');
    expect(() => loadLessons({ lessons: [] })).toThrow(/missing/);
  });

  it('starts for new players, and stays off for players who already finished a run', () => {
    expect(newProfile().guideStep).toBe(0);
    const old = { ...newProfile(), runsPlayed: 3 } as Record<string, unknown>;
    delete old.guideStep;
    expect(loadProfile(old).guideStep).toBe(GUIDE_DONE);
  });

  it('gives a calm nudge every 5 seconds of waiting, and keeps waiting for the tap', () => {
    const w = world(0);
    untilSwing(w, () => IDLE, 300);
    expect(w.guide?.waiting).toBe(true);
    let nudges = 0;
    for (let i = 0; i < GUIDE_NUDGE_TICKS * 3; i++) {
      stepWorld(w, room, { p1: IDLE });
      if (w.events.some((e) => e.kind === 'guideNudge')) nudges++;
    }
    expect(GUIDE_NUDGE_TICKS).toBe(100);
    expect(nudges).toBe(3);
    expect(w.guide?.waiting).toBe(true);
    expect(w.players.p1.health).toBe(w.players.p1.maxHealth);
    expect(untilSwing(w, (x) => (x.guide?.waiting ? COUNTER : IDLE))).toContain('perfectCounter');
    expect(loadLessons(lessonsData)[GUIDE_LESSONS[0]].nudge).toBeTruthy();
  });
});
