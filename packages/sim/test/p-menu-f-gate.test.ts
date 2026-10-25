import { describe, expect, it } from 'vitest';
import { loadProfile, newProfile, sealBell } from '../src';
import { GATE, MIN_TAP, TYPE, gateLockR } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const gate = src.slice(src.indexOf('private renderGate('), src.indexOf('private renderGear('));

describe('P-MENU-f Gate sizes', () => {
  it('uses the 3c sizes', () => {
    expect(GATE).toMatchObject({ lockR: 22, lockMinR: 18, label: 12, labelLines: 2, cardH: 96, sealR: 28 });
    expect(GATE.label).toBeGreaterThanOrEqual(TYPE.label);
    expect(GATE.cardH).toBeGreaterThanOrEqual(MIN_TAP);
  });
  it('lock radius is 22, never under 18', () => {
    expect(gateLockR(200)).toBe(22);
    expect(gateLockR(55)).toBeCloseTo(19.8);
    expect(gateLockR(20)).toBe(18);
  });
  it('the Gate draws with the tokens, no endless tweens', () => {
    expect(gate).toMatch(/gateLockR\(slot\)/);
    expect(gate).toMatch(/GATE\.cardH/);
    expect(gate).toMatch(/setMaxLines\(GATE\.labelLines\)/);
    expect(gate).not.toMatch(/repeat:\s*-1|yoyo/);
    expect(gate).toMatch(/if \(!reducedMotion\(\)\)[\s\S]*seal\.setScale/);
  });
});

describe('P-MENU-f Seal bell plays once per Seal', () => {
  it('a new player hears it once, then never again', () => {
    const p = newProfile();
    expect(sealBell(p, 'yellow', false)).toBe(false);
    expect(sealBell(p, 'yellow', true)).toBe(true);
    expect(sealBell(p, 'yellow', true)).toBe(false);
    expect(sealBell(p, 'orange', true)).toBe(true);
    expect(p.sealsSeen).toEqual(['yellow', 'orange']);
  });
});

describe('P-MENU-f save migration', () => {
  const old = () => {
    const p = newProfile() as Partial<ReturnType<typeof newProfile>>;
    delete p.sealsSeen;
    return { ...p, runsPlayed: 12, level: 7, xp: 40 };
  };
  it('an old save loads with sealsSeen null and nothing else lowered', () => {
    const p = loadProfile(JSON.parse(JSON.stringify(old())));
    expect(p.sealsSeen).toBeNull();
    expect(p.runsPlayed).toBe(12);
    expect(p.level).toBe(7);
    expect(p.xp).toBe(40);
  });
  it('an already-lit Seal on an old save counts as seen: no bell', () => {
    const p = loadProfile(old());
    expect(sealBell(p, 'yellow', true)).toBe(false);
    expect(p.sealsSeen).toEqual(['yellow']);
    expect(sealBell(p, 'yellow', true)).toBe(false);
    expect(sealBell(p, 'orange', true)).toBe(true);
  });
  it('an unlit Seal on an old save still rings later', () => {
    const p = loadProfile(old());
    expect(sealBell(p, 'yellow', false)).toBe(false);
    expect(p.sealsSeen).toEqual([]);
    expect(sealBell(p, 'yellow', true)).toBe(true);
  });
  it('a saved list round-trips, drops junk and never shrinks', () => {
    const p = loadProfile({ ...newProfile(), sealsSeen: ['yellow', 3, 'orange'] });
    expect(p.sealsSeen).toEqual(['yellow', 'orange']);
    sealBell(p, 'green', false);
    expect(loadProfile(JSON.parse(JSON.stringify(p))).sealsSeen).toEqual(['yellow', 'orange']);
  });
});
