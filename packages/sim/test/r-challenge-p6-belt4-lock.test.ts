import { describe, expect, it } from 'vitest';
import { activeDifficulty, CHALLENGE_FROM_TIER, challengeUnlocked, chooseDifficulty, loadProfile, newProfile, runDifficulty } from '../src';
import rules from '../../../content/settings/difficulty.json';

const files = import.meta.glob(['../../../apps/client/src/game/tower.ts', '../../../apps/client/src/scenes/DojoScene.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (p: string) => files[`../../../apps/client/src/${p}`];
const reload = <T>(x: T): T => JSON.parse(JSON.stringify(x));

describe('R-CHALLENGE P6: Challenge unlocks at the 4th belt (core-design §13)', () => {
  it('unlocks at tier 4, not before', () => {
    expect(CHALLENGE_FROM_TIER).toBe(4);
    expect([1, 2, 3].map(challengeUnlocked)).toEqual([false, false, false]);
    expect([4, 7, 10].map(challengeUnlocked)).toEqual([true, true, true]);
  });

  it('a Challenge pick below belt 4 plays as Standard but the stored choice is kept', () => {
    const p = newProfile();
    chooseDifficulty(p, 'challenge');
    expect(runDifficulty(p, null, 3)).toBe('standard');
    expect(activeDifficulty(p, 1)).toBe('standard');
    expect(p.difficulty).toBe('challenge');
    const back = loadProfile(reload(p));
    expect(back?.difficulty).toBe('challenge');
    expect(runDifficulty(back!, null, 4)).toBe('challenge');
  });

  it('Guided and Standard are never changed by the lock', () => {
    for (const d of ['guided', 'standard'] as const) {
      const p = newProfile();
      chooseDifficulty(p, d);
      for (const t of [1, 3, 4, 10]) expect(runDifficulty(p, null, t)).toBe(d);
    }
  });

  it('a ?difficulty=challenge test link still wins at any belt (sims and testers)', () => {
    expect(runDifficulty(newProfile(), 'challenge', 1)).toBe('challenge');
  });

  it('the Tower run passes the belt tier', () => {
    expect(src('game/tower.ts')).toMatch(/runDifficulty\(profile, params\.get\('difficulty'\), training\.belt\.tier\)/);
  });

  it('Settings shows Steady selected below belt 4, and the Challenge card is locked', () => {
    const dojo = src('scenes/DojoScene.ts');
    expect(dojo).toMatch(/const current = activeDifficulty\(this\.profile, tier\);/);
    expect(dojo).toMatch(/locked = c\.id === 'challenge' && !challengeUnlocked\(tier\)/);
    expect(dojo).toMatch(/if \(locked\) return;/);
    expect(dojo).toMatch(/locked \? t\.locked\.challenge : c\.text/);
    expect(dojo).not.toMatch(/this\.profile\.difficulty \?\? 'standard'/);
    // The words live in content (designers change them); just check there are some.
    expect(typeof rules.locked.challenge).toBe('string');
    expect(rules.locked.challenge.trim().length).toBeGreaterThan(0);
  });
});
