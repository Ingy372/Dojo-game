# S1 follow-up: Yellow belt Tower name, and the Guarding aura

**For:** Jay (via the Manager) · **Date:** 2026-10-24 · **Status:** Name decided (Sunrise Garden, PR #30). Guarding numbers updated 2026-10-24 to the Manager's calls from the Tester sim (`drafts/qa/2026-10-24-s1-guarding-aura-sim.md`, PR #40). Ready to build in K7.

---

## 1. Name for the Yellow belt Tower floors (Tier 2)

**What I checked first**
- Tier 1 (white belt) has **no in-game name yet**. The docs just say "Tier 1".
- Room names are short and plain: *Pillar Court, Lantern Room, Quiet Shrine, Narrow Bridge, Training Yard* (`content/rooms/`).
- **"Bamboo Hall" is already a Tier 1 room**, and **"Bamboo Garden" is already a decoration set** (`docs/core-design.md` §5: "4 of 5 Bamboo Garden pieces"). Using "Bamboo Garden Hall" for the tier would mix up all three.
- The story is about **light coming back** as you climb (§1). The art brief asks Tier 2 to feel "brighter and warmer, like moving up toward the light."
- The art (PR #10, `incoming-art/tower-rooms-t2/`): warm cream floor, green bamboo pillars, paper screen walls, a green-roofed shrine, lanterns.

**My pick: Sunrise Garden**
- Two easy words a 6-year-old can read.
- Hopeful: sunrise means the light is coming back, which matches the Tower story.
- Fits the art: a warm, bright, green garden.
- Follows the room-name pattern ("place word + plain word").
- Doesn't clash with "Bamboo Hall" or the "Bamboo Garden" set.
- Trademark: a quick web search found no game called "Sunrise Garden", only a level name in one small browser game and a place name in *No Man's Sky*. It's a common phrase. A lawyer check before launch is still wise (the framework already plans one before milestone 8).

**Backups**
1. **Morning Grove:** same hopeful "light returning" idea. "Grove" is a slightly harder word.
2. **Green Bamboo Steps:** says exactly what you see, and "steps" says you're climbing. It's a bit long and close to the bamboo names.

**Suggestion:** if you like this pattern, later tiers can follow it: one time-of-day or light word plus one place word, getting brighter as you climb. Tier 1 could get a name too (for example "Stone Hall"). That's your call.

---

## 2. Should the Guarding aura show who it protects?

**Decision: yes.** The docs don't say otherwise. `docs/core-design.md` §6 only says Guarding "protects nearby enemies until defeated". Kids need to *see* why their hits are weaker, or it feels unfair.

**How it looks**
- The Guarding elite has a **blue aura** (from S1 #3).
- Each enemy it protects gets a **thin blue line (tether)** from the guarder plus a **soft blue glow** at its feet.
- When an enemy walks out of range, its line and glow fade out in about 0.2 s. When the guarder is defeated, all lines snap and fade with a small "shield break" sound.
- Blue never covers the **red danger circle**. Lines and glows sit under the red circle and under the enemy.

**The "nearby" rule (decided, from the Tester sim)**
- **Range: 3 tiles**, measured from the guarder's center to the other enemy's center (48 px per tile, so 144 px before screen scaling). The sim found 2 or 4 tiles made no real difference, so 3 keeps groups small and easy to read.
- **Updates live, every tick.** Lead an enemy away and it loses protection.
- **Protects the 2 closest enemies** inside 3 tiles. Ties go to the enemy that came into the room first.
- **Guarders don't protect each other or themselves, and never the boss.**
- These numbers live in one `ELITES` block in `packages/sim/src/config.ts`, next to `FLOOR`, so the balance player can tune them.

**What protection does: 1/3 less damage from the player (×0.67)**
This replaces the old half-damage rule. In the sim, half damage cost a smart new player 5 points on Standard (46.5% → 41.5%). The 1/3 cut kept them at 46%.

The cut is applied last: after the normal damage formula and all bonuses (combo, stagger bonus, winded bonus). Round to the nearest whole number, at least 1. Build note: put the cut in `hurtEnemy()`, not `landHit()`, because Iron Skin bounce-back goes straight to `hurtEnemy()`. It covers **every kind of damage the player deals** (the `AttackMove` list in `world.ts`), so kids never have to learn exceptions:

| Player damage | Cut on a protected enemy? |
| --- | --- |
| Basic hits (`basic`) | Yes, ×0.67 |
| Strike and its extra hit (`strike`, `chain`) | Yes, ×0.67 |
| Perfect Counter hit (`counter`) | Yes, ×0.67 |
| Ripple Counter splash (`ripple`) | Yes, ×0.67 |
| Iron Skin bounce-back (`reflect`) | Yes, ×0.67 |
| Damage the player **takes** | No change. The aura only protects enemies. |

**What still works the same on a protected enemy**
- **Perfect Counter still staggers it**, for the full stagger time. Insight stagger bonuses still apply.
- **Strike or Perfect Counter still breaks a Shield Guard's shield.** Basic hits still bounce off it.
- **A winded Brute still takes its +50% bonus** (then the 1/3 cut).
- Focus gain, combo count and the Perfect Counter chain are not changed.

## 3. Elite numbers (gaps the Tester flagged)

### When elites can appear
- **Belt:** 4th belt and up (`docs/core-design.md` §12). Below 4th belt there are no elites at all.
- **Rooms:** only battle and challenge rooms, and only from **room 3** of a floor. Never rooms 1–2, the boss room, treasure rooms, rest shrines, the tutorial floor or Sensei's practice rooms.
- **Chance per room:** **20%** in a battle room, **35%** in a challenge room.
- **Caps:** at most **1 elite per room** and **2 per floor**. At most **1 Guarding elite per floor**.
- **What it rolls:** Swift 60%, Guarding 40%. If Guarding is not allowed (below), it becomes Swift.
- **Guarding is never allowed** in Guided mode, or on the **first floor of any tier** (the first floor a student plays after reaching that belt's tier). On those floors a rolled Guarding becomes Swift.
- **Which enemies:** Swift can be any normal enemy (Brute, Swarmer, Shield Guard). Guarding is only a **Brute or a Shield Guard** (the same guarders the Tester used). A Guarding Swarmer would fall too fast to matter. Bosses and Guardians are never elites.
- **Rooms with a named monster (M7-N1) have no elite.**
- **Which enemy becomes the elite:** when the room starts, after the room is picked as an elite room, roll the trait (Swift 60%, Guarding 40%). Then pick **one enemy at random** from the room's whole enemy list, later waves included (an elite in wave 2 arrives with wave 2). Only `brute`, `swarmer` and `shield` can be picked; the boss (`floor-keeper`) and summoned swarmers never can.
  - **Swift:** any of the three.
  - **Guarding:** only a `brute` or `shield`. If the room has neither, or Guarding isn't allowed there, it becomes **Swift** on a random eligible enemy.
  - If the room has no eligible enemy at all, there is **no elite** and the room doesn't count toward the caps.
- Expected result: **about 0.6 elites per floor** for a 4th-belt student, fewer on Guided (Tester sim, PR #52: 118 elites in 200 floors). That's on purpose: fewer feels more special. Don't raise the rate to reach 1.

### Elite stats (multipliers on the normal enemy's file in `content/enemies/`)

| | Swift (gold) | Guarding (blue) |
| --- | --- | --- |
| Health | ×1.25 | ×1.25 |
| Power (damage to player) | ×1.0 | ×1.0 |
| Guard | ×1.0 | ×1.0 |
| Move speed | ×1.25 | ×1.0 |
| Wind-up (`telegraphTicks`) | ×0.8 on **Standard only**. ×1.0 on Guided and Challenge | ×1.0 |
| Recovery (`recoverTicks`) | ×0.85 | ×1.0 |
| Perfect Counter window | **Never changes** | Never changes |
| Aura | none (gold look only) | 3 tiles, 2 closest, ×0.67 |
| Reward on defeat | Elite reward (below) | Elite reward (below) |

Example: a Guarding Brute has 225 Health (180 × 1.25). Swift wind-up on Standard is `round(telegraphTicks × 0.8)`, **never below 10 ticks** (the game's own rule in `packages/sim/src/enemy.ts`: half a second of warning). So a Swift Swarmer is 10 ticks (500 ms), Shield Guard 11, Brute 13. On Guided and Challenge, Swift uses the normal wind-up: Challenge already shortens it (`fillScale` 0.8), and a Swift Swarmer there would leave only 350 ms, too fast to read (Tester sim, PR #52). Swift is still faster on its feet (×1.25) and recovers faster (×0.85) on every difficulty.

**Elite reward ("+1 item roll", made exact).** Only Focus or cosmetics, never gear, stats, Training Points, rarity boosts or anything paid:
- **+15 Focus** the moment an elite is defeated (same size as the bow, `BOW.focus`; capped at `COMBAT.focus.max` 100). Shows as a small blue-white Focus pop, not a pickup to chase.
- **One extra decoration roll** for the room chest: 50% chance, using the existing `dropDecoration()` pool (`source: "tower"`, kinds you have fewest of first). It adds a Home Dojo decoration only.
- No gear roll and no change to the rarity weights or bad-luck counter (`LOOT`). Gear stays from normal chests only.


Why ×1.25 Health: the sim modelled the guarder with normal stats and every room had one (a worst case). Real floors have about 0.6 elites, and the Tester's PR #52 sim confirmed it passes, so a small Health bump makes elites feel special without undoing the sim's result. The balance player should re-check this (Done-when 9).

**Done when (a tester can check)**
1. In a room with a Guarding elite and 3 other enemies within 3 tiles, exactly 2 enemies show a blue line and glow: the 2 closest.
2. The same Basic hit on a glowing enemy shows about 2/3 of the damage number it shows on an unprotected one (for example 30 → 20). Strike, Perfect Counter, Ripple and Iron Skin numbers are cut the same way, never below 1.
3. Damage the player takes is the same with or without a Guarding elite in the room.
4. Leading a protected enemy more than 3 tiles away makes its line and glow fade within half a second, and full damage comes back.
5. Defeating the guarder removes every line and glow at once.
6. A Perfect Counter on a protected enemy still shows "PERFECT!" and staggers it for the normal time. A Strike still breaks a protected Shield Guard's shield.
7. The red danger circle is fully visible on top of any blue line or glow, on a phone screen.
8. Over 1,000 simulated floors at 4th belt: no elites in rooms 1–2, boss, treasure or rest rooms; never 2 in one room or 3 in one floor; never 2 Guarding in one floor; no Guarding at all on Guided or on a tier's first floor; about 20% of eligible battle rooms and 35% of eligible challenge rooms have one; about 0.6 elites per floor.
8b. Every Guarding elite is a `brute` or `shield`; in a room with neither, a Guarding roll gives a Swift elite instead. The boss and summoned swarmers are never elites. A wave-2 elite arrives with wave 2.
9. Balance player (Tester's sim, smart novice, Standard): with elites at the real rate, win rate is within 5 points of no elites, and rooms with a Guarding elite take no more than about 25% longer.
10. Sim tick test: a Swift elite's wind-up is 0.8× on Standard (Swarmer 10, Shield 11, Brute 13 ticks), never below 10, and exactly the normal wind-up on Guided and Challenge. Its Perfect Counter window matches the normal enemy on every difficulty.
10b. Defeating an elite gives +15 Focus (never above 100) and at most one extra decoration roll. No extra gear appears and the `LOOT` rarity weights and bad-luck count don't change.
10c. A 4th-belt test profile exists in the sim, so the balance player can check elites without forcing them on (Tester issue 3).
11. An elite has 1.25× the normal enemy's Health (Guarding Brute = 225).
12. All numbers above sit in one `ELITES` config block; changing one there changes the game and the sim.

**Art ask for the Art Director**
- A **blue Guarding aura** for an elite (looping, works on all 4 Tier 1 creatures and the Tier 2 floor).
- A **thin blue tether line** (stretchable, gently pulsing) and a **small blue foot glow** for protected enemies.
- A short **"tether snap"** effect (3–4 frames) for when the guarder is defeated.
- Check it on the cream Tier 2 floor and the grey Tier 1 floor, under the red danger circle.

---

## Decided
- Tier 2 name: **Sunrise Garden** (Manager, PR #30). Tier 1 stays unnamed for now.
- Guarding: **1/3 less damage from the player, 3 tiles, 2 closest, no Guarding in Guided or on a tier's first floor** (Manager, from the Tester sim, PR #40).

## Still open (small, the Manager can call these)
- Decided by the Manager: rates and caps, Health ×1.25, Swift numbers, "floor 1" = first floor of each tier, and no Swift wind-up cut on Challenge.
- Passed: Done-when 9 (Tester sim, PR #52).
- Still open: the 50% decoration chance is a starting number for the balance player to tune.
