import { describe, expect, it } from 'vitest';
import {
  BLESSING,
  FeedError,
  POWER,
  PROGRESSION,
  buildTraining,
  gainXp,
  loadFeed,
  newProfile,
  powerRating,
  rewardMoments,
  shiftFeedDates,
  snapshot,
  tierXp,
  unlockedForms,
  xpToNext,
  type Now,
  type StudentFeed,
} from '../src';
import newWhite from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import { testContent } from './load-content';

const content = testContent();
const abilities = content.abilities;
const at = (feed: StudentFeed): Now => ({ ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() });
const train = (data: unknown) => {
  const feed = loadFeed(data);
  return buildTraining(feed, abilities, at(feed));
};

describe('student profiles (feed)', () => {
  it('loads all three fake profiles', () => {
    for (const f of [newWhite, white3, yellow]) expect(() => loadFeed(f)).not.toThrow();
  });

  it('explains what is wrong with a broken profile', () => {
    expect(() => loadFeed({ ...newWhite, rank: { ...newWhite.rank, currentBelt: 'purple' } })).toThrow(FeedError);
    expect(() => loadFeed({ ...newWhite, rank: { ...newWhite.rank, currentBelt: 'purple' } })).toThrow(/purple/);
  });

  it('uses the school curriculum: numbered self-defense and kick combos', () => {
    const belts = loadFeed(newWhite).school.belts;
    expect(belts.map((b) => b.id)).toEqual(['white', 'yellow', 'orange', 'green', 'blue', 'red', 'red-black', 'brown', 'brown-black', 'black']);
    expect(belts[1].requirements.map((r) => r.name)).toEqual([
      'Basic Form 2',
      'Self-Defense #6',
      'Self-Defense #7',
      'Self-Defense #8',
      'Self-Defense #9',
      'Self-Defense #10',
      'Kick Combo 2',
    ]);
    expect(belts[6].requirements[belts[6].requirements.length - 1].name).toBe('Kick Combo 7');
    expect(belts[7].requirements.some((r) => r.type === 'kickCombo')).toBe(false);
    expect(belts[9].requirements.map((r) => r.name)).toEqual(['Kick Combo 8', 'Kick Combo 9', 'Kick Combo 10', 'Kick Combo 11', 'Kick Combo 12']);
  });

  it('shifts dates so a fake profile always looks fresh', () => {
    const feed = shiftFeedDates(loadFeed(white3), '2030-01-01T20:00:00.000Z');
    expect(feed.asOf).toBe('2030-01-01T20:00:00.000Z');
    // The last class was 3 hours before asOf, and still is.
    expect(Date.parse(feed.asOf) - Date.parse(feed.attendance.recentClasses[feed.attendance.recentClasses.length - 1])).toBe(3 * 3600 * 1000);
  });
});

describe('brand-new white belt', () => {
  const t = train(newWhite);
  it('is tier 1 with a level cap of 10', () => {
    expect(t.belt.name).toBe('White Belt');
    expect(t.tier).toBe(1);
    expect(t.levelCap).toBe(10);
    expect(t.tierMax).toBe(1000);
  });
  it('has nothing unlocked, and every ability says how to unlock it', () => {
    expect(t.abilities).toHaveLength(7);
    expect(t.abilities.every((a) => !a.unlocked)).toBe(true);
    expect(unlockedForms(t, abilities).map((f) => f.name)).toEqual(["Beginner's Stance"]);
    expect(t.virtue).toBeNull();
  });
  it('has an unlit Gate and points to the kata on the Path card', () => {
    expect(t.gate.locks).toHaveLength(7);
    expect(t.gate.lit).toBe(0);
    expect(t.gate.sealLit).toBe(false);
    expect(t.gate.ready).toBe(false);
    expect(t.gate.sundial).toBeCloseTo(1 / 24);
    expect(t.gate.toBelt?.name).toBe('Yellow Belt');
    expect(t.path.next?.name).toBe('Basic Form 1');
  });
  it('is not blessed (last class over 48 hours ago)', () => {
    expect(t.blessed).toBe(false);
  });
});

describe('white belt with 3 sign-offs and a stripe', () => {
  const t = train(white3);
  it('unlocks the Form, and a Technique Seal per self-defense sign-off', () => {
    const unlocked = t.abilities.filter((a) => a.unlocked);
    expect(unlocked.map((a) => a.requirement.name)).toEqual(['Basic Form 1', 'Self-Defense #1', 'Self-Defense #3']);
    expect(unlocked.map((a) => a.form?.name ?? a.perk?.name)).toEqual(['Rooted Form', 'Off-Balance', 'Sweep']);
    expect(unlocked[2].requirement.signedOffBy).toBe('Sensei Jay');
    expect(unlockedForms(t, abilities).map((f) => f.name)).toEqual(["Beginner's Stance", 'Rooted Form']);
  });
  it('turns the Respect stripe into the Shield of Respect', () => {
    expect(t.virtue?.def.name).toBe('Shield of Respect');
    expect(t.virtue?.rank).toBe(1);
    expect(t.stripesThisBelt).toBe(1);
  });
  it('lights 3 Gate locks and points to the next unsigned technique', () => {
    expect(t.gate.lit).toBe(3);
    expect(t.path.next?.name).toBe('Self-Defense #2');
  });
  it('is blessed after class today', () => {
    expect(t.blessed).toBe(true);
    expect(t.blessingEndsMs! - Date.parse(t.lastClass!)).toBe(BLESSING.hours * 3600 * 1000);
  });
});

describe('yellow belt', () => {
  const t = train(yellow);
  it('is tier 2 with a level cap of 20, and expects level 10', () => {
    expect(t.tier).toBe(2);
    expect(t.levelCap).toBe(20);
    expect(t.expectedLevel).toBe(PROGRESSION.levelsPerTier);
    expect(t.tierMax).toBe(2000);
  });
  it('counts white belt as passed (legacy grant), except the catch-up item', () => {
    const white = t.requirements.filter((r) => r.belt === 'white');
    expect(white.filter((r) => r.signedOff)).toHaveLength(6);
    const sd4 = white.find((r) => r.name === 'Self-Defense #4')!;
    expect(sd4.signedOff).toBe(false);
    expect(sd4.catchUp).toBe(true);
    expect(white.filter((r) => r.legacy)).toHaveLength(6);
  });
  it('keeps catch-up items off the Gate, which glows Ready with the Seal lit', () => {
    expect(t.gate.locks.every((r) => r.belt === 'yellow')).toBe(true);
    expect(t.gate.lit).toBe(7);
    expect(t.gate.ready).toBe(true);
    expect(t.gate.sealLit).toBe(true);
    expect(t.gate.testDate).toBe('2027-03-27');
    expect(t.gate.toBelt?.name).toBe('Orange Belt');
  });
  it('points the Path card at the catch-up item', () => {
    expect(t.path.next?.name).toBe('Self-Defense #4');
    expect(t.path.testDate).toBe('2027-03-27');
  });
  it('ranks up Respect, earned again at yellow belt, and takes it into fights', () => {
    expect(t.virtues.map((v) => [v.def.name, v.rank])).toEqual([
      ['Shield of Respect', 2],
      ['Second Wind', 1],
    ]);
    expect(t.virtue?.def.name).toBe('Shield of Respect');
  });
  it('switches between three Forms', () => {
    expect(unlockedForms(t, abilities).map((f) => f.name)).toEqual(["Beginner's Stance", 'Rooted Form', 'Flowing Form']);
  });
});

describe('reward moments', () => {
  const a = train(newWhite);
  const b = train(white3);
  const c = train(yellow);

  it('welcomes a first-time player with everything their training unlocked', () => {
    const m = rewardMoments(null, c);
    expect(m).toHaveLength(1);
    expect(m[0].kind).toBe('welcome');
    if (m[0].kind === 'welcome') expect(m[0].unlocked).toHaveLength(13);
  });

  it('celebrates new progress, the stripe before the sign-offs', () => {
    const m = rewardMoments(snapshot(a), b);
    expect(m.map((x) => x.kind)).toEqual(['stripe', 'signOff', 'signOff', 'signOff', 'blessing']);
    const first = m[1];
    if (first.kind === 'signOff') {
      expect(first.requirement.name).toBe('Basic Form 1');
      expect(first.requirement.signedOffBy).toBe('Sensei Jay');
      expect(first.ability).toBe('Form: Rooted Form');
    }
  });

  it('puts the promotion ceremony first', () => {
    const m = rewardMoments(snapshot(b), c);
    expect(m[0].kind).toBe('promotion');
    if (m[0].kind === 'promotion') {
      expect(m[0].from.name).toBe('White Belt');
      expect(m[0].to.name).toBe('Yellow Belt');
      expect(m[0].levelCap).toBe(20);
    }
    expect(m.map((x) => x.kind)).toEqual(['promotion', 'stripe', 'stripe', 'signOffs', 'testApproved']);
    const stripes = m.filter((x) => x.kind === 'stripe').map((x) => (x.kind === 'stripe' ? x.virtue : ''));
    expect(stripes).toEqual(['Shield of Respect II', 'Second Wind']);
  });

  it('has nothing new to celebrate the second time', () => {
    expect(rewardMoments(snapshot(b), b)).toEqual([]);
  });

  it('never celebrates going down a belt (only possible when testing)', () => {
    expect(rewardMoments(snapshot(c), a)).toEqual([]);
  });
});

describe('levels and experience', () => {
  it('reaches the white belt cap at about 75% of the typical time in rank', () => {
    const belts = loadFeed(newWhite).school.belts;
    let total = 0;
    for (let l = 1; l < 10; l++) total += xpToNext(l, belts);
    expect(total).toBeCloseTo(tierXp(belts[0]), -1);
    const runs = total / PROGRESSION.typicalRunXp / PROGRESSION.typicalRunsPerWeek / PROGRESSION.weeksPerMonth;
    expect(runs).toBeCloseTo(belts[0].typicalMonthsInRank * PROGRESSION.capAtShareOfRank, 1);
  });

  it('stops at the level cap', () => {
    const t = train(newWhite);
    const p = newProfile();
    const gain = gainXp(p, t, 1_000_000);
    expect(p.level).toBe(10);
    expect(p.xp).toBe(0);
    expect(gain.atCap).toBe(true);
  });

  it('gives double experience below the expected level, and more when blessed', () => {
    const p = newProfile();
    const y = train(yellow); // expected level 10, not blessed
    expect(gainXp(p, y, 100).gained).toBe(200);
    const blessed = train(white3);
    const q = newProfile();
    expect(gainXp(q, blessed, 100).gained).toBe(150);
  });
});

describe('Power Rating (hidden from players)', () => {
  it('splits the tier max into the seven sources', () => {
    const pr = powerRating(train(newWhite), newProfile());
    expect(pr.parts.map((p) => p.max)).toEqual([400, 170, 100, 180, 80, 50, 20]);
    expect(pr.parts.reduce((s, p) => s + p.max, 0)).toBe(1000);
    // A brand-new white belt at level 1: only the level part has anything in it.
    expect(pr.total).toBe(18);
  });

  it('adds up a yellow belt', () => {
    const p = newProfile();
    p.level = 12;
    const pr = powerRating(train(yellow), p);
    const part = (s: string) => pr.parts.find((x) => x.source === s)!;
    expect(part('signOffs').value).toBe(Math.round(800 * (13 / 14)));
    expect(part('virtues').value).toBe(Math.round(200 * (3 / 4)));
    expect(part('trainingPoints').value).toBe(Math.round(340 * (32 / 56)));
    expect(part('level').value).toBe(Math.round(360 * (12 / 20)));
    expect(pr.total).toBeLessThanOrEqual(pr.tierMax);
  });

  it('can never go past the rank cap', () => {
    const p = newProfile();
    p.level = 999;
    p.inventory = [{ uid: 'x', base: 'b', name: 'n', slot: 'hands', rarity: 'epic', stats: { power: 999, maxHealth: 999, guard: 999 }, effect: null, effectText: '' }];
    p.equipped.hands = 'x';
    const huge = loadFeed({ ...yellow, homePractice: { approvedMinutes: 999999, recent: [] }, stripes: Array(20).fill({ word: 'Respect', belt: 'yellow', earnedOn: '2027-01-10' }) });
    const pr = powerRating(buildTraining(huge, abilities, at(huge)), p);
    for (const part of pr.parts) expect(part.value).toBeLessThanOrEqual(part.max);
    expect(pr.total).toBeLessThanOrEqual(2 * POWER.perTier);
  });
});
