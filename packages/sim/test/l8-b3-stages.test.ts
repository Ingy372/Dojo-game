// L8-B3 (L8-SPEC section 6): Seal stages from rank, one evolution card per evolution, the legacy
// cascade's evolutions on the one welcome card, and the stage on the loadout and in the Book.
import { describe, expect, it } from 'vitest';
import { buildTraining, evolutionsSince, familyStage, loadFeed, rewardMoments, signedOffTechniques, snapshot, type Now } from '../src';
import { buildStyle } from '../../../apps/client/src/ui/fightingStyle';
import { sealStageLine } from '../../../apps/client/src/ui/book';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const families = content.abilities.families;
const feed = loadFeed(green);
const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
const t = buildTraining(feed, content.abilities, now);
const signed = signedOffTechniques(t);

describe('L8-B3 Seal stages', () => {
  it('stage comes from rank: 1 at rank 1, 2 at 3, 3 at 6, 4 at 9', () => {
    expect([0, 1, 2, 3, 5, 6, 8, 9, 12].map(familyStage)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it('the fixture has at least one family past stage 1', () => {
    expect(evolutionsSince(families, new Set(), signed).length).toBeGreaterThan(0);
  });

  it('an evolution shows once, after the sign-off cards, and never again for the same snapshot', () => {
    const prev = snapshot(t);
    const evolved = evolutionsSince(families, new Set(), signed)[0];
    const f = families.find((x) => x.id === evolved.family)!;
    // Take back the technique that reached the stage: the next look shows that sign-off, then the evolution.
    const reqId = t.abilities.filter((a) => a.kind === 'seal')[evolved.technique - 1].requirement.id;
    const before = { ...prev, signed: prev.signed.filter((id) => id !== reqId) };
    const m = rewardMoments(before, t, undefined, null, families);
    const kinds = m.map((x) => x.kind);
    expect(kinds.filter((k) => k === 'evolved')).toHaveLength(1);
    expect(kinds.indexOf('evolved')).toBeGreaterThan(kinds.findIndex((k) => k === 'signOff' || k === 'signOffs'));
    const e = m.find((x) => x.kind === 'evolved');
    expect(e?.kind === 'evolved' && e.evolution).toEqual({ family: f.id, name: f.name, stage: evolved.stage, technique: evolved.technique });
    expect(rewardMoments(prev, t, undefined, null, families)).toEqual([]);
  });

  it('the legacy cascade lists evolutions on the one welcome card, with no evolution cards', () => {
    const m = rewardMoments(null, t, undefined, null, families);
    expect(m.filter((x) => x.kind === 'evolved')).toHaveLength(0);
    const w = m[0];
    if (w.kind !== 'welcome') throw new Error('expected the welcome card');
    expect(w.evolutions).toEqual(evolutionsSince(families, new Set(), signed));
    expect(w.evolutions.every((e) => e.stage >= 2)).toBe(true);
  });

  it('the loadout and the Book show each earned family stage', () => {
    const model = buildStyle(t, content.abilities, null);
    const earned = model.trays.seal.filter((p) => p.earned);
    expect(earned.length).toBeGreaterThan(0);
    for (const p of earned) {
      expect(p.stage).toBeGreaterThanOrEqual(1);
      expect(p.line).toContain(`Stage ${p.stage}`);
    }
    const evolved = evolutionsSince(families, new Set(), signed)[0];
    expect(sealStageLine(families, signed)(evolved.technique)).toBe(`${evolved.name} Seal: Stage ${evolved.stage}`);
  });
});
