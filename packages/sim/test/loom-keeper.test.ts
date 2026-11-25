// The Loom Keeper (Yellow Guardian, Nov 25): its thread and cloth attacks always warn, and stepping out always works.
import { describe, expect, it } from 'vitest';
import { COMBAT, DIFFICULTY, MOVEMENT, TICKS_PER_SECOND, attackCovers, createWorld, currentAttack, loadEnemy, loadRoom, stepWorld, telegraphTicks, type Difficulty, type PlayerInput, type WorldState } from '../src';
import loomData from '../../../content/enemies/loom-keeper.json';
import { testContent } from './load-content';

const R = MOVEMENT.playerRadius;
const loom = loadEnemy(loomData);
const attack = (name: string) => loom.attacks.find((a) => a.name === name)!;

/** The Loom Keeper with only one of its attacks (no phases), so a test sees that attack every time. */
function only(name: string) {
  return loadEnemy({ ...loomData, phases: undefined, attacks: [loomData.attacks.find((a) => a.name === name)] });
}

/** The weaving loft's size (18 x 12 inside), the boss above the player. */
function loft(def = only('thread line'), difficulty: Difficulty = 'standard') {
  const tiles = ['####################', ...Array.from({ length: 12 }, (_, r) => (r === 9 ? '#.............P....#' : '#..................#')), '####################'];
  const room = loadRoom({ id: 'loft', name: 'Loft', tiles, enemies: [{ enemy: def.id, column: 15, row: 5 }] });
  const world = createWorld(room, ['p1'], { enemyTypes: { [def.id]: def }, difficulty });
  return { room, world, p: world.players.p1, e: world.enemies[0] };
}

const IDLE: PlayerInput = { kind: 'none' };

/** Steps (standing still) until the boss starts winding up. */
function untilWindup(world: WorldState, room: ReturnType<typeof loft>['room']): void {
  for (let i = 0; i < 600; i++) {
    stepWorld(world, room, { p1: IDLE });
    if (world.enemies[0].mode === 'windup') return;
  }
  throw new Error('no wind-up');
}

/** Steps with this input until the swing lands; returns whether the player was hit. */
function untilSwing(world: WorldState, room: ReturnType<typeof loft>['room'], input: PlayerInput): boolean {
  for (let i = 0; i < 200; i++) {
    stepWorld(world, room, { p1: input });
    if (world.events.some((ev) => ev.kind === 'enemySwing')) return world.events.some((ev) => ev.kind === 'hit' || ev.kind === 'block');
  }
  throw new Error('no swing');
}

describe('the Loom Keeper file', () => {
  it('loads with its three parts, and the thread and cloth can never be Countered', () => {
    expect(testContent().enemies['loom-keeper'].name).toBe('The Loom Keeper');
    expect(loom.phases!.map((p) => p.atHealthFraction)).toEqual([1, 0.66, 0.33]);
    for (const n of ['thread line', 'crossing threads', 'big cloth']) expect(attack(n).counterable).toBe(false);
    expect(attack('spool drop').counterable).not.toBe(false);
    expect(loom.senseiAtDoor).toBe('Someone used to sew warm things here.');
    expect(loom.senseiAfterWin).toBe('Warm things are made to be shared.');
  });

  it('every kid line is 8 words or fewer', () => {
    const lines = [loom.senseiAtDoor!, loom.senseiAfterWin!, ...loom.phases!.map((p) => p.senseiLine!), loomData.lines.freed, loomData.bestiary.tip];
    for (const l of lines) expect(l.split(/\s+/).length, l).toBeLessThanOrEqual(8);
  });

  it('refuses a thread or cloth it does not know', () => {
    expect(() => loadEnemy({ ...loomData, attacks: [{ ...loomData.attacks[1], area: 'wave' }] })).toThrow(/area/);
    expect(() => loadEnemy({ ...loomData, attacks: [{ ...loomData.attacks[0], lineAxis: 'down' }] })).toThrow(/lineAxis/);
  });
});

describe('Thread Line', () => {
  it('runs wall to wall through where the player stands, and catches them if they stay', () => {
    const { room, world, p, e } = loft();
    untilWindup(world, room);
    expect(e.attackArea).toEqual({ kind: 'line', axis: 'x', at: p.pos.y });
    expect(attackCovers(e, { x: 1.5, y: p.pos.y })).toBe(true); // the far wall end too
    expect(untilSwing(world, room, IDLE)).toBe(true);
  });

  it('a step off the thread is safe, and there is plenty of time for it', () => {
    const { room, world, e } = loft();
    untilWindup(world, room);
    const need = currentAttack(e).areaRadius + R * 0.5;
    expect(e.modeTicks * (MOVEMENT.speedTilesPerSecond / TICKS_PER_SECOND)).toBeGreaterThan(need * 2);
    expect(untilSwing(world, room, { kind: 'stick', x: 0, y: -1 })).toBe(false);
  });

  it('"both" takes turns: across, then up and down', () => {
    const { room, world, e } = loft(only('crossing threads'));
    const axes: string[] = [];
    for (let k = 0; k < 3; k++) {
      untilWindup(world, room);
      axes.push((e.attackArea as { axis: string }).axis);
      untilSwing(world, room, { kind: 'stick', x: k % 2 ? 0 : 1, y: k % 2 ? 1 : 0 });
    }
    expect(axes).toEqual(['x', 'y', 'x']);
  });
});

describe('Big Cloth', () => {
  it("covers the player's side and reaches a little past them toward the middle", () => {
    const { room, world, p, e } = loft(only('big cloth'));
    untilWindup(world, room);
    const area = e.attackArea as { kind: string; side: number; edge: number };
    expect(area.kind).toBe('cloth');
    expect(area.side).toBe(p.pos.x >= room.width / 2 ? 1 : -1);
    expect(area.edge).toBeCloseTo(p.pos.x - area.side * currentAttack(e).areaRadius);
    expect(attackCovers(e, { x: area.side > 0 ? room.width - 1.5 : 1.5, y: 2 })).toBe(true); // all the way to the wall
    expect(untilSwing(world, room, IDLE)).toBe(true);
  });

  it('walking toward the middle gets out in time on every difficulty, even without a Dash', () => {
    for (const d of ['guided', 'standard', 'challenge'] as Difficulty[]) {
      const ticks = telegraphTicks(attack('big cloth'), d);
      const walk = ticks * (MOVEMENT.speedTilesPerSecond / TICKS_PER_SECOND);
      expect(walk, d).toBeGreaterThan(attack('big cloth').areaRadius + R * 0.5 + 1);
      const { room, world, p } = loft(only('big cloth'), d);
      untilWindup(world, room);
      const side = p.pos.x >= room.width / 2 ? 1 : -1;
      expect(untilSwing(world, room, { kind: 'stick', x: -side, y: 0 }), d).toBe(false);
    }
  });

  it('warns for at least 1.5 seconds on Standard (more on Guided)', () => {
    expect(telegraphTicks(attack('big cloth'), 'standard')).toBeGreaterThanOrEqual(1.5 * TICKS_PER_SECOND);
    expect(telegraphTicks(attack('big cloth'), 'guided')).toBeGreaterThan(telegraphTicks(attack('big cloth'), 'standard'));
    expect(DIFFICULTY.guided.counterWindowTicks).toBeGreaterThan(0);
    expect(COMBAT.maxAttackersAtOnce).toBeGreaterThan(0);
  });
});
