# Story Chapters, stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The chapter engine (saving, play-paced unlocking, chapter card), Chapter 1's new hook and ending, and Chapter 2 "Home, Sweet Dojo".

**Architecture:** Pure chapter rules in `packages/sim/src/story.ts` on the profile; words in `content/tutorial/chapters.json`; a shared cut scene frame in `apps/client/src/ui/cutscene.ts` used by the opening and the new cut scenes; DojoScene and HomeScene run the chapter stops with the existing `senseiBubble` and `tourGlow`.

**Tech Stack:** TypeScript, Phaser 3, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-24-tutorial-overhaul-design.md`

## Global Constraints

- Every kid-read line in `chapters.json` is 8 words or fewer (Sensei lines and captions).
- Words are drafts: the file has `"placeholder": true` until Jay OKs them.
- Nothing in a chapter changes power, coins or real items beyond what the existing systems already give (decorating places a piece the player already owns).
- Shades and the Masked Shade stay small and cute; Skip works on every cut scene.
- Linux line endings; tests, type checks and both builds pass before pushing.

## Review Focus

- A save from before this change (played, `homeTourDone` true): must start with chapter 1 done, never see chapter 1 again, and get chapter 2 after its next climb. Test in Task 1.
- The app closed mid-chapter: the chapter resumes at its saved step, not from the start, and never twice. Test in Task 1 (`step` survives `readStory`).
- A tutorial-floor replay from the Book or a test-link run must not count as a climb. Test in Task 1.
- "Later" on the chapter card: the chapter stays ready on the next visit; nothing else is lost. Checked in the browser (Task 5).
- A brand-new player mid Home Tour from an old build (`homeTour` = 'town'): still finishes (the town stop still works). Kept by not removing the town stop code path.

---

### Task 1: Chapter rules and saving

**Files:** Create `packages/sim/src/story.ts`; modify `packages/sim/src/profile.ts` (field, fresh value, `readProfile`, `finishRun`), `packages/sim/src/index.ts`; test `packages/sim/test/story.test.ts`.

**Interfaces (produces):**
- `interface StorySave { done: number; climbs: number; step: string | null }`
- `STORY_CHAPTERS = 6`
- `readStory(raw: unknown, played: boolean): StorySave` — missing → `{ done: played ? 1 : 0, climbs: 0, step: null }`
- `chapterReady(s: StorySave): number | null` — the next chapter number when `done < 6` and (`done === 0` or `climbs >= 1`), else null
- `noteClimb(s: StorySave, run: { test: boolean; tutorial: boolean }): void` — +1 only for real, non-tutorial runs
- `finishChapter(s: StorySave, n: number): void` — `done = max(done, n)`, `climbs = 0`, `step = null`
- `Profile.story: StorySave`; `finishRun` calls `noteClimb`.

- [ ] Tests: fresh profile → `chapterReady` 1; after `finishChapter(1)` → null; after one real climb → 2; tutorial or test run doesn't count; old played save → done 1; `step` 'ch2-sweep' round-trips through `readStory`; done 6 → null.
- [ ] Run `npx vitest run packages/sim/test/story.test.ts` → fail; implement; → pass; commit.

### Task 2: Chapter words

**Files:** Create `content/tutorial/chapters.json`, `packages/sim/test/story-words.test.ts`.

Shape: `{ placeholder, chapters: [{ n, title }], intro: { piece, chosen }, ch1End: {...lines}, ch1Home: string[], ch2: {...lines} }`. Test: every string under `ch*`/`intro` has ≤ 8 words; six chapter titles.

- [ ] Write file and test; pass; commit.

### Task 3: Cut scene frame and the opening's hook

**Files:** Create `apps/client/src/ui/cutscene.ts`; modify `apps/client/src/ui/introCutscene.ts`, `content/tutorial/intro-cutscene.json`.

**Produces:** `cutsceneFrame(scene, opts?: { skipLabel?: string }): { at(ms, fn), say(line), hush(), finish(done: () => void), over(): boolean, onSkip(fn) }` with letterbox bars, caption, Skip, resize handling and timer cleanup.

- [ ] Move the frame pieces out of `introCutscene.ts` (behaviour unchanged), add the light-piece beat: a spark falls from the broken light to the hero's dojo door, caption "One piece fell to a student." then "The light chose you." Commit after `npm run typecheck` passes.

### Task 4: Chapter 1 ending and the first home stop

**Files:** Create `apps/client/src/ui/maskedShade.ts` (code stand-in: dark Shade sprite + drawn mask and cloak, `addMaskedShade(scene, parent, x, y)`); modify `GameScene.ts` (tutorial keeper clear), `DojoScene.ts` (`runTour` dojo stop), `HomeScene.ts` (tour end → `finishChapter(1)`).

- [ ] After the first tutorial Keeper clear (not a replay): a 10–12 s cut scene in the Keep: a light shard pops from the Keeper, the Masked Shade drops in, takes it, says "You're not ready.", vanishes in smoke. Skip works. Then home as today.
- [ ] Dojo stop: Sensei's ch1 home lines, then the station glows and the tour goes straight to the board stop (town walk moves to chapter 4). Board stop's end finishes chapter 1 and says "Climb once alone. Then I'll show you more."
- [ ] Commit.

### Task 5: Chapter card and Chapter 2

**Files:** Create `apps/client/src/ui/chapterCard.ts` (`showChapterCard(scene, n, title, onStart, onLater)`); modify `DojoScene.ts`, `HomeScene.ts`.

Steps saved in `story.step`: `ch2-mess` → `ch2-sweep` → `ch2-decorate` → `ch2-look` → `ch2-board` → done.

- [ ] Dojo arrival with `chapterReady === 2` (after the bow and cards): Sensei's gold "!" card, Start / Later.
- [ ] `ch2-mess`: cut scene: mess spots appear, 3 Shades scurry from the middle to the window and fade; caption lines.
- [ ] `ch2-sweep`: Sensei line; sweeping every spot moves on; line "Dust is only for looks. Never hurts."
- [ ] `ch2-decorate`: Sensei line; Decorate glows; putting any piece down moves on (marks `lesson-decorating` seen).
- [ ] `ch2-look`: Sensei line about Look (Next only, no forced change).
- [ ] `ch2-board`: station glows; on the Board, Sensei points at gear (Wear best) and the Book, then `finishChapter(2)`; lines name what comes next.
- [ ] Commit.

### Task 6: Check and ship to a preview

- [ ] `npm test`, `npm run typecheck`, both builds.
- [ ] Browser at 844 × 390: new profile through the opening, tutorial ending, home stop; then a played profile through Chapter 2 (`?room=` / testing screen).
- [ ] Logs: decisions.md (play-paced chapters override one-system-per-day; Home Tour replaced), progress.md, work-board.md; push the branch.

Deferred to stage 2: the Book's Story cubby replay, chapters 3–6, Masked Shade Blender art.
