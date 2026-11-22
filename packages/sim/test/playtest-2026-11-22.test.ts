// Fixes from the overnight playthrough of Nov 22 (docs/reviews/playtest-2026-11-22.md).
import { describe, expect, it } from 'vitest';
import screens from '../../../content/settings/screens.json';

const files = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const src = (f: string) => files[`../../../apps/client/src/${f}`];

describe('playtest Nov 22', () => {
  it('a quick tap in the stick area walks there (it used to do nothing)', () => {
    const t = src('input/TouchControls.ts');
    expect(t).toMatch(/const QUICK_TAP_MS = 250;/);
    expect(t).toMatch(/const QUICK_TAP_SLOP = 14;/);
    // on letting go of the stick, a quick, still press queues a walk to that spot
    expect(t).toMatch(/if \(isQuickTap\(this\.scene\.time\.now - this\.stickDown\.at, this\.stickDown\.moved\)\) this\.queueTap\(pointer\);/);
    expect(t).toMatch(/return heldMs <= QUICK_TAP_MS && movedPx <= QUICK_TAP_SLOP;/);
  });

  it('tutorial bow: reaching the Tower door (not only the mat) brings the bow', () => {
    const g = src('scenes/GameScene.ts');
    expect(g).toMatch(/const BOW_DOOR_REACH = 1\.6;/);
    expect(g).toMatch(/near\(mat\.at, BOW_MAT_REACH\) \|\| near\(mat\.door, BOW_DOOR_REACH\)/);
  });

  it('kata special turn: arrows don\'t re-face the hero around a turn, moves tapped mid-turn wait their turn, in order', () => {
    const t = src('scenes/InsideScene.ts');
    const pad = src('ui/kataPractice.ts');
    // the pad tells the scene which beat an arrow is for
    expect(pad).toMatch(/face\(dir: Facing, beat: PracticeBeat\): void;/);
    expect(pad).toMatch(/this\.hooks\.face\(d, beat\);/);
    // no re-facing while a turn plays, while beats wait, or for the beat that starts with a turn
    expect(t).toMatch(/if \(this\.kataTurning\(\) \|\| this\.kataQueued\.length \|\| \(beat\.anim && this\.hero\.has\(beat\.anim\) && this\.hero\.art\.animations\[beat\.anim\]\?\.turn\)\) return;/);
    // a beat tapped mid-turn (or behind one that waits) joins the queue; the queue plays in order, a moment apart
    expect(t).toMatch(/if \(!fromQueue && \(this\.kataTurning\(\) \|\| this\.kataQueued\.length\)\) \{\s*this\.kataQueued\.push\(\(\) => beatFn\(beat, move, index, true\)\);/);
    expect(t).toMatch(/const KATA_QUEUE_GAP_MS = 260;/);
    expect(t).toMatch(/this\.kataQueued\.shift\(\)!\(\);/);
    // the hero faces the new way at once (the first frame was drawn facing the old way)
    expect(t).toMatch(/me\.facing = \{ \.\.\.KATA_VEC\[beat\.dir\] \};\s*\/\/ Playtest Nov 22: face the new way at once[^\n]*\n\s*this\.hero\.face\(me\.facing\.x, me\.facing\.y\);/);
    expect(t).toMatch(/me\.facing = \{ \.\.\.start \};\s*this\.hero\.face\(start\.x, start\.y\);/);
    // the bow out waits for waiting beats
    expect(t).toMatch(/if \(this\.kataQueued\.length \|\| this\.kataTurning\(\)\) this\.time\.delayedCall\(120, \(\) => whenFree\(fn\)\);/);
  });

  it('the welcome line says "an Orange Belt", not "a Orange Belt"', () => {
    expect(screens.createLine).toContain("you're {aBelt},");
    expect(src('scenes/CreateScene.ts')).toMatch(/replace\('\{aBelt\}', `\$\{\/\^\[aeiou\]\/i\.test\(belt\) \? 'an' : 'a'\} \$\{belt\}`\)/);
  });

  it('"Surprise me!" gets room for its label on a small phone', () => {
    expect(src('scenes/CreateScene.ts')).toMatch(/const sw = Math\.round\(Math\.max\(Math\.min\(130, row - 110 - S2\), row \* 0\.4\)\);/);
  });
});
