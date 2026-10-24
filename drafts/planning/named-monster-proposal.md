# M7-N1: rare "named monsters" (Jay's idea)

**For:** Jay (via the Manager) · **Date:** 2026-10-24 · **Status:** ✅ **Approved for launch** as M7-N1 (Jay, via the Manager, 2026-10-24). Spec closed below.
**Launch scope:** ✅ **In launch scope**, small version only: Tier 2, 3 named monsters, a one-screen Monster Journal. Build after elites (K7), because it reuses the aura layer.

**Calls already made:** before launch · 5% per run · yellow belt (Tier 2) and up · gold sparkles only · small Monster Journal now.

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

## Final rules (closed)
- **Roll once per run**, when the floor starts: 5% chance. If it hits, it appears in the first battle room the student enters at room 3 or later (never rooms 1–2, never challenge, boss, treasure or rest rooms). If no battle room comes after room 3, nothing appears and nothing carries over.
- **Which monster:** one of the tier's named monsters at random, equal chance. No "ones you haven't met" weighting, so nobody can chase a set.
- **Which enemy it replaces:** one normal enemy of its type in that room. If the room has none of that type, pick a monster whose type is in the room.
- **Never** in the tutorial floor, Sensei's practice rooms, a profile's first 3 runs, or Tier 1 (white belt) floors. Same on every difficulty, Guided included.
- **Stats:** ×1.5 Health. Same Power, Guard, speed, wind-up and Perfect Counter window as the normal enemy.
- It counts as one normal enemy for room grades and par time.

## With elites (closed)
- A room with a named monster **has no elite**. The named room is picked first; the elite roll skips it.
- It **never gets an elite trait**, is never a guarder, and can't be protected (no elite shares its room).
- It doesn't count toward the 2-elites-per-floor cap.
- Look: drifting gold sparkles + name plate under its feet. No swooshes, no dome, no blue.

## What gets saved (closed)
One small addition to the saved profile (`packages/sim/src/profile.ts`), next to personal bests:
- `runsStarted: number`, for the "first 3 runs" rule (only if the profile doesn't already count runs).
- `monsterJournal: { [monsterId]: { met: boolean; beaten: boolean } }`, empty at first. Old saves load as empty.
- Nothing else: no "last seen" date, no counts, no timers. That keeps out streak and FOMO feelings.
- The sticker goes in the normal Home Dojo decoration save.

## Monster Journal screen (closed)
- **Where:** a button in the Home Dojo, next to the Lesson Scroll. Shows from yellow belt. One Sensei line introduces it the first time a named monster is met (no separate lesson).
- **One page per tier:** "Sunrise Garden" title, then 3 cards.
- **Met:** drawing, name, one friendly fact ("Old Thumper always stamps twice. Watch its feet!"). After a win, a stamp in the corner.
- **Not met:** grey "?" shape and "Keep exploring!" Nothing else: no "1 of 3", no percent, no hints.
- Read-only. No buy, share or speed-up buttons.
- The full Bestiary is still after launch. This screen must stay this size.

## Names for the Content Designer (closed for build)
Build with **Old Thumper** (brute), **Zippy Zoom** (swarmer), **Captain Clank** (shield). The Content Designer may rename them and writes the 3 Journal facts and the Sensei line. Rules: two short friendly words, easy to say out loud, never scary, gross or mean, no real people, brands or famous characters. Ids stay `old-thumper`, `zippy-zoom`, `captain-clank` whatever the shown names.

## Cost
- **M.** Reuses enemies, the elite aura layer (K7) and reward moments.
- New: run roll, ×1.5 Health, 3 tells, Journal save and screen, stamps and 3 stickers.

## Risks
- **Mixing up with Swift.** Fix: sparkles only, no swooshes; greyscale check.
- **Kids chasing it** (playing just to find one). Fix: low chance, no counters, no extra reward after the first win.
- **Tells that confuse.** Each tell must be tested so a 6-year-old still counters on the normal warning.
- **Launch scope creep.** Keep it to Tier 2 and 3 monsters until after launch.

## Done when (a tester can check)
1. With a test link (`?named=old-thumper`), the named monster shows up in room 3 with drifting gold sparkles and a name plate under its feet that fades after 3 s.
2. In a greyscale screenshot, it still looks different from a Swift elite.
3. Its red danger circle, wind-up and Perfect Counter window match the normal enemy on Guided, Standard and Challenge (sim tick test).
4. It has 1.5× the normal enemy's Health (Old Thumper = 270).
5. Over 1,000 simulated Tier 2 runs: it appears in 4–6% of runs, never twice in one run, never in rooms 1–2 or non-battle rooms, never on the tutorial, a white-belt floor or a profile's first 3 runs.
6. Over the same runs: no room with a named monster has an elite, and it never has a trait or a blue tether.
7. Meeting it sets `met` and its Journal card appears. Beating it sets `beaten` and gives the stamp and sticker once. Beating it again gives normal loot only.
8. Losing to it removes nothing.
9. An old save without `monsterJournal` loads fine, with every card showing "?".
10. The Journal screen shows no counts, percents, timers or buy buttons (screenshot check).
11. The Learning Designer (L4) passes it for no pressure and no gambling feel.

## Art ask for the Artist
- **Sparkle overlay:** drifting gold sparkles only (from the Swift sample's rising sparkles, without the swooshes or ground glow). 8 frames, 10 fps, same 256×256 frame and ground point (128, 210) as the elite auras, scaled per enemy. Slow upward drift, soft, firefly-like.
- **Name plate:** small cream plate with dark text, drawn **under the feet**, readable at phone size, in the game fonts (Fredoka/Andika).
- **3 tell effects for Tier 2:** stamp dust (Old Thumper), dash sparkle trail (Zippy Zoom), shield-tap flash (Captain Clank).
- **Journal page:** one page frame, a "?" silhouette, and a stamp graphic.
- Check against the cream Sunrise Garden floor and in greyscale next to a Swift elite.

## Still needs Jay
- Nothing blocks the build. Jay can rename the monsters through the Content Designer at any time; ids don't change.
