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
