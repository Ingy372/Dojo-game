import { describe, expect, it } from 'vitest';
import { TICKS_PER_SECOND, activeDoorSlots, createWorld, facePlayer, stepWorld } from '../src';
import { testContent } from './load-content';

// TUT-T3 (Jay, Nov 18): the Tower door opens after the stones, but the hero goes in only after the bow.
const room = testContent().rooms.find((r) => r.id === 'tutorial-path')!;

describe('TUT-T3 the door waits for the bow', () => {
  it("an open door can't be walked through while held, and can once the hold is off", () => {
    const w = createWorld(room, ['p1'], { doorCount: 1, respawnEnemies: false });
    w.players.p1.pos = { ...room.goal! };
    w.doorHold = true;
    for (let t = 0; t < 200 * TICKS_PER_SECOND && !w.progress.doorsOpen; t++) stepWorld(w, room, { p1: { kind: 'none' } });
    expect(w.progress.doorsOpen).toBe(true);
    const door = room.doors[activeDoorSlots(room, w.progress.doorCount)[0]];
    w.players.p1.pos = { x: door.x, y: door.y + 0.7 };
    stepWorld(w, room, { p1: { kind: 'none' } });
    expect(w.events.some((e) => e.kind === 'doorEntered')).toBe(false);
    w.doorHold = false;
    w.players.p1.pos = { x: door.x, y: door.y + 0.7 };
    stepWorld(w, room, { p1: { kind: 'none' } });
    expect(w.events.some((e) => e.kind === 'doorEntered')).toBe(true);
  });

  it('facePlayer turns the hero toward the door and stops any walk', () => {
    const w = createWorld(room, ['p1']);
    w.players.p1.path = [{ x: 3, y: 3 }] as never;
    facePlayer(w, 'p1', { x: 0, y: -2 });
    expect(w.players.p1.facing).toEqual({ x: 0, y: -1 });
    expect(w.players.p1.path).toBeNull();
  });
});
