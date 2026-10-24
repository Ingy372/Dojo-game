import { describe, expect, it } from 'vitest';
import { activeDoorSlots, chooseInsight, createRunWorld, createWorld, currentRoom, damage, loadEnemy, loadRoom, startRun, stepWorld, updateRun, type RunState } from '../src';
import bopperData from '../../../content/enemies/bopper.json';
import { testContent } from './load-content';

const content = testContent();
const bopper = loadEnemy(bopperData);

describe('Bouncy Bopper (A5)', () => {
  it('has the decided numbers: 110 Health, 16 power, disarmed push 8 (#102, #118)', () => {
    expect(bopper.maxHealth).toBe(110);
    expect(bopper.power).toBe(16);
    expect(bopper.weapon).toEqual({ id: 'padded-staff', disarmedPower: 8 });
    expect(bopper.attacks[0].telegraphTicks).toBe(16);
    expect(bopper.attacks[0].recoverTicks).toBe(18);
  });

  const room = loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['##########', '#........#', '#..P.....#', '#........#', '##########'],
    enemies: [{ enemy: 'bopper', column: 4, row: 2 }],
  });
  const hitDamage = (disarmed: number) => {
    const w = createWorld(room, ['p1'], { enemyTypes: { bopper }, player: { maxHealth: 100, power: 10, guard: 0 } });
    w.enemies[0].disarmed = disarmed;
    for (let t = 0; t < 200; t++) {
      stepWorld(w, room, { p1: { kind: 'none' } });
      const ev = w.events.find((e) => e.kind === 'hit');
      if (ev && ev.kind === 'hit') return ev.damage;
    }
    return -1;
  };

  it('bonks for 16 with the staff, and pushes for 8 when disarmed', () => {
    expect(hitDamage(0)).toBe(damage(16, 1, 0));
    expect(hitDamage(0.5)).toBe(damage(8, 1, 0));
  });

  /** Plays whole runs (enemies beaten at once, a random door each time) and lists every room visited. */
  const roomsVisited = (tier: number) => {
    const ids = new Set<string>();
    for (let seed = 1; seed <= 150; seed++) {
      const run: RunState = startRun(content, { seed, tier, dryRuns: 0 });
      for (let guard = 0; guard < 40 && run.status === 'playing'; guard++) {
        const room = currentRoom(content, run);
        ids.add(room.id);
        const world = createRunWorld(content, run, { maxHealth: 100, power: 10, guard: 0 });
        const p = world.players.p1;
        let moved = false;
        for (let t = 0; t < 400 && run.status === 'playing' && !moved; t++) {
          for (const e of world.enemies) if (e.mode !== 'defeated') (e.health = 0), (e.mode = 'defeated');
          if (run.insightChoices) chooseInsight(run, run.insightChoices[0]);
          if (room.chest && !world.progress.chestOpened && world.progress.cleared) p.pos = { x: room.chest.x, y: room.chest.y + 1 };
          else if (world.progress.doorsOpen) {
            const slots = activeDoorSlots(room, run.doors.length);
            const d = room.doors[slots[(seed + guard) % slots.length]];
            p.pos = { x: d.x, y: d.y + 1 };
          }
          stepWorld(world, room, { p1: { kind: 'none' } });
          moved = updateRun(content, run, world).some((e) => e.kind === 'nextRoom');
        }
      }
    }
    return ids;
  };

  it('only appears from Yellow belt (tier 2) onward', () => {
    const bopperRooms = content.rooms.filter((r) => r.enemySpawns.some((s) => s.enemy === 'bopper')).map((r) => r.id);
    expect(bopperRooms.length).toBeGreaterThan(0);
    const white = roomsVisited(1);
    const yellow = roomsVisited(2);
    for (const id of bopperRooms) expect(white.has(id)).toBe(false);
    expect(bopperRooms.some((id) => yellow.has(id))).toBe(true);
  });
});
