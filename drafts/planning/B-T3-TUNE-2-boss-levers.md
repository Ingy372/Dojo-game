# B-T3-TUNE-2: making the Hearth Cook feel like a boss without more Health or Power

**Problem (QA):** with typical Orange gear, even at 549/17, it's 60/60 wins and 0 deaths. The boss goes down in 10–12 s, and the player loses only 0–19% HP. The R-BAL-12 bands cap Health and Power, so we need other levers.

**Target (my call):**
- Typical student: **15–20 s**, still winning about 100%.
- A careful but newer student loses about **15–25% HP** on average, with a worst case of about half.
- The 6-year-old who never Counters wins **at least 75% on Standard**. Challenge may be harder (about 2 in 3).
- No cheap deaths: every attack has a clear tell, and its wind-up is never shorter than today's (the rolling pin is 26 ticks, the bonk 20).

## 1. Levers I recommend (in order)
1. **Pot lid while sparks are out (new).** When the sparks hop out (at 66%), the cook puts the pot lid up, and your hits go "clang" until the little ones are calm. This makes the existing Sensei line true: "Little ones first. Then the cook." It adds time and teaches a target choice, not reflexes.
2. **Rolling pin in every phase (pattern only).** Phase 1: bonk, pin. Phase 2: bonk, sparks, pin. Phase 3: sparks, pin, bonk, pin. The dash answer is easy to read, and the pin replaces bonks the 6-year-old can't counter, so he does **better** (sim: 34/37 → 36/37 Standard).
3. **D3 phase pause.** At 66% and 33%, the game holds still for about 1 s: the cook roars, the room glows, and Sensei says the phase line. Everything stops, so it adds about 2 s and changes no danger. It makes phases feel big. The game already pauses for Sensei's guide, so this reuses that.
4. **Keep wind-ups as they are.** `docs/decisions.md` (R-BAL B) says timings never scale per belt. Changing a base wind-up is allowed, but shorter wind-ups are exactly the "cheap" kind of hard, so I don't use them. Recovery times didn't matter in the sim (see "recFast").

**Not now:** room hazards (hot floor tiles, spilled-soup slip spots). The sim has no hazards, they add a new rule for kids to learn, and they risk "I didn't see that" hits. Revisit only after QA plays levers 1–3.

## 2. Sim results (Hearth Cook 549/17, Orange gear, tier 3)
"Careful" is the smart bot. "Newer" is the smart bot with novice skill. "6-yr" is the masher, who never Counters. Wins are counted out of the fights the student reached; time and HP lost are averages, with the worst case after the slash. There were 60 seeds each (40 for the first two rows).

| Variant | Std careful | Std newer | Std 6-yr | Chal newer | Chal 6-yr |
|---|---|---|---|---|---|
| Today | 40/40, 10.7 s, 8%/36% | 12.4 s, 15%/36% | **34/37**, 47% | 12.4 s, 19% | 22/33 |
| Pin every phase (2) | 40/40, 11.9 s, 5% | 13.4 s, 11% | **36/37**, 38% | 13.2 s, 15% | 27/33 |
| **Lid + pin (1+2), recommended** | **60/60, 13.2 s**, 5%/24% | 14.5 s, 11%/30% | **46/56 (82%)**, 44% | 13.6 s, 15% | 31/46 (67%) |
| Lid + pin + 1 more spark at 33% | 60/60, 13.8 s, 5% | 15.5 s, 13% | 41/56 (73%), 50% | 14.6 s, 17% | 27/46 |
| Lid + 2nd spark wave + pin | 40/40, 14.1 s, 7% | 16.2 s, 15% | 19/37 (51%) ✗ | 15.0 s, 19% | 16/33 ✗ |
| Lid + "double roll" (2 pins back to back) | 60/60, 12.6 s, 6% | 13.9 s, 12% | 38/56 (68%) ✗ | 13.8 s, 15% | 35/46 |

**With the D3 pause (+about 2 s): lid + pin gives about 15 s for the typical student and 16–17 s for the newer one.** That's inside the target, with no change in win rates.

**What the sim can't show, said plainly:** the careful bot dashes and counters almost perfectly, so its HP loss stays low (5–8%) in every variant. With Power capped, no fair lever I tried made it take much more. More spark waves only hurt the 6-year-old. The newer student's 11–15% average, up to 30–40%, is the honest "real damage" number. Real kids will take more than the bots. QA should judge the feel by playing.

## 3. Work-board items
| Item | Owner | Work | Done when |
|---|---|---|---|
| B-T3-TUNE-2a | Programmer | Sim: `lidWhileHelpers` on a boss means player damage to it is 0 while its summoned helpers are alive. Add a "clang" event. Hearth Cook phases changed to the lever-2 pattern. | Test: hits on the cook do 0 while a spark lives and full damage after. Bot run: typical wins 60/60 with an average of 12–15 s, and the masher wins ≥ 75% on Standard. R-BAL-12 bands still pass. |
| B-T3-TUNE-2b | Programmer | Client: the pot lid art/tint and "clang" sound (no damage number), plus a lid icon on the boss bar while it's up. | Screenshot: lid up with sparks out; Reduced motion keeps the lid icon. |
| B-T3-TUNE-2c | Programmer | D3 phase pause: about 1 s game hold at each phase change, with the roar, glow and Sensei phase line (already in content as `senseiLine`). It uses the existing guide-pause hold. | The game holds once at 66% and once at 33%, nothing moves or takes damage, then play resumes. A test checks the hold ticks. |
| B-T3-TUNE-2d | QA | Replay tier 3 with Orange gear, plus one Guided/young tester if possible. | The QA note reports time, HP lost and wins against the target above, and says whether every hit "felt fair". |

## 4. Decisions for Jay
- **J1. Target:** OK with 15–20 s, a newer student losing 15–25% HP, and the 6-year-old winning ≥ 75% on Standard? (Recommend yes.)
- **J2. Pot lid:** OK that the cook can't be hurt while sparks are out? (Recommend yes; it matches the Sensei line.) If not, the D3 pause plus the pin pattern alone gives about 14 s.
- **J3. D3 phase pause now, not after the beta?** (Recommend now; it's cheap and it's the "boss feel".)
- **J4. Hazards:** leave them out of the Hearth Cook for now? (Recommend yes.)

Probe and how to rerun it: `drafts/planning/b-t3-tune-2-probe/`.
