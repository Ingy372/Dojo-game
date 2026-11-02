import { describe, expect, it } from 'vitest';
import { holdSwing } from './hold-swing';
import { COMBAT, EnemyError, createWorld, distance, loadEnemy, loadRoom, stepWorld, type WorldState } from '../src';
import puffData from '../../../drafts/content/enemies/bellows-puff.json';

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const puff = loadEnemy(clone(puffData));

const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['##########', '#........#', '#..P.....#', '#........#', '##########'],
  enemies: [{ enemy: 'bellows-puff', column: 4, row: 2 }],
});

function setup(playerAt?: { x: number; y: number }) {
  const w = createWorld(room, ['p1'], { enemyTypes: { 'bellows-puff': puff }, player: { maxHealth: 100, power: 10, guard: 0 } });
  const p = w.players.p1;
  const e = w.enemies[0];
  e.pos = { x: 4.5, y: 2.5 };
  p.pos = playerAt ?? { x: 3.2, y: 2.5 };
  return { w, p, e };
}
/** Steps until the swing resolves; `prep` runs before each tick. */
function untilSwing(w: WorldState, prep: () => void) {
  for (let t = 0; t < 200; t++) {
    prep();
    stepWorld(w, room, { p1: { kind: 'none' } });
    if (w.events.some((ev) => ev.kind === 'enemySwing')) return true;
  }
  return false;
}

describe('C430: Bellows Puff no-damage push', () => {
  it('the loader reads the push block; the default distance is the fixed COMBAT value', () => {
    expect(puff.push).toEqual({ distanceTiles: COMBAT.enemyPushTiles });
    expect(() => loadEnemy({ ...clone(puffData), push: { damage: 3 } })).toThrow(EnemyError);
    expect(() => loadEnemy({ ...clone(puffData), push: { damage: 0, intoHazard: true } })).toThrow(EnemyError);
    expect(loadEnemy({ ...clone(puffData), push: { damage: 0, distanceTiles: 2 } }).push?.distanceTiles).toBe(2);
    const { push: _push, ...plain } = clone(puffData);
    expect(loadEnemy(plain).push).toBeUndefined();
  });

  it('a Hit does no damage and slides the player the fixed distance straight away; the combo stays', () => {
    const { w, p } = setup();
    p.combo = 3;
    const before = { ...p.pos };
    expect(untilSwing(w, () => holdSwing(p))).toBe(true);
    expect(w.events.some((ev) => ev.kind === 'hit')).toBe(false);
    expect(w.events.find((ev) => ev.kind === 'push')).toMatchObject({ kind: 'push', playerId: 'p1', tiles: COMBAT.enemyPushTiles });
    expect(p.health).toBe(p.maxHealth);
    expect(w.progress.damageTaken).toBe(0);
    expect(p.combo).toBe(3);
    expect(distance(p.pos, before)).toBeCloseTo(COMBAT.enemyPushTiles, 1);
    expect(p.pos.x).toBeLessThan(before.x); // away from the Puff, which stands to the right
    expect(p.pos.y).toBeCloseTo(before.y, 5);
  });

  it('never pushes into or through a wall', () => {
    const { w, p } = setup({ x: 1.6, y: 2.5 });
    expect(untilSwing(w, () => holdSwing(p))).toBe(true);
    expect(p.pos.x).toBeGreaterThanOrEqual(1 + 0.3); // the left wall tile ends at x = 1
    const pushed = w.events.find((ev) => ev.kind === 'push');
    expect(pushed && pushed.kind === 'push' && pushed.tiles).toBeLessThan(COMBAT.enemyPushTiles);
    expect(p.health).toBe(p.maxHealth);
  });

  it('a Block holds its ground: no damage and no slide', () => {
    const { w, p } = setup();
    const before = { ...p.pos };
    expect(untilSwing(w, () => (p.guardTicks = 30))).toBe(true);
    expect(w.events.find((ev) => ev.kind === 'block')).toMatchObject({ kind: 'block', damage: 0 });
    expect(w.events.some((ev) => ev.kind === 'push')).toBe(false);
    expect(p.health).toBe(p.maxHealth);
    expect(p.pos).toEqual(before);
  });

  it('a Perfect Counter still works on the Puff', () => {
    const { w, p } = setup();
    expect(untilSwing(w, () => ((p.guardTicks = 30), (p.counterPressedTick = w.tick)))).toBe(true);
    expect(w.events.some((ev) => ev.kind === 'perfectCounter')).toBe(true);
    expect(w.events.some((ev) => ev.kind === 'push')).toBe(false);
  });
});
