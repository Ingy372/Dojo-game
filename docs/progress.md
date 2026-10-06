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
