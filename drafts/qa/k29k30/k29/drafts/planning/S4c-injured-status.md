# S4c: "Injured" status from break techniques

Manager item S4c, approved by Jay (via Manager, Oct 24): *"I don't see an issue with a 'broken' or 'injured' status effect that comes from these techniques with breaks. The students are mature in their training... it will make for another interesting mechanic."*

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code changes. **(guess)** marks numbers that haven't been through a balance run yet. Sources read: `core-design.md`, `decisions.md`, `progress.md`, `S4-self-defense-powers.md` (incl. S4b), `self-defense.md`, `S11-enemy-tells.md`, `A5-padded-staff-enemy.md`, `world.ts`, `enemy.ts`.

## Rule change (done in this PR)

New rule line: an enemy can be **Injured** (a short, cartoon status: bandage sticker and dizzy stars) from the break techniques, self-defense #31–40 only. It always recovers or poofs away. No blood, gore, bones or cracks, and never the word "broken" on screen (Jay via Manager, 2026-10-24; spec: `drafts/planning/S4c-injured-status.md`).

The three docs that said "never injuries" are updated to match in this PR: `decisions.md` line 376, the game rules in `self-defense.md`, and the S4b "break" note in `S4-self-defense-powers.md`. Release still works the same; Injured is added on top.

## Which seals cause it

These are the techniques whose real result Jay calls a "break" (`self-defense.md`, Oct 24): **#31–40**.

| # | Seal | Jay's result |
| --- | --- | --- |
| 31 | Arm Bar Release | joint control/break |
| 32 | Slide to the Wrist | joint control/break |
| 33 | Party Flex | joint control/break (wrist lock) |
| 34 | Lock and Drop | joint control/break and takedown |
| 35 | Catch the Hand | wrist control/break |
| 36 | Wide Release | joint manipulation/break |
| 37 | Steady Hold | joint manipulation/break |
| 38 | Lock to Takedown | joint manipulation/break into takedown |
| 39 | Release and Go | joint manipulation/break |
| 40 | Master Hold | joint manipulation/break and takedown |

**Not included:** the earlier lock seals #17 Arm Bar, #19 Wrist Lock, #21 X-Block Lock, #26 Shoulder Control and #28 Four-Corner Lock. Jay's results for those are control and lock, not break (decided: they do **not** cause Injured).

**Trigger:** if the player owns **at least one** seal from #31–40, every lock they set makes the enemy Injured **when the lock ends** (the S4b Release moment). With #34 or #38, the enemy goes Injured when it gets up from the throw. Each seal still does its own S4b effect. Owning more break seals doesn't make Injured stronger (see upgrades below).

## What Injured does

These hook into existing numbers in `world.ts` and `enemy.ts`:

| Effect | Amount | Example (Bouncy Bopper) |
| --- | --- | --- |
| Wind-up is longer | × **1.25** (guess) | 16 → 20 ticks |
| Its attacks hit softer | × **0.75** damage (guess), applied like disarm's `weak` factor | 16 → 12 |
| It moves slower | × **0.8** speed (guess) | 2.2 → 1.76 tiles/s |
| Recovery | unchanged | 18 ticks |
| Perfect Counter window | unchanged (difficulty: 10 / 6 / 4) | — |

- Injured only makes the wind-up **longer**, so the 10-tick minimum (`enemy.ts` line 109) can never be broken by it.
- The Perfect window is still the last 10, 6 or 4 ticks of the wind-up, so a Injured enemy is easier to read, not harder.
- No damage over time; Injured never takes Health on its own.
- **Lasts 100 ticks (5 s)** (guess). It counts down in its own field (`injuredTicks` on `EnemyState`), separate from `mode`, so it keeps going through chase, wind-up, recover and stagger.
- If the enemy is in a wind-up when Injured starts, the current wind-up keeps its length. The change starts with the next wind-up, so a tell never jumps mid-swing.

### Stacking and refresh

- **No stacking.** An enemy is either Injured or not. A second break while Injured only **resets the timer to 100**. It never goes above 100 or gets stronger.
- **Upgrades:** Training Point upgrades on any #31–40 seal raise the **duration only**, +10 ticks per upgrade step on the highest-upgraded break seal, up to 140 ticks (guess). The damage and wind-up numbers never change.
- **Recovery:** when the timer ends, the enemy does a little "shake it off" puff and is back to normal. If it's defeated while Injured, it poofs away as usual.

### Elites, named monsters, Guardians and bosses

| Enemy | Injured | Why |
| --- | --- | --- |
| Normal | Full (above) | |
| Swift elite | Full. The ×1.25 applies after swift's ×0.8 (16 × 0.8 × 1.25 = 16) | Still at least 10 ticks |
| Guarding elite | Full on itself. Its aura on others doesn't change | Keeps the aura rules simple |
| Named monster | Full, but **60 ticks** (guess) | Its special move stays readable and special |
| Guardians and the Floor Keeper | **Half strength**: wind-up × 1.1, damage × 0.9, speed unchanged, **60 ticks**, and not while it's summoning | A boss shouldn't feel locked down |

## How kids see it (cartoon only)

- **On-screen word:** **"Injured!"** pops up once when it starts. Never "broken".
- **Look:**
  - a small cartoon **bandage sticker** on the enemy
  - 2–3 **dizzy stars** circling its head
  - a gentle **side-to-side wobble** in idle and chase
  - no blood, gore, bones, cracks or limp limbs
- **Colour:** the stars are white or soft yellow, **never red** (red is the danger colour, S11), and not lime (Bouncy Bopper's colour).
- **Sound:** one soft "boing" when it starts, and a "shake it off" puff when it ends. There's no looping sound.
- **Bestiary / Sensei line (example):** "Injured enemies are slower. Take a breath and watch the warning!"

## Fit with the S11 tells

- During a wind-up, the dizzy stars **fade to half** and the wobble **stops**. The S11 pose, floor shape and sound play exactly as normal, just longer.
- The tell's fill still runs from empty to "nearly full" over the full (longer) wind-up, so it reads the same.
- **Never sound alone or colour alone:** Injured shows with a sticker, stars and the word, and is never shown by colour alone.
- It passes the greyscale check and the muted check. Bigger warnings (after launch) is unchanged.

## Bouncy Bopper: disarmed + Injured

Both can be on at once, and they stack by multiplying:

| State | Wind-up | Damage |
| --- | --- | --- |
| Normal (staff bonk) | 16 | 16 |
| Injured | 20 | 12 |
| Disarmed (push-paw) | 16 | 8 |
| Disarmed + Injured | 20 | 6 |
| Disarmed by #19 (full) + Injured | 20 | 0 |

- **Look:** no staff layer, plus the bandage and stars.
- **Timers:** disarm counts attacks and Injured counts ticks, so each ends on its own.

## Proposed board items

| ID | Owner | Task | Done when | Waits on |
| --- | --- | --- | --- | --- |
| S4c-P1 | Programmer | Add `injuredTicks` to enemies, apply the effects at the next wind-up, add the boss and named-monster rules, refresh and no stacking, and the `injured` / `injuredEnd` events | Sim tests: wind-up 16 becomes 20 and damage 16 becomes 12; swift + Challenge stays at least 10; a second break resets to 100 and doesn't stack; Floor Keeper gets ×1.1 for 60 ticks; Injured ends after 100 ticks; a mid-wind-up hit doesn't change the current swing | The S4 lock and S4b Release (`counterLock`, `lockRelease`) being built |
| S4c-A1 | Artist | Bandage sticker, dizzy stars, wobble, and the "shake it off" puff | Shown on all 5 enemies plus Bouncy Bopper; passes the greyscale and phone-size checks; no red; stars fade during wind-up | Nothing (decided) |
| S4c-C1 | Content | The "Injured!" word, a Sensei line, a Bestiary tip, and the #31–40 seal text adding "and leaves them Injured" | Word check: "Injured!" is allowed; "broken" never appears on screen, and there are no blood, bone or crack words; each line is one short sentence | Nothing (decided) |
| S4c-T1 | Tester | Balance run with Injured on (Red/Black and Brown tiers), plus a readability check of tells while Injured | Clear rates stay within the S1 bands; tells pass the S11 greyscale and muted checks while Injured | S4c-P1, S4c-A1 |

## Launch scope (April 2027)

**Decided: first update after launch.** It depends on the S4 lock system, #31–40 are Red/Black and Brown techniques, and it needs new art. Once locks exist, S4c-P1 is small.

## Decided (Manager, Oct 24)

1. **Rule change:** approved. The three doc edits are done in this PR.
2. **Only #31–40** cause Injured. #17, #19, #21, #26 and #28 do not.
3. **Name and word:** the status is **"Injured"**, with an **"Injured!"** pop-up. The cartoon bandage and stars stay. No blood, bones or the word "broken".
4. **Scope:** first update after launch.
5. **Numbers:** wind-up ×1.25, damage ×0.75, speed ×0.8, 100 ticks; bosses at half strength for 60 ticks. These are OK as the starting numbers for the first balance run.
