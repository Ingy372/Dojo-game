import { describe, expect, it } from 'vitest';
import { FLOOR_KEEPER_ID, keeperWin, loadProfile, newProfile } from '../src';
import BOSS_WIN from '../../../content/settings/boss-win.json';
import LAST_RUN from '../../../content/settings/last-run.json';

const real = { tutorial: false, test: false };
const scene = Object.values(import.meta.glob('../../../apps/client/src/scenes/GameScene.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const cele = Object.values(import.meta.glob('../../../apps/client/src/ui/Celebrations.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const body = (src: string, name: string) => src.slice(src.indexOf(`private ${name}(`), src.indexOf('\n  }\n', src.indexOf(`private ${name}(`)));

describe('Q-PREM-BOSSWIN: Floor Keeper defeated! plays once per save', () => {
  it('plays on the first real Floor Keeper clear, then never again (and survives a save round-trip)', () => {
    const p = newProfile();
    expect(p.keeperCelebrated).toBe(false);
    expect(keeperWin(p, real, 'cleared', FLOOR_KEEPER_ID)).toBe(true);
    expect(keeperWin(p, real, 'cleared', FLOOR_KEEPER_ID)).toBe(false);
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.keeperCelebrated).toBe(true);
    expect(keeperWin(back, real, 'cleared', FLOOR_KEEPER_ID)).toBe(false);
  });
  it('skips the tutorial keep, test links, the Hearth Cook, and floors not cleared (without spending the moment)', () => {
    const p = newProfile();
    expect(keeperWin(p, { tutorial: true, test: false }, 'cleared', FLOOR_KEEPER_ID)).toBe(false);
    expect(keeperWin(p, { tutorial: false, test: true }, 'cleared', FLOOR_KEEPER_ID)).toBe(false);
    expect(keeperWin(p, real, 'cleared', 'hearth-cook')).toBe(false);
    expect(keeperWin(p, real, 'lost', FLOOR_KEEPER_ID)).toBe(false);
    expect(keeperWin(p, real, 'rested', FLOOR_KEEPER_ID)).toBe(false);
    expect(keeperWin(p, real, 'cleared', undefined)).toBe(false);
    expect(p.keeperCelebrated).toBe(false);
    expect(keeperWin(p, real, 'cleared', FLOOR_KEEPER_ID)).toBe(true);
  });
});

describe('Q-PREM-BOSSWIN: old saves', () => {
  const summary = (o: Record<string, unknown>) => ({ result: 'cleared', tutorial: false, test: false, defeated: ['floor-keeper'], results: [], items: [], ...o });
  const old = (floorsCleared: number, last: Record<string, unknown> | null) => {
    const p = newProfile() as Partial<ReturnType<typeof newProfile>>;
    delete p.keeperCelebrated;
    return loadProfile(JSON.parse(JSON.stringify({ ...p, floorsCleared, lastRun: last ? { summary: summary(last), newBests: [] } : null })));
  };
  it('a last run that cleared a real floor and beat the Keeper counts as celebrated', () => {
    const p = old(3, {});
    expect(p.keeperCelebrated).toBe(true);
    expect(keeperWin(p, real, 'cleared', FLOOR_KEEPER_ID)).toBe(false);
  });
  it('a tutorial-only clear does not use up the moment', () => {
    const p = old(1, { tutorial: true });
    expect(p.keeperCelebrated).toBe(false);
    expect(keeperWin(p, real, 'cleared', FLOOR_KEEPER_ID)).toBe(true);
  });
  it('no proof in the save (floors cleared, but the last run was a loss, a test, or another boss) means it still plays', () => {
    for (const last of [{ result: 'lost' }, { test: true }, { defeated: ['hearth-cook'] }, null]) expect(old(4, last).keeperCelebrated).toBe(false);
  });
  it('a save with no floor cleared still gets the moment', () => {
    expect(old(0, null).keeperCelebrated).toBe(false);
  });
});

describe('Q-PREM-BOSSWIN: the moment and its words', () => {
  it('words come from content', () => {
    expect(BOSS_WIN.keeperDefeated).toBe('Floor Keeper defeated!');
    expect(BOSS_WIN.roomClear).toBe('Room clear!');
    expect(scene).not.toMatch(/'Floor cleared!'|`Room clear!/);
    expect(scene).toMatch(/LAST_RUN\.cleared/);
    expect(scene).toMatch(/BOSS_WIN\.roomClear/);
    expect(LAST_RUN.cleared).toBe('Floor cleared!');
  });
  it('GameScene saves the flag before showing the moment', () => {
    expect(scene).toMatch(/if \(keeperWin\(profile, this\.run, status, bossId\)\) \{\s*writeSave\(profile\);\s*this\.showKeeperWin/);
  });
  it('Reduced motion: the keeper moment only uses burst (no confetti) and rays (stay still), and its title only pops with motion on', () => {
    const k = body(cele, 'keeper');
    expect(k).toMatch(/this\.burst\(/);
    expect(k).toMatch(/this\.rays\(/);
    expect(k).not.toMatch(/Math\.random|angle: 360/);
    expect(k).toMatch(/if \(!reducedMotion\(\)\) \{\s*t\.setScale\(0\.5\);/);
    expect(body(cele, 'burst')).toMatch(/^\s*private burst\([^)]*\): void \{\s*if \(reducedMotion\(\)\) return;/);
  });
  it('stays smaller than the promotion: one screen, fewer confetti, text at least 12 px', () => {
    const k = body(cele, 'keeper');
    const n = (k.match(/this\.burst\([^;]*?, (\d+)\)/) ?? [])[1];
    expect(Number(n)).toBeLessThan(60);
    expect(k).not.toMatch(/gong/);
    for (const m of k.matchAll(/this\.text\([^;]*?, (\d+), '#/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
  });
});
