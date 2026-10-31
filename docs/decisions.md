# Decisions

A record of choices already made, newest at the bottom, so settled questions aren't re-debated. Read this every session.

## Open questions for Jay

Anything waiting on Jay's answer goes here. When he answers, the answer moves into the log below and the question is removed.

(None right now.)

## Milestone 0 — Setup (2026-10-05)

- **Docs live in `docs/`.** framework.md, core-design.md and MILESTONE_PROMPTS.md were uploaded to the main folder and moved into `docs/` to match CLAUDE.md.
- **Repository name.** The GitHub repository is `Dojo-game`; the project is Dojo Ascent. No rename needed.
- **Phaser 3, pinned.** npm now installs Phaser 4 by default; we pin Phaser 3 (3.90) as CLAUDE.md specifies.
- **One project, three parts (npm workspaces).** `apps/client` (the game) and `packages/sim` (the rules) are installed and built together from the main folder. Commands: `npm run dev`, `npm run build`, `npm test`.
- **Landscape in the browser.** A phone browser can't force sideways mode, so in portrait the game shows "Turn your phone sideways to play." The phone apps (milestone 8) will lock landscape properly.
- **Safe areas.** The page background fills the whole screen, while the game itself sits inside the phone's safe area, so nothing is hidden under a notch or home bar.
- **Ready for Capacitor, not installed.** The build uses relative paths and outputs to `apps/client/dist`, which is what Capacitor expects. Capacitor itself is installed in milestone 8, keeping the project small until then.
- **Pause in the background.** The game loop sleeps when the page or app is hidden and wakes when it returns.
- **Hosting.** Jay created the Cloudflare project as a **Worker** named `dojo-ascent` (Cloudflare's newer option) instead of a Pages project. It serves the built game as static files, set up in `wrangler.jsonc` (assets folder `apps/client/dist`). Cloudflare runs `npm run build` and then deploys on every push. The `main` branch becomes the live link, and other branches get preview links.
- **`main` is the live game.** Cloudflare builds and publishes the `main` branch, and its "Visit" link is the one Jay bookmarks on his phone. Claude works on a separate branch and copies the work onto `main` only with Jay's OK (approved for milestone 0 on 2026-10-05; ask again each milestone).

## Milestone 1 — Movement (2026-10-06)

- **No milestone 0 fix needed.** The updated CLAUDE.md and design docs (phone apps, landscape, multiplayer-ready, Power Rating, gradual unlocks, launch scope) didn't change anything milestone 0 had built.
- **Rooms are data files** in `content/rooms/`, drawn as rows of text (`#` wall, `.` floor, `P` player start). The rules package checks each room when it loads (same row widths, walls all around the edge, exactly one start) and gives a clear error if something is wrong. The checks are hand-written, so no new library was needed.
- **Distances are measured in tiles.** Walking speed is 4.5 tiles per second and the character is a circle 0.84 tiles wide. Both live in `packages/sim/src/config.ts`.
- **Stick appears where the thumb lands** in the bottom-left area of the screen (Jay approved). Pushing further goes faster, and a small dead zone stops a resting thumb from drifting. Anywhere else on screen is tap-to-move, and holding and dragging keeps steering. The bottom-right is kept free for the ability buttons.
- **Tap-to-move walks around walls.** It uses a route-finder over the tiles and then takes straight lines wherever possible. Tapping a wall walks to the nearest open spot. Using the stick cancels a tap.
- **Smooth drawing.** The rules move 20 times a second, and the Phaser game blends between those steps so motion looks like 60 frames a second.
- **Ready for multiplayer and the server.** The world is plain saveable data with a player ID for each player. Players are updated in a fixed order, and the rules only use basic math, so every phone and the server get exactly the same result.
- **The view shows 8 tiles top to bottom** on every phone, and the camera follows the character.
- **Bigger character (Jay's feedback).** After testing, Jay asked for a slightly bigger character so gear and cosmetics will be easier to see later. The body went from 0.7 to 0.84 tiles wide and the view zoomed in from 9 to 8 tiles tall, making the character about 35% bigger on screen. The body stays under 1 tile wide so it still fits through one-tile gaps.
- **Testing on the live link.** Branch previews are hard to find on Cloudflare (they're under Deployments → View build history → Preview), so for milestone 1 Jay chose to test on the live `main` link instead (approved 2026-10-06). Still ask before copying onto `main` each milestone.

## Milestone 2 — Combat core (2026-10-06)

- **All combat numbers in one place:** `packages/sim/src/config.ts` (`DIFFICULTY` and `COMBAT`). The starting values from CLAUDE.md are used as written: counter window 10 / 6 / 4 ticks (Guided / Standard / Challenge), Rooted Form +2 ticks, Focus +5 per hit and +25 per Perfect Counter, combo bonus +5% / +10% / +15% at 10 / 20 / 30 hits, two attackers at once, and the damage formula.
- **Enemies are data files** in `content/enemies/` (first one: `brute.json`), checked when loaded. Every enemy attack must have at least half a second of warning, or the file is refused. Rooms list where enemies start (`"enemies"` in the room file, counting columns and rows from 1).
- **Starting player stats** (until milestone 4 links real profiles): Health 100, Power 10, Guard 0.
- **The brute:** Health 120 (about 15 basic hits), Power 25 (a Hit takes a quarter of your health), Guard 25, slow walker, 0.8-second wind-up on Standard. Only a Perfect Counter staggers it; normal hits don't interrupt its wind-up.
- **Telegraph:** when the brute winds up, a red circle appears on the floor where the hit will land and fills from the middle; when it reaches the edge, the attack lands. The brute also swells and turns red, a "!" pops up, and a rising sound plays. The danger area is fixed when the wind-up starts, so stepping out of it always avoids the hit.
- **Counter timing:** pressing Counter starts a short guard pose (0.5 s, no walking). If the attack lands within the window after the press, it's a Perfect Counter; if it lands later in the guard pose, it's a Block. If the guard pose ends with nothing to counter, the button rests for 0.5 s, so tapping it nonstop doesn't work.
- **Strike (for now):** costs 30 Focus; one heavy hit (2.5× a basic hit) with a short lunge. The "tap in rhythm for a 3–5 hit chain" version comes with more abilities later.
- **Automatic basic attacks** hit the nearest enemy in reach every 0.6 s, even while walking.
- **Defeat in the practice room:** a soft fade and Sensei helping the hero up ("Sensei helps you up." / "Every fall is part of training.", B-MASHER-d1; was "Ouch! Back to the start."), then the player is back at the room start with full health. Focus and combo reset, and the room's enemies reset too. Nothing is lost and nothing ends. A Tower run's knock-out is the B-MASHER-d1 flow below.
- **Beaten enemies come back after 4 seconds**, so there's always something to practice on.
- **Game feel lives in the game, not the rules:** the short freeze on impact, screen shake, flashes, sparks, damage numbers and sounds are in `apps/client`. The freeze pauses the game for a split second on this phone only; in co-op later it will become a visual-only freeze so players stay in sync.
- **Sounds (narrowed by R-PREMIUM-b3, 2026-10-26):** the events listed in `content/settings/sfx.json` play free CC0 sound files from `assets/audio/sfx/` (Kenney packs and one OpenGameArt 8-bit pack, licences copied alongside). Every other sound is still made in code, and each file event falls back to its code sound if the file can't load. No new libraries. Sound switches on at the first tap, as phones require.
- **Jay's first playtest (2026-10-06):** Standard feels right for about ages 10 and up. The brute's pace is perfect, and its damage (4 Hits to defeat with no boosts) is right. Enemy attacks may need raising later once gear, stances and perks make players stronger.
- **Guided (easy) timing, second version (Jay, 2026-10-06).** The first try (a 14-tick window inside a 1.5× slower wind-up) made the timing feel loose: pressing half a second into the wind-up still worked. Now the danger circle **fills at the same speed on every difficulty** to "nearly full" (85%), then **holds nearly full while the Perfect Counter window is open**, creeping to the edge with a thicker, brighter ring. Easier difficulties hold longer instead of slowing the whole wind-up: Guided 10 ticks (0.5 s), Standard 6 (0.3 s), Challenge 4 (0.2 s, with a 20% faster fill). This replaces the "1.5× / 0.8× telegraph" rule from core-design section 4. Standard's total wind-up is unchanged.
- **Block zone on every difficulty:** the guard pose lasts at least 4 ticks past the window, so a slightly early press is a Block, and anything earlier is a Hit.
- **Testing difficulty by link:** until the difficulty choice arrives (milestone 7), adding `?difficulty=guided` or `?difficulty=challenge` to the game's link picks it. Without it, the game uses Standard.
- **For milestone 3 (Jay's design note):** grunts should move faster than brutes. That supports two play styles: running to separate fast grunts from slow brutes and dealing with them one group at a time, or standing ground with Block and Counter.
- **Overlapping attacks stay as they are (Jay, 2026-10-06).** One Counter press covers only one attack. If two enemies' hits land at the same moment, the second is a Hit. This is realistic (you can handle two attackers whose timing is offset, but not two swinging at once from different sides) and forces judgement calls.
- **A successful Counter or Block resets the Counter button right away** (confirmed by Jay). The button only rests after a press that countered nothing.
- **Dash button (to build in milestone 3).** The answer to two attacks landing at once is to get out: a Dash button that moves the player quickly out of danger before the attack hits. Details (distance, cooldown, button placement next to Strike and Counter, and how it relates to the "escape" Technique Seal in core-design section 4) are to be planned with Jay at the start of milestone 3.

## Milestone 3 — A full floor (2026-10-06)

- **Dash (Jay, 2026-10-06):** a button above Counter. A quick burst of 2.5 tiles over 0.25 s in the stick's direction (or the way the player faces), with a 1.5 s recharge shown as a ring. **No protection while dashing:** the player must react in time. If testing shows it's too hard, a short "can't be hit mid-dash" moment can be added. You can't Dash while holding the Counter guard pose. Numbers are in `COMBAT.dash`.
- **Defeat during a run (Jay):** the run ends and the player goes home with **everything found so far**. Jay would prefer something more punishing later (like losing the run's items); revisit if runs feel too easy.
- **Wearable gear now (Jay):** gear can be worn from the Home Dojo, with green up / red down arrows comparing it to what's worn. The arrows use a hidden gear score (never shown, like Power Rating).
- **Swarmers and grunts are the same enemy (Jay).**
- **Three enemy types plus a boss**, all data files in `content/enemies/`:
  - *Swarmer:* small and fast (3.2 tiles/s, faster than the brute's 1.8), Health 30, a quick jab with a 0.6 s warning. Comes in groups.
  - *Shield Guard:* basic attacks bounce off with a "CLANK" (no damage, no Focus). A Strike or a Perfect Counter breaks the shield; it grows back after 6 s.
  - *Floor Keeper (boss):* Health 520, takes turns between a ground slam and a wide sweep all around itself (Dash out or Counter it), and calls in two swarmers at half health.
- **Enemy files can now list several attacks** (`"attacks"`), a `"shield"`, `"boss": true` (allowed to be bigger than a tile; only for open rooms), `"summon"`, and a placeholder `"color"`. Every attack still needs at least 0.5 s of warning or the file is refused.
- **Kung fu circle:** still at most two enemies winding up at once. Enemies waiting their turn now circle the player a little outside their reach instead of crowding in, and enemies no longer stand inside each other.
- **A floor is 7 rooms:** 6 rooms chosen through doors, then the boss. The first room is always a battle. After each room, 2 or 3 doors appear (battle, challenge, treasure, rest), always including at least one fight, never two rest shrines in a row; before the boss there's only the boss door. Door chances are in `FLOOR` in the settings file.
- **Room library:** 10 hand-made rooms in `content/rooms/` (5 battle, 2 challenge, 1 treasure, 1 rest, 1 boss). Room files now have a `"kind"`, door slots `D` in the outer wall, a chest spot `C`, a shrine spot `S`, a `"parSeconds"` (good clear time for grades), and for challenge rooms a time limit. The training room is unchanged and is now the "Practice room" on the Home Dojo screen.
- **Doors** are drawn in the top wall and open (glowing, with a label) once the room is done: all enemies beaten and any chest opened. Walk into a door to go through.
- **Challenge rooms:** a harder fight with a countdown. Clearing in time makes the chest give 3 items, Uncommon or better (otherwise 2 normal items).
- **Rest shrine:** walk to it to restore 60% of max health. Health carries over between rooms.
- **Room grades:** one point each for at least 2 Perfect Counters, taking no more than 15% of max health in damage, and clearing within the room's par time. 3 points = S, 2 = A, otherwise B. An S adds one bonus item. Numbers in `GRADES`.
- **Insights:** 9 to start (`content/insights/insights.json`): Ripple Counter, Iron Skin (Rooted); Wind Step, Double Strike, Quick Hands (Flowing); Press the Advantage, Shield Breaker, Heavy Hands (Power); Second Wind (Virtue). Pick 1 of 3 after each battle or challenge room, never the same one twice in a run. The fight is paused while choosing. Insights and charms share one list of effect types (`packages/sim/src/effects.ts`).
- **Loot:** gear only for now: hand wraps (Power), gi (Health and Guard) and charms (small effects: +Power %, starting Focus, healing on Perfect Counters). Item types are in `content/loot/gear.json`; who drops what (enemy drop chances, chest sizes) is in `content/loot/drops.json`. Rarity shares and bad-luck numbers are in the settings file (`LOOT`), as CLAUDE.md asks for starting numbers.
- **Rarity:** Common 70%, Uncommon 22%, Rare 7%, Epic 1%. No Legendaries yet (Guardians only, later). Each rarity has its own color and chime.
- **Bad-luck protection:** each run in a row without a Rare moves 3% of the chance from Common to Rare, and the 5th run in a row without a Rare is guaranteed one in its first chest.
- **Gear limit:** gear stats are capped by a placeholder white-belt limit (`GEAR_CAPS`) until real profiles arrive in milestone 4.
- **Empty slots fill themselves:** the first item found for an empty slot is worn automatically.
- **"Let go":** unwanted gear can be removed from the bag (two taps to confirm). When crafting arrives (after launch), this becomes "break down into materials".
- **No materials, teas, decorations or experience drops yet:** crafting is post-launch, decorations come with milestone 5, and levels with milestone 4.
- **Run summary and personal bests:** the Home Dojo shows the last run (rooms reached, a grade chip per room, Perfect Counters, best combo, time, items found) and personal bests (fastest floor, most Perfect Counters, longest combo, most S grades), with "NEW!" next to bests just beaten. Clearing the floor gets a modest "Floor cleared!" so real promotions can always be celebrated more.
- **Saving:** the player's profile (gear, bests, bad-luck counter) is stored on the phone (browser storage) until the game server arrives. A run in progress isn't saved: closing the app mid-run loses that run.
- **Seeded runs:** each run has a seed, so the same seed always gives the same doors, Insights and loot (needed for the server and co-op later).
- **Test links:** `?room=<room id>` starts a run in that room (for example `?room=keepers-hall` for the boss, `?room=gauntlet` for a challenge); these runs don't count toward personal bests. `?seed=<number>` repeats a run. `?room=training` goes straight to the practice room. `?difficulty=` still works.
- **Developer-only hook:** the developer build exposes the game for automated screen checks. It is left out of the published game.

### Milestone 3 — changes after Jay's first playtest (2026-10-06)

- **Jay's playtest:** 3 runs, lost the first two and won the third. One run had 1 battle room, then 5 treasure rooms in a row, then the boss. The doors are a hit. Fights felt **messy and crowded** (the frame rate itself was smooth). Swarmer and brute speeds were too close to separate them, and running to pick off swarmers had no advantage over standing and countering everything.
- **Balance simulation** (two computer players fighting the real rooms 40 times each with human-like timing mistakes): even when running, swarmers stayed about 1.3 tiles from the brute. Faster swarmers and a slower brute alone only widened that to about 2 tiles, because the brute catches up while you fight. Adding "winded" brutes made running and picking off swarmers take 60–90% less damage than standing and countering, at about twice the clear time. Standing and countering is still possible, just riskier. The simulation script was temporary and isn't kept.
- **Treasure rooms:** never two in a row, at most 2 per floor (`FLOOR.maxTreasureRooms`), and offered less often (door weight 1.2 → 0.7).
- **Speeds:** swarmer 3.2 → 4.0 tiles/s (just under the player's 4.5), brute 1.8 → 1.2.
- **Winded brutes:** a brute that chases for 4 s without swinging gets winded. It stops for 2.5 s, goes pale with sweat drops and a "huff" sound, and takes 50% more damage. Set per enemy with `"winded"` in its data file; the boss and swarmers don't get winded.
- **Less crowding:** enemies waiting their turn circle farther out (1.2 → 1.8 tiles outside their reach), and small hits freeze the action for less time (45 → 20 ms) with a lighter shake.
- **Street Smarts doors (Jay's idea, saved for milestone 6):** a door can lead to a Street Smarts room. A short story window ("A stranger tries to talk to you. What do you do?"), then the scene in the room (for example, two strangers saying "Want some candy?") with 2–3 big choice buttons, while the player keeps the stick. The right answer is a safe action, such as moving or dashing to a clearly marked exit. Agreed: a wrong choice gets no in-game penalty (no extra monsters, no lost health). Sensei shows what could have gone differently and the player tries again; the safest choice earns the reward. Jay also considered a 2–3 question quiz with penalties for wrong answers; the choice buttons cover the quiz part. Built in milestone 6, and only after Jay approves each script.

### Milestone 3 — Claude's own playtest (2026-10-06)

Jay asked Claude to test and tune the game before his next playtest.

- **Balance-testing computer player** (`packages/sim/test/balance/`, run with `npm run balance` in `packages/sim`). It plays complete runs like a student would: it reacts a moment after a telegraph starts and presses Counter with some timing error. Three skill levels: sharp (fast and accurate), typical (about a 10–12 year old) and novice. Two styles: "smart" (runs from brutes, picks off swarmers, punishes winded brutes, Dashes out of overlapping hits) and "stand" (walks up and counters everything). It prints win rate, run time, grades, where players die, and per room: time, damage, Perfect Counters / Blocks / Hits, crowding (enemies within 2.5 tiles), and how often brutes got winded. It isn't part of the normal tests.
- **What the first report showed:** the computer player cleared rooms in 5–10 s and a whole floor in about 1 min (enemies died too fast for the player's damage). All of a room's enemies rushed in at once (up to 5–6 around the player), and grades were almost all S.
- **Waves:** fight rooms now send enemies in 3 waves (the Gauntlet 4). The next wave arrives when 1 enemy or none is left, with a "Wave 2" / "Final wave!" banner, a sound, and "Wave 2 of 3" next to the room number. Practice rooms still put everyone in at once. Room files give each enemy a `"wave"`.
- **Tougher enemies:** swarmer health 30 → 40, shield 70 → 90, brute 120 → 180, Floor Keeper 520 → 700. The Training Yard has 2 brutes (3 was the deadliest room). The boss room sends 2 swarmers with the boss, then 2 more waves of helpers.
- **Catch your breath:** clearing a fight room restores 15% of max health (`COMBAT.roomClearHeal`). Without it, damage built up across the longer fights and most deaths came from being worn down.
- **Fairer grades:** the Perfect Counter point now needs one Perfect Counter for every two enemies in the room. The par time adds up each enemy's `"parSeconds"` (swarmer 2.5, shield 5, brute 8, boss 25) unless a room sets its own.
- **Less loot from enemies:** swarmer 3.5%, shield 10%, brute 15% (about 11 items per run instead of 16, so Rares stay special).
- **Challenge time limits:** Gauntlet 2 minutes, Shield Wall 100 seconds (they have more enemies now).
- **Results after tuning** (80 runs per row):

| Player | Smart play wins | Stand-and-counter wins |
| --- | --- | --- |
| Sharp, Standard | 100% | 100% |
| Typical, Standard | 93% | 78% |
| Novice, Standard | 41% | 29% |
| Novice, Guided | 99% | 96% |

  Smart play is clearly rewarded. Most deaths are at the boss. Average crowding is about 1.5–2 enemies near the player, and the worst moments are about 3–5 (up to 6 in the Gauntlet).
- **Run length is still the open question.** The computer player takes about 2–2.5 minutes of fighting per floor. People are slower (moving, reading cards, picking doors), but by how much is unknown. Jay will report his run time (shown in the run summary), and we'll tune toward 10–15 minutes with more waves or more rooms if needed.

### Milestone 3 — run length (Jay, 2026-10-06)

- **Jay's second playtest:** waves made fights much cleaner. Leading swarmers away works, and winded brutes are worth chasing (the +50% damage is "perfect"). His run took about 5–6 minutes in real time (2:43 of room time on the summary, plus reading the Insight cards).
- **Runs are 5–7 minutes, not 10–15 (Jay's choice).** Phone sessions are short: 15–30 minutes means a few runs, not one long one. Updated in `core-design.md` (the five loops table) and `framework.md` (session length, milestone 3's "done when").
- **Floors are now 8 rooms:** 7 chosen through doors, then the boss (`FLOOR.roomsBeforeBoss` 6 → 7). The balance report barely changed (typical player still wins 93% playing smart), and fight time grew by about 10%.

### Milestone 3 — final changes (Jay, 2026-10-06)

- **No skipping fights:** Jay found that picking rest, treasure, rest, treasure... avoided fighting all the way to the boss. Now, **after a treasure room or a rest shrine, every door leads to a fight** (battle or challenge), and rest shrines are capped at 2 per floor (`FLOOR.maxRestRooms`), like treasure rooms. A floor now always has at least 4 fight rooms plus the boss, and at most 3 calm rooms.
- **Run length (5–7 minutes) is OK for now** (Jay).
- **Dodge-only attacks (Jay's idea, for milestone 10):** an enemy attack that can't be Countered or Blocked, only dodged by moving or Dashing out of the way. It's revealed as players climb to higher Tower tiers, as one of the "new enemy mechanic per tier" additions in milestone 10. It must look clearly different from normal telegraphs (for example a striped purple danger zone with a double "!!"), still give the usual warning time (it's still telegraphed, so never unavoidable), and come with a Sensei's Lesson the first time it appears. Not built yet.

## Milestone 4 — Training link with fake data (2026-10-07)

- **Action Zone's curriculum (Jay, 2026-10-07):** White Belt Basic Form 1, Yellow Basic Form 2, Orange Keon, Green David and Goliath, Blue Penon 1, Red Penon 2, Red/Black Penon 3, Brown Nihanchi, Brown/Black Possi, then Black Belt. Self-defense techniques have no names, just numbers, and keep counting (white #1–5, yellow #6–10, …). Kick combos are numbered too: Kick Combo 1 at white up to Kick Combo 7 at red/black. Brown and brown/black have no new kick combo. Black belt has Kick Combos 8–12 (12 in all for now).
- **The curriculum is data, not code.** It lives in the fake profiles (`fixtures/`), shaped like Nic's feed, so another school only needs its own curriculum.
- **Three fake profiles = one student ("Sam T.") at three points in time:** (1) brand-new white belt, (2) six weeks later with 3 sign-offs (Basic Form 1, Self-Defense #1, #3), the Respect stripe and class today, (3) yellow belt with all 7 yellow requirements signed off, Respect earned again (rank II), Great Effort earned at white, approved to test with a test date, and white belt's Self-Defense #4 still a catch-up item. Switching forward plays the reward moments, and white → yellow plays the promotion ceremony.
- **Fake profiles always look fresh:** their dates are moved so the profile's "last update" is now (testing only; real feeds are never moved). That keeps "class today" and the Blessing working whenever Jay tests.
- **Feed shape (for Nic, framework section 14).** These are the extras the game needs beyond the section 14 list:
  - the school's full curriculum per belt (requirement ids, types and names), so the legacy grant can unlock earlier belts' abilities
  - per belt: color, second color for striped belts, black belt degree, typical months in rank, and classes before testing
  - `attendance.classesInRank` for the sundial
  - `testing.approved` and `testing.testDate` for Sensei's Seal
  - which belt each catch-up item belongs to

  The game checks every profile when it loads and gives a clear message if something is wrong.
- **Abilities map in curriculum order** (`content/abilities/abilities.json`): the n-th kata unlocks the n-th Form, the n-th kick combo the n-th Strike upgrade, and the n-th self-defense technique the n-th Technique Seal. Powers exist for white and yellow belt so far. Later belts still unlock their ability, with the power "arriving in a later update" (milestone 10). Each ability card shows the real technique name, who signed it off and when.
- **Every power has a real reason (Jay, 2026-10-07: "make it make sense, but don't sacrifice the fun").** Jay asked Claude to choose the powers and give each a reason he could explain to a student. Rule of thumb: the game power does what the real technique teaches. Everything is in `content/abilities/abilities.json`.
- **Forms (from kata).** Kata teach stance, balance and movement, so each Form changes how you stand and move. A **Form button** appears once a kata is signed off and switches between up to 3 earned Forms plus the Beginner's Stance; the current Form's name shows under the button.

  | Kata | Form | What it does | Why |
  | --- | --- | --- | --- |
  | (everyone) | Beginner's Stance | Nothing changes | The starting point before any kata |
  | Basic Form 1 | Rooted Form | +2 ticks of Perfect Counter window, +30% Guard, 15% slower | The first form builds a strong, balanced stance and blocks. A rooted stance makes you harder to move and steadier to counter from, but slower on your feet. |
  | Basic Form 2 | Flowing Form | 15% faster movement, 20% faster attacks | The second form adds stepping and turning. Moving well between techniques makes you quicker. |

  Idea for later belts (milestone 10): David and Goliath (green) could become a Form that does extra damage to big enemies and bosses. The small one beats the giant.
- **Strike upgrades (from kick combos).** A kick combo is several kicks chained together, so each combo upgrades the Strike button. They stack; there's no loadout screen yet.

  | Kick combo | Upgrade | What it does | Why |
  | --- | --- | --- | --- |
  | Kick Combo 1 | Follow-up Kick | Strike adds a second kick | Your first combo teaches you to follow one kick with another. |
  | Kick Combo 2 | Quick Combo | Strikes cost 8 less Focus | With more combos practiced, they flow without wasted effort, so each one costs less energy. |
- **Technique Seals (from self-defense).** Real self-defense teaches seeing the attack coming, blocking, getting the attacker off-balance, creating distance and getting away safely. Each Seal upgrades the Counter (Counter is the game's self-defense move), and all earned Seals are always on.

  | Self-defense | Seal | What it does | Why |
  | --- | --- | --- | --- |
  | #1 | Off-Balance | Perfect Counters stagger half a second longer | A good technique leaves the attacker off-balance. |
  | #2 | Escape Step | A Block instantly recharges Dash | Block, then get away: escape is the goal of self-defense. |
  | #3 | Sweep | A Perfect Counter also knocks into enemies close by | Taking one attacker down can trip up the ones next to them. |
  | #4 | Steady Breath | +3 Health per Perfect Counter | Staying calm and breathing under pressure keeps you going. |
  | #5 | Strong Block | Blocks take 10% less damage | Practiced blocks absorb more. |
  | #6 | Sharp Eyes | +1 tick of Perfect Counter window | Awareness: you see the attack coming a moment sooner. |
  | #7 | Create Distance | Blocks shove the attacker back (20% of the hit bounces back) | Pushing an attacker away to make space. |
  | #8 | Disarm | After a Perfect Counter, that attacker's next attack does half damage | Taking away what they're attacking with. (This replaced an earlier "+10 Focus" idea that had no real link to disarming.) |
  | #9 | Throw | Perfect Counter hits are 25% stronger | A throw turns the attacker's own force against them. |
  | #10 | Follow Through | Off-balance (staggered) enemies take 15% more damage | Finish the technique while the attacker is off-balance. |
- **Virtues (from character stripes).** A Virtue is used with a full Focus meter (all of it) from a **Virtue button** that appears once a stripe is earned.

  | Stripe word | Virtue | What it does | Why |
  | --- | --- | --- | --- |
  | Respect | Shield of Respect | Soaks up 40 damage for 6 s | Respect protects: people who show respect are protected by others. In co-op (later) it shields the whole party. |
  | Great Effort | Second Wind | Restores 30% Health and gives back half the Focus | Great effort means pushing on when you're tired. |
  | Self-Discipline | Perfect Discipline | Every Counter is Perfect for 3 s | Discipline is control and precision. |

  Each rank above I (the same word earned again) is 25% stronger (bigger shield, longer discipline), because practicing a virtue for longer makes it stronger. The Virtue taken into fights is the highest rank, then the most recent (a loadout choice comes later).
- **The Insight "Second Wind" is renamed "Rally"** so it doesn't clash with the Great Effort Virtue.
- **Levels:** cap 10 per belt tier (white 10, yellow 20). Each level adds +3 Health and +0.4 Power. Runs give experience per room cleared (battle 12, challenge 16, treasure/rest 4, boss 40, plus 20 for clearing the floor). Each tier's experience is set so a typical player (8 runs a week, about 110 experience a run) reaches the cap at 75% of the belt's typical time in rank. At the cap, experience stops for now; overflow into materials and Mastery comes after launch. All numbers are in `PROGRESSION` in the settings file.
- **Typical time in rank (Jay, 2026-10-07):** white through blue test every 3 months; red to red/black 6 months; red/black to brown 6 months; brown to brown/black 9 months; brown/black to black 1 year. At Action Zone black belt is 1st degree; the wait to 2nd degree is 2 years (Jay, 2026-10-23; see the work-board decisions below). White to black takes about 4–5 years.
- **Classes before testing (Jay, 2026-10-07):** 2 classes a week, with 1 week (2 classes) excused per belt; any other missed class must be made up. That makes 24 classes for a 3-month belt, 50 for 6 months, 76 for 9 months and 102 for a year. This is the Gate's time-in-rank dial. Note for Nic: DojoForge will need to count classes in rank (made-up classes included) so the dial is right.
- **Catch-up experience:** below the rank's expected level (the previous belt's cap, so a yellow belt is expected to be at least level 10), experience is doubled. A saved level above the current belt's cap (only possible when switching fake profiles) is shown capped.
- **Dojo Blessing:** a class in the last 48 hours gives +50% experience and better loot (3 points of weight move from Common to Rare on every roll). The Home Dojo shows a glow around the character and the hours left. Nothing is shown when not blessed (no punishment).
- **The Gate** is a tab in the Home Dojo:
  - one lock per requirement of the current rank, gold and lit when signed off
  - the sundial, showing classes attended out of classes before testing
  - Sensei's Seal, red and lit with the test date when approved; otherwise it reads "Lights when Sensei approves you to test" and never gives a reason
  - a pulsing "READY" when every lock is lit

  Catch-up items never appear on the Gate.
- **The Path card** sits in the Home Dojo under the buttons. It shows:
  - the next unsigned requirement of the current rank, then catch-up items (labeled "Catch-up from White Belt")
  - the next class day and the test date
  - a greyed "Video soon" until the video library is connected (milestone 9)
- **Reward moments**, biggest first:
  1. the promotion ceremony
  2. character stripes (a gold band and the stripe word)
  3. sign-offs ("Sensei Jay signed off Self-Defense #3!" with the ability unlocked; more than 3 at once are shown on one list card)
  4. Sensei's Seal
  5. the Dojo Blessing (small)

  A game level-up is only a line on the run summary. The game remembers what it has celebrated in the save, so each moment plays once.
- **First time playing (or after "Forget what I've seen"):** one welcome card lists everything the student's training has already unlocked (the legacy grant's cascade), with no ceremony, because it isn't a new promotion.
- **The promotion ceremony** has 4 tap-through steps:
  1. The character bows and the new belt is tied, with rays, confetti and the biggest sound in the game.
  2. The Gate's doors slide open on the new tier.
  3. The new belt's techniques, each with what it unlocks.
  4. The raised level cap.

  Not yet built: the trophy, the cosmetic and the new dojo room (milestone 5 and later), and the promotion card for parents (later). There are no Tower floors per tier yet (milestone 10), so a yellow belt still climbs the first tier.
- **Going down a belt** (only possible by switching fake profiles) celebrates nothing.
- **Power Rating** (`packages/sim/src/power.ts`, numbers in `POWER`): each tier's max is 1,000 per belt plus 500 per black belt degree. The sources and how they fill:
  - **Sign-offs:** signed requirements out of every requirement up to the current belt. Ranks already passed count (the legacy grant); catch-up items don't count until signed.
  - **Training Points:** 15 approved minutes = 1 point, out of 4 upgrades per ability. Points are counted, but spending them comes later.
  - **Virtues:** stripes out of 2 per belt so far.
  - **Level:** level out of the cap.
  - **Gear:** worn gear's hidden score out of the best possible at the tier.
  - **Street Smarts and Mastery:** 0 for now.

  Every source is capped at its share, so the total can never pass the rank's max (tested).
- **Hidden testing screen:** tap "Home Dojo" 5 times quickly. It lets you:
  - switch fake profiles
  - "Forget what I've seen" (replays the welcome)
  - "+1 level" / "Back to level 1"
  - see the Power Rating with its breakdown

  Power Rating appears nowhere else. This screen stays until the real DojoForge connection (milestone 9), when it should become staff-only.
- **Belt colors are drawn in code** from the belt list (two-color belts get a center stripe; stripes are white tape on dark belts, black on light ones). This is a placeholder until the palette-swapped sprite (milestone 7).

## Milestone 5 — Home Dojo basics (2026-10-07)

- **The Home Dojo is now a room you walk around in** (`content/dojo/home-dojo.json`, 13 × 8 tiles of floor). The whole room fits on screen. The same tap-to-move and stick work as in the Tower. The **notice board** on the top wall (walk to it, or the "Board" button) opens the old Home screen, now called the **Training Board** (Tower, practice room, last run, gear, abilities, Gate, Path card), with a "◀ Dojo" button back. The **door** at the bottom leads to the Tower. The title screen now goes to the dojo.
- **The bow:** a big "Bow" button appears when entering the dojo (starting the game, and coming back from the Tower) and at the start of each Tower floor. Tapping it plays a short bow with a calm bell. The fight waits until the player bows.
- **Bow and Calm Mind numbers (Jay asked Claude to choose them using game design science):**
  - **The bow at each Tower floor gives +15 Focus** (about 3 hits' head start). A small, instant, guaranteed reward turns a ritual into a habit. The dojo bow is the ritual only, with no bonus.
  - **Calm Mind: Focus builds 20% faster for the next 3 Tower runs**, earned by fully cleaning a dojo that had mess. You feel it in fights (Strikes come sooner), and it fits the name. It's counted in runs, not hours, so it never pressures a child to play now. It doesn't stack past 3, and it stays smaller than the Dojo Blessing (real class). It shows as a soft aqua glow on the character, "Calm Mind · 3 Tower runs" in the dojo, and "Calm Mind" under the Focus bar in fights.
- **How mess builds:** nothing for the first 4 hours, then fast at first and slower later (an ease-out curve), full at 7 days, and it stops there. After 1 day there's a small 15-second tidy (about 4 dust spots and a scuffed mat); after a week, about a 1-minute clean (16 dust and leaf spots, scuffed mats, 3 crooked weapons per rack). Frequent short visits always have something quick and satisfying to do, and a long absence is never worse than "needs a good cleaning". Mess never removes or damages anything and never blocks the Tower. All numbers are in `DOJO` in the settings file.
- **Planned absences pause the mess** in the rules already (vacations and illness), but nothing sends them yet. They'll come from the student app through the DojoForge feed (milestone 9).
- **Cleaning:** walk over dust and leaves to **sweep** them (a puff, a sparkle and a rising note for each spot in a streak). Stand on a scuffed mat and tap **Wipe** 4 times. Stand by the weapon rack and tap **Straighten** once per crooked weapon. The button appears only when something is in reach. "Watering the plants" from framework section 7 is left for later; Jay named three chores.
- **Welcome cards (always warm):**
  - **First visit:** "Your Home Dojo", with three short lines on bowing, cleaning and the board.
  - **Back after 2 days or more:** "Welcome back, Sam!", one of a few friendly lines, then "A little dust settled while you were away. Let's get your dojo ready together." (or "Everything is just how you left it.").
  - Real reward moments (promotion, stripes, sign-offs) now play right after the bow, in the dojo, so real achievements still come first and biggest.
- **Decorations (11 kinds, placeholder shapes)** in `content/dojo/decorations.json`. Every one is earned.
  - **Sensei's three welcome gifts** come with a new dojo: Training Mat, Weapon Rack, Dojo Banner. (Jay approved.)
  - **Eight found in the Tower:** Practice Mat, Punching Bag, Stone Lantern, Bonsai Tree, Potted Bamboo, Taiko Drum, Wooden Bench, Calligraphy Scroll. The Floor Keeper's chest always holds one, and treasure and challenge chests hold one 25% of the time. Kinds the player has fewest of come first. Duplicates are allowed once every kind is owned.
- **Decorating:** tap "Decorate", then drag any decoration. It snaps to tiles and shows a green outline where it fits and red where it doesn't. Tap one to select it, and "Put away" sends it to storage. The storage tray at the bottom places a stored decoration in the best free spot with one tap. Banners and scrolls hang on the top wall. Solid things can never block the doorway or wall off part of the room. Dust under a moved decoration moves out from under it.
- **Real-achievement decorations (Jay, 2026-10-07), for milestone 12 (certified trophies):** trophies and decorations for earning stripes, belt promotions and days trained in the dojo (10, 25, 50, 100, 250, 500 days, and other fun milestones for students to aim for). They carry the date earned and can only be earned in the real dojo. The decoration list already has a "source" field ready for them.
- **Hidden dojo testing screen:** tap "Home Dojo" in the dojo 5 times. It shows the mess level and has these buttons:
  - **+1 day / +3 days / +1 week away:** pretends the last visit was earlier, then walks back in with the bow, like a real return. +3 days and +1 week also show the welcome-back card.
  - **Clean everything**
  - **Get every decoration**
  - **Start a new dojo**

  The student profile and Power Rating testing screen is still on the Training Board (tap its title 5 times).
- **Saving:** the dojo (decorations, mess, Calm Mind, last visit time) is saved in the player's profile on the phone, as plain data with its own seeded random numbers, so the server can hold it later and classmates can visit it (shared world, step 1 of multiplayer).

## Grok bot team and the art process (Jay, in his Claude chat, 2026-10-08)

- **Five Grok bots join the team,** each with one job: Art Director, Content Writer, Learning & Engagement Designer, QA & Playability Tester (beta testing and balancing as the game nears completion), and Launch Prep (shortly before launch). Their full directions are in `docs/GROK_BOTS.md`.
- **Bots never change code.** Dojo-Ascent Programmer is the only one who changes the game.
- **Each bot has its own folder and branch** (`incoming-art/` on `bot-art`, `drafts/content/` on `bot-content`, `drafts/learning/` on `bot-learning`, `drafts/qa/` on `bot-qa`, `drafts/launch/` on `bot-launch`) and delivers through pull requests that Jay merges. Each folder has a README explaining this.
- **Nothing in a bot folder is approved until Jay says so.** Dojo-Ascent Programmer copies approved files into `assets/` or `content/` only when Jay asks, and never edits files inside the bot folders.
- **The Learning & Engagement Designer's proposals are suggestions,** reviewed by Jay with his Claude chat before anything is built. It also reviews milestone 4's open questions (powers, numbers, black belt degrees), which is the design material milestone 4 is paused for.
- **No art pack is bought.** The Art Director bot makes all art in Blender: low-poly 3D models, rigged and animated (Mixamo allowed), rendered from one fixed top-down three-quarter camera in 8 directions into transparent PNG sprite sheets with a reusable render script. Icons, portraits and scene pictures come from the same models so everything matches. This replaces the pixel-art-pack plan in framework section 13. Details: "Art process" in core-design section 13.
- **Dojo-Ascent Programmer builds the import step:** a repeatable script that trims, sizes and packs approved renders into texture atlases for Phaser.
- **Character customization replaces the placeholder circle:** a layered character (body, skin tone, face, hair style and color, gi, belt), each part rendered separately from the same model, chosen at character creation and changeable at the Home Dojo. The belt is its own layer, recolored in code to the real rank and stripes, and is never customizable. Extra looks are earned, never bought.

### Milestone 5 — changes after Jay's first test (2026-10-08)

- **The bow can't be missed:** only the Bow button bows. Tapping anywhere else just makes the button pulse. In the Tower, the room's enemies stay hidden and frozen until the bow, then appear with a puff and a sound.
- **The dojo is zoomed in (Jay: "very zoomed out, a bit clunky"):** the view is now 6.5 tiles tall (a bit closer than the Tower's 8) and the camera follows the character, instead of fitting the whole room on screen. Decorations are about 75% bigger on screen.
- **Decorating for big fingers (Jay: "very hard to tap on the decorations"):**
  - A tap near a decoration (within 0.7 tiles) picks it.
  - **Tap a decoration, then tap where it should go.** If it doesn't fit, a short message explains why.
  - **Big arrow buttons** (bottom-right) move the selected decoration one step, hopping over anything in the way. Wall items only move left and right.
  - Dragging still works. Dragging the empty floor scrolls the view, and the camera follows the selected decoration.
- **Choose how to move decorations (Jay, 2026-10-08):** a missed arrow tap landed on the floor and sent the decoration across the room. Now the first time you tap Decorate, a card asks **"Tap to move"** or **"Arrow pad"**, and only that style is active. The choice is remembered on the phone and can be changed with the "Move" button. With the arrow pad, floor taps never move anything, the arrows are bigger (60 px), and a backing panel around them catches near-misses. Dragging still works in both styles.
- **Version stamp on the title screen (2026-10-08):** small text at the top-left shows when the build was made (in the phone's own time), so Jay can check his phone has the newest version. Jay's phone showed an older copy after the move-style change was published.
- **Arrow pad never covers the top buttons (Jay, 2026-10-08):** on Jay's phone the arrow pad covered "Done", so there was no way out of decorating. Now the top buttons are always drawn above the pad, and on short screens (browser toolbars showing) the arrows switch from a cross to one row of big arrows (◀ ▲ ▼ ▶) just above the storage tray, instead of shrinking.

## Art import (Jay approved all four art batches, 2026-10-16)

- **Approved:** Batch 1 (player character, every animation), Batch 2 (Tier 1 creatures), Batch 3 (Home Dojo), Batch 4 (Tower rooms). The old one-character test (`incoming-art/character-test/`) is replaced by Batch 1 and isn't used.
- **The import step** is `tools/art-import/import_art.py` (Python 3 + Pillow, a free picture library; Jay OK'd it). It only runs while building, so nothing extra goes into the game. It reads the approved list in `tools/art-import/approved.json` and never changes `incoming-art/`. How to run it and add new art: `tools/art-import/README.md`.
- **Art is shrunk to the game's tile size:** the renders are 80 px per tile, and the game draws 48 px per tile. At full size the art would use about 35 million pixels of phone memory; at 0.6× it uses about a third of that and matches what the screen shows today.
- **Packed art lives in `assets/art/`** as lossless WebP pages (exact pixels, about 40% smaller than PNG; every current phone supports WebP). The game now serves files from `assets/` (the app manifest moved there too). Download: player 2.6 MB, Tier 1 creatures 6.9 MB, Tower rooms 0.2 MB, dojo 0.2 MB.
- **Each area loads only its art:** the title screen loads the character, the Tower loads creatures and rooms, the dojo loads the room and decorations ("load art per tier").
- **A full-detail ceremony pack** (`player-big`, 0.1 MB): the character facing the camera (stand, bow, celebrate) at full resolution, so the promotion ceremony and welcome screens stay sharp when shown big.
- **The warning glow layer** is kept only in wind-ups and attacks (the only times it shows), which saved about 4 MB.
- **Belt colours follow style option C**, worked out from the belt's colours (not a table of Action Zone belt names), so other schools' belts work too. At most 2 stripes, matching `stripesPerBelt`.
- **The bow now takes 1.375 s** (`BOW.ms`, looks only), the art's full bow, instead of 0.9 s.
- **Animations follow the rules:**
  - Tower moves: the jab plays only when standing still, so walking stays smooth. The guard pose is held while guarding. Dash, hit, defeat (kneel) and the bow play once.
  - Dojo moves: sweeping plays when you walk over dust, and kneel-and-wipe and straighten play facing the mat or rack. Calm Mind doesn't use the celebrate move, which is kept for real promotions.
  - The promotion ceremony: the student bows, the new belt is tied, then arms up and a proud stance.
  - Creature wind-ups run on the rules' telegraph clock (so they always end exactly when the hit lands). The warning glow follows the art's per-frame strength and is tinted the same red as the danger circle. The danger circle itself is unchanged.
- **Characters, walls and decorations are drawn front-to-back by where they stand**, so walls and tall decorations hide feet behind them. The dojo's front wall and door are drawn in front of the character.
- **The chest:** it glints until opened, then plays its 2.5 s opening and shimmers. Its light and stars are drawn above the player (who stands on it). The chime, sparks and loot wait until the lid bursts open.
- **Doors:** closed until the room is clear, then they slide open with a warm glow (the bot's version, kept). The boss and home doors borrow the battle and rest doors for now.
- **Dojo mess:** the old "leaf" spots are now muddy footprints, a dropped towel or a water bottle. The internal name stays "leaf" so existing saves keep working.
- **(Done in K24c, see below.)** ~~Possible later improvement:~~ the game draws at the phone's basic screen resolution, not its sharper "retina" resolution, so art can look a little soft on high-end phones. Making it draw at full sharpness touches every screen's layout, so it isn't done yet. Ask Jay if it bothers him.

### After Jay's test of the art (2026-10-16)

- **Jay: "everything appears to be working properly."**
- **Style guide approved.** Moved to `docs/style-guide.md` (the bot's draft stays in its folder). Fonts are still open.
- **Boss door wanted.** Jay asked for a special Floor Keeper door. It's on the Art Director's list. Until it arrives, the boss uses the battle door.
- **Defeat needs to be visible (Jay: "it needs to be bigger and brighter… a small visual reward for killing something", without distracting from combat).** The art's dissolve was a tiny dot of light that disappeared on the light stone floor. Now a beaten creature gets about 1 second of "set free", drawn in code:
  - a warm golden flash;
  - the dissolve drawn 30% bigger, with its shadow fading;
  - a golden ring;
  - 9 small gold stars drifting up (16 and a bigger flash for the Floor Keeper).
  
  These use normal colours with a thin darker edge, so they show on any floor.
- **Next art (brief for the Art Director, 2026-10-16):** `docs/briefs/art-director-batches-5-9.md`. In order:
  - 5: the boss door;
  - 6: the customizable character (tinted skin and hair, pick-one faces and hair styles, colour palettes);
  - 7: Sensei, Senpai and Kohai, with portraits;
  - 8: icons for existing gear, Insights, abilities and decorations;
  - 9: the Yellow belt room kit.
  
  The art bot draws only. Names, words and game rules come from the other bots or Jay. Yellow belt creatures wait until their behaviour is designed.

## Batches 5 and 6 in the game (Jay approved, 2026-10-17)

- **Boss door (Batch 5):** the boss door, the only door in the room before the Floor Keeper, is now the Keeper's stone gate with its crown medallion. Its gold glow pulses while the room is being fought and stops when the door opens. The medallion stays cream and the glow covers only the medallion and frame (the bot's defaults, approved with the batch). The "home" door still borrows the rest door.
- **Customizable character (Batch 6):** 2 bodies, 6 faces, 12 hair styles, and 10 swatches each for skin, hair and gi from the art's palettes.
  - Player frames are now 128 × 160 (the feet anchor is read from the art).
  - The old single-look player packs (from `player-character/`) are no longer used. Body A with face 1, hair 2, skin swatch 2, hair colour 2 and the white gi is the default, matching the approved Batch 1 look.
- **Each piece is its own pack** (body, faces, each hair style, plus a full-detail ceremony pack per body), so a phone downloads only the chosen look: about 4 MB, the same as before. All 24 hair packs together would be about 12 MB.
- **Where the look is kept for now:** on the phone (`dojo-ascent-look`). It can be changed only from the dojo's hidden testing screen (tap "Home Dojo" 5 times → Body / Face / Hair / Skin / Hair colour / Gi).
  - The character creation screen is its own later step (`docs/MILESTONE_PROMPTS.md`). It will save the look with the student's profile.
  - It needs Jay's answers first: how the two bodies are offered and labelled, and the names of the options (from the Content Writer).
- **Character options, labels (Jay, 2026-10-17):**
  - The two bodies are offered as **Boy** and **Girl**.
  - The other options get plain numbered names, no special names: "Hairstyle 1, 2, …", "Eyes 1, 2, …" (the faces), and colours shown as swatches.
  - The Content Writer bot may write short descriptions, but the screen doesn't depend on them.

## Character creation (2026-10-18)

- **When it shows:** the first time a student taps "Tap to start". It's "Choose a look in under a minute" from the first 30 minutes in core-design, and the welcome uses the student's real name and belt: "Welcome, Sam! Sensei says you're a White Belt."
- **Changing it later:** the Home Dojo's **Look** button (top bar) reopens it, with "Done" (save) or "◀ Back" (no change).
- **On the screen:**
  - The character stands large on the left. The belt shows the real rank and isn't a choice.
  - On the right: **Boy / Girl**, **Eyes 1–6** and **Hairstyle 1–12** with ◀ ▶ arrows, and **Skin**, **Hair colour** and **Gi** as rows of 10 colour circles. Each colour's whole cell is the tap target.
  - Every option is open to everyone.
- **Fast choosing:** it uses the full-detail pictures of both bodies (0.8 MB, every face and hairstyle facing the camera), so every change shows at once. The Tower and dojo then load only the chosen look.
- **Saved with the student's progress** (`look` in the profile, checked when loaded), not just on the phone, so it can move to the game server later.
  - A look set earlier from the testing screen is used as the starting point.
  - The testing screen's look buttons are removed.
- **Saving plays the bow.** The celebrate move stays reserved for real promotions.

## Jay's work-board decisions (Jay, 2026-10-18; recorded for work-board item K1)

From section 1 of `docs/work-board.md`.

- **Bow question = recall.** Sensei shows a picture of one of the player's earned abilities and asks "What's this one called?" with 3 picture-and-word choices. After the answer, the character performs the move. A wrong answer warmly shows the right name; there is no penalty. Correct answers are counted forever, with awards at 5, 10, 20, 50 and 100 (may go higher). At most one question per day. It can always be skipped. This replaces the "Which felt best?" draft.
- **Lore comes first.** The Tower's story and enemy lore are launch scope, and the game is built around them where it fits.
- **The Bestiary is launch scope.** An enemy's entry fills in the first time the player defeats it; deeper lore unlocks with each real belt. The unlock schedule in core-design section 13 still needs updating to match.
- **First movement lesson:** "Tap where you want to go, or use the stick."
- **Real techniques decide game effects.** Each self-defense technique's callout and in-game effect must match what the real technique does to an opponent. Jay's descriptions are in `docs/self-defense.md`. The game shows outcomes (off-balance, trapped, thrown, disarmed, escaped). **Exception (2026-10-24):** an enemy can be **Injured** (a short, cartoon status: bandage sticker and dizzy stars) from the break techniques, self-defense #31–40 only. It always recovers or poofs away. No blood, gore, bones or cracks, and never the word "broken" on screen (Jay via Manager, 2026-10-24; spec: `drafts/planning/S4c-injured-status.md`).
- **The QA bot is active now.**
- **Systems design goes to Dojo-Ascent Researcher & Planner.** The board planned a sixth bot, the Game Systems Designer, to own combat, items, Forms, power-ups, difficulty, achievements and rewards. Jay instead gave those items (S1–S8) to the existing bot Dojo-Ascent Researcher & Planner (2026-10-23), so no sixth bot and no `drafts/systems/` folder were created. Answering the milestone 4 questions (powers, numbers, black belt degrees) moves from the Learning Designer to Dojo-Ascent Researcher & Planner; the Learning Designer reviews its work.
- **Claude Code is replaced by Dojo-Ascent Programmer** (Jay, 2026-10-23). Jay no longer works with Claude Code; every mention in `docs/` now says Dojo-Ascent Programmer.
- **Sensei's Lessons timing:** the Lessons system is built in milestone 7 and finished (a lesson for every launch system) in milestone 10.
- **Black belt to 2nd degree (J6, Jay, 2026-10-23):** 2 years between 1st degree and 2nd degree black belt. The game now uses 2 years: Black Belt's time in rank is 24 months in the test profiles (brown/black stays 12), checked by a test. DojoForge's real data needs the same value.
- **Cosmetics (J5, Jay, 2026-10-23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought.
- **Fonts (J7, Jay, 2026-10-23):** Fredoka for headings, Andika for body text. The game still uses the system font until Dojo-Ascent Programmer adds the font files in a later code step.
- **Belt names (Jay, 2026-10-23):** keep the game's wording, "Red/Black Belt" and "Brown/Black Belt". The curriculum's "Red with a black stripe" and "Brown with a black stripe" describe the same ranks.
- **Guided first Counter (G1, 2026-10-23, Learning proposal 6):** On a new profile, the first "!" warning slows the game to half speed and Sensei says "Look! A red circle." / "It's coming!". When the circle is nearly full, the game holds still with Counter pulsing and "Tap Counter... now!" until Counter is tapped, which always gives a Perfect Counter. The next warning: three-quarter speed, pulse, "Wait for it... Counter!". The one after: normal speed, small pulse, "Counter!". Then the guide is done for that profile. The lines come from `content/tutorial/sensei-lessons.json`. The hold-still rule is in `packages/sim` (world `guide`); the slowdown and pulse are in the client. Saves made before G1 by players who have already played a run skip the guide. Open questions are in the G1 pull request's DECIDE list.

## S1 change 1: enemy mixes (Jay, 2026-10-23)

- Five new battle rooms, each built around one enemy mix from the S1 proposal: **Brute and Swarm** and **Stone Garden** (brute + swarmers), **Guarded Swarm** and **Shield Escort** (shield + swarmers), and **Twin Shields** (only shields, so Focus runs out and Perfect Counters matter). Each room file says its mix in a `"mix"` line.
- Room files can now set `"earliestRoom"` (1 = first room of the floor). Harder mixes wait: Stone Garden from room 2, Guarded Swarm from 3, Shield Escort from 4, Twin Shields from 5. Brute and Swarm can come first. Rooms without the line can come any time, as before.
- Balance check (computer player, 1,000 runs each): novice on Standard won 35% before and 41% after (smart play); 19% before and 19% after (standing still). The limit was a drop of no more than 3 points.

## S1 change 2: Perfect Counter chain (Jay, 2026-10-23)

- Perfect Counters in a row (no Hit taken in between) make a chain. Focus per Perfect Counter: +25 for the 1st, +30 for the 2nd, +35 for the 3rd, then +40 from then on. Focus still stops at 100.
- A Hit ends the chain. A Block keeps it but doesn't add to it. The chain starts again in each room.
- From x2, the screen shows "PERFECT x2", "PERFECT x3"... under the combo counter, with a glow that gets brighter up to x5.
- "Longest chain" is not a personal best (Jay, 2026-10-23).
- Balance check (computer player, 1,000 runs each): Strikes per fight room went up 11–18% depending on the player (the limit was 20%). Novice on Standard won 35% before and 40% after (smart play).

## S1 change 4: room twists (2026-10-23)

- Three starter twists from the S1 proposal live in `content/twists/twists.json`: **Lantern Dark** (the room is dim, warning circles glow extra bright on top), **Slippery Floor** (Dash goes 1.6 times as far), and **Bell Room** (each Perfect Counter rings a bell; the 3rd bell drops a bonus prize, at least Uncommon).
- A room gets at most one twist. Only Tower battle and challenge rooms can get one, never the first room (kept calm for the guided first Counter) and never the boss. The chance per such room is 50%, which comes to about 1 room in 4 over a whole run (25.6% in a 200-run test).
- The rules are in `packages/sim` (Dash distance, bells, the bonus prize). The dim look and the banner are only in the game screen.
- No twist hides a warning. A test checks that every twist room gives exactly the same warnings, at the same times, as the same room without a twist. Lantern Dark draws the warning circles above the dimness. The twist banner sits at the top of the screen and fades back as soon as any warning starts.
- Each twist room shows a banner with a drawn icon (no emoji, so it looks the same on every phone) and Sensei saying the rule in one line. A small icon stays at the top while you're in the room; in the Bell Room it shows the bells rung, like "1/3".
- The banner and Sensei lines are the Content Designer's final text, copied word for word from `drafts/content/text/room-twists.json` (PR #23). The long Bell Room banner fits on one line at 844x390, so it is used.
- **K5 follow-up (2026-10-23):** Slippery Floor keeps its 1.6x slide but stays out of the first 3 rooms of every floor. Twists now have an optional `"earliestRoom"` field, like rooms do; Slippery Floor has `"earliestRoom": 4`. A test checks this and fails without the rule.
- **K5 balance check** (1,000 runs each, after main with G1 was merged in): novice on Standard (smart play) won 50% on main and 42% with twists. With twists switched off on this branch (so only the room order changes) it won 47%. Standing-still novice: 25% → 25%. Guided: 98% → 99% and 95% → 95%. Typical and sharp players didn't change. Keeping Slippery Floor out of rooms 1–3 didn't raise the novice number (44% before this change, 42% now). Only Slippery Floor changes the fighting itself, so most of the gap is probably random variation and the different room order. Jay decides whether to keep it.
- **G1 nudge final text (K5):** the nudge line is now the Content Designer's final "Take your time. Tap the blue COUNTER button!" from `drafts/content/text/guided-counter-nudge.json`, and the `nudgeStatus` placeholder marker is removed.
- Balance check (computer player, 1,000 runs each): novice on Standard (smart play) won 50% before and 44% after. Of that, 3 points come only from the rooms being shuffled differently (47% with twists turned off), and 3 points from the twists themselves. Standing-still novice: 25% → 26%. Guided: 98% → 99% and 95% → 95%. Items per run went up by about 1 (the bell prize).

- **G1 follow-up (2026-10-23):** If the guided Counter's hold waits 5 seconds with no tap, Sensei shows a kind hint and Counter pulses more strongly. This repeats every 5 seconds and never ends the hold (the rule is in `packages/sim`). The hint line is a placeholder that needs the Content Designer's approval. The guide also runs in the practice room. There's no existing place to replay it, so players who finished runs before G1 still skip it.

## K7: wiring the PR #10 art (2026-10-24)

- **Tower art by belt tier.** `apps/client/src/art/tiers.ts` picks the tower pack from the student's belt tier: tier 1 (White) uses `tower-t1`, tier 2 (Yellow) uses `tower-t2`. Higher belts use the newest kit until their own art arrives. `?tower=t1|t2` forces one for testing. The Tier 2 name is "Sunrise Garden" (PR #30); no tower name is shown on screen yet.
- **Icons at full size.** The `icons` pack uses `"scale": 1` instead of the usual 0.6, because icons are drawn in menus (22–44 px) and 0.6 would have left them blurry on sharp phone screens. The whole set is about 0.1 MB.
- **Auras: art only, no rules.** Elites aren't in `packages/sim` yet, so K7 only packs the auras (`auras-t1`, per-enemy entries only; the 256 px masters are reference) and draws them on the test link `?aura=swift|guarding`. The Floor Keeper's art id is `keeper`, so `auraId()` maps `floor-keeper` to it. Who becomes elite and what each aura does is S1 #3.
- **Small worn-gear icon.** On a 667 px phone the worn-gear boxes are narrow, so the icon sits small (22 px) beside the slot name and the item name keeps the full width.

## S1 #3: elites (2026-10-24)

- **Numbers in a data file.** The spec says a `config.ts` ELITES block; Jay asked for one data file instead, so every elite number is in `content/elites/elites.json` and is checked when it loads.
- **Picking.** The chance is rolled first, then the kind, then a random eligible enemy from the whole room. If Guarding isn't allowed (Guided, the first floor of a belt) or there is no brute or shield, it becomes Swift. A room with no eligible enemy still uses up its roll.
- **Extra decoration drops where the elite falls**, not in the room chest, because battle rooms may have no chest.
- **Guarding cut comes first** in the damage math (0.67x), so Perfect Counter's stagger and Strike breaking a shield work the same.
- **Balance (60 runs each, smart play, 4th-belt profile):** sharp 100% → 100%, typical 100% → 93%, novice 45% → 48%, novice Guided 100% → 100%. With every fight room forced to Guarding, room time is 1.06–1.12x (worst single room 1.43x for the novice).
## K7-fix (2026-10-24)

- **One-line text on the Training Board.** Gear and Abilities text shrinks (not below 9–10 px), then cuts with "…", instead of wrapping onto the line below. The selected item's detail still shows the full name and stats.
- **Insight card border = icon accent colour.** The colours come from the PR #56 colour key and are kept in `apps/client/src/art/icons.ts` (`INSIGHT_ACCENT`). The top stripe keeps the family colour.
- **Live deploy.** The K7 merge and the merges right after it (09:17–09:37 EDT, `f89af8a`…`7c595d6`) got no Cloudflare build. The first build after them (`a4b0d16`, 09:45 EDT) published K7. QA had checked the live link before that build ran.

## K2: Street Smarts scene (2026-10-24)

- **Script stays data.** The scene only draws what `currentLine()` returns. The loader checks every link (choice → branch, retry → choice in the same scene, star choices), so a typo fails at load time instead of trapping a player.
- **Stars follow the script's rule.** `starChoices` lists stay, helper and offer in the content copy. Only the first try at each one counts. Voice is required but earns no star, so the max is 3.
- **After a good branch**, the story goes on from the line after the choice. A retry branch's last line jumps back to its choice.
- **2–4 buttons per choice (CLAUDE.md rule 15).** The loader enforces 2–4. The store script uses the Content Designer's trimmed 4-choice helper question (#79); the temporary `pendingTrim` exception is gone (K2-trim).
- **Read-aloud uses the browser's own speech** (`speechSynthesis`), so no new package. It's on by default when the scenario's age band is 6–9, and the player's on/off choice is remembered.
- **Profile gets `streetSmarts: { best, grownup }`**, and older saves get a blank default.
- **Opens at the 2nd belt** (core-design). The tier lives in content/street-smarts/ui.json (`unlockTier: 2`); the Dojo button is hidden below it. The `?street=` test link opens it at any belt.

## K9: elites QA fixes (2026-10-24)
- **One wiring point for difficulty.** `runDifficulty(profile, testLink)` in packages/sim/src/profile.ts. The M7-P1 choice screen isn't on main yet, so the profile field starts at null (= the default); M7-P1 just sets it. GameScene builds the room from `run.difficulty`; the `?difficulty=` link only still feeds the practice room directly.
- **Boss bar in the HUD top strip** (y 16, width fits between the player's bars and the room label), never over enemy heads.

## M7-N1: named monsters (2026-10-24)
- **Stickers are decorations with source `named`.** The loader fails if a monster's sticker isn't one, so a typo can't hand out a missing prize.
- **`runsStarted` counts runs begun** (the "first 3 runs" rule). Older saves start it at `runsPlayed`. Test-link runs don't count.
- **Its own random stream.** The named roll uses a separate rng seeded from the run seed, so rooms, enemies and elites stay the same as a run without it, up to the named room.
- **Earliest wave.** The named monster replaces an enemy in its type's first wave, so it's there when the room opens. If the rolled type isn't in the room, another tier monster whose type is there takes its place.
- **No elite in the named room.** Elites are still picked (so the rng doesn't shift) and then dropped; they don't count toward the elite cap.
- **Forced test links** (`?named=`) put it in the first battle room from room 3, or in any room with `&room=`. These test runs do **not** write the journal or give the sticker (changed in K10): `meetNamed`/`beatNamed` take the run and do nothing when `run.test` is set.
- **Journal facts on landscape phones (K10):** each card's fact sits in a note beside the page at 15px on screen (the Street Smarts body size), not inside the scaled card, so it is readable and clear of the stamp. Screens too narrow for the notes keep the fact in the card, at 15px on screen, left of the stamp spot.
- **Reduced motion** is the phone's `prefers-reduced-motion` setting (the game has no setting of its own yet); it turns off the stamp shake only.
- **Journal button text** is content (`journalButton`), and the button shows from `rules.minBeltTier`.

## K10: K9 retest fixes (2026-10-24)
- **COMBO goes left during a boss fight**, under the player's bars, instead of lower in the centre, where it would collide with Sensei's banner.
- **The Sensei banner checks the door labels on screen** (they scroll with the room), so the fix works in every room, not just the Keeper's.
- **The forced-elite test link keeps the belt and first-floor bypass**, but Guided still wins over Guarding (it becomes Swift, the same swap as normal play).

## K12: Q3 named-monster fixes (2026-10-24)
- **Equal mix over a steady rate.** The swap to another named monster whose type is in the room (K-M7) made Zippy Zoom about 45%. It's gone: the rolled monster waits for a battle room with its type. The roll is still 5%, but a few floors never offer such a room, so slightly fewer floors get one. This replaces the "Earliest wave" swap note above.
- **Test links are steered, normal runs are not.** `?named=` runs pick rooms with the asked-for type from room 3 and allow a challenge room, so the link always works whatever doors are taken. Normal runs never steer room picks, so the "same rooms with or without it" rule still holds.
- **Reduced motion is a device setting** (localStorage `dojo.reducedMotion`), not part of the profile, because it's about the screen, like the OS setting it starts from. The switch is on the Title screen, because Settings (#108) isn't on main yet. After #108/#110 merge it should move into Settings (behind the grown-up gate) and leave the Title screen.
- **What stays with reduced motion:** wind-up poses, the telegraph glow, the shield tap and the player's red hurt tint. These are information, not decoration.
- **This replaces the K-M7 note** that reduced motion is OS-only and turns off only the stamp shake.

## K12: named monsters rarer (2026-10-24)
- `rules.chancePerRun` in content/named/named.json goes from 0.05 to **0.0333**, about 1 in 30 eligible runs (Manager call). The other spawn rules stay the same: yellow belt or higher, after the first 3 runs, room 3 or later, battle rooms only, at most one per floor, no elite. The 5% roll mentioned above is replaced.
- Because some floors have no battle room with the rolled type, the measured rate is about 2.8% over 1,000 seeds. The test band is now 2–4.5%.

## K12: Bouncy Bopper art imported (2026-10-24)
- Merged main (#111, A5 full set). New pack `enemy-bopper` in approved.json (the source files keep the `padded` names, per Jay). `import_art.py` was re-run. That also refreshed the player packs to the A7 art Jay approved (`#34303f` black hair swatch), which main had not re-packed yet.
- Bopper has no content json yet, because HP, power and push-paw power are still DECIDE items (#102). For now it appears only through the test link `?skin=bopper`, which draws Bopper on every enemy and changes only the picture (like `?aura=`). It is not added to any spawn pool.

## M7-P1: starting difficulty (2026-10-24)
- **Who starts on Guided:** a new profile (no runs started or played) whose feed age band tops out at 9 or under, **or** a white belt (tier 1) with 0 sign-offs at that belt (Manager decision, Oct 24). Everyone else starts on Standard.
- **Kid-facing names:** Guided / Steady / Challenge. "Standard" stays the internal id (`standard`) and is the default.
- **Never switched off a choice:** the first pick in Settings saves `difficultyChosenByPlayer: true`, and the game never changes it after that. A profile that already has runs but no difficulty gets Standard, not Guided.
- **Age band parsing:** the top number of the band ("6-9" → 9) is compared with `guidedUpToAge`. All four fake profiles are "10-13", so profile 1 gets Guided through the white-belt rule.

## M7-P9 — Play-time limit
- Ends after the current room (at the door) as a new run result `rested`, never mid-fight; loot is kept like a cleared run.
- Session = play with no 30-minute break (tunable in content). Open: is 30 min right, and should the reset be daily instead?
- Grown-up gate is a 2-second press-and-hold, not a math question or PIN. Open: is that enough of a gate?
- If time is already up when a run starts, the child still gets to play that first room. Open: block new runs instead?

## M7-P11 — Resuming a run after the app closes
- Saved at each room's start, not mid-fight: a room can't be rebuilt mid-wave, and replaying one room is fair. Open: OK, or should mid-room chest loot be kept too?
- The choice is offered in the Home Dojo ("Keep climbing" / "Rest for now"). Resting banks the loot, like the play-time limit.

- ~~**Age band parsing:** the age-based Guided default~~ was removed by the Manager call below (2026-10-24).

## M7-P1 update: everyone starts on Standard (Manager + Learning Designer, 2026-10-24)

- **Everyone starts on Standard** ("Steady" to kids). No age-based Guided default and no age question. `settleDifficulty(profile)` only fills an empty difficulty.
- **Kind Guided offer:** after `offerAfterLosses` (2) lost runs in a row on the same floor (belt tier), a card offers Guided before the run-over card. A clear resets the count; resting doesn't count. At most once a day (`guidedOfferedOn`, local date). The text never mentions losing (a test checks). It never switches by itself: only "Try it" changes it.
- **Offer resolved (C9 update):** the Learning Designer's review (#114, SHOULD 3) settles it: the offer is for **Guided** ("Want more time to COUNTER?" / "You can try Guided…", buttons "Try it" / "No thanks"). Steady stays Standard's kid name.
- **Home line** "You're on {name}…" shows once ever (`difficultyLineShown`).
- **Standard card** now reads "The usual pace."
- **Guided in Settings:** still on the Settings choice screen. In P1 that screen isn't behind a grown-up gate; #110 (P9) adds the grown-up gate. Merge #108 before #110.
- **Fixture:** `fixtures/5-white-belt-age-6-9.json` (Mia R., ageBand 6-9) for testing young players; it starts on Standard like everyone.
- All text is in content/settings/difficulty.json.

## M7-P9 update: daily play time, math gate, resting door (Manager + Learning Designer, 2026-10-24)

- **Daily, not per sitting:** play time adds up through the day and resets at **local midnight** (`PlayClock {date, playedMs, lastSeenMs}`). The 30-minute-break session rule is gone. Time away counts only up to `maxGapSeconds` (60), so a tab left open overnight or a long break isn't counted.
- **Grown-up gate is a sum**, not press-and-hold: "Grown-ups: what is a + b?" (a 12-19, b 6-9) with 4 choices. A wrong answer quietly goes back. `makeGateQuestion` in sim, tested.
- **When time is up mid-run:** the current room finishes, then "Great training today!" (as before).
- **No new run until midnight:** the Tower door shows "Your dojo is resting for today / Come back tomorrow for more training!" and no run starts. The Board's ENTER THE TOWER and the lost card's Try again go to the dojo instead.
- Text in content/settings/play-time.json.

## M7-P11: room pickups on resume (Manager call, 2026-10-24)

- **Accepted:** when a run is resumed, the room restarts fresh, so pickups already collected in that room (but not yet banked) are lost. Everything banked from earlier rooms is kept. No change planned.
## C9 wording (PR #115) on P1 (2026-10-24)
- Card texts: Guided "More time to COUNTER while you learn.", Challenge "Faster enemies and less time to COUNTER." Standard keeps "The usual pace." (the Manager/#114 must-fix wins over C9's "The normal way to train.").
- Home line: "You're on {name}, and you can change it in Settings." "any time" is two words everywhere.
- **Caps rule (Manager):** only fight-button names (COUNTER, STRIKE, DASH…) are in caps; menu buttons use normal case ("Settings", "Try it", "No thanks").
- **Selected difficulty:** marked with a ✓ before the name as well as the gold border, never colour alone.

## C9 wording (PR #115) on P9 (2026-10-24)
- Wrap-up line: "Nice work, let's finish this room and rest!" Rest card lines: "You trained hard today!", "Rest now, or show a grown-up your moves.", "Everything you found is safe in your dojo." The card now draws every line in restLines.
- Grown-up help: "…Then the game praises their training and returns to the dojo…". Menu buttons stay in normal case.

## C9 wording (PR #115) on P11 (2026-10-24)
- Resume card line: "You'll start again at room {room}." (the "of {total}" part is dropped). Buttons stay "Keep climbing" / "Rest for now" in normal case.

## K12b — Reduced motion in Settings; Bopper as a real enemy (2026-10-24)
- Reduced motion toggle moved from Title to the Settings sheet (bottom-left, beside "For grown-ups"); fits 667 and 844 wide.
- Bopper (`content/enemies/bopper.json`): HP 110, damage 16 (#102), disarmed push 8 (#118) via new `weapon.disarmedPower`. Wobbly 6 skipped.
- Spawn gating is room-level: new `minBeltTier` on rooms (default 1); `bopper-yard` and `staff-and-shield` require Yellow (tier 2).
- Bopper drop chance 0.1 (same as shield) — my guess, not a decided number.
- `?skin=bopper` removed (Bopper is real now); use `?room=bopper-yard` to test.

## Decor Tier 1 import (A6 pack, C10 text) (2026-10-24)
- New art pack `decor-tier1` (only `incoming-art/decor-tier1-a6/sprites/static.json`; `decor-pool-a6` left out).
- 27 pieces in decorations.json with C10 ids/names/lines: 5 random, 13 class, 3 keeper statues, 5 trophies, 1 bonus folding screen. Old Stone Lantern, Bonsai Tree, Dojo Banner kept.
- Tinted pieces: `<id>` then `<id>-tint` with setTint. Colour 1 = info.colour1; colour 2 = belt colour, or #d2a878 on White. For now colour 2 uses the current belt (pieces don't yet remember their drop floor).
- `mustTouchWall`: the folding screen's top row must be row 1, and it may not stand in front of the notice board column.
- Bow mat and cushion walk-through; other floor pieces solid — my guess.
- No earning/drops yet (next PR).

## Decor earning (S7) (2026-10-24)
Manager calls:
1. Class pieces: one every 2 classes at White belt, then one every 3 after White.
2. Uses the feed's `attendance.classesTotal` (optional) and gives one welcome class piece on the first sync.
3. Old saves seed `classesCounted` from `classesInRank` (max with classesTotal); it never goes down.
4. Class pieces in a fixed order: the class scrolls in curriculum order (file order), then gear.
5. `keeper-statue-floorN` the first time the Floor Keeper is beaten at belt tier N.
6. Each monster kind's Journal trophy on its first defeat (win or loss), including Floor Keeper and Bopper. A named monster's sticker comes with its kind's trophy.
7. S7 rates: boss 0.05, treasure 0.04, challenge 0.03, elite 0.15. Old tower pieces stay in the surprise pool; new pieces before repeats, up to 3 copies each; shown as "A surprise!".
8. Each random piece gets a 50/50 colour roll; kinds count by piece, not colour.
9. The folding screen once every Tier 1 Journal trophy is earned.
10. The meter and the lesson are left out of this PR.

My calls (not Manager):
- Classes count one per date (YYYY-MM-DD); two check-ins the same day count once. Fixture feeds shift dates to "now", so in dev a fixture can count new classes on a new day.
- "Tier 1 Journal entries" = trophies with `journalTier: 1` (swarmer, shield, brute, floor-keeper). Bopper is `journalTier: 2` (Yellow+).
- Trophy monster ids are enemy ids: Bopper `padded`→`bopper`, keeper `keeper`→`floor-keeper`. Content load fails if a trophy names an unknown enemy.
- Each piece stores its drop belt (`belt: {tier, color}`): the run's tier for Tower pieces, the current belt for class pieces. Colour 2 uses it (tan on White). Older pieces use the current belt.
- Test-link runs find no surprise pieces and bank no decorations (fixes the bankRun leak). Once every surprise piece has 3 copies, the roll gives nothing.
- C11 unique names applied to statues and trophies.

## Journal kinds (2026-10-24)
- The Monster Journal now turns pages: page 1 is the named monsters, as before. After it come the monster kinds, three per page, in trophy order (Journal tier, then file order): swarmer, shield, brute, floor-keeper, bopper.
- A kind counts as met once its Journal trophy is given (`decorEarning.given`); trophies come on first defeat (S7). Met cards show the trophy art, the trophy's name, its description as the fact, and the win stamp. Unmet cards look like the named ones: a silhouette, "?" and "Keep exploring!". Floor Keeper and Bopper have no silhouette art, so their unmet cards show a big "?" in the well. All text comes from decorations.json and named.json; nothing new was written.
- Bopper is listed for every belt (the Manager asked for all five), though its trophy can only drop from Yellow on.
- The sim helper `journalKinds` (earning.ts) builds the list and has a test.
- Manager call (2026-10-24): met kind cards show the plain enemy name, not the trophy name. It comes from the enemy file: new optional `shortName` (falls back to `name`); only Bopper sets it ("Bopper", since its `name` is "Bouncy Bopper"). No new story text. Fits the name box at 667 and 844.
- Manager call: the Artist will make Floor Keeper and Bopper silhouettes (A8); they will be wired in when they land. Until then their unmet cards show "?".

## Rest refresh (2026-10-24)
- After "Rest for now" on the resume card, DojoScene now uses the profile that `bankRun` returns and takes its dojo with `homeDojo`. Before, it reloaded only the profile, so `this.dojo` still pointed at the old dojo object: the new pieces didn't show, and later dojo edits went to that old object. Those edits could be lost, or could overwrite what was banked. The new pieces go to storage, so the walkable room doesn't change; redrawing is enough.
- There's no client test harness and adding one would mean new dependencies, so this fix is checked with before/after screenshots instead of a test.

## Form idles and Journal silhouettes (K14) (2026-10-24)
- Stance idles come from a separate A2 JSON, so the importer gained `mergeAnimations` (same frame size and anchor, no name clashes) instead of hand-merging rigs. The `-big` packs are left out (no stance art at that size).
- The link from Form to idle is data: each stance animation carries `form: <Form id>` from the art JSON. The client plays the animation tagged with the active Form's id and falls back to `idle`. A new Form needs only tagged art.
- Each Journal trophy names its `silhouette` sprite in decorations.json; a missing one falls back to '?'. A test checks every named silhouette and Form idle exists in the packed art.
## M7-P2 tutorial floor (2026-10-24)
Manager calls:
1. A "session" is a calendar day with at least one run. P5 builds the counter.
2. lesson-move is dropped; the walk-to-the-glowing-spot step teaches moving.
3. The Brute step uses only the guided Counter lines, not "Red circle!".
4. Strike is taught in the boss room when Focus fills; nothing else new in that room.
5. The chest tier uses the C7 name kids see. C7 names are not in content yet: theme.ts still shows "Uncommon", so that is what kids see for now.
6. Only brand-new profiles (runsStarted 0 and runsPlayed 0) get the tutorial floor.

My calls (not Manager):
- Tutorial floor = 3 rooms (battle → treasure → boss), each a dedicated `tutorial: true` room; normal floors never pick them. New `G` tile marks the glowing spot (tutorial rooms only).
- "Doing nothing can't lose": tutorial worlds have minHealth 1, enemies wait until the spot is reached, and the guided Counter holds still until COUNTER is tapped.
- The Insight is given automatically after the tutorial battle (no menu). The chest rarity is raised to at least uncommon.
- The easy boss is the normal Floor Keeper at 35% health and no summons (a world option, so no new art).
- `?tutorial=1` test link replays the floor.

## Kid-facing rarity names in content (K16) (2026-10-24)
- C7 (PR #92): kids see Everyday / Special / Rare / Epic / Legendary. The names are content (`rarityNames` in content/loot/gear.json); every rarity must have one or the game won't load. Ids (`common`, `uncommon`, ...) stay as they are in data, saves and code.
## Large stance art parked (K14) (2026-10-24)
- Manager call: the large (`-big`) stance art is parked for now; the dojo keeps the plain idle, which is fine.

## M7-P5 Sensei's Lessons and the Lesson Scroll (K17) (2026-10-24)
Manager calls:
1. A session is a calendar day (the player's own clock) with at least one run. next-plan-milestone-7.md now says so (it said "app open after 30+ minutes away").
2. The lesson file stays at content/tutorial/first-session-lessons.json (the plan said content/lessons/).
3. Each lesson has a `triggerKey`: the game event that brings it up. Keys are unique (load fails otherwise).
4. Both limits stay: one new lesson per session (unless `ignoresSessionLimit`) and one new lesson per room.
5. The fading follow-ups (counter hints 2 and 3) and line-welcome-home are left off the Scroll (`"scroll": false` in data), and never count toward either limit.
6. Follow the lesson file: no Move lesson, and Bow only on the tutorial floor.

My calls (not Manager):
- The profile keeps `lessons: { seen: [{id, day, room}], sessionDays: [] }`. A run started from the dojo, board or "next floor" adds today; test-link runs (?room=, ?twist=, ?elite=, ?named=) don't, same as runsStarted.
- The tutorial floor teaches on its own guide path (no limits); those lessons are saved as seen so the Scroll lists them.
- Triggers: twoAttacksAtOnce = a warning starts while another is still filling; firstStepOut = the player was inside the circle when it showed and the swing hit, blocked and countered nobody; firstPerfectUnaided = a Perfect Counter with no guide running; firstInsightChoice = the Insight picker opens; firstDecoration = entering Decorate (after the move-style choice). firstHomeReturn: first return home after the tutorial floor (wired in K17b).
- The Scroll is a Dojo button (row 2, left of Journal). Tapping a lesson replays it one screen per tap as a Sensei card, ending with its practice line. "Replay the tutorial floor" starts the tutorial floor (same as ?tutorial=1) as a normal run.
- Scroll names for lessons live in apps/client/src/game/lessons.ts (no new content field).

Follow-up (K17b):
- Manager call: the Decorating lesson shows right after the move-style choice, on the same first Decorate visit (not the next visit).
- Manager call: line-welcome-home is wired. It fires (once) on the first return home after the tutorial floor, as a Sensei card before the other welcome cards.
- The dojo's once-ever difficulty line moves below the second button row (Scroll, Journal, Street Smarts), so nothing covers it at 667 or 844 wide.

## M7-P4 Unlock cascade on the first return home (K18) (2026-10-24)
- Manager call: the cascade plays on the Training Board (HomeScene), where the tutorial floor returns. Sensei's welcome-home line (line-welcome-home, K17) plays first, then the cascade. The welcome line moved out of DojoScene.
- Manager call: if the Beginner's Stance weren't a real ability it would be a label only. It is real (`forms[0]` in content/abilities/abilities.json), so the preview uses its name from there.
- Order: an opening card ("You've already earned these in the dojo."), then each sign-off in the order it was earned (its ability on the card), then each stripe. More than 3 sign-offs are shown together on one screen, as before, so a green belt isn't buried in cards.
- Nothing plays twice: the snapshot is saved when the cascade ends. Fake profiles now shift their dates by whole days, so the last class doesn't change on every visit (it used to replay the Dojo Blessing on each visit).

## M7-P10 Three next goals (K20) (2026-10-24)
Manager calls:
1. The goals card shows after the run summary (and after any celebrations), at most once per day, and after the play-limit card when that shows. No new button: a tap anywhere closes it.
2. When there's no next technique, the real-world goal says exactly: "Keep practicing with Sensei, and your next test will come!"

My calls (not Manager):
- Three goals, always in this order: in the Tower (next level up to the belt's cap, then beat your best combo), to collect (beat a met-but-unbeaten named monster for its sticker, else a new decoration, else new gear), in the dojo (the Path's next technique and what it unlocks).
- No "N of 41 found" count on the collection goal: a long list of missing things reads like a chore.
- A seal ability with no power yet reads "a new Technique Seal".
- "Once per day" is saved on the profile as `goalsShownOn` (local date). Home only considers the card when opened straight from a run (`{ fromRun: true }`: cleared, "Back home" after a loss, or the rest card).

## M7-P7 Gradual unlock schedule and Welcome Week (K19) (2026-10-24)
Manager calls:
1. K19 shares K17's budget: one new thing per day in total (a lesson or a system).
2. The dev day offset is for the dev/test screen only, so "+1 day" really moves the session day forward.
3. Welcome Week is for existing students only (any sign-off, or a belt above white). There are no countdowns and no "you missed" messages, and the week resumes at the next session.

My calls (not Manager):
- The schedule is data in `content/settings/unlock-schedule.json`, in this order: Street Smarts, Monster Journal, Sensei's Scroll. A system the belt hasn't opened yet (`minTier`) is skipped. Later systems plug in at milestone 10. Board, Tower, Look, Difficulty and Decorate are first-session core (core-design section 13), so they're always open.
- Sensei introduces the day's system in the dojo as a card after arrival (after the welcome cards and celebrations), and its button appears then. Abilities are untouched: all earned abilities arrive on day 1.
- The tutorial floor's guided lessons (warning, Counter, Strike) don't use up the day. Perfect, Block and Step-out keep ignoring the limit, as in K17.
- Whether a profile takes Welcome Week is decided once, the first time the dojo checks. Saves that already played before this change keep everything open.
- The dev offset is kept in localStorage (`dojo-ascent-dev-day-offset`). `localDay()` adds it, so sessions, lessons and Welcome Week all move together. The testing screen shows the session day.

## Kid-facing tone pass (K19 follow-up) (2026-10-24)
Manager calls:
- The Welcome Back card body line 'Your dojo missed you.' becomes exactly 'Your dojo is ready.' (DojoScene.arrive). The card title already says "Welcome back, {name}!".
- The run-resume title (content/settings/run-resume.json) "Your climb is waiting!" becomes 'Pick up your climb?'.
- The Tower door's doorRestingLine (content/settings/play-time.json) "Come back tomorrow for more training!" becomes 'More training tomorrow!'.
- Old saves (from before M7-P7) keep everything open and skip Welcome Week.
- If the app closes mid-play during the K18 unlock cascade, the cascade replaying on the next return is fine.

## M7-P13 Learning Designer fixes (K22) (2026-10-24)
From the review in PR #151 (drafts/learning/m7-p13-recheck.md). Manager calls:
1. **C1:** the three-goals card starts at session 2. In session 1 the first return home shows only the welcome line and the unlock cascade. `goalsDue` now also needs `sessionNumber(profile.lessons, today) >= 2`. Home checks it with the same session clock as lessons (`localDay`), so the testing panel's day fast-forward works.
2. **C2:** "Take your time. Tap the blue COUNTER button!" → "Take your time. Tap the glowing COUNTER button!" (tutorial-floor.json tutorial-brute nudge; first-session-lessons.json lesson-counter-guided nudge). No colour-only pointer.
3. **C3:** tutorial-insight success "It will help you on this climb." → "It will help you until you go home." This was the only "this climb" line kids see.
4. **C4:** fight-button names in kid-facing text use the same capitals as the buttons (COUNTER, STRIKE, DASH):
   - abilities.json follow-up-kick: "Your Strike adds a second kick." → "Your STRIKE adds a second kick."
   - abilities.json quick-combo: "Practiced combos flow smoothly: Strikes cost 8 less Focus." → "Practiced combos flow smoothly: each STRIKE costs 8 less Focus."
   - abilities.json escape-step: "A Block instantly recharges Dash, so you can get away." → "A Block instantly recharges DASH, so you can get away."
   - abilities.json perfect-discipline: "For {s} seconds, every Counter is a Perfect Counter." → "For {s} seconds, every COUNTER is a Perfect Counter."
   - first-session-lessons.json lesson-dash: "Too many circles? Dash away." → "Too many circles? DASH away."
   - named.json Captain Clank senseiTip: "Listen: clank, clank, clank, then Counter!" → "Listen: clank, clank, clank, then COUNTER!"
   - Unchanged on purpose: move names ("Perfect Counter", "Block"), meters ("Focus", "Health"), the Virtue/Form names on the Abilities cards, and the Scroll's lesson titles ("Counter", "Strike", "Dash").
5. **C5:** goals card real-dojo line: "Get {X} signed off to unlock …" → "Show Sensei {X} in class to unlock …", and "Get {X} signed off in class." → "Show Sensei {X} in class."
6. **C6:** Sensei's Seal celebration "You are approved to test." → "You're ready for your next belt test!"

## K22b Locked-card wording and wrapping Abilities cards (2026-10-24)
Manager calls:
1. The locked ability card's line "Sign off {X} to unlock (catch-up)" is now "Show Sensei {X} in class to unlock" (e.g. "Show Sensei Self-Defense #4 in class to unlock"). Both this line and the goals card's real-dojo goal use one template, `showSensei()` in packages/sim/src/goals.ts. The "(catch-up)" tag is dropped: it no longer reads well after "to unlock", and the Your Next Step card already says "Catch-up from {belt}".
2. Abilities cards wrap their description and status lines instead of shrinking them and cutting them off with "…" (Rooted Form, Create Distance). Each card is as tall as its text, and a page holds as many cards as fit. Text unchanged. At 667 wide this gives 6 pages instead of 4 for the yellow-belt fixture.

## M7-P12 playtest fixes (K23) (2026-10-24)
Manager calls:
1. **First-floor results card:** after the tutorial floor, Home first shows one simple card: "Floor cleared!", the best room grade, one reward ("You found: {best item}", or a dojo decoration if no item), and Continue. No Sensei popup sits on top. Sensei's welcome, the unlock cascade and the goals come after Continue.
2. **Treasure mark:** the '$' room chip is now a small chest drawn in code (lid, box, band, lock in gold). No new art files. Rest rooms keep '+'.
3. **One short sentence each, kept in content data.** Title and Create lines moved out of client code into the new content/settings/screens.json:
   - Title: "Climb the Tower. Train in the dojo." → "Climb the Tower and train in the dojo."
   - Create: "Sensei says you're a {belt}.\nMake your character!" → "Sensei says you're a {belt}, so make your character!"
   - Guided offer (difficulty.json): "You can try Guided. You can change it any time in Settings." → "Try Guided, and change it any time in Settings."
   - Street Smarts unlock (unlock-schedule.json): "Practice staying safe out in the world. Tap Street Smarts to try it." → "Tap Street Smarts to practice staying safe."
4. **'-100 health': dropped.** The room-clear line no longer shows health lost. It still says "no damage" on a clean room.
5. **Sensei banner vs the treasure door:** the banner's every-frame placement now keeps off the whole door (its tile plus two tiles above the name label), not just the label. It moves just below the door when they would overlap.
6. **'3 COMBO' clears when the fight ends:** no enemies left standing, or the hero is down.
7. **Named monsters checked by hand** with ?named=old-thumper&room=brute-and-swarm at 667 and 844: the name plate and the "freed" line both show.
Also: the Home "For your dojo" line now measures its own height, so a two-line list no longer overlaps "Items found".

## K23b Banner layout fixes (2026-10-24)
K23's four short lines (Title, Create, Guided offer, Street Smarts unlock) were approved as written. Manager calls:
1. **(a) The "freed" banner and "Ouch! The run is over":** the banner moves. Its every-frame placement now treats the big centre message as one more thing to keep off, so if the run ends while Sensei is talking, the banner drops just below "You keep everything you found." The two never overlap, and neither is cut short.
2. **(b) The floor chest:** the same placement also keeps off the chest once it shows (its tile plus a little above). Doors, the chest and the centre message now go through one list of screen boxes, so there is one rule rather than three.

## Keon spelling (2026-10-24)
Jay's call, relayed by the Manager: "Keon is the correct spelling." The orange-belt kata is now "Keon", not "Key On", in everything students see: the fixtures' kata requirement names, the class scroll decoration (now "Keon Scroll" / "The Keon form, ready to open the next door.") and docs/curriculum.md (this replaces the 2026-10-19 "Key On" spelling). Ids are unchanged: the requirement id is `orange-kata`, and the decoration id stays `decor-a6-class-scroll-key-on`, because it is stored in saves and is also the sprite name in the generated art atlas. Ids are never shown, so old saves load as before. drafts/content/katas is left to the Content Designer (S3-K2).

## S3-P1 Kata cards on the Abilities tab (2026-10-24)
Manager calls, following the S3 plan (#161) and decision D1 (names, step counts and arrows only):
1. **Kata data lives in content/katas/** (one file per kata: id, name, requirement id, Form id or null, and each step's directions). The files are built from the Content Designer's drafts/content/katas (#163) with the school's step text, moves and kiai left out. Adding a kata means adding one file; `parseKata` in packages/sim checks each file when the game loads.
2. **The card:** each earned kata gets a "Kata" card right after its Form card, showing the kata name, "{n} steps" and each step's number with an arrow (↑ Front, ↓ Back, ← Left, → Right). A step whose direction is still an open question (no `facing` in the data) shows its number with no arrow. Unearned katas show no kata card; their Form card already says what to show Sensei.
3. **Form links checked:** Basic Form 1 → rooted-form and Basic Form 2 → flowing-form. This matches abilities.json, where the 1st belt's kata unlocks forms[1] (Rooted Form) and the 2nd forms[2] (Flowing Form), so no fix was needed. A test now guards it. Keon and David and Goliath have no Form yet (D3: milestone 10).
## K23c Ability pop-up keeps off the treasure door (2026-10-24)
Manager call: at 667 wide the ability name that pops up after room 1 (e.g. "Ripple Counter") briefly covered the treasure door and its label. The pop-up now uses the same list of protected screen boxes as Sensei's banner (doors, chest, centre message), plus the banner itself and the "Room clear!" line. It moves down below anything it would cover. To make that work, Sensei's "Here is an Insight for you!" banner is now shown just before the pop-up rather than just after it. Text and timing are unchanged.

## S3-P1 merge with main, Manager calls (2026-10-24)
After #167 and #168 merged, S3-P1 took main in with a normal merge commit. Both sides' doc sections are kept.
1. **Ids stay as they are:** `orange-kata` and `decor-a6-class-scroll-key-on` are not renamed; only the names players see say "Keon". Old saves load as before.
2. **docs/GROK_BOTS.md is fixed in #169:** the curriculum list now says "Orange Keon".
3. **A kata shows only once earned:** the Abilities tab gets a Kata card only for katas the student has; unearned ones show nothing extra.
4. **content/katas/ is rebuilt from the Content Designer's updated drafts (#168)** for all four katas. Every step now has a direction, so every step shows an arrow; a step with no direction would still show its number alone (tested).

## M7-P8 Music and Sound (2026-10-24)
Jay's call, relayed by the Manager: AI-assisted WAFU music is fine ("I don't care if music is made by ai personally."). That answers shortlist question 1; the pick stays The Mountain Temple (Vol.35) and The Long Road (Vol.29) (drafts/planning/M7-P8a-music-decision.md).
Manager calls:
1. **Download WAFU only after Jay's yes.** He has now said yes. The itch.io download button needs a browser, so the Programmer downloaded the two zips through the box browser from WAFU's free itch.io pages (the normal free flow, no login), then extracted the files. Only these four files are committed, unchanged and not re-encoded: `mountain-temple-loop.ogg` (2.96 MB), `long-road-loop.ogg` (4.42 MB), `LICENSE-WAFU-Vol35.txt` and `LICENSE-WAFU-Vol29.txt`. The zips stay out of the repo. Both licence texts are kept because their wording differs slightly.
2. **The web preview is OK:** the music files are packed inside the app build and so are reachable in the web preview too. WAFU's rule (schools never get the raw WAV or OGG files) is met because we never hand the files over.
3. **Commit the files directly, no Git LFS.** Only the two seamless-loop OGG files plus WAFU's LICENSE.txt.
4. **Volume is 0 to 5 in whole steps,** with big − and + buttons and five bars, in Settings and outside the grown-up gate. Saved on the device as `dojo.musicVol` (default 3) and `dojo.sfxVol` (default 5, the same loudness as before).
5. **Which track from each pack (Manager call).** "The Mountain Temple" and "The Long Road" are pack names, and each pack has 12 tracks. For the temple I used *The Great Hall I* (`Temple_Hall_01_loop.ogg`, 2:12); the pack README marks it for "inside, the hub". For the road I used *The Grass Road I* (`Grass_Road_01_loop.ogg`, 3:21); the README says "if you only use one track from this pack, use this one". Jay can ask for a different track; it is a one-line change in audio.json plus a file swap.
How it works: content/settings/audio.json maps each screen to a track (Temple for Title, Create, Dojo, Home and Street Smarts; Long Road for the Tower), plus the fade time and the button text. apps/client/src/audio/Music.ts plays on the same audio context as the sound effects. It starts after the first touch, fades between tracks when the screen changes, and pauses when the app goes to the background. A missing or unreadable file just means silence. The files go in **assets/audio/music/** (the game's served folder; vite's publicDir is assets/, so apps/client/public would not be served) as `mountain-temple-loop.ogg` and `long-road-loop.ogg`.

## K24a Tutorial tips wait for the player (2026-10-24)

Manager calls:
1. The Manager approved the M7-P8 track picks (The Great Hall I for the Dojo, The Grass Road I for the Tower) and gave the go for K24a, then K24b, then K24c.
2. **New tutorial waves.** Wave 1 is one Brute (guided Counter). Wave 2 is 3 Swarmers plus a Brute. Wave 3 is a small Swarmer group. Wave 4 is Swarmers from two sides, to practise DASH.
3. **Session 2: lesson-dash is a short reminder** ("Remember: DASH out of a crowd."). It stays a normal lesson; making it a fading follow-up broke 4 session tests.
4. **Health never drops below 1 anywhere on the tutorial floor**, Swarmers included (minHealth 1 covers all player damage; a test locks it).

Programmer calls:
- The tips moved from drafts/ to content/tutorial/tutorial-floor.json (13 steps, `advance` 'tap'|'move', `waitFor`), and the game runs from that file.
- Every tip waits for a **Got it** tap (the game pauses), then waits for the player to try that move before the next tip. All auto-advance timers on the tutorial floor are gone; multi-line tips show together.
- Enemies and new waves hold (`enemyHold`, `waveHold` in the sim) until the matching tip's Got it. A step that can no longer happen (for example, no enemies left) ends quietly. There's no failing and no countdown.
- The tip box is about 65% see-through, with an outline and shadow on the text. It keeps off the doors, chest and messages and, on the tutorial floor, off the hero.
- On the tutorial floor every enemy sees the player (`seeAll`), so no enemy waits off-screen while a tip asks the player to beat it.

## K24c Closer tower view and full retina sharpness (2026-10-24)

Manager calls:
- **K24a's two tradeoffs are okayed:** (1) on the tutorial floor every enemy sees the player (`seeAll`); (2) the paused tip can cover the health bar when the hero is near the bottom of the screen. That's fine, since health can't drop below 1 there.
- **Keep the 3× cap** on retina sharpness (DPR capped at 3).

Programmer calls:
- **Closer view.** The tower now shows about 6.75 tiles top to bottom instead of 8 (`VISIBLE_ROWS`), so the characters and enemies look bigger.
- **Full "retina" sharpness.** The game now draws at the phone's real pixel count, not its basic screen resolution. The canvas has DPR real pixels per screen point (DPR is the phone's pixel ratio, capped at 3) and is shown shrunk back to the screen size. Every camera is zoomed by DPR, so the layout code still works in screen points through a new `view()` helper, and tap positions are divided by DPR where code reads them directly. Nothing looks different except sharper.
- **Cost.** It draws 4 to 9 times as many pixels. In the build box's browser (software drawing, no graphics chip) the frame rate went from about 36 to about 13 frames per second at 844×390 at 3×, and memory went from 81 MB to 86 MB. Real phones draw with their graphics chip, so this box can't show real phone speed. If Jay's phone feels slower, set the cap to 2 (one line in ui/theme.ts).

## K24b — attack wind-up cue + COUNTER window (2026-10-24)
- Before an enemy attacks it shows a cue drawn in code: a "!" in a ring that fills from the top (red), turning gold and full during the counter window.
- During the counter window the COUNTER button gets a gold ring and flashes. With Reduced motion there's no pulse or flash; the cue and a steady bright COUNTER stay. No art changes.
- The Sensei tip box avoids the cue so it never hides it.

## S3-P1b — kata cards readable (2026-10-24)
- Kata step arrows are drawn as thick shapes as tall as the bold 13px step numbers, so they no longer shrink to dots at 844 (S3-T1 bug 1–2). Steps wrap one whole step at a time.
- Earned kata cards are grouped together at the top of Abilities (S3-T1 bug 3) instead of after each Form.
- No kata directions or step data changed.
- Manager-okayed K24a tradeoffs (named here as asked): (1) on the tutorial floor every enemy sees the player; (2) the paused tip can cover the health bar when the hero is near the bottom of the screen, which is fine since health can't drop below 1 there.

## R-BAL-9c — live enemy numbers (2026-10-24, targets from #188)
Jay's balance calls (D1–D5, drafts/planning/balance-research.md), recorded here:
- **D1:** enemies are scaled to the *expected* Artist for each tier, not the actual player.
- **D2:** the target bands are OK as written (Swarmer 2–4 hits, mid 5–10, Brute 10–20, Floor-keeper 40–80; enemy hits to KO the player: 12 / 8 / 5 / 5 at least).
- **D3:** XP steps are softened so the last step is ≤ 10 runs, using weights (k+11) (R-BAL-5).
- **D4:** Endless stays +3% per floor with no cap (R-BAL-6 dropped).
- **D5:** Challenge is ×1.5 enemy Health and Power.

Live enemy changes (maxHealth / power / guard; nothing else changed):
- Swarmer 40/8/0 → **20/7/0** (DECIDE-2), Shield 90/15/15 → **66/11/15**, Brute 180/25/25 → **126/17/25**, Floor-keeper 700/26/30 → **495/17/30**.
- Checked with drafts/planning/r-bal-9c-check.py against #188's expected white Artist (Standard / Challenge ×1.5). Hits to beat: Swarmer 2/3, Shield 6/9, Brute 12/18, Floor-keeper 50/75. Enemy hits to KO the player: 18/13, 12/8, 8/5, 8/5. All in band; the player always survives at least 5 hits.
- Elite and named Brutes follow the Brute (Guarding Brute 158 Health, Old Thumper 189). Their tests were updated to the new numbers.
- Not in this PR: R-BAL-9b (per-tier gear caps, including the white gear cut). It waits on DECIDE-1 (R-BAL-9a, Jay), which isn't recorded yet.

## R-BAL-4 — bad-luck counter locked (2026-10-24)
- A test (packages/sim/test/r-bal-4-bad-luck.test.ts) fails if `LOOT.guaranteedRareOnRun` is above 5, so a rare is always promised by run 5 at the latest.
## R-BAL-5 Softer XP steps (D3)
Jay's D3: level steps are weighted step + 11 (PROGRESSION.xpStepSoften), so a 3-month tier goes from 1.4–14.2 runs per step to 5.7–10.0. The tier total is unchanged, so the time to reach the cap is the same; early levels just come a bit slower and late levels a lot faster. Test: packages/sim/test/r-bal-5-xp-steps.test.ts.
## K25 — slower tempo, calmer screen shake (2026-10-24, from Jay's phone playtest via the Manager)
- **One tempo value.** `TEMPO.speed = 0.88` in packages/sim/src/config.ts (about 12% slower). The rules still count the same ticks; the client plays each tick 1/0.88 times longer. So movement, enemy speed, attacks, character animations (LayeredSprite) and the Game scene's tweens all slow together, and every wind-up and counter window lasts longer in seconds (50 ms → about 57 ms per tick). No tick numbers were edited, so no sim or balance test changed.
- **No shake on the player's attacks.** Basic hits, Strikes, Perfect Counters and enemy-down hits keep their short freeze (hit-stop) but never shake the screen (`SCREEN_SHAKE.playerAttackScale = 0`).
- **Being-hit shake only for older students.** The shake when the player is hit is on only at Brown belt and up, or on Challenge, at 65% of its old strength, and always off with Reduced motion (`SCREEN_SHAKE`, `hurtShakeScale`). Programmer call: a Block (hit while guarding) follows the same rule as a hit.
- Named-monster tell shakes (content timing) are unchanged; they already respect Reduced motion.

## K25b: a Block never shakes (Manager's call, 2026-10-24)
A Block is a success moment, so it never shakes the screen, at any belt or difficulty. Only being hit shakes (K25 rules: Brown and up or Challenge, 65%, off with Reduced motion). `eventShakeScale('block', …)` is always 0. This answers the K25 open question about Block. Test: packages/sim/test/k25b-block-no-shake.test.ts.

## R-BAL-9b: per-tier gear caps; white gear cut (Manager's call, 2026-10-24)
The Manager made the white gear cut from #188 (DECIDE-1, option a) under the balance calls Jay delegated to the Manager. The game hasn't launched, so no kid loses anything.
- GEAR_CAPS has all 10 tiers (Power / Health / Guard / Jade): white 1/10/3/4% … black 34/211/17/26%. Before, white was 4/30/8/12%.
- White loot (content/loot/gear.json): hands Power 1/1/1/1, gi Health 3/5/8/10, gi Guard 1/2/2/3, Jade 1/2/3/4%.
- Drops are clamped to the tier cap, including the Jade charm's Power share. maxGearScore uses each tier's own caps instead of white × tier.
- Not done here: ENEMY_SCALE for enemies outside their home tier (spec item 5), because no enemy appears off-tier yet; per-tier loot tables (R-BAL-10); XP steps (R-BAL-5, #204).

## R-BAL-12: real training powers combat (2026-10-24; #193, #195, drafts/planning/R-BAL-12-training-powers-combat.md)
Jay's Decisions A and C and the Manager's Decision B, from the R-BAL-12 doc:
- **A (Jay):** training gives 40–60% of a typical student's power. The sim gives 51–54% at every belt.
- **B (Manager):** one enemy multiplier per belt (`ENEMY_TRAINING_SCALE`, internal), and every stat a kid sees is a whole number. Content files keep BASE numbers. A run scales Health and Power with `Math.round`; Guard and timings never scale.
- **C (Jay):** a class-only kid being a little weaker is OK. No nag or guilt messages; training only adds, never takes away. No timers, streaks or decay.

What is in the code:
- `TRAINING_STATS` per belt: a sign-off adds Power + Health, a Training Point adds Health (counted up to 28 × tier), a stripe adds Guard. A piece keeps the value of the belt it was earned at.
- `trainingStats()` feeds `characterSetup`.
- Save migration: `TrainingState.stripesByBelt` is rebuilt by `migrateStripesByBelt`. Extra stripes from an old save that kept only a count go on the oldest belts with room, then on the current belt. It never removes anything.
- Test file: r-bal-12-training-stats.test.ts.
- Not done here: UI gain words (R-BAL-12d); the weapon's disarmedPower isn't scaled.

## R-BAL-12 enemy scale retune (Manager call, option B, Oct 24)
- **Manager, option B:** re-run the band check on #203's lowered base numbers × `ENEMY_TRAINING_SCALE`, and retune the scale so every live enemy stays inside the #188 bands at every belt.
- **What the check found:** the old scale (yellow and up) was a ratio against the #188 Artist of each belt. It assumed enemy files built for that belt. The live enemies have white-belt base numbers and appear at every belt, so from yellow up they were far too easy. Swarmer took 1 hit, and the Floor-keeper fell in 7–33 hits instead of 40–80. White was already in band.
- **New rows (Health × / Power ×), white to black:** 1.27/1.19, 2.14/2.06, 3.19/3.14, 4.65/4.32, 6.56/5.6, 8.46/7.06, 10.77/8.7, 13.1/10.36, 15.91/11.94, 18.72/13.8. White is unchanged. Each row passes for all three model students (typical, trains more, plays only) on Standard and Challenge ×1.5. Each row also keeps the typical student's hits and KO counts as close to white's as the bands allow. Fit: drafts/planning/r-bal-12f-live-check.py.
- **Bopper base 110/16 → 66/11** (Guard 10 and disarmed push 8 kept). No scale row could keep the Bopper in the mid band alongside the other four. Its Challenge KO fell below 8 at every belt. This changes the A5 numbers from #102/#118.
- **Guard:** `test/r-bal-12-bands.test.ts` checks every live enemy, belt, student, Standard and Challenge, and fails if a new live enemy file is not listed. Against the old scale, 131 of its cases fail.
- **Open:** the drafted C13 enemies (drafts/content/enemies) are built for each belt's Artist. If they go live as they are, this scale would double-count. They need white-base numbers, or their own scale, when they land.

## K28: K25 feel fixes (from the K25 QA report)
- **Real time.** The wind-up sound length and the warning timer use `ticksToRealMs` (realMsPerTick), so they match the slower tempo (B1, B2).
- **Challenge timers.** "60 s" now means 60 real seconds. Both the on-screen clock and the in-time check use `realSecondsToTicks` (about 1056 ticks instead of 1200) (B3). Par seconds for grades are unchanged.
- **Belt gate by rank.** The shake rule now checks belt rank: tier 8 and up, which is Brown in the standard 10-belt order. It no longer looks for the id 'brown', so a school with different belt ids still gets the shake from rank 8 (B4). A school with fewer than 8 belts gets the shake only on Challenge.
- **Named-monster wind-up shakes** (the Brute stamp) follow the hit-shake rule, through the same helper (`hurtShakeScale`): Brown rank and up or Challenge, at 65%, and never with Reduced motion (the Manager's answer to the K25 QA's DECIDE 2).
- **Removed `eventShakeScale`** and its test (k25b-block-no-shake.test.ts). Nothing used it after K28. The K25b rule that a Block never shakes is unchanged; it is part of the one shake rule, `hurtShakeScale({ kind: 'block', … })`, which always returns 0. Test: k28-real-time-rank.test.ts.
- **Manager call:** a school with fewer than 8 belts gets the hit and wind-up shake only on Challenge. That's fine for now.
- **Manager call:** par times for room grades stay in game time (rules seconds), not real seconds.
## K27: tutorial fixes from Q5 (2026-10-24, plan approved by the Manager)
- **Closing line (Manager's call; Jay will see it).** The door tip's last line was "What was your favorite part?", which a child can't answer. It is now "Great job! You finished the training floor." (content/tutorial/tutorial-floor.json).
- **Chest and boss tips wait for their own room.** The chest tip shows only in the vault and the boss tip only in the boss room (Q5 B2: the chest tip showed in room 1).
- **Boss tip closes on Got it.** "A big one!" no longer stays over the boss for the whole fight (Q5 B1).
- **The "!" cue stays below the boss bar.** While a boss bar shows, a wind-up cue is never drawn higher than just under the bar and the boss's name (Q5 B1).
- **Tutorial tip placement.** The tip and its Got it take the first spot clear of the hero, the doors and their labels (HOME), the chest, the boss and the action buttons. If no centred spot is clear, the box slides to the left edge, away from the buttons (Q5 B3, B4). If nothing is clear at all, it sits in the bottom-left corner. Tutorial tips wrap narrower (screen width minus 260 px) so they fit beside the buttons on a 667 px screen. The tip box opacity is unchanged.
- **COUNTER's gold ring only when it's ready.** The gold ring and flash show only while COUNTER can be pressed, so a gold ring never sits on a dimmed button (Q5 B5).
- 2026-10-24, Manager (K27 retest): the boss "!" must be full strength above the boss, or beside it if there's no room, clear of HOME and the health bar. Done by trying above, then right, then left of the enemy, and keeping the first spot clear of the boss bar and every door label.

## K29: end-of-run clock in real seconds (2026-10-25, approved by the Manager)
- The clocks a player reads after a run (room-clear line, Last run "Time", Fastest floor) now show real seconds, using the same ticks-to-real-ms conversion as the K28 Challenge timer (`realClock` in packages/sim/src/config.ts). They read about 12% short before.
- Manager's call: par times and room grades stay in game time.
- Note: 1200 rules ticks are 60 s of game time, which is about 68 real seconds at tempo 0.88; 60 real seconds is `realSecondsToTicks(60)` = 1056 ticks. The test checks both.
- Note for other dojos: the hit-shake cut-off (`SCREEN_SHAKE.hurtFromTier`, rank 8 = Brown) assumes the standard 10-belt order. A school with a different number of belts will need that rank mapped onto its own belts (for now, schools with fewer than 8 belts only get these shakes on Challenge, Manager's call in K28).

## K30: HOME label clear of the boss (2026-10-25, approved by the Manager)
- Found in the K27 retest: in the boss room the HOME door label sat on the boss's head and its health bar.
- Simplest fix: each frame, if a door label overlaps a live boss's head, health bar or name, it slides sideways to the far side of its door from the boss. Otherwise it stays centred on its door. Same place as the existing keep-under-the-top-bar rule.

## K31: boss name and small health bar as one pair (2026-10-25, approved by the Manager)

- One shared rule, `bossTagLayout` (packages/sim/src/bossTag.ts): the name, a fixed 4 px gap, then the small bar, stacked above the boss's head. If the stack would rise into the top HUD strip (above HUD_BOTTOM + 4, under the player's bars) (boss near the top of the screen), both move below the boss's feet together. The pair is always clamped on screen and the gap never changes.
- The name now follows the boss instead of sitting fixed under the big top bar, so the pair can't be pulled apart. The big boss bar stays where it is.
- HOME and other door labels: the name slides sideways off a label it would overlap. The combo counter is a keep-clear box too: if the pair would touch it, the same rule runs with the combo's bottom as the floor. The boss '!' cue (`windupCueSpot`) treats the pair's box as a keep-clear area, like door labels.

## K31 follow-up: name follows the boss (2026-10-25, Manager call)

- Manager call: OK for the boss's name to follow the boss (as part of the name + small bar pair) instead of sitting fixed under the big top bar.
- After merging K30: K30's `keepLabelOffBoss` also keeps door labels off the pair's box (`bossTagWorld`, including when the pair sits below the boss), and K31's `placeBossTag` still slides the name off any door label. The label moves first in the frame, then the name, so they don't fight.

## K31 QA fixes (2026-10-25)

- `bossTagLayout` now takes one input object (boss x/head/feet, the pair's half width, the screen band, and boxes to avoid) and returns ONE x for the pair. The name and the bar both use it, so they can't split. The pair is clamped on screen as a unit at the left and right edges.
- Keep-clear boxes: door labels (HOME), COMBO and its "+N% power" line. The pair first slides sideways off a box (away from the box's centre, towards the boss); if that can't clear it, it drops below the box. This applies to the above spot and the below-the-feet spot.
- Unit tests cover the edge clamp, the HOME slide, and the below spot with COMBO + power line.
- The boss '!' cue refreshes the pair's box for the current frame before choosing its spot (no extra padding). Root cause of the last 667 miss: while the pair slid sideways off COMBO as it faded in, the pair covered both side spots, so the cue fell back to a fixed spot on top of it. Now, when the side spots are blocked, the cue goes just past the pair's edge, or under it.

## K32 gear icons (2026-10-25)

- Manager calls (K32 GO, 2026-10-25):
  - (a) The #212 slot + rarity icons replace the Batch 8 per-item icons everywhere gear shows: the Gear screen worn slots and bag cards, the results list, the first-floor reward line and the in-run loot note. Two items in the same slot and rarity now share one icon; the name tells them apart.
  - (b) The worn-slot icon grows from 22 px to 40 px, on the left of the box, as long as it fits at 667.
  - (c) Importing #212 is approved: the 15 sprites are copied as-is from incoming-art/gear-drop-icons/sprites/ to assets/art/gear-drop/.
  - (d) The legendary icons stay, though legendary gear doesn't drop yet. The jade charm's red cord is not touched here (#214).
- The icons are plain images keyed `gear:<slot>:<rarity>` (`loadGearIcons` / `addGearIcon` in apps/client/src/art/gearIcons.ts), not an art pack: they are 128x128 each and the frame already carries the rarity, so there's no tint.
- A results-list line now stays on one line (it shrinks the text, down to 10 px), so its icon always lines up with it.
- Manager call on #226 (2026-10-25): keep the 40 px worn-slot icon, and wrap long worn-item names onto 2 lines with no ellipsis, so the full name shows at 667. To give the name room, the icon sits top-left with the slot and stats beside it, and the name spans the box's full width below. `twoLines` shrinks the name (13 px down to 10) until it fits in 2 lines with no word past the edge. All three boxes grow to the tallest one, and the bag fits the rows that are left.
- Manager call on #226 after QA (2026-10-25): it's OK for a charm's effect text in a worn slot to end in '…' when it doesn't fit. The full text shows on the bag card and in the detail line.

## R-BAL-12d Gain words (2026-10-24)
- Show training gains as plain "+N Stat" words on the moments a kid already sees (sign-off, sign-offs list, stripe). Each gain uses the belt it was earned at. No new screen, no counters, no "missing" or "next time" words. Wording is in content/ so Jay can change it without code. A test bans nag/guilt/streak words and caps lines at 8 words.

## R-BAL-12e: enemy weapon disarmedPower scales too (2026-10-24)
A weapon's `disarmedPower` (the Bouncy Bopper's push) now uses the same per-belt Power scale as the enemy's Power, rounded to a whole number. The content file keeps the BASE number (8). A disarmed push still hits softer than a normal swing at every belt. Test: r-bal-12e-disarmed-power.test.ts.


## K26 Sign-off list layout (2026-10-24)
- Fix the root cause (no column width) instead of shortening names: fixed column width + word wrap, measured row heights. Text floor is 12 px; past that we show "…and N more" (positive, points to the Board) rather than shrinking further.

## P-MENU-a shared button + motion tokens (2026-10-25)

- Manager calls (2026-10-25):
  - P-MENU-a has the go, built as the plan in drafts/planning/P-MENU-menu-polish.md §2.
  - Item d: keep K32's 40 px worn-slot icon and 2-line names; the empty-bag icon is drawn in code (no art file).
  - Item f: the first lit Seal plays the bow bell once; it stays silent when sound is off.
- Tokens (spacing, type, corners, 44 pt tap size, motion) live in apps/client/src/ui/tokens.ts with no Phaser import, so Vitest can check them; theme.ts re-exports them.
- The shared rounded button (ui/button.ts) acts on finger-up inside, cancels on slide-off, and has an invisible tap area of at least 44 x 44 around the drawing. A finger that slides onto a button and lifts does nothing.
- Reduced motion: buttons don't scale; they brighten at once and fade back over 120 ms. The Blessing glow stays still.
- The soft tap sound is made in code (Sfx.tap), so no sound file and no new dependency.
- Practice room moved down 2 pt (8 pt gap) so its 44 pt tap area doesn't touch ENTER THE TOWER's.
- Manager call on #228 (2026-10-25): the tap sound is fine as is; Jay tunes it at the menu check.
- Manager call on #228 after QA PASS (2026-10-25, /workspace/qa/2026-10-25-pmenu-a.md):
  - Fix the Blessing glow so the alpha you see breathes 0.25 to 0.15. Before, the tween ran over a 0.25 fill, so it showed about 0.04. The circle now has a full fill and the object's alpha carries the breath.
  - The first-floor summary card's Continue uses the shared button() at 44 tall.
  - Gear cards are left for P-MENU-b.

## B-WRAP Capacitor 8 wrap (2026-10-25)

- Manager calls (B-WRAP GO, 2026-10-25):
  - These packages are approved and pinned to exact versions: @capacitor/core, cli, android and ios 8.5.3; @capacitor/app 8.1.2; @capacitor/screen-orientation 8.0.2. No other new dependencies.
  - The app id is `com.placeholder.dojoascent`, a PLACEHOLDER. Jay picks the real one before any store upload, because it can't change after.
  - The app name is "Dojo Ascent". No new art: the Capacitor template's default icon and splash stay until Jay's icon is ready.
  - Generate ios/ only if it works without a Mac. It did (Capacitor 8 uses SwiftPM), but it can only be built on a Mac or the B-CI macOS runner.
  - Pause in the background with the smallest code. One `setAway()` in main.ts sleeps the game loop and suspends the shared audio context (music and sound effects). It runs on `visibilitychange` and, in the app, on @capacitor/app's `appStateChange`.
- Landscape: Android uses `sensorLandscape` in the manifest, iOS lists landscape only, and the app also calls ScreenOrientation.lock. Full screen: no status bar (Android windowFullscreen, iOS UIStatusBarHidden). The safe areas keep using the existing CSS `env(safe-area-inset-*)` on #game.
- The Android debug APK is built on the box with JDK 21 and Android SDK 36 (tooling only, not in the repo). The emulator smoke test wasn't possible: the emulator hung at boot on the box.

## node-22 (2026-10-25)
- Manager call: the repo's Node version matches Capacitor 8, whose CLI needs Node 22+. `engines.node` is now `>=22` (package.json and the lockfile's root entry). `.nvmrc` already said 22. The repo has no CI workflows yet, so there was no CI Node version to bump; B-CI should use Node 22.

## B-BELT grown-up belt entry (2026-10-25)
- Manager call (BETA-DEC15 D2): until the DojoForge feed sends it, a grown-up types in the real belt and stripes behind the existing grown-up gate. The sum question leads to the play-time screen, which now has a "Belt & stripes" button. Nothing leaves the phone.
- The entry is saved in the profile (`beltEntry`, in the same localStorage save), so it survives a restart. Saves without it load with `null`.
- It never lowers anything. The saved entry only goes up (belt first, then stripes), and the game uses it only when it is above what the feed shows. Lower choices are greyed out on the screen.
- A higher belt begins like a fresh promotion. Earlier belts count as passed (the existing legacy grant unlocks their items). The new belt has no sign-offs and 0 classes in rank, and Sensei's Seal is off. Stripes on lower belts from the feed are kept. Entered stripes use the words Respect and Great Effort, because a grown-up enters how many stripes there are, not which ones.
- Scope: belt and stripes only. Entering sign-offs (also in D2) is a follow-up.

- 2026-10-25 — Manager call on #246 (QA fixes): changing the belt chip resets the stripe pick to 0 (never below the saved floor on that belt) via sim `pickBelt`; Save now opens an "Are you sure?" card (shared `button()`) because saves only go up; origin/main merged normally. Promotion still plays at the next dojo visit. Celebrations reduced motion and "practiced" wording moved to bot-code/fix-celebrate-rm; square buttons go to P-MENU-c.

## R-BAL-14b (2026-10-25)
- Manager call: wire the #237 charm amounts. `lowHealthFocus` amounts are now the extra share (game multiplier = 1 + amount), so Kind Stone 0.25 = x1.25. Rally's Insight amount goes from 2 to 1 so it stays x2. Great Lamp 1 = full DASH recharge and Feather 1 = +1 COUNTER tick; the code already did both, so they only got tests. check-c7 accepts plain kid text for COUNTER-window charms whose amounts are whole ticks.
- The live content/loot/gear.json has only the 3 white charms. Lotus and Crane already match #237. Jade stays at the #188 white amounts (R-BAL-9 DECIDE-1 is still open). The 9 tier charms are not in the live file yet, because live loot has no per-tier drops; they come in with the tier-2+ gear import.

## P-MENU-b (2026-10-25)
- Manager approved the plan. A gear-card pick stays instant (the K32 detail block still shifts the grid until P-MENU-d). Code was only moved, nothing restyled. Gear cards keep their plain tap; press feedback on them moves to P-MENU-d with the new card. A Let go also redraws the tab bar, because the Gear (n) count changes.
## B-BELT Manager stand-ins (2026-10-25)
- Manager calls on #246's open questions, standing until Jay decides otherwise:
  - No sign-off entry in the beta. An entered belt starts with 0 sign-offs and the Seal off.
  - Entered stripes keep the placeholder words "Respect" and "Great Effort".
  - No undo for a belt entry. The only way back is the B-SAFE wipe-data button, which resets everything, including the belt.

## B-SAFE kid-safety items (2026-10-25)
- Manager calls (B-SAFE GO, 2026-10-25):
  - Wipe clears everything the game saved, by key prefix. That includes the belt entry and the play-time limit (Manager call: the wipe must reset the belt).
  - Beta builds switch every test flag fully off: all URL flags and the dev day offset. A beta build is made with `npm run build:beta`, which runs `vite build --mode beta` and reads `VITE_BETA=1` from `apps/client/.env.beta`.
  - The "saved on this phone" text is a PLACEHOLDER in `content/settings/safety.json`, to be aligned with B-DOCS.
- Choices made while building:
  - The wipe also removes the older `dojo.` settings keys (Reduced motion, Music and Sound volume). They don't start with `dojo-ascent-`, so a prefix-only wipe would have left them. Renaming them would have reset every player's settings. A Vitest check fails if a new saved key uses neither prefix.
  - Both hidden 5-tap testing screens (Home and Dojo) are off in beta builds. They let anyone switch fake student profiles and get every decoration, so they count as test flags.
  - The grown-up gate moved into `ui/grownUpGate.ts` so outside links can share it. `openOutsideLink()` is the only allowed way to leave the game, and a Vitest source scan fails on any other `window.open` or `location` change. The game has no outside links today.
  - After a wipe the app reloads, so every scene and module reads the empty save. The first-launch note shows again.
  - The wipe button sits in the play-time screen's bottom-left corner, away from #246's "Belt & stripes" and Done buttons, so the two PRs merge in either order.
- Manager call on #249 (2026-10-25): the "Saved on this phone" card uses the privacy wording from #240 (`drafts/planning/BETA-privacy-page.md`, "The short version"), word for word, and the PLACEHOLDER marker is gone. If the privacy page changes, `content/settings/safety.json` changes too.
- QA small fixes on #249 (2026-10-25, qa/2026-10-25-b-safe.md):
  - The B-BELT confirm card's cancel button now reads "Not yet" (`content/settings/belt-entry.json` `confirmNo`), so it no longer shares the name "Back" with the screen's own Back button.
  - The outside-link source scan in `b-safe.test.ts` also catches `window.location = …` / `location = …` and any `.href = …` assignment (for example on an `<a>` element). `==`/`===` comparisons don't match. Checked: it passes on current code and fails on planted `window.location =`, `location.href =` and `<a>.href =` lines, which were then removed.
## fix-celebrate-rm (2026-10-25)
- Manager call (QA on #246): the Reduced motion Celebrations fix and the "practiced" wording ship in their own small PR, not in #246. "Counted" means `legacy` (already passed that rank); a mix shows the real sign-offs line first, then the practiced line. Square buttons go to P-MENU-c.
## P-MENU-c
- Manager call (2026-10-25): P-MENU-c approved as planned. Merge order: #253, #249, #250, #252, then P-MENU-c. #249 (B-SAFE) was still open, so `bot-code/B-SAFE` is merged into this branch (a normal merge) so the gate and play-time buttons exist; #249 must merge first.
- `button()` gained `selected` (3 pt gold outline), `disabled` (35% and not tappable), `stroke`, `labelColor`, `labelWrap` and `labelDx`. The tap zone is added last to the given container, so it always sits above that container's dim layer.
- On a 375 pt tall phone the left column did not fit §3a's sizes with a Blessing line under the bar. The Blessing moved into the character block as a third 12 pt line, and the Path card uses 12 pt padding (not 16) when it is shorter than 69 pt.
- The XP bar remembers what it last showed (`dojo.xpBarShown` in localStorage). After a run it fills from that to the new value (from empty after a level-up). Nothing remembered means no animation.
- CreateScene's round colour dots keep their own handler (circles with 44 pt hit areas); they are not square buttons.
## fix-celebrate-rm (2026-10-25)
- Manager call (QA on #246): the Reduced motion Celebrations fix and the "practiced" wording ship in their own small PR, not in #246. "Counted" means `legacy` (already passed that rank); a mix shows the real sign-offs line first, then the practiced line. Square buttons go to P-MENU-c.
## practiced-cards (2026-10-25)
- Manager call (follow-up to #250): one counted technique shows "PRACTICED!" / "You practiced X!". The many-techniques title says "N techniques practiced!", or "R signed off, C practiced!" for a mix. Real sign-offs are unchanged. Built on bot-code/fix-celebrate-rm (reuses its rewards.ts helpers), so #250 merges first.
- Manager call (Oct 25): "Gate lock lit." shows on a one-technique card only when that sign-off lit a lock on the Gate, meaning a real sign-off of one of the current rank's techniques (`litGateLock`). It is hidden for counted (legacy) and catch-up techniques.

## P-MENU-d (2026-10-25)
- Manager extra: on a mixed sign-off card, rows that were really signed off show a green bold ✓. Counted practiced rows show "○ … (practiced)". (`signOffsRow` / `signOffsMixed`, tested in mixed-signoffs.test.ts.)
- DECIDE (K32): kept the 40 px worn-slot icon. Worn names wrap to two lines and end in "…" if they still don't fit.
- The Gear grid's rows depend only on panel space (`gearGrid`). The detail sheet lays over the panel and moves to the top when the picked card is in the bottom rows, so a pick never moves or hides a card.
- Merged origin/main (#249, #254) normally; docs conflicts kept both sides with main first. #252 (practiced-cards) is still unmerged and is carried in this branch.
- 2026-10-25 — Tester (#257 QA): the worn-gear row is pinned to GEAR.wornH (86) so the bag grid's y never moves after Wear (194 before and after at 667/844/932).

## P-MENU-e (2026-10-25)
- Manager call (Oct 25): P-MENU-e approved as written: Gate and Dojo popups use the shared rounded button(), the resume offer and other square Dojo panels become rounded, CreateScene buttons drawn at least 44 tall. Keep the Boy / Girl labels exactly as they are (still an open question for Jay).
- The Gate tab's READY chip now pops once (MOTION.pop) instead of blinking forever, and the sundial and Sensei's Seal sit on two equal rounded cards. The rest of work-board section 3c (lock sizes, label sizes, first-lit Seal bell) is not in this PR.
- #257 (P-MENU-d) was still open, so bot-code/P-MENU-d is merged into this branch (a normal merge); #257 must merge first.

## B-GEAR-BUG (2026-10-25)
- Manager call (Oct 25): urgent bug from Jay's iPhone (Safari, landscape): gear can't be taken off or changed. Goes before P-MENU-f; keep it small, since a full Abilities and Gear redesign is planned.
- Root cause: worn gear is left out of the bag grid, and the worn-slot cards were plain drawings with no tap. A worn item could never be picked, so there was no sheet and no way to take it off (`unequip()` existed in sim but the client never called it). Touch input, depth and the sheet's close/block zones were checked and are fine: Wear and Let go fire on a real touch tap at 844x390 and 932x430.
- Fix: each filled worn card is a shared button() that opens the detail sheet for that item; for a worn item the sheet's first button is "Take off" (unequip, item goes back into the bag). The sheet also shows when the bag is empty (everything worn).
## B-LASTRUN (2026-10-25)
- Manager call (Oct 25): urgent fix from Jay's iPhone test (Safari, landscape). The Last run panel must never overlap at landscape phone sizes; keep it small, an Abilities/Gear redesign is planned.
- Every block stacks below the measured height of the one before (ui/tokens.ts S1/S2). Personal bests sit on the panel's real bottom edge (or just below the content, whichever is lower), and the item list only gets the rows left between, with "+N more in your Gear" for the rest.
- A very long "For your dojo" list is cut with "…" so at least the item heading and one row stay visible; the full list is in the Dojo. Personal bests drop to one column when a row doesn't fit in half the width.
## P-MENU-f (2026-10-25)
- Manager call (Oct 25): the rest of work-board 3c becomes P-MENU-f (lock and label sizes, 96-tall Seal cards, the Seal's first-lit pop and bell). Plan approved, with one condition: the new "seal seen" save field must load old saves cleanly, defaulting to already-seen for Seals that are already lit (no flood of bells for returning players), with a test.
- Built that way: `Profile.sealsSeen` (belt ids). Old saves load it as null; the first Gate view fills it with the Seal already lit, silently. It only ever adds ids. The bell is `sfx.seal()`, the bow's bell alone, made in code (no sound file) and following the sound volume. Reduced motion skips the pop, not the bell.
- The square testing panel stays square (Manager: developers only).
## B-POLISH-1 (2026-10-25)
- Manager call (Oct 25): two small follow-ups from QA of #261/#262, one PR.
- Gear: the empty-bag hint (bag icon + words) is hidden while a worn-item sheet is open (`showEmptyBagHint`), so it no longer shows faintly behind the sheet.
- Last run: when zero item rows fit (667x375), the line reads "N items in your Gear" instead of "+N more in your Gear"; "+N more" stays when at least one name shows (`lastRunMoreLabel`).
## P-MENU2-a (2026-10-25)
- Manager call (Oct 25): P-MENU2 plan #259 merged; P-MENU2-a and b plans approved as written. Go.
- Jay picked mood A (warm dojo wood and paper) for D1. D2-D6 follow the planner's picks: D2 a 2-pick loadout (Stance + Virtue); D3 "Learn this at the dojo" / "Ask Sensei about this one", no locks, no counts; D4 tap-to-equip first, drag as a bonus; D5 read-aloud after the beta; D6 no numbers in the Fighting Style preview.
- Placeholder art only, drawn in code (wood frame, switch colours in `theme.ts` WOOD). No image files until Jay OKs the Artist's samples.
- New sizes (`BOARD`, `abilitiesSwitch`, `cubbySize`) live in `ui/tokens.ts` and are re-exported from `theme.ts`, so Vitest can test them without Phaser. No existing token changed.
- Abilities opens on Trophy Case for now; "open on Trophy Case after a new unlock, else Fighting Style" waits for the unlock tracking in P-MENU2-c and a real Fighting Style (P-MENU2-e).

## P-MENU2-b: Trophy Case (2026-10-25)
- Built on P-MENU2-a (#264), using the Manager's go, mood A (warm dojo wood) and D2-D6 as the planner recommended.
- The Trophy Case now replaces the old list. It has a belt ribbon with one knot per belt (earned belts in colour, the current belt glowing with its stripes, later belts drawn as paper outlines) and four shelves: Katas/Forms, Kicks/Strikes, Self-defense/Seals and Character stripes/Virtues. Earned items come first on each shelf.
- Cubbies are 96 or 112 wide (`cubbySize` rule), with up to 4 per row, built on `button()`. Pages show as dots between 44-tall ◀ ▶ buttons, with no "n / m".
- An earned cubby is a wood card with a red seal stamp, and its sheet says "Signed at <belt>". A not-yet cubby is a paper card with the icon at 30% alpha, a lantern and "Learn this at the dojo" in 12 pt, and its sheet says "Ask Sensei about this one". There are no locks and no counts.
- The detail sheet shows the icon, the real name, one line on what it does, the status line and, for earned katas, the kata arrows. It slides up, or fades in when Reduced motion is on.
- All wording lives in `content/abilities/trophy-case.json`, including the switch labels from A. The model is in `apps/client/src/ui/trophyCase.ts`, which has no Phaser, so Vitest can test it.
- All art is placeholder, drawn in code (seal, lantern, ribbon). No new images were added; the existing icon set is reused.

## P-MENU2-b follow-up: Manager calls (2026-10-25)
- **2 shelf rows per page.** When 2 rows fit, a Trophy Case page shows 2 shelf rows: a slimmer 28-tall ribbon, 44-tall ◀ ▶ at the sides of the shelves, and dots in a slim strip below. On these pages cubbies may shrink below 96, but never under `BOARD.cubbyMin` (72). When 2 rows don't fit, the page falls back to 1 row with the 40-tall ribbon and the 44-tall ◀ dots ▶ pager. Result: 1 row at 667x375 (5 dots), 2 rows at 844x390 and 932x430 (3 dots).
- **Darker kata arrows.** On the cream sheet the arrows now use the token `KATA_INK.onPaper` in tokens.ts. Arrows are #1d4690 (7.1:1 on paper #f2e3c4) and the step numbers are #3a2618. Before this, the arrows were #9fd3ff (1.25:1) and the numbers were white. The dark board keeps `KATA_INK.onDark`. A test checks that both colours reach at least 4.5:1.
- Merged main (#267, which untracks apps/client/node_modules) into P-MENU2-a and P-MENU2-b with normal merges.

## P-MENU2-b: Tester fixes and polish (2026-10-25)
- **Packed shelves.** A short shelf now shares its row with the next one. Each shelf keeps its own label, and every row but the last is full. With 8 cubbies the case takes 1 page at 844x390 and 932x430 (2 rows × 4) and 3 pages at 667x375 (1 row × 3). The test asserts ≤ 2 pages at 844 and 932.
- **Kata steps on the cream sheet.** Step numbers are `WOOD.ink` (#3a2618, 11.3:1). Arrows are `KATA_INK.onPaper.arrow` (#1d4690, 7.1:1).
- **Polish.** The grid is centred in the frame. Earned stripe cubbies show the short Virtue name; the sheet keeps the full name. The shelf label "Character stripes" is now "Stripes" so it fits over a single cubby without "…".

## P-MENU2-c: Trophy Case unlock moment (2026-10-25)
- **Manager approved the plan.** When a cubby becomes earned, the first Trophy Case view that shows it plays one unlock moment: a paper cover sweeps off the wood card left to right (360 ms, `MOTION.unlockSweep`), then the card pops (`MOTION.pop`) and the existing Seal bell (`sfx.seal()`) rings once for the view. With Reduced motion on, the card just fades in, with the bell.
- **Save field is `trophiesSeen`** (cubby ids), not `seen`, because `profile.seen` already holds the reward-moment snapshot. It follows the `sealsSeen` pattern: `newTrophies()` in packages/sim records an id the first time it is drawn, so a cubby on another page waits for its page.
- **Old saves.** A save without `trophiesSeen` loads as null; the first Trophy Case view marks every already-earned cubby as seen silently, so returning players see no replays. New profiles start with [] so a new student's first earned cubbies play once.
- The "POP" is the card's scale pop (no on-screen word, no new copy). No new art or wording; all drawn in code.
## P-MENU2-d: Fighting Style data (2026-10-25)
- **Two picks only (D2, the Manager's go).** The profile has an optional `loadout` with a starting Form (Stance) and a chosen Virtue. Strikes and Seals stay always on.
- **No loadout = today's play.** New profiles and old saves get `loadout: null`. A pick the student hasn't earned (or an unknown id) is ignored and that slot falls back to today's default. Nothing else in the sim changes.
- **Starting Form.** The chosen Form starts the fight. The other earned Forms follow in their usual order, so the Form button still cycles through all of them.
- **Golden test.** `packages/sim/test/p-menu2-d-golden.test.ts` compares the character setup and three seeded bot runs for 4 fixture students (new profile and old save) against `fixtures/golden/p-menu2-d-default-run.json`, captured from main (7e99af0) before any change. The Manager approved this plan with no Jay go needed, because the golden test protects today's play.
- **Tester follow-ups (merged main 5d56802 normally, no rebase).** The golden test now has a Rooted Form case (the Counter window on each difficulty, plus a seeded room in Rooted Form with `COMBAT.rootedFormBonusTicks`), captured by running `test/golden-capture.ts` on origin/main 5d56802. Changing the Rooted bonus from 2 to 3 makes it fail. `readLoadout` now keeps only ability-style ids (lowercase words joined by hyphens) and drops built-in object names like `toString`, `constructor` and `__proto__`.
## P-MENU2-e: Fighting Style screen (2026-10-25)
- **Manager approved the plan.** Mood A (warm dojo wood). Two slot cards (Stance, Virtue). Under them is a tray of picks for the chosen slot, and a plain-words preview card is on the right (D2, D6: no numbers). Strikes and Seals sit in an "Always with you" row. They are shown there, not picked.
- **Tap to equip (D4).** Tap a slot card, then tap a tray tile. The pick is saved right away to `profile.loadout` and the card pops (no pop with Reduced motion). There is no drag and no "Use this" button.
- **Not-yet picks (D3).** These are Forms or Virtues from content that the student hasn't earned yet. They show as paper tiles with a lantern and "Learn this at the dojo". There is no lock and no count. Tapping one opens the cubby sheet with "Ask Sensei about this one". It never equips anything.
- **Art.** Glyphs and the lantern are drawn in code. No #265 art is imported. All wording is in `content/abilities/fighting-style.json`. Read-aloud waits until after beta (D5).
- **Fit.** Every tap target is at least 44 px tall (tested at the 667, 844 and 932 panel sizes). Slot names wrap to two lines instead of being cut. The hint line only shows when it fits.


## B-POLISH-2: Trophy Case polish (2026-10-25)
- **Manager approved** doing the Tester's 3 polish items as one small PR. Done when: the pop goes 1 → 1.06 → 1, the 667 sheet allows 3 lines (Basic Form 1 shows '15% slower.'), and the Self-Defense cards have even side padding at 844.
- Tokens live in `TROPHY_UI` (ui/tokens.ts): `popPeak` 1.06, `effectLines` 3, `cubbyPadX` 8. The pop is two chained tweens (up, then settle), not a yoyo, so the P-MENU2-c "no endless tweens" check still holds. Reduced motion stays a fade.
- A cubby label that is one long word ("Self-Defense") can't wrap, so its font steps down (to 10 px minimum) until it clears 8 px on each side.
- Manager: mid-fight Form switching after a loadout pick is fine; P-MENU2-e explains it simply on that screen.
- **Extra scope (Manager-approved):** removed the unused `COMBAT.rootedFormBonusTicks`. combat.test.ts and the P-MENU2-d golden capture now read the Rooted bonus from `counterWindow` in content/abilities/abilities.json. The golden output is unchanged; setting counterWindow to 3 makes the golden test fail, as it should.
- **Tester fix (#271 retest):** the 10 px step-down left only ~4 px at 844, so it's gone. A label too wide for the padded width (cubby − 2×8 px) now breaks after its hyphen ("Self-" / "Defense #1"), and cubby labels allow 3 lines at 12 px; the icon shrinks (`cubbyIconSize`, min 20 px) to make room. "Learn this at the dojo" now fits in full. Wording unchanged. Measured text width vs inner width: at least 8.5 px clear each side at 667/844/932.

### B-POLISH-2 — 2nd Tester fix + Manager scope (#272 merged)
- Cubby text width counts the 2 px stroke: `tw = size − 2·cubbyPadX − stroke`. Measured: ≥ 8.0 px clear on each side at 667, 844 and 932.
- Icons stay full size (31 at a 73 cubby, round(size·0.42) everywhere, so one size per row). 3-line labels fit by trimming spacing: line gap −3, top 0, icon→label gap −1, bottom 1. Measured at 844: the tightest label ends 2 px inside the stroke.
- Fighting Style (#272) polish: the hint always shows. Title and body step down a size, then the gaps tighten, so nothing hides. The title wraps to 2 lines (no "…"). Locked tray tiles show the pick's name. An "Always with you" perk with no art gets a code-drawn gold star instead of its first letter. Re-tapping the equipped pick returns the same loadout object, so there's no re-save and no pop (tested).
- Manager calls on #272: show all not-yet Virtues as calm tiles; no +n count; no "Use this" button; wrap the title; the empty locked circle is fine for now.
- Tray tiles use the cubby rules: text width = tile − 2·8 − 2 (stroke), up to 3 lines with a tight line gap, and a hyphenated word breaks after its hyphen. If 3 tiles can't hold the widest tray word ("Beginner's", 67 px) with that padding, the tray shows 2 wider tiles. That happens at 667, where 3 would be 61 px. The smallest measured tray gap is 8.0 px ("Rooted Form" at 667). Trade-off: at 667 the third pick in a tray is not shown (the tray was already capped at 3).
- Tray paging (Manager call: never hide an earned pick). When a tray has more picks than fit, the row gets the Trophy Case's ◀ ▶ arrows: button(), WOOD.switchOff, 15 pt, 44 wide, the tile's height, greyed at the first and last page. The tray pages; it resets to page 1 when the slot changes. Tiles keep the cubby padding (≥ 8 px, stroke counted).
- Geometry at 667: the row is 199 wide. Two tiles of at least 87 px plus two 44 px arrows need 274 px, so a paged tray at 667 shows 1 tile per page between the arrows (95 wide). A tray that fits without arrows still shows 2 tiles. At 844 and 932 a paged tray shows 2 per page. A test pages through 1–12 picks at all three widths and reaches every one.

## P-MENU2-g: Last run "Scroll of the Climb" (2026-10-25)

- Layout follows the #265 Last run mock (layout only; no #265 art). All art is drawn in code: the paper scroll with rolled wood ends, room chips, stat tiles, a house badge for dojo pieces, the sparkle stars.
- Model and layout live in `apps/client/src/ui/lastRun.ts` (no Phaser); words in `content/settings/last-run.json`. No sim changes; the golden test is unchanged.
- Banner in kind words ("Floor cleared!" / "You reached room N of M!" / the rested line). Bests moved from the bottom of the panel into a Bests sheet: the student's own four bests, "New best!" on the ones set this run, no comparisons, streaks or guilt words.
- Stat tiles: Rooms, Perfect, Combo, Time (real seconds); a 5th XP tile (+n) when the content is at least 420 wide (844 and 932). At 667 the XP gain shows only as the fill bar.
- Count-up runs once per run: the run id (`runsPlayed:ticks:perfects:items`) is stored in localStorage `dojo.lastRunCounted` the first time the scroll is drawn, so reopening or switching tabs shows final values. Reduced motion: final values at once (and the run is still marked shown). Chips fade in 60 ms apart, tiles count 400 ms, then the XP bar fills 600 ms Cubic.Out.
- Found strip: every item (rarest first) and every dojo piece is a 44 px tile. An item still in the bag opens its Gear sheet (switches to Gear with it picked); an item no longer in the bag, or a dojo piece, opens a small paper sheet here. When more than fit, one ▶ at the end of the strip turns the page and wraps; page dots sit beside the "Found" label (never "n / m").
- "New for you": the first earned Trophy Case cubby not in `trophiesSeen`, with three twinkling code-drawn stars (they stay still with Reduced motion). Hidden when there is none, and on old saves where `trophiesSeen` is null. Tapping it opens Abilities → Trophy Case, where the unlock moment plays and it is marked seen.
- Short phones (content under 300 tall): 24 px chips, 44 px tiles and 4 px gaps so everything fits at 667×375 and 844×390.
## P-MENU2-f — Gear polish (2026-10-25)
- Worn items stay in the bag grid, marked ✓, instead of being taken out. The bag order is slot, then strongest, then id, and ignores what's worn, so wearing never moves a tile.
- Tiles have no text labels: an icon, a rarity border and a small ↑/↓ badge. That keeps them narrow and works for pre-readers. The name is in the sheet.
- The compare shows arrows and words only. Numbers are behind a Details toggle (D6). Down uses a soft grey, never red.
- The pager row is always reserved, so the grid's y never depends on how many pages there are.
- The sheet spans the whole Gear panel. At 667, a tile in the second row can be partly covered when the sheet opens at the top. Accepted, because the picked tile is still visible and the sheet is about 150 tall.
- Fighting Style tray dots reuse pageDots, the Trophy Case rule: dots only, hidden for one page.

### P-MENU2-f — Manager calls on #273 (2026-10-25)
1. **Worn mark:** keep the gold ✓ on worn tiles (worn items stay in the grid).
2. **Details toggle:** keep it. The compare shows arrows and words, and numbers only appear behind Details (D6).
3. **Tiles:** icon tiles with no item names. The name stays in the sheet.
4. **Rarity word (add-on):** a small rarity word sits under each tile's icon, as in the #265 mock. It is 12 px bold in the rarity colour, with ≥8 px side padding (`cubbyTextW`, `TROPHY_UI`), drawn with `wrapLikeCubby` and capped at 1 line. The words are content `rarityNames`. The widest word among the rarities that can drop (`LOOT.rarityWeights`) sets the minimum tile width, so the grid depends only on panel size and content, never on the bag, a pick, wearing or a filter. There are still at least 3 columns. Resulting layout: 3 columns × 2 rows at 667, 4 × 2 at 844 (was 5) and 5 × 3 at 932 (was 6). The doll column's minimum went from 104 to 102 so 3 tiles of 73 fit at 667. Known gap: "Legendary" is not droppable today but is in the dev seed. At 667 it has only about 3 px of padding, and at 844/932 about 6 px.
5. **Legendary sizing (Manager, 2026-10-25):** leave it as is. Instead, a guard test in p-menu2-f-gear.test.ts fails if any rarity with weight > 0 in `LOOT.rarityWeights` has a word that doesn't fit with ≥8 px padding at 667, 844 or 932. Its failure message says to resize the Gear tiles. I proved it by temporarily giving Legendary weight 1: it failed with that message, and I reverted the change.
6. **2 columns with paging at 667 (Manager, Oct 25):** at 667 the bag uses 2 columns with ◀ ▶ paging so the student figure stays on the doll. 844 and 932 stay at 4 and 5. Every rarity word, Legendary included, now sets the tile width (84 px), with ≥8 px clear each side inside the 2 px border; this replaces the Legendary guard in item 5.
## B-T3: tier 3 Ember Kitchens, Orange belt (2026-10-25)
- **Supper Rush Challenge: 90 s**, text "Clear the room in 90 seconds for a better chest!". Both come from the Researcher's PR #275 (drafts/planning/B-T3-tier3-balance-notes.md), which is **pending Jay, not merged**. Re-check these values if #275 changes. Only the Supper Rush values were taken from that note; it has no other tier 3 numbers. The note also says: if White–Orange testers miss it more than about 1 in 3 tries, raise it to 100 s, and don't go below 80 s.
- **Room sets per tier.** A tier with its own room set (tier 3: the 8 Ember rooms) uses only those rooms, and only at exactly that tier. If the set has no room of the kind asked for, it falls back to a battle room.
- **New sim support:** boss phases (attacks by health share), splitting on defeat (Dough Blob → Doughlings), and dash-only attacks (`counterable: false`: can't be Countered or blocked; the balance bot dashes out of them).
- **Hearth Cook is a floor Guardian** for the keeper statue (`FLOOR_GUARDIANS`).
- **R-BAL-12 band exception (Manager):** Hearth Cook's Challenge time for the trainsMore student is allowed above the top of the band (R-BAL-12: "accept it (Challenge is optional)"). The new enemies are in the band test.
- **Rolling pin lane** uses a round danger area for now (Manager); the real lane shape is a follow-up.
- **Art (Manager):** imported tower-t3, the Orange enemies and the three Hearth Cook rigs, plus Ladle Lobber and Dough Blob from #241. The Doughling uses the approved stand-in. No badges-trophies-a3* art.
- **Client:** the Hearth Cook rig follows its phase (p1 ≥ 0.66 health, p2 ≥ 0.33, else p3, from the phase data). It swaps only between attacks, because the next rig may not have the current attack's art (this crashed in screenshots before the fix). Art without a defeat animation fades out over 600 ms (visual only).

- Hearth Cook tuning (#279) deferred to B-T3-TUNE; 575/20 failed R-BAL-12 at belts 4–10 (Manager, Oct 25).
## R-STANCE-a — Forms renamed to Stances (2026-10-25)
- **Manager go (Oct 25):** R-STANCE-a is a rename only, as a beta placeholder (drafts/planning/R-STANCE-stances-and-kata-rewards.md §1). No new stances, no Fighting stance, no kata powers.
- Form/form became Stance/stance everywhere: content (`stances`, ids `rooted-stance` and `flowing-stance`, the kata `stance` field), sim (`StanceDef`, `activeStance`, `stanceSwitchTicks`, the `stance` action), client UI (the HUD button says STANCE) and the sprite tags in approved.json and assets/art/player-a/b.json. Kata names such as "Basic Form 1" keep "Form". No old aliases are kept.
- **Save migration (idempotent):** `migrateLoadout` in profile.ts runs on every load. If a save has `loadout.form` and no `stance`, the value moves to `stance`; if it has both, `stance` wins; `form` is always dropped. Old ids (`rooted-form`, `flowing-form`) map to the new ones, so an old save keeps its pick. Running it again changes nothing.
- A test fails if any content string or game-code string says "Form"/"FORM" outside a kata name.
- The golden run is the same as before apart from the renamed ids.
- Button labels are now at least 12 px (the STANCE and VIRTUE labels were 9 and 11 px), and the stance name under the button is 12 px.
- content/dojo/decorations.json still says "form" in lowercase where it means a kata; left as is.

### B-T3-TUNE — Manager calls (2026-10-25)
1. **Phase thresholds:** keep 0.66 / 0.33 (bestiary-plan.md: "Each phase starts at a health mark (100%, 66%, 33%)"). No spec says 50%/20%.
2. **Challenge timer:** stays tick-based, so the timer and the whole game slow together on very slow frames. `MAX_TICKS_PER_FRAME` goes from 5 to 10 (GameScene.ts), so up to 500 ms of game time (about 568 ms real) runs per frame before anything is dropped. It still stops a burst of catch-up after a long pause.
3. **Challenge words in content:** each challenge room has `inTimeText` and `outOfTimeText` next to its prompt. Supper Rush: "In time!" and "Time's up! The soup cooled, but you still earned a chest." (true: a missed challenge chest still drops `loot.chests.challenge.items` = 2). Gauntlet and Shield Wall keep "In time!" / "Out of time". The room-clear line puts a missed time on its own line, wrapped to the screen width.
4. **Hearth Cook 549/17 (Researcher #280):** White-belt base maxHealth 543 → 549 and power 16 → 17; nothing else changed. R-BAL-12 stays green (belt 3–10: Challenge hits to beat 76–80, knock-out ≥ 5).
5. **Timer label (#282 review, Oct 25):** when time runs out the timer shows only the short `outOfTimeShort` word ("Time's up!" in Supper Rush; "Out of time" elsewhere), on one line at the timer's normal size. The full sentence stays on the room-clear line, so the timer no longer wraps over the door labels at 667.
- **B-T3-TUNE door labels vs timer (#282 Tester, Oct 25):** door labels now stop at screen y 72 (`DOOR_LABEL_TOP_PX`) instead of 56. This keeps them at least 8 px under the Challenge timer (top 36, bottom ~64) for any camera position and width. The timer itself doesn't move.

### B-T3-TUNE-2a+2c — Hearth Cook pot lid, patterns, phase pause (2026-10-25)
- **Manager go (Oct 25):** rows 2a and 2c of drafts/planning/B-T3-TUNE-2-boss-levers.md.
- **Pot lid (2a):** new enemy flag `lidWhileHelpers` (on for the Hearth Cook). While any called helper (a Spark Sprite) is still up, player hits on it do 0 damage and send a `clang` event instead of a damage number.
- **Patterns:** P1 bonk, pin. P2 bonk, rush (sparks), pin. P3 rush, pin, bonk, pin. Wind-ups unchanged (pin 26, bonk 20). A pattern may name an attack twice, so the boss keeps its place in the pattern (`phaseStep`); a new phase starts its pattern from the top (after any wind-up in progress).
- **Phase pause (2c):** at 66% and 33% the game holds still for about 1 real second (`PHASE_HOLD_TICKS` = `realSecondsToTicks(1)`), the same way the guided-Counter hold does: nothing moves, nothing is hurt, the Challenge timer stops. Once per threshold per fight; a reset fight starts over.
- **Placeholder look until Jay OKs art:** a code-drawn grey lid at the end of the boss bar and a grey wash over the bar while the lid is up; a short grey tint on a clang (reuses the clank sound); at the phase pause a "ROAR!" word, an orange glow and the phase's `senseiLine`. Reduced motion keeps the lid marker and drops the glow and the tint. No new art or sound files.
- **Art gaps:** the phase rigs don't draw every attack in the new patterns (P1 pin, P2 pin, P3 bonk). The client stands in with another wind-up the rig has; the warning shape is code-drawn. Listed in b-t3-art.test.ts until real art comes.

### R-STANCE-d1 — The four real stances and their numbers (2026-10-25)
- **Manager go (Oct 25):** R-STANCE-d is split. d1 covers the stances and their numbers (drafts/planning/R-STANCE-c-stance-numbers.md, #290). d2 covers sign-off unlocks.
- Content stances: Beginner's Stance (unchanged), Cat (+1 counter window, dash cooldown −25%, takes 15% more through a block), Front (+8% power, −10% move speed), Fighting (blocks 15% more, Focus gain ×1.2, dash distance ×0.8), Horse (+10% power after 10 still ticks, −20% move speed).
- **Manager calls:**
  1. Horse is +10%, final.
  2. Old `rooted-*` / `flowing-*` saves go to Ready (stance null). The migration stays idempotent. `normalizeLoadout` drops any stance that isn't unlocked.
  3. No Front push and no strikePush field.
  4. The picker and the `unlockedStances` logic stay as they are (Ready plus the newest 3); only the ids changed.
  5. Horse uses the approved stance_rooted idle (approved.json `rooted-form` → `horse-stance`). Cat, Front and Fighting use Ready's idle. No new art.
  6. Stance text is the #288 one-liners from drafts/content/katas/stances.json. No story text was written.
- New StanceDef fields: dashCooldownScale, dashScale (defaults to 1), blockCut, focusGain, stillPower and rootTicks. The content check fails if powerScale or stillPower is outside 0 to 0.12, or if guardScale is below 0.
- **Builder choices (not in the spec):** Cat's dash cooldown is floor(30 × 0.75) = 22 ticks, matching the 22 in the spec. For Horse, guarding and standing still both count as still; walking or dashing resets the count. Stance power adds to gear powerScale.
- Kata to stance order is positional (Basic Form 1 → Cat, Basic Form 2 → Front, then Fighting, Horse) until d2.
- The golden run was re-captured. Only the stance ids and the "rooted" case changed: Cat's +1 window replaces Rooted's +3.
- **Manager confirmations (#293 review, Oct 25):**
  - Horse counts guarding as standing still.
  - Stance power stacks with gear power.
  - Cat's dash cooldown is 22 ticks.
  - "Beginner's Stance" stays until Jay decides.
  - The in-game one-liners (what each stance does) come in a follow-up.

## R-STANCE-d1: old Form saves with no virtue keep their loadout (Oct 25, 2026)
- Manager's call: a save with `loadout.form` and no virtue keeps its migrated stance, and the virtue stays empty (the default). The loadout is not nulled and the stance is not reset.
- Before: `{ form: 'rooted-form' }` (or flowing-form, rooted-stance, flowing-stance) migrated to `{ stance: null, virtue: null }`, which `readLoadout` then turned into `loadout: null`. A fight played the same (Ready first, today's virtue), but the saved loadout was gone.
- Now: `readLoadout` keeps `{ stance: null, virtue: null }` for an old Form save or an explicit `stance: null`, and `normalizeLoadout` no longer nulls a loadout whose stance isn't unlocked. Rooted and Flowing still map to Ready. Junk loadouts still load as null.
- Test: packages/sim/test/r-stance-d1-stances.test.ts ("old Form save with no virtue").
### B-MASHER — Shield bounce Focus, mash guard, kid bot (2026-10-25)
- **Manager go (Oct 25):** drafts/planning/B-MASHER-plan.md (#291), approved calls below. Turning it on for everyone is the Manager's routine tuning call.
1. **Mash guard:** a counterable enemy attack that lands while the player is mid-swing (basic-attack `attackCooldown` > 0, the 12-tick swing) counts as a Block. Dash-only attacks (`counterable: false`) still hit.
2. **It is a normal Block:** half damage, gear blockCut and reflect apply, combo and chain kept, same block event. A timed Counter stays strictly better (no damage, a stagger, more Focus).
3. **Shield bounce Focus:** +6 Focus (`COMBAT.focus.perShieldBounce`, capped at max) for basic and ripple shield bounces. The Hearth Cook pot-lid clang gives none.
4. **Glow:** a code-drawn soft gold ring for 0.4 s on a bounce. With `dojo.reducedMotion` 'on', a steady 0.4 s tint and no pulse.
5. **Kid bot:** masher plus an independent 12% roll each tick to press Counter or Strike (50/50) at a random living enemy (seeded rng). The 200-run gate (belts 1–10 × 20 seeds; room-1 KOs ≤ 20, wins ≥ 35%) runs only with BALANCE; a 3-seed kid case runs in CI.
- **Tests:** older tests that assumed a full Hit or 0 Focus now call `holdSwing` (test/hold-swing.ts) or expect the new values. The golden run was recaptured: only run outcomes changed (blocks, health, perfects), setup identical.
- **Manager calls on #295 (Oct 25):** (1) the b-t3-tune-2 boss-levers "with pauses" floor drops from 15 s to 14 s; (2) the drop in smart-bot damage taken is accepted for now; (3) the golden re-capture is OK.

### B-MASHER-2 — Mash guard fades after 3 Perfect Counters (2026-10-25)
- **Manager go (Oct 25):** E3 from drafts/planning/B-MASHER-2-mash-guard-tune.md (#296).
- Mash guard works until the room has `COMBAT.counter.mashGuardPerfects` (3) Perfect Counters, then is off for the rest of that room; every new room starts it again. The sim sends `mashGuardOff` at the 3rd.
- The first time in a run, Sensei says the line from content/settings/mash-guard.json (final wording from the Content Designer: "Three perfect counters! Your timing can fly on its own now.") with a gold ring that grows and fades around the player. With `dojo.reducedMotion` 'on': the same line, no fade-in, and a steady gold halo for 1.2 s. Text 20–26 px, padding 16/8 px.
- The golden run was re-captured again (outcomes only).
- **Manager call on B-MASHER-2 (Oct 25):** the 16–18% drop in smart-bot damage taken (vs 911ce19: −17.8% typical, −15.7% trainsMore, −17.1% playsOnly) is accepted for the beta. Smart bots still win 200/200 and the bands pass 293/293.
- **Mash guard wording (Content Designer, Oct 25):** "Three perfect counters! Your timing can fly on its own now." (the Sensei box adds "Sensei:").
- **Manager call (Oct 25): the once-per-run "Sensei steps back" line stays seen after a reload.** It's saved with the run (`RunState.mashGuardSeen`, saved as soon as the line shows); runs saved before this load as not seen.
- **Manager call (Oct 25): in co-op, Perfect Counters and Mash guard are per player.** `PlayerState.perfects` counts each player's Perfect Counters in the room; `mashGuardOn(p)` and `mashGuardOff` use it. `world.progress.perfects` still counts the room total for grades.
- **QA on #295 (layout only):** the stepped-back banner keeps off every player's sprite (its usual spot, then the top edge, then the bottom; clear of the buttons and doors when it can be, and of the players always, re-checked while it holds). Its two lines are balanced, so no word sits alone (20 px at 667, 26 px wider).
- **Manager call (Oct 25): at 667 the stepped-back banner may cover the CHALLENGE door label** (the only spot there clear of the player and the buttons). Accepted as is.
- **Manager call (Oct 25): in co-op the "Sensei steps back" line shows once per player.** `RunState.mashGuardSeen` is now the list of player ids who have seen it this run, saved with the run (a reload doesn't show it again to anyone who saw it).
### B-T3-NUDGE follow-up: phase-pause words keep off the player (2026-10-25)
- **ROAR!** starts 8 px under Sensei's banner (screen space). If it would cover the player's sprite, it moves above the player's head; if that would push it within 8 px of the banner, it goes 8 px below the player's feet instead.
- **"Help me!"** (wording unchanged) is the enemy's line, so it sits over the calling enemy's head, not in the centre, so it can't read as the student speaking. It stays at least 8 px under the banner, clear of ROAR!, and gets the same keep-off-the-player move.
- Shots (`b-t3-tune-2-shots/v4`, reduced motion on/off at 667/844/932): player overlap 0 for both words; "Help me!" centred on the Hearth Cook. Placement makes the speaker clear, so no new wording is needed.
- **Name labels too:** "Help me!" also keeps 8 px off every enemy name label (the boss's name + bar pair, named monsters' plates and tags). It nudges up first (stays over the caller), then down; never within 8 px of the banner. v5 shots: 0 overlap with player, banner, labels and ROAR!.

### B-CF-BUILD — npm only, so Cloudflare builds again (2026-10-25)
- Cloudflare Workers Builds chooses the installer from the lockfile. A near-empty `pnpm-lock.yaml` (added with B-BELT, #246) made it install with pnpm, which installed nothing, so `tsc` was missing and every build since 3022b7b failed.
- Removed `pnpm-lock.yaml`; root `package.json` now sets `"packageManager": "npm@10.9.2"` (the npm Cloudflare's build image ships; the box has 10.9.9, so we pin Cloudflare's). A test (`b-cf-build.test.ts`) fails if `pnpm-lock.yaml` or `yarn.lock` shows up at the root. No dashboard or account changes.
## P-MENU2-i: menu2 art in Trophies, Gear and Last run (2026-10-25)
- Jay OK'd the #265 art; the Manager gave the go. Only Trophies, Gear and Last run use it.
- My Style's art (slot-card, tray-tile, tray-equipped-badge, switch, glyph) is held, not imported. A test checks no quoted My Style frame names are used.
- The @2x files are packed untrimmed ("ui" source type) and drawn at 0.5. Every art draw falls back to the code-drawn version when a frame, page or pack is missing, so no code paths were deleted.
- Legendary uses the Epic art. Stat-tile words switch to dark ink on the paper tile; the "Everyday" word on the common bag tile uses #6b5a48 so it can be read on paper.
- The lantern shows on the next cubby only (the code lantern stays in the fallback).

## P-MENU2-i: Manager's calls on #286 (2026-10-25)
1. The shared #265 pieces join this PR: panel frame, title plaque, and the wood (honey) buttons for the tab bar, Bests, Again, Close and the page arrows, on Trophies, Gear and Last run. The Trophies/My Style switch and all My Style art stay code-drawn. Fallbacks, 44+ taps, 12+ px text and 8+ px padding are kept.
2. Today's layout stays; no layout changes.
3. These stay as they are: Legendary borrows Epic, the code-drawn circle on kata cubbies, the lantern on the next cubby only.
4. Dark ink on the stat tiles and #6b5a48 for "Everyday" are approved.
- How: the panel frame is drawn at 0.25 so its rail fits the code frame's margin; Gear and the Trophy Case keep their dark well over its paper centre so their light words still read. The page arrows use the honey button with the ◀ ▶ label (the art has no page-arrow sprite). Unpicked tabs are the honey button darkened. Labels on honey are #462a16.

## P-MENU2-i: QA fixes on #286 (2026-10-25)
- Gear tiles: the bag-tile art is drawn at one uniform scale (fit to the tile width). When that is too tall, the top and bottom halves are cropped and butted together, cutting out the plain middle. Nothing is stretched (`menu2Fit`).
- Contrast is at least 4.5:1, without changing the art:
  - Rarity words on paper use darker inks: Special #245a24, Rare #174a7d, Epic #5e2696, Legendary #8a4a12, Everyday #6b5a48.
  - Earned cubby names keep cream text with a 4 px #3a2618 outline (13.3:1).
  - The XP number is #245a80 and "New for you" is #8a4a12.
- 3-slice art (XP rail, shelf plank, belt cord) is now drawn exactly at the height asked. It was drawn about twice as tall, which put the XP rail under the Found dots and "New for you".
- The XP rail is 1 px taller than the bar on each side.
- Stat labels sit 8 px inside the painted wood rim (bottom and sides). On 44-tall tiles the rim is drawn at k 0.25 and the number is 14 px, so it clears the label.
- menu2-0.webp is saved as lossy WebP at quality 90, with alpha kept exact (`webpQuality` in approved.json). It went from 838 KB to 268 KB, with RGB PSNR 35 dB.
- QA round 2: the XP rail is drawn thinner where space is tight. Its bottom stays at least 8 px above Found, the dots and "New for you" (7 px tall at 667/844, 13 px at 932). The Legendary rarity ink is #5a2e08 (6.69:1 on its tile; #8a4a12 measured 4.05).

## C-RENAME-3-code — "Great Counter" in code (2026-10-25)
- Jay picked "Great Counter" to replace "Perfect Counter" in kid-visible text. Data/content was renamed in #307; this PR renames the code strings (lesson name, `GREAT x` chain, `GREAT!` pop word, Last run "N Great") and the world.ts comment.
- Internal keys (`perfectCounter` event, `mostPerfects`, `healOnPerfect`, `firstPerfectUnaided`, `lesson-perfect`) stay as-is so saves and content keys don't break.
## P-MENU2-SPACE: Training Board fits short landscape phones (2026-10-25)
- Jay's iPhone Safari landscape leaves about 290–320 pt of height. The board now lays out from the real viewport height instead of assuming 375.
- **Left column:** under 369 pt tall (the full column with the Path card at its smallest), it goes compact: 8 pt edges, the "Level N · cap" line moves beside the avatar, ENTER is 44 tall. If the Path card still has less than its full-card height, it becomes one row (label and step name). (Round 2: it is never left out; see below.)
- **Panel:** each tab gets at least the height it has at 667x375 (277 pt for Last run, My Style and the Gate; Gear and the Trophy Case already fit). When the panel is shorter, the contents scroll inside it: masked to the frame, a thin wood thumb on the right, drag or wheel. A drag of more than 8 pt cancels the button it started on. Buttons scrolled out of view are switched off. Sheets don't scroll. Scroll position is kept while you stay on the tab.
- We chose scrolling over shrinking: text stays at 12+ px and taps at 44+ pt. A 39 pt scroll at 667x320 is less of a change than restacking every tab.
- **Stat tiles:** 52/64 tall (was 44/56), so the number and its label have 12–13 px of ink between them (was 4.5–6). The icon keeps 8 pt from the final number: the number slides right if the tile has room, otherwise the icon is left out (at 932 the clock is left out next to "14:46"; the gem sits 8 pt from "+180").
- My Style slot name starts under the label's real line height (it overlapped by 1 px).
- **Round 2 (after the Tester's fail, Manager's calls):**
  - A short scroll inside the panel is OK. Leaving the clock icon out at 932 is OK.
  - Taps are clipped to the visible window. Each button's hit area is cut to the part you can see, so a touch outside the window never fires. Proof: `edgetap.mjs` touches every cut button 2 pt outside the window (no events) and 3 pt inside its visible part (it presses).
  - The Path card always shows. On short screens it is at least a one-line row (label and step name), including at 800x290. The left column gives it the space first.
  - The scroll cue is a soft dark fade at each edge with more content, plus a small gold chevron on a dark pill. The thumb is 6 pt on a faint track. All drawn in code.
  - A tab scrolls only when its content really overflows. The empty Last run, Gear and the Trophy Case don't scroll. The Gate's minimum height is worked out from its locks, its 3-line labels and its cards, not a fixed 277.
  - Gate labels get 3 lines ("David / and / Goliath" in a slot about 50 pt wide), so the label shows in full and the cards sit right under it.

## B-T3-TUNE-2b — Hearth Cook #299 art in place of the stand-ins (2026-10-25)
- Jay OK'd the #299 art. Only that art is imported: P1 pin, P2 pin and P3 bonk sheets, the lid overlays for P2/P3, and the boss-bar lid icon (`hearth-cook-lid-icon`, from `icon-lid-24@2x.png`).
- The new sheets and lid overlays merge into each phase rig (`mergeAnimations`), so a phase is still one LayeredSprite. The lid is a layer: hidden by default and shown while `lidWhileHelpers && lidUp(world)`. The art leaves the lid out in some facings (behind the body, e.g. N/NE, and E on the P3 bonk, where it sits edge-on at the hip); that is by design.
- The borrowed wind-up stand-in in `enemyAnim` (B-T3-TUNE-2a) is removed: every phase now draws its own attacks.
- Telegraph tint unchanged (Manager's call): every wind-up keeps `TELEGRAPH_TINT` #ff3b30. The bonk reads red; the pin keeps the same tint.
- Boss bar: the grey wash stays; the code-drawn lid is replaced by the icon at 24 px on its dark pill. The code lid stays only as a fallback if the icon pack is missing.
- Timing: windup_pin is 13 frames at 10 fps = 26 ticks and windup_bonk 10 frames = 20 ticks, matching the sim's telegraphTicks. The wind-up frame still follows the sim clock (elapsed / windupTotal). A test checks frames, fps and telegraphTicks against the content.
## A-LEGENDARY-wire: Legendary gets its own frame (2026-10-25)
- Jay OK'd the golden-orange Legendary frame (#304, incoming-art/legendary-frame). It replaces the Epic stand-in everywhere Legendary gear is framed: Gear bag tiles, Gear doll rings (normal, glow, pressed) and Last run found tiles. `artRarity('legendary')` is now 'legendary'.
- Imported through tools/art-import into the existing menu2 pack (one page, 72 frames). The ui loader gained `mergeSprites` so a second sheet in the menu2 format adds to the same entry; a name in two sheets stops the import. The sheet's `slice` is read as nineSlice.
- Only six frames came in: the three rings, `bag-tile-legendary-9slice`, `bag-tile-legendary-crest` and `found-tile-legendary`.
- **Bag tile = 9-slice + crest**, not the ready-made 84x100 tile: tile boxes vary by screen, and the 9-slice keeps the gold corners and stars true-size where menu2Fit would crop or scale them. The crest (amber gem) is laid on the top rail, unstretched. While picked, the Selected art still wins (same as every rarity). Pressed darkens the frame with a tint (there is no Legendary pressed tile).
- **Shine left out.** The 6-frame shine is optional extra art; Epic has none. It can follow as its own item (skipped under Reduced motion).
- **Contrast (round 1):** the gold rim and corner stars are thicker than the other frames and the word "Legendary" sat on them (lowest pixel 2.11:1). The word is lifted 4 px on Legendary tiles only. Ink #5a2e08 under the glyphs now measures median 9.28:1, 5th percentile 8.89:1, lowest pixel 4.52:1 (average background #f2e0be: 8.85:1), the same at 667x375, 667x320, 844x390 and 932x430. The Epic stand-in measured median 6.54:1, lowest 3.43:1.
- **Round 2 (Tester fail on word clearance; Manager's call):**
  - The word "Legendary" clears the gold rim by at least 8 CSS px below (descenders included) and at both sides, on Legendary tiles only. The word sits LEGEND_CLEAR (8) above where the rim begins (LEGEND_RIM.bottom 11 px in); the icon gives up the height (font stays 12 px). Tiles get a minimum width of word + 2 × (5 px rim + 8 px clear) while the Legendary art is loaded; at the four test sizes the tiles were already that wide, so the grid did not change.
  - Measured at DPR 2 from the pixels (glyph pixels vs the first rim pixel): below 9.5, left 9.5, right 9.0 CSS px at 667x375, 667x320, 844x390 and 932x430, Reduced motion on and off. Contrast of #5a2e08 under the glyphs: median 9.27:1, 5th percentile 9.10:1, lowest pixel 8.96:1.
  - Manager's call: a picked Legendary keeps its orange frame and crest; the selected highlight is drawn on top (a honey 3 px ring just outside the tile and a cream 2 px ring just inside the gold rim) instead of switching to bag-tile-selected. The ring halo is unchanged.
## R-STANCE-d2 — stances unlock from teacher sign-offs (2026-10-25)
- Manager's calls: (a) each stance (Cat, Front, Fighting, Horse) needs its own real teacher sign-off, at any belt; no automatic grant and no legacy grant. (b) Stance sign-offs stay out of Gate progress and the Power Rating Sign-offs score. (c) The picker shows all 4 stances plus Ready. (d) Katas unlock nothing for the beta. (e) Horse is a white-belt stance like the others. (f) Placeholder DojoForge ids live in content/ and fixtures/, never in code.
- The game still only reads the DojoForge feed. Stance sign-offs come in a new optional list, `stanceSignOffs` (`id, signedOff, signedOffOn, signedOffBy`), matched to `StanceDef.signOffId` in abilities.json. Placeholder ids: `PLACEHOLDER-dojoforge-stance-cat`, `-front`, `-fighting`, `-horse`. Ready has none. The content check fails on a missing or duplicate id; the feed fails on a duplicate entry.
- They are kept in `TrainingState.stances`, not in `requirements` or `abilities`, so the Gate, the Power Rating, catch-up items, the legacy grant and the trophy case never see them.
- Kata files now say `"stance": null`; a kata sign-off reads "Kata (its reward arrives in a later update)".
- A new stance sign-off plays the normal sign-off moment ("Sensei Jay signed off Front Stance!", "New Stance: Front Stance") once; the saved snapshot remembers stance ids. A stance sign-off adds no stats, so it shows no "You got stronger" line (signOffGain skips it).
- Saves: a picked stance that is not signed off loads as Ready and keeps the Virtue (normalizeLoadout); running it again changes nothing.
- Fixtures were given stance sign-offs that match what their katas used to grant, so play is unchanged: 2 white = Cat; 3 yellow = Cat, Front; 4 green = Front, Fighting, Horse (Cat locked); 1 and 5 none. The golden run was re-captured only to add the new `signOffId` field; every setup and run is otherwise identical (checked by stripping the field).
- Fixture 2 now has 4 fresh sign-offs on first visit, so the M7-P4 cascade groups them into one card (it was 3 single cards). Tests updated to say so.
- Manager's call (after review): keep the grouped sign-offs card for fixture 2's first visit; fixture 2 keeps its Cat Stance sign-off.

## R-STANCE-g — Beginner's Stance is plain standing; Ready becomes Open Leg with its own sign-off (2026-10-26)
Jay's call: Ready is the open leg stance; a new default Beginner's Stance is plain standing with no bonus; new players start in Beginner; old saves in Ready stay in Ready. The Manager's answers (Q1–Q7):
- **Q1 Sign-off:** Open Leg (Ready) needs a teacher sign-off, placeholder id `PLACEHOLDER-dojoforge-stance-ready`. Existing players keep it without one (grandfathered).
- **Q2 Numbers:** Open Leg takes the old Beginner numbers unchanged; the new Beginner is all 0. **DECIDE (flag):** today's beginners-stance numbers were already all 0 (counterWindow, attackSpeed, moveSpeed, guardScale, powerScale 0; dashCooldownScale, blockCut, focusGain, stillPower, rootTicks default 0; dashScale default 1, the neutral multiplier). So Open Leg and Beginner play exactly the same. No numbers were invented; Open Leg needs its own numbers from the Researcher or Jay if it should differ.
- **Q3 Ids:** Beginner keeps `beginners-stance`; Open Leg is `ready-stance` (matches #303). Display name "Open Leg Stance" (Jay's C-RENAME-2, recorded in #303).
- **Q4 Art:** plain idle stand-in (no stance-tagged animation yet).
- **Q5 Migration (b):** a save from before R-STANCE-g that has played a run, or has any Stance pick (d1 already moved Rooted/Flowing to null, which then meant Ready), gets `grandfatheredStances: ['ready-stance']`; if its pick was the old default (null or the old `beginners-stance`) it now starts in Open Leg. A real pick (e.g. Cat) is kept. New profiles carry `stanceMigrated: true`, so the check runs once per save, re-running changes nothing, and it never makes a new player Ready. An old save with a retired pick (Rooted or Flowing, e.g. `rooted-stance`) lands in Open Leg: the save reader turns it into the old default (null), and the migration moves that to Open Leg (Manager confirmed, R-STANCE-READY-NUM; the earlier wording here said Beginner's). After the migration, a pick that isn't signed off falls back to Beginner (null).
- **Q6 Lines:** Open Leg's abilities text is "The open leg stance." and its Fighting Style line stays "Steady and even. Good at everything." **Manager change:** the Beginner placeholder line was dropped; the main picks from merged #312 (drafts/content/katas/stance-lines-g.json) are copied into content/, not code: Beginner line `lines.beginners-stance` (and its abilities text), locked Open Leg line `notYetLines.ready-stance`, and the welcome line `welcomeStance` in content/abilities/fighting-style.json. Note: #303's draft had a different Open Leg gameLine ("Steady and even, ready for anything."); the Manager's call keeps the old line.
- **Q7 Order:** Open Leg is stances[1], right after Beginner.
- Fixtures: Open Leg is signed in 3 (yellow) and 4 (green), unsigned in 1, 2 and 5.
- The welcome card now stacks the preview below the (two-line) welcome line so they don't overlap.
- Golden run re-captured on purpose: Open Leg joins the yellow and green stance lists, Beginner's text is the #312 line, and the Cat case index moves 1 → 2. Every run result is the same.
- Base: branched from bot-code/R-STANCE-d2 (#311 was not yet on main).

- 2026-10-26 (R-STANCE-g): Manager call: Ready uses #303's approved line "Steady and even, ready for anything." Ready stays at zero numbers until the Researcher proposes a bonus (follow-up).

## R-STANCE-READY-NUM — Open Leg Stance numbers (2026-10-26)
- Manager spec, mapped exactly as #314's table: `ready-stance` gets `powerScale: 0.03` (power +3%), `dashCooldownScale: -0.1` (Dash recharge 30 → 27 ticks), `blockCut: 0.05` (blocks let max(0.1, 0.5 − 0.05) = 45% through, per `abilities.ts`), `focusGain: 0.08` (Focus +8%). `counterWindow` stays 0 (the smallest step, 1 tick, would equal Cat). No standing bonus, no downside. Each bonus is weaker than the matching specialist (#314). Beginner's Stance stays the default and all 0.
- 2026-10-26: Manager confirmed all 4 bonuses with no downside.
- Cap: +3% plus the kata max of +4% (#302) = +7%, under the +12% cap.
- Sims: new BALANCE-gated report `packages/sim/test/balance/ready-stance.test.ts` plays smart, kid and masher with each stance. The bot now also counts damage dealt (`dealt`) and enemies defeated (`kos`) per room. The existing balance report passes no stance, so it does not move. It uses the B-MASHER-c kid gate setup (belts 1-10 x 20 seeds, typical student stats per belt, belt tier, novice, standard; Mash guard and +6 Focus per shield bounce on as in play). A first version ran a bare 100 HP / 10 power character with no belt or tier, so the kid and masher lost room 1 every run; that was the report's setup, not the gate. Its "before" kid row (113/200, room-1 KOs 0/200) matches the gate on main (5254097), R-STANCE-g and this branch. The 137/200 in progress.md is from B-MASHER; B-MASHER-2 lowered it to 113 on purpose. Numbers are in the PR.
- Golden re-captured on purpose: Open Leg's numbers show in the yellow and green stance lists, and each room records the new `dealt`/`kos`. Players start in Beginner's Stance, so every run plays the same.

## Q-PREM-F2 — Settings gets a Done button (2026-10-26)
- QA (Q-PREMIUM F2) found no visible way out of Settings; only a tap on the dim background closed it. The Manager approved a corner button labelled "Done".
- Green `roundButton` (Scroll's Close colour), 96×44 in the top-right corner, 12 px from the edges, 16 px text. It calls the same `close()` as the background tap. The background tap still closes, too.
- It sits above the cards (cards start at 10% height + 44 px), so nothing else moved at 667×320.

## Q-PREM-F4 — Clear the screen on the loss (2026-10-26)
- QA saw the boss name tag, the boss bar, the fight buttons and the joystick over "Ouch! The run is over." The Manager approved hiding them on playerDown.
- On `playerDown` GameScene sets `downed`, calls `buttons.disable()` and `controls.disable()`, hides the boss tag and lid icon, and skips the boss bar in drawHud.
- `ActionButtons.disable()` / `TouchControls.disable()` hide every part and ignore later touches (`onDown` returns early, `contains()` is false), so taps after the loss do nothing. The scene restarts for the next run, which builds fresh controls.
- Try again is untouched (that is Q-PREM-F5).
- Follow-up: popups (`floatText`, `popWord`) are tracked in a set and dropped on playerDown; both return early once down. The counter chain uses the same `fightOver` rule as the combo.

- Q-PREM-F4 (QA fix): on playerDown, the Sensei bubble is destroyed and senseiSay does nothing for the rest of that run, so no bubble sits over "Ouch! The run is over." The scene restart resets `downed`, so the bubble comes back on the next run.
## Q-PREM-F5 — The run-over card has only Back home (2026-10-26)
- The Manager approved removing Try again from the lost-run card. `runOverCard` no longer takes `onRetry`; GameScene's retry callback (fade out, then Dojo if play time is up, else a new Tower run) and its comment are gone, along with the now-unused `startTowerRun` import.
- Back home is centred, same width and colours (#fff6e0 on #4a4a55, 8.12:1). Its height is `max(44, min(52, 13% of height))`, so it is 44 px at 667x320 (was 42). The card's wording and the Back home path are unchanged. No tests covered retry.
## Q-PREM-F1 — First-tap bow and arrival tap-through (2026-10-26)
- Cause of the tap-through, proven on main (8d83a95) before any change: the last arrival card ("Tap to continue" on the celebration, when nothing comes after it) closes on pointer-up and turns the dojo to play in the same moment. A second press from the same gesture (a phone's copy-of-a-tap mouse event, or a quick double tap) then lands in play and walks the hero (main: 6/6 echo taps moved the hero at 667, 844 and 932, Reduced motion on and off; docs/shots/q-prem-f1/baseline-c-main.txt).
- Fix: when the arrival steps end, DojoScene resets the touch controls and ignores new presses for `ARRIVAL_QUIET_MS` = 450 ms. After that, taps walk as usual (each run has a control tap that still moves the hero). bow.ts and Celebrations.ts are unchanged.
- Bow (a) and pulse (b): on main the touch script could not make a single tap miss (centre, edges ±45-50 px, 6-20 px drift, tap as soon as it shows, second finger held down), and every top-bar tap pulsed Bow with no menu opening. So bow.ts was not changed; the script stays as the regression check. If the Tester still sees misses on a real phone, we need a device repro (which phone, where the finger landed).
- The floor case was tested on this profile's first Tower floor, which is the tutorial floor ("Bow at the door to show respect."). It uses the same `bowPrompt()` as "Bow to begin the floor".

## Q-PREM-COLOR — one shared darker green (2026-10-26)
- `GREEN = 0x277a56` in ui/tokens.ts replaces the faint `0x3aa57a` in all 26 uses (8 files), including fills with no text (chore circle, Street Smarts worker colour) and the dev TestingPanel, so there is one green.
- Why: #3aa57a behind white text was 3.07:1 (2.85:1 behind cream). #277a56 is 5.24:1 behind white and 4.87:1 behind cream; #2e8a61 was too light (4.26:1).
- Guard: packages/sim/test/q-prem-color-green.test.ts fails if #3aa57a comes back anywhere in apps/client/src.
## Q-PREM-F6 — Again! pinned to the Last run panel (2026-10-26)
- Again! is pinned to the bottom of the visible panel (`pinnedAgain` in ui/lastRun.ts); when the contents scroll, the scroll window ends S1 above it (footer = edge 16 + 44 + S1), so nothing scrolls under it.
- Why: at 667x320 the panel inside (238) is below the Last run minimum (277), so Again! sat in the scrolled-off part and was clipped.

## Q-PREM-F8 — 12 px clear above Again! (2026-10-26)
- New `AGAIN_CLEAR = S2 + S1` (12) in ui/lastRun.ts replaces S1 (4) in two places: the scroll window's bottom (pinnedAgain footer = 16 + 44 + 12) and the gap under New for you when the panel doesn't scroll.
- When New for you (min 44) can't keep 12 px at a size, the stat tiles give up the shortfall (never under 44). At 667x375 the tiles go 52 → 47; other sizes are unchanged. Chosen over raising the minimum height, which would make 667x375 scroll.
- Why: at 667x320 a 4 px strip of New for you sat just above Again!, so a tap that landed a little high opened Abilities.
- Follow-up: action-button faces (DASH, COUNTER, STRIKE, VIRTUE) were all filled at 0.9 alpha, so the floor tinted through (DASH label fell to 4.51:1). All are solid now (`FACE_ALPHA = 1` in input/ActionButtons.ts); the dimmed not-ready states (container alpha) are unchanged. The rest card's Back home now uses Math.max(44, …) like the run-over card (F5).

## Q-PREM-F9 — readable action buttons, 44 px Dojo top buttons (2026-10-26)
- Colours live in ui/tokens.ts (`ACTION_COLORS`, `ACTION_LABEL`). Each button keeps its own hue: COUNTER 3a7bd5→2f74d3 (white 4.22→4.61), STRIKE d5713a→b75a27 (white 3.36→4.66). VIRTUE ffb02e stays gold, but its label turns dark #14121c (white 1.83→10.15), because darkening it enough would lose the gold. COUNTER's flash 6fa8ff also gets the dark label (2.41→7.70).
- Not ready: COUNTER, STRIKE and VIRTUE no longer fade the whole button (container alpha 0.45–0.55 let the floor show through). They use a solid dim fill with a #d8d2c8 label (5.59–7.38:1) and a faint stroke. DASH and STANCE still dim by alpha (out of scope).
- Dojo: decorate's top bar is 60 px tall, and Done, Move and Put away are 44 px. Street Smarts, Journal and Scroll moved down to y 60 at 44 px, because their tap zones overlapped the top row before. The play row (Board, Decorate, Look, Difficulty) stays 32 px drawn, with a 44 px tap zone.
## Q-PREM-F10 — short stat tiles and the New for you sparkle (2026-10-26)
- At 47 px tiles (667x320, 667x375) the 14 px number (17 drawn) and 12 px label (15 drawn) can't keep the label 8 px inside the rim and still stay apart. On short tiles (< 56) they are now one stack, centred inside the rim and 4 px apart (`statStack` in ui/lastRun.ts). The label sits ~2.5 px inside the rim instead of 8. If a tile ever gets too short for that (44), the number steps down to 12 px. Tall tiles are unchanged.
- The short New for you card (~73 px wide) has no room beside its label for stars, and it is flush with the content's right edge. So its sparkle (two stars, `headingSparkle`) now sits 4 px before the "New for you" heading, in the gap after Found. The tall card keeps its three corner stars. The bottom-left star no longer touches the trophy icon.
- F8's 12 px clear above Again! is unchanged.

## Q-PREM-TRY — go-home retry line (2026-10-26)
- The 10 lessons in drafts/content/tutorial/C-STORY-TRY.json now say "Nice work today. Let's rest at the dojo." (Jay picked version A). lesson-counter-guided keeps "So close! Let's try again." (it never held the old line, per the draft's notInScope).
## B-MASHER-d1 — the knock-out flow (2026-10-26)
Jay's signed spec (#292, drafts/learning/b-masher-d-knockout-flow.md), Manager picks:
- **Screens, words from content/settings/knockout.json only (no new story text):** Screen 1 "Sensei helps you up." with Sensei "Every fall is part of training." (about 2.5 s, `helpUpMs`; a tap skips it; soft fade, Reduced motion fades at once; `sfx.playerDown` is now a warm rising chime, no sad sound). Screen 2 (`keptCard`): "You kept everything you found!" with each find (items, decorations, +XP) and a small sparkle (still under Reduced motion), or "You learned this room!"; Sensei "Let's rest at the dojo."; one Head home button with a drawn door; a tap anywhere also continues; no timer. Screen 3 (Home): "Welcome home!" and one pointer, fading after about 4 s (`pointerMs`) or on a tap, then the usual homecoming (celebrations, goals).
- **Replaces Q-PREM-F4's no-bubble rule:** once the hero is down, `senseiSay` still ignores every line except the help-up line. "Good effort!", "You reached room N of M." and "Every climb makes you stronger." (runOverCard) are gone; "Ouch! The run is over" is found 0 times in apps/client/src and content (test).
- **Guided offer (M7-P1) stays,** now shown after Screen 2 (on Head home), lost runs only.
- **Home is the Training Board** (HomeScene), told by `knockout: 'run' | 'rested'`.
- **Resting line covers time-limit endings too:** a 'rested' ending (M7-P9) and a knock-out while play time is up both show Screen 2 with "Great training today! Your dojo is resting." in place of Sensei's line. The old rest card (restCard, play-time.json restTitle/restLines/restButton) is removed. The resting door itself is unchanged (DojoScene, M7-P9).
- **Pointer order:** a real class first (training nextClassDay) "Train in class to grow stronger!", else "The Tower is ready when you are."; the next-run pointer is skipped when play time is up. No "upgrade ready" pointer.
- **No read-aloud** (a separate item). **Practice-room KO:** the same kind Screen 1 words, and nothing ends; the fight buttons and stick now come back on playerReturn (they stayed hidden after F4).
- **Persistence:** the screens live only while the app stays loaded; banking is unchanged (bankRun once, same as finishRun), so a reload mid-screen loses nothing found.
- Screen 2 measures its title first, so a title that wraps (932x430 caught it) pushes the rows down.
- **K23b banner (line ~704) re-checked:** the centre message is still `this.message`, now "Sensei helps you up.", so the banner placement still keeps off it; in the shots the Sensei line sits under it with no overlap.
- Lines are 7 words or fewer, no banned words (test), and fit 667x375 in at most 2 lines (verify-ui-shots).

## Q-PREM-GRADE — room grades show on Challenge only (2026-10-26)
- One helper, `showGrades(difficulty)` in apps/client/src/game/difficulty.ts, is true only for `challenge`; missing means hidden.
- Off Challenge: GameScene hides the big S/A/B letter and skips `sfx.grade`, but keeps the "Room clear!" line and stats (gradeLine bounds still used by the ability pop-up). The HomeScene tutorial card drops its letter. Last run chips show the room mark instead of a letter. Bests drops "Most S grades".
- Last run and the tutorial card decide by the difficulty the run was played on: RunSummary now has optional `difficulty` (set in summarizeRun). Old summaries without it are hidden. Bests is a lifetime list, so it uses the player's current difficulty.
- Sim rules unchanged: rooms are still graded, the S-grade bonus loot stays, and sGrades / mostSGrades are still tracked, just not shown.
## Q-PREM-BOSSWIN — first Floor Keeper clear gets one big moment (2026-10-26)
- New profile flag `keeperCelebrated` (packages/sim/src/profile.ts). `keeperWin(profile, run, result, bossId)` says yes only for a cleared real floor whose boss is `floor-keeper`: not the tutorial keep, not a test link, not the Hearth Cook. A yes sets the flag; GameScene saves it (writeSave) before the moment shows, so it plays once per save. Later clears keep the normal "Floor cleared!".
- Old saves (no flag), changed by the Manager on 2026-10-26: a tutorial-only clear must not use up the moment. floorsCleared, floorsByTier and the Kind Keeper trophy all count the tutorial keep too (it uses the floor-keeper enemy), so they can't prove a real win. The only proof in a save is lastRun.summary: cleared, not tutorial, not test, and `defeated` includes floor-keeper. That counts as celebrated; anything else stays uncelebrated, so the moment plays (a returning player may see it once late, which is the accepted trade).
- The moment is a new Celebrations step (`keeper`): one screen with the character, rays and 40 confetti, "Floor Keeper defeated!" at 28 px. It stays smaller than a promotion (3 screens, 60 confetti, gong), per the hard rule that real achievements get the biggest celebrations. Reduced motion: no confetti, the rays stay still, and the title doesn't pop.
- Words in content: content/settings/boss-win.json (keeperDefeated, roomClear). "Floor cleared!" now comes from last-run.json `cleared`. No new story text.
- Q-PREM-F9 QA fix (2026-10-26): DASH and STANCE drop see-through alpha (0.5 / 0.6) for the same solid treatment as COUNTER/STRIKE/VIRTUE: alpha 1, dim face (DASH 0x2f4a3e, STANCE 0x34405a), stroke 0.35, label #d8d2c8 (6.44:1, 6.89:1). A missed Counter's 0.5 s lockout now also draws a refill ring around the dim COUNTER face, so it reads as "wait". Decorate's camera clamps the room top to the 60 px bar (was 48), so wall decorations are never under it. The 32 px row-1 top buttons stay out of scope.

## R-PREMIUM-b3: sound files (2026-10-26)
- **Which sounds:** tap = click_001; block = wood impacts; whoosh and dash = the 3 Kenney cloth whooshes (dash adds a quiet 8-bit jump); chest and loot = PIZZI00 / 01 / 07 by rank (loot adds a quiet coin); level up = STEEL00; promotion = STEEL04; insight = powerup2; hit and strike = Kenney impacts. Clank, the Great Counter layer (renamed from "perfect" in code) and every other event stay made in code. Files not listed are not copied; `incoming-art/` is untouched.
- **Loudness:** `tools/audio-sfx/build.mjs` measures each file and sets its gain to hit a per-event target, capped so no file peaks above −1 dBFS. The first targets made files about 13 dB louder than the code sounds, so all targets were lowered. Measured at the speakers (Sound 5, music off): every peak is −7 dBFS or lower, and promotion is the loudest (−27.7 dB RMS). The cloth whooshes get about +12 dB relative to the hits rather than a flat +8 dB; their absolute gain is −1.4 to +3.3 dB because the whole set was trimmed. The 8-bit sounds are light accents (−8 dB gain or less). Numbers: `docs/shots/r-premium-b3/loudness.txt`.
- **Formats and size:** the files ship as they came (.ogg and .wav, no conversion), 348,564 bytes in all.
- **Level up now has a caller (2026-10-31, Jay approved):** the Home levels-gained screen (`HomeScene.renderRun`) calls `sfx.levelUp()` (STEEL00) once per run that gained a level. The gate is `takeLevelUpSound` (`ui/lastRun.ts`, key `dojo.lastRunLevelUp`, remembers the run id at once), so a reopen, tab switch or resize stays quiet and a run with no level gained is silent. The sound fires from the XP fill tween's `onComplete`, so it lands with the bar (measured 0-1 ms after the last bar frame at 667x375 and 844x390), and at once with Reduced motion or when the count-up already ran, since sound is not motion. (QA fix 2026-10-31: it had been on a `delayedCall` of chips + count-up that ignored the fill's `fillMs`, so it played about 600 ms before the bar landed. A scene that closes before the fill ends never calls `onComplete`, so the once-per-run flag is not burned.) It has its own key, not the count-up's, because the count-up key is also set under Reduced motion and would hide the sound. No visual change.
- **Phones:** iOS Safari before 17.4 may not decode .ogg; those sounds then fall back to the code sound, the same as the music today.
## Q-PREM-F11 — KO tap skip and Head home size (2026-10-26)
- A tap on KO Screen 1 (after the 300 ms mash guard) now calls the sim's `skipDown`, which sets `downTicks` to 1, so `playerOut` fires on the next tick and Screen 2 shows at once. Before this, the tap only skipped the client wait, and the sim's 30 down ticks (about 1.75 s) still held Screen 2 back. `skipDown` does nothing in the practice room (`respawnEnemies`) or when the player isn't down.
- The Screen 2 fade stays 260 ms, and 0 with Reduced motion.
- The Head home button is `max(48, min(52, height*0.13))` tall, so it is never under 48 px; it is 48 at 667x320.
## Q-PREM-TRY fix — keep-practicing line (2026-10-26)
- QA found play continues after the retry line (GameScene.ts guideDone -> senseiDone only shows the line; world.ts stepGuide just moves to the next hint), so "Let's rest at the dojo." didn't fit. The 10 lessons now say "Nice work. Let's keep practicing." (Manager's call; no 'try again' wording). lesson-counter-guided unchanged.
- lesson-counter-guided's retry is now "So close! Let's keep practicing." (the guided Counter repeats after it); no lesson says 'try again'.
- lesson-counter-guided's retry now matches the other 10: "Nice work. Let's keep practicing." (all 11 share it); no lesson says 'So close' or 'try again'.

## L-PREMIUM-a2 — locked-ability hints in the Trophy Case (2026-10-26)
- Stance hints wired as written (Content Designer will reword later). Kata cubbies fall back to the stance hint by kata order (stances[n+2], clamped); past the end of any list uses the last hint.
- Trophy Case cubby sheet only; no read-aloud. Hint shows as its own line under "Ask Sensei about this one".
- Hints copied to content/hints/locked-hints.json; the draft stays, and check-locked-hints.py is kept and still reads drafts/.
## B-TUNE-GUIDED — Guided enemy Power ×0.75 (2026-10-26)
- From R-T3-TUNE-3 (#352). DIFFICULTY gets `enemyPowerScale`: Guided 0.75, Standard and Challenge 1.0. Enemy Health is never scaled by the setting.
- Applies in every fight (Tower, practice room, tutorial), on top of the belt scale. Scaled Power rounds to a whole number, at least 1 (a 0-Power enemy stays 0). Disarmed weapon Power scales too.
- The setting is read when a world is made, so a change takes effect from the next run.
- New testing fixture `fixtures/6-orange-typical.json` pins fight stats with an optional feed `testStats` (333 Health / 46 Power / 34 Guard = ARTISTS.typical belt 3), so the Tester plays the sims' numbers. Real feeds never send it.
- Out of scope: Challenge tuning and the belt-3 floor content.
- Golden: only rooted/guided changed (player Health 141 -> 154); every Standard and Challenge value is byte-identical.
## Q-PREM-F11 QA fix — no accidental Home on a mash (2026-10-26)
- QA: mashing through the KO sent the player Home in 7/8 runs (first pointerdown 100–300 ms after Screen 2).
- Screen 2 now ignores every tap (shade and Head home) for 500 ms after it appears (`ARM_MS = 500`), timed on the wall clock with the tap's own `pointer.downTime`, so a tap made inside the window but handled a frame late is still ignored.
- B-TUNE-GUIDED: scaled enemy Power floors at 1 (if it was above 0) on the belt-scale path as well; before, it could round to 0.
## L-PREMIUM-b — Counter hint (2026-10-26)
- A miss is only a counterable hit with no Counter press lately and no dash; Blocks and dashes never count.
- After 2 misses in a battle/boss room the sim emits `counterHint`; the client shows `LESSONS[GUIDE_LESSONS[0]].nudge` as a placed tip (never over HUD, red circles or buttons) and pulses COUNTER; tip fades after 3 s.
- Max 1 per room; off in the tutorial, on Challenge, while Sensei's guide is active, and after 3 Great Counters in the run. Limits in content/settings/counter-hint.json.
- Reduced motion: still gold outline on COUNTER instead of the pulse; tip removed without fade.
- The mash guard turns most mashing hits into Blocks, so a mashing kid rarely sees the tip.

## L-PREMIUM-b QA fix — the tip shows in real play (2026-10-26)
- QA: 0 tips in 1,391 real rooms, because the Mash guard turns unanswered swings into Blocks and only Hits counted; the old tests hid it with perfects=3 / perfectsLeft=99.
- DECIDED (Manager confirmed): a Block made by the Mash guard (no Counter press lately, no Dash) counts as a miss. A real Block from a Counter press, or a Dash, never does.
- missesBeforeHint is 3, per the spec.
- While the tip pulses COUNTER, STRIKE's ring stays blue and still, so COUNTER is the only gold.
## Q-PREM-F11 QA fix — no accidental Home on a mash (2026-10-26)
- QA: mashing through the KO sent the player Home in 7/8 runs (first pointerdown 100–300 ms after Screen 2).
- Screen 2 now ignores every tap (shade and Head home) for 500 ms after it appears (`ARM_MS = 500`), timed on the wall clock with the tap's own `pointer.downTime`, so a tap made inside the window but handled a frame late is still ignored.

### L-PREMIUM-a2 follow-up — kata cubby hint (2026-10-26)
- Kata cubbies now use the shared kata-cubby hint "Learn a kata in class with Sensei!" instead of the stance fallback (stances unlock by their own sign-off since R-STANCE-d2).
- The hint is read from `cubbies.kata-cubby`, which #355 added to the draft. content/hints/locked-hints.json is re-copied from main's draft, so it stays an exact copy (no second copy of the hint), and it picks up #355's reworded stance hints.
## B-MAIN-TRY11 — fix red main after #355 (2026-10-26)
- #355 added lesson-counter-guided to C-STORY-TRY's programmerHandoff (11 lessons), so q-prem-try.test.ts now expects 11 and does not count the guided Counter twice. No content change.

## B-W-ROOMS-TESTS — tests for the white-belt rooms (#359, 2026-10-26)
- White rooms have only swarmers and shields, so: the mixes test checks a white floor has at least 2 mixes using only those (belt 2 keeps the 4-mix check); Old Thumper (brute) is first met at belt 2 in the K12 and old-thumper tests (zippy-zoom and captain-clank stay at belt 1); the p-menu2 golden is re-captured, with only white, white3 and rooted runs moving (capturing without the w- rooms gives the old file exactly). No game stat changes.

## B-BRIDGE-GOLDENS — golden after the bridge swarmer move (#361, 2026-10-26)
- The p-menu2 golden is re-captured because one Narrow Bridge swarmer (white and belt rooms) moved from (17,4) to (17,3). Only the 5 runs that visit the bridge change, from the bridge room on (the white run 1 bridge room goes 224 -> 251 ticks, A -> S); the bot keeps playing on after a different fight, so later rooms in those runs differ too. Moving the swarmer back gives the old file exactly. No stat or content changes.
- Correction (R-B1-RAMP-2): #361 changed 8 run entries in the golden, not 5: white/new and white/oldSave run 1, white3/new and white3/oldSave run 1, yellow/new and yellow/oldSave run 1, and yellow/new and yellow/oldSave run 2.

## R-B1-RAMP-2 — white belt room copies stay in step with their originals (2026-10-26)
- No new content field: a copy is found by its `w-` prefix (`baseRoomId`). Room art comes from the tiles plus the belt's art pack and the Monster Journal goes by enemy, so neither needed a change.
- `?room=<original>` at white belt now opens the belt's own copy (`beltRoomId`, client only), so old test links keep working.
- A pin test checks all 15 copies keep their original's layout, doors, chest, shrine and kind. The only text allowed to differ: w-brute-and-swarm's name and mix, and w-stone-garden's mix.

## Q-DOOR-LABELS — door labels stay on screen; unknown ?room= warns (2026-10-27)
- Each frame, after the boss slide, a door label's X is clamped so the whole label sits at least 8 px inside the camera view (`clampLabelX`, `DOOR_LABEL_SIDE_PX`). A label for a door that is off screen sits pinned at the nearest edge.
- An unknown `?room=` id keeps the random-room fallback but logs a console warning (`testRoom`). Nothing shows on screen, because only testers use `?room=`.
## R-CHALLENGE P1 — 10-tick wind-up floor on Challenge (2026-10-27)
- The 10-tick minimum (`MIN_WINDUP_TICKS` in config.ts, also used by the enemy loader) now applies after the Challenge formula too, in `telegraphTicks`. Only the swarmer jab and spark-sprite dart change (9 -> 10 ticks on Challenge). Guided and Standard use the exact old formula (tested on every attack).
- Elites keep their own minimum code (`eliteWindup`); a test checks every elite Challenge wind-up is still at least 10.
- The p-menu2 golden is re-captured: only `rooted.challenge` moves (perfects 6 -> 7, blocks 2 -> 4, health 146 -> 191) because that room's swarmer jabs are 1 tick longer. Every Guided and Standard value is unchanged. The R-BAL-12 bands test stays green.

## R-CHALLENGE P2 — enemy `challenge` blocks: loader, one switch, patterns, followUp (2026-10-27)
- Enemy files may have an optional `challenge` block (`fromBelt`, `fromRoom`, `attacks`, `pattern`, `phases`). The loader checks: `fromBelt` is a real belt number from `CHALLENGE_FROM_TIER` (4) to 10, so a pattern is never unreachable; pattern and phase names exist; new attacks have strength ≤ 1 and a Challenge wind-up of at least 14 ticks; `followUp.strength` ≤ 1 and `followUp.gapTicks` ≥ the attack's recover. Enemies without a block get no new field.
- One switch: `challengeDef` (enemy.ts), called where createWorld resolves each enemy type, so summons and splits follow too. It returns the def unchanged unless the difficulty is Challenge and the room's belt and room number (`challengeAt`, set by createRunWorld; null on tutorial floors and missing in practice rooms) reach the block's gate. Then the extra attacks are appended, `pattern` is set, and a boss's Challenge `phases` replace its normal phases.
- `nextAttackIndex` follows `pattern` like boss phases. A `followUp` attack hits, waits `gapTicks`, then winds up a second hit with its own full tell at `followUp.strength`; a stagger or winded break starts it over. The second wind-up starts right after the gap (it is the same move), without waiting for the room's attacker cap. `landing` is stored for P4's tells only.
- `CHALLENGE_FROM_TIER` is added to config.ts with the exact text from #367, so the two merge cleanly.

## R-CHALLENGE P3 — pattern attacks on screen, one at a time, no lane over a red circle (2026-10-27)
- `SIM_VIEW` (config.ts) = 9 x 6.75 tiles, top strip 1.1: the smallest view of every supported size, width and height taken separately. View width is 6.75 x w / h: 667x375 12.0, 667x320 14.07, 844x390 14.6, 932x430 14.6, 1024x768 9.0, 800x290 18.6; height is 6.75 at every size. The client camera math now lives in apps/client/src/game/cameraView.ts (no Phaser), GameScene.layout uses it, and a test checks SIM_VIEW against it plus that the sim view sits inside the client view at every size (a smaller clamped box always nests in a bigger one).
- On Challenge, a pattern attack (a `challenge.attacks` entry, or a two-part attack's 2nd hit) starts only if the enemy's body and the whole danger area are inside every player's view (centred on the player, clamped at the room edges like the camera). A dash-only lane counts its full length, from the enemy to the far end, as wide as its area. If not: that swing is the first normal attack in its list and the pattern resumes after it; with no normal attack it walks closer. A 2nd hit that would start off screen is dropped.
- Only one pattern wind-up at a time room-wide. While a two-part attack is waiting for, winding up, or landing its 2nd hit, no other enemy starts any attack. The 2nd hit keeps its own full tell.
- `noOverlapWithRedCircle` is loaded (Hearth Cook lane in `attacks`, Rolling Pin roll from its `dashOnlyAttack` notes block). On Challenge only, a flagged dash lane doesn't start while another enemy's red (counterable) circle covers the player.
- Guided and Standard are unchanged; the golden file is byte-identical (no Challenge golden row moved).

## R-CHALLENGE P5 — the balance bot answers Challenge patterns (2026-10-27)

- **Landing circles:** a typical (newer) bot steps out of a `landing` attack's circle when it can clear the edge with its reaction time to spare; otherwise it Counters as before. A sharp (careful) bot always Counters. Measured over belts 4/6/8/10 x 60 seeds on the samples, stepping out costs less Health than always Countering (test).
- **Double hits:** typical and sharp bots don't Strike while an enemy's second hit is pending (`followUpStage === 1`), so Counter is ready; the second wind-up is planned like any other. Punishing the winded state after is left for C1.
- **Kid and novice play are unchanged.** All changes key on Challenge-only attack fields, so Guided and Standard runs are byte-equal with the samples on and off (test), and the golden is byte-identical.
- **Samples are test-only** (`packages/sim/test/balance/sample-patterns.ts`), shaped like plan rows C1-C5 with placeholder numbers. C13's belt-dependent fromRoom isn't modelled (one block per enemy; fromRoom 2, Floor Keeper 1). No band target is set; the table (`BALANCE=1`, run with `BALANCE=1 npx vitest run test/r-challenge-p5.test.ts --silent=false`) is for reading, labelled "sample patterns, not C1".
## Q-DOOR-LABELS-2 — door label side clamp runs after the camera moves (2026-10-27)
- The side clamp moved out of `update()` into the camera's `FOLLOW_UPDATE` event (`clampDoorLabels`). Phaser sets `worldView` in `preRender` after `update()`, so the old clamp used last frame's view and a label could sit 2.5 px from the edge for 1-2 frames when a scroll started. The listener is removed on scene shutdown.
- The top (Y) clamp stays in `update()`: the camera does not scroll far enough vertically in current rooms to show the same lag. Possible follow-up if a tall room shows it.
## R-CHALLENGE P6 — Challenge difficulty unlocks at the 4th belt (2026-10-27)
- core-design §13: Challenge can be picked from the 4th belt (`CHALLENGE_FROM_TIER = 4`). Only the difficulty is gated; Challenge rooms still appear at every belt. There is no Sensei unlock line.
- A Challenge pick saved below the 4th belt plays as Standard but stays stored, so it comes back at the 4th belt (`activeDifficulty`). Settings, the Home line and the Bests grades all use the active difficulty, so a child never sees Challenge selected while playing Standard.
- Below the 4th belt the Challenge card is dimmed (alpha 0.7, contrast 5.6:1 or better), shows 🔒 and "Unlocks at your 4th belt." (content/settings/difficulty.json `locked.challenge`), and does nothing when tapped.
- A `?difficulty=challenge` test link still wins at any belt, so the sims and goldens don't change.

## R-CHALLENGE P4 — pattern tells and first-sight Sensei lines (2026-10-27)
- "First time" is per enemy + attack (`floor-keeper:shockwave`), stored in the save as `patternsSeen` (an old save reads as none seen).
- The Floor Keeper's phase line is skipped if its shockwave line already played that fight.
- `tell` text is designer-only (not shown in game). Existing art and sounds only: whoosh on a lane wind-up, clank on the double slam.
- Reduced motion keeps every lane and circle; only the lane's sliding stripes stop.
- Sensei's guided Counter ("COUNTER!" + pulsing button) now only picks a counterable warning; before, it could pick a dash-only lane (incl. the rolling pin and hearth cook) — a real bug, test added.
## Q-SWARM-JAB — swarmer jab wind-up on Challenge (2026-10-27)
- P1's floor (`telegraphTicks`, MIN_WINDUP_TICKS = 10) already gives the 12-tick swarmer jab 10 ticks on Challenge (it was 9), C1's swarmer content included. No game-logic change.
- Guard: the elites loader now refuses `minWindupTicks` under MIN_WINDUP_TICKS, so an elites.json edit can't push an elite wind-up under half a second.
## Q-FAIR-EDGE — two Challenge fairness edges (2026-10-27)
- The pattern "on screen" check now counts downed players (only players who are out are skipped). Before, with every player down the check passed vacuously, so a 2nd hit could start off screen.
- The lane/red-circle rule now runs both ways: a counterable (red circle) attack doesn't start where another enemy's flagged dash lane (`noOverlapWithRedCircle`, uncounterable) winding up covers the player (lane from the enemy to its landing point, area + half a body). The step order inside a tick no longer matters. Challenge only; Guided and Standard unchanged.
## Q-LOCK-CARD — the locked Challenge card answers a tap (2026-10-27)
- The locked card is solid (no `setAlpha(0.7)`): fill `#1d1a26`, name `#a39bb0` (6.4:1), line `#c9b98f` (8.8:1). It no longer shows the room through it at 667x320.
- A tap on the locked card plays the existing `sfx.place(false)` (no new sound or art), pulses the unlock line (scale 1.08, 120 ms, yoyo) and shakes the card ±4 px, 3 cycles in 250 ms. With reduced motion on there is no shake; the sound and pulse stay. The card returns to its stored base x, so fast repeat taps don't drift. The tap never picks Challenge or saves.
- The locked line may hold `{belt}`, filled with the school-data belt name at `CHALLENGE_FROM_TIER` (`lockedLine` in `apps/client/src/ui/lockCard.ts`). Text without `{belt}` shows unchanged, so this works with today's text and with C-LOCK-WORDS. Supersedes the "dimmed, alpha 0.7" note in R-CHALLENGE P6.

- R-CHALLENGE P4 banner fix: the Sensei banner is placed no higher than the bottom of the top bar (room/wave label, timer, boss bar) + 6px, so at 667x375 it cannot cover the top bar during wind-ups. Shot: docs/shots/r-challenge-p4/667x375-windup-shockwave.png.

- R-CHALLENGE P4 QA: one floor for every Sensei line, `senseiHomeY(senseiTop, topBarBottom) = max(senseiTop, topBarBottom + 6)` (apps/client/src/ui/senseiPlace.ts). The top bar includes the health and Focus bars (bottom y 51), the room/wave label, the timer and the boss bar.
- Stale COUNTER! root cause: when the guided enemy's wind-up ended without a swing (staggered, hit out of it, beaten), `stepGuide` set `guide.enemyId = null` with no event, so the client's "COUNTER!" banner and Counter pulse (only cleared by guideDone) stayed up over the next wind-up, e.g. the rolling pin's dash-only roll. Now the sim pushes `guideCancel` and the client clears that cue; the client also clears it when a non-counterable wind-up starts while no guided wind-up is live.
- `?force=<attack>` (e.g. `?force=wide-bonk`) is a test link only (apps/client/src/game/forceAttack.ts): in Practice it swaps the brute for the attack's owner at Challenge with a one-attack pattern; on a run it cuts that enemy's Challenge pattern to the attack. Without the flag nothing changes.
## Q-BOW-OVER-MENU — the bow waits for menus to close (2026-10-27)
- Manager's pick: "wait until the menu closes". In the Home Dojo, a due bow is held while `mode !== 'play'` (menu, decorate, arriving) or any arrival card is open (`cardsOpen`), and polled in `update`. It shows as soon as all are closed, exactly once per scene start (`bowShown`, reset in `create`). The bow itself (prompt, tap, `playBow`, `setBowDue(false)`, `arrive`) is unchanged.
- Repro (3-yellow): with the arrival "Your Home Dojo" card up, a due bow drew on top of it (depth 80 over 70) and the next card then queued behind it. The Tower floor bow (GameScene `askForBow`) already runs before any menu can open and sets `menuOpen`, so it is not gated.
## R-CHALLENGE P7 — the balance table reads the real C1 content (2026-10-27)
- `test/balance/sample-patterns.ts` is deleted; the P5 tests and the BALANCE=1 table run on `testContent()` (content/enemies with the C1 blocks). The "off" side of the byte-equal checks is a copy with every `challenge` block stripped.
- Target = the §4b "L+B (recommended)" Challenge win % row (belts 4-10, 40 seeds), in `test/balance/challenge-targets.ts`. A cell more than 5 points off prints a `WARN` line; it does not fail the test (T1 grades at 100 seeds). Supersedes the "Samples are test-only" note in P5.

- Q-SHAKE-CENTER: the shake is driven by `lockShakeOffset(t) = px * sin(2*pi*cycles*t)` from a counter tween, not a yoyo tween to +px (which only moved right). A sine is exactly symmetric and 0 at both ends; onComplete/onStop still snap x back to rest.
- Q-P7-SEEDS: the BALANCE=1 table uses `BALANCE_SEEDS = 100` (matches T1 grading); at 40 seeds kid cells swung enough to raise false WARNs. Targets and the 5-point tolerance are unchanged. Costs ~70s only when BALANCE=1.

Follow-up after QA (#381 FAIL): the arrival sequence is gated with its own `arriving` flag, set and cleared by arrive(), instead of being inferred from the scene mode or cardsOpen. Root cause: the gate read 'arrival open' from `mode !== 'play' || cardsOpen > 0`. The "Welcome home" splash is a Celebrations overlay, not a card(), so cardsOpen stays 0, and arrive() never set the mode itself (it trusted tryBow to have set 'arriving'). So when arrive() ran with the mode at 'play', nothing marked the arrival as open, and the bow drew under the splash's input layer, where taps couldn't reach it. Also, the once-per-scene bowShown latch meant a bow that came due after the first bow could never show at all. A bow held through the arrival shows once after the last arrival step and only bows (the arrival steps don't replay).

## Q-STANCE-BANNER: action buttons are a hard keep-out for Sensei's banner (2026-10-27)
The banner's placement is one pure rule (`ui/senseiPlace.ts`, `pickBannerSpot`). Order: clear of everything → clear of hero + buttons → shrink to 20px and retry → over the arena (still clear of buttons). Covering the hero is acceptable as a last resort; covering a control the player may need during the 2.2 s is not.

## Q-VIRTUE-BANNER: all Sensei banners use the one placement rule (2026-10-27)
`placeSensei` always finishes in `placeOffPlayers` (pickBannerSpot + buttonKeepOut), not only for "steps back" banners. The Counter tip and the twist banner use the same helper. If a tall line has no clear spot, it narrows (taller, thinner) before it may go over the arena; it never goes over an action button.

## Q-TIP-BANNER: the Counter tip yields to a showing Sensei banner (2026-10-27)
The banner owns the floor (top bar bottom + 6); the tip is the secondary element. `placeCounterTip` adds the banner's box (+6px) to its hard keep-outs (with the buttons, HUD and circles) via `tipSpot`. Heroes are a soft keep-out: if the hard ones leave no spot, the tip may sit over a hero instead of hiding, so a lesson tip is never lost. Covering a button or the banner is never allowed. The tip re-places every frame, so no ordering logic is needed.

## R-INSIGHT-BAL-a: Insight card numbers and three rule tweaks (2026-10-27)
Numbers from `drafts/planning/R-INSIGHT-BAL.md` 4a, in `content/insights/insights.json`: Ripple Counter 1.2, Iron Skin 1.2, Wind Step 0.3 every 5 combo hits for 2 s (the Manager's call, #390 4f; the first tune was every 7 hits for 3 s), Double Strike 0.2 (the Manager's call; 0.25 gave a held spread of 12), Quick Hands 0.2, Rally 0.75. Press the Advantage (0.3) and Heavy Hands (0.2) are unchanged. Card text is the Content Designer's (`drafts/content/insights/R-INSIGHT-BAL-c.json`).
- **Rule A (Wind Step):** while the Wind Step burst is on, basic attacks also speed up by half the burst's bonus (`comboSpeedBonus / 2`, so +15% at 0.3), inside the existing 0.6 attack-speed cap.
- **Rule B (Press the Advantage):** the bonus also applies to winded and recovering enemies, not only staggered ones.
- **Rule C (Shield Breaker):** breaking a shield gives Focus. The amount is card data (`focusOnBreak: 7` on the `shieldBreaker` effect), not a config constant, so the text and number stay in content.
- **Virtue placeholders** (Calm Breath, Steady Start) are after-beta: not added to the pool. The pool stays 9 cards.
- **Golden fixture regenerated** (Manager approved). The golden bot picks Insights at random, so any card number or rule change moves the run. Even the three code rules alone (with main's JSON) change it.
- **Masher floor test now runs at 600 seeds (Manager, #390 4f).** `b-t3-tune-2-boss-levers` read 55% at its 60 seeds, but only 31 to 40 of 60 runs reach the boss, so that sample has an SD of about 5 points and was luck. Only the masher check moved to 600 seeds (`MASHER_N`); the floor stays 75% and the other checks stay at 60 seeds. Result with these changes: 348/437 = 79.6% (the Researcher measured the same).
- **P5 step-out test is now paired (Manager, #390 4f).** `r-challenge-p5` no longer compares total Health, which is dominated by noise. It compares landing-circle damage only, step-out vs Counter, on the first landing swing of the same seed (runs are identical until the bot's first step-out decision, so it is the same moment). Belts 4/6/8/10, seeds 501-680, newer bot, Challenge: 477 matched swings, step-out 1933 vs Counter 2278 (-15.1%), lower in 22 pairs, higher in 4 (z about 3.4). Asserts: more than 300 pairs, step-out under 90% of Counter, lower at least 3x as often as higher, lower in at least 15. Test cost about 20 s. `bot.ts` got additive `landingDamage`/`landingFirst` in `RoomStats`.
- **Golden fixture regenerated again** after the Wind Step change (the golden bot picks Insights at random).
- **Full suite:** 108 files passed, 2 skipped; 1148 tests passed, 4 skipped; about 31 s.
- **Open, for the Manager (recommended follow-up):** the step-out saving is modest because the bot re-decides every tick and stalls about 0.78 tiles from the circle centre (catch radius 0.81) near impact, then Counters too late. Committing to the step-out once started cut landing damage by 44%, 44% and 18% on three 60-seed blocks (47 pairs lower, 2 higher). Not adopted here: it would move every Challenge newer-bot measurement, including the Researcher's tune tables.

## R-INSIGHT-BAL-b: Insight budget tests, two layers (2026-10-27)
- **Layer 1** (`packages/sim/test/insight-budget.test.ts`, normal suite, no sim): one CAPS table with the proven number per card (max for amounts and seconds, min for Wind Step's "every N hits"); card ids unique and CAPS and content list the same cards; every family has 2+ cards except Virtue (the test fails when Virtue reaches 2, to retire the exception); the sum of all card attack speed stays under the 0.6 cap and disarm under 0.9. A card may be weaker than its cap; to make one stronger, run layer 2 and update the table.
- **Layer 2** (`packages/sim/test/balance/insight-budget.test.ts`, `BALANCE=1` like the other balance tables): B1-B7 and B10 fail by name and print a table (card or combo, bot, PE, limit); B9 is printed only. Helpers are in `balance/insight-sim.ts`.
- **The pick seam is a plain parameter, not a flag:** `playRoom(..., pickInsight?: InsightPicker)` in `balance/bot.ts` (test code only). Default is the old random pick, so every existing table is unchanged. No `HOOKS` object, no env flags in committed code (the draft sim used both).
- **Seeds are the counts the spec tables were measured with** (kid 100 singles / 60 pairs / 40 ruler; newer and careful 50 / 30 / 20; routes 150; pool 150 per belt; pickers 60), starting at seed 1000. Seeds 1..N are not equivalent: they read 40-45% at belts 7-10 where 1000+ reads 52-57%. Runs are seeded, so the numbers repeat. More seeds do not make a line fairer, they read another sample; the ruler's noise matters most because it is divided into every PE.
- **Skilled-bot floors are not tested** (B1 floor is the kid only); the reasons are in the test file's header.
- Not built here: layer 3 (kata powers) is R-INSIGHT-BAL-e.
- **Insight picker cards follow their text (QA fail on #389, layout only).** Root cause: `InsightPicker` drew every card a fixed 175 px (`min(height*0.55, 175)`), so any text past 2-3 lines spilled out. Now the text is laid out first and the row height is the tallest text bottom + 8 px (+2 for the 3 px border's inner edge), the same for all cards (`ui/insightLayout.ts` `fitCards`). If that would run off the screen, the body steps 16 to 15 to 14 px (TYPE.body, the smallest readable size). At 667x375 and 844x390 the cards are 180 to 184 px high and fit at 16 px, so no step-down is used. Card copy is unchanged by this fix. The card text itself now matches #391 (Press the Advantage "Hit dizzy or winded enemies 30% harder.", Rally "Below half health? Focus fills 75% faster!"); Wind Step's text matched the 5-hit / 2 s tune already.

## A4-DOJO-i: the Action Zone inside room (2026-10-30)
PR 1 of 2. The inside room only; the outside is A4-DOJO-ii.
- **Art pack `dojo-az-inside` at 0.6** (Jay OK'd the art; day art only): the 22 inside sprites from `incoming-art/action-zone-dojo/sprites/static.json`, 25 frames on 2 pages, 0.8 MB. `approved.json` lists them in `only`. The outside pack waits for PR 2.
- **The room file is data, the room is built from it.** `content/dojo/action-zone/inside-room.json` is an unchanged copy of the incoming file. `loadInsideRoom` (`packages/sim/src/actionZone.ts`) checks it (grid, spawn, exit, approach tiles, facing, at least one interactable) and builds a normal sim Room from the grid (kind `rest`, no enemies, a door at the exit). A bad file throws `ActionZoneError`, so a broken edit fails the test, not the game. Walking, tap routes and blockers are the sim's own.
- **Interactables are walk-up spots with no behaviour.** The loader gives each one a rect and an approach tile; the tests prove the spawn reaches every approach tile and the exit, and that no blocker can be entered by tap or stick from any side.
- **Depth.** Floor, walls, props, then the hero and standing sprites sorted by `sortRow` (hero by his y), then the foreground pieces, then the front wall on top. A seat-back or bag-top piece is shown only while the hero's y is less than its `sortRow`. The front wall is always on top.
- **Honest note on the seat backs.** The seats-back piece spans x 9.8 to 17.2, which is inside the seats blocker, so a hero who can only stand on open floor never needs it. The rule is built and tested at hook-placed positions; the bag tops and the front wall do matter and are proven in the shots.
- **Camera helper not lifted.** The Home Dojo's clamp is tied to decorate mode and the title bar, so lifting it would add parameters, not remove code. The inside scene has its own 6-line clamp from the room picture's bounds (same zoom: 6.5 rows tall).
- **PLACEHOLDER way in.** An "Action Zone" button in the Home Dojo (play mode, under the Scroll button) goes straight to the inside. It is marked PLACEHOLDER in the code; PR 2 removes it and routes the way in through the outside. The exit door returns to the Home Dojo. Nothing else in the Home Dojo changed.
- **Music continues.** `content/settings/audio.json` maps scene `ActionZoneInside` to the temple track, like the Home Dojo.
- **Reduced motion:** the fade in and out is skipped (0 ms) when it is on; the setting is read each time, not cached.

## A4-DOJO-ii: outside, town and the way in (2026-10-30)
PR 2 of 2. The Home Dojo, the town, the outside and the inside are joined. Day art only.
- **Art imported (Jay OK'd, Manager named the pieces):** pack `dojo-az-outside` (the approved day outside layers; no dusk) and pack `dojo-az-town` (one still picture, the Jay-confirmed "town with the new dojo" preview). `import_art.py` got an optional `onlyLayers` filter so a pack can take named layers only; nothing else in the importer changed.
- **Town scope was not clear, so the town is a picture and not a walkable map.** There is no game-ready layered town art. The town scene shows the still picture with one tappable area (the dojo roof and door) and a Home button. The tap area (`tapRect` in `town.json`) is my own measurement of the picture, not the artist's. Nothing else in the town is tappable. Missing for a real town: layered walkable art, destinations for the other buildings, dusk art.
- **The room file is data.** `content/dojo/action-zone/outside-room.json` (the artist's file, 14x9 grid) plus my changes, all listed here: (1) rows 0-5 are closed, as the artist drew them; (2) four cells carved open at (6,6), (7,6), (6,7), (7,7), the walkway to the doors, because the artist's grid left the doors unreachable; (3) row 8 open across the whole width so both lawns connect; (4) one extra blocker, `tree-3`; (5) the shrub stays passable (the hero on the doorstep draws partly behind it); (6) two exits at the ends of row 8, both to the town. `loadOutsideRoom` and `loadTown` (`packages/sim/src/actionZone.ts`) check the files and throw `ActionZoneError` when they are broken.
- **The way in.** Home Dojo -> a plain blue "Town" button (play mode, replaces the PLACEHOLDER green "Action Zone" button) -> town -> tap the dojo -> outside -> walk to the doors or tap them (the tap walks to the doorstep, tile 7.0, 6.6, then goes in) -> inside. The inside bottom door -> outside, standing on the doorstep (the doorstep does not bounce him back in: a door or exit rect fires only after the hero has been outside it). Walking off either end of the bottom walk -> the town. The town's Home button -> the Home Dojo. The Home Dojo has no designed door to the town yet; that is a DECIDE.
- **Exit cue** (gold glow and chevron, no text, `ui/exitCue.ts`): at the inside door and at both ends of the outside walk. It pulses only when reduced motion is off. The left cue sits in the stick's rest zone (the left 40% of the screen, below 40% of its height), so a thumb there is a stick, which walks left anyway.
- **Shared walking scene.** `WalkScene` is the base for `InsideScene` and `OutsideScene` (camera clamp, tap-to-walk, fades, hero and sprite sorting, arming of doors). It was written once here instead of copying the inside scene; `InsideScene` behaves as in A4-DOJO-i, plus the cue.
- **Depth outside:** ground, trees behind the building (sortRow below 6), building, phone and address bars (blank art; no real numbers in the repo), cues, then props and the hero sorted by y.
- **Music:** `ActionZoneOutside` and `ActionZoneTown` use the temple track (`audio.json`).
- **Reduced motion:** all fades are 0 ms, the cues and the town cue do not move.
- **Kept as the Manager said:** the red bag, flag stripes and handprints (branded red), and the front-wall and seat-back pieces.

## A4-DOJO-hotfix: choppy dojo, stuck Sensei line, fresh load (2026-10-31)
Three of Jay's phone bugs in one PR. Found by reproducing each on a dev server and bisecting against `95a486c4` (before #394), `18602a4e` (#394, A4-DOJO-i) and `dae15ae` (#395, A4-DOJO-ii).
- **1. Choppy dojo: Phaser `Graphics` objects are re-drawn on the CPU every frame.** Each plain button (`ui/button.ts`) was a fill/stroke Graphics plus a shine Graphics; the Home Dojo has 12, and they were 1.0 of 1.2 ms of its frame. This came from P-MENU-a (Oct 25), not #394/#395; #394 added one more button. The Action Zone exit cues (gold glow and chevron, #395) were about half of the inside, outside and town frames. Fix: draw each shape once into a texture (`generateTexture`, 4x for the cues, the screen's pixel ratio for buttons) and show it as an Image. Looks, sizes, taps and the cue tweens are unchanged (before/after shots differ by 0.13% of pixels). Also: the hero sort and the hide/show loop in the walking scenes now run only when the hero's row or a piece's state changes. Ruled out: listener leaks on re-entering a scene (none), and the 0.6 art (not a cost).
- **Honest note on the numbers.** Frame cost is measured as time to `gl.finish()` per frame in headless Chrome on software GL, so it shows the CPU/vertex share, not a real iPhone GPU. Other scenes (Create, Game HUD) still use Graphics; not touched here.
- **2. Stuck "Three great counters! Your timing can fly on its own now." line.** It is not the Counter hint. It is the B-MASHER-2 step-back banner (`senseiStepsBack`, from dd42175a, Oct 25), which showed the line and had no timer to remove it. It was there before #394/#395. The Counter hint is off on the tutorial and Challenge and does fade on its own (about 3 s); I checked it. Fix: the banner now holds `MASH_GUARD_HOLD_MS` (2.2 s, the same as before) and is then destroyed.
- **DECIDE (Manager or Jay):** the step-back line is once per run on any difficulty, so it can show on Challenge. Left as is; gating it on Challenge is one line.
- **3. Fresh load goes to the practice room: not reproduced.** Fresh load runs Title -> Create (first) -> tutorial. Title is still the first scene registered; #394 and #395 only appended scenes. The only way to the practice room (`Game` with no run) is the `?room=training` test link (empty in a beta build). Most likely cause: a link or bookmark with that parameter. No code change; tests pin the routing so a change would fail. If it happens on a clean URL, I need the exact link and the save state.

## A4-DOJO-ii-fix: outside and inside walking fixes (2026-10-31)
Jay's phone notes on the Action Zone walk (#395), one PR. The baked-texture cues from the hotfix (#397) are kept: the stronger glow is baked too (`ui/exitCue.ts`, `BAKE` 4), so no Graphics work was added per frame.
- **Exits line up with their glow.** The glow and the exit it marks now come from one place, `content/dojo/action-zone/outside-room.json` (`exits[].cue`: centre and size in tiles). The loader refuses a file whose cue centre is outside its exit rectangle, so a tap on the middle of a glow always leaves. Each exit rectangle now starts 0.1 tile inside the glow's inner edge. Before, the glow was hard-coded in `OutsideScene` at x 0.75 / 13.25 while the exit was only 0.6 wide at each end (x 0 to 0.6 and 13.4 to 14), so most of the glow was not the exit.
- **Both glows are on screen on a 667 x 375 phone** (view 11.56 tiles wide, hero at x 7): the glows now sit at x 1.9 and 12.1, so each is whole in the view (before, the left one at 0.75 was partly cut off on the narrowest phone view). A test pins this.
- **A press on a glow is a tap, even under the stick.** The left glow was inside the stick's area, so a press there started the stick and never walked. `WalkScene` passes `isTapTarget` to `TouchControls`, and `OutsideScene` says yes inside either glow.
- **Doorstep: standing there does nothing.** Coming out of the dojo you stand on the doorstep (inside `enterRect`). Entering again needs a push up or a tap on the doors (`wantsThrough` in `@dojo/sim`, used by `OutsideScene.onInput`). Before, the step's `entered` fired only on arriving, which felt like a dead door for a tap and a bounce for some pushes.
- **Inside spawn further back.** The hero now walks in to (13, 16), two tiles in front of the door mat (row 18). It was (13, 17), 0.4 tile above the exit, so a tiny push left. The exit stays where it was.
- **Collision gaps tighter.** The first row of the front yard (row 7) had closed cells where nothing is drawn: the front-left tree's trunk base is at y 7.0, so the cell (0,7) below it is open now, and the hero is no longer stopped by an invisible wall at (4,7) and (9,7) (carved open, next to the beds). `tree-3` loses cell (0,7) and its rect is (…, 7.0). `walkableCells` 28 -> 31. The artist's other blockers are unchanged.
- **PLACEHOLDER:** the Home Dojo "Town" button (`DojoScene`) is still a temporary way to the town, and is marked `PLACEHOLDER` in the code, as before. A later step puts a real door in the Home Dojo. A test pins the marker.
- **Stronger glow.** Same size, warmer: fill alpha 0.22 -> 0.42, a pale pad in the middle, a heavy edge (5 px, 0.95), pulse low point 0.55 -> 0.7. It was faint on the pale lobby floor.
- **DECIDE (Jay):** is the stronger glow right against the street picture, or too loud? It is three numbers in `ui/exitCue.ts`; the glow's place and size are two numbers per exit in the room file.

## Q-PREMIUM-2-fix: the 16 "routine" findings from the premium pass (2026-10-31)
One PR for the findings tagged routine in `drafts/qa/premium-pass.md` (#216). The 12 "needs Jay" findings (H1, H3, H4, H5, M1, M2, M4, M5, M8, M11, L1, L6) are untouched. No new art, no story text, no new dependencies; every new line is plain interface wording.
- **H2 / M6 (Board):** at 667x320 the Last run tab puts Found and New for you right under the banner, above the chips, so the Again! button no longer cuts them; the Trophy Case is a slimmer ribbon; kata cards show a star placeholder (a plain shape, no art import) instead of an empty circle; slot cards are fitted to their text. PARTIAL: the Gear tab at 320 (only some cards visible without scrolling) and bigger belt icons were not redesigned.
- **M3 (Create):** colours in two rows of five, swatch up to 40 px, whole cell taps, Done / Back under the character. At 667x320 the swatches are about 24 px (partial).
- **M7 / M12 (fight HUD):** a door's name shows only once no enemy is left and never under a loot or decoration note; the Wave counter goes away with the last enemy; the hero's floating numbers start 46 px above the head, step left, middle, right, and at most 3 show at once.
- **M9 / M10 / L2 (Dojo):** room labels 14 px, panel backdrops 0.97 (nearly solid), the hint is a pill, Erase progress sits 20 px off the screen edge; the grown-ups play-time help (`content/settings/play-time.json`) is shorter to fit its panel (same meaning). The hero standing on the Tower mat is a layout matter and was not changed.
- **L3 (Board wording):** "Level N of CAP" (at the cap: "Top level! The Gate shows how to go higher."), "Classes done" instead of "Time in rank" (value "15 of 24"), the Seal says "Lit when Sensei says you're ready.", and long lesson names show "Defense" for "Self-Defense". Lesson names themselves are school data and are unchanged.
- **L4 (Town and doors):** the Home button label is 18 px and the door arrow has a floor size (22 px inside) and a short size pulse; the pulse is off with reduced motion. PARTIAL: the Town building names are baked into the art and cannot grow without new art.
- **L5 (tutorial):** Sensei's box docks at the bottom first so walking space stays open; Got it is 24/28 px; the Room counter is hidden on the tutorial floor.
- **L7 (testing screen):** Close is at the top, the backdrop is solid, the profile list scrolls with a drag and ignores taps that were a drag. The right column's detail line still overlaps the next row for "Training Points" (older, left alone).
- **L9 (Journal):** title 16, place and card names 14. SKIPPED: a wider left page (set by the art frame) and a different hint per card (new story text, needs Jay).
- **L10 (Practice room):** title "Practice room" and the line "Try STRIKE, COUNTER and DASH." at the top centre. SKIPPED: the 2 or 3 targets (a content and balance choice; the room's one enemy is unchanged).
- **L11 (Welcome home!):** the card sits over the top of the right panel, nothing dims, so the player card and ENTER THE TOWER stay tappable; a tap on the card dismisses it; it still fades after the same time.
- **L8 (frame time):** investigated, no change. The Board has no per-frame redraw (its animations are tweens that run only when something changes), so there is nothing obvious to trim. The finding's own first step is to confirm the 932x430 Board on a real phone; the box has no GPU.
- **DECIDE (Jay):** are the Practice-room hint wording and the Welcome-home card position right?
