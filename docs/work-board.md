# Dojo Ascent — Work Board

Last updated: 2026-10-24 (10:05 AM) by Dojo-ascent Manager.

**What this file is:** the one list of open work. Every bot and Dojo-Ascent Programmer reads it. Each item has an ID, one owner, and what it's waiting on. Work only on items with your role as owner, in the order listed, and skip any item that is still waiting on something. Put the item ID (for example S2) in your Delivery Note.

**How it stays current:** Jay marks items done or changes them here. Decisions go into `docs/decisions.md`. If this file and `docs/decisions.md` disagree, `docs/decisions.md` wins.

**Owners:** Jay · Dojo-Ascent Programmer · Dojo-Ascent Researcher & Planner (drafts/planning/) · Learning & Engagement Designer · Content Writer · Art Director · QA & Playability Tester · DojoForge (outside this repository).

---

## 1. Decisions Jay has made (Dojo-Ascent Programmer: record these in docs/decisions.md)

1. **Bow question = recall.** Sensei shows a picture of one of the player's earned abilities and asks "What's this one called?" with 3 picture-and-word choices. After the answer, the character performs the move. A wrong answer warmly shows the right name; there is no penalty. Correct answers are counted forever, with awards at 5, 10, 20, 50 and 100 (may go higher). At most one question per day. It can always be skipped. This replaces the "Which felt best?" draft.
2. **Lore comes first.** The Tower's story and enemy lore are launch scope, and the game is built around them where it fits.
3. **The Bestiary is launch scope.** An enemy's entry fills in the first time the player defeats it; deeper lore unlocks with each real belt. Update the unlock schedule in core-design section 13.
4. **First movement lesson:** "Tap where you want to go, or use the stick."
5. **Real techniques decide game effects.** Each self-defense technique's callout and in-game effect must match what the real technique does to an opponent. Jay's descriptions of #1–30 are in `docs/self-defense.md`. The game shows outcomes (off-balance, trapped, thrown, disarmed, escaped), never injuries.
6. **The QA bot is active now.**
7. **A sixth bot, the Game Systems Designer, owns combat, items, Forms, power-ups, difficulty, achievements and rewards** (section 6 below). Answering the milestone 4 questions (powers, numbers, black belt degrees) moves from the Learning Designer to this bot; the Learning Designer reviews its work.

8. **Belt wording:** keep "Red/Black" and "Brown/Black" (PR #15).

---

## 2. Already answered in the design (no new decision needed)

These questions already have answers in the design docs. The bots build on these answers instead of starting over.

| Question | Where it's answered |
| --- | --- |
| Will cosmetics exist? | Yes, earned only and never bought, with looks kept separate from stats: core-design §5 "Style separate from stats" and §13 "Character customization". **Confirmed by Jay (Oct 23, J5):** from gear, in-game achievements and dojo achievements, never bought. |
| How are decorations earned outside real life? | Tower chests (built), Decoration sets, crafting, Challenge-only decorations: core-design §5, §11, §12. Item S7 turns this into a full list. |
| Gathering place / community | The dojo town square, in three steps (shared world → live town square → co-op runs): core-design §11. |
| Achievements | The trophy wall, collections, Bestiary, certified trophies: core-design §5 and §11. Item S6 turns this into a full list. |
| Why play on a harder difficulty? | core-design §12 "Difficulty levels" (better gear cap, Challenge-only cosmetics, certified trophies, rare materials, faster Mastery). Challenge unlocks at 4th belt (§13). Item S5 reviews it. |
| What brings kids back? | The five loops (moment, run, session, week, journey) and "always show the closest goal": core-design §2, §3, §5. Item L3 audits them against the built game. |
| Stances | Forms, one per kata: framework §4 "Forms give depth" and §5. Item S3 finishes the list. |
| Quest lines | Missions (§13), life-lesson quests at 3rd belt, the Tower story (§1). Items C3 and C4 write them. |

---

## 3. Waiting on Jay

| ID | What Jay provides | Unblocks |
| --- | --- | --- |
| J1 | ~~Self-defense list~~ **Mostly done:** `docs/self-defense.md` (#1–30) and the belt ladder in `docs/curriculum.md`. Jay gave #31–35 on Oct 23 (Programmer adding them under K1); **Deferred by Jay (Oct 24), not blocking:** #33's "party flex" wording, #36–40, the Brown/Black → Black requirements, and the attacks marked "(not stated)". Jay will fill these in later. | nothing (build around the gap) |
| J2 | ~~Kick combo list~~ **Done:** Jay gave combos 1–7 on Oct 23; the Programmer is adding them to the docs under K1. | ~~S4 kick combos~~ (no longer blocked) |
| J3 | ~~Kata list~~ **Names done** (`docs/curriculum.md`). ~~Spellings~~ done (commit 660c98d). Still needed (in progress): one line on each kata's character. | S3 |
| J4 | ~~Faith texts~~ **Done:** `docs/faith-and-creed.md`. Section 6 answered from Jay's wall photos (Oct 24): KJV text, the full Confidentiality line, and no covenant for Brown/Black → Black. | — |
| J5 | ~~Confirm cosmetics~~ **Done (Oct 23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought. | ~~A1~~ (unblocked) |
| J6 | ~~Black belt to 2nd degree~~ **Done (Oct 23):** 2 years between 1st and 2nd degree. Code change done in PR #16. | ~~milestone 4~~ (unblocked) |
| J8 | ~~Named monster: before or after launch?~~ **Done (Oct 24):** before launch. | ~~M7-N1~~ (unblocked) |
| J9 | ~~Scripture read aloud~~ **Done (Oct 24):** the phone's voice reads verses; wording stays exactly as on the dojo sign (PR #42). | ~~spoken verses~~ (unblocked) |
| J10 | **Music licence:** OK to use AI-assisted (Suno) WAFU music, and should we email WAFU (draft in `drafts/planning/M7-P8a-wafu-licence-check.md`, PR #43) for a written OK on white-label builds for other dojos? If no, use the CC0 fallback. | M7-P8a pick, M7-P8 |
| J11 | **Street Smarts safety review:** PR #34 (`drafts/content/street-smarts/SAFETY-REVIEW.md`): safe helpers, the "come with me" shopper line, a code word, the grown-up's name field, showing the reunion. | C1, K2 |
| J7 | ~~Fonts~~ **Done (Oct 23, Jay delegated to the Manager):** Fredoka for headings + Andika for body text, because Andika is built for early readers (ages 6+). | ~~menu art~~ (unblocked) |

---

## 3a. Top fix waiting on assignment

| ID | Task | Waiting on |
| --- | --- | --- |
| G1 | **Done (PR #21, merged Oct 23).** Guided first Counter (Learning proposal 6). Final nudge text is in `drafts/content/text/guided-counter-nudge.json` (PR #23); the Programmer copies it in under K5. | — |

---

## 3b. Milestone 7 "Playtest ready" (plan: `drafts/planning/next-plan-milestone-7.md`, PR #33)

Start with **M7-P1, M7-P9 and M7-P11**. Full specs are in the plan file under the same P number.

**Manager decisions (Oct 24):** Guided is on by default for ages 6–9 **and** new white belts (0 sign-offs). Play-time limit is a parent setting: off / 15 / 30 / 45 / 60 minutes, default **off**. Music: the Researcher & Planner shortlists 3 free-licence packs (commercial use allowed) and the Manager picks.

| ID | Task | Owner | Waiting on | Done when |
| --- | --- | --- | --- | --- |
| M7-P1 | **Start first.** Guided on by default for new profiles aged 6–9 or white belt with 0 sign-offs; never switch a player off a mode they chose. | Programmer | nothing | Youngest fake profile starts on Guided; switching to Standard sticks after reload; an older profile starts on Standard. |
| M7-P2 | Tutorial floor (first 10 minutes, can't lose). | Programmer | nothing (M7-P3 delivered) | First Perfect Counter under 2 minutes from "Tap to start"; can't lose by doing nothing; chest always Uncommon or better. |
| M7-P3 | **Delivered (PRs #37, #49).** Tutorial lines for each P2 step. | Content Designer | — | Every P2 step has one line in a data file, each under 12 words. |
| M7-P4 | Cascade of unlocks on first return home. | Programmer | M7-P2 | Profile 2 sees 3 unlocks plus the stripe in order; profile 1 sees the preview; nothing plays twice. |
| M7-P5 | Sensei's Lessons + Lesson Scroll. Retire the old `content/tutorial/sensei-lessons.json` (see `_note` in the new file). | Programmer | nothing (M7-P6 delivered) | Two sessions in a row show one new lesson each, never two; every seen lesson replays from the Scroll. |
| M7-P6 | **Delivered (PRs #37, #39, #44, #49, #50).** Lesson lines for first-session systems; `drafts/content/tutorial/first-session-lessons.json` is the only lesson file. | Content Designer | — | Each P5 lesson has its lines in a data file, one sentence per screen. |
| M7-P7 | Gradual unlock schedule + Welcome Week. | Programmer | M7-P5 | Yellow-belt profile gets all abilities on day 1 but meets one new system per session; "+1 day" moves it forward. |
| M7-P8 | Sound and music on every main screen. | Programmer | M7-P8a (music pick, waits on J10) | No main screen without sound; both volume sliders work and are remembered. |
| M7-P8a | **Shortlist delivered (PRs #38, #43).** Shortlist 3 free-licence music packs (commercial use allowed); Manager picks one. | Researcher & Planner | J10 | Shortlist in drafts/planning/ with licence links; Manager's pick recorded here. |
| M7-P9 | **Start first.** Play-time limit parent setting (off/15/30/45/60, default off); finish the room, friendly "Great training today!", go home. | Programmer | nothing | With `?playlimit=1` the run ends after the current room, nothing is lost, the message is friendly. |
| M7-P10 | Three next goals at session end (game, collection, real-world). | Programmer | M7-P4 | Every profile sees exactly 3 goals; the real-world one names a real next technique. |
| M7-P11 | **Start first.** Fix the open bug notes in `docs/progress.md` (for example, a run in progress isn't saved if the app closes). | Programmer | nothing | Each fixed note has a test or screenshot in the PR. |
| M7-P12 | Playtest-readiness check. | QA Tester | M7-P1 to M7-P11 | Report on each fake profile's first 30 minutes on a phone-sized screen: time to first Perfect Counter, screens over one sentence, ways to lose the tutorial, crashes. |
| M7-P13 | **Draft review done (PR #46), fixes merged (PR #49).** Learning and overwhelm review of P2–P7; re-check once P2–P7 are built. | Learning Designer | M7-P2 to M7-P7 builds | Short pass/change note on overwhelm, ethics and age 6+ reading level. |
| M7-N1 | **Ready to build (launch scope, J8).** Named monster (`drafts/planning/named-monster-proposal.md`, final spec PR #47). Text in `drafts/content/enemies/named-monsters.json` (PR #45); art in `incoming-art/named-monster/` (PRs #48, #51, #53; brute stamp shake off with reduced motion). | Programmer | nothing | As the proposal's Done-when. |

---

## 4. Dojo-Ascent Programmer

| ID | Task | Waiting on |
| --- | --- | --- |
| K1 | **In progress (sent Oct 23).** Check that the game's belt list, kata names and requirement counts match `docs/curriculum.md` (fixtures and content/), and list any differences for Jay. Record section 1 in docs/decisions.md. In docs/GROK_BOTS.md, mark the QA bot active and move the milestone 4 recommendation task from the Learning Designer to the Dojo-Ascent Researcher & Planner. Fix one fact wherever it appears: Sensei's Lessons are built in milestone 7 and finished in milestone 10. Remove the black belt question from the Open questions list only after J6 is answered. Also add Jay's new curriculum text (self-defense #31–35, kick combos 1–7) to the docs, and replace remaining Claude Code references in the docs with the Dojo-Ascent Programmer. Also record Jay's Oct 23 decisions in docs/decisions.md: J5 (cosmetics from gear, in-game and dojo achievements, never bought), J6 (2 years from 1st to 2nd degree) and J7 (Fredoka headings + Andika body). Show Jay the changes before committing. | nothing |
| K4 | **Done (PRs #19 and #20, merged Oct 23).** S1 #1 (enemy mixes) and #2 (Perfect Counter chain). The "longest chain" record is deferred. | — |
| K5 | **Done (PR #22, merged Oct 23).** S1 #4 room twists, with the final twist text and guided-Counter nudge. Slide stays at 1.6x (Q4 found no real cost; drop to 1.3x if kids slide into danger on a real phone). | — |
| K6 | **Done (PR #26, merged Oct 23).** Twist banner no longer covers the room name or goal; `?twist=<id>` test link added (fixes Q4 bugs 1 and 3). | — |
| K7 | **Done (PR #41).** Tier 2 art (Sunrise Garden), 28 icons, elite aura preview. QA check in PR #55; new Insight icons in PR #56. | — |
| K7-fix | Fix the small-screen layout bugs in `drafts/qa/2026-10-24-k7-art-qa.md` (PR #55) and swap in the redrawn Insight icons from PR #56. | nothing |
| K8 | Build S1 #3 elites (Swift and Guarding) from `drafts/planning/S1-tier2-name-and-guarding-aura.md` (PRs #47, #54; sims Q5 PR #40, Q6 PR #52). | Jay's "go" in the Programmer's own chat |
| K2 | Continue milestone 6 (Story and Street Smarts sample) when the Content Writer's C1 is approved. | C1 (J11) |
| K3 | Run the balance-testing computer player whenever the QA bot or the Systems Designer asks, and send Jay the report. | requests |

---

## 5. QA & Playability Tester

| ID | Task | Waiting on |
| --- | --- | --- |
| Q1 | **Delivered (PR #17):** `drafts/qa/2026-10-23-q1-combat-report.md`. Headline: a player who never Counters wins 0% of runs on every difficulty. ~~**Full combat test** on the live link: all three difficulties, all three test profiles, every room type and the boss. Report bugs, then a playability report. Add one extra section: "What would make combat more varied and more rewarding?", thinking like a 6-year-old, a 12-year-old and an adult.~~ | — |
| Q2 | Test character creation and the newly imported art (Batches 4–7): readability on a phone, anything that looks wrong. | nothing |
| Q4 | **Delivered (PR #25):** `drafts/qa/2026-10-23-q4-room-twists-report.md`. Twists change the win rate by only about half a point; the earlier drop was from too few test runs. Banner fixes done in K6. Open note: banner text (17 px, two sentences plus a Sensei line) may be a lot for a new reader; revisit after Jay tries it on his phone. | — |
| Q3 | Ask Jay for a balance run from Dojo-Ascent Programmer (K3), compare it with your own play, and suggest specific number changes. Note: novice players on Standard currently win only 41% of runs. | K3 |

---

## 6. Dojo-Ascent Researcher & Planner (systems design: drafts/planning/)

Every proposal from the Dojo-Ascent Researcher & Planner (drafts/planning/) gets checked twice: by Dojo-Ascent Programmer's balance-testing player for the numbers, and by the Learning Designer (L4) for learning and ethics.

| ID | Task | Waiting on |
| --- | --- | --- |
**Owner:** Jay assigned S1–S8 to the Dojo-Ascent Researcher & Planner on Oct 23 (the separate Game Systems Designer bot was not set up).

| S1 | **Done (PR #12).** #1 and #2 built (K4); #4 room twists in PR #22 (K5). **Combat depth proposal.** Combat is fun but needs more variety and more reward. Review what's built, plus Q1 when it lands. Propose up to 6 changes, ranked by fun per cost. Ideas to weigh: enemy mixes that force different answers, elite enemy modifiers, room twists, Form-switching moments, Perfect Counter chains, combo finishers, risk-and-reward choices between rooms, better hit feedback. Each change must keep the core skill of reading the warning, then answering. | nothing (use Q1 when it arrives) |
| S2 | **Item system spec.** Gear slots, rarity, stat ranges inside the power budget, drop sources by tier, breaking duplicates down into materials, and how gear stats and cosmetic looks stay separate. What's in launch and what comes later. | nothing |
| S3 | **Forms (stances).** One Form per kata in `docs/curriculum.md` (8 known so far): its name, how it plays, and the reason to switch to it. Plus the switching rules (how, when, cooldown) and how Forms stay simple for a 6-year-old. | J3 (kata character lines) |
| S4 | **Power-ups from real training.** Start with self-defense: give each of #1–30 in `docs/self-defense.md` an in-game effect that matches what the real technique does, using its game category, and follow the rules at the bottom of that file. Techniques in the same category should build on each other (for example, #13, #14 and #24 all kick a weapon away, each a little stronger). Replace the current placeholder powers. Then do the kick combos (after J2) and the katas (after S3). Finally, give a recommendation for each milestone 4 open question (content/abilities/abilities.json, and the PROGRESSION and POWER settings in docs/decisions.md). | self-defense: nothing · kick combos: nothing (J2 done) |
| S5 | **Difficulty.** Review core-design §12: is there a clear, kid-understandable reason to choose Challenge? Should young beginners be offered Guided automatically, given the 41% novice win rate? What does Endless Ascent give at black belt? | nothing |
| S6 | **Achievements.** The full list: categories, thresholds, what each awards (titles, trophies, decorations, cosmetics), certified real-world trophies versus game trophies, and the bow-question awards (5/10/20/50/100). No achievement may reward daily logins or punish missed days. | nothing |
| S7 | **Earning decorations in play.** A table of every in-game source (chests by tier, first floor clears, Bestiary entries, Decoration sets, Challenge, Open House events, crafting later), with rough rates so a student finds something new every few runs. | nothing |
| S8 | **Similar games study.** For each game below, what Dojo Ascent should borrow and what to avoid: Hades, Archero, Soul Knight, Ring Fit Adventure, Pokémon GO, Animal Crossing, Pokémon, Duolingo, Prodigy Math, Punch-Out!!, Sekiro. | nothing |

---

## 7. Learning & Engagement Designer

| ID | Task | Waiting on |
| --- | --- | --- |
| L1 | ~~Fix your audit: Sensei's Lessons are built in milestone 7, not 10.~~ **Done:** PR #8, merged by Jay. | — |
| L2 | Update proposal 2 to the recall bow question (section 1, item 1). | nothing |
| L3 | **Coming-back audit.** Check the five loops against the built game: does a student have a good reason to play a few times a week, without pressure? What's missing at white belt specifically? | nothing |
| L4 | Review every Dojo-Ascent Researcher & Planner systems proposal (S1–S8) for learning value, overwhelm and ethics. | S1–S8 |
| L5 | **Delivered (PR #32, merged Oct 24).** Spoken scripture waits on J9; text only until then. Original task: **Faith and creed in the game.** Using `docs/faith-and-creed.md` and the research on spaced recall, propose where the verses, covenants, FAITH DOES life words and the Class Creed appear (for example: the bow, the Gate, the promotion ceremony, Sensei's lines, the Lamp Keeper's story, a FAITH DOES collection) so students learn them by heart without it feeling like a test. The words are never reworded. | nothing |

---

## 8. Content Writer

| ID | Task | Waiting on |
| --- | --- | --- |
| C1 | **Milestone 6 dialogue merged (PR #9).** **Assigned to the Content Designer (Jay, Oct 24):** draft the Street Smarts script. **Milestone 6 material:** dialogue for Sensei, Senpai, Kohai, the second instructor and the founder; plus one Street Smarts scenario script for Jay to approve. | **Delivered (PR #34)**; waits on J11 (Jay's safety review), then Content Designer makes his edits. |
| C2 | Redo `dojo/sensei-bow-questions.json` as recall questions, with Sensei's lines for a correct answer, a wrong answer, and each award. Change the first lesson to "Tap where you want to go, or use the stick." | nothing |
| C3 | **Lore bible (lore first).** The Tower's history, the shattered light, the Guardian of every belt tier (white to black), and the Relics. Keep it to one page per tier. This becomes the foundation every quest and enemy is built on. | nothing |
| C4 | **Quest lines.** After C3 is approved: an outline of the main story chapter for each tier, the life-lesson quests (3rd belt), and the manners and culture quests. Outlines first; full scripts after Jay approves. | C3 |
| C5 | **Delivered (PR #31, merged Oct 24).** Verses use the dojo sign wording (Manager call). Original task: Faith content drafts, in the places L5 proposes, using the exact text in `docs/faith-and-creed.md`. | **Unblocked (Oct 24):** J4 answered (see section 6 of `docs/faith-and-creed.md`). Uses KJV text, and the material is learned through play, not used as Gate locks. | L5 |
| C6 | Names and text for achievements and items. | S6, S2 |
| C7 | Redo the technique callouts so each subtitle matches the real technique in `docs/self-defense.md` (for example, #3 is a spinning back fist, not "Sweep"). Kid-safe subtitles only. | S4 |

---

## 9. Art Director

| ID | Task | Waiting on |
| --- | --- | --- |
| A0 | **Done (PR #10 merged; K7 wired it in).** Yellow belt Tower kit in B Bamboo Garden Hall (`incoming-art/tower-rooms-t2/`), all 28 icons (`incoming-art/icons/`), and the full elite aura set for S1 #3 (`incoming-art/elite-auras/`). Manager calls on the small questions: delete `tower-rooms-t2/proposals/` before merge (B is chosen); one blue rim for all Seals is fine. Tier 2 in-game name and whether Guarding shows which enemies it protects go to the Researcher & Planner (S1). Artist: delete the proposals folder and take "do not merge" off the PR title. | — |
| A1 | **Earned cosmetics:** headbands, hand wraps matching the gear (cloth, leather, tiger stripe), gi trims, and a soft aura. 3 samples first. | nothing (J5 done) |
| A2 | **Form stances:** a stance idle for Rooted Form and Flowing Form (the two Forms that already exist). Later Forms follow S3. | nothing (later Forms: S3) |
| A3 | **Badges and trophies:** the bow-question award badges (5/10/20/50/100) and a trophy-wall style for certified trophies versus game trophies. | S6 for the full set |
| A4 | **Town square concept:** one picture of the dojo town (Student of the Month statue, doors to classmates' dojos, the Tower in the distance) for Jay to approve before any building. | nothing |

---

## 10. DojoForge (outside this repository: Jay and Nic)

| ID | Task |
| --- | --- |
| F1 | **Instructor sign-off at 40–200 students.** The game only reads sign-offs from DojoForge; it never marks them. Make sure DojoForge's instructor screen has: tonight's class roster with "Ready to show Sensei" students on top; one-tap OK and Not yet, with no typing; **group sign-off** (pick a technique, tap everyone who passed, save once); undo for a few minutes; works on a tablet with weak Wi-Fi; and permissions so assistant instructors can sign off. The feed fields the game expects are in `fixtures/` (signedOff, signedOffOn, signedOffBy). |

---

## Appendix: Systems design

The systems design work (S1–S8) moved to the Dojo-Ascent Researcher & Planner (drafts/planning/) on Oct 23; the separate Bot 6 instructions are retired.
