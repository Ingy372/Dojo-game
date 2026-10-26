# Town square concept (A4)

One concept picture of the dojo town square, so Jay can approve the look before anything is built.

## Files
- `concept/town-square-concept-932x430.png` and `@2x.png`: the main concept (day).
- `concept/town-square-concept-dusk-932x430.png` and `@2x.png`: optional golden-hour variant.
- `source/build_town_square.py`: the Blender toon_kit scene. `--part town` is the square, `--part far` is the hills and the Tower.
- `source/make_concept.py`: composites the sky gradient, the hazed far layer (scaled to 0.68) and the town, then writes 1x and @2x. Use `--variant day|dusk`.
- `source/render_{far,town}@2x.png` and `town-square_{far,town}.blend`: the raw layers.

## What's in it
- Three classmates' dojos along the back. Each has an open shoji door with a warm glow, a coloured noren curtain (teal, violet and blue) and paper lanterns.
- The Student of the Month statue at the centre: a faceless, generic gold-stone figure in the ready stance, on a round plinth with a gold star.
- The Tower in the distance, with one restored light fragment glowing at the top.
- Trees, benches, flower beds and lamps.
- No characters, no text, no red.

## Rebuild
```
cd incoming-art/town-square-concept/source
blender -b -P build_town_square.py -- --part far  --out render_far@2x.png  --samples 24
blender -b -P build_town_square.py -- --part town --out render_town@2x.png --samples 24
python3 make_concept.py --far render_far@2x.png --town render_town@2x.png --outdir ../concept --variant day
python3 make_concept.py --far render_far@2x.png --town render_town@2x.png --outdir ../concept --variant dusk
```

## Pipeline notes
- toon_kit with an ortho camera looking north at 35° down, outline #14121c, Cycles 24 samples.
- The town layer is 80 ppt at @2x and 40 ppt at 1x. That is zoomed out from the game's 48 ppt so the whole square fits in one phone frame.
- An ortho camera has no perspective, so the Tower is a separate far layer. It is rendered at full scale, then shrunk, hazed toward the sky colour, and put behind the hedge line. The town layer is moved down 0.95 tiles to make room for sky, which crops part of the front paving row.
- Red check (HSV: hue <0.03 or >0.97, saturation >0.6, value >0.4): 0 px in all four PNGs.
