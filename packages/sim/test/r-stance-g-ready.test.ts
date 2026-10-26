// R-STANCE-g: the Beginner's Stance is plain standing (all 0) and where new players start. Ready
// is now the Open Leg Stance (ready-stance) with its own sign-off; students who played before
// keep it (Manager Q5 (b)).
import { describe, expect, it } from 'vitest';
import { READY_STANCE_ID, buildTraining, characterSetup, loadFeed, loadProfile, migrateReadyStance, newProfile, normalizeLoadout, unlockedStances } from '../src';
import { testContent } from './load-content';
import abilitiesData from '../../../content/abilities/abilities.json';
import styleWords from '../../../content/abilities/fighting-style.json';
import { buildStyle } from '../../../apps/client/src/ui/fightingStyle';
import newWhite from '../../../fixtures/1-white-belt-new.json';
import yellow from '../../../fixtures/3-yellow-belt.json';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const content = testContent();
const train = (data: unknown) => {
  const feed = loadFeed(clone(data));
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() });
};
// The main picks from #312 (drafts/content/katas/stance-lines-g.json on main), copied into content/.
const MAIN_312: Record<string, string> = {
  'stance.beginner.oneLiner': 'Everyone starts here. Your first stance is waiting at the dojo!',
  'stance.ready.notYet': 'Not yet! Learn Open Leg Stance at the dojo, and your teacher will sign it off.',
  'welcome.beginnerStance': "Welcome! You start in Beginner's Stance, just like everyone. Learn stances at the dojo to grow stronger!",
};
const main = (key: string) => MAIN_312[key];
const ZERO = { counterWindow: 0, attackSpeed: 0, moveSpeed: 0, guardScale: 0, powerScale: 0, dashCooldownScale: 0, dashScale: 1, blockCut: 0, focusGain: 0, stillPower: 0, rootTicks: 0 };

describe('R-STANCE-g content', () => {
  it('Beginner is first, all 0, no sign-off; Open Leg is second with its own sign-off and the 4 bonuses from #314 (R-STANCE-READY-NUM)', () => {
    const [b, r] = content.abilities.stances;
    expect(b).toMatchObject({ id: 'beginners-stance', name: "Beginner's Stance", signOffId: null, ...ZERO });
    expect(r).toMatchObject({ id: READY_STANCE_ID, name: 'Open Leg Stance', signOffId: 'PLACEHOLDER-dojoforge-stance-ready', text: 'The open leg stance.', ...ZERO, powerScale: 0.03, dashCooldownScale: -0.1, blockCut: 0.05, focusGain: 0.08 });
  });
  it('the lines come from #312 main picks, in content, not code', () => {
    const w = styleWords as unknown as { lines: Record<string, string>; notYetLines: Record<string, string>; welcomeStance: string };
    expect(w.lines['beginners-stance']).toBe(main('stance.beginner.oneLiner'));
    expect((abilitiesData as { stances: Array<{ id: string; text: string }> }).stances[0].text).toBe(main('stance.beginner.oneLiner'));
    expect(w.notYetLines[READY_STANCE_ID]).toBe(main('stance.ready.notYet'));
    expect(w.welcomeStance).toBe(main('welcome.beginnerStance'));
    expect(w.lines[READY_STANCE_ID]).toBe('Steady and even, ready for anything.');
    const m = buildStyle(train(newWhite), content.abilities, null);
    expect(m.trays.stance.find((p) => p.id === READY_STANCE_ID)).toMatchObject({ earned: false, line: main('stance.ready.notYet') });
  });
});

describe('R-STANCE-g new players', () => {
  it('a new player starts in Beginner, with Open Leg locked', () => {
    const p = newProfile();
    const t = train(newWhite);
    expect(characterSetup(p, t, content.abilities).stances!.map((s) => s.id)).toEqual(['beginners-stance']);
    expect(buildStyle(t, content.abilities, p.loadout, p.grandfatheredStances).current.stance?.id).toBe('beginners-stance');
    // Saved and loaded again (even after playing runs), still Beginner: the profile is marked done.
    const again = loadProfile(clone({ ...p, runsPlayed: 4 }));
    expect(again.loadout).toBeNull();
    expect(again.grandfatheredStances).toEqual([]);
  });
  it('an unsigned or unknown pick falls back to Beginner', () => {
    const t = train(newWhite);
    expect(normalizeLoadout({ stance: READY_STANCE_ID, virtue: null }, t, content.abilities)).toEqual({ stance: null, virtue: null });
    expect(normalizeLoadout({ stance: 'nope-stance', virtue: null }, t, content.abilities)).toEqual({ stance: null, virtue: null });
    const p = loadProfile(clone({ ...newProfile(), loadout: { stance: 'cat-stance', virtue: null } }));
    expect(characterSetup(p, t, content.abilities).stances![0].id).toBe('beginners-stance');
  });
});

describe('R-STANCE-g migration (b)', () => {
  const oldSave = (extra: object) => {
    const p = clone(newProfile()) as unknown as Record<string, unknown>;
    delete p.grandfatheredStances;
    delete p.stanceMigrated;
    return { ...p, ...extra };
  };
  it('a player with runs and no pick becomes Open Leg, without a sign-off; running it twice changes nothing', () => {
    const once = loadProfile(oldSave({ runsPlayed: 3, loadout: null }));
    expect(once.loadout).toEqual({ stance: READY_STANCE_ID, virtue: null });
    expect(once.grandfatheredStances).toEqual([READY_STANCE_ID]);
    const twice = loadProfile(clone(once));
    expect(twice).toEqual(once);
    expect(migrateReadyStance(once, once.loadout)).toEqual({ loadout: once.loadout, grandfatheredStances: once.grandfatheredStances, stanceMigrated: true });
    const t = train(newWhite);
    expect(characterSetup(twice, t, content.abilities).stances!.map((s) => s.id)).toEqual([READY_STANCE_ID, 'beginners-stance']);
  });
  it('a d1-moved save (stance null) stays Ready; a real pick is kept and Ready is still owned', () => {
    expect(loadProfile(oldSave({ runsPlayed: 0, loadout: { stance: null, virtue: 'second-wind' } })).loadout).toEqual({ stance: READY_STANCE_ID, virtue: 'second-wind' });
    expect(loadProfile(oldSave({ loadout: { form: 'rooted-form', virtue: null } })).loadout).toEqual({ stance: READY_STANCE_ID, virtue: null });
    const cat = loadProfile(oldSave({ runsPlayed: 2, loadout: { stance: 'cat-stance', virtue: null } }));
    expect(cat.loadout).toEqual({ stance: 'cat-stance', virtue: null });
    expect(cat.grandfatheredStances).toEqual([READY_STANCE_ID]);
  });
  it('a pre-g save that never played and never picked stays Beginner, and re-running never makes it Ready', () => {
    const p = loadProfile(oldSave({ runsPlayed: 0, loadout: null }));
    expect(p.loadout).toBeNull();
    expect(p.grandfatheredStances).toEqual([]);
    expect(loadProfile(clone({ ...p, runsPlayed: 9 })).grandfatheredStances).toEqual([]);
  });
});

describe('R-STANCE-g switching', () => {
  it('yellow (Open Leg signed) cycles Beginner, Open Leg, Cat, Front; a grandfathered white cycles Open Leg and Beginner', () => {
    expect(unlockedStances(train(yellow), content.abilities).map((s) => s.id)).toEqual(['beginners-stance', READY_STANCE_ID, 'cat-stance', 'front-stance']);
    const t = train(newWhite);
    expect(unlockedStances(t, content.abilities, [READY_STANCE_ID]).map((s) => s.id)).toEqual(['beginners-stance', READY_STANCE_ID]);
    const p = loadProfile(clone({ ...newProfile(), loadout: { stance: 'cat-stance', virtue: null }, grandfatheredStances: [READY_STANCE_ID] }));
    expect(characterSetup(p, t, content.abilities).stances!.map((s) => s.id)).toEqual(['beginners-stance', READY_STANCE_ID]);
  });
});
