// Tool Belt stage 1, Task 5: pockets, earned tools, Sensei's Pick and old saves with Seals.
import { describe, expect, it } from 'vitest';
import { buildTraining, characterSetup, earnedPicks, earnedTools, emptyLoadout, equipTool, loadFeed, newProfile, rewardMoments, seedToolBelt, senseiPick, snapshot, toolPockets, type TrainingState } from '../src';
import { testContent } from './load-content';
import whiteNew from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import green from '../../../fixtures/4-green-belt.json';

const content = testContent();
const training = (data: unknown): TrainingState => {
  const feed = loadFeed(data);
  return buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
};
const katasSigned = (t: TrainingState) => t.abilities.filter((a) => a.requirement.type === 'kata' && a.unlocked).length;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

describe('pockets and earned tools', () => {
  it('a new white belt has 3 pockets', () => {
    expect(toolPockets(training(whiteNew))).toBe(3);
  });

  it('each signed-off kata adds a pocket', () => {
    const t = training(green);
    expect(katasSigned(t)).toBeGreaterThan(0);
    expect(toolPockets(t)).toBe(3 + katasSigned(t));
  });

  it('never more than 10 pockets', () => {
    const many = { abilities: Array.from({ length: 12 }, () => ({ unlocked: true, requirement: { type: 'kata' } })) } as unknown as TrainingState;
    expect(toolPockets(many)).toBe(10);
  });

  it('earned tools are the signed-off techniques that have a tool, oldest first', () => {
    expect(earnedTools(training(white3), content.abilities.tools)).toEqual([1, 3]);
    expect(earnedTools(training(green), content.abilities.tools)).toEqual(range(1, 15));
  });

  it('earnedPicks lists the tools', () => {
    expect(earnedPicks(training(white3), content.abilities).tools).toEqual([1, 3]);
  });
});

describe('equipTool', () => {
  it('fills a free pocket, refuses what is not earned, repeated, or past the pockets', () => {
    const l = emptyLoadout();
    const a = equipTool(l, 3, [1, 3, 5], 2);
    expect(a.result).toBe('ok');
    expect(a.loadout.tools).toEqual([3]);
    expect(equipTool(a.loadout, 3, [1, 3, 5], 2).result).toBe('already');
    expect(equipTool(a.loadout, 9, [1, 3, 5], 2).result).toBe('notEarned');
    const b = equipTool(a.loadout, 1, [1, 3, 5], 2).loadout;
    const c = equipTool(b, 5, [1, 3, 5], 2);
    expect(c.result).toBe('full');
    expect(c.loadout).toBe(b);
  });
});

describe('old saves with Seals', () => {
  it('converts the equipped Seal families to their tools first, then the newest, up to the pockets, once', () => {
    const t = training(green);
    const p = newProfile();
    p.toolBeltSeeded = false;
    p.loadout = { ...emptyLoadout(), seals: ['counter', 'escape'] };
    const earned = earnedTools(t, content.abilities.tools);
    expect(seedToolBelt(p, earned, 7, content.abilities.families)).toBe(true);
    // Counter family: #3, 5, 6, 7, 10; Escape: #1, 2, 15.
    expect(p.loadout!.tools).toEqual([3, 5, 6, 7, 10, 1, 2]);
    expect(p.toolBeltSeeded).toBe(true);
    const before = JSON.stringify(p);
    expect(seedToolBelt(p, earned, 7, content.abilities.families)).toBe(false);
    expect(JSON.stringify(p)).toBe(before);
  });

  it('a save with no Seals gets its newest tools, and every earned tool counts as known', () => {
    const p = newProfile();
    p.toolBeltSeeded = false;
    p.picksKnown = ['counter'];
    seedToolBelt(p, range(1, 15), 3, content.abilities.families);
    expect(p.loadout!.tools).toEqual([13, 14, 15]);
    expect(p.picksKnown).toEqual(expect.arrayContaining(range(1, 15).map((n) => `tool-${n}`)));
  });
});

describe("Sensei's Pick with tools", () => {
  const earned = (tools: number[]) => ({ strikes: [], families: [], kataPowers: [], tools });

  it('more tools than pockets: the newest fill the pockets and the rest are ready', () => {
    const p = newProfile();
    p.picksKnown = [];
    const lines = senseiPick(p, earned(range(1, 15)), 1, 3);
    expect(p.loadout!.tools).toEqual([13, 14, 15]);
    expect(lines.filter((l) => l.slot === 'tool' && l.kind === 'ready')).toHaveLength(12);
    expect(lines.filter((l) => l.slot === 'tool' && l.kind === 'added').map((l) => l.move)).toEqual(['13', '14', '15']);
  });

  it('a new tool with full pockets rests the oldest', () => {
    const p = newProfile();
    p.picksKnown = ['tool-1', 'tool-2', 'tool-3'];
    p.loadout = { ...emptyLoadout(), tools: [1, 2, 3] };
    const lines = senseiPick(p, earned([1, 2, 3, 4]), 1, 3);
    expect(p.loadout!.tools).toEqual([2, 3, 4]);
    expect(lines).toEqual([{ kind: 'swapped', slot: 'tool', move: '4', out: '1' }]);
  });

  it("with Sensei's Pick off a new tool is only ready", () => {
    const p = newProfile();
    p.senseiPick = false;
    p.picksKnown = ['tool-1'];
    p.loadout = { ...emptyLoadout(), tools: [1] };
    const lines = senseiPick(p, earned([1, 2]), 1, 3);
    expect(p.loadout!.tools).toEqual([1]);
    expect(lines).toEqual([{ kind: 'ready', slot: 'tool', move: '2' }]);
  });
});

describe('characterSetup', () => {
  it('brings the tools in the pockets and no Seal effects', () => {
    const p = newProfile();
    p.loadout = { ...emptyLoadout(), seals: ['counter'], tools: [7, 3] };
    const setup = characterSetup(p, training(green), content.abilities);
    expect(setup.tools!.map((t) => t.technique)).toEqual([7, 3]);
    expect(setup.effects).toEqual([]);
  });

  it('drops tools that are not earned or past the pockets', () => {
    const p = newProfile();
    p.loadout = { ...emptyLoadout(), tools: [3, 9, 1, 1] };
    const setup = characterSetup(p, training(white3), content.abilities);
    expect(setup.tools!.map((t) => t.technique)).toEqual([3, 1]);
  });
});

describe('the New tool card', () => {
  it('follows the sign-off of a technique with a tool, once, and replaces the Seal evolution card', () => {
    const t = training(green);
    const prev = snapshot(t);
    const reqId = t.abilities.filter((a) => a.kind === 'seal')[6].requirement.id; // technique #7
    const before = { ...prev, signed: prev.signed.filter((id) => id !== reqId) };
    const m = rewardMoments(before, t, undefined, null, content.abilities.families, content.abilities.tools);
    const kinds = m.map((x) => x.kind);
    expect(kinds.filter((k) => k === 'newTool')).toHaveLength(1);
    expect(kinds).not.toContain('evolved');
    expect(kinds.indexOf('newTool')).toBeGreaterThan(kinds.findIndex((k) => k === 'signOff' || k === 'signOffs'));
    const card = m.find((x) => x.kind === 'newTool');
    expect(card?.kind === 'newTool' && card.technique).toBe(7);
    expect(rewardMoments(prev, t, undefined, null, content.abilities.families, content.abilities.tools)).toEqual([]);
  });

  it('the first look home lists no Seal stages once tools exist', () => {
    const m = rewardMoments(null, training(green), undefined, null, content.abilities.families, content.abilities.tools);
    const w = m[0];
    if (w.kind !== 'welcome') throw new Error('expected the welcome card');
    expect(w.evolutions).toEqual([]);
  });
});

describe("Sensei's Pick fills empty pockets", () => {
  it('a student with tools and nothing in the pockets brings the newest tools, up to the pockets', () => {
    const t = training(green);
    const setup = characterSetup(newProfile(), t, content.abilities);
    const pockets = toolPockets(t);
    expect(setup.tools!.map((x) => x.technique)).toEqual(range(16 - pockets, 15));
  });

  it("with Sensei's Pick off, empty pockets stay empty", () => {
    const p = { ...newProfile(), senseiPick: false };
    expect(characterSetup(p, training(green), content.abilities).tools).toEqual([]);
  });
});
