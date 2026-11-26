# Tutorial overhaul: the Story Chapters (design)

Date: 2026-11-24. Approved by Jay in chat ("Looks good, go"). Replaces the never-approved `docs/tutorial-design.md` (Nov 18 draft) and the short Home Tour.

## Why

Jay: every system in the game must be explained through the tutorial, so nothing is hidden: the Tool Belt, the Home Dojo and decorating, a tour of the town, a tour of the Action Zone dojo and its features, everything. It must not be dumbed down: it needs a story with a strong hook and cut scenes. It must not be one 10–20 minute block; the pacing must keep each piece digestible.

## Goals

- Every system a player can use is shown and tried at least once, in a story chapter.
- Systems that open at a higher belt are **shown** (Sensei points and says when) and listed in the Book's "What's ahead" page; they are taught for real by the existing first-time lessons when they open.
- A story with a hook (the Masked Shade and the light piece), cut scenes at chapter openings and endings, a cliffhanger at the end of each chapter.
- Chapters of about 5 minutes each.

## Non-goals and anti-goals

- No rebuild of the fighting tutorial floor (Jay tuned it; it stays as Chapter 1's middle).
- No new systems: chapters teach what exists.
- Anti-goals: a chapter that's a wall of text; a chapter the kid can't leave; anything frightening; a game event celebrated more than a real achievement; a lent tool or practice that changes real power.

## Pacing (Jay picked A: play-paced)

- A chapter opens when the player has finished **one Tower climb on their own** since the last chapter (Chapter 1 needs nothing). A climb counts when the run ends (cleared, rested or knocked out), not when it starts.
- When a chapter is ready, Sensei waits in the Home Dojo with a gold "!" and a chapter card ("Chapter 3: Tools of the Trade" with **Start** and **Later**). Later keeps it waiting; nothing is lost.
- This overrides the "one new system per session/day" rule for story chapters (decision logged). Welcome Week and the first-time lessons keep their own rules; a system taught by a chapter is marked as taught so no second card repeats it.
- Every finished chapter can be replayed from the Book's Lessons shelf ("Story" cubby).

## The story

- **Hook:** when the great light breaks (opening cut scene), one piece lands in the hero's hands and glows. Sensei: "The light chose you." The **Masked Shade** (draft name) leads the Shades and wants that piece.
- **Masked Shade:** small, cloaked, a cracked mask; sneaky and a little sad, never scary.
- **Long mystery** (paid off after the tutorial, not in these chapters): under the cloak he wears a faded white belt. He was a student who quit. Hinted only (a glimpse of a white belt end in Chapter 5).

## The chapters

| # | Chapter | Starts | Teaches | Cut scenes |
|---|---|---|---|---|
| 1 | The Broken Light | First launch | Opening cut scene (+ the light piece), the tutorial floor as it is, then home: bow, the Training Station and "climb once on your own" | **Ending:** after the Keeper, the Masked Shade drops in, grabs the light shard the Keeper dropped, "You're not ready." and vanishes |
| 2 | Home, Sweet Dojo | Home, after climb 1 | Cleaning (dust is only for looks, never hurts), decorating (place the Keeper trophy or first decoration), Look, Training Station → Board → gear and Wear best, the Book | **Opening:** Shades have tipped things over in your dojo and scurry out the window, giggling |
| 3 | Tools of the Trade | Home, after climb 2 | Tool Belt, pockets, Sensei's Pick, the Fighting Style screen, the KATA button (Kiai!) in a practice room with a lent tool; "your own tools come from sign-offs in real class" | **Ending:** a Shade copies the hero's move: "They're learning too." |
| 4 | The Real Dojo | Home, after climb 3 | Town map and door signs, walk to the Action Zone, bow in, the creeds (exact text), heavy bag, target wall, Practice Kata (Watch, Hint, coins), Miss Hannah's pro shop (tabs, coins, selling) | none |
| 5 | The Path Up | Home, after climb 4 | My Path, Missions and "Ready to show Sensei", Class Chest and Blessing, Training Points, stripes and Virtues, the Gate | **Opening:** the Gate at the top of the white belt floors; the Masked Shade behind it (white belt glimpse). The biggest moment |
| 6 | Friends in Town | Home, after climb 5 | Street Smarts House and Michael (when it opens), Say phrases, classmate cards, parties, the Monster Journal, "What's ahead" | **Ending:** the town square's light glows a little: "Every floor brings it back." |

## How it's built

- **Saved on the profile** (`story`): chapters finished, climbs since the last chapter, and the current chapter's step (a chapter can span scenes and survive closing the app).
- **Pure rules in `packages/sim/src/story.ts`**: which chapter is ready, what a finished climb does, reading old saves. Tested with Vitest.
- **Words in `content/tutorial/chapters.json`**: chapter titles, Sensei lines, cut scene captions. Every line 8 words or fewer where a kid reads it. Marked placeholder until Jay OKs.
- **Client:** a small cut scene kit (letterbox bars, caption, Skip, fade) shared with the opening cut scene; each cut scene is a short code timeline; the stops reuse the Home Tour's Sensei bubble and glowing "walk here" spot.
- **The Home Tour is replaced** by Chapter 1's ending stop (station, then climb) and Chapters 2 and 4 (dojo, town).
- **Existing saves:** a save that has already played (`homeTourDone`) starts with Chapter 1 finished and is offered Chapter 2 after its next climb.
- **Art:** the Masked Shade starts as a code stand-in (a dark-tinted Shade with a drawn mask and cloak), marked placeholder; a Blender model follows for Jay's OK. The messy dojo uses existing mess spots and tipped decorations.

## Build order

1. Chapter engine, saving, chapter card, Book replay cubby; Chapter 1's new ending; Chapter 2. (This session.)
2. Chapters 3 and 4.
3. Chapters 5 and 6, "What's ahead", existing-student pass.
4. Masked Shade Blender art, polish from Jay's phone tests.

## Left to the builder

Exact camera moves and timings; where Sensei stands; which mess spots the Shades make; how a replay of a chapter avoids changing real state (a replay is look-only: no coins, no decorations moved for real).
