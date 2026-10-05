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
