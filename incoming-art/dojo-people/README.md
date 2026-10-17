# Dojo people (Batch 7): technical sheet

**Status: SAMPLES 2.** Waiting for Jay's OK before the full set. The full set is all animations × 8 directions, plus 4 portraits per character.

There are five characters: `sensei`, `senpai`, `kohai`, `instructor-2` and `founder`. They are built by script on the **approved Batch 6 player models**, so they use the same rig, camera, toon light, outline width and belt layers.

```bash
blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/dojo-people/source/build_people.py -- \
    --who sensei --out $PWD/incoming-art/dojo-people/source/sensei.blend      # kohai, founder: also from _a; senpai, instructor-2: from _b
bash incoming-art/dojo-people/source/make_samples.sh                           # the sample sheets and 512 px portraits (ONLY="..." for some)
python3 incoming-art/dojo-people/source/make_people_preview.py --sheets incoming-art/dojo-people/sprites/samples \
    --player incoming-art/player-character/sprites --out incoming-art/dojo-people/preview
```

The sample sheets in `sprites/samples/` aren't committed (`.gitignore`); only the previews are for review.

## How they're made

- **Frames:** 128 × 160 px, feet anchor (64, 136.96), 80 px per tile, the 35° camera. This is the same as all player art since Batch 6.
- **Height:** the whole rig is scaled, and the head bone is scaled back the other way, so heads stay about the player's size. That gives the adult adult proportions and the small child a bigger head for their size.

| Character | Rig scale | Head scale | On-screen height, idle S (render px) |
| --- | --- | --- | --- |
| Player (for comparison) | 1 | 1 | 106 |
| Sensei | 1.28 | 0.80 | 125 (with the hair swept up) |
| Senpai | 1.10 | 0.88 | 113 |
| Kohai | 0.84 | 1.06 | 91 |
| instructor-2 | 1.20 | 0.84 | 115 |
| Founder | 1.26 | 0.81 | 118 |

- **Outline:** every outline is rebuilt, so the line stays the house 0.013 tiles (about 1 px) at every size.
- **Layers:**

| Order | Layer | Tint | What |
| --- | --- | --- | --- |
| 0 | `body` | no | Skin, face, hair, beard, in real colours. These characters don't change their look, so there's no skin or hair tint and no pick-one options |
| 1 | `gi` | **yes** | Neutral grey. A suggested gi colour is in the JSON (`suggested.gi`) |
| 2–10 | `belt`, `belt-sheen`, `belt-center`, `belt-center-edge`, `belt-rim`, `belt-tape1-edge`, `belt-tape1`, `belt-tape2-edge`, `belt-tape2` | as the player | Exactly the player's belt set. The game sets the real belt with `beltStyles` (option C) |
| 11 | `headband` | no | **Founder only.** An optional overlay (`optional: true`), the red headband, drawn last. It's off by default in the previews |

- **Animations in the samples:**

| Animation | Frames | fps | Who | Notes |
| --- | --- | --- | --- | --- |
| `idle` | 8 | 8 | all | Relaxed, natural standing. Loops |
| `bow` | 20 | 16 | all | 1.25 s. It starts and ends on the relaxed idle |
| `demonstrate` | 28 | 12 | Sensei | 2.33 s. Block on frames 9–12, punch on frame 15, held on 15–19 |

  - **The bow** follows Jay's rules: heels together, legs straight (natural, not locked), a 30° bend only from the hips with a straight back, head up and eyes forward, hands at the sides of the thighs.
  - **Sensei's demonstration** is slow, so it reads as a lesson, in this order:
    1. a natural parallel stance (heiko-dachi), fists ready in front of the belt;
    2. a left inside-to-outside middle block, with the right fist chambered at the hip;
    3. a right middle punch to the centre line at chest height, while the left fist pulls back to the hip (hikite). The elbow stays soft, not locked, and the shoulders stay level;
    4. back to ready, then the relaxed stance.
- **Portraits:** 512 × 512 px, head and shoulders, facing the viewer. They use the same models and light, with the belt layers at the bottom edge (tinted, as above).
  - Rendered with `tools/render_sprites.py` and a front camera (5°). The framing is fitted to each character.
  - `source/portrait_prep.py` makes two changes for the big size, in memory only:
    - curves are smoothed (subdivision);
    - the outline is thinner, 0.006 tiles (about 3–4 px instead of 7).
  - Likeness characters (Sensei, instructor-2, founder) have two expressions in the samples: `happy` (the big toothy smile) and `neutral` (a soft closed smile). The two mouths are both in the model, and `portrait_prep.py` shows one, chosen by `PORTRAIT_EXPR=neutral|happy`. Senpai and Kohai use their player face, so they have one portrait each. The full set will have 4 expressions.

## Looks (see DECIDE in the Delivery Note)

| Id | Look |
| --- | --- |
| `sensei` | A friendly cartoon likeness of Jay, based on reference photos provided by Jay (not stored in the repo). A young adult, the tallest. Light skin, short brown hair (short sides, a tousled top swept up at the front), bold black rectangular glasses, a light brown moustache and short chin beard, a big warm smile. Dark navy gi, black belt. Stands tall, hands relaxed at the sides |
| `instructor-2` | A friendly cartoon likeness of Jay's wife, based on reference photos provided by Jay (not stored in the repo). Built on body B. An adult, between Senpai and Sensei in height. Fair skin with light freckles, blue-grey eyes, long straight dark brown hair past the chest with purple ends (baked in, mostly on her left), a big warm smile. Charcoal gi (placeholder), black belt. The long hair below the jaw hangs from the chest bone, so it follows her in the bow |
| `founder` | A friendly cartoon likeness of the school's founder, based on reference photos provided by Jay (not stored in the repo). Built on body A. An older adult, about Sensei's height. Tanned olive skin, short wavy dark hair going grey at the temples, a full grey-and-dark moustache with light stubble, crinkly smiling eyes with smile lines, a broad toothy smile. White gi, black belt, an optional red headband (its own layer). A solid, relaxed stance |
| `senpai` | Teen, a little taller than the player (built on body B). Medium skin, a dark brown high ponytail. White gi, brown/black belt (Jay). Weight a touch on one leg, one hand resting by the belt knot |
| `kohai` | Small child, the smallest, with a bigger head. Light skin, curly red hair, big round eyes. White gi, white belt. Feet close together, hands held together in front |

## Checks (samples)

- **Edges (script, every layer, frame and direction of the sample sheets):** nothing touches an edge.
  - The smallest top margin is Sensei's hair, 21 px. instructor-2 has 30 px and the founder 26 px.
  - At the full punch, his fist is 15 px from the side edge (E and W).
  - The full set (talk, point) has room: at least 21 px above, and the 128 px width allows Sensei a full arm reach.
- **By eye:**
  - the line-up in 4 directions;
  - all GIFs, frame by frame: the bow from the side (legs straight, head up; instructor-2's long hair stays with her body) and the demonstration from S, SE and E;
  - all the portraits, neutral and happy, and the founder's headband in 4 directions.
  - Samples 2 re-rendered only Sensei, instructor-2 and the founder. Senpai's belt change is a tint, so her previews were re-composited from the samples-1 sheets.
- **Found and fixed while building on body B:** `build_custom.py` (Batch 6) shrinks body B's ears with an object scale. That scales about the world origin, so the ears also moved down to the jaw. In this batch they are rebuilt in the right place (`build_people.py`). The approved Batch 6 body B sheets still have this; Jay decided to leave Batch 6 as it is.
