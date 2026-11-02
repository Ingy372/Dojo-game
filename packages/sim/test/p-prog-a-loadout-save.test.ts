// PB-01 (R-PROGRESSION-BETA): the Loadout has five slots and still loads from every older shape.
import { describe, expect, it } from 'vitest';
import { emptyLoadout, loadProfile, newProfile, readLoadout, type Loadout } from '../src';
import oldFormSave from '../../../fixtures/saves/old-form-loadout.json';

const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const base = () => copy(newProfile());

describe('PB-01 loadout save', () => {
  it('round-trips all five fields through a save and load', () => {
    const p = newProfile();
    p.loadout = { stance: 'cat-stance', virtue: 'second-wind', strike: 'jumping-spins', kata: 'basic-form-1-power', seals: ['escape', 'counter'] };
    const back = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(back.loadout).toEqual(p.loadout);
  });

  it('an old { stance, virtue } save loads, with the new slots empty', () => {
    const s = { ...base(), loadout: { stance: 'front-stance', virtue: 'second-wind' } };
    expect(loadProfile(s).loadout).toEqual({ stance: 'front-stance', virtue: 'second-wind', strike: null, kata: null, seals: [] });
  });

  it('an old { form } save loads (the R-STANCE-a shape) and keeps its fixture shape', () => {
    const p = loadProfile(copy(oldFormSave));
    expect(p.loadout).not.toHaveProperty('form');
    expect(p.loadout!.strike).toBeNull();
    expect(p.loadout!.kata).toBeNull();
    expect(p.loadout!.seals).toEqual([]);
  });

  it('a save with no loadout at all, or a junk one, gives null', () => {
    const old = base();
    delete (old as Partial<typeof old>).loadout;
    expect(loadProfile(old).loadout).toBeNull();
    for (const junk of ['x', 5, [], { seals: 'escape' }, { strike: 3, kata: {}, seals: [1, null] }]) expect(readLoadout(junk)).toBeNull();
  });

  it('odd ids, repeats and the wrong shape are dropped, never an error', () => {
    const l = readLoadout({
      stance: 'cat-stance', virtue: null, strike: 'Jumping Spins', kata: 'constructor',
      seals: ['escape', 'escape', 'toString', 'Bad Id', 7, null, 'counter', '__proto__'],
    })!;
    expect(l).toEqual({ stance: 'cat-stance', virtue: null, strike: null, kata: null, seals: ['escape', 'counter'] });
    expect(readLoadout({ stance: 'cat-stance', seals: 'escape' })!.seals).toEqual([]);
  });

  it('a new slot alone is enough to count as a loadout', () => {
    expect(readLoadout({ seals: ['guard'] })).toEqual({ ...emptyLoadout(), seals: ['guard'] });
    expect(readLoadout({ strike: 'jumping-spins' })).toEqual({ ...emptyLoadout(), strike: 'jumping-spins' });
    expect(readLoadout({ kata: 'keon-power' })).toEqual({ ...emptyLoadout(), kata: 'keon-power' });
  });

  it('reading a loaded loadout again changes nothing', () => {
    const once = readLoadout({ stance: 'cat-stance', seals: ['escape', 'escape', 'guard'], strike: 'jumping-spins' }) as Loadout;
    expect(readLoadout(once)).toEqual(once);
    expect(loadProfile(copy(loadProfile({ ...base(), loadout: once }))).loadout).toEqual(once);
  });

  it('the slot-seed flags: new profiles are done; an older save that played is not; one that never played is', () => {
    expect(newProfile().loadoutV2).toBe(true);
    expect(newProfile().showSlotNote).toBe(false);
    const old = base();
    delete (old as Partial<typeof old>).loadoutV2;
    delete (old as Partial<typeof old>).showSlotNote;
    expect(loadProfile({ ...old, runsPlayed: 0 }).loadoutV2).toBe(true);
    expect(loadProfile({ ...old, runsPlayed: 4 }).loadoutV2).toBe(false);
    expect(loadProfile({ ...old, runsPlayed: 0, loadout: { stance: 'cat-stance', virtue: null } }).loadoutV2).toBe(false);
    expect(loadProfile({ ...old, runsPlayed: 4 }).showSlotNote).toBe(false);
    expect(loadProfile({ ...old, runsPlayed: 4, loadoutV2: true, showSlotNote: true })).toMatchObject({ loadoutV2: true, showSlotNote: true });
    expect(loadProfile({ ...old, runsPlayed: 4, loadoutV2: 'yes', showSlotNote: 1 })).toMatchObject({ loadoutV2: false, showSlotNote: false });
  });
});
