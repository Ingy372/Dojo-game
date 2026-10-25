// R-STANCE-a: Forms were renamed to Stances. Saves from before the rename keep the Fighting
// Style pick under `loadout.form` with the old ids; loading moves it to `loadout.stance`.
import { describe, expect, it } from 'vitest';
import { loadProfile, migrateLoadout } from '../src';
import oldSave from '../../../fixtures/saves/old-form-loadout.json';

const copy = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('R-STANCE-a save migration', () => {
  it('an old save (form only, old id) keeps its stance', () => {
    const p = loadProfile(copy(oldSave));
    expect(p.loadout).toEqual({ stance: 'flowing-stance', virtue: 'second-wind' });
    expect(p.loadout).not.toHaveProperty('form');
  });

  it('a save with both keys keeps stance and drops form', () => {
    const both = { ...copy(oldSave), loadout: { form: 'flowing-form', stance: 'rooted-stance', virtue: null } };
    expect(loadProfile(both).loadout).toEqual({ stance: 'rooted-stance', virtue: null });
    expect(migrateLoadout({ form: 'rooted-form', stance: null, virtue: 'second-wind' })).toEqual({ stance: null, virtue: 'second-wind' });
  });

  it('a second load changes nothing', () => {
    const once = loadProfile(copy(oldSave));
    const twice = loadProfile(copy(once));
    expect(twice).toEqual(once);
    const m = migrateLoadout({ form: 'rooted-form', virtue: null });
    expect(migrateLoadout(m)).toEqual(m);
  });

  it('leaves new saves and junk alone', () => {
    expect(migrateLoadout({ stance: 'rooted-stance', virtue: null })).toEqual({ stance: 'rooted-stance', virtue: null });
    expect(migrateLoadout(null)).toBeNull();
    expect(migrateLoadout('junk')).toBe('junk');
  });
});
