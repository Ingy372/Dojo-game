# Dojo Ascent — Work Board

Last updated: 2026-10-24 (12 AM) by Dojo-ascent Manager.

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
| Will cosmetics exist? | Yes, earned only and never bought, with looks kept separate from stats: core-design §5 "Style separate from stats" and §13 "Character customization". **Jay to confirm.** |
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
| J1 | ~~Self-defense list~~ **Mostly done:** `docs/self-defense.md` (#1–30) and the belt ladder in `docs/curriculum.md`. Jay gave #31–35 on Oct 23 (Programmer adding them under K1); #33's "party flex" needs Jay's confirmation. Still needed: #36–40, the Brown/Black → Black requirements, and the attacks marked "(not stated)". | S4 for #36–40 |
| J2 | ~~Kick combo list~~ **Done:** Jay gave combos 1–7 on Oct 23; the Programmer is adding them to the docs under K1. | ~~S4 kick combos~~ (no longer blocked) |
| J3 | ~~Kata list~~ **Names done** (`docs/curriculum.md`). ~~Spellings~~ done (commit 660c98d). Still needed (in progress): one line on each kata's character. | S3 |
| J4 | ~~Faith texts~~ **Done:** `docs/faith-and-creed.md`. Still needed: Jay's answers to the questions in its section 6. | L5 can start now; C5 waits on the answers |
| J5 | ~~Confirm cosmetics~~ **Done (Oct 23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought. | ~~A1~~ (unblocked) |
| J6 | ~~Black belt to 2nd degree~~ **Done (Oct 23):** 2 years between 1st and 2nd degree. Code change done in PR #16. | ~~milestone 4~~ (unblocked) |
| J7 | ~~Fonts~~ **Done (Oct 23, Jay delegated to the Manager):** Fredoka for headings + Andika for body text, because Andika is built for early readers (ages 6+). | ~~menu art~~ (unblocked) |

---

## 3a. Top fix waiting on assignment

| ID | Task | Waiting on |
| --- | --- | --- |
| G1 | **Done (PR #21, merged Oct 23).** Guided first Counter (Learning proposal 6). Final nudge text is in `drafts/content/text/guided-counter-nudge.json` (PR #23); the Programmer copies it in under K5. | — |

---

## 4. Dojo-Ascent Programmer

| ID | Task | Waiting on |
| --- | --- | --- |
| K1 | **In progress (sent Oct 23).** Check that the game's belt list, kata names and requirement counts match `docs/curriculum.md` (fixtures and content/), and list any differences for Jay. Record section 1 in docs/decisions.md. In docs/GROK_BOTS.md, mark the QA bot active and move the milestone 4 recommendation task from the Learning Designer to the Dojo-Ascent Researcher & Planner. Fix one fact wherever it appears: Sensei's Lessons are built in milestone 7 and finished in milestone 10. Remove the black belt question from the Open questions list only after J6 is answered. Also add Jay's new curriculum text (self-defense #31–35, kick combos 1–7) to the docs, and replace remaining Claude Code references in the docs with the Dojo-Ascent Programmer. Also record Jay's Oct 23 decisions in docs/decisions.md: J5 (cosmetics from gear, in-game and dojo achievements, never bought), J6 (2 years from 1st to 2nd degree) and J7 (Fredoka headings + Andika body). Show Jay the changes before committing. | nothing |
| K4 | **Done (PRs #19 and #20, merged Oct 23).** S1 #1 (enemy mixes) and #2 (Perfect Counter chain). The "longest chain" record is deferred. | — |
| K5 | **Done (PR #22, merged Oct 23).** S1 #4 room twists, with the final twist text and guided-Counter nudge. Slide stays at 1.6x (Q4 found no real cost; drop to 1.3x if kids slide into danger on a real phone). | — |
| K6 | **Done (PR #26, merged Oct 23).** Twist banner no longer covers the room name or goal; `?twist=<id>` test link added (fixes Q4 bugs 1 and 3). | — |
| K2 | Continue milestone 6 (Story and Street Smarts sample) when the Content Writer's C1 is approved. | C1 |
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
| L5 | **Faith and creed in the game.** Using `docs/faith-and-creed.md` and the research on spaced recall, propose where the verses, covenants, FAITH DOES life words and the Class Creed appear (for example: the bow, the Gate, the promotion ceremony, Sensei's lines, the Lamp Keeper's story, a FAITH DOES collection) so students learn them by heart without it feeling like a test. The words are never reworded. | nothing |

---

## 8. Content Writer

| ID | Task | Waiting on |
| --- | --- | --- |
| C1 | **Milestone 6 dialogue merged (PR #9).** The Street Smarts script is still waiting on Jay deciding where it's drafted. **Milestone 6 material:** dialogue for Sensei, Senpai, Kohai, the second instructor and the founder; plus one Street Smarts scenario script for Jay to approve. | Street Smarts script: Jay (where it's drafted) |
| C2 | Redo `dojo/sensei-bow-questions.json` as recall questions, with Sensei's lines for a correct answer, a wrong answer, and each award. Change the first lesson to "Tap where you want to go, or use the stick." | nothing |
| C3 | **Lore bible (lore first).** The Tower's history, the shattered light, the Guardian of every belt tier (white to black), and the Relics. Keep it to one page per tier. This becomes the foundation every quest and enemy is built on. | nothing |
| C4 | **Quest lines.** After C3 is approved: an outline of the main story chapter for each tier, the life-lesson quests (3rd belt), and the manners and culture quests. Outlines first; full scripts after Jay approves. | C3 |
| C5 | Faith content drafts, in the places L5 proposes, using the exact text in `docs/faith-and-creed.md`. | J4 answers, L5 |
| C6 | Names and text for achievements and items. | S6, S2 |
| C7 | Redo the technique callouts so each subtitle matches the real technique in `docs/self-defense.md` (for example, #3 is a spinning back fist, not "Sweep"). Kid-safe subtitles only. | S4 |

---

## 9. Art Director

| ID | Task | Waiting on |
| --- | --- | --- |
| A0 | **Samples delivered (PR #10, do not merge yet).** Batch 8 icons and 3 Yellow belt Tower themes (A Sunlit Sandstone, B Bamboo Garden Hall, C Sunrise Lacquer). Full batches follow once a theme is picked. | Jay: theme pick |
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
