#!/bin/bash
# A4-DOJO game batch: renders every layer group alone (Blender, one process at a time), then slices/crops them into ../sprites and ../previews.
# Needs the 3 samples' textures first (render_all.sh runs make_textures.py). Day/dusk/slot are separate scenes of the outside file.
cd "$(dirname "$0")"
S=${1:-24}; W=${GAMEWORK:-/tmp/dojo-gamework}; mkdir -p "$W"
B="blender -b -P build_action_zone_dojo.py --"
$B --scene inside  --samples $S --game $W/inside                            | grep -E "Error|Traceback"
$B --scene outside --samples $S --game $W/out-day                           | grep -E "Error|Traceback"
$B --scene outside --samples $S --game $W/out-dusk --dusk                   | grep -E "Error|Traceback"
$B --scene outside --samples $S --game $W/slot-day  --slot --ppt 44 --ow-mult 1.818         | grep -E "Error|Traceback"
$B --scene outside --samples $S --game $W/slot-dusk --slot --dusk --ppt 44 --ow-mult 1.818  | grep -E "Error|Traceback"
python3 make_game_inside.py  $W/inside
python3 make_game_outside.py $W      # reads $W/{out-day,out-dusk,slot-day,slot-dusk}
# optional: the town-slot preview (town square rendered without its old placeholder dojo; see ../README.md "Rebuild")
