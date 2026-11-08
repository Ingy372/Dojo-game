# R-G2B: Seal families and ranks for #1-40, with Lock and Break Free

Written Nov 1, 2026 by the Researcher & Planner. Updated Nov 8, 2026 with Jay's answers (J21). Docs only. Source of truth: `power-and-progression-redesign.md`. Technique names and what each technique is: `S4-self-defense-powers.md` (Jay approved the list Oct 24) plus Jay's Nov 8 answers below. Rows Jay answered on Nov 8 are decided. The other family and "recast" cells are still a **proposal**. Rule 5: the test bot sets the numbers, so no amount below is final. Where a Nov 8 answer changes when an old amount applies, the amount is left as written and marked **needs balance-check**. No new amount was picked.

**In plain words.** Every self-defense technique becomes a rank of one of six Seal families, named by the technique. A kid picks Seals into 2-4 slots (2 at White and Yellow, 3 at Orange, Green and Blue, 4 from Red). Only three things are truly new in the game: **Throw**, **Lock** and **Break Free**. Everything else reuses something already built. This note gives all 40 a family and a rank, says which are already built, and writes down the Lock and Break Free rules so they can be built once.

## Jay's answers, Nov 8, 2026 (J21)

These win where they disagree with the Nov 1 proposal.

1. **#4 is named Advancing, and it pushes an enemy back.** The old game name Drive Back is retired. It stays in the Escape family (a push makes space). The written distance stays 1.5 tiles. **needs balance-check.** The earlier idea (a bigger Dash refill now, and the push only later) is not the effect.
2. **#25 Escape from Behind is a general escape** (team call). Blocks or dashes create space and refill Dash. The game does not need to know the attack came from behind. No new amount. **needs balance-check.**
3. **#16 is a quick two-hit follow-up (one extra hit), not a heal.** In class it is a very quick hammer fist low, then a back fist high. Game text says "quick low hammer fist, then a high back fist." It does not say groin or face. Why: the real move is two fast strikes in a row, so the seal adds a hit. A heal would not look like the move. The written amount stays `strikeExtraHit` 0.3. **needs balance-check**, because an extra hit can change how hard a fight is, and the shared Strike budget has to be checked if this hit is counted on the Strike. The name "Low-High Strike" is **not** the dojo's name (techniques are numbered; the curriculum describes this one, it does not title it). The name is kept here and flagged for Jay. It is not renamed in this note.
4. **Each seal works alone** (team call). No seal needs another seal equipped. Ranks that used to work only during a lock (#26, #34, #37, #38, #40) use their stand-alone recast. Old amounts stay. **needs balance-check** on those rows, because the bonus applies even when no other family is equipped.
5. **Old placeholder powers:** the team lean in Conflict 6 is applied, with one choice noted below. Steady Breath does **not** go on #16, because #16 is the extra hit.
6. **#37 Steady Hold moves to the Counter family. Yes.** It is Counter rank 10. Its effect is the Counter window 1 tick longer, on its own, not only while a lock is held. The 1 tick stays. **needs balance-check.**

**Still open:** #19 Wrist Lock is listed under Lock and built like a Disarm. Jay did not answer that on Nov 8.

## The six families (from the redesign) and what they do

| Family | Job | Built today? |
|---|---|---|
| Counter | A Perfect Counter hits harder, stuns longer or gives something back | Yes (counterStrength, staggerTicks, staggerBonus, counterWindow, rippleCounter, healOnPerfect, comboSpeed) |
| Guard | Blocking hurts less or sends hits back | Yes (blockCut, blockReflect) |
| Escape | Blocks or dashes make space and refill Dash. **Break Free is part of this family** | Partly (dashOnBlock). Break Free is new |
| Disarm | A Perfect Counter takes the attacker's weapon or power for a while | Yes (disarm) |
| Throw | A Perfect Counter throws the attacker down. A downed enemy takes extra damage | New |
| Lock | A Perfect Counter holds the attacker in place and open | New |

## Map of all 40 (proposed family and rank)

Names, belts and S4 effects are copied from `S4-self-defense-powers.md` (not from memory). The belt column is the belt the student is **wearing while learning** the technique (S4 rule): a student who has just earned Brown already holds #1-35 and learns #36-40 at Brown. "Rank" counts within the family. The family column is **my proposal**, except #37, which Jay moved to Counter on Nov 8. Where the recast column is dated Nov 8, that column is the effect. The S4 column is the older draft. "Built?" is what the engine has (checked in `effects.ts`): **Yes** = an existing effect with a new number; **Small** = an existing effect plus a small condition (for example "only against padded-staff enemies"); **New** = one of the three allowed new mechanics; **Decision** = see the conflicts below.

| # | Belt | Technique | Family | Rank | S4 effect | Recast to fit the redesign | Built? |
|---|---|---|---|---|---|---|---|
| 1 | White | Off the Line | Counter | 1 | Counter adds 2 quick punches (new `counterHits`) | Counter hits harder | Yes |
| 2 | White | Other Side | Escape | 1 | Block recharges Dash (`dashOnBlock`) | same | Yes (built) |
| 3 | White | Spin Back Fist | Counter | 2 | Counter also hits enemies within 1.2 tiles (`rippleCounter`) | same | Yes (built) |
| 4 | White | Advancing | Escape | 2 | Counter pushes attacker back 1.5 tiles (new `counterPush`) | Jay, Nov 8: this push is the effect. Name is Advancing, not Drive Back. 1.5 tiles stays the written guess. **needs balance-check** | Push. **needs balance-check** |
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
| 16 | Green | Low-High Strike (name flagged) | Counter | 8 | Strikes add a second hit, 30% (`strikeExtraHit`) | Jay, Nov 8: a quick two-hit follow-up (one extra hit), not a heal. Game text: "quick low hammer fist, then a high back fist." No groin or face. Amount stays 0.3. **needs balance-check** | Yes (`strikeExtraHit`). **needs balance-check** |
| 17 | Green | Arm Bar | Lock | 1 | Counter locks attacker 20 ticks, no blocking or shield (new `counterLock`) | same | **New (Lock)** |
| 18 | Green | Slide Away | Escape | 3 | Dash through a padded-staff attack gives +10 Focus (new `dashDodgeFocus`) | Dash through any attack gives a little Focus (twist) | Small |
| 19 | Green | Wrist Lock | Lock | 2 | Disarm vs a padded-staff enemy is full for 1 attack | same (redesign lists Wrist Lock under Lock: Jay's call) | Small |
| 20 | Green | Hold and Combo | Counter | 9 | Every 4 combo hits a short speed burst (`comboSpeed`) | same (twist) | Yes (built) |
| 21 | Blue | X-Block Lock | Disarm | 3 | Counters +20% vs disarmed enemies (`counterStrength`, new condition) | same (twist) | Small |
| 22 | Blue | Lock and Pin | Disarm | 4 | Disarmed enemy thrown or locked is pinned 15 ticks longer | Pinned is cut: disarm cuts more (a bigger number) | Yes (flag dropped) |
| 23 | Blue | Turn It Back | Guard | 3 | Blocking a padded-staff attack bounces 50% back (`blockReflect`, new condition) | same (twist) | Small |
| 24 | Blue | Wrist Kick | Disarm | 5 | A Strike (not only a Counter) can disarm (new `disarmOnStrike`) | same (small flag) | Small |
| 25 | Blue | Escape from Behind | Escape | 4 | Counter an attack from behind and turn to face it (new `rearCounter`) | Jay, Nov 8 (team call): a general escape. Blocks or dashes create space and refill Dash. No behind-only rule. No new amount. **needs balance-check** | Existing Escape effects. **needs balance-check** |
| 26 | Red | Shoulder Control | Guard | 4 | While an enemy is locked, Blocks take 15% less (`blockCut`, new condition) | Jay, Nov 8: Blocks take 15% less with no lock needed. 15% stays. **needs balance-check** | Yes (condition dropped). **needs balance-check** |
| 27 | Red | Sweep | Throw | 3 | Throws work on shields and Guarding elites (`throwAll`) | same (twist) | Small (Throw) |
| 28 | Red | Four-Corner Lock | Lock | 3 | Locks +10 ticks, disarm works on heavy overhead attacks | Lock +10 ticks (to the 30-tick ceiling) | New (Lock) |
| 29 | Red | Break Free | Escape | 5 | 2+ enemies within 1 tile: Block pushes them back 1.5 tiles (new `breakFree`) | same | **New (Break Free)** |
| 30 | Red | Break Free and Go | Escape | 6 | Break Free also off-balance and refills Dash | same (twist) | Yes (built parts) |
| 31 | Red/Black | Arm Bar Release | Lock | 4 | Locks +10 ticks. Lock end: push 1 tile and off-balance (new `lockRelease`) | Lock end: push and off-balance. No extra ticks (ceiling) | Small (Lock) |
| 32 | Red/Black | Slide to the Wrist | Lock | 5 | Locked enemies take 15% more (`staggerBonus`, new condition) | same | Small (Lock) |
| 33 | Red/Black | Party Flex | Lock | 6 | Each lock gives +5 Focus (new `lockFocus`) | same (twist) | Small (Lock) |
| 34 | Red/Black | Lock and Drop | Throw | 4 | When a lock ends, enemy is thrown instead, down 30 ticks | Jay, Nov 8: Throw works alone. Thrown enemies stay down longer. No new tick count. **needs balance-check** | Small (Throw). **needs balance-check** |
| 35 | Red/Black | Catch the Hand | Lock | 7 | A Block locks a quick attacker (wind-up 12 or less) 10 ticks (new `blockLock`) | same | Small (Lock) |
| 36 | Brown | Wide Release | Lock | 8 | Release pushes +0.5 tile, bumped enemies knock others (new flag) | same | Small (Lock) |
| 37 | Brown | Steady Hold | Counter | 10 | While holding a lock, Counter window +1 tick (`counterWindow`) | Jay, Nov 8: Counter family. Window +1 tick on its own, not only while locking. The 1 tick stays. **needs balance-check** | Yes. **needs balance-check** |
| 38 | Brown | Lock to Takedown | Throw | 5 | Thrown stays down +15 ticks, lock throws work on shields and elites | Jay, Nov 8: works alone. Thrown stays down +15 ticks. That number stays. **needs balance-check** | Yes. **needs balance-check** |
| 39 | Brown | Release and Go | Lock | 9 | Release: enemies within 1.5 tiles off-balance, Dash refilled | same | Yes (built parts) |
| 40 | Brown | Master Hold | Throw | 6 | Locks +10 ticks, lock-thrown enemies take 25% more (`downBonus`) | Jay, Nov 8: works alone. Thrown enemies take 25% more again (no extra lock time: ceiling). 25% stays. **needs balance-check** | Yes. **needs balance-check** |

**Count by family (after Nov 8):** Counter 10, Lock 9, Escape 6, Throw 6, Disarm 5, Guard 4 (total 40). #37 Steady Hold moved from Lock to Counter. #39 Release and Go is now Lock rank 9. Counter ranks in order: #1, #3, #5, #6, #7, #10, #15, #16, #20, #37.
**The beta (#1-15):** Counter 7 (#1, 3, 5, 6, 7, 10, 15), Guard 2 (#8, 9), Escape 2 (#2 Other Side, #4 Advancing), Disarm 2 (#13, 14), Throw 2 (#11, 12). **No Lock until Green (#17)**, as the redesign says, and Break Free arrives at Red (#29). #37 is Brown, so the beta counts do not change.
**Lopsided:** Jay (Nov 8) said yes: #37 moves to Counter, and #26 stays Guard. Lock now has 9 ranks and Counter has 10. Guard still has 4. A kid still cannot equip all six families, so that is fine.
**Twists:** the redesign gives every third rank a small twist. Twist ranks above (3, 6, 9) carry the S4 effect that is most like a twist. Where a plain bonus lands on a twist rank (for example Counter 6, #10), the bot can adjust. Steady Hold is Counter rank 10, so its +1 tick is a plain bonus, not a twist.

## Where S4 and the redesign disagree

**Conflict 1. Decided (Jay, Nov 8).** S4 added new effect kinds to Counter, Guard, Escape and Disarm (`counterHits`, `counterPush`, `reflectStaggers`, `disarmAttacks`). The redesign says those families reuse what is built. The map still recasts the others to existing effects (harder counter, bigger disarm). **#4 is the exception Jay kept:** the name is **Advancing**, and a counter pushes one enemy back. The old name Drive Back is retired. The written distance stays 1.5 tiles. **needs balance-check.** The earlier lean (a bigger Dash refill now, push only when Break Free is built) is not the effect. This push is one enemy, not Break Free's crowd push. Guardians are still never pushed.
**Conflict 2. Pinned and Injured are cut until after launch (redesign).** S4 had Pinned in #22 and Injured in #31-40. The map has neither. #22 Lock and Pin keeps its name and gets a bigger disarm.
**Conflict 3. Decided (team call, Nov 8).** #25 Escape from Behind is a **general escape**. Blocks or dashes create space and refill Dash, from any side. The game does not need a new "attack came from behind" check, so `rearCounter` is not the effect. No new amount was picked. **needs balance-check.**
**Conflict 4. Decided (Jay, Nov 8).** #16 stays a Counter rank, and it is a **quick two-hit follow-up (one extra hit)**, not a heal. Why: in class it is a very quick hammer fist low, then a back fist high, so the seal should add a hit. A heal would not look like that move. Game text: "quick low hammer fist, then a high back fist." No groin. No face. The written amount stays `strikeExtraHit` 0.3. **needs balance-check**, because an extra hit can change how hard a fight is, and Strikes are supposed to share one budget. The earlier lean (put the old Steady Breath heal here) is not the effect. The Low-High **name** clash with the Blue kick combo is resolved on the Strike side: that combo is Hook Kick, not Low-High Kicks (`R-G2B-strikes-4-7.md`, J20). **Name flag:** "Low-High Strike" is not the dojo's name for #16. The curriculum numbers the technique and describes the low strike then the high strike. The name is kept until Jay says what to call it.
**Conflict 5. Decided (team call, Nov 8).** Every seal works on its own. No seal needs another seal equipped. #26, #34, #37, #38 and #40 use the stand-alone recast in the table. Old amounts stay (15% block cut, +15 ticks down, +1 counter tick, +15 ticks down, +25% damage). **needs balance-check** on each, because the bonus used to wait for a lock and now it does not. No new amount was picked.
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
| Strong Block (blocks take less) | #26 Shoulder Control | Team lean, as written. Stand-alone, so no lock is required. The written 15% stays. **needs balance-check** |
| Steady Breath (heal on a Perfect Counter) | #10 Grab and Strike, Counter family | **Not the seal-families lean.** That lean put the heal on #16. Jay's Nov 8 answer makes #16 an extra hit, so the heal cannot live there. **Choice:** keep the heal on #10, which is the home already written in `R-PROGRESSION-BETA.md` (Manager, Nov 1). No heal amount is set. **needs balance-check.** If the heal should not share #10, Jay can name another Counter rank. |

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

R-G2B-20 (build Lock; #37 is a Counter rank, not a Lock rank), R-G2B-21 (build Break Free and its limit), R-G2B-22 (Nov 8 answers are in this file; #19 Wrist Lock is still open), R-G2B-23 (recast the S4 effect kinds; #4's push and #16's extra hit stay), R-G2B-24 (the bot run for the Budget, Spread and Newest-move tests on #16-40, including every row marked **needs balance-check**). Rows in `R-GREEN-TO-BLACK.md`.

## Names to check with Jay (not renamed here)

Self-defense techniques in the curriculum are numbers. Most short names in the table were written for the game. They are flagged, not renamed, except **Advancing** (#4), which Jay named on Nov 8.

**Kept because Jay used the words:** Arm Bar, Wrist Lock, Party Flex, and Four-Corner Lock (shortened from "four-corner shoulder lock"). He wrote "osotogari" for #11. The English "Outside Reap" is not his word.

**Flagged (planner subtitles, not curriculum titles):** Off the Line, Other Side, Spin Back Fist, Spin Elbow, Arm Wrap, Palm Heel, Block and Strike, High Block Strike, Grab and Strike, Outside Reap, Reap and Finish, Kick the Weapon, Kick and Spin, Slip and Double, **Low-High Strike**, Slide Away, Hold and Combo, X-Block Lock, Lock and Pin, Turn It Back, Wrist Kick, Escape from Behind, Shoulder Control, Sweep, Break Free, Break Free and Go, Arm Bar Release, Slide to the Wrist, Lock and Drop, Catch the Hand, Wide Release, Steady Hold, Lock to Takedown, Release and Go, Master Hold.

Break Free is the kid-safe stand-in already chosen so the game never says choke. It is still not the curriculum's title. Escape from Behind is taken from Jay's result line "Escape from behind," not from a separate technique name. Low-High Strike is the one J21 asked about: it is not the dojo's name. The old placeholder name Throw, on the stronger-counter effect, also needs a real name. None of these were renamed in this note.
