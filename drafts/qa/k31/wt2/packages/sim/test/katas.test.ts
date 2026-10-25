import { describe, expect, it } from 'vitest';
import { kataArrows, parseKata } from '../src/katas';
import abilities from '../../../content/abilities/abilities.json';
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

  it('Basic Form 1 links to Rooted Form and Basic Form 2 to Flowing Form, matching abilities.json', () => {
    expect(byReq.get('white-kata')?.form).toBe('rooted-form');
    expect(byReq.get('yellow-kata')?.form).toBe('flowing-form');
    // abilities.json: the 1st belt's kata unlocks forms[1], the 2nd forms[2].
    expect(abilities.forms[1].id).toBe('rooted-form');
    expect(abilities.forms[2].id).toBe('flowing-form');
    for (const k of katas) if (k.form) expect(abilities.forms.map((f) => f.id)).toContain(k.form);
  });

  it('shows an arrow only on steps whose direction is known', () => {
    const bf1 = byReq.get('white-kata')!;
    expect(bf1.steps).toHaveLength(8);
    expect(kataArrows(bf1)).toBe('1 ←   2 →   3 →   4 ←   5 →   6 →   7 ←   8 →');
    const open = parseKata({ id: 'x', name: 'X', requirement: 'r', form: null, steps: [{ n: 1, facing: ['L'] }, { n: 2, facing: [] }] });
    expect(kataArrows(open)).toBe('1 ←   2');
  });

  it('rejects a malformed file', () => {
    expect(() => parseKata({ id: 'x', name: 'X', requirement: 'r', form: null, steps: [{ n: 1, facing: ['Up'] }] })).toThrow(/bad facing/);
    expect(() => parseKata({ id: 'x', name: 'X', requirement: 'r', form: null, steps: [{ n: 2, facing: [] }] })).toThrow(/numbered/);
  });
});
