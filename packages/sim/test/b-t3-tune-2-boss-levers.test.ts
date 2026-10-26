// B-T3-TUNE-2a+2c: the Hearth Cook's pot lid (no damage while its sparks are up), its phase patterns,
// the one-second pause at each phase change, and a bot check of the whole fight.
import { describe, expect, it } from 'vitest';
import { createWorld, loadRoom, stepWorld, PHASE_HOLD_TICKS, type PlayerInput, type WorldState } from '../src';
import { testContent } from './load-content';
import { playRun, SKILLS, type RoomStats } from './balance/bot';

const content = testContent();
const IDLE: PlayerInput = { kind: 'none' };
const cook = content.enemies['hearth-cook'];

function arena() {
  const room = loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['######################', '#....................#', '#....................#', '#..P.................#', '#....................#', '#....................#', '#....................#', '#....................#', '######################'],
    enemies: [{ enemy: 'hearth-cook', column: 12, row: 5 }],
  });
  const world = createWorld(room, ['p1'], { enemyTypes: content.enemies, respawnEnemies: false });
  return { room, world, p: world.players.p1, boss: world.enemies[0] };
}

function freeze(world: WorldState): void {
  for (const e of world.enemies) {
    e.mode = 'stagger';
    e.modeTicks = 10000;
  }
}

/** Lets the player's auto attack land on the boss once; returns the boss's health lost and whether it clanged. */
function hitBoss(a: ReturnType<typeof arena>): { lost: number; clang: boolean; number: boolean } {
  const { world, room, p, boss } = a;
  boss.pos = { x: p.pos.x + 1.2, y: p.pos.y };
  p.attackCooldown = 0;
  const before = boss.health;
  let clang = false;
  let number = false;
  for (let t = 0; t < 30 && !clang && boss.health === before; t++) {
    stepWorld(world, room, { p1: IDLE });
    clang ||= world.events.some((ev) => ev.kind === 'clang' && ev.enemyId === boss.id);
    number ||= world.events.some((ev) => ev.kind === 'playerAttack' && ev.enemyId === boss.id);
  }
  return { lost: before - boss.health, clang, number };
}

const names = (k: number) => (cook.phases ?? [])[k].attacks.map((i) => cook.attacks[i].name);

describe('B-T3-TUNE-2a: Hearth Cook pot lid and patterns', () => {
  it('turns the lid on and uses the planned patterns, with wind-ups no shorter than before', () => {
    expect(cook.lidWhileHelpers).toBe(true);
    expect(names(0)).toEqual(['ladle bonk', 'rolling pin lane']);
    expect(names(1)).toEqual(['ladle bonk', 'hot pot rush', 'rolling pin lane']);
    expect(names(2)).toEqual(['hot pot rush', 'rolling pin lane', 'ladle bonk', 'rolling pin lane']);
    const tel = Object.fromEntries(cook.attacks.map((x) => [x.name, x.telegraphTicks]));
    expect(tel['rolling pin lane']).toBeGreaterThanOrEqual(26);
    expect(tel['ladle bonk']).toBeGreaterThanOrEqual(20);
  });

  it('takes 0 damage (a clang, no number) while a spark is up, and full damage after', () => {
    const a = arena();
    const full = hitBoss(a);
    expect(full.lost).toBeGreaterThan(0);
    // Drop it into phase 2: the sparks come out.
    a.boss.health = Math.floor(a.boss.def.maxHealth * 0.6);
    stepWorld(a.world, a.room, { p1: IDLE });
    const sparks = a.world.enemies.filter((e) => e.summoned);
    expect(sparks.length).toBe(2);
    for (let t = 0; t < PHASE_HOLD_TICKS + 2; t++) stepWorld(a.world, a.room, { p1: IDLE });
    freeze(a.world);
    for (const s of sparks) s.pos = { x: 18, y: 7 };
    const lid = hitBoss(a);
    expect(lid.clang).toBe(true);
    expect(lid.lost).toBe(0);
    expect(lid.number).toBe(false);
    // One spark left: still lidded.
    sparks[0].mode = 'defeated';
    expect(hitBoss(a).lost).toBe(0);
    sparks[1].mode = 'defeated';
    const after = hitBoss(a);
    expect(after.clang).toBe(false);
    expect(after.lost).toBe(full.lost);
  });

  it('cycles a pattern that names an attack twice (sparks, pin, bonk, pin)', () => {
    const a = arena();
    a.boss.health = Math.floor(a.boss.def.maxHealth * 0.3);
    for (const s of a.world.enemies) if (s !== a.boss) s.mode = 'defeated';
    const seen: string[] = [];
    let last = -1;
    for (let t = 0; t < 20 * 90 && seen.length < 8; t++) {
      a.world.players.p1.health = a.world.players.p1.maxHealth;
      a.world.players.p1.pos = { x: a.boss.pos.x - 2.5, y: a.boss.pos.y };
      stepWorld(a.world, a.room, { p1: IDLE });
      const started = a.boss.mode === 'windup' && a.boss.modeTicks === a.boss.windupTotal - 1;
      if (a.boss.mode === 'windup' && last !== t - 1) seen.push(a.boss.def.attacks[a.boss.attackIndex].name ?? '');
      if (a.boss.mode === 'windup') last = t;
      void started;
    }
    expect(seen.slice(0, 8)).toEqual([...names(2), ...names(2)]);
  });
});

describe('B-T3-TUNE-2c: phase pause', () => {
  it('holds once at 66% and once at 33%; nothing moves or is hurt during it', () => {
    const a = arena();
    const holds: { phase: number; line: string | null }[] = [];
    const pause = (fraction: number, phase: number) => {
      a.boss.health = Math.floor(a.boss.def.maxHealth * fraction);
      stepWorld(a.world, a.room, { p1: IDLE });
      const ev = a.world.events.find((e) => e.kind === 'phaseHold');
      expect(ev && ev.kind === 'phaseHold' && ev.phase).toBe(phase);
      if (ev?.kind === 'phaseHold') holds.push({ phase: ev.phase, line: ev.senseiLine });
      const snap = JSON.stringify(a.world.enemies.map((e) => [e.pos, e.health, e.mode, e.modeTicks]));
      const p = a.world.players.p1;
      const pSnap = JSON.stringify([p.pos, p.health]);
      for (let t = 0; t < PHASE_HOLD_TICKS; t++) {
        stepWorld(a.world, a.room, { p1: { kind: 'moveTo', x: 18, y: 7 }, });
        expect(a.world.events).toEqual([]);
      }
      expect(JSON.stringify(a.world.enemies.map((e) => [e.pos, e.health, e.mode, e.modeTicks]))).toBe(snap);
      expect(JSON.stringify([p.pos, p.health])).toBe(pSnap);
      stepWorld(a.world, a.room, { p1: IDLE });
      expect(a.world.phaseHoldTicks).toBe(0);
    };
    pause(0.6, 1);
    // Staying in phase 2 never holds again.
    a.boss.health -= 5;
    for (let t = 0; t < 5; t++) {
      stepWorld(a.world, a.room, { p1: IDLE });
      expect(a.world.events.some((e) => e.kind === 'phaseHold')).toBe(false);
    }
    pause(0.3, 2);
    expect(holds.map((h) => h.line)).toEqual([cook.phases![1].senseiLine, cook.phases![2].senseiLine]);
    expect(PHASE_HOLD_TICKS).toBeGreaterThanOrEqual(17);
    expect(PHASE_HOLD_TICKS).toBeLessThanOrEqual(23);
  });
});

describe('B-T3-TUNE-2: bot fight at Orange gear (great-hearth, tier 3)', () => {
  const gear = { maxHealth: 332.79, power: 45.85, guard: 33.53 };
  const N = 60;
  const fights = (style: 'smart' | 'masher', skill: 'typical' | 'novice', diff: 'standard' | 'challenge') => {
    const out: RoomStats[] = [];
    let reached = 0;
    for (let s = 1; s <= N; s++) {
      const r = playRun(content, s, style, SKILLS[skill], diff, gear, undefined, { tier: 3 });
      const b = r.rooms.find((x) => x.roomId === 'great-hearth');
      if (!b) continue;
      reached++;
      out.push(b);
    }
    const won = out.filter((b) => !b.died);
    const sec = (f: (b: RoomStats) => number) => won.reduce((t, b) => t + f(b), 0) / Math.max(1, won.length) / 20;
    return {
      reached,
      won: won.length,
      noHolds: sec((b) => b.ticks),
      withHolds: sec((b) => b.ticks + (b.holdTicks ?? 0)),
    };
  };

  it('typical wins every fight; the masher wins at least 75% on Standard; 12-15 s without pauses, 14-20 s with (floor 14: Manager, #295)', () => {
    const lines: string[] = [];
    const typical = fights('smart', 'typical', 'standard');
    const masher = fights('masher', 'novice', 'standard');
    for (const [n, r] of [['standard/smart-typical', typical], ['standard/masher-novice', masher], ['standard/smart-novice', fights('smart', 'novice', 'standard')], ['challenge/smart-typical', fights('smart', 'typical', 'challenge')], ['challenge/masher-novice', fights('masher', 'novice', 'challenge')]] as const) {
      lines.push(`${n}: won ${r.won}/${r.reached}, ${r.noHolds.toFixed(1)} s without pauses, ${r.withHolds.toFixed(1)} s with`);
    }
    (globalThis as { console?: { log(s: string): void } }).console?.log(lines.join('\n'));
    expect(typical.reached).toBe(N);
    expect(typical.won).toBe(N);
    expect(masher.won / masher.reached).toBeGreaterThanOrEqual(0.75);
    expect(typical.noHolds).toBeGreaterThanOrEqual(12);
    expect(typical.noHolds).toBeLessThanOrEqual(15);
    expect(typical.withHolds).toBeGreaterThanOrEqual(14);
    expect(typical.withHolds).toBeLessThanOrEqual(20);
  }, 600000);
});
