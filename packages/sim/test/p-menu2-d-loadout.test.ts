// P-MENU2-d: the Fighting Style loadout (starting Form + Virtue, D2) is saved in the profile
// and used by the next run. Unearned picks are ignored; old saves load with no loadout.
import { describe, expect, it } from 'vitest';
import { buildTraining, characterSetup, createRunWorld, loadFeed, loadProfile, newProfile, startRun, activeForm } from '../src';
import { testContent } from './load-content';
import white from '../../../fixtures/1-white-belt-new.json';
import yellow from '../../../fixtures/3-yellow-belt.json';

const content = testContent();
function training(data: unknown) {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
}

describe('P-MENU2-d loadout', () => {
  it('new profiles and old saves have no loadout (today\'s default)', () => {
    expect(newProfile().loadout).toBeNull();
    const old = JSON.parse(JSON.stringify(newProfile()));
    delete old.loadout;
    const loaded = loadProfile(old);
    expect(loaded.loadout).toBeNull();
    expect(loadProfile({ ...old, loadout: 'junk' }).loadout).toBeNull();
    expect(loadProfile({ ...old, loadout: { form: 7, virtue: '' } }).loadout).toBeNull();
  });

  it('a saved loadout survives a save and load', () => {
    const p = newProfile();
    p.loadout = { form: 'flowing-form', virtue: null };
    expect(loadProfile(JSON.parse(JSON.stringify(p))).loadout).toEqual({ form: 'flowing-form', virtue: null });
  });

  it('a chosen Stance starts the next run; switching still cycles through all earned Forms', () => {
    const t = training(yellow);
    const p = newProfile();
    p.loadout = { form: 'flowing-form', virtue: null };
    const setup = characterSetup(p, t, content.abilities);
    expect(setup.forms!.map((f) => f.id)).toEqual(['flowing-form', 'beginners-stance', 'rooted-form']);
    const run = startRun(content, { seed: 5, dryRuns: 0 });
    const world = createRunWorld(content, run, setup, setup.effects);
    expect(activeForm(world.players.p1).id).toBe('flowing-form');
  });

  it('a chosen Virtue is used in the next run', () => {
    const t = training(yellow);
    expect(t.virtue?.def.id).toBe('shield-of-respect');
    const p = newProfile();
    p.loadout = { form: null, virtue: 'second-wind' };
    const setup = characterSetup(p, t, content.abilities);
    expect(setup.virtue?.id).toBe('second-wind');
    const world = createRunWorld(content, startRun(content, { seed: 5, dryRuns: 0 }), setup, setup.effects);
    expect(world.players.p1.virtue?.id).toBe('second-wind');
  });

  it('unearned or unknown picks are ignored (today\'s default)', () => {
    const t = training(white);
    const base = characterSetup(newProfile(), t, content.abilities);
    const p = newProfile();
    p.loadout = { form: 'flowing-form', virtue: 'perfect-discipline' };
    expect(characterSetup(p, t, content.abilities)).toEqual(base);
    p.loadout = { form: 'no-such-form', virtue: 'no-such-virtue' };
    expect(characterSetup(p, training(yellow), content.abilities)).toEqual(characterSetup(newProfile(), training(yellow), content.abilities));
  });
});
