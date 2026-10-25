// P-MENU-d (Manager call): the mixed many-techniques card marks which rows were really signed off.
import { describe, expect, it } from 'vitest';
import { signOffsMixed, signOffsRow } from '../src/rewards';

const real = { name: 'Basic Form 1', legacy: false };
const counted = { name: 'Kick 1', legacy: true };

describe('mixed sign-off card rows', () => {
  it('only a card with both kinds is mixed', () => {
    expect(signOffsMixed([real, counted])).toBe(true);
    expect(signOffsMixed([real, real])).toBe(false);
    expect(signOffsMixed([counted, counted])).toBe(false);
  });
  it('on a mixed card, real rows keep ✓ and counted rows say practiced', () => {
    expect(signOffsRow(real, 'Power', true)).toEqual({ text: '✓ Basic Form 1: Power', real: true });
    expect(signOffsRow(counted, 'Guard', true)).toEqual({ text: '○ Kick 1: Guard (practiced)', real: false });
  });
  it('a card of one kind keeps the plain ✓ rows', () => {
    expect(signOffsRow(counted, 'Guard', false).text).toBe('✓ Kick 1: Guard');
    expect(signOffsRow(real, 'Power', false).text).toBe('✓ Basic Form 1: Power');
  });
});
