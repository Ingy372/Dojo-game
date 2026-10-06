# Decisions

Decisions made during development, newest at the bottom. Read this every session so settled questions aren't re-debated.

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
