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
