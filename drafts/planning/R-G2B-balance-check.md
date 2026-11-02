# R-G2B: balance check for the Green-to-Black enemies, Guardians and the new control moves

Written Nov 1, 2026 by the Researcher & Planner (balance-check skill). Docs only, no game code. **Repeat it any time:** `python3 drafts/planning/r-g2b-balance-check.py`. The script reads the real numbers from the repo, so a table here is never copied by hand.

**In plain words.** Every new enemy and Guardian for Green to Black was checked at every belt it can appear at (its own belt up to Black), for three kinds of student (the model "typical", "trains more" and "plays only" kids), on Guided, Standard and Challenge. Result: **35 enemies and Guardians (28 enemies and 7 Guardians) gave 1,260 checks. Only 25 fail, and all of them are the same single case**: the "trains more" student on Challenge. The fix is small and every belt passes with it (section E). The control moves (Throw, Lock) also hit a ceiling: stacking all Lock ranks gives one Perfect Counter about 2.4 times today's, enough to beat a mid enemy in one go. That needs a cap (section G).

## What was checked, and how

- **Enemy numbers on disk are white-belt base numbers.** A run at belt N multiplies Health and Power by row N-1 of `ENEMY_TRAINING_SCALE` (`config.ts`). Guard and timings never scale.
- **Students** are the 3 pinned model students in `packages/sim/test/r-bal-12-artists.ts` (belts 1-10).
- **Difficulty:** Guided = enemy Power x0.75. Standard = x1. Challenge = Health and Power x1.5, from belt 4 only (Green).
- **Damage formula** (`packages/sim/src/combat.ts`): `max(1, round(power x strength x 100 / (100 + guard) x (1 + bonus)))`.
- **Targets (bands):** Small enemy 2-4 hits to beat, a mid enemy 5-10, a heavy 10-20, a Guardian 40-80. How many hits the enemy needs to knock the student out: at least 12 (small), 8 (mid), 5 (heavy and Guardian). These are the same bands as `r-bal-12-bands.test.ts`.
- **Role to band:** swarm = small. Heavy (Stack Golem, Anvil Imp, Rumble Brute) = heavy. Everything else (charger, hopper, sneak, pusher, guard, turret, zoner, burrower, mirror, dash-only) = mid. Guardians = Guardian band.
- **Tiers 1-3 are not repeated here.** They are live and already covered by `r-bal-12-bands.test.ts`.
- **Not covered:** how often a student wins a whole run. That needs the sim bot, which needs the repo's `node_modules`. Item R-G2B-14 and R-G2B-17 run it. The Guardians' own attack strengths are not in the table (the repo test does not include them either).

## A. Every new enemy and Guardian, every belt, 3 students, 3 difficulties

"Beat hits" is the lowest and highest hits to beat across all cells. "Lowest KO" is the fewest hits the enemy needs to knock the student out.

| Tier | Enemy | Class | Base H/P/G | Beat hits (all cells) | Band | Lowest KO hits | Min KO | Cells | Fails |
|---|---|---|---|---|---|---|---|---|---|
| Green | pebble-pal | small | 21/7/0 | 2-3 | 2-4 | 12 | 12 | 63 | 0 |
| Green | cliff-goat | mid | 60/11/5 | 5-8 | 5-10 | 8 | 8 | 63 | 0 |
| Green | stack-golem | heavy | 129/19/25 | 12-21 | 10-20 | 5 | 5 | 63 | 1 |
| Green | boulder-roller | mid | 71/11/10 | 6-10 | 5-10 | 8 | 8 | 63 | 0 |
| Green | stone-giant | boss | 532/16/30 | 50-86 | 40-80 | 5 | 5 | 63 | 7 |
| Blue | puddle-frog | mid | 59/11/5 | 5-8 | 5-10 | 8 | 8 | 54 | 0 |
| Blue | mist-wisp | mid | 62/11/0 | 5-8 | 5-10 | 8 | 8 | 54 | 0 |
| Blue | side-crab | mid | 63/11/20 | 6-10 | 5-10 | 8 | 8 | 54 | 0 |
| Blue | splash-wave | mid | 69/11/10 | 6-10 | 5-10 | 8 | 8 | 54 | 0 |
| Blue | river-watcher | boss | 521/16/30 | 50-85 | 40-80 | 5 | 5 | 54 | 6 |
| Red | coal-cub | small | 21/7/0 | 2-3 | 2-4 | 12 | 12 | 45 | 0 |
| Red | anvil-imp | heavy | 126/19/25 | 12-20 | 10-20 | 5 | 5 | 45 | 0 |
| Red | bellows-puff | mid | 66/11/15 | 6-10 | 5-10 | 8 | 8 | 45 | 0 |
| Red | forge-sweep | mid | 69/11/10 | 6-10 | 5-10 | 8 | 8 | 45 | 0 |
| Red | ember-knight | boss | 521/16/30 | 50-85 | 40-80 | 5 | 5 | 45 | 5 |
| Red/Black | masklet | small | 20/7/0 | 2-3 | 2-4 | 12 | 12 | 36 | 0 |
| Red/Black | copycat-shade | mid | 67/11/10 | 6-10 | 5-10 | 8 | 8 | 36 | 0 |
| Red/Black | hush-guard | mid | 61/11/20 | 6-10 | 5-10 | 8 | 8 | 36 | 0 |
| Red/Black | echo-bell | mid | 67/11/10 | 6-10 | 5-10 | 8 | 8 | 36 | 0 |
| Red/Black | echo-mask | boss | 510/16/30 | 50-83 | 40-80 | 5 | 5 | 36 | 3 |
| Brown | page-flutter | small | 20/7/0 | 2-3 | 2-4 | 12 | 12 | 27 | 0 |
| Brown | bookworm | mid | 52/11/15 | 5-8 | 5-10 | 8 | 8 | 27 | 0 |
| Brown | ink-blot | mid | 57/11/5 | 5-8 | 5-10 | 8 | 8 | 27 | 0 |
| Brown | root-snapper | mid | 67/11/10 | 6-9 | 5-10 | 8 | 8 | 27 | 0 |
| Brown | root-keeper | boss | 510/16/30 | 50-81 | 40-80 | 5 | 5 | 27 | 2 |
| Brown/Black | cloud-puff | small | 20/7/0 | 2-3 | 2-4 | 12 | 12 | 18 | 0 |
| Brown/Black | gust-sprite | mid | 64/11/15 | 6-9 | 5-10 | 8 | 8 | 18 | 0 |
| Brown/Black | thunder-drum | mid | 55/11/10 | 5-8 | 5-10 | 8 | 8 | 18 | 0 |
| Brown/Black | zap-kite | mid | 67/11/10 | 6-9 | 5-10 | 8 | 8 | 18 | 0 |
| Brown/Black | storm-herald | boss | 510/16/30 | 50-81 | 40-80 | 5 | 5 | 18 | 1 |
| Black | storm-wisp | small | 20/7/0 | 2-3 | 2-4 | 12 | 12 | 9 | 0 |
| Black | rumble-brute | heavy | 124/19/25 | 12-19 | 10-20 | 5 | 5 | 9 | 0 |
| Black | echo-knight | mid | 61/11/20 | 6-9 | 5-10 | 8 | 8 | 9 | 0 |
| Black | sky-sweeper | mid | 67/11/10 | 6-9 | 5-10 | 8 | 8 | 9 | 0 |
| Black | lost-lightbearer | boss | 510/16/30 | 50-80 | 40-80 | 5 | 5 | 9 | 0 |

## B. The failing numbers

- stack-golem (heavy): 1 fails; e.g. belt 7 trainsMore challenge beat 21 KO 6
- stone-giant (boss): 7 fails; e.g. belt 4 trainsMore challenge beat 85 KO 7; belt 5 trainsMore challenge beat 86 KO 7; belt 6 trainsMore challenge beat 85 KO 7; belt 7 trainsMore challenge beat 86 KO 7
- river-watcher (boss): 6 fails; e.g. belt 5 trainsMore challenge beat 85 KO 7; belt 6 trainsMore challenge beat 83 KO 7; belt 7 trainsMore challenge beat 85 KO 7; belt 8 trainsMore challenge beat 83 KO 7
- ember-knight (boss): 5 fails; e.g. belt 6 trainsMore challenge beat 83 KO 7; belt 7 trainsMore challenge beat 85 KO 7; belt 8 trainsMore challenge beat 83 KO 7; belt 9 trainsMore challenge beat 82 KO 7
- echo-mask (boss): 3 fails; e.g. belt 7 trainsMore challenge beat 83 KO 7; belt 8 trainsMore challenge beat 81 KO 7; belt 9 trainsMore challenge beat 81 KO 7
- root-keeper (boss): 2 fails; e.g. belt 8 trainsMore challenge beat 81 KO 7; belt 9 trainsMore challenge beat 81 KO 7
- storm-herald (boss): 1 fails; e.g. belt 9 trainsMore challenge beat 81 KO 7
TOTAL failing cells: 25

All 25 are the "trains more" student on Challenge. The same thing happens today with the live Hearth Cook (a known exception in `r-bal-12-bands.test.ts`, B-T3).

## C. Neighbouring belts: no jump bigger than 2x

Hits to beat, typical student, Standard. The trend is flat on purpose: enemy numbers scale with the student.

| Belt | small (pebble-pal) | mid (cliff-goat) | heavy (stack-golem) | boss (stone-giant) |
|---|---|---|---|---|
| White | 2 | 5 | 12 | 52 |
| Yellow | 2 | 5 | 12 | 48 |
| Orange | 2 | 5 | 12 | 49 |
| Green | 2 | 5 | 12 | 50 |
| Blue | 2 | 5 | 12 | 51 |
| Red | 2 | 5 | 12 | 51 |
| Red/Black | 2 | 5 | 13 | 52 |
| Brown | 2 | 5 | 13 | 52 |
| Brown/Black | 2 | 5 | 13 | 52 |
| Black | 2 | 5 | 13 | 52 |
jumps over 2x between neighbouring belts for small: none
jumps over 2x between neighbouring belts for mid: none
jumps over 2x between neighbouring belts for heavy: none
jumps over 2x between neighbouring belts for boss: none

## D. Elites (live content, belts 4-10)

brute elite: 21 cells outside band; e.g. [(4, 'typical', 'challenge', 22, 6), (4, 'trainsMore', 'challenge', 25, 6), (4, 'playsOnly', 'challenge', 22, 5)]
swarmer elite: 0 cells outside band
shield elite: 21 cells outside band; e.g. [(4, 'typical', 'challenge', 11, 9), (4, 'trainsMore', 'challenge', 12, 9), (4, 'playsOnly', 'challenge', 11, 8)]

**Finding:** on Challenge, an elite Brute takes 22-25 hits (top of the band is 20) and an elite Shield takes 11-12 (top is 10), on every belt from Green to Black. The elite's +25% Health has no room left on Challenge for these two. Swarmer elites pass. This is live content, so it is a question for the test bot, not an edit here (item R-G2B-18).

## E. The fix, and proof that every belt passes

stack-golem: now 129; fails are all trainsMore+Challenge: True; passing base maxHealth: 101-128
stone-giant: now 532; fails are all trainsMore+Challenge: True; passing base maxHealth: 420-495
river-watcher: now 521; fails are all trainsMore+Challenge: True; passing base maxHealth: 411-495
ember-knight: now 521; fails are all trainsMore+Challenge: True; passing base maxHealth: 411-495
echo-mask: now 510; fails are all trainsMore+Challenge: True; passing base maxHealth: 403-495
root-keeper: now 510; fails are all trainsMore+Challenge: True; passing base maxHealth: 403-504
storm-herald: now 510; fails are all trainsMore+Challenge: True; passing base maxHealth: 403-509

**Proposal (only where every belt, student and difficulty passes, checked by the script):**

| Enemy | Base maxHealth now | Proposed | Result with the proposal |
|---|---|---|---|
| Stack Golem | 129 | **128** | 0 fails. Beat 12-20, KO at least 5 |
| 6 failing Guardians, plus Lost Lightbearer for one shared number (Lost Lightbearer already passes at 510, so it is optional) (Stone Giant, River Watcher, Ember Knight, Echo Mask, Root Keeper, Storm Herald, Lost Lightbearer) | 532, 521, 521, 510, 510, 510, 510 | **495** (the same as the live Floor Keeper) | 0 fails. Beat 47-80, KO at least 5 |

The alternative is to keep the numbers and accept the Hearth Cook-style exception for those Guardians and the Stack Golem. Planner's lean: use the proposal, it is a one-number change and it matches the live Floor Keeper. The draft files in `drafts/content/` are not edited here (item R-G2B-19 does it).

## F. Spin Kick baseline for the Strike bot run

Spin Kicks needed to beat each class, typical student, shown as Standard / Challenge. Spin Kick (strength 2.5) is the Strike budget the redesign uses as the baseline.

| Belt | small (pebble-pal) | mid (cliff-goat) | heavy (stack-golem) | boss (stone-giant) |
|---|---|---|---|---|
| Green | 1 / 1 | 2 / 3 | 5 / 7 | 20 / 30 |
| Blue | 1 / 1 | 2 / 3 | 5 / 8 | 21 / 31 |
| Red | 1 / 1 | 2 / 3 | 5 / 8 | 21 / 31 |
| Red/Black | 1 / 1 | 2 / 3 | 5 / 8 | 21 / 32 |
| Brown | 1 / 1 | 2 / 3 | 5 / 8 | 21 / 32 |
| Brown/Black | 1 / 1 | 2 / 3 | 5 / 8 | 21 / 32 |
| Black | 1 / 1 | 2 / 3 | 5 / 8 | 21 / 31 |

## G. Control moves: one Perfect Counter, Throw and Lock

**These durations are the S4 guesses, not decided numbers.** The test bot sets the real ones (redesign rule 5). What this table adds is a ceiling check, from the repo's real numbers: a basic hit every 12 ticks, a Perfect Counter hit of strength 2, a built stagger of 20 ticks. A "package" is the Perfect Counter hit plus the free basic hits during the lock or knock-down, in basic-hit units.

| Stage | Free basic hits | Package | x baseline | step jump |
|---|---|---|---|---|
| Built today: stagger 20 | 1 | 3.00 | 1.00 |  |
| Lock #17 (20 ticks) | 1 | 3.00 | 1.00 | 1.00 |
| + #28 Four-Corner Lock (30) | 2 | 4.00 | 1.33 | 1.33 |
| + #31 Arm Bar Release (40) | 3 | 5.00 | 1.67 | 1.25 |
| + #40 Master Hold (50) | 4 | 6.00 | 2.00 | 1.20 |
| + #32 locked take +15% (50) | 4 | 6.60 | 2.20 | 1.10 |
| + Counter #10 staggerBonus +15% too | 4 | 7.20 | 2.40 | 1.09 |
| Throw #11 (down 30) | 2 | 4.00 | 1.33 |  |
| + #12 downBonus +25% (30) | 2 | 4.50 | 1.50 | 1.12 |

Share of one enemy's health taken by the full-stack Lock package (7.2 basic hits) vs hits-to-beat, Standard, every belt 4-10, all students:
  cliff-goat (mid, beats in 5-10 hits): 120%-144% of its health from one Perfect Counter
  stack-golem (heavy, beats in 10-20 hits): 51%-60% of its health from one Perfect Counter
  pebble-pal (small, beats in 2-4 hits): 360%-360% of its health from one Perfect Counter

**What it shows:**
- Each rank step is small (1.09-1.33x). **No single step is a problem.**
- **Stacked together, they are.** The full Lock line (20 +10 +10 +10 ticks, the two damage bonuses) is 2.4 times today's Perfect Counter, over the 2x line from the balance-check rules. In health terms, one Perfect Counter would take 120-144% of a mid enemy's health on every belt from Green to Black. A mid enemy is meant to take 5-10 hits.
- Throw (#11-12) stays at 1.33-1.5x. It passes.
- **Proposal:** the lock window (built stagger plus every Lock rank) stops growing at 30 ticks. At 30 ticks with both damage bonuses the package is 4.6, under the 5-hit minimum of a mid enemy. The +10 ranks (#28, #31, #40) then change what the lock does (push back at release, throw at release, the Focus gain) and not how long it lasts. This changes three S4 rows, so the test bot confirms it with the Lock build (R-G2B-20). It is a number in guesses, not a decision.
- Bosses and Guardians are never locked or thrown (already proposed in R-G2B-04 and R-G2B-09). Without that, one Lock would take about half of a Guardian's required hits away.

## Summary

| Check | Result |
|---|---|
| 35 new enemies and Guardians (28 enemies, 7 Guardians), belts 4-10, 3 students, 3 difficulties | 25 fails of 1,260 checks. All "trains more" on Challenge. Fix proposed and proven. |
| Jumps over 2x between neighbouring belts | None |
| Elites on Challenge (Brute, Shield) | Out of band by 10-25% on every belt. Question for the bot. |
| Throw ranks | Pass |
| Lock stack | Needs a 30-tick ceiling. Proposed. |
| Strike numbers | None invented. The bot sets them from the Spin Kick baseline (section F). |
