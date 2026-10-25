# B-MASHER-2: tune Mash guard

## Why #295 differs from my #291 sim

**#291 was wrong about smart bots.** My #291 sim only checked smart-bot win rate and boss time. Both stayed the same, so I wrote "smart bots barely change". I never measured the damage they took.

The built rule is the same as my probe: a hit during your own basic swing counts as a Block. The cause:
- The basic attack fires on its own every 12 ticks, and the swing counts on 11 of those 12 ticks.
- So any time a player stands next to an enemy, Mash guard is almost always on, for skilled players too.
- Every mistimed Counter, and every hit from a second enemy, becomes a half-damage Block.

Re-measured on the #295 branch (all 3 smart students, belts 1–10, 20 seeds each):
- Damage per room fell from about 20–23 to about 15–17, roughly 25% less.
- #295 reported 28.6 → 20.0 (30% less), a similar drop. The exact numbers differ, probably because it used a different set of runs.

**Bands and bosses:**
- The R-BAL-12 band test still passes, 293/293. It checks hits-to-KO math, not blocks.
- Bosses still take 12.5–13.5 s.
- Smart bots took about 20% less damage from bosses (about 30–38 per fight before, about 24 after). Bosses are still beatable, but less real for trained players.

## Options tested

All options ran on the #295 branch with the real sims: belts 1–10, 20 seeds, Standard. The smart rows show damage per room.

| Option | Kid win | Kid room-1 KOs | Masher win | Typical | TrainsMore | PlaysOnly |
|---|---|---|---|---|---|---|
| Before #295 (no Mash guard) | 10.5% | 46/200 | 7.5% | 20.3 | 22.6 | 20.4 |
| #295 as built | 68.5% | 0 | 34.5% | 15.5 (-24%) | 16.8 (-26%) | 15.4 (-25%) |
| A: lets 75% through | 22.5% | 14 | 10.0% | 18.7 | 19.8 | 18.9 |
| B: first 4 ticks of a swing only | 16.0% | 33 | 8.5% | 18.5 | 21.9 | 18.6 |
| C: off for 10 s after a Perfect Counter | 17.5% | 25 | 34.5% | 19.0 | 21.6 | 19.1 |
| C: off for 3 s after a Perfect Counter | 22.5% | 7 | 34.5% | 18.4 | 20.1 | 18.6 |
| D: off after a missed Counter | 34.0% | 14 | 34.5% | 15.6 | 16.9 | 15.5 |
| E: off after 1 Perfect Counter in the room | 17.5% | 31 | 34.5% | 19.0 | 21.6 | 19.1 |
| E: off after 2 Perfect Counters in the room | 33.5% | 1 | 34.5% | 18.1 (-11%) | 20.4 (-10%) | 18.0 (-12%) |
| **E: off after 3 Perfect Counters in the room** | **56.5%** | **0** | **34.5%** | **17.5 (-14%)** | **19.9 (-12%)** | **17.4 (-15%)** |
| E: off after 5 Perfect Counters in the room | 69.5% | 0 | 34.5% | 16.4 | 17.2 | 16.4 |

What the table shows:
- The kid bot needs Mash guard on almost the whole time. Any option that weakens it for everyone (A, B) drops kid wins back to about 15–25%.
- Only options keyed to skill keep the kid gains. Perfect Counters are the best skill signal: smart bots land 3 quickly, the kid rarely does.
- No option hits both targets exactly. E3 meets the kid target (56.5%, 0 KOs). Smart-bot damage lands at -12% to -15%, just outside the "within about 10%" target.

## Recommendation

**E3:** Mash guard works until you land 3 Perfect Counters in a room, then turns off for the rest of that room. It turns back on in the next room.
- Plain words: "Sensei's help steps back once you show you can Counter."
- It's kind: it never punishes, it just stops helping players who don't need it.
- Shield sparks stay as built.
- The band test passes 293/293.

## Work-board item

| Item | Owner | Done when |
|---|---|---|
| B-MASHER-2 Mash guard fades after 3 Perfect Counters per room | Dojo-Ascent Programmer | The kid gate passes (wins ≥ 55%, room-1 KOs ≤ 20/200). Smart-bot damage per room is within 15% of before #295 at belts 1–10. The band test passes 293/293. |

## Decisions for Jay

1. Accept E3, where smart players take 12–15% less damage, a little over the 10% target? Or choose E2, which is within about 10% for smart players but where the kid only wins 33.5%?
2. Should the fade be shown, for example "Sensei steps back" once, or stay silent?
3. Should Mash guard reset each room (proposed), or once it's gone, stay off for the whole run?
