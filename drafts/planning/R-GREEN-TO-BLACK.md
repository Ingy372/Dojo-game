# R-GREEN-TO-BLACK: the plan from Green to Brown/Black

**Status: Batch 1, rest in progress.** Written Nov 1, 2026 by the Researcher & Planner. Docs only. No game code.

**What this is.** Jay's content covers everything up to Brown/Black except katas. The board has run dry. This is the plan for turning that content into work. Batch 1 is the first 12 board items, so people can start. Batch 2 (phase 2) has the rest.

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

## What is not in the repo (please point me to it)

- **R-PROGRESSION-BETA** is being written in parallel. This plan does not repeat it. It owns the slot system (2 slots at White and Yellow, 3 at Orange), loadouts, the 6 Seal families and the passive kata powers. Items below that touch seal effects say so.
- **The "Power & Progression Redesign" doc** and a "self-defense #1-15 template" file were not found on main, in any branch or in any PR title. I used the S4 table rows #1-15 as the template. If a different file exists, the Manager should send me the path and I will check Batch 1 against it.

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
- "Break" only appears in "Break Free". Injury words only through the cartoon Injured status (#31-40, after launch).
- Any new tuning number needs the balance-check across all belts and all difficulties. **Batch 1 has no new numbers.** The ones it uses are already in the S4 drafts and are placeholders.

## Batch 2 (in progress, not written yet)

- Strikes #4-7. Strike #7 (Axe and Hook) still needs a Programmer check of a Strike-only guard break in `hurtEnemy`.
- Self-defense families and ranks for #16-40, including Lock and Break Free (#29, #30, #39) and the Pinned state.
- Tiers 4 to 10: floors, enemies, Guardians, and the art for each.
- Seal icons for #1-10 and #16-40.
- Enemy stats and the tuning check.
- Katas: wait on Jay's descriptions (Pinon 1-3, Nahanchi, Possi). Passive kata powers are handled by R-PROGRESSION-BETA and R-KATA-POWERS.

## Questions for Jay (none block Batch 1)

1. Where is the Power & Progression Redesign doc and the #1-15 template? (Manager or Jay.)
2. For the beta: OK with the cut line above (seals #1-10 and Strikes #1-2 are must-ship; Orange seals #11-15 and Strike #3 move to after the beta if time runs out)?
