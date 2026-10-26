# R-B3-RETUNE: why belt 3 is too easy, and the retune

Method: balance-check skill. A throwaway sim (since deleted) ran `playRun` with ARTISTS.typical stats: belts 1–10 × Guided/Standard/Challenge × 3 bots (kid = kid/novice, newer = smart/typical, careful = smart/sharp), 40 seeds each, with belt 3 re-checked at 100 seeds.
Guided enemy Power ×0.75 (#352) was simulated as already built. Content changes were applied in memory only.

## Why belt 3 is an outlier

Belt 3 uses only its own Ember Kitchens rooms (`floorRooms` in run.ts). Those rooms are much lighter than the shared rooms used at belts 2 and 4:

| | Shared rooms (belts 2, 4) | Ember Kitchens (belt 3) |
|---|---|---|
| Enemies per battle room | 10–13, in 3 waves | 6, in 2 waves |
| Heavy enemy (brute, 126 HP / 17 Power) | 1–2 per room | none |
| Main small enemy | swarmer, 7 Power | spark-sprite, 7 Power |
| Boss room | Floor Keeper + 8 adds | Hearth Cook alone |
| Kid's Health lost per room (Standard) | 30–31% | 13.5% |

The Hearth Cook itself is fine: 549 HP, 17 Power, the same shape as the Floor Keeper. Gear at tier 3 is the normal ARTISTS row and is not the cause. The B-T3-TUNE-2 levers (boss phases, Hot Pot Rush sparks) don't add enough fights to matter.

## Levers tried

| Lever | Kid on Standard at b3 | Result |
|---|---|---|
| Today | 100 | too easy |
| +1 wave per room, boss +2 sparks | 100 | too easy |
| +2 waves per room (with a dough-blob), boss adds | 90 | too easy |
| Raise dough-blob stats (e.g. 110 HP / 16 Power) | 42–57 | **breaks the R-BAL-12 MID band** (12 hits > 10). Dough-blob is already at its band ceiling, so it was rejected. |
| +2 waves with a brute lead, boss adds with a brute | 71–76 | close |
| The same + 1 extra brute in 1–4 rooms | 15–46 | too hard (a cliff) |
| **The same + 1 ladle-lobber in oven-row and pin-lanes** | **63** | **chosen** |

The changes are room content only: no global multipliers, no new stats, and no wind-up changes.

## Build-ready changes (Content Designer)

Add these entries to each file's `enemies` array (format `{enemy, column, row, wave}`). Positions reuse the room's own wave-1 tiles.

1. `content/rooms/ember-pantry.json` add:
   wave 3: brute (5,2), spark-sprite (14,2), spark-sprite (9,4)
   wave 4: spark-sprite (5,2), spark-sprite (14,2), rolling-pin (9,4)
2. `content/rooms/long-table-hall.json` add:
   wave 3: brute (9,2), spark-sprite (5,6), spark-sprite (14,6)
   wave 4: spark-sprite (9,2), spark-sprite (5,6), rolling-pin (14,6)
3. `content/rooms/oven-row.json` add:
   wave 3: brute (4,2), spark-sprite (9,2), spark-sprite (15,2)
   wave 4: spark-sprite (4,2), spark-sprite (9,2), rolling-pin (15,2), ladle-lobber (pick a free floor tile near 9,2)
4. `content/rooms/pin-lanes.json` add:
   wave 3: brute (10,2), spark-sprite (5,3), spark-sprite (14,3)
   wave 4: spark-sprite (10,2), spark-sprite (5,3), rolling-pin (14,3), ladle-lobber (pick a free floor tile near 5,3)
5. `content/rooms/great-hearth.json` add:
   wave 1: spark-sprite (6,4), spark-sprite (14,4)
   wave 2: brute (10,5), spark-sprite (6,5), spark-sprite (14,5)

Notes:
- `supper-rush`, `spice-cupboard`, `warm-hearth` and every enemy file stay unchanged.
- In the sim, the two ladle-lobbers started on the same tile as a spark. The Tester re-runs once with the real tiles.
- `brute` is the existing shared heavy enemy, already in the HEAVY band from belt 1. An Ember-themed reskin (same stats) is optional later art; it is not needed for this item.

## Before / after: kid win % by belt (newer and careful are 100% on every belt and setting, before and after)

| Setting | | b1 | b2 | **b3** | b4 | b5 | b6 | b7 | b8 | b9 | b10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Guided | before | 90 | 95 | **100** | 95 | 95 | 95 | 95 | 95 | 95 | 95 |
| Guided | after | 90 | 95 | **95** (98 at 100 seeds) | 95 | 95 | 95 | 95 | 95 | 95 | 95 |
| Standard | before | 30 | 60 | **100** | 60 | 67 | 65 | 45 | 50 | 50 | 47 |
| Standard | after | 30 | 60 | **65** (63 at 100 seeds) | 60 | 67 | 65 | 45 | 50 | 50 | 47 |
| Challenge | before | 7 | 25 | **100** | 20 | 15 | 15 | 7 | 7 | 17 | 10 |
| Challenge | after | 7 | 25 | **27** (26 at 100 seeds) | 20 | 15 | 15 | 7 | 7 | 17 | 10 |

At belt 3, Health lost per room on Standard goes from 13.5% to 29.3%, in line with belts 2 and 4 (30–31%).

| Check | Target | Result | Pass |
|---|---|---|---|
| Kid on Standard, b3 | ≥50%, not 100% | 63–65% | PASS |
| Belt 2→3→4, Standard | no jump >2x | 60 → 65 → 60 | PASS |
| Belt 2→3→4, Challenge | no jump >2x | 25 → 27 → 20 | PASS |
| Guided easiest, white belts win most | | 90–98% everywhere | PASS |
| R-BAL-12 bands | Guardian 40–80 hits, ≥5 hits to KO | no enemy stats changed, so every band test holds | PASS |
| Careful bot on Challenge, b3 | about 2 in 3 | 100% | **MISSED (see below)** |

Jumps left over 2x, all before belt 2 and not touched here: kid Standard b1→b2 30→60 (2x), and kid Challenge b1→b2 7→25.

## Careful bot on Challenge: the honest answer

The careful bot wins 100% on every belt and setting. Getting it to about 2 in 3 at belt 3 alone needs Challenge enemies at about ×2–2.5 Health and Power at that belt (×2 → 87%, ×3 → 20%). That would:
- make belt 3 a **reverse outlier**: the only belt where the careful bot loses,
- go past the ×1.5 Challenge limit that the R-BAL-12 bands assume,
- drop the newer bot from 100% to 27% at ×2.

**Proposal:** don't do it. Keep belt 3 in line with its neighbours. The careful bot counters almost perfectly, so no stat change gives it a 2 in 3 without crushing everyone else. If Challenge should be a real test for skilled kids, that is a new design question for Jay (new attack patterns, not bigger numbers), checked by human playtests.

## Work items

| # | Owner | Work | Done when | Waits on |
|---|---|---|---|---|
| 1 | Content Designer | Room entries 1–5 above | The 5 files are changed and the R-BAL-12 bands test passes | nothing |
| 2 | Programmer | Guided `enemyPowerScale: 0.75` on DIFFICULTY (from #352), if not built yet | Guided enemies hit at 0.75× and tests are green | nothing |
| 3 | Tester | Re-run the belt-3 kid/newer/careful sims × 3 settings | Kid Standard b3 is 50–70%, and b2→3→4 has no >2x jump | 1, 2 |
| 4 | Jay | Decide: does Challenge need to beat careful players? | yes or no | nothing |
