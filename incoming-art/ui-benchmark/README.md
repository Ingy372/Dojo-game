# UI benchmark: Board paper-and-wood kit (B2), final tab icons (B3), Tower Climb icons (B4). FINAL export

Item from the Manager: **R-BENCHMARK** (plan in `drafts/planning/R-BENCHMARK.md`). Jay approved the samples (Nov 1, 11:21 PM); this folder now holds the **final sprites** for the Programmer. Nothing here touches game code.

## FINAL export for the Programmer (`sprites/`)

Open `sprites/board-ui.json` first. It lists every sprite with `file`, `file2x`, `size` (1x points), `nineSlice` ([top, right, bottom, left] in 1x px, same as `menu2.json`), `visibleRect` and `shadowMargin` (6 pt on every kit piece), `state` and a note. 65 sprites, each as `name.png` (1x) and `name@2x.png`.

| Folder | What |
| --- | --- |
| `sprites/kit/` | Buttons: ENTER (orange), gold, wood, with normal and pressed (wood also disabled). Tabs: normal, pressed, active (raised gold). Paper card. Family ribbons (Rooted blue, Flowing green). Gate seals lit and locked. Sensei's Seal (師) unlit and lit. New dot. Gold level-bar fill. Floor mat. |
| `sprites/kit/ring/` | Progress ring in 25 steps, `ring-00` to `ring-24` (x of 24, so 15 of 24 is `ring-15`). |
| `sprites/tab-icons/` | The four final B3 tab icons (26 pt box). |
| `sprites/climb/` | Tower Climb room icons, 5 rooms x 3 states (`battle`, `treasure`, `rest`, `challenge`, `boss` x `cleared`, `current`, `ahead`). 72 pt art box. |
| `sprites/wall/` | The wood wall, one image at 844 x 390 (scale to cover). |

**9-slice.** Buttons are 3-slice along x only (caps 28 px, height fixed at 44 pt). Tabs 3-slice along x (20 px caps). Ribbons 3-slice along x (14 px left, 24 px right for the notch). Paper card 18 px on all sides. The gold level fill is 3-slice with 6 px caps. `preview/06-nine-slice-proof` re-stretches each one from the exported PNG and the manifest margins so you can see they hold.

**Reused from A-MENU2, not copied:** panel frame, inset well, wood sign (title plaque), level-bar frame and gloss, stat tile, gear and tray tiles and so on. They are listed under `menu2Refs` in the manifest with their `menu2.json` margins.

**Text is never baked in.** Labels, numbers and the tab names are drawn by the game. Label colours are in `tabLayout` in the manifest. The only glyph in a sprite is the 師 on Sensei's Seal.

### Decisions applied (Jay, Nov 1)

- "Door pick" is the **challenge room**. The files are named `challenge-*`.
- Guardian (boss) is **purple**. Active tab is **raised gold**. The **師 seal stays**.
- Final **B3 tab icons** are drawn: tower (Climb), duffel bag (Gear), mitten fist with a gold spark (Abilities), blue gate with a gold lock (Gate). Thick dark outline so they read on the wood tab and the gold tab. No red. `preview/05-b3-tab-icons` shows them large, in place on resting and active tabs, in the 26 and 20 pt tiny test (colour, grey, shape only) and before and after.
- Room mapping: fight = `battle`, chest = `treasure`, shrine = `rest`, door = `challenge`, guardian = `boss`. **`practice` has no icon** (only five were approved).

### Previews (`preview/`, 1x and @2x)

`01` to `03` are the approved samples, redrawn with the final tab icons and the "Challenge" label (the first versions are in `superseded/v1-samples/`). New: `04-export-contact-sheet` (every exported piece), `05-b3-tab-icons`, `06-nine-slice-proof`.

## The three samples (`preview/`, each at 1x and `@2x`)

| File | What it shows |
| --- | --- |
| `01-board-panel-kit` | The kit: 4 tabs (normal, new dot, pressed, active), the three button kinds with pressed and disabled, wood sign, paper card, inset well, panel frame, family ribbons, level bar (empty, part, full), gate seals, progress rings, new dot, palette with hex codes, and the four tabs side by side. |
| `02-board-gate-844x390` | One full Board screen at phone size (844 x 390), Gate tab. This is the "dark to paper" change: wood wall, wood frame, cream paper inside, no navy. |
| `03-climb-icons` | Tower Climb icons on a sample map strip (9 rooms on rising wood steps), the 5 x 3 icon matrix, and the tiny-size test (30 pt colour, grey, shape only). |

## B2: one look for every Board tab

- **Wall:** warm wood planks (mood A, warm dojo wood). Replaces the near-black Board background.
- **Frame:** the A-MENU2 `panel-frame` (wood, brass corners). **Inside:** one cream paper tone, the same on Climb (Last run), Gear, Abilities and Gate. No navy or near-black block bigger than a button is left.
- **Buttons:** ENTER THE TOWER is the **only orange** thing. Gold lacquer is the main action (Climb again). Wood is the second action (Practice room, Dojo). Next step is a paper card, not navy.
- **Tabs:** icon + label, active tab raised and gold, "new" is a small gold dot (no numbers). The tab icons are the final B3 icons.
- **Family colours** (Rooted blue, Flowing green) live only as small ribbons.
- **Red** is used for danger only, and there is no danger on these screens. (Red check: the only hits are a few skin-shadow pixels in the hero sprite.)
- **Sizes:** body text 14 px or more, captions 12 px or more, buttons 44 pt tall (Practice room is drawn 40 pt tall with a 44 pt hit area).
- **Left stage (about 36%):** hero 100 pt tall on a tatami mat with a soft shadow, wood sign for name and belt, level bar with fill and an "x of y" label, then the buttons. The screen title sits to the left of the hero, never above its head.

### Consistent with the G2 Insight picker (later, not done now)

The picker will reuse these pieces as they are: paper card, wood frame, gold and wood buttons, family ribbons (the blue and green top strips become the small ribbons), new dot. Nothing in the kit needs to change for G2.

## B4: Tower Climb icons (Slay the Spire map rules)

Read at tiny size, shape first, colour second, no legend.

| Room | Shape | Colour | Glyph |
| --- | --- | --- | --- |
| Fight | round disc | blue | crossed practice swords |
| Chest | domed box | gold | straps and lock plate |
| Shrine | soft diamond | green | stone lantern (the glow is the lantern flame, inside the shape) |
| Challenge (was "door pick") | double arch on a base | orchid pink | two doorways |
| Guardian | 14-point mane burst, drawn 1.15 to 1.2 times larger | purple | friendly stone lion-dog face |

States: **cleared** = filled with a gold check seal; **you are here** = filled with a thick cream and gold ring; **not yet** = outline ring only. A rising step line sits under the strip. Five different silhouettes, all readable at 30 pt, and they still tell apart in grey and as black shapes (bottom right of sample 3).

## Techniques

Pillow + numpy at 4x supersampling, exported at 2x. Material recipes (wood grain, paper, brass, bevel, rim light, drop shadow, inner shadow) come from the A-MENU2 kit, so the Board, the Trophy Case and the Insight picker are made of the same stuff. Text is Nunito, the master seal uses a CJK serif. All text in the mocks is placeholder.

## Tokens

`tokens.json`: colours, room colours and size minimums, ready for `ui/tokens.ts`.

## Re-run

```bash
python3 incoming-art/ui-benchmark/source/build_ui_benchmark.py   # writes preview/01 to 03
python3 incoming-art/ui-benchmark/source/export_sprites.py       # writes sprites/ and preview/04 to 06
```

Needs Python 3, Pillow, numpy. Reusable pieces: `incoming-art/tools/board_ui_kit.py`, `incoming-art/tools/climb_icons.py` (`render(kind, state, px)`), and `source/make_tab_icons.py` (`render(kind, px)`, built on `source/toon.py`, a copy of the #419 toon kit). The hero is the player-character sprite (layers body, gi, belt) and is only context here.

## Known risks

- The hero at 100 pt is about 2x its native sprite size, so it is a little soft. That is B1's job, not fixed here.
- The Practice room button is 40 pt tall visually.
