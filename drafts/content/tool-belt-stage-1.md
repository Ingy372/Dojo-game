# DRAFT for Jay: Tool Belt stage 1 (tools #1–15, three kata moves, new words)

Status: **waiting for Jay's OK.** Nothing here is in the game yet. Mark up anything: names, what a tool does, when it fires, how often.

How to read it:
- **When it fires** is the trigger written on the tool's card. Every tool fires from something the player does.
- **Wait** is the cooldown: how long before that tool can fire again.
- **What it does** is the card's words, as a kid would read them.
- The last column is for Claude (which game effect it uses). Jay can skip it.

Trigger mix in this draft: 7 fire on a Great Counter, 3 on a Block, 2 on a Dash, 1 when crowded, 1 on a kick, 1 after getting hit. So a kid building a belt can lean toward countering, blocking, or moving.

## Tools #1–15

### White belt

| # | Tool name | Reminder (the real technique) | When it fires | Wait | What it does | Effect (for Claude) |
|---|---|---|---|---|---|---|
| 1 | Off the Line | Step off the line, parry, double punch. | When you Great Counter | 6 s | You step aside and add two quick punches. | counterHits 0.6 × 2 |
| 2 | Other Side | Same as #1, stepping the other way. | When you Block | 8 s | You slip to the other side: DASH is ready again, and you pop the attacker with a quick punch. | dashOnBlock + areaHit 0.6, radius 0.9 |
| 3 | Spin Back Fist | Inside block, step across, spin, back fist. | When you Great Counter | 8 s | You spin and your back fist hits everyone close to you. | rippleCounter 0.8, radius 1.2 |
| 4 | Open | Outside block, punch to the body, step in, punch high. | When you Great Counter | 9 s | Body, then head: two punches drive the attacker back. | counterHits 0.5 × 2 + counterPush 1.5 tiles |
| 5 | Spin Elbow | Inside block, spin with an elbow, finish with a back fist. | When enemies crowd you | 10 s | Too many close? You spin with an elbow and a back fist that hit all of them. | areaHit 1.0, radius 1.4 |

### Yellow belt

| # | Tool name | Reminder | When it fires | Wait | What it does | Effect (for Claude) |
|---|---|---|---|---|---|---|
| 6 | Arm Wrap | Outside block, wrap the arm, strike, strike, elbow. | When you Great Counter | 10 s | You trap the arm: the attacker is stuck longer while three quick strikes land. | staggerTicks +10 + counterHits 0.4 × 3 |
| 7 | Palm Heel | Outside block, wrap and trap, palm heel. | When you Great Counter | 8 s | One big palm heel: your counter hits much harder. | counterStrength +1.5 |
| 8 | Block and Strike | Outside block and strike to the body at the same moment. | When you Block | 6 s | You block and hit back at the same moment. | blockReflect 0.8 |
| 9 | High Block Strike | Outside block and strike high at the same moment. | When you Block | 9 s | You block and hit back high: the attacker is knocked off-balance. | blockReflect 0.6 + reflectStaggers (about 1 s) |
| 10 | Grab and Strike | Double knifehand block, grab the arm, back fist. | When you Great Counter | 12 s | You grab the arm and hold the attacker still, then back fist. | counterLock + counterHits 0.8 × 1 |

### Orange belt

| # | Tool name | Reminder | When it fires | Wait | What it does | Effect (for Claude) |
|---|---|---|---|---|---|---|
| 11 | Osotogari | Outside block, big leg reap, punch. | When you Great Counter | 12 s | You take the attacker to the ground for a moment. | counterThrow (tumble about 1.5 s) |
| 12 | Reap and Finish | Osotogari, punch, then finish on the ground. | When you kick (STRIKE) | 6 s | Kick an enemy that's on the ground for a big finishing hit. | downBonus +0.6 on that kick |
| 13 | Inside Kick | Jump to fighting stance, inside kick the weapon away. | When you Dash | 10 s | As you dash, you kick the weapon aside: the closest enemy's next hit is weaker. | disarm on the nearest enemy within 1.5 tiles *(needs a small new rule: today disarm only works on a counter)* |
| 14 | Kick and Spin | Inside kick the weapon, turn, spin kick high. | When you Dash | 12 s | Dash in with a spin kick that hits everyone close, and their next two hits are weaker. | areaHit 1.2, radius 1.2 + disarmAttacks 2 on enemies hit |
| 15 | Slip and Double | Step aside, parry, outside block, double punch. | When you get hit | 10 s | Got hit? You slip to the side and answer with two quick punches. | areaHit 0.7, radius 1.0 (hits the attacker) |

Notes:
- **All the tools hit the shadow creatures in kid-safe ways only:** pushed back, off-balance, held still, tumbled, weapon kicked away. Nothing shown hurt.
- **A pop-up shows the real number:** "#7 Palm Heel!"
- **The wait times are starting guesses.** The practice bots will tune them so tools add to the fight without taking it over.

## Kata signature moves (the KATA button)

Each kata gives one big move you trigger yourself, plus one more pocket on your Tool Belt. You bring one kata move per climb. It recharges on its own like DASH, just much slower.

| Kata | Move name | What it does | Recharge | Numbers (for Claude) |
|---|---|---|---|---|
| Basic Form 1 | **Kiai!** | You plant your feet, low block, and let out a huge KIAI. Everyone close is stunned for a moment and pushed back a little. | 25 s | radius 2.0, strength 1.0, push 0.5 tiles, stun 1.2 s |
| Basic Form 2 | **Four Corners** | You snap to all four sides with blocks and front kicks, knocking everyone around you far back. | 22 s | radius 2.4, strength 1.5, push 1.5 tiles, stun 0.5 s |
| Keon | **Iron Wall** | The whole kata in a flash: high, inside and low blocks, then a mighty reverse punch that blasts everyone close. | 28 s | radius 1.6, strength 4.0, push 1.0 tile, stun 1.0 s |

Why these: Basic Form 1 has three kiais and is all low blocks and punches, so its move is the shout. Basic Form 2 adds front kicks and turns to the corners, so its move is the wide kick-out. Keon is the first "real" kata with every block, so it's the strongest blast. Keon hits hardest (a kick STRIKE is 2.5; Keon's move is 4.0 on everyone close).

*(The stun is capped at about 1.2 s by the game's rule on how long anything can be held still. Claude will check the numbers fit.)*

## New words

### Sensei's Lessons (one sentence per screen)

**Tool Belt** (the first fight with a tool in a pocket):
1. "Every technique you learn in class is a new tool."
2. "Your tools live in your Tool Belt."
3. "Fight well, and your tools jump in on their own!"

**Kata button** (the first fight after a kata is signed off):
1. "You learned your kata. It has a power!"
2. "Tap KATA when enemies are close."

### "New tool!" card (after a self-defense sign-off; smaller than the real sign-off celebration)
- Title: "New tool! #{n} {name}"
- Line: "You learned it in class. Now it's in your Tool Belt."
- Button: "Cool!"

### Fighting Style screen (replacing the Seal words)
- Section name: **Tool Belt** (was "Seal")
- "Pick a tool" (was "Pick a Seal")
- Empty pocket: "Pick a tool to bring along."
- Pockets: "{n} pockets. Learn katas for more!"
- When the trigger is shown on a card: "Fires: when you Great Counter" (and so on for the others)
- Kata slot with nothing earned: "Learn your kata at the dojo to unlock its power!" (was "Power coming soon")
- One-time note for kids who had Seals: "Your Seals are now tools! Sensei put your newest ones in your belt."
