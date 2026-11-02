# Seal families (PB-07 samples)

**Status: samples only, manager answers applied (v2).** Three preview sheets for Jay to OK before the full set is drawn. No game files are touched. No sprites exported yet: Jay approves first.

The folder is `incoming-art/icons-slots/`, the path the PB-07 spec names (it was moved from `incoming-art/seal-families/` with `git mv`).

**What changed in v2 (manager answers):** each family keeps its own rim colour, and Escape is now green-teal so it sits clearly apart from Counter's blue. The Disarm picture shows a padded training stick (foam pad, tape bands, wood grip) instead of a knife.

PB-07 (in `drafts/planning/R-PROGRESSION-BETA.md`) replaces G2B-03. It asks for 5 Seal family medallions (Counter, Guard, Escape, Disarm, Throw), a Lock silhouette, the Strike and Kata slot glyphs, an empty-slot piece and the Jumping Spins icon.

## The three samples (each shown large and at real size)

| # | File | Shows |
|---|---|---|
| a | `preview/01-family-medallions.png` (+ `@2x`) | Counter, Guard and Disarm. Large, 64 and 40 pt on paper, on the Board wall, in grey, plus the rim-colour key (Escape and Throw shown as colour only) |
| b | `preview/02-lock-and-slot-glyphs.png` (+ `@2x`) | Lock, Strike glyph, Kata glyph, empty Seal slot. Large, in a mock slot row, 48 and 32 pt, in grey |
| c | `preview/03-jumping-spins.png` (+ `@2x`) | Jumping Spins. Large, next to the plain Strike glyph, 64, 48 and 32 pt on paper, grey and wall |

The `@2x` files are the true pixels. The 1x files are the same sheets at phone points.

## How the icons are built
- Round medallion: pale outer ring, coloured rim, cream face, dark outline, one simple symbol. This is the same family as the existing seal icons.
- The rim colour is the family cue: Counter blue, Guard leaf green, Escape green-teal, Disarm purple, Throw rose, Lock grey. Strike is gold, Kata brown. Hues (degrees): Counter 207, Escape 164, Guard 100, Disarm 263, Throw 328. There is no red and no orange. Orange stays for ENTER THE TOWER.
- Every glow has a real source (the burst is the hit). Nothing is drawn above a head.
- Limbs read as limbs (from Jay's notes): sleeves flare at the cuff, a wrist shows, and fists have finger bands and a thumb. Fists point the way the strike goes (knuckles forward). Feet are drawn sole-on, with a heel pad, ball and five toes.
- Real technique: Counter = spinning back fist. Guard = cross block (forearms crossed, fists up). Disarm = a front kick that knocks a padded training stick away (foam pad, no blade). Strike = front kick on a kick pad. Jumping Spins = a jumping spin kick.
- Sprite spec when exported: 128 x 128 transparent PNG (plus @2x), with the 8 px margin kept clear. `--export` writes them to `sprites/`. Not run yet, so no sprites are committed.
- The look of the previews (warm wood wall, cream paper cards, INK text, Nunito) is the Board look from PR #412.

## Rebuild
```
python3 incoming-art/icons-slots/source/build_seal_families.py
```
Needs Pillow and numpy only. **It also needs PR #412 merged**, because it imports `incoming-art/tools/board_ui_kit.py` (the Board look). This PR does not copy that file, so it cannot clash with #412.

Files: `source/toon.py` (drawing kit), `source/seal_icons.py` (the icons), `source/build_seal_families.py` (the sheets).
