# Certified trophy seal: layers and school-mark spec

Script: `source/make_a3_seal.py` (run from `incoming-art/`). Layers in `sprites/trophies/certified-layers/`. Manifest entry: `certified-trophy-layered` in `sprites/static.json`.

## Layers (all 104x166 px, anchor [52,156], draw bottom to top)
| # | Layer | File(s) | Notes |
|---|---|---|---|
| 1 | Base (cup + stand + plinth + blank date plate + halo + sparkles) | `trophy-base.png` | One layer. Date plate [26,134,62,148] stays blank; the game writes the date. |
| 2 | Seal backing (scallop, face, ring, ribbon tails) | `seal-backing-default.png`, `seal-backing-actionzone.png` | Picked by the school's palette. Unknown school = `default` (gold + sky blue, same as PR #138). |
| 3 | School mark | `seal-mark-default-star.png`, `seal-mark-PLACEHOLDER-school.png` | Default = the A3 star. PLACEHOLDER = grey checker in a dashed ring. **Never ship the placeholder.** |

## School mark spec (for the Programmer and other dojos)
- **Format:** square PNG, **128x128** (64x64 minimum), RGBA, transparent background, sRGB.
- **Safe area:** keep the whole mark inside the centred circle of **diameter 112 px** (8 px margin). Template: `school-mark-TEMPLATE-128.png` (the blue circle is the edge, the orange circle is the safe area; the guides are not part of the mark).
- **Placement:** the game scales the 128 canvas down to the safe circle (16x16 px at 1x, 32x32 at 2x) and centres it on the seal at (76,130) on the trophy canvas. Reference code: `mark_from_file()` in the script.
- **Readability:** it shows at 16 px. Use bold, simple shapes. Small text will not read. Check it against your face colour.
- **House rules:** no red, kid-safe.
- **Palette for the backing (4 hex values):** `scallop`, `face`, `faceRing`, `tail`. Defaults: `#d68c14 #ffd34d #fff5be #4096eb`. Action Zone: `#191a3e #efeadc #c9a227 #c9a227` (from actionzonecma.com CSS, see SOURCES.md).

## DECIDE
- Who supplies the Action Zone mark file (Jay), and whether the school wants it on trophies at all.
- Whether the AZ seal shows the default star until the logo arrives (review-4, right), or the trophy uses the full default seal (left).
- How other dojos send the palette and mark (a config file, an admin upload?). That is the Programmer's call, not art.
