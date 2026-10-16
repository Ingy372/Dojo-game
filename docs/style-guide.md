# Dojo Ascent art style guide

**Status: approved by Jay on 2026-10-16.** Copied from the Art Director's `incoming-art/style-guide-draft.md`. All new art follows it. Fonts (section 9) are still Jay's choice; the game uses the system font until he picks. One game-side note: the game shrinks all art to 48 px per tile when importing it (`tools/art-import/`), so keep rendering at 80 px per tile.

## 1. The look in one sentence

Friendly, low-poly 3D models with flat cel shading and a soft dark outline, rendered from one fixed top-down three-quarter camera into crisp transparent sprites. Warm wood and calm stone for places; clear, bright colours for things you need to notice. Kid-friendly for ages 6 and up: nothing gory, sharp or truly scary, and moves that look like real, clean martial arts.

## 2. Camera and sizes

| Rule | Value |
| --- | --- |
| Camera | Orthographic, looking north, **35°** down from horizontal (top-down three-quarter view). Never changes. |
| Tile scale | **80 px per tile** (1 tile = 1 game unit). |
| Character frames | **128 × 128 px** (1.6 tiles across). Large creatures use **256 × 256 px** (3.2 tiles across), the same 80 px per tile. |
| Feet point (anchor) | Characters: the feet / ground point at 82% down the frame (x 64, y ≈ 105 in a 128 frame). Exact values are in each JSON (`anchor`). |
| Static art | Rooms, decorations, doors and tiles are drawn on the game's square grid: a floor tile is exactly **80 × 80 px**, heights show at 80 × cos 35° ≈ 65.5 px per tile (`tools/render_static.py`). |
| Directions | **8**, in this order (sheet rows top to bottom): **N, NE, E, SE, S, SW, W, NW**. N = facing away from the camera (up the screen), S = facing the camera. |
| Sheets | One PNG per layer per animation; rows = directions, columns = frames (counted from 0). Transparent background, straight alpha. |

## 3. Frame rates and timing

- **Default:** 8–12 fps for loops and idle motion, 16–20 fps for fast moves.
  - Idle: 8 fps.
  - Walk: 30 fps, synced to 4.5 tiles/s.
  - Jab, dash, hit: 20 fps.
  - Strike, counter, bow, celebrate: 16 fps.
  - Cleaning: 8–12 fps.
  - Enemies: 10–12 fps.
- **Gameplay timings come from the game files**, never from the art:
  - `packages/sim/src/config.ts`
  - `content/enemies/*.json` (20 ticks per second)

  An enemy wind-up lasts exactly its `telegraphTicks`.
- Every animation's JSON entry has `fps`, `frames`, `durationSec`, `loop`, key frames (`tags` / `keyFrames`), and notes like `holdLastFrame` or `removeAfter`.

## 4. Colour palette

**Characters**

| Use | Hex |
| --- | --- |
| Outline (everything) | `#14121c` |
| Skin (player default) | `#f0b98d` |
| Hair (default) | `#4a2c1d` |
| Eyes | `#1d1a24` |
| Gi | neutral `#f2f2f2`, tinted in the game (placeholder `#f2e9d8`) |

**Belts**: option C, see section 7.

**Shadow creatures (Tier 1)**

| Use | Hex |
| --- | --- |
| Bodies | `#30225e` to `#3b2c72` (deep indigo / purple) |
| Belly | `#4a3790` to `#5a4aa3` |
| Soft glow rim | `#8f74ff` |
| Eyes (glowing) | `#bff6ff` with a white shine |
| Cheeks | `#7a5fc4` |
| Shield | `#8fa6c8` / `#5f7398` |
| Floor Keeper gem | `#ffd36b` |
| Telegraph | neutral white, tinted by the game (`#ff3b30` Standard, `#ffd36b` suggested for Guided) |

**Light (defeat, shrine, chest)**

| Use | Hex |
| --- | --- |
| Light | `#fff6c8` |
| Sparkles | `#ffe48a` |
| Halo | `#ffe9a0` |

**Home Dojo**

| Use | Hex |
| --- | --- |
| Floor planks | `#c99a62`, `#c19159`, `#d2a56d`, `#c7965d` |
| Plank gaps | `#7b5434` |
| Dark wood | `#7a5232` / `#6b4428` / `#5f3f26` |
| Plaster | `#efe3c6` |
| Training mat | `#3a6ea5` (rim `#6f9fd2`) |
| Practice mat | `#4f8a4a` (rim `#7fbf6f`) |
| Banner red | `#b8322a` |
| Gold | `#d9a441` |

**Tower (Tier 1)**

| Use | Hex |
| --- | --- |
| Floor stone | `#c9c1b2` / `#c2baab` / `#cfc8ba` |
| Floor grout | `#948b7c` |
| Wall stone | `#8e92ab` / `#71758f` (dark) / `#a9adc4` (cap) |

**Door kinds** (trim and icon colour)

| Kind | Hex |
| --- | --- |
| Battle | `#c8553d` |
| Challenge | `#7b5cc4` |
| Treasure | `#d9a441` |
| Rest | `#3f9a7a` |

**Game floor behind sprites:** `#2f2a3d`. Previews use it.

## 5. Lighting and shading

- **Cel shading with one fixed light**, from the camera side, upper left (direction −0.45, −0.55, 0.70). It's done with an emission shader, so shading is identical in every direction and engine.
- **Three steps:** shadow 66% of the base colour, lit 100%, and a small highlight at 110%. Glowing things (eyes, light, sparkles) are flat at 100%.
- **Render settings:** Cycles, 24 samples, "Standard" view transform (exact colours), transparent film.
- **No cast shadows** in the sprites. The game draws a soft round shadow under characters if wanted.

## 6. Outlines

- **Dark inverted-hull outline** `#14121c`, **0.013 tiles** (about 1 px at 80 px per tile) on characters, creatures, props and decorations.
- **No outline** on:
  - small flat details (rims, stripes, papers, kanji);
  - floor planks and tiles, so the floor stays calm;
  - glowing light, so it stays soft.
- Enemies also have a soft coloured **glow rim** outside the outline, and an optional, wider **telegraph rim**.

## 7. Layers and tinting

- **Layers stack bottom to top in `sprite_order`.** Each layer is rendered with the others as holdouts, so stacking them rebuilds the picture with correct overlaps.
- **Overlays** (drawn on top, optional) are switched off while base layers render, so base layers never have holes.
- **Tinted layers are neutral** (light grey or white) and are recoloured with a multiply tint (`setTint`). Untinted layers keep their real colours. Each JSON has `tintGuidance`.
- **Player layers:**
  - `body`, `gi`, `belt`, `belt-sheen`, `belt-center`, `belt-center-edge` (unused), `belt-rim`;
  - the rank-stripe layers `belt-tape1-edge`, `belt-tape1`, `belt-tape2-edge`, `belt-tape2`;
  - the props `prop-broom` and `prop-rag`.
- **Enemy layers:**
  - `body`, `glow` (always), `telegraph` (optional: wind-up only, tinted and flashed), `light` (defeat light);
  - the Shield Guard adds `shield` and `shield-broken` (draw exactly one).
- **Belt rules (option C, approved):**
  - **Rim:** every belt gets a dark rim `#2e2a3a`, except a black belt, which gets a light rim `#c9ccd6`.
  - **Black belt:** the belt is drawn as `#26272f` with a top sheen `#a2a6b6`.
  - **Two-colour belts:** a black centre stripe is drawn as deep black `#111116`.
  - **Rank stripes:** tape follows `apps/client/src/ui/belt.ts`.
  - "Black" means luminance < 40, where luminance = 0.3 R + 0.59 G + 0.11 B.
  - The ready-made table is `beltStyles` in `player-character/sprites/player.json`.
  - The belt is never customisable.

## 8. Naming

- **Folders:** one per batch under `incoming-art/`, each with:
  - `source/` (build scripts and `.blend` files);
  - `sprites/` (PNG and JSON for the game);
  - `preview/` (review pictures only, not for the game);
  - `README.md` (technical sheet);
  - `DELIVERY_NOTE.md` (WHAT / WHY / DECIDE / NEXT).
- **Character sheets:** `<character>_<layer>_<animation>.png` (e.g. `player_belt-rim_bow.png`, `swarmer_telegraph_windup.png`), plus `<character>.json`.
- **Static sprites:** `<sprite>_<layer>.png` (e.g. `room_floor.png`, `door-battle_door-battle.png`), plus `static.json`. Sheets of states/frames run left to right.
- **Names:** lower-case with hyphens, matching the game's ids where one exists (`training-mat`, `floor-keeper`, `door-rest`).
- **Preview pictures:**
  - `review-N-*.png`: start here.
  - `<name>_<animation>.gif`
  - `<name>_contact_<animation>.png`

## 9. Fonts (recommendation; Jay decides)

The game uses the system font today, and the title uses Georgia. For a kid-friendly look that stays easy to read on a phone, I recommend free fonts with commercial use allowed:

| Use | Font | Why | License |
| --- | --- | --- | --- |
| Titles, big buttons, reward moments | **Fredoka** (Google Fonts) | Round, friendly, bold, very readable at large sizes | SIL Open Font License 1.1 (free for commercial use, can be bundled with the app) |
| Body text, cards, menus | **Nunito** (Google Fonts) | Rounded, clear letter shapes at small sizes | SIL Open Font License 1.1 |
| Optional alternative for the youngest readers | **Andika** (SIL, also on Google Fonts) | Designed for beginning readers (clear a, g, I/l) | SIL Open Font License 1.1 |
| Kanji in the art (banner 心, scroll 道) | **BIZ UDPMincho Bold** (Morisawa, Google Fonts) | Correct, traditional-looking characters | SIL Open Font License 1.1. Only rendered into the pictures; the font file is not shipped. |

- The OFL lets you use, bundle and embed the fonts in a commercial app. The only limits are that you can't sell the font files on their own, and modified versions need a new name. Keep a copy of each font's license file (OFL.txt) next to the font in the app.
- Please check the license page of each font on Google Fonts before shipping. I checked these from memory and the font files on the box, not from a lawyer.
- **(Jay decides)** Fredoka + Nunito, Fredoka + Andika, or keep the system font.

## 10. Kid-appropriateness checklist (every asset)

- Ages 6+: no blood, teeth, claws, weapons with edges, or realistic people as enemies.
- Shadow creatures are a little spooky but cute: soft round shapes, big glowing eyes, never frightening.
- Defeats are "set free": the creatures dissolve into light and sparkles, never death. Nothing is evil forever.
- Martial arts moves use real, clean technique: guard up, balanced stances, no locked joints, bows done properly.
- Practice weapons are wooden and rounded (bokken, jo).
- Every kanji used is correct and appropriate, with its meaning noted in the README.
