// Story Chapters: the words file. Kids read every line, so each is 8 words or fewer.
import { describe, expect, it } from 'vitest';
import { STORY_CHAPTERS } from '../src';
import words from '../../../content/tutorial/chapters.json';

function lines(o: unknown, out: string[] = []): string[] {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach((v) => lines(v, out));
  else if (o && typeof o === 'object') Object.values(o).forEach((v) => lines(v, out));
  return out;
}

describe('chapter words', () => {
  it('has a title for every chapter', () => {
    expect(words.chapters.map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6].slice(0, STORY_CHAPTERS));
    for (const c of words.chapters) expect(c.title.length).toBeGreaterThan(0);
  });

  it('every line is 8 words or fewer', () => {
    const { _note, chapters, ...rest } = words as Record<string, unknown>;
    void _note;
    void chapters;
    for (const l of lines(rest)) expect(l.split(/\s+/).filter(Boolean).length, l).toBeLessThanOrEqual(8);
  });
});
