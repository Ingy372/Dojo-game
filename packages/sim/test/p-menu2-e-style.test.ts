// P-MENU2-e: the Fighting Style screen model. Tap a slot, then a pick (D4); the pick goes into
// the profile loadout (P-MENU2-d), survives a save and load, and feeds the next fight. Not-yet
// picks change nothing. Leaving everything alone (or picking the defaults) plays as today.
import { describe, expect, it } from 'vitest';
import { buildTraining, characterSetup, loadFeed, loadProfile, newProfile, type TrainingState } from '../src';
import { testContent } from './load-content';
import yellow from '../../../fixtures/3-yellow-belt.json';
import white from '../../../fixtures/1-white-belt-new.json';
import words from '../../../content/abilities/fighting-style.json';
import { buildStyle, equipPick, styleLayout } from '../../../apps/client/src/ui/fightingStyle';
import { MIN_TAP } from '../../../apps/client/src/ui/tokens';
import { captureGolden } from './golden-capture';
import golden from '../../../fixtures/golden/p-menu2-d-default-run.json';

const content = testContent();
function training(data: unknown): TrainingState {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
}

describe('P-MENU2-e Fighting Style', () => {
  const t = training(yellow);

  it('with no loadout the slots show today\'s defaults', () => {
    const m = buildStyle(t, content.abilities, null);
    expect(m.current.stance?.id).toBe('beginners-stance');
    expect(m.current.virtue?.id).toBe(t.virtue?.def.id);
    expect(m.trays.stance.filter((p) => p.earned).map((p) => p.id)).toEqual(['beginners-stance', 'rooted-form', 'flowing-form']);
  });

  it('tap Stance, tap a pick: the loadout changes and the next fight starts in it', () => {
    const p = newProfile();
    const m = buildStyle(t, content.abilities, p.loadout);
    const flowing = m.trays.stance.find((x) => x.id === 'flowing-form')!;
    p.loadout = equipPick(p.loadout, 'stance', flowing);
    expect(p.loadout).toEqual({ form: 'flowing-form', virtue: null });
    expect(buildStyle(t, content.abilities, p.loadout).current.stance?.id).toBe('flowing-form');
    expect(characterSetup(p, t, content.abilities).forms![0].id).toBe('flowing-form');
  });

  it('tap Virtue, tap a pick: only the Virtue changes', () => {
    const m = buildStyle(t, content.abilities, { form: 'rooted-form', virtue: null });
    const other = m.trays.virtue.find((x) => x.earned && x.id !== t.virtue?.def.id)!;
    const l = equipPick({ form: 'rooted-form', virtue: null }, 'virtue', other);
    expect(l).toEqual({ form: 'rooted-form', virtue: other.id });
  });

  it('the pick survives a save and load (a restart)', () => {
    const p = newProfile();
    const m = buildStyle(t, content.abilities, null);
    p.loadout = equipPick(p.loadout, 'stance', m.trays.stance.find((x) => x.id === 'rooted-form')!);
    const restored = loadProfile(JSON.parse(JSON.stringify(p)));
    expect(restored.loadout).toEqual({ form: 'rooted-form', virtue: null });
    expect(buildStyle(t, content.abilities, restored.loadout).current.stance?.id).toBe('rooted-form');
  });

  it('not-yet picks invite but change nothing; the wrong slot changes nothing', () => {
    const w = training(white);
    const m = buildStyle(w, content.abilities, null);
    const locked = m.trays.stance.filter((x) => !x.earned);
    expect(locked.length).toBeGreaterThan(0);
    for (const x of locked) expect(equipPick(null, 'stance', x)).toBeNull();
    const ym = buildStyle(t, content.abilities, null);
    expect(equipPick(null, 'virtue', ym.trays.stance[1])).toBeNull();
  });

  it('picking the defaults plays exactly as no pick at all, and the golden run is unchanged', () => {
    const m = buildStyle(t, content.abilities, null);
    const none = newProfile();
    const picked = newProfile();
    picked.loadout = equipPick(equipPick(null, 'stance', m.current.stance!), 'virtue', m.current.virtue!);
    expect(characterSetup(picked, t, content.abilities)).toEqual(characterSetup(none, t, content.abilities));
    expect(captureGolden()).toEqual(golden);
  });

  it('every tap target is at least 44 tall at 667, 844 and 932 wide panels', () => {
    for (const [w, h] of [[330, 200], [400, 215], [460, 250]]) {
      const L = styleLayout(w, h);
      expect(L.slotH).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.tileH).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.tileW).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.alwaysY + 12 + 4 + L.icon).toBeLessThanOrEqual(h);
    }
  });

  it('wording is plain: no numbers, no locks, no pressure words', () => {
    const all = JSON.stringify({ ...words, notes: '' });
    expect(all).not.toMatch(/\d/);
    expect(all).not.toMatch(/🔒|locked|hurry|don't miss|only \w+ left|lose/i);
    expect(words.notYet).toBe('Learn this at the dojo');
    expect(words.askSensei).toBe('Ask Sensei about this one');
  });
});
