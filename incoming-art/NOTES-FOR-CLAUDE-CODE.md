# Notes for Claude Code: how to put the art into the game

**From:** the Art Director bot. This is the single handoff file for every batch so far. I keep it up to date with each new batch.
**Last updated:** 2026-10-16 (Batch 6).
**Where things are:** all paths are relative to the repository root. Every sprite JSON is the source of truth for sizes, anchors, frame counts and timing. This file explains how to use them.

Status markers used below:
- **[NEW]**: changed in the latest batch.
- **[OPEN]**: still waiting on Jay or on a game-side decision.

---

## 0. Rules for every batch

- **Scale:** 80 px per tile in every render. The import tool (`tools/art-import/`) shrinks it to 48 px per tile (0.6×). Details thinner than about 2 px at 80 px per tile vanish in the game.
- **Camera:** orthographic, 35° down, looking north. Height shows at 80 × cos 35° ≈ 65.5 px per tile.
- **Directions:** sheet rows top to bottom are **N, NE, E, SE, S, SW, W, NW**. Columns are frames, counted from 0. There's no padding.
- **Placement:** always place by each JSON's `anchor` (characters) or `anchorPx` (static art) and its `frameWidth`/`frameHeight` or `size`. Never assume 128 px.
- **Alpha:** PNGs are straight alpha. All tinted layers are neutral light grey or white, recoloured with a **multiply** tint (`setTint`). Untinted layers keep their real colours.
- **Layer stacking:** each layer is rendered with the others as holdouts. Stacking all drawn layers in `order` rebuilds the picture with correct overlaps.
  - Overlays (belt stripes, centre stripe, sheen) are optional and safe to skip.
  - Base layers must always be drawn together.
- **Gameplay timings come from the game files, never from the art.** That means `packages/sim/src/config.ts` and `content/enemies/*.json` (20 ticks per second).

---

## Batch 1: player character, `incoming-art/player-character/`

- **[NEW] Frame size is now 128 × 160 px** (was 128 × 128) for every player sheet, both in `player-character/sprites/` and in Batch 6.
  - It's still 80 px per tile.
  - The feet are in the same place relative to the bottom, so the **feet anchor is now (64, 136.96)** (was (64, 104.96)).
  - The extra 32 px are all on top. They give room for tall hair and raised fists on the celebrate hop, which touched the top edge before.
  - **Game side:** update the anchor, frame height and anything that assumed 128 high. That includes the `player-big` ceremony pack and `tools/art-import/approved.json` if it lists sizes.
  - `player-character/sprites/` was re-rendered at the new size with no other change. Same poses, timing and layers; the pixels are the old ones moved down 32 px.
- **JSON:** `player-character/sprites/player.json`, 13 animations.

| Animation | Frames | fps | Notes |
| --- | --- | --- | --- |
| idle | 8 | 8 | loop |
| walk | 10 | 30 | Loop. `groundMotion`: playback fps = move speed (tiles/s) × **6.6667** (`fpsPerTilePerSec`), so the planted feet don't slide. At 4.5 tiles/s that's 30 fps; Rooted Form at 3.825 tiles/s plays at 25.5 fps |
| strike | 8 | 16 | `impact: 4`. The lunge movement stays in code |
| counter | 12 | 16 | `block: 0-7` (hold frame 7 while guarding), `counter_hit: 8`. For a Perfect Counter, play 8–11 |
| jab | 6 | 20 | Automatic basic attack, `impact: 2`, `repeatEverySec: 0.6`. Ends on the guard (flows into idle frame 0). **Play it only when standing still**, so walking stays smooth (as the game does now) |
| bow | 22 | 16 | **1.375 s.** The game's `BOW.ms` is set to 1375 (it was 900). To stay near 0.9 s instead, play frames 3–18 (1.0 s) or all 22 at 24 fps (0.92 s) |
| defeat | 16 | 12 | `holdLastFrame: true` during the fade |
| dash | 8 | 20 | Played in place. The game moves him **2.5 tiles during frames 1–5** (0.25 s). Push 1, land 5, recover 6–7 |
| hit | 5 | 20 | Flinch; the guard stays up |
| sweep | 8 | 10 | Loop. Draw `prop-broom` |
| wipe | 8 | 8 | Loop. Draw `prop-rag` |
| straighten | 14 | 12 | reach 3–4, adjust 4–7, nod 10 |
| celebrate | 24 | 16 | arms_up 4–12, hop_top 5, proud 18. `holdLastFrame: true` |

### Player layers and tints

- **Base layers** (always drawn):
  - `body`: untinted.
  - `gi`: tinted with the gi colour.
  - `belt`: tinted with `belt.color`. A black `belt.color` becomes `#26272f`.
  - `belt-rim`: **always drawn**, `optional: false`. Tinted `#2e2a3a` (dark), or light `#c9ccd6` when the belt is black.
- **Overlays:**
  - `belt-sheen`: tinted `#a2a6b6`, black belts only.
  - `belt-center`: tinted with `belt.color2` on two-colour belts. A black `color2` becomes deep black `#111116`.
  - `belt-center-edge`: never drawn in the chosen style (option C).
  - `belt-tape1` and `belt-tape2`: tinted with the stripe colour from `apps/client/src/ui/belt.ts` (white tape `#f4f1ea` on dark belts, `#1a1a1a` on light ones). At most 2 stripes.
  - `belt-tape1-edge` and `belt-tape2-edge`: **never tinted** (a light rim around each stripe).
- **Belt style option C** (approved): there's a ready-made per-belt tint table in `beltStyles` in the JSON. A layer not listed for a belt isn't drawn. "Black" means luminance < 40, where luminance = 0.3 R + 0.59 G + 0.11 B.
- **Props:** `prop-broom` and `prop-rag` are untinted. They're only drawn in the animations that list them in `props`; their sheets elsewhere are empty.

## Batch 2: Tier 1 creatures, `incoming-art/enemies-tier1/<enemy>/sprites/`

| Enemy | Frame | Feet anchor | Special animations |
| --- | --- | --- | --- |
| swarmer | 128 × 128 | (64, 104.96) | |
| shield (Shield Guard) | 128 × 128 | (64, 104.96) | Shield bash. `shield` / `shield-broken` layers on every animation |
| brute | **208 × 208** | (104, 170.56) | winded |
| keeper (Floor Keeper) | 256 × 256 | (128, 209.92) | windup_slam, slam, windup_sweep, sweep, call (calling for help) |

- **Layers, bottom to top:**
  - `body`;
  - `shield` or `shield-broken` (Shield Guard: exactly one. Show `shield-broken` briefly when it breaks, then neither until it grows back);
  - `glow`;
  - `telegraph`: **tinted**, neutral white;
  - `light`: the defeat light.
- **`telegraphIntensity`:** a per-frame alpha on wind-ups and attacks. Multiply it into the telegraph layer's alpha.
  - Wind-ups ramp from 0.25 to 1.0, eased.
  - Attacks start at 1.0 and dim to 0 over the first half.
- **Easier modes:** creature wind-ups run on the rules' telegraph clock. Wherever the game holds the danger circle near full (Guided holds longest), **hold the last wind-up frame at intensity 1.0** until the hit lands.
- **The Brute "turns red" through the tint:** tint the telegraph layer with the same red as the danger circle (`#ff3b30` Standard; `#ffd36b` was suggested for Guided). Don't recolour the body. The Brute's own magenta glow stays.
- **Defeat:** the art's dissolve plays. The game adds its golden flash and rising stars in code (2026-10-16). Keep both.
- **Memory note (already done in the game):** the telegraph layer is kept only in wind-ups and attacks.

## Batch 3: Home Dojo, `incoming-art/home-dojo/sprites/static.json`

- **The room:** `room_*.png`, 1200 × 824 px. `anchorPx` (0, 24) = grid tile (0, 0). Draw in this order:
  1. `room_floor`, under everything;
  2. `room_notice-board`, on the floor layer (column 8, can be highlighted);
  3. `room_wall-front`, **above the characters and decorations** (the door gap is at column 8).
- **Decorations:**
  - Floor items: `anchorPx` = the bottom-centre of the footprint. Sort them with the characters by the footprint's bottom row.
  - Wall items: anchor on the bottom-centre of their top-wall cell.
- **Mess** (config `DOJO`):
  - Dust: `dust-1` … `dust-3`, centred on the dust spots.
  - The game's mess spot type **`leaf` now shows `footprints-1`, `footprints-2`, `towel` or `water-bottle`** (pick one per spot). The internal name stays `leaf`, so old saves still work.
  - Mat scuffs: `training-mat-scuffed` and `practice-mat-scuffed` are overlays with the same anchor and size as the mat.
  - The crooked rack: `weapon-rack-crooked` is a 3-frame sheet for the 3 `rackCrookedAt` levels.
- **Kanji (approved):** 心 on the banner and 道 on the scroll. They're the only text in any art.

## Batch 4: Tower rooms, `incoming-art/tower-rooms/sprites/static.json`

- **Floor tiles:** `floor-big`, `floor-quad` and `floor-worn` are 80 × 80, anchored at the cell's top-left. Use `floor-worn` for about 1 in 10.
- **Walls:**
  - `wall-face`: 80 × 104, the top-row wall, `anchorPx` (0, 24) at the cell's top-left.
  - `wall-block`: other walls.
  - `pillar`: 88 × 224, anchor at the bottom-centre of the cell. Sort it with the characters.
- **Doors:** `door-battle`, `door-challenge`, `door-treasure` and `door-rest`.
  - 96 × 156, 2 frames: closed, then open.
  - `anchorPx` (48, 156) = the bottom-centre of the door cell, where the wall meets the floor.
  - Each has an icon on its own: `icon-<kind>`, 48 × 64.
- **Chest:** 104 px wide, 12 fps, layers `chest`, `chest-glow` and `chest-fx`.
  - `chest-closed`: 12 frames, loop.
  - `chest-open`: 30 frames, once. **Key frames for sound:**
    - anticipation 0–11 (a rising shimmer);
    - **lidBurst 12 (a pop and chime);**
    - beamPeak 14, glowPulse 16, starsRise 13–29, settled 29.
  - `chest-opened`: 12 frames, loop, the same size and anchor as `chest-open`.
  - All three anchor on the bottom-centre of the C tile.
- **Rest shrine:** `shrine` + `shrine-glow`, 8 frames at 8 fps, loop (or pulse the glow's alpha).

## Batch 5: boss door, `incoming-art/boss-door/sprites/static.json` (approved)

- **`door-boss`:** **160 × 172**, 2 frames: closed, then open.
  - `anchorPx` **(80, 172)** = the bottom-centre of the door cell.
  - The opening is 1 tile wide. The frame overlaps half a wall tile on each side, so draw it over those `wall-face` tiles.
- **`door-boss-glow`:** the same size and anchor, 8 frames at 8 fps, loop, see-through. Draw it on top while the door is closed and the room is being fought.
- **`icon-boss`:** 48 × 64, the crown medallion.
- **Use it on the 7th room's door** (the door into the Floor Keeper's room), replacing the borrowed battle door.

## Batch 6: customizable player, `incoming-art/player-custom/sprites/` [NEW]

- **Two bodies:** `body-a/player-a.json` and `body-b/player-b.json`.
  - Both use the same rig, the same 13 animations with the same frames, fps, key frames and `groundMotion` as Batch 1.
  - **128 × 160 frames, feet anchor (64, 136.96).**
  - Sheets are named `player-a_<layer>_<animation>.png` and `player-b_...`.
  - [OPEN] How the body is chosen and labelled is Jay's call. Use the ids `body-a` and `body-b`.

### Layers and tints

Drawing order is the `order` field (the Batch 1 layers moved up by one because `skin` was added at 1); the JSON lists each layer's `tint` and `group`.

| order | Layer | Tint | Notes |
| --- | --- | --- | --- |
| 0 | `body` | no | Outlines and the untinted base. Body B's longer lashes are in here |
| 1 | `skin` | **yes**, `palettes.skin` | Light neutral `#f2f2f2` |
| 2 | `gi` | yes, gi colour | Unchanged |
| 3–11 | `belt` … `belt-tape2` | as in Batch 1 | Unchanged. The belt is never customizable |
| 12–13 | `prop-broom`, `prop-rag` | no | As in Batch 1 |
| 14–19 | `face-01` … `face-06` | no | **Pick exactly one** (`group: "face"`). Shared by both bodies |
| 20–31 | `hair-01` … `hair-12` | **yes**, `palettes.hair` | **Pick exactly one** (`group: "hair"`). Two neutral greys in one layer (base and highlight); one multiply tint covers both |

- **How the pick-one groups work:** each option was rendered with only itself switched on and the base layers as holdouts. So draw the base layers, then the chosen face, then the chosen hair. Never draw two options from one group.
- **Palettes** (in the JSON, `palettes`): 10 skin tones from light to deep, 10 hair colours and 10 gi colours. White is first, and the 2nd gi colour is **charcoal `#4a4a55`** (it replaced black). The game shows exactly these as swatches.
  - [OPEN] The labels in `palettesDraftLabels` are placeholders. The real names come from the Content Writer.
- **Hair ids** (placeholders; [OPEN] names from the Content Writer):

| Id | Style |
| --- | --- |
| hair-01 | very short |
| hair-02 | short (the original) |
| hair-03 | curly |
| hair-04 | afro |
| hair-05 | two braids |
| hair-06 | ponytail |
| hair-07 | bun |
| hair-08 | tied back |
| hair-09 | two puffs |
| hair-10 | short twists |
| hair-11 | cornrows into braids |
| hair-12 | high-top fade |

- **Faces:** `face-01` to `face-06`. Every face has the light eye edge and the lighter mouth (the deep-skin fix).
- **Download size:** each option layer holds only its own pixels, so the game can load just the options chosen.
  - Per body: about 14.7 MB of base layers, 0.65–0.8 MB per face, and 1.4–3.6 MB per hair style.
  - One character is about 18 MB at 80 px per tile, before the import shrink.
  - Consider loading only the chosen face and hair (and maybe a smaller set of animations in menus).
- **Edges:** only the broom's bristle tip touches the bottom edge (`sweep` SE, frames 5–7, a few faint pixels, as in Batch 1). Nothing touches the top.
- [OPEN] **Later idea:** a small bounce for the puffs and ponytail. The hair is rigid on the head bone today.

## Batch 7: dojo people, `incoming-art/dojo-people/` [NEW, full set]

- **Characters (file ids):** `sensei`, `senpai`, `kohai`, `instructor-2` (Jay's wife, an instructor and the office manager, black belt) and `founder` (the school's founder). The display names and introductions come from the Content Writer. Where instructor-2 and the founder appear is for Jay and you.
- **Sheets:** `sprites/<id>/<id>.json`, in the same format as `player.json`.
  - Frames are 128 × 160 with the feet anchor at (64, 136.96), 80 px per tile, 8 directions (rows), the same as the player since Batch 6. Draw them with the same anchor code as the player.
  - Animations: `idle` (loop), `walk` (loop), `bow`, `talk` (loop, while a speech card is open), `nod` (once), `point` (once, **hold the last frame**; `holdLastFrame: true` in its entry), and `demonstrate` (Sensei and Senpai only, once).
  - `walk` has `groundMotion` like the player's walk: a stride per loop and a design speed of about 2 tiles/s (fps 22–34 per character). Keep fps = speed × `fpsPerTilePerSec` so the feet don't slide.
- **Layers** (in `layers` with `order` and `tint`):
  - `body` (order 0): untinted, real colours;
  - `gi` (1): multiply tint;
  - the player's belt set (2–10): tinted with `beltStyles`, exactly as the player;
  - for the founder only, `headband` (11): an optional untinted overlay, **off by default** (`optionalLayers.headband.default: false`). Draw it only when the game switches it on.
- **Default tints** (`suggested`):

| Id | gi | belt |
| --- | --- | --- |
| sensei | `#4a4a55` | `Black` |
| senpai | `#f2f2f2` | `Brown/Black` |
| kohai | `#f2f2f2` | `White` |
| instructor-2 | `#3f7fd0` | `Black` |
| founder | `#f2f2f2` | `Black` |

- **Portraits:** `portraits/<id>/<id>_portrait_<neutral|happy|proud|thinking>.png`, 512 × 512 transparent, flattened with the default tints (headband off).
  - For other gi or belt colours, or the headband, stack `layers/<id>_portrait_<expression>_<layer>.png` the same way as the sprites. The order, tints and belt styles are in `<id>_portraits.json`.
- **Collar:** every dojo character has a closed gi collar (Jay's school wears a shirt under the gi), so no skin shows at the neck.
- [OPEN] **The player's neck oval:** the Batch 6 player (and `player-character`) still has a small skin-coloured oval at the neck, on its skin layer. At game size it's about 4 × 4 px in walk and bow facing S and SE. Jay: leave it for now, and patch it later only if it's noticeable in the game. A patch is about 3 hours of rendering.
- **Download size:** about SIZE_MB MB of sheets and portraits for the five characters.

---

## Open items in one place

1. The player frame changed to 128 × 160 with the anchor at (64, 136.96). It applies to `player-character/` and `player-custom/`.
2. How the Batch 6 body is chosen and labelled (Jay).
3. Names for the faces, hair, palette swatches and bodies (Content Writer).
4. Puff and ponytail bounce (later).
5. Fonts are still Jay's choice (style guide section 9). There's no text in the art.
6. **[NEW]** The Batch 6 player's neck oval: leave it for now (Jay), and patch it later only if it's noticeable in the game.
7. **[NEW]** Where instructor-2 and the founder appear in the game (Jay and Claude Code), and their names (Content Writer).
