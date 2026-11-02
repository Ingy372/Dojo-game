# Town Growth v3: five steps from run down to FULLY MAXED, then the Blue picture for good (A-TOWN-GROWTH)

Jay's direction (Nov 1): the town changes were not special enough. New arc: town growth is **capped at Blue**. White is a little run down, then the town climbs step by step (White, Yellow, Orange, Green, Blue) to a **fully maxed hero town at Blue**. Each step is meant to be a clear "wow, it changed" moment. **Red and above have no town art of their own: they reuse the Blue picture.** (The Content Designer owns a different mechanic for those belts.) **The gold flame is dropped.**

**Samples only for now:** White (run down), Green (clearly upgraded) and Blue (fully maxed), each in day and dusk, plus a side-by-side sheet. Yellow and Orange are planned and not built.

Jump to: [Structure for the Programmer](#structure-for-the-programmer) | [The arc](#the-arc) | [Techniques used](#techniques-used-and-where-they-come-from) | [What is here](#what-is-here) | [How it is built](#how-it-is-built) | [Rules and checks](#rules-and-checks)

![samples](previews/samples-sheet.png)

## Structure for the Programmer

**One complete town background per belt, in a day and a dusk version. Nothing stacks.** (Same structure as v2.)

1. Every picture is the whole town frame (1864x860 at @2x, 932x430 at 1x, the same frame and camera as the approved town square). It already has the sky, hills, Tower and **the Action Zone dojo drawn in its slot**.
2. Show the picture for the player's **own highest earned belt** (day or dusk to match the time of day). When the belt changes, **swap the whole picture**. Do not draw one belt on top of another.
3. Draw characters, effects and UI **on top**. The town art is only the background.
4. **Town art stops at Blue.** Red, Red/Black, Brown, Brown/Black and Black all show the **Blue** picture. In `stages/stages.json` those five belts are `"built": false, "useStage": "blue"` and have no `files`. Yellow and Orange are not built yet and say `"useUntilBuilt": "white"`.
5. Each phone draws its own town from its own belt. Other players never change it.

`stages/stages.json` is the lookup: per belt `order`, `belt`, `built`, `statue`, `notes`, and either `files` (day and dusk, @2x and 1x), `useStage` (Red to Black: use Blue) or `useUntilBuilt`.

## The arc

| # | Belt | The "wow" | Statue | Status |
|---|---|---|---|---|
| 1 | White | A little run down but friendly. Cool grey overcast sky, faded and washed colours, weak shadows, a boarded window and a patched awning, a patched bridge plank, weedy empty beds, murky water with one koi, cracked stones, **an empty plinth**. Lamp posts and the dojo and shop windows are lit at dusk; the tall lanterns are off. | No (empty plinth) | **built** |
| 2 | Yellow | The clean-up: boards and patches gone, tidy beds, water clearer, first colour coming back. | No | planned, not built (until then show White) |
| 3 | Orange | The shop opens: chimney, warm lights, a fuller town (about the approved concept level). | No | planned, not built (until then show White) |
| 4 | Green | **Clearly upgraded.** Sky turns bright blue, fresh vivid grade, warm cream paving, **the statue is unveiled** with two stone lanterns (lit at dusk), lush flower beds, window boxes, blossoming hedges, bunting across the river, a gold roof flag, a bridge garland, one more koi, soft cast shadows and a thin warm rim light. | Yes | **built** |
| 5 | Blue | **FULLY MAXED hero town (the last town picture).** Golden-hour grade with violet shadows and long soft shadows, **five cherry-blossom trees** with a petal carpet and a few drifting petals, **four stone lanterns** around the statue, **two tall banners** and **two roof flags**, a bigger bunting line, a golden paving ring, lotus flowers and more koi and lily pads, chimney smoke, sun shafts and motes, bloom on the statue and lanterns. At dusk: a few fireflies and the lanterns glowing. | Yes | **built** |
| 6 | Red | **Use the Blue picture.** No town art of its own. | Yes | use Blue |
| 7 | Red/Black | **Use the Blue picture.** | Yes | use Blue |
| 8 | Brown | **Use the Blue picture.** | Yes | use Blue |
| 9 | Brown/Black | **Use the Blue picture.** | Yes | use Blue |
| 10 | Black | **Use the Blue picture.** | Yes | use Blue |

No gold flame, no extra effects: town growth is finished at Blue.

## Techniques used (and where they come from)

Looked up before building, and copied where they fit this frame:

1. **A coherent colour grade per stage** (Pokemon, Club Penguin, Slay the Spire). White is desaturated and cool grey with a heavier vignette. Green is fresh and vivid. Blue is warm golden hour with violet shadows. One grade, one mood, per step, so each step reads as a new "place".
2. **Warm, saturated, readable palettes and clean shapes** (Pokemon, Club Penguin). Cream paving, strong greens, blossom pink, gold. Every prop keeps a simple silhouette.
3. **Crisp dark outlines** (Archero, Survivor.io). The approved toon outline (inverted hull) is kept on everything.
4. **Soft cast shadows plus ambient occlusion** (Archero, Survivor.io drop shadows). A separate clay render of the town lit by one sun gives soft shadows that fall up and right, cooler on the ground, lighter on props. The sun gets lower in later stages (longer shadows at Blue).
5. **Painterly light and rim light** (Slay the Spire). Lit surfaces get a warm tint, shadows a cool tint. A thin warm **rim line** runs along edges that face the light (from a height render of the scene), so roofs, hedges, props and paving edges "pop" off the ground.
6. **Play space vs scenery contrast** (Archero, Survivor.io). The back lawn, hills and hedges are about 6% darker and cooler than the plaza, and a soft vignette pulls the eye to the plaza where characters walk.
7. **Bloom on a few hero props only** (Pokemon, Club Penguin). Just the statue (richer gold, a soft halo) and the stone lanterns. Nothing else glows in the day.
8. **Banners, flags and bunting.** Roof flags, two tall banners and a bunting line across the river, in teal, blue, gold and cream (no red).
9. **Painterly texture.** Faint low-frequency blotches and a fine grain take the flat 3D look off the surfaces. Soft painted clouds and a per-stage sky (flat grey, bright azure, peach golden hour).
10. **Ambient-ready elements** (all stay static in the picture, but are built as separate shapes so the Programmer can animate later): bunting, flags and banners (wave), cherry petals (drift), chimney smoke (rise), koi and lotus (move), lantern flames (flicker), motes and fireflies (float).
11. **Subtle dusk.** Same picture, then a gentle dusk grade. Glow comes only from lit windows, stone lanterns, lamp posts, the shop and the Tower. A handful of fireflies at Blue only.

## What is here

| Path | What |
|---|---|
| `stages/1-white-day.png`, `...-dusk.png` (and `@2x`) | White backgrounds |
| `stages/4-green-day.png`, `...-dusk.png` (and `@2x`) | Green backgrounds |
| `stages/5-blue-day.png`, `...-dusk.png` (and `@2x`) | Blue backgrounds, **also used for Red to Black** |
| `stages/stages.json` | The belt-to-picture lookup (Red to Black = use Blue) |
| `previews/samples-sheet.png` | The 3 stages side by side, day on top and dusk below |
| `source/` | The build scripts |
| `superseded/` | The first overlay set and the v2 set (Orange, the old Blue, the v2 White and the v2 docs). **Do not use.** Nothing was deleted. |
| `DELIVERY_NOTE.md` | Item, what, why, decide, next, the check results and the spec mismatches |

## How it is built

Run `bash incoming-art/town-growth/source/render_all.sh` from the repo root (Blender 4.2, Pillow, numpy and scipy; at most 2 Blender processes at once).

- `source/build_town_stage.py` (Blender) runs the approved town-square build and changes it for one stage (statue removed in White, wear in White, upgrades in Green and Blue). Seven passes per stage: `day`, `night` (dusk town), `lights` (mask of lit things, the source of every glow), `props` (mask of added objects, for the lanes check), `shade` (clay render under one sun: shadows), `height` (surface height: rim light) and `hero` (mask for bloom).
- `source/make_stages.py` (Pillow, numpy) builds the sky, clouds and hazy far hills, composites the town and the dojo sprite, applies shadows, rim, bloom, the stage grade, scenery contrast and the vignette, then the effects and the dusk step. It writes `stages/` and `stages.json`.
- `source/make_sheet.py` makes the side-by-side sheet.

## Rules and checks

- Kid-friendly (ages 6+). Nothing is drawn above the characters' heads. **No red anywhere except the CMA sign's brand red.**
- Everything added stays out of the walkable lanes (the strip in front of the buildings and the bridge). The river and the flower beds are exempt. Petals, shafts and motes stay out of that strip.
- Every glow has a real source (lit window, stone lantern, lamp post, shop, Tower).
- The statue and plinth are the approved ones, unchanged. They are hidden before Green and shown from Green.
- The photos used as likeness reference are not in the repo.
- Results of the checks are in `DELIVERY_NOTE.md`.
