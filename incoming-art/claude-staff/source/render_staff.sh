#!/bin/bash
# Builds and renders the Action Zone staff NPCs (Jay, Hannah, Michael) from the hero v2 model.
# Usage (repository root): bash incoming-art/claude-staff/source/render_staff.sh
set -e
B="/c/Program Files/Blender Foundation/Blender 5.3/blender.exe"
D=incoming-art/claude-staff/source
W=$(cygpath -w "$PWD")
for spec in jay:a hannah:b michael:a; do
  WHO=${spec%:*}; BODY=${spec#*:}
  "$B" -b incoming-art/claude-hero-v2/source/player_hero2_$BODY.blend -P $D/build_staff.py -- --who $WHO --save "$W/$D/staff_$WHO.blend"
  "$B" -b $D/staff_$WHO.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-staff/sprites/$WHO" --name staff-$WHO \
    --height 192 --anchor-y 0.88 --anims npc_idle,npc_wave,bow
  # a large still facing the camera, for the shop counter and talk cards
  "$B" -b $D/staff_$WHO.blend -P incoming-art/tools/render_sprites.py -- --out "$W/incoming-art/claude-staff/portraits/$WHO" --name staff-$WHO \
    --size 512 --height 768 --anchor-y 0.88 --anims npc_idle --directions S --keep-frames
done
echo STAFF_RENDERED
