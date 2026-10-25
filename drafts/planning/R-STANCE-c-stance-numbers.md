# R-STANCE-c: stance numbers

Numbers for the five stances. Kata reward numbers wait on Jay's picks.

## The numbers

| Stance | Number | Why |
|---|---|---|
| Ready | everything 0 | The plain stance that every other stance is compared to. |
| Cat | counter window +1 tick | Easier counters. At +2 the bot took half as much damage, which made Cat too good. |
| Cat | dash recharge -25% (30 → 22 ticks) | Quick feet. |
| Cat (trade-off) | blocks let 65% through, up from 50% | Softer blocks. Softer hits would break the bands (see decision 1). |
| Front | power +8% | Strikes hit harder, with room left under the +12% cap. |
| Front | push on hit 0.5 tiles (new) | Strikes shove enemies back. |
| Front (trade-off) | move speed -10% | Turns and moves slower. |
| Fighting | blocks let 35% through, down from 50% | Blocks take less damage. |
| Fighting | Focus fills 20% faster | Faster Focus. |
| Fighting | attack speed 0 | Keeps full attack speed, as asked. |
| Fighting (trade-off) | dash 80% as long (2.5 → 2.0 tiles) | Slightly shorter Dash, as asked. |
| Horse | power +10% after standing still for 10 ticks (0.5 s) | Rooted power. The cap is +12%. |
| Horse (trade-off) | move speed -20%, and the bonus drops the moment you move or dash | Can't move and keep the power. |

## Hard limits found

- **No stance may lower power.** At just -2% power the trainsMore Challenge fights take too long (the Brute needs 21 hits, the Floor-Keeper 82), and the R-BAL-12 bands fail.
- **Power bonus is capped at +12%.** At +13% the Ladle-Lobber at belt 3 dies in 4 Standard hits, below the 5-hit floor.
- **No stance may lower guard.** Lower guard breaks the swarmer KO floor for playsOnly.
- Raising guard by +30% to +50% is safe.

## Results

- **Band test:** the real `r-bal-12-bands.test.ts` passes, 293 of 293. A stance-aware copy of the band math also passes for every belt and all 3 students with power at +0% to +12%, so Front +8% and Horse +10% both pass.
- **Sims:** belts 1–10, 20 seeds per case. The smart bot played typical, trainsMore and playsOnly on Standard and Challenge. The masher (a 6-year-old who never counters) played typical and playsOnly on Standard.
  - **Smart bot:** won 100% with every stance, every student and both difficulties, with no deaths. Boss fights took 11.7–13.3 s with a stance and 12.8–13.3 s with Ready. Every stance is a little faster and none is a big jump.
  - **Damage taken:**
    - Ready took 3.4–8.6% of health per room.
    - Front, Horse and Fighting were within about 1 point of Ready.
    - Cat at +1 counter window took 3.3–7.3%, in line with Ready.
    - Cat at +2 took 1.5–3.4%, about half of Ready, which is too strong. So the table uses +1.
  - **Masher:** the same with every stance. Ready won 6–8% of runs, the others 6–10%. It dies in the first room at most belts no matter which stance it picks. That comes from the masher bot and belt tuning that already exist, not from stances. Stances neither fix it nor make it worse.
- **No stance is strictly better than Ready.** Each one gives something up: Cat has softer blocks, Front moves slower, Fighting has a shorter dash and Horse has to stand still. The bot never uses blocks much and can't value movement, so in the sims these costs look smaller than they will feel in play.
- **The sims could not test some things.** Front's push is a new effect, so it was left out of the sims. The numbers ran through a probe change to the sim code that was thrown away afterwards. No game code is committed.

## Proposed content shape

Fields that exist today: `counterWindow`, `attackSpeed`, `moveSpeed`, `guardScale`, `powerScale`. New fields are marked "new".

```json
{ "id": "cat-stance", "counterWindow": 1, "dashCooldownScale": -0.25, "blockCut": -0.15 }
{ "id": "front-stance", "powerScale": 0.08, "strikePush": 0.5, "moveSpeed": -0.10 }
{ "id": "fighting-stance", "blockCut": 0.15, "focusGain": 0.2, "dashScale": 0.8, "attackSpeed": 0 }
{ "id": "horse-stance", "stillPower": 0.10, "rootTicks": 10, "moveSpeed": -0.20 }
```

What the new fields do:
- `dashCooldownScale` (new): multiplies the dash recharge time.
- `dashScale` (new): multiplies the dash length.
- `blockCut` (new): adds to the block cut. Blocks let 0.5 - blockCut of the damage through, and never less than 0.1.
- `focusGain` (new): adds to the Focus gain modifier.
- `stillPower` (new): extra power after standing still for `rootTicks` (new) ticks. It resets when you move or dash.
- `strikePush` (new): how many tiles a hit pushes the enemy.

Rule for the content check: `powerScale` and `stillPower` must be from 0 to 0.12, and `guardScale` must be 0 or more.

## Decisions for Jay

1. **Cat's trade-off changes from "softer hits" to "softer blocks".** Lowering power breaks the bands.
2. **Flowing and Rooted on main get replaced** by Cat, Front, Fighting and Horse. Flowing is strictly better than Ready today.
3. **Horse power cap:** +10% (proposed, with some margin) or +12% (the hard limit).
4. **Masher win rate is low at most belts** with every stance. This is a separate balance item, not caused by stances.
