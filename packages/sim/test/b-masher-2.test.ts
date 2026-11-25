// B-MASHER-2 (E3, #296): the "Sensei steps back" moment shows once per run, with its text from content/.
import { describe, expect, it } from 'vitest';
import { createWorld, loadRoom, mashGuardOn, restoreRun, startRun } from '../src';
import { testContent } from './load-content';
import { MASH_GUARD_LINE, takeMashGuardMoment } from '../../../apps/client/src/game/mashGuardMoment';
import mashGuardText from '../../../content/settings/mash-guard.json';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/GameScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;

describe('B-MASHER-2 Sensei steps back', () => {
  it('shows once per run, again in a new run', () => {
    const runA = {};
    const runB = {};
    expect(takeMashGuardMoment(runA, 'p1')).toBe(true);
    expect(takeMashGuardMoment(runA, 'p1')).toBe(false);
    expect(takeMashGuardMoment(runA, 'p1')).toBe(false);
    expect(takeMashGuardMoment(runB, 'p1')).toBe(true);
  });

  it('uses the content line, not text in code, and has a Reduced motion path', () => {
    expect(MASH_GUARD_LINE).toBe(mashGuardText.steppedBackLine);
    expect(MASH_GUARD_LINE).toBe('Three great counters! Your timing can fly on its own now.');
    expect(MASH_GUARD_LINE.startsWith('Sensei')).toBe(false);
    expect(src).not.toContain(mashGuardText.steppedBackLine);
    const body = src.slice(src.indexOf('private senseiStepsBack('), src.indexOf('private shieldGlow('));
    expect(body).toContain('takeMashGuardMoment(');
    expect(body).toContain('reducedMotion()');
    expect(body).toContain('this.senseiSay([MASH_GUARD_LINE]');
  });

  it('co-op: once per player, saved with the run (Manager\'s call)', () => {
    const content = testContent();
    const run = startRun(content, { seed: 11, dryRuns: 0 });
    expect(takeMashGuardMoment(run, 'p1')).toBe(true);
    expect(takeMashGuardMoment(run, 'p1')).toBe(false);
    const back = restoreRun(content, JSON.parse(JSON.stringify(run)))!;
    expect(back.mashGuardSeen).toEqual(['p1']);
    expect(takeMashGuardMoment(back, 'p1')).toBe(false);
    expect(takeMashGuardMoment(back, 'p2')).toBe(true);
    const again = restoreRun(content, JSON.parse(JSON.stringify(back)))!;
    expect(takeMashGuardMoment(again, 'p1')).toBe(false);
    expect(takeMashGuardMoment(again, 'p2')).toBe(false);
  });

  it('stays seen after a reload: saved with the run (Manager\'s call)', () => {
    const content = testContent();
    const run = startRun(content, { seed: 11, dryRuns: 0 });
    expect(run.mashGuardSeen).toEqual([]);
    expect(takeMashGuardMoment(run, 'p1')).toBe(true);
    const back = restoreRun(content, JSON.parse(JSON.stringify(run)))!;
    expect(back.mashGuardSeen).toEqual(['p1']);
    expect(takeMashGuardMoment(back, 'p1')).toBe(false);
    // Runs saved before this field still load, with the line not yet seen.
    const old = JSON.parse(JSON.stringify(startRun(content, { seed: 12, dryRuns: 0 })));
    delete old.mashGuardSeen;
    expect(takeMashGuardMoment(restoreRun(content, old)!, 'p1')).toBe(true);
  });

  it('co-op: Mash guard is off for every player on Standard, on for each on Guided (Jay, Nov 24 and 25)', () => {
    const room = loadRoom({ id: 'arena', name: 'Arena', tiles: ['########', '#......#', '#..P...#', '#......#', '########'], enemies: [] });
    const world = createWorld(room, ['p1', 'p2'], {});
    const { p1, p2 } = world.players;
    expect(mashGuardOn(p1, 'standard')).toBe(false);
    expect(mashGuardOn(p2, 'standard')).toBe(false);
    expect(mashGuardOn(p1, 'guided')).toBe(true);
    p1.perfects = 3;
    expect(mashGuardOn(p1, 'guided')).toBe(false);
    expect(mashGuardOn(p2, 'guided')).toBe(true);
  });

  it('the banner keeps off the players and balances its lines', () => {
    const body = src.slice(src.indexOf('private senseiStepsBack('), src.indexOf('private shieldGlow('));
    expect(body).toContain('this.placeSteppedBack()');
    expect(body).toContain('saveRunInProgress(this.run)');
  });
});
