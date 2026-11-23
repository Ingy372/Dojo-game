import { it } from 'vitest';
import { TICKS_PER_SECOND, createWorld, stepWorld } from '../src';
import { testContent } from './load-content';
const room = testContent().rooms.find((r) => r.id === 'tutorial-path')!;
it('dbg', () => {
  const w = createWorld(room, ['p1'], { doorCount: 1 });
  w.players.p1.pos = { ...room.goal! };
  for (let t = 0; t < 200 * TICKS_PER_SECOND && !w.progress.doorsOpen; t++) stepWorld(w, room, { p1: { kind: 'none' } });
  console.log(JSON.stringify({ p: w.progress, st: w.stones?.done, goal: w.goal }));
});
