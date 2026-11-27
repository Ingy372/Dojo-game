#!/bin/bash
# Builds the v3 sample from the v2 copy and renders the run (E, SE) at 2x. Usage: bash run_sample.sh [hero_v3.py args]
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
D=incoming-art/claude-hero-v3
W=$(cygpath -w "$PWD")
"$B" -b $D/source/hero3_base_a.blend -P $D/source/hero_v3.py -- --save "$W\incoming-art\claude-hero-v3\source\hero3_sample_a.blend" "$@" | grep -E "HERO_V3|Error" || true
"$B" -b $D/source/hero3_sample_a.blend -P incoming-art/tools/render_sprites.py -- --out "$W\incoming-art\claude-hero-v3\sample\new-2x" --name player-a --size 256 --height 320 --anchor-y 0.856 --anims walk --directions E,SE --layers body,skin,gi,belt,face-01,hair-01 > /dev/null
python $D/source/make_compare.py
# Nov 27 round 2 (Jay: old arms better, new lean looked like a bird; wants a natural athletic jog). Settings used:
#   bash run_sample.sh --lean -0.2 --head-keep 1.0 --head-bob 0.05 --arms 0.85 --hand-out 0.05 --twist 1.2 --bob 2.0
