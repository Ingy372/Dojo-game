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
- **§13 lock (decided Oct 27, 2026):** core-design §13 says *Challenge mode unlocks at the 4th belt*, and the Manager confirmed it. The sims and the game currently let Challenge run at every belt, so P6 adds the lock. Belt 1–3 rows in this plan only matter if that rule changes later.

## 1. Patterns per enemy and belt (Challenge only)

Every pattern reuses parts the game already has:
- a red circle (counter or block)
- a striped lane (dash)
- a phase change
- a summon

So players learn no new button. Each enemy gets **one** new move, and it arrives in a tier. Bosses add a Challenge-only phase.

| # | Enemy | New pattern | What the player does | Tell (see + hear) | From belt |
|---|---|---|---|---|---|
| C1 | swarmer | **Hop-in jab**: hops 1 tile toward the player, then jabs | step back or counter | crouch + small "boing", red circle at the landing spot before the hop | 1 |
| C2 | shield | **Shield rush**: a 2-tile straight charge (lane), can be countered at the end | dash aside, or counter the bash | shield glows, lane stripes, rising "hmm" | 1 |
| C3 | Floor Keeper | **Challenge phase at 50%**: slam → sweep → slam, plus a **shockwave lane** (dash-only) that never overlaps a red circle | dash the lane, counter the slams | existing phase pause + roar; lane stripes + "!!" + whoosh (the Hearth Cook's lane look) | 1 |
| C4 | brute | **Double slam**: two slams in a row. Each has its own full tell; the 2nd hits at strength 0.6. It is winded right after | counter or block twice, then punish | fist raised twice, two thumps | 2 |
| C5 | bopper | **Wide bonk**: a front arc (areaRadius 1.3) instead of a dot | step behind or counter | staff pulled far back + "whirr" | 2 |
| C6 | spark-sprite | **Zig-zag dart**: the circle appears, then the sprite darts in from a side angle. It never comes from off screen | counter or block | sparkle trail drawn first + "tik-tik" | 3 |
| C7 | dough-blob | **Bounce**: jumps and lands on a marked spot | step out of the circle | squash down + shadow circle where it lands + "boing" | 3 |
| C8 | ladle-lobber | **Two splats**: two splats in a row, at least 20 ticks apart, aimed where the player was | keep moving | ladle lifted twice + "plip, plip" | 3 |
| C9 | rolling-pin | **Return roll**: rolls back once along the same lane | dash twice | lane stays striped + "whoosh" again | 3 |
| C10 | Hearth Cook | **Challenge pin phase**: rolling pin lane → ladle bonk, never both at once | dash, then counter | existing phase lines, unchanged | 3 |
| C11 | elites (swift, guarding) | No new moves. They use their enemy's pattern with the elites.json wind-up values | | | 4 |
| C12 | belts 4–6 | All of C1–C5. Later the Content Designer may use **pair rooms**: two pattern enemies in one wave, still limited by the overlap cap | | | 4 |
| C13 | belts 7–10 | Patterns come sooner in a run: from room 1 instead of room 2 (`fromRoom`) | | | 7 |

**With the §13 lock, Challenge is only played at belts 4–10.** Those belts use the shared rooms, so the patterns that matter are C1–C5 (swarmer, shield, Floor Keeper, brute, bopper) plus C11–C13. The "From belt" values of 1–3 above just mean "on from the first Challenge belt". The Ember patterns C6–C10 only appear at belt 3, so they stay dormant unless the lock changes or Ember enemies are placed in belt 4+ rooms later.

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
  "fromBelt": 2,
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
- `fromBelt` is 1–10.

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
| C1 | Content Designer | Write the `challenge` blocks for C1–C5 first (the ones played at belts 4–10), then C6–C10 as dormant data, using names, tells and Sensei lines from §1. Keep the swarmer jab and spark dart at ≥ 10 ticks on Challenge (P1) | All files load, and each pattern's Challenge wind-up is ≥ 14 ticks | P2 |
| C2 | Content Designer | Pair-room and `fromRoom` placement for belts 4–10 (C12, C13) | A belt 4 Challenge run shows C1–C5, and a belt 7 run shows patterns from room 1 | C1 |
| T1 | Tester | Re-run §4 at 100 seeds with patterns on (Challenge rows: belts 4–10 only) | Every row is inside its target band, or the misses are listed with the room causing them | P1–P6, C1, C2 |
| T2 | Tester | Human playtest using the §5 checklist | Notes from at least 2 testers (one aged 6–8), with no "hit from nowhere" reports | T1 |

**Scope risk** (beta cut still pending with Jay)**:**
- With the §13 lock, belt 1–3 patterns aren't played on Challenge, and the Ember patterns (C6–C10) are dormant. The beta suggestion below was written before the lock; Jay's call on it is still open.
- **Dec 15, 2026 beta (5–10 testers):**
  - Safe to ship: P1–P3 and P5, plus C1 for **C1, C2, C4 and C3** (belts 1–2 and the Floor Keeper). These reuse circles and lanes that exist today.
  - Risky: the belt 3 Ember patterns (C6–C10) and the pair rooms (C12, C13). They need new tell art and sounds, and sound may already slip past Dec 15 (#318). Suggested: beta has belts 1–2 plus the Floor Keeper, and Ember patterns stay off with `fromBelt: 11`.
- **April 2027 launch:** everything, after T2. The Challenge band numbers are final only after human playtests (Q-CHALLENGE).

## Decisions (Oct 27, 2026)

Jay left the difficulty calls to the Manager, who decided:

1. **§13 lock: yes.** Challenge unlocks at the 4th belt. Belt 1–3 patterns (and the Ember patterns C6–C10) only matter if that rule changes later. Added P6; the balance targets and Tester checks now cover belts 4–10.
2. **Careful-bot target 55–85% on Challenge: approved.**
3. **Jab and dart fix: approved.** The 9-tick swarmer jab and spark-sprite dart go to the 10-tick minimum (P1, and noted in C1).
4. **Beta cut: pending, waiting on Jay.**

## Original questions (answered above, except 4)

1. **§13 lock:** does Challenge unlock at the 4th belt (as §13 says), or stay open at every belt as it is now? If it unlocks at belt 4, rows C1–C10 still apply, because belts 4+ meet those enemies, but belt 1–3 testing waits.
2. **Careful-bot target:** keep 55–85% (about 2 in 3)?
3. **Fix the existing 9-tick jab and dart on Challenge** to the 10-tick floor (P1)? This slightly eases Challenge today.
4. **Beta cut:** belts 1–2 plus the Floor Keeper patterns for Dec 15, with Ember patterns after?
