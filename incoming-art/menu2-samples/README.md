# A-MENU2 samples: mood A, warm dojo wood (plan P-MENU2, #259)

The 3 first samples from `drafts/planning/P-MENU2-training-board-redesign.md` §art list. **No text is baked into any sprite**: names, "Learn this at the dojo", slot names, item names and effect lines are game text. The placeholder text in the phone mocks is only there to show sizes (12 / 14 / 17 px).

Every sprite is exported at 1x (`name.png`) and 2x (`name@2x.png`).

## 1. A2 trophy cubby, 112 × 112 (scale to 96 on small phones)
| File | What |
|---|---|
| `sprites/cubby-earned` | Lit honey-wood card, a soft gold glow and a thin gold inner line. Icon area: 64 px, centred, top at y = 9. Name: game text 12 bold, centred at y ≈ 94. |
| `sprites/cubby-notyet` | Cream paper card, warm wood edge and a dashed "waiting" line. No lock, no grey, no count. |
| `sprites/cubby-seal` (24 × 24) | Gold "done" seal with a check, top-right corner (x = 81, y = 7). **Not red, see DECIDE.** |
| `sprites/cubby-lantern` (24 × 32) | Warm glowing lantern **overlay**, placed by the game **only on the next cubby to learn**, top-right (x = 81, y = 5). |
| `sprites/example-cubby-earned` / `-next` / `-notyet` | The parts put together, with an A5 icon from `incoming-art/icons/sprites/`. `-next` = not-yet + lantern (the next one to learn); `-notyet` = no lantern. |

Not-yet icon in the game: draw the A5 icon at **30% alpha** with a warm sepia tint (in the example: luminance mapped to brown; a multiply tint of `#c8a070` at alpha 0.3 is close enough).
9-slice: corners 16 px; the middle stretches. The seal and lantern are separate, so they don't stretch.

## 2. A6 Stance slot card, 140 × 132 (+ 8 px glow margin, files are 156 × 148)
| File | What |
|---|---|
| `sprites/slot-card-selected` | Honey wood, gold glow and a gold inner line. |
| `sprites/slot-card-normal` | Paper face in a wood frame. |

The card's top-left is at (8, 8) in the file. Icon: 64 px, centred, top at card y = 12 (the round well behind it sits fully inside the frame). Game text, centred: slot name 12 at y 84, item name 17 bold at y 101, effect 14 at y 117. Also works for the Virtue slot.

## 3. A1 panel frame + A3 belt ribbon
| File | What |
|---|---|
| `sprites/panel-frame-9slice` (192 × 192) | Wood frame and a paper face with brass corner pegs. **9-slice with 48 × 48 corners.** |
| `sprites/belt-knot-band` (40 × 40) | **Neutral light grey (#ececec) knot. Multiply-tint with the belt colour**, the same as the player belt (`beltStyles[belt].belt` in `incoming-art/player-character/sprites/player.json`). |
| `sprites/belt-knot-stripe` | Neutral stripe marks on the tails; tint with the stripe colour, and draw only for belts with stripes. |
| `sprites/belt-knot-sheen` | White highlight, untinted, on top. |
| `sprites/belt-knot-rim` | Dark outline, untinted, on top. |
| `sprites/belt-knot-outline` | Future belt: a paper knot with a wood outline, untinted. |
| `sprites/belt-ribbon-band` (320 × 40) | Neutral cord behind the knots. Stretch horizontally; in the mock it is tinted `#d9b47a`. |

Draw order for an earned knot: (glow if current) → band (tinted) → stripe (tinted, optional) → sheen → rim. The current-belt glow in the mock is a soft gold blur behind the knot; the game can draw it as a circle with blur or alpha.

## Previews
- `preview/phone-mock-large-932x430.png` (+ `@2x`) and `preview/phone-mock-small-667x375.png` (+ `@2x`): **real size**, 1 px = 1 CSS px. Tabs are 34 tall; the left column is a placeholder. The small mock shows only the Stance card (two 132 px cards don't fit 375 tall; the plan puts the Fighting Style on its own screen).
- `preview/cubby-earned-next-notyet-3x.png` (earned, next with lantern, not-yet), `preview/slot-card-normal-vs-selected-3x.png`

## Rebuild
    python3 incoming-art/menu2-samples/source/make_menu2_samples.py
(PIL; drawn at 4x and scaled down. It reads the icons and `beltStyles`, read only.)
