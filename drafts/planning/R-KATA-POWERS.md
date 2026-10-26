# R-KATA-POWERS: kata power options

**Placeholders.** Toni Kennerson is sending detailed kata descriptions within a week. Once they arrive, we revisit every flavor tie below. The repo only has names and belts for Pinon 1–3, Nahanchi and Possi (`drafts/content/katas/*.json`, from #288). `stances.json` lists stances (Ready, Cat, Front, Fighting, Horse), not katas, so this doc covers 9 katas.

**Status: all untested.** No option has been run in the sim yet. The numbers get checked when R-STANCE-d builds them.

## Rules every option follows
- **Small.** All extra damage, from stance and kata together, stays at +12% or less. Front (+8%) leaves room for at most +4% from a kata, so damage options here are short or conditional.
- **No lost guard, no shorter wind-ups.**
- **Bands stay safe.** Guardians take 40–80 hits, and the player can take at least 5 hits before a knock-out. Any boss-damage bonus counts toward the +12% cap.
- **Skill unlocks it, not luck.** Options trigger on Perfect Counters, good timing or reading the fight. Belt sign-off stays the main source of power.
- **Works with Mash guard.** Mash guard turns off after 3 Perfect Counters in a room, so Counter-based powers take over right when the beginner help steps back.
- **Shield sparks stay at +6 Focus.** No option stacks Focus on shield bounces.
- **Kind.** No punishment, no streak loss, no purchases.

## Options
| Kata (belt) | Option 1 | Option 2 | Balance note |
|---|---|---|---|
| Basic Form 1 (White→Yellow) | **Kiai!** (picked in #281): every 3rd Strike in a row hits a little harder | Low Block Guard: blocks take 10% less damage | Kiai: keep it at about +10% on that 1 hit only, which averages about +3%. Low Block Guard is about the same size as half of Fighting's block bonus. |
| Basic Form 2 (Yellow→Orange) | **Catch and Return** (picked in #281): a Block sends a little damage back | Quick Hands: combos flow a bit faster | Return: 15% of the blocked hit, and it never counts toward a Guardian's hits. Quick Hands: attack speed +5% at most. |
| Keon (Orange→Green) | **Step In** (picked in #281): after a Perfect Counter, your next Strike is free | Cat Spring: after a Perfect Counter, your Dash recharges right away | Both are skill-only, and neither raises damage. Cat Spring stacks with Cat's −25% recharge, which is fine because it needs a perfect. |
| David and Goliath (Green→Blue) | **Small but Brave** (picked in #281): a little more damage to big enemies | Courage: Focus fills faster when Health is low | Brave: +4% at most, so Front + Brave = 12%. A Guardian then takes about 43 hits at the low end, still at least 40. Courage adds no damage. |
| Pinon 1 (Blue→Red) | Sharp Eyes: enemy wind-ups glow a little brighter (easier to read) | Fresh Start: start each room with 10 Focus | Sharp Eyes shows the warning more clearly without changing the timing. 10 Focus is a third of a Strike. |
| Pinon 2 (Red→Red-Black) | Turn and Block: a Perfect Counter also guards your back for 1 second | Steady Breath: +2 Focus per Perfect Counter chain step | Turn and Block uses the block share, never full immunity. Steady Breath: Focus gain is already about +20% in Fighting, so the total stays at or below about +30%. |
| Pinon 3 (Red-Black→Brown) | Rooted Strike: in Horse stance, a Strike also pushes 0.5 tiles | Echo: a Perfect Counter taps one other enemy nearby for a small hit | Rooted Strike adds no extra damage. Echo: 25% strength, and it never hits a Guardian twice. |
| Nahanchi (Brown→Brown-Black) | Side Step: Dash is 0.3 tiles longer (side-to-side kata) | Strong Root: Horse's still bonus kicks in after 0.3 s instead of 0.5 s | Side Step undoes part of Fighting's shorter Dash, which is fine. Strong Root keeps the bonus at +10%, it just comes faster. |
| Possi (Brown-Black→Black) | Calm Master: Mash guard's 3-perfect switch-off lasts all run, and Counter windows get +1 tick | Final Kiai: a Strike while at full Focus hits 8% harder | The +1 tick matches Cat's bonus, so the total stays at +2 or less (the Cat test showed +2 is too strong). Final Kiai counts toward the 12% cap with Front, so Front + Final Kiai is +12% at most. |

## How this relates to the #281 picks
The 4 picks stay as Option 1 for their katas. The new options for the later katas reuse the same kinds of effects: Counter rewards like Step In and Focus rewards like Courage. Nothing changes the picks.

## Delivery Note
- **ITEM:** R-KATA-POWERS
- **WHAT:** 2 placeholder power options for each of the 9 katas, each with a balance note. Untested in the sim. No game code.
- **WHY:** so Jay can pick early, and Toni's descriptions can then tune the flavor.
- **DECIDE:**
  1. Pick 1 option per kata for Pinon 1–3, Nahanchi and Possi.
  2. Approve the +12% total damage cap, so stance + kata never adds up past it.
  3. Wait for Toni's descriptions before picking, or pick now and rename later?
- **NEXT:** when Toni's descriptions arrive, update the flavor. After Jay's picks, R-STANCE-d builds them and runs the band test plus kid, masher and smart sims at every belt.
