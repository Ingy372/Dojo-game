import { describe, expect, it } from 'vitest';
import {
  DECOR_MAX_COPIES,
  bankRunDecorations,
  classPieceOrder,
  createRunWorld,
  loadFeed,
  loadProfile,
  newDojo,
  newProfile,
  oneTimeRunPieces,
  restoreRun,
  startRun,
  summarizeRun,
  syncClassPieces,
  updateRun,
  type ClassInfo,
  type Content,
  type RunSummary,
  type WorldState,
} from '../src';
import { testContent } from './load-content';
import whiteFeed from '../../../fixtures/1-white-belt-new.json';
import yellowFeed from '../../../fixtures/3-yellow-belt.json';

const content = testContent();
const WHITE = { tier: 1, color: '#ffffff' };
const YELLOW = { tier: 2, color: '#f2d33a' };

function classes(n: number, from = 1): string[] {
  return Array.from({ length: n }, (_, i) => `2026-10-${String(from + i).padStart(2, '0')}T17:00:00`);
}
function info(checkIns: string[], over: Partial<ClassInfo> = {}): ClassInfo {
  return { checkIns, classesInRank: 0, classesTotal: null, belt: WHITE, ...over };
}
function owned(dojo: ReturnType<typeof newDojo>, id: string) {
  return dojo.items.filter((i) => i.id === id);
}
const summary = (over: Partial<RunSummary>): RunSummary => ({
  ...summarizeRun(startRun(content, { seed: 1, dryRuns: 0 })),
  ...over,
});

describe('class pieces (S7)', () => {
  it('come in a fixed order: the class scrolls in curriculum order, then gear', () => {
    expect(classPieceOrder(content).map((d) => d.id.replace('decor-a6-', ''))).toEqual([
      'class-scroll-bow', 'class-scroll-form1', 'class-scroll-form2', 'class-scroll-key-on',
      'class-scroll-kicks', 'class-scroll-defense', 'class-scroll-kindness',
      'kick-pad', 'focus-mitt', 'belt-rack', 'sparring-helmet', 'water-bottle', 'bow-mat',
    ]);
  });

  it('the first sync gives one welcome piece and seeds the count from the feed, however long the history', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    const got = syncClassPieces(p, dojo, content, info(classes(9), { classesInRank: 40, classesTotal: 143 }));
    expect(got).toEqual(['decor-a6-class-scroll-bow']);
    expect(p.decorEarning.classesCounted).toBe(143);
    // An old save with no classesTotal starts from classesInRank.
    const old = loadProfile({ ...newProfile(), decorEarning: undefined });
    syncClassPieces(old, newDojo(content.dojo, 1), content, info(classes(3), { classesInRank: 12 }));
    expect(old.decorEarning.classesCounted).toBe(12);
    // Syncing again with nothing new gives nothing.
    expect(syncClassPieces(p, dojo, content, info(classes(9), { classesInRank: 40, classesTotal: 143 }))).toEqual([]);
  });

  it('one piece every 2 new classes at White belt, every 3 after; it remembers the belt', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    syncClassPieces(p, dojo, content, info([]));
    expect(syncClassPieces(p, dojo, content, info(classes(1)))).toEqual([]);
    expect(syncClassPieces(p, dojo, content, info(classes(2)))).toEqual(['decor-a6-class-scroll-form1']);
    expect(owned(dojo, 'decor-a6-class-scroll-form1')[0].belt).toEqual(WHITE);
    // Yellow belt: 3 classes per piece.
    expect(syncClassPieces(p, dojo, content, info(classes(4), { belt: YELLOW }))).toEqual([]);
    expect(syncClassPieces(p, dojo, content, info(classes(5), { belt: YELLOW }))).toEqual(['decor-a6-class-scroll-form2']);
    expect(owned(dojo, 'decor-a6-class-scroll-form2')[0].belt).toEqual(YELLOW);
    expect(p.decorEarning.classesCounted).toBe(5);
  });

  it('no streaks or deadlines: a gap loses nothing, old check-ins leaving the window take nothing away', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    syncClassPieces(p, dojo, content, info([]));
    syncClassPieces(p, dojo, content, info(classes(1, 1)));
    // Weeks later, the first class has left the feed's window and one new class arrives.
    expect(syncClassPieces(p, dojo, content, info(classes(1, 20)))).toEqual(['decor-a6-class-scroll-form1']);
    // A smaller classesTotal never lowers the count.
    syncClassPieces(p, dojo, content, info(classes(1, 20), { classesTotal: 0 }));
    expect(p.decorEarning.classesCounted).toBe(2);
    expect(dojo.items.filter((i) => i.id.startsWith('decor-a6-class')).length).toBe(2);
  });

  it('counts one class per date', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    syncClassPieces(p, dojo, content, info([]));
    expect(syncClassPieces(p, dojo, content, info(['2026-10-05T09:00:00', '2026-10-05T18:00:00']))).toEqual([]);
    expect(p.decorEarning.classesCounted).toBe(1);
  });

  it('stops after the last piece', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    syncClassPieces(p, dojo, content, info([]));
    syncClassPieces(p, dojo, content, info(classes(28)));
    syncClassPieces(p, dojo, content, info(classes(30)));
    const n = classPieceOrder(content).length;
    expect(p.decorEarning.classPiecesGiven).toBe(n);
    expect(new Set(dojo.items.filter((i) => i.id.startsWith('decor-a6-class') || classPieceOrder(content).some((d) => d.id === i.id)).map((i) => i.id)).size).toBe(n);
  });
});

describe('Journal trophies, keeper statues and the folding screen', () => {
  it('a trophy for each monster kind on its first defeat, even on a loss, only once', () => {
    const p = newProfile();
    expect(oneTimeRunPieces(p, content, summary({ result: 'lost', defeated: ['swarmer'] }))).toEqual(['decor-a6-journal-trophy-swarmer']);
    expect(oneTimeRunPieces(p, content, summary({ defeated: ['swarmer', 'bopper'] }))).toEqual(['decor-a6-journal-trophy-bopper']);
  });

  it('every trophy points at a real monster (Bopper is bopper, the keeper is floor-keeper)', () => {
    for (const d of content.dojo.decorations.filter((x) => x.source === 'trophy')) expect(content.enemies[d.monster!]).toBeDefined();
  });

  it('keeper statue N the first time the Floor Keeper is beaten at belt tier N', () => {
    const p = newProfile();
    const got = oneTimeRunPieces(p, content, summary({ tier: 2, defeated: ['floor-keeper'] }));
    expect(got).toContain('decor-a6-keeper-statue-floor2');
    expect(got).toContain('decor-a6-journal-trophy-keeper');
    expect(got).not.toContain('decor-a6-keeper-statue-floor1');
    expect(oneTimeRunPieces(p, content, summary({ tier: 2, defeated: ['floor-keeper'] }))).toEqual([]);
    expect(oneTimeRunPieces(p, content, summary({ tier: 1, defeated: ['floor-keeper'] }))).toEqual(['decor-a6-keeper-statue-floor1']);
    // Tiers with no statue give nothing extra.
    expect(oneTimeRunPieces(p, content, summary({ tier: 7, defeated: ['floor-keeper'] }))).toEqual([]);
  });

  it('the folding screen comes once every Tier 1 Journal trophy is in (Bopper is Tier 2)', () => {
    const p = newProfile();
    const all = oneTimeRunPieces(p, content, summary({ defeated: ['swarmer', 'shield', 'brute'] }));
    expect(all).not.toContain('decor-a6-folding-screen');
    expect(oneTimeRunPieces(p, content, summary({ tier: 1, defeated: ['floor-keeper'] }))).toContain('decor-a6-folding-screen');
    expect(oneTimeRunPieces(p, content, summary({ defeated: ['bopper'] }))).toEqual(['decor-a6-journal-trophy-bopper']);
  });

  it('test-link runs give nothing at all', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    const before = dojo.items.length;
    const s = summary({ test: true, defeated: ['swarmer', 'floor-keeper'], decorations: ['stone-lantern'], decorationColours: [null] });
    expect(bankRunDecorations(p, dojo, content, s, WHITE)).toEqual([]);
    expect(dojo.items.length).toBe(before);
    expect(p.decorEarning.given).toEqual([]);
    expect(oneTimeRunPieces(p, content, s)).toEqual([]);
    expect(p.decorEarning.given).toEqual([]);
  });

  it('banking a run adds its surprise pieces with their colour and belt, then the one-time pieces', () => {
    const p = newProfile();
    const dojo = newDojo(content.dojo, 1);
    const s = summary({ tier: 2, defeated: ['swarmer'], decorations: ['decor-a6-cushion', 'stone-lantern'], decorationColours: [2, null] });
    expect(bankRunDecorations(p, dojo, content, s, YELLOW)).toEqual(['decor-a6-journal-trophy-swarmer']);
    expect(owned(dojo, 'decor-a6-cushion')[0]).toMatchObject({ colour: 2, belt: YELLOW });
    expect(owned(dojo, 'decor-a6-journal-trophy-swarmer')[0].belt).toEqual(YELLOW);
  });
});

describe('surprise pieces from chests and elites (S7)', () => {
  it('uses the S7 rates', () => {
    expect(content.dojo.dropChance).toEqual({ boss: 0.05, treasure: 0.04, challenge: 0.03 });
    expect(content.elites.reward.decorationChance).toBe(0.15);
  });

  const sure: Content = { ...content, dojo: { ...content.dojo, dropChance: { boss: 1, treasure: 1, challenge: 1 } } };
  function openChest(seed: number, owned: Record<string, number>, test = false) {
    const run = startRun(sure, { seed, dryRuns: 0, firstRoomId: 'keepers-hall', ownedDecorations: owned });
    run.test = test;
    const world = createRunWorld(sure, run, { maxHealth: 100, power: 10, guard: 0 });
    world.progress.cleared = true;
    world.events = [{ kind: 'chestOpened' } as never];
    updateRun(sure, run, world);
    return run;
  }
  const pool = content.dojo.decorations.filter((d) => d.source === 'tower' || d.source === 'random').map((d) => d.id);

  it('the pool is the random pieces plus the old tower pieces, new pieces before repeats', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) seen.add(openChest(seed, {}).decorations[0]);
    expect([...seen].sort()).toEqual([...pool].sort());
    const allButOne = Object.fromEntries(pool.slice(1).map((id) => [id, 1]));
    for (let seed = 1; seed <= 20; seed++) expect(openChest(seed, allButOne).decorations).toEqual([pool[0]]);
  });

  it('at most 3 of each; then the chest quietly holds nothing extra', () => {
    const almostFull = Object.fromEntries(pool.map((id, i) => [id, i === 0 ? DECOR_MAX_COPIES - 1 : DECOR_MAX_COPIES]));
    expect(openChest(5, almostFull).decorations).toEqual([pool[0]]);
    const full = Object.fromEntries(pool.map((id) => [id, DECOR_MAX_COPIES]));
    expect(openChest(5, full).decorations).toEqual([]);
  });

  it('random pieces roll colour 1 or 2 about half and half; tower pieces have no roll', () => {
    let twos = 0;
    let randoms = 0;
    for (let seed = 1; seed <= 600; seed++) {
      const run = openChest(seed, {});
      const def = content.dojo.decorations.find((d) => d.id === run.decorations[0])!;
      const c = run.decorationColours[0];
      if (def.source === 'random') {
        randoms++;
        expect([1, 2]).toContain(c);
        if (c === 2) twos++;
      } else expect(c).toBeNull();
    }
    expect(twos / randoms).toBeGreaterThan(0.4);
    expect(twos / randoms).toBeLessThan(0.6);
  });

  it('test-link runs find no decorations', () => {
    for (let seed = 1; seed <= 20; seed++) expect(openChest(seed, {}, true).decorations).toEqual([]);
  });

  it('remembers each monster kind beaten in the run', () => {
    const run = startRun(content, { seed: 3, dryRuns: 0 });
    const kill = (kind: string) =>
      updateRun(content, run, {
        events: [{ kind: 'playerAttack', playerId: 'p1', enemyId: 'e1', move: 'basic', damage: 5, defeated: true }],
        players: { p1: { health: 100, pos: { x: 1, y: 1 } } },
        progress: { bestCombo: 0 },
        enemies: [{ id: 'e1', def: content.enemies[kind], pos: { x: 2, y: 2 }, elite: null }],
      } as unknown as WorldState);
    kill('swarmer');
    kill('swarmer');
    kill('brute');
    expect(summarizeRun(run).defeated).toEqual(['swarmer', 'brute']);
  });

  it('a run saved before decor earning still loads', () => {
    const run = startRun(content, { seed: 11, dryRuns: 0 }) as unknown as Record<string, unknown>;
    run.decorations = ['stone-lantern'];
    delete run.decorationColours;
    delete run.defeated;
    const back = restoreRun(content, run)!;
    expect(back.decorationColours).toEqual([null]);
    expect(back.defeated).toEqual([]);
  });
});

describe('the feed\'s classesTotal', () => {
  it('is read when sent and null when an older feed leaves it out', () => {
    expect(loadFeed(yellowFeed).attendance.classesTotal).toBe(61);
    expect(loadFeed(whiteFeed).attendance.classesTotal).toBeNull();
  });
});
