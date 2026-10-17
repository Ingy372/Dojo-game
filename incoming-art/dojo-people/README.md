# Sensei, Senpai and Kohai (Batch 7): technical sheet

**Status: SAMPLES.** Waiting for Jay's OK before the full set. The full set is all animations × 8 directions, plus 12 portraits.

The three are built by script on the **approved Batch 6 player models**, so they use the same rig, camera, toon light, outline width and belt layers.

```bash
blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/dojo-people/source/build_people.py -- \
    --who sensei --out $PWD/incoming-art/dojo-people/source/sensei.blend      # kohai: also from _a; senpai: from player_custom_b.blend
bash incoming-art/dojo-people/source/make_samples.sh                           # the sample sheets and 512 px portraits (about 15 min)
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
| Sensei | 1.28 | 0.80 | 120 |
| Senpai | 1.10 | 0.88 | 113 |
| Kohai | 0.84 | 1.06 | 91 |

- **Outline:** every outline is rebuilt, so the line stays the house 0.013 tiles (about 1 px) at every size.
- **Layers:**

| Order | Layer | Tint | What |
| --- | --- | --- | --- |
| 0 | `body` | no | Skin, face, hair, beard, in real colours. These characters don't change their look, so there's no skin or hair tint and no pick-one options |
| 1 | `gi` | **yes** | Neutral grey. A suggested gi colour is in the JSON (`suggested.gi`) |
| 2–10 | `belt`, `belt-sheen`, `belt-center`, `belt-center-edge`, `belt-rim`, `belt-tape1-edge`, `belt-tape1`, `belt-tape2-edge`, `belt-tape2` | as the player | Exactly the player's belt set. The game sets the real belt with `beltStyles` (option C) |

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
  - The samples have one expression (`neutral`). The full set will have 4.

## Looks (placeholders, see DECIDE in the Delivery Note)

| Id | Look |
| --- | --- |
| `sensei` | Adult, the tallest. Deep brown skin, close-cropped grey hair, a short neat grey beard along the jaw, calm almond eyes. Dark navy gi, black belt. Stands tall, hands relaxed at the sides |
| `senpai` | Teen, a little taller than the player (built on body B). Medium skin, a dark brown high ponytail. White gi, black belt. Weight a touch on one leg, one hand resting by the belt knot |
| `kohai` | Small child, the smallest, with a bigger head. Light skin, curly red hair, big round eyes. White gi, white belt. Feet close together, hands held together in front |

## Checks (samples)

- **Edges (script, every layer, frame and direction of the sample sheets):** nothing touches an edge.
  - The smallest top margin is Sensei's head, 26 px.
  - At the full punch, his fist is 15 px from the side edge (E and W).
  - The full set (talk, point) has room: 26 px above, and the 128 px width allows Sensei a full arm reach.
- **By eye:**
  - the line-up in 4 directions;
  - all three GIFs, frame by frame: the bow from the side (legs straight, head up) and the demonstration from S, SE and E;
  - the three portraits.
- **Found and fixed while building Senpai on body B:** `build_custom.py` (Batch 6) shrinks body B's ears with an object scale. That scales about the world origin, so the ears also moved down to the jaw. In this batch they are rebuilt in the right place (`build_people.py`). The approved Batch 6 body B sheets still have this. See the Delivery Note.
