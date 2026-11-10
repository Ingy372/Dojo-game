# PB-11: Kata powers are passives

**For:** Jay and the Manager. **From:** Researcher & Planner. **Written:** Nov 8, 2026.

Docs only. No game code. `docs/work-board.md` is not edited. The numbers below were measured on the real fight rules before any size was chosen.

## Read this first

Jay's Nov 8 direction: a kata power is a **passive**. No new button. The student brings **one** kata. Basic Form 1 makes the counter hit harder. Basic Form 2 adds a kick after a counter. Keon and the later katas follow that same idea: the kata's real moves change how the buttons the student already has will behave.

What I am asking you to decide is in section 7. The build can start from the sizes in section 4 while those answers are on the way. Pinon 1, Pinon 2, Pinon 3, Nahanchi, and Possi stay blank until you send their steps. I did not invent moves for them.

Plain version of the four powers that have steps in the repo:

| Kata | In a fight | What you see and hear |
| --- | --- | --- |
| **Basic Form 1** (White) | A Great Counter's punch hits harder. | The usual "GREAT!" and gold flash. The gold damage number is a bit bigger. No new word. |
| **Basic Form 2** (Yellow) | After that punch, one kick lands. | "GREAT!" as usual, then the word "KICK!" and the small hit sound the game already uses for an extra hit. |
| **Keon** (Orange) | After that punch, one straight kick lands. | Same as Basic Form 2, with the word "KICK!". See taste call 1: the two kicks use the same existing hook. |
| **David and Goliath** (Green) | After a Great Counter, that attacker's next swing is softer. | "GREAT!" as usual, plus the word "FREE!". |

A Block that was a little early or a little late stays today's Block: half damage, the blue ring, the word "BLOCK", the block sound. The kata does not add a kick onto a miss. A student who never times the Counter (the masher in the test) fights exactly as they do today. Real class still supplies Power, Health, and Guard. The kata does not add those.

## 1. Where this sits

- **[DECIDED, Jay, Nov 8]** Kata powers are passives. No new button. One kata equipped. Basic Form 1 boosts counter power. Basic Form 2 adds a kick or a double strike after a counter. Later katas do the same kind of thing from their real moves.
- **[DECIDED]** A kata power is at most **PE 12**. Stance plus kata flat damage stays at or under **+12%**. Insight pairs stay under **PE 50**. Card + kata ≤ **38**, pair + kata ≤ **62**, route + kata ≤ **67**. Double Strike stays **0.2**. A Guardian takes **40–80** hits, and the player is not knocked out in fewer than **5** hits (R-BAL-12).
- **[CODE]** The Counter, the Block, and Double Strike already exist. A Great Counter hits at move strength 2 (`COMBAT.counter.perfectStrength` in `packages/sim/src/config.ts`). Extra strength is `counterStrength`, added in `resolveAttack` in `packages/sim/src/world.ts`. Extra hits after that counter are `counterHits`, same function, same `landHit` as every other hit. Double Strike is `strikeExtraHit` **0.2** on the **Strike** button only (`content/insights/insights.json`, applied in `tryStrike`). A Block's damage share is `blockShare`.
- **[CODE]** `KataPowerDef` already exists in `packages/sim/src/abilities.ts`. `characterSetup` already builds the effect list a fight uses. It does not read a kata power yet (`kataPowers` is always empty in `loadout.ts`). There is no `content/katas/powers.json` yet. That file is PB-04's slot. This doc is what goes in it.
- **[FACT]** School sheets with steps: `drafts/content/katas/basic-form-1.json`, `basic-form-2.json`, `keon.json`, `david-and-goliath.json` (Toni's sheets, Jay's Oct 24 notes). Names only, empty steps: `pinon-1.json`, `pinon-2.json`, `pinon-3.json`, `nahanchi.json`, `possi.json`. Spellings students see are in `docs/curriculum.md`.

## 2. The passives

One equipped kata. Its effect joins the fight's effect list. It does not add a button, and it does not add Power, Health, or Guard.

Kid lines below have no numbers. They are a proposal for the Content Designer. The word check already bans "break" except in the name Break Free, and it bans injury words, so David and Goliath's cue says "FREE!".

### Basic Form 1 — stronger counter

| | |
| --- | --- |
| **Passive** | Strong counter |
| **Trigger** | A Great Counter (the timed block). |
| **Effect** | `counterStrength` **0.5**. The counter punch's move strength goes from 2 to 2.5. Strikes, basic punches, and Blocks are unchanged. |
| **On screen** | Today's Great Counter: white flash, gold ring, "GREAT!", gold damage number. The number is higher because the hit is. No second word. |
| **Sound** | Today's Great Counter sound (`sfx.greatCounter`). |
| **Reduced motion** | No extra flash. "GREAT!" stays, the same way the game already handles that moment. |
| **Real kata** | Every step on the sheet is a low block and then a straight punch (`block.downward`, `punch.straight`), with turns and a cat stance on some steps. Steps 3 and 6 have a kiai. The passive is that punch. Step 3's written line has more than one punch; this power is one harder punch, because a string of extra punches is a bigger effect than the reserve allows (Off the Line, a real sign-off, already adds extra punches). |

### Basic Form 2 — kick after the counter

| | |
| --- | --- |
| **Passive** | Counter kick |
| **Trigger** | A Great Counter. |
| **Effect** | `counterHits`, **1** hit, move strength **0.3**. That is 15% of the counter punch's strength 2. It is the same strength as Off the Line's extra punches, so the two together do not raise that strength. The kick is a second `landHit` from the counter, the same function Double Strike uses from the Strike. `strikeExtraHit` stays 0.2 and this power does not add to it. Strength 0.4 (20% of the counter) put Off the Line plus the kick at PE 16.3 on newer Challenge. 0.31 read exactly 12.0. 0.30 reads 11.7, which is under 12. |
| **On screen** | "GREAT!" as today, then "KICK!" on the extra hit, with the gold spark a non-basic hit already draws. |
| **Sound** | Great Counter sound, then the small hit sound Double Strike's extra hit already uses (`sfx.hit` on a `chain` hit). The extra counter hit is silent in today's client (`playerAttack` with move `counter` has no sound line). The build adds that one sound. |
| **Reduced motion** | "KICK!" stays. No added flash. |
| **Real kata** | The sheet is Basic Form 1 plus a chamber, a reverse straight kick, a reverse punch, and a catch. Steps 3 and 6 have a kiai. The passive is that reverse kick, once, after the block lands as a Great Counter. |

### Keon — straight kick after the counter

| | |
| --- | --- |
| **Passive** | Straight kick |
| **Trigger** | A Great Counter. |
| **Effect** | Same hook and same measured size as Basic Form 2: `counterHits`, 1 hit, strength 0.3. |
| **On screen and sound** | Same as Basic Form 2: "KICK!" and the small hit sound. |
| **Real kata** | Keon adds a reverse inside block, an overhead block, a catch, and a straight kick, then a punch (steps 4–5 and 7–8). Step 9 has the kiai. The new attack is the straight kick after the catch. I also measured a longer stagger for the catch (`staggerTicks` 4 and 8). On the newer bot it did not shorten the fight (ticks 249 against a base of 248). A longer stagger is not proposed. Taste call 1 asks whether this shared kick is acceptable until you want a different Keon move to be the one that counts. |

### David and Goliath — the next swing is softer

| | |
| --- | --- |
| **Passive** | Free |
| **Trigger** | A Great Counter. |
| **Effect** | `disarm` **0.4**. That attacker's next swing deals 40% less. The existing cap in `effects.ts` stops the total at 0.9, so this plus the Disarm seal's 0.5 lands on the cap. |
| **On screen** | "GREAT!" as today, plus "FREE!". |
| **Sound** | Today's Great Counter sound. No new file. |
| **Reduced motion** | "FREE!" stays. No added flash. |
| **Real kata** | Step 2 is a double knife-hand block, written as breaking a choke or shoulder hold. Step 12 is the same idea as a double-handed choke. The passive is that release: the next swing is softer. The backfist and the front kick are real too; they are not this power, so it does not become a second copy of Basic Form 1. Green belt, so it is specified now and equipped when green content is in. The beta list is still Basic Form 1, Basic Form 2, and Keon. |

### Slots for Jay — moves are not in the repo

These names are real (`docs/curriculum.md` and `drafts/content/katas/`). Each file says there is no school sheet yet, and `steps` is empty. No passive, no trigger, and no number until the steps arrive. The pattern, once you send them: one passive, no new button, fired from the Counter or the Block the student already has, using a move that is actually on the sheet.

| Kata | Belt | Slot |
| --- | --- | --- |
| **Pinon 1** | Blue → Red | **Jay: send the steps.** Passive, trigger, and cue wait on the sheet. |
| **Pinon 2** | Red → Red/Black | **Jay: send the steps.** |
| **Pinon 3** | Red/Black → Brown | **Jay: send the steps.** |
| **Nahanchi** | Brown → Brown/Black | **Jay: send the steps.** |
| **Possi** | Brown/Black → Black | **Jay: send the steps.** |

## 3. Build spec

### 3.1 Data

New file `content/katas/powers.json`, a list of `KataPowerDef` (the type is already in `abilities.ts`):

```json
{
  "id": "basic-form-1-power",
  "kata": "basic-form-1",
  "name": "Strong counter",
  "text": "A Great Counter hits harder.",
  "status": "final",
  "effects": [{ "type": "counterStrength", "amount": 0.5 }]
}
```

| id | kata | effects |
| --- | --- | --- |
| `basic-form-1-power` | `basic-form-1` | `counterStrength` 0.5 |
| `basic-form-2-power` | `basic-form-2` | `counterHits` hits 1, amount 0.3 |
| `keon-power` | `keon` | `counterHits` hits 1, amount 0.3 |
| `david-and-goliath-power` | `david-and-goliath` | `disarm` 0.4 |

The five later katas are absent from this file until their sheets exist. The kata card keeps the approved line **"Power coming soon"** for a signed-off kata with no power row (Manager, Nov 1).

`effects` may only use types already in `effects.ts`. This set uses three that already run inside `resolveAttack`. No new effect type. No `powerScale`, so the flat-damage cap is unchanged: the biggest stance bonus in `abilities.json` is Horse Stance's 0.10 stand-still bonus (Front Stance is 0.08), the cap is 0.12, and kata adds 0.

### 3.2 Where it hooks in

1. **Load** the file next to the other ability files in `loadAbilities` (or a small `loadKataPowers` beside `loadStrikeDefs`). Unknown effect types fail the load, the way seals do.
2. **Earn** it when that kata's requirement is signed off. `earnedPicks` today returns `kataPowers: []`. It should return the ids of powers whose kata requirement is signed off.
3. **Equip** one, in the kata slot that already exists on `Loadout`. `normalizeSlots` already drops an unearned kata id.
4. **Fight.** `characterSetup` already puts seal effects and gear effects on `CharacterSetup.effects`, and `createRunWorld` turns that list into `player.mods`. Append the equipped power's `effects` to that list. One power. Placeholders and missing rows append nothing.
5. **Counter.** No new branch. `counterStrength` is already added on the Great Counter `landHit`. `counterHits` already loops extra `landHit`s after it. `disarm` is already set on that attacker in the same block.
6. **Block.** Unchanged. `blockShare` still lets half the hit through, minus gear and stance. These powers do not use `blockCut` or `blockReflect`.
7. **Double Strike.** Unchanged at 0.2. Do not put `strikeExtraHit` on a kata. The kick's 0.3 is the counter's own extra hit, 15% of strength 2.
8. **Buttons.** Counter, Strike, Dash, Stance, Virtue. Nothing else.
9. **Test.** One power at a time. A placeholder or a missing power adds no mod. Stance `powerScale` + kata `powerScale` ≤ 0.12 for every stance (kata is 0). `counterStrength` 0.5 raises only the counter hit. `counterHits` adds one hit and does not change `strikeExtraHit`. Two kata ids in the save collapse to one. Old saves with `kata: null` still load.

### 3.3 On screen and sound (client)

In `GameScene`, the Great Counter block stays. For the extra counter hit (`playerAttack`, move `counter`): play `sfx.hit()` and float "KICK!" when the equipped power has `counterHits`. For a power with `disarm`, float "FREE!" on the Great Counter. Basic Form 1 adds no word. Reduced motion: keep the words, skip any new flash. No new art and no new sound file.

## 4. The measured numbers

### 4.1 How it was measured

**[MEASURED]** The script is `drafts/planning/pb11-kata-sim.ts`. It plays whole runs through `packages/sim` (`startRun`, `createRunWorld`, the balance bot), with the trained-student stats in `packages/sim/test/r-bal-12-artists.ts` and the live enemy scale. Seeds start at 1000, same base as the Insight harness. A power is passed in as gear effects, which is the list `characterSetup` already feeds the fight. PE is the Insight harness rule: the +% Power that matches the run on rooms cleared, health lost, and ticks (`buildRuler` steps 0, 10, 20, 30, 40, 60).

Bots: **kid** (mashes, and on 12% of ticks taps Counter or Strike at random), **newer** (times the Counter, ordinary skill), **careful** (times the Counter, sharp), **masher** (never taps Counter). Difficulties: Guided and Standard on belts 1–10, Challenge on belts 4–10.

The size pick used **40 seeds**, Standard, all belts pooled (section 4.2). The full belt table used **30 seeds** (section 4.5). One win in 30 seeds is 3.3 points, so a single belt's win rate wobbles. Judge the **All** row. A PE with a star means that belt's +60% Power ruler moved health-lost by less than 1 point, so that PE is shaky and the ticks column is the thing to read. Noise on this harness is about **±5 PE**.

I tried larger counter bonuses (strength +1.0 and +1.5) and larger kicks (strength 1.0 to 2.0) in a 12-seed sweep. They did not move the fight in a clean line, and the skilled-bot readings climbed toward the top of the reserve. The counter bonus and the disarm amount are the ones that stayed at or under PE 12 on every pooled bot in the 40-seed run. The kick was then lowered from 0.4 to 0.3 so Off the Line plus the kick stays under PE 12 (section 4.4). The disarm amount still meets the 0.9 cap with the Disarm seal.

### 4.2 The powers alone (40 seeds, Standard, belts 1–10 pooled)

| Power | Kid PE | Newer PE | Careful PE | Masher PE | Newer ticks (base 248) |
| --- | --- | --- | --- | --- | --- |
| Basic Form 1, counter +0.5 | 1.9 | 9.3 | 8.4 | 0 | 244 |
| Basic Form 2 / Keon, one kick at 0.3 | 1.0 | 8.6 | 8.4 | 0 | 245 |
| David and Goliath, next swing −40% | 1.5 | 5.8 | 5.0 | 0 | 248 |
| Catch as a longer stagger (+4 or +8 ticks) | 0.5 to 1.9 | 0 | 0 to 5.2 | 0 | 249 (no help) |

All four proposed powers are **under PE 12** on every bot. The masher is 0 because the trigger is a Great Counter and that bot never makes one. The kid, who only sometimes times it, feels a small slice (about 1 to 2 PE). The students who time the Counter feel most of the reserve (about 8–9 PE for the punch and the kick). Making the numbers bigger so the kid reached 12 would push the careful student over the reserve. Real training stays the main source: these powers add no Power, Health, or Guard.

### 4.3 Limits

**PE 12.** Held, on the pooled 40-seed run. The highest pooled reading in the 30-seed table is 11.2 (careful, Standard, the kick). Guided rows where health lost is already under 1% are starred in the full table and are not used as a size.

**Stance + kata +12%.** Held **[CODE]**. Kata `powerScale` is 0. Horse Stance's 0.10 and Front Stance's 0.08 stay under 0.12 on their own.

**Insight pairs under PE 50, and the kata ceilings 38 / 62 / 67.** Re-measured on the same 40-seed Standard runs, one kata at a time. Heavy Hands is the single card. Ripple Counter + Heavy Hands is the pair that sat nearest the old ceiling. Routes are Rooted (Ripple + Iron Skin), Flowing (Wind Step + Double Strike + Quick Hands), and Power (Press the Advantage + Shield Breaker + Heavy Hands).

| Case | Kid | Newer | Careful | Masher | Limit |
| --- | --- | --- | --- | --- | --- |
| Heavy Hands alone | 20.0 | 20.0 | 20.0 | 13.3 | card 26 |
| Heavy Hands + Basic Form 1 | 22.3 | 22.3 | 20.9 | 13.3 | card + kata **38** |
| Ripple + Heavy Hands | 42.6 | 50.4 | 50.8 | 13.3 | pair **50** |
| That pair + Basic Form 1 | 43.7 | 42.4 | 53.3 | 13.3 | pair + kata **62** |
| That pair + the kick | 43.1 | 41.6 | 54.9 | 13.3 | **62** |
| That pair + David and Goliath | 43.0 | 53.8 | 52.0 | 13.3 | **62** |
| Double Strike + Heavy Hands | 31.6 | 50.2 | 28.7 | 28.5 | pair 50 |
| That pair + the kick | 32.4 | 48.8 | 26.0 | 28.5 | **62** |
| Rooted route + Basic Form 1 | 39.2 | 21.2 | 19.9 | 33.0 | route + kata **67** |
| Flowing route + the kick | 43.6 | 40.4 | 22.4 | 54.9 | **67** |
| Power route + Basic Form 1 | 44.5 | 44.4 | 29.0 | 44.5 | **67** |

The pair-only rows for newer (50.4) and careful (50.8) sit on the PE 50 line, inside the ±5 noise, and those bots already win every run so the ruler is near its top. The kid's pair is 42.6, under 50. Every card + kata, pair + kata, and route + kata row is under 38 / 62 / 67. On the masher the kata adds nothing, so those rows are the cards alone.

**Double Strike 0.2.** Held **[CODE]**. The insight file is untouched (`strikeExtraHit` 0.2). The kick does not add `strikeExtraHit`. Double Strike + Heavy Hands + the kick stays under 62 (highest 48.8, newer). Heavy Hands + the kick alone is 23.1 kid, 23.4 newer, 21.7 careful, 13.3 masher, under the card + kata ceiling of 38.

**R-BAL-12.** Held **[MEASURED, same formula as `r-bal-12-bands.test.ts`]**. Strength-1 hits, the band the test uses. Floor Keeper, every belt, all three model students: **45–54** hits on Standard, **67–80** on Challenge. Knockout: **7–10** hits on Standard, **5–7** on Challenge. Nothing under 5. Basic-attack Standard hits never leave 40–80. Hearth Cook on Challenge for the "trains more" student is **86–89** hits, the exception already accepted for that boss. These powers do not change Power or basic-attack strength, so they do not move this band.

A separate sensitivity, not the band: if every hit were a Great Counter (it is not; a fight is mostly basic punches), the Floor Keeper would be **23–27** counter-hits with today's strength 2, and **18–22** with Basic Form 1's +0.5. Today's counter is already a double-strength hit. The proposed bonus does not pull the official 40–80 band.

**Orange.** The flat +12% stand-in used to swing the kid's Standard win rate by about 16 points at Orange. These powers do not. In the 30-seed Standard table the kid's Orange (belt 3) win rate is 23.3% with nothing, 16.7% with Basic Form 1, 23.3% with the kick, and 30.0% with David and Goliath. That spread is a few runs, not a new power spike.

### 4.4 Stacked with the sign-off that uses the same hook

**[MEASURED, 30 seeds.]** Palm Heel (Counter seal) is already `counterStrength` 0.5. Off the Line (Escape seal) is already two extra hits at strength 0.3. The Disarm seal is already 0.5, and the code caps the sum at 0.9. The rows below are those sign-offs with the kata added. The kata is still the small part.

| Stack | Kid Standard PE | Newer Standard PE | Newer Challenge PE | Careful Standard PE | Masher |
| --- | --- | --- | --- | --- | --- |
| Palm Heel + Basic Form 1 (counter strength 1.0) | 6.1 | 10.3 | 12.9 | 4.9 | 0 |
| Off the Line alone (2 hits at 0.3) | 2.0 | 10.2 | 6.2 | 10.5 | 0 |
| Off the Line + the kick (3 hits at 0.3; the kick does not raise Off the Line's 0.3) | 6.7 | 10.9 | 11.7 | 4.0 | 0 |
| Disarm seal + David and Goliath (0.9, the cap) | 6.4 | 6.0 | 2.9 | 5.7 | 0 |

Newer Challenge is still the biggest of those stacks: Off the Line plus the kick at **11.7 PE** (ticks 224 against a base of 238). Careful Challenge is 10.7. Both are under 12. At kick strength 0.4 this same stack was 16.3. Strength 0.31 read 12.0 on newer Challenge, which is not under 12, so the kick is 0.3. A smaller kick does not shrink the stack any further: Off the Line is already strength 0.3, and the fight keeps the higher of the two.

### 4.5 Full table

30 seeds. Columns are win %, health lost as % of max health, ticks per fight, and PE. **BF2 / Keon** is one column (kick strength 0.3) because they use the same measured effect. Base, Basic Form 1, and David and Goliath match the previous table. The **All** row is every belt pooled, which is the reading to trust. A star on a PE means that belt's power ruler barely moved health, so read the ticks.

How to re-run: from the repo root, `PB11_BOT=kid PB11_MODE=table PB11_SEEDS=30 npx vitest run --config drafts/planning/vitest.pb11.config.ts` (and the same for `newer`, `careful`, `masher`). Raw results are in `drafts/planning/pb11-sim-out/`.

### Kid (mashes, and sometimes taps Counter) — Guided

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 50.0 | 30.0 | 36.7 | 53.3 | 31.4 | 30.4 | 30.6 | 30.9 | 342 | 332 | 333 | 343 | 8.8 | 7.4 | 2.8 |
| 2 | 50.0 | 43.3 | 46.7 | 40.0 | 31.5 | 30.9 | 31.0 | 30.4 | 344 | 340 | 342 | 341 | 6.0 | 4.3 | 11.9 |
| 3 | 86.7 | 83.3 | 86.7 | 93.3 | 28.7 | 27.9 | 28.2 | 28.4 | 492 | 481 | 483 | 495 | 4.4 | 3.3 | 0.6 |
| 4 | 53.3 | 46.7 | 66.7 | 53.3 | 31.2 | 30.2 | 30.5 | 30.0 | 339 | 336 | 339 | 339 | 3.0 | 11.5 | 2.5 |
| 5 | 40.0 | 60.0 | 50.0 | 40.0 | 33.0 | 31.4 | 30.9 | 32.9 | 350 | 344 | 339 | 350 | 3.9 | 5.4 | 0.4 |
| 6 | 40.0 | 63.3 | 43.3 | 43.3 | 33.3 | 31.5 | 31.0 | 32.7 | 351 | 346 | 340 | 351 | 3.7 | 4.7 | 1.3 |
| 7 | 36.7 | 43.3 | 30.0 | 40.0 | 32.2 | 30.2 | 31.7 | 31.6 | 343 | 334 | 340 | 344 | 9.5 | 4.2 | 1.4 |
| 8 | 40.0 | 43.3 | 36.7 | 43.3 | 31.6 | 29.9 | 31.1 | 31.0 | 345 | 336 | 342 | 346 | 8.8 | 3.0 | 2.0 |
| 9 | 43.3 | 53.3 | 50.0 | 46.7 | 31.6 | 29.4 | 30.9 | 31.1 | 344 | 336 | 344 | 348 | 9.4 | 2.3 | 1.6 |
| 10 | 43.3 | 56.7 | 46.7 | 53.3 | 31.5 | 29.4 | 30.2 | 31.0 | 347 | 339 | 341 | 351 | 7.6 | 4.2 | 3.6 |
| All | 48.3 | 52.3 | 49.3 | 50.7 | 31.6 | 30.1 | 30.6 | 31.0 | 361 | 353 | 355 | 361 | 5.7 | 3.8 | 2.0 |

### Kid (mashes, and sometimes taps Counter) — Standard

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 3.3 | 3.3 | 3.3 | 3.3 | 41.8 | 43.0 | 42.0 | 41.8 | 299 | 297 | 296 | 301 | 5.0 | 5.2 | 0.0 |
| 2 | 6.7 | 6.7 | 3.3 | 6.7 | 47.4 | 44.8 | 46.4 | 46.4 | 325 | 316 | 321 | 321 | 9.9 | 5.8 | 5.7 |
| 3 | 23.3 | 16.7 | 23.3 | 30.0 | 42.4 | 41.9 | 42.0 | 41.8 | 434 | 433 | 435 | 437 | 0.8 | 0.9 | 1.0 |
| 4 | 3.3 | 10.0 | 10.0 | 6.7 | 47.3 | 45.9 | 46.9 | 46.6 | 323 | 320 | 328 | 323 | 3.4 | 1.8 | 1.6 |
| 5 | 0.0 | 10.0 | 3.3 | 0.0 | 46.9 | 47.0 | 47.6 | 45.3 | 320 | 323 | 321 | 316 | 1.2 | 0.0 | 8.7 |
| 6 | 0.0 | 10.0 | 3.3 | 0.0 | 47.8 | 47.2 | 47.4 | 46.6 | 320 | 322 | 321 | 318 | 2.9 | 1.1 | 6.8 |
| 7 | 0.0 | 3.3 | 3.3 | 3.3 | 47.8 | 47.0 | 47.3 | 47.5 | 324 | 321 | 322 | 326 | 2.6 | 1.7 | 1.3 |
| 8 | 0.0 | 3.3 | 6.7 | 0.0 | 46.7 | 46.0 | 46.3 | 45.9 | 320 | 318 | 319 | 321 | 2.3 | 1.4 | 2.8 |
| 9 | 0.0 | 3.3 | 6.7 | 0.0 | 46.1 | 46.0 | 46.2 | 45.1 | 319 | 320 | 320 | 319 | 0.5 | 0.0 | 8.6 |
| 10 | 0.0 | 3.3 | 6.7 | 0.0 | 46.7 | 46.1 | 46.4 | 46.0 | 321 | 319 | 320 | 321 | 3.3 | 2.0 | 3.3 |
| All | 3.7 | 7.0 | 7.0 | 5.0 | 46.0 | 45.4 | 45.8 | 45.3 | 331 | 330 | 331 | 331 | 1.9 | 0.4 | 2.6 |

### Kid (mashes, and sometimes taps Counter) — Challenge (belts 4–10)

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 3.3 | 0.0 | 0.0 | 3.3 | 52.7 | 52.2 | 52.0 | 52.6 | 323 | 320 | 320 | 326 | 9.0 | 9.6 | 11.2 |
| 5 | 0.0 | 0.0 | 0.0 | 0.0 | 51.0 | 52.0 | 52.0 | 51.1 | 332 | 336 | 335 | 336 | 0.0 | 0.0 | 10.9 |
| 6 | 0.0 | 3.3 | 3.3 | 0.0 | 51.8 | 52.0 | 52.0 | 51.4 | 335 | 339 | 338 | 336 | 5.4 | 0.0 | 0.4 |
| 7 | 0.0 | 0.0 | 0.0 | 0.0 | 51.4 | 52.3 | 51.5 | 50.6 | 333 | 334 | 332 | 332 | 0.0 | 4.7 | 6.3 |
| 8 | 0.0 | 0.0 | 0.0 | 0.0 | 50.8 | 51.9 | 50.8 | 50.1 | 334 | 335 | 331 | 332 | 0.0 | 9.0 | 10.7 |
| 9 | 0.0 | 3.3 | 0.0 | 0.0 | 51.6 | 52.6 | 52.0 | 51.4 | 337 | 339 | 336 | 340 | 1.2 | 0.5 | 1.0 |
| 10 | 0.0 | 3.3 | 0.0 | 0.0 | 52.0 | 53.2 | 52.1 | 51.2 | 337 | 338 | 333 | 334 | 0.0 | 9.2 | 9.2 |
| All | 0.5 | 1.4 | 0.5 | 0.5 | 51.6 | 52.3 | 51.8 | 51.2 | 333 | 335 | 332 | 334 | 0.0 | 1.7 | 5.2 |

### Newer (times Counter, ordinary skill) — Guided

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.8 | 0.6 | 217 | 215 | 216 | 217 | 2.2* | 1.6* | 18.9* |
| 2 | 100.0 | 100.0 | 100.0 | 100.0 | 0.8 | 0.9 | 0.9 | 0.8 | 244 | 243 | 244 | 244 | 0.3* | 0.0* | 2.0* |
| 3 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.7 | 0.7 | 389 | 372 | 373 | 389 | 2.9* | 2.7* | 0.0* |
| 4 | 100.0 | 100.0 | 100.0 | 100.0 | 0.8 | 0.7 | 0.7 | 0.7 | 246 | 245 | 245 | 246 | 1.2* | 2.2* | 1.6* |
| 5 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.7 | 0.6 | 244 | 245 | 245 | 244 | 1.2* | 0.0* | 4.1* |
| 6 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.7 | 0.6 | 244 | 245 | 245 | 244 | 1.2* | 0.0* | 4.1* |
| 7 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.8 | 0.7 | 247 | 245 | 246 | 247 | 1.9* | 0.6* | 4.2* |
| 8 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.8 | 0.7 | 247 | 245 | 246 | 247 | 1.9* | 0.7* | 4.1* |
| 9 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.8 | 0.7 | 247 | 245 | 246 | 247 | 1.9* | 0.7* | 4.4* |
| 10 | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.8 | 0.7 | 247 | 245 | 245 | 247 | 1.1* | 1.1* | 4.4* |
| All | 100.0 | 100.0 | 100.0 | 100.0 | 0.7 | 0.7 | 0.8 | 0.7 | 257 | 255 | 255 | 257 | 1.1 | 0.8 | 3.1 |

### Newer (times Counter, ordinary skill) — Standard

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 100.0 | 100.0 | 100.0 | 100.0 | 4.9 | 5.3 | 5.4 | 4.8 | 213 | 210 | 210 | 212 | 3.4 | 2.9 | 4.8 |
| 2 | 100.0 | 100.0 | 100.0 | 100.0 | 4.7 | 4.4 | 4.4 | 4.5 | 232 | 228 | 228 | 232 | 11.5 | 10.9 | 5.1 |
| 3 | 100.0 | 100.0 | 100.0 | 100.0 | 4.0 | 4.0 | 4.2 | 3.9 | 371 | 371 | 371 | 371 | 0.1 | 0.0 | 0.2 |
| 4 | 100.0 | 100.0 | 100.0 | 100.0 | 5.0 | 4.8 | 4.8 | 4.8 | 237 | 231 | 232 | 237 | 9.4 | 8.7 | 5.4 |
| 5 | 100.0 | 100.0 | 100.0 | 100.0 | 4.9 | 4.6 | 4.6 | 4.7 | 242 | 233 | 234 | 242 | 11.5 | 10.6 | 6.1 |
| 6 | 100.0 | 100.0 | 100.0 | 100.0 | 5.1 | 4.6 | 4.7 | 4.9 | 243 | 233 | 234 | 243 | 11.7 | 10.8 | 5.4 |
| 7 | 100.0 | 100.0 | 100.0 | 100.0 | 4.9 | 4.4 | 4.3 | 4.8 | 240 | 235 | 235 | 240 | 13.2 | 13.4 | 2.6 |
| 8 | 100.0 | 100.0 | 100.0 | 100.0 | 4.8 | 4.3 | 4.2 | 4.7 | 241 | 235 | 235 | 241 | 13.4 | 13.7 | 5.9 |
| 9 | 100.0 | 100.0 | 100.0 | 100.0 | 4.8 | 4.2 | 4.2 | 4.6 | 240 | 236 | 236 | 240 | 13.1 | 13.3 | 2.6 |
| 10 | 100.0 | 100.0 | 100.0 | 100.0 | 5.0 | 4.5 | 4.4 | 4.8 | 240 | 236 | 235 | 240 | 7.5 | 8.6 | 2.1 |
| All | 100.0 | 100.0 | 100.0 | 100.0 | 4.8 | 4.5 | 4.5 | 4.6 | 250 | 245 | 245 | 250 | 7.9 | 7.6 | 3.0 |

### Newer (times Counter, ordinary skill) — Challenge (belts 4–10)

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 100.0 | 100.0 | 100.0 | 100.0 | 8.6 | 8.5 | 8.4 | 8.3 | 225 | 224 | 225 | 225 | 1.8 | 1.0 | 1.5 |
| 5 | 100.0 | 100.0 | 100.0 | 100.0 | 9.2 | 8.2 | 8.6 | 8.8 | 237 | 230 | 232 | 237 | 6.1 | 3.8 | 1.1 |
| 6 | 100.0 | 100.0 | 100.0 | 100.0 | 9.3 | 8.1 | 8.6 | 9.0 | 237 | 231 | 231 | 237 | 6.1 | 4.6 | 0.9 |
| 7 | 100.0 | 100.0 | 100.0 | 100.0 | 9.0 | 8.2 | 8.6 | 8.6 | 242 | 229 | 232 | 242 | 8.2 | 5.1 | 1.6 |
| 8 | 100.0 | 100.0 | 100.0 | 100.0 | 9.0 | 8.0 | 8.5 | 8.7 | 241 | 229 | 232 | 241 | 9.1 | 6.0 | 1.4 |
| 9 | 100.0 | 100.0 | 100.0 | 100.0 | 8.7 | 8.0 | 8.4 | 8.3 | 242 | 230 | 233 | 242 | 8.3 | 4.8 | 1.7 |
| 10 | 100.0 | 100.0 | 100.0 | 100.0 | 9.2 | 8.1 | 8.5 | 8.8 | 240 | 230 | 233 | 240 | 8.4 | 5.7 | 1.3 |
| All | 100.0 | 100.0 | 100.0 | 100.0 | 9.0 | 8.1 | 8.5 | 8.7 | 238 | 229 | 231 | 238 | 7.3 | 4.8 | 1.3 |

### Careful (times Counter, sharp) — Guided

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.4 | 0.3 | 0.2 | 223 | 220 | 219 | 223 | 2.8* | 3.5* | 0.0* |
| 2 | 100.0 | 100.0 | 100.0 | 100.0 | 0.4 | 0.4 | 0.4 | 0.4 | 245 | 244 | 244 | 245 | 6.8* | 6.4* | 6.7* |
| 3 | 100.0 | 100.0 | 100.0 | 100.0 | 0.3 | 0.2 | 0.3 | 0.3 | 389 | 373 | 376 | 389 | 7.7* | 4.8* | 0.0* |
| 4 | 100.0 | 100.0 | 100.0 | 100.0 | 0.5 | 0.5 | 0.5 | 0.4 | 248 | 248 | 247 | 248 | 0.0* | 0.8* | 1.8* |
| 5 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.5 | 0.5 | 0.2 | 250 | 245 | 246 | 250 | 3.2* | 2.8* | 21.5* |
| 6 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.5 | 0.5 | 0.2 | 250 | 245 | 246 | 250 | 3.2* | 2.8* | 21.5* |
| 7 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.5 | 0.5 | 0.2 | 253 | 246 | 246 | 253 | 4.7* | 4.5* | 14.4* |
| 8 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.5 | 0.4 | 0.2 | 252 | 246 | 246 | 252 | 4.6* | 4.4* | 14.7* |
| 9 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.5 | 0.4 | 0.2 | 253 | 246 | 246 | 253 | 4.7* | 4.5* | 14.4* |
| 10 | 100.0 | 100.0 | 100.0 | 100.0 | 0.2 | 0.5 | 0.4 | 0.2 | 252 | 246 | 246 | 252 | 4.7* | 4.5* | 14.5* |
| All | 100.0 | 100.0 | 100.0 | 100.0 | 0.3 | 0.5 | 0.4 | 0.3 | 261 | 256 | 256 | 261 | 3.4 | 3.2 | 22.7 |

### Careful (times Counter, sharp) — Standard

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 100.0 | 100.0 | 100.0 | 100.0 | 2.0 | 1.7 | 1.7 | 1.9 | 214 | 209 | 209 | 214 | 15.5* | 7.9* | 1.1* |
| 2 | 100.0 | 100.0 | 100.0 | 100.0 | 1.4 | 1.4 | 1.4 | 1.4 | 225 | 223 | 223 | 225 | 11.8* | 6.1* | 5.4* |
| 3 | 100.0 | 100.0 | 100.0 | 100.0 | 1.2 | 1.4 | 1.3 | 1.2 | 359 | 358 | 358 | 359 | 0.7* | 0.5* | 6.7* |
| 4 | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.3 | 1.5 | 1.5 | 229 | 226 | 227 | 229 | 6.2* | 2.5* | 0.6* |
| 5 | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.3 | 1.2 | 1.5 | 234 | 226 | 225 | 234 | 10.3* | 12.2* | 0.7* |
| 6 | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.3 | 1.2 | 1.5 | 234 | 226 | 225 | 234 | 10.1* | 11.9* | 0.7* |
| 7 | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.3 | 1.2 | 1.5 | 236 | 226 | 226 | 236 | 12.6* | 13.8* | 6.0* |
| 8 | 100.0 | 100.0 | 100.0 | 100.0 | 1.4 | 1.3 | 1.2 | 1.4 | 235 | 227 | 226 | 235 | 12.8* | 13.7* | 6.9* |
| 9 | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.2 | 1.2 | 1.4 | 236 | 227 | 226 | 236 | 12.8* | 13.7* | 6.0* |
| 10 | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.3 | 1.2 | 1.4 | 234 | 227 | 227 | 234 | 11.8* | 12.4* | 6.1* |
| All | 100.0 | 100.0 | 100.0 | 100.0 | 1.5 | 1.3 | 1.3 | 1.5 | 244 | 237 | 237 | 244 | 10.8 | 11.2 | 3.1 |

### Careful (times Counter, sharp) — Challenge (belts 4–10)

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 100.0 | 100.0 | 100.0 | 100.0 | 6.5 | 6.4 | 6.4 | 6.3 | 225 | 252 | 253 | 225 | 1.2 | 0.7 | 3.4 |
| 5 | 100.0 | 100.0 | 100.0 | 100.0 | 6.3 | 5.8 | 6.2 | 6.1 | 236 | 254 | 226 | 236 | 7.2 | 10.6 | 2.7 |
| 6 | 100.0 | 100.0 | 100.0 | 100.0 | 6.4 | 6.1 | 6.2 | 6.2 | 237 | 256 | 228 | 237 | 3.4 | 10.4 | 2.3 |
| 7 | 100.0 | 100.0 | 100.0 | 100.0 | 6.2 | 6.1 | 6.3 | 6.0 | 242 | 231 | 231 | 242 | 9.4 | 8.4 | 1.9 |
| 8 | 100.0 | 100.0 | 100.0 | 100.0 | 6.0 | 6.1 | 6.2 | 5.8 | 242 | 232 | 231 | 242 | 8.4 | 8.5 | 2.6 |
| 9 | 100.0 | 100.0 | 100.0 | 100.0 | 6.0 | 6.1 | 6.2 | 5.9 | 242 | 232 | 231 | 242 | 8.4 | 8.4 | 1.9 |
| 10 | 100.0 | 100.0 | 100.0 | 100.0 | 6.0 | 6.1 | 6.2 | 5.9 | 241 | 231 | 231 | 241 | 8.1 | 8.1 | 2.9 |
| All | 100.0 | 100.0 | 100.0 | 100.0 | 6.2 | 6.1 | 6.3 | 6.0 | 238 | 241 | 233 | 238 | 1.3 | 7.8 | 2.5 |

### Masher (never taps Counter) — Guided

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 20.0 | 20.0 | 20.0 | 20.0 | 45.1 | 45.1 | 45.1 | 45.1 | 372 | 372 | 372 | 372 | 0.0 | 0.0 | 0.0 |
| 2 | 16.7 | 16.7 | 16.7 | 16.7 | 38.9 | 38.9 | 38.9 | 38.9 | 375 | 375 | 375 | 375 | 0.0 | 0.0 | 0.0 |
| 3 | 0.0 | 0.0 | 0.0 | 0.0 | 35.7 | 35.7 | 35.7 | 35.7 | 480 | 480 | 480 | 480 | 0.0 | 0.0 | 0.0 |
| 4 | 20.0 | 20.0 | 20.0 | 20.0 | 39.7 | 39.7 | 39.7 | 39.7 | 371 | 371 | 371 | 371 | 0.0 | 0.0 | 0.0 |
| 5 | 23.3 | 23.3 | 23.3 | 23.3 | 40.1 | 40.1 | 40.1 | 40.1 | 376 | 376 | 376 | 376 | 0.0 | 0.0 | 0.0 |
| 6 | 16.7 | 16.7 | 16.7 | 16.7 | 39.4 | 39.4 | 39.4 | 39.4 | 375 | 375 | 375 | 375 | 0.0 | 0.0 | 0.0 |
| 7 | 13.3 | 13.3 | 13.3 | 13.3 | 42.0 | 42.0 | 42.0 | 42.0 | 377 | 377 | 377 | 377 | 0.0 | 0.0 | 0.0 |
| 8 | 20.0 | 20.0 | 20.0 | 20.0 | 41.3 | 41.3 | 41.3 | 41.3 | 382 | 382 | 382 | 382 | 0.0 | 0.0 | 0.0 |
| 9 | 16.7 | 16.7 | 16.7 | 16.7 | 40.1 | 40.1 | 40.1 | 40.1 | 378 | 378 | 378 | 378 | 0.0 | 0.0 | 0.0 |
| 10 | 16.7 | 16.7 | 16.7 | 16.7 | 40.0 | 40.0 | 40.0 | 40.0 | 379 | 379 | 379 | 379 | 0.0 | 0.0 | 0.0 |
| All | 16.3 | 16.3 | 16.3 | 16.3 | 39.9 | 39.9 | 39.9 | 39.9 | 391 | 391 | 391 | 391 | 0.0 | 0.0 | 0.0 |

### Masher (never taps Counter) — Standard

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 0.0 | 0.0 | 0.0 | 53.9 | 53.9 | 53.9 | 53.9 | 329 | 329 | 329 | 329 | 0.0 | 0.0 | 0.0 |
| 2 | 0.0 | 0.0 | 0.0 | 0.0 | 53.8 | 53.8 | 53.8 | 53.8 | 333 | 333 | 333 | 333 | 0.0 | 0.0 | 0.0 |
| 3 | 0.0 | 0.0 | 0.0 | 0.0 | 45.0 | 45.0 | 45.0 | 45.0 | 435 | 435 | 435 | 435 | 0.0 | 0.0 | 0.0 |
| 4 | 3.3 | 3.3 | 3.3 | 3.3 | 53.1 | 53.1 | 53.1 | 53.1 | 326 | 326 | 326 | 326 | 0.0 | 0.0 | 0.0 |
| 5 | 0.0 | 0.0 | 0.0 | 0.0 | 53.5 | 53.5 | 53.5 | 53.5 | 332 | 332 | 332 | 332 | 0.0 | 0.0 | 0.0 |
| 6 | 3.3 | 3.3 | 3.3 | 3.3 | 54.0 | 54.0 | 54.0 | 54.0 | 336 | 336 | 336 | 336 | 0.0 | 0.0 | 0.0 |
| 7 | 0.0 | 0.0 | 0.0 | 0.0 | 54.9 | 54.9 | 54.9 | 54.9 | 337 | 337 | 337 | 337 | 0.0 | 0.0 | 0.0 |
| 8 | 0.0 | 0.0 | 0.0 | 0.0 | 54.0 | 54.0 | 54.0 | 54.0 | 334 | 334 | 334 | 334 | 0.0 | 0.0 | 0.0 |
| 9 | 0.0 | 0.0 | 0.0 | 0.0 | 53.9 | 53.9 | 53.9 | 53.9 | 338 | 338 | 338 | 338 | 0.0 | 0.0 | 0.0 |
| 10 | 0.0 | 0.0 | 0.0 | 0.0 | 54.1 | 54.1 | 54.1 | 54.1 | 334 | 334 | 334 | 334 | 0.0 | 0.0 | 0.0 |
| All | 0.7 | 0.7 | 0.7 | 0.7 | 52.7 | 52.7 | 52.7 | 52.7 | 347 | 347 | 347 | 347 | 0.0 | 0.0 | 0.0 |

### Masher (never taps Counter) — Challenge (belts 4–10)

| Belt | Base win % | BF1 win % | BF2/Keon win % | D&G win % | Base health lost % | BF1 lost | BF2/Keon lost | D&G lost | Base ticks | BF1 ticks | BF2/Keon ticks | D&G ticks | BF1 PE | BF2/Keon PE | D&G PE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 0.0 | 0.0 | 0.0 | 0.0 | 60.7 | 60.7 | 60.7 | 60.7 | 334 | 334 | 334 | 334 | 0.0 | 0.0 | 0.0 |
| 5 | 0.0 | 0.0 | 0.0 | 0.0 | 55.2 | 55.2 | 55.2 | 55.2 | 328 | 328 | 328 | 328 | 0.0 | 0.0 | 0.0 |
| 6 | 0.0 | 0.0 | 0.0 | 0.0 | 55.3 | 55.3 | 55.3 | 55.3 | 326 | 326 | 326 | 326 | 0.0 | 0.0 | 0.0 |
| 7 | 0.0 | 0.0 | 0.0 | 0.0 | 56.3 | 56.3 | 56.3 | 56.3 | 332 | 332 | 332 | 332 | 0.0 | 0.0 | 0.0 |
| 8 | 0.0 | 0.0 | 0.0 | 0.0 | 54.4 | 54.4 | 54.4 | 54.4 | 333 | 333 | 333 | 333 | 0.0 | 0.0 | 0.0 |
| 9 | 0.0 | 0.0 | 0.0 | 0.0 | 54.1 | 54.1 | 54.1 | 54.1 | 336 | 336 | 336 | 336 | 0.0 | 0.0 | 0.0 |
| 10 | 0.0 | 0.0 | 0.0 | 0.0 | 55.8 | 55.8 | 55.8 | 55.8 | 335 | 335 | 335 | 335 | 0.0 | 0.0 | 0.0 |
| All | 0.0 | 0.0 | 0.0 | 0.0 | 55.8 | 55.8 | 55.8 | 55.8 | 332 | 332 | 332 | 332 | 0.0 | 0.0 | 0.0 |

## 5. Board items

One owner each. Nothing here is written onto `docs/work-board.md`. The Manager adds them if Jay wants the build to start. PB-04 is still the kata **slot**. These items are the powers that go in that slot, and the cue.

| Item | Owner | What | Done when | Waits on |
| --- | --- | --- | --- | --- |
| **PB-16** | Jay | Answer the taste calls in section 7. | A yes or a change on each call, in any form (a sentence is enough). | Nothing. |
| **PB-17** | Programmer | `content/katas/powers.json` for Basic Form 1, Basic Form 2, and Keon, at the sizes in section 2. Load it, earn it from the kata sign-off, append it in `characterSetup`. No new button, no new effect type, no `powerScale`, Double Strike left at 0.2. David and Goliath's row can sit in the same file and stay unequipped until green. Tests from section 3.2. | The tests pass. Equipping Basic Form 1 changes only the Great Counter hit. Equipping Basic Form 2 adds one extra hit and leaves `strikeExtraHit` at 0.2. An old save with no kata still loads. | Nothing for these sizes. A different Keon answer from PB-16 is a one-line data edit. |
| **PB-18** | Programmer | The cues in section 3.3: "KICK!" and the existing small hit sound on the extra counter hit, "FREE!" when David and Goliath is equipped. Reduced motion keeps the word and skips a new flash. | A fight in a test shows the word and plays the sound. Reduced motion does not add a flash. | PB-17. |
| **PB-19** | Content Designer | The four kid lines in section 2, in a draft the game can load. No numbers, no injury words, no "break" outside Break Free. | The draft is in and the word check passes. | PB-16 for the "FREE!" word and the Keon line. The other two lines can be drafted now. |
| **PB-20** | Tester | Phone pass, landscape, on a phone-sized window. Cases: white belt can equip only Basic Form 1; orange can equip one of the three; no new button; a Great Counter shows GREAT! and, for Basic Form 2, KICK!; a mistimed Block still says BLOCK and does not kick; reduced motion; an old save still starts a run; "Power coming soon" if a kata has no power row. | The cases are written down with a pass or a fail each. | PB-17 and PB-18. |
| **PB-21** | Jay | Send the steps (or the school sheets) for Pinon 1, Pinon 2, Pinon 3, Nahanchi, and Possi, the same way Basic Form 1 arrived. | Each of those five files in `drafts/content/katas/` has steps, or you say which one is still missing. | Nothing. Their powers stay blank until then. |

## 6. What this keeps

- The game does not change real rank, and it does not sign anything off.
- No purchases, ads, loot boxes, or anything bought.
- No free-text chat.
- No pressure, guilt, streaks, or "you missed this." A student who never counters simply does not see the kata moment. Nothing is taken away.
- Power Rating stays hidden. Players see the kata name, the kid line, and the moment in the fight.
- Real training stays the main source of Power, Health, and Guard. The kata only changes what a Great Counter does.

## 7. Taste calls for Jay

1. **Keon and Basic Form 2 use the same kick hook.** Basic Form 2's sheet adds a reverse kick. Keon's sheet adds a straight kick after a catch. A longer stagger for that catch did not change the fight, so both powers are one extra hit at the same size. Is that all right for the beta, with the words carrying the difference, or do you want Keon to wait until you pick a different move from the sheet?
2. **"FREE!" for David and Goliath.** The sheet's words are a choke break. The game's word check does not use "break" except in Break Free, and the moment should not be scary. "FREE!" is the proposal. If you want a different one-word cue, say it.
3. **A student who only mashes does not feel these.** The test player who never taps Counter fights exactly as today, on every belt and every difficulty. That matches "the kick comes after a counter." If you want a 6-year-old who never times the Counter to feel their kata too, that is a different power and it needs its own measurement. I did not add one.
4. **These are side by side, not a ladder.** Basic Form 1, the kick, and David and Goliath are about the same size. A higher belt's kata is not a bigger kata. The higher belt is stronger because of real training. Good to keep?
5. **The five later katas stay blank.** Pinon 1, Pinon 2, Pinon 3, Nahanchi, and Possi have names only. I will not write their powers until the steps are in the repo.

## 8. Delivery note

- **ITEM:** PB-11 kata passives
- **WHAT:** A plan for passive kata powers with no new button. Basic Form 1 makes the Great Counter hit harder. Basic Form 2 and Keon add one kick after that counter, at move strength 0.3, using the same hit the game already uses for an extra blow. Double Strike stays at 0.2. David and Goliath softens the attacker's next swing, from the choke-break steps on the sheet. Pinon 1, Pinon 2, Pinon 3, Nahanchi, and Possi are empty slots. The kick was lowered from 0.4 so Off the Line plus the kick, on Challenge for a student who already counters, measures 11.7 PE (under 12). The full table was rerun and is in section 4.5.
- **WHY:** Jay's Nov 8 direction replaces the empty placeholder in PB-11. The Programmer can fill the kata slot from this without guessing a move or a number. The 0.4 kick made the biggest stack 16.3 PE, over the reserve.
- **DECIDE:** The five taste calls in section 7. The kick size is now 0.3. A different Keon is a one-line data change.
- **NEXT:** Manager can put PB-16 through PB-21 on the board. Programmer builds PB-17 from section 3, with the kick at 0.3. Jay sends the five later sheets when he is ready (PB-21).
