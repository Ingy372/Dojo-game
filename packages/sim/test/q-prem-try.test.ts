// Q-PREM-TRY: the go-home retry line in exactly the lessons the C-STORY-TRY draft lists.
import { describe, expect, it } from 'vitest';
import draft from '../../../drafts/content/tutorial/C-STORY-TRY.json';
import lessons from '../../../content/tutorial/first-session-lessons.json';

const NEW = "Nice work today. Let's rest at the dojo.";
const all = (lessons as { lessons: Array<{ id: string; retry?: string }> }).lessons;

describe('Q-PREM-TRY', () => {
  const listed = draft.programmerHandoff.map((h) => h.lessonId);
  it('the draft lists 10 lessons, all in first-session-lessons.json, with the decided text', () => {
    expect(listed).toHaveLength(10);
    expect(new Set(listed).size).toBe(10);
    expect(draft.decided.text).toBe(NEW);
    for (const h of draft.programmerHandoff) {
      expect(h.file).toBe('content/tutorial/first-session-lessons.json');
      expect(h.new).toBe(NEW);
    }
  });
  it('every listed lesson has the new retry; no other lesson does', () => {
    for (const id of listed) expect(all.find((l) => l.id === id)?.retry, id).toBe(NEW);
    expect(all.filter((l) => l.retry === NEW).map((l) => l.id).sort()).toEqual([...listed].sort());
  });
  it('the old line is gone and lesson-counter-guided is left alone', () => {
    expect(all.some((l) => l.retry === draft.current)).toBe(false);
    expect(all.find((l) => l.id === 'lesson-counter-guided')?.retry).toBe("So close! Let's try again.");
  });
});
