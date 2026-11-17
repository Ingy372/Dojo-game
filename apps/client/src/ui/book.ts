// L10-B: the Book (no Phaser, so Vitest can check it). One screen with four tabs for what used
// to be the Trophy Case, the Monster Journal and Sensei's Scroll, plus the Faith pages.
// Moves: katas, kicks, self-defense and the lessons seen. Trophies: Virtue stripes and monster trophies.

import type { JournalKind, SenseiLesson } from '@dojo/sim';
import words from '../../../../content/settings/book.json';
import type { Cubby, ShelfId } from './trophyCase';

export const BOOK_WORDS = words;
export type BookTab = 'moves' | 'monsters' | 'faith' | 'trophies';
export const BOOK_TABS: readonly BookTab[] = ['moves', 'monsters', 'faith', 'trophies'];

/** L8-B2 (Tester's #541 note): the Board has no Book tabs, so coming from the Book it opens on Last climb. */
export function boardTab<T extends string>(tab: T | BookTab): T | 'run' {
  return (BOOK_TABS as readonly string[]).includes(tab) ? 'run' : (tab as T);
}

const SHELVES: Record<'moves' | 'trophies', readonly ShelfId[]> = {
  moves: ['katas', 'kicks', 'selfDefense', 'lessons'],
  trophies: ['stripes', 'monsters'],
};

export interface BookInput {
  /** The Trophy Case cubbies (buildCubbies). */
  cubbies: readonly Cubby[];
  /** Sensei's Scroll: the lessons seen, in order (scrollLessons), and whether the Scroll is open yet (Welcome Week). */
  lessons: readonly SenseiLesson[];
  scrollOpen: boolean;
  lessonTitle: (l: SenseiLesson) => string;
  /** The Monster Journal's monster kinds (journalKinds), and whether the Journal is open yet. */
  kinds: readonly JournalKind[];
  journalOpen: boolean;
  monsterName: (k: JournalKind) => string;
  unknown: { name: string; fact: string };
}

/** Every cubby on the Book's shelves: the Trophy Case's, then the lessons, then the monster trophies. */
export function bookCubbies(b: BookInput): Cubby[] {
  const lessons: Cubby[] = b.scrollOpen
    ? [
        ...b.lessons.map((l): Cubby => ({ id: `lesson-${l.id}`, shelf: 'lessons', name: b.lessonTitle(l), earned: true, effect: l.screens.join(' '), status: l.practice ? words.tryIt.replace('{practice}', l.practice) : '' })),
        { id: 'lesson-tutorial', shelf: 'lessons', name: words.tutorial, earned: true, effect: words.tutorialLine, status: '', action: 'replayTutorial' },
      ]
    : [];
  const monsters: Cubby[] = b.journalOpen
    ? b.kinds.map((k): Cubby => {
        const d = k.trophy;
        const art = k.met ? (d.art ? { pack: d.art, id: d.id } : undefined) : d.silhouette ? { pack: 'named-monster', id: d.silhouette } : undefined;
        return k.met
          ? { id: `trophy-${d.id}`, shelf: 'monsters', name: b.monsterName(k), earned: true, art, effect: d.description ?? '', status: d.name }
          : { id: `trophy-${d.id}`, shelf: 'monsters', name: b.unknown.name, earned: false, art, notYet: b.unknown.fact, effect: b.unknown.fact, status: '' };
      })
    : [];
  return [...b.cubbies, ...lessons, ...monsters];
}

/** The cubbies one tab shows, in shelf order. */
export function tabCubbies(all: readonly Cubby[], tab: 'moves' | 'trophies'): Cubby[] {
  return all.filter((c) => SHELVES[tab].includes(c.shelf));
}
