# Delivery Note - charm icons: red taken out (Jade, Lotus, Crane)

Held for Jay's OK. Please don't import yet. The order is Manager review first, then Jay's final OK.

## What changed (all in `icons/source/build_icons.py`, then re-rendered)
- **Jade Charm:**
  - cord and tassel are now gold `#edbd41`, the same gold as PR #212;
  - the tassel band is now cream `#f4efe4`, so it shows on the gold tassel.
- **Lotus Charm:** the cord is now gold `#edbd41`. Gold reads best against the pink petals, and coral would blur into them.
- **Crane Charm:** the red-pink paper is now peach.
  - Paper `#ffbe8c`, back wing and head `#f5a46e`, front wing `#ffcfa6`, folds `#cf8750`.
  - I chose peach because the crane still reads as folded paper and stays clearly apart from its gold cord. A gold crane would merge with the cord.
- **Shared defaults are unchanged.** `tassel()` gained a `band` argument whose default is the old `#ffd36b`. `cord()` and `tassel()` keep their default colours, and only these three icons pass new colours. The note text now says "gold cord" and "peach paper crane".

## Checks
- **Rendered** with the normal Batch 8 pipeline (build_icons, then render_static) and copied in only the three charm PNGs (128x128).
- **No red left:** a script counts pixels with hue under 22° or over 335°, saturation above 0.45 and visible alpha. All three charms show 0.
- **Other icons unchanged:**
  - The other 6 gear icons and all 10 Seals re-render bit for bit identical to the committed files, so nothing else was touched.
  - The 9 Insight icons look different in a raw re-render. That is expected: their committed versions come from the separate `make_insights_v2.py` override. They were not copied or changed.
- **Previews regenerated:** `icons/preview/sheet-gear-1x.png`, `sheet-gear-2x.png` and `phone-mock.png`. Only the three charm cells change.
- **Other sizes and variants:** each charm has one file only, and `static.json` needs no change.
- `apps/client/src/art/icons.ts` (game code) was not touched. If the game draws its own versions, the Programmer needs to update them too.

## Previews
- `jade-charm-gold/preview/before_after.png`: all three charms, before and after, at 192 px, 64 pt and 48 pt.
- `jade-charm-gold/preview/before_after_grey.png`: the same in greyscale. All three still read clearly, and the cream band shows on the jade tassel.
