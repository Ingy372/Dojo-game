# Seal families (PB-07 samples)

**Status: samples only, v4 (Guard and Disarm redrawn to a premium bar; see below).** Three preview sheets for Jay to OK before the full set is drawn. No game files are touched. No sprites exported yet: Jay approves first.

The folder is `incoming-art/icons-slots/`, the path the PB-07 spec names (it was moved from `incoming-art/seal-families/` with `git mv`).

**What changed in v4 (Jay: "Disarm's ankle looks broken. Guard's hands look really weird. Good enough is not OK, we want premium"):** only Guard and Disarm were redrawn. See `preview/05-before-after-v3-v4.png` (old and new, large, zoomed on the hand and the foot, at 40 and 30 pt, grey and on the wall). The v3 versions are kept in `superseded/v3-icons/`.
- **Guard** is a front-view high-guard block. Each forearm is a sleeve, then a cuff band, then a **clear skin wrist** (narrower than the cuff and the fist), then ONE closed mitten fist: a soft rounded square with a single thumb crease drawn inside the outline. There is no separate thumb shape, nothing sticks out of the silhouette, and no finger lines. The old fists were big blobs with a thumb bump that read as thumbs-up, and the sleeve ran straight into them.
- **Disarm** is a real front snap kick. Shin, ankle and shoe are drawn once in a standing frame and rotated together, so the shin runs straight into the ankle and cannot kink. The foot is flexed about 90 degrees as in a real front kick, with the sole facing the stick. The shoe is a blue foam sparring bootie with a gold tape collar and a pale sole with a clear round heel. The old shoe was a disjointed boot with an odd collar and a disconnected leg. The burst on the sole is the hit, the source of the glow. The padded stick tumbles away.
- **Digit check:** Guard shows 2 fists. Each has 0 visible fingers and 0 extra thumb shapes (1 thumb crease inside the outline). Disarm shows 0 fingers and 0 toes (toeless shoe, one foot). Checked large, in a zoom of each hand and foot, and at 30 pt.
- **30 pt check:** Guard reads as a kid with two raised fists. Disarm reads as a kick on a stick, a shoe sole with a burst and the stick flying away. Both also hold up in grey and on the wall. Sheet 04 is unchanged and now reads the v3 Guard and Disarm from `superseded/v3-icons/`.
- No sprites exported; Jay approves first. Strike and Jumping Spins still use the v3 shoe, and Counter the v3 fist. Say so if they should match the new look.

**What changed in v3 (Jay: the medallions looked rough, a foot had 6 toes, Guard looked like a nightmare):** hands and feet are now clean and chunky in the Archero / Pokemon spirit. Fists are one **mitten** shape with a thumb and no finger lines. Feet are **shoes** (blue upper, cream sole and collar) with no separate toes, and the Kata footprints have no toes either. **Guard is redrawn from scratch** as a friendly "guard up" pose: smiling kid, both mitten fists at the chin, forearms in front of the chest, a soft blue shield behind. The crossed-arms pose is gone. See `preview/04-before-after-v2-v3.png` (old and new, large and at 30 pt). The old v2 icons are kept in `superseded/v2-icons/`.

**What changed in v2 (manager answers):** each family keeps its own rim colour, and Escape is now green-teal so it sits clearly apart from Counter's blue. The Disarm picture shows a padded training stick (foam pad, tape bands, wood grip) instead of a knife.

PB-07 (in `drafts/planning/R-PROGRESSION-BETA.md`) replaces G2B-03. It asks for 5 Seal family medallions (Counter, Guard, Escape, Disarm, Throw), a Lock silhouette, the Strike and Kata slot glyphs, an empty-slot piece and the Jumping Spins icon.

## The four sheets (each shown large and at real size)

| # | File | Shows |
|---|---|---|
| a | `preview/01-family-medallions.png` (+ `@2x`) | Counter, Guard and Disarm. Large, 64 and 40 pt on paper, on the Board wall, in grey, plus the rim-colour key (Escape and Throw shown as colour only) |
| b | `preview/02-lock-and-slot-glyphs.png` (+ `@2x`) | Lock, Strike glyph, Kata glyph, empty Seal slot. Large, in a mock slot row, 48 and 32 pt, in grey |
| c | `preview/03-jumping-spins.png` (+ `@2x`) | Jumping Spins. Large, next to the plain Strike glyph, 64, 48 and 32 pt on paper, grey and wall |
| d | `preview/04-before-after-v2-v3.png` (+ `@2x`) | Old v2 next to new v3 for every icon: large, 30 pt, 40 pt, grey 30 pt and on the wall at 30 pt |
| e | `preview/05-before-after-v3-v4.png` (+ `@2x`) | v4: Guard and Disarm, old v3 next to new v4: large, close-up of the hand and foot, 40 pt, 30 pt, grey and wall |

The `@2x` files are the true pixels. The 1x files are the same sheets at phone points.

## How the icons are built
- Round medallion: pale outer ring, coloured rim, cream face, dark outline, one simple symbol. This is the same family as the existing seal icons.
- The rim colour is the family cue: Counter blue, Guard leaf green, Escape green-teal, Disarm purple, Throw rose, Lock grey. Strike is gold, Kata brown. Hues (degrees): Counter 207, Escape 164, Guard 100, Disarm 263, Throw 328. There is no red and no orange. Orange stays for ENTER THE TOWER.
- Every glow has a real source (the burst is the hit). Nothing is drawn above a head.
- Hands and feet (v3): sleeves flare at the cuff and a wrist shows. A fist is ONE chunky mitten shape with a thumb across the front (no finger lines) and points the way the strike goes. A foot is a chunky training shoe (blue upper, cream sole strip and ankle collar), side view, with the sole toward the target. No separate toes anywhere. Anatomy count per icon: Counter 1 fist; Guard 2 fists; Disarm 1 shoe; Strike 1 shoe; Jumping Spins 2 fists and 2 shoes; Kata 5 toe-less footprints.
- Real technique: Counter = spinning back fist. Guard = guard up (both forearms raised in front of the chest, fists at the chin) with a shield. Disarm = a front kick that knocks a padded training stick away (foam pad, no blade). Strike = front kick on a kick pad. Jumping Spins = a jumping spin kick.
- Sprite spec when exported: 128 x 128 transparent PNG (plus @2x), with the 8 px margin kept clear. `--export` writes them to `sprites/`. Not run yet, so no sprites are committed.
- The look of the previews (warm wood wall, cream paper cards, INK text, Nunito) is the Board look from PR #412.

## Rebuild
```
python3 incoming-art/icons-slots/source/build_seal_families.py
```
Needs Pillow and numpy only. **It also needs PR #412 merged**, because it imports `incoming-art/tools/board_ui_kit.py` (the Board look). This PR does not copy that file, so it cannot clash with #412.

Files: `source/toon.py` (drawing kit), `source/seal_icons.py` (the icons), `source/build_seal_families.py` (the three sheets), `source/make_before_after.py` (sheet 4; Pillow only, no #412 needed), `source/make_before_after_v4.py` (sheet 5; Pillow only).
