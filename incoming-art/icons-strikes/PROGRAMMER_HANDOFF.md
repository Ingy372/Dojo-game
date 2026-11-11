# Programmer handoff: G2B-44 Strike icons

Approved-design exports, ready for Manager review. **Not imported.** This handoff does not authorize import or merge. No game file was changed.

The Manager relayed Jay's Nov 10 quote: "Both the strike icons and the Ember Knight look good." That quote was relayed. It was not witnessed here. This folder is the strike icons only.

## Files in the export

These are the files a later import would use. Do not copy them into the game unless the Manager authorizes import after reviewing this package.

Folder: `incoming-art/icons-strikes/sprites/`

| File | Also | What it is |
| --- | --- | --- |
| `sprites/spin-kick.png` | `spin-kick@2x.png` | #1 Spin Kick |
| `sprites/butterfly-flow.png` | `butterfly-flow@2x.png` | #3 Butterfly Flow |
| `sprites/side-kick-drive.png` | `side-kick-drive@2x.png` | #4 Side Kick Drive |
| `sprites/hook-kick.png` | `hook-kick@2x.png` | #5 Hook Kick |
| `sprites/lunge.png` | `lunge@2x.png` | #6 Lunge |
| `sprites/spinning-finisher.png` | `spinning-finisher@2x.png` | #7 Spinning Finisher |

Manifest: `incoming-art/icons-strikes/sprites/static.json`

Each 1x file is 128 x 128, transparent PNG, anchor at the centre (64, 64), one frame. The outer 8 pixels are clear. Each @2x file is 256 x 256 with the outer 16 pixels clear.

## Not in this export

Strike #2 Jumping Spins is already at `incoming-art/icons-slots/sprites/jumping-spins.png`. It was not redrawn and it was not copied into this folder.

## How it was exported

`python3 incoming-art/icons-strikes/source/strike_icons.py --export`

That writes `sprites/<name>.png` and `sprites/<name>@2x.png`. There is no `.blend` file. The drawings are the Pillow medallion script in `source/strike_icons.py`.

## Belt

Where a belt is drawn it is pine `#20705A`. That is the same placeholder already used on Jumping Spins. It is not a rank.
