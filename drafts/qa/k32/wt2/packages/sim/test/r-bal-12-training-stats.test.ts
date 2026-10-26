import { describe, expect, it } from 'vitest';
import white0 from '../../../fixtures/1-white-belt-new.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import {
  buildTraining,
  ENEMY_TRAINING_SCALE,
  loadFeed,
  migrateStripesByBelt,
  POWER,
  TRAINING_STATS,
  trainingStats,
  type StudentFeed,
  type TrainingState,
} from '../src';
import { testContent } from './load-content';

const content = testContent();
const build = (feed: StudentFeed): TrainingState => buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
const ge = (a: { power: number; maxHealth: number; guard: number }, b: typeof a) => {
  expect(a.power).toBeGreaterThanOrEqual(b.power);
  expect(a.maxHealth).toBeGreaterThanOrEqual(b.maxHealth);
  expect(a.guard).toBeGreaterThanOrEqual(b.guard);
};

describe('R-BAL-12 training stats', () => {
  const base = loadFeed(white0);
  const white = base.school.belts[0];

  it('white: 7 sign-offs + 2 stripes give +7 Power, +28 Health, +14 Guard (whole numbers)', () => {
    const feed: StudentFeed = {
      ...base,
      requirements: white.requirements.slice(0, 7).map((r) => ({ id: r.id, signedOff: true, signedOffOn: base.asOf, signedOffBy: 'Sensei', videoId: null })) as StudentFeed['requirements'],
      stripes: [{ word: 'respect', belt: white.id, earnedOn: base.asOf }, { word: 'focus', belt: white.id, earnedOn: base.asOf }],
      homePractice: { ...base.homePractice, approvedMinutes: 0 },
    };
    const t = build(feed);
    const signed = t.requirements.filter((r) => r.signedOff).length;
    expect(trainingStats(t)).toEqual({ power: signed * 1, maxHealth: signed * 4, guard: 14 });
    for (const v of Object.values(trainingStats(t))) expect(Number.isInteger(v)).toBe(true);
  });

  it('adding a sign-off, stripe or Training Point never lowers a stat', () => {
    const t = build(loadFeed(yellow));
    const before = trainingStats(t);
    const reqs = t.requirements.map((r) => ({ ...r, signedOff: true }));
    ge(trainingStats({ ...t, requirements: reqs }), before);
    ge(trainingStats({ ...t, trainingPoints: t.trainingPoints + 1 }), before);
    ge(trainingStats({ ...t, stripesByBelt: { ...t.stripesByBelt, [t.belt.id]: (t.stripesByBelt[t.belt.id] ?? 0) + 1 } }), before);
  });

  it('Training Points over 28 per belt tier add nothing', () => {
    const t = build(loadFeed(yellow));
    const cap = 28 * t.tier;
    expect(trainingStats({ ...t, trainingPoints: cap + 50 })).toEqual(trainingStats({ ...t, trainingPoints: cap }));
  });

  it('a legacy (passed) belt gives full sign-off values', () => {
    const t = build(loadFeed(yellow));
    const legacy = t.requirements.filter((r) => r.legacy);
    expect(legacy.length).toBeGreaterThan(0);
    const only = trainingStats({ ...t, requirements: legacy, stripesByBelt: {}, trainingPoints: 0 });
    expect(only.power).toBe(legacy.length * TRAINING_STATS[0].signOff.power);
  });

  it('enemy scale rows are > 1 and never shrink with belt', () => {
    for (let i = 0; i < ENEMY_TRAINING_SCALE.length; i++) {
      expect(ENEMY_TRAINING_SCALE[i].maxHealth).toBeGreaterThan(1);
      if (i > 0) expect(ENEMY_TRAINING_SCALE[i].power).toBeGreaterThanOrEqual(ENEMY_TRAINING_SCALE[i - 1].power);
    }
  });
});

describe('R-BAL-12 save migration (stripesByBelt) only ever goes up', () => {
  const belts = loadFeed(yellow).school.belts;
  const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

  it('an old save with only a count keeps every stripe', () => {
    for (let total = 0; total <= 8; total++) {
      const out = migrateStripesByBelt(belts, [], total, 2);
      expect(sum(out)).toBe(total);
      // Oldest belts first, at most 2 each, until the current belt.
      if (total <= 6) for (const n of Object.values(out)) expect(n).toBeLessThanOrEqual(POWER.stripesPerBelt);
    }
  });

  it('stripes named in the feed stay on their belt; missing ones are added, never removed', () => {
    const feed = [{ belt: belts[1].id }];
    const out = migrateStripesByBelt(belts, feed, 3, 1);
    expect(out[belts[1].id]).toBeGreaterThanOrEqual(1);
    expect(sum(out)).toBe(3);
  });

  it('old saves: migrated stats and stripe count are >= what the old save showed', () => {
    const t = build(loadFeed(yellow));
    // "Old" = what the game gave before R-BAL-12 (no training stats) and its totalStripes.
    for (let total = t.totalStripes; total <= t.totalStripes + 4; total++) {
      const migrated = migrateStripesByBelt(t.belts, [], total, t.tier - 1);
      expect(sum(migrated)).toBeGreaterThanOrEqual(total);
      const stats = trainingStats({ ...t, stripesByBelt: migrated });
      ge(stats, { power: 0, maxHealth: 0, guard: 0 });
      ge(stats, trainingStats({ ...t, stripesByBelt: {} }));
    }
    expect(sum(t.stripesByBelt)).toBeGreaterThanOrEqual(t.totalStripes);
  });
});
