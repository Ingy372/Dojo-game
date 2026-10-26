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
blender -b -P build_town_square.py -- --part lights --out render_lights@2x.png --samples 8   # dusk glow mask (A4-2)
python3 make_concept.py --far render_far@2x.png --town render_town@2x.png --outdir ../concept --variant day
python3 make_concept.py --far render_far@2x.png --town render_town@2x.png --outdir ../concept --variant dusk
```

## Pipeline notes
- toon_kit with an ortho camera looking north at 35° down, outline #14121c, Cycles 24 samples.
- The town layer is 80 ppt at @2x and 40 ppt at 1x. That is zoomed out from the game's 48 ppt so the whole square fits in one phone frame.
- An ortho camera has no perspective, so the Tower is a separate far layer. It is rendered at full scale, then shrunk, hazed toward the sky colour, and put behind the hedge line. The town layer is moved down 0.95 tiles to make room for sky, which crops part of the front paving row.
- Red check (HSV: hue <0.03 or >0.97, saturation >0.6, value >0.4): 0 px in all four PNGs.

## A4-2 update (Jay's feedback)
- **Main dojo** (left, teal noren): unchanged on purpose. It will be remodelled on the real Action Zone building when photos arrive.
- **Shop** (middle): a friendly open-front shop with a gold-and-cream striped awning, a counter with baskets of goods, shelves of jars, crates, hanging lanterns, and a blank round sign showing a basket picture. No prices, no text, no red.
- **Placeholder** (right): plain grey massing with a flat roof, a door block and two lit windows. It is a stand-in only.
- **Tower**: tiers are about 1.4x wider, taller roof and light, scaled 0.92 in the composite (was 0.68), with less haze and more contrast. It reads clearly above the hedge now.
- **Dusk**: a deep indigo-to-rose sky and the scene dimmed toward blue-violet. Windows, door glows and lanterns are kept at full warm brightness with a soft glow, using an emission mask (`--part lights`), and the Tower light glows.
- Statue unchanged (generic).
- Dusk: `python3 make_concept.py --far render_far@2x.png --town render_town@2x.png --lights render_lights@2x.png --outdir ../concept --variant dusk`

## A4-3 update (Jay's notes)
- **Day, livelier:** a little river runs through the square from a waterfall in the hills. It has stone banks, ripples and sparkles, lily pads with white and yellow flowers, and orange, white and gold koi (no red), plus a small arched wooden bridge with lanterns at each end. Behind the town is a world to explore: rolling hills with winding paths, a windmill, a striped lighthouse, a waterfall with a pool and a footbridge, soft pink cherry trees, banners, a glimpse of a little village, kites and a few birds. The far layer is now rendered 1.4x wider so it fills the whole skyline.
- **Evening, cozier:** warm pools of light on the ground under every lantern, lamp and window, warm lantern reflections on the river, and about 34 fireflies.
- Main dojo unchanged (photos pending). The shop, the placeholder and the statue are unchanged. No characters, no text, no red.

## A4-4 update (Jay's notes): more dojo game, every night light has a source
- **Day:** removed the windmill, lighthouse, kites and village glimpse. Kept fewer cherry trees and made the hill paths quieter. Plain dojo banners on the hill (no text). A small practice pavilion sits on the right hill, mostly behind the placeholder. Kept the river, bridge, koi, lily pads and waterfall.
- **New martial-arts touches:**
  - A practice yard with a wooden floor and sand border, three makiwara posts with padded tops, and two plain nobori banners (no text).
  - A balance beam.
  - A weapons rack with wooden bo staffs and padded mitts only (no blades).
  - Stepping stones across the river.
- **Night:** every light now has a source. Light pools sit under the dojo lanterns and door, the shop lanterns and front, the placeholder windows, the two lamp posts and the bridge lanterns. The bridge lanterns now stand on the banks, and their reflections fall straight below them. There are 16 fireflies, all near the water. I removed the lighthouse glow, the extra pool on the river and the river sparkles (the town is rendered with `--night`, which leaves them out). The Tower light is kept.
- Dusk build: `blender -b -P build_town_square.py -- --part town --night --out render_town_night@2x.png` and `--part lights --night`. Then pass `--town render_town_night@2x.png` to make_concept.py.
- Main dojo, shop, placeholder and statue are unchanged. No characters, no text, no red.

## A4-5 status
- **Day: approved by Jay.** Unchanged in this update.
- **Dusk: final tweak.** Added 12 subtle fireflies across the square, by the hedges, trees, practice yard and bridge, on top of the 16 by the water (28 in total). Every other glow still comes from a real source. Only the dusk image was re-rendered (1x and @2x).
