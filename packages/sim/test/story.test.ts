// Story Chapters (docs/superpowers/specs/2026-11-24-tutorial-overhaul-design.md): play-paced chapter unlocking.
import { describe, expect, it } from 'vitest';
import { STORY_CHAPTERS, chapterReady, finishChapter, loadProfile, newProfile, noteClimb, readStory } from '../src';

const real = { test: false, tutorial: false };

describe('story chapters', () => {
  it('a brand-new player gets chapter 1 straight away', () => {
    const s = newProfile().story;
    expect(s).toEqual({ done: 0, climbs: 0, step: null });
    expect(chapterReady(s)).toBe(1);
  });

  it('the next chapter waits for one climb of their own', () => {
    const s = readStory(undefined, false);
    finishChapter(s, 1);
    expect(chapterReady(s)).toBeNull();
    noteClimb(s, real);
    expect(chapterReady(s)).toBe(2);
    finishChapter(s, 2);
    expect(s.climbs).toBe(0);
    expect(chapterReady(s)).toBeNull();
  });

  it('tutorial replays and test links are not climbs', () => {
    const s = readStory(undefined, false);
    finishChapter(s, 1);
    noteClimb(s, { test: false, tutorial: true });
    noteClimb(s, { test: true, tutorial: false });
    expect(chapterReady(s)).toBeNull();
  });

  it('a save that already played starts with chapter 1 done', () => {
    expect(readStory(undefined, true)).toEqual({ done: 1, climbs: 0, step: null });
    const old = { ...newProfile(), runsPlayed: 4, homeTourDone: true } as Record<string, unknown>;
    delete old.story;
    const p = loadProfile(old);
    expect(p.story.done).toBe(1);
    expect(chapterReady(p.story)).toBeNull();
  });

  it('the step inside a chapter survives closing the app', () => {
    const s = readStory({ done: 1, climbs: 1, step: 'ch2-sweep' }, true);
    expect(s.step).toBe('ch2-sweep');
    expect(readStory({ done: 'x', climbs: -2, step: 4 }, false)).toEqual({ done: 0, climbs: 0, step: null });
  });

  it('after the last chapter nothing is ready', () => {
    const s = readStory({ done: STORY_CHAPTERS, climbs: 5, step: null }, true);
    expect(chapterReady(s)).toBeNull();
    finishChapter(s, 3);
    expect(s.done).toBe(STORY_CHAPTERS);
  });

  it('a finished climb counts on the profile', () => {
    const p = newProfile();
    finishChapter(p.story, 1);
    noteClimb(p.story, real);
    expect(chapterReady(p.story)).toBe(2);
  });
});
