# R-G2B: Seal families and ranks for #1-40, with Lock and Break Free

Written Nov 1, 2026 by the Researcher & Planner. Updated Nov 8, 2026 with Jay's answers (J21). A later ruling corrects #4: the real name is OPEN, and Advancing is the family, not the name. Docs only. Source of truth: `power-and-progression-redesign.md`. Technique names and what each technique is: `S4-self-defense-powers.md` (Jay approved the list Oct 24) plus Jay's Nov 8 answers below. Rows Jay answered on Nov 8 are decided. The other family and "recast" cells are still a **proposal**. Rule 5: the test bot sets the numbers, so no amount below is final. Where a Nov 8 answer changes when an old amount applies, the amount is left as written and marked **needs balance-check**. No new amount was picked.

**In plain words.** Every self-defense technique becomes a rank of one of seven Seal families, named by the technique. A kid picks Seals into 2-4 slots (2 at White and Yellow, 3 at Orange, Green and Blue, 4 from Red). Only three things are truly new in the game: **Throw**, **Lock** and **Break Free**. Everything else reuses something already built. This note gives all 40 a family and a rank, says which are already built, and writes down the Lock and Break Free rules so they can be built once.

## Jay's answers, Nov 8, 2026 (J21)

These win where they disagree with the Nov 1 proposal.

1. **#4's real name is OPEN. Advancing is the family, not the name.** OPEN is not in the Escape family. The old game name Drive Back is retired. In class the move steps you forward into the attacker to close the distance. In the game it still pushes one attacker back 1.5 tiles. That distance was measured in PR #453 and stays. Advancing's only confirmed member so far is #4 OPEN. The Programmer adds this family to `content/abilities/seal-families.json`. This note does not edit that file. See "Advancing family" below.
2. **#25 Escape from Behind is a general escape** (team call). The built effect is a Block refilling Dash. It measured PE 0. No amount was added.
3. **#16 is a quick two-hit follow-up after a Great Counter, not a heal.** In class it is a very quick hammer fist low, then a back fist high. Game text says "quick low hammer fist, then a high back fist." It does not say groin or face. Why: the real move is two fast strikes in a row, so the seal adds a hit after the counter. It uses the same hook as the kata kick: one extra hit, strength 0.3. The same strength is used on Guided, Standard, and Challenge. A Strike-button extra hit at 0.3 did not fit, so this is not that. Names are in `drafts/content/abilities/J27-audit.md`.
4. **Each seal works alone** (team call). No seal needs another seal equipped. #26's block cut, measured on its own, is 0.02. #37 adds no tick. #34, #38, and #40 stay stand-alone, and they were not measured because a thrown state is not in the fight rules.
5. **Old placeholder powers:** the team lean in Conflict 6 is applied. Steady Breath does **not** go on #16, because #16 is the extra hit. It **shares #10** (see below).
6. **#37 Steady Hold moves to the Counter family. Yes.** It is Counter rank 10. The +1 tick is removed. With Steady Hold equipped, the counter window keeps the gold "!" and the gold COUNTER flash the game already draws, and the existing guard swish plays once when that window opens. No fight number changes. It measured 0 PE on every belt.
7. **#19 Wrist Lock moves to Disarm.** Why: the effect that is built is `disarm` at a full cut for one attack (the fight rules cap a disarm at 0.9). It does not hold the enemy. A Lock rank is a hold. Putting a disarm on the Lock seal would make Lock disarm, and would leave the Disarm seal without this rank. So it is Disarm rank 3, between Kick and Spin and X-Block Lock.

Real technique names are the Content Designer's list in `drafts/content/abilities/J27-audit.md`. This note does not keep its own name list.

## The families (from the redesign) and what they do

Jay first agreed to six families. The later ruling adds a seventh, Advancing.

| Family | Job | Built today? |
|---|---|---|
| Counter | A Perfect Counter hits harder, stuns longer or gives something back | Yes (counterStrength, staggerTicks, staggerBonus, counterWindow, rippleCounter, healOnPerfect, comboSpeed) |
| Guard | Blocking hurts less or sends hits back | Yes (blockCut, blockReflect) |
| Escape | Blocks or dashes make space and refill Dash. **Break Free is part of this family.** OPEN is not in this family | Partly (dashOnBlock). Break Free is new |
| Advancing | You move forward into the attacker to close the distance | The 1.5-tile push is built (`counterPush`). The family row is not in `seal-families.json` yet. The Programmer adds it |
| Disarm | A Perfect Counter takes the attacker's weapon or power for a while | Yes (disarm) |
| Throw | A Perfect Counter throws the attacker down. A downed enemy takes extra damage | New |
| Lock | A Perfect Counter holds the attacker in place and open | New |

## Advancing family (proposal for the Programmer)

Jay already ruled this. Do not treat it as an open question. `content/abilities/seal-families.json` has no Advancing family yet, and it still lists technique 4 inside Escape under the old game name Drive Back. This note does not edit that file, and it does not change the push.

- **Family name:** Advancing
- **Suggested id:** `advancing` (same style as `escape` and `counter`)
- **What the family means:** the move steps you forward into the attacker to close the distance.
- **Members:** #4 OPEN is the only confirmed member so far. Rank 1.
- **Real technique name:** OPEN. Advancing is not the technique's name. Drive Back is retired.
- **Effect, unchanged:** a Great Counter pushes the attacker back 1.5 tiles (`counterPush`, amount 1.5). Guardians are never pushed. PR #453 measured this distance and kept it.
- **Where it sits today:** in the live file, technique 4 is a rank of `escape`. Take that rank out of Escape and put it on Advancing. Leave techniques 1, 2 and 15 where the live file already has them. Do not change the 1.5 amount.
- **Suggested rank text:** "A Great Counter pushes the attacker back." No body targets.
- **Suggested family text:** "Step forward into the attacker and close the distance."
- **Live:** true, because the push is already built. Kids who signed off #4 should still get that push when they equip Advancing.
- **NEXT:** the Programmer adds this entry to `content/abilities/seal-families.json`.

## Map of all 40 (proposed family and rank)

Names, belts and S4 effects are copied from `S4-self-defense-powers.md` (not from memory). The belt column is the belt the student is **wearing while learning** the technique (S4 rule): a student who has just earned Brown already holds #1-35 and learns #36-40 at Brown. "Rank" counts within the family. The family column is **my proposal**, except #37, which Jay moved to Counter on Nov 8, and #4, which Jay ruled is Advancing (the technique name is OPEN). Where the recast column is dated Nov 8, that column is the effect. The S4 column is the older draft. "Built?" is what the engine has (checked in `effects.ts`): **Yes** = an existing effect with a new number; **Small** = an existing effect plus a small condition (for example "only against padded-staff enemies"); **New** = one of the three allowed new mechanics; **Decision** = see the conflicts below.

| # | Belt | Technique | Family | Rank | S4 effect | Recast to fit the redesign | Built? |
|---|---|---|---|---|---|---|---|
| 1 | White | Off the Line | Counter | 1 | Counter adds 2 quick punches (new `counterHits`) | Counter hits harder | Yes |
| 2 | White | Other Side | Escape | 1 | Block recharges Dash (`dashOnBlock`) | same | Yes (built) |
| 3 | White | Spin Back Fist | Counter | 2 | Counter also hits enemies within 1.2 tiles (`rippleCounter`) | same | Yes (built) |
| 4 | White | OPEN | Advancing | 1 | Counter pushes attacker back 1.5 tiles (new `counterPush`) | Jay's ruling: the name is OPEN. Advancing is the family, not the name, and OPEN is not in Escape. Measured in PR #453: 1.5 tiles kept. | Push. Measured |
| 5 | White | Spin Elbow | Counter | 3 | Spin Back Fist reaches farther and hits harder (`rippleCounter`) | same (twist: wider ring) | Yes (built) |
| 6 | Yellow | Arm Wrap | Counter | 4 | Counter traps 10 ticks longer (`staggerTicks`) | same | Yes (built) |
| 7 | Yellow | Palm Heel | Counter | 5 | Counter hits 25% stronger (`counterStrength`) | same | Yes (built) |
| 8 | Yellow | Block and Strike | Guard | 1 | Blocks bounce 20% back (`blockReflect`) | same | Yes (built) |
| 9 | Yellow | High Block Strike | Guard | 2 | Bounce +15% and bounced hit makes attacker off-balance (new flag) | Bounce +15% only | Yes (flag dropped) |
| 10 | Yellow | Grab and Strike | Counter | 6 | Off-balance or trapped enemies take 15% more (`staggerBonus`) | same (twist) | Yes (built) |
| 11 | Orange | Outside Reap | Throw | 1 | Counter throws a brute or swarmer, down 30 ticks (new `counterThrow`) | same | New (Throw) |
| 12 | Orange | Reap and Finish | Throw | 2 | Thrown enemies take 25% more while down (new `downBonus`) | same | New (Throw) |
| 13 | Orange | Kick the Weapon | Disarm | 1 | Attacker's next attack does half damage (`disarm`) | same | Yes (built) |
| 14 | Orange | Kick and Spin | Disarm | 2 | Disarm lasts 2 attacks (new `disarmAttacks`) | Disarm cuts more (a bigger number) | Yes (flag dropped) |
| 15 | Orange | Slip and Double | Counter | 7 | Off the Line gets a 3rd punch, Counter window +1 tick (`counterHits`, `counterWindow`) | Counter window +1 tick, counter harder again | Yes |
| 16 | Green | Low-High Strike | Counter | 8 | Strikes add a second hit, 30% (`strikeExtraHit`) | One extra hit after a Great Counter, strength 0.3, same hook as the kata kick (`counterHits`). Same number on every difficulty. Measured: fits. | Yes. Measured |
| 17 | Green | Arm Bar | Lock | 1 | Counter locks attacker 20 ticks, no blocking or shield (new `counterLock`) | same | **New (Lock)** |
| 18 | Green | Slide Away | Escape | 2 | Dash through a padded-staff attack gives +10 Focus (new `dashDodgeFocus`) | Dash through any attack gives a little Focus (twist) | Small |
| 19 | Green | Wrist Lock | Disarm | 3 | Disarm vs a padded-staff enemy is full for 1 attack | Team lean: Disarm, because the built effect is a full disarm (`disarm` 1.0, capped at 0.9 in the fight rules), not a hold | Small |
| 20 | Green | Hold and Combo | Counter | 9 | Every 4 combo hits a short speed burst (`comboSpeed`) | same (twist) | Yes (built) |
| 21 | Blue | X-Block Lock | Disarm | 4 | Counters +20% vs disarmed enemies (`counterStrength`, new condition) | same (twist) | Small |
| 22 | Blue | Lock and Pin | Disarm | 5 | Disarmed enemy thrown or locked is pinned 15 ticks longer | Pinned is cut: disarm cuts more (a bigger number) | Yes (flag dropped) |
| 23 | Blue | Turn It Back | Guard | 3 | Blocking a padded-staff attack bounces 50% back (`blockReflect`, new condition) | same (twist) | Small |
| 24 | Blue | Wrist Kick | Disarm | 6 | A Strike (not only a Counter) can disarm (new `disarmOnStrike`) | same (small flag) | Small |
| 25 | Blue | Escape from Behind | Escape | 3 | Counter an attack from behind and turn to face it (new `rearCounter`) | Jay, Nov 8 (team call): a general escape. The built effect is a Block refilling Dash. Measured PE 0. No amount. | Existing Escape effect. Measured |
| 26 | Red | Shoulder Control | Guard | 4 | While an enemy is locked, Blocks take 15% less (`blockCut`, new condition) | Works alone. Measured block cut is **0.02** (the 0.15 guess does not fit). See the balance section. | Yes. Measured |
| 27 | Red | Sweep | Throw | 3 | Throws work on shields and Guarding elites (`throwAll`) | same (twist) | Small (Throw) |
| 28 | Red | Four-Corner Lock | Lock | 2 | Locks +10 ticks, disarm works on heavy overhead attacks | Lock +10 ticks (to the 30-tick ceiling) | New (Lock) |
| 29 | Red | Break Free | Escape | 4 | 2+ enemies within 1 tile: Block pushes them back 1.5 tiles (new `breakFree`) | same | **New (Break Free)** |
| 30 | Red | Break Free and Go | Escape | 5 | Break Free also off-balance and refills Dash | same (twist) | Yes (built parts) |
| 31 | Red/Black | Arm Bar Release | Lock | 3 | Locks +10 ticks. Lock end: push 1 tile and off-balance (new `lockRelease`) | Lock end: push and off-balance. No extra ticks (ceiling) | Small (Lock) |
| 32 | Red/Black | Slide to the Wrist | Lock | 4 | Locked enemies take 15% more (`staggerBonus`, new condition) | same | Small (Lock) |
| 33 | Red/Black | Party Flex | Lock | 5 | Each lock gives +5 Focus (new `lockFocus`) | same (twist) | Small (Lock) |
| 34 | Red/Black | Lock and Drop | Throw | 4 | When a lock ends, enemy is thrown instead, down 30 ticks | Works alone. Thrown enemies stay down longer. No tick count was set, and a thrown state is not in the fight rules, so this was not measured. | Not measured |
| 35 | Red/Black | Catch the Hand | Lock | 6 | A Block locks a quick attacker (wind-up 12 or less) 10 ticks (new `blockLock`) | same | Small (Lock) |
| 36 | Brown | Wide Release | Lock | 7 | Release pushes +0.5 tile, bumped enemies knock others (new flag) | same | Small (Lock) |
| 37 | Brown | Steady Hold | Counter | 10 | While holding a lock, Counter window +1 tick (`counterWindow`) | Counter family. No +1 tick. The cue is the gold "!" and COUNTER flash already in the game, plus the existing guard swish once when the window opens. Measured 0 PE. | Cue only. 0 PE |
| 38 | Brown | Lock to Takedown | Throw | 5 | Thrown stays down +15 ticks, lock throws work on shields and elites | Works alone. The +15 ticks stay written. A thrown state is not in the fight rules, so this was not measured. | Not measured |
| 39 | Brown | Release and Go | Lock | 8 | Release: enemies within 1.5 tiles off-balance, Dash refilled | same | Yes (built parts) |
| 40 | Brown | Master Hold | Throw | 6 | Locks +10 ticks, lock-thrown enemies take 25% more (`downBonus`) | Works alone. The 25% stays written. A thrown state is not in the fight rules, so this was not measured. | Not measured |

**Count by family:** Counter 10, Lock 8, Escape 5, Throw 6, Disarm 6, Guard 4, Advancing 1 (total 40). #4 OPEN is Advancing rank 1, the only member so far. #37 Steady Hold is Counter rank 10. #19 Wrist Lock is Disarm rank 3. #39 Release and Go is Lock rank 8. Counter ranks in order: #1, #3, #5, #6, #7, #10, #15, #16, #20, #37. Escape ranks in order: #2, #18, #25, #29, #30. Disarm ranks in order: #13, #14, #19, #21, #22, #24. Lock ranks in order: #17, #28, #31, #32, #33, #35, #36, #39.
**The beta (#1-15):** Counter 7 (#1, 3, 5, 6, 7, 10, 15), Guard 2 (#8, 9), Escape 1 (#2 Other Side), Advancing 1 (#4 OPEN), Disarm 2 (#13, 14), Throw 2 (#11, 12). **No Lock until Green (#17)**, as the redesign says, and Break Free arrives at Red (#29). #37 is Brown, so the beta counts do not change.
**Lopsided:** #37 is Counter and #26 stays Guard. Lock has 8 ranks, Disarm has 6, Counter has 10, Guard has 4, Advancing has 1. A kid still cannot equip all seven families, so that is fine.
**Twists:** the redesign gives every third rank a small twist. Twist ranks above (3, 6, 9) carry the S4 effect that is most like a twist. Where a plain bonus lands on a twist rank (for example Counter 6, #10), the bot can adjust. Steady Hold is Counter rank 10. It is a cue, not a power twist.

## Where S4 and the redesign disagree

**Conflict 1. Decided.** S4 added new effect kinds to Counter, Guard, Escape and Disarm (`counterHits`, `counterPush`, `reflectStaggers`, `disarmAttacks`). The redesign says those families reuse what is built. The map still recasts the others to existing effects (harder counter, bigger disarm). **#4 is the exception that keeps a push:** a counter pushes one attacker back 1.5 tiles. PR #453 measured that distance and kept it. Do not change it. Jay's ruling: the real name is **OPEN**. **Advancing** is the family, not the name. OPEN is not in the Escape family. The old game name Drive Back is retired. The earlier lean (a bigger Dash refill now, push only when Break Free is built) is not the effect. This push is one attacker, not Break Free's crowd push. Guardians are still never pushed.
**Conflict 2. Pinned and Injured are cut until after launch (redesign).** S4 had Pinned in #22 and Injured in #31-40. The map has neither. #22 Lock and Pin keeps its name and gets a bigger disarm.
**Conflict 3. Decided (team call, Nov 8).** #25 Escape from Behind is a **general escape**. Blocks or dashes create space and refill Dash, from any side. The game does not need a new "attack came from behind" check, so `rearCounter` is not the effect. No new amount was picked. **needs balance-check.**
**Conflict 4. Decided (Jay, Nov 8).** #16 stays a Counter rank, and it is one extra hit after a Great Counter, strength 0.3, the same hook as the kata kick. It is not a heal. Why: in class it is a very quick hammer fist low, then a back fist high, so the seal adds a hit. A heal would not look like that move. Game text: "quick low hammer fist, then a high back fist." No groin. No face. The same 0.3 is used on every difficulty. It was measured and it fits. The earlier lean (put the old Steady Breath heal here) is not the effect. Names are in `drafts/content/abilities/J27-audit.md`.
**Conflict 5. Decided (team call, Nov 8).** Every seal works on its own. No seal needs another seal equipped. #26, #34, #37, #38 and #40 use the stand-alone recast in the table. #26's block cut is 0.02. Steady Hold (#37) has no tick. It moved to Counter as a guard-swish cue at 0 PE: the gold "!" and the gold COUNTER flash the game already draws, plus the existing guard swish once when the window opens. #34 keeps +15 ticks down, #38 keeps +15 ticks down, and #40 keeps +25% damage. Those three were not measured, because a thrown state is not in the fight rules.
**Conflict 6. Applied Nov 8 (team lean), with one choice noted.** The 10 placeholder Seals on main (Off-Balance, Escape Step, Sweep, Steady Breath, Strong Block, Sharp Eyes, Create Distance, Disarm, Throw, Follow Through; `abilities.json`) each become a rank effect. None are thrown away.

| Old power | Lands on | What I chose |
|---|---|---|
| Off-Balance (longer stagger) | #6 Arm Wrap | Team lean, as written |
| Escape Step (Block refills Dash) | #2 Other Side | Team lean, as written |
| Sweep (counter hits nearby) | #3 Spin Back Fist | Team lean, as written |
| Sharp Eyes (longer counter window) | #15 Slip and Double | Team lean, as written |
| Create Distance (block bounces the hit) | #8 Block and Strike | Team lean, as written |
| Disarm | #13 Kick the Weapon | Team lean, as written |
| Follow Through (more damage on a staggered enemy) | #10 Grab and Strike | Team lean, as written |
| Today's "Throw" (it is really a stronger counter) | #7 Palm Heel | Team lean, as written. The real throw is #11. The old placeholder must not keep the name Throw. No new name is picked here. |
| Strong Block (blocks take less) | #26 Shoulder Control | Team lean, as written. Stand-alone, so no lock is required. The measured block cut is 0.02. |
| Steady Breath (heal on a Perfect Counter) | #10 Grab and Strike, Counter family | **It shares #10.** The seal-families lean put the heal on #16, and Jay's Nov 8 answer makes #16 an extra hit, so that home is closed. The team lean that still fits is the beta plan (`R-PROGRESSION-BETA.md`, Manager, Nov 1): Steady Breath stays in Counter and rides on the last beta Counter rank, which is #10. Grab and Strike keeps its own stagger bonus. No new rank, and no heal amount was set, so none was measured or changed. |

The new Throw seal (#11) is a different thing from today's placeholder named "Throw".

## Lock (new mechanic 2): the rule, in plain words

- **How it starts:** a Perfect Counter, with a Lock seal equipped (starts with #17 Arm Bar).
- **What happens:** the enemy is held in place for a short time. It cannot move or attack. Its shield stays down and **does not grow back** while held.
- **How long (guess):** same as the built stagger, 20 ticks (1 second), growing by ranks to a **ceiling of 30 ticks**. Reason: all S4 steps stacked (+10 at #28, #31 and #40) made one Perfect Counter 2.4 times today's, which beats a mid enemy in one go (`R-G2B-balance-check.md`, section G). So #28 is +10 and the later ranks change what the lock does at the end, not how long it lasts.
- **Who can be locked:** all enemies except Guardians. Elites too. (Guardians are never locked, thrown or pushed.)
- **How it ends:** timer runs out, or the enemy is defeated. Rank bonuses add what happens at the end (push, off balance, Dash refill).
- **Reuse:** the held enemy uses the same "can't act" state as the stagger. The new parts are the shield-stays-down rule and the end-of-lock actions.
- **Kids-safe wording and look:** "held", "wrapped". No pain, no pin, no hurt. Art: a soft glowing wrap (see `R-G2B-art-plan.md`).

## Break Free (new mechanic 3, in the Escape family): the rule

- **How it starts:** a Block while two or more enemies are within one tile (guess, S4). Equipped from #29.
- **What happens:** every enemy within that tile is pushed back (S4 guess 1.5 tiles) and stumbles. With #30 the kid also gets Dash back.
- **Who is pushed:** all enemies except Guardians.
- **Needs a limit:** S4 gave none. A push on every Block would be a free reset. A short cooldown or a once-per-wave limit is needed, **number from the test bot**.
- **Real numbers for the push (1.5 tiles, from the enemy files and 20 ticks per second):**

| Enemy | Speed (tiles/s) | Time to walk back 1.5 tiles |
|---|---|---|
| Swarmer | 4.0 | about 8 ticks (0.4 s) |
| Shield | 2.4 | about 13 ticks (0.6 s) |
| Padded-staff (Bopper) | 2.2 | about 14 ticks (0.7 s) |
| Brute | 1.2 | about 25 ticks (1.25 s) |

  Brutes get the most time. 25 ticks is almost the whole 30-tick Lock ceiling, so the push distance, not the time, should be what the bot sets.
- **Floors that need it:** a crowd floor on Red. See `R-G2B-tower-tiers-4-10.md`.

## Throw (new mechanic 1, beta): short note

The Orange beta ships Throw (#11, #12) with the Counter "throws down, enemy stays down 30 ticks, takes +25%" (S4 guesses). Control-window check: 30 ticks is 1.33x today's Perfect Counter and with #12 1.5x (`R-G2B-balance-check.md`, G). It passes. Never on Guardians. Never on a shielded enemy until #27.

## Board items from this note

R-G2B-20 (build Lock; #37 is a Counter rank and does not add a tick; #19 is Disarm, not Lock), R-G2B-21 (build Break Free and its limit), R-G2B-22 (the Nov 8 questions in this file are answered, including #19), R-G2B-23 (recast the S4 effect kinds; #4's 1.5-tile push stays; #16 is one Great Counter follow-up at strength 0.3; #26's block cut is 0.02; #37 is a cue), R-G2B-24 (the balance check for the marked rows is in the balance section of this file). Rows in `R-GREEN-TO-BLACK.md`.

## Names

Real technique names are the Content Designer's list in `drafts/content/abilities/J27-audit.md`. This note does not repeat that list.

## Balance check (measured Nov 8)

Same harness as PB-11: whole runs on the real fight rules (`startRun`, `createRunWorld`, the balance bot), 20 seeds from seed 1000, the trained-student stats in `r-bal-12-artists.ts`. Bots: kid, newer, careful, masher. Guided and Standard on belts 1–10. Challenge on belts 4–10. PE is the Insight ruler (0, 10, 20, 30, 40, 60 percent Power). A star means that difficulty's +60% Power ruler moved health-lost by less than 1 point on every belt, so that PE is not used to pick a size. Noise on this harness is about ±5 PE. The script is `drafts/planning/j21-seal-sim.ts`. The raw rows are in `drafts/planning/j21-sim-out/`.

Limits held to: a single effect at or under **PE 12**, an Insight pair under **PE 50**, a card plus the effect at or under **38**, a pair plus the effect at or under **62**, a route plus the effect at or under **67**. Double Strike stays **0.2** in `content/insights/insights.json` (it was not edited). R-BAL-12, strength-1 hits: Floor Keeper **45–54** hits on Standard and **67–80** on Challenge, knockout **5–10** hits, nothing under 5. Hearth Cook for the "trains more" student on Challenge is **86–89** hits, the exception already accepted for that boss. None of these seal effects change Power or a strength-1 hit, so that band does not move. No amount in this note is bigger or smaller on Challenge than on Guided or Standard. Challenge stays new patterns, not bigger numbers (Jay, Oct 27).

Pooled PE for the written amounts. G = Guided, S = Standard, C = Challenge.

| Effect | Bot | G | S | C |
|---|---|---|---|---|
| OPEN push 1.5 tiles (Advancing family) | kid | 0.4 | 0.2 | 0 |
| | newer | 0* | 6.8 | 6 |
| | careful | 0* | 2.2 | 28.4 |
| | masher | 0 | 0 | 0 |
| #25 dash refill on a Block | kid, newer, careful, masher | 0 | 0 | 0 |
| #16 counter follow-up 0.3 | kid | 2.9 | 0 | 0 |
| | newer | 0.6* | 6.5 | 7.1 |
| | careful | 3.8* | 11.2 | 8.2 |
| | masher | 0 | 0 | 0 |
| #16 plus the kata kick | kid | 4.5 | 0.7 | 0 |
| | newer | 0.9* | 9 | 9.9 |
| | careful | 5* | 9.6 | 2.8 |
| | masher | 0 | 0 | 0 |
| #26 block cut 0.15 | kid | 10.2 | 22.4 | 28.1 |
| | newer | 24.9* | 11.2 | 10 |
| | careful | 24.9* | 8.3 | 33 |
| | masher | 29.5 | 26.1 | 29.1 |
| Steady Hold cue | kid, newer, careful, masher | 0 | 0 | 0 |

**OPEN (Advancing family), 1.5 tiles. Kept.** On the rows that form a line, PE is 0 to 6.8. The masher is 0 because a push only happens on a Great Counter, and that bot never makes one. Careful on Challenge reads 28.4, but 1.0 tiles read 12 and 0.5 tiles read 27.2 on that same row, so it is not a clean line and it is not used to change the distance. Card plus the push stays under 38 (highest 24.6, newer, Standard). Pair plus the push stays under 62. Route plus the push stays under 67.

**#25, general escape. Kept. No amount.** The built escape is a Block refilling Dash (`dashOnBlock`). It measured PE 0 on every bot and every difficulty, including every belt. There is no smaller amount to pick. It is on or off, and on does not move the fight in this harness. Card, pair, and route ceilings stay where the cards already were.

**#16, Great Counter follow-up, strength 0.3. Kept.** A Strike-button extra hit at 0.3 did not fit (that pass is still in `j21-sim-out/*-table.json`). This pass puts the second hit on a Great Counter, the same hook as the kata kick (`counterHits`, one hit, strength 0.3). The strength is the same number on Guided, Standard, and Challenge. Challenge does not scale it (Jay, Oct 27: new patterns, not bigger numbers). Pooled PE is under 12 on every bot and every difficulty. The highest pooled score is careful Standard, 11.2. The masher is 0, because that bot never makes a Great Counter. A star means the +60% ruler moved health by less than 1 point, so that row is not used to size it. One belt reads 12.1 (kid, Guided, belt 4), inside the ±5 noise. Other single belts that read over 12 already have the bot winning every run and a ruler move under about 1 health point, so they are not used to size it, the same rule as the kata check.

**How it meets the kata kick.** The fight adds the hit counts and keeps the higher strength (`effects.ts`). #16 and the kata kick are both one hit at 0.3, so both hits land, at strength 0.3. The fight does not drop one of them. Together, pooled PE stays under 12 (highest 9.9, newer, Challenge).

**Stacks.** Heavy Hands plus #16 stays under 38 (highest 25.5, newer, Challenge). The Ripple + Heavy Hands pair stays under 50 on the rows that are not starred (highest 43.7, kid, Standard). Pair plus #16 stays under 62 (highest 54.2, careful, Standard). Rooted, Flowing, and Power routes plus #16 stay under 67 (highest 56, masher, Standard, Flowing). Pair plus both kicks stays under 62 (highest 55.2, careful, Standard). Power route plus both kicks stays under 67 (highest 50.9, kid, Challenge). A heal was not needed.

**#26, block cut. Changed from 0.15 to 0.02.** 0.15 fails (masher Standard 26.1). 0.1, the old Strong Block amount, still fails (masher Standard 22.9). 0.05 still fails (masher Standard 17.4). **0.02** is the largest amount I measured that is at or under PE 12 on Standard for every bot (masher 1.9, kid 3.1, newer 1.1, careful 0.9). Masher Challenge reads 14.8, inside the ±5 noise of the 12 line. Heavy Hands plus 0.02 stays under 38 (highest 27.1, kid). Pair plus 0.02 stays under 62. I did not measure 0.03 or 0.04, so 0.02 is the largest measured step that fit, not a finer guess.

**Steady Hold. The +1 tick is removed.** In its place the rank is a cue with no power: the gold "!" and the gold COUNTER flash the game already draws, plus the existing guard swish once when the window opens. Reduced motion keeps the still gold outline. An empty effect list, which is all this cue is in the fight rules, measured 0 PE on every bot, every difficulty, and every belt.

**#34, #38, and #40 were not measured.** "Stay down longer," "+15 ticks down," and "+25% while down" need a thrown state. That state is not in the fight rules, so there was no real hook to run. Those amounts were not changed.

Per-belt PE, Standard, for the written amounts. Belts 1 to 10.

| Effect | Bot | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Push 1.5 | kid | 0 | 5.5 | 0 | 0.3 | 1.7 | 2 | 0 | 0 | 0 | 0 |
| | newer | 3.5 | 2.2 | 2.1 | 6.7 | 8 | 8.4 | 12.7 | 12.8 | 12.7 | 11.2 |
| | careful | 29 | 0 | 8.4 | 0.3 | 0 | 0 | 0 | 0 | 0 | 0 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Escape | all four | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| #16 at 0.3 | kid | 4.5 | 5 | 0 | 0.5 | 0 | 0.4 | 3.1 | 0.7 | 2.2 | 0.9 |
| | newer | 5.3 | 6.3 | 0 | 3.6 | 11.3 | 11.7 | 14.5 | 14.6 | 14.4 | 5.8 |
| | careful | 6.9 | 7.5 | 0.4 | 4.6 | 17.9 | 17.2 | 19.9 | 19.8 | 19.9 | 15.8 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| #16 plus kata kick | kid | 4.5 | 9.9 | 0 | 1.4 | 1.2 | 4.6 | 2.6 | 0.3 | 1.4 | 0.5 |
| | newer | 10.4 | 3.5 | 1.6 | 3.2 | 13.9 | 14.5 | 15.3 | 15.4 | 13.3 | 7.4 |
| | careful | 16.8 | 9.8 | 1.1 | 8.2 | 8.8 | 8.6 | 14.3 | 13.2 | 18.5 | 11.3 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Block 0.15 | kid | 22.6 | 22.2 | 16.7 | 13.9 | 16.6 | 19.9 | 20.7 | 20.9 | 11.4 | 22.7 |
| | newer | 8.3 | 19 | 2.6 | 7.8 | 8.9 | 8.5 | 12.9 | 13.1 | 12.9 | 11.9 |
| | careful | 4.7 | 9.7 | 6.4 | 5.6 | 13.7 | 13.9 | 7.8 | 8 | 8 | 8.5 |
| | masher | 23.6 | 23.5 | 25 | 27.6 | 24.8 | 25.6 | 30.5 | 29.9 | 30 | 30.8 |
| Steady Hold cue | all four | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Challenge, belts 4 to 10, same written amounts.

| Effect | Bot | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| Push 1.5 | kid | 0 | 4.2 | 0 | 10.9 | 6.3 | 7.6 | 4 |
| | newer | 2.3 | 3.4 | 6.1 | 6.7 | 9.8 | 7.5 | 7 |
| | careful | 18.1 | 16.2 | 4.1 | 31.7 | 31.5 | 31.5 | 31 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Escape | all four | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| #16 at 0.3 | kid | 0 | 0 | 0 | 0 | 4.5 | 0 | 2.8 |
| | newer | 4 | 4.4 | 8.5 | 6.5 | 8.7 | 7.6 | 8.6 |
| | careful | 1.7 | 8.8 | 10.5 | 8.9 | 8.9 | 8.9 | 8.6 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| #16 plus kata kick | kid | 17.6 | 0 | 0 | 0 | 0 | 0 | 0 |
| | newer | 7.2 | 2.1 | 4.6 | 14.1 | 15.2 | 13.8 | 13.3 |
| | careful | 1.8 | 16.8 | 15 | 11.2 | 10.8 | 10 | 10.6 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Block 0.15 | kid | 14.1 | 25.4 | 25.4 | 20.5 | 30.3 | 29.8 | 30.2 |
| | newer | 16.3 | 9.4 | 7 | 12.3 | 9.7 | 12.8 | 8.1 |
| | careful | 19.3 | 31 | 30.7 | 34.5 | 34.4 | 34.2 | 34.6 |
| | masher | 28.1 | 28.5 | 29 | 28.6 | 28.7 | 30.2 | 30.7 |
| Steady Hold cue | all four | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Guided, belts 1 to 10, for #16. A star on the pooled row means the ruler barely moved.

| Effect | Bot | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #16 at 0.3 | kid | 4.2 | 3.5 | 3.7 | 12.1 | 3.6 | 2.8 | 4.4 | 4 | 1.2 | 5.1 |
| | newer | 0 | 0 | 2.9 | 3.1 | 0.3 | 0.3 | 0 | 0 | 0 | 0.3 |
| | careful | 2.2 | 2.9 | 32.9 | 2.2 | 3.9 | 3.9 | 5 | 5 | 5 | 5.1 |
| | masher | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Steady Hold cue | all four | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Newer and careful Guided are starred and were not used to pick a size. Careful Guided belt 3 reads 32.9 with a ruler that moved the wrong way (health-lost change −0.3), so it is not a size. The single-belt scores over 12 on Standard for newer and careful are the same kind of row: the bot already wins every run and the ruler moves about 1 health point or less.
