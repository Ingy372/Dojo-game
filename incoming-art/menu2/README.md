# A-MENU2 full set (plan #259, A1–A13)

Art only. No game code. Everything is built by script:

```
python3 incoming-art/menu2/source/build_menu2.py   # sprites/ + sprites/menu2.json
python3 incoming-art/menu2/source/make_mocks.py    # preview/ mocks + close-ups
```

`source/mat.py` is the material kit (wood, washi, brass, bevel, rim light, lacquer, glow). Each sprite is drawn at 4× and scaled down with LANCZOS to `name.png` (1x) and `name@2x.png`.

## Conventions
- **9-slice margins** use CSS order `[top, right, bottom, left]` in 1x px. `[0,c,0,c]` means a 3-slice along x. At @2x, double them.
- **Shadow margin:** sprites with `shadowMargin` have a soft drop shadow baked into that many px of transparent edge. Lay them out by the inner box.
- **States:** `normal`, `selected`, `pressed` and `disabled`/`notyet` are separate files of the same size, so you can swap them without moving anything. Pressed is the same art moved down 1 px and darkened about 8%.
- **Overlays** (`cubby-next-glow`, `*-shine-N`, `unlock-sweep-N`, `xp-bar-gloss`) are additive or alpha layers drawn on top of the base and centred on it. Shine is optional: 6 frames at 16 fps, played once.
- **Belt knot layers**, drawn bottom to top: `belt-knot-shadow`, then `belt-knot-band` (multiply by beltStyles colour), then `belt-knot-center` (only for Red/Black and Brown/Black), then `belt-knot-sheen` (Black only; other belts use white at 25%), then `belt-knot-rim`. The art layers are neutral grey, so the game tints them. The previews leave out Red and Red/Black so they stay red-free; the game tints those.
- **XP fill** is neutral. Multiply-tint it in the game (the mock uses #f2c14e).
- No baked text, nothing above heads, and no red outside danger or warning. All names and numbers in the mocks are placeholders.

## Sprites
| sprite | size (1x) | 9-slice [t,r,b,l] | notes |
|---|---|---|---|
| `panel-frame` | 192×192 | [48, 48, 48, 48] | A1. 9-slice, 48 px corners on all sides (brass brackets live in the corners). Top/bottom rails stretch along x; side rails stretch along y (their grain runs that way). Content area starts 22 px in (6 shadow + 14 rail + 2 lip). |
| `panel-inset` | 96×96 | [24, 24, 24, 24] | Recessed paper well for sub-areas (tray, stat strip, found strip). 9-slice 24. |
| `title-plaque` | 160×40 | [0, 22, 0, 22] | EXTRA (not in A1-A13): lacquered honey plaque for screen titles; 3-slice along x (22 px caps). Text drawn by the game in dark ink #462a16. |
| `shelf-plank` | 192×20 | [0, 12, 0, 12] | Shelf the cubbies stand on; 3-slice along x. The cubby bottoms sit at y = 4. |
| `cubby-earned` | 112×112 | [24, 24, 24, 24] | A2 earned. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-earned-pressed` | 112×112 | [24, 24, 24, 24] | A2 earned. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-notyet` | 112×112 | [24, 24, 24, 24] | A2 notyet. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-notyet-pressed` | 112×112 | [24, 24, 24, 24] | A2 notyet. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-next-glow` | 112×112 | — | A2/A9: warm lantern spill for the next cubby only. Draw over cubby-notyet, then the lantern. |
| `cubby-earned-shine-0` | 112×112 | — | OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty. |
| `cubby-earned-shine-1` | 112×112 | — | OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty. |
| `cubby-earned-shine-2` | 112×112 | — | OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty. |
| `cubby-earned-shine-3` | 112×112 | — | OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty. |
| `cubby-earned-shine-4` | 112×112 | — | OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty. |
| `cubby-earned-shine-5` | 112×112 | — | OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty. |
| `cubby-earned-96` | 96×96 | [20, 20, 20, 20] | A2 earned. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-earned-pressed-96` | 96×96 | [20, 20, 20, 20] | A2 earned. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-notyet-96` | 96×96 | [20, 20, 20, 20] | A2 notyet. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-notyet-pressed-96` | 96×96 | [20, 20, 20, 20] | A2 notyet. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow. |
| `cubby-next-glow-96` | 96×96 | — | A2/A9: warm lantern spill for the next cubby only. Draw over cubby-notyet, then the lantern. |
| `cubby-seal` | 24×24 | — | A4 gold check seal (decided). Embossed check, no text. |
| `cubby-lantern-0` | 24×32 | — | A9 lantern, 2-frame flicker (ping-pong, ~3 fps). Only on the next cubby to learn (decided). |
| `cubby-lantern-1` | 24×32 | — | A9 lantern, 2-frame flicker (ping-pong, ~3 fps). Only on the next cubby to learn (decided). |
| `slot-card-normal` | 156×148 | [0, 0, 0, 0] | A6 slot card 140 x 132 (decided), drawn in a 156 x 148 file with 8 px for the glow. Not stretched. |
| `slot-card-selected` | 156×148 | [0, 0, 0, 0] | A6 slot card 140 x 132 (decided), drawn in a 156 x 148 file with 8 px for the glow. Not stretched. |
| `slot-card-pressed` | 156×148 | [0, 0, 0, 0] | A6 slot card 140 x 132 (decided), drawn in a 156 x 148 file with 8 px for the glow. Not stretched. |
| `slot-card-shine-0` | 156×148 | — | OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once. |
| `slot-card-shine-1` | 156×148 | — | OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once. |
| `slot-card-shine-2` | 156×148 | — | OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once. |
| `slot-card-shine-3` | 156×148 | — | OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once. |
| `slot-card-shine-4` | 156×148 | — | OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once. |
| `slot-card-shine-5` | 156×148 | — | OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once. |
| `tray-tile-normal` | 84×84 | — | A7 tray tile 72 (file 84 with 6 px glow margin). Icon 52-56 centred. |
| `tray-tile-selected` | 84×84 | — | A7 tray tile 72 (file 84 with 6 px glow margin). Icon 52-56 centred. |
| `tray-tile-equipped` | 84×84 | — | A7 tray tile 72 (file 84 with 6 px glow margin). Icon 52-56 centred. |
| `tray-tile-pressed` | 84×84 | — | A7 tray tile 72 (file 84 with 6 px glow margin). Icon 52-56 centred. |
| `tray-equipped-badge` | 20×20 | — | Gold check seal for equipped tiles (same seal as A4). |
| `bag-tile-common` | 84×100 | — | A11 rarity frame, gear bag tile 72 x 88 (file 84 x 100). Rare gets 2 stars, epic 4. Icon 56 at top, centred x, centre y 40. |
| `found-tile-common` | 60×60 | — | Last run found tile 52 (file 60). Icon 40. |
| `bag-tile-uncommon` | 84×100 | — | A11 rarity frame, gear bag tile 72 x 88 (file 84 x 100). Rare gets 2 stars, epic 4. Icon 56 at top, centred x, centre y 40. |
| `found-tile-uncommon` | 60×60 | — | Last run found tile 52 (file 60). Icon 40. |
| `bag-tile-rare` | 84×100 | — | A11 rarity frame, gear bag tile 72 x 88 (file 84 x 100). Rare gets 2 stars, epic 4. Icon 56 at top, centred x, centre y 40. |
| `found-tile-rare` | 60×60 | — | Last run found tile 52 (file 60). Icon 40. |
| `bag-tile-epic` | 84×100 | — | A11 rarity frame, gear bag tile 72 x 88 (file 84 x 100). Rare gets 2 stars, epic 4. Icon 56 at top, centred x, centre y 40. |
| `found-tile-epic` | 60×60 | — | Last run found tile 52 (file 60). Icon 40. |
| `bag-tile-selected` | 84×100 | — | Bag tile selected/pressed (replaces the rarity frame while selected; draw the rarity stars on top if wanted). |
| `bag-tile-pressed` | 84×100 | — | Bag tile selected/pressed (replaces the rarity frame while selected; draw the rarity stars on top if wanted). |
| `switch-track` | 240×52 | [0, 24, 0, 24] | Track behind the two segments; 3-slice along x. Segments sit at x=0 and x=120, y=4. |
| `switch-left-on` | 120×44 | — | A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower. |
| `switch-left-off` | 120×44 | — | A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower. |
| `switch-left-pressed` | 120×44 | — | A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower. |
| `switch-right-on` | 120×44 | — | A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower. |
| `switch-right-off` | 120×44 | — | A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower. |
| `switch-right-pressed` | 120×44 | — | A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower. |
| `glyph-trophy` | 32×32 | — | A8 Trophy Case glyph. On 'off' segments draw at 70% alpha. |
| `glyph-swords` | 32×32 | — | A8 Fighting Style glyph: crossed wooden practice swords (round, no edges). |
| `stat-perfect` | 32×32 | — | A10 stat icon: perfect. |
| `stat-combo` | 32×32 | — | A10 stat icon: combo. |
| `stat-clock` | 32×32 | — | A10 stat icon: clock. |
| `stat-xp` | 32×32 | — | A10 stat icon: xp. |
| `stat-tile` | 96×64 | [16, 16, 16, 16] | EXTRA: stat tile 64 tall, 9-slice 16. Icon at left (x 12), number by the game. |
| `xp-bar-frame` | 200×20 | [0, 10, 0, 10] | XP bar frame, full width x 20, 3-slice along x (10 px caps). Fill area x 4..w-4, y 4..15. |
| `xp-bar-fill` | 192×11 | [0, 6, 0, 6] | Neutral fill, tint in game. 3-slice; clip to the progress width. |
| `xp-bar-gloss` | 192×11 | [0, 6, 0, 6] | Gloss over the fill. |
| `gear-ring-common` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-common-glow` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-common-pressed` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-uncommon` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-uncommon-glow` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-uncommon-pressed` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-rare` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-rare-glow` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-rare-pressed` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-epic` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-epic-glow` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `gear-ring-epic-pressed` | 56×56 | — | A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into. |
| `doll-backing` | 96×128 | — | A12: backing niche + tatami dais. Reuse player-a-big (128 x 160 frames) at 0.75 on top; it fits (body ~38 x 99 -> ~29 x 74). |
| `unlock-sweep-0` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-1` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-2` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-3` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-4` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-5` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-6` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `unlock-sweep-7` | 128×128 | — | A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item. |
| `belt-knot-band` | 40×40 | — | A3 knot layer, neutral. Tint with multiply from player.json beltStyles (same layer names). Draw: shadow, band, center (only if listed), sheen (if listed, else white @25%), rim. |
| `belt-knot-center` | 40×40 | — | A3 knot layer, neutral. Tint with multiply from player.json beltStyles (same layer names). Draw: shadow, band, center (only if listed), sheen (if listed, else white @25%), rim. |
| `belt-knot-sheen` | 40×40 | — | A3 knot layer, neutral. Tint with multiply from player.json beltStyles (same layer names). Draw: shadow, band, center (only if listed), sheen (if listed, else white @25%), rim. |
| `belt-knot-rim` | 40×40 | — | A3 knot layer, neutral. Tint with multiply from player.json beltStyles (same layer names). Draw: shadow, band, center (only if listed), sheen (if listed, else white @25%), rim. |
| `belt-knot-shadow` | 40×40 | — | A3 knot layer, neutral. Tint with multiply from player.json beltStyles (same layer names). Draw: shadow, band, center (only if listed), sheen (if listed, else white @25%), rim. |
| `belt-cord` | 320×40 | [0, 20, 0, 20] | The decided ribbon cord, neutral, 3-slice along x. |
| `button-primary-normal` | 160×52 | [0, 24, 0, 24] | EXTRA (plan's Wear button, 52 tall): honey-gold lacquer button, 3-slice along x. Label by the game in #462a16. Disabled = matte pale wood (not grey, not red). |
| `button-primary-pressed` | 160×52 | [0, 24, 0, 24] | EXTRA (plan's Wear button, 52 tall): honey-gold lacquer button, 3-slice along x. Label by the game in #462a16. Disabled = matte pale wood (not grey, not red). |
| `button-primary-disabled` | 160×52 | [0, 24, 0, 24] | EXTRA (plan's Wear button, 52 tall): honey-gold lacquer button, 3-slice along x. Label by the game in #462a16. Disabled = matte pale wood (not grey, not red). |
| `icon-off-balance-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-escape-step-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-sweep-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-strong-block-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-sharp-eyes-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-create-distance-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-disarm-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-throw-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
| `icon-follow-through-64` | 64×64 | — | A5 seal icon at 64 (from incoming-art/icons). |
