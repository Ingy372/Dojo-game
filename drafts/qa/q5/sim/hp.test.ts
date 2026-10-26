import { it } from 'vitest';
import { writeFileSync } from 'fs';
import { TICKS_PER_SECOND, activeDoorSlots, createRunWorld, currentRoom, releaseWave, startRun, stepWorld, updateRun, type PlayerInput, type RunState, type WorldState } from '/workspace/dojo-game/packages/sim/src';
import { testContent } from '/workspace/dojo-game/packages/sim/test/load-content';
const content = testContent();
const BASE = { maxHealth: 100, power: 10, guard: 0 };
type Bot = 'idle' | 'masher';
function input(bot: Bot, w: WorldState, room: any, run: RunState, t: number): PlayerInput {
  const p = w.players.p1;
  if (w.goal && !w.goal.reached) return { kind: 'moveTo', ...w.goal.pos }; // both must get past the spot for fights to start
  if (w.guide?.waiting && bot === 'masher') return { kind: 'none', action: 'counter' }; // guided step blocks otherwise
  const foe = w.enemies.find((e) => e.mode !== 'defeated');
  if (bot === 'idle') {
    if (foe || !w.progress.cleared) return w.guide?.waiting && t > 60 * TICKS_PER_SECOND ? { kind: 'none', action: 'counter' } : { kind: 'none' };
  } else if (foe) return { kind: 'moveTo', x: foe.pos.x, y: foe.pos.y, action: t % 2 ? 'strike' : undefined } as PlayerInput;
  if (room.chest && !w.progress.chestOpened && w.progress.cleared) return { kind: 'moveTo', ...room.chest };
  if (w.progress.doorsOpen) { const d = room.doors[activeDoorSlots(room, run.doors.length)[0]]; return { kind: 'moveTo', x: d.x, y: d.y }; }
  return { kind: 'none' };
}
for (const bot of ['idle', 'masher'] as Bot[]) it(bot, () => {
  const rows: any[] = [];
  for (let seed = 1; seed <= 50; seed++) {
    const run = startRun(content, { seed, dryRuns: 0, tutorial: true });
    let minHp = 999, hits = 0, total = 0; const waves: string[] = []; const rooms: string[] = [];
    while (run.status === 'playing' && total < 900 * TICKS_PER_SECOND) {
      const room = currentRoom(content, run); rooms.push(room.id);
      const w = createRunWorld(content, run, BASE, [], undefined, 0);
      if (room.tutorial && room.kind === 'battle') w.waveHold = true;
      let next = false, rt = 0;
      while (!next && run.status === 'playing' && total < 900 * TICKS_PER_SECOND) {
        // like tapping Got it as soon as the room is empty
        if (w.waveHold && !w.enemies.some((e) => e.mode !== 'defeated') && (!w.goal || w.goal.reached) && releaseWave(w)) waves.push(room.id + ' t' + rt + ': ' + w.enemies.filter(e=>e.mode!=='defeated').map(e=>e.def.id+'@x'+Math.round(e.pos.x)).join(','));
        stepWorld(w, room, { p1: input(bot, w, room, run, rt) });
        total++; rt++;
        for (const ev of w.events) { if (ev.kind === 'hit' && (ev as any).targetId === 'p1') hits++; if (ev.kind === 'playerDown') hits += 1000; }
        minHp = Math.min(minHp, w.players.p1.health);
        next = updateRun(content, run, w).some((e) => e.kind === 'nextRoom');
      }
    }
    rows.push({ seed, minHp, hits, status: run.status, secs: Math.round(total / TICKS_PER_SECOND), rooms, waves: seed <= 2 ? waves : undefined });
  }
  writeFileSync(`/workspace/qa/q5/sim/${bot}.json`, JSON.stringify(rows, null, 1));
  const mins = rows.map((r) => r.minHp);
  console.log(bot, 'minHp', Math.min(...mins), 'status', [...new Set(rows.map((r) => r.status))], 'hits avg', rows.reduce((a, r) => a + r.hits, 0) / rows.length, 'secs avg', rows.reduce((a, r) => a + r.secs, 0) / rows.length);
}, 280000);
