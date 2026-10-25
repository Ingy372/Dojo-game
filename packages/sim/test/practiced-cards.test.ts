import { describe, expect, it } from 'vitest';
import { signOffCardText, signOffsTitle } from '../src';

const src = Object.values(import.meta.glob('../../../apps/client/src/ui/Celebrations.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const real = (name: string, by: string | null = 'Sensei Kim') => ({ name, legacy: false, signedOffBy: by });
const counted = (name: string) => ({ name, legacy: true, signedOffBy: null });

describe('full-screen sign-off cards: "practiced" for counted techniques', () => {
  it('one real sign-off keeps "SIGNED OFF!" and who signed it', () => {
    expect(signOffCardText(real('Front Kick'))).toEqual({ badge: 'SIGNED OFF!', line: 'Sensei Kim signed off Front Kick!' });
    expect(signOffCardText(real('Front Kick', null)).line).toBe('Sensei signed off Front Kick!');
  });
  it('one counted technique says "PRACTICED!"', () => {
    expect(signOffCardText(counted('Low Block'))).toEqual({ badge: 'PRACTICED!', line: 'You practiced Low Block!' });
  });
  it('the many-techniques title (welcome cascade too) splits real and counted', () => {
    expect(signOffsTitle([real('A'), real('B'), real('C'), real('D')])).toBe('4 techniques signed off!');
    expect(signOffsTitle([counted('A'), counted('B'), counted('C'), counted('D')])).toBe('4 techniques practiced!');
    expect(signOffsTitle([real('A'), counted('B'), counted('C'), counted('D')])).toBe('1 signed off, 3 practiced!');
  });
  it('the cards use the helpers, with no hard-coded "signed off" left', () => {
    expect(src).toMatch(/const words = signOffCardText\(r\);/);
    expect(src).toMatch(/signOffsTitle\(m\.list\.map/);
    expect(src).not.toMatch(/'SIGNED OFF!'|techniques signed off!`/);
  });
});
