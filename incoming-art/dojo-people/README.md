# Dojo people (Batch 7): technical sheet

**Status: FULL SET** (2026-10-17). These are five characters: `sensei`, `senpai`, `kohai`, `instructor-2` and `founder`. Each has 8-direction sheets for every animation, plus 512 px portraits in 4 expressions.

They are built by script on the **approved Batch 6 player models**, so they share the rig, camera, toon light, outline width and belt layers.

```bash
blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/dojo-people/source/build_people.py -- \
    --who sensei --out $PWD/incoming-art/dojo-people/source/sensei.blend      # kohai, founder: also from _a; senpai, instructor-2: from _b
bash incoming-art/dojo-people/source/make_full.sh                              # all sheets + raw portraits (about 35 min, 2 Blender lanes)
python3 incoming-art/dojo-people/source/make_people_full_preview.py            # portraits/<id>/ and every preview
```

`make_samples.sh` and `make_people_preview.py` made the earlier samples, and they still work.

## Files

| Path | What |
| --- | --- |
| `sprites/<id>/<id>.json` + `<id>_<layer>_<animation>.png` | The sheets, in the same JSON format as `player.json`: 8 rows (directions) × frames, 128 × 160 per frame |
| `portraits/<id>/<id>_portrait_<expression>.png` | 512 × 512 transparent portraits, flattened with the default gi and belt (the founder's headband off) |
| `portraits/<id>/layers/<id>_portrait_<expression>_<layer>.png` + `<id>_portraits.json` | The same portraits as layers, to tint like the sprites |
| `preview/` | The line-ups, `portrait-sheet.png`, `instructor-2-ponytail-3x.png`, `founder-headband.png`, and `gif/<id>_<animation>.gif` (every animation, all 8 directions) |
| `source/` | The build scripts and the five `.blend` files |

## How they're made

- **Frames:** 128 × 160 px, feet anchor (64, 136.96), 80 px per tile, the 35° camera. This is the same as all player art since Batch 6.
- **Height:** the whole rig is scaled, and the head bone is scaled back the other way, so heads stay about the player's size.

| Character | Rig scale | Head scale | On-screen height, idle S (render px) |
| --- | --- | --- | --- |
| Player (for comparison) | 1 | 1 | 106 |
| Sensei | 1.28 | 0.80 | 125 (with the hair swept up) |
| Senpai | 1.10 | 0.88 | 113 |
| Kohai | 0.84 | 1.06 | 91 |
| instructor-2 | 1.20 | 0.84 | 115 |
| Founder | 1.26 | 0.81 | 118 |

- **Outline:** every outline is rebuilt, so the line stays the house 0.013 tiles (about 1 px) at every size.
- **Layers** (sprites and portraits alike):

| Order | Layer | Tint | What |
| --- | --- | --- | --- |
| 0 | `body` | no | Skin, face, hair and beard, in real colours. These characters keep their look, so there's no skin or hair tint |
| 1 | `gi` | **yes** | Neutral grey, multiplied by the gi colour (`suggested.gi`) |
| 2–10 | `belt`, `belt-sheen`, `belt-center`, `belt-center-edge`, `belt-rim`, `belt-tape1-edge`, `belt-tape1`, `belt-tape2-edge`, `belt-tape2` | as the player | Exactly the player's belt set. The game sets the belt with `beltStyles` (option C) |
| 11 | `headband` | no | **Founder only.** The red headband, an optional overlay drawn last. **Off by default** (`optionalLayers.headband.default: false`) |

- **Defaults** (`suggested` in each JSON):

| Id | Gi | Belt |
| --- | --- | --- |
| `sensei` | charcoal `#4a4a55` | `Black` |
| `senpai` | white `#f2f2f2` | `Brown/Black` |
| `kohai` | white `#f2f2f2` | `White` |
| `instructor-2` | blue `#3f7fd0` | `Black` |
| `founder` | white `#f2f2f2` | `Black` |

## Animations (8 directions each)

| Animation | Frames | fps | Who | Notes |
| --- | --- | --- | --- | --- |
| `idle` | 8 | 8 | all | Relaxed, natural standing; each character has a small personality touch (approved). Loops |
| `walk` | 12 | 22–34 | all | A calm walk (2 steps per loop), about 2 tiles/s. See the table below. Loops |
| `bow` | 20 | 16 | all | 1.25 s. It starts and ends on the relaxed idle. Legs straight, the bend only from the hips, head up, eyes forward |
| `talk` | 16 | 10 | all | A gentle speaking gesture: the right hand rises a little in a calm beat, with small head nods. Loops while a speech card is open |
| `nod` | 12 | 12 | all | An approving nod, once: two nods, the second smaller. Tag `down` on frame 4 |
| `point` | 14 | 12 | all | Points forward and to the character's right ("over there"), once. **Hold the last frame** (`holdLastFrame: true`); the point is reached on frame 8 |
| `demonstrate` | 28 | 12 | Sensei, Senpai | The approved demonstration: a parallel stance, a left inside-to-outside middle block, then a right middle punch with the other fist pulled back to the hip. Block on frames 9–12, punch on frame 15, held on 15–19 |

**Walk:** the step scales with each character's size, and the fps is chosen so a loop moves at about 2 tiles/s. The JSON's `groundMotion` gives the stride and the design speed, like the player's walk. Planted feet stay still when fps = speed × `fpsPerTilePerSec`.

| Id | fps | Stride per loop (tiles) | Design speed (tiles/s) |
| --- | --- | --- | --- |
| `sensei` | 22 | 1.075 | 1.97 |
| `senpai` | 26 | 0.924 | 2.00 |
| `kohai` | 34 | 0.706 | 2.00 |
| `instructor-2` | 24 | 1.008 | 2.02 |
| `founder` | 23 | 1.058 | 2.03 |

## Portraits

- **Size and framing:** 512 × 512 px, transparent, head and shoulders facing the viewer, with the belt at the bottom edge. They use the same models and light, a front camera (5°), and framing fitted to each character.
- **Expressions:**
  - `neutral`: a soft closed smile;
  - `happy`: a big warm smile with a little head tilt;
  - `proud`: chin and chest up, brows lifted, a wide closed smile;
  - `thinking`: head tilted, one brow up, a small side mouth, and the right hand to the chin.
- **How the expressions are made:** the mouths are all in the model (`expr_<set>_*`), and `source/portrait_prep.py` shows one set with `PORTRAIT_EXPR` and moves the brows.
- **Size-related changes:** `portrait_prep.py` also makes, in memory only, smoother curves (subdivision: 2 levels on the head and hands, 1 on the gi, so it stays crisp cloth instead of puffy) and a thinner outline (0.006 tiles, about 3–4 px).

## The gi collar (all five characters)

Jay's school wears a shirt under the gi, so no skin shows except the face, hands and feet. The Batch 1 model had a skin oval in the neck opening (`chest_v`), which read as a hole. `build_people.py` removes it, fills the opening with gi cloth (`gi_collar_fill`) on the tinted gi layer, and re-lays the lapels to cross high on the chest, left over right. The under lapel ends where the over lapel covers it. The lapels stay a lighter tone of the gi, as a subtle line. The portraits use the same geometry, and the old portrait-only neck tweak is gone. The player (Batch 6) still has the oval; see the Delivery Note.

## Looks (approved by Jay)

| Id | Look |
| --- | --- |
| `sensei` | A friendly cartoon likeness of Jay, based on reference photos provided by Jay (not stored in the repo). A young adult, the tallest. Light skin, short brown hair (short sides, a tousled top swept up at the front), bold black rectangular glasses (with temple arms back over the ears), a light brown moustache and short chin beard, a big warm smile. Charcoal gi (#4a4a55), black belt. Stands tall, hands relaxed at the sides |
| `instructor-2` | A friendly cartoon likeness of Jay's wife, based on reference photos provided by Jay (not stored in the repo). Built on body B. An adult, between Senpai and Sensei in height. Fair skin with light freckles, blue-grey eyes, dark brown hair with a middle part, pulled back into a low ponytail tied at the back of the head. The ponytail is purple (baked in, her request, her signature look). It sweeps round her left side and forward over her LEFT shoulder, so a purple length lies on the front of her chest in front views and portraits. A big warm smile. Medium blue gi (#3f7fd0), black belt. The ponytail below the tie hangs from the chest bone, so it follows her in the bow |
| `founder` | A friendly cartoon likeness of the school's founder, based on reference photos provided by Jay (not stored in the repo). Built on body A. An older adult, about Sensei's height. Tanned olive skin, short wavy dark hair going grey at the temples, a full grey-and-dark moustache with light stubble, crinkly smiling eyes with smile lines, a broad toothy smile. White gi, black belt, an optional red headband (its own layer, off by default). A solid, relaxed stance |
| `senpai` | Teen, a little taller than the player (built on body B). Medium skin, a dark brown high ponytail. White gi, brown/black belt (Jay). Weight a touch on one leg, one hand resting by the belt knot |
| `kohai` | Small child, the smallest, with a bigger head. Light skin, curly red hair, big round eyes. White gi, white belt. Feet close together, hands held together in front |

## Checks

- **Edges** (script, every layer, frame and direction): nothing touches a frame edge.
  - The smallest margin is 3 px, at the far foot of the walk stride facing E/W for Sensei and the founder.
  - Everything else has at least 10 px (Sensei's hair and the punch).
- **By eye:**
  - the 8-direction contact sheets of every animation: the bow (legs straight, head up), the walk (planted feet, arms swinging opposite the legs), talk, nod, point (the hold), and the demonstration for Sensei and Senpai;
  - all 20 portraits;
  - the ponytail in 8 directions, idle and mid-bow (it stays on her back and follows the bow).
- **The ponytail:** it lies over her left shoulder and down the front of her chest, so it reads from the front (S, SE, SW) and in all 4 portraits. From the side and back, you see it going round her neck and the purple root at the tie. Nothing clips in any frame (checked by eye: the bow, the walk's arm swing, point and talk), and it follows her in the bow.
- **The collar:** no skin at the neck in any frame or portrait.
- **Sizes:**
  - sheets: about 36 MB (Sensei 8.9, Senpai 8.2, founder 7.2, instructor-2 6.4, Kohai 5.3);
  - portraits with layers: 6.5 MB;
  - previews and GIFs: 15 MB.
- **Reference photos:** none are in the repo or the previews.
