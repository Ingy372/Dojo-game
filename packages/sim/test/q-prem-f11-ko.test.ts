import { describe, expect, it } from 'vitest';
import { COMBAT, createWorld, loadRoom, skipDown, stepWorld, type PlayerInput } from '../src';

const SRC = import.meta.glob(['../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const game = SRC['../../../apps/client/src/scenes/GameScene.ts'];
const card = SRC['../../../apps/client/src/ui/RunOverCard.ts'];
const IDLE: PlayerInput = { kind: 'none' };

function downed(respawnEnemies: boolean) {
  const room = loadRoom({ id: 'arena', name: 'Arena', tiles: ['######', '#....#', '#.P..#', '######'], enemies: [] });
  const world = createWorld(room, ['p1'], { enemyTypes: {}, respawnEnemies });
  world.players.p1.downTicks = COMBAT.defeatTicks; // just knocked down
  return { room, world };
}
const ticksToOut = (w: ReturnType<typeof downed>) => {
  for (let t = 1; t <= 200; t++) {
    w.world.events = [];
    stepWorld(w.world, w.room, { p1: IDLE });
    if (w.world.events.some((e) => e.kind === 'playerOut')) return t;
  }
  return -1;
};

describe('Q-PREM-F11: a tap on KO Screen 1 goes straight to Screen 2', () => {
  it('without a tap the run ends after the full pause', () => {
    expect(ticksToOut(downed(false))).toBe(COMBAT.defeatTicks);
  });
  it('a tap ends the pause on the very next tick', () => {
    const w = downed(false);
    stepWorld(w.world, w.room, { p1: IDLE }); // a moment passes
    expect(skipDown(w.world, 'p1')).toBe(true);
    expect(ticksToOut(w)).toBe(1);
  });
  it('the practice room (starts over) and a player who is not down are left alone', () => {
    expect(skipDown(downed(true).world, 'p1')).toBe(false);
    const w = downed(false);
    w.world.players.p1.downTicks = 0;
    expect(skipDown(w.world, 'p1')).toBe(false);
  });
  it('the Screen 1 tap calls skipDown, and Screen 2 is shown with no wait once skipped', () => {
    const tap = game.slice(game.indexOf('a tap anywhere skips Screen 1'), game.indexOf('this.popups.clear();'));
    expect(tap).toContain('skipDown(this.world, this.me)');
    expect(game).toMatch(/const wait = this\.helpUpSkipped \? 0 :/);
  });
  it('Head home is at least 48 px tall at every size (667x320 too), and its fade is none with Reduced motion', () => {
    const m = card.match(/const btnH = Math\.max\((\d+), Math\.min\((\d+), height \* ([\d.]+)\)\)/)!;
    const btnH = (h: number) => Math.max(+m[1], Math.min(+m[2], h * +m[3]));
    for (const h of [320, 375, 390, 430]) expect(btnH(h), `${h}`).toBeGreaterThanOrEqual(48);
    expect(card).toMatch(/duration: still \? 0 : 260/);
  });
});

describe('Q-PREM-F11 QA fix: a mash right after Screen 2 appears does not go Home', () => {
  it('both the shade and Head home use one guard that ignores taps for 500 ms on the wall clock', () => {
    expect(card).toMatch(/export const ARM_MS = 500;/);
    expect(card).toMatch(/const opened = performance\.now\(\);/);
    expect(card).toMatch(/if \(gone \|\| \(pointer\?\.downTime \?\? performance\.now\(\)\) - opened < ARM_MS\) return;/);
    expect(card).toMatch(/bg\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_DOWN, go\);/);
    expect(card).toMatch(/shade\.on\(Phaser\.Input\.Events\.GAMEOBJECT_POINTER_DOWN, go\);/);
  });
  it('a tap inside the 500 ms is ignored and one after it goes Home', () => {
    // Mirror of `go`: the guard decision as a function of the time since the card appeared.
    const m = card.match(/export const ARM_MS = (\d+);/)!;
    const goesHome = (ms: number) => !(ms < +m[1]);
    for (const ms of [0, 100, 200, 300, 499]) expect(goesHome(ms), `${ms}`).toBe(false);
    for (const ms of [500, 600, 1500]) expect(goesHome(ms), `${ms}`).toBe(true);
  });
});
