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
- **Download size:** about 36 MB of sheets (5.3–8.9 MB per character) plus 6.5 MB of portraits with layers. The flattened portraits alone are about 2 MB.

---

## Batch 8: icons, `incoming-art/icons/sprites/static.json` [NEW, full set]
- 28 icons, `icon-<id>.png`, 128 x 128, frames 1: 9 gear, 9 Insights, 10 Seals; ids exactly as in the brief. Map each to the existing id; no new ids. Second pass (2026-10-24) redrew 8 icons; same ids and files.

### Insight colour key [UPDATED K7-art2]
Same ids, file names, 128 x 128 size, anchor (64, 64) and static.json. Only the 9 Insight PNGs changed. If the UI tints or labels Insights, use these accents:

| Insight id | accent / glow colour | symbol |
|---|---|---|
| `ripple-counter` | sky blue `#4096eb` | a water drop falling into rings |
| `iron-skin` | slate grey `#6e7c96` | a solid riveted shield |
| `wind-step` | mint `#3cc896` | a footprint with wind lines |
| `double-strike` | orange `#ff921e` | two lightning bolts |
| `quick-hands` | sunny yellow `#fad628` | an open hand with speed lines |
| `press-the-advantage` | violet `#9660e6` | a double forward chevron |
| `shield-breaker` | cyan `#1ebace` | a shield cracked in two |
| `heavy-hands` | brown `#965c32` | a round kettlebell weight |
| `rally` | lime green `#82cd32` | a flag with a star |

## Batch 9: Yellow belt Tower kit, `incoming-art/tower-rooms-t2/sprites/static.json` [NEW, full set]
- Working label **Sunrise Garden** (was "Bamboo Garden Hall"; folder name unchanged; final name is Jay's call). Same sprite ids, layers, anchors and timing as Tier 1 `tower-rooms/` + `boss-door/` (boss door merged into the same static.json), so Tier 2 rooms can load this folder instead.
- Extra optional decor: `decor-lantern`, `decor-bamboo-pot`, `decor-basin`. Chest is the Tier 1 chest (Jay OK'd). Tower working label: Sunrise Garden (planner pick, drafts/planning/S1-tier2-name-and-guarding-aura.md). `proposals/` is reference only; do not load.

## S1 #3 elite auras, `incoming-art/elite-auras/sprites/static.json` [NEW, full set, Jay approved]
- Overlay layers per tier-1 enemy: `sprites/<enemy>/aura-{swift,guarding}_{back,front}.png` (entries `aura-<kind>-<enemy>` in static.json). 8 frames, loop at 10 fps, same frame size + anchor as the enemy, so stack 1:1.
- Draw order: aura back -> enemy -> aura front. Swift = gold, Guarding = blue. Nothing above the head (no badges). Game rules (who becomes elite, effects, 1 per room) come from the S1 brief, not from the art.
- The 256 masters `sprites/aura-<kind>_<layer>.png` are reference only.
- **[NEW] Guarding links** (same static.json, from `source/make_guard_links.py`):
  - `guard-tether-beam` (64 x 24, 8 frames @ 10 fps): repeat (or stretch) along x from the guarder's ground point to the protected enemy's ground point, rotated to that angle, line centre at y = 12. `guard-tether-cap` (24 x 24, centre 12,12) on both ends.
  - `guard-protected-<enemy>`: foot glow per tier-1 enemy, same frame + anchor as the enemy, drawn just before the enemy.
  - `guard-tether-snap` (64 x 64, 4 frames @ 12 fps, once): at each line's midpoint when the guarder is defeated, while the lines and glows fade (~0.2 s).
  - Layer order: floor -> tether + foot glows -> red danger circle -> aura back -> enemies -> aura front. Blue never covers the red circle. Range/count/damage rules come from the planning doc, not the art.
- `aura-sparkle-gold` is a PROPOSAL only (possible rare named monster). Do not wire.

## Tier 2 enemies and elite auras
- If Tier 2 (Sunrise Garden) reuses the Tier 1 creatures, the existing elite aura sheets in `incoming-art/elite-auras/sprites/<enemy>/` (Swift, Guarding, Guarding foot glow) apply as-is.

## M7-N1 named monster, `incoming-art/named-monster/sprites/static.json` [NEW, batch 2]
- Draw order: name-plate (under the feet, fades after 3 s) -> enemy -> named-sparkle. Once the plate is gone, `name-tag` fades in above the head at `headOffsetPx[enemy]` (the only thing above any head). The game renders all names and text.
- **Final tells** (each sheet is one row at the enemy's frame size and anchor; played during the normal wind-up, which keeps its length):
  - brute `brute/tell-stamp-dust.png`: 6 frames at 15 fps; play at 0.0 s and 0.4 s of the 0.8 s wind-up, with a 2 px shake for 0.12 s each (off when reduced motion is on, pending Jay). Draw it under the enemy.
  - swarmer `swarmer/tell-dash-trail.png`: 6 frames at 10 fps over the 0.6 s wind-up, then hold the last frame until the dash ends. It is drawn facing +x, so rotate it about the anchor to the dash angle. Loop `tell-dash-trail-tile.png` (64 x 24) for longer dashes. Draw it under enemies, over the danger circle.
  - shield `shield/tell-shield-tap.png`: 4 frames at 20 fps; play at 0.0, 0.233 and 0.467 s of the 0.7 s wind-up, plus the clank sound. Shift it by `offsetPerFramePx[dir][current wind-up frame]` (new: the shield rises during the wind-up, so the flash must follow it; `offsetPerDirectionPx` is frame 0 only) and draw it over the enemy.
- Always pick enemy and effect frames as whole numbers from real time and each animation's own fps (see `make_tells.py` `state()`). Never use a fractional frame index. Sheet sizes, anchors and timings are unchanged.
- `name-tag.headOffsetPx` covers the idle, wind-up and attack poses, so the tag stays fixed during tells.
- Stickers in `sticker/` are final (die-cut style).
- Journal parts in `journal/` with layout slots in static.json; stickers in `sticker/` (final, wall items).

## A1 earned cosmetics, `incoming-art/cosmetics-a1/` [NEW, SAMPLES only, do not wire yet]
- Body A, idle only. Layers in `sprites/body-a/player-a.json` (same frames, anchor and directions as `player-custom/sprites/body-a`): `gi-trim` (tint), `headband` (tint), `wraps-cloth` / `wraps-leather` / `wraps-tiger` (group `wraps`, no tint).
- Aura: `sprites/body-a/aura.json`, with `aura-back` (drawn before all player layers) and `aura-front` (after). Both are tinted. Reduced motion: frame 0 only.
- Draw order: aura-back, player layers, gi-trim, headband, wraps, aura-front. Reference: `source/cosm_lib.py compose()`. The belt is unchanged and never customizable.
- Names, unlock rules and colours are open (see `cosmetics-a1/DELIVERY_NOTE.md`).
## A5 Bouncy Bopper (padded-weapon enemy), `incoming-art/enemy-padded-weapon/` [NEW]
**Full set (2026-10-24), re-import all of it:** idle, windup, attack, move, hit, stagger and defeat, in 8 directions. The body was redrawn a little bigger and brighter, and the front (S) attack was opened up, so idle, windup and attack changed too. Use the name "Bouncy Bopper" (PR #97 C8, `drafts/content/enemies/bopper.json`). The asset id and file names stay `padded`. Numbers follow PR #102: windup 8 frames at 10 fps (16 ticks), attack 11 frames at 10 fps with `keyFrames.impact` 0 (recovery frames 2-10), and move is springy hops at 2.2 tiles/s. Hit is 3 frames at 12 fps, stagger is 8 frames at 10 fps looping, and defeat is 14 frames at 12 fps (a kid-safe poof into a light orb and soft sparkles, like Tier 1; `keyFrames` light 3 and gone 13, and the last frame is empty). There is no drop animation: when it is disarmed, just stop drawing the weapon layer. **Disarmed attack: `pushpaw`** (11 frames at 10 fps, the same pose and timing as attack with an empty paw, impact on frame 0). It has no weapon sheet. Play `windup` first, with the weapon layer hidden. It is a weak hit; its power is the game's number. The staff scales away with the body in defeat.
Earlier sample notes: idle, windup and attack, in 8 directions. The frame is 192 and the anchor is (96, 142). The layers are body, glow, telegraph and light, the same as Tier 1, plus a new `weapon` layer drawn after body. **To show disarmed, skip the weapon layer.** The telegraph works like Tier 1 (`telegraphIntensity`). There is no content json yet, and the stats in the script are placeholders. See its README.md.

## A7 QA fixes (PR #83): re-import [NEW]
- `player-custom/sprites/body-a/` and `body-b/`: **re-import the `face-01` … `face-06` sheets** (all animations). They have a bigger, lighter eye ring, a second shine and a lighter mouth. Frames, anchors and layer names are unchanged.
- `player-custom/sprites/body-*/player-*.json`: `palettes.hair[0]` ("black") is now `#34303f` (it was `#1f1a1c`). Nothing else in the JSON changed.
- `dojo-people/sprites/kohai/` (all sheets and `kohai.json`) and `dojo-people/portraits/kohai/`: re-import. The kohai now has a curly top-knot with a teal tie, baked into the `body` layer.
- UI suggestion from QA, not done here: give dark swatches a light border.

## A6 decoration samples (S7-rev pool), `incoming-art/decor-pool-a6/sprites/static.json` [NEW, SAMPLES only, do not wire yet]
6 sample pieces (class scroll, kick pad, keeper statue, journal trophy, fan stand, folding screen 2x1) in the Home Dojo format: same camera and 80 px tiles, with `footprint`, `place` (floor or wall) and `anchorPx` like `home-dojo/sprites/static.json`. Ids are working ids, not names. See the DELIVERY_NOTE for DECIDE.

## Open items in one place

1. The player frame changed to 128 × 160 with the anchor at (64, 136.96). It applies to `player-character/` and `player-custom/`.
2. How the Batch 6 body is chosen and labelled (Jay).
3. Names for the faces, hair, palette swatches and bodies (Content Writer).
4. Puff and ponytail bounce (later).
5. Fonts are still Jay's choice (style guide section 9). There's no text in the art.
6. **[NEW]** The Batch 6 player's neck oval: leave it for now (Jay), and patch it later only if it's noticeable in the game.
7. **[NEW]** Where instructor-2 and the founder appear in the game (Jay and Claude Code), and their names (Content Writer).
8. **[NEW]** A1 cosmetics: names (Content Writer), unlock rules and colours (Jay), and the headband fit over big hair.
9. **[NEW]** A5 Bouncy Bopper: Jay approved the 192 px frame, the lime accent, and hiding the staff to show disarmed (2026-10-24). The full set is delivered. Jay's calls (2026-10-24): disarmed uses a weak **push-paw** attack, and the asset files keep the `padded` names. Still to decide: HP, power and the push-paw's power after the balance run (PR #102), and which seals use it.
10. **[NEW]** A7: Jay approved the kohai top-knot, the teal tie and `#34303f` as black (2026-10-24). Only the swatch border (Programmer) is still open.
12. **[NEW]** A6 decoration pool: DECIDE the class-piece mix, names (Content Writer), the 5 random kinds and colours, the floor statues, the journal trophy approach and placement rules.
