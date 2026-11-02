# UI benchmark samples: Board paper-and-wood look (B2) and Tower Climb icons (B4)

Item from the Manager: **R-BENCHMARK** (plan in `drafts/planning/R-BENCHMARK.md`). Samples only, three images. Nothing here touches game code.

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
- **Tabs:** icon + label, active tab raised and gold, "new" is a small gold dot (no numbers). The tab icons are placeholders for B3.
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
| Door pick | double arch on a base | orchid pink | two doorways |
| Guardian | 14-point mane burst, drawn 1.15 to 1.2 times larger | purple | friendly stone lion-dog face |

States: **cleared** = filled with a gold check seal; **you are here** = filled with a thick cream and gold ring; **not yet** = outline ring only. A rising step line sits under the strip. Five different silhouettes, all readable at 30 pt, and they still tell apart in grey and as black shapes (bottom right of sample 3).

## Techniques

Pillow + numpy at 4x supersampling, exported at 2x. Material recipes (wood grain, paper, brass, bevel, rim light, drop shadow, inner shadow) come from the A-MENU2 kit, so the Board, the Trophy Case and the Insight picker are made of the same stuff. Text is Nunito, the master seal uses a CJK serif. All text in the mocks is placeholder.

## Tokens

`tokens.json`: colours, room colours and size minimums, ready for `ui/tokens.ts`.

## Re-run

```bash
python3 incoming-art/ui-benchmark/source/build_ui_benchmark.py   # writes preview/*.png
```

Needs Python 3, Pillow, numpy. Reusable pieces: `incoming-art/tools/board_ui_kit.py` and `incoming-art/tools/climb_icons.py` (`render(kind, state, px)`). The hero is the player-character sprite (layers body, gi, belt) and is only context here.

## Known risks

- The hero at 100 pt is about 2x its native sprite size, so it is a little soft. That is B1's job, not fixed here.
- The Practice room button is 40 pt tall visually.
