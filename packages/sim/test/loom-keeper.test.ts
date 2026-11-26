// The Loom Keeper (Yellow Guardian, Nov 25; redesigned the same day so it never feels like the tutorial boss): it fights from a
// distance, throws its spool like a yo-yo, leaves sticky threads, and climbs onto its loom behind three spool pegs.
import { describe, expect, it } from 'vitest';
import { COMBAT, DIFFICULTY, MOVEMENT, TICKS_PER_SECOND, attackCovers, createWorld, currentAttack, distance, floorRooms, lidUp, loadEnemy, loadRoom, stickySlow, stepWorld, telegraphTicks, type Difficulty, type PlayerInput, type WorldState } from '../src';
import pegData from '../../../content/enemies/spool-peg.json';
import loomData from '../../../content/enemies/loom-keeper.json';
import { testContent } from './load-content';
import { playRun, SKILLS } from './balance/bot';
import { ARTISTS } from './r-bal-12-artists';

const R = MOVEMENT.playerRadius;
const loom = loadEnemy(loomData);
const attack = (name: string) => loom.attacks.find((a) => a.name === name)!;

/** The Loom Keeper with only one of its attacks (no phases), so a test sees that attack every time. */
function only(name: string) {
  return loadEnemy({ ...loomData, phases: undefined, summon: undefined, attacks: [loomData.attacks.find((a) => a.name === name)] });
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
    expect(loom.phases!.map((p) => p.atHealthFraction)).toEqual([1, 0.5, 0.33]);
    for (const n of ['thread line', 'crossing threads', 'big cloth']) expect(attack(n).counterable).toBe(false);
    expect(attack('spool toss').counterable).not.toBe(false);
    expect(loom.senseiAtDoor).toBe('Someone used to sew warm things here.');
    expect(loom.senseiAfterWin).toBe('Warm things are made to be shared.');
  });

  it('is nothing like the tutorial boss: no slam or sweep, no Swarmers, it keeps its distance and has a loom phase', () => {
    const keeper = testContent().enemies['floor-keeper'];
    const names = loom.attacks.map((a) => a.name);
    for (const a of keeper.attacks) expect(names).not.toContain(a.name);
    expect(loom.attacks.every((a) => a.area !== undefined)).toBe(true); // every move is thrown at the player, none in front of its body
    expect(loom.keepAway).toBeDefined();
    expect(loom.summon).toMatchObject({ enemy: 'spool-peg', count: 3, around: 'room' });
    expect(loom.lidWhileHelpers && loom.stillWhileHelpers && loom.dizzyAfterHelpers! > 0).toBe(true);
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

describe('Spool Toss', () => {
  it('lands a red circle where the player stands, then the spool comes back for a second circle', () => {
    const { room, world, p, e } = loft(only('spool toss'));
    untilWindup(world, room);
    expect(e.attackCenter).toEqual(p.pos);
    expect(currentAttack(e).counterable).not.toBe(false);
    expect(untilSwing(world, room, IDLE)).toBe(true);
    untilWindup(world, room);
    expect(e.followUpStage).toBe(2);
    expect(e.attackCenter).toEqual(p.pos);
  });

  it('a Great Counter on the return knocks it dizzy for longer than a normal Great Counter', () => {
    const { room, world, e } = loft(only('spool toss'));
    untilWindup(world, room);
    untilSwing(world, room, { kind: 'stick', x: -1, y: 0 });
    untilWindup(world, room);
    // Press Counter in the middle of the Perfect window.
    const w = DIFFICULTY.standard.counterWindowTicks;
    while (e.modeTicks > Math.floor(w / 2)) stepWorld(world, room, { p1: IDLE });
    stepWorld(world, room, { p1: { kind: 'none', action: 'counter' } });
    for (let i = 0; i < 20 && e.mode === 'windup'; i++) stepWorld(world, room, { p1: IDLE });
    expect(e.mode).toBe('stagger');
    expect(e.modeTicks).toBeGreaterThan(COMBAT.counter.perfectStaggerTicks);
  });
});

describe('Keeps its distance', () => {
  it('after an attack it glides away from a player standing close', () => {
    const { room, world, p, e } = loft(only('thread line'));
    p.pos = { x: e.pos.x - 1.8, y: e.pos.y };
    untilWindup(world, room);
    untilSwing(world, room, IDLE);
    for (let i = 0; i < 25 && e.mode !== 'chase'; i++) stepWorld(world, room, { p1: IDLE });
    const before = distance(e.pos, p.pos);
    for (let i = 0; i < 10; i++) stepWorld(world, room, { p1: IDLE });
    expect(distance(e.pos, p.pos)).toBeGreaterThan(before);
  });
});

describe('Sticky threads', () => {
  it('a snapped thread lies on the floor for a while: walking over it is slow, a Dash is not, and it never hurts', () => {
    const { room, world, p, e } = loft();
    untilWindup(world, room);
    untilSwing(world, room, { kind: 'stick', x: 0, y: -1 });
    expect(world.sticky.length).toBe(1);
    const t = world.sticky[0];
    expect(stickySlow(world, { x: 5, y: t.at })).toBe(attack('thread line').sticky!.slow);
    expect(stickySlow(world, { x: 5, y: t.at + 2 })).toBe(1);
    const hp = p.health;
    p.pos = { x: 5, y: t.at };
    const x0 = p.pos.x;
    stepWorld(world, room, { p1: { kind: 'stick', x: 1, y: 0 } });
    expect(p.pos.x - x0).toBeCloseTo((MOVEMENT.speedTilesPerSecond / TICKS_PER_SECOND) * t.slow, 3);
    expect(p.health).toBe(hp);
    void e;
    for (let i = 0; i < attack('thread line').sticky!.ticks + 2; i++) stepWorld(world, room, { p1: IDLE });
    expect(world.sticky.length).toBe(0);
  });
});

describe('The loom', () => {
  function loomFight() {
    const peg = loadEnemy(pegData);
    const tiles = ['####################', ...Array.from({ length: 12 }, (_, r) => (r === 9 ? '#.........P........#' : '#..................#')), '####################'];
    const room = loadRoom({ id: 'loft', name: 'Loft', tiles, enemies: [{ enemy: 'loom-keeper', column: 10, row: 3 }] });
    const world = createWorld(room, ['p1'], { enemyTypes: { 'loom-keeper': loom, 'spool-peg': peg }, difficulty: 'standard' });
    return { room, world, p: world.players.p1, e: world.enemies[0] };
  }

  it('at half health three spool pegs appear around the room; up on its loom it stays still and can not be hurt', () => {
    const { room, world, e } = loomFight();
    e.health = Math.floor(loom.maxHealth * 0.5);
    stepWorld(world, room, { p1: IDLE });
    const pegs = world.enemies.filter((x) => x.summoned);
    expect(pegs.length).toBe(3);
    expect(pegs.every((x) => x.def.id === 'spool-peg')).toBe(true);
    // spread around the room, far from each other
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) expect(distance(pegs[i].pos, pegs[j].pos)).toBeGreaterThan(4);
    expect(lidUp(world)).toBe(true);
    const at = { ...e.pos };
    for (let i = 0; i < 120; i++) stepWorld(world, room, { p1: IDLE });
    expect(e.pos).toEqual(at);
  });

  it('breaking the last peg tumbles it down dizzy', () => {
    const { room, world, p, e } = loomFight();
    e.health = Math.floor(loom.maxHealth * 0.5);
    stepWorld(world, room, { p1: IDLE });
    const pegs = world.enemies.filter((x) => x.summoned);
    for (const peg of pegs.slice(0, 2)) peg.mode = 'defeated';
    const last = pegs[2];
    last.health = 1;
    p.pos = { x: last.pos.x, y: last.pos.y + 0.9 };
    let dizzy = false;
    for (let i = 0; i < 60 && !dizzy; i++) {
      stepWorld(world, room, { p1: { kind: 'none', action: 'strike' } });
      dizzy = world.events.some((ev) => ev.kind === 'dizzy');
      p.focus = 100;
    }
    expect(dizzy).toBe(true);
    expect(e.mode).toBe('stagger');
    expect(e.modeTicks).toBeGreaterThan(loom.dizzyAfterHelpers! - 5);
    expect(lidUp(world)).toBe(false);
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

describe('Sunrise Garden (Yellow, tier 2)', () => {
  const content = testContent();
  const YELLOW = content.rooms.filter((r) => r.floorSet === 'sunrise-garden').map((r) => r.id);
  const t = ARTISTS.typical[1];
  const YELLOW_TYPICAL = { maxHealth: t.health, power: t.power, guard: t.guard };

  it('has its own 8 rooms; the Weaving Loft is the boss room, where the Loom Keeper fights alone', () => {
    expect(YELLOW.length).toBe(8);
    const loft = content.rooms.find((r) => r.id === 'y-weaving-loft')!;
    expect(loft.kind).toBe('boss');
    expect(loft.enemySpawns.map((s) => s.enemy)).toEqual(['loom-keeper']);
    expect(content.rooms.filter((r) => r.enemySpawns.some((s) => s.enemy === 'loom-keeper')).map((r) => r.id)).toEqual(['y-weaving-loft']);
  });

  it('only a Yellow belt climbs it; White belts keep their rooms and the Floor Keeper', () => {
    for (const tier of [1, 3, 4]) expect(floorRooms(content, tier).some((r) => r.floorSet === 'sunrise-garden'), `tier ${tier}`).toBe(false);
    expect(floorRooms(content, 2).every((r) => r.floorSet === 'sunrise-garden')).toBe(true);
  });

  for (const difficulty of ['guided', 'standard'] as const) {
    it(`a typical Yellow belt reaches and beats the Loom Keeper (${difficulty})`, () => {
      const N = 30;
      let reached = 0;
      let beat = 0;
      for (let seed = 1; seed <= N; seed++) {
        const r = playRun(content, seed, 'smart', SKILLS.typical, difficulty, YELLOW_TYPICAL, undefined, { tier: 2 });
        for (const room of r.rooms) expect(YELLOW).toContain(room.roomId);
        const boss = r.rooms.find((x) => x.roomId === 'y-weaving-loft');
        if (boss) {
          reached++;
          if (!boss.died) beat++;
        }
      }
      expect(reached).toBe(N);
      expect(beat / N).toBeGreaterThanOrEqual(0.8);
    }, 120000);
  }
});
