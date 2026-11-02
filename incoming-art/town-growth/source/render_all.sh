#!/usr/bin/env bash
# Rebuild the town-growth sample stages from the repo root (needs Blender 4.2 + Pillow + numpy + scipy). At most 2 Blender processes run at once.
#   bash incoming-art/town-growth/source/render_all.sh [passes-dir]
set -e
TMP=${1:-/tmp/town-growth-passes}; mkdir -p "$TMP"
G=incoming-art/town-growth/source
# Blender passes per stage: day, night (dusk town), lights (lit things), props (what this stage added; lanes check),
# shade (sun + sky clay render: cast shadows), height (16-bit surface height: rim line), hero (bloom mask), trees + bloom (Blue only: the sakura masks - lane check, ground shadows, rim light, dusk rose grade)
for st in white yellow orange green blue; do for ps in day night lights props shade height hero $([ $st = blue ] && echo trees bloom); do echo "$st $ps"; done; done |
  xargs -P2 -L1 sh -c 'blender -b -P '$G'/build_town_stage.py -- --stage $0 --pass $1 --out '"$TMP"'/$0-$1.png | grep -E "rendered|Error" || true'
python3 $G/check_lanes.py "$TMP"
python3 $G/make_stages.py "$TMP"
python3 $G/make_sheet.py
