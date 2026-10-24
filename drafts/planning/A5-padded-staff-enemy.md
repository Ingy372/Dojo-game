# A5: Padded-staff enemy, numbers to match the art

Manager item A5 (Oct 24). This sets the stats for the padded-staff enemy drawn in PR #95, using the same fields as `content/enemies/*.json`.

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only, no game code changes. **(guess)** marks numbers that haven't been through a balance run yet. The name is a placeholder; the Content Writer chooses it.

## What the art fixes (PR #95, `padded.json`)

- **Wind-up:** 8 frames at 10 fps = 0.8 s = **16 ticks**. The tell glows through all 8 frames, and in Guided mode the last frame holds.
- **Attack:** 11 frames. The **impact is frame 0**, so the hit lands the moment the wind-up ends. Frames 2–10 are the recovery: 0.9 s = **18 ticks**.
- **Size:** radius 0.38 (art script), drawn in a 192 px frame. That puts it between Tier 1 (160 px) and the Brute (208 px).
- **Move speed in the art script:** 2.4 tiles/s, a placeholder that matches the Shield enemy.
- **Weapon:** the staff is on its own layer, so the game can hide it to show "disarmed".

The art numbers 16 / 18 are exactly the Brute's telegraph and the Shield's recovery, so they fit the existing family.

## Proposed `content/enemies/padded-staff.json`

| Field | Value | Compare | Why |
| --- | --- | --- | --- |
| maxHealth | **110** (guess) | Shield 90, Brute 180 | Mid-tier, a bit tougher than Shield |
| power | **16** (guess) | Shield 15, Brute 25 | A soft foam bonk; staff reach is its threat, not damage |
| guard | **10** (guess) | Swarmer 0, Shield 15 | |
| radius | **0.38** | art | Fixed by the art |
| moveSpeedTilesPerSecond | **2.2** (guess) | Shield 2.4, Brute 1.2 | Slightly slower than the art placeholder, so its longer reach stays fair |
| sightRange | **10** | Shield/Brute 10 | |
| attack.name | "padded staff bonk" | art | |
| attack.strength | **1** | all | |
| attack.startRange | **1.5** (guess) | Shield 1.15, Brute 1.3, Keeper 1.9 | The staff starts the swing from further away |
| attack.reach | **1.0** (guess) | Shield 0.75, Brute 0.9 | The longest single-enemy reach outside the boss, because the staff is long |
| attack.areaRadius | **0.7** (guess) | Shield 0.8 | A narrow overhead strike line, so stepping aside or Dashing works |
| attack.telegraphTicks | **16** | art (0.8 s) | Must match the wind-up art |
| attack.recoverTicks | **18** | art (0.9 s) | Must match the recovery frames |
| weapon | **"padded-staff"** (new field) | — | Used by the weapon seals (see below) |
| color | lime (Artist sets the hex) | — | Not red; no other enemy uses it |
| parSeconds | **6** (guess) | Shield 5, Brute 8 | |

### The timings asked for

- **Wind-up:** 16 ticks (0.8 s).
- **Active:** 1 tick. The sim resolves the hit on the tick the wind-up ends, which matches the impact on frame 0. There's no separate active field.
- **Recovery:** 18 ticks (0.9 s). This is the gap where the player can punish.
- **Perfect Counter window:** this belongs to the difficulty setting, not the enemy: **Guided 10 / Standard 6 / Challenge 4 ticks**, at the end of the wind-up (`config.ts` lines 33–35). The enemy file doesn't set it.
- **Attack range:** starts its swing at 1.5 tiles and hits up to 1.0 tile in front, 0.7 radius (guess).
- **Cooldown:** there's no separate enemy cooldown field. The next attack can start once recovery ends and the player is within startRange. So the shortest time between attacks is 16 + 18 = **34 ticks (1.7 s)**. If playtests feel too busy, a new `cooldownTicks` field is a scope flag; I'm not proposing it now.

### The 10-tick minimum and the difficulty rules

`enemy.ts` line 109 rejects wind-ups shorter than 10 ticks.

| Case | Wind-up | OK? |
| --- | --- | --- |
| Standard / Guided | 16 (Guided holds the last frame) | Yes |
| Challenge (fill ×0.8) | 12.8 → about 13 | Yes |
| Swift elite (×0.8) | 12.8 → about 13 | Yes |
| Challenge + swift | 10.24 → 10 (floor) | Just yes; the floor holds |

The Challenge Perfect window is 4 ticks, which still fits inside 10. No changes are needed to the difficulty code.

## S11 tell for this enemy

S11 (PR #98) rules: never colour alone, never sound alone, no sim changes.

- **Pose:** the staff goes up over the shoulder (the art wind-up). This is the main tell, and it reads in greyscale (PR #95 greyscale check).
- **Floor shape:** a narrow line in front of it, 1.0 tile long and 0.7 wide (follows reach and areaRadius). It fills in time with the art's `telegraphIntensity` ramp.
- **Sound:** a soft whoosh that rises through the wind-up. It's different from the Swarmer, Shield, Brute and Keeper sounds; the Audio role picks the actual sound.
- **Bestiary tip (Content Writer, example):** "When the staff goes up, get ready to Counter or step aside!"
- **Disarmed:** no staff is drawn, and its next attack is a weak push-paw with the same wind-up length, so the tell rules still apply (guess: show the same pose without the staff).

## How the S4 weapon seals work with it

From `S4-self-defense-powers.md`. Effects are from the spec, applied to this enemy:

- **#13 Kick the Weapon:** a Perfect Counter disarms it. Its next attack does half damage (8) and the staff layer is hidden.
- **#14 Kick and Spin:** the disarm lasts 2 attacks.
- **#18 Slide Away:** Dashing through its bonk gives +10 Focus. The narrow 0.7 area makes a Dash fair to land.
- **#19 Wrist Lock:** the disarm becomes full for 1 attack (0 damage).
- **#21 X-Block Lock:** +20% Perfect Counter strength while it's disarmed.
- **#22 Lock and Pin:** a disarmed enemy that is thrown or locked stays pinned 15 ticks longer.
- **#23 Turn It Back:** Blocking its bonk sends 50% back (8).
- **#24 Wrist Kick:** a Strike can disarm too.
- **#28:** see the S4 table row. It uses the same "vs weapon" condition.

The "vs weapon" conditions check `weapon` is set; on any other enemy they do nothing. A disarm never removes the tell. The 18-tick recovery is the window where disarm seals pay off.

## Done-when

- `content/enemies/padded-staff.json` loads with the table values. telegraphTicks is 16 and recoverTicks is 18 (test: they match `padded.json` wind-up 0.8 s and recovery 0.9 s).
- A loader test shows Challenge + swift still gives at least 10 ticks.
- In the sim, a hit lands on the wind-up's last tick, and the next attack can't start before tick 34.
- In-game, the tell shows pose + floor line + sound. A greyscale screenshot and a muted run can each still be read.
- Disarmed: the staff layer is hidden, and it reappears when the disarm ends.
- Each weapon seal listed above has a sim test against this enemy, and each "vs weapon" seal has no effect on the Brute.
- A balance run (Standard, rooms with this enemy at tiers 2–3) stays within the S1 clear-rate bands.

## Scope flags

- **Content:** 1 enemy file, the name, the tip and lore (Content Writer).
- **Sim:** small. It needs the new `weapon` field and "vs weapon" and "disarmed" conditions (already flagged in S4). No timing changes.
- **Client:** small. Hide the weapon layer when disarmed, the lime colour, and the S11 sound.
- **Art:** the full animation set comes next (PR #95 NEXT).

## Decisions still open

1. Name (Content Writer).
2. Are 110 HP and power 16 OK before the balance run?
3. Does a disarmed enemy attack with a weaker push-paw, or not attack at all? I recommend the push-paw.
