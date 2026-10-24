import { describe, expect, it } from 'vitest';
import { buildTraining, chooseDifficulty, loadFeed, loadProfile, newProfile, runDifficulty, settleDifficulty, type TrainingState } from '../src';
import rules from '../../../content/settings/difficulty.json';
import newWhite from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const now = { ms: Date.parse('2026-10-24T12:00:00Z'), weekday: 6 };
const info = (t: TrainingState) => ({ ageBand: t.ageBand, beltTier: t.belt.tier, signOffsThisBelt: t.requirements.filter((r) => r.belt === t.belt.id && r.signedOff).length });
const training = (raw: unknown) => buildTraining(loadFeed(raw), content.abilities, now);
const reload = <T>(x: T): T => JSON.parse(JSON.stringify(x));

describe('Starting difficulty (M7-P1)', () => {
  it('the youngest fake profile (new white belt) starts on Guided', () => {
    const p = newProfile();
    expect(settleDifficulty(p, info(training(newWhite)), rules)).toBe(true);
    expect(p.difficulty).toBe('guided');
    expect(runDifficulty(p)).toBe('guided');
  });

  it('an older profile starts on Standard', () => {
    for (const raw of [white3, green]) {
      const p = newProfile();
      settleDifficulty(p, info(training(raw)), rules);
      expect(p.difficulty).toBe('standard');
    }
  });

  it('ages 6-9 start on Guided at any belt', () => {
    const p = newProfile();
    settleDifficulty(p, { ageBand: '6-9', beltTier: 4, signOffsThisBelt: 3 }, rules);
    expect(p.difficulty).toBe('guided');
  });

  it('a profile that already has runs is not put on Guided', () => {
    const p = newProfile();
    p.runsStarted = 2;
    settleDifficulty(p, info(training(newWhite)), rules);
    expect(p.difficulty).toBe('standard');
  });

  it('switching to Standard sticks after reload and is never switched back', () => {
    const p = newProfile();
    settleDifficulty(p, info(training(newWhite)), rules);
    chooseDifficulty(p, 'standard');
    const back = loadProfile(reload(p));
    expect(back.difficulty).toBe('standard');
    expect(back.difficultyChosenByPlayer).toBe(true);
    expect(settleDifficulty(back, info(training(newWhite)), rules)).toBe(false);
    expect(back.difficulty).toBe('standard');
  });

  it('an old save loads with difficultyChosenByPlayer false', () => {
    const old = reload(newProfile()) as unknown as Record<string, unknown>;
    delete old.difficultyChosenByPlayer;
    expect(loadProfile(old).difficultyChosenByPlayer).toBe(false);
  });

  it('the choice screen calls Standard "Steady"', () => {
    expect(rules.choices.find((c) => c.id === 'standard')?.name).toBe('Steady');
    expect(rules.choices.map((c) => c.id)).toEqual(['guided', 'standard', 'challenge']);
  });
});
