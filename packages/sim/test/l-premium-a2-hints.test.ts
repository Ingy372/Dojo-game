// L-PREMIUM-a2: every locked Trophy Case cubby gets a "how to earn it" hint from locked-hints.json.
import { describe, expect, it } from 'vitest';
import { buildTraining, loadFeed, type Now } from '../src';
import white0 from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import abilities from '../../../content/abilities/abilities.json';
import hints from '../../../content/hints/locked-hints.json';
import draft from '../../../drafts/content/hints/locked-hints.json';
import { buildCubbies } from '../../../apps/client/src/ui/trophyCase';
import { HINT_RULES, TROPHY_HINTS, hintAbilityId } from '../../../apps/client/src/ui/lockedHints';
import { BOARD_PAPER, contrast } from '../../../apps/client/src/ui/tokens';
import { testContent } from './load-content';

const content = testContent();
const cubbiesFor = (profile: Parameters<typeof loadFeed>[0]) => {
  const feed = loadFeed(profile);
  const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
  const t = buildTraining(feed, content.abilities, now);
  return buildCubbies({ abilities: t.abilities, virtues: t.virtues, beltName: (id) => id, virtueName: (v) => v.def.name, virtueEffect: (v) => v.def.text, kataLine: () => undefined });
};

describe('L-PREMIUM-a2 locked hints', () => {
  it('the content copy matches the #333 draft', () => {
    expect(hints).toEqual(draft);
  });

  it('every stance, strike and seal (but the Beginner\'s Stance) has a hint', () => {
    for (const s of abilities.stances.slice(1)) expect(TROPHY_HINTS.get(s.id), s.id).toBeTruthy();
    for (const x of [...abilities.strikes, ...abilities.seals]) expect(TROPHY_HINTS.get(x.id), x.id).toBeTruthy();
  });

  for (const [name, profile] of [['new White', white0], ['White + 3', white3], ['Yellow', yellow], ['Green', green]] as const) {
    it(`${name}: every locked cubby has a hint; earned ones have none`, () => {
      const cubbies = cubbiesFor(profile as Parameters<typeof loadFeed>[0]).filter((c) => c.shelf !== 'stripes');
      const locked = cubbies.filter((c) => !c.earned);
      if (name !== 'Green') expect(locked.length).toBeGreaterThan(0);
      for (const c of locked) expect(c.hint, c.id).toBeTruthy();
      for (const c of cubbies.filter((x) => x.earned)) expect(c.hint, c.id).toBeUndefined();
    });
  }

  it('kata cubbies fall back to the stance hint; past the end of a list the last hint is used', () => {
    expect(hintAbilityId('stance', 0)).toBe('cat-stance');
    expect(hintAbilityId('stance', 99)).toBe('horse-stance');
    expect(hintAbilityId('strike', 99)).toBe('quick-combo');
    expect(hintAbilityId('seal', 0, 'off-balance')).toBe('off-balance');
  });

  it('hints follow the rules: at most maxWords words, no banned word', () => {
    for (const [id, h] of TROPHY_HINTS) {
      expect(h.split(/\s+/).length, id).toBeLessThanOrEqual(HINT_RULES.maxWords);
      for (const b of HINT_RULES.banned) expect(new RegExp(`\\b${b}\\b`, 'i').test(h), `${id}: ${b}`).toBe(false);
    }
  });

  it('the hint ink (#5a3e28) on the sheet paper is at least 4.5:1', () => {
    expect(contrast(0x5a3e28, BOARD_PAPER)).toBeGreaterThanOrEqual(4.5);
  });
});
