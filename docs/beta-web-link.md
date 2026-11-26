# Beta web link (B-WEB)

A version of the game a parent can put on the phone's home screen. It then opens like an app: its own icon, full screen, sideways, no browser bars. Built Nov 26, **not published yet** (Jay OKs that).

## What's ready

- **Home screen icon and name:** "Dojo Ascent" with the gold belt-knot picture (the same placeholder as the browser tab icon; waiting on Jay's OK like the other art).
- **Opens full screen and sideways** when started from the home screen. (iPhones can't lock it sideways from a web page, so held upright the game shows "Turn your phone sideways to play", as now.)
- **Keeps playing on a weak or dropped connection.** The game keeps a copy of every file it has already loaded on that phone. With no signal, the game still opens and every screen the child has visited before still works. The newest version is always used when the signal is good, so updates aren't held back.
- **The beta build:** `npm run build:beta` makes the game without the test screens and test links. The live link already builds this way.
- **Its own address (when Jay says go):** `wrangler.beta.jsonc` has the hosting settings for a separate "dojo-ascent-beta" site on Cloudflare. Nothing is set up on Cloudflare yet.

## To publish it (for Jay, when ready)

1. In Cloudflare, open **Workers & Pages** → **Create** → **Import a repository**, pick the Dojo-game repository and name it `dojo-ascent-beta`.
2. Build command: `npm ci && npm run build:beta`. Deploy command: `npx wrangler deploy --config wrangler.beta.jsonc`. Production branch: `main`.
3. Save. Cloudflare gives the address (it ends in `workers.dev`). That's the link parents get.

## Steps for parents

### iPhone or iPad (Safari)

1. Open the link in **Safari** (not another browser app).
2. Tap the **Share** button (the square with an arrow pointing up), at the bottom of the screen or next to the address.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** (top right).
5. Open **Dojo Ascent** from the home screen and turn the phone sideways.

### Android (Chrome)

1. Open the link in **Chrome**.
2. Tap the **three dots** at the top right.
3. Tap **Add to Home screen** (on some phones it says **Install app**).
4. Tap **Install** or **Add**.
5. Open **Dojo Ascent** from the home screen and turn the phone sideways.

### Good to know

- Progress is saved on that phone only. Deleting the icon, or clearing Safari's or Chrome's website data, also deletes the child's progress.
- The game opened from the home screen and the game opened in the browser keep separate saves on iPhones. Pick one and stick with it.
- Open the game once with good signal and visit the dojo and the town, so they work later without signal.
