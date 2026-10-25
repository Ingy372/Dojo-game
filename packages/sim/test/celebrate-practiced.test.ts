import { describe, expect, it } from 'vitest';
import { signOffLines } from '../src';

const src = Object.values(import.meta.glob('../../../apps/client/src/ui/Celebrations.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const real = (name: string) => ({ name, legacy: false });
const counted = (name: string) => ({ name, legacy: true });

describe('Congratulations card: "practiced" for counted techniques', () => {
  it('real sign-offs keep "signed off"', () => {
    expect(signOffLines([real('Front Kick')])).toEqual(['✓ Front Kick signed off']);
    expect(signOffLines([real('A'), real('B')])).toEqual(['✓ 2 techniques signed off']);
  });
  it('counted (legacy) techniques say "practiced"', () => {
    expect(signOffLines([counted('Low Block')])).toEqual(['✓ Low Block practiced']);
    expect(signOffLines([counted('A'), counted('B'), counted('C')])).toEqual(['✓ 3 techniques practiced']);
  });
  it('a mix shows both lines, real first', () => {
    expect(signOffLines([counted('A'), real('B'), counted('C')])).toEqual(['✓ B signed off', '✓ 2 techniques practiced']);
    expect(signOffLines([])).toEqual([]);
  });
  it('the card uses signOffLines', () => {
    expect(src).toMatch(/for \(const line of signOffLines\(signed\)\) earned\.push/);
    expect(src).not.toMatch(/earned\.push\(\{ line: `✓ \$\{e\.(requirement\.name|list\.length)[^`]*signed off`/);
  });
});
