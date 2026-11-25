# Overnight work, Nov 24 2026 (branch `claude/overnight-polish`)

Jay asked for four things that need no decisions from him. All four are done. Nothing a player sees has changed, except that fights load faster and use less memory.

## 1. Download size and loading (CW-4)

- **The whole game is about 235 MB.** Almost all of it (225 MB) is character and monster pictures. Phaser, the game engine, is about 1.2 MB, and the game code another 1 MB.
- **Each screen already loaded only its own pictures**, except for one waste: **every Tower fight loaded every monster in the game.** A White belt fight loaded the Orange belt kitchen monsters and all three forms of the Hearth Cook, which can never appear there: about 13 big picture pages, roughly 20 MB to download and around 200 MB of the phone's graphics memory.
- **Fixed:** a fight now loads only the monsters its belt's floors can bring, including boss helpers and the pieces that split off. Checked in the browser: a White belt fight loads only the White belt monsters, and an Orange belt fight still loads all of its kitchen monsters. The practice room still loads everything, since it can show any monster.
- **Lighter picture compression would save only about 20%** (measured on a sample). That's not worth the risk of blurrier art, so I left it alone.

## 2. Coin balance re-check (GP-6)

The coin numbers in the game are unchanged. The coin floor holds: every run pays at least 60 coins.

The re-check showed something bigger than coins, for Jay to decide. **Since automatic blocking was turned off, beginners and button-mashers lose almost every run:**

| Test player | Easy (Guided) | Standard | Challenge |
|---|---|---|---|
| Typical student | wins every run | wins every run | wins every run |
| Young beginner | wins 55–95% | **wins 0–8%, usually out in room 1** | wins 0% |
| Button-masher | **wins 0–13%** | wins 0% | wins 0% |

(Simulated players, 40–60 runs each, at belts 1–10.)

The young beginner on Standard is the worrying row: everything or nothing, with no middle ground. Whether that's OK depends on which setting young kids start on. **Jay's call.**

## 3. Splitting the biggest files

Three self-contained pieces moved out of the two largest files, with nothing they draw changed. Each was tested and checked in the browser:
- The fight's small effects (sparkles, glows, the "set free" light, the dash trail, the chest charge) → `fx/fightFx.ts`
- The treasure chest prize reveal → `ui/chestReveal.ts`
- The Home Dojo's drawing helpers → `ui/homeDraw.ts`, and its pure layout rules → `ui/homeLayout.ts`, with new behaviour tests

The fight screen went from 4,160 to 3,940 lines, and the Home Dojo screen from 2,914 to 2,728.

**Why I stopped there:** about 36 older tests check the exact words of the code in these two files rather than what the code does, so every move breaks some of them. Also, the open tutorial branch edits the middle of the fight file. Moving that part now would cause merge clashes. The remaining big piece (the 557-line block that plays combat events) is best split after the tutorial branch lands. I checked that tonight's work merges cleanly with that branch.

## 4. Belts 4–10 Tower floors (switched off today)

- **The draft room checker was broken.** It still assumed the seven bosses didn't exist and didn't know about the on/off switch. Fixed: **all 56 rooms pass.**
- **About 16,000 simulated room plays** with every belt switched on: no crashes, no stuck rooms, no runs that never end. Typical players clear a floor in about 2 minutes, and the boss rooms knock out very few of the players who reach them.
- **The real blocker is art:** the seven new bosses (Stone Giant, River Watcher, Ember Knight, Echo Mask, Root Keeper, Storm Herald, Lost Lightbearer) have no pictures yet. Switching a belt on today would crash the fight when its boss room loads. Also, belts 4 and up reuse the Orange belt's kitchen Tower look.
- **What a Green belt sees today** (shared rooms) works. Checked in the browser.

## Things noticed in passing (not changed)

- **Keon's card in the Book still says "Its power arrives in a later update"**, but the Tool Belt already gave Keon its Iron Wall move. A small wording fix for Jay to OK.
- **The tutorial branch (`claude/tutorial-overhaul`) now clashes with `main`** on the Street Smarts lesson files (park, bus stop, home), because the other session's lessons reached `main` with later fixes. Someone has to resolve that before the tutorial branch goes live.
- **A startup error appears in the browser log** ("Framebuffer status: Incomplete Attachment") when the page loads in a hidden window. The game then runs normally. It's probably harmless, but worth watching on phones.
