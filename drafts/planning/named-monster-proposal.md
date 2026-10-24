# Proposal: rare "named monsters" (Jay's idea)

**For:** Jay · **Date:** 2026-10-24 · **Status:** Proposal only.
**Launch scope:** ⚠️ **Adds to launch scope** if built before April. A small version (below) fits cheaply after elites (K7) land. My advice: build the small version only if milestone 7 is on track; otherwise right after launch.

## The idea in short
Once in a while, a normal enemy shows up as a **named monster**: a special one-of-a-kind creature with its own name, gold drifting sparkles, and one special move. Beat it (or just meet it) and it goes into your **Monster Journal** with a cosmetic stamp. It's a happy surprise, like spotting a rare bird, never a prize you must chase.

## The look (from the elite aura sample)
- I looked at the elite aura samples in PR #10 (`incoming-art/elite-auras/`, commit 6e9d448 and the one before it). The **Swift** aura is gold, with swooshes circling the enemy and **little sparkles rising**.
- **Problem:** gold already means Swift, the Floor Keeper's color (`#ffd36b`) and the golden defeat effect. If the named monster uses the same gold swooshes, kids will mix it up with Swift.
- **Fix:** use **only the drifting gold sparkles** (no swooshes, no dome) plus a **name plate** under the enemy. Sparkles drift slowly upward, like fireflies. That reads as "special", not "fast".
- Keep "nothing above enemy heads" (Jay's rule from the badge review): the name plate goes **under the feet**, small, and fades after 3 seconds.

## The rules (starting numbers)

**Spawn chance and limits**
- **5% chance per run** that one named monster appears. Shows up in a battle room in the middle of the floor (rooms 3–6), never room 1 or 2, never the boss room.
- **At most once per run.** Never in the tutorial or the first 3 runs of a new profile.
- **No bad-luck counter, no "streak", no "it's been a while" message.** It's a surprise, not a goal to grind. (Avoids pressure and the loot-box feeling.)
- **Not stacked with elites:** a room with a named monster has no elite.

**Which belts and floors**
- **Tier 1 (white):** off. White belts are still learning the basics.
- **Tier 2 (Sunrise Garden, yellow) and up:** on. One named monster per enemy type per tier, so Tier 2 has 3 (brute, swarmer, shield). The Floor Keeper/Guardian is never named; it's already special.

**How it differs from an elite**

| | Elite | Named monster |
| --- | --- | --- |
| How often | Up to 1 per room, from 4th belt | 5% per run, at most 1 |
| Look | Gold (Swift) or blue (Guarding) aura | Drifting gold sparkles + name plate under feet |
| Toughness | Same Health, one trait | **+50% Health**, same damage |
| Tell | Normal warning | Normal warning **plus one unique tell** (below) |
| Reward | Slightly better loot | Monster Journal entry + cosmetic stamp |

**One unique tell each (Tier 2 examples)**
The tell always **adds to the warning**; it never hides or shortens it. The red danger circle and Perfect Counter window stay the same as the normal enemy on every difficulty.
- **Old Thumper** (brute): stamps twice before the big swing; the floor shakes a little on each stamp. Same wind-up timing.
- **Zippy Zoom** (swarmer): leaves a short sparkle trail showing the path it will dash along.
- **Captain Clank** (shield): taps its shield three times ("clank, clank, clank") before attacking, so you can hear when to Counter.

**Naming style (ages 6+)**
- Two short, friendly words: a silly or kind describing word plus a sound or action. Easy to say out loud at the dojo.
- Never scary, gross or mean. No real people, brands or famous characters.
- The Content Designer writes the final names (could be a C-item).

**The reward (fair and hopeful)**
- **First time you meet one:** a **Monster Journal** page with its name, a drawing and one friendly fact ("Old Thumper always stamps twice. Watch its feet!").
- **First time you beat one:** a **cosmetic stamp** on that page, plus one matching decoration sticker for the Home Dojo wall.
- **After that:** normal loot only. Nothing extra for beating it again.
- **Never power.** No gear, stats or Training Points. Real training stays the main source of strength.
- **No loss:** losing to it costs nothing. It may show up again in a future run, with the same 5% chance.
- **No FOMO:** no time-limited named monsters, no "last chance", no counting days.
- The Journal page shows "?" for ones you haven't met, with no pressure text ("Keep exploring!" only).

## Cost
- **M.** Mostly reuses what exists: enemies, the elite aura layer from K7, reward moments.
- New pieces: spawn rule, +50% Health, 3 tells, a simple Monster Journal page (one screen listing 3 per tier), stamps.
- ⚠️ The **Bestiary is after launch** (core-design §13). This Journal must stay a tiny one-screen list, or it becomes the Bestiary early. Alternatively, fold it into the Bestiary after launch.

## Risks
- **Mixing up with Swift.** Fix: sparkles only, no swooshes; greyscale check.
- **Kids chasing it** (playing just to find one). Fix: low chance, no counters, no extra reward after the first win.
- **Tells that confuse.** Each tell must be tested so a 6-year-old still counters on the normal warning.
- **Launch scope creep.** Keep it to Tier 2 and 3 monsters until after launch.

## Done when (a tester can check)
1. With a test link (`?named=old-thumper`), the named monster shows up in room 3 with drifting gold sparkles and a name plate under its feet that fades after 3 s.
2. In a greyscale screenshot, it still looks different from a Swift elite.
3. Its red danger circle and Perfect Counter window match the normal enemy on Guided, Standard and Challenge (a sim test can check the ticks).
4. It has 1.5× the normal enemy's Health.
5. Over 1,000 simulated runs on Tier 2, it shows up in about 5% (4–6%), never twice in one run, never in rooms 1–2, the boss room, the tutorial or a white-belt floor.
6. Meeting it adds a Journal page; beating it adds the stamp once; beating it again gives normal loot only.
7. Losing to it removes nothing.
8. Learning Designer (L4) passes it for no pressure / no gambling feel.

## Art ask for the Artist
- **Sparkle overlay:** drifting gold sparkles only (from the Swift sample's rising sparkles, without the swooshes or ground glow). 8 frames, 10 fps, same 256×256 frame and ground point (128, 210) as the elite auras, scaled per enemy. Slow upward drift, soft, firefly-like.
- **Name plate:** small cream plate with dark text, drawn **under the feet**, readable at phone size, in the game fonts (Fredoka/Andika).
- **3 tell effects for Tier 2:** stamp dust (Old Thumper), dash sparkle trail (Zippy Zoom), shield-tap flash (Captain Clank).
- **Journal page:** one page frame, a "?" silhouette, and a stamp graphic.
- Check against the cream Sunrise Garden floor and in greyscale next to a Swift elite.

## Decisions for you
1. Build before launch (small version) or right after launch?
2. 5% per run and Tier 2+ only: OK?
3. Sparkles only (not the full Swift aura), so it doesn't look like Swift: OK?
4. The tiny Monster Journal, or wait and put them in the Bestiary after launch?
