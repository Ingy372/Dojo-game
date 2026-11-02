# R-G2B: Seal families and ranks for #1-40, with Lock and Break Free

Written Nov 1, 2026 by the Researcher & Planner. Docs only. Source of truth: `power-and-progression-redesign.md`. Technique names and what each technique is: `S4-self-defense-powers.md` (Jay approved the list Oct 24). Everything in the "bonus" column is a **proposal**. Rule 5: the test bot sets the numbers, so no amount below is final.

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

## Map of all 40 (family, rank, twist)

"Rank" counts within the family. **Twist = every third rank** (3, 6, 9). "Built?" is what the engine has today (checked in `effects.ts` and `abilities.json`): **Yes** = an existing effect with a new number; **Small** = an existing effect plus a small condition (for example "only against padded-staff enemies"); **New** = one of the three allowed new mechanics.

| # | Belt | Technique | Family | Rank | Bonus (proposal) | Built? |
|---|---|---|---|---|---|---|
| 1 | Orange | Off the Line | Counter | 1 | Perfect Counter hits harder | Yes (S4 said "extra hits": see Conflict 1) |
| 2 | Orange | Escape Step | Escape | 1 | Dash after a Block refills a bit more | Yes |
| 3 | Orange | Parry and Strike | Counter | 2 | Counter window longer | Yes |
| 4 | Orange | Block and Redirect | Guard | 1 | Blocking cuts more damage | Yes |
| 5 | Orange | Counter Combo | Counter | 3* | Twist (S4 text) | Check |
| 6 | Orange | Arm Wrap | Counter | 4 | Stagger lasts longer | Yes |
| 7 | Orange | Parry Pop | Counter | 5 | Counter hits harder | Yes |
| 8 | Orange | Double Block | Guard | 2 | Blocking cuts more again | Yes |
| 9 | Orange | Block and Mirror | Guard | 3* | Twist: blocked hits reflect (S4: stagger reflected) | Small |
| 10 | Orange | Press On | Counter | 6* | Twist: staggered enemies take more | Yes (staggerBonus) |
| 11 | Orange | Basic Throw | Throw | 1 | Counter throws the enemy down | New (Throw) |
| 12 | Orange | Tuck and Roll | Throw | 2 | Downed enemy takes +25% | New (Throw) |
| 13 | Orange | Disarm | Disarm | 1 | Counter removes the attacker's damage for a short time | Yes |
| 14 | Orange | Disarm and Strike | Disarm | 2 | Disarm lasts longer (S4: for N attacks, new) | Yes (see Conflict 1) |
| 15 | Orange | Stagger and Cut | Counter | 7 | Counter hits harder again | Yes |
| 16 | Green | Low-High Strike | Counter | 8 | Counter hits harder again | Yes |
| 17 | Green | Arm Bar | **Lock** | 1 | **Perfect Counter locks the attacker** | **New (Lock)** |
| 18 | Green | Slide Away | Escape | 2 | Dash past a padded-staff swing refills Dash | Small |
| 19 | Green | Wrist Lock | Disarm | 3* | Twist: complete disarm of weapon enemies | Small |
| 20 | Green | Hold and Combo | Counter | 9* | Twist: faster combo speed | Yes (comboSpeed) |
| 21 | Blue | X-Block Lock | Disarm | 4 | Counters hit disarmed enemies harder | Small |
| 22 | Blue | Lock and Pin | Disarm | 5 | Disarmed enemy's next attacks do less (Pinned is cut) | Yes (see Conflict 2) |
| 23 | Blue | Turn It Back | Guard | 4 | Weapon attacks you block reflect back | Small |
| 24 | Blue | Wrist Kick | Disarm | 6* | Twist: your Strike disarms too | Small |
| 25 | Blue | Escape from Behind | Escape | 3* | Twist: a counter against a hit from behind (S4: new) | **Decision: see Conflict 3** |
| 26 | Red | Shoulder Control | Guard | 5 | Blocking cuts more again | Yes |
| 27 | Red | Sweep | Throw | 3* | Twist: Throw works on shield and Guarding enemies | Small (Throw) |
| 28 | Red | Four-Corner Lock | Lock | 2 | Lock lasts longer (to the 30-tick ceiling) | New (Lock) |
| 29 | Red | Break Free | Escape | 4 | **Block pushes crowds back** | **New (Break Free)** |
| 30 | Red | Break Free and Go | Escape | 5 | Break Free also refills Dash and leaves them off balance | Yes |
| 31 | Red/Black | Arm Bar Release | Lock | 3* | Twist: lock ends with a push | Small (Lock) |
| 32 | Red/Black | Slide to the Wrist | Lock | 4 | Locked enemies take +15% | Small (Lock) |
| 33 | Red/Black | Party Flex | Lock | 5 | Locking gives some Focus | Yes (focusGain) |
| 34 | Red/Black | Lock and Drop | Throw | 4 | Downed enemy stays down longer | Small (Throw) |
| 35 | Red/Black | Catch the Hand | Lock | 6* | Twist: a Block can lock a quick attacker | Small (Lock) |
| 36 | Brown | Wide Release | Escape | 6* | Twist: Break Free pushes farther, bumped enemies knock others | Small (Break Free) |
| 37 | Brown | Steady Hold | Lock | 7 | Lock is easier to land (counter window) | Yes |
| 38 | Brown | Lock to Takedown | Throw | 5 | Throw reaches heavier enemies | Small (Throw) |
| 39 | Brown/Black | Release and Go | Lock | 8 | Lock ends: nearby enemies off balance, Dash refilled | Yes |
| 40 | Brown/Black | Master Hold | Throw | 6* | Twist: a thrown enemy takes +25% from your Strike | Small (Throw) |

Count by family: **Counter 9, Lock 8, Escape 6, Disarm 6, Throw 6, Guard 5** (total 40). The beta (belts to Orange, #1-15) has no Lock and one Escape rank: Counter 7, Guard 3, Disarm 2, Throw 2, Escape 1. So **Lock arrives at Green (#17)**, Escape grows from Green, and the first Lock the kid can use is on the Green belt.

Items marked "Check" or "Small" need the test bot or a one-line settings change, not a new effect. Which rank is which twist comes from the redesign's every-third-rank rule. Where S4 had a twist at a different number (for example #5), the rank count above wins.

## Where S4 and the redesign disagree (Jay or the Manager decides, by pick)

**Conflict 1. S4 added new effect kinds for Counter, Guard and Disarm (extra counter hits, counter push, reflected stagger, disarm for N attacks). The redesign says those families reuse what is built.** The map above recasts them to existing effects (harder counter, longer stagger, longer disarm). It changes how #1, #4, #9, #14 and #15 feel, not which technique they are. *Planner's lean: recast. It keeps the beta smaller and the bot can still change the amounts.*
**Conflict 2. Pinned and Injured are cut until after launch (redesign).** S4 had Pinned in #22 and Injured in #31-40. The map has neither. #22 Lock and Pin keeps its name and gets a plain bonus. No Injured. If Jay wants Pin back later, it is a post-launch Lock rank.
**Conflict 3. Escape from Behind (#25) needs the game to know an attack came from behind.** That is a fourth new mechanic, and the redesign allows three. Options: A. Drop the "from behind" rule and make it a plain Escape rank. B. Keep it and count it as post-launch (launch needs only #40). *Planner's lean: A.*

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

  Brutes get the most time. 25 ticks is longer than the Lock ceiling of 30 ticks nearly, so the push distance, not the time, should be what the bot sets.
- **Floors that need it:** a crowd floor on Red. See `R-G2B-tower-tiers-4-10.md`.

## Throw (new mechanic 1, beta): short note

The Orange beta ships Throw (#11, #12) with the Counter "throws down, enemy stays down 30 ticks, takes +25%" (S4 guesses). Control-window check: 30 ticks is 1.33x today's Perfect Counter and with #12 1.5x (`R-G2B-balance-check.md`, G). It passes. Never on Guardians. Never on a shielded enemy until #27.

## Board items from this note

R-G2B-20 (build Lock), R-G2B-21 (build Break Free and its limit), R-G2B-22 (decisions for Jay on the conflicts), R-G2B-23 (recast the S4 effect kinds), R-G2B-24 (the bot run for the Budget, Spread and Newest-move tests on #16-40). Rows in `R-GREEN-TO-BLACK.md`.
