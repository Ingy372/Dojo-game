# Delivery Note: A3c, the school logo on the trophy seal

## What's in it
- **`badges-trophies-a3/sprites/trophies/certified-layers/seal-mark-school.png`**: the new school-mark layer, 128 × 128 RGBA on a transparent background (SEAL_SPEC).
  - It uses **only the red cross and the kicking figure** from Jay's logo. The ring text and the name plate are left out.
  - It's trimmed and centred. Its furthest pixel is 54.4 px from the centre, inside the 56 px safe circle.
  - For 16 px, the figure has a thin light keyline (so the black reads against the red), and the whole mark has a thin dark outline (so the red reads on the paper face).
  - The cross colour is the logo's own red, sampled from the file.
- `seal-mark-school-placed.png`: the same mark already placed on the 104 × 166 trophy canvas (via `mark_from_file()`).
- **Re-exported every trophy that uses the seal (31):**
  - all 30 certified trophies in A3b, as `badges-trophies-a3b/sprites/trophies/school/<id>.png`, with the Action Zone backing and the school mark. Each `static.json` entry gets `files.imgSchool`. The default-seal `img` stays as the fallback for unknown schools.
  - `ct-accolade-student-of-the-month.png` was baked with the AZ backing and the star stand-in. It now has the school mark in place (its `img` and `imgSchool` are the same).
  - the A3 sample: `badges-trophies-a3/sprites/trophies/certified-trophy-school.png`.
  - `static.json` (A3): `certified-trophy-layered` → `schoolMark.files.school`.
- Script: `badges-trophies-a3c/source/make_a3c_logo.py`, run from `incoming-art/`. The source logo files are in `source/jay-logo/` (inside incoming-art only). SOURCES.md records them as Jay's own school logo.

## Previews (`badges-trophies-a3c/preview/`)
- `review-1-trophy-wall-default-vs-school-1x.png` / `-2x.png`: every trophy before (default seal) and after (school seal).
- `review-2-trophy-wall-phone-390px.png`: phone width.
- `review-3-seal-closeup-1x-6x.png`: the seal at 1×–6×, plus the 128 px mark.
- `mark-512.png`, `greyscale-1-trophy-wall.png`.

## Check at seal size
- At 1× (16 px) the cross reads clearly on the paper face, with the figure as a dark shape across it. The kick itself only shows from 2× up. At this size the details can't survive, so the shapes are kept bold.

## DECIDE
- **Red:** the house rule is "no red", but the cross is red in Jay's logo, so it's kept as the logo's own red. Jay to confirm, or ask for a gold or indigo cross.
- **Palette:** the backing is the Action Zone palette (#146), and the logo's name plate is a different school name. Which palette goes with this logo, and the school id for `seal-mark-<school>`, are for Jay and the Programmer. The file is `seal-mark-school.png` for now.
- Whether `img` for all trophies should switch to the school seal, or stay default with `imgSchool` per school (the Programmer's call).
