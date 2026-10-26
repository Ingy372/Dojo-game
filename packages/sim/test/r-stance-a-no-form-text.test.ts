/// <reference types="vite/client" />
// R-STANCE-a: Forms are now called Stances. No text the player can see may say "Form",
// except inside a kata's real name ("Basic Form 1"). Checks every string in content/ and every
// string literal in the game code (apps/client/src and packages/sim/src). Comments are not
// player text, nor are content notes ("note", "notes", "from", "about").
import { describe, expect, it } from 'vitest';
const contentFiles = import.meta.glob<unknown>('../../../content/**/*.json', { eager: true, import: 'default' });
const codeFiles = {
  ...import.meta.glob<string>('../../../apps/client/src/**/*.ts', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../../../packages/sim/src/**/*.ts', { eager: true, query: '?raw', import: 'default' }),
};
const name = (f: string) => f.replace('../../../', '');
const NOT_PLAYER_TEXT = new Set(['note', 'notes', 'from', 'about']);
const FORM = /\b(?:Forms?|FORMS?)\b/;

const kataNames = Object.entries(contentFiles).filter(([f]) => f.includes('/content/katas/')).map(([, k]) => (k as { name: string }).name);
/** The text with every kata name taken out, so "Basic Form 1 Scroll" passes. */
const withoutKatas = (s: string) => kataNames.reduce((t, k) => t.split(k).join(''), s);

function jsonStrings(v: unknown, key: string, out: string[]): string[] {
  if (typeof v === 'string' && !NOT_PLAYER_TEXT.has(key)) out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => jsonStrings(x, key, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) jsonStrings(x, k, out);
  return out;
}

/** Every quoted string in a .ts file, comments skipped. Template text counts; `${...}` parts do not. */
function codeStrings(src: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') i = src.indexOf('\n', i) < 0 ? src.length : src.indexOf('\n', i);
    else if (c === '/' && src[i + 1] === '*') i = src.indexOf('*/', i + 2) + 2;
    else if (c === "'" || c === '"' || c === '`') {
      let text = '';
      let depth = 0;
      for (i++; i < src.length && (depth > 0 || src[i] !== c); i++) {
        if (src[i] === '\\') { if (depth === 0) text += src[i + 1]; i++; }
        else if (c === '`' && src[i] === '$' && src[i + 1] === '{') { depth++; i++; text += ' '; }
        else if (depth > 0 && src[i] === '{') depth++;
        else if (depth > 0 && src[i] === '}') depth--;
        else if (depth === 0) text += src[i];
      }
      out.push(text);
      i++;
    } else i++;
  }
  return out;
}

describe('R-STANCE-a: no "Form" in player text', () => {
  it('knows the kata names it lets through', () => {
    expect(kataNames).toContain('Basic Form 1');
    expect(withoutKatas('Basic Form 1 Scroll')).not.toMatch(FORM);
  });

  it('content/ has no "Form" outside kata names', () => {
    expect(Object.keys(contentFiles).length).toBeGreaterThan(20);
    const bad = Object.entries(contentFiles).flatMap(([f, v]) =>
      jsonStrings(v, '', []).filter((s) => FORM.test(withoutKatas(s))).map((s) => `${name(f)}: ${s}`),
    );
    expect(bad).toEqual([]);
  });

  it('game code strings have no "Form" outside kata names', () => {
    expect(Object.keys(codeFiles).length).toBeGreaterThan(20);
    const bad = Object.entries(codeFiles).flatMap(([f, src]) => codeStrings(src).filter((s) => FORM.test(withoutKatas(s))).map((s) => `${name(f)}: ${s}`));
    expect(bad).toEqual([]);
  });

  it('would catch an old name', () => {
    expect(FORM.test(withoutKatas('Rooted Form'))).toBe(true);
    expect(FORM.test('FORM')).toBe(true);
  });
});
