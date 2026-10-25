# Progress

## Milestone 0 — Setup (2026-10-05)

**Done**
- Repository layout from CLAUDE.md created; docs moved into `docs/`.
- Blank Phaser 3 + TypeScript + Vite game in `apps/client` showing a "Dojo Ascent" title screen: landscape, fills the screen, respects safe areas, "turn sideways" message in portrait, pauses in the background.
- Set up for Capacitor later (relative paths, `dist` output); Capacitor not yet installed.
- `packages/sim` with Vitest and one passing test (20 ticks per second).
- `docs/decisions.md` and `docs/progress.md` created.

- Cloudflare hosting connected (a Worker project named `dojo-ascent`, set up in `wrangler.jsonc`). The work was copied onto `main` so Cloudflare publishes it.

**Problems Jay reported**
- The Cloudflare Pages steps didn't match his screen: Cloudflare now creates a "Worker" project by default. Fixed by adding `wrangler.jsonc`.
- The first Cloudflare build failed because `main` didn't contain the game yet. Fixed by copying the work onto `main`.

**Confirmed**
- Jay opened the Visit link on his phone, turned it sideways, and saw the "Dojo Ascent" title screen. Milestone 0 is done.

**Next**
- Milestone 1: Movement (start in a fresh session).

## Milestone 1 — Movement (2026-10-06)

**Done**
- One training room (`content/rooms/training-room.json`) with outer walls, pillars, and a long inner wall.
- Movement rules in `packages/sim`: stick movement, tap-to-move with a route around walls, sliding along walls, 20 ticks per second. 13 automated tests pass (never through walls, same inputs always give the same result, saveable state).
- The Phaser game draws the room and a placeholder character (a white circle with a belt and a dot showing which way it faces), with a gold ring where it's walking to and a small walking bob.
- Title screen now says "Tap to start".
- Pushed to the `claude/determined-noether-ikwere` branch. The Cloudflare preview link was hard to find (Cloudflare moved previews to the build page), so with Jay's OK the work was copied onto `main` (the live link) on 2026-10-06.

**Confirmed**
- Jay tested on his phone: tap-to-move and the stick both work great. He asked for a slightly bigger character, which was done (about 35% bigger on screen). Milestone 1 is done.

**Next**
- Milestone 2: Combat core (fresh session).

## Milestone 2 — Combat core (2026-10-06)

**Done**
- Combat rules in `packages/sim`: automatic basic attacks, Strike, Counter with Perfect Counter / Block / Hit, Health, Focus, the combo counter and its bonus, the brute's routine (walk up, wind up, swing, recover), stagger, defeat and return to the room start, and the "only two attackers at once" rule. 41 automated tests pass (including: every attack is telegraphed for its full wind-up, the counter window is exact on each difficulty, stepping out of the red circle avoids damage, and the same button presses always give the same fight).
- The brute as a data file (`content/enemies/brute.json`) placed in the training room.
- In the game: the brute with its red warning circle, a "!" and a wind-up sound; the Strike and Counter buttons in the bottom-right corner (Strike fills up as Focus builds and pulses when ready); a health bar, a Focus bar and a combo counter; hit flashes, a short freeze on impact, screen shake, sparks, damage numbers, a big "PERFECT!" moment, and generated sounds.
- Pushed to the `claude/practical-pascal-jyrddw` branch, then copied onto `main` (the live link) with Jay's OK on 2026-10-06.

**Jay's feedback**
- Good for ages 10 and up; brute pace and damage are right. For Guided, the danger circle now fills at normal speed and then holds "nearly full" for 0.5 s (vs 0.3 s on Standard), so young kids still have to time the tap (testable with `?difficulty=guided` on the link).

**Confirmed**
- Jay approved the new Guided timing. Milestone 2 is done (2026-10-06).

**Decided for milestone 3 (fights with several enemies)**
- Attacks landing at the same moment stay as they are: one Counter covers one attack (Jay's call: realistic, forces judgement calls).
- Add a **Dash** button so players can get out of the way before overlapping attacks land. Plan its details with Jay first.
- Grunts move faster than brutes (see decisions).

**Next**
- Milestone 3: A full floor (fresh session).

## Milestone 3 — A full floor (2026-10-06)

**Done**
- **Dash** button (no protection mid-dash, per Jay).
- **Swarmer** and **Shield Guard** enemies, plus the **Floor Keeper** boss (two attacks, calls in swarmers at half health). Waiting enemies circle the player; still only two attack at once.
- **A 7-room floor** from a library of 10 hand-made rooms: door choices (battle, challenge, treasure, rest), health carrying over, chests, the rest shrine, challenge timers, then the boss and its chest, then the door home.
- **Room grades** S / A / B, with a bonus item for S.
- **9 Insights**: pick 1 of 3 after each battle or challenge room.
- **Loot**: hand wraps, gi and charms with rarity colors and chimes, the 70 / 22 / 7 / 1 rarity shares, and bad-luck protection (guaranteed Rare on the 5th dry run).
- **Home Dojo screen**: Enter the Tower, Practice room, last run summary, personal bests with "NEW!", and gear you can wear, with up/down arrows.
- Rooms, enemies, Insights and loot tables are data files in `content/`. 64 automated tests pass (including a full floor played start to finish, rarity shares, bad-luck protection, the same seed giving the same run, and defeat keeping your items).
- Checked on a phone-sized screen in a test browser: Home, a battle room, the grade, the Insight cards, treasure room and doors, the boss with its helpers, coming home to the summary, the gear screen, and the practice room's Home button.

**Not done / known limits**
- ~~A run in progress isn't saved if the app is closed.~~ Fixed in K11/M7-P11: the run is saved at the start of each room.
- Real fights haven't been balanced beyond the starting numbers; Jay's playtest decides.

**Next**
- Jay plays full runs on his phone and gives feedback (run length 10–15 minutes? enemy mix? Dash feel?).
- Milestone 4: Training link (mock data), in a fresh session.
- With Jay's OK, milestone 3 was copied onto `main` (the live link) on 2026-10-06 for testing.

**Jay's first playtest and changes (2026-10-06)**
- Lost twice, won once. Feedback: too many treasure rooms in a row; fights messy and crowded; swarmers and brutes too close in speed; no reason to run and pick off swarmers.
- Ran a balance simulation, then: treasure rooms never back to back (max 2 per floor), swarmers faster (4.0), brutes slower (1.2) and they get **winded** after a long chase (stop and take +50% damage), waiting enemies circle farther out, lighter freezes on small hits. 67 tests pass.
- Street Smarts doors idea saved for milestone 6 (see decisions).
- Copied onto `main` for Jay to test again.

**Next**
- Jay re-tests: can he now separate swarmers from the brute, and does running feel worth it? Is the crowding better?

**Claude's own playtest (2026-10-06)**
- Built a computer player that plays full runs (`npm run balance` in `packages/sim`) and used it to tune: enemy waves, tougher enemies, a catch-your-breath heal after fight rooms, fairer grades, less enemy loot, a gentler Training Yard. Typical players now win about 93% playing smart versus 78% standing and countering; the boss is the main challenge. 67 tests pass. Copied onto `main`.

**Next**
- Jay playtests: run time (shown on the run summary), whether waves feel less crowded, whether running and winded brutes feel good, and whether the difficulty feels right.

**Jay's second playtest (2026-10-06)**
- Waves made fights much cleaner. Leading swarmers away and fighting in groups works. Winded brutes are worth chasing, and the +50% damage is "perfect."
- Run time shown in the summary: 2:43 (about 3–4 minutes with menus). That's far below the docs' 10–15 minutes. Asked Jay to choose: longer floors, 5–7 minute floors (recommended), or keep as is until the student playtest.
- Guided (easy) mode not tried yet.
- Jay chose 5–7 minute runs (short phone sessions). Floors are now 8 rooms (7 + boss); docs updated. Copied onto `main`.

**Next**
- Jay confirms the run length feels right. Then milestone 3 is done.
- Milestone 4: Training link (mock data), in a fresh session. Try Guided (`?difficulty=guided`) when time allows.

**Final changes and sign-off (2026-10-06)**
- Fix: after a treasure room or rest shrine, every door leads to a fight; at most 2 rest shrines per floor (Jay found rest/treasure could skip all fights). 68 tests pass. Copied onto `main`.
- Dodge-only attacks (can't be Countered or Blocked) recorded for milestone 10.
- Jay is happy with the run length for now. **Milestone 3 is done.**

**Next**
- Milestone 4: Training link (mock data), in a fresh session.
- Still open: Jay to try Guided (`?difficulty=guided`) when he has time.
- Balance tool: `npm run balance` in `packages/sim` re-checks difficulty after any change.

## Milestone 4 — Training link with fake data (2026-10-07)

**Done**
- Three fake profiles of one student (Sam T.) in `fixtures/`, shaped like the DojoForge feed, with Action Zone's real belt list and technique names: brand-new white belt, white belt with 3 sign-offs and the Respect stripe, and yellow belt (all yellow signed off, approved to test, one white catch-up item).
- A hidden **testing screen** (tap "Home Dojo" 5 times). You can switch profiles, replay the celebrations, add levels, and see the **Power Rating** with its breakdown (hidden everywhere else).
- Abilities unlock from sign-offs: **Forms** (with a Form button in fights), **Strike upgrades**, **Technique Seals** (upgrading the Counter) and **Virtues** from stripes (with a Virtue button). Respect earned again becomes Shield of Respect II. A new **Abilities** tab shows each one with its real technique name, who signed it off and when, or what to sign off to unlock it.
- The character's **belt color and stripes** match the profile, in the Home Dojo and in fights.
- **Levels and experience**, capped by belt (10 per tier), with double experience below the expected level.
- **The Gate** tab: a lock per requirement, the time-in-rank sundial, Sensei's Seal with the test date, and "READY".
- **The Dojo Blessing** after class: glow, +50% experience, better loot.
- **Reward moments**, sized by importance, and the 4-step **promotion ceremony**.
- **The Path card**: next technique (or catch-up item), next class day, test day.
- The Insight "Second Wind" is renamed "Rally" (the Great Effort Virtue uses that name).
- 109 automated tests pass (new: profiles load, the curriculum's numbering, legacy grant and catch-up, Gate, Path card, Blessing, reward moment order, experience pacing and the level cap, the Power Rating split and its hard cap, and every Form, Seal and Virtue in a real fight).
- Checked on a phone-sized screen in a test browser:
  - the welcome
  - the stripe and sign-off moments
  - the full white → yellow ceremony
  - the Gate and Abilities tabs
  - the Virtue shield and Form switch in the practice room
  - experience after a run

**Not done / known limits**
- Spending Training Points, a loadout screen, Missions, the "Watch the real technique" videos, the promotion trophy and card, and Tower floors per belt are later milestones.
- Time in rank per belt now uses Jay's real numbers (2026-10-07). Classes before testing still assume 2 classes a week (open question in decisions).

**Next**
- Jay tests on his phone (steps in the session summary) and gives feedback.
- Milestone 5: Home Dojo basics, in a fresh session.

**Paused (Jay, 2026-10-07)**
- Milestone 4 is built and on the live link, but **paused, not signed off**. Grok bot is preparing material that should answer the open design questions (powers, numbers, black belt degrees) without back-and-forth. Come back to milestone 4 once that work arrives: compare it with `content/abilities/abilities.json`, the `PROGRESSION` / `POWER` settings and the open questions at the top of `docs/decisions.md`, then adjust.
- Jay's on-phone test of milestone 4 is still to do.
- Meanwhile: milestone 5 (Home Dojo basics), in a fresh session.

## Milestone 5 — Home Dojo basics (2026-10-07)

**Done**
- **A walk-around Home Dojo:** a small wooden room that fits the screen, the notice board (opens the Training Board, the old Home screen) and the door to the Tower.
- **The bow** when entering the dojo and at the start of each Tower floor (+15 Focus in the Tower).
- **Warm welcome cards** for the first visit and for coming back after 2+ days. Real reward moments now play in the dojo right after the bow.
- **Mess while away:** dust, leaves, scuffed mats and crooked weapons. Nothing for 4 hours, full at a week, and it stops there. It never removes anything or blocks play.
- **Cleaning:** sweep by walking over dust, tap Wipe on mats, tap Straighten at the rack, with puffs, sparkles and sounds. A full clean gives **Calm Mind** (Focus builds 20% faster for 3 Tower runs).
- **Decorating:** 11 decorations (3 starter gifts, 8 from Tower chests, the boss chest always has one). Drag to move, put away, place from the storage tray. Banners and scrolls go on the wall, and nothing can block the doorway.
- **Testing screen in the dojo** (tap "Home Dojo" 5 times): +1 day / +3 days / +1 week away, clean everything, get every decoration, start a new dojo.
- 128 automated tests pass. New tests cover: the mess curve and its cap, nothing ever removed, planned absences pausing mess, cleaning and Calm Mind, decorating rules (no blocking the door, wall items), saving and loading, boss-chest decorations, the bow's Focus, and Calm Mind's faster Focus.
- Checked on a phone-sized screen in a test browser: the bow, the first-visit card, the welcome back after a week, a messy dojo, sweeping, wiping, straightening, Calm Mind, dragging a mat, placing every decoration from storage, the testing screen, the Training Board's "◀ Dojo", and the bow at the start of a Tower floor.

**Not done / known limits**
- Watering plants, extra rooms per belt, visiting classmates, certified trophies (milestone 12) and real-life chores (after launch) aren't built.
- Planned absences pause mess in the rules, but nothing sends them until the DojoForge feed (milestone 9).
- Placeholder shapes until the art pack.

**Next**
- Copied onto `main` (the live link) with Jay's OK on 2026-10-07.
- Jay tests on his phone and gives feedback (does cleaning feel satisfying? is decorating easy? is the mess rate right?).
- Milestone 4 is still paused, waiting for Grok bot's design material.

**Jay's first test (2026-10-08)**
- It works. Fixed: the bow could be skipped by tapping elsewhere (now only the button counts, and Tower enemies wait hidden until the bow). The dojo was too zoomed out and decorations were hard to tap: the camera now zooms in and follows the character, and decorating is tap-to-pick, tap-to-place, with big arrow buttons. Copied onto `main`.
- Next: Jay re-tests decorating and the zoom on his phone.
- Jay: view much better, but moving was still clunky (a missed arrow tap moved the decoration across the room). Added a "Tap to move" or "Arrow pad" choice (asked the first time, changeable with the "Move" button); arrow mode ignores floor taps and catches near-misses. Copied onto `main`.
- Jay: the arrow pad covered the Done button. Fixed: top buttons always stay on top, and short screens get one row of big arrows. Checked at 844×390, 844×300 and 667×320. Copied onto `main`.

## Art in the game (2026-10-16)

Jay approved all four art batches from the Art Director bot. The placeholder shapes are replaced.

**Done**
- **The import step** (`tools/art-import/`): one command packs approved art from `incoming-art/` into small picture pages in `assets/art/` (about 10 MB in all).
- **The character** in the Tower, the dojo, the Training Board and the celebrations:
  - 13 moves in 8 directions, with the belt in the real rank's colours and stripes;
  - the promotion ceremony: bow, new belt tied, celebrate.
- **The four Tier 1 creatures:** moving, wind-ups with the warning glow, attacks, flinching, dizzy, winded, the boss calling for help, and the dissolve into light.
- **Tower rooms:** stone floors and walls, pillars, coloured doors with icons that open, the treasure chest's opening, and the glowing rest shrine.
- **Home Dojo:** the wooden room, all 11 decorations, scuffed mats, the crooked weapon rack, and the dust, footprints, towel and water bottle.
- 128 automated tests pass. Checked on a phone-sized screen in a test browser: walking, wind-up and attack, a treasure room's chest, a rest room, the practice room, the bow, the promotion ceremony, and a messy dojo with every decoration placed.
- Copied onto `main` (the live link) after each step, with Jay's OK.

**Not done / known limits**
- No special boss door yet (the boss uses the battle door).
- Style guide and fonts still to approve (open questions).
- Art may look slightly soft on high-end phones (see decisions).
- The menus, buttons and icons are still the simple placeholder style.

**Next**
- Jay tests on his phone (see the session summary for what to try) and gives feedback.
- Milestone 4 is still paused, waiting for the Grok bot's design material.

## Batches 5 and 6 in the game (2026-10-17)

**Done**
- The Floor Keeper's boss door, with its crown and gold glow, on the room before the boss.
- The customizable character: 2 bodies, 6 faces, 12 hair styles and the skin, hair and gi colours. It's used everywhere the character appears (Tower, dojo, Training Board, ceremony). Only the chosen look is downloaded.
- Try looks from the dojo's hidden testing screen (tap "Home Dojo" 5 times).
- 128 tests pass. Checked in a test browser: four different looks in the Tower, the promotion ceremony with body B, and the boss door.

**Next**
- The character creation screen, when Jay asks for it. Its open questions are answered: Boy/Girl bodies, numbered names for the other options.

## Character creation (2026-10-18)

**Done**
- A new student makes their character right after "Tap to start": Boy/Girl, Eyes 1–6, Hairstyle 1–12, skin, hair and gi colours. It's welcomed by their real name and belt.
- The Home Dojo's **Look** button changes it any time.
- The look is saved with the student's progress.
- 132 automated tests pass (new: the look is saved and loaded, old saves still work, a damaged look is ignored).
- Checked on 844×390 and 667×320 test screens: making a character, the dojo showing it, changing it, and Back.

**Next**
- Milestone 6 (Story and Street Smarts sample), which brings in Batch 7 (Sensei, Senpai, Kohai, the second instructor, the founder). It needs dialogue and quest drafts from the Content Writer, and Jay's approval of one Street Smarts script.

## Work-board item K1: docs check-up (2026-10-23)

**Done**
- Checked the game's belt list, kata names and requirement counts against `docs/curriculum.md`. The differences are listed for Jay in the K1 pull request; nothing was changed.
- Recorded Jay's work-board decisions in `docs/decisions.md`.
- `docs/GROK_BOTS.md`: the QA bot is active. Systems design (S1–S8) and the milestone 4 recommendations go to Dojo-Ascent Researcher & Planner (no sixth bot).
- Every "Claude Code" mention in `docs/` now says Dojo-Ascent Programmer.
- Sensei's Lessons: built in milestone 7, finished in milestone 10.
- Added Jay's self-defense #31–35 and kick combos 1–7, in his words. No game code changed.

**Next**
- Jay reviews the K1 pull request and answers its DECIDE list (including the term "party flex" in #33).
- Self-defense #36–45, kick combos 8–12 and the kata descriptions are still to come from Jay.

## J6: black belt time to 2nd degree (2026-10-23)

**Done**
- The three test profiles now give Black Belt 24 months (2 years) before 2nd degree, as Jay decided. Brown/Black stays at 12 months.
- The black belt tier's levels now take twice as much experience as brown/black's.
- New test checks this. 133 tests pass and the game builds.

**Next**
- Nic's DojoForge data needs the same 24-month value for black belt.

## G1: guided first Counter (2026-10-23)

**Done**
- New players get Sensei's guided first Counter (Learning proposal 6). On the first warning the game slows down. Once the circle is nearly full, it holds still with Counter pulsing until the player taps it, and that tap is always a Perfect Counter. On the next two warnings the help fades. It runs once per profile.
- Sensei's lines come from `content/tutorial/sensei-lessons.json`, copied word for word from the draft.
- 6 new tests. 140 pass (1 balance report skipped) and the game builds.
- The balance player has a new "masher" style that never Counters, for QA's never-Counters players.
- Checked on an 844×390 test screen: the game holds still, tapping Counter gives "PERFECT!" and "You did it! Perfect!", and the step is saved.

- Gentle nudge: after 5 seconds of holding still, Sensei shows a kind hint and Counter pulses more strongly. It repeats calmly and never ends the hold. The guide also runs in the practice room.

**Next**
- The Content Designer approves or replaces the nudge line.
- The guide teaches the Counter, but it does not win runs for someone who still never Counters afterward: the masher's win rate stays at 0%. The lessons that come after the guide (7–10, run 2 on) are the next step.
## S1 change 1: enemy mixes (2026-10-23)

**Done**
- Five new battle rooms that each ask one clear question (brute + swarmers, shield + swarmers, two shields). The harder ones only show up later in a floor.
- A new test plays 5 runs and checks they show at least 4 different enemy mixes (they show 2 without the new rooms).
- Novice win rate on Standard went from 35% to 41%, so no drop. 135 tests pass and the game builds.

**Next**
- Jay plays a few floors and says whether the mixes feel different. S1 change 2 (Perfect Counter chain) is in its own pull request.

## S1 change 2: Perfect Counter chain (2026-10-23)

**Done**
- Perfect Counters in a row give +25, +30, +35, then +40 Focus. A Hit ends the chain and a Block keeps it.
- The screen shows "PERFECT x2", "PERFECT x3"... with a brighter glow as the chain grows.
- New tests check the Focus steps, the Hit reset, the Block keeping the chain, and the Focus limit.
- The balance report now shows Strikes per fight room. They went from about 14 to about 16 per room (11–18% more; the limit was 20%).
- 137 tests pass and the game builds.

**Next**
- Jay tries a x3 chain on the preview and says whether it feels rewarding.

## S1 change 4: room twists (2026-10-23)

**Done**
- About 1 room in 4 now has a twist: Lantern Dark, Slippery Floor or Bell Room. Each one shows a banner, an icon and one Sensei line.
- New tests check how often twists come, that every warning still shows, that Dash goes farther on the slippery floor, and that the 3rd bell gives a bonus prize.
- 143 tests pass (1 skipped) and the game builds.

**Next**
- Jay plays a few runs on his phone and says whether the twists feel fun.

## K5: room twists follow-up (2026-10-23)

**Done**
- Main (with G1) is merged into the twists PR, and both work: room 1 never has a twist, so the guide stays calm.
- Slippery Floor no longer comes in the first 3 rooms of a floor. A new test checks it.
- The twist lines and the G1 nudge line are now the Content Designer's final text.
- 151 tests pass (1 skipped) and the game builds.

**Next**
- Jay plays a few runs on his phone.

## K6: twist banner fix and test link (2026-10-23)

**Done**
- The twist banner no longer covers the room name or the time goal. The banner sits at the top, and the room name and goal now show just below it. The small twist icon moved to the top right, under the timer.
- New test link: `?twist=lantern-dark`, `?twist=slippery-floor` or `?twist=bell-room` forces that twist in the next room that can have it. Slippery Floor still waits until room 4. A new test checks this.
- Checked with screenshots at 667x375, 844x390 and 932x430.
- 152 tests pass (1 skipped) and the game builds.

**Next**
- Jay opens each `?twist=` link on his phone and checks the banner is easy to read.

## K7: new art in the game (2026-10-24)

**Done**
- **Yellow belt Tower kit (Sunrise Garden).** Yellow belt students (belt tier 2) and above now see the new floor, walls, pillars, doors, chest and shrine in the Tower. White belts still see the Tier 1 look. Test link: `?tower=t2` (or `?tower=t1`). The new lantern, bamboo pot and basin decorations are packed but not placed yet.
- **Batch 8 icons.** All 28 icons show next to their names: on the "Choose an Insight" cards, on worn gear and bag items, and on the Technique Seals in the Abilities list. Each matches an existing id, so no content changed. Icons are kept at full size (128 px) so they stay sharp in menus.
- **Elite auras (art only).** The gold Swift and blue Guarding auras are packed for all 4 Tier 1 creatures and drawn back layer, creature, front layer, with nothing above the head. Elites don't exist in the game yet (S1 #3), so the auras only show with the test link `?aura=swift` or `?aura=guarding`, which puts that aura on every enemy and changes no rules.
- Checked with screenshots at 667x375 and 844x390.
- 152 tests pass (1 skipped) and the game builds.

**Next**
- S1 #3: elite rules (who becomes elite, Swift and Guarding effects), using these auras.
- Place the optional Sunrise Garden decorations in Tier 2 rooms.

## S1 #3: elites (2026-10-24)

**Done**
- **Elites from the 4th belt (green) up.** From room 3 on, a battle room has a 20% chance of an elite and a challenge room 35%. There can be 1 per room and 2 per floor. First the kind is rolled (Swift 60%, Guarding 40%). Then a random brute, swarmer or shield is picked from the whole room, later waves included. The boss and its summons are never picked.
- **Swift (gold aura):** 1.25x health, 1.25x speed, recovers faster. On Standard its wind-up is 0.8x (never under 10 ticks). Guided and Challenge keep the normal wind-up.
- **Guarding (blue aura):** only a brute or shield gets it. It has 1.25x health and protects the 2 closest enemies within 3 tiles, which take 0.67x damage. A blue line joins them. Perfect Counter and Strike-breaks-shield still work. There is no Guarding on Guided or on the first floor of a new belt; it becomes Swift instead.
- **Reward:** beating an elite gives +15 Focus (max 100) and a 50% chance of one extra decoration. No gear.
- All the numbers are in `content/elites/elites.json`.
- New 4th-belt test profile: `fixtures/4-green-belt.json`.
- Test link: `?elite=swift` or `?elite=guarding` puts that elite in the first fight room. It skips the normal rules.
- 171 tests pass (1 skipped) and the game builds.

**Next**
- Jay decides whether the typical player's win rate is OK: it drops from 100% to 93% at the 4th belt, more than the 5-point target.
- Tether art and a "snap" effect when a guard falls (now plain lines).
## K7-fix: QA fixes and new Insight icons (2026-10-24)

**Done**
- On a 667-wide phone, gear names and stats (worn and in the bag) and the Abilities rows now stay on one line. The text shrinks a little, then ends with "…" if it still doesn't fit. Narrow cards use a slightly smaller icon.
- When the Floor Keeper is up, Sensei's banner sits just under the boss bar and its name, so both can be read.
- Door labels never go under the top bar (health, Focus, "Room 1 of 8").
- The 9 new Insight icons from PR #56 are in the game. Each Insight card's border uses its icon's own colour.
- Removed a `node_modules` shortcut that K7 committed by mistake.
- Checked with screenshots at 667x375 and 844x390. 152 tests pass (1 skipped) and the game builds.

**Next**
- Jay checks the Gear and Abilities tabs on a small phone.

## K2: Street Smarts sample, "Separated in a store" (2026-10-24)

**Done**
- The Street Smarts scene from the approved script (PR #58, J11). The script is copied into `content/street-smarts/store-separated.json`, and the screen text is in `content/street-smarts/ui.json`. None of the words are in code.
- The rules package walks the script: Next, choices, gentle retries and stars (`packages/sim/src/streetSmarts.ts`). A choice that isn't the best one never shows danger. Sensei asks a question and the same choice comes back.
- Stars: the best answer on the first try earns 1 star each at "stay", "helper" and "offer", for 3 in all. Telling the worker what's wrong has to happen to go on, but it earns no star. The best score is saved. Street Smarts power stays at 0.
- The first time, the player picks Mom or Dad. The game remembers the pick, and the story says "{player}" and "Mom" or "Dad".
- The phone's built-in voice reads each line and its choices aloud. It's on by default for this 6–9 scenario, and the player can switch it off.
- How to open it: a "Street Smarts" button in the Home Dojo from the 2nd belt on, or the test link `?street=store-separated` at any belt.
- Choices are 2–4 buttons (CLAUDE.md). The helper question uses the trimmed 4-choice script (#79, wired in K2-trim).
- The picture is placeholder art for now: a drawn store aisle with a coloured circle for whoever is talking.
- 14 new tests. 185 tests pass (1 skipped), typecheck is clean and the game builds. Checked with screenshots at 667x375 and 844x390.

**Next**
- Street Smarts art (the store, the worker, Sensei, the reunion).
- Jay plays it on his phone with the sound on.

## K9: elites QA fixes (2026-10-24)
- The difficulty setting now reaches elites. The profile has a `difficulty` field, and `runDifficulty()` picks it (the `?difficulty=` test link wins, then the profile, then the default). The run and the room both use it, so a Guided player never meets a Guarding elite. A sim test walks 1,000 tier-4 Guided floors and finds none.
- No more ghost Guarding line on an empty floor: the tether is now hidden from the screen camera.
- The +15 Focus reward pops in bigger above the player and stays on screen about 1 second.
- The boss bar and name moved to the top strip, between the player's bars and the room label, so they no longer cover the Keeper.
- The testing screen says "four points in time" (it counts the profiles).
- The welcome card shows "35 techniques unlocked!", 4 examples and "…and 31 more" instead of a cramped 2-column list.
- Create screen: Eyes and Hairstyle show a row of dots (the chosen one gold) instead of "Eyes 3"; colour swatches have a light rim. Boy/Girl unchanged.
- 187 tests pass (1 skipped), typecheck clean, build passes. Screenshots at 667x375 and 844x390.

**Next**
- M7-P1 (the difficulty choice) only has to set `profile.difficulty`.

## M7-N1: named monsters, small version (2026-10-24)
- Three named monsters from the PR #47 spec: Old Thumper (brute), Zippy Zoom (swarmer) and Captain Clank (shield). Numbers and lines live in `content/named/named.json`; the sim reads them in `packages/sim/src/named.ts`.
- From the yellow belt (tier 2), after the first 3 runs, each Tower run has a 5% chance of one named monster. It shows up in a battle room from room 3 on, replacing one normal enemy of its type in that type's first wave. It has 1.5× Health and nothing else changes. That room gets no elite.
- On screen: a name plate under its feet for 3 s, then a small name tag above its head. Its tell from PR #60 plays during the windup: stamp dust (two beats, with a 2 px camera shake that is off when the phone asks for reduced motion), shield taps with a clank, or the dash trail. Art is the PR #53 pack, imported through approved.json.
- First meeting: Sensei greets it and the Monster Journal remembers it. First win: a cosmetic sticker for the Home Dojo wall. No counts, no buying.
- Home Dojo: a "Journal" button from the yellow belt opens the journal page (met cards show the name, fact and stamp; unmet cards say "Keep exploring!").
- Test link: `?named=old-thumper` (or `zippy-zoom`, `captain-clank`), optionally with `&room=`.
- Balance: over 20,000 tier-2 runs the roll hit 5.16% and a named monster actually appeared in 4.79% (a few rolls find no room with its type). Old Thumper 269, Captain Clank 330, Zippy Zoom 358. The 1,000-seed test sees 4.2%.
- 9 new tests. 196 tests pass (1 skipped), typecheck clean, build passes. Screenshots at 667x375 and 844x390.

**Next**
- Jay plays a yellow-belt run with `?named=` on his phone.
- Named monsters for later belts (the spec's bigger version).

## K10: K9 retest fixes (2026-10-24)
- From the K9 retest (PR #101). While a boss bar shows, the COMBO count (and its +% power line) moves under the player's bars on the left, clear of the boss bar and its name.
- Sensei's banner is placed every frame: under the boss bar when a boss is up, and pushed below any door label it would cover (e.g. HOME in the Keeper's room). This finishes the K7-fix and K9 banner work.
- The `?elite=guarding` test link now respects Guided: it gives a Swift elite instead.
- The store script's notes say "approved through J11, helper question trimmed to 4 choices (#79)" again, not the old DRAFT note.
- 197 tests pass (1 skipped), typecheck clean, build passes. Screenshots at 667x375 and 844x390.

### K10 follow-up (Manager review)
- Journal fact text is now 15px on screen (game body size) at 667x375 and 844x390: facts sit in notes beside the page. Screenshots: /workspace/k10-journal-667.png, /workspace/k10-journal-844.png.
- The Old Thumper fact no longer sits on the stamp art.
- `?named=` (and other test-link) runs no longer write the Monster Journal or give the sticker. New test in packages/sim/test/named.test.ts; checked in the browser too (journal stayed empty).
- 198 tests pass, 1 skipped; typecheck and build clean.

## K12: Q3 named-monster fixes (2026-10-24)
- From the Q3 QA report (drafts/qa/2026-10-24-q3-named-monsters.md).
- Sensei's banner wraps long lines and uses 20px text on screens under 720px wide, so the "freed" line fits at 667x375. The gold "Decoration: … Sticker" label moves under the banner whenever it would sit on it, every frame.
- `?named=X` without `&room=` always gives X: from room 3, test runs pick battle (or challenge) rooms that have X's type, and X can be in a challenge room on a test run only. Checked on 200 seeds for each monster.
- Equal mix: a rolled named monster no longer swaps to "another monster whose type is in the room". It waits for the first battle room from room 3 that has its type. Over 6,000 floors each monster is about 1/3. The overall rate at tier 2 drops a little (3.9% on the 1,000-seed test).
- The first named monster a student ever meets also gets Sensei's journal intro ("You met a named monster! I've started your Monster Journal.") before its greeting.
- Name plates move above the head if another creature or the player is under its feet. Near the top of the screen (under the HUD), the head tag moves under the feet. Both hide once it's beaten.
- Reduced motion: a "Reduced motion: On/Off" switch on the Title screen (bottom right). It saves on this device and starts On if the phone asks for reduced motion. When on, it turns off screen shake (hits and the stamp), named sparkles, the dash trail, the white hit flash, screen flashes, the golden "set free" flash and stars, the Dojo sparkles and the Title pulse. Text is in content/settings/motion.json.
- Character creator: dark swatches get a thicker, solid light rim (A7).
- 200 tests pass (1 skipped), typecheck and build clean. Screenshots: /workspace/k12-{667,844}-{title-motion-on,title-motion-off,swatches,intro-plate,freed}.png.
- **2026-10-24 (K12, #119):** named monsters are rarer: chancePerRun 0.0333, about 1 in 30 eligible runs, measured at 2.8%. The frequency test band is now 0.02–0.045.
- **2026-10-24 (K12, #119):** main merged in (#111). Bopper art imported as `enemy-bopper`, viewable with `?skin=bopper`. Screenshots: /workspace/k12-{667,844}-bopper-2.png.

## K11 / M7-P1: Guided by default for young and new players (2026-10-24)
- A new profile (no runs yet) starts on **Guided** if the student's age band tops out at 9 or under, or they're a white belt with 0 sign-offs. Everyone else starts on **Standard** (the default). The rules are in `content/settings/difficulty.json`.
- `profile.difficulty` now always gets a real value. It is set the first time the Home Dojo opens or a Tower run starts (`settleDifficulty`). It is never changed again after the player picks one: `difficultyChosenByPlayer` is saved when they do.
- New **Settings** button in the Home Dojo. It opens the difficulty choice screen: Guided / **Steady** (the kid-facing name for Standard) / Challenge.
- While a player is on an automatic Guided, the Home Dojo shows "You're on Guided. Change anytime in Settings."
- `TrainingState` now has `ageBand` from the feed.
- New tests in `packages/sim/test/difficulty.test.ts`. In the browser: the new white belt starts on Guided; tapping Steady sticks after a reload; the green belt starts on Standard. 204 tests pass, 1 skipped.

## K11 / M7-P9 — Play-time limit (grown-up setting)

- Settings → "For grown-ups" (press and hold 2 s) → Play-time limit: Off / 15 / 30 / 45 / 60 min. Default Off. Saved as `profile.playLimitMinutes`.
- When time is up, Sensei says "Nice work! Let's finish this room, then rest." The current room plays out; at the door the run ends as `rested` with a "Great training today!" card, and everything found is kept (normal finishRun). No timer or countdown is shown to the child.
- A session is time played with no break of 30+ min (content/settings/play-time.json `sessionBreakMinutes`); the clock is in localStorage `dojo-ascent-play-clock` and counts time in the dojo and the tower.
- Test link: `?playlimit=N` overrides the setting with N minutes.
- Tests: run.test.ts "play-time limit (M7-P9)". Screenshots: k11-p9-{667,844}-{wrapup,rest,home,settings,playlimit}.png.

## K11 / M7-P11 — Fix open notes

I checked every "Next" and "Not done / known limits" note. Only one is a bug: **a run in progress isn't saved if the app is closed.** The rest are playtests for Jay, later milestones, art, or open decisions.

- **Fixed:** the Tower run is saved to localStorage (`dojo-ascent-run-in-progress`) at the start of every room. It's cleared as soon as the run ends and is banked.
- **Next time the Home Dojo opens** (after the bow and welcome cards), a card says "Your climb is waiting! Room X of Y." **Keep climbing** restarts that room with the same insights, health, loot and floor. **Rest for now** banks the run like a play-time rest, so nothing found is lost.
- A save from a room that no longer exists in the content, or a broken save, is dropped quietly.
- **Limit:** you replay the room you were in. Anything picked up in that room before the app closed isn't kept, because the save is taken at the room's start.
- **Tests:** `packages/sim/test/runSave.test.ts`. Screenshots: `k11-p11-{667,844}-{resume,resumed,rested}.png`.

- **2026-10-24 (K11 update, #108):** P1 reworked per Manager + Learning Designer: everyone starts on Standard, kind Guided offer after 2 losses on one floor (max once a day, never automatic), one-time home line, "The usual pace", 6-9 fixture. Screens: /workspace/k11-p1-{667,844}-{home-line,home-again,settings,offer,after-offer}.png.

- **2026-10-24 (K11 update, #110):** P9 reworked: daily play time (resets at local midnight), math-question grown-up gate, Tower door rests when time is up. Merged origin/main and the updated #108. Screens: /workspace/k11-p9-{667,844}-{wrapup,rest,home,door-resting,settings,gate,playlimit}.png.

- **2026-10-24 (K11 update, #113):** merged origin/main and the updated #110 (which has #108). `bankRun` now also records the floor result for the Guided offer. The Manager accepted losing a room's pickups on resume (decisions.md). Screens re-taken: /workspace/k11-p11-{667,844}-{resume,resumed,rested}.png.
- **2026-10-24 (C9 wording, #108):** Content Designer wording (PR #115) applied to content/settings/difficulty.json. The Guided offer now uses the #114 wording ("Want more time to COUNTER?", "Try it" / "No thanks"), which settles the Guided/Steady question. The ✓ on the picked difficulty is confirmed. Menu buttons are in normal case; only fight buttons are in caps.
- **2026-10-24 (C9 wording, #110):** merged P1's C9 update. play-time.json wrap-up, rest and help lines follow C9. The rest card shows all 3 lines.
- **2026-10-24 (C9 wording, #113):** merged P9's C9 update; run-resume line per C9.

## K12b (2026-10-24)
- Merged origin/main. Reduced motion now in Settings. Bopper added as data-driven enemy, Yellow belt+, with disarmed push. Tests 218 passed / 1 skipped; typecheck + build clean. Screenshots k12b-*.png.

## Decor Tier 1 import (2026-10-24)
- 27 Tier 1 decorations imported and drawn in the dojo (tinted pieces use belt colour / tan on White). mustTouchWall rule + test. Testing screen has "Try the new decorations". Tests 220 passed / 1 skipped; typecheck + build clean. Screenshots /workspace/decor1-{667,844}-{white,yellow}-{left,right}.png. Next: earning PR.

## Decor earning (2026-10-24)
- New `packages/sim/src/earning.ts`: class pieces at the dojo (welcome piece, then every 2/3 classes), Journal trophies, keeper statues, folding screen. Surprise pool (tower + random) at S7 rates with 3-copy cap and colour roll. Pieces remember their drop belt. Test runs award nothing (bankRun leak fixed). C11 names. Tests 239 passed / 1 skipped (key rules checked to fail when removed); typecheck + build clean. Screenshots /workspace/earn-{667,844}-{card0,card1,dojo-left,dojo-right}.png.

## Journal kinds (2026-10-24)
- The Monster Journal now has pages for the monster kinds, with ‹ › page-turn buttons. Tests 240 passed / 1 skipped; typecheck and build pass. Screenshots: /workspace/jkinds-{667,844}-p{0,1,2}.png.
- Merged main (#134). Met cards now show the plain enemy name (`shortName` in enemy content). Tests 240 passed / 1 skipped; typecheck and build pass. Screenshots: /workspace/jkinds2-{667,844}-p{1,2}.png. A8 silhouettes for Floor Keeper and Bopper are pending.

## Rest refresh (2026-10-24)
- Fixed: pieces banked by "Rest for now" in the dojo now show at once. Tests 239 passed / 1 skipped; typecheck and build pass. Screenshots: /workspace/rest-{before,after}-{667,844}-storage.png (before: 1 stored, after: 4).

## K14 Journal silhouettes + Form idles (2026-10-24)
- A8 (#136) silhouettes imported into the named-monster pack. Unmet Journal cards for Floor Keeper and Bopper now show journal-silhouette-keeper / journal-silhouette-padded instead of '?' (each trophy names its `silhouette` in decorations.json).
- A2 (#121) stance idles merged into every player-a/b rig (Rooted = option A). Each Form idles in its own stance; the Beginner's Stance keeps the guard idle. Tests 242 passed / 1 skipped; typecheck and build pass. Screenshots: /workspace/k14-{667,844}-journal-keeper-bopper.png, /workspace/k14-{667,844}-idle-{beginners-stance,rooted-form,flowing-form}[-zoom].png, /workspace/k14-{667,844}-idles-strip.png.
## M7-P2 tutorial floor (2026-10-24)
- Brand-new profiles go from Create straight into a 3-room tutorial floor: bow, walk to the glowing spot, guided Brute Counter, automatic Insight, a chest (always Uncommon or better), then an easy Floor Keeper where Strike is taught when Focus fills. Can't lose (health floor of 1).
- Timed browser check: first Perfect Counter about 40 s after "Tap to start" at both 667 and 844 wide (including 15 s idling on Create). Sim: under 60 s over 20 seeds.
- Tests 250 passed / 1 skipped; typecheck and build pass. Screenshots /workspace/p2-{667,844}-*.png.
- Follow-up: the combo HUD is hidden until the guided Counter, and the tutorial Brute starts low so the Sensei banner no longer covers it.

## K16 Kid-facing rarity names (2026-10-24)
- C7 names (PR #92) now shown everywhere a rarity appears: Everyday, Special, Rare, Epic, Legendary. Names live in `content/loot/gear.json` (`rarityNames`), checked at load; the `RARITY_NAME` strings in theme.ts are gone. Internal ids unchanged. Screens: Training Board last run, Gear details, in-run loot popup. Tests 253 passed / 1 skipped; typecheck and build pass. Screenshots: /workspace/k16-{667,844}-{home-run,home-gear,loot}.png.

## K17 / M7-P5 Sensei's Lessons and the Lesson Scroll (2026-10-24)
- New lessons now come one per session (a calendar day with a run) and one per room; Perfect, Block and Step-out ignore the session limit. Each lesson has a triggerKey fired from play (Dash, Insights, Decorating, Perfect, Block, Step-out).
- Sensei's Scroll in the Home Dojo lists every lesson seen (not the fading follow-ups or the welcome line); tap to replay, plus "Replay the tutorial floor".
- Tests 261 passed / 1 skipped (new packages/sim/test/lessons.test.ts: two sessions in a row give one new lesson each, never two; every seen lesson is on the Scroll and replays). Typecheck and build pass. Screenshots /workspace/k17-{667,844}-{dojo,scroll,replay,replay2}.png.

## K18 / M7-P4 Unlock cascade on the first return home (2026-10-24)
- First return home: Sensei's welcome line, then "You've already earned these in the dojo.", then each sign-off in the order earned, then each stripe. A brand-new white belt sees the Beginner's Stance and what the first sign-off unlocks. Nothing plays twice.
- New packages/sim/test/cascade.test.ts runs over all 5 fake profiles. Screenshots /workspace/k18-{667,844}-*.png.

## K20 / M7-P10 Three next goals (2026-10-24)
- After a run, Home shows "Your next goals" once a day: one in the Tower, one to collect, one in the real dojo (e.g. "Get Self-Defense #2 signed off to unlock Technique Seal: Escape Step."). Shows after the celebrations; tap to close.
- New `packages/sim/src/goals.ts`. Tests 272 passed / 1 skipped (new packages/sim/test/goals.test.ts: all 5 fixtures get exactly 3 goals and the real-world one names the Path's next technique; no-next-technique line; once per day survives save/load). Typecheck and build pass. Screenshots /workspace/k20-{667,844}-{p2-1..3,p4-1..3,p4-sameday}.png.

## K19 / M7-P7 Gradual unlock schedule and Welcome Week (2026-10-24)
- Existing students (any sign-off, or a belt above white) get every earned ability on day 1, and meet the dojo's systems one per day (Street Smarts, Journal, Scroll) through a short Sensei card. This shares the one-new-thing-a-day budget with Sensei's Lessons. New students are unchanged.
- The testing screen's "+1 day away" now moves the session day forward too (a dev-only day offset).
- New `packages/sim/src/unlocks.ts` and `content/settings/unlock-schedule.json`. Tests: 271 passed / 1 skipped (new unlocks.test.ts covers the fixtures, the yellow belt day by day, gaps, the shared budget, old saves and kind wording). Typecheck and build pass. Screenshots: /workspace/k19-{667,844}-{day1..3-sensei,day1..4-dojo,testing}.png.

## K22 / M7-P13 Learning Designer fixes (2026-10-24)
- The goals card now starts at session 2. In session 1 the first return home shows only the welcome line and the cascade. Kid text fixes: "glowing COUNTER" (no colour-only pointer), "until you go home", fight-button capitals (COUNTER/STRIKE/DASH), "Show Sensei {X} in class", and "You're ready for your next belt test!". Every change is listed in decisions.md.
- Tests 285 passed / 1 skipped (new goals test: session 1 never shows the card; session 2 does, once). Typecheck and build pass. Screenshots at 667×375: /workspace/k22-*.png.

## K22b Locked-card wording and wrapping Abilities cards (2026-10-24)
- Locked ability cards say "Show Sensei {X} in class to unlock" (same template as the goals card). Abilities descriptions wrap instead of being cut off. Tests 285 passed / 1 skipped; typecheck and build pass. Screenshots /workspace/k22b-{667,844}-abilities*.png.

## K23 / M7-P12 playtest fixes (2026-10-24)
- First floor ends with a simple card (grade, one reward, Continue); Sensei comes after. Chest icon replaces '$'. Title/Create/Guided/Street Smarts lines are one short sentence each, in content data (new content/settings/screens.json). Room-clear health number dropped. Sensei banner keeps off doors at 667. Combo clears when the fight ends. Named monster plate and freed line checked by hand. Every change is listed in decisions.md.
- Tests 285 passed / 1 skipped; typecheck and build pass. Screenshots /workspace/k23-*.png at 667 and 844.

## K23b Banner layout fixes (2026-10-24)
- Sensei's banner now keeps off the floor chest and the "Ouch! The run is over" message, as well as doors (one list of boxes in placeSensei). K23's four lines are approved.
- Screenshots /workspace/k23b-*.png at 667 and 844.

## S3-P1 Kata cards + Keon spelling (2026-10-24)
- "Keon" replaces "Key On" everywhere students see it (Jay's call via the Manager). Ids unchanged, so saves load as before.
- Earned katas get a card on the Abilities tab: name, step count and direction arrows (no arrow where the direction is still open). Data in content/katas/. New test file katas.test.ts (4 tests). Screenshots /workspace/s3p1-*.png at 667 and 844.
## K23c Ability pop-up placement (2026-10-24)
- The Insight name pop-up after room 1 no longer covers the treasure door, Sensei's banner or the "Room clear!" line (same protected boxes as the banner). Screenshots /workspace/k23b-c-*.png at 667 and 844.

## M7-P8 Music and Sound controls (2026-10-24)
- Music player (apps/client/src/audio/Music.ts) and the screen-to-track map (content/settings/audio.json). It fades between tracks, starts after the first touch, pauses in the background and stays silent if a file is missing.
- Music and Sound − / + controls (0–5) in Settings, saved as dojo.musicVol / dojo.sfxVol. Sfx no longer uses a fixed 0.5.
- Checked in the preview: with the files missing, nothing breaks and there are no page errors. With stand-in tones at the expected paths, the Dojo plays the temple loop and the Tower switches to the road loop. Volumes survive a reload. Screenshots: /workspace/m7p8-{667,844}-settings.png.
- Music added in assets/audio/music/: mountain-temple-loop.ogg (The Great Hall I, 2.96 MB), long-road-loop.ogg (The Grass Road I, 4.42 MB) and both WAFU licence texts. Not re-encoded. Downloaded by the Programmer through the box browser from WAFU's free itch.io pages.
- Checked in the preview with the real files: Dojo, Home and Street Smarts play the temple loop (132.5 s) and the Tower plays the road loop (201.3 s), with no page errors. The build's dist/audio is 7.1 MB.

## K24a Tutorial tips wait for the player
- Tutorial tips come from content/tutorial/tutorial-floor.json (moved from drafts/). Each waits for Got it, then for the player to try the move. No timers.
- See-through tip box (65%) with outlined text, kept off the action.
- New waves: 3 Swarmers plus a Brute, a small Swarmer group, Swarmers from two sides. DASH pulses on the dash tip.
- Session 2: lesson-dash is a short reminder.
- Sim: enemyHold/waveHold/releaseWave plus the tutorial flow API, with 7 new tests (step flow, health floor at 1).

- K24c: tower view 6.75 tiles tall; game draws at full retina sharpness (DPR camera zoom + view() helper). Screens: /workspace/qa/k24c/ (sharp-844.png is before/after).
- K24b: wind-up "!" + fill ring before enemy attacks; COUNTER flashes/rings gold in the counter window; Reduced motion respected. Screens: /workspace/qa/k24b/.

## S3-P1b Kata cards
- Bigger drawn kata arrows (same height as the step numbers) and a Kata group at the top of Abilities. Screens: /workspace/qa/s3p1b/final/.

## R-BAL-9c Live enemy numbers
- Swarmer, Shield, Brute and Floor-keeper set to the #188 numbers; all in band on Standard and Challenge (drafts/planning/r-bal-9c-check.py). D1–D5 logged as Jay's calls.

## R-BAL-4 Bad-luck counter test
- New test locks `guaranteedRareOnRun` at 5 or lower. Checked it fails when set to 6.
## R-BAL-5 XP step weights (k+11)
- Done: progression.ts uses weights step+11. Matches balance-sim.py section 3; no step goes over 10 runs.
## K25 Slower tempo and calmer shake
- Game runs about 12% slower (one `TEMPO.speed` value); wind-ups and counter windows are longer in real time, never shorter.
- No screen shake on the player's own attacks. The being-hit shake only happens at Brown belt and up or on Challenge, at 65% strength, and never with Reduced motion.
- New tests: packages/sim/test/k25-tempo-shake.test.ts (6). Preview playthroughs at 667 and 844: /workspace/qa/k25/.

## K25b Block never shakes
- Done: Block gives 0 shake; being hit is unchanged. Test added.

## R-BAL-9b Per-tier gear caps
- Done: 10-tier GEAR_CAPS, white cut, Jade capped. Test: r-bal-9b-gear-caps.test.ts.
