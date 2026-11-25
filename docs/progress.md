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

## Q-PREM-TRY (2026-10-26)
- Retry line changed in the 10 listed lessons; the test checks them against the draft list; shots at 4 sizes, 20 PASS / 0 FAIL (docs/shots/q-prem-try/verify-log.txt).
## B-MASHER-d1 — knock-out flow (2026-10-26)
**Done**
- A Tower knock-out is three kind screens: "Sensei helps you up." (tap skips), "You kept everything you found!" with the finds and one Head home button (tap anywhere too, no timer), then "Welcome home!" on the Training Board with one pointer (class first, else the Tower; none when play time is up). Time-limit endings share Screen 2 with the resting line; the old rest card is gone. Guided offer comes after Screen 2. Practice KO gets the kind words and keeps going (controls now come back).
- "Ouch! The run is over" / "Back to the start": 0 in client and content (test: packages/sim/test/b-masher-d1-knockout.test.ts).
- npm test 953 passed, 3 skipped; typecheck and build pass. verify-ui-shots at 667x320, 667x375, 844x390, 932x430, Reduced motion on/off: docs/shots/b-masher-d1/verify-log.txt.
**Next**
- Tester: play a Tower knock-out and a play-time-up ending on a phone.
- Read-aloud of these screens is a separate item.
## Q-PREM-GRADE (2026-10-26)
- Grade letters, the grade sound, Last run grade chips, the tutorial card letter and "Most S grades" now show on Challenge only (`showGrades`). Run summaries save their difficulty. verify-ui-shots: 4 sizes × guided/standard/challenge, 72 PASS / 0 FAIL (docs/shots/q-prem-grade/verify-log.txt). Test: packages/sim/test/q-prem-grade.test.ts.
**Next**
- Tester: clear rooms on Standard (no letters, no grade chime, "Room clear!" stays) and on Challenge (letters back).
## Q-PREM-BOSSWIN (2026-10-26)
- First real Floor Keeper clear shows "Floor Keeper defeated!" once per save; old saves count as celebrated only when the last run was a real (non-tutorial) Floor Keeper clear; a tutorial-only save still gets it. verify-ui-shots at 667x375, 844x390, 932x430, 1024x768, Reduced motion on/off, frames 0/600/1500 ms, hands-on tap continues: 224 PASS / 0 FAIL (docs/shots/q-prem-bosswin/verify-log.txt). Test: packages/sim/test/q-prem-bosswin.test.ts.
**Next**
- Tester: beat the Floor Keeper on a fresh save (moment plays), then again (normal clear). Q-PREM-GRADE next.
- Q-PREM-F9 QA fix: DASH/STANCE solid dim faces (6.44:1 / 6.89:1), Counter lockout ring, Decorate wall row clear of the 60 px bar. verify-ui-shots 656 PASS, 0 FAIL (4 sizes × Reduced motion on/off).
## R-PREMIUM-b3 (2026-10-26)
- 13 sound events play CC0 files (20 files plus licences, 349 KB) with per-file gains from `tools/audio-sfx/build.mjs`; the rest stay made in code, and each file event falls back to code. "perfect" is now `greatCounter()`. Loudness at the speakers: all peaks −7 dBFS or lower, 0 errors (docs/shots/r-premium-b3/loudness.txt). Hands-on: 80 real taps in training, files played for hit, dash and insight, 0 missing files, 0 errors (hands-on.txt). Test: packages/sim/test/r-premium-b3-sfx.test.ts.
**Next**
- Jay: listen on the preview link before merge.
- 2026-10-31: merged main (no conflicts); `sfx.levelUp()` now plays once when the Home levels-gained screen shows (`takeLevelUpSound`, 3 new tests in `r-premium-b3-sfx.test.ts`). Suite 1207 passed, 11 skipped; typecheck and build exit 0; golden fixture unchanged. No UI change, so no shots.
- 2026-10-31 QA fix: the level-up sound now fires from the XP fill tween's `onComplete` (it was ~600 ms early, on a delayedCall); measured 0-1 ms after the last bar frame. Merged main 98f38586; one new test pinning the timing. Whoosh levels untouched.

## 2026-10-26 — Q-PREM-F11
- A tap on KO Screen 1 goes straight to Screen 2 (90–275 ms after the tap, was about 1.75 s). Head home is ≥48 px at every size. New test: packages/sim/test/q-prem-f11-ko.test.ts. Shots and log: docs/shots/q-prem-f11 (88 PASS, 0 FAIL, 4 sizes × RM on/off).
## Q-PREM-TRY fix (2026-10-26)
- Retry line in the 10 lessons is now "Nice work. Let's keep practicing."; test updated.
- lesson-counter-guided retry: "So close! Let's keep practicing."; test bans 'try again' in all lessons; shots include the guided line.
- All 11 lesson retry lines are "Nice work. Let's keep practicing."; test bans 'So close' and 'try again'.

- 2026-10-26 L-PREMIUM-a2: locked Trophy Case cubbies show a one-line hint (content/hints/locked-hints.json). Tests in packages/sim/test/l-premium-a2-hints.test.ts; shots in docs/shots/l-premium-a2.
## Q-PREM-F11 QA fix (2026-10-26)
- 500 ms tap guard on Screen 2; source test + shot check (mash inside the window stays, a tap after goes Home), 112 PASS, 0 FAIL at 4 sizes, RM on/off.
- 2026-10-26 L-PREMIUM-a2: kata cubbies show "Learn a kata in class with Sensei!" (cubbies.kata-cubby); kata sheet shots re-run.
- 2026-10-26 B-TUNE-GUIDED: Guided enemy Power ×0.75 via DIFFICULTY.enemyPowerScale; "Orange typical" testing fixture (6-orange-typical, pinned 333/46/34). Kid bot on Guided 78% -> 95% overall, white belt 57% -> 90%; Standard and Challenge unchanged.
## L-PREMIUM-b (2026-10-26)
- Counter hint built: sim event + rules, client tip/pulse, 7 tests (200-run kid ≤1/room, smart 0, Challenge 0), shots in docs/shots/l-premium-b (104 PASS, 0 FAIL).

## L-PREMIUM-b QA fix (2026-10-26)
- Mash-guard Blocks count as misses; threshold 3; test overrides removed. No-override 200-run sim: kid 164 tips in 1,228 rooms (max 1 per room), smart 0 in 1,600, Challenge 0 in 939. Shots 104 PASS, 0 FAIL.
## Q-PREM-F11 QA fix (2026-10-26)
- 500 ms tap guard on Screen 2; source test + shot check (mash inside the window stays, a tap after goes Home), 112 PASS, 0 FAIL at 4 sizes, RM on/off.
- B-MAIN-TRY11: q-prem-try test updated for the 11-lesson draft from #355; main green again.
- B-W-ROOMS-TESTS: #359 tests fit the white rooms (mixes, K12, old-thumper at belt 2, golden re-captured for white runs only).
- B-BRIDGE-GOLDENS: p-menu2 golden re-captured for the #361 bridge swarmer move (revert proof passes).
- R-B1-RAMP-2: pin test for the 15 white room copies, ?room= link maps to the white copy, background shots match the originals; #361 note corrected to 8 run entries.
- Q-DOOR-LABELS: side door labels clamped 8 px inside the view, unknown ?room= console warning; 8 tests; shots 60 PASS, 0 FAIL at 3 sizes, RM on/off (gauntlet CHALLENGE label moved from -47 px to 8 px at 667x375).
- R-CHALLENGE P1: Challenge wind-ups never under 10 ticks (jab and dart 9 -> 10); golden moves only in its rooted Challenge row; next Q-DOOR-LABELS, then P6.
- R-CHALLENGE P2: enemy `challenge` blocks (loader checks, one switch in createWorld, pattern stepping, two-part followUp hits, landing flag); 23 tests with test-only sample enemies; golden byte-identical; no content yet (C1).
- R-CHALLENGE P3: Challenge pattern attacks start on screen (SIM_VIEW 9 x 6.75 tiles, tied to the client camera), one pattern wind-up at a time, no other attack during a two-part attack, no flagged lane over a red circle; 10 tests incl. a 1,000-room sweep at belts 4-10; golden byte-identical.
- R-CHALLENGE P5: balance bot answers Challenge patterns: a typical bot steps out of a landing circle when it can clear the edge in time (else Counters), and a typical or sharp bot holds Strike between the two hits of a double hit; novice/kid unchanged. TEST-ONLY sample blocks (C1-C5 shapes) in test/balance/sample-patterns.ts, nothing in content/. BALANCE=1 prints the plan's section 4 table. Guided/Standard byte-equal with samples on/off; golden byte-identical.
- Q-DOOR-LABELS-2: door label side clamp runs after the camera update (FOLLOW_UPDATE), so labels stay 8 px in from the edge on scroll-start frames; tests for the moved view; scroll-start shots 48 PASS, 0 FAIL at 3 sizes, RM on/off (30 frames each).
- R-CHALLENGE P6: Challenge difficulty locked below the 4th belt (plays and shows as Steady, the stored pick is kept); 6 tests; no golden or fixture diff; Settings shots 16 PASS, 0 FAIL at 2 phone sizes, RM on/off, belts 3 and 4.
- R-CHALLENGE P4: pattern tells. Lane (striped strip, stripes slide unless Reduced motion), landing spot (dashed hop line + inner ring), circle (as before), drawn from the first wind-up frame; first time per enemy+attack (saved `patternsSeen`) Sensei says the attack's `senseiLine` (clears after 2.6 s); boss phase line skipped when the shockwave line already played that fight; double slam's 2nd hit redraws. Sensei's guided Counter no longer picks an uncounterable (dash-only) warning. 7 tests; golden byte-identical. Shots: docs/shots/r-challenge-p4/{lane,landing,circle}.png.

- 2026-10-27 Q-SWARM-JAB: tests lock the swarmer jab at 10 or more ticks on Challenge, elites and play included (packages/sim/test/q-swarm-jab.test.ts). The elites loader now requires minWindupTicks >= MIN_WINDUP_TICKS. No golden change.
- 2026-10-27 Q-FAIR-EDGE: downed players count for the pattern on-screen check; red circles no longer start under a winding-up flagged lane (either step order). Tests: packages/sim/test/q-fair-edge.test.ts (downed edge, both step orders, 1,000-room sweep belts 4-10: 0 off-screen, 0 overlaps).
- Q-LOCK-CARD: locked Challenge card is solid and answers a tap with a sound, a line pulse and a small shake (no shake with reduced motion); `{belt}` placeholder in the locked line from school data; 4 tests; shots 63 PASS, 0 FAIL at 667x320, 667x375, 844x390, RM on/off, plus belt 4 unlocked.

- R-CHALLENGE P4 banner fix: the Sensei banner is placed no higher than the bottom of the top bar (room/wave label, timer, boss bar) + 6px, so at 667x375 it cannot cover the top bar during wind-ups. Shot: docs/shots/r-challenge-p4/667x375-windup-shockwave.png.
- 2026-10-27 R-CHALLENGE P4 QA fixes: (1) every Sensei line (senseiSay, placeSensei, placeOffPlayers / the Mash guard lesson banner, the Counter tip, the twist banner) sits at max(senseiTop, topBarBottom + 6); topBarBottom now includes the health and Focus bars (y 51). A tall lesson banner with no room clear of the hero goes full width at 20px and retries. (2) Stale "Sensei: COUNTER!" fixed with a new `guideCancel` sim event (test reproduces: 65 stale dash-only wind-ups before, 0 after). (3) `?force=wide-bonk` test link forces the bopper's wide bonk. Tests 1119 passed / 4 skipped; golden unchanged; shots 80 PASS / 0 FAIL at 667x375 and 844x390, reduced motion on and off.
- 2026-10-27 Q-BOW-OVER-MENU: the dojo bow prompt waits while a menu, panel or the arrival sequence is open, then shows once after it closes (`bowGate` in apps/client/src/ui/bowGate.ts); 2 tests (packages/sim/test/bow-gate.test.ts); shots 26 PASS, 0 FAIL at 844x390 and 667x375 (arrival panel and Settings, open then closed). Fix after QA FAIL: the bow is also held for the whole arrival, "Welcome home" splash included, and shows once after it. Root cause: the gate read 'arrival open' from `mode !== 'play' || cardsOpen > 0`. The "Welcome home" splash is a Celebrations overlay, not a card(), so cardsOpen stays 0, and arrive() never set the mode itself (it trusted tryBow to have set 'arriving'). So when arrive() ran with the mode at 'play', nothing marked the arrival as open, and the bow drew under the splash's input layer, where taps couldn't reach it. Also, the once-per-scene bowShown latch meant a bow that came due after the first bow could never show at all. arrive() now owns an `arriving` flag (passed to bowGate), and the latch resets after each bow; +1 test; shots 4 configs PASS (844x390 and 667x375, RM on/off), in /workspace/qa/bow381.
- 2026-10-27 R-CHALLENGE P7: the P5 balance table and pattern tests now use the real C1 content (content/enemies); the test-only sample-patterns.ts is deleted. BALANCE=1 warns for each Challenge cell more than 5 win points off the §4b L+B row (2 warnings at 40 seeds: kid b8 25 vs 33, kid b10 20 vs 30; newer and careful match at 100). Guided/Standard byte-equal with the real patterns on and off; golden byte-identical.

- Q-SHAKE-CENTER: the locked Challenge card shake is now a sine wave around its resting spot (same 4px left and right, 3 cycles, 250ms), ending exactly where it started; a second tap stops the old shake first. Test in packages/sim/test/q-lock-card.test.ts. verify-ui-shots 26/26 frame by frame at 844x390 and 667x375.
- 2026-10-27 Q-P7-SEEDS: the BALANCE=1 Challenge table (r-challenge-p5.test.ts) runs 100 seeds per cell instead of 40. Result: Challenge kid 26/39/37/30/32/32/31 (b4-b10), newer and careful 100; 0 WARN lines (the 40-seed b8/b10 warnings were noise). Default npm test unchanged (table is skipped without BALANCE=1).

## Q-STANCE-BANNER — Sensei's banner never covers Stance (2026-10-27)
- In Practice, when the lesson banner can't sit above the hero, it now goes into free space beside/above the bottom button row (bottom-left strip), never over Stance or any action button. Before: `docs/shots/q-stance-banner/before-667x375-practice.png`; after: `contact-sheet.png`.
- One rule: `pickBannerSpot` / `overArena` in `ui/senseiPlace.ts`; the action buttons (+8px) are a hard keep-out. No room → shrink to the small-phone size (20px); still none → over the arena, never over buttons.
- Test: `packages/sim/test/q-stance-banner.test.ts` (both phone sizes + 5,000 random layouts: banner box never overlaps the Stance box). Shots: 667x375 + 844x390, reduced motion on/off, Practice/standard/challenge — 164/164 checks (≥6px under the top bars, clear of the hero, off every button, Stance tap registered while the banner is up).

## Q-VIRTUE-BANNER — no Sensei banner covers any action button (2026-10-27)
- Challenge "New move!" lines (and every other Sensei line) used to cover VIRTUE and sometimes STRIKE. Now every placement path goes through `pickBannerSpot` with `buttonKeepOut()` as the keep-out zone: `placeSensei` (New move!, lessons, tutorial tips, twist Sensei lines, KO lines), the Counter tip (`placeCounterTip`) and the twist banner (`showTwist`).
- A line with no room is shrunk to the small-phone size, then narrowed step by step (and into the strip left of the buttons) before it may sit over the arena, never over a button.
- Tests: `packages/sim/test/q-stance-banner.test.ts` extended: New move!, lesson, Counter tip and twist at 667x375 and 844x390 over a sweep of hero positions never overlap any button box. Shots (`docs/shots/q-virtue-banner/`): 876/876 checks at both sizes, reduced motion on/off, Practice/Standard/Challenge (off every button, ≥6px under the bars, off the hero, VIRTUE and STRIKE taps still register with a New move! line up); the #384 shots still pass 164/164.

## Q-TIP-BANNER — the Counter tip and the Sensei banner no longer overlap (2026-10-27)
- The Tester saw the Counter tip and a Sensei banner overlap in 8 of 8 trials (6.2k–9.7k px²). `placeCounterTip` passed `others: []`, so it did not know the banner was there. It now treats the showing banner's box (+6px) as one more keep-out, so the tip sits clear of it in either order (tip first or banner first; the tip re-places itself every frame). The tip still never covers an action button, stays ≥6px under the top bars, and avoids the heroes when there is room.
- If the heroes plus the banner leave no clear spot, the tip may sit over a hero rather than vanish. Buttons, HUD, circles and the banner stay hard keep-outs.
- Code: `bannerKeepOut` and `tipSpot` in `ui/senseiPlace.ts`; one changed call in `GameScene.placeCounterTip`. No new dependency.
- Test: `packages/sim/test/q-tip-banner.test.ts` (both phone sizes, the Tester's two tip/banner size pairs, a sweep of hero positions: 0 overlap, off every button, tip always shown, at or below the floor). Live: 64 trials (667x375 + 844x390, reduced motion on/off, 4 modes, 2 pairs, both orders) — 0 overlapping; the same harness with the fix switched off shows 44/64 overlapping (max 24,656 px²). Shots (`docs/shots/q-tip-banner/`): 876/876 and the #384 shots 164/164 still pass.

## R-INSIGHT-BAL-a — Insight card numbers and rules A/B/C (2026-10-27)
- New numbers and the Content Designer's text in `content/insights/insights.json`; rules A (Wind Step also speeds basic attacks), B (Press the Advantage also on winded/recovering enemies) and C (Shield Breaker: `focusOnBreak` 7 Focus on a shield break) in `packages/sim/src/world.ts` and `effects.ts`. No new dependency.
- Tests: `packages/sim/test/r-insight-bal-a.test.ts` (one behaviour test per rule, the card numbers, the Focus cap); `r-bal-14b-charms.test.ts` Rally now x1.75. Golden fixture `fixtures/golden/p-menu2-d-default-run.json` regenerated (approved).
- Local re-run of the R-INSIGHT-BAL harness (kid, newer, careful, Standard, belts 1-10): the 4b card table and the 4d pairs and routes tables match the spec exactly (every difference 0.0 PE, 0 win points).
- Wind Step tuned to 0.3 / every 5 combo hits / 2 s (Manager, #390 4f); text "Every 5 combo hits gives you a 2-second burst of speed."; test and golden updated.
- `b-t3-tune-2-boss-levers`: only the masher floor check runs at 600 seeds (60-seed luck); 348/437 = 79.6%, floor still 75%.
- `r-challenge-p5` step-out test is paired on landing-circle damage: 477 matched swings, step-out 1933 vs Counter 2278 (-15.1%), lower in 22, higher in 4. Follow-up for the Manager: committing to the step-out once started cuts landing damage about 44% (not adopted).
- Full suite green: 1148 passed, 4 skipped, about 31 s; typecheck and build pass.

## R-INSIGHT-BAL-b — Insight budget tests, layers 1 and 2 (2026-10-27)
- Stacked on R-INSIGHT-BAL-a (#389). Layer 1 (`packages/sim/test/insight-budget.test.ts`) runs in the normal suite: caps table, unique ids, family sizes, stacking limits. Layer 2 (`packages/sim/test/balance/insight-budget.test.ts`, `BALANCE=1`): B1-B7 and B10 (route win-rate spread: held at most 14, lean-picker at most 10), B9 printed.
- Test-only pick seam: `playRoom(..., pickInsight?)` in `balance/bot.ts`. No env flags or HOOKS patch. No new dependency.
- Results: see the PR's Delivery Note (counts, layer-2 run time, and the deliberate-bad-number demo).
- QA fix (layout): Insight picker cards are as tall as the tallest text plus 8 px under it (was a fixed 175 px); body text steps down 16/15/14 only if the row would not fit. New card text from #391 copied into `insights.json` (numbers untouched). Test: `r-insight-bal-a-picker.test.ts`; live check `/workspace/shots/r-insight-bal-a/`: 372 checks, 0 failed (both phone sizes, reduced motion on and off, 9 cards in 5 rows, plus taps).

## A4-DOJO-i — Action Zone, the inside room (2026-10-30)
- Imported pack `dojo-az-inside` (22 sprites at 0.6); `content/dojo/action-zone/inside-room.json` is loaded by `loadInsideRoom` into a sim Room (`packages/sim/src/actionZone.ts`). New `InsideScene` (key `ActionZoneInside`): floor, walls, props, hero and sprites sorted by `sortRow`, seat-back and bag-top pieces that hide the hero only while he is north of them, the front wall on top.
- PLACEHOLDER: an "Action Zone" button in the Home Dojo (play mode) goes straight in; PR 2 (A4-DOJO-ii) routes it through the outside. The exit door returns to the Home Dojo.
- Tests: `packages/sim/test/action-zone.test.ts` (7): grid and room match the file; spawn reaches every approach tile and the exit; blockers cannot be crossed by tap or stick; art and sortRow match; a broken file is refused. Golden fixture unchanged.
- Shots (667x375 and 844x390, reduced motion on and off, setting read back first): 4 runs x 24 checks, 96 pass, 0 fail. They prove the hero is hidden behind the seat panel, both bag tops and the front wall, and fully visible in front of them. Contact sheets: `/workspace/shots/a4-dojo-i/contact-sheet-*.jpg`.
- Suite at this PR: 1172 passed, 11 skipped (none of them mine; this PR adds 7 tests, no skips); typecheck and build exit 0; the golden fixture is unchanged.

## A4-DOJO-ii — Action Zone, outside, town and the way in (2026-10-30)
- Imported packs `dojo-az-outside` (day only) and `dojo-az-town` (a still picture). New `WalkScene` base; `InsideScene` moved onto it with an exit cue; new `OutsideScene` (key `ActionZoneOutside`) and `TownScene` (key `ActionZoneTown`). The PLACEHOLDER Action Zone button is gone; a plain "Town" button in the Home Dojo starts the trip. Rooms load through `loadOutsideRoom` and `loadTown` (`packages/sim/src/actionZone.ts`).
- Tests: `packages/sim/test/action-zone-outside.test.ts` (14): grid matches the file; the artist's blockers are kept (only `tree-3` added, only four cells carved); every walkable tile is reachable by tap from the town spawn; the doorstep is reached by tap and by stick; both exits are reachable; solid blockers cannot be entered; the pack is day only; a broken file throws.
- Suite: 1186 passed, 11 skipped (112 files passed, 3 skipped); typecheck and build exit 0; the golden fixture `p-menu2-d-default-run.json` is unchanged.
- Shots (667x375 and 844x390, reduced motion on and off, setting read back first): 4 runs x 27 checks, 108 pass, 0 fail (button fit, fades, camera clamps, hero hidden behind the shrub and visible in front of shrub and bed by pixels, cues, door tap, exit and return, both town exits). Inside re-run on the new `WalkScene`: 4 x 18 checks, 72 pass, 0 fail. Contact sheets: `/workspace/shots/a4-dojo-ii/contact-sheet-*.jpg`.
- Not in this PR: a layered, walkable town; other town buildings; a designed door from the Home Dojo to the town; dusk art.

## A4-DOJO-hotfix — choppy dojo, stuck Sensei line, fresh load (2026-10-31)
- Bug 1: buttons and exit cues are baked once into textures (`ui/button.ts`, `ui/exitCue.ts`); walking scenes re-sort and re-show only on change. Median frame cost (667x375, motion on) 1.2 -> 0.2 ms Home Dojo, 0.4 -> 0.2 inside, 0.5 -> 0.2 outside, 0.5 -> 0.1 town; same at 844x390 with reduced motion.
- Bug 2: the step-back banner ("Three great counters! ...", B-MASHER-2) now goes away after 2.2 s. Before: still up at 7 s, both motion settings. After: gone by 2.3 s, both settings, two sizes.
- Bug 3: not reproduced; tests pin the routing. Decision notes in `docs/decisions.md`.
- Tests: `packages/sim/test/a4-dojo-hotfix.test.ts` (11); `p-menu-c-buttons.test.ts` pin updated for the baked outline. Suite 1197 passed, 11 skipped; typecheck and build exit 0; golden fixture unchanged.

## A4-DOJO-ii-fix — Action Zone walking fixes (2026-10-31)
- Exits line up with their glows (one source: the room file, checked by the loader), both glows on screen at 667 wide, a press on a glow walks even under the stick, the doorstep opens only on a push up or a tap on the doors, the inside spawn is 2 tiles from the door, collision gaps tighter. Stronger glow kept baked.
- Town button in the Home Dojo is still the PLACEHOLDER way out.
- Tests: `action-zone-outside.test.ts` and `action-zone.test.ts` updated and extended (wantsThrough, cue loader check, spawn distance, source pins). Merged main 35aa0c2f (the hotfix's baked buttons and cues carried forward).
- Next: Jay: play on the preview link and check the glows and the doorstep.

## Q-PREMIUM-2-fix — routine findings from the premium pass (2026-10-31)
- Fixed the 16 routine findings (H2, M3, M6, M7, M9, M10, M12, L2, L3, L4, L5, L7, L8, L9, L10, L11) as far as the rules allow; partials and skips are listed in `docs/decisions.md`. L8 is investigate-only (no change).
- Tests: `packages/sim/test/q-prem2-routine.test.ts` (new) and `q-prem-f6-again.test.ts`, `p-menu-e-buttons.test.ts` updated. Golden fixture unchanged.
- Next: Jay: play the preview on a phone (Board, Create, tutorial, Practice room, a knock-out); the Manager checks the shots in `/workspace/shots/q-premium-2-fix/`.
- QA follow-up on #400: the testing-screen Close works after the list is scrolled (Close on top, off-view rows not tappable, Close label centred), tapping the middle of the inside exit glow leaves the dojo, and the Training Points line no longer overlaps Virtues. Tests are in `packages/sim/test/q-prem2-routine.test.ts`.
- N1 fix: the testing screen reads the pointer in scene units (worldX / worldY), so its buttons, rows and scrolling work at DPR 1.5 and 3. No other client file had the bug.


## PB-01 — Loadout v2, sealSlots(belt), the slot seed (2026-11-01)
- `Loadout` has five slots (`stance`, `virtue`, `strike`, `kata`, `seals`); old two-field and `{ form }` saves load unchanged. New `loadout.ts`: `sealSlots(tier)` (2/2/3, then 3, 3, 4), Seal equip, swap and remove rules, `normalizeSlots`, and the once-only seed (`migrateLoadoutV2`, `seedLoadoutV2`, guarded by `profile.loadoutV2`, with a `showSlotNote` flag). Types for Seal families, Strikes and kata powers are in `abilities.ts`.
- No fight, UI or balance change: golden fixture unchanged; Power and Health are the same before and after the seed (tested on Yellow, Green and Orange).
- Not wired yet: the seed waits for PB-02 (families) and PB-03 (Strikes), see `docs/decisions.md`.
- Tests: `p-prog-a-loadout-save`, `p-prog-b-seal-slots`, `p-prog-f-migration` (34 new). Suite 1276 passed, 11 skipped; typecheck and build exit 0.
- Next: PB-02, PB-03, PB-04.


## PB-02 — Seal families, ranks and the Seal slots (2026-11-01)
- Seals are now families (Escape, Counter, Guard, Throw, Disarm, Lock) in `content/abilities/seal-families.json`; rank = signed-off techniques in the family. `characterSetup` uses only the families in the Seal slots, plus the Strikes and gear. Four new effects: `counterHits`, `counterPush`, `reflectStaggers`, `disarmAttacks`. Throw and Lock are off (`live: false`).
- `seedLoadout()` (client `game/student.ts`) runs `seedLoadoutV2` once at boot and before a fight.
- Golden fixture re-captured on purpose (a null loadout has no Seals); see `docs/decisions.md`.
- Gaps: no UI to equip Seals until PB-05; #16 and #20 are not in a family; Strikes are not seeded yet (PB-03).
- Next: PB-03 (Strikes), PB-04 (kata powers), PB-05 (equip screen).


## PB-03 — The Strike slot (2026-11-01)
- New `content/abilities/strikes.json` and `strikes.ts`: Spin Kick (default, byte-for-byte today's Strike), Jumping Spins (3 hits), Butterfly Flow (one delayed hit). A Strike is earned with the kick combo of the same number. Old ids map by combo: `follow-up-kick` -> `spin-kick`, `quick-combo` -> `jumping-spins` (`legacyIds`).
- The two always-on Strike upgrades are retired. `characterSetup` now returns `strike` (the equipped Strike or Spin Kick). The fight reads it; delayed hits queue and land on the same enemy.
- `strikeSeeded` + `seedStrikeSlot` fill the Strike slot once for saves PB-02 seeded. `seedLoadoutV2` fills it for saves not yet seeded.
- Golden fixture re-captured on purpose (setups only; every run identical).
- Gaps: no equip UI until PB-05; Jumping Spins and Butterfly Flow numbers are placeholders for PB-09; no Trophy Case entry for combo 3.
- Tests: `p-prog-d-strike` (22 new) plus fixes to five older tests.
- Next: PB-04 (kata powers), PB-05 (equip screen), PB-09 (balance).

### PB-03 follow-up: the Tester's 5 low notes (2026-11-02)
- The stale empty text and the "Always with you" heading now read "Your Strike" / "Your Strike shows up here." on the Fighting Style, Gear and Run tab screens. The Run tab row now shows the empty text when there is no Strike.
- Stale "always on" comments in `HomeScene.ts`, `fightingStyle.ts` and `profile.ts` fixed.
- `familyRank` returns 0 for a family that is not live (test added).
- Golden runs never apply effects (pre-existing): noted in `docs/decisions.md`, no code change.
- Tests: `p-prog-d-strike` (+1), `p-prog-c-seal-ranks` (+1 check), `p-menu2-f-gear` (heading).


## MENU-BAG-01 — The Bag screen (2026-11-02)
- New full-screen Bag, opened by a **Bag** button on the Gear tab's filter row: 6 x 4 = 24 slots a page at 667x375, 844x390 and larger, ≥44 px tiles and controls, ◀ Back, slot filters, ◀ ▶ paging when there are more than 24 items, faint outlines for empty slots.
- Tap a tile to pick it, then Wear / Take off / Let go / Details in the same sheet as the Gear tab (rows 0-1 get the sheet at the bottom, rows 2-3 at the top, so it never covers the picked tile). Wear gives a small pop on the tile instead of the flight to the doll.
- One tile drawing (`gearTile`) for both screens. Layout is pure data in `ui/gearBoard.ts` (`bagScreenLayout`, `bagTileBox`, `BAG_SCREEN`).
- The Gear tab's own grid is unchanged. Whether to drop it is Jay's call.
- Tests: `menu-bag-01.test.ts` (layout at 5 sizes, header, sheet never covers the pick, paging, wiring).
- Shots: `/workspace/shots/menu-bag-01` (not committed).
- Tester note folded in: the top Gear sheet is lifted 8 px at 667 wide so it clears "Your Strike" (`gearSheetBox.lift`, tests in `menu-bag-01`).
### G2B12-FIXES: the Green playthrough fixes (2026-11-02)
- Door banner: one fixed pill at the top centre, readable at 667x375, hidden behind the Insight picker and menus.
- Home path card: no "▶ Video soon".
- First visit: the Welcome Week card waits for the second visit, so a first visit is four cards, not five.
- Favicon (svg + ico) so the browser stops asking for a missing icon.
- Fake student seed: Green (24/28) now shows Level 30 and 3 worn Rares on the testing screen.
- Gear sheet no longer covers the "Your Strike" row at 932x430; "Always with you" comments removed (Tester's low notes from #425).
- Tests: `g2b12-fixes` (10). Shots in /workspace/shots/g2b12-fixes with `pass-fail.md`.

### LOOT-B3-01: Ember Kitchens drops are live (2026-11-02)
- Orange belt enemies (Spark Sprite, Doughling, Dough Blob, Ladle Lobber, Rolling Pin) now drop gear at the #431 rates; a run drops about as much as a belt 1 run (1.04x).
- Test: `loot-b3-01` (10).
### MENU-BAG-01 B1 follow-up (2026-11-02)
- Bag paging uses its own `bagPage` field; ▶ and ◀ work at 1024x768 with 30 and 60 items (real taps, Reduced motion on and off).
- 667x320: the sheet for a row-1 tile hides less of it, and a second tap closes it.
- Tests: menu-bag-01.test.ts is now 25 tests. Shots: /workspace/shots/menu-bag-01/*fix1*.
### C430-FIXES: the Content Designer's #430 trio (2026-11-02)
- Thunder Drum's name and bar no longer cover Virtue (or any action button) at 667x375.
- `stationary: true` enemy flag; thunder-drum, sleepy-sentry and thorn-sprout use speed 0.
- The sim models Bellows Puff's no-damage push (Hit slide, Block hold, wall stop, `push` event). A Puff room costs 0 Health.
- Tests: `k31-boss-tag` (+3), `c430-stationary` (4), `c430-push` (5), `puff-push` balance report (gated). Shots in /workspace/shots/c430-fixes with `pass-fail.md`.
## ZAPKITE-ZIGZAG: the Zap Kite's zig-zag lane (2026-11-02)
- Added the baked zig-zag lane (glow, fill, edge) to `incoming-art/dash-telegraph`, from `source/zigzag.json`. After the #444 reviews it shows the true hit capsule, 4.2 long x 1.2 wide (reach 3.0 + 2 x areaRadius 0.6, 2 x areaRadius), with the zig-zag band clamped to stay inside it (stroke 0.5, swing 0.3, 4 corners). `make_zigzag_preview.py` draws it at 667x375 (motion on, motion off, greyscale, GIF). Not imported into the game yet.
- Tests: `zapkite-zigzag.test.ts` (7), including a pixel check that nothing is drawn outside the capsule. Previews in /workspace/shots/zapkite-zigzag with `pass-fail.md`.

### GUARD-SCALE-01: bigger Guardians (2026-11-02)
- Guardians draw, collide and reach 1.5x (Stone Giant and Lost Lightbearer 1.75x, not live yet). Factors and the zoom numbers are in `content/settings/guardian-scale.json`.
- Body and danger circles scale fully; reach and start range take half the extra radius (`reachGrowth` 0.5 in the data), trimmed so B5 belt 4 (46.0 gate) passes as on main.
- A held 0.9x zoom in Guardian rooms (placeholder in data, Jay to pick) keeps the head under the HUD at 667x375; it also applies with Reduced motion on.
- Dodge check at 667x375: farthest escape from a red circle 1.25 to 1.79 tiles, a Dash is 2.5.
- Camera eases out to 0.8x when the Guardian walks into view; no zoom with Reduced motion on.
- Golden fixture re-captured (boss rooms only); one noisy test uses 300 seeds.
- Tests: `guard-scale-01` (15). Shots in /workspace/shots/guard-scale-01 with `pass-fail.md`.
### START-LEVEL-PIN: start-level rule pinned by tests (2026-11-02)
- Test-only: new profile, empty/old save and every belt entry stay Level 1 / 0 XP; a Green entry earns level only through `gainXp`; belt-entry check-offs are signed off; picks come from check-offs, not level.
- Tests: `start-level-pin` (8).
### START-LEVEL-PIN-GAPS: start-level tests tightened (2026-11-02)
- Test-only: added "old save without level or XP loads at Level 1 / 0 XP" and "a feed sign-off shows as signed off"; the belt-entry test now runs the profile through `gainXp` so it can fail. `start-level-pin` is now 10 tests.
### J27-APPLY (2026-11-08)
- 12 live seal/strike renames applied (old names in altName). Tests: training, p-prog-d-strike updated.
- New Advancing seal family; #4 moved there from Escape (shows "Self-Defense #4" until Jay names it, counterPush 1.5). No save migration or heads-up: pre-beta (Dec 4), no real student saves.
### G2B-04: Throw live; Lock caps (2026-11-08)
- Enemy `thrown` state; #11 Outside Reap throws a brute or swarmer down 30 ticks, #12 Reap and Finish +25% while down. Never Guardians or elites. Hold after a Perfect Counter capped at 24 ticks (Arm Wrap 30 -> 24); Seal staggerBonus capped at +20%.
- Tests: `g2b-04-throw` (9); `abilities`, `p-prog-c-seal-ranks`, `r-challenge-p2` updated.
- Knock-down look (tumble, lie, get up; RM snaps) and kid-words Throw card. Tests: `g2b-04-thrown-look` (5). Shots: /workspace/shots/g2b-04-thrown.
### BF-ORANGE-UNLOCK: Butterfly Flow at Orange (2026-11-08)
- Strikes now name their belt in `strikes.json`; Butterfly Flow unlocks with the Orange kick combo, not at Green. Jay's decisions J10, J16, J19, J21 (partial) and J27 recorded in decisions.md.
- Tests: `bf-orange-unlock` (9).
### GUARD-SCALE-01 QA fixes (2026-11-08)
- Boss dip total is 0.80 (was 0.72 stacked on the held 0.9); Reduced motion snaps to the held 0.9 with no dip; a Guardian at the north wall is drawn whole under the HUD, dip included. Tests: `guard-scale-01` +3. decisions.md view size corrected to 13.33 x 7.5.

## PB-05 — Fighting Style slot cards (2026-11-11)
- The Fighting Style screen now has Stance, Virtue, Strike, Kata and the Seal cards. Tap a card, then a pick. A full Seal row asks which card to swap. Lock says "Coming later". A kata says "Power coming soon" and does not change a fight. New dots, one help line per visit, and no pulse when Reduced motion is on.
- Approved slot pictures are in `assets/art/slot-icons/`. Escape, Throw and Advancing still use a plain disc.
- Tests: `p-prog-g-style-screen`, `p-prog-h-no-pressure-words`. Phone check 352 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off, including padding, contrast, occupancy, New-dot frames, and equipping Strike and Virtue (`docs/shots/pb-05/pb05-verify.mjs`).
- QA entry: a Testing button on the Training Board (under Practice room) opens that same fixture screen in one click. Five title taps still work. A beta build does not draw the button (`b-safe` source pin, and `docs/shots/pb-05/beta-entry-check.mjs` on the beta bundle).
- Switch contrast: the selected Fighting Style label is white on the wood frame brown, 6.00:1 from rendered pixels at both phone sizes (it was 4.15:1 on the gold fill). Got it uses that same brown.
- Slot note: it shares the line under the cards, so it stays inside the wood. Focused harness `FOCUS=gaps` is 244 PASS, 0 FAIL. Log: `/opt/cursor/artifacts/pb-05-note/verify-log.txt`. Painted occupancy with the note up is 41.6% (844) and 48.9% (667). Content is 12 px inside the frame.
- Not changed: the green-belt HUD still shows Beginner's Stance until one is equipped. See `docs/decisions.md`.
- Still for Tester: White, Orange, Help, Got it, New dots, geometry, contrast and animation. The Yellow checks from the phone pass stand. Not a merge pass.
- QA fixes (2026-11-14): Testing now sits beside Practice room, so the next-step card is whole at 667x375 (the extra row had cut it off). The Testing screen has an "Old save (show slot note again)" row: it makes the save one from before Seal slots and runs the real one-time seed, so the note, Got it and the waiting help line can be checked on a deployed build. Phone check `docs/shots/pb-05/board-oldsave.mjs` 56 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off. Beta bundle check still PASS.
- Next: PB-10 can run the phone test plan. Kata powers still wait on Jay (PB-11) and PB-04.

## OV-B1 — Sensei's Pick (2026-11-14)
- When a sign-off earns a new Kick or Seal, Sensei puts it in the moves after the sign-off celebration. One line per move: "Sensei added Counter to your moves!", or when the slots are full "Throw is in. Escape is resting." (it names the Seal that came out).
- Sensei's Pick is on by default. An On/Off switch sits on Fighting Style (hidden on Guided). Off means new moves only say "ready", and the player's own choice is kept.
- The first check after this update only records what was already earned, so old saves never move. Each move is picked once.
- A one-time lesson rides in that step the first time Sensei picks something.
- Tests: `ov-b1-sensei-pick` (8) and the lessons test. Phone check `docs/shots/ov-b1/sensei-pick.mjs` 80 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off.

## OV-B7 — Grown-up belt fix (2026-11-14)

- The belt screen behind the grown-up gate now shows the OV-C2 parent note: a grown-up should set the belt, not the student.
- A "Fix a mistake" button opens "Fix the belt". In it every belt can be picked, down to what the dojo's own data shows. It asks "Change the saved belt to {entry}?" with the buttons "Keep {belt}" and "Yes, fix it".
- After a fix lowers the belt, the child sees "Your belt was updated." Gear, items and levels are kept.
- A normal Save still only raises the belt. The old "can't be lowered later" line now says "If it is wrong, a grown-up can fix it here."
- Tests: `ov-b7-belt-fix` (4), plus the B-BELT and start-level tests. Phone check `docs/shots/ov-b7/belt-fix.mjs` 108 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off.
## OV-B5 — Dojo Blessing counted in runs (2026-11-14)

- The Dojo Blessing now counts Tower runs, not hours (review 8.6). Each new class date adds 5 runs, and the Blessing holds at most 10. Each counted run uses one when it starts. Test-link runs and the tutorial floor use none.
- No clock text anywhere. The Training Board shows "Blessing on for {n} more runs.", "…one more run.", or "Blessing ready for ten Tower runs." at 10. Nothing is shown when it runs out.
- A new class plays the Blessing card with "Class time helps your next five runs!", or the full line when the Blessing was already at 10 (OV-L1). The promotion card says "Dojo Blessing for your next five runs!".
- Words: `content/settings/blessing.json` (OV-C2 with the OV-L1 changes). Numbers: `BLESSING.runsPerClass` and `BLESSING.maxRuns`.
- Tests: `ov-b5-blessing` (5) and the training test. Phone check `docs/shots/ov-b5/blessing.mjs` 76 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off.

## OV-B3 — Ages 6–9 start on Guided (2026-11-14)

- A new profile in an age band listed in `content/settings/difficulty.json` `guidedStartAgeBands` (now `["6-9"]`) starts on Guided. Other ages start on Standard ("Steady"), as before.
- Standard is one tap away: Dojo Settings, then Steady. The pick sticks after a reload.
- Saves that already have a difficulty never move.
- Tests: `difficulty` (new start-band and old-save cases). Phone check `docs/shots/ov-b3/guided-start.mjs` 60 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off.

## OV-FX1 — Dojo stuck after Settings during the arrival (2026-11-14)

- Fixed: tapping Settings (or any top-row button) while the bow and arrival played, then leaving Settings after the arrival (for example For grown-ups, then Back), left the Dojo with no top row and no walking until a reload.
- A Dojo button now only acts in the mode it was drawn for, so the top row does nothing during the bow and arrival. It works again as soon as the walk-in ends.
- Music and Sound − and + buttons are at least 44x44 at every size (they were 43x44 at 667x375).
- Phone check `docs/shots/ov-fx1/settings-arrival.mjs` 44 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off. On main it fails 36 checks (stuck in `arriving`).

## OV-B6 — 12 Power-ups, OV-P5 numbers (2026-11-15)

- Four new Power-ups join the pick screen and Wind Step leaves it (OV-P5, #511), so the pool is 12: Quiet Mind (Focus fills faster), Warm Up (start every room with some Focus), Swift Strikes (Strikes use less Focus) and Iron Block (blocks stop more of the hit).
- Each has its own icon from #485 (Iron Block shows the steel arm).
- The Rooted and Flowing families are now called Guard and Speed, which the card's top stripe shows.
- OV-P5 numbers: Press the Advantage 0.4 (card text "40% harder"), Shield Breaker 12 Focus, Double Strike 0.3, Warm Up 60, Swift Strikes 7, Iron Block 0.12.
- Tests: `insight-budget` CAPS rows match OV-P5 (no Wind Step row), every family has at least 2 cards. The golden run is re-captured for the 12-card pool. The two R-CHALLENGE P5 bot-answer checks keep the 9-card pool they were measured on, frozen in `r-challenge-p5-nine-cards.json`. Rule A (the comboSpeed effect) keeps its test with Wind Step's old numbers, since the effect type stays. Phone check `docs/shots/ov-b6/powerups.mjs` 172 PASS / 0 FAIL at 844x390 and 667x375, Reduced motion on and off.
## PB-04 — Kata power slot with placeholder powers (2026-11-15)

- `content/abilities/kata-powers.json` has one power each for Basic Form 1, Basic Form 2 and Keon. All three are placeholders until Jay's list (PB-11), so they change no fight.
- A kata power is earned with its kata's teacher sign-off. The Kata card on Fighting Style shows the earned powers ("Power coming soon"), and one goes into each run.
- A final power is data only: set `status` to `final` and list its effects. The game checks it when the data loads. Only passive types are allowed (`PASSIVE_EFFECTS`), and the biggest Stance plus the power must stay at or under +12% damage.
- Kata picks saved before this (the kata id) switch to that kata's power, without the New dot coming back.
- Tests: `p-prog-e-kata-power` (new, 12), with `p-prog-b`, `p-prog-f` and `p-prog-g` updated for earned kata powers.

## LP-B1 — One Path screen (2026-11-15)

- Home now opens on one Path screen (review L1, mock #495, learning notes #490). It replaces the Gate tab, the Path card and the goals card; the Tower map was never built.
- Left: the Tower, one floor per belt, with your character on your belt's floor (▲ and ▼ scroll it). Top right: the Gate to your next belt (locks, classes sundial, Sensei's Seal). Below: "Your next class step" (the biggest card) and "Next in the game" with Enter the Tower.
- A Board button opens the Training Board (Last run, Gear, Abilities); its ◀ Path button comes back. Straight after a run or a knockout, Home opens on the Board so the run results show first.
- Players who had the old screens see "This is your Path." once over the class step; OK saves it. New players skip it.
- FAITH DOES is not on the Path yet (L5).
- Words: `content/settings/path.json` (placeholders, Content owns them).
- Tests: `lp-b1-path` (new, 13); `goals` removed; `p-menu-*` updated. Phone check `docs/shots/lp-b1/path-verify.mjs` 231 PASS / 0 FAIL at 667x375, 932x430 and 844x390, Reduced motion on and off, White and Green.

## LP-B2 — The faith layer, L5 (2026-11-15)

- The school's approved faith pack is in `content/faith/action-zone.json`, unchanged from LP-C1 (Jay-approved Nov 14), with the wall wording.
- The Path's title is now the FAITH DOES banner: one letter lights at each promotion from Yellow to Black. Tapping it opens the Faith page: the banner (each lit letter with its word and meaning), the Creed Scroll, and each verse scroll found so far with its covenant.
- A promotion ceremony is at most 4 screens: the bow, the Gate, the verse scroll (verse, covenant name large, Sensei's question), then everything new, which now says which letter shines.
- The Creed Scroll shows once, after the first class check-in (`creedSeen` in the profile).
- A freed Guardian with a line in the pack says it (only the Hearth Cook has one today).
- Tests: `lp-b2-faith` (new, 11), including the word-for-word check against the pack and `docs/faith-and-creed.md`. Phone check `docs/shots/lp-b2/faith-verify.mjs` at 667x375, 932x430 and 844x390, Reduced motion on and off.

## LP-B1b — My Path words come from data (2026-11-15)

- The Dojo tour line, the wall label (MY PATH), the Dojo button (My Path), the grown-ups hint, Home's top-level line and the promotion summary's powers lines now read `content/settings/path.json` (LP-C4, #505). The old Gate and Board strings are gone.
- Tests: `lp-b1b-path-words` (new, 3): every pointer key is used where path.json says, the old words are gone, kid lines are 8 words or fewer. Phone check `docs/shots/lp-b1b/words-verify.mjs` at 667x375, 932x430 and 844x390, Reduced motion on and off: 72 pass, 0 fail.

## LP-B3 — Class Chest every class, best-streak aura, L4 (2026-11-15)

- Every real class now opens a Class Chest, with no end: the next class piece for the Home Dojo while any are left, then one piece of Uncommon or better gear for the bag (it fills an empty slot). The old "one piece every 2-3 classes, stops at 13" is gone. No coins yet (L13).
- Arriving at the Dojo shows one card for the new chests ("3 Class Chests!"), with two drawn chests and what was inside.
- A soft gold glow around the hero, in the Dojo and the Tower, grows one ring at each step of the best weekly class streak ever (`bestStreakWeeks` in the profile). It never shrinks and nothing warns.
- The chest words and aura steps are placeholders in `content/settings/class-chest.json` for Content.
- Tests: `lp-b3-class-chest` (new, 6): 30 classes give 30 chests (one at a time or all at once), the aura never goes down, no streak-loss words in content or game code, short kid lines; `earning` updated. Phone check `docs/shots/lp-b3/chest-verify.mjs` at 667x375, 932x430 and 844x390, Reduced motion on and off: 72 pass, 0 fail.

## LP-B3b — Class Chests for classes the feed window dropped (2026-11-15)
- After a long time away, the feed only lists recent check-ins, so 20 new classes with 8 still in the window gave 8 chests (Tester note on #509). `openClassChests` now opens the larger of the new dates and the growth in the feed's `classesTotal`. Test: 10 classes, then 30 with 8 in the window, gives 20 chests, then 0, then 1.

## LP-B4 — coins and the Stage 1 looks shop (2026-11-15)
- Finished runs and Class Chests now give coins (`profile.coins`, old saves start at 0). The Class Chest card says "+150 coins for the shop!".
- A **Shop** button on the Path's top bar opens the looks shop: 12 gi colours and 8 hair colours (200 coins each, belt 1 or 2), each previewed on the hero, with the coins before and after, one tap to get it, then wear it or go back to "My color" any time. Words and colours are placeholders in `content/shop/catalog.json`.
- No real money anywhere: no billing or ads package, no money signs, no timers; coins only go down when a look is bought.
- Tests: `lp-b4-shop` (14) and `balance/coin-rates` (4 quick cells, the whole table with BALANCE=1). Phone check `docs/shots/lp-b4/shop-verify.mjs` at 667x375, 844x390 and 932x430, Reduced motion on and off.

## LP-B4b — effects and wall paint in the looks shop (2026-11-15)
- The Shop now has tabs (Looks, Trails, Pops, Dojo) and sells the rest of the Stage 1 catalog from R-SHOP 3.3: 10 walk trails, 4 dash puffs, 8 hit pops, 6 win bursts and 6 wall paints, each with a free "None" or "Plain wood". Names, prices and belts follow R-SHOP; colours and effect recipes are placeholders in `content/shop/catalog.json`.
- Effects are drawn in code (no art files): a trail behind the hero while walking (runs and Home Dojo), a puff when dashing, a pop when the hero's strike lands, a burst on Home after a cleared floor. Wall paint tints the Home Dojo's back wall.
- Looks only: effects never touch the fight (the sim hash and stats are unchanged). Caps: 24 pieces, short lifetimes, no flashes. Reduced motion shows one still picture under half a second, and no trail.
- Each item is previewed on the hero in the Shop. "Wearing" is now plain text (fixes the Tester's contrast note).
- Tests: `lp-b4b-effects` (6) and `lp-b4-shop` (15). Phone check `docs/shots/lp-b4b/fx-verify.mjs` at 667x375, 844x390 and 932x430, Reduced motion on and off (shop, a real run, the Dojo wall), plus `contact-sheet.png` of every effect and paint next to the hero. `docs/shots/lp-b4/shop-verify.mjs` is kept as history; it predates the tabs.
- Art gate fix: every effect now has a darker edge and holds full strength longer; the faint puffs, hit pops, snow and confetti trails and win fireworks are bolder (`docs/shots/lp-b4b/before-after.png`).

## LP-B5 — L7: fewer buttons in a fight (2026-11-15)
- No STANCE button in a fight; the stance is the one picked before the run. Style screen line is now "Pick your stance before you climb."
- VIRTUE shows only at full Focus, in its usual spot, with a short calm grow (none with Reduced motion). A white belt sees at most 4 buttons (3 until Virtue is ready).
- New first-time line "Your Focus is full. Tap VIRTUE!" (`lesson-virtue-ready`), once ever, counted as the session's new thing, not on the Scroll.
- Tests: `lp-b5-virtue-lesson` (3), `lessons` updated. Phone check `docs/shots/lp-b5/buttons-verify.mjs` at 667x375 and 932x430, Reduced motion on and off, four student profiles.

## FX-GREAT — the GREAT! pop no longer hides the "!" (2026-11-16)
- Jay: the big GREAT was the same yellow as the "!" warning and solid, so it blocked the view.
- Rating words (GREAT!, GREAT xN, a Virtue or Insight name, big hit numbers) are sky blue (`apps/client/src/ui/ratingWord.ts`), never the cue's gold or red, at 75% opacity with a thinner outline. GREAT! is 34 px (was 54).
- The pop picks the nearest clear spot to its usual place, off every enemy, "!" cue, the hero and the action buttons (as well as the doors, chest, Sensei's banner and room name it already avoided). Reduced motion: no grow and no drift, just a fade.
- Tests: `fx-great` (5). Phone check `docs/shots/fx-great/great-verify.mjs` at 667x375 and 932x430, Reduced motion on and off, a White and an Orange profile, with an enemy on the usual spot and a crowd of three winding up (224 pass, 0 fail).
- QA fix (#530, Tester: with the Wave 2 banner up GREAT! could sit on a "!"): placement now lets go of things in order of importance (doors and banners first, then the hero and buttons, then other words, then enemies) and never of the "!" cues. A "!" that turns up under the word later hides the word until it's clear. An older word like "Wave 2" makes way if the two would pile up. Shot check adds Wave-banner and late-"!" cases (329 pass, 0 fail; a NOTE line marks crowded cases where GREAT! touches the hero).
- Manager rule after QA: GREAT! never covers a "!". If no spot clears every cue, the rating word is skipped that time (other words, like "Wave 2", still show).

## TUT-B2 — passive practice dummies (2026-11-17)
- Plan: `drafts/planning/TUT-P1.md` beats 4-5. Rules and enemy files only; the dummies show up in a real room in TUT-B3.
- An enemy file can say `"passive": true`: it never moves, never attacks and needs no attack list, but takes hits and gives the normal Focus per hit. A passive file that lists an attack, a speed, or any fight extra (boss, shield, summon and so on) is refused. The loader also refuses a passive enemy in any room that isn't `"tutorial": true`.
- Two dummies: `practice-dummy` (40 Health, about 9 hits for a new hero) and `big-practice-dummy` (120 Health). A brand-new hero's plain attacks fill Focus to the STRIKE cost with the big dummy still at about 92 of 120, and STRIKE leaves it standing at about 57, so the kid finishes it with a few more hits. Colours are placeholders until art.
- Tests: `tut-b2-dummies` (5), including the Manager's extra test (Focus reaches STRIKE before the big dummy falls).

## TUT-B1 — falling stones in the rules (2026-11-17)
- Plan: `drafts/planning/TUT-P1.md` beat 2, stone rules (a)–(e) from TUT-L1. Rules only; the stones aren't in a real room or on screen until TUT-B3.
- A tutorial room can list stone waves under `"hazards": { "stones": [...] }`, each with its spots and `fillSeconds` (the playtest setting: 1.5 s, then 1.2 s). The loader refuses stones in any room that isn't `"tutorial": true`.
- Each drop: the red circle fills first (`stoneWarn`), then the stones land (`stoneLand`). A hero still inside stumbles for 0.8 s (`stumble`, can't move, no health change) and that wave drops again. After 2 misses the circle fills 1.5x slower and gives a safe spot to stand; the 3rd miss passes the wave anyway. After the last wave, `stonesDone`, and only then does the room count as done. Other numbers live in `STONES` (`packages/sim/src/config.ts`).
- Tests: `tut-b1-stones` (5).

## TUT-B3 — the tutorial floor on screen (2026-11-17)
- New Tower Path room (grass, path, hedges, Tower foot) with the story cards, two stone waves with the red circles, stumble stars and the help arrow, then the bow at the Tower door.
- New Training Hall with three practice dummies and the big dummy; STRIKE glows when focus is full; then swarmers. First Steps Hall keeps the Brute, DASH and Insight; vault and Keep end on the close line.
- Proof: `docs/shots/tut-b3/tut-verify.mjs` plays the whole floor as a new student with real taps, 20/0 at 844x390 and 667x375. Suite 1543, both builds OK.

## TUT-B4 — tutorial fixes from the TUT-B3 playtest (2026-11-17)
- Stones: six waves (1, 1, 2, 2, 3, 3 stones) with a calm 3.2 s pause each, about 30 s when every wave is dodged; still help after 2 misses and a pass on the 3rd. Each wave's pause lives in the room file (`pauseSeconds`).
- The vault chest shows with its tip and counts the moment it opens; the door stays shut until then.
- Success lines show alone for 1.5 s before the next tip, and play waits for that tip. No room word on tutorial doors (the boss door keeps BOSS), no combo count in the Training Hall, the Shadows! tip clears with the room, and the Brute stands still under its tip until Got it.
- Home: a saved run is offered first; on "No" every welcome reward plays as before, on "Yes" they play on the bow home.
- Proof: `docs/shots/tut-b4/tut-verify.mjs`, 58/0 at 667x375 and 844x390. No wave words in tutorial rooms.

## L16-B — staff Power Rating report, 5 rows (2026-11-17)
- The Testing screen's Power Rating has 5 rows (40/10/10/25/15); Training Points fill against 28 per belt. Player power is unchanged (the golden playRun test matches).
- Proof: `docs/shots/l16-b/power-report.mjs`, 6/0 at 844x390 and 667x375.

## TUT-B5 — arrow to the HOME door (2026-11-17)
- After the tutorial close, a small gold arrow at the top edge points at the off-screen HOME door until it comes into view. Tutorial rooms only.
- Proof: `docs/shots/tut-b5/door-arrow.mjs`, the whole floor plus the arrow checks, 68/0 at 844x390 and 667x375.

## L10-B — the Book (2026-11-17)
- A Book button on the Path opens Moves (moves plus lessons and the tutorial replay), Monsters (the Journal), Faith and Trophies (stripes and monster trophies). The Dojo's Journal and Scroll buttons and the Board's Abilities tab are gone; saves are unchanged. "Last run" is now "Last climb". The TUT-B5 door arrow has a dark outline.
- Proof: `docs/shots/l10-b/` at 844x390 and 667x375; `l10b-book.test.ts` (an old save shows the same items).

## L8-B1 — Lock becomes two groups (2026-11-17)
- Lock is now Lock (arm) and Lock (wrist), both "Coming later" on the Style screen until L8-B2. Names are placeholders until Jay picks them. Unlit FAITH DOES letters and unselected wood tabs are easier to read.
- Proof: `l8-b1-lock-groups.test.ts`; shots in `docs/shots/l8-b1/` at 844x390 and 667x375.

## L8-B2 — the Lock hold (2026-11-17)
- Lock (arm) and Lock (wrist) are live: their first rank makes a Perfect Counter hold the enemy for the length of its stagger. Held enemies can't shield; Guardians, bosses and elites are never held; a throw wins. A placeholder bronze ring shows the hold. The Board opens on Last climb after the Book.
- Proof: `l8-b2-hold.test.ts`, `l10b-book.test.ts`; `docs/shots/l8-b2/hold.mjs` 30/0 at 844x390 and 667x375, Reduced motion on and off.

## L8-B3 — Seal stages (2026-11-17)
- Seals now have stages (1 to 4 at ranks 1, 3, 6, 9). A new stage plays one evolution card after the sign-offs; a returning student sees the evolved Seals on the welcome card. The Fighting Style and the Book show each Seal's stage. Words and rings are marked placeholders.
- Proof: `l8-b3-stages.test.ts`; `docs/shots/l8-b3/stages.mjs` 52/0 at 844x390 and 667x375, Reduced motion on and off.

## L11-B1 — the seven belt Guardians (2026-11-17)
- Enemy files for the Stone Giant, River Watcher, Ember Knight, Echo Mask, Root Keeper, Storm Herald and Lost Lightbearer (base 495/17/30, two counter circles, one dash-only lane, two helpers at two-thirds health). No room uses them yet, so play is unchanged until L11-B2. Fight text is a marked placeholder until L11-C2.
- Proof: `r-bal-12-bands.test.ts` (each at its own belt), `l11-b1-guardians.test.ts`, `guard-scale-01.test.ts`.

## L11-B2a — the floor-set switch (2026-11-17)
- New `content/settings/floor-sets.json` turns each own-room floor set on or off. White Dojo and Ember Kitchens are on; the seven tier 4-10 sets are off, so play is unchanged. No rooms moved.
- Proof: `l11-b2a-floor-switch.test.ts` adds the 56 L11-C1 draft rooms in test content only: with every tier off no floor changes; turning one set on gives that tier only its 8 rooms and its Guardian and leaves every other tier alone. The golden run tests are unchanged.

## Hand-over and first-week fixes (2026-11-17, Claude Code)

- Jay handed the whole project to Claude Code. Audit of everything the bot team built: `docs/reviews/claude-overhaul-audit-2026-11-17.md` (good foundation; holes listed with status).
- Fixed: Windows line endings (16 checks failed on Windows only), the type-check error, automatic checks on GitHub, and the Class Chest gear flood (at most 5 gear pieces per visit).
- CLAUDE.md, the work board and decisions updated for the hand-over.
- 1,615 tests pass; type checks and both builds pass.
- Next: CW-3 hands-on playthrough at phone sizes, CW-4 download size. Jay creates the Apple and Google accounts.

## Jay's overnight list (2026-11-18, Claude Code)

- **Dojo hub:** training station in the Home Dojo opens the Training Board (gear, style, last climb, Enter the Tower); back returns to the dojo.
- **Town:** walk out the dojo's south door and come out of your own dojo (the grey house) in a walkable town; walk back in to go home, or into the Action Zone.
- **Equipment screen:** full-screen redesign (hero with three big slots, rarity-framed scrolling bag, item cards, Wear best).
- **Desktop:** keyboard controls with key hints, layout scales up on big screens, right-click menu off, resizing mid-fight fixed.
- **Playtest notes** for Jay: `docs/reviews/playtest-notes-2026-11-18.md` (the yellow-! problem with seven ranked fixes, and 11 other weak spots). Fixed two text overlaps found on the way.
- 1,620 tests pass; type checks and both builds pass. Copied onto `main` (the live link) with Jay's OK ("copy everything to the live link when finished").
- **Next:** talk through the playtest notes with Jay and pick the combat fixes; art clean-up (see below).
- **Art draft (not in the game):** Home Dojo v2 in `incoming-art/claude-dojo-v2/`, made in Blender 5.3 with the Art Director bot's script and style: a tatami training floor and a modelled training station. Waiting on Jay's OK before import. The bot's script needed one small fix for Blender 5 (noted in the copy).

## Training station in the top-right corner (2026-11-18)

- Jay's OK on the station art; tatami turned down. The station art replaces the code drawing and stands in the top-right corner; the dojo shows the whole room while walking.
- Fixed the art import tool deleting other packs' pages. 1,620 tests pass.

## Art review and run draft (2026-11-18)

- Reviewed the character screen, town, Guardians and the hero's run with Jay; his answers are in decisions.md (sharp spikes OK, two-phase Guardians with a big visual change, final boss keeps three forms; order: run, character screen, Hearth Cook, town).
- **New run in the game (Jay's OK):** `incoming-art/claude-run/`, a real run on the same Blender model (lean, arm pump, knee drive, flight), 12 frames at 36 fps, both bodies, swapped into `player-custom` and re-packed. 1,620 tests pass; type checks and both builds pass.
- **Next (Jay's order):** character screen mockup, then the Hearth Cook as the first two-phase Guardian, then the town.
- Character from a photo: possible later; Jay will revisit after everything else is built.

## Jay's tutorial playtest fixes and visual overhaul, part 1 (2026-11-18, branch `claude/tutorial-playtest`)

- **Tutorial:** Sensei explains the stones ("The Shadow feels you coming. It shakes the Tower!"); stones come in 5 waves (1, 3, 3, 4, 5), one always where the hero stands; the bow happens on a glowing mat in front of the Tower door, facing it, and the door only lets you in after the bow.
- **Fights:** the Opening (fix A): after a Great Counter, STRIKE glows gold for 1 s, a free finisher that knocks the enemy back (not through walls) and bumps others. Not after a ground slam. A smaller "!" (fix C); the big floating "!" only on the tutorial floor; enemies warm up in colour as they wind up.
- **Chest v2:** new Blender chest (`incoming-art/claude-chest/`, same kit and camera), coins fly out; in code a charge ring, a flash and a centre reveal card with rays and confetti ("NEW GEAR!" for plain prizes).
- **Glossy buttons** everywhere (menus and fight buttons). **Character creation redesign** (stage, tabs per part, Surprise me!).
- **Design draft:** `docs/tutorial-design.md` (full tutorial, Home Tour, First Week): waits on Jay's OK.
- 1,627 tests pass; type checks pass. Not yet on `main`.
- **Next:** restyle the remaining menus (Book, Board, Shop backgrounds and the wood frame, `woodFrame` and `WOOD` in HomeScene/theme; `p-prog-g-style-screen.test.ts` pins a WOOD contrast) to match Equipment; Jay playtests; then build the Home Tour once the design is approved.
- A stray folder `C:\incoming-art` (temporary render files from one wrong path) can be deleted by Jay.

## Jay's playtest round 2 and the Training Board overhaul (2026-11-18, branch `claude/tutorial-playtest`)

- Faster stone waves; the tutorial boss now leads to the Home Dojo and a short **Home Tour** (dojo, town, back to the Training Station); closer dojo and town cameras; the "!" badge only on Easy; a new sparkly chest sound.
- **Training Board overhaul** to the Equipment screen's violet glass look.
- **Art audit** with scores and a 10-item rework list: `docs/reviews/art-audit-2026-11-18.md`.
- 1,627 tests pass; type checks pass. Not on `main` yet.
- **Next:** Jay plays the tour and the new board on the preview; OK (or new words) for the tour lines; pick the first art rework (recommended: the tier-1 enemies).
- **Art rework item 1 done: the Shades** (new White belt monsters, sharper and 25% bigger), after three drafts Jay turned down (bright, night, Shades v1). Next art: Journal stickers and trophies to match, then the Home Dojo room and mats.

## The town redesign (2026-11-18, branch `claude/tutorial-playtest`)
- New, much bigger martial-arts town (46 x 30 tiles): wide main street, open plaza with the statue and sakura, practice yard, torii gate and garden, My Dojo and the koi pond. Rendered in Blender as separate pieces so the hero walks behind things.
- The town gets nicer with every real belt (10 stages; see decisions.md). Previews: `incoming-art/claude-town/previews/town-stage-1|5|10.png`.
- Test links: `?room=town&townstage=10&crowd=20`.
- 1,631 tests pass; type checks and the build pass. Not on `main`.
- **Next:** Jay walks the town on his phone (stages 1, 5, 10 and a crowd), OKs or changes the art; then drop the old `dojo-az-town` pack and copy to `main`.
- Nov 19: the real Action Zone (CMA Martial Arts) building is in the town at true size, rebuilt with much more detail and rendered twice as sharp. Close-up: `incoming-art/claude-town/previews/action-zone-closeup.png`. Next: Jay's OK; then maybe re-render the entrance scene to match.
- Nov 19 (later): Jay's detail fixes (logo, bench, chair, back trees), the Tower in the background behind a gate at the end of a new path, and the warm night town (7 pm-6 am, `?night=1`). Previews (day and night, stages 1, 5, 10) in `incoming-art/claude-town/previews/`. 1,632 tests pass. Not on `main`. Next: Jay's OK; night for the Home Dojo and the entrance scene if he wants it.
- Nov 19: Jay OK'd the new town ("Yes, copy to live"). Copied onto `main` (the live link) after the checks passed. The old `dojo-az-town` picture pack can now be dropped in a clean-up.

## The Action Zone inside room, v2 (2026-11-19, branch `claude/az-inside`)
- The real dojo's inside room rebuilt with much more detail from Jay's photos, over four rounds of his notes (see decisions.md). In the game as pack `dojo-az-inside` (2 pages, 1.0 MB; was 0.8 MB). Test link: `?room=dojo`.
- Fixed on the way: the see-through floor shadows were rendered as a faint haze into every furniture sprite (no trimming, 10 pages); they are now left out of the sprite renders.
- 1,632 tests pass; type checks and the build pass. Copied onto `main` with Jay's OK ("put it in").
- Jay can delete a stray test folder `C:\samples` (one picture; the safety check would not let Claude remove it).
- **Next:** night for the inside room if Jay wants it; the old `incoming-art/action-zone-dojo` inside sprites are no longer used by the game.

## The Action Zone inside room: things to do (2026-11-20, branch `claude/az-inside`)
- Belt verse board belts redrawn from Jay's photo; red box made one solid red (re-rendered and re-packed).
- New in the room: Read (creed and belt board large, X top right), Bow on and off the mat, the Star Wall throwing star game, and Train at the three bags (unlimited hits). Details in decisions.md.
- 1,641 tests pass; type checks and both builds pass. Copied onto `main` (the live link) with Jay's OK ("Yes, copy to live"), after the checks passed.
- **Next:** Jay's notes from playing it on his phone (he may redesign the Star Wall).

## Kata practice (2026-11-20, branch `claude/kata-practice`)
- Stand in the middle of the logo on the Action Zone mat: "Practice Kata" opens a menu of the katas you've reached, with a Time Trial switch. The hero bows in, takes the Open Leg Stance, and you tap the arrow, then the move, for every beat. Misses are counted with a gentle buzz, right moves get a satisfying sound, and the right button glows after two misses. Small finish card with bests. Details in decisions.md (D1 lifted).
- Beats written for Basic Form 1, Basic Form 2, Keon, and David and Goliath, from the school sheet. 1,649 tests pass; type checks and both builds pass. Not on `main` yet.
- **Next:** Jay checks the beats for the four katas and plays it on his phone; Jay sends Pinon 1–3, Nahanchi and Possi; Blender work for the real kata moves (Open Leg Stance, the blocks, Reverse Punch, Backfist, Palm Down / Spear Hand, Rear Leg Front Kick, Break the Hold).
- Jay's notes (Nov 20): menu polished (belt badge per kata, step count, gold frame, a Time Trial slider, a star for a no-miss run); Jay's terms used everywhere (Open Leg Stance, High Block, Rear Leg Front Kick, Break the Hold); new buttons Reverse Inside Block (now in Keon and David and Goliath, as the sheet says) and Palm Down / Spear Hand (waiting for a kata that uses it).

## Kata moves art draft (2026-11-20 overnight, branch `claude/kata-moves-art`)
- Researched every kata technique and the three stances (`docs/kata-technique-reference.md`, with 7 questions for Jay).
- Animated in Blender on the approved hero: Open Leg Stance, front, horse and cat stances (loops), plus Low Block, Inside Block, Reverse Inside Block, High Block, Punch, Reverse Punch, Backfist, Palm Down / Spear Hand, Rear Leg Front Kick and Break the Hold (two versions: David and Goliath step 2 and step 12). Body A rendered; previews in `incoming-art/claude-kata-moves/preview/`. Not in the game.
- **Next:** Jay reviews the previews and answers the questions; once approved, render body B, import the sheets and swap the stand-ins in `content/dojo/kata-moves.json` (the game holds each move's last frame and flips the sprite for right-side moves).
- Nov 21: Jay's notes applied (inside blocks outside to inside, sloped high block, backfist stops by the cheek, spear hand's palm-down hand tucked closer, open-leg hands further out, wider horse, Knife Hand Blocks relabelled Break the Hold, a new Break the Hold finish for step 12). Body A re-rendered.
- Nov 21 (second round): high block laid along Jay's drawing (forearm across the face, fist above the opposite eyebrow), backfist arm nearly straight, front kick redone with the standing foot planted and the kicking foot landing one step ahead. Body A re-rendered for those three.
- Nov 21 (third round): stacked-hands front kick added, and real left-leg versions of both front kicks (four kick animations in all). Body A rendered.

## Kata moves wired into the game (2026-11-21, branch `claude/kata-moves-art`)
- Kata practice now plays Claude's Blender moves (approved by Jay): Open Leg Stance, every technique, mirrored for right-foot-forward beats, real left-leg kicks, the stacked-hands kick where the sheet says "catch", and the kick's step forward. The art loads when Practice Kata is first tapped. 1,650 tests pass; type checks and both builds pass.
- **Next:** Jay plays it on his phone; body B's kata art is imported once its render finishes (until then body B students saw the hero hold the Open Leg Stance through the moves). Done: body B imported the same day.

## Kata facing fix: Basic Forms 1 and 2 (2026-11-21, branch `claude/kata-moves-art`)
- From Jay's video: steps 3 and 6 of Basic Forms 1 and 2 now go up (F) and down (B) the middle instead of right. Details in decisions.md. 1,650 tests pass; type checks and the build pass.
- **Next:** Jay plays both forms on his phone and checks the turns.

## Special turn (2026-11-21, branch `claude/kata-moves-art`)
- Jay's arrows for Basic Forms 1 and 2 are in (← → ↑ → ← ↓ ← →). The special turn after each kiai is built in Blender (draft 2, after Jay's "leg reaches first" note), rendered for both bodies, and wired into kata practice (it falls back to the plain Low Block until the art is imported). 1,651 tests pass; type checks and the build pass.
- Jay approved it with a deeper reach ("it's complete"); the final turn is rendered for both bodies and imported into the kata packs, so kata practice plays it.
- **On the live link (Nov 22, Jay's OK):** merged into `main` (pull request #548); checks and the live build passed.
- **Next:** Jay plays Basic Forms 1 and 2 on his phone (the turn after each kiai).

## Overnight playthrough and fixes (2026-11-22, branch `claude/playthrough-fixes`)
- CW-3 done: Claude played the game in a real browser on a small (667 × 375) and a large (932 × 430) phone with the new white, yellow and orange profiles: tutorial, dojo, town, board, Tower runs (white and orange floors, Hearth Cook), kata practice and Street Smarts. Notes: `docs/reviews/playtest-2026-11-22.md`.
- Fixed with tests (B-FIX): the tutorial safe spot under STRIKE, quick taps in the stick area, the tutorial bow at the door, the special turn with fast tapping (4 issues), the glowing spot missed on a big phone, the "Open the chest!" nudge, the town pointer over the sign, and the character screen (an Orange Belt, Surprise me!, Hair color).
- **Next:** Jay reads the notes, answers the Shihan/Shinan question and picks which polish items to do; then copy the branch to `main` with his OK.

## Visual overhaul (2026-11-22, branch `claude/visual-overhaul`; Jay away, nothing on `main`)
Jay's list: hero overhaul, skins for coins, shop cosmetics and effects, total-change boss phases, dojo decorations (to buy or earn). Details in decisions.md.
- **Hero v2:** chibi head, big glossy eyes, soft shading with rim light, bolder outline; every animation (base, run, kata, stance idles) re-rendered for both bodies. Before/after: `incoming-art/claude-hero-v2/preview/`.
- **Skins:** 10 outfits, 9 hats and hoods, 5 back pieces, on the same rig (belt always in front). Lineup: `incoming-art/claude-hero-v2/preview/skins_lineup.png`.
- **Shop redesign** with tabs Skins, Colors, Effects, Pets, Dojo; 10 auras (code), 6 pets (Blender), 16 shop decorations; 10 achievement trophies for the dojo.
- **Bosses:** Hearth Cook → Inferno Hearth (phase 2-3), Floor Keeper → Warden Unbound (half health), the final Guardian's three forms (rendered, not in a fight until belt 10 rooms exist). Transformation flash, embers and shake in the game.
- **Late Nov 22:** all hero v2 renders finished and are in the game (base, kata, stance idles, 48 skin packs, shop icons); tests, type checks and build pass; checked in the browser (both bodies, hairstyles, a worn hood + cape + aura + pet, the belt visible on every outfit). Branch pushed for a preview link.
- **Jay's first look (Nov 22):** the shop couldn't be reached from town, and the hero turned all white in town. Fixed: a Shop button at the top right of the town (wearing a new look reloads the town at the same spot); the night light in town (7 pm-6 am) now darkens each layer's own colour instead of replacing it, for the hero and the classmates.
- **Jay's second look (Nov 22, desktop):** the shop's big preview looked pixelated, the pets most. It was the small in-game art stretched up. Now the preview has its own art: the idle facing the camera rendered at twice the game's resolution for the hero (every face and hair), every skin and every pet (`render_stage.sh`; packs `player-{a,b}-stage`, `player-{a,b}-stage-skins`, `pets-big`, about 1.7 MB, loaded only when the shop opens). The town's Shop button is also hidden during Sensei's town tour (his bubble was covering the shop).
- **Nov 23:** Jay OK'd the overhaul ("looks good"); merged onto `main` (the live link).
- **Next (was):** Jay looks at the previews and plays the preview link; OK (or changes) for the art, names and prices; decide whether the Floor Keeper should also pause (can't be hurt) while it transforms.

## Pro shop, Hannah, selling, phrases, parties and coins (2026-11-23, branch `claude/shop-hub`)
- **Pro shop:** walk up to the Action Zone's pro shop counter for the Shop button. **Miss Hannah** stands behind it, waves, says hello and goodbye (draft lines).
- **Staff art:** Jay, Hannah and Michael rebuilt on the hero v2 model from Jay's photos (preview `incoming-art/claude-staff/preview/staff-new.png`). Hannah is in the game; Jay and Michael are ready but not placed.
- **Sell tab:** Hannah buys unwanted gear for fixed coins by rarity; worn gear stays; "Sell all Commons".
- **Town:** Say button with 15 draft phrases in bright bubbles; tap a classmate for their card; party invites both ways, party menu, party list. Tap-to-move kept. Try it with `?room=town&crowd=6`.
- **Coins:** real training pays most, then clean kata and Street Smarts, then the Tower; repeats pay full only the first few times a day; the Wish in the shop. Plan in `docs/economy.md`.
- 1,693 tests pass; type checks pass; checked in the browser at 932 × 430. Not on `main`.
- **Next:** Jay plays the preview; OK (or changes) for the staff art, Hannah's name and lines, the 15 phrases and the coin numbers; where Jay and Michael should stand; then copy to `main` with his OK. The live shared town needs the game server (a later milestone).

## Jay's Nov 23 notes, round 2 (branch `claude/shop-hub`, in progress; the usage limit stopped the session)
- Done and committed: kata coins (250 once for each kata's first clean run, 30 per clean run, 3 with mistakes); drag or tap arrows to turn the hero on the character screen; 6 new straight and wavy hairstyles (13-18) and the chest circle removed from the hero models; Hannah rebuilt on the long straight hair (connected, purple ends); Michael a bit stronger; the opening cutscene in the town (test link `?room=intro`), then the tutorial floor.
- Jay picked: the market becomes the **Street Smarts House** run by Michael; the cutscene storyboard as proposed.
- Street Smarts House: room art built and packed (`incoming-art/claude-street-house`, pack `street-house`, room file `content/dojo/street-house/room.json`). **Not wired yet.**
- **Next:** (1) check the background re-render finished (`render_nov23.sh`: every hero sheet and the staff), then run `python tools/art-import/import_art.py` for the player, kata, stage, turn, big, hair and staff packs; (2) build `StreetHouseScene` (draw the room like InsideScene, Michael from staff.json, walk-ups: lessons = Street Smarts picker, tips = safety tips card (draft words for Jay), badges = one badge per scenario by stars), add `streetDoor` to town-walk.json/town.ts and the town's door loops, let StreetSmartsScene return to the house; (3) tests, both builds, push, preview link.
- **Later Nov 23:** the re-render finished (every hero sheet, both bodies, 18 hairs, no chest patch; the staff) and all 137 hero, hair and staff packs are imported. The Street Smarts House is wired (door in town, Michael, lessons, tips, badges). 1,695 tests pass; type checks and both builds pass; checked in the browser. Pushed for a preview link.
- **Next:** Jay plays the preview; OK (or changes) for the new hairstyles, Michael's name and lines, the safety tips and the cutscene words; then copy to `main` with his OK.
- **On the live link (Nov 23, Jay: "Yes, go live"):** merged into `main`; checks and the live build passed. Jay tested everything ("everything is working good"); the blurry turn-around on desktop was fixed first.

## Grok playtest, batch 1 (2026-11-24, branch `claude/playtest-fixes`)
- Grok played as a 6-year-old, a 12-year-old and a parent; its report is in `docs/reviews/grok-playtest-2026-11-23.md`. Claude checked each claim against the code and fixed batch 1 (details in decisions.md): the live link hides the Testing screen, a harder grown-up check, invites start Off, the tap fixes, bought decorations reaching storage, and the small Home Dojo fixes. 1,695 tests pass; type checks and both builds pass; checked in the browser at 844 x 390.
- Not tested in the browser: the tutorial's door arrow tap and the steady Next button in Sensei's first tour (both need a brand-new profile's tutorial); Jay tries them on his phone.
- **Next:** Jay plays the preview; answers the defeat-screen, Mash guard and town-map questions; then batch 2 (town Home button, map and signs; coins on every run summary) and copying to `main` with his OK.

## Jay's answers built (2026-11-24, branch `claude/playtest-fixes`)
- No automatic blocking (Guided enemies 0.75 -> 0.7 to keep the white-belt target), kata Watch first and Hint, the town mini map and the door signs with pictures. Details in decisions.md. 1,696 tests pass; type checks and both builds pass; checked in the browser at 844 x 390 (Watch to "Your turn!", a hinted run paying 3 coins, the map and all three signs).
- **Next:** Jay plays the preview: a fight in Steady (no auto-blocks), kata Watch and Hint, and the town map and signs; OK (or changes) for the picture icons and the kata words; then copy to `main` with his OK. Still open: re-measure the coin table with BALANCE=1.

## Street Smarts cut scene (2026-11-24, branch `claude/street-cutscene`)
- "Lost in the store" now plays like a cut scene in a Blender store with Blender people (Mom or Dad, a worker and cashier in blue vests with name tags, a shopper, a stranger). About 20 short lines instead of 35, no Next taps: it stops only for 3 questions and 1 tap-a-person moment. Jay's round 2 script. Details in decisions.md.
- 1,699 tests pass; type checks and both builds pass; checked in the browser at 844 x 390 and 667 x 375 (the whole lesson, a wrong answer and its retry, the stranger and cashier taps, Skip on a replay, the end screen).
- Jay played it: add 3-4 aisles, "everything else is good to go". Four numbered aisles added (checked in the browser).
- **On the live link (Nov 24, Jay: "Yes, go live"):** merged into `main` after bringing in Tool Belt stage 1; 1,739 tests, type checks and both builds pass.
- **Next:** Jay's OK of the Street Smarts art stands; the next Street Smarts lessons can use the same cut-scene format (each script still needs Jay's approval).

## Tool Belt, stage 1 (2026-11-24, branch `claude/tool-belt`)

**Done**
- Jay's damage shift: auto attack 0.6x Power (was 1x), Great Counter 3.5x (was 2x). Guided counter window 14 ticks (was 10) to keep the white-belt Guided target.
- Design and plan: `docs/superpowers/specs/2026-11-24-tool-belt-design.md`, `docs/superpowers/plans/2026-11-24-tool-belt-stage-1.md`. Jay approved the stage 1 words (`drafts/content/tool-belt-stage-1.md`).
- Tools for self-defense #1–15 (`content/abilities/tools.json`): each fires from a player action, waits its cooldown, and shows "#n Name!". Pockets: 3 + 1 per kata, at most 10. Sensei's Pick fills them; old saves turn their Seals into tools once.
- KATA button with Kiai! (Basic Form 1), Four Corners (Basic Form 2), Iron Wall (Keon) (`content/abilities/kata-signatures.json`).
- Tool Belt section on the Fighting Style screen, New tool card, Sensei's two lessons, no Seal words left for players.
- All tests, type checks and both builds pass. Checked in the browser: KATA button and Iron Wall, tool callouts after a Great Counter, the Tool Belt screen.

**Next**
- Jay plays the preview: OK (or changes) for the feel, the numbers, and the words Claude wrote (listed in decisions).
- Stage 2 (green to brown): tools #16–40 with the Injured status, kicks 4–7 and the second kick button, kata moves for David and Goliath, Pinon 1–3, Nahanchi, Possi. Content draft first.
- New Blender art for the kata moves and kicks (stand-in motions for now).
- Cleanup later: remove `kata-powers.json` and the Seal evolution words once old saves no longer need them.
- **Copied to `main` with Jay's OK (Nov 24):** the live link now has the Tool Belt, the KATA button and the damage shift.

## Story Chapters, stage 1 (2026-11-24, branch `claude/tutorial-overhaul`)
- Jay asked for a full tutorial overhaul: every system explained, a story with a hook, cut scenes, digestible pacing. He approved six play-paced chapters (details in decisions.md).
- **Built:** the chapter rules and saving (tested); the opening cut scene now has the hook (a light piece falls to the hero); Chapter 1's new ending (the Masked Shade takes the light piece in the Keep, Skip works); the home stop goes straight to the Training Station; the chapter card; **Chapter 2** (the Shades' mess cut scene, sweeping, decorating, Look, then Gear, Wear best and the Book on the Training Board).
- 1,774 tests pass; type checks and both builds pass. Checked in the browser at 844 x 390: the chapter card, the whole of Chapter 2 including resuming after a reload, Chapter 1's ending cut scene and Skip. Not played end to end in the browser: a brand-new player's full tutorial floor into the new ending (the pane was hidden, which slows the game's clock).
- Note: another session shared this folder for a while; commit 4eadffec (Street Smarts lessons 2-5) is that session's work and it will bring it to `main` itself.
- **Next:** Jay plays the preview: OK (or changes) for the story, the Masked Shade stand-in and the chapter words. Then stage 2: Chapters 3 (Tool Belt) and 4 (the town and the Action Zone).
## Street Smarts lessons 2-5 (2026-11-24, branch `claude/street-lessons`)
- Four new lessons, each a cut scene in its own Blender place, with Jay's approved scripts:
  - Candy at the park;
  - A ride from the bus stop;
  - Picked on at recess;
  - A new friend online.
- New people (crossing guard, teacher, three kids), a car that drives in and away, new pop-ups (a "NO!" bubble, chat messages, a ball, candy), and a two-column lesson board in the Street Smarts House.
- 1,765 tests pass; type checks and both builds pass.
- Checked in the browser at 844 x 390:
  - all four places;
  - wrong answers and retries;
  - every tap moment;
  - the end screen;
  - the "Who's home with you?" question, and its skip on the playground.
- Not checked in the browser: the new lesson board (the preview pane ran too slowly to walk to it). Jay looks at it on his phone.
- This folder was shared with the tutorial session, and one commit landed on its branch by accident. The work moved to its own folder (`../Dojo-game-street`), and the tutorial session was told.
- **On the live link (Nov 24, Jay: "add it to the live game").**
- **Next:** Jay plays the five lessons on his phone. He can change any words or art, and answer the three check questions in decisions.md.

## Nov 25: tutorial branch caught up with main

Street Smarts lessons 2-5 were built on this branch, then moved to `main` and fixed there, so the two copies clashed. Merged `main` into `claude/tutorial-overhaul`, keeping `main`'s newer copy of every clashing lesson file (10 files). The tutorial chapters are untouched. All tests, type checks and both builds pass, and the branch now merges into `main` with no clashes. **For the tutorial session:** the main project folder still has unsaved edits to 7 Street Smarts files; they are an older copy of what is now on the branch, and git will refuse to update that folder until they are thrown away (`git checkout -- <files>`, then `git pull`).

## Nov 25: The Story of the Light, version 2 (draft)

- Reviewed Jay's story for holes and thin spots; wrote `docs/story-of-the-light-v2.md` with every change marked and a table of 16 patches.
- Jay answered six questions (see decisions.md). Added Mara's forgiveness in the town square, Eli's folding-chair joke, and the 30 notebook pages.
- **Next:** Jay approves Sensei's three new lines, the notebook pages and the version 1 questions. Then the game's story words are updated to match (Shade becomes Shadow, the masked figure becomes Eli).
