# R-B1-RAMP: smooth the white belt → yellow belt jump

Method: balance-check skill. A throwaway sim (since deleted) ran `playRun` with ARTISTS.typical stats: belts 1–10 × Guided/Standard/Challenge × 3 bots (kid = kid/novice, newer = smart/typical, careful = smart/sharp), 40 seeds, with belts 1–2 re-checked at 60.
The baseline already includes the #354 belt 3 room changes and Guided ×0.75 (#352), simulated as built.

## Cause

Belt 1 plays the shared rooms, and 8 of them have brutes (HEAVY band, 17 Power). The white-belt student has the weakest Guard relative to enemy Power of any belt:

| Belt | Student Guard | Enemy Power scale | Guard / scale |
|---|---|---|---|
| 1 | 9.34 | ×1.19 | 7.8 |
| 2 | 23.05 | ×2.06 | 11.2 |
| 3 | 33.53 | ×3.14 | 10.7 |

So brute hits land hardest at belt 1. The kid loses 34.9% of Health per room at belt 1, against 30.2% at belt 2. Belt 2 also adds 2 lighter rooms (bopper-yard, staff-and-shield), which dilutes its pool.
The kid's deaths at belt 1 are spread across the brute rooms and the Floor Keeper boss. The tutorial rooms aren't used in normal runs (they're tutorial-only), and gear isn't the cause because both belts use the ARTISTS rows.

## Levers tried (kid win %, belts 1 / 2, 60 seeds)

| Lever | Standard | Challenge | Guided | Verdict |
|---|---|---|---|---|
| Today | 30 / 60 | 7 / 25 | 90 / 95 | 2x jump |
| Open bopper-yard and staff-and-shield at belt 1 | 40 / 65 | 15 / 21 | 91 / 93 | not enough |
| Belt-1 room set, boss wave 3 removed only | 36 / 65 | 6 / 21 | 91 / 93 | not enough |
| Belt-1 room set, last wave removed from every room | 95 / 65 | 73 / 21 | 100 / 93 | reverse outlier |
| Belt-1 room set, brute → shield, + bopper rooms + lighter boss | 63 / 65 | 33 / 21 | 100 / 93 | Challenge b1 > b2 |
| **Belt-1 room set, brute → shield** | **58 / 65** | **23 / 21** | **98 / 93** | **chosen** |

## Build-ready change (Content Designer)

Make a white-belt room set. `floorRooms` (run.ts) already uses a belt's own set when rooms have `floorSet` set and `minBeltTier` equal to that belt, the same way Ember Kitchens works at belt 3. No code change is needed.

Create 15 files, `content/rooms/w-<id>.json`, each a copy of `content/rooms/<id>.json` with only these changes:
- `"id": "w-<id>"`
- `"floorSet": "white-dojo"`
- `"minBeltTier": 1`
- every enemy `"brute"` → `"shield"`. Keep the same column, row and wave.

The 15 `<id>`s are: bamboo-hall, brute-and-swarm, gauntlet, guarded-swarm, keepers-hall, lantern-room, narrow-bridge, pillar-court, quiet-shrine, shield-escort, shield-wall, stone-garden, training-yard, treasure-vault, twin-shields.
(Only 8 of them have brutes. All 15 need copies because a belt with its own set uses only that set.)
`brute-and-swarm` will have no brute; the name can stay or change to "Shield and Swarm" (Content Designer's choice).

Leave the originals unchanged. Belts 2+ keep them. The tutorial rooms are not touched.

## Before / after: kid win % by belt (newer and careful are 100% on every belt and setting, before and after)

| Setting | | **b1** | b2 | b3 | b4 | b5 | b6 | b7 | b8 | b9 | b10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Guided | before | **90** | 95 | 95 | 95 | 95 | 95 | 95 | 95 | 95 | 95 |
| Guided | after | **97** | 95 | 95 | 95 | 95 | 95 | 95 | 95 | 95 | 95 |
| Standard | before | **30** | 60 | 65 | 60 | 67 | 65 | 45 | 50 | 50 | 47 |
| Standard | after | **57** (58 at 60 seeds) | 60 | 65 | 60 | 67 | 65 | 45 | 50 | 50 | 47 |
| Challenge | before | **7** | 25 | 27 | 20 | 15 | 15 | 7 | 7 | 17 | 10 |
| Challenge | after | **20** (23 at 60 seeds) | 25 | 27 | 20 | 15 | 15 | 7 | 7 | 17 | 10 |

At belt 1 the kid's Health lost per room goes from 34.9% to 29.2% (belt 2: 30.2%), and Floor Keeper wins go from 12/18 to 23/28.

| Check | Target | Result | Pass |
|---|---|---|---|
| Kid on Standard, b1 | ≥50%, near belt 2 | 57–58% vs 60% | PASS |
| b1→b2 jump, Standard | ≤2x | 57 → 60 | PASS |
| b1→b2 jump, Challenge | ≤2x | 20 → 25 | PASS |
| Belt 2 not made harder | unchanged | 60 / 25 / 95 | PASS |
| Belt 3 (#354) kept | 65 / 27 / 95 | 65 / 27 / 95 | PASS |
| Guided easiest, white belts win most | | 97–98% at b1 | PASS |
| R-BAL-12 bands | | no enemy stats changed; shield is MID from belt 1 | PASS |
| No jump >2x anywhere | | the biggest is b6→b7 Challenge 15→7 (2.1x, small numbers) | borderline, already there before |

The careful bot is still 100% everywhere (see #354; that is Jay's Challenge question, not this item).

## Work items

| # | Owner | Work | Done when | Waits on |
|---|---|---|---|---|
| 1 | Content Designer | Create the 15 `w-*.json` rooms above | The files load, the room tests and R-BAL-12 bands are green, and a belt-1 run shows no brute | nothing |
| 2 | Programmer | Check that anything keyed by room id (art props, Journal, the shots/test lists) handles the `w-` copies, e.g. by sharing art with the original | The belt-1 rooms look the same as the originals in the browser | 1 |
| 3 | Tester | Re-run belts 1–3 × 3 settings × 3 bots | Kid Standard b1 is 50–65%, and b1→b2 is ≤2x | 1, 2, #354 build, Guided ×0.75 build |
