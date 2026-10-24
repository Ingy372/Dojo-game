# S1 follow-up: Yellow belt Tower name, and the Guarding aura

**For:** Jay · **Date:** 2026-10-24 · **Status:** Proposal. Nothing is built until you say yes.

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

**The "nearby" rule (starting numbers)**
- **Range: 3 tiles**, measured from the guarder's center to the other enemy's center. The game draws 48 px per tile, so that's 144 px before screen scaling. Battle rooms are about 11–15 tiles tall and 18–26 wide, so 3 tiles is "a small group", not the whole room. It's a bit wider than the 2.5-tile "crowding" distance the balance player already measures, so a tight group is always covered.
- **Updates live, every tick.** Lead an enemy away and it loses protection. That rewards the same "pull them apart" play you already liked with swarmers.
- **Protects at most 2 enemies**, the 2 closest. Matches the "only two attack at once" rule, and keeps the screen simple.
- **Guarders don't protect each other or themselves.** S1 already says at most 1 elite per room, so this rarely comes up.
- **Never protects the boss.**
- **What protection does:** protected enemies **take half damage** (×0.5 after the normal damage formula). **Perfect Counters still stagger them**, so reading the warning still works. Protected Shield Guards still lose their shield to a Strike or Perfect Counter.
- These numbers live with the other elite numbers in the settings, so Claude Code's balance player can tune them.

**Done when (a tester can check)**
1. In a room with a Guarding elite and 3 other enemies close by, exactly 2 enemies show a blue line and glow: the 2 closest.
2. Hits on a glowing enemy show about half the damage number of the same hit on an unprotected one.
3. Leading a protected enemy more than 3 tiles away makes its line and glow fade within half a second, and full damage comes back.
4. Defeating the guarder removes every line and glow at once.
5. A Perfect Counter on a protected enemy still shows "PERFECT!" and staggers it.
6. The red danger circle is fully visible on top of any blue line or glow, on a phone screen.
7. Balance player: rooms with a Guarding elite take no more than about 25% longer than the same room without one.

**Art ask for the Art Director**
- A **blue Guarding aura** for an elite (looping, works on all 4 Tier 1 creatures and the Tier 2 floor).
- A **thin blue tether line** (stretchable, gently pulsing) and a **small blue foot glow** for protected enemies.
- A short **"tether snap"** effect (3–4 frames) for when the guarder is defeated.
- Check it on the cream Tier 2 floor and the grey Tier 1 floor, under the red danger circle.

---

## Decisions for you, Jay
1. Tier 2 name: **Sunrise Garden**, or a backup (Morning Grove, Green Bamboo Steps)?
2. Should Tier 1 get a name too, in the same style?
3. Guarding: 3 tiles, live updates, max 2 protected, half damage. OK as starting numbers?
