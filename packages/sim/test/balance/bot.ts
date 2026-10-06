// A computer player for balance testing (not part of the game). It plays like a
// decent student: it notices a telegraph a moment late, presses Counter with some
// timing error, runs from brutes, picks off swarmers, punishes winded brutes, and
// dashes out of attacks it can't counter. Two styles can be compared:
//   'smart' - plays as above
//   'stand' - walks up to the nearest enemy and counters everything
// It uses its own seeded random numbers, so results repeat exactly.

import {
  COMBAT,
  activeDoorSlots,
  chooseInsight,
  counterWindowTicks,
  createRng,
  createRunWorld,
  currentAttack,
  currentRoom,
  distance,
  isWallTile,
  nextFloat,
  pick,
  startRun,
  stepWorld,
  updateRun,
  type Content,
  type Difficulty,
  type EnemyState,
  type PlayerInput,
  type PlayerState,
  type Rng,
  type Room,
  type RunState,
  type Vec2,
  type WorldState,
} from '../../src';

export type Style = 'smart' | 'stand';

export interface Skill {
  /** Ticks after a telegraph starts before the bot reacts. */
  reactTicks: number;
  /** Spread of Counter timing error, in ticks (about 68% of presses land within this). */
  timingSd: number;
}

export const SKILLS: Record<string, Skill> = {
  // Roughly: a sharp teen, a typical 10-12 year old, a younger or newer player.
  sharp: { reactTicks: 4, timingSd: 1.5 },
  typical: { reactTicks: 6, timingSd: 2.5 },
  novice: { reactTicks: 8, timingSd: 4 },
};

export interface RoomStats {
  roomId: string;
  kind: string;
  ticks: number;
  damage: number;
  perfects: number;
  blocks: number;
  hits: number;
  died: boolean;
  /** Average number of enemies within 2.5 tiles of the player while fighting. */
  crowd: number;
  /** Highest number of enemies within 2.5 tiles at once. */
  peakCrowd: number;
  winded: number;
  grade: string | null;
}

export interface RunStats {
  won: boolean;
  ticks: number;
  rooms: RoomStats[];
  items: number;
}

function gauss(rng: Rng): number {
  return Math.sqrt(-2 * Math.log(nextFloat(rng) + 1e-9)) * Math.cos(2 * Math.PI * nextFloat(rng));
}

interface Plan {
  enemyId: string;
  impact: number;
  noticeAt: number;
  press: number;
  action: 'counter' | 'dash' | 'dodge';
}

/** Plays one room until it's left (door, defeat, or time limit). */
export function playRoom(content: Content, run: RunState, world: WorldState, room: Room, style: Style, skill: Skill, rng: Rng): RoomStats {
  const p = world.players.p1;
  const plans = new Map<string, Plan>();
  const stats: RoomStats = { roomId: room.id, kind: room.kind, ticks: 0, damage: 0, perfects: 0, blocks: 0, hits: 0, died: false, crowd: 0, peakCrowd: 0, winded: 0, grade: null };
  let crowdSum = 0;
  let crowdN = 0;
  const limit = 20 * 60 * 6;
  for (let t = 0; t < limit && run.status === 'playing'; t++) {
    if (run.insightChoices) chooseInsight(run, pick(rng, run.insightChoices));
    const input = decide(world, room, run, style, skill, rng, plans);
    stepWorld(world, room, { p1: input });
    for (const ev of world.events) {
      if (ev.kind === 'perfectCounter') stats.perfects++;
      if (ev.kind === 'block') stats.blocks++;
      if (ev.kind === 'hit') stats.hits++;
      if (ev.kind === 'winded') stats.winded++;
    }
    const alive = world.enemies.filter((e) => e.mode !== 'defeated');
    if (alive.length > 0) {
      const near = alive.filter((e) => distance(e.pos, p.pos) <= 2.5).length;
      crowdSum += near;
      crowdN++;
      stats.peakCrowd = Math.max(stats.peakCrowd, near);
    }
    const evs = updateRun(content, run, world);
    for (const ev of evs) if (ev.kind === 'graded') stats.grade = ev.result.grade;
    if (evs.some((e) => e.kind === 'nextRoom' || e.kind === 'runOver')) break;
  }
  stats.ticks = world.progress.ticks;
  stats.damage = world.progress.damageTaken;
  stats.died = p.out || run.status === 'lost';
  stats.crowd = crowdN ? crowdSum / crowdN : 0;
  return stats;
}

function decide(world: WorldState, room: Room, run: RunState, style: Style, skill: Skill, rng: Rng, plans: Map<string, Plan>): PlayerInput {
  const p = world.players.p1;
  const now = world.tick;
  const alive = world.enemies.filter((e) => e.mode !== 'defeated');
  const prog = world.progress;

  // Room done: open the chest, use the shrine, pick a door.
  if (alive.length === 0) {
    if (room.shrine && !prog.shrineUsed && p.health < p.maxHealth * 0.9) return { kind: 'moveTo', ...room.shrine };
    if (room.chest && prog.cleared && !prog.chestOpened) return { kind: 'moveTo', ...room.chest };
    if (prog.doorsOpen) {
      const slots = activeDoorSlots(room, run.doors.length);
      const want = chooseDoor(run, p, rng);
      return { kind: 'moveTo', ...room.doors[slots[want]] };
    }
    if (room.shrine && !prog.shrineUsed) return { kind: 'moveTo', ...room.shrine };
    return { kind: 'none' };
  }

  // 1. Notice attacks aimed at us and plan a response.
  for (const e of alive) {
    if (e.mode !== 'windup' || !e.attackCenter) continue;
    const impact = now + e.modeTicks - 1;
    const key = `${e.id}@${impact}`;
    if (plans.has(key)) continue;
    const startedAt = impact - e.windupTotal + 1;
    const w = counterWindowTicks(world, p);
    const ideal = impact - Math.floor(w / 2);
    plans.set(key, { enemyId: e.id, impact, noticeAt: startedAt + skill.reactTicks, press: Math.round(ideal + gauss(rng) * skill.timingSd), action: 'counter' });
  }
  for (const [k, pl] of plans) if (pl.impact < now) plans.delete(k);

  const covering = (e: EnemyState) =>
    e.mode === 'windup' && e.attackCenter && distance(p.pos, e.attackCenter) <= currentAttack(e).areaRadius + 0.3;
  const active = [...plans.values()]
    .filter((pl) => pl.noticeAt <= now)
    .filter((pl) => {
      const e = alive.find((x) => x.id === pl.enemyId);
      return e && covering(e);
    })
    .sort((a, b) => a.impact - b.impact);

  // Two hits landing close together: one Counter can't cover both, so get out.
  let action: PlayerInput['action'];
  let escape: Vec2 | null = null;
  if (active.length > 0) {
    const first = active[0];
    const second = active[1];
    const overlap = second && second.impact - first.impact < 8;
    if (overlap && now >= second.noticeAt && p.dashCooldown === 0) {
      // Dash away from the danger areas.
      escape = awayFrom(p.pos, active.map((pl) => alive.find((x) => x.id === pl.enemyId)!.attackCenter!), room);
      action = 'dash';
    } else if (now >= first.press && p.guardTicks === 0 && p.counterLockout === 0 && p.dashTicks === 0) {
      action = 'counter';
    } else if (now >= first.press && p.counterLockout > 0) {
      // Can't Counter right now: try to step out.
      escape = awayFrom(p.pos, [alive.find((x) => x.id === first.enemyId)!.attackCenter!], room);
    }
  }

  // 2. Strike when it helps.
  if (!action && p.focus >= COMBAT.strike.focusCost && p.guardTicks === 0) {
    const t = nearest(p.pos, alive);
    if (t && distance(p.pos, t.pos) - t.def.radius - 0.42 <= COMBAT.strike.reach && (style === 'stand' || t.shieldUp || t.mode === 'winded' || t.mode === 'stagger' || p.focus >= 60)) {
      action = 'strike';
    }
  }

  // 3. Move.
  let move: PlayerInput = { kind: 'none' };
  if (escape) {
    move = { kind: 'stick', x: escape.x, y: escape.y };
  } else if (p.guardTicks === 0) {
    move = style === 'stand' ? approach(p, nearest(p.pos, alive)!) : smartMove(p, alive, room);
  }
  return action ? { ...move, action } : move;
}

function chooseDoor(run: RunState, p: PlayerState, rng: Rng): number {
  const d = run.doors;
  const low = p.health < p.maxHealth * 0.5;
  const order = low ? ['rest', 'treasure', 'battle', 'challenge', 'boss', 'home'] : ['battle', 'challenge', 'treasure', 'rest', 'boss', 'home'];
  // A little randomness, like a real player.
  if (!low && nextFloat(rng) < 0.35) return Math.floor(nextFloat(rng) * d.length);
  for (const k of order) {
    const i = d.indexOf(k as never);
    if (i >= 0) return i;
  }
  return 0;
}

function nearest(pos: Vec2, list: EnemyState[]): EnemyState | undefined {
  let best: EnemyState | undefined;
  let bd = Infinity;
  for (const e of list) {
    const d = distance(pos, e.pos);
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best;
}

function approach(p: PlayerState, t: EnemyState): PlayerInput {
  const gap = distance(p.pos, t.pos) - t.def.radius - 0.42;
  if (gap <= 0.35) return { kind: 'none' };
  return { kind: 'moveTo', x: t.pos.x, y: t.pos.y };
}

const isHeavy = (e: EnemyState) => !!e.def.winded || e.def.boss;

function smartMove(p: PlayerState, alive: EnemyState[], room: Room): PlayerInput {
  const heavy = alive.filter((e) => isHeavy(e) && e.mode !== 'winded');
  const light = alive.filter((e) => !isHeavy(e));
  const winded = alive.filter((e) => e.mode === 'winded' || (e.mode === 'stagger' && isHeavy(e)));
  // Punish a winded or staggered heavy enemy if it's close.
  const w = nearest(p.pos, winded);
  if (w && distance(p.pos, w.pos) < 5) return approach(p, w);
  // Keep away from heavy enemies while light ones are left.
  const h = nearest(p.pos, heavy);
  if (h && light.length > 0 && distance(p.pos, h.pos) < 3.2 && !h.def.boss) {
    const dir = awayFrom(p.pos, [h.pos], room);
    return { kind: 'stick', x: dir.x, y: dir.y };
  }
  const target = nearest(p.pos, light.length > 0 ? light : alive)!;
  return approach(p, target);
}

/** A direction away from some points, steering clear of walls. */
function awayFrom(pos: Vec2, from: Vec2[], room: Room): Vec2 {
  let x = 0;
  let y = 0;
  for (const f of from) {
    const dx = pos.x - f.x;
    const dy = pos.y - f.y;
    const d = Math.hypot(dx, dy) || 1;
    x += dx / d;
    y += dy / d;
  }
  // Wall repulsion: look around and push away from nearby walls.
  for (let a = 0; a < 16; a++) {
    const ang = (a / 16) * Math.PI * 2;
    for (const r of [0.9, 1.6]) {
      const cx = pos.x + Math.cos(ang) * r;
      const cy = pos.y + Math.sin(ang) * r;
      if (isWallTile(room, Math.floor(cx), Math.floor(cy))) {
        x -= Math.cos(ang) * (r < 1 ? 0.9 : 0.4);
        y -= Math.sin(ang) * (r < 1 ? 0.9 : 0.4);
      }
    }
  }
  const d = Math.hypot(x, y);
  if (d < 0.2) return { x: 0, y: 1 };
  return { x: x / d, y: y / d };
}

/** Plays a whole run. */
export function playRun(content: Content, seed: number, style: Style, skill: Skill, difficulty: Difficulty = 'standard', base = { maxHealth: 100, power: 10, guard: 0 }): RunStats {
  const run = startRun(content, { seed, dryRuns: 0 });
  const rng = createRng(seed * 7919 + 13);
  const rooms: RoomStats[] = [];
  let ticks = 0;
  while (run.status === 'playing' && rooms.length < 20) {
    const room = currentRoom(content, run);
    const world = createRunWorld(content, run, base, [], difficulty);
    rooms.push(playRoom(content, run, world, room, style, skill, rng));
    ticks += world.tick;
  }
  return { won: run.status === 'cleared', ticks, rooms, items: run.loot.length };
}
