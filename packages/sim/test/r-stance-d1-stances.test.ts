// R-STANCE-d1: Cat, Front, Fighting and Horse replace Rooted and Flowing, with the numbers from
// drafts/planning/R-STANCE-c-stance-numbers.md (#290). Front's push is a later item.
import { describe, expect, it } from 'vitest';
import {
  COMBAT,
  blockShare,
  createWorld,
  dashCooldownTicks,
  loadAbilities,
  buildTraining,
  loadEnemy,
  loadFeed,
  loadProfile,
  loadRoom,
  migrateLoadout,
  normalizeLoadout,
  stancePowerScale,
  stepWorld,
  type PlayerInput,
  type StanceDef,
  type WorldState,
} from '../src';
import abilitiesData from '../../../content/abilities/abilities.json';
import styleWords from '../../../content/abilities/fighting-style.json';
import bruteData from '../../../content/enemies/brute.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import oldSave from '../../../fixtures/saves/old-form-loadout.json';
import { testContent } from './load-content';

const content = testContent();
const brute = loadEnemy(bruteData);
const byId = (id: string): StanceDef => content.abilities.stances.find((s) => s.id === id)!;
const IDLE: PlayerInput = { kind: 'none' };
const open = loadRoom({ id: 'open', name: 'Open', tiles: ['##############', '#............#', '#............#', '#P...........#', '#............#', '##############'], enemies: [] });
const fight = loadRoom({ id: 'fight', name: 'Fight', tiles: ['#######', '#.....#', '#.P...#', '#.....#', '#######'], enemies: [{ enemy: 'brute', column: 3, row: 2 }] });

function inStance(id: string, room = open): WorldState {
  const w = createWorld(room, ['p1'], { enemyTypes: { brute }, difficulty: 'standard', player: { ...COMBAT.player, stances: [byId(id)] } });
  return w;
}

function dashDistance(id: string): number {
  const w = inStance(id);
  const x0 = w.players.p1.pos.x;
  stepWorld(w, open, { p1: { kind: 'stick', x: 1, y: 0, action: 'dash' } as PlayerInput });
  while (w.players.p1.dashTicks > 0) stepWorld(w, open, { p1: IDLE });
  return w.players.p1.pos.x - x0;
}

function walkStep(id: string): number {
  const w = inStance(id);
  const x0 = w.players.p1.pos.x;
  stepWorld(w, open, { p1: { kind: 'stick', x: 1, y: 0 } });
  return w.players.p1.pos.x - x0;
}

/** Focus after the first basic hit on the brute. */
function focusAfterHit(id: string): number {
  const w = inStance(id, fight);
  for (let i = 0; i < 60 && w.players.p1.focus === 0; i++) stepWorld(w, fight, { p1: IDLE });
  return w.players.p1.focus;
}

describe('R-STANCE-d1 stances', () => {
  it('content holds Ready plus Cat, Front, Fighting and Horse; Rooted and Flowing are gone', () => {
    expect(content.abilities.stances.map((s) => s.id)).toEqual(['beginners-stance', 'cat-stance', 'front-stance', 'fighting-stance', 'horse-stance']);
  });

  it('Cat: counter window +1, blocks let 65% through, dash recharges in 22 ticks', () => {
    const w = inStance('cat-stance');
    const p = w.players.p1;
    expect(byId('cat-stance').counterWindow).toBe(1);
    expect(blockShare(p)).toBeCloseTo(0.65, 9);
    expect(dashCooldownTicks(p)).toBe(22);
    stepWorld(w, open, { p1: { kind: 'stick', x: 1, y: 0, action: 'dash' } as PlayerInput });
    expect(p.dashCooldown).toBe(22);
    expect(dashCooldownTicks(inStance('beginners-stance').players.p1)).toBe(COMBAT.dash.cooldownTicks);
  });

  it('Fighting: blocks let 35% through, Focus fills 20% faster, dash is 2.0 tiles, full attack speed', () => {
    expect(blockShare(inStance('fighting-stance').players.p1)).toBeCloseTo(0.35, 9);
    expect(blockShare(inStance('beginners-stance').players.p1)).toBeCloseTo(0.5, 9);
    const ready = focusAfterHit('beginners-stance');
    expect(ready).toBeGreaterThan(0);
    expect(focusAfterHit('fighting-stance')).toBeCloseTo(ready * 1.2, 9);
    expect(dashDistance('beginners-stance')).toBeCloseTo(2.5, 6);
    expect(dashDistance('fighting-stance')).toBeCloseTo(2.0, 6);
    expect(byId('fighting-stance').attackSpeed).toBe(0);
  });

  it('Front: power +8%, walks 10% slower', () => {
    const p = inStance('front-stance').players.p1;
    expect(stancePowerScale(p)).toBeCloseTo(0.08, 9);
    expect(walkStep('front-stance')).toBeCloseTo(walkStep('beginners-stance') * 0.9, 9);
  });

  it('Horse: +10% power after 10 still ticks, reset by any walk or dash; walks 20% slower', () => {
    expect(walkStep('horse-stance')).toBeCloseTo(walkStep('beginners-stance') * 0.8, 9);
    const w = inStance('horse-stance');
    const p = w.players.p1;
    for (let i = 0; i < 9; i++) stepWorld(w, open, { p1: IDLE });
    expect(stancePowerScale(p)).toBe(0);
    stepWorld(w, open, { p1: IDLE });
    expect(p.stillTicks).toBe(10);
    expect(stancePowerScale(p)).toBeCloseTo(0.1, 9);
    stepWorld(w, open, { p1: { kind: 'stick', x: 1, y: 0 } });
    expect(stancePowerScale(p)).toBe(0);
    for (let i = 0; i < 10; i++) stepWorld(w, open, { p1: IDLE });
    expect(stancePowerScale(p)).toBeCloseTo(0.1, 9);
    stepWorld(w, open, { p1: { kind: 'none', action: 'dash' } });
    expect(stancePowerScale(p)).toBe(0);
    expect(stancePowerScale(inStance('beginners-stance').players.p1)).toBe(0);
  });

  it('the content check keeps power bonuses within 0 to 0.12 and guard at 0 or more', () => {
    const withStance = (extra: Record<string, unknown>) => {
      const d = JSON.parse(JSON.stringify(abilitiesData));
      d.stances[1] = { ...d.stances[1], ...extra };
      return () => loadAbilities(d);
    };
    expect(withStance({})).not.toThrow();
    expect(withStance({ powerScale: 0.12 })).not.toThrow();
    expect(withStance({ powerScale: 0.13 })).toThrow(/powerScale and stillPower/);
    expect(withStance({ powerScale: -0.02 })).toThrow(/powerScale and stillPower/);
    expect(withStance({ stillPower: 0.121 })).toThrow(/powerScale and stillPower/);
    expect(withStance({ guardScale: -0.1 })).toThrow(/guardScale/);
  });
});

describe('R-STANCE-d1 save migration', () => {
  it('Rooted and Flowing picks, old or new ids, go back to Ready; running again changes nothing', () => {
    for (const old of ['rooted-form', 'flowing-form', 'rooted-stance', 'flowing-stance']) {
      const once = migrateLoadout({ stance: old, virtue: 'second-wind' });
      expect(once).toEqual({ stance: null, virtue: 'second-wind' });
      expect(migrateLoadout(once)).toEqual(once);
      expect(migrateLoadout({ form: old, virtue: null })).toEqual({ stance: null, virtue: null });
    }
    const p = loadProfile(JSON.parse(JSON.stringify(oldSave)));
    expect(loadProfile(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(migrateLoadout({ stance: 'horse-stance', virtue: null })).toEqual({ stance: 'horse-stance', virtue: null });
  });

  it('normalizeLoadout drops a Stance the student has not unlocked and keeps the Virtue', () => {
    const feed = loadFeed(white3);
    const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
    expect(normalizeLoadout({ stance: 'cat-stance', virtue: null }, t, content.abilities)).toEqual({ stance: 'cat-stance', virtue: null });
    expect(normalizeLoadout({ stance: 'horse-stance', virtue: 'second-wind' }, t, content.abilities)).toEqual({ stance: null, virtue: 'second-wind' });
    expect(normalizeLoadout({ stance: 'horse-stance', virtue: null }, t, content.abilities)).toBeNull();
    expect(normalizeLoadout(null, t, content.abilities)).toBeNull();
  });
});

// #294 gameLine texts (drafts/content/katas/stances.json), copied exactly.
describe('R-STANCE-d1 in-game lines', () => {
  const lines: Record<string, string> = {
    'beginners-stance': 'Steady and even. Good at everything.',
    'cat-stance': 'Quicker Counters and Dash, but softer blocks.',
    'front-stance': 'Hit harder, but move a little slower.',
    'fighting-stance': 'Strong blocks and fast Focus, but a shorter Dash.',
    'horse-stance': 'Stand still to hit harder, but move slower.',
  };
  it('each stance uses its #294 line in abilities and the Fighting Style screen', () => {
    for (const [id, line] of Object.entries(lines)) {
      const st = (abilitiesData as { stances: Array<{ id: string; text: string }> }).stances.find((s) => s.id === id);
      expect(st?.text).toBe(line);
      expect((styleWords as unknown as { lines: Record<string, string> }).lines[id]).toBe(line);
    }
  });
});
