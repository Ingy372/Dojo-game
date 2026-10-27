// R-CHALLENGE P3: Challenge pattern attacks start on screen (SIM_VIEW, tied to the client camera),
// only one pattern wind-up at a time, nobody starts any attack during a two-part attack, and a flagged
// dash lane never starts over another enemy's red circle (Challenge only). Test-only sample enemies.
import { describe, expect, it } from 'vitest';
import {
  SIM_VIEW, attackBox, createRng, nextFloat, createRunWorld, createWorld, currentAttack, currentRoom, distance, loadEnemy, loadRoom, simViewRect, startRun, stepWorld,
  type Difficulty, type EnemyAttackDef, type EnemyDef, type EnemyState, type Room, type WorldState,
} from '../src';
import { SUPPORTED_SIZES, TOP_STRIP_TILES, VISIBLE_ROWS, cameraBounds, viewTiles } from '../../../apps/client/src/game/cameraView';
import gameSceneRaw from '../../../apps/client/src/scenes/GameScene.ts?raw';
import bruteData from '../../../content/enemies/brute.json';
import rollingPinData from '../../../content/enemies/rolling-pin.json';
import hearthCookData from '../../../content/enemies/hearth-cook.json';
import { testContent } from './load-content';
import { holdSwing } from './hold-swing';
import { playRoom, SKILLS } from './balance/bot';

describe('R-CHALLENGE P3: SIM_VIEW is the smallest client view', () => {
  it('width and height are the minimum over every supported size (client camera math)', () => {
    const views = SUPPORTED_SIZES.map(([w, h]) => viewTiles(w, h));
    expect(SIM_VIEW.width).toBeCloseTo(Math.min(...views.map((v) => v.width)), 9);
    expect(SIM_VIEW.height).toBeCloseTo(Math.min(...views.map((v) => v.height)), 9);
    expect(SIM_VIEW.height).toBe(VISIBLE_ROWS);
    expect(SIM_VIEW.topStrip).toBe(TOP_STRIP_TILES);
    expect(viewTiles(1024, 768).width).toBe(9);
  });

  it('GameScene uses the shared camera math', () => {
    expect(gameSceneRaw).toMatch(/from '\.\.\/game\/cameraView'/);
    expect(gameSceneRaw).toMatch(/cameraBounds\(this\.room\.width, this\.room\.height/);
    expect(gameSceneRaw).not.toMatch(/const VISIBLE_ROWS/);
  });

  it('the sim view sits inside the client view at every size, room and spot', () => {
    const rng = createRng(7);
    const TILE = 48;
    for (let k = 0; k < 2000; k++) {
      const room = { width: 5 + Math.floor(nextFloat(rng) * 30), height: 4 + Math.floor(nextFloat(rng) * 20) } as Room;
      const at = { x: nextFloat(rng) * room.width, y: nextFloat(rng) * room.height };
      const s = simViewRect(room, at);
      for (const [w, h] of SUPPORTED_SIZES) {
        const v = viewTiles(w, h);
        const b = cameraBounds(room.width, room.height, v.width * TILE, v.height * TILE, TILE);
        // Phaser: the follow camera centres on the player, clamped to the bounds.
        const x0 = Math.min(Math.max(at.x * TILE - (v.width * TILE) / 2, b.x), b.x + b.width - v.width * TILE) / TILE;
        const y0 = Math.min(Math.max(at.y * TILE - (v.height * TILE) / 2, b.y), b.y + b.height - v.height * TILE) / TILE;
        expect(s.x0).toBeGreaterThanOrEqual(x0 - 1e-9);
        expect(s.y0).toBeGreaterThanOrEqual(y0 - 1e-9);
        expect(s.x1).toBeLessThanOrEqual(x0 + v.width + 1e-9);
        expect(s.y1).toBeLessThanOrEqual(y0 + v.height + 1e-9);
      }
    }
  });
});

describe('R-CHALLENGE P3: loader', () => {
  it('loads noOverlapWithRedCircle on the Rolling Pin roll and the Hearth Cook lane only', () => {
    expect(loadEnemy(rollingPinData).attacks[0].noOverlapWithRedCircle).toBe(true);
    const cook = loadEnemy(hearthCookData);
    expect(cook.attacks.filter((a) => a.noOverlapWithRedCircle).map((a) => a.counterable)).toEqual([false]);
    expect('noOverlapWithRedCircle' in loadEnemy(bruteData).attacks[0]).toBe(false);
    expect(Object.values(testContent().enemies).flatMap((d) => d.attacks.filter((a) => a.noOverlapWithRedCircle)).length).toBe(2);
  });
});

const FAR = { name: 'far slam', strength: 1, startRange: 1.3, reach: 6, areaRadius: 0.9, telegraphTicks: 20, recoverTicks: 18 };
const DOUBLE = { name: 'double slam', strength: 1, startRange: 1.3, reach: 0.9, areaRadius: 0.95, telegraphTicks: 20, recoverTicks: 18, followUp: { strength: 0.6, gapTicks: 30 } };
const withBlock = (id: string, block: unknown) => loadEnemy({ ...bruteData, id, challenge: block });
const AT = { belt: 4, room: 2 };

function play(room: Room, types: Record<string, EnemyDef>, difficulty: Difficulty, ticks: number, each?: (w: WorldState, t: number) => void) {
  const w = createWorld(room, ['p1'], { enemyTypes: types, difficulty, challengeAt: AT, player: { maxHealth: 1e6, power: 1, guard: 0 } });
  const tells: { tick: number; id: string; name: string; ticks: number }[] = [];
  for (let t = 0; t < ticks; t++) {
    holdSwing(w.players.p1);
    each?.(w, t);
    stepWorld(w, room, { p1: { kind: 'none' } });
    for (const ev of w.events) if (ev.kind === 'telegraph') tells.push({ tick: t, id: ev.enemyId, name: currentAttack(w.enemies.find((e) => e.id === ev.enemyId)!).name, ticks: ev.ticks });
  }
  return { w, tells };
}

describe('R-CHALLENGE P3: pattern attacks start on screen', () => {
  const wide = loadRoom({ id: 'wide', name: 'Wide', tiles: ['#' + '#'.repeat(28) + '#', '#' + '.'.repeat(28) + '#', '#' + '.'.repeat(12) + 'P' + '.'.repeat(15) + '#', '#' + '.'.repeat(28) + '#', '#' + '#'.repeat(28) + '#'], enemies: [{ enemy: 'far', column: 11, row: 2 }] });

  it('off screen: the swing is a normal attack, and the pattern waits its turn', () => {
    const far = withBlock('far', { fromBelt: 4, attacks: [FAR], pattern: ['attack', 'far slam'] });
    const { tells } = play(wide, { far }, 'challenge', 800);
    expect(tells.length).toBeGreaterThan(4);
    expect(tells.every((x) => x.name === 'attack')).toBe(true);
    const near = withBlock('far', { fromBelt: 4, attacks: [{ ...FAR, reach: 1 }], pattern: ['attack', 'far slam'] });
    expect(play(wide, { far: near }, 'challenge', 800).tells.map((x) => x.name).slice(0, 4)).toEqual(['attack', 'far slam', 'attack', 'far slam']);
  });

  it('off screen with no normal attack: it walks closer and never starts', () => {
    const only = withBlock('far', { fromBelt: 4, attacks: [FAR], pattern: ['far slam'] });
    const { w, tells } = play(wide, { far: only }, 'challenge', 400);
    expect(tells).toEqual([]);
    expect(distance(w.enemies[0].pos, w.players.p1.pos)).toBeLessThan(1.3);
  });

  it('a dash lane counts its full length: the lane box runs from the enemy to the far end', () => {
    const lane: EnemyAttackDef = { name: 'lane', strength: 1, startRange: 2, reach: 6, areaRadius: 0.6, telegraphTicks: 26, recoverTicks: 24, counterable: false };
    const b = attackBox({ x: 10, y: 5 }, 0.45, { x: 1, y: 0 }, lane);
    expect(b).toEqual({ x0: 9.4, y0: 4.4, x1: 16.6, y1: 5.6 });
  });
});

describe('R-CHALLENGE P3: Manager requirement — a two-part attack owns the floor', () => {
  const room = loadRoom({ id: 'duo', name: 'Duo', tiles: ['##########', '#........#', '#..P.....#', '#........#', '##########'], enemies: [{ enemy: 'dbl', column: 4, row: 2 }, { enemy: 'brute', column: 2, row: 2 }] });

  it('while the 2nd hit waits, winds up or lands, no other enemy starts ANY attack; the 2nd hit keeps its full tell', () => {
    const dbl = withBlock('dbl', { fromBelt: 4, attacks: [DOUBLE], pattern: ['double slam'] });
    const brute = loadEnemy(bruteData);
    let pendingTicks = 0;
    let busyBefore = false;
    const busy: boolean[] = [];
    const { tells } = play(room, { dbl, brute }, 'challenge', 2400, (w, t) => {
      const d = w.enemies.find((e) => e.def.id === 'dbl')!;
      busyBefore = d.followUpStage !== undefined;
      busy[t] = busyBefore;
      const b = w.enemies.find((e) => e.def.id === 'brute')!;
      if (busyBefore && b.mode === 'chase' && distance(b.pos, w.players.p1.pos) <= b.def.attacks[0].startRange) pendingTicks++;
    });
    const other = tells.filter((x) => x.name === 'attack');
    expect(other.length).toBeGreaterThan(3); // the brute does attack outside the two-part attack
    expect(pendingTicks).toBeGreaterThan(0); // and it was in range, ready, during one
    for (const x of other) expect(busy[x.tick]).toBe(false);
    const dblTells = tells.filter((x) => x.name === 'double slam');
    expect(dblTells.length).toBeGreaterThan(3);
    for (const x of dblTells) expect(x.ticks).toBe(dblTells[0].ticks); // 1st and 2nd: the same full tell
  });
});

describe('R-CHALLENGE P3: no dash lane over a red circle (Challenge only)', () => {
  const room = loadRoom({ id: 'pin', name: 'Pin', tiles: ['##########', '#........#', '#...P....#', '#........#', '##########'], enemies: [{ enemy: 'brute', column: 3, row: 2 }, { enemy: 'rolling-pin', column: 6, row: 2 }] });
  const types = { brute: loadEnemy(bruteData), 'rolling-pin': loadEnemy(rollingPinData) };
  const overlaps = (d: Difficulty) => {
    let n = 0;
    let lanes = 0;
    const w = createWorld(room, ['p1'], { enemyTypes: types, difficulty: d, player: { maxHealth: 1e6, power: 1, guard: 0 } });
    for (let t = 0; t < 2400; t++) {
      holdSwing(w.players.p1);
      stepWorld(w, room, { p1: { kind: 'none' } });
      const [b, pin] = [w.enemies[0], w.enemies[1]];
      for (const ev of w.events) {
        if (ev.kind !== 'telegraph' || ev.enemyId !== pin.id) continue;
        lanes++;
        if (b.mode === 'windup' && b.attackCenter && distance(w.players.p1.pos, b.attackCenter) <= currentAttack(b).areaRadius + 0.2) n++;
      }
    }
    return { n, lanes };
  };
  it('the Rolling Pin never starts its lane while the brute circle covers the player on Challenge; it may on Standard', () => {
    const ch = overlaps('challenge');
    expect(ch.lanes).toBeGreaterThan(3);
    expect(ch.n).toBe(0);
    expect(overlaps('standard').n).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------- 1,000-room sweep

/** Still in its two-part attack after this tick: waiting, winding up, or landing now (a KO or a dropped 2nd hit ends it). */
function stillOn(w: WorldState, id: string): boolean {
  const o = w.enemies.find((x) => x.id === id);
  return !!o && o.mode !== 'defeated' && (o.followUpStage !== undefined || o.followUpLandedTick === w.tick - 1);
}

function patterned(): ReturnType<typeof testContent> {
  const content = testContent();
  return { ...content, enemies: Object.fromEntries(Object.entries(content.enemies).map(([id, def], k): [string, EnemyDef] => {
    const base = def.attacks[0];
    const extra: EnemyAttackDef = { ...base, name: 'p3-extra', telegraphTicks: Math.max(base.telegraphTicks, 22), strength: Math.min(1, base.strength), reach: base.reach + (k % 3), challenge: true, ...(k % 2 === 0 ? { followUp: { strength: 0.6, gapTicks: Math.max(base.recoverTicks, 20) } } : {}) };
    return [id, { ...def, challenge: { fromBelt: 4, fromRoom: 1, attacks: [extra], pattern: [0, def.attacks.length, def.attacks.length], phases: null } }];
  })) };
}

describe('R-CHALLENGE P3: 1,000-room sweep, belts 4-10', () => {
  it('every tick: pattern starts on screen, one pattern wind-up, nobody starts during a two-part attack, no lane over a red circle', { timeout: 600_000 }, () => {
    const c = patterned();
    const bad: string[] = [];
    let rooms = 0;
    let patternStarts = 0;
    let followUps = 0;
    for (let seed = 1; rooms < 1000; seed++) {
      const run = startRun(c, { seed, dryRuns: 0, tier: 4 + (seed % 7), difficulty: 'challenge' });
      const rng = createRng(seed * 31 + 5);
      while (run.status === 'playing' && rooms < 1000) {
        const room = currentRoom(c, run);
        const world = createRunWorld(c, run, { maxHealth: 400, power: 10, guard: 0 }, [], 'challenge');
        rooms++;
        let prev = new Map<string, { mode: string; stage: number | undefined }>();
        const snap = (w: WorldState) => new Map(w.enemies.map((e) => [e.id, { mode: e.mode, stage: e.followUpStage }]));
        playRoom(c, run, world, room, 'smart', SKILLS[Object.keys(SKILLS)[seed % Object.keys(SKILLS).length]], rng, (w) => {
          const starters = w.events.filter((ev) => ev.kind === 'telegraph').map((ev) => w.enemies.find((e) => e.id === (ev as { enemyId: string }).enemyId)!);
          const pendingBefore = [...prev].filter(([id, s]) => s.stage !== undefined && s.mode !== 'defeated' && stillOn(w, id)).map(([id]) => id);
          for (const e of starters) {
            const a = currentAttack(e);
            const tag = `seed ${seed} room ${room.id} tick ${w.tick} ${e.id} ${a.name}`;
            if (a.challenge) patternStarts++;
            if (e.followUpStage === 2) followUps++;
            if (pendingBefore.some((id) => id !== e.id)) bad.push(`${tag}: started during another's two-part attack`);
            if (a.challenge || e.followUpStage === 2) {
              const box = attackBox(e.pos, e.def.radius, e.facing, a);
              const v = simViewRect(room, w.players.p1.pos);
              const slack = 0.5; // the player may be pushed apart from enemies after they decide
              if (box.x0 < v.x0 - slack || box.y0 < v.y0 - slack || box.x1 > v.x1 + slack || box.y1 > v.y1 + slack) bad.push(`${tag}: off screen`);
            }
          }
          const patternWinds = w.enemies.filter((e: EnemyState) => e.mode === 'windup' && currentAttack(e).challenge);
          if (patternWinds.length > 1) bad.push(`seed ${seed} tick ${w.tick}: ${patternWinds.length} pattern wind-ups`);
          for (const e of starters) {
            const a = currentAttack(e);
            if (!a.noOverlapWithRedCircle) continue;
            const red = w.enemies.some((o) => o !== e && o.mode === 'windup' && prev.get(o.id)?.mode === 'windup' && o.attackCenter && currentAttack(o).counterable !== false && distance(w.players.p1.pos, o.attackCenter) <= currentAttack(o).areaRadius);
            if (red) bad.push(`seed ${seed} tick ${w.tick} ${e.id}: lane over a red circle`);
          }
          prev = snap(w);
        });
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
    expect(rooms).toBe(1000);
    expect(patternStarts).toBeGreaterThan(500);
    expect(followUps).toBeGreaterThan(100);
  });
});
