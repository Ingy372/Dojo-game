// Q-LOCK-CARD: the locked Challenge card is solid, answers a tap gently (no shake with reduced
// motion), and its line can name the unlock belt from the school's own belt order.
import { describe, expect, it } from 'vitest';
import { CHALLENGE_FROM_TIER } from '../src';
import { LOCK_SHAKE, LOCKED_CARD, lockedLine, lockedTapFeedback } from '../../../apps/client/src/ui/lockCard';
import dojo from '../../../apps/client/src/scenes/DojoScene.ts?raw';

const belts = (names: string[]) => names.map((name) => ({ name }));

describe('Q-LOCK-CARD', () => {
  it('{belt} is the school belt at CHALLENGE_FROM_TIER, so another belt order stays right', () => {
    const a = belts(['White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt']);
    const b = belts(['White Belt', 'Orange Belt', 'Yellow Belt', 'Purple Belt', 'Green Belt']);
    expect(lockedLine('Opens at your {belt}!', a)).toBe(`Opens at your ${a[CHALLENGE_FROM_TIER - 1].name}!`);
    expect(lockedLine('Opens at your {belt}!', b)).toBe(`Opens at your ${b[CHALLENGE_FROM_TIER - 1].name}!`);
    expect(lockedLine('{belt} or {belt}', a)).toBe(`${a[CHALLENGE_FROM_TIER - 1].name} or ${a[CHALLENGE_FROM_TIER - 1].name}`);
  });

  it('text without {belt} is unchanged, and a short belt list still reads sensibly', () => {
    expect(lockedLine('Unlocks at your 4th belt.', belts(['White Belt']))).toBe('Unlocks at your 4th belt.');
    expect(lockedLine('At {belt}.', belts(['White Belt']))).toBe(`At belt ${CHALLENGE_FROM_TIER}.`);
  });

  it('a tap: sound and line pulse always; a shake only without reduced motion', () => {
    expect(lockedTapFeedback(false)).toEqual({ sound: true, pulseLine: true, shake: true });
    expect(lockedTapFeedback(true)).toEqual({ sound: true, pulseLine: true, shake: false });
    expect(LOCK_SHAKE.px).toBeLessThanOrEqual(6);
    expect(LOCK_SHAKE.ms).toBeLessThanOrEqual(300);
  });

  it('the locked card is solid (no alpha) and a locked tap never chooses Challenge', () => {
    expect(dojo).not.toMatch(/if \(locked\) b\.visual\.setAlpha/);
    expect(dojo).toMatch(/color: locked \? LOCKED_CARD\.color : 0x2a2536/);
    expect(LOCKED_CARD.color).toBeLessThan(0x2a2536);
    const tap = dojo.slice(dojo.indexOf('if (locked) {'), dojo.indexOf('chooseDifficulty(this.profile, c.id)'));
    expect(tap).toMatch(/this\.lockedCardTap\(b\.visual, line!\);\s*return;/);
    const fn = dojo.slice(dojo.indexOf('private lockedCardTap('), dojo.indexOf('private openBeltEntry('));
    expect(fn).toMatch(/lockedTapFeedback\(reducedMotion\(\)\)/);
    expect(fn).not.toMatch(/chooseDifficulty|writeSave|sound\.load|load\.audio|load\.image/);
  });
});

// Q-SHAKE-CENTER: the shake is centred on the card's resting spot.
import { lockShakeOffset, lockShakePath } from '../../../apps/client/src/ui/lockCard';
describe('Q-SHAKE-CENTER locked-card shake path', () => {
  it('starts and ends exactly at the resting spot', () => {
    const p = lockShakePath(60);
    expect(p[0]).toBe(0);
    expect(p[p.length - 1]).toBe(0);
    expect(lockShakeOffset(1.2)).toBe(0);
  });
  it('goes the same distance left and right, never past LOCK_SHAKE.px', () => {
    const p = lockShakePath(600);
    const max = Math.max(...p), min = Math.min(...p);
    expect(max).toBeCloseTo(LOCK_SHAKE.px, 3);
    expect(min).toBeCloseTo(-LOCK_SHAKE.px, 3);
    // Mirror symmetric in time: offset(t) = -offset(1 - t), so the average spot is the resting spot.
    for (let i = 0; i <= 600; i++) expect(p[i] + p[600 - i]).toBeCloseTo(0, 9);
    expect(p.reduce((a, b) => a + b, 0) / p.length).toBeCloseTo(0, 9);
  });
});
