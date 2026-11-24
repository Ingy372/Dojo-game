// Tool Belt stage 1, Task 3: the tool and kata move data files, the areaHit effect and combineMods.
import { describe, expect, it } from 'vitest';
import { AbilityError, combineMods, loadKataSignatures, loadTools, modsFrom, noMods, TOOL_BELT } from '../src';
import tools from '../../../content/abilities/tools.json';
import kataSignatures from '../../../content/abilities/kata-signatures.json';

const katas = import.meta.glob('../../../content/katas/*.json', { eager: true, import: 'default' }) as Record<string, { id: string; requirement: string }>;

const oneTool = (over: Record<string, unknown> = {}) => ({
  tools: [{ technique: 1, name: 'Off the Line', reminder: 'Step off the line.', text: 'Two quick punches.', trigger: 'greatCounter', cooldownTicks: 120, anim: 'counter', effects: [{ type: 'counterHits', amount: 0.6, hits: 2 }], ...over }],
});

describe('tools.json', () => {
  it('loads tools #1 to #15, each once', () => {
    const list = loadTools(tools);
    expect(list.map((t) => t.technique)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  it('refuses an unknown trigger', () => {
    expect(() => loadTools(oneTool({ trigger: 'everyTenSeconds' }))).toThrow(AbilityError);
  });

  it('refuses a technique listed twice', () => {
    const d = oneTool();
    d.tools.push({ ...d.tools[0] });
    expect(() => loadTools(d)).toThrow(/twice/);
  });

  it('refuses a cooldown under one second', () => {
    expect(() => loadTools(oneTool({ cooldownTicks: 19 }))).toThrow(AbilityError);
  });

  it('refuses an effect type the game does not know', () => {
    expect(() => loadTools(oneTool({ effects: [{ type: 'laserEyes', amount: 1 }] }))).toThrow(AbilityError);
  });
});

describe('kata-signatures.json', () => {
  it('loads the three stage 1 moves', () => {
    expect(loadKataSignatures(kataSignatures).map((m) => m.kata)).toEqual(['basic-form-1', 'basic-form-2', 'keon']);
  });

  it('names a real kata and its real requirement for every move', () => {
    const real = Object.values(katas);
    for (const m of loadKataSignatures(kataSignatures)) expect(real.find((k) => k.id === m.kata)?.requirement).toBe(m.requirement);
  });

  it('refuses a move without a radius', () => {
    const d = JSON.parse(JSON.stringify(kataSignatures));
    delete d.moves[0].radius;
    expect(() => loadKataSignatures(d)).toThrow(AbilityError);
  });
});

describe('areaHit and combineMods', () => {
  it('areaHit becomes areaHitStrength and areaHitRadius', () => {
    const m = modsFrom([{ type: 'areaHit', amount: 1.2, radius: 1.5 }], 20);
    expect(m.areaHitStrength).toBe(1.2);
    expect(m.areaHitRadius).toBe(1.5);
  });

  it('combining with no mods changes nothing', () => {
    const m = modsFrom([{ type: 'counterHits', amount: 0.3, hits: 2 }], 20);
    expect(combineMods(noMods(), m)).toEqual(m);
  });

  it('stacks like modsFrom does', () => {
    const a = [{ type: 'counterHits' as const, amount: 0.3, hits: 2 }, { type: 'dashOnBlock' as const, amount: 0 }, { type: 'rippleCounter' as const, amount: 0.6, radius: 1.2 }];
    const b = [{ type: 'counterHits' as const, amount: 0.6, hits: 1 }, { type: 'rippleCounter' as const, amount: 0.2, radius: 1.6 }, { type: 'reflectStaggers' as const, amount: 20 }];
    expect(combineMods(modsFrom(a, 20), modsFrom(b, 20))).toEqual(modsFrom([...a, ...b], 20));
  });

  it('pockets start at 3 and stop at 10', () => {
    expect(TOOL_BELT.startPockets).toBe(3);
    expect(TOOL_BELT.maxPockets).toBe(10);
  });
});
