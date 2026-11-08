# Programmer handoff: PB-07 slot icons

Ready for the Manager to review. **Not imported.** Do not copy these into the game until the Manager says so. No game file was changed.

## What to import

Folder: `incoming-art/icons-slots/sprites/`

| File | Also | What it is |
|---|---|---|
| `sprites/counter.png` | `counter@2x.png` | Counter family medallion |
| `sprites/guard.png` | `guard@2x.png` | Guard family medallion |
| `sprites/strike.png` | `strike@2x.png` | Strike slot (kick on a pad) |
| `sprites/disarm.png` | `disarm@2x.png` | Disarm family medallion |
| `sprites/jumping-spins.png` | `jumping-spins@2x.png` | Jumping Spins, **pine belt placeholder** |
| `sprites/kata.png` | `kata@2x.png` | Kata slot |
| `sprites/lock.png` | `lock@2x.png` | Lock (not open yet) |
| `sprites/empty-slot.png` | `empty-slot@2x.png` | Empty Seal slot |

Manifest: `incoming-art/icons-slots/sprites/static.json`

Each 1x file is 128 x 128, transparent PNG, anchor at the centre (64, 64), one frame. The outer 8 pixels are clear. Each @2x file is 256 x 256 with the outer 16 pixels clear.

## Pine belt

The belt on Jumping Spins is **pine `#20705A`**, shade `#124A3A`. The Manager chose it as a placeholder so the icon can be judged in the game. **Jay did not pick the colour.** It is not a rank and it does not change the belt system. The other option, bronze `#A86A3A`, is not in `sprites/`. It is kept at `superseded/v5-pass7c-bronze-belt/jumping-spins.png`.

## Not in this export

Escape and Throw pictures are not drawn. Their rim colours are only in the sheet 1 key.

## How it was exported

`python3 incoming-art/icons-slots/source/build_seal_families.py --export`

That writes `sprites/<name>.png` and `sprites/<name>@2x.png` with the 8 px margin (16 px at @2x). The preview sheets need `incoming-art/tools/board_ui_kit.py` from PR #412, which is not in this branch. The export does not need it.

## Merge order

This pull request (#454) sits on the seal-icon branch that is also PR #419 (`bot-art-seal-families`). `incoming-art/icons-slots/` does not exist on `main`, so these files do not collide with `main`.

1. Merge **#454 into #419** first, so #419 carries the approved pictures and this export.
2. Merge **#419 into `main`** when the Manager wants the Programmer to import.

Merging #454 straight to `main` would also bring every #419 commit, because #454 already contains them. Do not merge both to `main` as if they were separate work. `main` was not merged into this branch: that would mix unrelated game commits into an art review, and it is not needed to look at these files.
