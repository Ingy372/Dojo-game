// R-STANCE-d2: each stance (Cat, Front, Fighting, Horse) unlocks only from its own teacher
// sign-off in the DojoForge feed (stanceSignOffs), at any belt. No automatic or legacy grant;
// stance sign-offs stay out of the Gate and the Power Rating Sign-offs score; katas unlock nothing.
import { describe, expect, it } from 'vitest';
import {
  buildTraining,
  loadAbilities,
  loadFeed,
  loadProfile,
  newProfile,
  normalizeLoadout,
  powerRating,
  rewardMoments,
  signOffGain,
  signOffsRow,
  snapshot,
  unlockedStances,
} from '../src';
import abilitiesData from '../../../content/abilities/abilities.json';
import { buildStyle } from '../../../apps/client/src/ui/fightingStyle';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const train = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() });
};
type Sign = { id: string; signedOff: boolean; signedOffOn: string | null; signedOffBy: string | null };
const withStances = (data: unknown, set: (s: Sign) => void) => {
  const d = clone(data) as { stanceSignOffs: Sign[] };
  d.stanceSignOffs.forEach(set);
  return d;
};
const none = (data: unknown) => withStances(data, (s) => Object.assign(s, { signedOff: false, signedOffOn: null, signedOffBy: null }));
const names = (data: unknown) => unlockedStances(train(data), content.abilities).map((s) => s.id);

describe('R-STANCE-d2 stance sign-offs', () => {
  it('a stance sign-off unlocks that stance; the rest show as not-yet in the picker', () => {
    expect(names(white3)).toEqual(['beginners-stance', 'cat-stance']);
    expect(names(green)).toEqual(['beginners-stance', 'ready-stance', 'front-stance', 'fighting-stance', 'horse-stance']);
    const m = buildStyle(train(green), content.abilities, null);
    expect(m.trays.stance.map((p) => [p.id, p.earned])).toEqual([
      ['beginners-stance', true],
      ['ready-stance', true],
      ['front-stance', true],
      ['fighting-stance', true],
      ['horse-stance', true],
      ['cat-stance', false],
    ]);
  });

  it('works at any belt: Horse can be signed at white belt', () => {
    const d = withStances(none(white3), (s) => {
      if (s.id.endsWith('horse')) Object.assign(s, { signedOff: true, signedOffOn: '2026-11-16', signedOffBy: 'Sensei Jay' });
    });
    expect(names(d)).toEqual(['beginners-stance', 'horse-stance']);
  });

  it('gives no automatic or legacy grant at a higher belt, and katas unlock no stance', () => {
    expect(names(none(green))).toEqual(['beginners-stance']);
    expect(names(none(yellow))).toEqual(['beginners-stance']);
    expect(train(green).abilities.filter((a) => a.stance)).toEqual([]);
    expect(train(green).stances.every((s) => !s.requirement.legacy && !s.requirement.catchUp)).toBe(true);
  });

  it('leaves the Gate and the Power Rating Sign-offs score unchanged', () => {
    const signed = train(green);
    const bare = train(none(green));
    expect(signed.gate).toEqual(bare.gate);
    expect(signed.requirements).toEqual(bare.requirements);
    const part = (t: typeof signed) => powerRating(t, newProfile()).parts.find((p) => p.source === 'signOffs');
    expect(part(signed)).toEqual(part(bare));
  });

  it('a new stance sign-off plays a "Stance: X" reward moment once', () => {
    const before = train(none(white3));
    const after = train(white3);
    const m = rewardMoments(snapshot(before), after);
    expect(m.map((x) => x.kind)).toEqual(['signOff']);
    const one = m[0];
    expect(one.kind === 'signOff' && one.ability).toBe('Stance: Cat Stance');
    expect(one.kind === 'signOff' && one.requirement.signedOffBy).toBe('Sensei Jay');
    expect(rewardMoments(snapshot(after), after)).toEqual([]);
  });

  it('idempotent load: a picked stance that is not signed off loads as Ready, Virtue kept; again changes nothing', () => {
    const t = train(white3);
    const p = newProfile();
    p.loadout = { stance: 'horse-stance', virtue: 'second-wind' };
    const loaded = loadProfile(clone(p));
    const once = normalizeLoadout(loaded.loadout, t, content.abilities);
    expect(once).toEqual({ stance: null, virtue: 'second-wind' });
    expect(normalizeLoadout(once, t, content.abilities)).toEqual(once);
    expect(loadProfile(clone({ ...loaded, loadout: once }))).toEqual(loadProfile(clone({ ...loaded, loadout: once })));
    expect(normalizeLoadout({ stance: 'cat-stance', virtue: null }, t, content.abilities)).toEqual({ stance: 'cat-stance', virtue: null });
  });

  it('content: Ready has no sign-off id, every other stance a unique clearly marked placeholder', () => {
    const ids = content.abilities.stances.map((s) => s.signOffId);
    expect(ids[0]).toBeNull();
    expect(ids.slice(1)).toEqual([
      'PLACEHOLDER-dojoforge-stance-ready',
      'PLACEHOLDER-dojoforge-stance-cat',
      'PLACEHOLDER-dojoforge-stance-front',
      'PLACEHOLDER-dojoforge-stance-fighting',
      'PLACEHOLDER-dojoforge-stance-horse',
    ]);
    const bad = clone(abilitiesData) as { stances: Array<{ signOffId?: string | null }> };
    bad.stances[2].signOffId = bad.stances[1].signOffId;
    expect(() => loadAbilities(bad)).toThrow();
    const missing = clone(abilitiesData) as { stances: Array<{ signOffId?: string | null }> };
    delete missing.stances[1].signOffId;
    expect(() => loadAbilities(missing)).toThrow();
  });

  it('the feed rejects a duplicate stance sign-off id', () => {
    const d = clone(white3) as { stanceSignOffs: Sign[] };
    d.stanceSignOffs.push(clone(d.stanceSignOffs[0]));
    expect(() => loadFeed(d)).toThrow();
  });
});

describe('R-STANCE-d2 stance sign-offs add no stats', () => {
  it('signOffGain counts belt sign-offs only, so the card never claims a stance made you stronger', () => {
    const t = train(white3);
    const cat = t.stances.find((s) => s.def.id === 'cat-stance')!.requirement;
    expect(signOffGain(t, [cat])).toEqual({ power: 0, health: 0, guard: 0 });
    const kata = t.requirements.find((r) => r.name === 'Basic Form 1')!;
    expect(signOffGain(t, [kata, cat])).toEqual(signOffGain(t, [kata]));
  });

  it('a stance row in the sign-offs cascade names the stance once', () => {
    const m = rewardMoments(null, train(green));
    const list = m.find((x) => x.kind === 'signOffs');
    const rows = list?.kind === 'signOffs' ? list.list.map((r) => signOffsRow(r.requirement, r.ability.split(' (')[0], false).text) : [];
    expect(rows).toContain('✓ Stance: Front Stance');
    expect(rows.some((t) => /Stance: .*Stance: /.test(t) || t.startsWith('✓ Front Stance:'))).toBe(false);
    expect(rows).toContain('✓ Basic Form 1: Kata');
  });
});
