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

## R-BAL-12 Training powers combat
- Done: training stats, stripesByBelt migration (never lowers), per-belt enemy scale. UI words (12d) are still open.
- Enemy scale retuned (Manager option B): live enemies are in the #188 bands at all 10 belts for all three model students; Bopper base is now 66/11. Test: r-bal-12-bands.test.ts.

## K28 K25 feel fixes (QA B1–B4)
- Done: the wind-up sound and the "two attacks at once" warning timer use real time (realMsPerTick). Challenge timers are 60 real seconds. The shake rule checks belt rank (tier 8 = Brown and up), not the id 'brown'. Named-monster wind-up shakes (Brute stamp) follow the same rule. Test: k28-real-time-rank.test.ts.
## K27 — tutorial fixes from Q5 (2026-10-24)
**Done**
- Q5 B1–B6 fixed: boss "!" clear of the boss bar, boss tip closes on Got it and keeps off the boss; chest tip only in the vault; tip box keeps off HOME, the hero and STRIKE; COUNTER is never dimmed with a gold ring; new closing line (Manager's call).
- Checked at 667x375 and 844x390 with Reduced motion on and off (headless browser, full tutorial run).
**Next**
- Tester re-checks Q5.
- Retest fix (Manager's call after the K27 retest): the boss "!" is drawn at full strength (opaque disc, solid colors) above the boss, or beside it when the boss bar leaves no room above, and never over a door label or the boss bar. Tutorial tips avoid the cue where it actually sits.

## K29 — end-of-run clock in real seconds (2026-10-25)
**Done**
- Room-clear line, Last run time and Fastest floor show real seconds (`realClock`, same conversion as the Challenge timer). Par times and grades stay in game time.
- Test: packages/sim/test/k29-real-clock.test.ts.
**Next**
- None; the shake rank mapping for other dojos is noted in decisions.md.

## K30 — HOME label clear of the boss (2026-10-25)
**Done**
- Door labels slide aside when they would overlap the boss's head, health bar or name (`keepLabelOffBoss`).
- Checked at 667x375 and 844x390 with Reduced motion off and on (/workspace/k30-shots/).
**Next**
- Tester re-check of the boss room.

## K31 — boss name and small bar never touch (2026-10-25)

- Added `bossTagLayout` + `BOSS_TAG` in sim, wired in GameScene (`placeBossTag`), cue avoids the pair. Test: packages/sim/test/k31-boss-tag.test.ts. Shots in /workspace/k31-shots/ (`*-top-*` frames teleport the boss to the top wall).

## K31 QA fixes (2026-10-25)

- One x for the name + bar pair (edge clamp, HOME slide together); below spot avoids COMBO and "+N% power". Re-ran the Tester's /workspace/qa/k31/run/tag.mjs against this build.
- 2026-10-25: K31 last fix: '!' cue no longer falls back onto the sliding name + bar; 8 px padding removed. tag.mjs 0 bad spots at 667 (RM off/on) and 844 (RM off/on).

## K32 gear icons (2026-10-25)

- Imported the 15 #212 gear icons to assets/art/gear-drop/ and wired them into the Gear screen, results, first-floor card and loot note. Test: packages/sim/test/gear-icons.test.ts (every GEAR_SLOTS x RARITIES has a file; checked that it fails when one is missing). Shots and overlap/clip reports in /workspace/k32-shots/ (667x375 and 844x390, reduced motion off/on).


## R-BAL-12d Gain words after real training
- Sign-off card, multi sign-off list and Character Stripe screen now show what real training gave, in green/gold: "You got stronger! +1 Power, +4 Health", "You got tougher! +7 Guard". Gains only, no nag, no streaks, nothing about what's missing.
- Words in content/settings/training-gains.json (for Jay's review). Sim helpers signOffGain / stripeGain / gainText use each piece's own belt. New test r-bal-12d-gain-words.test.ts (4). Screens at 667 and 844: /workspace/qa/r-bal-12d/.
- Delivery Note: depends on #208 (R-BAL-12); PR base is bot-code/R-BAL-12.

## R-BAL-12e disarmedPower scaled
- Done (stacked on #208).


## K26 Sign-off list columns never collide
- Several-sign-offs screen: each column now has a fixed width and long names wrap inside it, so no name runs into the other column. If the list is too tall it steps 14 → 13 → 12 px (no smaller); if it still doesn't fit it shows what fits plus "…and N more! See them all on the Board."
- Checked by script at 667×375 and 844×390 with the yellow (13) and green (24) profiles, which include the longest real names ("Self-Defense #7: Technique Seal: Create Distance", "#10 … Follow Through"): zero overlapping boxes, nothing off-screen. Screens: /workspace/qa/k26/.
- Delivery Note: same layout as #213, so cut from bot-code/R-BAL-12d and based on it (depends on #213 → #208).

## P-MENU-a shared button + motion tokens
- Training Board buttons now use one shared rounded button: press down (0.96, brighter, soft tap), spring back, act on finger-up, cancel on slide-off, 44 x 44 tap area at least.
- Blessing glow is a slow breath (2400 ms, alpha 0.25 to 0.15, no scale), still with Reduced motion on.
- Vitest checks the 44 x 44 rule for every HomeScene button. Screenshots at 667x375 and 844x390, Reduced motion off and on: no tap-area, button or label overlaps.
- P-MENU-a QA follow-up: the Blessing glow alpha you see now really breathes 0.25 to 0.15. The summary card's Continue is the shared 44-tall button. Checked at 667x375 and 844x390.

## B-WRAP Capacitor 8 wrap
- apps/client now has capacitor.config.ts (PLACEHOLDER app id `com.placeholder.dojoascent`, "Dojo Ascent"), plus the generated android/ and ios/ projects. Landscape lock, full screen, and the game loop, music and sound effects pause in the background.
- To make a debug APK: in apps/client, run `npm run build`, then `npx cap sync android`, then `cd android && ./gradlew assembleDebug`. This needs Node 22+, JDK 21 and the Android SDK.
- Vitest, typecheck and the web build pass. Web screenshots at 667x375 and 844x390, Reduced motion off and on, show no regressions.

## node-22
- The repo now asks for Node 22+ (`engines`, `.nvmrc`), the same as Capacitor 8. No CI workflows exist yet. Typecheck, Vitest and the web build pass on Node 22.23.4.

## B-BELT grown-up belt entry
- A grown-up can set the real belt and stripes: For grown-ups, answer the sum, then Belt & stripes. "Yellow, 2 stripes" shows Yellow with 2 stripes and unlocks the White items, and the next visit plays the promotion ceremony. It stays after a restart and can only go up.
- Vitest covers entry, saving and loading, and never lowering (8 tests). Screenshots at 667x375 and 844x390, Reduced motion off and on: no text overlaps on either screen. The entry lasts through a reload, and a lower pick is ignored.

## R-BAL-14b
- Charm amounts wired: Kind Stone multiplies low-health Focus by 1 + amount (Rally stays x2), Great Lamp and Feather tested, and check-c7 passes again.

## P-MENU-b
- The Training Board is split into a shell (background, left column, panel frame), a tab bar and a panel. Tab, page, gear-pick, Wear and Let go taps redraw only the panel. The tab underline slides in 180 ms and the panel slides in: 12 pt for a tab, 24 pt for a page. With Reduced motion on there is no slide, just a 120 ms fade. A gear pick stays instant. Code was only moved, nothing restyled.
## B-SAFE kid-safety items
- Outside links go through the grown-up gate (`openOutsideLink`). There are no outside links yet; a Vitest scan blocks any other way to open one.
- Grown-ups get an "Erase progress" button on the play-time screen, behind the gate, with an Erase / Keep confirm. Erase removes every saved key and restarts fresh.
- First launch shows a "Saved on this phone" note (privacy-page wording from #240) until it's tapped.
- `npm run build:beta` makes a beta build with every URL test flag, the dev day offset and the hidden testing screens off. I checked this on the built files: in the normal build `?street=` opens Street Smarts; in the beta build it's ignored.
- 7 new Vitest tests (`packages/sim/test/b-safe.test.ts`). Screenshots at 667x375 and 844x390, Reduced motion off and on.
## fix-celebrate-rm
- With Reduced motion on, the Celebrations rays stay still and no confetti shows. The Congratulations card says "practiced" for techniques counted from an earlier rank (legacy) and keeps "signed off" for real sign-offs.
## P-MENU-c
- Training Board left column tidied per plan §3a: one 44 pt header row (◀ Dojo 96x44), a 64 pt character block, Level + cap on one line with a 10 pt bar, ENTER 52 and Practice room 44, rounded Path card. The XP bar fills over 400 ms after a run (instant with Reduced motion on).
- Grown-up gate, play-time (choices, Belt & stripes, Done, Erase progress), wipe confirm, belt entry (chips and Back/Save) and CreateScene now use the shared rounded `button()`.
- New Vitest file `packages/sim/test/p-menu-c-buttons.test.ts`: no square buttons left in those screens, every button ≥44 pt, tap zones above dim layers, XP fill. Screenshots at 667x375 and 844x390, Reduced motion off and on, no text overlaps, nothing offscreen.
## fix-celebrate-rm
- With Reduced motion on, the Celebrations rays stay still and no confetti shows. The Congratulations card says "practiced" for techniques counted from an earlier rank (legacy) and keeps "signed off" for real sign-offs.

## practiced-cards
- The full-screen sign-off cards (and the welcome cascade on the first trip home) say "practiced" for techniques counted from an earlier rank, and keep "signed off" with who signed it for real sign-offs.

- P-MENU-d: Gear tab rebuilt. 56 pt button() cards with ▲▼= marks, a fixed grid, a slide-up detail sheet (Wear / Let go with a confirm), page dots, a Wear pop, an empty-bag icon and a mixed sign-off ✓. Seeded 33-item screenshots at 667/844/932 with Reduced motion on and off.
- P-MENU-e: the Dojo's lesson card, Sensei's Scroll, Settings (difficulty cards, Reduced motion, For grown-ups), the resume offer and the Dojo's top buttons use the shared rounded button() at 44 pt; the Gate READY chip pops once; CreateScene buttons are 44 tall. Screenshots at 667/844/932 with Reduced motion on and off.
- B-GEAR-BUG: worn-slot cards are tappable and open the detail sheet with Take off, so worn gear can be removed or swapped. Touch-tap proof (equip A, swap to B, take off, let go) at 844x390 and 932x430.
- B-LASTRUN: Last run panel stacks by measured height; no overlaps or clipping at 844x390, 932x430 and 667x375 (bounding-box check, Reduced motion on and off); Vitest layout test.
- P-MENU-f: Gate locks radius 22 (min 18) with 12 pt labels on at most 2 lines; heading 22; sundial and Seal on two equal 96-tall cards pinned to the panel bottom with a 28 radius circle; the lit Seal gets a soft gold ring, and its first light pops once with a soft code-made bell (once per Seal, saved in sealsSeen; old saves migrate silently). Screenshots at 667/844/932 with Reduced motion on and off.
- B-POLISH-1: empty-bag hint hidden behind an open worn-item sheet; Last run says "N items in your Gear" when no item row fits. Vitest for both; screenshots at 667x375, 844x390, 932x430 with Reduced motion on and off.
- P-MENU2-a: warm-wood mood frame (code-drawn) on the Training Board panel; Abilities gets a Trophy Case | Fighting Style switch (2 x button(), 44 tall, at most 120 wide); Fighting Style is a placeholder card; BOARD cubby/slot/tile/ribbon tokens; Vitest. Screenshots at 667x375, 844x390, 932x430 with Reduced motion on and off, overlap/clipping/tap-size checked.
- 2026-10-25 P-MENU2-b: Trophy Case (ribbon, shelves, cubbies, page dots, detail sheet). Wording in content/abilities/trophy-case.json; test p-menu2-b-trophy-case.

## P-MENU2-c — Trophy Case unlock moment (2026-10-25)

**Done**
- A newly earned cubby plays a paper-to-wood sweep, a small pop and the Seal bell, once per unlock (saved in `trophiesSeen`). Reduced motion: a plain fade plus the bell.
- Old saves load fine and never replay past unlocks. Vitest covers once-only, paging, save/load and old saves.
- Screenshots at 667, 844 and 932 wide, Reduced motion on and off.

**Next**
- P-MENU2-d (loadout). Polish later: a few px of side padding on cubby labels at 844 ('Self-Defense #1' and '#3' run edge to edge).
## P-MENU2-d — Fighting Style data (2026-10-25)

**Done**
- Profile `loadout` (starting Form + Virtue), read safely from old saves. The fight setup (`characterSetup`) uses it; with no loadout it gives exactly today's setup.
- Golden test of today's default play (captured from main before the change), plus tests for a chosen Stance, a chosen Virtue, old saves and unearned picks.

**Next**
- P-MENU2-e: the Fighting Style screen, where students make these picks.
## P-MENU2-e — Fighting Style screen (2026-10-25)

**Done**
- The Fighting Style tab: Stance and Virtue slot cards, a tray to tap to equip, a preview in plain words, and the "Always with you" row. Not-yet picks open a "Ask Sensei" sheet.
- Picks save to the loadout and survive a restart. With no pick, today's default play is unchanged (the golden test still passes).
- Screenshots at 667, 844 and 932 wide, Reduced motion on and off.

**Next**
- Read-aloud (after beta). Real art from #265 when it is approved. A long preview title (e.g. "Beginner's Stance" at 667) shows "…".

## B-POLISH-2 — Trophy Case polish (2026-10-25)
- Unlock pop now scales 1 → 1.06 → 1 (no snap to 0.9 after the sweep). Reduced motion: fade only.
- Detail sheet description allows 3 lines; Basic Form 1 at 667 shows its full text ending '15% slower.'
- Cubby labels keep 8 px side padding: a too-wide hyphenated label breaks after the hyphen, labels allow 3 lines at 12 px and the icon shrinks to fit, so "Learn this at the dojo" shows in full.
- Removed unused COMBAT.rootedFormBonusTicks; tests read the Rooted bonus from content (golden unchanged).
- Vitest b-polish-2.test.ts covers the pop keyframes, the line cap and the padding. Screenshots at 667, 844 and 932, Reduced motion on and off.

**Next**
- P-MENU2-e, once #270 is in.

- B-POLISH-2 (2nd Tester fix + #272 merge): the stroke-aware cubby padding, full-size icons with 3-line labels fitting inside the stroke, and the Fighting Style polish (hint, 2-line title, locked names, placeholder perk icon, re-tap no-op). Vitest 645 passed, 1 skipped; typecheck and build clean.
- B-POLISH-2: Fighting Style tray labels now use the cubby padding and wrap rules (2 tiles at 667). Smallest tray gap is 8.0 px. Vitest 646 passed, 1 skipped.

## P-MENU2-g — Last run "Scroll of the Climb" (2026-10-25)

**Done**
- New Last run screen: paper scroll, banner in kind words, room chips, 4–5 stat tiles that count up once per run, XP fill toward the next level, Found strip (every tile opens its sheet), "Always with you", "New for you" (only when there is one) and a big Again! that starts a climb. Bests is a sheet of personal bests only.
- `ui/lastRun.ts` (model + layout) and `content/settings/last-run.json` (words). No sim changes.
- Vitest `p-menu2-g-lastrun.test.ts`: count-up once (and never with Reduced motion), every found item reachable and tappable across pages, layout fits with taps ≥ 44 at 667/844/932, no text under 12, "New for you" only when earned and unseen, kind words. `b-lastrun-layout.test.ts` updated for the new layout.
- Screenshots at 667, 844 and 932, Reduced motion on and off: first open (counting), new trophy, reopen, Bests sheet, found item sheets, 24 found items (2 pages), nothing found.

**Next**
- Manager: confirm "New for you" = the newest unseen Trophy Case cubby (runs don't earn techniques), or switch it to this run's dojo pieces.
## P-MENU2-f — Gear polish (2026-10-25)
**Done**
- The Gear screen now has a paper doll on the left with one ring per slot (hands, gi, charm) showing what's worn. Tapping a ring, or the matching filter button, shows only that slot. Tapping it again shows everything.
- The bag is a grid of tiles with as many columns as fit, never fewer than 3 (3, 4 and 5 at 667, 844 and 932). Each tile shows its rarity word (from content) under the icon at 12 px. It pages with ◀ ▶ and dots like the Trophy Case. The grid never moves on pick, wear or filter: worn items stay in place with a gold ✓.
- The sheet shows ↑/↓ per stat in calm colours (no red) and plain words. The numbers sit behind Details. Wear is 52 tall.
- Wearing flies the item to its ring with a small pop and a glow on the doll. With Reduced motion on, it's a plain swap. The save works as before.
- Fighting Style: when the tray pages (1 tile per page at 667), page dots now show under it, with no numbers.
- The art is placeholder drawn in code. No #265 art is used. The words are in content/loot/gear-board.json.
- **#273 Tester fixes (2026-10-25):** every rarity word, Legendary included, now has 8 px clear each side inside the 2 px border (tiles 84 wide). Manager: at 667 the bag is 2 columns with ◀ ▶ paging so the student figure stays; 844 and 932 keep 4 and 5. The sheet is 172 tall: long names wrap to 2 lines, the compare line wraps, and Details moved to the button row, 8 px from Let go (all 52 tall). The Vitest test checks Legendary padding at all 3 widths.
**Next**
- Swap in the real art once Jay OKs #265.
## B-T3 — tier 3 Ember Kitchens, Orange belt (2026-10-25)

**Done**
- 8 Ember rooms, 6 Orange enemies and the Hearth Cook Guardian (3 phases), with tier 3 art and client wiring.
- Supper Rush Challenge 90 s from PR #275 (pending Jay).
- Guardian sim check: Orange typical, 30 seeds, Standard and Challenge, reaches and beats the Guardian. Vitest 801 passed, 1 skipped; typecheck and build clean.
- Screenshots of every room and the Guardian (3 phases) at 667, 844 and 932, Reduced motion on and off.

**Next**
- Rolling pin: replace the round danger area with the real lane shape.
- Guardian may be too easy: probes at 40 seeds beat it every time, taking about 4–18% damage in about 9–12 s.
- Re-check Supper Rush against #275 once Jay decides.
## R-STANCE-a — Forms are now Stances (2026-10-25)
**Done**
- Rename only: Rooted Stance and Flowing Stance, a STANCE button in runs, "Stance" in My Style and rewards. Kata names keep "Form".
- Old saves load with their stance (idempotent migration, tested with fixtures/saves/old-form-loadout.json).
- Golden run unchanged apart from the renamed ids. A new test blocks "Form" in player text outside kata names.
**Next**
- R-STANCE-b and later items in the R-STANCE plan.

## B-T3-TUNE — Hearth Cook and Supper Rush polish (2026-10-25)
**Done**
- Hearth Cook 549/17 (#280); phases stay 0.66/0.33. The #279 probe is in packages/sim/test; the drafts copy is deleted.
- Challenge timer keeps sim ticks; the per-frame cap is 10 ticks. In-time and out-of-time words live in each challenge room's content; Supper Rush says "Time's up! The soup cooled, but you still earned a chest."
**Next**
- Manager: other challenge rooms could get their own out-of-time lines.

## B-T3-TUNE-2a+2c — Hearth Cook pot lid and phase pause (2026-10-25)

**Done**
- Hearth Cook takes no damage while its sparks are up (clang, no number); new phase patterns with pins in every phase.
- About a 1 s pause at 66% and 33% with a roar, glow and Sensei's line.
- Bot check (Orange gear, great-hearth, 60 seeds) in packages/sim/test/b-t3-tune-2-boss-levers.test.ts: typical 60/60, masher 46/56 (82%) on Standard; typical fight 13.3 s without pauses, 15.1 s with.

**Next**
- Jay to OK real lid / clang / roar art and sound (placeholders now).

## R-STANCE-d1 — Cat, Front, Fighting and Horse stances (2026-10-25)

**Done**
- The four real stances replace Rooted and Flowing, using the #290 numbers and the #288 one-liners.
- Old saves with Rooted or Flowing moved to the default stance (since R-STANCE-g that is Open Leg for those saves, not Beginner's). A stance that isn't unlocked is dropped from the loadout.
- Horse shows the approved rooted idle. The golden run was re-captured.

**Next**
- R-STANCE-d2: sign-off unlocks. R-STANCE-b: stance icons. Jay's howToStand questions are still open.
## B-MASHER — Mash guard, shield bounce Focus, kid bot (2026-10-25)
**Done**
- Hits that land mid-swing count as a Block; shield bounces give +6 Focus with a gold glow (steady tint in Reduced motion).
- Kid bot gate (BALANCE): wins 137/200 (68.5%), room-1 KOs 0/200. Masher typical wins 14 → 59/200, room-1 KOs 148 → 0. Smart bot wins 200/200 both ways, run time within 2%.
**Next**
- Manager: b-t3-tune-2 boss-levers 15–20 s band misses at 14.86 s (main 15.1 s); smart damage taken per room down ~30%.

## B-MASHER-2 — Mash guard fades after 3 Perfect Counters (2026-10-25)
**Done**
- Mash guard turns off after a room's 3rd Perfect Counter and resets each room; "Sensei steps back" shows once per run.
- Kid gate: wins 113/200 (56.5%), room-1 KOs 0/200. Smart damage per room vs 911ce19: 28.60 → 23.51 (−17.8%), 26.23 → 22.10 (−15.7%), 28.65 → 23.74 (−17.1%).
**Next**
- Manager: smart damage −16 to −18% accepted for the beta (200/200 smart wins, bands 293/293). Final mash-guard wording from the Content Designer landed; shots in b-masher-shots/v3.
## B-CF-BUILD — Cloudflare build fixed (2026-10-25)
**Done**
- Removed the stray `pnpm-lock.yaml` that sent Cloudflare to pnpm (nothing installed, `tsc` not found); pinned `packageManager` to npm@10.9.2; guard test for stray lockfiles.
**Next**
- Watch the 'Workers Builds: dojo-ascent' check go green on main after merge.
## P-MENU2-i (2026-10-25)
- menu2 art imported (61 frames, 1 page) and drawn in Trophies (cubbies, shelf, seal, lantern, shine, unlock sweep, belt knots), Gear (doll backing, rings, bag tiles) and Last run (stat tiles and icons, XP bar, found tiles). Code-drawn fallback kept everywhere.
- New test packages/sim/test/p-menu2-i-art.test.ts (7 tests). npm test: 857 passed, 1 skipped.
## C-RENAME-3-code (2026-10-25)
- Code strings now say Great Counter / GREAT x / GREAT! / "N Great". Two tests that still asserted #307's old content lines updated (main was red on them).
## P-MENU2-SPACE — Training Board on short landscape phones (2026-10-25)
**Done**
- Left column compacts below 369 pt; panel contents scroll inside the frame when the screen is short; stat number/label gap 12–13 px; stat icons 8+ pt from the number; My Style slot label overlap fixed.
- Measured at 667x375, 667x320, 800x290, 844x390, 932x430 with Reduced motion on and off: no text overlaps, nothing within 8 px of the screen edge, 0 console errors. Shots in docs/shots/p-menu2-space.
- Round 2: taps clipped to the visible window (edge-tap script: 0 fails), Path card always shows, fade and chevron scroll cue, empty Last run doesn't scroll, Gate label shows in full at 667x320.
**Next**
- Jay to try it on his iPhone in Safari landscape.
## B-T3-TUNE-2b — Hearth Cook wind-ups, lid and lid icon (2026-10-25)
**Done**
- Imported the #299 Hearth Cook art (P1/P2 pin, P3 bonk, P2/P3 lid overlay, 24 px lid icon). The importer now merges overlay layers and reads inline static sprites.
- Lid layer follows lidUp; the boss bar shows the lid icon at 24 px over the grey wash; stand-in wind-ups removed. Tests: b-t3-art (frames/fps = 26 and 20 ticks, lid layer, icon).
- Shots at 667x375, 667x320, 844x390, 932x430, Reduced motion on and off, 0 console errors: docs/shots/b-t3-tune-2b.
**Next**
- Tester pass on a phone; art author may want to look at the lid hidden on the P3 bonk facing E.
## A-LEGENDARY-wire — Legendary frame wired in (2026-10-25)
**Done**
- Legendary gear uses the golden-orange frame (Jay OK'd #304) instead of the Epic stand-in: Gear bag tiles (9-slice + gem crest), doll rings (normal/glow/pressed) and Last run found tiles. Imported via tools/art-import (menu2 pack, +6 frames).
- Word "Legendary" lifted 4 px on its tile: #5a2e08 ≥4.52:1 on every glyph pixel (median 9.28:1).
- Before/after shots with forced Legendary items at 667x375, 667x320, 844x390, 932x430, Reduced motion on/off, 0 console errors: docs/shots/a-legendary.
- Round 2: the word clears the rim by ≥8 px below and at the sides (9.5 / 9.5 / 9.0 px at DPR 2, all sizes, Reduced motion on/off; contrast ≥8.96:1). A picked Legendary keeps its frame and crest, with the highlight drawn on top.
**Next**
- Optional: the Legendary shine overlay (6 frames, once, skipped under Reduced motion) as its own item.
## R-STANCE-d2 — stance sign-off unlocks (2026-10-25)
**Done**
- Stances unlock only from their own teacher sign-off in the feed (`stanceSignOffs`, placeholder DojoForge ids in content and fixtures). No legacy grant, not in the Gate or Power Rating, katas unlock nothing. Picker shows Ready plus all 4; unsigned ones show the not-yet card.
- New test packages/sim/test/r-stance-d2-signoffs.test.ts (9 tests, including the idempotent load). npm test 902 passed, 2 skipped; typecheck and build pass.
- Shots at 667x375, 667x320, 844x390, 932x430, Reduced motion on and off, 0 console errors: docs/shots/r-stance-d2.
**Next**
- Swap the placeholder ids for the real DojoForge ids when DojoForge adds stance sign-offs.

## R-STANCE-g — Beginner's Stance and Open Leg (2026-10-26)
**Done**
- Beginner's Stance (plain standing, all 0) is where new players start. Ready is now Open Leg Stance (`ready-stance`, stances[1]) with its own sign-off; old players keep it through a one-time, idempotent save migration; an old save with a retired pick (Rooted or Flowing) lands in Open Leg. After that, unsigned picks fall back to Beginner.
- Beginner, locked Open Leg and welcome lines from #312, in content/abilities/fighting-style.json.
- New test packages/sim/test/r-stance-g-ready.test.ts (8 tests). npm test 910 passed, 2 skipped; typecheck and build pass. Golden re-captured on purpose (runs unchanged).
- Shots at 667x375, 667x320, 844x390, 932x430, Reduced motion on and off, 0 console errors: docs/shots/r-stance-g.
**Next**
- Open Leg plays the same as Beginner (both all 0) until the Researcher or Jay gives it numbers. Stance-tagged idle art. Real DojoForge id for the Open Leg sign-off.

## R-STANCE-READY-NUM — Open Leg Stance numbers (2026-10-26)
**Done**
- Open Leg (`ready-stance`): power +3%, Dash recharge −10%, blocks let 45% through, Focus +8%; counter window 0, no downside (#314). Beginner stays default and all 0.
- New BALANCE-gated sim report (smart, kid, masher × Beginner vs Open Leg): `packages/sim/test/balance/ready-stance.test.ts`. Same setup as the kid gate (belts 1-10 x 20 seeds). Wins before → after: smart 200 → 200, kid 113 → 139, masher 59 → 85 (of 200); room-1 KOs 0/200 throughout.
- npm test 911 passed, 3 skipped; typecheck and build pass. Golden re-captured on purpose (runs unchanged).
**Next**
- Manager confirmed all 4 bonuses, no downside. Real DojoForge id for the Open Leg sign-off.

## Q-PREM-F2 — Done button in Settings (2026-10-26)
**Done**
- Settings (dojo → Settings) has a green "Done" button in the top-right corner (96×44); one tap closes it.
- Touch script `docs/shots/q-prem-f2/f2-touch.mjs`: 3 single taps each (centre and two inner corners) at 667x375, 667x320, 844x390 and 932x430, Reduced motion on and off: 24 of 24 closed Settings in one tap. Logs `tap-*.txt`, shots `settings-*.png`.
- npm test 911 passed, 3 skipped; typecheck and build pass.
**Next**
- Q-PREM-F1 (Bow on first tap).

## Q-PREM-F4 — Nothing over the loss message (2026-10-26)
- When the hero goes down, the boss tag and bar, the fight buttons and the joystick disappear and stop taking taps.
- Script `docs/shots/q-prem-f4/f4-loss.mjs` (`?room=keepers-hall&seed=7&difficulty=guided`, test profile 4-green-belt; it sets health 1 and the floor's minHealth 0 to force the loss): 8 of 8 runs (667x375, 667x320, 844x390, 932x430 × Reduced motion on/off) show no boss name, 0 fight buttons, 0 stick parts, and taps after the loss give no action or move. Log `tap-loss.txt`, shots `loss-down-*.png` and `loss-card-*.png`.
- npm test 911 passed, 3 skipped; typecheck and build pass.
**Next**
- Q-PREM-F5 (Try again).
- Follow-up: on playerDown, floating texts and pop words still on screen are removed, new ones are skipped, and the GREAT xN chain clears with the combo, so nothing touches the loss message.
- verify-ui-shots pass `docs/shots/q-prem-f4/f4-verify.mjs` (log `verify-log.txt`, shots `verify-{fade,card}-{start,mid,end}-*.png`): it freezes the game loop on the first frame of the loss fade and of the card fade-in, reads Reduced motion back before each shot. 274 PASS, 14 FAIL, all on the existing run-over card: Try again text contrast 3.12:1 (all sizes) and card buttons 42 px tall at 667x320. Not changed here (card belongs with F5).

- Q-PREM-F4 QA fix: Sensei bubble cleared on a natural loss. `docs/shots/q-prem-f4/f4-natural.mjs` checks a natural standard-difficulty loss with a Sensei bubble up at all 4 sizes × Reduced motion on/off (log in natural-log.txt).
## Q-PREM-F5 — Back home only (2026-10-26)
**Done**
- The "Good effort!" card after a lost run shows one button, Back home, at least 44 px tall at every size.
- verify-ui-shots `docs/shots/q-prem-f5/f5-verify.mjs` (log `verify-log.txt`, shots `card-{start,mid,end}-*.png`) at 844x390, 667x375, 667x320, 932x430, Reduced motion on/off (read back before each shot): 216 PASS, 0 FAIL, including one Back home tap going Home in all 8 runs.
- npm test 911 passed, 3 skipped; typecheck and build pass.
## Q-PREM-F1 — First-tap bow and arrival tap-through (2026-10-26)
**Done**
- "Tap to continue" at the end of the dojo arrival can't move the hero or start a run: a press echoed within 450 ms after the last card is dropped (DojoScene). 40/40 at 667x375, 667x320, 844x390 and 932x430, Reduced motion on and off; it was 30/36 on main.
- Bow: 10/10 single taps bowed on the dojo entry and the floor at 667x375. Top-bar taps while the prompt is up pulse Bow and open nothing, at all 4 sizes (dojo 8/8, floor 3/3). Both already held on main, so bow.ts is unchanged.
- npm test 911 passed, 3 skipped; typecheck and build pass. Shots and touch scripts: docs/shots/q-prem-f1/.
**Next**
- Tester: retest (c) on a real phone. Real-phone repro needed if a bow tap still misses.

## Q-PREM-COLOR (2026-10-26)
- Shared GREEN #277a56 in all 26 places. verify-ui-shots on Title OK, Create "Let's go!", Street Smarts choices, rest card "Back home" and DASH at 667x320, 667x375, 844x390, 932x430, Reduced motion on/off, pixel-sampled (docs/shots/q-prem-color/verify-log.txt). Test: packages/sim/test/q-prem-color-green.test.ts.
## Q-PREM-F6 (2026-10-26)
- Again! fully visible at 667x320, 667x375, 844x390, 932x430; Reduced motion on/off; hands-on tap starts Game. verify-ui-shots 244 PASS / 0 FAIL (docs/shots/q-prem-f6/verify-log.txt). Test: packages/sim/test/q-prem-f6-again.test.ts.

## Q-PREM-F8 (2026-10-26)
- Nothing tappable within 8 px above Again! (12 px measured) at 667x320, 667x375, 844x390 and 932x430, with Reduced motion on and off, scrolled to the top, halfway and the end. Hands-on touches 2, 4 and 6 px above Again! open nothing, and Again! still starts Game. verify-ui-shots: 308 PASS, 0 FAIL (docs/shots/q-prem-f8/verify-log.txt). Test: packages/sim/test/q-prem-f6-again.test.ts (F8 gap check at all 4 sizes).

## Q-PREM-F9 (2026-10-26)
- COUNTER, STRIKE and VIRTUE ready, not-ready and flash labels all reach 4.5:1 or more (pixel-sampled). Decorate's Done and Street Smarts are 44 px at 667x320, 667x375, 844x390 and 932x430, with Reduced motion on and off. Hands-on: each action button queues its action, Done returns to play, and Street Smarts opens its scene. verify-ui-shots: 488 PASS, 0 FAIL (docs/shots/q-prem-f9/verify-log.txt). Test: packages/sim/test/q-prem-f9-actions.test.ts.
## Q-PREM-F10 (2026-10-26)
- Stat tile number and label at least 4 px apart, with nothing overlapping (tile icons, New for you label, icon and sparkle checked against every panel text and picture), at 667x320, 667x375, 844x390 and 932x430, with Reduced motion on and off. Text is at least 12 px, F8's 12 px above Again! is kept, and a hands-on tap on Again! starts a run. verify-ui-shots: 766 PASS, 0 FAIL (docs/shots/q-prem-f10/verify-log.txt). Test: packages/sim/test/b-lastrun-layout.test.ts (Q-PREM-F10 block).
