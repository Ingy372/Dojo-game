# R-G2B: Seal families and ranks for #1-40, with Lock and Break Free

Written Nov 1, 2026 by the Researcher & Planner. Docs only. Source of truth: `power-and-progression-redesign.md`. Technique names and what each technique is: `S4-self-defense-powers.md` (Jay approved the list Oct 24). Everything in the family and "recast" columns is a **proposal**. Rule 5: the test bot sets the numbers, so no amount below is final.

**In plain words.** Every self-defense technique becomes a rank of one of six Seal families, named by the technique. A kid picks Seals into 2-4 slots (2 at White and Yellow, 3 at Orange, Green and Blue, 4 from Red). Only three things are truly new in the game: **Throw**, **Lock** and **Break Free**. Everything else reuses something already built. This note gives all 40 a family and a rank, says which are already built, and writes down the Lock and Break Free rules so they can be built once.

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

Names, belts and S4 effects are copied from `S4-self-defense-powers.md` (not from memory). The belt column is the belt the student is **wearing while learning** the technique (S4 rule): a student who has just earned Brown already holds #1-35 and learns #36-40 at Brown. "Rank" counts within the family. The family column is **my proposal**: the redesign says Jay decides which family each technique belongs to. "Built?" is what the engine has (checked in `effects.ts`): **Yes** = an existing effect with a new number; **Small** = an existing effect plus a small condition (for example "only against padded-staff enemies"); **New** = one of the three allowed new mechanics; **Decision** = see the conflicts below.

| # | Belt | Technique | Family | Rank | S4 effect | Recast to fit the redesign | Built? |
|---|---|---|---|---|---|---|---|
| 1 | White | Off the Line | Counter | 1 | Counter adds 2 quick punches (new `counterHits`) | Counter hits harder | Yes |
| 2 | White | Other Side | Escape | 1 | Block recharges Dash (`dashOnBlock`) | same | Yes (built) |
| 3 | White | Spin Back Fist | Counter | 2 | Counter also hits enemies within 1.2 tiles (`rippleCounter`) | same | Yes (built) |
| 4 | White | Drive Back | Escape | 2 | Counter pushes attacker back 1.5 tiles (new `counterPush`) | Needs a decision (Conflict 1) | Decision |
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
| 16 | Green | Low-High Strike | Counter | 8 | Strikes add a second hit, 30% (`strikeExtraHit`) | Counter rank: a Perfect Counter heals a little (`healOnPerfect`, the old Steady Breath finds a home). See Conflicts 4 and 6 | Decision |
| 17 | Green | Arm Bar | Lock | 1 | Counter locks attacker 20 ticks, no blocking or shield (new `counterLock`) | same | **New (Lock)** |
| 18 | Green | Slide Away | Escape | 3 | Dash through a padded-staff attack gives +10 Focus (new `dashDodgeFocus`) | Dash through any attack gives a little Focus (twist) | Small |
| 19 | Green | Wrist Lock | Lock | 2 | Disarm vs a padded-staff enemy is full for 1 attack | same (redesign lists Wrist Lock under Lock: Jay's call) | Small |
| 20 | Green | Hold and Combo | Counter | 9 | Every 4 combo hits a short speed burst (`comboSpeed`) | same (twist) | Yes (built) |
| 21 | Blue | X-Block Lock | Disarm | 3 | Counters +20% vs disarmed enemies (`counterStrength`, new condition) | same (twist) | Small |
| 22 | Blue | Lock and Pin | Disarm | 4 | Disarmed enemy thrown or locked is pinned 15 ticks longer | Pinned is cut: disarm cuts more (a bigger number) | Yes (flag dropped) |
| 23 | Blue | Turn It Back | Guard | 3 | Blocking a padded-staff attack bounces 50% back (`blockReflect`, new condition) | same (twist) | Small |
| 24 | Blue | Wrist Kick | Disarm | 5 | A Strike (not only a Counter) can disarm (new `disarmOnStrike`) | same (small flag) | Small |
| 25 | Blue | Escape from Behind | Escape | 4 | Counter an attack from behind and turn to face it (new `rearCounter`) | Decision (Conflict 3) | Decision |
| 26 | Red | Shoulder Control | Guard | 4 | While an enemy is locked, Blocks take 15% less (`blockCut`, new condition) | Blocks take 15% less (no lock needed: Conflict 5) | Yes (condition dropped) |
| 27 | Red | Sweep | Throw | 3 | Throws work on shields and Guarding elites (`throwAll`) | same (twist) | Small (Throw) |
| 28 | Red | Four-Corner Lock | Lock | 3 | Locks +10 ticks, disarm works on heavy overhead attacks | Lock +10 ticks (to the 30-tick ceiling) | New (Lock) |
| 29 | Red | Break Free | Escape | 5 | 2+ enemies within 1 tile: Block pushes them back 1.5 tiles (new `breakFree`) | same | **New (Break Free)** |
| 30 | Red | Break Free and Go | Escape | 6 | Break Free also off-balance and refills Dash | same (twist) | Yes (built parts) |
| 31 | Red/Black | Arm Bar Release | Lock | 4 | Locks +10 ticks. Lock end: push 1 tile and off-balance (new `lockRelease`) | Lock end: push and off-balance. No extra ticks (ceiling) | Small (Lock) |
| 32 | Red/Black | Slide to the Wrist | Lock | 5 | Locked enemies take 15% more (`staggerBonus`, new condition) | same | Small (Lock) |
| 33 | Red/Black | Party Flex | Lock | 6 | Each lock gives +5 Focus (new `lockFocus`) | same (twist) | Small (Lock) |
| 34 | Red/Black | Lock and Drop | Throw | 4 | When a lock ends, enemy is thrown instead, down 30 ticks | Throw works alone: thrown enemies stay down longer (Conflict 5) | Small (Throw) |
| 35 | Red/Black | Catch the Hand | Lock | 7 | A Block locks a quick attacker (wind-up 12 or less) 10 ticks (new `blockLock`) | same | Small (Lock) |
| 36 | Brown | Wide Release | Lock | 8 | Release pushes +0.5 tile, bumped enemies knock others (new flag) | same | Small (Lock) |
| 37 | Brown | Steady Hold | Lock | 9 | While holding a lock, Counter window +1 tick (`counterWindow`) | same (twist) | Yes |
| 38 | Brown | Lock to Takedown | Throw | 5 | Thrown stays down +15 ticks, lock throws work on shields and elites | Thrown stays down +15 ticks | Yes |
| 39 | Brown | Release and Go | Lock | 10 | Release: enemies within 1.5 tiles off-balance, Dash refilled | same | Yes (built parts) |
| 40 | Brown | Master Hold | Throw | 6 | Locks +10 ticks, lock-thrown enemies take 25% more (`downBonus`) | Thrown enemies take 25% more again (no extra lock time: ceiling) (twist) | Yes |

**Count by family:** Lock 10, Counter 9, Escape 6, Throw 6, Disarm 5, Guard 4 (total 40).
**The beta (#1-15):** Counter 7 (#1, 3, 5, 6, 7, 10, 15), Guard 2 (#8, 9), Escape 2 (#2, 4), Disarm 2 (#13, 14), Throw 2 (#11, 12). **No Lock until Green (#17)**, as the redesign says, and Break Free arrives at Red (#29).
**Lopsided:** Lock has 10 ranks and Guard has 4. A kid can't equip all six families anyway, so some lopsidedness is fine, but it means the Guard Seal tops out early while the Lock Seal keeps growing to Brown. A way to even it: move #37 Steady Hold (a counter-window effect) to Counter, and #26 stays Guard. Jay's call, listed in R-G2B-22.
**Twists:** the redesign gives every third rank a small twist. Twist ranks above (3, 6, 9) carry the S4 effect that is most like a twist. Where a plain bonus lands on a twist rank (for example Counter 6, #10), the bot can adjust.

## Where S4 and the redesign disagree (Jay or the Manager decides, by pick)

**Conflict 1. S4 added new effect kinds to Counter, Guard, Escape and Disarm (`counterHits`, `counterPush`, `reflectStaggers`, `disarmAttacks`). The redesign says those families reuse what is built.** The map recasts them to existing effects (harder counter, bigger disarm). The odd one is **#4 Drive Back**, which needs a push, and it is in the beta. Options: A. Recast #4 to a built Escape effect now (bigger Dash refill), and let the push arrive with Break Free after the beta, so it is built once. B. Build a small one-enemy push in the beta. *Planner's lean: A.*
**Conflict 2. Pinned and Injured are cut until after launch (redesign).** S4 had Pinned in #22 and Injured in #31-40. The map has neither. #22 Lock and Pin keeps its name and gets a bigger disarm.
**Conflict 3. Escape from Behind (#25) needs the game to know an attack came from behind.** That is a fourth new mechanic, and the redesign allows three. Options: A. Drop the "from behind" rule and make #25 a plain Escape rank. B. Keep it and ship it after launch, since launch only needs up to #40. *Planner's lean: A.*
**Conflict 4. Low-High Strike (#16) and Strikes.** S4 made #16 "Strikes add a second hit". Now the Strike slot holds one Strike and the Strike shape decides its hits. As a Seal, an extra Strike hit would change a Strike's budget, which the redesign says all Strikes share. Options: A. Make #16 a Counter rank that carries the old Steady Breath effect (heal on a Perfect Counter). B. Keep it as a Strike modifier and make the bot check it. *Planner's lean: A.* (This is the seal side of the "Low-High" name question in `R-G2B-strikes-4-7.md`.)
**Conflict 5. Several S4 ranks only work if another family is equipped (#26 needs a lock, #34 and #38 and #40 work off a lock, #37 holds only while locking).** With 6 families and 2-4 slots, a kid will often not have the other one equipped, so that rank would do nothing. Rule proposed: **every rank works on its own.** The map recasts those to stand-alone effects. *Planner's lean: yes.*
**Conflict 6. The 10 placeholder Seals on main** (Off-Balance, Escape Step, Sweep, Steady Breath, Strong Block, Sharp Eyes, Create Distance, Disarm, Throw, Follow Through; `abilities.json`) each become a rank effect. Eight land on S4 ranks: Off-Balance = #6, Escape Step = #2, Sweep = #3, Sharp Eyes = #15 (counter window), Create Distance = #8 (bounce back), Disarm = #13, Follow Through = #10, and **today's "Throw" (it is really a stronger Counter) = #7 Palm Heel**. The two homeless ones: **Strong Block** goes to #26 Shoulder Control (S4 already said so). **Steady Breath** goes to #16 in this proposal. The new Throw seal (#11) is a different thing from today's placeholder named "Throw": the name clash needs a rename of the old one. *Planner's lean: as written.*

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

R-G2B-20 (build Lock), R-G2B-21 (build Break Free and its limit), R-G2B-22 (decisions for Jay on the six conflicts and the family list), R-G2B-23 (recast the S4 effect kinds), R-G2B-24 (the bot run for the Budget, Spread and Newest-move tests on #16-40). Rows in `R-GREEN-TO-BLACK.md`.
