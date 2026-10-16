# Art Director brief: Batches 5–9

**From:** Jay (written with Claude Code), 2026-10-16
**To:** the Art Director bot (folder `incoming-art/`, branch `bot-art`)

Read this whole brief before starting. It explains what to make next, in what order, and exactly how to deliver each piece so Claude Code can drop it straight into the game.

---

## 0. Where things stand

- **Batches 1–4 are approved and in the game** (live since 2026-10-16): the player character (all animations), the four Tier 1 creatures, the Home Dojo room and decorations, and the Tower room kit. Jay: "everything appears to be working properly."
- **Your style guide is approved.** It now lives at `docs/style-guide.md`. Follow it for everything below. Fonts (section 9) are still Jay's choice, so don't put any text in the art.
- **How your art is used:** Claude Code's import tool (`tools/art-import/`) reads your sheets and JSON, shrinks everything to **48 px per tile** (0.6×), trims empty space and packs it. So:
  - keep rendering at **80 px per tile**, exactly as before;
  - keep the **same JSON format** as Batches 1–4: character JSON like `player-character/sprites/player.json`, static JSON like `tower-rooms/sprites/static.json`;
  - details thinner than about 2 px at 80 px per tile disappear in the game. Keep shapes bold.
- **One change the game made to your art:** the defeat dissolve was hard to see on the light stone floor, so the game adds a golden flash and rising stars in code. Keep the dissolve design for future creatures. You don't need to make it bigger.

## 1. Your job and its limits (please read carefully)

**You are the design bot: you make pictures and animations, nothing else.**

- **You do NOT write content.** No names, descriptions, dialogue, story, quest text, lore or labels. If a piece of art needs a name or words, use a plain placeholder id in the file name (e.g. `sensei`, `hair-03`). Then list it under **DECIDE** in your Delivery Note, so Jay can send it to the Content Writer bot.
- **You do NOT design game rules.** No stats, numbers, abilities, enemy behaviour or new items. Draw only things that already exist in the game's data files (listed below). If something needs new rules, stop and ask Jay.
- **No text inside the pictures** (no letters, numbers or words). The only exceptions are the approved kanji 心 and 道 on the existing decorations.
- **Never edit anything outside `incoming-art/`.** Claude Code moves approved art into the game.
- **Before every big batch, deliver 3 samples and stop** until Jay approves them. That's the rule from `docs/GROK_BOTS.md`, and it saves you redoing work.
- Everything must pass section 10 of the style guide: kid-friendly for ages 6+, never frightening, real clean martial arts technique.

## 2. The order

| Batch | What | Why | Size |
| --- | --- | --- | --- |
| 5 | The boss door | Jay asked for it; the boss room borrows the battle door today | Small |
| 6 | The customizable player character | Needed for the character creation screen | Large |
| 7 | Sensei, Senpai and Kohai, with portraits | The Home Dojo characters who give quests | Large |
| 8 | Icons for gear, Insights, abilities and decorations | Menus still use plain text | Medium |
| 9 | The Yellow belt Tower room kit (no creatures yet) | The next belt's floors; art takes time | Medium |

Do them one at a time, in this order. Each one gets its own pull request and its own Delivery Note.

---

## Batch 5: the boss door

**Folder:** `incoming-art/boss-door/` (`source/`, `sprites/`, `preview/`, `README.md`, `DELIVERY_NOTE.md`).

**What it's for:** the room just before the Floor Keeper (the 7th room of a floor) has only one door: the door into the boss room. It should feel special and a little exciting. It is a big moment, but **never scary**.

**Where it goes in the game:**
- Exactly like the other doors: a `D` slot in the room's **top wall**, a **1-tile opening**. The game puts the door's anchor at the **bottom-centre of the door cell** (where the wall meets the floor).
- The opening must stay 1 tile wide (the player walks through it). The **frame around it may be bigger** than the other doors, about 2 tiles wide, rising higher above the wall. It may overlap the wall tiles on each side.
- Use the Tier 1 stone and the Floor Keeper's gold (`#ffd36b`), so it's clearly "the Keeper's door".

**What to deliver:**
1. **`door-boss`**: 2 frames like the other doors. Frame 0 is closed. Frame 1 is open: the doors slide apart and the doorway glows warm.
2. **`door-boss-glow`**: a separate layer, an 8-frame gentle glow loop (8 fps) around the frame and medallion. The game plays it while the door is closed and the room is being fought, so it reads as "the big one is behind here".
3. **`icon-boss`**: the medallion on its own (like `icon-battle`). Use a **crown** icon on a round medallion, the same style as the other four icons.
4. `static.json` entries in the same format as `tower-rooms/sprites/static.json`: `size`, `layers`, `files`, `frames`, `frameWidth`, `fps`, `loop`, `anchorPx` (bottom-centre of the door cell), `topExtraTiles`, `groundRect`, `note`.
5. Previews: the door in a tiled room next to the battle door (closed and open, at 1× and 2×), and a GIF of the glow loop.

**Samples first:** 3 still pictures of the closed door (3 different looks), then stop for Jay.

---

## Batch 6: the customizable player character

**Folder:** `incoming-art/player-custom/`.

**What it's for:** a character creation screen (and a "change your look" spot in the Home Dojo). Every student builds their own look from the same model. From `docs/core-design.md` section 13, "Character customization":
- layers: body, skin tone, face, hair style and hair colour, gi, belt;
- **every basic option is available to everyone from the start**;
- **the belt is never customizable.** It stays exactly as it is now (neutral, recoloured by the game to the real rank and stripes);
- the gi colour is recoloured by the game, as now.

**Build it on the approved player model and the approved animations.** Don't change any approved pose, timing, frame count or the feet anchor. The game already plays these 13 animations: `idle, walk, strike, counter, jab, bow, defeat, dash, hit, sweep, wipe, straighten, celebrate`. Every new layer must exist for **all 13 animations in all 8 directions**, rendered with the same holdout method, so stacking the layers rebuilds the picture with correct overlaps.

**How to split the layers (please follow this, it keeps the download small):**

| Layer | How it changes | Notes |
| --- | --- | --- |
| `skin` | **Tinted by the game** | Face skin, neck, hands, feet in a light neutral tone, like the belt and gi. Take it out of `body`. Test that dark tones still look good with a multiply tint; if multiply looks muddy, say so in DECIDE and propose another way |
| `face-01` … `face-06` | **Pick one** | Eyes, eyebrows, mouth. Friendly and expressive at small size. Different shapes, never "funny" or mocking |
| `hair-01` … `hair-08` | **Pick one**, tinted by the game | Neutral light grey so the game can recolour it. Cover a range: very short, short, curly, afro, braids, ponytail, bun, tied back. Hair must never cover the eyes (Jay's note from the character test) and must look right under a future headband |
| `body` | Always drawn | What's left: the base body that the gi covers, untinted |
| `gi`, `belt`, `belt-*`, `prop-*` | Unchanged | Keep exactly as approved |

- In the JSON, list the layers in drawing order with `tint: true/false`, and mark the face and hair options as a group, e.g. `"group": "hair"` (draw exactly one per group).
- Add a **`palettes`** section with recommended colours (hex):
  - about 10 skin tones covering the full range of real human skin;
  - about 10 hair colours (black, dark brown, brown, light brown, blonde, red, auburn, grey, plus 2 fun ones such as blue and purple);
  - about 10 gi colours (white first, then the colours real dojos use: black, blue, red and so on).

  The game shows exactly these as swatches.
- **Keep each option's pixels small:** a hair layer should contain only hair. The game loads every option, so empty or duplicated pixels cost download.

**Previews:**
- a grid of all faces × 3 skin tones;
- a grid of all hair styles × 3 hair colours;
- a "line-up" of 8 varied finished characters (different skin, face, hair, gi), each with a different real belt;
- GIFs of walk and celebrate for 2 of them.

**Samples first:** 3 finished characters in idle, facing S (front) and SE, then stop for Jay.

---

## Batch 7: Sensei, Senpai and Kohai

**Folder:** `incoming-art/dojo-people/`.

**Who they are** (from `docs/framework.md` section 9). This is all you need; their names, words and stories come from the Content Writer, not from you:
- **Sensei:** the wise, warm teacher. An adult, black belt, calm and kind, standing tall. Respected, never scary or stern-looking.
- **Senpai:** an older student (teen) who mentors the player and models good character. Confident and friendly. Brown/black or black belt.
- **Kohai:** a younger, newer student (a small child), eager and a little shy. White belt.

**How to build them:**
- Use the **same rig, camera, proportions style and animation quality** as the player, so they look like they belong in the same dojo. Sensei is taller, Senpai about player height, Kohai smaller.
- Give each a clearly different silhouette and hair at a glance, and a range of skin tones across the three.
- **The belt is its own neutral layer**, like the player's, so the game sets the correct belt. Keep the same belt layer set as the player (`belt`, `belt-sheen`, `belt-center`, `belt-rim`, tapes).
- Gi: their own gi colours are fine (Sensei could wear a darker or traditional gi). Use a tinted `gi` layer again.

**Animations** (8 directions, same JSON format as `player.json`):

| Animation | Notes |
| --- | --- |
| `idle` | Relaxed, natural standing (not a fighting stance); loop |
| `walk` | A calm walk, slower than the player's jog. Give `designSpeedTilesPerSecond` (about 2) and the stride, like the player's walk |
| `bow` | A proper standing bow, as approved for the player |
| `talk` | A gentle speaking gesture; loop. Played while a speech card is open |
| `nod` | Approving nod, once |
| `point` | Points/gestures toward something, once (e.g. "over there"); holds the last frame |
| `demonstrate` | **Sensei and Senpai only:** a slow, clean demonstration of a basic punch and block, once. Jay will judge it as real technique |

**Portraits** (for speech cards): head and shoulders, facing the viewer, rendered from the same models with the same lighting and outline.
- Each character in 4 expressions: `neutral`, `happy` (warm smile), `proud`, `thinking`.
- 512 × 512 px, transparent, the belt visible at the bottom edge if it fits (tinted layer, as above).
- Name them `<character>_portrait_<expression>.png` (plus belt layers if you split them).

**Previews:** a line-up of the three next to the player, a GIF of each animation, and a sheet of all 12 portraits.

**Samples first:** the three characters in idle (S direction) and one portrait each, then stop for Jay.

---

## Batch 8: icons

**Folder:** `incoming-art/icons/`.

**What it's for:** the menus (gear, the Insight choice, the Abilities tab, the dojo storage tray) currently show text only. Draw **one icon for each thing that already exists** in these data files (don't add or rename anything):

| Set | Data file | Ids (one icon each) |
| --- | --- | --- |
| Gear | `content/loot/gear.json` | `cloth-wraps`, `leather-wraps`, `tiger-wraps`, `training-gi`, `padded-gi`, `mountain-gi`, `jade-charm`, `lotus-charm`, `crane-charm` |
| Insights | `content/insights/insights.json` | `ripple-counter`, `iron-skin`, `wind-step`, `double-strike`, `quick-hands`, `press-the-advantage`, `shield-breaker`, `heavy-hands`, `rally` |
| Abilities | `content/abilities/abilities.json` | forms: `beginners-stance`, `rooted-form`, `flowing-form`; strikes: `follow-up-kick`, `quick-combo`; seals: `off-balance`, `escape-step`, `sweep`, `steady-breath`, `strong-block`, `sharp-eyes`, `create-distance`, `disarm`, `throw`, `follow-through`; virtues: `shield-of-respect`, `second-wind`, `perfect-discipline` |
| Decorations | `content/dojo/decorations.json` | all 11 (render the approved decoration models as icons) |

Each file's description field tells you what the thing does, so read it to choose a picture. If an icon's meaning is unclear, ask in DECIDE. Don't invent new effects.

**How:**
- **128 × 128 px** each, transparent, rendered from 3D models in the house style (same light, outline and palette), centred, with about 8 px of empty margin.
- **No rarity frame, background or border.** The game draws rarity colours itself (common `#d8d2c4`, uncommon `#5cd65c`, rare `#4ea3ff`, epic `#b46cff`, legendary `#ffb02e`), so the icon must read on any of them and on the dark menu colour `#221d2e`.
- **Group the icons by kind, so each kind looks like a family:**
  - **Forms:** the character in that stance;
  - **Seals:** a round seal medallion with a simple symbol;
  - **Virtues:** gold;
  - **Insights:** a glowing scroll style;
  - **Gear:** the object itself.
- Gear must be friendly. Hand wraps are wraps, not weapons; charms are small and pretty.
- Name them `icon-<id>.png` and list them in a `static.json` (format as Batches 3–4, `frames: 1`, anchor at the centre).

**Previews:** one sheet per set, shown at 1× and 2× on the dark menu colour and on each rarity colour.

**Samples first:** 3 icons (one gear, one Insight, one Seal), then stop for Jay.

---

## Batch 9: the Yellow belt Tower room kit

**Folder:** `incoming-art/tower-rooms-t2/`.

**What it's for:** each belt tier is a group of Tower floors. Tier 2 (the Yellow belt floors) should look clearly different from Tier 1's cool grey stone, so students feel they've climbed somewhere new, but it must be the same style and camera.

- **Same pieces, same sizes, same rules as `tower-rooms/`**: 3 floor tiles (80 × 80, seamless together), `wall-face`, `wall-block`, `pillar`, the 4 doors plus the boss door from Batch 5 (closed/open, same icons), the chest (closed idle, opening, opened idle, same timing and layers), and the rest shrine.
- **Your choice of theme.** Propose 2–3 ideas in your samples, e.g. warm sandstone, a bamboo garden temple, or sunrise clay. It should feel brighter and warmer than Tier 1, like moving up toward the light.
- Keep the floor **calm and medium-light**, so creatures, the red danger circle and the golden defeat effect stand out clearly on it. That was a lesson from Tier 1.
- **No new creatures yet.** Yellow belt creatures need their behaviour designed first, which isn't your job. When they're designed, Jay will send them to you as a separate brief.

**Previews:** a tiled room (like `review-1-tiled-room.png`) with the Tier 1 player and a Tier 1 creature standing in it, plus the doors and chest.

**Samples first:** a small tiled corner of each proposed theme (floor, wall, one pillar, one door), then stop for Jay.

---

## Delivery checklist (every batch)

- [ ] Files in the batch folder: `source/` (build scripts and .blend), `sprites/` (PNG and JSON for the game), `preview/` (review pictures only), `README.md` (technical sheet), `DELIVERY_NOTE.md` (WHAT / WHY / DECIDE / NEXT, in plain words for Jay).
- [ ] 80 px per tile, the fixed 35° camera, the house light and outline, straight-alpha transparent PNGs.
- [ ] Names in lower case with hyphens, matching the game's ids where one exists.
- [ ] Animations: `fps`, `frames`, `loop`, key frames and the feet `anchor` in the JSON, like Batch 1.
- [ ] Nothing clipped at the frame edge (run your clipping check).
- [ ] No text, names, story or game rules made up. Anything that needs words goes under DECIDE for Jay.
- [ ] `incoming-art/SOURCES.md` updated if anything outside the project was used (fonts, Mixamo).
- [ ] One pull request per batch on `bot-art`, and stop after the 3 samples until Jay approves.
