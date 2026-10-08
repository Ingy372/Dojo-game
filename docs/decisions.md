# Decisions

A record of choices already made, newest at the bottom, so settled questions aren't re-debated. Read this every session.

## Open questions for Jay

Anything waiting on Jay's answer goes here. When he answers, the answer moves into the log below and the question is removed.

1. **Black belt to 2nd degree.** At Action Zone, black belt is 1st degree. How long does a student usually wait between 1st degree and 2nd degree? (Set to 1 year for now; it only matters for students far in the future.)
2. **The one-character art test.** The Art Director bot (Grok bot) is building one martial artist in Blender (idle, walk, strike, counter). When it arrives, Claude Code puts it in the game on a test branch so Jay can approve the art style on his phone.

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
- **Defeat:** a soft fade and "Ouch! Back to the start.", then the player is back at the room start with full health. Focus and combo reset, and the room's enemies reset too. Nothing is lost.
- **Beaten enemies come back after 4 seconds**, so there's always something to practice on.
- **Game feel lives in the game, not the rules:** the short freeze on impact, screen shake, flashes, sparks, damage numbers and sounds are in `apps/client`. The freeze pauses the game for a split second on this phone only; in co-op later it will become a visual-only freeze so players stay in sync.
- **Sounds are generated in code** with the phone's built-in sound system (no sound files, no new libraries). Sound switches on at the first tap, as phones require.
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
- **Typical time in rank (Jay, 2026-10-07):** white through blue test every 3 months; red to red/black 6 months; red/black to brown 6 months; brown to brown/black 9 months; brown/black to black 1 year. At Action Zone black belt is 1st degree; the wait to 2nd degree is set to 1 year until Jay says otherwise. White to black takes about 4–5 years.
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
- **Bots never change code.** Claude Code is the only one who changes the game.
- **Each bot has its own folder and branch** (`incoming-art/` on `bot-art`, `drafts/content/` on `bot-content`, `drafts/learning/` on `bot-learning`, `drafts/qa/` on `bot-qa`, `drafts/launch/` on `bot-launch`) and delivers through pull requests that Jay merges. Each folder has a README explaining this.
- **Nothing in a bot folder is approved until Jay says so.** Claude Code copies approved files into `assets/` or `content/` only when Jay asks, and never edits files inside the bot folders.
- **The Learning & Engagement Designer's proposals are suggestions,** reviewed by Jay with his Claude chat before anything is built. It also reviews milestone 4's open questions (powers, numbers, black belt degrees), which is the design material milestone 4 is paused for.
- **No art pack is bought.** The Art Director bot makes all art in Blender: low-poly 3D models, rigged and animated (Mixamo allowed), rendered from one fixed top-down three-quarter camera in 8 directions into transparent PNG sprite sheets with a reusable render script. Icons, portraits and scene pictures come from the same models so everything matches. This replaces the pixel-art-pack plan in framework section 13. Details: "Art process" in core-design section 13.
- **Claude Code builds the import step:** a repeatable script that trims, sizes and packs approved renders into texture atlases for Phaser.
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
