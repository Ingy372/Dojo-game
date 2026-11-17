// L8-B1 (L8-SPEC sections 1, 3 and 6): Lock is two groups, arm and wrist, live since the hold
// (L8-B2). No Lock rank grows a capped number, and an old save with `lock` equipped still loads.
import { describe, expect, it } from 'vitest';
import { buildTraining, COMBAT, loadFeed, loadProfile, normalizeLoadout, type Now } from '../src';
import green from '../../../fixtures/4-green-belt.json';
import { testContent } from './load-content';

const content = testContent();
const families = content.abilities.families;
const lockGroups = families.filter((f) => f.id.startsWith('lock'));

describe('L8-B1 the two Lock groups', () => {
  it('replaces `lock` with lock-arm and lock-wrist, ranked as section 3 says, both live with the hold', () => {
    expect(families.find((f) => f.id === ('lock' as string))).toBeUndefined();
    expect(lockGroups.map((f) => [f.id, f.live, f.ranks.map((r) => r.technique)])).toEqual([
      ['lock-arm', true, [17, 28, 31, 36]],
      ['lock-wrist', true, [32, 33, 35, 39]],
    ]);
    const effects = (id: string) => lockGroups.find((f) => f.id === id)!.ranks.map((r) => r.effects);
    const hold = [{ type: 'counterLock', amount: 0 }];
    expect(effects('lock-arm')).toEqual([hold, [{ type: 'dashOnBlock', amount: 0 }], [], []]);
    expect(effects('lock-wrist')).toEqual([hold, [{ type: 'healOnPerfect', amount: 2 }], [], []]);
  });

  it('no Lock rank carries a capped number or grows the Perfect Counter package', () => {
    const banned = ['staggerTicks', 'staggerBonus', 'disarm', 'counterHits', 'counterStrength', 'counterWindow'];
    const types = lockGroups.flatMap((f) => f.ranks.flatMap((r) => r.effects.map((e) => e.type as string)));
    expect(types.filter((t) => banned.includes(t))).toEqual([]);
    expect(COMBAT.counter.holdCapTicks).toBe(24);
    expect(COMBAT.counter.sealStaggerBonusCap).toBe(0.2);
  });

  it('techniques #31 to #40 rank in at least 2 families', () => {
    const owners = new Set(families.filter((f) => f.ranks.some((r) => r.technique >= 31 && r.technique <= 40)).map((f) => f.id));
    expect(owners.size).toBeGreaterThanOrEqual(2);
  });

  it('an old save with `lock` equipped loads with that slot empty and nothing else changed', () => {
    const feed = loadFeed(green);
    const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
    const t = buildTraining(feed, content.abilities, now);
    const base = { ...loadProfile(null), runsPlayed: 5, loadoutV2: true, strikeSeeded: true };
    const withLock = loadProfile(JSON.parse(JSON.stringify({ ...base, loadout: { stance: null, virtue: null, strike: null, kata: null, seals: ['escape', 'lock'] } })));
    const without = loadProfile(JSON.parse(JSON.stringify({ ...base, loadout: { stance: null, virtue: null, strike: null, kata: null, seals: ['escape'] } })));
    const a = normalizeLoadout(withLock.loadout, t, content.abilities);
    expect(a).toEqual(normalizeLoadout(without.loadout, t, content.abilities));
    expect(a?.seals).not.toContain('lock');
    const { loadout: _a, ...restA } = withLock;
    const { loadout: _b, ...restB } = without;
    expect(restA).toEqual(restB);
  });
});
