import { describe, expect, it } from 'vitest';
import { kataArrows, parseKata } from '../src/katas';
import fixture from '../../../fixtures/1-white-belt-new.json';

const files = import.meta.glob('../../../content/katas/*.json', { eager: true, import: 'default' });
const katas = Object.values(files).map((raw) => parseKata(raw));
const byReq = new Map(katas.map((k) => [k.requirement, k]));

describe('kata cards (S3-P1)', () => {
  it('every kata file parses and names a real kata requirement', () => {
    const kataReqs = new Map(fixture.school.belts.flatMap((b) => b.requirements).filter((r) => r.type === 'kata').map((r) => [r.id, r.name]));
    expect(katas.length).toBeGreaterThanOrEqual(4);
    for (const k of katas) expect(kataReqs.get(k.requirement)).toBe(k.name);
  });

  it('R-STANCE-d2: katas unlock no stance for the beta (stances come from their own teacher sign-offs)', () => {
    expect(byReq.get('white-kata')?.stance).toBeNull();
    expect(byReq.get('yellow-kata')?.stance).toBeNull();
    for (const k of katas) expect(k.stance).toBeNull();
  });

  it('shows an arrow only on steps whose direction is known', () => {
    const bf1 = byReq.get('white-kata')!;
    expect(bf1.steps).toHaveLength(8);
    expect(kataArrows(bf1)).toBe('1 ←   2 →   3 →   4 ←   5 →   6 →   7 ←   8 →');
    const open = parseKata({ id: 'x', name: 'X', requirement: 'r', stance: null, steps: [{ n: 1, facing: ['L'] }, { n: 2, facing: [] }] });
    expect(kataArrows(open)).toBe('1 ←   2');
  });

  it('rejects a malformed file', () => {
    expect(() => parseKata({ id: 'x', name: 'X', requirement: 'r', stance: null, steps: [{ n: 1, facing: ['Up'] }] })).toThrow(/bad facing/);
    expect(() => parseKata({ id: 'x', name: 'X', requirement: 'r', stance: null, steps: [{ n: 2, facing: [] }] })).toThrow(/numbered/);
  });
});
