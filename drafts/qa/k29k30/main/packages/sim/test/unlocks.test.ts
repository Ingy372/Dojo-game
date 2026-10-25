// M7-P7: yellow-belt profile gets all abilities on day 1 but meets one new system per session; "+1 day" moves it forward.
import { describe, expect, it } from 'vitest';
import {
  buildTraining, introduceToday, isExistingStudent, lessonFor, loadFeed, loadLessons, loadProfile, loadUnlockSchedule, markLessonSeen,
  newLessonLog, newProfile, newWelcomeWeekLog, systemOpen, welcomeWeekDone, type Now, type TrainingState,
} from '../src';
import lessonsData from '../../../content/tutorial/first-session-lessons.json';
import scheduleData from '../../../content/settings/unlock-schedule.json';
import newWhite from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import young from '../../../fixtures/5-white-belt-age-6-9.json';
import { testContent } from './load-content';

const content = testContent();
const LESSONS = loadLessons(lessonsData);
const SCHEDULE = loadUnlockSchedule(scheduleData);
const day = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;
const train = (data: unknown): TrainingState => {
  const feed = loadFeed(data);
  const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
  return buildTraining(feed, content.abilities, now);
};
const PRESSURE = /hurry|left|before it|streak|missed|don't lose|last chance|only|countdown|\d+ days?/i;

/** Plays a day: the dojo checks for today's system. */
function visit(p = newProfile(), t: TrainingState, today: string) {
  return introduceToday(SCHEDULE, p.welcomeWeek, t, LESSONS, p.lessons, today)?.id ?? null;
}

describe('Welcome Week (M7-P7)', () => {
  it('existing students: any sign-off or a belt above white (Manager call)', () => {
    expect([newWhite, white3, yellow, green, young].map((f) => isExistingStudent(train(f)))).toEqual([false, true, true, true, false]);
  });

  it('yellow belt: every earned ability on day 1, one new system per day, and "+1 day" moves it forward', () => {
    const t = train(yellow);
    // All abilities on day 1: nothing about Welcome Week touches the training state.
    const unlocked = t.requirements.filter((r) => r.signedOff).length;
    expect(unlocked).toBeGreaterThan(0);
    const p = newProfile();
    const open = () => SCHEDULE.filter((s) => systemOpen(SCHEDULE, p.welcomeWeek, t, s.id)).map((s) => s.id);
    // Before Sensei's first introduction, nothing in the week shows yet.
    expect(open()).toEqual([]);
    expect(visit(p, t, day(1))).toBe('street-smarts');
    expect(open()).toEqual(['street-smarts']);
    // Same day, more visits: nothing new.
    expect(visit(p, t, day(1))).toBeNull();
    expect(visit(p, t, day(1))).toBeNull();
    // +1 day: the next one.
    expect(visit(p, t, day(2))).toBe('journal');
    expect(open()).toEqual(['street-smarts', 'journal']);
    expect(visit(p, t, day(3))).toBe('scroll');
    expect(welcomeWeekDone(SCHEDULE, p.welcomeWeek, t)).toBe(true);
    expect(visit(p, t, day(4))).toBeNull();
    expect(train(yellow).requirements.filter((r) => r.signedOff).length).toBe(unlocked);
  });

  it('a gap just pauses it: the week resumes at the next session, with nothing lost', () => {
    const t = train(green);
    const p = newProfile();
    expect(visit(p, t, day(1))).toBe('street-smarts');
    expect(visit(p, t, day(20))).toBe('journal');
    expect(p.welcomeWeek.introduced.map((x) => x.id)).toEqual(['street-smarts', 'journal']);
  });

  it('white belt with sign-offs skips systems its belt has not opened', () => {
    const t = train(white3);
    const p = newProfile();
    expect(visit(p, t, day(1))).toBe('scroll');
    expect(visit(p, t, day(2))).toBeNull();
    expect(systemOpen(SCHEDULE, p.welcomeWeek, t, 'journal')).toBe(false);
  });

  it('new students are not in Welcome Week: systems open by belt as before', () => {
    for (const f of [newWhite, young]) {
      const t = train(f);
      const p = newProfile();
      expect(visit(p, t, day(1))).toBeNull();
      expect(systemOpen(SCHEDULE, p.welcomeWeek, t, 'scroll')).toBe(true);
      expect(systemOpen(SCHEDULE, p.welcomeWeek, t, 'street-smarts')).toBe(false);
    }
  });

  it('shared budget: one new thing per day in total, lesson or system (Manager call)', () => {
    const t = train(yellow);
    // A lesson first: no system today.
    const a = newProfile();
    markLessonSeen(a.lessons, 'lesson-dash', day(1), 'r1');
    expect(visit(a, t, day(1))).toBeNull();
    expect(visit(a, t, day(2))).toBe('street-smarts');
    // A system first: no counted lesson today, but the always-on safety lessons still show.
    const b = newProfile();
    b.lessons.sessionDays = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', day(1)];
    expect(visit(b, t, day(1))).toBe('street-smarts');
    expect(lessonFor(LESSONS, b.lessons, 'firstInsightChoice', day(1), 'r1', true)).toBeNull();
    expect(lessonFor(LESSONS, b.lessons, 'firstInsightChoice', day(2), 'r1', false)?.id).toBe('lesson-insights');
    expect(lessonFor(LESSONS, b.lessons, 'firstPerfectUnaided', day(1), 'r1', true)?.id).toBe('lesson-perfect');
    // The tutorial floor's guided lessons don't use up day 1.
    const c = newProfile();
    for (const id of ['lesson-warning', 'lesson-counter-guided', 'lesson-strike']) markLessonSeen(c.lessons, id, day(1), 'r1');
    expect(visit(c, t, day(1))).toBe('street-smarts');
  });

  it('existing saves that already played keep everything open; the log survives save/load', () => {
    const old = JSON.parse(JSON.stringify(newProfile())) as Record<string, unknown>;
    delete old.welcomeWeek;
    old.runsPlayed = 5;
    expect(loadProfile(old).welcomeWeek.existing).toBe(false);
    const p = newProfile();
    visit(p, train(yellow), day(1));
    expect(loadProfile(JSON.parse(JSON.stringify(p))).welcomeWeek).toEqual(p.welcomeWeek);
    expect(newWelcomeWeekLog()).toEqual({ existing: null, introduced: [] });
  });

  it('kind wording only: no countdowns or "you missed"', () => {
    for (const s of SCHEDULE) for (const line of s.screens) expect(line).not.toMatch(PRESSURE);
    expect(newLessonLog().seen).toEqual([]);
  });
});
