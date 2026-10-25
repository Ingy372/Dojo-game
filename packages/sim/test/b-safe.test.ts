// B-SAFE: kid-safety items. Outside links behind the gate, wipe-data, the saved note, beta flags off.
import { describe, expect, it } from 'vitest';
import { appKeys, showSavedNote, testSearch } from '../src';

const src = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const file = (end: string) => Object.entries(src).find(([k]) => k.endsWith(end))![1];

describe('B-SAFE', () => {
  it('wipe removes every dojo-ascent- key, including belt entry, play limit and dev day, and nothing else', () => {
    const keys = ['dojo-ascent-profile-v1', 'dojo-ascent-run-in-progress', 'dojo-ascent-play-clock', 'dojo-ascent-dev-day-offset', 'dojo-ascent-test-student', 'dojo.reducedMotion', 'dojo.musicVol', 'other-app', 'dojoother'];
    expect(appKeys(keys)).toEqual(keys.slice(0, 7));
  });

  it('every key the client saves starts with dojo-ascent-, so the wipe catches it', () => {
    for (const [name, text] of Object.entries(src)) {
      for (const m of text.matchAll(/const \w*KEY\w* = '([^']+)'/g)) expect(appKeys([m[1]]), name).toEqual([m[1]]);
      for (const m of text.matchAll(/\w+: '(dojo[^']*)'/g)) expect(appKeys([m[1]]), name).toEqual([m[1]]);
    }
  });

  it('wipe sits behind the gate, asks to confirm, and restarts fresh', () => {
    const dojo = file('scenes/DojoScene.ts');
    const limit = dojo.slice(dojo.indexOf('private openPlayLimit'));
    expect(limit.slice(0, 600)).toContain('this.addWipeButton(box)');
    expect(dojo).toMatch(/confirmWipe[\s\S]*wipeAllData\(\);\s*\/\/[^\n]*\n\s*window\.location\.reload\(\)/);
    expect(dojo).toMatch(/showGrownUpGate\(this, \(\) => \{\s*sfx\.place\(true\);\s*this\.openPlayLimit\(back\)/);
  });

  it('the saved note shows on first launch only', () => {
    expect(showSavedNote(false, false)).toBe(true);
    expect(showSavedNote(true, false)).toBe(false);
    expect(showSavedNote(false, true)).toBe(false);
  });

  it('test flags are empty in a beta build and work otherwise', () => {
    const q = '?playlimit=1&guide=0&elite=swift&tower=t2&aura=swift&difficulty=guided&seed=5&room=training&street=x&twist=y';
    expect(testSearch(q, true)).toBe('');
    expect(testSearch(q, false)).toBe(q);
  });

  it('every flag read goes through testFlags, and the dev day and testing screens are off in beta', () => {
    for (const [name, text] of Object.entries(src)) {
      if (name.endsWith('game/beta.ts')) continue;
      expect(text, name).not.toMatch(/new URLSearchParams\(/);
    }
    expect(file('game/lessons.ts')).toMatch(/devDayOffset\(\): number \{\s*if \(BETA\) return 0/);
    expect(file('scenes/DojoScene.ts')).toMatch(/tapTitle\(\): void \{\s*if \(BETA\) return/);
    expect(file('scenes/HomeScene.ts')).toMatch(/tapTitle\(\): void \{\s*if \(BETA\) return/);
  });

  it('outside links open only through the gate helper', () => {
    for (const [name, text] of Object.entries(src)) {
      if (name.endsWith('ui/grownUpGate.ts')) continue;
      expect(text, name).not.toMatch(/window\.open\(|location\.(href|assign|replace)\s*[=(]|Browser\.open/);
    }
    expect(file('ui/grownUpGate.ts')).toMatch(/openOutsideLink[\s\S]*showGrownUpGate\(scene, \(\) => \{\s*window\.open/);
  });
});
