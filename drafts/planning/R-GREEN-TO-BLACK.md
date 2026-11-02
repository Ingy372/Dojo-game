# R-GREEN-TO-BLACK: the plan from Green to Brown/Black

**Status: Batch 1 (merged, PR #401) and Batch 2 (this file's second half).** Written Nov 1, 2026 by the Researcher & Planner. Docs only. No game code.

**What this is.** Jay's content covers everything up to Brown/Black except katas. The board has run dry. This is the plan for turning that content into work. Batch 1 is the first 12 board items (R-G2B-01 to 12). Batch 2 is R-G2B-13 to R-G2B-44, with the long plans in the files linked below.

**Plain words for Jay.** Most of the design is already written (the 40 seals, the 7 Strikes, the monster list, the 10 tower places). What is missing is the building: none of it is in the game yet. Batch 1 starts that, and it starts with the beta belts (White to Orange).

## Where the game is today (checked in the repo, Nov 1)

| Thing | State |
|---|---|
| Tower tiers built | 1 to 3 (White, Yellow, Orange). Orange has its own room set (`ember-kitchens`). Green and up use the shared rooms. |
| Strikes in `content/abilities/abilities.json` | 2 only (Spin Kick Finish, Butterfly Flow). Jumping Spins is not in yet. |
| Seals in `abilities.json` | 10 old placeholder seals. The real #1-40 (design in `S4-self-defense-powers.md`) are not built. |
| Enemy states | Staggered and disarmed exist. **Thrown, locked and pinned do not.** |
| Seal icons | 10 (old placeholders), in `incoming-art/icons`. None for #11-40. |
| Orange seal text (#11-15) | None written. `seals-31-40-text.json` exists for #31-40. |
| Green monsters art | Pebble Pal only (`bestiary-set2`). All 10 Guardian concept pictures exist. |
| Challenge and elites | Already built (they start at the 4th belt, Green). |
| Town pictures | Stop at Blue (PR #399, waiting on Jay). |

## What the redesign settles

Jay's **Power & Progression Redesign** is now in the repo (`drafts/planning/power-and-progression-redesign.md`, copied as Jay wrote it, with his answers inline). It is the source of truth. It settles these things, so the plan no longer marks them as assumptions:

- Technique powers are **equipped in slots, not stacked** ("i agree"). The 6 Seal families are approved. Seal slots are 2 (White, Yellow), 3 (Orange, Green, Blue), 4 (Red and above).
- **S4-self-defense-powers.md is the #1-15 template** (already done). Butterfly Flow is Strike #3, Jumping Spins is #2 (confirmed).
- **Kata powers ship in the beta, passive only.** Jay supplies the powers.
- **After the beta:** Lock and Break Free, padded-staff enemies, Green and above content, activated kata powers, and the Injured and Pinned states. This plan treats Pinned and Injured as **cut until after launch**.
- The loadout screen, the slot rules, the unlock screen and the Sensei's Trial room are in the redesign's beta table. The unlock screen and Sensei's Trial room have owners in `R-PROGRESSION-BETA.md` (PB-13 Programmer, PB-14 Content Designer, PB-15 Artist), so this plan has no items for them.

Still open and not settled by the redesign: the seal family for each technique from #16 on (Jay decides, R-G2B-22), the Strike shapes' final numbers (the test bot sets them), and the Black belt Strikes #8-12 and kata powers (they wait on Jay).

## Batch 1 corrections (found while writing Batch 2)

| Item | What to change |
|---|---|
| R-G2B-07 | Says "5 floors plus the Stone Giant Guardian room". The Orange pattern it tells you to copy is **8 rooms per floor set** (7 rooms plus the Guardian). See `R-G2B-tower-tiers-4-10.md`. Rooms for all of tiers 4-10 are now R-G2B-25 to 27, and R-G2B-07 is the first of them. |
| R-G2B-01 | The redesign says Jumping Spins can be built "from existing settings". The code has only one hit plus an optional chain hit, so three hits with their own strengths is a new setting. That is R-G2B-13. R-G2B-01 already waits on PB-01 to PB-03 (`R-PROGRESSION-BETA.md`) and should also wait on R-G2B-13, or use the one-hit-plus-chain setting as a stand-in. |
| R-G2B-04, 09 | Throw and Lock states: numbers are now in `R-G2B-balance-check.md` section G. Throw passes. Lock needs a **30-tick ceiling**: four stacked Lock ranks make one Perfect Counter about 2.4 times today's. R-G2B-20 carries it. Guardians are never thrown, locked or pushed. |
| R-G2B-08 | "Pebble Pal already exists": it is working art that Jay has not approved. |
| R-G2B-10 | Seal #16 Low-High Strike probably becomes a Counter rank (Conflict 4 in `R-G2B-seal-families-16-40.md`). Write its text after R-G2B-22 answers it. #17-20 can be written now. |
| R-G2B-11 | Merged already. Its Welcome Week file puts Pinned, Release and Injured after launch, which matches the redesign. Nothing to change. (The rules line below is fixed.) |
| Rules, last line | "Batch 1 has no new numbers" stays true. Batch 2 numbers come only from `r-g2b-balance-check.py`. |

## Scope risk key

- **BETA** means it is needed for the Dec 15, 2026 beta (5-10 tester families, White to Orange only, per `BETA-DEC15-plan.md`).
- **LAUNCH** means it is needed for the April 2027 launch (kata Possi, self-defense #40, Strike #7).
- Risk tag: **LOW** (small, no unknowns), **MED** (could slip a week), **HIGH** (could slip the date).
- The cut line for the beta: if time runs short, ship seals #1-10 and Strikes #1-2, and move Orange seals #11-15 and Strike #3 to after the beta.

## Batch 1

Beta items first (01 to 06). Then Green and up (07 to 12).

### Beta (White to Orange)

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-01** | Programmer | Add Strike #2 **Jumping Spins** (new `strikeRipple`) and move **Butterfly Flow** to #3. Use the numbers in `S4-kick-combos.md` as placeholders. Old saves must still load. | A Yellow profile has Spin Kick Finish and Jumping Spins. An Orange profile also has Butterfly Flow. A test shows a save with the old `quick-combo` still loads. Tests pass. | nothing | BETA. MED: touches Strike order for every profile. |
| **R-G2B-02** | Content Designer | Write the kid text for seals **#11-15** (Orange) in the same format as `seals-31-40-text.json`: name, one sentence under 80 characters for ages 6-9, and the callout. Also check the #1-10 callout subtitles in `technique-callouts.json` against the real names in `docs/self-defense.md` and list any that differ (S4 says "Off the Line", the callouts say "Off-Balance"). | New file `drafts/content/abilities/seals-11-15-text.json` has 5 entries. A short list of name clashes for #1-10 is in the Delivery Note. The word check passes (no "break" outside Break Free, no injury words). | nothing | BETA. LOW. Effect wording may change once R-PROGRESSION-BETA fixes the families. Mark any line that does. |
| **R-G2B-03** | Artist | Draw medallion icons for seals **#11-15** and a Strike icon for **Jumping Spins**, in the approved icon families in `incoming-art/icons`. | 6 icons, 128 x 128, transparent, in a new `incoming-art/icons-orange/` with `README.md`, margin check, preview and Delivery Note. Jay-approvable at a glance on a phone-size preview. | nothing | BETA. LOW. (Icons for the old #1-10 are Batch 2: they need to match the real techniques.) |
| **R-G2B-04** | Programmer | Build the enemy **thrown** state (it tumbles 1 tile and is down for a set time) and the two effects that use it: `counterThrow` (#11) and `downBonus` (#12). Brutes and swarmers only. Never Guardians or elites. | A Perfect Counter with #11 throws a brute in a test. A thrown enemy takes the #12 bonus while down. A Guardian is never thrown. Tests pass. | nothing for the engine. Final numbers wait on the Batch 2 tuning check. | BETA. MED. Cut line: moves to after the beta if R-G2B-01 runs long. |
| **R-G2B-05** | Learning & Engagement Designer | Review R-G2B-02's text and the Throw idea for age 6+ and for overwhelm. Write one Sensei lesson line (one sentence per screen) that teaches Takedown/Throw, using the "one new system per session" rule. | Note `drafts/planning/R-G2B-learning-review-1.md`: pass or fix for each of the 5 texts, plus the Throw lesson lines. Nothing in it is pressure, a reward for spending, or a chat. | R-G2B-02 | BETA. LOW. |
| **R-G2B-06** | Tester | Write the beta test plan for the Batch 1 builds: Strike order in Yellow and Orange profiles, an old save, the Throw state, callouts on screen, Guided, Standard and Challenge, and reduced motion. | `drafts/planning/R-G2B-test-plan-1.md` has at least 20 numbered cases, each with steps and a pass line. Cases for R-G2B-01 and R-G2B-04 are marked "run when merged". | nothing (writing it). Running it waits on R-G2B-01 and R-G2B-04. | BETA. LOW. |

### Green and up (after the beta)

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-07** | Content Designer | Lay out the **Tier 4 Green "Giant's Steps"** room set: 5 floors plus the Stone Giant Guardian room, using the enemy bands in `bestiary-plan.md` (Pebble Pal, Cliff Goat, Stack Golem, Boulder Roller). Copy the pattern of the Orange set. No stats yet. | Draft room files and a floor-by-floor table in `drafts/content/rooms/`. The existing check tools pass. Each floor says which enemies appear and where the dash-only Boulder Roller is. | nothing | LAUNCH, not BETA. MED. Stats are Batch 2. |
| **R-G2B-08** | Artist | Draw Green enemy set A: **Cliff Goat, Stack Golem, Boulder Roller** (Pebble Pal already exists). The Boulder Roller's dash-only warning must use the purple stripes with "!!" in the house style. | New `incoming-art/bestiary-green-a/` with sprites, previews, README and Delivery Note. | nothing | LAUNCH. MED. The Stone Giant concept already exists in `guardian-concepts`. |
| **R-G2B-09** | Programmer | Build the enemy **locked** state for **Arm Bar #17** (`counterLock`): a locked enemy can't block or shield. Put the **Break Free** hook (#29) in the same place, switched off. | A Perfect Counter with #17 locks a shield enemy and its shield stops working until the lock ends. A test shows a Guardian is never locked. | R-G2B-04 (same state code) | LAUNCH. MED. Break Free itself is Batch 2. |
| **R-G2B-10** | Content Designer | Kid text for seals **#16-20** (Green), same format as R-G2B-02. Names follow `docs/self-defense.md`. | New `drafts/content/abilities/seals-16-20-text.json`, 5 entries, word check passes. | nothing (a family mapping from R-PROGRESSION-BETA may change a line later) | LAUNCH. LOW. |
| **R-G2B-11** | Learning & Engagement Designer | Plan how a player **learns Lock and Break Free**, and the **Welcome Week** order for a Brown belt who gets seals #1-40 on day one. Group the seals so no day has more than one new idea. | Note `drafts/planning/R-G2B-lock-and-welcome.md`: lesson lines for Lock and Break Free (kid words, nothing scary), and a day-by-day Welcome Week list. | nothing | LAUNCH. LOW. |
| **R-G2B-12** | Tester | Play a **Green profile today** (shared rooms, elites and Challenge already on) on Guided, Standard and Challenge. Write down what a Green student sees now and what is missing. | `drafts/planning/R-G2B-green-baseline.md` with 3 short play logs, a list of what is shared white-belt content, and any bugs found. | nothing | LAUNCH. LOW. It tells Batch 2 where Green really stands. |

## Rules every item follows

- No purchases, ads, chat, loot boxes or pressure. Real training stays the main source of power. Ages 6+, hopeful.
- Wind-up ticks never scale (at least 10). Dash-only attacks use purple stripes with "!!" and at least 20 ticks.
- Difficulty (Guided, Standard, Challenge) is tuned through content, not bigger numbers.
- "Break" only appears in "Break Free". Injury words wait for the cartoon Injured status, which is cut until after launch.
- Any new tuning number needs the balance-check across all belts and all difficulties (`python3 drafts/planning/r-g2b-balance-check.py`). **Batch 1 has no new numbers.** Batch 2 proposes only the Health fix in R-G2B-19 and the Lock ceiling in R-G2B-20, both checked.

## Batch 2

Long plans and tables: `R-G2B-strikes-4-7.md`, `R-G2B-seal-families-16-40.md`, `R-G2B-balance-check.md` (with `r-g2b-balance-check.py`), `R-G2B-tower-tiers-4-10.md`, `R-G2B-art-plan.md`. Katas wait on Jay (Pinon 1-3, Nahanchi, Possi). The Black belt Strikes #8-12 and Possi's seals #41-45 wait on Jay too, so tiers 9 and 10 have no new move to show off.

### Strikes

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-13** | Programmer | Give a Strike a **list of hits, each with its own strength, and a wind-up before it lands**. Today a Strike has one hit, an optional chain hit and no wind-up. Jumping Spins (#2) and Butterfly Flow (#3, "slower to land") need it. Strength numbers are placeholders. | A test Strike with 3 hits (own strengths) and a wind-up works and old saves load. Spin Kick still does exactly what it does today. Tests pass. | nothing | BETA. MED: R-G2B-01 and the Strike order depend on it. |
| **R-G2B-14** | Tester | Run the test bot on Strikes #1-3: the **Budget, Spread and Newest-move** tests from the redesign, on Guided, Standard and Challenge. Fix the three Jumping Spins strengths and Butterfly Flow's wind-up. Check the Jumping Spins 5/7/12 ramp (the units are not clear in the draft). | A table in `drafts/planning/` with the numbers that pass, and the Spin Kick baseline unchanged. | R-G2B-13, R-G2B-01 | BETA. MED. |
| **R-G2B-15** | Programmer | Build the launch Strikes **#4 Side Kick Drive** (push), **#5 Hook Kick** (hits the enemy behind a guard), **#6 Lunge** (longer lunge, a setting that exists), **#7 Spinning Finisher** (ring of hits). The five engine gaps are listed in `R-G2B-strikes-4-7.md`. Hook Kick's meaning waits on taste call 1. | Each Strike works in a test against the enemies named in the file. Guardians are never pushed. No change to a global switch like `shieldBreaker`. Tests pass. | R-G2B-13. Hook Kick: Jay's taste call 1. | LAUNCH. HIGH: needs targeting and push, both new. |
| **R-G2B-16** | Content Designer | Names, kid text and unlock lines for Strikes #3-7. Uses the Strike names Jay picks in taste call 2 (redesign shapes, or the real combo names). Check the Low-High clash with seal #16. | `drafts/content/abilities/strikes-3-7-text.json` with 5 entries, word check passes ("break" only in "Break Free"). | Jay's taste call 2 | LAUNCH. LOW. |
| **R-G2B-17** | Tester | Same as R-G2B-14 for Strikes #4-7. | A table of passing numbers. | R-G2B-15 | LAUNCH. MED. |

### Numbers and the balance check

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-18** | Tester | **Elite Brute and elite Shield on Challenge** are 22-25 hits and 11-12 hits against tops of 20 and 10, on every belt. Run the sim and say if this is OK, or give a number that passes every belt and difficulty. | A note with a table and a yes or a number. The Content Designer does not change `elites.json` before this. | nothing | LAUNCH. LOW. |
| **R-G2B-19** | Content Designer | Apply the proven fix to the draft files: the 6 failing Guardians (Stone Giant, River Watcher, Ember Knight, Echo Mask, Root Keeper, Storm Herald) get base Health **495**, and Stack Golem gets **128**. Lost Lightbearer already passes at 510 and can stay. | `python3 drafts/planning/r-g2b-balance-check.py` shows 0 failing cells. | nothing | LAUNCH. LOW. Another bot owns those files, so it is a proposal until they agree. |

### Self-defense Seals #16-40, Lock and Break Free

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-20** | Programmer | Build **Lock** ranks on top of the locked state from R-G2B-09: **20 ticks growing to a 30-tick ceiling**, the "no blocking or shield" rule, and the lock effects (#28, #31, #32, #33, #35, #36, #37, #39, #40). Never on Guardians. | A test shows 4 stacked Lock ranks never exceed 30 ticks and a Perfect Counter with them stays under 5 basic-hit equivalents (`R-G2B-balance-check.md`, section G). | R-G2B-09, R-G2B-22 | LAUNCH. HIGH: the biggest new mechanic. Ceiling is built on guess durations, so the bot must confirm. |
| **R-G2B-21** | Programmer | Build **Break Free** (#29, #30): Block with 2 or more enemies within 1 tile pushes them back 1.5 tiles. Never on Guardians. It needs a cooldown. | A test shows the push, the cooldown and that a Guardian is never pushed. The cooldown number comes from the test bot, not from this plan. | R-G2B-09 hook, R-G2B-24 (for the cooldown) | LAUNCH. MED. |
| **R-G2B-22** | Manager (for Jay) | Put the **family list and 6 open questions** to Jay in `R-G2B-seal-families-16-40.md`: Drive Back needs a push (#4), Escape from Behind (#25), Low-High Strike (#16), ranks that need another family (#26, #34, #37, #38, #40), the placeholder Seals' new homes, and Wrist Lock (#19) listed under Lock but built like a Disarm. Jay answers each in one line. | The doc has Jay's answers. | nothing | LAUNCH. LOW. It blocks R-G2B-10, 20, 23. |
| **R-G2B-23** | Programmer | Build the **small new effect kinds** that survive R-G2B-22 (`counterHits`, `counterPush`, `reflectStaggers`, `disarmAttacks`, and the small flags in the table). Recast any that do not fit. | Each Seal #1-10 and #16-40 does what its row says in a test. | R-G2B-22 | #1-10: BETA. #16-40: LAUNCH. MED. |
| **R-G2B-24** | Tester | Run **Budget, Spread and Newest-move** for every slot with Seals #16-40, and the **Curve** test across belts. Give the Break Free cooldown. | A table with each technique inside the budget and spread, or a list of numbers to change. | R-G2B-20, 21, 23 | LAUNCH. MED. |

### Tower tiers 4-10

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-25** | Content Designer | Room sets for **Green and Blue** (8 rooms each, Ember pattern). Replaces the "5 floors" wording in R-G2B-07 (do that item as part of this). Padded-staff Boppers in rooms 3-4 and the challenge room. | Draft room files and a table per tier in `drafts/content/rooms/`. Existing check tools pass. | nothing | LAUNCH. MED. |
| **R-G2B-26** | Content Designer | Room sets for **Red and Red/Black**: crowd rooms for Break Free, a Masklet-circle room for Spinning Finisher. | As above. | nothing | LAUNCH. MED. |
| **R-G2B-27** | Content Designer | Room sets for **Brown, Brown/Black and Black**. | As above. | nothing | LAUNCH. MED. |
| **R-G2B-28** | Programmer | **Elites for the new enemies.** `elites.json` lists only Brute, Swarmer and Shield, so no new enemy can be an elite. Decide the list with the Content Designer and add it. | Elites can appear in tiers 4-10 rooms. Elites keep the live rules. | R-G2B-18 | LAUNCH. LOW. |
| **R-G2B-29** | Programmer | Build the **new enemy behaviours**: charger, hopper, sneak, pusher, mirror, burrower, zoner, turret, and the dash-only shapes (wave lane, arc, ring, zig-zag). Use `bestiary-plan.json`. | Each of the 28 enemies spawns, shows its tell and does its attack in a test. No wind-up shorter than 10 ticks. Dash-only tells at least 20 ticks. | R-G2B-19 | LAUNCH. HIGH. |
| **R-G2B-30** | Programmer | Build the **7 Guardian fights** with their phases (see the tower doc). Never locked, thrown or pushed. | Each Guardian beats in the bot's target range (40-80 hits, KO at least 5). | R-G2B-19, R-G2B-29 | LAUNCH. HIGH. |
| **R-G2B-31** | Tester | Run the **balance check on endless mode** after the Black Summit (+3% per floor, no cap in the bestiary plan). | Note saying when endless gets too hard, and a cap if needed. | nothing | LAUNCH. LOW. |
| **R-G2B-32** | Tester | Find the **wind-up of the Masklet** (and other swarm enemies). Seal #35 Catch the Hand needs a quick attacker (wind-up 12 or less). | A short note. If it is above 12, ask Jay to reword #35. | nothing | LAUNCH. LOW. |

### Art

| ID | Owner | What | Done when | Waits on | Scope and risk |
|---|---|---|---|---|---|
| **R-G2B-33** | Artist | Blue enemies: Puddle Frog, Mist Wisp, Side Crab, Splash Wave (lane drawn as a wave). | `incoming-art/bestiary-blue/` with sprites, previews, README, Delivery Note. | nothing | LAUNCH. MED. |
| **R-G2B-34** | Artist | Red enemies: Coal Cub, Anvil Imp, Bellows Puff, Forge Sweeper (arc). | `incoming-art/bestiary-red/`, same format. | nothing | LAUNCH. MED. |
| **R-G2B-35** | Artist | Red/Black enemies: Masklet, Copycat Shade, Hush Guard, Echo Bell (ring with a glowing gap). | `incoming-art/bestiary-red-black/`. | nothing | LAUNCH. MED. |
| **R-G2B-36** | Artist | Brown enemies: Page Flutter, Bookworm, Ink Blot, Root Snapper. | `incoming-art/bestiary-brown/`. | nothing | LAUNCH. MED. |
| **R-G2B-37** | Artist | Brown/Black enemies: Cloud Puff, Gust Sprite, Thunder Drum, Zap Kite (zig-zag). | `incoming-art/bestiary-brown-black/`. | nothing | LAUNCH. MED. |
| **R-G2B-38** | Artist | Black enemies: Storm Wisp, Rumble Brute, Echo Knight, Sky Sweeper (arc then lane). | `incoming-art/bestiary-black/`. | nothing | LAUNCH. MED. |
| **R-G2B-39** | Artist | Final sprites for the 7 Guardians (phases 1-3 and the form shifts for Stone Giant, Storm Herald, Lost Lightbearer). | `incoming-art/guardians-green-black/`. | **Jay's final OK of the concept sheets** | LAUNCH. HIGH. |
| **R-G2B-40** | Artist | Room kit for Green and Blue (like `tier3-ember-kitchens`). | `incoming-art/tower-rooms-t4-t5/` with previews for all 8 rooms of each. | R-G2B-25 | LAUNCH. MED. |
| **R-G2B-41** | Artist | Room kit for Red and Red/Black. | `incoming-art/tower-rooms-t6-t7/`. | R-G2B-26 | LAUNCH. MED. |
| **R-G2B-42** | Artist | Room kit for Brown, Brown/Black and Black. | `incoming-art/tower-rooms-t8-t10/`. | R-G2B-27 | LAUNCH. MED. |
| **R-G2B-43** | Artist | **Finish the Seal family art for #16-40**: PB-07 already draws 5 family medallions and a Lock silhouette (it replaced R-G2B-03). This item adds the **full Lock medallion** and the **rank-pip strip** (rank 1 to 10 per family), so no per-technique icons are needed for #1-10 and #16-40 (Jay can overrule, see `R-G2B-art-plan.md`). | Files added to `incoming-art/icons-slots/` (or a sibling folder) with a 48 pt phone preview and a grey-scale check. | PB-07, R-G2B-22 (family list) | Pips for #1-15: BETA. Lock: LAUNCH. LOW. |
| **R-G2B-44** | Artist | Strike icons for #3, #4, #5, #6, #7. PB-07 already draws the Strike glyph and Jumping Spins (#2); #1 Spin Kick needs checking against it. | 5 icons (plus #1 if PB-07 left it out), 128 x 128, in `incoming-art/icons-strikes/`. | PB-07 | #3: BETA. #4-7: LAUNCH. LOW. |

## Questions for Jay (none block Batch 1)

1. (Answered: S4 is the #1-15 template. The redesign doc is in the repo.)
2. For the beta: OK with the cut line above (seals #1-10 and Strikes #1-2 must ship; Orange seals #11-15 and Strike #3 move to after the beta if time runs out)?
3. **Taste call 1.** What does "break guards" mean for a Strike (Hook Kick #5)? Options A to D are in `R-G2B-strikes-4-7.md`. Planner's lean: A (hit the enemy behind the guard).
4. **Taste call 2.** Strike names: the redesign shapes (Spin Kick, Jumping Spins, Butterfly Flow, Side Kick Drive, Hook Kick, Lunge, Spinning Finisher) or the real combo names? This also settles the Low-High clash with seal #16. Planner's lean: redesign shapes, with the real combo name in the "In the dojo:" line.
5. The family for each Seal from #16 on, and the 6 open questions (R-G2B-22).
6. Seal icons: 6 family medallions with rank pips, or one drawing per technique? (R-G2B-43.) Planner's lean: families.
7. Jay's final OK on the 10 Guardian concept sheets (R-G2B-39).
8. Tiers 9 and 10 have no new move to show off. Black belt Strikes #8-12 and Possi's seals #41-45 wait on you.
