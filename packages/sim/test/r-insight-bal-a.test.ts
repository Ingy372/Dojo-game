import { describe, expect, it } from 'vitest';
import { COMBAT, createWorld, loadEnemy, loadRoom, modsFrom, setPlayerMods, stepWorld, TICKS_PER_SECOND, type Effect, type EnemyMode, type PlayerInput } from '../src';
import bruteData from '../../../content/enemies/brute.json';
import shieldData from '../../../content/enemies/shield.json';
import insights from '../../../content/insights/insights.json';

// R-INSIGHT-BAL-a: the three small rule changes behind the Insight rebalance.
const enemyTypes = { brute: loadEnemy(bruteData), shield: loadEnemy(shieldData) };
const IDLE: PlayerInput = { kind: 'none' };
const card = (id: string) => (insights.insights as { id: string; effect: Effect }[]).find((i) => i.id === id)!.effect;
const mods = (...ids: string[]) => modsFrom(ids.map(card), TICKS_PER_SECOND);

/** One enemy standing in basic-attack reach of the player. */
function duel(enemy: 'brute' | 'shield', cards: string[]) {
  const room = loadRoom({
    id: 'arena',
    name: 'Arena',
    tiles: ['################', '#..............#', '#..............#', '#..P...........#', '#..............#', '#..............#', '#..............#', '################'],
    enemies: [{ enemy, column: 6, row: 4 }],
  });
  const world = createWorld(room, ['p1'], { enemyTypes, respawnEnemies: false });
  const p = world.players.p1;
  setPlayerMods(p, mods(...cards));
  const e = world.enemies[0];
  e.pos = { x: p.pos.x + 0.9, y: p.pos.y };
  return { room, world, p, e };
}

describe('Rule A: Wind Step also speeds basic attacks', () => {
  const gap = (boosted: boolean) => {
    const { room, world, p, e } = duel('brute', ['wind-step']);
    e.mode = 'stagger';
    e.modeTicks = 1000;
    p.speedBoostTicks = boosted ? 20 : 0;
    stepWorld(world, room, { p1: IDLE });
    return p.attackCooldown;
  };
  it('the gap between basic attacks is shorter during the burst, and normal without it', () => {
    expect(gap(false)).toBe(COMBAT.basicAttack.cooldownTicks);
    expect(gap(true)).toBe(Math.round(COMBAT.basicAttack.cooldownTicks * (1 - card('wind-step').amount / 2)));
    expect(gap(true)).toBeLessThan(gap(false));
  });
});

describe('Rule B: Press the Advantage also works on winded or recovering enemies', () => {
  const hit = (mode: EnemyMode, cards: string[]) => {
    const { room, world, e } = duel('brute', cards);
    e.mode = mode;
    e.modeTicks = 1000;
    const before = e.health;
    stepWorld(world, room, { p1: IDLE });
    return before - e.health;
  };
  it('stagger, winded and recover take the bonus; a chasing enemy does not', () => {
    for (const mode of ['stagger', 'winded', 'recover'] as const) expect(hit(mode, ['press-the-advantage'])).toBeGreaterThan(hit(mode, []));
    expect(hit('chase', ['press-the-advantage'])).toBe(hit('chase', []));
  });
});

describe('Rule C: Shield Breaker gives Focus when it breaks a shield', () => {
  it('7 Focus on the break, none for a plain hit and none without the card', () => {
    expect(card('shield-breaker').focusOnBreak).toBe(7);
    const withCard = duel('shield', ['shield-breaker']);
    withCard.e.mode = 'stagger';
    withCard.e.modeTicks = 1000;
    stepWorld(withCard.world, withCard.room, { p1: IDLE });
    expect(withCard.world.events.some((ev) => ev.kind === 'shieldBreak')).toBe(true);
    expect(withCard.p.focus).toBe(COMBAT.focus.perHit + 7);

    // The shield is down now: the next basic hit only gives the normal Focus.
    withCard.p.attackCooldown = 0;
    const focus = withCard.p.focus;
    stepWorld(withCard.world, withCard.room, { p1: IDLE });
    expect(withCard.p.focus).toBe(focus + COMBAT.focus.perHit);

    // Without the card the basic hit bounces: the shield-spark Focus only.
    const without = duel('shield', []);
    without.e.mode = 'stagger';
    without.e.modeTicks = 1000;
    stepWorld(without.world, without.room, { p1: IDLE });
    expect(without.p.focus).toBe(COMBAT.focus.perShieldBounce);
  });
  it('stops at the Focus cap', () => {
    const { room, world, p, e } = duel('shield', ['shield-breaker']);
    e.mode = 'stagger';
    e.modeTicks = 1000;
    p.focus = COMBAT.focus.max - 2;
    stepWorld(world, room, { p1: IDLE });
    expect(p.focus).toBe(COMBAT.focus.max);
  });
});

describe('R-INSIGHT-BAL-a card numbers (4a)', () => {
  it('match the proposal', () => {
    expect(card('ripple-counter').amount).toBe(1.2);
    expect(card('iron-skin').amount).toBe(1.2);
    expect(card('wind-step')).toMatchObject({ amount: 0.3, everyHits: 5, seconds: 2 });
    expect(card('double-strike').amount).toBe(0.2);
    expect(card('quick-hands').amount).toBe(0.2);
    expect(card('press-the-advantage').amount).toBe(0.3);
    expect(card('rally').amount).toBe(0.75);
    expect(card('heavy-hands').amount).toBe(0.2);
  });
});
