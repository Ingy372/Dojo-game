import { describe, expect, it } from 'vitest';
import { litGateLock, signOffCardText, signOffsTitle } from '../src';

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

describe('"Gate lock lit." only when a Gate lock lit', () => {
  const t = { gate: { locks: [{ id: 'cur-1' }, { id: 'cur-2' }] } } as never;
  it('a real sign-off of a current-rank lock lit it', () => {
    expect(litGateLock(t, { id: 'cur-1', legacy: false })).toBe(true);
  });
  it('a counted technique or a catch-up item lit nothing', () => {
    expect(litGateLock(t, { id: 'old-1', legacy: true })).toBe(false);
    expect(litGateLock(t, { id: 'catch-1', legacy: false })).toBe(false);
  });
  it('the card shows the line only behind the check', () => {
    expect(src).toMatch(/if \(litGateLock\(this\.training, r\)\) this\.text\([^;]*'Gate lock lit\.'/);
  });
});
