// B-MASHER-2 (E3, #296): the "Sensei steps back" moment shows once per run, with its text from content/.
import { describe, expect, it } from 'vitest';
import { MASH_GUARD_LINE, takeMashGuardMoment } from '../../../apps/client/src/game/mashGuardMoment';
import mashGuardText from '../../../content/settings/mash-guard.json';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/GameScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;

describe('B-MASHER-2 Sensei steps back', () => {
  it('shows once per run, again in a new run', () => {
    const runA = {};
    const runB = {};
    expect(takeMashGuardMoment(runA)).toBe(true);
    expect(takeMashGuardMoment(runA)).toBe(false);
    expect(takeMashGuardMoment(runA)).toBe(false);
    expect(takeMashGuardMoment(runB)).toBe(true);
  });

  it('uses the content line, not text in code, and has a Reduced motion path', () => {
    expect(MASH_GUARD_LINE).toBe(mashGuardText.steppedBackLine);
    expect(MASH_GUARD_LINE).toBe('Three perfect counters! Your timing can fly on its own now.');
    expect(MASH_GUARD_LINE.startsWith('Sensei')).toBe(false);
    expect(src).not.toContain(mashGuardText.steppedBackLine);
    const body = src.slice(src.indexOf('private senseiStepsBack('), src.indexOf('private shieldGlow('));
    expect(body).toContain('takeMashGuardMoment(');
    expect(body).toContain('reducedMotion()');
    expect(body).toContain('this.senseiSay([MASH_GUARD_LINE]');
  });
});
