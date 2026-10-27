# R-CHALLENGE-PATTERNS: new enemy attack patterns on Challenge

Jay approved Q-CHALLENGE on Oct 27, 2026. The Challenge setting gets new attack patterns for skilled players instead of bigger numbers, and real playtests judge it. **Guided and Standard stay exactly as they are.**

Why: the careful bot already wins 100% on Challenge at every belt (#354, #358, and the baseline below). Raising Health or Power can't fix that without crushing the kid bot, so the challenge has to come from reading new moves.

## What exists today (read from main at 5d7f585e)

- **Settings** (`DIFFICULTY`, packages/sim/src/config.ts):
  - guided: window 10, fill ×1, enemy Power ×0.75
  - standard: window 6, fill ×1, Power ×1
  - challenge: window 4, fill ×0.8, Power ×1
- **How Challenge wind-ups are worked out** (`telegraphTicks`, world.ts): Challenge wind-up = round((file ticks − 6) × 0.8) + 4.
- **Enemy limits:**
  - At most 2 enemies attacking at once (`COMBAT.maxAttackersAtOnce`).
  - The loader rejects any file wind-up under 10 ticks.
  - Bosses already support `phases` and `dashOnly` lane attacks, as the Hearth Cook does.
- **Who appears at which belt** (content/rooms):

| Belt | Room set | Enemies |
|---|---|---|
| 1 (white) | `w-*` white-dojo (#358) | swarmer, shield, Floor Keeper |
| 2 (yellow) | shared rooms + bopper-yard, staff-and-shield | swarmer, shield, brute, bopper, Floor Keeper |
| 3 (orange) | ember-kitchens | spark-sprite, dough-blob (→ doughling), ladle-lobber, rolling-pin, brute, Hearth Cook |
| 4–10 | shared rooms (no own sets yet) | swarmer, shield, brute, bopper, Floor Keeper |

- **Existing finding: two Challenge wind-ups are already under the 10-tick floor.** The swarmer `jab` and the spark-sprite `dart` (12 file ticks) come out at 9 ticks (0.45 s) on Challenge. The loader floor only checks the file value. Item P1 fixes this (see the fairness rules below).
- **§13 lock (decided Oct 27, 2026):** core-design §13 says *Challenge mode unlocks at the 4th belt*, and the Manager confirmed it. The sims and the game currently let Challenge run at every belt, so P6 adds the lock. Every active row in §1 now starts at belt 4 or later, since the loader rejects `fromBelt` below 4.

## 1. Patterns per enemy and belt (Challenge only)

Every pattern reuses parts the game already has:
- a red circle (counter or block)
- a striped lane (dash)
- a phase change
- a summon

So players learn no new button. Each enemy gets **one** new move, and it arrives in a tier. Bosses add a Challenge-only phase.

| # | Enemy | New pattern | What the player does | Tell (see + hear) | From belt |
|---|---|---|---|---|---|
| C1 | swarmer | **Hop-in jab**: hops 1 tile toward the player, then jabs | step back or counter | crouch + small "boing", red circle at the landing spot before the hop | 4 |
| C2 | shield | **Shield rush**: a 2-tile straight charge (dash-only lane, per §4b) | dash aside | shield glows, lane stripes, rising "hmm" | 4 |
| C3 | Floor Keeper | **Challenge phase at 50%**: slam → sweep → slam, plus a **shockwave lane** (dash-only) that never overlaps a red circle | dash the lane, counter the slams | existing phase pause + roar; lane stripes + "!!" + whoosh (the Hearth Cook's lane look) | 4 |
| C4 | brute | **Double slam**: two slams in a row. Each has its own full tell; the 2nd hits at strength 0.6. It is winded right after | counter or block twice, then punish | fist raised twice, two thumps | 5 |
| C5 | bopper | **Wide bonk**: a front arc (areaRadius 1.3) instead of a dot | step behind or counter | staff pulled far back + "whirr" | 6 |
| C6 | spark-sprite | **Zig-zag dart**: the circle appears, then the sprite darts in from a side angle. It never comes from off screen | counter or block | sparkle trail drawn first + "tik-tik" | parked (unused) |
| C7 | dough-blob | **Bounce**: jumps and lands on a marked spot | step out of the circle | squash down + shadow circle where it lands + "boing" | parked (unused) |
| C8 | ladle-lobber | **Two splats**: two splats in a row, at least 20 ticks apart, aimed where the player was | keep moving | ladle lifted twice + "plip, plip" | parked (unused) |
| C9 | rolling-pin | **Return roll**: rolls back once along the same lane | dash twice | lane stays striped + "whoosh" again | parked (unused) |
| C10 | Hearth Cook | **Challenge pin phase**: rolling pin lane → ladle bonk, never both at once | dash, then counter | existing phase lines, unchanged | parked (unused) |
| C11 | elites (swift, guarding) | No new moves. They use their enemy's pattern with the elites.json wind-up values | | | 4 |
| C12 | belts 4–6 | C1–C5 step in (C1–C3 at 4, C4 at 5, C5 at 6). Later the Content Designer may use **pair rooms**: two pattern enemies in one wave, still limited by the overlap cap | | | 4 |
| C13 | belts 7–10 | Patterns come sooner in a run: from room 1 instead of room 2 (`fromRoom`). **On hold (§4b): room-1 patterns made Challenge easier in the sims** | | | 7 |

**With the §13 lock, Challenge is only played at belts 4–10.** Those belts use the shared rooms, so the patterns that matter are C1–C5 (swarmer, shield, Floor Keeper, brute, bopper) plus C11–C13. **Belt fix (Oct 27, 2026):** the step-up is kept, moved onto real Challenge belts. All five enemies appear in the shared rooms at belts 4–10 (swarmer and shield in most battle rooms, brute in bamboo-hall, gauntlet, training-yard and others, bopper in bopper-yard and staff-and-shield, Floor Keeper in keepers-hall and tutorial-keep). Simpler patterns start at belt 4 (C1 hop-in jab, C2 shield rush, C3 Floor Keeper phase, which reuse today's circles and lanes). The double slam (C4) adds at belt 5 and the wide bonk (C5) at belt 6. No numbers changed.

**Parked: C6–C10 (Ember).** spark-sprite, dough-blob, ladle-lobber, rolling-pin and Hearth Cook only appear in ember-kitchens rooms (minBeltTier 3), so they are never met on Challenge. These rows are kept as unused design data only. They get no `challenge` block in JSON (a `fromBelt` of 3 would fail the loader) until Ember enemies are placed in belt 4+ rooms, which would be a new proposal.

Belts 4–10 have no rooms of their own yet, so belt-to-belt steps come from C12 and C13 (room placement), never from stat changes.

## 2. Fairness rules (ages 6+). The Programmer enforces them in code, and tests check them

1. **Every attack has a tell you can see and a tell you can hear**, before any damage. The sound plays when the wind-up starts, and Mute shows the visual tell only. The lane, circle or landing spot is drawn at the start of the wind-up.
2. **Nothing hits from off screen.** A pattern can't start its wind-up unless both the enemy and the whole hit area are inside the camera view. If they aren't, it waits or uses its normal attack.
3. **Wind-ups never get shorter (R-BAL-12).**
   - New attacks use the same Challenge formula as today and never have their own scale.
   - The loader also checks the **Challenge result**: at least **14 ticks (0.7 s)** for new pattern attacks.
   - The overall floor of 10 ticks applies after the Challenge formula too. This fixes the jab and dart.
4. **Minimum reaction window:** at least 14 ticks from the moment the hit area is drawn to the moment it can hurt the player. For a two-part pattern (C4, C8, C9), the second part gets its own full tell, starting no sooner than the first part's recover.
5. **Overlap cap:**
   - `maxAttackersAtOnce` stays 2.
   - On Challenge, at most **1 pattern attack** winds up at a time, room-wide.
   - A dash-only lane never winds up while a red circle covers the player. This turns the Hearth Cook's `noOverlapWithRedCircle` into real code; today it is only data.
6. **Bands stay (R-BAL-12):**
   - Patterns change no Health, Power or Guard, so it still takes 40–80 hits to beat a Guardian.
   - Pattern strength is ≤ 1.0 (the double slam's 2nd hit is 0.6), so it still takes at least 5 hits to knock out the player.
   - `test/r-bal-12-bands.test.ts` must stay green.
7. **Hopeful feedback.** When a pattern first appears in a run, Sensei says one line, for example "New move! Watch the glow." There is no "you failed" text, and a knock-out keeps today's kind screen.
8. **Motion:** pattern visuals respect the existing motion setting. Lanes and circles stay, and only the shake and flinch are reduced.

## 3. Code spec (Programmer)

**Content shape.** Add an optional block to the enemy JSON:

```json
"challenge": {
  "fromBelt": 5,
  "fromRoom": 2,
  "attacks": [ { "name": "double slam", "strength": 1, "startRange": 1.3, "reach": 0.9, "areaRadius": 0.95,
                 "telegraphTicks": 20, "recoverTicks": 18, "followUp": { "strength": 0.6, "gapTicks": 18 } } ],
  "pattern": ["attack", "double slam"],
  "phases": null
}
```

- `attacks` uses the same shape as today, with two optional new fields:
  - `followUp`: the second hit, which has its own full tell.
  - `landing: true`: the circle is drawn at the target spot, as for C1, C7 and C8.
- `pattern` lists the attacks in the order they repeat. `"attack"` means the enemy's normal attack.
- `phases` is for bosses. It uses the same format as Hearth Cook `phases`, and it replaces the boss's normal phases on Challenge.

**Where it switches.** Do it in one place: when `createRunWorld` / `createWorld` builds an `EnemyState`, resolve the def as follows:

```
def = (difficulty === 'challenge' && raw.challenge && beltTier >= challenge.fromBelt && roomIndex + 1 >= (challenge.fromRoom ?? 1))
      ? mergeChallenge(baseDef, raw.challenge)   // attacks appended, pattern/phases set
      : baseDef                                  // untouched: Guided + Standard are byte-identical
```

- `nextAttackIndex` follows `pattern` when it is set, the same way it follows phases today.
- Nothing else reads the difficulty for patterns.

**Checks the loader adds** (in enemy.ts):
- The `pattern` names exist.
- Each new attack's Challenge wind-up is ≥ 14 ticks.
- `strength` ≤ 1.
- `fromBelt` is 4–10 (Challenge unlocks at belt 4; anything lower is rejected).

**Rules the world enforces** (in world.ts):
- The on-screen check (rule 2).
- One pattern attack at a time (rule 5).
- A lane waits while a red circle covers the player (rule 5).

**Tests:**
1. The golden Standard and Guided runs stay byte-identical.
2. Every pattern meets the 14-tick and on-screen rules.
3. The overlap cap holds over 1,000 seeded rooms.
4. The R-BAL-12 bands test stays green.

**Bot:** `test/balance/bot.ts` must learn the new answers so the sim means something:
- step out of landing circles
- dash the lanes, which it already does for `counterable: false`
- handle the double slam twice

Kid skill stays novice.

## 4. Balance check (balance-check skill)

**Method.** A throwaway vitest file (since deleted) ran `playRun` from main 5d7f585e:
- belts 1–10 × Guided, Standard and Challenge × 3 bots, at 40 seeds each
- kid = kid/novice, newer = smart/typical, careful = smart/sharp
- ARTISTS.typical stats and that belt's tier

**The patterns can't be simulated yet.** They need the code in section 3 and the bot update. So this is today's **baseline**, plus the target bands to check after the build. No pattern numbers here are invented.

### Baseline: win % / Health lost per fight (% of max)

| Setting | Bot | b1 | b2 | b3 | b4 | b5 | b6 | b7 | b8 | b9 | b10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Guided | kid | 100/20.7 | 95/21.8 | 100/22.0 | 93/21.4 | 95/22.2 | 95/21.5 | 95/22.8 | 95/21.6 | 95/21.6 | 95/20.7 |
| Guided | newer | 100/0.6 | 100/0.5 | 100/0.5 | 100/0.5 | 100/0.5 | 100/0.5 | 100/0.5 | 100/0.5 | 100/0.5 | 100/0.5 |
| Guided | careful | 100/0.3 | 100/0.1 | 100/0.1 | 100/0.2 | 100/0.2 | 100/0.1 | 100/0.1 | 100/0.2 | 100/0.1 | 100/0.1 |
| Standard | kid | 58/33.8 | 65/36.1 | 70/32.4 | 68/37.8 | 73/37.1 | 70/37.2 | 53/37.2 | 53/37.1 | 55/35.7 | 53/37.1 |
| Standard | newer | 100/3.3 | 100/3.6 | 100/3.0 | 100/4.0 | 100/4.3 | 100/4.3 | 100/4.0 | 100/3.9 | 100/3.9 | 100/3.9 |
| Standard | careful | 100/1.6 | 100/1.4 | 100/1.3 | 100/1.4 | 100/1.3 | 100/1.3 | 100/1.5 | 100/1.5 | 100/1.4 | 100/1.5 |
| Challenge | kid | 23/46.2 | 23/46.4 | 38/45.9 | 23/45.5 | 18/48.8 | 18/49.8 | 15/50.2 | 15/48.4 | 23/47.7 | 10/48.5 |
| Challenge | newer | 100/5.2 | 100/6.4 | 100/5.8 | 100/6.3 | 100/5.8 | 100/5.7 | 100/5.7 | 100/5.6 | 100/5.5 | 100/5.6 |
| Challenge | careful | 100/5.3 | 100/4.9 | 100/4.4 | 100/5.0 | 100/4.8 | 100/5.1 | 100/5.1 | 100/5.0 | 100/5.0 | 100/4.8 |

**How this compares with #358.** At 40 seeds on today's main, a few kid cells moved by 1–8 points from #358's table, for example Standard b1 57 → 58 and Challenge b3 27 → 38. That is seed noise plus #361/#362. No jump between neighboring belts is above 2x, except Challenge kid b9 → b10 at 23 → 10 (2.3x). That cell is a small number at 40 seeds, so the Tester re-checks it at 100 seeds.

### Target bands to check after the build

| Check | Target | Today | Status |
|---|---|---|---|
| Guided and Standard, every bot and belt | **byte-identical** to the table above (same seeds) | n/a | must pass |
| Challenge, careful bot, belts 4–10 | **55–85% win** (approved Oct 27, 2026) | 100% | fails today, which is the goal of this item |
| Challenge, newer bot, belts 4–10 | **35–75% win** | 100% | fails today |
| Challenge, kid bot | ≥ 5% at belts 4–10 and not more than 10 points below today's cell (kids aren't Challenge's audience, and they keep Standard) | 10–38% | check after |
| Belt-to-belt jump, Challenge, all bots (belts 4–10) | ≤ 2x | ok except b9→b10 kid | check after |
| Health lost per fight, careful, Challenge | 10–25% (now 4.4–5.3%) | 5% | check after |
| R-BAL-12 bands | 40–80 hits to beat a Guardian, ≥ 5 hits to knock out the player | pass | must stay green |

If a belt misses its band, change **pattern placement** (fromBelt, fromRoom, pair rooms), not Health, Power or wind-up.

## 4b. Placement, frequency and mixing (R-CHALLENGE-PLACEMENT, Oct 27, 2026)

**Question:** can *where*, *how often* and *with whom* the C1–C5 patterns appear bring the newer bot into 35–75% and the careful bot into 55–85% Challenge wins, inside the fairness rules (one pattern at a time, full warnings, on screen, reach ≤ about 4 tiles, wind-up ≥ 14 ticks, no bigger numbers, R-BAL-12 bands)?

**Short answer: no.** No placement, frequency or mixing setup I tried moves the newer or careful bot below 100% wins at any belt. The closest one costs the careful bot 6.7% Health per fight instead of 5.1%, and it drops the kid bot to 0–3% wins. Even rule-breaking probes (Challenge enemy power ×3, or a 1-tick Counter window) leave the careful bot at 95–100%. The bots Counter every hit they can see, and they heal between rooms. So in the sims the skilled-player band can't be reached with patterns. Human playtests (T2) have to judge it.

### How it was run
- Bot: #372's P5 bot (`bot-code/R-CHALLENGE-P5` at 294fe376, merged with main ff890b7b). Same harness as the #372 table: 40 seeds, ARTISTS.typical, kid = kid/novice, newer = smart/typical, careful = smart/sharp. Each cell is **win % / Health lost per fight (% of max)**.
- Candidate setups were built as test-only `challenge` blocks and room copies in a local test file (not pushed). Only sim inputs changed. The probes edited `DIFFICULTY.challenge` locally and were then reverted.
- **Every belt, all three difficulties:** for BASE (no patterns), S0 (#372 samples), L+B+R1 and L+B, I ran belts 1–10 × Guided/Standard/Challenge. The Guided and Standard rows came out identical to BASE in every one (also proven byte-equal by #372's tests). Challenge at belts 1–3 never shows patterns, because `fromBelt` is 4 or more. For the other candidates I ran only the Challenge rows at belts 4–10, because Guided and Standard can't change.

### Levers tried (all inside the fairness rules unless marked)
| Code | Lever | What changed |
|---|---|---|
| S0 | #372 samples | C1–C5 as in #372: pattern on every 2nd swing, from room 2 |
| F | frequency | The pattern attack on **every** swing (`pattern: [pattern attack]`) |
| R1 | placement | `fromRoom: 1` at every Challenge belt (C13 brought forward) |
| L | pattern type | C2 shield rush becomes a **dash-only lane** (like the rolling pin) |
| B | boss mixing | Floor Keeper uses the shockwave lane in phase 1 too (slam → shockwave → sweep) |
| X | spread | Patterns for rolling pin, ladle lobber and dough blob too (same stats) |
| W14 | wind-up | Pattern `telegraphTicks` 19 (Challenge wind-up exactly 14) instead of 20 |
| M / M2 | waves | Each battle room gets 1 (M) or 2 (M2) extra closing waves (copies of wave 1) |
| A | crowding | Wave 1 doubled (a second copy of every wave-1 enemy, 0.8 tiles away) |

### Results: Challenge, belts 4–10 (win % / Health lost per fight)
| Setup | Bot | b4 | b5 | b6 | b7 | b8 | b9 | b10 |
|---|---|---|---|---|---|---|---|---|
| BASE (today) | kid | 28/43.0 | 28/42.1 | 25/42.6 | 18/43.5 | 15/43.1 | 15/43.0 | 15/43.4 |
| | newer | 100/5.7 | 100/5.9 | 100/5.9 | 100/5.6 | 100/5.5 | 100/5.5 | 100/5.6 |
| | careful | 100/5.4 | 100/5.1 | 100/5.1 | 100/5.1 | 100/5.0 | 100/5.0 | 100/5.1 |
| S0 (#372) | kid | 28/40.9 | 38/40.8 | 35/40.3 | 28/41.0 | 25/40.8 | 35/41.1 | 33/41.5 |
| | newer | 100/6.2 | 100/6.1 | 100/5.9 | 100/5.9 | 100/5.9 | 100/5.9 | 100/5.8 |
| | careful | 100/5.1 | 100/5.4 | 100/5.2 | 100/5.3 | 100/5.1 | 100/5.2 | 100/5.0 |
| F | kid | 78/31.5 | 93/27.3 | 93/27.0 | 85/28.5 | 88/28.1 | 88/27.0 | 85/27.2 |
| | newer | 100/7.8 | 100/7.7 | 100/7.6 | 100/7.6 | 100/7.3 | 100/7.4 | 100/7.1 |
| | careful | 100/3.8 | 100/3.6 | 100/3.9 | 100/3.6 | 100/3.4 | 100/3.5 | 100/3.3 |
| R1+F | kid | 88/27.8 | 100/21.2 | 100/20.8 | 100/21.6 | 100/20.8 | 100/21.4 | 100/21.4 |
| | newer | 100/7.8 | 100/7.7 | 100/7.4 | 100/7.4 | 100/7.5 | 100/7.3 | 100/7.5 |
| | careful | 100/3.5 | 100/3.2 | 100/3.2 | 100/3.4 | 100/3.3 | 100/3.3 | 100/3.2 |
| F+L | kid | 55/35.1 | 78/30.8 | 75/31.5 | 75/31.9 | 83/31.0 | 75/30.7 | 80/30.2 |
| | newer | 100/7.5 | 100/7.1 | 100/7.1 | 100/7.3 | 100/7.2 | 100/7.0 | 100/7.2 |
| | careful | 100/4.5 | 100/3.7 | 100/3.6 | 100/3.8 | 100/3.7 | 100/3.7 | 100/3.6 |
| R1+F+L+B (same with +X) | kid | 65/31.3 | 93/25.3 | 90/25.7 | 93/26.2 | 100/25.5 | 90/25.9 | 100/25.4 |
| | newer | 100/7.5 | 100/6.5 | 100/6.5 | 100/6.5 | 100/6.4 | 100/6.3 | 100/6.6 |
| | careful | 100/3.7 | 100/3.5 | 100/3.8 | 100/3.9 | 100/3.8 | 100/3.8 | 100/3.8 |
| W14+R1+F+L+B | kid | 57/34.1 | 90/26.2 | 83/26.8 | 78/27.8 | 75/27.6 | 78/27.1 | 83/26.7 |
| | newer | 100/7.9 | 100/7.5 | 100/7.8 | 100/7.4 | 100/7.3 | 100/7.2 | 100/7.4 |
| | careful | 100/4.1 | 100/4.5 | 100/4.3 | 100/4.2 | 100/4.2 | 100/4.1 | 100/4.2 |
| L | kid | 23/42.5 | 40/40.3 | 38/39.7 | 28/42.3 | 23/42.7 | 23/43.4 | 23/43.4 |
| | newer | 100/6.1 | 100/6.0 | 100/5.7 | 100/5.5 | 100/5.5 | 100/5.5 | 100/5.4 |
| | careful | 100/5.2 | 100/5.3 | 100/5.3 | 100/5.3 | 100/5.1 | 100/5.1 | 100/4.9 |
| **L+B (recommended)** | kid | 28/42.3 | 43/40.3 | 38/39.5 | 25/42.1 | 33/42.0 | 30/42.8 | 30/42.8 |
| | newer | 100/5.8 | 100/5.8 | 100/5.4 | 100/5.2 | 100/5.3 | 100/5.2 | 100/5.2 |
| | careful | 100/5.0 | 100/5.2 | 100/5.2 | 100/5.2 | 100/5.0 | 100/5.0 | 100/4.8 |
| L+B+R1 | kid | 35/40.3 | 55/37.1 | 43/37.7 | 57/36.8 | 63/36.8 | 57/36.2 | 55/37.9 |
| | newer | 100/5.8 | 100/5.6 | 100/5.4 | 100/4.9 | 100/4.8 | 100/4.8 | 100/5.0 |
| | careful | 100/5.2 | 100/5.1 | 100/5.2 | 100/5.5 | 100/5.5 | 100/5.4 | 100/5.2 |
| M+L+B+R1 | kid | 8/51.6 | 18/50.3 | 10/53.6 | 8/53.7 | 13/53.6 | 15/51.5 | 15/53.5 |
| | newer | 100/6.4 | 100/6.8 | 100/6.7 | 100/6.6 | 100/6.6 | 100/6.5 | 100/6.7 |
| | careful | 100/5.8 | 100/5.2 | 100/5.5 | 100/5.3 | 100/5.2 | 100/5.1 | 100/5.4 |
| M+X+R1+F+L+B | kid | 33/41.9 | 75/31.6 | 70/30.7 | 65/31.9 | 65/30.8 | 73/30.8 | 70/31.2 |
| | newer | 100/8.7 | 100/7.6 | 100/8.4 | 100/8.0 | 100/7.9 | 100/7.7 | 100/8.1 |
| | careful | 100/4.8 | 100/4.0 | 100/4.4 | 100/4.3 | 100/4.2 | 100/4.2 | 100/4.2 |
| M2+L+B+R1 (same with +X) | kid | 0/65.0 | 0/63.0 | 0/62.1 | 0/61.8 | 0/61.3 | 0/60.9 | 0/60.8 |
| | newer | 100/7.0 | 100/7.3 | 100/7.3 | 100/7.9 | 100/7.1 | 100/7.6 | 100/7.4 |
| | careful | 100/6.3 | 100/6.6 | 100/6.3 | 100/6.6 | 100/6.4 | 100/6.5 | 100/6.2 |
| A+L+B+R1 (closest for careful) | kid | 0/64.8 | 3/54.3 | 3/56.0 | 0/58.4 | 0/57.6 | 3/59.1 | 3/57.1 |
| | newer | 100/8.0 | 100/7.4 | 100/7.8 | 100/7.6 | 100/7.4 | 100/7.6 | 100/7.5 |
| | careful | 100/6.7 | 100/6.4 | 100/6.7 | 100/6.3 | 100/6.5 | 100/6.2 | 100/6.4 |
| A+M2+W14+L+B+R1 | kid | 3/63.8 | 5/58.2 | 8/59.0 | 3/62.5 | 3/60.8 | 3/59.2 | 3/59.4 |
| | newer | 100/8.2 | 100/7.9 | 100/7.8 | 100/8.2 | 100/7.9 | 100/7.9 | 100/7.8 |
| | careful | 100/6.2 | 100/6.1 | 100/6.3 | 100/6.2 | 100/6.2 | 100/6.1 | 100/6.3 |
| A+M2+W14+F+L+B+R1 | kid | 28/45.2 | 68/32.9 | 50/33.0 | 60/33.6 | 60/33.2 | 68/32.6 | 63/33.9 |
| | newer | 100/9.0 | 100/8.0 | 100/8.3 | 100/8.2 | 100/8.0 | 100/7.9 | 100/8.0 |
| | careful | 100/4.2 | 100/4.1 | 100/4.7 | 100/4.5 | 100/4.4 | 100/4.4 | 100/4.6 |

(X changed nothing: the rolling pin, ladle lobber and dough blob don't show up in the belt 4–10 rooms the bots walk through. A ignores M2 in the local harness, so A+M2 = A plus W14.)

### Pass/fail against the bands (balance-check)
| Setup | careful 55–85% | newer 35–75% | kid ≥ 5% and ≤ 10 pts below today | neighbour jump ≤ 2x | Guided/Standard identical |
|---|---|---|---|---|---|
| S0, L, L+B, L+B+R1 | fail (100%) | fail (100%) | pass | pass | pass |
| F, R1+F, F+L, R1+F+L+B, W14+… | fail (100%) | fail (100%) | pass, but the kid wins **more** than today (up to 100%) | fail on F/R1+F (b4→b5) | pass |
| M+L+B+R1 | fail | fail | fail at b4–b6 (8–18 vs a floor of 15–18) | fail (b4 8 → b5 18) | pass |
| M2, A variants | fail | fail | fail (0–8%) | fail (kid 0 → 3) | pass |

### What I learned
1. **More pattern swings make Challenge easier, not harder.** Pattern attacks need ≥ 14-tick wind-ups. Today's normal swings are 10–13 ticks on Challenge. Swapping fast swings for slow, well-warned ones lowers pressure. The kid wins 78–100% under F, against 15–28% today.
2. **Crowding (extra waves, doubled waves) hurts the kid far more than the skilled bots.** The careful bot goes from 5.1% to 6.7% Health per fight, while the kid falls to 0–3%.
3. **The skilled bots are at a ceiling.** Probes outside the rules, with no patterns, only to measure the ceiling:

| Probe (breaks a rule) | kid | newer | careful |
|---|---|---|---|
| Challenge enemy power ×1.5 | 0–3 / 64–73 | 100 / 8.3–9.5 | 100 / 7.7–8.1 |
| ×2 | 0 / 78–84 | 98–100 / 11–13.6 | 100 / 10.1–10.8 |
| ×3 | 0 / 90 | 88–95 / 17.8–19.0 | 95–100 / 15.5–16.5 |
| Counter window 4 → 2 ticks | 5–13 / 48–52 | 95–100 / 20.3–21.4 | 100 / 13.7–14.3 |
| Counter window 4 → 1 tick | 0–8 / 53–57 | 85–95 / 25.8–26.7 | 98–100 / 20.5–21.7 |

   Even these leave the careful bot at 95–100% wins. A 55–85% careful band in the bot would need changes that break the ages-6+ rules (bigger numbers, near-zero Counter windows) and would wipe out the kid. So the bot can't measure the skilled band. It shows that we stay fair, not how hard Challenge feels.

### Recommendation: setup L+B
- **C1 hop-in jab, C4 double slam, C5 wide bonk:** as in the #372 samples. The pattern comes on every 2nd swing (`pattern: [normal, pattern]`), from room 2. Don't use "every swing".
- **C2 shield rush:** a **dash-only lane** (`dashOnly: true`, lane stripes as the tell, like the rolling pin) instead of "counter at the end". This gives skilled players a different skill to show (dash timing) rather than just Counter timing. Wind-up 20 file ticks (about 15 on Challenge).
- **C3 Floor Keeper:** the shockwave lane in **both** phases (phase 1: slam → shockwave → sweep; phase 2 as planned). It is still never at the same time as a red circle.
- **C12 pair rooms / C13 `fromRoom: 1`: not recommended now.** Room-1 patterns (R1) only made Challenge easier for the kid. Extra or doubled waves broke the kid floor. Keep `fromRoom: 2` at every belt. C13 is on hold until playtests show skilled players want more.
- **Key numbers (L+B):** careful 100% wins / 4.8–5.2% Health per fight. Newer 100% / 5.2–5.8%. Kid 25–43% / 39.5–42.8% (today 15–28%). Guided and Standard are unchanged. **Bands met: kid yes; newer and careful no** (bot ceiling, see above).
- R-BAL-12: no Guardian HP or player-damage numbers change, so the 40–80 hits to beat a Guardian and the ≥ 5 hits to knock out the player still hold.

## 5. Playtest checklist (human testers, Challenge only)

Play each Challenge belt you can reach (belt 4 and up) with at least one younger tester (6–8) and one skilled tester. Write yes/no plus one note for each check.

1. Before every new move, could you **see** the warning? Could you **hear** it, with sound on?
2. Did anything hit you that you didn't see coming, or that came from off screen?
3. Did any hit feel too fast to answer? Say which enemy.
4. Were there ever 3 or more things to dodge at once?
5. After one or two tries, could you say what each new move wants (counter, step, or dash)?
6. The skilled tester: did Challenge feel harder than Standard because of the moves, and not because enemies got tougher? Did you win about 2 in 3 runs?
7. The younger tester: did you still enjoy Standard, and was it unchanged?
8. Did Sensei's "New move!" line help? Did anything feel mean or unfair?
9. With Motion off, are the lanes and circles still clear?
10. Phone sizes 667×375 and 844×390: are the lanes and landing circles fully visible?

## 6. Board items (the Manager adds them; I don't edit work-board.md)

| # | Owner | Work | Done when | Waits on |
|---|---|---|---|---|
| P1 | Programmer | Loader floor applied after the Challenge formula (raise the 9-tick swarmer jab and spark-sprite dart to ≥ 10 ticks) | A test shows every Challenge wind-up ≥ 10 ticks. Standard and Guided golden runs are unchanged | nothing (approved Oct 27, 2026) |
| P6 | Programmer | Challenge lock: Challenge can only be picked from the 4th belt (core-design §13); sims run Challenge only at belts 4–10 | A test shows Challenge can't start below belt 4. Guided and Standard unchanged | nothing |
| P2 | Programmer | `challenge` block: loader, `mergeChallenge`, pattern stepping, `followUp`, `landing` | The tests in §3 pass. Guided and Standard golden runs are byte-identical | nothing |
| P3 | Programmer | Fairness rules 2 and 5 in world.ts: on-screen check, 1 pattern at a time, lane vs red circle | The overlap and on-screen tests pass over 1,000 seeded rooms | P2 |
| P4 | Programmer | Tells: lane, circle and landing-spot visuals, plus one Sensei line on first sight, using existing sfx where possible | In the browser, each pattern shows its tell at the start of its wind-up at both phone sizes, with Motion on and off | P2, C1 |
| P5 | Programmer | Bot answers in bot.ts (landing circles, double hits) | A balance run prints the §4 table with patterns on | P2 |
| C1 | Content Designer | Write the `challenge` blocks for C1–C5 first (the ones played at belts 4–10), using the `fromBelt` values in §1 (C1–C3: 4, C4: 5, C5: 6) and the **§4b L+B setup**: C1, C4 and C5 use `pattern: [normal, pattern]` (every 2nd swing) with `fromRoom: 2`. C2 shield rush is a `dashOnly` lane. The C3 shockwave lane is in both Floor Keeper phases (phase 1: slam, shockwave, sweep). C6–C10 are parked and not written to JSON. Use names, tells and Sensei lines from §1 (C2 tell: lane stripes plus shield glow). Keep the swarmer jab and spark dart at ≥ 10 ticks on Challenge (P1) | All files load. Each pattern's Challenge wind-up is ≥ 14 ticks. The P7 sample run matches the §4b L+B row within ±5 points | P2 |
| C2 | Content Designer | Placement for belts 4–10, per §4b: **no** pair rooms, extra waves or `fromRoom: 1` for now (C12 and C13 on hold, since they broke the kid floor or made Challenge easier). Check that every room at belts 4–10 can still host its patterns on screen | A belt 4 Challenge run shows C1–C3, belt 5 adds C4, belt 6 adds C5, all from room 2. No room has a new wave | C1 |
| P7 | Programmer | Make `test/balance/sample-patterns.ts` match the §4b L+B setup (C2 `dashOnly`, C3 shockwave in phase 1), or point the P5 table at the real C1 content once it exists | The BALANCE=1 table prints the L+B row. Guided and Standard stay byte-equal | P5, C1 |
| T1 | Tester | Re-run §4 at 100 seeds with patterns on (Challenge rows: belts 4–10 only) | The kid row meets its floor (≥ 5% and ≤ 10 points below today) with no jump over 2x. Newer and careful are **reported, not graded** (bot ceiling, §4b). Misses are listed with the room causing them | P1–P6, C1, C2 |
| T2 | Tester | Human playtest using the §5 checklist; this is where the skilled-player difficulty is judged (§4b) | Notes from at least 2 testers (one aged 6–8), with no "hit from nowhere" reports | T1 |

**Scope risk** (beta cut still pending with Jay)**:**
- With the §13 lock, belt 1–3 patterns aren't played on Challenge, and the Ember patterns (C6–C10) are dormant. The beta suggestion below was written before the lock; Jay's call on it is still open.
- **Dec 15, 2026 beta (5–10 testers):**
  - Safe to ship: P1–P3 and P5, plus C1 for **C1, C2, C4 and C3** (written as belts 1–2 and the Floor Keeper; after the belt fix these are C1–C3 at belt 4 and C4 at belt 5). These reuse circles and lanes that exist today.
  - Risky: the belt 3 Ember patterns (C6–C10) and the pair rooms (C12, C13). They need new tell art and sounds, and sound may already slip past Dec 15 (#318). Suggested: beta has belts 1–2 plus the Floor Keeper, and Ember patterns stay off. *(Superseded by the belt fix: belts 1–2 aren't Challenge belts; Ember patterns are parked with no JSON block.)*
- **April 2027 launch:** everything, after T2. The Challenge band numbers are final only after human playtests (Q-CHALLENGE).

## Decisions (Oct 27, 2026)

Jay left the difficulty calls to the Manager, who decided:

1. **§13 lock: yes.** Challenge unlocks at the 4th belt. Belt 1–3 patterns (and the Ember patterns C6–C10) only matter if that rule changes later. Added P6; the balance targets and Tester checks now cover belts 4–10.
2. **Careful-bot target 55–85% on Challenge: approved.**
3. **Jab and dart fix: approved.** The 9-tick swarmer jab and spark-sprite dart go to the 10-tick minimum (P1, and noted in C1).
4. **Beta cut: pending, waiting on Jay.**

## Original questions (answered above, except 4)

1. **§13 lock:** does Challenge unlock at the 4th belt (as §13 says), or stay open at every belt as it is now? If it unlocks at belt 4, rows C1–C10 still apply, because belts 4+ meet those enemies, but belt 1–3 testing waits. *(Answered: yes. Active rows now start at belt 4+; C6–C10 parked.)*
2. **Careful-bot target:** keep 55–85% (about 2 in 3)?
3. **Fix the existing 9-tick jab and dart on Challenge** to the 10-tick floor (P1)? This slightly eases Challenge today.
4. **Beta cut:** belts 1–2 plus the Floor Keeper patterns for Dec 15, with Ember patterns after?
