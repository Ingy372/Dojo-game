#!/usr/bin/env bash
# Rebuild the town-growth sample stages from the repo root (needs Blender 4.2 + Pillow). At most 2 Blender processes run at once.
#   bash incoming-art/town-growth/source/render_all.sh [passes-dir]
set -e
TMP=${1:-/tmp/town-growth-passes}; mkdir -p "$TMP"
G=incoming-art/town-growth/source
# Blender passes per stage: day, night (dusk town), lights (mask of lit windows and lanterns), props (mask of what this stage added; lanes check)
for st in white orange blue; do for ps in day night lights props; do echo "$st $ps"; done; done |
  xargs -P2 -L1 sh -c 'blender -b -P '$G'/build_town_stage.py -- --stage $0 --pass $1 --out '"$TMP"'/$0-$1.png | grep -E "rendered|Error"'
# Pillow: sky, far hills, dusk grade, effects, dojo sprite -> stages/*.png + stages.json, then the side-by-side sheet
python3 $G/make_stages.py "$TMP"
python3 $G/make_sheet.py
