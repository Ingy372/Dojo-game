**ITEM.** G2B-44 Strike icons. Approved-design exports, ready for Manager review. Not imported.

**WHAT.** The Manager relayed Jay's Nov 10 quote: "Both the strike icons and the Ember Knight look good." This note did not witness that approval. It records the relay. The package is the strike icons only. Ember Knight is not in this folder. No import and no merge are authorized here. The six drawings were not redrawn for this export. `python3 incoming-art/icons-strikes/source/strike_icons.py --export` fits each drawing into the same sprite size as the seal icons. Files, all under `incoming-art/icons-strikes/sprites/`:

| # | Name | 128 px | 256 px |
| --- | --- | --- | --- |
| 1 | Spin Kick | `sprites/spin-kick.png` | `sprites/spin-kick@2x.png` |
| 3 | Butterfly Flow | `sprites/butterfly-flow.png` | `sprites/butterfly-flow@2x.png` |
| 4 | Side Kick Drive | `sprites/side-kick-drive.png` | `sprites/side-kick-drive@2x.png` |
| 5 | Hook Kick | `sprites/hook-kick.png` | `sprites/hook-kick@2x.png` |
| 6 | Lunge | `sprites/lunge.png` | `sprites/lunge@2x.png` |
| 7 | Spinning Finisher | `sprites/spinning-finisher.png` | `sprites/spinning-finisher@2x.png` |

Manifest: `sprites/static.json`. Names, numbers, and the curriculum lines are in that file. Each 1x file is 128 x 128, transparent PNG, anchor at the centre (64, 64). The outer 8 pixels are clear. Each @2x file is 256 x 256 with the outer 16 pixels clear. The source is `source/strike_icons.py`. There is no Blender file. These are the flat medallion drawings, the same Pillow kit as the seal icons. Strike #2 Jumping Spins is already exported at `incoming-art/icons-slots/sprites/jumping-spins.png` and is not copied here. Where a belt is drawn it is pine `#20705A`, the same placeholder already on Jumping Spins. It is not a rank.

**WHY.** The Manager asked for the approved designs as an export he can review. The export only resizes. It does not change poses, limbs, or colours. It does not put the files in the game.

**DECIDE.** Manager, do these exports pass your review? This note does not authorize import or merge.

**NEXT.** After that review, the Manager says whether anyone may import. The Programmer follows `PROGRAMMER_HANDOFF.md` only if the Manager authorizes import. Do not import or merge from this note.

Checks on the written files: 12 PNGs, all the sizes above, all RGBA. Outer margin clear on every file (8 px at 128, 16 px at 256). Red pixels: 0. The same drawings were already checked at true 30, 36, and 40 px on `preview/sheet-g2b44-final.png`, and the exported 128 px files were checked again at those three sizes. No figure was clipped by the file edge.
