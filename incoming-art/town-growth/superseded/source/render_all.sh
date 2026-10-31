#!/usr/bin/env bash
# Rebuild everything in incoming-art/town-growth from the repo root (needs Blender 4.2 + Pillow). At most 2 Blender processes run at once.
set -e
TMP=${1:-/tmp/town-growth-passes}; mkdir -p "$TMP"
S=incoming-art/town-square-concept/source/build_town_square.py; G=incoming-art/town-growth/superseded/source
# 1) the town base without the old dojo (only its silhouette and its lights are needed, to hold overlays out of the town's geometry)
blender -b -P $S -- --out "$TMP/base_town@2x.png" --no-dojo0 --clear-dojo-trees --part town &
blender -b -P $S -- --out "$TMP/base_lights@2x.png" --no-dojo0 --clear-dojo-trees --part lights --night &
wait
# 2) every belt's add-on objects, day and dusk (colour pass + emissive mask)
for id in white yellow orange green blue red redblack brown brownblack; do echo "$id"; echo "$id --night"; done |
  xargs -P2 -L1 sh -c 'blender -b -P '$G'/build_town_growth.py -- --id $0 $1 --out '"$TMP"' | grep -E "rendered|Error"'
git checkout -- '*.blend' 2>/dev/null || true; find incoming-art -name '*.blend1' -delete
# 3) grade, glow, 2D layers, overlays + previews
python3 $G/make_growth.py --passes "$TMP" --base-town "$TMP/base_town@2x.png" --base-lights "$TMP/base_lights@2x.png"
