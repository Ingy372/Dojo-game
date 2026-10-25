# Delivery Note: bestiary set 1 (Lantern Moth, Buzzy Bee, Thorn Sprout)

Delivered: sheets, blends, build script, contact sheets, GIFs and a line-up with all 6 bestiary enemies (plus the
player and Tier 1). Built exactly like #207 v2. Only `incoming-art/bestiary-set1/` is touched; no game code. The rest
of the plan is not started; it waits for this set to be approved.

Second pass: checked every contact sheet in 8 directions; lowered the sprout leaves and bee/moth wings so nothing goes
above the head, swept the moth wings and sprout leaves back a little so the side views are not paper-thin, and gave the
bee a dark face patch (its first pass read like a muzzle). Red-pixel check on all body and glow sheets: 0 in moth and sprout; 10 anti-aliased tan edge pixels on the bee (rgb ~180,125,98, honey shading, not visible as red). Red only in the telegraph layer.

## v2 (Manager review)
- Buzzy Bee friendlier: rounder, bigger eyes; the antennae moved back on the head so they no longer read as frowning
  brows over the face; stripes set further back; face patch rounder. Still a little spooky (glowing eyes on a dark patch).
- Bee art id renamed `bee` -> `buzz-bee` (folder, sprite names, `--enemy`), matching `buzz-bee.json`.
- Second pass (v2): checked the bee contact sheets in 8 directions; no brows from any angle, wings stay below the head; red check unchanged (only tan anti-aliased edge pixels, none visible).
- Re-rendered the bee sheets, contact sheets, GIFs and `preview/lineup.png`. Moth and sprout unchanged.

## DECIDE
1. Working looks and colours: moth navy + lilac, bee honey + sky-blue rim, sprout deep green + lime. OK, or other colours? (open, for Jay)
2. DECIDED (Manager): the bee art id is `buzz-bee`, the same as the data file.
3. DECIDED (Manager): soft round nubs on the sprout, no points. No flower on defeat for now (shared defeat, bud stays closed).
4. DECIDED (Manager): no stinger on the bee.
5. DECIDED (Manager): the flyers (moth, bee) keep hovering a little above the ground line.
