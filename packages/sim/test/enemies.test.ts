import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  EnemyError,
  allEnemiesBeaten,
  createWorld,
  distance,
  loadEnemy,
  loadRoom,
  stepWorld,
  type PlayerInput,
} from '../src';
import bruteData from '../../../content/enemies/brute.json';
import swarmerData from '../../../content/enemies/swarmer.json';
import shieldData from '../../../content/enemies/shield.json';
import bossData from '../../../content/enemies/floor-keeper.json';

const enemyTypes = {
  brute: loadEnemy(bruteData),
  swarmer: loadEnemy(swarmerData),
  shield: loadEnemy(shieldData),
  'floor-keeper': loadEnemy(bossData),
};

function arena(enemies: { enemy: string; column: number; row: number }[], respawnEnemies = true) {
  const room = loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: [
      '################',
      '#..............#',
      '#..............#',
      '#..P...........#',
      '#..............#',
      '#..............#',
      '#..............#',
      '################',
    ],
    enemies,
  });
  const world = createWorld(room, ['p1'], { enemyTypes, respawnEnemies });
  return { room, world, p: world.players.p1 };
}

const IDLE: PlayerInput = { kind: 'none' };

describe('enemy types', () => {
  it('all enemy files load, and every attack has at least half a second of warning', () => {
    for (const def of Object.values(enemyTypes)) {
      for (const a of def.attacks) expect(a.telegraphTicks).toBeGreaterThanOrEqual(10);
    }
  });

  it('swarmers move faster than brutes', () => {
    expect(enemyTypes.swarmer.moveSpeedTilesPerSecond).toBeGreaterThan(enemyTypes.brute.moveSpeedTilesPerSecond);
  });

  it('refuses a boss-sized enemy that is not marked as a boss', () => {
    expect(() => loadEnemy({ ...bossData, boss: false })).toThrow(EnemyError);
  });
});

describe('shield', () => {
  it('basic attacks bounce off; a Strike breaks the shield and lands', () => {
    const { room, world, p } = arena([{ enemy: 'shield', column: 6, row: 4 }]);
    const e = world.enemies[0];
    e.pos = { x: p.pos.x + 0.9, y: p.pos.y };
    e.mode = 'stagger';
    e.modeTicks = 1000;
    stepWorld(world, room, { p1: IDLE });
    expect(world.events.some((ev) => ev.kind === 'shieldBlock')).toBe(true);
    expect(e.health).toBe(e.def.maxHealth);
    expect(p.focus).toBe(0);

    p.focus = COMBAT.strike.focusCost;
    p.attackCooldown = 0;
    stepWorld(world, room, { p1: { kind: 'none', action: 'strike' } });
    expect(world.events.some((ev) => ev.kind === 'shieldBreak')).toBe(true);
    expect(e.health).toBeLessThan(e.def.maxHealth);
    expect(e.shieldUp).toBe(false);

    // Step back so basic attacks don't finish it off while the shield grows back.
    e.pos = { x: 13.5, y: 6.5 };
    for (let i = 0; i < e.def.shield!.regrowTicks + 1; i++) stepWorld(world, room, { p1: IDLE });
    expect(e.shieldUp).toBe(true);
  });
});

describe('several enemies', () => {
  it('never more than two attack at once, and they never stand inside each other', () => {
    const { room, world } = arena([
      { enemy: 'swarmer', column: 10, row: 2 },
      { enemy: 'swarmer', column: 11, row: 3 },
      { enemy: 'swarmer', column: 10, row: 5 },
      { enemy: 'swarmer', column: 12, row: 6 },
      { enemy: 'brute', column: 13, row: 4 },
    ]);
    let peakAttackers = 0;
    for (let t = 0; t < 600; t++) {
      stepWorld(world, room, { p1: IDLE });
      const n = world.enemies.filter((e) => e.mode === 'windup').length;
      peakAttackers = Math.max(peakAttackers, n);
      expect(n).toBeLessThanOrEqual(COMBAT.maxAttackersAtOnce);
    }
    expect(peakAttackers).toBe(2);
    const present = world.enemies.filter((e) => e.mode !== 'defeated');
    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const a = present[i];
        const b = present[j];
        expect(distance(a.pos, b.pos)).toBeGreaterThan((a.def.radius + b.def.radius) * 0.8);
      }
    }
  });

  it('in a floor room, beaten enemies stay beaten and the room counts as cleared', () => {
    const { room, world } = arena([{ enemy: 'swarmer', column: 10, row: 2 }], false);
    const e = world.enemies[0];
    expect(allEnemiesBeaten(world)).toBe(false);
    e.health = 1;
    e.pos = { ...world.players.p1.pos, x: world.players.p1.pos.x + 0.75 };
    for (let i = 0; i < 200; i++) stepWorld(world, room, { p1: IDLE });
    expect(e.mode).toBe('defeated');
    expect(allEnemiesBeaten(world)).toBe(true);
  });
});

describe('boss', () => {
  it('takes turns between its attacks and calls in two swarmers at half health', () => {
    const { room, world } = arena([{ enemy: 'floor-keeper', column: 9, row: 4 }], false);
    const boss = world.enemies[0];
    const names: string[] = [];
    for (let t = 0; t < 800 && names.length < 3; t++) {
      stepWorld(world, room, { p1: IDLE });
      world.players.p1.health = 100; // keep the player standing
      if (world.events.some((ev) => ev.kind === 'telegraph')) names.push(boss.def.attacks[boss.attackIndex].name);
    }
    expect(names).toEqual(['slam', 'sweep', 'slam']);

    boss.health = Math.floor(boss.def.maxHealth / 2);
    stepWorld(world, room, { p1: IDLE });
    const summon = world.events.find((ev) => ev.kind === 'summon');
    expect(summon).toBeDefined();
    expect(world.enemies.filter((e) => e.def.id === 'swarmer')).toHaveLength(2);
    stepWorld(world, room, { p1: IDLE });
    expect(world.enemies).toHaveLength(3);
  });
});
