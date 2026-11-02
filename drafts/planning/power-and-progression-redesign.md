# Dojo Ascent: Power & Progression Redesign

Oct 30, 2026 · @Jayson Lindemuth

## Why we're changing it

Technique powers move from "every move gets its own power and they all stack" to "moves unlock choices you equip in a few slots." That one change makes the game balanceable and buildable before the Dec 15 beta.

The current plan gives each technique a unique power: 7 kick combos, 40 self-defense techniques, 9 katas and 5 stances. That is about 60 effects, all active at once. The self-defense draft alone needs about 10 new effect types and new enemy states.

When every power stacks, each new one has to be either too small to notice or big enough to break the tower. Players then skip weak moves or coast on strong ones. Limited slots remove that trap: a new move only has to be different, not stronger.

**What stays as built:** sign-off stats, levels and XP, Training Point Health, stripes and Virtues, stances, gear, Insight cards, and the Power Rating weights (real training stays about two-thirds of strength).

## Design rules

Every technique power must follow these seven rules. When a bot is unsure, these rules decide, not Jay.

1. **Learning unlocks choices; stats carry growth.** Every sign-off still adds Power and Health as built. The technique itself adds an option, not a bigger number.
2. **Equip, don't stack.** Every technique power lives in a slot. Nothing is active unless it is equipped.
3. **Sidegrades, not upgrades.** A new option in a slot plays differently but costs the same power budget as the others.
4. **The real technique comes first.** The in-game effect must look and feel like what the technique does in class.
5. **Nothing ships outside its band.** The test bot sets the numbers. No number is picked by feel.
6. **Reuse before inventing.** A new power reuses an existing effect type where it can. At most one new mechanic per belt.
7. **Never punish missing class.** Unlocks never expire and the game never takes power away.

## The loadout

The Fighting Style screen becomes a loadout with five kinds of slots. Stance and Virtue already work this way; Strike, Kata and Seals join them.

| Slot | Filled by | How many equipped | Unlocked by | Status |
| --- | --- | --- | --- | --- |
| Stance | The 5 stances | 1 | Stance sign-off | Built |
| Virtue | Stripe Virtues | 1 | Character stripes | Built |
| Strike | One Strike per kick combo | 1 | Kick combo sign-off | Change: today combos stack as unlocks |
| Kata | One power per kata | 1 | Kata sign-off | New |
| Seals | Self-defense families (see below) | 2 to 4, by belt | Self-defense sign-offs | Change: today all Seals are always on |

**Seal slots by belt (starting proposal, the test bot confirms):**

| Belt | Seal slots |
| --- | --- |
| White, Yellow | 2 |
| Orange, Green, Blue | 3 |
| Red and above | 4 |

There are 6 Seal families, so even a black belt never equips all of them. Choosing stays meaningful at every belt.

## Power budget and balance tests

Balance uses the tool already proven on Insight cards: the kid test bot measures each option in Power-Equivalent (PE) and in win rate. Every option in a slot gets the same target, and the bot checks it before it ships.

| Slot | Target per option | Where the target comes from |
| --- | --- | --- |
| Insight card | about 20 PE | Already set (R-INSIGHT-BAL) |
| Kata power | 12 PE | Already reserved (R-INSIGHT-BAL section 6) |
| Strike | Same as Spin Kick today | Spin Kick is built and tested, so it is the baseline |
| Seal | Set by the first bot run, at the belt's typical rank | New |

**The four tests every new power must pass:**

1. **Budget:** its PE is within 15% of the slot target.
2. **Spread:** the bot's win rate with it is within 5 points of the slot average. (Insight routes today spread 43.4% to 49.3%, so this matches what already passes.)
3. **Newest move:** on its own belt's floors, a greedy bot that always picks the best option ranks the newest option in its top 2. This keeps new moves wanted.
4. **Curve:** a typical student's Power Rating still hits the belt pacing targets already in the design.

The existing +12% damage cap on stance plus kata stays. A power that fails any test goes back for a number change, not to Jay.

## Self-defense Seal families

The 40+ self-defense techniques feed 6 Seal families instead of 40 separate powers. A family's first technique unlocks its Seal; every later technique in that family ranks it up and is named on the rank.

| Family | What it does in game | Mechanic | Status | Draft techniques that fit |
| --- | --- | --- | --- | --- |
| Counter | Great Counters hit harder or stagger longer | Existing counter effects | Built | Off-Balance, Sharp Eyes, Follow Through, Steady Breath |
| Guard | Blocks take less or push damage back | Existing block effects | Built | Strong Block, Create Distance, Turn It Back |
| Escape | Blocks or dashes create space and refill Dash | Existing dashOnBlock, plus breakFree | Partly built | Escape Step, Slide Away, Break Free, Escape from Behind |
| Disarm | The attacker's next hits do less damage | Existing disarm effect | Built | Disarm, Kick the Weapon, Wrist Kick |
| Throw | Counters knock enemies down for a short time | New counterThrow + thrown state | Not built | Sweep, Throw, Outside Reap, Reap and Finish |
| Lock | Counters hold an enemy in place | New counterLock + locked state | Not built | Arm Bar, Wrist Lock, Four-Corner Lock, the Red/Black and Brown locks |

This needs 3 new mechanics (Throw, Lock, Break Free) instead of about 10. Pinned and Injured states are cut until after launch. The 10 placeholder Seals on main are not thrown away: each becomes a rank effect in its family, which also gives Steady Breath and Strong Block a home.

**Rank rules:**

- Each technique in a family adds 1 rank and shows the real technique's name, for example "Throw Seal, Rank 3: Reap and Finish."
- Most ranks add a small, plain bonus (longer knock-down, bigger damage cut). Every third rank adds a small twist, such as a Throw that also works on shield enemies.
- Jay decides which family each real technique belongs to. The family list can be renamed or merged.

## Kick combos become Strikes

Each kick combo unlocks one Strike, and the student equips one. All Strikes cost 30 Focus and share Spin Kick's budget; they differ in shape, not strength.

Strikes are built from settings the current Strike already has (reach, number of hits, area, movement), so combos 3 to 7 need no new effect types. The finishing move of each combo gives its Strike its look.

| Kick combo | Belt | Strike shape | Status |
| --- | --- | --- | --- |
| #1 | White | Spin Kick: one heavy hit, long reach | Built |
| #2 | Yellow | Jumping Spins: three spins that build momentum, like in class: the first is light, the second stronger, the third the strongest yet (example ramp: 5, then 7, then 12). Each landed spin powers up the next. Spin Kick still hits harder than the opening spin, and landing all three beats Spin Kick in total | New, from existing settings |
| #3 | Orange | Butterfly Flow: spins the opposite way from Spin Kick, hits a good bit harder, but is slower to land | Built, needs moving from #2 and retuning |
| #4 | Green | Side Kick Drive: steps forward and pushes the enemy back | Later |
| #5 | Blue | Hook Kick: curves around blocks and shields to hit the enemy behind them | Later |
| #6 | Red | Lunge: closes distance fast, then strikes | Later |
| #7 | Red/Black | Spinning Finisher: multi-hit spin around you | Later |
| #8 to #12 | Black | Not defined | Waits on Jay's black belt combos |

Jay approved all seven Strike shapes on Oct 30. The test bot sets the final numbers: Spin Kick is strength 2.5 today, so the three Jumping Spins hits must add up to more than 2.5 when all land, and Butterfly Flow sits above 2.5 with a longer wind-up.

## Katas

Jay's Oct 30 plan already fits the loadout: each signed-off kata gives one power, and the student brings one into the tower. A white belt can only pick Basic Form 1; an orange belt picks from 3.

**Kata power rules:**

- Budget is 12 PE, the amount already reserved for one kata power.
- Stance plus kata stays under the +12% damage cap, with no lost guard and no shorter wind-ups (from R-KATA-POWERS).
- A kata power changes how you fight (a rhythm, a stance shift, a calm moment) more than it adds raw damage. That keeps it different from Strikes and Seals.
- For the beta, kata powers are passive only. The test bot cannot fire activated powers yet, so activated kata powers come after the beta.

Jay still sends the actual powers. The planner's menu in R-KATA-POWERS can be used as examples, not as the list.

## Making new moves exciting

Kids get excited by seeing the move they learned show up and win a fight, not by a bigger number. Four pieces make that happen without breaking balance.

1. **The unlock moment.** When a sign-off syncs, the next time the student opens the game a short screen shows the real technique name and the new Strike, Seal rank or kata power. The wording is in kid words ("Your throws now knock enemies down longer"), never a stat dump.
2. **Sensei's Trial.** The first run after an unlock opens with one short room built so the new move shines, with the move auto-equipped for that room. Clearing it gives a small one-time reward, like a decoration or bonus XP.
3. **Floors that need the new move.** Each belt's tower floors bring an enemy the newest family answers best. Orange floors add grabbers and brutes (Throw shines); green adds padded-staff enemies (Disarm and Lock shine); red adds crowds that surround you (Escape shines). Kids pick what gets them through fastest, so the newest move becomes the easy answer.
4. **Ranks with real names.** Every self-defense sign-off shows on a Seal by its real name, so even a small rank-up feels like it came from class.

Test 3 in the balance section checks that the newest option is actually wanted on its own floors.

## Beta scope (Dec 15, freeze Dec 4)

The tower only has floors for tiers 1 to 3, so the beta needs White, Yellow and Orange content and nothing above it. Everything from Green up uses the same templates after launch.

| Item | In the beta | Work needed |
| --- | --- | --- |
| Loadout screen with Stance, Virtue, Strike, Seal and Kata slots | Yes | Build the screen and the equip rules |
| Strikes 1 to 3 | Yes | Spin Kick built; Jumping Spins new from existing settings; move Butterfly Flow to #3 |
| Seals for self-defense #1 to #15 | Yes | Counter, Guard, Escape, Disarm reuse built effects; Throw is the one new mechanic |
| Seal slots: 2 at White and Yellow, 3 at Orange | Yes | Slot rule in code |
| Kata powers for Basic Form 1, Basic Form 2, Keon | Jay decides | Passive only if they ship |
| Unlock screen and Sensei's Trial room | Yes | One room template, one screen |
| Orange floor grabber or brute behavior for Throw | Yes | Enemy tuning |
| Balance tests 1 to 4 on every slot | Yes | Extend the Insight test bot |

**After the beta:** Lock and Break Free mechanics, padded-staff enemies, Green and above content, activated kata powers, spending Training Points on upgrades, Injured and Pinned states, Street Smarts and Mastery power.

## Who does what

Jay supplies real-world facts; the bots and the test bot turn them into effects and numbers. Bots ask Jay only three kinds of questions: what a real technique does, which family it belongs to, and whether a name sounds right.

**Jay's template, one row per technique:**

| Technique | Belt and number | What it does in real life (one sentence) | Family | What kids love about it (optional) |
| --- | --- | --- | --- | --- |
| Example: Outside Reap | Orange #11 | Step outside the attacker's leg and sweep it to take them down | Throw | Seeing a bigger partner go down |

**The AI team's jobs:**

| Who | Does |
| --- | --- |
| Content Writer bot | Turns Jay's sentence into the in-game name, rank text and kid-friendly unlock line |
| Learning & Engagement Designer bot | Checks the effect matches the real technique and the class lesson |
| Claude Code | Builds the effect from existing settings, or the one new mechanic for that belt |
| QA bot and the test bot | Run balance tests 1 to 4 and send failures back for a number change |
| Art Director bot | Unlock screen art and Sensei's Trial room |

Any decision these rules already answer does not go to Jay.

## Decisions waiting on Jay

Six decisions unblock the beta; the rest can wait until after launch.

**Before the Dec 4 freeze:**

- [ ] Approve the core change: technique powers are equipped in slots, not stacked. (i agree)
- [ ] Approve the 6 Seal families, or rename or merge any of them. (i  agree)
- [ ] Fill the template for self-defense #1 to #15: one sentence and a family for each. (already done)
- [ ] Confirm Butterfly Flow moves to kick combo #3 and Jumping Spins takes #2. (confirmed)
- [ ] Decide whether kata powers ship in the beta (passive only) or wait. (kata powers need to ship in beta)
- [ ] Okay the starting Seal slots: 2 at White and Yellow, 3 at Orange. (fine with me)

**After launch:**

- [ ] Describe self-defense #36 to #45.
- [ ] Settle Possi's #41 to #45 against the #40 cap.
- [ ] Describe black belt kick combos #8 to #12.
