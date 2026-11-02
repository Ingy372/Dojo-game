#!/usr/bin/env bash
# Rebuild the town-growth sample stages from the repo root (needs Blender 4.2 + Pillow + numpy + scipy). At most 2 Blender processes run at once.
#   bash incoming-art/town-growth/source/render_all.sh [passes-dir]
set -e
TMP=${1:-/tmp/town-growth-passes}; mkdir -p "$TMP"
G=incoming-art/town-growth/source
# Blender passes per stage: day, night (dusk town), lights (lit things), props (what this stage added; lanes check),
# shade (sun + sky clay render: cast shadows), height (16-bit surface height: rim line), hero (bloom mask), treesil (Blue only: the ORIGINAL round-tree silhouette, for the lanes check)
for st in white green blue; do for ps in day night lights props shade height hero $([ $st = blue ] && echo treesil); do echo "$st $ps"; done; done |
  xargs -P2 -L1 sh -c 'blender -b -P '$G'/build_town_stage.py -- --stage $0 --pass $1 --out '"$TMP"'/$0-$1.png | grep -E "rendered|Error" || true'
python3 $G/make_stages.py "$TMP"
python3 $G/make_sheet.py
