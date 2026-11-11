**ITEM.** G2B-44 Strike icons, exported for review. Not imported.

**WHAT.** Jay approved the six pictures on Nov 10. The Manager relayed his words: "Both the strike icons and the Ember Knight look good." This note is the strike icons only. Ember Knight is not in this folder. The approved drawings were not redrawn. `python3 incoming-art/icons-strikes/source/strike_icons.py --export` fits each approved medallion into the same sprite size as the seal icons. Files, all under `incoming-art/icons-strikes/sprites/`:

| # | Name | 128 px | 256 px |
| --- | --- | --- | --- |
| 1 | Spin Kick | `sprites/spin-kick.png` | `sprites/spin-kick@2x.png` |
| 3 | Butterfly Flow | `sprites/butterfly-flow.png` | `sprites/butterfly-flow@2x.png` |
| 4 | Side Kick Drive | `sprites/side-kick-drive.png` | `sprites/side-kick-drive@2x.png` |
| 5 | Hook Kick | `sprites/hook-kick.png` | `sprites/hook-kick@2x.png` |
| 6 | Lunge | `sprites/lunge.png` | `sprites/lunge@2x.png` |
| 7 | Spinning Finisher | `sprites/spinning-finisher.png` | `sprites/spinning-finisher@2x.png` |

Manifest: `sprites/static.json`. Names, numbers, and the curriculum lines are in that file. Each 1x file is 128 x 128, transparent PNG, anchor at the centre (64, 64). The outer 8 pixels are clear. Each @2x file is 256 x 256 with the outer 16 pixels clear. The source is `source/strike_icons.py`. There is no Blender file. These are the flat medallion drawings, the same Pillow kit as the seal icons. Strike #2 Jumping Spins is already exported at `incoming-art/icons-slots/sprites/jumping-spins.png` and is not copied here. Where a belt is drawn it is pine `#20705A`, the same placeholder already on Jumping Spins. It is not a rank.

**WHY.** The pictures are approved, so the Programmer needs a fixed-size set and a manifest before anyone imports them. The export only resizes. It does not change poses, limbs, or colours.

**DECIDE.** Manager, is this export ready for the Programmer to import? Nothing has been copied into the game.

**NEXT.** Manager says when to import. The Programmer follows `PROGRAMMER_HANDOFF.md`. Do not import from this note alone.

Checks on the written files: 12 PNGs, all the sizes above, all RGBA. Outer margin clear on every file (8 px at 128, 16 px at 256). Red pixels: 0. The same drawings were already checked at true 30, 36, and 40 px on `preview/sheet-g2b44-final.png`, and the exported 128 px files were checked again at those three sizes. No figure was clipped by the file edge.
