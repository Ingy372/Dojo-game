import { describe, expect, it } from 'vitest';
import { auraRings, CLASS_CHEST, COINS, classPieceOrder, loadFeed, newDojo, newProfile, noteBestStreak, openClassChests, rarityRank, buildTraining } from '../src';
import { testContent } from './load-content';
import WORDS from '../../../content/settings/class-chest.json';
import yellow from '../../../fixtures/3-yellow-belt.json';

// LP-B3 (L4): a Class Chest for every class with no end, and an aura from the best streak that only grows.
const content = testContent();
const WHITE = { tier: 1, color: '#ffffff' };
const day = (i: number) => new Date(Date.UTC(2026, 0, 1 + i * 3)).toISOString().slice(0, 19);

describe('Class Chest every class', () => {
  it('30 classes, one at a time, give 30 chests: the class pieces first, then Uncommon or better gear', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    openClassChests(p, dojo, content, { checkIns: [], classesInRank: 0, classesTotal: null, belt: WHITE });
    const seen: string[] = [];
    const chests = [];
    for (let i = 0; i < 30; i++) {
      seen.push(day(i));
      // The feed only keeps recent check-ins: the window slides, chests never stop.
      chests.push(...openClassChests(p, dojo, content, { checkIns: seen.slice(-8), classesInRank: 0, classesTotal: null, belt: WHITE }));
    }
    expect(chests).toHaveLength(30);
    const pieces = classPieceOrder(content).length;
    expect(chests.filter((c) => c.kind === 'decor')).toHaveLength(pieces - 1);
    const gear = chests.flatMap((c) => (c.kind === 'gear' ? [c.item] : []));
    expect(gear).toHaveLength(30 - (pieces - 1));
    expect(gear.every((g) => rarityRank(g.rarity) >= rarityRank('uncommon'))).toBe(true);
    expect(new Set(gear.map((g) => g.uid)).size).toBe(gear.length);
    for (const g of gear) expect(p.inventory).toContainEqual(g);
  });

  it('30 classes that arrive in one sync still give 30 chests', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    openClassChests(p, dojo, content, { checkIns: [], classesInRank: 0, classesTotal: null, belt: WHITE });
    const all = Array.from({ length: 30 }, (_, i) => day(i));
    expect(openClassChests(p, dojo, content, { checkIns: all, classesInRank: 0, classesTotal: null, belt: WHITE })).toHaveLength(30);
  });

  it('200 classes at once: every chest pays coins, but the bag gets at most 5 pieces of gear', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    openClassChests(p, dojo, content, { checkIns: [], classesInRank: 0, classesTotal: 0, belt: WHITE });
    const coinsBefore = p.coins;
    const bagBefore = p.inventory.length;
    const chests = openClassChests(p, dojo, content, { checkIns: [], classesInRank: 200, classesTotal: 200, belt: WHITE });
    expect(chests).toHaveLength(200);
    expect(p.coins - coinsBefore).toBe(200 * COINS.classChest);
    expect(chests.filter((c) => c.kind === 'decor')).toHaveLength(classPieceOrder(content).length - 1);
    expect(chests.filter((c) => c.kind === 'gear')).toHaveLength(CLASS_CHEST.maxGearPerVisit);
    expect(p.inventory.length - bagBefore).toBe(CLASS_CHEST.maxGearPerVisit);
    // The next class, on its own, gives gear again.
    const next = openClassChests(p, dojo, content, { checkIns: [], classesInRank: 201, classesTotal: 201, belt: WHITE });
    expect(next.map((c) => c.kind)).toEqual(['gear']);
  });

  it('a long time away still gives a chest for every class, even ones the feed window dropped', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    const all = Array.from({ length: 30 }, (_, i) => day(i));
    openClassChests(p, dojo, content, { checkIns: all.slice(0, 10), classesInRank: 10, classesTotal: 10, belt: WHITE });
    // 20 new classes, but only the last 8 are still in the window.
    expect(openClassChests(p, dojo, content, { checkIns: all.slice(-8), classesInRank: 30, classesTotal: 30, belt: WHITE })).toHaveLength(20);
    // Nothing new: no chest, and no double count on the next sync.
    expect(openClassChests(p, dojo, content, { checkIns: all.slice(-8), classesInRank: 30, classesTotal: 30, belt: WHITE })).toHaveLength(0);
    expect(openClassChests(p, dojo, content, { checkIns: [...all.slice(-7), day(30)], classesInRank: 31, classesTotal: 31, belt: WHITE })).toHaveLength(1);
  });
});

describe('best-streak aura', () => {
  it('reads the best streak ever, so it never goes down', () => {
    const p = newProfile();
    let rings = 0;
    for (const weeks of [0, 1, 2, 5, 0, 1, 3, 9, 0, 0, 13, 2, 21, 0]) {
      noteBestStreak(p, weeks);
      const now = auraRings(p.bestStreakWeeks, WORDS.auraSteps);
      expect(now).toBeGreaterThanOrEqual(rings);
      rings = now;
    }
    expect(p.bestStreakWeeks).toBe(21);
    expect(rings).toBe(WORDS.auraSteps.length);
  });

  it('the steps go up, and the training state carries the feed streak', () => {
    const s = WORDS.auraSteps;
    expect(s.every((n, i) => Number.isInteger(n) && n > 0 && (i === 0 || n > s[i - 1]))).toBe(true);
    const feed = loadFeed(yellow);
    expect(buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 }).streakWeeks).toBe(14);
  });
});

// Words a child could read: content data and the game's code.
const SOURCES = import.meta.glob(['../../../content/**/*.json', '../../../apps/client/src/**/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const LOSS = [
  /streak[^"'`\n]{0,30}\b(lost|lose|broke|broken|ends?|ended|reset|gone|shrinks?|over|missed)\b/i,
  /\b(lose|lost|break|broke|keep|save|protect|don't lose|restore)\b[^"'`\n]{0,12}\bstreak/i,
];

describe('no streak-loss words anywhere', () => {
  it('no kid-facing text talks about losing, breaking or keeping a streak', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(50);
    const hits: string[] = [];
    for (const [file, text] of Object.entries(SOURCES)) {
      for (const line of text.split('\n')) {
        // Code comments and "_note" keys explain the rule; only other strings reach a child.
        if (/^\s*("_|\/\/|\*|\/\*)/.test(line)) continue;
        const strings = line.match(/(["'`])(?:(?!\1).)*\1/g) ?? [];
        for (const s of strings) if (LOSS.some((re) => re.test(s))) hits.push(`${file}: ${s}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('the chest words are short kid lines', () => {
    for (const k of ['title', 'titleMany', 'line', 'decor', 'gear', 'more', 'storage', 'button'] as const) {
      expect(WORDS[k].split(/\s+/).length, k).toBeLessThanOrEqual(8);
    }
  });
});
