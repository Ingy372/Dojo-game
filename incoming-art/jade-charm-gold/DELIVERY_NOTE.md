# Delivery Note - Jade Charm icon: red cord and tassel changed to gold

Held for Jay's OK. Please don't import yet. The order is Manager review first, then Jay's final OK.

## What changed
- **Fixed in source, not by a pixel colour swap.**
  - In `icons/source/build_icons.py`, the jade-charm icon now calls `cord(..., col="#edbd41")` and `tassel(..., col="#edbd41")`.
  - The shared `cord()` and `tassel()` defaults are unchanged, so no other icon is affected.
  - The note text now says "gold cord".
- **Gold `#edbd41`** is exactly what PR #212's hue shift turns the old cord red `#d8352a` into, so the two PRs match.
- **Re-rendered with the normal Batch 8 pipeline** (build_icons, then render_static, then finalize) and copied in only `icons/sprites/icon-jade-charm.png`, 128x128.
  - Reproducibility check: the same re-render of the unchanged lotus charm matches the committed file bit for bit.
  - The jade icon differs only inside the cord and tassel area. No red pixels are left.
- **Other sizes and variants:** there is only one jade-charm file (128x128). `static.json` needs no change.
  - Three existing preview sheets were regenerated with `make_icon_preview.py`: `icons/preview/sheet-gear-1x.png`, `sheet-gear-2x.png` and `phone-mock.png`. Only the jade cell changes.
  - `apps/client/src/art/icons.ts` draws its own in-game version of this icon. I didn't touch it, because game code is out of bounds. If the game draws its own red cord, the Programmer needs to change that too.

## Previews
- `jade-charm-gold/preview/before_after.png`: before and after at 256 px, 64 pt and 48 pt.
- `jade-charm-gold/preview/before_after_grey.png`: the same in greyscale.

## Second pass
- At 64 pt and 48 pt the gold cord still separates clearly from the green disc and the dark menu, including in greyscale.
- **Known:** the tassel band is already a light gold (`#ffd36b`), so on a gold tassel it now shows only faintly.

## DECIDE
1. Should the tassel band become cream (`#f4efe4`) so it shows again? It's a one-line change.
2. The Lotus Charm (red cord) and Crane Charm (red-pink paper) icons in Batch 8 also use red. Should they get the same gold fix?
