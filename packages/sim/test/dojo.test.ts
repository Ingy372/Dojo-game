import { describe, expect, it } from 'vitest';
import {
  BOW,
  COMBAT,
  DOJO,
  addDecorations,
  ageDojo,
  bowIn,
  canPlace,
  choreInReach,
  choresLeft,
  cleanAll,
  createRunWorld,
  dojoRoom,
  findSpot,
  hoursForMess,
  isDojoClean,
  loadDojo,
  messLevel,
  newDojo,
  placeItem,
  returnToDojo,
  startRun,
  storeItem,
  straightenRack,
  sweepAt,
  updateRun,
  useCalmMind,
  wipeMat,
  type DojoState,
} from '../src';
import { testContent } from './load-content';

const content = testContent();
const dc = content.dojo;
const HOUR = 3_600_000;

/** Sweeps every spot and does every chore; returns whether Calm Mind was earned on the last one. */
function cleanByHand(dojo: DojoState): boolean {
  let calm = false;
  for (const s of [...dojo.spots]) calm = sweepAt(dojo, { x: s.col + 0.5 + s.dx, y: s.row + 0.5 + s.dy }).calmMind || calm;
  for (const it of dojo.items) {
    while (it.scuffed) calm = wipeMat(dojo, it.uid).calmMind || calm;
    while (it.crooked > 0) calm = straightenRack(dojo, it.uid).calmMind || calm;
  }
  return calm;
}

describe('Home Dojo content', () => {
  it('loads about ten decorations, with the three starter gifts placed', () => {
    expect(dc.decorations.length).toBeGreaterThanOrEqual(10);
    const dojo = newDojo(dc, 7);
    expect(dojo.items.map((i) => i.id).sort()).toEqual(['dojo-banner', 'training-mat', 'weapon-rack']);
    expect(dojo.items.every((i) => i.col !== null)).toBe(true);
    expect(isDojoClean(dojo)).toBe(true);
  });
});

describe('mess over time', () => {
  it('nothing for the first hours, then fast at first and slower later, full at a week', () => {
    expect(messLevel(3)).toBe(0);
    expect(messLevel(24)).toBeGreaterThan(0.15);
    expect(messLevel(24)).toBeLessThan(0.35);
    expect(messLevel(168)).toBe(1);
    expect(messLevel(24 * 30)).toBe(1);
    // Earlier days add more than later days.
    expect(messLevel(48) - messLevel(24)).toBeGreaterThan(messLevel(168) - messLevel(144));
    expect(hoursForMess(messLevel(60))).toBeCloseTo(60, 5);
  });

  it('stops at the limit and never removes anything', () => {
    const dojo = newDojo(dc, 3);
    const before = JSON.stringify(dojo.items.map((i) => [i.uid, i.id, i.col, i.row]));
    ageDojo(dojo, dc, 24 * 7);
    const full = choresLeft(dojo);
    expect(dojo.spots.length).toBe(DOJO.maxFloorSpots);
    ageDojo(dojo, dc, 24 * 60);
    expect(choresLeft(dojo)).toBe(full);
    expect(JSON.stringify(dojo.items.map((i) => [i.uid, i.id, i.col, i.row]))).toBe(before);
  });

  it('builds from the time since the last visit', () => {
    const dojo = newDojo(dc, 3);
    expect(returnToDojo(dojo, dc, 1000 * HOUR)).toBe(0);
    expect(dojo.spots.length).toBe(0);
    expect(returnToDojo(dojo, dc, 1002 * HOUR)).toBeCloseTo(2, 5);
    expect(dojo.spots.length).toBe(0);
    returnToDojo(dojo, dc, 1026 * HOUR);
    expect(dojo.spots.length).toBeGreaterThan(0);
    expect(dojo.spots.length).toBeLessThan(DOJO.maxFloorSpots / 2);
  });

  it('planned absences pause the mess', () => {
    const dojo = newDojo(dc, 3);
    returnToDojo(dojo, dc, 0);
    returnToDojo(dojo, dc, 24 * 7 * HOUR, 24 * 7);
    expect(choresLeft(dojo)).toBe(0);
  });

  it('mess never lands under a decoration', () => {
    const dojo = newDojo(dc, 11);
    ageDojo(dojo, dc, 168);
    const room = dojoRoom(dojo, dc);
    for (const s of dojo.spots) expect(room.walls[s.row][s.col]).toBe(false);
    const mat = dojo.items.find((i) => i.id === 'training-mat')!;
    for (const s of dojo.spots) {
      const onMat = s.col >= mat.col! && s.col < mat.col! + 2 && s.row >= mat.row! && s.row < mat.row! + 2;
      expect(onMat).toBe(false);
    }
  });

  it('the same seed always makes the same mess', () => {
    const a = newDojo(dc, 99);
    const b = newDojo(dc, 99);
    ageDojo(a, dc, 100);
    ageDojo(b, dc, 100);
    expect(a.spots).toEqual(b.spots);
  });
});

describe('cleaning and Calm Mind', () => {
  it('sweep, wipe and straighten clean everything and earn Calm Mind once', () => {
    const dojo = newDojo(dc, 5);
    ageDojo(dojo, dc, 168);
    expect(dojo.items.find((i) => i.id === 'training-mat')!.scuffed).toBe(true);
    expect(dojo.items.find((i) => i.id === 'weapon-rack')!.crooked).toBe(DOJO.rackCrookedAt.length);
    expect(cleanByHand(dojo)).toBe(true);
    expect(isDojoClean(dojo)).toBe(true);
    expect(dojo.calmMindRuns).toBe(DOJO.calmMind.runs);
    expect(dojo.messHours).toBe(0);
    // Nothing to clean: no new Calm Mind.
    expect(cleanAll(dojo)).toBe(false);
  });

  it('a mat takes several wipe taps', () => {
    const dojo = newDojo(dc, 5);
    ageDojo(dojo, dc, 168);
    const mat = dojo.items.find((i) => i.id === 'training-mat')!;
    for (let i = 1; i < DOJO.wipeTaps; i++) expect(wipeMat(dojo, mat.uid).done).toBe(false);
    expect(wipeMat(dojo, mat.uid).done).toBe(true);
    expect(mat.scuffed).toBe(false);
  });

  it('chores are found within reach of the character', () => {
    const dojo = newDojo(dc, 5);
    ageDojo(dojo, dc, 168);
    const mat = dojo.items.find((i) => i.id === 'training-mat')!;
    expect(choreInReach(dojo, dc, { x: mat.col! + 1, y: mat.row! + 1 })?.kind).toBe('wipe');
    const rack = dojo.items.find((i) => i.id === 'weapon-rack')!;
    expect(choreInReach(dojo, dc, { x: rack.col! + 1, y: rack.row! + 1.5 })?.kind).toBe('straighten');
    expect(choreInReach(dojo, dc, { x: 12.5, y: 7.5 })).toBeNull();
  });

  it('a partial clean turns the mess clock back, and Calm Mind lasts 3 runs without stacking', () => {
    const dojo = newDojo(dc, 5);
    ageDojo(dojo, dc, 168);
    const half = dojo.spots.slice(0, 8);
    for (const s of half) sweepAt(dojo, { x: s.col + 0.5 + s.dx, y: s.row + 0.5 + s.dy });
    expect(dojo.messHours).toBeLessThan(168);
    cleanByHand(dojo);
    ageDojo(dojo, dc, 30);
    cleanByHand(dojo);
    expect(dojo.calmMindRuns).toBe(DOJO.calmMind.runs);
    expect([useCalmMind(dojo), useCalmMind(dojo), useCalmMind(dojo), useCalmMind(dojo)]).toEqual([true, true, true, false]);
  });

  it('Calm Mind makes Focus build faster in the Tower', () => {
    const calm = startRun(content, { seed: 4, dryRuns: 0, calmMind: true });
    const plain = startRun(content, { seed: 4, dryRuns: 0 });
    const base = { maxHealth: 100, power: 10, guard: 0 };
    expect(createRunWorld(content, calm, base).players.p1.mods.focusGain).toBeCloseTo(DOJO.calmMind.focusGain);
    expect(createRunWorld(content, plain, base).players.p1.mods.focusGain).toBe(0);
  });
});

describe('decorating', () => {
  it('moves, stores and finds a spot for decorations', () => {
    const dojo = newDojo(dc, 1);
    addDecorations(dojo, ['stone-lantern', 'calligraphy-scroll']);
    const lantern = dojo.items.find((i) => i.id === 'stone-lantern')!;
    const spot = findSpot(dojo, dc, lantern.uid)!;
    expect(placeItem(dojo, dc, lantern.uid, spot.col, spot.row)).toBe(true);
    expect(placeItem(dojo, dc, lantern.uid, 12, 7)).toBe(true);
    // Not on walls, not on another decoration.
    expect(canPlace(dojo, dc, lantern.uid, 0, 3)).toBe(false);
    const mat = dojo.items.find((i) => i.id === 'training-mat')!;
    expect(canPlace(dojo, dc, lantern.uid, mat.col!, mat.row!)).toBe(false);
    storeItem(dojo, lantern.uid);
    expect(lantern.col).toBeNull();
    // Wall decorations go on the top wall, never on the notice board.
    const scroll = dojo.items.find((i) => i.id === 'calligraphy-scroll')!;
    expect(canPlace(dojo, dc, scroll.uid, 3, 0)).toBe(true);
    expect(canPlace(dojo, dc, scroll.uid, dc.board.col, 0)).toBe(false);
    expect(canPlace(dojo, dc, scroll.uid, 3, 3)).toBe(false);
  });

  it('solid decorations can never block the doorway or wall off part of the room', () => {
    const dojo = newDojo(dc, 1);
    const ids = addDecorations(dojo, ['stone-lantern', 'stone-lantern', 'stone-lantern']);
    const start = { col: Math.floor(dc.room.playerStart.x), row: Math.floor(dc.room.playerStart.y) };
    expect(canPlace(dojo, dc, ids[0].uid, start.col, start.row)).toBe(false);
    // Boxing in the corner (13, 1)... placing lanterns at (12,1) and (13,2) would seal it.
    expect(placeItem(dojo, dc, ids[0].uid, 12, 1)).toBe(true);
    expect(canPlace(dojo, dc, ids[1].uid, 13, 2)).toBe(false);
  });

  it('dust under a moved decoration moves out from under it', () => {
    const dojo = newDojo(dc, 2);
    ageDojo(dojo, dc, 168);
    const [bench] = addDecorations(dojo, ['wooden-bench']);
    const found = dojo.spots.find((sp) => sp.col < 13 && dc.room.walls[sp.row][sp.col + 1] === false && canPlace(dojo, dc, bench.uid, sp.col, sp.row))!;
    const s = { col: found.col, row: found.row };
    const count = dojo.spots.length;
    placeItem(dojo, dc, bench.uid, s.col, s.row);
    expect(dojo.spots.length).toBe(count);
    expect(dojo.spots.some((sp) => (sp.col === s.col || sp.col === s.col + 1) && sp.row === s.row)).toBe(false);
  });

  it('a saved dojo loads back the same', () => {
    const dojo = newDojo(dc, 8);
    ageDojo(dojo, dc, 50);
    const copy = loadDojo(JSON.parse(JSON.stringify(dojo)), dc)!;
    expect(copy).toEqual(dojo);
    expect(loadDojo({ nonsense: true }, dc)).toBeNull();
  });
});

describe('Tower decorations and the bow', () => {
  it('the boss chest always holds a decoration, new kinds first', () => {
    const run = startRun(content, { seed: 12, dryRuns: 0, firstRoomId: 'keepers-hall', ownedDecorations: { 'stone-lantern': 1 } });
    const world = createRunWorld(content, run, { maxHealth: 100, power: 10, guard: 0 });
    world.progress.cleared = true;
    world.events = [{ kind: 'chestOpened' } as never];
    const events = updateRun(content, run, world);
    expect(events.some((e) => e.kind === 'decoration')).toBe(true);
    expect(run.decorations.length).toBe(1);
    expect(run.decorations[0]).not.toBe('stone-lantern');
  });

  it('bowing in gives a small Focus head start', () => {
    const run = startRun(content, { seed: 1, dryRuns: 0 });
    const world = createRunWorld(content, run, { maxHealth: 100, power: 10, guard: 0 });
    const before = world.players.p1.focus;
    bowIn(world, 'p1');
    expect(world.players.p1.focus).toBe(Math.min(COMBAT.focus.max, before + BOW.focus));
  });
});
