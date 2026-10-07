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
- A run in progress isn't saved if the app is closed.
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
- Jay tests on his phone and gives feedback (does cleaning feel satisfying? is decorating easy? is the mess rate right?).
- Milestone 4 is still paused, waiting for Grok bot's design material.
