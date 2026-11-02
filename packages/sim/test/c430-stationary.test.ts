import { describe, expect, it } from 'vitest';
import { EnemyError, createWorld, distance, eliteDef, loadEnemy, loadRoom, stepWorld, type EliteRules, type PlayerInput } from '../src';
import bruteData from '../../../content/enemies/brute.json';
import drum from '../../../drafts/content/enemies/thunder-drum.json';
import sentry from '../../../drafts/content/enemies/sleepy-sentry.json';
import sprout from '../../../drafts/content/enemies/thorn-sprout.json';

const IDLE: PlayerInput = { kind: 'none' };
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

describe('C430: the stationary enemy flag', () => {
  it('thunder-drum, sleepy-sentry and thorn-sprout are stationary with a true speed of 0', () => {
    for (const data of [drum, sentry, sprout]) {
      expect(data.moveSpeedTilesPerSecond).toBe(0);
      const def = loadEnemy(clone(data));
      expect(def.stationary).toBe(true);
      expect(def.moveSpeedTilesPerSecond).toBe(0);
    }
  });

  it('the loader: stationary needs speed 0 (or none); every other enemy still needs a speed above 0', () => {
    const { moveSpeedTilesPerSecond: _speed, ...noSpeed } = clone(drum);
    expect(loadEnemy(noSpeed).moveSpeedTilesPerSecond).toBe(0);
    expect(() => loadEnemy({ ...clone(drum), moveSpeedTilesPerSecond: 0.01 })).toThrow(EnemyError);
    expect(() => loadEnemy({ ...clone(drum), stationary: 'yes' })).toThrow(EnemyError);
    expect(() => loadEnemy({ ...clone(bruteData), moveSpeedTilesPerSecond: 0 })).toThrow(EnemyError);
    expect(() => loadEnemy({ ...clone(bruteData), stationary: false, moveSpeedTilesPerSecond: 0 })).toThrow(EnemyError);
    expect(loadEnemy(clone(bruteData)).stationary).toBeUndefined();
  });

  it('an elite stationary enemy is still stationary at speed 0', () => {
    const def = loadEnemy(clone(drum));
    const rules = { kinds: { swift: { health: 1, power: 1, guard: 1, moveSpeed: 1.5, recover: 1 } } } as unknown as EliteRules;
    const e = eliteDef(def, 'swift' as never, rules);
    expect(e.stationary).toBe(true);
    expect(e.moveSpeedTilesPerSecond).toBe(0);
  });

  it('never moves, circles or paths, in sight or out, over 400 ticks; it still swings when you are in range', () => {
    const room = loadRoom({
      id: 'arena', name: 'Arena',
      tiles: ['################', '#..............#', '#..............#', '#..P...........#', '#..............#', '#..............#', '################'],
      enemies: [{ enemy: 'thorn-sprout', column: 12, row: 3 }],
    });
    const world = createWorld(room, ['p1'], { enemyTypes: { 'thorn-sprout': loadEnemy(clone(sprout)) }, respawnEnemies: false });
    const e = world.enemies[0];
    const start = { ...e.pos };
    let swung = false;
    for (let i = 0; i < 400; i++) {
      if (i === 200) world.players.p1.pos = { x: e.pos.x - 2, y: e.pos.y };
      stepWorld(world, room, { p1: IDLE });
      if (world.events.some((ev) => ev.kind === 'enemySwing')) swung = true;
      expect(distance(e.pos, start)).toBe(0);
      expect(e.path).toBeNull();
    }
    expect(swung).toBe(true);
  });
});
