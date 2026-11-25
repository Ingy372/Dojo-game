// Tool Belt stage 1, Task 6: a kata's signature move on the KATA button.
import { describe, expect, it } from 'vitest';
import { MOVEMENT, buildTraining, characterSetup, createWorld, earnedKataSignatures, emptyLoadout, loadEnemy, loadFeed, loadRoom, newProfile, resolveKataSignatureId, stepWorld, type CombatEvent, type KataSignatureSetup, type WorldState } from '../src';
import { testContent } from './load-content';
import dummyData from '../../../content/enemies/practice-dummy.json';
import keeperData from '../../../content/enemies/floor-keeper.json';
import swarmerData from '../../../content/enemies/swarmer.json';
import whiteNew from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import green from '../../../fixtures/4-green-belt.json';

const content = testContent();
const dummy = loadEnemy(dummyData);
const keeper = loadEnemy(keeperData);
const R = MOVEMENT.playerRadius;
const room = loadRoom({
  id: 'arena',
  name: 'Arena',
  tiles: ['##############', '#............#', '#............#', '#..P.........#', '#............#', '#............#', '##############'],
  enemies: [{ enemy: 'brute', column: 9, row: 3 }],
});
const training = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};

const KIAI: KataSignatureSetup = { id: 'kiai', cooldownTicks: 500, radius: 2, strength: 1, knockTiles: 0.5, staggerTicks: 24 };
const KATA = { kind: 'none', action: 'kata' } as const;

/** Enemies of this type at these gaps from the player, side by side. */
function arena(gaps: number[], type = dummy, kataMove: KataSignatureSetup | null = KIAI): WorldState {
  const world = createWorld(room, ['p1'], { enemyTypes: { brute: type, swarmer: loadEnemy(swarmerData) }, player: { maxHealth: 100, power: 10, guard: 0, kataMove } });
  const p = world.players.p1;
  const base = world.enemies[0];
  world.enemies = gaps.map((gap, i) => {
    const angle = (i * 2 * Math.PI) / gaps.length;
    const d = gap + R + type.radius;
    return { ...base, id: `e${i + 1}`, health: 1000, pos: { x: p.pos.x + Math.cos(angle) * d, y: p.pos.y + Math.sin(angle) * d } };
  });
  return world;
}
const kataHits = (events: CombatEvent[]) => events.filter((ev) => ev.kind === 'playerAttack' && ev.move === 'strike').map((ev) => (ev as unknown as { enemyId: string }).enemyId).sort();

describe('the KATA button', () => {
  it('hits every enemy in its radius, pushes and stuns them, and starts its cooldown', () => {
    const w = arena([1.0, 1.5, 3.0]);
    const before = w.enemies.map((e) => ({ ...e.pos }));
    stepWorld(w, room, { p1: KATA });
    expect(w.events.some((ev) => ev.kind === 'kataMove')).toBe(true);
    expect(kataHits(w.events)).toEqual(['e1', 'e2']);
    const p = w.players.p1;
    const dist = (a: { x: number; y: number }) => Math.hypot(a.x - p.pos.x, a.y - p.pos.y);
    expect(dist(w.enemies[0].pos)).toBeGreaterThan(dist(before[0]));
    expect(w.enemies[0].mode).toBe('stagger');
    expect(w.enemies[2].pos).toEqual(before[2]);
    expect(p.kataCooldown).toBe(KIAI.cooldownTicks);
  });

  it('does nothing again before the cooldown ends', () => {
    const w = arena([1.0]);
    stepWorld(w, room, { p1: KATA });
    for (let i = 0; i < 50; i++) stepWorld(w, room, { p1: { kind: 'none' } });
    stepWorld(w, room, { p1: KATA });
    expect(w.events.some((ev) => ev.kind === 'kataMove')).toBe(false);
  });

  it('does nothing while the player is down', () => {
    const w = arena([1.0]);
    w.players.p1.downTicks = 10;
    stepWorld(w, room, { p1: KATA });
    expect(w.events.some((ev) => ev.kind === 'kataMove')).toBe(false);
    expect(w.players.p1.kataCooldown).toBe(0);
  });

  it('with no enemy near, it still plays and starts the cooldown', () => {
    const w = arena([5.0]);
    stepWorld(w, room, { p1: KATA });
    expect(w.events.some((ev) => ev.kind === 'kataMove')).toBe(true);
    expect(kataHits(w.events)).toEqual([]);
    expect(w.players.p1.kataCooldown).toBe(KIAI.cooldownTicks);
  });

  it('a boss is hit but not moved', () => {
    const w = arena([0.5], keeper);
    const before = { ...w.enemies[0].pos };
    stepWorld(w, room, { p1: KATA });
    expect(kataHits(w.events)).toEqual(['e1']);
    expect(w.enemies[0].pos).toEqual(before);
  });

  it('without a kata move the button does nothing', () => {
    const w = arena([1.0], dummy, null);
    stepWorld(w, room, { p1: KATA });
    expect(w.events.some((ev) => ev.kind === 'kataMove')).toBe(false);
  });
});

describe('earning and equipping kata moves', () => {
  it('each signed-off kata with a move earns it, in curriculum order', () => {
    expect(earnedKataSignatures(training(whiteNew), content.abilities.kataSignatures)).toEqual([]);
    expect(earnedKataSignatures(training(white3), content.abilities.kataSignatures)).toEqual(['kiai']);
    expect(earnedKataSignatures(training(green), content.abilities.kataSignatures)).toEqual(['kiai', 'four-corners', 'iron-wall']);
  });

  it('old kata power ids and kata ids mean that kata\'s move', () => {
    const defs = content.abilities.kataSignatures;
    expect(resolveKataSignatureId(defs, 'basic-form-1-power')).toBe('kiai');
    expect(resolveKataSignatureId(defs, 'basic-form-1')).toBe('kiai');
    expect(resolveKataSignatureId(defs, 'iron-wall')).toBe('iron-wall');
    expect(resolveKataSignatureId(defs, null)).toBeNull();
  });

  it("characterSetup brings the chosen move, or Sensei's newest one when none is chosen", () => {
    const t = training(green);
    expect(characterSetup(newProfile(), t, content.abilities).kataMove?.id).toBe('iron-wall');
    const chosen = { ...newProfile(), loadout: { ...emptyLoadout(), kata: 'kiai' } };
    expect(characterSetup(chosen, t, content.abilities).kataMove?.id).toBe('kiai');
    const off = { ...newProfile(), senseiPick: false };
    expect(characterSetup(off, t, content.abilities).kataMove).toBeNull();
    expect(characterSetup(newProfile(), training(whiteNew), content.abilities).kataMove).toBeNull();
  });
});
