# Dojo Ascent — Work Board

Last updated: 2026-10-24 (7:55 PM EDT) by Dojo-ascent Manager. Catch-up covers PRs #62–#176.

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
| J10 | ~~Music licence~~ **Answered (Oct 24):** AI-assisted (Suno) WAFU music is OK. Jay emailed WAFU (11:53 AM) for a written OK on white-label builds for other dojos; **waiting on WAFU's reply.** | M7-P8a pick, M7-P8 |
| J11 | ~~Street Smarts safety review~~ **Done (Oct 24):** code word yes, kid says Mom/Dad, the "come with me" line is OK; Manager picked the safe helpers (worker with uniform or name tag, cashier, police officer, grown-up with kids) and a short reunion scene. Applied in PR #58. | ~~C1, K2~~ (unblocked) |
| J12 | **Not blocking (after-work glance):** the fixed warning moves are now in the game (PR #104). Jay can try them with `?named=old-thumper`, `?named=zippy-zoom` or `?named=captain-clank` on a yellow-belt run and say if anything looks off. | nothing (built) |
| J13 | **After-work list (not blocking, Jay will do later):** self-defense gaps for S4 (results and categories for #31–35, what "party flex" (#33) means, #36–40 for Brown, the attacks for #3/#4/#5/#15); kick combos 8–12; kata character lines (J3); for the C4 quests, the school's founding story, the arts blended in Yeshua's Ryu and what each belt colour means; whether to ask Nic for a total-classes field (PR #93); quick looks at the cosmetics (PR #78), Insight icons (PR #56) and the padded-staff enemy (PR #95); the A2 Rooted stance pick (PR #121); self-defense #36–40 attacks and student steps. | S3, S4 rest, C4 details |
| R-BAL-1 | **Balance approach (PR #176, `drafts/planning/balance-research.md`).** D1 scale enemies to the expected player or the actual one (recommended: expected); D2 target bands OK?; D4 Endless soft cap ×1.5 or keep +3% with no cap; D5 Challenge 1.3× or 1.5×. | R-BAL-2, R-BAL-6 |
| R-BAL-5 | Soften the XP steps (last step 10 runs or fewer)? Yes or no. | one config line |
| J14 | **Walk, round 3 (Oct 24).** Jay picked Arms 1 (relaxed, PR #175) at 6.5/10; the Artist tries again after studying natural walks in other games. Jay picks from the new samples. Fallback: Arms 1. | A-WALK |
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
| M7-P1 | **Done (PR #108, merged Oct 24).** Default difficulty is Standard, with a difficulty choice screen (Manager call). Original: Guided on by default for new profiles aged 6–9 or white belt with 0 sign-offs; never switch a player off a mode they chose. | Programmer | nothing | Youngest fake profile starts on Guided; switching to Standard sticks after reload; an older profile starts on Standard. |
| M7-P2 | **Done (PR #139, merged Oct 24).** First Perfect Counter in about 40 s; can't lose; chest always Special or better. Original: Tutorial floor (first 10 minutes, can't lose). | Programmer | — | First Perfect Counter under 2 minutes from "Tap to start"; can't lose by doing nothing; chest always Uncommon or better. |
| M7-P3 | **Delivered (PRs #37, #49).** Tutorial lines for each P2 step. | Content Designer | — | Every P2 step has one line in a data file, each under 12 words. |
| M7-P4 | **Done (PR #145, merged Oct 24).** Cascade of unlocks on first return home. | Programmer | nothing (M7-P2 done) | Profile 2 sees 3 unlocks plus the stripe in order; profile 1 sees the preview; nothing plays twice. |
| M7-P5 | **Done (PR #142, merged Oct 24).** A session is a calendar day with at least one run; one new lesson per session and per room; Scroll button in the dojo replays seen lessons and the tutorial floor. | Programmer | — | Two sessions in a row show one new lesson each, never two; every seen lesson replays from the Scroll. |
| M7-P6 | **Delivered (PRs #37, #39, #44, #49, #50).** Lesson lines for first-session systems; `drafts/content/tutorial/first-session-lessons.json` is the only lesson file. | Content Designer | — | Each P5 lesson has its lines in a data file, one sentence per screen. |
| M7-P7 | **Done (PR #149, merged Oct 24).** Old saves skip Welcome Week. Gradual unlock schedule + Welcome Week. | Programmer | nothing (M7-P5 done); do after K18 | Yellow-belt profile gets all abilities on day 1 but meets one new system per session; "+1 day" moves it forward. |
| M7-P8 | **Done (PR #172, merged Oct 24).** WAFU music (Mountain Temple: Great Hall I for dojo and menus; Long Road: Grass Road I for the Tower), volume sliders. | Programmer | — | No main screen without sound; both volume sliders work and are remembered. |
| M7-P8a | **Done (PR #170, merged Oct 24): WAFU said yes; Mountain Temple for the dojo and menus, Long Road for the Tower.** Shortlist delivered (PRs #38, #43). Shortlist 3 free-licence music packs (commercial use allowed); Manager picks one. | Researcher & Planner | WAFU's reply (J10) | Shortlist in drafts/planning/ with licence links; Manager's pick recorded here. |
| M7-P9 | **Done (PR #110, merged Oct 24).** Grown-up gate is a math question; play time resets at midnight. Original: Play-time limit parent setting (off/15/30/45/60, default off); finish the room, friendly "Great training today!", go home. | Programmer | nothing | With `?playlimit=1` the run ends after the current room, nothing is lost, the message is friendly. |
| M7-P10 | **Done (PR #147, merged Oct 24).** Three next goals at session end (game, collection, real-world). | Programmer | M7-P4 | Every profile sees exactly 3 goals; the real-world one names a real next technique. |
| M7-P11 | **Done (PR #113, merged Oct 24):** a Tower run now survives the app closing. Original: Fix the open bug notes in `docs/progress.md` (for example, a run in progress isn't saved if the app closes). | Programmer | nothing | Each fixed note has a test or screenshot in the PR. |
| M7-P12 | **Done: READY (report merged Oct 24); fixes are K23.** Playtest-readiness check. | QA Tester | M7-P1 to M7-P11 | Report on each fake profile's first 30 minutes on a phone-sized screen: time to first Perfect Counter, screens over one sentence, ways to lose the tutorial, crashes. |
| M7-P13 | **Draft review done (PR #46), fixes merged (PR #49).** Learning and overwhelm review of P2–P7; re-check done (PR #151, merged Oct 24); fixes are K22. | Learning Designer | M7-P4 and M7-P7 builds | Short pass/change note on overwhelm, ethics and age 6+ reading level. |
| M7-N1 | **Done (PR #104, merged Oct 24):** small version, three named monsters from yellow belt, tells wired in, Monster Journal and stickers. Bigger version for later belts comes later. Original: **Ready to build (launch scope, J8).** Named monster (`drafts/planning/named-monster-proposal.md`, final spec PR #47). Text in `drafts/content/enemies/named-monsters.json` (PR #45); art in `incoming-art/named-monster/` (PRs #48, #51, #53, tells fixed in #60; brute stamp shake off with reduced motion). Build the monster now; wire the warning moves after J12. | Programmer | — | As the proposal's Done-when. |

---

## 4. Dojo-Ascent Programmer

| ID | Task | Waiting on |
| --- | --- | --- |
| K1 | **In progress (sent Oct 23).** Check that the game's belt list, kata names and requirement counts match `docs/curriculum.md` (fixtures and content/), and list any differences for Jay. Record section 1 in docs/decisions.md. In docs/GROK_BOTS.md, mark the QA bot active and move the milestone 4 recommendation task from the Learning Designer to the Dojo-Ascent Researcher & Planner. Fix one fact wherever it appears: Sensei's Lessons are built in milestone 7 and finished in milestone 10. Remove the black belt question from the Open questions list only after J6 is answered. Also add Jay's new curriculum text (self-defense #31–35, kick combos 1–7) to the docs, and replace remaining Claude Code references in the docs with the Dojo-Ascent Programmer. Also record Jay's Oct 23 decisions in docs/decisions.md: J5 (cosmetics from gear, in-game and dojo achievements, never bought), J6 (2 years from 1st to 2nd degree) and J7 (Fredoka headings + Andika body). Show Jay the changes before committing. | nothing |
| K4 | **Done (PRs #19 and #20, merged Oct 23).** S1 #1 (enemy mixes) and #2 (Perfect Counter chain). The "longest chain" record is deferred. | — |
| K5 | **Done (PR #22, merged Oct 23).** S1 #4 room twists, with the final twist text and guided-Counter nudge. Slide stays at 1.6x (Q4 found no real cost; drop to 1.3x if kids slide into danger on a real phone). | — |
| K6 | **Done (PR #26, merged Oct 23).** Twist banner no longer covers the room name or goal; `?twist=<id>` test link added (fixes Q4 bugs 1 and 3). | — |
| K7 | **Done (PR #41).** Tier 2 art (Sunrise Garden), 28 icons, elite aura preview. QA check in PR #55; new Insight icons in PR #56. | — |
| K7-fix | **Done (PR #62).** Fix the small-screen layout bugs in `drafts/qa/2026-10-24-k7-art-qa.md` (PR #55) and swap in the redrawn Insight icons from PR #56. | nothing |
| K8 | **Done (PR #59, merged Oct 24).** S1 #3 elites (Swift and Guarding) from 4th belt up. Typical player's green-belt win rate is 93% (7-point drop, target was 5). **Manager call:** keep the numbers for now and recheck after the playtest (M7-P12); all numbers are in `content/elites/elites.json`. | — |
| K2 | **Done (PRs #75, #82).** Street Smarts scene "Separated in a store", helper question trimmed to 4 choices. | — |
| K9 | **Done (PR #89).** Difficulty reaches elites, plus the elites QA fixes. | — |
| K10 | **Done (PR #105, merged Oct 24).** K9 retest fixes (COMBO off the boss bar, Sensei banner off door labels, `?elite=guarding` respects Guided). 197 tests pass. | — |
| K11 | **Done (PRs #108, #110, #113, merged Oct 24).** M7-P1, M7-P9, M7-P11. | — |
| K12 | **Done (PR #119, merged Oct 24).** Q3 named-monster fixes, reduced-motion switch, A7 swatch rim, Bopper art, named monsters about 1 in 30 runs. | — |
| K13 | **Done (PRs #131, #133, #134).** A6 Tier 1 decorations imported (#131); earning built (#133): class pieces (one every 2 class dates at White, every 3 after), Journal trophies, keeper statues, folding screen, S7 surprise drops; Rest-for-now refresh fix (#134). **Manager calls:** each piece keeps the belt it dropped on; classes count once per calendar date. | — |
| K13b | **Done (PR #135).** Monster Journal pages for the monster kinds, with plain enemy names. | — |
| K14 | **Done (PR #140).** Journal silhouettes for unmet Floor Keeper and Bopper cards, plus the A2 Form stance idles (Rooted = option A). | — |
| K15 | **Done (PR #139).** M7-P2 Tutorial floor. | — |
| K16 | **Done (PR #141).** C7 kid-facing rarity names from content: common is "Everyday", uncommon is "Special". | — |
| K17 | **Done (PR #142).** M7-P5 Sensei's Lessons and the Lesson Scroll. | — |
| K18 | **Done (PR #145).** M7-P4 unlock cascade on first return home. | — |
| K19 | **Done (PR #149).** M7-P7 gradual unlock schedule + Welcome Week. | — |
| K20 | **Done (PR #147).** M7-P10 Three next goals at session end (section 3b). One PR. | K19 |
| K22 | **Done (PRs #153, #154).** M7-P13 Learning Designer fixes. | — |
| K23 | **Done (PRs #157, #159, #167; QA retest PASS #160).** M7-P12 playtest fixes. | — |
| K24a | **Next for the Programmer (ready now).** Jay's tutorial feedback: see-through tutorial box (about 65%, easy to read, doesn't block the game), tap to continue, then try the move; slower pace. Use the C12 draft (`drafts/content/tutorial/tutorial-floor.json`, PR #173) with data-driven tips; you may rename the `advance`/`waitFor` fields and set up the new tutorial waves. **Manager calls on C12:** keep "health never drops below 1" on the tutorial floor; lesson-dash becomes a short reminder at session 2 instead of a new lesson. One PR. | nothing |
| K24b | **After K24a.** Clearer counter: wind-up ring, '!' and a COUNTER flash so kids know when to block (no new art). One PR. | K24a |
| K24c | **After K24b.** Camera a bit closer (Tower about 6.75 tiles tall, not super zoomed in) at full retina resolution. One PR. | K24b |
| R-BAL-4 | **After K24c.** Test that locks the bad-luck counter (guaranteed rare on run 5 or sooner). Plan: `drafts/planning/balance-research.md` (PR #176). | K24c |
| R-BAL-2 | Per-tier enemy scaling and per-tier gear caps, as in the balance plan. | R-BAL-1 (Jay) |
| R-BAL-6 | Endless soft cap (after launch unless Endless ships at launch). | R-BAL-1 (Jay) |
| K21 | **Later (when the achievements and trophy screens are built).** Use the A3 bow badges as the achievement icons on the Goals page and the award pop-up, with the number drawn under each badge in the UI font; write the short date on the certified trophy's plate. | achievement screens |
| S4c-P1 | **After launch (first update).** Build the Injured status from break seals #31–40 (`drafts/planning/S4c-injured-status.md`, PR #120). Text is ready (S4c-C1 PR #128, S4c-C2 PR #129) and art is ready (S4c-A1 PRs #126, #130). You may adjust the proposed seal ids at import. | S4 locks built, launch |
| K3 | Run the balance-testing computer player whenever the QA bot or the Systems Designer asks, and send Jay the report. | requests |

---

## 5. QA & Playability Tester

| ID | Task | Waiting on |
| --- | --- | --- |
| Q1 | **Delivered (PR #17):** `drafts/qa/2026-10-23-q1-combat-report.md`. Headline: a player who never Counters wins 0% of runs on every difficulty. ~~**Full combat test** on the live link: all three difficulties, all three test profiles, every room type and the boss. Report bugs, then a playability report. Add one extra section: "What would make combat more varied and more rewarding?", thinking like a 6-year-old, a 12-year-old and an adult.~~ | — |
| Q2 | Test character creation and the newly imported art (Batches 4–7): readability on a phone, anything that looks wrong. | nothing |
| Q4 | **Delivered (PR #25):** `drafts/qa/2026-10-23-q4-room-twists-report.md`. Twists change the win rate by only about half a point; the earlier drop was from too few test runs. Banner fixes done in K6. Open note: banner text (17 px, two sentences plus a Sensei line) may be a lot for a new reader; revisit after Jay tries it on his phone. | — |
| S4c-T1 | **After launch.** Test the Injured status once S4c-P1 is built. | S4c-P1 |
| Q3 | **Delivered (PR #112):** named-monster QA; fixes in K12. Original: Ask Jay for a balance run from Dojo-Ascent Programmer (K3), compare it with your own play, and suggest specific number changes. Note: novice players on Standard currently win only 41% of runs. | K3 |
| R-BAL-3 | Balance fixtures for each tier; `npm run balance` reports win %, deaths and room times per tier. | R-BAL-2 |
| R-BAL-7 | Kid playtest against the balance targets. | R-BAL-3 |
| Q5 | **Next for the Tester (ready now).** Check K24a once merged: tutorial pace, see-through box readable on a phone, every tip waits for the try. | K24a |

---

## 6. Dojo-Ascent Researcher & Planner (systems design: drafts/planning/)

Every proposal from the Dojo-Ascent Researcher & Planner (drafts/planning/) gets checked twice: by Dojo-Ascent Programmer's balance-testing player for the numbers, and by the Learning Designer (L4) for learning and ethics.

| ID | Task | Waiting on |
| --- | --- | --- |
**Owner:** Jay assigned S1–S8 to the Dojo-Ascent Researcher & Planner on Oct 23 (the separate Game Systems Designer bot was not set up).

| S1 | **Done (PR #12).** #1 and #2 built (K4); #4 room twists in PR #22 (K5). **Combat depth proposal.** Combat is fun but needs more variety and more reward. Review what's built, plus Q1 when it lands. Propose up to 6 changes, ranked by fun per cost. Ideas to weigh: enemy mixes that force different answers, elite enemy modifiers, room twists, Form-switching moments, Perfect Counter chains, combo finishers, risk-and-reward choices between rooms, better hit feedback. Each change must keep the core skill of reading the warning, then answering. | nothing (use Q1 when it arrives) |
| S2 | **Delivered (PR #84).** **Item system spec.** Gear slots, rarity, stat ranges inside the power budget, drop sources by tier, breaking duplicates down into materials, and how gear stats and cosmetic looks stay separate. What's in launch and what comes later. | nothing |
| S3 | **Forms (stances).** One Form per kata in `docs/curriculum.md` (8 known so far): its name, how it plays, and the reason to switch to it. Plus the switching rules (how, when, cooldown) and how Forms stay simple for a 6-year-old. | J3 (kata character lines) |
| S4 | **Self-defense #1–30 delivered (PR #70); #31–40 seals and attacks #3/#4/#5/#15 delivered as S4b (PR #117); Injured status as S4c (PR #120); kick combos 1–7 delivered (PR #100); padded-staff wording (PR #102).** Katas wait on S3; #31–40 and combos 8–12 wait on Jay (J13). **Power-ups from real training.** Start with self-defense: give each of #1–30 in `docs/self-defense.md` an in-game effect that matches what the real technique does, using its game category, and follow the rules at the bottom of that file. Techniques in the same category should build on each other (for example, #13, #14 and #24 all kick a weapon away, each a little stronger). Replace the current placeholder powers. Then do the kick combos (after J2) and the katas (after S3). Finally, give a recommendation for each milestone 4 open question (content/abilities/abilities.json, and the PROGRESSION and POWER settings in docs/decisions.md). | self-defense: nothing · kick combos: nothing (J2 done) |
| S5 | **Delivered (PR #88).** **Difficulty.** Review core-design §12: is there a clear, kid-understandable reason to choose Challenge? Should young beginners be offered Guided automatically, given the 41% novice win rate? What does Endless Ascent give at black belt? | nothing |
| S6 | **Delivered (PR #80).** **Achievements.** The full list: categories, thresholds, what each awards (titles, trophies, decorations, cosmetics), certified real-world trophies versus game trophies, and the bow-question awards (5/10/20/50/100). No achievement may reward daily logins or punish missed days. | nothing |
| S7 | **Delivered (PRs #67, #73, #85; L4 reviews #71, #77).** **Earning decorations in play.** A table of every in-game source (chests by tier, first floor clears, Bestiary entries, Decoration sets, Challenge, Open House events, crafting later), with rough rates so a student finds something new every few runs. | nothing |
| S9–S12 | **Delivered:** S9 closest-goal line, count-up streak and first Mission (PRs #74, #85); S10 cosmetic unlock rules (PRs #87, #96); S11 enemy warnings (PR #98); S12 Journal practice (PR #99). These are specs, not built yet. S13 and S14 are parked. | — |
| S8 | **Delivered (PRs #91, #94).** **Similar games study.** For each game below, what Dojo Ascent should borrow and what to avoid: Hades, Archero, Soul Knight, Ring Fit Adventure, Pokémon GO, Animal Crossing, Pokémon, Duolingo, Prodigy Math, Punch-Out!!, Sekiro. | nothing |
| R-BAL | **Done (PR #176).** Sourced balance research and sim; follow-ups R-BAL-1 to R-BAL-7. | — |

---

## 7. Learning & Engagement Designer

| ID | Task | Waiting on |
| --- | --- | --- |
| L1 | ~~Fix your audit: Sensei's Lessons are built in milestone 7, not 10.~~ **Done:** PR #8, merged by Jay. | — |
| L2 | **Done (PR #68).** Update proposal 2 to the recall bow question (section 1, item 1). | nothing |
| L3 | **Delivered (PR #64).** **Coming-back audit.** Check the five loops against the built game: does a student have a good reason to play a few times a week, without pressure? What's missing at white belt specifically? | nothing |
| L4 | Review every Dojo-Ascent Researcher & Planner systems proposal (S1–S8) for learning value, overwhelm and ethics. | S1–S8 |
| L5-new | **Delivered (PR #114).** P1 difficulty and play-time review. | — |
| L5 | **Delivered (PR #32, merged Oct 24).** Spoken scripture waits on J9; text only until then. Original task: **Faith and creed in the game.** Using `docs/faith-and-creed.md` and the research on spaced recall, propose where the verses, covenants, FAITH DOES life words and the Class Creed appear (for example: the bow, the Gate, the promotion ceremony, Sensei's lines, the Lamp Keeper's story, a FAITH DOES collection) so students learn them by heart without it feeling like a test. The words are never reworded. | nothing |

---

## 8. Content Writer

| ID | Task | Waiting on |
| --- | --- | --- |
| C1 | **Milestone 6 dialogue merged (PR #9).** **Assigned to the Content Designer (Jay, Oct 24):** draft the Street Smarts script. **Milestone 6 material:** dialogue for Sensei, Senpai, Kohai, the second instructor and the founder; plus one Street Smarts scenario script for Jay to approve. | **Done (PRs #34, #58):** Jay's J11 answers applied. |
| C2 | **Delivered (PRs #66, #69).** Redo `dojo/sensei-bow-questions.json` as recall questions, with Sensei's lines for a correct answer, a wrong answer, and each award. Change the first lesson to "Tap where you want to go, or use the stick." | nothing |
| C3 | **Delivered (PRs #65, #86):** storm ending adopted. **Lore bible (lore first).** The Tower's history, the shattered light, the Guardian of every belt tier (white to black), and the Relics. Keep it to one page per tier. This becomes the foundation every quest and enemy is built on. | nothing |
| C4 | **Delivered (PRs #72, #76).** School details wait on Jay (J13). **Quest lines.** After C3 is approved: an outline of the main story chapter for each tier, the life-lesson quests (3rd belt), and the manners and culture quests. Outlines first; full scripts after Jay approves. | C3 |
| C5 | **Delivered (PR #31, merged Oct 24).** Verses use the dojo sign wording (Manager call). Original task: Faith content drafts, in the places L5 proposes, using the exact text in `docs/faith-and-creed.md`. | **Unblocked (Oct 24):** J4 answered (see section 6 of `docs/faith-and-creed.md`). Uses KJV text, and the material is learned through play, not used as Gate locks. | L5 |
| C6 | **Delivered (PRs #81, #90, #92).** Names and text for achievements, items and A1 cosmetics; rarity names Everyday/Special. | — |
| C8 | **Delivered (PR #97).** Bouncy Bopper text (the padded-staff enemy, from yellow belt). | — |
| C9 | **Delivered (PR #115).** Wording check for #108, #110, #113. | — |
| C10 | **Delivered (PR #123).** A6 decoration names and story lines. | — |
| S4c-C1 | **Delivered (PR #128).** Injured pop-up, Sensei line, Journal tip, recover line and seal suffix. **Manager calls:** lines under 80 characters are fine; keep the recover line. | — |
| S4c-C2 | **Delivered (PR #129).** Effect text for break seals #31–40. **Manager calls:** proposed ids OK (Programmer may adjust); seal names as subtitles with the "Self-Defense #N!" callout OK; keep "and leaves them Injured" on all ten, including #32, #33, #37, as the plan says; `effectRef` as a text pointer is fine. | — |
| C11 | **Delivered (PR #132).** Unique keeper statue and Journal trophy names and lines; in the game via #133. | — |
| C7 | **Delivered (PRs #90, #96).** Redo the technique callouts so each subtitle matches the real technique in `docs/self-defense.md` (for example, #3 is a spinning back fist, not "Sweep"). Kid-safe subtitles only. | S4 |
| C12 | **Delivered (PR #173).** Tutorial floor rewrite with combat tips (13 steps). Built under K24a. | — |

---

## 9. Art Director

| ID | Task | Waiting on |
| --- | --- | --- |
| A0 | **Done (PR #10 merged; K7 wired it in).** Yellow belt Tower kit in B Bamboo Garden Hall (`incoming-art/tower-rooms-t2/`), all 28 icons (`incoming-art/icons/`), and the full elite aura set for S1 #3 (`incoming-art/elite-auras/`). Manager calls on the small questions: delete `tower-rooms-t2/proposals/` before merge (B is chosen); one blue rim for all Seals is fine. Tier 2 in-game name and whether Guarding shows which enemies it protects go to the Researcher & Planner (S1). Artist: delete the proposals folder and take "do not merge" off the PR title. | — |
| A1 | **Samples delivered (PR #78).** **Earned cosmetics:** headbands, hand wraps matching the gear (cloth, leather, tiger stripe), gi trims, and a soft aura. 3 samples first. | nothing (J5 done) |
| A2 | **Done (PR #121, merged Oct 24).** Rooted Form uses option A, the wide fighting stance; option B moved to `alternate-not-used/`. Use the stance idle in place of the guard idle while a Form is equipped, in fights and the Tower only. Wired in when Forms are built (after S3). Later Forms follow S3. | — |
| A3 | **Samples done (PR #138, merged Oct 24).** **Manager calls:** (1) yes, the badges are the achievement icons on the Goals page and the award pop-up, next to the reward; (2) the game draws the number under each badge in its UI font, nothing baked in; (3) the plate shows a short date, and the full "Earned {date}" line goes in the info pop-up; (4) **Jay (Oct 24):** the Certified seal uses Action Zone's logo or colours, built as a swappable school layer so other dojos can use their own (A3 follow-up with the Artist); (5) working ids are fine. | — |
| A3b | **Done (PRs #148, #158; seal #146, logo A3c #165).** Certified trophy set, S6 badge family, Student of the Month trophy. | — |
| A6 | **Done (PRs #122, #124, #125).** Tier 1 decoration set, 7 scrolls + 6 gear class pieces, White-belt fallback colour. Into the game under K13. | — |
| S4c-A1 | **Done (PRs #126, #130).** Cartoon bandage and dizzy stars for Injured: enemies only, stars at head height, 2 stars on the Floor Keeper. | — |
| A8 | **Done (PR #136).** Monster Journal silhouettes for the Floor Keeper and the Bouncy Bopper. Into the game under K14. | — |
| A5 | **Full set done (PR #111).** Samples PR #95. Padded-staff enemy (Bouncy Bopper) idle, wind-up and attack. Numbers in PR #102. Next: the full animation set (move, hit, stagger, defeat, staff drop). | nothing |
| A4 | **Town square concept:** one picture of the dojo town (Student of the Month statue, doors to classmates' dojos, the Tower in the distance) for Jay to approve before any building. | nothing |
| A-WALK | **Next for the Artist (ready now).** Arms-only walk samples were PR #175 (eyes reverted there). Jay picked Arms 1 but rated it 6.5/10: study natural walks in other games and send new arm samples, legs unchanged. Arms 1 is the fallback. | nothing |

---

## 10. DojoForge (outside this repository: Jay and Nic)

| ID | Task |
| --- | --- |
| F1 | **Instructor sign-off at 40–200 students.** The game only reads sign-offs from DojoForge; it never marks them. Make sure DojoForge's instructor screen has: tonight's class roster with "Ready to show Sensei" students on top; one-tap OK and Not yet, with no typing; **group sign-off** (pick a technique, tap everyone who passed, save once); undo for a few minutes; works on a tablet with weak Wi-Fi; and permissions so assistant instructors can sign off. The feed fields the game expects are in `fixtures/` (signedOff, signedOffOn, signedOffBy). |

---

## Appendix: Systems design

The systems design work (S1–S8) moved to the Dojo-Ascent Researcher & Planner (drafts/planning/) on Oct 23; the separate Bot 6 instructions are retired.

### S3 Forms from the school's kata sheets (plan: drafts/planning/S3-forms-kata-plan.md, PR #161)
| ID | Task | Owner | Waiting on | Done when |
| --- | --- | --- | --- | --- |
| S3-J1 | Jay answers kata questions Q1–16 (in the plan). Manager calls: D1 in-game shows names, step counts and arrows only; D2 practice room after launch; D3 Key On and D&G Forms in milestone 10. | Jay | nothing | Answers recorded in the plan. |
| S3-J2 | Jay's character lines for the Key On and D&G Forms. | Jay | nothing | Lines in the plan. |
| S3-K1 | **Done (PRs #163, #166, #168).** Kata data files; Keon spelling and #3/#4 from Jay. | Content Designer | — | As in the plan. |
| S3-P1 | **Done (PR #169).** Kata cards on the Abilities tab. | Programmer | — | As in the plan. |
| S3-A1 | Direction picture and kata icons. | Artist | after the walk samples and A3c | As in the plan. |
| S3-D1 | Design the two new Forms. | Researcher & Planner | S3-J2 | As in the plan. |
| S3-P2 | Calm practice room (after launch). | Programmer | launch | As in the plan. |
| S3-T1 | **Done (PR #174).** Kata cards checked against the sheets. | QA Tester | — | As in the plan. |
