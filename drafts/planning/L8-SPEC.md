# L8-S: Evolutions, the Lock split, and one hold mechanic

Written Nov 16, 2026 by the Researcher & Planner. Board 82171ecc. Docs only. Build item L8 from the Fable review (`docs/reviews/fable-progression-overhaul.md`, section 10).

**In plain words.** Every Seal family now **evolves** when it reaches rank 3, 6 or 9. The medallion gets a new look and the kid sees a short moment, but no extra numbers are added. **Lock** becomes **two groups**: arm and shoulder locks, and wrist locks. The names are placeholders until Jay picks them. Both groups use **one hold**: a Perfect Counter that already stuns the enemy now holds it, so it can't block or raise a shield. The hold is never longer than today's stun. The balance check passes on every belt, difficulty and bot.

## What decides this

- Jay, Nov 14, Q3 (a): split Lock into groups Jay names (board line 16).
- Board Done-when for L8: #31–40 rank at least 2 different groups; no rank adds to a capped number (data test); balance-check passes all belts.
- G2B-04 (decisions.md): the hold after a Perfect Counter caps at `holdCapTicks` = 24, and the Seals' `staggerBonus` together caps at +20%.
- Review 6.3: evolutions are the "every third rank" twists already budgeted, so they add no power outside the bands.
- Jay, Nov 8: real dojo technique names only. So an evolution gets **no made-up name**. The review's "Swift Counter" example is not used.
- Real techniques come from `docs/self-defense.md`. #31–35 say what the student does. #36–40 are "(not stated)" until Jay describes them.

## 1. The Lock split

The live `lock` family (`live: false`, no ranks) is replaced by two families. The groups follow what the real technique locks, as `docs/self-defense.md` describes it.

| Group (placeholder name) | id | Ranks, in order | Opens at |
|---|---|---|---|
| **Group A: arm and shoulder locks** | `lock-arm` | #17 Arm Bar, #28 four-corner shoulder lock, #31 arm bar, #36 | Green (#17) |
| **Group B: wrist locks** | `lock-wrist` | #32 slide to the wrist lock, #33 party flex, #35 catch the hand wrist lock, #39 | Red/Black (#32) |

- **#36 and #39** are "joint manipulation" in Jay's words, with no steps yet. They are placed 2 and 2 so the groups stay even. When Jay describes them, they may move.
- **#19 Wrist Lock stays in Disarm** (team call, Nov 8: its built effect is a disarm, not a hold). Jay can move it with the group names if he wants.
- **#31–40 rank 4 families:** Group A (#31, #36), Group B (#32, #33, #35, #39), Throw (#34, #38, #40) and Counter (#37). That meets the board's "at least 2 groups".
- Slots don't change (2 at White and Yellow, 3 at Orange to Blue, 4 from Red). A kid may equip both groups.
- Real names on the rank cards come from the Content Designer's list (`drafts/content/abilities/J27-audit.md`). The names in this table are Jay's descriptions, not final card names.

**Jay names the two groups** (through the Manager). Until then the cards say "Lock (arm)" and "Lock (wrist)". The ids never change, so a rename is text only.

## 2. One hold mechanic (`counterLock`)

One new effect type, `counterLock`. It's on or off, with no amount. Each group's first rank has it. Equipping both groups still gives one hold.

| Rule | What it means |
|---|---|
| When | A Perfect Counter lands on an enemy that would be staggered. |
| Who | Any enemy except Guardians, bosses and elites. This is the same list `canThrow` already refuses. There's no new content flag. |
| How long | **Exactly the stun it already gets**: 20 ticks, or 24 with Counter #6 Arm Wrap. Never past `holdCapTicks` (24). No Lock rank adds ticks. |
| During the hold | The enemy can't block or raise a shield, so hits land as on any staggered enemy. It doesn't move or wind up (same as stagger). |
| Damage | Nothing new. The existing stagger bonus applies as it does today, still under the +20% Seal cap. |
| With Throw | If Throw is equipped and the enemy is throwable, the throw happens (as built). The hold is for enemies that aren't thrown. |
| Look and sound | Drawn like the stagger plus a small gold hold ring (Artist). The event `{kind:'held'}` plays the existing guard swish. Reduced motion: the ring shows with no pulse. |

**Dropped on purpose:** extra hold ticks (#28, #31 and #40 in the old S4 rows), a release push, Focus on lock, and locking from a Block (S4 `blockLock`). Each one is a second hook or a capped number. The release push (1 tile) passed the pooled check but read up to 23 PE on single belts, so it isn't proposed.

## 3. The Lock ranks

| Group | Rank | # | Effect | Kind |
|---|---|---|---|---|
| A | 1 | #17 | The hold (`counterLock`) | New mechanic |
| A | 2 | #28 | A Block refills Dash (`dashOnBlock`, the built on/off effect; it doesn't stack with Escape #2) | Built |
| A | 3 | #31 | **Evolves.** New look and moment. No number | Look only |
| A | 4 | #36 | Cue only until Jay describes it | None |
| B | 1 | #32 | The hold (`counterLock`) | New mechanic |
| B | 2 | #33 | Each Perfect Counter heals 2 (`healOnPerfect` 2) | Built |
| B | 3 | #35 | **Evolves.** New look and moment. No number | Look only |
| B | 4 | #39 | Cue only until Jay describes it | None |

**Data test:** no Lock rank carries `staggerTicks`, `staggerBonus`, `disarm`, `counterHits`, `counterStrength` or `counterWindow`. Those are the capped numbers or the ones that grow the Perfect Counter package. `holdCapTicks` stays 24 and `sealStaggerBonusCap` stays 0.2.

## 4. Evolutions (every family)

- A family's **stage** comes from its rank: stage 1 at rank 1, stage 2 at rank 3, stage 3 at rank 6, stage 4 at rank 9. Rank is a count of signed-off techniques, so the order they were signed in doesn't matter.
- **An evolution adds no numbers.** The rank that triggers it keeps its own effect (that is its "twist").
- **The moment (5 s):** after the sign-off cards, one card shows the medallion turn and gain a ring. The line is 8 words or fewer, for example "Your Counter Seal evolved!" plus the callout "Self-Defense #6". Tap to continue. Reduced motion: a fade, with no spin. The final words are the Content Designer's.
- **Legacy cascade:** a student who already has rank 3+ when they first play sees evolutions on the one welcome list, with no separate cards (same rule as today's cascade).
- The loadout and the Book show each family's stage.

Where each family evolves, counted from the live file for #1–15 and the R-G2B map for #16–40:

| Family | Ranks | Evolves at (rank: technique if signed in order) |
|---|---|---|
| Counter | #3, 5, 6, 7, 10, 16, 20, 37 (8) | rank 3: #6; rank 6: #16 |
| Escape | #1, 2, 15, 18, 25, 29, 30 (7) | rank 3: #15; rank 6: #29 |
| Throw | #11, 12, 27, 34, 38, 40 (6) | rank 3: #27; rank 6: #40 |
| Disarm | #13, 14, 19, 21, 22, 24 (6) | rank 3: #19; rank 6: #24 |
| Guard | #8, 9, 23, 26 (4) | rank 3: #23 |
| Lock A | #17, 28, 31, 36 (4) | rank 3: #31 |
| Lock B | #32, 33, 35, 39 (4) | rank 3: #35 |
| Advancing | #4 (1) | never (only one rank so far) |

No family reaches rank 9 before black belt. The data allows it for later belts.

**Mismatch to know:** the live `seal-families.json` has #1 and #15 in Escape. The R-G2B map says Counter. This spec counts from the live file and doesn't move them.

## 5. Balance check

The harness is `drafts/planning/L8-sim/l8-sim.ts` (a copy of the J21 harness: whole runs on the real fight rules, `startRun`, `createRunWorld`, the balance bot). It uses typical-artist stats, 60 seeds from seed 1000, and the kid, newer, careful and masher bots. Guided and Standard run on belts 1–10, and Challenge on belts 4–10. PE uses the Insight ruler (0–60% Power). The limits are the R-G2B ones: one effect ≤ 12, card + effect ≤ 38, pair + effect ≤ 62, route + effect ≤ 67. A star means the +60% ruler moved health lost by under 1 point on every belt, so that cell isn't used to size. Raw rows are in `drafts/planning/L8-sim/results/`. The hold itself isn't built, so it isn't in these rows (see L8-Q1).

**Pooled PE by bot and difficulty:**

| Setup | Bot | Guided | Standard | Challenge |
|---|---|---|---|---|
| #33 heal 2 | kid | 2.7 | 1.5 | 1.9 |
|  | newer | 0* | 0 | 0 |
|  | careful | 0* | 0* | 0 |
|  | masher | 0 | 0 | 0 |
| #28 Dash refill | kid | 0 | 0 | 0 |
|  | newer | 0* | 0 | 0 |
|  | careful | 0* | 0* | 5.9 |
|  | masher | 0 | 0 | 0 |
| Both groups | kid | 2.7 | 1.5 | 1.9 |
|  | newer | 0* | 0 | 0 |
|  | careful | 0* | 0* | 5.9 |
|  | masher | 0 | 0 | 0 |
| #33 + Counter #10 heal | kid | 6 | 2.5 | 3.5 |
|  | newer | 0* | 0 | 0 |
|  | careful | 0* | 0* | 0 |
|  | masher | 0 | 0 | 0 |

**Highest PE on each belt (all bots and difficulties, starred cells left out):**

| Setup | Limit | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 | Pass |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Both groups together (#28 Dash refill + #33 heal 2) | 12 | 8 | 6.4 | 1.3 | 4 | 4.8 | 1.5 | 5.7 | 5.7 | 5.6 | 5.6 | yes (pooled max 5.9) |
| #33 heal 2 alone | 12 | 8 | 6.4 | 1.3 | 4 | 4.8 | 1.5 | 3.7 | 1.9 | 0.8 | 4.1 | yes (pooled max 2.7) |
| #28 Block refills Dash alone | 12 | 0 | 0 | 0 | 0.8 | 1.8 | 0 | 5.7 | 5.7 | 5.6 | 5.6 | yes (pooled max 5.9) |
| #33 + Counter #10 heal (5 total) | 12 | 19.4 | 10.6 | 2.3 | 9 | 3.2 | 2.9 | 3.6 | 3.2 | 2.8 | 4.7 | yes (pooled max 6) |
| Heavy Hands card + both groups (superset) | 38 | 23.6 | 25.6 | 21.3 | 24.4 | 24.4 | 28 | 25.5 | 23.8 | 24 | 25.7 | yes (pooled max 24) |
| Insight pair + both groups (superset) | 62 | 60 | 45.5 | 41.4 | 52.2 | 48.1 | 44.9 | 52.2 | 55 | 54.8 | 50.4 | yes (pooled max 52) |
| Power route + both groups + #16 (superset) | 67 | 60 | 42.1 | 39.6 | 50 | 48 | 47.9 | 53.3 | 52.8 | 52.8 | 54.7 | yes (pooled max 51.2) |
| Escape hits + #16 + Counter heal + both groups | 38 | 14.8 | 8 | 4.9 | 16.4 | 15.5 | 10.6 | 25.4 | 11.6 | 11.8 | 13.6 | yes (pooled max 17.4) |

**How to read it.**
- Every proposed rank and both groups together stay under 12 on every belt.
- The "superset" rows also carried a spare extra hit and a 1-tile push that are **not** proposed, and they still pass their limits on every belt. So the smaller real proposal passes too.
- **#33 plus Counter #10's heal (5 total)** reads 19.4 on belt 1 only. Runs always use the student's own belt tier (`tower.ts`), and Lock opens at Green (tier 4), so no student can hold that stack on belts 1–3. It's ≤ 10.6 on every belt from 2 up.
- **Package ceiling (review section G):** the hold is never longer than today's stun (24 ticks max), and no Lock rank adds hits or strength. So one Perfect Counter's package is unchanged on every belt, and R-BAL-12's "no knock-out under 5 hits" can't move.
- **Options measured and rejected:** window +1 (up to 38.3), Focus +10% (26.1) and +5% (22.9). A finish hit of 0.3 passed (≤ 10.6 per belt) but is dropped, because it stacks with Escape's three live extra hits and #16 into the Perfect Counter package.

## 6. Work items

| Item | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| L8-C1 | Content Designer | Text for both group cards, the 8 Lock ranks and the evolution card, in `drafts/content/abilities/L8-lock-text.json` | Every line is 8 words or fewer and names no body targets; "(arm)" and "(wrist)" are marked placeholders; the check script passes | none |
| L8-B1 | Programmer | Replace `lock` with `lock-arm` and `lock-wrist` in `seal-families.json` (ranks from section 3), `live: false` until B2 | Data tests: no Lock rank carries the six listed effects; #31–40 rank at least 2 families; caps unchanged; old saves load | none |
| L8-B2 | Programmer | `counterLock`: the hold from section 2; turns both groups live | Tests: hold length equals stagger length (20, 24 with #6, never over 24); a held enemy can't block or shield; Guardians, bosses and elites are never held; throw wins on a throwable enemy with Throw equipped | L8-B1 |
| L8-B3 | Programmer | Stages, the evolution card and the stage on the loadout and Book | Tests: stage from rank (1/3/6/9); the card shows once per evolution; the legacy cascade lists evolutions on one card; reduced motion fades | L8-B1, L8-C1 (placeholder art OK) |
| L8-A1 | Artist | 3 stage ring overlays used by every family, 1 base medallion for the second Lock group, and the gold hold ring | Art in `incoming-art/` at the medallion sizes, readable at phone size | none |
| L8-Q1 | Tester | Rerun `L8-sim` with the built hold, adding rows against the shield enemy | Each group alone ≤ PE 12 pooled on every bot and difficulty (unstarred), and evolution cards play at rank 3; any fail goes to the Manager | L8-B2, L8-B3 |

**For Jay (through the Manager):** names for the two Lock groups. The steps for #36–40 are already on Jay's list.

**Scope:** still Medium, as the review sized it. It adds one new effect type and no new numbers beyond two small built ones, and every evolution uses one shared set of 3 ring overlays rather than art for each family.
